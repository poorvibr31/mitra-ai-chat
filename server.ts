import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { PERSONALITIES, getPersonality } from './src/personalities.ts';
import {
  registerUser,
  authenticateUser,
  getUserByToken,
  destroySession,
} from './src/server/authStore.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize GoogleGenAI SDK helper on server side
function getAiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasKey: !!process.env.GEMINI_API_KEY,
    timestamp: Date.now(),
  });
});

// Personalities list
app.get('/api/personalities', (req: Request, res: Response) => {
  res.json({
    personalities: PERSONALITIES,
  });
});

// Authentication endpoints
app.post('/api/auth/signup', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = registerUser(email, password);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = authenticateUser(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Authentication failed' });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }
    const token = authHeader.slice(7).trim();
    const user = getUserByToken(token);
    if (!user) {
      res.status(401).json({ error: 'Invalid or expired session' });
      return;
    }
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to authenticate user' });
  }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      destroySession(token);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to logout' });
  }
});

interface IncomingMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface FormattedContent {
  role: 'user' | 'model';
  parts: { text: string }[];
}

function cleanErrorMessage(err: unknown): string {
  if (!err) return 'An unknown error occurred.';
  let msg = err instanceof Error ? err.message : String(err);
  try {
    const parsed = JSON.parse(msg);
    if (parsed.error && typeof parsed.error === 'object') {
      if (typeof parsed.error.message === 'string') {
        try {
          const inner = JSON.parse(parsed.error.message);
          if (inner.error && inner.error.message) {
            return inner.error.message;
          }
        } catch {
          return parsed.error.message;
        }
      }
    }
  } catch {
    // Not JSON, use raw msg
  }
  return msg;
}

function formatConversation(messages: IncomingMessage[]): FormattedContent[] {
  const result: FormattedContent[] = [];

  for (const m of messages) {
    if (!m.content || !m.content.trim()) continue;
    const role: 'user' | 'model' = m.role === 'assistant' ? 'model' : 'user';

    // In Gemini API, multi-turn conversation contents must start with a user turn.
    // Skip any leading assistant/model greeting (the persona greeting).
    if (result.length === 0 && role === 'model') {
      continue;
    }

    const last = result[result.length - 1];
    if (last && last.role === role) {
      // Merge adjacent turns of the same role
      last.parts.push({ text: m.content });
    } else {
      result.push({
        role,
        parts: [{ text: m.content }],
      });
    }
  }

  return result;
}

// Streaming chat endpoint
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  const { messages, personalityId, customInstructions } = req.body as {
    messages?: IncomingMessage[];
    personalityId?: string;
    customInstructions?: string;
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required.' });
    return;
  }

  const activePersona = getPersonality(personalityId || 'casual');
  let systemPrompt = activePersona.systemPrompt;
  if (customInstructions && customInstructions.trim()) {
    systemPrompt += `\nAdditional instructions from user: ${customInstructions.trim()}`;
  }

  // Ensure SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let isClientClosed = false;
  res.on('close', () => {
    if (!res.writableEnded) {
      isClientClosed = true;
    }
  });

  const ai = getAiClient();
  if (!ai || !process.env.GEMINI_API_KEY) {
    const errorMsg = 'Gemini API key is not configured on the server. Please check the Secrets settings.';
    res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  let formattedContents = formatConversation(messages);

  if (formattedContents.length === 0) {
    const lastUserMessage = [...messages].reverse().find((m) => m.content && m.content.trim().length > 0);
    if (lastUserMessage) {
      formattedContents = [{ role: 'user', parts: [{ text: lastUserMessage.content }] }];
    } else {
      res.write(`data: ${JSON.stringify({ error: 'No valid message content provided.' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }
  }

  const temperature = activePersona.id === 'tech' ? 0.2 : activePersona.id === 'storyteller' ? 0.9 : 0.7;

  // Candidate models conforming to gemini-api skill:
  // Ultra-fast 'gemini-3.1-flash-lite' for instantaneous quick responses, falling back to 'gemini-3.8-flash', then 'gemini-flash-latest'
  const candidateModels = [
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ];

  let streamCompleted = false;
  let totalChunksEmitted = 0;
  let lastError: unknown = null;

  for (const modelName of candidateModels) {
    if (streamCompleted || isClientClosed) break;

    try {
      const stream = await ai.models.generateContentStream({
        model: modelName,
        contents: formattedContents,
        config: {
          systemInstruction: systemPrompt,
          temperature,
        },
      });

      for await (const chunk of stream) {
        if (isClientClosed) break;
        const chunkText = chunk.text;
        if (chunkText) {
          res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
          totalChunksEmitted++;
        }
      }

      if (totalChunksEmitted > 0) {
        streamCompleted = true;
        break;
      }
    } catch (err: unknown) {
      lastError = err;
      console.warn(`Model ${modelName} stream error:`, cleanErrorMessage(err));

      // If chunks were already written to client, do not restart mid-stream
      if (totalChunksEmitted > 0) {
        break;
      }
    }
  }

  if (!streamCompleted && totalChunksEmitted === 0 && !isClientClosed) {
    const friendlyError = cleanErrorMessage(lastError);
    res.write(`data: ${JSON.stringify({ error: friendlyError })}\n\n`);
  }

  if (!isClientClosed && !res.writableEnded) {
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Setup Vite in development or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mitra.AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

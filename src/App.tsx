/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { Header } from './components/Header';
import { PersonalitySelector } from './components/PersonalitySelector';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInput } from './components/ChatInput';
import { EmptyState } from './components/EmptyState';
import { PersonalityModal } from './components/PersonalityModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { PERSONALITIES, getPersonality } from './personalities';
import { ChatMessage, Personality, PersonalityId, UserProfile, Theme } from './types';

const STORAGE_KEY_THEME = 'aura_theme_v1';
const STORAGE_KEY_AUTH_TOKEN = 'aura_auth_token_v1';
const STORAGE_KEY_MESSAGES = 'aura_chat_messages_v1';
const STORAGE_KEY_PERSONA = 'aura_chat_persona_v1';
const STORAGE_KEY_CUSTOM_INSTR = 'aura_chat_custom_instr_v1';

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved === 'light' || saved === 'dark') return saved;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [personality, setPersonality] = useState<Personality>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PERSONA);
    return saved ? getPersonality(saved) : PERSONALITIES[0];
  });

  const [customInstructions, setCustomInstructions] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_CUSTOM_INSTR) || '';
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initialPersona = getPersonality(
      localStorage.getItem(STORAGE_KEY_PERSONA) || 'casual'
    );
    const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (saved) {
      try {
        const parsed: ChatMessage[] = JSON.parse(saved);
        if (
          parsed.length === 1 &&
          parsed[0].id?.startsWith('welcome-') &&
          !parsed[0].content.includes('Mitra.AI')
        ) {
          return [
            {
              id: 'welcome-0',
              role: 'assistant',
              content: initialPersona.welcomeMessage,
              timestamp: Date.now(),
              personalityId: initialPersona.id,
            },
          ];
        }
        return parsed;
      } catch {
        return [];
      }
    }
    // Default initial greeting from the active personality
    return [
      {
        id: 'welcome-0',
        role: 'assistant',
        content: initialPersona.welcomeMessage,
        timestamp: Date.now(),
        personalityId: initialPersona.id,
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check existing auth session on mount
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY_AUTH_TOKEN);
    if (!token) return;

    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Session expired');
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // Token expired or invalid
        localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
        setUser(null);
      });
  }, []);

  // Handle successful login or signup
  const handleAuthSuccess = (authenticatedUser: UserProfile, token: string) => {
    localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token);
    setUser(authenticatedUser);
  };

  // Handle logout
  const handleLogout = () => {
    const token = localStorage.getItem(STORAGE_KEY_AUTH_TOKEN);
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(console.error);
    }
    localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
    setUser(null);
  };

  // Sync theme to document element class and localStorage
  useEffect(() => {
    document.title = 'Remix Mitra.AI Chat';
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  // Sync personality to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PERSONA, personality.id);
  }, [personality]);

  // Sync custom instructions to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSTOM_INSTR, customInstructions);
  }, [customInstructions]);

  // Sync messages to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
  }, [messages]);

  // Scroll detection to show/hide "Scroll to bottom" button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceFromBottom > 160);
  };

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  // Auto-scroll on new messages if near bottom
  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom();
    }
  }, [messages, showScrollBottom]);

  // Handle switching personality
  const handleSelectPersonality = (newPersona: Personality) => {
    if (newPersona.id === personality.id) {
      setIsModalOpen(false);
      return;
    }

    setPersonality(newPersona);
    setIsModalOpen(false);

    // If chat is empty or only has the initial welcome message, swap to new persona's welcome message
    if (
      messages.length === 0 ||
      (messages.length === 1 && messages[0]?.role === 'assistant')
    ) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: newPersona.welcomeMessage,
          timestamp: Date.now(),
          personalityId: newPersona.id,
        },
      ]);
    }
  };

  // Start new chat with active persona's welcome message
  const handleNewChat = () => {
    if (isStreaming) {
      handleStop();
    }
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: personality.welcomeMessage,
        timestamp: Date.now(),
        personalityId: personality.id,
      },
    ]);
    setInput('');
  };

  // Clear all messages completely
  const handleClearChat = () => {
    if (isStreaming) {
      handleStop();
    }
    setMessages([]);
  };

  // Export conversation as Markdown file
  const handleExportChat = () => {
    if (messages.length === 0) return;

    let md = `# Conversation with ${personality.name} (${personality.badge})\n`;
    md += `*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;

    messages.forEach((m) => {
      const sender = m.role === 'user' ? 'You' : personality.name;
      const time = new Date(m.timestamp).toLocaleTimeString();
      md += `### ${sender} (${time})\n\n${m.content}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mitra-chat-${personality.id}-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Stop current streaming generation
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((msg) => (msg.isStreaming ? { ...msg, isStreaming: false } : msg))
    );
  };

  // Core stream runner for handling LLM response
  const streamConversation = async (
    conversationList: ChatMessage[],
    assistantId: string
  ) => {
    setIsStreaming(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Build conversation payload for server API (exclude placeholder assistant message)
      const conversationPayload = conversationList
        .filter((m) => m.id !== assistantId && m.content.trim().length > 0)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationPayload,
          personalityId: personality.id,
          customInstructions: customInstructions.trim() || undefined,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Readable stream not supported in this browser environment.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedContent = '';
      let isDone = false;

      while (!isDone) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const dataContent = trimmed.slice(5).trim();
          if (dataContent === '[DONE]') {
            isDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(dataContent);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              accumulatedContent += parsed.text;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, content: accumulatedContent }
                    : msg
                )
              );
            }
          } catch (e: any) {
            if (e.message && e.message !== dataContent) {
              throw e;
            }
          }
        }
      }

      // Generation finished successfully
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: accumulatedContent, isStreaming: false, error: false }
            : msg
        )
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }

      console.error('Chat generation error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Unable to connect to assistant. Please try again.';

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content: errorMessage,
                error: true,
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Send message
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isStreaming) return;

    setInput('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    const assistantPlaceholderId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      personalityId: personality.id,
      isStreaming: true,
    };

    const updatedMessages = [...messages, userMessage, assistantMessage];
    setMessages(updatedMessages);

    await streamConversation(updatedMessages, assistantPlaceholderId);
  };

  // Regenerate last assistant response without duplicating user message
  const handleRegenerate = async () => {
    if (isStreaming || messages.length === 0) return;

    // Find the last assistant message
    const lastMsgIndex = messages.length - 1;
    const lastMsg = messages[lastMsgIndex];
    if (lastMsg.role !== 'assistant') return;

    // Prune the failed or old assistant message
    const conversationSoFar = messages.slice(0, lastMsgIndex);
    if (conversationSoFar.length === 0) return;

    const assistantPlaceholderId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      personalityId: personality.id,
      isStreaming: true,
    };

    const updatedMessages = [...conversationSoFar, assistantMessage];
    setMessages(updatedMessages);

    await streamConversation(updatedMessages, assistantPlaceholderId);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Top Application Header */}
      <Header
        personality={personality}
        onOpenPersonalityModal={() => setIsModalOpen(true)}
        onNewChat={handleNewChat}
        onExportChat={handleExportChat}
        onClearChat={handleClearChat}
        messageCount={messages.length}
        isStreaming={isStreaming}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        theme={theme}
        onToggleTheme={setTheme}
      />

      {/* Personality Switcher Bar */}
      <PersonalitySelector
        currentPersonality={personality}
        onSelectPersonality={handleSelectPersonality}
        disabled={isStreaming}
      />

      {/* Main Message Stream Container */}
      <main
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
      >
        <div className="mx-auto flex min-h-full max-w-4xl flex-col justify-start py-4">
          {messages.length === 0 ? (
            <EmptyState
              personality={personality}
              onSelectStarter={(prompt) => handleSendMessage(prompt)}
              onOpenPersonalityModal={() => setIsModalOpen(true)}
            />
          ) : (
            <div className="flex flex-col divide-y divide-slate-200/80 dark:divide-slate-800/40">
              {messages.map((message, index) => {
                const messagePersona =
                  message.personalityId
                    ? getPersonality(message.personalityId)
                    : personality;

                const isLastAssistant =
                  index === messages.length - 1 && message.role === 'assistant';

                return (
                  <ChatMessageItem
                    key={message.id}
                    message={message}
                    personality={messagePersona}
                    isLastAssistant={isLastAssistant}
                    onRegenerate={handleRegenerate}
                    onQuickReply={(prompt) => handleSendMessage(prompt)}
                  />
                );
              })}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Floating Scroll to Bottom Button */}
        {showScrollBottom && (
          <button
            onClick={() => scrollToBottom(true)}
            className="fixed bottom-24 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-xl backdrop-blur-md transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Scroll to latest messages"
          >
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </button>
        )}
      </main>

      {/* Bottom Input Area */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSend={handleSendMessage}
        onStop={handleStop}
        isStreaming={isStreaming}
        personality={personality}
      />

      {/* Personality Settings & Details Modal */}
      <PersonalityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentPersonality={personality}
        onSelectPersonality={handleSelectPersonality}
        customInstructions={customInstructions}
        setCustomInstructions={setCustomInstructions}
      />

      {/* User Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* User Profile Management Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onLogout={handleLogout}
        messageCount={messages.length}
        theme={theme}
        onToggleTheme={setTheme}
      />
    </div>
  );
}

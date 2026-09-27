import React, { useRef, useEffect, useState } from 'react';
import { Send, Square, Mic, MicOff, Sparkles, CornerDownLeft, Zap } from 'lucide-react';
import { Personality } from '../types';

interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onSend: (text?: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  personality: Personality;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  onStop,
  isStreaming,
  personality,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  // Focus textarea when streaming stops
  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  // Speech-to-text integration if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, [setInput]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && input.trim()) {
        onSend();
      }
    }
  };

  const quickRepliesList = personality.quickReplies && personality.quickReplies.length > 0
    ? personality.quickReplies
    : [
        'Tell me more about that 😊',
        'Can you give me an example?',
        'Summarize the key points',
        'What are the next steps?',
      ];

  return (
    <div className="w-full bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-slate-950 dark:via-slate-950 dark:to-transparent pt-3 pb-4 px-4 sm:px-6 transition-colors">
      <div className="mx-auto max-w-4xl space-y-2">
        {/* Quick helper pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shrink-0">
            <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span>Quick replies:</span>
          </span>
          {quickRepliesList.map((replyPrompt, idx) => (
            <button
              key={idx}
              onClick={() => onSend(replyPrompt)}
              disabled={isStreaming}
              className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs text-slate-700 shadow-xs transition-all hover:border-indigo-400 hover:bg-indigo-50/70 hover:text-indigo-600 dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-300 dark:hover:border-indigo-500/60 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 disabled:opacity-40 shrink-0 cursor-pointer active:scale-95"
            >
              {replyPrompt}
            </button>
          ))}
        </div>

        {/* Elevated input container */}
        <div className="relative flex flex-col rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-xl dark:shadow-slate-950/60 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 backdrop-blur-md">
          {/* Main Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${personality.name} (${personality.badge})...`}
            className="w-full bg-transparent px-4 pt-3.5 pb-2 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none leading-relaxed min-h-[48px]"
          />

          {/* Action footer inside input box */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 hidden sm:flex">
                <CornerDownLeft className="h-3 w-3" />
                <span>Enter to send • Shift+Enter for new line</span>
              </span>

              {recognitionRef.current && (
                <button
                  onClick={toggleListening}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors ${
                    isListening
                      ? 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400 animate-pulse border border-red-200 dark:border-red-500/40'
                      : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                  title={isListening ? 'Stop listening' : 'Voice typing'}
                >
                  {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {input.length > 0 && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  {input.length} chars
                </span>
              )}

              {isStreaming ? (
                <button
                  onClick={onStop}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-red-500 transition-colors"
                  title="Stop generation"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  onClick={() => onSend()}
                  disabled={!input.trim()}
                  className="flex h-8 w-8 sm:w-auto sm:px-3.5 sm:gap-1.5 items-center justify-center rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-md shadow-indigo-950/20 dark:shadow-indigo-950/40 transition-all hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed hover:disabled:bg-indigo-600"
                  title="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Powered by Gemini • Responses reflect active persona instructions.
          </p>
        </div>
      </div>
    </div>
  );
};

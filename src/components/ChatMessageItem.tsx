import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Volume2, VolumeX, RotateCcw, AlertTriangle, User, Zap, ArrowRight } from 'lucide-react';
import { ChatMessage, Personality } from '../types';
import { CodeBlock } from './CodeBlock';

interface ChatMessageItemProps {
  message: ChatMessage;
  personality: Personality;
  isLastAssistant: boolean;
  onRegenerate?: () => void;
  onQuickReply?: (prompt: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  personality,
  isLastAssistant,
  onRegenerate,
  onQuickReply,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = message.content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const formatTime = (timestamp: number) => {
    return new Intl.DateTimeFormat([], {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  // Color borders / badge styling based on personality theme
  const getThemeBadgeStyles = () => {
    switch (personality.themeColor) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30';
      case 'cyan':
        return 'bg-cyan-50 text-cyan-700 border-cyan-300 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30';
      case 'blue':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30';
    }
  };

  if (isUser) {
    return (
      <div className="group flex justify-end gap-3 px-4 py-3 sm:px-6">
        <div className="flex max-w-[85%] flex-col items-end sm:max-w-[75%]">
          <div className="flex items-center gap-2 mb-1 text-xs text-slate-500 dark:text-slate-400">
            <span>You</span>
            <span>•</span>
            <span>{formatTime(message.timestamp)}</span>
          </div>

          <div className="relative rounded-2xl rounded-tr-sm bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 text-white shadow-md shadow-indigo-950/20 dark:shadow-indigo-950/40">
            <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed break-words">
              {message.content}
            </p>
          </div>

          <div className="mt-1 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              title="Copy message"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 border border-slate-300 text-indigo-700 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-indigo-300">
          <User className="h-4 w-4" />
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="group flex justify-start gap-3.5 px-4 py-4 sm:px-6 transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-900/30">
      {/* Persona Avatar */}
      <div className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm text-xl dark:bg-slate-900 dark:border-slate-800">
        {personality.avatar}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Persona header line */}
        <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs">
          <span className="font-semibold text-slate-900 dark:text-slate-200">{personality.name}</span>
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getThemeBadgeStyles()}`}>
            {personality.badge}
          </span>
          <span className="text-slate-400 dark:text-slate-500">•</span>
          <span className="text-slate-500 dark:text-slate-400">{formatTime(message.timestamp)}</span>
        </div>

        {/* Message body */}
        <div className="prose max-w-none text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 break-words">
          {message.error ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-800 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-900 dark:text-red-300">Message generation error</p>
                <p className="text-xs text-red-700 dark:text-red-400/90 mt-0.5">{message.content}</p>
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-200 dark:hover:bg-red-500/30 px-3 py-1 text-xs font-medium transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Try again</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && !String(children).includes('\n');
                    if (isInline) {
                      return (
                        <code
                          className="rounded bg-slate-100 text-indigo-700 border border-slate-200 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800/80 dark:text-indigo-300 dark:border-slate-700/50"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <CodeBlock
                        language={match ? match[1] : undefined}
                        value={String(children).replace(/\n$/, '')}
                      />
                    );
                  },
                  p({ children }) {
                    return <p className="mb-3 last:mb-0 leading-relaxed text-slate-800 dark:text-slate-200">{children}</p>;
                  },
                  ul({ children }) {
                    return <ul className="mb-3 list-disc pl-5 space-y-1 text-slate-800 dark:text-slate-200">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="mb-3 list-decimal pl-5 space-y-1 text-slate-800 dark:text-slate-200">{children}</ol>;
                  },
                  li({ children }) {
                    return <li className="leading-relaxed">{children}</li>;
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="my-2 border-l-4 border-indigo-500 bg-indigo-50/50 text-slate-700 py-1 pl-4 pr-2 italic rounded-r-lg dark:border-indigo-500/60 dark:bg-slate-900/40 dark:text-slate-300">
                        {children}
                      </blockquote>
                    );
                  },
                  h1({ children }) {
                    return <h1 className="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2">{children}</h1>;
                  },
                  h2({ children }) {
                    return <h2 className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-2">{children}</h2>;
                  },
                  h3({ children }) {
                    return <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-2 mb-1">{children}</h3>;
                  },
                  table({ children }) {
                    return (
                      <div className="my-3 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700/60">
                        <table className="w-full text-left text-xs sm:text-sm">{children}</table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return <th className="border-b border-slate-200 bg-slate-100 px-3 py-2 font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">{children}</th>;
                  },
                  td({ children }) {
                    return <td className="border-b border-slate-200/80 px-3 py-2 text-slate-700 dark:border-slate-800/60 dark:text-slate-300">{children}</td>;
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>

              {message.isStreaming && (
                <span className="inline-block h-4 w-2 ml-1 translate-y-0.5 bg-indigo-600 dark:bg-indigo-400 animate-pulse rounded-sm" />
              )}
            </div>
          )}
        </div>

        {/* Action bar under assistant message */}
        {!message.error && !message.isStreaming && message.content.length > 0 && (
          <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Copy response"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {'speechSynthesis' in window && (
              <button
                onClick={handleToggleSpeak}
                className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  speaking ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title={speaking ? 'Stop speaking' : 'Read aloud'}
              >
                {speaking ? <VolumeX className="h-3.5 w-3.5 animate-pulse" /> : <Volume2 className="h-3.5 w-3.5" />}
                <span>{speaking ? 'Stop' : 'Read'}</span>
              </button>
            )}

            {isLastAssistant && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                title="Regenerate this response"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Regenerate</span>
              </button>
            )}
          </div>
        )}

        {/* Quick replies for the latest completed assistant response */}
        {isLastAssistant && !message.isStreaming && !message.error && onQuickReply && personality.quickReplies && personality.quickReplies.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-slate-200/70 dark:border-slate-800/70">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
              <span>Quick replies:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {personality.quickReplies.map((replyText, idx) => (
                <button
                  key={idx}
                  onClick={() => onQuickReply(replyText)}
                  className="group/btn inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs text-slate-700 shadow-xs transition-all hover:border-indigo-400 hover:bg-indigo-50/70 hover:text-indigo-600 dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:border-indigo-500/70 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 cursor-pointer active:scale-95"
                >
                  <span>{replyText}</span>
                  <ArrowRight className="h-3 w-3 text-slate-400 opacity-60 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:opacity-100 group-hover/btn:text-indigo-500" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

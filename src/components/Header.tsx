import React from 'react';
import { Sparkles, PlusCircle, Download, Trash2, SlidersHorizontal, LogIn, Sun, Moon } from 'lucide-react';
import { Personality, UserProfile, Theme, getEmailInitials } from '../types';

interface HeaderProps {
  personality: Personality;
  onOpenPersonalityModal: () => void;
  onNewChat: () => void;
  onExportChat: () => void;
  onClearChat: () => void;
  messageCount: number;
  isStreaming: boolean;
  user: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
  theme: Theme;
  onToggleTheme: (newTheme: Theme) => void;
}

export const Header: React.FC<HeaderProps> = ({
  personality,
  onOpenPersonalityModal,
  onNewChat,
  onExportChat,
  onClearChat,
  messageCount,
  isStreaming,
  user,
  onOpenAuthModal,
  onOpenProfileModal,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 sm:px-6 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 transition-colors">
      {/* Brand & Active Persona Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-950/20 dark:shadow-indigo-950/50">
            <Sparkles className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white dark:border-slate-950"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Mitra<span className="text-indigo-600 dark:text-indigo-400">.AI</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none hidden sm:block">
              Multi-Persona Assistant
            </p>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* Persona quick switch badge button */}
        <button
          onClick={onOpenPersonalityModal}
          className="group flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/80 px-3 py-1 text-xs text-slate-700 transition-all duration-150 hover:border-indigo-500/40 hover:bg-slate-200/80 dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-indigo-500/50 dark:hover:bg-slate-800"
          title="Click to view and customize personalities"
        >
          <span className="text-sm select-none">{personality.avatar}</span>
          <span className="font-medium text-slate-800 group-hover:text-slate-950 dark:text-slate-200 dark:group-hover:text-white">
            {personality.name}
          </span>
          <SlidersHorizontal className="h-3 w-3 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          disabled={isStreaming}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
          title="Start fresh conversation"
        >
          <PlusCircle className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {messageCount > 0 && (
          <>
            <button
              onClick={onExportChat}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Export conversation (Markdown)"
            >
              <Download className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={onClearChat}
              disabled={isStreaming}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-600 transition-colors hover:bg-red-100 hover:border-red-200 hover:text-red-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:border-red-800/60 dark:hover:text-red-300 disabled:opacity-50"
              title="Clear all messages"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}

        {/* Theme Toggle Button in Header */}
        <button
          onClick={() => onToggleTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition-all hover:bg-slate-200 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-600 transition-transform duration-200 hover:-rotate-12" />
          )}
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* User Authentication & Profile Management */}
        {user ? (
          <button
            onClick={onOpenProfileModal}
            className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs text-slate-700 transition-all hover:border-indigo-400 hover:bg-slate-200 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500/60 dark:hover:bg-slate-800/90"
            title={`Logged in as ${user.email}`}
          >
            {/* Derived Initials Badge */}
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 font-mono text-[11px] font-bold text-white shadow-sm">
              {getEmailInitials(user.email)}
            </div>
            <span className="hidden md:inline-block max-w-[120px] truncate text-slate-700 dark:text-slate-300 font-medium">
              {user.email.split('@')[0]}
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};

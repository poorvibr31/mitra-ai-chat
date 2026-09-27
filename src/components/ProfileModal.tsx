import React from 'react';
import { X, LogOut, CheckCircle2, Calendar, Shield, Mail, Activity, Sun, Moon, Palette } from 'lucide-react';
import { UserProfile, Theme, getEmailInitials } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  messageCount: number;
  theme: Theme;
  onToggleTheme: (newTheme: Theme) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  messageCount,
  theme,
  onToggleTheme,
}) => {
  if (!isOpen || !user) return null;

  const initials = getEmailInitials(user.email);

  const formattedJoinedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(user.createdAt));

  const formattedLastActive = user.lastLoginAt
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(user.lastLoginAt))
    : 'Active now';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700/80 dark:bg-slate-900 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Account Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            {/* Derived Initials Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-xl font-bold tracking-wider text-white shadow-lg shadow-indigo-950/20 dark:shadow-indigo-950/60 border border-indigo-400/30">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                {/* Account Status Badge */}
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-semibold">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{user.status}</span>
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">• User ID</span>
              </div>

              {/* Actual Email Address */}
              <p className="text-sm font-semibold text-slate-900 dark:text-white break-all leading-snug">
                {user.email}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Initials: <span className="font-mono text-indigo-600 dark:text-indigo-300 font-semibold">{initials}</span>
              </p>
            </div>
          </div>

          {/* Account Details List */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/60 p-4 space-y-3.5 mb-5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                <span>Email Address</span>
              </div>
              <span className="font-medium text-slate-800 dark:text-slate-200 break-all max-w-[200px] text-right">
                {user.email}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Activity className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                <span>Account Status</span>
              </div>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {user.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                <span>Member Since</span>
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">{formattedJoinedDate}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Shield className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                <span>Last Session</span>
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">{formattedLastActive}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Conversation Messages</span>
              <span className="font-mono font-medium text-indigo-600 dark:text-indigo-300">{messageCount} stored</span>
            </div>
          </div>

          {/* Theme Preference Toggle Section in Profile Menu */}
          <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/60 p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <Palette className="h-3.5 w-3.5 text-indigo-500" />
                <span>Theme Appearance</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 capitalize">{theme} mode</span>
            </div>

            {/* Segmented Light / Dark Switch */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onToggleTheme('light')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  theme === 'light'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Sun className={`h-3.5 w-3.5 ${theme === 'light' ? 'text-amber-500' : ''}`} />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleTheme('dark')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Moon className={`h-3.5 w-3.5 ${theme === 'dark' ? 'text-indigo-400' : ''}`} />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Log Out Button */}
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-950/20 dark:text-red-300 dark:hover:bg-red-950/40 px-4 py-2.5 text-xs font-semibold transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

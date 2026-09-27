import React from 'react';
import { Sparkles, MessageSquare, ArrowRight } from 'lucide-react';
import { Personality } from '../types';

interface EmptyStateProps {
  personality: Personality;
  onSelectStarter: (prompt: string) => void;
  onOpenPersonalityModal: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  personality,
  onSelectStarter,
  onOpenPersonalityModal,
}) => {
  const getGlowBg = () => {
    switch (personality.themeColor) {
      case 'emerald':
        return 'from-emerald-500/20 via-emerald-500/5 to-transparent border-emerald-500/30';
      case 'cyan':
        return 'from-cyan-500/20 via-cyan-500/5 to-transparent border-cyan-500/30';
      case 'purple':
        return 'from-purple-500/20 via-purple-500/5 to-transparent border-purple-500/30';
      case 'amber':
        return 'from-amber-500/20 via-amber-500/5 to-transparent border-amber-500/30';
      case 'blue':
      default:
        return 'from-blue-500/20 via-blue-500/5 to-transparent border-blue-500/30';
    }
  };

  const getAccentText = () => {
    switch (personality.themeColor) {
      case 'emerald':
        return 'text-emerald-700 dark:text-emerald-400';
      case 'cyan':
        return 'text-cyan-700 dark:text-cyan-400';
      case 'purple':
        return 'text-purple-700 dark:text-purple-400';
      case 'amber':
        return 'text-amber-700 dark:text-amber-400';
      case 'blue':
      default:
        return 'text-blue-700 dark:text-blue-400';
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center sm:px-8 max-w-3xl mx-auto my-auto transition-colors">
      {/* Persona Hero Avatar */}
      <div className="relative mb-5 group">
        <div className={`absolute -inset-2 rounded-3xl bg-gradient-to-tr ${getGlowBg()} blur-xl opacity-60 transition duration-500 group-hover:opacity-100`} />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-xl text-4xl transform transition duration-300 hover:scale-105 dark:bg-slate-900 dark:border-slate-700/80 dark:shadow-2xl">
          {personality.avatar}
        </div>
      </div>

      {/* Name and Tagline */}
      <div className="mb-3 flex items-center justify-center gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {personality.name}
        </h2>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getGlowBg()} ${getAccentText()}`}>
          {personality.badge}
        </span>
      </div>

      <p className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 mb-2 max-w-md">
        {personality.tagline}
      </p>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mb-4 leading-relaxed">
        {personality.description}
      </p>

      {/* Tone Traits */}
      <div className="mb-7 flex flex-wrap justify-center gap-1.5">
        {personality.toneTraits.map((trait) => (
          <span
            key={trait}
            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700 border border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60"
          >
            {trait}
          </span>
        ))}
        <button
          onClick={onOpenPersonalityModal}
          className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700 hover:text-indigo-800 hover:bg-indigo-100 border border-indigo-200 dark:bg-slate-800/40 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-slate-800/70 dark:border-indigo-500/20 transition-colors inline-flex items-center gap-1"
        >
          <Sparkles className="h-3 w-3" />
          Switch persona
        </button>
      </div>

      {/* Starter Prompts Title */}
      <div className="w-full text-left mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Suggested conversation starters</span>
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">Click any to send</span>
      </div>

      {/* Starter Prompts Grid */}
      <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 text-left">
        {personality.starters.map((starter, idx) => (
          <button
            key={idx}
            onClick={() => onSelectStarter(starter)}
            className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 text-left transition-all duration-200 hover:border-indigo-300 hover:bg-slate-50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:hover:bg-slate-800/80 dark:hover:shadow-lg dark:hover:shadow-slate-950/40"
          >
            <p className="text-xs sm:text-sm text-slate-700 group-hover:text-slate-950 dark:text-slate-200 dark:group-hover:text-white leading-snug pr-4">
              "{starter}"
            </p>
            <div className="mt-2.5 flex items-center justify-end text-[11px] font-medium text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <span>Ask {personality.name.split(' ')[0]}</span>
              <ArrowRight className="h-3 w-3 ml-1 transform transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

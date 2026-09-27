import React from 'react';
import { PERSONALITIES } from '../personalities';
import { Personality } from '../types';

interface PersonalitySelectorProps {
  currentPersonality: Personality;
  onSelectPersonality: (personality: Personality) => void;
  disabled?: boolean;
}

export const PersonalitySelector: React.FC<PersonalitySelectorProps> = ({
  currentPersonality,
  onSelectPersonality,
  disabled = false,
}) => {
  const getThemeClasses = (p: Personality, isSelected: boolean) => {
    if (!isSelected) {
      return 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-100 shadow-xs dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200 dark:hover:bg-slate-800/60';
    }

    switch (p.themeColor) {
      case 'emerald':
        return 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-sm dark:bg-emerald-500/15 dark:border-emerald-500/50 dark:text-emerald-300 dark:shadow-emerald-950/50';
      case 'cyan':
        return 'bg-cyan-50 border-cyan-400 text-cyan-800 shadow-sm dark:bg-cyan-500/15 dark:border-cyan-500/50 dark:text-cyan-300 dark:shadow-cyan-950/50';
      case 'purple':
        return 'bg-purple-50 border-purple-400 text-purple-800 shadow-sm dark:bg-purple-500/15 dark:border-purple-500/50 dark:text-purple-300 dark:shadow-purple-950/50';
      case 'amber':
        return 'bg-amber-50 border-amber-400 text-amber-800 shadow-sm dark:bg-amber-500/15 dark:border-amber-500/50 dark:text-amber-300 dark:shadow-amber-950/50';
      case 'blue':
      default:
        return 'bg-blue-50 border-blue-400 text-blue-800 shadow-sm dark:bg-blue-500/15 dark:border-blue-500/50 dark:text-blue-300 dark:shadow-blue-950/50';
    }
  };

  return (
    <div className="w-full border-b border-slate-200 bg-slate-50/90 backdrop-blur-md px-3 py-2 sm:px-6 dark:border-slate-800/80 dark:bg-slate-950/70 transition-colors">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 overflow-x-auto no-scrollbar py-0.5">
        <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 mr-1 hidden sm:flex">
          <span>Persona:</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {PERSONALITIES.map((p) => {
            const isSelected = p.id === currentPersonality.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPersonality(p)}
                disabled={disabled}
                className={`group flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-150 shrink-0 ${getThemeClasses(
                  p,
                  isSelected
                )} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title={`${p.name} - ${p.tagline}`}
              >
                <span className="text-base select-none">{p.avatar}</span>
                <span className="font-semibold whitespace-nowrap">{p.name}</span>
                {isSelected && (
                  <span className="hidden md:inline-block text-[10px] opacity-80 pl-1 border-l border-current/30">
                    {p.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

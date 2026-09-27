import React from 'react';
import { X, Check, Sparkles, Sliders } from 'lucide-react';
import { PERSONALITIES } from '../personalities';
import { Personality } from '../types';

interface PersonalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersonality: Personality;
  onSelectPersonality: (p: Personality) => void;
  customInstructions: string;
  setCustomInstructions: (val: string) => void;
}

export const PersonalityModal: React.FC<PersonalityModalProps> = ({
  isOpen,
  onClose,
  currentPersonality,
  onSelectPersonality,
  customInstructions,
  setCustomInstructions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[90vh] dark:border-slate-700 dark:bg-slate-900 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Assistant Personalities</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose how the AI assistant frames its thoughts, tone, and depth</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {PERSONALITIES.map((p) => {
              const isSelected = p.id === currentPersonality.id;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPersonality(p)}
                  className={`group relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all duration-200 ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-50/70 shadow-sm dark:border-indigo-500/80 dark:bg-indigo-500/10 dark:shadow-md dark:shadow-indigo-950/40'
                      : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-2xl shadow-xs dark:bg-slate-900 dark:border-slate-700/80 dark:shadow-inner">
                    {p.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{p.name}</h4>
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {p.badge}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-300/90 mb-1">{p.tagline}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2.5">{p.description}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {p.toneTraits.map((trait) => (
                        <span
                          key={trait}
                          className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/50"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Custom instructions accordion / input */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Sliders className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Custom Tone Instructions (Optional)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Add any extra instructions (e.g. "Keep responses under 3 paragraphs" or "Include bullet lists").
            </p>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. Respond in French when asked; always provide a summary at the end..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none h-20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-950/80">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Selected: <strong className="text-slate-900 dark:text-white">{currentPersonality.name}</strong>
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-950/20 dark:shadow-indigo-950/40"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

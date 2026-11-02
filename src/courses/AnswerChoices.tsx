/**
 * The four answers under a practice question.
 *
 * A radio group, done properly: one tab stop, arrow keys walk the options, Home
 * and End jump to the ends, and Space/Enter chooses. The options used to be four
 * separate tab stops with no arrow keys, which is not how a radio group behaves
 * for anyone using a keyboard or a screen reader.
 *
 * Both the panel's quick practice and the mixed card render this, so the
 * behaviour cannot drift between them.
 */
import { useRef, type KeyboardEvent } from 'react';
import { mathRuns } from './questions';
import { pick } from './viz/controls';
import type { Bi } from '../teachingData';

const strings = {
  options: { en: 'Answer options', ar: 'الخيارات' },
} satisfies Record<string, Bi>;

export interface AnswerChoicesProps {
  options: string[];
  /** -1 when nothing is chosen yet. */
  selected: number;
  onSelect: (index: number) => void;
  /** After checking, reveal the right answer and freeze the group. */
  checked: boolean;
  correctIndex: number;
  isRtl: boolean;
}

export default function AnswerChoices({ options, selected, onSelect, checked, correctIndex, isRtl }: AnswerChoicesProps) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  // Roving tabindex: the chosen option (or the first) is the single tab stop.
  const tabbable = selected >= 0 ? selected : 0;

  const focusOption = (index: number) => {
    const next = Math.min(options.length - 1, Math.max(0, index));
    buttons.current[next]?.focus();
    if (!checked) onSelect(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = buttons.current.findIndex((button) => button === document.activeElement);
    const from = current >= 0 ? current : tabbable;
    let next: number | null = null;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (from + 1) % options.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (from - 1 + options.length) % options.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = options.length - 1;
    if (next === null) return;
    event.preventDefault();
    focusOption(next);
  };

  return (
    <div role="radiogroup" aria-label={pick(strings.options, isRtl)} className="space-y-2" onKeyDown={onKeyDown}>
      {options.map((option, position) => {
        const chosen = selected === position;
        const state = !checked
          ? chosen
            ? 'border-[var(--t-accent)] bg-[color-mix(in_srgb,var(--t-accent)_10%,transparent)]'
            : 'border-[color-mix(in_srgb,var(--t-ink)_14%,transparent)]'
          : position === correctIndex
            ? 'border-[var(--t-ok)] bg-[color-mix(in_srgb,var(--t-ok)_12%,transparent)]'
            : chosen
              ? 'border-[var(--t-danger)] bg-[color-mix(in_srgb,var(--t-danger)_10%,transparent)]'
              : 'border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] opacity-70';
        return (
          <button
            key={option}
            ref={(element) => {
              buttons.current[position] = element;
            }}
            type="button"
            role="radio"
            aria-checked={chosen}
            tabIndex={checked ? -1 : position === tabbable ? 0 : -1}
            disabled={checked}
            onClick={() => onSelect(position)}
            className={`flex w-full cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 text-start text-[0.82rem] transition-colors disabled:cursor-default ${state}`}
          >
            <span className="mt-0.5 font-mono text-[0.7rem] font-black text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">
              {'ABCD'[position] ?? position + 1}
            </span>
            <span className="min-w-0 text-[var(--t-ink)]">
              {mathRuns(option).map((run, runIndex) =>
                run.math ? (
                  <span key={runIndex} dir="ltr" className="font-mono">
                    {run.text}
                  </span>
                ) : (
                  <span key={runIndex}>{run.text}</span>
                ),
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

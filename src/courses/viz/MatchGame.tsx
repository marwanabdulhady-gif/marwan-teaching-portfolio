/**
 * Matching game shared by the two chapter reviews: pair each visual with a
 * verdict. Correct pairs lock with a tick, wrong ones bounce back with the
 * reason, and the score updates as you go.
 *
 * Fully keyboard operable: Tab to a visual, Enter to select it, then Tab to a
 * verdict and Enter to pair. No drag required.
 */
import { useMemo, useState } from 'react';
import { useLocale } from '../../LocaleContext';
import { pick } from './controls';

export interface MatchPair {
  id: string;
  /** What the visual shows (rendered by `renderVisual`). */
  visual: React.ReactNode;
  visualLabel: string;
  /** The verdict chip text. */
  verdict: string;
  /** Explanation shown when the pair is right. */
  reason: string;
}

export interface MatchGameProps {
  pairs: MatchPair[];
  prompt: { en: string; ar: string };
  onInteract: () => void;
}

const strings = {
  score: { en: 'score', ar: 'النتيجة' },
  pairs: { en: 'pairs', ar: 'أزواج' },
  selectFirst: { en: 'Select a graph first', ar: 'اختر رسماً أولاً' },
  reset: { en: 'Shuffle again', ar: 'اخلط مرة أخرى' },
  done: { en: 'All pairs matched', ar: 'تمت مطابقة كل الأزواج' },
  hint: {
    en: 'Pick a graph, then the verdict that describes it.',
    ar: 'اختر رسماً، ثم الحكم الذي يصفه.',
  },
  wrong: { en: 'Not that one — try another', ar: 'ليست هذه — جرّب غيرها' },
};

/** Deterministic shuffle so a reload does not reshuffle mid-thought. */
const rotate = <T,>(list: T[], by: number): T[] => {
  if (!list.length) return list;
  const offset = ((by % list.length) + list.length) % list.length;
  return [...list.slice(offset), ...list.slice(0, offset)];
};

export default function MatchGame({ pairs, prompt, onInteract }: MatchGameProps) {
  const { isRtl } = useLocale();
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [wrongChip, setWrongChip] = useState<string | null>(null);
  const [round, setRound] = useState(0);

  const verdicts = useMemo(() => rotate(pairs, 1 + round), [pairs, round]);
  const done = matched.length === pairs.length;

  const chooseVerdict = (pairId: string) => {
    if (!selected) return;
    onInteract();
    if (selected === pairId) {
      setMatched((current) => (current.includes(pairId) ? current : [...current, pairId]));
      setSelected(null);
      setWrong(null);
      setWrongChip(null);
      return;
    }
    setWrong(selected);
    setWrongChip(pairId);
    window.setTimeout(() => {
      setWrong(null);
      setWrongChip(null);
    }, 900);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_72%,transparent)]">
          {pick(prompt, isRtl)}
        </p>
        <p className="font-mono text-[0.7rem] font-bold text-[var(--t-accent-deep)]" dir="ltr">
          {matched.length}/{pairs.length} {pick(strings.pairs, isRtl)}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {pairs.map((pair) => {
          const isMatched = matched.includes(pair.id);
          const isSelected = selected === pair.id;
          const isWrong = wrong === pair.id;
          return (
            <button
              key={pair.id}
              type="button"
              aria-pressed={isSelected}
              aria-label={pair.visualLabel}
              disabled={isMatched}
              onClick={() => {
                onInteract();
                setSelected(pair.id);
                setWrong(null);
                setWrongChip(null);
              }}
              className={`flex items-center gap-2 rounded-xl border p-2 text-start transition-colors ${
                isMatched
                  ? 'border-[color-mix(in_srgb,var(--t-ok)_55%,transparent)] bg-[color-mix(in_srgb,var(--t-ok)_8%,transparent)]'
                  : isWrong
                    ? 'border-[var(--t-danger)]'
                    : isSelected
                      ? 'border-[var(--t-accent)] bg-[color-mix(in_srgb,var(--t-accent)_8%,transparent)]'
                      : 'border-[color-mix(in_srgb,var(--t-ink)_14%,transparent)]'
              }`}
            >
              <span dir="ltr" className="h-16 w-20 shrink-0">
                {pair.visual}
              </span>
              <span className="min-w-0 text-[0.72rem] font-semibold leading-snug text-[var(--t-ink)]">
                {isMatched ? '✓ ' : ''}
                {isMatched ? pair.verdict : pair.visualLabel}
                {isMatched && (
                  <span className="mt-1 block font-normal text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">{pair.reason}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
          {pick(strings.score, isRtl)}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {verdicts.map((pair) => {
            const isMatched = matched.includes(pair.id);
            return (
              <button
                key={pair.id}
                type="button"
                disabled={isMatched}
                onClick={() => chooseVerdict(pair.id)}
                dir="ltr"
                className={`rounded-full border px-2.5 py-1.5 font-mono text-[0.68rem] font-bold transition-colors ${
                  isMatched
                    ? 'border-transparent bg-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] text-[color-mix(in_srgb,var(--t-ink)_40%,transparent)] line-through'
                    : wrongChip === pair.id
                      ? 'border-[var(--t-danger)] text-[var(--t-danger)]'
                      : 'border-[color-mix(in_srgb,var(--t-ink)_20%,transparent)] text-[var(--t-ink)] cursor-pointer'
                }`}
              >
                {pair.verdict}
              </button>
            );
          })}
        </div>
      </div>

      {!selected && !done && (
        <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
          {pick(wrongChip ? strings.wrong : strings.selectFirst, isRtl)}
        </p>
      )}

      {done && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[color-mix(in_srgb,var(--t-ok)_10%,transparent)] px-3 py-2">
          <p className="text-xs font-bold text-[var(--t-ink)]">{pick(strings.done, isRtl)}</p>
          <button
            type="button"
            onClick={() => {
              setMatched([]);
              setSelected(null);
              setRound((current) => current + 1);
            }}
            className="cursor-pointer border-0 bg-transparent text-[0.7rem] font-bold uppercase tracking-wider text-[var(--t-accent-deep)] underline underline-offset-4"
          >
            {pick(strings.reset, isRtl)}
          </button>
        </div>
      )}
    </div>
  );
}

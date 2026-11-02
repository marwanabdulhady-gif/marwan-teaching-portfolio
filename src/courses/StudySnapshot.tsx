/**
 * A one-line study snapshot: what has been opened, how the questions are going,
 * and how many mistakes are still waiting in the review queue. Quiet when there
 * is nothing to report, so a first-time visitor sees the map instead of an
 * empty dashboard.
 *
 * Deliberately not a second set of course rings — the switcher already carries
 * those. This counts the things a ring cannot show: questions and mistakes.
 */
import { useLocale } from '../LocaleContext';
import { LESSONS } from './courseGraph';
import { useProgress } from './progress';
import { pick } from './viz/controls';

const strings = {
  opened: { en: 'lessons opened', ar: 'درساً مفتوحاً' },
  labs: { en: 'labs used', ar: 'مختبراً مستخدماً' },
  answered: { en: 'questions answered', ar: 'سؤالاً مُجاباً' },
  right: { en: 'correct', ar: 'صحيحة' },
  review: { en: 'to review', ar: 'للمراجعة' },
  reviewCta: { en: 'Review them', ar: 'راجعها' },
  clear: { en: 'No mistakes waiting', ar: 'لا أخطاء في الانتظار' },
  empty: { en: 'Your progress is saved on this device as you work.', ar: 'يُحفظ تقدمك على هذا الجهاز أثناء عملك.' },
};

interface StudySnapshotProps {
  /** Jumps to the review queue. */
  onReview: () => void;
}

export default function StudySnapshot({ onReview }: StudySnapshotProps) {
  const { isRtl } = useLocale();
  const progress = useProgress();

  let opened = 0;
  let labs = 0;
  let answered = 0;
  let right = 0;
  let missed = 0;

  for (const [key, entry] of Object.entries(progress.state.lessons)) {
    if (!LESSONS[key] || !entry) continue;
    if (entry.opened) opened += 1;
    if (entry.explorer) labs += 1;
    for (const verdict of Object.values(entry.checks ?? {})) {
      answered += 1;
      if (verdict === 'right') right += 1;
      else missed += 1;
    }
  }

  const chips: { id: string; label: string; value: string; emphasis?: boolean }[] = [];
  if (opened) chips.push({ id: 'opened', label: pick(strings.opened, isRtl), value: String(opened) });
  if (labs) chips.push({ id: 'labs', label: pick(strings.labs, isRtl), value: String(labs) });
  if (answered) {
    chips.push({
      id: 'answered',
      label: pick(strings.answered, isRtl),
      value: `${answered} · ${Math.round((right / answered) * 100)}% ${pick(strings.right, isRtl)}`,
      emphasis: true,
    });
  }

  return (
    <div className="teach-card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.72rem] text-[color-mix(in_srgb,var(--t-ink)_66%,transparent)]">
        {chips.length === 0 && <li>{pick(strings.empty, isRtl)}</li>}
        {chips.map((chip) => (
          <li key={chip.id} className="flex items-baseline gap-1.5">
            <span
              dir="ltr"
              className={`font-mono text-sm font-black ${chip.emphasis ? 'text-[var(--t-accent-deep)]' : 'text-[var(--t-ink)]'}`}
            >
              {chip.value}
            </span>
            <span>{chip.label}</span>
          </li>
        ))}
      </ul>

      {answered > 0 && (
        <div className="flex items-center gap-2">
          {missed > 0 ? (
            <>
              <span className="flex items-baseline gap-1.5 text-[0.72rem] text-[color-mix(in_srgb,var(--t-ink)_66%,transparent)]">
                <span dir="ltr" className="font-mono text-sm font-black text-[var(--t-danger)]">
                  {missed}
                </span>
                {pick(strings.review, isRtl)}
              </span>
              <button type="button" onClick={onReview} className="teach-btn teach-btn-secondary text-xs">
                {pick(strings.reviewCta, isRtl)}
              </button>
            </>
          ) : (
            <span className="flex items-center gap-1.5 text-[0.72rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
              <span aria-hidden className="text-[var(--t-ok)]">
                ✓
              </span>
              {pick(strings.clear, isRtl)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

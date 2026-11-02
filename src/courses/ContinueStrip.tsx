/**
 * "Pick up where you left off." Shows the last lesson opened, or a suggested
 * starting point for a first visit.
 */
import { useLocale } from '../LocaleContext';
import { LESSONS, type LessonKey } from './courseGraph';
import { useProgress } from './progress';
import { pick } from './viz/controls';

const strings = {
  continue: { en: 'Continue', ar: 'تابع' },
  startHere: { en: 'Start here', ar: 'ابدأ من هنا' },
  resume: { en: 'Resume', ar: 'استأنف' },
  start: { en: 'Start', ar: 'ابدأ' },
  firstLessonHint: {
    en: 'The map below shows all 23 lessons. Progress is saved on this device.',
    ar: 'تعرض الخريطة أدناه الدروس الـ ٢٣. يُحفظ تقدمك على هذا الجهاز.',
  },
};

interface ContinueStripProps {
  onOpen: (key: LessonKey) => void;
}

export default function ContinueStrip({ onOpen }: ContinueStripProps) {
  const { isRtl } = useLocale();
  const progress = useProgress();
  const last = progress.state.last?.key;
  const lesson = last && LESSONS[last] ? LESSONS[last] : LESSONS['grade-12-calculus/p1'];
  if (!lesson) return null;

  const resuming = Boolean(last);
  const completion = progress.completion(lesson.key);

  return (
    <div className="teach-card flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 text-start">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--t-accent)_16%,transparent)] text-[var(--t-accent-deep)] text-lg" aria-hidden>
        ▶
      </span>
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="teach-eyebrow !text-[0.6rem]">{pick(resuming ? strings.continue : strings.startHere, isRtl)}</p>
        <p className="text-sm sm:text-base font-bold text-[var(--t-ink)] truncate">
          <span dir="ltr" className="font-mono text-[var(--t-accent-deep)] me-2">{lesson.code}</span>
          {pick(lesson.title, isRtl)}
        </p>
        <div className="flex items-center gap-2">
          <span className="h-1.5 flex-1 max-w-[18rem] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--t-ink)_12%,transparent)]">
            <span className="block h-full rounded-full bg-[var(--t-accent)]" style={{ width: `${Math.max(completion, 2)}%` }} />
          </span>
          <span className="font-mono text-[0.68rem] font-bold text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">{completion}%</span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button type="button" onClick={() => onOpen(lesson.key)} className="teach-btn teach-btn-primary border-0">
          {pick(resuming ? strings.resume : strings.start, isRtl)}
        </button>
      </div>
      {!resuming && (
        <p className="sm:hidden text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
          {pick(strings.firstLessonHint, isRtl)}
        </p>
      )}
    </div>
  );
}

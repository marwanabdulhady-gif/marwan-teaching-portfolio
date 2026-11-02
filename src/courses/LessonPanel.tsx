/**
 * The lesson panel: a drawer on desktop, a bottom sheet on phones. It previews
 * the lesson, loads its hands-on explorer, runs three quick questions, records
 * confidence, and can still open the full classroom lesson.
 */
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLocale } from '../LocaleContext';
import { getLesson, neighbours, type LessonKey } from './courseGraph';
import { explorerFor } from './explorers';
import Placeholder from './explorers/Placeholder';
import { useProgress, type Mastery } from './progress';
import PracticeMini from './PracticeMini';
import { pick } from './viz/controls';

const strings = {
  tryIt: { en: 'Try it', ar: 'جرّبها' },
  topics: { en: "What you'll learn", ar: 'ما ستتعلمه' },
  confidence: { en: 'How confident are you?', ar: 'ما مدى ثقتك؟' },
  review: { en: 'Review', ar: 'مراجعة' },
  practice: { en: 'Practice', ar: 'تدريب' },
  confident: { en: 'Confident', ar: 'متقن' },
  openFull: { en: 'Open full lesson', ar: 'افتح الدرس كاملاً' },
  close: { en: 'Close lesson panel', ar: 'إغلاق لوحة الدرس' },
  prev: { en: 'Previous lesson', ar: 'الدرس السابق' },
  next: { en: 'Next lesson', ar: 'الدرس التالي' },
  loading: { en: 'Loading explorer…', ar: 'جارٍ تحميل المختبر…' },
  progress: { en: 'Completion', ar: 'نسبة الإنجاز' },
  questions: { en: 'questions', ar: 'أسئلة' },
};

const MASTERY: { id: Mastery; label: { en: string; ar: string } }[] = [
  { id: 'review', label: strings.review },
  { id: 'practice', label: strings.practice },
  { id: 'confident', label: strings.confident },
];

interface LessonPanelProps {
  lessonKey: LessonKey | null;
  onClose: () => void;
  onOpenFull: (url: string, title: string) => void;
  onNavigate: (key: LessonKey) => void;
}

export default function LessonPanel({ lessonKey, onClose, onOpenFull, onNavigate }: LessonPanelProps) {
  const { isRtl } = useLocale();
  const progress = useProgress();
  const reduced = useReducedMotion();
  const lesson = getLesson(lessonKey);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [practiceScore, setPracticeScore] = useState<string | null>(null);

  // Record the open + lock the page behind the panel.
  useEffect(() => {
    if (!lesson) return;
    progress.markOpened(lesson.key);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [lesson?.key]);

  useEffect(() => {
    setPracticeScore(null);
  }, [lesson?.key]);

  useEffect(() => {
    if (!lesson) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lesson?.key, onClose]);

  // `lazy()` must keep the same identity, or every render remounts the explorer.
  const Explorer = useMemo(
    () => (lesson ? lazy(explorerFor(lesson.key) ?? (() => Promise.resolve({ default: Placeholder }))) : null),
    [lesson?.key],
  );
  const loaders = lesson ? neighbours(lesson.key) : { prev: null, next: null };
  const completion = lesson ? progress.completion(lesson.key) : 0;
  const mastery = lesson ? progress.state.lessons[lesson.key]?.mastery : undefined;
  const explorerUsed = lesson ? Boolean(progress.state.lessons[lesson.key]?.explorer) : false;

  const motionProps = reduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        initial: { x: isRtl ? '-100%' : '100%', opacity: 0.6 },
        animate: { x: 0, opacity: 1 },
        exit: { x: isRtl ? '-100%' : '100%', opacity: 0.6 },
      };

  return (
    <AnimatePresence>
      {lesson && (
        <motion.div
          className="fixed inset-0 z-[1000] flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.22 }}
        >
          <button
            type="button"
            aria-label={pick(strings.close, isRtl)}
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default border-0 bg-[rgba(8,14,24,0.42)]"
            tabIndex={-1}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`panel-title-${lesson.id}`}
            {...motionProps}
            transition={{ duration: reduced ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex h-full w-full max-w-[540px] flex-col bg-[var(--t-bg)] shadow-[0_24px_60px_-20px_var(--t-shadow)] sm:h-[calc(100%-72px)] sm:mt-[72px] sm:rounded-s-2xl"
          >
            <header className="sticky top-0 z-10 space-y-2 border-b border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[var(--t-bg)] px-5 pb-3 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="teach-eyebrow !text-[0.6rem]">
                    {lesson.courseSlug === 'grade-12-calculus' ? (isRtl ? 'التفاضل · الصف ١٢' : 'Calculus · Grade 12') : isRtl ? 'ما قبل التفاضل · الصف ١١' : 'Precalculus · Grade 11'}
                  </p>
                  <h3 id={`panel-title-${lesson.id}`} className="text-lg font-black leading-tight text-[var(--t-ink)]">
                    <span dir="ltr" className="font-mono text-[var(--t-accent-deep)] me-2">{lesson.code}</span>
                    {pick(lesson.title, isRtl)}
                  </h3>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label={pick(strings.close, isRtl)}
                  className="h-10 w-10 shrink-0 rounded-full border border-[color-mix(in_srgb,var(--t-ink)_14%,transparent)] bg-transparent text-[var(--t-ink)] text-lg leading-none cursor-pointer hover:bg-[color-mix(in_srgb,var(--t-ink)_6%,transparent)]"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--t-ink)_12%,transparent)]">
                  <span className="block h-full rounded-full bg-[var(--t-accent)] transition-[width] duration-500" style={{ width: `${completion}%` }} />
                </span>
                <span className="font-mono text-[0.68rem] font-bold text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]" aria-label={pick(strings.progress, isRtl)}>
                  {completion}%
                </span>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              <section className="space-y-2">
                <h4 className="teach-eyebrow !text-[0.6rem]">{pick(strings.tryIt, isRtl)}</h4>
                <Suspense
                  fallback={<p className="text-xs text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">{pick(strings.loading, isRtl)}</p>}
                >
                  {Explorer && <Explorer lesson={lesson} onInteract={() => progress.markExplorer(lesson.key)} />}
                </Suspense>
              </section>

              <section className="space-y-2">
                <h4 className="teach-eyebrow !text-[0.6rem]">{pick(strings.topics, isRtl)}</h4>
                <ul className="space-y-1.5">
                  {lesson.topics.map((topic, index) => {
                    const done = explorerUsed || practiceScore !== null;
                    const tick = index === 0 && done;
                    return (
                      <li key={topic.en} className="flex items-start gap-2 text-[0.82rem] leading-snug text-[var(--t-ink)]">
                        <span aria-hidden className={`mt-0.5 text-[0.7rem] ${tick ? 'text-[var(--t-accent-deep)]' : 'text-[color-mix(in_srgb,var(--t-ink)_30%,transparent)]'}`}>
                          {tick ? '☑' : '☐'}
                        </span>
                        {pick(topic, isRtl)}
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="space-y-2">
                <PracticeMini
                  lesson={lesson}
                  onComplete={(right, answered) => setPracticeScore(`${right}/${answered}`)}
                />
              </section>

              <section className="space-y-2">
                <h4 className="teach-eyebrow !text-[0.6rem]">{pick(strings.confidence, isRtl)}</h4>
                <div className="flex flex-wrap gap-2">
                  {MASTERY.map((option) => {
                    const active = mastery === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => progress.setMastery(lesson.key, active ? undefined : option.id)}
                        className={`px-3 py-2 rounded-full text-xs font-bold cursor-pointer border transition-colors ${
                          active
                            ? 'border-[var(--t-sun)] bg-[color-mix(in_srgb,var(--t-sun)_24%,transparent)] text-[var(--t-ink)]'
                            : 'border-[color-mix(in_srgb,var(--t-ink)_16%,transparent)] bg-transparent text-[var(--t-ink)]'
                        }`}
                      >
                        {pick(option.label, isRtl)}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            <footer className="sticky bottom-0 border-t border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[var(--t-bg)] px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => loaders.prev && onNavigate(loaders.prev.key)}
                  disabled={!loaders.prev}
                  aria-label={pick(strings.prev, isRtl)}
                  className="h-10 min-w-10 px-2 rounded-lg border border-[color-mix(in_srgb,var(--t-ink)_14%,transparent)] bg-transparent text-xs font-bold text-[var(--t-ink)] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                >
                  <span dir="ltr">{loaders.prev ? `◀ ${loaders.prev.code}` : '◀'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenFull(lesson.href, pick(lesson.title, isRtl))}
                  className="teach-btn teach-btn-primary border-0 flex-1 justify-center"
                >
                  {pick(strings.openFull, isRtl)} <span aria-hidden>▸</span>
                </button>
                <button
                  type="button"
                  onClick={() => loaders.next && onNavigate(loaders.next.key)}
                  disabled={!loaders.next}
                  aria-label={pick(strings.next, isRtl)}
                  className="h-10 min-w-10 px-2 rounded-lg border border-[color-mix(in_srgb,var(--t-ink)_14%,transparent)] bg-transparent text-xs font-bold text-[var(--t-ink)] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                >
                  <span dir="ltr">{loaders.next ? `${loaders.next.code} ▶` : '▶'}</span>
                </button>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

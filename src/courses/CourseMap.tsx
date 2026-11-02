/**
 * The course map: chapters as lanes with lessons as nodes on a line. On phones
 * the lanes become a vertical timeline. Nodes are real buttons with a roving
 * tabindex, so the whole map is one Tab stop and the arrow keys walk it.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { useLocale } from '../LocaleContext';
import { COURSES, LESSONS, type CourseId, type LessonKey } from './courseGraph';
import MapNode from './MapNode';
import { nodeStateOf, useProgress } from './progress';
import { useIsWide } from './useMediaQuery';
import { pick } from './viz/controls';

const strings = {
  legend: { en: 'Legend', ar: 'الدليل' },
  new: { en: 'Not started', ar: 'لم يبدأ' },
  started: { en: 'In progress', ar: 'قيد التقدم' },
  done: { en: 'Done', ar: 'مكتمل' },
  confident: { en: 'Confident', ar: 'متقن' },
  reset: { en: 'Reset progress', ar: 'تصفير التقدم' },
  resetConfirm: {
    en: 'Clear every saved open, answer and confidence rating on this device?',
    ar: 'هل تريد مسح كل ما حُفظ من فتح وإجابات وتقييم ثقة على هذا الجهاز؟',
  },
  empty: { en: 'No lessons in this chapter.', ar: 'لا دروس في هذا الفصل.' },
  lab: { en: 'Hands-on lab', ar: 'مختبر تفاعلي' },
  doneCount: { en: 'done', ar: 'مكتمل' },
  mapLabel: { en: 'Course map', ar: 'خريطة الدورة' },
  practise: { en: 'Practise this course', ar: 'تدرّب على هذه الدورة' },
};

interface CourseMapProps {
  course: Exclude<CourseId, 'gmat'>;
  currentKey: LessonKey | null;
  onOpen: (key: LessonKey) => void;
  /** Hands the practice card a course filter and scrolls to it. */
  onPractise: () => void;
}

export default function CourseMap({ course, currentKey, onOpen, onPractise }: CourseMapProps) {
  const { isRtl } = useLocale();
  const progress = useProgress();
  const wide = useIsWide();
  const [focusIndex, setFocusIndex] = useState(0);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const definition = useMemo(() => COURSES.find((item) => item.id === course) ?? COURSES[0], [course]);
  const ordered = useMemo(
    () => definition.chapters.flatMap((chapter) => chapter.lessons),
    [definition],
  );

  const move = useCallback(
    (from: number, delta: number) => {
      const next = Math.min(ordered.length - 1, Math.max(0, from + delta));
      setFocusIndex(next);
      nodeRefs.current[next]?.focus();
    },
    [ordered.length],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>, index: number) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      move(index, 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      move(index, -1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      move(index, -index);
    } else if (event.key === 'End') {
      event.preventDefault();
      move(index, ordered.length - 1 - index);
    }
  };

  const onReset = () => {
    if (window.confirm(pick(strings.resetConfirm, isRtl))) progress.reset();
  };

  const chapterDone = (keys: LessonKey[]) => keys.filter((key) => progress.completion(key) >= 100).length;
  const chapterPercent = (keys: LessonKey[]) => {
    const raw = keys.reduce((total, key) => total + progress.completion(key), 0) / keys.length;
    return Math.max(2, Math.round(raw));
  };

  let runningIndex = -1;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.68rem] font-semibold text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">
          <li className="teach-eyebrow !text-[0.6rem]">{pick(strings.legend, isRtl)}</li>
          {(
            [
              // The done/confident fills are pale against paper, so their
              // swatch carries the same ink edge as the map node itself.
              ['new', 'border-[color-mix(in_srgb,var(--t-ink)_25%,transparent)] bg-transparent'],
              ['started', 'border-[var(--t-accent)] bg-[color-mix(in_srgb,var(--t-accent)_14%,transparent)]'],
              ['done', 'border-[color-mix(in_srgb,var(--t-ink)_45%,transparent)] bg-[var(--t-sky)]'],
              ['confident', 'border-[color-mix(in_srgb,var(--t-ink)_45%,transparent)] bg-[var(--t-sun)]'],
            ] as const
          ).map(([state, classes]) => (
            <li key={state} className="flex items-center gap-1.5">
              <span className={`inline-block h-3 w-3 rounded-full border-2 ${classes}`} aria-hidden />
              {pick(strings[state], isRtl)}
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--t-accent)_18%,var(--t-bg))] text-[0.55rem]"
              aria-hidden
            >
              ⚗
            </span>
            {pick(strings.lab, isRtl)}
          </li>
        </ul>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onPractise}
            className="rounded-full border border-[color-mix(in_srgb,var(--t-accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--t-accent)_10%,transparent)] px-3 py-1 text-[0.68rem] font-bold text-[var(--t-accent-deep)] cursor-pointer hover:bg-[color-mix(in_srgb,var(--t-accent)_18%,transparent)]"
          >
            {pick(strings.practise, isRtl)}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="text-[0.68rem] font-bold uppercase tracking-wider text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)] hover:text-[var(--t-accent-deep)] cursor-pointer bg-transparent border-0 underline underline-offset-4"
          >
            {pick(strings.reset, isRtl)}
          </button>
        </div>
      </div>

      <div aria-label={pick(strings.mapLabel, isRtl)} className="space-y-6">
        {definition.chapters.map((chapter) => (
          <section key={chapter.id} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <h4 className="text-[0.74rem] font-black uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">
                {pick(chapter.title, isRtl)}
              </h4>
              {chapter.lessons.length > 0 && (
                <span className="flex items-center gap-2">
                  <span
                    className="h-1 w-16 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--t-ink)_12%,transparent)]"
                    aria-hidden
                  >
                    <span
                      className="block h-full rounded-full bg-[var(--t-accent)]"
                      style={{ width: `${chapterPercent(chapter.lessons)}%` }}
                    />
                  </span>
                  <span className="font-mono text-[0.62rem] font-bold text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
                    {chapterDone(chapter.lessons)}/{chapter.lessons.length} {pick(strings.doneCount, isRtl)}
                  </span>
                </span>
              )}
            </div>
            {chapter.lessons.length === 0 && (
              <p className="text-xs text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">{pick(strings.empty, isRtl)}</p>
            )}

            {wide ? (
              <div className="teach-scroll-rail flex items-start gap-1 overflow-x-auto pb-2">
                {chapter.lessons.map((key, position) => {
                  runningIndex += 1;
                  const index = runningIndex;
                  const lesson = LESSONS[key];
                  const state = nodeStateOf(progress.state, key);
                  const completion = progress.completion(key);
                  const previousState = position > 0 ? nodeStateOf(progress.state, chapter.lessons[position - 1]) : null;
                  return (
                    <div key={key} className="flex items-start shrink-0">
                      {position > 0 && (
                        <span
                          aria-hidden
                          className={`mt-[38px] h-1 w-8 rounded-full ${
                            previousState === 'done' || previousState === 'confident'
                              ? 'bg-[var(--t-accent)]'
                              : 'bg-[color-mix(in_srgb,var(--t-ink)_18%,transparent)]'
                          }`}
                        />
                      )}
                      <div onKeyDown={(event) => onKeyDown(event, index)}>
                        <MapNode
                          lesson={lesson}
                          state={state}
                          completion={completion}
                          current={currentKey === key}
                          variant="lanes"
                          isRtl={isRtl}
                          tabIndex={focusIndex === index ? 0 : -1}
                          onOpen={() => onOpen(key)}
                          onFocus={() => setFocusIndex(index)}
                          nodeRef={(element) => {
                            nodeRefs.current[index] = element;
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="relative border-s-2 border-dashed border-[color-mix(in_srgb,var(--t-ink)_18%,transparent)] ps-4 space-y-3">
                {chapter.lessons.map((key) => {
                  runningIndex += 1;
                  const index = runningIndex;
                  const lesson = LESSONS[key];
                  return (
                    <div key={key} onKeyDown={(event) => onKeyDown(event, index)}>
                      <MapNode
                        lesson={lesson}
                        state={nodeStateOf(progress.state, key)}
                        completion={progress.completion(key)}
                        current={currentKey === key}
                        variant="timeline"
                        isRtl={isRtl}
                        tabIndex={focusIndex === index ? 0 : -1}
                        onOpen={() => onOpen(key)}
                        onFocus={() => setFocusIndex(index)}
                        nodeRef={(element) => {
                          nodeRefs.current[index] = element;
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

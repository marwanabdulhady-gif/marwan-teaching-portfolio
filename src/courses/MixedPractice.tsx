/**
 * Interleaved practice, in two modes:
 *
 *   mixed  — four questions drawn from different courses, so the learner has to
 *            decide *which* idea a problem needs rather than repeating one skill.
 *            Lessons they have opened come first; a fresh visitor gets a spread
 *            across all six courses instead.
 *   review — only the questions this learner has actually got wrong, newest
 *            first. Answering one correctly removes it from the queue, so the
 *            card empties as the mistakes are cleared.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocale } from '../LocaleContext';
import { COURSES, LESSONS, QUESTION_OWNER, type CourseId, type LessonKey } from './courseGraph';
import { useProgress } from './progress';
import { PRACTICE_SET_SIZE, pickPracticeQuestions, missedQuestionIds } from './practiceQueue';
import { loadQuestions, mathRuns, type Question } from './questions';
import { pick } from './viz/controls';

const strings = {
  eyebrow: { en: 'Mixed practice', ar: 'تدريب متنوّع' },
  title: { en: 'Four questions, four corners of the map.', ar: 'أربعة أسئلة من أربع زوايا مختلفة من الخريطة.' },
  titleCourse: { en: 'Four questions from this course.', ar: 'أربعة أسئلة من هذه الدورة.' },
  loading: { en: 'Loading questions…', ar: 'جارٍ تحميل الأسئلة…' },
  failed: { en: 'The question bank could not load right now.', ar: 'تعذّر تحميل بنك الأسئلة الآن.' },
  check: { en: 'Check', ar: 'تحقّق' },
  next: { en: 'Next question', ar: 'السؤال التالي' },
  done: { en: 'Mixed practice complete', ar: 'اكتمل التدريب المتنوّع' },
  correct: { en: 'Correct', ar: 'صحيح' },
  wrong: { en: 'Not quite', ar: 'ليس تماماً' },
  hint: { en: 'Hint', ar: 'تلميح' },
  explanation: { en: 'Why', ar: 'التفسير' },
  restart: { en: 'New set', ar: 'مجموعة جديدة' },
  from: { en: 'from', ar: 'من' },
  open: { en: 'Open lesson', ar: 'افتح الدرس' },
  modeMixed: { en: 'Mixed', ar: 'متنوّع' },
  modeReview: { en: 'My mistakes', ar: 'أخطائي' },
  reviewTitle: { en: 'Questions you have missed. Answer one right and it leaves the queue.', ar: 'أسئلة أخطأت فيها. أجب بشكل صحيح ليغادر السؤال القائمة.' },
  reviewDone: { en: 'Mistakes cleared', ar: 'تمت مراجعة الأخطاء' },
  noMistakes: { en: 'No mistakes to review yet. Do a mixed set — anything you miss lands here.', ar: 'لا أخطاء للمراجعة بعد. ابدأ مجموعة متنوّعة وسيظهر هنا كل ما تخطئ فيه.' },
  queued: { en: 'in the queue', ar: 'في القائمة' },
};

const SET_SIZE = PRACTICE_SET_SIZE;

type Mode = 'mixed' | 'review';

interface MixedPracticeProps {
  onOpenLesson: (key: LessonKey) => void;
  /** Controlled by the study snapshot, so “review them” can open the queue. */
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  /** Set by “Practise this course” on the map; null means the whole map. */
  course?: CourseId | null;
  onClearCourse?: () => void;
}

export default function MixedPractice({ onOpenLesson, mode, onModeChange, course = null, onClearCourse }: MixedPracticeProps) {
  const { isRtl, locale } = useLocale();
  const progress = useProgress();
  const [bank, setBank] = useState<Record<string, Question> | null>(null);
  const [error, setError] = useState(false);
  const [round, setRound] = useState(0);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [score, setScore] = useState({ right: 0, answered: 0 });

  useEffect(() => {
    let alive = true;
    loadQuestions()
      .then((data) => alive && setBank(data))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  const questions = useMemo(
    () =>
      bank
        ? pickPracticeQuestions({ bank, lessons: progress.state.lessons, round, mode, course: course ?? undefined })
        : ([] as Question[]),
    [bank, progress.state.lessons, round, mode, course],
  );

  const missedCount = useMemo(
    () => missedQuestionIds(progress.state.lessons, course ?? undefined).length,
    [progress.state.lessons, course],
  );

  const question = questions[index];
  const owner = question ? QUESTION_OWNER[question.id] : undefined;
  const ownerLesson = owner ? LESSONS[owner] : undefined;
  const courseTitle = ownerLesson ? COURSES.find((item) => item.id === ownerLesson.course)?.short : undefined;
  const filterTitle = course ? COURSES.find((item) => item.id === course)?.short : undefined;
  const finished = questions.length > 0 && index >= questions.length;

  const answer = (option: number) => {
    if (checked || !question) return;
    setSelected(option);
  };

  const check = () => {
    if (selected === null || !question) return;
    const correct = selected === question.correctIndex;
    setChecked(true);
    setScore((current) => ({ right: current.right + (correct ? 1 : 0), answered: current.answered + 1 }));
    if (owner) progress.answer(owner, question.id, correct);
  };

  const next = () => {
    setSelected(null);
    setChecked(false);
    setHintOpen(false);
    setIndex((current) => current + 1);
  };

  const restart = () => {
    setSelected(null);
    setChecked(false);
    setHintOpen(false);
    setScore({ right: 0, answered: 0 });
    setIndex(0);
    setRound((current) => current + 1);
  };

  const reviewCount = missedCount;

  const changeMode = (next: Mode) => {
    if (next === mode) return;
    onModeChange(next);
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setHintOpen(false);
    setScore({ right: 0, answered: 0 });
    setRound((current) => current + 1);
  };

  /** The card frame, so the section is identifiable before the bank arrives. */
  const shell = (body: ReactNode) => (
    <div id="mixed-practice" className="teach-card scroll-mt-24 p-4 sm:p-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex gap-1 rounded-full border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] p-0.5" role="group" aria-label={pick(strings.eyebrow, isRtl)}>
          {(
            [
              ['mixed', strings.modeMixed],
              ['review', strings.modeReview],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => changeMode(id)}
              className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-[0.65rem] font-bold transition-colors ${
                mode === id
                  ? 'bg-[var(--t-accent)] text-[var(--t-on-accent)]'
                  : 'bg-transparent text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]'
              }`}
            >
              {pick(label, isRtl)}
              {id === 'review' && reviewCount > 0 && (
                <span className="ms-1 font-mono" dir="ltr">
                  {reviewCount}
                </span>
              )}
            </button>
          ))}
        </div>
        {questions.length > 0 && !finished && (
          <div className="flex items-center gap-1.5" aria-hidden>
            {questions.map((item, position) => (
              <span
                key={item.id}
                className={`h-1.5 w-4 rounded-full ${
                  position < index
                    ? 'bg-[var(--t-accent)]'
                    : position === index
                      ? 'bg-[var(--t-accent)]/60'
                      : 'bg-[color-mix(in_srgb,var(--t-ink)_16%,transparent)]'
                }`}
              />
            ))}
          </div>
        )}
        {questions.length > 0 && (
          <span className="font-mono text-[0.68rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]" dir="ltr">
            {Math.min(index + 1, questions.length)}/{questions.length}
          </span>
        )}
      </div>
      <p className="mb-2 flex flex-wrap items-center gap-2 text-[0.72rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
        <span>{pick(mode === 'review' ? strings.reviewTitle : filterTitle ? strings.titleCourse : strings.title, isRtl)}</span>
        {filterTitle && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--t-accent)_40%,transparent)] px-2 py-0.5 font-bold text-[var(--t-accent-deep)]">
            {filterTitle[locale]}
            {onClearCourse && (
              <button
                type="button"
                onClick={onClearCourse}
                aria-label={isRtl ? 'أزل تصفية الدورة' : 'Clear the course filter'}
                className="cursor-pointer border-0 bg-transparent p-0 text-[0.7rem] leading-none"
              >
                ×
              </button>
            )}
          </span>
        )}
      </p>
      {body}
    </div>
  );

  if (error) {
    return shell(<p className="text-xs text-[color-mix(in_srgb,var(--t-ink)_65%,transparent)]">{pick(strings.failed, isRtl)}</p>);
  }
  if (!bank) {
    return shell(<p className="text-xs text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">{pick(strings.loading, isRtl)}</p>);
  }
  if (!questions.length) {
    if (mode === 'review') {
      return shell(
        <p className="rounded-xl border border-dashed border-[color-mix(in_srgb,var(--t-ink)_18%,transparent)] px-3 py-2.5 text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_66%,transparent)]">
          {pick(strings.noMistakes, isRtl)}
        </p>,
      );
    }
    return null;
  }

  if (finished) {
    return shell(
      <>
        <p className="text-sm font-bold text-[var(--t-ink)]">
          {pick(mode === 'review' ? strings.reviewDone : strings.done, isRtl)} ·{' '}
          <span dir="ltr">{score.right}/{score.answered}</span>
        </p>
        {mode === 'review' && (
          <p className="mt-1 text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
            {reviewCount} {pick(strings.queued, isRtl)}
          </p>
        )}
        <button
          type="button"
          onClick={restart}
          className="mt-2 text-xs font-bold uppercase tracking-wider text-[var(--t-accent-deep)] underline underline-offset-4 cursor-pointer bg-transparent border-0"
        >
          {pick(strings.restart, isRtl)}
        </button>
      </>,
    );
  }

  const isCorrect = checked && selected === question.correctIndex;
  const feedback = checked && selected !== null ? question.optionFeedback?.[selected] ?? null : null;

  return shell(
    <>
      <p className="mb-1 text-[0.72rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
        {pick(strings.from, isRtl)}{' '}
        <button
          type="button"
          onClick={() => owner && onOpenLesson(owner)}
          className="cursor-pointer border-0 bg-transparent p-0 text-start font-bold text-[var(--t-accent-deep)] underline underline-offset-2"
        >
          {ownerLesson ? `${courseTitle ? courseTitle[locale] : ''} ${ownerLesson.code}`.trim() : ''}
        </button>
      </p>

      <p className="text-sm leading-relaxed text-[var(--t-ink)]">
        {mathRuns(question.question).map((run, position) =>
          run.math ? (
            <span key={position} dir="ltr" className="font-mono">
              {run.text}
            </span>
          ) : (
            <span key={position}>{run.text}</span>
          ),
        )}
      </p>

      <div role="radiogroup" aria-label={isRtl ? 'الخيارات' : 'Answer options'} className="mt-3 space-y-2">
        {question.options.map((option, position) => {
          const chosen = selected === position;
          const state = !checked
            ? chosen
              ? 'border-[var(--t-accent)] bg-[color-mix(in_srgb,var(--t-accent)_10%,transparent)]'
              : 'border-[color-mix(in_srgb,var(--t-ink)_14%,transparent)]'
            : position === question.correctIndex
              ? 'border-[var(--t-ok)] bg-[color-mix(in_srgb,var(--t-ok)_12%,transparent)]'
              : chosen
                ? 'border-[var(--t-danger)] bg-[color-mix(in_srgb,var(--t-danger)_10%,transparent)]'
                : 'border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] opacity-70';
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={chosen}
              disabled={checked}
              onClick={() => answer(position)}
              className={`flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-start text-[0.82rem] cursor-pointer transition-colors disabled:cursor-default ${state}`}
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

      {hintOpen && question.hint && (
        <p className="mt-2 rounded-xl bg-[color-mix(in_srgb,var(--t-sun)_14%,transparent)] px-3 py-2 text-xs text-[var(--t-ink)]">
          <strong className="font-bold">{pick(strings.hint, isRtl)}: </strong>
          {question.hint}
        </p>
      )}

      {checked && (
        <div className="mt-2 space-y-2 rounded-xl border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] px-3 py-2.5">
          <p className={`text-xs font-black ${isCorrect ? 'text-[var(--t-ok)]' : 'text-[var(--t-danger)]'}`}>
            {pick(isCorrect ? strings.correct : strings.wrong, isRtl)}
          </p>
          {feedback && <p className="text-xs leading-relaxed text-[var(--t-ink)]">{feedback}</p>}
          {question.explanation && (
            <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_72%,transparent)]">
              <strong className="font-bold text-[var(--t-ink)]">{pick(strings.explanation, isRtl)}: </strong>
              {question.explanation}
            </p>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!checked ? (
          <>
            <button
              type="button"
              onClick={check}
              disabled={selected === null}
              className="teach-btn teach-btn-primary border-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {pick(strings.check, isRtl)}
            </button>
            {!hintOpen && question.hint && (
              <button type="button" onClick={() => setHintOpen(true)} className="teach-btn teach-btn-secondary">
                {pick(strings.hint, isRtl)}
              </button>
            )}
          </>
        ) : (
          <>
            <button type="button" onClick={next} className="teach-btn teach-btn-primary border-0">
              {pick(strings.next, isRtl)}
            </button>
            {ownerLesson && (
              <button type="button" onClick={() => owner && onOpenLesson(owner)} className="teach-btn teach-btn-secondary">
                {pick(strings.open, isRtl)}
              </button>
            )}
          </>
        )}
      </div>
    </>,
  );
}

/**
 * Interleaved practice: four questions drawn from different courses, so the
 * learner has to decide *which* idea a problem needs rather than repeating the
 * same skill. Lessons they have opened come first; a fresh visitor gets a
 * spread across all six courses instead.
 */
import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '../LocaleContext';
import { COURSES, LESSONS, QUESTION_OWNER, type LessonKey } from './courseGraph';
import { useProgress } from './progress';
import { loadQuestions, mathRuns, type Question } from './questions';
import { pick } from './viz/controls';

const strings = {
  eyebrow: { en: 'Mixed practice', ar: 'تدريب متنوّع' },
  title: { en: 'Four questions, four different corners of the map.', ar: 'أربعة أسئلة من أربع زوايا مختلفة من الخريطة.' },
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
  compact: { en: 'Fewer questions', ar: 'أسئلة أقل' },
};

const SET_SIZE = 4;

interface MixedPracticeProps {
  onOpenLesson: (key: LessonKey) => void;
}

export default function MixedPractice({ onOpenLesson }: MixedPracticeProps) {
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

  const questions = useMemo(() => {
    if (!bank) return [] as Question[];
    const opened = Object.keys(progress.state.lessons).filter((key) => LESSONS[key]);
    // Warm up on lessons already visited; otherwise sample the whole map.
    const pool = (opened.length ? opened : Object.keys(LESSONS)).flatMap((key) =>
      LESSONS[key].questionIds.filter((id) => bank[id]).map((id) => ({ key, id })),
    );
    if (!pool.length) return [];
    // Deterministic shuffle so the set is stable across re-renders, fresh per round.
    const ordered = [...pool]
      .map((item, position) => ({ item, sort: ((position + 1) * 2654435761 + round * 40503) % 104729 }))
      .sort((a, b) => a.sort - b.sort)
      .map((entry) => entry.item);
    const chosen = new Map<string, Question>();
    const lessons = new Set<string>();
    const courses = new Set<string>();
    // Pass 1: a different course per question. Pass 2: relax that, keep lessons distinct.
    for (const strict of [true, false]) {
      for (const candidate of ordered) {
        if (chosen.size >= SET_SIZE) break;
        const { course } = LESSONS[candidate.key];
        if (lessons.has(candidate.key) || chosen.has(candidate.id)) continue;
        if (strict && courses.has(course)) continue;
        lessons.add(candidate.key);
        courses.add(course);
        chosen.set(candidate.id, bank[candidate.id]);
      }
      if (chosen.size >= SET_SIZE) break;
    }
    return [...chosen.values()];
  }, [bank, progress.state.lessons, round]);

  const question = questions[index];
  const owner = question ? QUESTION_OWNER[question.id] : undefined;
  const ownerLesson = owner ? LESSONS[owner] : undefined;
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

  if (error) {
    return (
      <div className="teach-card p-4 sm:p-5">
        <p className="text-xs text-[color-mix(in_srgb,var(--t-ink)_65%,transparent)]">{pick(strings.failed, isRtl)}</p>
      </div>
    );
  }
  if (!bank) {
    return (
      <div className="teach-card p-4 sm:p-5">
        <p className="text-xs text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">{pick(strings.loading, isRtl)}</p>
      </div>
    );
  }
  if (!questions.length) return null;

  if (finished) {
    return (
      <div className="teach-card p-4 sm:p-5">
        <p className="teach-eyebrow mb-2 !text-[0.6rem]">{pick(strings.eyebrow, isRtl)}</p>
        <p className="text-sm font-bold text-[var(--t-ink)]">
          {pick(strings.done, isRtl)} · <span dir="ltr">{score.right}/{score.answered}</span>
        </p>
        <button
          type="button"
          onClick={restart}
          className="mt-2 text-xs font-bold uppercase tracking-wider text-[var(--t-accent-deep)] underline underline-offset-4 cursor-pointer bg-transparent border-0"
        >
          {pick(strings.restart, isRtl)}
        </button>
      </div>
    );
  }

  const isCorrect = checked && selected === question.correctIndex;
  const feedback = checked && selected !== null ? question.optionFeedback?.[selected] ?? null : null;
  const courseTitle = ownerLesson ? COURSES.find((course) => course.id === ownerLesson.course)?.short : undefined;

  return (
    <div className="teach-card p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="teach-eyebrow !text-[0.6rem]">{pick(strings.eyebrow, isRtl)}</p>
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
        <span className="font-mono text-[0.68rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]" dir="ltr">
          {index + 1}/{questions.length}
        </span>
      </div>

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
              ? 'border-[var(--t-ok,#2a8a57)] bg-[color-mix(in_srgb,var(--t-ok,#2a8a57)_12%,transparent)]'
              : chosen
                ? 'border-[var(--t-warn,#b5481f)] bg-[color-mix(in_srgb,var(--t-warn,#b5481f)_10%,transparent)]'
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
          <p className={`text-xs font-black ${isCorrect ? 'text-[#2a8a57]' : 'text-[#b5481f]'}`}>
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
              <button
                type="button"
                onClick={() => owner && onOpenLesson(owner)}
                className="teach-btn teach-btn-secondary"
              >
                {pick(strings.open, isRtl)}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

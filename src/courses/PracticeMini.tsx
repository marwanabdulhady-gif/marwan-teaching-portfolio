/**
 * Three-question quick practice for one lesson. Prefers questions the learner
 * has not answered, then ones they got wrong. Answers are stored in the shared
 * progress store, so the map's completion ring moves as you practise.
 */
import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '../LocaleContext';
import type { LessonNode } from './courseGraph';
import { useProgress } from './progress';
import { loadQuestions, mathRuns, type Question } from './questions';
import { pick } from './viz/controls';

const strings = {
  eyebrow: { en: 'Quick practice', ar: 'تدريب سريع' },
  loading: { en: 'Loading questions…', ar: 'جارٍ تحميل الأسئلة…' },
  failed: { en: 'The question bank could not load. The full lesson still works.', ar: 'تعذّر تحميل بنك الأسئلة. الدرس الكامل يعمل كما هو.' },
  none: { en: 'No linked questions for this lesson yet.', ar: 'لا توجد أسئلة مرتبطة بهذا الدرس بعد.' },
  check: { en: 'Check', ar: 'تحقّق' },
  next: { en: 'Next question', ar: 'السؤال التالي' },
  done: { en: 'Practice complete', ar: 'اكتمل التدريب' },
  correct: { en: 'Correct', ar: 'صحيح' },
  wrong: { en: 'Not quite', ar: 'ليس تماماً' },
  hint: { en: 'Hint', ar: 'تلميح' },
  explanation: { en: 'Why', ar: 'التفسير' },
  restart: { en: 'Practise again', ar: 'تدرّب مرة أخرى' },
  progress: { en: 'answered', ar: 'تمت الإجابة' },
};

interface PracticeMiniProps {
  lesson: LessonNode;
  /** Rendered by the panel when practice is finished. */
  onComplete?: (correct: number, total: number) => void;
}

export default function PracticeMini({ lesson, onComplete }: PracticeMiniProps) {
  const { isRtl } = useLocale();
  const progress = useProgress();
  const [bank, setBank] = useState<Record<string, Question> | null>(null);
  const [error, setError] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [score, setScore] = useState({ right: 0, answered: 0 });
  const [round, setRound] = useState(0);

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
    if (!bank) return [];
    const checks = progress.state.lessons[lesson.key]?.checks ?? {};
    const unseen = lesson.questionIds.filter((id) => !checks[id]);
    const missed = lesson.questionIds.filter((id) => checks[id] === 'wrong');
    const pool = [...unseen, ...missed];
    const chosen: string[] = [];
    for (const id of pool) {
      if (!chosen.includes(id) && bank[id]) chosen.push(id);
      if (chosen.length === 3) break;
    }
    // Not enough unseen: top up with any linked question.
    for (const id of lesson.questionIds) {
      if (chosen.length >= 3) break;
      if (!chosen.includes(id) && bank[id]) chosen.push(id);
    }
    return chosen.map((id) => bank[id]);
    // `round` forces a reshuffle when the learner starts over.
  }, [bank, lesson, progress.state.lessons, round]);

  const question = questions[index];
  const finished = questions.length > 0 && index >= questions.length;

  useEffect(() => {
    if (finished) onComplete?.(score.right, score.answered);
  }, [finished, onComplete, score.right, score.answered]);

  const answer = (option: number) => {
    if (checked || !question) return;
    setSelected(option);
  };

  const check = () => {
    if (selected === null || !question) return;
    const correct = selected === question.correctIndex;
    setChecked(true);
    setScore((current) => ({ right: current.right + (correct ? 1 : 0), answered: current.answered + 1 }));
    progress.answer(lesson.key, question.id, correct);
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
    return <p className="text-xs text-[color-mix(in_srgb,var(--t-ink)_65%,transparent)]">{pick(strings.failed, isRtl)}</p>;
  }
  if (!bank) {
    return <p className="text-xs text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">{pick(strings.loading, isRtl)}</p>;
  }
  if (!questions.length) {
    return <p className="text-xs text-[color-mix(in_srgb,var(--t-ink)_60%,transparent)]">{pick(strings.none, isRtl)}</p>;
  }
  if (finished) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-bold text-[var(--t-ink)]">
          {pick(strings.done, isRtl)} · {score.right}/{score.answered}
        </p>
        <button
          type="button"
          onClick={restart}
          className="text-xs font-bold uppercase tracking-wider text-[var(--t-accent-deep)] underline underline-offset-4 cursor-pointer bg-transparent border-0"
        >
          {pick(strings.restart, isRtl)}
        </button>
      </div>
    );
  }

  const isCorrect = checked && selected === question.correctIndex;
  const feedback = checked && selected !== null ? question.optionFeedback?.[selected] ?? null : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="teach-eyebrow !text-[0.6rem]">{pick(strings.eyebrow, isRtl)}</p>
        <div className="flex items-center gap-1.5" aria-hidden>
          {questions.map((item, position) => (
            <span
              key={item.id}
              className={`h-1.5 w-4 rounded-full ${
                position < index ? 'bg-[var(--t-accent)]' : position === index ? 'bg-[var(--t-accent)]/60' : 'bg-[color-mix(in_srgb,var(--t-ink)_16%,transparent)]'
              }`}
            />
          ))}
        </div>
        <span className="font-mono text-[0.68rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]" dir="ltr">
          {index + 1}/{questions.length}
        </span>
      </div>

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

      <div role="radiogroup" aria-label={isRtl ? 'الخيارات' : 'Answer options'} className="space-y-2">
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
        <p className="rounded-xl bg-[color-mix(in_srgb,var(--t-sun)_14%,transparent)] px-3 py-2 text-xs text-[var(--t-ink)]">
          <strong className="font-bold">{pick(strings.hint, isRtl)}: </strong>
          {question.hint}
        </p>
      )}

      {checked && (
        <div className="space-y-2 rounded-xl border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] px-3 py-2.5">
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

      <div className="flex flex-wrap items-center gap-2">
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
              <button
                type="button"
                onClick={() => setHintOpen(true)}
                className="teach-btn teach-btn-secondary"
              >
                {pick(strings.hint, isRtl)}
              </button>
            )}
          </>
        ) : (
          <button type="button" onClick={next} className="teach-btn teach-btn-primary border-0">
            {pick(strings.next, isRtl)}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Which questions the practice card draws.
 *
 * Kept out of the component so the rules can be checked without a browser
 * (`npm run qa:practice`): a mixed set should reach across courses, a review set
 * should hold only real misses, and neither may hand back a question the bank
 * does not have.
 */
import { LESSONS, type LessonKey } from './courseGraph';
import type { ProgressV1 } from './progress';
import type { Question } from './questions';

export type PracticeMode = 'mixed' | 'review';

/** Four is the point where a card still feels like one sitting. */
export const PRACTICE_SET_SIZE = 4;

/** Every question the learner has got wrong, in no particular order. */
export function missedQuestionIds(lessons: ProgressV1['lessons']): string[] {
  const ids: string[] = [];
  for (const [key, entry] of Object.entries(lessons)) {
    if (!LESSONS[key as LessonKey]) continue;
    for (const [id, verdict] of Object.entries(entry?.checks ?? {})) {
      if (verdict === 'wrong') ids.push(id);
    }
  }
  return ids;
}

/** Lessons the learner has opened, in course order, ignoring unknown keys. */
export function openedLessonKeys(lessons: ProgressV1['lessons']): LessonKey[] {
  return Object.keys(lessons).filter((key): key is LessonKey => Boolean(LESSONS[key as LessonKey]));
}

export interface PracticeQueueArgs {
  bank: Record<string, Question>;
  lessons: ProgressV1['lessons'];
  /** Bumped for “New set”, so the same learner gets a different draw. */
  round: number;
  mode: PracticeMode;
  size?: number;
}

export function pickPracticeQuestions({ bank, lessons, round, mode, size = PRACTICE_SET_SIZE }: PracticeQueueArgs): Question[] {
  if (mode === 'review') {
    const missed = missedQuestionIds(lessons);
    // Shuffle the queue so the same pair never leads twice in a row.
    return [...missed]
      .filter((id, position) => bank[id] && missed.indexOf(id) === position)
      .sort((a, b) => ((a.charCodeAt(0) * 31 + round) % 97) - ((b.charCodeAt(0) * 31 + round) % 97))
      .slice(0, size)
      .map((id) => bank[id]);
  }

  const opened = openedLessonKeys(lessons);
  // Warm up on lessons already visited; otherwise sample the whole map.
  const pool = (opened.length ? opened : (Object.keys(LESSONS) as LessonKey[])).flatMap((key) =>
    LESSONS[key].questionIds.filter((id) => bank[id]).map((id) => ({ key, id })),
  );
  if (!pool.length) return [];

  // Deterministic shuffle so the set is stable across re-renders, fresh per round.
  const ordered = [...pool]
    .map((item, position) => ({ item, sort: ((position + 1) * 2654435761 + round * 40503) % 104729 }))
    .sort((a, b) => a.sort - b.sort)
    .map((entry) => entry.item);

  const chosen = new Map<string, Question>();
  const lessonKeys = new Set<string>();
  const courses = new Set<string>();
  // Pass 1: a different course per question. Pass 2: relax that, keep lessons distinct.
  for (const strict of [true, false]) {
    for (const candidate of ordered) {
      if (chosen.size >= size) break;
      const { course } = LESSONS[candidate.key];
      if (lessonKeys.has(candidate.key) || chosen.has(candidate.id)) continue;
      if (strict && courses.has(course)) continue;
      lessonKeys.add(candidate.key);
      courses.add(course);
      chosen.set(candidate.id, bank[candidate.id]);
    }
    if (chosen.size >= size) break;
  }
  return [...chosen.values()];
}

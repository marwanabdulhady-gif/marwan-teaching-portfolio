/**
 * The GMAT question bank: two items for every one of the 38 topics, merged into
 * one lookup keyed by question id. Kept in its own lazy chunk, like the authored
 * course bank, so it never enters the initial bundle.
 */
import type { Question } from '../questions';
import { GMAT_QUANT_QUESTIONS } from './gmatQuestions.quant';
import { GMAT_DI_QUESTIONS } from './gmatQuestions.di';

const ALL: Question[] = [...GMAT_QUANT_QUESTIONS, ...GMAT_DI_QUESTIONS];

export const GMAT_BANK: Record<string, Question> = Object.fromEntries(ALL.map((question) => [question.id, question]));

/** The ids for one topic, in order (`gmat/percent-fundamentals::q1`, …). */
export function gmatQuestionIds(slug: string): string[] {
  return ALL.filter((question) => question.id.startsWith(`gmat/${slug}::`)).map((question) => question.id);
}

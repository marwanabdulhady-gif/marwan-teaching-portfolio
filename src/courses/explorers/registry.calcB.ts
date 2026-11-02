/** Grade 12 Calculus · Chapter 2 explorers. */
import type { ExplorerRegistry } from './types';

export const entries: ExplorerRegistry = {
  'grade-12-calculus/2-1': () => import('./calcB/SecantToTangent'),
  'grade-12-calculus/2-2-2-3': () => import('./calcB/RulesLab'),
  'grade-12-calculus/piecewise-differentiability': () => import('./calcA/CornerTest'),
  'grade-12-calculus/2-4': () => import('./calcB/ChainGears'),
  'grade-12-calculus/2-5': () => import('./calcB/ImplicitTangent'),
  'grade-12-calculus/2-6': () => import('./calcB/RelatedRates'),
  'grade-12-calculus/chapter-2-review': () => import('./calcB/DerivativeMatch'),
};

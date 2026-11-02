/** Grade 12 Calculus · Chapter P and Chapter 1 explorers. */
import type { ExplorerRegistry } from './types';

export const entries: ExplorerRegistry = {
  'grade-12-calculus/p1': () => import('./calcA/InterceptsSymmetry'),
  'grade-12-calculus/p3': () => import('./calcA/PiecewiseBuilder'),
  'grade-12-calculus/1-2': () => import('./calcA/LimitApproach'),
  'grade-12-calculus/1-3': () => import('./calcA/CancelFactor'),
  'grade-12-calculus/1-4': () => import('./calcA/ContinuityChecker'),
  'grade-12-calculus/1-5': () => import('./calcA/InfiniteLimit'),
  'grade-12-calculus/chapter-1-review': () => import('./calcA/LimitMatch'),
};

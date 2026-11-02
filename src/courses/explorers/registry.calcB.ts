/** Grade 12 Calculus · Chapter 2 explorers. */
import type { ExplorerRegistry } from './types';

export const entries: ExplorerRegistry = {
  'grade-12-calculus/2-1': () => import('./calcB/SecantToTangent'),
};

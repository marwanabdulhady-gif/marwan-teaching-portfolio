/** Grade 11 Precalculus explorers. */
import type { ExplorerRegistry } from './types';

export const entries: ExplorerRegistry = {
  'grade-11-precalculus/1-1': () => import('./pre/RealNumbers'),
  'grade-11-precalculus/1-3': () => import('./pre/AreaModel'),
  'grade-11-precalculus/1-4': () => import('./pre/RationalHole'),
  'grade-11-precalculus/1-8': () => import('./pre/InequalityLine'),
  'grade-11-precalculus/1-9': () => import('./pre/CircleBuilder'),
  'grade-11-precalculus/2-1': () => import('./pre/VerticalLineTest'),
  'grade-11-precalculus/2-2': () => import('./pre/DomainRange'),
  'grade-11-precalculus/2-3': () => import('./pre/ReadTheGraph'),
  'grade-11-precalculus/2-6': () => import('./pre/Transformations'),
  'grade-11-precalculus/3-1': () => import('./pre/InverseCheck'),
  'grade-11-precalculus/3-2': () => import('./pre/ParentFamilies'),
  'grade-11-precalculus/3-3': () => import('./pre/RationalAsymptotes'),
  'grade-11-precalculus/4-3': () => import('./pre/GrowthDecay'),
  'grade-11-precalculus/5-1': () => import('./pre/ExpLogWorld'),
  'grade-11-precalculus/5-3': () => import('./pre/SolveByGraph'),
  'grade-11-precalculus/5-4': () => import('./pre/TrigCarousel'),
  'grade-11-precalculus/5-5': () => import('./pre/SolveTriangle'),
  'grade-11-precalculus/6-2': () => import('./pre/MatrixFlip'),
};

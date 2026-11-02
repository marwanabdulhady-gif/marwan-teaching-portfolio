/** Algebra 2 explorers: new labs, plus the strongest matches from the older courses. */
import type { ExplorerRegistry } from './types';

export const entries: ExplorerRegistry = {
  'algebra-2/1-1': () => import('./pre/Transformations'),
  'algebra-2/1-2': () => import('./pre/InverseCheck'),
  'algebra-2/1-3': () => import('./alg/AbsoluteLab'),
  'algebra-2/1-4': () => import('./calcA/PiecewiseBuilder'),
  'algebra-2/2-1': () => import('./alg/ParabolaLab'),
  'algebra-2/2-2': () => import('./alg/ParabolaLab'),
  'algebra-2/2-3': () => import('./alg/ComplexLab'),
  'algebra-2/2-4': () => import('./alg/ParabolaLab'),
  'algebra-2/3-1': () => import('./pre/ParentFamilies'),
  'algebra-2/3-2': () => import('./alg/PolyDivisionLab'),
  'algebra-2/3-3': () => import('./pre/RationalAsymptotes'),
  'algebra-2/3-4': () => import('./pre/RationalHole'),
  'algebra-2/4-1': () => import('./pre/GrowthDecay'),
  'algebra-2/4-2': () => import('./pre/ExpLogWorld'),
  'algebra-2/4-3': () => import('./alg/SequenceLab'),
};

/** Algebra 1 explorers. */
import type { ExplorerRegistry } from './types';

export const entries: ExplorerRegistry = {
  'algebra-1/1-1': () => import('./alg/ExpressionLab'),
  'algebra-1/1-2': () => import('./alg/ExpressionLab'),
  'algebra-1/1-3': () => import('./alg/BalanceLab'),
  'algebra-1/1-4': () => import('./alg/BalanceLab'),
  'algebra-1/2-1': () => import('./alg/LineLab'),
  'algebra-1/2-2': () => import('./alg/LineLab'),
  'algebra-1/2-3': () => import('./alg/LineLab'),
  'algebra-1/2-4': () => import('./alg/LineLab'),
  'algebra-1/2-5': () => import('./pre/InequalityLine'),
  'algebra-1/3-1': () => import('./alg/SystemLab'),
  'algebra-1/3-2': () => import('./alg/BalanceLab'),
  'algebra-1/3-3': () => import('./alg/SystemLab'),
  'algebra-1/3-4': () => import('./alg/FunctionLab'),
  'algebra-1/4-1': () => import('./alg/ExponentLab'),
  'algebra-1/4-2': () => import('./pre/AreaModel'),
  'algebra-1/4-3': () => import('./alg/FactorLab'),
  'algebra-1/4-4': () => import('./alg/FactorLab'),
  'algebra-1/5-1': () => import('./alg/ScatterLab'),
  'algebra-1/5-2': () => import('./alg/ScatterLab'),
};

/**
 * GMAT explorers — all 38 topics, keyed `gmat/<slug>` like every other lesson.
 * Ten labs were built for the GMAT's own patterns; the rest reuse the algebra
 * lab that already draws the same idea.
 */
import type { ExplorerRegistry } from './types';

const gmat: ExplorerRegistry = {
  // quantitative
  'gmat/absolute-value': () => import('./gmat/NumberLineLab'),
  'gmat/algebraic-fractions': () => import('./gmat/ModelLab'),
  'gmat/averages': () => import('./gmat/StatsLab'),
  'gmat/counting': () => import('./gmat/CountingLab'),
  'gmat/exponents': () => import('./gmat/ModelLab'),
  'gmat/expressions': () => import('./gmat/ModelLab'),
  'gmat/factoring': () => import('./gmat/ModelLab'),
  'gmat/fractions': () => import('./gmat/PercentLab'),
  'gmat/functions': () => import('./gmat/ModelLab'),
  'gmat/inequalities': () => import('./gmat/ModelLab'),
  'gmat/integers': () => import('./gmat/NumberLineLab'),
  'gmat/mixtures': () => import('./gmat/PercentLab'),
  'gmat/number-line': () => import('./gmat/NumberLineLab'),
  'gmat/overlapping-sets': () => import('./gmat/SetsLab'),
  'gmat/parity': () => import('./gmat/NumberLineLab'),
  'gmat/percent-fundamentals': () => import('./gmat/PercentLab'),
  'gmat/probability': () => import('./gmat/SetsLab'),
  'gmat/quadratics': () => import('./gmat/ModelLab'),
  'gmat/rates-work': () => import('./gmat/RateLab'),
  'gmat/remainders': () => import('./gmat/RemainderLab'),
  'gmat/sequences': () => import('./gmat/RemainderLab'),
  'gmat/statistics': () => import('./gmat/StatsLab'),
  'gmat/systems': () => import('./gmat/ModelLab'),
  'gmat/word-problems': () => import('./gmat/RateLab'),
  // data insights
  'gmat/di-mixed': () => import('./gmat/TableLab'),
  'gmat/ds-algebra': () => import('./gmat/SufficiencyLab'),
  'gmat/ds-number-properties': () => import('./gmat/SufficiencyLab'),
  'gmat/ds-yes-no': () => import('./gmat/SufficiencyLab'),
  'gmat/graphics-axes': () => import('./gmat/ChartLab'),
  'gmat/graphics-pie': () => import('./gmat/ChartLab'),
  'gmat/graphics-scatter': () => import('./gmat/ChartLab'),
  'gmat/msr-conflicts': () => import('./gmat/TableLab'),
  'gmat/multi-source-reasoning': () => import('./gmat/TableLab'),
  'gmat/multi-source-synthesis': () => import('./gmat/TableLab'),
  'gmat/table-derived': () => import('./gmat/TableLab'),
  'gmat/two-part-analysis': () => import('./gmat/TableLab'),
  'gmat/two-part-constraints': () => import('./gmat/TableLab'),
  'gmat/two-part-tables': () => import('./gmat/TableLab'),
};

export const entries = gmat;

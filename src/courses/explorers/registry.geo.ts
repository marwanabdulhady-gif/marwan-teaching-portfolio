/** Geometry explorers. */
import type { ExplorerRegistry } from './types';

export const entries: ExplorerRegistry = {
  'geometry/1-1': () => import('./geo/PointsLab'),
  'geometry/1-2': () => import('./geo/AngleLab'),
  'geometry/1-3': () => import('./geo/PointsLab'),
  'geometry/1-4': () => import('./geo/TransformLab'),
  'geometry/2-1': () => import('./geo/TriangleLab'),
  'geometry/2-2': () => import('./geo/TriangleLab'),
  'geometry/2-3': () => import('./geo/TriangleLab'),
  'geometry/2-4': () => import('./geo/TriangleLab'),
  'geometry/2-5': () => import('./pre/SolveTriangle'),
  'geometry/3-1': () => import('./geo/CircleLab'),
  'geometry/3-2': () => import('./geo/MeasureLab'),
  'geometry/3-3': () => import('./geo/CircleLab'),
  'geometry/3-4': () => import('./geo/MeasureLab'),
  'geometry/4-1': () => import('./pre/CircleBuilder'),
  'geometry/4-2': () => import('./geo/TransformLab'),
  'geometry/4-3': () => import('./geo/MeasureLab'),
};

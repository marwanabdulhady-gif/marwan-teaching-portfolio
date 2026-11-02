/**
 * Explorer registry. One lazily-imported component per lesson, split into
 * three files so parallel work packages never touch the same file.
 */
import type { ExplorerLoader, ExplorerRegistry } from './types';
import { entries as pre } from './registry.pre';
import { entries as calcA } from './registry.calcA';
import { entries as calcB } from './registry.calcB';
import { entries as alg1 } from './registry.alg1';
import { entries as alg2 } from './registry.alg2';
import { entries as geo } from './registry.geo';

export const EXPLORERS: ExplorerRegistry = { ...pre, ...calcA, ...calcB, ...alg1, ...alg2, ...geo };

export const EXPLORER_KEYS = Object.keys(EXPLORERS);

export const hasExplorer = (lessonKey: string): boolean => lessonKey in EXPLORERS;

export function explorerFor(lessonKey: string): ExplorerLoader | null {
  return EXPLORERS[lessonKey] ?? null;
}

export type { ExplorerLoader, ExplorerProps, ExplorerRegistry } from './types';

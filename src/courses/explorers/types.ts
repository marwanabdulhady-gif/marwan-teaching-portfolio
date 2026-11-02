import type { ComponentType } from 'react';
import type { LessonNode } from '../courseGraph';

/** Every explorer implements this contract (see the Courses plan, §7.2). */
export interface ExplorerProps {
  lesson: LessonNode;
  /** Call once, on the first interaction: credits "explorer used" progress. */
  onInteract: () => void;
}

export type ExplorerLoader = () => Promise<{ default: ComponentType<ExplorerProps> }>;
export type ExplorerRegistry = Record<string, ExplorerLoader>;

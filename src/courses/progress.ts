/**
 * Local-only progress for the /courses learning map.
 *
 * One store (localStorage `marwan:progress:v1` + an in-memory fallback) shared
 * by the map, the continue strip and the lesson panel. No accounts, no server.
 *
 * Completion of a lesson (0–100):
 *   opened 20 + explorer touched 20 + 60 × (distinct correct answers ÷ questions)
 * A lesson with no questions scores 40 for opening it and 60 for the explorer.
 */
import { useSyncExternalStore } from 'react';
import { LESSONS, type LessonKey } from './courseGraph';

export const PROGRESS_KEY = 'marwan:progress:v1';
const LEGACY_SAMPLER_KEY = 'marwan:sampler:mastery';
const EVENT = 'marwan:progress';

export type Mastery = 'review' | 'practice' | 'confident';
export type NodeState = 'new' | 'started' | 'done' | 'confident';

export interface LessonProgress {
  /** epoch ms of the first open */
  opened?: number;
  /** true after the first explorer interaction */
  explorer?: boolean;
  /** latest answer per question id */
  checks: Record<string, 'right' | 'wrong'>;
  mastery?: Mastery;
  updated: number;
}

export interface ProgressV1 {
  version: 1;
  lessons: Record<LessonKey, LessonProgress>;
  last?: { key: LessonKey; ts: number };
  gmat: Record<string, { opened: number }>;
}

const EMPTY: ProgressV1 = { version: 1, lessons: {}, gmat: {} };

const isMastery = (value: unknown): value is Mastery =>
  value === 'review' || value === 'practice' || value === 'confident';

/**
 * The legacy sampler stored `{ [questionId]: mastery }`. Map those onto the
 * lesson that owns each question. The legacy key is never deleted.
 */
function migrateLegacy(state: ProgressV1): ProgressV1 {
  let raw: Record<string, string> | null = null;
  try {
    raw = JSON.parse(localStorage.getItem(LEGACY_SAMPLER_KEY) || 'null');
  } catch {
    raw = null;
  }
  if (!raw || typeof raw !== 'object') return state;

  const owners = new Map<string, LessonKey>();
  for (const lesson of Object.values(LESSONS)) {
    for (const questionId of lesson.questionIds) owners.set(questionId, lesson.key);
  }

  let changed = false;
  const lessons = { ...state.lessons };
  for (const [questionId, level] of Object.entries(raw)) {
    const key = owners.get(questionId);
    if (!key || !isMastery(level)) continue;
    const current = lessons[key];
    if (current?.mastery === level) continue;
    lessons[key] = {
      checks: current?.checks ?? {},
      ...current,
      mastery: level,
      updated: Date.now(),
    };
    changed = true;
  }
  return changed ? { ...state, version: 1, lessons } : state;
}

function load(): ProgressV1 {
  let stored: ProgressV1 | null = null;
  try {
    const text = localStorage.getItem(PROGRESS_KEY);
    if (text) {
      const parsed = JSON.parse(text) as ProgressV1;
      if (parsed && parsed.version === 1 && parsed.lessons && parsed.gmat) stored = parsed;
    }
  } catch {
    stored = null; // private mode / corrupt payload: start clean in memory
  }
  const base: ProgressV1 = stored
    ? { ...stored, lessons: { ...stored.lessons }, gmat: { ...stored.gmat } }
    : { ...EMPTY, lessons: {}, gmat: {} };
  try {
    return migrateLegacy(base);
  } catch {
    return base;
  }
}

let state: ProgressV1 = load();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
  window.dispatchEvent(new Event(EVENT));
}

function commit(next: ProgressV1) {
  state = next;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  } catch {
    // storage full or blocked: the in-memory copy still drives this tab
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === PROGRESS_KEY) {
      state = load();
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

const getSnapshot = () => state;

function touch(state: ProgressV1, key: LessonKey, patch: Partial<LessonProgress>): ProgressV1 {
  const current = state.lessons[key];
  return {
    ...state,
    lessons: {
      ...state.lessons,
      [key]: {
        checks: {},
        ...current,
        ...patch,
        updated: Date.now(),
      },
    },
  };
}

export function completionOf(progress: ProgressV1, key: LessonKey): number {
  const lesson = LESSONS[key];
  if (!lesson) return 0;
  const entry = progress.lessons[key];
  if (!entry) return 0;
  const openedScore = lesson.questionIds.length === 0 ? (entry.opened ? 40 : 0) : entry.opened ? 20 : 0;
  const explorerScore = entry.explorer ? (lesson.questionIds.length === 0 ? 60 : 20) : 0;
  if (lesson.questionIds.length === 0) return Math.min(100, openedScore + explorerScore);
  const right = lesson.questionIds.filter((id) => entry.checks?.[id] === 'right').length;
  const practice = Math.round((right / lesson.questionIds.length) * 60);
  return Math.min(100, openedScore + explorerScore + practice);
}

export function nodeStateOf(progress: ProgressV1, key: LessonKey): NodeState {
  const entry = progress.lessons[key];
  if (entry?.mastery === 'confident') return 'confident';
  const completion = completionOf(progress, key);
  if (completion >= 100) return 'done';
  return completion > 0 ? 'started' : 'new';
}

const api = {
  get state() {
    return state;
  },
  completion: (key: LessonKey) => completionOf(state, key),
  nodeState: (key: LessonKey) => nodeStateOf(state, key),
  reached: (key: LessonKey) => Boolean(state.lessons[key]?.opened),
  markOpened(key: LessonKey) {
    const lesson = LESSONS[key];
    if (!lesson) return;
    // A GMAT topic is opened through the map, the gallery or a tile; all three
    // routes must move the same ring, so the open is mirrored into `gmat`.
    const gmat = lesson.course === 'gmat' && !state.gmat[lesson.id] ? { ...state.gmat, [lesson.id]: { opened: Date.now() } } : state.gmat;
    const current = state.lessons[key];
    if (current?.opened) {
      commit({ ...state, gmat, last: { key, ts: Date.now() } });
      return;
    }
    commit({ ...touch(state, key, { opened: Date.now() }), gmat, last: { key, ts: Date.now() } });
  },
  markExplorer(key: LessonKey) {
    if (state.lessons[key]?.explorer) return;
    commit(touch(state, key, { explorer: true }));
  },
  answer(key: LessonKey, questionId: string, correct: boolean) {
    const current = state.lessons[key];
    const checks = { ...(current?.checks ?? {}), [questionId]: correct ? ('right' as const) : ('wrong' as const) };
    commit(touch(state, key, { checks }));
  },
  setMastery(key: LessonKey, mastery: Mastery | undefined) {
    commit(touch(state, key, { mastery }));
  },
  markGmat(slug: string) {
    if (state.gmat[slug]?.opened) return;
    commit({ ...state, gmat: { ...state.gmat, [slug]: { opened: Date.now() } } });
  },
  reset() {
    commit({ ...EMPTY, lessons: {}, gmat: {} });
  },
};

export type ProgressApi = typeof api;

export function useProgress(): ProgressApi & { state: ProgressV1 } {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return api as ProgressApi & { state: ProgressV1 };
}

/** Non-hook read for event handlers outside React. */
export const progress = api;

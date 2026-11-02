/**
 * Cross-component hand-off: something outside the course map (the search
 * palette, a visual-model card) asks for a lesson panel to open. The request is
 * kept so it still lands if the courses view has not mounted yet.
 */
import { afterPageMount, scrollToSection } from '../router';
import type { LessonKey } from './courseGraph';

export const OPEN_LESSON_EVENT = 'marwan:open-lesson';

let pending: LessonKey | null = null;

export function requestLesson(key: LessonKey) {
  pending = key;
  window.dispatchEvent(new CustomEvent(OPEN_LESSON_EVENT, { detail: { key } }));
}

export function takePendingLesson(): LessonKey | null {
  const key = pending;
  pending = null;
  return key;
}

/**
 * Open a lesson panel from anywhere on the site: switch to /courses if needed,
 * then let the courses experience pick the request up.
 */
export function openLessonEverywhere(key: LessonKey) {
  afterPageMount('/courses', () => {
    requestLesson(key);
    scrollToSection('resources');
  });
}

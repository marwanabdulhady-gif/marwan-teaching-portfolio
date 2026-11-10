import { COURSES, LESSONS } from './courseGraph';

/**
 * Headline numbers for the courses, counted from the course graph so the
 * summaries around the site can never drift from what is actually there.
 */
const schoolCourses = COURSES.filter((course) => course.id !== 'gmat');
const count = (courses: typeof COURSES) =>
  courses.reduce((n, course) => n + course.chapters.reduce((m, chapter) => m + chapter.lessons.length, 0), 0);

export const COURSE_STATS = {
  /** School courses (Algebra 1 … Calculus); GMAT is counted separately. */
  courses: schoolCourses.length,
  lessons: count(schoolCourses),
  gmatTopics: count(COURSES) - count(schoolCourses),
  questions: Object.values(LESSONS).reduce((n, lesson) => n + lesson.questionIds.length, 0),
};

/** Format a count in the reader's digits (Arabic-Indic in Arabic). */
export const num = (n: number, isRtl: boolean) => n.toLocaleString(isRtl ? 'ar-EG' : 'en', { useGrouping: false });

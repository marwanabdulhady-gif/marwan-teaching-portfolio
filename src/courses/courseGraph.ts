/**
 * The course graph: the single description of what the /courses learning map
 * draws. Built from the lessons the academy app already ships, so titles and
 * order never drift away from `src/academyData.ts`.
 *
 * Generated data (do not edit by hand — run `python3 scripts/build-course-index.py`):
 *   data/questionIndex.json  lesson key -> question ids
 *   data/lessonTopics.json   lesson key -> English topics
 */
import { ACADEMY_LESSONS } from '../academyData';
import type { Bi } from '../teachingData';
import questionIndex from './data/questionIndex.json';
import lessonTopics from './data/lessonTopics.json';
import topicsAr from './data/topics.ar.json';

export type CourseId = 'calculus' | 'precalculus' | 'gmat';
export type CourseSlug = 'grade-12-calculus' | 'grade-11-precalculus';
/** `${courseSlug}/${lessonId}`, e.g. `grade-12-calculus/2-4`. */
export type LessonKey = string;
export type NodeShape = 'circle' | 'diamond' | 'hexagon';

export interface LessonNode {
  key: LessonKey;
  course: CourseId;
  courseSlug: CourseSlug;
  id: string;
  code: string;
  title: Bi;
  topics: Bi[];
  shape: NodeShape;
  chapterId: string;
  /** Position inside the whole course (0-based). */
  order: number;
  href: string;
  questionIds: string[];
  hasExplorer: boolean;
}

export interface Chapter {
  id: string;
  title: Bi;
  lessons: LessonKey[];
}

export interface Course {
  id: CourseId;
  title: Bi;
  /** Short label for the switcher pill. */
  short: Bi;
  chapters: Chapter[];
  /** Total lessons (or topics, for GMAT). */
  count: number;
}

const CALCULUS: CourseSlug = 'grade-12-calculus';
const PRECALCULUS: CourseSlug = 'grade-11-precalculus';

/** Chapter layout. Lesson ids match `ACADEMY_LESSONS[].id`. */
const CHAPTER_LAYOUT: { slug: CourseSlug; chapters: { id: string; title: Bi; lessonIds: string[] }[] }[] = [
  {
    slug: CALCULUS,
    chapters: [
      {
        id: 'p',
        title: { en: 'Chapter P · Preparation for Calculus', ar: 'الفصل P · التهيئة للتفاضل والتكامل' },
        lessonIds: ['p1', 'p3'],
      },
      {
        id: '1',
        title: { en: 'Chapter 1 · Limits and Their Properties', ar: 'الفصل ١ · النهايات وخواصها' },
        lessonIds: ['1-2', '1-3', '1-4', '1-5', 'chapter-1-review'],
      },
      {
        id: '2',
        title: { en: 'Chapter 2 · Differentiation', ar: 'الفصل ٢ · الاشتقاق' },
        lessonIds: ['2-1', '2-2-2-3', 'piecewise-differentiability', '2-4', '2-5', '2-6', 'chapter-2-review'],
      },
    ],
  },
  {
    slug: PRECALCULUS,
    chapters: [
      {
        id: '1',
        title: { en: 'Chapter 1 · Fundamentals', ar: 'الفصل ١ · الأساسيات' },
        lessonIds: ['pc-1-1', 'pc-1-3', 'pc-1-4', 'pc-1-8', 'pc-1-9'],
      },
      {
        id: '2',
        title: { en: 'Chapter 2 · Functions and Graphs', ar: 'الفصل ٢ · الدوال والتمثيلات البيانية' },
        lessonIds: ['pc-2-1', 'pc-2-2', 'pc-2-3', 'pc-2-6'],
      },
    ],
  },
];

/** Review pages get a diamond, the piecewise extension a hexagon. */
function shapeFor(id: string): NodeShape {
  if (id.includes('review')) return 'diamond';
  if (id === 'piecewise-differentiability') return 'hexagon';
  return 'circle';
}

const QUESTIONS = questionIndex as Record<string, string[]>;
const TOPICS_EN = lessonTopics as Record<string, string[]>;
const TOPICS_AR = topicsAr as Record<string, string[]>;

/** Lesson keys that have a hands-on explorer (kept in sync with the registry). */
const EXPLORER_KEYS = new Set<string>([
  'grade-11-precalculus/2-6',
  'grade-12-calculus/2-1',
]);

const LESSONS: Record<LessonKey, LessonNode> = {};
const COURSES: Course[] = [];

for (const layout of CHAPTER_LAYOUT) {
  const courseId: CourseId = layout.slug === CALCULUS ? 'calculus' : 'precalculus';
  const academyCourse = ACADEMY_LESSONS.find((lesson) => lesson.courseSlug === layout.slug);
  const chapters: Chapter[] = [];
  let order = 0;

  for (const chapter of layout.chapters) {
    const keys: LessonKey[] = [];
    for (const lessonId of chapter.lessonIds) {
      const academy = ACADEMY_LESSONS.find(
        (lesson) => lesson.courseSlug === layout.slug && lesson.id === lessonId,
      );
      if (!academy) {
        if (import.meta.env.DEV) console.warn(`courseGraph: unknown lesson ${layout.slug}/${lessonId}`);
        continue;
      }
      const key = `${layout.slug}/${academy.id}`;
      const en = TOPICS_EN[key] ?? [];
      const ar = TOPICS_AR[key] ?? [];
      LESSONS[key] = {
        key,
        course: courseId,
        courseSlug: layout.slug,
        id: academy.id,
        code: academy.code,
        title: academy.title,
        topics: en.map((topic, i) => ({ en: topic, ar: ar[i] ?? topic })),
        shape: shapeFor(academy.id),
        chapterId: chapter.id,
        order: order++,
        href: academy.href,
        questionIds: QUESTIONS[key] ?? [],
        hasExplorer: EXPLORER_KEYS.has(key),
      };
      keys.push(key);
    }
    chapters.push({ id: chapter.id, title: chapter.title, lessons: keys });
  }

  COURSES.push({
    id: courseId,
    title: academyCourse?.courseTitle ?? { en: 'Calculus', ar: 'التفاضل والتكامل' },
    short: courseId === 'calculus' ? { en: 'Calculus', ar: 'التفاضل' } : { en: 'Precalculus', ar: 'ما قبل التفاضل' },
    chapters,
    count: chapters.reduce((total, chapter) => total + chapter.lessons.length, 0),
  });
}

COURSES.push({
  id: 'gmat',
  title: { en: 'GMAT Quantitative & Data Insights', ar: 'GMAT الكمي وتحليل البيانات' },
  short: { en: 'GMAT', ar: 'GMAT' },
  chapters: [],
  count: 38,
});

export { COURSES, LESSONS };

/** Lessons inside one course, in map order. */
export const COURSE_LESSONS: Record<'calculus' | 'precalculus', LessonKey[]> = {
  calculus: COURSES[0].chapters.flatMap((chapter) => chapter.lessons),
  precalculus: COURSES[1].chapters.flatMap((chapter) => chapter.lessons),
};

export const lessonKeyOf = (courseSlug: string, id: string): LessonKey => `${courseSlug}/${id}`;

export const getLesson = (key: LessonKey | null | undefined): LessonNode | null =>
  key && LESSONS[key] ? LESSONS[key] : null;

export const lessonsOf = (course: CourseId): LessonKey[] =>
  course === 'gmat' ? [] : COURSE_LESSONS[course];

/** Which visual model on the page belongs to which lessons (§3.5). */
export const MODEL_LESSONS: Record<string, LessonKey[]> = {
  'visual-calculus': ['grade-12-calculus/2-1', 'grade-12-calculus/1-2'],
  'visual-precalculus': ['grade-11-precalculus/2-6'],
  'visual-featured': ['grade-11-precalculus/2-1', 'grade-11-precalculus/2-2'],
};

/** Prev/next inside the same course, following lesson order. */
export function neighbours(key: LessonKey): { prev: LessonNode | null; next: LessonNode | null } {
  const lesson = getLesson(key);
  if (!lesson) return { prev: null, next: null };
  const list = lessonsOf(lesson.course);
  const index = list.indexOf(key);
  return {
    prev: index > 0 ? LESSONS[list[index - 1]] : null,
    next: index >= 0 && index < list.length - 1 ? LESSONS[list[index + 1]] : null,
  };
}

/** Strip the origin and query from a link so it can be compared with `href`. */
const pathOf = (href: string): string => {
  try {
    return new URL(href, window.location.origin).pathname.replace(/\/+$/, '');
  } catch {
    return href;
  }
};

/** Find the lesson a static page URL belongs to (search results, model links). */
export function lessonKeyFromHref(href: string): LessonKey | null {
  const wanted = pathOf(href);
  for (const lesson of Object.values(LESSONS)) {
    if (pathOf(lesson.href) === wanted) return lesson.key;
  }
  return null;
}

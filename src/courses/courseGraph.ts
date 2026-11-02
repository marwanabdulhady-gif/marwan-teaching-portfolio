/**
 * The course graph: the single description of what the /courses learning map
 * draws.
 *
 * Two sources feed it:
 *   1. The lessons the academy app ships (Calculus, Precalculus). Titles come
 *      from `src/academyData.ts`; topics and question ids come from the
 *      generated files in `./data` (see `scripts/build-course-index.py`).
 *   2. The authored courses (Algebra 1, Algebra 2, Geometry), which have no
 *      static page: the lesson panel is the lesson. Each carries exactly
 *      `AUTHORED_QUESTIONS_PER_LESSON` questions with ids `<lessonKey>::q<n>`.
 */
import { ACADEMY_LESSONS } from '../academyData';
import type { Bi } from '../teachingData';
import questionIndex from './data/questionIndex.json';
import lessonTopics from './data/lessonTopics.json';
import topicsAr from './data/topics.ar.json';
import { ALGEBRA_1 } from './data/authored.algebra1';
import { ALGEBRA_2 } from './data/authored.algebra2';
import { GEOMETRY } from './data/authored.geometry';
import type { AuthoredCourse } from './data/authored.algebra1';
import { EXPLORER_KEYS as EXPLORER_LESSON_KEYS } from './explorers';
import { GMAT_TOPICS } from './gmatTopics';
import { GMAT_CONTENT } from './gmatContent';

export type CourseId = 'algebra1' | 'algebra2' | 'geometry' | 'precalculus' | 'calculus' | 'gmat';
export type CourseSlug = 'grade-12-calculus' | 'grade-11-precalculus' | string;
/** `${courseSlug}/${lessonId}`, e.g. `grade-12-calculus/2-4` or `algebra-1/2-3`. */
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
  /** Static lesson page, or '' for authored lessons (panel-only). */
  href: string;
  hasPage: boolean;
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
  /** Authored courses have no static pages; their ring counts done lessons. */
  authored?: boolean;
}

/** Every authored lesson carries this many questions. */
export const AUTHORED_QUESTIONS_PER_LESSON = 3;

const CALCULUS: CourseSlug = 'grade-12-calculus';
const PRECALCULUS: CourseSlug = 'grade-11-precalculus';

/** Chapter layout for the academy-shipped courses. */
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
const EXPLORER_KEYS = new Set<string>(EXPLORER_LESSON_KEYS);

const LESSONS: Record<LessonKey, LessonNode> = {};
const BY_ID: Record<string, Course> = {};

/* ---------------------------------------------------------------- academy */
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
      if (!academy) continue;
      // Static pages number their lessons `pc-1-1`; the generated topic and
      // question indexes (and the explorers) use the bare `1-1`, so the key
      // strips the course prefix. Getting this wrong silently detaches a whole
      // course from its questions.
      const id = academy.id.replace(/^pc-/, '');
      const key = `${layout.slug}/${id}`;
      const en = TOPICS_EN[key] ?? [];
      const ar = TOPICS_AR[key] ?? [];
      LESSONS[key] = {
        key,
        course: courseId,
        courseSlug: layout.slug,
        id,
        code: academy.code,
        title: academy.title,
        topics: en.map((topic, index) => ({ en: topic, ar: ar[index] ?? topic })),
        shape: shapeFor(id),
        chapterId: chapter.id,
        order: order++,
        href: academy.href,
        hasPage: true,
        questionIds: QUESTIONS[key] ?? [],
        hasExplorer: EXPLORER_KEYS.has(key),
      };
      keys.push(key);
    }
    chapters.push({ id: chapter.id, title: chapter.title, lessons: keys });
  }

  BY_ID[courseId] = {
    id: courseId,
    title: academyCourse?.courseTitle ?? { en: 'Calculus', ar: 'التفاضل والتكامل' },
    short: courseId === 'calculus' ? { en: 'Calculus', ar: 'التفاضل' } : { en: 'Precalculus', ar: 'ما قبل التفاضل' },
    chapters,
    count: chapters.reduce((total, chapter) => total + chapter.lessons.length, 0),
  };
}

/* --------------------------------------------------------------- authored */
function addAuthored(course: AuthoredCourse) {
  const chapters: Chapter[] = [];
  let order = 0;

  for (const chapter of course.chapters) {
    const keys: LessonKey[] = [];
    for (const lesson of chapter.lessons) {
      const key = `${course.slug}/${lesson.id}`;
      LESSONS[key] = {
        key,
        course: course.id,
        courseSlug: course.slug,
        id: lesson.id,
        code: lesson.code,
        title: lesson.title,
        topics: lesson.topics,
        shape: 'circle',
        chapterId: chapter.id,
        order: order++,
        href: '',
        hasPage: false,
        questionIds: Array.from(
          { length: AUTHORED_QUESTIONS_PER_LESSON },
          (_, index) => `${key}::q${index + 1}`,
        ),
        hasExplorer: EXPLORER_KEYS.has(key),
      };
      keys.push(key);
    }
    chapters.push({ id: chapter.id, title: chapter.title, lessons: keys });
  }

  BY_ID[course.id] = {
    id: course.id,
    title: course.title,
    short: course.short,
    chapters,
    count: chapters.reduce((total, chapter) => total + chapter.lessons.length, 0),
    authored: true,
  };
}

addAuthored(ALGEBRA_1);
addAuthored(ALGEBRA_2);
addAuthored(GEOMETRY);

/* ------------------------------------------------------------------ GMAT */
/**
 * GMAT topics are lessons too: they have a page (the iframe lesson), a lab, and
 * the two ideas the lab teaches. They carry no question set of their own — the
 * practice lives inside the page — so `questionIds` stays empty and the panel
 * shows the “practice is in the full lesson” note instead of a quiz.
 */
function addGmat() {
  const groups: { id: string; title: Bi; topics: typeof GMAT_TOPICS }[] = [
    {
      id: 'quant',
      title: { en: 'Quantitative Reasoning', ar: 'الاستدلال الكمي' },
      topics: GMAT_TOPICS.filter((topic) => topic.group === 'quant'),
    },
    {
      id: 'di',
      title: { en: 'Data Insights', ar: 'تحليل البيانات' },
      topics: GMAT_TOPICS.filter((topic) => topic.group === 'di'),
    },
  ];

  const chapters: Chapter[] = [];
  let order = 0;
  for (const group of groups) {
    const keys: LessonKey[] = [];
    for (const topic of group.topics) {
      const key = `gmat/${topic.slug}`;
      const content = GMAT_CONTENT[topic.slug];
      LESSONS[key] = {
        key,
        course: 'gmat',
        courseSlug: 'gmat-preparation',
        id: topic.slug,
        code: group.id === 'quant' ? `Q${keys.length + 1}` : `D${keys.length + 1}`,
        title: { en: topic.title, ar: topic.ar },
        topics: content?.ideas ?? [],
        shape: 'hexagon',
        chapterId: group.id,
        order: order++,
        href: topic.href,
        hasPage: true,
        questionIds: [],
        hasExplorer: EXPLORER_KEYS.has(key),
      };
      keys.push(key);
    }
    chapters.push({ id: group.id, title: group.title, lessons: keys });
  }

  BY_ID.gmat = {
    id: 'gmat',
    title: { en: 'GMAT Quantitative & Data Insights', ar: 'GMAT الكمي وتحليل البيانات' },
    short: { en: 'GMAT', ar: 'GMAT' },
    chapters,
    count: chapters.reduce((total, chapter) => total + chapter.lessons.length, 0),
  };
}

addGmat();

/** Display order: school courses by grade, then the exam course. */
export const COURSES: Course[] = [
  BY_ID.algebra1,
  BY_ID.algebra2,
  BY_ID.geometry,
  BY_ID.precalculus,
  BY_ID.calculus,
  BY_ID.gmat,
];

export { LESSONS };

export const getCourse = (id: CourseId): Course => BY_ID[id] ?? BY_ID.calculus;

export const lessonsOf = (course: CourseId): LessonKey[] =>
  getCourse(course).chapters.flatMap((chapter) => chapter.lessons);

/** Lessons inside each course, in map order. */
export const COURSE_LESSONS: Record<string, LessonKey[]> = Object.fromEntries(
  COURSES.map((course) => [course.id, lessonsOf(course.id)]),
);

export const lessonKeyOf = (courseSlug: string, id: string): LessonKey => `${courseSlug}/${id}`;

export const getLesson = (key: LessonKey | null | undefined): LessonNode | null =>
  key && LESSONS[key] ? LESSONS[key] : null;

/** Which visual models on the page belong to which lessons (§3.5). */
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
    if (lesson.hasPage && pathOf(lesson.href) === wanted) return lesson.key;
  }
  return null;
}

/** Every lesson in the app (used by mixed practice and the QA scripts). */
export const ALL_LESSON_KEYS = Object.keys(LESSONS);

export const COURSE_IDS = COURSES.map((course) => course.id);

export const isCourseId = (value: string | null): value is CourseId =>
  Boolean(value && (COURSE_IDS as string[]).includes(value));

/** Which lesson each question belongs to — the index mixed practice needs. */
export const QUESTION_OWNER: Record<string, LessonKey> = Object.fromEntries(
  Object.values(LESSONS).flatMap((lesson) => lesson.questionIds.map((id) => [id, lesson.key])),
);

/** The lesson a first-time visitor should start with. */
export const FIRST_LESSON: LessonKey = lessonsOf('algebra1')[0] ?? 'grade-12-calculus/p1';

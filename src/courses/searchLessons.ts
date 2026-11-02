/**
 * Search every lesson on the map, in both languages.
 *
 * The map has 111 nodes across six courses, which is past the point where
 * scrolling works: you remember the *name* of what you want, not which lane it
 * sat in. Ranking is deliberately simple and explainable:
 *
 *   1 exact code        "2.4", "q7"      the shortest way to a lesson
 *   2 title starts with  "chain"         most specific
 *   3 a word starts with "rule"          a word inside the title
 *   4 anything inside    "ay r"          substring (typos land here)
 *   5 topics            "tangent"        the key ideas a lesson covers
 *
 * Arabic is normalised first (diacritics, tatweel, alef/ya/ta variants), so
 * "الاشتقاق" and "الإشتقاق" find the same lesson.
 */
import { COURSES, LESSONS, type LessonKey } from './courseGraph';

/** Fold the differences a learner will not type consistently. */
export function normaliseQuery(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // diacritics + tatweel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/\s+/g, ' ')
    .trim();
}

const courseOrder = new Map(COURSES.map((course, index) => [course.id, index]));

interface Indexed {
  key: LessonKey;
  code: string;
  titles: string[];
  topics: string[];
  order: number;
}

let index: Indexed[] | null = null;

function lessonIndex(): Indexed[] {
  if (index) return index;
  index = Object.values(LESSONS).map((lesson) => ({
    key: lesson.key,
    code: normaliseQuery(lesson.code),
    titles: [normaliseQuery(lesson.title.en), normaliseQuery(lesson.title.ar)].filter(Boolean),
    topics: lesson.topics.flatMap((topic) => [normaliseQuery(topic.en), normaliseQuery(topic.ar)]).filter(Boolean),
    order: (courseOrder.get(lesson.course) ?? 0) * 1000 + lesson.order,
  }));
  return index;
}

function scoreOf(entry: Indexed, query: string): number {
  if (entry.code === query) return 100;
  let best = 0;
  for (const title of entry.titles) {
    if (title.startsWith(query)) best = Math.max(best, 70);
    else if (title.split(' ').some((word) => word.startsWith(query))) best = Math.max(best, 50);
    else if (title.includes(query)) best = Math.max(best, 30);
  }
  if (!best && entry.topics.some((topic) => topic.includes(query))) best = 10;
  return best;
}

/** Ranked lesson keys for a query; empty for an empty or one-letter query. */
export function searchLessons(query: string, limit = 8): LessonKey[] {
  const needle = normaliseQuery(query);
  if (needle.length < 2) return [];
  const hits: { key: LessonKey; score: number; order: number }[] = [];
  for (const entry of lessonIndex()) {
    const score = scoreOf(entry, needle);
    if (score > 0) hits.push({ key: entry.key, score, order: entry.order });
  }
  return hits
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, limit)
    .map((hit) => hit.key);
}

#!/usr/bin/env node
/**
 * Data QA for the learning map, with no browser and no dependencies.
 *
 *   node scripts/check-course-data.cjs
 *
 * It reads the source files as text (the same trick `build-course-index.py`
 * uses) and checks the invariants the UI relies on:
 *
 *   - every authored lesson has an explorer, and every explorer key exists
 *   - every authored lesson has exactly AUTHORED_QUESTIONS_PER_LESSON questions
 *   - no orphan question (an id whose lesson does not exist)
 *   - every question id inside a lesson points at a real question
 *   - every explorer module referenced by a registry exists on disk
 *
 * Exits 1 on the first broken invariant, so it can gate a commit.
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const errors = [];
const note = (message) => errors.push(message);

// ---------------------------------------------------------------- lessons
const authored = [
  ['src/courses/data/authored.algebra1.ts', 'algebra-1'],
  ['src/courses/data/authored.algebra2.ts', 'algebra-2'],
  ['src/courses/data/authored.geometry.ts', 'geometry'],
];

const lessonsOf = new Map();
for (const [file, slug] of authored) {
  const source = read(file);
  // Lesson entries are the only place a lesson gets a code and a title block.
  const ids = [...source.matchAll(/id:\s*'(\d+-\d+)',\s*\n\s*code:/g)].map((match) => match[1]);
  if (!ids.length) note(`${file}: no lessons found`);
  if (new Set(ids).size !== ids.length) note(`${file}: duplicate lesson ids`);
  lessonsOf.set(slug, ids);
}

const allLessons = [...lessonsOf.entries()].flatMap(([slug, ids]) => ids.map((id) => `${slug}/${id}`));

const perLesson = Number(
  (read('src/courses/courseGraph.ts').match(/AUTHORED_QUESTIONS_PER_LESSON\s*=\s*(\d+)/) ?? [])[1] ?? 0,
);
if (perLesson !== 3) note(`courseGraph: expected 3 questions per lesson, found ${perLesson}`);

// -------------------------------------------------------------- questions
const questionSource = read('src/courses/data/authoredQuestions.ts');
// Items are written as item(`${A1}/1-1`, 1, …) with A1/A2/G standing for the slugs.
const aliases = Object.fromEntries(
  [...questionSource.matchAll(/const (\w+) = '([a-z0-9-]+)';/g)].map((match) => [match[1], match[2]]),
);
const questionIds = [...questionSource.matchAll(/item\(\s*`\$\{(\w+)\}\/(\d+-\d+)`,\s*(\d+)/g)].map(
  (match) => `${aliases[match[1]] ?? match[1]}/${match[2]}::q${match[3]}`,
);
if (!questionIds.length) note('authoredQuestions: no questions found');

const owned = new Map();
for (const id of questionIds) {
  const [key, suffix] = id.split('::');
  if (!key || !suffix) {
    note(`question id is not <lessonKey>::q<n>: ${id}`);
    continue;
  }
  if (!allLessons.includes(key)) note(`orphan question: ${id}`);
  owned.set(key, (owned.get(key) ?? 0) + 1);
}

for (const key of allLessons) {
  const count = owned.get(key) ?? 0;
  if (count !== perLesson) note(`${key}: ${count} questions, expected ${perLesson}`);
}

// ---------------------------------------------------------------- GMAT
const gmatSource = read('src/courses/gmatTopics.ts');
const gmatSlugs = [...gmatSource.matchAll(/\{ slug: "([a-z0-9-]+)"/g)].map((match) => match[1]);
if (gmatSlugs.length !== 38) note(`gmatTopics: expected 38 topics, found ${gmatSlugs.length}`);
for (const slug of gmatSlugs) allLessons.push(`gmat/${slug}`);

const gmatContent = read('src/courses/gmatContent.ts');
// Keys appear both quoted ('absolute-value') and bare (averages, quadratics).
const contentSlugs = [...gmatContent.matchAll(/^ {2}'?([a-z0-9-]+)'?: \{\n?\s*lab:/gm)].map((match) => match[1]);
for (const slug of gmatSlugs) {
  if (!contentSlugs.includes(slug)) note(`gmatContent: no lab content for gmat/${slug}`);
}
for (const slug of contentSlugs) {
  if (!gmatSlugs.includes(slug)) note(`gmatContent: unknown topic ${slug}`);
}

// ------------------------------------------------- academy (iframe) lessons
const academySource = read('src/academyData.ts');
const academyLessons = [
  ...academySource.matchAll(/courseSlug:\s*'([a-z0-9-]+)'[\s\S]{0,400}?\n\s*\}\s*,\n/g),
];
// Simpler and stabler: walk the lesson blocks and pair id with courseSlug.
const academyKeys = [];
const academyBlocks = academySource
  .slice(academySource.indexOf('ACADEMY_LESSONS'), academySource.indexOf('EXTRA_SEARCH_ENTRIES'))
  .split('\n  {')
  .slice(1);
for (const block of academyBlocks) {
  const id = (block.match(/id:\s*'([^']+)'/) ?? [])[1];
  const slug = (block.match(/courseSlug:\s*'([^']+)'/) ?? [])[1];
  if (id && slug) academyKeys.push(`${slug}/${id.replace(/^pc-/, '')}`);
}
if (academyLessons.length === 0) note('academyData: no lessons found');

// -------------------------------------------------------------- explorers
const registryFiles = fs
  .readdirSync(path.join(root, 'src/courses/explorers'))
  .filter((name) => name.startsWith('registry.') && name.endsWith('.ts'));

const registered = new Map();
for (const file of registryFiles) {
  const source = read(`src/courses/explorers/${file}`);
  for (const match of source.matchAll(/'([a-z0-9-]+\/[^']+)':\s*\(\)\s*=>\s*import\('([^']+)'\)/g)) {
    const [, key, module] = match;
    registered.set(key, module);
    const target = `src/courses/explorers/${module.replace('./', '')}.tsx`;
    if (!fs.existsSync(path.join(root, target))) note(`${file}: ${key} imports missing ${target}`);
  }
}

// Authored lessons must all have a lab; academy lessons only need one where
// the registry says so.
for (const key of allLessons) {
  if (!registered.has(key)) note(`${key}: no explorer registered`);
}
const knownKeys = new Set([...allLessons, ...academyKeys]);
for (const key of registered.keys()) {
  if (!knownKeys.has(key)) note(`${key}: explorer registered for a lesson that does not exist`);
}

const explorerIndex = read('src/courses/explorers/index.ts');
for (const file of registryFiles) {
  const name = file.replace('registry.', '').replace('.ts', '');
  if (!explorerIndex.includes(`from './registry.${name}'`)) note(`explorers/index.ts does not import registry.${name}`);
}

// ------------------------------------------------------------------ report
if (errors.length) {
  console.error(`✗ ${errors.length} course-data problem${errors.length === 1 ? '' : 's'}:\n`);
  for (const message of errors) console.error(`  · ${message}`);
  process.exit(1);
}

const totals = [...lessonsOf.entries()].map(([slug, ids]) => `${slug}: ${ids.length}`).join(', ');
console.log('✓ course data is consistent');
console.log(`  lessons — ${totals} (${allLessons.length} total)`);
console.log(`  questions — ${questionIds.length} (${perLesson} per lesson)`);
console.log(`  gmat — ${gmatSlugs.length} topics, all with content`);
console.log(`  academy — ${academyKeys.length} static lessons`);
console.log(`  explorers — ${registered.size} keys across ${registryFiles.length} registries`);

// Coverage per course: every lesson in the school courses and every GMAT topic
// must have a lab, so the Labs gallery never shows an empty card.
const courses = ['algebra-1', 'algebra-2', 'geometry', 'gmat'];
const uncovered = courses.flatMap((slug) => {
  const lessons =
    slug === 'gmat' ? gmatSlugs.map((topic) => `gmat/${topic}`) : allLessons.filter((key) => key.startsWith(`${slug}/`));
  return lessons.filter((key) => !registered.has(key));
});
if (uncovered.length) {
  console.error(`✗ ${uncovered.length} lesson(s) without a lab: ${uncovered.join(', ')}`);
  process.exit(1);
}
console.log('  coverage — every authored lesson and GMAT topic has a lab');

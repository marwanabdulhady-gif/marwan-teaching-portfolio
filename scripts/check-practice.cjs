#!/usr/bin/env node
/**
 * Check the practice-queue rules without a browser.
 *
 *   npm run qa:practice
 *
 * `pickPracticeQuestions` decides what the mixed card shows, so its promises are
 * the kind that break quietly: a set that drifts to one course, a review queue
 * that includes a question the bank no longer has, a "New set" button that
 * redraws the same four. The logic is pure, so it is bundled with esbuild (the
 * same one Vite uses) and run against the real lesson graph.
 *
 * Scratch output goes to `<repo>/.qa-practice` and is removed afterwards.
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const work = path.join(root, '.qa-practice');

if (!fs.existsSync(path.join(root, 'node_modules', 'esbuild'))) {
  console.error('! esbuild is not installed — run `npm install` first.');
  process.exit(2);
}

const entry = `
import { LESSONS, COURSES } from '${root}/src/courses/courseGraph';
import { PRACTICE_SET_SIZE, missedQuestionIds, openedLessonKeys, pickPracticeQuestions } from '${root}/src/courses/practiceQueue';

const failures = [];
const check = (name, condition, detail) => {
  if (!condition) failures.push(name + (detail ? ': ' + detail : ''));
};

// A bank with every question the graph knows about, so nothing is filtered out.
// owner maps each id back to its lesson, which is what the assertions need
// (ids are not all of the form <lessonKey>::qN).
const bank = {};
const owner = {};
for (const lesson of Object.values(LESSONS)) {
  for (const id of lesson.questionIds) {
    owner[id] = lesson.key;
    bank[id] = { id, question: id, options: ['a', 'b', 'c', 'd'], correctIndex: 0, hint: '', explanation: '' };
  }
}
const total = Object.keys(bank).length;
const empty = {};
const entry = (checks) => ({ checks, updated: 0 });

// 1. A fresh visitor gets a full set from different courses.
const fresh = pickPracticeQuestions({ bank, lessons: empty, round: 0, mode: 'mixed' });
check('mixed: set size', fresh.length === PRACTICE_SET_SIZE, fresh.length + ' questions');
const freshCourses = new Set(fresh.map((q) => LESSONS[owner[q.id]].course));
check('mixed: one question per course', freshCourses.size === fresh.length, [...freshCourses].join(', '));
const freshLessons = new Set(fresh.map((q) => owner[q.id]));
check('mixed: one question per lesson', freshLessons.size === fresh.length);
check('mixed: ids come from the bank', fresh.every((q) => bank[q.id]));

// 2. Once lessons are opened, practice stays inside them.
const twoCourses = [COURSES[0].id, COURSES[2].id];
const openedLessons = Object.values(LESSONS).filter((lesson) => twoCourses.includes(lesson.course)).slice(0, 6);
const opened = Object.fromEntries(openedLessons.map((lesson) => [lesson.key, entry({})]));
check('opened: keys resolve', openedLessonKeys(opened).length === openedLessons.length);
const warmed = pickPracticeQuestions({ bank, lessons: opened, round: 0, mode: 'mixed' });
check('mixed: uses opened lessons only', warmed.every((q) => Boolean(opened[owner[q.id]])), warmed.map((q) => q.id).join(', '));

// 3. No misses means an empty review queue.
check('review: empty queue', pickPracticeQuestions({ bank, lessons: empty, round: 0, mode: 'review' }).length === 0);

// 4. Misses show up in review, capped and deduped.
const wrongIds = Object.values(LESSONS).flatMap((lesson) => lesson.questionIds).slice(0, 9);
const missed = {};
for (const [index, id] of wrongIds.entries()) {
  const key = owner[id];
  missed[key] = entry({ ...(missed[key]?.checks ?? {}), [id]: 'wrong' });
}
missed[owner[wrongIds[0]]].checks[wrongIds[1]] = 'wrong'; // a repeat must not double up
check('review: counts every miss once', new Set(missedQuestionIds(missed)).size === missedQuestionIds(missed).length);
const review = pickPracticeQuestions({ bank, lessons: missed, round: 1, mode: 'review' });
check('review: capped at a set', review.length === PRACTICE_SET_SIZE, review.length + ' questions');
check('review: only misses', review.every((q) => missedQuestionIds(missed).includes(q.id)));

// 5. Right answers and stale ids stay out of the queue.
const mostlyRight = {
  [owner[wrongIds[0]]]: entry({ [wrongIds[0]]: 'right', 'no-such-lesson::q1': 'wrong' }),
};
check(
  'review: ignores right answers and unknown lessons',
  pickPracticeQuestions({ bank, lessons: mostlyRight, round: 0, mode: 'review' }).length === 0,
);
const staleBankMiss = { [owner[wrongIds[0]]]: entry({ [wrongIds[0]]: 'wrong' }) };
const shrunk = { ...bank };
delete shrunk[wrongIds[0]];
check(
  'review: ignores ids the bank dropped',
  pickPracticeQuestions({ bank: shrunk, lessons: staleBankMiss, round: 0, mode: 'review' }).length === 0,
);

// 6. "New set" actually redraws.
const firsts = new Set();
for (let round = 0; round < 6; round += 1) {
  const set = pickPracticeQuestions({ bank, lessons: empty, round, mode: 'mixed' });
  firsts.add(set[0]?.id);
}
check('mixed: a new round changes the lead question', firsts.size > 1, [...firsts].join(', '));

// 7. An empty bank never throws.
check('empty bank: mixed', pickPracticeQuestions({ bank: {}, lessons: empty, round: 0, mode: 'mixed' }).length === 0);

console.log(JSON.stringify({ total, lessons: Object.keys(LESSONS).length, failures }));
`;

async function main() {
  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(work, { recursive: true });
  const entryFile = path.join(work, 'entry.ts');
  fs.writeFileSync(entryFile, entry);

  const outFile = path.join(work, 'out.cjs');
  await require('esbuild').build({
    entryPoints: [entryFile],
    outfile: outFile,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    logLevel: 'error',
  });
  const output = execFileSync(process.execPath, [outFile], { cwd: root, encoding: 'utf8' });
  const { total, lessons, failures: problems } = JSON.parse(output.trim().split('\n').pop());
  if (problems.length) {
    console.error(`✗ ${problems.length} practice-queue problem${problems.length === 1 ? '' : 's'}:\n`);
    for (const problem of problems) console.error(`  · ${problem}`);
    process.exitCode = 1;
  } else {
    console.log('✓ practice queue behaves');
    console.log(`  bank — ${total} questions across ${lessons} lessons`);
    console.log('  checked — set size, course spread, opened-lesson focus, review cap, dedupe, stale ids, redraw');
  }
}

main()
  .catch((error) => {
    console.error(error.message ?? error);
    process.exitCode = 1;
  })
  .finally(() => {
    fs.rmSync(work, { recursive: true, force: true });
  });

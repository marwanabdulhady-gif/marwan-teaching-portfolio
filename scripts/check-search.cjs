#!/usr/bin/env node
/**
 * Check the lesson search without a browser.
 *
 *   npm run qa:search
 *
 * The search box is the only way to reach a lesson whose lane you cannot find,
 * so its ranking is worth pinning down: a number finds its lesson first, an
 * Arabic query matches the Arabic title, folding works, and a one-letter query
 * does not dump the whole map.
 *
 * Bundled with esbuild and run against the real 111-lesson graph; scratch output
 * goes to `<repo>/.qa-search` and is removed afterwards.
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const work = path.join(root, '.qa-search');

if (!fs.existsSync(path.join(root, 'node_modules', 'esbuild'))) {
  console.error('! esbuild is not installed — run `npm install` first.');
  process.exit(2);
}

const entry = `
import { LESSONS, COURSES } from '${root}/src/courses/courseGraph';
import { normaliseQuery, searchLessons } from '${root}/src/courses/searchLessons';

const failures = [];
const check = (name, condition, detail) => {
  if (!condition) failures.push(name + (detail === undefined ? '' : ': ' + detail));
};

const lessons = Object.values(LESSONS);

// 1. A lesson number finds that lesson first.
const numbered = lessons.find((lesson) => /^\\d+-\\d+$/.test(lesson.id) && lesson.code.includes('.'));
const byCode = searchLessons(numbered.code);
check('code: finds the lesson', byCode.includes(numbered.key), byCode.slice(0, 3).join(', '));
check(
  'code: only lessons with that code lead',
  byCode.slice(0, 2).every((key) => LESSONS[key].code === numbered.code),
  byCode.map((key) => LESSONS[key].code).join(', '),
);

// 2. A title word finds its lesson near the top.
const word = numbered.title.en.split(/\\s+/).find((part) => part.length > 4) ?? numbered.title.en;
const lower = searchLessons(word.toLowerCase());
check('title word: finds the lesson', lower.includes(numbered.key), lower.join(', '));

// 3. A full title is the first hit.
const full = searchLessons(numbered.title.en);
check('full title: first hit', full[0] === numbered.key, full.slice(0, 3).join(', '));

// 4. Arabic finds the same lesson, with or without the hamza.
const arabic = lessons.find((lesson) => /[\\u0621-\\u064A]{4,}/.test(lesson.title.ar));
if (arabic) {
  const words = arabic.title.ar.split(/\\s+/).filter((part) => part.length > 3);
  const needle = words[words.length - 1] ?? arabic.title.ar;
  check('arabic: finds the lesson', searchLessons(needle).includes(arabic.key), needle + ' -> ' + searchLessons(needle).join(', '));
  const deHamza = needle.replace(/[أإآ]/, 'ا');
  const withHamza = needle.replace(/ا/, 'أ');
  check(
    'arabic: alef variants fold together',
    searchLessons(deHamza).includes(arabic.key) && searchLessons(withHamza).includes(arabic.key),
    deHamza + ' / ' + withHamza,
  );
  check('arabic: diacritics are ignored', normaliseQuery('الاشتِقاق') === normaliseQuery('الاشتقاق'));
}

// 5. Short or empty queries return nothing rather than the whole map.
check('empty query: no results', searchLessons('').length === 0);
check('one letter: no results', searchLessons('a').length === 0);
check('spaces only: no results', searchLessons('   ').length === 0);

// 6. The result list is capped and never repeats a lesson.
const common = searchLessons('the');
check('limit is respected', common.length <= 8, common.length);
check('no duplicates', new Set(common).size === common.length);
check('custom limit', searchLessons('a the rule', 3).length <= 3);

// 7. Every hit is a real lesson.
check('hits resolve to lessons', searchLessons('line').every((key) => Boolean(LESSONS[key])));

// 8. A nonsense query finds nothing (no accidental match-everything).
check('nonsense: no results', searchLessons('zzzqqq').length === 0);

// 9. Arabic-Indic digits work.
const arabicDigits = numbered.code.replace(/\\d/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
check('arabic-indic digits', searchLessons(arabicDigits).includes(numbered.key), arabicDigits);

console.log(JSON.stringify({ failures, lessons: lessons.length, courses: COURSES.length, sample: numbered.key }));
`;

async function main() {
  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(work, { recursive: true });
  fs.writeFileSync(path.join(work, 'entry.ts'), entry);

  const outFile = path.join(work, 'out.cjs');
  await require('esbuild').build({
    entryPoints: [path.join(work, 'entry.ts')],
    outfile: outFile,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    logLevel: 'error',
  });

  const output = execFileSync(process.execPath, [outFile], { cwd: root, encoding: 'utf8' });
  const { failures, lessons, courses, sample } = JSON.parse(output.trim().split('\n').pop());

  if (failures.length) {
    console.error(`✗ ${failures.length} search problem${failures.length === 1 ? '' : 's'}:\n`);
    for (const failure of failures) console.error(`  · ${failure}`);
    process.exitCode = 1;
  } else {
    console.log('✓ lesson search behaves');
    console.log(`  graph — ${lessons} lessons across ${courses} courses (sample: ${sample})`);
    console.log('  checked — numbers, title words, full titles, Arabic folding, short queries, limit, Arabic-Indic digits');
  }
}

main()
  .catch((error) => {
    console.error(error.message ?? error);
    process.exitCode = 1;
  })
  .finally(() => {
    if (!process.env.KEEP_QA) fs.rmSync(work, { recursive: true, force: true });
  });

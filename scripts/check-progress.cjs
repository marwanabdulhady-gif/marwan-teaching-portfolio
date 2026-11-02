#!/usr/bin/env node
/**
 * Check the progress store without a browser.
 *
 *   npm run qa:progress
 *
 * `src/courses/progress.ts` drives every ring on the map, so the promises worth
 * holding it to are the ones the map shows: opening a lesson moves it, a right
 * answer moves it more, a reload keeps it, a second tab picks it up, `Reset`
 * clears it, and a browser that refuses storage (private mode) does not crash.
 *
 * Each scenario runs in its own Node process, because the store reads
 * `localStorage` once when it is imported — a fresh process is what "reload"
 * means. The entry therefore sets up storage first and `await import()`s the
 * store afterwards. Scratch output goes to `<repo>/.qa-progress`.
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const work = path.join(root, '.qa-progress');

if (!fs.existsSync(path.join(root, 'node_modules', 'esbuild'))) {
  console.error('! esbuild is not installed — run `npm install` first.');
  process.exit(2);
}

const entry = `
const mode = process.argv[2];
const KEY = 'marwan:progress:v1';
const LEGACY_KEY = 'marwan:sampler:mastery';

// --- the browser, as far as the store can tell -------------------------------
const listeners = [];
const store = new Map();
const blocked = mode === 'blocked';
globalThis.localStorage = {
  getItem: (key) => {
    if (blocked) throw new Error('storage blocked');
    return store.has(key) ? store.get(key) : null;
  },
  setItem: (key, value) => {
    if (blocked) throw new Error('storage blocked');
    store.set(key, value);
  },
  removeItem: (key) => store.delete(key),
};
globalThis.window = {
  addEventListener: (type, listener) => { if (type === 'storage') listeners.push(listener); },
  removeEventListener: (type, listener) => {
    const index = listeners.indexOf(listener);
    if (type === 'storage' && index >= 0) listeners.splice(index, 1);
  },
  dispatchEvent: () => true,
  location: { search: '', pathname: '/courses', hash: '' },
  history: { state: null, pushState: () => {}, replaceState: () => {} },
  matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
};
globalThis.Event = globalThis.Event ?? class { constructor(type) { this.type = type; } };

const { LESSONS } = await import('../src/courses/courseGraph');

// --- seeded storage, written before the store is imported --------------------
const withQuestions = Object.values(LESSONS).find((lesson) => lesson.questionIds.length === 3);
const manyQuestions = Object.values(LESSONS).find((lesson) => lesson.questionIds.length > 3);
const gmatLesson = Object.values(LESSONS).find((lesson) => lesson.course === 'gmat');
const labOnly = Object.values(LESSONS).find((lesson) => lesson.questionIds.length === 0);

if (mode === 'seeded') {
  store.set(
    KEY,
    JSON.stringify({
      version: 1,
      lessons: {
        [manyQuestions.key]: {
          opened: 1,
          explorer: true,
          checks: { [manyQuestions.questionIds[0]]: 'right' },
          updated: 1,
        },
      },
      gmat: {},
    }),
  );
}
if (mode === 'legacy-seeded') {
  store.set(LEGACY_KEY, JSON.stringify({ [gmatLesson.questionIds[0]]: 'confident' }));
}
if (mode === 'corrupt') store.set(KEY, 'not json at all');

const {
  PROGRESS_KEY,
  progress,
  completionOf,
  nodeStateOf,
  subscribeToProgress,
} = await import('../src/courses/progress');

const failures = [];
const check = (name, condition, detail) => {
  if (!condition) failures.push(mode + ' · ' + name + (detail === undefined ? '' : ': ' + detail));
};

if (mode === 'basic' || mode === 'blocked') {
  check('starts empty', progress.completion(withQuestions.key) === 0, progress.completion(withQuestions.key));
  progress.markOpened(withQuestions.key);
  check('open moves the ring', progress.completion(withQuestions.key) === 20, progress.completion(withQuestions.key));
  check('open marks the lesson reached', progress.reached(withQuestions.key));
  progress.markOpened(withQuestions.key);
  check('open is idempotent', progress.completion(withQuestions.key) === 20, progress.completion(withQuestions.key));

  progress.markExplorer(withQuestions.key);
  check('using the lab moves it again', progress.completion(withQuestions.key) === 40, progress.completion(withQuestions.key));

  const [first, second, third] = withQuestions.questionIds;
  progress.answer(withQuestions.key, first, true);
  check('a right answer is worth 20', progress.completion(withQuestions.key) === 60, progress.completion(withQuestions.key));
  progress.answer(withQuestions.key, second, false);
  check('a wrong answer earns nothing', progress.completion(withQuestions.key) === 60, progress.completion(withQuestions.key));
  progress.answer(withQuestions.key, second, true);
  check('changing your mind counts', progress.completion(withQuestions.key) === 80, progress.completion(withQuestions.key));
  progress.answer(withQuestions.key, third, true);
  check('three right answers reach 100', progress.completion(withQuestions.key) === 100, progress.completion(withQuestions.key));
  check('100 percent is done', nodeStateOf(progress.state, withQuestions.key) === 'done', nodeStateOf(progress.state, withQuestions.key));

  progress.setMastery(withQuestions.key, 'confident');
  check('confident outranks done', nodeStateOf(progress.state, withQuestions.key) === 'confident');

  // A lesson with a lab but no questions earns the rest from the lab. None exist
  // in today's graph, so this only runs if one is added.
  if (labOnly) {
    progress.markOpened(labOnly.key);
    progress.markExplorer(labOnly.key);
    check('lab-only lesson reaches 100', progress.completion(labOnly.key) === 100, progress.completion(labOnly.key));
  }
  check('an unknown lesson is 0, not a crash', completionOf(progress.state, 'no/such-lesson') === 0);

  // GMAT topics share one ring with the map.
  progress.markOpened(gmatLesson.key);
  check('gmat open mirrors the topic', Boolean(progress.state.gmat[gmatLesson.id]), Object.keys(progress.state.gmat).join(','));
  progress.markGmat(gmatLesson.id);
  check('markGmat is idempotent', Object.keys(progress.state.gmat).length === 1);

  const seen = [];
  const unsubscribe = subscribeToProgress(() => seen.push(progress.state));
  progress.markExplorer(gmatLesson.key);
  check('listeners hear a change', seen.length === 1, seen.length);
  unsubscribe();
  progress.markExplorer(withQuestions.key);
  check('unsubscribing stops them', seen.length === 1, seen.length);

  progress.reset();
  check('reset clears the lesson', progress.completion(withQuestions.key) === 0);
  check('reset clears gmat', Object.keys(progress.state.gmat).length === 0);
  check('reset is new again', nodeStateOf(progress.state, withQuestions.key) === 'new');
  if (mode === 'basic') {
    const saved = JSON.parse(store.get(PROGRESS_KEY));
    check('reset writes the empty state', saved.version === 1 && Object.keys(saved.lessons).length === 0, JSON.stringify(saved).slice(0, 60));
  } else {
    check('blocked storage does not crash', typeof progress.state === 'object');
    check('blocked storage still tracks in memory', progress.state.lessons[withQuestions.key] === undefined);
  }
}

if (mode === 'seeded') {
  // A reload must land on the same ring: opened + explorer + one right answer.
  const expected = 40 + Math.round((1 / manyQuestions.questionIds.length) * 60);
  check('reload keeps the ring', progress.completion(manyQuestions.key) === expected, progress.completion(manyQuestions.key) + ' vs ' + expected);
  check('reload keeps the lab credit', progress.state.lessons[manyQuestions.key].explorer === true);
  check('other lessons stay empty', progress.completion(withQuestions.key) === 0);
}

if (mode === 'legacy-seeded') {
  progress.markOpened(gmatLesson.key);
  check(
    'legacy mastery migrates onto its lesson',
    progress.state.lessons[gmatLesson.key]?.mastery === 'confident',
    JSON.stringify(progress.state.lessons[gmatLesson.key]),
  );
  check('migrated mastery shows as confident', nodeStateOf(progress.state, gmatLesson.key) === 'confident');
  check('legacy key is left alone', store.has(LEGACY_KEY));
}

if (mode === 'corrupt') {
  check('corrupt payload starts clean', progress.completion(withQuestions.key) === 0);
  progress.markOpened(withQuestions.key);
  check('corrupt payload still records', progress.completion(withQuestions.key) === 20);
}

if (mode === 'second-tab') {
  const stop = subscribeToProgress(() => {});
  check('subscribing registers a storage listener', listeners.length === 1, listeners.length);
  progress.markOpened(withQuestions.key);
  // Another tab writes a different lesson, then the browser fires its event.
  store.set(
    PROGRESS_KEY,
    JSON.stringify({ version: 1, lessons: { [gmatLesson.key]: { opened: 5, checks: {}, updated: 5 } }, gmat: {} }),
  );
  for (const listener of listeners) listener({ key: PROGRESS_KEY });
  check('the event replaces the store', Boolean(progress.state.lessons[gmatLesson.key]), Object.keys(progress.state.lessons).join(','));
  for (const listener of listeners) listener({ key: 'some-other-key' });
  check('unrelated keys are ignored', Object.keys(progress.state.lessons).length === 1, Object.keys(progress.state.lessons).join(','));
  stop();
  check('stopping removes the listener', listeners.length === 0, listeners.length);
}

console.log(JSON.stringify({ mode, failures, lessons: Object.keys(LESSONS).length }));
`;

const scenarios = ['basic', 'blocked', 'seeded', 'legacy-seeded', 'corrupt', 'second-tab'];

async function main() {
  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(work, { recursive: true });
  fs.writeFileSync(path.join(work, 'entry.ts'), entry);

  const outFile = path.join(work, 'out.mjs');
  await require('esbuild').build({
    entryPoints: [path.join(work, 'entry.ts')],
    outfile: outFile,
    bundle: true,
    platform: 'node',
    format: 'esm',
    logLevel: 'error',
  });

  const problems = [];
  let lessons = 0;
  for (const scenario of scenarios) {
    let output;
    try {
      output = execFileSync(process.execPath, [outFile, scenario], { cwd: root, encoding: 'utf8' });
    } catch (error) {
      problems.push(`${scenario} · crashed: ${(error.stderr || error.message).toString().split('\n')[0]}`);
      continue;
    }
    const result = JSON.parse(output.trim().split('\n').pop());
    problems.push(...result.failures);
    lessons = result.lessons || lessons;
  }

  if (problems.length) {
    console.error(`✗ ${problems.length} progress-store problem${problems.length === 1 ? '' : 's'}:\n`);
    for (const problem of problems) console.error(`  · ${problem}`);
    process.exitCode = 1;
  } else {
    console.log('✓ progress store behaves');
    console.log(`  scenarios — ${scenarios.join(', ')}`);
    console.log(`  graph — ${lessons} lessons; ring maths, mastery, GMAT ring, reset, reload, legacy migration, corrupt and blocked storage, second tab`);
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

#!/usr/bin/env node
/**
 * Render every explorer once, server-side, with no browser.
 *
 *   npm run qa:render
 *
 * The labs are plain React components, so `renderToStaticMarkup` is enough to
 * catch the crashes that only show up when a component actually runs: a missing
 * prop default, division by a zero domain, a `usePlotScale` call outside a plot.
 * It bundles each loader with esbuild (already installed with Vite) and renders
 * the component against its real lesson node.
 *
 * Output goes to `<repo>/.render-check` (git-ignored) so Node can resolve React
 * from `node_modules`; the directory is removed afterwards.
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const work = path.join(root, '.render-check');

if (!fs.existsSync(path.join(root, 'node_modules', 'esbuild'))) {
  console.error('! esbuild is not installed — run `npm install` first.');
  process.exit(2);
}

const entry = `
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LocaleProvider } from '${root}/src/LocaleContext';
import { EXPLORERS, EXPLORER_KEYS } from '${root}/src/courses/explorers/index';
import { LESSONS, COURSES } from '${root}/src/courses/courseGraph';
import CoursesExperience from '${root}/src/courses/CoursesExperience';
import { offPlot } from '${root}/scripts/plot-bounds.cjs';
import { audit } from '${root}/scripts/a11y-dom.cjs';
import AnswerChoices from '${root}/src/courses/AnswerChoices';

// Node has no storage, no window: stub just enough for a first render.
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.window = {
  location: { search: '', pathname: '/courses', hash: '' },
  addEventListener: () => {},
  removeEventListener: () => {},
  history: { state: null, pushState: () => {}, replaceState: () => {} },
  matchMedia: () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} }),
  confirm: () => false,
  dispatchEvent: () => true,
};
globalThis.matchMedia = globalThis.window.matchMedia;

const failures = [];
let rendered = 0;

for (const key of EXPLORER_KEYS) {
  try {
    const mod = await EXPLORERS[key]();
    const lesson = LESSONS[key];
    if (!lesson) {
      failures.push(key + ': no lesson node');
      continue;
    }
    const html = renderToStaticMarkup(
      React.createElement(LocaleProvider, null, React.createElement(mod.default, { lesson, onInteract: () => {} })),
    );
    if (!html || html.length < 40) failures.push(key + ': empty output');
    // Geometry sanity: a lab that draws outside its viewBox is not throwing,
    // just invisible or misplaced — catch it here (this is how the unit circle
    // that came out 8750 px wide was found). A NaN in an attribute means a plot
    // tried to draw a coordinate it could not compute.
    if (/[:=]\s*"?NaN|NaN"/.test(html)) failures.push(key + ': NaN in a rendered attribute');
    for (const match of html.matchAll(/(?:^|[\s"'(,])(-?\d{4,}(?:\.\d+)?)/g)) {
      const value = Number(match[1]);
      if (Math.abs(value) > 1500) {
        failures.push(key + ': draws at ' + value + ' — outside the plot');
        break;
      }
    }
    const off = offPlot(html);
    if (off) failures.push(key + ': ' + off);
    for (const problem of audit(html, { where: key })) failures.push(problem);
    rendered += 1;
  } catch (error) {
    failures.push(key + ': ' + error.message);
  }
}
// The whole map: every course name, lesson node and legend must appear.
try {
  const map = renderToStaticMarkup(
    React.createElement(
      LocaleProvider,
      null,
      React.createElement(CoursesExperience, {
        launchWorkspace: () => {},
        listView: React.createElement('div', null, 'list'),
      }),
    ),
  );
  for (const course of COURSES) {
    // GMAT draws the topic grid, so only its short label is guaranteed.
    const label = course.short.en;
    if (!map.includes(label)) failures.push('map is missing ' + label);
  }
  if (!map.includes('Search lessons, numbers or ideas')) failures.push('map is missing the lesson search');
  // Closing the panel returns focus to the opener, or to these two if it has
  // gone away — so both need to keep their ids.
  for (const id of ['course-map', 'lesson-search']) {
    if (!map.includes('id="' + id + '"')) failures.push('map is missing id="' + id + '" (the focus fallback)');
  }
  for (const problem of audit(map, { where: 'courses map' })) failures.push(problem);
  for (const label of ['Mixed practice', 'Hands-on lab', 'Not started', 'Labs', 'My mistakes']) {
    if (!map.includes(label)) failures.push('map is missing "' + label + '"');
  }
} catch (error) {
  failures.push('courses map: ' + error.message);
}

// Answer options: a radio group has to be one tab stop with arrow-key movement,
// not four independent tab stops. That is a roving tabindex, which shows up in
// the static markup, so it can be checked without a browser.
try {
  const choices = (selected, checked) =>
    renderToStaticMarkup(
      React.createElement(
        LocaleProvider,
        null,
        React.createElement(AnswerChoices, {
          options: ['7', '9', '12', '15'],
          selected,
          onSelect: () => {},
          checked,
          correctIndex: 2,
          isRtl: false,
        }),
      ),
    );
  const stops = (html) => [...html.matchAll(/<button[^>]*>/g)].map((match) => /tabindex="0"/.test(match[0]));
  const labels = (html) =>
    html
      .split('<button')
      .slice(1)
      .map((part) => part.slice(part.indexOf('>') + 1).split('</button>')[0].replace(/<[^>]+>/g, '').trim());
  const chosen = choices(2, false);
  const chosenStops = stops(chosen);
  if (chosenStops.filter(Boolean).length !== 1) failures.push('answer choices: expected exactly one tab stop, got ' + chosenStops.filter(Boolean).length);
  else if (chosenStops[2] !== true) failures.push('answer choices: the tab stop is not the chosen option');
  const untouched = stops(choices(-1, false));
  if (untouched.filter(Boolean).length !== 1 || untouched[0] !== true) failures.push('answer choices: with nothing chosen the first option must be the tab stop');
  if (stops(choices(1, true)).some(Boolean)) failures.push('answer choices: a checked group must not keep a tab stop');
  const letters = labels(choices(-1, false)).map((text) => text[0]).join('');
  if (letters !== 'ABCD') failures.push('answer choices: options are not lettered A–D (' + letters + ')');
  for (const problem of audit(choices(-1, false), { where: 'answer choices' })) failures.push(problem);
} catch (error) {
  failures.push('answer choices: ' + error.message);
}

// URL contract: ?lesson= opens that panel on a cold load, ?legacy=1 forces the
// old list view. Both are promises the page makes to links from elsewhere.
const renderMap = (search) => {
  window.location.search = search;
  return renderToStaticMarkup(
    React.createElement(
      LocaleProvider,
      null,
      React.createElement(CoursesExperience, {
        launchWorkspace: () => {},
        listView: React.createElement('div', null, 'LIST-VIEW-MARKER'),
      }),
    ),
  );
};
try {
  // The map itself lists every lesson title, so "the title is in the HTML" proves
  // nothing. The panel is the only thing that renders a modal dialog and the
  // "How confident are you?" row.
  const panelOpen = (html) => html.includes('aria-modal="true"') && html.includes('How confident are you?');
  const deep = renderMap('?course=geometry&lesson=geometry/2-2');
  if (!deep.includes(LESSONS['geometry/2-2'].title.en)) failures.push('deep link: panel did not open for geometry/2-2');
  if (!panelOpen(deep)) failures.push('deep link: geometry/2-2 did not open a panel');
  if (deep.includes('LIST-VIEW-MARKER')) failures.push('deep link: list view rendered instead of the map');
  const legacy = renderMap('?legacy=1');
  if (!legacy.includes('LIST-VIEW-MARKER')) failures.push('legacy=1: list view did not render');
  const gmat = renderMap('?course=gmat&lesson=gmat/absolute-value');
  if (!gmat.includes(LESSONS['gmat/absolute-value'].title.en)) failures.push('deep link: GMAT panel did not open');
  if (!panelOpen(gmat)) failures.push('deep link: GMAT topic did not open a panel');
  // Every course must be able to open its first lesson's panel.
  for (const course of COURSES) {
    const first = Object.values(LESSONS).find((lesson) => lesson.course === course.id);
    if (!first) {
      failures.push('deep link: ' + course.id + ' has no lessons');
      continue;
    }
    const panel = renderMap('?course=' + course.id + '&lesson=' + first.key);
    if (!panel.includes(first.title.en)) failures.push('deep link: panel did not open for ' + first.key);
    if (!panelOpen(panel)) failures.push('deep link: ' + first.key + ' did not open a panel');
  }
  window.location.search = '';
} catch (error) {
  failures.push('URL contract: ' + error.message);
}

// The Labs gallery must be able to draw every course.
try {
  const { default: ExplorerGallery } = await import('${root}/src/courses/ExplorerGallery');
  for (const course of COURSES) {
    const gallery = renderToStaticMarkup(
      React.createElement(LocaleProvider, null, React.createElement(ExplorerGallery, { course: course.id, onOpen: () => {} })),
    );
    if (gallery.length < 200) failures.push('labs gallery is empty for ' + course.id);
    for (const problem of audit(gallery, { where: 'labs gallery ' + course.id })) failures.push(problem);
    if (gallery.includes('This course has no labs yet')) failures.push('labs gallery has no labs for ' + course.id);
  }
} catch (error) {
  failures.push('labs gallery: ' + error.message);
}

console.log('rendered ' + rendered + '/' + EXPLORER_KEYS.length + ' explorers + the course map');
if (failures.length) {
  console.error('FAILURES');
  for (const failure of failures) console.error('  · ' + failure);
  process.exit(1);
}
`;

async function main() {
  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(work, { recursive: true });
  fs.writeFileSync(path.join(work, 'entry.jsx'), entry);

  const esbuild = require('esbuild');
  await esbuild.build({
    entryPoints: [path.join(work, 'entry.jsx')],
    outdir: path.join(work, 'out'),
    bundle: true,
    splitting: true,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    loader: { '.jsx': 'jsx' },
    external: ['react', 'react-dom', 'react-dom/server'],
    logLevel: 'error',
  });

  try {
    const output = execFileSync(process.execPath, [path.join(work, 'out', 'entry.js')], {
      cwd: root,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    console.log(output.trim());
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error.message);
  fs.rmSync(work, { recursive: true, force: true });
  process.exit(1);
});

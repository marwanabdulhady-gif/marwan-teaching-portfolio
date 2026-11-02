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
  for (const label of ['Mixed practice', 'Hands-on lab', 'Not started', 'Labs', 'My mistakes']) {
    if (!map.includes(label)) failures.push('map is missing "' + label + '"');
  }
} catch (error) {
  failures.push('courses map: ' + error.message);
}

// The Labs gallery must be able to draw every course.
try {
  const { default: ExplorerGallery } = await import('${root}/src/courses/ExplorerGallery');
  for (const course of COURSES) {
    const gallery = renderToStaticMarkup(
      React.createElement(LocaleProvider, null, React.createElement(ExplorerGallery, { course: course.id, onOpen: () => {} })),
    );
    if (gallery.length < 200) failures.push('labs gallery is empty for ' + course.id);
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

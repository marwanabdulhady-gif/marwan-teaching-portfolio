#!/usr/bin/env node
/**
 * Check the home page's structure without a browser.
 *
 *   npm run qa:home
 *
 * The portfolio opens on Marwan's teaching track record, so the order of the
 * home page, the numbers in the experience stats row and the way the timeline
 * cards open are worth pinning down. Stats are derived from the timeline data
 * (never typed in), and every check runs in English and Arabic.
 *
 * Bundled with esbuild and rendered with `renderToStaticMarkup`; scratch
 * output goes to `<repo>/.qa-home` and is removed afterwards.
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const work = path.join(root, '.qa-home');

if (!fs.existsSync(path.join(root, 'node_modules', 'esbuild'))) {
  console.error('! esbuild is not installed — run `npm install` first.');
  process.exit(2);
}

const entry = `
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LocaleProvider } from '${root}/src/LocaleContext';
import PortfolioDirectory from '${root}/src/components/PortfolioDirectory';
import { HOME_SECTIONS } from '${root}/src/homeSections';
import { NAV_ITEMS } from '${root}/src/teachingData';
import Experience from '${root}/src/components/Experience';
import { EXPERIENCE } from '${root}/src/teachingData';
import { experienceStats, hasDetails } from '${root}/src/experienceStats';

// Node has no storage, no window: stub just enough for a first render.
let currentLocale = 'en';
globalThis.localStorage = { getItem: () => currentLocale, setItem: () => {}, removeItem: () => {} };
globalThis.window = {
  location: { search: '', pathname: '/', hash: '' },
  addEventListener: () => {},
  removeEventListener: () => {},
  history: { state: null, pushState: () => {}, replaceState: () => {} },
  matchMedia: () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} }),
  dispatchEvent: () => true,
};
globalThis.matchMedia = globalThis.window.matchMedia;
const render = (locale, element) => {
  currentLocale = locale;
  return renderToStaticMarkup(React.createElement(LocaleProvider, null, element));
};

const failures = [];
const check = (name, condition, detail) => {
  if (!condition) failures.push(name + (detail === undefined ? '' : ': ' + detail));
};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// 1. Stats come from the timeline data.
const stats = experienceStats(EXPERIENCE.roles);
check('stats: schools and start year from the data', same(stats, { schools: 4, sinceYear: 2014 }), JSON.stringify(stats));
check('stats: no roles', same(experienceStats([]), { schools: 0, sinceYear: null }));
check(
  'stats: unparseable years do not give NaN',
  same(experienceStats([{ years: 'n/a', kind: 'school' }]), { schools: 1, sinceYear: null }),
);
for (const role of EXPERIENCE.roles) {
  check('role ' + role.id + ': has a kind', role.kind === 'school' || role.kind === 'practice', String(role.kind));
}

// The ESL years before 2019 are part of the record.
const esl = EXPERIENCE.roles.find((role) => role.id === 'esl');
check('esl role exists', Boolean(esl));
check('esl role: practice, not a school', esl && esl.kind === 'practice');
check('esl role: is the last (oldest) entry', EXPERIENCE.roles[EXPERIENCE.roles.length - 1].id === 'esl');

// 2. A role with nothing behind the toggle gets no toggle.
check('hasDetails: empty', hasDetails({ photos: [] }) === false);
check('hasDetails: detail text', hasDetails({ detail: { en: 'x', ar: 'x' }, photos: [] }) === true);
check('hasDetails: photos', hasDetails({ photos: [{}] }) === true);

// 3. The experience section, in both languages.
const tile = (html, name) => (new RegExp('data-stat="' + name + '"[^>]*>[^]*?</div>').exec(html) || [''])[0];
const toggle = (html, id) => (new RegExp('<button[^>]*aria-controls="role-panel-' + id + '"[^>]*>').exec(html) || [''])[0];

for (const locale of ['en', 'ar']) {
  const html = render(locale, React.createElement(Experience));
  const where = 'experience ' + locale + ': ';
  const L = (o) => o[locale];
  check(where + 'results headline', html.includes(L(EXPERIENCE.results)));
  check(where + 'schools tile', tile(html, 'schools').includes(locale === 'ar' ? '٤' : '4'), tile(html, 'schools'));
  check(where + 'since tile', tile(html, 'since').includes(locale === 'ar' ? '٢٠١٤' : '2014'), tile(html, 'since'));
  for (const name of ['schools', 'since']) {
    const t = tile(html, name);
    check(where + name + ' tile: term (dt) comes before its value (dd)', t.indexOf('<dt') >= 0 && t.indexOf('<dt') < t.indexOf('<dd'), t);
  }
  check(where + 'tile labels', html.includes(L(EXPERIENCE.statLabels.schools)) && html.includes(L(EXPERIENCE.statLabels.since)));
  check(where + 'cta', html.includes('data-cta="work"') && html.includes(L(EXPERIENCE.cta)));

  for (const role of EXPERIENCE.roles) {
    const tag = toggle(html, role.id);
    check(where + role.id + ' has a toggle', tag.length > 0);
    check(where + role.id + ' toggle is a button', tag.startsWith('<button') && tag.includes('type="button"'), tag);
    const want = role.id === 'fikr' ? 'true' : 'false';
    check(where + role.id + ' aria-expanded=' + want, tag.includes('aria-expanded="' + want + '"'), tag);
    check(where + role.id + ' panel exists for aria-controls', html.includes('id="role-panel-' + role.id + '"'));
    const panel = new RegExp('id="role-panel-' + role.id + '"([^>]*)>').exec(html);
    const hidden = panel ? panel[1].includes('hidden') : false;
    check(where + role.id + ' panel hidden=' + (want === 'false'), hidden === (want === 'false'), panel && panel[1]);
  }

  check(where + 'open card shows its detail', html.includes(L(EXPERIENCE.roles[0].detail)));
  check(where + 'closed card shows no photos', !html.includes('/photos/andalus-grad-podium.webp'));
  check(where + 'toggle label', html.includes(L(EXPERIENCE.showDetails)) && html.includes(L(EXPERIENCE.hideDetails)));
  if (locale === 'ar') {
    check(where + 'no English toggle label', !html.includes(EXPERIENCE.showDetails.en) && !html.includes(EXPERIENCE.hideDetails.en));
  }
}

// 4. Home page order: proof first, then philosophy, then the guide.
const fs = require('node:fs');
const read = (file) => fs.readFileSync('${root}/' + file, 'utf8');
const app = read('src/TeachingApp.tsx');
const home = app.slice(app.indexOf('function HomePage'), app.indexOf('function CoursesPage'));
const order = ['<TeachHero', '<CredentialsBar', '<ChapterBanner', '<Experience', '<TeachAbout', '<ClassroomGallery', '<PortfolioDirectory', '<PageLinks', '<LearningDesigns', '<AiTeacherStudio', '<WorkWithMe'];
let last = -1;
for (const tag of order) {
  const at = home.indexOf(tag);
  check('home order: ' + tag + ' is present', at >= 0);
  check('home order: ' + tag + ' comes after the one before it', at > last, at + ' <= ' + last);
  last = at;
}
check('home order: nothing else shows before the Chapter 01 banner but hero and credentials', home.indexOf('<ChapterBanner') < home.indexOf('<PortfolioDirectory'));

// 5. Scrollspy and nav follow that order.
check('sections: order', same(HOME_SECTIONS.map((s) => s.id), ['hero', 'experience', 'about', 'gallery', 'designs', 'studio', 'work']), HOME_SECTIONS.map((s) => s.id).join(','));
check('nav: first item is Experience', NAV_ITEMS[0].id === 'experience', NAV_ITEMS[0].id);
const spyTargets = new Set(HOME_SECTIONS.map((s) => s.navId));
for (const item of NAV_ITEMS) {
  if (item.id === 'resources' || item.id === 'lab') continue;
  check('nav: ' + item.id + ' is lit by a home section', spyTargets.has(item.id));
}
check('sections: experience, about and gallery all light the Experience nav item', HOME_SECTIONS.filter((s) => ['experience', 'about', 'gallery'].includes(s.id)).every((s) => s.navId === 'experience'));

// 6. The chapter guide makes no claim the data cannot back.
for (const locale of ['en', 'ar']) {
  const html = render(locale, React.createElement(PortfolioDirectory));
  check('directory ' + locale + ': teaching since the first role in the data', html.includes(locale === 'ar' ? 'أدرّس منذ ٢٠١٤' : 'Teaching since 2014'));
  check('directory ' + locale + ': no unverifiable years claim', !html.includes('12+') && !html.includes('١٢'));
  check('directory ' + locale + ': no stale 2019 start', !html.includes('2019') && !html.includes('٢٠١٩'));
}
const directory = read('src/components/PortfolioDirectory.tsx');
check('directory: pillar 01 jumps to the experience section', /num: '01',[^]{0,12}targetId: 'experience'/.test(directory));
check('directory: nothing jumps to #about', !directory.includes("targetId: 'about'"));
check('footer: no hard-coded duplicate experience link', !read('src/components/TeachFooter.tsx').includes("id: 'experience'"));

console.log(JSON.stringify({ failures }));
`;

async function main() {
  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(work, { recursive: true });
  fs.writeFileSync(path.join(work, 'entry.tsx'), entry);

  const outFile = path.join(work, 'out.cjs');
  await require('esbuild').build({
    entryPoints: [path.join(work, 'entry.tsx')],
    outfile: outFile,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    logLevel: 'error',
  });

  const output = execFileSync(process.execPath, [outFile], { cwd: root, encoding: 'utf8' });
  const { failures } = JSON.parse(output.trim().split('\n').pop());

  if (failures.length) {
    console.error(`✗ ${failures.length} home-page problem${failures.length === 1 ? '' : 's'}:\n`);
    for (const failure of failures) console.error(`  · ${failure}`);
    process.exitCode = 1;
  } else {
    console.log('✓ home page structure holds');
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

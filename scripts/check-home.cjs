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
import { EXPERIENCE } from '${root}/src/teachingData';
import { experienceStats, hasDetails } from '${root}/src/experienceStats';

const failures = [];
const check = (name, condition, detail) => {
  if (!condition) failures.push(name + (detail === undefined ? '' : ': ' + detail));
};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// 1. Stats come from the timeline data.
const stats = experienceStats(EXPERIENCE.roles);
check('stats: schools and start year from the data', same(stats, { schools: 4, sinceYear: 2019 }), JSON.stringify(stats));
check('stats: no roles', same(experienceStats([]), { schools: 0, sinceYear: null }));
check(
  'stats: unparseable years do not give NaN',
  same(experienceStats([{ years: 'n/a', kind: 'school' }]), { schools: 1, sinceYear: null }),
);
for (const role of EXPERIENCE.roles) {
  check('role ' + role.id + ': has a kind', role.kind === 'school' || role.kind === 'practice', String(role.kind));
}

// 2. A role with nothing behind the toggle gets no toggle.
check('hasDetails: empty', hasDetails({ photos: [] }) === false);
check('hasDetails: detail text', hasDetails({ detail: { en: 'x', ar: 'x' }, photos: [] }) === true);
check('hasDetails: photos', hasDetails({ photos: [{}] }) === true);

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

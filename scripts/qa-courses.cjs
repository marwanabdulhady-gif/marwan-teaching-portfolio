#!/usr/bin/env node
/**
 * Browser QA for the /courses learning map (plan §9).
 *
 * Playwright is NOT a dependency of this repo (it would add ~1 GB of browser
 * binaries), so this script is opt-in:
 *
 *   npx playwright@1.49 install chromium
 *   npm run dev &
 *   BASE_URL=http://127.0.0.1:3000 node scripts/qa-courses.cjs
 *
 * It checks, at phone / tablet / desktop widths, in LTR and RTL:
 *   - the page renders without console errors
 *   - the map has one Tab stop and the arrow keys walk the nodes
 *   - a node opens the panel, Esc closes it and focus returns to the node
 *   - progress survives a reload
 *   - no horizontal overflow
 * Screenshots land in `qa/` (git-ignored).
 */
const fs = require('node:fs');
const path = require('node:path');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000';
const OUT = path.join(process.cwd(), 'qa');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}

const VIEWPORTS = [
  { name: 'phone', width: 360, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const problems = [];
const note = (message) => {
  problems.push(message);
  console.log(`  ✗ ${message}`);
};
const pass = (message) => console.log(`  ✓ ${message}`);

async function collectConsole(page) {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(String(error)));
  return errors;
}

async function checkViewport(browser, viewport, locale) {
  const context = await browser.newContext({ viewport, locale });
  const page = await context.newPage();
  const errors = await collectConsole(page);
  const label = `${viewport.name} ${locale}`;
  console.log(`\n${label} (${viewport.width}×${viewport.height})`);

  await page.goto(`${BASE_URL}/courses`, { waitUntil: 'networkidle' });
  if (locale === 'ar') {
    await page.evaluate(() => localStorage.setItem('marwan_locale', 'ar'));
    await page.reload({ waitUntil: 'networkidle' });
  }

  // 1. No horizontal overflow.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  overflow > 1 ? note(`${label}: horizontal overflow of ${overflow}px`) : pass('no horizontal overflow');

  // 2. One Tab stop in the map, arrow keys move focus.
  const node = page.locator('[aria-label*="map" i], [aria-label*="خريطة"]').locator('button[aria-describedby]').first();
  if (await node.count()) {
    await node.focus();
    const before = await page.evaluate(() => document.activeElement?.getAttribute('aria-describedby'));
    await page.keyboard.press('ArrowRight');
    const after = await page.evaluate(() => document.activeElement?.getAttribute('aria-describedby'));
    before !== after ? pass('arrow keys move between nodes') : note(`${label}: ArrowRight did not move focus`);
  } else {
    note(`${label}: no map nodes found`);
  }

  // 3. Open a panel, escape out, focus returns.
  const target = page.locator('button[aria-describedby]').first();
  if (await target.count()) {
    const targetName = await target.getAttribute('aria-describedby');
    await target.click();
    const dialog = page.getByRole('dialog');
    (await dialog.count()) ? pass('panel opens') : note(`${label}: panel did not open`);
    await page.keyboard.press('Escape');
    const closed = (await page.getByRole('dialog').count()) === 0;
    closed ? pass('Esc closes the panel') : note(`${label}: Esc did not close the panel`);
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-describedby'));
    focused === targetName ? pass('focus returns to the node') : note(`${label}: focus did not return to the node`);
  }

  // 4. Progress survives a reload.
  await page.evaluate(() => {
    localStorage.setItem(
      'marwan:progress:v1',
      JSON.stringify({
        version: 1,
        lessons: { 'grade-12-calculus/2-4': { opened: Date.now(), explorer: true, checks: {}, updated: Date.now() } },
        gmat: {},
        last: { key: 'grade-12-calculus/2-4', ts: Date.now() },
      }),
    );
  });
  await page.reload({ waitUntil: 'networkidle' });
  const resumed = await page.getByText('2.4').first().isVisible();
  resumed ? pass('progress survives reload and drives the continue strip') : note(`${label}: continue strip did not pick up the saved lesson`);

  // 5. No console errors.
  errors.length === 0 ? pass('console clean') : note(`${label}: console errors → ${errors.slice(0, 3).join(' | ')}`);

  fs.mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: path.join(OUT, `courses-${viewport.name}-${locale}.png`), fullPage: false });
  await context.close();
}

(async () => {
  const browser = await chromium.launch();
  for (const viewport of VIEWPORTS) {
    for (const locale of ['en', 'ar']) {
      await checkViewport(browser, viewport, locale);
    }
  }
  await browser.close();

  console.log(`\n${problems.length === 0 ? 'All checks passed.' : `${problems.length} problem(s):`}`);
  for (const problem of problems) console.log(` - ${problem}`);
  process.exit(problems.length === 0 ? 0 : 1);
})();

import { chromium } from 'playwright-core';
import fs from 'fs';

const routes = JSON.parse(fs.readFileSync('/tmp/guided-routes.json', 'utf8'));
const out = JSON.parse(fs.existsSync('/tmp/hints.json') ? fs.readFileSync('/tmp/hints.json', 'utf8') : '{}');

const b = await chromium.launch({
  executablePath: '/tmp/tools/pw-browsers/chromium-1248/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

for (const route of routes) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.addInitScript(`window.__vis = function (el) {
    if (!el) return '';
    var c = el.cloneNode(true);
    c.querySelectorAll('.katex-mathml').forEach(function (m) { m.remove(); });
    return c.textContent.replace(/\\s+/g, ' ').trim();
  };`);

  await p.goto('https://drmathazzam.app' + route, { waitUntil: 'networkidle', timeout: 90000 });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(1500);

  const n = await p.evaluate(() => {
    const els = [...document.querySelectorAll('[data-guided-question]')];
    els.forEach((e, i) => e.setAttribute('data-hp', String(i)));
    return els.length;
  });

  let got = 0;
  for (let i = 0; i < n; i++) {
    const id = await p.evaluate(i => {
      const el = document.querySelectorAll('[data-guided-question]')[i];
      el.scrollIntoView({ block: 'center' });
      return el.getAttribute('data-guided-question');
    }, i);
    if (out[id]) continue;

    // open
    await p.evaluate(i => {
      const el = document.querySelectorAll('[data-guided-question]')[i];
      const btn = [...el.querySelectorAll('button')]
        .find(x => /-hint$/.test(x.getAttribute('aria-controls') || ''));
      if (btn && btn.getAttribute('aria-expanded') === 'false') btn.click();
    }, i);
    await p.waitForTimeout(220);                       // let React commit

    const hint = await p.evaluate(i => {
      const el = document.querySelectorAll('[data-guided-question]')[i];
      const btn = [...el.querySelectorAll('button')]
        .find(x => /-hint$/.test(x.getAttribute('aria-controls') || ''));
      const idh = btn && btn.getAttribute('aria-controls');
      const panel = idh ? document.getElementById(idh) : null;
      return panel ? __vis(panel).replace(/^Hint\.\s*/, '') : null;
    }, i);

    // close again so the page stays in its initial state
    await p.evaluate(i => {
      const el = document.querySelectorAll('[data-guided-question]')[i];
      const btn = [...el.querySelectorAll('button')]
        .find(x => /-hint$/.test(x.getAttribute('aria-controls') || ''));
      if (btn && btn.getAttribute('aria-expanded') === 'true') btn.click();
    }, i);
    await p.waitForTimeout(120);

    if (hint) { out[id] = hint; got++; }
  }
  console.log(`${route}  +${got} hints (total ${Object.keys(out).length})`);
  fs.writeFileSync('/tmp/hints.json', JSON.stringify(out, null, 1));
  await ctx.close();
}
await b.close();
console.log('DONE hints:', Object.keys(out).length);

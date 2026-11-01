// Try EVERY option of every guided question and record the per-option
// feedback, so optionFeedback is complete rather than truncated at the
// first correct answer.
import { chromium } from 'playwright-core';
import fs from 'fs';

const routes = JSON.parse(fs.readFileSync('/tmp/guided-routes.json', 'utf8'));
const out = JSON.parse(fs.existsSync('/tmp/feedback.json') ? fs.readFileSync('/tmp/feedback.json', 'utf8') : '{}');

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
  await p.waitForTimeout(1400);

  const n = await p.evaluate(() => document.querySelectorAll('[data-guided-question]').length);
  let got = 0;
  for (let qi = 0; qi < n; qi++) {
    const id = await p.evaluate(qi => {
      const el = document.querySelectorAll('[data-guided-question]')[qi];
      el.scrollIntoView({ block: 'center' });
      return el.getAttribute('data-guided-question');
    }, qi);
    if (out[id]) continue;

    const nOpt = await p.evaluate(qi => {
      const el = document.querySelectorAll('[data-guided-question]')[qi];
      return el.querySelectorAll('label').length || el.querySelectorAll('input').length;
    }, qi);
    if (!nOpt) continue;

    const fb = [];
    for (let oi = 0; oi < nOpt; oi++) {
      await p.evaluate(({ qi, oi }) => {
        const el = document.querySelectorAll('[data-guided-question]')[qi];
        const ls = el.querySelectorAll('label').length ? el.querySelectorAll('label') : el.querySelectorAll('input');
        ls[oi].click();
      }, { qi, oi });
      await p.waitForTimeout(160);
      await p.evaluate(qi => {
        const el = document.querySelectorAll('[data-guided-question]')[qi];
        const c = [...el.querySelectorAll('button')].find(x => /check answer/i.test(x.textContent || ''));
        if (c && !c.disabled) c.click();
      }, qi);
      await p.waitForTimeout(300);
      const st = await p.evaluate(qi => {
        const el = document.querySelectorAll('[data-guided-question]')[qi];
        const s = el.querySelector('[role=status]');
        const wrong = [...el.querySelectorAll('button')].some(x => /show explanation/i.test(x.textContent || ''));
        return { t: __vis(s), wrong };
      }, qi);
      fb.push(st.wrong ? st.t.replace(/^Not yet\s*—\s*try this next\.?\s*/i, '').trim() : null);
      // reset
      await p.evaluate(qi => {
        const el = document.querySelectorAll('[data-guided-question]')[qi];
        const t = [...el.querySelectorAll('button')].find(x => /try again/i.test(x.textContent || ''));
        if (t) t.click();
      }, qi);
      await p.waitForTimeout(170);
    }
    if (fb.some(x => x)) { out[id] = fb; got++; }
  }
  console.log(`${route}  +${got} (total ${Object.keys(out).length})`);
  fs.writeFileSync('/tmp/feedback.json', JSON.stringify(out, null, 1));
  await ctx.close();
}
await b.close();
console.log('DONE:', Object.keys(out).length);

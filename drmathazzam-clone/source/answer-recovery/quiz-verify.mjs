// Drive the same self-check flow on the original and the clone and compare
// the observable result at every step.
import { chromium } from 'playwright-core';
import fs from 'fs';

const routes = JSON.parse(fs.readFileSync('/tmp/guided-routes.json', 'utf8'));
const b = await chromium.launch({
  executablePath: '/tmp/tools/pw-browsers/chromium-1248/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const FLOW = async (base, route, mode) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 90)));
  await p.goto(base + route, { waitUntil: 'networkidle', timeout: 90000 });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(1400);

  // work on the first guided question
  await p.evaluate(() => {
    const n = document.querySelector('[data-guided-question]');
    if (n) { n.scrollIntoView({ block: 'center' }); n.setAttribute('data-t', '1'); }
  });
  const id = await p.evaluate(() => {
    const n = document.querySelector('[data-t]');
    return n ? n.getAttribute('data-guided-question') : null;
  });
  if (!id) { await ctx.close(); return null; }

  const snape = () => p.evaluate(() => {
    const n = document.querySelector('[data-t]');
    const fs2 = n.querySelector('fieldset');
    const row = fs2 && fs2.nextElementSibling;
    const st = n.querySelector('[role=status]');
    const hintBtn = row && [...row.querySelectorAll('button')]
      .find(x => /-hint$/.test(x.getAttribute('aria-controls') || ''));
    const idh = hintBtn && hintBtn.getAttribute('aria-controls');
    const panelEl = idh ? document.getElementById(idh) : null;
    return {
      locked: !!(fs2 && fs2.disabled),
      checked: [...n.querySelectorAll('input')].findIndex(i => i.checked),
      buttons: row ? [...row.querySelectorAll('button')].map(x => (x.textContent || '').trim()) : [],
      checkDisabled: !!(row && row.querySelector('button') && row.querySelector('button').disabled),
      status: (function () { if (!st) return ''; var c = st.cloneNode(true);
        c.querySelectorAll('.katex-mathml').forEach(function (m) { m.remove(); });
        return c.textContent.replace(/\s+/g, ' ').trim(); })(),
      hintOpen: hintBtn ? hintBtn.getAttribute('aria-expanded') === 'true' : null,
      hintText: (function () { if (!panelEl) return null; var c = panelEl.cloneNode(true);
        c.querySelectorAll('.katex-mathml').forEach(function (m) { m.remove(); });
        return c.textContent.replace(/\s+/g, ' ').trim(); })(),
      labelCursor: [...n.querySelectorAll('label')].map(l => l.classList.contains('cursor-default') ? 'L' : 'P').join(''),
      selectedHl: [...n.querySelectorAll('label')].map(l => l.classList.contains('border-foreground') ? '#' : '.').join(''),
    };
  });

  const out = { id, initial: await snape() };

  // 1. open the hint
  await p.evaluate(() => {
    const n = document.querySelector('[data-t]');
    const fs2 = n.querySelector('fieldset');
    const row = fs2.nextElementSibling;
    const h = [...row.querySelectorAll('button')].find(x => /-hint$/.test(x.getAttribute('aria-controls') || ''));
    if (h) h.click();
  });
  await p.waitForTimeout(300);
  out.hintOpened = await snape();

  // 2. close the hint
  await p.evaluate(() => {
    const n = document.querySelector('[data-t]');
    const fs2 = n.querySelector('fieldset');
    const row = fs2.nextElementSibling;
    const h = [...row.querySelectorAll('button')].find(x => /-hint$/.test(x.getAttribute('aria-controls') || ''));
    if (h) h.click();
  });
  await p.waitForTimeout(250);

  // 3. pick an option (mode: 'correct' | 'wrong')
  const bank = JSON.parse(fs.readFileSync('/tmp/question-bank.json', 'utf8'));
  const q = bank[id];
  const nOpt = out.initial.selectedHl.length;
  const target = mode === 'correct' ? q.correctIndex : (q.correctIndex + 1) % nOpt;
  await p.evaluate(t => {
    const n = document.querySelector('[data-t]');
    const els = n.querySelectorAll('label').length ? n.querySelectorAll('label') : n.querySelectorAll('input');
    els[t].click();
  }, target);
  await p.waitForTimeout(250);
  out.afterSelect = await snape();

  // 4. check the answer
  await p.evaluate(() => {
    const n = document.querySelector('[data-t]');
    const fs2 = n.querySelector('fieldset');
    const row = fs2.nextElementSibling;
    const c = [...row.querySelectorAll('button')].find(x => /check answer/i.test(x.textContent || ''));
    if (c && !c.disabled) c.click();
  });
  await p.waitForTimeout(400);
  out.afterCheck = await snape();

  // 5. try again
  await p.evaluate(() => {
    const n = document.querySelector('[data-t]');
    const fs2 = n.querySelector('fieldset');
    const row = fs2.nextElementSibling;
    const t = [...row.querySelectorAll('button')].find(x => /try again/i.test(x.textContent || ''));
    if (t) t.click();
  });
  await p.waitForTimeout(350);
  out.afterReset = await snape();

  out.errors = errs;
  await ctx.close();
  return out;
};

let pass = 0, fail = 0;
for (const mode of ['correct', 'wrong']) {
  for (const route of routes) {
    const o = await FLOW('https://drmathazzam.app', route, mode);
    const c = await FLOW('http://127.0.0.1:3000', route, mode);
    if (!o || !c) { console.log('SKIP', route); continue; }

    const checks = [];
    // state flags that must agree
    for (const step of ['initial', 'afterSelect', 'afterCheck', 'afterReset']) {
      checks.push([`${step}.locked`, o[step].locked, c[step].locked]);
      checks.push([`${step}.buttons`, o[step].buttons.join('|'), c[step].buttons.join('|')]);
      checks.push([`${step}.checkDisabled`, o[step].checkDisabled, c[step].checkDisabled]);
      checks.push([`${step}.labelCursor`, o[step].labelCursor, c[step].labelCursor]);
      checks.push([`${step}.selectedHl`, o[step].selectedHl, c[step].selectedHl]);
      checks.push([`${step}.hintOpen`, o[step].hintOpen, c[step].hintOpen]);
    }
    // feedback: the clone renders LaTeX as plain text, so compare loosely
    const norm = s => String(s).replace(/[^a-z0-9 ]/gi, '').replace(/\s+/g, ' ').trim().toLowerCase();
    checks.push(['afterCheck.status', norm(o.afterCheck.status).slice(0, 120), norm(c.afterCheck.status).slice(0, 120)]);
    checks.push(['hintOpened.hintText', norm(o.hintOpened.hintText).slice(0, 120), norm(c.hintOpened.hintText).slice(0, 120)]);
    checks.push(['hint panel present', !!o.hintOpened.hintText, !!c.hintOpened.hintText]);

    const bad = checks.filter(x => JSON.stringify(x[1]) !== JSON.stringify(x[2]));
    if (bad.length) {
      fail++;
      console.log(`FAIL ${mode} ${route} (${o.id})`);
      bad.slice(0, 6).forEach(x => console.log(`     ${x[0]}\n       orig : ${JSON.stringify(x[1])}\n       clone: ${JSON.stringify(x[2])}`));
    } else {
      pass++;
      console.log(`PASS ${mode} ${route} (${o.id})  status="${c.afterCheck.status.slice(0, 70)}"`);
    }
    if (c.errors.length) console.log('     clone JS errors:', c.errors.slice(0, 3));
  }
}
console.log(`\n${pass} passed, ${fail} failed`);
await b.close();

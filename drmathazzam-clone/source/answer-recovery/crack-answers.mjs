// Recover the answer key straight from the live site.
//
// A wrong answer is revealed by the presence of a "Show explanation" button; a
// correct one is not. "Try again" resets the question, so every option can be
// tried within a single page load. This gives ground truth for questions whose
// data lives in a chunk we cannot parse.
import { chromium } from 'playwright-core';
import fs from 'fs';

const routes = JSON.parse(fs.readFileSync('/tmp/guided-routes.json', 'utf8'));
const out = JSON.parse(fs.existsSync('/tmp/answers.json') ? fs.readFileSync('/tmp/answers.json', 'utf8') : '{}');

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

  try {
    await p.goto('https://drmathazzam.app' + route, { waitUntil: 'networkidle', timeout: 90000 });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(1500);
  } catch (e) {
    console.log('LOAD FAIL', route, e.message.slice(0, 60));
    await ctx.close();
    continue;
  }

  const ids = await p.evaluate(() =>
    [...document.querySelectorAll('[data-guided-question]')].map((e, i) => {
      e.setAttribute('data-qidx', String(i));
      return e.getAttribute('data-guided-question');
    })
  );

  let solved = 0;
  for (let qi = 0; qi < ids.length; qi++) {
    const id = ids[qi];
    if (out[id] && out[id].correctIndex != null && out[id].explanation) { solved++; continue; }

    const nOpt = await p.evaluate(qi => {
      const n = document.querySelectorAll('[data-guided-question]')[qi];
      return n ? n.querySelectorAll('input[type=radio],input[type=checkbox]').length
               || n.querySelectorAll('label').length : 0;
    }, qi);
    if (!nOpt) continue;

    // capture hint text first (only available before answering)
    let hint = null, explanation = null, optionFeedback = null, correct = null;

    await p.evaluate(qi => {
      const n = document.querySelectorAll('[data-guided-question]')[qi];
      n.scrollIntoView({ block: 'center' });
      const h = [...n.querySelectorAll('button')].find(x => /show hint/i.test(x.textContent || ''));
      if (h && h.getAttribute('aria-expanded') === 'false') h.click();
    }, qi);
    await p.waitForTimeout(250);
    hint = await p.evaluate(qi => {
      const n = document.querySelectorAll('[data-guided-question]')[qi];
      const h = [...n.querySelectorAll('button')].find(x => /show hint/i.test(x.textContent || ''));
      const idh = h && h.getAttribute('aria-controls');
      const panel = idh ? document.getElementById(idh) : null;
      if (panel) return panel.textContent.replace(/\s+/g, ' ').trim().slice(0, 300);
      // hint may be rendered inline after the button
      const sib = h && h.parentElement && h.parentElement.nextElementSibling;
      return sib ? sib.textContent.replace(/\s+/g, ' ').trim().slice(0, 300) : null;
    }, qi);
    await p.evaluate(qi => {
      const n = document.querySelectorAll('[data-guided-question]')[qi];
      const h = [...n.querySelectorAll('button')].find(x => /show hint/i.test(x.textContent || ''));
      if (h && h.getAttribute('aria-expanded') === 'true') h.click();
    }, qi);
    await p.waitForTimeout(150);

    for (let oi = 0; oi < nOpt; oi++) {
      await p.evaluate(({ qi, oi }) => {
        const n = document.querySelectorAll('[data-guided-question]')[qi];
        const els = n.querySelectorAll('label').length ? n.querySelectorAll('label') : n.querySelectorAll('input');
        const el = els[oi];
        if (el) { el.scrollIntoView({ block: 'center' }); el.click(); }
      }, { qi, oi });
      await p.waitForTimeout(150);
      await p.evaluate(qi => {
        const n = document.querySelectorAll('[data-guided-question]')[qi];
        const c = [...n.querySelectorAll('button')].find(x => /check answer/i.test(x.textContent || ''));
        if (c && !c.disabled) c.click();
      }, qi);
      await p.waitForTimeout(300);

      const st = await p.evaluate(qi => {
        const n = document.querySelectorAll('[data-guided-question]')[qi];
        const btns = [...n.querySelectorAll('button')].map(x => (x.textContent || '').trim());
        const status = n.querySelector('[role=status]');
        return {
          wrong: btns.some(t => /show explanation/i.test(t)),
          status: __vis(status),
        };
      }, qi);

      if (!st.wrong) {
        correct = oi;
        explanation = st.status.replace(/^Correct\s*—\s*here is why\.?\s*/i, '').trim() || null;
        break;
      } else {
        optionFeedback = optionFeedback || [];
        optionFeedback[oi] = st.status.replace(/^Not yet\s*—\s*try this next\.?\s*/i, '').trim();
      }
      // reset
      await p.evaluate(qi => {
        const n = document.querySelectorAll('[data-guided-question]')[qi];
        const t = [...n.querySelectorAll('button')].find(x => /try again/i.test(x.textContent || ''));
        if (t) t.click();
      }, qi);
      await p.waitForTimeout(220);
    }

    if (correct != null) {
      out[id] = { correctIndex: correct, hint, explanation, optionFeedback, source: 'live-crack' };
      solved++;
    }
  }
  console.log(`${route}  questions=${ids.length}  solved(total)=${solved}/${Object.keys(out).length}`);
  fs.writeFileSync('/tmp/answers.json', JSON.stringify(out, null, 1));
  await ctx.close();
}
await b.close();
console.log('DONE total solved:', Object.keys(out).length);

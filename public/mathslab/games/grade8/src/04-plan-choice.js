/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 8 · Plan Choice · from a table to a rule, and choosing between two linear plans at their crossing
   Source: G08-U01-L03 — «نبع | كيف نختار بين خطتين؟» — الدول الخطية وأنظمة المعادلات، حزمة تدريس، الوحدة
   الأولى، الترم الأول. This document (28 466 bytes) is a DIFFERENT lesson from G08-U01-MATH-L02
   (24 700 bytes): L03 is the decision pack — a cost table that starts at 10 and rises by 2 a month, the
   move from table to function, the crossing of two plans, and an explicit limit beyond which the model
   stops. L02 is the algebra and substitution pack (game 03).

   DOCUMENT CAVEAT, carried into the build — this bundle says of itself: «مسودة تحتاج تطويرًا ومراجعة، غير
   معتمدة. خطة معلم … HTML والتنفيذ الرقمي مؤجلان», i.e. the lesson plan exists but the digital deliverable
   is explicitly HELD BACK by its own author. This game is therefore the prototype it asks for, and both
   the game and the ledger carry the un-approved status. The bundle also states the numbers are NOT prices
   or measured results and prove no real saving; the fictional framing here obeys that, and the lesson's
   limit-on-the-model requirement is a level rather than a footnote.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g8-plan-choice', code: 'G08-U01-L03', title: 'Plan Choice', emoji: '⚖️',
  accent: '#6b4a7a', accentDeep: '#523860', skyA: '#f7f2fa', skyB: '#e4d8ed',
  topic: 'Two linear plans, the table behind them, and the limit of the model', band: 'g68', lang: 'en',
  objective: 'I can move from a cost table to a rule, read where two plans cost the same, and state a limit of the model.',
  welcome: 'Two subscription plans, one table each. The question is not which sounds cheaper — it is WHEN. ⚖️',
  learnBlurb: 'A linear plan is a starting amount plus a steady step; two of them meet at exactly one month.',
  how: {
    what: 'Each plan is a starting amount (the value at month zero) plus a steady step per month. Write both as rules, then find the month where the two rules give the same amount; past the model limit the rule stops describing the world.',
    steps: ['⚖️ Write the starting amount of each plan.', 'Write the step added each month.', '✅ Set the two rules equal, then state where the model stops working.'],
  },

  learn: [
    { say: 'Plan A starts at <b>10</b> and gains <b>2</b> each month. At month zero it is 10, at month three it is 16 — the table is 10, 12, 14, 16.',
      draw(el) { el.append(UI.h('div', { html: SCENE8.stepTable([[0, 10, 'month 0'], [1, 12, ''], [2, 14, ''], [3, 16, '']], { colA: 'month', colB: 'cost', colOp: 'plan A' }) })); } },
    { say: 'The same table as a rule is <b>y = 2x + 10</b>, and its picture is one straight line: the 10 is where it starts, the 2 is how fast it climbs.',
      draw(el) { el.append(UI.h('div', { html: SCENE8.slopeLine({ m: 2, b: 10, xmin: 0, xmax: 6, ymax: 26, bLabel: '10', tri: [1, 3], caption: 'y = 2x + 10' }) })); } },
    { say: 'Your turn. Plan B starts at <b>4</b> and gains <b>4</b> each month — <b>y = 4x + 4</b>. In which month do the two plans cost the same?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE8.twoLines({ a: { m: 2, b: 10 }, b: { m: 4, b: 4 }, xmax: 6, ymax: 32, aName: 'A: y = 2x + 10', bName: 'B: y = 4x + 4', caption: 'one crossing, one answer' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['Month 3', true], ['Month 1', false], ['Month 6', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 2(3) + 10 = 16 and 4(3) + 4 = 16. Both give 16.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === 'Month 1' ? 'At month 1 A is 12 and B is 8 — not equal yet.' : 'Read the month where the two rules agree, not the top of the picture.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says Plan B is always the cheaper one because its step is smaller. What is wrong with that?', wait: true,
      draw(el, L) {
        GHUBAR.pop('The plan that grows most slowly is always the cheaper one.', 5200);
        el.append(UI.h('div', { html: SCENE8.twoLines({ a: { m: 2, b: 10 }, b: { m: 4, b: 4 }, xmax: 6, ymax: 32, aName: 'A: y = 2x + 10', bName: 'B: y = 4x + 4', caption: 'the start matters as much as the step' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['Nothing is always cheaper — the start decides the early months, the step decides the later ones.', true], ['He is right, B always costs less.', false], ['Plan A is always cheaper because 10 is bigger.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Exactly. Before the crossing one plan wins; after it the other does.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Look at month 1 and month 6 on the picture.', 'bad'))),
        }))); el.append(row);
      } },
  ],

  fixOpts(q) {
    if (!q || !q.options || q.type === 'order' || q.type === 'bars') return q;
    const ans = String(q.answer);
    const seen = new Set();
    let kept = false;
    q.options = q.options.map((o) => {
      let s = String(o);
      if (s === ans && !kept) { kept = true; seen.add(s); return o; }
      if (!seen.has(s)) { seen.add(s); return o; }
      const num = s.match(/-?\d+(?:\.\d+)?/);
      if (num) {
        const v = Number(num[0]);
        const alt = [v + 1, v - 1, v + 2, v - 2, v + 3].find((c) => {
          const cand = s.replace(num[0], String(c));
          return c >= 0 && cand !== ans && !seen.has(cand);
        });
        if (alt != null) s = s.replace(num[0], String(alt));
      }
      while (seen.has(s) || s === ans) s = s + '·';
      seen.add(s);
      return s;
    });
    return q;
  },

  levels: [
    { name: 'Read the start', icon: '🧾', blurb: 'Table to starting amount and step.', rounds: 6, think: false,
      say: '🧾 Month zero is the start; the jump is the step.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const b = UI.rint(3, 12), m = UI.rint(2, 6);
        const rows = [0, 1, 2, 3].map((k) => [k, b + m * k, k === 0 ? 'start' : '']);
        return {
          type: 'choice',
          prompt: G1.art(SCENE8.stepTable(rows, { colA: 'month', colB: 'cost', colOp: 'plan' }),
            `The table starts at <b>${b}</b> and adds <b>${m}</b> each month. Which rule matches it?`),
          options: [`y = ${m}x + ${b}`, `y = ${b}x + ${m}`, `y = ${m + b}x`],
          answer: `y = ${m}x + ${b}`,
          why: (v) => String(v).startsWith(`y = ${b}x`) ? 'That swaps the start and the step — month one would already be far too high.'
            : 'The rule needs both the start and the step.',
          hints: [`At month 0 the cost is ${b}.`, `Each month adds ${m}.`, 'The step multiplies the month.'],
          solution: `Start ${b}, step ${m}: <b>y = ${m}x + ${b}</b>.`,
        };
      } },
    { name: 'Fill the table', icon: '🔢', blurb: 'Apply the rule at a given month.', rounds: 6, think: false,
      say: '🔢 Put the month in for x.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const b = UI.rint(3, 12), m = UI.rint(2, 6), x = UI.rint(3, 7);
        const rows = [0, 1, x].map((k) => [k, k === x ? '?' : b + m * k, k === 0 ? 'start' : '']);
        return {
          type: 'choice',
          prompt: G1.art(SCENE8.stepTable(rows, { colA: 'month', colB: 'cost', colOp: 'plan' }),
            `The plan is <b>y = ${m}x + ${b}</b>. What is the cost at month <b>${x}</b>?`),
          options: [String(m * x + b), String(b * x + m), String(m * x)],
          answer: String(m * x + b),
          why: (v) => Number(v) === m * x ? 'That forgets the starting amount.'
            : 'Multiply first, then add the start.',
          hints: [`${m} × ${x} = ${m * x}.`, `Add the start ${b}.`, `${m * x} + ${b}.`],
          solution: `y = ${m}(${x}) + ${b} = <b>${m * x + b}</b>.`,
        };
      } },
    { name: 'Where they meet', icon: '⚖️', blurb: 'Choose between two plans.', rounds: 6, think: true,
      say: '⚖️ Think first: set the two rules equal.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const m1 = UI.rint(1, 3), m2 = m1 + UI.rint(1, 3), b1 = UI.rint(4, 9) + m2, b2 = UI.rint(1, 4);
        /* crossing of y = m1 x + b1 and y = m2 x + b2 must be a whole month */
        const span = m2 - m1;
        const x0 = Math.round((b1 - b2) / span);
        const fixB1 = b2 + span * x0;
        const y0 = m1 * x0 + fixB1;
        if (x0 < 1 || x0 > 10) return { type: 'choice', prompt: G1.art(SCENE8.slopeLine({ m: m1, b: fixB1, xmin: 0, xmax: 6, ymax: m1 * 6 + fixB1 + 2, caption: 'one plan' }), `What is the cost at month 0 for <b>y = ${m1}x + ${fixB1}</b>?`), options: [String(fixB1), String(m1), String(fixB1 + m1)], answer: String(fixB1), why: () => 'Month zero removes the step.', hints: ['Put x = 0.', 'The step disappears.', `Only ${fixB1} is left.`], solution: `At x = 0, y = <b>${fixB1}</b>.` };
        return {
          type: 'choice',
          problem: {
            sentences: ['Two plans are written as rules, so each is a line on the same grid.',
              'They cost the same only at the month where the two rules give the same amount.',
              `Plan A is y = ${m1}x + ${fixB1} and plan B is y = ${m2}x + ${b2}.`],
            question: 2, keys: ['same', 'month'], extras: [1],
          },
          prompt: G1.art(SCENE8.twoLines({ a: { m: m1, b: fixB1 }, b: { m: m2, b: b2 }, xmax: x0 + 4, aName: 'A: y = ' + m1 + 'x + ' + fixB1, bName: 'B: y = ' + m2 + 'x + ' + b2, caption: 'the month is where the ring sits' }),
            `In which month do the two plans cost the same?`),
          options: [`Month ${x0}`, `Month ${x0 + 1}`, `Month 0`],
          answer: `Month ${x0}`,
          why: () => 'Set the two rules equal and divide the difference of the starts by the difference of the steps.',
          hints: [`${m1}x + ${fixB1} = ${m2}x + ${b2}.`, `Move the x terms: ${span}x = ${fixB1 - b2}.`, `Divide by ${span}.`],
          solution: `${m1}(${x0}) + ${fixB1} = ${y0} and ${m2}(${x0}) + ${b2} = ${y0}, so <b>month ${x0}</b>.`,
        };
      } },
    { name: 'Know the limit', icon: '🚧', blurb: 'Say when the model stops.', rounds: 6, think: true,
      say: '🚧 Think first: what does the model quietly assume?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const m = UI.rint(2, 6), b = UI.rint(5, 12), cap = UI.rint(8, 14);
        return {
          type: 'choice',
          problem: {
            sentences: ['A plan rule was fitted from a table that only covered twelve months.',
              'A rule says nothing about a month that was never measured.',
              `The rule is y = ${m}x + ${b}, fitted on months 0 to ${cap}.`],
            question: 2, keys: ['fitted', 'measured'], extras: [1],
          },
          prompt: G1.art(SCENE8.slopeLine({ m, b, xmin: 0, xmax: cap + 4, ymax: m * (cap + 4) + b + 2, tri: [cap - 2, cap], caption: `the table stopped at month ${cap}` }),
            `What is the honest thing to say about month <b>${cap + 6}</b>?`),
          options: [`The rule has not been checked past month ${cap}, so month ${cap + 6} is outside the model.`,
            `The rule gives ${m * (cap + 6) + b}, so that is the cost.`, 'The rule never stops being true.'],
          answer: `The rule has not been checked past month ${cap}, so month ${cap + 6} is outside the model.`,
          why: () => 'A fitted rule is only supported where the data reached — beyond that it is a guess, not a result.',
          hints: ['What did the table actually cover?', 'Beyond the last row there is no evidence.', 'Say where the evidence ends.'],
          solution: `The table ends at month ${cap}; month ${cap + 6} is <b>outside the model</b> until it is measured.`,
        };
      } },
  ],

  ghubar: ['The slower-growing plan is always cheaper.', 'A month beyond the table still has a cost we know.', 'Two plans that cross once are equal everywhere.'],
  praise: ['Start read!', 'Table filled!', 'Crossing found!', 'Limit stated!'],
  finale: 'A start, a step, a crossing, and an honest edge — that is a model. ⚖️',
};

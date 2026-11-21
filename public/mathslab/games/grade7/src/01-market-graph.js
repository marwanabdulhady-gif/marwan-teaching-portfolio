/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 7 · Market Graph · equivalent ratios, unit rate, and the constant of proportionality k = y/x
   Source: G07-U01-MAT-L01 (CCSS 7.RP.A.1–2), term 1 — العلاقات التناسبية ومعدل التغير الثابت وحل
   المسائل المالية والهندسية.

   SCOPE — this game takes the CONSTANT itself: a ratio of fractions as a unit rate (RP.A.1), and
   k = y/x read off a table or a graph through the origin (RP.A.2a–b). The multi-step percent work of
   RP.A.3 belongs to G07-U02-MATH-L02 (game 04) and is deliberately NOT repeated here; the two lessons
   overlap on "proportional relationship" and the split is recorded in docs/mowazi/g7-expansion.md.

   Mechanic = the thinking: every cell of the table is rebuilt from the same k. The table and the graph
   show the pairs, never the constant and never the missing value.
   Named misconceptions: «k is the difference y − x», «one equal pair is enough to call it proportional»,
   and «divide the wrong way round».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g7-market-graph', code: 'G07-U01-MATH-L01', title: 'Market Graph', emoji: '📈',
  accent: '#35507a', accentDeep: '#263c5e', skyA: '#f2f6fc', skyB: '#d9e4f4',
  topic: 'Equivalent ratios and the constant of proportionality', band: 'g68', lang: 'en',
  objective: 'I can find the constant of proportionality <b>k = y ÷ x</b> and use it to fill in a table or a graph.',
  welcome: 'A date stall keeps one price for every kilogram. Find the constant that holds the table together. 📈',
  learnBlurb: 'Divide any pair the same way and the answer is k — every row shares it.',
  how: {
    what: 'In a proportional relationship every pair gives the same quotient. Divide the second value by the first to find k, then multiply by k for anything you are missing.',
    steps: ['📈 Divide y by x on a row you fully know.', 'Check that another row gives the same k.', '✅ Multiply or divide by k to fill the gap.'],
  },

  learn: [
    { say: 'Three kilogrammes cost <b>18</b> riyals, so one kilogramme costs 18 ÷ 3 = <b>6</b>. Here k = 6 riyals for every kilogramme.',
      draw(el) { el.append(UI.h('div', { html: SCENE7.tablePairs([1, 2, 3], [6, 12, 18], { rowA: 'kg', rowB: 'riyals', caption: 'every pair gives 6' }) })); } },
    { say: 'Four kilogrammes therefore cost 4 × 6 = 24. The table grows by k each time — it is not adding the same amount to both rows.',
      draw(el) { el.append(UI.h('div', { html: SCENE7.proportionGraph([[1, 6], [2, 12], [3, 18], [4, 24]], { showLine: true, xName: 'kg', yName: 'riyals', caption: 'one straight line through the origin' }) })); } },
    { say: 'Your turn. Five kilogrammes cost <b>35</b> riyals. What does <b>8</b> kilogrammes cost?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE7.tablePairs([5, null], [35, '?'], { rowA: 'kg', rowB: 'riyals', askCol: 1, caption: 'the same price for every kilogramme' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['56', true], ['40', false], ['43', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 35 ÷ 5 = 7 per kilogramme, and 8 × 7 = 56.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '40' ? 'That adds 5 to 35. The price grows by k each time.' : 'Find one kilogramme first.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says k is what you get by <b>taking away</b>: 18 − 3 = 15. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('k is the difference. Eighteen minus three is fifteen.', 5200);
        el.append(UI.h('div', { html: SCENE7.tablePairs([2, 5], [8, 20], { rowA: 'x', rowB: 'y', caption: 'check every row before you agree' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — 8 ÷ 2 = 4 and 20 ÷ 5 = 4, so k = 4.', true], ['He is right — k is 15.', false], ['k changes from row to row.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. k is a quotient, and both rows give 4.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('A difference changes when x changes; a constant may not.', 'bad'))),
        }))); el.append(row);
      } },
  ],

  /* ── option hygiene ───────────────────────────────────────────────────────────────────────────────
     Rounds are built from drawn numbers, so a distractor can coincide with the answer; the engine does
     not dedupe and matches options by text, so the answer's own button is never rewritten. Called as
     GAME.fixOpts(this.roundRaw(i)) because the engine invokes round detached from the level object. */
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
        const alt = [v + 1, v - 1, v + 10, v + 2, v * 2 + 1].find((c) => {
          const cand = s.replace(num[0], String(c));
          return c > 0 && !seen.has(cand) && cand !== ans;
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
    { name: 'Find k', icon: '🔗', blurb: 'Divide a pair to find the constant.', rounds: 6, think: false,
      say: '🔗 Divide y by x — carefully, in that order.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const k = UI.rint(2, 9), x = UI.rint(2, 8), x2 = x + UI.rint(1, 4);
        return {
          type: 'choice',
          prompt: G1.art(SCENE7.tablePairs([x, x2], [x * k, x2 * k], { rowA: 'x', rowB: 'y', caption: 'the same constant in both columns' }),
            `The table is proportional. What is the constant <b>k = y ÷ x</b>?`),
          options: [String(k), String(x * k - x), String(x2 * k - x2)],
          answer: String(k),
          why: (v) => Number(v) === x * k - x ? 'That is y − x, a difference. k is a quotient.' : 'Check the second column too — both must give the same number.',
          hints: [`Take the y of the first column and divide by its x.`, `${x * k} ÷ ${x}.`, 'The second column must give the same answer.'],
          solution: `${x * k} ÷ ${x} = ${k}, and ${x2 * k} ÷ ${x2} = ${k}, so <b>k = ${k}</b>.`,
        };
      } },
    { name: 'Fill the table', icon: '🧮', blurb: 'Use k to find the missing value.', rounds: 6, think: false,
      say: '🧮 Find k first, then multiply.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const k = UI.rint(2, 9), x = UI.rint(2, 7), x2 = x + UI.rint(1, 5);
        return {
          type: 'choice',
          prompt: G1.art(SCENE7.tablePairs([x, x2], [x * k, null], { rowA: 'x', rowB: 'y', askCol: 1, caption: 'one value missing' }),
            `The pair <b>${x}</b> → <b>${x * k}</b> is known. What belongs in the dashed cell?`),
          options: [String(x2 * k), String(x * k + x2), String(x * k)],
          answer: String(x2 * k),
          why: (v) => Number(v) === x * k ? 'That is the y you were already given.' : 'k is a multiplier, so both columns grow by the same factor — not by the same amount.',
          hints: [`k = ${x * k} ÷ ${x} = ${k}.`, `The new x is ${x2}.`, `Multiply ${x2} by ${k}.`],
          solution: `k = ${k}, so y = ${x2} × ${k} = <b>${x2 * k}</b>.`,
        };
      } },
    { name: 'Read the graph', icon: '📈', blurb: 'A fraction unit rate on a graph.', rounds: 6, think: true,
      say: '📈 Think first: which axis is which?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        /* a unit rate of a ratio of fractions: half a kilogramme, quarter of an hour, etc. */
        const num = [1, 3, 5, 7][i % 4], den = [2, 4, 8][i % 3];
        const unitRate = den / num;                     /* units of y per one x */
        const x = num;                                   /* x measured in the smaller unit */
        const y = den;
        const x3 = num * 3;
        const ans = (unitRate * x3);
        const ansStr = Number.isInteger(ans) ? String(ans) : String(ans);
        return {
          type: 'choice',
          problem: {
            sentences: ['A water carrier fills a tank at a steady rate.',
              'The graph plots the time in hours across and the water in tanks up.',
              `In ${num} hours the carrier fills ${den} of a tank.`],
            question: 2, keys: ['hours', 'steady'], extras: [1],
          },
          prompt: G1.art(SCENE7.proportionGraph([[num, den], [num * 2, den * 2]], { showLine: true, xName: 'hours', yName: 'tanks', caption: 'both points on one line from the origin' }),
            `In <b>${num}</b> hours the carrier fills <b>${den}</b> of a tank. How many tanks in <b>${x3}</b> hours?`),
          options: [String(ans), String(den * 3 + num), String(den)],
          answer: String(ans),
          why: (v) => Number(v) === den ? 'That is the water in the first reading.' : 'A unit rate is per ONE hour, so scale by the same factor on both sides.',
          hints: [`One hour fills ${den} ÷ ${num} of a tank.`, `That is ${ansStr.split('.')[0] === '0' ? den + '/' + num : ansStr} per hour at most — keep the fraction.`, `Multiply by ${x3}.`],
          solution: `${den} ÷ ${num} = ${den}/${num} per hour, and ${den}/${num} × ${x3} = <b>${ans}</b>.`,
        };
      } },
  ],

  ghubar: ['k is the difference between the two rows.', 'One matching pair proves it is proportional.', 'Divide x by y, it is the same thing.'],
  praise: ['Constant found!', 'Table completed!', 'Graph read!', 'Rate scaled!'],
  finale: 'One constant, one line, one rule — you can read k from a table or a graph. 📈',
};

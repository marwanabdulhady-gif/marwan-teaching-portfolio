/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 7 · Constant Line · the same proportional relationship seen four ways — table, equation, graph and
   a description — and deciding whether a relationship is proportional at all
   Source: G07-U02-MAT-L01 (CCSS 7.RP.A.2a–b, 7.RP.A.3), term 2 — ثابت التناسب والتمثيل البياني
   والعلاقات التناسبية: جداول ومعادلات ورسوم بيانية.

   SCOPE — this document is about REPRESENTATIONS and the test for proportionality, not about unit price:
   a table gives k = y/x on every row, the equation reads y = kx, the graph must pass through (0,0) and
   (1,k), and a linear relationship that does NOT pass through the origin is not proportional. Doc 1
   (game 01) takes a single unit rate in a money context; this one compares representations and rejects
   the impostors. Recorded in docs/mowazi/g7-expansion.md.

   Mechanic = the thinking: the child must cross between representations, and level 3 shows a line with a
   non-zero starting value so "it is a straight line" is not enough. The graph never prints k.
   Named misconceptions: «any straight line is proportional», «the table's pattern is what matters»,
   «y = kx and y = kx + b are the same kind of relationship».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g7-constant-line', code: 'G07-U02-MAT-L01', title: 'Constant Line', emoji: '📊',
  accent: '#265a63', accentDeep: '#1c454c', skyA: '#f0f8f9', skyB: '#d3e8ec',
  topic: 'Proportional relationships in tables, equations and graphs', band: 'g68', lang: 'en',
  objective: 'I can test whether a relationship is <b>proportional</b> and read its constant from a table, an equation or a graph.',
  welcome: 'Four ways to say the same thing — and one impostor that only looks straight. 📊',
  learnBlurb: 'Proportional means y = kx, one line through the origin.',
  how: {
    what: 'A relationship is proportional only if every pair gives the same y ÷ x AND the graph goes through (0, 0). Then it can be written y = kx, and the line passes through (1, k).',
    steps: ['📊 Divide y by x on every row.', '📈 Check the line passes through the origin.', '✅ Write y = kx, or reject it if either test fails.'],
  },

  learn: [
    { say: 'This table is proportional: 2 → 7, 4 → 14, 6 → 21. Every row gives 7 ÷ 2 = 3.5, so <b>y = 3.5x</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE7.tablePairs([2, 4, 6], [7, 14, 21], { rowA: 'x', rowB: 'y', caption: 'same quotient on every row' }) })); } },
    { say: 'Its graph is one straight line <b>through the origin</b>, and it passes through (1, 3.5). That point is k.',
      draw(el) { el.append(UI.h('div', { html: SCENE7.proportionGraph([[1, 3.5], [2, 7], [4, 14], [6, 21]], { showLine: true, askK: [1, 3.5], xName: 'x', yName: 'y', caption: '(1, k) sits on the line' }) })); } },
    { say: 'Now a taxi that charges <b>5</b> riyals to start plus <b>2</b> per kilometre. The table 0 → 5, 1 → 7, 2 → 9 is a straight line, but it does <b>not</b> pass through (0, 0), so it is not proportional.',
      draw(el) { el.append(UI.h('div', { html: SCENE7.tablePairs([0, 1, 2], [5, 7, 9], { rowA: 'km', rowB: 'riyals', caption: 'a straight line, but the start is not zero' }) })); } },
    { say: 'Your turn. Which equation belongs to a table whose rows all give y ÷ x = <b>4</b>?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE7.tablePairs([1, 3, 5], [4, 12, 20], { rowA: 'x', rowB: 'y', caption: 'the same constant on every row' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['y = 4x', true], ['y = x + 4', false], ['y = 4x + 1', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — every y is 4 times its x, and nothing is added.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === 'y = x + 4' ? 'That adds 4. Check x = 3: it would give 7, not 12.' : 'A starting value other than 0 breaks proportionality.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says any <b>straight</b> graph is a proportional relationship. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('It goes up in a straight line. Proportional, obviously.', 5200);
        el.append(UI.h('div', { html: SCENE7.proportionGraph([[0, 3], [1, 5], [2, 7], [3, 9]], { showLine: true, offLine: [0], xName: 'x', yName: 'y', caption: 'straight — but it starts at 3, not at 0' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — a proportional line must also pass through (0, 0).', true], ['He is right — straight is enough.', false], ['Yes, as long as the line goes up.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. This one starts at 3, so it is not proportional.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Where does the line meet the vertical axis?', 'bad'))),
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
        const alt = [v + 1, v - 1, v * 2, v + 2, v + 10].find((c) => {
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
    { name: 'Table to equation', icon: '📊', blurb: 'One quotient, one equation.', rounds: 6, think: false,
      say: '📊 Divide y by x, then write y = kx.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const k = UI.rint(2, 9), a = UI.rint(1, 4);
        const xs = [a, a + 2, a + 4];
        return {
          type: 'choice',
          prompt: G1.art(SCENE7.tablePairs(xs, xs.map((v) => v * k), { rowA: 'x', rowB: 'y', caption: 'every row gives the same quotient' }),
            `Which equation matches this table?`),
          options: [`y = ${k}x`, `y = x + ${k}`, `y = ${k}x + ${a}`],
          answer: `y = ${k}x`,
          why: (v) => String(v) === `y = x + ${k}` ? 'Adding k only matches one row. The quotient holds on every row.' : 'A constant added on the end moves the line off the origin.',
          hints: [`Take a row: ${xs[0]} → ${xs[0] * k}.`, `${xs[0] * k} ÷ ${xs[0]} = ${k}.`, 'Write it as y = k times x.'],
          solution: `Every row gives ${k}, so the equation is <b>y = ${k}x</b>.`,
        };
      } },
    { name: 'Graph to k', icon: '📈', blurb: 'Read the point (1, k).', rounds: 6, think: false,
      say: '📈 Go up from x = 1 to the line.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const k = UI.rint(2, 8);
        return {
          type: 'choice',
          prompt: G1.art(SCENE7.proportionGraph([[1, k], [2, k * 2], [3, k * 3]], { showLine: true, askK: [1, k], xName: 'x', yName: 'y', caption: 'the marked point has x = 1' }),
            `The line passes through the origin. What is the constant of proportionality?`),
          options: [String(k), String(k * 2), String(1)],
          answer: String(k),
          why: (v) => Number(v) === k * 2 ? 'That is the y-value at x = 2. k is the y-value at x = 1.' : 'One is x, not the constant — the constant is the height at x = 1.',
          hints: ['Find x = 1 on the horizontal axis.', 'Read the height of the line there.', 'That height is k.'],
          solution: `At x = 1 the line is at y = ${k}, so <b>k = ${k}</b>.`,
        };
      } },
    { name: 'Proportional or not', icon: '🔍', blurb: 'Two tests before you commit.', rounds: 6, think: true,
      say: '🔍 Think first: does the line pass through the origin?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const k = UI.rint(2, 6), b = UI.rint(1, 9);
        const proportional = i % 2 === 0;
        const ys = proportional ? [0, k, k * 2, k * 3] : [b, b + k, b + k * 2, b + k * 3];
        const ans = proportional ? 'Proportional' : 'Not proportional';
        return {
          type: 'choice',
          problem: {
            sentences: ['A shop measures how much delivery costs as the distance grows.',
              'The manager wants to know whether the cost is proportional to distance.',
              `The plotted values are (0, ${ys[0]}), (1, ${ys[1]}), (2, ${ys[2]}) and (3, ${ys[3]}).`],
            question: 1, keys: ['proportional', 'distance'], extras: [2],
          },
          prompt: G1.art(SCENE7.proportionGraph([[0, ys[0]], [1, ys[1]], [2, ys[2]], [3, ys[3]]], { showLine: true, xName: 'km', yName: 'riyals', offLine: proportional ? [] : [0], caption: 'look where the line meets the vertical axis' }),
            `Is this relationship <b>proportional</b>?`),
          options: ['Proportional', 'Not proportional', 'Impossible to tell'],
          answer: ans,
          why: (v) => (String(v) === ans
            ? `Every pair gives the same quotient and the line starts at 0.`
            : String(v) === 'Impossible to tell'
              ? 'The plotted pairs are given, so the test can be done.'
              : `At 0 km the cost is ${ys[0]}, not 0, so the line misses the origin.`),
          hints: ['Look at the pair where x = 0.', proportional ? 'It is 0, and every quotient is the same.' : 'A non-zero start means the relationship is not proportional.', 'Proportional needs both tests to pass.'],
          solution: proportional ? `The line starts at the origin with a constant quotient, so it is <b>proportional</b>.` : `The start is ${b}, not 0, so it is <b>not proportional</b>.`,
        };
      } },
  ],

  ghubar: ['A straight line is always proportional.', 'Proportional means the table goes up steadily.', 'y = kx and y = kx + b are the same.'],
  praise: ['Equation written!', 'k read!', 'Origin checked!', 'Impostor caught!'],
  finale: 'Table, equation, graph, description — one constant behind them all. 📊',
};

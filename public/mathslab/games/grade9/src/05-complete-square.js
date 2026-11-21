/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 9 · Complete the Square · (x − p)² = q, the general formula derived from it, and the discriminant
   Source: G09-U02-MAT-L01 — المعادلات التربيعية وإكمال المربع والقانون العام
   (CCSS HSA-REI.B.4a & HSA.REI.B.4b), term 2.

   SCOPE — this is the METHOD lesson: convert a quadratic into the perfect-square form (x − p)² = q, derive
   the general formula from that same manoeuvre, and use the DISCRIMINANT to decide how many real roots
   exist before doing any of it. The factoring route through two integer factors is game 03; the picture of
   the curve and its crossings is game 01. Here the algebra is the object and the diagram is only the square
   being closed.
   Named misconceptions: «add the missing piece to one side only», «the formula always gives two real
   answers», and «a negative discriminant means the equation has no solutions at all» — the last is the one
   the lesson insists on: no REAL roots, not no roots.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g9-complete-square', code: 'G09-U02-MAT-L01', title: 'Complete the Square', emoji: '⬛',
  accent: '#2f5f6e', accentDeep: '#244a56', skyA: '#f0f8f9', skyB: '#d3e8ec',
  topic: 'Completing the square, the general formula, and the discriminant', band: 'g912', lang: 'en',
  objective: 'I can complete the square, use the general formula, and decide the number of real roots from the discriminant.',
  welcome: 'A corner is missing from the square. Add one small piece and the whole expression folds into a single bracket. ⬛',
  learnBlurb: 'Half the x-coefficient, squared — added to both sides.',
  how: {
    what: 'To complete the square on x² + bx, add (b/2)². Do it to both sides of an equation and the left becomes a perfect square (x + b/2)². The general formula comes from doing exactly this with letters instead of numbers, and b² − 4ac tells you how many real roots there are.',
    steps: ['⬛ Halve the coefficient of x, then square it.', 'Add that to BOTH sides so the equality survives.', '✅ Read b² − 4ac: positive gives two real roots, zero gives one, negative gives none real.'],
  },

  learn: [
    { say: 'Take <b>x² + 6x</b>. Half of 6 is 3, and 3² = 9 — that is the missing corner. Add it to both sides and the left folds into <b>(x + 3)²</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE9.squareStep(6, { caption: 'x² + 6x, and the corner that closes it' }) })); } },
    { say: 'Applied to <b>x² + 6x + 5 = 0</b>: subtract 5, complete the square, and you get <b>(x + 3)² = 4</b>. So x + 3 = ±2, giving <b>x = −1</b> and <b>x = −5</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE9.rootsGraph(-5, -1, { caption: '(x + 3)² = 4 has two roots' }) })); } },
    { say: 'Your turn. For <b>2x² + 3x + 5 = 0</b>, what is the discriminant <b>b² − 4ac</b>?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE9.valueTable([1, 2, 3], (k) => k, { rowA: 'symbol', rowB: 'value', caption: 'a = 2, b = 3, c = 5' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['−31', true], ['9', false], ['49', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 9 − 40 = −31, negative, so there are no real roots.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '9' ? 'That is b² only — you must subtract 4ac.' : '4ac is 4 × 2 × 5 = 40.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says a negative discriminant means the equation has no solutions. Is that precisely right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Negative discriminant: no solutions.', 5200);
        el.append(UI.h('div', { html: SCENE9.parabola({ a: 1, h: 1, k: 3, ymin: -2, ymax: 8, caption: 'the curve never meets the x-axis' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['Not quite — it means no REAL roots; the roots exist but are not real.', true], ['Yes, no solutions at all.', false], ['It means there are two real roots.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Exactly. The precise claim is about REAL roots, and precision is the point.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('The lesson is careful with this word: real, not "any".', 'bad'))),
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
        const alt = [v + 1, v - 1, v + 2, v * 2, v - 2].find((c) => {
          const cand = s.replace(num[0], String(c));
          return c !== v && cand !== ans && !seen.has(cand);
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
    { name: 'Close the square', icon: '⬛', blurb: 'What number completes it?', rounds: 6, think: false,
      say: '⬛ Halve, then square.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const b = [4, 6, 8, 10, 12, 14][i % 6];
        const half = b / 2, add = half * half;
        return {
          type: 'choice',
          prompt: G1.art(SCENE9.squareStep(b, { caption: 'x² + ' + b + 'x — the corner is missing' }),
            `What number must be added to <b>x² + ${b}x</b> to make a perfect square?`),
          options: [String(add), String(half), String(b * b)],
          answer: String(add),
          why: (v) => Number(v) === half ? 'That is half the coefficient — you must square it as well.'
            : 'Square the whole coefficient instead of half of it.',
          hints: [`Half of ${b} is ${half}.`, `Square it: ${half} × ${half}.`, `That is ${add}.`],
          solution: `Half of ${b} is ${half}, and <b>${add}</b> closes the square: x² + ${b}x + ${add} = (x + ${half})².`,
        };
      } },
    { name: 'The formula', icon: '🧮', blurb: 'Apply the general formula.', rounds: 6, think: false,
      say: '🧮 a, b, c in that order.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        /* build equations with whole-number roots so the answer is exact */
        const r1 = UI.rint(1, 5), r2 = -UI.rint(1, 5);
        const b = -(r1 + r2), c = r1 * r2;
        const disc = b * b - 4 * c;
        const root = Math.sqrt(disc);
        const bigger = (b + root) / 2, smaller = (b - root) / 2;
        const hi = Math.max(bigger, smaller), lo = Math.min(bigger, smaller);
        return {
          type: 'choice',
          prompt: G1.art(SCENE9.valueTable([1, 2, 3], (k) => k, { rowA: 'coefficient', rowB: 'value', caption: `a = 1, b = ${b}, c = ${c}` }),
            `Solve <b>x² ${b < 0 ? '− ' + Math.abs(b) : '+ ' + b}x ${c < 0 ? '− ' + Math.abs(c) : '+ ' + c} = 0</b> with the general formula.`),
          options: [`x = ${hi} or x = ${lo}`, `x = ${-hi} or x = ${-lo}`, `x = ${hi} only`],
          answer: `x = ${hi} or x = ${lo}`,
          why: (v) => String(v) === `x = ${-hi} or x = ${-lo}` ? 'Check the signs: −b is taken, so a negative b flips positive.'
            : 'A positive discriminant gives two roots, not one.',
          hints: [`The discriminant is b² − 4ac = ${disc}.`, `Its square root is ${root}.`, `x = (${-b} ± ${root}) ÷ 2.`],
          solution: `x = (${-b} ± ${root}) ÷ 2 gives <b>${hi}</b> and <b>${lo}</b>.`,
        };
      } },
    { name: 'How many real roots', icon: '🔢', blurb: 'The discriminant decides.', rounds: 6, think: true,
      say: '🔢 Think first: sign of b² − 4ac, then the count.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const mode = i % 3;                    /* 0: two, 1: one, 2: none */
        const a = 1;
        const b = [4, 6, 2, 8, 10, 3][i % 6];
        const disc = mode === 0 ? 16 : mode === 1 ? 0 : -7;
        const c = (b * b - disc) / 4;
        const count = mode === 0 ? 2 : mode === 1 ? 1 : 0;
        return {
          type: 'choice',
          problem: {
            sentences: ['The discriminant of a quadratic is b² − 4ac.',
              'Its sign decides how many REAL roots the equation has.',
              `The equation is x² + ${b}x + ${c} = 0.`],
            question: 1, keys: ['real', 'sign'], extras: [2],
          },
          prompt: G1.art(SCENE9.valueTable([1, 2, 3], (k) => k, { rowA: 'coefficient', rowB: 'value', caption: `a = 1, b = ${b}, c = ${c}` }),
            `How many <b>real</b> roots does this equation have?`),
          options: [String(count), String(count === 2 ? 0 : 2), 'It cannot be known'],
          answer: String(count),
          why: () => 'Compute b² − 4ac and read its sign: positive → two, zero → one, negative → none real.',
          hints: [`b² is ${b * b}.`, `4ac is ${4 * c}.`, `b² − 4ac = ${disc}, which is ${disc > 0 ? 'positive' : disc === 0 ? 'zero' : 'negative'}.`],
          solution: `The discriminant is <b>${disc}</b>, so there ${count === 1 ? 'is' : 'are'} <b>${count}</b> real root${count === 1 ? '' : 's'}.`,
        };
      } },
  ],

  ghubar: ['Add the missing piece to one side only.', 'The formula always gives two real answers.', 'A negative discriminant means no solutions at all.'],
  praise: ['Square closed!', 'Formula applied!', 'Discriminant read!', 'Count decided!'],
  finale: 'Half, square, add to both sides — and the discriminant tells you what to expect. ⬛',
};

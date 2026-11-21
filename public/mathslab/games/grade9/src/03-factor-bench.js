/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 9 · Factor Bench · greatest common factor, difference of two squares, trinomials, and the zero
   product property that turns factors into roots
   Source: G09-U01-MATH-L02 — تحليل كثيرات الحدود والمعادلات التربيعية
   (CCSS HSA-SSE.A.2 & HSA.REI.B.4), term 1.

   SCOPE — the three factoring structures the document names, in the order it names them: pull out the
   greatest common factor first, then recognise a difference of two squares, then factor a trinomial by
   finding two numbers whose product is c and whose sum is b. The finishing METHODS themselves — completing
   the square and the quadratic formula as a working procedure — are G09-U02-MAT-L01 (game 05); this game
   stops at the factors and reads the roots off them by the zero product property. It never factors a
   trinomial that has no integer factor pair, because the document's own objective is structural, and
   pretending every trinomial factors would teach a false rule.
   Named misconceptions: «skip the common factor and start with the brackets», «x² − 49 cannot factor
   because 49 is a square», and «x² + 5x + 6 = 30 means each bracket equals 30».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g9-factor-bench', code: 'G09-U01-MATH-L02', title: 'Factor Bench', emoji: '🧩',
  accent: '#6b4a7a', accentDeep: '#523860', skyA: '#f7f2fa', skyB: '#e4d8ed',
  topic: 'Factoring polynomials and reading roots from factors', band: 'g912', lang: 'en',
  objective: 'I can factor out the GCF, recognise a difference of squares, factor a trinomial, and read its roots.',
  welcome: 'A complicated expression is a machine built from simple parts. Take it apart and each piece is plain. 🧩',
  learnBlurb: 'Pull the common factor out first; then look for two numbers that multiply and add.',
  how: {
    what: 'Factor out the greatest common factor of every term. A difference of two squares a² − b² becomes (a − b)(a + b). For x² + bx + c, find two numbers whose product is c and whose sum is b, and write (x + p)(x + q).',
    steps: ['🧩 Take out the largest factor shared by every term.', 'Match the leftover to a pattern: two squares, or a trinomial.', '✅ A product equals zero only when one of its factors is zero.'],
  },

  learn: [
    { say: '<b>6x² + 9x</b> — both terms share 3x. Take it out and you get <b>3x(2x + 3)</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE9.factBox(3, 5, { expr: '6x² + 9x', caption: 'the common factor is 3x' }) })); } },
    { say: '<b>x² − 49</b> is a square minus a square: <b>(x − 7)(x + 7)</b>. The middle term cancels, which is why nothing shows in the middle.',
      draw(el) { el.append(UI.h('div', { html: SCENE9.rootsGraph(-7, 7, { caption: 'x² − 49 crosses the axis at −7 and 7' }) })); } },
    { say: 'Your turn. Factor <b>x² + 5x + 6</b> — which pair of numbers multiplies to 6 and adds to 5?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE9.factBox(6, 5, { expr: 'x² + 5x + 6', caption: 'product 6, sum 5' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['(x + 2)(x + 3)', true], ['(x + 1)(x + 6)', false], ['(x + 5)(x + 6)', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 2 × 3 = 6 and 2 + 3 = 5.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '(x + 1)(x + 6)' ? '1 × 6 = 6, but 1 + 6 = 7, not 5.' : 'Multiply your brackets out and check the middle term.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says <b>x² + 5x + 6 = 0</b> means each bracket equals 6, since the product is 6. Is that right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('The product is six, so each bracket can be six.', 5200);
        el.append(UI.h('div', { html: SCENE9.rootsGraph(-3, -2, { caption: 'the roots are where the product is ZERO' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — the product is zero, so one of the brackets must be zero.', true], ['Yes — each bracket equals 6.', false], ['The equation has no solution.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. The zero product property is why we can split the equation.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('What number times another gives zero?', 'bad'))),
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
    { name: 'Common factor', icon: '🧲', blurb: 'Take out the largest shared factor.', rounds: 6, think: false,
      say: '🧲 Find what every term shares.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const g = UI.rint(2, 6), a = UI.rint(1, 3), b = UI.rint(1, 4);
        const expr = `${g * a}x² + ${g * b}x`;
        const ans = `${g}x(${a}x + ${b})`;
        return {
          type: 'choice',
          prompt: G1.art(SCENE9.factBox(g * b, g * a, { expr, caption: 'what do both terms share?' }),
            `Factor <b>${expr}</b> completely.`),
          options: [ans, `${g}(${a}x² + ${b}x)`, `${g}x(${a}x + ${b}x)`],
          answer: ans,
          why: (v) => String(v).startsWith(g + '(') ? 'x is shared too — take it out as well.'
            : 'The bracket must not still contain a common x.',
          hints: [`Both coefficients divide by ${g}.`, 'Both terms also contain an x.', `Take out ${g}x.`],
          solution: `<b>${ans}</b>, and nothing more is shared.`,
        };
      } },
    { name: 'Two squares', icon: '⬜', blurb: 'a² − b² is (a − b)(a + b).', rounds: 6, think: false,
      say: '⬜ Both terms are perfect squares with a minus between.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const r = [2, 3, 4, 5, 6, 7, 8, 9][i % 8];
        return {
          type: 'choice',
          prompt: G1.art(SCENE9.factBox(r * r, 0, { expr: `x² − ${r * r}`, caption: `${r * r} is ${r} squared` }),
            `Factor <b>x² − ${r * r}</b>.`),
          options: [`(x − ${r})(x + ${r})`, `(x − ${r})²`, `(x + ${r})²`],
          answer: `(x − ${r})(x + ${r})`,
          why: (v) => /\)²/.test(String(v)) ? 'A squared bracket gives a middle term; here the middle cancels.'
            : 'One bracket needs a minus and the other a plus.',
          hints: [`${r * r} = ${r} × ${r}.`, 'A difference of squares needs one minus and one plus.', `(x − ${r})(x + ${r}).`],
          solution: `x² − ${r * r} = <b>(x − ${r})(x + ${r})</b>.`,
        };
      } },
    { name: 'Find the pair', icon: '🔑', blurb: 'Product c, sum b — then read the roots.', rounds: 6, think: true,
      say: '🔑 Think first: which pair of numbers does both jobs?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const pairs = [[2, 3], [1, 4], [2, 4], [1, 6], [3, 4], [2, 5]];
        const [p, q] = pairs[i % 6];
        const b = p + q, c = p * q;
        return {
          type: 'choice',
          problem: {
            sentences: ['A quadratic is set equal to zero so its factors can be used.',
              'The zero product property says a product is zero only when a factor is zero.',
              `The equation is x² + ${b}x + ${c} = 0.`],
            question: 1, keys: ['zero', 'factor'], extras: [2],
          },
          prompt: G1.art(SCENE9.factBox(c, b, { expr: `x² + ${b}x + ${c}`, caption: `product ${c}, sum ${b}` }),
            `What are the two roots of <b>x² + ${b}x + ${c} = 0</b>?`),
          options: [`x = ${-p} and x = ${-q}`, `x = ${p} and x = ${q}`, `x = ${-c} and x = ${-b}`],
          answer: `x = ${-p} and x = ${-q}`,
          why: (v) => String(v) === `x = ${p} and x = ${q}` ? 'Those are the numbers in the brackets — but each bracket must be ZERO, so the signs flip.'
            : 'Divide by the coefficient of x inside each bracket.',
          hints: [`The brackets are (x + ${p})(x + ${q}).`, 'Set each bracket to zero.', `x + ${p} = 0 gives x = ${-p}.`],
          solution: `(x + ${p})(x + ${q}) = 0 gives <b>x = ${-p}</b> and <b>x = ${-q}</b>.`,
        };
      } },
  ],

  ghubar: ['Skip the common factor and go straight to the brackets.', 'x² − 49 cannot factor.', 'A product of 6 means each bracket is 6.'],
  praise: ['Common factor out!', 'Squares recognised!', 'Pair found!', 'Roots read!'],
  finale: 'Structure first, then the pair — and a product of zero splits into single factors. 🧩',
};

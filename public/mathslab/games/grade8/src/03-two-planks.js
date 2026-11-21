/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 8 · Two Planks · one equation in one or two steps, then a system of two equations solved by
   substitution, and the crossing point read off a graph
   Source: G08-U01-MATH-L02 — المعادلات الخطية ونظم المعادلات الخطية (CCSS 8.EE.C.7 & 8.EE.C.8), term 1.

   SCOPE — this game takes the SOLVING side: a solution to 8.EE.C.7 is a value that makes the two sides
   equal, reached by undoing operations in reverse order; a solution to 8.EE.C.8 is a PAIR that satisfies
   BOTH equations at once, found by substitution and CHECKED. The slope/intercept reading belongs to game 01
   and the rate-of-change reading to game 05, so neither is repeated here. What the two G08 lessons share is
   the notion of a line as a set of pairs; the split (this game = algebra and the crossing, game 04 = the
   decision between two plans) is recorded in docs/mowazi/g8-expansion.md.

   Mechanic = the thinking: the two-line picture is drawn from the two rules in the question, so the
   crossing can be believed, but its coordinates are never printed — the child has to solve and then verify
   by substituting back into BOTH rules.
   Named misconceptions: «a solution is any number that appears in the equation», «a crossing on the drawing
   is a proof», and «the same x value solves each equation separately, so it solves the pair».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g8-system-crossing', code: 'G08-U01-MATH-L02', title: 'Two Planks', emoji: '🪵',
  accent: '#2f5f6e', accentDeep: '#244a56', skyA: '#f0f8f9', skyB: '#d3e8ec',
  topic: 'Solving equations and systems, and checking the crossing point', band: 'g68', lang: 'en',
  objective: 'I can solve a two-step equation, solve a pair of equations by substitution, and check the result in both.',
  welcome: 'Two planks lean across the same beam. Where they meet is the only spot that fits both at once. 🪵',
  learnBlurb: 'Undo the operations in reverse, then put the answer back to check it.',
  how: {
    what: 'A two-step equation is undone from the outside in: take away the added number, then divide. For a pair of equations, substitute one rule into the other to leave a single equation in one letter.',
    steps: ['🪵 Undo the addition or subtraction first.', 'Divide by the number attached to the letter.', '✅ Substitute the pair back into BOTH rules — both must hold.'],
  },

  learn: [
    { say: 'Solve <b>2x + 3 = 11</b>. Take 3 away from both sides: <b>2x = 8</b>. Then divide both sides by 2: <b>x = 4</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE8.stepTable([['2x + 3', '11', 'start'], ['2x', '8', '− 3'], ['x', '4', '÷ 2']], { colA: 'left', colB: 'right', colOp: 'step' }) })); } },
    { say: 'A pair: <b>y = 2x</b> and <b>3x + y = 20</b>. Put 2x in place of y, giving 5x = 20, so x = 4 and y = 8. Both rules hold: 3(4) + 8 = 20.',
      draw(el) { el.append(UI.h('div', { html: SCENE8.twoLines({ a: { m: 2, b: 0 }, b: { m: -3, b: 20 }, xmax: 7, aName: 'y = 2x', bName: '3x + y = 20', caption: 'the pair that satisfies both is where the lines meet' }) })); } },
    { say: 'Your turn. Solve <b>3(x + 2) = 21</b>. What is x?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE8.stepTable([['3(x + 2)', '21', 'start'], ['3x + 6', '21', 'distribute'], ['3x', '15', '− 6'], ['x', '?', '÷ 3']], { colOp: 'step' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['5', true], ['7', false], ['9', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 3(5 + 2) = 3 × 7 = 21. It checks.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '7' ? 'That divides 21 by 3 but forgets the 2 inside the bracket.' : 'Put your answer back into the bracket to test it.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says <b>x = 4</b> works for each rule separately, so it must solve the pair. Does one number being in both rules settle it?', wait: true,
      draw(el, L) {
        GHUBAR.pop('If four works in each rule on its own, it works for the pair.', 5200);
        el.append(UI.h('div', { html: SCENE8.twoLines({ a: { m: 1, b: 1 }, b: { m: -1, b: 9 }, xmax: 8, aName: 'y = x + 1', bName: 'y = -x + 9', caption: 'same x? check both heights' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — the pair must share one x AND one y.', true], ['Yes — one x is enough.', false], ['Only if the x is positive.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. A pair means a single point, so both letters must agree.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('A point has two coordinates, and both have to fit both rules.', 'bad'))),
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
        const alt = [v + 1, v - 1, v + 2, v - 2, v * 2].find((c) => {
          const cand = s.replace(num[0], String(c));
          return c !== v && !seen.has(cand) && cand !== ans;
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
    { name: 'Two steps', icon: '🪜', blurb: 'Undo in reverse order.', rounds: 6, think: false,
      say: '🪜 Take away first, divide second.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const a = UI.rint(2, 6), x = UI.rint(2, 9), b = UI.rint(2, 9);
        const c = a * x + b;
        return {
          type: 'choice',
          prompt: G1.art(SCENE8.stepTable([['${a}x + ${b}', String(c), 'start'], ['${a}x', String(c - b), '− ' + b], ['x', '?', '÷ ' + a]], { colOp: 'step' }),
            `Solve <b>${a}x + ${b} = ${c}</b>. What is x?`),
          options: [String(x), String(c - b), String(c / a)],
          answer: String(x),
          why: (v) => Number(v) === c - b ? 'That is the value after the first step, not x.'
            : 'Take the number away from both sides BEFORE dividing.',
          hints: [`Take ${b} away from both sides.`, `${c} − ${b} = ${c - b}.`, `Now divide by ${a}.`],
          solution: `${a}x = ${c - b}, so x = <b>${x}</b>, and ${a}(${x}) + ${b} = ${c} checks.`,
        };
      } },
    { name: 'Substitute', icon: '🔁', blurb: 'Put one rule inside the other.', rounds: 6, think: false,
      say: '🔁 Replace the letter you already know how to write.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const m = UI.rint(1, 3), b = UI.rint(0, 4);
        const n = UI.rint(1, 3);
        const x = UI.rint(1, 5);
        const y = m * x + b;
        const k = n * x + y;                       /* coefficient of x in the second rule */
        return {
          type: 'choice',
          prompt: G1.art(SCENE8.twoLines({ a: { m, b }, b: { m: -n, b: k }, xmax: Math.max(x + 4, 8), aName: 'y = ' + m + 'x + ' + b, bName: n + 'x + y = ' + k, caption: 'two rules, one shared point' }),
            `The pair is <b>y = ${m}x + ${b}</b> and <b>${n}x + y = ${k}</b>. What is x?`),
          options: [String(x), String(y), String(k)],
          answer: String(x),
          why: (v) => Number(v) === y ? 'That is y. Work with the pair to get x first.'
            : 'Substitute the first rule into the second, then divide.',
          hints: [`Write ${m}x + ${b} where y was.`, `That gives ${n + m}x + ${b} = ${k}.`, `Subtract ${b}, then divide by ${n + m}.`],
          solution: `${n + m}x = ${k - b}, so x = <b>${x}</b> and y = ${y}.`,
        };
      } },
    { name: 'Check the crossing', icon: '✖️', blurb: 'Read the point and verify it.', rounds: 6, think: true,
      say: '✖️ Think first: which pair satisfies both rules?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const x = UI.rint(1, 5), y1 = UI.rint(2, 9);
        const m1 = UI.rint(1, 2), m2 = -UI.rint(1, 2);
        const b1 = y1 - m1 * x, b2 = y1 - m2 * x;
        const pair = `(${x}, ${y1})`;
        return {
          type: 'choice',
          problem: {
            sentences: ['Two rules are drawn on one set of axes and they cross at a single point.',
              'A crossing point must satisfy both rules, not just the one it was read from.',
              `The rules are y = ${m1}x ${b1 < 0 ? '− ' + Math.abs(b1) : '+ ' + b1} and y = ${m2}x ${b2 < 0 ? '− ' + Math.abs(b2) : '+ ' + b2}.`],
            question: 2, keys: ['both', 'cross'], extras: [1],
          },
          prompt: G1.art(SCENE8.twoLines({ a: { m: m1, b: b1 }, b: { m: m2, b: b2 }, xmax: x + 5, aName: 'first rule', bName: 'second rule', caption: 'the ring marks the meeting point' }),
            `Which pair satisfies <b>both</b> rules?`),
          options: [pair, `(${x}, ${y1 + 2})`, `(${x + 1}, ${y1})`],
          answer: pair,
          why: () => 'Test each pair in both rules — the pair that fails one is not a solution.',
          hints: [`Try x = ${x} in the first rule.`, `Try the same x in the second rule.`, 'Both must give the same y.'],
          solution: `x = ${x} gives y = ${y1} in both rules, so <b>${pair}</b> is the solution.`,
        };
      } },
  ],

  ghubar: ['A solution is any number printed in the equation.', 'One shared x solves the pair.', 'A neat crossing on the drawing is the proof.'],
  praise: ['Equation solved!', 'Substitution done!', 'Crossing checked!', 'Both rules hold!'],
  finale: 'Undo the operations, substitute the rules, then verify in both. 🪵',
};

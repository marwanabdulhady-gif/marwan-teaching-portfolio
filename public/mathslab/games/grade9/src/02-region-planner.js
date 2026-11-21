/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 9 · Region Planner · a system of two linear equations by elimination, then the shift from a single
   solution point to the solution REGION of two linear inequalities
   Source: G09-U01-MAT-L02 — أنظمة المعادلات والمتباينات الخطية ونمذجة القيود الواقعية
   (CCSS HSA.REI.C.6 & HSA.REI.D.12), term 1.

   SCOPE — the lesson's own core idea is the difference between two kinds of answer: a system of EQUATIONS
   gives one point where two conditions hold together, while a system of INEQUALITIES (REI.D.12) gives a
   whole region of permitted choices under constraints. This game drills the system by elimination (not by
   substitution — that is G08-U01-MATH-L02's ground) and then makes the region the visible object: the
   shading is computed by clipping the rectangle against both boundaries, so the picture is true for the
   pair in the question and the corner is never printed.
   Named misconceptions: «every point in the drawing is a solution», «the boundary line is part of the
   solution either way», and «a region needs a single corner to be an answer».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g9-region-planner', code: 'G09-U01-MAT-L02', title: 'Region Planner', emoji: '🗺️',
  accent: '#1f6b6b', accentDeep: '#155050', skyA: '#eefaf9', skyB: '#cfe9e7',
  topic: 'Systems by elimination and the solution region of two inequalities', band: 'g912', lang: 'en',
  objective: 'I can solve a linear system by elimination and draw the region where two inequalities both hold.',
  welcome: 'A bakery splits its day between two loaves under a flour limit and a time limit. Every point in the permitted region is a plan it can actually bake. 🗺️',
  learnBlurb: 'Two equations meet at a point; two inequalities share a whole region.',
  how: {
    what: 'Adding or subtracting the two equations of a system can cancel one variable, leaving one equation you can solve. For inequalities, draw each boundary line and shade the side that satisfies it; where the shadings overlap, both conditions hold.',
    steps: ['🗺️ Line the two equations up and add or subtract to cancel a variable.', 'For an inequality, test one easy point to decide which side to shade.', '✅ The overlap of both shadings is the set of permitted choices.'],
  },

  learn: [
    { say: 'Solve <b>x + y = 7</b> and <b>x − y = 1</b>. Adding them cancels y: 2x = 8, so <b>x = 4</b> and then <b>y = 3</b>. One point satisfies both.',
      draw(el) { el.append(UI.h('div', { html: SCENE8.twoLines({ a: { m: -1, b: 7 }, b: { m: 1, b: -1 }, xmax: 8, aName: 'x + y = 7', bName: 'x − y = 1', caption: 'two conditions, one shared point' }) })); } },
    { say: 'Now switch one of them to an inequality. <b>x + y ≤ 8</b> is not a line any more — it is everything on one side of the line.',
      draw(el) { el.append(UI.h('div', { html: SCENE9.region({ m: -1, b: 8, op: '≤' }, { m: -1, b: 8, op: '≤' }, { n1: 'x + y ≤ 8', n2: '', xmax: 10, ymax: 10, caption: 'one inequality: a half-plane' }) })); } },
    { say: 'Your turn. With <b>x + y ≤ 8</b> AND <b>y ≥ x + 1</b>, is the point <b>(2, 2)</b> allowed?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE9.region({ m: -1, b: 8, op: '≤' }, { m: 1, b: 1, op: '≥' }, { n1: 'x + y ≤ 8', n2: 'y ≥ x + 1', xmax: 9, ymax: 10, caption: 'the green overlap is the permitted set' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['Yes — it satisfies the first inequality, so it is allowed.', false], ['No — it fails y ≥ x + 1 because 2 ≥ 3 is false.', true], ['Yes — it is inside the shaded area.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. Test each inequality with the numbers — never trust the picture alone.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Substitute (2, 2) into both inequalities and check each one.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says every point inside the drawing is a solution. What is wrong with that?', wait: true,
      draw(el, L) {
        GHUBAR.pop('If it is on the page it is a solution.', 5200);
        el.append(UI.h('div', { html: SCENE9.region({ m: -1, b: 8, op: '≤' }, { m: 1, b: 1, op: '≥' }, { n1: 'x + y ≤ 8', n2: 'y ≥ x + 1', xmax: 9, ymax: 10 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['Only the overlapping region — the rest of the page fails at least one condition.', true], ['He is right, the page is the solution.', false], ['Only the two boundary lines count.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Correct. The solution is the intersection of the two half-planes.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Look for the part shaded by BOTH conditions.', 'bad'))),
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
    { name: 'Eliminate', icon: '➖', blurb: 'Add or subtract to cancel a variable.', rounds: 6, think: false,
      say: '➖ Stack them and look for opposite coefficients.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const x = UI.rint(2, 8), y = UI.rint(1, 7);
        const s = x + y, d = x - y;
        return {
          type: 'choice',
          prompt: G1.art(SCENE9.valueTable([1, 2, 3], (t) => t, { ask: 3, rowA: 'step', rowB: 'value', caption: 'two equations, one shared pair' }),
            `Solve the system <b>x + y = ${s}</b> and <b>x − y = ${d}</b>. What is x?`),
          options: [String(x), String(y), String(s)],
          answer: String(x),
          why: (v) => Number(v) === y ? 'That is y — you solved for the other letter.'
            : 'Adding the equations cancels y; work on that.',
          hints: [`Add the two equations: 2x = ${s + d}.`, `Divide by 2.`, `x = ${x}.`],
          solution: `Adding gives 2x = ${s + d}, so x = <b>${x}</b> and y = ${y}.`,
        };
      } },
    { name: 'Which side', icon: '🌓', blurb: 'Test a point to shade the right half.', rounds: 6, think: false,
      say: '🌓 Try the origin — it is the easiest test point.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const m = [1, -1, 2, -2][i % 4], b = UI.rint(2, 7);
        const up = i % 2 === 0;
        const op = up ? '≥' : '≤';
        const line = `${m === 1 ? '' : m === -1 ? '−' : m}x + ${b}`;
        const holdsOrigin = up ? 0 >= b : 0 <= b;
        return {
          type: 'choice',
          prompt: G1.art(SCENE9.region({ m, b, op }, { m, b, op }, { n1: `y ${op} ${line}`, n2: '', xmax: 9, ymax: 12, caption: 'one boundary, two possible sides' }),
            `For <b>y ${op} ${line}</b>, does the point (0, 0) satisfy it?`),
          options: [holdsOrigin ? 'Yes — substituting gives 0 against ' + b + ', and the condition holds.' : 'No — substituting gives 0 against ' + b + ', and the condition fails.',
            holdsOrigin ? 'No — the origin is always excluded.' : 'Yes — the origin is always in the region.',
            'It cannot be checked without the drawing.'],
          answer: holdsOrigin ? 'Yes — substituting gives 0 against ' + b + ', and the condition holds.' : 'No — substituting gives 0 against ' + b + ', and the condition fails.',
          why: () => 'Substitute the coordinates into the inequality; the numbers decide, not the picture.',
          hints: [`Put x = 0 and y = 0 into y ${op} ${line}.`, `The left side becomes 0 and the right becomes ${b}.`, holdsOrigin ? `0 ${op} ${b} is true.` : `0 ${op} ${b} is false.`],
          solution: `Substituting gives 0 ${op} ${b}, which is ${holdsOrigin ? 'true' : 'false'}, so the origin <b>${holdsOrigin ? 'is' : 'is not'}</b> in the region.`,
        };
      } },
    { name: 'Both at once', icon: '🗺️', blurb: 'The region where two conditions hold.', rounds: 6, think: true,
      say: '🗺️ Think first: which conditions are BOTH true?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const m2 = [1, 2][i % 2], b2 = UI.rint(1, 3);
        const px = UI.rint(0, 2), py = UI.rint(0, 2);
        const inFirst = px + py <= 8;
        const inSecond = m2 * px + b2 <= py;
        const ok = inFirst && inSecond;
        return {
          type: 'choice',
          problem: {
            sentences: ['A bakery must stay under a flour limit and above a minimum batch count.',
              'A plan is permitted only when it satisfies every constraint at the same time.',
              `The constraints are x + y ≤ 8 and y ≥ ${m2}x + ${b2}.`],
            question: 1, keys: ['every', 'constraint'], extras: [2],
          },
          prompt: G1.art(SCENE9.region({ m: -1, b: 8, op: '≤' }, { m: m2, b: b2, op: '≥' }, { n1: 'x + y ≤ 8', n2: 'y ≥ ' + m2 + 'x + ' + b2, xmax: 9, ymax: 12 }),
            `Is the plan <b>(${px}, ${py})</b> permitted?`),
          options: [ok ? 'Yes — it satisfies both constraints.' : 'No — it fails at least one constraint.',
            ok ? 'No — every plan on the page is excluded.' : 'Yes — it is inside the drawing.',
            'Only the boundary points are permitted.'],
          answer: ok ? 'Yes — it satisfies both constraints.' : 'No — it fails at least one constraint.',
          why: () => 'Test both constraints with the numbers; one failure is enough to reject the plan.',
          hints: [`Check ${px} + ${py} ≤ 8.`, `Check ${py} ≥ ${m2}×${px} + ${b2}.`, ok ? 'Both hold.' : 'One of them fails.'],
          solution: `${px} + ${py} = ${px + py} and ${m2}×${px} + ${b2} = ${m2 * px + b2}, so the plan <b>${ok ? 'is' : 'is not'}</b> permitted.`,
        };
      } },
  ],

  ghubar: ['Every point on the page is a solution.', 'The boundary is in the solution either way.', 'A region needs one corner to be an answer.'],
  praise: ['Variable eliminated!', 'Side tested!', 'Region found!', 'Constraint checked!'],
  finale: 'Equations meet at a point; inequalities share a region. 🗺️',
};

/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 8 · Builder’s Corner · the theorem in architecture: legs, hypotenuse, and the converse that tests
   a corner
   Source: G08-U01-MAT-L02 — نظرية فيثاغورس وعكسها وتطبيقاتها في المسافات والعمارة (CCSS 8.G.B.6–8), term 1.

   SCOPE — this game lives in the BUILDING frame of the standard: which side is the hypotenuse (B.6), a
   missing leg or hypotenuse in a right triangle (B.7), and the CONVERSE used to test whether a corner is
   truly square (B.8) — the 3-4-5 rope the surveyors of Basra and Kufa are described as using in the
   lesson. The coordinate-plane distance work of the same standard is deliberately NOT here; it belongs to
   G08-U02-MAT-L02 (game 06) and its second combined reading G08-U02-MATH-L02 (game 07). The split is
   recorded in docs/mowazi/g8-expansion.md.

   Mechanic = the thinking: every figure is a real right triangle drawn to scale from the two legs in the
   question, so the child can see that the hypotenuse is the side opposite the square corner and the
   longest side — the picture never prints the missing length.
   Named misconceptions: «any side can be c», «a² + b² = c² finds a leg by adding», and «a triangle with
   sides 7-24-25 must be right because the numbers look familiar» (the converse must be CHECKED).
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g8-pythagoras-arch', code: 'G08-U01-MAT-L02', title: 'Builders Corner', emoji: '🧱',
  accent: '#7a5230', accentDeep: '#5d3d22', skyA: '#fbf5ec', skyB: '#efdfc7',
  topic: 'Pythagoras in building: hypotenuse, missing side, and the converse', band: 'g68', lang: 'en',
  objective: 'I can pick the hypotenuse, find a missing side with <b>a² + b² = c²</b>, and use the converse to test a corner.',
  welcome: 'A mason checks a wall corner with nothing but a knotted rope. Three, four, five — and the corner is square. 🧱',
  learnBlurb: 'The hypotenuse is the side facing the square corner, and it is always the longest.',
  how: {
    what: 'In a right triangle the two shorter sides squared add to the longest side squared. If you are looking for the longest side you add; if you already have it, you subtract.',
    steps: ['🧱 Put the square corner in front of you and find the opposite side.', 'Square the two sides you know.', '✅ Add if the longest side is missing, subtract if it is known.'],
  },

  learn: [
    { say: 'The two short sides are <b>3</b> and <b>4</b>. Their squares are 9 and 16, which add to 25 — so the longest side is <b>5</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE8.rightTri({ a: 3, b: 4, caption: 'the square corner sits between the 3 and the 4' }) })); } },
    { say: 'Now the longest side is already known: <b>13</b>, with one short side <b>5</b>. Subtract: 169 − 25 = 144, and the missing side is <b>12</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE8.rightTri({ a: 5, b: 12, hypKnown: true, hyp: 13, caption: 'subtract when the longest side is the one you know' }) })); } },
    { say: 'Turn it round as a test. A corner with sides <b>6</b>, <b>8</b> and <b>10</b>: does 36 + 64 equal 100?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE8.rightTri({ a: 6, b: 8, hypKnown: true, hyp: 10, caption: 'check before you call it square' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['Yes — 36 + 64 = 100, so the corner is right.', true], ['No — the numbers are too big.', false], ['Only a 3-4-5 triangle can be right.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Exactly — 6-8-10 is a scaled 3-4-5, and the test passes.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Test the squares: add the two shorter ones and compare.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says <b>7</b>, <b>24</b> and <b>25</b> make a right triangle because the numbers are famous. Must that be so?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Famous numbers always make a right triangle.', 5200);
        el.append(UI.h('div', { html: SCENE8.rightTri({ a: 7, b: 24, hypKnown: true, hyp: 25, caption: 'the test decides, not the reputation' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['It happens to be right — and we know only because 49 + 576 = 625.', true], ['Yes, because the numbers are well known.', false], ['No — 7 and 24 cannot be in a right triangle.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. The sum of the squares decides — nothing else.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Belief is not a test. Add the two squares.', 'bad'))),
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
    { name: 'Find the long side', icon: '📏', blurb: 'Two legs given, hypotenuse missing.', rounds: 6, think: false,
      say: '📏 Add the two squares.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const pick = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]][i % 6];
        const [a, b, c] = pick;
        return {
          type: 'choice',
          prompt: G1.art(SCENE8.rightTri({ a, b, caption: `the two short sides are ${a} and ${b}` }),
            `A wall corner has short sides <b>${a}</b> and <b>${b}</b>. How long is the diagonal bracing?`),
          options: [String(c), String(a + b), String(c + 1)],
          answer: String(c),
          why: (v) => Number(v) === a + b ? 'That just adds the two sides. The diagonal is shorter than walking both.'
            : 'Square both sides first, then take the square root.',
          hints: [`${a}² = ${a * a} and ${b}² = ${b * b}.`, `Add them: ${a * a + b * b}.`, 'Now take the square root.'],
          solution: `${a * a} + ${b * b} = ${a * a + b * b}, and the square root is <b>${c}</b>.`,
        };
      } },
    { name: 'Find a short side', icon: '📐', blurb: 'Hypotenuse known, subtract.', rounds: 6, think: false,
      say: '📐 Here you subtract, not add.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const pick = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]][i % 6];
        const [a, b, c] = pick;
        return {
          type: 'choice',
          prompt: G1.art(SCENE8.rightTri({ a, b, hypKnown: true, hyp: c, caption: `the bracing is ${c} and one short side is ${a}` }),
            `The bracing is <b>${c}</b> and one short side is <b>${a}</b>. How long is the other short side?`),
          options: [String(b), String(c - a), String(c + a)],
          answer: String(b),
          why: (v) => Number(v) === c - a ? 'That subtracts the sides themselves. Square them first.'
            : 'The longest side is already known, so you cannot add again.',
          hints: [`${c}² = ${c * c}.`, `Take away ${a}² = ${a * a}.`, `Left with ${c * c - a * a} — its square root is the side.`],
          solution: `${c * c} − ${a * a} = ${c * c - a * a}, and the square root is <b>${b}</b>.`,
        };
      } },
    { name: 'Square or not', icon: '🔍', blurb: 'Use the converse to test a corner.', rounds: 6, think: true,
      say: '🔍 Think first: which of the three is the longest side?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const good = i % 2 === 0;
        const base = [[6, 8, 10], [5, 12, 13], [9, 12, 15]][i % 3];
        const tri = good ? base : [base[0], base[1], base[2] + 1];
        const [a, b, c] = tri;
        const isRight = a * a + b * b === c * c;
        return {
          type: 'choice',
          problem: {
            sentences: ['A mason measures the three sides of a triangular frame.',
              'A frame is square only when the two shorter squares add to the longest square.',
              `The measured sides are ${a}, ${b} and ${c}.`],
            question: 2, keys: ['square', 'longest'], extras: [1],
          },
          prompt: G1.art(SCENE8.rightTri({ a, b, hypKnown: true, hyp: c, caption: 'test the squares, do not trust the shape' }),
            `A frame has sides <b>${a}</b>, <b>${b}</b> and <b>${c}</b>. Is its corner right-angled?`),
          options: [isRight ? `Yes — ${a * a} + ${b * b} = ${c * c}.` : `No — ${a * a} + ${b * b} is not ${c * c}.`,
            isRight ? `No — the sides are too uneven.` : `Yes — the longest side is ${c}.`,
            `Cannot be decided without an angle measure.`],
          answer: isRight ? `Yes — ${a * a} + ${b * b} = ${c * c}.` : `No — ${a * a} + ${b * b} is not ${c * c}.`,
          why: () => 'The converse is a test of numbers, not of how the drawing looks.',
          hints: [`The longest side is ${c}.`, `${a * a} + ${b * b} = ${a * a + b * b}.`, `Compare that with ${c * c}.`],
          solution: `${a * a} + ${b * b} = ${a * a + b * b} and c² = ${c * c}, so the corner is ${isRight ? '' : 'not '}right-angled.`,
        };
      } },
  ],

  ghubar: ['The longest side can be any of the three.', 'To find a short side, add the squares.', 'A familiar-looking triangle is always right.'],
  praise: ['Hypotenuse found!', 'Short side found!', 'Corner tested!', 'Converse used!'],
  finale: 'Find the square corner, name the longest side, then add or subtract. 🧱',
};

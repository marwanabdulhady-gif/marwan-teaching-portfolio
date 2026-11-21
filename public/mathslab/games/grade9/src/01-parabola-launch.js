/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 9 · Parabola Launch · quadratic functions, the vertex, the roots, and modelling a projectile
   Source: G09-U01-MAT-L01 — الدوال التربيعية والمعادلات من الدرجة الثانية ونمذجة المقذوفات
   (CCSS HSA.REI.B.4 & HSF.IF.C.7a), term 1. Age band stated by the document: 14–15.

   SCOPE — this game owns the GRAPH of a quadratic and the projectile READING of it: what the curve does,
   where its vertex sits, where it crosses the x-axis, and what a negative discriminant looks like against
   that axis. The finishing methods (factoring drill, completing the square, the quadratic formula working
   line by line) belong to G09-U01-MATH-L02 (game 03) and G09-U02-MAT-L01 (game 05); the extremum-as-a-
   maximum/minimum question belongs to game 06. Here the curve leads and the algebra only confirms it.
   The split is recorded in docs/mowazi/g9-expansion.md.

   Mechanic = the thinking: every parabola is drawn from its own a, h, k, so the vertex in the picture IS
   the vertex of the function in the question. Roots are marked as hollow rings only when the curve really
   reaches the axis — which is how a negative discriminant becomes visible instead of memorised.
   Named misconceptions: «the vertex is always the highest point», «a parabola always crosses the x-axis»,
   and «a negative discriminant means the arithmetic went wrong».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g9-parabola-launch', code: 'G09-U01-MAT-L01', title: 'Parabola Launch', emoji: '🎯',
  accent: '#35507a', accentDeep: '#263c5e', skyA: '#eef3fb', skyB: '#d5e0f2',
  topic: 'The graph of a quadratic: vertex, axis, roots, and a projectile model', band: 'g912', lang: 'en',
  objective: 'I can read the vertex and the roots of a quadratic from its graph and say how many real roots it has.',
  welcome: 'A fountain throws a sheet of water. The stream climbs, turns once at the top, and falls back. That single turning point is the vertex. 🎯',
  learnBlurb: 'The vertex is the one turning point; where the curve meets the x-axis, the height is zero.',
  how: {
    what: 'A quadratic draws a symmetric curve called a parabola. Its turning point is the vertex and the vertical line through it is the axis of symmetry. Where the curve meets the x-axis the function is zero, and those values are the roots.',
    steps: ['🎯 Find the turning point — it sits on the axis of symmetry.', 'Look at the direction: opening up gives a minimum, opening down gives a maximum.', '✅ Count the crossings of the x-axis; that is the number of real roots.'],
  },

  learn: [
    { say: 'Here is <b>y = (x − 2)² − 4</b>. It turns at <b>(2, −4)</b>, opens upward, and crosses the x-axis at two points.',
      draw(el) { el.append(UI.h('div', { html: SCENE9.parabola({ a: 1, h: 2, k: -4, roots: true, caption: 'y = (x − 2)² − 4' }) })); } },
    { say: 'Now <b>y = −(x − 2)² + 4</b>. The minus in front flips it over: it turns at <b>(2, 4)</b>, opens downward, and the turning point is now the HIGHEST value.',
      draw(el) { el.append(UI.h('div', { html: SCENE9.parabola({ a: -1, h: 2, k: 4, roots: true, caption: 'y = −(x − 2)² + 4' }) })); } },
    { say: 'Your turn. Look at <b>y = (x − 1)² + 3</b> — how many times does it cross the x-axis?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE9.parabola({ a: 1, h: 1, k: 3, ymin: -2, ymax: 9, caption: 'the whole curve sits above the axis' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['None — it never reaches the x-axis.', true], ['Twice — every parabola crosses twice.', false], ['Once — at x = 3.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — the lowest point is 3, above the axis, so there is no crossing.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Look at the lowest point: 3 is above the x-axis.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says the vertex is always the highest point of the curve. Is that true?', wait: true,
      draw(el, L) {
        GHUBAR.pop('The vertex is the top of the curve — that is what vertex means.', 5200);
        el.append(UI.h('div', { html: SCENE9.parabola({ a: 1, h: 1, k: -3, roots: true, caption: 'this one opens upward' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — it is the turning point; here it is the LOWEST point.', true], ['Yes — the vertex is always the highest.', false], ['A parabola has no vertex when it opens up.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Exactly. Opening up, the turning point is a minimum; opening down, a maximum.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Find the turning point on this curve and see where it sits.', 'bad'))),
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
    { name: 'Read the vertex', icon: '🎯', blurb: 'Where does the curve turn?', rounds: 6, think: false,
      say: '🎯 The turning point sits on the dashed axis.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const h = UI.rint(-3, 3), k = UI.rint(-4, 4), up = i % 2 === 0;
        const a = up ? 1 : -1;
        const shown = `y = ${up ? '' : '−'}(x ${h < 0 ? '+ ' + Math.abs(h) : '− ' + h})² ${k < 0 ? '− ' + Math.abs(k) : '+ ' + k}`;
        return {
          type: 'choice',
          prompt: G1.art(SCENE9.parabola({ a, h, k, roots: true, caption: shown }),
            `What is the vertex of <b>${shown}</b>?`),
          options: [`(${h}, ${k})`, `(${k}, ${h})`, `(${h}, ${-k})`],
          answer: `(${h}, ${k})`,
          why: (v) => String(v) === `(${k}, ${h})` ? 'That swaps the two coordinates — across comes first.'
            : 'The squared bracket is zero at the vertex, so the vertex carries +k, not −k.',
          hints: ['The bracket is squared, so it cannot be negative.', `The bracket is zero when x is ${h}.`, `Then the height is ${k}.`],
          solution: `The vertex is <b>(${h}, ${k})</b>.`,
        };
      } },
    { name: 'Count the roots', icon: '✖️', blurb: 'How many crossings?', rounds: 6, think: false,
      say: '✖️ Look, do not assume.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const mode = i % 3;                       /* 0 = two roots, 1 = none, 2 = one */
        const h = UI.rint(-2, 2);
        const k = mode === 0 ? -UI.rint(1, 5) : mode === 1 ? UI.rint(1, 5) : 0;
        const up = i % 2 === 0;
        const a = up ? 1 : -1;
        const kk = a < 0 ? -k : k;
        const count = mode === 2 ? 1 : mode === 0 ? 2 : 0;
        return {
          type: 'choice',
          prompt: G1.art(SCENE9.parabola({ a, h, k: kk, roots: true, caption: 'count the crossings of the x-axis' }),
            `How many real roots does this curve have?`),
          options: [String(count), String(count === 1 ? 2 : 0), 'Infinitely many'],
          answer: String(count),
          why: () => 'The number of real roots is exactly the number of times the curve meets the x-axis.',
          hints: ['Follow the curve with your eye.', 'The x-axis is the horizontal line through zero.', count === 1 ? 'It just touches it once.' : count === 0 ? 'It never reaches it.' : 'It passes through twice.'],
          solution: `The curve meets the x-axis ${count} time${count === 1 ? '' : 's'}, so there ${count === 1 ? 'is' : 'are'} <b>${count}</b> real root${count === 1 ? '' : 's'}.`,
        };
      } },
    { name: 'Model the flight', icon: '🚀', blurb: 'A projectile, read honestly.', rounds: 6, think: true,
      say: '🚀 Think first: what does the model stop describing?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const h = UI.rint(1, 3), k = UI.rint(3, 8);
        const a = -1;
        return {
          type: 'choice',
          problem: {
            sentences: ['A fountain jet is modelled by a quadratic in the horizontal distance x.',
              'The jet leaves the nozzle, turns once at the top, and comes back down to the same height.',
              `The model is y = −(x − ${h})² + ${k} metres.`],
            question: 1, keys: ['model', 'turns'], extras: [2],
          },
          prompt: G1.art(SCENE9.parabola({ a, h, k, roots: true, caption: 'y = −(x − ' + h + ')² + ' + k }),
            `What does this model tell you, and what does it NOT tell you?`),
          options: [`The highest point is ${k} m at ${h} m across; it says nothing about a real jet once the water breaks up.`,
            `The jet really reaches ${k} m, measured.`, `The jet never comes back down.`],
          answer: `The highest point is ${k} m at ${h} m across; it says nothing about a real jet once the water breaks up.`,
          why: () => 'A model is a description with a range. Beyond the range it is a guess, not a measurement.',
          hints: ['Read the vertex coordinates from the picture.', 'Is this a measurement or a description?', 'Say both: the number, and its status.'],
          solution: `The vertex <b>(${h}, ${k})</b> is the model's peak; the model makes no claim about a real jet outside it.`,
        };
      } },
  ],

  ghubar: ['The vertex is always the highest point.', 'Every parabola crosses the x-axis twice.', 'A negative discriminant means the arithmetic is wrong.'],
  praise: ['Vertex found!', 'Roots counted!', 'Model read honestly!', 'Axis located!'],
  finale: 'One turning point, symmetric about its axis, and the crossings tell you the roots. 🎯',
};

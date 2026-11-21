/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 9 · Arc Table · reading a quadratic from a table of values, its zero heights vs its greatest
   height, and components of a vector
   Source: G09-U01-L03 — «نبع | نقرأ المسار ولا ندّعي رحلة حقيقية» — الدالة التربيعية والمتجهات،
   مسودة رياضيات، الوحدة الأولى، الترم الأول.

   DOCUMENT CAVEAT, carried into the build — this bundle says of itself: «مسودة منتجة تحتاج مراجعة
   وتطويرًا، غير معتمدة. HTML وتنفيذ الألعاب الرقمية مؤجلان», and it also says its numbers and drawings are
   hypothetical and prove no real aircraft performance. So game 04 is the prototype the document asks for,
   the caveat travels with it, and the fictional path is never presented as a measurement.

   SCOPE — this lesson's own pathway is: substitute into a quadratic, read the roots / vertex / axis from
   the domain given, distinguish a ZERO height from a GREATEST height, and combine two vectors by their
   components while explaining the sign and the unit. The first two are a build-the-table activity, which
   is why this game leads with a table and only then shows the curve; the vector third is found in NO
   other Grade 9 document, so it is this game's alone. The root/vertex reading on a supplied picture is
   game 01's ground; here the student produces the numbers that make the picture.
   Named misconceptions: «zero height is the maximum height», «negative components are impossible», and
   «a vector is the same as its length».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g9-arc-table', code: 'G09-U01-L03', title: 'Arc Table', emoji: '📊',
  accent: '#8a5a1c', accentDeep: '#6b4413', skyA: '#fdf7ec', skyB: '#f0e0c2',
  topic: 'Table of values, zero vs greatest height, and vector components', band: 'g912', lang: 'en',
  objective: 'I can build a table for a quadratic and separate a zero height from the greatest height.',
  welcome: 'A model path is measured at fixed steps and written in a table. The table is where the story actually is. 📊',
  learnBlurb: 'Substitute each x, then read the shape: the zeros are at the ends, the peak is in the middle.',
  how: {
    what: 'To read a quadratic from a table, substitute each x and record y. A y of zero means the path touches the ground; the largest y in the table is the peak. For a vector, add the two components separately and keep the sign and the unit.',
    steps: ['📊 Substitute each x into the rule and fill the row.', 'A zero is a landing point; the biggest value is the top.', '✅ Add vectors component by component, sign and unit included.'],
  },

  learn: [
    { say: 'The rule is <b>y = −x² + 4x</b>. Substituting gives 0, 3, 4, 3, 0 for x = 0…4. The two zeros are landings; the 4 in the middle is the peak.',
      draw(el) { el.append(UI.h('div', { html: SCENE9.valueTable([0, 1, 2, 3, 4], (x) => -x * x + 4 * x, { rowA: 'x', rowB: 'y', caption: 'y = −x² + 4x' }) })); } },
    { say: 'Those five readings draw this curve. The same numbers, seen instead of written.',
      draw(el) { el.append(UI.h('div', { html: SCENE9.parabola({ a: -1, h: 2, k: 4, ymin: -1, ymax: 6, roots: true, caption: 'the table drawn' }) })); } },
    { say: 'Your turn. At <b>x = 3</b> the rule <b>y = −x² + 4x</b> gives what height?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE9.valueTable([0, 1, 2, 3, 4], (x) => -x * x + 4 * x, { ask: 3, rowA: 'x', rowB: 'y', caption: 'fill the dashed cell' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['3', true], ['4', false], ['−3', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — −(3)² + 4(3) = −9 + 12 = 3.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '4' ? 'That is the peak at x = 2, not x = 3.' : 'Square first, then add.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says the height of <b>0</b> at x = 4 must be the greatest height, because zero is the bottom of the table. Is it?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Zero is the biggest drop, so it is the greatest height.', 5200);
        el.append(UI.h('div', { html: SCENE9.valueTable([0, 1, 2, 3, 4], (x) => -x * x + 4 * x, { rowA: 'x', rowB: 'y', caption: 'where is the peak?' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — zero is the ground; the greatest height is 4 at x = 2.', true], ['Yes — zero is the greatest height.', false], ['The greatest height is 0 at both ends.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. Zero height is a landing; the peak is the largest value in the row.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Read the y row and find the largest number.', 'bad'))),
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
    { name: 'Fill the table', icon: '📊', blurb: 'Substitute and record.', rounds: 6, think: false,
      say: '📊 Square the x first, then apply the rule.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const k = UI.rint(2, 5);
        const xs = [0, 1, 2, 3, 4];
        const ask = UI.rint(1, 3);
        const val = (x) => -x * x + 2 * k * x;
        return {
          type: 'choice',
          prompt: G1.art(SCENE9.valueTable(xs, val, { ask, rowA: 'x', rowB: 'y', caption: 'y = −x² + ' + (2 * k) + 'x' }),
            `For <b>y = −x² + ${2 * k}x</b>, what is y when x = <b>${xs[ask]}</b>?`),
          options: [String(val(xs[ask])), String(val(xs[ask]) + 2), String(-val(xs[ask]))],
          answer: String(val(xs[ask])),
          why: (v) => Number(v) === -val(xs[ask]) ? 'That flips the sign — the minus belongs to x² only.'
            : 'Square x first, then subtract it from the linear term.',
          hints: [`x² is ${xs[ask] * xs[ask]}.`, `−${xs[ask] * xs[ask]} + ${2 * k}×${xs[ask]}.`, `That is ${val(xs[ask])}.`],
          solution: `−(${xs[ask]})² + ${2 * k}(${xs[ask]}) = <b>${val(xs[ask])}</b>.`,
        };
      } },
    { name: 'Zero or peak', icon: '⛰️', blurb: 'Separate the landings from the top.', rounds: 6, think: false,
      say: '⛰️ Two different questions, one table.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const r = UI.rint(2, 5);
        const val = (x) => -(x) * (x - 2 * r);
        const peakX = r, peakY = r * r;
        /* the distractors are built to be wrong AND distinct: the landing (always 0) and the last x
           (which is 2r and could otherwise coincide with the peak when r = 2) */
        const wrongLast = 2 * r === peakY ? 2 * r + 1 : 2 * r;
        return {
          type: 'choice',
          prompt: G1.art(SCENE9.valueTable([0, r, 2 * r], val, { rowA: 'x', rowB: 'y', caption: 'read the shape' }),
            `The table shows zero heights at both ends. What is the <b>greatest</b> height in the row?`),
          options: [String(peakY), '0', String(wrongLast)],
          answer: String(peakY),
          why: (v) => Number(v) === 0 ? 'Zero is a landing, not the top.' : 'The greatest height is the largest y value, not the last x.',
          hints: ['The zeros are the ends.', 'The peak sits halfway between them.', `At x = ${peakX} the height is ${peakY}.`],
          solution: `The greatest height is <b>${peakY}</b>, reached at x = ${peakX}; the zeros are landings.`,
        };
      } },
    { name: 'Add the vectors', icon: '➡️', blurb: 'Components, sign and unit.', rounds: 6, think: true,
      say: '➡️ Think first: are the components displacements or speeds?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const ax = UI.rint(1, 5), ay = UI.rint(-4, 4), bx = UI.rint(-3, 3), by = UI.rint(-4, 4);
        const fx = ax + bx, fy = ay + by;
        /* the classic wrong move mixes the components: across+up. Keep it only when it really differs
           from the correct sum, otherwise use a plain sign slip instead. */
        const mixed = `(${ax + by}, ${ay + bx}) m`;
        const right = `(${fx}, ${fy}) m`;
        const w2 = mixed !== right ? mixed : `(${fx}, ${fy + 2}) m`;
        const w3 = `(${ax - bx}, ${ay - by}) m` !== right && `(${ax - bx}, ${ay - by}) m` !== w2
          ? `(${ax - bx}, ${ay - by}) m` : `(${fx + 1}, ${fy}) m`;
        return {
          type: 'choice',
          problem: {
            sentences: ['A model path is written with displacements in metres, not speeds.',
              'Displacements add component by component, and a negative component means the opposite direction.',
              `The two displacements are (${ax}, ${ay}) and (${bx}, ${by}) metres.`],
            question: 1, keys: ['displacement', 'component'], extras: [2],
          },
          prompt: G1.art(SCENE9.valueTable([1, 2], (k) => k, { rowA: 'vector', rowB: 'id', caption: `(${ax}, ${ay}) + (${bx}, ${by})` }),
            `What is the sum of the two displacements?`),
          options: [right, w2, w3],
          answer: right,
          why: (v) => /^-?\d+, -?\d+$/.test(String(v).replace(/[() m]/g, '').replace(/,\s/, ','))
            ? 'Check whether you added across-to-across and up-to-up, or mixed them.'
            : 'Re-add the components one column at a time.',
          hints: [`Add the first components: ${ax} + (${bx}) = ${fx}.`, `Add the second: ${ay} + (${by}) = ${fy}.`, `Keep the unit: metres.`],
          solution: `<b>(${fx}, ${fy}) m</b> — a displacement, not a speed.`,
        };
      } },
  ],

  ghubar: ['Zero height is the greatest height.', 'Negative components are impossible.', 'A vector is the same as its length.'],
  praise: ['Table filled!', 'Peak found!', 'Landings read!', 'Vectors added!'],
  finale: 'Build the table, then read the shape — landings at the ends, the peak in the middle. 📊',
};

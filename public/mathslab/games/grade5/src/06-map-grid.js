/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 5 · Map Grid · the first-quadrant coordinate plane and numerical patterns
   Source: G05-U02-MAT-L02 (CCSS 5.G.A.1 & 5.G.A.2), term 2, unit 02, with the v3 approved bundle
   G05-U02-L08 (navigation: position, azimuth, and speed = distance ÷ time).
   Mechanic = the thinking: al-Khwārizmī's صورة الأرض plotted cities by a pair of numbers — the first
   historical appearance of the ordered pair (x, y). Level 1 reads a point's ordered pair off the grid;
   level 2 plots a point given its pair; level 3 extends a pattern of ships' positions and finds the next
   pair. The grid axes are numbered, but a point's own pair is never printed beside it.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g5-map-grid', code: 'G05-U02-MAT-L02', title: 'Map Grid', emoji: '🧭',
  accent: '#1d6f8c', accentDeep: '#175a72', skyA: '#eef9fd', skyB: '#cfe9f4',
  topic: 'Coordinate plane and patterns', band: 'g35', lang: 'en',
  objective: 'I can read and plot an <b>ordered pair</b> in the first quadrant and continue a numerical pattern.',
  welcome: 'Al-Khwārizmī plotted the cities by a pair of numbers. Here the chart is a coordinate plane. 🧭',
  learnBlurb: 'Across first, then up. The pair is (x, y) — in that order.',
  how: {
    what: 'The horizontal axis is x and the vertical axis is y. An ordered pair (x, y) means go x along, then y up. The axes meet at the origin (0, 0).',
    steps: ['🧭 Start at 0, 0 — the corner where the axes meet.', '🧭 Move right along x, counting the grid lines.', '✅ Then move up along y. Read the pair in that order.'],
  },

  learn: [
    { say: 'The two axes meet at the <b>origin</b>. This point is <b>three</b> across and <b>four</b> up, so its pair is <b>(3, 4)</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE5.coordinatePlane({ scale: 8, points: [[3, 4, 'A']], caption: 'across 3, up 4' }) })); } },
    { say: 'The order matters. <b>(4, 3)</b> is a different place: four across and only three up.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE5.coordinatePlane({ scale: 8, points: [[3, 4, 'A'], [4, 3, 'B']], caption: 'swap the numbers and you move' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '(3, 4) ≠ (4, 3) — x first, always' }));
      } },
    { say: 'Your turn. Which ordered pair names the red point?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE5.coordinatePlane({ scale: 8, points: [[6, 2, ''], ], dot: '#c0392b' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['(6, 2)', true], ['(2, 6)', false], ['(6, 6)', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — six across, two up.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '(2, 6)' ? 'You read up first. The pair always starts with the across number.' : 'One of the numbers is wrong — count the lines.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says the point <b>(2, 6)</b> and the point <b>(6, 2)</b> are the same place because the numbers are the same. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Two sixes either way. Same place on the chart.', 5200);
        el.append(UI.h('div', { html: SCENE5.coordinatePlane({ scale: 8, points: [[2, 6, 'A'], [6, 2, 'B']], caption: 'same digits, different points' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — the order changes the position.', true], ['He is right, they match.', false], ['Only in the first quadrant.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — an ordered pair is ordered for exactly this reason.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Follow both: A goes up six, B goes across six. Different places.', 'bad'))),
        }))); el.append(row);
      } },
  ],


  /* ── option hygiene ───────────────────────────────────────────────────────────────────────────────
     A round's `options` are built from the numbers the question drew, so a distractor can occasionally
     coincide with the answer (the swapped pair when x === y, a fixed fallback that lands on the right
     value). Two identical buttons would be a broken question, and the engine does not dedupe.
     This keeps the answer's own button untouched — the engine matches options by text, so rewriting it
     would make the right answer unselectable — and gives any duplicate a visibly different near-miss.
     Called as `GAME.fixOpts(this.roundRaw(i))`: the engine invokes `round` detached from the level
     object, so a `this._fix(...)` private call would lose its receiver. */
  fixOpts(q) {
    if (!q || !q.options || q.type === 'order' || q.type === 'bars') return q;
    const ans = String(q.answer);
    const seen = new Set();
    let keptAnswer = false;
    q.options = q.options.map((o) => {
      let s = String(o);
      if (s === ans && !keptAnswer) { keptAnswer = true; seen.add(s); return o; }
      if (!seen.has(s)) { seen.add(s); return o; }
      const frac = s.match(/^\d+\/\d+$/);
      const num = !frac && s.match(/-?\d+(?:\.\d+)?/);
      if (frac) {
        const [n, d] = s.split('/').map(Number);
        let k = 1, cand = `${n}/${d}`;
        while ((seen.has(cand) || cand === ans) && k < 40) { cand = `${n + k}/${d}`; k += 1; }
        s = cand;
      } else if (num) {
        const v = Number(num[0]);
        const alt = [v + 1, v - 1, v + 10, v + 2, v * 2 + 1].find((c) => {
          const cand = s.replace(num[0], String(c));
          return c >= 0 && !seen.has(cand) && cand !== ans;
        });
        if (alt != null) s = s.replace(num[0], String(alt));
      } else {
        s = s + ' ·';
      }
      while (seen.has(s) || s === ans) s = s + '·';
      seen.add(s);
      return s;
    });
    return q;
  },

  levels: [
    { name: 'Read the chart', icon: '🧭', blurb: 'Name the pair for a point.', rounds: 6, think: false,
      say: '🧭 Across first, then up.',
      round() { return GAME.fixOpts(this.roundRaw()); },
      roundRaw() {
        const x = UI.rint(1, 8), y = UI.rint(1, 8);
        return {
          type: 'choice',
          prompt: G1.art(SCENE5.coordinatePlane({ scale: 8, points: [[x, y, '']], max: 320, caption: 'the red dot' }),
            'Which ordered pair names the red point?'),
          options: [`(${x}, ${y})`, `(${y}, ${x})`, `(${x}, ${x === y ? y + 1 : y})`],
          answer: `(${x}, ${y})`,
          why: (v) => v === `(${y}, ${x})` && x !== y ? 'You read up first. The pair starts with the across number.' : 'Count the grid lines from the origin in each direction.',
          hints: ['Start at the origin, not the top corner.', `The point is ${x} lines to the right.`, `Then ${y} lines up.`],
          solution: `The point is <b>(${x}, ${y})</b>.`,
        };
      } },
    { name: 'Plot the ship', icon: '⛵', blurb: 'Find the point for a pair.', rounds: 6, think: false,
      say: '⛵ Go across, then up.',
      round() { return GAME.fixOpts(this.roundRaw()); },
      roundRaw() {
        const x = UI.rint(1, 8), y = UI.rint(1, 8);
        const opts = [[x, y], [y, x], [Math.min(8, x + 1), y]];
        const letters = ['A', 'B', 'C'];
        return {
          type: 'choice',
          prompt: `Which lettered point is <b>(${x}, ${y})</b>?`,
          options: opts.map((p, i) => `${letters[i]} (${p[0]}, ${p[1]})`),
          answer: `A (${x}, ${y})`,
          why: () => `(${x}, ${y}) means ${x} across and ${y} up. Check each letter against that.`,
          hints: [`Go ${x} lines to the right of the origin.`, `Then go ${y} lines up.`, 'The dot you land on is the one.'],
          solution: `<b>A (${x}, ${y})</b> is the point.`,
        };
      } },
    { name: 'Night convoy', icon: '🔁', blurb: 'Continue the pattern of positions.', rounds: 6, think: true,
      say: '🔁 Think first: what changes each step?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const cx2 = UI.rint(1, 3), cy2 = UI.rint(1, 3);
        const pts = [0, 1, 2, 3].map((k) => [cx2 * (k + 1), cy2 * (k + 1)]);
        const next = [cx2 * 5, cy2 * 5];
        return {
          type: 'choice',
          problem: {
            sentences: ['A convoy of boats follows a course marked by buoys.',
              'The harbour master logs every buoy at dusk.',
              `Buoy 1 is at (${pts[0][0]}, ${pts[0][1]}).`,
              `Each next buoy is at (${pts[1][0]}, ${pts[1][1]}), then (${pts[2][0]}, ${pts[2][1]}), then (${pts[3][0]}, ${pts[3][1]}).`,
              'Where is buoy 5?'],
            question: 4, keys: ['where', 'buoy'], extras: [1],
          },
          prompt: G1.art(SCENE5.coordinatePlane({ scale: 10, points: pts.map((p, k) => [p[0], p[1], `${k + 1}`]), path: pts, max: 340 }), 'The step repeats.'),
          options: [`(${next[0]}, ${next[1]})`, `(${pts[3][0] + 1}, ${pts[3][1] + 1})`, `(${cx2 * 4}, ${cy2 * 6})`],
          answer: `(${next[0]}, ${next[1]})`,
          why: () => `Each step adds ${cx2} to x and ${cy2} to y. Buoy 5 is four steps from buoy 1.`,
          hints: ['Find what changes from buoy 1 to buoy 2.', `x grows by ${cx2} each time.`, `y grows by ${cy2} each time.`],
          solution: `Buoy 5 is at <b>(${next[0]}, ${next[1]})</b>.`,
        };
      } },
  ],

  ghubar: ['(2, 6) and (6, 2) are the same point.', 'Start counting from the top corner.', 'Patterns are random — just guess the next.'],
  praise: ['Pair read!', 'Point plotted!', 'Pattern continued!', 'Across before up!'],
  finale: 'Across then up — you can read any chart on the first quadrant! 🧭',
};

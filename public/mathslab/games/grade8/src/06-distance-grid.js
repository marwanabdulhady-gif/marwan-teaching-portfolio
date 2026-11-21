/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 8 · Grid Flight · the two coordinate differences as legs, and the distance between two points
   Source: G08-U02-MAT-L02 — نظرية فيثاغورس وعكسها والمسافة في المستوى الإحداثي (CCSS 8.G.B.6–8), term 2.

   SCOPE — this game takes the COORDINATE-PLANE frame of the standard: the horizontal difference and the
   vertical difference between two points, those two as the legs of a right triangle with a leg parallel to
   each axis, and the diagonal as their Pythagorean result. The building frame of the same standard (which
   side is the hypotenuse, the 3-4-5 rope, the converse testing a corner) is game 02, G08-U01-MAT-L02;
   nothing of the builder scaffolding is repeated here. The split is recorded in docs/mowazi/g8-expansion.md.

   Mechanic = the thinking: both points AND the dashed legs are drawn from the coordinates in the question,
   so a sign slip is visible; the distance itself is never printed. Distances are chosen from whole-number
   triples so the answer is exact, and the distractor that adds the two legs is always present, because
   «distance = across + up» is the misconception this lesson exists to end.
   Named misconceptions: «distance is Δx + Δy», «the differences are the coordinates themselves», and
   «a negative difference makes the distance negative».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g8-distance-grid', code: 'G08-U02-MAT-L02', title: 'Grid Flight', emoji: '🛩️',
  accent: '#35507a', accentDeep: '#263c5e', skyA: '#eef3fb', skyB: '#d5e0f2',
  topic: 'Distance between two points in the coordinate plane', band: 'g68', lang: 'en',
  objective: 'I can use the two coordinate differences as legs and find the distance between two points.',
  welcome: 'A survey drone goes from one marker straight to another. The straight path is shorter than going across and then up. 🛩️',
  learnBlurb: 'Find the two differences, treat them as legs, and Pythagoras gives the straight path.',
  how: {
    what: 'Between two points the horizontal gap and the vertical gap form a right triangle with a leg along each axis. The straight distance is the hypotenuse of that triangle, so square both gaps, add, and take the root.',
    steps: ['🛩️ Subtract the x-coordinates to get the across gap.', 'Subtract the y-coordinates to get the up gap.', '✅ Square both, add, and take the square root — the answer is shorter than the two gaps added.'],
  },

  learn: [
    { say: 'From <b>(1, 2)</b> to <b>(4, 6)</b>: the across gap is 3 and the up gap is 4. The legs are 3 and 4, so the straight path is <b>5</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE8.pointsDist([1, 2], [4, 6], { caption: 'the dashed legs are 3 and 4' }) })); } },
    { say: 'Going across and then up would be 3 + 4 = 7 steps. The straight path is 5 — always shorter, because it is the hypotenuse.',
      draw(el) { el.append(UI.h('div', { html: SCENE8.pointsDist([1, 2], [4, 6], { distLabel: '5', caption: 'straight 5 against 7 by the two sides' }) })); } },
    { say: 'Your turn. How far apart are <b>(−2, 1)</b> and <b>(4, 9)</b>?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE8.pointsDist([-2, 1], [4, 9], { caption: 'count the gaps on the grid first' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['10', true], ['14', false], ['8', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — the gaps are 6 and 8, and 36 + 64 = 100, whose root is 10.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '14' ? 'That adds the two gaps — the straight path is shorter than that.' : 'Check the up gap: 9 − 1.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says the distance from <b>(−3, 2)</b> to <b>(1, 2)</b> is <b>−4</b>, because 1 − 3 is negative. Can a distance be negative?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Subtract in order and keep the sign; the distance is minus four.', 5200);
        el.append(UI.h('div', { html: SCENE8.pointsDist([-3, 2], [1, 2], { legs: true, caption: 'the gap is a length, so it is counted, not signed' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — the gap is 4, and a length is never negative.', true], ['Yes, it is −4.', false], ['It is 2, because the points share a height.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. The points are 4 apart; only the coordinates carry signs.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Count the steps between the two dots.', 'bad'))),
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
          return c > 0 && cand !== ans && !seen.has(cand);
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
    { name: 'The two gaps', icon: '📐', blurb: 'Coordinate differences as lengths.', rounds: 6, think: false,
      say: '📐 Subtract, then take the size of the gap.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const dx = UI.rint(2, 9), dy = UI.rint(2, 9);
        const p = [UI.rint(-3, 3), UI.rint(-3, 3)];
        const q = [p[0] + dx, p[1] + dy];
        return {
          type: 'choice',
          prompt: G1.art(SCENE8.pointsDist(p, q, { legs: true, distLabel: '?', caption: 'the two dashed legs' }),
            `What is the horizontal gap between <b>(${p[0]}, ${p[1]})</b> and <b>(${q[0]}, ${q[1]})</b>?`),
          options: [String(dx), String(dy), String(dx + dy)],
          answer: String(dx),
          why: (v) => Number(v) === dy ? 'That is the vertical gap — the x-coordinates decide the horizontal one.'
            : 'That adds both gaps. One gap at a time.',
          hints: ['Look only at the x-coordinates.', `${q[0]} − (${p[0]}) = ${dx}.`, 'The gap is a length, so it is positive.'],
          solution: `|${q[0]} − ${p[0]}| = <b>${dx}</b>.`,
        };
      } },
    { name: 'Straight distance', icon: '🛩️', blurb: 'The Pythagorean distance.', rounds: 6, think: false,
      say: '🛩️ Square, add, root.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const pick = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]][i % 6];
        const [dx, dy, d] = pick;
        const p = [UI.rint(-2, 2), UI.rint(-2, 2)];
        const q = [p[0] + dx, p[1] + dy];
        return {
          type: 'choice',
          prompt: G1.art(SCENE8.pointsDist(p, q, { caption: 'count the legs, then use them' }),
            `How far is <b>(${p[0]}, ${p[1]})</b> from <b>(${q[0]}, ${q[1]})</b>?`),
          options: [String(d), String(dx + dy), String(d + 1)],
          answer: String(d),
          why: (v) => Number(v) === dx + dy ? 'That is walking across and then up. The straight path is shorter.'
            : 'Square both gaps before adding, then take the root.',
          hints: [`The gaps are ${dx} and ${dy}.`, `${dx * dx} + ${dy * dy} = ${dx * dx + dy * dy}.`, `The square root of ${dx * dx + dy * dy} is ${d}.`],
          solution: `${dx * dx} + ${dy * dy} = ${dx * dx + dy * dy}, so the distance is <b>${d}</b>.`,
        };
      } },
    { name: 'Which path', icon: '🧭', blurb: 'Compare the straight path with the two-sided one.', rounds: 6, think: true,
      say: '🧭 Think first: which is longer, and by how much?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const [dx, dy, d] = [[3, 4, 5], [6, 8, 10], [5, 12, 13]][i % 3];
        const p = [UI.rint(-1, 2), UI.rint(-1, 2)];
        const q = [p[0] + dx, p[1] + dy];
        const around = dx + dy;
        return {
          type: 'choice',
          problem: {
            sentences: ['A drone may fly straight between two markers, or along the grid lines: across and then up.',
              'The straight flight is the hypotenuse of the right triangle made by the two grid lines.',
              `The markers are (${p[0]}, ${p[1]}) and (${q[0]}, ${q[1]}).`],
            question: 1, keys: ['straight', 'grid'], extras: [2],
          },
          prompt: G1.art(SCENE8.pointsDist(p, q, { caption: 'the straight line against the two dashed sides' }),
            `How much shorter is the straight flight than flying across and then up?`),
          options: [String(around - d), String(d), String(around)],
          answer: String(around - d),
          why: (v) => Number(v) === d ? 'That is the straight distance, not the saving.'
            : 'The question asks for the DIFFERENCE between the two routes.',
          hints: [`The grid route is ${dx} + ${dy} = ${around}.`, `The straight route is ${d}.`, `Subtract: ${around} − ${d}.`],
          solution: `Grid route ${around}, straight route ${d}, so the saving is <b>${around - d}</b>.`,
        };
      } },
  ],

  ghubar: ['Distance is across plus up.', 'A negative gap makes the distance negative.', 'The two differences are the coordinates themselves.'],
  praise: ['Gaps found!', 'Distance measured!', 'Routes compared!', 'Signs handled!'],
  finale: 'Two gaps make a right triangle; the straight path is its hypotenuse. 🛩️',
};

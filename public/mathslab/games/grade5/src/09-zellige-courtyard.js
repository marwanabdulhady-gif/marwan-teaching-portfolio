/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 5 · Zellige Courtyard · regular polygons, tiling and the area of a tiled panel
   Source: G05-U04-L18 (CCSS 5.G.B.3, 5.G.B.4 & 5.MD.C.5), term 2, unit 04, v3 approved bundle —
   العمارة الإسلامية والأندلس وزلّيج الرصف.
   Mechanic = the thinking: a zellige panel is a tessellation, and whether a shape tiles depends on the
   angles that meet at a vertex summing to exactly 360°. Level 1 counts sides and vertices of a regular
   tile, level 2 decides which sets of angles close around a point, level 3 computes the area of a
   rectangular panel from its dimensions. Properties decide, not the look of the shape.
   Named misconception: «a hexagon has six edges and therefore six vertices shared with neighbours» and
   «tiling depends on the shape's size».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g5-zellige-courtyard', code: 'G05-U04-L18', title: 'Zellige Courtyard', emoji: '🧩',
  accent: '#7a4a2f', accentDeep: '#653c26', skyA: '#fdf6f1', skyB: '#f0ddcd',
  topic: 'Regular polygons and tiling', band: 'g35', lang: 'en',
  objective: 'I can describe a <b>regular polygon</b> by its sides and angles and explain why some tiles cover a floor.',
  welcome: 'The Alhambra courtyards are tiled in zellige. Whether a tile fits is decided by its angles, not its look. 🧩',
  learnBlurb: 'Angles that meet at a point must add to exactly 360°.',
  how: {
    what: 'A regular polygon has all sides equal and all angles equal. Four squares meet at a corner because 90 + 90 + 90 + 90 = 360.',
    steps: ['🧩 Count the sides — that names the polygon.', '🧩 Find each interior angle.', '✅ Add the angles that meet at one point and check for exactly 360°.'],
  },

  learn: [
    { say: 'A square tile has <b>four</b> equal sides and four right angles. Four of them meet at a corner, and a corner must be a full turn.',
      draw(el) { el.append(UI.h('div', { html: SCENE5.tileGrid('square', 5, 4, { caption: 'four 90° angles meet at every corner' }) })); } },
    { say: 'A regular hexagon has six sides and each angle is <b>120°</b>. Three of them meet at a point: 120 + 120 + 120 = <b>360</b>. So hexagons tile too.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE5.tileGrid('hex', 4, 3, { caption: 'three 120° angles make 360°' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '120° × 3 = <b>360°</b> — a perfect fit' }));
      } },
    { say: 'Your turn. Every angle of a regular octagon is <b>135°</b>. Two octagons meet a square in this panel — what does the square contribute?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE5.tileGrid('octagon', 3, 3, { caption: 'octagons with a small square in the gap' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['90°', true], ['135°', false], ['45°', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 135 + 135 + 90 = 360, so the gap needs a right angle.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '45°' ? 'Two octagons use 270°. What is left of 360°?' : 'Add two octagon angles first, then see what the point still needs.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says a regular pentagon tiles a floor because it looks tidy. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Five equal sides, five equal angles. Of course it tiles — it is regular.', 5200);
        el.append(UI.h('div', { html: SCENE5.tileGrid('triangle', 6, 4, { caption: 'triangles close at 60° × 6 = 360°' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — 108° does not divide 360°, so pentagons leave a gap.', true], ['He is right, they tile.', false], ['They tile only if they are large.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. Three pentagons make 324° and leave a 36° gap.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Check the sum at one point: 360 ÷ 108 is not a whole number.', 'bad'))),
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
    { name: 'Name the tile', icon: '🧩', blurb: 'Sides, vertices, and the angle.', rounds: 6, think: false,
      say: '🧩 A regular polygon has equal sides and equal angles.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const kinds = [['triangle', 3, 60], ['square', 4, 90], ['hex', 6, 120], ['octagon', 8, 135]];
        const [kind, n, ang] = kinds[i % 4];
        return {
          type: 'choice',
          prompt: G1.art(SCENE5.tileGrid(kind, 3, 2, { max: 320, caption: 'one tile repeated' }),
            `A regular tile has <b>${n}</b> equal sides. What is the name and the angle?`),
          options: [`${n} sides, ${ang}° each`, `${n} sides, ${Math.round(3600 / n) / 10}° each`, `${n} sides, ${180 - ang}° each`],
          answer: `${n} sides, ${ang}° each`,
          /* the centre angle 360/n is a distractor only when it differs from the interior angle */
          distinct: true,
          why: (v) => v === `${n} sides, ${Math.round(3600 / n) / 10}° each` ? 'That is the angle at the centre, not the angle inside the corner.' : 'The interior angle comes from the shape, not from dividing 360 by the sides.',
          hints: [`A ${kind === 'hex' ? 'hexagon' : kind} has ${n} sides.`, 'The angles at the centre add to 360°, the corners do not.', `Each interior angle here is ${ang}°.`],
          solution: `${n} sides, <b>${ang}°</b> each.`,
        };
      } },
    { name: 'Will it close?', icon: '🔄', blurb: 'Do the angles add to 360°?', rounds: 6, think: false,
      say: '🔄 Add the angles meeting at one point.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const sets = [
          ['four squares', 90, 4], ['three hexagons', 120, 3], ['six triangles', 60, 6],
          ['three pentagons', 108, 3], ['two octagons and a square', 135, 2],
        ];
        const [name, ang, count] = sets[i % 5];
        const total = ang * count;
        const closes = total === 360;
        return {
          type: 'choice',
          prompt: `At one corner there are <b>${count}</b> angles of <b>${ang}°</b>. Do they close the point?`,
          options: [`${total}° — ${closes ? 'yes, exactly 360°' : 'no, a gap or an overlap'}`, `${total}° — yes, always`, 'It cannot be worked out'],
          answer: `${total}° — ${closes ? 'yes, exactly 360°' : 'no, a gap or an overlap'}`,
          why: () => `${ang} × ${count} = ${total}°. A tiling needs exactly 360°, so this ${closes ? 'closes' : `leaves ${360 - total}° ${total < 360 ? 'uncovered' : 'of overlap'}`}.`,
          hints: [`Multiply ${ang} by ${count}.`, 'The result must be exactly 360°.', `${ang} × ${count} = ${total}.`],
          solution: `<b>${total}°</b> — ${closes ? 'it tiles' : 'it does not tile'}.`,
        };
      } },
    { name: 'Panel area', icon: '📏', blurb: 'How much tile does the wall need?', rounds: 6, think: true,
      say: '📏 Think first: which two lengths do you need?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const w = UI.rint(3, 9), hgt = UI.rint(2, 6);
        const tile = i % 2 === 0 ? 1 : 0.5;
        const area = +(w * hgt).toFixed(2);
        return {
          type: 'choice',
          problem: {
            sentences: ['A courtyard wall in the old quarter is being re-tiled.',
              'The craftsman mixes the glaze before he starts.',
              `The panel is ${w} metres wide and ${hgt} metres tall.`,
              `Each square tile has a side of ${tile} metre.`,
              'How many square metres of tile does the panel need?'],
            question: 4, keys: ['metres', 'square'], extras: [1],
          },
          prompt: `Panel <b>${w} m</b> by <b>${hgt} m</b>. How many square metres?`,
          options: [`${area} m²`, `${2 * (w + hgt)} m²`, `${area * 2} m²`],
          answer: `${area} m²`,
          why: (v) => v === `${2 * (w + hgt)} m²` ? 'That is the distance around the edge, not the surface.' : 'Area of a rectangle is length × width — the tile size does not change it.',
          hints: ['Area of a rectangle = length × width.', `${w} × ${hgt}.`, 'The tile size only tells you how many tiles, not how much area.'],
          solution: `${w} × ${hgt} = <b>${area} m²</b>.`,
        };
      } },
  ],

  ghubar: ['A regular shape always tiles.', 'A big tile will not fit the same corner.', 'Counting sides tells you the angle inside.'],
  praise: ['Tile named!', 'Corner closed!', 'Panel measured!', 'Exactly 360°!'],
  finale: 'Angles decide the pattern — the courtyard closes perfectly! 🧩',
};

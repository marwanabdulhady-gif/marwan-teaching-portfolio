/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 3 · Courtyard Tiles · area by counting unit squares (3.MD.C.5 / 3.MD.C.6)
   Source: G03-U02-MATH-L02 companion strand — المساحة (3.MD.C.5, 3.MD.C.6). The lesson bundle cites
   Common Core Grade 3 Number & Operations—Fractions; area is the Grade 3 measurement strand and is taught in
   the same unit in the mowazi sequence, so it is labelled by its own standard here rather than borrowed.
   Mechanic = the thinking: level 1 counts a tiled rectangle but the side lengths are NOT printed, so counting
   every tile is the only route; level 2 gives the side lengths and asks for the area, so the child must switch
   from counting to multiplying; level 3 is a word problem. `area-perimeter-mix` (adding the sides) is named.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g3-courtyard-tiles', code: 'G03-MAT-08', title: 'Courtyard Tiles', emoji: '🟫',
  accent: '#9c5a2c', accentDeep: '#7f4620', skyA: '#fff7f0', skyB: '#f6e3d1',
  topic: 'Area by counting unit squares', band: 'g35', lang: 'en',
  objective: 'I can find the <b>area</b> of a rectangle by counting <b>unit squares</b> and by multiplying the sides.',
  welcome: 'The courtyard of the old house needs new tiles. Every tile is one square metre. 🟫',
  learnBlurb: 'Area counts the squares inside. Perimeter walks the edge.',
  how: { what: 'Area is the number of unit squares that fit inside a shape without gaps.', steps: ['🟫 Count the squares in one row.', '🟫 Count the rows.', '✅ Rows × squares in a row = area.'] },

  learn: [
    { say: 'The courtyard is covered in square tiles. Counting them one by one works — but there is a faster way.',
      draw(el) { el.append(UI.h('div', { html: SCENE3.tiles(4, 3) })); } },
    { say: 'One row holds <b>4</b> tiles and there are <b>3</b> rows. <b>4 × 3 = 12</b> tiles, so the area is <b>12 square metres</b>.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE3.tiles(4, 3, { sides: true }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '4 × 3 = <b>12</b> square metres' }));
      } },
    { say: 'Your turn: this courtyard is <b>5 metres by 2 metres</b>. What is its area?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE3.tiles(5, 2, { sides: true, max: 460 }) }));
        const row = UI.h('div', { class: 'opts' });
        [10, 7, 14].forEach((v) => row.append(UI.h('button', {
          class: 'opt', text: String(v),
          onclick: (e) => (v === 10 ? (e.target.classList.add('good'), L.ok('Yes — 5 × 2 = 10 square metres.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(v === 7 ? 'That adds the sides — that is the distance round the edge, not the tiles inside.' : 'Multiply the two side lengths.', 'bad'))),
        })));
        el.append(row);
      } },
    { say: 'Ghubar says the area of a 5 by 2 courtyard is <b>5 + 2 = 7</b>. What did he work out instead?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Five metres by two metres: 5 + 2 = 7 square metres. ', 5200);
        el.append(UI.h('div', { html: SCENE3.tiles(5, 2, { sides: true, max: 420 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['He added the sides. Area multiplies them: 5 × 2 = 10.', true], ['He counted the tiles twice.', false], ['He is right — 7 square metres.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — the squares inside are found by multiplying the sides.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Count one row of tiles in the picture, then count the rows.', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Count the tiles', icon: '🟫', blurb: 'The sides are not written — count.', rounds: 6, think: false,
      say: '🟫 How many square tiles cover the courtyard?',
      round() {
        const w = UI.rint(2, 6), h = UI.rint(2, 5);
        return {
          type: 'number', prompt: G1.art(SCENE3.tiles(w, h, { max: 480 }), 'Every square is one tile.'),
          answer: w * h, suffix: ' tiles',
          why: (v) => v === 2 * (w + h) ? 'That walks round the edge — perimeter. Area counts the squares inside.'
            : v === w + h ? 'That adds the sides. Count one row, then count the rows.'
            : 'Count the tiles in one row, then multiply by the rows.',
          hints: [`One row holds ${w} tiles.`, `There are ${h} rows.`, `${w} × ${h} = ?`],
          solution: `${w} × ${h} = <b>${w * h}</b> square tiles.`,
        };
      } },
    { name: 'Metres by metres', icon: '📐', blurb: 'Multiply the side lengths.', rounds: 6, think: false,
      say: '📐 What is the area of this courtyard?',
      round() {
        const w = UI.rint(3, 9), h = UI.rint(2, 6);
        return {
          type: 'number',
          prompt: G1.art(SCENE3.tiles(w, h, { sides: true, max: 470 }), `${w} m by ${h} m.`),
          answer: w * h, suffix: ' m²',
          why: (v) => v === 2 * (w + h) ? 'That is the perimeter — the fence round the courtyard, not the tiles inside.'
            : v === w + h ? 'That adds the two sides. Area multiplies them.' : 'Multiply the length by the width.',
          hints: [`The length is ${w} m.`, `The width is ${h} m.`, `${w} × ${h} = ?`],
          solution: `${w} × ${h} = <b>${w * h}</b> square metres.`,
        };
      } },
    { name: 'Tiling stories', icon: '📖', blurb: 'A story with a spare sentence.', rounds: 6, think: true,
      say: '📖 Think first: what is being counted?',
      round(i) {
        const w = 4 + (i % 4), h = 3 + (i % 3);
        return {
          type: 'number',
          problem: {
            sentences: [`A courtyard is ${w} metres long and ${h} metres wide.`, 'The tiler brings boxes of tiles in a small truck.', 'Each tile covers one square metre.', 'How many tiles are needed to cover the courtyard?'],
            question: 3, keys: ['each', 'how many'], extras: [1],
          },
          prompt: 'How many tiles are needed?', answer: w * h, suffix: ' tiles',
          why: (v) => v === 2 * (w + h) ? 'That measures the edge. The tiles cover the inside — multiply the sides.' : 'Multiply the length by the width to count the squares inside.',
          hints: [`The courtyard is ${w} by ${h} metres.`, 'One tile covers one square metre.', `${w} × ${h} = ?`],
          solution: `${w} × ${h} = <b>${w * h}</b> tiles.`,
        };
      } },
  ],

  ghubar: ['Area is the distance round the outside.', 'Tiles are always counted one by one.', 'Long times wide is a guess.'],
  praise: ['Tiles counted!', 'Area multiplied!', 'Squares inside!', 'Courtyard covered!'],
  finale: 'Every tile in place — you can find area two ways! 🟫',
};

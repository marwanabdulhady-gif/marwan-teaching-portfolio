/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 3 · Fence Walk · perimeter as the distance round a rectangle (3.MD.D.8)
   Source: same Grade 3 measurement strand as 08 — المحيط (3.MD.D.8).
   Mechanic = the thinking: level 1 walks the four sides of a drawn fenced rectangle one at a time (the fence is
   dashed, so the sides are visibly four separate walks); level 2 gives the lengths in words and the child must
   remember that the opposite sides repeat — `perim-two-sides` is the named misconception; level 3 is a word
   problem where the fence goes round a garden and the child must not mistake area for perimeter.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g3-fence-walk', code: 'G03-MAT-09', title: 'Fence Walk', emoji: '🚧',
  accent: '#4f8a3d', accentDeep: '#3d6d2f', skyA: '#f4fbef', skyB: '#dcefd2',
  topic: 'Perimeter of a rectangle', band: 'g35', lang: 'en',
  objective: 'I can find the <b>perimeter</b> of a rectangle by walking all <b>four sides</b>.',
  welcome: 'The farm needs a fence round the whole garden — every side, not just the front. 🚧',
  learnBlurb: 'Perimeter walks the edge. Two lengths, two widths.',
  how: { what: 'Perimeter is the distance all the way round a shape. A rectangle has two lengths and two widths.', steps: ['🚧 Walk the top side.', '🚧 Walk the bottom, then both ends.', '✅ Add all four sides.'] },

  learn: [
    { say: 'This garden is <b>6 metres</b> long and <b>4 metres</b> wide. The fence goes round all four sides.',
      draw(el) { el.append(UI.h('div', { html: SCENE3.fence(6, 4) })); } },
    { say: 'Two sides are <b>6</b> and two are <b>4</b>: <b>6 + 4 + 6 + 4 = 20</b> metres of fence.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE3.fence(6, 4, { max: 480 }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '6 + 4 + 6 + 4 = <b>20</b> m' }));
      } },
    { say: 'Your turn: a garden is <b>7</b> metres by <b>3</b> metres. How much fence goes round it?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE3.fence(7, 3, { max: 460 }) }));
        const row = UI.h('div', { class: 'opts' });
        [20, 10, 21].forEach((v) => row.append(UI.h('button', {
          class: 'opt', text: String(v),
          onclick: (e) => (v === 20 ? (e.target.classList.add('good'), L.ok('Yes — 7 + 3 + 7 + 3 = 20 metres.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(v === 10 ? 'That is only two sides — the fence goes round all four.' : 'That multiplies to find the area inside. Perimeter adds the sides.', 'bad'))),
        })));
        el.append(row);
      } },
    { say: 'Ghubar says a 7 by 3 garden needs <b>10</b> metres of fence. What did he forget?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Seven and three is ten. Ten metres of fence. ', 5200);
        el.append(UI.h('div', { html: SCENE3.fence(7, 3, { max: 420 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['The other two sides: 7 + 3 + 7 + 3 = 20.', true], ['Nothing — 10 metres is right.', false], ['He should have multiplied: 21.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — a rectangle has four sides, and the opposite sides are equal.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Point to each side in the picture. How many sides are there?', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Walk the edge', icon: '🚧', blurb: 'Add the four sides.', rounds: 6, think: false,
      say: '🚧 How much fence goes round this garden?',
      round() {
        const w = UI.rint(3, 9), h = UI.rint(2, 7);
        return {
          type: 'number', prompt: G1.art(SCENE3.fence(w, h, { max: 480 }), `${w} m long, ${h} m wide.`),
          answer: 2 * (w + h), suffix: ' m',
          why: (v) => v === w * h ? 'That is the area inside — the tiles, not the fence.' : v === w + h ? 'That is only two sides. The fence goes round all four.'
            : 'Add the top, the bottom and both ends.',
          hints: [`The top and bottom are ${w} m each.`, `The two ends are ${h} m each.`, `${w} + ${h} + ${w} + ${h} = ?`],
          solution: `${w} + ${h} + ${w} + ${h} = <b>${2 * (w + h)}</b> metres.`,
        };
      } },
    { name: 'Two of each', icon: '🔁', blurb: 'Double the length plus the width.', rounds: 6, think: false,
      say: '🔁 Which calculation gives the perimeter?',
      round() {
        const w = UI.rint(4, 9), h = UI.rint(2, 7);
        const right = `(${w} + ${h}) × 2`;
        return {
          type: 'choice',
          prompt: G1.art(SCENE3.fence(w, h, { max: 340 }), 'A rectangle needs fence on all four sides.'),
          options: [right, `${w} + ${h}`, `${w} × ${h}`, `${w} × 2 + ${h}`].filter((v, i, a) => a.indexOf(v) === i),
          answer: right,
          why: (v) => v === `${w} × ${h}` ? 'That is the area inside the fence.' : v === `${w} + ${h}` ? 'That is two sides only.' : 'The two ends repeat as well, so both sides are counted twice.',
          hints: ['Count the sides: there are four.', `Two of them are ${w} m and two are ${h} m.`, `Add them first, then double.`],
          solution: `(${w} + ${h}) × 2 = ${w + h} × 2 = <b>${2 * (w + h)}</b> m.`,
        };
      } },
    { name: 'Garden stories', icon: '📖', blurb: 'A story about fencing.', rounds: 6, think: true,
      say: '📖 Think first: fence or tiles?',
      round(i) {
        const w = 5 + (i % 4), h = 3 + (i % 3);
        return {
          type: 'number',
          problem: {
            sentences: [`A garden is ${w} metres long and ${h} metres wide.`, 'The gardener waters it before the sun is high.', 'A fence is needed right round all four sides.', 'How many metres of fence are needed?'],
            question: 3, keys: ['right round', 'all four'], extras: [1],
          },
          prompt: 'How many metres of fence are needed?', answer: 2 * (w + h), suffix: ' m',
          why: (v) => v === w * h ? 'That finds the ground inside. The fence walks round the edge.' : v === w + h ? 'Only two sides have been counted.' : 'A rectangle has two lengths and two widths.',
          hints: [`The garden is ${w} by ${h} metres.`, 'The fence goes round all four sides.', `${w} + ${h} + ${w} + ${h} = ?`],
          solution: `${w} + ${h} + ${w} + ${h} = <b>${2 * (w + h)}</b> metres of fence.`,
        };
      } },
  ],

  ghubar: ['Perimeter: add the two numbers you can see.', 'A fence only needs the front side.', 'Perimeter and area are the same sum.'],
  praise: ['Four sides walked!', 'Perimeter found!', 'Opposites doubled!', 'Garden fenced!'],
  finale: 'All four sides fenced — you can walk a perimeter! 🚧',
};

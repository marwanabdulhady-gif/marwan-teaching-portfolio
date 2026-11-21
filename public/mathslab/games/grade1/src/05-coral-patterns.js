/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 1 · Coral Pattern Path · finding and extending a repeating pattern (draft G01-MAT step 5)
   Mechanic = the thinking: the child must name the repeating unit in level 1, continue it in level 2, and
   in level 3 extend a longer unit — copying the last tile gives a wrong answer in every level.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const UNITS = [['A', 'B'], ['A', 'A', 'B'], ['A', 'B', 'B']];
const unitName = (u) => u.join('–');

const GAME = {
  id: 'g1-coral-patterns', code: 'G01-MAT-05', title: 'Coral Pattern Path', emoji: '🪸',
  accent: '#0e8898', accentDeep: '#0a6673', skyA: '#eefafb', skyB: '#d3f0f3',
  topic: 'Repeating patterns', band: 'k2', lang: 'en',
  objective: 'I can find the <b>repeating unit</b> in a pattern and say <b>what comes next</b>.',
  welcome: 'The reef path is being tiled with coral. Can you see the pattern? 🪸',
  learnBlurb: 'Find the small group that repeats, then start it again.',
  how: {
    what: 'A pattern repeats the same small group. Name the group, then repeat it.',
    steps: ['👀 Look for the small group that comes back.', '🗣️ Say it aloud: “red, blue, red, blue …”', '✅ Start the group again for the next tile.'],
  },

  learn: [
    { say: 'Coral tiles are being laid on the reef path. What comes next?',
      draw(el) { el.append(UI.h('div', { html: SCENE.tiles(['A', 'B', 'A', 'B']) })); } },
    { say: 'The small group is <b>A–B</b>. It repeats: A B, A B, A B … so the next tile is <b>A</b>.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE.tiles(['A', 'B', 'A', 'B', 'A']) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: 'Unit = <b>A B</b>. After B, the unit starts again at <b>A</b>.' }));
      } },
    { say: 'Your turn: the unit is <b>A A B</b>. What comes next?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE.tiles(['A', 'A', 'B', 'A', 'A']) }));
        const row = UI.h('div', { class: 'opts' });
        [['A', true], ['B', false], ['C', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Yes — A A B repeats, so after A A comes <b>B</b>.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Say the unit aloud: A, A, B — then start again.', 'bad')),
        })));
        el.append(row);
      } },
    { say: 'Ghubar looked at the last tile only and said <b>A</b>. What should he do instead?', wait: true,
      draw(el, L) {
        GHUBAR.pop('The last one is the pattern. Whatever it was, do it again!', 5000);
        const row = UI.h('div', { class: 'opts' });
        [['Repeat the whole unit, in order.', true], ['Copy the last tile.', false], ['Pick a new colour each time.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Exactly — the unit repeats, not the single tile.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Where does the small group start and finish?', 'bad')),
        })));
        el.append(UI.h('div', { html: SCENE.tiles(['A', 'B', 'B', 'A', 'B']) }), row);
      } },
  ],

  levels: [
    { name: 'Name the unit', icon: '👀', blurb: 'Which small group repeats?', rounds: 4, think: false,
      say: '👀 Which small group repeats?',
      round() {
        const u = UI.pick(UNITS);
        const seq = SCENE.nextTiles(u, u.length * 2 + 1);
        const names = UNITS.map(unitName);
        return {
          type: 'choice', prompt: G1.art(SCENE.tiles(seq, { next: false })),
          options: names, answer: unitName(u),
          why: () => 'Look for the smallest group that comes back in the same order.',
          hints: ['Find where the pattern starts again.', 'The unit is the shortest piece that repeats.', `Try saying it: ${u.join(', ')}.`],
          solution: `The repeating unit is <b>${unitName(u)}</b>.`,
        };
      } },
    { name: 'What comes next', icon: '➡️', blurb: 'Continue the pattern.', rounds: 4, think: false,
      say: '➡️ What tile comes next?',
      round() {
        const u = UI.pick([UNITS[0], UNITS[0], UNITS[1]]);
        const len = 5;
        const next = u[len % u.length];
        return {
          type: 'choice', prompt: G1.art(SCENE.tiles(SCENE.nextTiles(u, len))),
          options: ['A', 'B', 'C'], answer: next,
          why: (v) => v === 'C' ? 'C is not in this pattern at all.' : 'Say the unit, then start it again.',
          hints: ['Say the unit aloud.', `The unit is ${unitName(u)}.`, 'After the last tile, go back to the start of the unit.'],
          solution: `The unit ${unitName(u)} repeats, so the next tile is <b>${next}</b>.`,
        };
      } },
    { name: 'Longer units', icon: '🧩', blurb: 'Trickier units, same idea.', rounds: 4, think: false,
      say: '🧩 Longer units. Careful at the join!',
      round() {
        const u = UI.pick([UNITS[1], UNITS[2]]);
        const len = 6 + UI.rint(0, 2);
        const next = u[len % u.length];
        const others = ['A', 'B', 'C'].filter((k) => k !== next);
        return {
          type: 'choice', prompt: G1.art(SCENE.tiles(SCENE.nextTiles(u, len)), `The unit is ${unitName(u)}.`),
          options: G1.opts(next, others, 3), answer: next,
          why: () => 'Count from the start of the unit: where are you now?',
          hints: [`The unit is ${unitName(u)}.`, 'Find the start of the last unit.', 'Restart the unit after its last tile.'],
          solution: `With unit ${unitName(u)}, after ${len} tiles the next one is <b>${next}</b>.`,
        };
      } },
  ],

  ghubar: ['The last tile is the pattern. Always!', 'Patterns love surprises. Pick any colour.', 'Two colours? Then alternate forever.'],
  praise: ['Unit found!', 'You extended it!', 'Pattern master!', 'No copying the last tile!'],
  finale: 'The whole reef path is tiled — you can extend any pattern! 🪸',
};

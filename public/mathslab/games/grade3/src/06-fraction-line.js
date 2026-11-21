/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 3 · Fraction Line · fractions as numbers at a point on the number line (3.NF.A.2)
   Source: G03-U02-MATH-L02 — الكسور كأعداد على خط الأعداد (3.NF.A.2).
   Mechanic = the thinking: level 1 shows a line marked from 0 to 1, cut into b parts, with one tick ringed;
   the child names that point. The line prints no fraction labels, so counting the parts is the only route.
   Level 2 reverses it: a fraction is given and the child picks the line whose ring is in the right place — the
   decoy has the right number of parts but the wrong tick. Level 3 is a word problem. `frac-line-whole`
   (counting the ticks rather than the spaces) is the named misconception.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g3-fraction-line', code: 'G03-MAT-06', title: 'Fraction Line', emoji: '📏',
  accent: '#5a5fb8', accentDeep: '#474b96', skyA: '#f2f2ff', skyB: '#dedcfb',
  topic: 'Fractions on a number line', band: 'g35', lang: 'en',
  objective: 'I can place a fraction on a <b>number line</b> by counting <b>equal spaces</b> from 0 to 1.',
  welcome: 'The surveyor marks the new road in equal spaces between two posts. 📏',
  learnBlurb: 'Count the spaces, not the ticks.',
  how: {
    what: 'Between 0 and 1 the line is cut into equal spaces. A fraction names how many spaces from 0 you walk.',
    steps: ['📏 Count the spaces between 0 and 1 — that is the bottom number.', '📏 Walk that many spaces from 0.', '✅ Stop on a tick and read the top number.'],
  },

  learn: [
    { say: 'This line runs from <b>0</b> to <b>1</b> and is cut into <b>4 equal spaces</b>. Each space is one quarter.',
      draw(el) { el.append(UI.h('div', { html: SCENE3.fracLine(4) })); } },
    { say: 'Walk <b>3 spaces</b> from 0 and stop. The ring sits at <b>three quarters</b>, written ¾.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE3.fracLine(4, { at: 3, atLabel: '¾' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '3 spaces of 4 → <b>¾</b>' }));
      } },
    { say: 'Your turn: this line is cut into <b>5 equal spaces</b> and the ring is on the <b>second</b> tick after 0. Which fraction is it?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE3.fracLine(5, { at: 2 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['2/5', true], ['1/5', false], ['5/2', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', html: SCENE3.frac(t.split('/')[0], t.split('/')[1], 20),
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 2 spaces out of 5 equal spaces is 2/5.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '5/2' ? 'The bottom is how many spaces the whole line is cut into.' : 'Count the spaces you walked from 0, not the ticks.', 'bad'))),
        })));
        el.append(row);
      } },
    { say: 'Ghubar says the ring is on the <b>third tick</b>, so the fraction is ⅗. Why is he wrong?', wait: true,
      draw(el, L) {
        GHUBAR.pop('It sits on tick three, so it is three fifths. Tick counting is counting!', 5200);
        el.append(UI.h('div', { html: SCENE3.fracLine(5, { at: 2 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['0 is the first tick — walking 2 spaces lands on the third tick, which is 2/5.', true], ['He is right, it is 3/5.', false], ['Ticks cannot be counted on a number line.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Exactly — count the spaces walked, not the ticks touched.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Start at 0. How many spaces do you cross to reach the ring?', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Name the point', icon: '📍', blurb: 'Read the ring on the line.', rounds: 6, think: false,
      say: '📍 Which fraction is ringed?',
      round() {
        const den = UI.pick([2, 3, 4, 5, 6, 8]);
        const num = UI.rint(1, den - 1);
        const right = SCENE3.frac(num, den, 20);
        const wrong = [SCENE3.frac(num + 1, den, 20), SCENE3.frac(num, den + 1, 20), SCENE3.frac(den - num, den, 20)];
        return {
          type: 'choice', prompt: G1.art(SCENE3.fracLine(den, { at: num, max: 560 }), 'The ring marks one point between 0 and 1.'),
          options: [right, ...wrong].filter((v, i, a) => a.indexOf(v) === i),
          answer: right,
          why: () => `Count the spaces from 0 to the ring, and the spaces the whole line is cut into.`,
          hints: [`The line is cut into ${den} equal spaces.`, `The ring is ${num} space${num === 1 ? '' : 's'} from 0.`, 'Spaces walked go on top.'],
          solution: `${num} of ${den} equal spaces → ${SCENE3.frac(num, den, 18)}.`,
        };
      } },
    { name: 'Find the line', icon: '📏', blurb: 'Pick the line with the right point.', rounds: 6, think: false,
      say: '📏 Which line marks this fraction?',
      round() {
        const den = UI.pick([3, 4, 5, 6]);
        const num = UI.rint(1, den - 1);
        const other = num === 1 ? den - 1 : num - 1;
        return {
          type: 'choice', prompt: `Which line marks ${SCENE3.frac(num, den, 20)}?`,
          options: [
            `<div style="transform:scale(.94)">${SCENE3.fracLine(den, { at: num, max: 340 })}</div>`,
            `<div style="transform:scale(.94)">${SCENE3.fracLine(den, { at: other, max: 340 })}</div>`,
          ],
          answer: `<div style="transform:scale(.94)">${SCENE3.fracLine(den, { at: num, max: 340 })}</div>`,
          why: () => `Both lines are cut the same way — count from 0 to find the right ring.`,
          hints: [`Look for a line cut into ${den} spaces.`, `Now count ${num} spaces from 0.`, 'The other line rings a different tick.'],
          solution: `${SCENE3.frac(num, den, 18)} sits ${num} spaces from 0 on a line cut into ${den}.`,
        };
      } },
    { name: 'Road stories', icon: '📖', blurb: 'A story about equal spaces.', rounds: 6, think: true,
      say: '📖 Think first: how many spaces?',
      round(i) {
        const den = 3 + (i % 3), num = 1 + (i % (den - 1));
        return {
          type: 'choice',
          problem: {
            sentences: [`A new road is marked in ${den} equal spaces between two posts.`, 'The surveyor starts early in the morning.', `A sign is fixed at the end of space ${num}.`, 'Which fraction of the road is the sign at?'],
            question: 3, keys: ['equal spaces'], extras: [1],
          },
          prompt: 'Which fraction of the road is the sign at?',
          options: [SCENE3.frac(num, den, 20), SCENE3.frac(num + 1, den, 20), SCENE3.frac(num, den + 1, 20)].filter((v, i, a) => a.indexOf(v) === i),
          answer: SCENE3.frac(num, den, 20),
          why: () => `The road has ${den} equal spaces and the sign is at the end of space ${num}.`,
          hints: [`The whole road is ${den} equal spaces.`, `The sign is after ${num} spaces.`, 'Spaces walked over all the spaces.'],
          solution: `${num} of ${den} equal spaces → ${SCENE3.frac(num, den, 18)}.`,
        };
      } },
  ],

  ghubar: ['Count the ticks, that is the fraction.', 'Any point between 0 and 1 is a half.', 'Number lines are only for whole numbers.'],
  praise: ['Point placed!', 'Spaces counted!', 'Fraction read!', 'Line measured!'],
  finale: 'Every point in its place — you can read fractions on a line! 📏',
};

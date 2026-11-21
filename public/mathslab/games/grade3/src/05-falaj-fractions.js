/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 3 · Falaj Fractions · a unit fraction as one part of a whole cut into b equal parts (3.NF.A.1)
   Source: G03-U02-MATH-L02 — الكسور كأعداد على خط الأعداد والكسور المتكافئة (3.NF.A.1).
   Mechanic = the thinking: level 1 shows a channel cut into b equal parts with one part marked and asks for the
   fraction — the picture does not print the fraction, so the child must count the parts and read which one is
   marked; level 2 shows a fraction and the child picks the drawing, where the two candidates differ in how many
   equal parts there are; level 3 is a word problem. `frac-add-den` (adding tops and bottoms) and `frac-parts-any`
   (parts need not be equal) are the named misconceptions.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g3-falaj-fractions', code: 'G03-MAT-05', title: 'Falaj Fractions', emoji: '💧',
  accent: '#1f8a9e', accentDeep: '#176f7f', skyA: '#eefbfd', skyB: '#cfeff4',
  topic: 'Unit fractions of a whole', band: 'g35', lang: 'en',
  objective: 'I can name a <b>unit fraction</b> when a whole is cut into <b>equal parts</b>.',
  welcome: 'An old falaj splits its water into equal shares. Every share must be exactly the same. 💧',
  learnBlurb: 'The bottom counts the equal parts. The top counts how many you take.',
  how: {
    what: 'A fraction describes equal parts of one whole. The bottom number says how many equal parts the whole is cut into.',
    steps: ['💧 Count all the equal parts — that is the bottom number.', '💧 Count the parts taken — that is the top number.', '✅ The parts must be equal, or it is not a fraction.'],
  },

  learn: [
    { say: 'The channel is cut into <b>4 equal parts</b> and <b>1</b> is marked. That part is <b>one quarter</b>, written ¼.',
      draw(el) { el.append(UI.h('div', { html: SCENE3.fracBar(1, 4, { caption: '4 equal parts, 1 marked' }) })); } },
    { say: 'The bottom number is always the count of parts: <b>4</b> parts makes quarters. The top number counts the parts taken: <b>1</b>.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE3.fracBar(1, 4, { caption: 'one of four equal parts' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: `one quarter = ${SCENE3.frac(1, 4, 20)}` }));
      } },
    { say: 'Your turn: the channel is cut into <b>6 equal parts</b> and <b>1</b> is marked. Which fraction is that?',
      wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE3.fracBar(1, 6) }));
        const row = UI.h('div', { class: 'opts' });
        [['1/6', true], ['1/5', false], ['6/1', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', html: SCENE3.frac(t.split('/')[0], t.split('/')[1], 20),
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — one part out of six equal parts is one sixth.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '6/1' ? 'The bottom counts the equal parts; the top counts the parts you take.' : 'Count every part in the bar, not just the shaded one.', 'bad'))),
        })));
        el.append(row);
      } },
    { say: 'Ghubar says a bar cut into <b>4 unequal</b> pieces still shows quarters. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Four pieces, so each one is a quarter. Size does not matter!', 5200);
        el.append(UI.h('div', { html: SCENE3.fracBar(1, 4, { caption: 'the parts must be equal' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — quarters must be four equal parts.', true], ['Yes — any four pieces are quarters.', false], ['Only if the pieces are counted.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — equal parts are the whole idea of a fraction.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Look at the pieces. Are they all the same size?', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Name the share', icon: '💧', blurb: 'Count the equal parts.', rounds: 6, think: false,
      say: '💧 Which fraction is marked?',
      round() {
        const den = UI.pick([2, 3, 4, 5, 6, 8]);
        const right = SCENE3.frac(1, den, 20);
        /* every decoy stays a proper fraction of the same shape, so the only way to choose is to count the
           equal parts in the picture — an improper option such as 3/1 would be eliminated on sight */
        const wrong = [SCENE3.frac(1, den + 1, 20), SCENE3.frac(1, den - 1 > 0 ? den - 1 : den + 2, 20), SCENE3.frac(2, den, 20)];
        return {
          type: 'choice',
          prompt: G1.art(SCENE3.fracBar(1, den, { max: 420 }), 'One part of the whole bar is marked.'),
          options: [right, ...wrong].filter((v, i, a) => a.indexOf(v) === i),
          answer: right,
          /* the option html is a stack of <span>s, so compare against the answer rather than parse it */
          why: (v) => (v === right ? 'Count the parts in the whole bar.' : `Count the equal parts in the bar: there are ${den}, and 1 is taken.`),
          hints: ['Count every equal part in the bar.', `There are ${den} parts.`, 'One part is taken, so the top is 1.'],
          solution: `One of ${den} equal parts is ${SCENE3.frac(1, den, 18)}.`,
        };
      } },
    { name: 'Pick the picture', icon: '🧩', blurb: 'Match the fraction to the bar.', rounds: 6, think: false,
      say: '🧩 Which bar shows this fraction?',
      round() {
        const den = UI.pick([3, 4, 5, 6, 8]);
        return {
          type: 'choice', prompt: `Which bar shows ${SCENE3.frac(1, den, 20)}?`,
          options: [
            `<div style="transform:scale(.95)">${SCENE3.fracBar(1, den, { max: 300 })}</div>`,
            `<div style="transform:scale(.95)">${SCENE3.fracBar(1, den + 1, { max: 300 })}</div>`,
          ],
          answer: `<div style="transform:scale(.95)">${SCENE3.fracBar(1, den, { max: 300 })}</div>`,
          why: () => `The bottom number tells how many equal parts: count them and look for ${den}.`,
          hints: [`The bottom is ${den}.`, `Look for a bar cut into ${den} equal parts.`, 'One part should be shaded in each bar.'],
          solution: `${SCENE3.frac(1, den, 18)} is one of ${den} equal parts.`,
        };
      } },
    { name: 'Share the water', icon: '📖', blurb: 'A story about equal shares.', rounds: 6, think: true,
      say: '📖 Think first: into how many equal parts?',
      round(i) {
        const den = 3 + (i % 4);
        return {
          type: 'choice',
          problem: {
            sentences: [`A falaj channel is cut into ${den} equal parts.`, 'The channel runs from the mountain to the village.', 'One family is given one part of the water.', 'Which fraction of the water does the family get?'],
            question: 3, keys: ['equal parts'], extras: [1],
          },
          prompt: 'Which fraction of the water does the family get?',
          options: [SCENE3.frac(1, den, 20), SCENE3.frac(1, den + 1, 20), SCENE3.frac(2, den, 20)].filter((v, i, a) => a.indexOf(v) === i),
          answer: SCENE3.frac(1, den, 20),
          why: () => `The whole is cut into ${den} equal parts and the family takes one.`,
          hints: [`The water is cut into ${den} equal parts.`, 'The family takes one of them.', 'One part out of all the parts.'],
          solution: `One of ${den} equal parts is ${SCENE3.frac(1, den, 18)}.`,
        };
      } },
  ],

  ghubar: ['Fractions: add the top numbers, add the bottom numbers.', 'Any pieces count — equal or not.', 'The top number is always the parts.'],
  praise: ['Equal parts counted!', 'Fraction named!', 'Quarters and sixths!', 'Water shared fairly!'],
  finale: 'Every share equal — you can name a unit fraction! 💧',
};

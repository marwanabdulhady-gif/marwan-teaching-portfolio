/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 4 · Ridge Angles · measuring and classifying angles (4.MD.C.5 / 4.MD.C.6 / 4.MD.C.7)
   Source: grade-04.md Grade 4 measurement strand — angles (4.MD.C.5–7).
   Mechanic = the thinking: level 1 shows an angle on a protractor with unnumbered 10° ticks and asks which
   label fits — the ticks are the evidence, and the exact degree is never printed; level 2 asks the child to
   classify (acute / right / obtuse / straight); level 3 is a story about a ridge and a sightline. `angle-right-90`
   (any open angle called a right angle) and `angle-read-other-side` (reading the protractor from the far end)
   are the named misconceptions.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g4-ridge-angles', code: 'G04-MAT-08', title: 'Ridge Angles', emoji: '📐',
  accent: '#4f5f8a', accentDeep: '#3f4c70', skyA: '#f4f6fd', skyB: '#dfe4f7',
  topic: 'Angles and their measure', band: 'g35', lang: 'en',
  objective: 'I can <b>measure an angle</b> in degrees and <b>classify</b> it as acute, right or obtuse.',
  welcome: 'The surveyor on the Asir ridge measures the sightline to the next peak with a protractor. 📐',
  learnBlurb: 'A right angle is 90°. Smaller is acute, bigger is obtuse.',
  how: {
    what: 'An angle measures the turn between two lines. A right angle is exactly 90 degrees; a straight line is 180.',
    steps: ['📐 Line the protractor up on the base line.', '📐 Count the ten-degree ticks from zero.', '✅ Say whether it is acute, right or obtuse.'],
  },

  learn: [
    { say: 'The protractor lies on the base line. The marks are every <b>10 degrees</b>, and every third one is thicker: 30, 60, 90.',
      draw(el) { el.append(UI.h('div', { html: SCENE4.angle(60, { protractor: true, max: 420 }) })); } },
    { say: 'This ray has turned <b>60 degrees</b> from the base. That is less than a right angle, so it is <b>acute</b>.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE4.angle(60, { protractor: true, showDeg: true, max: 400 }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '60° &lt; 90° → <b>acute</b>' }));
      } },
    { say: 'Your turn: this sightline is <b>120 degrees</b>. What kind of angle is it?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE4.angle(120, { protractor: true, showDeg: true, max: 400 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['Obtuse — more than 90° but less than 180°.', true], ['Acute — less than 90°.', false], ['Right — exactly 90°.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 120° is between 90° and 180°, so it is obtuse.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Compare with 90°. Is the ray past a quarter turn?', 'bad'))),
        })));
        el.append(row);
      } },
    { say: 'Ghubar calls every wide angle a right angle. Why is that wrong?', wait: true,
      draw(el, L) {
        GHUBAR.pop('It looks wide and square-ish. Anything near the corner is a right angle.', 5200);
        el.append(UI.h('div', { html: SCENE4.angle(120, { protractor: true, max: 380 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['A right angle is exactly 90°. 120° is past it.', true], ['He is right — wide means right.', false], ['Only triangles have right angles.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — a right angle is exactly a quarter turn, 90°.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Find the 90° mark on the protractor. Is the ray past it?', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Read the protractor', icon: '📐', blurb: 'Count the ten-degree ticks.', rounds: 6, think: false,
      say: '📐 How many degrees is this angle?',
      round() {
        const deg = UI.pick([20, 30, 40, 50, 60, 70, 80, 100, 110, 120, 130, 140, 150]);
        return {
          type: 'choice',
          prompt: G1.art(SCENE4.angle(deg, { protractor: true, max: 400 }), 'Each small mark is 10°, each thicker mark is 30°.'),
          options: [`${deg}°`, `${deg + 30}°`, `${180 - deg}°`],
          answer: `${deg}°`,
          why: (v) => v === `${180 - deg}°` ? 'You read the far side of the protractor. Start at the base line.' : 'Count the marks from the base line.',
          hints: ['Start at the base line — that is 0°.', 'Each thicker mark is 30°.', `Count the small marks after the last thick one.`],
          solution: `The ray has turned <b>${deg}°</b>.`,
        };
      } },
    { name: 'Acute, right or obtuse', icon: '📏', blurb: 'Classify the angle.', rounds: 6, think: false,
      say: '📏 What kind of angle is this?',
      round() {
        const choice = UI.pick([['acute', [15, 25, 40, 65, 85]], ['right', [90]], ['obtuse', [95, 110, 135, 160]], ['straight', [180]]]);
        const deg = UI.pick(choice[1]);
        const kind = choice[0];
        const right = { acute: 'Acute — less than 90°.', right: 'Right — exactly 90°.', obtuse: 'Obtuse — between 90° and 180°.', straight: 'Straight — exactly 180°.' }[kind];
        return {
          type: 'choice', prompt: G1.art(SCENE4.angle(deg, { max: 380 }), 'Compare it with a right angle.'),
          options: [right, ...['Acute — less than 90°.', 'Right — exactly 90°.', 'Obtuse — between 90° and 180°.', 'Straight — exactly 180°.'].filter((v) => v !== right).slice(0, 2)],
          answer: right,
          why: () => 'Compare the opening with a quarter turn (90°) and a half turn (180°).',
          hints: ['A quarter turn is 90°.', 'A half turn is 180°.', 'Where does the ray sit between them?'],
          solution: right,
        };
      } },
    { name: 'Sightline stories', icon: '📖', blurb: 'A story about two angles on a line.', rounds: 6, think: true,
      say: '📖 Think first: a straight line is 180°.',
      round(i) {
        const a = [35, 45, 60, 72, 110][i % 5];
        const b = 180 - a;
        return {
          type: 'number',
          problem: {
            sentences: [`A sightline runs straight from the ridge to the next peak.`, 'The surveyor notes the angles either side of the sightline.', `One angle on that straight line is ${a}°.`, 'How many degrees is the other angle?'],
            question: 3, keys: ['straight', 'other'], extras: [1],
          },
          prompt: 'How many degrees is the other angle?', answer: b, suffix: '°',
          why: (v) => v === a ? 'That is the angle you were given. Find the other one.' : 'The two angles make a straight line, which is 180°.',
          hints: ['A straight line measures 180°.', `${a}° is used up.`, `180 − ${a} = ?`],
          solution: `180° − ${a}° = <b>${b}°</b>.`,
        };
      } },
  ],

  ghubar: ['Every wide angle is a right angle.', 'Start counting from whichever end is nearer.', 'Angles are only in triangles.'],
  praise: ['Degrees read!', 'Angle classified!', 'Straight line split!', 'Ridge surveyed!'],
  finale: 'Every sightline measured — you can read and classify angles! 📐',
};

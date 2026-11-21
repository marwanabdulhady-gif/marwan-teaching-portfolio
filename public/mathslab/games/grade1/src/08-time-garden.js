/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 1 · Time in the Garden · reading o'clock and half past (draft G01-MAT step 8)
   Mechanic = the thinking: level 1 reads a clock; level 2 finds a clock among four (the half-past traps
   share the hour hand position); level 3 reads the hands' positions as words, so the child must know
   which hand names the hour.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const fmtTime = (h, half) => `${h}:${half ? '30' : '00'}`;

const GAME = {
  id: 'g1-time-garden', code: 'G01-MAT-08', title: 'Time in the Garden', emoji: '🌻',
  accent: '#3b6fb6', accentDeep: '#2a5289', skyA: '#fff7e2', skyB: '#ffecc4',
  topic: 'Time to the hour and half hour', band: 'k2', lang: 'en',
  objective: 'I can read an analogue clock and say the time to the <b>hour</b> and to <b>half past</b>.',
  welcome: 'The garden has a clock. It tells Noor when to water the plants. 🌻',
  learnBlurb: 'The short hand names the hour; the long hand says o’clock or half past.',
  how: {
    what: 'The short hand tells the hour. The long hand tells whether it is o’clock or half past.',
    steps: ['🕰️ Find the short hand — that is the hour.', '📏 Long hand at 12 → o’clock. Long hand at 6 → half past.', '✅ Read the hour, then add o’clock or half past.'],
  },

  learn: [
    { say: 'The garden clock shows the watering time. What time is it?',
      draw(el) { el.append(UI.h('div', { html: SCENE.clock(4, 0) })); } },
    { say: 'The <b>short</b> hand points to 4. The <b>long</b> hand points to 12. That is <b>4 o’clock</b>.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE.clock(4, 0) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: 'Long hand at 12 → o’clock. Short hand at 4 → 4 o’clock.' }));
      } },
    { say: 'Your turn: the long hand is at <b>6</b>. What does that mean?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE.clock(8, 1) }));
        const row = UI.h('div', { class: 'opts' });
        [['Half past', true], ['O’clock', false], ['Quarter past', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Yes — long hand at 6 means half past, so this is half past 8.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Where does the long hand point — 12 or 6?', 'bad')),
        })));
        el.append(row);
      } },
    { say: 'Ghubar read the long hand as the hour and said <b>12 o’clock</b>. Which hand names the hour?', wait: true,
      draw(el, L) {
        GHUBAR.pop('The long one is longest, so it must be the hour!', 5000);
        const row = UI.h('div', { class: 'opts' });
        [['The short hand.', true], ['The long hand.', false], ['Both hands, always.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Right — short hand for hours.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('The short hand is the hour hand. What number is it near?', 'bad')),
        })));
        el.append(UI.h('div', { html: SCENE.clock(4, 0) }), row);
      } },
  ],

  levels: [
    { name: 'Read the clock', icon: '🕰️', blurb: 'O’clock and half past.', rounds: 4, think: false,
      say: '🕰️ What time does the clock show?',
      round() {
        const h = UI.rint(1, 12), half = UI.pick([0, 1]);
        return {
          type: 'choice', prompt: G1.art(SCENE.clock(h, half), 'The short hand is orange; the long hand is blue.'),
          options: G1.opts(fmtTime(h, half), [fmtTime(h, half ? 0 : 1), fmtTime(h === 12 ? 1 : h + 1, half), fmtTime(h === 1 ? 12 : h - 1, half)]),
          answer: fmtTime(h, half),
          why: (v) => String(v).endsWith(':00') && half ? 'The long hand is at 6, so it is half past — not o’clock.' : String(v).endsWith(':30') && !half ? 'The long hand is at 12, so it is o’clock.' : 'Read the short hand first, then the long hand.',
          hints: ['Which number does the short hand point to?', 'Where is the long hand — 12 or 6?', `The short hand is at ${h}.`],
          solution: `Short hand at ${h}, long hand at ${half ? 6 : 12} → <b>${fmtTime(h, half)}</b>.`,
        };
      } },
    { name: 'Find the clock', icon: '🔎', blurb: 'Which clock shows this time?', rounds: 4, think: false,
      say: '🔎 Find the clock that shows the time.',
      round() {
        const h = UI.rint(1, 11), half = UI.pick([0, 1]);
        const want = fmtTime(h, half);
        const times = UI.shuffle([[h, half], [h, half ? 0 : 1], [h === 12 ? 1 : h + 1, half], [h === 1 ? 12 : h - 1, half]]);
        return {
          type: 'choice', prompt: `Which clock shows <b>${want}</b>?`,
          /* the engine renders an option with String(o) and compares with ===, so a picture option must be the
             HTML string itself — a {key, html} object would print as "[object Object]" */
          options: times.map((t) => SCENE.clock(t[0], t[1], 120)),
          answer: SCENE.clock(h, half, 120),
          why: () => 'Check both hands: the short one for the hour, the long one for half past.',
          hints: ['Look at the long hand first.', `The long hand should point to ${half ? 6 : 12}.`, `Then the short hand should be at ${h}.`],
          solution: `The clock with the short hand at ${h} and the long hand at ${half ? 6 : 12} shows <b>${want}</b>.`,
        };
      } },
    { name: 'Garden day', icon: '🌻', blurb: 'Half past in a garden routine.', rounds: 4,
      say: '🌻 Think first: when does Noor water the plants?',
      round(i) {
        const h = 3 + (i % 4);
        return {
          type: 'choice',
          problem: {
            sentences: [`Noor waters the plants at half past ${h}.`, 'The garden has many palms.', 'She fills the can twice.', `Which clock shows half past ${h}?`],
            question: 3, keys: ['half', 'past'], extras: [1, 2],
          },
          prompt: `Which clock shows <b>half past ${h}</b>?`,
          options: UI.shuffle([[h, 1], [h, 0], [h + 1, 0]]).map((t) => SCENE.clock(t[0], t[1], 120)),
          answer: SCENE.clock(h, 1, 120),
          why: () => 'Half past means the long hand is on the 6.',
          hints: ['“Half past” tells you where the long hand is.', 'The long hand points to 6.', `The short hand is between ${h} and ${h + 1}.`],
          solution: `Half past ${h} → <b>${fmtTime(h, 1)}</b>.`,
        };
      } },
  ],

  ghubar: ['The long hand is the hour. It is longest!', 'Half past twelve and half past one are the same.', 'Six o’clock? The hand is on six!'],
  praise: ['Read it perfectly!', 'You know your hands!', 'O’clock and half past!', 'The garden is on time!'],
  finale: 'You can read the garden clock — hour and half hour! 🌻',
};

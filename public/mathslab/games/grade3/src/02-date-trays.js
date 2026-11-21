/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 3 · Date Tray Sharing · division as equal sharing and equal grouping (3.OA.A.2)
   Source: G03-U01-MATH-L02 — الضرب والقسمة كتساويات المجموعات والمصفوفات ضمن ١٠٠ (3.OA.A.2).
   Mechanic = the thinking: level 1 shares a known total into a known number of trays and asks for the size of
   one share; level 2 keeps the total and asks how many trays are needed when each tray takes a known number —
   the two readings of division, and the child must choose which one the question asks; level 3 is a word
   problem with an extra sentence, so the numbers have to be picked out of the story first.
   Misconception `div-swap` (always "total ÷ bins") is named and treated.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g3-date-trays', code: 'G03-MAT-02', title: 'Date Tray Sharing', emoji: '🧺',
  accent: '#a8781f', accentDeep: '#8a6114', skyA: '#fff9ec', skyB: '#f7e6c4',
  topic: 'Division as equal sharing', band: 'g35', lang: 'en',
  objective: 'I can <b>share a total equally</b> and say how many are in each group or how many <b>groups</b> there are.',
  welcome: 'The date stall has to fill trays so that every tray is exactly the same. 🧺',
  learnBlurb: 'Sharing needs two numbers: the total and either the trays or the size of a tray.',
  how: {
    what: 'Division undoes multiplication. If you know the total and the number of trays, division tells you the size of one tray.',
    steps: ['🧺 Read the total.', '🧺 Read what is shared: trays, or dates per tray.', '✅ Divide. Check by multiplying back.'],
  },

  learn: [
    { say: 'There are <b>12 dates</b> and <b>3 trays</b>. That is <b>12 ÷ 3</b> — how many dates on each tray.',
      draw(el) { el.append(UI.h('div', { html: SCENE3.share(12, 3) })); } },
    { say: '<b>12 ÷ 3 = 4</b>. Each tray gets 4, and 4 × 3 = 12 puts them back together. Multiplication checks division.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE3.share(12, 3, { max: 520 }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '4 on each tray × 3 trays = <b>12</b> dates' }));
      } },
    { say: 'Your turn: <b>20 dates</b> on <b>5 trays</b>. How many on each tray?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE3.share(20, 5, { max: 560 }) }));
        const row = UI.h('div', { class: 'opts' });
        [4, 15, 5].forEach((v) => row.append(UI.h('button', {
          class: 'opt', text: String(v),
          onclick: (e) => (v === 4 ? (e.target.classList.add('good'), L.ok('Yes — 20 ÷ 5 = 4 on each tray.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(v === 15 ? 'That subtracts the trays. Share 20 equally into 5.' : 'Try 5 × something = 20.', 'bad'))),
        })));
        el.append(row);
      } },
    { say: 'Ghubar says <b>20 ÷ 5 = 15</b>. Why is that not sharing?', wait: true,
      draw(el, L) {
        GHUBAR.pop('20 dates, 5 trays — 20 − 5 = 15 on each. Easy!', 5200);
        el.append(UI.h('div', { html: SCENE3.share(20, 5, { max: 520 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['He subtracted. Division splits 20 into 5 equal trays of 4.', true], ['He forgot to carry.', false], ['He is right — 15 on each tray.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — 5 trays of 4 dates make 20.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Count one tray in the picture. Then multiply it by the trays.', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Fill the trays', icon: '🧺', blurb: 'A known total, a known number of trays.', rounds: 6, think: false,
      say: '🧺 How many dates on each tray?',
      round() {
        const t = UI.rint(2, 6), each = UI.rint(2, 6), total = t * each;
        return {
          type: 'number', prompt: G1.art(SCENE3.share(total, t, { max: 580 }), `${total} dates shared equally into ${t} trays.`),
          answer: each, suffix: '',
          why: (v) => v === total - t ? 'That subtracts the trays. Sharing splits the total into equal parts — divide.'
            : v === total ? 'That is the total. The question asks about one tray.'
            : 'Ask: what times the trays makes the total?',
          hints: [`There are ${total} dates.`, `They go into ${t} equal trays.`, `${t} × ? = ${total}`],
          solution: `${total} ÷ ${t} = <b>${each}</b> dates on each tray.`,
        };
      } },
    { name: 'How many trays?', icon: '🍽️', blurb: 'The same total, a known tray size.', rounds: 6, think: false,
      say: '🍽️ How many trays are needed?',
      round() {
        const each = UI.rint(2, 6), t = UI.rint(2, 6), total = t * each;
        return {
          type: 'number',
          prompt: G1.art(SCENE3.share(total, t, { max: 580 }), `${total} dates, ${each} dates on every tray.`),
          answer: t, suffix: '',
          why: (v) => v === each ? 'That is the size of one tray. The question asks how many trays.'
            : v === total - each ? 'That subtracts one tray. Divide to find how many trays fit the total.'
            : 'Ask: how many groups of ' + each + ' are inside ' + total + '?',
          hints: [`Each tray takes ${each} dates.`, `You have ${total} dates.`, `${each} × ? = ${total}`],
          solution: `${total} ÷ ${each} = <b>${t}</b> trays.`,
        };
      } },
    { name: 'Stall stories', icon: '📖', blurb: 'A story with a spare sentence.', rounds: 6, think: true,
      say: '📖 Think first: what is being shared?',
      round(i) {
        const t = 3 + (i % 3), each = 4 + (i % 2), total = t * each;
        return {
          type: 'number',
          problem: {
            sentences: [`The date stall has ${total} dates to sell.`, 'The stall opens just after dawn.', `The dates are shared equally into ${t} boxes.`, 'How many dates are in each box?'],
            question: 3, keys: ['each'], extras: [1],
          },
          prompt: 'How many dates are in each box?', answer: each, suffix: '',
          why: (v) => v === total - t ? 'Boxes were subtracted. Sharing means splitting the total into equal parts.' : 'Divide the total by the number of boxes.',
          hints: [`${total} dates in all.`, `They are split into ${t} boxes.`, `${t} × ? = ${total}`],
          solution: `${total} ÷ ${t} = <b>${each}</b> dates in each box.`,
        };
      } },
  ],

  ghubar: ['Sharing is the same as taking away.', 'Dividing always means the big number goes first.', 'One tray does not need counting.'],
  praise: ['Shared fairly!', 'Trays even!', 'Division checked!', 'Every tray the same!'],
  finale: 'Every tray filled exactly — you can share a total equally! 🧺',
};

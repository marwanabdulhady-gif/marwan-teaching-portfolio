/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 3 · Souq Tables · times tables as repeated rows on a skip-count track (3.OA.C.7)
   Source: G03-U01-MATH-L02 — جداول الضرب ضمن ١٠٠ (3.OA.A.1, 3.OA.C.7).
   Mechanic = the thinking: level 1 reads a skip-count track with the last stop hidden, so the child must find
   the step and continue it (not count the circles); level 2 asks for the missing middle stop, which cannot be
   reached by adding the endpoints; level 3 is a word problem where the track is a crate stack by the crate.
   Misconception `table-skip` (mistaking the step) and `table-add-start` (adding the start to the step) are named.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g3-souq-tables', code: 'G03-MAT-04', title: 'Souq Tables', emoji: '🛒',
  accent: '#3b6fb6', accentDeep: '#2e598f', skyA: '#f0f6ff', skyB: '#d9e6fb',
  topic: 'Times tables within 100', band: 'g35', lang: 'en',
  objective: 'I can use a <b>times table</b> to find a missing product and explain the <b>step</b>.',
  welcome: 'The souq stall stacks its goods in equal steps: two more, five more, six more. Follow the step. 🛒',
  learnBlurb: 'Find the step, then keep adding it.',
  how: {
    what: 'A times table is a skip-count with a fixed step. The step is what one more row adds.',
    steps: ['🛒 Find the step: how much does each stop grow?', '🛒 Keep adding the step.', '✅ The number of stops times the step gives the product.'],
  },

  learn: [
    { say: 'The stalls are numbered <b>6, 12, 18, 24</b>. Each stop is <b>6</b> more than the one before.',
      draw(el) { el.append(UI.h('div', { html: SCENE2.skipTrack(6, 6, 5, { hideLast: false }) })); } },
    { say: 'The next stop is <b>24 + 6 = 30</b>. That is the <b>5 times table</b> counting by 6: five stops of 6 make 30.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE2.skipTrack(6, 6, 6, { hideLast: false }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '5 × 6 = <b>30</b>' }));
      } },
    { say: 'Your turn: <b>4, 8, 12, …</b> What comes next?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE2.skipTrack(4, 4, 4) }));
        const row = UI.h('div', { class: 'opts' });
        [16, 13, 20].forEach((v) => row.append(UI.h('button', {
          class: 'opt', text: String(v),
          onclick: (e) => (v === 16 ? (e.target.classList.add('good'), L.ok('Yes — add 4 again: 12 + 4 = 16.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(v === 13 ? 'That added the step to one number only. Each stop grows by the same step.' : 'Find the step first: 8 − 4 = ?', 'bad'))),
        })));
        el.append(row);
      } },
    { say: 'Ghubar wrote <b>4 + 8 = 12</b> for the next stop. Why is that wrong?', wait: true,
      draw(el, L) {
        GHUBAR.pop('4, then 8, so next is 4 + 8 = 12. Pattern found!', 5200);
        el.append(UI.h('div', { html: SCENE2.skipTrack(4, 4, 4) }));
        const row = UI.h('div', { class: 'opts' });
        [['The step is 4, so add 4 to the last stop: 12 + 4 = 16.', true], ['He should double it: 24.', false], ['He is right — 12 comes next.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — the step is the gap between stops, not the start.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('What is the difference between 4 and 8? Use that same step.', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Follow the step', icon: '🛒', blurb: 'The last stop is hidden.', rounds: 6, think: false,
      say: '🛒 Which number comes next?',
      round() {
        const step = UI.pick([2, 3, 4, 5, 6]), start = step * UI.rint(1, 4), n = UI.rint(4, 5);
        const answer = start + step * (n - 1);
        return {
          type: 'number',
          prompt: G1.art(SCENE2.skipTrack(start, step, n, { max: 520 }), `The track grows by the same step.`),
          answer, suffix: '',
          why: (v) => v === start + step ? 'That used the first number as the step from the start. The step is the gap between stops.'
            : v === answer - 1 ? 'Off by one: add the whole step, not one.' : 'Find the gap between two stops, then add it to the last stop.',
          hints: [`Compare two stops: how much bigger is the second?`, `The step is ${step}.`, `${answer - step} + ${step} = ?`],
          solution: `The step is ${step}. ${answer - step} + ${step} = <b>${answer}</b>.`,
        };
      } },
    { name: 'The missing stop', icon: '❓', blurb: 'A gap in the middle of the track.', rounds: 6, think: false,
      say: '❓ Which number belongs in the gap?',
      round() {
        const step = UI.pick([2, 3, 4, 5, 6, 7]), k = UI.rint(2, 4);
        const before = step * k, after = step * (k + 2), answer = step * (k + 1);
        return {
          type: 'number',
          prompt: `<div style="display:grid;gap:8px;justify-items:center"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center;font-size:26px;font-weight:900">
            <span>${before}</span><span style="opacity:.45">·</span><span style="border:3px dashed #3b6fb6;border-radius:12px;padding:2px 14px">?</span><span style="opacity:.45">·</span><span>${after}</span></div>
            <p style="margin:0;font-size:15px;font-weight:700;color:#5b6b7a">Three stops of the same table, in order.</p></div>`,
          answer, suffix: '',
          why: (v) => v === after - 1 ? 'That is one short of the gap. The two stops are a whole step apart.' : 'Halve the gap between the two stops to find the step.',
          hints: [`The gap from ${before} to ${after} is ${after - before}.`, `Two steps fit in that gap, so one step is ${step}.`, `${before} + ${step} = ?`],
          solution: `The step is ${step}: ${before} + ${step} = <b>${answer}</b>, and ${answer} + ${step} = ${after}.`,
        };
      } },
    { name: 'Stall stories', icon: '📖', blurb: 'A story about equal steps.', rounds: 6, think: true,
      say: '📖 Think first: what is the step?',
      round(i) {
        const step = 3 + (i % 4), rows = 4 + (i % 3), total = step * rows;
        return {
          type: 'number',
          problem: {
            sentences: [`A souq stall stacks crates in ${rows} equal layers.`, 'The stall opens before the dawn prayer.', `Each layer holds ${step} crates.`, 'How many crates are stacked?'],
            question: 3, keys: ['each', 'how many'], extras: [1],
          },
          prompt: 'How many crates are stacked?', answer: total, suffix: '',
          why: (v) => v === step + rows ? 'That adds the layers and the crates. Multiply instead — every layer adds the same again.' : 'Multiply the layers by the crates in each layer.',
          hints: [`There are ${rows} layers.`, `Every layer holds ${step} crates.`, `${rows} × ${step} = ?`],
          solution: `${rows} × ${step} = <b>${total}</b> crates.`,
        };
      } },
  ],

  ghubar: ['Patterns are decoration — just guess the next number.', 'Add the first two numbers and you always get the third.', 'Times tables are only for the 10s.'],
  praise: ['Step found!', 'Table followed!', 'Gap closed!', 'Skip-counted!'],
  finale: 'Every stop in its place — the whole table is yours! 🛒',
};

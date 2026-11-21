/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 1 · Counting Cove · counting to 20 with one-to-one matching (draft G01-MAT step 1)
   Mechanic = the thinking: level 1 asks the pupil to pick the group that matches a number (matching, not
   guessing), level 2 counts a drawn group, level 3 counts past ten where the second ten-frame is the trap.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g1-counting-cove', code: 'G01-MAT-01', title: 'Counting Cove', emoji: '🐟',
  accent: '#0f8394', accentDeep: '#0a5f6c', skyA: '#eaf8fb', skyB: '#cdeef4',
  topic: 'Counting to 20', band: 'k2', lang: 'en',
  objective: 'I can <b>count</b> a group of objects to 20 by touching each one <b>once</b>.',
  welcome: 'The tide is out and the cove is full of fish. Let us count them! 🐟',
  learnBlurb: 'Touch each fish once, then say the last number.',
  how: {
    what: 'Count every fish once. The last number you say tells how many there are.',
    steps: ['👆 Touch each fish one time as you count.', '🔢 Say the numbers in order: 1, 2, 3 …', '✅ The last number is the answer.'],
  },

  learn: [
    { say: 'Noor counts the fish in the cove at the Corniche. How many are swimming?',
      draw(el) { el.append(UI.h('div', { html: SCENE.tenFrame(6, { kind: 'fish', color: '#1c7791' }) })); } },

    { say: 'Touch each fish once. <b>1, 2, 3, 4, 5, 6</b>. The last number is how many.',
      draw(el) {
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:18px', html: 'A ten-frame lines them up so nothing is missed.' }));
        el.append(UI.h('div', { html: SCENE.tenFrame(6, { kind: 'fish', color: '#1c7791' }) }));
      } },

    { say: 'Your turn: which box shows <b>8 fish</b>?', wait: true,
      draw(el, L) {
        const row = UI.h('div', { class: 'opts' });
        UI.shuffle([[8, true], [7, false], [9, false]]).forEach(([n, ok], i) => row.append(UI.h('button', {
          class: 'opt', html: SCENE.group(n, { kind: 'fish', color: '#1c7791', label: 'ABCD'[i] }),
          onclick: (e) => ok ? (e.target.closest('.opt').classList.add('good'), L.ok('Yes — eight fish, one in each of eight spaces.'))
            : (UI.shake(e.target.closest('.opt')), SFX.play('wrong'), COACH.say(`That is ${n}. Count again: one fish, one space.`, 'bad')),
        })));
        el.append(row);
      } },

    { say: 'Ghubar says: “I counted that fish twice and got 14!” What went wrong?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Twice is nicer! Counting is counting!', 5000);
        const row = UI.h('div', { class: 'opts' });
        [['He touched one fish two times.', true], ['He counted the whole cove twice.', false], ['Nothing — 14 is right.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Exactly — every object gets one touch only.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Look at the frame: is any space counted twice?', 'bad')),
        })));
        el.append(UI.h('div', { html: SCENE.tenFrame(13, { kind: 'fish', color: '#1c7791' }) }), row);
      } },
  ],

  levels: [
    { name: 'Match the group', icon: '👆', blurb: 'Which group shows this many?', rounds: 4, think: false,
      say: '👆 Find the group that matches the number.',
      round(i) {
        const n = 5 + i + UI.rint(0, 2);
        const labels = UI.shuffle(['A', 'B', 'C', 'D']);
        const pool = UI.shuffle([n, n - 1, n + 1, n + 2]);
        const art = (k) => SCENE.group(k, { kind: 'fish', color: '#1c7791', label: labels[pool.indexOf(k)] });
        return {
          type: 'choice', prompt: `Which group shows <b>${n} fish</b>?`,
          options: pool.map(art), answer: art(n),
          why: () => 'Count the group, one dot at a time. The label is not the count.',
          hints: ['Count the group, not the label.', 'Touch each dot once as you count.', `You are looking for ${n}.`],
          solution: `The group with <b>${n}</b> objects matches ${n}.`,
        };
      } },

    { name: 'Count the cove', icon: '🐟', blurb: 'Count a drawn group and type the total.', rounds: 4, think: false,
      say: '🐟 Count the fish, then type how many.',
      round(i) {
        const n = 11 + i + UI.rint(0, 2);
        return {
          type: 'number', prompt: G1.art(SCENE.tenFrame(n, { kind: 'fish', color: '#1c7791' }), 'Count every fish one time.'),
          answer: n, suffix: '',
          why: (v) => v === n + 1 ? 'You counted one twice — every fish gets one touch.' : v === n - 1 ? 'You missed one fish. Count along the row again.'
            : v === 10 ? 'The second frame has more than ten — keep counting.' : 'Start at 1 and touch each fish once.',
          hints: ['Start at the first fish on the left.', 'Count the whole first frame (ten), then keep going.', `You should reach ${n}.`],
          solution: `Touch each fish once: <b>1 … ${n}</b>. There are <b>${n} fish</b>.`,
        };
      } },

    { name: 'Past ten', icon: '🔢', blurb: 'Ten and some more.', rounds: 4, think: false,
      say: '🔢 Bigger groups. Do not stop at ten!',
      round() {
        const n = 15 + UI.rint(0, 5);
        return {
          type: 'number', prompt: G1.art(SCENE.tenFrame(n, { kind: 'shell', color: '#c87839' }), 'How many shells?'),
          answer: n, suffix: '',
          why: (v) => v === n - 10 ? 'Do not stop at ten — the second frame has more.' : v === 10 ? 'That is only the first frame. Count the rest too.' : 'Count every shell, not just the first frame.',
          hints: ['The first frame holds ten.', 'Ten and some more — count the extra shells.', `Ten and ${n - 10} more.`],
          solution: `Ten in the first frame and ${n - 10} more: <b>${n}</b>.`,
        };
      } },
  ],

  ghubar: ['I count fish twice. They like it!', 'Ten? Twelve? Almost the same.', 'I start at the biggest number.'],
  praise: ['Every fish counted!', 'Not one missed!', 'Super counting!', 'One touch each — perfect!'],
  finale: 'You counted every fish in the cove — one touch each! 🐟',
};

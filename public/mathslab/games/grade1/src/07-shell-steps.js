/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 1 · Shell-Step Measure · measuring with equal non-standard units (draft G01-MAT step 7)
   Mechanic = the thinking: the child counts the equal blocks that cover the shell, then in level 2 compares
   two measured shells (a difference, not a recount), and in level 3 judges a measurement done wrongly.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g1-shell-steps', code: 'G01-MAT-07', title: 'Shell-Step Measure', emoji: '🐚',
  accent: '#0d8b84', accentDeep: '#0a6a64', skyA: '#eefaf8', skyB: '#d2f0ec',
  topic: 'Measuring length', band: 'k2', lang: 'en',
  objective: 'I can measure length by covering it with <b>equal units</b>, from one end to the other, with <b>no gaps</b>.',
  welcome: 'Noor found a big shell on the beach. How long is it? 🐚',
  learnBlurb: 'Start at one end, use equal blocks, leave no gaps.',
  how: {
    what: 'Measuring means counting equal units from the start to the end.',
    steps: ['📏 Start the first block at one end.', '🧱 Use blocks the same size, touching.', '✅ Count the blocks to get the length.'],
  },

  learn: [
    { say: 'Noor measures a shell with step blocks. They are all the same size and they touch.',
      draw(el) { el.append(UI.h('div', { html: SCENE.blocks(5) })); } },
    { say: 'Start at the shell’s end, use equal blocks, stop at the other end: <b>5 blocks</b> long.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE.blocks(5) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: 'One block, one space. No gaps, no overlaps → <b>5 blocks</b>.' }));
      } },
    { say: 'Your turn: how many equal blocks long is this shell?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE.blocks(7) }));
        const row = UI.h('div', { class: 'opts' });
        [['7 blocks', true], ['6 blocks', false], ['8 blocks', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Yes — seven equal blocks cover the shell.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Count the blocks, not the spaces between them.', 'bad')),
        })));
        el.append(row);
      } },
    { say: 'Ghubar left a gap between two blocks. Why does that not measure fairly?', wait: true,
      draw(el, L) {
        GHUBAR.pop('A little space helps them breathe!', 5000);
        const row = UI.h('div', { class: 'opts' });
        [['The gap means the blocks do not cover the whole shell.', true], ['Gaps make it longer, which is better.', false], ['It is fine — gaps do not count.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Exactly — no gaps and no overlaps, or the count is not the length.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('If there is a gap, is the shell fully covered?', 'bad')),
        })));
        el.append(UI.h('div', { html: SCENE.blocks(5) }), row);
      } },
  ],

  levels: [
    { name: 'Count the blocks', icon: '📏', blurb: 'How long is the shell in blocks?', rounds: 4, think: false,
      say: '📏 Count the equal blocks.',
      round() {
        const n = UI.rint(3, 9);
        return {
          type: 'number', prompt: G1.art(SCENE.blocks(n), 'The blocks touch from end to end.'),
          answer: n, suffix: '',
          why: (v) => v === n - 1 ? 'You counted the lines between blocks. Count the blocks themselves.' : v === n + 2 ? 'Count the blocks that are there; do not add extra.' : 'Count each equal block once.',
          hints: ['Start at the left end.', 'One block, one count.', `You should reach ${n}.`],
          solution: `<b>${n}</b> equal blocks cover the shell, so it is ${n} blocks long.`,
        };
      } },
    { name: 'Which is longer', icon: '⚖️', blurb: 'Compare two measured shells.', rounds: 4, think: false,
      say: '⚖️ Both shells are measured. How many blocks longer?',
      round() {
        let a = UI.rint(5, 9), b = UI.rint(3, a - 1);
        return {
          /* the caption must not state the two lengths: counting the blocks is the work */
          type: 'number', prompt: G1.art(SCENE.blocksCompare(a, b), 'Count the blocks under each shell.'),
          answer: a - b, suffix: '',
          why: (v) => v === a || v === b ? 'That is one shell’s length, not the difference.' : v === a + b ? 'You added both shells. The question asks how much longer.' : 'Subtract the shorter length from the longer one.',
          hints: ['Which shell is longer?', 'How many blocks does the longer one have?', `${a} − ${b} = ?`],
          solution: `${a} − ${b} = <b>${a - b}</b> blocks longer.`,
        };
      } },
    { name: 'Fair measuring', icon: '🔎', blurb: 'Spot the measurement that is not fair.', rounds: 4, think: false,
      say: '🔎 Which way of measuring is fair?',
      round() {
        const n = UI.rint(4, 8);
        return {
          type: 'choice', prompt: 'Noor wants to measure the shell. Which way is fair?',
          options: [
            'Use equal blocks that touch, from end to end.',
            'Use different-sized blocks.',
            'Leave gaps between the blocks.',
            'Start the first block past the shell.',
          ],
          answer: 'Use equal blocks that touch, from end to end.',
          why: (v) => String(v).includes('different') ? 'Different sizes cannot be counted as units.' : String(v).includes('gaps') ? 'A gap leaves part of the shell unmeasured.' : 'Start at the very end of the shell.',
          hints: ['What makes a measurement fair?', 'Every unit must be the same size.', 'And they must cover the whole shell.'],
          solution: `<b>Equal blocks that touch, from end to end</b> — that measures ${n} blocks fairly here.`,
        };
      } },
  ],

  ghubar: ['Spaces help the blocks breathe.', 'Big block, small block — counting is counting.', 'I measure from the middle. Faster!'],
  praise: ['Measured fairly!', 'Equal units!', 'No gaps, no overlaps!', 'Shell science!'],
  finale: 'Every shell measured with equal units — no gaps! 🐚',
};

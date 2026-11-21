/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 4 · Majlis Fractions · adding and subtracting fractions with like denominators (4.NF.B.3)
   Source: G04-U02-MATH-L02 — جمع الكسور وطرحها ذات المقامات المتشابهة (4.NF.B.3).
   Mechanic = the thinking: level 1 shows two bars cut the same way and asks for the total shaded, so the child
   adds the shaded parts and keeps the denominator; level 2 asks for the missing addend by subtraction; level 3
   is a story where a whole must be turned into a fraction (`whole-to-fraction`). `frac-add-den` (adding the
   denominators) and `frac-sub-both` (subtracting both top and bottom) are the named misconceptions.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g4-majlis-fractions', code: 'G04-MAT-06', title: 'Majlis Fractions', emoji: '🫖',
  accent: '#8c3f6b', accentDeep: '#703253', skyA: '#fdf4f9', skyB: '#f6dcea',
  topic: 'Adding and subtracting like fractions', band: 'g35', lang: 'en',
  objective: 'I can <b>add and subtract fractions</b> that have the <b>same denominator</b>.',
  welcome: 'The majlis is being laid for guests: trays of qahwa poured in equal cups. 🫖',
  learnBlurb: 'Add the tops, keep the bottom. The pieces stay the same size.',
  how: {
    what: 'When the denominators match, the pieces are the same size. Add how many pieces there are and keep the size.',
    steps: ['🫖 Check the denominators match.', '🫖 Add or subtract the top numbers only.', '✅ The denominator stays the same.'],
  },

  learn: [
    { say: 'One tray is <b>2/6</b> full and a second tray is <b>3/6</b> full. Both are cut into sixths, so the pieces match.',
      draw(el) { el.append(UI.h('div', { html: SCENE4.fracSum(2, 6, 3, { caption: 'two sixths and three sixths' }) })); } },
    { say: '<b>2/6 + 3/6 = 5/6</b>. Only the top numbers were added. Sixths stay sixths — the denominator is the size of one piece.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE4.fracSum(2, 6, 3, { max: 500 }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '2 + 3 = 5 pieces, still sixths → <b>5/6</b>' }));
      } },
    { say: 'Your turn: <b>1/8 + 4/8</b>?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE4.fracSum(1, 8, 4, { max: 470 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['5/8', true], ['5/16', false], ['4/8', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 1 + 4 = 5 pieces, and they are still eighths.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '5/16' ? 'You added the denominators. The piece size does not change.' : 'Add both top numbers.', 'bad'))),
        })));
        el.append(row);
      } },
    { say: 'Ghubar added the denominators and wrote <b>5/14</b>. What went wrong?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Two sixths and three sixths: 2 + 3 on top, 6 + 8 on the bottom. Simple!', 5200);
        el.append(UI.h('div', { html: SCENE4.fracSum(2, 6, 3, { max: 440 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['He added the denominators. They name the piece size and stay the same.', true], ['He forgot to simplify.', false], ['Nothing — 5/14 is right.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — sixths plus sixths is still sixths.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Are the pieces still sixths? Then the bottom stays 6.', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Fill the trays', icon: '🫖', blurb: 'Add two shares of the same size.', rounds: 6, think: false,
      say: '🫖 How much is shaded altogether?',
      round() {
        const d = UI.pick([4, 5, 6, 8, 10]);
        const a = UI.rint(1, d - 2), b = UI.rint(1, d - a - 1);
        const answer = `${a + b}/${d}`;
        return {
          type: 'choice',
          prompt: G1.art(SCENE4.fracSum(a, d, b, { max: 470 }), 'Both bars are cut the same way.'),
          options: [answer, `${a + b}/${d + d}`, `${a * b}/${d}`],
          answer,
          /* why() is handed the raw value the round holds — for a choice round that is the option string, but it
             can also be a number from GAME_TEST.fail(), so stringify before using string methods */
          why: (v) => String(v).endsWith(`/${d + d}`) ? 'You added the denominators. The pieces stay the same size.'
            : 'Add the shaded parts and keep the denominator.',
          hints: [`Both bars are cut into ${d} parts.`, `${a} + ${b} = ?`, 'The denominator does not change.'],
          solution: `${a}/${d} + ${b}/${d} = <b>${answer}</b>.`,
        };
      } },
    { name: 'What is missing?', icon: '🧩', blurb: 'Subtract to find the gap.', rounds: 6, think: false,
      say: '🧩 Which fraction fills the gap?',
      round() {
        const d = UI.pick([5, 6, 8, 10]);
        const total = d - 1, have = UI.rint(1, total - 1);
        const answer = `${total - have}/${d}`;
        return {
          type: 'choice',
          prompt: `<p style="margin:0;font-size:24px;font-weight:900;text-align:center">${have}/${d} + <span style="border:3px dashed #8c3f6b;border-radius:12px;padding:2px 14px">?</span> = ${total}/${d}</p>`,
          options: [answer, `${total + have}/${d}`, `${total}/${d}`],
          answer,
          why: () => `Subtract what you have from the total: ${total} − ${have} pieces.`,
          hints: [`The total is ${total}/${d}.`, `You have ${have}/${d}.`, `${total} − ${have} = ?`],
          solution: `${total}/${d} − ${have}/${d} = <b>${answer}</b>.`,
        };
      } },
    { name: 'Guest stories', icon: '📖', blurb: 'A story where one whole is a fraction.', rounds: 6, think: true,
      say: '📖 Think first: how much is left?',
      round(i) {
        const d = [6, 8, 10, 5][i % 4];
        const poured = UI.rint(1, d - 2);
        return {
          type: 'choice',
          problem: {
            sentences: [`A tray of qahwa is cut into ${d} equal cups.`, 'The guests arrive after the sunset prayer.', `${poured} cups are poured for the first guests.`, 'What fraction of the tray is still full?'],
            question: 3, keys: ['still'], extras: [1],
          },
          prompt: 'What fraction of the tray is still full?',
          options: [`${d - poured}/${d}`, `${poured}/${d}`, `${d - poured}/${d - poured + poured + 1}`],
          answer: `${d - poured}/${d}`,
          why: (v) => v === `${poured}/${d}` ? 'That is what was poured. The question asks what is left.' : `The whole tray is ${d}/${d}. Subtract what was poured.`,
          hints: [`A whole tray is ${d}/${d}.`, `${poured} cups have been poured.`, `${d} − ${poured} = ?`],
          solution: `${d}/${d} − ${poured}/${d} = <b>${d - poured}/${d}</b>.`,
        };
      } },
  ],

  ghubar: ['Add the tops, add the bottoms, done.', 'A whole is just one.', 'Subtracting fractions means subtracting everything.'],
  praise: ['Tops added!', 'Same size kept!', 'Gap filled!', 'Tray poured!'],
  finale: 'Every cup the same size — you can add and subtract fractions! 🫖',
};

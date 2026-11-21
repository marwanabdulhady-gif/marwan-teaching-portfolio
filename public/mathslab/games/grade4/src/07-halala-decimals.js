/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 4 · Halala Decimals · decimals to hundredths (4.NF.C.6 / 4.NF.C.7)
   Source: Grade 4 fraction-decimal strand paired with G04-U02-MATH-L02's hundredths models (4.NF.C.6, 4.NF.C.7).
   Mechanic = the thinking: level 1 shows a hundredths grid with n squares shaded and asks for the decimal — the
   grid never prints the number, so the child must count tens and ones of squares; level 2 reverses it and asks
   the child to choose the grid that matches a decimal; level 3 compares two decimals in a money story. A
   hundredth is one halala, so the local context carries the place value. `dec-tenths-hundredths` (reading 0.4
   and 0.04 as equal) is the named misconception.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g4-halala-decimals', code: 'G04-MAT-07', title: 'Halala Decimals', emoji: '🪙',
  accent: '#157a5f', accentDeep: '#106450', skyA: '#effbf6', skyB: '#d2f0e4',
  topic: 'Decimals to hundredths', band: 'g35', lang: 'en',
  objective: 'I can read and write a decimal to <b>hundredths</b> from a <b>hundred grid</b> and compare two decimals.',
  welcome: 'One riyal is cut into one hundred halalas — the grid is the till drawer. 🪙',
  learnBlurb: 'The grid is one whole. Ten squares make a tenth.',
  how: {
    what: 'The whole grid is 1. Each row of ten squares is one tenth, so each square is one hundredth.',
    steps: ['🪙 Count the full rows — each row is 0.1.', '🪙 Count the squares in the last row — each is 0.01.', '✅ Write it as 0.32, thirty-two hundredths.'],
  },

  learn: [
    { say: 'The grid is <b>1</b> riyal. Thirty-two squares are shaded: <b>three rows</b> of ten and <b>two</b> more.',
      draw(el) { el.append(UI.h('div', { html: SCENE4.decimalGrid(32, { caption: 'each square is one halala' }) })); } },
    { say: 'Three rows is <b>0.3</b> and two squares is <b>0.02</b>. Together: <b>0.32</b>, or 32/100 — thirty-two hundredths.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE4.decimalGrid(32, { max: 380, caption: '0.3 + 0.02 = 0.32' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '32 squares of 100 → <b>0.32</b> = 32/100' }));
      } },
    { say: 'Your turn: <b>forty-one</b> squares are shaded. Which decimal is that?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE4.decimalGrid(41, { max: 340 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['0.41', true], ['0.041', false], ['4.1', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 41 of 100 squares is 0.41.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '4.1' ? 'That is more than four wholes. The grid is only one whole.' : 'Two digits go after the point: tenths then hundredths.', 'bad'))),
        })));
        el.append(row);
      } },
    { say: 'Ghubar says <b>0.4</b> is bigger than <b>0.32</b> because 4 is bigger than 32. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Zero point four against zero point three two: 4 beats 32. Obvious.', 5200);
        el.append(UI.h('div', { html: SCENE4.decimalGrid(40, { max: 320, caption: '0.4 is forty squares' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['He is right — 0.4 is forty squares and 0.32 is thirty-two.', true], ['No — 0.32 is bigger.', false], ['They are equal.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — 0.4 means 40 hundredths. Compare hundredths, not digits.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Write both as hundredths: 0.40 and 0.32.', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Read the drawer', icon: '🪙', blurb: 'Count rows and squares.', rounds: 6, think: false,
      say: '🪙 Which decimal is shaded?',
      round() {
        const n = UI.rint(6, 94);
        const answer = (n / 100).toFixed(2);
        return {
          type: 'choice', prompt: G1.art(SCENE4.decimalGrid(n, { max: 380 }), 'The whole grid is one riyal.'),
          options: [answer, (n / 10).toFixed(1), (n / 1000).toFixed(3)],
          answer,
          why: (v) => v === (n / 10).toFixed(1) ? 'You read the squares as tenths. Ten squares make one tenth.'
            : 'Count full rows for the tenths, then the squares left over for the hundredths.',
          hints: [`${Math.floor(n / 10)} full rows are shaded.`, `${n % 10} squares are left over.`, `${Math.floor(n / 10)} tenths and ${n % 10} hundredths.`],
          solution: `${n} of 100 squares = <b>${answer}</b>.`,
        };
      } },
    { name: 'Match the grid', icon: '🔲', blurb: 'Pick the drawing for a decimal.', rounds: 6, think: false,
      say: '🔲 Which grid shows this decimal?',
      round() {
        const n = UI.rint(11, 89);
        return {
          type: 'choice', prompt: `Which grid shows <b>${(n / 100).toFixed(2)}</b>?`,
          options: [
            `<div style="transform:scale(.92)">${SCENE4.decimalGrid(n, { max: 260 })}</div>`,
            `<div style="transform:scale(.92)">${SCENE4.decimalGrid(Math.min(99, n + 10), { max: 260 })}</div>`,
          ],
          answer: `<div style="transform:scale(.92)">${SCENE4.decimalGrid(n, { max: 260 })}</div>`,
          why: () => 'Count the full rows, then the squares: the decimal names hundredths.',
          hints: [`${(n / 100).toFixed(2)} is ${n} hundredths.`, `${Math.floor(n / 10)} full rows.`, `${n % 10} extra squares.`],
          solution: `${(n / 100).toFixed(2)} = ${n} shaded squares.`,
        };
      } },
    { name: 'Till stories', icon: '📖', blurb: 'Compare two prices in halalas.', rounds: 6, think: true,
      say: '📖 Think first: write both as hundredths.',
      round(i) {
        const a = UI.rint(11, 89), b = a === 20 ? 45 : UI.rint(11, 89);
        const hi = Math.max(a, b);
        return {
          type: 'choice',
          problem: {
            sentences: ['Two shops sell the same notebook.', 'The market is busy on Thursday evening.', `The first shop charges ${(a / 100).toFixed(2)} riyals.`, `Which price is greater: ${(a / 100).toFixed(2)} or ${(b / 100).toFixed(2)}?`],
            question: 3, keys: ['greater'], extras: [1],
          },
          prompt: `Which price is greater: ${(a / 100).toFixed(2)} or ${(b / 100).toFixed(2)}?`,
          options: [`${(hi / 100).toFixed(2)}`, `${((a === hi ? b : a) / 100).toFixed(2)}`, 'They are equal.'],
          answer: `${(hi / 100).toFixed(2)}`,
          why: () => 'Turn both into hundredths and compare the count of halalas.',
          hints: [`${(a / 100).toFixed(2)} is ${a} halalas.`, `${(b / 100).toFixed(2)} is ${b} halalas.`, 'Compare the whole numbers of halalas.'],
          solution: `${hi} halalas is the greater price: <b>${(hi / 100).toFixed(2)}</b>.`,
        };
      } },
  ],

  ghubar: ['0.4 and 0.32? Four is bigger than thirty-two.', 'The grid is decoration — read the digits.', 'Decimals are just fractions with a dot.'],
  praise: ['Rows counted!', 'Hundredths read!', 'Halalas compared!', 'Grid matched!'],
  finale: 'Every halala counted — you can read decimals to hundredths! 🪙',
};

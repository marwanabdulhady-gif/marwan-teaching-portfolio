/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 2 · Crate Arrays · arrays as repeated addition (2.OA.C.4 / 2.NBT.A.2)
   Mechanic = the thinking: level 1 counts a drawn array by rows (repeated addition, not one-by-one), level 2
   turns a row-and-column description into the matching array, level 3 is a word problem where the child must
   decide whether the array is rows or columns. Multiplication is not named — the grade-2 target is the array.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g2-crate-arrays', code: 'G02-MAT-08', title: 'Crate Arrays', emoji: '🍊',
  accent: '#c1692f', accentDeep: '#9c4f1e', skyA: '#fff7f0', skyB: '#fbe6d4',
  topic: 'Arrays and repeated addition', band: 'g35', lang: 'en',
  objective: 'I can <b>count an array</b> by rows and write it as <b>repeated addition</b>.',
  welcome: 'The orange crates are stacked in neat rows. Counting one by one will take all day. 🍊',
  learnBlurb: 'Count one row, then add it for every row.',
  how: {
    what: 'An array has equal rows. Add the row size once for each row instead of counting every crate.',
    steps: ['🍊 Count one row.', '🍊 Count how many rows.', '✅ Add the row size again for each row.'],
  },

  learn: [
    { say: 'The crates are in <b>3</b> rows with <b>4</b> in each row. How many crates?',
      draw(el) { el.append(UI.h('div', { html: SCENE2.array(3, 4) })); } },
    { say: 'One row is <b>4</b>. Three rows: <b>4 + 4 + 4 = 12</b>. That is faster than counting every crate.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE2.array(3, 4) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '4 + 4 + 4 = <b>12</b> crates.' }));
      } },
    { say: 'Your turn: <b>4</b> rows with <b>5</b> in each. How many crates?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE2.array(4, 5) }));
        const row = UI.h('div', { class: 'opts' });
        [20, 9, 25].forEach((v) => row.append(UI.h('button', {
          class: 'opt', text: String(v),
          onclick: (e) => v === 20 ? (e.target.classList.add('good'), L.ok('Yes — 5 + 5 + 5 + 5 = 20.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(v === 9 ? 'That adds the row count and the row size. Add 5 four times.' : 'You counted five rows. There are four.', 'bad')),
        })));
        el.append(row);
      } },
    { say: 'Ghubar added <b>4 + 5 = 9</b>. What should he add instead?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Four rows, five crates: 4 + 5 = 9 crates!', 5000);
        const row = UI.h('div', { class: 'opts' });
        [['5 + 5 + 5 + 5 — one 5 for each row.', true], ['4 + 4 + 4 + 4 + 4 — one 4 for each crate.', false], ['4 + 5 + 4 + 5.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Exactly — the row size is added once per row.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('What is in one row? How many rows are there?', 'bad')),
        })));
        el.append(UI.h('div', { html: SCENE2.array(4, 5) }), row);
      } },
  ],

  levels: [
    { name: 'Count the crates', icon: '🍊', blurb: 'Rows, then total.', rounds: 4, think: false,
      say: '🍊 How many crates altogether?',
      round() {
        const rows = UI.rint(2, 6), cols = UI.rint(2, 6);
        return {
          type: 'number', prompt: G1.art(SCENE2.array(rows, cols), `${rows} rows with ${cols} in each row.`),
          answer: rows * cols, suffix: '',
          why: (v) => v === rows + cols ? 'That adds the row count and the row size. Add the row size for each row.' : v === rows * 10 ? 'Count the crates in one row again.' : 'Count one row, then add it once per row.',
          hints: [`One row holds ${cols} crates.`, `There are ${rows} rows.`, `${Array(rows).fill(cols).join(' + ')} = ?`],
          solution: `${Array(rows).fill(cols).join(' + ')} = <b>${rows * cols}</b> crates.`,
        };
      } },
    { name: 'Which array?', icon: '🔲', blurb: 'Match the description to the picture.', rounds: 4, think: false,
      say: '🔲 Which picture shows these rows?',
      round() {
        const rows = UI.rint(2, 5), cols = UI.rint(2, 6);
        const alt = `${rows} rows with ${cols} in each`;
        /* the wrong picture keeps the row size and changes the number of rows, so the two are told apart by
           counting rows — not by a caption */
        const wrongRows = rows >= 5 ? rows - 2 : rows + 2;
        return {
          type: 'choice', prompt: `Which array shows <b>${alt}</b>?`,
          options: [
            `<div style="transform:scale(.88)">${SCENE2.array(rows, cols, { max: 300, bare: true })}</div>`,
            `<div style="transform:scale(.88)">${SCENE2.array(wrongRows, cols, { max: 300, bare: true })}</div>`,
          ],
          answer: `<div style="transform:scale(.88)">${SCENE2.array(rows, cols, { max: 300, bare: true })}</div>`,
          why: () => 'Count the rows in the picture, then count what is in one row.',
          hints: [`Look for ${rows} rows.`, `Each row must hold ${cols}.`, 'Count the top row first.'],
          solution: `The array with ${rows} rows of ${cols}. ${Array(rows).fill(cols).join(' + ')} = <b>${rows * cols}</b>.`,
        };
      } },
    { name: 'Market stacks', icon: '📦', blurb: 'A story with rows.', rounds: 4, think: true,
      say: '📦 Think first: how many rows?',
      round(i) {
        const rows = 3 + (i % 3), cols = 4 + (i % 2);
        return {
          type: 'number',
          problem: {
            sentences: [`The seller stacks ${rows} rows of crates.`, 'The crates are full of oranges.', `Each row has ${cols} crates.`, 'How many crates are stacked?'],
            question: 3, keys: ['how many'], extras: [1],
          },
          prompt: 'How many crates are stacked?', answer: rows * cols, suffix: '',
          why: (v) => v === rows + cols ? 'Rows plus row size is not the total — add the row size once per row.' : 'Add the row size for every row.',
          hints: [`Each row holds ${cols}.`, `There are ${rows} rows.`, 'Add the same number again and again.'],
          solution: `${Array(rows).fill(cols).join(' + ')} = <b>${rows * cols}</b> crates.`,
        };
      } },
  ],

  ghubar: ['Rows and columns? Just add the two numbers.', 'Counting one by one is always safest.', 'Arrays are decoration.'],
  praise: ['Rows counted!', 'Repeated addition!', 'Array spotted!', 'Stacked and solved!'],
  finale: 'Every crate counted by rows — you can read an array! 🍊',
};

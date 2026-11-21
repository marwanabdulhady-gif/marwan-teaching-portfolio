/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 3 · Terrace Arrays · rows × columns, and the turnaround fact (3.OA.A.1 / 3.OA.B.5)
   Source: G03-U01-MATH-L02 — المصفوفات ضمن ١٠٠ (3.OA.A.1, 3.OA.A.3).
   Mechanic = the thinking: level 1 counts an unnumbered dot array by rows (the dots carry no numbers, so one
   row must be counted and then used again); level 2 is the reverse direction — a fact is given and the child
   picks the array that shows it, where the two candidates are turnarounds of each other; level 3 asks which
   fact has the same total as a drawn array, which is multiplication's turnaround. `array-sums` (adding the two
   dimensions) and `rows-columns-mixed` are the named misconceptions.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g3-array-terraces', code: 'G03-MAT-03', title: 'Terrace Arrays', emoji: '🟠',
  accent: '#b26a2c', accentDeep: '#95521d', skyA: '#fff6ec', skyB: '#f8e0c6',
  topic: 'Arrays and the turnaround fact', band: 'g35', lang: 'en',
  objective: 'I can read an <b>array</b> as rows × columns and find the <b>turnaround fact</b>.',
  welcome: 'The terrace of the old house is tiled in neat rows. Oranges are drying on every tile. 🟠',
  learnBlurb: 'Rows × columns = total. Turn the array and the total stays.',
  how: {
    what: 'An array has equal rows. Count the rows, count one row, and multiply. Turned on its side it is a different fact with the same total.',
    steps: ['🟠 Count one row.', '🟠 Count how many rows.', '✅ Rows × row size = total.'],
  },

  learn: [
    { say: 'The oranges sit in <b>3 rows</b> with <b>6</b> in each row. That array shows <b>3 × 6</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE3.dots(3, 6) })); } },
    { say: '<b>3 × 6 = 18</b>. Look again from the side: it is <b>6 rows of 3</b>, and 6 × 3 is still 18. Same oranges, different fact.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE3.dots(3, 6, { max: 460 }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '3 × 6 = 18 &nbsp;·&nbsp; 6 × 3 = <b>18</b> — the turnaround fact' }));
      } },
    { say: 'Your turn: how many oranges in <b>4 rows of 5</b>?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE3.dots(4, 5, { max: 460 }) }));
        const row = UI.h('div', { class: 'opts' });
        [20, 9, 25].forEach((v) => row.append(UI.h('button', {
          class: 'opt', text: String(v),
          onclick: (e) => (v === 20 ? (e.target.classList.add('good'), L.ok('Yes — 4 × 5 = 20 oranges.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(v === 9 ? 'You added the rows and the row size. Multiply them.' : 'Count one row, then use it for each row.', 'bad'))),
        })));
        el.append(row);
      } },
    { say: 'Ghubar wrote <b>4 + 5 = 9</b> for this array. What went wrong?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Four rows, five oranges in a row. So 4 + 5 = 9 oranges!', 5200);
        el.append(UI.h('div', { html: SCENE3.dots(4, 5, { max: 420 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['He should multiply 4 × 5 — every row adds another 5.', true], ['Nothing — 9 is correct.', false], ['He should add 4 five times.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — 5 + 5 + 5 + 5 = 20, and 4 × 5 = 20.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Count one row in the picture. Then multiply by the rows.', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Count the terrace', icon: '🟠', blurb: 'Rows × row size.', rounds: 6, think: false,
      say: '🟠 How many oranges are on the terrace?',
      round() {
        const r = UI.rint(2, 6), c = UI.rint(2, 8);
        return {
          type: 'number', prompt: G1.art(SCENE3.dots(r, c, { max: 500 }), 'The oranges are in equal rows.'),
          answer: r * c, suffix: '',
          why: (v) => v === r + c ? 'That adds the rows and the row size. Each row brings another full row of oranges — multiply.'
            : v === c ? 'That counts the top row only.'
            : 'Count one row, then multiply by the number of rows.',
          hints: [`Count one row: ${c} oranges.`, `There are ${r} rows.`, `${r} × ${c} = ?`],
          solution: `${r} rows of ${c} → ${r} × ${c} = <b>${r * c}</b> oranges.`,
        };
      } },
    { name: 'Pick the array', icon: '🔲', blurb: 'Match the fact to the picture.', rounds: 6, think: false,
      say: '🔲 Which array shows this fact?',
      round() {
        const r = UI.rint(2, 5), c = UI.rint(3, 7);
        return {
          type: 'choice', prompt: `Which array shows <b>${r} × ${c}</b>?`,
          options: [
            `<div style="transform:scale(.92)">${SCENE3.dots(r, c, { max: 320 })}</div>`,
            `<div style="transform:scale(.92)">${SCENE3.dots(c, r, { max: 320 })}</div>`,
          ],
          answer: `<div style="transform:scale(.92)">${SCENE3.dots(r, c, { max: 320 })}</div>`,
          why: () => `The first number is the rows, so look for ${r} rows. The second number is what sits in one row.`,
          hints: [`Look for ${r} rows.`, `Each row should hold ${c} oranges.`, 'Count the rows before the oranges.'],
          solution: `${r} × ${c} = ${r * c} — ${r} rows of ${c}.`,
        };
      } },
    { name: 'Turnarounds', icon: '🔄', blurb: 'Same total, other fact.', rounds: 6, think: false,
      say: '🔄 Which fact has the same total as this array?',
      round() {
        const r = UI.rint(2, 6), c = UI.rint(2, 7);
        const right = `${c} × ${r}`;
        const wrong = [`${c} + ${r}`, `${r} + ${r}`, `${c} × ${c}`];
        return {
          type: 'choice',
          prompt: G1.art(SCENE3.dots(r, c, { max: 340 }), `${r} rows of ${c}. Which fact has the same total?`),
          options: [right, ...wrong].filter((v, i, a) => a.indexOf(v) === i),
          answer: right,
          why: (v) => /\+/.test(v) ? 'A plus sign adds the two numbers once. The array multiplies them.'
            : `The array is ${r} × ${c}. Turned around it becomes ${c} × ${r} — the same oranges.`,
          hints: [`The array is ${r} × ${c}.`, 'Turn it on its side: what are the rows now?', `Rows become ${c}, row size becomes ${r}.`],
          solution: `${r} × ${c} = ${c} × ${r} = <b>${r * c}</b>.`,
        };
      } },
  ],

  ghubar: ['Arrays? Count the rows, count the oranges, add them.', 'Turning an array changes the total.', 'Rows and columns are the same thing.'],
  praise: ['Array read!', 'Turnaround found!', 'Rows and columns!', 'Terrace counted!'],
  finale: 'The whole terrace counted — rows, columns and turnaround facts! 🟠',
};

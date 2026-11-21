/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 4 · Dune Place · place value to the MILLIONS and comparing seven-digit numbers (4.NBT.A.1–A.2)
   Source: G04-U01-MATH-L02 — القيمة المنزلية حتى الملايين (4.NBT.A.1, 4.NBT.A.2). The نبع/موازي scope
   for Grade 4 Unit 1 runs to the millions, not to 100,000, so the chart and the numbers here go to 7 digits.
   Mechanic = the thinking: level 1 reads a four-column chart with one digit blanked and asks for it, so the
   child must place a digit rather than read the number; level 2 compares two numbers where the first digits
   match, so counting digits is not enough; level 3 is a story about a survey record. `pv-more-digits-wins` and
   `pv-first-digit-only` are the named misconceptions.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g4-dune-place', code: 'G04-MAT-09', title: 'Dune Place', emoji: '🏜️',
  accent: '#b3762a', accentDeep: '#94601f', skyA: '#fff9ee', skyB: '#f7e7c9',
  topic: 'Place value to the millions', band: 'g35', lang: 'en',
  objective: 'I can read and compare numbers to the <b>millions</b> using the value of each <b>place</b>.',
  welcome: 'The survey team records dune heights all the way to the millions. 🏜️',
  learnBlurb: 'Each place is ten times the place to its right.',
  how: {
    what: 'Every column is worth ten times the column on its right. To compare numbers, look at the biggest place first.',
    steps: ['🏜️ Read the columns left to right.', '🏜️ Each place is ten times the next.', '✅ To compare, start at the largest place.'],
  },

  learn: [
    { say: '<b>2,406,718</b> in columns: <b>2</b> millions, <b>4</b> hundred-thousands, <b>0</b> ten-thousands, <b>6</b> thousands, <b>7</b> hundreds, <b>1</b> ten, <b>8</b> ones.',
      draw(el) { el.append(UI.h('div', { html: SCENE4.placeChart4(2406718, { max: 520, caption: 'seven columns, all the way to the millions' }) })); } },
    { say: 'The <b>2</b> is worth <b>2,000,000</b>, not 2. Each place is ten times the one on its right.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE4.placeChart4(2406718, { max: 460, hide: 'millions', caption: 'which digit is missing?' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '2,000,000 + 400,000 + 6,000 + 700 + 10 + 8 = <b>2,406,718</b>' }));
      } },
    { say: 'Your turn: which number has <b>7</b> in the hundred-thousands place?', wait: true,
      draw(el, L) {
        const row = UI.h('div', { class: 'opts' });
        [['1,742,308', true], ['1,470,308', false], ['1,247,308', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 1,742,308 has 7 hundred-thousands, worth 700,000.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Read the columns from the left. Find the hundred-thousands column.', 'bad'))),
        })));
        el.append(row);
      } },
    { say: 'Ghubar says <b>999,999</b> is bigger than <b>1,000,001</b> because 9 is bigger than 1. What is wrong?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Six nines beat a one — nine is bigger than one. Always.', 5200);
        el.append(UI.h('div', { html: SCENE4.placeChart4(1000001, { max: 460, caption: 'count the millions column first' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['1,000,001 has a millions column. 999,999 has none.', true], ['He is right — 9 is bigger than 1.', false], ['They are equal.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — the millions column decides before any digit does.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Count the digits in each number first.', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Missing place', icon: '🏜️', blurb: 'One column is blank.', rounds: 6, think: false,
      say: '🏜️ Which digit belongs in the empty column?',
      round() {
        /* seven digits, so the millions column is in play — the Grade 4 ceiling from the scope */
        const n = UI.rint(1000000, 9999999);
        const digits = String(n).split('').map(Number);
        const idx = UI.rint(0, 6);
        const names = ['millions', 'hundred-thousands', 'ten-thousands', 'thousands', 'hundreds', 'tens', 'ones'];
        return {
          type: 'choice',
          prompt: G1.art(SCENE4.placeChart4(n, { hide: idx, max: 500 }), `The number is ${n.toLocaleString('en-US')}.`),
          options: [String(digits[idx]), String((digits[idx] + 1) % 10), String((digits[idx] + 9) % 10)].filter((v, i, a) => a.indexOf(v) === i),
          answer: String(digits[idx]),
          why: () => 'Say the number aloud and match each digit to its column.',
          hints: [`The number is ${n.toLocaleString('en-US')}.`, 'Start from the left-most column.', `The blank is the ${names[idx]} place.`],
          solution: `In ${n.toLocaleString('en-US')} the ${names[idx]} digit is <b>${digits[idx]}</b>.`,
        };
      } },
    { name: 'Which is greater?', icon: '⚖️', blurb: 'Compare from the largest place.', rounds: 6, think: false,
      say: '⚖️ Which number is greater?',
      round() {
        /* both numbers are seven digits, so the digit COUNT cannot decide and the child must read place by
           place from the left — that is the point of the round */
        const lead = UI.rint(1, 8);
        const hi = lead * 1000000 + UI.rint(100000, 999999);
        const lo = lead * 1000000 + UI.rint(1, 99999);
        /* when the two share their leading digits, place-by-place reading is the only route — the digits count
           and the first digit both fail to decide */
        return {
          type: 'choice', prompt: `<p style="margin:0;font-size:25px;font-weight:900;text-align:center">${lo.toLocaleString('en-US')} &nbsp;?&nbsp; ${hi.toLocaleString('en-US')}</p>`,
          options: ['>', '<', '='],
          answer: '<',
          why: (v) => v === '>' ? 'That reads the numbers left to right as text. Compare the places instead.' : 'Compare the largest place first; if it matches, move one column right.',
          hints: ['Count the digits: five digits beat four.', 'The smaller number is on the left here.', `Compare the ten-thousands first, then the thousands.`],
          solution: `${lo.toLocaleString('en-US')} &lt; ${hi.toLocaleString('en-US')}.`,
        };
      } },
    { name: 'Survey records', icon: '📖', blurb: 'A story about recorded heights.', rounds: 6, think: true,
      say: '📖 Think first: what does each column mean?',
      round(i) {
        const base = 2000000 + (i % 5) * 100000;
        return {
          type: 'number',
          problem: {
            sentences: [`A survey team records a dune as ${(base + 618).toLocaleString('en-US')} millimetres high.`, 'They measure again at the end of the day.', 'They add 100,000 millimetres to the record.', 'What height is recorded now?'],
            question: 3, keys: ['add', 'now'], extras: [1],
          },
          prompt: 'What height is recorded now?', answer: base + 100618, suffix: '',
          why: (v) => v === base + 618 + 1 ? 'Adding one changes the ones column. This adds a hundred thousand.' : 'Adding 100,000 changes the hundred-thousands column only.',
          hints: [`Start at ${(base + 618).toLocaleString('en-US')}.`, '100,000 is one hundred thousand.', 'Only the hundred-thousands digit changes.'],
          solution: `${(base + 618).toLocaleString('en-US')} + 100,000 = <b>${(base + 100618).toLocaleString('en-US')}</b>.`,
        };
      } },
  ],

  ghubar: ['More digits? Bigger number. That is all.', 'Only the first digit matters.', 'Each column is worth the same.'],
  praise: ['Places read!', 'Columns compared!', 'Thousands found!', 'Record updated!'],
  finale: 'Every column in its place — you can read and compare big numbers! 🏜️',
};

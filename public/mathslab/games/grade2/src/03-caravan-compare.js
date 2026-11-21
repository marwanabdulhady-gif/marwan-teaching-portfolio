/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 2 · Caravan Compare · comparing 3-digit numbers with < > = (2.NBT.A.4)
   Mechanic = the thinking: two caravans carry different numbers of water jars and the child places the right
   sign. Level 1 compares a number with a near neighbour (tens vs ones), level 2 has one number hidden inside a
   pack of blocks, level 3 uses measurement lengths so the comparison is not just "biggest digits".
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g2-caravan-compare', code: 'G02-MAT-03', title: 'Caravan Compare', emoji: '🐪',
  accent: '#b4703a', accentDeep: '#8e5528', skyA: '#fdf5ec', skyB: '#f6e4cf',
  topic: 'Comparing to 1,000', band: 'g35', lang: 'en',
  objective: 'I can <b>compare</b> two numbers to 1,000 and use <b>&lt; &gt; =</b> correctly.',
  welcome: 'Two caravans meet on the dunes. Which one carries more water jars? 🐪',
  learnBlurb: 'Compare the hundreds first. If they match, look at the tens.',
  how: {
    what: 'To compare, read the biggest place first. Only move to the next place if the first one matches.',
    steps: ['🐪 Compare the hundreds digit.', '🐪 Same? Compare the tens.', '✅ Then the ones. The open side of the sign faces the bigger number.'],
  },

  learn: [
    { say: 'Caravan A has <b>342</b> jars, Caravan B has <b>324</b>. Which sign belongs between them?',
      draw(el) { el.append(UI.h('div', { html: SCENE2.compareHi(342, 324, { mid: '?' }) })); } },
    { say: 'Both have <b>3</b> hundreds, so look at the tens: <b>4</b> tens beats <b>2</b> tens. So <b>342 &gt; 324</b>.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE2.compareHi(342, 324, { mid: '>' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: 'Hundreds are the same (3 = 3) → compare tens: 4 &gt; 2.' }));
      } },
    { say: 'Your turn: <b>507</b> and <b>570</b>. Which is bigger?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE2.compareHi(507, 570, { mid: '?' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['570', true], ['507', false], ['They are equal', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Yes — same hundreds, but 7 tens beats 0 tens.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '507' ? 'Look at the tens place, not the last digit.' : 'Are the tens the same?', 'bad')),
        })));
        el.append(row);
      } },
    { say: 'Ghubar says <b>507 &gt; 570</b> because 7 is bigger than 5. What should he compare first?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Seven beats five. So 507 wins!', 5000);
        const row = UI.h('div', { class: 'opts' });
        [['The hundreds, then the tens — the last digit is the smallest place.', true], ['The last digit only.', false], ['The number of digits in each number.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Right — the tens place is worth 10× the ones place.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Both numbers have three digits. Which place is worth the most?', 'bad')),
        })));
        el.append(UI.h('div', { html: SCENE2.compareHi(507, 570, { mid: '?' }) }), row);
      } },
  ],

  levels: [
    { name: 'Pick the sign', icon: '🐪', blurb: 'Choose <, > or =.', rounds: 4, think: false,
      say: '🐪 Which sign belongs in the middle?',
      round() {
        const h = UI.rint(1, 9);
        const style = UI.rint(0, 2);
        let a, b;
        if (style === 0) { a = h * 100 + UI.rint(10, 99); b = h * 100 + UI.rint(10, 99); if (a === b) b += 10; }
        else if (style === 1) { a = h * 100 + UI.rint(1, 9) * 10 + UI.rint(0, 9); b = h * 100 + (a % 100) % 10 * 10 + (a % 10); if (a === b) b -= 1; }
        else { a = h * 100 + UI.rint(10, 99); b = a; }
        const key = a > b ? '>' : a < b ? '<' : '=';
        return {
          type: 'choice', prompt: G1.art(SCENE2.compareHi(a, b, { mid: '?' }), `Compare ${a} and ${b}.`),
          options: ['<', '>', '='], answer: key,
          why: (v) => v === '=' && a !== b ? 'Equal means the same value. Are they the same?'
            : v === '>' && a < b ? 'The open side of the sign faces the bigger number.'
            : 'Compare the hundreds first, then the tens.',
          hints: ['Cover the last two digits and compare the hundreds.', `Hundreds: ${Math.floor(a / 100)} and ${Math.floor(b / 100)}.`, 'Only if the hundreds match, compare the tens.'],
          solution: `${a} ${key} ${b}.`,
        };
      } },
    { name: 'Blocks against a number', icon: '🧺', blurb: 'One side is drawn in base-ten blocks.', rounds: 4, think: false,
      say: '🧺 Count the blocks, then compare.',
      round() {
        const h = UI.rint(1, 5), t = UI.rint(0, 9), o = UI.rint(0, 9);
        const blocks = h * 100 + t * 10 + o;
        const other = UI.pick([blocks + UI.rint(1, 20), blocks - UI.rint(1, 20), blocks]);
        return {
          type: 'choice', prompt: G1.art(SCENE2.baseTen(h, t, o, { max: 460, h: 220 }), `Compare the blocks with ${other}.`),
          options: ['<', '>', '='], answer: blocks > other ? '>' : blocks < other ? '<' : '=',
          why: () => `Count the blocks by place: ${h} hundreds, ${t} tens, ${o} ones.`,
          hints: [`The blocks show ${h} hundreds, ${t} tens, ${o} ones.`, 'Write that as one number first.', `Then compare it with ${other}.`],
          solution: `The blocks show ${blocks}, and ${blocks} ${blocks > other ? '>' : blocks < other ? '<' : '='} ${other}.`,
        };
      } },
    { name: 'Caravan measures', icon: '📏', blurb: 'Compare lengths in centimetres.', rounds: 4, think: true,
      say: '📏 Think first: read both lengths.',
      round(i) {
        const a = 120 + i * 47, b = a + (i % 2 ? -1 : 1) * (5 + i * 3);
        return {
          type: 'choice',
          problem: {
            sentences: [`Caravan A's banner is ${a} cm long.`, 'The banners are made of wool.', `Caravan B's banner is ${b} cm long.`, 'Which banner is longer?'],
            question: 3, keys: ['longer'], extras: [1],
          },
          prompt: `Which is longer: ${a} cm or ${b} cm?`,
          options: [`${a} cm`, `${b} cm`, 'They are the same'], answer: a > b ? `${a} cm` : `${b} cm`,
          why: () => 'Compare the hundreds first, then the tens.',
          hints: ['Both are more than 100 cm.', 'Compare the hundreds digit.', 'If the hundreds match, compare the tens.'],
          solution: `${Math.max(a, b)} cm is longer — ${a} ${a > b ? '>' : a < b ? '<' : '='} ${b}.`,
        };
      } },
  ],

  ghubar: ['The last digit is the biggest digit. Trust it.', 'Equal hundreds means equal numbers.', 'I compare by looking at the shape of the digits.'],
  praise: ['Sign placed right!', 'Biggest place first!', 'Tens decided it!', 'Caravan order correct!'],
  finale: 'Both caravans counted — you can compare any number to 1,000! 🐪',
};

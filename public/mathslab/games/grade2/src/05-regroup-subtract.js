/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 2 · Lantern Borrow · subtracting within 100 with regrouping (2.NBT.B.5)
   Mechanic = the thinking: the child must decide WHEN borrowing is allowed. Level 1 shows the minuend in
   blocks so the trade is visible; level 2 asks for the borrowed ten as its own step; level 3 is a lantern
   story. `pv-borrow` (subtract the smaller digit from the bigger one) is the misconception the why-lines hit.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g2-regroup-subtract', code: 'G02-MAT-05', title: 'Lantern Borrow', emoji: '🏮',
  accent: '#bf4a5c', accentDeep: '#96323f', skyA: '#fff3f4', skyB: '#fadfe3',
  topic: 'Subtraction within 100', band: 'g35', lang: 'en',
  objective: 'I can <b>subtract within 100</b> and <b>trade a ten for ten ones</b> when I need them.',
  welcome: 'The lantern festival needs repairs. Some lanterns are broken. 🏮',
  learnBlurb: 'If the ones are too small, break a ten into ten ones.',
  how: {
    what: 'When the top ones are smaller than the ones you take away, open one ten into ten ones.',
    steps: ['🏮 Try the ones column.', '🔄 Not enough ones? Trade one ten for ten ones.', '✅ Then subtract the ones and the tens.'],
  },

  learn: [
    { say: 'There are <b>52</b> lanterns and <b>27</b> need repairs. How many stay lit?',
      draw(el) { el.append(UI.h('div', { html: SCENE2.baseTen(0, 5, 2, { h: 200 }) })); } },
    { say: 'Ones: <b>2 − 7</b>? Not enough. Trade one ten for ten ones: <b>12 − 7 = 5</b>. Tens: <b>4 − 2 = 2</b>. Answer <b>25</b>.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE2.baseTen(0, 4, 12, { h: 200 }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '52 → 4 tens and 12 ones → 12 − 7 = 5, 4 − 2 = 2.' }));
      } },
    { say: 'Your turn: <b>63 − 28</b>. Do you need to borrow?', wait: true,
      draw(el, L) {
        const row = UI.h('div', { class: 'opts' });
        [['Yes — 3 ones is less than 8.', true], ['No — just subtract 3 from 8.', false], ['No — swap the digits instead.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Right — trade one ten so the ones become 13.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Can you take 8 ones from 3 ones?', 'bad')),
        })));
        el.append(UI.h('div', { html: SCENE2.baseTen(0, 6, 3, { max: 460 }) }), row);
      } },
    { say: 'Ghubar says <b>63 − 28 = 45</b> because 8 − 3 = 5 and 6 − 2 = 4. What did he do?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Big digit minus small digit, always. 63 − 28 = 45!', 5200);
        const row = UI.h('div', { class: 'opts' });
        [['He subtracted the smaller digit from the bigger one in the ones column.', true], ['He forgot to subtract the tens.', false], ['Nothing — 45 is correct.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Exactly — you may not swipe the digits. Trade a ten instead.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('You always subtract what you take away from what you have.', 'bad')),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Trade the ten', icon: '🏮', blurb: 'Blocks show what you have.', rounds: 4, think: false,
      say: '🏮 How many lanterns are left?',
      round() {
        const a = UI.rint(31, 92), b = UI.rint(13, a % 10 === 0 ? 19 : 29);
        const ta = Math.floor(a / 10), oa = a % 10;
        return {
          type: 'number', prompt: G1.art(SCENE2.baseTen(0, ta, oa, { h: 190 }), `${a} lanterns, ${b} broken.`),
          answer: a - b, suffix: '',
          why: (v) => v === a + b ? 'Broken ones are taken away — subtract.' : Math.abs(v) === Math.abs(oa - (b % 10)) + (ta - Math.floor(b / 10)) * 10 && a - b !== v ? 'You swapped the digits in the ones column. Trade a ten instead.' : 'Trade a ten if the ones are too small, then subtract.',
          hints: [`Ones: ${oa} − ${b % 10}.`, oa < b % 10 ? 'Not enough ones — trade one ten for ten ones.' : 'The ones are fine here.', `Tens: ${ta} − ${Math.floor(b / 10)}.`],
          solution: `${a} − ${b} = <b>${a - b}</b>.`,
        };
      } },
    { name: 'The borrowed ten', icon: '🔄', blurb: 'Name the trade before you answer.', rounds: 4, think: false,
      say: '🔄 Which trade makes this subtraction possible?',
      round() {
        const a = UI.rint(41, 95), b = UI.rint(16, 39);
        const needs = a % 10 < b % 10;
        return {
          type: 'choice', prompt: `${a} − ${b}`,
          options: needs ? ['Trade 1 ten for 10 ones', 'No trade needed', 'Trade 10 tens for 1 one'] : ['No trade needed', 'Trade 1 ten for 10 ones', 'Trade 1 one for 10 tens'],
          answer: needs ? 'Trade 1 ten for 10 ones' : 'No trade needed',
          why: (v) => v === 'Trade 10 tens for 1 one' ? 'That trade goes the wrong way — a ten is bigger than a one.'
            : 'Look at the ones column only: can you subtract there?',
          hints: [`${a} has ${a % 10} ones.`, `${b} takes away ${b % 10} ones.`, `${a % 10} − ${b % 10}: possible or not?`],
          solution: `${a % 10} ${needs ? '<' : '≥'} ${b % 10}, so ${needs ? 'trade one ten for ten ones first' : 'no trade is needed'}. ${a} − ${b} = <b>${a - b}</b>.`,
        };
      } },
    { name: 'Festival stories', icon: '📖', blurb: 'A story, then subtract.', rounds: 4, think: true,
      say: '📖 Think first: what is taken away?',
      round(i) {
        const a = 70 + i * 6, b = 23 + i * 5;
        return {
          type: 'number',
          problem: {
            sentences: [`The souq hangs ${a} lanterns.`, 'The lanterns are red and gold.', `${b} lanterns are taken down.`, 'How many lanterns stay up?'],
            question: 3, keys: ['stay', 'how many'], extras: [1],
          },
          prompt: 'How many lanterns stay up?', answer: a - b, suffix: '',
          why: (v) => v === a + b ? 'Taken down means they leave — subtract.' : 'Trade a ten if the ones are too small.',
          hints: [`Start with ${a}.`, `Take away ${b}.`, 'Check the ones column — do you need to borrow?'],
          solution: `${a} − ${b} = <b>${a - b}</b> lanterns stay up.`,
        };
      } },
  ],

  ghubar: ['Small from big — the order is a suggestion.', 'Borrowing is stealing. I never borrow.', 'If it does not fit, swap the digits.'],
  praise: ['Traded and correct!', 'Borrowed just once!', 'Ones first, then tens!', 'Festival counted!'],
  finale: 'Every lantern accounted for — you can subtract within 100! 🏮',
};

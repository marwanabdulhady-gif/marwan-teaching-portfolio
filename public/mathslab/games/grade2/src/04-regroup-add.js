/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 2 · Regrouping Depot · adding within 100 with regrouping (2.NBT.B.5)
   Mechanic = the thinking: level 1 shows base-ten blocks for both addends, so the child sees ten ones must
   become one tray; level 2 is the bare vertical sum where the child must predict the regroup; level 3 adds
   riyals in a shop story. The engine's `bars` round is used in level 2 to show the two parts and the total.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const BAR_A = '#ffd23f', BAR_B = '#7bdff2';

const GAME = {
  id: 'g2-regroup-add', code: 'G02-MAT-04', title: 'Regrouping Depot', emoji: '🧱',
  accent: '#2f7d5c', accentDeep: '#215f45', skyA: '#f0faf5', skyB: '#d8efe4',
  topic: 'Addition within 100', band: 'g35', lang: 'en',
  objective: 'I can <b>add within 100</b> and <b>regroup ten ones into one ten</b>.',
  welcome: 'The depot stacks crates in tens. Ten loose crates make a new stack. 🧱',
  learnBlurb: 'Add the ones. Ten ones become one more ten.',
  how: {
    what: 'When the ones add to 10 or more, trade ten ones for one ten and carry it.',
    steps: ['🧱 Add the ones column.', '🔄 Ten ones = one ten. Carry it.', '✅ Add the tens, then write the total.'],
  },

  learn: [
    { say: 'The depot has <b>28</b> crates and <b>15</b> more arrive. How many now?',
      draw(el) { el.append(UI.h('div', { html: SCENE2.baseTen(0, 2, 8, { h: 200 }) }), UI.h('div', { html: SCENE2.baseTen(0, 1, 5, { h: 200 }) })); } },
    { say: 'Ones: <b>8 + 5 = 13</b>. That is one ten and 3 ones, so carry the ten. Tens: <b>2 + 1 + 1 = 4</b>. Total <b>43</b>.',
      draw(el) {
        el.append(UI.bars({ rows: [{ letter: 'A', label: 'crates', n: 1, each: 28, color: BAR_A }, { letter: 'B', label: 'arrived', n: 1, each: 15, color: BAR_B }], final: { kind: 'sum', letter: 'T' } }, { reveal: true, answer: 43 }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '8 + 5 = 13 → write 3, carry 1 ten. 2 + 1 + 1 = <b>4</b> tens.' }));
      } },
    { say: 'Your turn: <b>47 + 36</b>. Add the ones first.', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE2.baseTen(0, 4, 7, { h: 190 }) }));
        const row = UI.h('div', { class: 'opts' });
        [83, 73, 713].forEach((v) => row.append(UI.h('button', {
          class: 'opt', text: String(v),
          onclick: (e) => v === 83 ? (e.target.classList.add('good'), L.ok('Yes — 7 + 6 = 13, carry 1; 4 + 3 + 1 = 8 tens, so 83.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(v === 73 ? 'You forgot to carry the ten from 7 + 6 = 13.' : '13 is 1 ten and 3 ones — it does not make a new column.', 'bad')),
        })));
        el.append(row);
      } },
    { say: 'Ghubar wrote <b>47 + 36 = 713</b>. What did he do with the 13 ones?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Seven plus six is thirteen, so write 13. Seven hundred and thirteen!', 5200);
        const row = UI.h('div', { class: 'opts' });
        [['He wrote 13 as its own column instead of carrying one ten.', true], ['He added the tens twice.', false], ['Nothing — 713 is correct.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Right — 13 ones is 1 ten + 3 ones. The ten moves to the tens column.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('A column holds one digit. Where does the extra ten go?', 'bad')),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Crates in the depot', icon: '🧱', blurb: 'Blocks show both addends.', rounds: 4, think: false,
      say: '🧱 How many crates altogether?',
      round() {
        const a = UI.rint(13, 49), b = UI.rint(11, 49);
        const ta = Math.floor(a / 10), oa = a % 10, tb = Math.floor(b / 10), ob = b % 10;
        return {
          /* both addends side by side in one row of two, so the keypad is never pushed off the stage */
          type: 'number', prompt: G1.art(
            `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start">${SCENE2.baseTen(0, ta, oa, { h: 165, max: 300 })}${SCENE2.baseTen(0, tb, ob, { h: 165, max: 300 })}</div>`,
            `${a} crates and ${b} more.`),
          answer: a + b, suffix: '',
          why: (v) => v === a + b - 10 ? 'You forgot the carried ten.' : String(v).length !== 2 ? 'The total is under 100 — one digit in each column.' : 'Add the ones, carry a ten if you made one, then the tens.',
          hints: [`Ones: ${oa} + ${ob}.`, oa + ob >= 10 ? `That is ${oa + ob} — carry one ten.` : 'No carry needed here.', `Tens: ${ta} + ${tb} plus any carry.`],
          solution: `${a} + ${b} = <b>${a + b}</b>.`,
        };
      } },
    { name: 'Bars and a carry', icon: '📊', blurb: 'The bars show the parts; predict the carry.', rounds: 4, think: false,
      say: '📊 Add the two bars.',
      round() {
        const a = UI.rint(15, 48), b = UI.rint(16, 48);
        return {
          type: 'bars',
          model: { rows: [{ letter: 'A', label: 'first load', n: 1, each: a, color: BAR_A }, { letter: 'B', label: 'second load', n: 1, each: b, color: BAR_B }], final: { kind: 'sum', letter: 'T' } },
          answer: a + b, suffix: '',
          why: (v) => v === a + b - 10 ? 'One ten was carried and never added.' : v === Math.abs(a - b) ? 'This is joining — add, do not subtract.' : 'A and B joined make T.',
          hints: [`A = ${a}, B = ${b}.`, `Ones: ${a % 10} + ${b % 10}.`, 'Carry a ten if the ones pass 9.'],
          solution: `T = ${a} + ${b} = <b>${a + b}</b>.`,
        };
      } },
    { name: 'Depot money', icon: '💵', blurb: 'Two purchases, one receipt.', rounds: 4, think: true,
      say: '💵 Think first: what is being asked?',
      round(i) {
        const a = 24 + i * 7, b = 19 + i * 4;
        return {
          type: 'number',
          problem: {
            sentences: [`Noor buys wool for ${a} riyals.`, 'The shop has a green door.', `She buys dye for ${b} riyals.`, 'How much does she spend?'],
            question: 3, keys: ['how much', 'spend'], extras: [1],
          },
          prompt: `How much does Noor spend in all?`, answer: a + b, suffix: ' riyals',
          why: (v) => v === a + b - 10 ? 'Keep the carried ten.' : v === a - b ? 'Spending both means adding.' : 'Add both amounts.',
          hints: [`Wool costs ${a}, dye costs ${b}.`, `Ones: ${a % 10} + ${b % 10}.`, `${a} + ${b} = ?`],
          solution: `${a} + ${b} = <b>${a + b}</b> riyals.`,
        };
      } },
  ],

  ghubar: ['Carry? I have no pockets.', 'Thirteen ones — just write 13 and move on.', 'Adding is joining, but subtracting is faster.'],
  praise: ['Carried and correct!', 'Ten ones, one ten!', 'Not a digit lost!', 'Depot total right!'],
  finale: 'Every carry counted — you can add within 100! 🧱',
};

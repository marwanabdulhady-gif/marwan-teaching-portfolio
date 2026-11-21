/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 2 · Date-Shop Packing · building a 3-digit number from hundreds, tens and ones (2.NBT.A.1)
   Mechanic = the thinking: level 1 packs a written order (how many boxes · trays · singles) into base-ten
   blocks and names the number; level 2 is the reverse — blocks are drawn unnumbered and the child writes the
   number; level 3 shows a place-value chart with one empty column. No level can be won without predicting
   which place a digit lands in, and packing to 1,000 is why the misconception is `pv-concat` (345 → 300405).
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g2-date-packing', code: 'G02-MAT-01', title: 'Date-Shop Packing', emoji: '📦',
  accent: '#0f8394', accentDeep: '#0a6a78', skyA: '#effbfd', skyB: '#d5f0f5',
  topic: 'Place value to 1,000', band: 'g35', lang: 'en',
  objective: 'I can build a number to <b>1,000</b> from <b>hundreds, tens and ones</b> and write it in digits.',
  welcome: 'Orders are coming in at the Al-Qassim date shop. Pack three hundred and forty-five dates. 📦',
  learnBlurb: 'Boxes hold 100, trays hold 10, singles are 1. Read the places.',
  how: {
    what: 'A big number is packs of 100, packs of 10 and single dates. Each place holds one digit.',
    steps: ['📦 One box = 100 dates.', '🧺 One tray = 10 dates.', '✅ Boxes, then trays, then singles: 345 is 3 · 4 · 5.'],
  },

  learn: [
    { say: 'The date shop packs orders in boxes of <b>100</b>, trays of <b>10</b>, and single dates. Which order is this?',
      draw(el) { el.append(UI.h('div', { html: SCENE2.baseTen(3, 4, 5, { h: 230 }) })); } },
    { say: 'Read the groups in order: <b>3</b> hundreds, <b>4</b> tens, <b>5</b> ones. That is <b>345</b>. One digit for each place.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE2.baseTen(3, 4, 5, { h: 200, k: 0.85 }) }));
        el.append(UI.h('div', { html: SCENE2.placeChart(3, 4, 5, { max: 420 }) }));
      } },
    { say: 'Your turn: <b>2</b> hundreds, <b>7</b> tens, <b>0</b> ones. Which number is that?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE2.baseTen(2, 7, 0, { max: 500 }) }));
        const row = UI.h('div', { class: 'opts' });
        [270, 207, 27].forEach((v) => row.append(UI.h('button', {
          class: 'opt', text: String(v),
          onclick: (e) => v === 270 ? (e.target.classList.add('good'), L.ok('Yes — 2 hundreds, 7 tens, 0 ones = <b>270</b>. The zero holds the ones place.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(v === 27 ? 'There are 7 tens, so 27 is too small.' : 'A zero in the ones place still needs a place: 270, not 207.', 'bad')),
        })));
        el.append(row);
      } },
    { say: 'Ghubar wrote <b>300405</b> for three hundred and forty-five. What went wrong?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Three hundred and forty-five: 300, then 40, then 5. So 300405!', 5200);
        const row = UI.h('div', { class: 'opts' });
        [['He used one place for all three digits — each place is a single digit.', true], ['He used the wrong order for the tens.', false], ['Nothing — 300405 is 345.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Right — 3 hundreds, 4 tens, 5 ones is written <b>345</b>.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Count the columns on the chart. One digit stands in each.', 'bad')),
        })));
        el.append(UI.h('div', { html: SCENE2.placeChart(3, 4, 5, { max: 420 }) }), row);
      } },
  ],

  levels: [
    { name: 'Pack the order', icon: '📦', blurb: 'Read the packs and write the number.', rounds: 4, think: false,
      say: '📦 How many dates are packed here?',
      round() {
        const h = UI.rint(1, 4), t = UI.rint(0, 9), o = UI.rint(0, 9);
        const n = h * 100 + t * 10 + o;
        const pool = [h * 100 + o * 10 + t, h * 10 + t * 10 + o, h * 100 + t + o].filter((v) => v !== n);
        return {
          type: 'number', prompt: G1.art(SCENE2.baseTen(h, t, o, { max: 560 }), `${h} hundreds, ${t} tens, ${o} ones.`),
          answer: n, suffix: '',
          why: (v) => v === h * 100 + o * 10 + t ? 'Tens and ones are swapped. Tens stand in the middle place.'
            : String(v) === `${h}${t}${o}` && String(n).length < 3 ? 'That writes each group after the next — read the places instead.'
            : v === h * 1000 + t * 100 + o * 10 ? 'One place too far: a box is 100, so 3 boxes are 300.'
            : 'Say the places in order: hundreds, tens, ones.',
          hints: ['Start with the hundreds: how many boxes?', `Tens next: ${t} trays is ${t * 10}.`, `Then the ones. The number has three digits.`],
          solution: `${h} hundreds + ${t} tens + ${o} ones = <b>${n}</b>.`,
        };
      } },
    { name: 'Read the blocks', icon: '🧺', blurb: 'Blocks are not numbered — count the places.', rounds: 4, think: false,
      say: '🧺 Count the group that holds 100 first.',
      round() {
        const h = UI.rint(1, 5), t = UI.rint(0, 9), o = UI.rint(0, 9), n = h * 100 + t * 10 + o;
        return {
          type: 'choice', prompt: G1.art(SCENE2.baseTen(h, t, o, { max: 540 }), 'Boxes of 100, trays of 10, single dates.'),
          options: [String(n), String(h * 100 + o * 10 + t), String(h * 100 + t + o), String(h * 10 + t + o)].filter((v, i, a) => a.indexOf(v) === i),
          answer: String(n),
          why: (v) => +v === h * 100 + o * 10 + t ? 'The tens and the ones are swapped here.'
            : +v === h * 100 + t + o ? 'That counts trays as 1 each. A tray holds 10.'
            : +v === h * 10 + t + o ? 'That counts a box as 10. A box holds 100.' : 'Which group is hundreds?',
          hints: ['Count the big squares — each is 100.', 'Each tray is 10, so trays give the middle digit.', 'A single date is one.'],
          solution: `${h} × 100 + ${t} × 10 + ${o} = <b>${n}</b>.`,
        };
      } },
    { name: 'The missing place', icon: '🧩', blurb: 'One column is empty — find its digit.', rounds: 4, think: false,
      say: '🧩 Which digit belongs in the empty column?',
      round() {
        const n = UI.rint(102, 989);
        const h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), o = n % 10;
        const hide = UI.pick(['h', 't', 'o']);
        const val = { h, t, o }[hide];
        const off = UI.pick([(val + 1) % 10, (val + 9) % 10, (val + 2) % 10].filter((v) => v !== val));
        return {
          type: 'choice', prompt: G1.art(SCENE2.placeChart(hide === 'h' ? null : h, hide === 't' ? null : t, hide === 'o' ? null : o, { max: 460 }), `The number is ${n}.`),
          options: [String(val), String(off), String(n % 10 === val ? t : h)].filter((v, i, a) => a.indexOf(v) === i),
          answer: String(val),
          why: (v) => 'Read the number aloud: which digit sits in that column?',
          hints: [`The number is ${n}.`, `Say it: ${h} hundred${h === 1 ? '' : 's'}, ${t} ten${t === 1 ? '' : 's'}, ${o} one${o === 1 ? '' : 's'}.`, 'Each digit belongs to exactly one column.'],
          solution: `${n} has ${h} in the hundreds, ${t} in the tens, ${o} in the ones. The missing digit is <b>${val}</b>.`,
        };
      } },
  ],

  ghubar: ['Three hundred forty-five? 300405. Easy!', 'Zeros are nothing, so I leave them out.', 'Tens, ones — the order is a detail.'],
  praise: ['Packed in the right places!', 'Every digit in its column!', 'That is place value!', 'Three digits, three places!'],
  finale: 'Order packed — hundreds, tens and ones all in place! 📦',
};

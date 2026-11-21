/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 2 · Expanded-Form Workshop · writing a 3-digit number in expanded form (2.NBT.A.1 / 2.NBT.A.3)
   Mechanic = the thinking: the child must decide what each digit is WORTH, not what it says (`pv-swap`,
   `pv-zero`). Level 1 picks the expanded form of a number, level 2 fills one missing addend, level 3 builds
   the number back from an expanded form whose zero part is hidden — a zero place contributes nothing.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g2-expanded-form', code: 'G02-MAT-02', title: 'Expanded-Form Workshop', emoji: '🧾',
  accent: '#6b4bc0', accentDeep: '#523a96', skyA: '#f5f2ff', skyB: '#e3dcfb',
  topic: 'Expanded form to 1,000', band: 'g35', lang: 'en',
  objective: 'I can write a number to <b>1,000</b> in <b>expanded form</b> — what each digit is worth.',
  welcome: 'The workshop prints receipts that show what each digit is worth. 🧾',
  learnBlurb: 'A 4 in the tens place is worth 40, not 4.',
  how: {
    what: 'Expanded form splits a number into the value of each place: 345 = 300 + 40 + 5.',
    steps: ['🧾 Find the hundreds: 3 hundreds is 300.', '🧾 Find the tens: 4 tens is 40.', '✅ Add the ones. 300 + 40 + 5.'],
  },

  learn: [
    { say: 'This receipt says <b>300 + 40 + 5</b>. Which number was bought?',
      draw(el) {
        el.append(UI.h('div', { html: SCENE2.placeChart(3, 4, 5, { max: 440 }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:20px', html: '300 + 40 + 5 = <b>?</b>' }));
      } },
    { say: 'Each digit carries its place value: <b>3</b> hundreds = 300, <b>4</b> tens = 40, <b>5</b> ones = 5. So 345.',
      draw(el) {
        const rows = [['3', 'hundreds', '300'], ['4', 'tens', '40'], ['5', 'ones', '5']];
        const box = UI.h('div', { style: 'display:grid;gap:8px;max-width:420px;margin:0 auto' });
        rows.forEach(([d, place, val]) => box.append(UI.h('div', {
          class: 'opt', style: 'display:flex;justify-content:space-between;align-items:center;cursor:default',
          html: `<span style="font-size:26px">${d}</span><span style="font-size:15px;color:#6b5a3a">in the ${place}</span><span style="font-size:24px;font-weight:900">${val}</span>`,
        })));
        el.append(box);
      } },
    { say: 'Your turn: which expanded form matches <b>506</b>?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE2.placeChart(5, 0, 6, { max: 420 }) }));
        const row = UI.h('div', { class: 'opts' });
        ['500 + 6', '500 + 60', '50 + 6'].forEach((t) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => t === '500 + 6' ? (e.target.classList.add('good'), L.ok('Yes — the tens place is zero, so it adds nothing.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '500 + 60' ? 'A 0 in the tens place is worth 0, not 60.' : 'Where does the 6 sit? That is the ones place.', 'bad')),
        })));
        el.append(row);
      } },
    { say: 'Ghubar says <b>506 = 50 + 6</b>. Which digit is he reading wrongly?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Five and six, so fifty plus six. Done!', 5000);
        const row = UI.h('div', { class: 'opts' });
        [['The 5 — it is in the hundreds place, so it is worth 500.', true], ['The 6 — it is worth 60.', false], ['Neither — 50 + 6 is 56 and that is 506.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Right — 5 hundreds is 500, and the empty tens place is 0.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Use the chart: read each column by name.', 'bad')),
        })));
        el.append(UI.h('div', { html: SCENE2.placeChart(5, 0, 6, { max: 420 }) }), row);
      } },
  ],

  levels: [
    { name: 'Which receipt?', icon: '🧾', blurb: 'Match the number to its expanded form.', rounds: 4, think: false,
      say: '🧾 Which sum shows this number?',
      round() {
        const n = UI.rint(101, 999);
        const h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), o = n % 10;
        const forms = [
          [h * 100, t * 10, o],
          [h * 100, o * 10, t],
          [h * 10, t * 10, o],
          [h * 100, t, o],
        ].map((p) => p.filter((v) => v !== 0).join(' + '));
        const key = forms[0];
        const opts = [...new Set(forms)].filter((f) => f !== key).slice(0, 3);
        return {
          type: 'choice', prompt: G1.art(SCENE2.placeChart(h, t, o, { max: 430 }), `Write ${n} in expanded form.`),
          options: UI.shuffle([key, ...opts]).map(String), answer: key,
          why: (v) => {
            const got = String(v);
            if (got === `${t * 10} + ${o}` || got === `${t * 10}${o ? ' + ' + o : ''}`) return 'That leaves out the hundreds entirely.';
            if (got === `${h} + ${t} + ${o}`) return 'That is the digit, not what it is worth. Each place is 10× bigger.';
            return 'Check each place: hundreds, tens, ones.';
          },
          hints: [`The hundreds digit is ${h} — that is worth ${h * 100}.`, `The tens digit is ${t} — that is worth ${t * 10}.`, 'A zero place is left out of the sum.'],
          solution: `${n} = <b>${key}</b>.`,
        };
      } },
    { name: 'Fill the gap', icon: '➕', blurb: 'One addend is missing.', rounds: 4, think: false,
      say: '➕ What is the missing part?',
      round() {
        const n = UI.rint(110, 999);
        const h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), o = n % 10;
        const parts = [[h * 100, 'h'], [t * 10, 't'], [o, 'o']].filter(([v]) => v !== 0);
        const hide = UI.pick(parts);
        const missing = hide[0];
        const shown = parts.filter((p) => p !== hide).map((p) => p[0]);
        const sum = shown.reduce((a, b) => a + b, 0);
        return {
          type: 'choice', prompt: `${n} = ${shown.join(' + ')}${shown.length ? ' + ' : ''}<b>?</b>`,
          options: UI.shuffle([String(missing), String(missing * 10), String(missing / 10 || 1), String(sum)]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
          answer: String(missing),
          why: (v) => +v === sum ? 'That is the part already shown, not the missing one.'
            : +v === missing * 10 ? 'Ten times too big — check which place it stands in.'
            : 'What is that digit worth in its place?',
          hints: [`You can see ${shown.join(' + ') || 'nothing'} — the whole number is ${n}.`, `The missing place is the ${hide[1] === 'h' ? 'hundreds' : hide[1] === 't' ? 'tens' : 'ones'}.`, 'Subtract what you see from the whole number.'],
          solution: `${n} = ${shown.length ? shown.join(' + ') + ' + ' : ''}<b>${missing}</b>.`,
        };
      } },
    { name: 'Build it back', icon: '🧱', blurb: 'A zero place adds nothing.', rounds: 4, think: true,
      say: '🧱 Think first: which place is empty?',
      round(i) {
        const h = UI.rint(1, 9), t = [0, 0, UI.rint(1, 9)][i % 3], o = UI.rint(0, 9);
        const n = h * 100 + t * 10 + o;
        const parts = [h * 100, t * 10, o].filter((v) => v !== 0);
        return {
          type: 'number',
          problem: {
            sentences: [`The workshop receipt reads ${parts.join(' + ')}.`, 'The printer is out of paper.', 'How many items were bought?'],
            question: 2, keys: ['how many'], extras: [1],
          },
          prompt: `Add the parts: ${parts.join(' + ')}.`, answer: n, suffix: '',
          why: (v) => String(v) === `${h}${t}${o}` && t === 0 ? 'A missing tens place still holds a zero: 605, not 65.' : 'Add the parts by place.',
          hints: ['Add the hundreds first.', `Then the tens and ones.`, `${parts.join(' + ')} = ?`],
          solution: `${parts.join(' + ')} = <b>${n}</b>${t === 0 ? ' — the empty tens place is a 0.' : '.'}`,
        };
      } },
  ],

  ghubar: ['Expanded form? Just delete the plus signs.', 'A zero is nothing, so 605 is 65.', 'Tens are worth 1 each, like ones.'],
  praise: ['Place value perfect!', 'Every part in its place!', 'You saw the zero place!', 'Expanded and correct!'],
  finale: 'Receipts printed — you can write any number in expanded form! 🧾',
};

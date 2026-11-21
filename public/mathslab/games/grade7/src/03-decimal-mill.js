/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 7 · Decimal Mill · a rational number written as a decimal by long division, and subtraction of
   signed rationals through the rule p − q = p + (−q)
   Source: G07-U01-MATH-L02 (CCSS 7.NS.A.1–3), term 1 — العمليات على الأعداد النسبية: الجمع والطرح وضرب
   وقسمة الأعداد النسبية، وتحويل الكسور إلى أعداد عشرية منتهية أو دورية.

   SCOPE — this document restates the signed-line lesson (game 02) and then goes further into the
   arithmetic itself: the subtraction rule applied to rationals in fraction form, and long division that
   ends or repeats (7.NS.A.2d). Game 02 owns the number line and the zero pair, so this game never redraws
   a hop; it works on the NUMBERS. Recorded in docs/mowazi/g7-expansion.md.

   Mechanic = the thinking: divide the denominator into the numerator until the remainder is zero (it
   terminates) or until a remainder repeats (it does not). The picture shows the two fractions; the
   decimal is never printed.
   Named misconceptions: «every fraction is a repeating decimal», «7/8 = 0.78», «p − q = q − p because
   subtraction is tidy».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g7-decimal-mill', code: 'G07-U01-MATH-L02', title: 'Decimal Mill', emoji: '⚙️',
  accent: '#4c5a4a', accentDeep: '#3a463a', skyA: '#f6f8f4', skyB: '#e1e8dc',
  topic: 'Rational numbers as decimals, and signed subtraction', band: 'g68', lang: 'en',
  objective: 'I can write a rational number as a <b>terminating or repeating</b> decimal, and subtract signed rationals with <b>p − q = p + (−q)</b>.',
  welcome: 'A mill grinds fractions into decimals. The crank stops when the remainder runs out — or never. ⚙️',
  learnBlurb: 'Long division either reaches remainder 0 or starts repeating a remainder.',
  how: {
    what: 'To write a fraction as a decimal, divide the numerator by the denominator. If a remainder becomes 0 the decimal terminates; if a remainder comes back, the digits repeat. To subtract, add the opposite: p − q = p + (−q).',
    steps: ['⚙️ Divide, writing a decimal point and zeros after the numerator.', 'Watch the remainders: 0 stops the mill, a repeat never stops it.', '✅ For subtraction, flip the sign of the second number and add.'],
  },

  learn: [
    { say: 'Divide 3 by 8: 30 ÷ 8 = 3 remainder 6, 60 ÷ 8 = 7 remainder 4, 40 ÷ 8 = 5 remainder 0. So 3/8 = <b>0.375</b> — it terminates.',
      draw(el) { el.append(UI.h('div', { html: SCENE7.tablePairs(['3/8', 'rem 6', 'rem 4', 'rem 0'], ['0.', '3', '7', '5'], { rowA: 'step', rowB: 'digit', caption: 'the remainder reaches 0, so the mill stops' }) })); } },
    { say: 'Now divide 1 by 3: 10 ÷ 3 = 3 remainder 1 — and the remainder 1 is where we started, so the 3 repeats for ever: 1/3 = <b>0.333…</b>',
      draw(el) { el.append(UI.h('div', { html: SCENE7.tablePairs(['1/3', 'rem 1', 'rem 1', 'rem 1'], ['0.', '3', '3', '3'], { rowA: 'step', rowB: 'digit', caption: 'the remainder returns, so the digit repeats' }) })); } },
    { say: 'Subtraction of rationals is addition of the opposite: 3/4 − 1/2 = 3/4 + (−1/2) = <b>1/4</b> = 0.25.',
      draw(el) { el.append(UI.h('div', { html: SCENE7.tablePairs(['3/4', '−1/2', '= 1/4'], ['0.75', '−0.5', '0.25'], { rowA: 'fraction', rowB: 'decimal', caption: 'p − q = p + (−q)' }) })); } },
    { say: 'Your turn. Which of these fractions gives a <b>terminating</b> decimal?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE7.tablePairs(['1/3', '7/8', '5/6'], ['?', '?', '?'], { rowA: 'fraction', rowB: 'decimal', caption: 'try the long division for each' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['7/8', true], ['1/3', false], ['5/6', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 7/8 = 0.875, and the remainder reaches 0.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Divide it out: if a remainder comes back, it never stops.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says <b>7/8 = 0.78</b>, “because 7 and 8”. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Seven and eight, so nought point seven eight.', 5200);
        el.append(UI.h('div', { html: SCENE7.tablePairs(['7/8', 'rem 6', 'rem 4', 'rem 0'], ['0.', '8', '7', '5'], { rowA: 'step', rowB: 'digit', caption: 'read the digits off the division' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — the division gives 0.875.', true], ['He is right — it is 0.78.', false], ['It is 0.875… repeating for ever.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. The digits come from the remainders, not from the numbers written down.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('The remainder reached 0, so nothing repeats.', 'bad'))),
        }))); el.append(row);
      } },
  ],

  fixOpts(q) {
    if (!q || !q.options || q.type === 'order' || q.type === 'bars') return q;
    const ans = String(q.answer);
    const seen = new Set();
    let kept = false;
    q.options = q.options.map((o) => {
      let s = String(o);
      if (s === ans && !kept) { kept = true; seen.add(s); return o; }
      if (!seen.has(s)) { seen.add(s); return o; }
      const num = s.match(/-?\d+(?:\.\d+)?/);
      if (num) {
        const v = Number(num[0]);
        const alt = [v + 0.1, v - 0.1, v + 1, v + 0.05].find((c) => {
          const cand = s.replace(num[0], String(Number(c.toFixed(4))));
          return !seen.has(cand) && cand !== ans;
        });
        if (alt != null) s = s.replace(num[0], String(Number(alt.toFixed(4))));
      }
      while (seen.has(s) || s === ans) s = s + '·';
      seen.add(s);
      return s;
    });
    return q;
  },

  levels: [
    { name: 'Stop or repeat', icon: '⚙️', blurb: 'Which decimals terminate?', rounds: 6, think: false,
      say: '⚙️ Divide it out — does a remainder come back?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const term = [[3, 8], [7, 20], [9, 40], [5, 16], [11, 25], [13, 50]][i % 6];
        const rep = [[1, 3], [5, 6], [2, 9], [7, 12], [4, 7], [5, 11]][i % 6];
        const f = [[`${term[0]}/${term[1]}`, true], [`${rep[0]}/${rep[1]}`, false], [`${rep[1]}/${term[0] + rep[0]}`, false]];
        const ans = `${term[0]}/${term[1]}`;
        return {
          type: 'choice',
          prompt: G1.art(SCENE7.tablePairs([`${term[0]}/${term[1]}`, `${rep[0]}/${rep[1]}`], ['?', '?'], { rowA: 'fraction', rowB: 'decimal', caption: 'one of them ends, one of them never does' }),
            `Which of these gives a <b>terminating</b> decimal?`),
          options: f.map((x) => x[0]),
          answer: ans,
          why: (v) => String(v) === `${rep[0]}/${rep[1]}` ? 'Divide it: the same remainder keeps coming back, so the digits repeat.' : 'Divide it out rather than guessing from the size of the numbers.',
          hints: ['Write the numerator, a decimal point, and zeros.', 'Divide until the remainder is 0 — or until you recognise a repeat.', `Try ${term[0]} ÷ ${term[1]}.`],
          solution: `${term[0]} ÷ ${term[1]} terminates, while ${rep[0]} ÷ ${rep[1]} repeats.`,
        };
      } },
    { name: 'Grind it out', icon: '🔢', blurb: 'Fraction to decimal by long division.', rounds: 6, think: false,
      say: '🔢 Keep dividing until the remainder is zero.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const den = [8, 20, 25, 16, 40, 50][i % 6];
        const num = [3, 7, 9, 5, 11, 13][i % 6];
        const val = num / den;
        const ans = String(Number(val.toFixed(4)));
        const wrongStr = `0.${num}${den}`.slice(0, 6);
        return {
          type: 'choice',
          prompt: G1.art(SCENE7.tablePairs([`${num}/${den}`], ['?'], { rowA: 'fraction', rowB: 'decimal', askCol: 0, caption: 'divide the denominator into the numerator' }),
            `Write <b>${num}/${den}</b> as a decimal.`),
          options: [ans, wrongStr, String(Number((val * 10).toFixed(4)))],
          answer: ans,
          why: (v) => String(v) === wrongStr ? 'That just copies the digits. Divide properly.' : 'That is ten times too big — check the decimal point.',
          hints: [`${num} ÷ ${den} — start with ${num}0 ÷ ${den}.`, 'Keep a zero on the end each time you bring down.', 'Stop when the remainder is 0.'],
          solution: `${num} ÷ ${den} = <b>${ans}</b>.`,
        };
      } },
    { name: 'Subtract rationals', icon: '➖', blurb: 'p − q = p + (−q) in fraction form.', rounds: 6, think: true,
      say: '➖ Think first: flip the sign of the second number.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const a = [1, 3, 5, 7][i % 4], b = [4, 8, 4, 8][i % 4];
        const c = [1, 1, 2, 3][i % 4], d = [2, 3, 3, 4][i % 4];
        const p = a / b, q = c / d;
        const diff = p - q;
        const ans = String(Number(diff.toFixed(4)));
        const sum = String(Number((p + q).toFixed(4)));
        return {
          type: 'choice',
          problem: {
            sentences: ['A workshop measures two lengths of pipe as fractions of a metre.',
              'The fitter subtracts the second length from the first.',
              `The first is ${a}/${b} of a metre and the second is ${c}/${d}.`],
            question: 2, keys: ['subtracts', 'second'], extras: [1],
          },
          prompt: G1.art(SCENE7.tablePairs([`${a}/${b}`, `${c}/${d}`], [String(Number(p.toFixed(4))), String(Number(q.toFixed(4)))], { rowA: 'fraction', rowB: 'decimal', caption: 'subtract as decimals once you have both' }),
            `Work out <b>${a}/${b} − ${c}/${d}</b>.`),
          options: [ans, sum, String(Number(Math.abs(diff).toFixed(4)))],
          answer: ans,
          why: (v) => String(v) === sum ? 'That adds them. Subtracting a positive makes the result smaller.' : 'That is the distance, which is never negative — but a difference does keep its sign.',
          hints: [`${a}/${b} ≈ ${Number(p.toFixed(4))} and ${c}/${d} ≈ ${Number(q.toFixed(4))}.`, 'Subtracting is adding the opposite.', `${Number(p.toFixed(4))} + (${Number((-q).toFixed(4))}).`],
          solution: `${a}/${b} − ${c}/${d} = ${Number(p.toFixed(4))} + (${Number((-q).toFixed(4))}) = <b>${ans}</b>.`,
        };
      } },
  ],

  ghubar: ['Every fraction is a repeating decimal.', '7/8 is nought point seven eight.', 'p − q and q − p are the same.'],
  praise: ['Mill stopped!', 'Repeat spotted!', 'Decimal ground!', 'Sign flipped!'],
  finale: 'Long division never lies — it stops at zero or it repeats. ⚙️',
};

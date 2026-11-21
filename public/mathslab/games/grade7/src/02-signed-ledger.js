/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 7 · Signed Ledger · adding and subtracting signed rationals on a horizontal and a vertical
   number line, including the zero pair p + (−p) = 0
   Source: G07-U01-MAT-L02 (CCSS 7.NS.A.1–2), term 1 — العمليات على الأعداد النسبية (الموجبة والسالبة)
   وتمثيلها على خط الأعداد.

   SCOPE — addition and subtraction on the line, the additive inverse, distance as |p − q|, and the sign
   rules of multiplication / division. The four-operation work with fractions converted to decimals
   (7.NS.A.2d and A.3) is NOT in this game: it is arithmetic fluency, not a line model, and the source
   document reaches it only in its closing objectives. Recorded in docs/mowazi/g7-expansion.md.

   Mechanic = the thinking: the line shows where you START and which way you HOP; the landing point is
   never printed, because that is the answer.
   Named misconceptions: «−7 − 3 is −4», «subtracting a negative makes it smaller», «|p − q| can be
   negative».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g7-signed-ledger', code: 'G07-U01-MAT-L02', title: 'Signed Ledger', emoji: '🧾',
  accent: '#2f5f6e', accentDeep: '#224954', skyA: '#f1f8fa', skyB: '#d5e8ee',
  topic: 'Adding and subtracting signed numbers', band: 'g68', lang: 'en',
  objective: 'I can add and subtract <b>signed numbers</b> on a number line and explain a zero pair.',
  welcome: 'A ledger of profit and debt. Every payment is a hop on the line — find where you land. 🧾',
  learnBlurb: 'A negative number is a hop to the left; subtracting is hopping the other way.',
  how: {
    what: 'On a number line, adding a positive hops right and adding a negative hops left. Subtracting is the same as adding the opposite, so subtracting a negative hops RIGHT.',
    steps: ['🧾 Put your finger on the first number.', 'Read the operation: minus a negative flips the hop.', '✅ Land on the answer and check the sign.'],
  },

  learn: [
    { say: 'Start at <b>−3</b> and add <b>5</b>: five hops to the right lands on <b>2</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE7.signedLine(-8, 8, { start: -3, hop: 5, caption: 'adding a positive hops right' }) })); } },
    { say: 'Start at <b>2</b> and subtract <b>6</b>. Subtracting 6 is adding −6, so six hops left lands on <b>−4</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE7.signedLine(-8, 8, { start: 2, hop: -6, caption: 'subtracting a positive hops left' }) })); } },
    { say: 'Careful: <b>−5 − (−3)</b> is adding +3, because subtracting a negative hops <b>right</b>. You land on −2, not −8.',
      draw(el) { el.append(UI.h('div', { html: SCENE7.signedLine(-8, 8, { start: -5, hop: 3, hopName: '−(−3) = +3', caption: 'subtracting a negative hops right' }) })); } },
    { say: 'A number and its opposite make a zero pair. <b>7 + (−7) = 0</b> — the two hops cancel and you are back at zero.',
      draw(el) { el.append(UI.h('div', { html: SCENE7.signedLine(-8, 8, { start: 0, hop: 7, hopName: '+7 then −7', marks: [{ v: 0, fill: '#9dc0e6', name: 'zero pair' }], caption: 'p + (−p) = 0' }) })); } },
    { say: 'Your turn. The ledger is at <b>−6</b> and a debt of <b>4</b> is cancelled. Where does it land?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE7.signedLine(-8, 6, { start: -6, hop: 4, hopName: '−(−4) = +4', caption: 'cancelling a debt moves you right' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['-2', true], ['-10', false], ['2', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — subtracting a negative hops right, and −6 + 4 = −2.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '-10' ? 'That treats it as another debt. Cancelling a debt gives money back.' : 'Start at −6 and hop four to the right.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says <b>−7 − 3 = −4</b>. Work it out on the line — is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Seven minus three is four. Keep the minus sign and you are done.', 5200);
        el.append(UI.h('div', { html: SCENE7.signedLine(-12, 2, { start: -7, hop: -3, caption: 'the hop is the whole 3, going left' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — you land on −10, because the 3 is taken away as well.', true], ['He is right — the answer is −4.', false], ['The answer is +4.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. Both numbers pull left, so they combine.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('He subtracted only part of the 3. Hop the whole 3 to the left.', 'bad'))),
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
        const alt = [v + 1, v - 1, v + 2, v + 10].find((c) => {
          const cand = s.replace(num[0], String(c));
          return !seen.has(cand) && cand !== ans;
        });
        if (alt != null) s = s.replace(num[0], String(alt));
      }
      while (seen.has(s) || s === ans) s = s + '·';
      seen.add(s);
      return s;
    });
    return q;
  },

  levels: [
    { name: 'Add on the line', icon: '➡️', blurb: 'One hop, one landing point.', rounds: 6, think: false,
      say: '➡️ Right for plus, left for minus.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const a = -UI.rint(2, 9), b = UI.rint(1, 9);
        const ans = a + b;
        return {
          type: 'choice',
          prompt: G1.art(SCENE7.signedLine(-14, 10, { start: a, hop: b, caption: `${a} + ${b}` }),
            `The line starts at <b>${a}</b> and hops <b>${b}</b> to the right. Where does it land?`),
          options: [String(ans), String(a - b), String(Math.abs(a) + b)],
          answer: String(ans),
          why: (v) => Number(v) === a - b ? 'That hops the wrong way. Adding a positive goes right.' : 'That treats both numbers as pulls to the left.',
          hints: [`Start at ${a}.`, `A hop of +${b} moves right.`, `${a} + ${b}.`],
          solution: `${a} + ${b} = <b>${ans}</b>.`,
        };
      } },
    { name: 'Take away a debt', icon: '🧾', blurb: 'Subtracting a negative.', rounds: 6, think: false,
      say: '🧾 Minus a negative is a hop to the right.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const a = -UI.rint(1, 8), b = -UI.rint(1, 8);
        const ans = a - b;
        return {
          type: 'choice',
          prompt: G1.art(SCENE7.signedLine(-12, 8, { start: a, hop: -b, hopName: `${a} − (${b})`, caption: 'the debt is cancelled, so the hop is right' }),
            `Work out <b>${a} − (${b})</b>. Which point do you land on?`),
          options: [String(ans), String(a + b), String(-(a - b))],
          answer: String(ans),
          why: (v) => Number(v) === a + b ? 'That adds the debt instead of cancelling it.' : 'That flips the sign of the whole answer — only the subtrahend flips.',
          hints: [`Subtracting ${b} is the same as adding ${-b}.`, `So the hop is ${-b}, to the right.`, `${a} + ${-b}.`],
          solution: `${a} − (${b}) = ${a} + ${-b} = <b>${ans}</b>.`,
        };
      } },
    { name: 'Zero pair', icon: '⚖️', blurb: 'Distance, opposites and the sign.', rounds: 6, think: true,
      say: '⚖️ Think first: is the answer a position or a distance?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const p = -UI.rint(2, 9), q = UI.rint(1, 9);
        const ans = Math.abs(p - q);
        return {
          type: 'choice',
          problem: {
            sentences: ['Two readings are logged on the same ledger line.',
              'The bookkeeper wants the gap between them, not their sum.',
              `The readings are ${p} and ${q}.`],
            question: 2, keys: ['gap', 'readings'], extras: [1],
          },
          prompt: G1.art(SCENE7.signedLine(-14, 10, { marks: [{ v: p, fill: '#9dc0e6', name: `${p}` }, { v: q, fill: '#f2cb96', name: `${q}` }], caption: 'the gap between the two readings' }),
            `What is the distance between <b>${p}</b> and <b>${q}</b> on the line?`),
          options: [String(ans), String(p - q), String(p + q)],
          answer: String(ans),
          why: (v) => Number(v) === p - q ? 'Distance is never negative — the order of the two readings does not matter.' : 'That adds the readings. Distance is a gap, not a total.',
          hints: ['Count the unit steps between the two marks.', 'Distance is |p − q|.', `|${p} − ${q}|.`],
          solution: `|${p} − ${q}| = <b>${ans}</b> units.`,
        };
      } },
  ],

  ghubar: ['−7 − 3 is −4, just take them apart.', 'Cancelling a debt still leaves you owing.', 'A distance can come out negative.'],
  praise: ['Landed!', 'Debt cancelled!', 'Gap measured!', 'Sign checked!'],
  finale: 'Every sign is a direction and every distance is positive — the ledger balances. 🧾',
};

/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 4 · Pearl Divers · long division with partial quotients, up to 4 digits by 1 digit (4.NBT.B.6)
   Source: the Grade 4 base-ten strand paired with G04-U01-MATH-L02's place-value models (4.NBT.B.6).
   Mechanic = the thinking: level 1 reads a division scaffold whose working lines are EMPTY and asks for the
   quotient — partial products have to be built; level 2 asks for the size of one partial step, so the child
   cannot jump to the answer; level 3 is a word problem where the remainder matters. `div-remainder-drop`
   (ignoring the remainder) and `div-partial-stop` (stopping after the first partial quotient) are named.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g4-pearl-divers', code: 'G04-MAT-02', title: 'Pearl Divers', emoji: '🦪',
  accent: '#1d7f8c', accentDeep: '#16646f', skyA: '#eefafb', skyB: '#d0eff2',
  topic: 'Long division with partial quotients', band: 'g35', lang: 'en',
  objective: 'I can divide a <b>multi-digit number</b> by a one-digit number using <b>partial quotients</b>.',
  welcome: 'The divers of Jubail share their pearls into equal baskets before the dhows sail. 🦪',
  learnBlurb: 'Take out a big friendly chunk, subtract, and keep going.',
  how: {
    what: 'Long division asks "how many of the divisor fit?" — take out a large chunk you know, subtract it, and repeat until nothing is left.',
    steps: ['🦪 How many 6s fit into the hundreds?', '🦪 Subtract that chunk.', '✅ Keep going for the tens and the ones.'],
  },

  learn: [
    { say: 'The divers bring up <b>856</b> pearls and fill <b>4</b> baskets equally. That is <b>856 ÷ 4</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE4.divBracket(856, 4, { caption: '856 pearls, 4 baskets' }) })); } },
    { say: '<b>4 × 200 = 800</b>, so 200 goes in. <b>856 − 800 = 56</b>. Then <b>4 × 14 = 56</b>. The quotient is <b>214</b>.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE4.divBracket(856, 4, { caption: '4 × 200 = 800, then 4 × 14 = 56' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '200 + 14 = <b>214</b> pearls per basket' }));
      } },
    { say: 'Your turn: <b>7</b> baskets hold <b>945</b> pearls equally. How many in each basket?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE4.divBracket(945, 7, { caption: '945 ÷ 7' }) }));
        const row = UI.h('div', { class: 'opts' });
        [135, 130, 245].forEach((v) => row.append(UI.h('button', {
          class: 'opt', text: String(v),
          onclick: (e) => (v === 135 ? (e.target.classList.add('good'), L.ok('Yes — 7 × 100 = 700, then 7 × 35 = 245. 135 each.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(v === 130 ? 'You stopped at the hundreds. There are 245 left to share.' : 'Try 7 × 100 first, then keep sharing.', 'bad'))),
        })));
        el.append(row);
      } },
    { say: 'Ghubar stopped at <b>7 × 100 = 700</b> and said the answer is 100. What did he forget?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Seven times a hundred is 700. Close enough to 945 — call it 100 each.', 5200);
        el.append(UI.h('div', { html: SCENE4.divBracket(945, 7, { caption: 'what is left after 700?' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['The 245 pearls still left. 245 ÷ 7 = 35, so 135 each.', true], ['He should have added the remainders.', false], ['100 is right — the rest is a remainder.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Exactly — a partial quotient is only a step, not the answer.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Subtract 700 from 945. What is left to share?', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Share the pearls', icon: '🦪', blurb: 'Divide with the scaffold in front of you.', rounds: 6, think: false,
      say: '🦪 How many in each basket?',
      round() {
        const d = UI.pick([3, 4, 6, 7, 8]), q = UI.rint(12, 96), n = d * q;
        return {
          type: 'number', prompt: G1.art(SCENE4.divBracket(n, d, { max: 500 }), `${n} pearls shared into ${d} baskets.`),
          answer: q, suffix: '',
          why: (v) => v === n - d ? 'That subtracts the baskets. Division shares the total equally.'
            : v === Math.floor(q / 10) * 10 ? 'You stopped after the first chunk — the rest still has to be shared.'
            : 'Take out a chunk you know, subtract it, and keep going.',
          hints: [`${d} × ${Math.floor(q / 10) * 10} = ${d * Math.floor(q / 10) * 10}.`, `Subtract that from ${n}.`, 'Share what is left the same way.'],
          solution: `${n} ÷ ${d} = <b>${q}</b> pearls each.`,
        };
      } },
    { name: 'Stay or keep going', icon: '➗', blurb: 'Does it divide exactly, or is there a remainder?', rounds: 6, think: false,
      say: '➗ Which statement is true for this division?',
      round() {
        const d = UI.pick([4, 6, 7, 9]), q = UI.rint(11, 60), r = UI.rint(1, d - 1), n = d * q + r;
        const right = `It divides with a remainder of ${r}.`;
        const wrong = ['It divides exactly.', `It divides exactly with a remainder of ${d}.`, `The remainder is ${r + 1}.`];
        return {
          type: 'choice', prompt: G1.art(SCENE4.divBracket(n, d, { max: 420 }), `${n} ÷ ${d}`),
          options: [right, ...wrong],
          answer: right,
          why: (v) => v === 'It divides exactly.' ? `Check: ${d} × ${q} = ${d * q}, and ${n} is ${r} more than that.`
            : 'Count what is left over after the chunks are taken out.',
          hints: [`Try ${d} × ${q} = ${d * q}.`, `${n} − ${d * q} = ${r}.`, `A remainder is smaller than the divisor, ${d}.`],
          solution: `${n} ÷ ${d} = ${q} remainder ${r}.`,
        };
      } },
    { name: 'Dhow stories', icon: '📖', blurb: 'A catch that must be shared.', rounds: 6, think: true,
      say: '📖 Think first: what is being shared?',
      round(i) {
        const d = 4 + (i % 3), q = 30 + (i % 4) * 11, n = d * q + (i % 2 ? 0 : 1);
        const rem = n - d * q;
        return {
          type: 'number',
          problem: {
            sentences: [`Three dhows land a catch of ${n} pearls.`, 'The market opens after the morning tide.', `The pearls are shared equally between ${d} baskets.`, 'How many pearls are left over after the baskets are filled?'],
            question: 3, keys: ['left over', 'equally'], extras: [1],
          },
          prompt: 'How many pearls are left over?', answer: rem, suffix: '',
          why: (v) => v === q ? 'That is the number in each basket. The question asks what is left over.'
            : v === n ? 'That is the whole catch.' : 'Divide first, then see what cannot be shared.',
          hints: [`${n} ÷ ${d} = ${q} with something left.`, `${d} × ${q} = ${d * q}.`, `${n} − ${d * q} = ?`],
          solution: `${n} ÷ ${d} = ${q} remainder <b>${rem}</b>.`,
        };
      } },
  ],

  ghubar: ['Division means take away the divisor once.', 'The remainder is the answer.', 'Big chunks first is cheating.'],
  praise: ['Chunks taken!', 'Remainder found!', 'Every pearl shared!', 'Quotient built!'],
  finale: 'Every basket even — you can divide with partial quotients! 🦪',
};

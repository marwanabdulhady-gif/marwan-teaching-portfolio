/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 2 · Riyal Market · money in riyals and halalas (2.MD.C.8 / local)
   Mechanic = the thinking: level 1 counts a set of notes and coins by tens and ones (place value in money),
   level 2 makes an amount from the fewest notes, level 3 works out change — which is subtraction, so the
   child must decide the operation. Halalas are 100 to the riyal, so the rewrite is a place-value rewrite.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g2-riyal-market', code: 'G02-MAT-07', title: 'Riyal Market', emoji: '🪙',
  accent: '#a8781f', accentDeep: '#84600f', skyA: '#fffaf0', skyB: '#f7ecd2',
  topic: 'Money: riyals and halalas', band: 'g35', lang: 'en',
  objective: 'I can <b>count riyals and halalas</b> and work out the <b>change</b> from a purchase.',
  welcome: 'The Friday market is open. Count your money before you buy. 🪙',
  learnBlurb: 'A 10-riyal note is one ten. Halalas are the small parts.',
  how: {
    what: 'One riyal is 100 halalas. Count the notes by tens and the coins on top.',
    steps: ['🪙 Count the notes in tens.', '🪙 Add the halala coins.', '✅ Change = what you pay − what it costs.'],
  },

  learn: [
    { say: 'Noor has these notes. How much money is that?',
      draw(el) { el.append(UI.h('div', { html: SCENE2.money([10, 10, 10, 10, 1], [], { label: 'four 10-riyal notes and one 1-riyal note' }) })); } },
    { say: 'Count by tens: <b>10, 20, 30, 40</b>, then one more riyal. That is <b>41</b> riyals. Ten riyals is one ten.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE2.money([10, 10, 10, 10, 1], [], { label: 'four 10-riyal notes and one 1-riyal note' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '4 tens and 1 one → <b>41 riyals</b>.' }));
      } },
    { say: 'Your turn: you pay with a <b>50</b>-riyal note for a <b>35</b>-riyal basket. How much change?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE2.money([50], [], { label: 'a 50-riyal note' }) }));
        const row = UI.h('div', { class: 'opts' });
        [15, 25, 85].forEach((v) => row.append(UI.h('button', {
          class: 'opt', text: v + ' riyals',
          onclick: (e) => v === 15 ? (e.target.classList.add('good'), L.ok('Yes — 50 − 35 = 15 riyals change.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(v === 85 ? 'Change is what is left, so subtract.' : 'Count up from 35 to 50.', 'bad')),
        })));
        el.append(row);
      } },
    { say: 'Ghubar says the change is <b>85</b> riyals. What did he do?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Fifty plus thirty-five is eighty-five. I keep it all!', 5200);
        const row = UI.h('div', { class: 'opts' });
        [['He added instead of subtracting.', true], ['He counted the coins wrong.', false], ['Nothing — 85 is the change.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Right — change is what is left over: 50 − 35.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('If you hand over 50, can you keep more than 50?', 'bad')),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Count the notes', icon: '🪙', blurb: 'Tens, then ones.', rounds: 4, think: false,
      say: '🪙 How much money is here?',
      round() {
        const tens = UI.rint(1, 5), ones = UI.rint(0, 9);
        const notes = [...Array(tens).fill(10)];
        if (ones) notes.push(1);
        const total = tens * 10 + ones;
        return {
          type: 'number', prompt: G1.art(SCENE2.money(notes, [], { label: `${tens} ten-riyal notes and ${ones} one-riyal notes` }), `${tens} notes of 10 riyals${ones ? ` and ${ones} of 1 riyal` : ''}.`),
          answer: total, suffix: ' riyals',
          why: (v) => v === tens + ones ? 'Count the notes by tens, not by ones.' : v === ones * 10 + tens ? 'A 10-riyal note is worth ten, not one.' : 'Count by tens first, then add the ones.',
          hints: ['Start at 10 for the first note.', `Count ${tens} tens.`, ones ? `Then add the ${ones} single riyals.` : 'There are no single riyals here.'],
          solution: `${tens} × 10 ${ones ? `+ ${ones}` : ''} = <b>${total}</b> riyals.`,
        };
      } },
    { name: 'Make the amount', icon: '💵', blurb: 'Fewest notes for the price.', rounds: 4, think: false,
      say: '💵 Which is the fewest notes for this price?',
      round() {
        const price = UI.rint(2, 9) * 10 + UI.rint(0, 4);
        const tens = Math.floor(price / 10), ones = price % 10;
        const right = ones ? `${tens} ten${tens === 1 ? '' : 's'}${ones ? ` and ${ones} one${ones === 1 ? '' : 's'}` : ''}` : `${tens} ten${tens === 1 ? '' : 's'}`;
        const a = `${price} one-riyal notes`;
        const b = `${Math.floor(price / 10) ? Math.floor(price / 10) + 1 : 1} ten${Math.floor(price / 10) ? 's' : ''}`;
        return {
          type: 'choice', prompt: G1.art(SCENE2.money([price >= 50 ? 50 : 10], [], { label: 'the price tag' }), `The basket costs ${price} riyals.`),
          options: UI.shuffle([right, a, b].filter((v, i, arr) => arr.indexOf(v) === i)), answer: right,
          why: (v) => v === a ? 'That works, but it is a lot of notes. Fewest means biggest notes first.' : 'Count the tens, then the ones.',
          hints: [`${price} riyals needs ${tens} tens.`, ones ? `Then ${ones} more riyals.` : 'It is exactly a number of tens.', 'Use as few notes as you can.'],
          solution: `${price} = ${tens} × 10 ${ones ? `+ ${ones}` : ''}, so <b>${right}</b>.`,
        };
      } },
    { name: 'Market change', icon: '🧾', blurb: 'Pay and get change.', rounds: 4, think: true,
      say: '🧾 Think first: is change more or less than you paid?',
      round(i) {
        const price = 20 + i * 11, paid = 50 + (i % 2) * 50;
        return {
          type: 'number',
          problem: {
            sentences: [`The basket costs ${price} riyals.`, 'Noor has a green basket.', `She pays with a ${paid}-riyal note.`, 'How much change does she get?'],
            question: 3, keys: ['change'], extras: [1],
          },
          prompt: 'How much change does Noor get?', answer: paid - price, suffix: ' riyals',
          why: (v) => v === paid + price ? 'Change is what is left — subtract.' : v === price ? 'That is the price, not the change.' : 'Count up from the price to what she paid.',
          hints: [`She paid ${paid}.`, `The basket costs ${price}.`, 'Count up from the price to the note.'],
          solution: `${paid} − ${price} = <b>${paid - price}</b> riyals change.`,
        };
      } },
  ],

  ghubar: ['A ten-riyal note is a one with a zero. So it is one.', 'Change means the shop gives me more.', 'Halalas are toys. Ignore them.'],
  praise: ['Counted in tens!', 'Fewest notes found!', 'Change spot on!', 'Market maths done!'],
  finale: 'Basket paid for — you can count riyals and halalas! 🪙',
};

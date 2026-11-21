/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 5 · The Sliding Card · place value to thousandths and ×/÷ by powers of ten
   Source: G05-U01-MAT-L01 (CCSS 5.NBT.A.1 & 5.NBT.A.2), term 1, unit 01.
   Mechanic = the thinking: the lesson's own «القاعدة الذهبية» card activity. A digit card printed as
   $4.72$ is slid one or two places along a place-value strip; level 1 moves the card and asks for the new
   value, level 2 names the place a digit sits in, level 3 puts the move inside a riyal-and-halala story.
   The strip never prints the shifted value — the child must reason about the ten-to-one relation.
   Named misconception: «the decimal point is glued to the digits» (0.47 × 10 = 0.470).
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g5-sliding-card', code: 'G05-U01-MAT-L01', title: 'The Sliding Card', emoji: '🔢',
  accent: '#1f6f8b', accentDeep: '#175a72', skyA: '#eef8fb', skyB: '#cfe9f1',
  topic: 'Place value and powers of ten', band: 'g35', lang: 'en',
  objective: 'I can move a decimal <b>one or two places</b> by × or ÷ 10 and say what each place is worth.',
  welcome: 'Al-Uqlīdisī wrote the first decimal separator on a card like this one. Slide it and watch the places. 🔢',
  learnBlurb: 'Every place is ten times the place on its right.',
  how: {
    what: 'The places run … tens, ones, decimal point, tenths, hundredths, thousandths. Moving one place left multiplies by 10; one place right divides by 10.',
    steps: ['🔢 Find the digit that must move.', '🔢 Count the places — one, or two for 100.', '✅ Slide it and keep every other digit in order.'],
  },

  learn: [
    { say: 'Here is the card <b>4.72</b> on the strip. The <b>4</b> sits in the ones place — it is worth four wholes.',
      draw(el) { el.append(UI.h('div', { html: SCENE5.powerShift('472', 1, 1, { caption: 'the card rests where it is written' }) })); } },
    { say: 'Multiply by 10 and every digit slides <b>one place left</b>: 47.2. The 4 is now worth forty, not four.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE5.powerShift('472', 2, 1, { caption: '× 10 → one place left' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '4.72 <b>× 10 = 47.2</b> — the digits keep their order, the point does not.' }));
      } },
    { say: 'Your turn. Slide <b>4.72</b> two places to the <b>right</b> — that is ÷ 100. What value do you get?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE5.powerShift('472', 0, 3, { caption: '÷ 100 → two places right' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['0.0472', true], ['0.472', false], ['472', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — two places right, so 4.72 ÷ 100 = 0.0472.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '472' ? 'That is going left. ÷ moves right and makes it smaller.' : 'Count two places, not one: ÷ 100 is two places.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says <b>0.47 × 10 = 0.470</b> because a zero was added. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Times ten? Just add a zero on the end. 0.470. Done.', 5200);
        el.append(UI.h('div', { html: SCENE5.powerShift('47', 3, 2, { caption: 'one place left, not one zero on the end' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — 0.47 × 10 = 4.7, the digits move left.', true], ['He is right — 0.470 is the answer.', false], ['They are equal so it does not matter.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. A trailing zero changes nothing; the places must move.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('0.470 still means forty-seven hundredths. × 10 must make it bigger.', 'bad'))),
        }))); el.append(row);
      } },
  ],


  /* ── option hygiene ───────────────────────────────────────────────────────────────────────────────
     A round's `options` are built from the numbers the question drew, so a distractor can occasionally
     coincide with the answer (the swapped pair when x === y, a fixed fallback that lands on the right
     value). Two identical buttons would be a broken question, and the engine does not dedupe.
     This keeps the answer's own button untouched — the engine matches options by text, so rewriting it
     would make the right answer unselectable — and gives any duplicate a visibly different near-miss.
     Called as `GAME.fixOpts(this.roundRaw(i))`: the engine invokes `round` detached from the level
     object, so a `this._fix(...)` private call would lose its receiver. */
  fixOpts(q) {
    if (!q || !q.options || q.type === 'order' || q.type === 'bars') return q;
    const ans = String(q.answer);
    const seen = new Set();
    let keptAnswer = false;
    q.options = q.options.map((o) => {
      let s = String(o);
      if (s === ans && !keptAnswer) { keptAnswer = true; seen.add(s); return o; }
      if (!seen.has(s)) { seen.add(s); return o; }
      const frac = s.match(/^\d+\/\d+$/);
      const num = !frac && s.match(/-?\d+(?:\.\d+)?/);
      if (frac) {
        const [n, d] = s.split('/').map(Number);
        let k = 1, cand = `${n}/${d}`;
        while ((seen.has(cand) || cand === ans) && k < 40) { cand = `${n + k}/${d}`; k += 1; }
        s = cand;
      } else if (num) {
        const v = Number(num[0]);
        const alt = [v + 1, v - 1, v + 10, v + 2, v * 2 + 1].find((c) => {
          const cand = s.replace(num[0], String(c));
          return c >= 0 && !seen.has(cand) && cand !== ans;
        });
        if (alt != null) s = s.replace(num[0], String(alt));
      } else {
        s = s + ' ·';
      }
      while (seen.has(s) || s === ans) s = s + '·';
      seen.add(s);
      return s;
    });
    return q;
  },

  levels: [
    { name: 'Slide the card', icon: '🔢', blurb: '× or ÷ by 10 and 100.', rounds: 6, think: false,
      say: '🔢 Slide every digit the right number of places.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const base = [UI.rint(2, 9) + '.' + UI.rint(1, 9) + UI.rint(1, 9), UI.rint(11, 89) + '.' + UI.rint(1, 9)][i % 2 === 0 ? 0 : 1];
        const pow = i % 3 === 0 ? 10 : i % 3 === 1 ? 100 : 10;
        const op = i % 4 === 3 ? '÷' : '×';
        const answer = op === '×' ? +(Number(base) * pow).toFixed(4) : +(Number(base) / pow).toFixed(4);
        const wrongs = op === '×'
          ? [+(Number(base) * (pow === 10 ? 100 : 10)).toFixed(4), +(Number(base) * pow * 10).toFixed(4)]
          : [+(Number(base) / (pow === 10 ? 100 : 10)).toFixed(4), +(Number(base) / pow / 10).toFixed(4)];
        const places = pow === 10 ? 'one place' : 'two places';
        return {
          type: 'choice',
          prompt: G1.art(SCENE5.powerShift(String(base).replace('.', ''), 2, op === '×' ? 1 : 3, { caption: `${op} ${pow} → ${places} ${op === '×' ? 'left' : 'right'}` }),
            `Move every digit ${places} to the ${op === '×' ? 'left' : 'right'}.`),
          options: [String(answer), String(wrongs[0]), String(wrongs[1])],
          answer: String(answer),
          why: (v) => Number(v) === wrongs[0] ? `That is ${pow === 10 ? 'two' : 'one'} place${pow === 10 ? 's' : ''}, not ${places}. Read the power of ten.`
            : `Count the places: ${pow} means ${places}. Nothing else about the digits changes.`,
          hints: [`${op} ${pow} moves the digits ${places}.`, `The numbers keep their order — only the point moves.`, `Start from ${base} and slide.`],
          solution: `${base} ${op} ${pow} = <b>${answer}</b>.`,
        };
      } },
    { name: 'Name the place', icon: '📏', blurb: 'What is one digit worth?', rounds: 6, think: false,
      say: '📏 Each place is ten times the place on its right.',
      round() { return GAME.fixOpts(this.roundRaw()); },
      roundRaw() {
        const d = [UI.rint(1, 9), UI.rint(0, 9), UI.rint(1, 9), UI.rint(1, 9)];
        const num = `${d[0]}.${d[1]}${d[2]}${d[3]}`;
        const idx = UI.rint(1, 3);
        const names = ['tenths', 'hundredths', 'thousandths'];
        const values = [`0.${'0'.repeat(idx - 1)}${d[idx]}`.replace(/0+$/, '') || d[idx], d[idx] / Math.pow(10, idx)];
        const answer = names[idx - 1];
        const val = d[idx] / Math.pow(10, idx);
        return {
          type: 'choice',
          prompt: G1.art(SCENE5.powerShift(d.join(''), 1, 1 + idx, { caption: `the digit ${d[idx]} sits in this place` }),
            `In <b>${num}</b>, which place holds the digit <b>${d[idx]}</b>?`),
          options: [answer, names[idx % 3], names[(idx + 1) % 3]],
          answer,
          why: () => `Count right from the point: tenths, hundredths, thousandths. The ${d[idx]} is worth ${val}.`,
          hints: ['The first place after the point is tenths.', 'The second is hundredths.', 'The third is thousandths.'],
          solution: `In ${num}, the ${d[idx]} is in the <b>${answer}</b> place — worth ${val}.`,
        };
      } },
    { name: 'Market shift', icon: '🪙', blurb: 'A price times ten, then a hundred.', rounds: 6, think: true,
      say: '🪙 Think first: what must you find out before you compute?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const kg = +(UI.rint(4, 39) / 10).toFixed(1);
        const mult = i % 2 === 0 ? 10 : 100;
        const answer = +(kg * mult).toFixed(2);
        return {
          type: 'choice',
          problem: {
            sentences: ['The co-operative sells saffron by the gram.',
              'A small jar holds some saffron and is weighed on the shop scale.',
              `One gram costs ${(kg / 10).toFixed(2)} riyals.`,
              `The shop packs ${mult} grams into a gift box.`,
              `What does the saffron in one gift box cost?`],
            question: 4, keys: ['cost', 'grams'], extras: [1],
          },
          prompt: `One gram costs <b>${(kg / 10).toFixed(2)}</b> riyals. What do <b>${mult}</b> grams cost?`,
          options: [`${answer}`, `${+(kg).toFixed(2)}`, `${+(kg / 10 / 10).toFixed(3)}`],
          answer: `${answer}`,
          why: () => `${mult} grams is ${mult} single grams, so multiply the price by ${mult} — ${mult === 10 ? 'one place' : 'two places'} left.`,
          hints: [`You pay ${(kg / 10).toFixed(2)} riyals for each gram.`, `There are ${mult} grams, so × ${mult}.`, 'Slide the digits, do not add zeroes.'],
          solution: `${(kg / 10).toFixed(2)} × ${mult} = <b>${answer}</b> riyals.`,
        };
      } },
  ],

  ghubar: ['Times ten? Just add a zero on the end.', '0.470 and 0.47 are different numbers.', 'The decimal point is glued to the last digit.'],
  praise: ['Card slid!', 'Place named!', 'Market price found!', 'Exactly ten to one!'],
  finale: 'Every place is ten times its neighbour — you can slide the card! 🔢',
};

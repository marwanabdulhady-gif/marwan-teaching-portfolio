/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 5 · Thousandths Workshop · read, compare and compute decimals to thousandths
   Source: G05-U01-MATH-L02 (CCSS 5.NBT.A.3 & 5.NBT.B.7), term 1, unit 01.
   Mechanic = the thinking: the whole is cut into one thousand equal parts, shown as ten hundred-sheets.
   Level 1 reads a shaded amount of thousandths, level 2 compares two decimals by place (never by string
   length), level 3 adds and subtracts decimals in a riyal/halala ledger. The grids never print the count
   they encode. Named misconception: «the longer decimal is the bigger number» (0.403 > 0.43).
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g5-thousandths-workshop', code: 'G05-U01-MATH-L02', title: 'Thousandths Workshop', emoji: '🧱',
  accent: '#5b4fa8', accentDeep: '#4a3f8c', skyA: '#f5f3ff', skyB: '#ded9f7',
  topic: 'Decimals to thousandths', band: 'g35', lang: 'en',
  objective: 'I can read and write a decimal to <b>thousandths</b>, compare two of them, and add or subtract them.',
  welcome: 'One whole, cut into a thousand equal parts. Al-Kāshī wrote the rules for this in مفتاح الحساب. 🧱',
  learnBlurb: 'Ten hundredths make one tenth; ten thousandths make one hundredth.',
  how: {
    what: 'One whole = 10 tenths = 100 hundredths = 1000 thousandths. Write it with three places after the point, and the last place tells you the unit.',
    steps: ['🧱 Count the full tenths first.', '🧱 Then the hundredths, then the thousandths.', '✅ Pad with zeros to the same place before you compare.'],
  },

  learn: [
    { say: 'This sheet is <b>one tenth</b> of the whole. Ten of these sheets make the whole — so the whole holds <b>1000</b> of the small squares.',
      draw(el) { el.append(UI.h('div', { html: SCENE5.thousandthsGrid(1, { h: 1 }, { caption: 'one sheet = 1 tenth = 100 thousandths' }) })); } },
    { say: 'Count <b>three tenths</b> and <b>four thousandths</b>. That is <b>0.304</b> — three tenths, zero hundredths, four thousandths.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE5.thousandthsGrid(1, { h: 3, t: 4 }, { caption: '3 tenths and 4 thousandths' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '3 tenths + 0 hundredths + 4 thousandths = <b>0.304</b>' }));
      } },
    { say: 'Your turn. A sheet shows <b>four tenths</b> shaded. Which decimal is that?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE5.thousandthsGrid(1, { h: 4 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['0.400', true], ['0.040', false], ['0.004', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — four tenths is 0.4, written to thousandths as 0.400.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '0.004' ? 'Four tenths, not four thousandths. Which place is first after the point?' : 'The tenths place is the first one after the point.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says <b>0.403</b> is bigger than <b>0.43</b> because 403 beats 43. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Four hundred and three against forty-three. 403 wins — easy.', 5200);
        el.append(UI.h('div', { html: SCENE5.thousandthsGrid(1, { h: 4, t: 3 }, { caption: '0.403 has only three thousandths past the 4 tenths' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — 0.43 is bigger, it has 43 hundredths.', true], ['He is right — 403 > 43.', false], ['They are equal.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. Line up the places: 0.430 against 0.403.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Write both to thousandths: 0.430 and 0.403. Now compare.', 'bad'))),
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
    { name: 'Read the sheet', icon: '🧱', blurb: 'Write the shaded thousandths.', rounds: 6, think: false,
      say: '🧱 Tenths, then hundredths, then thousandths.',
      round() { return GAME.fixOpts(this.roundRaw()); },
      roundRaw() {
        const h = UI.rint(1, 8), t = UI.rint(1, 9);
        const answer = (h / 10 + t / 1000).toFixed(3);
        return {
          type: 'choice',
          prompt: G1.art(SCENE5.thousandthsGrid(1, { h, t }, { max: 300 }), 'Count whole tenths first, then the spare squares.'),
          options: [answer, (h / 100 + t / 1000).toFixed(3), (h / 10 + t / 100).toFixed(2)],
          answer,
          why: (v) => v === (h / 100 + t / 1000).toFixed(3) ? 'You shaded tenths, not hundredths. The first place after the point is tenths.'
            : 'Each spare square is one thousandth, so it takes the third place.',
          hints: [`${h} full rows of the sheet are shaded.`, `${t} single squares are shaded.`, `${h} tenths and ${t} thousandths.`],
          solution: `${h} tenths and ${t} thousandths = <b>${answer}</b>.`,
        };
      } },
    { name: 'Line up the places', icon: '📏', blurb: 'Which decimal is greater?', rounds: 6, think: false,
      say: '📏 Pad with zeros so both have the same number of places.',
      round() { return GAME.fixOpts(this.roundRaw()); },
      roundRaw() {
        const a = +(UI.rint(100, 899) / 1000).toFixed(3);
        const b = +(UI.rint(10, 89) / 100).toFixed(2);
        const hi = Math.max(a, b);
        return {
          type: 'choice',
          prompt: `Which is greater: <b>${a}</b> or <b>${b}</b>?`,
          options: [String(a), String(b), 'They are equal.'],
          answer: String(hi),
          why: () => `Write both to thousandths first: ${a} stays, ${b} becomes ${b.toFixed(3)}. Then compare place by place.`,
          hints: [`${b} has two places. Add a zero to make three: ${b.toFixed(3)}.`, 'Compare the tenths digit first.', 'If the tenths tie, compare hundredths.'],
          solution: `${a} vs ${b.toFixed(3)} → <b>${hi}</b> is greater.`,
        };
      } },
    { name: 'Ledger sums', icon: '🧾', blurb: 'Add or subtract decimals, then check.', rounds: 6, think: true,
      say: '🧾 Think first: which line is the hidden question?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const a = +(UI.rint(120, 780) / 100).toFixed(2);
        const b = +(UI.rint(15, 199) / 100).toFixed(2);
        const add = i % 2 === 0;
        const big = Math.max(a, b), small = Math.min(a, b);
        const answer = add ? +(big + small).toFixed(2) : +(big - small).toFixed(2);
        return {
          type: 'choice',
          problem: {
            sentences: ['The school co-operative keeps a ledger of the garden shop.',
              'Tomatoes are sold in the playground at break.',
              `On Sunday the shop took ${big} riyals.`,
              `On Monday it took ${small} riyals.`,
              add ? 'How much did the two days take together?' : 'How much more did Sunday take than Monday?'],
            question: 4, keys: ['took', 'more', 'together'], extras: [1],
          },
          prompt: add ? `<b>${big}</b> + <b>${small}</b> = ?` : `<b>${big}</b> − <b>${small}</b> = ?`,
          options: [String(answer), String(+(add ? big * small : big + small).toFixed(2)), String(+(add ? big - small : big * 2).toFixed(2))],
          answer: String(answer),
          why: () => `Write the numbers under each other so the points line up, then ${add ? 'add' : 'subtract'} place by place.`,
          hints: ['Line up the decimal points first — not the last digits.', 'Fill the empty place with a zero.', add ? 'Add hundredths, then tenths, then ones.' : 'Borrow from the ones if the hundredths are too small.'],
          solution: `<b>${answer}</b> riyals.`,
        };
      } },
  ],

  ghubar: ['The longer decimal is the bigger number.', 'Just add a zero when the places do not match.', 'Decimals add like whole numbers if you ignore the point.'],
  praise: ['Thousandths counted!', 'Places lined up!', 'Ledger balanced!', 'Nothing lost in the zeros!'],
  finale: 'You lined up every place — decimals to thousandths, sorted! 🧱',
};

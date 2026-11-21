/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 6 · Tape Share · equivalent ratios, tape diagrams and double number lines in a real share-out
   Source: G06-U02-MAT-L01 (CCSS 6.RP.A.1, 6.RP.A.3a–c), term 1, unit 02 — النسبة والمعدل ومعدل الوحدة
   وتطبيقات النسبة المئوية. The lesson bundle's own worked examples (palm and olive seedlings, a journey
   at constant speed, a 25% discount) are the level-3 stories.
   Mechanic = the thinking: a quantity is shared in a given ratio. The tape diagram shows the equal cells
   and the total; the child must find the value of ONE cell, then answer for one part or for the whole.
   Level 1 finds one cell from the total; level 2 uses a part to find the whole; level 3 applies a percent
   to a price. The tape never prints the value of a cell.
   Named misconceptions: «share the total in half regardless of the ratio», and «the percent is the amount
   you pay».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g6-tape-share', code: 'G06-U02-MAT-L01', title: 'Tape Share', emoji: '🪢',
  accent: '#1b6b5a', accentDeep: '#145648', skyA: '#effaf6', skyB: '#cfeee3',
  topic: 'Tape diagrams and proportional sharing', band: 'g68', lang: 'en',
  objective: 'I can share a quantity in a given <b>ratio</b> using a tape diagram, and find a part from the whole.',
  welcome: 'A grove is shared in a ratio. The tape shows the parts — find what one cell is worth. 🪢',
  learnBlurb: 'A tape diagram cuts the whole into equal cells. Total ÷ cells = the value of one cell.',
  how: {
    what: 'In a tape diagram every cell is worth the same. Divide the total by the number of cells to find one cell, then multiply by the cells in the part you need.',
    steps: ['🪢 Count every cell in the tape.', 'Divide the total by the number of cells.', '✅ Multiply one cell by the cells of the part asked for.'],
  },

  learn: [
    { say: 'Twenty palm and olive seedlings are shared <b>2 : 3</b>. The tape has 2 + 3 = <b>5</b> cells, so one cell is 20 ÷ 5 = <b>4</b> seedlings.',
      draw(el) { el.append(UI.h('div', { html: SCENE6.barModel6([{ n: 2, label: 'palm' }, { n: 3, label: 'olive' }], { totalLabel: '20 seedlings in 5 equal cells' }) })); } },
    { say: 'Two cells of palm = 8 seedlings, three cells of olive = 12. The ratio of what each got is 8 : 12, which simplifies back to 2 : 3.',
      draw(el) { el.append(UI.h('div', { html: SCENE6.tapeStrip([[2, 'palm'], [3, 'olive']], { caption: 'each cell is 4 seedlings' }) })); } },
    { say: 'Your turn. <b>36</b> seedlings are shared <b>4 : 5</b>. How many does the <b>4</b>-part get?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE6.barModel6([{ n: 4, label: 'first share' }, { n: 5, label: 'second share' }], { totalLabel: '36 seedlings in 9 equal cells' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['16', true], ['18', false], ['20', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 36 ÷ 9 = 4 per cell, and 4 cells × 4 = 16.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '18' ? 'That is half the total — the tape is not cut in half.' : 'Count every cell first: 4 + 5 = 9.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says a <b>25%</b> discount on <b>120</b> riyals means you pay <b>25</b> riyals. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Twenty-five percent, so twenty-five riyals. Simple.', 5200);
        el.append(UI.h('div', { html: SCENE6.ratioTable([100, 120], [25, 30], { rowA: 'price', rowB: 'discount', caption: '25 for every 100 riyals' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — the discount is 30 riyals, so you pay 90.', true], ['He is right — you pay 25 riyals.', false], ['You pay 120 riyals still.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. 25% of 120 is 30, and 120 − 30 = 90.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('A percent is an amount for every 100, not a number of riyals.', 'bad'))),
        }))); el.append(row);
      } },
  ],

  /* ── option hygiene ───────────────────────────────────────────────────────────────────────────────
     A round's `options` are built from the numbers the question drew, so a distractor can coincide with
     the answer (a fixed fallback that lands on the right value, or a formula that collapses when the two
     draws are equal). Two identical buttons would be a broken question, and the engine does not dedupe.
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
    { name: 'One cell', icon: '🪢', blurb: 'Total divided by cells.', rounds: 6, think: false,
      say: '🪢 Count all the cells, then divide.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const a = UI.rint(2, 4), b = UI.rint(2, 5);
        const cells = a + b, each = UI.rint(2, 8), total = cells * each;
        return {
          type: 'choice',
          prompt: G1.art(SCENE6.barModel6([{ n: a, label: 'first' }, { n: b, label: 'second' }], { totalLabel: `${total} shared in ${cells} equal cells` }),
            `<b>${total}</b> is shared <b>${a} : ${b}</b>. What is the <b>${a}</b>-part worth?`),
          options: [String(a * each), String(total / 2), String(b * each)],
          answer: String(a * each),
          why: (v) => Number(v) === b * each ? 'That is the other part. Count the cells of the part asked for.' : 'Half the total is only right when the ratio is 1 : 1.',
          hints: [`The tape has ${a} + ${b} = ${cells} cells.`, `${total} ÷ ${cells} = ${each} per cell.`, `Multiply ${each} by ${a}.`],
          solution: `${total} ÷ ${cells} = ${each} per cell, and ${a} × ${each} = <b>${a * each}</b>.`,
        };
      } },
    { name: 'From a part', icon: '🔎', blurb: 'One part known, whole unknown.', rounds: 6, think: false,
      say: '🔎 Find one cell from the part you were given.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const a = UI.rint(2, 4), b = UI.rint(2, 5);
        const each = UI.rint(2, 7), cells = a + b;
        const part = a * each;
        return {
          type: 'choice',
          prompt: G1.art(SCENE6.barModel6([{ n: a, label: `= ${part}` }, { n: b, label: '?' }], { totalLabel: 'the whole tape' }),
            `The <b>${a}</b>-part is worth <b>${part}</b>, and the ratio is <b>${a} : ${b}</b>. What is the whole?`),
          options: [String(cells * each), String(part + b), String(part * 2)],
          answer: String(cells * each),
          why: (v) => Number(v) === part + b ? 'You added the cells to the value. Each cell is worth the same amount.' : 'Doubling works only for a 1 : 1 ratio.',
          hints: [`One cell is ${part} ÷ ${a} = ${each}.`, `There are ${cells} cells altogether.`, `Multiply ${each} by ${cells}.`],
          solution: `One cell = ${each}; the whole = ${cells} × ${each} = <b>${cells * each}</b>.`,
        };
      } },
    { name: 'Percent share', icon: '💯', blurb: 'A percent applied to a price.', rounds: 6, think: true,
      say: '💯 Think first: what does the percent apply to?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const price = [40, 80, 120, 200, 240][i % 5];
        const pct = [10, 25, 50][i % 3];
        const off = (price * pct) / 100;
        return {
          type: 'choice',
          problem: {
            sentences: ['A co-operative sells a sack of dates at a marked price.',
              'The winter card offers a discount on every sack.',
              `The price is ${price} riyals and the discount is ${pct}%.`],
            question: 2, keys: ['price'], extras: [1],
          },
          prompt: `A sack costs <b>${price}</b> riyals with <b>${pct}%</b> off. What do you <b>pay</b>?`,
          options: [String(price - off), String(off), String(price)],
          answer: String(price - off),
          why: (v) => Number(v) === off ? 'That is the discount. The question asks what you pay after it.' : 'The price changes once the discount is applied.',
          hints: [`${pct}% of ${price} is ${off}.`, 'Take that away from the marked price.', `${price} − ${off}.`],
          solution: `Discount ${off}, so you pay ${price} − ${off} = <b>${price - off}</b> riyals.`,
        };
      } },
  ],

  ghubar: ['Share it in half, it is always fair.', 'The percent is the money you pay.', 'One cell can be bigger than another.'],
  praise: ['Cell found!', 'Whole rebuilt!', 'Share checked!', 'Paid the right price!'],
  finale: 'Every cell equal, every part fair — you can share in a ratio. 🪢',
};

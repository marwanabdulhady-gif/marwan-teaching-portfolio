/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 6 · Date Rate · unit rate, ratio tables and percent as a rate per 100
   Source: G06-U01-MATH-L02 (CCSS 6.RP.A.1, 6.RP.A.2 & 6.RP.A.3), term 1, unit 01
   النمو والانتشار — the date market: price per kilogram, kilometres per hour, and part per hundred.
   Mechanic = the thinking: two carts sell the same dates in different pack sizes at different totals. The
   child finds the price of ONE, then answers a question about a different quantity. Level 1 finds the unit
   rate; level 2 completes a ratio table by scaling from the unit rate; level 3 reads a percent as a rate
   per 100 (a discount, and the honest price after it). The carts show pack size and total, never the
   per-unit price.
   Named misconceptions: «a bigger total is a better rate», and «percent means the number of riyals».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g6-date-rate', code: 'G06-U01-MATH-L02', title: 'Date Rate', emoji: '🎯',
  accent: '#8a5a1c', accentDeep: '#744a15', skyA: '#fdf8ef', skyB: '#f1e0c2',
  topic: 'Unit rate, ratio tables and percent', band: 'g68', lang: 'en',
  objective: 'I can find a <b>unit rate</b>, use it to complete a ratio table, and read a percent as a rate per 100.',
  welcome: 'Two carts, different pack sizes. Which dates give more for your riyal? 🎯',
  learnBlurb: 'A unit rate tells you the amount for ONE. 12 riyals for 3 kg is 4 riyals per kilogram.',
  how: {
    what: 'Divide the total by the quantity to get the amount for one. Then multiply by the quantity you need. A percent is just a rate per 100.',
    steps: ['🎯 Divide the total by the quantity to reach one.', 'Use that one to build the quantity you need.', '✅ A percent is the amount for every 100.'],
  },

  learn: [
    { say: 'Cart A sells <b>3 kg</b> for <b>12</b> riyals. If 3 kg cost 12, then 1 kg costs 12 ÷ 3 = <b>4</b> riyals.',
      draw(el) { el.append(UI.h('div', { html: SCENE6.unitRateCart({ n: 3, price: '12', label: 'Cart A' }, { n: 5, price: '20', label: 'Cart B' }, { caption: 'same dates, different packs' }) })); } },
    { say: 'Cart B sells <b>5 kg</b> for <b>20</b> riyals — that is also <b>4</b> riyals per kilogram. Same rate, so neither is a bargain.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE6.ratioTable([3, 5, 8], [12, 20, 32], { rowA: 'kg', rowB: 'riyals', caption: 'every column costs the same per kg' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '3 kg → 12 · 5 kg → 20 · 8 kg → 32. Divide by the kg to compare.' }));
      } },
    { say: 'Your turn. <b>4 kg</b> of dates cost <b>28</b> riyals. What is the price of one kilogram?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE6.unitRateCart({ n: 4, price: '28', label: 'one cart' }, { n: 7, price: '?', label: 'seven kg' }, { caption: 'what does seven kg cost?' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['7', true], ['24', false], ['4', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 28 ÷ 4 = 7 riyals for one kilogram.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '24' ? '28 − 4 takes away the pack, not the price. Divide.' : 'You divided the wrong way. Split the total among the kilograms.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says the 7 kg pack at 49 riyals is the better deal than 4 kg at 28 riyals, because 49 is more. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('More riyals, more dates. Bigger pack, better deal.', 5200);
        el.append(UI.h('div', { html: SCENE6.unitRateCart({ n: 4, price: '28', label: '4 kg pack' }, { n: 7, price: '49', label: '7 kg pack' }, { caption: 'compare the price of one kilogram' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — both cost 7 riyals per kg, so neither is cheaper.', true], ['He is right — 49 is a bigger number.', false], ['The 4 kg pack must be cheaper.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. 28 ÷ 4 = 7 and 49 ÷ 7 = 7 — the same unit rate.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('The total alone cannot decide. Find the price of one kilogram first.', 'bad'))),
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
    { name: 'Price for one', icon: '🎯', blurb: 'Divide to reach the unit rate.', rounds: 6, think: false,
      say: '🎯 Divide the total by the quantity.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const n = UI.rint(2, 6), rate = UI.rint(3, 9), total = n * rate;
        return {
          type: 'choice',
          prompt: G1.art(SCENE6.unitRateCart({ n, price: String(total), label: 'one cart' }, { n: n + 2, price: '?', label: 'a bigger pack' }, { caption: 'find the price of one kilogram' }),
            `<b>${n} kg</b> of dates cost <b>${total}</b> riyals. What does <b>1 kg</b> cost?`),
          options: [String(rate), String(total - n), String(total + n)],
          answer: String(rate),
          why: (v) => Number(v) === total - n ? `Subtracting ${n} removes the kilograms, not the price. Divide instead.` : 'Divide the total by the number of kilograms.',
          hints: [`The total is ${total}.`, `There are ${n} kilograms.`, `Share ${total} equally into ${n} parts.`],
          solution: `${total} ÷ ${n} = <b>${rate}</b> riyals per kilogram.`,
        };
      } },
    { name: 'Fill the table', icon: '🧮', blurb: 'Use the unit rate to scale.', rounds: 6, think: false,
      say: '🧮 Go through one, then up to the amount asked.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const rate = UI.rint(3, 9), k = UI.rint(2, 5), ask = k + UI.rint(1, 3);
        return {
          type: 'choice',
          prompt: G1.art(SCENE6.ratioTable([k, ask], [k * rate, ask * rate], { rowA: 'kg', rowB: 'riyals', askCol: 1, caption: 'one column is missing' }),
            `<b>${k} kg</b> cost <b>${k * rate}</b> riyals. What do <b>${ask} kg</b> cost?`),
          options: [String(ask * rate), String(ask * rate + rate), String(k * rate + ask)],
          answer: String(ask * rate),
          why: (v) => Number(v) === k * rate + ask ? 'You added the kilograms to the price. Multiply the unit rate instead.' : 'That is one kilogram too many — count the kilograms carefully.',
          hints: [`Find the price of one kilogram: ${k * rate} ÷ ${k} = ${rate}.`, `Now multiply ${rate} by ${ask}.`, 'Every kilogram costs the same.'],
          solution: `${rate} per kg × ${ask} kg = <b>${ask * rate}</b> riyals.`,
        };
      } },
    { name: 'Rate per hundred', icon: '📉', blurb: 'A percent in the market.', rounds: 6, think: true,
      say: '📉 Think first: percent is the amount for every 100.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const price = [40, 60, 80, 120, 200][i % 5];
        const pct = [10, 20, 25, 50][i % 4];
        const off = (price * pct) / 100;
        return {
          type: 'choice',
          problem: {
            sentences: ['The date co-operative prints its winter prices on a card.',
              'A 1 kg box is marked with the price before the discount.',
              `The card offers ${pct}% off every box.`],
            question: 2, keys: ['price', 'off'], extras: [],
          },
          prompt: `A box costs <b>${price}</b> riyals and has <b>${pct}%</b> off. How many riyals is the discount?`,
          options: [String(off), String(price - off), String(pct)],
          answer: String(off),
          why: (v) => Number(v) === price - off ? 'That is the price you pay after the discount, not the discount itself.' : 'A percent is the amount for every 100 riyals, not the number of riyals.',
          hints: [`${pct}% means ${pct} for every 100.`, `The price is ${price}, so scale ${pct}/100 to it.`, `${price} × ${pct}/100.`],
          solution: `${price} × ${pct}/100 = <b>${off}</b> riyals off, leaving ${price - off}.`,
        };
      } },
  ],

  ghubar: ['The bigger total is the better deal.', 'Percent is the number of riyals.', 'Subtract the pack size to find the rate.'],
  praise: ['Rate found!', 'Table filled!', 'Discount read!', 'One for every hundred!'],
  finale: 'You can compare any two deals by finding the price of one. 🎯',
};

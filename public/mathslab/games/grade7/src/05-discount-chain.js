/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 7 · Discount Chain · multi-step percent: a percent of increase, a percent of decrease, and two
   percentages applied one after the other
   Source: G07-U02-MATH-L02 (CCSS 7.RP.A.3), term 2 — النسب والعلاقات التناسبية ومعدل التغير الثابت.

   SCOPE — the lesson's own warning is the spine of level 3: «التخفيضات المتتالية لا تعني خصمًا إجماليًا
   بـ 30%، بل تعادل خصمًا حقيقيًا قدره 28%». The game builds exactly that comparison and never lets the
   learner add the two percentages. RP.A.1–2 (the constant itself) belongs to game 01 and is not repeated.

   Named misconceptions: «20% then 10% is 30%», «the percent is the money you pay», «a 25% increase then a
   25% decrease returns to the start».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g7-discount-chain', code: 'G07-U02-MATH-L02', title: 'Discount Chain', emoji: '🏷️',
  accent: '#8a5a1c', accentDeep: '#6d4614', skyA: '#fdf7ee', skyB: '#f4e6cf',
  topic: 'Multi-step percent problems', band: 'g68', lang: 'en',
  objective: 'I can apply a <b>percent increase or decrease</b>, and I know two discounts in a row are not their sum.',
  welcome: 'The winter card stacks two offers. Work out what you really pay — one discount at a time. 🏷️',
  learnBlurb: 'Each percent applies to the NEW amount, not the marked price.',
  how: {
    what: 'A percent of change always applies to the amount you have at that moment. After the first discount the price has already fallen, so the second percent works on the smaller number.',
    steps: ['🏷️ Apply the first percent to the marked price.', 'Take that answer as the new price.', '✅ Apply the second percent to the NEW price.'],
  },

  learn: [
    { say: 'A sack is marked <b>200</b> riyals. A <b>20%</b> offer takes 40 off, so it now costs <b>160</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE7.priceStack({ steps: [{ label: '20% offer', pct: 20 }], startLabel: '200 riyals', caption: 'the discount is 40' }) })); } },
    { say: 'A second card takes <b>10%</b> off what is left, so 10% of <b>160</b> = 16. You pay 160 − 16 = <b>144</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE7.priceStack({ steps: [{ label: '20% offer', pct: 20 }, { label: '10% card', pct: 10 }], startLabel: '200 riyals', caption: 'the second percent works on 160, not 200' }) })); } },
    { say: 'So the real fall is 200 → 144, which is <b>28%</b> — not 30%. Adding the two percentages overstates it.',
      draw(el) { el.append(UI.h('div', { html: SCENE7.priceStack({ steps: [{ label: '20% offer', pct: 20 }, { label: '10% card', pct: 10 }], startLabel: 'marked', caption: '0.8 × 0.9 = 0.72, so 28% comes off' }) })); } },
    { say: 'Your turn. A table costs <b>150</b> riyals and is reduced by <b>20%</b>, then that price by a further <b>20%</b>. What do you pay?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE7.priceStack({ steps: [{ label: 'weekend', pct: 20 }, { label: 'clearance', pct: 20 }], startLabel: '150 riyals', caption: 'two separate 20% reductions' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['96', true], ['90', false], ['120', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 150 → 120 → 96.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '90' ? 'That is 40% off in one step. The second 20% is of 120, not of 150.' : 'Apply the first discount before the second.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says <b>20%</b> then <b>10%</b> is the same as <b>30%</b> off. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Twenty and ten, that is thirty. Same thing.', 5200);
        el.append(UI.h('div', { html: SCENE7.priceStack({ steps: [{ label: '20%', pct: 20 }, { label: '10%', pct: 10 }], startLabel: '100 riyals', caption: 'start at 100 so the comparison is clean' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — on 100 riyals you pay 72, so the real discount is 28%.', true], ['He is right — you pay 70.', false], ['The order does not matter because it is always 30%.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. 0.8 × 0.9 = 0.72, a real 28% fall.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('The second percent is of the reduced price, not the marked price.', 'bad'))),
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
        const alt = [v + 1, v - 1, v + 10, v + 2, v * 2 + 1].find((c) => {
          const cand = s.replace(num[0], String(c));
          return c > 0 && !seen.has(cand) && cand !== ans;
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
    { name: 'One percent', icon: '🏷️', blurb: 'A single percent of change.', rounds: 6, think: false,
      say: '🏷️ Decide first: is the price going up or down?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const price = [40, 80, 120, 160, 200, 250][i % 6];
        const pct = [10, 15, 20, 25][i % 4];
        const up = i % 2 === 0;
        const delta = (price * pct) / 100;
        const ans = up ? price + delta : price - delta;
        return {
          type: 'choice',
          prompt: G1.art(SCENE7.priceStack({ steps: [{ label: `${pct}% ${up ? 'rise' : 'cut'}`, pct }], startLabel: `${price} riyals`, caption: up ? 'the price goes up' : 'the price comes down' }),
            `A jacket costs <b>${price}</b> riyals. The price then ${up ? 'rises' : 'falls'} by <b>${pct}%</b>. What is the new price?`),
          options: [String(ans), String(delta), String(price)],
          answer: String(ans),
          why: (v) => Number(v) === delta ? 'That is the change on its own. The question asks for the new price.' : 'The marked price cannot stay the same after a change is applied.',
          hints: [`${pct}% of ${price} is ${delta}.`, up ? 'Add it to the price.' : 'Take it away from the price.', `${price} ${up ? '+' : '−'} ${delta}.`],
          solution: `${pct}% of ${price} = ${delta}, so the new price is ${price} ${up ? '+' : '−'} ${delta} = <b>${ans}</b> riyals.`,
        };
      } },
    { name: 'Chain two', icon: '🪜', blurb: 'Two percentages, one after the other.', rounds: 6, think: false,
      say: '🪜 The second percent applies to the new amount.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const price = [100, 200, 240, 400][i % 4];
        const p1 = [20, 25][i % 2], p2 = [10, 20, 50][i % 3];
        const after1 = price * (1 - p1 / 100);
        const ans = after1 * (1 - p2 / 100);
        const summed = price * (1 - (p1 + p2) / 100);
        return {
          type: 'choice',
          prompt: G1.art(SCENE7.priceStack({ steps: [{ label: `${p1}%`, pct: p1 }, { label: `${p2}%`, pct: p2 }], startLabel: `${price} riyals`, caption: 'each percent is of what is left' }),
            `A price of <b>${price}</b> riyals is cut by <b>${p1}%</b>, then the result is cut by <b>${p2}%</b>. What do you pay?`),
          options: [String(ans), String(summed), String(price - (price * p1) / 100)],
          answer: String(ans),
          why: (v) => Number(v) === summed ? `That adds the two percentages. The second ${p2}% is of ${after1}, not of ${price}.` : 'That stops after the first cut — there is a second one.',
          hints: [`${price} after ${p1}% is ${after1}.`, `Now take ${p2}% of ${after1}.`, `${after1} − ${(after1 * p2) / 100}.`],
          solution: `${price} → ${after1} → <b>${ans}</b> riyals. The real fall is ${Math.round((1 - ans / price) * 100)}%, not ${p1 + p2}%.`,
        };
      } },
    { name: 'Real percent', icon: '🔍', blurb: 'What the chain really costs.', rounds: 6, think: true,
      say: '🔍 Think first: what is the single equivalent percent?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const p1 = [10, 20, 25][i % 3], p2 = [10, 20][i % 2];
        const price = 100;
        const keep = (1 - p1 / 100) * (1 - p2 / 100);
        const real = Math.round((1 - keep) * 100);
        return {
          type: 'choice',
          problem: {
            sentences: ['A shop advertises two reductions, one after the other.',
              'A shopper claims the two percentages can simply be added.',
              `The reductions are ${p1}% and ${p2}%, applied in that order to a marked price of ${price} riyals.`],
            question: 2, keys: ['reductions', 'shopper'], extras: [1],
          },
          prompt: G1.art(SCENE7.priceStack({ steps: [{ label: `${p1}%`, pct: p1 }, { label: `${p2}%`, pct: p2 }], startLabel: '100 riyals', caption: 'a single equivalent discount' }),
            `Applied in turn to 100 riyals, what is the <b>single</b> equivalent discount?`),
          options: [`${real}%`, `${p1 + p2}%`, `${Math.round(real / 2)}%`],
          answer: `${real}%`,
          why: (v) => String(v) === `${p1 + p2}%` ? 'Adding the percentages ignores that the second one works on a smaller price.' : 'Multiply the two remaining fractions: it is not half of anything.',
          hints: [`After ${p1}% you keep ${100 - p1}% of the price.`, `After ${p2}% of that you keep ${Math.round(keep * 100)}%.`, 'The discount is what you did not keep.'],
          solution: `0.${String(100 - p1).padStart(2, '0').slice(-2)} × 0.${String(100 - p2).padStart(2, '0').slice(-2)} ≈ ${keep.toFixed(2)}, so the real discount is <b>${real}%</b>.`,
        };
      } },
  ],

  ghubar: ['Twenty and ten make thirty percent off.', 'The percent is the amount you pay.', 'A rise then the same fall brings you back.'],
  praise: ['New price found!', 'Chain worked!', 'Real percent found!', 'Order respected!'],
  finale: 'Each percent lands on the price it meets — never add them up. 🏷️',
};

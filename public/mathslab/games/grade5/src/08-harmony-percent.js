/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 5 · Harmony Percent · percentages, fractions and decimals in a chemical mixture
   Source: G05-U03-L13 (CCSS 5.NF.B.4, 5.NF.B.5 & 5.NBT.B.7), term 2, unit 03, v3 approved bundle.
   Mechanic = the thinking: a local salinisation mixture is written three ways at once — a percent, a
   fraction and a decimal — and every one of them must describe the same quantity. Level 1 converts a
   percent to a fraction in lowest terms, level 2 converts and compares, level 3 finds a percent of a
   measured volume in a lab story. The twenty-cell bar carries the percent without printing the fraction.
   Named misconception: «percent means per ten» and «0.4% = 0.4». This is arithmetic on a labelled mixture;
   the game does not offer any medical, agricultural or dosing advice.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g5-harmony-percent', code: 'G05-U03-L13', title: 'Harmony Percent', emoji: '💧',
  accent: '#1f7a63', accentDeep: '#186450', skyA: '#effaf7', skyB: '#cdeee4',
  topic: 'Percent, fraction and decimal', band: 'g35', lang: 'en',
  objective: 'I can write a <b>percent</b> as a fraction and a decimal, and find a percent of a quantity.',
  welcome: 'A mixture is written three ways at once — percent, fraction, decimal. All three must agree. 💧',
  learnBlurb: 'Per cent means per hundred. So 35% is 35/100, which is 0.35.',
  how: {
    what: 'A percent is a fraction with denominator 100. Write the percent over 100, simplify the fraction, and read the decimal from the hundredths place.',
    steps: ['💧 Write the percent over 100.', '💧 Simplify the fraction by dividing both parts.', '✅ Move the point two places left for the decimal.'],
  },

  learn: [
    { say: 'This bar is cut into <b>twenty</b> equal cells, five cells to every twenty percent. The shaded part reaches <b>60%</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE5.percentBar(60, { caption: '60% = 60 of 100 = 0.60' }) })); } },
    { say: 'Sixty percent is <b>60/100</b>, and that simplifies to <b>3/5</b>. As a decimal it is <b>0.6</b> — three names, one quantity.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE5.percentBar(60, { caption: '60% = 3/5 = 0.6' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '60 ÷ 100 = 0.6 · 60/100 ÷ 20 = 3/5' }));
      } },
    { say: 'Your turn. A mixture is <b>25%</b> salt solution. Which fraction is that in lowest terms?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE5.percentBar(25, { caption: 'one quarter of the whole' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['1/4', true], ['1/25', false], ['25/10', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 25/100 simplifies to 1/4.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '1/25' ? 'The percent goes over 100, not under the percent sign.' : 'That is more than one whole — 25% is less than half.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says <b>7%</b> is <b>0.7</b> because you drop the percent sign. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Seven percent, seven tenths. Just take the sign away.', 5200);
        el.append(UI.h('div', { html: SCENE5.percentBar(7, { caption: 'seven cells of a hundred' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — 7% = 0.07, two places left.', true], ['He is right — 0.7.', false], ['It is 7.0.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — per hundred means two places, so 0.07.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('0.7 is seventy percent. Seven percent must be much smaller.', 'bad'))),
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
    { name: 'Three names', icon: '💧', blurb: 'Percent → fraction in lowest terms.', rounds: 6, think: false,
      say: '💧 Put it over 100 and simplify.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const pct = [20, 25, 40, 50, 60, 75, 80, 10][i % 8];
        const g = (a, b) => (b ? g(b, a % b) : a);
        const d = g(pct, 100);
        const answer = `${pct / d}/${100 / d}`;
        return {
          type: 'choice',
          prompt: G1.art(SCENE5.percentBar(pct, { max: 400, caption: `${pct}% of the whole` }), `Write <b>${pct}%</b> as a fraction in lowest terms.`),
          options: [answer, `${pct}/10`, `${100}/${pct}`],
          answer,
          why: (v) => v === `${pct}/10` ? 'A percent goes over 100, not over 10. "Per cent" means per hundred.' : 'Every percent is a fraction with denominator 100.',
          hints: [`${pct}% means ${pct} out of 100.`, `Write ${pct}/100 first.`, `Divide both parts by ${d}.`],
          solution: `${pct}% = ${pct}/100 = <b>${answer}</b>.`,
        };
      } },
    { name: 'Compare the labels', icon: '⚖', blurb: 'Which is greater — percent or decimal?', rounds: 6, think: false,
      say: '⚖ Turn both into decimals before you decide.',
      round() { return GAME.fixOpts(this.roundRaw()); },
      roundRaw() {
        const pct = [15, 42, 8, 63, 27, 91][UI.rint(0, 5)];
        const dec = +(UI.rint(2, 95) / 100).toFixed(2);
        const pv = pct / 100;
        const hi = Math.max(pv, dec);
        return {
          type: 'choice',
          prompt: `Which is greater: <b>${pct}%</b> or <b>${dec}</b>?`,
          options: [`${pct}%`, String(dec), 'They are equal.'],
          answer: hi === pv ? `${pct}%` : String(dec),
          why: () => `${pct}% = ${pv}. Compare ${pv} with ${dec} place by place.`,
          hints: [`Write ${pct}% as a decimal.`, `${pct} ÷ 100 = ${pv}.`, `Compare ${pv} and ${dec}.`],
          solution: `${pct}% = ${pv}, so <b>${hi === pv ? pct + '%' : dec}</b> is greater.`,
        };
      } },
    { name: 'Lab measure', icon: '🧪', blurb: 'Find a percent of a volume.', rounds: 6, think: true,
      say: '🧪 Think first: what is the whole?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const pct = [10, 20, 25, 50][i % 4];
        const whole = UI.rint(4, 40) * 10;
        const answer = (pct / 100) * whole;
        return {
          type: 'choice',
          problem: {
            sentences: ['The science club tests water from the school garden.',
              'The samples are labelled before they go to the lab.',
              `A jar holds ${whole} millilitres of mixture.`,
              `${pct}% of it is salt solution.`,
              'How many millilitres of salt solution are in the jar?'],
            question: 4, keys: ['millilitres', 'percent'], extras: [1],
          },
          prompt: `<b>${pct}%</b> of <b>${whole}</b> ml — how much is the salt solution?`,
          options: [`${answer} ml`, `${whole - answer} ml`, `${pct} ml`],
          answer: `${answer} ml`,
          why: (v) => v === `${whole - answer} ml` ? 'That is the rest of the jar — you were asked for the salt solution itself.'
            : `${pct}% means ${pct} out of every 100. Find 1% first, then multiply.`,
          hints: [`1% of ${whole} = ${whole / 100} ml.`, `Then multiply by ${pct}.`, `Or write ${pct}/100 × ${whole}.`],
          solution: `${pct}/100 × ${whole} = <b>${answer} ml</b>.`,
        };
      } },
  ],

  ghubar: ['Percent means per ten.', '7% is 0.7 once you drop the sign.', 'A bigger percent always means a bigger amount.'],
  praise: ['Lowest terms found!', 'Labels compared!', 'Lab measured!', 'Per hundred, always!'],
  finale: 'Percent, fraction, decimal — three names, one quantity. 💧',
};

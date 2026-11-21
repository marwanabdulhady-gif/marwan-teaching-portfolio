/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 6 · Water Divide · dividing fractions by fractions, with the water-works story
   Source: G06-U01-MAT-L02 (CCSS 6.NS.A.1), term 1, unit 01 — قسمة الكسور الاعتيادية وحل المسائل الواقعية
   بالنماذج الشريطية. The lesson's own frame is «كم مجموعة من المقدار b توجد داخل المقدار a؟»
   Mechanic = the thinking: the question is never "flip and multiply" — it is "how many groups of this fit
   inside that?" A bar of a equal parts is drawn, and one group of b is marked beneath it. Level 1 counts how
   many groups fit; level 2 works with a mixed number dividend; level 3 is a real water-rationing story.
   The bar shows the cells, never the quotient.
   Named misconceptions: «divide means always get smaller», and «flip only one fraction, the wrong one».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g6-water-divide', code: 'G06-U01-MAT-L02', title: 'Water Divide', emoji: '💧',
  accent: '#1d6f8c', accentDeep: '#175a72', skyA: '#eef9fd', skyB: '#cfe9f4',
  topic: 'Dividing fractions', band: 'g68', lang: 'en',
  objective: 'I can divide a fraction by a fraction by asking <b>how many groups fit</b>, and check with the model.',
  welcome: 'A tank is rationed into shares. How many shares fit inside it? 💧',
  learnBlurb: 'Dividing asks how many groups of one size fit into another. The model answers it.',
  how: {
    what: 'To divide by a fraction, ask how many of those groups fit in the amount you have. Draw both on the same bar and count. Multiplying by the reciprocal is the shortcut that records the count.',
    steps: ['💧 Draw the amount you have as equal parts.', 'Mark one group of the size you are dividing by.', '✅ Count the groups — that is the quotient.'],
  },

  learn: [
    { say: 'How many <b>1/4</b> fit in <b>3/4</b>? Draw three quarters and mark one quarter: exactly <b>3</b> groups fit.',
      draw(el) { el.append(UI.h('div', { html: SCENE6.fitModel(3, 1, { aName: '3/4 of the tank', bName: 'one share of 1/4' }) })); } },
    { say: 'The shortcut records the same count: 3/4 ÷ 1/4 = 3/4 × 4/1 = <b>3</b>. The model shows why, the reciprocal just writes it down.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE6.barModel6([{ n: 3, label: 'three quarters' }], { totalLabel: 'each cell is 1/4' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '3/4 ÷ 1/4 = 3/4 × 4/1 = <b>3</b> — three shares fit.' }));
      } },
    { say: 'Your turn. How many <b>1/2</b> fit inside <b>2</b> whole tanks?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE6.fitModel(4, 1, { aName: 'two whole tanks = four halves', bName: 'one share of 1/2' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['4', true], ['1', false], ['2', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — each tank holds two halves, so two tanks hold four.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '1' ? 'Dividing does not always make it smaller. Count the halves.' : 'Each tank is two halves — count both tanks.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says <b>1/2 ÷ 1/8</b> is <b>4</b> because 8 − 2 = 6 and he halved it. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('One half and one eighth. Half of eight is four.', 5200);
        el.append(UI.h('div', { html: SCENE6.fitModel(4, 1, { aName: 'one half = 4 eighths', bName: 'one group of 1/8' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — 1/2 ÷ 1/8 = 4, but because eight eighths make a whole, not because of the subtraction.', true], ['He is right, and the reason is the subtraction.', false], ['It is 8, not 4.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right answer, wrong reason — the model counts eighths, it does not subtract.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('A whole is eight eighths, so one half is four eighths. Count them.', 'bad'))),
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
    { name: 'How many fit', icon: '💧', blurb: 'Count the groups.', rounds: 6, think: false,
      say: '💧 Count how many groups of the second size fit inside the first.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        /* the tank is cut into b equal cells, each worth 1/b. You hold a of those cells, and each group you
           are dividing by is exactly one cell — so the number of groups IS the number of cells you hold. */
        const b = [3, 4, 5, 6][i % 4];
        const a = UI.rint(1, b - 1);           /* a proper fraction a/b, so the label stays honest */
        const ans = String(a);
        return {
          type: 'choice',
          prompt: G1.art(SCENE6.fitModel(a, 1, { aName: `${a}/${b} of the tank`, bName: `one share of 1/${b}` }),
            `How many <b>1/${b}</b> fit inside <b>${a}/${b}</b>?`),
          options: [ans, String(b - a), String(a * b)],
          answer: ans,
          why: (v) => Number(v) === b - a ? 'That counts the cells you do not hold. Count the ones the bar shows.' : 'That multiplies instead of counting the cells.',
          hints: [`The tank is cut into ${b} equal parts.`, `You hold ${a} of them.`, `Each group is one part — count the parts in the bar.`],
          solution: `${a}/${b} ÷ 1/${b} = <b>${a}</b> group${a === 1 ? '' : 's'}.`,
        };
      } },
    { name: 'Mixed amounts', icon: '🪣', blurb: 'A whole number and a fraction.', rounds: 6, think: false,
      say: '🪣 Turn the whole into the same fractional units first.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const b = [3, 4, 6][i % 3];
        const whole = UI.rint(1, 2);
        /* keep the total in cells even, so groups of two cells divide exactly and the answer is whole */
        const extra = UI.rint(1, b - 1);
        let totalParts = whole * b + extra;
        if (totalParts % 2) totalParts += 1;
        const groups = totalParts / 2;
        /* re-split the (possibly bumped) total into a proper mixed number — never b/b or an improper part */
        const w2 = Math.floor(totalParts / b), r2 = totalParts % b;
        const a = r2 ? `${w2} ${r2}/${b}` : `${w2}`;
        return {
          type: 'choice',
          prompt: G1.art(SCENE6.fitModel(totalParts, 2, { aName: `${a} of the tank`, bName: `one share of 2/${b}` }),
            `How many <b>2/${b}</b> fit inside <b>${a}</b>?`),
          options: [String(groups), String(totalParts), String(w2 + r2)],
          answer: String(groups),
          why: (v) => Number(v) === totalParts ? `That is how many 1/${b} pieces there are, but each group takes 2 of them.` : 'Convert the whole number into the same fractional parts first.',
          hints: [`${w2} whole = ${w2 * b}/${b}.`, `The tank holds ${totalParts}/${b} in all.`, `Each group is 2 of those parts, so divide by 2.`],
          solution: `${a} = ${totalParts}/${b}, and ${totalParts}/${b} ÷ 2/${b} = <b>${groups}</b> group${groups === 1 ? '' : 's'}.`,
        };
      } },
    { name: 'Rationing', icon: '⏱', blurb: 'A real share-out story.', rounds: 6, think: true,
      say: '⏱ Think first: what is one share, and what is the total?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const share = [2, 4, 5][i % 3];
        const groups = UI.rint(3, 6);
        const total = share * groups;
        return {
          type: 'choice',
          problem: {
            sentences: ['A neighbourhood tank is being rationed during a repair.',
              'Each household may take one fixed scoop of water.',
              `The tank holds ${total} litres and each household takes ${share} litres.`],
            question: 2, keys: ['tank', 'household'], extras: [1],
          },
          prompt: `A tank holds <b>${total}</b> litres and each household takes <b>${share}</b>. How many households can fill?`,
          options: [String(groups), String(total - share), String(share)],
          answer: String(groups),
          why: (v) => Number(v) === total - share ? 'Subtracting one scoop does not count the households.' : 'That is one share, not the number of shares that fit.',
          hints: [`Each household takes ${share} litres.`, `How many groups of ${share} are in ${total}?`, `Divide ${total} by ${share}.`],
          solution: `${total} ÷ ${share} = <b>${groups}</b> households.`,
        };
      } },
  ],

  ghubar: ['Dividing always makes the answer smaller.', 'Flip whichever fraction is closest.', 'Subtract the fraction instead of counting groups.'],
  praise: ['Groups counted!', 'Mixed amount converted!', 'Households filled!', 'Model and shortcut agree!'],
  finale: 'Dividing a fraction means counting how many fit — you can see why. 💧',
};

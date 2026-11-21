/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 5 · Oud Majlis · adding and subtracting fractions with unlike denominators, and multiplying fractions
   Source: G05-U02-MATH-L02 (CCSS 5.NF.A.1, 5.NF.A.2 & 5.NF.B.4), term 2, unit 02.
   Mechanic = the thinking: the lesson's «جمع اللغة المشتركة» strategy — turn every fraction into a common
   language (a common denominator) one step at a time, and the area model of a rectangle for the product.
   Level 1 finds the common denominator, level 2 adds or subtracts, level 3 multiplies a fraction of a
   fraction on the area model. The worth of an oud's slot is the story hook, and the model never prints the
   result. Named misconception: «add the tops and the bottoms» (1/2 + 1/3 = 2/5).
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g5-oud-majlis', code: 'G05-U02-MATH-L02', title: 'Oud Majlis', emoji: '🫖',
  accent: '#8c3f6b', accentDeep: '#743357', skyA: '#fdf1f7', skyB: '#f2d8e7',
  topic: 'Unlike denominators and fraction products', band: 'g35', lang: 'en',
  objective: 'I can make a <b>common denominator</b> to add or subtract fractions, and multiply a fraction of a fraction.',
  welcome: 'The majlis coffee is poured in thirds, and the oud keeps quarters. First find a common language. 🫖',
  learnBlurb: 'You cannot add thirds and quarters until they speak the same denominator.',
  how: {
    what: 'Fractions with different denominators count different-sized parts. Rewrite both with one common denominator, then the numerators add.',
    steps: ['🫖 Find a common denominator for the two fractions.', '🫖 Rewrite each as an equivalent fraction.', '✅ Add or subtract only the numerators.'],
  },

  learn: [
    { say: 'Here is <b>1/2</b> and <b>1/3</b> of the same tray. The pieces are different sizes, so you cannot just add the tops.',
      draw(el) { el.append(UI.h('div', { html: SCENE3.fracPair(1, 2, 1, 3, { caption: 'different sized pieces' }) })); } },
    { say: 'Cut both into <b>sixths</b>: 1/2 becomes 3/6 and 1/3 becomes 2/6. Now the pieces match, so <b>3/6 + 2/6 = 5/6</b>.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE4.fracSum(3, 6, 2, { caption: '3/6 + 2/6 = 5/6' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: 'same denominator → add the tops only' }));
      } },
    { say: 'Your turn. What is <b>1/4 + 1/3</b>?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE3.fracPair(1, 4, 1, 3, { caption: 'twelfths suit both' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['7/12', true], ['2/7', false], ['1/12', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 3/12 + 4/12 = 7/12.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '2/7' ? 'You added the tops and the bottoms. The denominator is not a count of parts.' : 'Twelfths: 1/4 = 3/12 and 1/3 = 4/12.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says <b>1/2 × 1/3 = 1/5</b>, because a half and a third make a fifth. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Half plus a third, times — it is one fifth. The numbers just add.', 5200);
        el.append(UI.h('div', { html: SCENE5.fracArea(1, 2, 1, 3, { h: 320, max: 300 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — half of a third is one sixth.', true], ['He is right — 1/5.', false], ['It is 2/5.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. Of means multiply, and the overlap is one cell of six.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('You are taking a part of a part, so the answer must be smaller than a third.', 'bad'))),
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
    { name: 'Common language', icon: '🔗', blurb: 'Find the shared denominator.', rounds: 6, think: false,
      say: '🔗 The denominator must serve both fractions.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const pairs = [[2, 3], [3, 4], [2, 5], [4, 6], [3, 5], [2, 6], [4, 8], [6, 9]];
        const [a, b] = pairs[i % pairs.length];
        /* every pair in the list has two different denominators, so there is always a smallest shared one */
        let g = 1; for (let k = 1; k <= a && k <= b; k += 1) if (a % k === 0 && b % k === 0) g = k;
        const answer = (a * b) / g;
        return {
          type: 'choice',
          prompt: `What is the smallest common denominator for <b>1/${a}</b> and <b>1/${b}</b>?`,
          options: [String(answer), String(a * b), String(a + b)],
          answer: String(answer),
          why: (v) => Number(v) === a * b && a * b !== answer ? `That works, but it is not the smallest — ${a} and ${b} share a factor.` : 'List the multiples of each denominator and take the first one they share.',
          hints: [`Count up in ${a}s: ${a}, ${a * 2}, ${a * 3}…`, `Count up in ${b}s: ${b}, ${b * 2}, ${b * 3}…`, 'Take the first number in both lists.'],
          solution: `The smallest shared denominator is <b>${answer}</b>.`,
        };
      } },
    { name: 'Add the tops', icon: '➕', blurb: 'Rewrite, then add or subtract.', rounds: 6, think: false,
      say: '➕ Once the denominators match, only the tops move.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const sets = [[2, 3], [2, 5], [3, 4], [4, 6], [2, 5], [3, 6], [4, 8]];
        const [a, b] = sets[i % sets.length];
        let g = 1; for (let k = 1; k <= a && k <= b; k += 1) if (a % k === 0 && b % k === 0) g = k;
        const L2 = (a * b) / g;
        const add = i % 2 === 0;
        const topA = L2 / a, topB = L2 / b;
        const top = add ? topA + topB : Math.abs(topA - topB);
        const answer = `${top}/${L2}`;
        return {
          type: 'choice',
          prompt: G1.art(SCENE4.fracSum(topA, L2, topB, { max: 380, caption: add ? `1/${a} + 1/${b}` : `larger − smaller` }),
            add ? `<b>1/${a} + 1/${b}</b> = ?` : `<b>1/${a}</b> and <b>1/${b}</b> — what is the difference?`),
          options: [answer, `${add ? 2 : 0}/${a + b}`, `${add ? topA : topB}/${L2}`],
          answer,
          why: (v) => v.endsWith(`/${a + b}`) ? 'That is adding the tops and the bottoms — the pieces must be renamed first.'
            : `Rewrite with denominator ${L2}: ${topA}/${L2} and ${topB}/${L2}.`,
          hints: [`Use ${L2} as the denominator.`, `1/${a} = ${topA}/${L2} and 1/${b} = ${topB}/${L2}.`, add ? 'Add the two tops.' : 'Subtract the smaller top.'],
          solution: `<b>${answer}</b>.`,
        };
      } },
    { name: 'Clay and coffee', icon: '🫖', blurb: 'A fraction of a fraction.', rounds: 6, think: true,
      say: '🫖 Think first: "of" means multiply.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const dens = [[2, 3], [2, 4], [3, 4], [2, 5], [3, 5], [4, 5]];
        const [b, d] = dens[i % dens.length];
        const answer = `1/${b * d}`;
        return {
          type: 'choice',
          problem: {
            sentences: ['The potter decorates the courtyard of a majlis.',
              'The clay is mixed the night before.',
              `The courtyard is divided into ${d} equal strips.`,
              `She decorates one ${b === 2 ? 'half' : b === 3 ? 'third' : 'quarter'} of one strip.`,
              'What fraction of the whole courtyard does she decorate?'],
            question: 4, keys: ['fraction', 'decorates'], extras: [1],
          },
          prompt: G1.art(SCENE5.fracArea(1, b, 1, d, { h: 300, max: 280 }), `1/${b} of 1/${d}`) + `<b>1/${b} × 1/${d}</b> = ?`,
          options: [answer, `1/${b + d}`, `2/${b + d}`],
          answer,
          why: (v) => v === `1/${b + d}` ? '"Of" is multiplication, not addition — the strip is cut into d parts and you take a part of one.' : `The overlap covers 1 cell of ${b} × ${d} cells.`,
          hints: ['Draw the rectangle and cut it both ways.', `There are ${b} rows and ${d} columns.`, `Count the overlap: 1 cell of ${b * d}.`],
          solution: `<b>${answer}</b> of the courtyard.`,
        };
      } },
  ],

  ghubar: ['Add the tops and the bottoms.', 'Half of a third is a fifth.', 'A bigger denominator means a bigger piece.'],
  praise: ['Common language found!', 'Tops added!', 'Overlap counted!', 'Denominators agree!'],
  finale: 'Everything speaks the same denominator now — majlis fractions solved! 🫖',
};

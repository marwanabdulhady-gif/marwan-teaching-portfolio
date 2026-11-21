/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 6 · Falcon Ratio · equivalent ratios and the language of ratio
   Source: G06-U01-MAT-L01 (CCSS 6.RP.A.1, 6.RP.A.2 & 6.RP.A.3), term 1, unit 01
   الفلك والمواقيت — the falconer's mews: water to feed, part to part, part to whole.
   Mechanic = the thinking: a ratio is a *relationship*, not a subtraction. Two troughs are drawn with
   equal cells; the child reads how many cells of one to how many of the other, then scales the strip so
   the taste of the mixture does not change. Level 1 reads a part-to-part ratio off the strip; level 2
   builds an equivalent ratio by scaling both parts; level 3 turns a part-to-part ratio into a
   part-to-whole fraction. The strip never prints the ratio in words or numbers.
   Named misconceptions: «keeping a ratio means adding the same number to both parts», and
   «a ratio compares only the first terms».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g6-falcon-ratio', code: 'G06-U01-MAT-L01', title: 'Falcon Ratio', emoji: '🦅',
  accent: '#1f6f8b', accentDeep: '#175a72', skyA: '#eef8fb', skyB: '#cfe9f1',
  topic: 'Ratios and equivalent ratios', band: 'g68', lang: 'en',
  objective: 'I can describe a <b>ratio</b> part-to-part and part-to-whole, and make an equal ratio by scaling both parts.',
  welcome: 'A falconer mixes water and feed. Keep the mixture the same as the bowl grows. 🦅',
  learnBlurb: 'A ratio says how much of one thing for how much of another. 2 cups to 3 cups is 2 : 3.',
  how: {
    what: 'A ratio compares two quantities. Write the parts in the order the question names them. To keep the same ratio as the amounts grow, multiply (or divide) <b>both</b> parts by the same number.',
    steps: ['Count the equal cells of each part.', '🦅 Write them in the order asked — 2 : 3, never 3 : 2 by accident.', '✅ Scale both parts by the same number to make an equal ratio.'],
  },

  learn: [
    { say: 'Here are two troughs. Count the cells: <b>2</b> of water and <b>3</b> of feed. The ratio of water to feed is <b>2 : 3</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE6.tapeStrip([[2, 'water'], [3, 'feed']], { caption: 'water to feed' }) })); } },
    { say: 'Double <b>both</b> parts and the mixture tastes the same: <b>4 : 6</b>. Add 2 to both instead and you get 4 : 5 — a different drink.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE6.ratioTable([2, 4, 6], [3, 6, 9], { rowA: 'water', rowB: 'feed', caption: 'each column is the same mixture' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '2 : 3 = 4 : 6 = 6 : 9 — multiply both parts by the same number.' }));
      } },
    { say: 'Your turn. The strip is <b>3</b> water to <b>5</b> feed. Which ratio is the same mixture?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE6.tapeStrip([[3, 'water'], [5, 'feed']], { caption: 'water : feed' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['6 : 10', true], ['6 : 8', false], ['4 : 6', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — both parts doubled, so the mixture is unchanged.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '6 : 8' ? 'You doubled the water but added to the feed. Both parts scale.' : 'That adds 1 to each part. Equal ratios come from multiplying.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says <b>2 : 3</b> grows into <b>4 : 5</b> because each part went up by 2. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Add two to each part. Same mixture, bigger bowl.', 5200);
        el.append(UI.h('div', { html: SCENE6.tapeStrip([[2, 'water'], [5, 'feed']], { caption: 'what Ghubar built' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — 2 : 3 must become 4 : 6, not 4 : 5.', true], ['He is right — 4 : 5 is the same.', false], ['It does not matter, both have 4 parts.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. Addition changes the mixture; multiplication keeps it.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Count the cells: 4 water and 5 feed is not two for every three.', 'bad'))),
        }))); el.append(row);
      } },
  ],

  /* ── level 1: read a ratio off the strip ──────────────────────────────────────────────────────── */
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
    { name: 'Read the troughs', icon: '🦅', blurb: 'Count the cells, write the ratio.', rounds: 6, think: false,
      say: '🦅 Count the cells of each part before you answer.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const a = UI.rint(2, 4), b = UI.rint(2, 5);
        const bb = b === a ? b + 1 : b;
        return {
          type: 'choice',
          prompt: G1.art(SCENE6.tapeStrip([[a, 'water'], [bb, 'feed']], { caption: 'water and feed in the troughs' }),
            `What is the ratio of <b>water to feed</b>?`),
          options: [`${a} : ${bb}`, `${bb} : ${a}`, `${a} : ${a + bb}`],
          answer: `${a} : ${bb}`,
          why: () => `${bb} : ${a} reverses the order. ${a} : ${a + bb} is water to the whole mixture, not water to feed.`,
          hints: ['Count the water cells first.', 'Then count the feed cells.', 'Write them in the order the question names: water, then feed.'],
          solution: `There are ${a} water cells and ${bb} feed cells, so water : feed = <b>${a} : ${bb}</b>.`,
        };
      } },
    { name: 'Scale the mixture', icon: '🥤', blurb: 'Make an equal ratio.', rounds: 6, think: false,
      say: '🥤 Both parts scale by the same number.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const a = UI.rint(2, 5), b = UI.rint(2, 5);
        const bb = b === a ? b + 2 : b;
        const k = [2, 3, 4][i % 3];
        return {
          type: 'choice',
          prompt: G1.art(SCENE6.ratioTable([a, a * k], [bb, bb * k], { rowA: 'water', rowB: 'feed', askCol: 1, caption: 'the same mixture, scaled' }),
            `A mixture is <b>${a} : ${bb}</b>. Which ratio is the same mixture?`),
          options: [`${a * k} : ${bb * k}`, `${a * k} : ${bb + k}`, `${a + k} : ${bb + k}`],
          answer: `${a * k} : ${bb * k}`,
          why: (v) => v === `${a + k} : ${bb + k}` ? `That adds ${k} to each part — addition changes the mixture.` : `Only one part was scaled. Multiply both parts by ${k}.`,
          hints: [`Look for a multiplier of ${a} and ${bb}.`, `Try multiplying both parts by ${k}.`, 'Addition is not scaling.'],
          solution: `${a} : ${bb} = <b>${a * k} : ${bb * k}</b>.`,
        };
      } },
    { name: 'Part to whole', icon: '🧮', blurb: 'A fraction of the mixture.', rounds: 6, think: true,
      say: '🧮 Think first: what is the whole?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const a = UI.rint(1, 4), b = UI.rint(2, 5);
        const whole = a + b;
        const g = (x, y) => (y ? g(y, x % y) : x);
        const d = g(a, whole) || 1;
        const low = `${a / d}/${whole / d}`;
        return {
          type: 'choice',
          /* think:true needs a problem block — the engine renders the CUBES card from it */
          problem: {
            sentences: ['A falconer keeps a trough of water and a trough of feed for the mews.',
              'Both are measured in the same cups, and the mixture has been agreed in advance.',
              `The troughs hold ${a} cups of water and ${b} cups of feed.`],
            question: 2, keys: ['troughs', 'water'], extras: [1],
          },
          prompt: G1.art(SCENE6.tapeStrip([[a, 'water'], [b, 'feed']], { caption: 'water out of the whole mixture' }),
            `Water : feed is <b>${a} : ${b}</b>. What fraction of the whole mixture is water?`),
          options: [low, `${b / d}/${whole / d}`, `${a}/${b}`],
          answer: low,
          why: (v) => v === `${a}/${b}` ? 'That is the ratio as a fraction of the feed, not of the whole.' : 'Count every cell of both parts to get the whole.',
          hints: ['The whole is the water cells plus the feed cells.', `There are ${whole} cells altogether.`, 'Put the water cells over the whole, then simplify.'],
          solution: `${a} of ${whole} cells are water → <b>${low}</b> of the mixture.`,
        };
      } },
  ],

  ghubar: ['Add the same amount to both parts.', 'The order does not matter.', 'Only count the first part.'],
  praise: ['Ratio read!', 'Mixture matched!', 'Fraction found!', 'Same taste, bigger bowl!'],
  finale: 'You can read a ratio and keep it equal as it grows. 🦅',
};

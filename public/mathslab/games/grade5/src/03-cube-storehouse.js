/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 5 · Cube Storehouse · volume as an attribute, measured in unit cubes
   Source: G05-U01-MAT-L02 (CCSS 5.MD.C.3, 5.MD.C.3b, 5.MD.C.5a), term 1, unit 01.
   Mechanic = the thinking: the lesson's water-cistern problem. Level 1 counts the cubes in a packed prism
   one layer at a time — the picture never prints the count; level 2 turns the count into the rule
   V = length × width × height by reading dimensions the question supplies; level 3 compares two cisterns.
   This lesson is the *packing* idea (5.MD.C.3b: no gaps, no overlaps). The L-shaped, additive-volume work
   belongs to G05-U02-MAT-L01 — the two documents overlap, so they are deliberately split here:
   packing and B × h live in this game, decomposition lives in g5-madrasa-volume.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g5-cube-storehouse', code: 'G05-U01-MAT-L02', title: 'Cube Storehouse', emoji: '🧊',
  accent: '#1b6b5a', accentDeep: '#145648', skyA: '#effaf6', skyB: '#cfeee3',
  topic: 'Volume in unit cubes', band: 'g35', lang: 'en',
  objective: 'I can measure a prism\'s <b>volume</b> by counting unit cubes, then use <b>V = l × w × h</b>.',
  welcome: 'The water cistern is filled with one-metre cubes, edge to edge, no gaps. 🧊',
  learnBlurb: 'Count one layer, then count the layers.',
  how: {
    what: 'Volume is the amount of space a solid fills, measured in unit cubes. If a prism is l cubes long, w wide and h tall, then h layers each hold l × w cubes.',
    steps: ['🧊 Count the cubes on the top layer.', '🧊 Count how many layers are stacked.', '✅ Multiply layer × layers — that is the volume in unit cubes.'],
  },

  learn: [
    { say: 'A cistern is built of <b>unit cubes</b>, packed tight. Volume counts the cubes that fill it — not the squares on the outside.',
      draw(el) { el.append(UI.h('div', { html: SCENE5.unitCubePrism(4, 2, 1, { caption: 'one layer: no gaps, no overlaps' }) })); } },
    { say: 'Now stack <b>three</b> identical layers. The bottom layer holds four by two cubes, and there are three layers.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE5.unitCubePrism(4, 2, 3, { caption: 'three layers, each 4 × 2' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: 'one layer = 4 × 2 = 8 cubes · 3 layers → <b>V = 8 × 3</b>' }));
      } },
    { say: 'Your turn. A tank is <b>3</b> cubes long, <b>2</b> wide and <b>2</b> tall. How many unit cubes fill it?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE5.unitCubePrism(3, 2, 2, { max: 400 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['12', true], ['7', false], ['18', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 3 × 2 = 6 in a layer, and 2 layers make 12.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '7' ? 'That is 3 + 2 + 2 — adding the edges, not filling the space.' : 'You multiplied the layer by one layer too many.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says the volume of the same tank is <b>3 + 2 + 2 = 7</b>. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Three long, two wide, two tall. Three plus two plus two is seven.', 5200);
        el.append(UI.h('div', { html: SCENE5.unitCubePrism(3, 2, 2, { max: 320, caption: 'count the cubes, not the edges' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — volume multiplies the three dimensions.', true], ['He is right — 7 cubes.', false], ['It is 3 × 2 only, so 6.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. Adding edges gives a length, not a volume.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Each layer already uses length × width. The height says how many layers.', 'bad'))),
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
    { name: 'Count the cubes', icon: '🧊', blurb: 'Layer by layer, no gaps.', rounds: 6, think: false,
      say: '🧊 Count one layer, then the layers.',
      round() { return GAME.fixOpts(this.roundRaw()); },
      roundRaw() {
        const l = UI.rint(2, 4), w = UI.rint(2, 3), h = UI.rint(2, 3);
        const answer = l * w * h;
        return {
          type: 'choice',
          prompt: G1.art(SCENE5.unitCubePrism(l, w, h, { max: 360 }), 'Each cube is one unit. The stack has no gaps.'),
          options: [String(answer), String(l + w + h), String(l * w)],
          answer: String(answer),
          why: (v) => Number(v) === l + w + h ? 'That adds the three edges. Volume fills the inside, so multiply.'
            : 'You stopped after one layer — the height says how many layers there are.',
          hints: [`One layer holds ${l} × ${w} = ${l * w} cubes.`, `There are ${h} layers stacked.`, 'Multiply the layer by the number of layers.'],
          solution: `V = ${l} × ${w} × ${h} = <b>${answer}</b> unit cubes.`,
        };
      } },
    { name: 'Use the rule', icon: '📏', blurb: 'V = l × w × h from dimensions.', rounds: 6, think: false,
      say: '📏 Once you know the rule, you no longer need to count.',
      round() { return GAME.fixOpts(this.roundRaw()); },
      roundRaw() {
        const l = UI.rint(3, 9), w = UI.rint(2, 7), h = UI.rint(2, 6);
        const answer = l * w * h;
        return {
          type: 'choice',
          prompt: G1.art(SCENE5.prism(l, w, h, { dims: { l, w, h }, max: 380 }), 'The three dimensions are given in metres.'),
          options: [String(answer), String(l * w + h), String(2 * (l * w + l * h + w * h))],
          answer: String(answer),
          why: (v) => Number(v) > answer * 2 ? 'That is the surface area — the skin of the box, not the space inside it.'
            : `Multiply all three: ${l} × ${w} first, then × ${h}.`,
          hints: ['Base layer = length × width.', `Base = ${l} × ${w}.`, `Then multiply by the height ${h}.`],
          solution: `V = ${l} × ${w} × ${h} = <b>${answer}</b> m³.`,
        };
      } },
    { name: 'Cistern stories', icon: '💧', blurb: 'Which cistern holds more water?', rounds: 6, think: true,
      say: '💧 Think first: which sentence carries the extra information?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const a = [UI.rint(2, 5), UI.rint(2, 4), UI.rint(2, 4)];
        const b = [a[0], a[1], a[2] + (i % 2 ? 1 : -1) || 2];
        const va = a[0] * a[1] * a[2], vb = b[0] * b[1] * b[2];
        const hi = Math.max(va, vb);
        return {
          type: 'choice',
          problem: {
            sentences: ['The village keeps two water cisterns for the dry months.',
              'The smaller one is emptied and scrubbed every spring.',
              `Cistern A is ${a[0]} m by ${a[1]} m by ${a[2]} m.`,
              `Cistern B is ${b[0]} m by ${b[1]} m by ${b[2]} m.`,
              'Which cistern holds more water?'],
            question: 4, keys: ['more', 'm'], extras: [1],
          },
          prompt: `A: ${a.join(' × ')} m · B: ${b.join(' × ')} m. Which holds more?`,
          options: [`Cistern ${va === hi ? 'A' : 'B'}`, `Cistern ${va === hi ? 'B' : 'A'}`, 'They hold the same.'],
          answer: `Cistern ${va === hi ? 'A' : 'B'}`,
          why: () => `A holds ${va} m³ and B holds ${vb} m³. Cover the same base, so the taller one holds more.`,
          hints: [`A = ${a[0]} × ${a[1]} × ${a[2]}.`, `B = ${b[0]} × ${b[1]} × ${b[2]}.`, 'Compare the two products, not the tallest number.'],
          solution: `A = ${va} m³, B = ${vb} m³ → <b>Cistern ${va === hi ? 'A' : 'B'}</b>.`,
        };
      } },
  ],

  ghubar: ['Volume is length plus width plus height.', 'Count the faces and you have the volume.', 'A taller box always holds more.'],
  praise: ['Cubes counted!', 'Rule used!', 'Cisterns compared!', 'No gaps, no overlaps!'],
  finale: 'Layer after layer, no gaps — you can find the volume of any box! 🧊',
};

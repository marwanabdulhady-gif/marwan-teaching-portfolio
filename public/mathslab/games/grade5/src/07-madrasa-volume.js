/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 5 · Madrasa Volume · the volume of an L-shaped composite solid, and the capacity of a tank
   Source: G05-U02-MAT-L01 (CCSS 5.MD.C.3, 5.MD.C.5a & 5.MD.C.5c), term 2, unit 02.
   Mechanic = the thinking: the lesson's V = B × h framing and its additive-volume rule (5.MD.C.5c) — cut a
   composite solid into non-overlapping prisms and add what each contributes. Level 1 reads a layer's
   capacity as B × h, level 2 cuts an L into two prisms and adds, level 3 sizes a charity collection crate in
   a real school context. The picture draws the cut but never the numbers.
   Deliberately differentiated from g5-cube-storehouse (G05-U01-MAT-L02), which owns packing and counting:
   the two curriculum documents overlap, so this game takes decomposition and capacity only.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g5-madrasa-volume', code: 'G05-U02-MAT-L01', title: 'Madrasa Volume', emoji: '📦',
  accent: '#a5711f', accentDeep: '#8a5c16', skyA: '#fdf7ec', skyB: '#f2e2c4',
  topic: 'Composite volume and capacity', band: 'g35', lang: 'en',
  objective: 'I can find the volume of an <b>L-shaped solid</b> by cutting it into two prisms and adding them.',
  welcome: 'The school store room is L-shaped. Cut the ghost of a line and it becomes two boxes. 📦',
  learnBlurb: 'Cut the solid into pieces that do not overlap, then add.',
  how: {
    what: 'Volume of any prism is the base area times the height: V = B × h. If a solid is L-shaped, cut it into two rectangular prisms that share only a face, find each volume, and add.',
    steps: ['📦 Choose a cut that makes two boxes.', '📦 Find the volume of each box separately.', '✅ Add them — the pieces must not overlap.'],
  },

  learn: [
    { say: 'One rectangular prism with a base of <b>4 × 2</b> and a height of <b>3</b> holds 24 cubes. That is <b>V = B × h</b>: the base area times the number of layers.',
      draw(el) { el.append(UI.h('div', { html: SCENE5.prism(4, 2, 3, { dims: { l: 4, w: 2, h: 3 }, caption: 'B = 4 × 2 = 8, and 3 layers' }) })); } },
    { say: 'Now look at this L-shaped store room. One cut turns it into a tall box and a low box — they share only a face, so no volume is counted twice.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE5.compositePrism({ split: true, caption: 'one cut, two boxes, no overlap' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: 'V(all) = V(tall) + V(low)' }));
      } },
    { say: 'Your turn. The tall part holds <b>12</b> cubes and the low part holds <b>9</b>. What is the volume of the whole solid?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE5.compositePrism({ split: true, max: 420 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['21 cubes', true], ['108 cubes', false], ['3 cubes', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — additive volume: 12 + 9 = 21.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '108 cubes' ? 'You multiplied the two parts. Pieces side by side are added, not multiplied.' : 'The two parts sit next to each other, so their volumes add.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says you should multiply the two parts because the shape is one solid. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('One solid? Then one multiplication. Twelve times nine.', 5200);
        el.append(UI.h('div', { html: SCENE5.compositePrism({ split: true, max: 320, caption: 'the pieces do not overlap' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — the parts share only a face, so add their volumes.', true], ['He is right — multiply.', false], ['You should subtract the small from the big.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — additive volume is addition, and only when the pieces do not overlap.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Multiplying counts space that is not there. Each piece fills its own room.', 'bad'))),
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
    { name: 'Base times height', icon: '📦', blurb: 'V = B × h on one prism.', rounds: 6, think: false,
      say: '📦 Find the base area first.',
      round() { return GAME.fixOpts(this.roundRaw()); },
      roundRaw() {
        const l = UI.rint(3, 8), w = UI.rint(2, 5), h = UI.rint(2, 6);
        const answer = l * w * h;
        return {
          type: 'choice',
          prompt: G1.art(SCENE5.prism(l, w, h, { dims: { l, w, h }, max: 360 }), `the base is ${l} by ${w}`),
          options: [String(answer), String(l * w), String(l * w + h)],
          answer: String(answer),
          why: (v) => Number(v) === l * w ? 'That is one layer. The height says how many layers.' : 'B × h: base area times the number of layers.',
          hints: [`Base area = ${l} × ${w} = ${l * w}.`, `Height = ${h}.`, `Multiply ${l * w} by ${h}.`],
          solution: `V = ${l * w} × ${h} = <b>${answer}</b>.`,
        };
      } },
    { name: 'Cut and add', icon: '✂', blurb: 'Two prisms, one volume.', rounds: 6, think: false,
      say: '✂ Volume of the whole = sum of the parts.',
      round() { return GAME.fixOpts(this.roundRaw()); },
      roundRaw() {
        const a = [UI.rint(2, 4), UI.rint(2, 4), UI.rint(2, 4)];
        const b = [UI.rint(2, 5), a[1], UI.rint(1, 3)];
        const va = a[0] * a[1] * a[2], vb = b[0] * b[1] * b[2];
        return {
          type: 'choice',
          /* the drawing takes its proportions from this round's two parts (clamped so the L stays drawable),
             so the picture and the numbers on the cards describe the same solid */
          prompt: G1.art(SCENE5.compositePrism({
            split: true, max: 340,
            armW: Math.min(4, Math.max(1, a[0])), armH: Math.min(4, Math.max(1, a[2])),
            restW: Math.min(4, Math.max(1, b[0])), restH: Math.min(4, Math.max(1, b[2])),
          }),
            `part 1 = ${a.join(' × ')} · part 2 = ${b.join(' × ')}`),
          options: [String(va + vb), String(va * vb), String(Math.abs(va - vb))],
          answer: String(va + vb),
          why: (v) => Number(v) === va * vb ? 'That multiplies the two parts. Side-by-side pieces add.'
            : 'Each part is its own prism, then the two volumes are added.',
          hints: [`Part 1 = ${a[0]} × ${a[1]} × ${a[2]} = ${va}.`, `Part 2 = ${b[0]} × ${b[1]} × ${b[2]} = ${vb}.`, `Add ${va} and ${vb}.`],
          solution: `V = ${va} + ${vb} = <b>${va + vb}</b>.`,
        };
      } },
    { name: 'Charity crates', icon: '🧺', blurb: 'How much will the crate hold?', rounds: 6, think: true,
      say: '🧺 Think first: what is the crate made of?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const l = UI.rint(4, 9), w = UI.rint(3, 6), h = UI.rint(2, 5);
        const answer = l * w * h;
        return {
          type: 'choice',
          problem: {
            sentences: ['The school collects tins for a Ramadan food drive.',
              'Each class fills one corner of the store room.',
              `A crate measures ${l} dm by ${w} dm by ${h} dm.`,
              'One cubic decimetre holds exactly one litre of rice.',
              'How many litres will one crate hold?'],
            question: 4, keys: ['litres', 'dm'], extras: [1],
          },
          prompt: `Crate: <b>${l} × ${w} × ${h}</b> dm. How many litres?`,
          options: [`${answer}`, `${l * w}`, `${2 * (l * w + l * h + w * h)}`],
          answer: `${answer}`,
          why: (v) => Number(v) > answer ? 'That is the surface area in square units, not the volume in litres.'
            : 'Volume in cubic decimetres equals the litres it holds — so multiply the three dimensions.',
          hints: ['A cubic decimetre is one litre.', `Volume = ${l} × ${w} × ${h}.`, 'Multiply, then read the number as litres.'],
          solution: `V = ${answer} dm³ = <b>${answer}</b> litres.`,
        };
      } },
  ],

  ghubar: ['Multiply the two parts of an L.', 'Surface area and volume are the same number.', 'Bigger numbers always mean bigger volume.'],
  praise: ['Base times height!', 'Cut and added!', 'Crate measured!', 'No volume counted twice!'],
  finale: 'One cut, two boxes, one total — L-shapes hold no secrets now! 📦',
};

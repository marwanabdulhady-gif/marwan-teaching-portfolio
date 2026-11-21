/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 6 · Shade Area · area of polygons by decomposition, and the folding problem
   Source: G06-U04-L18 — المساحة السطحية والأحجام المركّبة ونمذجة الوقف المالي المستدام (حزمة رياضيات v3
   المعتمدة), with the measurement strand of the unit-02 bundle (CCSS 6.G.A.1).
   Mechanic = the thinking: a shape whose area formula you do not have is cut into shapes whose formulas you
   do have. A parallelogram becomes a rectangle; a trapezoid becomes a rectangle plus two triangles. Level 1
   computes a rectangle; level 2 a parallelogram or triangle; level 3 a trapezoid split into pieces. The
   drawing labels the side lengths, never the area.
   Named misconceptions: «area = perimeter», and «multiply every number in the picture».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g6-shade-area', code: 'G06-U04-L18', title: 'Shade Area', emoji: '📐',
  accent: '#7a4a2f', accentDeep: '#653c26', skyA: '#fdf6f1', skyB: '#f0ddcd',
  topic: 'Area of polygons', band: 'g68', lang: 'en',
  objective: 'I can find the <b>area</b> of a polygon by cutting it into shapes whose formulas I know.',
  welcome: 'A courtyard is not one neat rectangle. Cut it, then add what each piece covers. 📐',
  learnBlurb: 'Area counts square units. Split an awkward shape into rectangles and triangles and add them.',
  how: {
    what: 'Area is the number of square units a shape covers. A rectangle is l × w, a triangle is half of b × h. For any other polygon, cut it into pieces you know and add the areas.',
    steps: ['📐 Name each side length you were given.', 'Cut the shape into rectangles or triangles.', '✅ Add the pieces — the total is the area.'],
  },

  learn: [
    { say: 'A rectangular panel <b>8</b> by <b>5</b> covers 8 × 5 = <b>40</b> square units. Area is what it covers, not how far around it is.',
      draw(el) { el.append(UI.h('div', { html: SCENE6.polygon({ kind: 'rect', w: 8, hh: 5, sides: [8, 5, 8, 5], caption: 'one rectangle, 8 by 5' }) })); } },
    { say: 'A triangle is half a rectangle: ½ × base × height. With base <b>8</b> and height <b>4</b> it covers ½ × 8 × 4 = <b>16</b>.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE6.polygon({ kind: 'triangle', base: 8, height: 4, angles: [], caption: 'a triangle, base 8 and height 4' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '½ × 8 × 4 = 16 square units' }));
      } },
    { say: 'Your turn. A parallelogram has base <b>9</b> and height <b>4</b>. What is its area?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE6.polygon({ kind: 'parallelogram', sides: [9, 4, 9, 4], caption: 'base 9, height 4' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['36', true], ['72', false], ['13', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — base × height, and the slant does not change it.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '72' ? 'A parallelogram is not half of the rectangle — it covers the same as base × height.' : 'Adding the sides is perimeter, not area.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says the shape whose sides add to more must cover more. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Longer edges, bigger shape. Just add the sides.', 5200);
        el.append(UI.h('div', { html: SCENE6.polygon({ kind: 'trapezoid', w: 5, b2: 11, hh: 4, caption: 'a long perimeter, a modest area' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — perimeter measures the edge, area measures the cover.', true], ['He is right — more perimeter means more area.', false], ['They are the same measurement.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. A long thin shape can have a big perimeter and a small cover.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Perimeter is a length around; area is a count of squares inside.', 'bad'))),
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
    { name: 'Rectangle', icon: '📐', blurb: 'l × w.', rounds: 6, think: false,
      say: '📐 Base times height, not base plus height.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const l = UI.rint(3, 12), w = UI.rint(2, 9);
        return {
          type: 'choice',
          prompt: G1.art(SCENE6.polygon({ kind: 'rect', w, hh: l, sides: [w, l, w, l], caption: 'a tiled courtyard' }),
            `A rectangle is <b>${w}</b> by <b>${l}</b>. What is its <b>area</b>?`),
          options: [String(w * l), String(2 * (w + l)), String(w + l)],
          answer: String(w * l),
          why: (v) => Number(v) === 2 * (w + l) ? 'That is the perimeter — the distance around.' : 'Adding the sides is not area either.',
          hints: [`Multiply the two side lengths.`, `${w} × ${l}.`, 'Area is in square units.'],
          solution: `${w} × ${l} = <b>${w * l}</b> square units.`,
        };
      } },
    { name: 'Triangle or slant', icon: '🔺', blurb: 'Half a rectangle.', rounds: 6, think: false,
      say: '🔺 A triangle is half of base × height.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const b = UI.rint(4, 14), h = UI.rint(2, 9);
        const even = i % 2 === 0;
        const ans = even ? (b * h) / 2 : b * h;
        return {
          type: 'choice',
          prompt: G1.art(SCENE6.polygon(even ? { kind: 'triangle', base: b, height: h } : { kind: 'parallelogram', w: b, hh: h, sides: [b, h, b, h], caption: `base ${b}, height ${h}` }),
            even ? `A triangle has base <b>${b}</b> and height <b>${h}</b>. What is its area?` : `A parallelogram has base <b>${b}</b> and height <b>${h}</b>. What is its area?`),
          options: [String(ans), String(b * h * 2), String(b + h)],
          answer: String(ans),
          why: () => (even ? 'A triangle is half the rectangle, so halve the product.' : 'A parallelogram covers base × height — do not halve it, and do not double it.'),
          hints: [even ? 'Multiply base by height first.' : 'Multiply base by height.', even ? 'Then halve it.' : 'The slant edge is not the height.', 'Do not add the sides.'],
          solution: even ? `½ × ${b} × ${h} = <b>${ans}</b>.` : `${b} × ${h} = <b>${ans}</b>.`,
        };
      } },
    { name: 'Cut and add', icon: '🧩', blurb: 'A trapezoid in two pieces.', rounds: 6, think: true,
      say: '🧩 Think first: how will you cut it?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const b1 = UI.rint(4, 8), b2 = b1 + UI.rint(2, 6), h = UI.rint(2, 6);
        /* trapezoid = rectangle b1 × h + triangle ½ (b2 − b1) × h */
        const area = b1 * h + ((b2 - b1) * h) / 2;
        return {
          type: 'choice',
          problem: {
            sentences: ['A paved courtyard has one long edge and one shorter parallel edge.',
              'The two parallel edges are joined by straight slanted sides.',
              `The parallel edges are ${b1} and ${b2} apart, and the height between them is ${h}.`],
            question: 2, keys: ['edges', 'height'], extras: [1],
          },
          prompt: G1.art(SCENE6.polygon({ kind: 'trapezoid', w: b1, b2, hh: h, caption: `parallel sides ${b1} and ${b2}, height ${h}` }),
            `A trapezoid has parallel sides <b>${b1}</b> and <b>${b2}</b>, and height <b>${h}</b>. What is its area?`),
          options: [String(area), String(b1 + b2 + h), String((b1 + b2) * h)],
          answer: String(area),
          why: (v) => Number(v) === (b1 + b2) * h ? 'That is double — the trapezoid is half of that rectangle.' : 'Adding the three lengths is perimeter, not area.',
          hints: [`Cut it into a ${b1} × ${h} rectangle.`, `That leaves a triangle with base ${b2 - b1} and height ${h}.`, 'Add the rectangle and the triangle.'],
          solution: `${b1} × ${h} = ${b1 * h}, plus ½ × ${b2 - b1} × ${h} = ${((b2 - b1) * h) / 2} → <b>${area}</b>.`,
        };
      } },
  ],

  ghubar: ['Area is the distance around the shape.', 'Multiply every number in the picture.', 'The slanted edge is the height.'],
  praise: ['Rectangle measured!', 'Half-triangle found!', 'Pieces added!', 'Courtyard covered!'],
  finale: 'Cut an awkward shape into easy ones and the area follows. 📐',
};

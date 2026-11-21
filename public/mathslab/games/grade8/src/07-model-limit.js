/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 8 · Roof Span · a linear function built from a start and a rate, a horizontal span measured on the
   grid, and the edge where the model has to stop
   Source: G08-U02-MATH-L02 — الدوال الخطية ومعدل التغير ونظرية فيثاغورس (CCSS 8.G.B.7, 8.F), term 2.

   SCOPE — this is the COMBINED lesson of term 2: its own objectives list both the linear function as a
   constant rate of change and the Pythagorean distance on the plane, and it adds the one thing neither of
   the other two says — the model has a LIMIT and the student must be able to say where it lies. So this
   game asks for exactly that trio and nothing else: build the function, find a span on the grid, and state
   the bound. It is NOT a repeat of game 06 (distance drills) or game 05 (tables and steady rates): here
   each level ends in a statement about the model, which is the vocabulary this document introduces. The
   near-identical codes G08-U02-MAT-L02 (game 06) and G08-U02-MATH-L02 (this game) are different lessons
   and are not merged; the split is recorded in docs/mowazi/g8-expansion.md.

   Mechanic = the thinking: the roof figure is drawn from the same rise and run the question is about, so a
   steep roof is visibly steep; the rule is printed only where the document prints it, never with its answer.
   Named misconceptions: «a model is true for every input», «the limit is a mistake in the maths», and
   «a span on the grid can be read off the drawn line without subtracting».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g8-model-limit', code: 'G08-U02-MATH-L02', title: 'Roof Span', emoji: '🏠',
  accent: '#8a5a1c', accentDeep: '#6b4413', skyA: '#fdf7ec', skyB: '#f0e0c2',
  topic: 'Linear functions, a grid span, and the limit of a model', band: 'g68', lang: 'en',
  objective: 'I can build a linear function, measure a span on the grid, and say where the model stops being usable.',
  welcome: 'A sloping roof rises a fixed amount for every metre across. Past a certain slope the tiles will not hold — and that is part of the answer. 🏠',
  learnBlurb: 'A model is a rule plus the range where it was checked. Both parts count.',
  how: {
    what: 'A linear function turns a start and a steady rate into a rule. A span on the plane comes from subtracting coordinates and using the result as a leg. And because a rule was fitted to limited data, it must be quoted with the range in which it is supported.',
    steps: ['🏠 Write the start and the rate as a rule.', 'Subtract the coordinates for the span you need.', '✅ Say the range in which the rule was checked — outside it, the model is only a guess.'],
  },

  learn: [
    { say: 'A roof rises <b>3</b> for every <b>4</b> across and starts at height <b>2</b>. The rule is <b>h = 3x + 2</b>, and the slope triangle shows why: rise 3, run 4.',
      draw(el) { el.append(UI.h('div', { html: SCENE8.slopeLine({ m: 0.75, b: 2, xmin: 0, xmax: 8, ymax: 9, tri: [0, 4], caption: 'rise 3 over run 4' }) })); } },
    { say: 'The span between two ridge points is a distance on the grid: from <b>(0, 2)</b> to <b>(4, 5)</b> the gaps are 4 and 3, so the length is <b>5</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE8.pointsDist([0, 2], [4, 5], { caption: 'the same 3 and 4, seen as a distance' }) })); } },
    { say: 'The rule was fitted from roofs up to <b>8</b> metres across. Your turn: how should you answer a question about a roof <b>20</b> metres across?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE8.slopeLine({ m: 0.75, b: 2, xmin: 0, xmax: 22, ymax: 20, tri: [4, 8], caption: 'the measurements stopped at 8' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['Give the rule value but say it is untested past 8 metres.', true], ['Give the rule value as a fact.', false], ['Refuse to answer at all.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Good — the number is computable, but the claim is only supported inside the fitted range.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === 'Give the rule value as a fact.' ? 'Nothing was measured out there.' : 'The rule still computes — say what is supported, do not hide the number.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says a straight rule is a law, so it holds for every length of roof. Is a fitted rule a law of nature?', wait: true,
      draw(el, L) {
        GHUBAR.pop('A linear rule is true forever; that is what linear means.', 5200);
        el.append(UI.h('div', { html: SCENE8.slopeLine({ m: 0.75, b: 2, xmin: 0, xmax: 14, ymax: 14, tri: [2, 6], caption: 'a model of a roof, not a roof' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — it is a model fitted to a range of measurements.', true], ['Yes — a rule cannot be wrong.', false], ['It is a law above 8 metres only.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. The line is a description of measurements, and descriptions have a range.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Who measured a twenty-metre roof?', 'bad'))),
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
        const alt = [v + 1, v - 1, v + 2, v - 2, v * 2].find((c) => {
          const cand = s.replace(num[0], String(c));
          return c >= 0 && cand !== ans && !seen.has(cand);
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
    { name: 'Build the rule', icon: '🏗️', blurb: 'Start and rate into a function.', rounds: 6, think: false,
      say: '🏗️ The start is b; the rate multiplies x.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const b = UI.rint(1, 6), m = UI.rint(2, 5);
        return {
          type: 'choice',
          prompt: G1.art(SCENE8.slopeLine({ m, b, xmin: 0, xmax: 6, ymax: m * 6 + b + 2, bLabel: String(b), tri: [1, 2], caption: 'one start, one steady rise' }),
            `A roof starts at height <b>${b}</b> and rises <b>${m}</b> every metre across. Which rule gives the height?`),
          options: [`h = ${m}x + ${b}`, `h = ${b}x + ${m}`, `h = ${m + b}x`],
          answer: `h = ${m}x + ${b}`,
          why: (v) => String(v).startsWith(`h = ${b}x`) ? 'That makes the starting height the rise — the roof would be absurdly steep.'
            : 'The rule needs a constant start as well as a rate.',
          hints: [`At x = 0 the height is ${b}.`, `Each metre adds ${m}.`, `h = ${m}x + ${b}.`],
          solution: `Start ${b}, rise ${m}: <b>h = ${m}x + ${b}</b>.`,
        };
      } },
    { name: 'Span on the grid', icon: '📏', blurb: 'Read a distance from two points.', rounds: 6, think: false,
      say: '📏 Subtract both coordinates first.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const [dx, dy, d] = [[3, 4, 5], [6, 8, 10], [5, 12, 13]][i % 3];
        const p = [UI.rint(0, 2), UI.rint(0, 2)];
        const q = [p[0] + dx, p[1] + dy];
        return {
          type: 'choice',
          prompt: G1.art(SCENE8.pointsDist(p, q, { caption: 'the two ridge points' }),
            `Two ridge points sit at <b>(${p[0]}, ${p[1]})</b> and <b>(${q[0]}, ${q[1]})</b>. What is the straight span between them?`),
          options: [String(d), String(dx + dy), String(d - 1)],
          answer: String(d),
          why: (v) => Number(v) === dx + dy ? 'That walks the two grid lines instead of crossing the span.'
            : 'Use the squares of both gaps, not the gaps themselves.',
          hints: [`The gaps are ${dx} and ${dy}.`, `${dx * dx} + ${dy * dy} = ${dx * dx + dy * dy}.`, `The root is ${d}.`],
          solution: `${dx * dx} + ${dy * dy} = ${dx * dx + dy * dy}, giving a span of <b>${d}</b>.`,
        };
      } },
    { name: 'Say the limit', icon: '🚧', blurb: 'State where the model was checked.', rounds: 6, think: true,
      say: '🚧 Think first: how far did the measurements go?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const m = [2, 3, 4][i % 3], b = UI.rint(1, 5), cap = UI.rint(6, 12);
        const ask = cap + UI.rint(2, 8);
        return {
          type: 'choice',
          problem: {
            sentences: ['A roof rule was fitted from measurements taken only up to a certain width.',
              'Past that width the rule still computes, but nothing was measured to support it.',
              `The rule is h = ${m}x + ${b}, fitted on widths 0 to ${cap} metres.`],
            question: 2, keys: ['fitted', 'measured'], extras: [1],
          },
          prompt: G1.art(SCENE8.slopeLine({ m, b, xmin: 0, xmax: Math.max(ask + 2, cap + 4), ymax: m * Math.max(ask + 2, cap + 4) + b, tri: [cap - 2, cap], caption: `measurements ended at ${cap} m` }),
            `Someone asks about a roof <b>${ask}</b> metres across. What is the correct answer?`),
          options: [`The rule gives ${m * ask + b}, but it is untested past ${cap} metres.`,
            `The rule gives ${m * ask + b}, so that is the height.`,
            `Nothing can be said at all.`],
          answer: `The rule gives ${m * ask + b}, but it is untested past ${cap} metres.`,
          why: () => 'Both halves are needed: the arithmetic the rule gives, and the range the rule is supported in.',
          hints: ['Compute the rule value.', `Where did the measurements stop? ${cap} metres.`, 'Give the number AND its status.'],
          solution: `h = ${m}(${ask}) + ${b} = ${m * ask + b}, and this is <b>outside the fitted range</b> of 0–${cap} m.`,
        };
      } },
  ],

  ghubar: ['A linear model is true for every input.', 'The limit is a mistake in the arithmetic.', 'A span can be read from the drawn line without subtracting.'],
  praise: ['Function built!', 'Span measured!', 'Limit stated!', 'Range respected!'],
  finale: 'A rule, a span, and the edge of the evidence — that is a finished model. 🏠',
};

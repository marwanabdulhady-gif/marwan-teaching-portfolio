/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 9 · Quadratic Apps · intercepts, intervals of increase and decrease, and critiquing a claim that
   outruns what the graph measures
   Source: G09-U02-MATH-L02 — الدوال التربيعية والتمثيل البياني وتطبيقاتها
   (CCSS HSF-IF.B.4 & HSF-IF.C.7), term 2.

   SCOPE — this is the lead-and-close lesson of the Grade 9 set and every level ends in a judgement rather
   than a computation: intervals of increase/decrease partitioned by the vertex, intercepts as the meaning
   of zero, and a final level that asks the student to REJECT a sentence the graph does not support. That
   third thing is why it is not a repeat of game 06 (which owns maximum-vs-minimum) or game 01 (which owns
   the vertex as a location): here the object is behaviour across an interval, plus the discipline of
   saying only what a graph shows. The document's own ten-axis frame insists on this boundary, and its
   note warnings are carried into the frame.
   Named misconceptions: «a curve that goes up is increasing everywhere», «the intercept is the answer to
   every question», and «a smooth graph proves the real situation behaves that way».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g9-quadratic-apps', code: 'G09-U02-MATH-L02', title: 'Quadratic Apps', emoji: '📈',
  accent: '#35507a', accentDeep: '#263c5e', skyA: '#eef3fb', skyB: '#d5e0f2',
  topic: 'Intervals of increase and decrease, intercepts, and the limits of a claim', band: 'g912', lang: 'en',
  objective: 'I can name the interval where a quadratic rises and where it falls, and I can reject a claim the graph does not support.',
  welcome: 'Every parabola climbs to its turning point and then falls. Naming those two stretches is most of reading a model. 📈',
  learnBlurb: 'The vertex splits the graph: rising up to it, falling after it — or the other way round.',
  how: {
    what: 'A quadratic increases on one side of its vertex and decreases on the other. Which side is which depends on whether the arms open up or down. The x-intercepts are where the value is zero, and they mean something only in the situation the model describes.',
    steps: ['📈 Mark the vertex — it is the boundary between the two stretches.', 'Decide the direction from the sign of a.', '✅ Say the interval, and say what the graph does NOT measure.'],
  },

  learn: [
    { say: 'For <b>y = −(x − 2)² + 4</b>, the vertex is at x = 2. The curve rises from the left up to x = 2, then falls after it.',
      draw(el) { el.append(UI.h('div', { html: SCENE9.parabola({ a: -1, h: 2, k: 4, ymin: -2, ymax: 6, roots: true, caption: 'increasing for x < 2, decreasing for x > 2' }) })); } },
    { say: 'The intercepts are where the curve meets the axes. Here it crosses the x-axis at <b>0</b> and <b>4</b>, and the y-axis at <b>0</b> — those are the values of zero in the model.',
      draw(el) { el.append(UI.h('div', { html: SCENE9.parabola({ a: -1, h: 2, k: 4, ymin: -2, ymax: 6, roots: true, caption: 'the crossings are the zeros' }) })); } },
    { say: 'Your turn. On which interval does <b>y = (x − 1)² − 3</b> decrease?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE9.parabola({ a: 1, h: 1, k: -3, ymin: -5, ymax: 5, roots: true, caption: 'opening upward' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['For x < 1 — up to the vertex.', true], ['For x > 1 — after the vertex.', false], ['Everywhere — it always decreases.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes. Opening upward, the curve falls to the vertex and then rises.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Find the vertex first, then look at which side is going down.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar reads a smooth parabola from a dataset and says: because the curve is smooth, the real measurements must follow it exactly. Is that sound?', wait: true,
      draw(el, L) {
        GHUBAR.pop('The curve is smooth, so the measurements must obey it.', 5200);
        el.append(UI.h('div', { html: SCENE9.parabola({ a: -1, h: 2, k: 4, ymin: -2, ymax: 6, roots: true, caption: 'a fitted curve, not a measurement' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — a fitted curve describes a limited set of readings; it does not guarantee the next one.', true], ['Yes — smoothness implies accuracy.', false], ['Only if the vertex is above the axis.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Exactly. Naming the limit is part of the answer, not a disclaimer.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('What does a smooth curve actually promise you?', 'bad'))),
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
        const alt = [v + 1, v - 1, v + 2, v * 2, v - 2].find((c) => {
          const cand = s.replace(num[0], String(c));
          return c !== v && cand !== ans && !seen.has(cand);
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
    { name: 'Up or down', icon: '📈', blurb: 'Name the interval of increase.', rounds: 6, think: false,
      say: '📈 The vertex is the boundary, every time.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const up = i % 2 === 0;
        const a = up ? 1 : -1;
        const h = UI.rint(-3, 4);
        const k = UI.rint(-3, 5);
        const risingLeft = !up;      /* opening down rises BEFORE the vertex */
        return {
          type: 'choice',
          prompt: G1.art(SCENE9.parabola({ a, h, k, roots: true, caption: 'where does it climb?' }),
            `On which interval does this curve <b>increase</b>?`),
          options: [risingLeft ? `For x < ${h}` : `For x > ${h}`, risingLeft ? `For x > ${h}` : `For x < ${h}`, 'It increases on no interval'],
          answer: risingLeft ? `For x < ${h}` : `For x > ${h}`,
          why: (v) => String(v).startsWith('For x') ? `Check the direction of opening: a = ${a}, so the arms open ${up ? 'up' : 'down'}.`
            : 'Every parabola increases on one whole side of its vertex.',
          hints: [`The vertex is at x = ${h}.`, `The arms open ${up ? 'up' : 'down'}.`, risingLeft ? 'So it climbs up to the vertex.' : 'So it climbs after the vertex.'],
          solution: `The curve increases on <b>${risingLeft ? `x < ${h}` : `x > ${h}`}</b>.`,
        };
      } },
    { name: 'Where it is zero', icon: '0️⃣', blurb: 'Read the x-intercepts.', rounds: 6, think: false,
      say: '0️⃣ Zero value means the curve touches the x-axis.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const r1 = -UI.rint(1, 5), r2 = UI.rint(1, 5);
        return {
          type: 'choice',
          prompt: G1.art(SCENE9.rootsGraph(r1, r2, { caption: 'the crossings are the zeros' }),
            `At which values does this curve equal zero?`),
          options: [`x = ${r1} and x = ${r2}`, `x = 0 only`, `x = ${Math.min(r1, r2)} only`],
          answer: `x = ${r1} and x = ${r2}`,
          why: (v) => String(v) === 'x = 0 only' ? 'Zero on the VALUE axis is not zero on the x-axis.' : 'Both crossings count, not just the left one.',
          hints: ['Follow the horizontal axis.', 'Count every place the curve meets it.', `There are two: ${r1} and ${r2}.`],
          solution: `The curve is zero at <b>x = ${r1}</b> and <b>x = ${r2}</b>.`,
        };
      } },
    { name: 'Critique the claim', icon: '🔍', blurb: 'Reject what the graph does not show.', rounds: 6, think: true,
      say: '🔍 Think first: what was actually measured?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const h = UI.rint(1, 4), k = UI.rint(3, 8), up = i % 2 === 0;
        return {
          type: 'choice',
          problem: {
            sentences: ['A graph was fitted to readings taken between two fixed points and drawn smoothly.',
              'A smooth drawing shows the shape between the readings; it does not extend the evidence.',
              'The fitted curve is drawn from those readings only.'],
            question: 1, keys: ['fitted', 'readings'], extras: [2],
          },
          prompt: G1.art(SCENE9.parabola({ a: up ? 1 : -1, h, k, roots: true, caption: 'fitted between two readings' }),
            `Which sentence is supported by this graph?`),
          options: [`The curve rises then falls as drawn; it makes no claim beyond the readings.`,
            `The real quantity must follow this curve exactly at every point.`,
            `The curve proves the readings are accurate.`],
          answer: `The curve rises then falls as drawn; it makes no claim beyond the readings.`,
          why: () => 'A graph supports statements about what was drawn and measured — not about the world beyond it.',
          hints: ['Separate the drawing from the measurements.', 'What did the readings actually cover?', 'Choose the sentence that stays inside that range.'],
          solution: `Only the first sentence is supported: <b>the shape as drawn, over the readings taken</b>.`,
        };
      } },
  ],

  ghubar: ['A curve that goes up is increasing everywhere.', 'The intercept answers every question.', 'A smooth graph proves the real situation.'],
  praise: ['Interval named!', 'Zeros read!', 'Claim rejected!', 'Range respected!'],
  finale: 'Rising to the vertex, falling after it — and only as far as the readings went. 📈',
};

/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 9 · Vertex Extremes · the vertex as a maximum OR a minimum, read from a table or a formula, and
   said in the words of the situation
   Source: G09-U02-MAT-L02 — الدالة التربيعية والتمثيل البياني والقيم العظمى والصغرى
   (CCSS HSF-IF.C.7a & HSA-SSE.B.3), term 2.

   SCOPE — the EXTREMUM question, which is this document's whole point: the vertex is a maximum when the
   parabola opens downward and a minimum when it opens upward, and which one it is must be read from the
   sign of a, not assumed. This is deliberately narrower than game 01: 01 finds the vertex as a location on
   a picture; here the question is what KIND of value it is and what it MEANS in a real context (a greatest
   profit, a smallest cost). The technique of producing the vertex form belongs to game 05; here the form is
   given and the judgement is the work.
   Named misconceptions: «the vertex is the highest point always», «a negative leading coefficient means a
   negative value», and «the maximum is wherever the curve stops on the page».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g9-vertex-extremes', code: 'G09-U02-MAT-L02', title: 'Vertex Extremes', emoji: '⛰️',
  accent: '#4c5a4a', accentDeep: '#39442f', skyA: '#f4f7f1', skyB: '#dde7d6',
  topic: 'Maximum or minimum at the vertex, and what it means', band: 'g912', lang: 'en',
  objective: 'I can tell whether a quadratic has a maximum or a minimum and read its value from the vertex form.',
  welcome: 'A curve can turn at a high point or a low point. Which one it is decides whether the turning point is the best profit or the smallest cost. ⛰️',
  learnBlurb: 'Opening down gives a maximum; opening up gives a minimum. The sign of a decides.',
  how: {
    what: 'The vertex is the turning point. If a is negative the arms open downward and the vertex is a maximum; if a is positive the arms open upward and it is a minimum. In y = a(x − h)² + k the turning point is (h, k), and k is that greatest or least value.',
    steps: ['⛰️ Look at the sign of a, not at the picture.', 'Read the turning point (h, k) from the form.', '✅ Say which one it is and what it means in the situation.'],
  },

  learn: [
    { say: '<b>y = −(x − 2)² + 5</b> has a negative a, so it opens downward. Its vertex <b>(2, 5)</b> is the MAXIMUM, and 5 is the greatest value.',
      draw(el) { el.append(UI.h('div', { html: SCENE9.parabola({ a: -1, h: 2, k: 5, ymin: -3, ymax: 7, roots: true, caption: 'y = −(x − 2)² + 5' }) })); } },
    { say: '<b>y = 2(x + 1)² − 3</b> has a positive a, so it opens upward. Its vertex <b>(−1, −3)</b> is the MINIMUM, and −3 is the smallest value.',
      draw(el) { el.append(UI.h('div', { html: SCENE9.parabola({ a: 2, h: -1, k: -3, ymin: -5, ymax: 7, roots: true, caption: 'y = 2(x + 1)² − 3' }) })); } },
    { say: 'Your turn. <b>y = −3(x − 4)² + 12</b> — is its turning value a maximum or a minimum?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE9.parabola({ a: -1, h: 4, k: 12, xmin: -1, xmax: 9, ymin: -4, ymax: 14, roots: true, caption: 'the sign of a comes first' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['A maximum — a is negative, so the arms open down.', true], ['A minimum — a is negative, so the value is low.', false], ['Neither — every vertex is both.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — negative a opens downward, and the turning point is the top.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('The sign of a controls the DIRECTION, not the height.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says a negative leading coefficient means the maximum value is negative. Does it?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Negative a, so the answer must be negative.', 5200);
        el.append(UI.h('div', { html: SCENE9.parabola({ a: -1, h: 2, k: 5, ymin: -3, ymax: 8, caption: 'a is negative; the maximum is +5' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — a decides the direction of opening, not the sign of the value.', true], ['Yes — a negative means a negative maximum.', false], ['The value is zero whenever a is negative.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. The sign of a tells you which way it opens; k is just a number.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Read the value of k in the picture.', 'bad'))),
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
    { name: 'Which value', icon: '⛰️', blurb: 'Maximum or minimum?', rounds: 6, think: false,
      say: '⛰️ Read the sign of a first.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const up = i % 2 === 0;
        const a = up ? UI.rint(1, 3) : -UI.rint(1, 3);
        const h = UI.rint(-3, 3), k = UI.rint(-5, 6);
        const shown = `y = ${a}(x ${h < 0 ? '+ ' + Math.abs(h) : '− ' + h})² ${k < 0 ? '− ' + Math.abs(k) : '+ ' + k}`;
        const kind = up ? 'minimum' : 'maximum';
        /* the third distractor replaces k with h; when h and k happen to be equal that would duplicate
           the key, so fall back to a nearby value that is definitely wrong */
        const wrongVal = h !== k ? h : k + 2;
        return {
          type: 'choice',
          prompt: G1.art(SCENE9.parabola({ a: Math.sign(a), h, k, roots: true, caption: shown }),
            `The vertex of <b>${shown}</b> gives which kind of value?`),
          options: [`A ${kind} of ${k}`, `A ${up ? 'maximum' : 'minimum'} of ${k}`, `A ${kind} of ${wrongVal}`],
          answer: `A ${kind} of ${k}`,
          why: (v) => String(v) === `A ${up ? 'maximum' : 'minimum'} of ${k}` ? 'The sign of a decides the direction — look at it again.'
            : 'The value at the vertex is k, not h; h is where it happens.',
          hints: [`a is ${a}, so the arms open ${up ? 'up' : 'down'}.`, 'Opening up gives a minimum, down gives a maximum.', `The value is ${k}.`],
          solution: `<b>A ${kind} of ${k}</b>, occurring at x = ${h}.`,
        };
      } },
    { name: 'Read the table', icon: '📋', blurb: 'Symmetry shows the turning point.', rounds: 6, think: false,
      say: '📋 Equal values on both sides point to the vertex.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const h = UI.rint(-2, 3), k = UI.rint(-4, 5);
        const up = i % 2 === 0;
        const a = up ? 1 : -1;
        const xs = [h - 1, h, h + 1];
        const fn = (x) => a * (x - h) * (x - h) + k;
        return {
          type: 'choice',
          prompt: G1.art(SCENE9.valueTable(xs, fn, { rowA: 'x', rowB: 'y', caption: 'the middle column is never the largest in a downward curve' }),
            `In this table, which column holds the turning value?`),
          options: [`x = ${h}, giving ${k}`, `x = ${xs[0]}, giving ${fn(xs[0])}`, `x = ${xs[2]}, giving ${fn(xs[2])}`],
          answer: `x = ${h}, giving ${k}`,
          why: () => 'A quadratic is symmetric, so the two outer columns match and the middle one is the turning value.',
          hints: ['Compare the outer two columns.', 'They are equal — so the turn is between them.', `The turn is at x = ${h}.`],
          solution: `The outer readings are equal, so the turning value is <b>${k}</b> at x = ${h}.`,
        };
      } },
    { name: 'Say what it means', icon: '💬', blurb: 'The extremum in the situation.', rounds: 6, think: true,
      say: '💬 Think first: is the turning point good news or bad news here?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const profit = i % 2 === 0;
        const h = UI.rint(2, 8), k = UI.rint(10, 40);
        const a = profit ? -1 : 1;
        return {
          type: 'choice',
          problem: {
            sentences: [profit ? 'A small workshop models its daily profit with a quadratic in the price it charges.'
              : 'A small workshop models its daily running cost with a quadratic in the hours it operates.',
              'The sign of the leading coefficient decides whether the turning point is the best or the worst outcome.',
              `The model is ${profit ? 'P' : 'C'}(x) = ${a}(x − ${h})² + ${k}.`],
            question: 2, keys: ['sign', 'turning'], extras: [1],
          },
          prompt: G1.art(SCENE9.parabola({ a, h, k, xmin: h - 6, xmax: h + 6, ymin: profit ? -6 : 0, ymax: k + 6, caption: (profit ? 'P' : 'C') + '(x) = ' + a + '(x − ' + h + ')² + ' + k }),
            `What does the turning point tell the workshop?`),
          options: [profit ? `The greatest profit is ${k}, reached at x = ${h}.` : `The smallest cost is ${k}, reached at x = ${h}.`,
            profit ? `The cost is ${k} everywhere.` : `The greatest cost is ${k} at x = ${h}.`,
            `The workshop must stop at x = ${k}.`],
          answer: profit ? `The greatest profit is ${k}, reached at x = ${h}.` : `The smallest cost is ${k}, reached at x = ${h}.`,
          why: () => 'Opening down makes the turning point a best case; opening up makes it a best case for cost, which is a minimum.',
          hints: [profit ? 'Profit wants a maximum.' : 'Cost wants a minimum.', `The turning value is ${k}.`, `It happens at x = ${h}.`],
          solution: profit ? `<b>The greatest profit is ${k}</b>, at x = ${h}.` : `<b>The smallest cost is ${k}</b>, at x = ${h}.`,
        };
      } },
  ],

  ghubar: ['The vertex is the highest point always.', 'A negative leading coefficient gives a negative value.', 'The maximum is wherever the curve stops on the page.'],
  praise: ['Kind identified!', 'Table read!', 'Meaning stated!', 'Sign used!'],
  finale: 'The sign of a decides direction; the vertex decides the best or worst value. ⛰️',
};

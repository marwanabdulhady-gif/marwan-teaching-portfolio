/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 8 · Slope Intercept · slope from two points, slope and intercept from y = mx + b, and modelling
   Source: G08-U01-MAT-L01 — المعادلات الخطية والميل والمقطع الصادي والنمذجة البيانية (CCSS 8.EE.B.5–6),
   term 1.

   SCOPE — this game takes the GRAPH SIDE of the standard: slope as rise ÷ run between two plotted points
   (B.5), the intercept as the value at x = 0, and the move from a written situation to a line (B.6).
   The rate-of-change framing of the same standard (unit rate read out of a table, y = mx + b written FROM
   a table of a steady process) belongs to G08-U02-MAT-L01 and its game g8-rate-of-change. The two lessons
   overlap on 8.EE.B.5–6; the split is: HERE the figure comes first (points → slope → line), THERE the
   process comes first (table → rate → rule). Recorded in docs/mowazi/g8-expansion.md.

   Mechanic = the thinking: a new pair of points each round, and the slope triangle is drawn from those very
   points. The picture never prints the quotient — the child has to divide the two legs it can see.
   Named misconceptions: «slope is (x2 − x1) ÷ (y2 − y1)», «the intercept is where the line stops being
   useful», and «a steeper picture always means a bigger slope number, whatever the axes» — the last one is
   handled by keeping both axes to one unit per step in every figure.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g8-slope-intercept', code: 'G08-U01-MAT-L01', title: 'Slope Intercept', emoji: '📐',
  accent: '#35507a', accentDeep: '#263c5e', skyA: '#f2f6fc', skyB: '#d9e4f4',
  topic: 'Slope, y-intercept, and graphing a linear model', band: 'g68', lang: 'en',
  objective: 'I can find the slope between two points and read <b>m</b> and <b>b</b> from <b>y = mx + b</b>.',
  welcome: 'A caravan route is drawn as one straight line on a grid. The slope says how steep it is, the intercept says where it starts. 📐',
  learnBlurb: 'Slope is rise ÷ run — the vertical gap over the horizontal one, in that order.',
  how: {
    what: 'Between two points the slope is the change in y divided by the change in x. In y = mx + b the m is that slope and the b is the height of the line at x = 0.',
    steps: ['📐 Read the y-gap between the two points.', 'Read the x-gap between the same two points.', '✅ Divide the y-gap by the x-gap — never the other way round.'],
  },

  learn: [
    { say: 'From <b>(1, 2)</b> to <b>(4, 8)</b> the line climbs 6 and moves 4 across. The slope is 6 ÷ 4 = <b>1.5</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE8.slopeLine({ m: 1.5, b: 0.5, xmin: 0, xmax: 6, ymax: 10, tri: [1, 4], caption: 'rise 6 over run 4' }) })); } },
    { say: 'The same line in the form <b>y = 1.5x + 0.5</b>: the slope m is 1.5 and the intercept b is 0.5 — the height where x is zero.',
      draw(el) { el.append(UI.h('div', { html: SCENE8.slopeLine({ m: 1.5, b: 0.5, xmin: 0, xmax: 6, ymax: 11, bLabel: '0.5', caption: 'b is the height at x = 0' }) })); } },
    { say: 'Your turn. From <b>(2, 3)</b> to <b>(6, 11)</b> — what is the slope?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE8.slopeLine({ m: 2, b: -1, xmin: 0, xmax: 8, ymax: 15, tri: [2, 6], caption: 'count the legs, then divide' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['2', true], ['4', false], ['0.5', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — the y-gap is 8, the x-gap is 4, and 8 ÷ 4 = 2.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '0.5' ? 'That is run ÷ rise. Slope is rise ÷ run.' : 'That is the run alone, not the quotient.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says the intercept of <b>y = 3x − 5</b> is <b>5</b>, because five is the number written there. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('The intercept is just the number you can see: five.', 5200);
        el.append(UI.h('div', { html: SCENE8.slopeLine({ m: 3, b: -5, xmin: -3, xmax: 4, ymin: -7, ymax: 7, bLabel: '−5', caption: 'where does the line meet the y-axis?' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — it is −5; the minus sign travels with the number.', true], ['Yes — the intercept is 5.', false], ['The intercept is 3, the slope number.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. The line meets the y-axis five units BELOW zero, at −5.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Look at the dot on the y-axis in the picture.', 'bad'))),
        }))); el.append(row);
      } },
  ],

  /* ── option hygiene ───────────────────────────────────────────────────────────────────────────────
     Rounds mix drawn numbers with written ones, so a distractor can collide with the answer; the engine
     matches options by text, so the answer's own button is never rewritten. */
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
          return c !== 0 && !seen.has(cand) && cand !== ans;
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
    { name: 'Rise over run', icon: '📐', blurb: 'Slope from two plotted points.', rounds: 6, think: false,
      say: '📐 Count up, count across, divide.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const m = [1, 2, 3, 4, 0.5][i % 5];
        const run = m === 0.5 ? 2 : UI.rint(1, 3);
        const rise = m * run;
        const x1 = UI.rint(0, 2), y1 = UI.rint(1, 4);
        const x2 = x1 + run, y2 = y1 + rise;
        const fmt = (v) => (Number.isInteger(v) ? String(v) : String(v));
        return {
          type: 'choice',
          prompt: G1.art(SCENE8.slopeLine({ m, b: y1 - m * x1, xmin: 0, xmax: x2 + 2, ymax: y2 + 3, tri: [x1, x2], caption: `from (${x1}, ${y1}) to (${x2}, ${y2})` }),
            `The line passes through <b>(${x1}, ${y1})</b> and <b>(${x2}, ${y2})</b>. What is its slope?`),
          options: [fmt(m), fmt(m === 0.5 ? 2 : 1 / m), fmt(rise)],
          answer: fmt(m),
          why: (v) => Number(v) === rise ? 'That is the vertical gap only. Slope divides that gap by the horizontal one.'
            : (Number(v) === 1 / m ? 'That divides across by up. Rise goes on top.' : 'Recount the two legs on the picture.'),
          hints: [`The rise is ${y2} − ${y1} = ${rise}.`, `The run is ${x2} − ${x1} = ${run}.`, `Slope = ${rise} ÷ ${run}.`],
          solution: `Rise ${rise}, run ${run}, so slope = ${rise} ÷ ${run} = <b>${fmt(m)}</b>.`,
        };
      } },
    { name: 'Read m and b', icon: '🔤', blurb: 'Pull the two numbers out of the equation.', rounds: 6, think: false,
      say: '🔤 m sits beside x; b stands alone.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const m = UI.rint(2, 6), b = UI.rint(1, 9) * (i % 3 === 2 ? -1 : 1);
        const shown = b < 0 ? `y = ${m}x − ${Math.abs(b)}` : `y = ${m}x + ${b}`;
        return {
          type: 'choice',
          prompt: G1.art(SCENE8.slopeLine({ m, b, xmin: -1, xmax: 6, ymin: Math.min(0, b) - 2, ymax: m * 4 + b + 2, bLabel: String(b), caption: shown }),
            `In <b>${shown}</b>, what is the slope <b>m</b>?`),
          options: [String(m), String(b), String(m + b)],
          answer: String(m),
          why: (v) => Number(v) === b ? 'That is the intercept — the height at x = 0.' : 'The slope is the number multiplying x.',
          hints: ['The slope is attached to the x.', `Look for the number just before x.`, `${m} multiplies x.`],
          solution: `The coefficient of x is <b>${m}</b>, and b = ${b}.`,
        };
      } },
    { name: 'Build the line', icon: '🖊️', blurb: 'A written situation, then the rule.', rounds: 6, think: true,
      say: '🖊️ Think first: which number is the start and which is the step?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const b = UI.rint(2, 9), m = UI.rint(2, 5);
        return {
          type: 'choice',
          problem: {
            sentences: ['A water tank already holds some water and is then filled at a steady rate.',
              'The amount already inside is the height of the line at time zero.',
              `It starts with ${b} litres and gains ${m} litres every minute.`],
            question: 2, keys: ['steady', 'minute'], extras: [1],
          },
          prompt: G1.art(SCENE8.slopeLine({ m, b, xmin: 0, xmax: 6, ymax: m * 6 + b + 2, tri: [1, 3], caption: 'one line, one start, one steady step' }),
            `The tank starts at <b>${b}</b> litres and gains <b>${m}</b> litres each minute. Which rule gives the litres after t minutes?`),
          options: [`y = ${m}t + ${b}`, `y = ${b}t + ${m}`, `y = ${m + b}t`],
          answer: `y = ${m}t + ${b}`,
          why: (v) => String(v).startsWith(`y = ${b}t`) ? 'That makes the starting amount the step — the line would climb too fast.'
            : 'A single number times t cannot hold a starting amount at all.',
          hints: [`At t = 0 the tank holds ${b}.`, `Each extra minute adds ${m}.`, 'The start is the constant, the gain multiplies t.'],
          solution: `Start ${b} litres is b, and ${m} litres per minute is m: <b>y = ${m}t + ${b}</b>.`,
        };
      } },
  ],

  ghubar: ['Slope is run ÷ rise.', 'The intercept is always a positive number.', 'The bigger the number on the page, the steeper the line.'],
  praise: ['Slope measured!', 'm and b separated!', 'Model written!', 'Rule matched!'],
  finale: 'Two points give the slope, the slope and the intercept give the line. 📐',
};

/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 8 · Steady Tank · rate of change read out of a table or a situation, and the rule y = mx + b built
   from that rate
   Source: G08-U02-MAT-L01 — الميل ومعدل التغير والمعادلة y = mx + b (CCSS 8.EE.B.5–6), term 2.

   SCOPE — this game starts from the PROCESS, not the picture: a table of readings, the constant jump per
   step, its UNIT, and then the rule whose m is that jump and whose b is the reading at step zero. The
   graphing-and-modelling frame of the same standard (points and a slope triangle on a grid) is game 01,
   G08-U01-MAT-L01; here the only figures are tables and a line offered as a check, never as the starting
   point. The split is recorded in docs/mowazi/g8-expansion.md.

   Mechanic = the thinking: every table is generated so the jump is constant in the first level and NOT
   constant in the third, so «find the rate» turns into «is there one rate at all?». The table never prints
   the quotient.
   Named misconceptions: «the rate is the total divided by anything», «the first reading is the rate», and
   «any table of numbers is linear».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g8-rate-of-change', code: 'G08-U02-MAT-L01', title: 'Steady Tank', emoji: '🚰',
  accent: '#1f6b6b', accentDeep: '#155050', skyA: '#eefaf9', skyB: '#cfe9e7',
  topic: 'Rate of change from a table and y = mx + b', band: 'g68', lang: 'en',
  objective: 'I can find the rate of change in a table and write the rule <b>y = mx + b</b> for it.',
  welcome: 'A tank is filled at a steady rate and someone writes down the level every hour. The table is the story. 🚰',
  learnBlurb: 'Rate of change is the jump in the second row per one step in the first row.',
  how: {
    what: 'Look at equal steps across the first row and the matching jumps in the second. If the jumps are all the same, that jump IS the rate of change, and the rule is y = (rate)x + (starting level).',
    steps: ['🚰 Check the first row steps by the same amount each time.', 'Divide the second-row jump by the first-row step.', '✅ The reading at step zero is b.'],
  },

  learn: [
    { say: 'The level goes <b>6, 9, 12, 15</b> every hour. Each hour adds 3, so the rate of change is <b>3 litres per hour</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE8.stepTable([[0, 6, 'start'], [1, 9, '+3'], [2, 12, '+3'], [3, 15, '+3']], { colA: 'hours', colB: 'litres', colOp: 'jump' }) })); } },
    { say: 'The starting level is <b>6</b>, so the rule is <b>y = 3x + 6</b>. The line climbs steadily — a constant rate always draws a straight line.',
      draw(el) { el.append(UI.h('div', { html: SCENE8.slopeLine({ m: 3, b: 6, xmin: 0, xmax: 6, ymax: 26, bLabel: '6', tri: [1, 3], caption: 'y = 3x + 6' }) })); } },
    { say: 'Your turn. A second table reads <b>4, 10, 16, 22</b> at hours 0 to 3. What is its rate of change?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE8.stepTable([[0, 4, 'start'], [1, 10, '?'], [2, 16, '?'], [3, 22, '?']], { colA: 'hours', colB: 'litres', colOp: 'jump' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['6 litres per hour', true], ['4 litres per hour', false], ['18 litres per hour', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 10 − 4 = 6, and every later jump is 6 as well.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '4 litres per hour' ? 'That is the starting level, not the jump.' : 'Compare one row with the row above it, not the top with the bottom.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says the tank in the first table holds <b>15</b> litres, so its rate of change is 15. Does a total amount work as a rate?', wait: true,
      draw(el, L) {
        GHUBAR.pop('The biggest number in the table is the rate.', 5200);
        el.append(UI.h('div', { html: SCENE8.stepTable([[0, 6, 'start'], [1, 9, '+3'], [2, 12, '+3'], [3, 15, '+3']], { colA: 'hours', colB: 'litres', colOp: 'jump' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — a rate is a jump per hour; 15 is just the level at hour 3.', true], ['Yes, 15 is the rate.', false], ['The rate is 3 + 15 = 18.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. Rates have a per — litres per hour, not litres.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Ask what is being added each hour.', 'bad'))),
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
          return c > 0 && cand !== ans && !seen.has(cand);
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
    { name: 'Jump per step', icon: '📶', blurb: 'A constant jump in a table.', rounds: 6, think: false,
      say: '📶 Subtract a row from the row above it.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const b = UI.rint(2, 12), m = UI.rint(2, 8);
        const rows = [0, 1, 2, 3].map((k) => [k, b + m * k, k === 0 ? 'start' : '?']);
        return {
          type: 'choice',
          prompt: G1.art(SCENE8.stepTable(rows, { colA: 'hours', colB: 'litres', colOp: 'jump' }),
            `What is the rate of change of this table, in litres per hour?`),
          options: [String(m), String(b), String(b + m)],
          answer: String(m),
          why: (v) => Number(v) === b ? 'That is the reading at hour zero — the start, not the jump.'
            : 'That adds the start to the jump. The rate is the jump alone.',
          hints: [`Take hour 1 away from hour 2.`, `${b + 2 * m} − ${b + m} = ${m}.`, 'Check the next pair gives the same jump.'],
          solution: `Each hour adds <b>${m}</b>, so the rate of change is ${m} litres per hour.`,
        };
      } },
    { name: 'Write the rule', icon: '✍️', blurb: 'From rate and start to y = mx + b.', rounds: 6, think: false,
      say: '✍️ The start is b, the jump is m.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const b = UI.rint(2, 10), m = UI.rint(2, 7);
        const rows = [0, 1, 2].map((k) => [k, b + m * k, k === 0 ? 'start' : '']);
        return {
          type: 'choice',
          prompt: G1.art(SCENE8.stepTable(rows, { colA: 'hours', colB: 'litres', colOp: 'jump' }),
            `Which rule describes the table? The start is <b>${b}</b> and the jump is <b>${m}</b>.`),
          options: [`y = ${m}x + ${b}`, `y = ${b}x + ${m}`, `y = ${m + b}x`],
          answer: `y = ${m}x + ${b}`,
          why: (v) => String(v).startsWith(`y = ${b}x`) ? 'That makes the start the jump — hour one would overshoot immediately.'
            : 'A rule with only x cannot hold a start.',
          hints: ['The start sits alone as b.', 'The jump multiplies x.', `y = ${m}x + ${b}.`],
          solution: `Rate ${m}, start ${b}: <b>y = ${m}x + ${b}</b>.`,
        };
      } },
    { name: 'Steady or not', icon: '🎚️', blurb: 'Decide whether a rate exists at all.', rounds: 6, think: true,
      say: '🎚️ Think first: are all the jumps equal?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const steady = i % 2 === 0;
        const b = UI.rint(3, 9), m = UI.rint(2, 6);
        const vals = steady ? [b, b + m, b + 2 * m, b + 3 * m] : [b, b + m, b + 2 * m, b + 3 * m + UI.rint(1, 4)];
        const rows = vals.map((v, k) => [k, v, k === 0 ? 'start' : '']);
        return {
          type: 'choice',
          problem: {
            sentences: ['A field notebook records a level once an hour.',
              'A constant rate of change needs the same jump between every two neighbouring readings.',
              `The readings are ${vals.join(', ')}.`],
            question: 1, keys: ['constant', 'neighbouring'], extras: [2],
          },
          prompt: G1.art(SCENE8.stepTable(rows, { colA: 'hours', colB: 'level', colOp: 'reading' }),
            `Does this table have a constant rate of change?`),
          options: [steady ? `Yes — every hour adds ${m}.` : 'No — the last jump is different from the others.',
            steady ? 'No — the numbers grow.' : 'Yes — every table has one.',
            `Yes — the start is ${b}.`],
          answer: steady ? `Yes — every hour adds ${m}.` : 'No — the last jump is different from the others.',
          why: () => 'A constant rate means EVERY neighbouring pair has the same jump — one exception is enough to break it.',
          hints: ['Subtract each pair.', 'Compare all three jumps.', 'One different jump means no single rate.'],
          solution: steady ? `Every jump is ${m}, so the rate is constant.` : 'The jumps are not all equal, so there is no single rate of change.',
        };
      } },
  ],

  ghubar: ['The rate is the largest number in the table.', 'The first reading is the rate.', 'Every table of numbers is linear.'],
  praise: ['Jump measured!', 'Rule written!', 'Steadiness judged!', 'Units kept!'],
  finale: 'Equal jumps across, one rate, one rule. 🚰',
};

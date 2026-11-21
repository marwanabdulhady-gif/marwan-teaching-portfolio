/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 6 · Fair Share Data · mean, median and the mean absolute deviation
   Source: G06-U01-L03 — النسبة والتناسب وتتبع النبض والإحصاء الطبي (حزمة رياضيات v3 المعتمدة), the statistics
   strand, with the unit-03 health-survey framing الأوبئة والطب التجريبي الوقائي.
   Mechanic = the thinking: a data set has a centre and a spread, and they answer different questions. Level 1
   finds the mean by levelling the dots; level 2 finds the median by ordering; level 3 finds the mean absolute
   deviation, which measures how far the values sit from that mean. The dot plot draws the values, never the
   summary statistic.
   Named misconceptions: «the mean is the middle number when written down», and «MAD is the same as the mean».
   This is arithmetic on a labelled classroom survey. It is not medical advice.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g6-fair-share-data', code: 'G06-U01-L03', title: 'Fair Share Data', emoji: '📉',
  accent: '#1f7a63', accentDeep: '#186450', skyA: '#effaf7', skyB: '#cdeee4',
  topic: 'Mean, median and MAD', band: 'g68', lang: 'en',
  objective: 'I can find the <b>mean</b> and the <b>median</b>, and describe the spread with the mean absolute deviation.',
  welcome: 'A survey has many answers. The centre describes them, the spread says how much they differ. 📉',
  learnBlurb: 'The mean levels every value out. The median is the middle one once they are in order.',
  how: {
    what: 'The mean is the total shared equally — add every value, then divide by how many there are. The median is the middle value in order. The MAD is the average distance of each value from the mean.',
    steps: ['📉 Add every value, then divide by how many there are — that is the mean.', 'Put the values in order and take the middle one — that is the median.', '✅ For the MAD, find each distance from the mean, then average those distances.'],
  },

  learn: [
    { say: 'Five readings: <b>2, 3, 3, 5, 7</b>. Add them: 20. Share 20 into 5 equal parts and the mean is <b>4</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE6.dotPlot([2, 3, 3, 5, 7], { caption: 'five readings on the number line' }) })); } },
    { say: 'In order the middle value is the third one, <b>3</b>. So the median is 3 while the mean is 4 — they are different questions.',
      draw(el) { el.append(UI.h('div', { html: SCENE6.ratioTable(['2', '3', '3', '5', '7'], ['1st', '2nd', '3rd', '4th', '5th'], { rowA: 'value', rowB: 'position', caption: 'the median is the middle position' }) })); } },
    { say: 'Your turn. What is the <b>mean</b> of <b>4, 6, 8, 10</b>?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE6.dotPlot([4, 6, 8, 10], { caption: 'four readings' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['7', true], ['8', false], ['28', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 28 shared into four equal parts is 7.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '28' ? 'That is the total. Share it into the four readings.' : '8 is a value, not the centre. Add them all and divide.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says the mean of <b>4, 6, 8, 10</b> is <b>6</b> because it is the second number. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('It is written second. That is the middle.', 5200);
        el.append(UI.h('div', { html: SCENE6.dotPlot([4, 6, 8, 10], { caption: 'where does the centre actually sit?' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — the mean is 7; 6 is just one of the readings.', true], ['He is right, the mean is 6.', false], ['It cannot be found from four values.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. The mean levels all four to 7, not to one of the readings.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Add all four and divide by four. The position in the list is not the mean.', 'bad'))),
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
    { name: 'Level them out', icon: '📉', blurb: 'The mean of a small set.', rounds: 6, think: false,
      say: '📉 Add them all, then divide by how many.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const n = 4, base = UI.rint(3, 9);
        const vals = [base, base + 1, base + 3, base + 4];
        const total = vals.reduce((s, v) => s + v, 0);
        const mean = total / n;
        return {
          type: 'choice',
          prompt: G1.art(SCENE6.dotPlot(vals, { caption: 'four readings from the survey' }),
            `What is the <b>mean</b> of <b>${vals.join(', ')}</b>?`),
          options: [String(mean), String(total), String(vals[1])],
          answer: String(mean),
          why: (v) => Number(v) === total ? 'That is the total. Share it into four equal parts.' : 'That is one of the readings, not the centre.',
          hints: [`Add the four values: ${total}.`, `There are ${n} values.`, `Divide ${total} by ${n}.`],
          solution: `${total} ÷ ${n} = <b>${mean}</b>.`,
        };
      } },
    { name: 'The middle one', icon: '🔎', blurb: 'Median, after ordering.', rounds: 6, think: false,
      say: '🔎 Put them in order before taking the middle.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const vals = [UI.rint(2, 6), UI.rint(7, 12), UI.rint(3, 5), UI.rint(6, 9), UI.rint(10, 14)];
        const sorted = vals.slice().sort((a, b) => a - b);
        const med = sorted[2];
        return {
          type: 'choice',
          prompt: G1.art(SCENE6.dotPlot(vals, { caption: 'five readings, given out of order' }),
            `What is the <b>median</b> of <b>${vals.join(', ')}</b>?`),
          options: [String(med), String(vals[2]), String(Math.round(vals.reduce((s, v) => s + v, 0) / 5))],
          answer: String(med),
          why: (v) => Number(v) === vals[2] ? 'That is the third value as written. Order them first.' : 'That is the mean. The median is a position, not an average of the total.',
          hints: ['Write the values smallest to largest.', 'With five values the middle is the third.', 'Read that value off the ordered list.'],
          solution: `In order: ${sorted.join(', ')} → median <b>${med}</b>.`,
        };
      } },
    { name: 'How far from the mean', icon: '📏', blurb: 'The mean absolute deviation.', rounds: 6, think: true,
      say: '📏 Think first: distance from the mean, then average those distances.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const m = UI.rint(5, 12);
        const vals = [m - 2, m - 1, m + 1, m + 2];
        const mean = m;
        const devs = vals.map((v) => Math.abs(v - mean));
        const mad = devs.reduce((s, d) => s + d, 0) / vals.length;
        return {
          type: 'choice',
          problem: {
            sentences: ['A class records the same measurement for four groups.',
              'The readings are close together, but not identical.',
              `The four readings are ${vals.join(', ')}.`],
            question: 2, keys: ['readings'], extras: [1],
          },
          prompt: `The readings are <b>${vals.join(', ')}</b>, mean <b>${mean}</b>. What is the <b>MAD</b>?`,
          options: [String(mad), String(mean), String(devs.reduce((s, d) => s + d, 0))],
          answer: String(mad),
          why: (v) => Number(v) === mean ? 'The MAD is the average distance from the mean, not the mean itself.' : 'That is the total of the distances. Divide by how many there are.',
          hints: [`Each reading is ${devs.join(', ')} away from ${mean}.`, `Their total is ${devs.reduce((s, d) => s + d, 0)}.`, 'Divide that by 4.'],
          solution: `Distances ${devs.join(', ')} average to <b>${mad}</b>.`,
        };
      } },
  ],

  ghubar: ['The mean is the middle number as written.', 'MAD is another name for the mean.', 'A bigger spread means a bigger mean.'],
  praise: ['Mean levelled!', 'Median ordered!', 'Spread measured!', 'Centre and spread told apart!'],
  finale: 'One number for the centre, one for the spread — you can describe a data set. 📉',
};

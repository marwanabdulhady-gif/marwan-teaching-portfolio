/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 6 · Altitude Line · integers, opposites and distance on the number line
   Source: G06-U01-MAT-L01 (the integer-number strand of the Grade 6 first-term bundle) with the unit-01
   scientific-context framing — قراءة السلّم الحراري والارتفاعات تحت سطح البحر.
   Mechanic = the thinking: the number line is the instrument. A negative number is a position, not a
   "minus sign in front of a number". Level 1 reads a position (including below zero); level 2 finds the
   opposite; level 3 measures the distance between two positions, which must come out positive whichever
   way round it is asked. The line draws the marks, never the answer.
   Named misconceptions: «−7 is bigger than −2 because 7 > 2», and «distance below zero is negative».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g6-altitude-line', code: 'G06-U01-MAT-L01', title: 'Altitude Line', emoji: '📈',
  accent: '#2f4f7f', accentDeep: '#253d63', skyA: '#f0f4fb', skyB: '#d5dff0',
  topic: 'Integers on the number line', band: 'g68', lang: 'en',
  objective: 'I can read, order and find the <b>distance</b> between integers, including numbers below zero.',
  welcome: 'Above sea level is positive, below it is negative. The line decides, not the digit. 📈',
  learnBlurb: 'On a number line, further right is greater — even when the digit is smaller.',
  how: {
    what: 'A negative number sits to the left of zero. The further left, the smaller. Distance is always positive and is found by counting the steps between the two positions.',
    steps: ['📈 Find both positions on the line.', 'Right is greater — compare positions, not digits.', '✅ For distance, count the steps and keep the answer positive.'],
  },

  learn: [
    { say: 'Here the line runs from <b>−5</b> to <b>5</b>. Zero is in the middle; −3 sits three steps to its left.',
      draw(el) { el.append(UI.h('div', { html: SCENE6.integerLine(-5, 5, { mark: -3, markName: '−3', caption: 'each step is one unit' }) })); } },
    { say: '<b>−3</b> is greater than <b>−5</b> even though 5 is a bigger digit. The line decides: −3 is further right.',
      draw(el) { el.append(UI.h('div', { html: SCENE6.integerLine(-6, 2, { marks: [{ v: -5, fill: '#f3c98b', name: '−5' }, { v: -3, fill: '#8fc4e8', name: '−3' }], caption: 'further right is greater' }) })); } },
    { say: 'Your turn. What is the distance between <b>−2</b> and <b>4</b>?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE6.integerLine(-4, 6, { marks: [{ v: -2, fill: '#8fc4e8', name: '−2' }, { v: 4, fill: '#f3c98b', name: '4' }], caption: 'how many steps apart?' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['6', true], ['2', false], ['−6', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — from −2 to 4 is six steps, and distance is always positive.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '2' ? 'That is the difference of the digits. Count the steps on the line.' : 'Distance cannot be negative — it is a length.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says <b>−7</b> is warmer than <b>−2</b> because 7 is bigger than 2. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Seven beats two. Minus seven is the bigger number.', 5200);
        el.append(UI.h('div', { html: SCENE6.integerLine(-8, 2, { marks: [{ v: -7, fill: '#8fc4e8', name: '−7' }, { v: -2, fill: '#f3c98b', name: '−2' }], caption: 'which is further right?' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — −7 is further left, so it is colder than −2.', true], ['He is right — 7 is bigger than 2.', false], ['They are the same temperature.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. Further left is smaller, so −7 < −2.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('The minus sign is not decoration. Read the position on the line.', 'bad'))),
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
    { name: 'Read the line', icon: '📈', blurb: 'Which is greater?', rounds: 6, think: false,
      say: '📈 Right is greater — compare positions.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const a = -UI.rint(1, 9);
        /* draw the second value from a range that excludes the first, so the pair is always distinct */
        const b = -(a === -9 ? 8 : 9);
        const hi = Math.max(a, b), lo = Math.min(a, b);
        return {
          type: 'choice',
          prompt: G1.art(SCENE6.integerLine(-10, 1, { marks: [{ v: a, fill: '#8fc4e8', name: String(a) }, { v: b, fill: '#f3c98b', name: String(b) }], caption: 'both below zero' }),
            `Which is greater, <b>${a}</b> or <b>${b}</b>?`),
          options: [String(hi), String(lo), 'they are equal'],
          answer: String(hi),
          why: (v) => Number(v) === lo ? 'A bigger digit below zero means a smaller value — further left.' : 'Both are below zero, so compare how far left each one sits.',
          hints: ['Both numbers are negative.', 'The one closer to zero is greater.', 'Look which mark is further right.'],
          solution: `${hi} is further right than ${lo}, so <b>${hi} > ${lo}</b>.`,
        };
      } },
    { name: 'The opposite', icon: '🔄', blurb: 'Same distance, other side.', rounds: 6, think: false,
      say: '🔄 The opposite sits the same distance from zero.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const v = UI.rint(2, 12) * (i % 2 ? 1 : -1);
        return {
          type: 'choice',
          prompt: G1.art(SCENE6.integerLine(-13, 13, { mark: v, markName: String(v), caption: 'the same distance, the other side of zero' }),
            `What is the <b>opposite</b> of <b>${v}</b>?`),
          options: [String(-v), String(v), String(Math.abs(v) + 1)],
          answer: String(-v),
          why: (v2) => Number(v2) === v ? 'That is the number itself, not its opposite.' : 'The opposite is the same distance from zero on the other side.',
          hints: ['Count how far the mark is from zero.', 'Go the same distance the other way.', 'Only the sign changes.'],
          solution: `The opposite of ${v} is <b>${-v}</b>.`,
        };
      } },
    { name: 'Distance apart', icon: '📏', blurb: 'Steps between two positions.', rounds: 6, think: true,
      say: '📏 Think first: distance is a length, so it is never negative.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const p = UI.rint(1, 9), q = -UI.rint(1, 9);
        const d = Math.abs(p - q);
        return {
          type: 'choice',
          problem: {
            sentences: ['A weather station records temperatures at two times of day.',
              'One reading is above freezing and one is below.',
              `The readings are ${p}°C and ${q}°C.`],
            question: 2, keys: ['readings'], extras: [1],
          },
          prompt: `What is the distance between <b>${p}</b> and <b>${q}</b>?`,
          options: [String(d), String(p + q), String(-d)],
          answer: String(d),
          why: (v) => Number(v) === -d ? 'Distance is a length, so it cannot be negative.' : 'Adding the two readings mixes the positions. Count the steps.',
          hints: [`${p} is ${p} steps right of zero.`, `${q} is ${Math.abs(q)} steps left of zero.`, 'Add the two step counts.'],
          solution: `From ${q} to zero is ${Math.abs(q)} steps, then ${p} more → <b>${d}</b>.`,
        };
      } },
  ],

  ghubar: ['A bigger digit is always a bigger number.', 'Distance below zero is negative.', 'The minus sign can be ignored when comparing.'],
  praise: ['Position read!', 'Opposite found!', 'Distance measured!', 'The line decided!'],
  finale: 'On the number line, position beats digits — you can read any integer. 📈',
};

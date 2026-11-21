/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 6 · Pulse Ratio · ratios, rates and health statistics on a chart
   Source: G06-U01-L03 — النسبة والتناسب وتتبع النبض والإحصاء الطبي (حزمة رياضيات v3 المعتمدة),
   the lesson kit filed under الرياضيات / الوحدة 01.
   Mechanic = the thinking: the lesson tracks a pulse and reports it as a rate — beats per minute — and the
   same idea answers "how many in a group of 100?" Level 1 reads a part-to-part ratio straight off a table
   of recorded counts; level 2 scales a rate to a different time span; level 3 converts a rate to a count
   per 100 so two unlike groups can be compared fairly. The table prints the recorded counts, never the
   simplified ratio or the rate.
   Named misconceptions: «compare raw counts across groups of different size», and «a rate cannot be
   scaled to another time span».
   This is arithmetic on a labelled classroom record. It is not medical advice, and no reading here
   describes a real person's health.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g6-pulse-ratio', code: 'G06-U01-L03', title: 'Pulse Ratio', emoji: '📊',
  accent: '#8c3f6b', accentDeep: '#743357', skyA: '#fdf1f7', skyB: '#f2d8e7',
  topic: 'Ratios, rates and per-hundred counts', band: 'g68', lang: 'en',
  objective: 'I can scale a <b>rate</b> to another time span and turn a count into a rate per 100.',
  welcome: 'A class records its pulse on a chart. Rates let you compare groups of different sizes. 📊',
  learnBlurb: 'A rate compares two different units — beats per minute, or how many in every hundred.',
  how: {
    what: 'A rate pairs two different units. To move it to another time span, multiply by the same factor. To compare groups of different sizes, scale each count to 100 first.',
    steps: ['📊 Read the two units in the rate.', 'Scale both quantities by the same factor.', '✅ To compare fairly, convert each count to a count per 100.'],
  },

  learn: [
    { say: 'A pupil counts <b>24</b> beats in <b>20</b> seconds. To reach a minute, multiply the time by 3 — so multiply the beats by 3 too: <b>72</b> beats per minute.',
      draw(el) { el.append(UI.h('div', { html: SCENE6.ratioTable([20, 60], [24, 72], { rowA: 'seconds', rowB: 'beats', caption: 'same rate, longer time' }) })); } },
    { say: 'The rate is what carries over. 12 beats in 10 s is the same rate as 72 in 60 s, because both are 1.2 beats each second.',
      draw(el) { el.append(UI.h('div', { html: SCENE6.doubleLine([0, 10, 20, 30], [0, 12, 24, 36], { topName: 'seconds', bottomName: 'beats', caption: 'two scales, one rate' }) })); } },
    { say: 'Your turn. A pupil counts <b>15</b> beats in <b>10</b> seconds. What is that in beats per minute?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE6.ratioTable([10, 60], [15, null], { rowA: 'seconds', rowB: 'beats', askCol: 1, caption: 'a minute is six times ten seconds' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['90', true], ['25', false], ['150', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 60 s is six times 10 s, so 15 × 6 = 90.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '25' ? 'You added the seconds. Multiply the beats by the same factor.' : 'That is ten times too big — a minute is six ten-second spans, not ten.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says Group A with <b>18 of 30</b> is better than Group B with <b>25 of 50</b> because 25 is bigger. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Twenty-five beats thirty. Group B wins.', 5200);
        el.append(UI.h('div', { html: SCENE6.ratioTable([18, 25], [30, 50], { rowA: 'count', rowB: 'group', caption: 'two groups, different sizes' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — 18 of 30 is 60 per 100 and 25 of 50 is 50 per 100, so A is higher.', true], ['He is right — 25 beats 18.', false], ['They cannot be compared at all.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. Scale each to 100 first: 60% against 50%.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('The groups are different sizes, so the raw counts cannot decide.', 'bad'))),
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
    { name: 'Read the record', icon: '📊', blurb: 'A ratio from a recorded table.', rounds: 6, think: false,
      say: '📊 Write the two counts in the order asked.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        /* never draw a pair that is already in lowest terms as "a to a" — a 3 : 3 question is not a
           ratio question, it is a giveaway, and "1 : 1" is the only honest answer to it. */
        let a = UI.rint(2, 6), b = UI.rint(3, 8);
        if (a === b) b = a + UI.rint(1, 3);
        const g = (x, y) => (y ? g(y, x % y) : x);
        const d = g(a, b) || 1;
        const low = `${a / d} : ${b / d}`;
        return {
          type: 'choice',
          /* the table holds NUMBERS in both rows — the words live in the row names and the caption.
             Putting 'counted' / 'in the group' in a value row prints prose inside a number grid. */
          prompt: G1.art(/* one column, two rows: group A holds a, group B holds b. A ratio is two quantities of the SAME kind,
             so they belong one per row — not two values per row. */
          SCENE6.ratioTable([a], [b], { rowA: 'group A', rowB: 'group B', askCol: -1, caption: 'the two recorded counts' }),
            `A chart records <b>${a}</b> of group A and <b>${b}</b> of group B. What is the ratio <b>${a} : ${b}</b> in lowest terms?`),
          options: [low, `${b / d} : ${a / d}`, `${a} : ${a + b}`],
          answer: low,
          why: () => 'Simplify by dividing both parts by the same number — do not reverse the order.',
          hints: [`Both ${a} and ${b} share a common factor.`, 'Find the largest number that divides both.', 'Divide both parts by it.'],
          solution: `${a} : ${b} = <b>${low}</b>.`,
        };
      } },
    { name: 'Scale the rate', icon: '⏱', blurb: 'Another time span, same rate.', rounds: 6, think: false,
      say: '⏱ Scale both quantities by the same factor.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const beats = UI.rint(8, 20), secs = [10, 15, 20, 30][i % 4];
        const target = secs === 30 ? 60 : 60;
        const k = target / secs;
        const ans = Math.round(beats * k);
        return {
          type: 'choice',
          prompt: G1.art(SCENE6.ratioTable([secs, target], [beats, null], { rowA: 'seconds', rowB: 'beats', askCol: 1, caption: 'same rate, one minute' }),
            `A pupil counts <b>${beats}</b> beats in <b>${secs}</b> seconds. How many in <b>60</b> seconds?`),
          options: [String(ans), String(beats + 60 - secs), String(beats * 10)],
          answer: String(ans),
          why: (v) => Number(v) === beats + 60 - secs ? 'Adding the extra seconds does not scale the rate.' : 'A minute is 60 seconds, not ten times the time span.',
          hints: [`How many ${secs}-second spans fit in 60 seconds?`, `That factor is ${k}.`, `Multiply ${beats} by ${k}.`],
          solution: `${beats} × ${k} = <b>${ans}</b> beats per minute.`,
        };
      } },
    { name: 'Per hundred', icon: '💯', blurb: 'Compare groups fairly.', rounds: 6, think: true,
      say: '💯 Think first: the groups are not the same size.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const total = [20, 25, 40, 50][i % 4];
        const count = UI.rint(Math.round(total * 0.3), Math.round(total * 0.8));
        const per100 = Math.round((count / total) * 100);
        return {
          type: 'choice',
          problem: {
            sentences: ['Two classes record the same count on their charts.',
              'Each class has a different number of pupils in the group.',
              `One class recorded ${count} out of ${total}.`],
            question: 2, keys: ['count', 'group'], extras: [],
          },
          prompt: `<b>${count}</b> out of <b>${total}</b> is what rate per <b>100</b>?`,
          options: [String(per100), String(count), String(total - count)],
          answer: String(per100),
          why: (v) => Number(v) === count ? 'That is the raw count, not the rate per hundred.' : 'That is the other part of the group. Scale the count, not the remainder.',
          hints: [`Write the count as a fraction of the group: ${count}/${total}.`, 'Multiply by 100 to reach per hundred.', `${count} ÷ ${total} × 100.`],
          solution: `${count}/${total} × 100 = <b>${per100}</b> per 100.`,
        };
      } },
  ],

  ghubar: ['The bigger count is the better group.', 'A rate only works for one time span.', 'Compare the raw counts directly.'],
  praise: ['Ratio simplified!', 'Rate scaled!', 'Per hundred found!', 'Fair comparison!'],
  finale: 'Rates let you compare things of different sizes honestly. 📊',
};

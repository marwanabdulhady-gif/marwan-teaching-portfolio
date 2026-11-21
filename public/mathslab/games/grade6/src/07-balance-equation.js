/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 6 · Balance Equation · one-step equations and inequalities on the number line
   Source: G06-U02-MAT-L02 (CCSS 6.EE.B.7 & 6.EE.B.8), term 2, unit 02 — المعادلات الخطية ذات الخطوة
   الواحدة والمتباينات على خط الأعداد.
   Mechanic = the thinking: an equation is a balance. Whatever you do to one pan you must do to the other,
   so the beam stays level. Level 1 solves a one-step equation; level 2 checks a proposed solution; level 3
   reads an inequality and marks its solution set on the line. The balance draws the pans, never the value
   of x.
   Named misconceptions: «whatever you do to one side you may do to the other only sometimes», and «an
   inequality solution is a single point».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g6-balance-equation', code: 'G06-U02-MAT-L02', title: 'Balance Equation', emoji: '⚖️',
  accent: '#5b4fa8', accentDeep: '#4a3f8c', skyA: '#f5f3ff', skyB: '#ded9f7',
  topic: 'One-step equations and inequalities', band: 'g68', lang: 'en',
  objective: 'I can solve a <b>one-step equation</b> by keeping the balance, and show an inequality on a number line.',
  welcome: 'A beam stays level only if both pans change together. ⚖️',
  learnBlurb: 'An equation is a balance. Undo the operation on both sides to leave x alone.',
  how: {
    what: 'To solve x + 4 = 10, take 4 away from both pans. To solve 3x = 12, share both pans into three equal groups. An inequality describes a range, so its answer is drawn as a span on the line, not a dot.',
    steps: ['⚖️ Name the operation acting on x.', 'Undo it on both sides so the beam stays level.', '✅ For an inequality, shade every value that works.'],
  },

  learn: [
    { say: 'The left pan holds <b>x</b> and <b>4</b> weights. The right pan holds <b>10</b>. The beam is level, so x + 4 = 10.',
      draw(el) { el.append(UI.h('div', { html: SCENE6.balance(['x', 4], [10], { caption: 'x + 4 = 10' }) })); } },
    { say: 'Take 4 from the left pan and 4 from the right pan. Now the left is x alone and the right is <b>6</b>, and the beam is still level: x = 6.',
      draw(el) { el.append(UI.h('div', { html: SCENE6.balance(['x'], [6], { caption: 'x = 6 — the same beam, both pans lighter' }) })); } },
    { say: 'Your turn. The beam reads <b>3x = 12</b>. What is x?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE6.balance(['x', 'x', 'x'], [12], { caption: 'three x weights balance 12' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['4', true], ['9', false], ['36', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — share 12 into three equal groups and each x is 4.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '9' ? 'You subtracted. The three x weights are multiplied — share instead.' : 'Multiplying again makes it bigger, not smaller. Each pan is split into three.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says <b>x + 5 = 12</b> gives <b>x = 17</b>, because he added 5 to the right side. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Add five to both. Twelve and five is seventeen.', 5200);
        el.append(UI.h('div', { html: SCENE6.balance(['x', 5], [12], { caption: 'x + 5 = 12' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — take 5 from both pans, so x = 7.', true], ['He is right — x = 17.', false], ['x = 12, the 5 does not matter.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. Undo the +5 by subtracting 5 from both pans.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Adding to one pan tips the beam. Undo the operation, do not repeat it.', 'bad'))),
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
    { name: 'One step', icon: '⚖️', blurb: 'Undo the operation.', rounds: 6, think: false,
      say: '⚖️ Undo it on both sides.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const x = UI.rint(2, 12);
        const add = i % 2 === 0;
        const k = UI.rint(2, 9);
        const shown = add ? x + k : x * k;
        const ans = add ? x : x;
        return {
          type: 'choice',
          prompt: G1.art(SCENE6.balance(add ? ['x', k] : new Array(Math.min(k, 4)).fill('x'), [shown], { caption: add ? `x + ${k} = ${shown}` : `${k}x = ${shown}` }),
            add ? `Solve <b>x + ${k} = ${shown}</b>.` : `Solve <b>${k}x = ${shown}</b>.`),
          options: [String(ans), String(add ? shown + k : shown - k), String(add ? k : shown * k)],
          answer: String(ans),
          why: () => (add ? `Subtract ${k} from both sides — the beam must stay level.` : `Share ${shown} into ${k} equal groups instead of subtracting.`),
          hints: [add ? `x has ${k} added to it.` : `x is multiplied by ${k}.`, add ? `Take ${k} away from both sides.` : `Divide both sides by ${k}.`, 'Check by putting your x back in.'],
          solution: add ? `x = ${shown} − ${k} = <b>${ans}</b>.` : `x = ${shown} ÷ ${k} = <b>${ans}</b>.`,
        };
      } },
    { name: 'Check it', icon: '🔎', blurb: 'Is the proposed x correct?', rounds: 6, think: false,
      say: '🔎 Put the value back in and see if the beam stays level.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const x = UI.rint(2, 10), k = UI.rint(2, 8);
        const shown = x + k;
        const bad = x + UI.rint(1, 3) * (i % 2 ? 1 : -1);
        return {
          type: 'choice',
          prompt: G1.art(SCENE6.balance(['x', k], [shown], { caption: `x + ${k} = ${shown}` }),
            `Does <b>x = ${bad}</b> solve <b>x + ${k} = ${shown}</b>?`),
          options: ['no', 'yes', 'only if x is negative'],
          answer: bad === x ? 'yes' : 'no',
          why: (v) => (v === 'yes' ? `${bad} + ${k} is not ${shown}, so it does not balance.` : `Put it back: ${bad} + ${k} = ${bad + k}, which is not ${shown}.`),
          hints: ['Substitute the value for x.', `Add ${k} to it.`, `Does the result equal ${shown}?`],
          solution: `${bad} + ${k} = ${bad + k}, and ${bad + k === shown ? 'that matches' : `that is not ${shown}`} — so <b>${bad === x ? 'yes' : 'no'}</b>.`,
        };
      } },
    { name: 'Range on the line', icon: '📈', blurb: 'An inequality is a span.', rounds: 6, think: true,
      say: '📈 Think first: an inequality holds for many values.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const k = UI.rint(2, 9);
        const strict = i % 2 === 0;
        const txt2 = strict ? `x > ${k}` : `x ≤ ${k}`;
        return {
          type: 'choice',
          problem: {
            sentences: ['A safety notice gives a limit on a load.',
              'Every value inside the limit is allowed, not just one.',
              `The rule is written ${txt2}.`],
            question: 2, keys: ['limit'], extras: [1],
          },
          prompt: `Which values make <b>${txt2}</b> true?`,
          options: [strict ? `every number greater than ${k}` : `every number up to and including ${k}`,
            `only the single number ${k}`, strict ? `every number less than ${k}` : `every number greater than ${k}`],
          answer: strict ? `every number greater than ${k}` : `every number up to and including ${k}`,
          why: () => (strict ? 'The > sign means greater than, and the endpoint is not included.' : 'The ≤ sign includes the endpoint as well as everything below it.'),
          hints: ['Read the sign from the point of view of x.', strict ? '> means greater than, and it excludes the endpoint.' : '≤ includes the endpoint and everything smaller.', 'A whole range works, not one value.'],
          solution: `<b>${txt2}</b> is true for ${strict ? `every number greater than ${k}` : `every number up to and including ${k}`}.`,
        };
      } },
  ],

  ghubar: ['Do the same thing to the other pan only if you like.', 'An inequality has one answer.', 'If x has 5 added, add another 5.'],
  praise: ['Balanced!', 'Solution checked!', 'Range read!', 'Undone on both sides!'],
  finale: 'Keep the beam level and any one-step equation falls. ⚖️',
};

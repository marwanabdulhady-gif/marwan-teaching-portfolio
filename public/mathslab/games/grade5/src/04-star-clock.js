/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 5 · Star Clock · the circle, its 360 parts, and fractions of a turn
   Source: G05-U01-L03 (unit 01, الفلك والمواقيت والاهتداء بالنجوم), term 1.
   Mechanic = the thinking: the lesson's paper-disc activity — fold the disc in half, then in quarters, and
   compare a quarter turn with a half turn. Level 1 names the fraction of a full turn a marked sector is;
   level 2 finds the missing angle that completes a straight line or a full turn; level 3 turns a night-watch
   duration into degrees, because the sky turns 360° in 24 hours. Sectors are drawn, never labelled with the
   number the child must produce.
   The source document is explicit: these are teaching examples, not real astronomical readings, and no qibla
   direction may be inferred from a drawn sector. The unit note carries that caution.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g5-star-clock', code: 'G05-U01-L03', title: 'Star Clock', emoji: '🌙',
  accent: '#1d3f6e', accentDeep: '#173257', skyA: '#eef3fb', skyB: '#d3e0f2',
  topic: 'Degrees and fractions of a turn', band: 'g35', lang: 'en',
  objective: 'I can read a <b>central angle</b> in degrees and name it as a fraction of a full turn of 360°.',
  welcome: 'Al-Bīrūnī measured the sky in degrees. A full turn is 360 — fold the disc and see. 🌙',
  learnBlurb: 'A full turn is 360°. Half is 180°, a quarter is 90°.',
  how: {
    what: 'One complete turn is 360 degrees. The angle at the centre of a circle measures how much of that turn you have swept.',
    steps: ['🌙 Decide how much of the whole turn is shaded.', '🌙 Compare it with 90°, 180° or 360°.', '✅ Multiply 360 by the fraction to get the degrees.'],
  },

  learn: [
    { say: 'Fold a paper disc in half. The crease cuts the full turn into <b>two</b> equal parts — so half a turn is <b>180°</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE5.circleAngle(180, { showDeg: false, caption: 'half a turn = 180°' }) })); } },
    { say: 'Fold again and you have <b>four</b> equal parts. A quarter turn is <b>90°</b> — the square corner.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE5.circleAngle(90, { showDeg: false, caption: 'a quarter turn = 90°' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '90° + 90° + 90° + 90° = <b>360°</b>' }));
      } },
    { say: 'Your turn. This sector is <b>one eighth</b> of the full turn. How many degrees is it?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE5.circleAngle(45, { showDeg: false }) }));
        const row = UI.h('div', { class: 'opts' });
        [['45°', true], ['90°', false], ['8°', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 360 ÷ 8 = 45 degrees.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '8°' ? 'Eight is the number of parts, not the degrees in each.' : 'A quarter of a turn is 90°, so an eighth is half of that.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says a quarter turn is <b>100°</b>, because a quarter of 400 is 100. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('A whole is 400 — like a full circle of percent. A quarter is 100.', 5200);
        el.append(UI.h('div', { html: SCENE5.circleAngle(90, { showDeg: true, caption: 'a quarter turn is 90°' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — a full turn is 360°, so a quarter is 90°.', true], ['He is right — 100°.', false], ['A quarter turn has no fixed size.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. 360 is the circle; 100 is the percent bar. Do not mix them.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Four right angles must close the circle exactly: 4 × 90 = 360.', 'bad'))),
        }))); el.append(row);
      } },
  ],


  /* ── option hygiene ───────────────────────────────────────────────────────────────────────────────
     A round's `options` are built from the numbers the question drew, so a distractor can occasionally
     coincide with the answer (the swapped pair when x === y, a fixed fallback that lands on the right
     value). Two identical buttons would be a broken question, and the engine does not dedupe.
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
    { name: 'Name the turn', icon: '🌙', blurb: 'Which fraction of 360° is shaded?', rounds: 6, think: false,
      say: '🌙 Compare the sector with a half and a quarter.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const pick = [[90, '1/4'], [180, '1/2'], [45, '1/8'], [120, '1/3'], [270, '3/4']][i % 5 === 0 ? 0 : UI.rint(0, 4)];
        const deg = pick[0], frac = pick[1];
        return {
          type: 'choice',
          prompt: G1.art(SCENE5.circleAngle(deg, { max: 300, showDeg: false }), 'The centre mark is the vertex. Ticks are every 15°.'),
          options: [frac, frac === '1/4' ? '1/2' : '1/4', '1/6'],
          answer: frac,
          why: (v) => v === '1/2' ? 'Half a turn is 180°. Look at how far the shading reaches.' : 'Count how many of these sectors would fill the circle.',
          hints: ['A quarter turn reaches the square corner.', 'A half turn is a straight line across.', `How many sectors this size fill 360°?`],
          solution: `${deg}° is <b>${frac}</b> of a full turn.`,
        };
      } },
    { name: 'Missing degrees', icon: '📐', blurb: 'Complete the straight line or the turn.', rounds: 6, think: false,
      say: '📐 A straight line is 180°. A full turn is 360°.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const given = i % 2 === 0 ? UI.rint(30, 150) : UI.rint(90, 270);
        const total = i % 2 === 0 ? 180 : 360;
        const answer = total - given;
        return {
          type: 'choice',
          prompt: G1.art(SCENE5.circleAngle(given, { showDeg: true, max: 280, caption: `together with the unshaded part this makes ${total}°` }),
            `The shaded part is <b>${given}°</b>. What is the unshaded part?`),
          options: [`${answer}°`, `${given}°`, `${total}°`],
          answer: `${answer}°`,
          why: () => `The whole is ${total}°, so subtract what you already have: ${total} − ${given}.`,
          hints: [`The whole turn you are working in is ${total}°.`, `Subtract ${given} from ${total}.`, 'Do not add — you want the part that is missing.'],
          solution: `${total} − ${given} = <b>${answer}°</b>.`,
        };
      } },
    { name: 'Night watch', icon: '🕰', blurb: 'Hours of sky turned into degrees.', rounds: 6, think: true,
      say: '🕰 Think first: what does the sky do in one hour?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const hours = UI.rint(2, 8);
        const answer = hours * 15;
        return {
          type: 'choice',
          problem: {
            sentences: ['The desert caravan travels by night, steering by the stars.',
              'The camels are loaded before the moon rises.',
              `The night watch lasts ${hours} hours.`,
              'In 24 hours the sky turns a full 360 degrees.',
              'How many degrees does the sky turn during the watch?'],
            question: 4, keys: ['degrees', 'hours'], extras: [1],
          },
          prompt: `The sky turns <b>360°</b> in <b>24</b> hours. How far does it turn in <b>${hours}</b> hours?`,
          options: [`${answer}°`, `${360 - answer}°`, `${hours * 24}°`],
          answer: `${answer}°`,
          why: (v) => Number(v) === 360 - answer ? 'That is the rest of the night, not the watch.' : `One hour is 360 ÷ 24 = 15°, so multiply by ${hours}.`,
          hints: ['Find the degrees in one hour first.', '360 ÷ 24 = 15°.', `Then 15 × ${hours}.`],
          solution: `15 × ${hours} = <b>${answer}°</b>.`,
        };
      } },
  ],

  ghubar: ['A full circle is 400 degrees.', 'A quarter turn is 100.', 'Angles are just how wide the drawing looks.'],
  praise: ['Turn named!', 'Missing angle found!', 'Watch measured!', '360 ÷ 4 = 90, always!'],
  finale: 'You can cut the sky into degrees — a quarter turn is 90°, always! 🌙',
};

/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 7 · Dome and Corner · the two geometry strands of one lesson: the circle (circumference and area)
   and the angle pairs that meet at a corner
   Source: G07-U02-MAT-L02 (CCSS 7.G.B.4 and 7.G.B.5), term 2 — الدائرة والزوايا: المحيط والمساحة
   والزوايا المتتامة والمتكاملة والمتقابلة بالرأس.

   SCOPE — both halves are kept in ONE game because the source document teaches them as one lesson and
   a separate game per strand would split a 45-minute period in two. Circle work stays on C = 2πr and
   A = πr² including the diameter case; the angle work stays on writing and solving the one- or two-step
   equation, which is what the document's objectives ask for. The historical anchor (al-Kāshī's
   «الرسالة المحيطية», π to sixteen places) appears once, as the reason C ÷ d is the same for every circle.

   Mechanic = the thinking: figures are drawn to the numbers in the question and show only what is given —
   the area, the circumference and the unknown angle are never printed on the picture.
   Named misconceptions: «C = πr²», «the diameter is the radius», «vertical angles add to 180°»,
   «x is the angle itself».
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g7-dome-corner', code: 'G07-U02-MAT-L02', title: 'Dome and Corner', emoji: '🕌',
  accent: '#4a5d8a', accentDeep: '#374770', skyA: '#f4f6fc', skyB: '#dee4f5',
  topic: 'Circles and angle relationships', band: 'g68', lang: 'en',
  objective: 'I can find a circle\u2019s <b>circumference</b> and <b>area</b>, and use <b>angle pairs</b> to write and solve an equation.',
  welcome: 'A dome needs a brass rim and painted face; the mason checks every corner. Measure both. 🕌',
  learnBlurb: 'C = 2πr round the edge, A = πr² across the face, 90° and 180° between two rays.',
  how: {
    what: 'The circumference runs round the edge, so C = 2πr; the area fills the disc, so A = πr². At a corner, complementary angles add to 90°, supplementary angles add to 180°, and vertical angles are equal. Write the equation before you solve it.',
    steps: ['🕌 Radius or diameter? Square units or plain?', '📐 At a corner: 90°, 180°, or equal?', '✅ Write the equation, then solve it.'],
  },

  learn: [
    { say: 'A drum of radius <b>7</b> cm has a rim of 2 × π × 7 ≈ <b>44</b> cm and a face of π × 7 × 7 ≈ <b>154</b> cm². The rim is a length; the face is in square centimetres.',
      draw(el) { el.append(UI.h('div', { html: SCENE7.circleFig({ r: 7, show: 'r', rLabel: 'r = 7 cm', caption: 'C = 2πr for the rim, A = πr² for the face' }) })); } },
    { say: 'If you are handed the <b>diameter</b>, halve it first: a dome 10 m across has radius 5 m, so its rim is 2 × π × 5 ≈ <b>31.4</b> m.',
      draw(el) { el.append(UI.h('div', { html: SCENE7.circleFig({ r: 5, show: 'd', dLabel: 'd = 10 m', caption: 'radius = diameter ÷ 2' }) })); } },
    { say: 'Divide any circle\u2019s circumference by its diameter and you get about 3.14159 — al-Kāshī computed it to sixteen places. Two angles that meet at a right angle are <b>complementary</b>: 35° leaves 90 − 35 = <b>55°</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE7.anglePair({ kind: 'comp', known: 35, caption: 'complementary: the pair adds to 90°' }) })); } },
    { say: 'Two angles on a straight line are <b>supplementary</b> and add to 180°: 115° leaves <b>65°</b>. Where two lines cross, the angles facing each other are <b>vertical</b> and equal.',
      draw(el) { el.append(UI.h('div', { html: SCENE7.anglePair({ kind: 'supp', known: 115, caption: 'supplementary: the pair adds to 180°' }) })); } },
    { say: 'Your turn. A brass rim fits a circle of radius <b>10</b> cm. How long is the rim? (π ≈ 3.14)', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE7.circleFig({ r: 10, show: 'r', rLabel: 'r = 10 cm', caption: 'the length of the rim is the circumference' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['62.8 cm', true], ['31.4 cm', false], ['314 cm', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 2 × 3.14 × 10 = 62.8 cm.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '31.4 cm' ? 'That is πr. The rim goes all the way round, so it is 2πr.' : '314 is the AREA, πr². The rim is a length.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Now a corner. Two angles on a straight line are <b>38°</b> and <b>?</b>. What is the missing angle?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE7.anglePair({ kind: 'supp', known: 38, caption: 'a straight line is 180° in total' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['142°', true], ['52°', false], ['322°', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 180 − 38 = 142°.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '52°' ? '52° comes from 90, and this pair is on a straight line.' : 'A straight angle is 180°, not 360°.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar has two claims: that the area of a circle is 2πr, and that vertical angles add to 180°. Take them one at a time.', wait: true,
      draw(el, L) {
        GHUBAR.pop('Area is pi times the radius twice, and opposite angles add up. Simple.', 5600);
        el.append(UI.h('div', { html: SCENE7.anglePair({ kind: 'vert', known: 70, caption: 'equal across the cross, adding on the line' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['Both wrong — the area is πr², and vertical angles are equal.', true], ['Both right.', false], ['Only the area claim is right.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right. 2πr goes round, and the opposite angles are equal, not supplementary.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Look again at which two angles share a straight line.', 'bad'))),
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
        const alt = [v * 2, v / 2, v + 10, v + 1, v - 1].find((c) => {
          const cand = s.replace(num[0], String(Number(c.toFixed(2))));
          return c > 0 && !seen.has(cand) && cand !== ans;
        });
        if (alt != null) s = s.replace(num[0], String(Number(alt.toFixed(2))));
      }
      while (seen.has(s) || s === ans) s = s + '·';
      seen.add(s);
      return s;
    });
    return q;
  },

  levels: [
    { name: 'Round the rim', icon: '⭕', blurb: 'Circumference from a radius.', rounds: 6, think: false,
      say: '⭕ Going round the edge: 2πr.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const r = UI.rint(2, 12);
        const ans = Number((2 * 3.14 * r).toFixed(2));
        return {
          type: 'choice',
          prompt: G1.art(SCENE7.circleFig({ r, show: 'r', rLabel: `r = ${r} cm`, caption: 'the brass rim runs all the way round' }),
            `A rim fits a circle of radius <b>${r}</b> cm. How long is the rim? (π ≈ 3.14)`),
          options: [`${ans} cm`, `${Number((3.14 * r).toFixed(2))} cm`, `${Number((3.14 * r * r).toFixed(2))} cm²`],
          answer: `${ans} cm`,
          why: (v) => /cm²/.test(String(v)) ? 'That is the area — the rim is a length, in cm.' : 'That is πr, half the way round. The rim is the whole circumference.',
          hints: ['The rim is the circumference.', 'C = 2πr.', `2 × 3.14 × ${r}.`],
          solution: `C = 2 × 3.14 × ${r} = <b>${ans} cm</b>.`,
        };
      } },
    { name: 'Across the face', icon: '🖌️', blurb: 'Area, and the diameter trap.', rounds: 6, think: false,
      say: '🖌️ Filling the disc: πr² — halve a diameter first.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const givenDiameter = i % 2 === 1;
        /* an even diameter every time, so the radius stays a whole number */
        const r = UI.rint(2, 10);
        const d = r * 2;
        const ans = Number((3.14 * r * r).toFixed(2));
        return {
          type: 'choice',
          prompt: G1.art(givenDiameter
            ? SCENE7.circleFig({ r: Math.min(r, 12), show: 'd', dLabel: `d = ${d} m`, caption: 'the tape spans the whole width' })
            : SCENE7.circleFig({ r, show: 'r', rLabel: `r = ${r} m`, caption: 'the whole face is painted' }),
            `A round face is measured <b>${givenDiameter ? `d = ${d} m across` : `r = ${r} m from the centre`}</b>. What is its area? (π ≈ 3.14)`),
          options: [`${ans} m²`, `${Number((3.14 * (givenDiameter ? d : r) * (givenDiameter ? d : r)).toFixed(2))} m²`, `${Number((2 * 3.14 * r).toFixed(2))} m`],
          answer: `${ans} m²`,
          why: (v) => /m(?!²)/.test(String(v)) ? 'That is a length. An area is in square metres.' : `${givenDiameter ? `The diameter ${d} m is not the radius — it is ${d} ÷ 2 = ${r} m.` : 'The radius must be squared, not multiplied by 2.'}`,
          hints: [givenDiameter ? `Halve the diameter: r = ${d} ÷ 2 = ${r} m.` : `r = ${r} m already.`, `r² = ${r * r}.`, `3.14 × ${r * r}.`],
          solution: `${givenDiameter ? `r = ${r} m, so ` : ''}A = 3.14 × ${r}² = <b>${ans} m²</b>.`,
        };
      } },
    { name: 'Corner equations', icon: '📐', blurb: 'Complementary, supplementary, vertical.', rounds: 6, think: true,
      say: '📐 Think first: 90, 180, or equal?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      /* every round of a think level carries a CUBES problem block — the engine renders no thinking card
         without one, and the grade gate asserts exactly six per game (two think rounds per level) */
      roundRaw(i) {
        const mode = i % 3;
        if (mode === 0) {
          const known = UI.rint(15, 75), ans = 90 - known;
          return {
            type: 'choice',
            problem: {
              sentences: ['A frame has one corner trued to a right angle.',
                'Two angles share that corner and one of them is marked with a question mark.',
                `The known angle is ${known} degrees.`],
              question: 1, keys: ['right angle', 'corner'], extras: [0],
            },
            prompt: G1.art(SCENE7.anglePair({ kind: 'comp', known, caption: 'the pair makes a right angle' }),
              `One angle is <b>${known}°</b>. What is the angle marked <b>?</b>`),
            options: [`${ans}°`, `${180 - known}°`, `${known}°`],
            answer: `${ans}°`,
            why: (v) => String(v) === `${180 - known}°` ? 'That uses 180°. These two make a right angle, so they add to 90°.' : 'The pair must be different unless both are 45°.',
            hints: ['Complementary angles add to 90°.', `Write 90 = ${known} + x.`, `90 − ${known}.`],
            solution: `90 − ${known} = <b>${ans}°</b>.`,
          };
        }
        if (mode === 1) {
          const known = UI.rint(25, 155), ans = 180 - known;
          return {
            type: 'choice',
            problem: {
              sentences: ['A mason trues a straight lintel and marks two angles along it.',
                'One of the two angles is measured, the other is unknown.',
                `The measured angle is ${known} degrees.`],
              question: 1, keys: ['straight', 'mark'], extras: [0],
            },
            prompt: G1.art(SCENE7.anglePair({ kind: 'supp', known, caption: 'the pair sits on a straight line' }),
              `One angle is <b>${known}°</b>. What is the angle marked <b>?</b>`),
            options: [`${ans}°`, `${90 - known > 0 ? 90 - known : 90}°`, `${known}°`],
            answer: `${ans}°`,
            why: () => 'Angles on a straight line add to 180°, not to 90°.',
            hints: ['Supplementary angles add to 180°.', `Write 180 = ${known} + x.`, `180 − ${known}.`],
            solution: `180 − ${known} = <b>${ans}°</b>.`,
          };
        }
        const k = UI.rint(2, 5), plus = UI.rint(5, 30), other = UI.rint(10, 40);
        let x = (180 - plus - other) / k;
        if (!Number.isInteger(x) || x <= 0) x = 5;
        return {
          type: 'choice',
          problem: {
            sentences: ['A mason checks two angles that together form one straight edge.',
              'One angle is written as an expression in x, the other is a plain number.',
              `The first angle is ${k}x + ${plus} degrees and the second is ${other} degrees.`],
            question: 2, keys: ['straight', 'expression'], extras: [1],
          },
          prompt: G1.art(SCENE7.anglePair({ kind: 'supp', known: Math.min(k * x + plus, 170), caption: 'one angle is an expression in x' }),
            `The angle <b>${k}x + ${plus}</b> and the angle <b>${other}°</b> form a pair adding to <b>180°</b>. What is <b>x</b>?`),
          options: [String(x), String(k * x + plus), String(180 - other)],
          answer: String(x),
          why: (v) => Number(v) === k * x + plus ? 'That is the size of the angle, not x.' : 'Subtract the plain number first, then divide by the coefficient of x.',
          hints: [`Write ${k}x + ${plus} + ${other} = 180.`, `So ${k}x + ${plus} = ${180 - other}.`, `Then ${k}x = ${180 - other - plus}, and divide by ${k}.`],
          solution: `${k}x = ${180 - other - plus}, so <b>x = ${x}</b>.`,
        };
      } },
  ],

  ghubar: ['Area is two pi r, going round.', 'Vertical angles add to 180.', 'The diameter and the radius are the same.'],
  praise: ['Rim measured!', 'Face filled!', 'Corner solved!', 'Units right!'],
  finale: 'Round for the rim, squared for the face, 90 and 180 for the corner. 🕌',
};

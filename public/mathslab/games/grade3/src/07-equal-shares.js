/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 3 · Equal Shares · equivalent fractions built by splitting the same whole (3.NF.A.3)
   Source: G03-U02-MATH-L02 — الكسور المتكافئة (3.NF.A.3).
   Mechanic = the thinking: level 1 shows one shaded bar and asks for the fraction that covers the same amount —
   the wrong options shade a different amount, so the bar must be compared, not the digits; level 2 gives a
   matching pair of bars with one top number hidden, and the child must find the missing numerator by splitting
   the parts (the misconception is adding to both numbers); level 3 is a word problem about dividing the same
   tray into more, smaller pieces. `frac-equiv-add` (add 1 to both numbers) is named and treated.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g3-equal-shares', code: 'G03-MAT-07', title: 'Equal Shares', emoji: '🪟',
  accent: '#8a5fc4', accentDeep: '#6f47a8', skyA: '#f7f1ff', skyB: '#e8dcfb',
  topic: 'Equivalent fractions', band: 'g35', lang: 'en',
  objective: 'I can find <b>equivalent fractions</b> by splitting the same whole into more, smaller parts.',
  welcome: 'The same window is glazed with bigger or smaller panes — the light that gets in never changes. 🪟',
  learnBlurb: 'Same shaded amount, more pieces. The fraction changes, the amount does not.',
  how: {
    what: 'Equivalent fractions are different names for the same amount. If every part is cut in half, there are twice as many parts and twice as many are shaded.',
    steps: ['🪟 Look at how much is shaded.', '🪟 Cut each part into smaller equal parts.', '✅ Multiply the top and the bottom by the same number.'],
  },

  learn: [
    { say: 'This window has <b>2 equal panes</b> and <b>1</b> is shaded: one half. Now cut every pane in two.',
      draw(el) { el.append(UI.h('div', { html: SCENE3.fracBar(1, 2, { caption: 'one half of the window' }) })); } },
    { say: 'There are now <b>4 panes</b> and <b>2</b> are shaded. The glass did not change: <b>½ = 2/4</b>. Both numbers doubled.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE3.fracPair(1, 2, 2, 4, { caption: 'the same glass, cut into four' }) }));
      } },
    { say: 'Your turn: <b>2/4</b> is shaded. Which fraction shows the <b>same amount</b>?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE3.fracBar(2, 4) }));
        const row = UI.h('div', { class: 'opts' });
        [['1/2', true], ['2/3', false], ['3/4', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', html: SCENE3.frac(t.split('/')[0], t.split('/')[1], 20),
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 2 of 4 panes is exactly half the window.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '2/3' ? 'Compare the shaded amount, not the top number.' : 'That shades more than half. Look at the picture.', 'bad'))),
        })));
        el.append(row);
      } },
    { say: 'Ghubar says <b>1/3 = 2/4</b> because he added one to each number. Is that right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('One third, add one on top and one on the bottom, gives two quarters. ', 5200);
        el.append(UI.h('div', { html: SCENE3.fracPair(1, 3, 2, 4, { caption: 'one third against two quarters' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — the shaded amounts are different. Multiply both numbers by the same amount instead.', true], ['Yes — adding one to each keeps them equal.', false], ['Only for thirds and quarters.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — 1/3 is a third, 2/4 is a half. Not the same amount.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Look at the two bars. Do they shade the same amount?', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Same amount', icon: '🪟', blurb: 'Which name matches the shaded amount?', rounds: 6, think: false,
      say: '🪟 Which fraction shades the same amount?',
      round() {
        const base = UI.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]]);
        const k = UI.rint(2, 3);
        const num = base[0] * k, den = base[1] * k;
        const right = SCENE3.frac(base[0], base[1], 20);
        /* two decoys: one from adding the same amount to both numbers (Ghubar's rule), one from shading a
           different amount on the same number of parts — the picture has to settle it, not the digits */
        const decoys = [SCENE3.frac(base[0] + 1, base[1] + 1, 20), SCENE3.frac(num, den + 1, 20), SCENE3.frac(num, den, 20)];
        const options = [right, ...decoys.filter((v) => v !== right && v !== SCENE3.frac(base[0], base[1], 20))];
        return {
          type: 'choice',
          /* the caption describes what to look at, not what to count: naming "2 of 6" would turn the round into a
             simplification drill and the bar would stop being evidence */
          prompt: G1.art(SCENE3.fracBar(num, den, { max: 400 }), 'The parts shaded blue are the amount to match.'),
          options: options.slice(0, 3),
          answer: right,
          why: () => 'Compare how much of the bar is shaded, then find a name for that amount.',
          hints: [`${num} of ${den} parts are shaded.`, `Divide the top and the bottom by ${k}.`, 'The amount stays the same; only the names change.'],
          solution: `${num}/${den} = <b>${base[0]}/${base[1]}</b> — the same shaded amount.`,
        };
      } },
    { name: 'Fill the gap', icon: '🧮', blurb: 'One top number is missing.', rounds: 6, think: false,
      say: '🧮 Which number belongs on top?',
      round() {
        const base = UI.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5]]);
        const k = UI.rint(2, 3);
        const num = base[0] * k, den = base[1] * k;
        return {
          type: 'number',
          prompt: `<div style="display:grid;gap:10px;justify-items:center"><div style="display:flex;gap:14px;align-items:center;font-size:26px;font-weight:900">
            ${SCENE3.frac(base[0], base[1], 26)}<span>=</span><span style="border:3px dashed #8a5fc4;border-radius:12px;padding:2px 16px">?</span>${SCENE3.frac('', den, 26)}</div>
            <p style="margin:0;font-size:15px;font-weight:700;color:#6b5a7a">The same amount, cut into smaller parts.</p></div>`,
          answer: num, suffix: '',
          why: (v) => v === base[0] + 1 ? 'The top did not just grow by one — every part was split, so both numbers are multiplied.'
            : v === den - base[0] ? 'That is what is left. Find how many parts are shaded.' : 'The bottom went from ' + base[1] + ' to ' + den + ' — what was it multiplied by?',
          hints: [`${base[1]} × ? = ${den}`, `Multiply the top by the same number: ${base[0]} × ${k}.`, `${base[0]}/${base[1]} = ? / ${den}`],
          solution: `${base[0]} × ${k} = <b>${num}</b>, so ${base[0]}/${base[1]} = ${num}/${den}.`,
        };
      } },
    { name: 'Pane stories', icon: '📖', blurb: 'A story about smaller panes.', rounds: 6, think: true,
      say: '📖 Think first: how many panes now?',
      round(i) {
        const base = [[1, 2], [1, 3], [2, 3]][i % 3];
        const k = 2 + (i % 2);
        const den = base[1] * k, num = base[0] * k;
        return {
          type: 'number',
          problem: {
            sentences: [`A window is glazed with ${base[1]} equal panes and ${base[0]} is shaded.`, 'The glazier works in the cool of the morning.', `Every pane is then cut into ${k} smaller equal panes.`, 'How many of the new panes are shaded?'],
            question: 3, keys: ['equal', 'each'], extras: [1],
          },
          prompt: 'How many of the new panes are shaded?', answer: num, suffix: '',
          why: (v) => v === base[0] + k ? 'Adding the cut to the top is not equivalent — the shaded panes are split too.'
            : v === den ? 'That counts all the new panes, not the shaded ones.' : 'Every shaded pane becomes ' + k + ', so multiply the top by ' + k + '.',
          hints: [`Each of the ${base[0]} shaded panes becomes ${k} panes.`, `There are now ${den} panes in all.`, `${base[0]} × ${k} = ?`],
          solution: `${base[0]} × ${k} = <b>${num}</b> shaded panes out of ${den}.`,
        };
      } },
  ],

  ghubar: ['Equivalent? Just add one to the top and one to the bottom.', 'More pieces always means more glass.', 'A third and a half are close enough.'],
  praise: ['Same amount!', 'Both numbers scaled!', 'Equivalent found!', 'Panes counted!'],
  finale: 'Different panes, the same light — you know equivalent fractions! 🪟',
};

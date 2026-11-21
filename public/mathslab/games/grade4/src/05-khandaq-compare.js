/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 4 · Khandaq Compare · comparing fractions with unlike denominators (4.NF.A.2)
   Source: G04-U02-MATH-L02 — الكسور المتكافئة ومقارنة الكسور (4.NF.A.2).
   Mechanic = the thinking: level 1 puts two bars of different denominators side by side and asks which is
   shaded more — the bars are the same length, so the comparison is visual evidence, not digit-reading; level 2
   removes the bars and asks for the relation from the fractions alone, where the benchmark of one half is the
   reasoning route; level 3 compares two fractions inside a story. `cmp-bigger-den` (a bigger denominator always
   means a bigger fraction) is the named misconception and drives most why-lines.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g4-khandaq-compare', code: 'G04-MAT-05', title: 'Khandaq Compare', emoji: '🌉',
  accent: '#8a5a2c', accentDeep: '#6f4720', skyA: '#fff8f0', skyB: '#f6e2cd',
  topic: 'Comparing fractions', band: 'g35', lang: 'en',
  objective: 'I can compare two fractions with <b>different denominators</b> using <b>bars and benchmarks</b>.',
  welcome: 'The old trench of Madinah is being re-dug in sections. Two crews report how much they finished. 🌉',
  learnBlurb: 'Same-size wholes, different cuts. Compare the shaded amount.',
  how: {
    what: 'A fraction is a part of the same whole. Comparing fractions means comparing how much is shaded, not how many pieces there are.',
    steps: ['🌉 Line the two bars up — they are the same length.', '🌉 Compare with one half.', '✅ The bar with more shading is the greater fraction.'],
  },

  learn: [
    { say: 'Crew A finished <b>2/3</b> of its section. Crew B finished <b>3/5</b>. The bars are the same length, so look at the shading.',
      draw(el) { el.append(UI.h('div', { html: SCENE3.fracPair(2, 3, 3, 5) })); } },
    { say: '<b>2/3</b> covers more than half the bar. <b>3/5</b> covers more than half too, but less. So <b>2/3 &gt; 3/5</b> — the bigger denominator does not win.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE3.fracPair(2, 3, 3, 5, { max: 480 }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '2/3 &gt; 3/5 &nbsp;·&nbsp; sixths would show it: 4/6 vs 3.6/6' }));
      } },
    { say: 'Your turn: which is greater, <b>3/4</b> or <b>5/8</b>?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE3.fracPair(3, 4, 5, 8, { max: 460 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['3/4', true], ['5/8', false], ['They are equal.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — 3/4 is 6/8, which covers more than 5/8.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '5/8' ? 'Look at the bars: which one shades more? Eight pieces does not mean more shaded.' : 'Line them up on eighths: 3/4 is 6/8.', 'bad'))),
        })));
        el.append(row);
      } },
    { say: 'Ghubar says <b>3/5</b> is bigger than <b>2/3</b> because 5 is bigger than 3. What is wrong?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Three fifths beats two thirds — five is bigger than three. Numbers do not lie.', 5400);
        el.append(UI.h('div', { html: SCENE3.fracPair(2, 3, 3, 5, { max: 460 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['The denominator says how many pieces, not how much. 2/3 shades more.', true], ['He is right — 5 beats 3.', false], ['They are equal.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Exactly — more pieces can still be a smaller share.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Cover the numbers and just look at the two bars.', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Which bar?', icon: '🌉', blurb: 'Compare the shading.', rounds: 6, think: false,
      say: '🌉 Which fraction is greater?',
      round() {
        const set = [[2, 3, 3, 5], [1, 2, 2, 5], [3, 4, 2, 3], [3, 5, 1, 2], [4, 6, 3, 5], [2, 4, 3, 8], [5, 8, 2, 3]];
        const [a, b, c, d] = UI.pick(set);
        const greater = a / b > c / d ? `${a}/${b}` : `${c}/${d}`;
        const less = greater === `${a}/${b}` ? `${c}/${d}` : `${a}/${b}`;
        return {
          type: 'choice',
          prompt: G1.art(SCENE3.fracPair(a, b, c, d, { max: 470 }), `Top bar: ${a}/${b}. Bottom bar: ${c}/${d}.`),
          options: [greater, less, 'They are equal.'],
          answer: greater,
          why: () => 'Compare the shaded amount. Try a common denominator to check.',
          hints: ['Both bars are the same length.', 'Is each fraction more or less than one half?', `Find a shared denominator for ${b} and ${d}.`],
          solution: `${greater} is the greater fraction.`,
        };
      } },
    { name: 'No bars now', icon: '🧠', blurb: 'Compare from the numbers alone.', rounds: 6, think: false,
      say: '🧠 Which relation is true?',
      round() {
        const set = [[3, 4, 5, 8], [2, 3, 4, 7], [5, 6, 7, 9], [3, 5, 5, 9], [7, 8, 4, 5], [2, 5, 3, 8]];
        const [a, b, c, d] = UI.pick(set);
        const left = a / b, right = c / d;
        const right2 = left > right ? '>' : left < right ? '<' : '=';
        const other = right2 === '>' ? '<' : '>';
        return {
          type: 'choice', prompt: `<p style="margin:0;font-size:26px;font-weight:900;text-align:center">${a}/${b} &nbsp; ? &nbsp; ${c}/${d}</p>`,
          options: [right2, other, '='].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 3),
          answer: right2,
          why: (v) => v === '=' ? 'Equal only if the shaded amounts match. Compare with a common denominator.' : `A bigger denominator means smaller pieces. Compare ${a}/${b} and ${c}/${d} against one half first.`,
          hints: ['Is each more or less than one half?', `Multiply to a common denominator: ${b * d}.`, `${a}×${d} = ${a * d} and ${c}×${b} = ${c * b}.`],
          solution: `${a * d} ${right2} ${c * b}, so ${a}/${b} ${right2} ${c}/${d}.`,
        };
      } },
    { name: 'Crew reports', icon: '📖', blurb: 'A story that compares two shares.', rounds: 6, think: true,
      say: '📖 Think first: which crew finished more?',
      round(i) {
        const set = [[2, 3, 3, 5], [3, 4, 5, 8], [1, 2, 2, 5], [5, 6, 3, 4]];
        const [a, b, c, d] = set[i % set.length];
        const who = a / b > c / d ? 'Crew A' : 'Crew B';
        return {
          type: 'choice',
          problem: {
            sentences: [`Crew A finished ${a}/${b} of its section of the trench.`, 'The work must finish before the rain comes.', `Crew B finished ${c}/${d} of its section.`, 'Which crew finished the greater share of its section?'],
            question: 3, keys: ['greater'], extras: [1],
          },
          prompt: 'Which crew finished the greater share of its section?',
          options: ['Crew A', 'Crew B', 'They finished the same share.'],
          answer: who,
          why: () => `Both sections are the same size, so compare ${a}/${b} with ${c}/${d}.`,
          hints: ['Both sections are the same length.', 'Compare each with one half.', `Use a common denominator for ${b} and ${d}.`],
          solution: `${who} finished more: ${a}/${b} against ${c}/${d}.`,
        };
      } },
  ],

  ghubar: ['The bigger denominator always wins.', 'Fraction bars are decoration — read the numbers.', 'One half is close enough to everything.'],
  praise: ['Bars compared!', 'Benchmark used!', 'Common denominator found!', 'Trench measured!'],
  finale: 'Both sections compared fairly — you can compare fractions! 🌉',
};

/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 2 · Falcon Hop · skip counting by 2s, 5s, 10s and 100s (2.NBT.A.2)
   Mechanic = the thinking: the child must name the STEP before the next number, then produce the number that
   comes several hops later — a child who adds only the step once (instead of twice) is caught by the why-line.
   Level 3 counts hundreds, where the visual is a place-value track, not a picture count.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g2-falcon-hop', code: 'G02-MAT-06', title: 'Falcon Hop', emoji: '🦅',
  accent: '#3b6fb6', accentDeep: '#2b5591', skyA: '#f2f7ff', skyB: '#dbe8fb',
  topic: 'Skip counting to 1,000', band: 'g35', lang: 'en',
  objective: 'I can <b>skip count</b> by 2s, 5s, 10s and 100s and say the next numbers.',
  welcome: 'A falcon hops along the ridge, one step at a time. Can you say where it lands? 🦅',
  learnBlurb: 'Find the step, then keep adding it.',
  how: {
    what: 'Skip counting means adding the same step again and again. Look at two hops to find the step.',
    steps: ['🦅 Find the step: 10 more each time?', '🦅 Add the step to the last number.', '✅ Count the hops to the empty circle.'],
  },

  learn: [
    { say: 'The falcon hops <b>10</b> each time: 120, 130, 140, 150 … where does it land next?',
      draw(el) { el.append(UI.h('div', { html: SCENE2.skipTrack(120, 10, 5, { caption: 'each hop is the same size' }) })); } },
    { say: 'The step is <b>10</b>, so add 10: <b>150 + 10 = 160</b>. Only the tens digit changes.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE2.skipTrack(120, 10, 5, { hideLast: false, caption: '120 → 160, still 1 hundred' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '1 hundred stays, the tens count 2 · 3 · 4 · 5 · 6.' }));
      } },
    { say: 'Your turn: count by <b>5</b>. What comes after <b>25, 30, 35</b>?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE2.skipTrack(25, 5, 4, { caption: 'count by 5' }) }));
        const row = UI.h('div', { class: 'opts' });
        [40, 36, 45].forEach((v) => row.append(UI.h('button', {
          class: 'opt', text: String(v),
          onclick: (e) => v === 40 ? (e.target.classList.add('good'), L.ok('Yes — 35 + 5 = 40.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(v === 36 ? 'That is only +1. The step is 5.' : 'You added two steps. Add just one.', 'bad')),
        })));
        el.append(row);
      } },
    { say: 'Ghubar counted 25, 30, 35 and then <b>36</b>. What did he do?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Thirty-six comes after thirty-five. Numbers go in order!', 5000);
        const row = UI.h('div', { class: 'opts' });
        [['He counted by 1 instead of 5.', true], ['He counted by 10.', false], ['Nothing — 36 is the next step of 5.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Right — skip counting keeps the same step.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Compare two jumps: 30 to 35 is how much?', 'bad')),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'One more hop', icon: '🦅', blurb: 'Name the next number.', rounds: 4, think: false,
      say: '🦅 Where does the falcon land next?',
      round() {
        const step = UI.pick([2, 5, 10, 10, 100]);
        const start = step === 100 ? UI.rint(1, 6) * 100 : step === 10 ? UI.rint(1, 20) * 10 : UI.rint(2, 30) * step;
        const shown = 4;
        return {
          type: 'number', prompt: G1.art(SCENE2.skipTrack(start, step, shown, { caption: `count by ${step}` }), `Count by ${step}.`),
          answer: start + step * (shown - 1), suffix: '',
          why: (v) => v === start + step * (shown - 2) ? 'That is the number already printed. One more hop.' : v === start + step * shown ? 'That is two hops ahead. Add the step once.' : 'Add the same step you see between the printed numbers.',
          hints: [`Compare two printed numbers: what is the step?`, `The last printed number is ${start + step * (shown - 2)}.`, `Add ${step} once.`],
          solution: `${start + step * (shown - 2)} + ${step} = <b>${start + step * (shown - 1)}</b>.`,
        };
      } },
    { name: 'Which step?', icon: '👣', blurb: 'Find the step from the pattern.', rounds: 4, think: false,
      say: '👣 What is the hop size?',
      round() {
        const step = UI.pick([2, 3, 5, 10, 25, 100]);
        const start = step === 100 ? UI.rint(1, 5) * 100 : step * UI.rint(2, 12);
        const opts = [String(step), String(step * 2), String(step + 1), String(Math.max(1, step - 1))].filter((v, i, a) => a.indexOf(v) === i);
        return {
          type: 'choice', prompt: G1.art(SCENE2.skipTrack(start, step, 4, { hideLast: false }), 'Read two jumps.'),
          options: opts, answer: String(step),
          why: (v) => +v === step * 2 ? 'That is two jumps added together.' : 'Subtract one printed number from the next.',
          hints: ['Take two numbers side by side.', 'Subtract the smaller from the bigger.', 'Check it on the next pair too.'],
          solution: `Each hop is <b>${step}</b>: ${start} → ${start + step} → ${start + step * 2}.`,
        };
      } },
    { name: 'Count the hundreds', icon: '💯', blurb: 'Hundreds, not tens.', rounds: 4, think: true,
      say: '💯 Think first: are you counting hundreds?',
      round(i) {
        const start = 100 + i * 100;
        return {
          type: 'number',
          problem: {
            sentences: [`The falcon flies past stone ${start}.`, 'The ridge is long and hot.', 'Each hop is 100 stones.', `It hovers over the ${4 + i}th stone.`],
            question: 2, keys: ['each hop'], extras: [1],
          },
          prompt: `Count by 100 from ${start}. Which stone does it reach after ${3 + i} hops?`,
          answer: start + 100 * (3 + i), suffix: '',
          why: (v) => v === start + 100 * (2 + i) ? 'That is one hop short.' : v === start + 10 * (3 + i) ? 'Each hop is 100, not 10.' : 'Add 100 for every hop.',
          hints: ['Each hop is 100.', `Hop 1 lands on ${start + 100}.`, `Keep adding 100 for ${3 + i} hops.`],
          solution: `${start} + ${100 * (3 + i)} = <b>${start + 100 * (3 + i)}</b>.`,
        };
      } },
  ],

  ghubar: ['Skip counting is just normal counting, only fast.', 'A hundred is a big ten, so the same thing.', 'Steps? I take the lift.'],
  praise: ['Hop counted!', 'Step spotted!', 'Hundreds, not tens!', 'The falcon approves!'],
  finale: 'The ridge is crossed — you can skip count to 1,000! 🦅',
};

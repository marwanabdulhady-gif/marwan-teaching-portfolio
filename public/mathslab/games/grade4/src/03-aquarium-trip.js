/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 4 · Aquarium Trip · multi-step problems and the hidden question (4.OA.A.3)
   Source: grade-04.md brief, worked example "The Hidden Question Trip" (Jeddah Aquarium: 8 buses × 24,
   6 vans × 15), plus the CUBES think-first path the template already carries.
   Mechanic = the thinking: level 1 names the HIDDEN question (what must be found first) — the distractors are
   questions the story lets you ask but that do not help; level 2 asks for that hidden total so the first step
   is real work; level 3 is the whole problem. `skipped-hidden-q` (answers the first number seen),
   `forgot-each` (drops the "each" multiplication) and `wrong-operation` (adds when the story says fewer/faster/
   cheaper) are the named misconceptions.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g4-aquarium-trip', code: 'G04-MAT-03', title: 'Aquarium Trip', emoji: '🚌',
  accent: '#4a5fa8', accentDeep: '#3a4b8a', skyA: '#f2f4ff', skyB: '#dbdffb',
  topic: 'Multi-step problems', band: 'g35', lang: 'en',
  objective: 'I can find the <b>hidden question</b> in a story and use it to solve a <b>two-step problem</b>.',
  welcome: 'Grade 4 is going to the Jeddah Aquarium — buses, vans, and one question that hides another. 🚌',
  learnBlurb: 'Two steps: the hidden question first, then the question asked.',
  how: {
    what: 'A two-step problem cannot be answered in one move. Find the step the story never asks for — the hidden question — do it first, then answer.',
    steps: ['🚌 Read the question at the end.', '🚌 Find what you must know first.', '✅ Do that step, then the question asked.'],
  },

  learn: [
    { say: '<b>8 buses</b> carry <b>24</b> children each, and <b>6 vans</b> carry <b>15</b> each. How many children go altogether?',
      draw(el) {
        el.append(UI.h('div', { html: SCENE2.array(8, 24, { max: 320 }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:16px', html: '8 × 24 on the buses, 6 × 15 on the vans.' }));
      } },
    { say: 'The question asks for the total, but the story never says how many are on the buses. That is the <b>hidden question</b>: 8 × 24 = <b>192</b>, and 6 × 15 = <b>90</b>.',
      draw(el) {
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:18px', html: 'Hidden: 8 × 24 = <b>192</b> &nbsp;·&nbsp; 6 × 15 = <b>90</b>' }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:18px', html: 'Answer: 192 + 90 = <b>282</b> children' }));
      } },
    { say: 'Your turn: <b>192</b> on the buses and <b>90</b> on the vans. How many children go?', wait: true,
      draw(el, L) {
        const row = UI.h('div', { class: 'opts' });
        [282, 102, 182].forEach((v) => row.append(UI.h('button', {
          class: 'opt', text: String(v),
          onclick: (e) => (v === 282 ? (e.target.classList.add('good'), L.ok('Yes — 192 + 90 = 282.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(v === 102 ? 'That subtracts. Everyone who goes is added.' : 'Line up the place values and add.', 'bad'))),
        })));
        el.append(row);
      } },
    { say: 'Ghubar says <b>8 − 6 = 2</b> children go. What did he answer instead?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Eight buses, six vans — 8 minus 6, so 2 children. Done!', 5200);
        const row = UI.h('div', { class: 'opts' });
        [['He subtracted the vehicles. He must find the children in each group first.', true], ['He forgot to carry.', false], ['He is right — 2 children.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — the hidden question is how many children ride in each group.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('How many children are in one bus? Start there.', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Find the hidden question', icon: '🔍', blurb: 'What must be worked out first?', rounds: 6, think: false,
      say: '🔍 What must you find out first?',
      round(i) {
        const stories = [
          { text: '8 buses carry 24 children each. 6 vans carry 15 children each. How many children go altogether?',
            right: 'How many children ride in the buses?',
            fake: ['How many buses and vans are there?', 'Which vehicle is faster?', 'How long is the journey?'] },
          { text: 'A ticket costs 15 riyals. 24 children buy tickets. The aquarium opens at 9. How much money is collected?',
            right: 'How much do 24 tickets cost?',
            fake: ['What time does the aquarium open?', 'How many children buy tickets?', 'How long do they stay?'] },
          { text: 'Each bus holds 24 children. 8 buses are full. 3 buses leave early. How many children are still there?',
            right: 'How many children are on all 8 buses?',
            fake: ['How many buses leave early?', 'How fast do the buses go?', 'How many drivers are there?'] },
        ];
        const s = stories[i % stories.length];
        return {
          type: 'choice', prompt: `${s.text}`, options: [s.right, ...s.fake], answer: s.right,
          why: (v) => v === s.fake[0] ? 'That is in the story already, or it is not needed. Look for the step the question depends on.'
            : 'The last question cannot be answered until a total you do not have yet is worked out.',
          hints: ['Read the question at the end.', 'Which number in the answer is not in the story?', 'Work out that total first.'],
          solution: `First: ${s.right}`,
        };
      } },
    { name: 'Do the hidden step', icon: '🧮', blurb: 'Work out the missing total.', rounds: 6, think: false,
      say: '🧮 Work out the hidden total.',
      round(i) {
        const g = 4 + (i % 4), each = 12 + (i % 5) * 3;
        return {
          type: 'number',
          prompt: `<p style="margin:0;font-size:17px;line-height:1.5">${g} buses carry ${each} children each.<br><b>How many children are on the buses?</b></p>`,
          answer: g * each, suffix: '',
          why: (v) => v === g + each ? 'That adds the buses and the children. Each bus holds another full bus-load — multiply.' : 'Multiply the buses by the children in each bus.',
          hints: [`There are ${g} buses.`, `Every bus holds ${each}.`, `${g} × ${each} = ?`],
          solution: `${g} × ${each} = <b>${g * each}</b> children.`,
        };
      } },
    { name: 'The whole story', icon: '📖', blurb: 'Both steps, then the answer.', rounds: 6, think: true,
      say: '📖 Think first: what is the hidden question?',
      round(i) {
        const b = 3 + (i % 3), per = 12 + (i % 4) * 4, van = 2 + (i % 2), vper = 8 + (i % 3) * 3;
        const ask = i % 2 === 0 ? 'How many children go on the trip altogether?' : 'How many more children ride the buses than the vans?';
        const answer = i % 2 === 0 ? b * per + van * vper : b * per - van * vper;
        return {
          type: 'number',
          problem: {
            sentences: [`${b} buses carry ${per} children each to the aquarium.`, 'The aquarium has a touch pool and a shark tunnel.', `${van} vans carry ${vper} children each.`, ask],
            question: 3, keys: ['each', i % 2 === 0 ? 'altogether' : 'more'], extras: [1],
          },
          prompt: ask, answer, suffix: '',
          why: (v) => v === b * per + van * vper && i % 2 === 1 ? 'You added. The question asks how many MORE — subtract the smaller total.'
            : v === b * per - van * vper && i % 2 === 0 ? 'You subtracted. Altogether means both groups are added.'
            : v === b + per ? 'Each bus carries a whole bus-load — multiply before adding.' : 'Work out both totals first, then answer the question asked.',
          hints: [`Buses: ${b} × ${per} = ${b * per}.`, `Vans: ${van} × ${vper} = ${van * vper}.`, i % 2 === 0 ? 'Add the two totals.' : 'Subtract the smaller total from the bigger one.'],
          solution: `${b * per} and ${van * vper} → <b>${answer}</b> children.`,
        };
      } },
  ],

  ghubar: ['Two-step? I answer the first number I see.', '"Each" is just a word.', 'Altogether and how many more are the same thing.'],
  praise: ['Hidden question found!', 'Two steps taken!', 'Each multiplied!', 'Trip solved!'],
  finale: 'Buses counted, vans counted, everyone at the aquarium — you can solve a two-step story! 🚌',
};

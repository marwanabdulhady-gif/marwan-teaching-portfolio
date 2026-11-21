/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 1 · Story Scout · choosing + or − for a one-step story problem (draft G01-MAT step 10)
   Mechanic = the thinking: level 1 decides what happens in the story, level 2 chooses the number
   sentence, level 3 solves it. Every level runs CUBES first, because deciding the operation is exactly
   the skill — the numbers alone can never tell you which sign to use.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const STORY_KINDS = ['join', 'take', 'compare'];

function storyRound(kind, level) {
  if (kind === 'join') {
    const a = UI.rint(2, 6), b = UI.rint(1, 9 - a);
    return {
      problem: {
        sentences: [`Noor finds ${a} shells on the beach.`, 'The beach is near the Corniche.', `Then she finds ${b} more shells.`, 'How many shells does Noor find altogether?'],
        question: 3, keys: ['more', 'altogether'], extras: [1],
      },
      prompt: 'How many shells does Noor find altogether?',
      eq: `${a} + ${b} = ${a + b}`,
      wrongEq: [`${a} − ${b} = ${a - b}`, `${a} + ${b} = ${a + b + 1}`, `${b} + ${a} = ${a + b + 2}`],
      answer: a + b, a, b,
      why: (v) => Number(v) === a - b ? '“More” means she gets another group — add.' : Number(v) === a + b + 1 ? 'Count both finds once more.' : 'Join the two finds.',
      solution: `She finds ${a}, then ${b} more: ${a} + ${b} = <b>${a + b}</b> shells.`,
    };
  }
  if (kind === 'take') {
    const a = UI.rint(5, 10), b = UI.rint(1, a - 1);
    return {
      problem: {
        sentences: [`There are ${a} birds on the wall of the old house.`, 'The wall is made of coral stone.', `${b} birds fly away.`, 'How many birds are still on the wall?'],
        question: 3, keys: ['away', 'still'], extras: [1],
      },
      prompt: 'How many birds are still on the wall?',
      eq: `${a} − ${b} = ${a - b}`,
      wrongEq: [`${a} + ${b} = ${a + b}`, `${a} − ${b} = ${a - b + 1}`, `${b} − ${a} = ${a - b}`],
      answer: a - b, a, b,
      why: (v) => Number(v) === a + b ? 'Birds flying away means fewer, not more — subtract.' : Number(v) === b ? 'That is how many flew away. Count what is left.' : 'Start with all the birds, take away the ones that left.',
      solution: `${a} birds, ${b} fly away: ${a} − ${b} = <b>${a - b}</b> birds still on the wall.`,
    };
  }
  const a = UI.rint(4, 9), b = UI.rint(1, a - 1);
  return {
    problem: {
      sentences: [`Noor has ${a} dates in her basket.`, 'The dates came from AlUla.', `Ghubar has ${b} dates.`, 'How many more dates does Noor have than Ghubar?'],
      question: 3, keys: ['more'], extras: [1],
    },
    prompt: 'How many <b>more</b> dates does Noor have?',
    eq: `${a} − ${b} = ${a - b}`,
    wrongEq: [`${a} + ${b} = ${a + b}`, `${a} − ${b} = ${b}`, `${b} − ${a} = ${a - b}`],
    answer: a - b, a, b,
    why: (v) => Number(v) === a + b ? 'Both baskets together is not the question. How many MORE?' : 'Compare the two amounts by taking the smaller from the larger.',
    solution: `${a} − ${b} = <b>${a - b}</b> more dates.`,
  };
}

const GAME = {
  id: 'g1-story-scout', code: 'G01-MAT-10', title: 'Story Scout', emoji: '🧭',
  accent: '#2f74b8', accentDeep: '#22568a', skyA: '#f1f6fe', skyB: '#dbe8fa',
  topic: 'One-step stories', band: 'k2', lang: 'en',
  objective: 'I can decide whether a story <b>joins</b> or <b>takes away</b>, and choose the number sentence that matches.',
  welcome: 'Every story hides a sign: add or take away? Scout it out! 🧭',
  learnBlurb: 'Read the story, find what happens, then choose + or −.',
  how: {
    what: 'Two kinds of story: things join (add) or things go away (take away).',
    steps: ['📖 Read the story and find what happens.', '🧠 Think first with CUBES: numbers, question, key words.', '✅ Choose + or −, then solve.'],
  },

  learn: [
    { say: 'Noor finds <b>4</b> shells, then <b>3</b> more. What happens in the story?',
      draw(el) { el.append(UI.h('div', { html: SCENE.join(4, 3, { kind: 'shell' }) })); } },
    { say: '“Then 3 more” means the groups <b>join</b>: <b>4 + 3 = 7</b> shells.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE.join(4, 3, { kind: 'shell' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: 'Joining → add. Taking away → subtract.' }));
      } },
    { say: 'Your turn: 6 birds are on a wall. 2 fly away. Which is it?', wait: true,
      draw(el, L) {
        const row = UI.h('div', { class: 'opts' });
        [['Take away', true], ['Join', false], ['Neither', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Yes — “fly away” means take away: 6 − 2 = 4.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Do the birds stay or go? Look at “fly away”.', 'bad')),
        })));
        el.append(row);
      } },
    { say: 'Ghubar saw “2” and added it to 6. What should decide + or −?', wait: true,
      draw(el, L) {
        GHUBAR.pop('There is a 2! I add every number I see!', 5000);
        const row = UI.h('div', { class: 'opts' });
        [['What happens in the story.', true], ['Which number is bigger.', false], ['Which number is written last.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Exactly — the action decides the sign, not the numbers.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Numbers do not choose the sign. What happens to the birds?', 'bad')),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'What happens?', icon: '📖', blurb: 'Do things join or go away?', rounds: 4, think: true,
      say: '📖 Think first: what happens in the story?',
      round(i) {
        const s = storyRound(STORY_KINDS[i % 3], 1);
        return {
          type: 'choice', problem: s.problem, prompt: 'What happens in the story?',
          options: ['The groups join — add.', 'Something goes away — subtract.', 'Nothing changes — the numbers stay the same.'],
          answer: s.eq.includes('+') ? 'The groups join — add.' : 'Something goes away — subtract.',
          why: () => 'Find the key word: “more” joins, “away” takes away.',
          hints: ['Read the last sentence.', 'Do the things come together or leave?', 'Find the key word.'],
          solution: `${s.eq.includes('+') ? 'Joining groups' : 'Something leaving'} → ${s.eq.includes('+') ? 'add' : 'subtract'}.`,
        };
      } },
    { name: 'Match the sentence', icon: '🧮', blurb: 'Which number sentence fits?', rounds: 4, think: true,
      say: '🧮 Which number sentence matches the story?',
      round(i) {
        const s = storyRound(STORY_KINDS[(i + 1) % 3], 2);
        return {
          type: 'choice', problem: s.problem, prompt: 'Which number sentence matches the story?',
          options: [s.eq].concat(s.wrongEq), answer: s.eq,
          why: (v) => String(v).includes('+') ? 'Read what happens: do the groups join or does something go away?' : 'Check the numbers AND the sign.',
          hints: ['Decide + or − first.', `The two numbers are ${s.a} and ${s.b}.`, 'Then check the answer makes sense.'],
          solution: `<b>${s.eq}</b> — ${s.solution.replace(/<\/?b>/g, '')}`,
        };
      } },
    { name: 'Solve the story', icon: '✨', blurb: 'Decide, then type the answer.', rounds: 4, think: true,
      say: '✨ Solve it on your own.',
      round(i) {
        const s = storyRound(STORY_KINDS[(i + 2) % 3], 3);
        return {
          type: 'number', problem: s.problem, prompt: s.prompt, answer: s.answer,
          why: s.why, hints: ['Decide + or − first.', 'Then use the two numbers.', `${s.eq.split('=')[0].trim()} = ?`],
          solution: s.solution,
        };
      } },
  ],

  ghubar: ['A 2! I add every number I see!', 'Longer story, bigger answer.', 'Minus is just a small plus, right?'],
  praise: ['Sign spotted!', 'You read it like a scout!', 'Right operation, right answer!', 'No number tricks!'],
  finale: 'Every story scouted — you choose + or − and solve it! 🧭',
};

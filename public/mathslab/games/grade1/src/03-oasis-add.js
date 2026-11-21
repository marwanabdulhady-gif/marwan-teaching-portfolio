/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 1 · Oasis Addition Garden · joining two groups and adding within 10 (draft G01-MAT step 3)
   Mechanic = the thinking: level 2 is the template's `bars` round, so the child reads a bar model of the
   two groups and types the total; the bars only reveal the parts until the answer is entered.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const C1 = '#ffd23f', C2 = '#7bdff2';

const GAME = {
  id: 'g1-oasis-add', code: 'G01-MAT-03', title: 'Oasis Addition Garden', emoji: '🌱',
  accent: '#3f8f57', accentDeep: '#2c6a3f', skyA: '#f0fbf1', skyB: '#d8f0d9',
  topic: 'Addition within 10', band: 'k2', lang: 'en',
  objective: 'I can <b>join</b> two groups and find <b>how many altogether</b>, adding within 10.',
  welcome: 'Two pots of seedlings are ready for the garden bed. 🌱',
  learnBlurb: 'Join the groups, count both, then read the number sentence.',
  how: {
    what: 'Adding means joining. Keep both groups and count the whole group.',
    steps: ['🌱 Count the first group.', '➕ Count the second group into the same picture.', '✅ The last number is the total.'],
  },

  learn: [
    { say: 'Noor has <b>3</b> seedlings and <b>2</b> more for the oasis garden. How many altogether?',
      draw(el) { el.append(UI.h('div', { html: SCENE.join(3, 2, { kind: 'leaf' }) })); } },
    { say: 'Put both groups together: <b>3 + 2 = 5</b>. The bars show the same story.',
      draw(el) {
        el.append(UI.bars({ rows: [{ letter: 'A', label: 'first pot', n: 1, each: 3, color: C1 }, { letter: 'B', label: 'second pot', n: 1, each: 2, color: C2 }], final: { kind: 'sum', letter: 'T' } }, { reveal: true, answer: 5 }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: 'A = 3, B = 2 → <b>3 + 2 = 5</b> seedlings.' }));
      } },
    { say: 'Your turn: <b>4 + 3</b>. Join both groups and count.', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE.join(4, 3, { kind: 'leaf' }) }));
        const row = UI.h('div', { class: 'opts' });
        [7, 6, 4].forEach((v) => row.append(UI.h('button', {
          class: 'opt', text: String(v),
          onclick: (e) => v === 7 ? (e.target.classList.add('good'), L.ok('Yes! 4 and 3 more make <b>7</b>.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(v === 4 ? 'You counted only the first pot. Count both.' : 'Count every seedling in both pots.', 'bad')),
        })));
        el.append(row);
      } },
    { say: 'Ghubar counted only the first pot and said <b>4</b>. What did he forget?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Four seedlings! The other pot is just decoration.', 5000);
        const row = UI.h('div', { class: 'opts' });
        [['The second group of 3.', true], ['Nothing — 4 is correct.', false], ['The garden bed.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Right — adding means counting BOTH groups.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Look at the second pot. Are those seedlings part of the total?', 'bad')),
        })));
        el.append(UI.h('div', { html: SCENE.join(4, 3, { kind: 'leaf' }) }), row);
      } },
  ],

  levels: [
    { name: 'Join the groups', icon: '🌱', blurb: 'Count both groups together.', rounds: 4, think: false,
      say: '🌱 How many seedlings altogether?',
      round() {
        const a = UI.rint(1, 5), b = UI.rint(1, 9 - a);
        return {
          type: 'number', prompt: G1.art(SCENE.join(a, b, { kind: 'leaf' }), `${a} seedlings and ${b} more seedlings.`),
          answer: a + b, suffix: '',
          why: (v) => v === Math.max(a, b) ? 'You counted one pot. Add both groups.' : v === Math.abs(a - b) ? 'You subtracted. This is joining — add.' : 'Count every seedling in both pots.',
          hints: ['How many in the first pot?', `How many in the second pot?`, `${a} + ${b} = ?`],
          solution: `${a} + ${b} = <b>${a + b}</b> seedlings altogether.`,
        };
      } },
    { name: 'Read the bars', icon: '📊', blurb: 'Use the bar model, then type the total.', rounds: 4, think: false,
      say: '📊 The bars show both groups. Add them.',
      round() {
        const a = UI.rint(2, 6), b = UI.rint(1, 10 - a);
        return {
          type: 'bars',
          model: { rows: [{ letter: 'A', label: 'first pot', n: 1, each: a, color: C1 }, { letter: 'B', label: 'second pot', n: 1, each: b, color: C2 }], final: { kind: 'sum', letter: 'T' } },
          answer: a + b, suffix: '',
          why: (v) => v === a || v === b ? 'That is one bar. T is both bars joined.' : 'A and B together make T.',
          hints: ['Read bar A and bar B.', 'The question bar T is both parts joined.', `T = ${a} + ${b}`],
          solution: `A = ${a}, B = ${b} → <b>T = ${a + b}</b> seedlings.`,
        };
      } },
    { name: 'Garden stories', icon: '📖', blurb: 'A story, then the number sentence.', rounds: 4,
      say: '📖 Think first: is this joining?',
      round(i) {
        const a = 3 + (i % 3), b = 2 + (i % 4);
        return {
          type: 'number',
          problem: {
            sentences: [`Noor plants ${a} seedlings in the first row.`, 'The watering can is green.', `She plants ${b} more seedlings in the next row.`, 'How many seedlings does she plant altogether?'],
            question: 3, keys: ['more', 'altogether'], extras: [1],
          },
          prompt: 'How many seedlings altogether?', answer: a + b, suffix: '',
          why: (v) => v === a - b || v === Math.abs(a - b) ? 'You took away. “More” means the groups join.' : 'Add the two rows.',
          hints: ['Which words tell you to join?', `Row one has ${a}, row two has ${b}.`, `${a} + ${b} = ?`],
          solution: `${a} + ${b} = <b>${a + b}</b> seedlings altogether.`,
        };
      } },
  ],

  ghubar: ['One group is enough. The rest can watch.', 'Six plus two is six. Bigger wins!', 'I add by taking away. It is faster.'],
  praise: ['Both groups counted!', 'Ten and more — well done!', 'The bars agree with you!', 'Joined perfectly!'],
  finale: 'Every pot joined and counted — you can add within 10! 🌱',
};

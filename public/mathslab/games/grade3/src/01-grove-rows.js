/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 3 · Grove Rows · a multiplication fact grown from equal groups (3.OA.A.1)
   Source: G03-U01-MATH-L02 — الضرب والقسمة كتساويات المجموعات والمصفوفات ضمن ١٠٠.
   Mechanic = the thinking: level 1 reads a drawn grove of equal groups and writes the fact (the picture is
   unnumbered, so the child must count the groups and the group size); level 2 goes the other way — a fact is
   given and the child chooses the grove that shows it, so "3 groups of 4" and "4 groups of 3" must be told
   apart by counting, not by reading; level 3 is a word problem where the child decides which number is the
   group size and which is the number of groups. `added-not-multiplied` is a named misconception.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g3-grove-rows', code: 'G03-MAT-01', title: 'Grove Rows', emoji: '🌴',
  accent: '#2f7d5c', accentDeep: '#256349', skyA: '#effaf1', skyB: '#d3efdb',
  topic: 'Multiplication as equal groups', band: 'g35', lang: 'en',
  objective: 'I can <b>read equal groups</b> as a multiplication fact and find the <b>total</b>.',
  welcome: 'Sheikh Salem is planting a new palm grove in Al-Ahsa. Every row must hold the same number of palms. 🌴',
  learnBlurb: 'Groups × palms in each group = total.',
  how: {
    what: 'A multiplication fact counts equal groups. The first number is how many groups; the second is how many in each group.',
    steps: ['🌴 Count the groups — that is the first number.', '🌴 Count what is in one group — that is the second number.', '✅ Multiply to get the total.'],
  },

  learn: [
    { say: 'Salem plants <b>3 groups</b> and puts <b>4 palms</b> in each group. That is <b>3 × 4</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE3.groups(3, 4) })); } },
    { say: '<b>3 × 4 = 12</b> palms. The 3 counted the groups. The 4 counted one group. Multiplication adds the group again and again: 4 + 4 + 4.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE3.groups(3, 4, { max: 520 }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '3 × 4 = 4 + 4 + 4 = <b>12</b> palms' }));
      } },
    { say: 'Your turn: how many palms in <b>4 groups of 5</b>?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE3.groups(4, 5, { max: 560 }) }));
        const row = UI.h('div', { class: 'opts' });
        [20, 9, 25].forEach((v) => row.append(UI.h('button', {
          class: 'opt', text: String(v),
          onclick: (e) => (v === 20 ? (e.target.classList.add('good'), L.ok('Yes — 4 groups of 5 is <b>20</b>.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(v === 9 ? 'That adds the two numbers. Multiply them instead.' : 'No — count the groups again, then the palms in one group.', 'bad'))),
        })));
        el.append(row);
      } },
    { say: 'Ghubar says <b>4 groups of 5</b> means 4 + 5 = 9. What should he do?', wait: true,
      draw(el, L) {
        GHUBAR.pop('4 groups of 5 palms... 4 + 5 = 9 palms. Done!', 5200);
        el.append(UI.h('div', { html: SCENE3.groups(4, 5, { max: 520 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['Add 5 four times: 5 + 5 + 5 + 5.', true], ['Add 4 five times: 4 + 4 + 4 + 4 + 4.', false], ['Add 4 and 5 once each.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Exactly — every group adds another 5.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('What is inside one group? How many groups are there?', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Read the grove', icon: '🌴', blurb: 'Count the groups, count one group.', rounds: 6, think: false,
      say: '🌴 How many palms are in this grove?',
      round() {
        const g = UI.rint(2, 5), s = UI.rint(2, 6);
        return {
          type: 'number', prompt: G1.art(SCENE3.groups(g, s, { max: 580 }), `${g} equal groups.`),
          answer: g * s, suffix: '',
          why: (v) => v === g + s ? 'That adds the group count to the group size. Each group holds the same number — multiply.'
            : v === s ? 'That counts one group only. There are several groups.'
            : 'Count the groups, then multiply by the palms in one group.',
          hints: [`Count the boxes: there are ${g} groups.`, `Each group holds ${s} palms.`, `${g} × ${s} = ?`],
          solution: `${g} groups of ${s} → ${g} × ${s} = <b>${g * s}</b> palms.`,
        };
      } },
    { name: 'Match the fact', icon: '🔢', blurb: 'Choose the picture that shows the fact.', rounds: 6, think: false,
      say: '🔢 Which grove shows this fact?',
      round() {
        const g = UI.rint(2, 6), s = UI.rint(2, 6);
        /* the swapped array: same palms, different groups — only counting tells them apart */
        return {
          type: 'choice', prompt: `Which picture shows <b>${g} × ${s}</b>?`,
          options: [
            `<div style="transform:scale(.9)">${SCENE3.groups(g, s, { max: 300 })}</div>`,
            `<div style="transform:scale(.9)">${SCENE3.groups(s, g, { max: 300 })}</div>`,
          ],
          answer: `<div style="transform:scale(.9)">${SCENE3.groups(g, s, { max: 300 })}</div>`,
          why: () => `The first number counts the groups: look for ${g} groups. The second is what is in each.`,
          hints: [`${g} × ${s} means ${g} groups.`, `Each group must hold ${s} palms.`, 'Count the boxes in each picture.'],
          solution: `${g} × ${s} = ${g * s}: ${g} groups with ${s} palms in each.`,
        };
      } },
    { name: 'Grove stories', icon: '📖', blurb: 'A story, then the total.', rounds: 6, think: true,
      say: '📖 Think first: how many groups?',
      round(i) {
        const g = 3 + (i % 3), s = 4 + (i % 2);
        return {
          type: 'number',
          problem: {
            sentences: [`Salem plants ${g} rows of palms in the new grove.`, 'The farm has a new water pump.', `Each row holds ${s} palms.`, 'How many palms does Salem plant?'],
            question: 3, keys: ['each'], extras: [1],
          },
          prompt: 'How many palms does Salem plant?', answer: g * s, suffix: '',
          why: (v) => v === g + s ? 'Rows plus palms is not the total — the palms are added once for every row.' : 'Multiply the rows by the palms in each row.',
          hints: [`There are ${g} rows.`, `Every row holds ${s}.`, `${g} × ${s} = ?`],
          solution: `${g} × ${s} = <b>${g * s}</b> palms.`,
        };
      } },
  ],

  ghubar: ['Equal groups? Just add the two numbers.', 'One group is enough to count.', 'Multiplication is only for big numbers.'],
  praise: ['Grove counted!', 'Fact found!', 'Groups and palms!', 'Growing strong!'],
  finale: 'Every row planted — you can read equal groups as a fact! 🌴',
};

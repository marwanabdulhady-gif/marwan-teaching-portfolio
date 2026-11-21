/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 1 · Date-Shop Data Detectives · collecting, representing and reading simple data (draft G01-MAT step 9)
   Mechanic = the thinking: level 1 sorts votes into the right column (representing), level 2 reads totals
   from the picture graph, level 3 compares categories — the three separate Grade 1 data actions.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const FRUIT = ['Dates', 'Figs', 'Oranges'];

const GAME = {
  id: 'g1-date-data', code: 'G01-MAT-09', title: 'Date-Shop Data Detectives', emoji: '📊',
  accent: '#3f7ec9', accentDeep: '#2c5e9c', skyA: '#f2f7ff', skyB: '#dbe8fb',
  topic: 'Simple data', band: 'k2', lang: 'en',
  objective: 'I can <b>sort</b> votes into groups and <b>read</b> a picture graph to say which group has most.',
  welcome: 'The date shop wants to know: which fruit do visitors like best? 📊',
  learnBlurb: 'One vote, one circle. Count the circles in each group.',
  how: {
    what: 'A picture graph shows how many votes each fruit got. One circle is one vote.',
    steps: ['📊 Each fruit has its own column.', '🔢 Count the circles in a column.', '✅ The tallest column has the most votes.'],
  },

  learn: [
    { say: 'At the date shop, visitors vote for a favourite fruit. Which fruit got the most votes?',
      draw(el) { el.append(UI.h('div', { html: SCENE.graph([2, 4, 1]) })); } },
    { say: 'Each circle is <b>one vote</b>. Figs have <b>4</b> circles, dates 2, oranges 1 — fits have the most.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE.graph([2, 4, 1]) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: 'Count the circles, not the fruit names: <b>Dates 2 · Figs 4 · Oranges 1</b>.' }));
      } },
    { say: 'Your turn: how many votes did <b>Oranges</b> get?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE.graph([1, 2, 4]) }));
        const row = UI.h('div', { class: 'opts' });
        [4, 3, 1].forEach((v) => row.append(UI.h('button', {
          class: 'opt', text: String(v),
          onclick: (e) => v === 4 ? (e.target.classList.add('good'), L.ok('Yes — four circles in the oranges column.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Find the oranges column and count its circles.', 'bad')),
        })));
        el.append(row);
      } },
    { say: 'Ghubar said <b>Dates</b> has the most because it is the longest word. What should he count?', wait: true,
      draw(el, L) {
        GHUBAR.pop('“Oranges” is a long word. Long word, big number!', 5000);
        const row = UI.h('div', { class: 'opts' });
        [['The circles in each column.', true], ['The letters in each name.', false], ['The colours in the picture.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Exactly — the circles are the votes.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('What is one circle worth in this graph?', 'bad')),
        })));
        el.append(UI.h('div', { html: SCENE.graph([3, 1, 2]) }), row);
      } },
  ],

  levels: [
    { name: 'One vote, one circle', icon: '🔢', blurb: 'Count a column.', rounds: 4, think: false,
      say: '🔢 How many votes did this fruit get?',
      round() {
        const vals = [UI.rint(1, 4), UI.rint(1, 4), UI.rint(1, 4)];
        const pick = UI.rint(0, 2);
        return {
          type: 'number', prompt: G1.art(SCENE.graph(vals), 'Count the circles in one column.'),
          answer: vals[pick], suffix: '',
          why: (v) => v > vals[pick] ? 'Count only the circles in that column.' : 'Count every circle in the column, top to bottom.',
          hints: [`Find the ${FRUIT[pick]} column.`, 'Each circle is one vote.', `Count them one at a time.`],
          solution: `${FRUIT[pick]} has <b>${vals[pick]}</b> circles, so ${vals[pick]} votes.`,
        };
      } },
    { name: 'Most and fewest', icon: '⚖️', blurb: 'Compare the columns.', rounds: 4, think: false,
      say: '⚖️ Which fruit has the most votes?',
      round() {
        const vals = UI.shuffle([UI.rint(1, 2), UI.rint(1, 2), UI.rint(3, 5)]);
        const top = FRUIT[vals.indexOf(Math.max(...vals))];
        return {
          type: 'choice', prompt: G1.art(SCENE.graph(vals)),
          options: FRUIT.slice(), answer: top,
          why: () => 'The column with the most circles has the most votes.',
          hints: ['Compare the heights of the columns.', 'Count the circles in each.', `The tallest column is ${top}.`],
          solution: `<b>${top}</b> has the most votes (${Math.max(...vals)}).`,
        };
      } },
    { name: 'Shop report', icon: '📖', blurb: 'Read a report about the votes.', rounds: 4,
      say: '📖 Think first: what does the shop want to know?',
      round(i) {
        const vals = [2 + (i % 2), 3 + (i % 3), 1 + (i % 2)];
        return {
          type: 'number',
          problem: {
            sentences: [`The date shop asks visitors to vote for a favourite fruit.`, `Dates got ${vals[0]} votes and figs got ${vals[1]} votes.`, 'The shop opens early in the morning.', `How many votes did dates and figs get altogether?`],
            question: 3, keys: ['altogether'], extras: [2],
          },
          prompt: 'How many votes did dates and figs get altogether?', answer: vals[0] + vals[1], suffix: '',
          why: (v) => v === Math.abs(vals[0] - vals[1]) ? 'Altogether means add the two columns.' : v === vals[0] || v === vals[1] ? 'That is one fruit. Add both.' : 'Count dates, then count figs, then add.',
          hints: ['Which words tell you to add?', `Dates ${vals[0]}, figs ${vals[1]}.`, `${vals[0]} + ${vals[1]} = ?`],
          solution: `${vals[0]} + ${vals[1]} = <b>${vals[0] + vals[1]}</b> votes altogether.`,
        };
      } },
  ],

  ghubar: ['Longest name, biggest number. Easy!', 'One circle is ten votes, I think.', 'I count the colours instead.'],
  praise: ['Votes counted!', 'Graph detective!', 'Most and fewest — sorted!', 'One circle, one vote!'],
  finale: 'The date shop has its answer — you can read a picture graph! 📊',
};

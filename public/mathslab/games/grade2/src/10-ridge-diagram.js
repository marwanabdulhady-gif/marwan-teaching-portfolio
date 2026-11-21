/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 2 · Ridge Diagram · reading a scaled picture graph and its key (2.MD.D.10)
   Mechanic = the thinking: level 1 reads a picture graph where one circle means 2 (the key, not one), level 2 compares two
   categories, level 3 is a two-step question — how many more — which needs reading AND subtracting. The
   `SCENE2.graphKeyed` draws it, because the key is part of the question and the shared scene hard-codes its own.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const NAMES = ['Ibex', 'Hyrax', 'Baboons'];

const GAME = {
  id: 'g2-ridge-diagram', code: 'G02-MAT-10', title: 'Ridge Diagram', emoji: '📈',
  accent: '#4a5fa8', accentDeep: '#374a86', skyA: '#f3f5ff', skyB: '#dde2fb',
  topic: 'Graphs and their key', band: 'g35', lang: 'en',
  objective: 'I can <b>read a picture graph</b> with a key and say <b>how many more</b> one group has.',
  welcome: 'The rangers count animals on the ridge and draw the totals. 📈',
  learnBlurb: 'The key tells you what one picture stands for.',
  how: {
    what: 'A picture graph uses a key. If one circle means 2 animals, four circles means 8 animals.',
    steps: ['📈 Read the key first.', '📈 Count the circles in a column.', '✅ Multiply by the key. Then compare.'],
  },

  learn: [
    { say: 'The rangers saw ibex and hyrax. Each circle stands for <b>2</b> animals. What did they see?',
      draw(el) {
        el.append(UI.h('div', { html: SCENE2.graphKeyed([3, 2, 4], { key: 'each circle = 2 animals', keyValue: 2 }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: 'Key: 1 circle = <b>2</b> animals' }));
      } },
    { say: 'Count the circles: <b>3, 2, 4</b>. Times two: <b>6, 4, 8</b> animals. Baboons have the most.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE2.graphKeyed([3, 2, 4], { key: 'each circle = 2 animals', keyValue: 2 }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '3 × 2 = 6 · 2 × 2 = 4 · 4 × 2 = <b>8</b>' }));
      } },
    { say: 'Your turn: how many <b>more</b> baboons than ibex?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE2.graphKeyed([3, 2, 4], { key: 'each circle = 2 animals', keyValue: 2 }) }));
        const row = UI.h('div', { class: 'opts' });
        [2, 1, 8].forEach((v) => row.append(UI.h('button', {
          class: 'opt', text: String(v),
          onclick: (e) => v === 2 ? (e.target.classList.add('good'), L.ok('Yes — 8 − 6 = 2 more.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(v === 1 ? 'That is the difference in CIRCLES. Each circle is 2 animals.' : 'That is how many baboons. The question asks how many MORE.', 'bad')),
        })));
        el.append(row);
      } },
    { say: 'Ghubar says baboons are <b>4 more</b> than ibex. What did he forget?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Four circles against three circles — four more!', 5000);
        const row = UI.h('div', { class: 'opts' });
        [['The key — each circle is 2, so one circle more is 2 animals more.', true], ['The names of the animals.', false], ['Nothing — 4 more is right.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Right — always multiply by the key before comparing.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('What does one circle stand for?', 'bad')),
        })));
        el.append(UI.h('div', { html: SCENE2.graphKeyed([3, 2, 4], { key: 'each circle = 2 animals', keyValue: 2 }) }), row);
      } },
  ],

  levels: [
    { name: 'Read the key', icon: '📈', blurb: 'Circles × key.', rounds: 4, think: false,
      say: '📈 How many animals in this column?',
      round() {
        const key = UI.pick([2, 5]), circles = UI.rint(2, 6);
        const vals = [circles, UI.rint(1, 6), UI.rint(1, 6)];
        return {
          type: 'choice', prompt: G1.art(SCENE2.graphKeyed(vals, { key: `each circle = ${key} animals`, keyValue: key, names: NAMES }), `Key: 1 circle = ${key}. How many does the first column show?`),
          options: UI.shuffle([String(circles * key), String(circles), String(circles + key)]).filter((v, i, a) => a.indexOf(v) === i),
          answer: String(circles * key),
          why: (v) => +v === circles ? 'That counts circles, not animals. Multiply by the key.' : 'Each circle is more than one.',
          hints: [`The first column has ${circles} circles.`, `Each circle is ${key} animals.`, `${circles} × ${key} = ?`],
          solution: `${circles} circles × ${key} = <b>${circles * key}</b> animals.`,
        };
      } },
    { name: 'Compare two columns', icon: '⚖️', blurb: 'Which group is bigger?', rounds: 4, think: false,
      say: '⚖️ Which group has more, and by how many circles?',
      round() {
        const key = UI.pick([2, 2, 5]);
        const a = UI.rint(2, 5), b = a + UI.rint(1, 3), c = UI.rint(1, 6);
        const vals = [a, b, c];
        return {
          type: 'number', prompt: G1.art(SCENE2.graphKeyed(vals, { key: `each circle = ${key} animals`, keyValue: key, names: NAMES }), `Key: 1 circle = ${key}.`),
          answer: (b - a) * key, suffix: '',
          why: (v) => v === b - a ? 'That is the difference in circles. Multiply by the key.' : v === b * key ? 'That is the whole column, not the difference.' : 'Subtract the animals, not the circles.',
          hints: [`The second column has ${b} circles and the first has ${a}.`, `Difference in circles: ${b - a}.`, `Each circle is ${key} animals.`],
          solution: `${b * key} − ${a * key} = <b>${(b - a) * key}</b> more.`,
        };
      } },
    { name: 'Ranger reports', icon: '📖', blurb: 'A two-step question.', rounds: 4, think: true,
      say: '📖 Think first: what do you need first?',
      round(i) {
        const key = 2 + (i % 2);
        const a = 2 + i, b = a + 2, c = a + 1;
        return {
          type: 'number',
          problem: {
            sentences: [`The rangers count ibex, hyrax and baboons.`, 'Each circle on the chart stands for ' + key + '.', `Ibex have ${a} circles and baboons have ${b} circles.`, 'How many MORE baboons than ibex?'],
            question: 3, keys: ['more'], extras: [1],
          },
          prompt: `Key: 1 circle = ${key}. How many more baboons than ibex?`, answer: (b - a) * key, suffix: '',
          why: (v) => v === b - a ? 'Multiply the circle difference by the key.' : v === b * key ? 'That is all the baboons — the question asks how many more.' : 'Find both totals, then subtract.',
          hints: [`Ibex: ${a} × ${key}.`, `Baboons: ${b} × ${key}.`, 'How many more means subtract the smaller total.'],
          solution: `${b * key} − ${a * key} = <b>${(b - a) * key}</b> more baboons.`,
        };
      } },
  ],

  ghubar: ['One circle, one animal. The key is a rumour.', 'More means the bigger number, whatever it says.', 'Graphs are pictures. Pictures are not maths.'],
  praise: ['Key read first!', 'Multiplied by the key!', 'Compared correctly!', 'Ranger report approved!'],
  finale: 'The ridge is counted — you can read a graph with a key! 📈',
};

/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 1 · Jeddah Tile Studio · naming 2-D shapes by sides and corners (draft G01-MAT step 6)
   Mechanic = the thinking: the child must count sides and corners to choose a tile, and level 2 rotates
   and re-orders the tiles so a remembered position cannot stand in for the shape's attributes.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const SHAPE_Q = {
  triangle: 'Which tile has <b>3 straight sides</b> and <b>3 corners</b>?',
  square: 'Which tile has <b>4 equal sides</b> and <b>4 corners</b>?',
  rectangle: 'Which tile has <b>4 corners</b> and <b>two long sides</b>?',
  circle: 'Which tile has <b>no straight sides</b> and <b>no corners</b>?',
};
const shapeLetters = (order) => Object.fromEntries(order.map((n, i) => [n, 'ABCD'[i]]));

const GAME = {
  id: 'g1-tile-shapes', code: 'G01-MAT-06', title: 'Jeddah Tile Studio', emoji: '🔷',
  accent: '#6f54c4', accentDeep: '#513a9b', skyA: '#f6f2ff', skyB: '#e6dcfb',
  topic: '2-D shapes', band: 'k2', lang: 'en',
  objective: 'I can name a flat shape by counting its <b>straight sides</b> and <b>corners</b>.',
  welcome: 'The tile studio is busy! Help sort the mosaic tiles. 🔷',
  learnBlurb: 'Count the sides, count the corners, then name the shape.',
  how: {
    what: 'A shape’s name comes from its sides and corners. Turning it does not change them.',
    steps: ['📏 Count the straight sides.', '📍 Count the corners.', '✅ Use both to name the shape.'],
  },

  learn: [
    { say: 'Four tiles are drying at the studio. What makes each one different?',
      draw(el) { el.append(UI.h('div', { html: SCENE.shapes({}) })); } },
    { say: 'Tile A has <b>3 sides</b> and <b>3 corners</b> — a triangle. Tile B has 4 equal sides — a square.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE.shapes({}) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: 'Triangle 3 · Square 4 equal · Rectangle 4 (two long) · Circle 0 corners.' }));
      } },
    { say: 'Your turn: which tile is the <b>triangle</b>?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE.shapes({}) }));
        const row = UI.h('div', { class: 'opts' });
        [['A', true], ['B', false], ['C', false], ['D', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Yes — 3 sides, 3 corners: A is the triangle.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Count the corners of that tile. A triangle has 3.', 'bad')),
        })));
        el.append(row);
      } },
    { say: 'Ghubar turned a square and said it is now a <b>diamond</b>. What stays the same?', wait: true,
      draw(el, L) {
        GHUBAR.pop('I turned it! New shape! Diamonds for everyone!', 5000);
        const row = UI.h('div', { class: 'opts' });
        [['Its 4 sides and 4 corners.', true], ['Which way it points.', false], ['Its place on the table.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Exactly — turning a shape never changes its sides or corners.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Count the sides after turning it. Did the number change?', 'bad')),
        })));
        el.append(UI.h('div', { html: SCENE.shapes({ order: ['square', 'triangle', 'circle', 'rectangle'], rot: 45 }) }), row);
      } },
  ],

  levels: [
    { name: 'Count the corners', icon: '📍', blurb: 'Name the shape from its attributes.', rounds: 4, think: false,
      say: '📍 Which tile fits the clue?',
      round() {
        const order = UI.shuffle(['triangle', 'square', 'rectangle', 'circle']);
        const target = UI.pick(order);
        const letters = shapeLetters(order);
        return {
          type: 'choice', prompt: `${G1.art(SCENE.shapes({ order }))}${SHAPE_Q[target]}`,
          options: ['A', 'B', 'C', 'D'], answer: letters[target],
          why: () => 'Count the straight sides, then count the corners.',
          hints: ['Read the clue again.', 'Count sides first, then corners.', `You are looking for the ${target}.`],
          solution: `The ${target} is tile <b>${letters[target]}</b>.`,
        };
      } },
    { name: 'Turn it round', icon: '🔄', blurb: 'A turned shape keeps its name.', rounds: 4, think: false,
      say: '🔄 The tiles are turned. Do not be fooled!',
      round() {
        const order = UI.shuffle(['triangle', 'square', 'rectangle', 'circle']);
        const target = UI.pick(['triangle', 'square', 'rectangle']);
        const letters = shapeLetters(order);
        const rot = UI.pick([18, 30, 45]);
        return {
          type: 'choice', prompt: `${G1.art(SCENE.shapes({ order, rot }), 'Some tiles are turned.')}${SHAPE_Q[target]}`,
          options: ['A', 'B', 'C', 'D'], answer: letters[target],
          why: () => 'Turning does not change sides or corners. Count them anyway.',
          hints: ['Ignore which way it points.', 'Count the sides.', `A ${target} has ${target === 'triangle' ? 3 : 4} sides.`],
          solution: `Even turned, the ${target} is tile <b>${letters[target]}</b>.`,
        };
      } },
    { name: 'Studio orders', icon: '🧺', blurb: 'Match a shape name to its picture.', rounds: 4, think: false,
      say: '🧺 Which picture shows the shape the studio needs?',
      round() {
        const target = UI.pick(['triangle', 'square', 'rectangle', 'circle']);
        const wrong = ['triangle', 'square', 'rectangle', 'circle'].filter((n) => n !== target);
        const shape = (n) => `<div style="display:inline-block;vertical-align:middle">${SCENE.shapes({ order: [n, n, n, n], next: false }).replace(/<\/?svg[^>]*>/g, '')}</div>`;
        /* one picture per option, drawn from a single-shape scene so each is unambiguous */
        const one = (n) => {
          const cols = { triangle: '#e0693f', square: '#7656b8', rectangle: '#2a8b91', circle: '#4d8f5c' };
          const body = n === 'triangle' ? '<polygon points="70,20 34,80 106,80" fill="#e0693f"/>'
            : n === 'square' ? '<rect x="36" y="22" width="60" height="60" fill="#7656b8"/>'
            : n === 'rectangle' ? '<rect x="24" y="32" width="84" height="42" fill="#2a8b91"/>'
            : '<circle cx="68" cy="52" r="32" fill="#4d8f5c"/>';
          return `<svg viewBox="0 0 136 104" role="img" aria-label="a ${n}" style="width:100%;max-width:130px;display:block;margin:0 auto"><rect x="2" y="2" width="132" height="100" rx="12" fill="#fff" stroke="#d9cfe8" stroke-width="2"/>${body}</svg>`;
        };
        return {
          type: 'choice', prompt: `The studio needs a <b>${target}</b>. Which picture is it?`,
          options: UI.shuffle(wrong.concat([target])).map(one),
          answer: one(target),
          why: () => 'Count the sides and corners of the picture you chose.',
          hints: ['Read the shape name.', 'Count sides and corners.', `A ${target} looks like: ${target === 'circle' ? 'no corners' : target === 'triangle' ? '3 sides' : '4 sides'}.`],
          solution: `The ${target} is the picture with the right sides and corners.`,
        };
      } },
  ],

  ghubar: ['Turned it — new shape! Diamonds for everyone!', 'Corners and sides are the same thing.', 'A long square is a rectangle. Wait.'],
  praise: ['Sides and corners counted!', 'Not fooled by turning!', 'Shape expert!', 'The studio is sorted!'],
  finale: 'Every tile sorted by its sides and corners! 🔷',
};

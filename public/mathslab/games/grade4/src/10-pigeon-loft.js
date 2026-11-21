/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 4 · Pigeon Loft · shape and angle properties of quadrilaterals and triangles (4.G.A.1–A.3)
   Source: grade-04.md Grade 4 geometry strand — lines, angles, and classifying shapes by properties.
   Mechanic = the thinking: level 1 shows a shape and asks which property list is true for it, so the child must
   check every claim rather than recognise the name; level 2 gives the properties and asks which shape fits,
   with a near-miss that has the right angles but the wrong side lengths; level 3 is a story. `shape-by-look`
   (naming a shape from its outline) and `shape-property-one` (checking only one property) are named.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g4-pigeon-loft', code: 'G04-MAT-10', title: 'Pigeon Loft', emoji: '🕊️',
  accent: '#48607a', accentDeep: '#384c62', skyA: '#f3f7fb', skyB: '#dde8f2',
  topic: 'Shape properties', band: 'g35', lang: 'en',
  objective: 'I can classify a shape by its <b>properties</b> — parallel sides, equal sides and right angles.',
  welcome: 'The pigeon loft of the old quarter is built from squares, rectangles and triangles of every kind. 🕊️',
  learnBlurb: 'A shape is what its properties say it is.',
  how: {
    what: 'Shapes are classified by their properties: whether sides are parallel or equal, and whether angles are right angles.',
    steps: ['🕊️ Count the sides.', '🕊️ Mark the parallel sides and the equal sides.', '✅ Check the angles — a right angle is square.'],
  },

  learn: [
    { say: 'This shape has <b>4 sides</b>, all the same length, and <b>4 right angles</b>. That is a square.',
      draw(el) { el.append(UI.h('div', { html: SCENE4.shape('square', { max: 260 }) })); } },
    { say: 'A rectangle also has four right angles, but its sides are not all the same — the opposite sides match. A square is a rectangle with more properties.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE4.shape('rectangle', { max: 300 }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '4 right angles · opposite sides equal → <b>rectangle</b>' }));
      } },
    { say: 'Your turn: a shape has <b>3 equal sides</b> and <b>3 angles</b>. What is it?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE4.shape('triangle', { max: 240 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['An equilateral triangle.', true], ['A square.', false], ['A rhombus.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — three equal sides and three angles is an equilateral triangle.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === 'A rhombus.' ? 'A rhombus has four sides, not three.' : 'Count the sides first.', 'bad'))),
        })));
        el.append(row);
      } },
    { say: 'Ghubar says a square is not a rectangle because it looks different. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('A square is a square. A rectangle is long. They are different things.', 5200);
        el.append(UI.h('div', { html: SCENE4.shape('square', { max: 220 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — a square has four right angles and opposite sides equal, so it is a rectangle too.', true], ['Yes — squares and rectangles are separate.', false], ['Only if it is turned.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — a square is a special rectangle, not a different shape.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('List the properties of a rectangle. Does a square have them?', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'True statements', icon: '🕊️', blurb: 'Which property list is true?', rounds: 6, think: false,
      say: '🕊️ Which statement is true for this shape?',
      round() {
        const set = [
          { shape: 'square', right: '4 equal sides and 4 right angles.', wrong: ['2 equal sides and 2 right angles.', '4 equal sides and no right angles.'] },
          { shape: 'rectangle', right: '2 pairs of equal sides and 4 right angles.', wrong: ['4 equal sides and 4 right angles.', '1 pair of parallel sides and 2 right angles.'] },
          { shape: 'triangle', right: '3 sides and 3 angles.', wrong: ['4 sides and 4 angles.', '3 sides and 4 angles.'] },
          { shape: 'parallelogram', right: '2 pairs of parallel sides and 2 pairs of equal angles.', wrong: ['4 right angles.', '1 pair of parallel sides.'] },
          { shape: 'rhombus', right: '4 equal sides but not necessarily right angles.', wrong: ['4 right angles and 2 equal sides.', '3 equal sides.'] },
        ];
        const s = UI.pick(set);
        return {
          type: 'choice', prompt: G1.art(SCENE4.shape(s.shape, { max: 240 }), 'Check every claim, not just the first.'),
          options: [s.right, ...s.wrong], answer: s.right,
          why: () => 'Check the sides, then the parallel pairs, then the angles.',
          hints: ['Count the sides.', 'Mark the sides that are the same length.', 'Look for square corners.'],
          solution: s.right,
        };
      } },
    { name: 'Which shape?', icon: '🔍', blurb: 'Name the shape from its properties.', rounds: 6, think: false,
      say: '🔍 Which shape matches these properties?',
      round() {
        const set = [
          { props: '4 sides, all equal, with 4 right angles.', right: 'square', wrong: ['rhombus', 'rectangle'] },
          { props: '4 sides, 4 right angles, but not all sides equal.', right: 'rectangle', wrong: ['square', 'trapezoid'] },
          { props: '4 sides, both pairs of opposite sides parallel, no right angles.', right: 'parallelogram', wrong: ['rectangle', 'square'] },
          { props: '3 sides, all the same length.', right: 'equilateral triangle', wrong: ['isosceles triangle', 'square'] },
        ];
        const s = UI.pick(set);
        return {
          type: 'choice', prompt: s.props, options: [s.right, ...s.wrong], answer: s.right,
          why: (v) => v === 'square' && s.right !== 'square' ? 'A square needs four equal sides as well as the right angles.' : 'Every property in the list has to be true.',
          hints: ['Count the sides in the description.', 'Which property rules out the others?', 'A square is the strictest one.'],
          solution: s.right,
        };
      } },
    { name: 'Loft stories', icon: '📖', blurb: 'A story about a loft panel.', rounds: 6, think: true,
      say: '📖 Think first: which properties are stated?',
      round(i) {
        const set = [
          { text: 'A loft panel has 4 sides, all the same length, and every corner is a right angle.', right: 'a square', wrong: ['a rectangle', 'a rhombus'] },
          { text: 'A loft panel has 4 sides and 4 right angles, but one pair of sides is longer than the other.', right: 'a rectangle', wrong: ['a square', 'a parallelogram'] },
          { text: 'A loft panel has 3 sides and every side is a different length.', right: 'a triangle', wrong: ['a square', 'a rhombus'] },
        ];
        const s = set[i % set.length];
        return {
          type: 'choice',
          problem: {
            sentences: ['The pigeon loft in the old quarter needs a new panel.', 'The carpenter measures before cutting.', s.text, 'Which shape is the panel?'],
            question: 3, keys: ['right angle', 'same length', 'longer'], extras: [1],
          },
          prompt: 'Which shape is the panel?',
          options: [s.right, ...s.wrong], answer: s.right,
          why: () => 'List the properties first, then name the shape that has all of them.',
          hints: ['Count the sides.', 'Are the corners square?', 'Are all the sides equal, or only opposite ones?'],
          solution: s.right,
        };
      } },
  ],

  ghubar: ['If it looks like a rectangle, it is a rectangle.', 'One property is enough to name a shape.', 'Parallel sides are decoration.'],
  praise: ['Properties checked!', 'Shape named!', 'Right angles found!', 'Panel measured!'],
  finale: 'Every panel named by its properties — you can classify shapes! 🕊️',
};

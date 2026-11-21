/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 1 · Lantern Light-Out · taking away and subtracting within 10 (draft G01-MAT step 4)
   Mechanic = the thinking: the picture shows total and how many are crossed out, so the child must take
   away and count what is still lit. Level 2 asks for the number sentence instead of the count — the
   same picture, a different question, which is the CRA climb the brief asks for.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const L1 = '#e5744d';

const GAME = {
  id: 'g1-lantern-light', code: 'G01-MAT-04', title: 'Lantern Light-Out', emoji: '🏮',
  accent: '#c86a2a', accentDeep: '#9c4d18', skyA: '#fff4e6', skyB: '#ffe3c2',
  topic: 'Subtraction within 10', band: 'k2', lang: 'en',
  objective: 'I can <b>take away</b> from a group and find <b>how many are left</b>, subtracting within 10.',
  welcome: 'Lanterns glow down the old-town lane. The breeze is coming! 🏮',
  learnBlurb: 'Cover what goes out, then count what still glows.',
  how: {
    what: 'Subtracting means taking some away. Count what is still there.',
    steps: ['🏮 Count the lanterns at the start.', '🌬️ Cross out the ones that go out.', '✅ Count the ones still glowing.'],
  },

  learn: [
    { say: 'Noor sees <b>7</b> lanterns glowing in the lane. The breeze puts out <b>2</b>. How many still glow?',
      draw(el) { el.append(UI.h('div', { html: SCENE.lanterns(7, 5, { color: L1 }) })); } },
    { say: 'Take away the 2: <b>7 − 2 = 5</b>. The grey lanterns are the ones that went out.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE.lanterns(7, 5, { color: L1 }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: 'Count only the lanterns still glowing: <b>5</b>.' }));
      } },
    { say: 'Your turn: <b>8 − 3</b>. Which lanterns belong in the answer?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE.lanterns(8, 5, { color: L1 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['The ones still glowing: 5', true], ['The ones that went out: 3', false], ['All of them: 8', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Yes — 8 take away 3 leaves <b>5</b>.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('The question asks how many are LEFT — not how many went out.', 'bad')),
        })));
        el.append(row);
      } },
    { say: 'Ghubar says the answer is <b>8</b>. What did he do?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Nothing went out! I did not see anything!', 5000);
        const row = UI.h('div', { class: 'opts' });
        [['He counted every lantern, including the dark ones.', true], ['He counted only the dark ones.', false], ['He was right.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Exactly — the dark lanterns are gone from the answer.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Which lanterns are still glowing? Count only those.', 'bad')),
        })));
        el.append(UI.h('div', { html: SCENE.lanterns(8, 5, { color: L1 }) }), row);
      } },
  ],

  levels: [
    { name: 'Count what is left', icon: '🏮', blurb: 'Take away, then count the rest.', rounds: 4, think: false,
      say: '🏮 How many lanterns still glow?',
      round() {
        const a = UI.rint(4, 10), b = UI.rint(1, a - 1);
        return {
          type: 'number', prompt: G1.art(SCENE.lanterns(a, a - b, { color: L1 }), `${a} lanterns glow. ${b} go out.`),
          answer: a - b, suffix: '',
          why: (v) => v === a ? 'You counted the dark lanterns too. Count only the glowing ones.' : v === b ? 'That is how many went OUT. The question asks what is left.'
            : v === a + b ? 'You added. Putting out lanterns means take away.' : 'Count the lanterns still glowing.',
          hints: ['How many were glowing at the start?', `How many went out? Take that away.`, `${a} − ${b} = ?`],
          solution: `${a} − ${b} = <b>${a - b}</b> lanterns still glow.`,
        };
      } },
    { name: 'The sentence', icon: '➖', blurb: 'Choose the take-away sentence.', rounds: 4, think: false,
      say: '➖ Which number sentence tells the story?',
      round() {
        const a = UI.rint(5, 10), b = UI.rint(1, a - 2);
        return {
          type: 'choice', prompt: G1.art(SCENE.lanterns(a, a - b, { color: L1 }), `${a} lanterns glow. ${b} go out.`),
          options: G1.opts(`${a} − ${b} = ${a - b}`, [`${a} + ${b} = ${a + b}`, `${a} − ${b} = ${b}`, `${b} − ${a} = ${a - b}`]),
          answer: `${a} − ${b} = ${a - b}`,
          why: (v) => String(v).includes('+') ? 'Adding would make more lanterns. Some went out.' : 'Take the lanterns that went out away from the ones you started with.',
          hints: ['Did the number get bigger or smaller?', 'Taking away uses −.', `${a} take away ${b}.`],
          solution: `<b>${a} − ${b} = ${a - b}</b> — that is what is still glowing.`,
        };
      } },
    { name: 'Lane stories', icon: '📖', blurb: 'A story with numbers to cross out.', rounds: 4,
      say: '📖 Think first: what happens in the story?',
      round(i) {
        const a = 6 + (i % 4), b = 1 + (i % 3);
        return {
          type: 'number',
          problem: {
            sentences: [`${a} lanterns glow along the lane.`, 'The lane is very old.', `The breeze puts out ${b} of them.`, 'How many lanterns are still glowing?'],
            question: 3, keys: ['out', 'still'], extras: [1],
          },
          prompt: 'How many lanterns are still glowing?', answer: a - b, suffix: '',
          why: (v) => v === a + b ? 'The breeze takes lanterns away — subtract.' : v === b ? 'That is how many went out. Count what is left.' : 'Start with the glowing lanterns, then take away the ones that went out.',
          hints: ['Start with how many were glowing.', `${b} went out — take them away.`, `${a} − ${b} = ?`],
          solution: `${a} − ${b} = <b>${a - b}</b> still glowing.`,
        };
      } },
  ],

  ghubar: ['Put out? I only see lit ones!', 'More lanterns means more light — add!', 'Minus is just a small plus, right?'],
  praise: ['Only the lit ones counted!', 'Take away mastered!', 'Sharp eyes!', 'The lane is brighter!'],
  finale: 'Every lantern counted — you can take away within 10! 🏮',
};

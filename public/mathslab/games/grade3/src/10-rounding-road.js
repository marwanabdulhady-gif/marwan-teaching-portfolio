/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 3 · Rounding Road · rounding to the nearest ten with a number line (3.NBT.A.1)
   Source: Grade 3 place-value strand — التقريب (3.NBT.A.1), taught with the number line the same way the
   fractions lesson uses it, so the child meets one tool twice.
   Mechanic = the thinking: level 1 marks a number between two tens on a line with the halfway mark drawn, so
   the child must decide which side of halfway it falls on (the line prints "halfway is 35", never the answer);
   level 2 removes the line and gives the number alone, so the child must recall the halfway rule — the classic
   `round-always-up` decoy is present; level 3 is a word problem. Named misconceptions: `round-always-up` and
   `round-down-on-five` (5 rounds up because halfway belongs to the next ten).
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g3-rounding-road', code: 'G03-MAT-10', title: 'Rounding Road', emoji: '🛣️',
  accent: '#c1642f', accentDeep: '#a04f22', skyA: '#fff8f0', skyB: '#f9e5cf',
  topic: 'Rounding to the nearest ten', band: 'g35', lang: 'en',
  objective: 'I can round a number to the nearest <b>ten</b> by finding which ten it is <b>closest</b> to.',
  welcome: 'The road signs only show tens — every distance must be rounded before it is painted. 🛣️',
  learnBlurb: 'Find the two tens. Midway or more climbs up.',
  how: { what: 'Rounding replaces a number with the nearest ten. Find the two tens the number sits between, then look at the ones digit.', steps: ['🛣️ Find the ten below and the ten above.', '🛣️ The ones digit decides: 5 or more rounds up.', '✅ Write the nearest ten.'] },

  learn: [
    { say: '<b>37</b> sits between <b>30</b> and <b>40</b>. Halfway is 35, and 37 has passed halfway.',
      draw(el) { el.append(UI.h('div', { html: SCENE3.roundLine(30, 40, 37) })); } },
    { say: 'So <b>37</b> is closer to <b>40</b>. The ones digit is 7, and 7 is 5 or more, so it rounds up.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE3.roundLine(30, 40, 37, { max: 520 }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: '37 → <b>40</b>' }));
      } },
    { say: 'Your turn: round <b>63</b> to the nearest ten.', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE3.roundLine(60, 70, 63) }));
        const row = UI.h('div', { class: 'opts' });
        [60, 70, 65].forEach((v) => row.append(UI.h('button', {
          class: 'opt', text: String(v),
          onclick: (e) => (v === 60 ? (e.target.classList.add('good'), L.ok('Yes — 63 is before halfway, so it rounds down to 60.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(v === 70 ? '63 has not passed halfway (65). Round down.' : '65 is the halfway point, not a ten.', 'bad'))),
        })));
        el.append(row);
      } },
    { say: 'Ghubar says <b>63</b> rounds to <b>70</b> because the digit 3 means "go up". What is wrong?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Sixty-three: that is almost seventy, so seventy it is.', 5200);
        el.append(UI.h('div', { html: SCENE3.roundLine(60, 70, 63, { max: 460 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['63 is closer to 60 — it has not reached halfway at 65.', true], ['He is right; every number rounds up.', false], ['63 cannot be rounded.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — look at the ones digit: 3 is less than 5.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Find the halfway point on the line. Which side is the dot?', 'bad'))),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Which side?', icon: '🛣️', blurb: 'Round with the line in front of you.', rounds: 6, think: false,
      say: '🛣️ Round this number to the nearest ten.',
      round() {
        const ten = UI.rint(1, 9) * 10, n = ten + UI.rint(1, 9);
        const answer = n % 10 >= 5 ? ten + 10 : ten;
        return {
          type: 'number', prompt: G1.art(SCENE3.roundLine(ten, ten + 10, n, { max: 540 }), `Round ${n} to the nearest ten.`),
          answer, suffix: '',
          why: (v) => (v === (answer === ten ? ten + 10 : ten)) ? 'Look at which side of halfway the dot sits.' : 'Find the ones digit: 5 or more rounds up, less than 5 rounds down.',
          hints: [`${n} is between ${ten} and ${ten + 10}.`, `Halfway is ${ten + 5}.`, n % 10 >= 5 ? `${n} has passed halfway, so round up.` : `${n} has not reached halfway, so round down.`],
          solution: `${n} → <b>${answer}</b>.`,
        };
      } },
    { name: 'No line now', icon: '🧠', blurb: 'Round from the digits alone.', rounds: 6, think: false,
      say: '🧠 Which ten is nearest?',
      round() {
        const ten = UI.rint(1, 9) * 10, n = ten + UI.rint(1, 9);
        const up = n % 10 >= 5;
        const answer = up ? ten + 10 : ten;
        const decoys = up ? [ten, answer + 10, n] : [ten + 10, ten - 10, n];
        return {
          type: 'choice', prompt: `Round <b>${n}</b> to the nearest ten.`,
          options: [answer, ...decoys].filter((v, i, a) => a.indexOf(v) === i).map(String).slice(0, 4),
          answer: String(answer),
          why: (v) => +v === n ? 'That is the number itself, not a ten.' : +v === (up ? ten : ten + 10) ? 'Check the ones digit against 5.' : 'Find the ten below and the ten above first.',
          hints: [`The tens around ${n} are ${ten} and ${ten + 10}.`, `The ones digit is ${n % 10}.`, n % 10 >= 5 ? '5 or more rounds up.' : 'Less than 5 rounds down.'],
          solution: `${n} → <b>${answer}</b>.`,
        };
      } },
    { name: 'Sign stories', icon: '📖', blurb: 'A story about painted signs.', rounds: 6, think: true,
      say: '📖 Think first: what is being rounded?',
      round(i) {
        const ten = 2 + (i % 7), n = ten * 10 + (i % 2 ? 7 : 3);
        const answer = n % 10 >= 5 ? ten * 10 + 10 : ten * 10;
        return {
          type: 'number',
          problem: {
            sentences: [`The road sign shows distances only in tens of kilometres.`, `The next town is ${n} kilometres away.`, 'The painter works at the roadside.', 'What distance should the sign show?'],
            question: 3, keys: ['tens'], extras: [2],
          },
          prompt: `What distance should the sign show?`, answer, suffix: ' km',
          why: (v) => v === n ? 'The sign shows tens only, so the number must change.' : 'Find the two tens around the number, then check the ones digit.',
          hints: [`${n} is between ${ten * 10} and ${ten * 10 + 10}.`, `The ones digit is ${n % 10}.`, n % 10 >= 5 ? 'Round up to the next ten.' : 'Round down to the ten below.'],
          solution: `${n} rounds to <b>${answer}</b> km.`,
        };
      } },
  ],

  ghubar: ['Every number rounds up — that is what rounding means.', 'Just drop the last digit, always.', 'Halfway means round down.'],
  praise: ['Nearest ten found!', 'Halfway checked!', 'Sign painted!', 'Rounded right!'],
  finale: 'Every sign painted in tens — you can round to the nearest ten! 🛣️',
};

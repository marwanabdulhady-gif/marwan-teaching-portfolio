/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 2 · Harbour Clock · telling time to five minutes (2.MD.C.7)
   Mechanic = the thinking: level 1 reads a clock drawn at a five-minute mark, level 2 matches a written time to
   one of two clocks (so the minute hand must be read, not guessed), level 3 is a departure story where the
   child must add minutes onto a clock time. The faces come from the shared `clock` scene, unchanged.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g2-five-minute-time', code: 'G02-MAT-09', title: 'Harbour Clock', emoji: '⛵',
  accent: '#2b6f8f', accentDeep: '#1f5670', skyA: '#f0f9fd', skyB: '#d6ecf7',
  topic: 'Time to five minutes', band: 'g35', lang: 'en',
  objective: 'I can <b>tell time to five minutes</b> and match a clock to the written time.',
  welcome: 'The boats leave Jeddah harbour on the minute. Read the clock for the captain. ⛵',
  learnBlurb: 'The long hand counts by fives. The short hand shows the hour.',
  how: {
    what: 'Each number on the clock is five minutes for the long hand. The short hand sits between hours.',
    steps: ['⛵ Read the short hand first — the hour.', '⛵ Count the long hand by fives.', '✅ Read it as hour : minutes.'],
  },

  learn: [
    { say: 'The long hand points at the <b>8</b>. What minutes is that? Each number is five minutes.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE2.clockAt(3, 40, 230) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: 'Count by fives: 1 → 5, 2 → 10 … 8 → <b>40</b>.' }));
      } },
    { say: 'Now read the whole clock: hour <b>3</b>, minutes <b>40</b>. That is <b>three forty</b>, or 3:40.',
      draw(el) { el.append(UI.h('div', { html: SCENE2.clockAt(3, 40, 230) })); el.append(UI.h('p', { class: 'prompt', style: 'font-size:20px', html: '3:40' })); } },
    { say: 'Your turn: what time does this clock show?',
      wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE2.clockAt(6, 30, 240) }));
        const row = UI.h('div', { class: 'opts', style: 'grid-template-columns:repeat(2,minmax(150px,1fr))' });
        ['6:30', '3:06', '7:30', '6:06'].forEach((t) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => t === '6:30' ? (e.target.classList.add('good'), L.ok('Yes — half past six. The long hand is on the 6, which is 30 minutes.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '3:06' ? 'You swapped the hands. The SHORT hand is the hour.' : 'The long hand on the 6 means thirty minutes.', 'bad')),
        })));
        el.append(row);
      } },
    { say: 'Ghubar reads <b>3:06</b> because the long hand is near the 6. What is the long hand counting?', wait: true,
      draw(el, L) {
        GHUBAR.pop('The hand is on the six. Six minutes past three!', 5000);
        const row = UI.h('div', { class: 'opts' });
        [['Minutes — the 6 means thirty minutes, not six.', true], ['Hours — so it is 6 o\'clock.', false], ['Nothing — the numbers are only decoration.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => ok ? (e.target.classList.add('good'), L.ok('Right — the long hand counts by fives, so the 6 is 30.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('Which hand is longer, and which one moves faster?', 'bad')),
        })));
        el.append(row);
      } },
  ],

  levels: [
    { name: 'Read the harbour clock', icon: '⛵', blurb: 'Five-minute marks.', rounds: 4, think: false,
      say: '⛵ What time is on the clock?',
      round() {
        const hour = UI.rint(1, 12), five = UI.rint(1, 11);
        const mins = five * 5;
        const key = `${hour}:${String(mins).padStart(2, '0')}`;
        const nextHour = (hour % 12) + 1;
        return {
          /* the caption never names the time: reading it off the face is the whole task */
          type: 'choice', prompt: G1.art(SCENE2.clockAt(hour, mins, 240), 'Read the short hand, then count the long hand by fives.'),
          options: [key, `${hour}:${String((mins + 55) % 60).padStart(2, '0')}`, `${nextHour}:${String(mins).padStart(2, '0')}`],
          answer: key,
          why: (v) => {
            const got = String(v);
            if (got.split(':')[0] === String(mins)) return 'You read the long hand as the hour. The short hand is the hour.';
            if (got.split(':')[0] === String(nextHour)) return 'The short hand has not reached that hour yet.';
            return 'Count the long hand by fives from the 12.';
          },
          hints: ['Read the short hand first.', 'Then count the long hand in fives.', `The long hand is on the ${five}.`],
          solution: `The long hand on the ${five} is <b>${mins}</b> minutes, so the time is ${hour}:${String(mins).padStart(2, '0')}.`,
        };
      } },
    { name: 'Two clocks', icon: '🕐', blurb: 'Pick the clock that matches.', rounds: 4, think: false,
      say: '🕐 Which clock shows this time?',
      round() {
        const hour = UI.rint(1, 12), five = UI.rint(1, 11);
        const mins = five * 5;
        const wrongHour = (hour % 12) + 1;
        const wrongFive = five === 11 ? 1 : five + 1;
        return {
          type: 'choice', prompt: `Which clock shows <b>${hour}:${String(mins).padStart(2, '0')}</b>?`,
          /* a picture option is the HTML string itself: the engine prints String(o) and compares with === */
          options: [
            `<div style="transform:scale(.94)">${SCENE2.clockAt(hour, mins, 210)}</div>`,
            `<div style="transform:scale(.94)">${SCENE2.clockAt(wrongHour, wrongFive * 5, 210)}</div>`,
          ],
          answer: `<div style="transform:scale(.94)">${SCENE2.clockAt(hour, mins, 210)}</div>`,
          why: () => 'Check both hands: the short one for the hour, the long one for minutes.',
          hints: [`The hour is ${hour} — where is the short hand?`, `The minutes are ${mins} — the long hand points at ${mins / 5}.`, 'Both hands must agree.'],
          solution: `Clock A shows the short hand on ${hour} and the long hand on ${mins / 5}, which is ${hour}:${String(mins).padStart(2, '0')}.`,
        };
      } },
    { name: 'Departure time', icon: '📖', blurb: 'Add minutes to a time.', rounds: 4, think: true,
      say: '📖 Think first: minutes, not hours.',
      round(i) {
        const hour = 1 + i, five = 2 + i, add = 10 + i * 5;
        const mins = five * 5;
        const total = mins + add;
        const endH = total >= 60 ? hour + 1 : hour, endM = total % 60;
        return {
          type: 'choice',
          problem: {
            sentences: [`The boat leaves at ${hour}:${String(mins).padStart(2, '0')}.`, 'The sea is calm today.', `The captain arrives ${add} minutes later.`, 'What time does the captain arrive?'],
            question: 3, keys: ['what time'], extras: [1],
          },
          prompt: `A boat leaves at ${hour}:${String(mins).padStart(2, '0')}. What time is ${add} minutes later?`,
          options: [`${endH}:${String(endM).padStart(2, '0')}`, `${hour}:${String((total + 10) % 60).padStart(2, '0')}`, `${hour + 1}:${String(mins).padStart(2, '0')}`].filter((v, i, a) => a.indexOf(v) === i),
          answer: `${endH}:${String(endM).padStart(2, '0')}`,
          why: (v) => v === `${hour + 1}:${String(mins).padStart(2, '0')}` ? 'Adding minutes does not always change the hour by one.' : 'Count on in fives from the minutes hand.',
          hints: [`Start at ${hour}:${String(mins).padStart(2, '0')}.`, `Count on ${add} minutes: ${add / 5} marks of five.`, total >= 60 ? 'The minutes pass 60 — that adds an hour.' : 'The hour stays the same here.'],
          solution: `${hour}:${String(mins).padStart(2, '0')} + ${add} minutes = <b>${endH}:${String(endM).padStart(2, '0')}</b>.`,
        };
      } },
  ],

  ghubar: ['The long hand is on the six, so it is six minutes.', 'Hours and minutes are the same thing.', 'Clocks are for boats, not for maths.'],
  praise: ['Every hand read!', 'Five minutes at a time!', 'Harbour time correct!', 'The captain is on time!'],
  finale: 'All boats away — you can tell time to five minutes! ⛵',
};

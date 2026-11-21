/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 5 · Caravan Rate · position, bearing and speed on the navigator's chart
   Source: the v3 approved bundle G05-U02-L08 (CCSS 5.G.A.1, 5.G.A.2 & 5.NF.B.5) — الملاحة وتحديد المواقع،
   والسِّمْت، وحساب السرعة. Paired with the unit-02 folder, whose roots are ح-د-ث (a bounded position),
   س-م-ت (azimuth) and س-ر-ع (speed = distance ÷ time).
   Mechanic = the thinking: a caravan reads its position as a pair on the chart, steers on a bearing
   measured clockwise from north, and plans its day by speed = distance ÷ time. Level 1 reads a bearing off
   the rose, level 2 finds the distance still to travel from a chart, level 3 computes a speed or a time.
   The rose shows the needle, never the number of degrees the child must read.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const GAME = {
  id: 'g5-caravan-rate', code: 'G05-U02-L08', title: 'Caravan Rate', emoji: '🧭',
  accent: '#8a5a1c', accentDeep: '#744a15', skyA: '#fdf8ef', skyB: '#f1e0c2',
  topic: 'Bearing, position and speed', band: 'g35', lang: 'en',
  objective: 'I can read a <b>bearing</b> clockwise from north, find a position on the chart, and use <b>speed = distance ÷ time</b>.',
  welcome: 'The caravan steers by the rose: north is 0°, a full turn is 360°. س-م-ت is the bearing. 🧭',
  learnBlurb: 'Bearings are measured clockwise from north, and north is 0°.',
  how: {
    what: 'A bearing starts at north (0°) and turns clockwise. East is 90°, south is 180°, west is 270°. Speed is the distance covered divided by the time taken.',
    steps: ['🧭 Start at north and turn clockwise.', '🧭 Read the degrees: 90 east, 180 south, 270 west.', '✅ Then speed = distance ÷ time.'],
  },

  learn: [
    { say: 'The rose starts at <b>north, 0°</b>, and turns clockwise. A quarter turn takes you to <b>east, 90°</b>.',
      draw(el) { el.append(UI.h('div', { html: SCENE5.bearingRose(90, { caption: 'east is a bearing of 090°' }) })); } },
    { say: 'Straight on past east is <b>south, 180°</b>, and the next quarter is <b>west, 270°</b>. Every bearing is an angle from north, never from the last direction.',
      draw(el) {
        el.append(UI.h('div', { html: SCENE5.bearingRose(225, { caption: 'south-west is 225° — measured from north, not from west' }) }));
        el.append(UI.h('p', { class: 'prompt', style: 'font-size:17px', html: 'N 0° · E 90° · S 180° · W 270°' }));
      } },
    { say: 'Your turn. The needle points straight down the page. What is the bearing?', wait: true,
      draw(el, L) {
        el.append(UI.h('div', { html: SCENE5.bearingRose(180, { max: 320 }) }));
        const row = UI.h('div', { class: 'opts' });
        [['180°', true], ['90°', false], ['0°', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Yes — straight down from north is half a turn: 180°.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say(t === '0°' ? 'Zero is north, at the top. The needle points down.' : 'Count clockwise from the top, not anticlockwise.', 'bad'))),
        }))); el.append(row);
      } },
    { say: 'Ghubar says a bearing of <b>045°</b> means 45° from the <b>nearest</b> direction. Is he right?', wait: true,
      draw(el, L) {
        GHUBAR.pop('Forty-five from wherever you are facing — east-ish. Close enough.', 5200);
        el.append(UI.h('div', { html: SCENE5.bearingRose(45, { caption: 'north-east is 45° from north' }) }));
        const row = UI.h('div', { class: 'opts' });
        [['No — every bearing is measured from north, clockwise.', true], ['He is right — from the nearest direction.', false], ['It depends on the wind.', false]].forEach(([t, ok]) => row.append(UI.h('button', {
          class: 'opt', text: t,
          onclick: (e) => (ok ? (e.target.classList.add('good'), L.ok('Right — one fixed starting line, north, and always clockwise.'))
            : (UI.shake(e.target), SFX.play('wrong'), COACH.say('If the start line moved, 45° could be any of four directions.', 'bad'))),
        }))); el.append(row);
      } },
  ],


  /* ── option hygiene ───────────────────────────────────────────────────────────────────────────────
     A round's `options` are built from the numbers the question drew, so a distractor can occasionally
     coincide with the answer (the swapped pair when x === y, a fixed fallback that lands on the right
     value). Two identical buttons would be a broken question, and the engine does not dedupe.
     This keeps the answer's own button untouched — the engine matches options by text, so rewriting it
     would make the right answer unselectable — and gives any duplicate a visibly different near-miss.
     Called as `GAME.fixOpts(this.roundRaw(i))`: the engine invokes `round` detached from the level
     object, so a `this._fix(...)` private call would lose its receiver. */
  fixOpts(q) {
    if (!q || !q.options || q.type === 'order' || q.type === 'bars') return q;
    const ans = String(q.answer);
    const seen = new Set();
    let keptAnswer = false;
    q.options = q.options.map((o) => {
      let s = String(o);
      if (s === ans && !keptAnswer) { keptAnswer = true; seen.add(s); return o; }
      if (!seen.has(s)) { seen.add(s); return o; }
      const frac = s.match(/^\d+\/\d+$/);
      const num = !frac && s.match(/-?\d+(?:\.\d+)?/);
      if (frac) {
        const [n, d] = s.split('/').map(Number);
        let k = 1, cand = `${n}/${d}`;
        while ((seen.has(cand) || cand === ans) && k < 40) { cand = `${n + k}/${d}`; k += 1; }
        s = cand;
      } else if (num) {
        const v = Number(num[0]);
        const alt = [v + 1, v - 1, v + 10, v + 2, v * 2 + 1].find((c) => {
          const cand = s.replace(num[0], String(c));
          return c >= 0 && !seen.has(cand) && cand !== ans;
        });
        if (alt != null) s = s.replace(num[0], String(alt));
      } else {
        s = s + ' ·';
      }
      while (seen.has(s) || s === ans) s = s + '·';
      seen.add(s);
      return s;
    });
    return q;
  },

  levels: [
    { name: 'Read the rose', icon: '🧭', blurb: 'Which bearing is drawn?', rounds: 6, think: false,
      say: '🧭 Clockwise from north.',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const b = [45, 90, 135, 180, 225, 270, 315][i % 7];
        const names = { 45: 'north-east', 90: 'east', 135: 'south-east', 180: 'south', 225: 'south-west', 270: 'west', 315: 'north-west' };
        const answer = `${b}°`;
        return {
          type: 'choice',
          prompt: G1.art(SCENE5.bearingRose(b, { max: 300 }), `${names[b]} — measured from north, clockwise`),
          options: [answer, `${(b + 90) % 360}°`, `${b === 180 ? 0 : 180}°`],
          answer,
          why: (v) => Number(v) === (b + 90) % 360 ? 'You measured anticlockwise, or started from the wrong line.' : 'Start at north, at the top, and count clockwise.',
          hints: ['North is at the top and is 0°.', 'East is a quarter turn: 90°.', `This direction is ${b}° from north.`],
          solution: `<b>${b}°</b>.`,
        };
      } },
    { name: 'Find the camp', icon: '📍', blurb: 'Read a position on the chart.', rounds: 6, think: false,
      say: '📍 Across then up, as on any chart.',
      round() { return GAME.fixOpts(this.roundRaw()); },
      roundRaw() {
        const x = UI.rint(1, 8), y = UI.rint(1, 8);
        return {
          type: 'choice',
          prompt: G1.art(SCENE5.coordinatePlane({ scale: 8, points: [[x, y, ""]], dot: "#8a5a1c", caption: 'the camp' }),
            'Which ordered pair names the camp?'),
          options: [`(${x}, ${y})`, `(${y}, ${x})`, `(${x + 1}, ${y})`],
          answer: `(${x}, ${y})`,
          why: (v) => v === `(${y}, ${x})` ? 'The first number is always the across distance.' : 'Count from the origin: right for x, then up for y.',
          hints: ['Find 0, 0 first — the corner.', `The camp is ${x} squares to the right.`, `Then ${y} squares up.`],
          solution: `The camp is at <b>(${x}, ${y})</b>.`,
        };
      } },
    { name: 'Days of travel', icon: '🐪', blurb: 'Speed = distance ÷ time.', rounds: 6, think: true,
      say: '🐪 Think first: do you know the distance and the time?',
      round(i) { return GAME.fixOpts(this.roundRaw(i)); },
      roundRaw(i) {
        const speed = UI.rint(3, 9);
        const hours = UI.rint(3, 8);
        const dist = speed * hours;
        const askSpeed = i % 2 === 0;
        return {
          type: 'choice',
          problem: {
            sentences: ['The caravan crosses the desert between two wells.',
              'The camels are watered at the second well.',
              `The distance between the wells is ${dist} kilometres.`,
              `The caravan takes ${hours} hours to cross.`,
              askSpeed ? 'What is the average speed in kilometres per hour?' : 'At that speed, how far does it travel in one hour?'],
            question: 4, keys: ['speed', 'kilometres', 'hours'], extras: [1],
          },
          prompt: askSpeed ? `<b>${dist} km</b> in <b>${hours} h</b> — what is the speed?` : `<b>${dist} km</b> in <b>${hours} h</b> — how far in one hour?`,
          options: [`${speed} km/h`, `${dist * hours} km/h`, `${speed + hours} km/h`],
          answer: `${speed} km/h`,
          why: (v) => Number(v) === dist * hours ? 'That multiplies the two. Speed divides distance by time.' : 'Speed is how far in one hour, so divide the distance by the hours.',
          hints: ['Speed = distance ÷ time.', `${dist} ÷ ${hours}.`, 'The answer is kilometres for every hour.'],
          solution: `${dist} ÷ ${hours} = <b>${speed} km/h</b>.`,
        };
      } },
  ],

  ghubar: ['A bearing is measured from wherever you last were.', 'Speed is distance times time.', 'Position is just a guess on a map.'],
  praise: ['Bearing read!', 'Camp located!', 'Speed worked out!', 'North is always 0°!'],
  finale: 'Bearing, position, speed — the caravan never loses its way. 🧭',
};

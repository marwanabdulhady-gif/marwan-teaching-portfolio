# 🎮 Fikr Lesson-Game Template · Grade 8 (age 13–14)

[← Grade 7](grade-07.md) · [All grades](README.md) · [Grade 9 →](grade-09.md)

> Copy this file for every new grade 8 lesson game. Fill the **🟨 boxes**, keep the structure, and use the code at the bottom as the starting point.
> Band: **6–8** · Kit: the Fikr lesson kit (`LK`, `DOOR`) — see *fikr-game-design-guide.md* for the full API.

---

## 1 · Who is playing — the Grade 8 profile

| | Grade 8 |
|---|---|
| **Reading load** | Full text, technical vocabulary |
| **Input** | Keyboard, graph plotting by click/drag, sliders, typed equations |
| **Rounds** | 6–8 per level; investigation mode |
| **Feedback** | Explanations, compare with a model answer |
| **Failure** | Retry with a cost; hints cost points |
| **Social** | Co-op investigations, tournaments |
| **Session** | 20 minutes |
| **Language** | English or Arabic |

```js
/* the band switch: put it at the top of your game file and use it (BAND.rounds in levels, BAND.tts for read-aloud, BAND.target for button size) */
const BAND = { rounds: 8, tts: false, timer: true,  target: 44 };          // 6–8
document.documentElement.style.setProperty('--target', BAND.target + 'px');
```

## 2 · What to teach — Grade 8 topics by subject

| Subject | Typical topics this year |
|---|---|
| **Maths** | Linear equations and systems, functions and slope, Pythagorean theorem, transformations, exponents and scientific notation, bivariate data |
| **English** | Rhetoric and persuasion, analysing literature, verb moods, argumentative essays |
| **Arabic** | النحو (الفاعل، المفعول به، الحال)، العروض المبسط، النصوص الأدبية |
| **Science** | Forces and motion, electricity and magnetism, genetics basics, waves and information |
| **CS** | Algorithms with functions, data science basics, networks |

> Pick **one** lesson objective per game. If it needs two skills, make two games.

## 3 · The one-page game brief 🟨

| Field | 🟨 Fill in | Example for Grade 8 |
|---|---|---|
| Lesson / standard | | 8 · Slope and linear functions |
| Observable action (what the student *does*) | | Read slope from a graph and write y = mx + b |
| Top 3 misconceptions | | 1) rise/run upside down  2) intercept read from x-axis  3) negative slope sign lost |
| Mechanic (= the thinking) | | Graph Pilot: steer a plane by choosing slope and intercept to land on the runway |
| CRA levels | | L1 move the line with sliders → L2 table of values → L3 the equation |
| Feedback “why” lines | | Show rise and run as arrows on the plane’s path |
| Local context | | Flights into King Abdulaziz Airport, Jeddah |
| Win condition | | 3 levels, mastery ≥ 70 % first-try |
| Data to record | | misconception categories: `run-over-rise`, `intercept-on-x`, `slope-sign` |

**The test:** *can a student win without doing the skill?* If yes, change the mechanic.

## 4 · The three levels (concrete → representational → abstract) 🟨

| Level | Name 🟨 | What the student does 🟨 | Engine / interaction 🟨 | Rounds |
|---|---|---|---|---|
| 1 · Concrete | | | | 8 |
| 2 · Representational | | | | |
| 3 · Abstract | | | | |

## 5 · Learn slides (the guided walk-through) 🟨

1. **Hook** — the story and the question (one picture).
2. **Model** — show the method once, step by step.
3. **Your turn** (`wait: true`) — the student does one step; `L.ok()` moves on.
4. **Watch out** — Ghubar’s mistake; the student spots it.

```js
const learn = [
  { say: '🟨 The story: …', draw(el) { el.append(LK.h('div', { html: '🟨 picture' })); } },
  { say: '🟨 Step 1 …', draw(el) { /* the model */ } },
  { say: '🟨 Your turn: …', wait: true, draw(el, L) { /* when right: L.ok('Yes! …') */ } },
  { say: 'Ghubar says … What went wrong?', wait: true, draw(el, L) { /* choose the mistake → L.ok() */ } }
];
```

## 6 · Feedback that teaches

**Hint ladder** (one per 💡 tap — strategy → step → near-solution):
1. Find where the line crosses the y-axis.
2. Count up/down (rise) then right (run).
3. m = rise ÷ run, then y = mx + b

**Ghubar** (the friendly mischief-maker) shows the misconceptions:
  - “Slope is run over rise — planes fly sideways!”
  - “Where it crosses x — that’s b.”
  - “Down or up, slopes are positive.”

**Why-lines:** every wrong answer you can predict gets its own sentence in `why(v)`. Generic “try again” only as the last fallback.

## 7 · The code

**Custom game** (`LK.start`) — at this age the thinking needs its own interaction (typed expressions, sliders, graphs, constructions), so each level writes a `round(R)`.

### Worked example — Graph Pilot (slope)

```js
function graphSvg(m, b, target) { /* an SVG grid with the line y = m x + b and the runway point */
  const S = 24, X = x => 160 + x * S, Y = y => 160 - y * S;
  return LK.svg(320, 320, `<path d="M0 160H320M160 0V320" stroke="#999"/><line x1="${X(-7)}" y1="${Y(m * -7 + b)}" x2="${X(7)}" y2="${Y(m * 7 + b)}" stroke="#0e8a8f" stroke-width="3"/><circle cx="${X(target[0])}" cy="${Y(target[1])}" r="7" fill="#e0302f"/>`, { class: 'lk-svg' });
}
LK.start({
  id: 'graph-pilot', title: 'Graph Pilot', emoji: '✈️', topic: 'Slope and linear functions',
  how: { what: 'Choose the slope and intercept so the plane lands on the runway.', steps: ['Read the intercept b', 'Find rise ÷ run', 'Write y = mx + b'] },
  learn, levels: [
    { name: 'Read the slope', icon: '📐', rounds: 7,
      round(R) {
        const m = LK.pick([-3, -2, -1, 1, 2, 3, 0.5, -0.5]), b = LK.rint(-3, 3);
        R.el.append(graphSvg(m, b, [2, 2 * m + b]));
        R.hints = ['Pick two points on the line.', 'Slope = rise ÷ run (up is +, right is +).'];
        R.solve = () => R.say(`Slope <b>${m}</b>`);
        const opts = LK.shuffle([m, -m, 1 / m, m + 1].filter((v, i, a) => a.indexOf(v) === i));
        opts.forEach(o => { const btn = LK.h('button', { class: 'lk-btn', text: String(o), onclick: () => o === m ? R.right() : R.wrong(o === -m ? 'Check the direction: is it going up or down?' : o === 1 / m ? 'You did run ÷ rise. Slope is rise ÷ run.' : 'Count the rise and run again.', { at: btn }) }); R.el.append(btn); });
      } },
    { name: 'Write the line', icon: '✍️', rounds: 7, round(R) { /* type y = mx + b for the graph; parse and compare */ } },
    { name: 'Land the plane', icon: '🛬', rounds: 5, round(R) { /* sliders for m and b; land on two runway points */ } }
  ],
  praise: ['Smooth landing!', 'On the glide path!'], finale: 'Captain of Graph Air ✈️'
});
```

### Your game 🟨

```js
DOOR.start({                                   // or LK.start({ … levels: [{ round(R) { … } }] })
  id: 'door-🟨', code: '🟨', title: '🟨', emoji: '🟨', verb: '🟨',
  how: { what: '🟨 one-line goal', steps: ['🟨', '🟨', '🟨'] },
  welcome: '🟨', learn,
  levels: [
    { name: '🟨 Concrete', icon: '🟨', rounds: BAND.rounds, verb: '🟨', make(i) { return { /* question */ }; } },
    { name: '🟨 Picture', icon: '🟨', rounds: BAND.rounds, verb: '🟨', make(i) { return {}; } },
    { name: '🟨 Abstract', icon: '🟨', rounds: BAND.rounds, verb: '🟨', make(i) { return {}; } }
  ],
  praise: ['🟨', '🟨'], finale: '🟨'
});
```

**Question shapes** (door engines): choice `{prompt, options, answer, why}` · tiles `{prompt, tiles:[{label, ok}]}` · bins `{prompt, bins, items}` · venn · pairs `{pairs:[[l, r]]}` · order `{items}` · cloze `{parts}` · model `{prompt, draw(el), answer}`.

## 8 · Accessibility checklist (Grade 8)

- [ ] Targets ≥ **44 px**; a keyboard path for every action.
- [ ] Read-aloud button available; glossary for technical words.
- [ ] Never colour alone — ✓ ✗ icons and words.
- [ ] Arabic tested right-to-left; `<bdi>` around mixed text and numbers.
- [ ] `prefers-reduced-motion` turns off bursts and shakes.
- [ ] Works offline on a 5-year-old iPad.

## 9 · Data, test and ship

**Record:** ready → progress each round → mistakes by category (`run-over-rise`, `intercept-on-x`, `slope-sign`) → level stars → done (mastery ≥ 70 %).

```js
// tests/e2e/<id>.spec.mjs — every game can be played to the end by the kit's test hooks
test('<id> plays to the end', async ({ page }) => {
  await page.goto('/playhub/lessons/<id>.html');
  await page.evaluate(() => LK.test.level(0));
  for (let i = 0; i < 20; i++) await page.evaluate(() => LK.test.pass());
  await expect.poll(() => page.evaluate(() => LK.test.state.done)).toBeGreaterThan(0);
});
```

**Ship:** file in `playhub/lessons/doors/` or `games/` → entry in `catalog.mjs` → `node playhub/tools/build-lessons.mjs` → `node scripts/sync-playhub.mjs` → test → PR.

## 10 · Quality bar (score 1–3 each, aim for 15+) 🟨

| | 1 | 3 | 🟨 |
|---|---|---|---|
| Mechanic = thinking | a quiz in a costume | you cannot win without the skill | |
| Feedback | right / wrong | explains the misconception + hint ladder | |
| Progression | random | concrete → picture → abstract | |
| Identity | generic | Saudi context, the student’s language, Fikr world | |
| Data | none | misconceptions + mastery reach the teacher | |
| Access | mouse only | touch, keyboard, read-aloud, RTL, offline | |

**More Grade 8 game ideas:** Pythagoras Ladder (fire brigade in Riyadh) · Scientific Notation Space Scale · Circuit Stadium (series/parallel) · Punnett Palm (inheritance)

[← Grade 7](grade-07.md) · [All grades](README.md) · [Grade 9 →](grade-09.md)

# 🎮 Fikr Lesson-Game Template · Grade 12 (age 17–18)

[← Grade 11](grade-11.md) · [All grades](README.md)

> Copy this file for every new grade 12 lesson game. Fill the **🟨 boxes**, keep the structure, and use the code at the bottom as the starting point.
> Band: **9–12** · Kit: the Fikr lesson kit (`LK`, `DOOR`) — see *fikr-game-design-guide.md* for the full API.

---

## 1 · Who is playing — the Grade 12 profile

| | Grade 12 |
|---|---|
| **Reading load** | University-style text, research data |
| **Input** | Typed expressions, code, simulations, data analysis |
| **Rounds** | Projects, modelling challenges, exam-style practice |
| **Feedback** | Rubric + exemplars; self- and peer-assessment |
| **Failure** | Iterate; mistakes analysed as data |
| **Social** | Capstone projects, presentations, mentoring younger grades |
| **Session** | 30–45 minutes or multi-day projects |
| **Language** | English or Arabic; exam register |

```js
/* the band switch: put it at the top of your game file and use it (BAND.rounds in levels, BAND.tts for read-aloud, BAND.target for button size) */
const BAND = { rounds: 8, tts: false, timer: true,  target: 44 };          // 9–12
document.documentElement.style.setProperty('--target', BAND.target + 'px');
```

## 2 · What to teach — Grade 12 topics by subject

| Subject | Typical topics this year |
|---|---|
| **Maths** | Calculus: limits, derivatives, rates of change, optimisation, integrals; statistics: distributions, hypothesis tests |
| **English** | Extended essays, critical theory lenses, academic presentations |
| **Arabic** | النصوص الأدبية الحديثة، النقد، البحث العلمي |
| **Science** | Physics: fields, waves, modern physics; Chemistry: organic, electrochemistry; Biology: molecular biology |
| **CS** | AI and machine learning concepts, ethics, software projects |

> Pick **one** lesson objective per game. If it needs two skills, make two games.

## 3 · The one-page game brief 🟨

| Field | 🟨 Fill in | Example for Grade 12 |
|---|---|---|
| Lesson / standard | | 12 · The derivative as a rate of change |
| Observable action (what the student *does*) | | Estimate and compute instantaneous rate of change from position–time data |
| Top 3 misconceptions | | 1) average rate used as instantaneous  2) units dropped  3) derivative rules misapplied (power rule on constants) |
| Mechanic (= the thinking) | | Haramain high-speed train: find its speed at an instant from position data, shrinking the interval |
| CRA levels | | L1 secant slopes shrinking on a graph → L2 limit table → L3 differentiation rules |
| Feedback “why” lines | | Animate the secant line turning into the tangent |
| Local context | | The Haramain train between Makkah and Madinah |
| Win condition | | 3 levels, mastery ≥ 70 % first-try |
| Data to record | | misconception categories: `average-for-instant`, `units-dropped`, `power-rule` |

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
1. Speed = rate of change of position.
2. Find s′(t) with the power rule.
3. Substitute the instant, then add units.

**Ghubar** (the friendly mischief-maker) shows the misconceptions:
  - “Average, instant — the train doesn’t care.”
  - “Units are for physics people.”
  - “d/dx of 5 is 5. It stays the same!”

**Why-lines:** every wrong answer you can predict gets its own sentence in `why(v)`. Generic “try again” only as the last fallback.

## 7 · The code

**Custom game** (`LK.start`) — at this age the thinking needs its own interaction (typed expressions, sliders, graphs, constructions), so each level writes a `round(R)`.

### Worked example — Haramain Rates (derivatives)

```js
LK.start({
  id: 'haramain-rates', title: 'The Haramain Express', emoji: '🚄', topic: 'Derivative as a rate of change',
  how: { what: 'Shrink the time interval: the average speed becomes the speed at an instant.', steps: ['Average rate = Δs ÷ Δt', 'Shrink Δt → the limit', 'Use the rules: d/dt(tⁿ) = n·tⁿ⁻¹'] },
  learn, levels: [
    { name: 'Secant to tangent', icon: '📉', rounds: 8, round(R) { /* slider shrinks h; read the slope approaching the limit */ } },
    { name: 'Speed at an instant', icon: '🚄', rounds: 8,
      round(R) {
        const c = LK.pick([2, 3, 4, 5]), t0 = LK.rint(2, 6), v = 2 * c * t0;          // s(t) = c·t²
        R.el.append(LK.h('p', { html: `Position s(t) = ${c}t² km (t in minutes). What is the speed at t = ${t0} min? (km/min)` }));
        const pad = LK.keypad(R.el, { max: 3, decimal: true, onEnter: x => { pad.clear();
          if (x === v) R.right();
          else R.wrong(x === c * t0 * t0 / t0 ? 'That is the AVERAGE speed from 0 — we need it at the instant.' : x === c * t0 ? 'Power rule: bring the 2 down — 2·c·t.' : 'Differentiate s(t), then substitute t.', { at: pad.display }); } });
        R.hints = ['s′(t) is the speed.', `s′(t) = 2·${c}·t`, `Substitute t = ${t0}`];
        R.solve = () => R.say(`s′(${t0}) = 2·${c}·${t0} = <b>${v} km/min</b>`);
      } },
    { name: 'Optimise the journey', icon: '⛽', rounds: 6, round(R) { /* minimise energy: set the derivative to zero */ } }
  ],
  praise: ['Instant speed!', 'Calculus on rails!'], finale: 'Chief engineer of the Haramain Express 🚄'
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

## 8 · Accessibility checklist (Grade 12)

- [ ] Targets ≥ **44 px**; a keyboard path for every action.
- [ ] Read-aloud button available; glossary for technical words.
- [ ] Never colour alone — ✓ ✗ icons and words.
- [ ] Arabic tested right-to-left; `<bdi>` around mixed text and numbers.
- [ ] `prefers-reduced-motion` turns off bursts and shakes.
- [ ] Works offline on a 5-year-old iPad.

## 9 · Data, test and ship

**Record:** ready → progress each round → mistakes by category (`average-for-instant`, `units-dropped`, `power-rule`) → level stars → done (mastery ≥ 70 %).

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

**More Grade 12 game ideas:** Optimisation Date Box (max volume) · Hypothesis Test Clinic · Organic Reaction Map · Teach the Machine (train a classifier, discuss bias)

[← Grade 11](grade-11.md) · [All grades](README.md)

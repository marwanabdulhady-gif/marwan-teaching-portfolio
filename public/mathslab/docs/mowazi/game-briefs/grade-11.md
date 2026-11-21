# 🎮 Fikr Lesson-Game Template · Grade 11 (age 16–17)

[← Grade 10](grade-10.md) · [All grades](README.md) · [Grade 12 →](grade-12.md)

> Copy this file for every new grade 11 lesson game. Fill the **🟨 boxes**, keep the structure, and use the code at the bottom as the starting point.
> Band: **9–12** · Kit: the Fikr lesson kit (`LK`, `DOOR`) — see *fikr-game-design-guide.md* for the full API.

---

## 1 · Who is playing — the Grade 11 profile

| | Grade 11 |
|---|---|
| **Reading load** | Academic text, data tables and graphs |
| **Input** | Typed expressions, data entry, simulations, code notebooks |
| **Rounds** | Investigations and modelling tasks |
| **Feedback** | Rubric-based; justification; peer critique |
| **Failure** | Iterate and refine models |
| **Social** | Group projects, presentations, debate |
| **Session** | 30 minutes or a project over days |
| **Language** | English or Arabic; discipline vocabulary |

```js
/* the band switch: put it at the top of your game file and use it (BAND.rounds in levels, BAND.tts for read-aloud, BAND.target for button size) */
const BAND = { rounds: 8, tts: false, timer: true,  target: 44 };          // 9–12
document.documentElement.style.setProperty('--target', BAND.target + 'px');
```

## 2 · What to teach — Grade 11 topics by subject

| Subject | Typical topics this year |
|---|---|
| **Maths** | Algebra II / Precalculus: exponential and logarithmic functions, sequences and series, trig functions, polynomial and rational functions, statistics and inference |
| **English** | Synthesis of sources, rhetorical analysis, research papers, literature across periods |
| **Arabic** | الأدب العربي عبر العصور، البلاغة، الكتابة البحثية |
| **Science** | Physics: kinematics, momentum, circuits; Chemistry: equilibrium, acids and bases; Biology: physiology |
| **CS** | Algorithms and data structures, databases, AI basics |

> Pick **one** lesson objective per game. If it needs two skills, make two games.

## 3 · The one-page game brief 🟨

| Field | 🟨 Fill in | Example for Grade 11 |
|---|---|---|
| Lesson / standard | | 11 · Exponential growth and logarithms |
| Observable action (what the student *does*) | | Model growth with y = a·bˣ and solve for time with logs |
| Top 3 misconceptions | | 1) treats growth as linear  2) uses 1.05 vs 0.05 wrongly  3) log rules misapplied |
| Mechanic (= the thinking) | | Grow a solar farm at NEOM: predict output each year and when it reaches a target |
| CRA levels | | L1 table of yearly values → L2 graph and fitted curve → L3 solve with logarithms |
| Feedback “why” lines | | Overlay the linear guess on the true curve |
| Local context | | NEOM solar capacity and Riyadh’s population |
| Win condition | | 3 levels, mastery ≥ 70 % first-try |
| Data to record | | misconception categories: `linear-for-exponential`, `rate-not-factor`, `log-rule` |

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
1. Does it add the same or multiply by the same?
2. b = 1 + rate
3. Take logs of both sides.

**Ghubar** (the friendly mischief-maker) shows the misconceptions:
  - “5% a year? Add 5 each year. Same thing.”
  - “The growth factor is 0.05. Small but mighty!”
  - “log(a + b) = log a + log b. Clearly.”

**Why-lines:** every wrong answer you can predict gets its own sentence in `why(v)`. Generic “try again” only as the last fallback.

## 7 · The code

**Custom game** (`LK.start`) — at this age the thinking needs its own interaction (typed expressions, sliders, graphs, constructions), so each level writes a `round(R)`.

### Worked example — NEOM Growth (exponentials)

```js
LK.start({
  id: 'neom-growth', title: 'The NEOM Solar Farm', emoji: '☀️', topic: 'Exponential growth and logarithms',
  how: { what: 'Growth by a percent each year multiplies, it does not add.', steps: ['Find a (start) and b (1 + rate)', 'y = a · bˣ', 'Solve bˣ = target ÷ a with logs'] },
  learn, levels: [
    { name: 'Add or multiply?', icon: '📈', rounds: 8, round(R) { /* sort tables: linear vs exponential */ } },
    { name: 'Write the model', icon: '✍️', rounds: 8,
      round(R) {
        const a = LK.pick([200, 500, 800]), r = LK.pick([5, 8, 10, 12]), b = 1 + r / 100;
        R.el.append(LK.h('p', { html: `The farm makes ${a} MW and grows ${r}% a year. Which model?` }));
        const right = `y = ${a}·${b}^x`, wrong = [`y = ${a} + ${r}x`, `y = ${a}·${r / 100}^x`, `y = ${a}·${r}^x`];
        LK.shuffle([right, ...wrong]).forEach(o => { const btn = LK.h('button', { class: 'lk-btn', text: o, onclick: () => o === right ? R.right() : R.wrong(o.includes('+') ? 'Percent growth multiplies — it is not linear.' : o.includes('0.') ? 'Growth factor is 1 + rate, not the rate.' : 'Use 1 + r/100.', { at: btn }) }); R.el.append(btn); });
        R.hints = ['Each year: × (1 + rate)', `b = 1 + ${r}/100`];
      } },
    { name: 'When will it reach…?', icon: '⏱️', rounds: 6, round(R) { /* x = log(target/a) / log(b), answer to 0.1 year */ } }
  ],
  praise: ['Model fits!', 'Sunny growth!'], finale: 'Chief modeller of NEOM ☀️'
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

## 8 · Accessibility checklist (Grade 11)

- [ ] Targets ≥ **44 px**; a keyboard path for every action.
- [ ] Read-aloud button available; glossary for technical words.
- [ ] Never colour alone — ✓ ✗ icons and words.
- [ ] Arabic tested right-to-left; `<bdi>` around mixed text and numbers.
- [ ] `prefers-reduced-motion` turns off bursts and shakes.
- [ ] Works offline on a 5-year-old iPad.

## 9 · Data, test and ship

**Record:** ready → progress each round → mistakes by category (`linear-for-exponential`, `rate-not-factor`, `log-rule`) → level stars → done (mastery ≥ 70 %).

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

**More Grade 11 game ideas:** Momentum Collider (Haramain train) · Equilibrium Seesaw (Le Chatelier) · Sequence Staircase · SQL Souq (query a shop database)

[← Grade 10](grade-10.md) · [All grades](README.md) · [Grade 12 →](grade-12.md)

# 🎮 Fikr Lesson-Game Template · Grade 6 (age 11–12)

[← Grade 5](grade-05.md) · [All grades](README.md) · [Grade 7 →](grade-07.md)

> Copy this file for every new grade 6 lesson game. Fill the **🟨 boxes**, keep the structure, and use the code at the bottom as the starting point.
> Band: **6–8** · Kit: the Fikr lesson kit (`LK`, `DOOR`) — see *fikr-game-design-guide.md* for the full API.

---

## 1 · Who is playing — the Grade 6 profile

| | Grade 6 |
|---|---|
| **Reading load** | Full text; academic vocabulary with glossary pop-ups |
| **Input** | Keyboard, sliders, drag, typed answers (numbers, short words) |
| **Rounds** | 6–8 per level or an open sandbox |
| **Feedback** | Immediate for practice; delayed self-check for challenges |
| **Failure** | Retry with a cost (lose a heart / time) |
| **Social** | Tournaments, co-op puzzles, leaderboards (opt-in) |
| **Session** | 15–20 minutes |
| **Language** | English or Arabic; formal register |

```js
/* the band switch: put it at the top of your game file and use it (BAND.rounds in levels, BAND.tts for read-aloud, BAND.target for button size) */
const BAND = { rounds: 8, tts: false, timer: true,  target: 44 };          // 6–8
document.documentElement.style.setProperty('--target', BAND.target + 'px');
```

## 2 · What to teach — Grade 6 topics by subject

| Subject | Typical topics this year |
|---|---|
| **Maths** | Ratios and rates, percents, dividing fractions, negative numbers, expressions and one-step equations, area of polygons, statistics (mean, median, MAD) |
| **English** | Argument and evidence, theme development, pronoun agreement, research writing |
| **Arabic** | الإعراب (المرفوعات والمنصوبات)، البلاغة المبسطة، كتابة المقال |
| **Science** | Cells and organisation, the particle model, Earth–Sun–Moon, weather systems |
| **CS** | Algorithms and flowcharts, conditionals and loops in Python/blocks, data representation |

> Pick **one** lesson objective per game. If it needs two skills, make two games.

## 3 · The one-page game brief 🟨

| Field | 🟨 Fill in | Example for Grade 6 |
|---|---|---|
| Lesson / standard | | 6 · Ratios and equivalent ratios |
| Observable action (what the student *does*) | | Scale a recipe ratio up and down and compare two ratios |
| Top 3 misconceptions | | 1) adds the same number to both parts  2) compares the first terms only  3) reverses the order |
| Mechanic (= the thinking) | | Juice bar: keep the taste the same as orders grow (ratio table + taste meter) |
| CRA levels | | L1 mix with cups → L2 ratio table / double number line → L3 unit rate |
| Feedback “why” lines | | Show the taste meter turning sour when the ratio breaks |
| Local context | | A juice bar on Tahlia Street (mango : orange) |
| Win condition | | 3 levels, mastery ≥ 70 % first-try |
| Data to record | | misconception categories: `additive-ratio`, `order-reversed`, `first-terms-only` |

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
1. What did the mango multiply by?
2. Do the same to the orange.
3. Check: the ratio table rows must match.

**Ghubar** (the friendly mischief-maker) shows the misconceptions:
  - “2:3 doubles to 4:5 — just add 2!”
  - “Orange : mango, mango : orange — same juice.”
  - “Bigger first number = stronger taste. Always.”

**Why-lines:** every wrong answer you can predict gets its own sentence in `why(v)`. Generic “try again” only as the last fallback.

## 7 · The code

**Custom game** (`LK.start`) — at this age the thinking needs its own interaction (typed expressions, sliders, graphs, constructions), so each level writes a `round(R)`.

### Worked example — Juice Bar Ratios

```js
LK.start({
  id: 'juice-ratios', title: 'The Tahlia Juice Bar', emoji: '🥭', topic: 'Ratios and rates',
  how: { what: 'Keep the taste the same: multiply both parts by the same number.', steps: ['Read the recipe ratio', 'Find the scale factor', 'Multiply both parts'] },
  learn, levels: [
    { name: 'Scale the recipe', icon: '📈', blurb: 'ratio tables', rounds: 7,
      round(R) {
        const a = LK.rint(2, 5), b = LK.rint(2, 7), k = LK.rint(2, 6);
        R.el.append(LK.h('div', { class: 'lk-display', html: `Mango : Orange = ${a} : ${b}<br>${a * k} cups of mango → ? cups of orange` }));
        R.hints = [`${a} × ? = ${a * k}`, `Scale factor ${k}: ${b} × ${k}`];
        R.solve = () => R.say(`${b} × ${k} = <b>${b * k}</b>`);
        const pad = LK.keypad(R.el, { max: 3, onEnter: v => { pad.clear();
          if (v === b * k) R.right();
          else R.wrong(v === b + (a * k - a) ? 'You ADDED the same amount — ratios multiply.' : v === a * k ? 'That is the mango. Keep the order mango : orange.' : 'Multiply both parts by the same factor.', { at: pad.display }); } });
      } },
    { name: 'Better deal?', icon: '🏷️', blurb: 'unit rates', rounds: 6, round(R) { /* SAR 12 for 4 vs SAR 20 for 5 — compare price per cup */ } },
    { name: 'Taste test', icon: '😋', blurb: 'equivalent or not', rounds: 6, round(R) { /* 3:5 vs 6:10 vs 6:8 — tap the matching tastes */ } }
  ],
  praise: ['Same great taste!', 'Ratio pro!'], finale: 'Head mixer of the Tahlia Juice Bar! 🥭'
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

## 8 · Accessibility checklist (Grade 6)

- [ ] Targets ≥ **44 px**; a keyboard path for every action.
- [ ] Read-aloud button available; glossary for technical words.
- [ ] Never colour alone — ✓ ✗ icons and words.
- [ ] Arabic tested right-to-left; `<bdi>` around mixed text and numbers.
- [ ] `prefers-reduced-motion` turns off bursts and shakes.
- [ ] Works offline on a 5-year-old iPad.

## 9 · Data, test and ship

**Record:** ready → progress each round → mistakes by category (`additive-ratio`, `order-reversed`, `first-terms-only`) → level stars → done (mastery ≥ 70 %).

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

**More Grade 6 game ideas:** Percent Sale at the Souq · Integer Elevator (Burj Jeddah floors below ground) · Cell City (organelles as a city) · Flowchart Maze

[← Grade 5](grade-05.md) · [All grades](README.md) · [Grade 7 →](grade-07.md)

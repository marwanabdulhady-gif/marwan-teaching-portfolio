# 🎮 Fikr Lesson-Game Template · Grade 4 (age 9–10)

[← Grade 3](grade-03.md) · [All grades](README.md) · [Grade 5 →](grade-05.md)

> Copy this file for every new grade 4 lesson game. Fill the **🟨 boxes**, keep the structure, and use the code at the bottom as the starting point.
> Band: **3–5** · Kit: the Fikr lesson kit (`LK`, `DOOR`) — see *fikr-game-design-guide.md* for the full API.

---

## 1 · Who is playing — the Grade 4 profile

| | Grade 4 |
|---|---|
| **Reading load** | Paragraph word problems; read-aloud on request |
| **Input** | Tap, drag, keypad to 6 digits |
| **Rounds** | 5–6 per level, 45–90 s |
| **Feedback** | Instant + why; CUBES think-first on word problems |
| **Failure** | “Show me” after 2 misses; missed rounds come back |
| **Social** | Duels, Blitz, class tournaments |
| **Session** | 12–15 minutes |
| **Language** | English or Arabic; SAR money contexts |

```js
/* the band switch: put it at the top of your game file and use it (BAND.rounds in levels, BAND.tts for read-aloud, BAND.target for button size) */
const BAND = { rounds: 6, tts: true,  timer: false, target: 56 };          // 3–5
document.documentElement.style.setProperty('--target', BAND.target + 'px');
```

## 2 · What to teach — Grade 4 topics by subject

| Subject | Typical topics this year |
|---|---|
| **Maths** | Multi-digit multiplication and long division, multi-step problems with bar diagrams, equivalent fractions, add/subtract fractions, decimals to hundredths, angles |
| **English** | Main idea and details, figurative language, compound sentences, paragraph writing |
| **Arabic** | الجملة الاسمية والفعلية، المبتدأ والخبر، الإملاء (الهمزة) |
| **Science** | Energy transfer, waves, Earth’s features and rocks, structures of plants and animals |
| **CS** | Variables, conditionals, binary basics |

> Pick **one** lesson objective per game. If it needs two skills, make two games.

## 3 · The one-page game brief 🟨

| Field | 🟨 Fill in | Example for Grade 4 |
|---|---|---|
| Lesson / standard | | 4 · Model multi-step problems (hidden question) |
| Observable action (what the student *does*) | | Find the hidden question, draw bars, answer the original question |
| Top 3 misconceptions | | 1) answers the first number seen  2) forgets one group’s “each”  3) adds when the question says fewer |
| Mechanic (= the thinking) | | CUBES → hidden question → bars → answer (one equation) |
| CRA levels | | L1 pick the hidden question → L2 bars with letters → L3 one equation |
| Feedback “why” lines | | Name the missing hidden question in the why |
| Local context | | The Jeddah Aquarium trip (8 buses × 24, 6 vans × 15) |
| Win condition | | 3 levels, mastery ≥ 70 % first-try |
| Data to record | | misconception categories: `skipped-hidden-q`, `forgot-each`, `wrong-operation` |

**The test:** *can a student win without doing the skill?* If yes, change the mechanic.

## 4 · The three levels (concrete → representational → abstract) 🟨

| Level | Name 🟨 | What the student does 🟨 | Engine / interaction 🟨 | Rounds |
|---|---|---|---|---|
| 1 · Concrete | | | | 6 |
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
1. What do you need to know first?
2. Draw a bar for each hidden question.
3. Use those answers for the question asked.

**Ghubar** (the friendly mischief-maker) shows the misconceptions:
  - “8 buses minus 6 vans — 2. Done!”
  - “Hidden question? I answer the first number I see!”
  - “Brackets are decoration.”

**Why-lines:** every wrong answer you can predict gets its own sentence in `why(v)`. Generic “try again” only as the last fallback.

## 7 · The code

**Door game** (`DOOR.start`) — the engines (balloon, speedtap, sorting, matching, cloze, diagram, quiz…) play your questions; you only write `make()`.

### Worked example — The Hidden Question Trip (multi-step)

```js
/* the full game is playhub/lessons/doors/door-6-3.js — the shape of one story: */
const story = { kind: 'compare', answer: 102, letter: 'S',
  text: '8 buses carry 24 fourth graders each and 6 vans carry 15 third graders each. How many fewer third graders go?',
  hidden: [{ q: 'How many fourth graders?', n: 8, v: 24, L: 'F', t: 192 }, { q: 'How many third graders?', n: 6, v: 15, L: 'T', t: 90 }],
  fake: ['How many buses and vans?', 'How many fit in one bus?', 'Which is bigger?'],
  eq: 'S = (8 × 24) − (6 × 15)', wrongEq: ['S = (8 × 24) − 6', 'S = (8 + 6) × 24', 'S = (8 × 24) + (6 × 15)'],
  why: v => v === 282 ? 'You added — the question asks how many FEWER.' : v === 186 ? 'Each van holds 15.' : '192 − 90.' };
DOOR.start({
  id: 'door-6-3', code: '6-3', title: 'The Hidden Question Trip', emoji: '🚌', verb: 'diagram', learn,
  levels: [
    { name: 'Step 2 · Hidden question', rounds: 4, verb: 'quiz', make: () => DOOR.choice(story.text, story.hidden[0].q, story.fake, { say: 'What must you find first?' }) },
    { name: 'Step 3 · Bars', rounds: 5, verb: 'diagram', make: () => ({ prompt: story.text, answer: story.answer, draw: el => el.append(bars(story)), why: story.why }) },
    { name: 'Step 4 · One equation', rounds: 5, verb: 'quiz', think: false, make: () => DOOR.choice(story.text, story.eq, story.wrongEq) }
  ]
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

## 8 · Accessibility checklist (Grade 4)

- [ ] Targets ≥ **56 px**; a keyboard path for every action.
- [ ] Read-aloud on every prompt (TTS on by default).
- [ ] Never colour alone — ✓ ✗ icons and words.
- [ ] Arabic tested right-to-left; `<bdi>` around mixed text and numbers.
- [ ] `prefers-reduced-motion` turns off bursts and shakes.
- [ ] Works offline on a 5-year-old iPad.

## 9 · Data, test and ship

**Record:** ready → progress each round → mistakes by category (`skipped-hidden-q`, `forgot-each`, `wrong-operation`) → level stars → done (mastery ≥ 70 %).

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

**More Grade 4 game ideas:** Fraction Bakery (equivalent fractions) · Protractor Golf (measure angles) · Rock Detective (sort igneous/sedimentary/metamorphic) · Binary Lanterns

[← Grade 3](grade-03.md) · [All grades](README.md) · [Grade 5 →](grade-05.md)

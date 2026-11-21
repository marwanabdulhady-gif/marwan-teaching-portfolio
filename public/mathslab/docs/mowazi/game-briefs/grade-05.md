# 🎮 Fikr Lesson-Game Template · Grade 5 (age 10–11)

[← Grade 4](grade-04.md) · [All grades](README.md) · [Grade 6 →](grade-06.md)

> Copy this file for every new grade 5 lesson game. Fill the **🟨 boxes**, keep the structure, and use the code at the bottom as the starting point.
> Band: **3–5** · Kit: the Fikr lesson kit (`LK`, `DOOR`) — see *fikr-game-design-guide.md* for the full API.

---

## 1 · Who is playing — the Grade 5 profile

| | Grade 5 |
|---|---|
| **Reading load** | Full word problems; vocabulary support |
| **Input** | Keypad with decimals and fractions, drag, short typing |
| **Rounds** | 6 per level, 60–90 s |
| **Feedback** | Instant + why + worked solution |
| **Failure** | Retry, “Show me” after 2; stars by first try |
| **Social** | Tournaments, co-op challenges |
| **Session** | 15 minutes |
| **Language** | English or Arabic |

```js
/* the band switch: put it at the top of your game file and use it (BAND.rounds in levels, BAND.tts for read-aloud, BAND.target for button size) */
const BAND = { rounds: 6, tts: true,  timer: false, target: 56 };          // 3–5
document.documentElement.style.setProperty('--target', BAND.target + 'px');
```

## 2 · What to teach — Grade 5 topics by subject

| Subject | Typical topics this year |
|---|---|
| **Maths** | Add/subtract fractions with unlike denominators, multiply fractions, decimals to thousandths, volume, coordinate plane, order of operations |
| **English** | Theme, point of view, conjunctions and complex sentences, research notes |
| **Arabic** | الأفعال الخمسة، النعت، الإعراب البسيط، كتابة الفقرة |
| **Science** | Matter and particles, ecosystems and food webs, Earth’s systems, stars and the Sun |
| **CS** | Functions and procedures, data and graphs, internet safety |

> Pick **one** lesson objective per game. If it needs two skills, make two games.

## 3 · The one-page game brief 🟨

| Field | 🟨 Fill in | Example for Grade 5 |
|---|---|---|
| Lesson / standard | | 5 · Add fractions with unlike denominators |
| Observable action (what the student *does*) | | Rewrite with a common denominator, then add |
| Top 3 misconceptions | | 1) adds tops and bottoms  2) changes only the denominator  3) forgets to simplify |
| Mechanic (= the thinking) | | Kunafa trays: re-cut two trays into equal pieces before joining them |
| CRA levels | | L1 re-cut fraction bars → L2 area models → L3 the algorithm |
| Feedback “why” lines | | Show 1/2 + 1/3 ≠ 2/5 with bars |
| Local context | | A kunafa shop in Nablus Street, Jeddah |
| Win condition | | 3 levels, mastery ≥ 70 % first-try |
| Data to record | | misconception categories: `added-denominators`, `renamed-bottom-only`, `not-simplified` |

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
1. The pieces must be the same size first.
2. Find a number both denominators go into.
3. Rename each fraction, then add the tops.

**Ghubar** (the friendly mischief-maker) shows the misconceptions:
  - “1/2 + 1/3 = 2/5. Add everything!”
  - “I change the bottom and leave the top. Fair!”
  - “Simplify? Too much work.”

**Why-lines:** every wrong answer you can predict gets its own sentence in `why(v)`. Generic “try again” only as the last fallback.

## 7 · The code

**Door game** (`DOOR.start`) — the engines (balloon, speedtap, sorting, matching, cloze, diagram, quiz…) play your questions; you only write `make()`.

### Worked example — Kunafa Fractions

```js
const gcd = DOOR.gcd, frac = (n, d) => `${n}/${d}`;
DOOR.start({
  id: 'door-5-fractions', code: '7-3', title: 'The Kunafa Trays', emoji: '🥮', verb: 'cloze',
  how: { what: 'Cut both trays into the same size pieces, then add.', steps: ['Find a common denominator', 'Rename each fraction', 'Add the tops'] },
  welcome: 'The kunafa is hot!', learn,
  levels: [
    { name: 'Same-size pieces', rounds: 6, verb: 'balloon', think: false,
      make() { const [a, b] = LK.pick([[2, 3], [3, 4], [2, 5], [4, 6], [3, 5]]);
        const l = a * b / gcd(a, b); return DOOR.choice(`A common denominator for 1/${a} and 1/${b}?`, l, [a + b, Math.max(a, b), l * 2].filter(v => v !== l),
          { why: v => v === a + b ? 'Denominators do not add — find a multiple of both.' : 'It must be a multiple of BOTH.' }); } },
    { name: 'Rename and add', rounds: 6, verb: 'cloze', think: false,
      make() { const [a, b] = LK.pick([[2, 3], [3, 4], [2, 5], [4, 6]]), l = a * b / gcd(a, b);
        return { prompt: `1/${a} + 1/${b} = ?`, parts: [`${l / a}/${l} + ${l / b}/${l} = `, { answer: frac(l / a + l / b, l), options: [frac(l / a + l / b, l), frac(2, a + b), frac(l / a + l / b, 2 * l)] }] }; } },
    { name: 'Spot the mistake', rounds: 5, verb: 'quiz',
      make() { return DOOR.choice('Ghubar says 1/2 + 1/3 = 2/5. What went wrong?', 'He added the denominators', ['He forgot to simplify', 'He multiplied', 'Nothing']); } }
  ],
  praise: ['Perfect pieces!', 'Sweet adding!'], finale: 'Kunafa master of Jeddah! 🥮'
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

## 8 · Accessibility checklist (Grade 5)

- [ ] Targets ≥ **56 px**; a keyboard path for every action.
- [ ] Read-aloud on every prompt (TTS on by default).
- [ ] Never colour alone — ✓ ✗ icons and words.
- [ ] Arabic tested right-to-left; `<bdi>` around mixed text and numbers.
- [ ] `prefers-reduced-motion` turns off bursts and shakes.
- [ ] Works offline on a 5-year-old iPad.

## 9 · Data, test and ship

**Record:** ready → progress each round → mistakes by category (`added-denominators`, `renamed-bottom-only`, `not-simplified`) → level stars → done (mastery ≥ 70 %).

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

**More Grade 5 game ideas:** Volume Warehouse (stack unit cubes) · Coordinate Treasure in Al-Ula · Food Web Builder · Order-of-Operations Lock

[← Grade 4](grade-04.md) · [All grades](README.md) · [Grade 6 →](grade-06.md)

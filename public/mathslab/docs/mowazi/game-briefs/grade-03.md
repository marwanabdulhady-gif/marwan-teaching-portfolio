# 🎮 Fikr Lesson-Game Template · Grade 3 (age 8–9)

[← Grade 2](grade-02.md) · [All grades](README.md) · [Grade 4 →](grade-04.md)

> Copy this file for every new grade 3 lesson game. Fill the **🟨 boxes**, keep the structure, and use the code at the bottom as the starting point.
> Band: **3–5** · Kit: the Fikr lesson kit (`LK`, `DOOR`) — see *fikr-game-design-guide.md* for the full API.

---

## 1 · Who is playing — the Grade 3 profile

| | Grade 3 |
|---|---|
| **Reading load** | Short paragraphs; read-aloud button available |
| **Input** | Tap, drag, keypad; occasional typing of one word |
| **Rounds** | 5–6 per level, 30–60 s |
| **Feedback** | Instant + why; hint ladder |
| **Failure** | “Show me” after 2 misses; stars by first-try accuracy |
| **Social** | Duels, team tug, projector boss battles |
| **Session** | 10–12 minutes |
| **Language** | English or Arabic UI; CUBES think-first on word problems |

```js
/* the band switch: put it at the top of your game file and use it (BAND.rounds in levels, BAND.tts for read-aloud, BAND.target for button size) */
const BAND = { rounds: 6, tts: true,  timer: false, target: 56 };          // 3–5
document.documentElement.style.setProperty('--target', BAND.target + 'px');
```

## 2 · What to teach — Grade 3 topics by subject

| Subject | Typical topics this year |
|---|---|
| **Maths** | Multiplication and division meaning (arrays, equal groups), times tables, unit fractions on a number line, area and perimeter, rounding |
| **English** | Nouns, verbs, adjectives, paragraph main idea, prefixes/suffixes, dialogue punctuation |
| **Arabic** | أنواع الكلمة (اسم، فعل، حرف)، المفرد والمثنى والجمع، الفهم القرائي |
| **Science** | Forces and magnets, life cycles, traits and inheritance basics, weather and climate |
| **CS** | Loops and events (Scratch), debugging, pixels and images |

> Pick **one** lesson objective per game. If it needs two skills, make two games.

## 3 · The one-page game brief 🟨

| Field | 🟨 Fill in | Example for Grade 3 |
|---|---|---|
| Lesson / standard | | 3 · Multiplication as equal groups and arrays |
| Observable action (what the student *does*) | | Write the multiplication for an array and find the total |
| Top 3 misconceptions | | 1) adds the two numbers  2) counts one row only  3) mixes rows and columns |
| Mechanic (= the thinking) | | Plant a palm grove: rows × palms per row; the grove must be a full rectangle |
| CRA levels | | L1 drag palms into rows → L2 array of dots → L3 the fact |
| Feedback “why” lines | | Highlight one row and say “3 rows of 4” |
| Local context | | A palm farm in Al-Ahsa |
| Win condition | | 3 levels, mastery ≥ 70 % first-try |
| Data to record | | misconception categories: `added-not-multiplied`, `one-row-only`, `rows-columns-mixed` |

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
1. Count the rows.
2. Count the palms in one row.
3. rows × palms in a row

**Ghubar** (the friendly mischief-maker) shows the misconceptions:
  - “3 rows and 4 palms = 7. Adding is multiplying, right?”
  - “One row is enough counting for me!”
  - “Rows, columns — same thing sideways.”

**Why-lines:** every wrong answer you can predict gets its own sentence in `why(v)`. Generic “try again” only as the last fallback.

## 7 · The code

**Door game** (`DOOR.start`) — the engines (balloon, speedtap, sorting, matching, cloze, diagram, quiz…) play your questions; you only write `make()`.

### Worked example — Palm Grove Arrays

```js
const arr = (r, c) => LK.h('div', { class: 'gv-arr', html: Array.from({ length: r }, () => '🌴'.repeat(c)).join('<br>') });
DOOR.start({
  id: 'door-3-arrays', code: '3-2', title: 'The Palm Grove', emoji: '🌴', verb: 'diagram',
  how: { what: 'Rows × palms in each row = all the palms.', steps: ['Count the rows', 'Count one row', 'Multiply'] },
  welcome: 'The Al-Ahsa grove needs planting!', learn,
  levels: [
    { name: 'Name the array', icon: '🔍', rounds: 5, verb: 'quiz', think: false,
      make() { const r = LK.rint(2, 6), c = LK.rint(2, 9);
        return Object.assign(DOOR.choice('Which fact matches the grove?', `${r} × ${c}`, [`${r} + ${c}`, `${r} × ${r}`, `${c} − ${r}`],
          { why: v => v.includes('+') ? 'Adding counts rows plus palms — we need rows OF palms.' : 'Count the rows, then the palms in ONE row.' }),
          { draw(el) { el.append(arr(r, c)); } }); } },
    { name: 'How many palms?', icon: '🌴', rounds: 6, verb: 'diagram', think: false,
      make() { const r = LK.rint(2, 9), c = LK.rint(2, 9);
        return { prompt: `${r} rows of ${c} palms`, answer: r * c, draw(el) { el.append(arr(r, c)); },
          why: v => v === r + c ? 'You added. It is rows OF palms: multiply.' : v === c ? 'That is one row. How many rows?' : `${r} × ${c}`,
          hints: [`Skip count by ${c}: ${c}, ${2 * c}, …`, `${r} × ${c}`] }; } },
    { name: 'Missing row', icon: '❓', rounds: 5, verb: 'balloon',
      make() { const r = LK.rint(2, 9), c = LK.rint(2, 9);
        return DOOR.choice(`A grove has ${r * c} palms in ${r} rows. How many in each row?`, c, [c + 1, r, r * c - r].filter(v => v > 0 && v !== c),
          { why: () => `Share ${r * c} into ${r} equal rows.` }); } }
  ],
  praise: ['Neat rows!', 'Grove grown!'], finale: 'Al-Ahsa’s best palm planter! 🌴'
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

## 8 · Accessibility checklist (Grade 3)

- [ ] Targets ≥ **56 px**; a keyboard path for every action.
- [ ] Read-aloud on every prompt (TTS on by default).
- [ ] Never colour alone — ✓ ✗ icons and words.
- [ ] Arabic tested right-to-left; `<bdi>` around mixed text and numbers.
- [ ] `prefers-reduced-motion` turns off bursts and shakes.
- [ ] Works offline on a 5-year-old iPad.

## 9 · Data, test and ship

**Record:** ready → progress each round → mistakes by category (`added-not-multiplied`, `one-row-only`, `rows-columns-mixed`) → level stars → done (mastery ≥ 70 %).

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

**More Grade 3 game ideas:** Fraction Kunafa (cut equal slices on a number line) · Magnet Lab (sort attract / not) · Loop Lantern (repeat blocks to light a path) · Fence the Farm (area vs perimeter)

[← Grade 2](grade-02.md) · [All grades](README.md) · [Grade 4 →](grade-04.md)

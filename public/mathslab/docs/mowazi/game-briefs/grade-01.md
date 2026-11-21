# 🎮 Fikr Lesson-Game Template · Grade 1 (age 6–7)

[← Kindergarten](grade-k.md) · [All grades](README.md) · [Grade 2 →](grade-02.md)

> Copy this file for every new grade 1 lesson game. Fill the **🟨 boxes**, keep the structure, and use the code at the bottom as the starting point.
> Band: **K–2** · Kit: the Fikr lesson kit (`LK`, `DOOR`) — see *fikr-game-design-guide.md* for the full API.

---

## 1 · Who is playing — the Grade 1 profile

| | Grade 1 |
|---|---|
| **Reading load** | Very little — short labels with icons; read-aloud on every prompt |
| **Input** | Tap, drag, big number pad (0–20) |
| **Rounds** | 4 per level, 20–40 s |
| **Feedback** | Instant, voice, celebratory; show the right way with objects |
| **Failure** | No fail state; “Show me” after 2 tries |
| **Social** | Projector + pairs on tablets |
| **Session** | 8–10 minutes |
| **Language** | Bilingual audio; RTL for Arabic |

```js
/* the band switch: put it at the top of your game file and use it (BAND.rounds in levels, BAND.tts for read-aloud, BAND.target for button size) */
const BAND = { rounds: 4, tts: true,  timer: false, target: 72 };          // K–2
document.documentElement.style.setProperty('--target', BAND.target + 'px');
```

## 2 · What to teach — Grade 1 topics by subject

| Subject | Typical topics this year |
|---|---|
| **Maths** | Add and subtract within 20, make 10, place value (tens and ones), time to the hour, measure length with units |
| **English** | CVC words, blends, sight words, capital letters and full stops, simple sentences |
| **Arabic** | تركيب الكلمات من الحروف، المدود (ا و ي)، التاء المربوطة، الجمل البسيطة |
| **Science** | Animal and plant needs, light and sound, Sun and Moon patterns |
| **CS** | Sequences and simple loops with arrows (unplugged / Scratch Jr style) |

> Pick **one** lesson objective per game. If it needs two skills, make two games.

## 3 · The one-page game brief 🟨

| Field | 🟨 Fill in | Example for Grade 1 |
|---|---|---|
| Lesson / standard | | 1 · Make 10 to add within 20 |
| Observable action (what the student *does*) | | Add 8 + 5 by moving 2 to make 10, then add the rest |
| Top 3 misconceptions | | 1) counts all from 1  2) forgets the leftover  3) subtracts instead of adding |
| Mechanic (= the thinking) | | Fill the ten-frame boat: drag riders to fill 10 seats first, the rest wait on the dock |
| CRA levels | | L1 drag riders into a ten-frame → L2 number bond picture → L3 the equation |
| Feedback “why” lines | | Show the ten-frame filling and the leftover riders |
| Local context | | A dhow at the Jeddah Corniche taking 10 riders |
| Win condition | | 3 levels, mastery ≥ 70 % first-try |
| Data to record | | misconception categories: `count-all`, `forgot-leftover`, `subtracted` |

**The test:** *can a student win without doing the skill?* If yes, change the mechanic.

## 4 · The three levels (concrete → representational → abstract) 🟨

| Level | Name 🟨 | What the student does 🟨 | Engine / interaction 🟨 | Rounds |
|---|---|---|---|---|
| 1 · Concrete | | | | 4 |
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
1. How many empty seats until 10?
2. Move that many from the second group.
3. Now it is 10 and some more.

**Ghubar** (the friendly mischief-maker) shows the misconceptions:
  - “I just guess — boats love guessing!”
  - “Ten? Eleven? Same thing.”
  - “I take away to add. Tricky!”

**Why-lines:** every wrong answer you can predict gets its own sentence in `why(v)`. Generic “try again” only as the last fallback.

## 7 · The code

**Door game** (`DOOR.start`) — the engines (balloon, speedtap, sorting, matching, cloze, diagram, quiz…) play your questions; you only write `make()`.

### Worked example — Ten-Seat Dhow (make 10)

```js
DOOR.start({
  id: 'door-1-make10', code: '1-5', title: 'The Ten-Seat Dhow', emoji: '⛵', verb: 'balloon',
  how: { what: 'Fill 10 seats first, then add the rest.', steps: ['Fill the boat to 10', 'Count who is left', '10 + left'] },
  welcome: 'All aboard the dhow!', learn,
  levels: [
    { name: 'How many to make 10?', icon: '🔟', rounds: 4, verb: 'balloon', think: false,
      make() { const a = LK.rint(5, 9); return DOOR.choice(`${a} + ? = 10`, 10 - a, [11 - a, 9 - a, a].filter(v => v >= 0 && v !== 10 - a),
        { why: () => 'Count the empty seats in the ten-frame.' }); } },
    { name: 'Make 10, then add', icon: '⛵', rounds: 4, verb: 'cloze', think: false,
      make() { const a = LK.rint(6, 9), b = LK.rint(11 - a, 9), give = 10 - a;
        return { prompt: `${a} + ${b} = ?`, parts: [`${a} + ${give} = 10, and ${b} − ${give} = `, { answer: b - give, options: [b - give, b, give] }, ` → 10 + ${b - give} = ${a + b}`] }; } },
    { name: 'Riders on the dock', icon: '🧍', rounds: 4, verb: 'fishmath', think: false,
      make() { const a = LK.rint(5, 9), b = LK.rint(3, 9);
        return DOOR.choice(`${a} + ${b}`, a + b, [a + b - 1, a + b + 1, Math.abs(a - b)],
          { why: v => v === Math.abs(a - b) ? 'You took away — this is adding.' : 'Fill 10 first, then count on.' }); } }
  ],
  praise: ['Full boat!', 'Ten and more!'], finale: 'Captain of the dhow — you make 10! ⛵'
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

## 8 · Accessibility checklist (Grade 1)

- [ ] Targets ≥ **72 px**; a keyboard path for every action.
- [ ] Read-aloud on every prompt (TTS on by default).
- [ ] Never colour alone — ✓ ✗ icons and words.
- [ ] Arabic tested right-to-left; `<bdi>` around mixed text and numbers.
- [ ] `prefers-reduced-motion` turns off bursts and shakes.
- [ ] Works offline on a 5-year-old iPad.

## 9 · Data, test and ship

**Record:** ready → progress each round → mistakes by category (`count-all`, `forgot-leftover`, `subtracted`) → level stars → done (mastery ≥ 70 %).

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

**More Grade 1 game ideas:** Sound Builder (drag letters to make CVC words) · Clock Tower of Makkah (time to the hour) · Plant Needs (sort what a plant needs) · Arrow Camel (order arrows to reach the oasis)

[← Kindergarten](grade-k.md) · [All grades](README.md) · [Grade 2 →](grade-02.md)

# 🎮 Fikr Lesson-Game Template · Grade 2 (age 7–8)

[← Grade 1](grade-01.md) · [All grades](README.md) · [Grade 3 →](grade-03.md)

> Copy this file for every new grade 2 lesson game. Fill the **🟨 boxes**, keep the structure, and use the code at the bottom as the starting point.
> Band: **K–2** · Kit: the Fikr lesson kit (`LK`, `DOOR`) — see *fikr-game-design-guide.md* for the full API.

---

## 1 · Who is playing — the Grade 2 profile

| | Grade 2 |
|---|---|
| **Reading load** | Short sentences (≤ 10 words) with read-aloud |
| **Input** | Tap, drag, number pad to 1,000 |
| **Rounds** | 4–5 per level, 30–45 s |
| **Feedback** | Instant + a short “why” (with voice) |
| **Failure** | No fail state; hint after 1 miss, “Show me” after 2 |
| **Social** | Pairs, team tug of war |
| **Session** | 10 minutes |
| **Language** | Bilingual; Arabic RTL |

```js
/* the band switch: put it at the top of your game file and use it (BAND.rounds in levels, BAND.tts for read-aloud, BAND.target for button size) */
const BAND = { rounds: 4, tts: true,  timer: false, target: 72 };          // K–2
document.documentElement.style.setProperty('--target', BAND.target + 'px');
```

## 2 · What to teach — Grade 2 topics by subject

| Subject | Typical topics this year |
|---|---|
| **Maths** | Place value to 1,000, add and subtract within 100/1,000, money (riyals and halalas), skip counting, arrays, time to 5 minutes |
| **English** | Long vowels, compound words, past tense -ed, adjectives, retell a story |
| **Arabic** | الكلمة والجملة، الضمائر، أسماء الإشارة، الفهم القرائي القصير |
| **Science** | States of matter, habitats, plant life cycles, erosion |
| **CS** | Algorithms as recipes; debugging a wrong sequence |

> Pick **one** lesson objective per game. If it needs two skills, make two games.

## 3 · The one-page game brief 🟨

| Field | 🟨 Fill in | Example for Grade 2 |
|---|---|---|
| Lesson / standard | | 2 · Place value to 1,000 |
| Observable action (what the student *does*) | | Build a 3-digit number from hundreds, tens and ones |
| Top 3 misconceptions | | 1) writes 300405 for 345  2) swaps tens and ones  3) ignores a zero place |
| Mechanic (= the thinking) | | Pack dates in boxes of 100, trays of 10 and single dates to fill an order |
| CRA levels | | L1 drag boxes/trays/dates → L2 place-value chart → L3 expanded form |
| Feedback “why” lines | | Show the chart with each digit in its column |
| Local context | | A date shop in Al-Qassim packing orders |
| Win condition | | 3 levels, mastery ≥ 70 % first-try |
| Data to record | | misconception categories: `pv-concat`, `pv-swap`, `pv-zero` |

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
1. How many hundreds? Write that digit first.
2. Then the tens, then the ones.
3. A zero keeps an empty place.

**Ghubar** (the friendly mischief-maker) shows the misconceptions:
  - “Three hundred forty-five = 300405. Easy!”
  - “Tens, ones, who cares about order?”
  - “Zero means nothing, so I skip it!”

**Why-lines:** every wrong answer you can predict gets its own sentence in `why(v)`. Generic “try again” only as the last fallback.

## 7 · The code

**Door game** (`DOOR.start`) — the engines (balloon, speedtap, sorting, matching, cloze, diagram, quiz…) play your questions; you only write `make()`.

### Worked example — Date Packing (place value)

```js
DOOR.start({
  id: 'door-2-pv', code: '2-3', title: 'Pack the Dates', emoji: '📦', verb: 'sorting',
  how: { what: 'Pack hundreds, tens and ones to make the number.', steps: ['Read the order', 'Boxes = hundreds, trays = tens', 'Singles = ones'] },
  welcome: 'Orders are coming in!', learn,
  levels: [
    { name: 'Which place?', icon: '🗂️', rounds: 4, verb: 'sorting', think: false,
      make() { const n = LK.rint(102, 987), d = String(n).split('');
        return { prompt: `Sort the digits of <b>${n}</b>`, bins: [{ id: 'h', label: 'Hundreds 📦' }, { id: 't', label: 'Tens 🧺' }, { id: 'o', label: 'Ones 🌴' }],
          items: [{ label: d[0] + ' (first)', bin: 'h' }, { label: d[1] + ' (middle)', bin: 't' }, { label: d[2] + ' (last)', bin: 'o' }] }; } },
    { name: 'Build the order', icon: '📦', rounds: 5, verb: 'diagram', think: false,
      make() { const h = LK.rint(1, 9), t = LK.rint(0, 9), o = LK.rint(0, 9);
        return { prompt: `${h} boxes, ${t} trays, ${o} dates. How many dates?`, answer: h * 100 + t * 10 + o,
          draw(el) { el.append(LK.h('div', { html: '📦'.repeat(h) + '<br>' + '🧺'.repeat(t) + '<br>' + '🌴'.repeat(o) })); },
          why: v => String(v) === `${h}${t}${o}`.replace(/^0+/, '') ? '' : String(v).length > 3 ? 'Each place holds one digit — no extra zeros.' : 'Check the tens and the ones.' }; } },
    { name: 'Expanded form', icon: '➕', rounds: 4, verb: 'cloze', think: false,
      make() { const n = LK.rint(101, 999), h = Math.floor(n / 100) * 100, t = Math.floor(n % 100 / 10) * 10, o = n % 10;
        return { prompt: `${n} = ?`, parts: [{ answer: h, options: [h, h / 100, h * 10] }, ' + ', { answer: t, options: [t, t / 10 || 10, t * 10 || 100] }, ` + ${o}`] }; } }
  ],
  praise: ['Order packed!', 'Perfect places!'], finale: 'Master packer of Al-Qassim! 📦'
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

## 8 · Accessibility checklist (Grade 2)

- [ ] Targets ≥ **72 px**; a keyboard path for every action.
- [ ] Read-aloud on every prompt (TTS on by default).
- [ ] Never colour alone — ✓ ✗ icons and words.
- [ ] Arabic tested right-to-left; `<bdi>` around mixed text and numbers.
- [ ] `prefers-reduced-motion` turns off bursts and shakes.
- [ ] Works offline on a 5-year-old iPad.

## 9 · Data, test and ship

**Record:** ready → progress each round → mistakes by category (`pv-concat`, `pv-swap`, `pv-zero`) → level stars → done (mastery ≥ 70 %).

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

**More Grade 2 game ideas:** Riyal Till (make change from SAR 20) · Ice, Water, Steam (sort states of matter) · Compound Word Market · Fix the Robot Recipe (debug a sequence)

[← Grade 1](grade-01.md) · [All grades](README.md) · [Grade 3 →](grade-03.md)

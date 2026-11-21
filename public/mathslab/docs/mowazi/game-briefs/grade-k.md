# 🎮 Fikr Lesson-Game Template · Kindergarten (age 5–6)

[All grades](README.md) · [Grade 1 →](grade-01.md)

> Copy this file for every new kindergarten lesson game. Fill the **🟨 boxes**, keep the structure, and use the code at the bottom as the starting point.
> Band: **K–2** · Kit: the Fikr lesson kit (`LK`, `DOOR`) — see *fikr-game-design-guide.md* for the full API.

---

## 1 · Who is playing — the Kindergarten profile

| | Kindergarten |
|---|---|
| **Reading load** | None — pictures, icons and **read-aloud for every line** (TTS on by default) |
| **Input** | Tap and drag only; targets ≥ 72 px; no keypad |
| **Rounds** | 3 per level, 15–30 s each |
| **Feedback** | Instant, voice + big celebration; never a red ✗ alone |
| **Failure** | **No fail state** — wrong taps wiggle and the coach shows the way |
| **Social** | Whole-class on the projector, children come up to tap |
| **Session** | 5–8 minutes |
| **Language** | Arabic or English audio; Arabic UI for most children (RTL) |

```js
/* the band switch: put it at the top of your game file and use it (BAND.rounds in levels, BAND.tts for read-aloud, BAND.target for button size) */
const BAND = { rounds: 4, tts: true,  timer: false, target: 72 };          // K–2
document.documentElement.style.setProperty('--target', BAND.target + 'px');
```

## 2 · What to teach — Kindergarten topics by subject

| Subject | Typical topics this year |
|---|---|
| **Maths** | Count to 20, one-to-one counting, more / fewer, shapes (circle, square, triangle), patterns AB/ABB, compare lengths |
| **English** | Letter names and sounds, rhyme, first sound of a word, colours, sight words (I, a, the) |
| **Arabic** | الحروف وأصواتها، الحركات القصيرة (فتحة، ضمة، كسرة)، الربط بين الحرف والصورة |
| **Science** | Living vs non-living, five senses, day and night, weather, animal homes |
| **CS** | Sequencing pictures (first, next, last); unplugged “robot” directions |

> Pick **one** lesson objective per game. If it needs two skills, make two games.

## 3 · The one-page game brief 🟨

| Field | 🟨 Fill in | Example for Kindergarten |
|---|---|---|
| Lesson / standard | | K · Counting objects to 10 |
| Observable action (what the student *does*) | | Count a group of objects and tap the matching number |
| Top 3 misconceptions | | 1) counts an object twice  2) skips one  3) says the last number but taps another |
| Mechanic (= the thinking) | | Feed the camel: tap exactly that many dates into its basket (each tap = one count, said aloud) |
| CRA levels | | L1 tap real-looking dates one by one → L2 dots on a ten-frame → L3 the numeral |
| Feedback “why” lines | | Each wrong count is shown by re-counting aloud, pointing at each date |
| Local context | | A camel at Al-Ula, dates from Al-Madinah |
| Win condition | | 3 levels, mastery ≥ 70 % first-try |
| Data to record | | misconception categories: `count-skip`, `count-double`, `numeral-mismatch` |

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
1. Touch each date as you count.
2. Say the numbers out loud: 1, 2, 3…
3. The last number you say is how many.

**Ghubar** (the friendly mischief-maker) shows the misconceptions:
  - “I count fast — 1, 2, 5! Done!”
  - “Two dates look the same, so I count them once.”
  - “The biggest number wins, always!”

**Why-lines:** every wrong answer you can predict gets its own sentence in `why(v)`. Generic “try again” only as the last fallback.

## 7 · The code

**Door game** (`DOOR.start`) — the engines (balloon, speedtap, sorting, matching, cloze, diagram, quiz…) play your questions; you only write `make()`.

### Worked example — Date Basket (count to 10)

```js
DOOR.start({
  id: 'door-k-count', code: 'K-1', title: 'The Date Basket', emoji: '🌴', verb: 'speedtap',
  how: { what: 'Count the dates, then tap the number.', steps: ['Listen', 'Count each date', 'Tap the number'] },
  welcome: 'Let’s feed the camel! 🐪', learn,
  levels: [
    { name: 'Count the dates', icon: '🌴', rounds: 3, verb: 'speedtap', think: false,
      make(i) { const n = LK.rint(1, 5);
        return { prompt: '🌴'.repeat(n) + '<br>How many dates?', say: 'Count the dates. How many?',
          tiles: [1, 2, 3, 4, 5].map(k => ({ label: String(k), ok: k === n })) }; } },
    { name: 'Ten-frame', icon: '🔟', rounds: 3, verb: 'matching', think: false,
      make() { const ns = LK.shuffle([1,2,3,4,5,6,7,8,9,10]).slice(0, 4);
        return { prompt: 'Match each ten-frame to its number', pairs: ns.map(n => ['●'.repeat(n) + '○'.repeat(10 - n), String(n)]) }; } },
    { name: 'Feed the camel', icon: '🐪', rounds: 3, verb: 'balloon', think: false,
      make() { const n = LK.rint(6, 10);
        return DOOR.choice('🌴'.repeat(n) + '<br>How many?', n, [n - 1, n + 1, n + 2].filter(x => x > 0),
          { why: v => v < n ? 'You missed one! Count again — touch each date.' : 'You counted one twice. One touch for each date.' }); } }
  ],
  praise: ['Yummy! 🐪', 'Great counting!', 'Mashallah!'], finale: 'The camel is full — you can count to 10! 🎉'
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

## 8 · Accessibility checklist (Kindergarten)

- [ ] Targets ≥ **72 px**; a keyboard path for every action.
- [ ] Read-aloud on every prompt (TTS on by default).
- [ ] Never colour alone — ✓ ✗ icons and words.
- [ ] Arabic tested right-to-left; `<bdi>` around mixed text and numbers.
- [ ] `prefers-reduced-motion` turns off bursts and shakes.
- [ ] Works offline on a 5-year-old iPad.

## 9 · Data, test and ship

**Record:** ready → progress each round → mistakes by category (`count-skip`, `count-double`, `numeral-mismatch`) → level stars → done (mastery ≥ 70 %).

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

**More Kindergarten game ideas:** Shape Souq (sort shapes into baskets) · Rhyme Camel (tap the word that rhymes) · حروف الواحة (match a letter to its picture) · Day or Night? (sort pictures)

[All grades](README.md) · [Grade 1 →](grade-01.md)

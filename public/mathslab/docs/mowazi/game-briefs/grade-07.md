# 🎮 Fikr Lesson-Game Template · Grade 7 (age 12–13)

[← Grade 6](grade-06.md) · [All grades](README.md) · [Grade 8 →](grade-08.md)

> Copy this file for every new grade 7 lesson game. Fill the **🟨 boxes**, keep the structure, and use the code at the bottom as the starting point.
> Band: **6–8** · Kit: the Fikr lesson kit (`LK`, `DOOR`) — see *fikr-game-design-guide.md* for the full API.

---

## 1 · Who is playing — the Grade 7 profile

| | Grade 7 |
|---|---|
| **Reading load** | Full text, multi-step instructions |
| **Input** | Keyboard, sliders, graph clicks, typed expressions |
| **Rounds** | 6–8 per level; sandbox challenges |
| **Feedback** | Self-check and explanations; worked examples after a miss |
| **Failure** | Retry with a cost; no penalty in practice mode |
| **Social** | Co-op, team challenges, opt-in leaderboards |
| **Session** | 15–20 minutes |
| **Language** | English or Arabic |

```js
/* the band switch: put it at the top of your game file and use it (BAND.rounds in levels, BAND.tts for read-aloud, BAND.target for button size) */
const BAND = { rounds: 8, tts: false, timer: true,  target: 44 };          // 6–8
document.documentElement.style.setProperty('--target', BAND.target + 'px');
```

## 2 · What to teach — Grade 7 topics by subject

| Subject | Typical topics this year |
|---|---|
| **Maths** | Proportional relationships, integers and rational numbers, two-step equations and inequalities, scale drawings, circles, probability, sampling |
| **English** | Analysing arguments, citing evidence, active/passive voice, research |
| **Arabic** | الأساليب (النداء، الاستفهام)، الإعراب، التعبير الإقناعي |
| **Science** | Chemical reactions, particle motion and heat, ecosystems dynamics, plate tectonics |
| **CS** | Lists and loops in Python, simulations, cybersecurity basics |

> Pick **one** lesson objective per game. If it needs two skills, make two games.

## 3 · The one-page game brief 🟨

| Field | 🟨 Fill in | Example for Grade 7 |
|---|---|---|
| Lesson / standard | | 7 · Adding and subtracting integers |
| Observable action (what the student *does*) | | Model integer addition on a number line and with zero pairs |
| Top 3 misconceptions | | 1) subtracting a negative makes it smaller  2) ignores signs  3) bigger magnitude always positive |
| Mechanic (= the thinking) | | Red Sea dive: depth below sea level, rise and dive moves |
| CRA levels | | L1 move the diver on a vertical number line → L2 zero-pair chips → L3 rules |
| Feedback “why” lines | | Animate the diver going the opposite way for “minus a negative” |
| Local context | | Diving the Red Sea reefs off Jeddah |
| Win condition | | 3 levels, mastery ≥ 70 % first-try |
| Data to record | | misconception categories: `minus-negative`, `sign-ignored`, `magnitude-sign` |

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
1. Where do you start on the line?
2. Up for +, down for −.
3. Taking away a negative moves you up.

**Ghubar** (the friendly mischief-maker) shows the misconceptions:
  - “Minus a negative? Even more negative!”
  - “Signs are just decoration.”
  - “Bigger number wins the sign, always positive.”

**Why-lines:** every wrong answer you can predict gets its own sentence in `why(v)`. Generic “try again” only as the last fallback.

## 7 · The code

**Custom game** (`LK.start`) — at this age the thinking needs its own interaction (typed expressions, sliders, graphs, constructions), so each level writes a `round(R)`.

### Worked example — Red Sea Dive (integers)

```js
LK.start({
  id: 'red-sea-integers', title: 'Red Sea Dive', emoji: '🤿', topic: 'Adding and subtracting integers',
  how: { what: 'Down is negative, up is positive.', steps: ['Start at the depth', 'Move up (+) or down (−)', 'Minus a negative = go up'] },
  learn, levels: [
    { name: 'Dive moves', icon: '🌊', blurb: 'add integers', rounds: 7,
      round(R) {
        const s = LK.rint(-12, 4), m = LK.rint(-9, 9) || 3, ans = s + m;
        const line = LK.h('div', { class: 'dive-line', html: `Start ${s} m, then ${m > 0 ? 'rise' : 'dive'} ${Math.abs(m)} m` });
        R.el.append(line);
        const input = LK.h('input', { class: 'lk-input', inputmode: 'numeric', 'aria-label': 'Depth' }), go = LK.h('button', { class: 'lk-btn', text: 'Check' });
        R.el.append(input, go);
        R.hints = ['Draw the vertical number line.', `${s} ${m < 0 ? '−' : '+'} ${Math.abs(m)}`];
        R.solve = () => R.say(`${s} + (${m}) = <b>${ans}</b> m`);
        go.onclick = () => { const v = parseInt(input.value.replace('−', '-'), 10);
          if (v === ans) R.right(); else R.wrong(v === s - m ? 'You moved the wrong way.' : Math.sign(v) !== Math.sign(ans) ? 'Check the sign: above or below sea level?' : 'Count the steps again.', { at: input }); };
      } },
    { name: 'Minus a negative', icon: '⬆️', blurb: 'subtract integers', rounds: 7, round(R) { /* s − (−m): remove a weight, the diver rises */ } },
    { name: 'Reef map', icon: '🗺️', blurb: 'distance between depths', rounds: 6, round(R) { /* |a − b| between two divers */ } }
  ],
  praise: ['Smooth dive!', 'Depth correct!'], finale: 'Red Sea dive master! 🤿'
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

## 8 · Accessibility checklist (Grade 7)

- [ ] Targets ≥ **44 px**; a keyboard path for every action.
- [ ] Read-aloud button available; glossary for technical words.
- [ ] Never colour alone — ✓ ✗ icons and words.
- [ ] Arabic tested right-to-left; `<bdi>` around mixed text and numbers.
- [ ] `prefers-reduced-motion` turns off bursts and shakes.
- [ ] Works offline on a 5-year-old iPad.

## 9 · Data, test and ship

**Record:** ready → progress each round → mistakes by category (`minus-negative`, `sign-ignored`, `magnitude-sign`) → level stars → done (mastery ≥ 70 %).

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

**More Grade 7 game ideas:** Scale Model of Masjid al-Haram · Probability Spinner at the Fair · Reaction Balancer (atoms in, atoms out) · Plate Puzzle (fit the Arabian Plate)

[← Grade 6](grade-06.md) · [All grades](README.md) · [Grade 8 →](grade-08.md)

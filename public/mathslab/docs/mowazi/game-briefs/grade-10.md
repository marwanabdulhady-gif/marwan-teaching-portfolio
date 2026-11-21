# 🎮 Fikr Lesson-Game Template · Grade 10 (age 15–16)

[← Grade 9](grade-09.md) · [All grades](README.md) · [Grade 11 →](grade-11.md)

> Copy this file for every new grade 10 lesson game. Fill the **🟨 boxes**, keep the structure, and use the code at the bottom as the starting point.
> Band: **9–12** · Kit: the Fikr lesson kit (`LK`, `DOOR`) — see *fikr-game-design-guide.md* for the full API.

---

## 1 · Who is playing — the Grade 10 profile

| | Grade 10 |
|---|---|
| **Reading load** | Dense text, proofs and diagrams |
| **Input** | Typed answers, geometric construction (drag points), code |
| **Rounds** | Open investigations or 8 per level |
| **Feedback** | Justification required; model solutions; peer review |
| **Failure** | Iterate; exploration rewarded |
| **Social** | Collaborative problem solving, debate, PBL |
| **Session** | 25–30 minutes |
| **Language** | English or Arabic |

```js
/* the band switch: put it at the top of your game file and use it (BAND.rounds in levels, BAND.tts for read-aloud, BAND.target for button size) */
const BAND = { rounds: 8, tts: false, timer: true,  target: 44 };          // 9–12
document.documentElement.style.setProperty('--target', BAND.target + 'px');
```

## 2 · What to teach — Grade 10 topics by subject

| Subject | Typical topics this year |
|---|---|
| **Maths** | Geometry: congruence and similarity, proofs, right-triangle trigonometry, circles, coordinate geometry; probability |
| **English** | Comparative literary analysis, argument writing with counterclaims, rhetoric |
| **Arabic** | البلاغة (التشبيه، الاستعارة)، النقد، المقال العلمي |
| **Science** | Chemistry: stoichiometry, reactions, gases; Physics: forces and energy |
| **CS** | Object-oriented basics, recursion, data structures |

> Pick **one** lesson objective per game. If it needs two skills, make two games.

## 3 · The one-page game brief 🟨

| Field | 🟨 Fill in | Example for Grade 10 |
|---|---|---|
| Lesson / standard | | 10 · Right-triangle trigonometry |
| Observable action (what the student *does*) | | Choose sin, cos or tan to find a missing side or angle |
| Top 3 misconceptions | | 1) uses the wrong ratio (SOH CAH TOA mixed)  2) calculator in radians  3) hypotenuse misidentified |
| Mechanic (= the thinking) | | Measure tall Jeddah landmarks with a clinometer angle and a distance |
| CRA levels | | L1 build the triangle by dragging → L2 label O/A/H → L3 solve with the ratio |
| Feedback “why” lines | | Highlight the labelled sides the student used |
| Local context | | Jeddah Tower and the King Fahd Fountain |
| Win condition | | 3 levels, mastery ≥ 70 % first-try |
| Data to record | | misconception categories: `wrong-ratio`, `radian-mode`, `hypotenuse-misread` |

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
1. Which side is opposite the angle?
2. Which two sides are involved?
3. SOH CAH TOA — then rearrange.

**Ghubar** (the friendly mischief-maker) shows the misconceptions:
  - “Tan, sin, cos — pick any, they’re cousins.”
  - “My calculator says 0.4. Radians are fine.”
  - “The longest side is opposite. Obviously.”

**Why-lines:** every wrong answer you can predict gets its own sentence in `why(v)`. Generic “try again” only as the last fallback.

## 7 · The code

**Custom game** (`LK.start`) — at this age the thinking needs its own interaction (typed expressions, sliders, graphs, constructions), so each level writes a `round(R)`.

### Worked example — Tower Trig (right triangles)

```js
LK.start({
  id: 'tower-trig', title: 'Measure the Tower', emoji: '🏙️', topic: 'Right-triangle trigonometry',
  how: { what: 'Label the sides from the angle, then choose sin, cos or tan.', steps: ['Mark O, A, H from the angle', 'Which two sides do you know/need?', 'SOH · CAH · TOA, then solve'] },
  learn, levels: [
    { name: 'Label the sides', icon: '🏷️', rounds: 8, round(R) { /* drag O, A, H onto the triangle’s sides */ } },
    { name: 'Choose the ratio', icon: '🧮', rounds: 8,
      round(R) {
        const ang = LK.rint(20, 70), d = LK.rint(40, 200), h = Math.round(d * Math.tan(ang * Math.PI / 180));
        R.el.append(LK.h('p', { html: `You stand ${d} m from the tower. The angle to the top is ${ang}°. Which ratio finds the height?` }));
        ['sin', 'cos', 'tan'].forEach(r => { const b = LK.h('button', { class: 'lk-btn', text: r, onclick: () => r === 'tan' ? (R.say(`tan ${ang}° = h ÷ ${d} → h ≈ <b>${h} m</b>`, 'good'), R.right({ wait: 'button' })) : R.wrong(`${r} uses the ${r === 'sin' ? 'hypotenuse' : 'hypotenuse'} — you know the ADJACENT side and need the OPPOSITE.`, { at: b }) }); R.el.append(b); });
        R.hints = ['The height is OPPOSITE the angle.', 'The distance is ADJACENT.', 'Opposite and adjacent → TOA.'];
      } },
    { name: 'Field trip', icon: '📏', rounds: 6, round(R) { /* type the height to 1 m; check degrees mode; tolerance ±1 */ } }
  ],
  praise: ['Measured!', 'Sharp angle work!'], finale: 'Surveyor of Jeddah’s skyline 🏙️'
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

## 8 · Accessibility checklist (Grade 10)

- [ ] Targets ≥ **44 px**; a keyboard path for every action.
- [ ] Read-aloud button available; glossary for technical words.
- [ ] Never colour alone — ✓ ✗ icons and words.
- [ ] Arabic tested right-to-left; `<bdi>` around mixed text and numbers.
- [ ] `prefers-reduced-motion` turns off bursts and shakes.
- [ ] Works offline on a 5-year-old iPad.

## 9 · Data, test and ship

**Record:** ready → progress each round → mistakes by category (`wrong-ratio`, `radian-mode`, `hypotenuse-misread`) → level stars → done (mastery ≥ 70 %).

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

**More Grade 10 game ideas:** Proof Builder (drag reasons into a two-column proof) · Stoichiometry Kitchen (kabsa recipe moles) · Similar Triangles Shadow Clock · Recursion Towers

[← Grade 9](grade-09.md) · [All grades](README.md) · [Grade 11 →](grade-11.md)

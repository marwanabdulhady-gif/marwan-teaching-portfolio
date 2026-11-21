# 🎮 Fikr Lesson-Game Template · Grade 9 (age 14–15)

[← Grade 8](grade-08.md) · [All grades](README.md) · [Grade 10 →](grade-10.md)

> Copy this file for every new grade 9 lesson game. Fill the **🟨 boxes**, keep the structure, and use the code at the bottom as the starting point.
> Band: **9–12** · Kit: the Fikr lesson kit (`LK`, `DOOR`) — see *fikr-game-design-guide.md* for the full API.

---

## 1 · Who is playing — the Grade 9 profile

| | Grade 9 |
|---|---|
| **Reading load** | Dense text; technical vocabulary; diagrams |
| **Input** | Typed expressions/equations, graph plotting, sliders, code |
| **Rounds** | Open challenges or 8 per level |
| **Feedback** | Evidence-based; compare strategies; peer review |
| **Failure** | Iterate on a design; no penalty for exploring |
| **Social** | Collaborative projects, PBL, debate |
| **Session** | 20–30 minutes |
| **Language** | English or Arabic; academic register |

```js
/* the band switch: put it at the top of your game file and use it (BAND.rounds in levels, BAND.tts for read-aloud, BAND.target for button size) */
const BAND = { rounds: 8, tts: false, timer: true,  target: 44 };          // 9–12
document.documentElement.style.setProperty('--target', BAND.target + 'px');
```

## 2 · What to teach — Grade 9 topics by subject

| Subject | Typical topics this year |
|---|---|
| **Maths** | Algebra I: linear and quadratic functions, factoring, systems, exponential growth, statistics |
| **English** | Rhetorical analysis, literary devices, research synthesis, formal essays |
| **Arabic** | النقد الأدبي، الصرف (الميزان الصرفي)، الكتابة الإبداعية والإقناعية |
| **Science** | Biology: cells, genetics, evolution, ecology; Physical science: chemical bonding |
| **CS** | Python: functions, lists, loops; algorithms and complexity basics |

> Pick **one** lesson objective per game. If it needs two skills, make two games.

## 3 · The one-page game brief 🟨

| Field | 🟨 Fill in | Example for Grade 9 |
|---|---|---|
| Lesson / standard | | 9 · Quadratic functions and their graphs |
| Observable action (what the student *does*) | | Connect a quadratic’s vertex form to its graph and roots |
| Top 3 misconceptions | | 1) h sign flipped in (x − h)  2) roots confused with the vertex  3) “a” only stretches, ignores reflection |
| Mechanic (= the thinking) | | Falcon’s flight: shape a parabola to catch the lure (vertex, width, direction) |
| CRA levels | | L1 sliders for a, h, k → L2 table + graph → L3 algebra (factor, vertex form) |
| Feedback “why” lines | | Overlay the student’s parabola and the target path |
| Local context | | A falconry festival near Riyadh |
| Win condition | | 3 levels, mastery ≥ 70 % first-try |
| Data to record | | misconception categories: `h-sign`, `roots-vs-vertex`, `a-reflection` |

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
1. Where is the turning point?
2. Which way does it open? That is the sign of a.
3. Substitute a point to find a.

**Ghubar** (the friendly mischief-maker) shows the misconceptions:
  - “(x − 3) moves left. Minus means left!”
  - “The vertex is where it crosses zero.”
  - “Negative a just makes it thinner.”

**Why-lines:** every wrong answer you can predict gets its own sentence in `why(v)`. Generic “try again” only as the last fallback.

## 7 · The code

**Custom game** (`LK.start`) — at this age the thinking needs its own interaction (typed expressions, sliders, graphs, constructions), so each level writes a `round(R)`.

### Worked example — Falcon’s Arc (quadratics)

```js
/* a free-response expression check: parse "a(x-h)^2+k" safely by sampling values */
function sameFunction(expr, f) {
  const g = new Function('x', 'return ' + expr.replace(/\^/g, '**').replace(/(\d)x/g, '$1*x').replace(/\)\(/g, ')*('));
  try { return [-3, -1, 0, 1.5, 4].every(x => Math.abs(g(x) - f(x)) < 1e-6); } catch (e) { return false; }
}
LK.start({
  id: 'falcon-arc', title: 'The Falcon’s Arc', emoji: '🦅', topic: 'Quadratic functions',
  how: { what: 'Shape the parabola so the falcon catches the lure.', steps: ['Find the vertex (h, k)', 'Choose a: width and direction', 'Write y = a(x − h)² + k'] },
  learn, levels: [
    { name: 'Vertex hunt', icon: '🎯', rounds: 8, round(R) { /* show a graph, choose the vertex from 4 */ } },
    { name: 'Write the flight', icon: '✍️', rounds: 8,
      round(R) {
        const a = LK.pick([-2, -1, 1, 2, 0.5]), h = LK.rint(-3, 3), k = LK.rint(-2, 6), f = x => a * (x - h) ** 2 + k;
        R.el.append(LK.h('p', { html: `The falcon’s path has vertex (${h}, ${k}) and passes through (${h + 1}, ${a + k}). Write it in vertex form.` }));
        const input = LK.h('input', { class: 'lk-input', placeholder: 'y = a(x - h)^2 + k', spellcheck: 'false' }), go = LK.h('button', { class: 'lk-btn', text: 'Fly!' });
        R.el.append(input, go);
        R.hints = ['Put h and k in: y = a(x − h)² + k', `Use the second point to find a: ${a + k} = a(1)² + ${k}`];
        R.solve = () => R.say(`y = ${a}(x − ${h})² + ${k}`);
        go.onclick = () => { const e = input.value.replace(/^\s*y\s*=/, '');
          if (sameFunction(e, f)) R.right();
          else R.wrong(sameFunction(e, x => a * (x + h) ** 2 + k) ? 'Check the sign of h: (x − h) moves RIGHT by h.' : 'Test your equation at the vertex.', { at: input }); };
      } },
    { name: 'Catch the lure', icon: '🦅', rounds: 6, round(R) { /* sliders a, h, k; pass through the lure and land at the roots */ } }
  ],
  praise: ['Perfect arc!', 'The falcon strikes!'], finale: 'Master falconer of the parabola 🦅'
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

## 8 · Accessibility checklist (Grade 9)

- [ ] Targets ≥ **44 px**; a keyboard path for every action.
- [ ] Read-aloud button available; glossary for technical words.
- [ ] Never colour alone — ✓ ✗ icons and words.
- [ ] Arabic tested right-to-left; `<bdi>` around mixed text and numbers.
- [ ] `prefers-reduced-motion` turns off bursts and shakes.
- [ ] Works offline on a 5-year-old iPad.

## 9 · Data, test and ship

**Record:** ready → progress each round → mistakes by category (`h-sign`, `roots-vs-vertex`, `a-reflection`) → level stars → done (mastery ≥ 70 %).

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

**More Grade 9 game ideas:** Exponential Riyadh (population growth) · Evolution Simulator (desert fox traits) · Bond Builder (ionic vs covalent) · Python Bug Hunt

[← Grade 8](grade-08.md) · [All grades](README.md) · [Grade 10 →](grade-10.md)

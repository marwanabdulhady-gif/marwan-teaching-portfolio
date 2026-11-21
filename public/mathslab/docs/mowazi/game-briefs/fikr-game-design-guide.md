# Fikr Lesson Games: How They Work, and How to Build More

**A design and build guide for creative learning games across grades and subjects:** English, Maths, Science, Science lab simulations, Arabic, Computer Science and Robotics, and AI.

> Written from the real Fikr code (`playhub/lessons/…`, `public/games.html`, `public/practice/…`). Part 1 explains what exists today. Parts 2 to 4 show how to design new game experiences on the same foundation. Part 5 is a subject-by-subject playbook with working code. Part 6 covers data, testing and shipping.

---

## Contents

1. [How a Fikr lesson game is built today](#1-how-a-fikr-lesson-game-is-built-today)
2. [The design method: from learning goal to game mechanic](#2-the-design-method-from-learning-goal-to-game-mechanic)
3. [Adapting for grade levels](#3-adapting-for-grade-levels)
4. [The universal game template (copy this first)](#4-the-universal-game-template-copy-this-first)
5. [Subject playbooks with code](#5-subject-playbooks-with-code)
   - 5.1 English
   - 5.2 Maths
   - 5.3 Science (concept games)
   - 5.4 Science lab simulations
   - 5.5 Arabic
   - 5.6 Computer Science
   - 5.7 Robotics
   - 5.8 AI literacy
6. [Data, assessment, testing and shipping](#6-data-assessment-testing-and-shipping)
7. [Checklist and idea bank](#7-checklist-and-idea-bank)

---

## 1. How a Fikr lesson game is built today

### 1.1 The three layers

```
┌──────────────────────────────────────────────────────────────────────┐
│  games.html (pupil's page)                                           │
│   My lesson: ▶ Watch → ❓ Answer → 🎮 Play → 🎯 Blitz → 🧠 Think      │
│   opens the game in an <iframe id="frame">, listens to postMessage,   │
│   saves plays to Supabase (games_track), stars, mistakes, certificate │
└───────────────▲──────────────────────────────────────────────────────┘
                │ postMessage  lesson:ready / progress / level / mistakes / done / close
┌───────────────┴──────────────────────────────────────────────────────┐
│  ONE offline HTML page per game  (public/playhub/lessons/<id>.html)   │
│                                                                      │
│  ① kit.js + kit.css   the "Lesson Kit": the same chrome for every game│
│     bar, home screen, 🎓 Learn, 3 levels with stars, coach, hints,    │
│     "Show me", sounds, bursts, streaks, level card, trophy, messages, │
│     Wadi story card, films, trial rounds                              │
│  ② door.js + door.css  (door games only) gate worlds + 19 ENGINES      │
│     balloon, bubbleshooter, fishmath, tugofwar, speedtap, sorting,    │
│     venn, matching, memory, scramble, timeline, cloze, diagram, …     │
│  ③ the game file  games/<id>.js  or  doors/door-<code>.js (+ .css)    │
│     ONLY the world, the Learn slides and the questions                │
└──────────────────────────────────────────────────────────────────────┘
        built by  playhub/tools/build-lessons.mjs  (inlines ①②③, refuses network)
        listed by playhub/lessons/catalog.mjs       (maps each game to lesson codes)
```

**The key idea:** a game author writes only the world and the questions. The kit gives every game the same proven learning loop, so pupils never relearn the interface. That keeps their attention on the maths, not on how the game works.

### 1.2 The pupil's journey inside one game

```
Home screen ──► 🎓 Learn (guided slides, last one is "your turn")
     │
     ├─► Level 1 (concrete / guided) ── 5–6 rounds
     ├─► Level 2 (representational)   ── 5–6 rounds
     └─► Level 3 (challenge / abstract)── 5 rounds
              │
              └─► Level card ⭐⭐⭐ ─► Trophy + finale ─► lesson:done → games.html
```

In every round:

- The **coach** reads the question aloud.
- A wrong answer shows a **specific "why"**, a reason drawn from the misconception (for example, "Too many zeros — 3 × 4 = 12 already brings its own").
- **💡 Hints** come one at a time.
- After **two misses**, **👀 Show me** solves the round. It counts as *learnt*, not *won*.
- A first-try answer gives **+1 ⭐**, and **🔥 streaks** cheer at 3, 5, 10 and 15 in a row.
- Stars per level are 1 to 3, worked out from first-try accuracy.

### 1.3 The game definition (what an author writes)

Every game calls `LK.start(def)`:

```js
LK.start({
  id: 'boss-battle',                         // also the file name and the catalog id
  title: 'Four-Box Boss Battle', emoji: '⚔️',
  topic: 'Multiplication: area models',
  theme: { bg: 'linear-gradient(180deg,#2b1b3d,#1c1029)', accent: '#e0502e',
           'accent-ink': '#8f2c12', 'accent-2': '#ffd23f', 'scene-ink': '#fdeedd', panel: '#fdf3e1' },
  coach: '🧙🏽',                              // the coach's face
  decor: '<svg …>…</svg>',                   // the world behind the play
  how: { what: 'One-line goal', steps: ['Step 1', 'Step 2', 'Step 3'] },
  welcome: 'The arena awaits, hero!',
  hero(el) { /* draw the home-screen art into el */ },
  learn: [ /* guided slides, see 1.5 */ ],
  levels: [
    { name: 'First wave', icon: '🗿', blurb: '2-digit × 1-digit', rounds: 6, round(R, i) { /* one question */ } },
    { name: 'Bigger foes', icon: '👹', blurb: '3-digit × 1-digit', rounds: 6, round(R, i) { … } },
    { name: 'The Colossus', icon: '⚔️', blurb: '2-digit × 2-digit', rounds: 5, round(R, i) { … } }
  ],
  praise: ['A mighty hit!', 'Critical strike!'],
  finale: 'Every boss defeated — you are the champion! ⚔️'
});
```

### 1.4 The Round API (`R`): the heart of every game

`round(R, i)` draws **one question** into `R.el`, then calls `R.right()` or `R.wrong(why)`:

| Member | What it does |
|---|---|
| `R.el` | the element to draw the round into |
| `R.level`, `R.index`, `R.rounds` | which level and round this is |
| `R.right(opts?)` | correct: star, sound, burst, streak, then the next round. `{wait:'button'}` shows a *Next ▸* button. |
| `R.wrong(why, {at})` | wrong: the coach explains `why`, the misconception is logged, the element `at` shakes |
| `R.hints = [...]` | the hints, revealed one per tap of 💡 |
| `R.solve = () => …` | what **👀 Show me** does after two misses |
| `R.say(text, mood)` | the coach speaks (`'good'`, `'bad'`, `'hint'`) |
| `R.later(fn, ms)` / `R.every(fn, ms)` / `R.on(cleanup)` | timers that are cleaned up automatically when the round ends |
| `R.sfx`, `R.fx` | sounds (`right`, `wrong`, `streak`) and effects (`pop`, `burst`, `shake`) |
| `R.ease` | adaptive hint: below 0 means the pupil is struggling, so offer help sooner |

**A minimal round:**

```js
round(R) {
  const a = LK.rint(12, 98), b = LK.rint(3, 9), ans = a * b;
  R.el.append(LK.h('div', { class: 'lk-display', html: `${a} × ${b} = ?` }));
  R.hints = [`Split ${a} into tens and ones.`, `${Math.floor(a/10)*10} × ${b} + ${a%10} × ${b}`];
  R.solve = () => R.say(`${a} × ${b} = <b>${ans}</b>`);
  const pad = LK.keypad(R.el, { max: 4, onEnter: v => {
    pad.clear();
    if (v === ans) R.right();
    else R.wrong(v === a + b ? 'You added — this is multiplication.' : `Check each box again.`);
  } });
}
```

### 1.5 Learn slides (guided walk-through)

```js
const learn = [
  { say: 'Every big multiplication hides easy boxes. 47 = <b>40 + 7</b>.',
    draw(el) { el.append(LK.h('div', { html: '40 × 6 + 7 × 6' })); } },
  { say: 'Your turn: 23 × 4. Fill 20 × 4 first.', wait: true,          // wait: the pupil must act
    draw(el, L) {
      const pad = LK.keypad(el, { max: 3, onEnter: v => {
        pad.clear();
        if (v === 80) L.ok('80 — now 3 × 4.');                        // L.ok() moves the walk-through on
        else if (v === 12) L.ok('80 + 12 = <b>92</b>. You did it!');
      } });
    } }
];
```

### 1.6 Door games and engines: the fastest way to make a game

A *door game* (`doors/door-3-1.js`) does not draw anything. It returns **question objects**, and a ready-made engine plays them:

```js
DOOR.start({
  id: 'door-3-1', code: '3-1', title: 'The Palm-Pot Parade', emoji: '🪴', verb: 'bubbleshooter',
  how: {…}, welcome: '…', learn,
  levels: [
    { name: 'Pots in tens', rounds: 6, verb: 'bubbleshooter',
      make(i) { return DOOR.choice('3 × 40 = ?', 120, [12, 1200, 160], { why: v => 'Count the zeros', hints: ['3 × 4 first'] }); } },
    { name: 'Hundreds of seats', rounds: 5, verb: 'speedtap',
      make(i) { return { prompt: 'Tap every product that makes 1,200', tiles: [{label:'3 × 400', ok:true}, {label:'4 × 30', ok:false}] }; } },
    { name: 'The grove', rounds: 5, verb: 'cloze',
      make(i) { return { prompt: 'Fill in the working', parts: ['3 × 400 = 3 × 4 × ', { answer: 100, options: [10,100,1000] }] }; } }
  ]
});
```

**Question shapes, by engine family.** Any subject can reuse them:

| Shape | Fields | Engines (`verb`) |
|---|---|---|
| choice | `{ prompt, options, answer, why?(picked), hints?, solution? }` | balloon, bubbleshooter, fishmath, tablestennis, tugofwar, scratch, openthebox, quiz, numbermaze, mazechase |
| tiles | `{ prompt, tiles:[{label, ok}] }` | speedtap |
| bins | `{ prompt, bins:[{id,label}], items:[{label, bin}] }` | sorting |
| venn | `{ prompt, sets:['A','B'], items:[{label, a, b}] }` | venn |
| pairs | `{ prompt, pairs:[[left,right]…] }` | matching, memory |
| order | `{ prompt, items:[first…last] }` | scramble, timeline |
| cloze | `{ prompt, parts:['text', {answer, options}, 'text'] }` | cloze |
| model | `{ prompt, draw(el), answer }` | diagram |

> **This is the biggest win for other subjects.** Sorting, Venn, matching, timeline and cloze have nothing to do with maths. An English or Science game can be a door-style file that only writes questions.

### 1.7 The message contract (game → games page)

The game talks to its parent page with `window.parent.postMessage(msg, origin)`:

| Message | When | What the games page does |
|---|---|---|
| `{type:'lesson:ready', v:1, id}` | page drawn | marks the game as opened |
| `{type:'lesson:progress', v:1, id, stars, streak, done, total}` | each round | teacher's live view ("Ahmed: 4/17") |
| `{type:'lesson:level', v:1, id, level, stars}` | level finished | coins and wallet |
| `{type:'lesson:mistakes', v:1, id, level, list:[{detail,n}]}` | level finished | **Common mistakes** report (Track tab) |
| `{type:'lesson:done', v:1, id, score, total}` | game finished | `games_track(... 'finish', score, total)`, which counts toward the **🎓 certificate** (≥ 70%) |
| `{type:'lesson:close', v:1, id}` | ← button | closes the frame |

`games.html` checks every message: same origin only, `v === 1`, the id matches the open game, and numbers are rounded and clamped. **Any new game, in any subject, plugs into stars, live view, mistakes, coins and certificates just by sending these messages.**

### 1.8 Build, catalog and storage

- **Build:** `node playhub/tools/build-lessons.mjs` inlines kit, door layer, game JS and CSS into `public/playhub/lessons/<id>.html`. It **refuses** any page that would reach the network, so every game works offline on an iPad.
- **Catalog:** `playhub/lessons/catalog.mjs` maps `{ id, title, emoji, topic, blurb, lessons:['4.5','3.4'] }`. That makes the game appear on the lesson card, the Year map and "This week's games".
- **Storage:** best stars per device (`localStorage`), synced across devices by the games page (`games_save`). Teacher switches: `lk:wadi` (story), `lk:films` (intro films).
- **Sister engines** built on the same idea:
  - `public/practice/<code>.js`: **Practice Blitz** banks (`levels[].make(i, R)` → `{prompt, answer, options}`), three adaptive tiers.
  - `public/practice/wp.js` + `wp/<topic>.js`: **Saudi word problems** taught with **CUBES** (the 🧠 Think step).
  - `public/games-quiz.html`, `quiz-print.html`: the same banks become quizzes, worksheets and exams.

---

## 2. The design method: from learning goal to game mechanic

### 2.1 Action Mapping for games

Start from the action, not the content. This is Cathy Moore's Action Mapping, applied to play:

1. **Business/learning goal:** "Pupils add fractions with unlike denominators."
2. **Observable actions:** find a common denominator, rename both fractions, add the numerators, simplify.
3. **Why do they fail?** They add the denominators (1/2 + 1/3 = 2/5). That is your **misconception list**, and it becomes your `why()` messages.
4. **Practice activity = game mechanic:** the mechanic must **be** the action. A pupil who wins the game must have *done* the maths.

> ❌ "Answer a question to make the car move" is **chocolate-covered broccoli**: the game and the learning are separate.
> ✅ "Cut the pizza into equal slices until both orders fit the same tray" is the **mechanic as the concept** (Fraction Chef).

### 2.2 The Mechanic = Thinking test

| Concept | Weak mechanic | Strong mechanic (the action *is* the thinking) |
|---|---|---|
| Place value | quiz | Spin the vault's dials: tens and hundreds are physical wheels |
| Area model | type the product | Boss HP bar = the product; each partial product is a hit |
| Prime numbers | true/false | Build every rectangle from n tiles: one rectangle means prime and the island is saved |
| Subject–verb agreement | multiple choice | **Sentence Surgeon:** drag the verb that keeps the sentence's heartbeat alive |
| Food chains | label a diagram | **Ecosystem Jenga:** remove a species and watch who collapses |
| Ohm's law | formula drill | **Light the stadium:** choose resistors so every bulb glows without burning out |
| Loops in CS | "what does this print?" | **Robot maze:** the shortest program wins the gold star |

### 2.3 Constructivist structure: CRA in three levels

The kit's three levels map onto **Concrete → Representational → Abstract**:

| Level | CRA stage | Example (fractions) | Example (science) |
|---|---|---|---|
| 1 | Concrete: manipulate objects | drag pizza slices | mix real-looking liquids |
| 2 | Representational: diagrams and models | fraction bars, number line | particle diagram |
| 3 | Abstract: symbols, transfer | 3/4 + 1/8 = ? | write the word equation, predict |

### 2.4 Feedback design: the "why" is the teaching

- **Diagnose, don't judge:** map each common wrong answer to the misconception behind it:
  ```js
  const why = v => v === a + b ? 'You added the denominators — slices must be the same size first.'
               : v === a * b ? 'That is multiplying — are we combining or scaling?'
               : 'Check your common denominator.';
  ```
- **Hints ladder:** strategy, then a step, then a near-solution. Never the answer first.
- **Show me after 2 misses.** It teaches without punishing, and counts as *learnt*.
- **Log the misconception** (`R.wrong(why)` → `lesson:mistakes`) so the teacher reteaches the right idea.

### 2.5 Motivation, done right

- **Competence:** stars for *first-try* accuracy, not speed. Streaks and level cards.
- **Autonomy:** a free choice of level, replayable, Learn is optional.
- **Relatedness:** class tournament, team tug of war, sending the certificate to the teacher.
- **Story:** the Wadi world (16 gates, guides, Ghubar's mischief) gives every lesson a *reason*.
- **Local identity:** Saudi contexts (riyals and halalas, Riyadh Season, AlUla, Qassim dates, Haramain train).
- **Avoid:** leaderboards that shame the slowest pupils (Fikr shows *your* rank and "XP to pass the next"), timers on first exposure, and losing progress.

---

## 3. Adapting for grade levels

| | K–2 (5–8 yrs) | 3–5 (8–11) | 6–8 (11–14) | 9–12 (14–18) |
|---|---|---|---|---|
| **Reading load** | almost none: icons, **audio for everything** (TTS) | short sentences plus audio | full text, optional audio | dense text, technical vocabulary |
| **Input** | tap, drag big targets (≥ 64 px) | tap, drag, keypad | keyboard, sliders, drawing | code, free text, equations |
| **Round length** | 3–4 rounds, 20–40 s each | 5–6 rounds | 6–8 rounds or open sandbox | open-ended projects, labs |
| **Feedback** | instant, celebratory, voice | instant + why | delayed self-check, explanations | evidence-based, peer review |
| **Mechanics** | matching, sorting, counting, tracing | engines in §1.6, boss battles, maps | simulations, puzzles, strategy | labs, modelling, coding, debate |
| **Failure** | no fail state | Show me after 2 misses | retry with a cost | iterate on a design |
| **Social** | whole-class projector games | duels, team tug | tournaments, co-op | collaborative projects, PBL |

**Grade band switch.** Define `band` once and let content and UI follow it:

```js
const BAND = { k2: { rounds: 4, tts: true,  timer: false, target: 72 },
               g35:{ rounds: 6, tts: true,  timer: false, target: 56 },
               g68:{ rounds: 8, tts: false, timer: true,  target: 44 },
               g912:{rounds: 8, tts: false, timer: true,  target: 44 } }[params.get('band') || 'g35'];
document.documentElement.style.setProperty('--target', BAND.target + 'px');   /* button size */
```

**Read-aloud for young pupils and EAL pupils** (built into the browser, offline on iPad):

```js
function speak(text, lang = 'en-GB') {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, ''));
  u.lang = lang;           // 'ar-SA' for Arabic
  u.rate = 0.9;
  speechSynthesis.speak(u);
}
```

---

## 4. The universal game template (copy this first)

Two ways to build:

- **A. Inside Fikr:** write `playhub/lessons/games/<id>.js` with `LK.start`, add it to `catalog.mjs`, then run the build. You get everything in §1 for free.
- **B. Any subject, any page:** a standalone HTML file that speaks the **same message contract**. Use this for English, Arabic, Science and CS until they get their own catalog.

### 4.1 Standalone mini-kit (≈80 lines, no libraries, works offline)

```html
<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>My Game</title>
<style>
  :root{--ink:#141a33;--accent:#0e8a8f;--good:#16a34a;--bad:#e0302f;--target:56px}
  body{margin:0;font:600 18px/1.4 system-ui,"Noto Sans Arabic",sans-serif;background:#eef6f4;color:var(--ink)}
  .bar{display:flex;gap:12px;align-items:center;padding:10px 14px;background:var(--ink);color:#fff}
  .bar .dots i{display:inline-block;width:10px;height:10px;border-radius:50%;background:#ffffff44;margin:0 2px}
  .bar .dots i.on{background:#ffd23f}
  main{max-width:900px;margin:16px auto;padding:0 16px}
  .card{background:#fff;border-radius:20px;padding:20px;box-shadow:0 6px 0 #0002}
  .opt{min-height:var(--target);min-width:var(--target);border:3px solid var(--ink);border-radius:16px;background:#fff;font:inherit;padding:8px 16px;margin:6px;cursor:pointer}
  .coach{margin-top:12px;padding:12px 16px;border-radius:16px;background:#fff8dc}
  .coach.bad{background:#ffe4e1}.coach.good{background:#dcfce7}
  .shake{animation:sh .3s}@keyframes sh{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
</style>
</head>
<body>
<div class="bar"><b id="t"></b><span class="dots" id="dots"></span><span id="stars">⭐ 0</span></div>
<main><div class="card" id="stage"></div><div class="coach" id="coach" aria-live="polite"></div></main>
<script>
const MINI = (() => {
  const embedded = window.parent !== window;
  const tell = m => { if (embedded) parent.postMessage(Object.assign({ v: 1 }, m), location.origin); };
  const $ = s => document.querySelector(s);
  let G, li = 0, ri = 0, stars = 0, firstTry = 0, tries = 0, total = 0, mistakes = {};
  const say = (t, mood = '') => { const c = $('#coach'); c.className = 'coach ' + mood; c.innerHTML = t; };
  function dots() { $('#dots').innerHTML = Array.from({ length: G.levels[li].rounds }, (_, k) => `<i class="${k < ri ? 'on' : ''}"></i>`).join(''); $('#stars').textContent = '⭐ ' + stars; }
  function round() {
    tries = 0; const el = $('#stage'); el.innerHTML = ''; dots();
    const R = {
      el, level: li, index: ri, hints: [], say,
      right() { if (R.done) return; R.done = true; stars++; total++; if (tries === 0) firstTry++; say(pick(G.praise || ['Brilliant!']), 'good');
        tell({ type: 'lesson:progress', id: G.id, stars, done: total, total: G.levels.reduce((s, l) => s + l.rounds, 0) });
        setTimeout(next, 1200); },
      wrong(why, at) { tries++; if (why) mistakes[why] = (mistakes[why] || 0) + 1; say(why || 'Not quite — look again.', 'bad');
        if (at) { at.classList.remove('shake'); void at.offsetWidth; at.classList.add('shake'); }
        if (tries >= 2 && R.solve) say((why || '') + ' <button class="opt" id="show">👀 Show me</button>', 'bad'), $('#show').onclick = () => { R.solve(); R.done = true; total++; setTimeout(next, 2500); }; }
    };
    G.levels[li].round(R, ri);
    if (G.tts) speak(el.innerText);
  }
  function next() {
    ri++;
    if (ri < G.levels[li].rounds) return round();
    const list = Object.entries(mistakes).map(([detail, n]) => ({ detail, n })); mistakes = {};
    tell({ type: 'lesson:level', id: G.id, level: li, stars: Math.max(1, Math.round(firstTry / G.levels[li].rounds * 3)) });
    if (list.length) tell({ type: 'lesson:mistakes', id: G.id, level: li, list });
    li++; ri = 0; firstTry = 0;
    if (li < G.levels.length) { say(`Level ${li + 1}: ${G.levels[li].name}`, 'good'); return setTimeout(round, 1200); }
    const all = G.levels.reduce((s, l) => s + l.rounds, 0);
    tell({ type: 'lesson:done', id: G.id, score: stars, total: all });
    $('#stage').innerHTML = `<h2>🏆 ${G.finale || 'You did it!'}</h2><p>⭐ ${stars} / ${all}</p>`;
  }
  const pick = a => a[Math.floor(Math.random() * a.length)];
  function speak(t) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = G.lang || 'en-GB'; speechSynthesis.speak(u); } catch (e) {} }
  return { start(def) { G = def; document.title = def.title; $('#t').textContent = def.emoji + ' ' + def.title; tell({ type: 'lesson:ready', id: def.id }); round(); }, speak, pick };
})();

/* ===== YOUR GAME: only this part changes ===== */
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
function choice(R, prompt, answer, options, why) {
  R.el.innerHTML = `<h2>${prompt}</h2>`;
  shuffle([answer, ...options]).forEach(o => {
    const b = document.createElement('button'); b.className = 'opt'; b.textContent = o;
    b.onclick = () => o === answer ? R.right() : R.wrong(why ? why(o) : null, b);
    R.el.append(b);
  });
  R.solve = () => R.say(`The answer is <b>${answer}</b>.`, 'good');
}
MINI.start({
  id: 'my-game', title: 'My Game', emoji: '🎮', tts: true,
  levels: [
    { name: 'Warm-up', rounds: 4, round(R) { choice(R, 'Which is a noun?', 'river', ['quickly', 'run', 'blue'], o => `"${o}" is not a person, place or thing.`); } },
    { name: 'Challenge', rounds: 4, round(R) { choice(R, 'Which is a verb?', 'jump', ['table', 'happy', 'under']); } }
  ],
  praise: ['Brilliant!', 'Spot on!'], finale: 'Word master!'
});
</script>
</body></html>
```

> Every subject example below plugs into this template (or into `LK.start`). Just replace the `levels`.

### 4.2 Reusable building blocks

**Drag and drop that works with mouse, touch and Apple Pencil:**

```js
function draggable(el, { onDrop }) {
  el.style.touchAction = 'none';
  el.addEventListener('pointerdown', e => {
    el.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
    el.classList.add('dragging');
    const move = ev => { el.style.position = 'fixed'; el.style.left = ev.clientX - dx + 'px'; el.style.top = ev.clientY - dy + 'px'; };
    const up = ev => {
      el.removeEventListener('pointermove', move); el.classList.remove('dragging');
      el.style.pointerEvents = 'none';
      const target = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('[data-drop]');
      el.style.pointerEvents = '';
      onDrop(target, el);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up, { once: true });
  });
}
```

**Seeded random**, so a teacher can replay the same version (as quiz-print does):

```js
function seeded(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32); }
const rnd = seeded(20261101);
const rint = (a, b) => a + Math.floor(rnd() * (b - a + 1));
```

**Sound without files** (Web Audio):

```js
const AC = new (window.AudioContext || window.webkitAudioContext)();
function tone(freq = 660, ms = 120, type = 'sine') {
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.value = freq; g.gain.value = 0.08;
  o.connect(g).connect(AC.destination); o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + ms / 1000); o.stop(AC.currentTime + ms / 1000);
}
const sfx = { right: () => { tone(660); setTimeout(() => tone(880), 90); }, wrong: () => tone(180, 220, 'square') };
```

---

## 5. Subject playbooks with code

Each playbook gives **game ideas by grade band**, the **mechanic = thinking** link, and **working code** for the core mechanic.

### 5.1 English

**Game ideas**

| Band | Game | Mechanic → skill |
|---|---|---|
| K–2 | **Sound Train:** drag letter carriages to build words as the engine says "c-a-t" | blending phonemes |
| K–2 | **Rhyme Rockets:** launch the rocket whose word rhymes | phonological awareness |
| 3–5 | **Sentence Surgeon:** a sentence's heartbeat flatlines; drag the right verb or punctuation to revive it | grammar and agreement |
| 3–5 | **Context Clue Detective:** a mystery word hides in a paragraph; tap the clue words, then choose its meaning | vocabulary from context |
| 6–8 | **Evidence Board:** highlight the sentences that prove a claim (CER) | reading comprehension, citing evidence |
| 6–8 | **Story Remix:** reorder story cards so the plot works (timeline engine) | narrative structure |
| 9–12 | **Debate Arena:** choose the strongest counter-argument; spot the fallacy | rhetoric, argument |
| all | **Say It Right:** speak the word; speech recognition checks it | pronunciation, fluency |

**Code: Evidence Board** (highlight the sentences that support a claim)

```js
function evidenceRound(R, { text, claim, evidence, distractorWhy }) {
  // text: array of sentences; evidence: indexes that support the claim
  R.el.innerHTML = `<h3>Claim: ${claim}</h3><p class="passage"></p><button class="opt" id="check">Check my evidence</button>`;
  const p = R.el.querySelector('.passage'), chosen = new Set();
  text.forEach((s, i) => {
    const span = document.createElement('span');
    span.textContent = s + ' '; span.tabIndex = 0; span.className = 'sent';
    span.onclick = () => { chosen.has(i) ? chosen.delete(i) : chosen.add(i); span.classList.toggle('hl'); };
    p.append(span);
  });
  R.hints = ['Which sentences give a fact or a reason, not just an opinion?', 'Look for numbers, results, or "because".'];
  R.solve = () => evidence.forEach(i => p.children[i].classList.add('hl', 'model'));
  R.el.querySelector('#check').onclick = () => {
    const missing = evidence.filter(i => !chosen.has(i)), extra = [...chosen].filter(i => !evidence.includes(i));
    if (!missing.length && !extra.length) R.right();
    else R.wrong(extra.length ? (distractorWhy[extra[0]] || 'One sentence you chose is an opinion, not evidence.') : `You found ${evidence.length - missing.length} of ${evidence.length} — one more proves it.`);
  };
}
// CSS: .sent.hl{background:#fff3a3} .sent.model{outline:2px dashed #16a34a}
```

**Code: Say It Right** (pronunciation with the Web Speech API: Chrome/Edge online; Safari 14.1+)

```js
function sayItRight(R, word, lang = 'en-GB') {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  R.el.innerHTML = `<h2>Say: <b>${word}</b></h2><button class="opt" id="mic">🎤 Hold to speak</button><button class="opt" id="hear">🔊 Hear it</button>`;
  R.el.querySelector('#hear').onclick = () => MINI.speak(word);
  if (!SR) { R.el.append('Microphone not available — tap the word you heard instead.'); return; }
  const rec = new SR(); rec.lang = lang; rec.maxAlternatives = 5; rec.interimResults = false;
  rec.onresult = e => {
    const heard = [...e.results[0]].map(a => a.transcript.trim().toLowerCase());
    heard.includes(word.toLowerCase()) ? R.right() : R.wrong(`I heard "${heard[0]}". Listen again and try — stress the first sound.`);
  };
  const mic = R.el.querySelector('#mic');
  mic.onpointerdown = () => rec.start();
  mic.onpointerup = () => rec.stop();
}
```

**Door-style English with existing engines** (no new code at all):

```js
{ name: 'Word sort', rounds: 5, verb: 'sorting',
  make() { return { prompt: 'Sort the words', bins: [{ id: 'n', label: 'Nouns' }, { id: 'v', label: 'Verbs' }, { id: 'a', label: 'Adjectives' }],
    items: [{ label: 'river', bin: 'n' }, { label: 'swim', bin: 'v' }, { label: 'shiny', bin: 'a' }, { label: 'teacher', bin: 'n' }] }; } },
{ name: 'Story order', rounds: 4, verb: 'timeline',
  make() { return { prompt: 'Put the story in order', items: ['Sara found a map', 'She followed the stars', 'She reached AlUla', 'She found the old well'] }; } },
{ name: 'Grammar gaps', rounds: 5, verb: 'cloze',
  make() { return { prompt: 'Choose the right words', parts: ['The boys ', { answer: 'were', options: ['was', 'were'] }, ' playing while it ', { answer: 'rained', options: ['rained', 'rains'] }, '.'] }; } }
```

---

### 5.2 Maths (beyond today's games)

**New directions**

| Band | Game | Mechanic → skill |
|---|---|---|
| K–2 | **Ten-Frame Bakery:** fill trays of 10 dates; "how many more to 10?" | number bonds |
| 3–5 | **Number Line Archery:** drag the arrow to where 3/8 lives | fraction magnitude |
| 6–8 | **Equation Balance:** a two-pan scale; do the same to both sides to free x | solving equations |
| 6–8 | **Ratio Juice Bar:** mix mango:orange in the ratio the customer orders | ratio and proportion |
| 9–12 | **Graph Pilot:** steer a plane by changing m and c so the line hits the runway | linear functions |
| 9–12 | **Probability Casino (fair):** predict, then simulate 1,000 trials | experimental vs theoretical probability |

**Code: Number Line Archery** (drag with snapping, and feedback on distance)

```js
function numberLine(R, { num, den, max = 1 }) {
  const W = 600, svgNS = 'http://www.w3.org/2000/svg';
  R.el.innerHTML = `<h2>Shoot the arrow to <b>${num}/${den}</b></h2>`;
  const svg = document.createElementNS(svgNS, 'svg'); svg.setAttribute('viewBox', `0 0 ${W + 40} 120`);
  svg.innerHTML = `<line x1="20" y1="70" x2="${W + 20}" y2="70" stroke="#141a33" stroke-width="4"/>` +
    Array.from({ length: den * max + 1 }, (_, k) => `<line x1="${20 + k * W / (den * max)}" y1="60" x2="${20 + k * W / (den * max)}" y2="80" stroke="#141a33" stroke-width="${k % den ? 2 : 4}"/>`).join('') +
    `<text x="20" y="105">0</text><text x="${W + 10}" y="105">${max}</text><g id="arrow"><path d="M0 0 L-10 -24 L10 -24 Z" fill="#e0302f"/></g>`;
  R.el.append(svg);
  const arrow = svg.querySelector('#arrow'); let x = 20;
  const place = v => { x = Math.max(20, Math.min(W + 20, v)); arrow.setAttribute('transform', `translate(${x},62)`); };
  place(20 + W / 2);
  const toSvg = e => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()).x; };
  svg.addEventListener('pointerdown', e => { svg.setPointerCapture(e.pointerId); place(toSvg(e)); svg.onpointermove = ev => place(toSvg(ev)); });
  svg.addEventListener('pointerup', () => {
    svg.onpointermove = null;
    const val = (x - 20) / W * max, target = num / den, off = Math.abs(val - target);
    if (off <= 0.5 / (den * max) * 0.9) R.right();
    else R.wrong(val > target ? `Too far — ${num}/${den} is ${num} of ${den} equal jumps from 0.` : `Not far enough — count ${num} jumps of 1/${den}.`, svg);
  });
  R.solve = () => place(20 + num / den / max * W);
}
```

**Code: Equation Balance** (do the same to both sides)

```js
function balance(R) {
  const x = LK.rint(2, 9), a = LK.rint(2, 5), b = LK.rint(1, 9), c = a * x + b;  // a·x + b = c
  let L = { a, b }, Rt = { c };
  const draw = () => R.el.innerHTML = `<h2>${L.a > 1 ? L.a : ''}x ${L.b ? '+ ' + L.b : ''} = ${Rt.c}</h2>
    <div class="moves"><button class="opt" data-m="sub">− ${L.b} both sides</button><button class="opt" data-m="div">÷ ${L.a} both sides</button></div>`;
  draw();
  R.el.addEventListener('click', e => {
    const m = e.target.dataset.m; if (!m) return;
    if (m === 'sub' && L.b) { Rt.c -= L.b; L.b = 0; }
    else if (m === 'div' && L.a > 1) { if (L.b) return R.wrong('Undo the + first: it is the last thing done to x.'); Rt.c /= L.a; L.a = 1; }
    draw();
    if (L.a === 1 && !L.b) Rt.c === x ? R.right() : R.wrong();
  });
  R.hints = ['What was done to x last? Undo that first.', `Take away ${b} from both sides.`];
}
```

---

### 5.3 Science (concept games)

| Band | Game | Mechanic → concept |
|---|---|---|
| K–2 | **Desert or Sea?** sort animals to their habitat (sorting engine) | habitats, adaptation |
| 3–5 | **Ecosystem Jenga:** remove a species and watch the web collapse | food webs, interdependence |
| 3–5 | **Shadow Clock:** move the sun; the shadow changes | Earth's rotation, light |
| 6–8 | **Particle Party:** heat the box; particles speed up, melt, boil | states of matter, kinetic theory |
| 6–8 | **Cell City:** drag organelles to their "city jobs" | cell structure and function |
| 9–12 | **Reaction Balancer:** add molecules until atoms balance | conservation of mass |

**Code: Particle Party** (states of matter on a canvas with a temperature slider)

```js
function particles(R) {
  R.el.innerHTML = `<h3>Make the water <b id="goal"></b></h3><canvas width="520" height="320" style="width:100%;background:#eaf6ff;border-radius:16px"></canvas>
    <label>🌡 Temperature <input type="range" min="-30" max="130" value="20" id="T"></label> <b id="tv">20 °C</b>
    <button class="opt" id="ok">This is it!</button>`;
  const goals = [['solid (ice)', t => t < 0], ['liquid', t => t > 5 && t < 95], ['gas (steam)', t => t > 105]];
  const [name, ok] = goals[R.index % 3]; R.el.querySelector('#goal').textContent = name;
  const cv = R.el.querySelector('canvas'), ctx = cv.getContext('2d'), T = R.el.querySelector('#T');
  const P = Array.from({ length: 60 }, (_, i) => ({ x: 60 + (i % 10) * 40, y: 220 + Math.floor(i / 10) * 16, vx: 0, vy: 0, hx: 60 + (i % 10) * 40, hy: 220 + Math.floor(i / 10) * 16 }));
  R.every(() => {
    const t = +T.value; R.el.querySelector('#tv').textContent = t + ' °C';
    const speed = Math.max(0.2, (t + 40) / 25);
    ctx.clearRect(0, 0, 520, 320);
    for (const p of P) {
      if (t < 0) { p.x += (p.hx - p.x) * 0.2 + (Math.random() - .5) * speed * .6; p.y += (p.hy - p.y) * 0.2 + (Math.random() - .5) * speed * .6; }      // vibrate in place
      else {
        p.vx += (Math.random() - .5) * speed * .5; p.vy += (Math.random() - .5) * speed * .5 + (t < 100 ? 0.15 : -0.02);   // liquids sink, gas fills
        p.vx *= 0.96; p.vy *= 0.96; p.x += p.vx; p.y += p.vy;
        if (p.x < 8 || p.x > 512) p.vx *= -1; if (p.y < 8 || p.y > 312) p.vy *= -1;
        p.x = Math.max(8, Math.min(512, p.x)); p.y = Math.max(t < 100 ? 150 : 8, Math.min(312, p.y));
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, 7); ctx.fillStyle = '#2b7de9'; ctx.fill();
    }
  }, 33);
  R.el.querySelector('#ok').onclick = () => ok(+T.value) ? R.right() : R.wrong(+T.value < 0 ? 'The particles are locked in place: that is a solid.' : +T.value > 100 ? 'They fly apart and fill the box: a gas.' : 'They slide past each other but stay together: a liquid.');
}
```

---

### 5.4 Science lab simulations

A good virtual lab is not an animation. It is a **real inquiry loop**:

```
Question → Hypothesis → Choose variables (independent / controlled) → Run trials
   → Data table (with realistic noise) → Graph → Conclusion (CER) → Reflect / extend
```

**Design rules**

- **Only one variable changes.** The lab should *notice* when a pupil changes two at once ("Unfair test: you changed the length *and* the mass").
- **Realistic noise:** measurements vary slightly, so pupils learn why we repeat trials and average.
- **Safety first** (a pre-lab quiz unlocks the bench) for chemistry and electricity.
- **Claim–Evidence–Reasoning** at the end, with the pupil's own data.
- **Local relevance:** desalination at Jubail, solar panels in NEOM, date-palm irrigation, Hajj crowd flow.

| Band | Lab | Variables |
|---|---|---|
| 3–5 | **Plant Growth Station:** light, water, soil → height over days (time-lapse) | light (IV), height (DV) |
| 6–8 | **Pendulum Lab:** length, mass, angle → period | which changes the period? (only length) |
| 6–8 | **Dissolving Race:** temperature, stirring, grain size → time to dissolve sugar | rate factors |
| 9–12 | **Circuit Builder:** batteries, resistors, bulbs → current, voltage (Ohm's law) | V = IR, series/parallel |
| 9–12 | **Titration:** drop by drop until the indicator turns | neutralisation, molarity |

**Code: Pendulum Lab** (fair-test detection, noisy data, table, graph and CER)

```js
function pendulumLab(el, onDone) {
  el.innerHTML = `
    <h2>🔬 What changes how long a pendulum takes to swing?</h2>
    <label>Hypothesis: <select id="hyp"><option>length</option><option>mass</option><option>angle</option></select> changes the period.</label>
    <div class="bench">
      <label>Length (m) <input type="range" id="L" min="0.2" max="2" step="0.1" value="1"></label>
      <label>Mass (kg) <input type="range" id="M" min="0.1" max="2" step="0.1" value="0.5"></label>
      <label>Angle (°) <input type="range" id="A" min="5" max="30" step="5" value="10"></label>
      <button class="opt" id="run">▶ Time 10 swings</button>
    </div>
    <canvas id="cv" width="300" height="260"></canvas>
    <table id="tbl"><tr><th>#</th><th>L</th><th>m</th><th>θ</th><th>Period (s)</th></tr></table>
    <canvas id="graph" width="420" height="220"></canvas>
    <div id="cer" hidden>
      <p><b>Claim:</b> <select id="claim"><option>Only length changes the period</option><option>Mass changes the period</option><option>Angle changes the period</option></select></p>
      <p><b>Evidence:</b> pick two rows from your table that prove it <input id="ev" placeholder="e.g. 1,3"></p>
      <button class="opt" id="sub">Submit conclusion</button>
    </div>
    <p class="coach" id="msg"></p>`;
  const $ = s => el.querySelector(s), rows = [];
  let last = null, t0 = performance.now();
  const msg = (t, k = '') => { $('#msg').className = 'coach ' + k; $('#msg').innerHTML = t; };
  // the animation (real physics: θ'' = -(g/L)·sin θ)
  const ctx = $('#cv').getContext('2d'); let th = 0.17, w = 0;
  (function swing() {
    const L = +$('#L').value, g = 9.81, dt = 1 / 60;
    w += -(g / L) * Math.sin(th) * dt; th += w * dt;
    const px = 150 + Math.sin(th) * L * 110, py = 20 + Math.cos(th) * L * 110;
    ctx.clearRect(0, 0, 300, 260); ctx.beginPath(); ctx.moveTo(150, 20); ctx.lineTo(px, py); ctx.stroke();
    ctx.beginPath(); ctx.arc(px, py, 8 + +$('#M').value * 6, 0, 7); ctx.fillStyle = '#e0912f'; ctx.fill();
    if (el.isConnected) requestAnimationFrame(swing);
  })();
  $('#A').oninput = () => { th = (+$('#A').value) * Math.PI / 180; w = 0; };
  $('#run').onclick = () => {
    const now = { L: +$('#L').value, M: +$('#M').value, A: +$('#A').value };
    if (last) {
      const changed = ['L', 'M', 'A'].filter(k => now[k] !== last[k]);
      if (changed.length > 1) msg(`⚠ Unfair test: you changed <b>${changed.join(' and ')}</b> at once. Change one thing, keep the rest the same.`, 'bad');
      else msg('Good — one variable changed. Repeat it to check your result.');
    }
    // true period (small-angle + a tiny angle correction) + human stopwatch noise
    const T = 2 * Math.PI * Math.sqrt(now.L / 9.81) * (1 + Math.pow(now.A * Math.PI / 180, 2) / 16);
    const measured = +(T + (Math.random() - 0.5) * 0.06).toFixed(2);
    rows.push({ ...now, T: measured }); last = now;
    $('#tbl').insertAdjacentHTML('beforeend', `<tr><td>${rows.length}</td><td>${now.L}</td><td>${now.M}</td><td>${now.A}</td><td>${measured}</td></tr>`);
    drawGraph(); if (rows.length >= 4) $('#cer').hidden = false;
  };
  function drawGraph() {
    const g = $('#graph').getContext('2d'); g.clearRect(0, 0, 420, 220);
    g.strokeStyle = '#141a33'; g.strokeRect(40, 10, 360, 180); g.fillText('length (m)', 180, 215); g.fillText('T (s)', 2, 100);
    rows.forEach(r => { g.beginPath(); g.arc(40 + r.L / 2 * 360, 190 - r.T / 3 * 180, 5, 0, 7); g.fillStyle = '#0e8a8f'; g.fill(); });
  }
  $('#sub').onclick = () => {
    const ids = $('#ev').value.split(/[^\d]+/).map(Number).filter(Boolean).map(i => rows[i - 1]).filter(Boolean);
    const claimOk = $('#claim').selectedIndex === 0;
    const fair = ids.length === 2 && ids[0].M === ids[1].M && ids[0].A === ids[1].A && ids[0].L !== ids[1].L;
    if (claimOk && fair) { msg('✅ Strong conclusion: your two trials changed only the length, and the period changed.', 'good'); onDone && onDone(true); }
    else msg(!claimOk ? 'Look at your table again: when only the mass changed, did the period change?' : 'Pick two trials where only the length is different.', 'bad');
  };
}
```

**Code: Circuit, Ohm's law core** (the model, separate from the drawing)

```js
// series: R = R1 + R2 …, parallel: 1/R = 1/R1 + 1/R2 …
const series = rs => rs.reduce((a, b) => a + b, 0);
const parallel = rs => 1 / rs.reduce((a, b) => a + 1 / b, 0);
function bulbs(V, layout, rs) {                 // returns current and brightness per bulb
  const Rt = layout === 'series' ? series(rs) : parallel(rs), I = V / Rt;
  return rs.map(r => {
    const Ib = layout === 'series' ? I : V / r, P = Ib * Ib * r;      // power → brightness
    return { I: +Ib.toFixed(3), P: +P.toFixed(2), state: P > 5 ? 'burnt' : P > 0.5 ? 'bright' : P > 0.05 ? 'dim' : 'off' };
  });
}
// Challenge: "Light all 3 stadium bulbs brightly without burning any" → pupil picks V, layout, resistors.
```

---

### 5.5 Arabic

Arabic needs its own care: **RTL layout, letters that change shape by position, tashkeel (harakat), root-and-pattern morphology, and i'rab**.

| Band | Game | Mechanic → skill |
|---|---|---|
| K–2 | **حروف الواحة (Oasis Letters):** catch the falling letter you hear (balloon engine, `ar-SA` TTS) | letter–sound |
| K–2 | **أشكال الحرف (Letter Shapes):** the same letter in four positions; snap each into its place in a word | isolated / initial / medial / final forms |
| 3–5 | **الحركات (Harakat Garden):** add fatha, damma or kasra so the flower blooms with the right sound | tashkeel and reading accuracy |
| 3–5 | **صانع الكلمات (Root Builder):** drop the root ك ت ب into patterns (كاتب، مكتوب، مكتبة) | root and pattern, vocabulary |
| 6–8 | **محكمة الإعراب (I'rab Court):** label each word (فاعل، مفعول به، مبتدأ، خبر) and set its ending | grammar |
| 9–12 | **البلاغة (Rhetoric Hunt):** find the تشبيه or استعارة in poetry (highlight engine from §5.1) | literary devices |

**RTL setup** (one line, then the browser does the rest):

```html
<html lang="ar" dir="rtl">
<link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@500;700&family=Amiri&display=swap" rel="stylesheet">
<style>body{font-family:"Noto Kufi Arabic",sans-serif} .quran,.poem{font-family:"Amiri",serif;font-size:1.4em}</style>
```

> **Tips:**
> - Use `dir="auto"` on inputs, `<bdi>` around numbers or codes inside Arabic text, and CSS logical properties (`margin-inline-start`) so the layout flips correctly.
> - Keep digits as the curriculum expects (٠١٢ or 012), and keep them consistent. Fikr's word-problem checker enforces that the same numbers appear in English and Arabic.

**Code: Letter-positions game** (the browser shapes the letters for you; join them with the zero-width joiner)

```js
const ZWJ = '‍';
// any letter in each of its positions, drawn by the font itself
const forms = ch => ({ isolated: ch, initial: ch + ZWJ, medial: ZWJ + ch + ZWJ, final: ZWJ + ch });
// letters that never join to the next letter
const NON_JOINING = new Set(['ا', 'أ', 'إ', 'آ', 'د', 'ذ', 'ر', 'ز', 'و', 'ؤ', 'ة']);

function positionOf(word, i) {
  const prevJoins = i > 0 && !NON_JOINING.has(word[i - 1]);
  const nextExists = i < word.length - 1 && !NON_JOINING.has(word[i]);
  return prevJoins && nextExists ? 'medial' : prevJoins ? 'final' : nextExists ? 'initial' : 'isolated';
}

function letterShapeRound(R, word = 'كتب') {
  const i = LK.rint(0, word.length - 1), ch = word[i], want = positionOf(word, i);
  R.el.innerHTML = `<h2 dir="rtl">أي شكل للحرف «${ch}» في كلمة <b>${word}</b>؟</h2><div dir="rtl" class="row"></div>`;
  const names = { isolated: 'منفصل', initial: 'أول الكلمة', medial: 'وسط الكلمة', final: 'آخر الكلمة' };
  Object.entries(forms(ch)).forEach(([pos, glyph]) => {
    const b = document.createElement('button'); b.className = 'opt';
    b.innerHTML = `<span style="font-size:2.4em">${glyph}</span><br><small>${names[pos]}</small>`;
    b.onclick = () => pos === want ? R.right() : R.wrong(`انظر إلى الحرف قبله وبعده: هل يتصل بهما؟`, b);
    R.el.querySelector('.row').append(b);
  });
  MINI.speak(word); // with G.lang = 'ar-SA'
}
```

**Code: Root builder** (root + pattern → word, with meaning)

```js
// patterns with placeholders ف ع ل for the three root letters
const PATTERNS = [
  { p: 'فاعِل', meaning: 'the doer' }, { p: 'مَفعول', meaning: 'the thing done' },
  { p: 'مَفعَلة', meaning: 'the place of' }, { p: 'فِعال', meaning: 'the tool / noun' }
];
const applyRoot = ([f, a, l], pat) => pat.replace('ف', f).replace('ع', a).replace('ل', l);
// applyRoot(['ك','ت','ب'], 'فاعِل') → 'كاتِب'   applyRoot(['ك','ت','ب'], 'مَفعَلة') → 'مَكتَبة'

function rootRound(R, root = ['د', 'ر', 'س']) {
  const target = LK.pick(PATTERNS), word = applyRoot(root, target.p);
  R.el.innerHTML = `<h2 dir="rtl">ابنِ كلمة من الجذر <b>${root.join(' ')}</b> تعني: ${target.meaning}</h2><div dir="rtl" class="row"></div>`;
  LK.shuffle(PATTERNS).forEach(pt => {
    const w = applyRoot(root, pt.p), b = document.createElement('button'); b.className = 'opt'; b.textContent = w;
    b.onclick = () => w === word ? R.right() : R.wrong(`«${w}» على وزن ${pt.p}: معناه ${pt.meaning}.`, b);
    R.el.querySelector('.row').append(b);
  });
}
```

**Tashkeel check** (compare with harakat, or ignore them):

```js
const HARAKAT = /[ً-ْٰ]/g;                 // fathatan … sukun, superscript alef
const bare = s => s.replace(HARAKAT, '');                  // compare the letters only
const sameWithHarakat = (a, b) => a.normalize('NFC') === b.normalize('NFC');
```

---

### 5.6 Computer Science

| Band | Game | Mechanic → concept |
|---|---|---|
| K–2 | **Robot Camel Commands:** arrow cards lead the camel to the oasis (unplugged on screen) | sequencing |
| 3–5 | **Loop Lantern:** the fewest blocks lights every lantern (loops beat repetition) | loops, efficiency |
| 3–5 | **Bug Hunt:** a program almost works; find the one wrong block | debugging |
| 6–8 | **Sorting Souq:** sort crates by weight with only "compare" and "swap", counting your moves | algorithms (bubble vs selection) |
| 6–8 | **Binary Lanterns:** flip lanterns to show a number in binary | data representation |
| 9–12 | **Packet Caravan:** route packets through a network; links fail | networks, routing |
| 9–12 | **Cipher Room:** break Caesar ciphers with frequency analysis | cryptography |

**Code: block-program robot maze** (a tiny safe interpreter, no `eval`)

```js
// program: ['F','F','L', {repeat:3, body:['F','R']}] on a grid; '#' = wall, 'G' = goal
function runProgram(prog, grid, start = { x: 0, y: 0, d: 1 }, maxSteps = 200) {
  const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];          // d: 0 up, 1 right, 2 down, 3 left
  const s = { ...start }, trail = [{ ...s }]; let steps = 0;
  function exec(list) {
    for (const op of list) {
      if (++steps > maxSteps) throw new Error('Too many steps — is there an endless loop?');
      if (op.repeat) { for (let k = 0; k < op.repeat; k++) exec(op.body); continue; }
      if (op === 'L') s.d = (s.d + 3) % 4;
      else if (op === 'R') s.d = (s.d + 1) % 4;
      else if (op === 'F') {
        const nx = s.x + DX[s.d], ny = s.y + DY[s.d];
        if (grid[ny]?.[nx] === undefined || grid[ny][nx] === '#') throw new Error(`Bump! A wall at step ${steps}.`);
        s.x = nx; s.y = ny;
      }
      trail.push({ ...s });
    }
  }
  try { exec(prog); } catch (e) { return { ok: false, why: e.message, trail }; }
  return { ok: grid[s.y][s.x] === 'G', why: grid[s.y][s.x] === 'G' ? '' : 'The robot stopped before the goal.', trail, blocks: countBlocks(prog) };
}
const countBlocks = p => p.reduce((n, op) => n + (op.repeat ? 1 + countBlocks(op.body) : 1), 0);

// in a round: stars for efficiency — the mechanic rewards loops
// const r = runProgram(prog, GRID); r.ok ? (r.blocks <= PAR ? R.right() : R.right({ say: `Works! Can you do it in ${PAR} blocks with a loop?` })) : R.wrong(r.why);
```

> **Want real blocks?** [Blockly](https://developers.google.com/blockly) (Apache-2.0) gives drag-and-drop blocks; generate the `prog` array from the workspace and keep the safe interpreter above. Never `eval` pupil code.

**Code: Binary Lanterns**

```js
function binaryRound(R) {
  const target = LK.rint(1, 31), bits = [16, 8, 4, 2, 1], on = new Set();
  R.el.innerHTML = `<h2>Light the lanterns to make <b>${target}</b></h2><div class="row"></div><p id="sum">0</p>`;
  bits.forEach(v => {
    const b = document.createElement('button'); b.className = 'opt'; b.innerHTML = `🏮<br>${v}`;
    b.onclick = () => { on.has(v) ? on.delete(v) : on.add(v); b.classList.toggle('lit');
      const sum = [...on].reduce((a, c) => a + c, 0); R.el.querySelector('#sum').textContent = sum + ' = ' + bits.map(x => on.has(x) ? 1 : 0).join('');
      if (sum === target) R.right(); };
    R.el.querySelector('.row').append(b);
  });
  R.hints = ['Start with the biggest lantern that fits.', `${target} = ${bits.filter(x => target & x).join(' + ')}`];
}
```

---

### 5.7 Robotics

Two tracks:

1. **Virtual robots** (every pupil, every iPad): sensors, motors and control logic in a simulation.
2. **Real robots** (micro:bit, LEGO SPIKE, Arduino) connected from the browser with **Web Bluetooth** or **Web Serial** in Chrome or Edge (not iPad Safari).

| Band | Game | Concept |
|---|---|---|
| 3–5 | **Rover Rescue:** program a rover on Mars-red sand to reach the stranded astronaut | sequencing, coordinates |
| 6–8 | **Line Follower:** tune two light sensors so the robot follows the track | sensors, if/else, feedback |
| 6–8 | **Warehouse Bot:** pick and place parcels in the fewest moves | path planning |
| 9–12 | **PID Balance:** tune P, I and D so a robot holds a line without wobbling | control systems |
| 9–12 | **Swarm Drones (NEOM light show):** write one rule set that draws a shape with 20 drones | emergent behaviour |

**Code: virtual line-follower** (sensors → rule → motors)

```js
function lineFollower(canvas, rule) {
  // rule(left, right) → { l, r } motor speeds; sensors return 1 on the dark line, 0 on white
  const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
  const bot = { x: 80, y: H / 2, a: 0 };
  const track = new Path2D(); track.ellipse(W / 2, H / 2, W * 0.38, H * 0.32, 0, 0, Math.PI * 2);
  const onLine = (x, y) => { ctx.lineWidth = 24; return ctx.isPointInStroke(track, x, y) ? 1 : 0; };
  let laps = 0, off = 0;
  (function step() {
    const sx = a => bot.x + Math.cos(bot.a + a) * 18, sy = a => bot.y + Math.sin(bot.a + a) * 18;
    const L = onLine(sx(-0.5), sy(-0.5)), Rr = onLine(sx(0.5), sy(0.5));
    let m; try { m = rule(L, Rr); } catch (e) { m = { l: 0, r: 0 }; }
    const l = Math.max(-2, Math.min(2, m.l)), r = Math.max(-2, Math.min(2, m.r));
    bot.a += (r - l) * 0.04; bot.x += Math.cos(bot.a) * (l + r); bot.y += Math.sin(bot.a) * (l + r);
    off = L || Rr ? 0 : off + 1;
    ctx.clearRect(0, 0, W, H); ctx.lineWidth = 24; ctx.strokeStyle = '#222'; ctx.stroke(track);
    ctx.save(); ctx.translate(bot.x, bot.y); ctx.rotate(bot.a); ctx.fillStyle = '#0e8a8f'; ctx.fillRect(-14, -10, 28, 20); ctx.restore();
    [[-0.5, L], [0.5, Rr]].forEach(([a, v]) => { ctx.beginPath(); ctx.arc(sx(a), sy(a), 4, 0, 7); ctx.fillStyle = v ? '#ffd23f' : '#e0302f'; ctx.fill(); });
    if (off > 90) return canvas.dispatchEvent(new CustomEvent('lost'));
    if (canvas.isConnected) requestAnimationFrame(step);
  })();
}
// The pupil fills in the rule with if/else blocks:
// lineFollower(cv, (L, R) => L && R ? { l: 1.5, r: 1.5 } : L ? { l: 0.3, r: 1.5 } : R ? { l: 1.5, r: 0.3 } : { l: 0.8, r: -0.8 });
```

**Code: talk to a real micro:bit over Web Serial** (Chrome/Edge on laptops)

```js
async function connectMicrobit(onLine) {
  if (!('serial' in navigator)) throw new Error('Use Chrome or Edge on a laptop for real robots.');
  const port = await navigator.serial.requestPort();            // the pupil picks the device
  await port.open({ baudRate: 115200 });
  const writer = port.writable.getWriter(), enc = new TextEncoder();
  const reader = port.readable.pipeThrough(new TextDecoderStream()).getReader();
  (async () => { let buf = ''; for (;;) { const { value, done } = await reader.read(); if (done) break; buf += value;
      let i; while ((i = buf.indexOf('\n')) >= 0) { onLine(buf.slice(0, i).trim()); buf = buf.slice(i + 1); } } })();
  return { send: cmd => writer.write(enc.encode(cmd + '\n')) };   // e.g. send('F 50') → micro:bit drives forward
}
// On the micro:bit (MakeCode, Python): read serial lines, drive motors, print sensor values back each 100 ms.
```

---

### 5.8 AI literacy

The aim is that pupils **understand** AI (data, patterns, bias, limits, ethics), not only use it. That fits the AI curriculum push in Saudi schools (SDAIA).

| Band | Game | Concept |
|---|---|---|
| 3–5 | **Teach the Robot:** sort fruit photos to train it; it guesses new ones | learning from examples |
| 3–5 | **Is it AI?** sort everyday things: calculator, voice assistant, thermostat… | what AI is and isn't |
| 6–8 | **Biased Bot:** train with only red apples; watch it fail on green ones, then fix the data | data bias |
| 6–8 | **Decision Tree Detective:** build yes/no questions that classify animals | decision trees, features |
| 9–12 | **Perceptron Playground:** drag points; watch the line learn to separate them | linear classifiers, training |
| 9–12 | **Prompt Lab:** improve a prompt until the AI's answer meets a rubric (with a teacher-safe proxy) | prompting, evaluation, critical thinking |
| all | **Deepfake or Real?** spot the clues, then discuss | media literacy, ethics |

**Code: Teach the Robot** (a k-nearest-neighbours classifier on the pupil's own drawings; runs fully in the browser)

```js
// 1) the pupil draws on a 28×28 pad → features (downsampled pixels)
function features(canvas) {
  const s = 14, small = document.createElement('canvas'); small.width = small.height = s;
  const c = small.getContext('2d'); c.drawImage(canvas, 0, 0, s, s);
  const d = c.getImageData(0, 0, s, s).data, out = [];
  for (let i = 3; i < d.length; i += 4) out.push(d[i] / 255);   // ink (alpha) per cell
  return out;
}
// 2) kNN: label a new drawing by its k nearest training examples
const examples = [];                                           // { x: features, label: '⭐' | '🌙' | '☀️' }
const dist = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));
function classify(x, k = 3) {
  const near = examples.map(e => ({ e, d: dist(x, e.x) })).sort((p, q) => p.d - q.d).slice(0, k);
  const votes = {}; near.forEach(n => votes[n.e.label] = (votes[n.e.label] || 0) + 1);
  const best = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];
  return { label: best?.[0], confidence: best ? best[1] / k : 0 };
}
// Game loop: Train (draw 5 of each) → Test (draw a new one) → the robot guesses with confidence
// → Bias mission: "Only teach it big stars — does it know a small star?" → pupils add varied data.
```

**Code: Perceptron Playground** (watch the model learn)

```js
function perceptron(points, epochs = 30, lr = 0.1) {          // points: [{x, y, label: +1|-1}] in 0..1
  let w = [Math.random() - .5, Math.random() - .5], b = 0; const history = [];
  for (let e = 0; e < epochs; e++) {
    let errors = 0;
    for (const p of points) {
      const guess = Math.sign(w[0] * p.x + w[1] * p.y + b) || 1;
      if (guess !== p.label) { w[0] += lr * p.label * p.x; w[1] += lr * p.label * p.y; b += lr * p.label; errors++; }
    }
    history.push({ w: [...w], b, errors });                    // animate the line epoch by epoch
    if (!errors) break;
  }
  return history;
}
// Draw each epoch's line y = -(w0·x + b)/w1 and the error count: pupils SEE learning converge,
// then add a point that cannot be separated with a straight line → why we need bigger models.
```

**AI tutor or Prompt Lab, safely.** Never put an AI API key in a page. Call **your own** server function (for Fikr, a Supabase edge function) that holds the key, checks the pupil's access code, limits length and rate, and filters content:

```js
// pupil page → your edge function (the key lives only on the server)
async function askTutor(question, lessonCode) {
  const r = await fetch('https://<project>.supabase.co/functions/v1/ai-tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: pupilAccessCode, lesson: lessonCode, question: question.slice(0, 400) })
  });
  if (!r.ok) throw new Error('The tutor is resting — ask your teacher.');
  return (await r.json()).answer;      // the server adds a system prompt: hints only, age-appropriate, no answers
}
```

> **Design guardrails for AI features with children:**
> - hints, not answers;
> - log for the teacher;
> - teacher on/off switch per class;
> - no personal data in prompts;
> - daily limits;
> - always "check with your teacher";
> - follow your school's and PDPL (Saudi data protection) rules.

---

## 6. Data, assessment, testing and shipping

### 6.1 What to record (and why)

| Event | Fields | Used for |
|---|---|---|
| open / ready | game, lesson, pupil | engagement |
| progress | round done / total, stars, streak | teacher's live view |
| mistake | `why` category + count | reteaching (common-mistakes report) |
| level | level, stars (first-try accuracy) | mastery per level |
| done | score / total | **mastery ≥ 70%**, certificates, reports |

Keep **misconception categories** stable (e.g. `add-denominators`, `zeros-count`, `unfair-test`, `subject-verb`). A short, consistent list is worth more to a teacher than free text.

### 6.2 Mastery rule

Fikr's lesson certificate is a good pattern for every subject:

> A lesson is mastered when the pupil **answers the video question right**, scores **≥ 70% in the lesson game**, and **≥ 70% in the practice blitz**.

For a new subject, keep the three-evidence rule: **check for understanding + game ≥ 70% + practice ≥ 70%**.

### 6.3 Test every game automatically

```js
// tests/e2e/my-game.spec.mjs (Playwright): the game reports to its parent and can be completed
import { test, expect } from '@playwright/test';
test('my game posts ready, progress and done', async ({ page }) => {
  await page.goto('/');                                      // any page on the same site hosts the frame
  await page.evaluate(() => {
    window.msgs = []; addEventListener('message', e => msgs.push(e.data));
    document.body.innerHTML = '<iframe id="f" src="/games/my-game.html" style="width:900px;height:700px"></iframe>';
  });
  const f = page.frameLocator('#f');
  for (let i = 0; i < 8; i++) await f.locator('.opt', { hasText: /river|jump/ }).first().click();   // play the right answers
  await expect.poll(() => page.evaluate(() => msgs.map(m => m.type))).toContain('lesson:done');
});
```

The real Fikr kit also exposes `LK.test.pass()` and `LK.test.fail()`, so tests and screenshots can drive any game without knowing its mechanic.

### 6.4 Accessibility checklist

- Touch targets ≥ 44 px (≥ 64 px for K–2), visible focus, a keyboard path for every mechanic.
- `aria-live="polite"` on the coach; read-aloud button; `prefers-reduced-motion` turns off bursts and shakes.
- Never colour alone: pair red/green with icons (✓ ✗) and words.
- RTL tested for Arabic, and `<bdi>` around mixed-direction bits.
- Works offline (Fikr's build refuses network access) and on a 5-year-old iPad.

### 6.5 Shipping a new game in Fikr (step by step)

1. Write `playhub/lessons/games/<id>.js` (+ `.css`) with `LK.start({...})`, or a door file with `DOOR.start({...})` if an engine fits.
2. Add it to `playhub/lessons/catalog.mjs`: `{ id, title, emoji, topic, blurb, lessons: ['5.4'] }`.
3. Run `node playhub/tools/build-lessons.mjs`, which writes `public/playhub/lessons/<id>.html` and checks there is no network access.
4. Copy or build into `public/` and add a Playwright test.
5. The games page picks it up from the catalog: it appears on the lesson card, the Year map and "This week's games", and its `lesson:done` counts toward the certificate.

**For a new subject** (English, Arabic, Science…), add a `subject` field to catalog entries and a subject filter on the games page. The message contract and the certificate rule stay the same.

---

## 7. Checklist and idea bank

### 7.1 Before you build: the one-page game brief

```
Lesson / standard:          e.g. Grade 7 Science — rate of reaction
Observable action:          predict and test how temperature changes dissolving time
Top 3 misconceptions:       1) more stirring = more sugar dissolves  2) changing two things at once  3) hot = always faster for everything
Mechanic (= the thinking):  a dissolving race where only one variable can change per trial
CRA levels:                 L1 race with real cups → L2 particle view → L3 predict from a graph
Feedback "why" lines:       one per misconception
Hints ladder:               strategy → step → near-solution
Win condition:              CER conclusion supported by two fair trials
Local context:              Saudi qahwa vs. iced tea at a Riyadh café
Data:                       trials, unfair-test count, CER result → lesson:done score
```

### 7.2 Quality bar (score each 1–3)

| | 1 | 3 |
|---|---|---|
| Mechanic = thinking | the game is a wrapper around a quiz | you cannot win without doing the skill |
| Feedback | right/wrong only | explains the misconception, with a hint ladder |
| Progression | random difficulty | concrete → representational → abstract |
| Identity | generic | Saudi context, the pupil's language, the Fikr world |
| Data | none | misconceptions and mastery reach the teacher |
| Access | mouse only, English only | touch, keyboard, TTS, RTL, offline |

### 7.3 Idea bank (pick, remix, build)

- **English:** Sentence Surgeon · Evidence Board · Context Clue Detective · Story Remix · Debate Arena · Say It Right · Spelling Bee Hive (build words from honeycomb letters) · Poetry Beat (tap the syllable stress).
- **Maths:** Number Line Archery · Equation Balance · Ratio Juice Bar · Graph Pilot · Ten-Frame Bakery · Fair Casino · Riyal Market Till · Garden Fence (area vs perimeter) · Protractor Golf.
- **Science:** Particle Party · Ecosystem Jenga · Cell City · Shadow Clock · Reaction Balancer · Desert Survival (adaptations) · Water Cycle Journey (be a water drop from the Red Sea to Abha's rain).
- **Labs:** Pendulum · Circuit Stadium · Dissolving Race · Plant Growth Station · Titration · Desalination Plant (Jubail) · Solar Farm (NEOM: angle vs output).
- **Arabic:** حروف الواحة · أشكال الحرف · الحركات · صانع الكلمات · محكمة الإعراب · سوق المترادفات (synonym market) · رحلة الشعر (rhythm of poetry).
- **CS:** Robot Camel Commands · Loop Lantern · Bug Hunt · Sorting Souq · Binary Lanterns · Packet Caravan · Cipher Room.
- **Robotics:** Rover Rescue · Line Follower · Warehouse Bot · PID Balance · Drone Light Show · micro:bit Treasure Hunt (real sensors).
- **AI:** Teach the Robot · Is it AI? · Biased Bot · Decision Tree Detective · Perceptron Playground · Prompt Lab · Deepfake or Real?

---

*Made for the Fikr platform. The same kit, the same message contract and the same mastery rule, extended to every subject, so that a pupil's games, stars and certificates feel like one world from Grade 1 to Grade 12.*

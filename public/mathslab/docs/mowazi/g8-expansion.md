# Grade 8 lesson games — expansion record

**Status: P2 — draft prototypes. Not curriculum-approved, not classroom-tested.**
Seven self-contained offline HTML games in `games/grade8/`, one per Grade 8 mathematics lesson document,
built from the verbatim Fikr lesson-game template (`games/_fikr/engine/fikr-lesson-game-template.html`,
never modified). Hub: `games/grade8/index.html`. Sources: `games/grade8/src/01-slope-intercept.js` …
`07-model-limit.js`. Scenes: `games/_fikr/shared/scenes-8.js` (new).

---

## 1. Where the Grade 8 mathematics actually lives

This is the third grade in a row where the top level of the grade folder is **not** the mathematics, and it
is the largest trap so far — 24 documents, all of them carrying `G08-` bundle codes:

```
السنة الثامنة - الصف الثاني الإعدادي   (156eiI2Av3JbnjLanmK6xtSCTY3v_gh-L)  — 35 items
├── 24 top-level lesson documents   G08-U01-L01 … G08-U04-L20, P29 … P32
│      all of them digital literacy, computing and robotics, science
├── 10 subject folders  (الرياضيات، العلوم، الحاسب والروبوتكس، التصميم والهندسة، الفنون،
│      القرآن، اللغة العربية، اللغة الإنجليزية، المشاربغ التكاملية، المهارات الحياتية)
└── موازي - منهج ومشاريع السنة الثامنة   (spreadsheet — the programme sheet, not a lesson source)
```

Only **2 of the 35 items are mathematics documents** in the sense that matters, and they sit four levels
down. The path that was actually read:

```
02 — المنهج  (1-AtWFBRBwFLCoVmPrJEyub-fZB-Pjj5L)
└── السنة الثامنة - الصف الثاني الإعدادي  (156eiI2Av3JbnjLanmK6xtSCTY3v_gh-L)
    └── الرياضيات  (1RgEq1hQ8TrqRYrRea7kBuvoY4VzY_bGB)
        ├── الترم الأول  (1G4Qb8wjy1PQGQbqjx0i55Bw04FRzyz5L)  → 4 documents
        └── الترم الثاني (1tcTx8HNSB8-qkYZmvNZZyElTyonChozj)  → 3 documents
```

**Twelve folder hops, seven documents.** Every game below is derived from that subfolder and from nothing at
the top level. `nab_curriculum_map.csv` marks Grade 8 at **5% complete / 1 document**; the mathematics
subfolder alone already holds seven, so the programme-wide completeness figure understates this grade by a
wide margin — worth correcting in the map before it is quoted anywhere.

---

## 2. Source ledger

All seven documents share one anatomy: a map-code card (رمز الحزمة، الصف، المادة، المدة **45 دقيقة حصة +
30 دقيقة مختبر منزلي بلا شاشات**، حالة المستند **P2**), the CCSS anchor and Coherence Map, the محورية idea,
the **ten-axis** Mowazi frame (القرآن تدبر وعمل، السنة والسيرة، الصحابة والتابعون، العلماء المسلمون، الصحة
النفسية والاجتماعية), and a lesson pathway. Age band stated by the documents: **13–14**.

| Source (Drive, الرياضيات) | Size | What was taken | Game |
|---|---|---|---|
| `G08-U01-MAT-L01` — المعادلات الخطية والميل والمقطع الصادي والنمذجة البيانية (8.EE.B.5–6) | 22.6 kB | Slope = rise ÷ run between two plotted points, the intercept as the height at x = 0, reading m and b out of y = mx + b, and writing the line for a written situation. Figures lead, the algebra follows | **01 Slope Intercept** (`g8-slope-intercept`) |
| `G08-U01-MAT-L02` — نظرية فيثاغورس وعكسها وتطبيقاتها في المسافات والعمارة (8.G.B.6–8) | 24.9 kB | Which side is the hypotenuse, a missing leg vs a missing hypotenuse (add or subtract), and the **converse** as the test that decides whether a corner is square — the lesson's own 3-4-5 knotted rope of the surveyors of Basra and Kufa | **02 Builders Corner** (`g8-pythagoras-arch`) |
| `G08-U01-MATH-L02` — المعادلات الخطية ونظم المعادلات الخطية (8.EE.C.7, 8.EE.C.8) | 24.7 kB | Undoing a two-step equation from the outside in, a solution as the value that makes both sides equal, a system solved by substitution, and the crossing point checked in **both** rules | **03 Two Planks** (`g8-system-crossing`) |
| `G08-U01-L03` — «نبع \| كيف نختار بين خطتين؟» — الدول الخطية وأنظمة المعادلات، حزمة تدريس | 28.5 kB | The cost table that starts at 10 and rises by 2 a month, table → function, the crossing of two plans as a decision, and an explicit **limit on the model** past the measured months | **04 Plan Choice** (`g8-plan-choice`) |
| `G08-U02-MAT-L01` — الميل ومعدل التغير والمعادلة y = mx + b (8.EE.B.5–6) | 22.5 kB | Rate of change read out of a table (constant jump per step, with its unit), whether a table has one rate at all, and the rule built from rate + starting value | **05 Steady Tank** (`g8-rate-of-change`) |
| `G08-U02-MAT-L02` — نظرية فيثاغورس وعكسها والمسافة في المستوى الإحداثي (8.G.B.6–8) | 23.4 kB | The two coordinate differences as legs along the axes, the distance between two plotted points, the sign handling on the gaps, and the comparison of the straight route with the two-sided one | **06 Grid Flight** (`g8-distance-grid`) |
| `G08-U02-MATH-L02` — الدوال الخطية ومعدل التغير ونظرية فيثاغورس (8.G.B.7, 8.F) | 25.8 kB | The combined lesson: a linear function from a start and a rate, a span measured on the grid, and the **bound on the model** as part of the answer | **07 Roof Span** (`g8-model-limit`) |

---

## 3. Scope decisions — where the seven documents overlap

This set has **two overlapping pairs plus a combined lesson**, which is why seven documents needed seven
games rather than four. The splits are deliberate and are stated inside each game's header comment:

- **Slope pair — `G08-U01-MAT-L01` (01) vs `G08-U02-MAT-L01` (05).** Both cite 8.EE.B.5–6 and both end at
  y = mx + b. They start from opposite ends: document 1 gives **points and a figure** and asks for the slope
  (rise ÷ run on a drawn triangle); document 2 gives **a recorded process** — a table of readings — and asks
  what the steady jump is, and whether a steady jump exists at all. Game 01 never shows a readings table as
  its starting point; game 05 never asks the child to draw a slope triangle. The third level of 05 exists to
  break the «any table is linear» assumption, which is not in document 1.
- **Pythagoras pair — `G08-U01-MAT-L02` (02) vs `G08-U02-MAT-L02` (06).** Both cite 8.G.B.6–8. Document 1
  is the **building** frame: name the hypotenuse in a physical triangle, find the missing bracing, and use the
  converse to test a measured frame. Document 2 is the **coordinate-plane** frame: subtract coordinates, use
  the two differences as legs, and compare the straight route with the grid route. Game 02 has no coordinate
  plane; game 06 has no masonry.
- **`G08-U02-MATH-L02` (07) is a real third lesson, not a summary.** Its own objectives list the linear
  function, the distance on the plane **and** a limit on the model; the other two do not mention a limit at
  all. So 07 owns the three-part question (build a function → measure a span → state the bound) and repeats
  neither drill. Its distance figures use different triples from 06's so the two do not feel like the same
  round.
- **`G08-U01-L03` (04) is a different document from `G08-U01-MATH-L02` (03).** They look like a near-duplicate
  the way `MAT`/`MATH` codes do, and they are not: 28.5 kB vs 24.7 kB, and the content diverges — 03 is the
  algebra-and-substitution pack, 04 is the decision pack (a plan table, two plans, a crossing, and a stated
  bound). They are shipped as two games. Being the `L03` code with no `MAT`/`MATH` infix, 04 is also the one
  game whose bundle code is not in the `MAT-Lnn` family; that is the document's own code, kept verbatim.
- **The `L03` document declares its digital build deferred.** Its first screen says of itself: «مسودة تحتاج
  تطويرًا ومراجعة، غير معتمدة … HTML والتنفيذ الرقمي مؤجلان» — a draft needing development and review, not
  approved, with the HTML and digital delivery held back. Game 04 is the prototype it asks for, and this
  record carries the caveat rather than hiding it. It also states its numbers are **not prices or measured
  results** and prove no real saving; the fictional plan numbers here obey that, and the model limit is a
  whole level rather than a footnote.

Dropped or bounded deliberately:

- **8.F as a formal function-notation strand** (f(x) notation, comparing functions given in different forms)
  appears in document 07's standards line but not in its pathway; the games use the rule syntax the documents
  themselves use (h = 3x + 2, y = mx + b) and never introduce f(x).
- **Irrational results for the hypotenuse.** Every Pythagorean figure in games 02, 06 and 07 is drawn from a
  whole-number triple (3-4-5, 6-8-10, 5-12-13, 8-15-17, 9-12-15, 7-24-25) so the answer is exact. Estimating
  a non-integer root is not in these documents and is not invented here.
- **The mental-health and social axis** of the ten-axis frame is carried in the lesson frame's text where the
  documents place it (a steady model and honest limits as a habit of care in one's claims), not as a game
  mechanic — the documents themselves mark that axis as not to be scored numerically.

---

## 4. Methodology carried from the template

Each game is the verbatim Fikr engine with only its own block authored, and each renders the نبع/موازي
ten-section lesson frame under the play cards:

1. the unit's Quranic verse anchor and its **anti-overreach caution** (the verse governs the value, never the
   formula — for Grade 8: the command to justice is not the definition of slope, and «أتقن كل شيء» is not the
   statement of Pythagoras);
2. three-letter roots;
3. the story;
4. five objectives, written first-person;
5. the three (or four) levels presented as **stations**;
6. the seven-block time budget (٥ / ٧ / ١٠ / ١٥ / ١٠ / ٨ / ٥ د, from the 45-minute documents);
7. an exit card of four graded items;
8. a one-line success criterion (`ls-crit`);
9. two **screen-free** homework tasks — the documents' own 30-minute **مختبر منزلي بلا شاشات**;
10. a reflection prompt — closing with the P2 status line.

Two Grade 8 units were added to `games/_fikr/shared/lessons.js` (`G08-U01`, `G08-U02`) with their own verse,
roots and caution notes, and **seven** lesson frames (`g8-slope-intercept` … `g8-model-limit`). The near
identical codes (`MAT-L02` / `MATH-L02` in both terms) are kept as separate units of work, as in Grades 6 and 7.

Age band: every game is built with `band: 'g68'`, the 13–14 band the documents state.

---

## 5. Build and gates

```
node tools/build_fikr_games.js grade8      # 7 games, scenes-8.js added to EXTRA_LIBS.grade8
node .scratch/static_gate.mjs grade8       # 7/7 clean · 132 rounds · 42 CUBES blocks
node .scratch/static_gate.mjs              # full sweep: 72/72 games · 1182 rounds · 432 CUBES
```

**Chromium cannot run in this build environment** (the sandbox has no root for `apt-get`, and the standalone
`@sparticuz/chromium` binary hangs even on `data:text/html`), so `tools/fikr_games_qa.mjs` — the browser gates —
could not be run. `.scratch/static_gate.mjs` is a jsdom harness that reproduces their assertions against the
same built HTML: a clean boot with no page error, every Learn slide driven, every level and every round
generated, **the answer always present among the options, options unique**, every distractor diagnosed by
`why()`, at least two hints per round, think rounds carrying a `problem` block, the frame's ten sections, the
success criterion, the P2 line, Arabic in the frame, and no `NaN` or `undefined` anywhere on screen.

**Screenshots are outstanding.** `tools/fikr_games_gallery.mjs` needs `screenshots/grade8-fikr/qa.json`, which
requires a browser; none exist, and none should be claimed.

CUBES: the engine ships six blocks per game (`levels [0,0,6]`), which are counted above as 6 × 7 = 42.

---

## 6. Named misconceptions

Each game names three, and each appears both as a Ghubar line and as a wrong option with its own diagnosis:

| Game | The misconception it is built against |
|---|---|
| 01 Slope Intercept | slope is run ÷ rise; the intercept is always positive; a bigger number on the page is a steeper line |
| 02 Builders Corner | any side can be c; a missing leg is found by adding; a familiar-looking triple is automatically right |
| 03 Two Planks | a solution is any number printed in the equation; one shared x solves the pair; a neat crossing on the drawing is a proof |
| 04 Plan Choice | the slower-growing plan is always cheaper; a month past the table still has a cost we know; two plans that cross once are equal everywhere |
| 05 Steady Tank | the rate is the largest number in the table; the first reading is the rate; every table of numbers is linear |
| 06 Grid Flight | distance is across + up; a negative gap gives a negative distance; the two differences are the coordinates themselves |
| 07 Roof Span | a linear model is true for every input; the limit is a mistake in the arithmetic; a span can be read off the drawn line without subtracting |

---

## 7. Open items before classroom use

1. Take the seven screenshots (browser available) and generate `screenshots/grade8-fikr/qa.json`.
2. Run `tools/fikr_games_qa.mjs` on the seven built files — the option-duplicate and frame sweeps have only
   been reproduced in jsdom here.
3. Get `G08-U01-L03` reviewed by its own author: the document says it is not approved and its digital build is
   deferred, so game 04 is a proposal, not a delivery.
4. Correct `nab_curriculum_map.csv`: Grade 8 is listed at 5% / 1 document, but the mathematics subfolder holds
   seven.
5. Confirm the `G08-U01-L03` bundle code with curriculum (it is the only Grade 8 lesson code without a
   `MAT`/`MATH` infix).

# Grade 9 lesson games — expansion record

**Status: P2 — draft prototypes. Not curriculum-approved, not classroom-tested.**
Seven self-contained offline HTML games in `games/grade9/`, one per Grade 9 mathematics lesson document,
built from the verbatim Fikr lesson-game template (`games/_fikr/engine/fikr-lesson-game-template.html`,
never modified). Hub: `games/grade9/index.html`. Sources: `games/grade9/src/01-parabola-launch.js` …
`07-quadratic-apps.js`. Scenes: `games/_fikr/shared/scenes-9.js` (new).

---

## 1. Where the Grade 9 mathematics actually lives

The trap is the same as Grades 6–8, with one twist that cost an extra check: the grade folder holds **lesson
documents at its top level** (`G09-U01-L01` … `G09-U04-P36`) *and* two **term folders** *and* ten subject
folders. The top-level files and both term folders are **not mathematics** — the term folders hold the AI
agents / jurisprudence / Meccan-opening / disengagement-project units. The mathematics is the subject folder:

```
02 — المنهج  (1-AtWFBRBwFLCoVmPrJEyub-fZB-Pjj5L)
└── السنة التاسعة - الصف الثالث الإعدادي  (1PPD45PX20X--elnOVITg2PxAnCCyqnhN)  — 37 items
    ├── 24 top-level lesson documents   G09-U01-L01 … U04-P36
    │      occupational-file, comparison, fair-wording, graduation-project units — NOT maths
    ├── الترم الأول   (1BC3JiKBvB1Wxnz2MKcWKQgihiDBEwXpZ)  → AI agents, jurisprudence — NOT maths
    ├── الترم الثاني  (1dy5ek6XL93ZmtzpU9gc8EwKPSITNhhe7)  → farewell argument, autonomous systems — NOT maths
    ├── 10 subject folders
    └── موازي - منهج ومشاريع السنة التاسعة   (spreadsheet — programme sheet, not a lesson source)

    الرياضيات  (1SEWfNka6YyIWXrDq8wiARU8NuojKdixV)  ← the ONLY mathematics folder
    ├── الترم الأول   (1D9Zbyq29wqXV7IeL8V0s4LUzKwquIwAr)  → 4 documents
    └── الترم الثاني  (1d1jbDd8AxWamVaadPNLgbC-G8gE4aIwP)  → 3 documents
```

**Both sets of term folders were opened and read.** A folder called `الترم الأول` at grade level looks like a
plausible source until you see that its contents are *AI agents and the jurisprudence of substitution*; and
`الترم الثاني` at grade level is *the farewell argument and autonomous systems*. Grade 9 is the first grade
where the decoy term folders sit beside the real subject folder, so the check is recorded here explicitly.
Twelve folder reads; seven mathematics documents.

`nab_curriculum_map.csv` lists Grade 9 at **5% complete / 1 document**. The mathematics subfolder alone holds
seven. As with Grade 8, the map understates this grade and should be corrected before the figure is quoted.

---

## 2. Source ledger

All seven share the platform's document anatomy (map-code card، المعايير الدولية، الفكرة المحورية، المحاور
العشرة، مسار الحصة)، the **45 دقيقة صفية + 30 دقيقة مختبر منزلي بلا شاشات** budget, and the **P2** self-status.
The stated age band in the first two documents is **14–15 سنة**, so every game is built with `band: 'g912'`.

| Source (Drive, الرياضيات) | Size | What was taken | Game |
|---|---|---|---|
| `G09-U01-MAT-L01` — الدوال التربيعية والمعادلات من الدرجة الثانية ونمذجة المقذوفات (HSA.REI.B.4 & HSF.IF.C.7a) | 24.0 kB | The curve itself: vertex and axis of symmetry read from a picture, the crossings of the x-axis as the roots, a negative discriminant made *visible* as a curve that never reaches the axis, and a projectile read honestly as a model | **01 Parabola Launch** (`g9-parabola-launch`) |
| `G09-U01-MAT-L02` — أنظمة المعادلات والمتباينات الخطية ونمذجة القيود الواقعية (HSA.REI.C.6 & D.12) | 19.6 kB | The lesson's core contrast: two **equations** meet at one point, two **inequalities** share a whole **region**; elimination as the solving move; testing a point to choose a side; constraints as the boundary of the permitted set | **02 Region Planner** (`g9-region-planner`) |
| `G09-U01-MATH-L02` — تحليل كثيرات الحدود والمعادلات التربيعية (HSA-SSE.A.2 & HSA-REI.B.4) | 25.9 kB | The three factoring structures in the document's own order — GCF first, difference of two squares, trinomial by product-and-sum — then the zero product property to read the roots off the factors | **03 Factor Bench** (`g9-factor-bench`) |
| `G09-U01-L03` — «نبع \| نقرأ المسار ولا ندّعي رحلة حقيقية» — الدالة التربيعية والمتجهات (مسودة رياضيات) | 19.5 kB | Substitute into a quadratic and build the **table**; separate a **zero height** from the **greatest height**; combine two **vectors** component by component with sign and unit | **04 Arc Table** (`g9-arc-table`) |
| `G09-U02-MAT-L01` — المعادلات التربيعية وإكمال المربع والقانون العام (HSA-REI.B.4a & B.4b) | 27.8 kB | Halve-and-square to close the corner; convert to (x − p)² = q; derive the general formula from the same manoeuvre; the **discriminant** decides the number of real roots *before* solving | **05 Complete the Square** (`g9-complete-square`) |
| `G09-U02-MAT-L02` — الدالة التربيعية والتمثيل البياني والقيم العظمى والصغرى (HSF-IF.C.7a & HSA-SSE.B.3) | 26.7 kB | The **extremum** question: the sign of a decides maximum or minimum, the vertex carries the value, and the value has to be said in the words of the situation (greatest profit, smallest cost) | **06 Vertex Extremes** (`g9-vertex-extremes`) |
| `G09-U02-MATH-L02` — الدوال التربيعية والتمثيل البياني وتطبيقاتها (HSF-IF.B.4 & HSF-IF.C.7) | 26.1 kB | Intercepts as the meaning of zero; **intervals of increase and decrease partitioned by the vertex**; and a closing judgement on what a fitted graph does **not** measure | **07 Quadratic Apps** (`g9-quadratic-apps`) |

---

## 3. Scope decisions — seven documents, one topic

This is the hardest set to keep distinct so far, because **six of the seven are about quadratics**. The split
is by *question asked*, not by topic name, and each game's header comment states its own boundary:

- **Curve (01) vs table (04) vs extremum (06) vs interval (07).** All four involve a parabola, and they are
  not interchangeable: 01 asks *where is the vertex and how many crossings* on a **supplied picture**; 04 asks
  the student to **produce** the numbers in a table and to separate a zero height from a greatest height, and
  then leaves the parabola behind entirely for vectors; 06 asks **which kind of value** the turning point is
  and what it means in a situation, deliberately *not* producing the vertex form; 07 asks about **behaviour
  across an interval** and ends every level in a judgement about the limits of a claim. No level in 01 asks
  about intervals; no level in 06 asks to complete a square; no level in 07 asks for the vertex coordinates.
- **`G09-U01-MATH-L02` (03) vs `G09-U02-MAT-L01` (05) — the pair that matters.** Both finish the same
  equations and their codes differ by the `MAT`/`MATH` infix, which is exactly the shape that looked like a
  near-duplicate in Grades 6–8. They are **two genuinely different lessons**: 03 is the *structure* lesson
  (SSE.A.2 — factor out, recognise squares, factor trinomials) and 05 is the *method* lesson (REI.B.4a/b —
  completing the square, the derived formula, the discriminant). They are kept as two games, and the division
  is enforced inside the games: **03 never completes a square or uses the formula**, and **05 never factors a
  trinomial into two integer brackets** — it goes straight to halve-and-square. A student who plays both gets
  the two routes to the same roots, which is the point of the pair.
- **03 only ships trinomials that genuinely factor over the integers.** The document's objective is
  structural, and a game that quietly implied every trinomial factors would teach a false rule; the
  trinomial rounds are drawn from a fixed list of factorable triples, and the *non*-factorable case is left to
  05, where the formula handles it.
- **`G09-U01-L03` (04) declares its own digital build deferred.** Its first screen says: «مسودة منتجة تحتاج
  مراجعة وتطويرًا، غير معتمدة. HTML وتنفيذ الألعاب الرقمية مؤجلان», and it adds that its numbers and drawings
  are hypothetical and prove no real aircraft performance. Game 04 is the prototype it asks for, this record
  carries the caveat, and the game's projectile framing never presents a computed height as a measurement.
- **Vectors are found in no other Grade 9 mathematics document**, so they are 04's alone: component-wise
  addition, sign, and the displacement-versus-speed distinction the document itself draws.
- **`G09-U01-L02`'s inequalities are the reason 02 exists as a separate game.** No other document in the set
  touches REI.D.12, and the *region* is precisely the thing that distinguishes this lesson from the Grade 8
  system work — so 02 builds it as the visible object.

Bounded deliberately:

- **Complex roots are never computed.** Document 05 requires the student to *distinguish* real from
  non-real roots via the discriminant; 05 stops at "no real roots" and states that precisely rather than
  introducing `i`, which no Grade 9 document in this folder asks for.
- **No formal function notation `f(x)` in the mechanics.** The documents write rules with letters where a
  context needs one (`h = …`, `P(x) = …`) and 07 uses `P(x)`/`C(x)` only as the document's own labelling, not
  as a notation to be manipulated.
- **The ten-axis religious frame is carried as frame text, never as a mechanic.** Grade 9's unit notes are
  unusually explicit about this — one of them literally warns «الآية ليست معادلة فيزياء» — and both new units
  in `lessons.js` repeat a caution in that spirit.

---

## 4. Methodology carried from the template

Each game is the verbatim Fikr engine with only its own block authored, and each renders the نبع/موازي
ten-section lesson frame under the play cards:

1. the unit's Quranic verse anchor and its **anti-overreach caution**;
2. three-letter roots;
3. the story;
4. five objectives, written first-person;
5. the three levels presented as **stations**;
6. the seven-block time budget (٥ / ٧ / ١٠ / ١٥ / ١٠ / ٨ / ٥ د, from the 45-minute documents);
7. an exit card of four graded items;
8. a one-line success criterion (`ls-crit`);
9. two **screen-free** homework tasks — the documents' own 30-minute **مختبر منزلي بلا شاشات**;
10. a reflection prompt — closing with the P2 status line.

Two Grade 9 units were added to `games/_fikr/shared/lessons.js` (`G09-U01`, `G09-U02`) with their own verse,
roots and caution notes, plus **seven** lesson frames (`g9-parabola-launch` … `g9-quadratic-apps`).

---

## 5. Build and gates

```
node tools/build_fikr_games.js grade9            # 7 games, scenes-9.js added to EXTRA_LIBS.grade9
node tools/fikr_static_gate.mjs grade9           # 7/7 clean · 126 rounds · 42 CUBES
node tools/fikr_static_gate.mjs                  # full sweep: 79/79 games · 1308 rounds · 474 CUBES
```

**Chromium cannot run in this build environment** (no root for `apt-get`; the standalone
`@sparticuz/chromium` binary hangs even on `data:text/html`), so `tools/fikr_games_qa.mjs` — the browser
gates — could not be run. The jsdom harness reproduces their assertions against the same built HTML.

**The harness moved from `.scratch/static_gate.mjs` to `tools/fikr_static_gate.mjs`.** `.scratch/` is
gitignored, so the gate was being lost between sessions and rewritten from scratch each time. It is now a
committed tool with its own header explaining why it exists and how to install jsdom:

```
npm install jsdom --no-save                       # or: FIKR_JSDOM=/path/to/jsdom node tools/fikr_static_gate.mjs
```

It asserts, per game: a clean boot with no page error; no external URL, remote font or remote image (the
offline constraint); the frame's ten sections plus the success criterion, the P2 line and Arabic; every level
and round generated without `NaN`/`undefined`; the answer present among distinct options (≥3 from Grade 7 up,
which is when `fixOpts()` was introduced); a `why()` and ≥2 hints on every round; a `problem` block on every
think round; and the driven round count matching `GAME`'s own declaration. It also checks each grade's hub
page lists every built game.

**Screenshots are outstanding.** `tools/fikr_games_gallery.mjs` needs `screenshots/grade9-fikr/qa.json`, which
requires a browser; none exist, and none should be claimed.

---

## 6. Named misconceptions

Each game names three, and each appears both as a Ghubar line and as a wrong option with its own diagnosis:

| Game | The misconception it is built against |
|---|---|
| 01 Parabola Launch | the vertex is always the highest point; every parabola crosses the x-axis twice; a negative discriminant means bad arithmetic |
| 02 Region Planner | every point on the page is a solution; the boundary is in the solution either way; a region needs one corner to be an answer |
| 03 Factor Bench | skip the common factor; x² − 49 cannot factor; a product of 6 means each bracket is 6 |
| 04 Arc Table | zero height is the greatest height; negative components are impossible; a vector is the same as its length |
| 05 Complete the Square | add the missing piece to one side only; the formula always gives two real answers; a negative discriminant means no solutions at all |
| 06 Vertex Extremes | the vertex is the highest point always; a negative leading coefficient gives a negative value; the maximum is wherever the curve stops |
| 07 Quadratic Apps | a curve that goes up is increasing everywhere; the intercept answers every question; a smooth graph proves the real situation |

---

## 6b. The verse/note pairing bug — found here, fixed across the library

Two Grade 9 frames overrode the unit verse but inherited the *unit's* caution note, so the child read a
caution about a different ayah. `g9-arc-table` (الإسراء ٣٦) and `g9-complete-square` (العنكبوت ٦٩) now carry
their own `note:` in `lessons.js`.

Turning that into a gate assertion exposed the same bug in four already-shipped frames: `g5-sliding-card`,
`g6-pulse-ratio`, `g6-tape-share`, `g8-plan-choice`. All four now own their note. The check is now permanent
in `tools/fikr_static_gate.mjs`: *a lesson that shows a verse different from its unit's verse must supply its
own note.* A lesson that inherits both verse and note is fine and still passes.

Consequence: `lessons.js` is a shared dependency of every grade, so editing it silently staleness-marks every
built HTML. After any `lessons.js` change, rebuild each affected grade explicitly — the gate will catch it if
you forget.

---

## 7. Open items before classroom use

1. Take the seven screenshots (browser available) and generate `screenshots/grade9-fikr/qa.json`.
2. Run `tools/fikr_games_qa.mjs` on the seven built files — the option-duplicate and frame sweeps have only
   been reproduced in jsdom here.
3. Get `G09-U01-L03` reviewed by its own author: the document says it is unapproved and its digital build is
   deferred, so game 04 is a proposal, not a delivery.
4. Confirm the `MAT`/`MATH` split between `G09-U01-MATH-L02` (03) and `G09-U02-MAT-L01` (05) with curriculum —
   the two codes look adjacent but the lessons are distinct, and the games enforce that distinction.
5. Correct `nab_curriculum_map.csv`: Grade 9 is listed at 5% / 1 document, but the mathematics subfolder holds
   seven.

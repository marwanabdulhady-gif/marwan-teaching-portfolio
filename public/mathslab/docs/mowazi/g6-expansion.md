# Grade 6 lesson games — expansion record

**Status: P2 — draft prototypes. Not curriculum-approved, not classroom-tested.**
Nine self-contained offline HTML games in `games/grade6/`, one per Grade 6 mathematics lesson document,
built from the verbatim Fikr lesson-game template (`games/_fikr/engine/fikr-lesson-game-template.html`,
never modified). Hub: `games/grade6/index.html`. Sources: `games/grade6/src/01-falcon-ratio.js` …
`09-mean-median.js`. Scenes: `games/_fikr/shared/scenes-6.js`.

---

## 1. Where the Grade 6 mathematics actually lives

The Grade 6 folder at the top level of the Drive tree holds **science** documents
(`G06-U01-L01…L05`, `P21`, `G06-U02-L06…L10`, `P22`, `G06-U03-L11…L15`, `P23`, `G06-U04-L16…L20`, `P24`).
The mathematics is a **subfolder**:

```
الرياضيات  (1lscyHVSqWzPwGwRou92g7VKl-hnj0vpS)
├── الترم الأول   (1eQasU3rG6mXH-DQXs1vLfnD_OrBO5-xb)  → G06-U03-L13
└── الترم الثاني  (1ilXd1qQuCI40Ed5ONgdRK8yrPyoo9H6v)  → G06-U04-L18
```

Every game in this set is derived from that subfolder, never from the science documents at the top level.

---

## 2. Source ledger

| Source (Drive, الرياضيات + unit bundles) | What was taken |
|---|---|
| `G06-U01-MAT-L01` — النسبة والتناسب (6.RP.A.1–3) | Ratio language, part-to-part and part-to-whole, equivalent ratios (game 01) |
| `G06-U01-MATH-L02` — النسبة والمعدل ونسبة الوحدة والنسبة المئوية (6.RP.A) | Unit rate, ratio tables, percent as a rate per 100, the 2.5% zakat anchor (game 02) |
| `G06-U01-L03` — النبض والإحصاء الطبي: المعدلات والنسب المئوية | Rate from a recorded survey, scaling a count to a span, per-100 comparison (game 03) |
| `G06-U02-MAT-L01` — النسبة والتناسب: التمثيل بأشرطة ومشاركة كمية بنسبة (6.RP.A.1, 6.RP.A.3) | Tape diagram, sharing a quantity in a ratio, the 120-riyal 25%-off bag, the 24-نخل ratio (game 04) |
| `G06-U01-MAT-L02` — قسمة الكسور (6.NS.A.1) | "How many groups fit", fraction ÷ unit fraction, fraction ÷ fraction (game 05) |
| `G06-U02-MAT-L02` — المعادلات والمتباينات بخطوة واحدة (6.EE.B.7, 6.EE.B.8) | Balance model, one-step equations, inequalities on the number line (game 07) |
| `G06-U02-MATH-L02` — المقادير الجبرية والمعادلات والمتباينات الخطية | Expression language and the linear-inequality reach, used to hold game 07 inside 6.EE.B |
| `G06-U03-L13` — الأسس والقوى والنمو الأسي (الترم الأول) | Integer line, opposites, distance, and the growth language of powers (game 06) |
| `G06-U04-L18` — الحجوم المركّبة والمساحة السطحية والنمذجة (الترم الثاني) | Area of polygons by decomposition (game 08) |
| `G06-U01-L03` survey data | Mean, median, MAD on a dot plot (game 09) |
| موازي scope spreadsheet + AUDIT REPORT (نبع / موازي G2–G9) | Unit→strand ceiling; the ten-section lesson frame |
| `grade-06.md` brief + `fikr-game-design-guide.md` | Mechanics, `g68` band settings, misconception naming |

Sources **not** used: the science documents at the Grade 6 top level (see §1),
`education_resources.html` (marked OLD / superseded 2026-11-15).

---

## 3. Game map

| # | id | code | Title | Objective |
|---|---|---|---|---|
| 01 | `g6-falcon-ratio` | `G06-U01-MAT-L01` | Falcon Ratio | Read a ratio part-to-part and scale it without changing it |
| 02 | `g6-date-rate` | `G06-U01-MATH-L02` | Date Rate | Unit rate, ratio tables, percent as a rate per 100 |
| 03 | `g6-pulse-ratio` | `G06-U01-L03` | Pulse Ratio | Scale a rate to another time span; compare per 100 |
| 04 | `g6-tape-share` | `G06-U02-MAT-L01` | Tape Share | Share a quantity in a ratio on a tape diagram |
| 05 | `g6-water-divide` | `G06-U01-MAT-L02` | Water Divide | Divide fractions by counting how many groups fit |
| 06 | `g6-altitude-line` | `G06-U01-MAT-L01` | Altitude Line | Integers, opposites and distance on the number line |
| 07 | `g6-balance-equation` | `G06-U02-MAT-L02` | Balance Equation | One-step equations on a balance; inequalities on a line |
| 08 | `g6-shade-area` | `G06-U04-L18` | Shade Area | Area of polygons by cutting into shapes you know |
| 09 | `g6-fair-share-data` | `G06-U01-L03` | Fair Share Data | Mean, median and the mean absolute deviation |

### ⚠ The near-identical codes are **not** duplicates

`G06-U01-MATH-L02` (ratios, unit rate and percent — 6.RP.A) and `G06-U01-MAT-L02` (dividing fractions —
6.NS.A.1) are **different lessons in different documents**. So are `G06-U02-MATH-L02` (algebraic
expressions and linear inequalities) and `G06-U02-MAT-L02` (one-step equations, 6.EE.B). The extra `H` is
the whole difference. They are never collapsed, never aliased and never share a `LESSONS` entry. Any future
tooling that matches on unit code must compare the **full** string.

### One lesson, two games — declared on purpose

`G06-U01-MAT-L01` and `G06-U01-L03` each carry two games, because the source document covers two distinct
mechanics that would crowd one game:

- `G06-U01-MAT-L01` → **01** takes ratio language and equivalent ratios; **06** takes the number-line /
  integer work bundled with the same unit. Neither repeats the other's rounds.
- `G06-U01-L03` → **03** takes rates from the recorded survey; **09** takes the summary statistics of the
  same data set (mean, median, MAD).

This is the only place in the set where the one-game-per-document rule is bent, and it is recorded here
rather than hidden.

---

## 4. The lesson frame rendered in every game

Each game carries a `LESSONS[gameId]` entry in `games/_fikr/shared/lessons.js` (21 units / 58 lessons
total; this set adds 4 units — `G06-U01`…`G06-U04` — and 9 lesson frames). `shared/lesson.js` renders it **below** the play cards and
collapsed, so a child reaches the game immediately while an adult can open the plan. The P2 status line
stays above the fold and is never hidden behind the expander.

| Section | Requirement | Delivered |
|---|---|---|
| الآية | mushaf-verified verse anchor | one per unit (4 units, G06-U01–U04) |
| الجذور | three-letter Quranic roots | 3 per unit |
| caution | anti-overreach rule | every unit, in the unit `note` |
| الأهداف | ≥ 5 objectives | 5 per game |
| القصة | story and prior-learning link | 1 per game |
| المحطات | ≥ 3 stations with differentiation | 3 per game (three levels = three CRA stations) |
| التسلسل | time blocks to 70 min | 7 blocks per game |
| الخروج | exit card ≥ 4 items أ–د + criterion | 4 items + criterion per game |
| الواجب | homework ≥ 2 items | 2 screen-free tasks per game |
| المراجعة | reflection | 1 per game |
| P2 | status line | rendered in all 59 games |

**Units and verse anchors:** G06-U01 الرحمن ٩ · G06-U02 الرحمن ٧ · G06-U03 الجن ٢٨ · G06-U04 الأعلى ٢.

### Where the caution comes from

Each unit note is copied in substance from its source document and enforces the same discipline as Grades
1–5: the verse frames value, it is not a description of an algorithm.

- **U01** — the verse is about God's reckoning of all things, **not** a definition of a ratio or a rate.
  The survey lesson (L03) is presented as arithmetic on a recorded teaching table; it gives **no medical
  advice** and no normal range for any pulse.
- **U02** — the verse is about the balance (الميزان) as a sign of just measure, **not** a licence to read a
  balance as an algorithm for solving equations. The zakat anchor in game 02 uses 2.5% as **arithmetic**
  only; it is not a ruling and no nisab or eligibility is taught.
- **U03** — the verse is about the preservation of the Book, not an endorsement of exponential growth as a
  law of nature; growth is taught as a mathematical model with a stated rate.
- **U04** — إتقان الخلق, not a definition of a polygon or a proof of a decomposition; the shaded-area game
  is arithmetic on drawn figures, never a claim about creation or about measurement accuracy.

Any future edit must preserve this boundary.

---

## 5. Evidence boundary

> **Draft-aligned prototypes. Not curriculum-approved, not classroom-tested (P2).**
> Standards-aligned at the CCSS level. Quranic anchors and lesson-frame sections are pedagogical framing
> and do **not** constitute religious ruling or tafsir. The unit→verse mapping is a pedagogical judgment
> and needs a scholarly pass before classroom use.

- **Demonstrated:** 9/9 games pass the mechanical harness `tools/fikr_games_qa.mjs` — 18 rounds, 3 level
  dialogs, 4 learn slides with 2 gates, ≥1 star per level, trophy, the CUBES think card rendering in all
  three games that declare it, no console errors, no network, no `[object Object]`/`NaN`/`undefined`
  leaking into prompt or options. 9/9 lesson frames render at 390 px with every required section present
  and no horizontal overflow. 1,080 generated questions across all 27 levels were checked directly: **no
  round renders two buttons with the same text, and the answer is always among the options.** All 59 games
  across Grades 1–6 are offline, self-contained, with no remote assets and no unmapped emoji glyphs.
- **Not demonstrated:** that any child learns more. No classroom trial, no pre/post measure, no teacher
  review of objective wording. The 9-track (المسارات) layer is not rendered at all.
- **Not one-game-per-lesson everywhere:** two documents carry two games each (see §3).

---

## 6. Named misconceptions (as declared in each source header)

`ratio-written-backwards` — the answer reads 4 : 3 for a 3 : 4 picture (01) · `adds-the-two-numbers`,
`percent-of-the-wrong-whole` (02) · `scales-one-side-only`, `compares-raw-counts` (03) ·
`divides-by-the-number-of-parts-not-cells`, `worth-one-cell-equals-the-whole` (04) ·
`divides-the-denominators`, `multiplies-instead-of-counting-groups` (05) ·
`bigger-absolute-value-is-greater`, `distance-is-subtraction-not-direction` (06) ·
`changes-only-one-side-of-the-balance`, `reads-inequality-as-equation` (07) ·
`adds-the-sides-for-area`, `forgets-to-halve-the-triangle`, `doubles-the-trapezoid` (08) ·
`median-means-middle-in-the-list`, `mean-is-the-middle-number`, `ignores-the-distances-in-MAD` (09).

---

## 7. Build and verify

```bash
node tools/build_fikr_games.js grade6          # → 9 HTML, ~410 kB each
LD_LIBRARY_PATH=/tmp/al/lib PPTR=/tmp/pp/node_modules/puppeteer-core CHROME=/tmp/chromium \
  node tools/fikr_games_qa.mjs grade6           # → 9/9 games clean  (add --shots for screenshots/)
LD_LIBRARY_PATH=/tmp/al/lib node /tmp/framecheck.mjs grade6   # → 9/9 frames clean @ 390 px
```

Screenshots land in `screenshots/grade6-fikr/` (45 PNGs + `qa.json`).

---

## 8. Fixes carried into this set

- **Duplicate option buttons.** A distractor is sometimes built from the same numbers as the answer — a
  fixed fallback that lands on the right value, or a formula that collapses when two random draws are
  equal (`["2","2","8"]`, `["16","16","16"]`). Every grade-6 source routes its rounds through
  `GAME.fixOpts(this.roundRaw(i))`, which **never rewrites the answer's own button** (the engine matches
  options by text, so rewriting it makes the right answer unselectable) and repairs only later duplicates.
  It hangs off `GAME`, not off the level, because the engine calls `round` detached from the level object.
- **`think: true` with no `problem` block.** Level 3 of `01-falcon-ratio` declared a CUBES think step but
  returned only a `choice` round, so the think card never rendered (the harness reported `cubes:0` while
  every other game reported `cubes:6`). The round now carries a `problem: { sentences, question, keys,
  extras }` block.
- **A drawing that contradicted its own numbers.** `05-water-divide` drew ten half-cells and asked how many
  halves fit in "10/2 of the tank" while marking 5 as correct. The model is now built from the same
  fraction it asks about: the tank is cut into `b` cells, you hold `a` of them, and each group is one cell,
  so the number of groups is `a`. Level 2 additionally bumps the total to an even number of cells so
  groups of two divide exactly, and re-splits it into a **proper** mixed number (never `1 4/4`).
- **A triangle drawn with impossible sides.** `08-shade-area` passed `sides: [b, h + 1, h + 1]` — a fake
  third side that made 4 + 4 < 10. `SCENE6.polygon` now takes `base` + `height` for a triangle and draws
  the real altitude with a right-angle mark and the two labels, so the picture cannot contradict the
  question. Rectangle, parallelogram and trapezoid now scale from their labelled numbers on a single
  scale instead of a fixed 280 × 120 shape.
- **Ratio tables used as prose boxes.** `03-pulse-ratio` put `'counted'` / `'in the group'` in a *value*
  row and asked a `3 : 3` question (a giveaway with only one honest answer). The table now holds numbers
  only, one column with the two groups as rows, and the draw never produces `a === b`.
- **Tape diagram without its brackets.** `barModel6` printed "first" / "second" as floating words with a
  single total bracket, so a 4 : 3 split was not visibly 4 cells and 3 cells. Each segment now gets its own
  bracket under the cells it covers.
- **Emoji coverage.** `🔺 🪢 ⏱ 💯` were unmapped or mis-drawn: `🔺` and `🪢` had no icon at all, and `💯`'s
  `hundred` art stacked its two zeros vertically beside the "1", reading as "18". All are now hand-drawn
  inline SVG; the Grade 6 set has 0 unmapped glyphs.
- **Hub pages depended on the device font.** `games/grade5/index.html` and `games/grade6/index.html`
  printed raw emoji in their card badges, which become empty boxes on a locked-down school machine (the
  built games already used `G1ICON`). Both hubs now embed `shared/icons.js` and draw the icons, so the hub
  is as font-independent as the games. `shared/lesson.js` likewise draws the `📋` on the lesson-frame
  summary instead of printing the character.
- **Shared-layer naming.** `scenes-6.js` declares only `SCENE6` and no generic top-level name, because a
  grade-6 source may declare its own (`UNITS` collision would blank the page).

---

## 9. Files added for this set

`games/grade6/src/*.js` (9 sources) · `games/grade6/*.html` (9 built, self-contained) ·
`games/grade6/index.html` (hub, accent `#2f4f7f`) · `games/grade6/index.json` ·
`games/_fikr/shared/scenes-6.js` (12 exports) · additions to `games/_fikr/shared/lessons.js`,
`games/_fikr/shared/icons.js`, `games/_fikr/shared/lesson.js`, `games/index.html` (Grade 6 card),
`games/grade5/index.html` (icon embedding) and `tools/build_fikr_games.js` (`EXTRA_LIBS.grade6`).

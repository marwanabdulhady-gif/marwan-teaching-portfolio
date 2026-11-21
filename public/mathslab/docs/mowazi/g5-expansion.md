# Grade 5 lesson games — expansion record

**Status: P2 — draft prototypes. Not curriculum-approved, not classroom-tested.**
Ten self-contained offline HTML games in `games/grade5/`, one per Grade 5 objective, built from the
verbatim Fikr lesson-game template (`games/_fikr/engine/fikr-lesson-game-template.html`, never modified).
Hub: `games/grade5/index.html`. Sources: `games/grade5/src/01-sliding-card.js` … `10-caravan-rate.js`.

---

## 1. Source ledger

| Source (Drive, `موازي — الرياضيات` / G05 folders) | What was taken |
|---|---|
| `G05-U01-MAT-L01` — القيمة المنزلية حتى الأجزاء من ألف والضرب في قوى العشرة (5.NBT.A.1–2) | Place-value strip, ×/÷ 10 and 100 (game 01) |
| `G05-U01-MATH-L02` — الكسور العشرية: القيمة المنزلية والمقارنة والعمليات حتى الأجزاء من ألف (5.NBT.A.3, 5.NBT.B.7) | Thousandths grid, comparison, add/subtract ledger (game 02) |
| `G05-U01-MAT-L02` — الحجم بوصفه خاصية للأشكال ثلاثية الأبعاد وحسابه بالمكعبات (5.MD.C.3, 5.MD.C.5a) | Unit-cube packing, the water-cistern problem (game 03) |
| `G05-U01-L03` — الزوايا والدائرة ودرجاتها وأجزاء الدورة (unit 01 folder + lesson kit) | Folded paper disc, 360° as fractions of a turn (game 04) |
| `G05-U02-MATH-L02` — جمع وطرح الكسور غير متحدة المقام وضرب الكسور (5.NF.A.1–2, 5.NF.B.4) | Common-denominator strategy, area model of a product (game 05) |
| `G05-U02-MAT-L02` — المستوى الإحداثي وتمثيل النقاط والأنماط العددية في الربع الأول (5.G.A.1–2) | al-Khwārizmī's صورة الأرض; ordered pairs, patterns (game 06) |
| `G05-U02-MAT-L01` — مفهوم الحجم وحجم المنشور الرباعي القائم والأشكال المركبة (5.MD.C.5a, 5.MD.C.5c) | V = B × h, additive volume of an L-shaped solid (game 07) |
| `G05-U03-L13` — النسب المئوية والكسور والكسور العشرية في تراكيز المحاليل (5.NF.B.4, 5.NBT.B.7) | Percent ↔ fraction ↔ decimal in a labelled mixture (game 08) |
| `G05-U04-L18` — المضلعات المنتظمة والتناظر الهندسي وحساب المساحة في الزليج (5.G.B.3–4) | Regular polygons, 360° around a vertex, tiled panel area (game 09) |
| `G05-U02-L08` (v3 approved bundle) — الملاحة وتحديد المواقع والسِّمْت وحساب السرعة (5.G.A.1–2, 5.NF.B.5) | Bearing rose, position pair, speed = distance ÷ time (game 10) |
| موازي scope spreadsheet + AUDIT REPORT (نبع / موازي G2–G9) | Unit→strand ceiling; the ten-section lesson frame |
| `grade-05.md` brief + `fikr-game-design-guide.md` | Mechanics, `g35` band settings, misconception naming |

Sources **not** used: `education_resources.html` is marked OLD / superseded 2026-11-15.

---

## 2. Game map

| # | id | code | Title | Objective |
|---|---|---|---|---|
| 01 | `g5-sliding-card` | `G05-U01-MAT-L01` | The Sliding Card | Place value to thousandths; × and ÷ by 10 and 100 |
| 02 | `g5-thousandths-workshop` | `G05-U01-MATH-L02` | Thousandths Workshop | Read, compare, add and subtract decimals to thousandths |
| 03 | `g5-cube-storehouse` | `G05-U01-MAT-L02` | Cube Storehouse | Volume as an attribute, counted in unit cubes; V = l × w × h |
| 04 | `g5-star-clock` | `G05-U01-L03` | Star Clock | Central angles in degrees; fractions of a turn |
| 05 | `g5-oud-majlis` | `G05-U02-MATH-L02` | Oud Majlis | Unlike denominators; product of a fraction of a fraction |
| 06 | `g5-map-grid` | `G05-U02-MAT-L02` | Map Grid | Ordered pairs in the first quadrant; numerical patterns |
| 07 | `g5-madrasa-volume` | `G05-U02-MAT-L01` | Madrasa Volume | Composite (L-shaped) additive volume and capacity |
| 08 | `g5-harmony-percent` | `G05-U03-L13` | Harmony Percent | Percent ↔ fraction ↔ decimal on a labelled mixture |
| 09 | `g5-zellige-courtyard` | `G05-U04-L18` | Zellige Courtyard | Regular polygons, tiling by 360°, panel area |
| 10 | `g5-caravan-rate` | `G05-U02-L08` | Caravan Rate | Bearing, ordered pair and speed = distance ÷ time |

### ⚠ The two near-identical codes are **not** duplicates

`G05-U01-MATH-L02` (decimals to thousandths) and `G05-U01-MAT-L02` (volume in unit cubes) are
**different lessons**. So are `G05-U02-MATH-L02` (unlike-denominator fractions) and `G05-U02-MAT-L02`
(coordinate plane). The extra `H` is the whole difference; each pair lives in a different document with a
different standard. They are never collapsed, never aliased and never share a `LESSONS` entry. Any future
tooling that matches on unit code must compare the **full** string.

### Why volume is split across two games

`G05-U01-MAT-L02` (packing, 5.MD.C.3b: no gaps, no overlaps) and `G05-U02-MAT-L01` (decomposition,
5.MD.C.5c) overlap in the curriculum. Game 03 takes **packing and counting**, game 07 takes **B × h and
additive composite volume**. Neither repeats the other's rounds.

---

## 3. The lesson frame now rendered in every game

Each game carries a `LESSONS[gameId]` entry in `games/_fikr/shared/lessons.js` (17 units / 49 lessons
total; this set adds 5 units and 10 lessons). `shared/lesson.js` renders it **below** the play cards and
collapsed, so a child reaches the game immediately while an adult can open the plan. The P2 status line
stays above the fold and is never hidden behind the expander.

| Section | Requirement | Delivered |
|---|---|---|
| الآية | mushaf-verified verse anchor | one per unit (5 units, U01–U05) |
| الجذور | three-letter Quranic roots | 3 per unit |
| caution | anti-overreach rule | every unit, in the unit `note` |
| الأهداف | ≥ 5 objectives | 5 per game |
| القصة | story and prior-learning link | 1 per game |
| المحطات | ≥ 3 stations with differentiation | 3 per game (three levels = three CRA stations) |
| التسلسل | time blocks to 70 min | 7 blocks per game |
| الخروج | exit card ≥ 4 items أ–د + criterion | 4 items + criterion per game |
| الواجب | homework ≥ 2 items | 2 screen-free tasks per game |
| المراجعة | reflection | 1 per game |
| P2 | status line | rendered in all 50 games |

**Units:** U01 الفلك والمواقيت · U02 الملاحة والسنن الجيولوجية · U03 الكيمياء وتحولات المادة ·
U04 العمارة الإسلامية والأندلس · U05 القياس والزوايا والأوقات. Game 04 cites `G05-U01-L03` but is filed
under `G05-U05` because its mathematics is the measurement/angle unit.

### Where the caution comes from

Each unit note is copied in substance from its source document and enforces the same discipline as Grades
1–4: the verse frames value, it is not a description of an algorithm.

- U01 — «الآية في إحصاء الله لكل شيء علمًا، وليست وصفًا لقيمة منزلية أو لقاعدة عشرية» — and, from the L03
  kit, **no qibla direction may be inferred from a drawn sector.**
- U02 — the verse is about the sea being made subservient, **not** a definition of coordinates, azimuth or
  the speed formula.
- U03 — تقدير, not a concentration or a chemical equation. The percent game gives **no medical, agricultural
  or dosing advice**; it is arithmetic on a labelled teaching mixture.
- U04 — إتقان الخلق, not a definition of a regular polygon or a tiling rule; zellige is presented as the
  geometric craft of Muslim artisans, **not** as a measure of creation.
- U05 — منازل القمر, not an endorsement of a particular angle; the 360-part division of the circle is a
  **human mathematical convention** and is taught as such.

Any future edit must preserve this boundary.

---

## 4. Evidence boundary

> **Draft-aligned prototypes. Not curriculum-approved, not classroom-tested (P2).**
> Standards-aligned at the CCSS level. Quranic anchors and lesson-frame sections are pedagogical framing
> and do **not** constitute religious ruling or tafsir. The unit→verse mapping is a pedagogical judgment
> and needs a scholarly pass before classroom use.

- **Demonstrated:** 10/10 games pass the mechanical harness `tools/fikr_games_qa.mjs` — 18 rounds, 3 level
  dialogs, 4 learn slides with 2 gates, ≥1 star per level, trophy, no console errors, no network, no
  `[object Object]`/`NaN`/`undefined` leaking into prompt or options. 10/10 lesson frames render at 390 px
  with every required section present. 1,200 generated questions across all 30 levels were checked
  directly: **no round renders two buttons with the same text, and the answer is always among the
  options.** All 50 games across Grades 1–5 are offline, self-contained, with no remote assets and no
  unmapped emoji glyphs.
- **Not demonstrated:** that any child learns more. No classroom trial, no pre/post measure, no teacher
  review of objective wording. The 9-track (المسارات) layer is not rendered at all.
- **Not one-game-per-lesson everywhere:** Grade 5 has ten source documents mapped one-to-one here, but
  four of them are unit-level codes (`G05-U01-MAT-L01` style) rather than the v3 bundle's lesson codes.

---

## 5. Named misconceptions (as declared in each source header)

`decimal-point-glued` — 0.47 × 10 = 0.470 (01) · `longer-decimal-is-bigger` — 0.403 > 0.43 (02) ·
`counts-faces-not-cubes`, `packs-with-gaps` (03) · `quarter-turn-is-90-not-¼` (04) ·
`add-tops-and-bottoms` — 1/2 + 1/3 = 2/5 (05) · `reads-pair-as-(y,x)`, `pattern-by-counting` (06) ·
`says-volume-is-area`, `forgets-second-prism` (07) · `percent-means-per-ten`, `0.4% = 0.4` (08) ·
`shape-by-look`, `tiling-depends-on-size` (09) · `bearing-clockwise-from-east`, `speed-times-time` (10).

---

## 6. Build and verify

```bash
node tools/build_fikr_games.js grade5          # → 10 HTML, ~386 kB each
LD_LIBRARY_PATH=/tmp/al/lib:/tmp/al/lib2 PPTR=/tmp/pp/node_modules/puppeteer-core CHROME=/tmp/chromium \
  node tools/fikr_games_qa.mjs grade5           # → 10/10 games clean  (add --shots for screenshots/)
LD_LIBRARY_PATH=/tmp/al/lib:/tmp/al/lib2 node /tmp/framecheck.mjs grade5   # → 10/10 frames clean @ 390 px
```

Screenshots land in `screenshots/grade5-fikr/` (50 PNGs + `qa.json`).

---

## 7. Fixes carried into this set

- **Duplicate option buttons.** A distractor is sometimes built from the same numbers the answer is
  (most visibly in `06-map-grid`, which offers both `(x, y)` and `(y, x)` — identical whenever
  `x === y`). The engine does not dedupe, so two identical buttons could appear and one of them would be
  the answer. Every grade-5 source now routes its rounds through `GAME.fixOpts(this.roundRaw(i))`, which
  **never rewrites the answer's own button** (the engine matches options by text, so rewriting it makes
  the right answer unselectable) and repairs only the later duplicates — `±1 / −1 / +10 / +2` for
  numbers, `(n+k)/d` for pure fractions, a trailing `·` otherwise. `05-oud-majlis` no longer needs its
  `a === b` restart, because its pairs are distinct by construction.
- **The helper must hang off `GAME`, not the level.** The engine calls `round` **detached** from the
  level object, so a `this._fix(...)` or module-scope `fixOpts` reference threw `this._fix is not a
  function` at runtime (and Node's `--check` cannot see it). `fixOpts` is a `GAME` property; the level
  method is `round(i) { return GAME.fixOpts(this.roundRaw(i)); }`.
- **Emoji coverage.** `📋 🧊 🌙` were unmapped and rendered as tofu. All three now map to hand-drawn
  inline SVG in `shared/icons.js` (`clipboard`, `icecube`, `moon`); the Grade 5 set has 0 unmapped glyphs.
- **`SCENE5.coordinatePlane` signature.** The first draft passed the axis length where the scale belonged.
  The scene now takes `{ scale, max, points, dot, caption }` — `scale` is the degrees-per-unit step, `max`
  the axis width — and both callers (`06-map-grid`, `10-caravan-rate`) were corrected.
- **Shared-layer naming.** The shared block already owns `UNITS`; the new scene library declares only
  `SCENE5` and the lesson frame uses `LESSON_UNITS`, avoiding a `const` collision that would blank every
  page.

---

## 8. Files added for this set

`games/grade5/src/*.js` (10 sources) · `games/grade5/*.html` (10 built, self-contained) ·
`games/grade5/index.html` (hub, accent `#1f6f8b`) · `games/grade5/index.json` ·
`games/_fikr/shared/scenes-5.js` (15 exports) · additions to `games/_fikr/shared/lessons.js`,
`games/_fikr/shared/icons.js`, `games/index.html` (Grade 5 card) and `tools/build_fikr_games.js`
(`EXTRA_LIBS.grade5`) · `tools/patch_g5_options.py` (one-shot option-hygiene patch; self-skips once
`fixOpts` is present).

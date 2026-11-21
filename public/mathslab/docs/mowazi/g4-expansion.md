# Grade 4 lesson games — expansion record

**Status: P2 — draft prototypes. Not curriculum-approved, not classroom-tested.**
Ten self-contained offline HTML games in `games/grade4/`, one per Grade 4 objective, built from the
verbatim Fikr lesson-game template. Hub: `games/grade4/index.html`.

---

## 1. Source ledger

| Source | What was taken |
|---|---|
| `G04-U01-MATH-L02` — الضرب متعدد الأرقام بنماذج المساحة والقيمة المنزلية (4.NBT.B.5) | Area-model multiplication (game 01), place-value framing (game 09) |
| `G04-U02-MATH-L02` — الكسور المتكافئة ومقارنة الكسور (4.NF.A.1–2) | Comparing fractions (game 05) |
| `G04-U02-MATH-L02` — جمع الكسور وطرحها ذات المقامات المتشابهة (4.NF.B.3) | Like-denominator sums (game 06) |
| `G04-U01-MAT-L01` — القيمة المكانية حتى الملايين والمقارنة الضربية (4.NBT.A.1 & 4.OA.A.1) | Place value **to the millions** (game 09), multiplicative comparison |
| `G04-U01-L01 … L05` — الخوارزميات وبناء الحساب | Story framing for the workshop, depot and survey games |
| `موازي — منهج ومشاريع السنة الرابعة` (scope spreadsheet) | Unit→strand ceiling, including the millions requirement |
| `AUDIT REPORT — نبع / موازي G2–G9` (folder `02 — المنهج`) | The ten-section lesson frame this set now renders |
| `grade-04.md` brief + `fikr-game-design-guide.md` | Game mechanics, band settings, misconception naming |

Sources **not** used: `education_resources.html` is marked OLD / superseded 2026-11-15.

---

## 2. Game map

| # | id | code | Title | Objective |
|---|---|---|---|---|
| 01 | `g4-carpet-workshop` | G04-MAT-01 | Carpet Workshop | Two-digit × two-digit multiplication on an area model |
| 02 | `g4-pearl-divers` | G04-MAT-02 | Pearl Divers | Multi-digit ÷ one digit with partial quotients |
| 03 | `g4-aquarium-trip` | G04-MAT-03 | Aquarium Trip | Find the hidden question in a two-step story |
| 04 | `g4-falcon-factors` | G04-MAT-04 | Falcon Factors | All factor pairs; prime or composite |
| 05 | `g4-khandaq-compare` | G04-MAT-05 | Khandaq Compare | Compare fractions with unlike denominators |
| 06 | `g4-majlis-fractions` | G04-MAT-06 | Majlis Fractions | Add and subtract like-denominator fractions |
| 07 | `g4-halala-decimals` | G04-MAT-07 | Halala Decimals | Decimals to hundredths from a hundred grid |
| 08 | `g4-ridge-angles` | G04-MAT-08 | Ridge Angles | Measure and classify angles |
| 09 | `g4-dune-place` | G04-MAT-09 | Dune Place | Place value **to the millions**; compare seven-digit numbers |
| 10 | `g4-pigeon-loft` | G04-MAT-10 | Pigeon Loft | Classify quadrilaterals by property |

---

## 3. The lesson frame now rendered in every game

Each game carries a `LESSON` entry (in `games/_fikr/shared/lessons.js`, keyed by game id) that supplies
the parts of the ten-section نبع/موازي frame a practice game cannot carry alone. `shared/lesson.js`
renders it **below** the play cards and collapsed, so a child still reaches the game immediately while an
adult can open the plan. The P2 status line stays above the fold and is never hidden behind the expander.

| Section | Requirement | Delivered |
|---|---|---|
| الآية | mushaf-verified verse anchor | one per unit (12 units across Grades 1–4) |
| الجذور | three-letter Quranic roots | 2–3 per unit |
| caution | anti-overreach rule | every unit: *the verse frames value, it is not a description of an algorithm* |
| الأهداف | ≥ 5 objectives | 5 per game |
| القصة | story and prior-learning link | 1 per game |
| المحطات | ≥ 3 stations with differentiation | 3 per game, mapped to the three CRA levels |
| التسلسل | time blocks to 70 min | 7 blocks per game |
| الخروج | exit card ≥ 4 items أ–هـ + criterion | 4 items + criterion per game |
| الواجب | homework ≥ 2 items | 2 screen-free tasks per game |
| المراجعة | reflection | 1 per game |
| P2 | status line | rendered in all 40 games |

### The caution is copied from the source, not invented

`G04-U01-MAT-L01` states of Sūrat Maryam 94: «ليست الآية وصفًا لخوارزمية القسمة» — the verse is not a
description of the division algorithm. Every unit in `lessons.js` carries the same discipline. The verse
supplies value framing; the mathematics is built on the model. Any future edit must preserve this.

---

## 4. Evidence boundary

> **Draft-aligned prototypes. Not curriculum-approved, not classroom-tested (P2).**
> Standards-aligned at the CCSS level. Quranic anchors and lesson-frame sections are pedagogical framing
> and do **not** constitute religious ruling or tafsir. The unit→verse mapping is a pedagogical judgment
> and needs a scholarly pass before classroom use.

What is and is not demonstrated:

- **Demonstrated:** 10/10 games pass the mechanical harness (18 rounds, 3 level dialogs, 4 learn slides
  with 2 gates, ≥1 star per level, trophy, no console errors, no network). 10/10 lesson frames render at
  390 px with all required sections present. Offline, self-contained, no remote assets.
- **Not demonstrated:** that any child learns more. No classroom trial, no pre/post measure, no teacher
  review of objective wording. The 9-track (المسارات) layer is not rendered at all.
- **Not yet one-game-per-lesson:** Grade 4 has fewer real lesson documents than it has objectives, so
  coarse unit codes (G04-U01, G04-U02) are used where a specific lesson code does not exist. Only game 01
  cites a real document code.

---

## 5. Named misconceptions

`partial-forgot`, `split-not-place` (01) · `div-remainder-drop`, `div-partial-stop` (02) ·
`skipped-hidden-q`, `forgot-each`, `wrong-operation` (03) · `factor-one-pair`, `factor-confuse-multiple`,
`prime-square` (04) · `cmp-bigger-den` (05) · `frac-add-den`, `frac-sub-both` (06) ·
`dec-tenths-hundredths`, `whole-to-fraction` (07) · `angle-right-90`, `angle-read-other-side` (08) ·
`pv-more-digits-wins`, `pv-first-digit-only` (09) · `shape-by-look`, `shape-property-one` (10).

---

## 6. Build and verify

```bash
node tools/build_fikr_games.js grade4          # → 10 HTML, ~330 kB each
LD_LIBRARY_PATH=/tmp/al/lib PPTR=/tmp/pp/node_modules/puppeteer-core CHROME=/tmp/chromium \
  node tools/fikr_games_qa.mjs grade4          # → 10/10 games clean
node /tmp/framecheck.mjs grade4                # → 10/10 lesson frames clean at 390 px
node /tmp/emojisweep.mjs                       # → 0 unmapped glyphs
```

---

## 7. Fixes carried into this set

- **Place value ceiling.** `09-dune-place` originally stopped at 100,000; the scope requires
  **حتى الملايين**. `SCENE4.placeChart4` was generalised to 4–7 columns and the game now runs to seven
  digits, with the comparison round using two seven-digit numbers so the digit count cannot decide.
- **Hero art.** All ten Grade 4 games previously had no scene and fell back to the first Grade 1 picture,
  showing a fishing cove above "Carpet Workshop". All ten now have authored scenes, and the fallback is a
  neutral horizon rather than another grade's place.
- **Emoji coverage.** Eight Grade-4 glyphs (🧶 🕊 🫖 🚌 ➗ 🔗 🌉 🏜) were unmapped and rendered as tofu
  boxes in the how-to list and level chips. All eight now map to hand-drawn inline SVG.

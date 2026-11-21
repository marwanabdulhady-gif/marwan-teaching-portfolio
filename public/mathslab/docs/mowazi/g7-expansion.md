# Grade 7 lesson games — expansion record

**Status: P2 — draft prototypes. Not curriculum-approved, not classroom-tested.**
Six self-contained offline HTML games in `games/grade7/`, one per Grade 7 mathematics lesson document,
built from the verbatim Fikr lesson-game template (`games/_fikr/engine/fikr-lesson-game-template.html`,
never modified). Hub: `games/grade7/index.html`. Sources: `games/grade7/src/01-market-graph.js` …
`06-dome-corner.js`. Scenes: `games/_fikr/shared/scenes-7.js`.

---

## 1. Where the Grade 7 mathematics actually lives

The Grade 7 folder at the top level of the Drive tree holds **digital-literacy** documents
(`G07-U01-L01…L05`, `P25`, and a further twenty). It also holds one bundle code that is a **folder**, not a
document: `G07-U02-L08`, whose contents are the physics of sound, articulation and neurolinguistics. None of
that is mathematics.

The mathematics is a **subfolder**, and Grade 7's is much richer than Grade 6's — six documents across two
terms rather than one per term:

```
الرياضيات  (1GofoS7E77SUUxJiU1OEdcw4TxMkdasyg)
├── الترم الأول   (1m8oDb2gjQgA97CYwD3r2QzCZxlSRNtgc)  → G07-U01-MAT-L01, G07-U01-MAT-L02,
│                                                          G07-U01-MATH-L02, G07-U02-MAT-L01,
│                                                          G07-U02-MATH-L02
└── الترم الثاني  (1RP50yQEKkNN0NfWsuUqwq6LKeVU1gzvj)  → G07-U02-MAT-L02 (circle + angles)
```

Every game in this set is derived from that subfolder, never from the digital-literacy documents at the top
level and never from the `G07-U02-L08` folder.

---

## 2. Source ledger

| Source (Drive, الرياضيات) | What was taken | Game |
|---|---|---|
| `G07-U01-MATH-L01` — العلاقات التناسبية ومعدل التغير الثابت (7.RP.A.1–2) | Ratio of fractions as a unit rate, k = y ÷ x from a table, filling a missing cell, the zakat 2.5% anchor kept as a rate | 01 Market Graph |
| `G07-U01-MAT-L02` — الأعداد النسبية الموجبة والسالبة على خط الأعداد (7.NS.A.1–2) | Signed addition and subtraction as hops, subtracting a negative, the zero pair p + (−p) = 0, distance \|p − q\| | 02 Signed Ledger |
| `G07-U01-MATH-L02` — العمليات على الأعداد النسبية وتحويل الكسور (7.NS.A.1–3) | Long division to a terminating or repeating decimal, p − q = p + (−q) applied to rationals | 03 Decimal Mill |
| `G07-U02-MAT-L01` — ثابت التناسب والتمثيل البياني (7.RP.A.2a–b, A.3) | Table ↔ equation ↔ graph, the point (1, k), and the test that rejects a straight line that misses the origin | 04 Constant Line |
| `G07-U02-MATH-L02` — النسب والخصومات المتتالية (7.RP.A.3) | Successive percent decreases, the lesson's own 20%-then-10% ≠ 30% but 28% | 05 Discount Chain |
| `G07-U02-MAT-L02` — الدائرة والزوايا (7.G.B.4, 7.G.B.5) | C = 2πr, A = πr², the diameter trap, al-Kāshī's π, complementary / supplementary / vertical angles, the one- and two-step angle equation | 06 Dome and Corner |

---

## 3. Scope decisions — where the six documents overlap

The six documents are not six disjoint topics. Three pairs overlap, and the split below is deliberate so
that no two games drill the same task:

- **Proportional relationships appear in four documents.** `G07-U01-MATH-L01` (01) takes *one* unit rate in
  a money context. `G07-U02-MAT-L01` (04) takes *representations* and the proportionality test. Neither
  repeats the other's round type. `G07-U01-MATH-L02` (03) does not touch proportionality at all — it is the
  rational-arithmetic document — and `G07-U02-MATH-L02` (05) takes only the multi-step percent strand of
  RP.A.3, not the constant.
- **`G07-U01-MAT-L02` and `G07-U01-MATH-L02` are two different lessons, not a typo.** The first is the
  signed number line (7.NS.A.1–2); the second restates it and then goes on to rational arithmetic and
  decimals (7.NS.A.1–3). Game 02 owns the line and the zero pair; game 03 works on the numbers and never
  redraws a hop.
- **`G07-U02-MAT-L02` is one 45-minute lesson with two strands** — the circle and the angle pairs. It is
  built as **one** game with both, because splitting a single period into two games would misrepresent the
  document. Its discipline: circle rounds and angle rounds never share a level.
- **`G07-U02-L08` was read and set aside**: it is a folder on acoustics and articulation, not mathematics.

Dropped from scope deliberately, with the reason recorded rather than hidden:

- **Scale drawings (7.G.A.1) and multi-step financial modelling** reach into `G07-U01-MATH-L02`'s stated
  "financial and geometric problems" only as an extension; they were drafted as a seventh game and removed,
  because none of the six documents actually teaches a scale factor. A scale-drawing document, if it exists
  in a later grade, should own that game.
- **Long division of signed decimals to four places**, in `G07-U01-MATH-L02`'s closing objective, is set as a
  screen-free practice task in the frame rather than as a game round: it is fluency, not a model.
- **Absolute value as a formal notation** is touched only where the document uses it (distance between two
  points on the line), not as a separate topic.

---

## 4. Methodology carried from the template

Each game is the verbatim Fikr engine with only its own block authored, and each renders the نبع/موازي
ten-section lesson frame under the play cards:

1. the unit's Quranic verse anchor and its **anti-overreach caution** (the verse governs the value, never the
   formula);
2. three-letter roots;
3. the story;
4. five objectives, written first-person;
5. the three levels presented as **stations**;
6. the seven-block time budget (٥ / ٧ / ١٠ / ١٥ / ١٠ / ٨ / ٥ د);
7. an exit card of four graded items;
8. a one-line success criterion (`ls-crit`);
9. two **screen-free** homework tasks;
10. a reflection prompt — closing with the P2 status line.

Three Grade 7 units were added to `games/_fikr/shared/lessons.js` (`G07-U01`, `G07-U02`, `G07-U03`), each with
its own verse, roots and caution note. The two Grade 7 codes that differ by a single letter
(`MAT-L02` / `MATH-L02`) are kept as separate units of work, exactly as in Grade 6.

---

## 5. Build and gates

```
node tools/build_fikr_games.js grade7      # 6 games, scenes-7.js added to EXTRA_LIBS.grade7
node .scratch/static_gate.mjs grade7       # 6/6 clean · 108 rounds · 36 CUBES blocks
```

The browser gates (`tools/fikr_games_qa.mjs`, the option-duplicate sweep, the frame sweep) could not be run in
this environment — headless Chromium would not start for want of the system NSS stack. `.scratch/static_gate.mjs`
reproduces their assertions in jsdom against the same built HTML: boot with no page error, every Learn slide
including the locked ones, all three levels played to the finale, **options unique and the answer always one of
them**, every distractor diagnosed by `why()`, three hints per round, and the frame's sections, success
criterion and P2 line. Screenshots remain outstanding and must be taken before any classroom use.

Every think level carries exactly six CUBES problem blocks per game (two think rounds × three rounds across
the level's two think rounds), matching the `cubes:6` assertion the grade gates use.

---

## 6. Named misconceptions

Each game names three, and each appears both as a Ghubar line and as a wrong option with its own diagnosis:

| Game | The misconception it is built against |
|---|---|
| 01 Market Graph | k is the difference y − x; one matching pair proves proportionality; divide x by y |
| 02 Signed Ledger | −7 − 3 = −4; cancelling a debt still leaves you owing; a distance can be negative |
| 03 Decimal Mill | every fraction is repeating; 7/8 = 0.78; p − q = q − p |
| 04 Constant Line | any straight line is proportional; a steady table is enough; y = kx and y = kx + b are the same |
| 05 Discount Chain | 20% then 10% is 30%; the percent is what you pay; a rise then the same fall returns you |
| 06 Dome and Corner | area is 2πr; the diameter is the radius; vertical angles add to 180° |

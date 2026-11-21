# MathsLab — the Drive folder, rebuilt for the web

This folder contained 31 items from an old Windows/Flash maths toolkit: ClickOnce
`.application` manifests, Flash 5/6 projector `.exe`s (the .NET `setup*.exe` files are
their installers) and a few Excel worksheets. None of them run on a modern machine —
Flash was switched off in 2020 and the installers are 32-bit Windows only.

Everything has been rebuilt as one static website: **a course-first front end**
(6 courses → 42 chapters → 23 lesson pages, plus the three Holt question-bank books and
the six FikrCounts exam programs), **21 rebuilt apps** and the **21-mode Maths Arcade**, the **Question Studio**
(4,741 questions merged from every source) and a **question generator** of 112 algorithmic
recipes, plus a dedicated **17-game bilingual Kindergarten Math Garden** for ages 4–6, plain HTML/CSS/JS,
no build step, no dependencies, no plugins. Open `index.html` directly, or serve the
folder with any static host (a `vercel.json` and a zero-dependency `server.js` are included).

## What maps to what

| Original file | Web app | Route |
|---|---|---|
| `Handy Graph.exe` + `Algebra.application` (HU9 plotter) | Function plotter with window/zoom, pan, table of values | `#/hu9graph` |
| `Polar Graphs.xlsx` | Polar grapher `r(θ)` with roses, cardioids, spirals | `#/polar` |
| **Desmos Graphing** tab in every Dr. Math Azzam course page (live `desmos.com` API embed) | **Graphing Calculator** rebuilt natively — six expressions, auto parameter sliders (a, h, k …), drag-to-trace with tangent and slope, intersections by bisection, table of values, two-sided limit explorer. No API key, no network, works offline | `#/graphcalc` |
| `SpeedPractice.xlsx` | 32-question speed sheets, 4 operations, printable + answer key | `#/speedpractice` |
| `Times Tables Master.exe` | 60-second tables drill, best score & streak saved | `#/timestables` |
| `Application Files/` (ClickOnce payload) | Printable 1–12 times-table grids | `#/tablesheets` |
| `Buying With Coins.exe` | Coin tray: pay exactly / work out change | `#/coins` |
| `Finding Change.exe` | Shopkeeper change questions with coin answers + receipts | `#/change` |
| `Algebra.exe` + `factorising quadratics.exe` | Expand & factorise with the rectangle model | `#/algebra` |
| `sequences.exe` | Next terms, differences and the nth term | `#/sequences` |
| `Whats My Angle.exe` + `trignometry.exe` | Right-triangle trig explorer + "find it" mode | `#/angles` |
| `Probtools.exe` | Dice / coin experiments, experimental vs theoretical, two-dice sums | `#/prob` |
| `Pi - Recursive Formula.xlsx` | Brent–Salamin recursion to π, digit-by-digit | `#/pi` |
| `501 Darts.exe` | Full 501 match vs computer or a friend, doubles out | `#/darts501` |
| `3 Dart Checkout.exe` | Checkout trainer 41–170 with textbook routes | `#/checkout` |
| `Alien Coordinate Game.exe` | Click/type coordinate game, 1 or 4 quadrants | `#/aliens` |
| `asteroids.exe` | Arcade times-table shooter | `#/asteroids` |
| `transformations game.exe` | Reflect / rotate / translate lab with challenge mode | `#/transform` |
| EduMagnet game library (separate Drive folder: 21 Flash-era game modes) | **Maths Arcade** — all 21 modes rebuilt for maths, every question generated | `#/arcade` |
| protractor & ruler (new) | Drag a ray across a half-circle protractor, drag a bar along a millimetre ruler, then measure both blind | `#/protractor` |
| unit-circle explorer (new) | Drag the terminal side round the circle: exact and decimal sin, cos, tan, plus a special-angle quiz | `#/unitcircle` |
| `Question Sets/` — 31 Holt `.bnk` banks (+ `Quiz Show SE` app) | Chapter quiz game: 31 chapters, 439 skills, generated questions, team scoring | `#/quizshow` |
| all four question sources (`bnk`, FikrCounts, calculus bank, lesson quizzes) | One searchable, playable question deck with answer checking and practice runs | `#/questions` |

Not rebuilt: `setup*.exe` / `.application` installers (no maths content in them).
`Setup(1)`–`Setup(5)` were the installers for Algebra, ProbStat, SpeedPractice, GraphPaper
and Trigonometry — all of which are covered above.

## Courses — the way in

The site is organised by course, not by source bank. `#/courses` is the front door.

| Course | Shape | Questions |
|---|---|---|
| **Fundamentals of Math** | 11 chapters · 57 lessons | **440** — 204 written for the course, the rest filed by skill |
| Calculus (Grade 12) | 3 chapters · 14 lessons | 165 keyed calculus/lesson-quiz items |
| Precalculus (Grade 11) | 2 chapters · 9 lessons | included above |
| Algebra 1 · Course 1 · Course 2 | 31 chapters, skills inside each | 2,840 recovered `.bnk` items |
| Exam Preparation | 6 programs (SAT, SAAT, GAT, NAFS, NASMO, Remedial) | 1,736 FikrCounts MCQs |

Every course page opens with a **live figure** for that course — see
[A live figure at the top of every course](#a-live-figure-at-the-top-of-every-course).

A **lesson page** carries what the captured course pages had, rebuilt natively:

* **Worked example, step by step** — the original steps, one at a time (`Next step`, `Back`,
  `Reveal all`). The steps are stored as TeX and rendered by the local KaTeX, so a 5 KB
  block of server-rendered HTML becomes ~150 bytes of data.
* **The graphs the lesson shipped with** — inline SVG recovered from the captured pages
  (Tailwind classes stripped, the duplicate MathML copy of every formula dropped, ids
  re-scoped so several figures can share a page).
* **A live graph lab** — canvas plotter with drag-to-pan, scroll-to-zoom, double-click reset,
  a hover trace readout and an editable expression box. It accepts the same notation the
  lesson labels used (`x³ − 4x`, `√(x − 3)`, `|x − 1|`, several curves separated by `;`),
  so every captured figure with a named function can be re-plotted and poked at.
* **Your turn** — the questions filed under that lesson, as the same marked cards the
  studio uses, with a hand-off button that opens the whole lesson set as a practice run.

`assets/data/courses.js` is generated by `tools/gen_courses.py`, which reads
`lessons.json` (course/lesson/topic spine), `worked-steps.json` (the step blocks) and the
captured `lesson-*.html` pages (figures), and files every keyed question under a lesson
from its id (`cb:p1-…` → P1, `cb:l13-…` → 1.3, `cb:ratesChecks-…` → 2.6, `lab:2-4:…` → 2.4).
Review lessons collect every question in their chapter.

The studio itself is now course-aware too: a row of course pills filters the deck in place,
the sidebar switches to that course's chapters and lessons, and any lesson or chapter can be
handed to the studio for a scored run (`Practise this course` / `Practise 7 questions`).

### Fundamentals of Math — a new course, built from the Drive course

`#/courses/fom` (also the first card on `#/courses`). The source was the 11-section
*Fundamentals* course in Drive folder `1Lly9-xpGhjV0U7H2PnfavZfaR3vqFLlQ` — 229 files:
125 `.html` resource cards, 61 `.vtt` transcripts and 43 `.pdf` sheets. Those were read to
recover the chapter order, the lesson list and the scope of every topic; the wording, the
worked steps and all the questions are written for MathsLab.

| # | Chapter | Lessons | What it covers |
|---|---|---|---|
| 1 | Getting started | 2 | how the course runs, the formula sheet |
| 2 | Numbers and negative numbers | 8 | the number line, number sets, identity, opposites, ± × ÷ with signs, absolute value |
| 3 | Factors and multiples | 7 | divisibility, multiples, primes, prime factorisation, LCM, GCF |
| 4 | Fractions | 8 | what a fraction is, reducing, equivalent fractions, division of zero, ± × ÷, signs, reciprocals |
| 5 | Mixed numbers | 5 | improper ↔ mixed, ± × ÷, comparing, mixed measures |
| 6 | Decimals | 5 | place value, decimal arithmetic, repeating decimals, rounding, decimals as fractions |
| 7 | Ratio and proportion | 4 | ratios, cross products, unit price, unit multipliers |
| 8 | Exponents | 5 | exponents, the rules, power rule, quotient rule, putting them together |
| 9 | Radicals | 5 | square roots, ± × ÷, rationalising, simplifying |
| 10 | Scientific notation | 6 | powers of ten, the format, × ÷, mixed operations, estimating |
| 11 | Final exam and wrap-up | 2 | 12 questions · 100 points · 60 minutes, then what's next |

Every lesson carries four things. **A Try it manipulative** built for that lesson (see the
manipulatives section below). **The idea in plain words** — two short paragraphs plus a
"Watch out" line, with the maths typeset inline (57 bodies, ~4,200 words, 372 formulas).
**A worked example of 4–6 steps** in TeX (286 steps across the course). And a **"Your turn" set
of 4–12 marked questions**, 440 in total. Four data files do the work:

* `assets/data/fundamentals.js` — the course spine: chapters, lessons, topics, the teaching
  body, steps and the question ids filed under each lesson. Generated by `tools/fundamentals/build.py`, which takes
  the curriculum and the skill/text matchers from `tools/fundamentals/course_data.py` and pulls
  matching questions out of the live index (one per unit per round, so a lesson never gets
  six questions from the same paper).
* `tools/fundamentals/lesson_notes.py` — the teaching body of all 57 lessons, one entry per
  code. `build.py` copies it in and fails loudly if a lesson has no entry.
* `assets/data/fomq.js` — **204 questions written for this course**: three per lesson plus a
  12-question final exam, each with its key, a hint and the reasoning. The site's other banks
  are deep on integers, factors, fractions, exponents and radicals but have almost nothing on
  mixed measures, unit price, rounding or scientific notation, so those lessons are supplied
  here. Generated by `tools/fundamentals/qbank.py`.
* `assets/qdata.js` gained a fifth source (`fom`) so those questions appear in the Question
  Studio next to everything else, answered and scored like any other card.

The lesson page renders the body as a "The idea" block above the worked example
(`.co-idea` in `qcourses.css`, subsection headings for each part). Two site fixes came with it: the maths renderer now runs over question **hints and
explanations** (they used to be inserted as raw HTML, which both hid TeX and swallowed any
`<` in the text), and a lesson can opt out of the function-plotting lab with `nolab` — a
course about factors and fractions has no curve to plot.

### A manipulative in every lesson — `assets/apps/manip.js`

Every lesson on the site now opens with a **Try it** block: one small interactive built for that
lesson, sitting between the explanation and the worked example. **26 labs cover all 80 lessons** —
57 in Fundamentals of Math, 14 in Calculus, 9 in Precalculus — and every one of them is both a
picture (SVG, redrawn as you move it) and a control (drag, slider or click). The per-lesson audit
is `tools/manip-audit.md`, generated by `tools/maudit.js`.

The three Holt books and the exam-prep programmes carry questions and **no lessons**, so their
**chapters** get the interactive instead: 37 chapters, 37 labs, from 24 more engines — sort the like
terms, apply the inverse operations, draw a mapping and see whether it is a function, slide a
discriminant, strike out a prime's multiples, split fraction strips to the LCD, cross out answer
options and watch the guess odds move. Audit: `tools/chapter-audit.md`, generated by
`tools/chaudit.js`; **37/37 chapters have a figure, a control and a readout that moves**.

### Fifteen Fikr lesson games — `#/lessons` and `games/`

The upload included the Fikr game-design kit (a 1,143-line guide, a 13-grade index and a one-page
brief per grade, each with a skeleton). It now has **15 playable lesson games**: one for each grade
from Kindergarten to Grade 12, plus two more Grade 1 adventures. All use the local `games/fikr.js`
kit and keep each game focused on a single learning objective.

| grade | game | skill |
|---|---|---|
| K | Date Basket | counting objects 1:1 |
| 1 | Ten-Seat Dhow | make 10, add within 20 |
| 1 | Corniche Clock Tower | read time to the hour |
| 1 | Corniche Ruler | measure length in centimetres |
| 2 | Date Packing | place value to 1,000 |
| 3 | Palm Grove Arrays | multiplication as an array |
| 4 | The Hidden Question | multi-step problems, bar models |
| 5 | Kunafa Fractions | unlike denominators |
| 6 | Juice Bar Ratios | equivalent ratios, unit rate |
| 7 | Red Sea Dive | integer addition and subtraction |
| 8 | Graph Pilot | slope and linear functions |
| 9 | Falcon's Arc | vertex form |
| 10 | Tower Trig | SOH CAH TOA |
| 11 | NEOM Growth | exponential growth and logs |
| 12 | Haramain Rates | the derivative as a rate |

Each game is one offline HTML file in `games/play/`, inlined by `tools/build_games.js` (which
**refuses to write** a page containing a network URL). The kit supplies the ten parts the briefs ask
for: a coach, *How it works*, a four-slide **Learn** with your-turn gates, three CRA levels, a hint
ladder, **Show me**, misconception-categorised feedback, first-try stars and a finale. The rule the
guide calls *the mechanic is the thinking* is enforced by the design: in Kunafa Fractions you cannot
add until you have re-cut both trays; in Graph Pilot you cannot land until both the intercept and the
slope are right; in Haramain Rates the only route to the instant is to shrink the interval.

Two hubs read the same catalog and listen to the same postMessage contract
(`lesson:ready / progress / level / mistakes / done`): the in-site app at `#/lessons`
(`assets/apps/lessons.js`, first item in the Games menu) and the standalone `games/index.html`.
Both show live stars, rounds and the mistakes being made while a game is open, and keep best stars
per level on the device. Full notes: `games/README.md`.

### Grade 1 expansion — ten games on the Fikr template

A second Grade 1 set adds **ten games, one per step of the draft Grade 1 math sequence**, built from the
supplied Fikr lesson-game template rather than the repo's older kit: Rawi the guide and Ghubar the
mischief-maker, four guided Learn slides (hook → model → your turn → Ghubar's mistake), **CUBES think-first**
before every word problem, a strategy → step → near-answer hint ladder, and three CRA levels. Each game is one
offline HTML file in `games/grade1/`, with a hub at `games/grade1/index.html`.

The ten: Counting Cove (count to 20), Pearl Market (more/fewer/same), Oasis Addition Garden (add within 10),
Lantern Light-Out (subtract within 10), Coral Pattern Path (repeating patterns), Jeddah Tile Studio (2-D
shapes), Shell-Step Measure (non-standard length), Time in the Garden (o'clock and half past), Date-Shop Data
Detectives (picture graphs) and Story Scout (choose + or −).

The template engine is copied verbatim to `games/_fikr/engine/` and never edited; only the authored `GAME`
object and the shared picture library, icon set and theme (`games/_fikr/shared/`) sit below it. These are
draft-aligned prototypes, **not** curriculum-approved or classroom-tested: the evidence ledger is
`docs/mowazi/g1-expansion.md`, screenshots are in `screenshots/grade1-fikr/`, and browser QA is
`node tools/fikr_games_qa.mjs grade1` (10/10 games: 12 rounds, three level dialogs, four Learn slides with two
gates, no console errors). Build with `node tools/build_fikr_games.js grade1`.

### Grade 2 expansion — ten games on the same template

The Grade 2 set follows the same build and the same evidence rules, one game per objective: Date-Shop Packing
(place value to 1,000), Expanded-Form Workshop, Caravan Compare (`<` `>` `=`), Regrouping Depot (add within 100),
Lantern Borrow (subtract within 100), Falcon Hop (skip counting), Riyal Market (money and change), Crate Arrays
(repeated addition), Harbour Clock (time to five minutes) and Ridge Diagram (picture graphs with a key). Open the
hub at `games/grade2/index.html`; the ledger is `docs/mowazi/g2-expansion.md`, screenshots are in
`screenshots/grade2-fikr/`, and QA is `node tools/fikr_games_qa.mjs grade2` (10/10 clean).

### Grade 3 expansion — ten games on the same template

The Grade 3 set carries the same build and evidence rules to the band where the answer is a written relation,
not a count: Grove Rows (equal groups as a multiplication fact), Date Tray Sharing (division as equal sharing),
Terrace Arrays (rows × columns and the turnaround fact), Souq Tables (times-table steps), Falaj Fractions (unit
fractions), Fraction Line (fractions on a number line), Equal Shares (equivalent fractions), Courtyard Tiles
(area), Fence Walk (perimeter) and Rounding Road (nearest ten). Open the hub at `games/grade3/index.html`; the
ledger is `docs/mowazi/g3-expansion.md`, screenshots are in `screenshots/grade3-fikr/`, and QA is
`node tools/fikr_games_qa.mjs grade3` (10/10 clean — 18 rounds, three level dialogs, four Learn slides with two
gates, no console errors, no network requests).

### Grade 4 expansion — ten games, and the lesson-methodology layer

The Grade 4 set carries the same build and evidence rules to multi-digit work: Carpet Workshop (area-model
multiplication), Pearl Divers (division with partial quotients), Aquarium Trip (the hidden question in a
two-step story), Falcon Factors (factor pairs; prime or composite), Khandaq Compare (unlike denominators),
Majlis Fractions (like-denominator sums), Halala Decimals (decimals to hundredths), Ridge Angles (measuring
and classifying), Dune Place (place value **to the millions**) and Pigeon Loft (classifying quadrilaterals
by property). Open the hub at `games/grade4/index.html`; the ledger is `docs/mowazi/g4-expansion.md`;
QA is `node tools/fikr_games_qa.mjs grade4` (10/10 clean).

This set also closes a **methodology gap** that affected all four grades. An audit against the نبع/موازي
curriculum folder (`docs/mowazi/methodology-audit-g1-g4.md`) found the games were standards-aligned but
methodology-silent: no Quranic verse anchor, no roots, no exit card, no homework, and none of the mandated
P2 status line. `games/_fikr/shared/lesson.js` now renders the ten-section lesson frame under the play cards
of **all 40 Grade 1–4 games** — verse anchor, Quranic roots, the anti-overreach caution, five objectives,
the three levels reframed as stations, an exit card of four items أ–هـ with a success criterion, two
screen-free homework tasks, a reflection, and the P2 line above the fold. Every frame renders cleanly at
390 px with no console errors and no network requests.

Three defects found and fixed along the way: 23 of the 40 games had no hero art and silently showed the
first Grade 1 scene (a fishing cove above "Carpet Workshop"); `Dune Place` taught place value only to
100,000 when the Grade 4 scope runs to the millions; and eight Grade-4 emoji glyphs were unmapped and
rendered as tofu boxes.

### Grade 5 expansion — ten games, one per lesson document

The Grade 5 set changes the sourcing rule. Instead of one game per objective, each game is derived from a
**real lesson document** in the Grade 5 mathematics folder and keeps that document's own bundle code:
The Sliding Card (`G05-U01-MAT-L01`, place value to thousandths and powers of ten), Thousandths Workshop
(`G05-U01-MATH-L02`, decimals to thousandths), Cube Storehouse (`G05-U01-MAT-L02`, volume counted in unit
cubes), Star Clock (`G05-U01-L03`, central angles and fractions of a turn), Oud Majlis (`G05-U02-MATH-L02`,
unlike denominators and a fraction of a fraction), Map Grid (`G05-U02-MAT-L02`, ordered pairs and patterns),
Madrasa Volume (`G05-U02-MAT-L01`, composite volume and capacity), Harmony Percent (`G05-U03-L13`,
percent–fraction–decimal), Zellige Courtyard (`G05-U04-L18`, regular polygons and tiling) and Caravan Rate
(`G05-U02-L08`, bearing, position and speed). Hub: `games/grade5/index.html`; ledger:
`docs/mowazi/g5-expansion.md`; QA: `node tools/fikr_games_qa.mjs grade5` (10/10 clean). The pair
`G05-U01-MATH-L02` / `G05-U01-MAT-L02` are **different lessons** and are never collapsed.

### Grade 6 expansion — nine games from the mathematics subfolder

Grade 6 needed one extra step: the documents at the top of the Grade 6 folder are **science**, and the
mathematics is a subfolder (`الرياضيات` → `الترم الأول` / `الترم الثاني`). All nine games come from there and
keep their document's bundle code — Falcon Ratio (`G06-U01-MAT-L01`), Date Rate (`G06-U01-MATH-L02`, unit
rate, ratio tables and percent), Pulse Ratio (`G06-U01-L03`, rates from a recorded survey), Tape Share
(`G06-U02-MAT-L01`), Water Divide (`G06-U01-MAT-L02`, dividing fractions by how many groups fit), Altitude
Line (integers and distance), Balance Equation (`G06-U02-MAT-L02`, one-step equations and inequalities),
Shade Area (`G06-U04-L18`, area by decomposition) and Fair Share Data (mean, median, MAD). Hub:
`games/grade6/index.html`; ledger: `docs/mowazi/g6-expansion.md`; QA: `node tools/fikr_games_qa.mjs grade6`
(9/9 clean, 1,080 questions checked for duplicate options). `G06-U01-MATH-L02` (ratios) and
`G06-U01-MAT-L02` (dividing fractions) are different lessons; so are `G06-U02-MATH-L02` and
`G06-U02-MAT-L02`.

### Grade 7 expansion — six games from the mathematics subfolder

Grade 7 repeats the Grade 6 trap and then some: the top level of the Grade 7 folder is **digital literacy**
(including a `G07-U02-L08` *folder* of acoustics and articulation), and the mathematics sits in
`الرياضيات` → `الترم الأول` / `الترم الثاني`. That subfolder is far richer than Grade 6's — six documents
rather than two. All six are built here, each keeping its document's bundle code: Market Graph
(`G07-U01-MATH-L01`, unit rate and k = y ÷ x), Signed Ledger (`G07-U01-MAT-L02`, the signed number line and
the zero pair), Decimal Mill (`G07-U01-MATH-L02`, long division to terminating or repeating decimals and
p − q = p + (−q)), Constant Line (`G07-U02-MAT-L01`, table ↔ equation ↔ graph and the test that rejects a
straight line missing the origin), Discount Chain (`G07-U02-MATH-L02`, successive discounts — the lesson's own
20% then 10% is 28%, not 30%), and Dome and Corner (`G07-U02-MAT-L02`, the circle and the angle pairs, one
lesson built as one game). A seventh game on scale drawings was drafted and **removed**: none of the six
documents teaches a scale factor. Hub: `games/grade7/index.html`; ledger:
`docs/mowazi/g7-expansion.md`; new picture library `games/_fikr/shared/scenes-7.js` (coordinate graph,
signed number line, circle, angle pairs, paired table, price stack).

That brought the Fikr lesson sets to **65 offline games** across Grades 1–7, every one carrying the
ten-section نبع/موازي lesson frame and the P2 status line. Grades 1–6 were verified in headless Chromium;
Grade 7's six games were verified with the jsdom gate (now `tools/fikr_static_gate.mjs grade7` — 6/6 clean, 108
rounds, 36 CUBES blocks), because headless Chromium would not start in the build environment used for this
batch. **Grade 7 screenshots are outstanding** and must be taken before any classroom use.

### Grade 8 expansion — seven games from the mathematics subfolder

Grade 8 raises the trap to its highest level yet: the grade folder holds **24 top-level documents**, every one
of them carrying a `G08-` bundle code, and **all 24 are digital literacy, computing or science**. There is also
a `G08-U01-L03` *bundle* plus nine subject folders. The mathematics is four levels down, in
`الرياضيات` → `الترم الأول` / `الترم الثاني`, and that subfolder holds **seven documents**. All seven are built,
each keeping its document's bundle code: Slope Intercept (`G08-U01-MAT-L01`, slope from two plotted points,
m and b from y = mx + b), Builders Corner (`G08-U01-MAT-L02`, the hypotenuse, a missing side, and the converse
that tests a square corner), Two Planks (`G08-U01-MATH-L02`, two-step equations and systems by substitution),
Plan Choice (`G08-U01-L03`, a cost table turned into a rule, two plans at their crossing, and the limit of the
model), Steady Tank (`G08-U02-MAT-L01`, rate of change read out of a table), Grid Flight (`G08-U02-MAT-L02`,
distance between two plotted points from the two coordinate gaps), and Roof Span (`G08-U02-MATH-L02`, the
combined lesson, which is the only document that asks for a bound on the model).

Grade 8 has **two overlapping pairs plus a combined lesson**, so seven documents genuinely needed seven games:
document 01 leads with a figure and 05 leads with a recorded process on the same 8.EE.B.5–6 standard; 02 works
in masonry and 06 on the coordinate plane on the same 8.G.B.6–8 standard; 07 lists function, distance *and*
model limit together. The splits are stated inside each game's header and argued in the ledger. The `L03`
document says of itself that it is unapproved and that its digital build is deferred — game 04 is the
prototype it asks for, and the caveat travels with it. Hub: `games/grade8/index.html`; ledger:
`docs/mowazi/g8-expansion.md`; new picture library `games/_fikr/shared/scenes-8.js` (coordinate plane, slope
line with slope triangle, two lines and their crossing, right triangle, plotted distance, the four-triangle
square proof, worked-step table).

That brought the Fikr lesson sets to **72 offline games** across Grades 1–8, every one carrying the
ten-section نبع/موازي lesson frame and the P2 status line. Grade 8's seven games were verified with the jsdom
gate (`tools/fikr_static_gate.mjs grade8` — 7/7 clean, 132 rounds, 42 CUBES blocks), because headless
Chromium will not start in this build environment. **Grade 7 and Grade 8 screenshots are outstanding** and
must be taken before any classroom use.

### Grade 9 expansion — seven games, and the harness finally committed

Grade 9 adds a new wrinkle: the grade folder holds **top-level lesson documents** (`G09-U01-L01` … `U04-P36`),
**two term folders**, and ten subject folders. Neither the top-level files nor the grade-level term folders are
mathematics — the term folders are AI agents, jurisprudence, the Meccan opening and the graduation project. The
mathematics is `الرياضيات` → `الترم الأول` / `الترم الثاني`, holding **seven documents**, all built here with
their own bundle codes: Parabola Launch (`G09-U01-MAT-L01`, the curve, its vertex and roots, and a projectile
model), Region Planner (`G09-U01-MAT-L02`, systems by elimination and the solution *region* of two
inequalities), Factor Bench (`G09-U01-MATH-L02`, GCF, difference of squares, trinomials, zero product
property), Arc Table (`G09-U01-L03`, a values table, zero versus greatest height, vector components), Complete
the Square (`G09-U02-MAT-L01`, (x − p)² = q, the derived formula, the discriminant), Vertex Extremes
(`G09-U02-MAT-L02`, maximum versus minimum and what it means), and Quadratic Apps (`G09-U02-MATH-L02`,
intervals of increase and decrease and the limits of a claim).

**Six of the seven are quadratics**, so the split is by question rather than by topic: the curve (01), the
table (04), the *kind* of extremum (06) and behaviour across an interval (07) are four different questions,
and the pair that looks most like a duplicate — `G09-U01-MATH-L02` (factoring) versus `G09-U02-MAT-L01`
(completing the square) — is two genuinely different routes to the same roots, kept apart inside the games:
03 never completes a square, 05 never factors a trinomial. Game 04's document declares its own digital build
deferred and its numbers hypothetical; the caveat travels with it. Ledger: `docs/mowazi/g9-expansion.md`; new
picture library `games/_fikr/shared/scenes-9.js` (parabola, roots graph, values table, factoring box, sign
chart, clipped solution region, completing-the-square diagram).

**The jsdom gate is now committed as `tools/fikr_static_gate.mjs`.** It had been living in `.scratch/`, which
is gitignored, so it was being lost and rewritten every session. Run `npm install jsdom --no-save` once, then
`node tools/fikr_static_gate.mjs` for the whole sweep. That brings the sets to **79 offline games across
Grades 1–9** (79/79 clean, 1308 rounds, 474 CUBES), and **Grade 7, 8 and 9 screenshots remain outstanding**.

### Kindergarten Math Garden — `#/kgmath`

A dedicated early-years game garden offers **17 bilingual adventures** for ages 4–6: counting, number sense, ten-frames, addition, shapes, patterns, comparing, measuring, graphs and more. The experience follows the Fikr lesson loop: a Saudi oasis story and recurring Noor-the-camel/Ghubar-the-gecko coaches; four guided Learn beats (story hook, model, pupil turn and misconception check); then three distinct levels with three untimed rounds each: concrete (including tap-to-count and hands-on counters for make-ten, addition and take-away), representational and abstract. New storybook art lives in `assets/images/kg-*.png`; math objects remain crisp, inline SVG for offline use. Prompts can be read aloud, targets are touch-sized, retries explain a clue without a fail state, and English/Arabic layouts include RTL. Start from the home-page KG button or Games list. Smoke test: `node tools/kg-smoke.js`.

Audits: `games-audit.md` (13/13 games complete home → Learn → three levels → trophy),
`pedagogy-audit.md` (30/30 checks: the Learn gate holds, Hint never reveals, Show me awards nothing,
repeated misses push the hint, a level with misses scores under three stars, misconceptions are
named) and `games-qa.json` (13/13 built files boot with every external request blocked, no
horizontal overflow at 430 px, and play a round).

| lab | what you do with it | lessons |
|---|---|---|
| `orderlab` | click the operation to take next; the wrong turn shakes | 1.1 |
| `numberline` | drag points: place, opposites, `a + b` arrows, distance, rounding, inequality shading | 2.1, 2.4, 2.5, 2.8, 6.4, p11 1.1, 1.8 |
| `setnest` | click a number; every set that contains it lights up | 2.2 |
| `balance` | push both pans: `+0` and `×1` keep the beam level, everything else tilts it | 2.3 |
| `signtoggle` | flip factor signs; count negatives to decide the sign | 2.6, 2.7 |
| `factorarray` | drag the column count until the dots form a rectangle — a factor pair | 3.1, 3.4 |
| `factorlab` | divisibility lamps / an interactive prime tree / LCM–GCF from prime powers | 3.2, 3.3, 3.5, 3.6, 3.7 |
| `fractionlab` | two fraction bars: build, reduce, compare, add, multiply, move the sign, reciprocate | 4.1–4.8, 5.4, p11 1.4 |
| `zerodivide` | slide the divisor to zero; the quotient curve runs away | 4.4 |
| `mixedlab` | pies and slices: whole ⇄ improper, carrying and borrowing | 5.1, 5.2, 5.3 |
| `measurelab` | a ruler with draggable ends, and a chain of unit multipliers that cancel | 5.5, 7.4 |
| `decimallab` | place-value columns, a hundred grid for decimal products, stepped long division | 6.1, 6.2, 6.3, 6.5 |
| `ratiolab` | tape diagrams, a proportion solver, two packs compared per unit | 7.1, 7.2, 7.3 |
| `expolab` | copies of a base you can add, cancel, stack and split | 8.1–8.5, 1.2, p11 1.3 |
| `radicallab` | the largest square inside *n*, like radicals, products, rationalising | 9.1–9.5 |
| `scilab` | a log-scale ruler you drag, plus multiply / divide / power with format repair | 10.1–10.6 |
| `limitlab` | walk up to a limit from either side; the hole, the jump, the asymptote | c12 1.2–1.5, reviews |
| `slopelab` | shrink `h`: the secant becomes the tangent and the slope becomes the derivative | c12 2.x, p01, p11 2.3, 2.6 |
| `coordlab` | drag two points: distance, midpoint, the circle equation | p11 1.9 |
| `transformlab` | drag a, h and k: the whole curve moves as one, guide points and all | p11 2.6 |
| `piecelab` | drag the break point: do the two pieces meet? is there a corner? | c12 1.4, piecewise |
| `ratelab` | a sliding ladder: both rates on screen, tied by $$x^2+y^2=L^2$$ | c12 2.6 |
| `graphreadlab` | drag a cursor: f(x), zeros and turning points read off the curve | p11 2.2, 2.3, c12 p1 |

Chapter labs (`manip.js`, second half — one per chapter of the four question-bank courses):

| lab | what it is | chapters |
|---|---|---|
| `classifylab` | click a card, then the box it belongs in; wrong boxes refuse it | a1 1, c2 1, examprep Remedial |
| `steplab` | two valid inverse operations, in the only order that works; dividing by a negative flips the inequality | a1 2, 3, c1 11, c2 3 |
| `funclab` · `lineslab` · `syslab` | draw arrows and test the function rule · slope, intercept, parallel and perpendicular ghosts · two lines and their one/none/infinite solution count | a1 4, 5, 6, c2 7 |
| `explab` · `arealab` · `quadlab` · `ratfnlab` · `rootlab` | exponent tiles · the four-region area model · vertex, zeros and discriminant · asymptotes · pulling the largest square out of a number | a1 7–11, c2 4, 12 |
| `sequlab` · `cntrlab` · `sievlab` · `baropslab` | dots growing by a step and the rule that fits · counters cancelling in pairs · the sieve of Eratosthenes · fraction strips split to the LCD | c1 1–4, examprep GAT |
| `scalelab` · `gridlab` · `plotdotlab` · `spinlab` · `ratnumlab` | similar figures by a scale factor · the hundred-square grid · dot plot with mean and median markers · a spinner against its theory · fraction, decimal, percent on one line | c1 5–8, c2 2, 6 |
| `shapelab` · `boxlab` | composite area and cylinder/cone volume · box-and-whisker you can move | c2 9, 10, 11 |
| `pacelab` · `scoremodel` · `guesslab` | seconds per question on a real clock · raw-to-scaled conversion curve · crossing out options and the guessing odds | examprep NASMO, SAT, NAFS, SAAT |
| `machine` | feed a function machine numbers; it refuses outside the domain | p11 2.1, 2.2, c12 p3 |
| `examplanner` | twelve sliders, sixty minutes: does the final exam fit? | 11.1 |
| `mapboard` | click a chapter to see the skill and the rule it left you with | 11.2 |

How it is wired: `MLMANIP.forLesson(lessonId)` returns `{kind, opts}` from a single mapping table
at the bottom of `manip.js`; `viewLesson` in `courses.js` renders the `.co-manip` block and calls
`MLMANIP.mount`. Each lab is a plain function returning a DOM node — SVG for anything spatial,
native range inputs for anything numeric (so keyboard and screen readers get sliders for free),
pointer capture for drags. `\( … \)` in any readout is typeset centrally by a MutationObserver,
so a lab never has to know about KaTeX. Styling lives in `qcourses.css` under `.mnp*`.

Tested with `tools/maudit.js`: it walks all 80 lessons and, for each, records the lab, the visual,
the controls and whether an interaction actually changed the readout (a drag, then every slider at
two positions, then every clickable). Latest run:

```
lessons: 80 · with a manipulative: 80 · visual (svg/figure/lab): 80
       · with a control: 80 · responds to input: 80 · distinct labs: 26 · errors: none
```

Lesson rows and chapter headers carry a chip naming their lab, and each course card counts its
interactives, so the coverage is visible without opening anything.


### A live figure at the top of every course

`assets/courseviz.js` puts **one interactive figure on each of the six course pages**, right
under the course header (`ML.viz.panel(courseId)` → a `.co-block.cv-block`, injected by
`assets/apps/courses.js` when `ML.viz.has(courseId)`). Each figure is a canvas plus sliders and
segmented buttons, drawn locally — no library, no network.

| Course | Figure | What you can move |
|---|---|---|
| Algebra 1 (`holt-a1`) | `y = a(x − h)² + k` | a, h, k — vertex, axis, direction and x-intercepts recompute live |
| Course 1 (`holt-c1`) | Circle → sphere | radius: circumference, area, sphere volume and surface, and the ×4 / ×8 scaling |
| Course 2 (`holt-c2`) | `a·bˣ` and `log_b(x/a)` | base, a, and the mirror `y = x`: growth vs decay, asymptote, inverse |
| Precalculus (`p11`) | HSRV against the parent | parent (x², √x, \|x\|, 1/x), a, b, h, k — the parent stays as a dashed ghost |
| Calculus (`c12`) | Tangent from a secant | x₀ (slider or click the curve), h, and **shrink h → 0** to converge on f′(x₀) |
| Exam Preparation (`examprep`) | What a score means | paper size, correct answers, pass mark — band, and the answers still needed |

The read-out card (`.cv-read`) is the point of each one: every number the topic is examined on
is printed there and updates as you drag. **Every figure also animates**, with a pause button on each
animation:

| Course | Animations |
|---|---|
| Algebra 1 | `▷ animate a` sweeps a from −3 to 3 (watch the arms open, shut and flip); `▷ slide the vertex` walks h and k together |
| Course 1 | `▷ grow the circle` sweeps the radius; `▷ show the doubling` steps r = 1.5 → 3 → 6 so ×4 area and ×8 volume can be read off |
| Course 2 | `▷ animate the base` sweeps b from 1.2 to 4; `▷ flip decay → growth` moves b through 1 |
| Precalculus | `▷ tour H·S·V·R` walks h, then k, then a, then b, naming each letter as it goes |
| Calculus | `▷ sweep the point` walks x₀ along the curve so the tangent slope redraws continuously |
| Exam Preparation | `▷ climb to the pass mark` fills the bar to the pass mark and stops there | `node viz_test.js` mounts all six course pages in jsdom
and prints the figure's read-out; `node viz_test2.js` drives **every** slider, segmented button,
plain button and canvas click and fails if a control leaves the read-out unchanged.

## Question Studio — every question, one deck

`#/questions` is now the front door for questions. It merges **four sources into one index of 4,741 questions**:

| Source | Questions | Key in the file? |
|---|---|---|
| Recovered `.bnk` banks (31 chapters) | 2,840 | no — wording only |
| Decoded TestGen `.BOK` banks (Precalculus + Calculus) | 4,128 | no — wording only, gaps where the formula objects sit |
| FikrCounts MCQ export | 1,736 | no — options only |
| Calculus question bank (`question-bank.json`) | 162 | **yes** — key, hint, per-option feedback, explanation |
| Lesson quizzes (`lab-quizzes.json`) | 3 | **yes** |

How it is organised:

* **Source pills** — Everything / Recovered `.bnk` / **TestGen `.BOK`** / FikrCounts / Calculus bank / Lesson quizzes, each with its live count.
* **Refine panel** — chapter-or-topic select (90 units), level chips (Easy/Medium/Hard), a skill select
  (174 skills), plus *starred*, *got it wrong*, *not tried yet* and *shuffle* toggles.
* **Search** — runs across stem text, options, skill and chapter.
* **Three modes** — **Study** (one card at a time), **Practice** (a scored run of 10/20/50 with a streak, a timer,
  and a review sheet of the misses at the end) and **List** (scan the deck, 60 rows at a time, with ✓/✗/★ flags).
* **Progress** — every card tracks opened / correct / wrong / starred in `localStorage`; the side panel and the footer
  card show coverage per source and accuracy per chapter.

What each card does:

* pick an option with the mouse, **A–D** or **1–4**; **Enter** checks and then advances; **H** hint; **S** star;
  **←**/**→** move; the answer rows animate green/red and the card glows with the result;
* **answer-keyed** cards mark themselves, explain the option you chose and reveal the full explanation;
* **keyless** cards (`.bnk`, FikrCounts) lock your choice in and ask you to self-report — honest, because no key survived;
* **recovered records** keep their ruled number gaps. Click a gap and type your own number (or hit the dice to fill
  them all) so the stem becomes a question you can actually work;
* every card can be starred, copied to the clipboard or read aloud, and shows its skill, page, chapter and your own
  ✓/✗ record.

Files added for it: `assets/data/fikr.js`, `assets/data/calcbank.js`, `assets/qdata.js` (index, filters, storage,
text rendering), `assets/qcard.js` (the card), `assets/apps/questions.js` (the studio), `assets/qstudio.css`.
`tools/parse_all.py` regenerates the two data files from the Drive exports.

## Every question, typeset — and proof that it is

Maths is written in this project as **LaTeX between `$…$`** (`$\dfrac{3}{4}$`), and the studio,
the course pages and the generator all hand that text to the local KaTeX build in
`assets/katex/`. `ML.qdata.html(text)` is the one renderer they share. It understands

| Delimiter | Meaning |
|---|---|
| `$ … $` | inline maths |
| `$$ … $$` | display maths (a matrix or a system on its own line) |
| `\( … \)` / `\[ … \]` | the other two TeX spellings |
| `\$` | a **literal** dollar sign — FikrCounts prices, never a delimiter |
| `\u0000` | a number slot (the interactive `?` chip on recovered `.bnk` text) |

Two hardening rules came out of testing all 8,869 questions:

* **a formula KaTeX refuses is never shown as a red error** — it is rendered as its own text in a
  `.texraw` span, so one broken recovered formula cannot paint the page red;
* **a LaTeX run that has no `$` delimiters is still typeset** — a piece containing a command
  (`\dfrac`, `\pi`, `\infty`, `\circ`) is sent to KaTeX whole instead of being split on spaces,
  which used to tear `\text{ cm}` apart.

`node texaudit.js` is the proof. It renders **every** field — stem, every option, hint and answer of
all 8,869 recovered questions, plus 40 seeds of all 112 generator recipes — through the same
`ML.qdata.html`, and then inspects the built HTML for leftover `$`, LaTeX left as text, KaTeX error
nodes, raw fallbacks, `{{templates}}`, `NaN` and `undefined`. It also holds the generator to a
stricter rule: its own TeX must always be delimited.

```
records: 8869 {bnk:2840, fikr:1736, calc:162, lab:3, tg:4128}
rendered fields: 47,634 | KaTeX nodes: 208,014 | raw fallbacks: 0
generator build failures: 0     problems by kind: {}     → Everything typesets ✓
```

## Interactive graph lab (lesson pages, `#/courses/…`)

Every lesson page carries a canvas lab under the worked example. It plots any expression in `x`
(several at once, separated by `;`), and now also:

* **tangent + derivative** — click *Tangent* (or press `T`) and hover: the tangent is drawn at that
  x with a red label reading `f′(x) = …`, computed from a symmetric difference;
* **area A→B** — click *Area A→B* (`A`): two dashed markers appear that you drag; the region under
  the curve is shaded and the read-out gives a Simpson's-rule estimate (for `x²` from −2 to 2 it
  reads 5.33 — the exact 16⁄3);
* **sweep** — `▷ Sweep` walks a point along the curve, reporting `x`, `y` and `f′` as it moves;
* **keys** — `+` / `−` zoom, arrows pan, `0` resets, `t` and `a` toggle the two overlays;
* drag to pan, wheel to zoom, double-click to reset, hover to trace (all as before).

The standalone plotters got the same treatment: **`#/hu9graph`** now has a *Tangent* button and
click-to-inspect (`f(x)` and `f′(x)` at any point, with the tangent drawn), and its table of values
gained an **f′(x) column** computed from the first function.

### Sliders and two-sided limits (the figures the course pages shipped with)

The captured lesson pages leaned on inline-SVG figures with `input type="range"` sliders, a
"drag to trace the curve" read-out and *approaching from the left / from the right* panels. Those are
now a reusable widget (`ML.gcWidget`, in `assets/apps/graphcalc.js`) and every lesson page carries two
of them side by side, in the site's own design system:

* **the same curve, every value of a, h and k** — sliders for each parameter letter (the widget reads
  the letters out of the expression and gives each one its own range), drag across the figure to trace
  a point, `+` / `−` / `⟲` buttons to zoom and reset, and a folded *Show the working* reveal. A cubic
  lesson seeds the cubic family, a trig lesson the sine family, everything else the parabola;
* **approaching the point a** — sliders for `a` and `ε`, coloured markers on both sides of the point,
  a ring for a hole, and a read-out giving `f(a−ε)`, `f(a)`, `f(a+ε)` and whether the two sides
  *meet* as ε shrinks (a removable hole: limit ≈ 2) or *stay apart* (a jump, an asymptote).

## Graphing Calculator (`#/graphcalc`) — the Desmos tab, minus Desmos

Every Dr. Math Azzam course page carried a **Desmos Graphing** tab, which mounted
`desmos.com/api/v1.13/calculator.js` with a development key into an empty `.dcg-dom-change-wrapper`
card. Offline — and without the key — that page is a blank white rectangle. So the tab has been rebuilt
natively in `assets/apps/graphcalc.js` + `assets/graphcalc.css`; nothing is fetched, nothing is embedded:

* **an expression list** — up to six, colour-coded, each with an eye (show/hide) and a delete; type
  `y = …` or just the right-hand side;
* **automatic parameter sliders** — any stray letter (`a`, `h`, `k`, `b`…) becomes a slider with a
  sensible range, and the curve redraws live;
* **pan and zoom** — drag to pan, wheel or the `+` / `−` buttons to zoom, `0` to reset, plus `t` for the
  tangent and arrow keys to pan;
* **trace and tangent** — hover (or pin a point) to read `(x, y)`, the slope `f′(x)` and the tangent
  line, on whichever curve is under the cursor;
* **intersections** — sign changes sampled at 1,400 points, then bisected 60 times (the two roots of
  `x² − 3 = 2x + 1` come out as −1.236 and 3.236, i.e. 1 ± √5);
* **table of values** and a **limit explorer** — `a` and `ε` sliders with left/right/at-the-point values
  computed from a tenth-of-ε probe, so a hole, a jump and an asymptote are told apart;
* **ten presets** (parabola, cubic, sine, exponential, log, hyperbola, absolute, root, the `a(x−h)²+k`
  family, a rational) and a deep link: `#/graphcalc/x%5E3` seeds the first expression.

### Every graph sits in one stage — a bounded box, and full screen

The plotting surfaces (`#/graphcalc`, `#/hu9graph`, `#/polar`, the lesson graph lab and the small
lesson slider figures) now share `assets/stage.js` + `assets/stage.css`. The stage fixes the layout
problems they had:

* **the plot is a fixed area, not a growing one** — `.mstage-body` is `height: clamp(300px, 46vh, 540px)`
  (the calculator uses a slightly shorter clamp so its column fits a laptop), so the canvas can never
  spill down the page, squash under a long control panel, or shove the table of values off-screen;
* **the canvas always matches the box** — it is `width/height:100%` of that box and its backing store is
  refitted at device resolution whenever the box changes: window resize, orientation change, a collapsed
  sidebar, or leaving full screen. Before this the canvas kept its first size, so it stretched, went
  blurry, and worse, the pointer maths drifted out of step with the picture;
* **full screen** — the ⤢ button in the corner (or a double-click on the plot, or `f`) blows that one
  figure up to the whole viewport, locks the page behind it, and redraws at the new size; `Esc`, `f` or
  the *Exit* button puts it back. It is a CSS overlay, not the Fullscreen API, so it also works inside
  sandboxed preview frames and from `file://`. Only one plot is ever blown up at a time, and pressing
  `f` while typing into an expression field is ignored;
* **phone order** — under 900 px the calculator puts the figure first and its long control column after
  it; on a wide screen the figure column is sticky (`top: 76px`) so it stays in view while you edit the
  expression list beside it.

### One unit, one size — why the graphs looked "stretched"

Two separate bugs made a plot look wrong, and both are fixed:

1. **A canvas is a replaced element.** With `width:100%` and no CSS height, its *used* height comes
   from the **backing store's** aspect ratio, not from the box you put it in. The course figures drew
   once while their panel was still detached — measured 520 × 360 — and were then displayed at
   860 × 596: a graph one and a half times too tall, with the page stretched under it, and blurry
   because the picture was a 520-pixel drawing blown up. Now every plot canvas has an explicit box
   height and a fitted backing store, the figures redraw one frame after they are inserted
   (`ML.viz.panel`), and the lesson lab's `makePlot` re-fits whenever its box changes size.
   Audited across **35 routes at 1280 and 390 px and all 23 lesson pages**: no page overflow, no
   canvas over 720 px tall, no backing store smaller than its box.
2. **The axes had different scales.** A window of −8…8 × −6…6 drawn into an 808 × 378 panel gives
   ~50 px per x-unit and ~25 px per y-unit, so every curve was squashed flat — a sine wave became a
   ripple, a parabola a shallow bowl. `ML.stage.square()` now fits the window to the box so **one
   x-unit and one y-unit are the same number of pixels**, keeping the centre and the tighter axis and
   expanding the roomier one, with the span snapped to a readable number (±15, ±7.5 — never ±13.41).
   The calculator applies it on every resize and shows the new window in its window pill; the course
   figures apply it and thin the grid to a nice step; the function plotter squares its window from the
   x-range you typed and re-syncs the **WINDOW** panel so the numbers you read are the numbers drawn
   (`Fit to data` squares it the other way, widening x to show the fitted y).

The stage test now asserts that contract instead of the old fixed window: after a resize the view is
still centred and the two scales agree within 25 %.

It shares `ML.compile` with the rest of the site, which gained a fix along the way: every recognised
letter used to be treated as *the* independent variable, so `a x + k` silently evaluated to 0 — now
only `x` is read from the call argument and the other letters keep the values they were given.

## The question generator — what the ExamView/TestGen files were doing

The second Drive folder (`test gen`) held the *machinery* that made the other questions:
twelve Savvas enVision Algebra 1 ExamView banks, thirteen Algebra 2 banks, the Geometry
banks, and the **TestGen 7.6.5** Windows installer. Those `.bnk` files do not store
finished questions — a dynamic item stores a *recipe*: named variables with ranges, a
`constraints` expression, a stem/option template as a list of fragments, and an answer
that is computed from the variables (plus `scramble`/`TRUE` flags that shuffle the
options). That is the logic this rebuild reuses.

`assets/generator.js` is the engine (`window.ML.gen`): a seeded RNG, a variable solver
(`int` ranges with conditions, `pick`, `oneOf`, derived `=`), constraint retries, a
`{{expression}}` template renderer with `$…$` TeX, an answer-key builder that rejects
ties, duplicate options and unrendered text, and a worksheet builder that returns
`{seed, items[]}` so a sheet can be regenerated exactly.

`assets/data/generator.js` holds **112 recipes** across seven courses:

| Course | Recipes | What they cover |
|---|---|---|
| Algebra 1 | **36** | order of operations, evaluate, 1- and 2-step, both sides, brackets, proportion, inequalities, slope, line equation, systems, exponents, polynomials, factorising, vertex, radicals, absolute value, function notation, sequences, percent, mean, probability — plus the Topic 0 skills review: prime factorisation, GCF, adding/multiplying fractions, fractions ↔ decimals, percents ↔ decimals, scientific notation, median, simplifying ratios, prism volume, triangle area |
| Algebra 2 | **19** | complex arithmetic, discriminant, roots, rational exponents, logs, exponential equations, geometric/arithmetic sequences, inverse, remainder theorem, composition, vertex form, absolute inequalities, rational simplification — plus percent applications, proportions, integer operations, exponent laws |
| Geometry | **16** | triangle area, circle circumference/area, Pythagoras, distance, midpoint, angles, cylinder volume, similarity, trig ratios, polygon angle sums — plus triangle angle sum, percent error, simplifying radicals, unit conversion |
| Precalculus | **10** | interval notation, GCF, circle centre, domain, difference quotient, transformations, quadratic inequalities — plus rationalising a denominator, log equations, asymptotes of a rational function |
| Calculus | **15** | limits by substitution/factoring/conjugates, infinite limits, continuity, derivative from the definition, polynomial/product/quotient/chain rules, tangent slope, implicit, related rates — plus the second derivative and the stationary point of a quadratic |
| Course 1 | **8** | integer arithmetic, decimal × whole number, unit-fraction sums, percent of a number, rectangle area, collecting like terms, the mean, unit rate |
| Course 2 | **8** | rational number arithmetic, solving a proportion, percent increase, slope from two points, product rule for exponents, scientific notation, median of five values, tip and tax |

**Every recipe now carries a hint** (62 were missing one), so the Hint button always has something
to say, and `node gentest.js` exercises the whole engine:

```
recipes: 112 {a1:36, a2:19, geo:16, p11:10, c12:15, c1:8, c2:8}
instances built: 22,400 at 200 seeds each in 3,385ms (0.15 ms each)
steps checked: 45,200 | hints: 22,400
All 22,400 instances clean: options, keys, steps, hints, vars, KaTeX ✓
```

It checks, on every instance: four distinct options with exactly one key, non-empty stem/answer/
every step/hint, no unrendered `{{}}` or `NaN`, every declared variable inside its own `int` range
or `pick` list, balanced `$`, and that the site's renderer accepts every string. On top of that it
verifies worksheet integrity — requested count, seed reproducibility, different seeds giving
different sheets, only the requested course, and no more than a third of a sheet repeating one stem.

`#/generator` is the app: course pills, a searchable recipe list, a live question card
(answer by click or `1`–`4`/`A`–`D`, `N` for a new question, `S` for the steps), a hint,
step-by-step worked solution, the variables that were rolled for that instance, running
accuracy, and **worksheets of 10/20/40** questions with a printed answer key (the sheet
also downloads as standalone HTML). `#/generator/c12` deep-links into a course, and every course page carries a **Generate questions**
button that opens the generator on the matching recipe set (`c1` and `c2` back the Course 1 / Course 2 banks).

The three **Skills Review** banks (`* Topic 00`) are the newest source: they hold the variable recipes in
plain text (`range`, `list`, `choose`, `rand`, `scramble`), and 19 families were written straight off that
inventory — see `SKILLS-REVIEW.md` for the topic-by-topic map (37 of 38 topics now have a family).

Everything is written by the site itself — the `.exe` is only a reference for the logic,
and nothing is downloaded or sent anywhere. `tools/parse_testgen.py` is the decoder used
to read the `.bnk` recipes while authoring the families (see *Regenerating the data*).

## The recovered banks are in the site

All **2,840 records** decrypted from the 31 `.bnk` files are embedded in
`assets/data/qsbanks.js` (465 KB) and shown through one shared interactive card
(`assets/bankcard.js`).

**`#/bankqs` — Bank Questions** is the browser. Each card has:

* a **type badge** — `question`, `hint text` or `fragment`, so you know how much to trust the wording,
* **ruled gaps** where the file held a generated number,
* **clickable answer options** when the record kept them,
* **Got it** (mark as read), **Show hint** (provenance: skill, page, difficulty), **Next/Prev**, and `←`/`→` keys,
* a **progress meter** and a **shuffle deck**.

Three filters: **Questions only** (107), **Readable** (896), **Everything** (2,840).

Quiz Show also has a **"Questions from"** switch: *Generated (endless)* or *The
original .bnk banks*, and in bank mode it renders the same card.

## The Quiz Show banks (second Drive folder)

The second folder was the **Quiz Show SE** quiz program plus its data: 31 chapter
question banks (`Question Sets/`), options, help files and installer logs.

What the `.bnk` files are: an `FSCBNK` container with a plaintext header (book title,
bank cover), plaintext length-prefixed metadata for every question — skill, standard
codes, book topic, page number, keywords, difficulty — and the question wording itself
encrypted. The metadata is complete (782 records, 439 skills across 31 chapters);
the wording is not recoverable without the program's key.

All 31 banks are in the app. The folder itself is missing 5 chapters that the printed
books have (Course 1 Ch 9, 10, 12; Course 2 Ch 8; Algebra 1 Ch 12) — those files were
never uploaded, so they are not in the game either. Every one of the 358 distinct
skills has a generator, including the generic "Application" / "Problem-Solving
Application" entries, which draw from word problems.

So Quiz Show is a **regenerator**, not a reader. Every skill title from the banks was
mapped to a procedural question generator (139 generators), and each chapter draws its
questions from its own recovered skill list — so picking *Algebra 1 → Chapter 7* really
does give exponent and polynomial questions, and picking *Course 1 → Chapter 8* gives
probability. Questions are new each round, which is what the original did too.

Verified: 1,260 independent answer checks (recomputing each answer from the question
text) with zero failures, plus a full 12-round game and team scoring.

## The `.BOK` banks — the third format, decoded too

The `test gen` folder also holds two TestGen **`.BOK`** banks (`PCALC7Z.BOK`, 29.9 MB;
`TCALT15W.BOK`, 39 MB). They are not `.bnk` files and not zlib — they are TestGen's own
serialised object tree, and the items inside them are compressed with **RDC** (Ross Data
Compression, Ed Ross, *The C Users Journal* 1/92). Each block announces itself:

```
52 44 43 31 | 0f 01 00 00 | ac 00 | <RDC stream>
"R D C 1"     uncompressed   compressed
              = 271 bytes    = 172 bytes
```

`tools/parse_bok.py` re-implements the container, the RDC unit (short/long RLE, short/long
match, one 16-bit control word per 16 items) and the two text layers, then stitches each
item's fragments back into wording, turning the embedded formula objects into ruled gaps.
Both banks run through it:

| book | blocks | inflated | stems | rubrics | readable texts |
|---|---|---|---|---|---|
| `PCALC7Z.BOK` — Precalculus (Blitzer) | 30,209 | 44.6 MB | 1,682 | 2,054 | 2,170 |
| `TCALT15W.BOK` — Calculus | 35,323 | 66.1 MB | 4,242 | 15,642 | 5,478 |

After filtering (≥5 words, no font names, no record ids, no option tables) **4,128 items**
land in `assets/data/testgen.js` and appear in Question Studio as the **TestGen `.BOK`**
source: 1,420 Precalculus, 2,708 Calculus. What is still not rendered is the maths inside
the expression objects (ExamView's postfix notation) and the figures; options and keys live
in those tables, so a `.BOK` item arrives as wording + gaps, like a `.bnk` item. Full
write-up: `BOK-DECODED.md`.

## Unit Circle Explorer (`#/unitcircle`)

A canvas unit circle with a draggable terminal side. It snaps to 15° by default (toggle it
off for free angles), draws the reference triangle and the swept arc, and prints **sin, cos
and tan exactly** — `1/2`, `√3/2`, `√3/3`, `(√6−√2)/4` — with the decimal underneath, plus
θ in degrees and as a fraction of π, the quadrant and the reference angle. Sixteen special
angles are one click away; ←/→ step 15° (Shift for 1°). **Practice** asks `sin 120° = ?` with
four exact-value options, marks it, swings the circle to the answer and keeps score across
visits (`localStorage`). Data for it came out of the same trig material the `.BOK` decode
recovered.

## Protractor & Ruler (`#/protractor`)

The one Skills Review topic that is not a recipe: **using a ruler and a protractor** (Geometry `0-1`). It draws
a 180° protractor with **both scales** (inner and outer), degree ticks with labels every 10°, a ray you drag
from the centre with a swept sector, and a read-out of the angle, its type (acute/right/obtuse), complement and
supplement. The second instrument is a ruler with centimetre and millimetre ticks and a bar whose ends you drag;
it reads `4.3 cm` / `43 mm` / `4 cm 3 mm`. Both have a **“measure it yourself”** task — four options, the readout
is hidden until you answer, the measurement is locked so it cannot be nudged, and the score persists. ←/→ move
1° (Shift 10°), or 1 mm on the ruler.

## Maths Arcade (`#/arcade`) — all 21 game modes from the EduMagnet library

A second Drive folder held 21 Flash-era game modes. **All 21 are rebuilt here**, in this site's own
code, with the science swapped for mathematics and **every question generated live by the recipe
engine** — so boards never repeat and every answer is keyed, hinted and worked. No images, no
external scripts, no network: the artwork, wheels, mazes and comets are CSS and inline SVG.

The modes are grouped on the floor exactly as they behave:

| EduMagnet mode | Here | The maths twist |
|---|---|---|
| Science Bingo | **Maths Bingo** `#/arcade/bingo` | 3×3 board of *answers*; `+100` a cell, `−20` a miss, eight winning lines, and the prompt always asks for a cell that is still open |
| Quiz Race | **Quiz Race** `#/arcade/race` | 60 s, 20 questions, a runner on the track and a streak multiplier of `10 × min(5, streak)` |
| Match Pairs | **Match Pairs** `#/arcade/pairs` | eight tiles face up — four questions, four values; matching, not memory |
| Memory Cards | **Memory Match** `#/arcade/memory` | pairs are an **expression** and its **value**; four pairs, `120 − 2·moves` |
| Mystery Crates | **Mystery Crates** `#/arcade/crates` | nine crates hold 50–300 points each — you only bank them if the generated question is right |
| Spin the Wheel | **Spin the Wheel** `#/arcade/wheel` | eight sectors are eight maths topics; the wheel picks the recipe family, so no hiding in a favourite chapter |
| Flashcards | **Formula Flashcards** `#/arcade/flashcards` | every card is a generated question; the back carries the answer, the hint and the first worked step |
| Comet Catch | **Comet Catch** `#/arcade/comets` | three falling answers per volley (the right one is always among them); three misses ends the run |
| Bubble Pop | **Bubble Pop** `#/arcade/bubbles` | the answers float upward; pop the right one before the set drifts away |
| Magnet Zap | **Magnet Zap** `#/arcade/zap` | magnets drift across the field carrying answers; a wrong zap costs a shield |
| Penguin Leap | **Penguin Leap** `#/arcade/leap` | each ice floe carries an answer; eight good hops reach the igloo, a slip costs a fish |
| Flash Recall | **Flash Recall** `#/arcade/recall` | five expression→value pairs flash for four seconds, then you answer four questions from memory |
| Rapid Sort | **Rapid Sort** `#/arcade/sort` | two buckets, 18 cards in 45 s; the rule is a maths property — prime, even, square, multiple, slope sign (←/→ work) |
| Group Sort | **Group Sort** `#/arcade/groups` | three function families — linear, quadratic, exponential — and twelve generated forms |
| Timeline Build | **Step Order** `#/arcade/steps` | the timeline is a **worked solution** from the generator's own steps; it names the step that is out of place |
| Discovery Tiles | **Discovery Tiles** `#/arcade/tiles` | each right answer lifts three tiles off an SVG of a parabola, its chord and a golden spiral |
| Circuit Maze | **Circuit Maze** `#/arcade/maze` | ten gates of circuit; each right answer lights the next cell, three wrong ones blow the fuses |
| Rocket Glide | **Rocket Glide** `#/arcade/rocket` | the fuel gauge is right answers — ten of them from the pad to orbit at 100 km |
| Zoom Guess | **Zoom Guess** `#/arcade/zoom` | a real graph drawn by the site's plotter, zoomed into one feature: name the function |
| Correcting Deck | **Correcting Deck** `#/arcade/deck` | mixed mastery across all eight courses; a miss puts the card back in the deck, so it only empties when you know it |

What they share: eight course pills (Mixed, Algebra 1, Algebra 2, Geometry, Precalculus, Calculus,
Course 1, Course 2) that swap the deck under every mode; a per-mode best score in `localStorage`
(`arcade:best:<mode>`); the EduMagnet-style end card with confetti and play-again; and the same
`ML.qdata` renderer, so every stem, answer, hint and worked step is typeset by KaTeX.

Adding a mode is one object plus a style block: the floor, the router, the provenance table and the
`tag` on the hub card all read from the same `GAMES`/`ORDER` list (`ML.arcade.add(...)` is the
whole API).

## Arcade art and motion (`assets/arcade-art.js`)

The games were standing on emoji — 🚀 🐧 📦 🛡 — as their sprites. On a machine without an emoji font
they came out as empty boxes (that is what the header's "21 game modes" count and half the cards looked
like), and even where they did render they were somebody else's artwork, not the site's. They are now
inline SVG, drawn in the site's own palette:

* **`ML.art("rocket")`** returns a 24×24 glyph built from `currentColor` plus one accent fill, so a
  glyph inherits the colour of the chip, tile or button it sits in. There are 31 of them — one per
  mechanic (bingo, race, comet, memory, sort, steps, pairs, sweep, recall, flashcards, bubbles, crates,
  wheel, tiles, maze, zap, groups, rocket, leap, zoom, deck) plus the tokens each game counts with
  (shield, fuse, fuel, fish, flag, igloo, die, star, tick, cross, clock);
* **`ML.art.tokens("shield", 3)`** is what the HUD chips use for lives, so a shield counter is three
  shields rather than the string `🛡🛡🛡` — the HUD setter now accepts SVG for any value that contains it;
* **`ML.art.big(icon)`** picks the art for the end-of-round card, and the old emoji strings still map
  through `ML.art.alias`, so nothing could break silently during the swap.

**Motion.** All twenty-one modes now move on their own: comets fall through a starfield, planets rise,
magnets drift the full width of the field, crates lift their lids, the wheel wobbles, the circuit pulses
and the bot sits on the live cell, the rocket burns on its pad and climbs past a ruler, the penguin hops
across a moving sea, the runner advances past a checkered finish, the memory cards carry a printed back,
and every turn-based board breathes. The motion audit is objective: the harness screenshots each board
twice, 700 ms apart, and compares them — **all 21 boards now score 97–100 %**, where the turn-based
modes used to sit at 0 % until you touched them. Everything honours `prefers-reduced-motion`.

**Feedback on every tap.** `assets/arcade-fx.js` (`ML.fx`) is one shared effects layer, mounted inside
whatever scene is on screen (`burst`, `float`, `ring`, `shake`, `flash`, `confetti` — DOM and CSS
keyframes only, nothing to load). The `shell()` in `arcade.js` listens once, in the capture phase, for
taps on any answer target, then reads back what the mode did with it: an `ok`/`is-pop`/`is-zapped` result
bursts and floats the points it just earned, a `no`/`is-miss`/`is-slip` shakes the board and washes it
red, and anything else (flip, spin, open, hint) gets a ring. Because that seam lives in the shell, a new
mode gets the whole feedback vocabulary for free.

**Scene art, rebuilt to the originals.** The Bubble Pop port now mirrors the actual `EMG` game from the
Drive folder: a **Drop zone** pad that the answer lands on, four **planet bubbles** — shaded spheres with
an orbit ring, in the original's gold/teal/rose/deep palette — rising in lanes sized to the field, three
hearts in the HUD, and a pop that bursts the planet. Comet Catch got the starfield, moon, ground line and
a comet glow; Magnet Zap the same night sky; Mystery Crates the wooden chest with nails, a latch and a
lid that flips on open; Quiz Race the marked lane and checkered finish; Circuit Maze the bot on the live
cell; Penguin Leap the horizon, the moving sea, the floe and the sun.

Two bugs surfaced while doing this and are fixed: the header counted **6 game modes** (it was baked in
when only the board games had registered — it now reads 21), and `Rocket Glide`'s HUD stayed blank until
the first answer. Three CSS keyframe names were also colliding with each other (`ar-rise`, `ar-hop`) —
the bubble rise had been flattened to a 6 px nudge by a later duplicate declaration.

### The visual audit — 21 boards, screenshotted and tapped

Reading the code does not prove a game looks right, so the boards are now checked the way a player
meets them: load the mode, screenshot it, tap the control that *should* score, screenshot the feedback,
screenshot the board afterwards. `gametest.js` does that for all twenty-one modes in a real browser and
asserts four things per mode — the stage is not blank, no ninth of the stage is empty (a 3×3 coverage
grid), something is animating before you touch anything, and a real tap produces a burst, a ring or a
score float. `mobiletest.js` repeats the load at 420 px and checks that nothing in a board reaches past
its stage. Everything below came out of looking at those 63 frames.

| mode | moves on its own | a correct tap |
| --- | --- | --- |
| Bingo | `ar-breathe` on the cells | burst, ring, +100 float |
| Quiz Race | `ar-wave` on the lane | burst, ring, +10 float |
| Comet Catch | `ar-twinkle` stars, `ar-float-y` comets | ring, answer caught |
| Memory Match | `ar-breathe` | burst, ring, pair locks |
| Rapid Sort | `ar-float-y` on the card | burst, ring, +float |
| Step Order | `ar-breathe` on the pool | burst from the placed step |
| Match Pairs | `ar-breathe` | ring, pair locks |
| Match Sweep | `ar-breathe`, `ar-sheen` | burst, ring, +float |
| Flash Recall | `ar-breathe` | ring on the reveal |
| Flashcards | `ar-breathe` | ring on the flip/grade |
| Bubble Pop | `ar-rise` planets | burst, ring, +float |
| Mystery Crates | `ar-bob` on the lids | ring, crate opens |
| Spin the Wheel | `ar-wobble` | wheel spins 3 turns, then burst + ring + float |
| Discovery Tiles | `ar-float-y`, `ar-shimmer` | burst, ring, +float |
| Circuit Maze | `ar-breathe`, current on the live gate | burst, ring, +100, wire lights |
| Magnet Zap | `ar-drift` magnets, `ar-twinkle` | burst, ring, magnet zapped |
| Group Sort | `ar-breathe` lanes | ring, card drops |
| Rocket Glide | `ar-flame` exhaust, `ar-twinkle` | burst, ring, +float, climb |
| Penguin Leap | `ar-current` sea, `ar-bob` penguin, floes | burst, ring, +100, hop |
| Zoom Guess | `ar-swap` on the plot | burst, ring, +float |
| Correcting Deck | `ar-swap` on the stack | burst, ring, +float |

**Bugs the screenshots found** (all fixed):

1. **Effects died with the board.** `ML.fx` mounted its layer inside `#arStage`, and most modes rebuild
   `#arStage` for the next question in the same tick — so Race, Discovery Tiles, Circuit Maze, Rocket,
   Zoom and the Deck showed a correct answer with *no* feedback at all. The layer now hangs off
   `.ar-game`, which survives the re-render (and is not clipped, so particles can fly past the stage edge).
2. **The race marker hung off the lane.** `left: 0` plus `translate(-50 %)` put the runner 17 px outside
   the track, where `overflow: hidden` cut it in half. It is positioned from a `--p` custom property now
   and always lands inside the paint.
3. **Comets could sit flush against the field edges**, clipping their tail and glow; the lanes are inset
   by 12 px. The moon also sat on top of the third lane and is now dimmer and out of the way.
4. **Spin the Wheel's face labels collided** — "Radicals" and "Polynomials" printed on top of each other.
   Sectors carry a `short` face name (Order, Equations, Lines, Poly, Roots, Geometry, Data, Calculus);
   the full topic name still appears in the HUD and the question card.
5. **Circuit Maze read as a row of grey cards.** It is now a snake board with an inline-SVG wire running
   gate to gate, a lit path and a current tip that advances with your answers, bulbs with a real glow,
   and a full-width exit rail instead of a lonely flag in a third row.
6. **The Deck's card back was a blurry gradient square.** It is a printed card back (74 × 100) with a
   stack behind it, and the counter is sized to match.
7. **The rocket was drawn nose-right and buried in the ground band.** The glyph is rotated up the column,
   lifted clear of the pad, and the planet moved to the right so the ship's lane is clean.
8. **Penguin Leap had a stray white lozenge** floating mid-sea (a decorative `::after`) and an empty
   middle. It is gone; three floes now float across the water and the penguin stands on its shelf.
9. **Magnet Zap's magnets were yellow lozenges.** They are bar magnets now — red and blue poles, zinc
   body, still legible behind the answer.
10. **Short boards hung at the top of a half-empty stage.** The stage centres its content, so a 215 px
    board in a 320 px stage sits in the middle instead of leaving a white band underneath.
11. **Group Sort's lanes were 24 px tall** — they are 78 px drop targets now.
12. **The new column rules leaked into the phone layout.** The widened wheel/deck grids are behind
    `@media (min-width: 821px)` so the 820 px stacking still wins; 420 px audit: no overflow.

One harness detail worth keeping: most modes mark their options with `ok`, so the gate can click the
answer that *should* score and judge the feedback. Zoom Guess keeps its curves in a plain list, so it now
publishes `answerIndex` on its live API — without it a run of bad luck (one guess in four, four rounds)
read as a visual bug and made the gate flaky.

Run them yourself (a static server on `127.0.0.1:3000` plus Playwright):

```
node gametest.js            # 21 modes: render + animate + feedback, writes shots/play/*.png
node gametest.js wheel deck # just those modes
node mobiletest.js          # 420 px overflow audit
node arcadeall.js           # the jsdom gate: all 21 modes play through
```

### Motion you can measure — the second visual pass

"A breathing box-shadow" is animation, but it is not motion. So the boards were measured: three
screenshots 600 ms apart, every pixel that changed by more than 3/255 counted. On the first run
**twelve of twenty-one boards moved and nine stood still** — Race 0.1 %, Steps 0.0 %, Flashcards 0.0 %,
Zoom 0.1 %, Rocket 0.1 %. Each got a cue that belongs to its own scene, and all twenty-one now move:

| mode | % of the board that changes every 600 ms | what moves |
| --- | --- | --- |
| Bingo | 20.7 | a light band sweeps the board |
| Quiz Race | 13.6 | the lane scrolls under the runner, the flag waves |
| Comet Catch | 30.8 | comets fall, stars twinkle |
| Memory Match | 5.9 | cards breathe in a stagger |
| Rapid Sort | 1.9 | the card sways over the bins |
| Step Order | 4.0 | the step pool lifts in sequence |
| Match Pairs | 6.4 | tiles float, staggered |
| Match Sweep | 31.6 | the swept tiles shimmer |
| Flash Recall | 8.3 | the flash cards breathe |
| Flashcards | 2.4 | the card hovers |
| Bubble Pop | 8.2 | planets rise |
| Mystery Crates | 13.7 | the lids bob |
| Spin the Wheel | 1.9 | the disc wobbles, the pointer bobs, the hub pulses |
| Discovery Tiles | 22.3 | tiles float and shimmer |
| Circuit Maze | 5.2 | current flows along the wire, every gate breathes |
| Magnet Zap | 27.7 | magnets drift the whole field |
| Group Sort | 9.4 | lanes and cards breathe |
| Rocket Glide | 5.5 | starfield drifts, nebula breathes, ship bobs and burns |
| Penguin Leap | 9.8 | the swell travels across the sea, the penguin bobs |
| Zoom Guess | 14.9 | a scan line sweeps the plot |
| Correcting Deck | 2.6 | the stack swaps |

`motiontest.js` also plays every mode out to its end-of-game card: **all twenty-one now reach it**
with the confetti and the score (Bingo "Line complete!", Race "20 answered", Memory "Board cleared",
Sweep "Swept clean", Wheel "Wheel complete", Deck "Everything known", …).

**Three real bugs fell out of this pass** — all of them invisible to the jsdom gate:

1. **Spin the Wheel could only ever spin once.** `spin()` set a lock for its 1.6 s animation and never
   cleared it, so `spins` stuck at 1 and the five-spin round was unreachable; the board sat on the first
   question forever. The lock is now the animation only, and the wheel also refuses a spin while a
   question is on the table.
2. **Match Pairs could never finish.** Its `build()` reset the board counter, so advancing from board 1
   went `board = 1 → build() → board = 0` and the round looped forever with the score reset. `build(false)`
   now carries the round forward; only a fresh game clears it (that is what "Play again" calls).
3. **Penguin Leap's sea was flat.** The wave pseudo-element was still pinned to `34×34` by the original
   *sun* rule written for the same `::before`, so the swell never had any width; the sea is now a proper
   travelling swell, and the runaway `width/height` is released.

Two smaller ones: the rocket sprite was rotated twice (the ship element already carries `rotate(-90deg)`,
so the glyph rotation pointed it left) and the altitude read-out sat on top of its own ruler.

### Full-screen board

Every game page has a **Full screen** control beside its best score, exactly like the originals'
"fullscreen board" button: the board takes the viewport, the page behind it stops scrolling, `Escape`
or the button brings it back. It is a CSS overlay rather than the Fullscreen API, so it works inside
sandboxed frames too.

## The recovered `.BOK` bank on the course pages

`#/courses/p11` and `#/courses/c12` now carry a **Recovered bank** panel: 1,420 Precalculus items and 2,708
Calculus items with a per-book breakdown and an *Open in Question Studio* button that hands the studio a
`{src:"tg", course:…}` filter (`ML.qdata.filter` gained a `course` key for it).

## Faithfulness notes

* **SpeedPractice** kept its behaviour: change the range, regenerate the sheet, print it with
  or without an answer key. `F9` still makes a new sheet, as the original instructed.
* **π recursion** reproduces the spreadsheet's own numbers: 2.914213562373 →
  3.140579250522 → 3.141592653590. It is Brent–Salamin, which roughly doubles the correct
  digits per step.
* **Darts** uses real board geometry: 18° sectors, treble/double rings and bull values, with a
  checkout solver that only proposes routes finishing on a double (or bull).
* **Probability tools** keep the original's event list (a 6, an even, less than a 5) and add a
  live "experimental vs theoretical" comparison.
* **The games' art**: the EduMagnet originals loaded per-cell sprite SVGs from their own server
  (`/assets/img/cell/*.svg`), which no longer exists and could not be fetched. Rather than ship broken
  images, `assets/arcade-art.js` draws an equivalent set of glyphs in this site's palette — the
  mechanics, counters and sprites are the same, the artwork is ours.
* **The Desmos tab** is the one thing that could not be carried across as-is: the captured pages mount
  `desmos.com/api/v1.13/calculator.js` with a development key, so offline (and inside any preview
  frame) they are a blank white card. It is rebuilt natively as `#/graphcalc` — same job, no key.
* **The lesson figures** were inline SVG with range sliders, "drag to trace the curve" and
  left/right approach read-outs; those behaviours are reproduced by `ML.gcWidget` on every lesson page
  rather than by copying the captured markup, which was bound to the old page's own scripts.
* **The discovery page** in that folder turned out to be marketing, not machinery: a hero, three cards
  ("learn it / try it / check your thinking") and a topic list naming the Fundamentals and Functions
  lessons. All of it is already the shape of `#/courses` — the course tree, the chapter list and the
  lesson chips — so nothing new had to be built for it; the topic list is the course index.
* The folder that held the course pages is a **VPS dump** — `server.js`, `vercel.json`, deploy keys,
  `.pki`, an `nltk_data` tree. None of that is mathematical content and none of it was copied over;
  only the pages were read, for the visuals and the interaction patterns.

## Design decisions for the rebuild

* Mobile-first layout: on narrow screens the activity comes first, the controls follow.
* Keyboard support throughout (Enter to submit, F9 for a new worksheet, `/` to search apps).
* No emoji, no external fonts, no CDN — only inline SVG and system fonts, so it renders
  identically offline and inside sandboxed preview frames.
* Progress, best scores and settings live in `localStorage` and never leave the device.
* Print stylesheets: worksheets, tables and the π table print cleanly on A4.

## Deploying

The ready-to-upload folder is `/home/user/mathslab-deploy` (zipped as `/home/user/mathslab-site.zip`).
It is a plain static site — no build step, no server code. Upload it to any static host
(Vercel drag-and-drop, Netlify, Cloudflare Pages, GitHub Pages, or any web server).

## Run it

```bash
node server.js          # http://localhost:3000
# or just open index.html in a browser

## Regenerating the data

```bash
python3 tools/parse_all.py            # qsbanks.js, fikr.js, calcbank.js from the raw exports
python3 tools/gen_courses.py          # courses.js — course tree, lesson steps and figures
python3 tools/parse_testgen.py "A1 Topic 01.bnk" -o a1t01.json   # decode ExamView recipes
node tools/gtest.js                   # 4,480 generated questions: options, keys, junk text
node tools/lint2.js                   # TeX/sign/formatting defects across every recipe
```

`tools/` also holds the jsdom test harnesses (`npm install jsdom` first):

| Harness | What it proves |
|---|---|
| `texaudit.js` | all 8,869 questions + 4,480 generator instances render through `ML.qdata.html` with no leftover `$`, no LaTeX printed as text, no KaTeX errors, no raw fallbacks (208,014 KaTeX nodes), and no `NaN`/`undefined` |
| `gentest.js` | 22,400 generator instances (200 seeds × 112 recipes): options, keys, steps, hints, declared variable ranges, balanced TeX, worksheet reproducibility and coverage |
| `viz_test2.js` | every slider, segmented button and plain button on all six course figures changes the read-out |
| `viz_test3.js` | every course animation starts, moves the read-out, and pauses |
| `graphtest.js` | the lesson graph lab: tangent slope, area A→B (x² on [−2, 2] ≈ 5.33), sweep, keys, marker drag |
| `graphtest2.js` | `#/hu9graph` click-to-inspect (f′ of x²−3 at x = 1 = 2), the f′ column, and the polar trace |
| `gcalctest.js` | `#/graphcalc` end to end: expression rows, parameter sliders, trace read-out with slope, intersections (x²−3 vs 2x+1 = 1 ± √5), zoom/pan/reset, the table, the limit explorer on `(x²−1)/(x−1)`, add/hide/delete rows and the `#/graphcalc/x^3` deep link |
| `gtests.js` | all thirteen lesson games end to end through Playwright: home → Learn (every slide) → three levels → trophy, recording the message contract and any console error |
| `ptest.js` | the pedagogy the correct run cannot show — Learn gate, hint ladder, Show me, stars, misconception report |
| `gshots.js` | every built game boots with all external requests blocked, no overflow at 430 px, and plays a round; shoots all thirteen plus both hubs |
| `stage_test.js` | the stage on all four plotting surfaces: the canvas is inside the bounded box and carries no pixel height, resizing the box resizes the canvas, ⤢ / double-click / `f` go full screen (with the page locked), `Esc` comes back, only one plot is ever full screen, the lesson lab still redraws, and nothing is left blown up |
| `lessonviz_test.js` | the lesson sliders-and-limits block: `a`,`h`,`k` sliders move the curve, drag-to-trace reads out, zoom/reset work, the removable hole reads ≈ 2, a jump and `1/x` at 0 do not, and a cubic lesson seeds the cubic family |
| `smoke6.js` | the generator through the router: home-page demo, question card, worksheet, `#/generator/c12` and `#/generator/c1` deep links |
| `smoke5.js` | the course pages, the lesson hand-off and the studio's course filter |
| `prot_test.js`, `git log`-style course checks | the protractor/ruler tasks and the `.BOK` panels |
```

Deploy: push this folder to a repo and import it in Vercel (no framework preset,
output = repository root), or `vercel deploy --prod` from inside the folder.

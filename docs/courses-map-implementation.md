# Courses learning map — what shipped

Implementation notes for `docs/courses-visual-plan.md` (open in PR #3). All nine
work packages are now in: data, primitives, map, panel, the full explorer
catalogue, GMAT, integration and QA.

## Plan coverage

| Plan item | File | Notes |
| --- | --- | --- |
| WP0 · question ↔ lesson index | `scripts/build-course-index.py` | **Measured, not inferred.** Every one of the 162 questions carries `data-guided-question="<id>"` on exactly one lesson page, so the script reads the attribution out of the lesson HTML. Result: 162/162 mapped, 0 unassigned — the plan's `[VERIFY]` prefix map is not needed. |
| WP0 · generated data | `public/courses/questions.json`, `src/courses/data/questionIndex.json`, `lessonTopics.json`, `src/courses/gmatTopics.ts` | Run `python3 scripts/build-course-index.py` to regenerate. The bank is a static file fetched on demand, so it stays out of the initial bundle. |
| WP0 · course graph | `src/courses/courseGraph.ts` | Chapters, shapes (review = diamond, extension = hexagon), order, topics, question ids, prev/next, `MODEL_LESSONS`. Explorer badges come from the registry, so they cannot drift. |
| WP0 · progress | `src/courses/progress.ts` | `marwan:progress:v1`, `useSyncExternalStore`, cross-tab via `storage`, in-memory fallback when storage throws, migration of `marwan:sampler:mastery` (legacy key kept). |
| WP0 · Arabic topics | `src/courses/data/topics.ar.json` | Hand-translated, 126 topics, same order as the English. **Needs the owner's review.** |
| WP1 · viz primitives | `src/courses/viz/MathPlot.tsx`, `controls.tsx`, `format.ts`, `MatchGame.tsx` | Theme-aware plot, asymptote-safe curves, regions, 1-D and 2-D drag handles with keyboard support, sliders, toggles, segmented choices, live readout, and the shared matching game. |
| WP2 · map | `CourseMap.tsx`, `MapNode.tsx`, `CourseSwitcher.tsx`, `ContinueStrip.tsx` | Lanes on ≥1024 px, vertical timeline below; roving tabindex with arrow keys; legend and reset. |
| WP3 · lesson panel | `LessonPanel.tsx`, `PracticeMini.tsx`, `questions.ts` | Drawer on desktop, full-height sheet on phones, focus trap, `Esc`, prev/next, confidence rating, three-question practice with hints and per-option feedback. |
| WP4–WP6 · all 23 explorers | `src/courses/explorers/**` | One lazy chunk per lesson, 1.3–2.3 KB gzip each. Registry split into `registry.pre.ts`, `registry.calcA.ts`, `registry.calcB.ts`. `Placeholder.tsx` remains as the fallback for any lesson without one. |
| WP7 · GMAT grid | `GmatGrid.tsx` | 24 + 14 real topic titles from each page's `<h1>`, search, status filter, opens through the existing workspace. |
| WP8 · integration | `ResourceLibrary.tsx`, `CoursesExperience.tsx`, `VisualMathShowcase.tsx`, `openLesson.ts` | Map is the default view; **List keeps the old grid unchanged**; `?legacy=1` forces it. `?course=`/`?lesson=` deep links; opening a lesson pushes history so Back closes the panel. Search results for a lesson open the panel; the five visual models get "Used in" chips that open the matching lesson. |
| WP9 · QA | `docs/courses-qa.md`, `scripts/qa-courses.cjs` | Opt-in Playwright sweep (360/768/1440 × en/ar): overflow, keyboard, focus return, progress persistence, console. Not yet run — no browser in the build environment. |

## Authored courses (Algebra 1, Algebra 2, Geometry)

These three courses have **no static page**: the lesson panel *is* the lesson,
so nothing depends on `public/academy/**`.

| Course | Slug | Chapters | Lessons | Content file |
| --- | --- | --- | --- | --- |
| Algebra 1 | `algebra-1` | 5 | 19 | `src/courses/data/authored.algebra1.ts` |
| Algebra 2 | `algebra-2` | 4 | 15 | `src/courses/data/authored.algebra2.ts` |
| Geometry | `geometry` | 4 | 16 | `src/courses/data/authored.geometry.ts` |

- Every lesson carries three questions with ids `<lessonKey>::q<n>`
  (`src/courses/data/authoredQuestions.ts`, 150 in total) and a hands-on lab.
- `LessonNode.hasPage` is `false` for them, so the panel hides “Open full lesson”
  and shows “Guided here — no separate page” instead.
- `AUTHORED_QUESTIONS_PER_LESSON` in `courseGraph.ts` is the single place the
  question count lives; the practice card and the completion score both read it.
- Mixed practice (`src/courses/MixedPractice.tsx`) pulls four questions from four
  *different* courses — lessons already opened first, so interleaving stays
  relevant rather than random.

## Explorer catalogue — authored courses

| Course | Labs |
| --- | --- |
| Algebra 1 | `ExpressionLab` 1.1–1.2 · `BalanceLab` 1.3, 1.4, 3.2 · `LineLab` 2.1–2.4 · `SystemLab` 3.1, 3.3 · `FunctionLab` 3.4 · `ExponentLab` 4.1 · `FactorLab` 4.3–4.4 · `ScatterLab` 5.1–5.2 (plus `InequalityLine` 2.5, `AreaModel` 4.2) |
| Algebra 2 | `ParabolaLab` 2.1, 2.2, 2.4 · `ComplexLab` 2.3 · `AbsoluteLab` 1.3 · `PolyDivisionLab` 3.2 · `SequenceLab` 4.3 (plus `Transformations`, `InverseCheck`, `PiecewiseBuilder`, `ParentFamilies`, `RationalAsymptotes`, `RationalHole`, `GrowthDecay`, `ExpLogWorld`) |
| Geometry | `PointsLab` 1.1–1.3 · `AngleLab` 1.2 · `TransformLab` 1.4, 4.2 · `TriangleLab` 2.1–2.4 · `CircleLab` 3.1, 3.3 · `MeasureLab` 3.2, 3.4, 4.3 (plus `SolveTriangle` 2.5, `CircleBuilder` 4.1) |

## GMAT visual layer

The exam course used to be a grid of tiles pointing at iframes. It is now a
proper lesson set too:

- Each of the 38 topics is a `LessonNode` (`gmat/<slug>`, course `gmat`), with
  a code (`Q1`…`Q24`, `D1`…`D14`), a bilingual title (Arabic added in
  `gmatTopics.ts`), its iframe `href`, two key ideas from `gmatContent.ts` and a
  lab. `questionIds` stays empty — practice lives inside the page — so the panel
  offers “Open the lesson to practise” instead of an empty quiz.
- Ten new labs built for the exam patterns: `PercentLab` (percent, fractions,
  mixtures), `RateLab` (work and motion), `SetsLab` (Venn + probability),
  `NumberLineLab` (distance, integers, parity), `RemainderLab` (remainders and
  sequences), `CountingLab` (slots, nPr/nCr), `StatsLab` (outlier vs mean,
  weighted means), `ChartLab` (truncated axes, pie shares, scatter trend),
  `TableLab` (row/column totals, derived rates, two-part pairs) and
  `SufficiencyLab` (the five Data Sufficiency answers, shown as verdicts).
- `ModelLab` covers the eight algebra topics (exponents, expressions, factoring,
  quadratics, functions, inequalities, systems, algebraic fractions) with one
  plot each, so a tile never opens onto a bare formula.
- Tiles open the lab panel; a small “Page ▸” link still goes straight to the
  iframe for anyone who wants the original lesson.

## Explorer catalogue (23)

| Course | Lessons with an explorer |
| --- | --- |
| Calculus | P.1 intercepts & symmetry · P.3 piecewise builder · 1.2 limit approach · 1.3 cancel the factor · 1.4 continuity conditions · 1.5 infinite limits · Ch 1 match game · 2.1 secant → tangent · 2.2–2.3 power + product rules · Extension corner test · 2.4 chain gears · 2.5 implicit tangent · 2.6 ladder · Ch 2 match game |
| Precalculus | 1.1 real numbers · 1.3 area model · 1.4 the hole · 1.8 inequalities · 1.9 circles · 2.1 vertical line test · 2.2 domain & range · 2.3 read the graph · 2.6 transformations · 3.1 inverses · 3.2 polynomial families · 3.3 rational asymptotes · 4.3 growth & decay · 5.1 exp & log · 5.3 solve by graph · 5.4 trig carousel · 5.5 solving triangles · 6.2 matrix flip |

Every explorer follows the contract in §7.2: keyboard operable, live readout
(`aria-live="polite"`), one `onInteract()` on first change only, no autoplay
(2.6 has a play button that starts paused), LTR plot inside RTL chrome.

## Decisions taken

- **No KaTeX.** The plan left `katex` as an open decision. The bank's LaTeX is
  converted to readable Unicode in `questions.ts` (`\frac`, `\sqrt`, `\lim`,
  superscripts, Greek) instead of shipping ~280 KB of JS plus fonts. Swapping in
  KaTeX later only touches `mathRuns()` and the panel chunk.
- **Matching games are click/keyboard, not drag.** §7.3 suggested dragging a
  chip onto a graph; select-then-pair works identically with a keyboard and a
  screen reader, so both chapter reviews use it.
- **GMAT records only "opened"** (there is no per-topic question set to score),
  so the GMAT ring is opened ÷ 38. Every topic now also has a lab, so the ring
  and the lab badge agree.
- **Progress stays local.** No accounts, no server, no analytics.

## Data QA (no browser needed)

`npm run qa:data` (`scripts/check-course-data.cjs`) reads the source files and
checks every invariant the UI assumes: each authored lesson has a lab and exactly
three questions, no orphan question or explorer key points at a missing lesson,
every registry entry resolves to a file on disk, and each registry is wired into
`explorers/index.ts`. It exits non-zero, so it can gate a commit.

A bug it caught immediately: the static precalculus pages number their lessons
`pc-1-1`, while the generated topic/question indexes use `1-1`. `courseGraph`
now strips that prefix, which re-attaches the whole precalculus course to its
questions and explorers.

## Known follow-ups

1. Run `scripts/qa-courses.cjs` (WP9) on a machine with a browser, and eyeball
   the Vercel preview: LTR + RTL, light + Chalkboard Dark, 360 px.
2. Arabic review of `topics.ar.json` and the new UI strings (they are drafted,
   not reviewed).
3. `public/academy/**` is a copy of another site's lessons — read-only here, and
   publishing it is the owner's call.

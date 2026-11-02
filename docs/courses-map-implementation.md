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
  so the GMAT ring is opened ÷ 38.
- **Progress stays local.** No accounts, no server, no analytics.

## Known follow-ups

1. Run `scripts/qa-courses.cjs` (WP9) on a machine with a browser, and eyeball
   the Vercel preview: LTR + RTL, light + Chalkboard Dark, 360 px.
2. Arabic review of `topics.ar.json` and the new UI strings (they are drafted,
   not reviewed).
3. `public/academy/**` is a copy of another site's lessons — read-only here, and
   publishing it is the owner's call.

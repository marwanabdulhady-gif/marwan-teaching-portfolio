# Courses learning map — what shipped

Implementation notes for the `docs/courses-visual-plan.md` spec (currently open in
PR #3). This branch starts the plan with the data layer, the map and the lesson
panel; the 21 remaining explorers are the next wave.

## What is in place

| Plan item | File | Notes |
| --- | --- | --- |
| WP0 · question ↔ lesson index | `scripts/build-course-index.py` | **Measured, not inferred.** Every one of the 162 questions carries `data-guided-question="<id>"` on exactly one lesson page, so the script reads the attribution out of the lesson HTML. Result: 162/162 mapped, 0 unassigned — the plan's [VERIFY] prefix map is not needed. |
| WP0 · generated data | `public/courses/questions.json`, `src/courses/data/questionIndex.json`, `src/courses/data/lessonTopics.json`, `src/courses/gmatTopics.ts` | Run `python3 scripts/build-course-index.py` to regenerate. The bank is served as a static file and fetched on demand, so it stays out of the initial bundle. |
| WP0 · course graph | `src/courses/courseGraph.ts` | Chapters, shapes (review = diamond, extension = hexagon), order, topics, question ids, prev/next. Titles come from `ACADEMY_LESSONS`, never duplicated. |
| WP0 · progress | `src/courses/progress.ts` | `marwan:progress:v1`, `useSyncExternalStore`, cross-tab via the `storage` event, in-memory fallback when storage throws. Migrates `marwan:sampler:mastery` and keeps the legacy key. |
| WP0 · Arabic topics | `src/courses/data/topics.ar.json` | Hand-translated, 126 topics, same order as the English. **Needs the owner's review** before launch. |
| WP1 · viz primitives | `src/courses/viz/MathPlot.tsx`, `controls.tsx`, `format.ts` | Theme-aware plot, curves that break at asymptotes, draggable handles with keyboard support, sliders, live readout. |
| WP2 · map | `CourseMap.tsx`, `MapNode.tsx`, `CourseSwitcher.tsx`, `ContinueStrip.tsx` | Lanes on ≥1024 px, vertical timeline below; roving tabindex with arrow keys; legend and "Reset progress". |
| WP3 · lesson panel | `LessonPanel.tsx`, `PracticeMini.tsx`, `questions.ts` | Drawer on desktop, full-height sheet on phones, focus trap, `Esc` closes, prev/next, confidence rating, three-question practice. |
| WP7 · GMAT grid | `GmatGrid.tsx` | 24 + 14 real topic titles from each page's `<h1>`, search, status filter, opens through the existing workspace. |
| WP8 · integration | `ResourceLibrary.tsx`, `CoursesExperience.tsx` | Map is the default view; **List keeps the old grid unchanged**; `?legacy=1` forces it. `?course=` and `?lesson=` deep links work; opening a lesson pushes history so Back closes the panel. Search results for a lesson now open the panel instead of the iframe. |
| Explorers (2 of 23) | `explorers/calcB/SecantToTangent.tsx`, `explorers/pre/Transformations.tsx` | The two prototypes from the visual plan, rebuilt on the shared primitives. Lessons without one get `Placeholder`. |

## Decisions taken

- **No KaTeX yet.** The plan left `katex` as an open decision. Instead of adding
  ~280 KB of JS and 60 font files, `src/courses/questions.ts` converts the
  bank's LaTeX to readable Unicode (`\frac`, `\sqrt`, `\lim`, superscripts,
  Greek). It is legible but not typeset. Adding KaTeX later only touches
  `mathRuns()` and the panel chunk.
- **Reports, not drill-downs.** GMAT topics only record "opened" (there is no
  per-topic question set to score), so the GMAT ring shows opened ÷ 38.
- **Progress stays local.** No accounts, no server, no analytics, as the plan
  requires.

## Still to do

1. The 21 remaining explorers (WP4–WP6), one per lesson, following §7.3.
2. "Used in" chips under the five visual models (§3.5).
3. Reduce the completion ring's motion under `prefers-reduced-motion` — the node
   pulse is already `motion-safe` only.
4. Playwright pass (WP9) at 360/768/1440, LTR + RTL, light and Chalkboard Dark.
5. Arabic review of `topics.ar.json` and the new UI strings.

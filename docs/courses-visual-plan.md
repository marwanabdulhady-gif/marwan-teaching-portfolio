# Courses page: visual & interactive redesign plan

Audience: AI agents implementing this in parallel. Read sections 0–2 first, then
take **one work package** (section 8). Everything here is specific on purpose.
Where something could not be verified it is marked **[VERIFY]**.

Branch: `claude/stoic-pascal-b8dbju`. Page: `/courses` (`CoursesPage` in
`src/TeachingApp.tsx`). Stack: React 19, Vite, Tailwind v4, `motion/react`,
`lucide-react`. No router lib (own router in `src/router.tsx`).

---

## 0. Ground rules (apply to every work package)

1. **Do not delete or rewrite existing files** unless a package says so. The
   old list view and the iframe lessons stay (they become the "List" view and
   the "Open full lesson" action).
2. **Own only your files** (section 8 lists them). Shared files (`ResourceLibrary.tsx`,
   `TeachingApp.tsx`, `teachingData.ts`, `academyData.ts`) are edited only by WP8.
3. **Bilingual always.** Every user-visible string is `Bi = { en, ar }` (type in
   `src/teachingData.ts`). Pick with `isRtl ? o.ar : o.en` from `useLocale()`.
4. **RTL:** UI chrome uses logical Tailwind (`ms-`, `ps-`, `start-0`, `text-start`).
   **Math/plots are always LTR**: wrap every plot in `<div dir="ltr">`.
5. **Theming:** only use CSS variables `--t-bg --t-bg-2 --t-ink --t-accent
   --t-accent-2 --t-accent-deep --t-sky --t-sun --t-glass` (they switch with the 8
   appearance themes). Never hard-code colours except inside SVG art that is
   explicitly dark-on-dark (use `data-theme="dark"` containers like the existing chalk cards).
6. **Motion:** use `motion/react`. Respect `useReducedMotion()`: when true, no
   autoplay and no entrance animation (state changes are instant).
7. **Accessibility:** every interactive element is keyboard-operable, has an
   accessible name, visible focus ring, hit target ≥ 44×44 px on touch.
   Live numeric readouts use `aria-live="polite"` (throttle to ≤ 4 updates/s).
8. **Performance:** each explorer is lazy-loaded (`React.lazy`), ≤ 15 KB gzipped,
   no new heavy deps. Plots re-render with `requestAnimationFrame` batching.
9. **Checks before pushing:** `npm run lint` and `npm run build` pass; no console
   errors at 360×800 and 1440×900, LTR and RTL; no horizontal scroll.

---

## 1. Current state (facts)

| Thing | Where | Notes |
| --- | --- | --- |
| Page | `CoursesPage` in `src/TeachingApp.tsx` | `ChapterBanner` → `VisualMathShowcase` → `ResourceLibrary` → `PageLinks` → `WorkWithMe` |
| Visual models | `src/components/VisualMathShowcase.tsx` | 5 animated SVG models (card ids `calculus`, `precalculus`, `gmat`, `exam`, plus the featured Equation↔Table↔Graph). Pause/play only; **not linked to lessons** |
| Course UI | `src/components/ResourceLibrary.tsx` (798 lines) | State `sectionView: 'courses'\|'sampler'\|'media'` (l.~386), `courseTab` (calc/precalc). Lessons are a flat 3-column grid of text rows |
| Lessons | `public/academy/courses/<course>/lessons/<id>/index.html` | Static pages, separate app, opened in an iframe by `launchWorkspace(url,title)`. Do not edit |
| Lesson metadata | `src/academyData.ts` → `ACADEMY_LESSONS` (23) and `drmathazzam-clone/source/lessons.json` | Fields: `courseSlug, id, code, title, topics[] (3–9 each), hasLab`. 14 calculus + 9 precalculus |
| Questions | `drmathazzam-clone/source/question-bank.json` (108 KB, 162 items) | Item: `{id, question (LaTeX in $…$), options[], correctIndex, hint, explanation, optionFeedback[]}` |
| Worked steps | `…/worked-steps.json`, `…/lab-quizzes.json` | HTML fragments from the original site |
| Native practice | `GuidedLessonSampler` in `ResourceLibrary.tsx` + `GUIDED_SAMPLER_ITEMS` | Only place with progress: `localStorage['marwan:sampler:mastery']` |
| GMAT | `public/academy/courses/gmat-preparation/{quant (24), di (14)}/<topic>/` | Only a link today |
| Cross-page open | `openAcademyWorkspace(url,title)` in `SearchPalette.tsx` | Dispatches `marwan:open-academy` (listened to in `ResourceLibrary`) |

**Problems this plan fixes**

1. No path: 23 lessons look identical, no order, no chapters, no sense of "where am I".
2. No progress or "continue where I left off" (only the sampler stores anything).
3. Lessons are opaque: a title and a code. No preview, no topics, no practice count.
4. The 5 visual models are decorative and disconnected from lessons.
5. Two different UIs for the same content (native sampler vs iframe).
6. GMAT (38 topics) is one link; invisible.

---

## 2. Target experience (summary)

`/courses` becomes a **learning map**:

```
[ ChapterBanner 02 ]
[ ContinueStrip ]            ← resume last lesson, or "Start with P.1"
[ CourseSwitcher ]           ← Calculus 14 · Precalculus 9 · GMAT 38   (progress rings)
[ View toggle: Map | List ]  ← Map is default; List = the old grid (kept)
[ CourseMap ]                ← chapters as lanes, lessons as nodes on a path
[ Visual Labs ]              ← existing 5 models, each now links to its lessons
[ Practice | Media tabs ]    ← existing sampler + media (kept)
```

Clicking a lesson node opens a **LessonPanel** (drawer on desktop, bottom sheet on
phones) with: topics checklist, a **signature interactive explorer** (one per
lesson, section 7), 3-question quick practice, mastery rating, and "Open full
lesson" (the existing iframe). Progress is stored locally and drawn on the map.

---

## 3. Screens & wireframes

### 3.1 ContinueStrip (new, above the switcher)

```
┌──────────────────────────────────────────────────────────────────────┐
│ ▶  Continue · 2.4 The Chain Rule              ███████░░░ 70%  [Resume]│
└──────────────────────────────────────────────────────────────────────┘
```
- Height 64 px, full container width, `teach-card`. Left: play icon chip (accent).
  Middle: eyebrow "Continue", lesson code+title (truncate), thin progress bar.
  Right: primary button "Resume" → opens that lesson's LessonPanel.
- **New visitor** (no progress): eyebrow "Start here", text "P.1 Graphs and Models"
  (Calculus) button "Start". Secondary text link "Not sure? Try the quick practice" → Practice tab.
- Hidden entirely on `?legacy=1`.

### 3.2 CourseSwitcher (replaces the two pill buttons)

```
( ◔ Calculus · 14 )  ( ◔ Precalculus · 9 )  ( ◔ GMAT · 38 )
```
- Segmented control, 3 items, `role="tablist"`, arrow keys move selection.
- Each item has a 28 px **progress ring** (SVG circle, stroke `--t-accent`,
  track ink 12%) showing % of lessons with completion ≥ 100 (GMAT ring shows
  opened/38). Item text: name + count.
- Selected: accent background, white text. Others: transparent with ink 18% border.
- URL sync: `?course=calculus|precalculus|gmat` (replaceState, no navigation).

### 3.3 CourseMap (the core visual)

**Desktop ≥ 1024 px: lanes.** One horizontal lane per chapter, each lane a "metro line".

```
Chapter P · Preparation for Calculus
  (P.1)━━━━(P.3)
Chapter 1 · Limits
  (1.2)━━━━(1.3)━━━━(1.4)━━━━(1.5)━━━━◆ Ch1 Review
Chapter 2 · Differentiation
  (2.1)━━━━(2.2+2.3)━━━━◇ Ext ━━━━(2.4)🧪━━━━(2.5)🧪━━━━(2.6)━━━━◆ Ch2 Review
```
Geometry (SVG, `viewBox` computed): node radius 26, horizontal pitch 132,
lane height 128, lane label 14 px above the line, line stroke 4 px with
round caps, 12 px corner radius where a lane wraps to a second row
(wrap when lane width > container width: continue on a new row of the same lane).

**Phone < 1024 px: vertical timeline.** Line runs along the inline-start edge
(left in LTR, right in RTL); nodes are full-width cards (min-h 72) hanging off the line.

**Node anatomy** (`LessonNode`):
- Circle (Review lessons = diamond, rotated square; Extension = hexagon).
- Centre text: the lesson `code` (11 px bold mono). Below node: title, 2 lines max, 12 px.
- Badges (top-end corner, 16 px): 🧪 `hasLab`/explorer; ✓ when mastery = confident.
- **State → look** (all tokens from the theme):

| State | Rule | Look |
| --- | --- | --- |
| `new` | completion 0 | hollow, ink 25% stroke, bg fill |
| `started` | 1–99 | accent progress arc (SVG `stroke-dasharray`) around the node |
| `done` | 100 | filled `--t-sky`, white code |
| `confident` | mastery = confident | filled `--t-sun`, ✓ badge, subtle glow (box-shadow only, no animation loop) |
| `current` | last opened | pulsing ring: scale 1→1.25, opacity .5→0, 1.6 s, **disabled under reduced motion** |

**Interactions**
- Hover/focus node: lifts 2 px, tooltip card (200 px): title, topics count,
  "n questions", completion %. Tooltip is also the accessible description
  (`aria-describedby`).
- Click/Enter/Space: open LessonPanel for that lesson (URL `?lesson=grade-12-calculus/2-4`, replaceState).
- Arrow keys move focus between nodes in reading order (roving tabindex).
- Path line between two nodes fills with accent (animated `stroke-dashoffset`
  0.4 s) once the first node is `done`.
- Top-right of the map: legend (the 4 states) and a "Reset progress" text button
  (confirm dialog).

### 3.4 LessonPanel (new)

Desktop: right-anchored drawer, width `min(520px, 92vw)`, full height under the nav (top 72 px),
scrim `rgba(0,0,0,.35)`. Phone: bottom sheet, height 92 svh, drag handle, swipe down closes.
Focus trap, `Esc` closes, returns focus to the node.

```
┌─────────────────────────────────────┐
│ P  2.4  The Chain Rule        [✕]  │  header (sticky)
│ ━━━━━━━━━━━━━━━━━━ 70%             │
├─────────────────────────────────────┤
│ TRY IT                              │
│ ┌─────────────────────────────────┐ │
│ │      <signature explorer>       │ │  fixed aspect 4:3 (phone 1:1)
│ └─────────────────────────────────┘ │
│ readout: dy/dx = 6·(3x+1)           │
├─────────────────────────────────────┤
│ WHAT YOU'LL LEARN        ☑ ☑ ☐ ☐ ☐ ☐│  topics from lessons.json (check = explorer touched/ practice right)
├─────────────────────────────────────┤
│ QUICK PRACTICE  (3 of 6)  ●●○       │  PracticeMini
│  Q: Which rule controls …?          │
│  ( ) A  ( ) B  ( ) C  ( ) D [Check] │
├─────────────────────────────────────┤
│ How confident? [Review][Practice][Confident] │
├─────────────────────────────────────┤
│ [◀ 2.3]  [ Open full lesson ▸ ]  [2.5 ▶] │  sticky footer
│ Desmos lab · Ask the AI tutor       │  text links
└─────────────────────────────────────┘
```
- "Open full lesson" calls the existing `launchWorkspace(url,title)` (iframe) and closes the panel.
- Prev/Next follow `ACADEMY_LESSONS` order within the course.
- Opening the panel marks `opened` and sets `last`.

### 3.5 Visual Labs (existing, upgraded)

Keep the 5 models. Add under each card a **"Used in" row of chips**
(e.g. `1.2`, `2.1`) that call `openLesson(key)`. Mapping in `courseGraph.ts`
(`MODEL_LESSONS`):
`calculus → [calculus/2-1, calculus/1-2]`, `precalculus → [precalculus/2-6]`,
`featured (equation↔table↔graph) → [precalculus/2-1, precalculus/2-2]`,
`gmat → [gmat]`, `exam → [gmat]`. Chip click on a GMAT model switches to the GMAT course view and scrolls to the map.

### 3.6 GMAT view

Replaces the map when course = `gmat`. Two groups, tile grid
(`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`, gap 12):
- **Quantitative (24)** and **Data Insights (14)**. Group header has count and a
  filter chip row: `All · Not started · In progress · Done`.
- Tile (min-h 88): title (2 lines), type badge, small status dot (same states as nodes).
  Search box above groups filters by title (client-side, diacritics-insensitive).
- Click → opens the topic page via `launchWorkspace` and marks opened.
- Topic list/titles: **[VERIFY]** derive from folder names in
  `public/academy/courses/gmat-preparation/{quant,di}/` and the `<h1>` of each
  `index.html`; write the result to `src/courses/gmatTopics.ts` (static, committed).

### 3.7 List view (kept)

`View toggle` second option renders the **existing** lesson grid code from
`ResourceLibrary.tsx` unchanged. Toggle persisted in `localStorage['marwan:courses:view']`.

---

## 4. Visual language

- Reuse `teach-card`, `teach-btn`, `teach-eyebrow`, `teach-section-title` (see `src/teaching.css`).
- Radii: nodes 999 px; cards 16–24 px; panel 24 px (top corners on sheet).
- Type: display `var(--teach-font-display)` for panel title and lane titles; body default; codes `font-mono`.
- Elevation: cards use the existing shadow; panel `0 24px 60px -20px var(--t-shadow)`.
- Plot palette (inside explorers, theme aware):
  function curve `--t-accent`; secondary curve `--t-sky`; highlight/point `--t-sun`;
  grid ink 10%; axes ink 45%; ghost/parent function ink 25% dashed (`4 4`).
- Motion durations: hover 150 ms, panel 280 ms `cubic-bezier(.16,1,.3,1)`,
  path fill 400 ms, node pulse 1.6 s (looping only if not reduced motion).

---

## 5. Data layer (WP0 builds this; everything else imports it)

### 5.1 `src/courses/courseGraph.ts`

```ts
import type { Bi } from '../teachingData';

export type CourseId = 'calculus' | 'precalculus' | 'gmat';
export type LessonKey = string; // `${courseSlug}/${id}`, e.g. 'grade-12-calculus/2-4'
export type NodeShape = 'circle' | 'diamond' | 'hexagon'; // lesson | review | extension

export interface LessonNode {
  key: LessonKey;
  course: CourseId;
  courseSlug: 'grade-12-calculus' | 'grade-11-precalculus';
  id: string;          // 'p1', '1-2', 'chapter-1-review' …
  code: string;        // 'P.1', '1.2', 'Review', 'Extension'
  title: Bi;
  topics: Bi[];        // from lessons.json (English) + Arabic (see 5.4)
  shape: NodeShape;
  chapterId: string;   // 'p' | '1' | '2'
  order: number;       // global order inside the course
  href: string;        // existing static page, e.g. /academy/courses/grade-12-calculus/lessons/2-4/index.html
  questionIds: string[]; // from questionIndex.json
  hasExplorer: boolean;
}
export interface Chapter { id: string; title: Bi; lessons: LessonKey[] }
export interface Course { id: CourseId; title: Bi; chapters: Chapter[] }

export const COURSES: Course[];
export const LESSONS: Record<LessonKey, LessonNode>;
export const MODEL_LESSONS: Record<string, LessonKey[]>; // see 3.5
```
Chapter mapping (fixed):
- Calculus: **P** → `p1, p3`; **1** → `1-2, 1-3, 1-4, 1-5, chapter-1-review`; **2** → `2-1, 2-2-2-3, piecewise-differentiability, 2-4, 2-5, 2-6, chapter-2-review`.
- Precalculus: **1** → `1-1, 1-3, 1-4, 1-8, 1-9`; **2** → `2-1, 2-2, 2-3, 2-6`.
- Build `LESSONS` from the existing `ACADEMY_LESSONS` (do not duplicate titles); add chapter/shape/order here.

### 5.2 `scripts/build-course-index.py` → `src/courses/data/*.json`

Creates (committed outputs):
- `questionIndex.json`: `{ [LessonKey]: string[] }` question ids per lesson.
  **Rules (prefixes are inferred from the ids, not confirmed. [VERIFY] each one against the lesson HTML before trusting it, e.g. that `c1-*` really belongs to the Chapter 1 review and `l13-*` to lesson 1.3):** id prefix map: `p1→calculus/p1`, `p3→p3`, `l13→1-3`, `continuity→1-4`,
  `c1→chapter-1-review`, `c2→chapter-2-review`, `c21→2-1`, `c223→2-2-2-3`, `pw→piecewise-differentiability`,
  `chainChecks-*→2-4`, `implicitChecks-*→2-5`, `ratesChecks-*→2-6`.
  The 75 `guided-*` ids: **[VERIFY]** each lesson page contains `data-guided-question="<id>"`;
  scan `public/academy/courses/**/lessons/*/index.html` for those attributes to assign them.
  Report any unassigned id in the script output (do not guess).
- `questions.json`: copy of `question-bank.json` (so the app does not import from the clone folder).
- `lessonTopics.json`: `{ [LessonKey]: string[] }` from `lessons.json`.

### 5.3 `src/courses/progress.ts` (single source of truth)

```ts
export const PROGRESS_KEY = 'marwan:progress:v1';
export type Mastery = 'review' | 'practice' | 'confident';
export interface LessonProgress {
  opened?: number;                       // epoch ms of first open
  explorer?: boolean;                    // true after first explorer interaction
  checks: Record<string, 'right'|'wrong'>; // by question id (latest answer)
  mastery?: Mastery;
  updated: number;
}
export interface ProgressV1 { version: 1; lessons: Record<LessonKey, LessonProgress>; last?: { key: LessonKey; ts: number }; gmat: Record<string, { opened: number }> }

export function useProgress(): {
  state: ProgressV1;
  completion(key: LessonKey): number;      // 0–100
  nodeState(key: LessonKey): 'new'|'started'|'done'|'confident';
  markOpened(key): void; markExplorer(key): void;
  answer(key, qid, correct: boolean): void;
  setMastery(key, m: Mastery): void;
  reset(): void;
};
```
- Implement with `useSyncExternalStore` + `window` `storage` event (cross-tab) + in-tab custom event.
- Every `localStorage` call in try/catch (private mode); fall back to in-memory.
- **Completion formula (0–100):** `opened ? 20 : 0` + `explorer ? 20 : 0` + `60 × (distinct right answers ÷ questionIds.length)` (rounded). A lesson with 0 questions: opened 40 + explorer 60.
- `nodeState`: `confident` if mastery==='confident'; else `done` if completion==100; `started` if >0; else `new`.
- Migration: read legacy `marwan:sampler:mastery` once; map into `mastery` where keys resolve; never delete the legacy key.

### 5.4 Arabic topics
`lessons.json` topics are English only. WP0 adds `src/courses/data/topics.ar.json`
`{ [LessonKey]: string[] }`, hand-translated (same length/order as English). If a
translation is missing, fall back to English. Math notation stays Latin/LTR.

---

## 6. Components (file → props → behaviour)

| File | Props | Notes |
| --- | --- | --- |
| `src/courses/ContinueStrip.tsx` | `{ onOpen(key) }` | 3.1. Reads `useProgress().state.last` |
| `src/courses/CourseSwitcher.tsx` | `{ value: CourseId; onChange }` | 3.2 |
| `src/courses/CourseMap.tsx` | `{ course: CourseId; onOpen(key) }` | 3.3, builds SVG from `COURSES`; `useMeasure` to choose desktop/phone layout |
| `src/courses/MapNode.tsx` | `{ lesson; state; current; onOpen }` | Pure presentational, memoised |
| `src/courses/LessonPanel.tsx` | `{ lessonKey: LessonKey \| null; onClose; onOpenFull(url,title); onNavigate(key) }` | 3.4; lazy-loads the explorer by key |
| `src/courses/PracticeMini.tsx` | `{ lesson: LessonNode }` | Picks 3 unanswered questions (then wrong ones). Renders LaTeX (see §10 decision). Shows hint on request, per-option feedback from `optionFeedback`, explanation after check. Calls `progress.answer` |
| `src/courses/GmatGrid.tsx` | `{ onOpen(url,title) }` | 3.6 |
| `src/courses/CoursesExperience.tsx` | `{ launchWorkspace }` | Composes 3.1–3.4 + view toggle; **the only thing WP8 mounts in `ResourceLibrary`** |
| `src/courses/viz/*` | see §7.1 | Shared plot primitives |
| `src/courses/explorers/**` | see §7 | One file per lesson |

Panel/URL state lives in `CoursesExperience` (`?course`, `?lesson`). Back button
closes the panel (push a history entry when opening; pop closes).

---

## 7. Interactive explorers

### 7.1 Shared primitives (WP1, `src/courses/viz/`)

- `MathPlot.tsx`: props `{ xDomain:[n,n]; yDomain:[n,n]; aspect?: number; grid?: boolean; children(scale): ReactNode; ariaLabel: string }`. Renders an SVG with axes, grid, tick labels, and passes `scale = { x(n), y(n), ix(px), iy(px) }` (data↔pixel).
  - `<Curve fn={(x)=>number} samples={240} stroke=… dash? />`: samples, **breaks the path** at non-finite values or `|Δy| > 0.5·(yMax−yMin)` (asymptotes/jumps).
  - `<Point x y r? color? hollow? label? />`, `<Segment />`, `<Region />` (shade between curves), `<Asymptote x|y />`.
  - `<DragHandle x y onChange constrain?="x"|"y"|"xy" snap? step? ariaLabel />`: pointer-capture drag, **keyboard**: arrows ±`step`, Shift ±10×step, Home/End = domain ends; role `slider`-like with `aria-valuetext`.
- `Slider.tsx`: `{ label: Bi; value; min; max; step; onChange; format?(v):string }`, native `<input type=range>` styled, label + value on one line, 44 px thumb target.
- `Readout.tsx`: `{ rows: {label: string; value: string}[] }`, monospace, `aria-live="polite"`, throttled.
- `Toggle.tsx`, `SegmentedChoice.tsx` for discrete options.
- `useExplorerState.ts`: `const [v,set,touched] = …` calls `onInteract()` **once** on first change.
- `format.ts`: `fmt(n, d=2)` trims zeros; handles `−` (U+2212) for negatives and `∞`.

### 7.2 Explorer contract

```ts
export interface ExplorerProps { lesson: LessonNode; onInteract(): void }
export default function Explorer(props: ExplorerProps): JSX.Element;
```
Registry: three files `src/courses/explorers/registry.pre.ts`,
`registry.calcA.ts`, `registry.calcB.ts`, each
`export const entries: Record<LessonKey, () => Promise<{default: ComponentType<ExplorerProps>}>> = { 'grade-11-precalculus/1-1': () => import('./pre/RealNumbers'), … }`;
`explorers/index.ts` merges them (WP2/3 owns only `index.ts`; created in WP1).

**Per-explorer acceptance:** (a) works with pointer and keyboard; (b) readout
updates live; (c) first change calls `onInteract`; (d) 4:3 on ≥ sm, 1:1 below, no layout shift;
(e) all strings Bi; (f) no autoplay (except 2.6 which has an explicit Play button, off by default);
(g) chunk ≤ 15 KB gz; (h) renders at 360 px with controls under the plot (not overlapping).

### 7.3 Catalogue (23 lessons; each row is a complete spec)

Domains are default `[-5,5]×[-5,5]` unless stated. "Readout" = text rows.

**Precalculus (WP4, folder `explorers/pre/`)**

| Key / file | Visual | Controls | Readout | "Aha" behaviour |
| --- | --- | --- | --- | --- |
| `…/1-1` `RealNumbers.tsx` | Number line −10…10 + nested sets ℕ⊂ℤ⊂ℚ⊂ℝ as 4 concentric rounded rects (Venn) | Drag a point; toggle "type a number" input (accepts `√2`, `3/4`, `-5`, `π`) | Smallest set containing it; decimal form | Concentric set containing the point glows; irrational shows non-repeating digits |
| `…/1-3` `AreaModel.tsx` | Rectangle split into 4 areas for (x+a)(x+b) | Sliders a, b ∈ [−5,5] int; x fixed 6 | Expanded form x²+(a+b)x+ab | Negative a/b flips tile to hatched "subtract" colour |
| `…/1-4` `RationalHole.tsx` | Curve of (x²−a²)/(x−a) | Slider a ∈ [−4,4] step .5 | Simplified form; domain exclusion x≠a | Hollow hole marker at x=a; tick "cancelled factor" chip |
| `…/1-8` `InequalityLine.tsx` | Number line with shaded region | Drag boundary c; toggle `<,≤,>,≥`; second boundary optional (compound) | Inequality + interval notation | Open/closed circle follows the sign; shading direction flips |
| `…/1-9` `CircleBuilder.tsx` | Plane with circle | Drag centre (h,k) (snap .5), drag radius handle | `(x−h)²+(y−k)²=r²`; expanded general form | Click anywhere → shows distance to centre and inside/on/outside |
| `…/2-1` `VerticalLineTest.tsx` | Curve picker (parabola, circle, sideways parabola, abs) + vertical line | Drag vertical line x=c; choose curve | Intersections count; "Function ✓/✗" | Line turns green with 1 hit, red with ≥2; marks all hits |
| `…/2-2` `DomainRange.tsx` | Graph of chosen f (√x, 1/x, x², ln x, |x|) | Pick f; drag trace point | x, f(x); domain & range in interval notation | Domain shown as a bar on x-axis, range on y-axis, live-highlighted |
| `…/2-3` `ReadTheGraph.tsx` | A fixed cubic with 2 turning points | Drag point P along the curve | f(x), increasing/decreasing, zeros, local max/min flags | Intervals of increase shaded accent, decrease shaded sky |
| `…/2-6` `Transformations.tsx` | Parent f (ghost dashed) + g(x)=a·f(x−h)+k | Sliders a [−3,3], h [−4,4], k [−4,4]; reflect-x toggle; choose parent (x², |x|, √x, 1/x) | g(x) formula; "shift right 2, up 1…" sentence | Key points (vertex/corners) of parent animate to new positions via 250 ms tween |

**Calculus A (WP5, folder `explorers/calcA/`)**

| Key / file | Visual | Controls | Readout | "Aha" |
| --- | --- | --- | --- | --- |
| `…/p1` `InterceptsSymmetry.tsx` | Graph of chosen equation (y=x³−x, x²+y²=4, y=x²−1) | Pick equation; toggle "show intercepts / x-sym / y-sym / origin-sym" | Intercept coordinates; symmetry verdicts | Reflection ghost curve drawn when a symmetry toggle is on; matches or not |
| `…/p3` `PiecewiseBuilder.tsx` | Piecewise function with 2 pieces | Drag breakpoint c; choose piece types (line, parabola, const); open/closed ends toggles | f(c⁻), f(c), f(c⁺) | Filled/hollow dots at junction update live |
| `…/1-2` `LimitApproach.tsx` | Curve with removable hole at x=c (or jump; picker) | Slider/ drag x₀ approaching c from left & right (two handles) | Table of (x, f(x)) 6 rows closing in; L⁻, L⁺, limit | Arrows converge; table rows highlight; "limit exists ✓/✗" |
| `…/1-3` `CancelFactor.tsx` | Graph of (x²−9)/(x−3) etc. | Button sequence "Factor → Cancel → Substitute" (step-reveal) ; preset picker (3 forms) | Algebra steps as lines | "Cancel" animates the common factor sliding out; hole fills to limit value |
| `…/1-4` `ContinuityChecker.tsx` | Function with removable, jump or infinite discontinuity (picker) | Drag point c across x-axis | 3 checklist rows: f(c) defined? limit exists? equal? | Each row lights ✓/✗; classify "removable/jump/infinite" |
| `…/1-5` `InfiniteLimit.tsx` | 1/(x−c)², 1/(x−c) | Slider d = |x−c| log scale 1…0.001 from left/right | x, f(x), sign; "→ +∞ / −∞ / DNE" | Vertical asymptote line; curve value counter grows; y-axis auto-zooms (clamped) |
| `…/chapter-1-review` `LimitMatch.tsx` | 6 mini graphs + 6 verdict chips | Drag chip onto graph (or select graph then chip for keyboard) | Score x/6 | Correct pair locks with ✓; wrong bounces back with the rule hint |

**Calculus B (WP6, folder `explorers/calcB/`)**

| Key / file | Visual | Controls | Readout | "Aha" |
| --- | --- | --- | --- | --- |
| `…/2-1` `SecantToTangent.tsx` | Top: f(x)=x² curve with secant through (a,f(a)) and (a+h,f(a+h)); bottom: derivative plot f′ being traced | Drag a; slider h from 2 → 0.001 (log) | Secant slope, tangent slope f′(a) | At h→0 secant becomes tangent (colour change); f′ trace point appears |
| `…/2-2-2-3` `RulesLab.tsx` | Tab 1 **Power rule**: tiles xⁿ→n·xⁿ⁻¹; Tab 2 **Product rule**: rectangle u×v with strips du, dv | Slider n 1..6; sliders u, v, du, dv | Formula with numbers | Area of strips sums to (uv)′·dx visually |
| `…/piecewise-differentiability` `CornerTest.tsx` | f = |x|, or piecewise parameterised | Drag junction c; slider slope-left / slope-right; presets (corner, cusp, vertical tangent) | Left slope, right slope, "Differentiable ✓/✗ because …" | Two tangent half-lines drawn; mismatch shows a gap arc |
| `…/2-4` `ChainGears.tsx` | Three meshed gears u→v→y with tooth counts | Sliders for dv/du and du/dx (1–4) | dy/dx = dy/dv·dv/du·du/dx numeric | Rotating gears (only while dragging/"Turn" button held); product highlighted |
| `…/2-5` `ImplicitTangent.tsx` | Circle x²+y²=r² (also x²+xy+y²=3 preset) | Drag point on curve (constrained); slider r | dy/dx = −x/y with numbers; tangent line drawn | Vertical tangent flagged where y=0 |
| `…/2-6` `RelatedRates.tsx` | Ladder 10 m sliding on wall, plus a plot of x(t), y(t) | Slider dx/dt (0.5–3); **Play/Pause** button (default paused); scrubber for t | x, y, dy/dt formula `−(x/y)·dx/dt` | Rate readout blows up as y→0 (clamp display "→ −∞") |
| `…/chapter-2-review` `DerivativeMatch.tsx` | Same mechanic as `LimitMatch` | — | Score | Pairs f with f′ graphs |

Every explorer exports `export const strings = { … }` (Bi) at top of its file.
Arabic strings for topic names use the existing Arabic lesson titles in `academyData.ts` where they exist.

---

## 8. Work packages

Dependency order: **WP0 → WP1 → (WP2, WP3, WP4, WP5, WP6, WP7 in parallel) → WP8 → WP9**.
Each package: *owns* (files it may create/edit), *depends*, *steps*, *done when*.

### WP0 · Data & progress
- **Owns:** `src/courses/courseGraph.ts`, `src/courses/progress.ts`, `src/courses/data/*`, `scripts/build-course-index.py`.
- **Steps:** write the script (§5.2) and run it; commit outputs; write `courseGraph.ts` (§5.1); write `progress.ts` (§5.3) incl. migration; add `topics.ar.json` (§5.4).
- **Done when:** a throwaway test page (not committed) prints `LESSONS` with 23 entries, each with ≥1 `questionIds` or an explicit empty array; `useProgress` survives reload and two tabs; `npm run lint` passes; script prints a list of unassigned question ids (empty or explained).

### WP1 · Viz primitives & explorer scaffolding
- **Owns:** `src/courses/viz/**`, `src/courses/explorers/index.ts`, three empty `registry.*.ts`, `src/courses/explorers/Placeholder.tsx` (generic fallback: static diagram of lesson topics).
- **Done when:** a demo explorer (not committed) draws a draggable parabola with a slider using only the primitives; keyboard works; asymptote breaking works for `1/x`; RTL page shows plot unmirrored.

### WP2 · Map, switcher, continue strip
- **Owns:** `ContinueStrip.tsx`, `CourseSwitcher.tsx`, `CourseMap.tsx`, `MapNode.tsx`.
- **Depends:** WP0. **Done when:** §3.1–3.3 behaviours all work with fake progress set via `localStorage`; roving tabindex; phone timeline; RTL mirrors the timeline side; legend + reset.

### WP3 · Lesson panel & practice
- **Owns:** `LessonPanel.tsx`, `PracticeMini.tsx`, `src/courses/katex.ts` (lazy loader).
- **Depends:** WP0, WP1. **Done when:** §3.4; panel opens with the Placeholder explorer for any lesson; PracticeMini scores correctly against `correctIndex`, shows `optionFeedback`, persists via `progress.answer`; focus trap + Esc; bottom sheet on phone.

### WP4 / WP5 / WP6 · Explorers
- **Own:** `explorers/pre/**` + `registry.pre.ts`; `explorers/calcA/**` + `registry.calcA.ts`; `explorers/calcB/**` + `registry.calcB.ts`.
- **Depend:** WP1. **Done when:** every row in §7.3 for the package exists and meets the per-explorer acceptance list (§7.2); each registered in its registry; screenshots at 360 and 1440 attached in the PR description.

### WP7 · GMAT grid
- **Owns:** `GmatGrid.tsx`, `src/courses/gmatTopics.ts`.
- **Depends:** WP0. **Done when:** 24 + 14 tiles with real titles, filters and search, status dots, opens via `launchWorkspace`, marks `gmat[slug].opened`.

### WP8 · Integration
- **Owns (the only package allowed to):** `src/courses/CoursesExperience.tsx`, edits to `ResourceLibrary.tsx`, `VisualMathShowcase.tsx`, `TeachingApp.tsx`.
- **Steps:** mount `CoursesExperience` at the top of `ResourceLibrary`'s `courses` tab; Map|List toggle keeping the old grid; wire `marwan:open-academy` so search results open the LessonPanel when the URL matches a lesson (fall back to iframe); add "Used in" chips to the 5 models (§3.5); URL params; history handling.
- **Done when:** nothing previously working is lost (iframe workspace, sampler, media tab, search → lesson, `/games` unaffected); `?legacy=1` shows the old UI.

### WP9 · QA, accessibility, i18n, performance
- **Owns:** `docs/courses-qa.md`, a Playwright script `scripts/qa-courses.cjs`.
- **Checks:** §9. Fix defects in place (small), report big ones.

---

## 9. Global acceptance checklist (WP9 runs all)

1. 360×800, 768×1024, 1440×900; LTR and RTL; light, "Chalkboard Dark", "High Contrast" themes: no overflow, no clipped text, contrast ≥ 4.5:1 (body) / 3:1 (graphics).
2. Keyboard only: tab to switcher → map nodes (arrow keys) → open panel → operate explorer → quick practice → close with Esc; focus returns to the node.
3. Screen reader: node names read "Lesson 2.4, The Chain Rule, started 40 percent"; explorer readouts announce at most 4×/s.
4. `prefers-reduced-motion`: no pulse, no auto-animation, panel opens without slide.
5. Progress: answer a question → reload → map reflects it; second tab updates live; `Reset progress` clears; private-mode (storage throws) does not crash.
6. Search → "chain rule" opens `/courses` with the panel for 2.4.
7. Lighthouse (mobile) Performance ≥ 85 on `/courses`; initial JS for `/courses` grows by ≤ 40 KB gz (explorers lazy).
8. Console clean; `npm run lint` and `npm run build` pass.
9. Deep links: `/courses?course=precalculus&lesson=grade-11-precalculus/2-6` opens the right panel on cold load.

---

## 10. Decisions & risks

- **LaTeX rendering [DECISION NEEDED]:** questions contain `$…$` LaTeX. Recommended: add npm `katex` (MIT), lazy-loaded in `katex.ts`, CSS imported only in the panel chunk. Alternative: render raw text (ugly). Do not vendor the clone's KaTeX fonts.
- **Question ↔ lesson mapping:** prefix map covers ~87 of 162; the rest depend on scanning lesson HTML (§5.2). Unassigned questions are simply not shown in PracticeMini.
- **Source content:** `public/academy/**` is a copy of another site's lessons. Do not modify it; only link to it. Whether it may be published is the owner's call.
- **Scope creep guard:** no accounts, no server, no analytics, no new routes. Progress is local only.
- **Arabic quality:** machine-drafted Arabic must be reviewed by the owner before launch; keep strings in one place per file to ease review.

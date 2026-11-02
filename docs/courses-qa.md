# /courses QA (plan WP9)

Run before merging anything that touches `src/courses/**`.

## Automated

```bash
npm run lint && npm run build      # types + production build
npm run dev &
BASE_URL=http://127.0.0.1:3000 node scripts/qa-courses.cjs   # needs Playwright, see the script header
```

The script sweeps 360×800, 768×1024 and 1440×900 in English and Arabic and checks:
no console errors, no horizontal overflow, arrow-key movement between nodes,
panel open/close with focus return, progress surviving a reload. Screenshots go
to `qa/` (git-ignored).

## Manual checklist

1. **Map, desktop.** Chapter lanes scroll sideways inside their own rail; the
   page itself never scrolls sideways. Progress ring fills, `done` turns blue,
   `confident` turns amber with a tick.
2. **Map, phone.** Lanes become a vertical timeline; each row is ≥ 72 px tall and
   tappable; the rail is on the inline-start side in both directions.
3. **Keyboard only.** Tab reaches the switcher, one stop per map; arrows walk the
   nodes; Enter opens the panel; Tab cycles inside the panel; `Esc` closes and
   focus returns to the same node.
4. **Panel.** Explorer loads lazily (a "Loading explorer…" line, then the plot),
   sliders and drag handles work with the mouse and the arrow keys, the readout
   updates, quick practice scores and stores answers, confidence chips toggle.
5. **Theming.** All 8 appearance themes including Chalkboard Dark: plot lines,
   axis ink and node fills stay legible; nothing hard-coded white-on-white.
6. **RTL.** Switch to Arabic: chrome mirrors, the plots do **not** (they are
   wrapped in `dir="ltr"`), numbers stay Latin.
7. **Reduced motion.** With `prefers-reduced-motion: reduce`: no node pulse, the
   panel opens without sliding, nothing auto-plays.
8. **Private mode.** With storage blocked the page still works; progress simply
   is not remembered.
9. **Deep links.** `/courses?course=precalculus&lesson=grade-11-precalculus/2-6`
   opens that panel on a cold load; Back closes it.
10. **Regressions.** `/games` and the home page are untouched; search → a lesson
    opens the panel; search → the GMAT hub still opens the iframe; `?legacy=1`
    shows the old grid.

## Authored-course checks

Algebra 1 (19 lessons), Algebra 2 (15) and Geometry (16) have no static page, so
their checks are data-level plus the panel checks above:

1. `npm run qa:data` — 50 lessons × 3 questions, one lab per lesson, no orphans.
2. Open any of their lessons: the panel shows the lab, three questions, prev/next
   and the “Guided here — no separate page” note instead of “Open full lesson”.
3. Search for “Pythagoras” or “vertex”: the result opens the panel (not an
   iframe), switching the course switcher to the right course.
4. Mixed practice under the map draws four questions from four different courses.
5. Chapter headers show a progress bar and `done/total` counts.

## GMAT checks

1. `course=gmat` shows 38 tiles, each with a code, a rule line and a lab badge.
2. Opening a tile opens the panel: lab, two key ideas, “practice lives inside the
   full lesson”, then **Open full lesson** loads the iframe.
3. The “Page ▸” link on a tile skips the panel and opens the iframe directly.
4. Arabic: tiles show the Arabic title, search matches both languages.
5. `npm run qa:data` confirms 2 questions for each of the 38 topics, each with
   four options (five for Data Sufficiency), an in-range answer, a hint and an
   explanation; mixed practice now draws GMAT questions too.

## Labs gallery

1. Switch the view to **Labs**: every lesson in the current course that has a lab
   appears once, grouped by chapter, with its code and first topic.
2. The header reads `n/n — all lessons have a lab` for Algebra 1, Algebra 2,
   Geometry and GMAT.
3. Clicking a card opens the same lesson panel as the map node.
4. The choice of view survives a reload (`localStorage['marwan:courses:view']`).

## Practice

1. **Mixed** (default): four questions from four different courses; the lessons
   already opened are sampled first.
2. **My mistakes**: a queue of every question answered wrong, with the count on
   the tab. Answering correctly clears it; the card says so when the queue is
   empty.
3. The study snapshot above the map reports lessons opened, labs used, accuracy,
   and a **Review them** button that switches the practice card to the queue.

## Bilingual

`npm run qa:data` checks all 222 `en`/`ar` pairs in the authored courses and the
GMAT content: an empty Arabic string, or Arabic left as English, fails the
script. It also counts `en`/`ar` fields in **every** file under `src/courses`
(1201 pairs, `title` counted as the English side for the generated topic list),
so a string added without its translation fails even when it is not one of the
hand-written course files. Arabic that keeps a long English word (three letters or more) is reported too —
that is usually a half-finished translation. Maths notation is allowed:
`GMAT`, `SSS`/`SAS`/`ASA`, `log`, `sin`, `mod`, … (`ARABIC_ALLOWED_LATIN` in the
script). UI strings outside `src/courses` are not covered.

## Status

- `npm run lint`, `npm run build`, `npm run qa:data`, `npm run qa:progress`,
  `npm run qa:practice`, `npm run qa:search`, `npm run qa:theme` and
  `npm run qa:render`: passing. The last one renders all 111 labs and the course map server-side, so a
  lab that throws — or draws outside its plot — is caught without a browser.
- Every explorer chunk is 1.3–2.3 KB gzip (budget was 15 KB).
- **Not yet run:** `scripts/qa-courses.cjs` — no browser is available in the build
  environment, so the visual and keyboard checks above still need a human or a CI
  run before release.

### Geometry checks (`npm run qa:render`)

The labs are hand-written SVG, so a wrong scale does not throw — it draws
somewhere you cannot see. Alongside the crash check, every lab is now read for:

- **NaN** in an attribute (a coordinate that could not be computed);
- a coordinate beyond 1500 px (the unit circle that came out 8750 px wide);
- a shape **entirely outside** its viewBox (a dot plotted at y = 250 in a 125 px
  box — invisible);
- a label whose anchor falls outside the viewBox (clipped text).

Partly-clipped lines are allowed: guide lines run off the edge on purpose. The
helpers live in `scripts/plot-bounds.cjs` and have their own cases in the test
notes below.

Only each lab's **default state** is rendered, so a broken tab or mode is not
caught automatically — check those by hand (the AngleLab transversal mode was
found that way).

### Focus and the answer options

Three things that are easy to get wrong without a browser, so they are stated as
rules and guarded where a static render can see them:

- **Answer options are one radio group, not four tab stops.** `AnswerChoices.tsx`
  is shared by the panel's quick practice and the mixed card: one option is in
  the tab order (the chosen one, or the first), ↑/↓ and ←/→ walk the options and
  select as they go, Home/End jump to the ends. Once the question is checked the
  group is frozen and out of the tab order, and the Check/Next button carries on.
  `qa:render` renders the group in three states and fails unless exactly one
  option is a tab stop, that it is the right one, that a checked group has none,
  and that the options read A–D.
- **Closing the panel gives the keyboard back.** Focus returns to whatever opened
  the panel — a map node, a search result, a "practise this course" button. If
  that element is gone, it falls back to `#course-map`, then `#lesson-search`;
  both ids are asserted by `qa:render`, because silently losing the fallback
  would put the focus ring back at the top of the page.
- **Stepping between lessons keeps focus in the panel.** Only a real close
  restores focus, not a move to the next or previous lesson.

### Screen readers

`Readout` shows every value immediately, but what a screen reader hears comes
from a hidden `aria-live="polite"` copy throttled to four updates a second, so
dragging a slider does not flood the announcement queue. Sliders are native
range inputs, so their own value announcements are unchanged.

```
node -e "const {offPlot}=require('./scripts/plot-bounds.cjs');
  console.log(offPlot('<svg viewBox=\"0 0 400 125\"><circle cx=\"200\" cy=\"250\" r=\"6\"/></svg>'));"
```

### Progress store (`npm run qa:progress`)

`src/courses/progress.ts` drives every ring on the map, so it is checked in six
fresh Node processes (the store reads `localStorage` once at import, so a new
process is what a reload looks like):

| scenario | what it proves |
| --- | --- |
| `basic` | open 20 → lab 20 → 20 per right answer → 100; wrong answers earn nothing; mastery outranks “done”; reset clears lessons and the GMAT ring and writes the empty state |
| `blocked` | a browser that throws on storage (private mode) still tracks the session |
| `seeded` | a reload lands on the same ring (opened + lab + one right answer) |
| `legacy-seeded` | old sampler mastery migrates onto its lesson, legacy key untouched |
| `corrupt` | an unreadable payload starts clean and then records normally |
| `second-tab` | a `storage` event replaces the state, unrelated keys are ignored, unsubscribe stops it |

### Accessibility of the rendered markup (`npm run qa:render`)

`scripts/a11y-dom.cjs` audits the HTML that `qa:render` already produces — all
111 labs, the map and every gallery — for the mistakes a screenshot cannot show:

- a `<button>` or `<a>` with no accessible name (text, `aria-label`,
  `aria-labelledby` or `title`);
- an `<input>` with no label — `id` + `for`, a wrapping `<label>`,
  `aria-label` or `aria-labelledby`;
- an `svg role="img"` with no label;
- `role="slider"` with no `aria-valuenow` or no name;
- a duplicate `id` in one render (this broke the second `<label for>` of a lab
  with two sliders called “a”, “b” or “x” — the label focused the wrong input);
- `aria-describedby` / `aria-labelledby` pointing at an id that is not in the
  render. (`aria-controls` may name a popup that only exists once opened.)
- a heading outline that skips a level: chapters and GMAT groups used to be
  `h4` straight after the section's `h2`, so they are `h3` now.

The helpers have their own cases (13 of them) so the audit itself is known to
fire.

### Appearance themes (`npm run qa:theme`)

Every course colour is a `--t-*` token, and there are nine appearances (paper,
soft, dark, blue, rose, lavender, mint, contrast, chalkboard). A token that
reads fine on paper can disappear on the chalkboard, so the script parses
`src/index.css` and computes WCAG contrast for each theme:

| pair | minimum |
| --- | --- |
| `--t-ink` on `--t-bg` / `--t-bg-2` | 4.5:1 |
| `--t-accent-deep` on `--t-bg` / `--t-bg-2` | 4.5:1 |
| `--t-on-accent` / `--t-on-sky` / `--t-on-sun` on their fill | 4.5:1 |
| `--t-ok` and `--t-danger` on the page and on a card | 4.5:1 |
| `--t-accent` on `--t-bg` (progress ring, focus outline) | 3:1 |

It also fails any raw hex colour in `src/courses` (105 files), so a component
cannot quietly hard-code paper-and-coral.

What it found and the fixes: white text sat on `--t-accent` at 3.62:1 (paper) and
3.76:1 on `--t-sky`, so each theme now names its own `--t-on-accent` /
`--t-on-sky` / `--t-on-sun`; the "correct" green was 4.0:1, so the status colours
became `--t-ok` / `--t-danger` with dark-theme variants; `--t-accent-deep` links
were 4.31:1 on a card, so three themes were deepened; the high-contrast theme's
sunflower was 1.43:1 on white, so it is now amber.

A sunflower fill on cream is still only 1.7:1, which is why every filled mark
(map node, legend swatch, badge) also carries an ink edge — the ink pairs above
hold that edge to 4.5:1.

### Bundle budget (`npm run qa:bundle`)

The plan asks that the courses work add no more than 40 KB gzip and keep
Lighthouse at 85 or better. Lighthouse needs a browser, so the part that can be
measured here is measured: `scripts/check-bundle.cjs` builds if `dist/` is stale,
then reads the real output.

| what | measured |
| --- | --- |
| first paint (`index.html` + its static imports) | **248 KB gzip** — one 225 KB script, one 23 KB stylesheet |
| largest lazy chunk | 57.7 KB gzip — the Supabase client, only fetched when a live room opens |
| largest lab chunk | 10.2 KB gzip (authored question bank); every lab is 1–3 KB |
| all JavaScript, if a visitor opened everything | 400 KB gzip |

The script fails on three things:

- **growth** — first paint more than 40 KB above the committed baseline
  (`scripts/bundle-budget.json`) has to be a deliberate re-baseline;
- **a lab or data file becoming eager** — it follows the *static* import graph
  from `index.html`, and fails if the Supabase client or a question bank shows up
  there, or if a registry entry stops being `() => import(...)`. A rewrite to
  `import Lab from './Lab'` would fold that one lab into the first paint, which
  the coarse byte budget alone would not notice;
- **a lazy chunk over 15 KB gzip** — the ceiling the plan set for a lab.

Each of the three was proved by breaking it: a registry entry rewritten as a
constant import fails the check, a fake "must stay lazy" marker fails it, and a
lowered baseline fails on growth.

**What is still worth doing (not done, needs a browser to judge).** All three
pages are defined in `src/TeachingApp.tsx` and imported statically, so `/courses`
downloads the home page and the games page with it. Measured by building with one
page at a time: courses alone is 216.4 KB gzip, games alone 192.8 KB, the current
all-in shell 248 KB. Splitting the three pages behind `lazy()` would cut about
32 KB gzip from the first visit to `/courses`, at the cost of one extra request
before the home page paints. That is a routing change rather than a courses
change, so it is left as a decision rather than done quietly.

### Search (`npm run qa:search`)

The map's search box is the only way to reach a lesson whose lane you cannot
find, so its ranking is pinned down against the real graph: a lesson number
finds that lesson (codes repeat across courses, so the promise is “first, and
only code matches lead”), a title word and a full title both find it, Arabic
matches the Arabic title with alef variants and diacritics folded, Arabic-Indic
digits work, one-letter queries return nothing, and the list is capped without
repeats.

### Practice queue (`npm run qa:practice`)

`pickPracticeQuestions` (in `src/courses/practiceQueue.ts`) decides what the
practice card shows, and its promises break quietly — a set that drifts to one
course, a review queue holding a question the bank no longer has, a “New set”
button that redraws the same four. The logic is pure, so the script bundles it
with esbuild and runs it against the real lesson graph (388 questions, 111
lessons):

- mixed: four questions, four different courses, four different lessons;
- mixed with opened lessons: stays inside them;
- the per-course filter (`Practise this course` on the map) narrows both modes;
- review: empty with no misses, capped at four, dedupes, ignores right answers,
  unknown lessons and ids the bank dropped;
- a new round changes the lead question; an empty bank returns an empty set.

### Manual checks for the map

- **Practise this course** (above the map legend) filters the practice card to
  that course and scrolls to it; the chip beside the card title clears it.
- The search box opens the panel from the keyboard: ↑/↓ move, Enter opens, Esc
  clears.

### URL contract (`npm run qa:render`)

Three cold loads are rendered too, because these are promises to links from
other pages:

- `?course=geometry&lesson=geometry/2-2` opens the map **and** that panel — the
  check looks for the modal dialog and its confidence row, because the map lists
  every lesson title anyway and a title match alone proves nothing;
- `?course=gmat&lesson=gmat/absolute-value` does the same for a GMAT topic;
- `?legacy=1` renders the old lesson grid instead of the map;
- each of the six courses opens its own first lesson's panel with its lab.

### Plot maths

`MathPlot` is 400 px wide and its height follows `aspect`, so nothing in a lab
may assume a canvas size. Ticks and labels go through `Label`, shapes through
`Segment` / `Point` / `Circle` / `Region`, all in **data coordinates**; the
built-in axes can be switched off with `axes={false}` for plots that draw their
own (number lines). `Point` keeps its label inside the box and flips it to the
left when there is no room on the right.

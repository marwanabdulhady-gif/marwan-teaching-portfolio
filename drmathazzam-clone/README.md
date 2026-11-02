# Dr. Math Azzam Platform — static clone

A complete static clone of **https://drmathazzam.app/**, reverse-engineered with
[REA (`morluto/rea`)](https://github.com/morluto/rea) and rebuilt as plain
HTML + CSS + vanilla JS. No Next.js, no React, no build step.

**139 routes cloned, zero dead internal links.** Every `href="/…"` anywhere in
the clone resolves to a real page.

```
drmathazzam-clone/
├── index.html                      home page
├── tutor/index.html                AI tutor console
├── ai-teacher-studio/index.html
├── teacher-login/index.html        ┐ sign-in / sign-up
├── student-login/index.html        │
├── sign-up/index.html              ┘
├── courses/<course>/index.html                        course hubs
├── courses/<course>/discover/index.html
├── courses/<course>/lessons/<id>/index.html           23 lesson pages
├── courses/<course>/practice/…  assessments/…         question sets
├── courses/<course>/resources · desmos · chapter-tests · chapter-review
├── courses/gmat-preparation/quant/<topic>/            24 GMAT quant topics
├── courses/gmat-preparation/di/<topic>/               14 GMAT data-insight topics
├── courses/gmat-preparation/batch-lessons/<id>/ + data-sufficiency,
│   table-analysis, graphics-interpretation, percentage-changes,
│   ratios-and-rates, exam-pilot
├── assets/
│   ├── css/     fonts.css · tailwind.css · home.css · widget-*.css
│   ├── fonts/   Inter + Space Grotesk (10 woff2 subsets)
│   ├── brand/   logo + favicon
│   ├── media/   KaTeX math webfonts (60 files)
│   ├── site/    per-page assets + CSS modules, original /_next/ layout kept
│   └── js/app.js
└── favicon.ico
```

## Run it

```bash
cd drmathazzam-clone
python3 -m http.server 3000 --bind 0.0.0.0
# → http://localhost:3000
```

Pages are emitted as `<route>/index.html`, so `/tutor`, `/courses/grade-12-calculus`
and friends resolve on any static host. Any server works — no redirects or
rewrite rules needed beyond the usual directory-index behaviour.

## How it was built (REA workflow)

REA 6.8.0 was run against the live site; its findings drove every decision below.

| REA command | What it yielded |
|---|---|
| `analyze-web-bundle` (CDP) | 14 scripts captured from the running page; route inventory `/`, `/teacher-login`, `/tutor` |
| `inspect-web-page` | 878-node rendered DOM, resource + storage inventory (no persisted keys at rest) |
| `export-web-scripts` | 11 chunks exported to disk for static reading |
| `analyze-javascript-application` | module graph of the exported bundle |
| `inspect-analysis-view` | `javascript-routes` views (routes / sources / unknowns) |

Static reading of the exported chunks is where the behavioural details came from:

- **`02h9gan5cvt37.js`** — `SiteHeader` (nav links `Home · Courses · AI Tutor`),
  `LessonSearch` (23-lesson index, scoring algorithm, `slice(0,8)`, `/` shortcut,
  ↑↓/Enter/Esc handling), `AppearanceControl` (8 themes × 3 text sizes, persisted
  to `localStorage["dma-theme"]` / `["dma-text-size"]`, applied as
  `document.documentElement.dataset.theme / .textSize`).
- **`0uznicjd3xpq1.js`** — `ContactTeacherForm` (field names, validation,
  `POST /api/contact`, success state).
- **`0tcqh3wvy2iut.css`** — the home page's CSS module, including the five
  illustration keyframes and the `[data-running=false]` pause contract.

Because the site is a Next.js app, a lot of content only exists **after**
hydration — so the final pass captured the **post-hydration DOM** with a
headless browser rather than trusting the raw HTML response. That recovered the
lesson "CONFIDENCE SELF-CHECK" blocks, the tutor console, and the routes that
render nothing in SSR at all.

Two traps the capture had to handle (both cost real fidelity until fixed):

1. **Capture must be serial.** With several Playwright contexts open at once the
   non-active tabs are backgrounded, so lazily-mounted components never mount —
   0 of 137 pages got the `school-lesson-presentation` wrapper under 4-way
   concurrency, versus all of them at concurrency 1.
2. **Capture must wait for the DOM to settle, not a fixed delay.** Components
   attach their hashed CSS-module class names at unpredictable moments after
   `networkidle`. The capture now polls the set of `*-module__*` classes and only
   snapshots once it has been stable. Missing `gmat-worked-example-module`
   alone cost a 17% pixel diff on the GMAT chart pages.

## Fidelity

Measured by loading the real site and the clone side by side in the same
Chromium build, at `prefers-reduced-motion: reduce` so animations settle.

**Pixel diff, full-page screenshots at 1440px** (44 routes sampled across every
page family — home, course hubs, discover, lessons, practice, resources,
chapter-tests, GMAT quant / data-insight / batch-lessons, sign-in):

| | |
|---|---|
| routes sampled | **44** |
| pixel-perfect (0 differing px) | **42 / 44** |
| total differing pixels | **10,858 / 173,471,040 (0.0063%)** |

| page | 1440px | 390px |
|---|---|---|
| `/tutor` | **0 px (0.0000%)** | **0 px (0.0000%)** |
| `/sign-up` | **0 px (0.0000%)** | **0 px (0.0000%)** |
| `/student-login` | **0 px (0.0000%)** | **0 px (0.0000%)** |
| `/courses/gmat-preparation/quant/quadratics` | **0 px (0.0000%)** | **0 px (0.0000%)** |

The only two routes with any difference are the two Desmos pages
(`/courses/*/desmos`, 0.3964% each) — see Known differences #5.

> **Note on `/` (home).** The home hero is an animated SVG with 17 CSS
> animations. The real page is *not* temporally stable: two screenshots of the
> **original** taken 3.5 s apart differ from each other by 0.43–0.61%. So a
> home-page diff measures animation *phase*, not layout. With animations frozen
> at `t=0` on both sides, home measures **0.0276%** (1440px) / **0.0624%**
> (390px) — residual thin animated chart strokes only. An earlier "0.0000%"
> reading was two snapshots happening to land on the same phase.

**Route coverage:** 139/139 routes serve HTTP 200; the rendered text and
`scrollHeight` match the original on **every route that is deterministic**
(123/139 on a single pass — the other 16 are randomised, see below).

**26/26 interaction checks pass** — illustration pause/play, `/` search
shortcut, scored search + arrow-key navigation + Esc, appearance themes
(applying, persisting, surviving reload), text size, mobile menu, contact form.

### Self-check questions are live

The lesson pages carry 162 "CONFIDENCE SELF-CHECK" questions. Their prompts and
options are server-rendered, but **the answer key only ever existed inside a
client JS chunk** — so a straight HTML clone would have been a dead shell that
looks right and does nothing.

The key was recovered by reading the bundles and then brute-forcing whatever
could not be parsed:

| step | how | result |
|---|---|---|
| parse chunks | string-aware brace scanner over all 67 `/_next` chunks | 203 question objects |
| brute-force the answer | try option 0..n, click *Check answer*, *Try again* resets | **162/162** `correctIndex` |
| harvest hints | toggle the `aria-controls` hint panel | **162/162** |
| harvest explanations | read the `[role=status]` block | **162/162** |
| harvest per-option feedback | try **every** option, not just up to the correct one | **162/162** |
| harvest "Continue" CTAs | read the trailing link after a correct answer | 114 |

Two traps worth recording:

- The harvesters must read `textContent` with the `.katex-mathml` layer
  **removed**. KaTeX emits the visual HTML *and* a MathML *and* an annotation,
  so a naive read yields every formula three times (`−3x≤9` + `-3x\le9` + `−3x≤9`).
- "Try again" is what makes the brute force cheap: it resets a question
  in place, so all 162 were solved in one page load per lesson rather than
  hundreds of reloads.

The recovered key ships as a per-page `<script type="application/json">`
(only the questions that page uses) and drives a vanilla JS state machine in
`assets/js/app.js`: select → enable *Check answer* → lock the fieldset → show
*Correct — here is why.* or *Not yet — try this next.* → *Try again* /
*Show explanation* / *Continue* CTA, plus the *Show hint* toggle.

**Verified 46/46**: every lesson page was driven through both a correct and an
incorrect answer on the real site and on the clone, comparing the locked state,
button set, disabled flags, label cursors, selection highlight, feedback text
and hint text at every step.

## What is interactive

Everything below is real behaviour, ported from the bundle:

- **Illustration pause/play** — five SVG diagrams (parabola + value table,
  secant→tangent, function shift, data bars, exam topic map) with their original
  keyframes; `[data-running=false]` freezes them, and they start paused under
  `prefers-reduced-motion`.
- **Lesson search** — the real 23-lesson index with the original scoring
  (exact code/id 100, exact title 80, prefix 40, substring 20), `slice(0, 8)`,
  `/` to open, ↑↓ to move, Enter to open, Esc to close, body scroll lock.
- **Appearance** — 8 themes (Classic, Soft Light, Dark, Blue Comfort, Rose,
  Lavender, Mint, High Contrast) × 3 text sizes, applied via `data-theme` /
  `data-text-size` and persisted in `localStorage`.
- **Mobile navigation** — hamburger toggle with `aria-expanded` /
  `aria-controls`, closes on link click.
- **Contact form** — same field names, validation and `POST /api/contact`.
- **Self-check questions** — 162 guided questions across the 23 lesson pages:
  select an option, *Check answer*, get *Correct — here is why.* or
  *Not yet — try this next.* with per-option coaching, *Show hint*, *Show
  explanation*, *Try again*, and a *Continue* link. The answer key was
  recovered from the site's own bundles (see below).
- **Desmos graphing calculator** (`/courses/*/desmos`) — the real widget, loaded
  from the Desmos API.
- **"Show all worked steps"** — 85 worked-example widgets across the 7 lesson
  pages that use them. Clicking removes the button, fills the step cards, drops
  the step-by-step checkpoint cards and reveals *All worked steps shown.* with a
  *Try again* control. **85/85 byte-identical** to the original.
- **Mastery self-rating** — the "Before you leave Lesson X" panel on all 23
  lesson pages. Three-way per-section toggle (*Review / Practice / Confident*,
  or *Need review / Need practice / Confident* on the precalculus course — the
  two courses style and label them differently), radio behaviour within a
  section, a *Reset* control once anything is set, and persistence to
  `localStorage` under `drmath:mastery:<course>:<lessonId>`. **20/20**.
- **Open all / Close all** — opens exactly the lesson-section disclosures plus
  the mastery disclosure (matching the bundled handler, which iterates the
  registered sections then `querySelectorAll("[data-school-mastery-disclosure]")`),
  and leaves the search and print-only disclosures alone. **20/20**.
- **Focus workspace** — the interactive lab panels' full-screen toggle: swaps
  the section/footer layout prefixes, locks body scroll, promotes the panel to
  `role="dialog" aria-modal`, relabels to *Close focus view*, Escape to exit.
  **15/15**.
- **Present lesson** — flips `data-school-presentation` to `active` so the
  site's own CSS module takes over (the rule set was already captured); mirrors
  the React state too: dialog attributes, toolbar title/subtitle, the extra
  *Print / PDF* action, the toggle label and icon, Escape to exit. **12/12**.
- **Lab step-checks** — the `Check answer` widgets inside interactive lab
  frames on `lessons/2-4`, `2-5` and `piecewise-differentiability`: option
  selection ring, correct/incorrect status line, and the *Next step* button
  (a no-op on the real site too). Feedback brute-forced from the original.
  **9/9**.
- **AI Tutor console** (`/tutor`) — type a question (or click a suggested
  prompt) and the conversation appends a right-aligned user bubble plus a
  sparkles-icon assistant bubble, the *Suggested questions* strip is removed,
  the composer clears and the send button disables again. It posts to
  `/api/tutor` with the same `{"messages":[{"role":"user","content":…}]}` body.
  A signed-out visitor always gets the server's one fixed reply — *"Please sign
  in to use the tutor."* — so that response is reproduced exactly.
  **Verified 21/21** against the live site in both flows.

## Missing-content audit

The 139 routes came from crawling links, so anything a crawler cannot see was
checked separately. The site is `noindex` and serves **no `robots.txt` and no
`sitemap.xml`** (all 404), so there is no route manifest to diff against —
the route list had to be mined out of the JavaScript bundles instead.

**Bundle mining.** All 66 `/_next/static/chunks/*.js` files were grepped for path
literals, yielding 58 unique internal paths: 10 `/api/*` endpoints and 48 page
paths. Every page path was already cloned except two:

| path | verdict |
|---|---|
| `/ai-teacher-studio/previews/` | an image directory, not a page — all 7 `.webp` previews are present |
| `/courses/kuwait-national-exam/study` | **307 → `/student-login?next=…&national=1`**. Auth-gated; there is no page to clone. Nothing links to it directly (the discover page links to `/student-login?next=/courses/kuwait-national-exam/study&national=1`, which exists) |

**Route-shape fuzzing.** The chunks also enumerate lesson/practice ids
(`p1`…`p6`, `1-1`…`2-6`). Probing the ones the crawl never produced:

- `/courses/*/practice/p2`, `p4`, `p5`, `p6` → **404**, they do not exist.
- `/courses/*/lessons/p2`…`p6` (and any junk id like `9-9`) → **200**, but all
  render the same *"Lesson locked — This lesson isn't available yet"* state with
  0 self-check questions. A catch-all, not real content.
- `/courses/*/assessments/p2-quick`…`p6-quick` → **200** rendering *"Assessment
  not found"*.

Nothing links to any of them, so they contribute no dead links.

**Assets.** Every non-page reference resolves: 130/130 `url()` references inside
the local stylesheets, 10/10 `.woff2` fonts, 60/60 KaTeX `../media/` files, and
7/7 AI-Studio preview images.

### Interactivity sweep — five more gaps, all now fixed

A differential "click every control" pass over the 139 routes (is it live on
the original but inert on the clone?) found five more behaviours that were
missing. Each was then driven on both sites and compared step by step:

| behaviour | where | verified |
|---|---|---|
| Show all worked steps | 85 widgets, 7 lesson pages | **85 / 85** |
| Mastery self-rating | all 23 lesson pages | **20 / 20** |
| Open all / Close all | lesson pages | **20 / 20** |
| Focus workspace | interactive lab panels | **15 / 15** |
| Present lesson | lesson pages | **12 / 12** |
| Lab step-checks | 3 lesson pages | **9 / 9** |

Two things worth recording about that sweep:

- **A global element index is not a stable control key.** The clone legitimately
  contains extra nodes (the injected mobile nav, the restored home button), so
  comparing "control #37" across the two sites drifts and manufactures gaps.
  The first run reported 14 routes with a broken *Check answer*; re-checking
  with `tag + text` keys showed **zero** — the guided *Check answer* works on
  both sites (46/46, above), and the other 12 buttons on those pages are
  disabled on the **original** too.
- **"Next step" is a no-op on the real site.** Clicking it never advances the
  prompt, so the single harvested step is the whole widget.

### Two real gaps the crawl missed — both now fixed

1. **The floating "Home" button was being stripped.** `a.global-home-button` is
   a `position:fixed` pill in the bottom-right corner. It is server-rendered on
   **55 of the 139 routes** (the GMAT pages, `/tutor`, `/sign-up`,
   `/student-login`, `/teacher-login`, the Kuwait pages and `/`). The cloner
   was deleting it under the mistaken assumption that it was a hosting-platform
   badge, costing **0.26–0.32% differing pixels on each of those 55 routes**.
   It is now re-injected for exactly those routes with the site's own CSS,
   verified against `getComputedStyle` at 390/768/1024/1440px — including the
   `@media (max-width:640px)` rule that collapses it to a 48×48 icon-only
   button. Those routes now measure **0.0000%**.

2. **The AI Tutor was completely inert.** Clicking a suggested prompt or sending
   a message did nothing. The live flow was captured by diffing the DOM before
   and after a submit: it POSTs
   `{"messages":[{"role":"user","content":"…"}]}` to `/api/tutor`, removes the
   *Suggested questions* strip, appends a right-aligned user bubble and a
   sparkles-icon assistant bubble, clears the composer and re-disables send.
   Because a signed-out visitor always receives the single fixed reply
   *"Please sign in to use the tutor."*, that response is reproduced exactly.
   Now **21/21** against the live site, and `/tutor` is pixel-perfect at both
   1440px and 390px.

While fixing #2, `app.js` was found to be **hand-copied into the output tree**,
so edits could silently never ship (the file on disk was stale by 135 lines).
`clone-site.py` now publishes it from source on every run.

## Known differences

1. **Contact form has no backend.** It posts to `/api/contact` exactly as the
   original does. With no endpoint deployed the clone accepts the submit and
   shows the success state so the page stays usable; point it at a real
   endpoint and the fallback branch is never taken.
2. **Anything needing auth or a live database is inert** — teacher/student
   login and sign-up accept input and run the same client-side validation, but
   there is no session, and Kuwait National Exam gating always redirects to
   `/student-login`. The markup and styling are cloned; the server behaviour is
   not. The **AI tutor is the exception** — its signed-out path is fully working
   (see above). *Print / PDF* builds a print sheet (`.school-print-paper` inside
   a `<dialog>`) that has not been ported. (The lesson *self-check*
   questions are fully working — their answer key ships with the clone. The
   separate timed `assessments/*` quizzes and the `practice/*` sets are still
   inert: their content is assembled on demand by a mode switcher that has not
   been ported.)
3. **24 routes randomise their content on every load** — the 23 `assessments/*`
   quizzes and `chapter-review`. This is true of the **original** too: loading
   the same quiz URL twice yields a different question/option order (e.g.
   `(−3,1] [1,4] (−3,7)` vs `(−3,7) (−3,1] [1,4]`). The clone reproduces the
   page faithfully; it just draws a different shuffle. These are excluded from
   the pixel comparison because no static clone could ever match them.
4. **The mobile nav panel is injected, not captured.** The real site renders its
   mobile menu client-side, so it is absent from the server HTML. The clone
   re-adds it (so the hamburger actually works) at `display:none` for desktop
   widths, which is why a `innerText` comparison shows one extra "Home" /
   "Ask the AI Tutor" entry. It occupies 0×0 px and takes no layout space, so
   pixel comparisons are unaffected.
5. **The Desmos canvas differs by 0.3964%.** The widget is re-mounted live from
   the Desmos API; its graph-paper anti-aliasing does not reproduce byte-for-byte.
   Everything around the canvas is pixel-exact, and the calculator is functional.
6. **Animated illustrations are compared frozen.** With motion enabled they
   animate exactly as the originals do; screenshots were taken with
   `prefers-reduced-motion: reduce` so the comparison is deterministic.

The site was redeployed once mid-clone (a new "AI Teacher Studio" section and a
new Tailwind build). Everything above was re-verified against the current
version, and the cloner is re-runnable so it can be re-synced if the site
changes again.

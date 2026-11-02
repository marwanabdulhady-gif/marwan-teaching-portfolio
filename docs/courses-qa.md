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

## Labs gallery

1. Switch the view to **Labs**: every lesson in the current course that has a lab
   appears once, grouped by chapter, with its code and first topic.
2. The header reads `n/n — all lessons have a lab` for Algebra 1, Algebra 2,
   Geometry and GMAT.
3. Clicking a card opens the same lesson panel as the map node.
4. The choice of view survives a reload (`localStorage['marwan:courses:view']`).

## Status

- `npm run lint`, `npm run build`, `npm run qa:data` and `npm run qa:render`:
  passing. The last one renders all 73 labs and the course map server-side, so a
  lab that throws is caught without a browser.
- Every explorer chunk is 1.3–2.3 KB gzip (budget was 15 KB).
- **Not yet run:** `scripts/qa-courses.cjs` — no browser is available in the build
  environment, so the visual and keyboard checks above still need a human or a CI
  run before release.

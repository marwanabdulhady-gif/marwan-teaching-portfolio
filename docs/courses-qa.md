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

## Status

- `npm run lint` and `npm run build`: passing.
- Every explorer chunk is 1.3–2.3 KB gzip (budget was 15 KB).
- **Not yet run:** `scripts/qa-courses.cjs` — no browser is available in the build
  environment, so the visual and keyboard checks above still need a human or a CI
  run before release.

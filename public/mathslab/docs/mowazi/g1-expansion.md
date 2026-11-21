# Grade 1 expansion · ten lesson games on the Fikr template

**Status:** prototypes for review. Draft-aligned, **not** curriculum-approved and not classroom-tested.

Ten Grade 1 maths games, one per step of the draft `G01-MAT-01:10 — سلسلة الرياضيات (حزمة v1)` sequence
(Drive Doc `1twOsYEPEctWhkOdT5HF0WxSlIDkpAORw21NfQf8cHmo`, marked P2 / internal review).

They are built from **`fikr-lesson-game-template.html`**, the complete lesson-game template supplied for this
work: Rawi and Ghubar characters, the CUBES think-first path for word problems, bar models, pop-up dialogs,
the three-step hint ladder, first-try stars with the 90/70 % rule, the resume dialog, the message contract and
the `GAME_TEST` hooks. The engine is copied verbatim into `games/_fikr/engine/` and is **not modified** — only
the authored `GAME` object and a game-side picture library are added below it.

> An earlier revision of this branch built these games on the repo's older `fikr.js` kit instead of this
> template. That version has been removed rather than patched, because the two engines differ in the
> journey, the feedback model and the data contract.

## Scope and source ledger

| # | Game | Objective in the game | Draft source basis | Claim boundary |
|---|---|---|---|---|
| 1 | Counting Cove | Count objects to 20 with one-to-one matching | `G01-MAT-01:10` step 1 | Counting only; no writing numerals in words |
| 2 | Pearl Market | Compare two groups to 20: more, fewer, the same | step 2 | Comparison of counted groups, no inequality symbols |
| 3 | Oasis Addition Garden | Join two groups, add within 10 | step 3 | Sums within 10 only |
| 4 | Lantern Light-Out | Take away, subtract within 10 | step 4 | No missing-addend form |
| 5 | Coral Pattern Path | Find and extend a repeating pattern | step 5 | Repeating patterns only (not growing patterns) |
| 6 | Jeddah Tile Studio | Name 2-D shapes by sides and corners | step 6 | Triangle, square, rectangle, circle |
| 7 | Shell-Step Measure | Measure length with equal non-standard units | step 7 | Unit blocks only; no centimetres |
| 8 | Time in the Garden | Read o’clock and half past | step 8 | Analogue only; no digital clocks |
| 9 | Date-Shop Data Detectives | Sort votes and read a picture graph | step 9 | Three categories, one vote per symbol |
| 10 | Story Scout | Choose + or − for a one-step story, then solve | step 10 | One-step stories within 10 |

The ten `G01-U01-MAT-L01…L10` unit documents were **not** used as the mapping source, and neither was the
alternate `G01-U01-MATH-L02` document. If curriculum review decides the unit documents are canonical, this
table must be re-checked before any classroom claim.

## How the template is used

| Template rule | Where it is honoured |
|---|---|
| Journey: home → Learn → 3 levels → trophy | Native engine flow, unchanged |
| Learn recipe: hook → model → your turn (`wait:true`) → Ghubar’s mistake (`wait:true`) | Exactly four slides in every game |
| CUBES before every word problem | Level 2/3 story rounds carry `problem:{sentences, question, keys, extras}`, each with one or more cross-out sentences |
| 2–3 hints, strategy → step → near answer, never the answer | Every round; third hint stops one step short |
| `why(v)` per predictable mistake | Every choice option and keypad answer has a named misconception |
| `solution` shown by 👀 after two misses | Every round |
| Round types `choice` / `number` / `bars` | `bars` is used in Oasis Addition Garden level 2 |
| Never put the hidden answer inside the bar model | `UI.bars` is called without `reveal` in play; `answer` only when solved |
| Touch target from `GAME.band` | `band: 'k2'` → 72 px targets, read-aloud on by default |
| Saudi context, one skill per game | Corniche cove, pearl souq, oasis garden, old-town lanes, Red Sea reef, Jeddah tile studio, AlUbaid beach shells, garden clock, date shop, coral-stone wall |
| No external fonts/scripts/images, no `alert()` | The display font is embedded as base64 `@font-face`, every picture is inline SVG; verified by the QA harness (no console errors, no outside requests) |

## The visual layer (for six-year-olds)

The template ships with an adult parchment palette, a large empty stage and emoji-dependent chrome. Four
authored layers sit *on top of* the engine — the engine file itself is untouched — and the builder inlines all
of them into each output page:

| File | What it does |
|---|---|
| `games/_fikr/shared/theme.css` | Injected after the engine's own `<style>`, so it wins the cascade. Big rounded stage, 28 px cards, 72 px keypad targets, chunky options, speech-bubble coach, sky-and-sand ground, thumb-sized option art, `@media` rules for phones, `prefers-reduced-motion`. |
| `games/_fikr/shared/icons.js` | Roughly fifty authored 64×64 inline SVG icons plus an emoji→icon map, so a header button or level card cannot fall back to an empty box on a device without an emoji font. Also replaces emoji that appear inside coach lines, prompts and dialogs, and turns an A/B/C/D choice into four square tiles. |
| `games/_fikr/shared/hero.js` | Per-game hero art for the home screen (`G1HERO.for(id)`), and `G1THEME.start()` which reads `GAME.accent / accentDeep / skyA / skyB`, sets the theme colour and paints the hero. |
| `games/_fikr/shared/fonts/` | Fredoka variable woff2 (latin + latin-ext) with its SIL OFL licence, embedded as base64 by the builder — an offline page with a child-friendly face, no network request. |

Each `GAME` object therefore also carries `accent`, `accentDeep`, `skyA` and `skyB`, which is what gives the ten
games their own place (cove teal, souq rose, oasis green, lantern amber …) without a second stylesheet.

Four more things were added deliberately:

1. **A picture library** (`games/_fikr/shared/scenes.js`) so every object drawn is generated from the same
   number the question asks about. A caption can never say “4” over five objects, and no picture labels a
   count the child is supposed to work out (blocks are unnumbered, option captions are letters).
2. **A `suffix` that stays short** in the keypad display, because the template renders the unit inside the
   display box and long phrases wrapped badly on a tablet.
3. **Option captions that are letters, not counts** — an option that labels itself “7” would hand the answer to
   a child who is meant to count it.
4. **Ghubar is click-through** while he floats over the board, so a five-second pop-up can never swallow a tap
   meant for the keypad.

## Build, test, screenshots

```bash
node tools/build_fikr_games.js grade1     # engine + theme + fonts + icons + hero + GAME → games/grade1/<id>.html
node tools/fikr_games_qa.mjs grade1 --shots   # headless QA + screenshots
```

`tools/fikr_games_qa.mjs` drives each game with the template’s own `GAME_TEST` hooks: it walks all four Learn
slides (and checks the two `wait:true` slides stay locked), answers a round wrongly to prove the why-line path
fires, clears the CUBES ✂ step, then plays all 12 rounds through the three level dialogs to the trophy.

Current result: **10/10 clean** — 12 rounds, three level dialogs, four Learn slides with two gates, no console
errors, no requests outside the page, every game finishing at the trophy with at least one star per level.
The harness no longer injects an emoji font: the chrome is SVG, and the display font is embedded, so a capture
shows what a pupil sees.
Screenshots and raw results: `screenshots/grade1-fikr/` (home, Learn, level 1, level 2, finale per game).

The QA harness is a developer tool and not part of the shipped site: it needs `puppeteer-core`
(`PPTR=/path/to/puppeteer-core`) and a Chromium binary (`CHROME`, default `/tmp/chromium`). Neither is vendored.

## Remaining review before curriculum claims

1. Confirm whether `G01-MAT-01:10` or the `G01-U01-MAT-L01…L10` unit documents are the canonical Grade 1 scope.
2. Teacher/curriculum review of each objective, hint ladder and misconception line.
3. Arabic-first delivery: `GAME.lang:'ar'` flips the template to RTL with an Arabic voice, but these ten are
   authored in English; an Arabic pass is still to do.
4. Run the P0–P6 gates in [`lesson-authoring-scope.md`](lesson-authoring-scope.md) before describing these as
   Mowazi-aligned or classroom-ready.

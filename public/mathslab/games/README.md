# Lesson games — K to 12

Twenty-six lesson-game entries are available: the original sixteen Fikr prototypes plus a ten-game batch for Grades 1–10. The batch follows reviewed draft objectives for Grades 1–9; Grade 10 is explicitly a standalone supplemental prototype, not Mowazi-aligned.
Each teaches exactly one skill in a Saudi setting. Every game is a single self-contained HTML file
that runs with **no network at all**. Artwork is inline SVG; the ten new batch pages also embed a compact Noto Emoji font subset as a data URI for consistent offline icons.

Open `index.html` (this folder) to play, or open any file in `play/` on its own.

| grade | game | skill | file |
|---|---|---|---|
| K | Date Basket | counting objects 1:1 to 10 | `play/k-date-basket.html` |
| K | Oasis Pattern Path | notice and continue repeating patterns | `play/k-pattern-path.html` |
| 1 | Ten-Seat Dhow | make 10, then add within 20 | `play/g1-ten-seat-dhow.html` |
| 1 | Corniche Clock Tower | read time to the hour | `play/g1-corniche-clock.html` |
| 1 | Corniche Ruler | measure length in centimetres | `play/g1-corniche-ruler.html` |
| 2 | Date Packing | place value to 1,000 | `play/g2-date-packing.html` |
| 3 | Palm Grove Arrays | multiplication as rows × palms | `play/g3-palm-grove.html` |
| 4 | The Hidden Question | multi-step problems with bar models | `play/g4-hidden-question.html` |
| 5 | Kunafa Fractions | adding fractions with unlike denominators | `play/g5-kunafa-fractions.html` |
| 6 | Juice Bar Ratios | equivalent ratios and unit rate | `play/g6-juice-bar.html` |
| 7 | Red Sea Dive | adding and subtracting integers | `play/g7-red-sea-dive.html` |
| 8 | Graph Pilot | slope and linear functions | `play/g8-graph-pilot.html` |
| 9 | Falcon's Arc | quadratic functions in vertex form | `play/g9-falcons-arc.html` |
| 10 | Tower Trig | right-triangle trigonometry | `play/g10-tower-trig.html` |
| 11 | NEOM Growth | exponential growth and logarithms | `play/g11-neom-growth.html` |
| 12 | Haramain Rates | the derivative as a rate of change | `play/g12-haramain-rates.html` |

## New ten-game batch (Grades 1–10)

These are additional prototypes; they do not replace or silently relabel the original catalog games. Their lesson/source caveats and evidence status are documented in [`../docs/mowazi/ten-game-batch.md`](../docs/mowazi/ten-game-batch.md). Grade 10 is based on the local brief only and is not represented as Mowazi-aligned.

| grade | game | skill | file |
|---|---|---|---|
| 1 | Chime Match | full and half hours | `play/g1-chime-match.html` |
| 2 | Place-Value Port | place value to 1,000 | `play/g2-place-value-port.html` |
| 3 | Array Garden | equal groups and arrays | `play/g3-array-garden.html` |
| 4 | Times-as-Many Workshop | multiplicative comparison | `play/g4-times-as-many.html` |
| 5 | Decimal Shift Lab | decimal place value / powers of ten | `play/g5-decimal-shift.html` |
| 6 | Ratio Route | equivalent ratios and unit rates | `play/g6-ratio-route.html` |
| 7 | Number-Line Rescue | rational-number operations | `play/g7-number-line-rescue.html` |
| 8 | Line Builder | slope and intercept | `play/g8-line-builder.html` |
| 9 | Parabola Lab | quadratic functions | `play/g9-parabola-lab.html` |
| 10 | Angle of Approach | right-triangle trigonometry (supplemental) | `play/g10-angle-of-approach.html` |

## Grade 1 expansion — ten games on the Fikr template

A separate Grade 1 set of ten games lives in [`grade1/`](grade1/), one per step of the draft `G01-MAT-01:10`
sequence. It is built from the supplied `fikr-lesson-game-template.html` (Rawi and Ghubar, CUBES think-first,
bar models, hint ladder, three CRA levels), not from this folder's `fikr.js` kit, so it is kept in its own
directory with its own hub: open [`grade1/index.html`](grade1/index.html).

Build and test: `node tools/build_fikr_games.js` and `node tools/fikr_games_qa.mjs` (pass a grade such as
`grade1`, `grade2` or `grade3` to work on one set). Evidence boundary:
[`../docs/mowazi/g1-expansion.md`](../docs/mowazi/g1-expansion.md). Draft-aligned prototypes, not
curriculum-approved.

## Grade 2 expansion — ten games on the same template

[`grade2/`](grade2/) holds ten Grade 2 games on the same engine: place value to 1,000, expanded form, comparing,
regrouping (add and subtract within 100), skip counting, riyals and halalas, arrays, time to five minutes and
picture graphs with a key. Hub: [`grade2/index.html`](grade2/index.html). Evidence boundary:
[`../docs/mowazi/g2-expansion.md`](../docs/mowazi/g2-expansion.md).

## Grade 3 expansion — ten games on the same template

[`grade3/`](grade3/) holds ten Grade 3 games on the same engine: equal groups and multiplication facts, division
as equal sharing, arrays and turnaround facts, times tables, unit fractions, fractions on a number line,
equivalent fractions, area by unit squares, perimeter, and rounding to the nearest ten. Hub:
[`grade3/index.html`](grade3/index.html). Evidence boundary:
[`../docs/mowazi/g3-expansion.md`](../docs/mowazi/g3-expansion.md).

## Grade 4 expansion — ten games and the lesson frame

[`grade4/`](grade4/) holds ten Grade 4 games on the same engine: area-model multiplication, division with
partial quotients, hidden-question two-step problems, factor pairs and primes, comparing fractions with
unlike denominators, like-denominator sums, decimals to hundredths, measuring and classifying angles, place
value **to the millions**, and classifying quadrilaterals by property. Hub:
[`grade4/index.html`](grade4/index.html). Evidence boundary:
[`../docs/mowazi/g4-expansion.md`](../docs/mowazi/g4-expansion.md).

### The ten-section lesson frame — `_fikr/shared/lesson.js`

Every Grade 1–4 game now renders the نبع/موازي lesson frame beneath its play cards: the unit's Quranic verse
anchor and three-letter roots, the anti-overreach caution (*the verse frames value; it is not a description
of an algorithm*), five objectives, the three CRA levels reframed as stations with differentiation notes, the
seven-block time sequence, an exit card of four items أ–هـ with a success criterion, two screen-free homework
tasks, a reflection, and the **P2 status line**.

It is collapsed below the cards, so a child reaches the game immediately, but the P2 line sits above the
fold — the claim boundary is never something you have to expand to discover. Lesson entries live in
[`_fikr/shared/lessons.js`](_fikr/shared/lessons.js), keyed by game id and grouped by unit; a game with no
entry still renders the P2 line and its own objective, so the boundary is never silently dropped.

Why it matters: before this layer, all forty games were standards-aligned but methodology-silent. The audit
that found it, and the list of what is still open (the 9-subject-track layer, and one-game-per-lesson), is
[`../docs/mowazi/methodology-audit-g1-g4.md`](../docs/mowazi/methodology-audit-g1-g4.md).

## Anatomy of a game

Every game has the same ten parts, as the kit asks:

1. **A coach** who never gives the answer away (👩‍🍳 in Kunafa Fractions, 🦅 in Falcon's Arc…).
2. **How it works** — three steps, in words a pupil can act on.
3. **Learn** — four slides, each with its own picture; the last two are *your-turn* slides that stop the
   walk-through until the pupil answers, and the second one is written as a misconception to diagnose.
4. **Three levels** that climb the CRA ladder: level 1 concrete (drag, tap, slide), level 2 pictorial
   (read a picture or a graph), level 3 symbolic (digits, symbols, units).
5. **A round** that is one question, drawn from the skill — not a quiz bank with a skin on it.
6. **Hint ladder** — 💡 Hint gives the next step up a ladder of two hints, never the answer.
7. **Show me** — after two misses the game offers to walk the answer; it costs no star.
8. **Misconception feedback** — a wrong answer is diagnosed by *category* (`added-denominators`,
   `h-sign`, `run-over-rise`, …), so the coach answers the mistake the pupil actually made.
9. **Stars for first tries** — one star per first-try right answer; a level scores up to three.
10. **A finale** — the trophy screen names the skill that was learnt.

The kit's one hard rule is **the mechanic is the thinking**: you cannot win a game by tapping fast.
In Kunafa Fractions you cannot add until you have re-cut both trays; in Graph Pilot you cannot land
until the line you build has the right intercept *and* the right slope; in Haramain Rates the only
way to the instantaneous speed is to shrink the interval until the secant sits on the tangent.

## Files

```
games/
  fikr.js          the LK kit: screens, coach, hint ladder, stars, messages, test hooks
  fikr.css         the game skin (and its reduced-motion / dark-contrast rules)
  catalog.js       window.FIKR_CATALOG — every entry the hubs read
  games/k.js … 12.js   the game sources: world(), learn[], levels[], round(R)
  play/<id>.html   BUILT: css + kit + game inlined into one offline file
  play/index.json  BUILT: id, grade, file, skill, rounds per game
  play/_host.html  test harness: loads one game in a frame and records its messages
  index.html       the standalone hub (filters, stars, live progress bar, player)
```

Nothing in `play/` is edited by hand: run

```
node ../tools/build_games.js
```

from the site root to rebuild all thirteen. The build refuses to write a page that contains any
network URL — that is the offline guarantee, enforced rather than promised.

## The message contract

Each game posts to its parent (`parent.postMessage(msg, location.origin)`, only when embedded):

```js
{ v: 1, type, id, stars, streak, done, total, level, list: [{ detail, n }], score }
// type: lesson:ready | lesson:progress | lesson:level | lesson:mistakes | lesson:done | lesson:close
```

`lesson:ready` carries `total` (rounds in the whole game); `lesson:level` carries `stars` 1–3;
`lesson:mistakes` carries the misconception categories with counts, which is the report a teacher
actually wants. Both hubs (`index.html` and `#/lessons` inside the site) listen and show live stars,
rounds and mistakes above the game.

## Tests

Both drivers live in `/home/user` and drive a real Chromium through Playwright against
`http://127.0.0.1:3000`:

| driver | what it proves | output |
|---|---|---|
| `node gtests.js [ids…]` | home → Learn (every slide) → three levels answered correctly → trophy, with the message contract and console errors recorded | `games-audit.md` |
| `node ptest.js [ids…]` | the pedagogy a correct run cannot show: the Learn gate holds, a wrong answer keeps the stars and resets the streak, Hint never reveals, Show me reveals and awards nothing, repeated misses push the hint, a level with misses scores under three stars, `lesson:mistakes` names the misconception, stars persist | `pedagogy-audit.md` |
| `node gshots.js` | every built file boots with **all external requests blocked**, has no horizontal overflow at **430 px**, and plays a round; shoots the home screen and a live round of each game plus both hubs | `shots/g-*.png`, `games-qa.json` |

The latest historical full browser audit before the Grade 1 clock/ruler and Oasis Pattern Path additions: **13/13 games complete the loop, 30/30 pedagogy checks pass, 13/13 built files offline + 430 px + playable, 0 console errors.** The clock and ruler previously passed source syntax and a local flow test covering all 12 rounds, plus 200/200 randomized answer-visibility samples each. Oasis Pattern Path is new and still needs a full browser/pedagogy audit. Re-run `node ../tools/build_games.js` and the lesson-game checks after catalog changes; do not treat the older audit as coverage for newer games.

## Adding another game

1. Add an entry to `catalog.js` (`{ id, grade, g, band, emoji, title, topic, blurb, file, skill,
   misconceptions[] }`).
2. Copy any file in `games/` and change the skill. The contract is
   `LK.start({ id, title, emoji, topic, grade, band, coach, how, world(el), learn[], levels[], praise[], finale })`,
   with each level `{ name, icon, blurb, rounds, round(R) }`. Build a round with one of
   `LK.ui.choice / tiles / keypad / sliders` — each sets `R.answer` and `R.solve` for you.
3. `node ../tools/build_games.js`, then `node gtests.js <new-id>` and `node ptest.js <new-id>`.

Bands set the pacing: `k2 {rounds:4, tts, no timer}`, `g35 {6}`, `g68 {8, timer}`, `g912 {8, timer}`.

## The look: FIKR dashboard lesson kit (2026-11-21)

The Grade 1–9 lesson games wear the FIKR dashboard's lesson-kit look (`fikr-dashboard`
`playhub/lessons/kit/kit.css`): the game's own place, soft-focus, behind everything; a floating ink bar
with the game's tile; a home screen split into the picture and a level path with stars; chunky ink-edged
panels, choices and keypad (the keypad beside the round on wide screens); the guide bar pinned to the
bottom with **How to play** and the next step; the kit's how-to card. A game with no authored place shows
its first Learn model on the home screen instead.

It lives in two files layered over the Grade 1 theme by `tools/build_fikr_games.js`:
`games/_fikr/shared/kit-skin.css` and `kit-skin.js`. The engine is not touched, and the type is the kit's
system stack, so the embedded Fredoka font is no longer inlined. Rebuild with
`node tools/build_fikr_games.js`; check with `node tools/fikr_static_gate.mjs`.
Not yet reskinned: the prototypes in `play/` and the KG Math Garden, which run on other kits.


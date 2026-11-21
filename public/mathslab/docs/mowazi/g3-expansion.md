# Grade 3 expansion · ten lesson games on the Fikr template

**Status:** prototypes for review. Draft-aligned, **not** curriculum-approved and not classroom-tested.

Ten Grade 3 maths games, one per objective, built from the same **`fikr-lesson-game-template.html`** as Grades 1
and 2: Rawi and Ghubar, the CUBES think-first path, bar models, pop-up dialogs, the three-step hint ladder,
first-try stars with the 90/70 % rule, the resume dialog, the message contract and the `GAME_TEST` hooks. The
engine is still copied verbatim into `games/_fikr/engine/` and is **not modified** — only the authored `GAME`
object and the shared picture/icon layer are added below it.

The band moves from "one place at a time" to **relations**: equal groups become a fact, a total becomes equal
shares, a whole becomes equal parts, and a picture becomes a length. Grade 3 is the first band where the answer
is a *written relation* (`3 × 4`, `1/4`, `area = 4 × 3`) rather than a count, so every level asks the child to
produce the relation and not only the number.

## Scope and source ledger

| # | Game | Objective in the game | Draft source basis | Claim boundary |
|---|---|---|---|---|
| 1 | Grove Rows | Read equal groups as a multiplication fact and find the total | `G03-U01-MATH-L02` · 3.OA.A.1 | Products within 100; group sizes 2–6 |
| 2 | Date Tray Sharing | Share a total equally; find the share size or the number of groups | `G03-U01-MATH-L02` · 3.OA.A.2 | Exact division only, no remainder |
| 3 | Terrace Arrays | Read an array as rows × columns and find the turnaround fact | `G03-U01-MATH-L02` · 3.OA.A.1 / 3.OA.B.5 | Turnaround only; no distributive property |
| 4 | Souq Tables | Use a times-table step to find a product or a missing stop | `G03-U01-MATH-L02` · 3.OA.C.7 | Tables 2–7 within 100 |
| 5 | Falaj Fractions | Name a unit fraction of a whole cut into equal parts | `G03-U02-MATH-L02` · 3.NF.A.1 | Unit fractions only (numerator 1 or the same count shaded) |
| 6 | Fraction Line | Place a fraction on a number line from 0 to 1 | `G03-U02-MATH-L02` · 3.NF.A.2 | Intervals 0–1 only; no mixed numbers |
| 7 | Equal Shares | Find equivalent fractions by splitting the same whole | `G03-U02-MATH-L02` · 3.NF.A.3 | Numerators and denominators scaled by 2 or 3 |
| 8 | Courtyard Tiles | Find area by counting unit squares and by multiplying sides | Grade 3 measurement strand · 3.MD.C.5 / 3.MD.C.6 | Whole unit squares; rectangles only |
| 9 | Fence Walk | Find the perimeter of a rectangle by walking four sides | Grade 3 measurement strand · 3.MD.D.8 | Rectangles only; integers in metres |
| 10 | Rounding Road | Round a 2-digit number to the nearest ten | Grade 3 place-value strand · 3.NBT.A.1 | Nearest ten only; no hundreds, no decimals |

Draft documents consulted (Google Drive, P2 / internal review):

- `G03-U01-MATH-L02 — الضرب والقسمة كتساويات المجموعات والمصفوفات ضمن ١٠٠`
  (`1uKIWvjuwxe4N34A01RsAhiZN7duAjq3CF-N-jOZZleU`) — games 1–4. Standards named in the bundle:
  3.OA.A.1 (equal groups), 3.OA.A.2 (equal shares and equal groups), 3.OA.A.3 (word problems with models and
  equations with a symbol for the unknown).
- `G03-U02-MATH-L02 — الكسور كأعداد على خط الأعداد والكسور المتكافئة`
  (`1W24jy3--HxXQ5SywPlzEdR9ku3QtAwg3DX3RHFnUr-g`) — games 5–7. Standards named in the bundle:
  3.NF.A.1, 3.NF.A.2, 3.NF.A.3, with denominators 2, 3, 4, 6 and 8.

Games 8–10 are the remaining Grade 3 band topics in `grade-03.md` (**area and perimeter, rounding**) and the
Common Core codes named in the table. **They are not yet traced to a specific Mowazi Grade 3 unit document** —
that trace is item 1 under *Remaining review*. The fractions lesson also carries the Ghubar-style misconceptions
the bundle itself names (unequal parts treated as fractions, adding tops and bottoms), which the why-lines use.

## How the template is used

| Template rule | Where it is honoured |
|---|---|
| Journey: home → Learn → 3 levels → trophy | Native engine flow, unchanged |
| Learn recipe: hook → model → your turn (`wait:true`) → Ghubar's mistake (`wait:true`) | Exactly four slides in every game |
| CUBES before every word problem | Level 3 of games 1, 2, 4, 5, 6, 7, 8, 9, 10 carries `problem:{sentences, question, keys, extras}`; the ✂ step must reject a wrong sentence |
| Hint ladder: strategy → step → near answer, never the answer | Every round; the third hint stops one step short |
| `why(v)` per predictable mistake | Every distractor has a named misconception (codes below) |
| `solution` after two misses | Every round |
| Round types `choice` / `number` | `choice` for relation-reading (which fact, which picture, which line), `number` for producing a total |
| Never put the answer inside the picture before it is solved | Groups, dot arrays, shares, fraction bars and number lines print **no totals or fraction labels** while the round is open; only the parts the question already states are drawn |
| Touch target from `GAME.band` | `band: 'g35'` → 56 px targets; read-aloud on, no timer |
| One skill per game, Saudi context | Al-Ahsa palm grove, date stall trays, terrace tiling, souq crates, falaj water shares, surveyor's road, window panes, courtyard tiles, farm fence, road signs |

Misconception codes carried in the `why(v)` lines:

| Code | The child's move | Where it is treated |
|---|---|---|
| `added-not-multiplied` | adds the two numbers instead of multiplying | 1, 3, 4, 8 |
| `one-row-only` | counts one row and stops | 1, 3 |
| `div-swap` | subtracts instead of sharing, or divides the wrong way | 2 |
| `table-skip` | mistakes the step in a skip-count | 4 |
| `frac-unequal` | treats unequal pieces as fractions | 5 |
| `frac-add-den` | adds tops and bottoms to make equivalents | 7 |
| `frac-line-whole` | counts ticks instead of spaces | 6 |
| `area-perimeter-mix` | gives the distance round the edge for the area, or the reverse | 8, 9 |
| `round-always-up` | rounds every number up | 10 |

## The visual layer

The Grade 1 and 2 layers are reused unchanged — `games/_fikr/shared/theme.css`, `scenes.js`, `scenes-2.js`,
`hero.js` and the embedded Fredoka font — and extended, not forked:

| File | What Grade 3 adds |
|---|---|
| `games/_fikr/shared/scenes-3.js` | `groups` (n equal groups, each holding `size` palms, drawn unnumbered), `dots` (an unnumbered dot array), `share` (a total dealt into equal trays), `fracLine` (a 0–1 line in `den` equal spaces with an optional ringed point), `fracBar` (a bar in `den` parts with `num` shaded), `fracPair` (two stacked bars for equivalence), `tiles` (a rectangle tiled in unit squares, sides optional), `fence` (a dashed fenced rectangle with both side lengths), `roundLine` (two tens with the halfway mark and the number marked), plus `frac`/`times`/`divide` glyph helpers |
| `games/_fikr/shared/icons.js` | Thirteen new 64×64 icons — palm, tray, dots, cart, drop, window, tile, fence, road, repeat, abacus3, ruler2, plates — and their mappings, so no Grade 3 level card, header emoji or dialog falls back to a glyph |
| `games/_fikr/shared/hero.js` | unchanged; the Grade 3 home screens use the shared art and the new icons |

Every picture is generated from the numbers the question asks about, so a caption can never disagree with the
drawing — the rule established in Grade 2 — and none of them prints the total the child is meant to work out.

## Build, test, screenshots

```bash
node tools/build_fikr_games.js grade3           # engine + theme + fonts + icons + hero + scenes-2 + scenes-3 + GAME
node tools/fikr_games_qa.mjs grade3 --shots     # headless QA + screenshots
node tools/fikr_games_gallery.mjs grade3        # screenshot gallery
```

`tools/build_fikr_games.js` gained `grade3: ['scenes-2.js', 'scenes-3.js']` in `EXTRA_LIBS`; both tools stay
grade-parameterised and run every grade when given no argument.

`tools/fikr_games_qa.mjs` walks all four Learn slides (checking the two `wait:true` slides stay locked), answers
a round wrongly to prove the why-line path fires, clears the CUBES ✂ step, then plays all 18 rounds through the
three level dialogs to the trophy. It fails a game that renders `[object Object]`, `undefined` or `NaN`
anywhere a child can see.

Current result: **10/10 clean** — 18 rounds, three level dialogs, four Learn slides with two gates, CUBES on six
rounds per game, no console errors, no requests outside the page, at least one star per level, trophy reached.
A separate text pass over every screen state at 390 px reports **no stray emoji text anywhere** for Grades 1, 2
and 3 (30/30 games), with no horizontal overflow.
Screenshots and raw results: `screenshots/grade3-fikr/`.

## Fixes this round

Bugs found by reviewing the captures, and fixed in the shared layer (so Grades 1 and 2 benefit too):

1. **The title-bar emoji survived as a raw glyph.** `theme.css` hides `#g-emoji`, but the character was still in
   the DOM and still rendered as a colour emoji wherever the header was shown at a narrow width. It is now drawn
   as the game's own icon, so no raw pictograph is left anywhere in the page.
2. **The celebration burst was eight emoji spans.** `UI.burst` builds its confetti from `⭐ ✨ 🌟`; those are now
   drawn with the inline star/sparkle icons, so the reward survives without a glyph.
3. **An orphan variation selector after an icon swap.** `🛣️` is `U+1F6E3` + `U+FE0F`; replacing only the base
   character left the selector behind, which renders as a stray box. The icon pattern now takes the selector with
   the glyph and a final pass strips any that remain.
4. **A picture option that could be guessed on sight.** Falaj Fractions and Fraction Line offered improper
   fractions (`3/1`, `5/2`) as distractors — a Grade 3 child eliminates those instantly instead of counting
   parts, which defeats the mechanic. Every decoy is now a proper fraction of the same shape.
5. **A `why()` that compared rendered HTML.** One Grade 3 why-line tried to parse the option markup to decide its
   message; it now compares against the answer the round built. (The Grade 2 `[object Object]` lesson, one layer
   in: never branch on markup.)

## Remaining review before curriculum claims

1. Trace games 8–10 (area, perimeter, rounding) to the canonical Grade 3 unit documents, then re-check every
   objective and hint line.
2. Confirm `G03-U01-MATH-L02` / `G03-U02-MATH-L02` are the canonical scope for games 1–7, and that area and
   perimeter belong to `G03-U02` in the mowazi sequence rather than a third unit.
3. Teacher/curriculum review of each misconception code and why-line — especially `frac-unequal`, which the
   fractions bundle raises but does not name as a code.
4. Arabic-first delivery: `GAME.lang:'ar'` flips the template to RTL, but these ten are authored in English.
   The fractions strand in particular will need Arabic fraction wording (جزء، كسر، بسط، مقام) reviewed together.
5. Run the P0–P6 gates in [`lesson-authoring-scope.md`](lesson-authoring-scope.md) before calling these
   Mowazi-aligned or classroom-ready.

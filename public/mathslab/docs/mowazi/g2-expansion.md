# Grade 2 expansion · ten lesson games on the Fikr template

**Status:** prototypes for review. Draft-aligned, **not** curriculum-approved and not classroom-tested.

Ten Grade 2 maths games, one per objective, built from the same **`fikr-lesson-game-template.html`** as the
Grade 1 set: Rawi and Ghubar, the CUBES think-first path, bar models, pop-up dialogs, the three-step hint
ladder, first-try stars with the 90/70 % rule, the resume dialog, the message contract and the `GAME_TEST` hooks.
The engine is copied verbatim into `games/_fikr/engine/` and is **not modified** — only the authored `GAME`
object and the shared picture/icon/hero layer are added below it.

The board widens with the grade: work goes to **1,000**, regrouping is explicit, and money, arrays,
five-minute time and a graph key join the picture library.

## Scope and source ledger

| # | Game | Objective in the game | Draft source basis | Claim boundary |
|---|---|---|---|---|
| 1 | Date-Shop Packing | Build a 3-digit number from hundreds, tens and ones | `G02-U01-MATH-L02` · 2.NBT.A.1 | Numbers to 1,000; packing only, no written algorithm |
| 2 | Expanded-Form Workshop | Write a number in expanded form; a zero place contributes nothing | 2.NBT.A.1 / 2.NBT.A.3 | Three-digit numbers only |
| 3 | Caravan Compare | Compare two numbers to 1,000 with `<`, `>` and `=` | 2.NBT.A.4 | Comparison only; no ordering of three numbers |
| 4 | Regrouping Depot | Add within 100 with regrouping, carry ten ones as one ten | `G02-U02-MATH-L02` · 2.NBT.B.5 | Sums within 100; a carry never exceeds one ten |
| 5 | Lantern Borrow | Subtract within 100 with regrouping, trade a ten for ten ones | 2.NBT.B.5 | Differences within 100; single borrow |
| 6 | Falcon Hop | Skip count by 2s, 5s, 10s and 100s | 2.NBT.A.2 | Forward counting only; start values stay in range |
| 7 | Riyal Market | Count riyals and halalas, make an amount, work out change | 2.MD.C.8 / local | Whole riyals for change; halalas appear as coin art only |
| 8 | Crate Arrays | Read an array as repeated addition | 2.OA.C.4 | Array and repeated addition; multiplication is **not** named |
| 9 | Harbour Clock | Tell time to five minutes; read both hands | 2.MD.C.7 | Five-minute marks only; adding minutes, no duration units |
| 10 | Ridge Diagram | Read a picture graph with a key, then compare two columns | 2.MD.D.10 | Three columns; key of 2 or 5; "how many more" only |

Draft documents consulted (Google Drive, P2 / internal review):

- `G02-U01-MATH-L02 — القيمة المنزلية للأعداد حتى ١٠٠٠ والصيغة التحليلية والمقارنة`
  (`1XWMklTj-G_ZorWsWOieFdVgjN1XBPz8QS-_fdr9jvqA`) — games 1–3.
- `G02-U02-MATH-L02 — الجمع والطرح بإعادة التجميع ضمن ١٠٠ و١٠٠٠ بنماذج القيمة المنزلية`
  (`139L45lHZq569uN-lX2xXHf0zNCwIIAz13gepNKHA1E0`) — games 4–5.

The remaining five objectives come from the Grade 2 band brief (`grade-02.md`: money, skip counting, arrays,
time to five minutes, graphs) and the US Common Core codes named in the table. **They are not yet traced to a
specific Mowazi Grade 2 unit document** — that trace is the first item under *Remaining review*.

## How the template is used

| Template rule | Where it is honoured |
|---|---|
| Journey: home → Learn → 3 levels → trophy | Native engine flow, unchanged |
| Learn recipe: hook → model → your turn (`wait:true`) → Ghubar’s mistake (`wait:true`) | Exactly four slides in every game |
| CUBES before every word problem | Level 3 of games 2–5, 7–10 carries `problem:{sentences, question, keys, extras}`; the ✂ step must reject a wrong sentence |
| Hint ladder: strategy → step → near answer, never the answer | Every round; the third hint stops one step short |
| `why(v)` per predictable mistake | Every distractor has a named misconception (see the codes below) |
| `solution` after two misses | Every round |
| Round types `choice` / `number` / `bars` | `bars` carries Regrouping Depot level 2 |
| Never put the answer inside the model before it is solved | `UI.bars` is drawn without `reveal` while playing |
| Touch target from `GAME.band` | `band: 'g35'` → 56 px targets; read-aloud still on by default for this band |
| One skill per game, Saudi context | Al-Qassim date shop, workshop receipts, dune caravans, depot crates, old-town lanterns, Asir ridge, Friday market, orange crates, Jeddah harbour |

Misconception codes carried in the `why(v)` lines: `pv-concat` (345 → 300405), `pv-swap` (tens and ones
exchanged), `pv-zero` (an empty place dropped), `cmp-lastdigit` (comparing only the ones digit),
`regroup-forgot` (a carried ten never added), `regroup-borrow` (smaller-from-bigger in the ones column),
`money-adds` (change added instead of subtracted), `array-sums` (rows + row size), `clock-hand` (the long hand
read as the hour), `key-ignored` (graph squares compared without multiplying by the key).

## The visual layer

The Grade 1 layer is reused unchanged — `games/_fikr/shared/theme.css`, `icons.js`, `hero.js` and the embedded
Fredoka font — and extended, not forked:

| File | What Grade 2 adds |
|---|---|
| `games/_fikr/shared/scenes-2.js` | `baseTen` (flats / rods / units, centred, unnumbered), `placeChart` (a column can be blanked for the missing-place round), `compareHi`, `money` (riyal notes and halala coins), `array` (row captions can be hidden when the picture is itself an answer option), `skipTrack`, `clockAt` (any five-minute mark — the Grade 1 scene only draws `:00` and `:30`), `graphKeyed` (a picture graph whose key is part of the question) |
| `games/_fikr/shared/icons.js` | Twelve new 64×64 icons (crate, receipt, camel, money, falcon, steps, hundred, coin, orange, chart, clock, divider) and their emoji mappings, so no Grade 2 level card or dialog falls back to an emoji glyph |
| `games/_fikr/shared/hero.js` | Six Grade 2 home-screen pictures (date shop, receipt printer, two caravans, depot, lanterns, harbour) |

## Build, test, screenshots

```bash
node tools/build_fikr_games.js grade2           # engine + theme + fonts + icons + hero + GAME → games/grade2/<id>.html
node tools/fikr_games_qa.mjs grade2 --shots     # headless QA + screenshots
node tools/fikr_games_gallery.mjs grade2        # screenshot gallery
```

Both tools are grade-parameterised; run them with no argument to build or test every grade at once.

`tools/fikr_games_qa.mjs` walks all four Learn slides (checking the two `wait:true` slides stay locked), answers
a round wrongly to prove the why-line path fires, clears the CUBES ✂ step, then plays all 12 rounds through the
three level dialogs to the trophy. It also fails a game that renders `[object Object]`, `undefined` or `NaN`
anywhere a child can see — the guard was added after a picture option was found printing as `[object Object]`.

Current result: **10/10 clean** — 12 rounds, three level dialogs, four Learn slides with two gates, no console
errors, no requests outside the page, at least one star per level, trophy reached.
Screenshots and raw results: `screenshots/grade2-fikr/`.

## Fixes this round

Bugs found by reviewing the captures, and fixed in the shared layer (so Grade 1 benefits too):

1. **Runaway icon repaint.** A dialog icon with no mapping made `icons.js` write an empty string back into
   `innerHTML`, which fired its own `MutationObserver` forever and froze the page when a level dialog opened.
   The write is now guarded, so the observer settles.
2. **Picture options printed as `[object Object]`.** The engine renders an option with `String(o)` and compares
   with `===`, so a `{key, html}` object can never be right. Time-in-the-Garden (Grade 1, levels 1 and 3),
   Harbour Clock and Crate Arrays now pass the HTML string itself. The QA junk guard covers the recurrence.
3. **A clock face that disagreed with its question.** The Grade 1 `clock` scene draws only `:00` and `:30`, so a
   "5:10" question showed a 5:00 face. Grade 2 now uses `SCENE2.clockAt(hour, minutes)`.
4. **An answer-leaking caption.** A reading question was captioned with the time it was asking for; the caption
   now describes what to do, not the answer. The array options lost their "5 rows · 5 in each" labels for the
   same reason — the picture is the thing to count.
5. **A graph whose key contradicted its question.** The shared scene hard-codes "each circle = 1 vote"; a key-of-2
   question was drawn with a key of 1. `SCENE2.graphKeyed` now draws the key the question asks about.
6. **Emoji that render as empty boxes.** A text pass over every screen state (home, Learn, each level, a hint,
   a wrong answer, "Show me") now finds `no stray emoji text anywhere` in either grade. Six things were still
   raw symbols: the CUBES strip (never iconised at all), the "Think first" heading's brain, the coach's mood
   badge, the keypad delete key, the Check tick and the star rows on the level cards and in the level dialog.
   The bulb badge had a second cause — an icon's own SVG `<text>` was re-scanned and wrapped inside another icon,
   which is what put a stray box beside the coach's face.
7. **The help button's "?" was invisible** on the accent header: a filled disc with a white mark on an already
   pale `currentColor`. It is now an outlined ring with a `currentColor` question mark.
8. **A truncated level name on a phone.** At 390 px the header cut it to "The missing pla" and overlapped the
   stars chip; the level name now takes its own row under the title.

## Remaining review before curriculum claims

1. Trace games 6–10 to the canonical Grade 2 unit documents, then re-check every objective and hint line.
2. Confirm `G02-U01-MATH-L02` / `G02-U02-MATH-L02` are the canonical scope for games 1–5.
3. Teacher/curriculum review of each misconception code and why-line.
4. Arabic-first delivery: `GAME.lang:'ar'` flips the template to RTL, but these ten are authored in English.
5. Run the P0–P6 gates in [`lesson-authoring-scope.md`](lesson-authoring-scope.md) before calling these
   Mowazi-aligned or classroom-ready.

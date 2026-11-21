# Ten-game batch · Grades 1–10

**Status:** prototypes built from reviewed draft lesson objectives where evidence was available; none are curriculum-approved or classroom-tested. The batch explicitly contains one standalone Grade 10 supplement because the reviewed Mowazi scope is K–9.

## Scope and source ledger

| Grade | New game | Objective | Source basis / claim boundary |
|---|---|---|---|
| 1 | Chime Match | Read full and half hours | `G01-U01-MAT-L06` draft includes full/half hours. Draft code is cited as source text; current live map assignment is not independently verified. |
| 2 | Place-Value Port | Place value to 1,000, including zero placeholders | `G02-U01-MAT-L02` draft; 2.NBT.A.1. |
| 3 | Array Garden | Multiplication as equal groups and arrays | `G03-U01-MAT-L01` draft; 3.OA.A.1. |
| 4 | Times-as-Many Workshop | Multiplicative comparison | `G04-U01-MAT-L01` draft; 4.OA.A.1. This is intentionally not the earlier multi-step word-problem game objective. |
| 5 | Decimal Shift Lab | Decimal place value and powers of ten | `G05-U01-MAT-L01` draft; 5.NBT.A.1–2. This replaces the earlier unlike-denominator fraction game objective for this batch. |
| 6 | Ratio Route | Equivalent ratios and unit rates | `G06-U01-MAT-L01` draft; 6.RP.A.1–3. |
| 7 | Number-Line Rescue | Add and subtract integers on a number line | `G07-U01-MAT-L02` draft; 7.NS.A.1–2. The game covers an integer subset of the broader rational-number lesson. |
| 8 | Line Builder | Linear relationships, slope and intercept | `G08-U01-MAT-L01` draft; 8.EE.B.5–6. |
| 9 | Parabola Lab | Read the vertex from vertex form | `G09-U01-MAT-L01` draft; HSA.REI.B.4 / HSF.IF.C.7a. |
| 10 | Angle of Approach | Right-triangle trigonometry | **Independent supplemental prototype** based on `docs/mowazi/game-briefs/grade-10.md`; no Mowazi Grade 10 lesson/source/alignment is claimed. Fictional survey values only; no real landmark measurements. |

The lesson codes above come from reviewed Drive lesson exports and the existing source ledger, not from grade-substring search results. The reviewed exports were incomplete/truncated in places, and the live map assignments were not independently verified. Treat these as objective-led drafts, not approved mappings. The Grade 1 source is a draft sequence pack and likewise still needs live-map verification. See [`game-source-mapping.md`](game-source-mapping.md) and [`lesson-authoring-scope.md`](lesson-authoring-scope.md) for evidence and review gates.

## Build and files

Each new title is an additional Fikr game entry, separate from the 16 pre-existing games. Sources are under `games/games/`; the offline, self-contained outputs are under `games/play/`. Catalog metadata retains the source/claim caveat. They use the offline Fikr kit, inline SVG, three-stage practice, misconception tags, hints, and the lesson message contract.

The UI direction follows the child-friendly, rounded/high-contrast card recommendations from UI UX Pro Max, while keeping the existing Fikr architecture. A compact Noto Emoji subset is embedded into these ten pages as data URIs so icons remain available offline; its SIL OFL license and font files are in `games/assets/noto-emoji/`. The font and game pages do not fetch network resources.

Screenshots for the ten new games are saved in `screenshots/ten-game-batch/`: [browse the launch and active-round gallery](../../screenshots/ten-game-batch/index.html), with per-game PNGs and [`qa.json`](../../screenshots/ten-game-batch/qa.json). They document prototype UI, not classroom approval.

## Remaining review before curriculum claims

1. Verify the Grade 1–9 lesson addresses against the current live math map.
2. Independently review source packs in full, especially exports that were truncated.
3. Run staged P0–P6 content, accessibility, classroom-trial, and owner-approval gates.
4. Do not label Grade 10 as Mowazi-aligned unless an authoritative Grade 10 source and scope decision are supplied.

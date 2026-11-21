# The `.BOK` files are decoded — both of them

| file | bytes | book | blocks | inflated | what it is |
|---|---|---|---|---|---|
| `PCALC7Z.BOK` | 29,880,608 | `PCALC7Z` | 30,209 | 44.6 MB | Blitzer **Precalculus**, saved *Mon Apr 19 16:37:16 2021* |
| `TCALT15W.BOK` | 39,199,656 | `TCALT15W` | 35,323 | 66.1 MB | **Calculus** (derivative 117, limit 118, integral 151, series 110 in the wording) |

Both are Pearson **TestGen 7.6.5** testbanks.

Same treatment as `A1 Topic 01.bnk`: the format was re-implemented from the raw bytes,
nothing was run from the `.exe`. Parser: **`tools/parse_bok.py`** (shipped) ·
working copy `build/parse_bok.py`.

```
python3 tools/parse_bok.py PCALC7Z.BOK -o pcalc7z-bok.json --dump pcalc7z-questions.txt
```

## Why the `.bnk` recipe did not carry over

| | `.bnk` (ExamView) | `.BOK` (TestGen) |
|---|---|---|
| magic | `1A 46 53 43 42 4E 4B` (`\x1aFSCBNK`) | `54 47` (`TG`) |
| text | zlib stream, NUL-separated UTF‑16LE | two layers: plain UTF‑16LE, plus per-item compressed blocks |
| compression | zlib (deflate) | **RDC** — Ross Data Compression, 30,209 blocks |

`zlib`, `bz2` and `lzma` were tried against the `.BOK` first: **zero valid streams**, so
the `.bnk` `inflate()` is simply the wrong tool. The blocks announce themselves instead:

```
52 44 43 31 | 0f 01 00 00 | ac 00 | <stream>
"R  D  C  1"  uncompressed   compressed
               = 271 B        = 172 B
```

That is RDC — Ed Ross, *The C Users Journal*, January 1992 (the unit TestGen ships is a
Pascal port by Mike Chapin). One 16-bit control word governs 16 items, read low bit
first; a clear bit is a literal byte, a set bit is a code:

| code | meaning |
|---|---|
| `0x0n` | short RLE — run of `n + 3`, then the byte |
| `0x1n` | long RLE — run of `n + (next << 4) + 19`, then the byte |
| `0x2n` | long match — `offset = n + (next << 4) + 3`, `length = next2 + 16` |
| `0x3n`…`0xFn` | short match — same offset, `length = n` (3…15) |

`parse_bok.py` implements exactly that (`rdc_decompress`), reads the two length fields from
the block header, and checks every block ends at its declared size.

## What came out of the two books

| book | plain strings | chunks | expression | figure | stem | rubric | distinct readable texts |
|---|---|---|---|---|---|---|---|
| `PCALC7Z` | 81,707 | 30,209 | 22,488 | 3,985 | 1,682 | 2,054 | 2,170 |
| `TCALT15W` | 89,281 | 35,323 | 13,507 | 1,932 | 4,242 | 15,642 | 5,478 |

Filtered down to real wording (≥5 words, font names and record ids and option tables
removed, near-duplicates merged) that is **4,128 items** — 1,420 Precalculus and 2,708
Calculus — exported by `build/testgen_export.py` to `site/assets/data/testgen.js` and shown
in the site as the **TestGen `.BOK`** source in Question Studio.

## Detail for `PCALC7Z.BOK`

```
plain strings   81,707        item ids   13,044  (IR:/SR:/FP:pcalc401:A10680846 …)
RDC1 blocks     30,209        timestamps 18,225  (Mon Apr 19 16:37:16 2021 …)
packed          29.9 MB  →  inflated  44.6 MB   (0 blocks failed the size check)
```

Every inflated block is one embedded object. Classified by what it holds:

| kind | blocks | what it is |
|---|---|---|
| expression | 22,488 | a formula / option / answer table in ExamView's internal notation (`(e*+)`, `(e2e**+)`, `\v1*cos(t)`) |
| figure | 3,985 | a drawing: `cartesian` / `numberline`, `.ELLIPSE`, `.FPOINT`, `.NLNSEG`, `.END` |
| question | 1,682 | real wording — a stem sentence |
| instruction | 2,054 | real wording — a shared rubric ("Find the intersection of the two sets.") |

Stitched back together (object references become gaps), that is **2,170 distinct readable
texts — 1,363 stems and 807 rubrics**, plus the book skeleton from the plain layer:
12 chapter nodes ("Chapter P: Prerequisites: Fundamental Concepts of Algebra",
"Algebraic Expressions, Mathematical Models, and Real Numbers", …) and the item ids.

Sample of what the decoder returns:

```
[question   90160] A stone is dropped from a tower that is ␀ feet high. The formula ␀
                   describes the stone's height above the ground, h, in feet, t seconds
                   after it was dropped. What is the stone's height ␀ seconds after it
                   is released?
[question 1138248] The formula ␀ can be used to estimate the speed of a car, v, in miles
                   per hour, based on the length, L, in feet, of its skid marks upon
                   sudden braking on a dry asphalt road. If a car is involved in an
                   accident and its skid marks measure ␀ feet, at what estimated speed
                   was the car traveling when it applied its brakes just prior to the
                   accident?
[question  716688] In a state with a population of ␀ people, the average citizen spends
                   $6,000 on housing each year. What is the total spent on housing for
                   the state?
[instruction 123624] Find the intersection of the two sets.
[instruction 158304] List all numbers from the given set B that are members of the given
                     Real Number subset.
```

`␀` is the position of a generated value or an embedded formula object — in a question
record it is the same "ruled gap" the `.bnk` recovery already produces, so it drops
straight into the existing card.

## What is decoded and what is not

**Decoded:** the container, the compression, the plain metadata layer (book, chapters,
item ids, fonts, save stamps), every one of the 30,209 embedded objects, and all the
human wording in them.

**Not yet rendered:** two things inside the object blocks.

1. *Expression objects* — ExamView stores maths in a postfix notation (`(e*+)`,
   `(e2e**+)`, `n(p<2)` for constraints, `\h\o~pi_l\h\x` for symbol names). The tokens
   are recovered, the printer is not written. This is also where the algorithmic
   material lives: `\v$1,\v$2({\h\o~pi_l\h\x, …})` blocks are answer tables with
   `True`/`False` keys, and `n(…)` blocks are the variable constraints — the same shape
   as the `.bnk` `range()`/`choose()` recipes.
2. *Figure objects* — the numbers are recovered (axis ranges, foci, points), the drawing
   is not; the site already draws its own SVG/graph instead.

Question *options and keys* live in the expression tables, not in the wording blocks, so a
`.BOK` item currently arrives as wording + gaps, exactly like a `.bnk` item.

## Files

| file | what |
|---|---|
| `build/parse_bok.py` → `site/tools/parse_bok.py` | the decoder (header, RDC1, plain layer, fragment stitching, classification) |
| `build/pcalc7z-bok.json` (3.2 MB) | every block with kind, offset, sizes and rebuilt text |
| `build/pcalc7z-bok-wording.json` (0.6 MB) | the 2,170 distinct readable texts with occurrence counts |
| `build/pcalc7z-questions.txt` | flat text dump, one stem/rubric per line |
| `build/rdc.py`, `build/bok_lib.py` | the RDC unit and the exploratory lib used while reversing the format |

`TCALT15W.BOK` (39 MB, same Drive folder) runs through the same parser — nothing in
`parse_bok.py` is specific to `PCALC7Z`.

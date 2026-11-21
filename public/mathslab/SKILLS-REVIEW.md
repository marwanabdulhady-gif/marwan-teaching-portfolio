# Skills Review banks (Topic 0) — what they held and what now covers them

Three banks in the `test gen` Drive folder had never been opened: **Algebra 1 Topic 00** (69,739 B),
**Algebra 2 Topic 00** (46,859 B) and **Geometry Topic 00** (42,106 B). They are `0-N …` **Skills Review**
records, and unlike Topics 1–12 they carry no `9-1.3` objective numbering — the string after the topic line
*is* the skill name. `tools/parse_testgen.py` now recognises that layout, so the three banks parse.

What is inside them is the TestGen variable machinery in plain text: `range(2,9)`, `list(2,3,5,…)`,
`choose(case,-5,2,0)`, `rand(3)`, constraints (`var1<>var2`), derived values (`var3 = var2+1`) and
`scramble TRUE`. Their stems and choices are object-based (the same packed rich-text the `.BOK` uses), but
the *recipes* come through cleanly — which is exactly the part the generator reuses.

## enVision Algebra 1 — 12 skill topics

| skill topic | families covering it |
|---|---|
| 0-1 Prime Numbers and Composite Numbers | `a1.primefact` |
| 0-2 Factors and Multiples | `a1.gcflcm` |
| 0-4 Simplifying Fractions | `a1.proportion` |
| 0-5 Fractions and Decimals | `a1.fracdec` |
| 0-6 Adding and Subtracting Fractions | `a1.unitfrac` |
| 0-7 Multiplying and Dividing Fractions | `a1.fracmul` |
| 0-8 Fractions, Decimals, and Percents | `a1.percentconv`, `a1.percent` |
| 0-9 Exponents | `a1.exponent`, `a2.exponentlaw` |
| 0-10 Scientific Notation and Significant Digits | `a1.scinot` |
| 0-11 Perimeter, Area, and Volume | `a1.prismvol`, `a1.triarea`, `geo.cylinder` |
| 0-12 Line Plots | `a1.median`, `a1.mean` |
| 0-16 Stem-and-Leaf Plots | `a1.median` |

## enVision Algebra 2 — 13 skill topics

| skill topic | families covering it |
|---|---|
| 0-1 Percents and Percent Applications | `a2.percentof` |
| 0-2 Operations With Fractions | `a1.fracmul`, `a1.unitfrac` |
| 0-3 Ratios and Proportions | `a2.proportion2`, `a1.proportion` |
| 0-4 Simplifying Expressions With Integers | `a2.integerops` |
| 0-5 Area and Volume | `a1.prismvol`, `a1.triarea`, `geo.cylinder` |
| 0-6 The Coordinate Plane, Slope, and Midpoint | `a1.slope`, `geo.distance`, `geo.midpoint` |
| 0-7 Operations with Exponents | `a2.exponentlaw`, `a1.exponent` |
| 0-7 Operations With Exponents | `a2.exponentlaw` |
| 0-8 Factoring and Operations With Polynomials | `a1.factor`, `a1.polyadd`, `a1.polymult` |
| 0-8 Factoring Operations With Polynomials | `a1.factor` |
| 0-9 Scientific Notation and Significant Digits | `a1.scinot` |
| 0-13 Operations With Rational Expressions | `a2.simplify` |
| 0-11 Bar and Circle Graphs | `a1.probability` |

## enVision Geometry — 13 skill topics

| skill topic | families covering it |
|---|---|
| 0-1 Using a Ruler and Protractor | *tool* — `#/protractor` (drag the ray / the bar and read the scale) |
| 0-2 Classifying Triangles | `geo.trianglesum` |
| 0-3 Measurement Conversions | `geo.convert` |
| 0-4 Measurement, Rounding Error, and Reasonableness | `geo.percenterror` |
| 0-6 Squaring Numbers and Finding Square Roots | `geo.simplerad`, `a1.radical` |
| 0-7 Evaluating and Simplifying Expressions | `a1.evaluate` |
| 0-8 Simplifying Ratios | `a1.simplifyratio` |
| 0-9 Absolute Value | `a1.absvalue` |
| 0-10 The Coordinate Plane | `geo.distance` |
| 0-11 Solving and Writing Linear Equations | `a1.onestep`, `a1.twostep`, `a1.lineeq` |
| 0-12 Percents | `a1.percent`, `a2.percentof` |
| 0-13 Probability | `a1.probability` |
| 0-5 The Effect of Measurement Errors on Calculations | `geo.percenterror` |

## Result

* **37 of 38** skills-review topics have a live generator family, and the 38th (ruler & protractor)
  is covered by a new measuring tool instead of a recipe.
* **19 new families** were written off this inventory: `a1.primefact`, `a1.gcflcm`, `a1.unitfrac`,
  `a1.fracdec`, `a1.fracmul`, `a1.percentconv`, `a1.scinot`, `a1.median`, `a1.simplifyratio`,
  `a1.prismvol`, `a1.triarea`, `a2.percentof`, `a2.proportion2`, `a2.integerops`, `a2.exponentlaw`,
  `geo.trianglesum`, `geo.percenterror`, `geo.simplerad`, `geo.convert` — the generator is now **112 recipes**
  (Algebra 1 34 · Algebra 2 19 · Geometry 14 · Precalculus 7 · Calculus 13).
* Two engine bugs surfaced and were fixed: `sqrtT` pulled out the *first* square factor instead of the
  largest (√80 rendered `2√20`, now `4√5`), and `frac` returned `4/1` instead of `4` after cancelling.
  Both fixes improve every existing family that uses them.
* `#/protractor` closes `0-1`: a half-circle protractor with both scales, a ray you drag, a ruler that snaps
  to the millimetre, and a "measure it yourself" task that hides the readout until you answer.

## The EXEs

`Install_Win_TestGen7.6.5.exe` (7.96 MB) and `enV_AGA_ExamView_Win*/EVPlayer/Setup.exe` (17.8 MB) were both
opened and scanned: both are packed self-extractors — a VC++/InstallShield stub with an opaque payload
(no MSCF/CAB, ZIP or 7z member, and the only zlib streams inside inflate to bitmaps). Their logic is not
readable without unpacking the installer, so nothing was taken from them; the same item model was already
recovered from the data files themselves (`.bnk` recipes, `.BOK` blocks).

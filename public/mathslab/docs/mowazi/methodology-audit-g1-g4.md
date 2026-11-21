# Methodology audit — Fikr lesson games G1–G4 vs. نبع/موازي curriculum folder

**Date:** 17 November 2026
**Trigger:** standing instruction to follow the lessons, scope and methodology of Drive folder
`1BSQkT99nOw8G-tBB2u83tGwxjuVJwGBS`.
**Scope:** 40 built games (Grade 1–4, 10 each) + the authored sources that generated them.
**Verdict:** **Not yet conformant.** The games are scope-aligned at the *standards* level but
**methodology-aligned at zero** — the ten-section lesson frame, the Quranic-root axis and the
P2 status line are all absent. Build must pause on new grades until this is resolved.

---

## 1. What the folder actually requires

### 1.1 Canonical lesson frame (from `AUDIT REPORT — نبع / موازي G2–G9`, folder `02 — المنهج`)

Every lesson document is audited against a **10-section teacher-guide template**:

| # | Section (AR) | Requirement |
|---|---|---|
| 1 | الترابط | Link to prior learning |
| 2 | الأهداف | **≥ 5** objectives |
| 3 | الآية | Quranic verse anchor, mushaf-verified |
| 4 | القصة | Story / narrative hook |
| 5 | المسارات | **exactly 9** subject tracks (مواد) |
| 6 | التسلسل | **7** connected time blocks, 0 → end of lesson |
| 7 | المحطات | **≥ 3** stations, **each with 3 differentiation levels** |
| 8 | الخروج | Exit card: **≥ 4 items labelled أ–هـ**, with a success criterion |
| 9 | الواجب | Homework: **≥ 2 items** |
| 10 | المراجعة | Review / reflection |

Duration bookkeeping: **45 min** for Grade 2, **70 min** for all other grades.
Also required: ≥ 6 attestations, answer key ≥ 4, no unattributed Prophet ﷺ dialogue,
no Jibril embodiment, paper mushaf not screen, no brain-function attribution,
no student photos, no CJK glyphs, no unverified URLs, and a **P2 status line**
("مسوّدة لم تُجرَّب صفيًا" — draft, not classroom-tested) in every document.

### 1.2 The Quranic-root axis (`الجذور القرآنية`) is the pedagogical spine

Not decoration. Each unit names **three-letter roots** and a تدبر link, e.g. Grade 4 Unit 1
(الخوارزميات والحساب وإدارة الموارد):

- roots **ح-س-ب**, **ق-د-ر**, **ع-د-د**
- verse anchor: «مَن جَاءَ بِالْحَسَنَةِ فَلَهُ عَشْرُ أَمْثَالِهَا» [الأنعام: 160] and
  «وَاللَّهُ يُضَاعِفُ لِمَن يَشَاءُ» [البقرة: 261] — the multiplicative-comparison concept
- the lesson even models the *methodological caution*: «الآية ليست وصفًا لخوارزمية القسمة»
  (the verse is not a description of the division algorithm) — i.e. **the maths may not be
  read back into the verse.** This is an explicit anti-overreach rule we must copy.

### 1.3 Grade 4 scope ceiling (from `موازي — منهج ومشاريع السنة الرابعة` spreadsheet)

Grade 4 Unit 1 maths scope is **الأعداد الكبيرة حتى الملايين** (numbers to the **millions**),
long division, multiples/factors (ق.م.أ / م.م.أ), and **مبادئ التفكير الجبري** (algebraic thinking).
Place value therefore goes to **1,000,000+**, not 100,000.

---

## 2. Conformance table — what we built vs. what is required

| Requirement | Status in G1–G4 builds | Evidence |
|---|---|---|
| Quranic verse anchor (الآية) | **ABSENT** | 0/40 sources contain any آية or Quranic text |
| Quranic roots (ح-س-ب / ع-د-د / ق-د-ر) | **ABSENT** | `grep` for `الجذور`, `تدبر` → 0 hits, 0/40 |
| Story frame (القصة) | **PARTIAL** | each game has a thematic setting + `welcome`, but no prior-learning link section |
| ≥ 5 objectives | **PARTIAL** | one `objective` string per game; never 5 stated objectives |
| 9 subject tracks (المسارات) | **ABSENT** | no cross-subject track layer at all |
| 3 stations × 3 levels | **PARTIAL** | 3 `levels[]` exist and are differentiated by difficulty, but they are not lesson *stations* and carry no station framing |
| 7-block time sequence | **ABSENT** | `band` sets rounds/timer only; no 70-min block structure |
| Exit card ≥ 4 items أ–هـ + success criterion | **ABSENT** | `finale` is a trophy screen, not an exit card |
| Homework ≥ 2 items (الواجب) | **ABSENT** | no homework surface anywhere |
| Review/reflection (المراجعة) | **ABSENT** | `praise[]` is reinforcement, not reflection |
| P2 status line | **ABSENT** | 0/40 sources and 0/4 hubs carry "مسوّدة لم تُجرَّب صفيًا" |
| no_brain_claim | **PASS** | 0 hits for الدماغ/المخ/brain |
| No student photos / no network | **PASS** | offline self-contained HTML, no remote assets |
| Standards alignment (CCSS codes) | **PASS** | codes carried per game (e.g. 4.NBT.B.5, 4.NF.A.1) |
| Grade-4 place-value ceiling to millions | **FAIL** | `09-dune-place` tops out at 100,000 |

---

## 3. The one substantive content error

`games/grade4/src/09-dune-place.js` is built to **100,000 (مئة ألف)**. The Grade 4 scope
requires **حتى الملايين** — so the game teaches one full place-value tier below the standard.
`SCENE4.placeChart4` is a fixed 5-column chart and will need a 6th (hundred-thousands) and
7th (millions) column to close the gap.

---

## 4. What is genuinely sound and should be kept

- Engine contract and the verbatim Fikr template are untouched — correct.
- QA bar (18 rounds, 3 level dialogs, 4 learn slides with 2 gates, ≥1 star/level, trophy,
  no console errors, no network) is a real quality floor and worth keeping.
- The misconception naming (`factor-one-pair`, `frac-add-den`, `pv-more-digits-wins`, …) is
  genuinely good pedagogy and maps well onto the differentiation-level requirement.
- Settings/story motifs (carpet workshop, pearl divers, falcon, majlis, halala farms,
  pigeon loft, ridge angles) are appropriate and reusable as **station narratives**.

---

## 4b. Status after the follow-up commit(s)

The user chose **"both A and B"**: wrap the existing games with the lesson frame, *and* key each one to the
canonical lesson documents rather than invented objectives. What has landed so far:

| Item | Before | Now |
|---|---|---|
| Lesson frame rendered in-game | none | `shared/lesson.js` renders all ten sections, collapsed below the play cards, at 390–900 px |
| P2 status line | 0 / 40 | **40 / 40**, above the fold, never hidden behind the expander |
| Quranic verse anchor | 0 / 40 | **40 / 40**, via 12 unit anchors |
| Quranic roots | 0 / 40 | **40 / 40** (2–3 roots per unit) |
| Anti-overreach caution | absent | **every unit** carries one, matching the source lessons |
| ≥ 5 objectives | 1 per game | **5 per game = 195 stated objectives** |
| 3 stations with differentiation notes | levels only | **3 per game, reframed as محطات** |
| Exit card ≥ 4 items أ–هـ + criterion | absent | **4 + criterion, 40 / 40** |
| Homework ≥ 2 items | absent | **2 per game, screen-free, 40 / 40** |
| Reflection | absent | **40 / 40** |
| 7-block time sequence | absent | present for every game |
| Grade 4 place value to millions | 100,000 ❌ | **to 7 digits ✅** |
| Hero art coverage | 17 / 40 | **40 / 40**, with a neutral fallback instead of another grade's scene |
| Emoji → icon coverage | 105 glyphs | **115 glyphs; 0 unmapped** (8 Grade-4 glyphs were rendering as tofu boxes) |

Verification: **40/40 frames clean** at 390 px (verse, roots, 5 objectives, 3 stations, 4 exit items,
2 homework items, reflection present; P2 visible; play cards above the frame; no console errors; no
network requests) and **40/40 games still pass the game harness** (18/12 rounds, 3 level dialogs,
4 learn slides with 2 gates, ≥1 star per level, trophy).

### Still open — said plainly

- **المسارات (9 subject tracks)** is not rendered. The games are a single-subject practice layer, and I did
  not want to invent nine tracks per game; this belongs to the lesson shell at unit level, not per game.
- **One game per lesson document** is not yet true. Grade 4 has seven real lesson docs but the games are
  still organised by objective. Coarse unit codes (G04-U01, G04-U02) are used where a specific lesson code
  does not exist; only `01-carpet-workshop` cites a real document code (G04-U01-MATH-L02).
- **Verse attribution** uses well-established wording from the Uthmani mushaf, but the unit→verse mapping is
  my pedagogical judgment, not a citation from the folder. It needs a scholarly pass before classroom use —
  the P2 line says exactly this.
- Grades 5–12 are unbuilt.

## 5. Recommended resolution (needs a decision before more authoring)

Option A — **Wrap, don't rebuild.** Keep the 40 existing games as the *practice/station layer*
and add a thin lesson-shell around each: verse anchor + roots + story + 5 objectives +
exit card + homework + reflection + P2 line. Cheapest path to conformance; reuses all QA work.

Option B — **Re-scope to the canonical lesson list.** Author one game per *actual* lesson
document (G04-U01-MAT-L01, G04-U01-L02, …) instead of one per invented objective. Highest
fidelity; discards the current Grade 4 objective map.

Option C — **Both, phased.** Ship Option A for G1–G4 to make what exists conformant, then
adopt Option B for G5–G12 where nothing is built yet.

**Recommendation: Option C.** It preserves ~40 games of completed, QA-clean work, makes the
claim boundary honest immediately (P2 line), and stops the drift from repeating at G5–G12.

---

## 6. Claim boundary (unchanged and now enforced)

> Draft-aligned prototypes. Not curriculum-approved, not classroom-tested (P2).
> Standards-aligned at the CCSS level. Quranic anchors and lesson-frame sections are
> added for pedagogical framing and do **not** constitute religious ruling or tafsir.

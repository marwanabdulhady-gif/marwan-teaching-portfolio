# Mowazi lesson model — adopted working scope

**Updated:** 17 November 2026  
**Purpose:** translate the current Drive curriculum and lesson-design references into a practical authoring contract for this repository. The Google Drive source remains authoritative; this file is a developer-facing summary, not an approval of curriculum content.

## Product boundary

MathsLab remains a mathematics-focused web repository. The Drive folder describes the broader Mowazi K–9 learning system: nine subjects, annual maps, integrated projects, lesson packages, games, and visual references. Do not silently turn this repository into a mirror of the whole Mowazi system or claim that its current games are approved Mowazi lessons.

The work in this repository has two layers:

1. **Curriculum lesson** — a coherent, age-appropriate learning story with a specific curriculum position, teacher/family supports, materials, assessment, and review state.
2. **Digital math activity** — a short, offline-capable practice or exploration that supports one identified math objective inside (or alongside) that lesson. A game is not, by itself, the full 60–70-minute integrated lesson package.

Keep the existing K–12 MathsLab material available. For new early-years content, the near-term implementation focus is Kindergarten and Grade 1; Grade 1 is the first curriculum-mapping pilot. Do not begin bulk authoring for all nine grades or all nine subjects until the pilot structure and review process are agreed.

## Lesson structure to use

### 1. Curriculum address and status

Every source-backed lesson gets a stable address such as `G01-U03-L13` (grade, unit, lesson). Record the subject strand(s), source curriculum/map, version/date, prerequisites, age band, estimated duration, and evidence status. Never infer a lesson code from a game topic alone.

Use the source's sequential review gates, `P0` through `P6`: outline → first draft → complete lesson pack → content review → age/accessibility/design review → classroom trial → owner approval. Do not skip gates or equate a structurally complete draft (`P2`) with classroom-tested or curriculum-approved material (`P5`/`P6`). Dates, citations, reviews, and approvals must be traceable.

### 2. One inquiry story per unit, one clear objective per lesson

A unit is a connected learning story, not merely a row of five unrelated worksheets. Start from a meaningful question or observable situation; sequence the lessons so learners move from noticing and wondering, to evidence and explanation, to a useful product or demonstration. Each individual lesson still needs a small number of measurable objectives and one main mathematical idea.

For Grade 1, the source model is for ages 6–7 and describes four integrated units with a sequence of lessons, within the annual timetable. The integrated work is embedded in that timetable; it is not extra instructional time added on top. Confirm the live annual map before assigning a lesson to a particular slot.

### 3. Repeatable lesson-pack template

Each full lesson pack should include:

- **Identity:** lesson code/title, unit and big question, subject role(s), age, duration, prerequisites, version, and current P0–P6 status.
- **Purpose:** 2–3 measurable core outcomes, relevant curriculum references, and the evidence a teacher should see or hear.
- **Opening:** a short, concrete question or story from a child's world; identify prior knowledge without giving away the conclusion.
- **Teach and explore:** concise modelling/think-aloud, then a safe, low-cost hands-on investigation or making task. Make clear what the adult prepares and what the child actually does.
- **Represent and explain:** connect objects/actions to drawings, diagrams, tables, words, and only then symbols as appropriate to age and objective (concrete → pictorial → abstract, not a forced worksheet ladder).
- **Practice and transfer:** a few purposeful attempts, feedback for likely misconceptions, and a real-world or cross-subject use when it genuinely strengthens the objective.
- **Evidence and close:** formative check, a short learner explanation/reflection, expected responses or answer key, and any optional family follow-up.
- **Support and safety:** accessible alternatives, differentiation/support and extension, material/supervision notes, and a no-purchase home alternative.
- **Source integrity:** references for curriculum, factual/history/science claims, and religious material; qualified review is required where applicable. Do not invent quotations or present a thematic allusion as a verified source.

The nine subjects have distinct roles in an integrated unit (for example, mathematics contributes counting, measurement, data, and mathematical reasoning; science contributes investigation and explanation; language contributes communication). Include only the strands that serve the unit question—do not force all nine into every lesson.

### 4. Interactive activities and games

New digital activities should:

- have one plainly stated math objective and a visible relationship to a lesson code once that mapping has been checked against the live curriculum map;
- make the learner do the mathematical thinking (manipulate, compare, predict, measure, represent, explain), rather than reward rapid tapping;
- work without a timer, leaderboard, or competitive score; offer calm, specific retry feedback and a graduated hint ladder that prompts thinking rather than immediately exposing the answer;
- provide a physical/offline analogue where practical, use accessible controls and uncluttered visuals, and support Arabic RTL with concise functional English where bilingual delivery is intended;
- identify misconceptions and provide a teacher-readable success/evidence signal without turning the activity into a high-stakes test.

This is the target for newly authored Mowazi-style activities. Existing MathsLab/Fikr mini-games have their own stars/levels mechanic and are retained as prototypes/legacy practice, not retroactively labelled as compliant full lessons. A future redesign should be deliberate and separately tested.

## Current work and next scope

| Workstream | Scope now | Not implied |
|---|---|---|
| Existing MathsLab | Preserve the course, question, and game experiences already in the site. | Not a complete K–9 Mowazi curriculum. |
| Kindergarten | Preserve the bilingual, story-led KG Math Garden with its 17 existing activities. In the separate Fikr lesson-game kit, retain Date Basket and add Oasis Pattern Path as a second K game (one-to-one counting to 10; noticing/continuing repeating patterns). | These are interactive prototypes, not approved curriculum lesson packs; no verified map codes are assigned here. |
| Grade 1 | Keep Ten-Seat Dhow, Corniche Clock Tower, and Corniche Ruler as playable math prototypes; map each to an authoritative Grade 1 math objective before claiming alignment. | Not a substitute for the unit sequence, teacher guide, 20 integrated lessons, or annual timetable. |
| Next authoring increment | Validate the Grade 1 math map, select one lesson code, write its complete lesson pack and evidence checklist, then build/adjust only the supporting activity. Pilot and review before expanding. | No automatic generation of all 180 annual lesson slots, all grade folders, or all nine subjects. |
| Drive visual library | Use a small, lesson-specific, rights/quality-checked selection when needed. | Do not vendor all 180 large visual-library assets or whole presentation decks into this repository by default. |

### Mapping gate for the current Grade 1 prototypes

The Grade 1 source documents identify the intended age, unit-story design, annual structure, and staged review process, but the current three game records do not yet carry verified `Gxx-Uyy-Lzz` mappings. Treat their lesson-code mapping as **pending** until checked against the current math map and reviewed by the curriculum owner. The Clock Tower and Ruler names are contextual prototypes, not proof of standards alignment or approval.

## Source documents

See [`drive-reference-index.md`](drive-reference-index.md) for the linked Drive folders and documents used to prepare this scope. Keep Drive as the canonical home for the complete source set; add only the specific lesson brief, approved text, and assets that the repository actually uses.
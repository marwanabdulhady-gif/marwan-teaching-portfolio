# Later improvements

Things deliberately taken off the live site until they are ready. Nothing here
is deleted: the code stays in the repo so it can be picked up again.

## AI Teacher Studio (parked 2026-11-10)

**What it is:** `src/components/AiTeacherStudio.tsx`, with its data in
`src/academyData.ts` (`AI_STUDIO_UI`, `STUDIO_TOOLS`, `STUDIO_PRESETS`) and
sample images in `public/studio/`. Six creation workflows (Interactive Lab
Builder, Lesson Planner, Presentation Studio, Educational Game Creator,
Whiteboard Animation, 3D & Educational Video).

**Why it is parked:** it is not actually functional. It presents itself as a
tool that creates lessons, labs, decks and games, but it does not generate
any of them. Marwan asked for it to come off the page until it works.

**What was changed to park it:**

- Not rendered on the home page (`HomePage` in `src/TeachingApp.tsx`).
- "AI Studio" removed from the nav (`NAV_ITEMS`) and from `HOME_SECTIONS`.
- Chapter 04 is now "EdTech Designs" only; the guide button says the same.
- Its entries are filtered out of search (`SearchPalette.tsx`).
- `npm run qa:home` checks that it stays off the page and out of the nav.

**To bring it back:**

1. Make it do what it says: each workflow should produce a real, usable
   output (or be honestly described as a prompt builder, if that is the
   intended scope).
2. Re-add `<AiTeacherStudio />` after `<LearningDesigns />`, the nav item, the
   `studio` entry in `HOME_SECTIONS` and `SECTION_PAGE` (`src/router.tsx`), and
   remove the search filter.
3. Update the two "parked" checks in `scripts/check-home.cjs`.

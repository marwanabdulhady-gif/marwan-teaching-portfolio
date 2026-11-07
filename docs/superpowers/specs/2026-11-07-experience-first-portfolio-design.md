# Experience-first portfolio: design

Date: 2026-11-07 · Status: draft for review

## 1. Intent

Marwan wants a visitor (school leader, parent, student, fellow educator) to
meet his **teaching track record first**, and the whole site to feel better
organized and easier to move through.

**Said by Marwan:** "improve the UI/UX, prioritize my experience, organize how
the portfolio is structured". Chosen option: *Teaching track record first*,
directly under the hero and credentials, ahead of philosophy and the gallery.

**Assumptions (correct me):**

- Restructure and polish; do not rebuild. Keep React/Vite, the bilingual
  EN/AR data model (`{ en, ar }` in `src/teachingData.ts`), the chalkboard look,
  the 8 themes × 3 sizes, search, routes (`/`, `/courses`, `/games`) and the
  `npm run qa` suite.
- Courses, Games, the Studio, the Supabase live rooms and the
  `drmathazzam-clone` folder are out of scope.

**Success:** after the hero and credentials strip, the first full section is
the experience timeline; every moved block still works in English and Arabic
(RTL) at phone and desktop widths; `npm run qa` passes.

## 2. Current state (verified in code)

Home page order (`src/TeachingApp.tsx`, `HomePage`): `TeachHero` →
`CredentialsBar` → `PortfolioDirectory` → Ch.01 banner → `TeachAbout`
(`#about`) → `ClassroomGallery` (`#gallery`) → `Experience` (`#experience`) →
links to `/courses` and `/games` → Ch.04 banner → `LearningDesigns`
(`#designs`) → `AiTeacherStudio` (`#studio`) → `WorkWithMe` (`#work`).

`HOME_SECTIONS` maps `about`, `gallery` and `experience` to the `about` nav item
for scrollspy. `PortfolioDirectory` pillar 01 scrolls to `#about`.
`Experience.tsx` renders every role as a full card with all photos always
visible, so the section is long on a phone.

## 3. Design

### 3.1 New home-page order

1. `TeachHero`
2. `CredentialsBar`
3. **Chapter 01 banner, retitled "Teaching Track Record"**
4. **`Experience`** (`#experience`): stats row, results headline, timeline
5. `TeachAbout` (`#about`, philosophy)
6. `ClassroomGallery` (`#gallery`, 6 facets)
7. `PortfolioDirectory` (the 4-chapter guide), moved below proof
8. Links to `/courses` and `/games`
9. Ch.04 banner, `LearningDesigns`, `AiTeacherStudio`
10. `WorkWithMe`

The Ch.01 banner's quick links become: Timeline (`experience`), Philosophy
(`about`), 6 Facets (`gallery`). The banner subtitle is reworded to lead with
the school track record.

### 3.2 Experience section (`src/components/Experience.tsx`)

- **At-a-glance stats row** above the results headline. Values are **derived
  from `EXPERIENCE.roles`**, not hard-coded: number of named schools, the
  earliest start year ("teaching since 2019"), and the exam-results headline.
  No figure is shown that the data cannot back.
- **Results headline** stays (A* in Edexcel, CIE, SAT, ACT, EST).
- **Timeline cards become disclosure cards.** Collapsed: school, role, years.
  Expanded ("Show details"): detail text and photos. The most recent role
  (`fikr`) opens by default. Implemented with a native `button` using
  `aria-expanded` / `aria-controls`; no new dependency.
- **Closing call-to-action** after the timeline: a button to `#work`
  ("Work with me").
- Photos keep `loading="lazy"`. Collapsed cards do not render `img` tags, so
  collapsed content costs no image requests.

### 3.3 Navigation, directory, search, docs

- `NAV_ITEMS` order and `HOME_SECTIONS` follow the new section order. The
  scrollspy map changes to `experience → about(nav)`, `about → about(nav)`,
  `gallery → about(nav)`; the first nav item that points at Chapter 01 targets
  `#experience`.
- `PortfolioDirectory` pillar 01 targets `#experience`, with its summary
  reworded to lead with the school timeline.
- `SearchPalette` entries for Chapter 01 are checked and reordered so
  Experience results appear first; `check-search.cjs` is updated if it asserts
  an order.
- `README.md` chapter table is updated to the new order.

### 3.4 UX polish (scoped to touched components)

- Touch targets at least 44×44 px for the new disclosure buttons and CTA.
- Visible `:focus-visible` outlines using existing theme tokens.
- Spacing and type scale taken from existing tokens in `src/index.css` /
  `src/teaching.css`; no new colours.
- `prefers-reduced-motion`: the disclosure expand does not animate; `Reveal`
  behaviour is unchanged.
- RTL: logical properties only (`ps-`, `start-`, `text-start`), matching the
  existing timeline.

## 4. Open question for Marwan

`PortfolioDirectory` shows "**12+ Years · 3 Curricula**" for Chapter 01, but
the timeline data starts in **2019** (about 7 years). The stats row will use
the data. Please confirm the correct figures and which curricula to name (for
example British, American Diploma, national); until then the directory chip
is changed to a data-backed wording ("Teaching since 2019") rather than left
as an unverifiable claim.

## 5. Testing

- `npm run qa` (lint, data, practice, search, progress, theme, render, bundle).
- `render-check.cjs` / `check-bundle.cjs`: confirm the bundle budget in
  `scripts/bundle-budget.json` still holds (no new dependencies expected).
- Manual check with Playwright screenshots of `/` in EN and AR at 390 px and
  1280 px: order, RTL alignment, disclosure open/close, keyboard operation.
- Deep links still work: `/#experience`, `/#about`, `/#gallery`, `/#work`.

## 6. Out of scope

Courses, Games and Studio pages; Supabase rooms; new themes; copy rewrites
beyond the labels named above; the `drmathazzam-clone` folder.

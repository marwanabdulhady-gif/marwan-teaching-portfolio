# Experience-First Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the teaching track record the first full section after the hero and credentials, and tidy the home page's structure and navigation around it.

**Architecture:** Reorder `HomePage` in `src/TeachingApp.tsx`, extract the scrollspy map into a small testable module, derive the new at-a-glance stats from `EXPERIENCE` data via a pure helper, and turn timeline cards into accessible disclosure cards. A new Node QA script (`scripts/check-home.cjs`, esbuild bundle + `renderToStaticMarkup`, same pattern as `render-check.cjs`) pins the order, data-derived stats, and EN/AR markup.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind v4, lucide-react, Node QA scripts with esbuild.

**Spec:** `docs/superpowers/specs/2026-11-07-experience-first-portfolio-design.md`

## Global Constraints

- No new runtime dependencies; `scripts/bundle-budget.json` (`eagerGzKb` 248, `maxGrowthKb` 40) must still pass.
- All copy is bilingual `{ en, ar }` and lives in `src/teachingData.ts`; no hard-coded stats.
- RTL-safe: logical utilities only (`ps-`, `start-`, `text-start`), as in the existing timeline.
- No new colours: use `--t-*` tokens from `src/index.css`.
- Touch targets at least 44×44 px; visible `:focus-visible` outline from existing tokens.
- Expand/collapse does not animate (`prefers-reduced-motion` safe); `Reveal` unchanged.
- Out of scope: `/courses`, `/games`, Studio, Supabase rooms, `drmathazzam-clone/`.
- Directory chip must not claim "12+ Years · 3 Curricula"; use "Teaching since 2019" / `أدرّس منذ ٢٠١٩` until Marwan confirms figures.
- Verified no-op: `SearchPalette.tsx` indexes only lessons, games and studio tools, with no Chapter 01 entries, so spec §3.3's search item needs no change.

## Review Focus

1. **Arabic locale:** stats digits, toggle labels and CTA render in Arabic with no English strings leaking (Task 2 test).
2. **Keyboard/AT:** toggles are real `<button type="button">` with `aria-expanded` and `aria-controls` pointing at an existing panel; collapsed panels are `hidden` (Task 2 test).
3. **Role with no detail and no photos:** no toggle is rendered (Task 1 `hasDetails` test, Task 2 render test).
4. **Empty or malformed data:** `experienceStats([])` and an unparseable `years` string give `sinceYear: null`, and the tile is hidden rather than showing `NaN` (Tasks 1 and 2 tests).
5. **Scrollspy and nav drift:** every nav item id on the home page is a `navId` in `HOME_SECTIONS`, and the first nav item targets `experience` (Task 3 test). Bundle budget still holds (Task 4).

---

### Task 1: Data-derived stats, section map and the QA harness

**Files:**
- Create: `src/experienceStats.ts`, `src/homeSections.ts`, `scripts/check-home.cjs`
- Modify: `src/teachingData.ts` (`EXPERIENCE`), `package.json` (scripts `qa:home`, add to `qa`), `src/TeachingApp.tsx` (import `HOME_SECTIONS` instead of declaring it)

**Interfaces:**
- Produces:
  - `experienceStats(roles: readonly { years: string; kind: 'school' | 'practice' }[]): { schools: number; sinceYear: number | null }`: `schools` counts `kind === 'school'`; `sinceYear` is the minimum 4-digit year found at the start of any `years` string, else `null`.
  - `hasDetails(role: { detail?: unknown; photos: readonly unknown[] }): boolean`: true when `detail` is truthy or `photos.length > 0`.
  - `HOME_SECTIONS: { id: string; navId: string }[]` in `src/homeSections.ts` (same shape as today).
  - `EXPERIENCE.kind` on every role: `'school'` for `fikr`, `andalus`, `mhs`, `ris`; `'practice'` for `exams`, `early`.
  - `EXPERIENCE.statLabels = { schools: Bi, since: Bi }` (`{en:'Schools',ar:'مدارس'}`, `{en:'Teaching since',ar:'أدرّس منذ'}`), `EXPERIENCE.cta: Bi` (`{en:'Work with me',ar:'اعمل معي'}`), `EXPERIENCE.showDetails: Bi`, `EXPERIENCE.hideDetails: Bi` (`Show details`/`Hide details`, `عرض التفاصيل`/`إخفاء التفاصيل`).

- [ ] **Step 1: Write `scripts/check-home.cjs`** modelled on `scripts/check-search.cjs`: esbuild-bundle an entry into `.qa-home` (git-ignored; remove afterwards), stub `localStorage`/`window` as `render-check.cjs` does, collect `failures`, exit 1 if any. First checks, all failing now:
  - `experienceStats(EXPERIENCE.roles)` equals `{ schools: 4, sinceYear: 2019 }`.
  - `experienceStats([])` equals `{ schools: 0, sinceYear: null }`; `experienceStats([{ years: 'n/a', kind: 'school' }])` equals `{ schools: 1, sinceYear: null }`.
  - `hasDetails({ photos: [] })` is false; `hasDetails({ detail: { en: 'x', ar: 'x' }, photos: [] })` is true; `hasDetails({ photos: [{}] })` is true.
  - Every role in `EXPERIENCE.roles` has `kind` of `'school'` or `'practice'`.
- [ ] **Step 2:** Add `"qa:home": "node scripts/check-home.cjs"` to `package.json` and insert `npm run qa:home` into `qa` after `qa:search`. Add `.qa-home` to `.gitignore`. Run `npm run qa:home`. Expected: FAIL (modules missing).
- [ ] **Step 3:** Implement `experienceStats` and `hasDetails` in `src/experienceStats.ts`; add the `kind` field and new label strings to `EXPERIENCE`; move the `HOME_SECTIONS` array verbatim into `src/homeSections.ts` and import it in `TeachingApp.tsx`.
- [ ] **Step 4:** Run `npm run lint && npm run qa:home`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: derive experience stats from data, add home QA script`.

### Task 2: Experience section with stats row and disclosure cards

**Files:**
- Modify: `src/components/Experience.tsx`, `scripts/check-home.cjs`

**Interfaces:**
- Consumes: `experienceStats`, `hasDetails`, `EXPERIENCE.*` from Task 1; `scrollToSection(id: string)` from `src/router.tsx`.
- Produces: default export `Experience` (unchanged name and `id="experience"`); internal `RoleCard` with a toggle `<button type="button" aria-expanded aria-controls="role-panel-{id}">` and a panel `<div id="role-panel-{id}" hidden={!open}>`. Stat tiles are `<dl>` entries with `data-stat="schools"` and `data-stat="since"`. CTA is `<button data-cta="work">`.

- [ ] **Step 1: Add failing render checks** to `check-home.cjs`. Render `Experience` inside `LocaleProvider` for each locale (set via the same mechanism `render-check.cjs` uses; if it has none, set `localStorage` `getItem` to return the locale key `LocaleContext.tsx` reads) and assert:
  - EN: markup has `data-stat="schools"` containing `4`, `data-stat="since"` containing `2019`, and the results headline text from `EXPERIENCE.results.en`.
  - Role `fikr` toggle has `aria-expanded="true"`; `andalus`, `mhs`, `ris`, `exams`, `early` have `aria-expanded="false"`.
  - Every `aria-controls` value matches an `id=` in the markup; panels for collapsed roles carry `hidden`.
  - Collapsed roles' photos are absent: markup does not contain `/photos/andalus-grad-podium.webp`.
  - The `fikr` detail text appears; the CTA `data-cta="work"` is present.
  - AR: `data-stat="since"` contains `٢٠١٩`; contains `EXPERIENCE.cta.ar` and `EXPERIENCE.showDetails.ar`; the string `Show details` does not appear.
  - A role with no detail and no photos gets no toggle: covered by the Task 1 `hasDetails` test, since every current role has detail or photos.
- [ ] **Step 2:** Run `npm run qa:home`. Expected: FAIL on the new checks.
- [ ] **Step 3: Implement** in `Experience.tsx`: stats row above the results headline (hide the `since` tile when `sinceYear` is `null`; format the year with `toLocaleString(isRtl ? 'ar-EG' : 'en', { useGrouping: false })`); `RoleCard` holding `useState(open)` initialised `true` only for the first role (`index === 0`); render the toggle only when `hasDetails(role)`; render photos only when open; CTA after the `<ol>` calling `scrollToSection('work')`. Toggle and CTA get `min-h-11`, and `focus-visible:outline` using `--t-accent`.
- [ ] **Step 4:** Run `npm run lint && npm run qa:home`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: experience stats row and collapsible timeline cards`.

### Task 3: Reorder the home page, nav, directory and links

**Files:**
- Modify: `src/TeachingApp.tsx`, `src/homeSections.ts`, `src/teachingData.ts` (`NAV_ITEMS`), `src/components/PortfolioDirectory.tsx`, `src/components/TeachFooter.tsx`, `src/components/TeachAbout.tsx`, `README.md`, `scripts/check-home.cjs`

**Interfaces:**
- Consumes: `HOME_SECTIONS` (Task 1), `Experience` (Task 2).
- Produces: new home order `TeachHero, CredentialsBar, ChapterBanner(01), Experience, TeachAbout, ClassroomGallery, PortfolioDirectory, PageLinks(/courses,/games), ChapterBanner(04), LearningDesigns, AiTeacherStudio, WorkWithMe`; `HOME_SECTIONS` order `hero, experience, about, gallery, designs, studio, work` with `navId` `experience` for `experience`/`about`/`gallery`; `NAV_ITEMS[0] = { id: 'experience', label: { en: 'Experience', ar: 'الخبرة' } }`.

- [ ] **Step 1: Add failing checks** to `check-home.cjs`:
  - Read `src/TeachingApp.tsx` and assert the character index of each tag in `HomePage` ascends in the order above (`<TeachHero`, `<CredentialsBar`, `<ChapterBanner`, `<Experience`, `<TeachAbout`, `<ClassroomGallery`, `<PortfolioDirectory`, `<PageLinks`, `<LearningDesigns`, `<AiTeacherStudio`, `<WorkWithMe`), searching within the `function HomePage` body only.
  - `HOME_SECTIONS.map(s => s.id)` equals `['hero','experience','about','gallery','designs','studio','work']`; `NAV_ITEMS[0].id === 'experience'`; every `NAV_ITEMS` id that is not a page route (`resources`, `lab`) appears as a `navId` in `HOME_SECTIONS`.
  - Render `PortfolioDirectory` in EN and AR: markup contains `Teaching since 2019` / `أدرّس منذ ٢٠١٩` and does not contain `12+`; source of `PortfolioDirectory.tsx` contains `targetId: 'experience'` for pillar `01` and no `targetId: 'about'`.
  - `TeachFooter.tsx` source has exactly one `id: 'experience'` entry-equivalent after the change (the nav spread supplies it, so the hard-coded extra entry is gone).
- [ ] **Step 2:** Run `npm run qa:home`. Expected: FAIL.
- [ ] **Step 3: Implement.** Reorder `HomePage`; retitle the Ch.01 banner to `Teaching Track Record` / `المسيرة التعليمية` with links Timeline (`experience`), Philosophy (`about`), 6 Facets (`gallery`) and a subtitle leading with the school track record; update `HOME_SECTIONS` and `NAV_ITEMS`; pillar 01 gets `targetId: 'experience'`, a summary that leads with the school timeline, and `meta: { en: 'Teaching since 2019', ar: 'أدرّس منذ ٢٠١٩' }`; remove the hard-coded `experience` entry from the footer list; in `TeachAbout.tsx` change the "School Track Record" button (it now scrolls upward) to scroll to `gallery` with label `6 Facets of Practice` / `أوجه الممارسة الستة`; update the README chapter table order and wording.
- [ ] **Step 4:** Run `npm run lint && npm run qa:home && npm run qa:theme && npm run qa:search`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: experience first on the home page, with nav and directory to match`.

### Task 4: Verify end to end

**Files:**
- Modify: only what failures require; otherwise none.

- [ ] **Step 1:** `npm install` if `node_modules` is missing, then `npm run qa`. Expected: all stages PASS, including `qa:bundle` within `scripts/bundle-budget.json`. If `qa:bundle` fails, remove whatever pushed the first paint over; do not raise the budget.
- [ ] **Step 2:** `npm run dev`, then with Playwright (`require('playwright')`, `chromium.launch()`) capture `/` at 390×844 and 1280×800 in EN and in AR (set the locale through the language toggle). Check: order after the hero is credentials → Chapter 01 banner → Experience stats → timeline; the first card is open and the others are closed; Arabic is right-aligned with no overflow; no horizontal scroll at 390 px.
- [ ] **Step 3:** In the same script, check keyboard use (Tab to a toggle, Space opens it, `aria-expanded` flips) and deep links `/#experience`, `/#about`, `/#gallery`, `/#work` each land on their section; nav "Experience" highlights while the timeline is on screen.
- [ ] **Step 4:** Confirm `.github/workflows/qa.yml` runs `npm run qa` (so `qa:home` runs in CI); if it lists scripts individually, add `qa:home`.
- [ ] **Step 5: Commit** any fixes: `fix: address end-to-end verification findings`. Then push `claude/upbeat-turing-qcxed2`.

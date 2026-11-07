import { useState } from 'react';
import { Award, ChevronDown, School } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { EXPERIENCE } from '../teachingData';
import { experienceStats, hasDetails } from '../experienceStats';
import { scrollToSection } from '../router';
import Reveal from './Reveal';

type Role = (typeof EXPERIENCE.roles)[number];

/** One timeline entry. Collapsed it is school, role and years; open it adds the detail and photos. */
function RoleCard({ role, startOpen }: { role: Role; startOpen: boolean }) {
  const { isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);
  const [open, setOpen] = useState(startOpen);
  const expandable = hasDetails(role);
  const panelId = `role-panel-${role.id}`;
  const detail = 'detail' in role ? role.detail : undefined;

  return (
    <article className="teach-card p-5 sm:p-7 text-start space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-[family-name:var(--teach-font-display)] text-xl sm:text-2xl font-black text-[var(--t-ink)]">{L(role.school)}</h3>
          <p className="text-sm font-semibold text-[var(--t-accent-deep)]">{L(role.role)}</p>
        </div>
        <span className="font-mono text-xs px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--t-ink)_6%,transparent)] text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">
          {isRtl ? role.yearsAr : <span dir="ltr">{role.years}</span>}
        </span>
      </div>

      {expandable && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 min-h-11 px-3 -mx-3 rounded-full text-sm font-semibold text-[var(--t-accent-deep)] cursor-pointer bg-transparent border-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--t-accent)]"
        >
          {open ? L(EXPERIENCE.hideDetails) : L(EXPERIENCE.showDetails)}
          <ChevronDown className={`w-4 h-4 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      )}

      {expandable && (
        <div id={panelId} hidden={!open} className="space-y-4">
          {open && detail && (
            <p className="text-[0.9rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{L(detail)}</p>
          )}
          {open && role.photos.length > 0 && (
            <div className={`grid gap-3 ${role.photos.length > 2 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {role.photos.map((p) => (
                <figure key={p.src} className="space-y-1.5">
                  <img src={p.src} alt={L(p.caption)} loading="lazy" className="w-full aspect-[4/3] object-cover rounded-xl" />
                  <figcaption className="text-xs text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">{L(p.caption)}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/**
 * Where Marwan has taught: the first full section after the hero. An at-a-glance
 * stats row (derived from the timeline), the exam results as a headline, then
 * the schools and roles, newest first. The latest role opens by default.
 */
export default function Experience() {
  const { isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);
  const { schools, sinceYear } = experienceStats(EXPERIENCE.roles);
  const num = (n: number) => n.toLocaleString(isRtl ? 'ar-EG' : 'en', { useGrouping: false });

  const tiles: { name: string; label: { en: string; ar: string }; value: string }[] = [
    { name: 'schools', label: EXPERIENCE.statLabels.schools, value: num(schools) },
  ];
  if (sinceYear !== null) tiles.push({ name: 'since', label: EXPERIENCE.statLabels.since, value: num(sinceYear) });

  return (
    <section id="experience" className="relative py-14 md:py-20 px-5 lg:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-12">
        <Reveal className="text-center space-y-4">
          <p className="teach-eyebrow">{L(EXPERIENCE.tag)}</p>
          <h2 className="teach-section-title">
            {L(EXPERIENCE.titlePrefix)} <em>{L(EXPERIENCE.titleAccent)}</em>
          </h2>
          <div className="teach-divider" />
        </Reveal>

        {/* At a glance */}
        <Reveal>
          <dl className="grid grid-cols-2 gap-4">
            {tiles.map((tile) => (
              <div key={tile.name} data-stat={tile.name} className="teach-card p-5 text-start">
                <dd className="font-[family-name:var(--teach-font-display)] text-3xl sm:text-4xl font-black text-[var(--t-accent)]">{tile.value}</dd>
                <dt className="text-sm font-semibold text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{L(tile.label)}</dt>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* Results headline */}
        <Reveal>
          <div className="teach-card learn flex items-center gap-4 p-5 sm:p-6 text-start">
            <span className="teach-icon-chip !w-12 !h-12 shrink-0"><Award className="w-5 h-5" /></span>
            <p className="font-[family-name:var(--teach-font-display)] text-lg sm:text-2xl font-bold leading-snug text-[var(--t-ink)]">
              {L(EXPERIENCE.results)}
            </p>
          </div>
        </Reveal>

        {/* Timeline */}
        <ol className="relative space-y-6 ps-8 sm:ps-10 before:absolute before:top-2 before:bottom-2 before:start-[11px] sm:before:start-[15px] before:w-px before:bg-[color-mix(in_srgb,var(--t-accent)_35%,transparent)]">
          {EXPERIENCE.roles.map((r, i) => (
            <li key={r.id} className="relative">
              <span className="absolute -start-8 sm:-start-10 top-6 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[var(--t-accent)] text-white flex items-center justify-center shadow-lg shadow-[color-mix(in_srgb,var(--t-accent)_40%,transparent)]">
                <School className="w-3 h-3 sm:w-4 sm:h-4 text-[#fff]" />
              </span>
              <Reveal delay={i * 0.06}>
                <RoleCard role={r} startOpen={i === 0} />
              </Reveal>
            </li>
          ))}
        </ol>

        <div className="text-center">
          <button
            type="button"
            data-cta="work"
            onClick={() => scrollToSection('work')}
            className="teach-btn teach-btn-primary border-0 min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--t-accent)]"
          >
            {L(EXPERIENCE.cta)}
          </button>
        </div>
      </div>
    </section>
  );
}

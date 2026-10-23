import { Award, School } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { EXPERIENCE } from '../teachingData';
import Reveal from './Reveal';

/**
 * Where Marwan has taught: a timeline of schools and roles, newest first,
 * with photos where they exist and the exam results as a headline.
 */
export default function Experience() {
  const { isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);

  return (
    <section id="experience" className="relative py-24 md:py-32 px-5 lg:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-12">
        <Reveal className="text-center space-y-4">
          <p className="teach-eyebrow">{L(EXPERIENCE.tag)}</p>
          <h2 className="teach-section-title">
            {L(EXPERIENCE.titlePrefix)} <em>{L(EXPERIENCE.titleAccent)}</em>
          </h2>
          <div className="teach-divider" />
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
                <article className="teach-card p-5 sm:p-7 text-start space-y-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <h3 className="font-[family-name:var(--teach-font-display)] text-xl sm:text-2xl font-black text-[var(--t-ink)]">{L(r.school)}</h3>
                      <p className="text-sm font-semibold text-[var(--t-accent-deep)]">{L(r.role)}</p>
                    </div>
                    <span className="font-mono text-xs px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--t-ink)_6%,transparent)] text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">
                      {isRtl ? r.yearsAr : <span dir="ltr">{r.years}</span>}
                    </span>
                  </div>
                  {'detail' in r && r.detail && (
                    <p className="text-[0.9rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{L(r.detail)}</p>
                  )}
                  {r.photos.length > 0 && (
                    <div className={`grid gap-3 ${r.photos.length > 2 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      {r.photos.map((p) => (
                        <figure key={p.src} className="space-y-1.5">
                          <img src={p.src} alt={L(p.caption)} loading="lazy" className="w-full aspect-[4/3] object-cover rounded-xl" />
                          <figcaption className="text-xs text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">{L(p.caption)}</figcaption>
                        </figure>
                      ))}
                    </div>
                  )}
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

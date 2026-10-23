import { ArrowUpRight } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { RESOURCES, LINKS, mailto } from '../teachingData';
import Reveal from './Reveal';

/**
 * Mathematics Resource Library — the template's store grid, retitled and
 * re-stranded for mathematics. Cards point at LINKS.resources, so swapping in a
 * real storefront is a one-line change in teachingData.ts.
 */
export default function ResourceLibrary() {
  const { isRtl } = useLocale();

  /** Per-strand subject line, so an enquiry arrives pre-labelled. */
  const strandHref = (title: string) => mailto(`Resource Request — ${title}`);

  return (
    <section id="resources" className="relative py-24 md:py-32 px-5 lg:px-8 overflow-hidden bg-[color-mix(in_srgb,var(--t-bg-2)_28%,transparent)]">
      <div className="absolute bottom-0 end-0 w-[460px] h-[460px] rounded-full bg-cyan-500/[0.06] blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative space-y-12">
        {/* Heading */}
        <Reveal className="text-center space-y-4">
          <p className="teach-eyebrow">{isRtl ? RESOURCES.tag.ar : RESOURCES.tag.en}</p>
          <h2 className="teach-section-title">
            {isRtl ? RESOURCES.titlePrefix.ar : RESOURCES.titlePrefix.en}{' '}
            <em>{isRtl ? RESOURCES.titleAccent.ar : RESOURCES.titleAccent.en}</em>
          </h2>
          <div className="teach-divider" />
          <p className="teach-section-desc">{isRtl ? RESOURCES.desc.ar : RESOURCES.desc.en}</p>
        </Reveal>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Featured full-library card spans two columns on desktop */}
          <Reveal className="md:col-span-2 lg:col-span-3">
            <a
              href={LINKS.resources}
              className="teach-card group flex flex-col sm:flex-row items-start gap-5 p-7 !rounded-3xl !bg-[linear-gradient(145deg,color-mix(in_srgb,var(--t-accent)_14%,transparent)_0%,color-mix(in_srgb,var(--t-glass)_2%,transparent)_100%)]"
            >
              <span
                className="teach-icon-chip !w-16 !h-16 !text-2xl"
                style={{ background: 'linear-gradient(135deg, var(--t-accent), var(--t-accent-deep))' }}
                aria-hidden="true"
              >
                {RESOURCES.main.icon}
              </span>
              <div className="space-y-2 text-start">
                <h3
                  className="text-2xl sm:text-3xl font-black text-white"
                  style={{ fontFamily: 'var(--teach-font-display)' }}
                >
                  {isRtl ? RESOURCES.main.title.ar : RESOURCES.main.title.en}
                </h3>
                <p className="text-[0.9rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_65%,transparent)] max-w-3xl font-light">
                  {isRtl ? RESOURCES.main.desc.ar : RESOURCES.main.desc.en}
                </p>
                <span className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-cyan-300 uppercase tracking-[0.1em] pt-1">
                  {isRtl ? RESOURCES.main.cta.ar : RESOURCES.main.cta.en}
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </a>
          </Reveal>

          {RESOURCES.strands.map((strand, i) => (
            <Reveal key={strand.id} delay={0.06 * (i % 3)}>
              <a
                href={strandHref(strand.title.en)}
                className="teach-card block h-full p-6 text-start group"
              >
                <span
                  className="teach-icon-chip mb-5"
                  style={{ background: strand.gradient }}
                  aria-hidden="true"
                >
                  {strand.icon}
                </span>
                <h3 className="text-[1.05rem] font-bold text-white mb-2 leading-snug">
                  {isRtl ? strand.title.ar : strand.title.en}
                </h3>
                <p className="text-[0.82rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_60%,transparent)] font-light mb-5">
                  {isRtl ? strand.desc.ar : strand.desc.en}
                </p>
                <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-cyan-300 uppercase tracking-[0.1em] group-hover:gap-2.5 transition-all">
                  {isRtl ? 'تصفح المجموعة' : 'Browse Collection'}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

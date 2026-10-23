import { useLocale } from '../LocaleContext';
import ThreeDGeometry from './ThreeDGeometry';
import { ABOUT, HERO_STATS, LINKS } from '../teachingData';
import { Motif } from './MathArt';
import Reveal from './Reveal';

/**
 * About. The template used a three-image character mosaic; here the mosaic is
 * built from live mathematical constructions instead, including the existing
 * interactive icosahedron canvas from the corporate portfolio.
 */
export default function TeachAbout() {
  const { isRtl } = useLocale();

  return (
    <section id="about" className="relative py-24 md:py-32 px-5 lg:px-8 overflow-hidden">
      {/* Ambient wash */}
      <div className="absolute top-1/4 start-0 w-[420px] h-[420px] rounded-full bg-cyan-500/[0.07] blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Heading */}
        <Reveal className="text-center space-y-4 mb-14">
          <p className="teach-eyebrow">{isRtl ? ABOUT.tag.ar : ABOUT.tag.en}</p>
          <h2 className="teach-section-title">
            {isRtl ? ABOUT.titlePrefix.ar : ABOUT.titlePrefix.en}{' '}
            <em>{isRtl ? ABOUT.titleAccent.ar : ABOUT.titleAccent.en}</em>
          </h2>
          <div className="teach-divider" />
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] gap-10 lg:gap-16 items-center">
          {/* Mosaic — replaced character art with generated constructions */}
          <div className="grid grid-cols-2 gap-4">
            <Reveal from="start" className="row-span-2">
              <div data-theme="dark" className="teach-card chalk h-full min-h-[420px] flex flex-col justify-between p-4">
                <div className="flex-1 min-h-0 rounded-2xl overflow-hidden">
                  <ThreeDGeometry />
                </div>
                <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_50%,transparent)] mt-3 leading-snug text-start">
                  {isRtl ? ABOUT.mosaic[0].ar : ABOUT.mosaic[0].en}
                </p>
              </div>
            </Reveal>

            <Reveal from="end" delay={0.12}>
              <div data-theme="dark" className="teach-card chalk p-4 flex flex-col gap-3 h-full">
                <div className="rounded-xl bg-[color-mix(in_srgb,var(--t-accent)_6%,transparent)] p-2">
                  <Motif name="curve" className="w-full h-auto" />
                </div>
                <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_50%,transparent)] leading-snug text-start">
                  {isRtl ? ABOUT.mosaic[1].ar : ABOUT.mosaic[1].en}
                </p>
              </div>
            </Reveal>

            <Reveal from="end" delay={0.24}>
              <div data-theme="dark" className="teach-card chalk p-4 flex flex-col gap-3 h-full">
                <div className="rounded-xl bg-[color-mix(in_srgb,var(--t-sun)_6%,transparent)] p-2">
                  <Motif name="conics" className="w-full h-auto" />
                </div>
                <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_50%,transparent)] leading-snug text-start">
                  {isRtl ? ABOUT.mosaic[2].ar : ABOUT.mosaic[2].en}
                </p>
              </div>
            </Reveal>
          </div>

          {/* Copy */}
          <div className="space-y-7 text-start">
            <Reveal delay={0.1}>
              <p className="text-[0.95rem] sm:text-[1.02rem] leading-[1.85] text-[color-mix(in_srgb,var(--t-ink)_75%,transparent)] font-light">
                {isRtl ? ABOUT.bio1.ar : ABOUT.bio1.en}
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="text-[0.95rem] sm:text-[1.02rem] leading-[1.85] text-[color-mix(in_srgb,var(--t-ink)_75%,transparent)] font-light">
                {isRtl ? ABOUT.bio2.ar : ABOUT.bio2.en}
              </p>
            </Reveal>

            {/* Stats */}
            <Reveal delay={0.3}>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {HERO_STATS.map((stat) => (
                  <div
                    key={stat.value}
                    className="teach-card !rounded-2xl px-5 py-5 text-center"
                  >
                    <p
                      className="text-3xl sm:text-4xl font-black text-cyan-400 leading-none"
                      style={{ fontFamily: 'var(--teach-font-display)' }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-[0.6rem] uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--t-ink)_50%,transparent)] mt-2 leading-tight">
                      {isRtl ? stat.label.ar : stat.label.en}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.4}>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={LINKS.resources}
                  className="teach-btn teach-btn-primary"
                >
                  {isRtl ? ABOUT.cta.ar : ABOUT.cta.en}
                </a>
                <a
                  href={LINKS.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="teach-btn teach-btn-secondary"
                >
                  LinkedIn
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

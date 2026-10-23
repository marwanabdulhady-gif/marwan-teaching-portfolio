import { motion } from 'motion/react';
import { ArrowRight, Linkedin } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { HERO, HERO_STATS, LINKS } from '../teachingData';
import { MathConstellation } from './MathArt';

/**
 * Hero. Mirrors the template's layout (badge → split title → name block →
 * copy → CTAs, with a floating visual opposite) but the portrait is replaced
 * by live mathematical line-work.
 */
export default function TeachHero() {
  const { isRtl } = useLocale();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = (window as any).__lenis;
    if (lenis) lenis.scrollTo(el, { offset: -92 });
    else window.scrollTo({ top: el.offsetTop - 92, behavior: 'smooth' });
  };

  return (
    <header id="hero" data-theme="dark" className="relative bg-(--t-bg) min-h-[100svh] flex items-center pt-[100px] pb-16 px-5 lg:px-8 overflow-hidden">
      {/* Layered background */}
      <div className="teach-hero-bg absolute inset-0 -z-20" />
      <div className="teach-grid-bg absolute inset-0 -z-10" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Copy */}
        <div className="space-y-6 text-start">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[color-mix(in_srgb,var(--t-accent)_10%,transparent)] border border-[color-mix(in_srgb,var(--t-accent)_28%,transparent)] backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 teach-anim-pulse-dot" />
            <span className="text-[0.62rem] sm:text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cyan-300">
              {isRtl ? HERO.badge.ar : HERO.badge.en}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="teach-section-title !text-[clamp(2.6rem,7vw,4.6rem)] !leading-[0.98]"
          >
            {isRtl ? HERO.titleLine1.ar : HERO.titleLine1.en}
            <br />
            <em>{isRtl ? HERO.titleLine2.ar : HERO.titleLine2.en}</em>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-1"
          >
            <p className="text-[0.8rem] uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--t-ink)_50%,transparent)] font-medium">
              {isRtl ? HERO.subtitle.ar : HERO.subtitle.en}
            </p>
            <p
              className="text-2xl sm:text-3xl font-black text-cyan-300"
              style={{ fontFamily: 'var(--teach-font-display)' }}
            >
              {isRtl ? HERO.name.ar : HERO.name.en}
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-[0.92rem] sm:text-[1rem] leading-[1.8] text-[color-mix(in_srgb,var(--t-ink)_68%,transparent)] font-light max-w-xl"
          >
            {isRtl ? HERO.desc.ar : HERO.desc.en}
          </motion.p>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 pt-5 pb-1 border-y border-[color-mix(in_srgb,var(--t-accent)_16%,transparent)]"
          >
            {HERO_STATS.map((stat) => (
              <div key={stat.value} className="space-y-1">
                <p
                  className="text-3xl sm:text-4xl font-black text-cyan-400 leading-none"
                  style={{ fontFamily: 'var(--teach-font-display)' }}
                >
                  {stat.value}
                </p>
                <p className="text-[0.62rem] sm:text-[0.68rem] uppercase tracking-[0.1em] text-[color-mix(in_srgb,var(--t-ink)_50%,transparent)] leading-tight">
                  {isRtl ? stat.label.ar : stat.label.en}
                </p>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-3 pt-1"
          >
            <button onClick={() => scrollTo('work')} className="teach-btn teach-btn-primary">
              {isRtl ? HERO.ctaPrimary.ar : HERO.ctaPrimary.en}
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
            <button onClick={() => scrollTo('designs')} className="teach-btn teach-btn-secondary">
              {isRtl ? HERO.ctaSecondary.ar : HERO.ctaSecondary.en}
            </button>
            <a
              href={LINKS.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[0.78rem] text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)] hover:text-cyan-300 transition-colors ms-1"
            >
              <Linkedin className="w-3.5 h-3.5" />
              LinkedIn
            </a>
          </motion.div>
        </div>

        {/* Portrait in an arch, the math constellation glowing behind it.
            Phones: shown first, above the copy. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative order-first lg:order-none mx-auto w-full max-w-[260px] sm:max-w-[340px] lg:max-w-[440px]"
        >
          <div className="absolute -inset-[18%] opacity-60 pointer-events-none" aria-hidden>
            <MathConstellation />
          </div>
          <div className="relative rounded-t-full rounded-b-[2rem] p-[3px] bg-gradient-to-b from-[var(--t-accent)] via-[var(--t-sun)] to-transparent shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]">
            <img
              src="/photos/headshot.webp"
              alt={isRtl ? 'الأستاذ مروان عبد الهادي' : 'Mr. Marwan Abdulhady'}
              className="block w-full aspect-[3/4] object-cover object-top rounded-t-full rounded-b-[1.85rem]"
            />
          </div>
          <span className="absolute -bottom-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1.5 text-[0.72rem] font-bold bg-[var(--t-sun)] text-[#14213d] shadow-lg">
            A* · Edexcel · CIE · SAT · ACT
          </span>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-[0.55rem] uppercase tracking-[0.3em] text-[color-mix(in_srgb,var(--t-ink)_35%,transparent)] font-mono">
          {isRtl ? 'انزل للأسفل' : 'Scroll'}
        </span>
        <span className="w-[1px] h-8 bg-gradient-to-b from-cyan-400 to-transparent" />
      </motion.div>
    </header>
  );
}

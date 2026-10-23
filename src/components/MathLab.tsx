import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Gamepad2, Maximize2, X } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { ARCADE, type ArcadeTier } from '../teachingData';
import Reveal from './Reveal';

/**
 * FIKR Math Arcade.
 *
 * The general games from FIKR's MathPlay hub live as one self-contained page
 * in public/arcade. The iframe only mounts when asked, so the portfolio pays
 * nothing for it on first load; each game card opens its own game.
 */
const TIER_ORDER: ArcadeTier[] = ['easy', 'medium', 'hard', 'class'];

export default function MathLab() {
  const { isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  const launch = (url: string, title: string) => {
    setActiveUrl(url);
    setActiveTitle(title);
    // Let the panel mount before scrolling to it.
    requestAnimationFrame(() => {
      wrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const close = () => {
    setActiveUrl(null);
    setActiveTitle('');
  };

  return (
    <section id="lab" className="relative py-24 md:py-32 px-5 lg:px-8 overflow-hidden bg-[color-mix(in_srgb,var(--t-bg-2)_28%,transparent)]">
      <div className="max-w-7xl mx-auto relative space-y-12">
        <Reveal className="text-center space-y-4">
          <p className="teach-eyebrow">{L(ARCADE.tag)}</p>
          <h2 className="teach-section-title">
            {L(ARCADE.titlePrefix)} <em>{L(ARCADE.titleAccent)}</em>
          </h2>
          <div className="teach-divider" />
          <p className="teach-section-desc">{L(ARCADE.desc)}</p>
        </Reveal>

        {/* Launch panel (chalkboard) */}
        <Reveal>
          <div data-theme="dark" className="teach-card chalk !rounded-3xl px-6 py-12 sm:px-12 sm:py-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 teach-grid-bg opacity-50" />
            <div className="relative z-10 space-y-5">
              <span className="inline-flex teach-icon-chip !w-16 !h-16" aria-hidden="true">
                <Gamepad2 className="w-7 h-7" />
              </span>
              <h3 className="text-2xl sm:text-4xl font-black" style={{ fontFamily: 'var(--teach-font-display)' }}>
                {L(ARCADE.heading)}
              </h3>
              <p className="teach-section-desc !mx-auto max-w-2xl">{L(ARCADE.body)}</p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button onClick={() => launch(ARCADE.home, L(ARCADE.frameTitle))} className="teach-btn teach-btn-primary border-0">
                  <Gamepad2 className="w-4 h-4" />
                  {L(ARCADE.launch)}
                </button>
                <a href={ARCADE.home} target="_blank" rel="noreferrer" className="teach-btn teach-btn-secondary">
                  <Maximize2 className="w-4 h-4" />
                  {L(ARCADE.openNewTab)}
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Lazy-loaded arcade */}
        <AnimatePresence initial={false}>
          {activeUrl && (
            <motion.div
              ref={wrapRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="teach-card !rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between gap-4 px-5 py-3.5 bg-[color-mix(in_srgb,var(--t-accent)_10%,transparent)] border-b border-[color-mix(in_srgb,var(--t-accent)_20%,transparent)]">
                  <span className="text-[0.8rem] font-semibold text-[var(--t-ink)] flex items-center gap-2 min-w-0">
                    <Gamepad2 className="w-4 h-4 shrink-0 text-[var(--t-accent)]" />
                    <span className="truncate">{activeTitle}</span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={activeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.75rem] text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)] hover:text-[var(--t-accent)]">
                      <Maximize2 className="w-3.5 h-3.5" /> {L(ARCADE.openNewTab)}
                    </a>
                    <button
                      onClick={close}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[color-mix(in_srgb,var(--t-ink)_8%,transparent)] text-[var(--t-ink)] hover:bg-[color-mix(in_srgb,var(--t-ink)_14%,transparent)] transition-colors text-[0.75rem] cursor-pointer border-0"
                    >
                      <X className="w-3.5 h-3.5" />
                      {L(ARCADE.close)}
                    </button>
                  </div>
                </div>
                <iframe
                  key={activeUrl}
                  src={activeUrl}
                  title={L(ARCADE.frameTitle)}
                  className="block w-full h-[clamp(480px,75vh,820px)] bg-white border-0"
                  allowFullScreen
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Games by level */}
        <div className="space-y-8">
          {TIER_ORDER.map((tier) => (
            <div key={tier} className="space-y-3">
              <p className="teach-eyebrow text-start">{L(ARCADE.tiers[tier])}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {ARCADE.games.filter((g) => g.tier === tier).map((g, i) => (
                  <Reveal key={g.id} delay={0.04 * i}>
                    <button
                      onClick={() => launch(ARCADE.play(g.id), L(g.title))}
                      className="teach-card w-full h-full px-4 py-5 flex flex-col items-center gap-2 text-center cursor-pointer bg-transparent"
                    >
                      <span className="text-3xl" aria-hidden="true">{g.icon}</span>
                      <span className="text-[0.88rem] font-bold text-[var(--t-ink)] leading-snug">{L(g.title)}</span>
                      <span className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)] leading-tight">{L(g.desc)}</span>
                    </button>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

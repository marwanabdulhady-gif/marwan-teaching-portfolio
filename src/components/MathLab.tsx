import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ExternalLink, FlaskConical, X } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { LAB } from '../teachingData';
import Reveal from './Reveal';

/**
 * Interactive Mathematics Lab.
 *
 * The template embedded a single virtual science lab behind a "Launch" button.
 * This keeps that lazy-load pattern — the iframe only mounts when asked, so the
 * page pays nothing for it on first load — but drives five different GeoGebra
 * apps from one workspace, so each strand card loads its own tool.
 */
export default function MathLab() {
  const { isRtl } = useLocale();
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
      <div className="absolute top-1/4 end-1/4 w-[440px] h-[440px] rounded-full bg-cyan-400/[0.07] blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative space-y-12">
        <Reveal className="text-center space-y-4">
          <p className="teach-eyebrow">{isRtl ? LAB.tag.ar : LAB.tag.en}</p>
          <h2 className="teach-section-title">
            {isRtl ? LAB.titlePrefix.ar : LAB.titlePrefix.en}{' '}
            <em>{isRtl ? LAB.titleAccent.ar : LAB.titleAccent.en}</em>
          </h2>
          <div className="teach-divider" />
          <p className="teach-section-desc">{isRtl ? LAB.desc.ar : LAB.desc.en}</p>
        </Reveal>

        {/* Launch panel */}
        <Reveal>
          <div className="teach-card !rounded-3xl px-6 py-14 sm:px-12 sm:py-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 teach-grid-bg opacity-50" />
            <div className="relative z-10 space-y-5">
              <span
                className="inline-block text-5xl sm:text-6xl"
                style={{ filter: 'drop-shadow(0 6px 24px color-mix(in srgb, var(--t-accent) 35%, transparent))' }}
                aria-hidden="true"
              >
                {LAB.icon}
              </span>
              <h3
                className="text-2xl sm:text-4xl font-black text-white"
                style={{ fontFamily: 'var(--teach-font-display)' }}
              >
                {isRtl ? LAB.heading.ar : LAB.heading.en}
              </h3>
              <p className="teach-section-desc !mx-auto max-w-2xl">{isRtl ? LAB.body.ar : LAB.body.en}</p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => launch(LAB.apps[0].url, isRtl ? LAB.apps[0].title.ar : LAB.apps[0].title.en)}
                  className="teach-btn teach-btn-primary border-0"
                >
                  <FlaskConical className="w-4 h-4" />
                  {isRtl ? LAB.launch.ar : LAB.launch.en}
                </button>
                <a href={LAB.apps[0].url} target="_blank" rel="noreferrer" className="teach-btn teach-btn-secondary">
                  <ExternalLink className="w-4 h-4" />
                  {isRtl ? LAB.openNewTab.ar : LAB.openNewTab.en}
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Lazy-loaded workspace */}
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
                  <span className="text-[0.8rem] text-[color-mix(in_srgb,var(--t-ink)_72%,transparent)] flex items-center gap-2 min-w-0">
                    <FlaskConical className="w-4 h-4 shrink-0 text-cyan-300" />
                    <span className="truncate">
                      {activeTitle || (isRtl ? LAB.frameTitle.ar : LAB.frameTitle.en)}
                    </span>
                  </span>
                  <button
                    onClick={close}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-[color-mix(in_srgb,var(--t-ink)_65%,transparent)] hover:text-white hover:bg-white/20 transition-colors text-[0.75rem] cursor-pointer border-0"
                  >
                    <X className="w-3.5 h-3.5" />
                    {isRtl ? LAB.close.ar : LAB.close.en}
                  </button>
                </div>
                <iframe
                  key={activeUrl}
                  src={activeUrl}
                  title={isRtl ? LAB.frameTitle.ar : LAB.frameTitle.en}
                  className="block w-full h-[clamp(420px,65vh,720px)] bg-[var(--t-bg)] border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Strand cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {LAB.apps.map((app, i) => (
            <Reveal key={app.id} delay={0.05 * i}>
              <button
                onClick={() => launch(app.url, isRtl ? app.title.ar : app.title.en)}
                className="teach-card w-full h-full px-4 py-6 flex flex-col items-center gap-2.5 text-center cursor-pointer bg-transparent"
              >
                <span className="text-2xl" aria-hidden="true">
                  {app.icon}
                </span>
                <span className="text-[0.85rem] font-bold text-white leading-snug">
                  {isRtl ? app.title.ar : app.title.en}
                </span>
                <span className="text-[0.68rem] text-[color-mix(in_srgb,var(--t-ink)_50%,transparent)] leading-tight">
                  {isRtl ? app.desc.ar : app.desc.en}
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

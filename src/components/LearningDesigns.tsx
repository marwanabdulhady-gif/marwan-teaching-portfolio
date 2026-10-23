import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { DESIGNS, DESIGNS_HEADER, type Design } from '../teachingData';
import Reveal from './Reveal';

/**
 * Learning-experience designs: each project plays as a short learner
 * journey — numbered steps over real screenshots, auto-advancing while on
 * screen and tappable. The device sits on a chalkboard tile.
 */
function DesignCard({ item, index }: { item: Design; index: number }) {
  const { isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-25% 0px -25% 0px' });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-advance while the card is on screen; a tap pauses it.
  useEffect(() => {
    if (!inView || paused || item.steps.length < 2) return;
    const id = setInterval(() => setActive((a) => (a + 1) % item.steps.length), 3200);
    return () => clearInterval(id);
  }, [inView, paused, item.steps.length]);

  const flip = index % 2 === 1;
  const phone = item.device === 'phone';

  return (
    <div ref={ref} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
      {/* Device on a chalkboard */}
      <Reveal from={flip ? 'end' : 'start'} className={`lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}>
        <div data-theme="dark" className="teach-card chalk p-5 sm:p-8">
          <div className={`relative mx-auto ${phone ? 'w-[220px] sm:w-[250px]' : 'w-full'}`}>
            <div
              className={`relative overflow-hidden shadow-2xl shadow-black/50 bg-[#0b1426] ${
                phone ? 'rounded-[2.2rem] p-2 border border-white/15' : 'rounded-xl border border-white/10'
              }`}
            >
              {!phone && (
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10">
                  <span className="w-2 h-2 rounded-full bg-[var(--t-accent)]" />
                  <span className="w-2 h-2 rounded-full bg-[var(--t-sun)]" />
                  <span className="w-2 h-2 rounded-full bg-[var(--t-sky)]" />
                </div>
              )}
              <div className={`relative overflow-hidden ${phone ? 'aspect-[390/844] rounded-[1.7rem]' : 'aspect-[16/10]'}`}>
                <AnimatePresence initial={false}>
                  <motion.img
                    key={item.steps[active].image}
                    src={item.steps[active].image}
                    alt={`${L(item.title)} — ${L(item.steps[active].label)}`}
                    loading="lazy"
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Story */}
      <Reveal delay={0.1} className={`lg:col-span-5 space-y-4 text-start ${flip ? 'lg:order-1' : ''}`}>
        <p className="teach-eyebrow">
          <span dir="ltr">{item.date}</span> · {L(item.kind)}
        </p>
        <h3 className="font-[family-name:var(--teach-font-display)] text-3xl sm:text-4xl font-black leading-tight text-[var(--t-ink)]">
          {L(item.title)}
        </h3>
        <p className="teach-section-desc !text-start !mx-0 !max-w-none">{L(item.what)}</p>
        <p className="text-sm font-semibold text-[var(--t-accent-deep)] leading-relaxed">{L(item.forWho)}</p>

        <ol className="flex flex-wrap gap-2 pt-1">
          {item.steps.map((s, i) => (
            <li key={s.image}>
              <button
                type="button"
                onClick={() => { setActive(i); setPaused(true); }}
                aria-pressed={i === active}
                className={`relative overflow-hidden rounded-full px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer border ${
                  i === active
                    ? 'border-[var(--t-accent)] bg-[color-mix(in_srgb,var(--t-accent)_12%,transparent)] text-[var(--t-ink)]'
                    : 'border-[color-mix(in_srgb,var(--t-ink)_15%,transparent)] text-[color-mix(in_srgb,var(--t-ink)_65%,transparent)] hover:border-[var(--t-accent)]'
                }`}
              >
                <span className="font-mono text-[10px] text-[var(--t-accent)] me-1.5">{i + 1}</span>
                {L(s.label)}
                {i === active && !paused && inView && (
                  <motion.span
                    key={`p-${active}`}
                    className="absolute bottom-0 start-0 h-0.5 bg-[var(--t-accent)]"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3.2, ease: 'linear' }}
                  />
                )}
              </button>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <p className="text-[11px] font-mono text-[color-mix(in_srgb,var(--t-ink)_50%,transparent)]" dir="ltr">{item.stack}</p>
          {item.link && (
            <a href={item.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--t-accent-deep)] hover:underline">
              {isRtl ? 'جرّبه مباشرة' : 'Try it live'} <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </Reveal>
    </div>
  );
}

export default function LearningDesigns() {
  const { isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);

  return (
    <section id="designs" className="relative py-24 md:py-32 px-5 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-20 md:space-y-28">
        <Reveal className="text-center space-y-4">
          <p className="teach-eyebrow">{L(DESIGNS_HEADER.tag)}</p>
          <h2 className="teach-section-title">
            {L(DESIGNS_HEADER.titlePrefix)} <em>{L(DESIGNS_HEADER.titleAccent)}</em>
          </h2>
          <div className="teach-divider" />
          <p className="teach-section-desc">{L(DESIGNS_HEADER.desc)}</p>
        </Reveal>

        {DESIGNS.map((item, i) => (
          <DesignCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}

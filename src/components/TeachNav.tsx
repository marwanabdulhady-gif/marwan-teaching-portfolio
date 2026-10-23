import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, CalendarCheck, Menu, X } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { NAV_ITEMS, BRAND, FOOTER, LINKS } from '../teachingData';
import { MathMark } from './MathArt';

interface TeachNavProps {
  /** Id of the section currently dominating the viewport. */
  activeSection: string;
}

/**
 * Fixed glass navigation for the teaching portfolio.
 *
 * The template this is adapted from simply did `display: none` on its links
 * below 768px, leaving mobile visitors with no way around the page. This keeps
 * the same visual language but adds a real slide-down menu.
 */
export default function TeachNav({ activeSection }: TeachNavProps) {
  const { locale, setLocale, isRtl, t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const goTo = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = (window as any).__lenis;
    if (lenis) lenis.scrollTo(el, { offset: -92 });
    else window.scrollTo({ top: el.offsetTop - 92, behavior: 'smooth' });
  };

  return (
    <nav
      // Over the chalkboard hero the bar is dark; once scrolled it sits on paper.
      data-theme={scrolled ? undefined : 'dark'}
      className={`fixed top-0 inset-x-0 z-[900] transition-all duration-500 ${
        scrolled
          ? 'bg-[color-mix(in_srgb,var(--t-bg)_88%,transparent)] backdrop-blur-2xl border-b border-[color-mix(in_srgb,var(--t-accent)_20%,transparent)] shadow-[0_10px_40px_-20px_var(--t-shadow)]'
          : 'bg-[color-mix(in_srgb,var(--t-bg)_55%,transparent)] backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[72px] flex items-center justify-between gap-4">
        {/* Brand */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            goTo('hero');
          }}
          className="flex items-center gap-3 shrink-0 group"
        >
          <div className="w-9 h-9 shrink-0">
            <MathMark className="w-full h-full transition-transform duration-500 group-hover:rotate-90" />
          </div>
          <div className="leading-none">
            <div
              className="font-bold text-[1.05rem] tracking-tight bg-gradient-to-br from-cyan-400 to-[var(--t-ink)] bg-clip-text text-transparent"
              style={{ fontFamily: 'var(--teach-font-display)' }}
            >
              {isRtl ? BRAND.wordmarkAr : BRAND.wordmark}
            </div>
            <div className="text-[0.6rem] text-cyan-400 tracking-[0.16em] uppercase mt-1">
              {isRtl ? BRAND.subAr : BRAND.sub}
            </div>
          </div>
        </a>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-7 list-none">
          {NAV_ITEMS.map((item) => {
            const label = isRtl ? item.label.ar : item.label.en;
            const isActive = activeSection === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => goTo(item.id)}
                  className={`relative text-[0.8rem] font-medium tracking-wide transition-colors cursor-pointer bg-transparent border-0 ${
                    isActive ? 'text-cyan-300' : 'text-[color-mix(in_srgb,var(--t-ink)_68%,transparent)] hover:text-cyan-300'
                  }`}
                >
                  {label}
                  <span
                    className={`absolute -bottom-1.5 start-0 h-[2px] bg-cyan-400 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0'
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Locale switch */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
            <button
              onClick={() => setLocale('en')}
              className={`px-1.5 py-1 transition-colors cursor-pointer bg-transparent border-0 ${
                locale === 'en' ? 'text-cyan-300' : 'text-[color-mix(in_srgb,var(--t-ink)_40%,transparent)] hover:text-cyan-300'
              }`}
              aria-label="English"
            >
              EN
            </button>
            <span className="text-[color-mix(in_srgb,var(--t-ink)_20%,transparent)]">/</span>
            <button
              onClick={() => setLocale('ar')}
              className={`px-1.5 py-1 transition-colors cursor-pointer bg-transparent border-0 ${
                locale === 'ar' ? 'text-cyan-300' : 'text-[color-mix(in_srgb,var(--t-ink)_40%,transparent)] hover:text-cyan-300'
              }`}
              aria-label="العربية"
            >
              عربي
            </button>
          </div>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => goTo('work')}
            className="teach-btn teach-btn-primary !hidden md:!inline-flex !px-5 !py-2 !text-[0.75rem]"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            {isRtl ? 'اعمل معي' : 'Work with me'}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden p-2 rounded-lg text-cyan-300 hover:bg-white/10 transition-colors cursor-pointer bg-transparent border border-[color-mix(in_srgb,var(--t-accent)_25%,transparent)]"
            aria-label={t('nav.menu')}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden overflow-hidden bg-[color-mix(in_srgb,var(--t-bg)_97%,transparent)] backdrop-blur-2xl border-t border-[color-mix(in_srgb,var(--t-accent)_18%,transparent)]"
          >
            <ul className="px-5 py-4 space-y-1 list-none">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => goTo(item.id)}
                    className="w-full text-start px-3 py-3 rounded-xl text-[0.9rem] text-[color-mix(in_srgb,var(--t-ink)_80%,transparent)] hover:bg-[color-mix(in_srgb,var(--t-accent)_12%,transparent)] hover:text-cyan-300 transition-colors cursor-pointer bg-transparent border-0"
                  >
                    {isRtl ? item.label.ar : item.label.en}
                  </button>
                </li>
              ))}
              <li className="pt-2 border-t border-white/10 mt-2">
                <button
                  type="button"
                  onClick={() => goTo('work')}
                  className="flex items-center gap-2 px-3 py-3 rounded-xl text-[0.9rem] text-cyan-300"
                >
                  <CalendarCheck className="w-4 h-4" />
                  {isRtl ? 'اعمل معي' : 'Work with me'}
                </button>
              </li>
              <li>
                <a
                  href={LINKS.corporate}
                  className="flex items-center gap-2 px-3 py-3 rounded-xl text-[0.85rem] text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)] hover:text-cyan-300 transition-colors"
                >
                  {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  {isRtl ? FOOTER.backToTraining.ar : FOOTER.backToTraining.en}
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, CalendarCheck, Menu, X } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { NAV_ITEMS, BRAND, FOOTER, LINKS } from '../teachingData';
import { MathMark } from './MathArt';
import { PAGE_NAV, navigate, scrollToSection, usePath } from '../router';
import SearchPalette from './SearchPalette';
import AppearanceMenu from './AppearanceMenu';

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
  // Only the home page opens on a dark hero; the other pages start on paper.
  const onHome = usePath() === '/';
  const solid = scrolled || !onHome;

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
    const page = PAGE_NAV[id];
    if (page) navigate(page);
    else scrollToSection(id);
  };
  const hrefFor = (id: string) => PAGE_NAV[id] ?? `/#${id}`;
  const open = (id: string) => (e: React.MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    goTo(id);
  };

  return (
    <nav
      // Over the chalkboard hero the bar is dark; once scrolled it sits on paper.
      data-theme={solid ? undefined : 'dark'}
      className={`fixed top-0 inset-x-0 z-[900] transition-all duration-500 ${
        solid
          ? 'bg-[color-mix(in_srgb,var(--t-bg)_88%,transparent)] backdrop-blur-2xl border-b border-[color-mix(in_srgb,var(--t-accent)_20%,transparent)] shadow-[0_10px_40px_-20px_var(--t-shadow)]'
          : 'bg-[color-mix(in_srgb,var(--t-bg)_55%,transparent)] backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[72px] flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            goTo('hero');
          }}
          className="flex items-center gap-2 sm:gap-3 min-w-0 group"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0">
            <MathMark className="w-full h-full transition-transform duration-500 group-hover:rotate-90" />
          </div>
          <div className="leading-none min-w-0">
            <div
              className="font-bold text-[0.8rem] min-[400px]:text-[0.95rem] sm:text-[1.05rem] tracking-tight whitespace-nowrap bg-gradient-to-br from-cyan-400 to-[var(--t-ink)] bg-clip-text text-transparent"
              style={{ fontFamily: 'var(--teach-font-display)' }}
            >
              {isRtl ? BRAND.wordmarkAr : BRAND.wordmark}
            </div>
            <div className="hidden sm:block text-[0.6rem] text-cyan-400 tracking-[0.16em] uppercase mt-1">
              {isRtl ? BRAND.subAr : BRAND.sub}
            </div>
          </div>
        </a>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-5 xl:gap-6 list-none">
          {NAV_ITEMS.map((item) => {
            const label = isRtl ? item.label.ar : item.label.en;
            const isActive = activeSection === item.id;
            return (
              <li key={item.id}>
                <a
                  href={hrefFor(item.id)}
                  onClick={open(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative whitespace-nowrap text-[0.8rem] font-medium tracking-wide transition-colors cursor-pointer bg-transparent border-0 ${
                    isActive ? 'text-cyan-300' : 'text-[color-mix(in_srgb,var(--t-ink)_68%,transparent)] hover:text-cyan-300'
                  }`}
                >
                  {label}
                  <span
                    className={`absolute -bottom-1.5 start-0 h-[2px] bg-cyan-400 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0'
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          <SearchPalette />
          <AppearanceMenu />

          {/* Locale switch: one toggle on phones, EN / عربي pair from sm up */}
          <button
            onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
            className="sm:hidden px-2 py-1.5 rounded-full text-[11px] font-bold text-cyan-300 cursor-pointer bg-transparent border border-[color-mix(in_srgb,var(--t-accent)_25%,transparent)]"
            aria-label={locale === 'en' ? 'العربية' : 'English'}
          >
            {locale === 'en' ? 'عربي' : 'EN'}
          </button>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono font-bold">
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
            className="teach-btn teach-btn-primary whitespace-nowrap !hidden xl:!inline-flex !px-5 !py-2 !text-[0.75rem]"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            {isRtl ? 'اعمل معي' : 'Work with me'}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg text-cyan-300 hover:bg-white/10 transition-colors cursor-pointer bg-transparent border border-[color-mix(in_srgb,var(--t-accent)_25%,transparent)]"
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
                  <a
                    href={hrefFor(item.id)}
                    onClick={open(item.id)}
                    className="block w-full text-start px-3 py-3 rounded-xl text-[0.9rem] text-[color-mix(in_srgb,var(--t-ink)_80%,transparent)] hover:bg-[color-mix(in_srgb,var(--t-accent)_12%,transparent)] hover:text-cyan-300 transition-colors cursor-pointer bg-transparent border-0"
                  >
                    {isRtl ? item.label.ar : item.label.en}
                  </a>
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

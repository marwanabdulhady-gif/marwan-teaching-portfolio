import { ArrowLeft, ArrowRight, Linkedin, Mail } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { FOOTER, BRAND, NAV_ITEMS, RESOURCES, LINKS, mailto } from '../teachingData';
import { MathMark } from './MathArt';

/** Footer: brand block, two link columns, contact, and a route switch back. */
export default function TeachFooter() {
  const { isRtl } = useLocale();

  const goTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = (window as any).__lenis;
    if (lenis) lenis.scrollTo(el, { offset: -92 });
    else window.scrollTo({ top: el.offsetTop - 92, behavior: 'smooth' });
  };

  return (
    <footer data-theme="dark" className="relative border-t border-[color-mix(in_srgb,var(--t-accent)_16%,transparent)] bg-[color-mix(in_srgb,var(--t-bg)_90%,transparent)]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-12">
          {/* Brand */}
          <div className="space-y-5 text-start">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9">
                <MathMark className="w-full h-full" />
              </div>
              <div className="leading-none">
                <div
                  className="font-bold text-lg bg-gradient-to-br from-cyan-400 to-[var(--t-ink)] bg-clip-text text-transparent"
                  style={{ fontFamily: 'var(--teach-font-display)' }}
                >
                  {isRtl ? BRAND.wordmarkAr : BRAND.wordmark}
                </div>
                <div className="text-[0.58rem] text-cyan-400 tracking-[0.16em] uppercase mt-1.5">
                  {isRtl ? BRAND.subAr : BRAND.sub}
                </div>
              </div>
            </div>

            <p className="text-[0.85rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)] max-w-sm font-light">
              {isRtl ? FOOTER.blurb.ar : FOOTER.blurb.en}
            </p>

            <div className="flex items-center gap-3 pt-1">
              <a
                href={LINKS.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-xl bg-white/[0.06] border border-[color-mix(in_srgb,var(--t-accent)_20%,transparent)] hover:border-cyan-400/60 hover:bg-cyan-500/15 flex items-center justify-center text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)] hover:text-cyan-300 transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={mailto('Mathematics Enquiry')}
                aria-label={LINKS.email}
                className="w-10 h-10 rounded-xl bg-white/[0.06] border border-[color-mix(in_srgb,var(--t-accent)_20%,transparent)] hover:border-cyan-400/60 hover:bg-cyan-500/15 flex items-center justify-center text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)] hover:text-cyan-300 transition-all"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>

            <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_40%,transparent)] font-mono">
              {isRtl ? FOOTER.basedIn.ar : FOOTER.basedIn.en}
            </p>
          </div>

          {/* Explore */}
          <div className="text-start">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-cyan-400 font-bold mb-5">
              {isRtl ? FOOTER.exploreTitle.ar : FOOTER.exploreTitle.en}
            </p>
            <ul className="space-y-3 list-none">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => goTo(item.id)}
                    className="text-[0.83rem] text-[color-mix(in_srgb,var(--t-ink)_60%,transparent)] hover:text-cyan-300 transition-colors bg-transparent border-0 p-0 cursor-pointer text-start"
                  >
                    {isRtl ? item.label.ar : item.label.en}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Strands */}
          <div className="text-start">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-cyan-400 font-bold mb-5">
              {isRtl ? FOOTER.strandsTitle.ar : FOOTER.strandsTitle.en}
            </p>
            <ul className="space-y-3 list-none">
              {RESOURCES.strands.map((strand) => (
                <li key={strand.id}>
                  <a
                    href={mailto(`Resource Request — ${strand.title.en}`)}
                    className="text-[0.83rem] text-[color-mix(in_srgb,var(--t-ink)_60%,transparent)] hover:text-cyan-300 transition-colors"
                  >
                    {isRtl ? strand.title.ar : strand.title.en}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Route switch back to the corporate portfolio */}
        <div className="mt-14 pt-8 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="text-[0.72rem] text-[color-mix(in_srgb,var(--t-ink)_40%,transparent)] text-center sm:text-start">
            {isRtl ? FOOTER.copyright.ar : FOOTER.copyright.en}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <p className="text-[0.72rem] text-[color-mix(in_srgb,var(--t-ink)_40%,transparent)]">
              {isRtl ? FOOTER.tagline.ar : FOOTER.tagline.en}
            </p>
            <a
              href={LINKS.corporate}
              className="inline-flex items-center gap-2 text-[0.75rem] font-semibold text-cyan-300 hover:text-white transition-colors px-4 py-2 rounded-full border border-[color-mix(in_srgb,var(--t-accent)_30%,transparent)] hover:border-cyan-400/60"
            >
              {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              {isRtl ? FOOTER.backToTraining.ar : FOOTER.backToTraining.en}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

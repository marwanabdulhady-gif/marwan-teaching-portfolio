import { useLocale } from '../LocaleContext';
import { MATHSLAB, type MathsLabGroup } from '../teachingData';
import Reveal from './Reveal';

const GROUP_ORDER: MathsLabGroup[] = ['games', 'apps', 'tools'];

/** Ch. 03's MathsLab mode: every collection of the MathsLab site, opened in the chapter's player. */
export default function MathsLabPanel({ onOpen, playing }: { onOpen: (url: string, title: string) => void; playing: string | null }) {
  const { isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);
  const num = (n: number) => n.toLocaleString(isRtl ? 'ar-EG' : 'en-US');

  return (
    <div className="space-y-9">
      <Reveal className="teach-card p-5 sm:p-6 space-y-2 text-start">
        <p className="text-[0.95rem] leading-relaxed text-[var(--t-ink)]">{L(MATHSLAB.intro)}</p>
        <p className="text-xs font-semibold text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">{L(MATHSLAB.draft)}</p>
      </Reveal>

      {GROUP_ORDER.map((group) => {
        const items = MATHSLAB.items.filter((i) => i.group === group);
        return (
          <div key={group} className="space-y-4">
            <Reveal className="text-start">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[color-mix(in_srgb,var(--t-accent)_14%,transparent)] text-[var(--t-accent-deep)]">
                {L(MATHSLAB.groups[group])}
              </span>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item, idx) => {
                const isPlaying = playing === item.url;
                return (
                  <Reveal key={item.id} delay={0.025 * idx}>
                    <button
                      type="button"
                      data-mathslab={item.id}
                      onClick={() => onOpen(item.url, L(item.title))}
                      className={`teach-card group w-full h-full p-5 flex items-start gap-4 text-start cursor-pointer bg-transparent transition-all ${
                        isPlaying ? '!border-[var(--t-accent)] ring-2 ring-[var(--t-accent)]/30' : ''
                      }`}
                    >
                      <span className="w-12 h-12 rounded-2xl bg-[color-mix(in_srgb,var(--t-accent)_14%,transparent)] flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                        {item.icon}
                      </span>
                      <span className="min-w-0 flex-1 space-y-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-bold text-base text-[var(--t-ink)]" style={{ fontFamily: 'var(--teach-font-display)' }}>
                            {L(item.title)}
                          </span>
                          {item.count > 0 && (
                            <span className="text-xs font-bold text-[var(--t-accent-deep)] shrink-0">{num(item.count)}</span>
                          )}
                        </span>
                        <span className="block text-[0.82rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_66%,transparent)]">
                          {L(item.desc)}
                        </span>
                      </span>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

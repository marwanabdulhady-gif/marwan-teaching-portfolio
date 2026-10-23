import { useState } from 'react';
import { ArrowUpRight, FileText, Play, Store, Youtube } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { LINKS, RESOURCES, VIDEOS } from '../teachingData';
import Reveal from './Reveal';

/**
 * Lessons & resources: the YouTube channel (with featured lessons once their
 * ids are listed in VIDEOS), worksheets and the Teachers Pay Teachers store.
 * A card whose link is still empty says "Coming soon" instead of linking
 * nowhere.
 */
function VideoCard({ id, title, topic }: { id: string; title: string; topic: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <figure className="teach-card overflow-hidden">
      <div className="relative aspect-video bg-black">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            className="absolute inset-0 w-full h-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          // Thumbnail first; the player only loads when the visitor asks for it.
          <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 cursor-pointer" aria-label={title}>
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="w-full h-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-14 h-14 rounded-full bg-[var(--t-accent)] text-[#fff] flex items-center justify-center shadow-xl transition-transform group-hover:scale-110">
                <Play className="w-6 h-6 ms-1" fill="currentColor" />
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="p-4 text-start space-y-1">
        <p className="teach-eyebrow">{topic}</p>
        <p className="font-bold text-[0.95rem] text-[var(--t-ink)] leading-snug">{title}</p>
      </figcaption>
    </figure>
  );
}

export default function ResourceLibrary() {
  const { isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);

  const extras = [
    { key: 'worksheets', icon: FileText, data: RESOURCES.worksheets, href: LINKS.worksheets },
    { key: 'tpt', icon: Store, data: RESOURCES.tpt, href: LINKS.tpt },
  ];

  return (
    <section id="resources" className="relative py-24 md:py-32 px-5 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto relative space-y-12">
        <Reveal className="text-center space-y-4">
          <p className="teach-eyebrow">{L(RESOURCES.tag)}</p>
          <h2 className="teach-section-title">
            {L(RESOURCES.titlePrefix)} <em>{L(RESOURCES.titleAccent)}</em>
          </h2>
          <div className="teach-divider" />
          <p className="teach-section-desc">{L(RESOURCES.desc)}</p>
        </Reveal>

        {/* YouTube channel */}
        <Reveal>
          <a
            href={LINKS.youtube}
            target="_blank"
            rel="noreferrer"
            data-theme="dark"
            className="teach-card chalk group flex flex-col sm:flex-row items-start sm:items-center gap-5 p-7 sm:p-9 !rounded-3xl text-start"
          >
            <span className="w-16 h-16 rounded-2xl bg-[#ff0033] text-[#fff] flex items-center justify-center shrink-0 shadow-lg shadow-black/40">
              <Youtube className="w-8 h-8" />
            </span>
            <span className="flex-1 space-y-1.5">
              <span className="block text-2xl sm:text-3xl font-black" style={{ fontFamily: 'var(--teach-font-display)' }}>
                {L(RESOURCES.youtube.title)}
              </span>
              <span className="block text-[0.92rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">
                {L(RESOURCES.youtube.desc)}
              </span>
            </span>
            <span className="teach-btn teach-btn-primary shrink-0">
              {L(RESOURCES.youtube.cta)} <ArrowUpRight className="w-4 h-4" />
            </span>
          </a>
        </Reveal>

        {/* Featured lessons (shown once video ids are listed) */}
        {VIDEOS.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VIDEOS.map((v, i) => (
              <Reveal key={v.id} delay={0.05 * i}>
                <VideoCard id={v.id} title={L(v.title)} topic={L(v.topic)} />
              </Reveal>
            ))}
          </div>
        )}

        {/* Worksheets + TPT store */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {extras.map(({ key, icon: Icon, data, href }, i) => {
            const body = (
              <>
                <span className="teach-icon-chip !w-12 !h-12 shrink-0"><Icon className="w-5 h-5" /></span>
                <span className="flex-1 space-y-1.5 text-start">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-xl font-black text-[var(--t-ink)]" style={{ fontFamily: 'var(--teach-font-display)' }}>{L(data.title)}</span>
                    {!href && (
                      <span className="text-[0.65rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[color-mix(in_srgb,var(--t-sun)_25%,transparent)] text-[var(--t-ink)]">
                        {L(RESOURCES.soon)}
                      </span>
                    )}
                  </span>
                  <span className="block text-[0.88rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_68%,transparent)]">{L(data.desc)}</span>
                  {href && (
                    <span className="inline-flex items-center gap-1 pt-1 text-sm font-bold text-[var(--t-accent-deep)]">
                      {L(data.cta)} <ArrowUpRight className="w-4 h-4" />
                    </span>
                  )}
                </span>
              </>
            );
            return (
              <Reveal key={key} delay={0.08 * i}>
                {href ? (
                  <a href={href} target="_blank" rel="noreferrer" className="teach-card h-full flex items-start gap-4 p-6 sm:p-7">{body}</a>
                ) : (
                  <div className="teach-card h-full flex items-start gap-4 p-6 sm:p-7">{body}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

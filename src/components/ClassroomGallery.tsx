import { useLocale } from '../LocaleContext';
import { GALLERY } from '../teachingData';
import { Motif } from './MathArt';
import Reveal from './Reveal';

/**
 * Classroom Universe — the template's character gallery.
 *
 * The originals were AI portraits of another teacher; they are replaced here by
 * six generated mathematical motifs, one per facet of the practice.
 */
export default function ClassroomGallery() {
  const { isRtl } = useLocale();

  return (
    <section id="gallery" className="relative py-24 md:py-32 px-5 lg:px-8 overflow-hidden">
      <div className="absolute bottom-1/4 start-1/3 w-[420px] h-[420px] rounded-full bg-amber-400/[0.05] blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative space-y-12">
        <Reveal className="text-center space-y-4">
          <p className="teach-eyebrow">{isRtl ? GALLERY.tag.ar : GALLERY.tag.en}</p>
          <h2 className="teach-section-title">
            {isRtl ? GALLERY.titlePrefix.ar : GALLERY.titlePrefix.en}{' '}
            <em>{isRtl ? GALLERY.titleAccent.ar : GALLERY.titleAccent.en}</em>
          </h2>
          <div className="teach-divider" />
          <p className="teach-section-desc">{isRtl ? GALLERY.desc.ar : GALLERY.desc.en}</p>
        </Reveal>

        {/* Horizontal scroll rail — direction-agnostic under RTL */}
        <Reveal delay={0.1}>
          <div className="teach-scroll-rail -mx-5 px-5 lg:-mx-8 lg:px-8">
            {GALLERY.roles.map((role) => (
              <div
                key={role.id}
                data-theme="dark"
                className="teach-card chalk w-[260px] sm:w-[300px] overflow-hidden group"
              >
                <div
                  className="relative aspect-[4/3] flex items-center justify-center"
                  style={{ background: role.gradient }}
                >
                  <div className="teach-grid-bg absolute inset-0 opacity-30" />
                  <div className="relative w-[72%] transition-transform duration-700 group-hover:scale-[1.06]">
                    <Motif name={role.art} className="w-full h-auto" />
                  </div>
                  <span
                    className="absolute top-3 start-3 w-9 h-9 rounded-xl bg-black/35 backdrop-blur-md border border-white/15 flex items-center justify-center text-base"
                    aria-hidden="true"
                  >
                    {role.icon}
                  </span>
                </div>
                <div className="p-5 text-start">
                  <p className="text-[0.92rem] font-bold text-white leading-snug">
                    {isRtl ? role.label.ar : role.label.en}
                  </p>
                  <p className="text-[0.7rem] text-cyan-300/80 mt-1.5 leading-snug">
                    {isRtl ? role.note.ar : role.note.en}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.2} className="text-center">
          <p className="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--t-ink)_32%,transparent)]">
            {isRtl ? 'اسحب لاستعراض المزيد' : 'Drag to explore'}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

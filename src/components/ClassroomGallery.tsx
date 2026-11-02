import { useLocale } from '../LocaleContext';
import { GALLERY } from '../teachingData';
import { Motif } from './MathArt';
import Reveal from './Reveal';

/**
 * Six Facets of Practice — organized as a balanced 3×2 architectural grid
 * inside Chapter 01 (Profile & Track Record) so visitors see all six roles
 * immediately without needing to drag a horizontal carousel.
 */
export default function ClassroomGallery() {
  const { isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);

  return (
    <section
      id="gallery"
      className="relative py-16 md:py-20 px-5 lg:px-8 overflow-hidden bg-[color-mix(in_srgb,var(--t-bg-2)_26%,transparent)]"
    >
      <div className="max-w-7xl mx-auto relative space-y-10">
        <Reveal className="text-center space-y-3">
          <p className="teach-eyebrow">{L(GALLERY.tag)}</p>
          <h2 className="teach-section-title !text-[clamp(1.7rem,3.6vw,2.6rem)]">
            {L(GALLERY.titlePrefix)} <em>{L(GALLERY.titleAccent)}</em>
          </h2>
          <div className="teach-divider" />
          <p className="teach-section-desc">{L(GALLERY.desc)}</p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GALLERY.roles.map((role, idx) => (
            <Reveal key={role.id} delay={0.04 * idx}>
              <div
                data-theme="dark"
                className="teach-card chalk h-full flex items-center gap-4 p-4 sm:p-5 group"
              >
                <div
                  className="relative w-24 h-24 sm:w-28 sm:h-24 rounded-2xl shrink-0 flex items-center justify-center overflow-hidden border border-white/10"
                  style={{ background: role.gradient }}
                >
                  <div className="teach-grid-bg absolute inset-0 opacity-30" />
                  <div className="relative w-[76%] transition-transform duration-500 group-hover:scale-110">
                    <Motif name={role.art} className="w-full h-auto" />
                  </div>
                  <span
                    className="absolute top-1.5 start-1.5 w-6 h-6 rounded-lg bg-black/45 backdrop-blur-md border border-white/15 flex items-center justify-center text-xs"
                    aria-hidden="true"
                  >
                    {role.icon}
                  </span>
                </div>

                <div className="min-w-0 text-start space-y-1.5">
                  <p className="text-sm sm:text-base font-bold text-white leading-snug">
                    {L(role.label)}
                  </p>
                  <p className="text-xs text-cyan-300/85 leading-relaxed">
                    {L(role.note)}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

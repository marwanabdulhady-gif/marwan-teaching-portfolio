import { ArrowRight, CalendarCheck, Check, GraduationCap, Linkedin, MessageCircle, School } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { LINKS, WORK } from '../teachingData';
import Reveal from './Reveal';

/** Calendly link with the visitor's reason pre-filled as the first answer. */
const booking = (note: string) => `${LINKS.booking}?a1=${encodeURIComponent(note)}`;

/**
 * The two ways to work with Marwan, side by side: schools hiring a teacher
 * (a dark chalkboard card) and parents/students who want to learn with him
 * (a warm coral card). Each ends in a Calendly booking.
 */
export default function WorkWithMe() {
  const { isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);
  const arrow = <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />;

  return (
    <section id="work" className="relative py-24 md:py-32 px-5 lg:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-14">
        <Reveal className="text-center space-y-4">
          <p className="teach-eyebrow">{L(WORK.tag)}</p>
          <h2 className="teach-section-title">
            {L(WORK.titlePrefix)} <em>{L(WORK.titleAccent)}</em>
          </h2>
          <div className="teach-divider" />
          <p className="teach-section-desc">{L(WORK.desc)}</p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Schools */}
          <Reveal from="start">
            <article data-theme="dark" className="teach-card chalk h-full p-7 sm:p-10 flex flex-col gap-6 text-start">
              <span className="teach-icon-chip !w-14 !h-14"><School className="w-6 h-6" /></span>
              <div className="space-y-2">
                <p className="teach-eyebrow">{L(WORK.schools.tag)}</p>
                <h3 className="font-[family-name:var(--teach-font-display)] text-3xl sm:text-4xl font-black leading-tight">{L(WORK.schools.title)}</h3>
                <p className="text-[0.95rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_72%,transparent)]">{L(WORK.schools.desc)}</p>
              </div>
              <ul className="space-y-3 flex-1">
                {WORK.schools.points.map((p) => (
                  <li key={p.en} className="flex gap-3 text-[0.92rem] leading-relaxed">
                    <Check className="w-4 h-4 mt-1 shrink-0 text-[var(--t-accent)]" />
                    <span>{L(p)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <a href={booking(WORK.schools.note)} target="_blank" rel="noreferrer" className="teach-btn teach-btn-primary">
                  <CalendarCheck className="w-4 h-4" /> {L(WORK.schools.cta)} {arrow}
                </a>
                <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="teach-btn teach-btn-secondary">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              </div>
            </article>
          </Reveal>

          {/* Parents & students */}
          <Reveal from="end" delay={0.1}>
            <article className="teach-card learn h-full p-7 sm:p-10 flex flex-col gap-6 text-start">
              <span className="teach-icon-chip !w-14 !h-14"><GraduationCap className="w-6 h-6" /></span>
              <div className="space-y-2">
                <p className="teach-eyebrow">{L(WORK.learn.tag)}</p>
                <h3 className="font-[family-name:var(--teach-font-display)] text-3xl sm:text-4xl font-black leading-tight text-[var(--t-ink)]">{L(WORK.learn.title)}</h3>
                <p className="text-[0.95rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_72%,transparent)]">{L(WORK.learn.desc)}</p>
              </div>
              <ul className="space-y-3 flex-1">
                {WORK.learn.points.map((p) => (
                  <li key={p.en} className="flex gap-3 text-[0.92rem] leading-relaxed text-[var(--t-ink)]">
                    <Check className="w-4 h-4 mt-1 shrink-0 text-[var(--t-accent)]" />
                    <span>{L(p)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <a href={booking(WORK.learn.note)} target="_blank" rel="noreferrer" className="teach-btn teach-btn-primary">
                  <CalendarCheck className="w-4 h-4" /> {L(WORK.learn.cta)} {arrow}
                </a>
                <a
                  href={`https://wa.me/${LINKS.whatsapp}?text=${encodeURIComponent(L(WORK.learn.whatsapp))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="teach-btn teach-btn-secondary"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

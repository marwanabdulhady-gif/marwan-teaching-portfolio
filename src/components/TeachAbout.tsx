import { ArrowRight, Award, BookOpen, Youtube } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { ABOUT, LINKS } from '../teachingData';
import { navigate, scrollToSection } from '../router';
import Reveal from './Reveal';

const PILLAR_HIGHLIGHTS = [
  {
    title: { en: 'Visual First, Symbolic Second', ar: 'الفهم البصري قبل الرموز' },
    desc: {
      en: 'Every concept begins as a picture, graph, or physical comparison before moving to algebraic notation.',
      ar: 'يبدأ كل مفهوم برسم أو تمثيل بياني ملموس قبل الانتقال إلى الصياغة الجبرية المجردة.',
    },
  },
  {
    title: { en: 'Bilingual Precision (EN / AR)', ar: 'دقة ثنائية اللغة (عربي / إنجليزي)' },
    desc: {
      en: 'Seamless instruction across American, British (IGCSE), and Saudi national mathematics curricula.',
      ar: 'تدريس متقن عبر المناهج الأمريكية والبريطانية (IGCSE) والمنهج الوطني السعودي.',
    },
  },
  {
    title: { en: 'Confidence-Calibrated Practice', ar: 'ممارسة تقيس الفهم والثقة' },
    desc: {
      en: 'Self-checks, step-by-step worked scaffolds, and low-floor high-ceiling games replace rote drills.',
      ar: 'أسئلة تحقق ذاتي، أمثلة محلولة خطوة بخطوة، وألعاب تعليمية بدلاً من الحفظ الآلي.',
    },
  },
  {
    title: { en: 'Teacher-Built EdTech & AI', ar: 'تقنيات تعليمية من قلب الصف' },
    desc: {
      en: 'Interactive HTML labs, Desmos explorations, and structured AI workflows built from real classroom needs.',
      ar: 'مختبرات تفاعلية وأدوات ذكاء اصطناعي مصممة من واقع الاحتياج الفعلي داخل الحصة.',
    },
  },
];

export default function TeachAbout() {
  const { isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);

  return (
    <section id="about" className="relative py-14 md:py-20 px-5 lg:px-8 overflow-hidden">
      <div className="absolute top-1/4 start-0 w-[420px] h-[420px] rounded-full bg-cyan-500/[0.07] blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <Reveal className="text-center space-y-4 mb-12">
          <p className="teach-eyebrow">{L(ABOUT.tag)}</p>
          <h2 className="teach-section-title">
            {L(ABOUT.titlePrefix)} <em>{L(ABOUT.titleAccent)}</em>
          </h2>
          <div className="teach-divider" />
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] gap-10 lg:gap-14 items-center">
          {/* Classroom Photo Mosaic */}
          <div className="grid grid-cols-2 gap-4">
            <Reveal from="start" className="row-span-2">
              <div data-theme="dark" className="teach-card chalk h-full min-h-[400px] flex flex-col justify-between p-4">
                <div className="flex-1 min-h-0 rounded-2xl overflow-hidden">
                  <img
                    src="/photos/teaching-board.webp"
                    alt={isRtl ? 'مروان يشرح أمام اللوح' : 'Marwan teaching at the board'}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)] mt-3 leading-snug text-start">
                  {L(ABOUT.mosaic[0])}
                </p>
              </div>
            </Reveal>

            <Reveal from="end" delay={0.1}>
              <div data-theme="dark" className="teach-card chalk p-4 flex flex-col gap-3 h-full">
                <div className="rounded-xl overflow-hidden aspect-[4/5]">
                  <img
                    src="/photos/teaching-room.webp"
                    alt={isRtl ? 'مروان يشرح خطوة بخطوة' : 'Marwan explaining step by step'}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)] leading-snug text-start">
                  {L(ABOUT.mosaic[1])}
                </p>
              </div>
            </Reveal>

            <Reveal from="end" delay={0.2}>
              <div data-theme="dark" className="teach-card chalk p-4 flex flex-col gap-3 h-full">
                <div className="rounded-xl overflow-hidden aspect-[4/3]">
                  <img
                    src="/photos/andalus-grad-speech.webp"
                    alt={isRtl ? 'مروان يقدّم حفل تخرّج الصف التاسع في مدارس الأندلس' : 'Marwan presenting the Al-Andalus Grade 9 graduation'}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)] leading-snug text-start">
                  {L(ABOUT.mosaic[2])}
                </p>
              </div>
            </Reveal>
          </div>

          {/* Narrative + 4 Core Pedagogical Principles (replaces duplicate Hero stats) */}
          <div className="space-y-6 text-start">
            <Reveal delay={0.08}>
              <p className="text-[0.95rem] sm:text-[1.02rem] leading-[1.85] text-[color-mix(in_srgb,var(--t-ink)_78%,transparent)] font-light">
                {L(ABOUT.bio1)}
              </p>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="text-[0.95rem] sm:text-[1.02rem] leading-[1.85] text-[color-mix(in_srgb,var(--t-ink)_78%,transparent)] font-light">
                {L(ABOUT.bio2)}
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PILLAR_HIGHLIGHTS.map((item) => (
                  <div key={item.title.en} className="teach-card !rounded-2xl p-4 space-y-1.5">
                    <p className="text-xs font-extrabold text-[var(--t-accent)]">
                      {L(item.title)}
                    </p>
                    <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_68%,transparent)]">
                      {L(item.desc)}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.26}>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => scrollToSection('experience')}
                  className="teach-btn teach-btn-primary border-0"
                >
                  <Award className="w-4 h-4" />
                  {isRtl ? 'المسيرة والنتائج المدرسية' : 'School Track Record'}
                  <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/courses')}
                  className="teach-btn teach-btn-secondary"
                >
                  <BookOpen className="w-4 h-4" />
                  {isRtl ? 'استكشف الدورات' : 'Explore Courses'}
                </button>
                <a
                  href={LINKS.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="teach-btn teach-btn-secondary"
                >
                  <Youtube className="w-4 h-4" />
                  {L(ABOUT.cta)}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

import { ArrowRight, BookOpen, Compass, Cpu, Gamepad2, GraduationCap } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import Reveal from './Reveal';
import { Link, navigate, scrollToSection, type RoutePath } from '../router';

type Bi = { en: string; ar: string };

interface PillarItem {
  num: string;
  /** Section on the home page to scroll to… */
  targetId?: string;
  /** …or a separate page to open. */
  to?: RoutePath;
  icon: typeof GraduationCap;
  title: Bi;
  summary: Bi;
  meta: Bi;
}

const PILLARS: PillarItem[] = [
  {
    num: '01',
    targetId: 'about',
    icon: GraduationCap,
    title: { en: 'Profile & Track Record', ar: 'الملف المهني والخبرة' },
    summary: {
      en: 'Classroom philosophy, six facets of practice, school roles & 100% national exam milestones.',
      ar: 'فلسفة التدريس، ستة أدوار مهنية، المسيرة المدرسية ونتائج الاختبارات الوطنية.',
    },
    meta: { en: '12+ Years · 3 Curricula', ar: '+١٢ عاماً · ٣ مناهج' },
  },
  {
    num: '02',
    to: '/courses',
    icon: BookOpen,
    title: { en: 'Mathematics Academy & Labs', ar: 'أكاديمية الرياضيات والمختبرات' },
    summary: {
      en: '5 live visual math models, 23 Calculus & Precalculus lessons, GMAT hub, Desmos & AI Tutor.',
      ar: '٥ نماذج بصرية حية، ٢٣ درس تفاضل وما قبل التفاضل، تحضير GMAT، مختبر Desmos والمعلم الذكي.',
    },
    meta: { en: '23 Lessons · 162 Checks', ar: '٢٣ درساً · ١٦٢ تحققاً' },
  },
  {
    num: '03',
    to: '/games',
    icon: Gamepad2,
    title: { en: 'FIKR Math Arcade', ar: 'صالة ألعاب فكر للرياضيات' },
    summary: {
      en: '18 bilingual fluency & challenge games plus live 1-vs-1 classroom battle rooms.',
      ar: '١٨ لعبة ثنائية اللغة لبناء الطلاقة والتحدي مع غرف منافسة صفية مباشرة.',
    },
    meta: { en: '18 Games · Live Rooms', ar: '١٨ لعبة · غرف مباشرة' },
  },
  {
    num: '04',
    targetId: 'designs',
    icon: Cpu,
    title: { en: 'EdTech Systems & AI Studio', ar: 'الأنظمة التعليمية واستوديو الذكاء' },
    summary: {
      en: '4 flagship learning-experience platforms and a 6-workflow AI Teacher Studio workbench.',
      ar: '٤ منصات تعليمية متكاملة واستوديو الذكاء الاصطناعي للمعلم بـ ٦ مسارات عمل.',
    },
    meta: { en: '4 Products · 6 AI Tools', ar: '٤ أنظمة · ٦ أدوات ذكية' },
  },
];

/**
 * Architectural 4-pillar overview strip right below the credentials marquee so
 * school leaders, parents/students, and fellow educators can orient themselves
 * immediately and jump straight to any chapter.
 */
export default function PortfolioDirectory() {
  const { isRtl } = useLocale();
  const L = (o: Bi) => (isRtl ? o.ar : o.en);

  return (
    <section
      aria-label={isRtl ? 'خريطة أقسام الملف' : 'Portfolio directory'}
      className="relative py-12 md:py-16 px-5 lg:px-8 border-b border-[color-mix(in_srgb,var(--t-accent)_14%,transparent)]"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-[var(--t-accent)]" />
            <span className="teach-eyebrow">
              {isRtl ? 'دليل التصفح المنظّم · ٤ فصول رئيسية' : 'Portfolio Guide · 4 Organized Chapters'}
            </span>
          </div>
          <span className="text-xs text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">
            {isRtl
              ? 'اضغط على أي فصل للانتقال المباشر أو اضغط ( / ) للبحث الفوري'
              : 'Jump directly to any chapter — or press ( / ) to search everything'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILLARS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.num} delay={idx * 0.05}>
                <button
                  type="button"
                  onClick={() => (p.to ? navigate(p.to) : scrollToSection(p.targetId!))}
                  className="teach-card w-full h-full p-5 flex flex-col justify-between gap-4 text-start cursor-pointer bg-transparent group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-[color-mix(in_srgb,var(--t-accent)_12%,transparent)] text-[var(--t-accent)]">
                        {isRtl ? `فصل ${p.num}` : `CH ${p.num}`}
                      </span>
                      <span className="w-9 h-9 rounded-xl bg-[color-mix(in_srgb,var(--t-ink)_6%,transparent)] flex items-center justify-center text-[var(--t-ink)] group-hover:text-[var(--t-accent)] transition-colors">
                        <Icon className="w-4 h-4" />
                      </span>
                    </div>

                    <h3
                      className="text-lg font-black text-[var(--t-ink)] leading-snug"
                      style={{ fontFamily: 'var(--teach-font-display)' }}
                    >
                      {L(p.title)}
                    </h3>

                    <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_65%,transparent)]">
                      {L(p.summary)}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] flex items-center justify-between gap-2 text-[0.7rem] font-semibold text-[var(--t-accent)]">
                    <span className="font-mono text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">
                      {L(p.meta)}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
                        isRtl ? 'rotate-180 group-hover:-translate-x-0.5' : ''
                      }`}
                    />
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface ChapterBannerProps {
  num: string;
  label: Bi;
  subtitle: Bi;
  links?: { id: string; label: Bi }[];
  /** First thing on a page: leaves room for the fixed top bar. */
  first?: boolean;
}

/**
 * Subtle editorial landmark separating the four main chapters of the portfolio,
 * with quick anchor pills to jump between sub-sections inside that chapter.
 */
export function ChapterBanner({ num, label, subtitle, links = [], first = false }: ChapterBannerProps) {
  const { isRtl } = useLocale();
  const L = (o: Bi) => (isRtl ? o.ar : o.en);

  return (
    <div className={`px-5 lg:px-8 ${first ? 'pt-28 md:pt-32' : 'pt-10 md:pt-14'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl px-5 py-4 bg-[color-mix(in_srgb,var(--t-bg-2)_55%,transparent)] border border-[color-mix(in_srgb,var(--t-accent)_18%,transparent)] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-start">
            <span className="font-mono text-xs font-extrabold tracking-widest uppercase px-3 py-1 rounded-full bg-[var(--t-accent)] text-[#fff]">
              {isRtl ? `الفصل ${num}` : `Chapter ${num}`}
            </span>
            <span
              className="text-base sm:text-lg font-black text-[var(--t-ink)]"
              style={{ fontFamily: 'var(--teach-font-display)' }}
            >
              {L(label)}
            </span>
            <span className="hidden xl:inline text-xs text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">
              — {L(subtitle)}
            </span>
          </div>

          {links.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {links.map((lk) => (
                <button
                  key={lk.id}
                  type="button"
                  onClick={() => scrollToSection(lk.id)}
                  className="px-3 py-1.5 rounded-full text-[0.72rem] font-semibold cursor-pointer border border-[color-mix(in_srgb,var(--t-ink)_14%,transparent)] bg-[var(--t-bg)] text-[var(--t-ink)] hover:border-[var(--t-accent)] hover:text-[var(--t-accent)] transition-colors"
                >
                  {L(lk.label)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PageLinksProps {
  /** The pages to offer after this one. */
  items: { to: RoutePath; label: Bi; hint: Bi }[];
}

/** End-of-page strip: where to go next, so no page is a dead end. */
export function PageLinks({ items }: PageLinksProps) {
  const { isRtl } = useLocale();
  const L = (o: Bi) => (isRtl ? o.ar : o.en);
  return (
    <section className="px-5 lg:px-8 pb-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className="teach-card group flex items-center justify-between gap-4 px-6 py-5 text-start no-underline"
          >
            <span className="space-y-1">
              <span
                className="block text-lg font-black text-[var(--t-ink)]"
                style={{ fontFamily: 'var(--teach-font-display)' }}
              >
                {L(it.label)}
              </span>
              <span className="block text-xs text-[color-mix(in_srgb,var(--t-ink)_60%,transparent)]">{L(it.hint)}</span>
            </span>
            <ArrowRight
              className={`w-5 h-5 shrink-0 text-[var(--t-accent)] transition-transform ${
                isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'
              }`}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

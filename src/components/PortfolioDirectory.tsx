import { ArrowRight, BookOpen, Compass, Cpu, Gamepad2, GraduationCap } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { ARCADE, DESIGNS, EXPERIENCE } from '../teachingData';
import { STUDIO_TOOLS } from '../academyData';
import { COURSE_STATS, num } from '../courses/courseStats';
import { experienceStats } from '../experienceStats';
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
  /** A real photo or screenshot of the work itself. */
  image: string;
  imageAlt: Bi;
  title: Bi;
  summary: Bi;
  meta: Bi;
  cta: Bi;
}

/** The start year comes from the timeline, so the guide cannot disagree with it. */
const { sinceYear } = experienceStats(EXPERIENCE.roles);
const TEACHING_SINCE: Bi =
  sinceYear === null
    ? { en: 'Teaching track record', ar: 'المسيرة التعليمية' }
    : {
        en: `Teaching since ${sinceYear}`,
        ar: `أدرّس منذ ${sinceYear.toLocaleString('ar-EG', { useGrouping: false })}`,
      };

/** Course and game counts come from the data too, for the same reason. */
const C = COURSE_STATS;
const games = ARCADE.games.length;
const designs = DESIGNS.length;
const tools = STUDIO_TOOLS.length;

const PILLARS: PillarItem[] = [
  {
    num: '01',
    targetId: 'experience',
    icon: GraduationCap,
    image: '/photos/teaching-board.webp',
    imageAlt: { en: 'Marwan teaching at the board', ar: 'مروان يشرح على السبورة' },
    title: { en: 'Teaching Track Record', ar: 'المسيرة التعليمية' },
    summary: {
      en: 'School timeline and exam results first, then classroom philosophy and six facets of practice.',
      ar: 'المسيرة المدرسية ونتائج الاختبارات أولاً، ثم فلسفة التدريس وأوجه الممارسة الستة.',
    },
    meta: TEACHING_SINCE,
    cta: { en: 'See the timeline', ar: 'شاهد المسيرة' },
  },
  {
    num: '02',
    to: '/courses',
    icon: BookOpen,
    image: '/showcase/courses.webp',
    imageAlt: { en: 'The calculus course map with lesson nodes', ar: 'خريطة دورة التفاضل وعُقد الدروس' },
    title: { en: 'Courses & Visual Labs', ar: 'الدورات والمختبرات البصرية' },
    summary: {
      en: `${C.courses} courses from Algebra 1 to Calculus, each lesson with a hands-on lab and practice, plus ${C.gmatTopics} GMAT topics.`,
      ar: `${num(C.courses, true)} دورات من الجبر ١ إلى التفاضل، في كل درس مختبر تفاعلي وتدريب، مع ${num(C.gmatTopics, true)} موضوعاً في GMAT.`,
    },
    meta: {
      en: `${C.lessons} lessons · ${C.questions} questions`,
      ar: `${num(C.lessons, true)} درساً · ${num(C.questions, true)} سؤالاً`,
    },
    cta: { en: 'Open the courses', ar: 'افتح الدورات' },
  },
  {
    num: '03',
    to: '/games',
    icon: Gamepad2,
    image: '/showcase/games.webp',
    imageAlt: { en: 'The FIKR Math Arcade game list', ar: 'قائمة ألعاب صالة فكر للرياضيات' },
    title: { en: 'Math Games', ar: 'ألعاب الرياضيات' },
    summary: {
      en: `The FIKR Math Arcade: ${games} bilingual fluency games I built for my classes, plus live 1-v-1 rooms.`,
      ar: `صالة ألعاب فكر للرياضيات: ${num(games, true)} لعبة ثنائية اللغة بنيتها لطلابي، مع غرف تحدٍّ مباشرة.`,
    },
    meta: { en: `${games} games · live rooms`, ar: `${num(games, true)} لعبة · غرف مباشرة` },
    cta: { en: 'Play the games', ar: 'العب الآن' },
  },
  {
    num: '04',
    targetId: 'designs',
    icon: Cpu,
    image: '/designs/fikr-1.webp',
    imageAlt: { en: 'FIKR Math Games lesson road', ar: 'طريق الدروس في منصة ألعاب فكر' },
    title: { en: 'EdTech Designs & AI Studio', ar: 'التصاميم التعليمية واستوديو الذكاء' },
    summary: {
      en: `${designs} learning products I designed and built, and an AI Teacher Studio with ${tools} classroom workflows.`,
      ar: `${num(designs, true)} منتجات تعليمية صممتها وبنيتها، واستوديو الذكاء الاصطناعي للمعلم بـ ${num(tools, true)} مسارات عمل.`,
    },
    meta: { en: `${designs} products · ${tools} AI tools`, ar: `${num(designs, true)} منتجات · ${num(tools, true)} أدوات ذكية` },
    cta: { en: 'See the designs', ar: 'شاهد التصاميم' },
  },
];

/**
 * The four-chapter guide as a visual showcase: each chapter shows a real photo
 * or screenshot of the work, what it is in one line, and how much of it there
 * is (counted from the data), and opens that chapter.
 */
export default function PortfolioDirectory() {
  const { isRtl } = useLocale();
  const L = (o: Bi) => (isRtl ? o.ar : o.en);

  return (
    <section
      aria-label={isRtl ? 'خريطة أقسام الملف' : 'Portfolio directory'}
      className="relative py-14 md:py-20 px-5 lg:px-8 border-b border-[color-mix(in_srgb,var(--t-accent)_14%,transparent)]"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        <Reveal className="text-center space-y-3">
          <p className="teach-eyebrow inline-flex items-center gap-2">
            <Compass className="w-4 h-4" aria-hidden="true" />
            {isRtl ? 'دليل الملف · ٤ فصول' : 'Portfolio guide · 4 chapters'}
          </p>
          <h2 className="teach-section-title !text-[clamp(1.7rem,3.6vw,2.6rem)]">
            {isRtl ? 'أعمالي' : 'My work,'} <em>{isRtl ? 'في مكان واحد' : 'in one place'}</em>
          </h2>
          <div className="teach-divider" />
          <p className="teach-section-desc">
            {isRtl
              ? 'اختر فصلاً للانتقال إليه مباشرة، أو اضغط ( / ) للبحث في كل شيء.'
              : 'Pick a chapter to jump straight to it, or press ( / ) to search everything.'}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PILLARS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.num} delay={idx * 0.05}>
                <button
                  type="button"
                  onClick={() => (p.to ? navigate(p.to) : scrollToSection(p.targetId!))}
                  className="teach-card w-full h-full flex flex-col text-start cursor-pointer bg-transparent group overflow-hidden !p-0"
                >
                  <span className="relative block w-full aspect-[16/10] overflow-hidden bg-[color-mix(in_srgb,var(--t-ink)_8%,transparent)]">
                    <img
                      src={p.image}
                      alt={L(p.imageAlt)}
                      loading="lazy"
                      decoding="async"
                      width={960}
                      height={600}
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <span className="absolute top-3 start-3 font-mono text-[0.68rem] font-bold px-2.5 py-1 rounded-full bg-[var(--t-accent)] text-[#fff] shadow-md">
                      {isRtl ? `فصل ${p.num}` : `CH ${p.num}`}
                    </span>
                    <span className="absolute top-3 end-3 w-8 h-8 rounded-xl bg-[var(--t-bg)] text-[var(--t-ink)] flex items-center justify-center shadow-md">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </span>

                  <span className="flex flex-col flex-1 gap-3 p-5">
                    <span className="block font-mono text-[0.7rem] font-semibold text-[var(--t-accent)]">
                      {L(p.meta)}
                    </span>
                    <h3
                      className="text-lg font-black text-[var(--t-ink)] leading-snug"
                      style={{ fontFamily: 'var(--teach-font-display)' }}
                    >
                      {L(p.title)}
                    </h3>
                    <span className="block text-[0.8rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">
                      {L(p.summary)}
                    </span>
                    <span className="mt-auto pt-3 border-t border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] flex items-center justify-between gap-2 text-[0.78rem] font-bold text-[var(--t-accent)]">
                      {L(p.cta)}
                      <ArrowRight
                        aria-hidden="true"
                        className={`w-4 h-4 transition-transform ${
                          isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                        }`}
                      />
                    </span>
                  </span>
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

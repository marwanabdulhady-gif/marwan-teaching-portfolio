import { ArrowRight, BookOpen, Compass, Cpu, Gamepad2, GraduationCap } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { ARCADE, DESIGNS, EXPERIENCE } from '../teachingData';
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
  title: Bi;
  /** One short fact, counted from the data. */
  meta: Bi;
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

/** Course, game and product counts come from the data too, for the same reason. */
const C = COURSE_STATS;
const games = ARCADE.games.length;
const designs = DESIGNS.length;

const PILLARS: PillarItem[] = [
  {
    num: '01',
    targetId: 'about',
    icon: GraduationCap,
    title: { en: 'Profile & Track Record', ar: 'الملف المهني والمسيرة' },
    meta: TEACHING_SINCE,
  },
  {
    num: '02',
    to: '/courses',
    icon: BookOpen,
    title: { en: 'Courses & Visual Labs', ar: 'الدورات والمختبرات' },
    meta: { en: `${C.lessons} lessons`, ar: `${num(C.lessons, true)} درساً` },
  },
  {
    num: '03',
    to: '/games',
    icon: Gamepad2,
    title: { en: 'Math Games', ar: 'ألعاب الرياضيات' },
    meta: { en: `${games} games`, ar: `${num(games, true)} لعبة` },
  },
  {
    num: '04',
    targetId: 'designs',
    icon: Cpu,
    title: { en: 'EdTech Designs', ar: 'التصاميم التعليمية' },
    meta: { en: `${designs} products`, ar: `${num(designs, true)} منتجات` },
  },
];

/**
 * The chapter guide as one compact row of small buttons: where everything is,
 * without taking a screen to say it. Each button opens its chapter.
 */
export default function PortfolioDirectory() {
  const { isRtl } = useLocale();
  const L = (o: Bi) => (isRtl ? o.ar : o.en);

  return (
    <nav
      aria-label={isRtl ? 'خريطة أقسام الملف' : 'Portfolio directory'}
      className="relative px-5 lg:px-8 pt-10 md:pt-14"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-5">
        <p className="teach-eyebrow inline-flex items-center gap-2 shrink-0">
          <Compass className="w-4 h-4" aria-hidden="true" />
          {isRtl ? 'دليل الملف' : 'Portfolio guide'}
        </p>

        <ul className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2 list-none flex-1">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <li key={p.num} className="min-w-0">
                <button
                  type="button"
                  onClick={() => (p.to ? navigate(p.to) : scrollToSection(p.targetId!))}
                  className="group w-full h-full min-h-11 inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl lg:rounded-full text-start cursor-pointer border border-[color-mix(in_srgb,var(--t-ink)_14%,transparent)] bg-[var(--t-bg)] text-[var(--t-ink)] hover:border-[var(--t-accent)] transition-colors"
                >
                  <Icon className="w-4 h-4 shrink-0 text-[var(--t-accent)]" aria-hidden="true" />
                  <span className="min-w-0 leading-tight">
                    <span className="block text-[0.78rem] font-bold lg:whitespace-nowrap">{L(p.title)}</span>
                    <span className="block font-mono text-[0.64rem] text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)] lg:whitespace-nowrap">
                      {L(p.meta)}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className={`hidden sm:block w-3.5 h-3.5 shrink-0 ms-auto text-[var(--t-accent)] transition-transform ${
                      isRtl ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>

        <p className="hidden xl:block text-xs text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)] shrink-0">
          {isRtl ? 'أو اضغط ( / ) للبحث' : 'or press ( / ) to search'}
        </p>
      </div>
    </nav>
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

import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { ArrowUp } from 'lucide-react';
import { LocaleProvider, useLocale } from './LocaleContext';
import TeachNav from './components/TeachNav';
import TeachHero from './components/TeachHero';
import CredentialsBar from './components/CredentialsBar';
import PortfolioDirectory, { ChapterBanner, PageLinks } from './components/PortfolioDirectory';
import TeachAbout from './components/TeachAbout';
import Experience from './components/Experience';
import VisualMathShowcase from './components/VisualMathShowcase';
import ResourceLibrary from './components/ResourceLibrary';
import MathLab from './components/MathLab';
import LearningDesigns from './components/LearningDesigns';
import WorkWithMe from './components/WorkWithMe';
import TeachFooter from './components/TeachFooter';
import { HOME_SECTIONS } from './homeSections';
import { settleScroll, usePath, type RoutePath } from './router';
import { COURSE_STATS, num } from './courses/courseStats';
import './teaching.css';

/** Page → the nav item that stays lit for the whole page. */
const PAGE_NAV_ID: Partial<Record<RoutePath, string>> = { '/courses': 'resources', '/games': 'lab' };

const TITLES: Record<RoutePath, { en: string; ar: string }> = {
  '/': {
    en: 'Marwan Abdulhady — Mathematics Educator & Instructional Designer',
    ar: 'مروان عبد الهادي — معلم رياضيات ومصمم تعليمي',
  },
  '/courses': { en: 'Courses & Visual Labs — Marwan Abdulhady', ar: 'الدورات والمختبرات البصرية — مروان عبد الهادي' },
  '/games': { en: 'Math Games — Marwan Abdulhady', ar: 'ألعاب الرياضيات — مروان عبد الهادي' },
};

function HomePage() {
  return (
    <>
      {/* Orientation: hero and credentials */}
      <TeachHero />
      <CredentialsBar />

      {/* CHAPTER 01 · Profile & Teaching Track Record: the person, then the proof */}
      <ChapterBanner
        num="01"
        label={{ en: 'Profile & Teaching Track Record', ar: 'الملف المهني والمسيرة التعليمية' }}
        subtitle={{
          en: 'Who I am and how I teach, then the schools, roles and exam results behind it.',
          ar: 'من أنا وكيف أدرّس، ثم المدارس والأدوار ونتائج الاختبارات التي تقف خلف ذلك.',
        }}
        links={[
          { id: 'about', label: { en: 'Meet Mr. Marwan', ar: 'تعرّف على الأستاذ مروان' } },
          { id: 'experience', label: { en: 'School Timeline', ar: 'المسيرة المدرسية' } },
        ]}
      />
      <TeachAbout />
      <Experience />

      {/* The chapter guide: a compact row of buttons to every part of the site */}
      <PortfolioDirectory />

      {/* CHAPTER 04 · EdTech Designs. The AI Teacher Studio is parked until it
          really generates something: see docs/later-improvements.md. */}
      <ChapterBanner
        num="04"
        label={{ en: 'EdTech Designs', ar: 'التصاميم التعليمية' }}
        subtitle={{
          en: 'Learning products I designed from the learner up, then built myself.',
          ar: 'منتجات تعليمية صممتها انطلاقاً من المتعلم ثم بنيتها بنفسي.',
        }}
      />
      <LearningDesigns />
      <WorkWithMe />
    </>
  );
}

function CoursesPage() {
  return (
    <>
      <ChapterBanner
        first
        num="02"
        label={{ en: 'Courses & Visual Labs', ar: 'الدورات والمختبرات البصرية' }}
        subtitle={{
          en: `Live mathematical models leading into ${COURSE_STATS.lessons} bilingual lessons across ${COURSE_STATS.courses} courses, each with a hands-on lab, plus Desmos, GMAT prep and the AI Math Tutor.`,
          ar: `نماذج رياضية متحركة تقود إلى ${num(COURSE_STATS.lessons, true)} درساً ثنائي اللغة في ${num(COURSE_STATS.courses, true)} دورات، في كل درس مختبر تفاعلي، مع Desmos وتحضير GMAT والمعلم الذكي.`,
        }}
        links={[
          { id: 'visual-math', label: { en: 'Visual Math Models', ar: 'النماذج البصرية' } },
          { id: 'resources', label: { en: `${COURSE_STATS.lessons} Lessons & Labs`, ar: `${num(COURSE_STATS.lessons, true)} درساً والمختبرات` } },
        ]}
      />
      <VisualMathShowcase />
      <ResourceLibrary />
      <PageLinks
        items={[
          { to: '/games', label: { en: 'Next: Math Games', ar: 'التالي: ألعاب الرياضيات' }, hint: { en: 'Practise fluency with 18 games', ar: 'تدرّب على الطلاقة عبر ١٨ لعبة' } },
          { to: '/', label: { en: 'Back to the profile', ar: 'العودة إلى الملف المهني' }, hint: { en: 'About, track record and EdTech work', ar: 'نبذة والمسيرة وأعمال التقنية التعليمية' } },
        ]}
      />
      <WorkWithMe />
    </>
  );
}

function GamesPage() {
  return (
    <>
      <ChapterBanner
        first
        num="03"
        label={{ en: 'Gamified Practice · FIKR Math Arcade', ar: 'التعلّم باللعب · صالة ألعاب فكر للرياضيات' }}
        subtitle={{
          en: '18 browser-ready fluency games across four difficulty tiers plus live 1-v-1 multiplayer rooms.',
          ar: '١٨ لعبة طلاقة رياضية مصنفة في ٤ مستويات بالإضافة إلى غرف التحدّي المباشرة.',
        }}
      />
      <MathLab />
      <PageLinks
        items={[
          { to: '/courses', label: { en: 'Next: Courses & Visual Labs', ar: 'التالي: الدورات والمختبرات' }, hint: { en: `${COURSE_STATS.lessons} bilingual lessons and live models`, ar: `${num(COURSE_STATS.lessons, true)} درساً ثنائي اللغة ونماذج حية` } },
          { to: '/', label: { en: 'Back to the profile', ar: 'العودة إلى الملف المهني' }, hint: { en: 'About, track record and EdTech work', ar: 'نبذة والمسيرة وأعمال التقنية التعليمية' } },
        ]}
      />
      <WorkWithMe />
    </>
  );
}

function TeachingPage() {
  const { isRtl } = useLocale();
  const path = usePath();
  const [spy, setSpy] = useState('hero');
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 900);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Smooth scrolling via Lenis, synced to window.__lenis for anchor buttons.
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    (window as any).__lenis = lenis;

    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, []);

  // After every page change: jump to the requested section, or back to the top.
  const first = useRef(true);
  useEffect(() => {
    settleScroll(first.current);
    first.current = false;
  }, [path]);

  useEffect(() => {
    document.title = isRtl ? TITLES[path].ar : TITLES[path].en;
  }, [path, isRtl]);

  // Scroll-spy for the nav, home page only (the other pages light one item).
  useEffect(() => {
    if (path !== '/') return;
    const onScroll = () => {
      const probe = window.scrollY + window.innerHeight * 0.36;
      let current = 'hero';
      for (const item of HOME_SECTIONS) {
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= probe) current = item.navId;
      }
      setSpy(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [path]);

  const active = PAGE_NAV_ID[path] ?? spy;

  return (
    <div className="teach-root">
      <TeachNav activeSection={active} />
      <main key={path}>
        {path === '/courses' ? <CoursesPage /> : path === '/games' ? <GamesPage /> : <HomePage />}
      </main>
      <TeachFooter />

      {/* Back to top: the pages are long, so offer a way home from anywhere */}
      <button
        type="button"
        onClick={() => {
          const lenis = (window as any).__lenis;
          if (lenis) lenis.scrollTo(0);
          else window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        aria-label={isRtl ? 'العودة للأعلى' : 'Back to top'}
        tabIndex={showTop ? 0 : -1}
        className={`fixed bottom-6 end-6 z-[900] w-11 h-11 rounded-full flex items-center justify-center cursor-pointer text-white bg-[var(--t-accent)] shadow-xl transition-all duration-300 hover:scale-105 ${
          showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function TeachingApp() {
  return (
    <LocaleProvider>
      <TeachingPage />
    </LocaleProvider>
  );
}

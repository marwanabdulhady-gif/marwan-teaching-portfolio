import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { ArrowUp } from 'lucide-react';
import { LocaleProvider, useLocale } from './LocaleContext';
import TeachNav from './components/TeachNav';
import TeachHero from './components/TeachHero';
import CredentialsBar from './components/CredentialsBar';
import PortfolioDirectory, { ChapterBanner, PageLinks } from './components/PortfolioDirectory';
import TeachAbout from './components/TeachAbout';
import ClassroomGallery from './components/ClassroomGallery';
import Experience from './components/Experience';
import VisualMathShowcase from './components/VisualMathShowcase';
import ResourceLibrary from './components/ResourceLibrary';
import MathLab from './components/MathLab';
import LearningDesigns from './components/LearningDesigns';
import AiTeacherStudio from './components/AiTeacherStudio';
import WorkWithMe from './components/WorkWithMe';
import TeachFooter from './components/TeachFooter';
import { settleScroll, usePath, type RoutePath } from './router';
import './teaching.css';

/** Home-page sections in order, mapped to the nav item that should light up. */
const HOME_SECTIONS: { id: string; navId: string }[] = [
  { id: 'hero', navId: 'hero' },
  { id: 'about', navId: 'about' },
  { id: 'gallery', navId: 'about' },
  { id: 'experience', navId: 'about' },
  { id: 'designs', navId: 'designs' },
  { id: 'studio', navId: 'studio' },
  { id: 'work', navId: 'work' },
];

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
      {/* Orientation: hero, credentials strip and the chapter directory */}
      <TeachHero />
      <CredentialsBar />
      <PortfolioDirectory />

      {/* CHAPTER 01 · Educator Profile & Track Record */}
      <ChapterBanner
        num="01"
        label={{ en: 'Educator Profile & School Track Record', ar: 'الملف المهني والمسيرة المدرسية' }}
        subtitle={{
          en: 'Teaching philosophy, six classroom roles, and school track record across international and national curricula.',
          ar: 'فلسفة التدريس، ستة أدوار صفية، والمسيرة المدرسية في المناهج الدولية والوطنية.',
        }}
        links={[
          { id: 'about', label: { en: 'Philosophy', ar: 'فلسفة التدريس' } },
          { id: 'gallery', label: { en: '6 Facets of Practice', ar: 'أوجه الممارسة الستة' } },
          { id: 'experience', label: { en: 'School Timeline', ar: 'المسيرة المدرسية' } },
        ]}
      />
      <TeachAbout />
      <ClassroomGallery />
      <Experience />

      {/* Chapters 02 and 03 live on their own pages: point to them from here */}
      <PageLinks
        items={[
          {
            to: '/courses',
            label: { en: 'Chapter 02 · Courses & Visual Labs', ar: 'الفصل ٠٢ · الدورات والمختبرات' },
            hint: { en: '23 bilingual lessons, GMAT prep, Desmos and the AI tutor', ar: '٢٣ درساً ثنائي اللغة وتحضير GMAT ومختبر Desmos والمعلم الذكي' },
          },
          {
            to: '/games',
            label: { en: 'Chapter 03 · Math Games', ar: 'الفصل ٠٣ · ألعاب الرياضيات' },
            hint: { en: '18 fluency games and live 1-v-1 rooms', ar: '١٨ لعبة طلاقة وغرف تحدٍّ مباشرة' },
          },
        ]}
      />

      {/* CHAPTER 04 · EdTech Systems & AI Teacher Studio */}
      <ChapterBanner
        num="04"
        label={{ en: 'EdTech Systems & AI Teacher Studio', ar: 'منظومات التقنية التعليمية واستوديو الذكاء الاصطناعي' }}
        subtitle={{
          en: 'Four flagship learning-design platforms alongside six practical AI classroom workflows.',
          ar: 'أربع منصات تعليمية متكاملة إلى جانب ست منظومات ذكاء اصطناعي لخدمة المعلم والطالب.',
        }}
        links={[
          { id: 'designs', label: { en: '4 Flagship Platforms', ar: '٤ منصات تعليمية' } },
          { id: 'studio', label: { en: '6 AI Workflows', ar: '٦ أدوات ذكاء اصطناعي' } },
        ]}
      />
      <LearningDesigns />
      <AiTeacherStudio />
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
          en: 'Live 60fps mathematical models leading directly into 23 bilingual lessons, Desmos explorations, GMAT prep, and the AI Math Tutor.',
          ar: 'نماذج رياضية متحركة تقود مباشرة إلى ٢٣ درساً تفاعلياً ومختبر Desmos وتحضير GMAT والمعلم الذكي.',
        }}
        links={[
          { id: 'visual-math', label: { en: 'Visual Math Models', ar: 'النماذج البصرية' } },
          { id: 'resources', label: { en: '23 Lessons & Labs', ar: '٢٣ درساً والمختبرات' } },
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
          { to: '/courses', label: { en: 'Next: Courses & Visual Labs', ar: 'التالي: الدورات والمختبرات' }, hint: { en: '23 bilingual lessons and live models', ar: '٢٣ درساً ثنائي اللغة ونماذج حية' } },
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

import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { LocaleProvider } from './LocaleContext';
import TeachNav from './components/TeachNav';
import TeachHero from './components/TeachHero';
import CredentialsBar from './components/CredentialsBar';
import PortfolioDirectory, { ChapterBanner } from './components/PortfolioDirectory';
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
import './teaching.css';

/**
 * Ordered DOM section IDs matching the 4-chapter portfolio layout, mapped to
 * the top-bar navigation pillar IDs so scroll-spy highlighting stays seamless
 * across every sub-section.
 */
const SECTION_ORDER: { id: string; navId: string }[] = [
  { id: 'hero', navId: 'hero' },
  { id: 'about', navId: 'about' },
  { id: 'gallery', navId: 'about' },
  { id: 'experience', navId: 'about' },
  { id: 'visual-math', navId: 'resources' },
  { id: 'resources', navId: 'resources' },
  { id: 'lab', navId: 'lab' },
  { id: 'designs', navId: 'designs' },
  { id: 'studio', navId: 'studio' },
  { id: 'work', navId: 'work' },
];

function TeachingPage() {
  const [active, setActive] = useState('hero');

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

  // Scroll-spy for the active chapter pill in TeachNav.
  useEffect(() => {
    const onScroll = () => {
      const probe = window.scrollY + window.innerHeight * 0.36;
      let current = 'hero';
      for (const item of SECTION_ORDER) {
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= probe) current = item.navId;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="teach-root">
      <TeachNav activeSection={active} />
      <main>
        {/* Orientation: Hero, Credentials Strip & 4-Chapter Directory */}
        <TeachHero />
        <CredentialsBar />
        <PortfolioDirectory />

        {/* CHAPTER 01 · Educator Profile & Track Record */}
        <ChapterBanner
          num="01"
          label={{
            en: 'Educator Profile & School Track Record',
            ar: 'الملف المهني والمسيرة المدرسية',
          }}
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

        {/* CHAPTER 02 · Interactive Mathematics Academy & Labs */}
        <ChapterBanner
          num="02"
          label={{
            en: 'Interactive Mathematics Academy & Visual Labs',
            ar: 'أكاديمية الرياضيات التفاعلية والمختبرات البصرية',
          }}
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

        {/* CHAPTER 03 · Gamified Classroom Practice */}
        <ChapterBanner
          num="03"
          label={{
            en: 'Gamified Practice · FIKR Math Arcade',
            ar: 'التعلّم باللعب · صالة ألعاب فكر للرياضيات',
          }}
          subtitle={{
            en: '18 browser-ready fluency games across four difficulty tiers plus live 1-v-1 multiplayer rooms.',
            ar: '١٨ لعبة طلاقة رياضية مصنفة في ٤ مستويات بالإضافة إلى غرف التحدّي المباشرة.',
          }}
          links={[
            { id: 'lab', label: { en: '18 Games & Live Rooms', ar: '١٨ لعبة وغرف التحدّي' } },
          ]}
        />
        <MathLab />

        {/* CHAPTER 04 · EdTech Systems & AI Teacher Studio */}
        <ChapterBanner
          num="04"
          label={{
            en: 'EdTech Systems & AI Teacher Studio',
            ar: 'منظومات التقنية التعليمية واستوديو الذكاء الاصطناعي',
          }}
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

        {/* Enquiries & Collaboration */}
        <WorkWithMe />
      </main>
      <TeachFooter />
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

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Lenis from 'lenis';
import { ArrowUp } from 'lucide-react';
import { useLocale } from './LocaleContext';
import useActiveSection from './useActiveSection';
import { NAV_ITEMS, BRAND } from './teachingData';
import TeachNav from './components/TeachNav';
import TeachHero from './components/TeachHero';
import CredentialsBar from './components/CredentialsBar';
import TeachAbout from './components/TeachAbout';
import ResourceLibrary from './components/ResourceLibrary';
import LearningDesigns from './components/LearningDesigns';
import Experience from './components/Experience';
import MathLab from './components/MathLab';
import ClassroomGallery from './components/ClassroomGallery';
import WorkWithMe from './components/WorkWithMe';
import TeachFooter from './components/TeachFooter';
import './teaching.css';

const SECTIONS = ['hero', ...NAV_ITEMS.map((item) => item.id), 'work'];

/**
 * Mathematics teaching portfolio (`/teaching`).
 *
 * Adapted from the SciGenius single-page template — same nine-section skeleton,
 * same glass-on-navy visual language — re-authored around Marwan's real
 * credentials and rendered with the app's existing motion + Lenis stack.
 */
export default function TeachingApp() {
  const { isRtl } = useLocale();
  const activeSection = useActiveSection(SECTIONS);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  // Page title follows the route.
  useEffect(() => {
    const previous = document.title;
    document.title = isRtl
      ? `${BRAND.wordmarkAr} — معلم رياضيات ومصمم تعليمي`
      : `${BRAND.wordmark} — Mathematics Educator & Instructional Designer`;
    return () => {
      document.title = previous;
    };
  }, [isRtl]);

  // Reading progress + scroll-to-top visibility.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (y / total) * 100 : 0);
      setShowTop(y > 500);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Buttery inertial scrolling, matching the corporate portfolio.
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.065, wheelMultiplier: 0.95, smoothWheel: true, anchors: { offset: -92 } });
    (window as any).__lenis = lenis;
    let rafId = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(rafId);
      (window as any).__lenis = undefined;
      lenis.destroy();
    };
  }, []);

  return (
    <div className="teach-root teach-noise min-h-screen">
      {/* Reading progress */}
      <div className="fixed top-0 inset-x-0 h-[2px] bg-white/[0.06] z-[950] pointer-events-none">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 to-cyan-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <TeachNav activeSection={activeSection} />

      <main>
        <TeachHero />
        <CredentialsBar />
        <TeachAbout />
        <Experience />
        <LearningDesigns />
        <ResourceLibrary />
        <MathLab />
        <ClassroomGallery />
        <WorkWithMe />
      </main>

      <TeachFooter />

      <AnimatePresence>
        {showTop && (
          <motion.button
            key="teach-top"
            initial={{ opacity: 0, scale: 0.8, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 14 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={() => {
              const lenis = (window as any).__lenis;
              if (lenis) lenis.scrollTo(0);
              else window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="fixed bottom-6 end-6 z-[900] w-11 h-11 rounded-full bg-[color-mix(in_srgb,var(--t-glass)_7%,transparent)] border border-[color-mix(in_srgb,var(--t-accent)_30%,transparent)] backdrop-blur-xl text-cyan-300 hover:text-white hover:border-cyan-400/60 flex items-center justify-center cursor-pointer shadow-xl transition-colors"
            aria-label={isRtl ? 'العودة للأعلى' : 'Scroll to top'}
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

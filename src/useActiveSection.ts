import { useEffect, useState } from 'react';

/**
 * Scrollspy: reports which of the given section ids currently dominates the
 * viewport, so the navbar and floating dock can highlight the active anchor.
 */
export default function useActiveSection(sectionIds: string[]): string {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? '');

  useEffect(() => {
    const visibility = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let bestId = '';
        let bestRatio = 0;
        for (const id of sectionIds) {
          const ratio = visibility.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        if (bestId) setActiveId(bestId);
      },
      // Bands of thresholds keep updates smooth on tall sections
      { threshold: [0.1, 0.25, 0.5, 0.75], rootMargin: '-88px 0px 0px 0px' }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    // Bottom-of-page fallback: the last section (footer CTA) can scroll fully
    // out of view behind the footer, so force it active near the page end.
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80) {
        setActiveId(sectionIds[sectionIds.length - 1]);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sectionIds.join(',')]);

  return activeId;
}

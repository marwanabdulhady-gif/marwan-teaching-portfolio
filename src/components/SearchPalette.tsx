import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, BookOpen, Gamepad2, Search, Sparkles, X } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { ARCADE } from '../teachingData';
import {
  ACADEMY_LESSONS,
  EXTRA_SEARCH_ENTRIES,
  SEARCH_UI,
} from '../academyData';
import { afterPageMount, scrollToSection } from '../router';
import { COURSES, LESSONS } from '../courses/courseGraph';
import { openLessonEverywhere } from '../courses/openLesson';

interface SearchResultItem {
  id: string;
  code: string;
  badge: { en: string; ar: string };
  title: { en: string; ar: string };
  searchText: string;
  kind: 'academy' | 'studio' | 'arcade' | 'lesson';
  href?: string;
  /** Map lesson (Algebra 1/2, Geometry) — opens the panel, not an iframe. */
  lessonKey?: string;
  studioTool?: string;
  arcadeId?: string;
}

function normalise(s: string) {
  return s.toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
}

export function openAcademyWorkspace(url: string, title: string) {
  afterPageMount('/courses', () => {
    window.dispatchEvent(new CustomEvent('marwan:open-academy', { detail: { url, title } }));
    scrollToSection('resources');
  });
}

export function openArcadeGame(id: string, title: string) {
  afterPageMount('/games', () => {
    window.dispatchEvent(new CustomEvent('marwan:open-arcade', { detail: { id, title } }));
    scrollToSection('lab');
  });
}

export default function SearchPalette() {
  const { isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const catalog = useMemo<SearchResultItem[]>(() => {
    const lessons: SearchResultItem[] = ACADEMY_LESSONS.map((l) => ({
      id: `lesson-${l.courseSlug}-${l.id}`,
      code: l.code,
      badge: {
        en: `${l.grade.en} · ${l.courseTitle.en} · ${l.code}`,
        ar: `${l.grade.ar} · ${l.courseTitle.ar} · ${l.code}`,
      },
      title: l.title,
      searchText: normalise(
        `${l.id} ${l.code} ${l.courseTitle.en} ${l.courseTitle.ar} ${l.title.en} ${l.title.ar} ${l.keywords}`,
      ),
      kind: 'academy',
      href: l.href,
    }));

    // Authored courses live only in the learning map, so they need their own
    // entries; the academy lessons above already cover the iframe courses.
    const mapLessons: SearchResultItem[] = Object.values(LESSONS)
      // Authored lessons have no page; GMAT topics have one but still deserve a
      // result that opens the lab panel rather than a cold iframe.
      .filter((lesson) => !lesson.hasPage || lesson.course === 'gmat')
      .map((lesson) => {
        const course = COURSES.find((entry) => entry.id === lesson.course);
        const badge = {
          en: `${course?.title.en ?? ''} · ${lesson.code}`,
          ar: `${course?.title.ar ?? ''} · ${lesson.code}`,
        };
        return {
          id: `map-${lesson.key}`,
          code: lesson.code,
          badge,
          title: lesson.title,
          searchText: normalise(
            `${lesson.key} ${lesson.code} ${badge.en} ${badge.ar} ${lesson.title.en} ${lesson.title.ar} ${lesson.topics
              .map((topic) => `${topic.en} ${topic.ar}`)
              .join(' ')}`,
          ),
          kind: 'lesson' as const,
          lessonKey: lesson.key,
        };
      });

    const extras: SearchResultItem[] = EXTRA_SEARCH_ENTRIES.map((e) => ({
      id: `extra-${e.id}`,
      code: e.code,
      badge: e.badge,
      title: e.title,
      searchText: normalise(`${e.id} ${e.code} ${e.badge.en} ${e.badge.ar} ${e.title.en} ${e.title.ar} ${e.keywords}`),
      kind: e.kind,
      href: e.href,
      studioTool: e.studioTool,
      arcadeId: e.arcadeId,
    }));

    const games: SearchResultItem[] = ARCADE.games.map((g) => ({
      id: `game-${g.id}`,
      code: g.icon,
      badge: { en: 'FIKR Math Arcade', ar: 'صالة ألعاب فكر' },
      title: g.title,
      searchText: normalise(`${g.id} ${g.title.en} ${g.title.ar} ${g.desc.en} ${g.desc.ar} game arcade`),
      kind: 'arcade',
      arcadeId: g.id,
    }));

    return [...lessons, ...mapLessons, ...extras, ...games];
  }, []);

  const results = useMemo(() => {
    const q = normalise(query);
    if (!q) return catalog.slice(0, 10);

    const words = q.split(' ').filter(Boolean);
    return catalog
      .map((item) => {
        const codeNorm = normalise(item.code);
        const titleEn = normalise(item.title.en);
        const titleAr = normalise(item.title.ar);
        const matched = words.every((w) => item.searchText.includes(w));
        if (!matched) return null;

        // Exact LessonSearch scoring model (100 code, 80 exact title, 40 prefix, 20 substring)
        let score = 10;
        if (codeNorm === q) score += 100;
        if (titleEn === q || titleAr === q) score += 80;
        if (titleEn.startsWith(q) || titleAr.startsWith(q)) score += 40;
        if (titleEn.includes(q) || titleAr.includes(q)) score += 20;
        return { item, score };
      })
      .filter((x): x is { item: SearchResultItem; score: number } => x !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 9)
      .map((x) => x.item);
  }, [catalog, query]);

  useEffect(() => {
    setActive(0);
  }, [query, open]);

  // Global "/" and Cmd/Ctrl+K shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (!open && e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.repeat) {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.isContentEditable ||
            target.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]'))
        ) {
          return;
        }
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const selectItem = (item: SearchResultItem) => {
    setOpen(false);
    if (item.kind === 'academy' && item.href) {
      openAcademyWorkspace(item.href, L(item.title));
    } else if (item.kind === 'lesson' && item.lessonKey) {
      openLessonEverywhere(item.lessonKey);
    } else if (item.kind === 'studio') {
      scrollToSection('studio');
    } else if (item.kind === 'arcade' && item.arcadeId) {
      openArcadeGame(item.arcadeId, L(item.title));
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={L(SEARCH_UI.trigger)}
        title={`${L(SEARCH_UI.trigger)} (/)`}
        className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-[0.72rem] font-semibold transition-colors cursor-pointer bg-[color-mix(in_srgb,var(--t-glass)_8%,transparent)] border border-[color-mix(in_srgb,var(--t-accent)_25%,transparent)] text-[color-mix(in_srgb,var(--t-ink)_82%,transparent)] hover:border-cyan-400/60 hover:text-cyan-300"
      >
        <Search className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden 2xl:inline whitespace-nowrap">{L(SEARCH_UI.trigger)}</span>
        <kbd className="hidden 2xl:inline-block px-1.5 py-0.5 text-[0.62rem] font-mono rounded bg-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">
          /
        </kbd>
      </button>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setOpen(false);
                }}
                dir={isRtl ? 'rtl' : 'ltr'}
                role="dialog"
                aria-modal="true"
                aria-label={L(SEARCH_UI.title)}
                className="fixed inset-0 z-[1200] bg-black/55 backdrop-blur-sm flex items-start justify-center pt-[8vh] px-4 pb-6 overflow-y-auto"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -10 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setOpen(false);
                    } else if (e.key === 'ArrowDown' && results.length) {
                      e.preventDefault();
                      setActive((a) => (a + 1) % results.length);
                    } else if (e.key === 'ArrowUp' && results.length) {
                      e.preventDefault();
                      setActive((a) => (a - 1 + results.length) % results.length);
                    } else if (e.key === 'Enter' && results[active]) {
                      e.preventDefault();
                      selectItem(results[active]);
                    }
                  }}
                  className="w-full max-w-xl rounded-3xl bg-[var(--t-bg)] text-[var(--t-ink)] border border-[color-mix(in_srgb,var(--t-accent)_28%,transparent)] shadow-2xl overflow-hidden"
                >
                  {/* Search input header */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)]">
                    <Search className="w-4 h-4 shrink-0 text-[var(--t-accent)]" />
                    <input
                      ref={inputRef}
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={L(SEARCH_UI.placeholder)}
                      className="flex-1 bg-transparent border-0 outline-none text-sm text-[var(--t-ink)] placeholder:text-[color-mix(in_srgb,var(--t-ink)_45%,transparent)]"
                    />
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label="Close"
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-[color-mix(in_srgb,var(--t-ink)_8%,transparent)] hover:bg-[color-mix(in_srgb,var(--t-ink)_15%,transparent)] text-[var(--t-ink)] cursor-pointer border-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Results list */}
                  <div className="max-h-[58vh] overflow-y-auto p-2.5">
                    {results.length === 0 ? (
                      <p className="py-10 text-center text-sm text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">
                        {L(SEARCH_UI.empty)}
                      </p>
                    ) : (
                      <ul className="space-y-1 list-none m-0 p-0">
                        {results.map((item, idx) => {
                          const isCurrent = idx === active;
                          return (
                            <li key={item.id}>
                              <button
                                type="button"
                                onMouseEnter={() => setActive(idx)}
                                onClick={() => selectItem(item)}
                                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-start cursor-pointer transition-colors border-0 ${
                                  isCurrent
                                    ? 'bg-[color-mix(in_srgb,var(--t-accent)_14%,transparent)] text-[var(--t-ink)]'
                                    : 'bg-transparent text-[var(--t-ink)] hover:bg-[color-mix(in_srgb,var(--t-ink)_6%,transparent)]'
                                }`}
                              >
                                <span className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center bg-[color-mix(in_srgb,var(--t-accent)_12%,transparent)] text-[var(--t-accent)] font-mono text-xs font-bold">
                                  {item.kind === 'arcade' ? (
                                    <Gamepad2 className="w-4 h-4" />
                                  ) : item.kind === 'studio' ? (
                                    <Sparkles className="w-4 h-4" />
                                  ) : (
                                    <BookOpen className="w-4 h-4" />
                                  )}
                                </span>
                                <span className="flex-1 min-w-0">
                                  <span className="block text-[0.68rem] font-semibold uppercase tracking-wider text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)] truncate">
                                    {L(item.badge)}
                                  </span>
                                  <span className="block text-sm font-bold leading-snug truncate mt-0.5">
                                    {L(item.title)}
                                  </span>
                                </span>
                                <ArrowRight
                                  className={`w-4 h-4 shrink-0 text-[var(--t-accent)] transition-transform ${
                                    isRtl ? 'rotate-180' : ''
                                  } ${isCurrent ? 'opacity-100' : 'opacity-40'}`}
                                />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {/* Keyboard hint footer */}
                  <div className="px-5 py-2.5 border-t border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-ink)_3%,transparent)] text-[0.68rem] font-mono text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)] text-center">
                    {L(SEARCH_UI.hint)}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

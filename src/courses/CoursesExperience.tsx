/**
 * Composes the learning map: continue strip → course switcher → Map | List →
 * map (or GMAT grid) → lesson panel. URL state lives here:
 *
 *   ?course=calculus|precalculus|gmat   ?lesson=<courseSlug>/<lessonId>
 *   ?legacy=1 forces the old list view
 *
 * Opening a lesson pushes a history entry so Back closes the panel.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocale } from '../LocaleContext';
import ContinueStrip from './ContinueStrip';
import CourseMap from './CourseMap';
import CourseSwitcher from './CourseSwitcher';
import GmatGrid from './GmatGrid';
import LessonPanel from './LessonPanel';
import MixedPractice from './MixedPractice';
import { COURSES, LESSONS, isCourseId, type CourseId, type LessonKey } from './courseGraph';
import { OPEN_LESSON_EVENT, takePendingLesson } from './openLesson';
import { pick } from './viz/controls';

const VIEW_KEY = 'marwan:courses:view';

const strings = {
  map: { en: 'Map', ar: 'الخريطة' },
  list: { en: 'List', ar: 'القائمة' },
  viewLabel: { en: 'Choose a view', ar: 'اختر العرض' },
  mapTitle: { en: 'Your path through the course', ar: 'مسارك في الدورة' },
  listNote: {
    en: 'Algebra 1, Algebra 2 and Geometry live on the map — they have no separate pages.',
    ar: 'الجبر ١ والجبر ٢ والهندسة على الخريطة — لا صفحات منفصلة لها.',
  },
};

interface CoursesExperienceProps {
  /** Opens the existing iframe workspace. */
  launchWorkspace: (url: string, title: string) => void;
  /** The existing lesson grid, rendered when List is selected. */
  listView: ReactNode;
}

export default function CoursesExperience({ launchWorkspace, listView }: CoursesExperienceProps) {
  const { isRtl } = useLocale();
  const params = new URLSearchParams(window.location.search);
  const legacy = params.get('legacy') === '1';

  const [course, setCourse] = useState<CourseId>(() => {
    const value = params.get('course');
    if (isCourseId(value)) return value;
    const lesson = params.get('lesson');
    if (lesson && LESSONS[lesson]) return LESSONS[lesson].course;
    return COURSES[0].id;
  });
  const [openKey, setOpenKey] = useState<LessonKey | null>(() => {
    const lesson = params.get('lesson');
    return lesson && LESSONS[lesson] ? lesson : null;
  });
  const [view, setView] = useState<'map' | 'list'>(() => {
    if (legacy) return 'list';
    try {
      return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'map';
    } catch {
      return 'map';
    }
  });
  const pushedRef = useRef(false);

  /** Write course/lesson/view to the URL without reloading. */
  const syncUrl = useCallback(
    (next: { course: CourseId; lesson: LessonKey | null; mode: 'push' | 'replace' }) => {
      const search = new URLSearchParams(window.location.search);
      search.set('course', next.course);
      if (next.lesson) search.set('lesson', next.lesson);
      else search.delete('lesson');
      search.delete('legacy');
      const url = `${window.location.pathname}?${search.toString()}${window.location.hash}`;
      if (next.mode === 'push') window.history.pushState({ marwanPanel: true }, '', url);
      else window.history.replaceState(window.history.state, '', url);
    },
    [],
  );

  // A search result (or a visual-model card) can ask for a lesson panel.
  useEffect(() => {
    const onRequest = (event: Event) => {
      const key = (event as CustomEvent<{ key?: LessonKey }>).detail?.key;
      if (key && LESSONS[key]) openLesson(key);
    };
    window.addEventListener(OPEN_LESSON_EVENT, onRequest);
    const pending = takePendingLesson();
    if (pending && LESSONS[pending]) openLesson(pending);
    return () => window.removeEventListener(OPEN_LESSON_EVENT, onRequest);
  }, []);

  // Keep the UI in step with Back/Forward.
  useEffect(() => {
    const onPop = () => {
      const search = new URLSearchParams(window.location.search);
      const lesson = search.get('lesson');
      setOpenKey(lesson && LESSONS[lesson] ? lesson : null);
      const value = search.get('course');
      if (isCourseId(value)) setCourse(value);
      else if (lesson && LESSONS[lesson]) setCourse(LESSONS[lesson].course);
      pushedRef.current = false;
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const changeCourse = (next: CourseId) => {
    setCourse(next);
    syncUrl({ course: next, lesson: null, mode: 'replace' });
    setOpenKey(null);
  };

  const openLesson = (key: LessonKey) => {
    const lesson = LESSONS[key];
    if (!lesson) return;
    if (lesson.course !== 'gmat') setCourse(lesson.course);
    setOpenKey(key);
    syncUrl({ course: lesson.course, lesson: key, mode: 'push' });
    pushedRef.current = true;
  };

  const closePanel = () => {
    if (pushedRef.current) {
      pushedRef.current = false;
      window.history.back();
      setOpenKey(null);
      return;
    }
    setOpenKey(null);
    syncUrl({ course, lesson: null, mode: 'replace' });
  };

  const changeView = (next: 'map' | 'list') => {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // storage blocked: the choice just won't persist
    }
  };

  return (
    <div className="space-y-5 text-start">
      {view === 'map' && <ContinueStrip onOpen={openLesson} />}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="lg:flex-1">
          <CourseSwitcher value={course} onChange={changeCourse} />
        </div>
        <div
          role="group"
          aria-label={pick(strings.viewLabel, isRtl)}
          className="inline-flex shrink-0 gap-1 self-start rounded-xl border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] p-1 lg:self-auto"
        >
          {(['map', 'list'] as const).map((option) => {
            const active = view === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => changeView(option)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border-0 transition-colors ${
                  active
                    ? 'bg-[var(--t-accent)] text-white'
                    : 'bg-transparent text-[var(--t-ink)] hover:bg-[color-mix(in_srgb,var(--t-ink)_6%,transparent)]'
                }`}
              >
                {pick(strings[option], isRtl)}
              </button>
            );
          })}
        </div>
      </div>

      {view === 'list' ? (
        <div className="space-y-4">
          <div className="teach-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_65%,transparent)]">
              {pick(strings.listNote, isRtl)}
            </p>
            <div className="flex flex-wrap gap-2">
              {COURSES.filter((entry) => entry.authored).map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    changeView('map');
                    changeCourse(entry.id);
                  }}
                  className="teach-btn teach-btn-secondary text-xs"
                >
                  {pick(entry.short, isRtl)}
                </button>
              ))}
            </div>
          </div>
          {listView}
        </div>
      ) : course === 'gmat' ? (
        <GmatGrid onOpen={launchWorkspace} />
      ) : (
        <>
          <div className="teach-card p-4 sm:p-6">
            <p className="teach-eyebrow mb-4 !text-[0.6rem]">{pick(strings.mapTitle, isRtl)}</p>
            <CourseMap course={course} currentKey={openKey} onOpen={openLesson} />
          </div>
          <MixedPractice onOpenLesson={openLesson} />
        </>
      )}

      <LessonPanel
        lessonKey={openKey}
        onClose={closePanel}
        onOpenFull={(url, title) => {
          launchWorkspace(url, title);
          closePanel();
        }}
        onNavigate={openLesson}
      />
    </div>
  );
}

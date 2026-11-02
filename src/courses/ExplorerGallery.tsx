/**
 * Every lab in a course, on one page.
 *
 * The map answers "what comes next"; this answers "show me the pictures". Each
 * card is the lesson's code, title and first topic, and clicking it opens the
 * lesson panel with the lab already loading — so a teacher can browse the
 * visual layer of a course in a few seconds, and a student can pick the topic
 * they want to play with.
 */
import { useLocale } from '../LocaleContext';
import { COURSES, LESSONS, lessonsOf, type CourseId, type LessonKey } from './courseGraph';
import { useProgress } from './progress';
import { pick } from './viz/controls';

const strings = {
  title: { en: 'Every hands-on lab in this course', ar: 'كل مختبر تفاعلي في هذه الدورة' },
  subtitle: {
    en: 'Tap a card to open the lab. Progress rings fill as you use them.',
    ar: 'اضغط بطاقة لفتح المختبر. تُكمل الحلقة كلما استخدمته.',
  },
  coverage: { en: 'lessons with a lab', ar: 'درساً بمختبر' },
  all: { en: 'all lessons have a lab', ar: 'كل الدروس لها مختبر' },
  open: { en: 'Open lab', ar: 'افتح المختبر' },
  done: { en: 'used', ar: 'مُستخدم' },
  none: {
    en: 'This course has no labs yet.',
    ar: 'لا توجد مختبرات في هذه الدورة بعد.',
  },
  chapter: { en: 'Chapter', ar: 'الفصل' },
};

interface ExplorerGalleryProps {
  course: CourseId;
  onOpen: (key: LessonKey) => void;
}

export default function ExplorerGallery({ course, onOpen }: ExplorerGalleryProps) {
  const { isRtl } = useLocale();
  const progress = useProgress();
  const definition = COURSES.find((entry) => entry.id === course) ?? COURSES[0];
  const all = lessonsOf(course);
  const withLabs = all.filter((key) => LESSONS[key]?.hasExplorer);
  const total = all.length;

  return (
    <div className="teach-card space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="teach-eyebrow !text-[0.6rem]">{pick(strings.title, isRtl)}</p>
          <h3 className="text-lg font-bold text-[var(--t-ink)]" style={{ fontFamily: 'var(--teach-font-display)' }}>
            {pick(definition.title, isRtl)}
          </h3>
          <p className="text-xs text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">{pick(strings.subtitle, isRtl)}</p>
        </div>
        <div className="text-end">
          <p className="font-mono text-lg font-black text-[var(--t-accent-deep)]" dir="ltr">
            {withLabs.length}/{total}
          </p>
          <p className="text-[0.62rem] font-bold uppercase tracking-wider text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">
            {withLabs.length === total ? pick(strings.all, isRtl) : pick(strings.coverage, isRtl)}
          </p>
        </div>
      </div>

      {withLabs.length === 0 ? (
        <p className="text-sm text-[color-mix(in_srgb,var(--t-ink)_60%,transparent)]">{pick(strings.none, isRtl)}</p>
      ) : (
        <div className="space-y-5">
          {definition.chapters.map((chapter) => {
            const keys = chapter.lessons.filter((key) => LESSONS[key]?.hasExplorer);
            if (!keys.length) return null;
            return (
              <section key={chapter.id} className="space-y-2">
                <h4 className="text-[0.74rem] font-black uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">
                  {pick(chapter.title, isRtl)}
                </h4>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {keys.map((key) => {
                    const lesson = LESSONS[key];
                    const completion = progress.completion(key);
                    const used = progress.state.lessons[key]?.explorer;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => onOpen(key)}
                        aria-label={`${pick(strings.open, isRtl)} — ${lesson.code} ${pick(lesson.title, isRtl)}`}
                        className="group flex h-full flex-col justify-between gap-2 rounded-xl border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] p-3 text-start cursor-pointer transition-colors hover:border-[var(--t-accent)] hover:bg-[color-mix(in_srgb,var(--t-accent)_6%,transparent)]"
                      >
                        <span className="flex items-start justify-between gap-2">
                          <span dir="ltr" className="font-mono text-[0.68rem] font-black text-[var(--t-accent-deep)]">
                            {lesson.code}
                          </span>
                          <span
                            aria-hidden
                            className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.7rem] ${
                              used
                                ? 'bg-[color-mix(in_srgb,var(--t-accent)_24%,var(--t-bg))] text-[var(--t-accent-deep)]'
                                : 'bg-[color-mix(in_srgb,var(--t-ink)_8%,transparent)] text-[color-mix(in_srgb,var(--t-ink)_45%,transparent)]'
                            }`}
                          >
                            &#9879;
                          </span>
                        </span>
                        <span className="text-[0.82rem] font-bold leading-snug text-[var(--t-ink)]">{pick(lesson.title, isRtl)}</span>
                        {lesson.topics[0] && (
                          <span className="text-[0.7rem] leading-snug text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
                            {pick(lesson.topics[0], isRtl)}
                          </span>
                        )}
                        <span className="mt-auto flex items-center gap-2">
                          <span className="h-1 flex-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--t-ink)_12%,transparent)]">
                            <span
                              className="block h-full rounded-full bg-[var(--t-accent)]"
                              style={{ width: `${Math.max(completion, 2)}%` }}
                            />
                          </span>
                          <span className="font-mono text-[0.6rem] font-bold text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">
                            {completion}%
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

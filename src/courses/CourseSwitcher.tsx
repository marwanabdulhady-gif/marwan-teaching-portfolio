/**
 * Calculus · Precalculus · GMAT switcher. Each item carries a progress ring;
 * arrow keys move the selection, so it behaves like a real tablist.
 */
import { useRef } from 'react';
import { useLocale } from '../LocaleContext';
import { COURSES, getCourse, lessonsOf, type CourseId } from './courseGraph';
import { useProgress } from './progress';
import { pick } from './viz/controls';

interface CourseSwitcherProps {
  value: CourseId;
  onChange: (course: CourseId) => void;
}

export default function CourseSwitcher({ value, onChange }: CourseSwitcherProps) {
  const { isRtl } = useLocale();
  const progress = useProgress();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const percentOf = (course: CourseId) => {
    if (course === 'gmat') {
      const opened = Object.keys(progress.state.gmat).length;
      return Math.round((opened / getCourse('gmat').count) * 100);
    }
    const keys = lessonsOf(course);
    if (!keys.length) return 0;
    const done = keys.filter((key) => progress.completion(key) >= 100).length;
    return Math.round((done / keys.length) * 100);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + COURSES.length) % COURSES.length;
    onChange(COURSES[next].id);
    buttons.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={isRtl ? 'اختر الدورة' : 'Choose a course'}
      className="teach-scroll-rail flex gap-2 overflow-x-auto p-1.5 rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_40%,transparent)]"
    >
      {COURSES.map((course, index) => {
        const active = course.id === value;
        const percent = percentOf(course.id);
        return (
          <button
            key={course.id}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(course.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`flex min-w-[8.5rem] flex-1 shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 cursor-pointer border-0 transition-colors ${
              active
                ? 'bg-[var(--t-accent)] text-[var(--t-on-accent)] shadow-md'
                : 'bg-transparent text-[var(--t-ink)] hover:bg-[color-mix(in_srgb,var(--t-ink)_6%,transparent)]'
            }`}
          >
            <svg width={28} height={28} viewBox="0 0 28 28" aria-hidden className="shrink-0">
              <circle cx={14} cy={14} r={11} fill="none" stroke="currentColor" strokeOpacity={0.22} strokeWidth={3} />
              <circle
                cx={14}
                cy={14}
                r={11}
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={`${(2 * Math.PI * 11 * percent) / 100} ${2 * Math.PI * 11}`}
                transform="rotate(-90 14 14)"
              />
            </svg>
            <span className="min-w-0 text-start">
              <span className="block text-xs font-black leading-tight truncate">{pick(course.short, isRtl)}</span>
              <span className={`block text-[0.65rem] font-semibold ${active ? 'text-[color-mix(in_srgb,var(--t-on-accent)_80%,var(--t-accent))]' : 'text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]'}`}>
                {course.count}{' '}
                {course.id === 'gmat' ? (isRtl ? 'موضوعاً' : 'topics') : isRtl ? 'درساً' : 'lessons'} · {percent}%
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

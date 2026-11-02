/**
 * One search box for the whole map: type any part of a lesson name, its number
 * ("2.4") or a key idea, in English or Arabic, and open the panel from the
 * result list. Arrow keys move, Enter opens, Escape clears.
 */
import { useId, useMemo, useRef, useState } from 'react';
import type { Bi } from '../teachingData';
import { useLocale } from '../LocaleContext';
import { COURSES, LESSONS, type LessonKey } from './courseGraph';
import { pick } from './viz/controls';
import { searchLessons } from './searchLessons';

const strings = {
  label: { en: 'Find a lesson', ar: 'ابحث عن درس' },
  placeholder: { en: 'Search lessons, numbers or ideas…', ar: 'ابحث في الدروس أو الأرقام أو الأفكار…' },
  results: { en: 'Search results', ar: 'نتائج البحث' },
  none: { en: 'No lesson matches that. Try a shorter word.', ar: 'لا يوجد درس مطابق. جرّب كلمة أقصر.' },
  clear: { en: 'Clear search', ar: 'امسح البحث' },
} satisfies Record<string, Bi>;

interface LessonSearchProps {
  onOpen: (key: LessonKey) => void;
}

export default function LessonSearch({ onOpen }: LessonSearchProps) {
  const { isRtl } = useLocale();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const hits = useMemo(() => searchLessons(query), [query]);
  const open = query.trim().length >= 2;

  const choose = (key: LessonKey) => {
    onOpen(key);
    setQuery('');
    setActive(0);
  };

  return (
    <div className="relative">
      <label className="relative block">
        <span className="sr-only">{pick(strings.label, isRtl)}</span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-[color-mix(in_srgb,var(--t-ink)_40%,transparent)]"
        >
          ⌕
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && hits[active] ? `${listId}-${active}` : undefined}
          placeholder={pick(strings.placeholder, isRtl)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' && hits.length) {
              event.preventDefault();
              setActive((current) => (current + 1) % hits.length);
            } else if (event.key === 'ArrowUp' && hits.length) {
              event.preventDefault();
              setActive((current) => (current - 1 + hits.length) % hits.length);
            } else if (event.key === 'Enter' && hits[active]) {
              event.preventDefault();
              choose(hits[active]);
            } else if (event.key === 'Escape') {
              setQuery('');
              setActive(0);
            }
          }}
          className="w-full rounded-xl border border-[color-mix(in_srgb,var(--t-ink)_16%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_40%,transparent)] py-2.5 pe-3 ps-9 text-sm text-[var(--t-ink)] outline-none focus-visible:border-[var(--t-accent)]"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setActive(0);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 end-2 my-auto h-7 cursor-pointer rounded-full border-0 bg-transparent px-2 text-xs font-bold text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)] hover:text-[var(--t-ink)]"
          >
            {pick(strings.clear, isRtl)}
          </button>
        )}
      </label>

      {open && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--t-ink)_14%,transparent)] bg-[var(--t-bg)] shadow-[0_18px_40px_-24px_var(--t-shadow)]">
          {hits.length === 0 ? (
            <p className="px-3 py-2.5 text-xs text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">{pick(strings.none, isRtl)}</p>
          ) : (
            <ul id={listId} role="listbox" aria-label={pick(strings.results, isRtl)} className="max-h-72 overflow-y-auto py-1">
              {hits.map((key, position) => {
                const lesson = LESSONS[key];
                const course = COURSES.find((item) => item.id === lesson.course);
                return (
                  <li
                    key={key}
                    id={`${listId}-${position}`}
                    role="option"
                    aria-selected={position === active}
                    onMouseEnter={() => setActive(position)}
                    onClick={() => choose(key)}
                    className={`flex cursor-pointer items-baseline gap-2 px-3 py-2 text-start ${
                      position === active ? 'bg-[color-mix(in_srgb,var(--t-accent)_12%,transparent)]' : ''
                    }`}
                  >
                    <span className="shrink-0 font-mono text-[0.65rem] font-bold text-[color-mix(in_srgb,var(--t-ink)_50%,transparent)]">
                      {lesson.code}
                    </span>
                    <span className="min-w-0 text-[0.82rem] font-semibold text-[var(--t-ink)]">{pick(lesson.title, isRtl)}</span>
                    <span className="ms-auto shrink-0 text-[0.62rem] text-[color-mix(in_srgb,var(--t-ink)_50%,transparent)]">
                      {course ? pick(course.short, isRtl) : ''}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="border-t border-[color-mix(in_srgb,var(--t-ink)_8%,transparent)] px-3 py-1.5 text-[0.6rem] text-[color-mix(in_srgb,var(--t-ink)_45%,transparent)]">
            {isRtl ? '↑↓ للتنقل · Enter للفتح · Esc للمسح' : '↑↓ to move · Enter to open · Esc to clear'}
          </p>
        </div>
      )}
    </div>
  );
}

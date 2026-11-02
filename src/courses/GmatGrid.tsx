/**
 * GMAT view: 24 Quantitative + 14 Data Insights topics as tiles, with a search
 * box and status filters.
 *
 * Every tile now opens the lesson panel, which carries the topic's lab, its two
 * key ideas and a button through to the full iframe lesson — so the exam course
 * has the same "picture first, page second" shape as the other five.
 */
import { useMemo, useState } from 'react';
import { useLocale } from '../LocaleContext';
import { LESSONS, type LessonKey } from './courseGraph';
import { GMAT_COUNT, GMAT_TOPICS, type GmatTopic } from './gmatTopics';
import { GMAT_CONTENT } from './gmatContent';
import { hasExplorer } from './explorers';
import { useProgress } from './progress';
import { pick } from './viz/controls';

const strings = {
  search: { en: 'Search topics', ar: 'ابحث في الموضوعات' },
  all: { en: 'All', ar: 'الكل' },
  notStarted: { en: 'Not started', ar: 'لم يبدأ' },
  done: { en: 'Opened', ar: 'تم فتحه' },
  quant: { en: 'Quantitative', ar: 'الكمي' },
  di: { en: 'Data Insights', ar: 'تحليل البيانات' },
  empty: { en: 'No topic matches that filter.', ar: 'لا يوجد موضوع مطابق.' },
  count: { en: 'topics', ar: 'موضوعاً' },
  lab: { en: 'Hands-on lab + key ideas · open the page', ar: 'مختبر وأفكار أساسية · افتح الصفحة' },
  labOnly: { en: 'Hands-on lab', ar: 'مختبر تفاعلي' },
  page: { en: 'Page', ar: 'الصفحة' },
  hint: {
    en: 'Tip: open a topic to see its lab, then jump to the full lesson to practise.',
    ar: 'نصيحة: افتح موضوعاً لترى مختبره، ثم انتقل إلى الدرس الكامل للتدريب.',
  },
};

type Filter = 'all' | 'new' | 'done';

interface GmatGridProps {
  /** Opens the lesson panel for a `gmat/<slug>` lesson. */
  onOpenTopic: (key: LessonKey) => void;
  /** Opens the iframe lesson directly. */
  onOpenPage: (url: string, title: string) => void;
}

/** Strip Arabic diacritics and Latin case so search is forgiving. */
const normalise = (text: string) =>
  text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');

export default function GmatGrid({ onOpenTopic, onOpenPage }: GmatGridProps) {
  const { isRtl } = useLocale();
  const progress = useProgress();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const groups = useMemo(() => {
    const list = GMAT_TOPICS.filter((topic) => {
      const opened = Boolean(progress.state.gmat[topic.slug]);
      if (filter === 'done' && !opened) return false;
      if (filter === 'new' && opened) return false;
      if (!query.trim()) return true;
      const haystack = normalise(`${topic.title} ${topic.ar}`);
      return haystack.includes(normalise(query));
    });
    return {
      quant: list.filter((topic) => topic.group === 'quant'),
      di: list.filter((topic) => topic.group === 'di'),
    };
  }, [filter, query, progress.state.gmat]);

  // Opening the panel records the open (progress mirrors it into the GMAT ring).
  const openTopic = (topic: GmatTopic) => onOpenTopic(`gmat/${topic.slug}`);

  const total = groups.quant.length + groups.di.length;
  const labCount = GMAT_TOPICS.filter((topic) => hasExplorer(`gmat/${topic.slug}`)).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">{pick(strings.search, isRtl)}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={pick(strings.search, isRtl)}
            className="w-full rounded-xl border border-[color-mix(in_srgb,var(--t-ink)_16%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_40%,transparent)] px-3 py-2.5 text-sm text-[var(--t-ink)] outline-none focus-visible:border-[var(--t-accent)]"
          />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={pick(strings.all, isRtl)}>
          {(
            [
              ['all', strings.all],
              ['new', strings.notStarted],
              ['done', strings.done],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
              className={`px-3 py-2 rounded-full text-[0.7rem] font-bold cursor-pointer border transition-colors ${
                filter === id
                  ? 'border-[var(--t-accent)] bg-[var(--t-accent)] text-[var(--t-on-accent)]'
                  : 'border-[color-mix(in_srgb,var(--t-ink)_16%,transparent)] bg-transparent text-[var(--t-ink)]'
              }`}
            >
              {pick(label, isRtl)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[0.72rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
        {pick(strings.hint, isRtl)}{' '}
        <span className="font-mono font-bold text-[var(--t-accent-deep)]" dir="ltr">
          {labCount}/{GMAT_COUNT.total}
        </span>{' '}
        &#9879;
      </p>

      {total === 0 && <p className="text-sm text-[color-mix(in_srgb,var(--t-ink)_60%,transparent)]">{pick(strings.empty, isRtl)}</p>}

      {(['quant', 'di'] as const).map((group) => {
        const topics = groups[group];
        if (!topics.length) return null;
        return (
          <section key={group} className="space-y-3">
            <h3 className="flex items-baseline gap-2 text-[0.74rem] font-black uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">
              {pick(group === 'quant' ? strings.quant : strings.di, isRtl)}
              <span className="font-mono text-[0.65rem] font-bold normal-case tracking-normal">
                {group === 'quant' ? GMAT_COUNT.quant : GMAT_COUNT.di} {pick(strings.count, isRtl)}
              </span>
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => {
                const key = `gmat/${topic.slug}`;
                const lesson = LESSONS[key];
                const opened = Boolean(progress.state.gmat[topic.slug]);
                const lab = hasExplorer(key);
                const content = GMAT_CONTENT[topic.slug];
                return (
                  <div key={topic.slug} className="teach-card flex flex-col justify-between gap-2 p-3 text-start">
                    <button
                      type="button"
                      onClick={() => openTopic(topic)}
                      className="cursor-pointer border-0 bg-transparent p-0 text-start"
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="font-mono text-[0.6rem] font-bold uppercase tracking-wider text-[var(--t-accent-deep)]" dir="ltr">
                          {lesson?.code}
                        </span>
                        <span
                          aria-hidden
                          className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                            opened ? 'bg-[var(--t-accent)]' : 'border border-[color-mix(in_srgb,var(--t-ink)_30%,transparent)]'
                          }`}
                        />
                      </span>
                      <span className="mt-1 block text-[0.82rem] font-bold leading-snug text-[var(--t-ink)]">
                        {isRtl ? topic.ar : topic.title}
                      </span>
                      {content?.rule && (
                        <span dir="ltr" className="mt-1 block font-mono text-[0.62rem] leading-snug text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
                          {content.rule}
                        </span>
                      )}
                    </button>
                    <span className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[0.62rem] font-semibold text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">
                        {lab && (
                          <>
                            <span aria-hidden>&#9879;</span>
                            {pick(strings.labOnly, isRtl)}
                          </>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenPage(topic.href, isRtl ? topic.ar : topic.title)}
                        className="cursor-pointer border-0 bg-transparent p-0 text-[0.62rem] font-bold text-[var(--t-accent)] underline underline-offset-2"
                        aria-label={`${pick(strings.page, isRtl)} — ${isRtl ? topic.ar : topic.title}`}
                      >
                        {pick(strings.page, isRtl)} ▸
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

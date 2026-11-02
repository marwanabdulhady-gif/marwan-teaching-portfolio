/**
 * GMAT view: 24 Quantitative + 14 Data Insights topics as tiles, with a search
 * box and status filters. Opening a tile still uses the existing workspace.
 */
import { useMemo, useState } from 'react';
import { useLocale } from '../LocaleContext';
import { GMAT_COUNT, GMAT_TOPICS, type GmatTopic } from './gmatTopics';
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
};

type Filter = 'all' | 'new' | 'done';

interface GmatGridProps {
  onOpen: (url: string, title: string) => void;
}

/** Strip Arabic diacritics and Latin case so search is forgiving. */
const normalise = (text: string) =>
  text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');

export default function GmatGrid({ onOpen }: GmatGridProps) {
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
      return normalise(topic.title).includes(normalise(query));
    });
    return {
      quant: list.filter((topic) => topic.group === 'quant'),
      di: list.filter((topic) => topic.group === 'di'),
    };
  }, [filter, query, progress.state.gmat]);

  const open = (topic: GmatTopic) => {
    progress.markGmat(topic.slug);
    onOpen(topic.href, topic.title);
  };

  const total = groups.quant.length + groups.di.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
                  ? 'border-[var(--t-accent)] bg-[var(--t-accent)] text-white'
                  : 'border-[color-mix(in_srgb,var(--t-ink)_16%,transparent)] bg-transparent text-[var(--t-ink)]'
              }`}
            >
              {pick(label, isRtl)}
            </button>
          ))}
        </div>
      </div>

      {total === 0 && (
        <p className="text-sm text-[color-mix(in_srgb,var(--t-ink)_60%,transparent)]">{pick(strings.empty, isRtl)}</p>
      )}

      {(['quant', 'di'] as const).map((group) => {
        const topics = groups[group];
        if (!topics.length) return null;
        return (
          <section key={group} className="space-y-3">
            <h4 className="flex items-baseline gap-2 text-[0.74rem] font-black uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">
              {pick(group === 'quant' ? strings.quant : strings.di, isRtl)}
              <span className="font-mono text-[0.65rem] font-bold normal-case tracking-normal">
                {group === 'quant' ? GMAT_COUNT.quant : GMAT_COUNT.di} {pick(strings.count, isRtl)}
              </span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {topics.map((topic) => {
                const opened = Boolean(progress.state.gmat[topic.slug]);
                return (
                  <button
                    key={topic.slug}
                    type="button"
                    onClick={() => open(topic)}
                    className="teach-card flex min-h-[88px] flex-col justify-between gap-2 p-3 text-start cursor-pointer bg-transparent"
                  >
                    <span className="text-[0.78rem] font-bold leading-snug text-[var(--t-ink)] line-clamp-2">
                      {topic.title}
                    </span>
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[0.6rem] uppercase tracking-wider text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">
                        {group === 'quant' ? 'Quant' : 'Data Insights'}
                      </span>
                      <span
                        aria-hidden
                        className={`h-2.5 w-2.5 rounded-full ${
                          opened ? 'bg-[var(--t-accent)]' : 'border border-[color-mix(in_srgb,var(--t-ink)_30%,transparent)]'
                        }`}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

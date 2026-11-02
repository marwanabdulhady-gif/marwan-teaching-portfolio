/**
 * Fallback for lessons that do not have a hands-on explorer yet: a still map
 * of what the lesson covers, so the panel is never empty.
 */
import { useLocale } from '../../LocaleContext';
import type { ExplorerProps } from './types';
import { pick } from '../viz/controls';

const strings = {
  eyebrow: { en: "What you'll learn", ar: 'ما ستتعلمه' },
  note: {
    en: 'This lesson opens in the full classroom view. The interactive explorer for it is on the way.',
    ar: 'يفتح هذا الدرس في العرض الصفي الكامل. المختبر التفاعلي لهذا الدرس قادم قريباً.',
  },
};

export default function Placeholder({ lesson }: ExplorerProps) {
  const { isRtl } = useLocale();
  return (
    <div className="rounded-2xl border border-dashed border-[color-mix(in_srgb,var(--t-ink)_18%,transparent)] p-4 space-y-3">
      <p className="teach-eyebrow">{pick(strings.eyebrow, isRtl)}</p>
      <ul className="space-y-1.5">
        {lesson.topics.slice(0, 6).map((topic, index) => (
          <li key={topic.en} className="flex items-start gap-2 text-sm text-[var(--t-ink)]">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--t-accent)] shrink-0" aria-hidden />
            <span>
              <span className="sr-only">{index + 1}. </span>
              {pick(topic, isRtl)}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">
        {pick(strings.note, isRtl)}
      </p>
    </div>
  );
}

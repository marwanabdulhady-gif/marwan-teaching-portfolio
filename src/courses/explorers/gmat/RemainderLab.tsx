/**
 * GMAT · remainders, units digits and sequences.
 *   remainders — n restated as qm + r, with the units-digit cycle alongside
 *   sequences  — the same table read as an arithmetic or geometric pattern
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Readout, SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'A remainder is the leftover after whole groups: n = qm + r, with 0 ≤ r < m.',
    ar: 'الباقي هو ما يتبقى بعد المجموعات الكاملة: n = qm + r حيث 0 ≤ r < m.',
  },
  seqWhat: {
    en: 'Write the first terms, then say the rule out loud: add a constant, or multiply by one.',
    ar: 'اكتب الحدود الأولى ثم قل القاعدة بصوت عالٍ: أضف ثابتاً أم اضرب في ثابت.',
  },
  n: { en: 'number n', ar: 'العدد n' },
  m: { en: 'divide by m', ar: 'القسمة على m' },
  base: { en: 'base', ar: 'الأساس' },
  step: { en: 'step', ar: 'الخطوة' },
  kind: { en: 'pattern', ar: 'النمط' },
  arithmetic: { en: 'arithmetic', ar: 'حسابية' },
  geometric: { en: 'geometric', ar: 'هندسية' },
  quotient: { en: 'quotient q', ar: 'خارج القسمة q' },
  remainder: { en: 'remainder r', ar: 'الباقي r' },
  rebuild: { en: 'qm + r', ar: 'qm + r' },
  cycle: { en: 'units digits', ar: 'أرقام الآحاد' },
  period: { en: 'cycle length', ar: 'طول الدورة' },
  terms: { en: 'first terms', ar: 'الحدود الأولى' },
  formula: { en: 'rule', ar: 'القاعدة' },
} satisfies Record<string, Bi>;

type Kind = 'arithmetic' | 'geometric';

export default function RemainderLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ n: 47, m: 5, base: 7, step: 3, kind: 0 }, onInteract);

  if (lesson.id === 'sequences') {
    const base = Math.max(1, Math.round(values.base));
    const step = values.step;
    const kind: Kind = values.kind > 0.5 ? 'geometric' : 'arithmetic';
    const terms = Array.from({ length: 6 }, (_, index) =>
      kind === 'arithmetic' ? base + index * step : base * Math.pow(Math.max(1.1, step), index),
    );

    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.seqWhat, isRtl)}</p>
        <SegmentedChoice
          label={strings.kind}
          value={kind}
          isRtl={isRtl}
          options={[
            { id: 'arithmetic', label: strings.arithmetic },
            { id: 'geometric', label: strings.geometric },
          ]}
          onChange={(id) => {
            onInteract();
            set('kind', id === 'geometric' ? 1 : 0);
          }}
        />
        <div dir="ltr" className="flex flex-wrap gap-1.5">
          {terms.map((term, index) => (
            <span
              key={index}
              className="rounded-lg border border-[color-mix(in_srgb,var(--t-accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--t-accent)_8%,transparent)] px-2.5 py-1.5 font-mono text-[0.72rem] font-bold text-[var(--t-ink)]"
            >
              {fmt(term, 2)}
            </span>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Slider label={strings.base} value={base} min={1} max={9} step={1} onChange={(value) => set('base', value)} format={(value) => fmt(value, 0)} />
          <Slider label={strings.step} value={step} min={1} max={9} step={0.5} onChange={(value) => set('step', value)} format={(value) => fmt(value, 1)} />
        </div>
        <Readout
          dir="ltr"
          rows={[
            { label: pick(strings.terms, isRtl), value: terms.slice(0, 4).map((term) => fmt(term, 1)).join(', ') + ', …' },
            {
              label: pick(strings.formula, isRtl),
              value:
                kind === 'arithmetic'
                  ? `aₙ = ${base} + (n − 1)·${fmt(step, 1)}`
                  : `aₙ = ${base} · ${fmt(Math.max(1.1, step), 1)}ⁿ⁻¹`,
              emphasis: true,
            },
            {
              label: kind === 'arithmetic' ? 'difference' : 'ratio',
              value: kind === 'arithmetic' ? fmt(step, 2) : fmt(Math.max(1.1, step), 2),
            },
          ]}
        />
      </div>
    );
  }

  const n = Math.max(1, Math.round(values.n));
  const m = Math.max(2, Math.round(values.m));
  const quotient = Math.floor(n / m);
  const remainder = n % m;
  const base = Math.max(1, Math.round(values.base));
  const units = Array.from({ length: 6 }, (_, index) => Math.pow(base, index + 1) % 10);
  // The cycle length: first repeat of the units digit.
  const firstRepeat = units.findIndex((digit, index) => index > 0 && digit === units[0]);
  const period = firstRepeat === -1 ? units.length : firstRepeat;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="flex flex-wrap items-center gap-1">
        {Array.from({ length: Math.min(24, n) }, (_, index) => {
          const filled = index < quotient * m;
          const leftover = index >= quotient * m;
          return (
            <span
              key={index}
              className={`h-4 w-4 rounded-sm border ${
                filled
                  ? 'border-[color-mix(in_srgb,var(--t-accent)_55%,transparent)] bg-[color-mix(in_srgb,var(--t-accent)_45%,transparent)]'
                  : leftover
                    ? 'border-[color-mix(in_srgb,var(--t-sun)_70%,transparent)] bg-[color-mix(in_srgb,var(--t-sun)_55%,transparent)]'
                    : 'border-[color-mix(in_srgb,var(--t-ink)_16%,transparent)]'
              }`}
              aria-hidden
            />
          );
        })}
        {n > 24 && <span className="ms-1 font-mono text-[0.68rem] text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">…</span>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.n} value={n} min={1} max={120} step={1} onChange={(value) => set('n', value)} format={(value) => fmt(value, 0)} />
        <Slider label={strings.m} value={m} min={2} max={12} step={1} onChange={(value) => set('m', value)} format={(value) => fmt(value, 0)} />
      </div>
      <Slider label={strings.base} value={base} min={2} max={9} step={1} onChange={(value) => set('base', value)} format={(value) => fmt(value, 0)} />

      <Readout
        dir="ltr"
        rows={[
          { label: pick(strings.quotient, isRtl), value: `${quotient}` },
          { label: pick(strings.remainder, isRtl), value: `${remainder}`, emphasis: true },
          { label: pick(strings.rebuild, isRtl), value: `${quotient}·${m} + ${remainder} = ${quotient * m + remainder}` },
          { label: pick(strings.cycle, isRtl), value: units.join(' ') },
          { label: `${base}… ${pick(strings.period, isRtl)}`, value: `${period}` },
        ]}
      />
    </div>
  );
}

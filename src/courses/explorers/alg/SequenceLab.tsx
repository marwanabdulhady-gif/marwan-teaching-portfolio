/**
 * Algebra 2 · 4.3 — arithmetic and geometric sequences side by side, with the
 * explicit rule, the recursive rule and the sum of the first n terms.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Readout, SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Arithmetic sequences add the same amount each step; geometric sequences multiply by the same factor.',
    ar: 'المتتابعة الحسابية تضيف المقدار نفسه كل خطوة، والهندسية تضرب في العامل نفسه.',
  },
  kind: { en: 'kind', ar: 'النوع' },
  first: { en: 'first term a₁', ar: 'الحد الأول a₁' },
  step: { en: 'common difference d', ar: 'الفرق المشترك d' },
  ratio: { en: 'common ratio r', ar: 'النسبة المشتركة r' },
  terms: { en: 'terms', ar: 'الحدود' },
  explicit: { en: 'explicit rule', ar: 'القاعدة الصريحة' },
  recursive: { en: 'recursive rule', ar: 'القاعدة التكرارية' },
  sum: { en: 'sum of the first 6', ar: 'مجموع أول ٦ حدود' },
} satisfies Record<string, Bi>;

export default function SequenceLab({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ kind: 0, a1: 2, d: 3, r: 2 }, onInteract);
  const arithmetic = values.kind < 0.5;
  const a1 = values.a1;
  const d = values.d;
  const r = Math.abs(values.r) < 0.1 ? 0.1 : values.r;

  const term = (n: number) => (arithmetic ? a1 + (n - 1) * d : a1 * Math.pow(r, n - 1));
  const terms = Array.from({ length: 6 }, (_, index) => term(index + 1));
  const sum = arithmetic
    ? (6 / 2) * (2 * a1 + 5 * d)
    : Math.abs(r - 1) < 1e-9
      ? a1 * 6
      : (a1 * (1 - Math.pow(r, 6))) / (1 - r);

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <SegmentedChoice
        label={strings.kind}
        value={arithmetic ? 'arith' : 'geo'}
        isRtl={isRtl}
        options={[
          { id: 'arith', label: { en: 'arithmetic', ar: 'حسابية' } },
          { id: 'geo', label: { en: 'geometric', ar: 'هندسية' } },
        ]}
        onChange={(id) => set('kind', id === 'arith' ? 0 : 1)}
      />

      <div dir="ltr" className="flex flex-wrap gap-1.5">
        {terms.map((value, index) => (
          <span
            key={index}
            className="flex h-11 min-w-11 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--t-accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--t-accent)_8%,transparent)] px-2 font-mono text-xs font-bold text-[var(--t-accent-deep)]"
          >
            {fmt(value, 2)}
          </span>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.first} value={a1} min={-5} max={10} step={1} onChange={(value) => set('a1', value)} format={(value) => fmt(value, 0)} />
        {arithmetic ? (
          <Slider label={strings.step} value={d} min={-4} max={6} step={1} onChange={(value) => set('d', value)} format={(value) => fmt(value, 0)} />
        ) : (
          <Slider label={strings.ratio} value={values.r} min={-2} max={3} step={0.25} onChange={(value) => set('r', value)} format={(value) => fmt(value, 2)} />
        )}
      </div>

      <Readout
        dir="ltr"
        rows={[
          { label: pick(strings.explicit, isRtl), value: arithmetic ? `aₙ = ${fmt(a1, 0)} + ${fmt(d, 0)}(n − 1)` : `aₙ = ${fmt(a1, 0)} · ${fmt(r, 2)}^(n − 1)`, emphasis: true },
          { label: pick(strings.recursive, isRtl), value: arithmetic ? `a₁ = ${fmt(a1, 0)}, aₙ = aₙ₋₁ + ${fmt(d, 0)}` : `a₁ = ${fmt(a1, 0)}, aₙ = ${fmt(r, 2)}·aₙ₋₁` },
          { label: pick(strings.sum, isRtl), value: fmt(sum, 2) },
          { label: pick(strings.terms, isRtl), value: terms.map((value) => fmt(value, 1)).join(', ') },
        ]}
      />
    </div>
  );
}

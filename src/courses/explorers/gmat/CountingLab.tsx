/**
 * GMAT · counting. Slots on a shelf: each slot has a number of choices, the
 * counts multiply, and the divide-by-r! correction appears when order stops
 * mattering.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Readout, SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Draw one slot per decision. Choices multiply when the slots are filled in sequence.',
    ar: 'ارسم خانة لكل قرار. الاختيارات تتضاعف عند ملء الخانات بالتتابع.',
  },
  n: { en: 'from n', ar: 'من n' },
  r: { en: 'choose r', ar: 'اختر r' },
  order: { en: 'order matters?', ar: 'هل يهم الترتيب؟' },
  yes: { en: 'yes — arrange', ar: 'نعم — ترتيب' },
  no: { en: 'no — select', ar: 'لا — اختيار' },
  slots: { en: 'slots', ar: 'الخانات' },
  product: { en: 'product', ar: 'حاصل الضرب' },
  permutations: { en: 'nPr', ar: 'nPr' },
  combinations: { en: 'nCr', ar: 'nCr' },
  divide: { en: 'divide by r!', ar: 'القسمة على r!' },
  either: { en: 'either/or total', ar: 'مجموع الحالتين' },
} satisfies Record<string, Bi>;

const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));

export default function CountingLab({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ n: 6, r: 3, ordered: 1 }, onInteract);
  const n = Math.max(1, Math.round(values.n));
  const r = Math.min(n, Math.max(1, Math.round(values.r)));
  const ordered = values.ordered > 0.5;

  const slots = Array.from({ length: r }, (_, index) => n - index);
  const product = slots.reduce((total, choice) => total * choice, 1);
  const nPr = factorial(n) / factorial(n - r);
  const nCr = nPr / factorial(r);

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <SegmentedChoice
        label={strings.order}
        value={ordered ? 'yes' : 'no'}
        isRtl={isRtl}
        options={[
          { id: 'yes', label: strings.yes },
          { id: 'no', label: strings.no },
        ]}
        onChange={(id) => {
          onInteract();
          set('ordered', id === 'yes' ? 1 : 0);
        }}
      />

      <div dir="ltr" className="flex flex-wrap items-center gap-1.5">
        {slots.map((choice, index) => (
          <span key={index} className="flex items-center gap-1.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--t-accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--t-accent)_10%,transparent)] font-mono text-sm font-black text-[var(--t-ink)]">
              {choice}
            </span>
            {index < slots.length - 1 && (
              <span aria-hidden className="font-mono text-sm text-[color-mix(in_srgb,var(--t-ink)_45%,transparent)]">
                ×
              </span>
            )}
          </span>
        ))}
        <span aria-hidden className="font-mono text-sm text-[color-mix(in_srgb,var(--t-ink)_45%,transparent)]">
          =
        </span>
        <span dir="ltr" className="font-mono text-sm font-black text-[var(--t-accent-deep)]">
          {orderSafe(product)}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.n} value={n} min={2} max={9} step={1} onChange={(value) => set('n', value)} format={(value) => fmt(value, 0)} />
        <Slider label={strings.r} value={r} min={1} max={n} step={1} onChange={(value) => set('r', value)} format={(value) => fmt(value, 0)} />
      </div>

      <Readout
        dir="ltr"
        rows={[
          { label: pick(strings.product, isRtl), value: slots.join(' · ') + ` = ${nPr}` },
          { label: pick(strings.permutations, isRtl), value: `${factorial(n)} / ${factorial(n - r)} = ${nPr}` },
          { label: `${pick(strings.divide, isRtl)} ${factorial(r)}`, value: `${nPr} / ${factorial(r)} = ${fmt(nCr, 0)}` },
          { label: pick(ordered ? strings.permutations : strings.combinations, isRtl), value: `${ordered ? nPr : fmt(nCr, 0)}`, emphasis: true },
        ]}
      />
      <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
        {isRtl
          ? 'اسأل: هل ترتيب الاختيار يغيّر النتيجة؟ إن نعم فـ nPr، وإن لا فـ nCr.'
          : 'Ask whether picking A then B is different from B then A. Yes → nPr, no → nCr.'}
      </p>
    </div>
  );
}

/** Keep big products readable without scientific notation. */
function orderSafe(value: number): string {
  return value >= 1e6 ? value.toExponential(2) : value.toLocaleString('en-US');
}

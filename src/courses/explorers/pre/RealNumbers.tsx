/**
 * 1.1 · Real numbers.
 *
 * Drag a point along the number line. The nested sets ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ light up
 * to show the smallest one that contains it; type an expression to try
 * something irrational.
 */
import { useMemo, useState } from 'react';
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { DragHandle, MathPlot, Point } from '../../viz/MathPlot';
import { Readout, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Every point on the line is a real number. Drag it and watch which sets contain it.',
    ar: 'كل نقطة على الخط عدد حقيقي. اسحبها وراقب المجموعات التي تحتويها.',
  },
  value: { en: 'value', ar: 'القيمة' },
  smallest: { en: 'smallest set', ar: 'أصغر مجموعة' },
  decimal: { en: 'decimal', ar: 'العشري' },
  type: { en: 'or type a number', ar: 'أو اكتب عدداً' },
  apply: { en: 'Use it', ar: 'استخدمه' },
  invalid: { en: 'That is not a real number I can read.', ar: 'هذا ليس عدداً حقيقياً يمكن قراءته.' },
  sets: { en: 'Sets containing it', ar: 'المجموعات التي تحتويها' },
  irrational: { en: 'its decimals never settle into a repeating block', ar: 'أرقامه العشرية لا تتكرر في كتلة ثابتة' },
  natural: { en: 'counting number', ar: 'عدد طبيعي' },
  integer: { en: 'whole number', ar: 'عدد صحيح' },
  rational: { en: 'fraction of integers', ar: 'كسر من عددين صحيحين' },
  real: { en: 'real', ar: 'حقيقي' },
} satisfies Record<string, Bi>;

const NAMES = [
  { id: 'N', label: 'ℕ' },
  { id: 'Z', label: 'ℤ' },
  { id: 'Q', label: 'ℚ' },
  { id: 'R', label: 'ℝ' },
];

/** Read a typed expression like `3/4`, `sqrt(2)`, `pi`, `-5`. */
function parseValue(text: string): number | null {
  const clean = text.trim().toLowerCase().replace('π', 'pi').replace('√', 'sqrt');
  if (!clean) return null;
  let expression = clean.replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)').replace(/\bpi\b/g, 'Math.PI');
  if (/^[0-9+\-*/().\sMathsqrtPI]*$/.test(expression)) {
    try {
      // eslint-disable-next-line no-new-func
      const value = Function(`"use strict"; return (${expression});`)() as number;
      return Number.isFinite(value) ? value : null;
    } catch {
      return null;
    }
  }
  return null;
}

export default function RealNumbers({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set, touched] = useExplorerState({ x: 1.5 }, onInteract);
  const [typed, setTyped] = useState('');
  const [bad, setBad] = useState(false);
  const x = values.x;

  const facts = useMemo(() => {
    const isInteger = Number.isInteger(x);
    const isNatural = isInteger && x >= 0;
    const isRational = Number.isInteger(x) || Math.abs(x * 2520 - Math.round(x * 2520)) < 1e-9;
    const smallest = isNatural ? 'N' : isInteger ? 'Z' : isRational ? 'Q' : 'R';
    return { isNatural, isInteger, isRational, smallest };
  }, [x]);

  const applyTyped = () => {
    const parsed = parseValue(typed);
    if (parsed === null) {
      setBad(true);
      return;
    }
    setBad(false);
    set('x', Math.min(10, Math.max(-10, Number(parsed.toFixed(6)))));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-10, 10]} yDomain={[-2.4, 2.4]} aspect={16 / 5} grid={false} ariaLabel={pick(strings.value, isRtl)}>
          <line x1={0} y1={120} x2={400} y2={120} stroke="var(--t-ink)" strokeOpacity={0.45} strokeWidth={2} />
          {[-10, -5, 0, 5, 10].map((tick) => (
            <g key={tick}>
              <line x1={200 + tick * 20} y1={113} x2={200 + tick * 20} y2={127} stroke="var(--t-ink)" strokeOpacity={0.5} strokeWidth={2} />
              <text x={200 + tick * 20} y={145} textAnchor="middle" fontSize={10} fill="var(--t-ink)" fillOpacity={0.6} fontFamily="ui-monospace, monospace">
                {tick}
              </text>
            </g>
          ))}
          <Point x={x} y={0} r={7} />
          <DragHandle x={x} onChange={(value) => set('x', value)} min={-10} max={10} step={0.25} ariaLabel={pick(strings.value, isRtl)} py={120} />
        </MathPlot>
      </div>

      <div className="grid gap-2 sm:grid-cols-4">
        {NAMES.map((set) => {
          const contains =
            set.id === 'R' ||
            (set.id === 'Q' && facts.isRational) ||
            (set.id === 'Z' && facts.isInteger) ||
            (set.id === 'N' && facts.isNatural);
          const smallest = facts.smallest === set.id;
          return (
            <div
              key={set.id}
              className={`rounded-xl border px-2.5 py-2 text-center transition-colors ${
                smallest
                  ? 'border-[var(--t-accent)] bg-[color-mix(in_srgb,var(--t-accent)_12%,transparent)]'
                  : contains
                    ? 'border-[color-mix(in_srgb,var(--t-ink)_18%,transparent)]'
                    : 'border-dashed border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] opacity-45'
              }`}
            >
              <span dir="ltr" className="block font-mono text-base font-black text-[var(--t-ink)]">
                {set.label}
              </span>
              <span className="block text-[0.6rem] font-semibold text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">
                {set.id === 'N' ? (isRtl ? 'طبيعي' : 'natural') : set.id === 'Z' ? (isRtl ? 'صحيح' : 'integer') : set.id === 'Q' ? (isRtl ? 'نسبي' : 'rational') : isRtl ? 'حقيقي' : 'real'}
              </span>
            </div>
          );
        })}
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.value, isRtl), value: fmt(x, 4) },
          { label: pick(strings.smallest, isRtl), value: NAMES.find((set) => set.id === facts.smallest)?.label ?? 'ℝ', emphasis: true },
          ...(facts.isRational ? [] : [{ label: pick(strings.decimal, isRtl), value: pick(strings.irrational, isRtl) }]),
        ]}
      />

      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          applyTyped();
        }}
      >
        <label className="flex-1 min-w-[10rem]">
          <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">
            {pick(strings.type, isRtl)}
          </span>
          <input
            dir="ltr"
            value={typed}
            onChange={(event) => {
              setTyped(event.target.value);
              setBad(false);
            }}
            placeholder="3/4 · sqrt(2) · pi"
            className="mt-1 w-full rounded-lg border border-[color-mix(in_srgb,var(--t-ink)_16%,transparent)] bg-transparent px-2.5 py-2 font-mono text-xs text-[var(--t-ink)]"
          />
        </label>
        <button type="submit" className="teach-btn teach-btn-secondary">
          {pick(strings.apply, isRtl)}
        </button>
      </form>
      {bad && <p className="text-[0.7rem] text-[#b5481f]">{pick(strings.invalid, isRtl)}</p>}
      {!touched && (
        <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
          {isRtl ? 'اسحب النقطة على الخط لتبدأ.' : 'Drag the point on the line to start.'}
        </p>
      )}
    </div>
  );
}

/**
 * 1.2 · Finding limits graphically and numerically.
 *
 * Two arrows close in on x₀ from the left and from the right. The table of
 * x-values tightens as you shrink the distance, and the verdict follows the
 * two one-sided values.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'The limit exists only when both sides agree — whatever the function does at the point itself.',
    ar: 'توجد النهاية فقط عندما تتفق الجهتان — أياً كان ما تفعله الدالة عند النقطة نفسها.',
  },
  shape: { en: 'function', ar: 'الدالة' },
  gap: { en: 'distance h', ar: 'المسافة h' },
  point: { en: 'approach x₀', ar: 'الاقتراب من x₀' },
  table: { en: 'values near x₀', ar: 'القيم قرب x₀' },
  leftLimit: { en: 'from the left', ar: 'من اليسار' },
  rightLimit: { en: 'from the right', ar: 'من اليمين' },
  limit: { en: 'limit', ar: 'النهاية' },
  exists: { en: 'exists ✓', ar: 'موجودة ✓' },
  missing: { en: 'does not exist ✗', ar: 'غير موجودة ✗' },
  at: { en: 'value at x₀', ar: 'القيمة عند x₀' },
} satisfies Record<string, Bi>;

type ShapeId = 'hole' | 'jump' | 'smooth';

const SHAPES: { id: ShapeId; label: Bi; f: (x: number) => number; at: number | null; left: number; right: number }[] = [
  {
    id: 'hole',
    label: { en: 'removable hole', ar: 'فتحة قابلة للإزالة' },
    f: (x) => (Math.abs(x - 2) < 1e-9 ? NaN : ((x * x - 4) / (x - 2))),
    at: 1,
    left: 4,
    right: 4,
  },
  {
    id: 'jump',
    label: { en: 'jump', ar: 'قفزة' },
    f: (x) => (x < 2 ? x + 1 : x + 3),
    at: 5,
    left: 3,
    right: 5,
  },
  {
    id: 'smooth',
    label: { en: 'smooth', ar: 'ملساء' },
    f: (x) => 0.5 * x * x,
    at: 2,
    left: 2,
    right: 2,
  },
];

export default function LimitApproach({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ shape: 0, h: 0.8 }, onInteract);
  const shape = SHAPES[Math.round(values.shape)] ?? SHAPES[0];
  const h = Math.max(0.02, values.h);
  const x0 = 2;
  const agrees = Math.abs(shape.left - shape.right) < 1e-9;

  const rows = [1, 0.5, 0.25, 0.1, 0.05, 0.01].map((factor) => {
    const step = h * factor;
    return {
      leftX: x0 - step,
      leftY: shape.f(x0 - step),
      rightX: x0 + step,
      rightY: shape.f(x0 + step),
    };
  });

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <SegmentedChoice
        label={strings.shape}
        value={shape.id}
        isRtl={isRtl}
        options={SHAPES.map((item) => ({ id: item.id, label: item.label }))}
        onChange={(id) => set('shape', SHAPES.findIndex((item) => item.id === id))}
      />

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[0, 4]} yDomain={[0, 7]} ariaLabel={pick(strings.point, isRtl)}>
          <Curve fn={shape.f} />
          <Segment x1={x0} y1={0} x2={x0} y2={7} color="var(--t-ink)" dash="4 4" opacity={0.3} />
          <Point x={x0 - h} y={shape.f(x0 - h)} r={5} color="var(--t-accent)" />
          <Point x={x0 + h} y={shape.f(x0 + h)} r={5} color="var(--t-sky)" />
          {shape.at !== null && <Point x={x0} y={shape.at} hollow r={4} color="var(--t-sun)" label={pick(strings.at, isRtl)} />}
        </MathPlot>
      </div>

      <Slider label={strings.gap} value={values.h} min={0.02} max={1.5} step={0.01} onChange={(value) => set('h', value)} format={(value) => fmt(value, 2)} />

      <div dir="ltr" className="overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)]">
        <table className="w-full border-collapse font-mono text-[0.7rem]">
          <caption className="px-2 py-1.5 text-start text-[0.65rem] font-bold uppercase tracking-wider text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">
            {pick(strings.table, isRtl)}
          </caption>
          <thead>
            <tr className="bg-[color-mix(in_srgb,var(--t-ink)_5%,transparent)]">
              <th className="px-2 py-1 text-end font-bold">x</th>
              <th className="px-2 py-1 text-end font-bold">f(x)</th>
              <th className="px-2 py-1 text-end font-bold">x</th>
              <th className="px-2 py-1 text-end font-bold">f(x)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className={index === rows.length - 1 ? 'bg-[color-mix(in_srgb,var(--t-accent)_10%,transparent)]' : ''}>
                <td className="px-2 py-1 text-end text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">{fmt(row.leftX, 3)}</td>
                <td className="px-2 py-1 text-end text-[var(--t-accent-deep)]">{fmt(row.leftY, 3)}</td>
                <td className="px-2 py-1 text-end text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">{fmt(row.rightX, 3)}</td>
                <td className="px-2 py-1 text-end text-[var(--t-sky)]">{fmt(row.rightY, 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.leftLimit, isRtl), value: fmt(shape.left, 2) },
          { label: pick(strings.rightLimit, isRtl), value: fmt(shape.right, 2) },
          { label: pick(strings.limit, isRtl), value: pick(agrees ? strings.exists : strings.missing, isRtl), emphasis: true },
          { label: pick(strings.at, isRtl), value: shape.at === null ? (isRtl ? 'غير معرّفة' : 'undefined') : fmt(shape.at, 2) },
        ]}
      />
    </div>
  );
}

/**
 * Algebra 1 · 5.1–5.2 — fit a line to a scatter plot (and watch the residuals
 * shrink), or look at the centre and spread of a small data set.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Label, MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'A line of fit is the line that keeps the misses smallest. Slide it until the squared misses stop shrinking.',
    ar: 'خط الملاءمة هو الخط الذي يجعل الأخطاء أصغر ما يمكن. حرّكه حتى تتوقف مربعات الأخطاء عن الانخفاض.',
  },
  slope: { en: 'slope', ar: 'الميل' },
  intercept: { en: 'intercept', ar: 'المقطع' },
  fit: { en: 'sum of squared misses', ar: 'مجموع مربعات الأخطاء' },
  verdict: { en: 'best fit here', ar: 'أفضل ملاءمة هنا' },
  mean: { en: 'mean', ar: 'المتوسط' },
  median: { en: 'median', ar: 'الوسيط' },
  mode: { en: 'mode', ar: 'المنوال' },
  range: { en: 'range', ar: 'المدى' },
  data: { en: 'data', ar: 'البيانات' },
  outlier: { en: 'add an outlier', ar: 'أضف قيمة شاذة' },
} satisfies Record<string, Bi>;

/** A small deterministic cloud: a rough line with noise. */
const POINTS: [number, number][] = [
  [1, 3],
  [2, 4],
  [3, 6],
  [4, 6.5],
  [5, 8],
  [6, 9],
  [7, 9.5],
];
const DATA = [4, 6, 8, 10, 12];

export default function ScatterLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ m: 1, b: 2, outlier: 0 }, onInteract);

  if (lesson.id === '5-2') {
    const values_ = [...DATA, ...(values.outlier > 0.5 ? [40] : [])];
    const sorted = [...values_].sort((a, b) => a - b);
    const mean = values_.reduce((sum, value) => sum + value, 0) / values_.length;
    const median = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    const counts = new Map<number, number>();
    for (const value of values_) counts.set(value, (counts.get(value) ?? 0) + 1);
    const mode = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;
    const max = Math.max(...values_);
    // Duplicates stack upwards so every value in the set is visible.
    const seen = new Map<number, number>();
    const dots = values_.map((value) => {
      const row = seen.get(value) ?? 0;
      seen.set(value, row + 1);
      return { value, row };
    });

    return (
      <div className="space-y-3">
        <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
          {/* A dot plot on a number line: y = 0 is the bottom of the box, so the
              dots sit on the line and the mean/median marks stand on it. */}
          <MathPlot xDomain={[0, 44]} yDomain={[0, 1]} grid={false} axes={false} aspect={16 / 5} ariaLabel={pick(strings.data, isRtl)}>
            <Segment x1={0} y1={0.14} x2={44} y2={0.14} width={2} opacity={0.45} />
            {[0, 10, 20, 30, 40].map((tick) => (
              <Label key={tick} x={tick} y={0.05} opacity={0.55}>
                {tick}
              </Label>
            ))}
            {dots.map(({ value, row }) => (
              <Point key={`${value}-${row}`} x={value} y={0.3 + row * 0.2} r={6} color="var(--t-accent)" />
            ))}
            <Segment x1={mean} y1={0.2} x2={mean} y2={0.95} color="var(--t-sun)" width={2} dash="5 4" />
            <Segment x1={median} y1={0.2} x2={median} y2={0.95} color="var(--t-sky)" width={2} dash="5 4" />
          </MathPlot>
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] px-2.5 py-1.5">
          <input type="checkbox" checked={values.outlier > 0.5} onChange={(event) => set('outlier', event.target.checked ? 1 : 0)} className="h-4 w-4 accent-[var(--t-accent)]" />
          <span className="text-xs font-semibold text-[var(--t-ink)]">{pick(strings.outlier, isRtl)}</span>
        </label>
        <Readout
          dir={isRtl ? 'rtl' : 'ltr'}
          rows={[
            { label: pick(strings.mean, isRtl), value: fmt(mean, 2), emphasis: true },
            { label: pick(strings.median, isRtl), value: fmt(median, 2) },
            { label: pick(strings.mode, isRtl), value: fmt(mode, 0) },
            { label: pick(strings.range, isRtl), value: `${fmt(Math.min(...values_), 0)} → ${fmt(max, 0)} (= ${fmt(max - Math.min(...values_), 0)})` },
          ]}
        />
        <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
          {isRtl ? 'الخط الذهبي = المتوسط، الأزرق = الوسيط. لاحظ أيّهما يتحرك مع القيمة الشاذة.' : 'Gold = mean, blue = median. Watch which one moves when the outlier appears.'}
        </p>
      </div>
    );
  }

  const { m, b } = values;
  const misses = POINTS.map(([x, y]) => y - (m * x + b));
  const sse = misses.reduce((sum, miss) => sum + miss * miss, 0);
  const meanMiss = misses.reduce((sum, miss) => sum + miss, 0) / misses.length;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[0, 8]} yDomain={[0, 12]} ariaLabel={pick(strings.fit, isRtl)}>
          {POINTS.map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <Segment x1={x} y1={y} x2={x} y2={m * x + b} color="var(--t-danger)" width={1.5} opacity={0.55} />
              <Point x={x} y={y} r={5} color="var(--t-accent)" />
            </g>
          ))}
          <Segment x1={0} y1={b} x2={8} y2={m * 8 + b} color="var(--t-sun)" width={2.5} />
        </MathPlot>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.slope} value={m} min={0} max={2} step={0.05} onChange={(value) => set('m', value)} format={(value) => fmt(value, 2)} />
        <Slider label={strings.intercept} value={b} min={-2} max={5} step={0.1} onChange={(value) => set('b', value)} format={(value) => fmt(value, 1)} />
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.fit, isRtl), value: fmt(sse, 2), emphasis: true },
          { label: 'mean miss', value: fmt(meanMiss, 2) },
          { label: pick(strings.verdict, isRtl), value: sse < 3 ? '✓' : '…' },
        ]}
      />
    </div>
  );
}

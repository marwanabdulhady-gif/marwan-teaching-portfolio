/**
 * GMAT · statistics and averages. A dot plot with one movable outlier: the
 * mean chases it, the median does not, and the range only watches the ends.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Readout, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';
import { Bar } from './parts';

const strings = {
  what: {
    en: 'Drag the outlier. The mean follows it; the median barely moves. That gap is the whole idea.',
    ar: 'اسحب القيمة الشاذة. المتوسط يتبعها أما الوسيط فيتحرك قليلاً؛ هذه الفجوة هي الفكرة كلها.',
  },
  weighted: {
    en: 'A weighted mean is pulled towards the group with the larger weight.',
    ar: 'المتوسط المرجّح ينجذب نحو المجموعة ذات الوزن الأكبر.',
  },
  outlier: { en: 'outlier value', ar: 'القيمة الشاذة' },
  weightA: { en: 'group A average', ar: 'متوسط المجموعة A' },
  weightB: { en: 'group B average', ar: 'متوسط المجموعة B' },
  sizeA: { en: 'A size', ar: 'حجم A' },
  sizeB: { en: 'B size', ar: 'حجم B' },
  mean: { en: 'mean', ar: 'المتوسط' },
  median: { en: 'median', ar: 'الوسيط' },
  range: { en: 'range', ar: 'المدى' },
  mode: { en: 'most frequent', ar: 'الأكثر تكراراً' },
  weightedMean: { en: 'weighted mean', ar: 'المتوسط المرجّح' },
  pull: { en: 'closer to', ar: 'أقرب إلى' },
  values: { en: 'values', ar: 'القيم' },
} satisfies Record<string, Bi>;

const BASE = [4, 5, 5, 6, 6, 7, 7, 8];

export default function StatsLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  // averages (weighted means) and statistical averages share a theme but not a plot.
  const weighted = lesson.id === 'averages';
  const [values, set] = useExplorerState({ outlier: 8, meanA: 70, meanB: 88, sizeA: 6, sizeB: 4 }, onInteract);

  if (weighted) {
    const meanA = values.meanA;
    const meanB = values.meanB;
    const sizeA = Math.max(1, Math.round(values.sizeA));
    const sizeB = Math.max(1, Math.round(values.sizeB));
    const combined = (meanA * sizeA + meanB * sizeB) / (sizeA + sizeB);
    const closerToA = Math.abs(combined - meanA) <= Math.abs(combined - meanB);
    const shareA = sizeA / (sizeA + sizeB);

    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.weighted, isRtl)}</p>
        <div dir="ltr" className="relative h-14 rounded-xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)]">
          <span className="absolute inset-y-0 start-[50%] w-px bg-[color-mix(in_srgb,var(--t-ink)_20%,transparent)]" aria-hidden />
          {[
            { value: meanA, tone: 'var(--t-sky)', label: 'A' },
            { value: meanB, tone: 'var(--t-accent)', label: 'B' },
            { value: combined, tone: 'var(--t-sun)', label: 'mean' },
          ].map((marker) => (
            <span
              key={marker.label}
              className="absolute top-1/2 flex -translate-y-1/2 items-center gap-1"
              style={{ left: `calc(${Math.min(100, Math.max(0, marker.value))}% - 10px)` }}
            >
              <span className="h-4 w-4 rounded-full" style={{ background: marker.tone }} aria-hidden />
              <span className="font-mono text-[0.6rem] font-bold text-[var(--t-ink)]">{fmt(marker.value, 1)}</span>
            </span>
          ))}
        </div>
        <div className="space-y-2">
          <Bar label={`A × ${sizeA}`} caption={fmt(meanA * sizeA, 0)} fill={shareA} />
          <Bar label={`B × ${sizeB}`} caption={fmt(meanB * sizeB, 0)} fill={1 - shareA} tone="var(--t-sky)" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Slider label={strings.weightA} value={meanA} min={0} max={100} step={1} onChange={(value) => set('meanA', value)} format={(value) => fmt(value, 0)} />
          <Slider label={strings.weightB} value={meanB} min={0} max={100} step={1} onChange={(value) => set('meanB', value)} format={(value) => fmt(value, 0)} />
          <Slider label={strings.sizeA} value={sizeA} min={1} max={12} step={1} onChange={(value) => set('sizeA', value)} format={(value) => fmt(value, 0)} />
          <Slider label={strings.sizeB} value={sizeB} min={1} max={12} step={1} onChange={(value) => set('sizeB', value)} format={(value) => fmt(value, 0)} />
        </div>
        <Readout
          dir="ltr"
          rows={[
            { label: 'Σ', value: `${fmt(meanA * sizeA, 0)} + ${fmt(meanB * sizeB, 0)} = ${fmt(meanA * sizeA + meanB * sizeB, 0)}` },
            { label: 'n', value: `${sizeA} + ${sizeB} = ${sizeA + sizeB}` },
            { label: pick(strings.weightedMean, isRtl), value: fmt(combined, 2), emphasis: true },
            { label: pick(strings.pull, isRtl), value: closerToA ? `${isRtl ? 'المجموعة' : 'group'} A` : `${isRtl ? 'المجموعة' : 'group'} B` },
          ]}
        />
      </div>
    );
  }

  const outlier = values.outlier;
  const data = [...BASE, outlier].sort((x, y) => x - y);
  const total = data.reduce((sum, value) => sum + value, 0);
  const mean = total / data.length;
  const median = data.length % 2 === 1 ? data[(data.length - 1) / 2] : (data[data.length / 2 - 1] + data[data.length / 2]) / 2;
  const range = data[data.length - 1] - data[0];
  const counts = new Map<number, number>();
  for (const value of data) counts.set(value, (counts.get(value) ?? 0) + 1);
  let mode = data[0];
  let best = 0;
  for (const [value, count] of counts) {
    if (count > best) {
      best = count;
      mode = value;
    }
  }
  const max = Math.max(...data);
  const binCounts = Array.from({ length: max + 2 }, (_, value) => data.filter((item) => item === value).length);

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-3">
        <svg viewBox="0 0 340 110" className="mx-auto h-auto w-full" role="img" aria-label={pick(strings.values, isRtl)}>
          {binCounts.map((count, value) =>
            Array.from({ length: count }, (_, level) => (
              <circle
                key={`${value}-${level}`}
                cx={16 + value * 20}
                cy={96 - level * 13}
                r={5}
                fill={value === Math.round(outlier) ? 'var(--t-sun)' : 'var(--t-accent)'}
              />
            )),
          )}
          {/* mean marker */}
          <line x1={16 + mean * 20} y1={8} x2={16 + mean * 20} y2={100} stroke="var(--t-ink)" strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={16 + mean * 20} y={8} textAnchor="middle" fontSize={9} fill="var(--t-ink)" fontFamily="ui-monospace, monospace">
            mean
          </text>
          {/* median marker */}
          <line x1={16 + median * 20} y1={14} x2={16 + median * 20} y2={100} stroke="var(--t-regal, var(--t-ink))" strokeOpacity={0.5} strokeWidth={1.5} />
          <text x={16 + median * 20} y={104} textAnchor="middle" fontSize={9} fill="var(--t-ink)" fillOpacity={0.7} fontFamily="ui-monospace, monospace">
            {fmt(median, 1)}
          </text>
        </svg>
      </div>

      <Slider label={strings.outlier} value={outlier} min={0} max={20} step={1} onChange={(value) => set('outlier', value)} format={(value) => fmt(value, 0)} />

      <Readout
        dir="ltr"
        rows={[
          { label: pick(strings.values, isRtl), value: data.join(' ') },
          { label: pick(strings.mean, isRtl), value: `${fmt(mean, 2)} (${total} ÷ ${data.length})` },
          { label: pick(strings.median, isRtl), value: fmt(median, 1), emphasis: true },
          { label: pick(strings.range, isRtl), value: `${max} − ${data[0]} = ${range}` },
          { label: pick(strings.mode, isRtl), value: `${mode} ×${best}` },
        ]}
      />
    </div>
  );
}

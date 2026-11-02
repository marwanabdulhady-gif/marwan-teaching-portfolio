/**
 * GMAT · data-insight graphics.
 *   graphics-axes — bars on a truncated axis: the same data, two impressions
 *   graphics-pie   — one whole split into shares, and why two pies never add
 *   graphics-scatter — a trend line whose outlier changes the story
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, Slider, Toggle, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';
import { Bar } from './parts';

const strings = {
  axesWhat: {
    en: 'The same bars, drawn from 0 and from a cut axis. Nothing changed but the frame.',
    ar: 'الأعمدة نفسها مرسومة من الصفر ومن محور مقتطع. لم يتغير شيء سوى الإطار.',
  },
  pieWhat: {
    en: 'Each slice is a share of one whole. The angle tells you the share; the total is elsewhere.',
    ar: 'كل قطاع نصيب من كل واحد. الزاوية تعطي النصيب والمجموع في مكان آخر.',
  },
  scatterWhat: {
    en: 'One far point tilts the trend line and can even flip its sign.',
    ar: 'نقطة بعيدة واحدة تميل خط الاتجاه وقد تقلب إشارته.',
  },
  cutAxis: { en: 'cut the axis at 200', ar: 'اقتطع المحور عند ٢٠٠' },
  scale: { en: 'bar height', ar: 'ارتفاع العمود' },
  slice: { en: 'first slice (%)', ar: 'القطاع الأول (٪)' },
  total: { en: 'whole', ar: 'الكل' },
  share: { en: 'share', ar: 'النصيب' },
  angle: { en: 'angle', ar: 'الزاوية' },
  remainder: { en: 'the rest', ar: 'الباقي' },
  outlier: { en: 'outlier y', ar: 'القيمة الشاذة y' },
  slope: { en: 'trend slope', ar: 'ميل الاتجاه' },
  correlation: { en: 'direction', ar: 'الاتجاه' },
  rising: { en: 'rising', ar: 'صاعد' },
  falling: { en: 'falling', ar: 'هابط' },
  lookalike: { en: 'axis starts at 0', ar: 'المحور يبدأ من ٠' },
  compare: { en: 'same data, honest axis', ar: 'البيانات نفسها بمحور صادق' },
} satisfies Record<string, Bi>;

const CITIES = [
  { label: 'A', value: 240 },
  { label: 'B', value: 268 },
  { label: 'C', value: 252 },
  { label: 'D', value: 285 },
];

const SCATTER: [number, number][] = [
  [1, 2.2],
  [2, 3.1],
  [3, 3.6],
  [4, 4.4],
  [5, 5.1],
  [6, 5.6],
];

export default function ChartLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ slice: 32, truncate: 1, outlier: 5.6, total: 400 }, onInteract);

  if (lesson.id === 'graphics-pie') {
    const slice = Math.min(95, Math.max(5, values.slice));
    const total = Math.max(40, Math.round(values.total));
    const first = (slice / 100) * total;
    const second = total - first;
    const angle = (slice / 100) * 360;
    const rad = (angle * Math.PI) / 180;
    const cx = 110;
    const cy = 100;
    const radius = 78;
    const largeArc = angle > 180 ? 1 : 0;

    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.pieWhat, isRtl)}</p>
        <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-3">
          <svg viewBox="0 0 220 200" className="mx-auto h-auto w-full max-w-[260px]" role="img" aria-label={pick(strings.share, isRtl)}>
            <path
              d={`M${cx},${cy} L${cx + radius},${cy} A${radius},${radius} 0 ${largeArc} 0 ${cx + radius * Math.cos(-rad)},${cy + radius * Math.sin(-rad)} Z`}
              fill="var(--t-accent)"
              fillOpacity={0.28}
              stroke="var(--t-accent)"
              strokeWidth={2}
            />
            <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--t-ink)" strokeOpacity={0.35} strokeWidth={2} />
            <text x={cx + radius * 0.55} y={cy - radius * 0.3} fontSize={11} fill="var(--t-ink)" fontFamily="ui-monospace, monospace">
              {fmt(slice, 0)}%
            </text>
            <text x={cx - radius * 0.72} y={cy + radius * 0.45} fontSize={11} fill="var(--t-ink)" fillOpacity={0.7} fontFamily="ui-monospace, monospace">
              {fmt(100 - slice, 0)}%
            </text>
          </svg>
        </div>
        <Slider label={strings.slice} value={slice} min={5} max={95} step={1} onChange={(value) => set('slice', value)} format={(value) => `${fmt(value, 0)}%`} />
        <Slider label={strings.total} value={total} min={40} max={900} step={20} onChange={(value) => set('total', value)} format={(value) => fmt(value, 0)} />
        <Readout
          dir="ltr"
          rows={[
            { label: pick(strings.angle, isRtl), value: `${fmt(slice, 0)}% × 360° = ${fmt(angle, 1)}°` },
            { label: pick(strings.share, isRtl), value: `${fmt(first, 1)} ${isRtl ? 'من' : 'of'} ${total}` },
            { label: pick(strings.remainder, isRtl), value: `${fmt(second, 1)} ${isRtl ? 'من' : 'of'} ${total}`, emphasis: true },
          ]}
        />
      </div>
    );
  }

  if (lesson.id === 'graphics-scatter') {
    const outlier = values.outlier;
    const points: [number, number][] = [...SCATTER.slice(0, 5), [6, outlier]];
    const n = points.length;
    const meanX = points.reduce((sum, [x]) => sum + x, 0) / n;
    const meanY = points.reduce((sum, [, y]) => sum + y, 0) / n;
    const sxy = points.reduce((sum, [x, y]) => sum + (x - meanX) * (y - meanY), 0);
    const sxx = points.reduce((sum, [x]) => sum + (x - meanX) ** 2, 0);
    const slope = sxx === 0 ? 0 : sxy / sxx;
    const intercept = meanY - slope * meanX;
    const base = SCATTER.slice(0, 5);
    const baseSlope =
      (() => {
        const mX = base.reduce((sum, [x]) => sum + x, 0) / base.length;
        const mY = base.reduce((sum, [, y]) => sum + y, 0) / base.length;
        const num = base.reduce((sum, [x, y]) => sum + (x - mX) * (y - mY), 0);
        const den = base.reduce((sum, [x]) => sum + (x - mX) ** 2, 0);
        return den === 0 ? 0 : num / den;
      })();

    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.scatterWhat, isRtl)}</p>
        <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
          <MathPlot xDomain={[0, 7]} yDomain={[0, 9]} aspect={1.5} grid={false} ariaLabel={pick(strings.correlation, isRtl)}>
            <Segment x1={0} y1={intercept} x2={7} y2={intercept + slope * 7} color="var(--t-accent)" width={2.5} dash="6 4" />
            {points.map(([x, y], index) => (
              <Point key={index} x={x} y={y} r={index === n - 1 ? 6 : 4} color={index === n - 1 ? 'var(--t-sun)' : 'var(--t-sky)'} label={index === n - 1 ? 'outlier' : undefined} />
            ))}
          </MathPlot>
        </div>
        <Slider label={strings.outlier} value={outlier} min={0} max={9} step={0.2} onChange={(value) => set('outlier', value)} format={(value) => fmt(value, 1)} />
        <Readout
          dir="ltr"
          rows={[
            { label: pick(strings.slope, isRtl), value: `${fmt(slope, 2)} (${isRtl ? 'بدونها' : 'without it'} ${fmt(baseSlope, 2)})`, emphasis: true },
            { label: pick(strings.correlation, isRtl), value: slope >= 0 ? pick(strings.rising, isRtl) : pick(strings.falling, isRtl) },
            { label: 'y = a + bx', value: `ŷ = ${fmt(intercept, 2)} + ${fmt(slope, 2)}x` },
          ]}
        />
      </div>
    );
  }

  // graphics-axes: the truncated-axis illusion.
  const cut = values.truncate > 0.5;
  const max = cut ? 300 : 320;
  const floor = cut ? 200 : 0;
  const tallest = Math.max(...CITIES.map((city) => city.value));

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.axesWhat, isRtl)}</p>
      <Toggle label={strings.cutAxis} checked={cut} onChange={(checked) => set('truncate', checked ? 1 : 0)} detail={cut ? `[${floor}, ${max}]` : `[0, ${max}]`} />
      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-3">
        <div className="flex h-40 items-end justify-around gap-3">
          {CITIES.map((city) => {
            const height = Math.max(2, ((city.value - floor) / (max - floor)) * 100);
            return (
              <div key={city.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="font-mono text-[0.65rem] font-bold text-[var(--t-ink)]">{city.value}</span>
                <div
                  className="w-full rounded-t-md"
                  style={{
                    height: `${height}%`,
                    background: city.value === tallest ? 'var(--t-accent)' : 'color-mix(in srgb, var(--t-accent) 45%, transparent)',
                  }}
                />
                <span className="font-mono text-[0.65rem] text-[color-mix(in_srgb,var(--t-ink)_60%,transparent)]">{city.label}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-center font-mono text-[0.62rem] text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">
          {cut ? `${isRtl ? 'المحور يبدأ من' : 'axis starts at'} ${floor}` : pick(strings.lookalike, isRtl)}
        </p>
      </div>
      <div className="space-y-1.5">
        {CITIES.map((city) => (
          <Bar
            key={city.label}
            label={`${city.label} — ${pick(strings.compare, isRtl)}`}
            caption={`${fmt((city.value / 320) * 100, 1)}%`}
            fill={city.value / 320}
            height={14}
            tone="var(--t-sky)"
          />
        ))}
      </div>
      <Readout
        dir="ltr"
        rows={[
          { label: pick(strings.slope, isRtl), value: `tallest ${tallest} vs shortest ${Math.min(...CITIES.map((city) => city.value))}` },
          {
            label: isRtl ? 'فرق حقيقي' : 'real gap',
            value: `${fmt(((tallest - Math.min(...CITIES.map((city) => city.value))) / Math.min(...CITIES.map((city) => city.value))) * 100, 1)}%`,
            emphasis: true,
          },
          {
            label: isRtl ? 'فجوة الرسم' : 'perceived gap',
            value: `${fmt(((tallest - floor) / (Math.min(...CITIES.map((city) => city.value)) - floor) - 1) * 100, 1)}%`,
          },
        ]}
      />
    </div>
  );
}

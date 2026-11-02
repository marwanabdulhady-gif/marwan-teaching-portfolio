/**
 * Geometry · 1.1–1.3 — drag two points: the segment, its length, its midpoint,
 * and the addition postulate when a third point sits between them.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { MathPlot, Point, PointHandle, Segment } from '../../viz/MathPlot';
import { Readout, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Drag either endpoint. The midpoint always sits halfway, whatever the segment does.',
    ar: 'اسحب أي طرف. تبقى نقطة المنتصف في الوسط دائماً، أياً كان اتجاه القطعة.',
  },
  pointA: { en: 'point A', ar: 'النقطة A' },
  pointB: { en: 'point B', ar: 'النقطة B' },
  between: { en: 'B between A and C', ar: 'B بين A و C' },
  length: { en: 'length AB', ar: 'طول AB' },
  midpoint: { en: 'midpoint', ar: 'نقطة المنتصف' },
  addition: { en: 'segment addition', ar: 'جمع القطع' },
  slope: { en: 'slope AB', ar: 'ميل AB' },
  right: { en: 'angles', ar: 'الزوايا' },
} satisfies Record<string, Bi>;

const DOMAIN: [number, number] = [-8, 8];

export default function PointsLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ ax: -4, ay: -2, bx: 3, by: 3, c: 1 }, onInteract);
  const { ax, ay, bx, by } = values;
  const addition = lesson.id === '1-1';

  const distance = Math.hypot(bx - ax, by - ay);
  const midX = (ax + bx) / 2;
  const midY = (ay + by) / 2;
  const slope = Math.abs(bx - ax) < 1e-9 ? NaN : (by - ay) / (bx - ax);

  // A third point C so that A is at 0, B at t, C at 1 along the segment.
  const t = Math.min(0.95, Math.max(0.05, values.c));
  const cx = ax + (bx - ax) / t;
  const cy = ay + (by - ay) / t;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={DOMAIN} yDomain={DOMAIN} aspect={1} ariaLabel={pick(strings.length, isRtl)}>
          <Segment x1={ax} y1={ay} x2={bx} y2={by} color="var(--t-accent)" width={2.5} />
          {addition && (
            <>
              <Segment x1={bx} y1={by} x2={cx} y2={cy} color="var(--t-sky)" width={2} dash="6 4" />
              <Point x={cx} y={cy} r={4} color="var(--t-sky)" label="C" />
            </>
          )}
          <Point x={ax} y={ay} r={5} label="A" />
          <Point x={bx} y={by} r={5} label="B" />
          <Point x={midX} y={midY} r={4} color="var(--t-sun)" label="M" />
          <PointHandle x={ax} y={ay} xDomain={DOMAIN} yDomain={DOMAIN} step={0.5} ariaLabel={pick(strings.pointA, isRtl)} onChange={(x, y) => { set('ax', x); set('ay', y); }} />
          <PointHandle x={bx} y={by} xDomain={DOMAIN} yDomain={DOMAIN} step={0.5} ariaLabel={pick(strings.pointB, isRtl)} color="var(--t-accent)" onChange={(x, y) => { set('bx', x); set('by', y); }} />
        </MathPlot>
      </div>

      <Readout
        dir="ltr"
        rows={[
          { label: pick(strings.length, isRtl), value: fmt(distance, 2), emphasis: true },
          { label: pick(strings.midpoint, isRtl), value: `(${fmt(midX, 2)}, ${fmt(midY, 2)})` },
          { label: pick(strings.slope, isRtl), value: Number.isFinite(slope) ? fmt(slope, 2) : 'undefined' },
          ...(addition
            ? [{ label: pick(strings.addition, isRtl), value: `AB + BC = ${fmt(distance, 2)} + ${fmt(distance * (1 - t) / t, 2)} = AC ${fmt(distance / t, 2)}` }]
            : []),
        ]}
      />
    </div>
  );
}

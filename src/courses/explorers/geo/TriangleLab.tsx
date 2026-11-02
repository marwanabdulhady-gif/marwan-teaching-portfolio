/**
 * Geometry · 2.1–2.4 — one triangle, dragged by its apex: the angle sum and the
 * exterior angle, the congruence shortcuts, similarity under a scale factor,
 * and the Pythagorean squares.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { MathPlot, Point, PointHandle, Segment } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Drag the apex. Some things change, some can never change — that is what the theorems are about.',
    ar: 'اسحب الرأس. بعض الأشياء تتغير وبعضها لا يمكن أن يتغير — وهذا هو موضوع المبرهنات.',
  },
  apex: { en: 'move the apex', ar: 'حرّك الرأس' },
  scale: { en: 'scale factor', ar: 'معامل التكبير' },
  angles: { en: 'angles', ar: 'الزوايا' },
  sum: { en: 'sum', ar: 'المجموع' },
  exterior: { en: 'exterior angle', ar: 'الزاوية الخارجية' },
  sides: { en: 'sides', ar: 'الأضلاع' },
  triangle: { en: 'triangle', ar: 'المثلث' },
  similar: { en: 'similar triangles', ar: 'مثلثان متشابهان' },
  ratio: { en: 'area ratio', ar: 'نسبة المساحات' },
  legs: { en: 'legs', ar: 'الساقان' },
  hypotenuse: { en: 'hypotenuse', ar: 'الوتر' },
  test: { en: 'given parts', ar: 'المعطيات' },
} satisfies Record<string, Bi>;

const DOMAIN: [number, number] = [-2, 10];

const A: [number, number] = [1, 1];
const B: [number, number] = [7, 1];

export default function TriangleLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ cx: 3, cy: 5, k: 1.6, test: 0 }, onInteract);
  const apex: [number, number] = [values.cx, values.cy];

  const angleAt = (p: [number, number], q: [number, number], r: [number, number]) => {
    const v1: [number, number] = [q[0] - p[0], q[1] - p[1]];
    const v2: [number, number] = [r[0] - p[0], r[1] - p[1]];
    const dot = v1[0] * v2[0] + v1[1] * v2[1];
    const mag = Math.hypot(...v1) * Math.hypot(...v2);
    if (mag === 0) return NaN;
    return (Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI;
  };

  const angleA = angleAt(A, B, apex);
  const angleB = angleAt(B, apex, A);
  const angleC = angleAt(apex, A, B);
  const sideAB = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const sideAC = Math.hypot(apex[0] - A[0], apex[1] - A[1]);
  const sideBC = Math.hypot(apex[0] - B[0], apex[1] - B[1]);
  const area = 0.5 * Math.abs((B[0] - A[0]) * (apex[1] - A[1]) - (apex[0] - A[0]) * (B[1] - A[1]));

  const rightAtApex = Math.abs(angleC - 90) < 1.5 && lesson.id === '2-4';
  // 2.3 draws a second copy at scale k around A, so the apex has to stay low
  // enough for the copy (k ≤ 1.6) to fit inside the plot.
  const apexCeiling = lesson.id === '2-3' ? 6 : 10;
  const project = ([x, y]: [number, number]) => [(x + 2) * 33.33, 400 - (y + 2) * 33.33];
  const legs = [sideAC, sideBC].sort((x, y) => x - y);

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={DOMAIN} yDomain={DOMAIN} aspect={1} grid={false} ariaLabel={pick(strings.triangle, isRtl)}>
          {lesson.id === '2-3' && (
            // The image of the triangle under a scale factor k about A. At
            // k = 1 it lands exactly on the original, which is the point.
            <polygon
              points={[A, B, apex]
                .map((point) =>
                  project([A[0] + values.k * (point[0] - A[0]), A[1] + values.k * (point[1] - A[1])]).join(','),
                )
                .join(' ')}
              fill="var(--t-sky)"
              fillOpacity={0.12}
              stroke="var(--t-sky)"
              strokeWidth={2}
              strokeDasharray="5 4"
            />
          )}
          <polygon
            points={[A, B, apex].map((point) => project(point).join(',')).join(' ')}
            fill="var(--t-accent)"
            fillOpacity={0.12}
            stroke="var(--t-accent)"
            strokeWidth={2.5}
          />
          <Segment x1={apex[0]} y1={apex[1]} x2={apex[0] + 3} y2={apex[1]} color="var(--t-sun)" dash="4 3" opacity={0.8} />
          <Point x={A[0]} y={A[1]} r={4} label="A" />
          <Point x={B[0]} y={B[1]} r={4} label="B" />
          <Point x={apex[0]} y={apex[1]} r={4} label="C" />
          <PointHandle x={apex[0]} y={apex[1]} xDomain={[-2, 10]} yDomain={[1.5, apexCeiling]} step={0.25} ariaLabel={pick(strings.apex, isRtl)} onChange={(x, y) => { set('cx', x); set('cy', y); }} />
        </MathPlot>
      </div>

      {lesson.id === '2-3' && (
        <SegmentedChoice
          label={strings.scale}
          value={values.k > 1.2 ? 'big' : 'small'}
          isRtl={isRtl}
          options={[
            { id: 'small', label: { en: 'k = 1', ar: 'k = 1' } },
            { id: 'big', label: { en: 'k = 1.6', ar: 'k = 1.6' } },
          ]}
          onChange={(id) => set('k', id === 'big' ? 1.6 : 1)}
        />
      )}

      <Readout
        dir="ltr"
        rows={[
          { label: pick(strings.angles, isRtl), value: `${fmt(angleA, 1)}° · ${fmt(angleB, 1)}° · ${fmt(angleC, 1)}°` },
          { label: pick(strings.sum, isRtl), value: `${fmt(angleA + angleB + angleC, 1)}°`, emphasis: true },
          { label: pick(strings.exterior, isRtl), value: `${fmt(angleA + angleB, 1)}°` },
          { label: pick(strings.sides, isRtl), value: `${fmt(sideAB, 2)} · ${fmt(sideAC, 2)} · ${fmt(sideBC, 2)}` },
          ...(lesson.id === '2-3'
            ? [{ label: pick(strings.ratio, isRtl), value: `${fmt(values.k * values.k, 2)} : 1` }]
            : []),
          ...(lesson.id === '2-4'
            ? [
                { label: pick(strings.legs, isRtl), value: `${fmt(legs[0], 2)} · ${fmt(legs[1], 2)}` },
                { label: pick(strings.hypotenuse, isRtl), value: `${fmt(sideAB, 2)} (a² + b² = ${fmt(legs[0] ** 2 + legs[1] ** 2, 2)})` },
                { label: 'right?', value: rightAtApex ? '✓ 90°' : `${fmt(angleC, 1)}°` },
              ]
            : []),
          { label: 'area', value: fmt(area, 2) },
        ]}
      />
    </div>
  );
}

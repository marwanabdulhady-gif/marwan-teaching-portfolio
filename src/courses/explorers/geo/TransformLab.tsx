/**
 * Geometry · 1.4 and 4.2 — move a rigid figure with a translation, a rotation
 * and a reflection, and check what stays the same. The 4.2 mode turns the same
 * idea into the slope test for parallel and perpendicular segments.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, Slider, Toggle, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Every rigid motion keeps lengths and angles. Only position (and possibly orientation) changes.',
    ar: 'كل حركة صلبة تحافظ على الأطوال والزوايا. يتغير الموضع فقط (وربما الاتجاه).',
  },
  dx: { en: 'translate x', ar: 'انسحاب أفقياً' },
  dy: { en: 'translate y', ar: 'انسحاب رأسياً' },
  angle: { en: 'rotate', ar: 'دوران' },
  reflect: { en: 'reflect in y-axis', ar: 'انعكاس حول المحور y' },
  mode: { en: 'focus', ar: 'التركيز' },
  image: { en: 'image vertices', ar: 'رؤوس الصورة' },
  congruent: { en: 'congruent to the original', ar: 'مطابقة للأصل' },
  slopeA: { en: 'slope AB', ar: 'ميل AB' },
  slopeB: { en: 'slope CD', ar: 'ميل CD' },
  relation: { en: 'segments AB and CD', ar: 'القطعتان AB و CD' },
  parallel: { en: 'parallel', ar: 'متوازيتان' },
  perpendicular: { en: 'perpendicular', ar: 'متعامدتان' },
  neither: { en: 'neither', ar: 'لا هذا ولا ذاك' },
} satisfies Record<string, Bi>;

const SHAPE: [number, number][] = [
  [-5, -3],
  [-2, -3],
  [-3, 0],
];

const DOMAIN: [number, number] = [-9, 9];

export default function TransformLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ dx: 3, dy: 2, angle: 0, reflect: 0, m1: 1, m2: -1 }, onInteract);

  if (lesson.id === '4-2') {
    const { m1, m2 } = values;
    const relation =
      Math.abs(m1 - m2) < 1e-9
        ? pick(strings.parallel, isRtl)
        : Math.abs(m1 * m2 + 1) < 1e-9
          ? pick(strings.perpendicular, isRtl)
          : pick(strings.neither, isRtl);
    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
        <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
          <MathPlot xDomain={DOMAIN} yDomain={DOMAIN} aspect={1} ariaLabel={pick(strings.relation, isRtl)}>
            <Segment x1={-6} y1={-6 * m1 + 2} x2={0} y2={2} color="var(--t-accent)" width={3} />
            <Segment x1={1} y1={-3} x2={7} y2={-3 + 6 * m2} color="var(--t-sky)" width={3} />
            <Point x={0} y={2} r={4} label="B" />
            <Point x={-6} y={-6 * m1 + 2} r={4} label="A" />
            <Point x={1} y={-3} r={4} color="var(--t-sky)" label="C" />
            <Point x={7} y={-3 + 6 * m2} r={4} color="var(--t-sky)" label="D" />
          </MathPlot>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Slider label={strings.slopeA} value={m1} min={-3} max={3} step={0.25} onChange={(value) => set('m1', value)} format={(value) => fmt(value, 2)} />
          <Slider label={strings.slopeB} value={m2} min={-3} max={3} step={0.25} onChange={(value) => set('m2', value)} format={(value) => fmt(value, 2)} />
        </div>
        <Readout
          dir="ltr"
          rows={[
            { label: pick(strings.relation, isRtl), value: relation, emphasis: true },
            { label: 'm₁ · m₂', value: fmt(m1 * m2, 3) },
            { label: 'm₁ − m₂', value: fmt(m1 - m2, 3) },
          ]}
        />
      </div>
    );
  }

  const { dx, dy, angle } = values;
  const reflect = values.reflect > 0.5;
  const rad = (angle * Math.PI) / 180;
  const image = SHAPE.map(([x, y]) => {
    const rx = x * Math.cos(rad) - y * Math.sin(rad);
    const ry = x * Math.sin(rad) + y * Math.cos(rad);
    return [(reflect ? -rx : rx) + dx, ry + dy] as [number, number];
  });
  const polygon = (points: [number, number][]) => points.map(([x, y]) => `${(x + 9) * (400 / 18)},${(9 - y) * (400 / 18)}`).join(' ');

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={DOMAIN} yDomain={DOMAIN} aspect={1} ariaLabel={pick(strings.image, isRtl)}>
          <polygon points={polygon(SHAPE)} fill="var(--t-ink)" fillOpacity={0.1} stroke="var(--t-ink)" strokeOpacity={0.4} strokeDasharray="5 4" />
          <polygon points={polygon(image)} fill="var(--t-accent)" fillOpacity={0.18} stroke="var(--t-accent)" strokeWidth={2.5} />
        </MathPlot>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.dx} value={dx} min={-8} max={8} step={0.5} onChange={(value) => set('dx', value)} format={(value) => fmt(value, 1)} />
        <Slider label={strings.dy} value={dy} min={-8} max={8} step={0.5} onChange={(value) => set('dy', value)} format={(value) => fmt(value, 1)} />
        <Slider label={strings.angle} value={angle} min={0} max={350} step={5} onChange={(value) => set('angle', value)} format={(value) => `${fmt(value, 0)}°`} />
        <Toggle label={strings.reflect} checked={reflect} isRtl={isRtl} onChange={(checked) => set('reflect', checked ? 1 : 0)} />
      </div>

      <Readout
        dir="ltr"
        rows={[
          { label: pick(strings.image, isRtl), value: image.map(([x, y]) => `(${fmt(x, 1)}, ${fmt(y, 1)})`).join('  ') },
          { label: pick(strings.congruent, isRtl), value: '✓  SSS', emphasis: true },
        ]}
      />
    </div>
  );
}

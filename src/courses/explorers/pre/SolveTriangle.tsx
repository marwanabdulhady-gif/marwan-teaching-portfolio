/**
 * 5.5 · Trigonometric functions and right triangles.
 *
 * Drag the hypotenuse's tip: the triangle redraws and all six ratios update.
 * Above the x-axis the triangle is real; below it the readout still teaches.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { MathPlot, Point, PointHandle, Segment } from '../../viz/MathPlot';
import { Readout, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Pull the tip of the hypotenuse. The angle follows, and so do all six ratios.',
    ar: 'اسحب طرف الوتر. تتغير الزاوية وتتغير معها النسب الست.',
  },
  tip: { en: 'tip of the triangle', ar: 'طرف المثلث' },
  angle: { en: 'angle θ', ar: 'الزاوية θ' },
  ratios: { en: 'ratios', ar: 'النسب' },
  sides: { en: 'sides', ar: 'الأضلاع' },
  hypotenuse: { en: 'hypotenuse', ar: 'الوتر' },
} satisfies Record<string, Bi>;

const DOMAIN: [number, number] = [-6, 6];

export default function SolveTriangle({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ x: 4, y: 3 }, onInteract);
  const { x, y } = values;
  const r = Math.hypot(x, y);
  const theta = Math.atan2(y, x);

  const ratio = (value: number) => (r === 0 ? '—' : fmt(value, 3));

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={DOMAIN} yDomain={[-4, 4]} ariaLabel={pick(strings.tip, isRtl)}>
          <Segment x1={0} y1={0} x2={x} y2={0} color="var(--t-sky)" width={2.5} />
          <Segment x1={x} y1={0} x2={x} y2={y} color="var(--t-sun)" width={2.5} />
          <Segment x1={0} y1={0} x2={x} y2={y} color="var(--t-accent)" width={2.5} />
          <Point x={x} y={0} r={3.5} color="var(--t-sky)" />
          <PointHandle
            x={x}
            y={y}
            xDomain={DOMAIN}
            yDomain={[-4, 4]}
            step={0.25}
            ariaLabel={pick(strings.tip, isRtl)}
            onChange={(nx, ny) => {
              set('x', nx);
              set('y', ny);
            }}
          />
        </MathPlot>
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.angle, isRtl), value: `${fmt((theta * 180) / Math.PI, 1)}°`, emphasis: true },
          { label: pick(strings.sides, isRtl), value: `${fmt(x, 2)} · ${fmt(y, 2)} · ${fmt(r, 2)}` },
          { label: 'sin / cos / tan', value: `${ratio(y / r)} · ${ratio(x / r)} · ${x === 0 ? '—' : ratio(y / x)}` },
          { label: 'csc / sec / cot', value: `${y === 0 ? '—' : ratio(r / y)} · ${x === 0 ? '—' : ratio(r / x)} · ${y === 0 ? '—' : ratio(x / y)}` },
        ]}
      />
    </div>
  );
}

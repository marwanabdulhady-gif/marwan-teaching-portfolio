/**
 * 2.5 · Implicit differentiation.
 *
 * Move a point around a circle and read dy/dx = −x/y straight off the tangent.
 * Where y = 0 the tangent is vertical and the derivative does not exist.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { MathPlot, Point, PointHandle, Segment } from '../../viz/MathPlot';
import { Readout, Slider, Toggle, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Differentiate both sides with respect to x, then solve for dy/dx. On a circle that gives −x/y.',
    ar: 'اشتق الطرفين بالنسبة إلى x ثم حل لإيجاد dy/dx. على الدائرة نحصل على −x/y.',
  },
  point: { en: 'point on the circle', ar: 'نقطة على الدائرة' },
  radius: { en: 'radius r', ar: 'نصف القطر r' },
  showTangent: { en: 'show tangent', ar: 'أظهر المماس' },
  slope: { en: 'dy/dx', ar: 'dy/dx' },
  tangent: { en: 'tangent line', ar: 'خط المماس' },
  vertical: { en: 'vertical tangent here', ar: 'مماس رأسي هنا' },
  steps: { en: 'working', ar: 'الحل' },
} satisfies Record<string, Bi>;

const DOMAIN: [number, number] = [-6, 6];

export default function ImplicitTangent({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ r: 4, angle: 0.9, show: 1 }, onInteract);
  const r = values.r;
  const angle = values.angle;
  const show = values.show > 0.5;

  const x = r * Math.cos(angle);
  const y = r * Math.sin(angle);
  const slope = Math.abs(y) < 0.08 ? Infinity : -x / y;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={DOMAIN} yDomain={DOMAIN} aspect={1} ariaLabel={`x² + y² = ${fmt(r, 1)}²`}>
          <circle cx={200} cy={200} r={r * (400 / 12)} fill="none" stroke="var(--t-accent)" strokeWidth={2.5} />
          {show && (
            <Segment
              x1={Number.isFinite(slope) ? x - 2 : x}
              y1={Number.isFinite(slope) ? y - 2 * slope : y - 2}
              x2={Number.isFinite(slope) ? x + 2 : x}
              y2={Number.isFinite(slope) ? y + 2 * slope : y + 2}
              color="var(--t-sun)"
              width={2}
              opacity={0.95}
            />
          )}
          <Segment x1={0} y1={0} x2={x} y2={y} color="var(--t-ink)" dash="3 3" opacity={0.4} />
          <PointHandle
            x={x}
            y={y}
            constrain="xy"
            xDomain={[-r, r]}
            yDomain={[-r, r]}
            step={0.15}
            ariaLabel={pick(strings.point, isRtl)}
            snap={(nx, ny) => {
              const norm = Math.hypot(nx, ny) || 1;
              return [(nx / norm) * r, (ny / norm) * r];
            }}
            onChange={(nx, ny) => set('angle', Math.atan2(ny, nx))}
          />
        </MathPlot>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Slider label={strings.radius} value={r} min={1} max={5} step={0.5} onChange={(value) => set('r', value)} format={(value) => fmt(value, 1)} />
        <Toggle label={strings.showTangent} checked={show} isRtl={isRtl} onChange={(checked) => set('show', checked ? 1 : 0)} />
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.point, isRtl), value: `(${fmt(x, 2)}, ${fmt(y, 2)})` },
          {
            label: pick(strings.slope, isRtl),
            value: Number.isFinite(slope) ? `−x/y = ${fmt(slope, 2)}` : pick(strings.vertical, isRtl),
            emphasis: true,
          },
          { label: pick(strings.tangent, isRtl), value: Number.isFinite(slope) ? `y = ${fmt(slope, 2)}(x − ${fmt(x, 2)}) + ${fmt(y, 2)}` : `x = ${fmt(x, 2)}` },
        ]}
      />
      <p className="text-[0.7rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]" dir="ltr">
        x² + y² = r² → 2x + 2y·(dy/dx) = 0 → dy/dx = −x/y
      </p>
    </div>
  );
}

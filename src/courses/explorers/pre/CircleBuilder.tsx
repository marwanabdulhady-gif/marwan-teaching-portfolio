/**
 * 1.9 · The coordinate plane and circles.
 *
 * Drag the centre, drag the radius handle: the standard form, the general form
 * and a distance check update together.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Circle, MathPlot, Point, PointHandle, Segment } from '../../viz/MathPlot';
import { Readout, pick, useExplorerState } from '../../viz/controls';
import { fmt, signed } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'The circle is every point at distance r from (h, k). Drag the centre, then the radius handle.',
    ar: 'الدائرة هي كل نقطة تبعد r عن (h, k). اسحب المركز ثم مقبض نصف القطر.',
  },
  center: { en: 'centre (h, k)', ar: 'المركز (h, k)' },
  radius: { en: 'radius handle', ar: 'مقبض نصف القطر' },
  standard: { en: 'standard form', ar: 'الصيغة القياسية' },
  general: { en: 'general form', ar: 'الصيغة العامة' },
  distance: { en: 'distance from centre', ar: 'المسافة من المركز' },
} satisfies Record<string, Bi>;

const DOMAIN: [number, number] = [-6, 6];

export default function CircleBuilder({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ h: -1, k: 1, r: 2.5 }, onInteract);
  const { h, k, r } = values;

  const d = 2 * r;
  const e = -2 * h;
  const f = -2 * k;
  const c = h * h + k * k - r * r;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={DOMAIN} yDomain={DOMAIN} aspect={1} ariaLabel={`(x − ${fmt(h, 1)})² + (y − ${fmt(k, 1)})² = ${fmt(r, 1)}²`}>
          <Segment x1={h} y1={k} x2={h + r} y2={k} color="var(--t-sun)" width={2} dash="4 3" opacity={0.9} />
          <Circle x={h} y={k} r={r} fill="var(--t-accent)" fillOpacity={0.1} width={2.5} />
          <Point x={h} y={k} color="var(--t-accent)" label="(h, k)" />
          <PointHandle
            x={h + r}
            y={k}
            constrain="x"
            xDomain={DOMAIN}
            yDomain={DOMAIN}
            step={0.1}
            ariaLabel={pick(strings.radius, isRtl)}
            color="var(--t-sun)"
            snap={(x) => [Math.max(h + 0.2, x), k]}
            onChange={(x) => {
              const next = x - h;
              set('r', Math.min(5, Math.max(0.2, Number(Math.abs(next).toFixed(2)))));
            }}
          />
          <PointHandle
            x={h}
            y={k}
            xDomain={DOMAIN}
            yDomain={DOMAIN}
            step={0.5}
            ariaLabel={pick(strings.center, isRtl)}
            onChange={(x, y) => {
              set('h', x);
              set('k', y);
            }}
          />
        </MathPlot>
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.standard, isRtl), value: `(x ${signed(-h, 1)})² + (y ${signed(-k, 1)})² = ${fmt(r * r, 2)}`, emphasis: true },
          { label: pick(strings.general, isRtl), value: `x² + y² ${signed(e, 1)}x ${signed(f, 1)}y ${signed(c, 1)} = 0` },
          { label: pick(strings.distance, isRtl), value: `r = ${fmt(r, 2)}` },
        ]}
      />
    </div>
  );
}

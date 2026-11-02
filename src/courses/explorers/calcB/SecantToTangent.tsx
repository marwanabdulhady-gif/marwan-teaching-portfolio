/**
 * 2.1 · Secant to tangent.
 *
 * Drag the point a, then shrink h: the secant through (a, f(a)) and
 * (a + h, f(a + h)) slides onto the tangent, and the slope readout converges
 * on f′(a) = 2a. The lower plot traces the derivative.
 */
import { useMemo } from 'react';
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, DragHandle, MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  tryIt: { en: 'Try it', ar: 'جرّبها' },
  what: {
    en: 'The secant slope is just an average. Shrink h and it becomes the tangent slope.',
    ar: 'ميل القاطعة متوسط. قلّص h فيصبح ميل المماس.',
  },
  point: { en: 'point a', ar: 'النقطة a' },
  step: { en: 'step h', ar: 'الخطوة h' },
  secant: { en: 'Secant slope', ar: 'ميل القاطعة' },
  tangent: { en: 'Tangent slope f′(a)', ar: 'ميل المماس f′(a)' },
  derivative: { en: 'Derivative plot', ar: 'تمثيل المشتقة' },
  hint: { en: 'As h → 0 the two points merge and the secant becomes the tangent.', ar: 'عندما h → 0 تندمج النقطتان وتصبح القاطعة مماساً.' },
} satisfies Record<string, Bi>;

const f = (x: number) => x * x;
const df = (x: number) => 2 * x;

export default function SecantToTangent({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set, touched] = useExplorerState({ a: 1, h: 1 }, onInteract);
  const a = values.a;
  const h = Math.max(0.002, values.h);

  const secantSlope = useMemo(() => (f(a + h) - f(a)) / h, [a, h]);
  const tangentSlope = df(a);

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">
        {pick(strings.what, isRtl)}
      </p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot
          xDomain={[-3, 4]}
          yDomain={[-1, 12]}
          ariaLabel={pick(strings.tryIt, isRtl)}
        >
          <Curve fn={f} />
          <Segment x1={a - 0.6} y1={f(a) - 0.6 * secantSlope} x2={a + h + 0.8} y2={f(a) + (h + 0.8) * secantSlope} color="var(--t-sky)" width={2} opacity={0.9} />
          <Segment
            x1={a - 1.4}
            y1={f(a) - 1.4 * tangentSlope}
            x2={a + 1.4}
            y2={f(a) + 1.4 * tangentSlope}
            color="var(--t-sun)"
            width={2}
            opacity={0.9}
          />
          <Segment x1={a} y1={0} x2={a} y2={f(a)} color="var(--t-ink)" width={1} dash="3 3" opacity={0.35} />
          <Point x={a} y={f(a)} label="A" />
          <Point x={a + h} y={f(a + h)} color="var(--t-sky)" label="B" />
          <DragHandle
            x={a}
            onChange={(value) => set('a', value)}
            min={-2.4}
            max={2.4}
            step={0.1}
            ariaLabel={pick(strings.point, isRtl)}
            py={18}
          />
        </MathPlot>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider
          label={strings.step}
          value={values.h}
          min={0.002}
          max={2}
          step={0.002}
          onChange={(value) => set('h', value)}
          format={(value) => fmt(Math.max(0.002, value), 3)}
        />
        <Readout
          dir={isRtl ? 'rtl' : 'ltr'}
          rows={[
            { label: pick(strings.secant, isRtl), value: fmt(secantSlope) },
            { label: pick(strings.tangent, isRtl), value: fmt(tangentSlope), emphasis: h < 0.05 },
          ]}
        />
      </div>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <p className="px-1 pb-1 text-[0.65rem] font-bold uppercase tracking-wider text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">
          {pick(strings.derivative, isRtl)}
        </p>
        <MathPlot xDomain={[-3, 4]} yDomain={[-7, 8]} aspect={16 / 5} grid={false} ariaLabel={pick(strings.derivative, isRtl)}>
          <Curve fn={df} color="var(--t-sky)" width={2} />
          <Point x={a} y={df(a)} label="f′(a)" />
        </MathPlot>
      </div>

      {!touched && (
        <p className="text-[0.72rem] text-[color-mix(in_srgb,var(--t-ink)_60%,transparent)]">{pick(strings.hint, isRtl)}</p>
      )}
    </div>
  );
}

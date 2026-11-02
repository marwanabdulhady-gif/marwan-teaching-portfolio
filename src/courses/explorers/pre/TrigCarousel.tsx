/**
 * 5.4 · Trigonometric graphs.
 *
 * Sine, cosine and tangent as a rotating point on the unit circle, with the
 * matching wave unwinding beside it. Sliders set amplitude, period and shift.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'One turn of the circle draws one wave. Amplitude stretches it, the period squeezes it, the shift slides it.',
    ar: 'دورة واحدة على الدائرة ترسم موجة واحدة. السعة تمدّها، والدورة تضغطها، والإزاحة تزحزحها.',
  },
  fn: { en: 'function', ar: 'الدالة' },
  angle: { en: 'angle θ', ar: 'الزاوية θ' },
  amp: { en: 'amplitude A', ar: 'السعة A' },
  period: { en: 'period B', ar: 'الدورة B' },
  shift: { en: 'shift C', ar: 'الإزاحة C' },
  circle: { en: 'on the circle', ar: 'على الدائرة' },
  value: { en: 'height', ar: 'الارتفاع' },
} satisfies Record<string, Bi>;

type TrigId = 'sin' | 'cos' | 'tan';

const FNS: Record<TrigId, (angle: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
};

export default function TrigCarousel({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ id: 0, theta: 0.9, A: 1, B: 1, C: 0 }, onInteract);
  const id: TrigId = (['sin', 'cos', 'tan'] as const)[Math.round(values.id)] ?? 'sin';
  const { theta, A, B, C } = values;
  const fn = FNS[id];
  const height = A * fn(B * theta + C);
  const cx = 200 + 70 * Math.cos(theta);
  const cy = 200 - 70 * Math.sin(theta);

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <SegmentedChoice
        label={strings.fn}
        value={id}
        isRtl={isRtl}
        options={[
          { id: 'sin', label: { en: 'sin', ar: 'sin' } },
          { id: 'cos', label: { en: 'cos', ar: 'cos' } },
          { id: 'tan', label: { en: 'tan', ar: 'tan' } },
        ]}
        onChange={(next) => set('id', (['sin', 'cos', 'tan'] as const).indexOf(next))}
      />

      <div className="grid gap-2 sm:grid-cols-2">
        <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
          <p className="px-1 pb-1 text-[0.6rem] font-bold uppercase tracking-wider text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">
            {pick(strings.circle, isRtl)}
          </p>
          <MathPlot xDomain={[-1.6, 1.6]} yDomain={[-1.6, 1.6]} aspect={1} grid={false} ariaLabel={pick(strings.circle, isRtl)}>
            <circle cx={200} cy={200} r={70 * (400 / 3.2)} fill="none" stroke="var(--t-ink)" strokeOpacity={0.25} strokeWidth={1.5} />
            <Segment x1={0} y1={0} x2={Math.cos(theta)} y2={Math.sin(theta)} color="var(--t-accent)" width={2} opacity={0.8} />
            <Segment x1={Math.cos(theta)} y1={0} x2={Math.cos(theta)} y2={Math.sin(theta)} color="var(--t-sun)" width={2} dash="3 3" />
            <Point x={Math.cos(theta)} y={Math.sin(theta)} r={5} />
          </MathPlot>
        </div>

        <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
          <p className="px-1 pb-1 text-[0.6rem] font-bold uppercase tracking-wider text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">
            y = A·{id}(Bθ + C)
          </p>
          <MathPlot xDomain={[-6.4, 6.4]} yDomain={[-2.5, 2.5]} ariaLabel={id}>
            <Curve fn={(x) => A * fn(B * x + C)} width={2.5} />
            <Segment x1={theta} y1={-2.5} x2={theta} y2={height} color="var(--t-ink)" dash="3 3" opacity={0.4} />
            <Point x={theta} y={height} />
          </MathPlot>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.angle} value={theta} min={-6.28} max={6.28} step={0.05} onChange={(value) => set('theta', value)} format={(value) => fmt(value, 2)} />
        <Slider label={strings.amp} value={A} min={-2} max={2} step={0.1} onChange={(value) => set('A', value)} format={(value) => fmt(value, 1)} />
        <Slider label={strings.period} value={B} min={-3} max={3} step={0.1} onChange={(value) => set('B', value)} format={(value) => fmt(value, 1)} />
        <Slider label={strings.shift} value={C} min={-3.14} max={3.14} step={0.05} onChange={(value) => set('C', value)} format={(value) => fmt(value, 2)} />
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.value, isRtl), value: fmt(height, 3), emphasis: true },
          { label: 'period', value: B === 0 ? '—' : fmt((2 * Math.PI) / Math.abs(B), 2) },
          { label: 'sin θ / cos θ', value: `${fmt(Math.sin(theta), 2)} / ${fmt(Math.cos(theta), 2)}` },
        ]}
      />
    </div>
  );
}

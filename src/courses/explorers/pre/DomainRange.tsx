/**
 * 2.2 · Graphs of functions.
 *
 * Pick a function and drag a trace point. The domain shows as a bar on the
 * x-axis, the range on the y-axis, both live.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, DragHandle, MathPlot, Point, Segment, usePlotScale } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'The domain is the shadow on the x-axis, the range the shadow on the y-axis.',
    ar: 'المجال هو الظل على المحور x، والمدى هو الظل على المحور y.',
  },
  fn: { en: 'function', ar: 'الدالة' },
  trace: { en: 'trace point', ar: 'نقطة التتبع' },
  domain: { en: 'domain', ar: 'المجال' },
  range: { en: 'range', ar: 'المدى' },
  point: { en: 'point', ar: 'النقطة' },
} satisfies Record<string, Bi>;

interface FnDef {
  id: string;
  label: string;
  f: (x: number) => number;
  domain: [number, number];
  domainText: string;
  rangeText: string;
  yRange: [number, number];
  /** Where to draw the range bar (omit when it is unbounded both ways). */
  rangeBar?: [number, number];
}

const FUNCTIONS: FnDef[] = [
  { id: 'sq', label: 'x²', f: (x) => x * x, domain: [-3, 3], domainText: '(−∞, ∞)', rangeText: '[0, ∞)', yRange: [-1, 9], rangeBar: [0, 9] },
  { id: 'sqrt', label: '√x', f: (x) => Math.sqrt(Math.max(0, x)), domain: [0, 6], domainText: '[0, ∞)', rangeText: '[0, ∞)', yRange: [-1, 3.5], rangeBar: [0, 3.5] },
  { id: 'recip', label: '1/x', f: (x) => (x === 0 ? NaN : 1 / x), domain: [-6, 6], domainText: '(−∞, 0) ∪ (0, ∞)', rangeText: '(−∞, 0) ∪ (0, ∞)', yRange: [-6, 6] },
  { id: 'abs', label: '|x|', f: (x) => Math.abs(x), domain: [-4, 4], domainText: '(−∞, ∞)', rangeText: '[0, ∞)', yRange: [-1, 5], rangeBar: [0, 5] },
  { id: 'ln', label: 'ln x', f: (x) => (x <= 0 ? NaN : Math.log(x)), domain: [0, 8], domainText: '(0, ∞)', rangeText: '(−∞, ∞)', yRange: [-3, 3], rangeBar: [-3, 3] },
];

export default function DomainRange({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ fn: 1, x: 2.5 }, onInteract);
  const fn = FUNCTIONS[Math.round(values.fn)] ?? FUNCTIONS[0];
  const x = Math.min(fn.domain[1], Math.max(fn.domain[0], values.x));
  const y = fn.f(x);

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <SegmentedChoice
        label={strings.fn}
        value={fn.id}
        isRtl={isRtl}
        options={FUNCTIONS.map((item) => ({ id: item.id, label: { en: item.label, ar: item.label } }))}
        onChange={(id) => set('fn', FUNCTIONS.findIndex((item) => item.id === id))}
      />

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-6, 6]} yDomain={fn.yRange} ariaLabel={fn.label}>
          <DomainBar from={fn.domain[0]} to={fn.domain[1]} rangeBar={fn.rangeBar} />
          <Curve fn={fn.f} from={fn.domain[0]} to={fn.domain[1]} />
          <Segment x1={x} y1={0} x2={x} y2={y} color="var(--t-ink)" dash="3 3" opacity={0.4} />
          <Segment x1={0} y1={y} x2={x} y2={y} color="var(--t-ink)" dash="3 3" opacity={0.4} />
          <Point x={x} y={y} />
          <DragHandle
            x={x}
            onChange={(value) => set('x', value)}
            min={fn.domain[0]}
            max={fn.domain[1]}
            step={0.1}
            ariaLabel={pick(strings.trace, isRtl)}
            py={20}
          />
        </MathPlot>
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.point, isRtl), value: `x = ${fmt(x, 2)} · f(x) = ${fmt(y, 2)}` },
          { label: pick(strings.domain, isRtl), value: fn.domainText },
          { label: pick(strings.range, isRtl), value: fn.rangeText, emphasis: true },
        ]}
      />
    </div>
  );
}

/** Domain as a bar on the x-axis and range as a bar on the y-axis. */
function DomainBar({ from, to, rangeBar }: { from: number; to: number; rangeBar?: [number, number] }) {
  const scale = usePlotScale();
  const y0 = scale.y(0);
  return (
    <g>
      <line x1={scale.x(from)} y1={y0} x2={scale.x(to)} y2={y0} stroke="var(--t-sky)" strokeWidth={5} strokeLinecap="round" strokeOpacity={0.55} />
      {rangeBar && (
        <line x1={scale.x(0)} y1={scale.y(rangeBar[0])} x2={scale.x(0)} y2={scale.y(rangeBar[1])} stroke="var(--t-sky)" strokeWidth={5} strokeLinecap="round" strokeOpacity={0.55} />
      )}
    </g>
  );
}

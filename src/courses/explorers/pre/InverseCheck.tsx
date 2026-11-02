/**
 * 3.1 · Inverse functions.
 *
 * A function and its reflection in y = x. Flip between f and f⁻¹ to see that
 * the domain and range swap; the horizontal-line test decides whether f⁻¹ is a
 * function at all.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, DragHandle, MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, Toggle, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Reflecting in y = x swaps x and y, so the domain of f becomes the range of f⁻¹.',
    ar: 'الانعكاس حول y = x يبدّل x و y، فيصبح مجال f هو مدى f⁻¹.',
  },
  fn: { en: 'function', ar: 'الدالة' },
  trace: { en: 'trace x', ar: 'قيمة x' },
  showInverse: { en: 'show f⁻¹', ar: 'أظهر f⁻¹' },
  test: { en: 'horizontal test', ar: 'اختبار الخط الأفقي' },
  point: { en: 'on f', ar: 'على f' },
  mirror: { en: 'on f⁻¹', ar: 'على f⁻¹' },
  invertible: { en: 'f⁻¹ is a function', ar: 'f⁻¹ دالة' },
  notInvertible: { en: 'f⁻¹ is not a function', ar: 'f⁻¹ ليست دالة' },
} satisfies Record<string, Bi>;

interface FnDef {
  id: string;
  label: string;
  f: (x: number) => number;
  inverse: (y: number) => number;
  domain: [number, number];
  range: [number, number];
  oneToOne: boolean;
  inverseText: string;
}

const FUNCTIONS: FnDef[] = [
  { id: 'lin', label: '2x + 1', f: (x) => 2 * x + 1, inverse: (y) => (y - 1) / 2, domain: [-3, 3], range: [-5, 7], oneToOne: true, inverseText: '(x − 1)/2' },
  { id: 'cube', label: 'x³', f: (x) => x ** 3, inverse: (y) => Math.cbrt(y), domain: [-2, 2], range: [-8, 8], oneToOne: true, inverseText: '∛x' },
  { id: 'sq', label: 'x² (x ≥ 0)', f: (x) => x * x, inverse: (y) => Math.sqrt(Math.max(0, y)), domain: [0, 3], range: [0, 9], oneToOne: true, inverseText: '√x' },
  { id: 'full-sq', label: 'x² (all x)', f: (x) => x * x, inverse: (y) => Math.sqrt(Math.max(0, y)), domain: [-3, 3], range: [0, 9], oneToOne: false, inverseText: '± √x' },
];

export default function InverseCheck({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ fn: 0, x: 1, show: 1 }, onInteract);
  const fn = FUNCTIONS[Math.round(values.fn)] ?? FUNCTIONS[0];
  const show = values.show > 0.5;
  const x = Math.min(fn.domain[1], Math.max(fn.domain[0], values.x));
  const y = fn.f(x);

  return (
    <div className="space-y-2">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <SegmentedChoice
        label={strings.fn}
        value={fn.id}
        isRtl={isRtl}
        options={FUNCTIONS.map((item) => ({ id: item.id, label: { en: item.label, ar: item.label } }))}
        onChange={(id) => set('fn', FUNCTIONS.findIndex((item) => item.id === id))}
      />

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-4, 4]} yDomain={[-4, 4]} aspect={1} ariaLabel={fn.label}>
          <Segment x1={-4} y1={-4} x2={4} y2={4} color="var(--t-ink)" dash="5 5" opacity={0.28} />
          <Curve fn={fn.f} from={fn.domain[0]} to={fn.domain[1]} />
          {show && <Curve fn={fn.inverse} from={Math.max(fn.range[0], -4)} to={Math.min(fn.range[1], 4)} color="var(--t-sky)" />}
          <Segment x1={x} y1={0} x2={x} y2={y} color="var(--t-ink)" dash="3 3" opacity={0.35} />
          <Point x={x} y={y} />
          {show && <Point x={y} y={x} color="var(--t-sky)" />}
          <DragHandle x={x} onChange={(value) => set('x', value)} min={fn.domain[0]} max={fn.domain[1]} step={0.1} ariaLabel={pick(strings.trace, isRtl)} py={18} />
        </MathPlot>
      </div>

      <Toggle
        label={strings.showInverse}
        checked={show}
        isRtl={isRtl}
        onChange={(checked) => set('show', checked ? 1 : 0)}
        detail={fn.inverseText}
      />

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.point, isRtl), value: `(${fmt(x, 2)}, ${fmt(y, 2)})` },
          { label: pick(strings.mirror, isRtl), value: `(${fmt(y, 2)}, ${fmt(x, 2)})` },
          {
            label: pick(strings.test, isRtl),
            value: pick(fn.oneToOne ? strings.invertible : strings.notInvertible, isRtl),
            emphasis: true,
          },
        ]}
      />
      {!fn.oneToOne && (
        <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">
          {isRtl
            ? 'الخط الأفقي يقطع القطع المكافئ مرتين، لذا لانعكاسه قيمتان — أي أنه ليس دالة.'
            : 'A horizontal line cuts the parabola twice, so its reflection has two values and is not a function.'}
        </p>
      )}
    </div>
  );
}

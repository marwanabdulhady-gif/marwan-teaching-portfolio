/**
 * 2.1 · Functions.
 *
 * Pick a curve, drag a vertical line across it: one crossing means the graph
 * is a function, two or more means it is not.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, DragHandle, MathPlot, Point } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'A graph is a function when no vertical line meets it twice. Drag the line and count.',
    ar: 'يكون التمثيل دالة إذا لم يقطعه أي خط عمودي مرتين. اسحب الخط واعدّ.',
  },
  line: { en: 'vertical line x = c', ar: 'الخط العمودي x = c' },
  curve: { en: 'curve', ar: 'المنحنى' },
  hits: { en: 'intersections', ar: 'نقاط التقاطع' },
  verdict: { en: 'verdict', ar: 'الحكم' },
  yes: { en: 'Function ✓', ar: 'دالة ✓' },
  no: { en: 'Not a function ✗', ar: 'ليست دالة ✗' },
} satisfies Record<string, Bi>;

type CurveId = 'parabola' | 'circle' | 'sideways' | 'abs';

const CURVES: { id: CurveId; label: Bi; branches: (x: number) => number[]; top?: (x: number) => number; bottom?: (x: number) => number; domain?: [number, number] }[] = [
  { id: 'parabola', label: { en: 'y = x²', ar: 'y = x²' }, branches: (x) => [x * x] },
  { id: 'abs', label: { en: 'y = |x|', ar: 'y = |x|' }, branches: (x) => [Math.abs(x)] },
  {
    id: 'circle',
    label: { en: 'x² + y² = 9', ar: 'x² + y² = 9' },
    branches: (x) => (9 - x * x < 0 ? [] : [Math.sqrt(9 - x * x), -Math.sqrt(9 - x * x)]),
    top: (x) => (9 - x * x < 0 ? NaN : Math.sqrt(9 - x * x)),
    bottom: (x) => (9 - x * x < 0 ? NaN : -Math.sqrt(9 - x * x)),
    domain: [-3, 3],
  },
  {
    id: 'sideways',
    label: { en: 'x = y² − 2', ar: 'x = y² − 2' },
    branches: (x) => {
      const inner = x + 2;
      return inner < 0 ? [] : [Math.sqrt(inner), -Math.sqrt(inner)];
    },
    top: (x) => Math.sqrt(Math.max(x + 2, 0)),
    bottom: (x) => -Math.sqrt(Math.max(x + 2, 0)),
    domain: [-2, 5],
  },
];

const DOMAIN: [number, number] = [-5, 5];

export default function VerticalLineTest({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ c: 1, curve: 0 }, onInteract);
  const curve = CURVES[Math.round(values.curve)] ?? CURVES[0];
  const c = values.c;
  const hits = curve.branches(c);
  const isFunction = hits.length <= 1;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <SegmentedChoice
        label={strings.curve}
        value={curve.id}
        isRtl={isRtl}
        options={CURVES.map((item) => ({ id: item.id, label: item.label }))}
        onChange={(id) => set('curve', CURVES.findIndex((item) => item.id === id))}
      />

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={DOMAIN} yDomain={[-5, 5]} ariaLabel={pick(strings.line, isRtl)}>
          {curve.top && curve.bottom ? (
            <>
              <Curve fn={curve.top} from={curve.domain?.[0]} to={curve.domain?.[1]} />
              <Curve fn={curve.bottom} from={curve.domain?.[0]} to={curve.domain?.[1]} />
            </>
          ) : (
            <Curve fn={(x) => curve.branches(x)[0] ?? NaN} />
          )}
          <line
            x1={200 + c * 40}
            y1={0}
            x2={200 + c * 40}
            y2={400}
            stroke={isFunction ? '#2a8a57' : '#b5481f'}
            strokeWidth={2}
            strokeDasharray="6 4"
          />
          {hits.map((y, index) => (
            <Point key={index} x={c} y={y} color={isFunction ? '#2a8a57' : '#b5481f'} r={5} />
          ))}
          <DragHandle x={c} onChange={(value) => set('c', value)} min={-5} max={5} step={0.1} ariaLabel={pick(strings.line, isRtl)} py={20} />
        </MathPlot>
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.line, isRtl), value: fmt(c, 1) },
          { label: pick(strings.hits, isRtl), value: String(hits.length) },
          { label: pick(strings.verdict, isRtl), value: pick(isFunction ? strings.yes : strings.no, isRtl), emphasis: true },
        ]}
      />
    </div>
  );
}

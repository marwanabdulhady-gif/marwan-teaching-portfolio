/**
 * P.1 · Graphs and models.
 *
 * Pick an equation, then switch symmetries on: the reflected ghost curve is
 * drawn on top. Where it matches, the graph has that symmetry — and the
 * intercepts are listed with it.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, MathPlot, Point } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, Toggle, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'A graph is symmetric when a reflection lands exactly on it. Switch each one on and look.',
    ar: 'يكون التمثيل متماثلاً عندما ينطبق انعكاسه عليه تماماً. جرّب كل انعكاس وانظر.',
  },
  equation: { en: 'equation', ar: 'المعادلة' },
  xAxis: { en: 'x-axis symmetry', ar: 'تماثل حول المحور x' },
  yAxis: { en: 'y-axis symmetry', ar: 'تماثل حول المحور y' },
  origin: { en: 'origin symmetry', ar: 'تماثل حول نقطة الأصل' },
  intercepts: { en: 'intercepts', ar: 'التقاطعات' },
  verdict: { en: 'holds?', ar: 'ينطبق؟' },
  yes: { en: 'yes', ar: 'نعم' },
  no: { en: 'no', ar: 'لا' },
  show: { en: 'show', ar: 'أظهر' },
} satisfies Record<string, Bi>;

interface Equation {
  id: string;
  label: string;
  top?: (x: number) => number;
  bottom?: (x: number) => number;
  /** Does the graph pass this symmetry test? */
  sym: { x: boolean; y: boolean; origin: boolean };
  intercepts: string;
  domain?: [number, number];
}

const EQUATIONS: Equation[] = [
  {
    id: 'cubic',
    label: 'y = x³ − x',
    top: (x) => x ** 3 - x,
    sym: { x: false, y: false, origin: true },
    intercepts: '(−1, 0) · (0, 0) · (1, 0)',
  },
  {
    id: 'circle',
    label: 'x² + y² = 4',
    top: (x) => (4 - x * x < 0 ? NaN : Math.sqrt(4 - x * x)),
    bottom: (x) => (4 - x * x < 0 ? NaN : -Math.sqrt(4 - x * x)),
    sym: { x: true, y: true, origin: true },
    intercepts: '(±2, 0) · (0, ±2)',
    domain: [-2, 2],
  },
  {
    id: 'parabola',
    label: 'y = x² − 1',
    top: (x) => x * x - 1,
    sym: { x: false, y: true, origin: false },
    intercepts: '(−1, 0) · (1, 0) · (0, −1)',
  },
];

export default function InterceptsSymmetry({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ eq: 0, sx: 0, sy: 1, so: 0 }, onInteract);
  const equation = EQUATIONS[Math.round(values.eq)] ?? EQUATIONS[0];
  const showX = values.sx > 0.5;
  const showY = values.sy > 0.5;
  const showO = values.so > 0.5;

  const ghost = (x: number) =>
    showX ? -(equation.top?.(x) ?? NaN) : showY ? equation.top?.(-x) ?? NaN : showO ? -(equation.top?.(-x) ?? NaN) : NaN;

  const active = showX ? equation.sym.x : showY ? equation.sym.y : showO ? equation.sym.origin : null;

  return (
    <div className="space-y-2">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <SegmentedChoice
        label={strings.equation}
        value={equation.id}
        isRtl={isRtl}
        options={EQUATIONS.map((item) => ({ id: item.id, label: { en: item.label, ar: item.label } }))}
        onChange={(id) => set('eq', EQUATIONS.findIndex((item) => item.id === id))}
      />

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-3, 3]} yDomain={[-3, 3]} aspect={1} ariaLabel={equation.label}>
          <Curve fn={(x) => equation.top?.(x) ?? NaN} from={equation.domain?.[0]} to={equation.domain?.[1]} width={3} />
          {equation.bottom && <Curve fn={equation.bottom} from={equation.domain?.[0]} to={equation.domain?.[1]} width={3} />}
          <Curve fn={ghost} from={equation.domain?.[0]} to={equation.domain?.[1]} color="var(--t-sun)" dash="6 5" width={2} opacity={0.95} />
          <Point x={0} y={0} r={3} color="var(--t-ink)" />
        </MathPlot>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <Toggle label={strings.xAxis} checked={showX} isRtl={isRtl} onChange={(checked) => set('sx', checked ? 1 : 0)} />
        <Toggle label={strings.yAxis} checked={showY} isRtl={isRtl} onChange={(checked) => set('sy', checked ? 1 : 0)} />
        <Toggle label={strings.origin} checked={showO} isRtl={isRtl} onChange={(checked) => set('so', checked ? 1 : 0)} />
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.intercepts, isRtl), value: equation.intercepts },
          {
            label: pick(strings.verdict, isRtl),
            value: active === null ? '—' : pick(active ? strings.yes : strings.no, isRtl),
            emphasis: true,
          },
        ]}
      />
      {active === false && (
        <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">
          {isRtl ? 'الخط المتقطع لا ينطبق على المنحنى، فلا يوجد هذا التماثل.' : 'The dashed reflection does not sit on the curve, so this symmetry fails.'}
        </p>
      )}
      <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">
        {fmt(0, 0)} {isRtl ? 'درجات الزوم ثابتة للمقارنة.' : 'The window is fixed so the reflections are comparable.'}
      </p>
    </div>
  );
}

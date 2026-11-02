/**
 * Algebra 1 · 2.1–2.4 — one lab for slopes, graphing, writing equations and
 * parallel/perpendicular lines. The lesson id picks the mode, so the four
 * lessons share the same plot and controls.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, Slider, Toggle, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  slope: { en: 'slope m', ar: 'الميل m' },
  intercept: { en: 'intercept b', ar: 'المقطع b' },
  second: { en: 'second slope', ar: 'الميل الثاني' },
  x1: { en: 'x₁', ar: 'x₁' },
  x2: { en: 'x₂', ar: 'x₂' },
  rise: { en: 'rise / run', ar: 'الصعود / الأفقي' },
  equation: { en: 'equation', ar: 'المعادلة' },
  relation: { en: 'the two lines', ar: 'الخطان' },
  parallel: { en: 'parallel: equal slopes', ar: 'متوازيان: ميلان متساويان' },
  perpendicular: { en: 'perpendicular: product = −1', ar: 'متعامدان: حاصل الضرب = −١' },
  neither: { en: 'neither', ar: 'لا هذا ولا ذاك' },
  intercepts: { en: 'intercepts', ar: 'المقاطع' },
  points: { en: 'two points on the line', ar: 'نقطتان على الخط' },
  showSecond: { en: 'show a second line', ar: 'أظهر خطاً ثانياً' },
} satisfies Record<string, Bi>;

const X: [number, number] = [-8, 8];
const Y: [number, number] = [-6, 10];

export default function LineLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const mode = lesson.id;
  const [values, set] = useExplorerState({ m: 1, b: 1, m2: -1, x1: -2, x2: 3, second: 0 }, onInteract);
  const { m, b, m2 } = values;
  const showSecond = mode === '2-4' || values.second > 0.5;

  const y = (x: number) => m * x + b;
  const y2 = (x: number) => m2 * x - 2;
  const x1 = values.x1;
  const x2 = Math.max(x1 + 1, values.x2);
  const run = x2 - x1;
  const rise = m * run;
  const relation = Math.abs(m - m2) < 1e-9 ? pick(strings.parallel, isRtl) : Math.abs(m * m2 + 1) < 1e-9 ? pick(strings.perpendicular, isRtl) : pick(strings.neither, isRtl);

  const equation = `y = ${fmt(m, 2)}x ${b >= 0 ? '+' : '−'} ${fmt(Math.abs(b), 2)}`;

  return (
    <div className="space-y-3">
      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={X} yDomain={Y} ariaLabel={pick(strings.equation, isRtl)}>
          <Curve fn={y} width={3} />
          {showSecond && <Curve fn={y2} color="var(--t-sky)" width={2.5} />}
          {(mode === '2-1' || mode === '2-3') && (
            <>
              <Segment x1={x1} y1={y(x1)} x2={x2} y2={y(x1)} color="var(--t-ink)" dash="4 3" opacity={0.5} />
              <Segment x1={x2} y1={y(x1)} x2={x2} y2={y(x2)} color="var(--t-sun)" width={2.5} />
              <Point x={x1} y={y(x1)} label={`(${fmt(x1, 1)}, ${fmt(y(x1), 1)})`} />
              <Point x={x2} y={y(x2)} label={`(${fmt(x2, 1)}, ${fmt(y(x2), 1)})`} />
            </>
          )}
          {mode !== '2-1' && mode !== '2-3' && (
            <>
              <Point x={0} y={b} r={5} label={`(0, ${fmt(b, 1)})`} />
              {Math.abs(m) > 1e-9 && <Point x={-b / m} y={0} r={4} color="var(--t-sky)" label={`(${fmt(-b / m, 1)}, 0)`} />}
            </>
          )}
        </MathPlot>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.slope} value={m} min={-3} max={3} step={0.25} onChange={(value) => set('m', value)} format={(value) => fmt(value, 2)} />
        <Slider label={strings.intercept} value={b} min={-5} max={6} step={0.5} onChange={(value) => set('b', value)} format={(value) => fmt(value, 1)} />
      </div>

      {(mode === '2-1' || mode === '2-3') && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Slider label={strings.x1} value={values.x1} min={-5} max={2} step={0.5} onChange={(value) => set('x1', value)} format={(value) => fmt(value, 1)} />
          <Slider label={strings.x2} value={values.x2} min={-4} max={5} step={0.5} onChange={(value) => set('x2', value)} format={(value) => fmt(value, 1)} />
        </div>
      )}

      {mode === '2-4' && (
        <Slider label={strings.second} value={m2} min={-3} max={3} step={0.25} onChange={(value) => set('m2', value)} format={(value) => fmt(value, 2)} />
      )}

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={
          mode === '2-1'
            ? [
                { label: pick(strings.rise, isRtl), value: `${fmt(rise, 2)} / ${fmt(run, 2)}`, emphasis: true },
                { label: pick(strings.slope, isRtl), value: fmt(m, 2) },
                { label: pick(strings.equation, isRtl), value: equation },
              ]
            : mode === '2-3'
              ? [
                  { label: pick(strings.points, isRtl), value: `(${fmt(x1, 1)}, ${fmt(y(x1), 1)}) · (${fmt(x2, 1)}, ${fmt(y(x2), 1)})` },
                  { label: pick(strings.slope, isRtl), value: fmt(m, 2) },
                  { label: pick(strings.equation, isRtl), value: equation, emphasis: true },
                ]
              : mode === '2-4'
                ? [
                    { label: pick(strings.relation, isRtl), value: relation, emphasis: true },
                    { label: 'm₁ · m₂', value: fmt(m * m2, 3) },
                    { label: pick(strings.equation, isRtl), value: equation },
                  ]
                : [
                    { label: pick(strings.equation, isRtl), value: equation, emphasis: true },
                    { label: pick(strings.intercepts, isRtl), value: `(0, ${fmt(b, 1)}) · (${fmt(Math.abs(m) > 1e-9 ? -b / m : NaN, 1)}, 0)` },
                    { label: pick(strings.slope, isRtl), value: fmt(m, 2) },
                  ]
        }
      />

      {mode === '2-2' && (
        <Toggle label={strings.showSecond} checked={values.second > 0.5} isRtl={isRtl} onChange={(checked) => set('second', checked ? 1 : 0)} detail="y = −x − 2" />
      )}
    </div>
  );
}

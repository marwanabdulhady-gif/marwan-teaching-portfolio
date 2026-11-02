/**
 * Algebra 1 · 3.1–3.3 — where two lines meet, and where two half-planes overlap.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, MathPlot, Point, Region } from '../../viz/MathPlot';
import { Readout, Slider, Toggle, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'The solution of a system is the point that satisfies every equation at once.',
    ar: 'حل النظام هو النقطة التي تحقق كل المعادلات في الوقت نفسه.',
  },
  m1: { en: 'slope of line 1', ar: 'ميل الخط ١' },
  b1: { en: 'intercept of line 1', ar: 'مقطع الخط ١' },
  m2: { en: 'slope of line 2', ar: 'ميل الخط ٢' },
  b2: { en: 'intercept of line 2', ar: 'مقطع الخط ٢' },
  intersection: { en: 'intersection', ar: 'نقطة التقاطع' },
  verdict: { en: 'solutions', ar: 'الحلول' },
  one: { en: 'exactly one', ar: 'حل واحد' },
  none: { en: 'none — parallel', ar: 'لا حل — متوازيان' },
  infinite: { en: 'infinitely many — same line', ar: 'عدد لا نهائي — نفس الخط' },
  shade: { en: 'test a point', ar: 'اختبر نقطة' },
  region: { en: 'feasible region', ar: 'المنطقة الممكنة' },
  overlap: { en: 'overlap of both shadings', ar: 'تقاطع التظليلين' },
  second: { en: 'show y > x + 1 too', ar: 'أظهر y > x + 1 أيضاً' },
} satisfies Record<string, Bi>;

const X: [number, number] = [-8, 8];

export default function SystemLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ m1: 1, b1: -1, m2: -1, b2: 3, second: 1 }, onInteract);
  const { m1, b1, m2, b2 } = values;
  const inequalities = lesson.id === '3-3';
  const showSecond = inequalities ? values.second > 0.5 : true;

  const y1 = (x: number) => m1 * x + b1;
  const y2 = (x: number) => m2 * x + b2;
  const parallel = Math.abs(m1 - m2) < 1e-9;
  const sameLine = parallel && Math.abs(b1 - b2) < 1e-9;
  const x = parallel ? NaN : (b2 - b1) / (m1 - m2);
  const y = parallel ? NaN : y1(x);

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={X} yDomain={X} ariaLabel={pick(strings.intersection, isRtl)}>
          {inequalities && (
            <>
              <Region top={(value) => y1(value)} from={-8} to={8} opacity={0.1} />
              {showSecond && <Region top={(value) => y2(value)} from={-8} to={8} opacity={0.1} color="var(--t-sky)" />}
            </>
          )}
          <Curve fn={y1} width={3} />
          {showSecond && <Curve fn={y2} color="var(--t-sky)" width={2.5} />}
          {!parallel && <Point x={x} y={y} r={6} label={`(${fmt(x, 2)}, ${fmt(y, 2)})`} />}
        </MathPlot>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.m1} value={m1} min={-3} max={3} step={0.25} onChange={(value) => set('m1', value)} format={(value) => fmt(value, 2)} />
        <Slider label={strings.b1} value={b1} min={-6} max={6} step={0.5} onChange={(value) => set('b1', value)} format={(value) => fmt(value, 1)} />
        <Slider label={strings.m2} value={m2} min={-3} max={3} step={0.25} onChange={(value) => set('m2', value)} format={(value) => fmt(value, 2)} />
        <Slider label={strings.b2} value={b2} min={-6} max={6} step={0.5} onChange={(value) => set('b2', value)} format={(value) => fmt(value, 1)} />
      </div>

      {inequalities && (
        <Toggle label={strings.second} checked={showSecond} isRtl={isRtl} onChange={(checked) => set('second', checked ? 1 : 0)} />
      )}

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          {
            label: pick(strings.intersection, isRtl),
            value: parallel ? (sameLine ? pick(strings.infinite, isRtl) : pick(strings.none, isRtl)) : `(${fmt(x, 2)}, ${fmt(y, 2)})`,
            emphasis: true,
          },
          {
            label: pick(strings.verdict, isRtl),
            value: sameLine ? pick(strings.infinite, isRtl) : parallel ? pick(strings.none, isRtl) : pick(strings.one, isRtl),
          },
          { label: 'y =', value: `${fmt(m1, 1)}x ${b1 >= 0 ? '+' : '−'} ${fmt(Math.abs(b1), 1)}  ·  ${fmt(m2, 1)}x ${b2 >= 0 ? '+' : '−'} ${fmt(Math.abs(b2), 1)}` },
        ]}
      />

      {inequalities && (
        <p className="text-[0.7rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">
          {pick(strings.region, isRtl)}: {pick(strings.overlap, isRtl)} — {isRtl ? 'النقطة (0, 8) تحقق المتباينتين.' : 'the point (0, 8) satisfies both.'}
        </p>
      )}
    </div>
  );
}

/**
 * Algebra 1 · 4.3–4.4 — factor a trinomial with two sliders, then read the
 * roots straight off the parabola.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt, signed } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'The two numbers that multiply to c and add to b are exactly the numbers in the brackets.',
    ar: 'العددان اللذان حاصل ضربهما c ومجموعهما b هما نفسهما العددان داخل القوسين.',
  },
  p: { en: 'first factor p', ar: 'العامل الأول p' },
  q: { en: 'second factor q', ar: 'العامل الثاني q' },
  factored: { en: 'factored', ar: 'بعد التحليل' },
  expanded: { en: 'expanded', ar: 'بعد النشر' },
  sum: { en: 'p + q (= b)', ar: 'p + q (= b)' },
  product: { en: 'p · q (= c)', ar: 'p · q (= c)' },
  roots: { en: 'roots', ar: 'الجذور' },
  vertex: { en: 'vertex', ar: 'الرأس' },
} satisfies Record<string, Bi>;

export default function FactorLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ p: 3, q: 4 }, onInteract);
  const p = Math.round(values.p);
  const q = Math.round(values.q);
  const b = p + q;
  const c = p * q;
  const f = (x: number) => x * x + b * x + c;
  const vertexX = -b / 2;
  const showGraph = lesson.id === '4-4';

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      {showGraph && (
        <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
          <MathPlot xDomain={[-8, 4]} yDomain={[-14, 12]} ariaLabel={`y = x² ${signed(b, 0)}x ${signed(c, 0)}`}>
            <Curve fn={f} width={3} />
            {[-p, -q].map((root) => (
              <g key={root}>
                <Segment x1={root} y1={0} x2={root} y2={0} color="var(--t-sun)" width={1} />
                <Point x={root} y={0} r={5} color="var(--t-sun)" label={`x = ${fmt(root, 0)}`} />
              </g>
            ))}
            <Point x={vertexX} y={f(vertexX)} r={4} color="var(--t-sky)" label="vertex" />
          </MathPlot>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.p} value={p} min={-8} max={8} step={1} onChange={(value) => set('p', value)} format={(value) => fmt(value, 0)} />
        <Slider label={strings.q} value={q} min={-8} max={8} step={1} onChange={(value) => set('q', value)} format={(value) => fmt(value, 0)} />
      </div>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] px-3 py-3 text-center">
        <p className="font-mono text-base font-black text-[var(--t-ink)]">
          (x {signed(p, 0)})(x {signed(q, 0)})
        </p>
        <p className="mt-1 font-mono text-sm text-[var(--t-accent-deep)]">= x² {signed(b, 0)}x {signed(c, 0)}</p>
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.factored, isRtl), value: `(x ${signed(p, 0)})(x ${signed(q, 0)})` },
          { label: pick(strings.expanded, isRtl), value: `x² ${signed(b, 0)}x ${signed(c, 0)}`, emphasis: true },
          { label: pick(strings.sum, isRtl), value: `${fmt(p, 0)} + ${fmt(q, 0)} = ${fmt(b, 0)}` },
          { label: pick(strings.product, isRtl), value: `${fmt(p, 0)} · ${fmt(q, 0)} = ${fmt(c, 0)}` },
          ...(showGraph
            ? [
                { label: pick(strings.roots, isRtl), value: `x = ${fmt(-p, 0)} · x = ${fmt(-q, 0)}` },
                { label: pick(strings.vertex, isRtl), value: `(${fmt(vertexX, 2)}, ${fmt(f(vertexX), 1)})` },
              ]
            : []),
        ]}
      />

      {showGraph && (
        <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
          {isRtl
            ? 'لاحظ: الجذور تقع عند x = −p و x = −q، لأن كل قوس يساوي صفراً عندها.'
            : 'Notice: the roots sit at x = −p and x = −q, because each bracket is zero there.'}
        </p>
      )}
    </div>
  );
}

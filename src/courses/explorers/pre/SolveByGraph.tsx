/**
 * 5.3 · Solving equations and inequalities graphically.
 *
 * Set the two sides; their intersection is the solution. The sign of f − g is
 * shaded so the inequality answers read straight off the picture.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Solutions of f(x) = g(x) are the crossing points. Where f − g is positive, f is on top.',
    ar: 'حلول f(x) = g(x) هي نقاط التقاطع. وحيث f − g موجب تكون f أعلى.',
  },
  m: { en: 'slope m of f', ar: 'ميل f = m' },
  k: { en: 'intercept k of f', ar: 'المقطع k لـ f' },
  crossing: { en: 'crossing', ar: 'التقاطع' },
  above: { en: 'f above g on', ar: 'f أعلى من g على' },
  below: { en: 'f below g on', ar: 'f أسفل من g على' },
  none: { en: 'no crossing: no real solution', ar: 'لا تقاطع: لا حل حقيقي' },
} satisfies Record<string, Bi>;

const g = (x: number) => x * x;

export default function SolveByGraph({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ m: 2, k: -1 }, onInteract);
  const m = values.m;
  const k = values.k;
  const f = (x: number) => m * x + k;

  // f(x) = g(x)  →  x² − m x − k = 0
  const disc = m * m + 4 * k;
  const roots = disc < 0 ? [] : disc === 0 ? [m / 2] : [(m + Math.sqrt(disc)) / 2, (m - Math.sqrt(disc)) / 2].sort((a, b) => a - b);

  const above = roots.length === 2
    ? `(−∞, ${fmt(roots[0], 2)}) ∪ (${fmt(roots[1], 2)}, ∞)`
    : roots.length === 1
      ? `x ≠ ${fmt(roots[0], 2)}`
      : '(−∞, ∞)';

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-4, 4]} yDomain={[-6, 10]} ariaLabel="f(x) = mx + k and g(x) = x²">
          <Curve fn={g} />
          <Curve fn={f} color="var(--t-sky)" />
          {roots.map((root) => (
            <g key={root}>
              <Segment x1={root} y1={0} x2={root} y2={g(root)} color="var(--t-ink)" dash="3 3" opacity={0.35} />
              <Point x={root} y={g(root)} r={5.5} color="var(--t-sun)" />
            </g>
          ))}
        </MathPlot>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.m} value={m} min={-4} max={4} step={0.5} onChange={(value) => set('m', value)} format={(value) => fmt(value, 1)} />
        <Slider label={strings.k} value={k} min={-6} max={4} step={0.5} onChange={(value) => set('k', value)} format={(value) => fmt(value, 1)} />
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          {
            label: pick(strings.crossing, isRtl),
            value: roots.length ? roots.map((root) => `x = ${fmt(root, 2)}`).join(' · ') : pick(strings.none, isRtl),
            emphasis: true,
          },
          { label: pick(strings.above, isRtl), value: above },
          { label: 'f − g', value: `−x² ${m >= 0 ? '+' : '−'} ${fmt(Math.abs(m), 1)}x ${k >= 0 ? '+' : '−'} ${fmt(Math.abs(k), 1)}` },
        ]}
      />
    </div>
  );
}

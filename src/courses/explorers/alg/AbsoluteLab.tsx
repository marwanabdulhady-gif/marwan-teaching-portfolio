/**
 * Algebra 2 · 1.3 — |x − h| as a distance. The V-shaped graph is the price of
 * being h away from the centre, and the inequality shades the band that fits.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, MathPlot, Point, Region, Segment } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'The graph rises at the same rate on both sides, so an “= k” equation always has two answers.',
    ar: 'يرتفع المنحنى بالمعدل نفسه على الجهتين، لذا لمعادلة “= k” دائماً جوابان.',
  },
  centre: { en: 'centre h', ar: 'المركز h' },
  stretch: { en: 'stretch a', ar: 'التكبير a' },
  height: { en: 'height k', ar: 'الارتفاع k' },
  kind: { en: 'compare with k', ar: 'المقارنة مع k' },
  solutions: { en: 'solutions', ar: 'الحلول' },
  distance: { en: 'distance from h', ar: 'المسافة عن h' },
  band: { en: 'band of solutions', ar: 'نطاق الحلول' },
} satisfies Record<string, Bi>;

type Kind = 'eq' | 'lt' | 'gt';

export default function AbsoluteLab({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ h: 1, a: 1, k: 3, kind: 0 }, onInteract);
  const { h, a, k } = values;
  const kind = (['eq', 'lt', 'gt'] as const)[Math.round(values.kind)] ?? 'eq';
  const f = (x: number) => a * Math.abs(x - h);
  const width = a === 0 ? 0 : k / Math.abs(a);

  const left = h - width;
  const right = h + width;
  const solution =
    kind === 'eq'
      ? `x = ${fmt(left, 2)} · x = ${fmt(right, 2)}`
      : kind === 'lt'
        ? `${fmt(left, 2)} < x < ${fmt(right, 2)}`
        : `x < ${fmt(left, 2)} or x > ${fmt(right, 2)}`;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-6, 8]} yDomain={[-1, 8]} ariaLabel={`a|x − h| = k`}>
          {/* The shaded band between the two solutions, in data coordinates:
              the old pixel maths put x = 0 at 200 px, but the domain starts at
              −6, so the band sat about one unit to the right. */}
          {kind === 'lt' && <Region from={left} to={right} top={() => 8} bottom={() => -1} />}
          <Curve fn={f} width={3} />
          <Segment x1={-6} y1={k} x2={8} y2={k} color="var(--t-sun)" dash="5 4" opacity={0.8} />
          <Point x={left} y={k} r={5} color="var(--t-accent)" />
          <Point x={right} y={k} r={5} color="var(--t-accent)" />
          <Segment x1={h} y1={0} x2={h} y2={k} color="var(--t-ink)" dash="3 3" opacity={0.35} />
        </MathPlot>
      </div>

      <SegmentedChoice
        label={strings.kind}
        value={kind}
        isRtl={isRtl}
        options={[
          { id: 'eq', label: { en: '= k', ar: '= k' } },
          { id: 'lt', label: { en: '< k', ar: '< k' } },
          { id: 'gt', label: { en: '> k', ar: '> k' } },
        ]}
        onChange={(id) => set('kind', (['eq', 'lt', 'gt'] as const).indexOf(id))}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label={strings.centre} value={h} min={-4} max={5} step={0.5} onChange={(value) => set('h', value)} format={(value) => fmt(value, 1)} />
        <Slider label={strings.stretch} value={a} min={0.5} max={2} step={0.25} onChange={(value) => set('a', value)} format={(value) => fmt(value, 2)} />
        <Slider label={strings.height} value={k} min={1} max={6} step={0.5} onChange={(value) => set('k', value)} format={(value) => fmt(value, 1)} />
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.band, isRtl), value: `[${fmt(left, 2)}, ${fmt(right, 2)}]` },
          { label: pick(strings.solutions, isRtl), value: solution, emphasis: true },
          { label: pick(strings.distance, isRtl), value: `k / a = ${fmt(width, 2)}` },
        ]}
      />
    </div>
  );
}

/**
 * Algebra 2 · 2.1, 2.2, 2.4 — the parabola as a machine: vertex, discriminant,
 * roots, and where a line can cut it.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt, signed } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'The vertex form and the discriminant answer different questions: where the turning point is, and how many times the curve meets the x-axis.',
    ar: 'صيغة الرأس والمميز يجيبان عن سؤالين مختلفين: أين نقطة الاستدارة، وكم مرة يقطع المنحنى المحور x.',
  },
  a: { en: 'a', ar: 'a' },
  b: { en: 'b', ar: 'b' },
  c: { en: 'c', ar: 'c' },
  line: { en: 'line slope', ar: 'ميل الخط' },
  vertex: { en: 'vertex', ar: 'الرأس' },
  axis: { en: 'axis of symmetry', ar: 'محور التماثل' },
  discriminant: { en: 'discriminant b² − 4ac', ar: 'المميز b² − 4ac' },
  roots: { en: 'roots', ar: 'الجذور' },
  verdict: { en: 'type of roots', ar: 'نوع الجذور' },
  twoReal: { en: 'two real', ar: 'جذران حقيقيان' },
  oneReal: { en: 'one repeated real', ar: 'جذر حقيقي مكرر' },
  complex: { en: 'two complex', ar: 'جذران مركبان' },
  meets: { en: 'line meets the curve', ar: 'الخط يقطع المنحنى' },
  vertexForm: { en: 'vertex form', ar: 'صيغة الرأس' },
} satisfies Record<string, Bi>;

export default function ParabolaLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ a: 1, b: -4, c: 1, m: 1 }, onInteract);
  const { a, b, c, m } = values;
  const showLine = lesson.id === '2-4';

  const f = (x: number) => a * x * x + b * x + c;
  const g = (x: number) => m * x + 1;
  const h = a === 0 ? NaN : -b / (2 * a);
  const k = Number.isFinite(h) ? f(h) : NaN;
  const disc = b * b - 4 * a * c;

  let roots = '—';
  if (a !== 0) {
    if (disc > 0) roots = `x = ${fmt((-b + Math.sqrt(disc)) / (2 * a), 2)} · ${fmt((-b - Math.sqrt(disc)) / (2 * a), 2)}`;
    else if (Math.abs(disc) < 1e-9) roots = `x = ${fmt(-b / (2 * a), 2)} (double)`;
    else roots = `${fmt(-b / (2 * a), 2)} ± ${fmt(Math.sqrt(-disc) / (2 * a), 2)}i`;
  }

  // Where does the line cut the parabola? ax² + (b − m)x + (c − 1) = 0
  const A = a;
  const B = b - m;
  const C = c - 1;
  const lineDisc = B * B - 4 * A * C;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-6, 8]} yDomain={[-8, 10]} ariaLabel={`y = ${fmt(a, 1)}x² ${signed(b, 1)}x ${signed(c, 1)}`}>
          {Number.isFinite(h) && <Segment x1={h} y1={-8} x2={h} y2={10} color="var(--t-ink)" dash="5 4" opacity={0.3} />}
          <Curve fn={f} width={3} />
          {showLine && <Curve fn={g} color="var(--t-sky)" width={2.5} />}
          {Number.isFinite(k) && <Point x={h} y={k} r={5} color="var(--t-sun)" label="vertex" />}
          {a !== 0 &&
            disc >= 0 &&
            [(-b + Math.sqrt(disc)) / (2 * a), (-b - Math.sqrt(disc)) / (2 * a)].map((root, index) => (
              <Point key={index} x={root} y={0} r={4} color="var(--t-accent)" />
            ))}
        </MathPlot>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label={strings.a} value={a} min={-2} max={2} step={0.25} onChange={(value) => set('a', value)} format={(value) => fmt(value, 2)} />
        <Slider label={strings.b} value={b} min={-6} max={6} step={0.5} onChange={(value) => set('b', value)} format={(value) => fmt(value, 1)} />
        <Slider label={strings.c} value={c} min={-6} max={6} step={0.5} onChange={(value) => set('c', value)} format={(value) => fmt(value, 1)} />
      </div>

      {showLine && <Slider label={strings.line} value={m} min={-3} max={3} step={0.5} onChange={(value) => set('m', value)} format={(value) => fmt(value, 1)} />}

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.vertex, isRtl), value: `(${fmt(h, 2)}, ${fmt(k, 2)})`, emphasis: true },
          { label: pick(strings.vertexForm, isRtl), value: `${fmt(a, 1)}(x ${signed(-h, 2)})² ${signed(k, 2)}` },
          { label: pick(strings.discriminant, isRtl), value: fmt(disc, 2) },
          {
            label: pick(strings.verdict, isRtl),
            value: disc > 0 ? pick(strings.twoReal, isRtl) : Math.abs(disc) < 1e-9 ? pick(strings.oneReal, isRtl) : pick(strings.complex, isRtl),
          },
          { label: pick(strings.roots, isRtl), value: roots },
          ...(showLine
            ? [
                {
                  label: pick(strings.meets, isRtl),
                  value:
                    lineDisc > 0
                      ? isRtl
                        ? 'نقطتان'
                        : 'two points'
                      : Math.abs(lineDisc) < 1e-9
                        ? isRtl
                          ? 'نقطة واحدة (مماس)'
                          : 'one point (tangent)'
                        : isRtl
                          ? 'لا نقطة'
                          : 'no point',
                },
              ]
            : []),
        ]}
      />
    </div>
  );
}

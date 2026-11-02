/**
 * GMAT · the algebra the syllabus recycles. One figure, one readout per mode so
 * exponents, expressions, factoring, quadratics, functions, inequalities,
 * systems and algebraic fractions all get a picture rather than a rule sheet.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { MathPlot, Curve, Point, Region, Segment } from '../../viz/MathPlot';
import { Readout, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'The algebra changes; the picture does not. Read the picture, then write the line.',
    ar: 'الجبر يتغير أما الصورة فلا. اقرأ الصورة ثم اكتب السطر.',
  },
  base: { en: 'base a', ar: 'الأساس a' },
  exponent: { en: 'exponent m', ar: 'الأس m' },
  second: { en: 'second n', ar: 'الثاني n' },
  a: { en: 'a', ar: 'a' },
  b: { en: 'b', ar: 'b' },
  c: { en: 'c', ar: 'c' },
  x0: { en: 'evaluate at x', ar: 'احسب عند x' },
  slope: { en: 'slope', ar: 'الميل' },
  intercept: { en: 'intercept', ar: 'التقاطع' },
  product: { en: 'product', ar: 'حاصل الضرب' },
  quotient: { en: 'quotient', ar: 'خارج القسمة' },
  power: { en: 'power of a power', ar: 'قوة القوة' },
  roots: { en: 'roots', ar: 'الجذور' },
  vertex: { en: 'vertex', ar: 'القمة' },
  discriminant: { en: 'discriminant', ar: 'المميّز' },
  factored: { en: 'factored', ar: 'مُحلَّل' },
  value: { en: 'value', ar: 'القيمة' },
  composition: { en: 'f(g(x)) at x', ar: 'f(g(x)) عند x' },
  inside: { en: 'g first', ar: 'g أولاً' },
  boundary: { en: 'boundary', ar: 'الحد' },
  region: { en: 'region', ar: 'المنطقة' },
  lines: { en: 'the two lines', ar: 'الخطان' },
  meet: { en: 'intersection', ar: 'التقاطع' },
  hole: { en: 'hole at', ar: 'ثقب عند' },
  simplify: { en: 'simplified', ar: 'مبسّط' },
} satisfies Record<string, Bi>;

const frac = (numerator: number, denominator: number): string =>
  denominator === 0 ? 'undefined' : fmt(numerator / denominator, 3);

export default function ModelLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ a: 2, m: 3, n: 2, A: 1, B: -4, C: 3, x: 2, m1: 1, b1: -1, m2: -1, b2: 4 }, onInteract);
  const slug = lesson.id;

  /* --------------------------------------------------------- exponents */
  if (slug === 'exponents') {
    const a = Math.max(2, Math.round(values.a));
    const m = Math.max(0, Math.round(values.m));
    const n = Math.max(0, Math.round(values.n));
    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
        <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
          <MathPlot xDomain={[-1, 5]} yDomain={[0, Math.max(16, Math.pow(a, m + n))]} aspect={1.7} grid={false} ariaLabel={pick(strings.base, isRtl)}>
            <Curve fn={(x) => Math.pow(a, x)} color="var(--t-accent)" />
            <Point x={m} y={Math.pow(a, m)} r={4} label={`aᵐ`} />
            <Point x={n} y={Math.pow(a, n)} r={4} color="var(--t-sky)" label={`aⁿ`} />
            <Point x={m + n} y={Math.pow(a, m + n)} r={5} color="var(--t-sun)" label={`aᵐ⁺ⁿ`} />
          </MathPlot>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Slider label={strings.base} value={a} min={2} max={5} step={1} onChange={(value) => set('a', value)} format={(value) => fmt(value, 0)} />
          <Slider label={strings.exponent} value={m} min={0} max={5} step={1} onChange={(value) => set('m', value)} format={(value) => fmt(value, 0)} />
          <Slider label={strings.second} value={n} min={0} max={5} step={1} onChange={(value) => set('n', value)} format={(value) => fmt(value, 0)} />
        </div>
        <Readout
          dir="ltr"
          rows={[
            { label: 'aᵐ · aⁿ', value: `${fmt(Math.pow(a, m), 0)} · ${fmt(Math.pow(a, n), 0)} = ${fmt(Math.pow(a, m + n), 0)}`, emphasis: true },
            { label: 'aᵐ ÷ aⁿ', value: `${fmt(Math.pow(a, m), 0)} ÷ ${fmt(Math.pow(a, n), 0)} = ${fmt(a ** (m - n), 3)}` },
            { label: '(aᵐ)ⁿ', value: `${fmt(Math.pow(a, m), 0)}ⁿ = ${fmt(Math.pow(Math.pow(a, m), n), 0)}` },
          ]}
        />
      </div>
    );
  }

  /* -------------------------------------------------------- expressions */
  if (slug === 'expressions') {
    const A = values.A;
    const B = values.B;
    const x = values.x;
    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
        <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
          <MathPlot xDomain={[-6, 6]} yDomain={[-10, 10]} aspect={1.7} grid={false} ariaLabel={pick(strings.value, isRtl)}>
            <Curve fn={(t) => A * t + B} color="var(--t-accent)" />
            <Point x={x} y={A * x + B} r={5} label={`(${fmt(x, 1)}, ${fmt(A * x + B, 1)})`} />
          </MathPlot>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Slider label={strings.a} value={A} min={-3} max={3} step={0.5} onChange={(value) => set('A', value)} format={(value) => fmt(value, 1)} />
          <Slider label={strings.b} value={B} min={-8} max={8} step={1} onChange={(value) => set('B', value)} format={(value) => fmt(value, 0)} />
          <Slider label={strings.x0} value={x} min={-5} max={5} step={0.5} onChange={(value) => set('x', value)} format={(value) => fmt(value, 1)} />
        </div>
        <Readout
          dir="ltr"
          rows={[
            { label: pick(strings.slope, isRtl), value: fmt(A, 2) },
            { label: 'y-intercept', value: fmt(B, 2) },
            { label: 'A·x + B', value: `${fmt(A, 2)}·${fmt(x, 1)} + ${fmt(B, 2)} = ${fmt(A * x + B, 2)}`, emphasis: true },
          ]}
        />
      </div>
    );
  }

  /* ---------------------------------------------------------- factoring */
  if (slug === 'factoring') {
    const p = Math.round(values.m * 1); // reuse m as the first root
    const q = Math.round(values.n);
    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
        <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
          <MathPlot xDomain={[-6, 6]} yDomain={[-8, 12]} aspect={1.7} grid={false} ariaLabel={pick(strings.factored, isRtl)}>
            <Segment x1={-6} y1={0} x2={6} y2={0} color="var(--t-ink)" width={1} opacity={0.4} />
            <Curve fn={(x) => (x - p) * (x - q)} color="var(--t-accent)" />
            <Point x={p} y={0} r={5} label={`x = ${p}`} />
            <Point x={q} y={0} r={5} label={`x = ${q}`} color="var(--t-sky)" />
          </MathPlot>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Slider label={{ en: 'root p', ar: 'الجذر p' }} value={p} min={-5} max={5} step={1} onChange={(value) => set('m', value)} format={(value) => fmt(value, 0)} />
          <Slider label={{ en: 'root q', ar: 'الجذر q' }} value={q} min={-5} max={5} step={1} onChange={(value) => set('n', value)} format={(value) => fmt(value, 0)} />
        </div>
        <Readout
          dir="ltr"
          rows={[
            { label: pick(strings.factored, isRtl), value: `(x ${p >= 0 ? '−' : '+'} ${Math.abs(p)})(x ${q >= 0 ? '−' : '+'} ${Math.abs(q)})`, emphasis: true },
            { label: 'expand', value: `x² ${p + q >= 0 ? '+' : '−'} ${Math.abs(p + q)}x + ${p * q}` },
            { label: pick(strings.product, isRtl), value: `${p} · ${q} = ${p * q}` },
          ]}
        />
      </div>
    );
  }

  /* -------------------------------------------------------- quadratics */
  if (slug === 'quadratics') {
    const A = values.A === 0 ? 0.5 : values.A;
    const B = values.B;
    const C = values.C;
    const disc = B * B - 4 * A * C;
    const vertexX = -B / (2 * A);
    const vertexY = A * vertexX * vertexX + B * vertexX + C;
    const root = Math.sqrt(Math.max(0, disc));
    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
        <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
          <MathPlot xDomain={[-6, 6]} yDomain={[-8, 10]} aspect={1.7} grid={false} ariaLabel={pick(strings.roots, isRtl)}>
            <Segment x1={-6} y1={0} x2={6} y2={0} color="var(--t-ink)" width={1} opacity={0.4} />
            <Curve fn={(x) => A * x * x + B * x + C} color="var(--t-accent)" />
            <Point x={vertexX} y={vertexY} r={5} color="var(--t-sun)" label="vertex" />
            {disc >= 0 && (
              <>
                <Point x={(-B - root) / (2 * A)} y={0} r={4} color="var(--t-sky)" />
                <Point x={(-B + root) / (2 * A)} y={0} r={4} color="var(--t-sky)" />
              </>
            )}
          </MathPlot>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Slider label={strings.a} value={A} min={-2} max={2} step={0.25} onChange={(value) => set('A', value)} format={(value) => fmt(value, 2)} />
          <Slider label={strings.b} value={B} min={-8} max={8} step={1} onChange={(value) => set('B', value)} format={(value) => fmt(value, 0)} />
          <Slider label={strings.c} value={C} min={-8} max={8} step={1} onChange={(value) => set('C', value)} format={(value) => fmt(value, 0)} />
        </div>
        <Readout
          dir="ltr"
          rows={[
            { label: pick(strings.vertex, isRtl), value: `(${fmt(vertexX, 2)}, ${fmt(vertexY, 2)})` },
            { label: pick(strings.discriminant, isRtl), value: `${fmt(disc, 2)} → ${disc > 0 ? '2 real roots' : disc === 0 ? '1 real root' : 'no real roots'}`, emphasis: true },
            { label: pick(strings.roots, isRtl), value: disc >= 0 ? `${fmt((-B - root) / (2 * A), 2)}, ${fmt((-B + root) / (2 * A), 2)}` : '—' },
          ]}
        />
      </div>
    );
  }

  /* --------------------------------------------------------- functions */
  if (slug === 'functions') {
    const x = values.x;
    const g = (t: number) => 2 * t + 1;
    const f = (t: number) => t * t;
    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
        <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
          <MathPlot xDomain={[-4, 4]} yDomain={[-2, 16]} aspect={1.7} grid={false} ariaLabel={pick(strings.composition, isRtl)}>
            <Curve fn={f} color="var(--t-accent)" />
            <Curve fn={g} color="var(--t-sky)" />
            <Point x={x} y={g(x)} r={4} color="var(--t-sky)" label={`g(${fmt(x, 1)})`} />
            {/* f(g(x)) leaves the window for x > 2.9; park the dot at the top edge
                with the real value so it never disappears off-plot. */}
            {f(g(x)) <= 15.5 ? (
              <Point x={x} y={f(g(x))} r={5} color="var(--t-sun)" label={`f(g(${fmt(x, 1)}))`} />
            ) : (
              <>
                <Point x={x} y={15.4} r={5} color="var(--t-sun)" hollow label={`${fmt(f(g(x)), 0)} ↑`} />
                <Segment x1={x} y1={15.4} x2={x} y2={16} color="var(--t-sun)" width={2} opacity={0.5} />
              </>
            )}
          </MathPlot>
        </div>
        <Slider label={strings.x0} value={x} min={-3} max={3} step={0.5} onChange={(value) => set('x', value)} format={(value) => fmt(value, 1)} />
        <Readout
          dir="ltr"
          rows={[
            { label: 'g(x) = 2x + 1', value: fmt(g(x), 2) },
            { label: 'f(g(x)) = (2x + 1)²', value: fmt(f(g(x)), 2), emphasis: true },
            { label: 'f(x) = x²', value: fmt(f(x), 2) },
            { label: 'g(f(x)) = 2x² + 1', value: fmt(g(f(x)), 2) },
          ]}
        />
        <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">{pick(strings.inside, isRtl)}</p>
      </div>
    );
  }

  /* ------------------------------------------------------- inequalities */
  if (slug === 'inequalities') {
    const A = values.A;
    const B = values.B;
    const boundary = A === 0 ? 0 : -B / A;
    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
        <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
          <MathPlot xDomain={[-6, 6]} yDomain={[-6, 6]} aspect={1.4} ariaLabel={pick(strings.region, isRtl)}>
            <Region top={() => 6} bottom={(x) => A * x + B} from={-6} to={6} />
            <Curve fn={(x) => A * x + B} color="var(--t-accent)" />
            <Segment x1={boundary} y1={-6} x2={boundary} y2={6} color="var(--t-sun)" dash="5 4" opacity={0.9} />
          </MathPlot>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Slider label={{ en: 'coefficient a', ar: 'المعامل a' }} value={A} min={-3} max={3} step={0.5} onChange={(value) => set('A', value)} format={(value) => fmt(value, 1)} />
          <Slider label={strings.b} value={B} min={-6} max={6} step={1} onChange={(value) => set('B', value)} format={(value) => fmt(value, 0)} />
        </div>
        <Readout
          dir="ltr"
          rows={[
            { label: 'ax + b = 0', value: `${fmt(A, 1)}x ${B >= 0 ? '+' : '−'} ${Math.abs(B)} = 0` },
            { label: pick(strings.boundary, isRtl), value: fmt(boundary, 2), emphasis: true },
            { label: 'a < 0?', value: A < 0 ? (isRtl ? 'نعم — اقلب الإشارة عند القسمة' : 'yes — flip the sign when dividing') : isRtl ? 'لا — الإشارة كما هي' : 'no — sign unchanged' },
          ]}
        />
      </div>
    );
  }

  /* ----------------------------------------------------------- systems */
  if (slug === 'systems') {
    const { m1, b1, m2, b2 } = values;
    const parallel = m1 === m2 && b1 !== b2;
    const same = m1 === m2 && b1 === b2;
    const meetX = m1 === m2 ? 0 : (b2 - b1) / (m1 - m2);
    const meetY = m1 * meetX + b1;
    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
        <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
          <MathPlot xDomain={[-6, 6]} yDomain={[-6, 6]} aspect={1.4} ariaLabel={pick(strings.lines, isRtl)}>
            <Curve fn={(x) => m1 * x + b1} color="var(--t-accent)" />
            <Curve fn={(x) => m2 * x + b2} color="var(--t-sky)" />
            {!parallel && !same && <Point x={meetX} y={meetY} r={5} color="var(--t-sun)" label="solution" />}
          </MathPlot>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <Slider label={{ en: 'm₁', ar: 'm₁' }} value={m1} min={-3} max={3} step={0.5} onChange={(value) => set('m1', value)} format={(value) => fmt(value, 1)} />
          <Slider label={{ en: 'b₁', ar: 'b₁' }} value={b1} min={-4} max={4} step={1} onChange={(value) => set('b1', value)} format={(value) => fmt(value, 0)} />
          <Slider label={{ en: 'm₂', ar: 'm₂' }} value={m2} min={-3} max={3} step={0.5} onChange={(value) => set('m2', value)} format={(value) => fmt(value, 1)} />
          <Slider label={{ en: 'b₂', ar: 'b₂' }} value={b2} min={-4} max={4} step={1} onChange={(value) => set('b2', value)} format={(value) => fmt(value, 0)} />
        </div>
        <Readout
          dir="ltr"
          rows={[
            { label: pick(strings.meet, isRtl), value: same ? 'infinitely many' : parallel ? 'none (parallel)' : `(${fmt(meetX, 2)}, ${fmt(meetY, 2)})`, emphasis: true },
            { label: 'line 1', value: `y = ${fmt(m1, 1)}x ${b1 >= 0 ? '+' : '−'} ${Math.abs(b1)}` },
            { label: 'line 2', value: `y = ${fmt(m2, 1)}x ${b2 >= 0 ? '+' : '−'} ${Math.abs(b2)}` },
          ]}
        />
      </div>
    );
  }

  /* -------------------------------------------------- algebraic fractions */
  const A = values.A;
  const B = values.B;
  const hole = -B;
  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-6, 6]} yDomain={[-6, 6]} aspect={1.4} grid={false} ariaLabel={pick(strings.hole, isRtl)}>
          <Curve fn={(x) => x + B} color="var(--t-accent)" />
          <Point x={hole} y={0} r={5} hollow label={`x = ${fmt(hole, 1)}`} />
        </MathPlot>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.a} value={A} min={-4} max={4} step={1} onChange={(value) => set('A', value)} format={(value) => fmt(value, 0)} />
        <Slider label={strings.b} value={B} min={-4} max={4} step={1} onChange={(value) => set('B', value)} format={(value) => fmt(value, 0)} />
      </div>
      <Readout
        dir="ltr"
        rows={[
          { label: 'original', value: `(x² − ${fmt(hole * hole, 0)}) / (x ${hole >= 0 ? '−' : '+'} ${Math.abs(hole)})` },
          { label: pick(strings.simplify, isRtl), value: `x ${hole >= 0 ? '+' : '−'} ${Math.abs(hole)}`, emphasis: true },
          { label: pick(strings.hole, isRtl), value: `x = ${fmt(0 - hole === 0 ? 0 : hole, 1)} (${isRtl ? 'غير معرّف' : 'undefined'})` },
          { label: 'A/B sample', value: `${fmt(A, 0)} / ${fmt(B, 0)} = ${frac(A, B)}` },
        ]}
      />
    </div>
  );
}

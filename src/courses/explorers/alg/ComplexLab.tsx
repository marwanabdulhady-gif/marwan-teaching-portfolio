/**
 * Algebra 2 · 2.3 — the complex plane. Add and multiply two numbers as arrows,
 * and watch the powers of i cycle every four steps.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Multiplying by i is a quarter turn. That is why four multiplications bring every number home.',
    ar: 'الضرب في i هو ربع دورة. لذلك يعود كل عدد إلى مكانه بعد أربع عمليات ضرب.',
  },
  real1: { en: 'real part of z₁', ar: 'الجزء الحقيقي z₁' },
  imag1: { en: 'imaginary part of z₁', ar: 'الجزء التخيلي z₁' },
  real2: { en: 'real part of z₂', ar: 'الجزء الحقيقي z₂' },
  imag2: { en: 'imaginary part of z₂', ar: 'الجزء التخيلي z₂' },
  sum: { en: 'z₁ + z₂', ar: 'z₁ + z₂' },
  product: { en: 'z₁ · z₂', ar: 'z₁ · z₂' },
  powers: { en: 'powers of i', ar: 'قوى i' },
  modulus: { en: '|z₁|', ar: '|z₁|' },
} satisfies Record<string, Bi>;

export default function ComplexLab({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ a: 3, b: 2, c: 1, d: -1 }, onInteract);
  const { a, b, c, d } = values;

  const sumRe = a + c;
  const sumIm = b + d;
  const prodRe = a * c - b * d;
  const prodIm = a * d + b * c;
  const modulus = Math.hypot(a, b);
  const powers = ['i', '−1', '−i', '1'];

  const fmtComplex = (real: number, imag: number) =>
    `${fmt(real, 1)} ${imag >= 0 ? '+' : '−'} ${fmt(Math.abs(imag), 1)}i`;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-6, 6]} yDomain={[-6, 6]} aspect={1} ariaLabel={pick(strings.product, isRtl)}>
          <Segment x1={0} y1={0} x2={a} y2={b} color="var(--t-accent)" width={2.5} />
          <Segment x1={0} y1={0} x2={c} y2={d} color="var(--t-sky)" width={2.5} />
          <Segment x1={0} y1={0} x2={prodRe} y2={prodIm} color="var(--t-sun)" width={2.5} />
          <Point x={a} y={b} r={4} label="z₁" />
          <Point x={c} y={d} r={4} color="var(--t-sky)" label="z₂" />
          <Point x={prodRe} y={prodIm} r={4} color="var(--t-sun)" label="z₁z₂" />
        </MathPlot>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.real1} value={a} min={-5} max={5} step={0.5} onChange={(value) => set('a', value)} format={(value) => fmt(value, 1)} />
        <Slider label={strings.imag1} value={b} min={-5} max={5} step={0.5} onChange={(value) => set('b', value)} format={(value) => fmt(value, 1)} />
        <Slider label={strings.real2} value={c} min={-5} max={5} step={0.5} onChange={(value) => set('c', value)} format={(value) => fmt(value, 1)} />
        <Slider label={strings.imag2} value={d} min={-5} max={5} step={0.5} onChange={(value) => set('d', value)} format={(value) => fmt(value, 1)} />
      </div>

      <Readout
        dir="ltr"
        rows={[
          { label: 'z₁', value: fmtComplex(a, b) },
          { label: pick(strings.sum, isRtl), value: fmtComplex(sumRe, sumIm) },
          { label: pick(strings.product, isRtl), value: fmtComplex(prodRe, prodIm), emphasis: true },
          { label: pick(strings.modulus, isRtl), value: fmt(modulus, 2) },
          { label: pick(strings.powers, isRtl), value: powers.join(' · ') },
        ]}
      />
    </div>
  );
}

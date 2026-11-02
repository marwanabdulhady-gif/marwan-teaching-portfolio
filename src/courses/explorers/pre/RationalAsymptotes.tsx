/**
 * 3.3 · Rational functions and asymptotes.
 *
 * (x² + k)/(x − c): drag the forbidden value c and the numerator shift k. The
 * vertical asymptote follows c; the slanted asymptote appears once the degree
 * of the top is one more than the bottom.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Asymptote, Curve, MathPlot, Segment } from '../../viz/MathPlot';
import { Readout, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'The denominator forbids one value; the top decides how the far ends behave.',
    ar: 'المقام يمنع قيمة واحدة، والبسط يحدد سلوك الأطراف البعيدة.',
  },
  c: { en: 'forbidden x = c', ar: 'القيمة الممنوعة x = c' },
  k: { en: 'numerator k', ar: 'البسط k' },
  vertical: { en: 'vertical asymptote', ar: 'خط تقاربي رأسي' },
  slant: { en: 'slanted asymptote', ar: 'خط تقاربي مائل' },
  farLeft: { en: 'as x → −∞', ar: 'عندما x → −∞' },
  farRight: { en: 'as x → ∞', ar: 'عندما x → ∞' },
} satisfies Record<string, Bi>;

export default function RationalAsymptotes({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ c: 1, k: 1 }, onInteract);
  const c = values.c;
  const k = values.k;
  const f = (x: number) => (Math.abs(x - c) < 1e-6 ? NaN : (x * x + k) / (x - c));

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-8, 8]} yDomain={[-10, 10]} ariaLabel="(x² + k)/(x − c)">
          <Asymptote x={c} />
          <Segment x1={-8} y1={-8 - c} x2={8} y2={8 - c} color="var(--t-sky)" width={1.5} dash="6 5" opacity={0.75} />
          <Curve fn={f} width={3} />
        </MathPlot>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.c} value={c} min={-3} max={3} step={0.5} onChange={(value) => set('c', value)} format={(value) => fmt(value, 1)} />
        <Slider label={strings.k} value={k} min={-4} max={4} step={0.5} onChange={(value) => set('k', value)} format={(value) => fmt(value, 1)} />
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.vertical, isRtl), value: `x = ${fmt(c, 1)}`, emphasis: true },
          { label: pick(strings.slant, isRtl), value: `y = x + ${fmt(c, 1)}` },
          { label: pick(strings.farLeft, isRtl), value: '−∞' },
          { label: pick(strings.farRight, isRtl), value: '+∞' },
          { label: 'f(0)', value: fmt(f(0), 2) },
        ]}
      />
    </div>
  );
}

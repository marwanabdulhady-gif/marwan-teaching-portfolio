/**
 * Extension · Differentiability of piecewise functions.
 *
 * Two straight pieces meet at c. Match the slopes for differentiability; a
 * corner, a cusp or a vertical tangent each break it a different way.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, DragHandle, MathPlot, Segment } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Differentiable means the two one-sided slopes agree. A corner disagrees; a cusp disagrees infinitely.',
    ar: 'قابلية الاشتقاق تعني تساوي الميلين من الجهتين. الزاوية تختلف، والرأس يختلف بلا نهاية.',
  },
  preset: { en: 'preset', ar: 'اختيار جاهز' },
  leftSlope: { en: 'left slope', ar: 'الميل الأيسر' },
  rightSlope: { en: 'right slope', ar: 'الميل الأيمن' },
  breakpoint: { en: 'junction c', ar: 'نقطة الوصل c' },
  slopes: { en: 'one-sided slopes', ar: 'الميلان من الجهتين' },
  verdict: { en: 'differentiable?', ar: 'قابلة للاشتقاق؟' },
  yes: { en: 'yes ✓', ar: 'نعم ✓' },
  no: { en: 'no ✗ — corner', ar: 'لا ✗ — زاوية' },
  cusp: { en: 'no ✗ — cusp', ar: 'لا ✗ — رأس' },
  smooth: { en: 'smooth', ar: 'ملساء' },
} satisfies Record<string, Bi>;

type PresetId = 'corner' | 'smooth' | 'cusp';

export default function CornerTest({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ preset: 0, c: 0.5, left: -1, right: 1 }, onInteract);
  const preset = (['corner', 'smooth', 'cusp'] as const)[Math.round(values.preset)] ?? 'corner';
  const c = values.c;

  // A cusp: y = −|x − c| has slopes +1 / −1 meeting at a point.
  const leftSlope = preset === 'cusp' ? 1 : values.left;
  const rightSlope = preset === 'cusp' ? -1 : preset === 'smooth' ? values.left : values.right;
  const differs = Math.abs(leftSlope - rightSlope) > 1e-6;
  const vertical = Math.abs(leftSlope) > 6 || Math.abs(rightSlope) > 6;
  const verdict = !differs ? pick(strings.yes, isRtl) : vertical ? pick(strings.smooth, isRtl) : preset === 'cusp' ? pick(strings.cusp, isRtl) : pick(strings.no, isRtl);

  const f = (x: number) => (x < c ? leftSlope * (x - c) : rightSlope * (x - c));

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <SegmentedChoice
        label={strings.preset}
        value={preset}
        isRtl={isRtl}
        options={[
          { id: 'corner', label: { en: 'corner', ar: 'زاوية' } },
          { id: 'smooth', label: { en: 'smooth', ar: 'ملساء' } },
          { id: 'cusp', label: { en: 'cusp', ar: 'رأس' } },
        ]}
        onChange={(id) => set('preset', (['corner', 'smooth', 'cusp'] as const).indexOf(id))}
      />

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-3, 3]} yDomain={[-3, 3]} aspect={1} ariaLabel={pick(strings.breakpoint, isRtl)}>
          <Curve fn={f} width={3} />
          <Segment x1={c - 1.2} y1={leftSlope * -1.2} x2={c} y2={0} color="var(--t-accent)" dash="5 4" width={1.5} opacity={0.9} />
          <Segment x1={c} y1={0} x2={c + 1.2} y2={rightSlope * 1.2} color="var(--t-sky)" dash="5 4" width={1.5} opacity={0.9} />
          <DragHandle x={c} onChange={(value) => set('c', value)} min={-2} max={2} step={0.25} ariaLabel={pick(strings.breakpoint, isRtl)} py={16} />
        </MathPlot>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.leftSlope} value={values.left} min={-3} max={3} step={0.25} onChange={(value) => set('left', value)} format={(value) => fmt(value, 2)} />
        <Slider
          label={strings.rightSlope}
          value={values.right}
          min={-3}
          max={3}
          step={0.25}
          onChange={(value) => set('right', value)}
          format={(value) => fmt(value, 2)}
        />
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.slopes, isRtl), value: `${fmt(leftSlope, 2)} · ${fmt(rightSlope, 2)}` },
          { label: pick(strings.verdict, isRtl), value: verdict, emphasis: true },
        ]}
      />
    </div>
  );
}

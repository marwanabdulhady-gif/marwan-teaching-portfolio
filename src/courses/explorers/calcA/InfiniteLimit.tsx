/**
 * 1.5 · Infinite limits.
 *
 * Slide the distance d towards zero and watch the value run away. The sign is
 * decided by the side you approach from and by the power in the denominator.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Asymptote, Curve, MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'As the input gets close to the forbidden value, the output has no ceiling.',
    ar: 'كلما اقترب المدخل من القيمة الممنوعة، لم يعد للمخرج سقف.',
  },
  side: { en: 'approach from', ar: 'الاقتراب من' },
  distance: { en: 'distance d', ar: 'المسافة d' },
  power: { en: 'denominator', ar: 'المقام' },
  value: { en: 'f(x)', ar: 'f(x)' },
  verdict: { en: 'limit', ar: 'النهاية' },
  asymptote: { en: 'vertical asymptote', ar: 'خط تقاربي رأسي' },
  hole: { en: 'hole versus asymptote', ar: 'فتحة أم خط تقاربي' },
} satisfies Record<string, Bi>;

type SideId = 'left' | 'right';
type PowerId = 'square' | 'linear';

export default function InfiniteLimit({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ side: 0, d: 0.1, power: 0 }, onInteract);
  const side: SideId = values.side > 0.5 ? 'right' : 'left';
  const square = values.power < 0.5;
  const d = Math.max(0.002, values.d);
  const c = 2;
  const x = side === 'left' ? c - d : c + d;

  const f = (input: number) => {
    const gap = input - c;
    if (Math.abs(gap) < 1e-12) return NaN;
    return square ? 1 / (gap * gap) : 1 / gap;
  };

  const y = f(x);
  const verdict = square ? '+∞' : side === 'left' ? '−∞' : '+∞';
  // Auto-zoom, but never so far that the branch flattens into the axis: past
  // the cap the readout carries the number and the plot keeps its shape.
  const top = Math.min(24, Math.max(4, Math.abs(y) * 1.4));

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div className="grid gap-2 sm:grid-cols-2">
        <SegmentedChoice
          label={strings.side}
          value={side}
          isRtl={isRtl}
          options={[
            { id: 'left', label: { en: 'from the left', ar: 'من اليسار' } },
            { id: 'right', label: { en: 'from the right', ar: 'من اليمين' } },
          ]}
          onChange={(id) => set('side', id === 'left' ? 0 : 1)}
        />
        <SegmentedChoice
          label={strings.power}
          value={square ? 'square' : 'linear'}
          isRtl={isRtl}
          options={[
            { id: 'square', label: { en: '1/(x − c)²', ar: '1/(x − c)²' } },
            { id: 'linear', label: { en: '1/(x − c)', ar: '1/(x − c)' } },
          ]}
          onChange={(id) => set('power', id === 'square' ? 0 : 1)}
        />
      </div>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[c - 1.5, c + 1.5]} yDomain={square ? [-2, top] : [-top, top]} ariaLabel={pick(strings.asymptote, isRtl)}>
          <Asymptote x={c} />
          <Curve fn={f} width={3} />
          <Segment x1={x} y1={0} x2={x} y2={Math.max(-top, Math.min(top, y))} color="var(--t-ink)" dash="3 3" opacity={0.4} />
          <Point x={x} y={Math.max(-top, Math.min(top, y))} />
        </MathPlot>
      </div>

      <Slider label={strings.distance} value={values.d} min={0.002} max={1.5} step={0.002} onChange={(value) => set('d', value)} format={(value) => fmt(value, 3)} />

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: 'x', value: fmt(x, 4) },
          { label: pick(strings.value, isRtl), value: fmt(y, 2) },
          { label: pick(strings.verdict, isRtl), value: verdict, emphasis: true },
        ]}
      />
      <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">
        {pick(strings.hole, isRtl)}: {isRtl ? 'المقام الزوجي يعطي +∞ من الجهتين، والمقام الفردي ينقلب.' : 'an even power gives +∞ from both sides; an odd one flips sign.'}
      </p>
    </div>
  );
}

/**
 * 1.4 · Rational expressions.
 *
 * (x² − a²)/(x − a) is a line with one point missing. Move a: the hole slides
 * along the line and the cancelled factor changes with it.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, MathPlot, Point } from '../../viz/MathPlot';
import { Readout, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Cancel the common factor and the curve becomes the line y = x + a — with a single hole at x = a.',
    ar: 'اختصر العامل المشترك فيصبح المنحنى هو الخط y = x + a — مع فتحة واحدة عند x = a.',
  },
  a: { en: 'a', ar: 'a' },
  simplified: { en: 'simplified', ar: 'بعد الاختصار' },
  domain: { en: 'domain', ar: 'المجال' },
  limit: { en: 'limit at x = a', ar: 'النهاية عند x = a' },
  factor: { en: 'cancelled factor', ar: 'العامل المختصر' },
} satisfies Record<string, Bi>;

export default function RationalHole({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ a: 1 }, onInteract);
  const a = values.a;
  const f = (x: number) => (Math.abs(x - a) < 1e-9 ? NaN : (x * x - a * a) / (x - a));

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-6, 6]} yDomain={[-4, 8]} ariaLabel="(x² − a²)/(x − a)">
          <Curve fn={f} />
          <Point x={a} y={2 * a} hollow r={5} label={isRtl ? 'فتحة' : 'hole'} />
        </MathPlot>
      </div>

      <Slider label={strings.a} value={a} min={-4} max={4} step={0.5} onChange={(value) => set('a', value)} format={(value) => fmt(value, 1)} />

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.factor, isRtl), value: `(x ${a >= 0 ? '−' : '+'} ${fmt(Math.abs(a), 1)})` },
          { label: pick(strings.simplified, isRtl), value: `y = x ${a >= 0 ? '+' : '−'} ${fmt(Math.abs(a), 1)}`, emphasis: true },
          { label: pick(strings.domain, isRtl), value: `x ≠ ${fmt(a, 1)}` },
          { label: pick(strings.limit, isRtl), value: fmt(2 * a, 1) },
        ]}
      />
    </div>
  );
}

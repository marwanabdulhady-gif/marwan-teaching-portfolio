/**
 * 5.1 · Exponential and logarithmic functions.
 *
 * bˣ and log_b x are mirror images in y = x. Move the base: below 1 the curves
 * fall, above 1 they rise, and at 1 there is no curve at all.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, Slider, Toggle, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Plot (x, bˣ). Swapping the coordinates gives log_b x — the same curve seen on the other side of y = x.',
    ar: 'ارسم (x, bˣ). تبديل الإحداثيين يعطي log_b x — المنحنى نفسه على الجهة الأخرى من y = x.',
  },
  base: { en: 'base b', ar: 'الأساس b' },
  showLog: { en: 'show log_b x', ar: 'أظهر log_b x' },
  exp: { en: 'exponential', ar: 'الأسية' },
  log: { en: 'logarithm', ar: 'اللوغاريتم' },
  mirror: { en: 'reflection point', ar: 'النقطة المنعكسة' },
  invalid: { en: 'b must be positive and not 1', ar: 'يجب أن يكون b موجباً ولا يساوي ١' },
  anchor: { en: 'anchor point', ar: 'النقطة المرجعية' },
} satisfies Record<string, Bi>;

export default function ExpLogWorld({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ b: 2, show: 1 }, onInteract);
  const b = values.b;
  const show = values.show > 0.5;
  const valid = b > 0 && Math.abs(b - 1) > 0.02;

  const exp = (x: number) => (valid ? Math.pow(b, x) : NaN);
  const log = (x: number) => (valid && x > 0 ? Math.log(x) / Math.log(b) : NaN);

  return (
    <div className="space-y-2">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-4, 4]} yDomain={[-2, 6]} ariaLabel={`b = ${fmt(b, 2)}`}>
          <Segment x1={-4} y1={-4} x2={6} y2={6} color="var(--t-ink)" dash="5 5" opacity={0.25} />
          <Curve fn={exp} width={3} />
          {show && <Curve fn={log} color="var(--t-sky)" />}
          <Point x={0} y={1} r={4} label="(0, 1)" />
          {show && <Point x={1} y={0} r={4} color="var(--t-sky)" label="(1, 0)" />}
          <Point x={2} y={valid ? b * b : NaN} r={4} color="var(--t-sun)" />
          {show && <Point x={valid ? b * b : NaN} y={2} r={4} color="var(--t-sun)" />}
        </MathPlot>
      </div>

      <Slider label={strings.base} value={b} min={0.2} max={4} step={0.1} onChange={(value) => set('b', value)} format={(value) => fmt(value, 1)} />
      <Toggle label={strings.showLog} checked={show} isRtl={isRtl} onChange={(checked) => set('show', checked ? 1 : 0)} />

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={
          valid
            ? [
                { label: pick(strings.exp, isRtl), value: `y = ${fmt(b, 1)}ˣ`, emphasis: true },
                { label: pick(strings.log, isRtl), value: `y = log${fmt(b, 1)} x` },
                { label: pick(strings.anchor, isRtl), value: b < 1 ? (isRtl ? 'تناقص' : 'decreasing') : isRtl ? 'تزايد' : 'increasing' },
              ]
            : [{ label: 'b', value: pick(strings.invalid, isRtl) }]
        }
      />
    </div>
  );
}

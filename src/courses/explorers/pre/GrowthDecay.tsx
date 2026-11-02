/**
 * 4.x · Exponential growth and decay.
 *
 * y = P·e^(kt): drag the time and the rate. Double the time is marked, so
 * "how long until it doubles" is a reading, not a formula to memorise.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, DragHandle, MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'A positive k multiplies the quantity every unit of time; a negative k shrinks it by the same proportion.',
    ar: 'k الموجب يضاعف الكمية كل وحدة زمن، و k السالب ينقصها بالنسبة نفسها.',
  },
  t: { en: 'time t', ar: 'الزمن t' },
  k: { en: 'rate k', ar: 'المعدل k' },
  start: { en: 'start P', ar: 'البداية P' },
  amount: { en: 'amount at t', ar: 'الكمية عند t' },
  doubling: { en: 'doubling time', ar: 'زمن التضاعف' },
  halving: { en: 'half-life', ar: 'عمر النصف' },
  percent: { en: 'change per unit', ar: 'التغير لكل وحدة' },
} satisfies Record<string, Bi>;

export default function GrowthDecay({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ P: 10, k: 0.4, t: 2 }, onInteract);
  const { P, k, t } = values;
  const y = (time: number) => P * Math.exp(k * time);
  const anchor = k === 0 ? null : Math.log(2) / Math.abs(k);

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[0, 8]} yDomain={[0, 60]} ariaLabel={`y = ${fmt(P, 1)} e^(${fmt(k, 2)}t)`}>
          <Curve fn={y} width={3} />
          {anchor !== null && anchor <= 8 && (
            <>
              <Segment x1={anchor} y1={0} x2={anchor} y2={k > 0 ? 2 * P : P / 2} color="var(--t-sky)" dash="4 4" opacity={0.8} />
              <Point x={anchor} y={k > 0 ? 2 * P : P / 2} color="var(--t-sky)" r={4} />
            </>
          )}
          <Segment x1={t} y1={0} x2={t} y2={y(t)} color="var(--t-ink)" dash="3 3" opacity={0.4} />
          <Point x={t} y={y(t)} />
          <DragHandle x={t} onChange={(value) => set('t', value)} min={0} max={8} step={0.1} ariaLabel={pick(strings.t, isRtl)} py={16} />
        </MathPlot>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label={strings.start} value={P} min={1} max={30} step={1} onChange={(value) => set('P', value)} format={(value) => fmt(value, 0)} />
        <Slider label={strings.k} value={k} min={-0.8} max={0.8} step={0.05} onChange={(value) => set('k', value)} format={(value) => fmt(value, 2)} />
        <Slider label={strings.t} value={t} min={0} max={8} step={0.1} onChange={(value) => set('t', value)} format={(value) => fmt(value, 1)} />
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.amount, isRtl), value: fmt(y(t), 2), emphasis: true },
          { label: pick(strings.percent, isRtl), value: `${fmt((Math.exp(k) - 1) * 100, 1)}%` },
          anchor !== null
            ? { label: pick(k > 0 ? strings.doubling : strings.halving, isRtl), value: `t = ${fmt(anchor, 2)}` }
            : { label: pick(strings.doubling, isRtl), value: '—' },
        ]}
      />
    </div>
  );
}

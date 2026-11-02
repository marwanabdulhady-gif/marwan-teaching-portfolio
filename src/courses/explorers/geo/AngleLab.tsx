/**
 * Geometry · 1.2 — one angle slider drives every angle pair: complementary,
 * supplementary, vertical, and the pairs a transversal makes.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { MathPlot, Segment } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Two lines crossing make four angles. Opposite ones are equal; neighbours add to 180°.',
    ar: 'الخطان المتقاطعان يصنعان أربع زوايا. المتقابلة متساوية، والمتجاورة مجموعها ١٨٠°.',
  },
  angle: { en: 'angle θ', ar: 'الزاوية θ' },
  mode: { en: 'what to show', ar: 'ما نعرضه' },
  vertical: { en: 'vertical pair', ar: 'الزوج المتقابل' },
  linear: { en: 'linear pair', ar: 'الزوج الخطي' },
  transversal: { en: 'parallel lines + transversal', ar: 'متوازيان وقاطعة' },
  complementary: { en: 'complement of θ', ar: 'متممة θ' },
  supplementary: { en: 'supplement of θ', ar: 'مكملة θ' },
  equal: { en: 'equal to θ', ar: 'تساوي θ' },
  corresponding: { en: 'corresponding angle', ar: 'الزاوية المتناظرة' },
  alternate: { en: 'alternate interior', ar: 'المتبادلة الداخلية' },
} satisfies Record<string, Bi>;

type Mode = 'pairs' | 'transversal';

const DOMAIN: [number, number] = [-8, 8];

export default function AngleLab({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ theta: 55, mode: 0 }, onInteract);
  const theta = values.theta;
  const mode: Mode = values.mode > 0.5 ? 'transversal' : 'pairs';
  const rad = (theta * Math.PI) / 180;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <SegmentedChoice
        label={strings.mode}
        value={mode}
        isRtl={isRtl}
        options={[
          { id: 'pairs', label: { en: 'intersecting lines', ar: 'خطان متقاطعان' } },
          { id: 'transversal', label: { en: 'transversal', ar: 'قاطعة' } },
        ]}
        onChange={(id) => set('mode', id === 'transversal' ? 1 : 0)}
      />

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={DOMAIN} yDomain={DOMAIN} aspect={1} grid={false} ariaLabel={pick(strings.angle, isRtl)}>
          {mode === 'pairs' ? (
            <>
              <Segment x1={-6} y1={-6} x2={6} y2={6} color="var(--t-ink)" width={2} opacity={0.6} />
              <Segment x1={-6} y1={6} x2={6} y2={-6} color="var(--t-ink)" width={2} opacity={0.6} />
              <circle cx={200} cy={200} r={40} fill="none" stroke="var(--t-accent)" strokeWidth={3} strokeDasharray={`${(theta / 360) * 2 * Math.PI * 40} ${2 * Math.PI * 40}`} transform="rotate(-45 200 200)" />
              <circle cx={200} cy={200} r={56} fill="none" stroke="var(--t-sun)" strokeWidth={2.5} strokeDasharray={`${(theta / 360) * 2 * Math.PI * 56} ${2 * Math.PI * 56}`} transform="rotate(135 200 200)" />
              <circle cx={200} cy={200} r={72} fill="none" stroke="var(--t-sky)" strokeWidth={2.5} strokeDasharray={`${(theta / 360) * 2 * Math.PI * 72} ${2 * Math.PI * 72}`} transform="rotate(225 200 200)" />
              <text x={200} y={200} textAnchor="middle" fontSize={11} fill="var(--t-ink)" fontFamily="ui-monospace, monospace">
                {fmt(theta, 0)}°
              </text>
            </>
          ) : (
            <>
              <Segment x1={0} y1={140} x2={400} y2={140} color="var(--t-ink)" width={2} opacity={0.55} />
              <Segment x1={0} y1={260} x2={400} y2={260} color="var(--t-ink)" width={2} opacity={0.55} />
              <Segment
                x1={200 - 260 * Math.cos(rad)}
                y1={260 + 260 * Math.sin(rad)}
                x2={200 + 260 * Math.cos(rad)}
                y2={140 - 260 * Math.sin(rad)}
                color="var(--t-accent)"
                width={2.5}
              />
              <circle cx={200} cy={260} r={4} fill="var(--t-sun)" />
              <circle cx={200} cy={140} r={4} fill="var(--t-sun)" />
              <text x={252} y={252} fontSize={11} fill="var(--t-accent-deep)" fontFamily="ui-monospace, monospace">
                {fmt(theta, 0)}°
              </text>
              <text x={252} y={132} fontSize={11} fill="var(--t-sky)" fontFamily="ui-monospace, monospace">
                {fmt(theta, 0)}°
              </text>
            </>
          )}
        </MathPlot>
      </div>

      <Slider label={strings.angle} value={theta} min={10} max={170} step={1} onChange={(value) => set('theta', value)} format={(value) => `${fmt(value, 0)}°`} />

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={
          mode === 'pairs'
            ? [
                { label: 'θ', value: `${fmt(theta, 0)}°`, emphasis: true },
                { label: pick(strings.vertical, isRtl), value: `${fmt(theta, 0)}°` },
                { label: pick(strings.linear, isRtl), value: `${fmt(180 - theta, 0)}°` },
                { label: pick(strings.complementary, isRtl), value: `${fmt(Math.max(0, 90 - theta), 0)}°` },
              ]
            : [
                { label: pick(strings.corresponding, isRtl), value: `${fmt(theta, 0)}°`, emphasis: true },
                { label: pick(strings.alternate, isRtl), value: `${fmt(theta, 0)}°` },
                { label: 'co-interior', value: `${fmt(180 - theta, 0)}°` },
              ]
        }
      />
    </div>
  );
}

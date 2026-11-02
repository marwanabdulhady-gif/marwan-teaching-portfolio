/**
 * Geometry · 3.1 and 3.3 — an inscribed angle is half its arc; a sector is a
 * fraction of the whole circle. One angle slider drives both.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'The central angle measures the arc; an inscribed angle standing on the same arc is exactly half of it.',
    ar: 'الزاوية المركزية تقيس القوس، والزاوية المحيطية على القوس نفسه تساوي نصفها تماماً.',
  },
  mode: { en: 'focus', ar: 'التركيز' },
  arc: { en: 'arc angle θ', ar: 'زاوية القوس θ' },
  radius: { en: 'radius r', ar: 'نصف القطر r' },
  inscribed: { en: 'inscribed angle', ar: 'الزاوية المحيطية' },
  central: { en: 'central angle', ar: 'الزاوية المركزية' },
  arcLength: { en: 'arc length', ar: 'طول القوس' },
  sector: { en: 'sector area', ar: 'مساحة القطاع' },
  semicircle: { en: 'angle in a semicircle', ar: 'الزاوية في نصف الدائرة' },
  fraction: { en: 'fraction of the circle', ar: 'نسبة من الدائرة' },
} satisfies Record<string, Bi>;

export default function CircleLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ theta: 80, r: 4, mode: 0 }, onInteract);
  const sector = lesson.id === '3-3';
  const theta = values.theta;
  const r = values.r;
  const rad = (theta * Math.PI) / 180;
  const arcLength = r * rad;
  const sectorArea = 0.5 * r * r * rad;

  // MathPlot draws 400 px across an 8-unit domain, so one unit is 50 px.
  const scale = 50;
  const cx = 200;
  const cy = 200;
  const radiusPx = r * scale;

  const onCircle = (angleDeg: number): [number, number] => [Math.cos((angleDeg * Math.PI) / 180) * r, Math.sin((angleDeg * Math.PI) / 180) * r];
  const arcStart = onCircle(0);
  const arcEnd = onCircle(theta);
  const apex = onCircle(theta + 55);
  const largeArc = theta > 180 ? 1 : 0;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-4, 4]} yDomain={[-4, 4]} aspect={1} grid={false} ariaLabel={pick(strings.central, isRtl)}>
          <circle cx={cx} cy={cy} r={radiusPx} fill="none" stroke="var(--t-ink)" strokeOpacity={0.35} strokeWidth={2} />
          {sector && <path d={`M${cx},${cy} L${cx + arcStart[0] * scale},${cy - arcStart[1] * scale} A${radiusPx},${radiusPx} 0 ${largeArc} 0 ${cx + arcEnd[0] * scale},${cy - arcEnd[1] * scale} Z`} fill="var(--t-accent)" fillOpacity={0.18} />}
          <path
            d={`M${cx + arcStart[0] * scale},${cy - arcStart[1] * scale} A${radiusPx},${radiusPx} 0 ${largeArc} 0 ${cx + arcEnd[0] * scale},${cy - arcEnd[1] * scale}`}
            fill="none"
            stroke="var(--t-accent)"
            strokeWidth={5}
            strokeLinecap="round"
          />
          <Segment x1={0} y1={0} x2={arcStart[0]} y2={arcStart[1]} color="var(--t-ink)" width={1.5} opacity={0.5} />
          <Segment x1={0} y1={0} x2={arcEnd[0]} y2={arcEnd[1]} color="var(--t-ink)" width={1.5} opacity={0.5} />
          {!sector && (
            <>
              <Segment x1={apex[0]} y1={apex[1]} x2={arcStart[0]} y2={arcStart[1]} color="var(--t-sky)" width={2} />
              <Segment x1={apex[0]} y1={apex[1]} x2={arcEnd[0]} y2={arcEnd[1]} color="var(--t-sky)" width={2} />
              <Point x={apex[0]} y={apex[1]} r={4} color="var(--t-sky)" label="P" />
            </>
          )}
          <Point x={0} y={0} r={3.5} color="var(--t-ink)" />
          <Point x={arcStart[0]} y={arcStart[1]} r={3.5} color="var(--t-accent)" />
          <Point x={arcEnd[0]} y={arcEnd[1]} r={3.5} color="var(--t-accent)" />
        </MathPlot>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.arc} value={theta} min={10} max={350} step={5} onChange={(value) => set('theta', value)} format={(value) => `${fmt(value, 0)}°`} />
        <Slider label={strings.radius} value={r} min={1} max={3.8} step={0.1} onChange={(value) => set('r', value)} format={(value) => fmt(value, 2)} />
      </div>

      <Readout
        dir="ltr"
        rows={[
          { label: pick(strings.central, isRtl), value: `${fmt(theta, 0)}°`, emphasis: true },
          { label: pick(strings.inscribed, isRtl), value: `${fmt(theta / 2, 0)}°` },
          { label: pick(strings.arcLength, isRtl), value: `${fmt(arcLength, 2)} (${fmt(theta / 360, 2)} · 2πr)` },
          { label: pick(strings.sector, isRtl), value: `${fmt(sectorArea, 2)} (${fmt(theta / 360, 2)} · πr²)` },
        ]}
      />
      <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
        {pick(strings.semicircle, isRtl)}: {isRtl ? 'عندما يصبح القوس ١٨٠° تكون الزاوية المحيطية ٩٠°.' : 'at θ = 180° the inscribed angle is 90°.'}
      </p>
    </div>
  );
}

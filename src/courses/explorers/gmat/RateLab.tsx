/**
 * GMAT · rate topics.
 *   rates-work  — two workers, add the rates, watch the tank fill.
 *   word-problems — d = rt with the two vehicles meeting or apart.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';
import { Bar } from './parts';

const strings = {
  what: {
    en: 'Add rates, not times. The tank shows the fraction finished; the clock shows when they meet.',
    ar: 'اجمع المعدلات لا الأزمنة. الخزان يبيّن الجزء المنجز والساعة تبيّن وقت الالتقاء.',
  },
  rateA: { en: 'worker A (hours)', ar: 'العامل A (ساعات)' },
  rateB: { en: 'worker B (hours)', ar: 'العامل B (ساعات)' },
  alone: { en: 'alone', ar: 'منفرداً' },
  together: { en: 'together', ar: 'معاً' },
  inOneHour: { en: 'done in 1 hour', ar: 'المنجز في ساعة' },
  speed: { en: 'speed (km/h)', ar: 'السرعة (كم/س)' },
  time: { en: 'time (h)', ar: 'الزمن (س)' },
  distance: { en: 'distance covered', ar: 'المسافة المقطوعة' },
  headStart: { en: 'slow car starts first (h)', ar: 'السيارة الأبطأ تبدأ أولاً (س)' },
  catch: { en: 'catch-up time', ar: 'زمن اللحاق' },
  never: { en: 'never at these speeds', ar: 'لا يلحق بهذه السرعات' },
} satisfies Record<string, Bi>;

const DOMAIN_X: [number, number] = [0, 10];
const DOMAIN_Y: [number, number] = [0, 10];

export default function RateLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ a: 4, b: 6, v1: 40, v2: 60, lead: 0.5, t: 3 }, onInteract);

  if (lesson.id === 'word-problems') {
    const slow = Math.min(values.v1, values.v2);
    const fast = Math.max(values.v1, values.v2);
    const lead = values.lead;
    const gap = slow * lead;
    const catchTime = fast > slow ? gap / (fast - slow) : Infinity;
    const t = values.t;

    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
        <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
          <MathPlot xDomain={DOMAIN_X} yDomain={DOMAIN_Y} aspect={2} grid={false} ariaLabel={pick(strings.distance, isRtl)}>
            <Segment x1={0} y1={7} x2={10} y2={7} color="var(--t-ink)" width={2} opacity={0.4} />
            <Segment x1={0} y1={3} x2={10} y2={3} color="var(--t-ink)" width={2} opacity={0.4} />
            <Point x={Math.min(10, slow * (t + lead))} y={7} r={5} label="A" color="var(--t-sky)" />
            <Point x={Math.min(10, fast * t)} y={3} r={5} label="B" color="var(--t-accent)" />
          </MathPlot>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Slider label={strings.speed} value={values.v1} min={10} max={100} step={5} onChange={(v) => set('v1', v)} format={(v) => fmt(v, 0)} />
          <Slider label={{ en: 'other speed (km/h)', ar: 'السرعة الأخرى (كم/س)' }} value={values.v2} min={10} max={100} step={5} onChange={(v) => set('v2', v)} format={(v) => fmt(v, 0)} />
          <Slider label={strings.headStart} value={lead} min={0} max={3} step={0.25} onChange={(v) => set('lead', v)} format={(v) => fmt(v, 2)} />
        </div>
        <Slider label={strings.time} value={values.t} min={0} max={8} step={0.25} onChange={(v) => set('t', v)} format={(v) => `${fmt(v, 2)} h`} />
        <Readout
          dir="ltr"
          rows={[
            { label: 'slow', value: `d = ${fmt(slow, 0)} · ${fmt(t + lead, 2)} = ${fmt(slow * (t + lead), 1)} km` },
            { label: 'fast', value: `d = ${fmt(fast, 0)} · ${fmt(t, 2)} = ${fmt(fast * t, 1)} km` },
            {
              label: pick(strings.catch, isRtl),
              value: Number.isFinite(catchTime) ? `gap ${fmt(gap, 1)} ÷ ${fmt(fast - slow, 0)} = ${fmt(catchTime, 2)} h` : pick(strings.never, isRtl),
              emphasis: true,
            },
          ]}
        />
      </div>
    );
  }

  const a = Math.max(0.5, values.a);
  const b = Math.max(0.5, values.b);
  const together = 1 / (1 / a + 1 / b);
  const percentA = (1 / a) * 100;
  const percentB = (1 / b) * 100;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
      <div className="space-y-2">
        <Bar label={`A ${pick(strings.alone, isRtl)} ${fmt(a, 1)} h`} caption={`${fmt(percentA, 1)}%`} fill={percentA / 100} />
        <Bar label={`B ${pick(strings.alone, isRtl)} ${fmt(b, 1)} h`} caption={`${fmt(percentB, 1)}%`} fill={percentB / 100} tone="var(--t-sky)" />
        <Bar
          label={pick(strings.inOneHour, isRtl)}
          caption={`${fmt(percentA + percentB, 1)}%`}
          fill={(percentA + percentB) / 100}
          tone="var(--t-sun)"
          height={26}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.rateA} value={a} min={1} max={12} step={0.5} onChange={(v) => set('a', v)} format={(v) => fmt(v, 1)} />
        <Slider label={strings.rateB} value={b} min={1} max={12} step={0.5} onChange={(v) => set('b', v)} format={(v) => fmt(v, 1)} />
      </div>
      <Readout
        dir="ltr"
        rows={[
          { label: '1/a + 1/b', value: `${fmt(1 / a, 3)} + ${fmt(1 / b, 3)} = ${fmt(1 / a + 1 / b, 3)}` },
          { label: pick(strings.together, isRtl), value: `${fmt(together, 2)} h`, emphasis: true },
          { label: 'half of the faster', value: `${fmt(Math.min(a, b) / 2, 2)} h — ${isRtl ? 'الزمن المشترك أكبر دائماً' : 'the pair is always slower than this'}` },
        ]}
      />
    </div>
  );
}

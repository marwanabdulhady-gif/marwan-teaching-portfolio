/**
 * 2.6 · Related rates.
 *
 * A 10 m ladder slides down a wall. Push the foot at dx/dt and read the
 * rising/falling rate of the top: dy/dt = −(x/y)·dx/dt.
 *
 * Nothing animates on its own: the play button starts paused.
 */
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'The ladder length never changes, so x² + y² = 100 links the two speeds.',
    ar: 'طول السلّم لا يتغير، لذا يربط x² + y² = 100 السرعتين.',
  },
  foot: { en: 'foot position x', ar: 'موضع القدم x' },
  speed: { en: 'dx/dt', ar: 'dx/dt' },
  play: { en: 'Play', ar: 'تشغيل' },
  pause: { en: 'Pause', ar: 'إيقاف' },
  reset: { en: 'Reset', ar: 'إعادة' },
  relation: { en: 'relation', ar: 'العلاقة' },
  top: { en: 'top of the ladder', ar: 'أعلى السلّم' },
  rising: { en: 'dy/dt', ar: 'dy/dt' },
  reads: { en: 'position', ar: 'الموضع' },
} satisfies Record<string, Bi>;

const LENGTH = 10;

export default function RelatedRates({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const reduced = useReducedMotion();
  const [values, set, touched] = useExplorerState({ x: 6, speed: 1 }, onInteract);
  const [playing, setPlaying] = useState(false);
  const xRef = useRef(values.x);

  useEffect(() => {
    xRef.current = values.x;
  }, [values.x]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const next = xRef.current + values.speed * dt * 0.8;
      if (next >= LENGTH - 0.2) {
        set('x', LENGTH - 0.2);
        setPlaying(false);
        return;
      }
      set('x', next);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [playing, values.speed, set]);

  const x = Math.min(LENGTH - 0.2, Math.max(0.2, values.x));
  const y = Math.sqrt(LENGTH * LENGTH - x * x);
  const dydt = -(x / y) * values.speed;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[0, 12]} yDomain={[0, 12]} aspect={1} ariaLabel="ladder">
          <Segment x1={0} y1={0} x2={12} y2={0} color="var(--t-ink)" width={2} opacity={0.3} />
          <Segment x1={0} y1={0} x2={0} y2={12} color="var(--t-ink)" width={2} opacity={0.3} />
          <Segment x1={0} y1={y} x2={x} y2={0} color="var(--t-accent)" width={4} />
          <Segment x1={0} y1={0} x2={x} y2={0} color="var(--t-sky)" width={3} dash="4 3" />
          <Segment x1={0} y1={0} x2={0} y2={y} color="var(--t-sun)" width={3} dash="4 3" />
          <Point x={x} y={0} r={5} color="var(--t-sky)" label={`x = ${fmt(x, 1)}`} />
          <Point x={0} y={y} r={5} color="var(--t-sun)" label={`y = ${fmt(y, 1)}`} />
        </MathPlot>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.foot} value={values.x} min={0.2} max={LENGTH - 0.2} step={0.1} onChange={(value) => set('x', value)} format={(value) => fmt(value, 2)} />
        <Slider label={strings.speed} value={values.speed} min={0.2} max={3} step={0.1} onChange={(value) => set('speed', value)} format={(value) => fmt(value, 2)} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setPlaying((current) => !current)} className="teach-btn teach-btn-primary border-0">
          {pick(playing ? strings.pause : strings.play, isRtl)}
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            set('x', 6);
          }}
          className="teach-btn teach-btn-secondary"
        >
          {pick(strings.reset, isRtl)}
        </button>
        {reduced && <span className="self-center text-[0.68rem] text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">{isRtl ? 'الحركة معطّلة حسب إعدادك.' : 'Motion is reduced in your settings.'}</span>}
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.reads, isRtl), value: `x = ${fmt(x, 2)} · y = ${fmt(y, 2)}` },
          { label: pick(strings.relation, isRtl), value: 'x² + y² = 100' },
          { label: pick(strings.rising, isRtl), value: `−(${fmt(x, 1)}/${fmt(y, 1)})·${fmt(values.speed, 1)} = ${fmt(dydt, 2)}`, emphasis: true },
        ]}
      />
      {!touched && (
        <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
          {isRtl ? 'حرّك موضع القدم أو اضغط تشغيل.' : 'Drag the foot position or press play.'}
        </p>
      )}
    </div>
  );
}

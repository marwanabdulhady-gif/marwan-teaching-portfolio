/**
 * GMAT · number-line topics.
 *   absolute-value / number-line — distance, midpoint, absolute-value rings
 *   integers / parity          — factors against multiples, and the parity grid
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { MathPlot, Point, PointHandle } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Distance is never negative. |x − a| < r is the open stretch of the line inside the circle.',
    ar: 'المسافة لا تكون سالبة. |x − a| < r هي المقطع المفتوح داخل الدائرة.',
  },
  intsWhat: {
    en: 'Factors are finite and paired; multiples run on for ever. The grid shows which numbers are which.',
    ar: 'العوامل محدودة ومتزاوجة، والمضاعفات لا تنتهي. الشبكة تبيّن أيّ الأعداد أيّها.',
  },
  pointA: { en: 'point a', ar: 'النقطة a' },
  pointB: { en: 'point b', ar: 'النقطة b' },
  radius: { en: 'tolerance r', ar: 'الهامش r' },
  distance: { en: 'distance |a − b|', ar: 'المسافة |a − b|' },
  midpoint: { en: 'midpoint', ar: 'المنتصف' },
  interval: { en: '|x − a| < r', ar: '|x − a| < r' },
  integers: { en: 'integers between', ar: 'الأعداد الصحيحة بين' },
  mode: { en: 'what to show', ar: 'ما نعرضه' },
  factors: { en: 'factors', ar: 'عوامل' },
  multiples: { en: 'multiples', ar: 'مضاعفات' },
  parity: { en: 'parity grid', ar: 'شبكة الزوجية' },
  number: { en: 'number n', ar: 'العدد n' },
  total: { en: 'factors found', ar: 'عدد العوامل' },
} satisfies Record<string, Bi>;

const DOMAIN: [number, number] = [-10, 10];
type Mode = 'factors' | 'multiples' | 'parity';

export default function NumberLineLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const numeric = lesson.id === 'absolute-value' || lesson.id === 'number-line';
  const [values, set] = useExplorerState({ a: -2, b: 4, r: 3, n: 24, mode: 0 }, onInteract);

  if (!numeric) {
    const n = Math.max(1, Math.round(values.n));
    const mode: Mode = (['factors', 'multiples', 'parity'] as const)[Math.round(values.mode)] ?? 'factors';
    const factors = Array.from({ length: n }, (_, index) => index + 1).filter((d) => n % d === 0);
    const multiples = [1, 2, 3, 4, 5].map((k) => n * k);

    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.intsWhat, isRtl)}</p>
        <SegmentedChoice
          label={strings.mode}
          value={mode}
          isRtl={isRtl}
          options={[
            { id: 'factors', label: strings.factors },
            { id: 'multiples', label: strings.multiples },
            { id: 'parity', label: strings.parity },
          ]}
          onChange={(id) => {
            onInteract();
            set('mode', (['factors', 'multiples', 'parity'] as const).indexOf(id));
          }}
        />

        {mode === 'parity' ? (
          <div dir="ltr" className="grid grid-cols-3 gap-1.5 rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] p-3">
            <span />
            {['+', '−', '×'].map((op) => (
              <span key={op} className="text-center font-mono text-[0.7rem] font-bold text-[color-mix(in_srgb,var(--t-ink)_60%,transparent)]">
                {op}
              </span>
            ))}
            {(['even', 'odd'] as const).map((row) => (
              <div key={row} className="contents">
                <span className="self-center text-center font-mono text-[0.7rem] font-bold text-[color-mix(in_srgb,var(--t-ink)_60%,transparent)]">{row}</span>
                {(['even', 'odd'] as const).map((col) => {
                  const result =
                    row === 'even' && col === 'even'
                      ? ['even', 'even', 'even']
                      : row === 'odd' && col === 'odd'
                        ? ['even', 'even', 'odd']
                        : ['odd', 'odd', 'even'];
                  return (
                    <span
                      key={col}
                      className="rounded-lg border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] py-1.5 text-center font-mono text-[0.7rem] text-[var(--t-ink)]"
                    >
                      {result.join(' / ')}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
              <MathPlot xDomain={[0, Math.max(30, ...(mode === 'multiples' ? multiples : factors))]} yDomain={[0, 1]} aspect={6} grid={false} ariaLabel={pick(mode === 'factors' ? strings.factors : strings.multiples, isRtl)}>
                {(mode === 'factors' ? factors : multiples).map((value) => (
                  <Point key={value} x={value} y={0.5} r={5} color={mode === 'factors' ? 'var(--t-accent)' : 'var(--t-sky)'} label={`${value}`} />
                ))}
              </MathPlot>
            </div>
            <Readout
              dir="ltr"
              rows={
                mode === 'factors'
                  ? [
                      { label: 'n', value: `${n}` },
                      { label: pick(strings.factors, isRtl), value: factors.join(', ') },
                      { label: pick(strings.total, isRtl), value: `${factors.length}${factors.length % 2 === 1 ? ' (a perfect square)' : ''}`, emphasis: true },
                    ]
                  : [
                      { label: 'n', value: `${n}` },
                      { label: pick(strings.multiples, isRtl), value: multiples.join(', ') },
                      { label: 'pattern', value: `${isRtl ? 'نضيف' : 'add'} ${n} ${isRtl ? 'كل مرة' : 'each time'}`, emphasis: true },
                    ]
              }
            />
          </>
        )}
        <Slider label={strings.number} value={n} min={2} max={60} step={1} onChange={(value) => set('n', value)} format={(value) => fmt(value, 0)} />
      </div>
    );
  }

  const a = values.a;
  const b = values.b;
  const r = Math.abs(values.r);
  const low = Math.min(a, b);
  const high = Math.max(a, b);


  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={DOMAIN} yDomain={[-3, 3]} aspect={3.4} grid={false} ariaLabel={pick(strings.distance, isRtl)}>
          <line x1={0} y1={0} x2={400} y2={0} stroke="transparent" />
          <PointHandle x={a} y={0} xDomain={DOMAIN} yDomain={[-30, 30]} step={1} ariaLabel={pick(strings.pointA, isRtl)} onChange={(x) => set('a', x)} />
          <PointHandle x={b} y={0} xDomain={DOMAIN} yDomain={[-30, 30]} step={1} ariaLabel={pick(strings.pointB, isRtl)} color="var(--t-accent)" onChange={(x) => set('b', x)} />
          {/* the tolerance ring: |x − a| < r */}
          <circle cx={((a - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])) * 400} cy={-40} r={(r / (DOMAIN[1] - DOMAIN[0])) * 400} fill="var(--t-sun)" fillOpacity={0.18} stroke="var(--t-sun)" strokeWidth={2} />
          <circle cx={((a - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])) * 400} cy={-40} r={3.5} fill="var(--t-ink)" />
        </MathPlot>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.radius} value={r} min={0} max={6} step={1} onChange={(value) => set('r', value)} format={(value) => fmt(value, 0)} />
      </div>
      <Readout
        dir="ltr"
        rows={[
          { label: pick(strings.distance, isRtl), value: `${Math.abs(a - b)}` },
          { label: pick(strings.midpoint, isRtl), value: `${fmt((a + b) / 2, 1)}` },
          { label: pick(strings.interval, isRtl), value: `(${fmt(a - r, 0)}, ${fmt(a + r, 0)})`, emphasis: true },
        ]}
      />
      <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
        {isRtl
          ? 'الهامش r يحدد نصف قطر الدائرة على خط الأعداد؛ نقطة الاختبار تحسم الجهة الصحيحة.'
          : `Integers between ${low} and ${high}: ${Math.max(0, Math.floor(high) - Math.ceil(low) + 1 - (Number.isInteger(low) ? 1 : 0) - (Number.isInteger(high) ? 1 : 0))} strictly inside, ${Math.max(0, Math.floor(high) - Math.ceil(low) + 1)} including the ends.`}
      </p>
    </div>
  );
}

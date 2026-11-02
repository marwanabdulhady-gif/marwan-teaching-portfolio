/**
 * 2.2 + 2.3 · Differentiation rules.
 *
 * Two tabs: power rule tiles, and the product rule as a growing rectangle
 * whose four strips are exactly u·dv + v·du + du·dv.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Readout, SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt, superscript } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Every rule is bookkeeping on pieces: the power rule pulls the exponent down, the product rule adds the strips.',
    ar: 'كل قاعدة تنظيم للأجزاء: قاعدة القوة تُنزل الأس، وقاعدة الضرب تجمع الشرائط.',
  },
  tab: { en: 'rule', ar: 'القاعدة' },
  n: { en: 'exponent n', ar: 'الأس n' },
  u: { en: 'u', ar: 'u' },
  v: { en: 'v', ar: 'v' },
  du: { en: 'Δu', ar: 'Δu' },
  dv: { en: 'Δv', ar: 'Δv' },
  formula: { en: 'derivative', ar: 'المشتقة' },
  area: { en: 'area uv', ar: 'المساحة uv' },
  strips: { en: 'new strips', ar: 'الشرائط الجديدة' },
  power: { en: 'power rule', ar: 'قاعدة القوة' },
  product: { en: 'product rule', ar: 'قاعدة الضرب' },
} satisfies Record<string, Bi>;

export default function RulesLab({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ tab: 0, n: 3, u: 4, v: 3, du: 1, dv: 0.8 }, onInteract);
  const power = values.tab < 0.5;
  const n = Math.round(values.n);
  const { u, v, du, dv } = values;

  const unit = 30;
  const width = (u + du) * unit + 40;
  const height = (v + dv) * unit + 40;
  const x0 = 20;
  const y0 = 20;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <SegmentedChoice
        label={strings.tab}
        value={power ? 'power' : 'product'}
        isRtl={isRtl}
        options={[
          { id: 'power', label: strings.power },
          { id: 'product', label: strings.product },
        ]}
        onChange={(id) => set('tab', id === 'power' ? 0 : 1)}
      />

      {power ? (
        <>
          <div dir="ltr" className="flex flex-wrap gap-2">
            {Array.from({ length: n }, (_, index) => (
              <span
                key={index}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--t-accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--t-accent)_10%,transparent)] font-mono text-sm font-black text-[var(--t-accent-deep)]"
              >
                x
              </span>
            ))}
            <span className="flex items-center px-1 font-mono text-sm text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">→</span>
            <span className="flex h-11 items-center rounded-lg border border-[color-mix(in_srgb,var(--t-sky)_45%,transparent)] bg-[color-mix(in_srgb,var(--t-sky)_10%,transparent)] px-3 font-mono text-sm font-black text-[var(--t-sky)]" dir="ltr">
              {n}x{superscript(n - 1)}
            </span>
          </div>
          <Slider label={strings.n} value={n} min={1} max={6} step={1} onChange={(value) => set('n', value)} format={(value) => fmt(value, 0)} />
          <Readout
            dir={isRtl ? 'rtl' : 'ltr'}
            rows={[
              { label: 'f(x)', value: `x${superscript(n)}` },
              { label: pick(strings.formula, isRtl), value: `f′(x) = ${n}x${superscript(n - 1)}`, emphasis: true },
              { label: 'f′(2)', value: fmt(n * Math.pow(2, n - 1), 0) },
            ]}
          />
        </>
      ) : (
        <>
          <div dir="ltr" className="flex justify-center rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full max-w-[300px]" role="img" aria-label="product rule rectangle">
              <rect x={x0} y={y0 + dv * unit} width={u * unit} height={v * unit} fill="var(--t-accent)" fillOpacity={0.16} stroke="var(--t-ink)" strokeOpacity={0.4} />
              <rect x={x0 + u * unit} y={y0 + dv * unit} width={du * unit} height={v * unit} fill="var(--t-sky)" fillOpacity={0.2} stroke="var(--t-ink)" strokeOpacity={0.3} />
              <rect x={x0} y={y0} width={u * unit} height={dv * unit} fill="var(--t-sun)" fillOpacity={0.22} stroke="var(--t-ink)" strokeOpacity={0.3} />
              <rect x={x0 + u * unit} y={y0} width={du * unit} height={dv * unit} fill="var(--t-ink)" fillOpacity={0.12} stroke="var(--t-ink)" strokeOpacity={0.25} />
              <text x={x0 + (u * unit) / 2} y={y0 + dv * unit + (v * unit) / 2} textAnchor="middle" fontSize={11} fontFamily="ui-monospace, monospace" fill="var(--t-ink)">uv</text>
              <text x={x0 + u * unit + (du * unit) / 2} y={y0 + dv * unit + (v * unit) / 2} textAnchor="middle" fontSize={10} fontFamily="ui-monospace, monospace" fill="var(--t-ink)">v·du</text>
              <text x={x0 + (u * unit) / 2} y={y0 + (dv * unit) / 2 + 4} textAnchor="middle" fontSize={10} fontFamily="ui-monospace, monospace" fill="var(--t-ink)">u·dv</text>
              <text x={x0 + u * unit + (du * unit) / 2} y={y0 + (dv * unit) / 2 + 3} textAnchor="middle" fontSize={9} fontFamily="ui-monospace, monospace" fill="var(--t-ink)">dudv</text>
            </svg>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Slider label={strings.u} value={u} min={1} max={6} step={0.5} onChange={(value) => set('u', value)} format={(value) => fmt(value, 1)} />
            <Slider label={strings.v} value={v} min={1} max={6} step={0.5} onChange={(value) => set('v', value)} format={(value) => fmt(value, 1)} />
            <Slider label={strings.du} value={du} min={0.2} max={2} step={0.1} onChange={(value) => set('du', value)} format={(value) => fmt(value, 2)} />
            <Slider label={strings.dv} value={dv} min={0.2} max={2} step={0.1} onChange={(value) => set('dv', value)} format={(value) => fmt(value, 2)} />
          </div>
          <Readout
            dir={isRtl ? 'rtl' : 'ltr'}
            rows={[
              { label: pick(strings.area, isRtl), value: fmt(u * v, 2) },
              { label: pick(strings.strips, isRtl), value: `${fmt(v * du, 2)} + ${fmt(u * dv, 2)} + ${fmt(du * dv, 2)} = ${fmt(v * du + u * dv + du * dv, 2)}` },
              { label: '(uv)′', value: `${fmt(v, 1)}du + ${fmt(u, 1)}dv · du·dv → 0`, emphasis: true },
            ]}
          />
        </>
      )}
    </div>
  );
}

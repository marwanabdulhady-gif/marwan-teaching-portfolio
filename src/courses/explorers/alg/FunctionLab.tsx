/**
 * Algebra 1 · 3.4 — a function machine: choose the rule, slide the input, and
 * read the output, the table and the graph.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, MathPlot, Point } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'A function pairs every input with exactly one output. Slide x and watch f(x) follow.',
    ar: 'الدالة تربط كل مدخل بمخرج واحد فقط. حرّك x وراقب f(x).',
  },
  rule: { en: 'rule', ar: 'القاعدة' },
  input: { en: 'input x', ar: 'المدخل x' },
  output: { en: 'output f(x)', ar: 'المخرج f(x)' },
  table: { en: 'table', ar: 'الجدول' },
  domain: { en: 'domain', ar: 'المجال' },
  named: { en: 'f(2) means the output when x = 2', ar: 'تعني f(2) المخرج عندما x = 2' },
} satisfies Record<string, Bi>;

const RULES = [
  { id: 'linear', label: 'f(x) = 3x − 2', f: (x: number) => 3 * x - 2, domain: { en: 'all real numbers', ar: 'كل الأعداد الحقيقية' } },
  { id: 'square', label: 'f(x) = x²', f: (x: number) => x * x, domain: { en: 'all real numbers', ar: 'كل الأعداد الحقيقية' } },
  { id: 'sqrt', label: 'f(x) = √x', f: (x: number) => (x < 0 ? NaN : Math.sqrt(x)), domain: { en: 'x ≥ 0', ar: 'x ≥ 0' } },
  { id: 'recip', label: 'f(x) = 1/(x − 2)', f: (x: number) => (Math.abs(x - 2) < 1e-9 ? NaN : 1 / (x - 2)), domain: { en: 'all reals except 2', ar: 'كل الأعداد إلا ٢' } },
];

export default function FunctionLab({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ rule: 0, x: 1.5 }, onInteract);
  const rule = RULES[Math.round(values.rule)] ?? RULES[0];
  const x = values.x;
  const y = rule.f(x);

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <SegmentedChoice
        label={strings.rule}
        value={rule.id}
        isRtl={isRtl}
        options={RULES.map((item) => ({ id: item.id, label: { en: item.label, ar: item.label } }))}
        onChange={(id) => set('rule', RULES.findIndex((item) => item.id === id))}
      />

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-5, 5]} yDomain={[-5, 9]} ariaLabel={rule.label}>
          <Curve fn={rule.f} width={2.5} />
          <Point x={x} y={y} />
        </MathPlot>
      </div>

      <Slider label={strings.input} value={x} min={-4} max={4} step={0.25} onChange={(value) => set('x', value)} format={(value) => fmt(value, 2)} />

      <div dir="ltr" className="overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)]">
        <table className="w-full border-collapse font-mono text-[0.7rem]">
          <thead>
            <tr className="bg-[color-mix(in_srgb,var(--t-ink)_5%,transparent)]">
              <th className="px-2 py-1 text-start font-bold">x</th>
              {[-2, -1, 0, 1, 2].map((value) => (
                <th key={value} className="px-2 py-1 text-end font-bold">
                  {value}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-2 py-1 text-start text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">f(x)</td>
              {[-2, -1, 0, 1, 2].map((value) => (
                <td key={value} className="px-2 py-1 text-end text-[var(--t-accent-deep)]">
                  {Number.isFinite(rule.f(value)) ? fmt(rule.f(value), 1) : '—'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.input, isRtl), value: fmt(x, 2) },
          { label: pick(strings.output, isRtl), value: Number.isFinite(y) ? fmt(y, 2) : isRtl ? 'غير معرّف' : 'undefined', emphasis: true },
          { label: pick(strings.domain, isRtl), value: isRtl ? rule.domain.ar : rule.domain.en },
        ]}
      />
      <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">{pick(strings.named, isRtl)}</p>
    </div>
  );
}

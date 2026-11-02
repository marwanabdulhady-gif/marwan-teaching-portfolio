/**
 * Algebra 2 · 3.2 — synthetic division of x³ + bx² + cx + d by (x − r), one
 * row at a time, ending with the remainder theorem.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Readout, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Bring the first coefficient down, multiply by r, add. When the row ends, the last number is the remainder.',
    ar: 'أنزل أول معامل، اضربه في r، ثم اجمع. آخر رقم في الصف هو الباقي.',
  },
  b: { en: 'b (x² term)', ar: 'b (حد x²)' },
  c: { en: 'c (x term)', ar: 'c (حد x)' },
  d: { en: 'd (constant)', ar: 'd (الثابت)' },
  r: { en: 'divisor x − r, r =', ar: 'المقسوم عليه x − r، r =' },
  row: { en: 'synthetic row', ar: 'صف القسمة التركيبية' },
  quotient: { en: 'quotient', ar: 'خارج القسمة' },
  remainder: { en: 'remainder', ar: 'الباقي' },
  theorem: { en: 'by the remainder theorem f(r) =', ar: 'بمبرهنة الباقي f(r) =' },
} satisfies Record<string, Bi>;

export default function PolyDivisionLab({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ b: -3, c: 2, d: 4, r: 2 }, onInteract);
  const { b, c, d, r } = values;

  const first = 1;
  const second = first * r + b;
  const third = second * r + c;
  const remainder = third * r + d;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] px-3 py-3 font-mono text-xs">
        <p className="text-[var(--t-ink)]">{`x³ ${b >= 0 ? '+' : '−'} ${Math.abs(b)}x² ${c >= 0 ? '+' : '−'} ${Math.abs(c)}x ${d >= 0 ? '+' : '−'} ${Math.abs(d)}`}</p>
        <p className="mt-1 text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">{`÷ (x − ${fmt(r, 0)})`}</p>
        <table className="mt-2 border-collapse">
          <tbody>
            <tr>
              <td className="pr-3 text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">r = {fmt(r, 0)}</td>
              {[first, b, c, d].map((value, index) => (
                <td key={index} className="px-2 text-end text-[var(--t-ink)]">
                  {fmt(value, 0)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="pr-3" />
              <td />
              <td className="px-2 text-end text-[var(--t-sun)]">{fmt(first * r, 0)}</td>
              <td className="px-2 text-end text-[var(--t-sun)]">{fmt(second * r, 0)}</td>
              <td className="px-2 text-end text-[var(--t-sun)]">{fmt(third * r, 0)}</td>
            </tr>
            <tr className="border-t border-[color-mix(in_srgb,var(--t-ink)_20%,transparent)]">
              <td className="pr-3" />
              <td className="px-2 text-end font-bold text-[var(--t-accent-deep)]">{fmt(first, 0)}</td>
              <td className="px-2 text-end font-bold text-[var(--t-accent-deep)]">{fmt(second, 0)}</td>
              <td className="px-2 text-end font-bold text-[var(--t-accent-deep)]">{fmt(third, 0)}</td>
              <td className="px-2 text-end font-bold text-[var(--t-ink)]">{fmt(remainder, 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.b} value={b} min={-6} max={6} step={1} onChange={(value) => set('b', value)} format={(value) => fmt(value, 0)} />
        <Slider label={strings.c} value={c} min={-6} max={6} step={1} onChange={(value) => set('c', value)} format={(value) => fmt(value, 0)} />
        <Slider label={strings.d} value={d} min={-6} max={6} step={1} onChange={(value) => set('d', value)} format={(value) => fmt(value, 0)} />
        <Slider label={strings.r} value={r} min={-3} max={4} step={1} onChange={(value) => set('r', value)} format={(value) => fmt(value, 0)} />
      </div>

      <Readout
        dir="ltr"
        rows={[
          { label: pick(strings.quotient, isRtl), value: `x² ${second >= 0 ? '+' : '−'} ${Math.abs(second)}x ${third >= 0 ? '+' : '−'} ${Math.abs(third)}` },
          { label: pick(strings.remainder, isRtl), value: fmt(remainder, 0), emphasis: true },
          { label: pick(strings.theorem, isRtl), value: fmt(remainder, 0) },
        ]}
      />
      {remainder === 0 && (
        <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">
          {isRtl ? 'الباقي صفر، إذن x = r جذر، و (x − r) عامل.' : 'Zero remainder: x = r is a root, so (x − r) is a factor.'}
        </p>
      )}
    </div>
  );
}

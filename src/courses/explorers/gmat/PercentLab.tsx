/**
 * GMAT · percent topics. One bar model, three questions:
 *   percent-fundamentals — a change is a multiplier, and up-then-down does not cancel
 *   fractions            — one number with three names
 *   mixtures             — the solute in grams is what is conserved
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Readout, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';
import { Bar } from './parts';

const strings = {
  base: { en: 'start value', ar: 'القيمة الابتدائية' },
  change: { en: 'change (%)', ar: 'النسبة (٪)' },
  after: { en: 'after the change', ar: 'بعد التغيير' },
  multiplier: { en: 'multiplier', ar: 'المعامل' },
  reverse: { en: 'reverse it', ar: 'عكسه' },
  roundTrip: { en: 'up 20% then down 20%', ar: 'زيادة ٢٠٪ ثم نقصان ٢٠٪' },
  numerator: { en: 'numerator', ar: 'البسط' },
  denominator: { en: 'denominator', ar: 'المقام' },
  decimal: { en: 'decimal', ar: 'عشري' },
  percent: { en: 'percent', ar: 'نسبة مئوية' },
  simplified: { en: 'simplified', ar: 'مبسّط' },
  volume: { en: 'volume (L)', ar: 'الحجم (لتر)' },
  strength: { en: 'solute (%)', ar: 'المذاب (٪)' },
  addWater: { en: 'add water (L)', ar: 'أضف ماءً (لتر)' },
  solute: { en: 'solute', ar: 'المذاب' },
  finalMix: { en: 'result', ar: 'الناتج' },
  what: {
    en: 'Percent problems are multiplication problems. Watch the bar, not the words.',
    ar: 'مسائل النسب مسائل ضرب. راقب الشريط لا الكلمات.',
  },
  mixWhat: {
    en: 'Water adds volume and no solute, so the strength can only fall.',
    ar: 'الماء يزيد الحجم ولا يضيف مذاباً، فالنسبة لا يمكن إلا أن تنخفض.',
  },
} satisfies Record<string, Bi>;

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

export default function PercentLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const slug = lesson.id;
  const [values, set] = useExplorerState({ base: 200, pct: 25, num: 3, den: 8, volume: 4, strength: 40, water: 2 }, onInteract);

  if (slug === 'mixtures') {
    const volume = values.volume;
    const strength = values.strength;
    const water = values.water;
    const solute = (volume * strength) / 100;
    const finalVolume = volume + water;
    const finalStrength = finalVolume === 0 ? 0 : (solute / finalVolume) * 100;

    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.mixWhat, isRtl)}</p>
        <div className="space-y-2">
          <Bar label="before" caption={`${fmt(strength, 0)}%`} fill={strength / 100} />
          <Bar label="after" caption={`${fmt(finalStrength, 1)}%`} fill={finalStrength / 100} tone="var(--t-sky)" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Slider label={strings.volume} value={volume} min={1} max={10} step={0.5} onChange={(value) => set('volume', value)} format={(value) => fmt(value, 1)} />
          <Slider label={strings.strength} value={strength} min={5} max={90} step={5} onChange={(value) => set('strength', value)} format={(value) => `${fmt(value, 0)}%`} />
          <Slider label={strings.addWater} value={water} min={0} max={10} step={0.5} onChange={(value) => set('water', value)} format={(value) => fmt(value, 1)} />
        </div>
        <Readout
          dir="ltr"
          rows={[
            { label: 'solute', value: `${fmt(solute, 2)} L of ${fmt(volume, 1)} L` },
            { label: 'volume', value: `${fmt(volume, 1)} + ${fmt(water, 1)} = ${fmt(finalVolume, 1)} L` },
            { label: 'strength', value: `${fmt(finalStrength, 1)}%`, emphasis: true },
          ]}
        />
      </div>
    );
  }

  if (slug === 'fractions') {
    const num = Math.max(1, Math.round(values.num));
    const den = Math.max(1, Math.round(values.den));
    const value = num / den;
    const divisor = gcd(num, den);
    const whole = Math.floor(value);
    const remainder = num - whole * den;

    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
        <Bar label={`${num}/${den}`} caption={`${fmt(value * 100, 1)}%`} fill={Math.min(1, value)} height={26} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Slider label={strings.numerator} value={num} min={1} max={12} step={1} onChange={(value) => set('num', value)} format={(v) => fmt(v, 0)} />
          <Slider label={strings.denominator} value={den} min={1} max={12} step={1} onChange={(value) => set('den', value)} format={(v) => fmt(v, 0)} />
        </div>
        <Readout
          dir="ltr"
          rows={[
            { label: 'fraction', value: `${num}/${den}` },
            { label: pick(strings.simplified, isRtl), value: `${num / divisor}/${den / divisor}` },
            { label: pick(strings.decimal, isRtl), value: fmt(value, 4) },
            { label: pick(strings.percent, isRtl), value: `${fmt(value * 100, 2)}%`, emphasis: true },
            { label: 'mixed', value: whole > 0 ? `${whole} ${remainder}/${den}` : '—' },
          ]}
        />
      </div>
    );
  }

  // percent-fundamentals (default): a change is a multiplier.
  const base = values.base;
  const pct = values.pct;
  const multiplier = 1 + pct / 100;
  const after = base * multiplier;
  const back = after / multiplier;
  const upThenDown = base * 1.2 * 0.8;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
      <div className="space-y-2">
        <Bar label="start" caption={fmt(base, 0)} fill={base / Math.max(base, after)} />
        <Bar label="after" caption={fmt(after, 0)} fill={after / Math.max(base, after)} tone="var(--t-sky)" compare={base / Math.max(base, after)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.base} value={base} min={20} max={500} step={10} onChange={(value) => set('base', value)} format={(v) => fmt(v, 0)} />
        <Slider label={strings.change} value={pct} min={-80} max={200} step={5} onChange={(value) => set('pct', value)} format={(v) => `${fmt(v, 0)}%`} />
      </div>
      <Readout
        dir="ltr"
        rows={[
          { label: pick(strings.multiplier, isRtl), value: `× ${fmt(multiplier, 3)}` },
          { label: pick(strings.after, isRtl), value: fmt(after, 2), emphasis: true },
          { label: pick(strings.reverse, isRtl), value: `${fmt(after, 2)} ÷ ${fmt(multiplier, 3)} = ${fmt(back, 2)}` },
          { label: pick(strings.roundTrip, isRtl), value: `${fmt(base, 0)} → ${fmt(base * 1.2, 0)} → ${fmt(upThenDown, 1)} (${fmt(upThenDown - base, 1)})` },
        ]}
      />
      <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
        {isRtl
          ? 'للعودة إلى القيمة الأصلية اقسم على المعامل نفسه، ولا تطرح النسبة.'
          : 'To get back to the start, divide by the same multiplier — never subtract the percentage.'}
      </p>
    </div>
  );
}

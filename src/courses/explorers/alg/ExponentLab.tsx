/**
 * Algebra 1 · 4.1 — the exponent rules, checked numerically. Change the base
 * and the exponents and see the two sides of each rule agree.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Readout, SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'The rules are shortcuts, not new ideas: multiplying powers adds the exponents because that is how many factors you have.',
    ar: 'القوانين اختصارات وليست أفكاراً جديدة: ضرب القوى يجمع الأسس لأنها عدد العوامل.',
  },
  rule: { en: 'rule', ar: 'القانون' },
  base: { en: 'base x', ar: 'الأساس x' },
  first: { en: 'first exponent', ar: 'الأس الأول' },
  second: { en: 'second exponent', ar: 'الأس الثاني' },
  left: { en: 'left side', ar: 'الطرف الأيسر' },
  right: { en: 'right side', ar: 'الطرف الأيمن' },
  equal: { en: 'they agree', ar: 'متساويان' },
  product: { en: 'product rule', ar: 'قاعدة الضرب' },
  quotient: { en: 'quotient rule', ar: 'قاعدة القسمة' },
  power: { en: 'power of a power', ar: 'قوة القوة' },
  zeros: { en: 'zero and negative', ar: 'الصفر والسالب' },
} satisfies Record<string, Bi>;

type RuleId = 'product' | 'quotient' | 'power' | 'zeros';

export default function ExponentLab({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ rule: 0, x: 2, a: 3, b: 4 }, onInteract);
  const rule = (['product', 'quotient', 'power', 'zeros'] as const)[Math.round(values.rule)] ?? 'product';
  const x = values.x;
  const a = Math.round(values.a);
  const b = Math.round(values.b);

  const sides = {
    product: { left: Math.pow(x, a) * Math.pow(x, b), right: Math.pow(x, a + b), leftText: `${fmt(x, 0)}^${a} · ${fmt(x, 0)}^${b}`, rightText: `${fmt(x, 0)}^${a + b}` },
    quotient: { left: Math.pow(x, a) / Math.pow(x, b), right: Math.pow(x, a - b), leftText: `${fmt(x, 0)}^${a} ÷ ${fmt(x, 0)}^${b}`, rightText: `${fmt(x, 0)}^${a - b}` },
    power: { left: Math.pow(Math.pow(x, a), b), right: Math.pow(x, a * b), leftText: `(${fmt(x, 0)}^${a})^${b}`, rightText: `${fmt(x, 0)}^${a * b}` },
    zeros: { left: Math.pow(x, 0) + Math.pow(x, -2), right: 1 + 1 / (x * x), leftText: `${fmt(x, 0)}^0 + ${fmt(x, 0)}^−2`, rightText: `1 + 1/${fmt(x, 0)}²` },
  }[rule];

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <SegmentedChoice
        label={strings.rule}
        value={rule}
        isRtl={isRtl}
        options={[
          { id: 'product', label: strings.product },
          { id: 'quotient', label: strings.quotient },
          { id: 'power', label: strings.power },
          { id: 'zeros', label: strings.zeros },
        ]}
        onChange={(id) => set('rule', (['product', 'quotient', 'power', 'zeros'] as const).indexOf(id))}
      />

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] px-3 py-4 text-center">
        <p className="font-mono text-base font-black text-[var(--t-accent-deep)]">
          {sides.leftText} = {sides.rightText}
        </p>
        <p className="mt-1 font-mono text-sm text-[var(--t-ink)]">
          {fmt(sides.left, 3)} = {fmt(sides.right, 3)}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label={strings.base} value={x} min={-3} max={5} step={1} onChange={(value) => set('x', value)} format={(value) => fmt(value, 0)} />
        <Slider label={strings.first} value={a} min={0} max={6} step={1} onChange={(value) => set('a', value)} format={(value) => fmt(value, 0)} />
        <Slider label={strings.second} value={b} min={0} max={6} step={1} onChange={(value) => set('b', value)} format={(value) => fmt(value, 0)} />
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.left, isRtl), value: fmt(sides.left, 3) },
          { label: pick(strings.right, isRtl), value: fmt(sides.right, 3) },
          { label: pick(strings.equal, isRtl), value: fmt(sides.left, 6) === fmt(sides.right, 6) ? '✓' : '≈', emphasis: true },
        ]}
      />
      <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
        {isRtl
          ? 'جرّب x = 0 أو أساً سالباً: القوانين تبقى صحيحة، لكن 0^0 و 1/x غير معرّفة.'
          : 'Try x = 0 or a negative exponent: the rules still hold, but 0⁰ and division by zero are undefined.'}
      </p>
    </div>
  );
}

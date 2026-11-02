/**
 * Algebra 1 · 1.3–1.4 and 3.2 — the balance model of solving, then the same
 * step-by-step idea for substituting into a formula and for elimination.
 */
import { useState } from 'react';
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Readout, SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'An equation is a balance. Whatever you do to one side you must do to the other.',
    ar: 'المعادلة كفة ميزان. ما تفعله بطرف يجب أن تفعله بالطرف الآخر.',
  },
  coefficient: { en: 'a (coefficient)', ar: 'a (المعامل)' },
  constant: { en: 'b (constant)', ar: 'b (الثابت)' },
  rhs: { en: 'right side c', ar: 'الطرف الأيمن c' },
  balance: { en: 'balance', ar: 'التوازن' },
  steps: { en: 'steps', ar: 'الخطوات' },
  solution: { en: 'solution', ar: 'الحل' },
  check: { en: 'check', ar: 'التحقق' },
  next: { en: 'Next step', ar: 'الخطوة التالية' },
  restart: { en: 'Start over', ar: 'ابدأ من جديد' },
  formula: { en: 'formula', ar: 'الصيغة' },
  target: { en: 'solve for', ar: 'الحل بالنسبة إلى' },
  system: { en: 'system', ar: 'النظام' },
  add: { en: 'add the equations', ar: 'اجمع المعادلتين' },
} satisfies Record<string, Bi>;

/** Formula rearrangements for 1.4. */
const FORMULAS: { id: string; label: string; target: string; result: string; why: string }[] = [
  { id: 'p', label: 'P = 2L + 2W', target: 'W', result: 'W = (P − 2L) / 2', why: 'subtract 2L, divide by 2' },
  { id: 'a', label: 'A = ½bh', target: 'h', result: 'h = 2A / b', why: 'multiply by 2, divide by b' },
  { id: 'l', label: 'y = mx + b', target: 'x', result: 'x = (y − b) / m', why: 'subtract b, divide by m' },
  { id: 'c', label: 'C = 2πr', target: 'r', result: 'r = C / (2π)', why: 'divide by 2π' },
];

export default function BalanceLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ a: 3, b: -5, c: 7, x: 0 }, onInteract);
  const [step, setStep] = useState(0);
  const [formulaId, setFormulaId] = useState('p');

  if (lesson.id === '1-4') {
    const formula = FORMULAS.find((item) => item.id === formulaId) ?? FORMULAS[0];
    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
        <SegmentedChoice
          label={strings.formula}
          value={formula.id}
          isRtl={isRtl}
          options={FORMULAS.map((item) => ({ id: item.id, label: { en: item.label, ar: item.label } }))}
          onChange={(id) => {
            onInteract();
            setFormulaId(id);
          }}
        />
        <Readout
          dir="ltr"
          rows={[
            { label: 'start', value: formula.label },
            { label: pick(strings.target, isRtl), value: formula.target },
            { label: pick(strings.solution, isRtl), value: formula.result, emphasis: true },
            { label: 'why', value: formula.why },
          ]}
        />
        <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
          {isRtl ? 'القاعدة: اعكس العملية، وطبّقها على الطرفين.' : 'Rule: undo the operation, on both sides.'}
        </p>
      </div>
    );
  }

  if (lesson.id === '3-2') {
    const { a, b, c } = values;
    // a·x + b·y = c  and  a·x − b·y = b  → add to eliminate y
    const sum = 2 * a;
    const x = sum === 0 ? NaN : (c + b) / sum;
    const y = b === 0 ? NaN : (c - a * x) / b;
    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
        <div dir="ltr" className="space-y-2 rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] px-3 py-3 font-mono text-sm text-[var(--t-ink)]">
          <p>{`${fmt(a, 1)}x + ${fmt(b, 1)}y = ${fmt(c, 1)}`}</p>
          <p>{`${fmt(a, 1)}x − ${fmt(b, 1)}y = ${fmt(b, 1)}`}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Slider label={strings.coefficient} value={a} min={1} max={5} step={1} onChange={(value) => set('a', value)} format={(value) => fmt(value, 0)} />
          <Slider label={strings.constant} value={b} min={1} max={5} step={1} onChange={(value) => set('b', value)} format={(value) => fmt(value, 0)} />
          <Slider label={strings.rhs} value={c} min={0} max={12} step={1} onChange={(value) => set('c', value)} format={(value) => fmt(value, 0)} />
        </div>
        <Readout
          dir="ltr"
          rows={[
            { label: pick(strings.add, isRtl), value: `${fmt(2 * a, 0)}x = ${fmt(c + b, 0)}` },
            { label: 'x', value: fmt(x, 2) },
            { label: 'y', value: Number.isFinite(y) ? fmt(y, 2) : '—', emphasis: true },
          ]}
        />
      </div>
    );
  }

  /* 1.3 — a·x + b = c, solved on a balance */
  const { a, b, c } = values;
  const solution = a === 0 ? NaN : (c - b) / a;
  const steps = [
    { label: isRtl ? 'اطرح b من الطرفين' : 'subtract b from both sides', line: `${fmt(a, 1)}x = ${fmt(c - b, 1)}` },
    { label: isRtl ? 'اقسم على a' : 'divide both sides by a', line: `x = ${fmt(solution, 2)}` },
  ];
  const weight = Math.max(1, Math.min(6, Math.round(Math.abs(c))));

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-3">
        <svg viewBox="0 0 320 150" className="h-auto w-full" role="img" aria-label={pick(strings.balance, isRtl)}>
          <line x1={40} y1={40} x2={280} y2={40} stroke="var(--t-ink)" strokeWidth={3} strokeLinecap="round" />
          <line x1={160} y1={40} x2={160} y2={120} stroke="var(--t-ink)" strokeWidth={3} />
          <rect x={110} y={120} width={100} height={10} rx={4} fill="var(--t-ink)" fillOpacity={0.5} />
          {Array.from({ length: Math.min(6, Math.abs(a)) }, (_, index) => (
            <g key={`ax-${index}`}>
              <rect x={48 + index * 16} y={12} width={12} height={12} rx={2} fill="var(--t-accent)" />
              <text x={54 + index * 16} y={22} textAnchor="middle" fontSize={8} fill="var(--t-on-accent)" fontFamily="ui-monospace, monospace">
                x
              </text>
            </g>
          ))}
          {Array.from({ length: Math.abs(b) }, (_, index) => (
            <circle key={`b-${index}`} cx={150 + index * 10} cy={20} r={4} fill={b < 0 ? 'var(--t-danger)' : 'var(--t-sky)'} />
          ))}
          {Array.from({ length: weight }, (_, index) => (
            <circle key={`c-${index}`} cx={214 + index * 10} cy={20} r={4.5} fill="var(--t-sun)" />
          ))}
          <text x={160} y={140} textAnchor="middle" fontSize={10} fill="var(--t-ink)" fillOpacity={0.6} fontFamily="ui-monospace, monospace">
            {`${fmt(a, 1)}x ${b >= 0 ? '+' : '−'} ${fmt(Math.abs(b), 1)} = ${fmt(c, 1)}`}
          </text>
        </svg>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label={strings.coefficient} value={a} min={1} max={6} step={1} onChange={(value) => set('a', value)} format={(value) => fmt(value, 0)} />
        <Slider label={strings.constant} value={b} min={-6} max={6} step={1} onChange={(value) => set('b', value)} format={(value) => fmt(value, 0)} />
        <Slider label={strings.rhs} value={c} min={-6} max={12} step={1} onChange={(value) => set('c', value)} format={(value) => fmt(value, 0)} />
      </div>

      <ol className="space-y-1.5">
        {steps.map((entry, index) => (
          <li
            key={entry.label}
            className={`flex items-baseline justify-between gap-3 rounded-lg border px-2.5 py-1.5 ${
              index < step
                ? 'border-[color-mix(in_srgb,var(--t-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--t-accent)_8%,transparent)]'
                : 'border-dashed border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)]'
            }`}
          >
            <span className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">{entry.label}</span>
            <span dir="ltr" className={`font-mono text-[0.75rem] ${index < step ? 'text-[var(--t-ink)]' : 'text-transparent'}`}>
              {index < step ? entry.line : '—'}
            </span>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-2">
        {step < steps.length ? (
          <button type="button" onClick={() => setStep((current) => current + 1)} className="teach-btn teach-btn-primary border-0">
            {pick(strings.next, isRtl)}
          </button>
        ) : (
          <button type="button" onClick={() => setStep(0)} className="teach-btn teach-btn-secondary">
            {pick(strings.restart, isRtl)}
          </button>
        )}
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.solution, isRtl), value: Number.isFinite(solution) ? `x = ${fmt(solution, 2)}` : '—', emphasis: true },
          { label: pick(strings.check, isRtl), value: `${fmt(a, 0)}(${fmt(solution, 2)}) ${b >= 0 ? '+' : '−'} ${fmt(Math.abs(b), 0)} = ${fmt(a * solution + b, 2)}` },
        ]}
      />
    </div>
  );
}

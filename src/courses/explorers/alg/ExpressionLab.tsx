/**
 * Algebra 1 · 1.1–1.2 — evaluate an expression, and watch the order of
 * operations happen one line at a time.
 */
import { useState } from 'react';
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Readout, SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'An expression is a recipe. Change the ingredients (the variables) and the value changes with them.',
    ar: 'التعبير وصفة. غيّر المكوّنات (المتغيرات) فتتغير القيمة معها.',
  },
  a: { en: 'a', ar: 'a' },
  b: { en: 'b', ar: 'b' },
  x: { en: 'x', ar: 'x' },
  value: { en: 'value', ar: 'القيمة' },
  expression: { en: 'expression', ar: 'التعبير' },
  substitute: { en: 'substitute', ar: 'عوّض' },
  example: { en: 'worked example', ar: 'مثال محلول' },
  next: { en: 'Next step', ar: 'الخطوة التالية' },
  restart: { en: 'Start over', ar: 'ابدأ من جديد' },
  order: { en: 'order of operations', ar: 'ترتيب العمليات' },
  done: { en: 'done', ar: 'تم' },
} satisfies Record<string, Bi>;

const EXAMPLES = [
  {
    id: 'a',
    label: '8 + 2·3²',
    steps: ['8 + 2·9', '8 + 18', '26'],
    reason: ['exponent first', 'multiply', 'add'],
  },
  {
    id: 'b',
    label: '20 − 4 ÷ 2 + 3',
    steps: ['20 − 2 + 3', '18 + 3', '21'],
    reason: ['divide', 'left to right', 'add'],
  },
  {
    id: 'c',
    label: '2(4 + 3·2)',
    steps: ['2(4 + 6)', '2(10)', '20'],
    reason: ['multiply inside', 'add inside', 'multiply out'],
  },
];

export default function ExpressionLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ a: 3, b: 5, x: 4 }, onInteract);
  const [exampleId, setExampleId] = useState('a');
  const [step, setStep] = useState(0);
  const example = EXAMPLES.find((item) => item.id === exampleId) ?? EXAMPLES[0];

  if (lesson.id === '1-2') {
    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
        <SegmentedChoice
          label={strings.example}
          value={example.id}
          isRtl={isRtl}
          options={EXAMPLES.map((item) => ({ id: item.id, label: { en: item.label, ar: item.label } }))}
          onChange={(id) => {
            onInteract();
            setExampleId(id);
            setStep(0);
          }}
        />
        <ol className="space-y-1.5">
          <li className="flex items-baseline justify-between gap-3 rounded-lg border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] px-2.5 py-1.5">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">
              {pick(strings.expression, isRtl)}
            </span>
            <span dir="ltr" className="font-mono text-[0.78rem] text-[var(--t-ink)]">
              {example.label}
            </span>
          </li>
          {example.steps.map((line, index) => (
            <li
              key={line + index}
              className={`flex items-baseline justify-between gap-3 rounded-lg border px-2.5 py-1.5 ${
                index < step
                  ? 'border-[color-mix(in_srgb,var(--t-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--t-accent)_8%,transparent)]'
                  : 'border-dashed border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)]'
              }`}
            >
              <span className="text-[0.68rem] text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">{example.reason[index]}</span>
              <span dir="ltr" className={`font-mono text-[0.78rem] ${index < step ? 'text-[var(--t-ink)]' : 'text-transparent'}`}>
                {index < step ? line : '—'}
              </span>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2">
          {step < example.steps.length ? (
            <button type="button" onClick={() => setStep((current) => current + 1)} className="teach-btn teach-btn-primary border-0">
              {pick(strings.next, isRtl)}
            </button>
          ) : (
            <button type="button" onClick={() => setStep(0)} className="teach-btn teach-btn-secondary">
              {pick(strings.restart, isRtl)}
            </button>
          )}
        </div>
        <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
          {pick(strings.order, isRtl)}: {isRtl ? 'الأقواس ← الأسس ← الضرب والقسمة ← الجمع والطرح' : 'brackets → exponents → × and ÷ → + and −'}
        </p>
      </div>
    );
  }

  const { a, b, x } = values;
  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] px-3 py-3 text-center">
        <p className="font-mono text-lg font-black text-[var(--t-accent-deep)]">{`${fmt(a, 1)}x ${b >= 0 ? '+' : '−'} ${fmt(Math.abs(b), 1)}`}</p>
        <p className="mt-1 font-mono text-xs text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">
          {`${fmt(a, 1)}(${fmt(x, 1)}) ${b >= 0 ? '+' : '−'} ${fmt(Math.abs(b), 1)} = ${fmt(a * x + b, 2)}`}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label={strings.a} value={a} min={-4} max={4} step={0.5} onChange={(value) => set('a', value)} format={(value) => fmt(value, 1)} />
        <Slider label={strings.b} value={b} min={-8} max={8} step={1} onChange={(value) => set('b', value)} format={(value) => fmt(value, 1)} />
        <Slider label={strings.x} value={x} min={-5} max={5} step={0.5} onChange={(value) => set('x', value)} format={(value) => fmt(value, 1)} />
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.expression, isRtl), value: `${fmt(a, 1)}x ${b >= 0 ? '+' : '−'} ${fmt(Math.abs(b), 1)}` },
          { label: pick(strings.substitute, isRtl), value: `x = ${fmt(x, 1)}` },
          { label: pick(strings.value, isRtl), value: fmt(a * x + b, 2), emphasis: true },
        ]}
      />

      <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
        {isRtl ? 'لاحظ: عند a = 0 يصبح التعبير ثابتاً لا يعتمد على x.' : 'Notice: when a = 0 the expression no longer depends on x.'}
      </p>
    </div>
  );
}

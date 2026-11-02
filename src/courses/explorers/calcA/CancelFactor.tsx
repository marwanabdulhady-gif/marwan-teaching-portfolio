/**
 * 1.3 · Evaluating limits analytically.
 *
 * Factor, cancel, substitute — one step at a time. The hole fills in with the
 * limit value once the common factor has been cancelled.
 */
import { useState } from 'react';
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, MathPlot, Point } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, pick } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Substituting gives 0/0, which says nothing. Factor, cancel, then substitute again.',
    ar: 'التعويض يعطي ٠/٠ فلا يفيد. حلّل، اختصر، ثم عوّض مرة أخرى.',
  },
  form: { en: 'form', ar: 'الصيغة' },
  step: { en: 'step', ar: 'الخطوة' },
  factor: { en: 'Factor', ar: 'حلّل' },
  cancel: { en: 'Cancel', ar: 'اختصر' },
  substitute: { en: 'Substitute', ar: 'عوّض' },
  restart: { en: 'Start over', ar: 'ابدأ من جديد' },
  original: { en: 'original', ar: 'الأصلية' },
  simplified: { en: 'simplified', ar: 'المختصرة' },
  limit: { en: 'limit', ar: 'النهاية' },
  hole: { en: 'the hole is x = a, not the line', ar: 'الفتحة عند x = a وليست على الخط' },
} satisfies Record<string, Bi>;

interface Form {
  id: string;
  label: string;
  a: number;
  original: string;
  factored: string;
  cancelled: string;
  f: (x: number) => number;
  g: (x: number) => number;
  value: number;
}

const FORMS: Form[] = [
  {
    id: 'square',
    label: '(x² − 9)/(x − 3)',
    a: 3,
    original: '(x² − 9) / (x − 3)',
    factored: '(x − 3)(x + 3) / (x − 3)',
    cancelled: 'x + 3',
    f: (x) => (Math.abs(x - 3) < 1e-9 ? NaN : (x * x - 9) / (x - 3)),
    g: (x) => x + 3,
    value: 6,
  },
  {
    id: 'quadratic',
    label: '(x² − x − 2)/(x − 2)',
    a: 2,
    original: '(x² − x − 2) / (x − 2)',
    factored: '(x − 2)(x + 1) / (x − 2)',
    cancelled: 'x + 1',
    f: (x) => (Math.abs(x - 2) < 1e-9 ? NaN : (x * x - x - 2) / (x - 2)),
    g: (x) => x + 1,
    value: 3,
  },
  {
    id: 'conjugate',
    label: '(√(x+4) − 2)/x',
    a: 0,
    original: '(√(x + 4) − 2) / x',
    factored: 'x / (x(√(x + 4) + 2))',
    cancelled: '1 / (√(x + 4) + 2)',
    f: (x) => (Math.abs(x) < 1e-9 ? NaN : (Math.sqrt(x + 4) - 2) / x),
    g: (x) => 1 / (Math.sqrt(Math.max(0, x + 4)) + 2),
    value: 0.25,
  },
];

export default function CancelFactor({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [formIndex, setFormIndex] = useState(0);
  const [stage, setStage] = useState(0);
  const form = FORMS[formIndex];

  const advance = () => {
    onInteract();
    setStage((current) => Math.min(2, current + 1));
  };

  const steps = [
    { label: strings.factor, text: form.factored, done: stage >= 1 },
    { label: strings.cancel, text: form.cancelled, done: stage >= 2 },
    { label: strings.substitute, text: `${fmt(form.a, 0)} → ${fmt(form.value, 2)}`, done: stage >= 3 },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <SegmentedChoice
        label={strings.form}
        value={form.id}
        isRtl={isRtl}
        options={FORMS.map((item) => ({ id: item.id, label: { en: item.label, ar: item.label } }))}
        onChange={(id) => {
          onInteract();
          setFormIndex(FORMS.findIndex((item) => item.id === id));
          setStage(0);
        }}
      />

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-2, 6]} yDomain={[-1, 10]} ariaLabel={form.label}>
          <Curve fn={form.f} width={3} />
          {stage >= 1 && <Curve fn={form.g} color="var(--t-accent)" dash="6 5" width={2} opacity={0.9} />}
          <Point x={form.a} y={form.value} hollow={stage < 3} r={stage >= 3 ? 5 : 6} color={stage >= 3 ? 'var(--t-sun)' : 'var(--t-ink)'} />
        </MathPlot>
      </div>

      <ol className="space-y-1.5">
        {steps.map((step, index) => (
          <li
            key={index}
            className={`flex items-baseline justify-between gap-3 rounded-lg border px-2.5 py-1.5 ${
              step.done
                ? 'border-[color-mix(in_srgb,var(--t-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--t-accent)_8%,transparent)]'
                : 'border-dashed border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)]'
            }`}
          >
            <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">
              {pick(step.label, isRtl)}
            </span>
            <span dir="ltr" className={`font-mono text-[0.72rem] ${step.done ? 'text-[var(--t-ink)]' : 'text-transparent'}`}>
              {step.done ? step.text : '—'}
            </span>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-2">
        {stage < 3 ? (
          <button type="button" onClick={advance} className="teach-btn teach-btn-primary border-0">
            {pick(steps[stage].label, isRtl)}
          </button>
        ) : (
          <button type="button" onClick={() => setStage(0)} className="teach-btn teach-btn-secondary">
            {pick(strings.restart, isRtl)}
          </button>
        )}
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.original, isRtl), value: form.original },
          { label: pick(strings.simplified, isRtl), value: stage >= 2 ? form.cancelled : '—' },
          { label: pick(strings.limit, isRtl), value: stage >= 3 ? fmt(form.value, 2) : '0/0', emphasis: stage >= 3 },
        ]}
      />
      {stage >= 2 && (
        <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">{pick(strings.hole, isRtl)}</p>
      )}
    </div>
  );
}

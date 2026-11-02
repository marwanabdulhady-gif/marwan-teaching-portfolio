/**
 * 1.4 · Continuity and one-sided limits.
 *
 * One function, three questions: is f(c) defined, does the limit exist, do
 * they agree? Tick all three for continuity — then break one deliberately.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Continuity is three conditions at once. Remove any one and the graph breaks.',
    ar: 'الاتصال ثلاثة شروط معاً. أزل أياً منها فينكسر التمثيل.',
  },
  kind: { en: 'kind of break', ar: 'نوع الانكسار' },
  defined: { en: 'f(c) is defined', ar: 'f(c) معرّفة' },
  limitExists: { en: 'the limit exists', ar: 'النهاية موجودة' },
  agree: { en: 'they agree', ar: 'تتفقان' },
  verdict: { en: 'verdict', ar: 'الحكم' },
  continuous: { en: 'continuous', ar: 'متصلة' },
  removable: { en: 'removable', ar: 'قابلة للإزالة' },
  jump: { en: 'jump', ar: 'قفزة' },
  infinite: { en: 'infinite', ar: 'لانهائية' },
  yes: { en: '✓', ar: '✓' },
  no: { en: '✗', ar: '✗' },
} satisfies Record<string, Bi>;

type BreakId = 'none' | 'removable' | 'jump' | 'infinite';

const C = 2;

const BREAKS: {
  id: BreakId;
  label: Bi;
  f: (x: number) => number;
  at: number | null;
  left: number | null;
  right: number | null;
  verdict: 'continuous' | 'removable' | 'jump' | 'infinite';
}[] = [
  { id: 'none', label: { en: 'none', ar: 'لا يوجد' }, f: (x) => 0.5 * x * x, at: 2, left: 2, right: 2, verdict: 'continuous' },
  {
    id: 'removable',
    label: { en: 'removable', ar: 'قابلة للإزالة' },
    f: (x) => (Math.abs(x - C) < 1e-9 ? NaN : x + 1),
    at: null,
    left: 3,
    right: 3,
    verdict: 'removable',
  },
  {
    id: 'jump',
    label: { en: 'jump', ar: 'قفزة' },
    f: (x) => (x < C ? x : x + 2),
    at: 4,
    left: 2,
    right: 4,
    verdict: 'jump',
  },
  {
    id: 'infinite',
    label: { en: 'infinite', ar: 'لانهائية' },
    f: (x) => (Math.abs(x - C) < 1e-9 ? NaN : 1 / (x - C)),
    at: null,
    left: null,
    right: null,
    verdict: 'infinite',
  },
];

export default function ContinuityChecker({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ kind: 1 }, onInteract);
  const breakType = BREAKS[Math.round(values.kind)] ?? BREAKS[0];

  const defined = breakType.at !== null;
  const limitExists = breakType.left !== null && breakType.right !== null && Math.abs(breakType.left - breakType.right) < 1e-9;
  const agree = defined && limitExists && Math.abs((breakType.at ?? 0) - (breakType.left ?? 0)) < 1e-9;

  const row = (label: Bi, ok: boolean) => ({
    label: pick(label, isRtl),
    value: pick(ok ? strings.yes : strings.no, isRtl),
    emphasis: ok,
  });

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <SegmentedChoice
        label={strings.kind}
        value={breakType.id}
        isRtl={isRtl}
        options={BREAKS.map((item) => ({ id: item.id, label: item.label }))}
        onChange={(id) => set('kind', BREAKS.findIndex((item) => item.id === id))}
      />

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[0, 4]} yDomain={[-4, 6]} ariaLabel={pick(strings.kind, isRtl)}>
          <Segment x1={C} y1={-4} x2={C} y2={6} color="var(--t-ink)" dash="4 4" opacity={0.3} />
          <Curve fn={breakType.f} />
          {breakType.at !== null && <Point x={C} y={breakType.at} r={5} color="var(--t-sun)" />}
          {breakType.id === 'removable' && <Point x={C} y={3} hollow r={5} color="var(--t-accent)" />}
        </MathPlot>
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          row(strings.defined, defined),
          row(strings.limitExists, limitExists),
          row(strings.agree, agree),
          {
            label: pick(strings.verdict, isRtl),
            value: pick(
              breakType.verdict === 'continuous' ? strings.continuous : breakType.verdict === 'jump' ? strings.jump : breakType.verdict === 'infinite' ? strings.infinite : strings.removable,
              isRtl,
            ),
            emphasis: true,
          },
        ]}
      />

      <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]" dir="ltr">
        lim x→2⁻ = {breakType.left === null ? 'undefined' : fmt(breakType.left, 2)} · lim x→2⁺ ={' '}
        {breakType.right === null ? '∞' : fmt(breakType.right, 2)} · f(2) = {defined ? fmt(breakType.at ?? 0, 2) : 'undefined'}
      </p>
    </div>
  );
}

/**
 * P.3 · Functions and their graphs.
 *
 * Build a two-piece function: drag the breakpoint, choose what each piece is,
 * and decide whether each end is open or closed. The junction values f(c⁻),
 * f(c) and f(c⁺) update live.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, DragHandle, MathPlot, Point } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Two rules meeting at one x-value. Watch which dot is filled — that is the value the function actually takes.',
    ar: 'قاعدتان تلتقيان عند قيمة x واحدة. راقب أي نقطة ممتلئة — فهي القيمة التي تأخذها الدالة فعلاً.',
  },
  breakpoint: { en: 'breakpoint c', ar: 'نقطة الفصل c' },
  left: { en: 'left piece', ar: 'القطعة اليسرى' },
  right: { en: 'right piece', ar: 'القطعة اليمنى' },
  closedLeft: { en: 'left end closed', ar: 'الطرف الأيسر مغلق' },
  closedRight: { en: 'right end closed', ar: 'الطرف الأيمن مغلق' },
  junction: { en: 'at the junction', ar: 'عند نقطة الفصل' },
  continuous: { en: 'continuous', ar: 'متصلة' },
  jump: { en: 'jump', ar: 'قفزة' },
} satisfies Record<string, Bi>;

type PieceId = 'line' | 'parabola' | 'constant';

const PIECES: { id: PieceId; label: string; f: (x: number, c: number) => number }[] = [
  { id: 'line', label: 'x + 1', f: (x) => x + 1 },
  { id: 'parabola', label: 'x²', f: (x) => x * x },
  { id: 'constant', label: '2', f: () => 2 },
];

export default function PiecewiseBuilder({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ c: 0, left: 0, right: 1, cl: 1, cr: 0 }, onInteract);
  const c = values.c;
  const left = PIECES[Math.round(values.left)] ?? PIECES[0];
  const right = PIECES[Math.round(values.right)] ?? PIECES[1];
  const closedLeft = values.cl > 0.5;
  const closedRight = values.cr > 0.5;

  const f = (x: number) => (x < c ? left.f(x, c) : x > c ? right.f(x, c) : closedRight ? right.f(x, c) : closedLeft ? left.f(x, c) : NaN);
  const fLeft = left.f(c, c);
  const fRight = right.f(c, c);
  const fAt = closedRight ? fRight : closedLeft ? fLeft : NaN;
  const jumping = Math.abs(fLeft - fRight) > 1e-9;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-4, 4]} yDomain={[-3, 6]} ariaLabel={pick(strings.breakpoint, isRtl)}>
          <Curve fn={f} from={-4} to={c} width={3} />
          <Curve fn={f} from={c} to={4} width={3} color="var(--t-sky)" />
          <Point x={c} y={fLeft} hollow={!closedLeft} r={5} color="var(--t-accent)" label="f(c⁻)" />
          <Point x={c} y={fRight} hollow={!closedRight} r={5} color="var(--t-sky)" label="f(c⁺)" />
          <DragHandle x={c} onChange={(value) => set('c', value)} min={-3} max={3} step={0.5} ariaLabel={pick(strings.breakpoint, isRtl)} py={16} />
        </MathPlot>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <SegmentedChoice
          label={strings.left}
          value={left.id}
          isRtl={isRtl}
          options={PIECES.map((item) => ({ id: item.id, label: { en: item.label, ar: item.label } }))}
          onChange={(id) => set('left', PIECES.findIndex((item) => item.id === id))}
        />
        <SegmentedChoice
          label={strings.right}
          value={right.id}
          isRtl={isRtl}
          options={PIECES.map((item) => ({ id: item.id, label: { en: item.label, ar: item.label } }))}
          onChange={(id) => set('right', PIECES.findIndex((item) => item.id === id))}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] px-2.5 py-1.5">
          <input type="checkbox" checked={closedLeft} onChange={(event) => set('cl', event.target.checked ? 1 : 0)} className="h-4 w-4 accent-[var(--t-accent)]" />
          <span className="text-xs font-semibold text-[var(--t-ink)]">{pick(strings.closedLeft, isRtl)}</span>
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] px-2.5 py-1.5">
          <input type="checkbox" checked={closedRight} onChange={(event) => set('cr', event.target.checked ? 1 : 0)} className="h-4 w-4 accent-[var(--t-accent)]" />
          <span className="text-xs font-semibold text-[var(--t-ink)]">{pick(strings.closedRight, isRtl)}</span>
        </label>
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.junction, isRtl), value: `c = ${fmt(c, 1)}` },
          { label: 'f(c⁻)', value: fmt(fLeft, 2) },
          { label: 'f(c⁺)', value: fmt(fRight, 2) },
          { label: 'f(c)', value: Number.isFinite(fAt) ? fmt(fAt, 2) : isRtl ? 'غير معرّفة' : 'undefined', emphasis: true },
          {
            label: pick(strings.continuous, isRtl),
            value: !jumping && Number.isFinite(fAt) && Math.abs(fAt - fLeft) < 1e-9 ? pick(strings.continuous, isRtl) : pick(strings.jump, isRtl),
          },
        ]}
      />
    </div>
  );
}

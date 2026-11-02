/**
 * 3.2 · Polynomial and rational functions.
 *
 * Change the degree n and the leading coefficient a: watch the end behaviour
 * and how many turning points appear, up to n − 1.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, MathPlot } from '../../viz/MathPlot';
import { Readout, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt, signed, superscript } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'The leading term decides the ends. An even degree sends both ends the same way; an odd degree splits them.',
    ar: 'الحد الرئيسي يحدد الأطراف. الدرجة الزوجية تجعل الطرفين في اتجاه واحد، والفردية تفصلهما.',
  },
  degree: { en: 'degree n', ar: 'الدرجة n' },
  lead: { en: 'leading a', ar: 'المعامل a' },
  degreeLabel: { en: 'degree', ar: 'الدرجة' },
  ends: { en: 'ends', ar: 'الأطراف' },
  turns: { en: 'turning points', ar: 'نقاط الاستدارة' },
  sameEnds: { en: 'both up', ar: 'كلاهما أعلى' },
  bothDown: { en: 'both down', ar: 'كلاهما أسفل' },
  upDown: { en: 'up on the right', ar: 'أعلى يميناً' },
  downUp: { en: 'down on the right', ar: 'أسفل يميناً' },
} satisfies Record<string, Bi>;

export default function ParentFamilies({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ n: 3, a: 1 }, onInteract);
  const n = Math.round(values.n);
  const a = values.a;
  const f = (x: number) => a * Math.pow(x, n);

  const even = n % 2 === 0;
  const ends = even
    ? a > 0
      ? pick(strings.sameEnds, isRtl)
      : pick(strings.bothDown, isRtl)
    : a > 0
      ? pick(strings.upDown, isRtl)
      : pick(strings.downUp, isRtl);

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-3, 3]} yDomain={[-9, 9]} ariaLabel={`y = ${fmt(a, 1)}x${superscript(n)}`}>
          <Curve fn={f} width={3} />
        </MathPlot>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.degree} value={n} min={1} max={6} step={1} onChange={(value) => set('n', value)} format={(value) => fmt(value, 0)} />
        <Slider label={strings.lead} value={a} min={-2} max={2} step={0.5} onChange={(value) => set('a', value)} format={(value) => fmt(value, 1)} />
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.lead, isRtl), value: `y = ${fmt(a, 1)}x${superscript(n)}`, emphasis: true },
          { label: pick(strings.degreeLabel, isRtl), value: `${n} (${even ? (isRtl ? 'زوجية' : 'even') : isRtl ? 'فردية' : 'odd'})` },
          { label: pick(strings.ends, isRtl), value: ends },
          { label: pick(strings.turns, isRtl), value: `${isRtl ? 'حتى' : 'at most'} ${n - 1}` },
          { label: 'y =', value: `${fmt(f(-3), 1)} … ${fmt(f(3), 1)}` },
        ]}
      />
    </div>
  );
}

/**
 * GMAT · overlapping sets and probability.
 *
 * Two rings, a total and a "neither" pocket. Toggling the overlap shows why the
 * union is not the sum, and the same counts feed the probability readout.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Readout, Slider, Toggle, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';
import { Bar } from './parts';

const strings = {
  what: {
    en: 'The overlap is counted in both circles, so the union subtracts it exactly once.',
    ar: 'التقاطع محسوب في الدائرتين، لذا يطرحه الاتحاد مرة واحدة فقط.',
  },
  onlyA: { en: 'A only', ar: 'A فقط' },
  onlyB: { en: 'B only', ar: 'B فقط' },
  both: { en: 'both', ar: 'كلاهما' },
  neither: { en: 'neither', ar: 'لا هذا ولا ذاك' },
  total: { en: 'total', ar: 'المجموع' },
  union: { en: 'union A ∪ B', ar: 'الاتحاد A ∪ B' },
  pickA: { en: 'P(A)', ar: 'ح(A)' },
  pickBoth: { en: 'P(A ∩ B)', ar: 'ح(A ∩ B)' },
  pickEither: { en: 'P(A ∪ B)', ar: 'ح(A ∪ B)' },
  exclude: { en: 'neither is in the group', ar: 'خارج المجموعتين' },
  a: { en: 'in A', ar: 'في A' },
  b: { en: 'in B', ar: 'في B' },
  overlap: { en: 'in both', ar: 'في الاثنين' },
  sample: { en: 'people surveyed', ar: 'عدد المشمولين' },
} satisfies Record<string, Bi>;

export default function SetsLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const probability = lesson.id === 'probability';
  const [values, set] = useExplorerState({ a: 14, b: 12, both: 5, total: 30 }, onInteract);

  const a = Math.max(values.both, Math.round(values.a));
  const b = Math.max(values.both, Math.round(values.b));
  const both = Math.min(a, b, Math.round(values.both));
  const union = a + b - both;
  const total = Math.max(union, Math.round(values.total));
  const neither = total - union;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-3">
        <svg viewBox="0 0 320 170" className="mx-auto h-auto w-full max-w-[320px]" role="img" aria-label={pick(strings.union, isRtl)}>
          <rect x={6} y={6} width={308} height={158} rx={10} fill="none" stroke="var(--t-ink)" strokeOpacity={0.2} />
          <circle cx={124} cy={85} r={56} fill="var(--t-sky)" fillOpacity={0.16} stroke="var(--t-sky)" strokeWidth={2} />
          <circle cx={196} cy={85} r={56} fill="var(--t-accent)" fillOpacity={0.14} stroke="var(--t-accent)" strokeWidth={2} />
          <text x={86} y={90} textAnchor="middle" fontSize={13} fontWeight="700" fill="var(--t-ink)" fontFamily="ui-monospace, monospace">
            {a - both}
          </text>
          <text x={160} y={90} textAnchor="middle" fontSize={13} fontWeight="700" fill="var(--t-ink)" fontFamily="ui-monospace, monospace">
            {both}
          </text>
          <text x={234} y={90} textAnchor="middle" fontSize={13} fontWeight="700" fill="var(--t-ink)" fontFamily="ui-monospace, monospace">
            {b - both}
          </text>
          <text x={278} y={150} textAnchor="middle" fontSize={11} fill="var(--t-ink)" fillOpacity={0.65} fontFamily="ui-monospace, monospace">
            {neither}
          </text>
          <text x={30} y={26} fontSize={11} fill="var(--t-ink)" fillOpacity={0.6} fontFamily="ui-monospace, monospace">
            A
          </text>
          <text x={286} y={26} fontSize={11} fill="var(--t-ink)" fillOpacity={0.6} fontFamily="ui-monospace, monospace">
            B
          </text>
        </svg>
      </div>

      <div className="space-y-2">
        <Bar label={pick(strings.a, isRtl)} caption={`${a}/${total}`} fill={a / total} />
        <Bar label={pick(strings.b, isRtl)} caption={`${b}/${total}`} fill={b / total} tone="var(--t-sky)" />
        <Bar label={pick(strings.union, isRtl)} caption={`${union}/${total}`} fill={union / total} tone="var(--t-sun)" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label={strings.a} value={a} min={1} max={30} step={1} onChange={(v) => set('a', v)} format={(v) => fmt(v, 0)} />
        <Slider label={strings.b} value={b} min={1} max={30} step={1} onChange={(v) => set('b', v)} format={(v) => fmt(v, 0)} />
        <Slider label={strings.overlap} value={both} min={0} max={Math.min(a, b)} step={1} onChange={(v) => set('both', v)} format={(v) => fmt(v, 0)} />
      </div>
      <Slider label={strings.sample} value={total} min={union} max={60} step={1} onChange={(v) => set('total', v)} format={(v) => fmt(v, 0)} />
      <Toggle
        label={strings.exclude}
        checked={neither > 0}
        onChange={(checked) => set('total', checked ? Math.max(union + 1, total) : union)}
      />

      <Readout
        dir="ltr"
        rows={[
          { label: '|A| + |B| − |A ∩ B|', value: `${a} + ${b} − ${both} = ${union}` },
          { label: pick(strings.neither, isRtl), value: `${total} − ${union} = ${neither}` },
          ...(probability
            ? [
                { label: pick(strings.pickA, isRtl), value: fmt(a / total, 3) },
                { label: pick(strings.pickBoth, isRtl), value: fmt(both / total, 3) },
                { label: pick(strings.pickEither, isRtl), value: fmt(union / total, 3), emphasis: true },
              ]
            : [{ label: pick(strings.union, isRtl), value: `${union} ${isRtl ? 'من' : 'of'} ${total}`, emphasis: true }]),
        ]}
      />
    </div>
  );
}

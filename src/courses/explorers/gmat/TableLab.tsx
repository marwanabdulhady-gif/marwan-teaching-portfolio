/**
 * GMAT · table and multi-source topics. One four-cell table with row and column
 * totals: fill the missing cell, read a derived ratio, then commit two picks in
 * the two-part mode and see whether the totals agree.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Readout, SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';
import { Cell, Idea, Verdict } from './parts';

const strings = {
  what: {
    en: 'Row totals and column totals are free information: whatever is missing is a subtraction away.',
    ar: 'مجاميع الصفوف والأعمدة معلومات مجانية؛ ما ينقص هو عملية طرح واحدة.',
  },
  derivedWhat: {
    en: 'A derived metric is a ratio the table does not show — compute it before you read the answers.',
    ar: 'المقياس المشتق نسبة لا يظهرها الجدول؛ احسبه قبل قراءة الخيارات.',
  },
  twoPartWhat: {
    en: 'Two picks must satisfy both columns at once. The pair is the answer, not either cell.',
    ar: 'اختياران يجب أن يحققا العمودين معاً؛ الجواب هو الزوج لا أي خانة منفردة.',
  },
  mode: { en: 'what to find', ar: 'المطلوب' },
  missing: { en: 'missing cell', ar: 'الخانة الناقصة' },
  rate: { en: 'best rate', ar: 'أفضل معدل' },
  pair: { en: 'the pair', ar: 'الزوج' },
  groupA: { en: 'group A', ar: 'المجموعة A' },
  groupB: { en: 'group B', ar: 'المجموعة B' },
  yes: { en: 'yes', ar: 'نعم' },
  no: { en: 'no', ar: 'لا' },
  total: { en: 'total', ar: 'المجموع' },
  rowTotal: { en: 'row total', ar: 'مجموع الصف' },
  colTotal: { en: 'column total', ar: 'مجموع العمود' },
  ratio: { en: 'A share of the total', ar: 'نصيب A من المجموع' },
  target: { en: 'target total', ar: 'المجموع المستهدف' },
  pick: { en: 'two-part table: choose this many from A', ar: 'جدول الجزأين: اختر هذا العدد من A' },
  check: { en: 'does the pair sum to the target?', ar: 'هل يساوي الزوج المجموع المستهدف؟' },
  ideas: { en: 'keep', ar: 'تذكّر' },
} satisfies Record<string, Bi>;

type Mode = 'missing' | 'rate' | 'pair';

export default function TableLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const derived = lesson.id === 'table-derived';
  const twoPart = lesson.id === 'two-part-analysis' || lesson.id === 'two-part-constraints' || lesson.id === 'two-part-tables';
  const [values, set] = useExplorerState({ a1: 24, a2: 18, b1: 16, b2: 22, target: 25, mode: 0, pickA: 10 }, onInteract);

  const a1 = Math.round(values.a1);
  const a2 = Math.round(values.a2);
  const b1 = Math.round(values.b1);
  const b2 = Math.round(values.b2);
  const rowA = a1 + a2;
  const rowB = b1 + b2;
  const col1 = a1 + b1;
  const col2 = a2 + b2;
  const total = rowA + rowB;
  const rateA = rowA === 0 ? 0 : a2 / rowA;
  const rateB = rowB === 0 ? 0 : b2 / rowB;

  const mode: Mode = derived ? 'rate' : twoPart ? 'pair' : (['missing', 'rate', 'pair'] as const)[Math.round(values.mode)] ?? 'missing';
  const target = Math.round(values.target);
  const pickedA = Math.min(total, Math.max(0, Math.round(values.pickA)));
  const pickedB = total - pickedA;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">
        {pick(twoPart ? strings.twoPartWhat : derived ? strings.derivedWhat : strings.what, isRtl)}
      </p>

      {!derived && !twoPart && (
        <SegmentedChoice
          label={strings.mode}
          value={mode}
          isRtl={isRtl}
          options={[
            { id: 'missing', label: strings.missing },
            { id: 'rate', label: strings.rate },
            { id: 'pair', label: strings.pair },
          ]}
          onChange={(id) => {
            onInteract();
            set('mode', (['missing', 'rate', 'pair'] as const).indexOf(id));
          }}
        />
      )}

      <div dir="ltr" className="grid grid-cols-4 gap-1.5 rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] p-2.5">
        <span />
        <span className="text-center font-mono text-[0.62rem] font-bold uppercase text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">Jan</span>
        <span className="text-center font-mono text-[0.62rem] font-bold uppercase text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">Feb</span>
        <span className="text-center font-mono text-[0.62rem] font-bold uppercase text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">{pick(strings.total, isRtl)}</span>

        <span className="self-center font-mono text-[0.68rem] font-bold text-[var(--t-ink)]">{pick(strings.groupA, isRtl)}</span>
        <Cell label="a₁" value={a1} />
        <Cell label="a₂" value={a2} />
        <Cell label={pick(strings.rowTotal, isRtl)} value={rowA} ok />

        <span className="self-center font-mono text-[0.68rem] font-bold text-[var(--t-ink)]">{pick(strings.groupB, isRtl)}</span>
        <Cell label="b₁" value={b1} />
        <Cell label="b₂" value={b2} />
        <Cell label={pick(strings.rowTotal, isRtl)} value={rowB} ok />

        <span className="self-center font-mono text-[0.68rem] font-bold text-[var(--t-ink)]">{pick(strings.total, isRtl)}</span>
        <Cell label={pick(strings.colTotal, isRtl)} value={col1} ok />
        <Cell label={pick(strings.colTotal, isRtl)} value={col2} ok />
        <Cell label={pick(strings.total, isRtl)} value={total} ok />
      </div>

      {mode === 'pair' && (
        <>
          <Slider label={strings.pick} value={pickedA} min={0} max={total} step={1} onChange={(value) => set('pickA', value)} format={(value) => fmt(value, 0)} />
          <Verdict ok={pickedA + pickedB === total}>
            {pick(strings.check, isRtl)}: {pickedA} + {pickedB} = {pickedA + pickedB}, {isRtl ? 'الهدف' : 'target'} {target}{' '}
            {pickedA + pickedB === target ? `— ${pick(strings.yes, isRtl)}` : `— ${pick(strings.no, isRtl)}`}
          </Verdict>
        </>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={{ en: 'a₁', ar: 'a₁' }} value={a1} min={0} max={40} step={1} onChange={(value) => set('a1', value)} format={(value) => fmt(value, 0)} />
        <Slider label={{ en: 'a₂', ar: 'a₂' }} value={a2} min={0} max={40} step={1} onChange={(value) => set('a2', value)} format={(value) => fmt(value, 0)} />
        <Slider label={{ en: 'b₁', ar: 'b₁' }} value={b1} min={0} max={40} step={1} onChange={(value) => set('b1', value)} format={(value) => fmt(value, 0)} />
        <Slider label={{ en: 'b₂', ar: 'b₂' }} value={b2} min={0} max={40} step={1} onChange={(value) => set('b2', value)} format={(value) => fmt(value, 0)} />
      </div>

      <Readout
        dir="ltr"
        rows={[
          { label: pick(strings.rowTotal, isRtl), value: `A ${a1} + ${a2} = ${rowA} · B ${b1} + ${b2} = ${rowB}` },
          { label: pick(strings.colTotal, isRtl), value: `Jan ${col1} · Feb ${col2}` },
          {
            label: pick(strings.rate, isRtl),
            value: `A ${fmt(rateA * 100, 1)}% vs B ${fmt(rateB * 100, 1)}%`,
            emphasis: true,
          },
          ...(mode === 'missing' ? [{ label: pick(strings.missing, isRtl), value: `${total} − ${col1} = ${col2}` }] : []),
        ]}
      />

      <ul className="space-y-1.5">
        <Idea>{isRtl ? 'المجاميع تُعطي الخانة الناقصة بلا معادلات.' : 'Totals give the missing cell with no algebra at all.'}</Idea>
        <Idea>{isRtl ? 'المعدل قد يخالف المجموع؛ رتّب حسب النسبة لا العدد.' : 'A rate can disagree with a total: rank by the ratio, not the count.'}</Idea>
      </ul>
    </div>
  );
}

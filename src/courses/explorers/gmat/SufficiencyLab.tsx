/**
 * GMAT · Data Sufficiency. The one lab every DS topic shares: test a statement
 * against the numbers it allows, and decide whether a single verdict is forced.
 * "Maybe" is the trap — it is the reason a statement fails.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';
import { Cell, Verdict } from './parts';

const strings = {
  what: {
    en: 'Two statements, five answers. You never need the value — only whether it is forced.',
    ar: 'شرطان وخمسة أجوبة. لا تحتاج القيمة بل هل هي مُلزَمة.',
  },
  question: { en: 'the question', ar: 'السؤال' },
  statement1: { en: 'Statement 1', ar: 'الشرط ١' },
  statement2: { en: 'Statement 2', ar: 'الشرط ٢' },
  test1: { en: 'test value for (1)', ar: 'قيمة اختبار للشرط ١' },
  test2: { en: 'test value for (2)', ar: 'قيمة اختبار للشرط ٢' },
  verdict: { en: 'verdict', ar: 'الحكم' },
  only: { en: 'forced to one answer', ar: 'محسوم لجواب واحد' },
  maybe: { en: 'more than one answer survives', ar: 'أكثر من جواب محتمل' },
  neither: { en: 'neither alone', ar: 'لا يكفي أيّ منهما' },
  together: { en: 'together', ar: 'معاً' },
  yesNo: { en: 'yes/no question', ar: 'سؤال نعم/لا' },
  value: { en: 'value question', ar: 'سؤال قيمة' },
  definiteNo: { en: 'a definite “no” is sufficient', ar: '«لا» المؤكد يكفي' },
  choice: { en: 'answer choice', ar: 'الخيار' },
} satisfies Record<string, Bi>;

const QUESTIONS = [
  {
    id: 'odd',
    label: { en: 'Is n odd?', ar: 'هل n فردي؟' },
    s1: { en: 'n is not divisible by 2', ar: 'n لا يقبل القسمة على ٢' },
    s2: { en: 'n + 1 is even', ar: 'n + 1 زوجي' },
    // Both statements say the same thing: each is sufficient alone.
    answers: 'D',
    test: (n: number) => (n % 2 === 1 ? 'yes' : 'no'),
  },
  {
    id: 'positive',
    label: { en: 'Is n > 0?', ar: 'هل n > 0؟' },
    s1: { en: 'n² > 0', ar: 'n² > 0' },
    s2: { en: 'n³ > 0', ar: 'n³ > 0' },
    // n² > 0 allows −3 and 3 → fails; n³ > 0 forces positive → sufficient.
    answers: 'B',
    test: (n: number) => (n > 0 ? 'yes' : 'no'),
  },
  {
    id: 'integer',
    label: { en: 'Is n an integer?', ar: 'هل n عدد صحيح؟' },
    s1: { en: 'n² is an integer', ar: 'n² عدد صحيح' },
    s2: { en: '2n is an integer', ar: '2n عدد صحيح' },
    // n = √2 gives n² = 2 but n is not an integer; n = 1/2 gives 2n = 1.
    answers: 'E',
    test: (n: number) => (Number.isInteger(n) ? 'yes' : 'no'),
  },
];

const CHOICES: Record<string, Bi> = {
  A: { en: 'A — (1) alone', ar: 'A — (١) وحده' },
  B: { en: 'B — (2) alone', ar: 'B — (٢) وحده' },
  C: { en: 'C — both together, neither alone', ar: 'C — معاً، ولا يكفي أيّ منهما' },
  D: { en: 'D — each alone', ar: 'D — كل منهما وحده' },
  E: { en: 'E — not even together', ar: 'E — ولا معاً' },
};

export default function SufficiencyLab({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ question: 0, n1: 3, n2: -3 }, onInteract);
  const question = QUESTIONS[Math.round(values.question) % QUESTIONS.length] ?? QUESTIONS[0];

  const n1 = Math.round(values.n1);
  const n2 = Math.round(values.n2);
  // A small set of "allowed" values per statement, so the verdict is visible.
  const verdictOf = (allowed: number[]) => {
    const answers = new Set(allowed.map((n) => question.test(n)));
    return answers.size === 1 ? 'forced' : 'maybe';
  };

  // Statement 1 allows n1 and its mirror, statement 2 allows n2 and its mirror.
  const set1 = [n1, -n1, Number.isInteger(Math.sqrt(Math.abs(n1))) ? n1 : Math.abs(n1)];
  const set2 = [n2, -n2, Math.abs(n2)];
  const v1 = verdictOf(set1);
  const v2 = verdictOf(set2);
  const both = verdictOf([...set1, ...set2]);
  const answer = v1 === 'forced' && v2 === 'forced' ? 'D' : v1 === 'forced' ? 'A' : v2 === 'forced' ? 'B' : both === 'forced' ? 'C' : 'E';
  const matches = answer === question.answers;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <SegmentedChoice
        label={strings.question}
        value={question.id}
        isRtl={isRtl}
        options={QUESTIONS.map((item) => ({ id: item.id, label: item.label }))}
        onChange={(id) => {
          onInteract();
          set('question', Math.max(0, QUESTIONS.findIndex((item) => item.id === id)));
        }}
      />

      <div className="space-y-1.5 rounded-xl border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] px-3 py-2">
        <p className="font-mono text-[0.78rem] font-bold text-[var(--t-ink)]" dir="ltr">
          {pick(question.label, isRtl)}
        </p>
        <p className="text-[0.72rem] text-[color-mix(in_srgb,var(--t-ink)_65%,transparent)]">
          <strong className="font-bold">(1)</strong> {pick(question.s1, isRtl)}
        </p>
        <p className="text-[0.72rem] text-[color-mix(in_srgb,var(--t-ink)_65%,transparent)]">
          <strong className="font-bold">(2)</strong> {pick(question.s2, isRtl)}
        </p>
      </div>

      <div className="grid gap-1.5 sm:grid-cols-2">
        <Cell label={pick(strings.test1, isRtl)} value={`n = ${n1} → ${question.test(n1)}`} ok={v1 === 'forced'} />
        <Cell label={pick(strings.test2, isRtl)} value={`n = ${n2} → ${question.test(n2)}`} ok={v2 === 'forced'} />
      </div>
      <Slider label={strings.test1} value={n1} min={-6} max={6} step={1} onChange={(value) => set('n1', value)} format={(value) => fmt(value, 0)} />
      <Slider label={strings.test2} value={n2} min={-6} max={6} step={1} onChange={(value) => set('n2', value)} format={(value) => fmt(value, 0)} />

      <div className="space-y-1.5 rounded-xl border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] px-3 py-2">
        <Verdict ok={v1 === 'forced'}>{pick(strings.statement1, isRtl)}: {pick(v1 === 'forced' ? strings.only : strings.maybe, isRtl)}</Verdict>
        <Verdict ok={v2 === 'forced'}>{pick(strings.statement2, isRtl)}: {pick(v2 === 'forced' ? strings.only : strings.maybe, isRtl)}</Verdict>
        <Verdict ok={both === 'forced'}>{pick(strings.together, isRtl)}: {pick(both === 'forced' ? strings.only : strings.maybe, isRtl)}</Verdict>
      </div>

      <div
        className={`rounded-xl border px-3 py-2 ${
          matches
            ? 'border-[color-mix(in_srgb,var(--t-ok,#2a8a57)_55%,transparent)] bg-[color-mix(in_srgb,var(--t-ok,#2a8a57)_8%,transparent)]'
            : 'border-[color-mix(in_srgb,var(--t-warn,#b5481f)_45%,transparent)] bg-[color-mix(in_srgb,var(--t-warn,#b5481f)_6%,transparent)]'
        }`}
      >
        <p className="text-[0.62rem] font-bold uppercase tracking-wider text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">{pick(strings.choice, isRtl)}</p>
        <p className="text-sm font-bold text-[var(--t-ink)]">{pick(CHOICES[answer], isRtl)}</p>
        <p className="mt-0.5 text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_60%,transparent)]">
          {matches ? (isRtl ? 'مطابق للتحليل الرسمي' : 'matches the official analysis') : isRtl ? 'راجع الحالات الحدية' : 'check the edge cases'}
        </p>
      </div>

      <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">{pick(strings.definiteNo, isRtl)}</p>
    </div>
  );
}

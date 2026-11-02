/**
 * GMAT · Data Sufficiency.
 *
 * The workflow the exam actually wants: pick two numbers, check whether the
 * statement accepts them, and see whether they force one answer. A tested
 * value that the statement rejects proves nothing — DS is about the values a
 * statement *allows*, so the readout only counts the accepted ones.
 */
import { useState } from 'react';
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';
import { Verdict } from './parts';

const strings = {
  what: {
    en: 'Test two numbers per statement. If both are accepted and answer differently, the statement fails.',
    ar: 'اختبر عددين لكل شرط. إن قُبلا وكانت إجابتهما مختلفة فالشرط غير كافٍ.',
  },
  question: { en: 'the question', ar: 'السؤال' },
  statement1: { en: 'Statement 1', ar: 'الشرط ١' },
  statement2: { en: 'Statement 2', ar: 'الشرط ٢' },
  test1: { en: 'first test value', ar: 'قيمة الاختبار الأولى' },
  test2: { en: 'second test value', ar: 'قيمة الاختبار الثانية' },
  accepted: { en: 'accepted', ar: 'مقبول' },
  rejected: { en: 'rejected', ar: 'مرفوض' },
  forced: { en: 'one answer only', ar: 'جواب واحد فقط' },
  maybe: { en: 'answers differ', ar: 'الإجابات مختلفة' },
  untested: { en: 'needs one more accepted value', ar: 'تحتاج قيمة مقبولة أخرى' },
  choice: { en: 'answer choice', ar: 'الخيار' },
  together: { en: 'together', ar: 'معاً' },
  reveal: { en: 'Show the official answer', ar: 'أظهر الجواب الرسمي' },
  hide: { en: 'Hide it', ar: 'أخفِه' },
  reason: { en: 'why', ar: 'السبب' },
  matches: { en: 'matches the official answer', ar: 'مطابق للجواب الرسمي' },
  notYet: { en: 'test two values that both fit each statement', ar: 'اختبر قيمتين يقبلهما كل شرط' },
  definiteNo: { en: 'For a yes/no question, a definite “no” is just as sufficient as “yes”.', ar: 'في سؤال نعم/لا، «لا» المؤكدة كافية تماماً كـ«نعم».' },
  noSolve: { en: 'You never need the value — only whether it is forced.', ar: 'لا تحتاج القيمة بل هل هي مُلزَمة.' },
} satisfies Record<string, Bi>;

interface DsQuestion {
  id: string;
  label: Bi;
  s1: Bi;
  s2: Bi;
  /** The question itself, as a yes/no test. */
  ask: (n: number) => 'yes' | 'no';
  /** Does statement 1 accept this number? */
  holds1: (n: number) => boolean;
  holds2: (n: number) => boolean;
  /** Official answer. */
  answer: 'A' | 'B' | 'C' | 'D' | 'E';
  /** One line explaining the official answer. */
  reason: Bi;
}

const isInteger = (n: number) => Number.isInteger(n);

const QUESTIONS: DsQuestion[] = [
  {
    id: 'odd',
    label: { en: 'Is n odd?', ar: 'هل n فردي؟' },
    s1: { en: 'n is not divisible by 2', ar: 'n لا يقبل القسمة على ٢' },
    s2: { en: 'n + 1 is even', ar: 'n + 1 زوجي' },
    ask: (n) => (isInteger(n) && Math.abs(n % 2) === 1 ? 'yes' : 'no'),
    holds1: (n) => isInteger(n) && Math.abs(n % 2) === 1,
    holds2: (n) => isInteger(n + 1) && Math.abs((n + 1) % 2) === 0,
    answer: 'D',
    reason: {
      en: 'Both statements say the same thing in different words, so each one settles it alone.',
      ar: 'الشرطان يقولان الشيء نفسه بصياغتين، فكل منهما يحسم الأمر وحده.',
    },
  },
  {
    id: 'positive',
    label: { en: 'Is n > 0?', ar: 'هل n > 0؟' },
    s1: { en: 'n² > 0', ar: 'n² > 0' },
    s2: { en: 'n³ > 0', ar: 'n³ > 0' },
    ask: (n) => (n > 0 ? 'yes' : 'no'),
    holds1: (n) => n * n > 0,
    holds2: (n) => n * n * n > 0,
    answer: 'B',
    reason: {
      en: 'n² > 0 also allows −3 (answer no), so (1) fails; n³ > 0 forces positive (answer yes).',
      ar: 'الشرط n² > 0 يسمح بـ −3 (الجواب لا) فيفشل، أما n³ > 0 فيُوجب الموجب (الجواب نعم).',
    },
  },
  {
    id: 'integer',
    label: { en: 'Is n an integer?', ar: 'هل n عدد صحيح؟' },
    s1: { en: 'n² is an integer', ar: 'n² عدد صحيح' },
    s2: { en: '2n is an integer', ar: '2n عدد صحيح' },
    ask: (n) => (isInteger(n) ? 'yes' : 'no'),
    holds1: (n) => isInteger(n * n),
    holds2: (n) => isInteger(2 * n),
    answer: 'C',
    reason: {
      en: '√2 has an integer square, and 0.5 doubles to an integer — neither alone works. Together: 2n = k and n² integer force k even, so n = k/2 is an integer.',
      ar: 'جذر ٢ مربعه صحيح، و٠٫٥ ضعفه صحيح — لا يكفي أيّ منهما وحده. معاً: 2n = k و n² صحيح يفرضان k زوجياً فيكون n = k/2 صحيحاً.',
    },
  },
  {
    id: 'zero',
    label: { en: 'Is n ≠ 0?', ar: 'هل n ≠ 0؟' },
    s1: { en: 'n² is positive', ar: 'n² موجب' },
    s2: { en: 'n is even', ar: 'n عدد زوجي' },
    ask: (n) => (n !== 0 ? 'yes' : 'no'),
    holds1: (n) => n * n > 0,
    holds2: (n) => isInteger(n) && Math.abs(n % 2) === 0,
    answer: 'A',
    reason: {
      en: 'n² positive rules out exactly one value, 0, so (1) forces n ≠ 0. Even numbers include 0, so (2) does not.',
      ar: 'كون n² موجباً يستبعد قيمة واحدة هي ٠، فالشرط (١) يفرض n ≠ 0. أما الأعداد الزوجية فتشمل ٠، فالشرط (٢) لا يكفي.',
    },
  },
];

const CHOICES: Record<'A' | 'B' | 'C' | 'D' | 'E', Bi> = {
  A: { en: 'A — (1) alone works', ar: 'A — (١) وحده يكفي' },
  B: { en: 'B — (2) alone works', ar: 'B — (٢) وحده يكفي' },
  C: { en: 'C — only together', ar: 'C — معاً فقط' },
  D: { en: 'D — each alone', ar: 'D — كل منهما وحده' },
  E: { en: 'E — not even together', ar: 'E — ولا معاً' },
};

type VerdictState = 'forced' | 'maybe' | 'untested';

/** A statement is sufficient when every accepted test value gives one answer. */
function judge(question: DsQuestion, holds: (n: number) => boolean, values: number[]): VerdictState {
  const accepted = values.filter(holds);
  if (accepted.length < 2) return 'untested';
  return new Set(accepted.map((n) => question.ask(n))).size === 1 ? 'forced' : 'maybe';
}

export default function SufficiencyLab({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ question: 0, n1: 3, n2: -3 }, onInteract);
  const [revealed, setRevealed] = useState(false);
  const question = QUESTIONS[Math.round(values.question) % QUESTIONS.length] ?? QUESTIONS[0];

  const n1 = values.n1;
  const n2 = values.n2;
  const tested = [n1, n2];

  const v1 = judge(question, question.holds1, tested);
  const v2 = judge(question, question.holds2, tested);
  const both = judge(question, (n) => question.holds1(n) && question.holds2(n), tested);

  const label = (state: VerdictState) =>
    pick(state === 'forced' ? strings.forced : state === 'maybe' ? strings.maybe : strings.untested, isRtl);

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
          setRevealed(false);
          set('question', Math.max(0, QUESTIONS.findIndex((item) => item.id === id)));
        }}
      />

      <div className="space-y-1.5 rounded-xl border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] px-3 py-2">
        <p dir="ltr" className="font-mono text-[0.8rem] font-bold text-[var(--t-ink)]">
          {pick(question.label, isRtl)}
        </p>
        <p className="text-[0.72rem] text-[color-mix(in_srgb,var(--t-ink)_65%,transparent)]">
          <strong className="font-bold">(1)</strong> {pick(question.s1, isRtl)}
        </p>
        <p className="text-[0.72rem] text-[color-mix(in_srgb,var(--t-ink)_65%,transparent)]">
          <strong className="font-bold">(2)</strong> {pick(question.s2, isRtl)}
        </p>
      </div>

      <div dir="ltr" className="grid grid-cols-3 gap-1.5 rounded-xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] p-2 font-mono text-[0.68rem]">
        <span className="font-bold uppercase text-[color-mix(in_srgb,var(--t-ink)_50%,transparent)]">n</span>
        <span className="font-bold uppercase text-[color-mix(in_srgb,var(--t-ink)_50%,transparent)]">(1)</span>
        <span className="font-bold uppercase text-[color-mix(in_srgb,var(--t-ink)_50%,transparent)]">(2)</span>
        {tested.map((n, index) => (
          <div key={`${n}-${index}`} className="contents">
            <span className="font-bold text-[var(--t-ink)]">
              {fmt(n, 1)} → {question.ask(n)}
            </span>
            <span className={question.holds1(n) ? 'text-[#2a8a57]' : 'text-[#b5481f]'}>
              {pick(question.holds1(n) ? strings.accepted : strings.rejected, isRtl)}
            </span>
            <span className={question.holds2(n) ? 'text-[#2a8a57]' : 'text-[#b5481f]'}>
              {pick(question.holds2(n) ? strings.accepted : strings.rejected, isRtl)}
            </span>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.test1} value={n1} min={-6} max={6} step={0.5} onChange={(value) => set('n1', value)} format={(value) => fmt(value, 1)} />
        <Slider label={strings.test2} value={n2} min={-6} max={6} step={0.5} onChange={(value) => set('n2', value)} format={(value) => fmt(value, 1)} />
      </div>

      <div className="space-y-1.5 rounded-xl border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] px-3 py-2">
        <Verdict ok={v1 === 'forced'}>{pick(strings.statement1, isRtl)}: {label(v1)}</Verdict>
        <Verdict ok={v2 === 'forced'}>{pick(strings.statement2, isRtl)}: {label(v2)}</Verdict>
        <Verdict ok={both === 'forced'}>{pick(strings.together, isRtl)}</Verdict>
      </div>

      {revealed ? (
        <div className="space-y-1.5 rounded-xl border border-[color-mix(in_srgb,var(--t-ok,#2a8a57)_45%,transparent)] bg-[color-mix(in_srgb,var(--t-ok,#2a8a57)_7%,transparent)] px-3 py-2">
          <p className="text-[0.62rem] font-bold uppercase tracking-wider text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">
            {pick(strings.choice, isRtl)}
          </p>
          <p className="text-sm font-bold text-[var(--t-ink)]">{pick(CHOICES[question.answer], isRtl)}</p>
          <p className="text-[0.72rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_72%,transparent)]">
            <strong className="font-bold text-[var(--t-ink)]">{pick(strings.reason, isRtl)}: </strong>
            {pick(question.reason, isRtl)}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            onInteract();
            setRevealed(true);
          }}
          className="teach-btn teach-btn-secondary"
        >
          {pick(strings.reveal, isRtl)}
        </button>
      )}

      <p className="text-[0.7rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
        {pick(strings.definiteNo, isRtl)} {pick(strings.noSolve, isRtl)}
      </p>
    </div>
  );
}

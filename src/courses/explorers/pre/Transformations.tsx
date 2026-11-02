/**
 * 2.6 · Transformations of functions.
 *
 * Choose a parent, then stretch, shift and flip it: g(x) = a · f(x − h) + k.
 * The parent stays behind as a dashed ghost and a guide point travels from the
 * parent's key point to its new home.
 */
import { useMemo } from 'react';
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, MathPlot, Point } from '../../viz/MathPlot';
import { Readout, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Stretch by a, slide by h (inside) and k (outside). Watch the guide point.',
    ar: 'كبّر بالمعامل a، وأزح بمقدار h داخلياً و k خارجياً. راقب النقطة الدليلية.',
    },
  stretch: { en: 'stretch a', ar: 'التكبير a' },
  shiftX: { en: 'shift right h', ar: 'الإزاحة يميناً h' },
  shiftY: { en: 'shift up k', ar: 'الإزاحة أعلى k' },
  parent: { en: 'parent f(x)', ar: 'الدالة الأم f(x)' },
  formula: { en: 'g(x)', ar: 'g(x)' },
  guide: { en: 'guide point', ar: 'النقطة الدليلية' },
  flat: { en: 'g(x) is flat: a = 0', ar: 'الدالة مسطحة لأن a = 0' },
} satisfies Record<string, Bi>;

type ParentId = 'square' | 'abs' | 'sqrt' | 'reciprocal';

interface ParentDef {
  id: ParentId;
  label: string;
  f: (x: number) => number;
  guide: [number, number];
  /** Domain of the ghost curve. */
  domain?: [number, number];
}

const PARENTS: ParentDef[] = [
  { id: 'square', label: 'x²', f: (x) => x * x, guide: [0, 0] },
  { id: 'abs', label: '|x|', f: (x) => Math.abs(x), guide: [0, 0] },
  { id: 'sqrt', label: '√x', f: (x) => (x < 0 ? NaN : Math.sqrt(x)), guide: [0, 0], domain: [0, 12] },
  { id: 'reciprocal', label: '1/x', f: (x) => (x === 0 ? NaN : 1 / x), guide: [1, 1] },
];

const CHIPS = {
  en: 'parent',
  ar: 'الأم',
};

export default function Transformations({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set, touched] = useExplorerState({ a: 1, h: 0, k: 0, parent: 0 }, onInteract);
  const parent = PARENTS[Math.round(values.parent)] ?? PARENTS[0];
  const { a, h, k } = values;

  const g = useMemo(() => (x: number) => a * parent.f(x - h) + k, [a, h, k, parent]);
  const guide: [number, number] = [parent.guide[0] + h, a * parent.guide[1] + k];

  const sentence = useMemo(() => {
    const parts: string[] = [];
    if (h !== 0) parts.push(isRtl ? `إزاحة ${fmt(Math.abs(h), 1)} ${h > 0 ? 'يميناً' : 'يساراً'}` : `shift ${fmt(Math.abs(h), 1)} ${h > 0 ? 'right' : 'left'}`);
    if (k !== 0) parts.push(isRtl ? `${fmt(Math.abs(k), 1)} ${k > 0 ? 'أعلى' : 'أسفل'}` : `${fmt(Math.abs(k), 1)} ${k > 0 ? 'up' : 'down'}`);
    if (Math.abs(a) !== 1) parts.push(isRtl ? `تكبير ×${fmt(a, 1)}` : `stretch ×${fmt(a, 1)}`);
    if (a < 0) parts.push(isRtl ? 'انعكاس حول المحور x' : 'reflection in x');
    if (!parts.length) return isRtl ? 'لا تحويل — الدالة كما هي' : 'no change: the parent itself';
    return isRtl ? parts.join(' · ') : parts.join(' · ');
  }, [a, h, k, isRtl]);

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">
        {pick(strings.what, isRtl)}
      </p>

      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={`${pick(strings.parent, isRtl)} ${CHIPS.en}`}>
        {PARENTS.map((option, index) => {
          const active = option.id === parent.id;
          return (
            <button
              key={option.id}
              type="button"
              dir="ltr"
              aria-pressed={active}
              onClick={() => set('parent', index)}
              className={`px-3 py-2 rounded-lg font-mono text-xs font-bold cursor-pointer border transition-colors ${
                active
                  ? 'border-[var(--t-accent)] bg-[color-mix(in_srgb,var(--t-accent)_14%,transparent)] text-[var(--t-accent-deep)]'
                  : 'border-[color-mix(in_srgb,var(--t-ink)_16%,transparent)] bg-transparent text-[var(--t-ink)]'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-6, 6]} yDomain={[-6, 6]} ariaLabel={`${parent.label} · g(x)`}>
          <Curve fn={parent.f} color="var(--t-ink)" dash="5 5" width={1.6} opacity={0.35} from={parent.domain?.[0]} to={parent.domain?.[1]} />
          <Curve fn={g} width={3} />
          <Point x={parent.guide[0]} y={parent.guide[1]} hollow r={4} color="var(--t-ink)" />
          <Point x={guide[0]} y={guide[1]} />
        </MathPlot>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label={strings.stretch} value={a} min={-3} max={3} step={0.1} onChange={(value) => set('a', value)} format={(value) => fmt(value, 1)} />
        <Slider label={strings.shiftX} value={h} min={-4} max={4} step={0.1} onChange={(value) => set('h', value)} format={(value) => fmt(value, 1)} />
        <Slider label={strings.shiftY} value={k} min={-4} max={4} step={0.1} onChange={(value) => set('k', value)} format={(value) => fmt(value, 1)} />
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.formula, isRtl), value: `g(x) = ${fmt(a, 1)}·f(x ${h >= 0 ? '−' : '+'} ${fmt(Math.abs(h), 1)}) ${k >= 0 ? '+' : '−'} ${fmt(Math.abs(k), 1)}`, emphasis: true },
          { label: pick(strings.guide, isRtl), value: `(${fmt(guide[0], 1)}, ${fmt(guide[1], 1)})` },
          { label: '—', value: a === 0 ? pick(strings.flat, isRtl) : sentence },
        ]}
      />

      {!touched && (
        <p className="text-[0.72rem] text-[color-mix(in_srgb,var(--t-ink)_60%,transparent)]">
          {isRtl ? 'اسحب أي شريط لبدء التجربة.' : 'Drag any slider to start.'}
        </p>
      )}
    </div>
  );
}

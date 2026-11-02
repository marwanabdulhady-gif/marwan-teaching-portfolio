/**
 * 1.8 · Inequalities.
 *
 * Move the boundary and flip the relation: the circle opens or closes and the
 * shading changes side. The interval notation is written out below.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Label, MathPlot, Region, Segment, usePlotScale } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'The symbol decides two things: whether the endpoint counts, and which way the shading runs.',
    ar: 'الرمز يحدد أمرين: هل تُحسب نقطة الطرف، وأي جهة تُظلَّل.',
  },
  boundary: { en: 'boundary c', ar: 'الحد c' },
  relation: { en: 'relation', ar: 'العلاقة' },
  interval: { en: 'interval', ar: 'الفترة' },
  words: { en: 'in words', ar: 'بالكلمات' },
  included: { en: 'endpoint included', ar: 'الطرف محسوب' },
} satisfies Record<string, Bi>;

type Relation = 'lt' | 'le' | 'gt' | 'ge';

const SYMBOL: Record<Relation, string> = { lt: '<', le: '≤', gt: '>', ge: '≥' };

/**
 * The boundary point plus its drag/keyboard surface. It needs the plot scale,
 * so it lives inside `<MathPlot>`; everything here is in data coordinates.
 */
function Boundary({
  c,
  closed,
  onSet,
  ariaLabel,
}: {
  c: number;
  closed: boolean;
  onSet: (value: number) => void;
  ariaLabel: string;
}) {
  const scale = usePlotScale();
  const cx = scale.x(c);
  const cy = scale.y(0);
  const nudge = (next: number) => onSet(Math.round(Math.min(10, Math.max(-10, next)) * 2) / 2);

  return (
    <>
      <circle cx={cx} cy={cy} r={7} fill={closed ? 'var(--t-accent)' : 'var(--t-bg)'} stroke="var(--t-accent)" strokeWidth={2.5} />
      <g
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={-10}
        aria-valuemax={10}
        aria-valuenow={c}
        style={{ cursor: 'ew-resize', touchAction: 'none', outline: 'none' }}
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
          if (!rect) return;
          nudge(scale.ix(((event.clientX - rect.left) / rect.width) * scale.width));
        }}
        onKeyDown={(event) => {
          const delta = event.shiftKey ? 2 : 0.5;
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            event.preventDefault();
            nudge(c + delta);
          } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            event.preventDefault();
            nudge(c - delta);
          }
        }}
      >
        <circle cx={cx} cy={cy} r={14} fill="transparent" />
      </g>
    </>
  );
}

export default function InequalityLine({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ c: 2, relation: 1 }, onInteract);
  const c = values.c;
  const relation: Relation = (['lt', 'le', 'gt', 'ge'] as const)[Math.round(values.relation)] ?? 'le';
  const right = relation === 'lt' || relation === 'le';
  const closed = relation === 'le' || relation === 'ge';

  const interval = right
    ? `${closed ? '[' : '('}${fmt(c, 1)}, ∞)`
    : `(−∞, ${fmt(c, 1)}${closed ? ']' : ')'}`;

  const DOMAIN: [number, number] = [-10, 10];

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        {/* The line sits on y = 0, the middle row, so the band, the circle and
            the tick labels all fall inside the 400 × 125 viewBox. */}
        <MathPlot xDomain={DOMAIN} yDomain={[-1, 1]} aspect={16 / 5} grid={false} axes={false} ariaLabel={`x ${SYMBOL[relation]} ${fmt(c, 1)}`}>
          <Region
            from={right ? c : DOMAIN[0]}
            to={right ? DOMAIN[1] : c}
            top={() => 0.28}
            bottom={() => -0.28}
          />
          <Segment x1={DOMAIN[0]} y1={0} x2={DOMAIN[1]} y2={0} width={2} opacity={0.45} />
          {[-10, -5, 0, 5, 10].map((tick) => (
            <g key={tick}>
              <Segment x1={tick} y1={0.16} x2={tick} y2={-0.16} width={2} opacity={0.5} />
              <Label x={tick} y={-0.42} opacity={0.6}>
                {tick}
              </Label>
            </g>
          ))}
          <Boundary c={c} closed={closed} onSet={(value) => set('c', value)} ariaLabel={pick(strings.boundary, isRtl)} />
        </MathPlot>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <SegmentedChoice
          label={strings.relation}
          value={relation}
          isRtl={isRtl}
          options={[
            { id: 'lt', label: { en: 'x < c', ar: 'x < c' } },
            { id: 'le', label: { en: 'x ≤ c', ar: 'x ≤ c' } },
            { id: 'gt', label: { en: 'x > c', ar: 'x > c' } },
            { id: 'ge', label: { en: 'x ≥ c', ar: 'x ≥ c' } },
          ]}
          onChange={(next) => set('relation', (['lt', 'le', 'gt', 'ge'] as const).indexOf(next))}
        />
        <Readout
          dir={isRtl ? 'rtl' : 'ltr'}
          rows={[
            { label: pick(strings.interval, isRtl), value: interval, emphasis: true },
            { label: pick(strings.boundary, isRtl), value: fmt(c, 1) },
            { label: pick(strings.included, isRtl), value: closed ? (isRtl ? 'نعم' : 'yes') : isRtl ? 'لا' : 'no' },
          ]}
        />
      </div>
    </div>
  );
}

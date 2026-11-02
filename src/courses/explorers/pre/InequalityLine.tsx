/**
 * 1.8 · Inequalities.
 *
 * Move the boundary and flip the relation: the circle opens or closes and the
 * shading changes side. The interval notation is written out below.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { MathPlot, Point } from '../../viz/MathPlot';
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
  const START = 0;
  const END = 400;
  const px = (x: number) => START + ((x - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])) * END;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={DOMAIN} yDomain={[-2.5, 2.5]} aspect={16 / 5} grid={false} ariaLabel={`x ${SYMBOL[relation]} ${fmt(c, 1)}`}>
          <rect
            x={right ? px(c) : 0}
            y={104}
            width={right ? 400 - px(c) : px(c)}
            height={32}
            fill="var(--t-accent)"
            fillOpacity={0.16}
          />
          <line x1={0} y1={120} x2={400} y2={120} stroke="var(--t-ink)" strokeOpacity={0.45} strokeWidth={2} />
          {[-10, -5, 0, 5, 10].map((tick) => (
            <g key={tick}>
              <line x1={px(tick)} y1={113} x2={px(tick)} y2={127} stroke="var(--t-ink)" strokeOpacity={0.5} strokeWidth={2} />
              <text x={px(tick)} y={146} textAnchor="middle" fontSize={10} fill="var(--t-ink)" fillOpacity={0.6} fontFamily="ui-monospace, monospace">
                {tick}
              </text>
            </g>
          ))}
          <circle
            cx={px(c)}
            cy={120}
            r={7}
            fill={closed ? 'var(--t-accent)' : 'var(--t-bg)'}
            stroke="var(--t-accent)"
            strokeWidth={2.5}
          />
          <Point x={c} y={-1.6} r={0.1} color="transparent" />
          <g
            role="slider"
            tabIndex={0}
            aria-label={pick(strings.boundary, isRtl)}
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
              const raw = -10 + (((event.clientX - rect.left) / rect.width) * 400 / 400) * 20;
              set('c', Math.round(Math.min(10, Math.max(-10, raw)) * 2) / 2);
            }}
            onKeyDown={(event) => {
              const delta = event.shiftKey ? 2 : 0.5;
              if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
                event.preventDefault();
                set('c', Math.min(10, c + delta));
              } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
                event.preventDefault();
                set('c', Math.max(-10, c - delta));
              }
            }}
          >
            <circle cx={px(c)} cy={120} r={14} fill="transparent" />
          </g>
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

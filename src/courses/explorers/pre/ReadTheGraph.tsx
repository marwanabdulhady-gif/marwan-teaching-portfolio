/**
 * 2.3 · Getting information from the graph.
 *
 * Drag P along a fixed cubic. Intervals of increase are shaded one colour, of
 * decrease another, and the local extrema and zeros are marked.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Curve, MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Walk the graph left to right: note where it climbs, where it falls, and where it turns.',
    ar: 'امشِ على المنحنى من اليسار لليمين: أين يصعد، وأين يهبط، وأين يستدير.',
  },
  point: { en: 'point P', ar: 'النقطة P' },
  value: { en: 'f(x)', ar: 'f(x)' },
  trend: { en: 'behaviour', ar: 'السلوك' },
  rising: { en: 'increasing', ar: 'تزايد' },
  falling: { en: 'decreasing', ar: 'تناقص' },
  zeros: { en: 'zeros', ar: 'الأصفار' },
  extrema: { en: 'turning points', ar: 'نقاط الاستدارة' },
} satisfies Record<string, Bi>;

/** A cubic with two turning points, chosen so the marks land on whole numbers. */
const f = (x: number) => x * x * x - 3 * x;
const df = (x: number) => 3 * x * x - 3;
const TURNS: [number, number][] = [
  [-1, f(-1)],
  [1, f(1)],
];
const ZEROS = [-Math.sqrt(3), 0, Math.sqrt(3)];

export default function ReadTheGraph({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ x: 0.4 }, onInteract);
  const x = values.x;
  const y = f(x);
  const slope = df(x);
  const trend = Math.abs(slope) < 0.15 ? (isRtl ? 'قمة أو قاع' : 'turning') : slope > 0 ? pick(strings.rising, isRtl) : pick(strings.falling, isRtl);

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-3, 3]} yDomain={[-4, 4]} aspect={1} ariaLabel="f(x) = x³ − 3x">
          {/* increasing on (−∞, −1) and (1, ∞) */}
          <rect x={0} y={0} width={133.33} height={400} fill="var(--t-accent)" fillOpacity={0.07} />
          <rect x={266.67} y={0} width={133.33} height={400} fill="var(--t-accent)" fillOpacity={0.07} />
          {/* decreasing between the turning points */}
          <rect x={133.33} y={0} width={133.33} height={400} fill="var(--t-sky)" fillOpacity={0.09} />
          <Curve fn={f} width={3} />
          {TURNS.map(([tx, ty]) => (
            <Point key={tx} x={tx} y={ty} r={4} color="var(--t-sky)" />
          ))}
          {ZEROS.map((zx) => (
            <g key={zx}>
              <circle cx={200 + zx * (400 / 6)} cy={200} r={3.5} fill="var(--t-ink)" fillOpacity={0.6} />
            </g>
          ))}
          <Segment x1={x} y1={0} x2={x} y2={y} color="var(--t-ink)" dash="3 3" opacity={0.4} />
          <Point x={x} y={y} r={6} />
          <g
            role="slider"
            tabIndex={0}
            aria-label={pick(strings.point, isRtl)}
            aria-valuemin={-2.6}
            aria-valuemax={2.6}
            aria-valuenow={Number(x.toFixed(2))}
            style={{ cursor: 'ew-resize', touchAction: 'none', outline: 'none' }}
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
              const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
              if (!rect) return;
              const raw = -3 + ((event.clientX - rect.left) / rect.width) * 6;
              set('x', Math.round(Math.min(2.6, Math.max(-2.6, raw)) * 20) / 20);
            }}
            onKeyDown={(event) => {
              const delta = event.shiftKey ? 0.5 : 0.05;
              if (event.key === 'ArrowRight') {
                event.preventDefault();
                set('x', Math.min(2.6, x + delta));
              } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                set('x', Math.max(-2.6, x - delta));
              }
            }}
          >
            <circle cx={200 + x * (400 / 6)} cy={200 - y * 50} r={13} fill="transparent" />
          </g>
        </MathPlot>
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.point, isRtl), value: `(${fmt(x, 2)}, ${fmt(y, 2)})` },
          { label: pick(strings.value, isRtl), value: fmt(y, 2) },
          { label: pick(strings.trend, isRtl), value: trend, emphasis: true },
          { label: pick(strings.zeros, isRtl), value: '−√3, 0, √3' },
          { label: pick(strings.extrema, isRtl), value: `(−1, ${fmt(f(-1), 1)}) · (1, ${fmt(f(1), 1)})` },
        ]}
      />
    </div>
  );
}

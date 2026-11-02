/**
 * 1.3 · Algebraic expressions.
 *
 * (x + a)(x + b) as four rectangles. The sliders move the sides; negative
 * values flip a tile into a hatched "subtract" tile, which is exactly what the
 * expansion says.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Readout, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt, signed } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Cut a rectangle into four pieces: x·x, x·b, a·x and a·b. Multiply out to see the same four terms.',
    ar: 'اقسم المستطيل إلى أربعة أجزاء: x·x و x·b و a·x و a·b. اضرب لترى الحدود الأربعة نفسها.',
  },
  a: { en: 'a', ar: 'a' },
  b: { en: 'b', ar: 'b' },
  expanded: { en: 'expanded', ar: 'بعد النشر' },
  factored: { en: 'factored', ar: 'بعد التحليل' },
  x: { en: 'x = 6 (fixed)', ar: 'x = 6 (ثابت)' },
  negative: { en: 'hatched = subtract', ar: 'مظلل = طرح' },
} satisfies Record<string, Bi>;

const X = 6;

export default function AreaModel({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ a: 2, b: 3 }, onInteract);
  const { a, b } = values;

  const area = (X + a) * (X + b);
  // Tiles in "unit space": x runs 0…X, the a-part sits beside it (and may be
  // negative), likewise for y and b. Negatives simply flip to the other side.
  const tiles = [
    { key: 'xx', x0: 0, y0: 0, x1: X, y1: X, label: 'x·x', negative: false, tone: 0.2 },
    { key: 'xb', x0: X, y0: 0, x1: X + a, y1: X, label: 'x·b', negative: a < 0, tone: 0.13 },
    { key: 'ax', x0: 0, y0: X, x1: X, y1: X + b, label: 'a·x', negative: b < 0, tone: 0.13 },
    { key: 'ab', x0: X, y0: X, x1: X + a, y1: X + b, label: 'a·b', negative: a * b < 0, tone: 0.07 },
  ];

  const left = Math.min(0, X, X + a);
  const right = Math.max(0, X, X + a);
  const bottom = Math.min(0, X, X + b);
  const top = Math.max(0, X, X + b);
  const span = Math.max(right - left, top - bottom, 1);
  const unit = 240 / span;
  const pad = 16;
  const toPx = (x: number, y: number) => [pad + (x - left) * unit, pad + (top - y) * unit] as const;
  const width = (right - left) * unit + pad * 2;
  const height = (top - bottom) * unit + pad * 2;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="flex justify-center rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full max-w-[300px]"
          role="img"
          aria-label={`(x ${signed(a, 0)})(x ${signed(b, 0)})`}
        >
          <defs>
            <pattern id="area-hatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#b5481f" strokeWidth="2" strokeOpacity="0.55" />
            </pattern>
          </defs>
          {tiles.map((tile) => {
            const [px0, py0] = toPx(Math.min(tile.x0, tile.x1), Math.max(tile.y0, tile.y1));
            const [px1, py1] = toPx(Math.max(tile.x0, tile.x1), Math.min(tile.y0, tile.y1));
            const w = Math.max(px1 - px0, 0);
            const h = Math.max(py1 - py0, 0);
            return (
              <g key={tile.key}>
                <rect
                  x={px0}
                  y={py0}
                  width={w}
                  height={h}
                  fill={tile.negative ? 'url(#area-hatch)' : `color-mix(in srgb, var(--t-accent) ${tile.tone * 100}%, transparent)`}
                  stroke="var(--t-ink)"
                  strokeOpacity={0.45}
                  strokeWidth={1.2}
                />
                <text
                  x={px0 + w / 2}
                  y={py0 + h / 2 + 4}
                  textAnchor="middle"
                  fontSize={10}
                  fontFamily="ui-monospace, monospace"
                  fill="var(--t-ink)"
                  fillOpacity={0.8}
                >
                  {tile.label}
                </text>
              </g>
            );
          })}
          <text x={width - pad} y={height - 4} textAnchor="end" fontSize={9} fill="var(--t-ink)" fillOpacity={0.5} fontFamily="ui-monospace, monospace">
            area = {fmt(area, 0)}
          </text>
        </svg>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.a} value={a} min={-5} max={5} step={1} onChange={(value) => set('a', value)} format={(value) => fmt(value, 0)} />
        <Slider label={strings.b} value={b} min={-5} max={5} step={1} onChange={(value) => set('b', value)} format={(value) => fmt(value, 0)} />
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.factored, isRtl), value: `(x ${signed(a, 0)})(x ${signed(b, 0)})` },
          { label: pick(strings.expanded, isRtl), value: `x² ${signed(a + b, 0)}x ${signed(a * b, 0)}`, emphasis: true },
          { label: pick(strings.x, isRtl), value: `(${X} ${signed(a, 0)})(${X} ${signed(b, 0)}) = ${area}` },
        ]}
      />

      <p className="text-[0.68rem] text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">{pick(strings.negative, isRtl)}</p>
    </div>
  );
}

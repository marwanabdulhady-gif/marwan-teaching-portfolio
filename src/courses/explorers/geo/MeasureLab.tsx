/**
 * Geometry · 3.2, 3.4 and 4.3 — area and perimeter of flat shapes, volume and
 * surface area of solids, and geometric probability as an area ratio.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Readout, SegmentedChoice, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Every measurement here is the same two numbers combined differently: a length, and a length squared (or cubed).',
    ar: 'كل قياس هنا ناتج دمج الرقمين نفسهما بطرق مختلفة: طول، وطول مربع (أو مكعب).',
  },
  shape: { en: 'shape', ar: 'الشكل' },
  w: { en: 'width / base', ar: 'العرض / القاعدة' },
  h: { en: 'height', ar: 'الارتفاع' },
  r: { en: 'radius', ar: 'نصف القطر' },
  area: { en: 'area', ar: 'المساحة' },
  perimeter: { en: 'perimeter', ar: 'المحيط' },
  volume: { en: 'volume', ar: 'الحجم' },
  surface: { en: 'surface area', ar: 'المساحة السطحية' },
  probability: { en: 'probability of landing inside', ar: 'احتمال السقوط داخل' },
  target: { en: 'target size', ar: 'حجم الهدف' },
  board: { en: 'board', ar: 'اللوحة' },
} satisfies Record<string, Bi>;

type ShapeId = 'rectangle' | 'triangle' | 'trapezoid' | 'circle';
type SolidId = 'cylinder' | 'cone' | 'sphere';

export default function MeasureLab({ lesson, onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ shape: 0, w: 6, h: 4, r: 3, solid: 0 }, onInteract);

  if (lesson.id === '3-4') {
    const solid = (['cylinder', 'cone', 'sphere'] as const)[Math.round(values.solid)] ?? 'cylinder';
    const r = values.r;
    const h = Math.max(1, values.h);
    const unit = 20;
    const volume = solid === 'cylinder' ? Math.PI * r * r * h : solid === 'cone' ? (Math.PI * r * r * h) / 3 : (4 / 3) * Math.PI * r ** 3;
    const surface = solid === 'cylinder' ? 2 * Math.PI * r * (r + h) : solid === 'cone' ? Math.PI * r * (r + Math.hypot(r, h)) : 4 * Math.PI * r * r;

    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
        <SegmentedChoice
          label={strings.shape}
          value={solid}
          isRtl={isRtl}
          options={[
            { id: 'cylinder', label: { en: 'cylinder', ar: 'أسطوانة' } },
            { id: 'cone', label: { en: 'cone', ar: 'مخروط' } },
            { id: 'sphere', label: { en: 'sphere', ar: 'كرة' } },
          ]}
          onChange={(id) => set('solid', (['cylinder', 'cone', 'sphere'] as const).indexOf(id))}
        />
        <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-3">
          <svg viewBox="0 0 300 300" className="mx-auto h-auto w-full max-w-[260px]" role="img" aria-label={pick(strings.volume, isRtl)}>
            {solid === 'sphere' ? (
              <>
                <circle cx={150} cy={150} r={unit * r} fill="color-mix(in srgb, var(--t-accent) 14%, transparent)" stroke="var(--t-accent)" strokeWidth={2.5} />
                <ellipse cx={150} cy={150} rx={unit * r} ry={unit * r * 0.3} fill="none" stroke="var(--t-accent)" strokeOpacity={0.45} strokeDasharray="5 4" />
                <line x1={150} y1={150} x2={150 + unit * r * 0.72} y2={150 - unit * r * 0.72} stroke="var(--t-ink)" strokeWidth={1.5} />
                <text x={150 + unit * r * 0.45} y={150 - unit * r * 0.5} fontSize={11} fill="var(--t-ink)" fontFamily="ui-monospace, monospace">r</text>
              </>
            ) : (
              <>
                {/* base at y = 260, so height has room for h up to 10 */}
                <line x1={150 - unit * r} y1={260} x2={150 + unit * r} y2={260} stroke="var(--t-accent)" strokeWidth={2.5} />
                <path
                  d={
                    solid === 'cone'
                      ? `M150,${260 - unit * h} L${150 - unit * r},260 A${unit * r},${unit * r * 0.28} 0 0 0 ${150 + unit * r},260 Z`
                      : `M${150 - unit * r},${260 - unit * h} L${150 - unit * r},260 A${unit * r},${unit * r * 0.28} 0 0 0 ${150 + unit * r},260 L${150 + unit * r},${260 - unit * h} Z`
                  }
                  fill="color-mix(in srgb, var(--t-accent) 12%, transparent)"
                  stroke="var(--t-accent)"
                  strokeWidth={2.5}
                />
                {solid === 'cylinder' && (
                  <ellipse cx={150} cy={260 - unit * h} rx={unit * r} ry={unit * r * 0.28} fill="none" stroke="var(--t-accent)" strokeWidth={2.5} />
                )}
                <line x1={150} y1={260} x2={150 + unit * r} y2={260} stroke="var(--t-ink)" strokeWidth={1.5} strokeDasharray="4 3" />
                <text x={150 + unit * r * 0.5} y={256} fontSize={11} fill="var(--t-ink)" fontFamily="ui-monospace, monospace">r</text>
                <line x1={150 + unit * r + 14} y1={260} x2={150 + unit * r + 14} y2={260 - unit * h} stroke="var(--t-ink)" strokeWidth={1.5} strokeDasharray="4 3" />
                <text x={150 + unit * r + 18} y={260 - unit * h / 2} fontSize={11} fill="var(--t-ink)" fontFamily="ui-monospace, monospace">h</text>
              </>
            )}
          </svg>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Slider label={strings.r} value={r} min={1} max={5} step={0.5} onChange={(value) => set('r', value)} format={(value) => fmt(value, 1)} />
          <Slider label={strings.h} value={h} min={1} max={10} step={0.5} onChange={(value) => set('h', value)} format={(value) => fmt(value, 1)} />
        </div>
        <Readout
          dir="ltr"
          rows={[
            { label: pick(strings.volume, isRtl), value: fmt(volume, 2), emphasis: true },
            { label: pick(strings.surface, isRtl), value: fmt(surface, 2) },
            {
              label: 'formula',
              value:
                solid === 'cylinder'
                  ? 'V = πr²h · SA = 2πr(r + h)'
                  : solid === 'cone'
                    ? 'V = ⅓πr²h · SA = πr(r + ℓ)'
                    : 'V = 4/3 πr³ · SA = 4πr²',
            },
          ]}
        />
        <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
          {isRtl ? 'الأسطوانة والمخروط لهما القاعدة والارتفاع نفساهما: حجم المخروط ثلث الأسطوانة دائماً.' : 'Same base and height: the cone is always one third of the cylinder.'}
        </p>
      </div>
    );
  }

  if (lesson.id === '4-3') {
    const board = 10;
    const target = values.r * 2;
    const probability = (target * target) / (board * board);
    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
        <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-3">
          <svg viewBox="0 0 300 300" className="mx-auto h-auto w-full max-w-[260px]" role="img" aria-label={pick(strings.probability, isRtl)}>
            <rect x={10} y={10} width={280} height={280} fill="var(--t-ink)" fillOpacity={0.06} stroke="var(--t-ink)" strokeOpacity={0.4} />
            <rect
              x={150 - (target * 280) / board / 2}
              y={150 - (target * 280) / board / 2}
              width={(target * 280) / board}
              height={(target * 280) / board}
              fill="var(--t-accent)"
              fillOpacity={0.25}
              stroke="var(--t-accent)"
              strokeWidth={2}
            />
            <text x={150} y={292} textAnchor="middle" fontSize={10} fill="var(--t-ink)" fillOpacity={0.6} fontFamily="ui-monospace, monospace">
              10 × 10 board
            </text>
          </svg>
        </div>
        <Slider label={strings.target} value={values.r} min={0.5} max={5} step={0.5} onChange={(value) => set('r', value)} format={(value) => fmt(value * 2, 1)} />
        <Readout
          dir="ltr"
          rows={[
            { label: pick(strings.probability, isRtl), value: fmt(probability, 3), emphasis: true },
            { label: 'target area', value: fmt(target * target, 2) },
            { label: pick(strings.board, isRtl), value: `${board * board}` },
          ]}
        />
      </div>
    );
  }

  const shape = (['rectangle', 'triangle', 'trapezoid', 'circle'] as const)[Math.round(values.shape)] ?? 'rectangle';
  const { w, h, r } = values;
  const area = shape === 'rectangle' ? w * h : shape === 'triangle' ? (w * h) / 2 : shape === 'trapezoid' ? ((w + h) / 2) * 3 : Math.PI * r * r;
  const perimeter = shape === 'rectangle' ? 2 * (w + h) : shape === 'triangle' ? w + h + Math.hypot(w, h) : shape === 'trapezoid' ? w + h + 3 + 3 : 2 * Math.PI * r;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>
      <SegmentedChoice
        label={strings.shape}
        value={shape}
        isRtl={isRtl}
        options={[
          { id: 'rectangle', label: { en: 'rectangle', ar: 'مستطيل' } },
          { id: 'triangle', label: { en: 'triangle', ar: 'مثلث' } },
          { id: 'trapezoid', label: { en: 'trapezoid', ar: 'شبه منحرف' } },
          { id: 'circle', label: { en: 'circle', ar: 'دائرة' } },
        ]}
        onChange={(id) => set('shape', (['rectangle', 'triangle', 'trapezoid', 'circle'] as const).indexOf(id))}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {shape === 'circle' ? (
          <Slider label={strings.r} value={r} min={0.5} max={6} step={0.5} onChange={(value) => set('r', value)} format={(value) => fmt(value, 1)} />
        ) : (
          <>
            <Slider label={strings.w} value={w} min={1} max={10} step={0.5} onChange={(value) => set('w', value)} format={(value) => fmt(value, 1)} />
            <Slider label={strings.h} value={h} min={1} max={10} step={0.5} onChange={(value) => set('h', value)} format={(value) => fmt(value, 1)} />
          </>
        )}
      </div>
      <Readout
        dir="ltr"
        rows={[
          { label: pick(strings.area, isRtl), value: fmt(area, 2), emphasis: true },
          { label: pick(strings.perimeter, isRtl), value: fmt(perimeter, 2) },
          {
            label: 'formula',
            value:
              shape === 'rectangle'
                ? 'A = wh · P = 2(w + h)'
                : shape === 'triangle'
                  ? 'A = ½bh'
                  : shape === 'trapezoid'
                    ? 'A = ½(b₁ + b₂)h'
                    : 'A = πr² · C = 2πr',
          },
        ]}
      />
    </div>
  );
}

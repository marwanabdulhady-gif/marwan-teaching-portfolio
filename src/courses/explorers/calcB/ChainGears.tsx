/**
 * 2.4 · The chain rule.
 *
 * Three meshed gears: x → u → y. Each ratio is a gear's tooth count, and the
 * output rate is the product of the ratios.
 */
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { Readout, Slider, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'Turn x once. The middle gear turns by du/dx, and the last gear turns by the product of both ratios.',
    ar: 'أدر x دورة واحدة. تدور الترس الأوسط بمقدار du/dx، ويدور الترس الأخير بضرب النسبتين.',
  },
  outer: { en: 'dy/du', ar: 'dy/du' },
  inner: { en: 'du/dx', ar: 'du/dx' },
  total: { en: 'dy/dx = dy/du · du/dx', ar: 'dy/dx = dy/du · du/dx' },
  inputs: { en: 'rates', ar: 'المعدلات' },
  teeth: { en: 'teeth', ar: 'الأسنان' },
  compose: { en: 'composed', ar: 'مركبة' },
} satisfies Record<string, Bi>;

const GEARS = [
  { id: 'x', label: 'x', teeth: 12, color: 'var(--t-accent)' },
  { id: 'u', label: 'u', teeth: 18, color: 'var(--t-sky)' },
  { id: 'y', label: 'y', teeth: 9, color: 'var(--t-sun)' },
];

export default function ChainGears({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set] = useExplorerState({ outer: 2, inner: 3 }, onInteract);
  const outer = values.outer;
  const inner = values.inner;
  const total = outer * inner;

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-3">
        <svg viewBox="0 0 320 120" className="h-auto w-full" role="img" aria-label="three meshed gears">
          {GEARS.map((gear, index) => {
            const cx = 60 + index * 100;
            const r = 26;
            const spokes = Math.max(6, Math.round(gear.teeth / 2));
            return (
              <g key={gear.id}>
                {Array.from({ length: spokes }, (_, spoke) => {
                  const angle = (spoke / spokes) * Math.PI * 2;
                  return (
                    <line
                      key={spoke}
                      x1={cx}
                      y1={60}
                      x2={cx + (r + 6) * Math.cos(angle)}
                      y2={60 + (r + 6) * Math.sin(angle)}
                      stroke={gear.color}
                      strokeWidth={4}
                      strokeLinecap="round"
                      strokeOpacity={0.8}
                    />
                  );
                })}
                <circle cx={cx} cy={60} r={r} fill="var(--t-bg)" stroke={gear.color} strokeWidth={3} />
                <text x={cx} y={65} textAnchor="middle" fontSize={16} fontWeight={800} fontFamily="ui-monospace, monospace" fill="var(--t-ink)">
                  {gear.label}
                </text>
                {index > 0 && (
                  <text x={cx - 50} y={30} textAnchor="middle" fontSize={10} fontFamily="ui-monospace, monospace" fill="var(--t-ink)" fillOpacity={0.65}>
                    ×{fmt(index === 1 ? inner : outer, 1)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={strings.inner} value={inner} min={-4} max={4} step={0.5} onChange={(value) => set('inner', value)} format={(value) => fmt(value, 2)} />
        <Slider label={strings.outer} value={outer} min={-4} max={4} step={0.5} onChange={(value) => set('outer', value)} format={(value) => fmt(value, 2)} />
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.inner, isRtl), value: fmt(inner, 2) },
          { label: pick(strings.outer, isRtl), value: fmt(outer, 2) },
          { label: pick(strings.total, isRtl), value: `${fmt(outer, 2)} × ${fmt(inner, 2)} = ${fmt(total, 2)}`, emphasis: true },
          { label: 'y = (3x + 1)²', value: `dy/dx = 2(3x + 1) · 3 = ${fmt(6, 0)}(3x + 1)` },
        ]}
      />
      <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">
        {pick(strings.compose, isRtl)}: {isRtl ? 'المشتقة الخارجية × المشتقة الداخلية، بترتيب لا يهم.' : 'outer derivative × inner derivative, and the order does not matter.'}
      </p>
    </div>
  );
}

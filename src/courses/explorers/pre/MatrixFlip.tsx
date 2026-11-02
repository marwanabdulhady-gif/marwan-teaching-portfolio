/**
 * 6.x · Matrices and geometric transformations.
 *
 * Type a 2×2 matrix (or pick a preset) and watch the unit square map to a
 * parallelogram. The determinant is the area scale — and its sign tells you
 * whether the plane was flipped.
 */
import { useState } from 'react';
import type { Bi } from '../../../teachingData';
import { useLocale } from '../../../LocaleContext';
import { MathPlot, Point, Segment } from '../../viz/MathPlot';
import { Readout, SegmentedChoice, pick, useExplorerState } from '../../viz/controls';
import { fmt } from '../../viz/format';
import type { ExplorerProps } from '../types';

const strings = {
  what: {
    en: 'The columns of the matrix are where the two unit arrows land. The determinant is the new area.',
    ar: 'أعمدة المصفوفة هي أين يهبط سهمَا الوحدة. والمحدد هو المساحة الجديدة.',
  },
  a: { en: 'a', ar: 'a' },
  b: { en: 'b', ar: 'b' },
  c: { en: 'c', ar: 'c' },
  d: { en: 'd', ar: 'd' },
  determinant: { en: 'determinant', ar: 'المحدد' },
  area: { en: 'area scale', ar: 'معامل المساحة' },
  preset: { en: 'preset', ar: 'اختيار جاهز' },
  orientation: { en: 'orientation', ar: 'الاتجاه' },
  kept: { en: 'kept', ar: 'محفوظ' },
  flipped: { en: 'flipped', ar: 'معكوس' },
  flat: { en: 'collapsed to a line', ar: 'انهار إلى خط' },
  unit: { en: 'unit square', ar: 'مربع الوحدة' },
} satisfies Record<string, Bi>;

type PresetId = 'identity' | 'rotate' | 'shear' | 'scale' | 'flip' | 'project';

const PRESETS: { id: PresetId; label: Bi; m: [number, number, number, number] }[] = [
  { id: 'identity', label: { en: 'identity', ar: 'الوحدة' }, m: [1, 0, 0, 1] },
  { id: 'rotate', label: { en: 'rotate 30°', ar: 'دوران ٣٠°' }, m: [0.87, 0.5, -0.5, 0.87] },
  { id: 'shear', label: { en: 'shear', ar: 'قص' }, m: [1, 0, 1.5, 1] },
  { id: 'scale', label: { en: 'scale ×2, ×0.5', ar: 'تكبير ×٢، ×٠٫٥' }, m: [2, 0, 0, 0.5] },
  { id: 'flip', label: { en: 'flip', ar: 'انعكاس' }, m: [-1, 0, 0, 1] },
  { id: 'project', label: { en: 'collapse', ar: 'انهيار' }, m: [1, 1, 1, 1] },
];

const CELLS: { key: 'a' | 'b' | 'c' | 'd'; label: Bi }[] = [
  { key: 'a', label: strings.a },
  { key: 'b', label: strings.b },
  { key: 'c', label: strings.c },
  { key: 'd', label: strings.d },
];

export default function MatrixFlip({ onInteract }: ExplorerProps) {
  const { isRtl } = useLocale();
  const [values, set, touched] = useExplorerState({ a: 1, b: 0, c: 0, d: 1 }, onInteract);
  const [preset, setPreset] = useState<PresetId>('identity');
  const { a, b, c, d } = values;
  const det = a * d - b * c;

  const applyPreset = (id: PresetId) => {
    const found = PRESETS.find((item) => item.id === id);
    if (!found) return;
    setPreset(id);
    set('a', found.m[0]);
    set('b', found.m[1]);
    set('c', found.m[2]);
    set('d', found.m[3]);
  };

  const image: [number, number][] = [
    [0, 0],
    [a, c],
    [a + b, c + d],
    [b, d],
  ];
  const polygon = image.map(([x, y]) => `${200 + x * 30},${200 - y * 30}`).join(' ');

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">{pick(strings.what, isRtl)}</p>

      <SegmentedChoice
        label={strings.preset}
        value={preset}
        isRtl={isRtl}
        options={PRESETS.map((item) => ({ id: item.id, label: item.label }))}
        onChange={applyPreset}
      />

      <div dir="ltr" className="rounded-2xl border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)] p-2">
        <MathPlot xDomain={[-3, 3]} yDomain={[-3, 3]} aspect={1} ariaLabel={pick(strings.unit, isRtl)}>
          <rect x={200} y={170} width={30} height={30} fill="var(--t-ink)" fillOpacity={0.08} stroke="var(--t-ink)" strokeDasharray="4 3" strokeOpacity={0.4} />
          <polygon points={polygon} fill="var(--t-accent)" fillOpacity={0.18} stroke="var(--t-accent)" strokeWidth={2} />
          <Segment x1={0} y1={0} x2={a} y2={c} color="var(--t-accent)" width={2.5} />
          <Segment x1={0} y1={0} x2={b} y2={d} color="var(--t-sky)" width={2.5} />
          <Point x={a} y={c} r={4} />
          <Point x={b} y={d} r={4} color="var(--t-sky)" />
        </MathPlot>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CELLS.map((cell) => (
          <label key={cell.key} className="flex items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--t-ink)_14%,transparent)] px-2 py-1.5">
            <span dir="ltr" className="font-mono text-xs font-black text-[var(--t-accent-deep)]">
              {cell.key}
            </span>
            <input
              type="number"
              step={0.1}
              value={Number(values[cell.key].toFixed(2))}
              onChange={(event) => set(cell.key, Number(event.target.value) || 0)}
              className="w-full bg-transparent font-mono text-xs text-[var(--t-ink)] outline-none"
              aria-label={`${cell.key}`}
            />
          </label>
        ))}
      </div>

      <Readout
        dir={isRtl ? 'rtl' : 'ltr'}
        rows={[
          { label: pick(strings.determinant, isRtl), value: fmt(det, 2), emphasis: true },
          { label: pick(strings.area, isRtl), value: fmt(Math.abs(det), 2) },
          {
            label: pick(strings.orientation, isRtl),
            value: Math.abs(det) < 1e-9 ? pick(strings.flat, isRtl) : det > 0 ? pick(strings.kept, isRtl) : pick(strings.flipped, isRtl),
          },
        ]}
      />
      {!touched && (
        <p className="text-[0.7rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)]">
          {isRtl ? 'غيّر أحد الأرقام الأربعة أو اختر إعداداً جاهزاً.' : 'Change one of the four entries or pick a preset.'}
        </p>
      )}
    </div>
  );
}

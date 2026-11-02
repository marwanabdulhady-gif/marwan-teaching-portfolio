import { useCallback, useRef, useState } from 'react';
import type { Bi } from '../../teachingData';

/** Pick the active language out of a bilingual string. */
export const pick = (value: Bi | undefined, isRtl: boolean): string =>
  value ? (isRtl ? value.ar || value.en : value.en) : '';

export interface SliderProps {
  label: Bi;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  /** Force the plot language (cheap: the plot is always LTR). */
  isRtl?: boolean;
}

/** A labelled range input with a live monospace readout. */
export function Slider({ label, value, min, max, step = 0.1, onChange, format, isRtl = false }: SliderProps) {
  const id = `slider-${label.en.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[0.72rem] font-bold uppercase tracking-wider text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">
          {pick(label, isRtl)}
        </label>
        <span dir="ltr" className="font-mono text-xs font-bold text-[var(--t-accent-deep)] tabular-nums">
          {format ? format(value) : value.toFixed(2)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full h-11 cursor-pointer accent-[var(--t-accent)] bg-transparent"
      />
    </div>
  );
}

export interface ReadoutRow {
  label: string;
  value: string;
  emphasis?: boolean;
}

/**
 * Live numeric readout. Read by screen readers at most a few times a second
 * (politeness keeps it off the announcement queue while dragging).
 */
export function Readout({ rows, dir = 'ltr' }: { rows: ReadoutRow[]; dir?: 'ltr' | 'rtl' }) {
  return (
    <div
      dir={dir}
      aria-live="polite"
      className="rounded-xl border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] bg-[color-mix(in_srgb,var(--t-ink)_4%,transparent)] px-3 py-2 font-mono text-[0.78rem] leading-relaxed"
    >
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline justify-between gap-3">
          <span className="text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">{row.label}</span>
          <span className={row.emphasis ? 'font-bold text-[var(--t-accent-deep)]' : 'font-semibold text-[var(--t-ink)]'}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Explorer state that reports the first interaction exactly once, so the
 * lesson's "explorer used" credit is not awarded on mount.
 */
export function useExplorerState(
  initial: Record<string, number>,
  onInteract: () => void,
): [Record<string, number>, (key: string, value: number) => void, boolean] {
  const [values, setValues] = useState(initial);
  const touched = useRef(false);
  const set = useCallback(
    (key: string, value: number) => {
      if (!touched.current) {
        touched.current = true;
        onInteract();
      }
      setValues((current) => ({ ...current, [key]: value }));
    },
    [onInteract],
  );
  return [values, set, touched.current];
}

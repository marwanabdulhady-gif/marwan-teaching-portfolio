import { useCallback, useEffect, useRef, useState } from 'react';
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
 * A string that only changes at most every `ms`. Dragging a slider fires dozens
 * of updates a second; without this the announcement queue is unusable.
 */
function useThrottledText(text: string, ms = 250): string {
  const [announced, setAnnounced] = useState(text);
  const latest = useRef(text);
  const lastRun = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  latest.current = text;

  useEffect(() => {
    if (timer.current) return; // a trailing update is already on its way
    const since = Date.now() - lastRun.current;
    if (since >= ms) {
      lastRun.current = Date.now();
      setAnnounced(latest.current);
      return;
    }
    timer.current = setTimeout(() => {
      timer.current = null;
      lastRun.current = Date.now();
      setAnnounced(latest.current);
    }, ms - since);
  }, [text, ms]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return announced;
}

/**
 * Live numeric readout. The visible numbers update on every frame; a separate
 * hidden copy is what screen readers hear, at most four times a second.
 */
export function Readout({ rows, dir = 'ltr' }: { rows: ReadoutRow[]; dir?: 'ltr' | 'rtl' }) {
  const spoken = rows.map((row) => `${row.label}: ${row.value}`).join('. ');
  const announced = useThrottledText(spoken);
  return (
    <div
      dir={dir}
      className="rounded-xl border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] bg-[color-mix(in_srgb,var(--t-ink)_4%,transparent)] px-3 py-2 font-mono text-[0.78rem] leading-relaxed"
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announced}
      </p>
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

export interface SegmentedChoiceProps<T extends string> {
  label?: Bi;
  value: T;
  options: { id: T; label: Bi }[];
  onChange: (value: T) => void;
  isRtl?: boolean;
}

/** A small set of mutually exclusive options (tablist semantics). */
export function SegmentedChoice<T extends string>({ label, value, options, onChange, isRtl = false }: SegmentedChoiceProps<T>) {
  return (
    <div className="space-y-1.5">
      {label && (
        <p className="text-[0.72rem] font-bold uppercase tracking-wider text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)]">
          {pick(label, isRtl)}
        </p>
      )}
      <div role="group" aria-label={label ? pick(label, isRtl) : undefined} className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.id)}
              className={`px-3 py-2 rounded-lg text-xs font-bold cursor-pointer border transition-colors ${
                active
                  ? 'border-[var(--t-accent)] bg-[color-mix(in_srgb,var(--t-accent)_14%,transparent)] text-[var(--t-accent-deep)]'
                  : 'border-[color-mix(in_srgb,var(--t-ink)_16%,transparent)] bg-transparent text-[var(--t-ink)]'
              }`}
            >
              {pick(option.label, isRtl)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface ToggleProps {
  label: Bi;
  checked: boolean;
  onChange: (checked: boolean) => void;
  isRtl?: boolean;
  /** Optional small formula shown in mono after the label. */
  detail?: string;
}

/** A checkbox with a 44 px hit target. */
export function Toggle({ label, checked, onChange, isRtl = false, detail }: ToggleProps) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] px-2.5 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 shrink-0 accent-[var(--t-accent)]"
      />
      <span className="text-xs font-semibold text-[var(--t-ink)]">{pick(label, isRtl)}</span>
      {detail && (
        <span dir="ltr" className="ms-auto font-mono text-[0.68rem] text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">
          {detail}
        </span>
      )}
    </label>
  );
}

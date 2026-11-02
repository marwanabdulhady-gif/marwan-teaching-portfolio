/**
 * Small pieces shared by the GMAT labs: a two-way bar (part / whole), a
 * labelled cell and the verdict badge used by the sufficiency lab. None of
 * these register as explorers; they are imported by the labs in this folder.
 */
import type { ReactNode } from 'react';

/** A horizontal bar with a filled portion, drawn LTR inside RTL chrome. */
export function Bar({
  fill,
  tone = 'var(--t-accent)',
  height = 22,
  label,
  caption,
  compare,
}: {
  /** 0–1 share of the bar that is filled. */
  fill: number;
  tone?: string;
  height?: number;
  label?: string;
  caption?: string;
  /** Optional ghost bar behind, e.g. the original value. */
  compare?: number;
}) {
  const share = Math.min(1, Math.max(0, fill));
  return (
    <div dir="ltr" className="space-y-1">
      {label && (
        <div className="flex items-baseline justify-between gap-2 font-mono text-[0.68rem] text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">
          <span>{label}</span>
          {caption && <span className="font-bold text-[var(--t-ink)]">{caption}</span>}
        </div>
      )}
      <div
        className="relative w-full overflow-hidden rounded-md bg-[color-mix(in_srgb,var(--t-ink)_10%,transparent)]"
        style={{ height }}
      >
        {compare !== undefined && (
          <span
            className="absolute inset-y-0 start-0 border-e-2 border-dashed border-[color-mix(in_srgb,var(--t-ink)_45%,transparent)]"
            style={{ width: `${Math.min(1, Math.max(0, compare)) * 100}%` }}
            aria-hidden
          />
        )}
        <span
          className="absolute inset-y-0 start-0 rounded-md transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${share * 100}%`, background: tone }}
        />
      </div>
    </div>
  );
}

/** A bordered cell used in the table-style labs. */
export function Cell({ label, value, ok }: { label: ReactNode; value: ReactNode; ok?: boolean }) {
  return (
    <div
      className={`rounded-lg border px-2.5 py-1.5 ${
        ok
          ? 'border-[color-mix(in_srgb,var(--t-ok)_55%,transparent)] bg-[color-mix(in_srgb,var(--t-ok)_10%,transparent)]'
          : 'border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)]'
      }`}
    >
      <p className="text-[0.62rem] font-bold uppercase tracking-wider text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">{label}</p>
      <p dir="ltr" className="font-mono text-[0.78rem] font-bold text-[var(--t-ink)]">
        {value}
      </p>
    </div>
  );
}

/** Green tick / red cross line for a yes-no check. */
export function Verdict({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <p className={`flex items-start gap-1.5 text-xs leading-relaxed ${ok ? 'text-[var(--t-ok)]' : 'text-[var(--t-danger)]'}`}>
      <span aria-hidden className="font-black">
        {ok ? '✓' : '✗'}
      </span>
      <span className="text-[var(--t-ink)]">{children}</span>
    </p>
  );
}

/** A key-idea line with a bullet, used under every GMAT lab. */
export function Idea({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-[0.8rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_82%,transparent)]">
      <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--t-accent)]" />
      <span>{children}</span>
    </li>
  );
}

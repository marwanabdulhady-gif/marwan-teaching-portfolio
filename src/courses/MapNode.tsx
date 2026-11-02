/**
 * One lesson on the course map: a shaped node with a progress ring, a code in
 * the middle and the title underneath. Presentational only — the map owns
 * focus, ordering and the click handler.
 */
import { memo } from 'react';
import type { NodeState } from './progress';
import type { LessonNode } from './courseGraph';
import { pick } from './viz/controls';

const SIZE: Record<'lanes' | 'timeline', number> = { lanes: 60, timeline: 48 };

interface MapNodeProps {
  lesson: LessonNode;
  state: NodeState;
  completion: number;
  current: boolean;
  variant: 'lanes' | 'timeline';
  isRtl: boolean;
  tabIndex: number;
  onOpen: () => void;
  onFocus?: () => void;
  nodeRef?: (element: HTMLButtonElement | null) => void;
}

const shapeClass: Record<LessonNode['shape'], string> = {
  circle: 'rounded-full',
  diamond: 'rotate-45 rounded-[10px]',
  hexagon: 'rounded-[12px]',
};

function MapNode({
  lesson,
  state,
  completion,
  current,
  variant,
  isRtl,
  tabIndex,
  onOpen,
  onFocus,
  nodeRef,
}: MapNodeProps) {
  const size = SIZE[variant];
  const filled = state === 'done' || state === 'confident';
  const fill = state === 'confident' ? 'var(--t-sun)' : state === 'done' ? 'var(--t-sky)' : 'transparent';
  // White on a light theme's sky/sun fill is under 4.5:1, so the theme supplies
  // the text colour for its own fills (`--t-on-sky`, `--t-on-sun`).
  const textColour =
    state === 'confident' ? 'var(--t-on-sun)' : state === 'done' ? 'var(--t-on-sky)' : 'var(--t-ink)';
  // A sunflower fill on cream paper is only 1.7:1 against the page, so every
  // filled node also gets an ink edge — that edge is what makes it visible.
  const edgeColour =
    state === 'new'
      ? 'color-mix(in srgb, var(--t-ink) 25%, transparent)'
      : filled
        ? 'color-mix(in srgb, var(--t-ink) 45%, transparent)'
        : 'var(--t-accent)';
  const strokeDash = 2 * Math.PI * (size / 2 + 4);

  const content = (
    <>
      <svg
        width={size + 10}
        height={size + 10}
        viewBox={`0 0 ${size + 10} ${size + 10}`}
        className="absolute inset-0 pointer-events-none"
        aria-hidden
      >
        <circle
          cx={(size + 10) / 2}
          cy={(size + 10) / 2}
          r={size / 2 + 4}
          fill="none"
          stroke="var(--t-ink)"
          strokeOpacity={state === 'new' ? 0.16 : 0.1}
          strokeWidth={2.5}
        />
        {completion > 0 && completion < 100 && (
          <circle
            cx={(size + 10) / 2}
            cy={(size + 10) / 2}
            r={size / 2 + 4}
            fill="none"
            stroke="var(--t-accent)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray={`${(strokeDash * completion) / 100} ${strokeDash}`}
            transform={`rotate(-90 ${(size + 10) / 2} ${(size + 10) / 2})`}
          />
        )}
      </svg>
      <span
        className={`relative flex items-center justify-center ${shapeClass[lesson.shape]}`}
        style={{
          width: size,
          height: size,
          background: fill,
          border: `2px solid ${edgeColour}`,
        }}
      >
        <span
          dir="ltr"
          className={`font-mono font-black ${lesson.shape === 'diamond' ? '-rotate-45' : ''}`}
          style={{ color: textColour, fontSize: lesson.code.length > 4 ? 10 : 12 }}
        >
          {lesson.code}
        </span>
      </span>
      {state === 'confident' && (
        <span
          className="absolute -top-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--t-sun)] text-[0.65rem] font-black text-[var(--t-on-sun)] ring-1 ring-[color-mix(in_srgb,var(--t-ink)_45%,transparent)]"
          aria-hidden
        >
          ✓
        </span>
      )}
      {lesson.hasExplorer && state !== 'confident' && (
        <span
          className="absolute -top-1 -end-1 h-5 w-5 rounded-full bg-[color-mix(in_srgb,var(--t-accent)_18%,var(--t-bg))] text-[0.7rem] flex items-center justify-center"
          aria-hidden
        >
          ⚗
        </span>
      )}
    </>
  );

  const describedBy = `node-info-${lesson.key.replace(/[^\w-]/g, '-')}`;

  if (variant === 'timeline') {
    return (
      <div className="relative flex items-start gap-3">
        <button
          ref={nodeRef}
          type="button"
          onClick={onOpen}
          onFocus={onFocus}
          tabIndex={tabIndex}
          aria-describedby={describedBy}
          aria-current={current ? 'step' : undefined}
          className="relative shrink-0 cursor-pointer bg-transparent border-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--t-accent)]"
          style={{ width: size + 10, height: size + 10 }}
        >
          {content}
        </button>
        <button
          type="button"
          onClick={onOpen}
          tabIndex={-1}
          aria-hidden
          className="min-w-0 text-start bg-transparent border-0 cursor-pointer pt-2"
        >
          <span className="block text-sm font-bold text-[var(--t-ink)] leading-snug">{pick(lesson.title, isRtl)}</span>
          <span className="block text-[0.68rem] text-[color-mix(in_srgb,var(--t-ink)_58%,transparent)] mt-0.5">
            {completion}% · {lesson.questionIds.length} {isRtl ? 'سؤالاً' : 'questions'}
          </span>
        </button>
        <span id={describedBy} className="sr-only">
          {isRtl
            ? `الدرس ${lesson.code}، ${lesson.title.ar}، ${state}`
            : `Lesson ${lesson.code}, ${lesson.title.en}, ${state} ${completion} percent`}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2" style={{ width: 116 }}>
      <button
        ref={nodeRef}
        type="button"
        onClick={onOpen}
        onFocus={onFocus}
        tabIndex={tabIndex}
        aria-describedby={describedBy}
        aria-current={current ? 'step' : undefined}
        className="relative cursor-pointer bg-transparent border-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--t-accent)]"
        style={{ width: size + 10, height: size + 10 }}
      >
        {current && (
          <span
            className="absolute inset-0 rounded-full border-2 border-[var(--t-accent)] motion-safe:animate-ping"
            aria-hidden
          />
        )}
        {content}
      </button>
      <span className="text-center text-[0.7rem] leading-tight font-semibold text-[var(--t-ink)] line-clamp-2">
        {pick(lesson.title, isRtl)}
      </span>
      <span id={describedBy} className="sr-only">
        {isRtl
          ? `الدرس ${lesson.code}، ${lesson.title.ar}، ${state}`
          : `Lesson ${lesson.code}, ${lesson.title.en}, ${state} ${completion} percent`}
      </span>
    </div>
  );
}

export default memo(MapNode);

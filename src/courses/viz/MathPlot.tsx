/**
 * Shared SVG plot primitives for the lesson explorers.
 *
 * Everything is theme-aware (colours come from the `--t-*` tokens) and LTR:
 * wrap a plot in `<div dir="ltr">` so the maths itself never mirrors in RTL.
 */
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

export interface Scale {
  x: (n: number) => number;
  y: (n: number) => number;
  ix: (px: number) => number;
  iy: (px: number) => number;
  width: number;
  height: number;
  xDomain: [number, number];
  yDomain: [number, number];
}

const PlotContext = createContext<Scale | null>(null);

export function usePlotScale(): Scale {
  const scale = useContext(PlotContext);
  if (!scale) throw new Error('Plot primitives must be used inside <MathPlot>');
  return scale;
}

/** A tick step that divides the range into roughly `target` intervals. */
function niceStep(range: number, target = 6): number {
  const rough = range / target;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
  const normalised = rough / magnitude;
  const factor = normalised >= 5 ? 5 : normalised >= 2 ? 2 : 1;
  return factor * magnitude;
}

const ticks = (domain: [number, number]): number[] => {
  const [min, max] = domain;
  const step = niceStep(max - min);
  const out: number[] = [];
  for (let value = Math.ceil(min / step) * step; value <= max + 1e-9; value += step) {
    out.push(Math.abs(value) < 1e-9 ? 0 : Number(value.toFixed(6)));
  }
  return out;
};

const INK = 'var(--t-ink)';
const ACCENT = 'var(--t-accent)';

export interface MathPlotProps {
  xDomain: [number, number];
  yDomain: [number, number];
  /** width ÷ height of the drawing area. */
  aspect?: number;
  grid?: boolean;
  ariaLabel: string;
  children: ReactNode;
  className?: string;
}

export function MathPlot({
  xDomain,
  yDomain,
  aspect = 4 / 3,
  grid = true,
  ariaLabel,
  children,
  className = '',
}: MathPlotProps) {
  const width = 400;
  const height = Math.round(width / aspect);

  const scale = useMemo<Scale>(() => {
    const [x0, x1] = xDomain;
    const [y0, y1] = yDomain;
    const sx = width / (x1 - x0);
    const sy = height / (y1 - y0);
    return {
      x: (n) => (n - x0) * sx,
      y: (n) => height - (n - y0) * sy,
      ix: (px) => x0 + px / sx,
      iy: (py) => y0 + (height - py) / sy,
      width,
      height,
      xDomain,
      yDomain,
    };
  }, [xDomain[0], xDomain[1], yDomain[0], yDomain[1], width, height]);

  const xTicks = ticks(xDomain);
  const yTicks = ticks(yDomain);
  const axisY = scale.y(Math.min(Math.max(0, yDomain[0]), yDomain[1]));
  const axisX = scale.x(Math.min(Math.max(0, xDomain[0]), xDomain[1]));

  return (
    <PlotContext.Provider value={scale}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={`block w-full h-auto select-none ${className}`}
        role="img"
        aria-label={ariaLabel}
      >
        {grid && (
          <g stroke={INK} strokeOpacity={0.12} strokeWidth={1}>
            {xTicks.map((t) => (
              <line key={`gx-${t}`} x1={scale.x(t)} y1={0} x2={scale.x(t)} y2={height} />
            ))}
            {yTicks.map((t) => (
              <line key={`gy-${t}`} x1={0} y1={scale.y(t)} x2={width} y2={scale.y(t)} />
            ))}
          </g>
        )}
        <g stroke={INK} strokeOpacity={0.45} strokeWidth={1.5}>
          <line x1={0} y1={axisY} x2={width} y2={axisY} />
          <line x1={axisX} y1={0} x2={axisX} y2={height} />
        </g>
        <g fill={INK} fillOpacity={0.5} fontSize={10} fontFamily="ui-monospace, monospace">
          {xTicks.map((t) => (
            <text key={`tx-${t}`} x={scale.x(t)} y={axisY + 13} textAnchor="middle">
              {t}
            </text>
          ))}
          {yTicks.map((t) => (
            <text key={`ty-${t}`} x={axisX - 5} y={scale.y(t) + 3} textAnchor="end">
              {t}
            </text>
          ))}
        </g>
        {children}
      </svg>
    </PlotContext.Provider>
  );
}

export interface CurveProps {
  fn: (x: number) => number;
  samples?: number;
  color?: string;
  width?: number;
  dash?: string;
  opacity?: number;
  /** Draw only between these x values (default: the whole domain). */
  from?: number;
  to?: number;
}

/**
 * Samples a function into a path, breaking the line at non-finite values and
 * at jumps (asymptotes) so `1/x` never draws a false vertical connector.
 */
export function Curve({
  fn,
  samples = 260,
  color = ACCENT,
  width = 2.5,
  dash,
  opacity = 1,
  from,
  to,
}: CurveProps) {
  const scale = usePlotScale();
  const d = useMemo(() => {
    const start = from ?? scale.xDomain[0];
    const end = to ?? scale.xDomain[1];
    const ySpan = scale.yDomain[1] - scale.yDomain[0];
    let path = '';
    let open = false;
    let previous: number | null = null;
    for (let i = 0; i <= samples; i += 1) {
      const x = start + ((end - start) * i) / samples;
      const y = fn(x);
      if (!Number.isFinite(y) || Math.abs(y) > 1e4) {
        open = false;
        previous = null;
        continue;
      }
      // A jump bigger than half the visible height is an asymptote, not a line.
      if (previous !== null && Math.abs(y - previous) > ySpan * 0.5) open = false;
      const px = scale.x(x);
      const py = scale.y(y);
      path += `${open ? 'L' : 'M'}${px.toFixed(2)},${py.toFixed(2)}`;
      open = true;
      previous = y;
    }
    return path;
  }, [fn, samples, from, to, scale]);

  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash} strokeOpacity={opacity} strokeLinecap="round" />;
}

export interface PointProps {
  x: number;
  y: number;
  r?: number;
  color?: string;
  hollow?: boolean;
  label?: string;
}

export function Point({ x, y, r = 5, color = 'var(--t-sun)', hollow = false, label }: PointProps) {
  const scale = usePlotScale();
  const cx = scale.x(x);
  const cy = scale.y(y);
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={hollow ? 'var(--t-bg)' : color}
        stroke={color}
        strokeWidth={2}
      />
      {label && (
        <text x={cx + r + 4} y={cy - r - 2} fontSize={11} fill={INK} fillOpacity={0.75} fontFamily="ui-monospace, monospace">
          {label}
        </text>
      )}
    </g>
  );
}

export function Segment({
  x1,
  y1,
  x2,
  y2,
  color = INK,
  width = 1.5,
  dash,
  opacity = 0.6,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  width?: number;
  dash?: string;
  opacity?: number;
}) {
  const scale = usePlotScale();
  return (
    <line
      x1={scale.x(x1)}
      y1={scale.y(y1)}
      x2={scale.x(x2)}
      y2={scale.y(y2)}
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dash}
      strokeOpacity={opacity}
    />
  );
}

export interface RegionProps {
  /** Upper boundary (default: the x-axis / y = 0). */
  top?: (x: number) => number;
  bottom?: (x: number) => number;
  from: number;
  to: number;
  color?: string;
  opacity?: number;
  samples?: number;
}

/** Shade the area between two curves (or a curve and the axis). */
export function Region({ top, bottom, from, to, color = 'var(--t-accent)', opacity = 0.16, samples = 120 }: RegionProps) {
  const scale = usePlotScale();
  const d = useMemo(() => {
    const up: string[] = [];
    const down: string[] = [];
    for (let i = 0; i <= samples; i += 1) {
      const x = from + ((to - from) * i) / samples;
      const yTop = top ? top(x) : 0;
      const yBottom = bottom ? bottom(x) : 0;
      if (!Number.isFinite(yTop) || !Number.isFinite(yBottom)) continue;
      up.push(`${scale.x(x).toFixed(2)},${scale.y(yTop).toFixed(2)}`);
      down.unshift(`${scale.x(x).toFixed(2)},${scale.y(yBottom).toFixed(2)}`);
    }
    if (up.length < 2) return '';
    return `M${up.join('L')}L${down.join('L')}Z`;
  }, [top, bottom, from, to, samples, scale]);

  if (!d) return null;
  return <path d={d} fill={color} fillOpacity={opacity} stroke="none" />;
}

export interface CircleProps {
  /** Centre, in data coordinates. */
  x: number;
  y: number;
  /** Radius, in data coordinates (x units). */
  r: number;
  color?: string;
  width?: number;
  fill?: string;
  /** 0–1; ignored when `fill` is a plain token. */
  fillOpacity?: number;
  dash?: string;
  opacity?: number;
}

/**
 * A circle in data coordinates. Plots are 400 px wide with an arbitrary domain,
 * so a radius of `2` is not 2 px: this converts through the plot scale instead
 * of hard-coding pixels in explorer files.
 */
export function Circle({
  x,
  y,
  r,
  color = ACCENT,
  width = 2,
  fill = 'none',
  fillOpacity = 0.12,
  dash,
  opacity = 1,
}: CircleProps) {
  const scale = usePlotScale();
  const cx = scale.x(x);
  const cy = scale.y(y);
  const radius = Math.abs(r) * (scale.width / (scale.xDomain[1] - scale.xDomain[0]));
  if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(radius)) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill={fill === 'none' ? 'none' : fill}
      fillOpacity={fill === 'none' ? undefined : fillOpacity}
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dash}
      strokeOpacity={opacity}
    />
  );
}

/**
 * A point that can be dragged in two dimensions (and moved with the arrow
 * keys). Used where the plot itself is the control surface.
 */
export function PointHandle({
  x,
  y,
  onChange,
  xDomain,
  yDomain,
  step = 0.1,
  constrain = 'xy',
  ariaLabel,
  color = 'var(--t-accent)',
  snap,
}: {
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
  xDomain: [number, number];
  yDomain: [number, number];
  step?: number;
  constrain?: 'x' | 'y' | 'xy';
  ariaLabel: string;
  color?: string;
  snap?: (x: number, y: number) => [number, number];
}) {
  const scale = usePlotScale();

  const apply = (nextX: number, nextY: number) => {
    let nx = Math.min(xDomain[1], Math.max(xDomain[0], nextX));
    let ny = Math.min(yDomain[1], Math.max(yDomain[0], nextY));
    if (snap) [nx, ny] = snap(nx, ny);
    onChange(
      constrain === 'y' ? x : Number(nx.toFixed(3)),
      constrain === 'x' ? y : Number(ny.toFixed(3)),
    );
  };

  const move = (event: React.PointerEvent<SVGGElement>) => {
    const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!rect) return;
    const px = ((event.clientX - rect.left) / rect.width) * scale.width;
    const py = ((event.clientY - rect.top) / rect.height) * scale.height;
    apply(scale.ix(px), scale.iy(py));
  };

  return (
    <g
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={xDomain[0]}
      aria-valuemax={xDomain[1]}
      aria-valuenow={Number(x.toFixed(2))}
      aria-valuetext={`${ariaLabel}: (${x.toFixed(2)}, ${y.toFixed(2)})`}
      style={{ cursor: 'grab', touchAction: 'none', outline: 'none' }}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        move(event);
      }}
      onKeyDown={(event) => {
        const delta = event.shiftKey ? step * 10 : step;
        if (event.key === 'ArrowRight') { event.preventDefault(); apply(x + delta, y); }
        else if (event.key === 'ArrowLeft') { event.preventDefault(); apply(x - delta, y); }
        else if (event.key === 'ArrowUp') { event.preventDefault(); apply(x, y + delta); }
        else if (event.key === 'ArrowDown') { event.preventDefault(); apply(x, y - delta); }
      }}
    >
      <circle cx={scale.x(x)} cy={scale.y(y)} r={12} fill={color} fillOpacity={0.2} />
      <circle cx={scale.x(x)} cy={scale.y(y)} r={6} fill={color} stroke="var(--t-bg)" strokeWidth={2} />
    </g>
  );
}

/** Vertical or horizontal asymptote / guide line across the whole plot. */
export function Asymptote({ x, y }: { x?: number; y?: number }) {
  const scale = usePlotScale();
  if (x !== undefined) {
    return (
      <line
        x1={scale.x(x)}
        y1={0}
        x2={scale.x(x)}
        y2={scale.height}
        stroke="var(--t-sun)"
        strokeWidth={1.5}
        strokeDasharray="5 5"
        strokeOpacity={0.85}
      />
    );
  }
  if (y === undefined) return null;
  return (
    <line
      x1={0}
      y1={scale.y(y)}
      x2={scale.width}
      y2={scale.y(y)}
      stroke="var(--t-sun)"
      strokeWidth={1.5}
      strokeDasharray="5 5"
      strokeOpacity={0.85}
    />
  );
}

export interface DragHandleProps {
  x: number;
  /** Called in data coordinates. */
  onChange: (x: number) => void;
  min: number;
  max: number;
  step?: number;
  ariaLabel: string;
  color?: string;
  /** Screen-space y of the handle (defaults to the vertical middle). */
  py?: number;
}

/**
 * A draggable handle on the plot that also responds to the keyboard:
 * arrows ±step, Shift ±10×step, Home/End move to the domain ends.
 */
export function DragHandle({
  x,
  onChange,
  min,
  max,
  step = 0.1,
  ariaLabel,
  color = 'var(--t-accent)',
  py,
}: DragHandleProps) {
  const scale = usePlotScale();
  const clamp = useCallback((value: number) => Math.min(max, Math.max(min, value)), [min, max]);
  const id = useId();

  const onPointerDown = (event: PointerEvent<SVGGElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<SVGGElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!rect) return;
    const px = ((event.clientX - rect.left) / rect.width) * scale.width;
    const next = Math.round(scale.ix(px) / step) * step;
    onChange(clamp(Number(next.toFixed(4))));
  };

  const onKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    const delta = event.shiftKey ? step * 10 : step;
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = x + delta;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = x - delta;
    if (event.key === 'Home') next = min;
    if (event.key === 'End') next = max;
    if (next === null) return;
    event.preventDefault();
    onChange(clamp(Number(next.toFixed(4))));
  };

  const cx = scale.x(x);
  const cy = py ?? scale.height / 2;

  return (
    <g
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Number(x.toFixed(2))}
      aria-valuetext={`${ariaLabel}: ${x.toFixed(2)}`}
      aria-describedby={id}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onKeyDown={onKeyDown}
      style={{ cursor: 'ew-resize', touchAction: 'none', outline: 'none' }}
      className="focus-visible:opacity-100"
    >
      <line x1={cx} y1={0} x2={cx} y2={scale.height} stroke={color} strokeWidth={1.5} strokeDasharray="4 4" strokeOpacity={0.7} />
      <circle cx={cx} cy={cy} r={11} fill={color} fillOpacity={0.18} />
      <circle cx={cx} cy={cy} r={6} fill={color} stroke="var(--t-bg)" strokeWidth={2} />
      <title id={id}>{`${ariaLabel}: ${x.toFixed(2)}`}</title>
    </g>
  );
}

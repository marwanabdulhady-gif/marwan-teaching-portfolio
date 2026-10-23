import type { ReactElement } from 'react';

/**
 * Generated mathematical line-work.
 *
 * The source template leaned on a set of AI-rendered character illustrations.
 * Those belong to another educator, so every visual here is drawn instead —
 * real geometry produced from real formulas, which is rather more on-brand
 * for a mathematics portfolio anyway.
 */

const CYAN = '#ff7a5c'; // coral chalk
const CYAN_2 = '#ffa58c';
const GOLD = '#f6c445'; // sunflower chalk

/* -------------------------------------------------------------------------- */
/* Point generation                                                            */
/* -------------------------------------------------------------------------- */

/** Logarithmic spiral r = a·e^(bθ). */
function spiralPoints(turns = 3.2, steps = 240, a = 3, b = 0.19): string {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * turns * Math.PI * 2;
    const r = a * Math.exp(b * theta);
    pts.push(`${(100 + Math.cos(theta) * r).toFixed(2)},${(100 - Math.sin(theta) * r).toFixed(2)}`);
  }
  return pts.join(' ');
}

/** y = 0.006(x−100)² sampled across the box — a plain parabola. */
function parabolaPoints(steps = 60): string {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 200;
    const y = 165 - 0.0062 * Math.pow(x - 100, 2);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

/** Bell curve, σ = 26. */
function bellPoints(steps = 80): string {
  const sigma = 26;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 200;
    const y = 150 - (1 / (sigma * Math.sqrt(2 * Math.PI))) * 4200 * Math.exp(-Math.pow(x - 100, 2) / (2 * sigma * sigma));
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

/** Regular polygon vertices — used for the d20-style motif. */
function polygonPoints(sides: number, radius: number, cx = 100, cy = 100, rotation = -Math.PI / 2): string {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = rotation + (i / sides) * Math.PI * 2;
    pts.push(`${(cx + Math.cos(a) * radius).toFixed(1)},${(cy + Math.sin(a) * radius).toFixed(1)}`);
  }
  return pts.join(' ');
}

/** Deterministic pseudo-random so the motif is stable across renders. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/* -------------------------------------------------------------------------- */
/* Nav mark                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Brand mark: three rotated ellipses (a nod to the template's atom) with the
 * template's nucleus replaced by a compass point.
 */
export function MathMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <ellipse cx="20" cy="20" rx="18" ry="7" stroke={CYAN} strokeWidth="1.5" opacity="0.6" />
      <ellipse
        cx="20"
        cy="20"
        rx="18"
        ry="7"
        stroke={CYAN}
        strokeWidth="1.5"
        opacity="0.6"
        transform="rotate(60 20 20)"
      />
      <ellipse
        cx="20"
        cy="20"
        rx="18"
        ry="7"
        stroke={CYAN}
        strokeWidth="1.5"
        opacity="0.6"
        transform="rotate(120 20 20)"
      />
      {/* Compass point replaces the atom's nucleus */}
      <path d="M20 12.5 L25.5 27.5 L20 24 L14.5 27.5 Z" fill={CYAN} />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero constellation                                                          */
/* -------------------------------------------------------------------------- */

/**
 * The hero's right-hand visual: a plotted parabola on live axes, wrapped in
 * rotating conic rings, with floating formula chips laid over the top.
 */
export function MathConstellation() {
  return (
    <div className="relative w-full max-w-[520px] aspect-square mx-auto" dir="ltr">
      {/* Soft glow behind the artwork */}
      <div className="absolute inset-[12%] rounded-full bg-cyan-500/15 blur-[80px] pointer-events-none" />

      {/* Slowly rotating conic rings */}
      <svg
        viewBox="0 0 420 420"
        className="absolute inset-0 w-full h-full teach-anim-spin-slow"
        aria-hidden="true"
      >
        <circle
          cx="210"
          cy="210"
          r="196"
          fill="none"
          stroke={CYAN}
          strokeWidth="1"
          strokeDasharray="3 12"
          opacity="0.45"
        />
        <ellipse cx="210" cy="210" rx="186" ry="68" fill="none" stroke={CYAN} strokeWidth="1.2" opacity="0.4" />
        <ellipse
          cx="210"
          cy="210"
          rx="186"
          ry="68"
          fill="none"
          stroke={CYAN_2}
          strokeWidth="1.2"
          opacity="0.35"
          transform="rotate(60 210 210)"
        />
        <ellipse
          cx="210"
          cy="210"
          rx="186"
          ry="68"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.2"
          opacity="0.3"
          transform="rotate(120 210 210)"
        />
        <circle cx="210" cy="24" r="4" fill={CYAN} />
        <circle cx="371" cy="315" r="3" fill={GOLD} />
        <circle cx="49" cy="315" r="3" fill={CYAN_2} />
      </svg>

      {/* Static core: axes, parabola, inscribed triangle */}
      <svg viewBox="0 0 420 420" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id="teach-curve" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={CYAN_2} />
            <stop offset="55%" stopColor={CYAN} />
            <stop offset="100%" stopColor={GOLD} />
          </linearGradient>
        </defs>

        {/* Axes */}
        <g stroke="rgba(232,244,253,0.22)" strokeWidth="1">
          <line x1="70" y1="350" x2="350" y2="350" />
          <line x1="210" y1="70" x2="210" y2="350" />
        </g>
        <g stroke="rgba(232,244,253,0.09)" strokeWidth="1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={`h${i}`} x1="70" y1={350 - i * 56} x2="350" y2={350 - i * 56} />
          ))}
          {[1, 2, 3, 4].map((i) => (
            <line key={`v${i}`} x1={210 + i * 35} y1="70" x2={210 + i * 35} y2="350" />
          ))}
          {[1, 2, 3, 4].map((i) => (
            <line key={`vn${i}`} x1={210 - i * 35} y1="70" x2={210 - i * 35} y2="350" />
          ))}
        </g>

        {/* Parabola, drawn on load */}
        <path
          className="teach-draw-path"
          d={`M 70 210 Q 210 -20 350 210`}
          fill="none"
          stroke="url(#teach-curve)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Vertex marker + tangent */}
        <circle cx="210" cy="115" r="5" fill={GOLD} />
        <line x1="120" y1="115" x2="300" y2="115" stroke={GOLD} strokeWidth="1" strokeDasharray="5 6" opacity="0.65" />

        {/* Roots */}
        <circle cx="140" cy="288" r="4" fill={CYAN_2} />
        <circle cx="280" cy="288" r="4" fill={CYAN_2} />

        {/* Axis labels */}
        <text x="356" y="354" fill="rgba(232,244,253,0.45)" fontSize="12" fontFamily="JetBrains Mono, monospace">
          x
        </text>
        <text x="196" y="62" fill="rgba(232,244,253,0.45)" fontSize="12" fontFamily="JetBrains Mono, monospace">
          y
        </text>

        {/* Inscribed right triangle — Pythagoras */}
        <g opacity="0.55">
          <path
            d="M 96 338 L 96 262 L 178 338 Z"
            fill="rgba(255,122,92,0.08)"
            stroke={CYAN_2}
            strokeWidth="1.2"
          />
          <rect x="88" y="330" width="8" height="8" fill="none" stroke={CYAN_2} strokeWidth="1" />
        </g>
      </svg>

      {/* Floating formula chips */}
      <div className="absolute inset-0 pointer-events-none">
        <span className="absolute top-[6%] start-[4%] teach-anim-float px-3 py-1.5 rounded-xl bg-white/[0.07] border border-cyan-400/25 backdrop-blur-md font-mono text-[11px] text-cyan-200 whitespace-nowrap">
          y = ax² + bx + c
        </span>
        <span
          className="absolute bottom-[14%] start-[2%] teach-anim-float px-3 py-1.5 rounded-xl bg-white/[0.07] border border-amber-400/25 backdrop-blur-md font-mono text-[11px] text-amber-200 whitespace-nowrap"
          style={{ animationDelay: '1.4s' }}
        >
          a² + b² = c²
        </span>
        <span
          className="absolute top-[34%] end-[-2%] teach-anim-float px-3 py-1.5 rounded-xl bg-white/[0.07] border border-cyan-400/25 backdrop-blur-md font-mono text-[11px] text-cyan-100 whitespace-nowrap"
          style={{ animationDelay: '2.6s' }}
        >
          ∫ f(x) dx
        </span>
        <span
          className="absolute bottom-[32%] end-[4%] teach-anim-float px-3 py-1.5 rounded-xl bg-white/[0.07] border border-cyan-400/25 backdrop-blur-md font-mono text-[11px] text-cyan-100 whitespace-nowrap"
          style={{ animationDelay: '0.7s' }}
        >
          lim<sub>h→0</sub>
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Gallery motifs                                                              */
/* -------------------------------------------------------------------------- */

const MOTIFS: Record<string, ReactElement> = {
  spiral: (
    <>
      <polyline points={spiralPoints()} fill="none" stroke={CYAN} strokeWidth="1.6" strokeLinecap="round" />
      {/* Fibonacci bounding squares hint at the construction */}
      <rect x="94" y="94" width="12" height="12" fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.6" />
      <rect x="82" y="82" width="24" height="24" fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.45" />
      <circle cx="100" cy="100" r="2.5" fill={GOLD} />
    </>
  ),

  conics: (
    <>
      <ellipse cx="100" cy="66" rx="58" ry="24" fill="none" stroke={CYAN} strokeWidth="1.5" />
      <path d="M 20 150 Q 100 60 180 150" fill="none" stroke={CYAN_2} strokeWidth="1.5" />
      <path d="M 34 96 C 70 130 70 170 34 196" fill="none" stroke={GOLD} strokeWidth="1.5" />
      <path d="M 166 96 C 130 130 130 170 166 196" fill="none" stroke={GOLD} strokeWidth="1.5" />
      <line x1="100" y1="40" x2="100" y2="196" stroke="rgba(232,244,253,0.18)" strokeWidth="0.8" strokeDasharray="4 6" />
    </>
  ),

  chart: (
    <>
      <path d={bellPoints()} fill="none" stroke={CYAN} strokeWidth="1.8" />
      <g fill={CYAN_2} opacity="0.55">
        <rect x="38" y="132" width="14" height="50" rx="2" />
        <rect x="62" y="112" width="14" height="70" rx="2" />
        <rect x="86" y="96" width="14" height="86" rx="2" />
        <rect x="110" y="90" width="14" height="92" rx="2" />
        <rect x="134" y="108" width="14" height="74" rx="2" />
        <rect x="158" y="136" width="14" height="46" rx="2" />
      </g>
      <line x1="24" y1="182" x2="176" y2="182" stroke="rgba(232,244,253,0.25)" strokeWidth="1" />
      <line x1="24" y1="182" x2="24" y2="34" stroke="rgba(232,244,253,0.25)" strokeWidth="1" />
    </>
  ),

  dice: (
    <>
      <polygon points={polygonPoints(6, 66)} fill="none" stroke={CYAN} strokeWidth="1.6" />
      <polygon points={polygonPoints(6, 44)} fill="none" stroke={CYAN_2} strokeWidth="1.2" opacity="0.7" />
      <polygon points={polygonPoints(6, 22)} fill="none" stroke={GOLD} strokeWidth="1" opacity="0.6" />
      {[
        [100, 34],
        [100, 166],
        [43, 67],
        [157, 67],
        [43, 133],
        [157, 133],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill={i % 2 ? GOLD : CYAN} />
      ))}
      <line x1="100" y1="34" x2="157" y2="67" stroke="rgba(232,244,253,0.2)" strokeWidth="0.8" />
      <line x1="100" y1="166" x2="43" y2="133" stroke="rgba(232,244,253,0.2)" strokeWidth="0.8" />
    </>
  ),

  compass: (
    <>
      <circle cx="100" cy="100" r="72" fill="none" stroke={CYAN} strokeWidth="1.5" />
      <circle cx="100" cy="100" r="52" fill="none" stroke="rgba(255,122,92,0.35)" strokeWidth="1" strokeDasharray="3 7" />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const inner = i % 6 === 0 ? 60 : 66;
        return (
          <line
            key={i}
            x1={100 + Math.cos(a) * inner}
            y1={100 + Math.sin(a) * inner}
            x2={100 + Math.cos(a) * 72}
            y2={100 + Math.sin(a) * 72}
            stroke={i % 6 === 0 ? GOLD : CYAN_2}
            strokeWidth={i % 6 === 0 ? 1.4 : 0.8}
            opacity={i % 6 === 0 ? 0.9 : 0.5}
          />
        );
      })}
      {/* Set square */}
      <path d="M 100 100 L 148 100 L 100 148 Z" fill="rgba(255,122,92,0.1)" stroke={GOLD} strokeWidth="1.3" />
      <circle cx="100" cy="100" r="3.5" fill={GOLD} />
    </>
  ),

  network: (() => {
    const rand = seeded(7);
    const nodes = Array.from({ length: 14 }).map(() => ({
      x: 30 + rand() * 140,
      y: 30 + rand() * 140,
    }));
    const edges: [number, number][] = [];
    nodes.forEach((n, i) => {
      nodes.forEach((m, j) => {
        if (j <= i) return;
        const d = Math.hypot(n.x - m.x, n.y - m.y);
        if (d < 58) edges.push([i, j]);
      });
    });
    return (
      <>
        {edges.map(([i, j], k) => (
          <line
            key={k}
            x1={nodes[i].x}
            y1={nodes[i].y}
            x2={nodes[j].x}
            y2={nodes[j].y}
            stroke={CYAN}
            strokeWidth="0.7"
            opacity="0.45"
          />
        ))}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={i % 4 === 0 ? 4 : 2.6} fill={i % 4 === 0 ? GOLD : CYAN_2} />
        ))}
      </>
    );
  })(),

  curve: (
    <>
      <polyline points={parabolaPoints()} fill="none" stroke={CYAN} strokeWidth="1.8" />
      <line x1="20" y1="165" x2="180" y2="165" stroke="rgba(232,244,253,0.25)" strokeWidth="1" />
      <line x1="100" y1="36" x2="100" y2="180" stroke="rgba(232,244,253,0.25)" strokeWidth="1" />
      <circle cx="100" cy="103" r="3.5" fill={GOLD} />
    </>
  ),
};

/**
 * Renders one of the generated motifs into a 200×200 box.
 * Wrapped in an LTR box: the artwork is mathematical, so it must not mirror
 * when the page flips to Arabic.
 */
export function Motif({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span dir="ltr" className="block">
      <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
        {MOTIFS[name] ?? MOTIFS.spiral}
      </svg>
    </span>
  );
}

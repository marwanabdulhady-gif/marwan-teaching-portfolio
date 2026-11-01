import { useEffect, useState } from 'react';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { VISUAL_MATH_UI } from '../academyData';
import { openAcademyWorkspace } from './SearchPalette';
import Reveal from './Reveal';

/**
 * Shared 60fps animation clock (in seconds) that advances smoothly whenever at
 * least one graph has motion enabled. Using real SVG mathematical coordinates
 * driven by `requestAnimationFrame` guarantees:
 *  - Continuous, jitter-free motion (no 3s `step-end` freezes or dead phases)
 *  - Exact SVG viewBox geometry on every screen size / zoom level
 *  - Explicit Play/Pause control that is never overridden by OS Battery Saver
 *    `prefers-reduced-motion: reduce` media queries.
 */
function useAnimationClock(active: boolean) {
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.064, (now - last) / 1000);
      last = now;
      setT((prev) => prev + dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return t;
}

function CardSvg({ id, t }: { id: string; t: number }) {
  if (id === 'calculus') {
    // Parabola y = x^2 in SVG coords:
    // Origin (0,0) = (115, 185); 1 x-unit = 60px; 1 y-unit = 25px (so (1,1)->(175,160), (2,4)->(235,85))
    // Note: original quadratic Bezier M7 104 Q139 302 271 16 passes near (1,1)=(175,160).
    // Let's plot the exact mathematical parabola y = x^2 on this coordinate system!
    // x in [-0.9, 2.65]: xSvg = 115 + 60*x, ySvg = 185 - 25*x*x
    const polyPts: string[] = [];
    for (let i = 0; i <= 48; i++) {
      const x = -0.9 + (i / 48) * 3.55;
      const sx = 115 + 60 * x;
      const sy = 185 - 25 * x * x;
      polyPts.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
    }

    // Smoothly oscillate h across positive & negative values approaching 0:
    // h(t) sweeps 1.55 -> 0.04 -> -0.85 -> 1.55
    const phase = (t * 0.52) % (Math.PI * 2);
    const rawH = 0.38 + 1.15 * Math.cos(phase);
    const h = Math.abs(rawH) < 0.03 ? (rawH >= 0 ? 0.03 : -0.03) : rawH;

    const xP = 1;
    const yP = 1;
    const xQ = xP + h;
    const yQ = xQ * xQ;
    const slope = 2 + h; // ( (1+h)^2 - 1 ) / h = 2 + h

    const px = 115 + 60 * xP; // 175
    const py = 185 - 25 * yP; // 160
    const qx = 115 + 60 * xQ;
    const qy = 185 - 25 * yQ;

    // Secant line y - 1 = slope * (x - 1) across x in [-0.5, 3.3]
    const xL = -0.5;
    const xR = 3.3;
    const secX1 = 115 + 60 * xL;
    const secY1 = 185 - 25 * (1 + slope * (xL - 1));
    const secX2 = 115 + 60 * xR;
    const secY2 = 185 - 25 * (1 + slope * (xR - 1));

    // Exact tangent line slope = 2 at (1,1): y = 2x - 1
    const tanX1 = 115 + 60 * 0.3;
    const tanY1 = 185 - 25 * (2 * 0.3 - 1);
    const tanX2 = 115 + 60 * 2.85;
    const tanY2 = 185 - 25 * (2 * 2.85 - 1);

    const nearTangent = Math.abs(h) < 0.18;

    return (
      <svg
        viewBox="0 0 480 230"
        className="w-full h-auto max-h-[210px] block"
        role="img"
        aria-label="For y equals x squared, secants through (1, 1) approach the tangent slope 2."
      >
        <defs>
          <clipPath id="calc-plot-clip">
            <rect x="45" y="12" width="260" height="205" />
          </clipPath>
        </defs>
        <g stroke="#9cb4d9" strokeOpacity=".38" strokeWidth="1">
          <path d="M55 185H305M115 208V16" />
          <path d="M175 181V189M235 181V189M295 181V189M111 160H119M111 85H119" />
        </g>
        <g fill="#536885" fontSize="11">
          <text x="309" y="189">x</text>
          <text x="120" y="24">y</text>
          <text x="171" y="203">1</text>
          <text x="231" y="203">2</text>
          <text x="99" y="164">1</text>
          <text x="99" y="89">4</text>
        </g>

        <g clipPath="url(#calc-plot-clip)">
          {/* Parabola y = x^2 */}
          <polyline
            points={polyPts.join(' ')}
            fill="none"
            stroke="#3158d7"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Reference tangent line at x = 1 (slope 2) */}
          <line
            x1={tanX1}
            y1={tanY1}
            x2={tanX2}
            y2={tanY2}
            stroke="#087f8c"
            strokeWidth="2"
            strokeDasharray="5 5"
          />

          {/* Rise / run triangle between P and Q */}
          <path
            d={`M ${px} ${py} H ${qx} V ${qy}`}
            fill="none"
            stroke="#b4770a"
            strokeOpacity="0.45"
            strokeWidth="1.4"
            strokeDasharray="3 3"
          />

          {/* Live moving secant line */}
          <line
            x1={secX1}
            y1={secY1}
            x2={secX2}
            y2={secY2}
            stroke={nearTangent ? '#087f8c' : '#d97706'}
            strokeWidth="2.4"
          />

          {/* Moving point Q */}
          <circle
            cx={qx}
            cy={qy}
            r="5.5"
            fill={nearTangent ? '#087f8c' : '#d97706'}
            stroke="#ffffff"
            strokeWidth="2"
          />
        </g>

        {/* Anchor point P(1, 1) */}
        <circle cx={px} cy={py} r="5.5" fill="#3158d7" stroke="#ffffff" strokeWidth="2" />

        {/* Live mathematical readout */}
        <text x="316" y="54" fill="#3158d7" fontSize="17" fontWeight="700">f(x) = x²</text>
        <text x="316" y="78" fill="#087f8c" fontSize="12.5" fontWeight="600">
          Tangent: f′(1) = 2.00
        </text>
        <rect x="314" y="92" width="148" height="54" rx="9" fill="#ffffff" fillOpacity="0.78" stroke="#cbd5e1" />
        <text x="324" y="112" fill="#536885" fontSize="11.5" fontFamily="JetBrains Mono, monospace">
          h = {h >= 0 ? `+${h.toFixed(2)}` : h.toFixed(2)}
        </text>
        <text x="324" y="133" fill="#b45309" fontSize="12" fontWeight="700" fontFamily="JetBrains Mono, monospace">
          m_sec = {slope.toFixed(2)}
        </text>
        <text x="316" y="168" fill="#536885" fontSize="11">
          Q(1+h, f(1+h)) → P(1, 1)
        </text>
      </svg>
    );
  }

  if (id === 'precalculus') {
    // Smooth horizontal translation h(t) in [-0.75, 1.35] (1 unit = 50 SVG units)
    const hShift = 0.35 + 0.95 * Math.sin(t * 1.15);
    const dx = hShift * 50; // SVG user units
    const vertexX = 170 + dx;
    const signStr = hShift >= 0 ? `− ${hShift.toFixed(2)}` : `+ ${Math.abs(hShift).toFixed(2)}`;

    return (
      <svg
        viewBox="0 0 480 230"
        className="w-full h-auto max-h-[210px] block"
        role="img"
        aria-label="The graph y equals x squared shifts horizontally to y equals (x minus h) squared."
      >
        <g stroke="#7ba9aa" strokeOpacity=".35" strokeWidth="1">
          <path d="M45 185H295M170 205V22" />
          <path d="M120 181V189M220 181V189" />
        </g>
        <g fill="#476d73" fontSize="11">
          <text x="299" y="189">x</text>
          <text x="175" y="26">y</text>
          <text x="112" y="203">−1</text>
          <text x="166" y="203">0</text>
          <text x="217" y="203">1</text>
        </g>

        {/* Parent curve f(x) = x^2 */}
        <path
          d="M70 45Q170 325 270 45"
          fill="none"
          stroke="#729998"
          strokeWidth="2"
          strokeDasharray="5 5"
        />
        <circle cx="170" cy="185" r="4" fill="#729998" />

        {/* Live translated curve g(x) = (x - h)^2 */}
        <g transform={`translate(${dx.toFixed(2)}, 0)`}>
          <path d="M70 45Q170 325 270 45" fill="none" stroke="#087f8c" strokeWidth="3.2" />
          <circle cx="170" cy="185" r="5.5" fill="#087f8c" stroke="#ffffff" strokeWidth="2" />
        </g>

        {/* Live translation vector arrow */}
        {Math.abs(dx) > 4 && (
          <g stroke="#087f8c" strokeWidth="1.8" fill="none">
            <line x1="170" y1="152" x2={vertexX} y2="152" />
            <path
              d={
                dx >= 0
                  ? `M${(vertexX - 6).toFixed(1)} 147 L${vertexX.toFixed(1)} 152 L${(vertexX - 6).toFixed(1)} 157`
                  : `M${(vertexX + 6).toFixed(1)} 147 L${vertexX.toFixed(1)} 152 L${(vertexX + 6).toFixed(1)} 157`
              }
            />
          </g>
        )}
        <text
          x={(170 + dx / 2).toFixed(1)}
          y="142"
          textAnchor="middle"
          fill="#087f8c"
          fontSize="11.5"
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
        >
          {hShift >= 0 ? `+${hShift.toFixed(2)}` : hShift.toFixed(2)}
        </text>

        <text x="306" y="62" fill="#476d73" fontSize="12">Parent: f(x) = x²</text>
        <text x="306" y="90" fill="#087f8c" fontSize="13.5" fontWeight="700">
          g(x) = (x {signStr})²
        </text>
        <rect x="304" y="104" width="156" height="46" rx="9" fill="#ffffff" fillOpacity="0.78" stroke="#b8d8d6" />
        <text x="314" y="123" fill="#087f8c" fontSize="11.5" fontWeight="700" fontFamily="JetBrains Mono, monospace">
          Vertex: ({hShift.toFixed(2)}, 0)
        </text>
        <text x="314" y="140" fill="#476d73" fontSize="10.5">
          Same shape · shifted center
        </text>
      </svg>
    );
  }

  if (id === 'gmat') {
    // Smooth bar growth & active comparison spotlight cycling through A (12), B (18), C (24 = 2A)
    const cycle = (t * 0.65) % 3; // 0..3
    const activeIdx = Math.floor(cycle); // 0 -> A, 1 -> B, 2 -> C=2A
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.6);

    // Subtle breathing scale around exact values while keeping quantitative labels crisp
    const bars = [
      { label: 'A', val: 12, x: 89, baseH: 48, color: '#3158d7', textCol: '#233f96' },
      { label: 'B', val: 18, x: 164, baseH: 72, color: '#087f8c', textCol: '#08717b' },
      { label: 'C', val: 24, x: 239, baseH: 96, color: '#3158d7', textCol: '#233f96' },
    ];

    // Animated scanner y-level sweeping from y=138 (12) to y=90 (24)
    const scanMix = 0.5 - 0.5 * Math.cos(t * 1.4); // 0 -> 1 -> 0
    const scanY = 138 - 48 * scanMix;
    const scanVal = 12 + 12 * scanMix;

    return (
      <svg
        viewBox="0 0 480 230"
        className="w-full h-auto max-h-[210px] block"
        role="img"
        aria-label="Quantitative comparison bars: A is 12, B is 18, C is 24 so C equals 2A."
      >
        <g stroke="#9cb4d9" strokeOpacity=".35" strokeWidth="1">
          <path d="M65 186H299M65 54V186" />
          <path d="M65 138H299M65 90H299" strokeDasharray="3 5" />
        </g>
        <g fill="#596b86" fontSize="10">
          <text x="48" y="190">0</text>
          <text x="42" y="142">12</text>
          <text x="42" y="94">24</text>
        </g>

        {/* Live sweeping ratio scanner line */}
        <line
          x1="65"
          y1={scanY}
          x2="299"
          y2={scanY}
          stroke="#d97706"
          strokeWidth="1.6"
          strokeDasharray="4 3"
        />
        <circle cx="65" cy={scanY} r="3.5" fill="#d97706" />

        {bars.map((b, idx) => {
          const isFocus = idx === activeIdx || (activeIdx === 2 && idx === 0);
          const lift = idx === activeIdx ? 3 * pulse : 0;
          const h = b.baseH + lift;
          const y = 186 - h;
          return (
            <g key={b.label} opacity={isFocus ? 1 : 0.68}>
              <rect
                x={b.x}
                y={y}
                width="42"
                height={h}
                rx="5"
                fill={b.color}
                stroke={idx === activeIdx ? '#f59e0b' : 'none'}
                strokeWidth="2"
              />
              <text
                x={b.x + 21}
                y={y - 9}
                textAnchor="middle"
                fill={b.textCol}
                fontSize="13"
                fontWeight="700"
              >
                {b.val}
              </text>
            </g>
          );
        })}

        {/* Ratio arc connecting A (110, 138) to C (260, 90) */}
        <path
          d="M 110 120 Q 185 52 260 72"
          fill="none"
          stroke="#d97706"
          strokeWidth="1.8"
          strokeOpacity={0.45 + 0.45 * pulse}
        />
        <text x="185" y="66" textAnchor="middle" fill="#b45309" fontSize="11" fontWeight="700">
          ×2.0 ratio
        </text>

        <g fill="#536885" fontSize="11" fontWeight="600" textAnchor="middle">
          <text x="110" y="205">A</text>
          <text x="185" y="205">B</text>
          <text x="260" y="205">C</text>
        </g>

        <text x="318" y="96" fill="#233f96" fontSize="24" fontWeight="700">C = 2A</text>
        <rect x="316" y="109" width="144" height="44" rx="8" fill="#ffffff" fillOpacity="0.8" stroke="#cbd5e1" />
        <text x="326" y="127" fill="#b45309" fontSize="11" fontWeight="700" fontFamily="JetBrains Mono, monospace">
          Scan: {scanVal.toFixed(1)} ({(scanVal / 12).toFixed(2)}×A)
        </text>
        <text x="326" y="144" fill="#536885" fontSize="10.5">
          B = 1.5A · C − A = 12
        </text>
      </svg>
    );
  }

  // Exam network: 4 strands connected to central REASON hub with traveling signal pulses
  const strandCycle = (t * 0.75) % 4;
  const activeStrand = Math.floor(strandCycle);
  const segProgress = strandCycle - activeStrand; // 0..1 along active connector

  // Linear/quadratic interpolation along each strand connector from hub -> card
  const connectors = [
    { x0: 207, y0: 107, x1: 170, y1: 65, color: '#f5c84c' }, // Algebra (top-left)
    { x0: 273, y0: 107, x1: 310, y1: 65, color: '#72d4c9' }, // Geometry (top-right)
    { x0: 207, y0: 123, x1: 170, y1: 173, color: '#72d4c9' }, // Number (bottom-left)
    { x0: 273, y0: 123, x1: 310, y1: 173, color: '#f5c84c' }, // Data (bottom-right)
  ];

  const activeConn = connectors[activeStrand];
  const pulseX = activeConn.x0 + (activeConn.x1 - activeConn.x0) * segProgress;
  const pulseY = activeConn.y0 + (activeConn.y1 - activeConn.y0) * segProgress;

  return (
    <svg
      viewBox="0 0 480 230"
      className="w-full h-auto max-h-[210px] block"
      role="img"
      aria-label="Connected exam strands: Algebra, Geometry, Number and Data."
    >
      <g fill="none" stroke="#8caad5" strokeOpacity=".45" strokeWidth="1.8">
        <line x1="207" y1="107" x2="170" y2="65" />
        <line x1="273" y1="107" x2="310" y2="65" />
        <line x1="207" y1="123" x2="170" y2="173" />
        <line x1="273" y1="123" x2="310" y2="173" />
      </g>

      {/* Traveling reasoning signal pulse */}
      <circle cx={pulseX} cy={pulseY} r="6" fill={activeConn.color} fillOpacity="0.3" />
      <circle cx={pulseX} cy={pulseY} r="3.5" fill={activeConn.color} />

      <rect x="207" y="82" width="66" height="66" rx="17" fill="#22436b" stroke="#f5c84c" strokeOpacity=".8" strokeWidth="1.5" />
      <text x="240" y="111" textAnchor="middle" fill="#f5c84c" fontSize="24" fontFamily="Georgia, serif">?</text>
      <text x="240" y="133" textAnchor="middle" fill="#e1ebfa" fontSize="11" fontWeight="600">REASON</text>

      {/* 0: ALGEBRA */}
      <rect x="25" y="25" width="145" height="80" rx="13" fill="#163456" stroke="#7093bf" strokeOpacity=".5" />
      <rect
        x="25"
        y="25"
        width="145"
        height="80"
        rx="13"
        fill="#f5c84c"
        fillOpacity={activeStrand === 0 ? 0.14 : 0.02}
        stroke="#f5c84c"
        strokeOpacity={activeStrand === 0 ? 1 : 0.22}
        strokeWidth="2"
      />
      <text x="40" y="45" fill="#b8cde9" fontSize="10" letterSpacing="1">ALGEBRA</text>
      <text x="40" y="70" fill="#f5f8fd" fontSize="17">2x + 3 = 11</text>
      <text x="40" y="91" fill="#f5c84c" fontSize="13" fontWeight="600">x = 4</text>

      {/* 1: GEOMETRY */}
      <rect x="310" y="25" width="145" height="80" rx="13" fill="#163456" stroke="#7093bf" strokeOpacity=".5" />
      <rect
        x="310"
        y="25"
        width="145"
        height="80"
        rx="13"
        fill="#72d4c9"
        fillOpacity={activeStrand === 1 ? 0.14 : 0.02}
        stroke="#72d4c9"
        strokeOpacity={activeStrand === 1 ? 1 : 0.22}
        strokeWidth="2"
      />
      <text x="325" y="45" fill="#b8cde9" fontSize="10" letterSpacing="1">GEOMETRY</text>
      <path d="M340 89V59L380 89ZM340 82H347V89" fill="none" stroke="#87ddd4" strokeWidth="1.5" />
      <g fill="#f5f8fd" fontSize="11">
        <text x="327" y="77">3</text>
        <text x="357" y="101">4</text>
        <text x="364" y="69">5</text>
      </g>
      <text x="412" y="77" textAnchor="middle" fill="#c2d6f1" fontSize="12">a²+b²=c²</text>

      {/* 2: NUMBER */}
      <rect x="25" y="135" width="145" height="80" rx="13" fill="#163456" stroke="#7093bf" strokeOpacity=".5" />
      <rect
        x="25"
        y="135"
        width="145"
        height="80"
        rx="13"
        fill="#72d4c9"
        fillOpacity={activeStrand === 2 ? 0.14 : 0.02}
        stroke="#72d4c9"
        strokeOpacity={activeStrand === 2 ? 1 : 0.22}
        strokeWidth="2"
      />
      <text x="40" y="155" fill="#b8cde9" fontSize="10" letterSpacing="1">NUMBER</text>
      <text x="40" y="182" fill="#f5f8fd" fontSize="19">¾ = 0.75</text>
      <text x="40" y="202" fill="#87ddd4" fontSize="11">Same value</text>

      {/* 3: DATA */}
      <rect x="310" y="135" width="145" height="80" rx="13" fill="#163456" stroke="#7093bf" strokeOpacity=".5" />
      <rect
        x="310"
        y="135"
        width="145"
        height="80"
        rx="13"
        fill="#f5c84c"
        fillOpacity={activeStrand === 3 ? 0.14 : 0.02}
        stroke="#f5c84c"
        strokeOpacity={activeStrand === 3 ? 1 : 0.22}
        strokeWidth="2"
      />
      <text x="325" y="155" fill="#b8cde9" fontSize="10" letterSpacing="1">DATA</text>
      <text x="325" y="182" fill="#f5f8fd" fontSize="19">2, 4, 6</text>
      <text x="325" y="202" fill="#f5c84c" fontSize="13" fontWeight="600">Mean = 4</text>
    </svg>
  );
}

export default function VisualMathShowcase() {
  const { isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);

  const [running, setRunning] = useState<Record<string, boolean>>({
    featured: true,
    calculus: true,
    precalculus: true,
    gmat: true,
    exam: true,
  });

  // Keep per-card frozen timestamps when individually paused so pausing one card
  // freezes only that card smoothly in place while the others keep running!
  const anyRunning = Object.values(running).some(Boolean);
  const clock = useAnimationClock(anyRunning);
  const [frozenAt, setFrozenAt] = useState<Record<string, number>>({});

  const timeFor = (key: string) => (running[key] !== false ? clock : (frozenAt[key] ?? 0));

  const allRunning = Object.values(running).every(Boolean);
  const toggleAll = () => {
    const next = !allRunning;
    if (!next) {
      setFrozenAt({
        featured: clock,
        calculus: clock,
        precalculus: clock,
        gmat: clock,
        exam: clock,
      });
    }
    setRunning({
      featured: next,
      calculus: next,
      precalculus: next,
      gmat: next,
      exam: next,
    });
  };

  const toggleOne = (key: string) => {
    setRunning((prev) => {
      const next = !prev[key];
      if (!next) {
        setFrozenAt((f) => ({ ...f, [key]: clock }));
      }
      return { ...prev, [key]: next };
    });
  };

  // Featured Function-Lens continuous coordinates:
  // Domain x in [-2, 2], origin (145, 195), 1 x-unit = 48px, 1 y-unit = 34px:
  // Check: x=-2 -> cx=145-96=49, cy=195-4*34=59; x=0 -> (145,195); x=2 -> (241,59)! Exact!
  const tFeat = timeFor('featured');
  const xLive = -2 * Math.cos(tFeat * 0.85); // smoothly sweeps -2 -> +2 -> -2
  const yLive = xLive * xLive;
  const liveCx = 145 + 48 * xLive;
  const liveCy = 195 - 34 * yLive;
  const nearestInt = Math.round(xLive); // -2, -1, 0, 1, 2
  const revealFrac = Math.max(0.08, Math.min(1, (xLive + 2) / 4));

  const tableRows = [
    { xNum: -2, cx: 49, cy: 59, ry: 100, ty: 115, xVal: '−2', yVal: '4' },
    { xNum: -1, cx: 97, cy: 161, ry: 123, ty: 138, xVal: '−1', yVal: '1' },
    { xNum: 0, cx: 145, cy: 195, ry: 146, ty: 161, xVal: '0', yVal: '0' },
    { xNum: 1, cx: 193, cy: 161, ry: 169, ty: 184, xVal: '1', yVal: '1' },
    { xNum: 2, cx: 241, cy: 59, ry: 192, ty: 207, xVal: '2', yVal: '4' },
  ];

  return (
    <section
      id="visual-math"
      className="relative py-20 md:py-28 px-5 lg:px-8 overflow-hidden bg-[color-mix(in_srgb,var(--t-bg-2)_32%,transparent)]"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        <Reveal className="text-center space-y-4">
          <p className="teach-eyebrow">{L(VISUAL_MATH_UI.tag)}</p>
          <h2 className="teach-section-title">
            {L(VISUAL_MATH_UI.titlePrefix)} <em>{L(VISUAL_MATH_UI.titleAccent)}</em>
          </h2>
          <div className="teach-divider" />
          <p className="teach-section-desc">{L(VISUAL_MATH_UI.desc)}</p>
          <div className="pt-1">
            <button
              type="button"
              onClick={toggleAll}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer border border-[color-mix(in_srgb,var(--t-accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--t-glass)_6%,transparent)] text-[var(--t-ink)] hover:border-[var(--t-accent)]"
            >
              {allRunning ? <Pause className="w-3.5 h-3.5 text-[var(--t-accent)]" /> : <Play className="w-3.5 h-3.5 text-[var(--t-accent)]" />}
              {allRunning ? L(VISUAL_MATH_UI.pauseAll) : L(VISUAL_MATH_UI.playAll)}
            </button>
          </div>
        </Reveal>

        {/* Featured Function-Lens Chalkboard Panel */}
        <Reveal>
          <div
            data-theme="dark"
            data-running={running.featured ? 'true' : 'false'}
            className="m-motion-frame teach-card chalk !rounded-3xl p-6 sm:p-9"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 bg-[#0d1f3a] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-inner" dir="ltr">
                <div className="flex items-center justify-between text-xs font-bold tracking-wider text-slate-200 mb-2">
                  <span>{L(VISUAL_MATH_UI.featured.topline)}</span>
                  <span className="text-teal-300 font-mono">
                    ({xLive.toFixed(2)}, {yLive.toFixed(2)}) · {L(VISUAL_MATH_UI.featured.badge)}
                  </span>
                </div>
                <svg
                  viewBox="0 0 480 240"
                  className="w-full h-auto max-h-[240px] block"
                  role="img"
                  aria-label="Three connected views of f(x) = x squared: equation, value table, and parabola."
                >
                  <g fill="none" stroke="#9bb8df" strokeOpacity=".14" strokeWidth="1">
                    <path d="M49 42V211M97 42V211M193 42V211M241 42V211M32 59H260M32 93H260M32 127H260M32 161H260" />
                  </g>
                  <path d="M28 195H267M145 218V30" fill="none" stroke="#a3bfdf" strokeOpacity=".55" strokeWidth="1" />
                  <g fill="#bdd0e8" fontSize="13">
                    <text x="270" y="200">x</text>
                    <text x="151" y="31">y</text>
                    <text x="39" y="219">−2</text>
                    <text x="237" y="219">2</text>
                    <text x="131" y="64">4</text>
                  </g>

                  {/* Base parabola + progressive highlighted trace */}
                  <path d="M49 59Q145 331 241 59" fill="none" stroke="#597eaf" strokeWidth="2" />
                  <path
                    d="M49 59Q145 331 241 59"
                    fill="none"
                    stroke="#80d9ce"
                    strokeWidth="3.2"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1 - revealFrac}
                  />

                  {/* Live moving coordinate projection crosshairs */}
                  <path
                    d={`M${liveCx.toFixed(1)} 195 V${liveCy.toFixed(1)} H145`}
                    fill="none"
                    stroke="#f5c84c"
                    strokeOpacity=".85"
                    strokeWidth="1.5"
                    strokeDasharray="3 4"
                  />

                  <text x="313" y="49" fill="#f5c84c" fontSize="25" fontWeight="600">f(x) = x²</text>
                  <rect x="300" y="70" width="148" height="151" rx="12" fill="#10233f" stroke="#9ab6df" strokeOpacity=".2" />
                  <path d="M311 96H437M373 79V211" fill="none" stroke="#9ab6df" strokeOpacity=".2" />
                  <g fill="#9fbadc" fontSize="13" textAnchor="middle">
                    <text x="335" y="88">x</text>
                    <text x="409" y="88">f(x)</text>
                  </g>

                  {tableRows.map((pt) => {
                    const active = pt.xNum === nearestInt;
                    return (
                      <g key={pt.xVal}>
                        <circle cx={pt.cx} cy={pt.cy} r={active ? 5 : 3.5} fill={active ? '#f5c84c' : '#e1c675'} />
                        {active && (
                          <rect
                            x="309"
                            y={pt.ry}
                            width="130"
                            height="21"
                            rx="4"
                            fill="#f5c84c"
                            fillOpacity=".22"
                            stroke="#f5c84c"
                            strokeOpacity=".65"
                          />
                        )}
                        <g fill={active ? '#fde68a' : '#e4edf9'} fontSize="14" fontWeight={active ? '700' : '400'} textAnchor="middle">
                          <text x="335" y={pt.ty}>{pt.xVal}</text>
                          <text x="409" y={pt.ty}>{pt.yVal}</text>
                        </g>
                      </g>
                    );
                  })}

                  {/* Live continuous tracer point on f(x) = x^2 */}
                  <circle cx={liveCx} cy={liveCy} r="9" fill="#f5c84c" fillOpacity=".22" />
                  <circle cx={liveCx} cy={liveCy} r="5" fill="#f5c84c" stroke="#0d1f3a" strokeWidth="2" />
                </svg>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => toggleOne('featured')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.7rem] text-slate-300 hover:bg-white/10 cursor-pointer bg-transparent border-0"
                  >
                    {running.featured ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {running.featured ? L(VISUAL_MATH_UI.pause) : L(VISUAL_MATH_UI.play)}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-5 text-start">
                <div className="grid grid-cols-1 gap-4">
                  {VISUAL_MATH_UI.featured.modes.map((m, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl p-4 bg-white/[0.04] border border-white/10"
                    >
                      <p className="text-sm font-bold text-amber-300">{L(m.title)}</p>
                      <p className="text-xs leading-relaxed text-slate-300 mt-1">{L(m.desc)}</p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => openAcademyWorkspace('/academy/index.html', L(VISUAL_MATH_UI.featured.cta))}
                  className="teach-btn teach-btn-primary border-0"
                >
                  {L(VISUAL_MATH_UI.featured.cta)}
                  <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* 4 Course Motion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VISUAL_MATH_UI.cards.map((card, i) => {
            const isDarkArt = card.id === 'exam';
            const artBg =
              card.id === 'calculus'
                ? '#eef2fd'
                : card.id === 'precalculus'
                  ? '#edf7f5'
                  : card.id === 'gmat'
                    ? '#f0f3fa'
                    : 'radial-gradient(at 100% 0, #254675, transparent 80%), #13294a';
            const isRunning = running[card.id] !== false;

            return (
              <Reveal key={card.id} delay={0.06 * i}>
                <div
                  data-running={isRunning ? 'true' : 'false'}
                  className="m-motion-frame teach-card h-full flex flex-col overflow-hidden"
                >
                  <div
                    className="p-5 border-b border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] relative"
                    style={{ background: artBg }}
                    dir="ltr"
                  >
                    <div
                      className={`flex items-center justify-between text-[0.65rem] font-bold tracking-wider uppercase mb-2 ${
                        isDarkArt ? 'text-slate-200' : 'text-slate-600'
                      }`}
                    >
                      <span>{L(card.topline)}</span>
                      <span className="font-mono font-medium normal-case">{card.formula}</span>
                    </div>

                    <CardSvg id={card.id} t={timeFor(card.id)} />

                    <div className="flex items-center justify-end gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => toggleOne(card.id)}
                        className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold cursor-pointer border-0 ${
                          isDarkArt
                            ? 'text-slate-200 bg-white/10 hover:bg-white/20'
                            : 'text-slate-700 bg-slate-900/5 hover:bg-slate-900/10'
                        }`}
                      >
                        {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        {isRunning ? L(VISUAL_MATH_UI.pause) : L(VISUAL_MATH_UI.play)}
                      </button>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between gap-4 text-start">
                    <div className="space-y-2">
                      <h3
                        className="text-xl font-bold text-[var(--t-ink)]"
                        style={{ fontFamily: 'var(--teach-font-display)' }}
                      >
                        {L(card.title)}
                      </h3>
                      <p className="text-sm leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_68%,transparent)]">
                        {L(card.caption)}
                      </p>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => openAcademyWorkspace(card.href, L(card.title))}
                        className="inline-flex items-center gap-2 text-xs font-bold text-[var(--t-accent)] hover:underline cursor-pointer bg-transparent border-0 p-0"
                      >
                        {L(card.cta)}
                        <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

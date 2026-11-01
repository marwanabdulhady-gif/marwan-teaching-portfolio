import { useState } from 'react';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { VISUAL_MATH_UI } from '../academyData';
import { openAcademyWorkspace } from './SearchPalette';
import Reveal from './Reveal';

function CardSvg({ id }: { id: string }) {
  if (id === 'calculus') {
    return (
      <svg
        viewBox="0 0 480 230"
        className="w-full h-auto max-h-[210px] block"
        role="img"
        aria-label="For y equals x squared, secants through (1, 1) approach the tangent slope 2."
      >
        <g stroke="#9cb4d9" strokeOpacity=".35" strokeWidth="1">
          <path d="M55 185H405M115 205V20" />
          <path d="M175 181V189M235 181V189M295 181V189M111 160H119M111 85H119" />
        </g>
        <g fill="#536885" fontSize="11">
          <text x="410" y="189">x</text>
          <text x="120" y="23">y</text>
          <text x="169" y="204">1</text>
          <text x="229" y="204">2</text>
          <text x="99" y="163">1</text>
        </g>
        <path d="M7 104 Q139 302 271 16" fill="none" stroke="#3158d7" strokeWidth="3" />
        <path d="M91 230L331 30" fill="none" stroke="#087f8c" strokeWidth="2" strokeDasharray="5 5" />
        <g className="m-secant m-secant-1" stroke="#b4770a" fill="#b4770a">
          <path d="M100 272.5L300 -27.5" fill="none" strokeWidth="2" />
          <circle cx="271" cy="16" r="5" />
        </g>
        <g className="m-secant m-secant-2" stroke="#b4770a" fill="#b4770a">
          <path d="M100 247.5L300 14.17" fill="none" strokeWidth="2" />
          <circle cx="223" cy="104" r="5" />
        </g>
        <g className="m-secant m-secant-3" stroke="#b4770a" fill="#b4770a">
          <path d="M100 228.75L300 45.42" fill="none" strokeWidth="2" />
          <circle cx="187" cy="149" r="5" />
        </g>
        <circle cx="175" cy="160" r="5" fill="#3158d7" stroke="white" strokeWidth="2" />
        <text x="298" y="60" fill="#3158d7" fontSize="17" fontWeight="600">f(x) = x²</text>
        <text x="298" y="82" fill="#087f8c" fontSize="12">f′(1) = 2</text>
        <text x="298" y="117" fill="#536885" fontSize="11">Secant → tangent</text>
      </svg>
    );
  }

  if (id === 'precalculus') {
    return (
      <svg
        viewBox="0 0 480 230"
        className="w-full h-auto max-h-[210px] block"
        role="img"
        aria-label="The graph y equals x squared shifts right one unit to y equals (x minus 1) squared."
      >
        <g stroke="#7ba9aa" strokeOpacity=".35" strokeWidth="1">
          <path d="M60 185H413M170 205V25" />
          <path d="M220 181V189" />
        </g>
        <g fill="#476d73" fontSize="11">
          <text x="417" y="189">x</text>
          <text x="175" y="26">y</text>
          <text x="164" y="203">0</text>
          <text x="216" y="203">1</text>
        </g>
        <path d="M70 45Q170 325 270 45" fill="none" stroke="#729998" strokeWidth="2" strokeDasharray="5 5" />
        <g className="m-transformed-curve">
          <path d="M70 45Q170 325 270 45" fill="none" stroke="#087f8c" strokeWidth="3" />
          <circle cx="170" cy="185" r="5" fill="#087f8c" stroke="white" strokeWidth="2" />
        </g>
        <path d="M177 148H214M207 142L214 148L207 154" fill="none" stroke="#087f8c" strokeWidth="1.5" />
        <text x="182" y="137" fill="#087f8c" fontSize="12" fontWeight="600">+1</text>
        <text x="304" y="73" fill="#476d73" fontSize="12">f(x) = x²</text>
        <text x="304" y="99" fill="#087f8c" fontSize="14" fontWeight="600">g(x) = (x − 1)²</text>
        <text x="304" y="124" fill="#476d73" fontSize="11">Same shape. New position.</text>
      </svg>
    );
  }

  if (id === 'gmat') {
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
        <g className="m-data-bar-1">
          <rect x="89" y="138" width="42" height="48" rx="5" fill="#3158d7" />
          <text x="110" y="128" textAnchor="middle" fill="#233f96" fontSize="13" fontWeight="600">12</text>
        </g>
        <g className="m-data-bar-2">
          <rect x="164" y="114" width="42" height="72" rx="5" fill="#087f8c" />
          <text x="185" y="104" textAnchor="middle" fill="#08717b" fontSize="13" fontWeight="600">18</text>
        </g>
        <g className="m-data-bar-3">
          <rect x="239" y="90" width="42" height="96" rx="5" fill="#3158d7" />
          <text x="260" y="80" textAnchor="middle" fill="#233f96" fontSize="13" fontWeight="600">24</text>
        </g>
        <g fill="#536885" fontSize="11" textAnchor="middle">
          <text x="110" y="205">A</text>
          <text x="185" y="205">B</text>
          <text x="260" y="205">C</text>
        </g>
        <text x="324" y="108" fill="#233f96" fontSize="25" fontWeight="600">C = 2A</text>
        <text x="324" y="133" fill="#536885" fontSize="11">Read. Compare. Reason.</text>
        <text x="324" y="153" fill="#536885" fontSize="10">Data Insights</text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 480 230"
      className="w-full h-auto max-h-[210px] block"
      role="img"
      aria-label="Connected exam strands: Algebra, Geometry, Number and Data."
    >
      <g fill="none" stroke="#8caad5" strokeOpacity=".45" strokeWidth="1.5">
        <path d="M170 65C201 65 184 107 207 107M310 65C279 65 296 107 273 107" />
        <path d="M170 173C201 173 184 123 207 123M310 173C279 173 296 123 273 123" />
      </g>
      <rect x="207" y="82" width="66" height="66" rx="17" fill="#22436b" stroke="#91accf" strokeOpacity=".6" />
      <text x="240" y="111" textAnchor="middle" fill="#f5c84c" fontSize="24" fontFamily="Georgia, serif">?</text>
      <text x="240" y="133" textAnchor="middle" fill="#e1ebfa" fontSize="11">REASON</text>

      <rect x="25" y="25" width="145" height="80" rx="13" fill="#163456" stroke="#7093bf" strokeOpacity=".5" />
      <rect className="m-topic-highlight m-topic-1" x="25" y="25" width="145" height="80" rx="13" fill="#f5c84c" fillOpacity=".055" stroke="#f5c84c" strokeWidth="1.8" />
      <text x="40" y="45" fill="#b8cde9" fontSize="10" letterSpacing="1">ALGEBRA</text>
      <text x="40" y="70" fill="#f5f8fd" fontSize="17">2x + 3 = 11</text>
      <text x="40" y="91" fill="#f5c84c" fontSize="13">x = 4</text>

      <rect x="310" y="25" width="145" height="80" rx="13" fill="#163456" stroke="#7093bf" strokeOpacity=".5" />
      <rect className="m-topic-highlight m-topic-2" x="310" y="25" width="145" height="80" rx="13" fill="#72d4c9" fillOpacity=".055" stroke="#72d4c9" strokeWidth="1.8" />
      <text x="325" y="45" fill="#b8cde9" fontSize="10" letterSpacing="1">GEOMETRY</text>
      <path d="M340 89V59L380 89ZM340 82H347V89" fill="none" stroke="#87ddd4" strokeWidth="1.5" />
      <g fill="#f5f8fd" fontSize="11">
        <text x="327" y="77">3</text>
        <text x="357" y="101">4</text>
        <text x="364" y="69">5</text>
      </g>
      <text x="401" y="77" textAnchor="middle" fill="#c2d6f1" fontSize="12">a²+b²=c²</text>

      <rect x="25" y="135" width="145" height="80" rx="13" fill="#163456" stroke="#7093bf" strokeOpacity=".5" />
      <rect className="m-topic-highlight m-topic-3" x="25" y="135" width="145" height="80" rx="13" fill="#72d4c9" fillOpacity=".055" stroke="#72d4c9" strokeWidth="1.8" />
      <text x="40" y="155" fill="#b8cde9" fontSize="10" letterSpacing="1">NUMBER</text>
      <text x="40" y="182" fill="#f5f8fd" fontSize="19">¾ = 0.75</text>
      <text x="40" y="202" fill="#87ddd4" fontSize="11">Same value</text>

      <rect x="310" y="135" width="145" height="80" rx="13" fill="#163456" stroke="#7093bf" strokeOpacity=".5" />
      <rect className="m-topic-highlight m-topic-4" x="310" y="135" width="145" height="80" rx="13" fill="#f5c84c" fillOpacity=".055" stroke="#f5c84c" strokeWidth="1.8" />
      <text x="325" y="155" fill="#b8cde9" fontSize="10" letterSpacing="1">DATA</text>
      <text x="325" y="182" fill="#f5f8fd" fontSize="19">2, 4, 6</text>
      <text x="325" y="202" fill="#f5c84c" fontSize="13">Mean = 4</text>
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

  const allRunning = Object.values(running).every(Boolean);
  const toggleAll = () => {
    const next = !allRunning;
    setRunning({
      featured: next,
      calculus: next,
      precalculus: next,
      gmat: next,
      exam: next,
    });
  };

  const toggleOne = (key: string) =>
    setRunning((prev) => ({ ...prev, [key]: !prev[key] }));

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
                  <span className="text-teal-300 font-mono">{L(VISUAL_MATH_UI.featured.badge)}</span>
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
                  <path d="M49 59Q145 331 241 59" fill="none" stroke="#597eaf" strokeWidth="2" />
                  <path className="m-lens-curve" d="M49 59Q145 331 241 59" fill="none" stroke="#80d9ce" strokeWidth="3" pathLength="1" />
                  <text x="313" y="49" fill="#f5c84c" fontSize="25" fontWeight="600">f(x) = x²</text>
                  <rect x="300" y="70" width="148" height="151" rx="12" fill="#10233f" stroke="#9ab6df" strokeOpacity=".2" />
                  <path d="M311 96H437M373 79V211" fill="none" stroke="#9ab6df" strokeOpacity=".2" />
                  <g fill="#9fbadc" fontSize="13" textAnchor="middle">
                    <text x="335" y="88">x</text>
                    <text x="409" y="88">f(x)</text>
                  </g>

                  {[
                    { cx: 49, cy: 59, ry: 100, ty: 115, xVal: '-2', yVal: '4', cls: 'm-lens-1' },
                    { cx: 97, cy: 161, ry: 123, ty: 138, xVal: '-1', yVal: '1', cls: 'm-lens-2' },
                    { cx: 145, cy: 195, ry: 146, ty: 161, xVal: '0', yVal: '0', cls: 'm-lens-3' },
                    { cx: 193, cy: 161, ry: 169, ty: 184, xVal: '1', yVal: '1', cls: 'm-lens-4' },
                    { cx: 241, cy: 59, ry: 192, ty: 207, xVal: '2', yVal: '4', cls: 'm-lens-5' },
                  ].map((pt) => (
                    <g key={pt.xVal}>
                      <circle cx={pt.cx} cy={pt.cy} r="4" fill="#e1c675" />
                      <g className={`m-lens-highlight ${pt.cls}`}>
                        <path d={`M${pt.cx} 195V${pt.cy}H145`} fill="none" stroke="#e1c675" strokeOpacity=".7" strokeDasharray="3 4" />
                        <circle cx={pt.cx} cy={pt.cy} r="8" fill="#f5c84c" fillOpacity=".14" stroke="#f5c84c" strokeWidth="1.5" />
                        <rect x="309" y={pt.ry} width="130" height="21" rx="4" fill="#f5c84c" fillOpacity=".14" />
                      </g>
                      <g fill="#e4edf9" fontSize="14" textAnchor="middle">
                        <text x="335" y={pt.ty}>{pt.xVal}</text>
                        <text x="409" y={pt.ty}>{pt.yVal}</text>
                      </g>
                    </g>
                  ))}
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
                    className="p-5 pb-3 border-b border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)] relative"
                    style={{ background: artBg }}
                    dir="ltr"
                  >
                    <div
                      className={`flex items-center justify-between text-[0.62rem] font-bold tracking-[0.14em] uppercase mb-1 ${
                        isDarkArt ? 'text-slate-200' : 'text-slate-600'
                      }`}
                    >
                      <span>{L(card.topline)}</span>
                      <span className="font-mono tracking-normal">{card.formula}</span>
                    </div>

                    <CardSvg id={card.id} />

                    <div className="flex justify-end mt-1">
                      <button
                        type="button"
                        onClick={() => toggleOne(card.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[0.68rem] font-semibold cursor-pointer bg-transparent border-0 ${
                          isDarkArt ? 'text-slate-200 hover:bg-white/10' : 'text-slate-600 hover:bg-black/5'
                        }`}
                      >
                        {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        {isRunning ? L(VISUAL_MATH_UI.pause) : L(VISUAL_MATH_UI.play)}
                      </button>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between gap-4 text-start">
                    <div className="space-y-1.5">
                      <h3
                        className="text-xl sm:text-2xl font-black text-[var(--t-ink)] leading-snug"
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
                        className="inline-flex items-center gap-2 text-xs font-bold text-[var(--t-accent-deep)] hover:text-[var(--t-accent)] cursor-pointer bg-transparent border-0 p-0"
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

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Gamepad2, Maximize2, Minimize2, Play, Users, X } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { ARCADE, type ArcadeTier } from '../teachingData';
import LiveRooms from './LiveRooms';
import Reveal from './Reveal';

const TIER_ORDER: ArcadeTier[] = ['class', 'easy', 'medium', 'hard'];

const TIER_COLORS: Record<ArcadeTier, string> = {
  class: 'from-amber-400 to-rose-500 text-[#fff]',
  easy: 'from-emerald-400 to-teal-500 text-[#fff]',
  medium: 'from-cyan-400 to-blue-500 text-[#fff]',
  hard: 'from-violet-500 to-fuchsia-500 text-[#fff]',
};

export default function MathLab() {
  const { isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);

  const [arcadeTab, setArcadeTab] = useState<'games' | 'rooms'>('games');
  const [tierFilter, setTierFilter] = useState<'all' | ArcadeTier>('all');
  const [frameSrc, setFrameSrc] = useState<string | null>(null);
  const [frameTitle, setFrameTitle] = useState<string>('');
  const [expanded, setExpanded] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  const openArcadeUrl = (url: string, title: string) => {
    setArcadeTab('games');
    setFrameSrc(url);
    setFrameTitle(title);
    requestAnimationFrame(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ id?: string; slug?: string; title?: string }>).detail;
      const gameId = detail?.id ?? detail?.slug;
      if (!gameId) return;
      const found = ARCADE.games.find((g) => g.id === gameId);
      if (found) {
        openArcadeUrl(ARCADE.play(found.id), detail?.title || found.title.en);
      } else {
        openArcadeUrl(ARCADE.home, detail?.title || ARCADE.frameTitle.en);
      }
    };
    window.addEventListener('marwan:open-arcade', handler);
    return () => window.removeEventListener('marwan:open-arcade', handler);
  }, []);

  const visibleTiers =
    tierFilter === 'all' ? TIER_ORDER : TIER_ORDER.filter((t) => t === tierFilter);

  return (
    <section
      id="lab"
      className="relative py-14 md:py-20 px-5 lg:px-8 overflow-hidden bg-[color-mix(in_srgb,var(--t-bg-2)_45%,transparent)]"
    >
      <div className="absolute -top-24 start-1/4 w-[460px] h-[460px] rounded-full bg-cyan-500/[0.08] blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative space-y-10">
        <Reveal className="text-center space-y-4">
          <p className="teach-eyebrow">{L(ARCADE.tag)}</p>
          <h2 className="teach-section-title">
            {L(ARCADE.titlePrefix)} <em>{L(ARCADE.titleAccent)}</em>
          </h2>
          <div className="teach-divider" />
          <p className="teach-section-desc">{L(ARCADE.desc)}</p>
        </Reveal>

        {/* Segmented Mode Bar: 18 Games vs Live 1-v-1 Rooms + Full Arcade Launcher */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[color-mix(in_srgb,var(--t-card)_85%,transparent)] border border-[color-mix(in_srgb,var(--t-ink)_10%,transparent)]">
            <button
              type="button"
              onClick={() => setArcadeTab('games')}
              aria-pressed={arcadeTab === 'games'}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-all border-0 ${
                arcadeTab === 'games'
                  ? 'bg-[var(--t-accent)] text-[#fff] shadow-md'
                  : 'bg-transparent text-[color-mix(in_srgb,var(--t-ink)_72%,transparent)] hover:text-[var(--t-ink)]'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              {isRtl ? `تصفّح الألعاب (${ARCADE.games.length})` : `Browse ${ARCADE.games.length} Games`}
            </button>
            <button
              type="button"
              onClick={() => setArcadeTab('rooms')}
              aria-pressed={arcadeTab === 'rooms'}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-all border-0 ${
                arcadeTab === 'rooms'
                  ? 'bg-[var(--t-accent)] text-[#fff] shadow-md'
                  : 'bg-transparent text-[color-mix(in_srgb,var(--t-ink)_72%,transparent)] hover:text-[var(--t-ink)]'
              }`}
            >
              <Users className="w-4 h-4" />
              {isRtl ? 'غرف التحدّي المباشرة (١ ضد ١)' : 'Live 1-v-1 Rooms'}
            </button>
          </div>

          {arcadeTab === 'games' && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setTierFilter('all')}
                aria-pressed={tierFilter === 'all'}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all border ${
                  tierFilter === 'all'
                    ? 'border-[var(--t-accent)] bg-[var(--t-accent)] text-[#fff]'
                    : 'border-[color-mix(in_srgb,var(--t-ink)_16%,transparent)] bg-transparent text-[var(--t-ink)] hover:border-[var(--t-accent)]'
                }`}
              >
                {isRtl ? `الكل (${ARCADE.games.length})` : `All (${ARCADE.games.length})`}
              </button>
              {TIER_ORDER.map((tKey) => {
                const count = ARCADE.games.filter((g) => g.tier === tKey).length;
                const on = tierFilter === tKey;
                return (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => setTierFilter(tKey)}
                    aria-pressed={on}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all border ${
                      on
                        ? 'border-[var(--t-accent)] bg-[var(--t-accent)] text-[#fff]'
                        : 'border-[color-mix(in_srgb,var(--t-ink)_16%,transparent)] bg-transparent text-[var(--t-ink)] hover:border-[var(--t-accent)]'
                    }`}
                  >
                    {L(ARCADE.tiers[tKey])} ({count})
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => openArcadeUrl(ARCADE.home, L(ARCADE.frameTitle))}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all border border-[color-mix(in_srgb,var(--t-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--t-accent)_12%,transparent)] text-[var(--t-accent)] hover:bg-[var(--t-accent)] hover:text-[#fff] inline-flex items-center gap-1.5"
              >
                <Play className="w-3 h-3" />
                {L(ARCADE.launch)}
              </button>
            </div>
          )}
        </div>

        {/* Live 1-v-1 Rooms Tab */}
        {arcadeTab === 'rooms' && <LiveRooms />}

        {/* Games Catalogue Tab */}
        {arcadeTab === 'games' && (
          <>
            {frameSrc && (
              <div
                ref={playerRef}
                data-theme="dark"
                className={`teach-card chalk !p-0 overflow-hidden transition-all ${
                  expanded ? 'fixed inset-3 z-50 !rounded-2xl flex flex-col' : ''
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-white/10 bg-[#0b1022]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Gamepad2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <p className="text-sm font-bold truncate">{frameTitle || L(ARCADE.frameTitle)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={frameSrc}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors inline-flex items-center gap-1.5"
                    >
                      {L(ARCADE.openNewTab)} <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setExpanded((v) => !v)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer border-0 text-white"
                      aria-label={expanded ? 'Shrink' : 'Expand'}
                    >
                      {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setExpanded(false);
                        setFrameSrc(null);
                      }}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500/40 flex items-center justify-center cursor-pointer border-0 text-white"
                      aria-label={L(ARCADE.close)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <iframe
                  key={frameSrc}
                  src={frameSrc}
                  title={frameTitle || ARCADE.frameTitle.en}
                  className={`w-full border-0 bg-[#070b18] ${expanded ? 'flex-1' : 'h-[72vh] min-h-[520px]'}`}
                />
              </div>
            )}

            <div className="space-y-9">
              {visibleTiers.map((tierKey) => {
                const games = ARCADE.games.filter((g) => g.tier === tierKey);
                return (
                  <div key={tierKey} className="space-y-4">
                    <Reveal className="flex flex-wrap items-center justify-between gap-2 text-start">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r ${TIER_COLORS[tierKey]}`}
                      >
                        <Gamepad2 className="w-3.5 h-3.5" />
                        {L(ARCADE.tiers[tierKey])}
                      </span>
                      <span className="text-xs font-semibold text-[color-mix(in_srgb,var(--t-ink)_45%,transparent)]">
                        {games.length} {isRtl ? 'ألعاب' : 'games'}
                      </span>
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {games.map((g, idx) => {
                        const targetUrl = ARCADE.play(g.id);
                        const isPlaying = frameSrc === targetUrl;
                        return (
                          <Reveal key={g.id} delay={0.025 * idx}>
                            <button
                              type="button"
                              onClick={() => openArcadeUrl(targetUrl, L(g.title))}
                              className={`teach-card group w-full h-full p-5 flex items-start gap-4 text-start cursor-pointer bg-transparent transition-all ${
                                isPlaying ? '!border-[var(--t-accent)] ring-2 ring-[var(--t-accent)]/30' : ''
                              }`}
                            >
                              <span
                                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${TIER_COLORS[g.tier]} flex items-center justify-center text-2xl shrink-0 shadow-md group-hover:scale-105 transition-transform`}
                              >
                                {g.icon}
                              </span>
                              <span className="min-w-0 flex-1 space-y-1">
                                <span className="flex items-center justify-between gap-2">
                                  <span
                                    className="font-bold text-base text-[var(--t-ink)] truncate"
                                    style={{ fontFamily: 'var(--teach-font-display)' }}
                                  >
                                    {L(g.title)}
                                  </span>
                                  <span className="text-xs font-bold text-[var(--t-accent-deep)] shrink-0 opacity-75 group-hover:opacity-100">
                                    {isRtl ? 'العب ←' : 'Play →'}
                                  </span>
                                </span>
                                <span className="block text-[0.82rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_66%,transparent)]">
                                  {L(g.desc)}
                                </span>
                              </span>
                            </button>
                          </Reveal>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

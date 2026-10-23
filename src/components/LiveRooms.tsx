import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Bot, Copy, LogOut, Maximize2, Play, Swords, Users, X } from 'lucide-react';
import { useLocale } from '../LocaleContext';
import { ROOMS } from '../teachingData';
import { ARCADE_URL, LiveRoom, type GameId, type Note } from '../rooms/liveRoom';
import Reveal from './Reveal';

const NAME_KEY = 'mtp_player_name';
const store = {
  get: (k: string) => { try { return localStorage.getItem(k) || ''; } catch { return ''; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

/**
 * ⚔ Live rooms: Math Fighter and Tug of War between two devices (src/rooms/liveRoom.ts), plus a
 * robot to practise against. The lobby lives on a chalkboard in the Math Lab; the match opens
 * full-screen over the page.
 */
export default function LiveRooms() {
  const { isRtl } = useLocale();
  const L = (o: { en: string; ar: string }) => (isRtl ? o.ar : o.en);
  const roomRef = useRef<LiveRoom | null>(null);
  if (!roomRef.current) roomRef.current = new LiveRoom();
  const room = roomRef.current;
  const s = useSyncExternalStore(room.subscribe, room.getSnapshot);

  const [name, setName] = useState(() => store.get(NAME_KEY));
  const [code, setCode] = useState('');
  const [toast, setToast] = useState('');
  const [copied, setCopied] = useState(false);
  const toastT = useRef(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => { room.mount(); return () => room.dispose(); }, [room]);
  useEffect(() => { room.name = name.trim().slice(0, 20); store.set(NAME_KEY, name.trim().slice(0, 20)); }, [name, room]);

  /* an invite link (?room=ABCD) fills in the code */
  useEffect(() => {
    try {
      const c = new URLSearchParams(location.search).get('room');
      if (c && /^[A-Z0-9]{4}$/i.test(c)) setCode(c.toUpperCase());
    } catch { /* no URL */ }
  }, []);

  const notes = ROOMS.notes as Record<Note, { en: string; ar: string }>;
  useEffect(() => {
    room.onNote(n => {
      setToast(L(notes[n]).replace('{n}', room.snap.oppName || '…'));
      clearTimeout(toastT.current);
      toastT.current = window.setTimeout(() => setToast(''), 4500);
    });
  });

  /* the match takes the whole screen: the page underneath stops scrolling */
  const playing = s.phase === 'play';
  useEffect(() => {
    if (!playing) return;
    const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
    lenis?.stop();
    document.body.style.overflow = 'hidden';
    return () => {
      lenis?.start();
      document.body.style.overflow = '';
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    };
  }, [playing]);

  const game = ROOMS.games.find(g => g.id === s.game) || ROOMS.games[0];
  const levelLabel = ROOMS.levels.find(l => l.v === s.level) || ROOMS.levels[1];
  const ready = name.trim().length > 0;
  const inRoom = s.phase === 'connecting' || s.phase === 'wait' || s.phase === 'ready';
  const canEdit = s.phase === 'lobby' || s.host;

  const invite = () => {
    const url = `${location.origin}${location.pathname}?room=${s.room}#lab`;
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done);
    else done();
  };
  const fullScreen = () => {
    const el = overlayRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void el.requestFullscreen?.().catch(() => {});
  };

  const chip = (on: boolean) =>
    `px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors cursor-pointer ${
      on
        ? 'border-[var(--t-accent)] bg-[color-mix(in_srgb,var(--t-accent)_18%,transparent)] text-[var(--t-ink)]'
        : 'border-[color-mix(in_srgb,var(--t-ink)_18%,transparent)] text-[color-mix(in_srgb,var(--t-ink)_75%,transparent)] hover:border-[var(--t-accent)]'
    } disabled:opacity-50 disabled:cursor-default`;
  const field = 'w-full rounded-xl px-4 py-3 bg-[color-mix(in_srgb,var(--t-ink)_7%,transparent)] border border-[color-mix(in_srgb,var(--t-ink)_18%,transparent)] text-[var(--t-ink)] placeholder:text-[color-mix(in_srgb,var(--t-ink)_40%,transparent)] focus:outline-none focus:border-[var(--t-accent)]';
  const label = 'block text-[0.7rem] font-bold uppercase tracking-widest text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)] mb-2';

  return (
    <Reveal>
      <div id="rooms" data-theme="dark" className="teach-card chalk !rounded-3xl p-6 sm:p-10 relative overflow-hidden text-start">
        <div className="absolute inset-0 teach-grid-bg opacity-40 pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Intro */}
          <div className="lg:col-span-5 space-y-4">
            <p className="teach-eyebrow">{L(ROOMS.tag)}</p>
            <h3 className="text-3xl sm:text-4xl font-black leading-tight" style={{ fontFamily: 'var(--teach-font-display)' }}>
              {L(ROOMS.title)}
            </h3>
            <p className="text-[0.95rem] leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_72%,transparent)]">{L(ROOMS.desc)}</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {ROOMS.games.map(g => (
                <button
                  key={g.id}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => room.choose({ game: g.id as GameId })}
                  aria-pressed={s.game === g.id}
                  className={`rounded-2xl p-4 text-start border-2 transition-all cursor-pointer disabled:cursor-default ${
                    s.game === g.id
                      ? 'border-[var(--t-accent)] bg-[color-mix(in_srgb,var(--t-accent)_14%,transparent)] shadow-lg shadow-black/30'
                      : 'border-[color-mix(in_srgb,var(--t-ink)_14%,transparent)] hover:border-[color-mix(in_srgb,var(--t-accent)_60%,transparent)]'
                  }`}
                >
                  <span className="block text-4xl mb-2" aria-hidden="true">{g.icon}</span>
                  <span className="block font-black text-lg">{L(g.title)}</span>
                  <span className="block text-xs leading-snug mt-1 text-[color-mix(in_srgb,var(--t-ink)_62%,transparent)]">{L(g.rule)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lobby / room */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl p-5 sm:p-7 bg-[color-mix(in_srgb,var(--t-ink)_5%,transparent)] border border-[color-mix(in_srgb,var(--t-ink)_12%,transparent)] space-y-5">
              {!inRoom ? (
                <>
                  <div>
                    <label className={label} htmlFor="room-name">{L(ROOMS.name)}</label>
                    <input id="room-name" className={field} value={name} maxLength={20} placeholder={L(ROOMS.namePh)} onChange={e => setName(e.target.value)} autoComplete="nickname" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={label} htmlFor="room-level">{L(ROOMS.level)}</label>
                      <select id="room-level" className={`${field} cursor-pointer`} value={s.level} onChange={e => room.choose({ level: Number(e.target.value) })}>
                        {ROOMS.levels.map(l => <option key={l.v} value={l.v} className="text-black">{L(l.label)}</option>)}
                      </select>
                    </div>
                    <div>
                      <span className={label}>{L(ROOMS.time)}</span>
                      <div className="flex gap-2">
                        {ROOMS.lengths.map(m => (
                          <button key={m} type="button" className={chip(s.secs === m * 60)} onClick={() => room.choose({ secs: m * 60 })}>
                            {m} {L(ROOMS.minutes)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button type="button" disabled={!ready} onClick={() => room.make()} className="teach-btn teach-btn-primary border-0 w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                    <Swords className="w-4 h-4" /> {L(ROOMS.make)}
                  </button>
                  <div className="flex items-center gap-3 text-xs text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)]">
                    <span className="h-px flex-1 bg-[color-mix(in_srgb,var(--t-ink)_15%,transparent)]" />
                    {L(ROOMS.or)}
                    <span className="h-px flex-1 bg-[color-mix(in_srgb,var(--t-ink)_15%,transparent)]" />
                  </div>
                  <form
                    className="flex gap-2"
                    onSubmit={e => { e.preventDefault(); if (ready && code.length === 4) room.join(code); }}
                  >
                    <input
                      className={`${field} font-mono text-xl tracking-[0.4em] text-center uppercase`}
                      value={code}
                      maxLength={4}
                      placeholder={L(ROOMS.codePh)}
                      aria-label={L(ROOMS.codePh)}
                      autoCapitalize="characters"
                      autoComplete="off"
                      spellCheck={false}
                      dir="ltr"
                      onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4))}
                    />
                    <button type="submit" disabled={!ready || code.length !== 4} className="teach-btn teach-btn-secondary shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Users className="w-4 h-4" /> {L(ROOMS.join)}
                    </button>
                  </form>
                  <div className="pt-1 space-y-2">
                    <p className="text-xs text-[color-mix(in_srgb,var(--t-ink)_60%,transparent)] flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" /> {L(ROOMS.robot)}</p>
                    <div className="flex flex-wrap gap-2">
                      {ROOMS.skills.map((k, i) => (
                        <button key={k.en} type="button" className={chip(false)} onClick={() => room.robot(i + 1)}>
                          🤖 {L(k)}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-5 text-center">
                  <p className="text-sm text-[color-mix(in_srgb,var(--t-ink)_65%,transparent)]">
                    {game.icon} {L(game.title)} · {L(levelLabel.label)} · {s.secs / 60} {L(ROOMS.minutes)}
                  </p>
                  {s.phase === 'connecting' ? (
                    <p className="py-8 animate-pulse">{L(ROOMS.connecting)}</p>
                  ) : (
                    <>
                      <div>
                        <p className={label}>{L(ROOMS.roomIs)}</p>
                        <p className="font-mono font-black text-5xl sm:text-6xl tracking-[0.3em] text-[var(--t-sun)]" dir="ltr">{s.room}</p>
                      </div>
                      {s.host && s.phase === 'wait' && (
                        <>
                          <p className="text-sm leading-relaxed text-[color-mix(in_srgb,var(--t-ink)_70%,transparent)] max-w-md mx-auto">{L(ROOMS.tell)}</p>
                          <button type="button" onClick={invite} className="teach-btn teach-btn-secondary mx-auto">
                            <Copy className="w-4 h-4" /> {copied ? L(ROOMS.copied) : L(ROOMS.copy)}
                          </button>
                        </>
                      )}
                      <div className="flex items-center justify-center gap-4 py-2">
                        <span className="px-4 py-2 rounded-full bg-[color-mix(in_srgb,var(--t-accent)_22%,transparent)] font-bold"><bdi>{name || '…'}</bdi></span>
                        <span className="text-xs uppercase tracking-widest opacity-60">{L(ROOMS.vs)}</span>
                        <span className={`px-4 py-2 rounded-full font-bold ${s.oppName ? 'bg-[color-mix(in_srgb,var(--t-sky)_25%,transparent)]' : 'border border-dashed border-[color-mix(in_srgb,var(--t-ink)_30%,transparent)] animate-pulse'}`}>
                          <bdi>{s.oppName || L(ROOMS.waiting)}</bdi>
                        </span>
                      </div>
                      {s.phase === 'ready' && (s.host ? (
                        <button type="button" onClick={() => room.start()} className="teach-btn teach-btn-primary border-0 mx-auto">
                          <Play className="w-4 h-4" fill="currentColor" /> {L(ROOMS.start)}
                        </button>
                      ) : (
                        <p className="text-sm animate-pulse">{L(ROOMS.waitHost).replace('{n}', s.oppName)}</p>
                      ))}
                    </>
                  )}
                  <button type="button" onClick={() => room.leave()} className="inline-flex items-center gap-1.5 text-xs text-[color-mix(in_srgb,var(--t-ink)_55%,transparent)] hover:text-[var(--t-accent)] cursor-pointer">
                    <LogOut className="w-3.5 h-3.5" /> {L(ROOMS.leave)}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {toast && !playing && (
          <p role="status" className="relative z-10 mt-6 text-center text-sm font-semibold text-[var(--t-sun)]">{toast}</p>
        )}
      </div>

      {/* The match, full-screen over the page */}
      {playing && createPortal(
        <div ref={overlayRef} className="fixed inset-0 z-[1000] flex flex-col bg-[#13233f]" data-theme="dark" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="flex items-center gap-3 px-3 sm:px-5 py-2.5 text-[#fdf8f0] border-b border-white/10">
            <button type="button" onClick={() => room.quitMatch()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-semibold cursor-pointer">
              {s.robot ? <X className="w-4 h-4" /> : <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />}
              {s.robot ? L(ROOMS.exit) : L(ROOMS.back)}
            </button>
            <span className="flex-1 min-w-0 truncate text-sm font-bold text-center">
              {game.icon} {L(game.title)} · <bdi>{name || '…'}</bdi> {L(ROOMS.vs)} <bdi>{s.robot ? '🤖' : s.oppName}</bdi>
            </span>
            {!s.robot && (
              <span className="hidden sm:inline font-mono text-sm px-3 py-1 rounded-full bg-white/10" dir="ltr">{s.score.me} – {s.score.opp}</span>
            )}
            <button type="button" onClick={fullScreen} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm cursor-pointer" aria-label={L(ROOMS.fs)}>
              <Maximize2 className="w-4 h-4" /><span className="hidden sm:inline">{L(ROOMS.fs)}</span>
            </button>
          </div>
          {toast && <p role="status" className="absolute top-16 inset-x-0 mx-auto w-fit z-10 px-4 py-2 rounded-full bg-[#f6c445] text-[#13233f] text-sm font-bold shadow-xl">{toast}</p>}
          <iframe
            ref={f => room.attachFrame(f)}
            src={ARCADE_URL}
            title={`${L(game.title)} · ${L(ROOMS.tag)}`}
            className="flex-1 w-full border-0 bg-[#fbf6ee]"
            allow="fullscreen; autoplay"
          />
        </div>,
        document.body,
      )}
    </Reveal>
  );
}

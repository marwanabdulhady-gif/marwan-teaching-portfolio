/**
 * ⚔ Live rooms for the Math Lab: Math Fighter and Tug of War between two players on two devices,
 * ported from the FIKR games page's Live challenge (fikr-dashboard public/js/duel.js) without the
 * school parts (pupil codes, tracking, the class tournament).
 *
 * One player makes a room (a 4-letter code) and picks the game, the maths and the length; the other
 * joins with the code. Each device opens the real game in the arcade (public/arcade, the hub's online
 * mode). A player's own answer counts at once on their screen and is sent, numbered, to the other
 * device, whose game applies the answers in the same order — so the same punches and pulls happen on
 * both screens. At the bell the host's game decides and the other screen ends with it.
 *
 * Also 🤖 a match against the hub's robot, for a visitor on their own.
 */
import { openTransport, type Member, type Transport } from './transport';

export type GameId = 'math-fighter' | 'tug-of-war';
export type Phase = 'lobby' | 'connecting' | 'wait' | 'ready' | 'play';
export type Note = 'full' | 'noRoom' | 'offline' | 'oppLeft' | 'won' | 'lost' | 'robotWon' | 'robotLost';

export type Snapshot = {
  phase: Phase;
  room: string;
  host: boolean;
  game: GameId;
  level: number;
  secs: number;
  oppName: string;
  robot: boolean;
  result: '' | 'won' | 'lost';
  score: { me: number; opp: number };
};

type Ev = { seq: number; by: 'host' | 'joiner'; kind: 'answer' | 'power'; ok: boolean };

export const ARCADE_URL = '/arcade/index.html#/arcade';

export function newCode() {
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += A[Math.floor(Math.random() * A.length)];
  return s;
}

export class LiveRoom {
  private key = Math.random().toString(36).slice(2, 10);
  private tr: Transport | null = null;
  private subs = new Set<() => void>();
  private noteFn: (n: Note) => void = () => {};
  private beatT = 0;
  private frame: HTMLIFrameElement | null = null;
  private joinedAt = 0;
  private opp: { key: string; name: string } | null = null;
  private m = this.freshMatch();
  name = '';
  snap: Snapshot = { phase: 'lobby', room: '', host: false, game: 'math-fighter', level: 3, secs: 180, oppName: '', robot: false, result: '', score: { me: 0, opp: 0 } };

  /** listen to the game frame (React mounts and disposes; StrictMode does both twice) */
  mount() {
    window.addEventListener('message', this.onFrame);
  }
  dispose() {
    window.removeEventListener('message', this.onFrame);
    this.leave();
  }

  /* ---------- for React ---------- */
  subscribe = (fn: () => void) => { this.subs.add(fn); return () => { this.subs.delete(fn); }; };
  getSnapshot = () => this.snap;
  onNote(fn: (n: Note) => void) { this.noteFn = fn; }
  private set(p: Partial<Snapshot>) { this.snap = { ...this.snap, ...p }; this.subs.forEach(fn => fn()); }
  private note(n: Note) { this.noteFn(n); }

  /** the open game's iframe (the overlay mounts it); the hub says hub:ready once it has booted */
  attachFrame(f: HTMLIFrameElement | null) { this.frame = f; }

  choose(p: { game?: GameId; level?: number; secs?: number }) {
    if (this.snap.phase === 'lobby' || this.snap.host) { this.set(p); this.track(); }
  }

  /* ---------- the room ---------- */
  make() { void this.connect(newCode(), true); }
  join(code: string) {
    void this.connect(code, false);
    setTimeout(() => { if (this.snap.room === code && this.snap.phase === 'wait' && !this.opp) this.note('noRoom'); }, 6000);
  }

  private me(): Member {
    const s = this.snap;
    return { key: this.key, name: this.name || 'Player', host: s.host, at: this.joinedAt, game: s.game, level: s.level, secs: s.secs };
  }
  private track() { if (this.tr && this.snap.phase !== 'lobby') this.tr.track(this.me()); }
  private send(event: string, payload?: Record<string, unknown>) { this.tr?.send(event, { from: this.key, ...(payload || {}) }); }

  private async connect(room: string, host: boolean) {
    this.leave();
    this.joinedAt = Date.now();
    this.set({ phase: 'connecting', room, host, robot: false, result: '' });
    let tr: Transport;
    try { tr = await openTransport(room, this.key); } catch { this.note('offline'); this.set({ phase: 'lobby', room: '' }); return; }
    if (this.snap.room !== room) { tr.close(); return; }
    this.tr = tr;
    tr.onPresence(all => this.presence(all));
    tr.on('start', p => { if (!this.snap.host) this.openMatch(Number(p.seed), p.game as GameId, Number(p.level), Number(p.secs)); });
    tr.on('ready', () => { this.m.oppReady = true; this.m.oppSeen = Date.now(); this.maybeGo(); });
    tr.on('go', () => { if (!this.snap.host && !this.m.started) { this.m.started = true; if (this.m.localReady) this.post({ type: 'fikr:net-go', v: 1 }); } });
    /* the heartbeat carries the number of the sender's last answer: a gap here asks for the missing ones */
    tr.on('beat', p => { this.m.oppSeen = Date.now(); if (this.snap.phase === 'play' && Number(p.last) > this.m.got) this.send('need', { from: this.m.got + 1 }); });
    tr.on('ev', p => { this.m.oppSeen = Date.now(); if (this.snap.phase === 'play') this.oppGot(p as unknown as Ev); });
    tr.on('need', p => { this.m.log.filter(e => e.seq >= (Number(p.from) || 1)).slice(0, 60).forEach(e => this.send('ev', e)); });
    /* the host's game decided at the bell: this screen ends now, with the same result */
    tr.on('over', p => { if (!this.snap.host) this.post({ type: 'fikr:net-end', v: 1, side: p.winner === 'host' ? 'right' : 'left' }); });
    tr.on('close', () => { if (this.snap.phase === 'play') { this.note('oppLeft'); this.backToRoom(); } });
    tr.connect(ok => {
      if (!ok) { this.note('offline'); return; }
      this.set({ phase: this.opp ? 'ready' : 'wait' });
      this.track();
    });
  }

  private presence(all: Member[]) {
    all.sort((a, b) => (a.at || 0) - (b.at || 0));
    if (all.findIndex(x => x.key === this.key) > 1) { this.note('full'); this.leave(); return; }
    const o = all.slice(0, 2).find(x => x.key !== this.key) || null;
    const s = this.snap;
    if (o) {
      this.opp = { key: o.key, name: o.name };
      this.m.oppSeen = Date.now();
      const p: Partial<Snapshot> = { oppName: o.name };
      if (!s.host && o.host) Object.assign(p, { game: o.game === 'tug-of-war' ? 'tug-of-war' : 'math-fighter', level: o.level || s.level, secs: o.secs || s.secs });
      if (s.phase === 'wait') p.phase = 'ready';
      this.set(p);
    } else if (s.phase === 'ready') {
      this.opp = null;
      this.set({ phase: 'wait', oppName: '' });
    }
  }

  leave() {
    if (this.snap.phase === 'play' && !this.snap.robot) this.send('close');
    clearInterval(this.beatT);
    this.tr?.close();
    this.tr = null;
    this.opp = null;
    this.set({ phase: 'lobby', room: '', host: false, oppName: '', robot: false });
  }

  /* ---------- the match: the real game in a frame ---------- */
  private freshMatch() {
    return { seed: 0, myN: 0, log: [] as Ev[], got: 0, buf: {} as Record<number, Ev>, frameReady: false, localReady: false, oppReady: false, started: false, oppSeen: 0, overSent: -1, overWinner: '', skill: 2 };
  }

  start() {
    const s = this.snap;
    if (!s.host || !this.opp) return;
    const seed = Math.floor(Math.random() * 2e9);
    this.send('start', { seed, game: s.game, level: s.level, secs: s.secs });
    this.openMatch(seed, s.game, s.level, s.secs);
  }

  /** 🤖 a match against the hub's robot (1 rookie · 2 racer · 3 master) */
  robot(skill: number) {
    this.leave();
    this.m = this.freshMatch();
    this.m.skill = skill;
    this.set({ phase: 'play', robot: true, result: '', oppName: 'Robot', score: { me: 0, opp: 0 } });
  }

  private openMatch(seed: number, game: GameId, level: number, secs: number) {
    this.m = this.freshMatch();
    this.m.seed = seed;
    this.m.oppSeen = Date.now();
    this.set({ phase: 'play', game: game === 'tug-of-war' ? 'tug-of-war' : 'math-fighter', level: level || 3, secs: Math.max(30, Math.min(900, secs || 180)), result: '', score: { me: 0, opp: 0 } });
    this.track();
    clearInterval(this.beatT);
    this.beatT = window.setInterval(() => {
      const m = this.m, s = this.snap;
      if (s.phase !== 'play') return;
      this.send('beat', { last: m.myN });
      if (m.localReady && !m.started) this.send('ready');                     // a lost hello: say it again
      if (s.host && m.started && !m.myN && !m.got) this.send('go');            // and the start, until the first answer
      if (s.host && m.overWinner) this.send('over', { winner: m.overWinner }); // the result again, in case it was missed
      if (m.started && Date.now() - m.oppSeen > 30000) { this.note('oppLeft'); this.backToRoom(); }
    }, 3000);
  }

  /** ← Room: out of the game, still in the room with the same classmate */
  backToRoom() {
    clearInterval(this.beatT);
    if (this.snap.robot) { this.set({ phase: 'lobby', robot: false, oppName: '' }); return; }
    this.set({ phase: this.opp ? 'ready' : 'wait' });
    this.track();
  }
  quitMatch() { if (!this.snap.robot) this.send('close'); this.backToRoom(); }

  private post(msg: Record<string, unknown>) {
    try { this.frame?.contentWindow?.postMessage(msg, location.origin); } catch { /* gone */ }
  }
  private maybeGo() {
    const m = this.m;
    if (!this.snap.host || m.started || !m.localReady || !m.oppReady) return;
    m.started = true;
    this.send('go');
    this.post({ type: 'fikr:net-go', v: 1 });
  }
  /** the other player's answers, in the order they made them (a gap waits for the missing one) */
  private oppGot(e: Ev) {
    const m = this.m;
    if (!e || !(e.seq > m.got) || m.buf[e.seq]) return;
    m.buf[e.seq] = e;
    while (m.buf[m.got + 1]) {
      const x = m.buf[++m.got];
      delete m.buf[m.got];
      this.post({ type: 'fikr:net-ev', v: 1, seq: x.seq, by: x.by, kind: x.kind, ok: x.ok });
      if (x.kind === 'answer' && x.ok) this.set({ score: { ...this.snap.score, opp: this.snap.score.opp + 1 } });
    }
  }

  /* messages from the game in the frame */
  private onFrame = (ev: MessageEvent) => {
    const f = this.frame;
    if (!f || ev.source !== f.contentWindow || ev.origin !== location.origin) return;
    const d = (ev.data || {}) as Record<string, unknown>;
    const s = this.snap, m = this.m;
    if (d.type === 'hub:ready') {
      if (m.frameReady) return;
      m.frameReady = true;
      if (s.robot) this.post({ type: 'fikr:robot', v: 1, game: s.game, level: s.level, me: this.name || 'You', skill: m.skill });
      else this.post({ type: 'fikr:net', v: 1, game: s.game, level: s.level, me: this.name || 'You', opp: s.oppName || 'Friend', seed: m.seed, host: s.host, secs: s.secs });
      return;
    }
    if (d.type === 'hub:robot') {
      if (d.ev === 'over') {
        const won = d.winner === 'me';
        this.set({ result: won ? 'won' : 'lost' });
        this.note(won ? 'robotWon' : 'robotLost');
      } else if (d.ev === 'close') this.backToRoom();
      return;
    }
    if (d.type !== 'hub:net' || s.robot) return;
    if (d.ev === 'ready') {
      m.localReady = true;
      this.send('ready');
      if (s.host) this.maybeGo(); else if (m.started) this.post({ type: 'fikr:net-go', v: 1 });
    } else if (d.ev === 'answer' || d.ev === 'power') {
      /* this player's answer already counted on this screen: number it and send it to the other one */
      const n = Number(d.n) || m.myN + 1;
      const e: Ev = { seq: n, by: s.host ? 'host' : 'joiner', kind: d.ev, ok: d.ok === true };
      m.myN = Math.max(m.myN, n);
      m.log.push(e);
      this.send('ev', e);
      if (e.kind === 'answer' && e.ok) this.set({ score: { ...s.score, me: s.score.me + 1 } });
    } else if (d.ev === 'over') {
      if (m.overSent === m.seed) return;
      m.overSent = m.seed;
      const won = d.winner === 'me';
      this.set({ result: won ? 'won' : 'lost' });
      this.note(won ? 'won' : 'lost');
      if (s.host) { m.overWinner = won ? 'host' : 'joiner'; this.send('over', { winner: m.overWinner }); }
    } else if (d.ev === 'close') this.quitMatch();
  };
}

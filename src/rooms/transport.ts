/**
 * The wire under a live room: who is in it (presence) and the messages between the two players
 * (broadcast). Two implementations with one shape:
 *
 *  - Supabase Realtime (the same service the FIKR games page uses): one channel per room code,
 *    no database tables, nothing stored.
 *  - BroadcastChannel: two tabs of the same browser. Used when no Supabase project is configured,
 *    or with ?rooms=local, which is how the rooms are tested without the internet.
 */
export type Member = { key: string; name: string; host: boolean; at: number; game: string; level: number; secs: number };

export interface Transport {
  /** register a broadcast handler (before connect) */
  on(event: string, fn: (payload: Record<string, unknown>) => void): void;
  onPresence(fn: (members: Member[]) => void): void;
  connect(onStatus: (ok: boolean) => void): void;
  track(me: Member): void;
  send(event: string, payload?: Record<string, unknown>): void;
  close(): void;
}

/* The FIKR project's public URL and publishable key (the same ones its games page ships): rooms use
   Realtime only — presence and broadcast on 'mtp-room-…' channels, never a table — so they cannot
   meet the school's data or its pupils' rooms. VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY point the
   rooms at another project. */
const URL_ = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || 'https://oczmlwjjejjtpxpwhmuh.supabase.co';
const KEY_ = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || 'sb_publishable_nJQKwFv77zQRZY7IF5XhkQ_QGRCdq1x';

export const forceLocal = () => {
  try { return new URLSearchParams(location.search).get('rooms') === 'local'; } catch { return false; }
};
export const online = () => !!(URL_ && KEY_) && !forceLocal();

const channelName = (room: string) => 'mtp-room-' + room;

export async function openTransport(room: string, key: string): Promise<Transport> {
  return online() ? supabaseTransport(room, key) : localTransport(room, key);
}

/* ---------------- Supabase Realtime ---------------- */
type SbClient = import('@supabase/supabase-js').SupabaseClient;
let client: SbClient | null = null;

async function supabaseTransport(room: string, key: string): Promise<Transport> {
  if (!client) {
    const { createClient } = await import('@supabase/supabase-js');
    client = createClient(URL_!, KEY_!, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  }
  const sb = client;
  const ch = sb.channel(channelName(room), { config: { broadcast: { self: false }, presence: { key } } });
  return {
    on(event, fn) { ch.on('broadcast', { event }, ({ payload }) => fn((payload || {}) as Record<string, unknown>)); },
    onPresence(fn) {
      ch.on('presence', { event: 'sync' }, () => {
        const st = ch.presenceState() as Record<string, Member[]>;
        fn(Object.keys(st).map(k => st[k][st[k].length - 1]).filter(Boolean));
      });
    },
    connect(onStatus) {
      ch.subscribe(status => {
        if (status === 'SUBSCRIBED') onStatus(true);
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') onStatus(false);
      });
    },
    track(me) { try { void ch.track(me); } catch { /* retried on the next change */ } },
    send(event, payload) { try { void ch.send({ type: 'broadcast', event, payload: payload || {} }); } catch { /* the heartbeat repeats what matters */ } },
    close() { try { void ch.untrack(); void sb.removeChannel(ch); } catch { /* gone */ } },
  };
}

/* ---------------- BroadcastChannel (same browser) ---------------- */
function localTransport(room: string, key: string): Transport {
  const bc = new BroadcastChannel(channelName(room));
  const handlers: Record<string, ((p: Record<string, unknown>) => void)[]> = {};
  const seen = new Map<string, { m: Member; t: number }>();
  let presenceFn: (m: Member[]) => void = () => {};
  let mine: Member | null = null;
  let beat = 0;
  const emit = () => presenceFn([...seen.values()].map(x => x.m));
  const announce = () => { if (mine) bc.postMessage({ t: 'p', m: mine }); };
  bc.onmessage = ({ data }) => {
    if (!data) return;
    if (data.t === 'b') (handlers[data.event] || []).forEach(fn => fn(data.payload || {}));
    else if (data.t === 'p' && data.m && data.m.key !== key) {
      const isNew = !seen.has(data.m.key) || JSON.stringify(seen.get(data.m.key)!.m) !== JSON.stringify(data.m);
      seen.set(data.m.key, { m: data.m, t: Date.now() });
      if (isNew) { announce(); emit(); }
    } else if (data.t === 'bye' && seen.delete(data.key)) emit();
  };
  return {
    on(event, fn) { (handlers[event] ||= []).push(fn); },
    onPresence(fn) { presenceFn = fn; },
    connect(onStatus) {
      beat = window.setInterval(() => {
        announce();
        let gone = false;
        seen.forEach((v, k) => { if (k !== key && Date.now() - v.t > 4500) { seen.delete(k); gone = true; } });
        if (gone) emit();
      }, 1000);
      setTimeout(() => onStatus(true), 0);
    },
    track(me) { mine = me; seen.set(key, { m: me, t: Date.now() }); announce(); emit(); },
    send(event, payload) { bc.postMessage({ t: 'b', event, payload: payload || {} }); },
    close() { clearInterval(beat); try { bc.postMessage({ t: 'bye', key }); bc.close(); } catch { /* closed */ } },
  };
}

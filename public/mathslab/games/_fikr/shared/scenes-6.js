/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 6 PICTURE LIBRARY — ratio tables and tape strips, a double number line, a unit-rate cart, a
   fraction-division "how many fit?" model, the integer line, an equation balance, a polygon with given
   side lengths, and a dot plot for mean / median / MAD.

   Same rules as scenes.js … scenes-5.js: a picture is generated from the numbers the question is about,
   and it never prints a value the child is meant to work out. The tape strip shows the two lengths, not
   the ratio; the balance shows the pans, not the solution; the dot plot shows the dots, not the mean.

   NOTE — no `const UNITS` or other generic top-level name lives here: a grade-6 source file may declare
   its own. Everything is namespaced under SCENE6.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const SCENE6 = (() => {
  const INK = '#243244', PAPER = '#fffdf6', BRAND = '#2f6f9f';
  const A = '#8fc4e8', B = '#f3c98b', A2 = '#5d9fd0', B2 = '#d9a55b';
  const GRID = '#b9c6d4', SHADE = '#3b6fb6', WARM = '#c0392b';

  const wrap = (w, h, label, body, max) =>
    `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="width:100%;max-width:${max || w}px;display:block;margin:0 auto">${body}</svg>`;
  const blank = (w, h, fill) => `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="18" fill="${fill || PAPER}" stroke="${INK}" stroke-width="2.5"/>`;
  const label = (t, x, y, size, color, extra) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size || 16}" font-weight="800" fill="${color || INK}"${extra || ''}>${t}</text>`;
  const txt = (t, x, y, size, color, anchor) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor || 'start'}" font-size="${size || 15}" font-weight="700" fill="${color || INK}">${t}</text>`;

  /* ── tapeStrip: two or three bars of matched unit width — the ratio model ─────────────────────────
     opts.parts = [[2,'water'],[3,'juice']]  (count of equal cells + its name)
     Each part is drawn as that many equal cells, so the child counts cells, not a printed ratio. */
  function tapeStrip(parts, opts) {
    opts = opts || {};
    const W = 600, H = opts.h || 150 + parts.length * 46;
    const cellW = Math.min(64, 380 / Math.max.apply(null, parts.map((p) => p[0])));
    const ox = (W - cellW * Math.max.apply(null, parts.map((p) => p[0]))) / 2;
    let body = blank(W, H, opts.fill || '#fbfdff');
    parts.forEach((p, r) => {
      const n = p[0], y = 62 + r * 58;
      body += txt(p[1], ox - 14, y + 26, 14, '#41525f', 'end');
      for (let k = 0; k < n; k += 1) {
        body += `<rect x="${ox + k * cellW}" y="${y}" width="${cellW}" height="34" rx="4" fill="${r === 0 ? A : B}" stroke="${INK}" stroke-width="1.8"/>`;
      }
      body += `<rect x="${ox}" y="${y}" width="${cellW * n}" height="34" rx="6" fill="none" stroke="${INK}" stroke-width="2.6"/>`;
    });
    body += label(opts.axisLabel || 'each cell is one equal part', W / 2, H - 22, 14, '#5b6b7a');
    if (opts.caption) body += label(opts.caption, W / 2, 34, 16, INK);
    return wrap(W, H, opts.label || `a tape strip of ${parts.map((p) => p[0] + ' ' + p[1]).join(' and ')}`, body, opts.max);
  }

  /* ── ratioTable: a two-row table with a blank column for the unknown ─────────────────────────────
     opts.a = [values], opts.b = [values]; opts.askCol = index shown as "?" */
  function ratioTable(a, b, opts) {
    opts = opts || {};
    const cols = Math.max(a.length, b.length);
    /* a one- or two-column table needs wider cells or it reads as a stray box */
    const cw = Math.min(cols <= 2 ? 150 : 92, 460 / cols), ch = 44;
    const W = 600, H = opts.h || 130 + ch * 2;
    const ox = (W - cw * cols) / 2, oy = 40;
    let body = blank(W, H, opts.fill || '#fbfdff');
    body += txt(opts.rowA || 'first', ox - 12, oy + 30, 14, '#41525f', 'end');
    body += txt(opts.rowB || 'second', ox - 12, oy + ch + 30, 14, '#41525f', 'end');
    for (let k = 0; k < cols; k += 1) {
      const x = ox + k * cw;
      const ask = opts.askCol === k;
      const top = a[k] == null ? '?' : a[k];
      const bot = b[k] == null ? '?' : b[k];
      body += `<rect x="${x}" y="${oy}" width="${cw}" height="${ch}" fill="${ask ? '#fff6d8' : (k % 2 ? '#ffffff' : '#f4f8fc')}" stroke="${GRID}" stroke-width="1.6"/>`;
      body += `<rect x="${x}" y="${oy + ch}" width="${cw}" height="${ch}" fill="${ask ? '#fff6d8' : (k % 2 ? '#f4f8fc' : '#ffffff')}" stroke="${GRID}" stroke-width="1.6"/>`;
      body += label(String(top), x + cw / 2, oy + 30, 17, INK);
      body += label(String(bot), x + cw / 2, oy + ch + 30, 17, INK);
      if (ask) body += `<rect x="${x - 2}" y="${oy - 2}" width="${cw + 4}" height="${ch * 2 + 4}" rx="6" fill="none" stroke="${WARM}" stroke-width="2.6" stroke-dasharray="6 4"/>`;
    }
    if (opts.caption) body += label(opts.caption, W / 2, H - 18, 14, '#5b6b7a');
    return wrap(W, H, opts.label || 'a ratio table with one value to find', body, opts.max);
  }

  /* ── doubleLine: a double number line — two scales aligned over the same length ───────────────────
     opts.top = [labels at ticks], opts.bottom = [labels at the same ticks]. Nothing is printed that
     the child is asked to produce; pass '' for a tick they must fill. */
  function doubleLine(top, bottom, opts) {
    opts = opts || {};
    const n = top.length - 1;
    const W = 600, H = opts.h || 170;
    const ox = 60, span = W - 120, y1 = 62, y2 = 126;
    let body = blank(W, H, opts.fill || '#fbfdff');
    body += `<line x1="${ox}" y1="${y1}" x2="${ox + span}" y2="${y1}" stroke="${INK}" stroke-width="2.4"/>`;
    body += `<line x1="${ox}" y1="${y2}" x2="${ox + span}" y2="${y2}" stroke="${INK}" stroke-width="2.4"/>`;
    for (let k = 0; k <= n; k += 1) {
      const x = ox + (span * k) / n;
      body += `<line x1="${x}" y1="${y1 - 8}" x2="${x}" y2="${y1 + 8}" stroke="${INK}" stroke-width="2.4"/>`;
      body += `<line x1="${x}" y1="${y2 - 8}" x2="${x}" y2="${y2 + 8}" stroke="${INK}" stroke-width="2.4"/>`;
      body += label(String(top[k]), x, y1 - 16, 15, top[k] === '' ? WARM : INK);
      body += label(String(bottom[k]), x, y2 + 28, 15, bottom[k] === '' ? WARM : B2);
    }
    /* the shared ticks are joined by a faint dotted line so the two scales read as one measure */
    for (let k = 0; k <= n; k += 1) {
      const x = ox + (span * k) / n;
      body += `<line x1="${x}" y1="${y1 + 9}" x2="${x}" y2="${y2 - 9}" stroke="${GRID}" stroke-width="1.4" stroke-dasharray="4 5"/>`;
    }
    if (opts.topName) body += txt(opts.topName, ox, 24, 14, '#41525f');
    if (opts.bottomName) body += txt(opts.bottomName, ox, y2 + 52, 14, '#8a5a1f');
    if (opts.caption) body += label(opts.caption, W / 2, H - 12, 14, '#5b6b7a');
    return wrap(W, H, opts.label || 'a double number line with two aligned scales', body, opts.max);
  }

  /* ── unitRateCart: two carts with quantity and price; the child finds the per-one price ──────────
     opts.a = {n, price, label}, opts.b = {n, price, label}. Only the pack sizes and totals print. */
  function unitRateCart(a, b, opts) {
    opts = opts || {};
    const W = 600, H = opts.h || 300;
    let body = blank(W, H, opts.fill || '#fbfdff');
    const cart = (o, cx, fill, fill2) => {
      let g = '';
      /* body */
      g += `<path d="M${cx - 62} ${118}h124l-14 66a10 10 0 0 1-10 8h-76a10 10 0 0 1-10-8Z" fill="${fill}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
      /* handle + wheels */
      g += `<path d="M${cx + 62} 118l16-26h22" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
      g += `<circle cx="${cx - 34}" cy="204" r="12" fill="${fill2}" stroke="${INK}" stroke-width="2.4"/>`;
      g += `<circle cx="${cx + 34}" cy="204" r="12" fill="${fill2}" stroke="${INK}" stroke-width="2.4"/>`;
      /* the goods: one small crate per unit, capped so the drawing stays legible */
      const shown = Math.min(o.n, 6);
      for (let k = 0; k < shown; k += 1) {
        const x = cx - 44 + (k % 3) * 30, y = 150 - Math.floor(k / 3) * 26;
        g += `<rect x="${x}" y="${y}" width="${22}" height="${20}" rx="3" fill="#fff" stroke="${INK}" stroke-width="1.8"/>`;
      }
      g += label(`${o.label}`, cx, 60, 17, INK);
      g += label(`Qty ${o.n}`, cx, 250, 16, '#41525f');
      g += label(`Total ${o.price}`, cx, 274, 16, BRAND);
      return g;
    };
    body += cart(a, W / 4, A, A2);
    body += cart(b, (W * 3) / 4, B, B2);
    body += `<line x1="${W / 2}" y1="150" x2="${W / 2}" y2="270" stroke="${GRID}" stroke-width="1.6" stroke-dasharray="5 6"/>`;
    if (opts.caption) body += label(opts.caption, W / 2, H - 14, 14, '#5b6b7a');
    return wrap(W, H, opts.label || 'two carts with different pack sizes and totals', body, opts.max);
  }

  /* ── fitModel: how many groups of b fit inside a — the dividing-fractions model ──────────────────
     opts.a = whole length in thirds-ish units, opts.b = size of one group. Both are counts of the
     same unit fraction, so the picture is exact; the quotient is never printed. */
  function fitModel(a, b, opts) {
    opts = opts || {};
    const W = 600, H = opts.h || 250;
    const n = Math.max(a, 1);
    const cw = Math.min(56, 470 / n);
    const ox = (W - cw * n) / 2;
    let body = blank(W, H, opts.fill || '#fbfdff');
    body += txt(opts.aName || 'the quantity you have', ox, 46, 14, '#41525f');
    for (let k = 0; k < n; k += 1) {
      body += `<rect x="${ox + k * cw}" y="${56}" width="${cw}" height="42" rx="4" fill="${A}" stroke="${INK}" stroke-width="1.8"/>`;
    }
    body += `<rect x="${ox}" y="${56}" width="${cw * n}" height="42" rx="6" fill="none" stroke="${INK}" stroke-width="2.8"/>`;
    body += txt(opts.bName || 'one group', ox, 156, 14, '#8a5a1f');
    for (let k = 0; k < Math.min(b, n); k += 1) {
      body += `<rect x="${ox + k * cw}" y="${166}" width="${cw}" height="34" rx="4" fill="${B}" stroke="${INK}" stroke-width="1.8"/>`;
    }
    body += `<rect x="${ox}" y="${166}" width="${cw * Math.min(b, n)}" height="34" rx="6" fill="none" stroke="${WARM}" stroke-width="2.4"/>`;
    /* bracket showing one group lifted out of the whole */
    const gx = ox, gw = cw * Math.min(b, n);
    body += `<path d="M${gx} 118v10h${gw}v-10" fill="none" stroke="${WARM}" stroke-width="2.4" stroke-linecap="round"/>`;
    if (opts.caption) body += label(opts.caption, W / 2, H - 22, 14, '#5b6b7a');
    return wrap(W, H, opts.label || `a bar of ${a} parts with one group of ${b} marked below it`, body, opts.max);
  }

  /* ── integerLine: a horizontal number line for integer work ─────────────────────────────────────
     opts.from/to bound the axis, opts.mark = the value to show, opts.marks = extra values */
  function integerLine(from, to, opts) {
    opts = opts || {};
    const W = 600, H = opts.h || 150;
    const ox = 56, span = W - 112, y = 88;
    const step = span / Math.max(1, to - from);
    const X = (v) => ox + (v - from) * step;
    let body = blank(W, H, opts.fill || '#fbfdff');
    body += `<line x1="${ox - 18}" y1="${y}" x2="${ox + span + 18}" y2="${y}" stroke="${INK}" stroke-width="2.6"/>`;
    body += `<path d="M${ox + span + 24} ${y}l-9-6v12Z" fill="${INK}"/><path d="M${ox - 24} ${y}l9-6v12Z" fill="${INK}"/>`;
    for (let v = from; v <= to; v += 1) {
      body += `<line x1="${X(v)}" y1="${y - 6}" x2="${X(v)}" y2="${y + 6}" stroke="${INK}" stroke-width="2"/>`;
      body += label(String(v), X(v), y + 28, 13, '#41525f');
    }
    const dot = (v, fill, name) => {
      let g = `<circle cx="${X(v)}" cy="${y}" r="9" fill="${fill}" stroke="${INK}" stroke-width="2"/>`;
      if (name) g += label(name, X(v), y - 22, 13, INK);
      return g;
    };
    (opts.marks || []).forEach((m) => { body += dot(m.v, m.fill || B, m.name); });
    if (opts.mark != null) body += dot(opts.mark, opts.fill || WARM, opts.markName);
    if (opts.caption) body += label(opts.caption, W / 2, H - 16, 14, '#5b6b7a');
    return wrap(W, H, opts.label || `a number line from ${from} to ${to}`, body, opts.max);
  }

  /* ── balance: a two-pan balance for one-step equations ───────────────────────────────────────────
     opts.left = 'x + 4' style sprite list, opts.right = value. Renders pans and weights, not x. */
  function balance(left, right, opts) {
    opts = opts || {};
    const W = 600, H = opts.h || 300;
    let body = blank(W, H, opts.fill || '#fbfdff');
    const cy = 118;
    body += `<path d="M300 118v96" stroke="${INK}" stroke-width="4"/>`;
    body += `<path d="M236 218h128l-12 22H248Z" fill="${A}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
    body += `<line x1="120" y1="${cy}" x2="480" y2="${cy}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
    body += `<circle cx="300" cy="${cy}" r="10" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
    const pan = (cx, items, fill) => {
      let g = '';
      g += `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy + 44}" stroke="${INK}" stroke-width="2.2"/>`;
      g += `<path d="M${cx - 62} ${cy + 44}h124l-16 30H${cx - 46}Z" fill="${fill}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
      items.forEach((it, k) => {
        const x = cx - 44 + (k % 4) * 30, y = cy + 14 - Math.floor(k / 4) * 30;
        if (it === 'x') {
          g += `<rect x="${x}" y="${y}" width="24" height="26" rx="4" fill="#fff" stroke="${WARM}" stroke-width="2.4"/>`;
          g += label('x', x + 12, y + 19, 16, WARM);
        } else {
          g += `<circle cx="${x + 12}" cy="${y + 14}" r="12" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
          g += label(String(it), x + 12, y + 19, 13, INK);
        }
      });
      return g;
    };
    body += pan(170, left, A);
    body += pan(430, right, B);
    body += label('balanced', 300, H - 22, 15, '#5b6b7a');
    if (opts.caption) body += label(opts.caption, 300, 40, 16, INK);
    return wrap(W, H, opts.label || 'a balance with two pans', body, opts.max);
  }

  /* ── polygon: a named polygon drawn to its side lengths, vertices and angles ────────────────────
     opts.sides = [n numbers], opts.kind = 'triangle' | 'rect' | 'parallelogram' | 'trapezoid' | 'regular'
     opts.angles = [degrees to mark] . Labels are the side lengths, drawn on the edges. */
  function polygon(opts) {
    opts = opts || {};
    const W = 600, H = opts.h || 320;
    const cx = 300, cy = 168;
    let body = blank(W, H, opts.fill || '#fbfdff');
    let pts = [], names = opts.sides || [];
    const kind = opts.kind || 'triangle';
    if (kind === 'rect') {
      const b0 = Number(opts.w) > 0 ? Number(opts.w) : 8, h0 = Number(opts.hh) > 0 ? Number(opts.hh) : 5;
      const k0 = Math.min(320 / b0, 170 / h0);
      const w = b0 * k0, h = h0 * k0;
      pts = [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]];
    } else if (kind === 'parallelogram') {
      /* base and height come from the numbers, on one scale, so the picture cannot contradict its labels.
         The slant is cosmetic — it must not change the height. */
      const b = Number(opts.w) > 0 ? Number(opts.w) : 7, hh = Number(opts.hh) > 0 ? Number(opts.hh) : 4;
      const k = Math.min(300 / b, 160 / hh);
      const w = b * k, h = hh * k, sk = Math.min(62, w * 0.22);
      const x0 = cx - (w + sk) / 2, y0 = cy - h / 2;
      pts = [[x0 + sk, y0], [x0 + sk + w, y0], [x0 + w, y0 + h], [x0, y0 + h]];
      opts._altitude = { x: x0 + sk + w * 0.52, y0: y0 + h, y1: y0, base: b, height: hh, x0: x0, x1: x0 + w, yb: y0 + h };
    } else if (kind === 'trapezoid') {
      /* the two parallel edges are the labelled ones; height is the perpendicular gap */
      const b1 = Number(opts.w) > 0 ? Number(opts.w) : 4;
      const b2 = Number(opts.b2) > 0 ? Number(opts.b2) : 9;
      const hh = Number(opts.hh) > 0 ? Number(opts.hh) : 4;
      const k = Math.min(320 / Math.max(b1, b2), 150 / hh);
      const t = b1 * k, bot2 = b2 * k, h = hh * k;
      const x0 = cx - bot2 / 2, y0 = cy - h / 2;
      pts = [[x0 + (bot2 - t) / 2, y0], [x0 + (bot2 + t) / 2, y0], [x0 + bot2, y0 + h], [x0, y0 + h]];
      opts._altitude = { x: x0 + bot2 / 2, y0: y0 + h, y1: y0, base: b2, height: hh, x0: x0, x1: x0 + bot2, yb: y0 + h, top: b1 };
    } else if (kind === 'regular') {
      const n = opts.n || 6, r = 130;
      for (let k = 0; k < n; k += 1) {
        const a = (-90 + (360 / n) * k) * Math.PI / 180;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
    } else if (kind === 'triangle' && Number(opts.base) > 0 && Number(opts.height) > 0) {
      /* A triangle given as base + height. The two numbers are DIFFERENT quantities — the base is an edge,
         the height is the perpendicular gap to the opposite vertex — so they are not drawn as two sides.
         One scale for both axes, so the drawn base : height ratio equals the labelled one. */
      const b = Number(opts.base), h2 = Number(opts.height);
      const k = Math.min(300 / b, 170 / h2);
      const bw = b * k, hh = h2 * k;
      const x0 = cx - bw / 2, yb = cy + 92;
      pts = [[x0, yb], [x0 + bw, yb], [x0 + bw * 0.62, yb - hh]];
      opts._altitude = { x: x0 + bw * 0.62, y0: yb, y1: yb - hh, base: b, height: h2, x0: x0, x1: x0 + bw, yb: yb };
    } else if (opts.sides && opts.sides.length === 3 && opts.sides.every((n) => Number(n) > 0)) {
      /* build a REAL triangle from the three side lengths, so the picture and the labels agree.
         Sides go round as A-B (bottom), B-C (right), C-A (left) — the same order the labels are drawn in.
         Work in model units first, then scale once and centre: mixing scaled and unscaled lengths is
         what produces a shape whose sides contradict its own numbers. */
      const [ab, bc, ca] = opts.sides.map(Number);
      const mx = [0, ab];                       /* A, B on the base */
      const cX = (ca * ca - bc * bc + ab * ab) / (2 * ab);
      const cY = -Math.sqrt(Math.max(0, ca * ca - cX * cX));
      const model = [[mx[0], 0], [mx[1], 0], [cX, cY]];
      const w = Math.max(...model.map((p) => p[0])) - Math.min(...model.map((p) => p[0]));
      const h = Math.max(...model.map((p) => p[1])) - Math.min(...model.map((p) => p[1]));
      /* fit inside the panel without distorted proportions — one scale for both axes */
      const k = Math.min(300 / (w || 1), 190 / (h || 1));
      const midX = (Math.max(...model.map((p) => p[0])) + Math.min(...model.map((p) => p[0]))) / 2;
      const midY = (Math.max(...model.map((p) => p[1])) + Math.min(...model.map((p) => p[1]))) / 2;
      pts = model.map(([x, y]) => [cx + (x - midX) * k, cy + (y - midY) * k]);
    } else {
      /* a scalene triangle that stays pleasant to look at */
      pts = [[cx - 130, cy + 90], [cx + 150, cy + 90], [cx - 20, cy - 110]];
    }
    body += `<path d="M${pts.map((p) => p.join(' ')).join('L')}Z" fill="${A}" fill-opacity="0.55" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    if (opts._altitude) {
      const al = opts._altitude;
      body += `<line x1="${al.x}" y1="${al.y0}" x2="${al.x}" y2="${al.y1}" stroke="${WARM}" stroke-width="2.4" stroke-dasharray="7 5"/>`;
      /* right-angle mark where the altitude meets the base */
      body += `<path d="M${al.x} ${al.y0 - 16}h16v16" fill="none" stroke="${WARM}" stroke-width="2.2"/>`;
      body += label(String(al.height), al.x + 20, (al.y0 + al.y1) / 2 + 5, 16, WARM);
      body += label(String(al.base), (al.x0 + al.x1) / 2, al.yb + 30, 16, '#41525f');
      body += label('height', al.x + 22, (al.y0 + al.y1) / 2 + 24, 12, WARM);
      body += label('base', (al.x0 + al.x1) / 2, al.yb + 48, 12, '#5b6b7a');
    }
    /* side labels, offset outward from the centroid */
    pts.forEach((p, k) => {
      const q = pts[(k + 1) % pts.length];
      const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      const dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1;
      const lx = mx + (dx / d) * 26, ly = my + (dy / d) * 22;
      if (names[k] != null && names[k] !== '') body += label(String(names[k]), lx, ly + 5, 15, '#41525f');
    });
    pts.forEach((p, k) => {
      body += label(String.fromCharCode(65 + k), p[0], p[1] - 12, 14, BRAND);
    });
    (opts.angles || []).forEach((a) => {
      const p = pts[a.at];
      body += `<path d="M${p[0] - 22} ${p[1] + 12}a26 26 0 0 1 32 4" fill="none" stroke="${WARM}" stroke-width="2.4"/>`;
      if (a.text) body += label(a.text, p[0] + 6, p[1] + 34, 13, WARM);
    });
    if (opts.caption) body += label(opts.caption, W / 2, H - 18, 14, '#5b6b7a');
    return wrap(W, H, opts.label || `a ${kind} with its side lengths marked`, body, opts.max);
  }

  /* ── dotPlot: a dot plot of a small data set, for mean / median / MAD ───────────────────────────
     opts.vals = [numbers]. The dots are drawn; the mean is never printed. */
  function dotPlot(vals, opts) {
    opts = opts || {};
    const vals2 = vals.slice().sort((x, y) => x - y);
    const lo = Math.min.apply(null, vals2), hi = Math.max.apply(null, vals2);
    const W = 600, H = opts.h || 240;
    const ox = 60, span = W - 120, y = H - 70;
    const steps = Math.max(1, hi - lo);
    const step = span / steps;
    const X = (v) => ox + (v - lo) * step;
    const counts = {};
    vals2.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
    let body = blank(W, H, opts.fill || '#fbfdff');
    body += `<line x1="${ox - 18}" y1="${y}" x2="${ox + span + 18}" y2="${y}" stroke="${INK}" stroke-width="2.6"/>`;
    for (let v = lo; v <= hi; v += 1) {
      body += `<line x1="${X(v)}" y1="${y - 6}" x2="${X(v)}" y2="${y + 6}" stroke="${INK}" stroke-width="2"/>`;
      body += label(String(v), X(v), y + 26, 13, '#41525f');
    }
    Object.keys(counts).forEach((k) => {
      const v = Number(k);
      for (let h2 = 0; h2 < counts[k]; h2 += 1) {
        body += `<circle cx="${X(v)}" cy="${y - 16 - h2 * 26}" r="10" fill="${opts.dot || BRAND}" stroke="${INK}" stroke-width="1.8"/>`;
      }
    });
    if (opts.caption) body += label(opts.caption, W / 2, 36, 15, INK);
    return wrap(W, H, opts.label || `a dot plot of ${vals2.length} values`, body, opts.max);
  }

  /* ── barModel6: a solved-example bar model used in the representational step ─────────────────────
     opts.segs = [{n, label, fill}]. Draws equal cells with a total bracket underneath. */
  function barModel6(segs, opts) {
    opts = opts || {};
    const total = segs.reduce((s, x) => s + x.n, 0);
    const W = 600, H = opts.h || 220;
    const cw = Math.min(60, 470 / Math.max(1, total));
    const ox = (W - cw * total) / 2;
    let body = blank(W, H, opts.fill || '#fbfdff');
    let x = ox;
    const segSpans = [];
    segs.forEach((s) => {
      const x0 = x;
      for (let k = 0; k < s.n; k += 1) {
        body += `<rect x="${x}" y="54" width="${cw}" height="46" rx="4" fill="${s.fill || A}" stroke="${INK}" stroke-width="1.8"/>`;
        x += cw;
      }
      segSpans.push({ x0, x1: x, label: s.label });
    });
    body += `<rect x="${ox}" y="54" width="${cw * total}" height="46" rx="6" fill="none" stroke="${INK}" stroke-width="2.8"/>`;
    /* one bracket per segment, so a 4 : 3 split is visibly 4 cells and 3 cells and not just two words */
    segSpans.forEach((sp) => {
      body += `<path d="M${sp.x0 + 2} 110v9h${sp.x1 - sp.x0 - 4}v-9" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
      body += label(sp.label || '', (sp.x0 + sp.x1) / 2, 140, 14, '#41525f');
    });
    const by = 166;
    body += `<path d="M${ox} ${by - 9}v9h${cw * total}v-9" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
    if (opts.totalLabel) body += label(opts.totalLabel, ox + (cw * total) / 2, by + 26, 15, INK);
    if (opts.caption) body += label(opts.caption, W / 2, H - 14, 14, '#5b6b7a');
    return wrap(W, H, opts.label || `a bar model of ${total} equal parts`, body, opts.max);
  }

  return { tapeStrip, ratioTable, doubleLine, unitRateCart, fitModel, integerLine, balance,
    polygon, dotPlot, barModel6, wrap, label };
})();

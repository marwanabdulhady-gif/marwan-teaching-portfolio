/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   SCENES7 — the Grade 7 picture library (proportional relationships, signed numbers, circles, angles)

   Same rules as scenes.js … scenes-6.js: a picture is generated from the numbers the question is about,
   and it never prints a value the child is meant to work out. The graph shows the plotted points, not the
   constant of proportionality; the number line shows the two positions, not the distance between them.

   NOTE — no generic top-level name lives here: this file declares only SCENE7, because a grade-7 source
   file may declare its own `UNITS` or `K`.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const SCENE7 = (() => {
  const INK = '#26303f', PAPER = '#fffdf6', BRAND = '#35507a';
  const A = '#9dc0e6', B = '#f2cb96', A2 = '#5f8cbe', B2 = '#d7a45f';
  const GRID = '#c6d0dc', SHADE = '#3f6aa8', WARM = '#b23b2e', GOOD = '#2f7d64';

  const wrap = (w, h, label, body, max) =>
    `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="width:100%;max-width:${max || w}px;display:block;margin:0 auto">${body}</svg>`;
  const blank = (w, h, fill) => `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="18" fill="${fill || PAPER}" stroke="${INK}" stroke-width="2.5"/>`;
  const label = (t, x, y, size, color, extra) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size || 16}" font-weight="800" fill="${color || INK}"${extra || ''}>${t}</text>`;
  const txt = (t, x, y, size, color, anchor) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor || 'start'}" font-size="${size || 15}" font-weight="700" fill="${color || INK}">${t}</text>`;

  /* ── proportionGraph: points on a coordinate plane, and whether they lie on one line through (0,0) ──
     opts.points = [[x,y], …]. The line is drawn ONLY when opts.showLine is true, and never with k printed.
     opts.askK highlights the point (1, k) with a dashed drop so the child reads k off the graph. */
  function proportionGraph(points, opts) {
    opts = opts || {};
    const W = 600, H = opts.h || 340;
    const pad = 56;
    const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
    const maxX = Math.max(opts.maxX || 0, ...xs, 1), maxY = Math.max(opts.maxY || 0, ...ys, 1);
    /* round the axis up to a tidy step so the ticks are readable */
    const stepX = Math.max(1, Math.ceil(maxX / 8)), stepY = Math.max(1, Math.ceil(maxY / 8));
    const spanX = stepX * Math.ceil(maxX / stepX), spanY = stepY * Math.ceil(maxY / stepY);
    const x0 = pad, y0 = H - pad;
    const px = (v) => x0 + (v / spanX) * (W - pad - x0);
    const py = (v) => y0 - (v / spanY) * (y0 - pad);
    let body = blank(W, H, opts.fill || '#fbfdff');
    /* grid */
    for (let v = 0; v <= spanX; v += stepX) {
      body += `<line x1="${px(v)}" y1="${y0}" x2="${px(v)}" y2="${pad}" stroke="${GRID}" stroke-width="1.1"/>`;
    }
    for (let v = 0; v <= spanY; v += stepY) {
      body += `<line x1="${x0}" y1="${py(v)}" x2="${px(spanX)}" y2="${py(v)}" stroke="${GRID}" stroke-width="1.1"/>`;
    }
    body += `<line x1="${x0}" y1="${y0}" x2="${px(spanX) + 14}" y2="${y0}" stroke="${INK}" stroke-width="2.6"/>`;
    body += `<line x1="${x0}" y1="${y0}" x2="${x0}" y2="${pad - 14}" stroke="${INK}" stroke-width="2.6"/>`;
    body += `<path d="M${px(spanX) + 14} ${y0}l-9-4v8Z" fill="${INK}"/>`;
    body += `<path d="M${x0} ${pad - 14}l-4 9h8Z" fill="${INK}"/>`;
    for (let v = 0; v <= spanX; v += stepX) body += label(String(v), px(v), y0 + 24, 13, '#54636f');
    for (let v = stepY; v <= spanY; v += stepY) body += label(String(v), x0 - 16, py(v) + 4, 13, '#54636f');
    body += txt(opts.xName || 'x', W - pad + 6, H - pad + 26, 14, BRAND);
    body += txt(opts.yName || 'y', x0 - 40, pad + 4, 14, BRAND);
    /* the line, when the relationship really is proportional */
    if (opts.showLine) {
      body += `<line x1="${px(0)}" y1="${py(0)}" x2="${px(spanX)}" y2="${py((spanY / spanX) * spanX)}" stroke="${SHADE}" stroke-width="2.6" opacity=".55" stroke-dasharray="8 5"/>`;
    }
    /* the points, and a cross for any pair that is NOT on the line */
    points.forEach((p, k) => {
      const on = opts.offLine && opts.offLine.indexOf(k) >= 0;
      body += `<circle cx="${px(p[0])}" cy="${py(p[1])}" r="8.5" fill="${on ? WARM : SHADE}" stroke="${INK}" stroke-width="2"/>`;
      if (on) body += label('✕', px(p[0]), py(p[1]) - 16, 15, WARM);
    });
    if (opts.askK) {
      const q = opts.askK;
      body += `<line x1="${px(q[0])}" y1="${py(q[1])}" x2="${px(q[0])}" y2="${y0}" stroke="${WARM}" stroke-width="2" stroke-dasharray="6 4"/>`;
      body += `<line x1="${px(q[0])}" y1="${py(q[1])}" x2="${x0}" y2="${py(q[1])}" stroke="${WARM}" stroke-width="2" stroke-dasharray="6 4"/>`;
      body += label(`(${q[0]}, ${q[1]})`, px(q[0]) + 34, py(q[1]) - 12, 14, WARM);
    }
    if (opts.caption) body += label(opts.caption, W / 2, 30, 16, INK);
    return wrap(W, H, opts.label || `a graph of ${points.length} plotted points`, body, opts.max);
  }

  /* ── signedLine: a horizontal number line for signed arithmetic, with hop arcs ───────────────────
     opts.from/to bound the axis. opts.start = where the hop begins; opts.hop = signed length of the arc.
     opts.marks = [{v, fill, name}] to pin values. The RESULT is never printed — only the hop is drawn. */
  function signedLine(from, to, opts) {
    opts = opts || {};
    const W = 600, H = opts.h || 190;
    const oy = 100, span = W - 120, ox = 60;
    const step = span / Math.max(1, to - from);
    const X = (v) => ox + (v - from) * step;
    let body = blank(W, H, opts.fill || '#fbfdff');
    body += `<line x1="${ox - 20}" y1="${oy}" x2="${ox + span + 20}" y2="${oy}" stroke="${INK}" stroke-width="2.6"/>`;
    body += `<path d="M${ox + span + 26} ${oy}l-10-4.5v9Z" fill="${INK}"/>`;
    body += `<path d="M${ox - 26} ${oy}l10-4.5v9Z" fill="${INK}"/>`;
    for (let v = from; v <= to; v += 1) {
      body += `<line x1="${X(v)}" y1="${oy - 7}" x2="${X(v)}" y2="${oy + 7}" stroke="${INK}" stroke-width="2"/>`;
      body += label(String(v), X(v), oy + 30, 13, '#54636f');
    }
    /* the hop: an arc from start to start+hop, with the arrow head at the landing point */
    if (opts.hop != null && opts.start != null) {
      const a = X(opts.start), b = X(opts.start + opts.hop);
      const lift = Math.min(62, 18 + Math.abs(opts.hop) * 7);
      const mid = (a + b) / 2, up = oy - lift;
      const dir = b > a ? 1 : -1;
      body += `<path d="M${a} ${oy - 6}Q${mid} ${up} ${b} ${oy - 6}" fill="none" stroke="${opts.hopColor || WARM}" stroke-width="2.8" stroke-linecap="round"/>`;
      body += `<path d="M${b} ${oy - 4}l${-8 * dir} ${-2}l${2 * dir} 8Z" fill="${opts.hopColor || WARM}"/>`;
      body += label(opts.hopName != null ? opts.hopName : (opts.hop > 0 ? `+${opts.hop}` : String(opts.hop)), mid, up - 8, 16, opts.hopColor || WARM);
    }
    (opts.marks || []).forEach((m) => {
      body += `<circle cx="${X(m.v)}" cy="${oy}" r="8" fill="${m.fill || A}" stroke="${INK}" stroke-width="2.2"/>`;
      if (m.name) body += label(m.name, X(m.v), oy - 20, 14, INK);
    });
    if (opts.start != null && opts.showStart !== false) {
      body += `<circle cx="${X(opts.start)}" cy="${oy}" r="8" fill="${B}" stroke="${INK}" stroke-width="2.2"/>`;
    }
    if (opts.caption) body += label(opts.caption, W / 2, 30, 16, INK);
    return wrap(W, H, opts.label || 'a number line with one signed hop', body, opts.max);
  }

  /* ── circleFig: radius / diameter / circumference / area, drawn to the radius given ───────────────
     opts.r = radius (any unit). opts.show = 'r' | 'd' | 'arc' | 'sector' | 'none'.
     opts.sweep = degrees of the drawn sector. Nothing is ever printed except the numbers passed in. */
  function circleFig(opts) {
    opts = opts || {};
    const W = 560, H = opts.h || 320;
    const r = Math.min(118, 210 / Math.max(1, Number(opts.r) || 1) * (Number(opts.r) || 1) / Math.max(1, Number(opts.r) || 1));
    const R = opts.px || Math.min(116, 300 / Math.max(1, (Number(opts.r) || 1)));
    const cx = W / 2, cy = H / 2 + 6;
    let body = blank(W, H, opts.fill || '#fbfdff');
    if (opts.show === 'sector') {
      const deg = Number(opts.sweep) || 90;
      const a0 = -Math.PI / 2, a1 = a0 + (deg * Math.PI) / 180;
      const x1 = cx + R * Math.cos(a0), y1 = cy + R * Math.sin(a0);
      const x2 = cx + R * Math.cos(a1), y2 = cy + R * Math.sin(a1);
      const large = deg > 180 ? 1 : 0;
      body += `<path d="M${cx} ${cy}L${x1} ${y1}A${R} ${R} 0 ${large} 1 ${x2} ${y2}Z" fill="${A}" fill-opacity=".6" stroke="${INK}" stroke-width="2.4"/>`;
    }
    body += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${opts.show === 'sector' ? 'none' : A}" fill-opacity=".28" stroke="${INK}" stroke-width="2.8"/>`;
    body += `<circle cx="${cx}" cy="${cy}" r="3.6" fill="${INK}"/>`;
    if (opts.show === 'r' || opts.show === 'd') {
      const ang = opts.show === 'd' ? Math.PI : -Math.PI / 4;
      const ex = cx + R * Math.cos(ang), ey = cy + R * Math.sin(ang);
      body += `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="${WARM}" stroke-width="2.6"/>`;
      if (opts.show === 'd') {
        const fx = cx - R * Math.cos(ang), fy = cy - R * Math.sin(ang);
        body += `<line x1="${cx}" y1="${cy}" x2="${fx}" y2="${fy}" stroke="${WARM}" stroke-width="2.6"/>`;
        body += label(opts.dLabel || 'diameter', cx, cy - 10, 15, WARM);
      } else {
        body += label(opts.rLabel || 'radius', cx + R * 0.42, cy - 14, 15, WARM);
      }
    }
    if (opts.show === 'arc') {
      const a0 = -Math.PI * 0.86, a1 = -Math.PI * 0.14;
      const x1 = cx + R * Math.cos(a0), y1 = cy + R * Math.sin(a0);
      const x2 = cx + R * Math.cos(a1), y2 = cy + R * Math.sin(a1);
      body += `<path d="M${x1} ${y1}A${R} ${R} 0 0 1 ${x2} ${y2}" fill="none" stroke="${GOOD}" stroke-width="4.4" stroke-linecap="round"/>`;
      body += label(opts.arcLabel || 'circumference', cx, cy - R - 16, 15, GOOD);
    }
    if (opts.caption) body += label(opts.caption, W / 2, H - 16, 14, '#54636f');
    return wrap(W, H, opts.label || 'a circle with one measurement marked', body, opts.max);
  }

  /* ── anglePair: two angles that share a vertex — complementary, supplementary or vertical ─────────
     opts.kind = 'supp' | 'comp' | 'vert'. opts.known = the angle printed; the other is marked x or ?.
     The unknown is ALWAYS drawn as an arc with "?" — never as a number. */
  function anglePair(opts) {
    opts = opts || {};
    const W = 560, H = opts.h || 300;
    const cx = W / 2 - 40, cy = H / 2 + 40;
    const L = 190;
    let body = blank(W, H, opts.fill || '#fbfdff');
    const known = Number(opts.known) || 45;
    const rad = (d) => (d * Math.PI) / 180;
    const P = (deg, len) => [cx + (len || L) * Math.cos(rad(deg)), cy - (len || L) * Math.sin(rad(deg))];
    const ray = (deg, color) => {
      const p = P(deg);
      return `<line x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}" stroke="${color || INK}" stroke-width="2.8" stroke-linecap="round"/>`;
    };
    const arc = (a0, a1, rr, color) => {
      const p0 = P(a0, rr), p1 = P(a1, rr);
      const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
      const sweep = a1 > a0 ? 0 : 1;
      return `<path d="M${p0[0]} ${p0[1]}A${rr} ${rr} 0 ${large} ${sweep} ${p1[0]} ${p1[1]}" fill="none" stroke="${color}" stroke-width="2.6"/>`;
    };
    if (opts.kind === 'vert') {
      body += ray(30, INK) + ray(210, INK) + ray(120, SHADE) + ray(300, SHADE);
      body += arc(120, 210, 54, WARM) + arc(300, 390, 54, WARM);
      body += label(String(known), ...P(165, 78).map((v, i) => (i ? v : v)), 15, WARM);
      body += label('?', ...P(345, 78), 18, SHADE);
    } else if (opts.kind === 'comp') {
      body += ray(0, INK) + ray(90, INK) + ray(known, SHADE);
      body += arc(known, 90, 52, WARM);
      body += label(`${known}°`, ...P(known / 2, 74), 15, WARM);
      body += arc(0, known, 74, SHADE);
      body += label('?', ...P(known / 2, 96), 18, SHADE);
      body += `<path d="M${cx + 16} ${cy}h14v-14" fill="none" stroke="${INK}" stroke-width="2.2"/>`;
    } else {
      /* supplementary: two angles on a straight line */
      body += ray(180, INK) + ray(0, INK) + ray(known, SHADE);
      body += arc(0, known, 74, SHADE);
      body += label(`${known}°`, ...P(known / 2, 96), 15, SHADE);
      body += arc(known, 180, 52, WARM);
      body += label('?', ...P((known + 180) / 2, 74), 18, WARM);
    }
    if (opts.caption) body += label(opts.caption, W / 2, H - 16, 14, '#54636f');
    return wrap(W, H, opts.label || 'a pair of angles with one unknown', body, opts.max);
  }

  /* ── tablePairs: a two-row table with one blank cell, for testing proportionality from a table ────
     opts.a / opts.b are the row values; opts.askCol highlights the cell to fill with a dashed box. */
  function tablePairs(a, b, opts) {
    opts = opts || {};
    const cols = Math.max(a.length, b.length);
    const cw = Math.min(cols <= 2 ? 150 : 92, 460 / cols), ch = 44;
    const W = 600, H = opts.h || 130 + ch * 2;
    const ox = (W - cw * cols) / 2, oy = 44;
    let body = blank(W, H, opts.fill || '#fbfdff');
    body += txt(opts.rowA || 'x', ox - 14, oy + 30, 14, '#41525f', 'end');
    body += txt(opts.rowB || 'y', ox - 14, oy + ch + 30, 14, '#41525f', 'end');
    for (let k = 0; k < cols; k += 1) {
      const x = ox + k * cw;
      const ask = opts.askCol === k;
      const top = a[k] == null ? '?' : a[k];
      const bot = b[k] == null ? '?' : b[k];
      body += `<rect x="${x}" y="${oy}" width="${cw}" height="${ch}" fill="${ask ? '#fff3d6' : (k % 2 ? '#ffffff' : '#f3f7fb')}" stroke="${GRID}" stroke-width="1.6"/>`;
      body += `<rect x="${x}" y="${oy + ch}" width="${cw}" height="${ch}" fill="${ask ? '#fff3d6' : (k % 2 ? '#f3f7fb' : '#ffffff')}" stroke="${GRID}" stroke-width="1.6"/>`;
      body += label(String(top), x + cw / 2, oy + 30, 17, INK);
      body += label(String(bot), x + cw / 2, oy + ch + 30, 17, INK);
      if (ask) body += `<rect x="${x - 2}" y="${oy - 2}" width="${cw + 4}" height="${ch * 2 + 4}" rx="6" fill="none" stroke="${WARM}" stroke-width="2.6" stroke-dasharray="6 4"/>`;
    }
    if (opts.caption) body += label(opts.caption, W / 2, H - 18, 14, '#5b6b7a');
    return wrap(W, H, opts.label || 'a table of paired values', body, opts.max);
  }

  /* ── priceStack: a marked price with one or more discounts applied in sequence ────────────────────
     opts.steps = [{label, pct}]; drawn as stacked bars, each open at the bottom. The final price is
     NEVER printed — the child must compute the chain. */
  function priceStack(opts) {
    opts = opts || {};
    const W = 600, H = opts.h || 300;
    const steps = opts.steps || [];
    let body = blank(W, H, opts.fill || '#fbfdff');
    const bx = 120, bw = 340, top = 66;
    const rowH = Math.min(64, 190 / Math.max(1, steps.length));
    body += txt(opts.startLabel || 'marked price', bx - 14, top + rowH / 2 + 6, 14, '#41525f', 'end');
    body += `<rect x="${bx}" y="${top}" width="${bw}" height="${rowH - 8}" rx="6" fill="${A}" stroke="${INK}" stroke-width="2.4"/>`;
    steps.forEach((s, k) => {
      const y = top + (k + 1) * rowH;
      const shrink = bw * (1 - Math.pow(1 - (Number(s.pct) || 0) / 100, 1));
      body += txt(s.label, bx - 14, y + rowH / 2, 14, '#41525f', 'end');
      body += `<rect x="${bx}" y="${y}" width="${bw}" height="${rowH - 12}" rx="6" fill="${k === 0 ? B : B2}" fill-opacity=".55" stroke="${GRID}" stroke-width="2" stroke-dasharray="7 5"/>`;
      body += `<rect x="${bx}" y="${y}" width="${Math.max(20, bw - shrink)}" height="${rowH - 12}" rx="6" fill="${k === 0 ? B : B2}" stroke="${INK}" stroke-width="2.2"/>`;
      body += label(`−${s.pct}%`, bx + bw + 30, y + rowH / 2, 15, WARM);
      body += `<path d="M${bx - 6} ${top + (k + 1) * rowH - rowH / 2}l-12 6 12 6Z" fill="${WARM}"/>`;
    });
    if (opts.caption) body += label(opts.caption, W / 2, H - 16, 14, '#5b6b7a');
    return wrap(W, H, opts.label || 'a price with successive discounts', body, opts.max);
  }

  /* ── wrap / label re-exported for source files that build their own tiny figures ───────────────── */
  return { proportionGraph, signedLine, circleFig, anglePair, tablePairs, priceStack, wrap, label };
})();

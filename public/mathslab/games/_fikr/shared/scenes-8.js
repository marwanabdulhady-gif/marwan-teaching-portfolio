/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   SCENES8 — the Grade 8 picture library (lines, slope triangles, right triangles, plotted distance)

   Same rule as the earlier libraries: a figure is generated from the numbers the question is about, and
   it never prints a value the child is meant to work out. A slope triangle shows the two legs but not the
   quotient; a right triangle labels the legs but leaves the hypotenuse as "?"; two plotted points show
   the dashed legs but not the distance.

   NOTE — no generic top-level name lives here: this file declares only SCENE8.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const SCENE8 = (() => {
  const INK = '#26303f', PAPER = '#fffdf6', BRAND = '#35507a';
  const A = '#9dc0e6', B = '#f2cb96', A2 = '#5f8cbe', B2 = '#d7a45f';
  const GRID = '#c6d0dc', SHADE = '#3f6aa8', WARM = '#b23b2e', GOOD = '#2f7d64';

  const wrap = (w, h, label, body, max) =>
    `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="width:100%;max-width:${max || w}px;display:block;margin:0 auto">${body}</svg>`;
  const blank = (w, h, fill) => `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="18" fill="${fill || PAPER}" stroke="${INK}" stroke-width="2.5"/>`;
  const label = (t, x, y, size, color, extra) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size || 15}" font-weight="800" fill="${color || INK}"${extra || ''}>${t}</text>`;
  const txt = (t, x, y, size, color, anchor) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor || 'start'}" font-size="${size || 14}" font-weight="700" fill="${color || INK}">${t}</text>`;

  /* ── a coordinate plane with the four axes, tidied to whole steps ─────────────────────────────────
     Returns { px, py, body, W, H } so the callers below can draw on the same frame. */
  function plane(opts) {
    opts = opts || {};
    const W = opts.W || 600, H = opts.H || 360, pad = 52;
    const xmin = opts.xmin != null ? opts.xmin : 0, xmax = opts.xmax != null ? opts.xmax : 8;
    const ymin = opts.ymin != null ? opts.ymin : 0, ymax = opts.ymax != null ? opts.ymax : 10;
    const boxL = pad, boxR = W - pad, boxT = pad - 14, boxB = H - pad;
    const sx = (boxR - boxL) / (xmax - xmin), sy = (boxB - boxT) / (ymax - ymin);
    const px = (x) => boxL + (x - xmin) * sx;
    const py = (y) => boxB - (y - ymin) * sy;
    let body = blank(W, H, opts.fill || '#fbfdff');
    const stepX = Math.max(1, Math.ceil((xmax - xmin) / 10));
    const stepY = Math.max(1, Math.ceil((ymax - ymin) / 9));
    for (let v = Math.ceil(xmin / stepX) * stepX; v <= xmax; v += stepX) {
      body += `<line x1="${px(v)}" y1="${py(ymin)}" x2="${px(v)}" y2="${py(ymax)}" stroke="${GRID}" stroke-width="1.1"/>`;
    }
    for (let v = Math.ceil(ymin / stepY) * stepY; v <= ymax; v += stepY) {
      body += `<line x1="${px(xmin)}" y1="${py(v)}" x2="${px(xmax)}" y2="${py(v)}" stroke="${GRID}" stroke-width="1.1"/>`;
    }
    /* the two axes, wherever zero actually falls */
    const ax = Math.min(Math.max(0, xmin), xmax), ay = Math.min(Math.max(0, ymin), ymax);
    body += `<line x1="${px(xmin)}" y1="${py(ay)}" x2="${px(xmax) + 12}" y2="${py(ay)}" stroke="${INK}" stroke-width="2.6"/>`;
    body += `<line x1="${px(ax)}" y1="${py(ymin)}" x2="${px(ax)}" y2="${py(ymax) - 12}" stroke="${INK}" stroke-width="2.6"/>`;
    body += `<path d="M${px(xmax) + 12} ${py(ay)}l-9-4v8Z" fill="${INK}"/>`;
    body += `<path d="M${px(ax)} ${py(ymax) - 12}l-4 9h8Z" fill="${INK}"/>`;
    for (let v = Math.ceil(xmin / stepX) * stepX; v <= xmax; v += stepX) {
      if (v !== 0) body += label(String(v), px(v), py(ay) + 20, 12, '#54636f');
    }
    for (let v = Math.ceil(ymin / stepY) * stepY; v <= ymax; v += stepY) {
      if (v !== 0) body += label(String(v), px(ax) - 15, py(v) + 4, 12, '#54636f');
    }
    body += txt(opts.xName || 'x', px(xmax) + 4, py(ay) + 36, 13, BRAND);
    body += txt(opts.yName || 'y', px(ax) - 34, py(ymax) + 10, 13, BRAND);
    return { px, py, body, W, H, sx, sy, xmin, xmax, ymin, ymax };
  }

  /* ── slopeLine: one straight line with its slope triangle ────────────────────────────────────────
     opts.m, opts.b; opts.tri = [x1, x2] draws a right triangle between the two points on the line.
     The run and the rise are labelled as lengths; the quotient is never printed. */
  function slopeLine(opts) {
    opts = opts || {};
    const m = Number(opts.m) || 1, b = Number(opts.b) || 0;
    const P = plane(Object.assign({}, opts, {
      xmin: opts.xmin != null ? opts.xmin : 0,
      xmax: opts.xmax != null ? opts.xmax : 8,
      ymin: opts.ymin != null ? opts.ymin : Math.min(0, b),
      ymax: opts.ymax != null ? opts.ymax : Math.max(m * 8 + b, b + 2),
    }));
    let body = P.body;
    const x0 = P.xmin, x1 = P.xmax;
    body += `<line x1="${P.px(x0)}" y1="${P.py(m * x0 + b)}" x2="${P.px(x1)}" y2="${P.py(m * x1 + b)}" stroke="${SHADE}" stroke-width="3.2" stroke-linecap="round"/>`;
    /* the intercept, always marked: it is the thing the child reads off */
    if (opts.showB !== false) {
      body += `<circle cx="${P.px(0)}" cy="${P.py(b)}" r="7" fill="${WARM}" stroke="${INK}" stroke-width="2"/>`;
      body += label(`(0, ${opts.bLabel != null ? opts.bLabel : b})`, P.px(0) + 44, P.py(b) - 12, 13, WARM);
    }
    if (opts.tri) {
      const [t1, t2] = opts.tri;
      const y1 = m * t1 + b, y2 = m * t2 + b;
      body += `<line x1="${P.px(t1)}" y1="${P.py(y1)}" x2="${P.px(t2)}" y2="${P.py(y1)}" stroke="${GOOD}" stroke-width="2.6" stroke-dasharray="7 5"/>`;
      body += `<line x1="${P.px(t2)}" y1="${P.py(y1)}" x2="${P.px(t2)}" y2="${P.py(y2)}" stroke="${GOOD}" stroke-width="2.6" stroke-dasharray="7 5"/>`;
      body += `<circle cx="${P.px(t1)}" cy="${P.py(y1)}" r="6.5" fill="${GOOD}" stroke="${INK}" stroke-width="1.8"/>`;
      body += `<circle cx="${P.px(t2)}" cy="${P.py(y2)}" r="6.5" fill="${GOOD}" stroke="${INK}" stroke-width="1.8"/>`;
      if (opts.runLabel !== false) body += label(`run ${t2 - t1}`, (P.px(t1) + P.px(t2)) / 2, P.py(y1) + 22, 13, GOOD);
      if (opts.riseLabel !== false) body += label(`rise ${y2 - y1}`, P.px(t2) + 46, (P.py(y1) + P.py(y2)) / 2, 13, GOOD);
    }
    if (opts.caption) body += label(opts.caption, P.W / 2, 26, 15, INK);
    return wrap(P.W, P.H, opts.label || 'a straight line on a coordinate plane', body, opts.max);
  }

  /* ── twoLines: two straight lines and the point where they meet ─────────────────────────────────
     opts.a = {m, b}, opts.b = {m, b}. The crossing point is marked with a ring, never with its value. */
  function twoLines(opts) {
    opts = opts || {};
    const A1 = opts.a || { m: 1, b: 0 }, B1 = opts.b || { m: 0.5, b: 3 };
    const xmax = opts.xmax != null ? opts.xmax : 10;
    const yTop = Math.max(A1.m * xmax + A1.b, B1.m * xmax + B1.b) + 1;
    const P = plane(Object.assign({}, opts, { xmin: 0, xmax, ymin: 0, ymax: opts.ymax != null ? opts.ymax : yTop }));
    let body = P.body;
    const draw = (L, color, name) => {
      let g = '';
      g += `<line x1="${P.px(0)}" y1="${P.py(L.b)}" x2="${P.px(xmax)}" y2="${P.py(L.m * xmax + L.b)}" stroke="${color}" stroke-width="3.2" stroke-linecap="round"/>`;
      if (name) {
        const lx = xmax * 0.88, ly = L.m * lx + L.b;
        g += `<rect x="${P.px(lx) - 46}" y="${P.py(ly) - 30}" width="92" height="22" rx="6" fill="#fff" fill-opacity=".82"/>`;
        g += txt(name, P.px(lx) - 44, P.py(ly) - 13, 13, color);
      }
      return g;
    };
    body += draw(A1, SHADE, opts.aName);
    body += draw(B1, WARM, opts.bName);
    /* the intersection, drawn from the two equations themselves */
    if (A1.m !== B1.m) {
      const xi = (B1.b - A1.b) / (A1.m - B1.m);
      const yi = A1.m * xi + A1.b;
      if (xi >= 0 && xi <= xmax) {
        body += `<circle cx="${P.px(xi)}" cy="${P.py(yi)}" r="9" fill="none" stroke="${INK}" stroke-width="3"/>`;
        body += `<circle cx="${P.px(xi)}" cy="${P.py(yi)}" r="3.5" fill="${INK}"/>`;
        body += txt(opts.markLabel || 'meeting point', P.px(xi) + 15, P.py(yi) - 14, 13, INK);
      }
    }
    if (opts.caption) body += label(opts.caption, P.W / 2, 26, 15, INK);
    return wrap(P.W, P.H, opts.label || 'two straight lines and their meeting point', body, opts.max);
  }

  /* ── rightTri: a right triangle with its legs given and the hypotenuse as "?" (or the reverse) ──
     opts.a / opts.b are the legs, opts.hyp is the hypotenuse when it is the known one. Labels are
     printed for what is GIVEN only; the unknown is always "?". */
  function rightTri(opts) {
    opts = opts || {};
    const a = Number(opts.a) || 3, b = Number(opts.b) || 4;
    const W = 560, H = opts.h || 330;
    const ox = 120, oy = H - 78;
    const k = Math.min(300 / a, 190 / b);
    const ax = a * k, bx = b * k;
    let body = blank(W, H, opts.fill || '#fbfdff');
    body += `<path d="M${ox} ${oy} L${ox + ax} ${oy} L${ox + ax} ${oy - bx} Z" fill="${A}" fill-opacity=".45" stroke="${INK}" stroke-width="2.8" stroke-linejoin="round"/>`;
    /* the right-angle marker */
    body += `<path d="M${ox + ax - 20} ${oy}v-20h20" fill="none" stroke="${INK}" stroke-width="2.2"/>`;
    if (!opts.hypKnown) {
      body += label(String(a), ox + ax / 2, oy + 26, 16, INK);
      body += label(String(b), ox + ax + 30, oy - bx / 2, 16, INK);
      body += label('?', ox + ax / 2 - 14, oy - bx / 2 + 6, 20, WARM);
    } else {
      body += label(opts.aLabel || String(a), ox + ax / 2, oy + 26, 16, INK);
      body += label('?', ox + ax + 26, oy - bx / 2, 20, WARM);
      const c = Math.sqrt(a * a + b * b);
      body += label(opts.hypLabel || String(opts.hyp || c), ox + ax / 2 - 30, oy - bx / 2 + 4, 16, INK);
    }
    if (opts.caption) body += label(opts.caption, W / 2, H - 20, 14, '#54636f');
    return wrap(W, H, opts.label || 'a right triangle with one side unknown', body, opts.max);
  }

  /* ── pointsDist: two points with the two dashed legs, for distance in the plane ──────────────── */
  function pointsDist(p, q, opts) {
    opts = opts || {};
    const P = plane(Object.assign({
      xmin: Math.min(0, p[0] - 1, q[0] - 1),
      xmax: Math.max(p[0], q[0]) + 1,
      ymin: Math.min(0, p[1] - 1, q[1] - 1),
      ymax: Math.max(p[1], q[1]) + 1,
    }, opts));
    let body = P.body;
    /* the right triangle the two points make with the axes */
    body += `<line x1="${P.px(p[0])}" y1="${P.py(p[1])}" x2="${P.px(q[0])}" y2="${P.py(p[1])}" stroke="${GOOD}" stroke-width="2.4" stroke-dasharray="7 5"/>`;
    body += `<line x1="${P.px(q[0])}" y1="${P.py(p[1])}" x2="${P.px(q[0])}" y2="${P.py(q[1])}" stroke="${GOOD}" stroke-width="2.4" stroke-dasharray="7 5"/>`;
    body += `<line x1="${P.px(p[0])}" y1="${P.py(p[1])}" x2="${P.px(q[0])}" y2="${P.py(q[1])}" stroke="${WARM}" stroke-width="3.2" stroke-linecap="round"/>`;
    body += `<circle cx="${P.px(p[0])}" cy="${P.py(p[1])}" r="8" fill="${SHADE}" stroke="${INK}" stroke-width="2"/>`;
    body += `<circle cx="${P.px(q[0])}" cy="${P.py(q[1])}" r="8" fill="${B2}" stroke="${INK}" stroke-width="2"/>`;
    body += txt(opts.pLabel || `(${p[0]}, ${p[1]})`, P.px(p[0]) - 8, P.py(p[1]) - 16, 13, SHADE, 'end');
    body += txt(opts.qLabel || `(${q[0]}, ${q[1]})`, P.px(q[0]) + 10, P.py(q[1]) - 14, 13, WARM);
    if (opts.legs !== false) {
      body += label(String(Math.abs(q[0] - p[0])), (P.px(p[0]) + P.px(q[0])) / 2, P.py(p[1]) + 20, 13, GOOD);
      body += label(String(Math.abs(q[1] - p[1])), P.px(q[0]) + 20, (P.py(p[1]) + P.py(q[1])) / 2, 13, GOOD);
    }
    body += label(opts.distLabel || '?', (P.px(p[0]) + P.px(q[0])) / 2 - 16, (P.py(p[1]) + P.py(q[1])) / 2 - 8, 18, WARM);
    if (opts.caption) body += label(opts.caption, P.W / 2, 26, 15, INK);
    return wrap(P.W, P.H, opts.label || 'two plotted points and the distance between them', body, opts.max);
  }

  /* ── squareProof: the four-corners picture behind a² + b² = c² ────────────────────────────────
     A big square of side (a + b) with the four copies of the right triangle at its corners, so the
     tilted inner square is c². No numbers are printed unless asked for. */
  function squareProof(opts) {
    opts = opts || {};
    const a = Number(opts.a) || 3, b = Number(opts.b) || 4;
    const W = 560, H = 400;
    const k = 250 / (a + b);
    const s = (a + b) * k;
    const ox = (W - s) / 2, oy = (H - s) / 2 - 12;
    const A1 = [ox, oy], B1 = [ox + s, oy], C1 = [ox + s, oy + s], D1 = [ox, oy + s];
    const p1 = [ox + a * k, oy], p2 = [ox + s, oy + a * k], p3 = [ox + s - a * k, oy + s], p4 = [ox, oy + s - a * k];
    let body = blank(W, H, opts.fill || '#fbfdff');
    body += `<rect x="${ox}" y="${oy}" width="${s}" height="${s}" fill="#ffffff" stroke="${INK}" stroke-width="2.6"/>`;
    body += `<path d="M${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} L${p3[0]} ${p3[1]} L${p4[0]} ${p4[1]} Z" fill="${A}" fill-opacity=".5" stroke="${SHADE}" stroke-width="2.6"/>`;
    const tri = (m, n, o, fill) => `<path d="M${m[0]} ${m[1]}L${n[0]} ${n[1]}L${o[0]} ${o[1]}Z" fill="${fill}" fill-opacity=".5" stroke="${INK}" stroke-width="2.2"/>`;
    body += tri(A1, p1, p4, B);
    body += tri(B1, p2, p1, B);
    body += tri(C1, p3, p2, B);
    body += tri(D1, p4, p3, B);
    if (opts.tagA) body += label(opts.tagA, (A1[0] + p1[0]) / 2, A1[1] - 10, 14, BRAND);
    if (opts.tagB) body += label(opts.tagB, (A1[0] + p4[0]) / 2 - 18, (A1[1] + p4[1]) / 2, 14, BRAND);
    if (opts.tagC) body += label(opts.tagC, (p1[0] + p2[0]) / 2 + 6, (p1[1] + p2[1]) / 2 - 12, 14, SHADE);
    if (opts.caption) body += label(opts.caption, W / 2, H - 16, 14, '#54636f');
    return wrap(W, H, opts.label || 'a big square cut into four right triangles and a tilted inner square', body, opts.max);
  }

  /* ── stepTable: a worked-equation strip, one row per step ─────────────────────────────────────
     opts.rows = [[left, right], …] rendered as a two-column balance history with an operation column. */
  function stepTable(rows, opts) {
    opts = opts || {};
    const W = 600, rowH = 42;
    const H = 54 + rows.length * rowH;
    let body = blank(W, H, opts.fill || '#fbfdff');
    body += txt(opts.colA || 'left side', 150, 32, 13, '#54636f', 'middle');
    body += txt(opts.colB || 'right side', 380, 32, 13, '#54636f', 'middle');
    if (opts.colOp) body += txt(opts.colOp, 532, 32, 13, '#54636f', 'middle');
    rows.forEach((r, k) => {
      const y = 54 + k * rowH;
      body += `<rect x="40" y="${y}" width="520" height="${rowH - 6}" rx="8" fill="${k % 2 ? '#ffffff' : '#f3f7fb'}" stroke="${GRID}" stroke-width="1.4"/>`;
      body += label(String(r[0]), 150, y + 26, 16, INK);
      body += label(String(r[1]), 380, y + 26, 16, INK);
      if (r[2]) body += label(String(r[2]), 532, y + 24, 13, WARM);
    });
    if (opts.caption) body += label(opts.caption, W / 2, H - 10, 13, '#54636f');
    return wrap(W, H, opts.label || 'a table of equation steps', body, opts.max);
  }

  return { plane, slopeLine, twoLines, rightTri, pointsDist, squareProof, stepTable, wrap, label };
})();

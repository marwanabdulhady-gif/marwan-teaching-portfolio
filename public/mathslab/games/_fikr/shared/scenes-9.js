/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   SCENES9 — the Grade 9 picture library (parabolas, their roots and vertex, factored forms, and the
   solution region of a pair of linear inequalities)

   Same rule as scenes-7 and scenes-8: a figure is generated from the numbers in the question and never
   prints a value the student is meant to work out. A parabola shows its curve and its marked crossings as
   points; it does not label the roots unless asked. A sign chart shows the factors but not the sign
   conclusion. A region shows two boundary lines and the shaded overlap, not its corner coordinates.

   NOTE — no generic top-level name lives here: this file declares only SCENE9.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const SCENE9 = (() => {
  const INK = '#26303f', PAPER = '#fffdf6', BRAND = '#35507a';
  const A = '#9dc0e6', B = '#f2cb96', A2 = '#5f8cbe', B2 = '#d7a45f';
  const GRID = '#c6d0dc', SHADE = '#3f6aa8', WARM = '#b23b2e', GOOD = '#2f7d64', VIOLET = '#6b4a7a';

  const wrap = (w, h, label, body, max) =>
    `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="width:100%;max-width:${max || w}px;display:block;margin:0 auto">${body}</svg>`;
  const blank = (w, h, fill) => `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="18" fill="${fill || PAPER}" stroke="${INK}" stroke-width="2.5"/>`;
  const label = (t, x, y, size, color, extra) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size || 15}" font-weight="800" fill="${color || INK}"${extra || ''}>${t}</text>`;
  const txt = (t, x, y, size, color, anchor) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor || 'start'}" font-size="${size || 14}" font-weight="700" fill="${color || INK}">${t}</text>`;

  /* ── plane: axes on a chosen window, shared by everything below ─────────────────────────────────── */
  function plane(opts) {
    opts = opts || {};
    const W = opts.W || 620, H = opts.H || 400, pad = 46;
    const xmin = opts.xmin != null ? opts.xmin : -6, xmax = opts.xmax != null ? opts.xmax : 6;
    const ymin = opts.ymin != null ? opts.ymin : -4, ymax = opts.ymax != null ? opts.ymax : 10;
    const boxL = pad, boxR = W - pad, boxT = 26, boxB = H - pad;
    const px = (x) => boxL + ((x - xmin) / (xmax - xmin)) * (boxR - boxL);
    const py = (y) => boxB - ((y - ymin) / (ymax - ymin)) * (boxB - boxT);
    let body = blank(W, H, opts.fill || '#fbfdff');
    const stepX = Math.max(1, Math.ceil((xmax - xmin) / 12));
    const stepY = Math.max(1, Math.ceil((ymax - ymin) / 9));
    for (let v = Math.ceil(xmin / stepX) * stepX; v <= xmax; v += stepX) {
      body += `<line x1="${px(v)}" y1="${py(ymin)}" x2="${px(v)}" y2="${py(ymax)}" stroke="${GRID}" stroke-width="1.1"/>`;
      if (v !== 0) body += label(String(v), px(v), py(Math.min(Math.max(0, ymin), ymax)) + 19, 12, '#54636f');
    }
    for (let v = Math.ceil(ymin / stepY) * stepY; v <= ymax; v += stepY) {
      body += `<line x1="${px(xmin)}" y1="${py(v)}" x2="${px(xmax)}" y2="${py(v)}" stroke="${GRID}" stroke-width="1.1"/>`;
      if (v !== 0) body += label(String(v), px(Math.min(Math.max(0, xmin), xmax)) - 16, py(v) + 4, 12, '#54636f');
    }
    const ax = Math.min(Math.max(0, xmin), xmax), ay = Math.min(Math.max(0, ymin), ymax);
    body += `<line x1="${px(xmin)}" y1="${py(ay)}" x2="${px(xmax) + 10}" y2="${py(ay)}" stroke="${INK}" stroke-width="2.6"/>`;
    body += `<line x1="${px(ax)}" y1="${py(ymin)}" x2="${px(ax)}" y2="${py(ymax) - 10}" stroke="${INK}" stroke-width="2.6"/>`;
    body += `<path d="M${px(xmax) + 10} ${py(ay)}l-9-4v8Z" fill="${INK}"/>`;
    body += `<path d="M${px(ax)} ${py(ymax) - 10}l-4 9h8Z" fill="${INK}"/>`;
    body += txt(opts.xName || 'x', px(xmax) + 2, py(ay) + 34, 13, BRAND);
    body += txt(opts.yName || 'y', px(ax) - 32, py(ymax) + 6, 13, BRAND);
    return { px, py, body, W, H, xmin, xmax, ymin, ymax };
  }

  /* ── parabola: y = a(x − h)² + k drawn through the window ─────────────────────────────────────────
     opts.a, opts.h, opts.k. opts.roots = true marks the x-crossings; opts.vertex = true marks the vertex.
     Neither label prints coordinates unless asked: the student reads them off the grid. */
  function parabola(opts) {
    opts = opts || {};
    const a = Number(opts.a) || 1, h = Number(opts.h) || 0, k = Number(opts.k) || 0;
    const xmin = opts.xmin != null ? opts.xmin : Math.floor(h - 5);
    const xmax = opts.xmax != null ? opts.xmax : Math.ceil(h + 5);
    const ys = [xmin, xmax, h].map((x) => a * (x - h) * (x - h) + k);
    const ymin = opts.ymin != null ? opts.ymin : Math.min(0, ...ys) - 2;
    const ymax = opts.ymax != null ? opts.ymax : Math.max(0, ...ys) + 2;
    const P = plane({ W: opts.W, H: opts.H, xmin, xmax, ymin, ymax, xName: opts.xName, yName: opts.yName });
    let body = P.body;
    /* sample the curve densely so it is smooth at any window size */
    let d = '';
    for (let i = 0; i <= 160; i++) {
      const x = xmin + ((xmax - xmin) * i) / 160;
      const y = a * (x - h) * (x - h) + k;
      if (y < ymin - 2 || y > ymax + 2) { d += ''; continue; }
      d += (d === '' ? 'M' : 'L') + P.px(x).toFixed(1) + ' ' + P.py(y).toFixed(1) + ' ';
    }
    body += `<path d="${d.trim()}" fill="none" stroke="${SHADE}" stroke-width="3.4" stroke-linecap="round"/>`;
    if (opts.axis !== false) {
      body += `<line x1="${P.px(h)}" y1="${P.py(ymin)}" x2="${P.px(h)}" y2="${P.py(ymax)}" stroke="${VIOLET}" stroke-width="1.8" stroke-dasharray="6 5"/>`;
    }
    if (opts.vertex !== false) {
      body += `<circle cx="${P.px(h)}" cy="${P.py(k)}" r="7" fill="${B2}" stroke="${INK}" stroke-width="2.2"/>`;
    }
    if (opts.roots) {
      /* the roots only exist when the parabola reaches the x-axis from the correct side */
      if (a * k <= 0) {
        const r = Math.sqrt(-k / a);
        [h - r, h + r].forEach((x) => {
          if (x >= xmin && x <= xmax) body += `<circle cx="${P.px(x)}" cy="${P.py(0)}" r="6.5" fill="#fff" stroke="${WARM}" stroke-width="2.6"/>`;
        });
      }
    }
    if (opts.caption) body += label(opts.caption, P.W / 2, P.H - 12, 14, '#54636f');
    return wrap(P.W, P.H, opts.label || 'a parabola on a coordinate plane', body, opts.max);
  }

  /* ── vertices / mode: a table of values for a quadratic, with the requested column as "?" ──────────
     opts.fn = (x) => y  — the values are computed, and the ask column is blanked. */
  function valueTable(xs, fn, opts) {
    opts = opts || {};
    const W = opts.W || 600;
    const cols = xs.length;
    const colW = (W - 80) / cols;
    const H = 118;
    let body = blank(W, H, opts.fill || '#fbfdff');
    if (opts.caption) body += label(opts.caption, W / 2, 26, 14, '#54636f');
    body += txt(opts.rowA || 'x', 40, 62, 14, BRAND);
    body += txt(opts.rowB || 'y', 40, 96, 14, BRAND);
    xs.forEach((x, i) => {
      const cx = 80 + colW * i + colW / 2;
      body += `<rect x="${80 + colW * i + 3}" y="40" width="${colW - 6}" height="26" rx="6" fill="${i === opts.ask ? '#fff4d6' : '#f3f7fb'}" stroke="${GRID}" stroke-width="1.2"/>`;
      body += `<rect x="${80 + colW * i + 3}" y="72" width="${colW - 6}" height="26" rx="6" fill="${i === opts.ask ? '#fff4d6' : '#ffffff'}" stroke="${GRID}" stroke-width="1.2"/>`;
      body += label(String(x), cx, 58, 14, INK);
      body += label(i === opts.ask ? '?' : String(fn(x)), cx, 90, 14, i === opts.ask ? WARM : INK);
    });
    return wrap(W, H, opts.label || 'a table of values for a quadratic', body, opts.max);
  }

  /* ── factPair: a product written as the two factors it came from, for factoring rounds ────────────
     Shows "x² + bx + c" above, and two empty brackets below. No numbers are revealed except b and c. */
  function factBox(c, sum, opts) {
    opts = opts || {};
    const W = 600, H = 150;
    let body = blank(W, H, opts.fill || '#fbfdff');
    body += label(opts.expr || `x² + ${sum}x + ${c}`, W / 2, 46, 24, INK);
    body += label('=', W / 2, 82, 20, '#8b98a6');
    body += label(`(x + ?)(x + ?)`, W / 2, 120, 22, WARM);
    if (opts.caption) body += label(opts.caption, W / 2, 144, 12, '#54636f');
    return wrap(W, H, opts.label || 'a quadratic expression and two empty brackets', body, opts.max);
  }

  /* ── rootPair: the factored form with its two crossings marked, for reading roots off a graph ───── */
  function rootsGraph(r1, r2, opts) {
    opts = opts || {};
    const a = opts.a || 1;
    const h = (r1 + r2) / 2;
    const k = -a * ((r2 - r1) / 2) * ((r2 - r1) / 2);
    return parabola(Object.assign({ a, h, k, roots: true, vertex: opts.vertex !== false }, opts));
  }

  /* ── signChart: two factor columns and a product row, with one cell blank ───────────────────────── */
  function signChart(vals, opts) {
    opts = opts || {};
    const W = 620, H = 176;
    const cols = vals.length;
    const colW = (W - 130) / cols;
    let body = blank(W, H, opts.fill || '#fbfdff');
    const rows = [opts.f1 || '(x − 2)', opts.f2 || '(x + 3)', opts.prod || 'product'];
    rows.forEach((name, r) => {
      const y = 34 + r * 44;
      body += txt(name, 24, y + 20, 14, r === 2 ? INK : BRAND);
      vals.forEach((v, i) => {
        const cx = 130 + colW * i + colW / 2;
        const ask = r === 2 && i === (opts.ask | 0);
        const sign = r === 0 ? (v - 2) : r === 1 ? (v + 3) : (v - 2) * (v + 3);
        const text = ask ? '?' : (r === 2 ? (sign > 0 ? '+' : sign < 0 ? '−' : '0') : (sign > 0 ? '+' : sign < 0 ? '−' : '0'));
        const fill = /\+/.test(text) ? '#e7f4ec' : /−/.test(text) ? '#fdeaea' : ask ? '#fff4d6' : '#f3f7fb';
        body += `<rect x="${130 + colW * i + 3}" y="${y}" width="${colW - 6}" height="32" rx="6" fill="${fill}" stroke="${GRID}" stroke-width="1.2"/>`;
        body += label(text, cx, y + 23, 18, text === '?' ? WARM : INK);
      });
      body += txt(opts.colFor ? '' : '', 0, 0, 10, INK);
    });
    body += txt('x =', 24, 168, 13, '#54636f');
    vals.forEach((v, i) => {
      const cx = 130 + colW * i + colW / 2;
      body += label(String(v).replace('-', '−'), cx, 168, 13, '#54636f');
    });
    return wrap(W, H, opts.label || 'a sign chart for a product of two factors', body, opts.max);
  }

  /* ── region: two boundary lines and the shading of the half-planes that both allow ────────────────
     opts.l1 / opts.l2 = {m, b, op} where op is '≤' or '≥'. The shading is computed point by point, so
     the picture is true for whatever pair is passed in. No corner coordinates are ever printed. */
  function region(l1, l2, opts) {
    opts = opts || {};
    const xmax = opts.xmax != null ? opts.xmax : 10;
    const ymax = opts.ymax != null ? opts.ymax : Math.max(
      l1.m * xmax + l1.b, l2.m * xmax + l2.b, 6) + 2;
    const P = plane({ W: 620, H: 430, xmin: 0, xmax, ymin: 0, ymax, xName: opts.xName, yName: opts.yName });
    let body = P.body;
    /* The admissible set of one half-plane is the rectangle clipped by that boundary; the set of both is
       the rectangle clipped twice (Sutherland–Hodgman). That keeps the wash an exact polygon — a few
       hundred bytes — instead of a tiled approximation, and it is correct for any pair of boundaries. */
    const clip = (poly, L) => {
      const inside = (pt) => (L.op === '≤' ? pt[1] <= L.m * pt[0] + L.b + 1e-9 : pt[1] >= L.m * pt[0] + L.b - 1e-9);
      const cross = (p1, p2) => {
        const x1 = p1[0], y1 = p1[1], x2 = p2[0], y2 = p2[1];
        const d1 = y1 - (L.m * x1 + L.b), d2 = y2 - (L.m * x2 + L.b);
        const t = d1 / (d1 - d2);
        return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
      };
      const out = [];
      for (let i = 0; i < poly.length; i++) {
        const cur = poly[i], prev = poly[(i + poly.length - 1) % poly.length];
        const cin = inside(cur), pin = inside(prev);
        if (cin && pin) out.push(cur);
        else if (cin && !pin) { out.push(cross(prev, cur)); out.push(cur); }
        else if (!cin && pin) out.push(cross(prev, cur));
      }
      return out;
    };
    const box = [[0, 0], [xmax, 0], [xmax, ymax], [0, ymax]];
    const only1 = clip(box, l1);
    const only2 = clip(box, l2);
    const both = clip(only1, l2);
    const polyPath = (poly, fill, op) => (poly.length < 3 ? '' :
      `<path d="M${poly.map((pt) => P.px(pt[0]).toFixed(1) + ' ' + P.py(pt[1]).toFixed(1)).join('L')}Z" fill="${fill}" fill-opacity="${op}"/>`);
    body += polyPath(only1, SHADE, '.10');
    body += polyPath(only2, WARM, '.10');
    body += polyPath(both, GOOD, '.26');
    const drawLine = (L, color, name) => {
      let g = `<line x1="${P.px(0)}" y1="${P.py(L.b)}" x2="${P.px(xmax)}" y2="${P.py(L.m * xmax + L.b)}" stroke="${color}" stroke-width="3.2" stroke-linecap="round" ${L.op === '≤' || L.op === '≥' ? '' : 'stroke-dasharray="8 6"'}/>`;
      if (name) {
        const lx = xmax * 0.12, ly = L.m * lx + L.b;
        g += `<rect x="${P.px(lx) - 40}" y="${P.py(ly) - 30}" width="130" height="24" rx="6" fill="#fff" fill-opacity=".86"/>`;
        g += txt(name, P.px(lx) - 34, P.py(ly) - 12, 13, color);
      }
      return g;
    };
    body += drawLine(l1, SHADE, opts.n1);
    body += drawLine(l2, WARM, opts.n2);
    if (opts.caption) body += label(opts.caption, P.W / 2, P.H - 10, 13, '#54636f');
    return wrap(P.W, P.H, opts.label || 'two boundary lines and the region where both conditions hold', body, opts.max);
  }

  /* ── squareStep: the completing-the-square diagram, an (x + b/2)² square beside the left-over ────
     A visual for the algebra: the x² square, the two bx/2 strips, and what must be added to close the
     corner. The added corner is drawn hollow because that is exactly the quantity being found. */
  function squareStep(b, opts) {
    opts = opts || {};
    const W = 560, H = 380;
    const side = 250, ox = 96, oy = 62;
    const half = b / 2;
    const total = 1 + half;               /* in units of x */
    const unit = side / total;
    const xLen = unit, sLen = half * unit;
    let body = blank(W, H, opts.fill || '#fbfdff');
    /* x² square */
    body += `<rect x="${ox}" y="${oy}" width="${xLen}" height="${xLen}" fill="${A}" fill-opacity=".55" stroke="${INK}" stroke-width="2.4"/>`;
    body += label('x²', ox + xLen / 2, oy + xLen / 2 + 6, 16, INK);
    /* the two strips, one along the top and one along the side */
    body += `<rect x="${ox + xLen}" y="${oy}" width="${sLen}" height="${xLen}" fill="${B}" fill-opacity=".6" stroke="${INK}" stroke-width="2.2"/>`;
    body += `<rect x="${ox}" y="${oy + xLen}" width="${xLen}" height="${sLen}" fill="${B}" fill-opacity=".6" stroke="${INK}" stroke-width="2.2"/>`;
    /* the hollow corner that has to be added */
    body += `<rect x="${ox + xLen}" y="${oy + xLen}" width="${sLen}" height="${sLen}" fill="none" stroke="${WARM}" stroke-width="2.8" stroke-dasharray="7 5"/>`;
    body += label('?', ox + xLen + sLen / 2, oy + xLen + sLen / 2 + 7, 20, WARM);
    body += txt(opts.stripLabel || `x · ${half}`, ox + xLen + sLen / 2, oy - 12, 13, '#54636f', 'middle');
    body += txt(opts.sideLabel || `x · ${half}`, ox - 16, oy + xLen + sLen / 2, 13, '#54636f', 'end');
    body += label('x', ox + xLen / 2, oy + xLen + sLen + 26, 15, BRAND);
    body += label(String(half), ox + xLen + sLen / 2, oy + xLen + sLen + 26, 15, BRAND);
    if (opts.caption) body += label(opts.caption, W / 2, H - 16, 14, '#54636f');
    return wrap(W, H, opts.label || 'a square being completed, with the missing corner marked', body, opts.max);
  }

  return { plane, parabola, valueTable, factBox, rootsGraph, signChart, region, squareStep, wrap, label };
})();

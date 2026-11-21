/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 5 PICTURE LIBRARY — unit cubes and prisms, thousandths, fraction area models, a first-quadrant
   coordinate plane, a circle with a marked central angle, percent bars, an architecture grid of regular
   tiles, and a navigator's bearing rose.

   Same rules as scenes.js / scenes-2.js / scenes-3.js / scenes-4.js: a picture is generated from the numbers
   the question is about, and it never prints a value the child is meant to work out. The prism shows the
   stack, not the answer; the coordinate plane shows the points, not the ordered pair; the circle shows the
   wedge, not the degree count.

   NOTE — no `const UNITS` or other generic top-level name lives here: a grade-5 source file may declare its
   own. Everything is namespaced under SCENE5.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const SCENE5 = (() => {
  const INK = '#243244', PAPER = '#fffdf6', BRAND = '#2f6f9f', EDGE = '#8a5a1f';
  const CUBE = '#cfe4f6', CUBE2 = '#a9cdec', CUBE_TOP = '#e6f2fc', HIDDEN = '#eef3f7';
  const GRID = '#b9c6d4', SHADE = '#3b6fb6', WARM = '#f3c98b';

  const wrap = (w, h, label, body, max) =>
    `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="width:100%;max-width:${max || w}px;display:block;margin:0 auto">${body}</svg>`;
  const blank = (w, h, fill) => `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="18" fill="${fill || PAPER}" stroke="${INK}" stroke-width="2.5"/>`;
  const label = (txt, x, y, size, color, extra) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size || 16}" font-weight="800" fill="${color || INK}"${extra || ''}>${txt}</text>`;
  const txt = (t, x, y, size, color, anchor) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor || 'start'}" font-size="${size || 15}" font-weight="700" fill="${color || INK}">${t}</text>`;

  /* ── a cube: three rhombi, top face lighter so the stack reads as depth ───────────────────────────── */
  function cube(x, y, s, opts) {
    opts = opts || {};
    const k = s * 0.42;
    const top = opts.fill || CUBE_TOP, left = opts.fill || CUBE, right = opts.fill2 || CUBE2;
    return `<path d="M${x} ${y - k / 2}L${x + s / 2} ${y - k / 2 - s * 0.36}L${x + s} ${y - k / 2}L${x + s / 2} ${y - k / 2 + s * 0.36}Z" fill="${top}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`
      + `<path d="M${x} ${y - k / 2}L${x + s / 2} ${y - k / 2 + s * 0.36}L${x + s / 2} ${y - k / 2 + s * 0.36 + s}L${x} ${y - k / 2 + s}Z" fill="${left}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`
      + `<path d="M${x + s} ${y - k / 2}L${x + s / 2} ${y - k / 2 + s * 0.36}L${x + s / 2} ${y - k / 2 + s * 0.36 + s}L${x + s} ${y - k / 2 + s}Z" fill="${right}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`;
  }

  /* ── unitCubePrism: an l × w × h prism drawn as a stack of visible unit cubes ──────────────────────
     Nothing is printed: the child counts the cubes, or counts a layer and the layers. Kept to small
     dimensions so the cubes stay legible at 390 px. */
  function unitCubePrism(l, w, h, opts) {
    opts = opts || {};
    const W = 600, H = opts.h || 360;
    const s = Math.min(46, 330 / Math.max(l, w), 190 / Math.max(1, h));
    const k = s * 0.36;
    const ox = 96, oy = H - 78;
    let body = blank(W, H, opts.fill || '#f8fbfe');
    /* back-to-front so nearer cubes overlap farther ones */
    for (let lay = 0; lay < h; lay += 1) {
      for (let row = w - 1; row >= 0; row -= 1) {
        for (let col = 0; col < l; col += 1) {
          const x = ox + col * s + row * (s * 0.5);
          const y = oy - lay * s - row * k;
          const shade = lay === h - 1 ? 0 : 6;
          body += cube(x, y, s, {
            fill: shade ? '#dbeaf8' : CUBE_TOP,
            fill2: shade ? '#bed7ef' : CUBE2,
          });
        }
      }
    }
    if (opts.caption) body += label(opts.caption, W / 2, H - 18, 15, '#5b6b7a');
    return wrap(W, H, opts.label || `a prism ${l} cubes long, ${w} wide and ${h} tall, drawn in unit cubes`, body, opts.max);
  }

  /* ── plain cuboid (no interior cubes) for the volume-formula lessons ──────────────────────────────── */
  function prism(l, w, h, opts) {
    opts = opts || {};
    const W = 560, H = opts.h || 320;
    const cx = W / 2, cy = H / 2 + 22;
    const dx = 150, dy = 86, dz = 104;              /* horizontal span, depth, height — all in px */
    /* length runs right, height runs up, width runs back-right at 30° */
    const A = [cx - dx, cy];
    const B = [cx + dx, cy];
    const C = [cx + dx + dz * 0.62, cy - dz * 0.46];
    const D = [cx - dx + dz * 0.62, cy - dz * 0.46];
    const A2 = [A[0], A[1] - dy], B2 = [B[0], B[1] - dy], C2 = [C[0], C[1] - dy], D2 = [D[0], D[1] - dy];
    const p = (pt) => `${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`;
    let body = blank(W, H, opts.fill || '#f8fbfe');
    body += `<path d="M${p(A)}L${p(B)}L${p(C)}L${p(D)}Z" fill="#c7dcef" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
    body += `<path d="M${p(A2)}L${p(B2)}L${p(B)}L${p(A)}Z" fill="#e2eefa" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
    body += `<path d="M${p(B2)}L${p(C2)}L${p(C)}L${p(B)}Z" fill="#adcbe6" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
    body += `<path d="M${p(A2)}L${p(D2)}L${p(C2)}L${p(B2)}Z" fill="#f0f7fd" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
    /* dimension marks only where the question supplies the number */
    if (opts.dims) {
      const d = opts.dims;
      if (d.l != null) body += txt(`${d.l}`, (A[0] + B[0]) / 2, cy + 30, 20, BRAND, 'middle');
      if (d.h != null) body += txt(`${d.h}`, A2[0] - 18, (A[1] + A2[1]) / 2 + 6, 20, BRAND, 'middle');
      if (d.w != null) body += txt(`${d.w}`, (C[0] + B[0]) / 2 + 14, (C[1] + B[1]) / 2 - 4, 20, BRAND, 'middle');
    }
    if (opts.caption) body += label(opts.caption, W / 2, H - 16, 15, '#5b6b7a');
    return wrap(W, H, opts.label || 'a rectangular prism with its three dimensions', body, opts.max);
  }

  /* ── compositePrism: an L-shaped solid made of two non-overlapping prisms ──────────────────────────
     opts.split=true draws the cut line, so the child sees the two pieces before adding them. Never
     prints either piece's volume. */
  function compositePrism(opts) {
    opts = opts || {};
    const W = 600, H = opts.h || 380;
    const u = 44, ox = 118, oy = H - 84;
    /* an L: a tall left arm of 2×2 footprint and a low right arm, both 1 cube deep, arm heights given */
    const armH = opts.armH || 3, restH = opts.restH || 1, armW = opts.armW || 2, restW = opts.restW || 3;
    const dep = opts.depth || 1;
    const k = u * 0.5;
    let body = blank(W, H, '#f8fbfe');
    const draw = (colFrom, colTo, height) => {
      for (let lay = 0; lay < height; lay += 1) {
        for (let row = dep - 1; row >= 0; row -= 1) {
          for (let col = colFrom; col < colTo; col += 1) {
            body += cube(ox + col * u + row * (u * 0.5), oy - lay * u - row * k, u, {});
          }
        }
      }
    };
    draw(0, armW, armH);
    draw(armW, armW + restW, restH);
    if (opts.split) {
      const x = ox + armW * u;
      body += `<path d="M${x} ${oy - armH * u}L${x} ${oy + 6}" stroke="#c0392b" stroke-width="3" stroke-dasharray="7 5"/>`;
      body += label('the cut', x, oy + 26, 14, '#c0392b');
    }
    if (opts.caption) body += label(opts.caption, W / 2, H - 16, 15, '#5b6b7a');
    return wrap(W, H, 'an L-shaped solid drawn as two rectangular prisms side by side', body, opts.max);
  }

  /* ── thousandthsGrid: one whole cut into 1000 — a 10×10×10 block flattened into ten 10×10 sheets ────
     opts.shown = how many whole sheets to draw (usually 1 or 2); opts.shade{n,h,t} shades n hundredths,
     h tenths, t thousandths on the first sheet. The number is never printed. */
  function thousandthsGrid(shown, shade, opts) {
    opts = opts || {};
    const W = 600, H = opts.h || 300;
    const sheetW = 216, sheetH = 216, gap = 26;
    const y0 = 40;
    let body = blank(W, H, opts.fill || '#fbfdff');
    for (let s = 0; s < (shown || 1); s += 1) {
      const x0 = 34 + s * (sheetW + gap);
      for (let i = 0; i < 10; i += 1) {
        for (let j = 0; j < 10; j += 1) {
          let fill = '#fff';
          if (s === 0 && shade) {
            if (shade.t && i * 10 + j < (shade.t % 10) + (shade.h || 0) * 10) fill = '#244a75';
            else if (shade.h && i < shade.h) fill = SHADE;
          }
          body += `<rect x="${x0 + j * (sheetW / 10)}" y="${y0 + i * (sheetH / 10)}" width="${sheetW / 10}" height="${sheetH / 10}" fill="${fill}" stroke="${GRID}" stroke-width="0.9"/>`;
        }
      }
      body += `<rect x="${x0}" y="${y0}" width="${sheetW}" height="${sheetH}" fill="none" stroke="${INK}" stroke-width="2.4"/>`;
      body += label(`sheet ${['١', '٢', '٣'][s] || s + 1}`, x0 + sheetW / 2, y0 + sheetH + 26, 15, '#5b6b7a');
    }
    body += label('each sheet is 100 of 1000 · ten sheets make one whole', W / 2, H - 14, 14.5, '#5b6b7a');
    return wrap(W, H, opts.label || 'one whole cut into one thousand equal parts', body, opts.max);
  }

  /* ── powerShift: a digit card sliding along a place-value strip for ×/÷ by a power of ten ────────── */
  function powerShift(digits, from, to, opts) {
    opts = opts || {};
    const W = 600, H = opts.h || 210;
    const names = ['tens', 'ones', '.', 'tenths', 'hundredths', 'thousandths'];
    const n = names.length, cw = Math.min(88, (W - 60) / n), x0 = (W - cw * n) / 2;
    let body = blank(W, H, '#f9fcff');
    names.forEach((nm, i) => {
      const x = x0 + i * cw;
      body += `<rect x="${x}" y="46" width="${cw}" height="64" fill="${nm === '.' ? '#f5e6c8' : '#fff'}" stroke="${nm === '.' ? EDGE : INK}" stroke-width="2.2"/>`;
      body += label(nm, x + cw / 2, 132, 11.5, '#6b7a8a');
    });
    /* the card sits in `from`, a ghost shows where it lands in `to` */
    const card = (col, alpha, tag) => {
      const x = x0 + col * cw + 6;
      return `<g opacity="${alpha}"><rect x="${x}" y="54" width="${cw - 12}" height="48" rx="9" fill="${BRAND}" stroke="${INK}" stroke-width="2"/>`
        + label(digits, x + (cw - 12) / 2, 87, 24, '#fff') + `</g>`
        + (tag ? label(tag, x + (cw - 12) / 2, 40, 13, BRAND) : '');
    };
    if (to !== from) body += card(from, 0.28 + 0, '');
    body += card(to, 1, '');
    const a = x0 + from * cw + cw / 2, b = x0 + to * cw + cw / 2;
    const dir = b > a ? 1 : -1;
    body += `<path d="M${a + dir * 22} 178L${b - dir * 26} 178" stroke="${BRAND}" stroke-width="3" marker-end="url(#a5)"/>`;
    body += `<defs><marker id="a5" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0L9 4.5L0 9Z" fill="${BRAND}"/></marker></defs>`;
    if (opts.caption) body += label(opts.caption, W / 2, H - 12, 15, '#5b6b7a');
    return wrap(W, H, opts.label || 'a digit card moved along the place-value strip', body, opts.max);
  }

  /* ── fracArea: the product of two fractions as an overlapping area model ──────────────────────────
     a/b × c/d: a square cut into b columns and d rows; the first fraction shades a columns, the second
     shades c rows, and the overlap is the product. Nothing is simplified or printed. */
  function fracArea(a, b, c, d, opts) {
    opts = opts || {};
    const W = 400, H = opts.h || 400, pad = 40, side = Math.min(300, W - pad * 2);
    const x0 = (W - side) / 2, y0 = 34;
    let body = blank(W, H, '#fbf8ff');
    for (let i = 0; i < b; i += 1) {
      for (let j = 0; j < d; j += 1) {
        const inCols = i < a, inRows = j < c;
        const fill = inCols && inRows ? '#3b6fb6' : inCols ? '#bcd6ef' : inRows ? '#f6dfc0' : '#fff';
        body += `<rect x="${x0 + (side / b) * i}" y="${y0 + (side / d) * j}" width="${side / b}" height="${side / d}" fill="${fill}" stroke="${GRID}" stroke-width="1"/>`;
      }
    }
    body += `<rect x="${x0}" y="${y0}" width="${side}" height="${side}" fill="none" stroke="${INK}" stroke-width="2.6"/>`;
    body += label('the overlap is the product', W / 2, y0 + side + 30, 15, '#5b6b7a');
    return wrap(W, H, opts.label || 'an area model of one fraction of another', body, opts.max);
  }

  /* ── coordinatePlane: first quadrant only, 0..max, optional points ─────────────────────────────────
     opts.points = [[x,y,tag]…]; a tag only prints when the question gives it. Axes are labelled x and y
     and numbered at 1-step spacing so the child reads the pair off the grid. */
  function coordinatePlane(opts) {
    opts = opts || {};
    /* `scale` is the axis maximum, `max` is the rendered width — they must not share a name */
    const W = 480, H = opts.h || 460, max = opts.scale || 8;
    const padL = 54, padB = 52, padT = 30, padR = 34;
    const side = Math.min(W - padL - padR, H - padB - padT);
    const x0 = padL, y0 = H - padB;
    const step = side / max;
    let body = blank(W, H, '#fbfdff');
    for (let i = 1; i <= max; i += 1) {
      body += `<path d="M${x0 + i * step} ${y0}V${y0 - side}" stroke="${GRID}" stroke-width="1"/>`;
      body += `<path d="M${x0} ${y0 - i * step}H${x0 + side}" stroke="${GRID}" stroke-width="1"/>`;
      body += txt(`${i}`, x0 + i * step, y0 + 20, 13, '#6b7a8a', 'middle');
      body += txt(`${i}`, x0 - 12, y0 - i * step + 5, 13, '#6b7a8a', 'middle');
    }
    body += `<path d="M${x0} ${y0 - side - 8}V${y0}H${x0 + side + 8}" fill="none" stroke="${INK}" stroke-width="2.8"/>`;
    body += txt('y', x0 - 6, y0 - side - 12, 17, INK, 'middle');
    body += txt('x', x0 + side + 16, y0 + 6, 17, INK, 'middle');
    body += txt('0', x0 - 10, y0 + 18, 13, '#6b7a8a', 'middle');
    (opts.points || []).forEach(([px, py, tag]) => {
      const cx2 = x0 + px * step, cy2 = y0 - py * step;
      body += `<circle cx="${cx2}" cy="${cy2}" r="7" fill="${opts.dot || '#c0392b'}" stroke="#fff" stroke-width="2"/>`;
      if (tag) body += txt(tag, cx2 + 12, cy2 - 10, 15, '#c0392b');
    });
    if (opts.path && opts.path.length > 1) {
      body += `<path d="M${opts.path.map(([px, py]) => `${x0 + px * step} ${y0 - py * step}`).join('L')}" fill="none" stroke="${BRAND}" stroke-width="2.6" stroke-dasharray="6 5"/>`;
    }
    if (opts.caption) body += label(opts.caption, W / 2, H - 12, 14.5, '#5b6b7a');
    return wrap(W, H, opts.label || 'a coordinate plane in the first quadrant', body, opts.max);
  }

  /* ── circleAngle: a circle with a shaded sector of `deg`, optional protractor ticks ─────────────── */
  function circleAngle(deg, opts) {
    opts = opts || {};
    const W = 420, H = 380, cx = W / 2, cy = 176, r = 132;
    let body = blank(W, H, '#fffdf6');
    body += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${INK}" stroke-width="2.6"/>`;
    if (opts.ticks !== false) {
      for (let t = 0; t < 360; t += 15) {
        const a1 = (t * Math.PI) / 180, len = t % 90 === 0 ? 13 : 7;
        body += `<path d="M${cx + (r - len) * Math.cos(a1)} ${cy - (r - len) * Math.sin(a1)}L${cx + r * Math.cos(a1)} ${cy - r * Math.sin(a1)}" stroke="${t % 90 === 0 ? INK : GRID}" stroke-width="${t % 90 === 0 ? 2 : 1.2}"/>`;
      }
    }
    const a0 = 0, a1 = (-deg * Math.PI) / 180;
    const big = deg > 180 ? 1 : 0;
    body += `<path d="M${cx} ${cy}L${cx + r} ${cy}A${r} ${r} 0 ${big} 0 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}Z" fill="${SHADE}" fill-opacity=".30" stroke="${BRAND}" stroke-width="2.6"/>`;
    body += `<path d="M${cx} ${cy}L${cx + r} ${cy}" stroke="${INK}" stroke-width="2.6"/>`;
    body += `<path d="M${cx} ${cy}L${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}" stroke="${BRAND}" stroke-width="2.6"/>`;
    body += `<circle cx="${cx}" cy="${cy}" r="5" fill="${INK}"/>`;
    if (opts.showDeg) body += label(`${deg}°`, cx + 62 * Math.cos(a1 / 2), cy + 62 * Math.sin(a1 / 2) + 6, 19, BRAND);
    if (opts.caption) body += label(opts.caption, W / 2, H - 16, 15, '#5b6b7a');
    return wrap(W, H, opts.label || `a circle with a sector of ${deg} degrees`, body, opts.max);
  }

  /* ── spyglass / star clock: the night-sky circle used by the astronomy lesson ────────────────────── */
  function starClock(deg, opts) {
    opts = opts || {};
    const W = 420, H = 400, cx = W / 2, cy = 190, r = 148;
    let body = blank(W, H, '#101c2e');
    body += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#17263c" stroke="#8fb3d9" stroke-width="2"/>`;
    for (let t = 0; t < 360; t += 30) {
      const a1 = (t * Math.PI) / 180;
      body += `<path d="M${cx + (r - 14) * Math.cos(a1)} ${cy - (r - 14) * Math.sin(a1)}L${cx + r * Math.cos(a1)} ${cy - r * Math.sin(a1)}" stroke="#8fb3d9" stroke-width="2"/>`;
      body += `<text x="${cx + (r - 30) * Math.cos(a1)}" y="${cy - (r - 30) * Math.sin(a1) + 5}" text-anchor="middle" font-size="13" font-weight="800" fill="#9ec4e8">${t}°</text>`;
    }
    const a1 = (-deg * Math.PI) / 180;
    body += `<path d="M${cx} ${cy}L${cx + r} ${cy}A${r} ${r} 0 ${deg > 180 ? 1 : 0} 0 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}Z" fill="#f6c95c" fill-opacity=".22" stroke="#f6c95c" stroke-width="2.4"/>`;
    body += `<path d="M${cx} ${cy}L${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}" stroke="#f6c95c" stroke-width="2.6"/>`;
    body += `<path d="M${cx} ${cy}L${cx + r} ${cy}" stroke="#cfe4f6" stroke-width="2.6"/>`;
    body += `<circle cx="${cx}" cy="${cy}" r="5" fill="#f6c95c"/>`;
    if (opts.caption) body += `<text x="${W / 2}" y="${H - 16}" text-anchor="middle" font-size="15" font-weight="700" fill="#9ec4e8">${opts.caption}</text>`;
    return wrap(W, H, opts.label || 'a night-sky circle used as a star clock', body, opts.max);
  }

  /* ── percentBar: a 20-cell double bar for percent ↔ fraction ↔ decimal ──────────────────────────── */
  function percentBar(pct, opts) {
    opts = opts || {};
    const W = 520, H = opts.h || 176, pad = 36, y = 48, bh = 58, cells = 20;
    const span = W - pad * 2, cw = span / cells;
    const on = Math.round((pct / 100) * cells);
    let body = blank(W, H, '#f7fbfb');
    for (let i = 0; i < cells; i += 1) {
      body += `<rect x="${pad + i * cw}" y="${y}" width="${cw}" height="${bh}" fill="${i < on ? '#1f8a70' : '#fff'}" stroke="${i % 5 === 0 ? INK : GRID}" stroke-width="${i % 5 === 0 ? 2 : 1}"/>`;
    }
    for (let k = 0; k <= 100; k += 20) {
      body += txt(`${k}%`, pad + (span * k) / 100, y + bh + 24, 13, '#4a5b6a', 'middle');
    }
    if (opts.caption) body += label(opts.caption, W / 2, H - 14, 15, '#5b6b7a');
    return wrap(W, H, opts.label || 'a bar cut into twenty equal cells, five cells to every twenty percent', body, opts.max);
  }

  /* ── tileGrid: a wall of regular polygons — the zoning / zellige lesson counts tiles, edges, vertices ── */
  function tileGrid(kind, cols, rows, opts) {
    opts = opts || {};
    const W = 560, H = opts.h || 360;
    const s = Math.min(46, (W - 70) / (cols + 1), (H - 90) / (rows + 1));
    const ox = (W - cols * s * 1.02) / 2, oy = 44;
    const poly = (cx, cy, n, rot) => {
      const pts = [];
      for (let i = 0; i < n; i += 1) {
        const a = (Math.PI * 2 * i) / n + (rot || 0);
        pts.push(`${(cx + s * 0.52 * Math.cos(a)).toFixed(1)} ${(cy + s * 0.52 * Math.sin(a)).toFixed(1)}`);
      }
      return pts.join(' ');
    };
    let body = blank(W, H, '#fdf8f0');
    const n = kind === 'triangle' ? 3 : kind === 'hex' ? 6 : kind === 'octagon' ? 8 : 4;
    const rot = kind === 'square' ? Math.PI / 4 : kind === 'triangle' ? -Math.PI / 2 : Math.PI / 6;
    let count = 0;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const cx = ox + c * s * 1.02 + ((kind === 'triangle' && r % 2) ? s * 0.5 : 0);
        const cy = oy + r * s * 0.92;
        if (kind === 'triangle' && (c + r) % 2) continue;
        const fill = (r + c) % 3 === 0 ? '#e8d3b0' : (r + c) % 3 === 1 ? '#d9e8dd' : '#efdcd6';
        body += `<polygon points="${poly(cx, cy, n, rot)}" fill="${fill}" stroke="${EDGE}" stroke-width="2"/>`;
        count += 1;
      }
    }
    body += label(opts.caption || `${count} tiles`, W / 2, H - 16, 15, '#6b5a3a');
    return wrap(W, H, opts.label || `a wall of regular ${kind}s`, body, opts.max);
  }

  /* ── bearingRose: a compass rose with a plotted course, for the navigation lesson ───────────────── */
  function bearingRose(bearing, opts) {
    opts = opts || {};
    const W = 400, H = 400, cx = W / 2, cy = H / 2, r = 148;
    let body = blank(W, H, '#f2f9ff');
    body += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${INK}" stroke-width="2.4"/>`;
    ['N', 'E', 'S', 'W'].forEach((d, i) => {
      const a = (Math.PI / 2) * i - Math.PI / 2;
      body += `<path d="M${cx + (r - 12) * Math.cos(a)} ${cy + (r - 12) * Math.sin(a)}L${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}" stroke="${INK}" stroke-width="3"/>`;
      body += `<text x="${cx + (r + 2) * Math.cos(a) * 1.02}" y="${cy + (r + 2) * Math.sin(a) * 1.02 + 6}" text-anchor="middle" font-size="17" font-weight="900" fill="${INK}">${d}</text>`;
    });
    for (let t = 0; t < 360; t += 15) {
      const a = ((t - 90) * Math.PI) / 180, len = t % 45 === 0 ? 12 : 6;
      body += `<path d="M${cx + (r - len) * Math.cos(a)} ${cy + (r - len) * Math.sin(a)}L${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}" stroke="${GRID}" stroke-width="1.4"/>`;
    }
    const a = ((bearing - 90) * Math.PI) / 180;
    body += `<path d="M${cx} ${cy}L${cx + r * 0.86 * Math.cos(a)} ${cy + r * 0.86 * Math.sin(a)}" stroke="${opts.color || '#c0392b'}" stroke-width="4" stroke-linecap="round" marker-end="url(#ar5)"/>`;
    body += `<defs><marker id="ar5" markerWidth="11" markerHeight="11" refX="8" refY="5.5" orient="auto"><path d="M0 0L11 5.5L0 11Z" fill="${opts.color || '#c0392b'}"/></marker></defs>`;
    body += `<circle cx="${cx}" cy="${cy}" r="5" fill="${INK}"/>`;
    if (opts.caption) body += label(opts.caption, W / 2, H - 12, 15, '#4a5b6a');
    return wrap(W, H, opts.label || 'a compass rose with a plotted bearing', body, opts.max);
  }

  /* ── barRow: a simple labelled bar chart for data questions (mean, unit rate, comparison) ───────── */
  function barRow(vals, opts) {
    opts = opts || {};
    const W = 520, H = opts.h || 280, pad = 54, y0 = H - 58;
    const maxV = Math.max.apply(null, vals.map((v) => (typeof v === 'object' ? v.v : v))) || 1;
    const bw = Math.min(64, (W - pad * 2) / vals.length * 0.7);
    const gap = (W - pad * 2) / vals.length;
    let body = blank(W, H, '#fbfdff');
    vals.forEach((raw, i) => {
      const v = typeof raw === 'object' ? raw.v : raw;
      const name = typeof raw === 'object' ? raw.name : '';
      const hgt = ((y0 - 40) * v) / maxV;
      const x = pad + i * gap + (gap - bw) / 2;
      body += `<rect x="${x}" y="${y0 - hgt}" width="${bw}" height="${hgt}" rx="7" fill="${opts.dot || '#2f6f9f'}" fill-opacity=".78" stroke="${INK}" stroke-width="2"/>`;
      if (name) body += txt(name, x + bw / 2, y0 + 22, 13.5, '#4a5b6a', 'middle');
    });
    body += `<path d="M${pad - 8} ${y0}H${W - pad + 8}" stroke="${INK}" stroke-width="2.4"/>`;
    if (opts.caption) body += label(opts.caption, W / 2, 26, 15, '#5b6b7a');
    return wrap(W, H, opts.label || 'a bar chart', body, opts.max);
  }

  return { unitCubePrism, prism, compositePrism, thousandthsGrid, powerShift, fracArea,
    coordinatePlane, circleAngle, starClock, percentBar, tileGrid, bearingRose, barRow, wrap, label };
})();

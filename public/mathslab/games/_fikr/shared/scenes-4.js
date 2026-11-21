/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 4 PICTURE LIBRARY — area models for multiplication, division scaffolds, hundredths grids,
   four-place charts, protractor angles and fraction sums.
   Same rules as scenes.js / scenes-2.js / scenes-3.js: a picture is generated from the numbers the question
   asks about, and nothing prints a value the child is meant to work out. A cell in an area model is blank
   until the question supplies that product; an angle carries its degrees only when the question states them.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const SCENE4 = (() => {
  const INK = '#2c3a4a', PAPER = '#fffaf0', BRAND = '#2b6f8f';
  const CELL = '#fde8cd', CELL2 = '#f7d9b4', EDGE = '#8a5a1f';
  const SHADE = '#3b6fb6', GRID = '#b9a888';
  const wrap = (w, h, label, body, max) =>
    `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="width:100%;max-width:${max || w}px;display:block;margin:0 auto">${body}</svg>`;
  const blank = (w, h, fill) => `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="18" fill="${fill || PAPER}" stroke="${INK}" stroke-width="2.5"/>`;
  const label = (txt, x, y, size, color, extra) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size || 16}" font-weight="800" fill="${color || INK}"${extra || ''}>${txt}</text>`;

  /* split a number into its place-value parts, so 24 becomes [20, 4] and 8 stays [8] */
  const parts = (n) => {
    if (n < 10) return [n];
    if (n < 100) return [Math.floor(n / 10) * 10, n % 10].filter((p) => p > 0);
    return [Math.floor(n / 100) * 100, Math.floor((n % 100) / 10) * 10, n % 10].filter((p) => p > 0);
  };

  /* ---- an area model: the rectangle split along both dimensions. Cells hold their product only when asked ---- */
  function areaModel(a, b, opts) {
    opts = opts || {};
    const W = 600, H = opts.h || 330, padX = 92, padY = 66;
    const spanX = W - padX - 48, spanY = H - padY - 58;
    const pa = parts(a), pb = parts(b);
    /* widths follow the value of each part so the model keeps its proportion, with a readable floor */
    const rawA = pa.map((p) => (p / a) * spanX);
    const rawB = pb.map((p) => (p / b) * spanY);
    const fix = (raw, total) => {
      const floor = 54;
      let out = raw.slice();
      for (let i = 0; i < out.length; i += 1) out[i] = Math.max(floor, out[i]);
      const k = total / out.reduce((s, v) => s + v, 0);
      return out.map((v) => v * k);
    };
    const wA = fix(rawA, spanX), hB = fix(rawB, spanY);
    let body = blank(W, H, opts.fill || '#fff7ec');
    let x = padX;
    pa.forEach((p, i) => {
      let y = padY;
      pb.forEach((q, j) => {
        const cellLabel = opts.show ? String(p * q) : (opts.labels === false ? '' : '');
        body += `<rect x="${x}" y="${y}" width="${wA[i]}" height="${hB[j]}" fill="${(i + j) % 2 ? CELL2 : CELL}" stroke="${INK}" stroke-width="2"/>`;
        if (cellLabel) body += label(cellLabel, x + wA[i] / 2, y + hB[j] / 2 + 8, 19, EDGE);
        y += hB[j];
      });
      body += label(String(p), x + wA[i] / 2, padY - 16, 20, EDGE);
      x += wA[i];
    });
    let y = padY;
    pb.forEach((q, j) => {
      body += label(String(q), padX - 30, y + hB[j] / 2 + 8, 20, EDGE);
      y += hB[j];
    });
    body += label(`${a} × ${b}`, W / 2, H - 16, 17, '#6b5a3a');
    return wrap(W, H, opts.label || `an area model for ${a} by ${b}`, body, opts.max);
  }

  /* ---- a division scaffold: the bracket and the dividend, with room for partial quotients underneath ---- */
  function divBracket(dividend, divisor, opts) {
    opts = opts || {};
    const W = 560, H = opts.h || 240, x0 = 168, y = 96;
    let body = blank(W, H, '#f4fbf5');
    body += `<path d="M${x0} 62v96" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
    body += `<path d="M${x0} 62h${186}c14 0 20 10 24 22l12 30" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
    body += label(String(dividend), x0 + 96, y, 34, INK);
    body += label(String(divisor), x0 - 34, y - 30, 30, BRAND);
    /* three ruled lines: the working space, which stays empty because the quotients are the answer */
    [124, 154, 184].forEach((ly) => { body += `<path d="M${x0 + 10} ${ly}h250" stroke="${GRID}" stroke-width="1.6" stroke-dasharray="6 5"/>`; });
    if (opts.caption) body += label(opts.caption, W / 2, H - 14, 15, '#5b6b7a');
    return wrap(W, H, opts.label || `${dividend} divided by ${divisor} written as a division scaffold`, body, opts.max);
  }

  /* ---- hundredths: a 10 × 10 grid with n cells shaded ---- */
  function decimalGrid(n, opts) {
    opts = opts || {};
    const W = 520, H = 300, cell = 22, gx = (W - cell * 10) / 2, gy = 48;
    let body = blank(W, H, '#f7f9ff');
    for (let r = 0; r < 10; r += 1) {
      for (let c = 0; c < 10; c += 1) {
        const i = r * 10 + c;
        body += `<rect x="${gx + c * cell}" y="${gy + r * cell}" width="${cell}" height="${cell}" fill="${i < n ? SHADE : '#fff'}" stroke="${INK}" stroke-width="1.1"/>`;
      }
    }
    if (opts.caption) body += label(opts.caption, W / 2, H - 18, 15, '#5b6b7a');
    return wrap(W, H, opts.label || `a hundred grid with ${n} squares shaded`, body, opts.max);
  }

  /* ---- a place-value chart to hundred-thousands; any one column can be blanked ----
     `hide` is the column index (0 = ten-thousands) so the caller never has to know the digits */
  /* A place-value chart of any width. Grade 4 needs to reach the MILLIONS, so the column count follows the
     number rather than being pinned at four or five. `hide` is a column index counted from the left of the
     visible chart, or a place name ('millions' ... 'ones'). */
  const PLACE_NAMES = ['millions', 'hundred-thousands', 'ten-thousands', 'thousands', 'hundreds', 'tens', 'ones'];
  const PLACE_SHORT = { millions: 'M', 'hundred-thousands': 'HTh', 'ten-thousands': 'TTh', thousands: 'Th', hundreds: 'H', tens: 'T', ones: 'O' };
  function placeChart4(n, opts) {
    opts = opts || {};
    const W = 600, H = opts.h || 220;
    /* choose the width: at least 4 columns, at most 7, always enough for the number given */
    const need = String(Math.abs(n)).length;
    const cols = Math.max(opts.cols || 0, need, opts.five === false ? 4 : Math.min(5, need));
    const total = Math.min(7, Math.max(4, cols));
    const names = PLACE_NAMES.slice(7 - total);
    const digits = String(Math.abs(n)).padStart(total, '0').split('').map(Number);
    const cw = Math.min(112, (W - 46) / total), x0 = (W - cw * total) / 2;
    const hideByName = typeof opts.hide === 'string' ? names.indexOf(opts.hide) : -1;
    let body = blank(W, H, '#f6fbff');
    digits.forEach((digit, i) => {
      const x = x0 + i * cw;
      const hide = opts.hide === i || hideByName === i;
      body += `<rect x="${x}" y="44" width="${cw}" height="78" fill="#fff" stroke="${INK}" stroke-width="2.4"/>`;
      body += label(hide ? '?' : String(digit), x + cw / 2, 102, 38, hide ? BRAND : INK);
      body += label(names[i], x + cw / 2, 148, total > 5 ? 10 : 11.5, '#6b7a8a');
    });
    if (opts.caption) body += label(opts.caption, W / 2, H - 16, 15, '#5b6b7a');
    return wrap(W, H, opts.label || `a place-value chart for ${n}`, body, opts.max);
  }

  /* ---- one named shape, with the tick marks a geometer would draw: equal-length sides get matching ticks,
     parallel pairs get matching chevrons, and right angles get a small square. The marks are the evidence; the
     shape's name is never printed on it. `parallelogram` and `rhombus` are sheared so they do not read as
     rectangles at a glance. ---- */
  function shape(kind, opts) {
    opts = opts || {};
    const W = 340, H = 300, cx = W / 2, cy = H / 2 + 6;
    const stroke = `stroke="${INK}" stroke-width="4" fill="${opts.fill || '#dbe7f5'}" stroke-linejoin="round"`;
    const rightMark = (x, y, dx, dy, s2) =>
      `<path d="M${x} ${y}h${dx * s2}v${-dy * s2}h${-dx * s2}Z" fill="none" stroke="${BRAND}" stroke-width="2.6"/>`;
    const tick = (x1, y1, x2, y2, n) => {
      /* n ticks across the middle of a side, drawn perpendicular to it */
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, len = Math.hypot(x2 - x1, y2 - y1);
      const ux = (x2 - x1) / len, uy = (y2 - y1) / len, px = -uy, py = ux;
      let g = '';
      for (let i = 0; i < n; i += 1) {
        const off = (i - (n - 1) / 2) * 9;
        const bx = mx + ux * off, by = my + uy * off;
        g += `<path d="M${bx - px * 9} ${by - py * 9}L${bx + px * 9} ${by + py * 9}" stroke="${BRAND}" stroke-width="3" stroke-linecap="round"/>`;
      }
      return g;
    };
    const chevron = (x1, y1, x2, y2, n) => {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, len = Math.hypot(x2 - x1, y2 - y1);
      const ux = (x2 - x1) / len, uy = (y2 - y1) / len, px = -uy, py = ux;
      let g = '';
      for (let i = 0; i < n; i += 1) {
        const off = (i - (n - 1) / 2) * 12;
        const bx = mx + ux * off, by = my + uy * off;
        g += `<path d="M${bx - ux * 7 + px * 8} ${by - uy * 7 + py * 8}L${bx} ${by}L${bx - ux * 7 - px * 8} ${by - uy * 7 - py * 8}" fill="none" stroke="#8a5fc4" stroke-width="2.8" stroke-linejoin="round"/>`;
      }
      return g;
    };
    let body = blank(W, H, opts.fill2 || '#f7f9fd');
    if (kind === 'square') {
      const r = 76;
      body += `<rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" ${stroke}/>`;
      body += rightMark(cx - r, cy - r, 1, -1, 18); body += rightMark(cx + r, cy - r, -1, -1, 18);
      body += tick(cx - r, cy - r, cx + r, cy - r, 1) + tick(cx - r, cy + r, cx + r, cy + r, 1);
      body += tick(cx - r, cy - r, cx - r, cy + r, 2) + tick(cx + r, cy - r, cx + r, cy + r, 2);
    } else if (kind === 'rectangle') {
      body += `<rect x="${cx - 108}" y="${cy - 62}" width="216" height="124" ${stroke}/>`;
      body += rightMark(cx - 108, cy - 62, 1, -1, 18) + rightMark(cx + 108, cy - 62, -1, -1, 18);
    } else if (kind === 'triangle') {
      const r = 92;
      body += `<polygon points="${cx},${cy - r} ${cx - r},${cy + r * 0.78} ${cx + r},${cy + r * 0.78}" ${stroke}/>`;
      body += tick(cx, cy - r, cx - r, cy + r * 0.78, 1) + tick(cx - r, cy + r * 0.78, cx + r, cy + r * 0.78, 1) + tick(cx, cy - r, cx + r, cy + r * 0.78, 1);
    } else if (kind === 'rhombus') {
      const a = 96, b = 62;
      body += `<polygon points="${cx},${cy - a} ${cx + b},${cy} ${cx},${cy + a} ${cx - b},${cy}" ${stroke}/>`;
      body += tick(cx, cy - a, cx + b, cy, 1) + tick(cx + b, cy, cx, cy + a, 1) + tick(cx, cy + a, cx - b, cy, 1) + tick(cx - b, cy, cx, cy - a, 1);
      body += chevron(cx, cy - a, cx + b, cy, 1) + chevron(cx - b, cy, cx, cy + a, 1);
    } else {
      /* parallelogram: sheared rectangle, both pairs parallel, no right angles */
      const w = 200, h = 108, sk = 44;
      const pts = [[cx - w / 2 + sk, cy - h / 2], [cx + w / 2 + sk, cy - h / 2], [cx + w / 2 - sk, cy + h / 2], [cx - w / 2 - sk, cy + h / 2]];
      body += `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" ${stroke}/>`;
      body += chevron(...pts[0], ...pts[1], 1) + chevron(...pts[3], ...pts[2], 1);
      body += chevron(...pts[0], ...pts[3], 2) + chevron(...pts[1], ...pts[2], 2);
    }
    if (opts.caption) body += label(opts.caption, W / 2, H - 14, 14, '#5b6b7a');
    return wrap(W, H, opts.label || `a ${kind}`, body, opts.max);
  }

  /* ---- an angle: one ray fixed to the right, the other opened by `deg` ---- */
  function angle(deg, opts) {
    opts = opts || {};
    const W = 520, H = 300, cx = 110, cy = 232, r = 250;
    const rad = (deg * Math.PI) / 180;
    const ex = cx + r * Math.cos(rad), ey = cy - r * Math.sin(rad);
    const ar = 62;
    const ax = cx + ar * Math.cos(rad), ay = cy - ar * Math.sin(rad);
    let body = blank(W, H, '#fffaf0');
    /* protractor: a half circle with 10° ticks, no numbers, so the child reads the marks or reasons about them */
    if (opts.protractor) {
      const pr = 226;
      body += `<path d="M${cx - pr} ${cy} a${pr} ${pr} 0 0 1 ${pr * 2} 0" fill="#fdf6e6" stroke="${INK}" stroke-width="2.2"/>`;
      for (let t = 0; t <= 180; t += 10) {
        const tr = (t * Math.PI) / 180;
        const len = t % 30 === 0 ? 18 : 10;
        body += `<path d="M${cx + (pr - len) * Math.cos(tr)} ${cy - (pr - len) * Math.sin(tr)}L${cx + pr * Math.cos(tr)} ${cy - pr * Math.sin(tr)}" stroke="${t % 30 === 0 ? INK : GRID}" stroke-width="${t % 30 === 0 ? 2 : 1.3}"/>`;
      }
    }
    body += `<path d="M${cx} ${cy}L${cx + r} ${cy}" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
    body += `<path d="M${cx} ${cy}L${ex} ${ey}" stroke="${BRAND}" stroke-width="4.5" stroke-linecap="round"/>`;
    body += `<path d="M${cx + ar} ${cy}A${ar} ${ar} 0 0 ${deg > 180 ? 1 : 0} ${ax} ${ay}" fill="none" stroke="${BRAND}" stroke-width="2.6" stroke-dasharray="5 4"/>`;
    body += `<circle cx="${cx}" cy="${cy}" r="6" fill="${INK}"/>`;
    if (opts.showDeg) body += label(`${deg}°`, cx + 96 * Math.cos(rad / 2), cy - 96 * Math.sin(rad / 2) + 6, 22, BRAND);
    if (opts.caption) body += label(opts.caption, W / 2, H - 12, 15, '#5b6b7a');
    return wrap(W, H, opts.label || `an angle of ${deg} degrees`, body, opts.max);
  }

  /* ---- two fraction bars with a plus sign between them: the sum is not printed ---- */
  function fracSum(n1, d, n2, opts) {
    opts = opts || {};
    const W = 600, H = opts.h || 190, bw = 210, bh = 54, y = 66;
    const bar = (x, num, den) => {
      let g = '';
      for (let i = 0; i < den; i += 1) {
        g += `<rect x="${x + (bw / den) * i}" y="${y}" width="${bw / den}" height="${bh}" fill="${i < num ? SHADE : '#fff'}" stroke="${INK}" stroke-width="2"/>`;
      }
      return g;
    };
    let body = blank(W, H, '#f8f6ff');
    body += bar(52, n1, d);
    body += bar(338, n2, d);
    body += label('+', 300, y + 40, 34, '#5b4a7a');
    body += label(opts.caption || '', W / 2, H - 16, 15, '#5b6b7a');
    return wrap(W, H, opts.label || `two fraction bars of the same denominator`, body, opts.max);
  }

  /* a mixed number as a whole bar plus a partial bar, drawn above the label so the words do the counting */
  function mixedBar(whole, num, den, opts) {
    opts = opts || {};
    const W = 560, H = opts.h || 170, bh = 44;
    let body = blank(W, H, '#f8f6ff');
    const drawBar = (x, y, n, d, filled) => {
      let g = '';
      for (let i = 0; i < d; i += 1) {
        g += `<rect x="${x + (140 / d) * i}" y="${y}" width="${140 / d}" height="${bh}" fill="${i < filled ? SHADE : '#fff'}" stroke="${INK}" stroke-width="2"/>`;
      }
      return g;
    };
    for (let w = 0; w < whole; w += 1) body += drawBar(40 + w * 152, 40, 0, den, den);
    body += drawBar(40 + whole * 152, 40, 0, den, num);
    body += label(opts.caption || '', W / 2, H - 20, 15, '#5b6b7a');
    return wrap(W, H, opts.label || `a mixed number drawn as wholes and a part`, body, opts.max);
  }

  return { areaModel, divBracket, decimalGrid, placeChart4, angle, fracSum, mixedBar, shape, parts, wrap, label };
})();

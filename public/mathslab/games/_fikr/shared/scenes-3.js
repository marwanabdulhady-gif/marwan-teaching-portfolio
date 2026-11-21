/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 3 PICTURE LIBRARY — equal groups, arrays of dots, fractions on a line, area and perimeter.
   Same rules as scenes.js and scenes-2.js: a picture is generated from the numbers the question asks about,
   so a caption can never contradict the drawing, and nothing prints the total the child is meant to work out.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const SCENE3 = (() => {
  const INK = '#2c3a4a', PAPER = '#fffaf0', BRAND = '#2b6f8f';
  const GROUP = '#4faa63', GROUP2 = '#2a8b9c', DOT = '#c9703f', SHADE = '#3b6fb6';
  const wrap = (w, h, label, body, max) =>
    `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="width:100%;max-width:${max || w}px;display:block;margin:0 auto">${body}</svg>`;
  const blank = (w, h, fill) => `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="18" fill="${fill || PAPER}" stroke="${INK}" stroke-width="2.5"/>`;
  const label = (txt, x, y, size, color) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size || 16}" font-weight="800" fill="${color || INK}">${txt}</text>`;

  /* a palm in a grove: used for the equal-groups picture */
  const palm = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M0 0c-3-9-1-17 2-24" stroke="#8a6a3d" stroke-width="3.4" fill="none" stroke-linecap="round"/><ellipse cx="-6" cy="-24" rx="9" ry="4.4" fill="${GROUP}" transform="rotate(-24 -6 -24)"/><ellipse cx="8" cy="-26" rx="9" ry="4.4" fill="#6fc17e" transform="rotate(20 8 -26)"/><ellipse cx="1" cy="-30" rx="7" ry="4" fill="${GROUP}" transform="rotate(-4 1 -30)"/><ellipse cx="0" cy="-3" rx="7" ry="3" fill="#d9c9a8"/></g>`;

  /* ---- equal groups: n circles, each holding `size` palms ---- */
  function groups(n, size, opts) {
    opts = opts || {};
    const W = 620, perRow = Math.min(n, 4), rowsN = Math.ceil(n / perRow);
    const groupW = 128, groupH = 96, gapX = 12, gapY = 12;
    const H = opts.h || Math.max(150, rowsN * (groupH + gapY) + 44);
    let body = blank(W, H, opts.fill || '#f2fbf4');
    const totalW = perRow * groupW + (perRow - 1) * gapX;
    const x0 = (W - totalW) / 2, y0 = 18;
    for (let g = 0; g < n; g += 1) {
      const gx = x0 + (g % perRow) * (groupW + gapX);
      const gy = y0 + Math.floor(g / perRow) * (groupH + gapY);
      body += `<rect x="${gx}" y="${gy}" width="${groupW}" height="${groupH}" rx="14" fill="#fff" stroke="${GROUP2}" stroke-width="2.4" stroke-dasharray="7 5"/>`;
      /* the items sit in a small grid inside the group so `size` up to 8 stays readable */
      const cols = size <= 3 ? size : 4, rr = Math.ceil(size / cols);
      for (let i = 0; i < size; i += 1) {
        const cx = gx + groupW / 2 + ((i % cols) - (cols - 1) / 2) * 26;
        const cy = gy + groupH / 2 + 8 + (Math.floor(i / cols) - (rr - 1) / 2) * 26;
        body += palm(cx, cy, 0.82);
      }
    }
    return wrap(W, H, opts.label || `${n} equal groups with ${size} palms in each group`, body, opts.max);
  }

  /* ---- an array of dots: rows × columns, unnumbered ---- */
  function dots(rows, cols, opts) {
    opts = opts || {};
    const W = 560, H = opts.h || 300;
    const step = Math.min(54, 320 / Math.max(rows, cols));
    const x0 = (W - (cols - 1) * step) / 2, y0 = (H - (rows - 1) * step) / 2 - 8;
    let body = blank(W, H, opts.fill || '#fff7ee');
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        body += `<circle cx="${x0 + c * step}" cy="${y0 + r * step}" r="${step * 0.29}" fill="${opts.color || DOT}"/>`;
      }
    }
    if (opts.rowBracket) {
      body += `<path d="M${x0 - step * 0.7} ${y0 - step * 0.6} h${(cols - 1) * step + step * 1.4}" stroke="#8a6a3d" stroke-width="2.4" stroke-dasharray="5 5"/>`;
      body += label(`one row`, W / 2, y0 - step * 0.75, 14, '#6b5a3a');
    }
    return wrap(W, H, opts.label || `an array of dots, ${rows} rows of ${cols}`, body, opts.max);
  }

  /* ---- division picture: `total` items dealt into `n` equal trays ---- */
  function share(total, n, opts) {
    opts = opts || {};
    const W = 620, H = opts.h || 210, each = Math.floor(total / n);
    const trayW = Math.min(150, (W - 60) / n - 12), gap = 12;
    const totalW = n * trayW + (n - 1) * gap, x0 = (W - totalW) / 2;
    let body = blank(W, H, '#fff8ec');
    for (let t = 0; t < n; t += 1) {
      const tx = x0 + t * (trayW + gap);
      body += `<path d="M${tx} 62h${trayW}l-${trayW * 0.12} ${H - 92} h-${trayW * 0.76}Z" fill="#e9d9bd" stroke="#8a6a3d" stroke-width="2.4"/>`;
      for (let i = 0; i < each; i += 1) {
        const cx = tx + 20 + (i % 3) * ((trayW - 40) / 3);
        const cy = 86 + Math.floor(i / 3) * 26;
        body += `<circle cx="${cx}" cy="${cy}" r="9.5" fill="${DOT}"/>`;
      }
    }
    return wrap(W, H, opts.label || `${total} dates dealt into ${n} equal trays`, body, opts.max);
  }

  /* ---- a number line from 0 to 1 cut into `den` equal parts, with an optional marker ---- */
  function fracLine(den, opts) {
    opts = opts || {};
    const W = 620, H = opts.h || 200, pad = 46, y = 120;
    const span = W - pad * 2;
    let body = blank(W, H, opts.fill || '#f3f7ff');
    body += `<line x1="${pad}" y1="${y}" x2="${W - pad}" y2="${y}" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
    for (let i = 0; i <= den; i += 1) {
      const x = pad + (span * i) / den;
      body += `<line x1="${x}" y1="${y - 11}" x2="${x}" y2="${y + 11}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
      if (i === 0) body += label('0', x, y + 38, 19, INK);
      else if (i === den) body += label('1', x, y + 38, 19, INK);
      else if (opts.numberAll) body += label(`${i}/${den}`, x, y + 38, 14, '#5b7a99');
    }
    /* the marker sits at num/den, drawn as a dot; its label is only printed when the question supplies it */
    if (opts.at != null) {
      const x = pad + (span * opts.at) / den;
      body += `<circle cx="${x}" cy="${y}" r="9" fill="${opts.markColor || SHADE}" stroke="#fff" stroke-width="2.5"/>`;
      if (opts.atLabel) body += label(opts.atLabel, x, y - 30, 20, opts.markColor || SHADE);
    }
    if (opts.caption) body += label(opts.caption, W / 2, H - 16, 15, '#5b6b7a');
    return wrap(W, H, opts.label || `a number line from 0 to 1 cut into ${den} equal parts`, body, opts.max);
  }

  /* ---- a fraction bar: den equal parts, num shaded; labels optional ---- */
  function fracBar(num, den, opts) {
    opts = opts || {};
    const W = 520, H = opts.h || 132, pad = 40, y = 44, bh = 52;
    const span = W - pad * 2;
    let body = blank(W, H, opts.fill || '#f7f4ff');
    for (let i = 0; i < den; i += 1) {
      const x = pad + (span * i) / den;
      body += `<rect x="${x}" y="${y}" width="${span / den}" height="${bh}" fill="${i < num ? SHADE : '#fff'}" stroke="${INK}" stroke-width="2.2"/>`;
    }
    if (opts.caption) body += label(opts.caption, W / 2, H - 16, 15, '#5b6b7a');
    return wrap(W, H, opts.label || `a bar cut into ${den} equal parts with ${num} shaded`, body, opts.max);
  }

  /* ---- two fraction bars stacked, for equivalence ---- */
  function fracPair(aTop, aBot, bTop, bBot, opts) {
    opts = opts || {};
    const W = 560, H = 260;
    let body = blank(W, H, '#fbf8ff');
    const bar = (num, den, y) => {
      const pad = 90, span = W - pad * 2;
      let g = '';
      for (let i = 0; i < den; i += 1) {
        const x = pad + (span * i) / den;
        g += `<rect x="${x}" y="${y}" width="${span / den}" height="48" fill="${i < num ? SHADE : '#fff'}" stroke="${INK}" stroke-width="2"/>`;
      }
      /* the equal-part ticks are the whole point, so they are drawn over both bars' edges */
      return g + `<path d="M${pad} ${y + 24}h${span}" stroke="#fff" stroke-width="0" />`;
    };
    body += bar(aTop, aBot, 52);
    body += bar(bTop, bBot, 160);
    body += `<path d="M${W / 2} 104v50" stroke="#b9a888" stroke-width="2.4" stroke-dasharray="5 5"/>`;
    if (opts.caption) body += label(opts.caption, W / 2, H - 14, 15, '#5b6b7a');
    return wrap(W, H, opts.label || 'two fraction bars for comparing', body, opts.max);
  }

  /* ---- area: a rectangle tiled in unit squares, side lengths optional ---- */
  function tiles(w, h, opts) {
    opts = opts || {};
    const W = 560, H = opts.h || 300, unit = Math.min(48, 330 / Math.max(w, h));
    const gw = w * unit, gh = h * unit, x0 = (W - gw) / 2, y0 = (H - gh) / 2 + 6;
    let body = blank(W, H, opts.fill || '#fff8ef');
    for (let r = 0; r < h; r += 1) {
      for (let c = 0; c < w; c += 1) {
        body += `<rect x="${x0 + c * unit}" y="${y0 + r * unit}" width="${unit}" height="${unit}" fill="${(r + c) % 2 ? '#f6dcc0' : '#fbead7'}" stroke="${INK}" stroke-width="1.6"/>`;
      }
    }
    if (opts.sides) {
      body += label(String(w), W / 2, y0 - 12, 19, '#8a5a1f');
      body += label(String(h), x0 - 18, y0 + gh / 2 + 6, 19, '#8a5a1f');
    }
    return wrap(W, H, opts.label || `a rectangle ${w} unit squares wide and ${h} tall`, body, opts.max);
  }

  /* ---- perimeter: a fenced rectangle; the two side lengths are given, the walk is not ---- */
  function fence(w, h, opts) {
    opts = opts || {};
    const W = 560, H = 260, unit = Math.min(46, 320 / Math.max(w, h));
    const gw = w * unit, gh = h * unit, x0 = (W - gw) / 2, y0 = (H - gh) / 2;
    let body = blank(W, H, '#f2fbf4');
    body += `<rect x="${x0}" y="${y0}" width="${gw}" height="${gh}" fill="#dcf0e2" stroke="#8a6a3d" stroke-width="5" stroke-dasharray="12 7"/>`;
    body += label(`${w} m`, W / 2, y0 - 14, 20, '#3f7d4f');
    body += label(`${w} m`, W / 2, y0 + gh + 30, 20, '#3f7d4f');
    body += label(`${h} m`, x0 - 26, y0 + gh / 2 + 7, 20, '#3f7d4f');
    body += label(`${h} m`, x0 + gw + 26, y0 + gh / 2 + 7, 20, '#3f7d4f');
    return wrap(W, H, opts.label || `a rectangle ${w} metres by ${h} metres with fencing on all four sides`, body, opts.max);
  }

  /* ---- rounding: a number line between two tens/hundreds with the number marked ---- */
  function roundLine(lo, hi, n, opts) {
    opts = opts || {};
    const W = 600, H = 190, pad = 60, y = 112, span = W - pad * 2;
    const mid = (lo + hi) / 2, x = pad + (span * (n - lo)) / (hi - lo);
    let body = blank(W, H, '#fffaf0');
    body += `<line x1="${pad}" y1="${y}" x2="${W - pad}" y2="${y}" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
    body += `<line x1="${pad + span / 2}" y1="${y - 26}" x2="${pad + span / 2}" y2="${y + 26}" stroke="#c9a227" stroke-width="3" stroke-dasharray="6 5"/>`;
    [[lo, pad], [hi, W - pad]].forEach(([v, px]) => {
      body += `<line x1="${px}" y1="${y - 12}" x2="${px}" y2="${y + 12}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
      body += label(String(v), px, y + 40, 20, INK);
    });
    body += `<circle cx="${x}" cy="${y}" r="10" fill="${BRAND}" stroke="#fff" stroke-width="2.6"/>`;
    body += label(String(n), x, y - 34, 20, BRAND);
    body += label(opts.caption || `halfway is ${mid}`, W / 2, H - 14, 15, '#5b6b7a');
    return wrap(W, H, opts.label || `a number line from ${lo} to ${hi} with ${n} marked`, body, opts.max);
  }

  /* a tidy fraction glyph for prompts and option tiles */
  const frac = (a, b, size) => `<span style="display:inline-flex;flex-direction:column;align-items:center;line-height:1.05;vertical-align:middle;font-size:${size || 22}px;font-weight:900"><span>${a}</span><span style="border-top:3px solid currentColor;width:100%;min-width:1.1em"></span><span>${b}</span></span>`;
  const times = '<span style="font-size:20px">×</span>';
  const divide = '<span style="font-size:20px">÷</span>';

  return { groups, dots, share, fracLine, fracBar, fracPair, tiles, fence, roundLine, frac, times, divide, wrap, label };
})();

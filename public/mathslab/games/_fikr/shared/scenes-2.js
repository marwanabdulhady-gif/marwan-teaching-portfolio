/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 2 PICTURE LIBRARY — place value, regrouping, money and arrays.
   Same rules as scenes.js: every picture is generated from the numbers the question asks about, so a caption
   can never disagree with the drawing. Nothing here fetches, and no picture prints a total the child is
   supposed to work out (blocks and notes are unnumbered; digits are only printed where the question gives them).
   ══════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const SCENE2 = (() => {
  const INK = '#4a2f15', BRAND = '#0e7c86', PAPER = '#fffaf0';
  const FLAT = '#2a8b9c', ROD = '#4faa63', UNIT = '#e0a93f';
  const wrap = (w, h, label, body, max) =>
    `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="width:100%;max-width:${max || w}px;display:block;margin:0 auto">${body}</svg>`;
  const blank = (w, h, fill) => `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="18" fill="${fill || PAPER}" stroke="${INK}" stroke-width="2.5"/>`;
  const label = (txt, x, y, size, color) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size || 16}" font-weight="800" fill="${color || INK}">${txt}</text>`;

  /* ---- base-ten pieces: a flat is 100, a rod is 10, a unit is 1 ---- */
  function flat(x, y, k, color) {
    const s = 42 * k;
    let g = `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${4 * k}" fill="${color || FLAT}" opacity=".92"/>`;
    for (let i = 1; i < 10; i++) {
      g += `<line x1="${x + (i * s) / 10}" y1="${y}" x2="${x + (i * s) / 10}" y2="${y + s}" stroke="#fff" stroke-width="${0.9 * k}" opacity=".55"/>`;
      g += `<line x1="${x}" y1="${y + (i * s) / 10}" x2="${x + s}" y2="${y + (i * s) / 10}" stroke="#fff" stroke-width="${0.9 * k}" opacity=".55"/>`;
    }
    return g + `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${4 * k}" fill="none" stroke="${INK}" stroke-width="${1.6 * k}"/>`;
  }
  function rod(x, y, k, color) {
    const w = 9 * k, h = 42 * k;
    let g = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${3 * k}" fill="${color || ROD}"/>`;
    for (let i = 1; i < 10; i++) g += `<line x1="${x}" y1="${y + (i * h) / 10}" x2="${x + w}" y2="${y + (i * h) / 10}" stroke="#fff" stroke-width="${0.9 * k}" opacity=".6"/>`;
    return g + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${3 * k}" fill="none" stroke="${INK}" stroke-width="${1.4 * k}"/>`;
  }
  function unit(x, y, k, color) {
    const s = 9 * k;
    return `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${2 * k}" fill="${color || UNIT}" stroke="${INK}" stroke-width="${1.3 * k}"/>`;
  }

  /* hundreds flats, tens rods and ones units laid out in three tidy groups */
  function baseTen(h, t, o, opts) {
    opts = opts || {};
    const W = 620, H = opts.h || 250;
    /* scale the blocks up so a handful of tens or ones still fills the frame: a 2-rod picture at k=1 is a
       speck in a 620-wide box, which reads as "nothing to count" to a seven-year-old */
    const natural = (h * 46) + (Math.min(t, 10) * 13) + (Math.min(o, 10) * 13) + 52;
    const k = opts.k || Math.max(1, Math.min(2.2, (W * 0.56) / Math.max(natural, 1)));
    const groups = [];
    if (h > 0) groups.push({ n: h, kind: 'flat' });
    if (t > 0) groups.push({ n: t, kind: 'rod' });
    if (o > 0) groups.push({ n: o, kind: 'unit' });
    if (!groups.length) groups.push({ n: 0, kind: 'unit' });
    /* group widths drive the layout so 9 flats and 2 rods both look balanced */
    const widths = groups.map((g) => (g.kind === 'flat' ? 5 * 44 * k : g.kind === 'rod' ? g.n * 13 * k : Math.min(g.n, 10) * 13 * k));
    const gap = 26, total = widths.reduce((a, b) => a + b, 0) + gap * (groups.length - 1);
    let x = (W - total) / 2;
    let body = blank(W, H, opts.fill || '#f4fbfc');
    /* centre the block rows vertically, leaving room for the place labels along the bottom */
    const heights = groups.map((g) => (g.kind === 'flat' ? (Math.ceil(g.n / 5) * 46 - 4) * k : g.kind === 'rod' ? 42 * k : (Math.ceil(g.n / 10) * 13) * k));
    const tallest = Math.max(...heights);
    const contentTop = 18 + (H - 44 - tallest) / 2;
    groups.forEach((g, gi) => {
      const top = contentTop + (tallest - heights[gi]) / 2;
      for (let i = 0; i < g.n; i += 1) {
        if (g.kind === 'flat') {
          const perRow = Math.min(g.n, 5);
          body += flat(x + (i % perRow) * 46 * k, top + Math.floor(i / perRow) * 46 * k, k);
        } else if (g.kind === 'rod') {
          body += rod(x + i * 13 * k, top, k);
        } else {
          body += unit(x + (i % 10) * 13 * k, top + Math.floor(i / 10) * 13 * k, k);
        }
      }
      const names = { flat: 'hundreds', rod: 'tens', unit: 'ones' };
      body += label(names[g.kind], x + widths[gi] / 2, H - 14, 15, '#55647a');
      x += widths[gi] + gap;
    });
    const say = `${h} hundreds, ${t} tens and ${o} ones drawn in base-ten blocks`;
    return wrap(W, H, opts.label || say, body, opts.max);
  }

  /* a place-value chart: three columns; a digit is printed only when the question supplies it */
  function placeChart(h, t, o, opts) {
    opts = opts || {};
    const W = 520, H = 200, cols = ['Hundreds', 'Tens', 'Ones'], vals = [h, t, o];
    const cw = 150, x0 = (W - cw * 3) / 2;
    let body = blank(W, H, opts.fill || '#f7f4ff');
    for (let i = 0; i < 3; i += 1) {
      const x = x0 + i * cw;
      body += `<rect x="${x + 6}" y="26" width="${cw - 12}" height="120" rx="14" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
      body += label(cols[i], x + cw / 2, 18, 15, '#55647a');
      const v = vals[i];
      body += label(v == null || v === '' ? '?' : String(v), x + cw / 2, 106, 46, v == null ? '#c9d6dd' : '#24303f');
    }
    const say = opts.label || 'a place-value chart with hundreds, tens and ones columns';
    return wrap(W, H, say, body, opts.max);
  }

  /* two groups side by side, for comparing */
  function compareHi(a, b, opts) {
    opts = opts || {};
    const W = 560, H = 190;
    let body = blank(W, H, '#fff8ee');
    [[a, 132, 'A'], [b, 428, 'B']].forEach(([n, cx, tag]) => {
      body += `<rect x="${cx - 104}" y="34" width="208" height="96" rx="16" fill="#fff" stroke="${INK}" stroke-width="2.5"/>`;
      body += label(String(n), cx, 106, 56, '#24303f');
      body += label(tag, cx, 166, 18, '#55647a');
    });
    body += label(opts.mid || '?', W / 2, 100, 40, '#e2564a');
    return wrap(W, H, opts.label || `two number cards, A is ${a} and B is ${b}`, body, opts.max);
  }

  /* Japanese-yen style note/coin art is wrong here: Saudi riyals — notes 1, 5, 10, 50 and halala coins */
  function note(x, y, value, k) {
    const w = 96 * k, h = 46 * k;
    const cols = { 1: '#a7c7a1', 5: '#c9a86a', 10: '#8fb4d9', 50: '#c58f9e', 100: '#9bb3c7' };
    return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${5 * k}" fill="${cols[value] || '#c9a86a'}" stroke="${INK}" stroke-width="${1.6 * k}"/>`
      + `<rect x="${x + 5 * k}" y="${y + 5 * k}" width="${w - 10 * k}" height="${h - 10 * k}" rx="${3 * k}" fill="none" stroke="${INK}" stroke-width="${1 * k}" opacity=".45"/>`
      + `<text x="${x + w / 2}" y="${y + h / 2 + 8 * k}" text-anchor="middle" font-size="${20 * k}" font-weight="800" fill="${INK}">${value}</text>`
      + `<text x="${x + w - 12 * k}" y="${y + h - 8 * k}" text-anchor="end" font-size="${10 * k}" font-weight="800" fill="${INK}" opacity=".7">SAR</text></g>`;
  }
  function coin(x, y, value, k) {
    const r = 15 * k;
    return `<g><circle cx="${x}" cy="${y}" r="${r}" fill="#e8dcc0" stroke="${INK}" stroke-width="${1.6 * k}"/>`
      + `<circle cx="${x}" cy="${y}" r="${r - 4 * k}" fill="none" stroke="${INK}" stroke-width="${1 * k}" opacity=".45"/>`
      + `<text x="${x}" y="${y + 4 * k}" text-anchor="middle" font-size="${11 * k}" font-weight="800" fill="${INK}">${value}</text></g>`;
  }
  /* notes and coins: `notes` is a list of note values, `coins` a list of halala values */
  function money(notes, coins, opts) {
    opts = opts || {};
    const W = 560, H = notes.length ? 190 : 120;
    let body = blank(W, H, opts.fill || '#fffaf0');
    let x = 34, y = 40;
    notes.forEach((v) => {
      if (x + 96 > W - 24) { x = 34; y += 60; }
      body += note(x, y, v, 1);
      x += 108;
    });
    if (coins && coins.length) {
      const cy = notes.length ? y + 66 : 84;
      coins.forEach((v, i) => { body += coin(46 + i * 40, cy, v, 1.1); });
      body += label('halalas', 46 + coins.length * 40 + 10, cy - 22, 14, '#55647a');
    }
    body += label(opts.caption || '', W / 2, H - 12, 15, '#55647a');
    return wrap(W, H, opts.label || 'Saudi riyal notes and halala coins', body, opts.max);
  }

  /* an array of crates: rows × columns, with the row and column counts labelled (not the total) */
  function array(rows, cols, opts) {
    opts = opts || {};
    const W = 560, H = 300, cell = Math.min(52, 330 / Math.max(rows, cols)), gx = cell * 0.9;
    const x0 = (W - cols * gx) / 2 + gx / 2, y0 = (H - rows * gx) / 2 + gx / 2 - 6;
    let body = blank(W, H, opts.fill || '#fff6e8');
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const x = x0 + c * gx, y = y0 + r * gx, s = cell * 0.72;
        body += `<rect x="${x - s / 2}" y="${y - s / 2}" width="${s}" height="${s}" rx="${s * 0.2}" fill="${opts.color || '#c9703f'}" stroke="${INK}" stroke-width="1.6"/>`;
        body += `<path d="M${x - s / 2} ${y} h${s} M${x} ${y - s / 2} v${s}" stroke="#fff" stroke-width="1.4" opacity=".65"/>`;
      }
    }
    body += `<path d="M${x0 - gx / 2} ${y0 + (rows - 0.5) * gx + 12} h${cols * gx}" stroke="#8a6a3d" stroke-width="2" stroke-dasharray="5 5"/>`;
    /* `bare` hides the row / column captions: used when the picture is itself an answer option, where
       printing "5 rows" would tell the child what to count instead of letting them count it */
    if (!opts.bare) {
      body += label(`${rows} rows`, W / 2, y0 + (rows - 0.5) * gx + 34, 15, '#6b5a3a');
      body += label(`${cols} in each row`, W / 2, 26, 16, '#6b5a3a');
    }
    return wrap(W, H, opts.label || `an array of crates, ${rows} rows with ${cols} in each row`, body, opts.max);
  }

  /* a skip-counting track: some numbers printed, the last slot empty */
  function skipTrack(start, step, shown, opts) {
    opts = opts || {};
    const W = 600, H = 150, n = shown, stepX = Math.min(86, (W - 60) / n);
    const x0 = (W - (n - 1) * stepX) / 2;
    let body = blank(W, H, '#effaf9');
    for (let i = 0; i < n; i += 1) {
      const x = x0 + i * stepX, v = start + i * step, last = i === n - 1;
      body += `<circle cx="${x}" cy="72" r="${stepX * 0.34}" fill="${last ? '#fff' : '#fff'}" stroke="${INK}" stroke-width="${last ? 3 : 2}" ${last ? 'stroke-dasharray="7 5"' : ''}/>`;
      body += label(last && opts.hideLast !== false ? '?' : String(v), x, 82, last ? 24 : 22, last ? INK : '#24303f');
      if (i < n - 1) body += `<path d="M${x + stepX * 0.34} 72 h${stepX * 0.32}" stroke="#b9a888" stroke-width="2" stroke-dasharray="4 4"/>`;
    }
    body += label(opts.caption || '', W / 2, H - 14, 15, '#6b5a3a');
    return wrap(W, H, opts.label || `a skip-counting track starting at ${start}`, body, opts.max);
  }

  /* a clock face at any five-minute mark. The Grade 1 scene only draws :00 and :30, which cannot show the
     five-minute marks this grade reads, so the hour hand is placed proportionally between hours. */
  function clockAt(hour, minutes, size) {
    const W = size || 230, c = W / 2, R = c - 12, k = W / 220;
    const pt = (deg, len) => [c + Math.cos(((deg - 90) * Math.PI) / 180) * len, c + Math.sin(((deg - 90) * Math.PI) / 180) * len];
    let body = `<circle cx="${c}" cy="${c}" r="${R}" fill="#fffdf6" stroke="${INK}" stroke-width="${6 * k}"/>`;
    for (let i = 1; i <= 12; i += 1) {
      const [x, y] = pt(i * 30, R * 0.78);
      body += label(i, x, y + 5 * k, 19 * k, '#3b2814');
    }
    /* ticks for every five-minute mark, longer on the quarters */
    for (let m = 0; m < 60; m += 5) {
      const [x1, y1] = pt(m * 6, R * 0.93), [x2, y2] = pt(m * 6, R * (m % 15 === 0 ? 0.84 : 0.88));
      body += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#b9a888" stroke-width="${2 * k}" stroke-linecap="round"/>`;
    }
    const [mx, my] = pt(minutes * 6, R * 0.72);
    const [hx, hy] = pt(((hour % 12) + minutes / 60) * 30, R * 0.46);
    body += `<line x1="${c}" y1="${c}" x2="${mx}" y2="${my}" stroke="${BRAND}" stroke-width="${5.5 * k}" stroke-linecap="round"/>`;
    body += `<line x1="${c}" y1="${c}" x2="${hx}" y2="${hy}" stroke="#d26542" stroke-width="${8.5 * k}" stroke-linecap="round"/>`;
    body += `<circle cx="${c}" cy="${c}" r="${6.5 * k}" fill="${INK}"/>`;
    const say = `clock showing ${hour} ${minutes ? 'past ' + String(minutes).padStart(2, '0') : "o'clock"}`;
    return wrap(W, W, say, body, W);
  }

  /* a picture graph whose key and columns are the question's own — the shared scene hard-codes "1 vote",
     which would contradict a Grade 2 question about a key of 2 or 5. One circle still equals one key unit. */
  function graphKeyed(vals, opts) {
    opts = opts || {};
    const names = opts.names || ['Ibex', 'Hyrax', 'Baboons'];
    const cols = opts.colors || ['#c87839', '#4d8f7d', '#8a5fa8'];
    const W = 520, H = 258, base = 200, maxV = Math.max(4, ...vals);
    let body = blank(W, H, '#fff6e8');
    body += label(opts.key || 'each circle = 2 animals', 392, 30, 15, '#6b5a3a');
    body += `<line x1="40" y1="${base}" x2="482" y2="${base}" stroke="#b9a888" stroke-width="3" stroke-linecap="round"/>`;
    for (let r = 1; r < maxV; r += 1) body += `<line x1="58" y1="${base - r * 30}" x2="466" y2="${base - r * 30}" stroke="#e6d8c4" stroke-width="1.5" stroke-dasharray="4 6"/>`;
    vals.forEach((v, i) => {
      const cx = 122 + i * 148;
      for (let j = 0; j < v; j += 1) body += `<circle cx="${cx}" cy="${base - 14 - j * 30}" r="12.5" fill="${cols[i % cols.length]}"/>`;
      body += label(names[i] || '', cx, base + 32, 16, INK);
    });
    const say = `picture graph, key ${opts.keyValue || 2} per circle: ${names.map((n, i) => `${n} ${vals[i]} circles`).join(', ')}`;
    return wrap(W, H, say, body, opts.max);
  }

  return { baseTen, placeChart, compareHi, money, array, skipTrack, clockAt, graphKeyed, note, coin, flat, rod, unit, wrap, label };
})();

/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   GRADE 1 PICTURE LIBRARY — game-side help, not engine code.
   Every function returns an HTML string (inline SVG) that a round or Learn slide can put in `prompt`,
   `say` or `UI.h(..., {html})`. Nothing here fetches, and no picture ever states a total the drawing
   does not show: the number and the objects are always produced from the same argument.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */
const SCENE = (() => {
  const INK = '#4a2f15', PAPER = '#fffaf0', BRAND = '#0e7c86', C1 = '#ffd23f', C2 = '#7bdff2', C3 = '#b6e3a1';
  const wrap = (w, hgt, label, body, max) =>
    `<svg viewBox="0 0 ${w} ${hgt}" role="img" aria-label="${label}" style="width:100%;max-width:${max || w}px;display:block;margin:0 auto">${body}</svg>`;
  const card = (w, hgt, fill) => `<rect x="2" y="2" width="${w - 4}" height="${hgt - 4}" rx="18" fill="${fill || PAPER}" stroke="${INK}" stroke-width="2.5" opacity=".98"/>`;
  const label = (txt, x, y, size, color) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size || 15}" font-weight="800" fill="${color || INK}">${txt}</text>`;

  /* one fish, drawn so a 6-year-old can point at it */
  const fish = (x, y, col, k) =>
    `<g><ellipse cx="${x}" cy="${y}" rx="${13 * k}" ry="${8.6 * k}" fill="${col}"/><path d="M${x - 11 * k} ${y} l${-9 * k} ${-6 * k} v${12 * k}Z" fill="${col}"/><circle cx="${x + 6 * k}" cy="${y - 2 * k}" r="${1.7 * k}" fill="#123a4d"/></g>`;
  const shell = (x, y, col, k) =>
    `<g><path d="M${x} ${y + 10 * k} q${-11 * k} 0 ${-11 * k} ${-9 * k} q0 ${-9 * k} ${11 * k} ${-9 * k} q${11 * k} 0 ${11 * k} ${9 * k} q0 ${9 * k} ${-11 * k} ${9 * k}Z" fill="${col}" stroke="${INK}" stroke-width="1.6"/><path d="M${x} ${y - 7 * k} v${16 * k}" stroke="${INK}" stroke-width="1.2" opacity=".6"/></g>`;
  const lantern = (x, y, col, out, k) =>
    `<g opacity="${out ? 0.45 : 1}"><path d="M${x} ${y - 13 * k} C${x - 11 * k} ${y + 2 * k} ${x - 7 * k} ${y + 13 * k} ${x} ${y + 13 * k} C${x + 7 * k} ${y + 13 * k} ${x + 11 * k} ${y + 2 * k} ${x} ${y - 13 * k}Z" fill="${out ? '#8f9bb3' : col}" stroke="${INK}" stroke-width="1.6"/>${out ? `<line x1="${x - 8 * k}" y1="${y - 8 * k}" x2="${x + 8 * k}" y2="${y + 8 * k}" stroke="${INK}" stroke-width="2"/>` : `<circle cx="${x}" cy="${y + 1 * k}" r="${3.4 * k}" fill="#fff3b0"/>`}<line x1="${x}" y1="${y - 19 * k}" x2="${x}" y2="${y - 13 * k}" stroke="${INK}" stroke-width="1.6"/></g>`;
  const leaf = (x, y, col, k) =>
    `<g><path d="M${x} ${y + 10 * k} q0 ${-9 * k} 0 ${-16 * k}" stroke="#4e7d52" stroke-width="${2 * k}" fill="none"/><ellipse cx="${x - 4.5 * k}" cy="${y - 4 * k}" rx="${5.5 * k}" ry="${3.2 * k}" fill="${col}" transform="rotate(-24 ${x} ${y})"/><ellipse cx="${x + 4.5 * k}" cy="${y - 8 * k}" rx="${5.5 * k}" ry="${3.2 * k}" fill="${col}" transform="rotate(24 ${x} ${y})"/></g>`;
  const pearl = (x, y, col, r) =>
    `<g><circle cx="${x}" cy="${y}" r="${r || 10}" fill="${col}" stroke="${INK}" stroke-width="1.2"/><circle cx="${x - (r || 10) * 0.3}" cy="${y - (r || 10) * 0.34}" r="${(r || 10) * 0.26}" fill="#ffffff" opacity=".7"/></g>`;

  /* a ten-frame: two rows of five; a second frame starts when the count passes ten */
  function tenFrame(n, opts) {
    opts = opts || {};
    const col = opts.color || BRAND, kind = opts.kind || 'dot', frames = n > 10 ? 2 : 1;
    const W = frames === 2 ? 520 : 300, H = 170;
    let body = card(W, H, opts.fill || '#f2fbfb');
    for (let f = 0; f < frames; f++) {
      const ox = frames === 2 ? 20 + f * 260 : 20;
      for (let c = 0; c < 5; c++) {
        for (let r = 0; r < 2; r++) {
          const cx = ox + 20 + c * 44, cy = 34 + r * 62;
          body += `<rect x="${cx - 19}" y="${cy - 19}" width="38" height="38" rx="6" fill="#fff" stroke="${INK}" stroke-width="1.4" opacity=".55"/>`;
          const i = f * 10 + r * 5 + c;
          if (i >= n) continue;
          body += kind === 'fish' ? fish(cx, cy, col, 1)
            : kind === 'shell' ? shell(cx, cy - 3, col, 1)
            : kind === 'leaf' ? leaf(cx, cy, col, 1)
            : `<circle cx="${cx}" cy="${cy}" r="11" fill="${col}"/>`;
        }
      }
    }
    return wrap(W, H, `${n} objects drawn in a ten-frame`, body);
  }

  /* two trays of pearls, one count each — never a label that disagrees with the dots */
  function trays(a, b, opts) {
    opts = opts || {};
    const W = 520, H = 230, per = 5, rows = 3;
    let body = card(W, H, opts.fill || '#fff6e6');
    [[a, 24, opts.colorA || C2, 'Tray A'], [b, 272, opts.colorB || '#a9577a', 'Tray B']].forEach(([n, ox, col, name]) => {
      body += `<rect x="${ox}" y="18" width="224" height="158" rx="14" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
      /* pearls are spread over three rows and centred in each row, so counting never needs a squint */
      for (let r = 0; r < rows; r++) {
        const inRow = Math.min(per, n - r * per);
        if (inRow <= 0) continue;
        const span = (inRow - 1) * 40;
        for (let c = 0; c < inRow; c++) {
          const x = ox + 112 - span / 2 + c * 40, y = 52 + r * 42;
          body += pearl(x, y, col, 14);
        }
      }
      body += label(name, ox + 112, 202, 17, INK);
    });
    return wrap(W, H, `tray A with ${a} pearls and tray B with ${b} pearls`, body);
  }

  /* lanterns: `lit` of `total` still glow, the rest are crossed out */
  function lanterns(total, lit, opts) {
    opts = opts || {};
    const cols = total <= 6 ? total : total <= 10 ? 5 : 10;
    const W = 520, H = total > 10 ? 190 : 180, gap = W / (cols + 1);
    let body = card(W, H, opts.fill || '#25324a');
    for (let i = 0; i < total; i++) {
      const x = gap + (i % cols) * gap, y = 72 + Math.floor(i / cols) * 66;
      body += lantern(x, y, opts.color || '#e5744d', i >= lit, 1.45);
    }
    return wrap(W, H, `${total} lanterns, ${lit} of them still glowing`, body);
  }

  /* two joining groups: `a` then `b`, with a plus between them */
  function join(a, b, opts) {
    opts = opts || {};
    const W = 520, H = 200, kind = opts.kind || 'leaf';
    let body = card(W, H, opts.fill || '#f2fbef');
    [[a, 24, opts.colorA || C3, 'first group'], [b, 292, opts.colorB || BRAND, 'then this group']].forEach(([n, ox, col, name]) => {
      body += `<rect x="${ox}" y="24" width="204" height="120" rx="14" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
      for (let i = 0; i < n; i++) {
        const x = ox + 26 + (i % 4) * 44, y = 54 + Math.floor(i / 4) * 42;
        body += kind === 'shell' ? shell(x, y, col, 1) : leaf(x, y, col, 1);
      }
      body += label(name, ox + 102, 172, 13, INK);
    });
    body += label('+', 260, 100, 36, '#8a97ad');
    return wrap(W, H, `${a} objects and ${b} more objects`, body);
  }

  /* coral tiles: a repeating unit, then a dashed slot for "what comes next" */
  function tiles(seq, opts) {
    opts = opts || {};
    const W = 560, H = 200, n = seq.length, slots = n + (opts.next === false ? 0 : 1);
    const step = Math.min(88, (W - 60) / slots), size = step * 0.78;
    const x0 = (W - slots * step) / 2 + step / 2, y = H / 2 - size / 2 + 6;
    const cols = { A: '#e66f61', B: '#428caa', C: '#e0a93f' };
    let body = card(W, H, opts.fill || '#eefaf8');
    seq.forEach((k, i) => {
      const x = x0 + i * step;
      body += `<rect x="${x - size / 2}" y="${y}" width="${size}" height="${size}" rx="18" fill="${cols[k] || cols.A}" stroke="${INK}" stroke-width="2.5"/>${label(k, x, y + size / 2 + 8, size * 0.46, '#fff')}`;
    });
    if (opts.next !== false) {
      const x = x0 + n * step;
      body += `<rect x="${x - size / 2}" y="${y}" width="${size}" height="${size}" rx="18" fill="#fff" stroke="${INK}" stroke-width="3" stroke-dasharray="8 6"/>${label('?', x, y + size / 2 + 9, size * 0.5, INK)}`;
    }
    return wrap(W, H, opts.label || 'a repeating tile pattern with one empty slot', body);
  }

  /* four flat shapes, lettered A–D, so a choice can answer with a letter */
  function shapes(opts) {
    opts = opts || {};
    const names = ['triangle', 'square', 'rectangle', 'circle'], cols = ['#e0693f', '#7656b8', '#2a8b91', '#4d8f5c'];
    const order = opts.order || names, rot = opts.rot || 0;
    const W = 520, H = 190, cell = 118;
    let body = card(W, H, opts.fill || '#f7f1fb');
    order.forEach((nm, i) => {
      const cx = 68 + i * 128, cy = 88, r = 33;
      body += `<rect x="${cx - 52}" y="26" width="104" height="112" rx="12" fill="#fff" stroke="#d9cfe8" stroke-width="2"/>`;
      const tf = `transform="rotate(${rot + (opts.spin || 0) * i} ${cx} ${cy})"`;
      if (nm === 'triangle') body += `<polygon points="${cx},${cy - r} ${cx - r},${cy + r * 0.78} ${cx + r},${cy + r * 0.78}" fill="${cols[i % 4]}" ${tf}/>`;
      else if (nm === 'square') body += `<rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="${cols[i % 4]}" ${tf}/>`;
      else if (nm === 'rectangle') body += `<rect x="${cx - r * 1.25}" y="${cy - r * 0.72}" width="${2.5 * r}" height="${1.44 * r}" fill="${cols[i % 4]}" ${tf}/>`;
      else body += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${cols[i % 4]}" ${tf}/>`;
      body += label('ABCD'[i], cx, 168, 15, INK);
    });
    return wrap(W, H, opts.label || 'four flat shapes labelled A B C D', body);
  }

  /* a shell measured with same-sized blocks that touch */
  /* a shell and the same-sized blocks that cover it: blocks stay under the shell, edge to edge */
  function blocks(n, opts) {
    opts = opts || {};
    const W = 520, H = 200, units = Math.max(2, Math.min(10, n)), unit = Math.min(58, 430 / units);
    const start = (W - units * unit) / 2, end = start + units * unit, mid = W / 2, hgt = 58;
    let body = card(W, H, opts.fill || '#effaf9');
    /* fan-shaped pearl shell: a dome with ribs, its span exactly on the blocks below it */
    body += `<path d="M${start} 84a${units * unit / 2} ${hgt} 0 0 1 ${units * unit} 0Z" fill="#f6d7b0" stroke="${INK}" stroke-width="2.5"/>`;
    for (let i = 1; i < 6; i++) {
      const a = Math.PI - (i * Math.PI) / 6;
      body += `<line x1="${mid}" y1="84" x2="${mid + Math.cos(a) * (units * unit / 2)}" y2="${84 - Math.sin(a) * hgt}" stroke="#c99a63" stroke-width="2"/>`;
    }
    for (let i = 0; i < units; i++) {
      /* no numbers on the blocks: the child counts them, the picture must not do it for them */
      body += `<rect x="${start + i * unit + 1.5}" y="90" width="${unit - 3}" height="34" rx="6" fill="${i % 2 ? BRAND : '#0b5f66'}" stroke="#fff" stroke-width="1.5"/>`;
    }
    body += label(opts.caption || 'equal blocks, touching, no gaps', W / 2, 160, 15, '#6b5a3a');
    return wrap(W, H, `${units} equal blocks cover the shell`, body);
  }

  /* two measured shells, for "how many blocks longer" */
  function blocksCompare(nA, nB) {
    const W = 520, H = 240, unit = 40, x = 128;
    let body = card(W, H, '#effaf9');
    [[nA, 46, 'Shell A'], [nB, 140, 'Shell B']].forEach(([n, y, name]) => {
      const span = n * unit, mid = x + span / 2;
      body += `<path d="M${x} ${y + 16}a${span / 2} 34 0 0 1 ${span} 0Z" fill="#f6d7b0" stroke="${INK}" stroke-width="2.5"/>`;
      for (let i = 1; i < 4; i++) {
        const a = Math.PI - (i * Math.PI) / 4;
        body += `<line x1="${mid}" y1="${y + 16}" x2="${mid + Math.cos(a) * (span / 2)}" y2="${y + 16 - Math.sin(a) * 34}" stroke="#c99a63" stroke-width="2"/>`;
      }
      for (let i = 0; i < n; i++) body += `<rect x="${x + i * unit + 1.5}" y="${y + 22}" width="${unit - 3}" height="30" rx="6" fill="${i % 2 ? BRAND : '#0b5f66'}"/>`;
      body += label(name, 54, y + 44, 16, INK);
    });
    body += label('equal blocks, edge to edge', W / 2, H - 12, 14, '#6b5a3a');
    return wrap(W, H, 'two shells measured with equal blocks, A first then B', body);
  }

  /* an analogue clock face; hour hand respects half past */
  function clock(hour, half, size) {
    const W = size || 220, c = W / 2, R = c - 12, k = W / 220;
    const pt = (deg, len) => [c + Math.cos(((deg - 90) * Math.PI) / 180) * len, c + Math.sin(((deg - 90) * Math.PI) / 180) * len];
    let body = `<circle cx="${c}" cy="${c}" r="${R}" fill="#fffdf6" stroke="${INK}" stroke-width="${6 * k}"/>`;
    for (let i = 1; i <= 12; i++) { const [x, y] = pt(i * 30, R * 0.78); body += label(i, x, y + 5 * k, 19 * k, '#3b2814'); }
    const [mx, my] = pt(half ? 180 : 0, R * 0.72), [hx, hy] = pt((hour % 12) * 30 + (half ? 15 : 0), R * 0.46);
    body += `<line x1="${c}" y1="${c}" x2="${mx}" y2="${my}" stroke="${BRAND}" stroke-width="${5.5 * k}" stroke-linecap="round"/>`;
    body += `<line x1="${c}" y1="${c}" x2="${hx}" y2="${hy}" stroke="#d26542" stroke-width="${8.5 * k}" stroke-linecap="round"/>`;
    body += `<circle cx="${c}" cy="${c}" r="${6.5 * k}" fill="${INK}"/>`;
    return wrap(W, W, `clock showing ${hour} ${half ? 'thirty' : "o'clock"}`, body, W);
  }

  /* four lettered clocks for a matching round */
  function clockRow(times, ask) {
    const W = 560, H = 230;
    let body = card(W, H, '#fffaf0');
    times.forEach((t, i) => {
      const x = 14 + i * 136;
      body += `<g transform="translate(${x},18)">${clock(t[0], t[1], 128).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>`;
      body += label('ABCD'[i], x + 64, 214, 15, INK);
    });
    return wrap(W, H, ask || 'four clocks labelled A B C D', body);
  }

  /* a picture graph where each circle is one vote */
  function graph(vals, opts) {
    opts = opts || {};
    const names = opts.names || ['Dates', 'Figs', 'Oranges'], cols = ['#c87839', '#4d8f7d', '#8a5fa8'];
    const W = 520, H = 250, base = 196, maxV = Math.max(4, ...vals);
    let body = card(W, H, '#fff6e8');
    body += label('each circle = 1 vote', 400, 28, 14, '#6b5a3a');
    body += `<line x1="40" y1="${base}" x2="482" y2="${base}" stroke="#b9a888" stroke-width="3" stroke-linecap="round"/>`;
    vals.forEach((v, i) => {
      const cx = 122 + i * 148;
      /* faint rungs, so children can match circles across the columns instead of guessing */
      for (let r = 1; r < maxV; r++) body += `<line x1="58" y1="${base - r * 32}" x2="466" y2="${base - r * 32}" stroke="#e6d8c4" stroke-width="1.5" stroke-dasharray="4 6"/>`;
      for (let j = 0; j < v; j++) body += `<circle cx="${cx}" cy="${base - 15 - j * 32}" r="13" fill="${cols[i]}"/>`;
      body += label(names[i], cx, base + 30, 16, INK);
    });
    return wrap(W, H, `picture graph: ${names.map((n, i) => `${n} ${vals[i]}`).join(', ')}`, body);
  }

  /* a lettered group for options: the picture fills the tile, the caption is a letter only */
  function group(n, opts) {
    opts = opts || {};
    const kind = opts.kind || 'dot', W = 240, H = 190;
    const cols = n > 10 ? 5 : (n > 6 ? 4 : 3), rows = Math.ceil(n / cols) || 1;
    const pad = 22, top = 20, boxTop = 8, boxH = H - 58;
    const cellW = (W - pad * 2) / cols, cellH = (boxH - top) / rows;
    const k = Math.min(1.25, Math.min(cellW / 36, cellH / 36));
    let body = `<rect x="4" y="${boxTop}" width="${W - 8}" height="${boxH}" rx="18" fill="${opts.fill || '#fff'}" stroke="#c9d6dd" stroke-width="3"/>`;
    for (let i = 0; i < n; i++) {
      const x = pad + cellW * ((i % cols) + .5), y = boxTop + top / 2 + cellH * (Math.floor(i / cols) + .5);
      body += kind === 'fish' ? fish(x, y, opts.color || BRAND, k)
        : kind === 'shell' ? shell(x, y - 2, opts.color || '#c87839', k)
        : kind === 'leaf' ? leaf(x, y, opts.color || '#3f8f57', k)
        : kind === 'pearl' ? pearl(x, y, opts.color || '#a9577a', 9 * k)
        : `<circle cx="${x}" cy="${y}" r="${10 * k}" fill="${opts.color || BRAND}"/>`;
    }
    /* the caption is a letter, never the count — otherwise the option gives the answer away */
    if (opts.label != null) body += `<text x="${W / 2}" y="${H - 12}" text-anchor="middle" font-size="26" font-weight="800" fill="#55647a">${opts.label}</text>`;
    return wrap(W, H, `${n} ${kind === 'dot' ? 'objects' : kind + 's'} in a group${opts.label != null ? ', choice ' + opts.label : ''}`, body, opts.max || W);
  }
  const nextTiles = (unit, count) => Array.from({ length: count }, (_, i) => unit[i % unit.length]);
  return { tenFrame, group, trays, lanterns, join, tiles, shapes, blocks, blocksCompare, clock, clockRow, graph, nextTiles, label };
})();

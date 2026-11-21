/* Small game-side helpers shared by the Grade 1 lesson games. No engine code lives here. */
const G1 = {
  /* put a picture above a question, with an optional caption, without ever inventing a total */
  art(svg, caption) {
    return `<div style="display:grid;gap:6px;margin-bottom:6px">${svg}${caption ? `<p style="margin:0;text-align:center;font-size:15px;font-weight:700;color:#6b5a3a">${caption}</p>` : ''}</p></div>`;
  },
  /* 3 hints, strategy → step → near answer. The answer itself is never one of them. */
  hints: (a, b, c) => (c ? [a, b, c] : [a, b]),
  /* a distinct multiple-choice list that always contains the key */
  opts(answer, pool, n) {
    const out = [String(answer)];
    pool.forEach((v) => { const s = String(v); if (!out.includes(s) && out.length < (n || 4)) out.push(s); });
    return out;
  },
  /* pick a distractor set that is genuinely plausible for the skill */
  near(answer, deltas) { return deltas.map((d) => answer + d).filter((v) => v >= 0); },
  sayNum: (n, one, many) => `${n} ${n === 1 ? one : many}`,
};

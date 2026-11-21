/* ===========================================================
   MathsLab — number sense + trigonometry
   =========================================================== */
(function () {
  "use strict";
  const ML = window.ML, U = ML.u;
  const SVGNS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs, text) {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text !== undefined) n.textContent = text;
    return n;
  }
  /** wire a canvas so it stays sharp */
  function fitCanvas(cv) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const r = cv.getBoundingClientRect();
    const w = Math.max(300, Math.round(r.width)), h = Math.max(220, Math.round(r.height || 400));
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  /* =========================================================
     ALGEBRA — expand / factorise with a visual model
     ========================================================= */
  function expand(a, b, c, d) {
    // (ax + b)(cx + d) = ac x² + (ad+bc)x + bd
    return { x2: a * c, x: a * d + b * c, k: b * d };
  }
  function factorise(x2, x, k) {
    if (x2 !== 1) {
      // try simple integer factor pairs of x2
      for (let a = 1; a <= Math.abs(x2); a++) {
        if (x2 % a) continue;
        const c = x2 / a;
        for (let b = -12; b <= 12; b++) {
          if (!b) continue;
          if (k % b) continue;
          const d = k / b;
          if (a * d + b * c === x) return [a, b, c, d];
        }
      }
      return null;
    }
    for (let b = -12; b <= 12; b++) {
      if (!b || k % b) continue;
      const d = k / b;
      if (b + d === x) return [1, b, 1, d];
    }
    return null;
  }
  const fmtPoly = (x2, x, k) => {
    let s = `${x2 === 1 ? "" : x2 === -1 ? "−" : x2}x²`;
    if (x) s += (x > 0 ? " + " : " − ") + (Math.abs(x) === 1 ? "" : Math.abs(x)) + "x";
    if (k) s += (k > 0 ? " + " : " − ") + Math.abs(k);
    return s;
  };

  ML.register({
    id: "algebra", group: "numbers", title: "Algebra — Expand & Factorise",
    short: "Algebra", icon: ML.icon('shapes'), color: ["#eeecff", "#4b3ee0"], tag: "Algebra",
    blurb: "Drag-free expansion practice: see the rectangle model behind (x + a)(x + b), then reverse it by factorising quadratics.",
    tags: ["Algebra.exe", "factorising quadratics.exe", "(x+a)(x+b)", "area model"],
    mount(root) {
      const st = { mode: "expand", a: 2, b: 3, c: 1, d: 4, score: 0, tries: 0 };
      const wrap = U.el("div", { class: "app-layout" });
      wrap.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Mode</div>
            <div class="panel-b tight">
              <div class="seg" id="algSeg"><button data-m="expand" class="on">Expand</button><button data-m="factor" >Factorise</button></div>
              <div class="row2">
                <div class="stat"><span>Correct</span><b id="sc">0</b></div>
                <div class="stat"><span>Tries</span><b id="at">0</b></div>
              </div>
              <button class="btn ghost sm" id="newQ">${ML.icon("shuffle")} New question</button>
              <div class="note">Expanding builds a rectangle: the four regions are the product of each pair of terms.</div>
            </div>
          </div>
        </aside>
        <div class="stage">
          <div class="card pad" style="margin-bottom:16px" id="qCard"></div>
          <div class="card" style="overflow:hidden">
            <div class="card-h"><h2>Rectangle model</h2><span class="small muted" id="modelNote"></span></div>
            <div class="card-b"><div id="model"></div></div>
          </div>
        </div>`;
      root.appendChild(wrap);

      function newQ() {
        if (st.mode === "expand") {
          st.a = U.randInt(1, 3); st.b = U.randInt(-6, 6) || 2; st.c = U.randInt(1, 2); st.d = U.randInt(-6, 6) || 3;
        } else {
          const a = U.pick([1, 1, 1, 2]), b = U.randInt(-8, 8) || 2, c = U.pick([1, 1, 1, 2]), d = U.randInt(-8, 8) || 3;
          const e = expand(a, b, c, d);
          st.q = e;
        }
        drawQ();
      }

      function drawQ() {
        const q = wrap.querySelector("#qCard");
        if (st.mode === "expand") {
          q.innerHTML = `
            <div class="eyebrow">Expand</div>
            <div class="mono" style="font-size:clamp(24px,4vw,38px);font-weight:850;letter-spacing:-.02em;margin:6px 0 14px">(${st.a === 1 ? "" : st.a}x ${st.b < 0 ? "−" : "+"} ${Math.abs(st.b)})(${st.c === 1 ? "" : st.c}x ${st.d < 0 ? "−" : "+"} ${Math.abs(st.d)})</div>
            <div class="row3" style="max-width:520px">
              <div class="field"><label>x² coefficient</label><input id="ix2" type="number" placeholder="?" style="font-size:18px;font-weight:800;text-align:center"></div>
              <div class="field"><label>x coefficient</label><input id="ix" type="number" placeholder="?" style="font-size:18px;font-weight:800;text-align:center"></div>
              <div class="field"><label>constant</label><input id="ik" type="number" placeholder="?" style="font-size:18px;font-weight:800;text-align:center"></div>
            </div>
            <div class="btn-row" style="margin-top:14px"><button class="btn" id="chk">Check</button><button class="btn ghost" id="reveal">Show answer</button></div>
            <div id="msg" class="small" style="min-height:22px;margin-top:10px;font-weight:700"></div>`;
          q.querySelector("#chk").addEventListener("click", checkExpand);
          q.querySelector("#reveal").addEventListener("click", () => {
            const e = expand(st.a, st.b, st.c, st.d);
            q.querySelector("#ix2").value = e.x2; q.querySelector("#ix").value = e.x; q.querySelector("#ik").value = e.k;
            q.querySelector("#msg").style.color = "var(--brand-ink)";
            q.querySelector("#msg").textContent = `Expanded: ${fmtPoly(e.x2, e.x, e.k)}`;
          });
          drawModel(st.a, st.b, st.c, st.d);
        } else {
          const e = st.q;
          q.innerHTML = `
            <div class="eyebrow">Factorise fully</div>
            <div class="mono" style="font-size:clamp(24px,4vw,38px);font-weight:850;letter-spacing:-.02em;margin:6px 0 14px">${fmtPoly(e.x2, e.x, e.k)}</div>
            <div class="row2" style="max-width:440px">
              <div class="field"><label>First bracket</label><input id="b1" type="text" placeholder="(x + ?)" spellcheck="false" style="font-family:var(--fm)"></div>
              <div class="field"><label>Second bracket</label><input id="b2" type="text" placeholder="(x + ?)" spellcheck="false" style="font-family:var(--fm)"></div>
            </div>
            <div class="btn-row" style="margin-top:14px"><button class="btn" id="chk">Check</button><button class="btn ghost" id="reveal">Show answer</button></div>
            <div id="msg" class="small" style="min-height:22px;margin-top:10px;font-weight:700"></div>`;
          q.querySelector("#chk").addEventListener("click", checkFactor);
          q.querySelector("#reveal").addEventListener("click", () => {
            const f = factorise(e.x2, e.x, e.k);
            if (!f) return;
            const t = `(${f[0] === 1 ? "" : f[0]}x ${f[1] < 0 ? "−" : "+"} ${Math.abs(f[1])})(${f[2] === 1 ? "" : f[2]}x ${f[3] < 0 ? "−" : "+"} ${Math.abs(f[3])})`;
            q.querySelector("#b1").value = `(${f[0] === 1 ? "" : f[0]}x ${f[1] < 0 ? "−" : "+"} ${Math.abs(f[1])})`;
            q.querySelector("#b2").value = `(${f[2] === 1 ? "" : f[2]}x ${f[3] < 0 ? "−" : "+"} ${Math.abs(f[3])})`;
            q.querySelector("#msg").style.color = "var(--brand-ink)";
            q.querySelector("#msg").textContent = `Factorised: ${t}`;
            drawModel(f[0], f[1], f[2], f[3]);
          });
          /* draw the model from the expanded form once factored */
          drawModel(null, null, null, null, e);
        }
      }

      function drawModel(a, b, c, d, poly) {
        const host = wrap.querySelector("#model");
        host.innerHTML = "";
        let A, B, C, D;
        if (poly) {
          const f = factorise(poly.x2, poly.x, poly.k);
          if (!f) { host.innerHTML = `<p class="muted small">This one doesn't factorise neatly into whole numbers — try the reveal button after guessing.</p>`; return; }
          [A, B, C, D] = f;
          wrap.querySelector("#modelNote").textContent = `(${A}x ${B < 0 ? "−" : "+"} ${Math.abs(B)})(${C}x ${D < 0 ? "−" : "+"} ${Math.abs(D)})`;
        } else {
          A = a; B = b; C = c; D = d;
          wrap.querySelector("#modelNote").textContent = "each cell = row term × column term";
        }
        const W = 460, H = 340, pad = 54;
        const w1 = Math.max(60, 70 + Math.abs(A) * 40), h1 = Math.max(60, 70 + Math.abs(B) * 40);
        const w2 = Math.max(60, 70 + Math.abs(C) * 40), h2 = Math.max(60, 70 + Math.abs(D) * 40);
        const totalW = Math.min(w1, w2) + pad, totalH = Math.min(h1, h2) + pad;
        const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, style: "display:block;width:100%;max-width:560px;margin:0 auto" });
        const ox = 90, oy = 80;
        const C1 = "#eeecff", C2 = "#e0f7f5", C3 = "#fdeaf4", C4 = "#fff6dd";
        const cells = [
          { x: ox, y: oy, w: 170, h: 120, fill: C1, top: A === 1 ? "x" : A + "x", side: C === 1 ? "x" : C + "x", prod: `${A * C}x²` },
          { x: ox + 170, y: oy, w: 120, h: 120, fill: C2, top: D > 0 ? D : D, side: C === 1 ? "x" : C + "x", prod: `${A * D}x` },
          { x: ox, y: oy + 120, w: 170, h: 90, fill: C3, top: A === 1 ? "x" : A + "x", side: B, prod: `${B * C}x` },
          { x: ox + 170, y: oy + 120, w: 120, h: 90, fill: C4, top: D, side: B, prod: `${B * D}` },
        ];
        cells.forEach((c) => {
          svg.appendChild(svgEl("rect", { x: c.x, y: c.y, width: c.w, height: c.h, fill: c.fill, stroke: "#c6c9d8", "stroke-width": 1.5, rx: 8 }));
          svg.appendChild(svgEl("text", { x: c.x + c.w / 2, y: c.y + c.h / 2 + 6, "text-anchor": "middle", "font-size": 22, "font-weight": 800, fill: "#2b2f3a", "font-family": "ui-monospace,monospace" }, c.prod));
        });
        /* labels */
        svg.appendChild(svgEl("text", { x: ox + 85, y: oy - 16, "text-anchor": "middle", "font-size": 18, "font-weight": 800, fill: "#4b3ee0" }, (A === 1 ? "" : A) + "x"));
        svg.appendChild(svgEl("text", { x: ox + 230, y: oy - 16, "text-anchor": "middle", "font-size": 18, "font-weight": 800, fill: "#4b3ee0" }, String(D)));
        svg.appendChild(svgEl("text", { x: ox - 22, y: oy + 60, "text-anchor": "middle", "font-size": 18, "font-weight": 800, fill: "#0b7a73" }, (C === 1 ? "" : C) + "x"));
        svg.appendChild(svgEl("text", { x: ox - 22, y: oy + 165, "text-anchor": "middle", "font-size": 18, "font-weight": 800, fill: "#0b7a73" }, String(B)));
        host.appendChild(svg);
      }

      function bump(ok) {
        st.tries++;
        wrap.querySelector("#at").textContent = st.tries;
        if (ok) { st.score++; wrap.querySelector("#sc").textContent = st.score; ML.record(true); }
        else ML.record(false);
      }
      function checkExpand() {
        const e = expand(st.a, st.b, st.c, st.d);
        const q = wrap.querySelector("#qCard");
        const g = (id) => { const v = q.querySelector(id).value.trim(); return v === "" ? NaN : +v; };
        const ok = g("#ix2") === e.x2 && g("#ix") === e.x && g("#ik") === e.k;
        bump(ok);
        const msg = q.querySelector("#msg");
        if (ok) { U.sound.win(); msg.style.color = "var(--green)"; msg.textContent = `Correct — ${fmtPoly(e.x2, e.x, e.k)}.`; setTimeout(newQ, 1400); }
        else { U.sound.no(); msg.style.color = "var(--red)"; msg.textContent = "Not yet — check the middle term (outer × outer + inner × inner)."; }
      }
      function parseBracket(str) {
        const s = String(str).replace(/\s+/g, "").replace(/−/g, "-").replace(/X/g, "x");
        const m = s.match(/^\(?(-?\d*)?x([+-]\d+)?\)?$/);
        if (!m) return null;
        const a = m[1] === "" || m[1] === "+" ? 1 : m[1] === "-" ? -1 : parseInt(m[1], 10);
        const b = m[2] ? parseInt(m[2].replace("+", ""), 10) : 0;
        return [a, b];
      }
      function checkFactor() {
        const q = wrap.querySelector("#qCard");
        const e = st.q;
        const p1 = parseBracket(q.querySelector("#b1").value), p2 = parseBracket(q.querySelector("#b2").value);
        const msg = q.querySelector("#msg");
        if (!p1 || !p2) { msg.style.color = "var(--red)"; msg.textContent = "Write brackets like (x + 3) or (2x − 1)."; return; }
        const out = expand(p1[0], p1[1], p2[0], p2[1]);
        const ok = out.x2 === e.x2 && out.x === e.x && out.k === e.k;
        bump(ok);
        if (ok) { U.sound.win(); msg.style.color = "var(--green)"; msg.textContent = "Correct factorisation!"; drawModel(p1[0], p1[1], p2[0], p2[1]); setTimeout(newQ, 1600); }
        else { U.sound.no(); msg.style.color = "var(--red)"; msg.textContent = `Your brackets multiply to ${fmtPoly(out.x2, out.x, out.k)}.`; }
      }

      wrap.querySelector("#algSeg").addEventListener("click", (e) => {
        const b = e.target.closest("button[data-m]"); if (!b) return;
        st.mode = b.dataset.m;
        U.$$("#algSeg button", wrap).forEach((x) => x.classList.toggle("on", x === b));
        newQ();
      });
      wrap.querySelector("#newQ").addEventListener("click", newQ);
      newQ();
    },
  });

  /* =========================================================
     SEQUENCES — nth term + next terms
     ========================================================= */
  ML.register({
    id: "sequences", group: "numbers", title: "Sequences",
    short: "Sequences", icon: ML.icon('list'), color: ["#e8f1ff", "#1a58b8"], tag: "Algebra",
    blurb: "Find the rule behind a sequence, work out the next terms and write the nth term — linear, quadratic and special sequences.",
    tags: ["sequences.exe", "nth term", "pattern", "quadratic"],
    mount(root) {
      const st = { kind: "linear", seq: [], rule: null, score: 0, tries: 0, showHint: false };
      const KINDS = [
        { id: "linear", label: "Linear (+/−)" },
        { id: "mul", label: "Multiples" },
        { id: "quad", label: "Quadratic" },
        { id: "fib", label: "Special" },
      ];
      const wrap = U.el("div", { class: "app-layout" });
      wrap.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Sequence type</div>
            <div class="panel-b tight" id="kinds"></div>
          </div>
          <div class="panel">
            <div class="panel-h">Progress</div>
            <div class="panel-b tight">
              <div class="row2">
                <div class="stat"><span>Correct</span><b id="sc">0</b></div>
                <div class="stat"><span>Tries</span><b id="at">0</b></div>
              </div>
              <button class="btn ghost sm" id="newQ">${ML.icon("shuffle")} New sequence</button>
              <label class="check"><input type="checkbox" id="hintChk"> Show difference hints</label>
            </div>
          </div>
        </aside>
        <div class="stage">
          <div class="card pad" id="qCard"></div>
          <div class="card" style="margin-top:16px;overflow:hidden">
            <div class="card-h"><h2>How the pattern grows</h2><span class="small muted" id="diffNote"></span></div>
            <div class="card-b"><div id="diffTable"></div></div>
          </div>
        </div>`;
      root.appendChild(wrap);
      const kinds = wrap.querySelector("#kinds");
      KINDS.forEach((k) => {
        const b = U.el("button", { class: "btn sm " + (st.kind === k.id ? "soft" : "ghost"), style: { justifyContent: "flex-start" } }, k.label);
        b.dataset.k = k.id;
        b.addEventListener("click", () => { st.kind = k.id; U.$$("#kinds button", wrap).forEach((x) => x.classList.toggle("on", x === b)); U.$$("#kinds button", wrap).forEach((x) => x.className = "btn sm " + (x.dataset.k === st.kind ? "soft" : "ghost")); newQ(); });
        kinds.appendChild(b);
      });

      function newQ() {
        st.showHint = wrap.querySelector("#hintChk").checked;
        if (st.kind === "linear") {
          const a = U.randInt(2, 9) * (Math.random() < 0.25 ? -1 : 1), b = U.randInt(-9, 15);
          st.rule = { type: "linear", a, b };
          st.seq = U.range(1, 6).map((n) => a * n + b);
        } else if (st.kind === "mul") {
          const a = U.randInt(2, 9), r = U.pick([2, 3, 4]);
          st.rule = { type: "mul", a, r };
          st.seq = U.range(0, 6).map((n) => a * Math.pow(r, n));
        } else if (st.kind === "quad") {
          const a = U.randInt(1, 3), b = U.randInt(-5, 5), c = U.randInt(-6, 10);
          st.rule = { type: "quad", a, b, c };
          st.seq = U.range(1, 6).map((n) => a * n * n + b * n + c);
        } else {
          const kind = U.pick(["fib", "square", "tri", "cube"]);
          if (kind === "fib") { const s = [U.randInt(1, 4), U.randInt(2, 5)]; for (let i = 0; i < 4; i++) s.push(s[s.length - 1] + s[s.length - 2]); st.rule = { type: "fib" }; st.seq = s; }
          if (kind === "square") { st.rule = { type: "square" }; st.seq = U.range(1, 6).map((n) => n * n); }
          if (kind === "tri") { st.rule = { type: "tri" }; st.seq = U.range(1, 6).map((n) => (n * (n + 1)) / 2); }
          if (kind === "cube") { st.rule = { type: "cube" }; st.seq = U.range(1, 6).map((n) => n * n * n); }
        }
        draw();
      }

      function nthTerm(r) {
        if (r.type === "linear") return `${r.a}n${r.b === 0 ? "" : r.b > 0 ? " + " + r.b : " − " + Math.abs(r.b)}`;
        if (r.type === "mul") return `${r.a} × ${r.r}ⁿ⁻¹`;
        if (r.type === "quad") {
          let s = `${r.a === 1 ? "" : r.a}n²`;
          if (r.b) s += r.b > 0 ? ` + ${r.b}n` : ` − ${Math.abs(r.b)}n`;
          if (r.c) s += r.c > 0 ? ` + ${r.c}` : ` − ${Math.abs(r.c)}`;
          return s;
        }
        if (r.type === "square") return "n²";
        if (r.type === "tri") return "n(n + 1)/2";
        if (r.type === "cube") return "n³";
        return "add the previous two terms";
      }

      function draw() {
        const q = wrap.querySelector("#qCard");
        const shown = st.seq.slice(0, 5);
        q.innerHTML = `
          <div class="eyebrow">What comes next?</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 18px">
            ${shown.map((v, i) => `<div class="pop" style="min-width:74px;padding:14px 10px;text-align:center;background:var(--surface-2);border:1px solid var(--line);border-radius:14px">
              <div class="mono" style="font-size:24px;font-weight:850">${v}</div><div class="small muted">term ${i + 1}</div></div>`).join("")}
            <div style="display:flex;align-items:center;font-size:26px;color:var(--muted)">…</div>
            <div style="min-width:74px;padding:8px;text-align:center;background:var(--brand-soft);border:2px dashed #c9c2ff;border-radius:14px;display:grid;place-items:center">
              <input id="t6" type="number" placeholder="?" aria-label="Next term" style="border:0;background:transparent;text-align:center;font-size:23px;font-weight:850;padding:6px;font-family:var(--fm)">
            </div>
          </div>
          <div class="field" style="max-width:420px"><label>nth term rule (optional)</label>
            <input id="nth" type="text" placeholder="e.g. 3n + 2" spellcheck="false" style="font-family:var(--fm)">
          </div>
          <div class="btn-row" style="margin-top:14px"><button class="btn" id="chk">Check</button><button class="btn ghost" id="reveal">Show rule</button></div>
          <div id="msg" class="small" style="min-height:22px;margin-top:10px;font-weight:700"></div>`;
        q.querySelector("#chk").addEventListener("click", check);
        q.querySelector("#reveal").addEventListener("click", () => {
          q.querySelector("#nth").value = nthTerm(st.rule);
          q.querySelector("#t6").value = nextTerm();
          q.querySelector("#msg").style.color = "var(--brand-ink)";
          q.querySelector("#msg").textContent = `Next term is ${nextTerm()} · rule: ${nthTerm(st.rule)}`;
        });
        drawDiff();
      }
      function nextTerm() {
        const r = st.rule;
        if (r.type === "linear") return r.a * 6 + r.b;
        if (r.type === "mul") return r.a * Math.pow(r.r, 6);
        if (r.type === "quad") return r.a * 36 + r.b * 6 + r.c;
        if (r.type === "fib") return st.seq[st.seq.length - 1] + st.seq[st.seq.length - 2];
        return st.seq[st.seq.length - 1] + (st.seq[st.seq.length - 1] - st.seq[st.seq.length - 2]);
      }
      function drawDiff() {
        const host = wrap.querySelector("#diffTable");
        const d1 = st.seq.slice(1).map((v, i) => v - st.seq[i]);
        const d2 = d1.slice(1).map((v, i) => v - d1[i]);
        const show = wrap.querySelector("#hintChk").checked;
        wrap.querySelector("#diffNote").textContent = show ? "" : "tick “difference hints” to reveal";
        host.innerHTML = `<div class="scroll-x"><table class="data">
          <tr><th>term</th>${st.seq.map((_, i) => `<td class="mono">${st.seq[i]}</td>`).join("")}<td>…</td></tr>
          ${show ? `<tr><th>1st diff</th>${st.seq.map((_, i) => `<td class="mono">${i < st.seq.length - 1 ? (d1[i] > 0 ? "+" : "") + d1[i] : ""}</td>`).join("")}<td></td></tr>
          <tr><th>2nd diff</th>${st.seq.map((_, i) => `<td class="mono">${i < d2.length ? (d2[i] > 0 ? "+" : "") + d2[i] : ""}</td>`).join("")}<td></td></tr>` : ""}
        </table></div>`;
      }
      function check() {
        const q = wrap.querySelector("#qCard");
        st.tries++; wrap.querySelector("#at").textContent = st.tries;
        const want = nextTerm();
        const got = parseInt(q.querySelector("#t6").value, 10);
        const msg = q.querySelector("#msg");
        if (got === want) {
          st.score++; wrap.querySelector("#sc").textContent = st.score; ML.record(true); U.sound.win();
          msg.style.color = "var(--green)";
          msg.textContent = `Correct — ${want}. Rule: ${nthTerm(st.rule)}`;
          q.querySelector("#nth").value = nthTerm(st.rule);
          setTimeout(newQ, 1600);
        } else {
          ML.record(false); U.sound.no();
          msg.style.color = "var(--red)";
          msg.textContent = "Not this time — look at the differences in the table below.";
        }
      }
      wrap.querySelector("#newQ").addEventListener("click", newQ);
      wrap.querySelector("#hintChk").addEventListener("change", drawDiff);
      newQ();
    },
  });

  /* =========================================================
     WHAT'S MY ANGLE  (Whats My Angle.exe + trignometry.exe)
     ========================================================= */
  const RAD = Math.PI / 180;
  const trig = (fn, deg) => {
    if (fn === "sin") return Math.sin(deg * RAD);
    if (fn === "cos") return Math.cos(deg * RAD);
    return Math.tan(deg * RAD);
  };
  function angleFor(fn, ratio) {
    if (fn === "sin") return Math.asin(ratio) / RAD;
    if (fn === "cos") return Math.acos(ratio) / RAD;
    return Math.atan(ratio) / RAD;
  }

  ML.register({
    id: "angles", group: "numbers", title: "What's My Angle?",
    short: "Angles", icon: ML.icon('angle'), color: ["#fdeaf4", "#a81a6b"], tag: "Trigonometry",
    blurb: "Explore sin, cos and tan on a live right-angled triangle, then work out missing angles and sides yourself.",
    tags: ["Whats My Angle.exe", "trignometry.exe", "SOHCAHTOA", "right triangles"],
    mount(root) {
      const st = { angle: 35, opp: null, adj: null, hyp: null, mode: "explore", q: null, score: 0, tries: 0 };
      const wrap = U.el("div", { class: "app-layout" });
      wrap.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Mode</div>
            <div class="panel-b tight">
              <div class="seg" id="mSeg"><button data-m="explore" class="on">Explore</button><button data-m="find">Find it</button></div>
              <div id="exploreCtl">
                <div class="field"><label>Angle <span class="val" id="angV">35°</span></label><input type="range" id="angR" min="5" max="85" value="35"></div>
                <div class="field"><label>Hypotenuse <span class="val" id="hypV">10</span></label><input type="range" id="hypR" min="3" max="20" value="10"></div>
              </div>
              <div id="findCtl" style="display:none">
                <div class="row2">
                  <div class="stat"><span>Correct</span><b id="sc">0</b></div>
                  <div class="stat"><span>Tries</span><b id="at">0</b></div>
                </div>
                <button class="btn ghost sm" id="newQ">${ML.icon("shuffle")} New triangle</button>
              </div>
              <div class="hr"></div>
              <div class="note" style="font-family:var(--fm);font-size:12px;line-height:1.8">
                sin θ = opp / hyp<br>cos θ = adj / hyp<br>tan θ = opp / adj
              </div>
            </div>
          </div>
        </aside>
        <div class="stage">
          <div class="card" style="overflow:hidden">
            <div class="panel-h"><span>Right-angled triangle</span><span class="small muted" id="status"></span></div>
            <div class="card-b"><div id="tri"></div></div>
          </div>
          <div class="card" style="margin-top:16px;overflow:hidden">
            <div class="card-h"><h2>Trig table</h2><button class="btn xs ghost" onclick="window.print()">Print</button></div>
            <div class="scroll-x"><table class="data" id="trigTbl"></table></div>
          </div>
        </div>`;
      root.appendChild(wrap);
      const angR = wrap.querySelector("#angR"), hypR = wrap.querySelector("#hypR");
      angR.addEventListener("input", () => { st.angle = +angR.value; wrap.querySelector("#angV").textContent = st.angle + "°"; draw(); });
      hypR.addEventListener("input", () => { st.hyp = +hypR.value; wrap.querySelector("#hypV").textContent = st.hyp; draw(); });
      wrap.querySelector("#mSeg").addEventListener("click", (e) => {
        const b = e.target.closest("button[data-m]"); if (!b) return;
        st.mode = b.dataset.m;
        U.$$("#mSeg button", wrap).forEach((x) => x.classList.toggle("on", x === b));
        wrap.querySelector("#exploreCtl").style.display = st.mode === "explore" ? "" : "none";
        wrap.querySelector("#findCtl").style.display = st.mode === "find" ? "" : "none";
        if (st.mode === "find") newQuestion(); else { st.q = null; draw(); }
      });
      wrap.querySelector("#newQ").addEventListener("click", newQuestion);

      function newQuestion() {
        const fn = U.pick(["sin", "cos", "tan"]);
        const angle = U.randInt(15, 75);
        const hyp = U.randInt(6, 20);
        const ratio = trig(fn, angle);
        st.q = { fn, angle, hyp, ratio, ask: Math.random() < 0.55 ? "angle" : "side" };
        st.angle = angle; st.hyp = hyp;
        angR.value = angle; hypR.value = hyp;
        wrap.querySelector("#angV").textContent = angle + "°";
        wrap.querySelector("#hypV").textContent = hyp;
        draw();
      }

      function draw() {
        st.hyp = st.hyp || 10;
        const ang = st.angle, hyp = st.hyp;
        const opp = hyp * Math.sin(ang * RAD), adj = hyp * Math.cos(ang * RAD);
        const host = wrap.querySelector("#tri");
        host.innerHTML = "";
        const W = 660, H = 400, mL = 100, mR = 190, mT = 60, mB = 76;
        const maxW = W - mL - mR, maxH = H - mT - mB;
        const scale = Math.min(maxW / adj, maxH / opp);
        const A = { x: mL, y: H - mB };                       // right angle at B, angle θ at A
        const B = { x: mL, y: H - mB - opp * scale };
        const C = { x: mL + adj * scale, y: H - mB };
        const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, style: "display:block;width:100%;height:auto", role: "img", "aria-label": "Right-angled triangle" });

        /* right-angle marker */
        svg.appendChild(svgEl("path", { d: `M ${B.x + 15} ${B.y} L ${B.x + 15} ${B.y + 15} L ${B.x} ${B.y + 15}`, fill: "none", stroke: "#98a2b3", "stroke-width": 1.6 }));
        /* angle arc at A */
        const arcR = Math.min(46, adj * scale * 0.55, opp * scale * 0.8);
        svg.appendChild(svgEl("path", {
          d: `M ${A.x + arcR} ${A.y} A ${arcR} ${arcR} 0 0 0 ${A.x + arcR * Math.cos(ang * RAD)} ${A.y - arcR * Math.sin(ang * RAD)}`,
          fill: "none", stroke: "#a81a6b", "stroke-width": 2.5
        }));
        const askingAngle = st.mode === "find" && st.q && st.q.ask === "angle";
        svg.appendChild(svgEl("text", { x: A.x + arcR + 14, y: A.y - 12, "font-size": 17, "font-weight": 800, fill: "#a81a6b", "font-family": "ui-monospace,monospace" }, askingAngle ? "?" : ang + "°"));
        /* triangle */
        svg.appendChild(svgEl("polygon", {
          points: `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`,
          fill: "rgba(124,107,255,.10)", stroke: "#4b3ee0", "stroke-width": 3, "stroke-linejoin": "round"
        }));

        const askingSide = st.mode === "find" && st.q && st.q.ask === "side";
        const oppTxt = askingSide ? "?" : U.fmt(opp, 2);
        /* opposite: left of the vertical side, value above the word */
        const midY = (A.y + B.y) / 2;
        svg.appendChild(svgEl("text", { x: B.x - 14, y: midY - 8, "text-anchor": "end", "font-size": 17, "font-weight": 800, fill: "#0b7a73", "font-family": "ui-monospace,monospace" }, oppTxt));
        svg.appendChild(svgEl("text", { x: B.x - 14, y: midY + 12, "text-anchor": "end", "font-size": 12.5, "font-weight": 700, fill: "#98a2b3" }, "opposite"));
        /* adjacent: below the base */
        svg.appendChild(svgEl("text", { x: (A.x + C.x) / 2, y: A.y + 26, "text-anchor": "middle", "font-size": 17, "font-weight": 800, fill: "#0b7a73", "font-family": "ui-monospace,monospace" }, U.fmt(adj, 2)));
        svg.appendChild(svgEl("text", { x: (A.x + C.x) / 2, y: A.y + 46, "text-anchor": "middle", "font-size": 12.5, "font-weight": 700, fill: "#98a2b3" }, "adjacent"));
        /* hypotenuse: offset outward from the midpoint of BC */
        const mx = (B.x + C.x) / 2, my = (B.y + C.y) / 2;
        const nx = -(C.y - B.y), ny = (C.x - B.x);   // outward normal of BC
        const nlen = Math.hypot(nx, ny) || 1;
        const off = 24;
        const hx = mx + (nx / nlen) * off, hy = my + (ny / nlen) * off;
        svg.appendChild(svgEl("text", { x: hx, y: hy - 2, "text-anchor": "middle", "font-size": 17, "font-weight": 800, fill: "#1a58b8", "font-family": "ui-monospace,monospace" }, U.fmt(hyp, 2)));
        svg.appendChild(svgEl("text", { x: hx, y: hy + 17, "text-anchor": "middle", "font-size": 12.5, "font-weight": 700, fill: "#98a2b3" }, "hypotenuse"));
        host.appendChild(svg);

        /* live readout / question */
        const status = wrap.querySelector("#status");
        if (st.mode === "explore") {
          wrap.querySelector("#trigTbl").innerHTML = `<tr><th>ratio</th><th>fraction</th><th>value</th><th>angle</th></tr>
            <tr><td>sin θ = opp/hyp</td><td class="mono">${U.fmt(opp, 2)} ÷ ${U.fmt(hyp, 2)}</td><td class="mono">${(opp / hyp).toFixed(4)}</td><td class="mono">${ang}°</td></tr>
            <tr><td>cos θ = adj/hyp</td><td class="mono">${U.fmt(adj, 2)} ÷ ${U.fmt(hyp, 2)}</td><td class="mono">${(adj / hyp).toFixed(4)}</td><td class="mono">${ang}°</td></tr>
            <tr><td>tan θ = opp/adj</td><td class="mono">${U.fmt(opp, 2)} ÷ ${U.fmt(adj, 2)}</td><td class="mono">${(opp / adj).toFixed(4)}</td><td class="mono">${ang}°</td></tr>
            <tr><td>sin² + cos²</td><td class="mono">—</td><td class="mono">${(Math.sin(ang * RAD) ** 2 + Math.cos(ang * RAD) ** 2).toFixed(4)}</td><td class="small muted">always 1</td></tr>`;
          status.textContent = `sin ${ang}° = ${trig("sin", ang).toFixed(3)}`;
        } else if (st.q) {
          const q = st.q;
          status.textContent = q.ask === "angle" ? "Find angle θ" : "Find the opposite side";
          const answer = q.ask === "angle" ? q.angle : (q.fn === "cos" ? q.hyp * Math.cos(q.angle * RAD) : q.hyp * Math.sin(q.angle * RAD));
          wrap.querySelector("#trigTbl").innerHTML = `<tr><th>clue</th><th>tool</th></tr>
            <tr><td>${q.ask === "angle" ? "Angle θ marked ?" : "Opposite side marked ?"} · sides labelled</td><td>${q.fn} — SOH CAH TOA</td></tr>`;
          drawQuestionForm(answer, q);
        }
      }

      function drawQuestionForm(answer, q) {
        const host = wrap.querySelector("#tri");
        host.insertAdjacentHTML("beforeend", `
          <div style="max-width:430px;margin:16px auto 0;display:flex;gap:10px;align-items:end">
            <div class="field" style="flex:1"><label>Your answer ${q.ask === "angle" ? "(degrees)" : "(units)"}</label>
              <input id="ansIn" type="text" inputmode="decimal" placeholder="?" autocomplete="off" style="font-size:18px;font-weight:800;font-family:var(--fm)"></div>
            <button class="btn" id="ansBtn">Check</button>
          </div>
          <div id="ansMsg" class="small" style="text-align:center;min-height:22px;margin-top:8px;font-weight:700"></div>`);
        const go = () => {
          const v = parseFloat(host.querySelector("#ansIn").value);
          const msg = host.querySelector("#ansMsg");
          st.tries++; wrap.querySelector("#at").textContent = st.tries;
          const tol = q.ask === "angle" ? 0.6 : Math.max(0.08, Math.abs(answer) * 0.01);
          if (isFinite(v) && Math.abs(v - answer) <= tol) {
            st.score++; wrap.querySelector("#sc").textContent = st.score; ML.record(true); U.sound.win();
            msg.style.color = "var(--green)";
            msg.textContent = `Correct — ${q.ask === "angle" ? answer.toFixed(1) + "°" : U.fmt(answer, 2)}.`;
            setTimeout(newQuestion, 1500);
          } else {
            ML.record(false); U.sound.no();
            msg.style.color = "var(--red)";
            msg.textContent = q.ask === "angle"
              ? "Remember: use sin⁻¹, cos⁻¹ or tan⁻¹ of the ratio between the two known sides."
              : `Set up ${q.fn}(${q.angle}°) = opposite ÷ ${q.hyp} and rearrange.`;
          }
        };
        host.querySelector("#ansBtn").addEventListener("click", go);
        host.querySelector("#ansIn").addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
        host.querySelector("#ansIn").focus();
      }

      st.hyp = 10;
      draw();
    },
  });

  /* =========================================================
     PROB TOOLS  (Probtools.exe)
     ========================================================= */
  ML.register({
    id: "prob", group: "numbers", title: "Probability Tools",
    short: "Probability", icon: ML.icon('dice'), color: ["#e0f7f5", "#0b7a73"], tag: "Statistics",
    blurb: "Dice and coin probability explorers, a live experimental-vs-theoretical race, and a two-dice sum chart.",
    tags: ["Probtools.exe", "dice", "coins", "experimental probability"],
    mount(root) {
      const st = { tab: "dice", die: 6, trials: 0, counts: new Array(13).fill(0), coinH: 0, coinT: 0, coinTrials: 0 };
      const wrap = U.el("div");
      wrap.innerHTML = `
        <div class="btn-row no-print" style="margin-bottom:16px" id="tabs">
          <button class="btn sm soft" data-t="dice">${ML.icon("dice")} Dice probability</button>
          <button class="btn sm ghost" data-t="coin">${ML.icon("coin")} Coin probability</button>
          <button class="btn sm ghost" data-t="sums">${ML.icon("plus")} Two-dice sums</button>
        </div>
        <div id="tabBody"></div>`;
      root.appendChild(wrap);
      wrap.querySelector("#tabs").addEventListener("click", (e) => {
        const b = e.target.closest("button[data-t]"); if (!b) return;
        st.tab = b.dataset.t;
        U.$$("#tabs button", wrap).forEach((x) => x.className = "btn sm " + (x === b ? "soft" : "ghost"));
        draw();
      });

      function draw() {
        const body = wrap.querySelector("#tabBody");
        if (st.tab === "dice") return diceView(body);
        if (st.tab === "coin") return coinView(body);
        return sumsView(body);
      }

      function diceView(body) {
        const events = [
          { key: "normal", label: "Normal (any score)", test: () => true, p: 1 },
          { key: "six", label: "Throwing a 6", test: (v) => v === 6, p: 1 / 6 },
          { key: "even", label: "Throwing an even", test: (v) => v % 2 === 0, p: 3 / 6 },
          { key: "lt5", label: "Throwing less than a 5", test: (v) => v < 5, p: 4 / 6 },
          { key: "prime", label: "Throwing a prime (2, 3, 5)", test: (v) => [2, 3, 5].includes(v), p: 3 / 6 },
        ];
        body.innerHTML = `
          <div class="app-layout">
            <aside class="controls no-print">
              <div class="panel">
                <div class="panel-h">Experiment</div>
                <div class="panel-b tight">
                  <div class="field"><label for="evSel">Event</label>
                    <select id="evSel">${events.map((e) => `<option value="${e.key}">${e.label}</option>`).join("")}</select>
                  </div>
                  <div class="btn-row">
                    <button class="btn sm" id="roll1">Roll once</button>
                    <button class="btn sm ghost" id="roll20">Roll 20</button>
                    <button class="btn sm ghost" id="roll200">Roll 200</button>
                  </div>
                  <button class="btn ghost sm" id="resetRolls">Reset counts</button>
                  <div class="stat"><span>Rolls</span><b id="nRolls">0</b></div>
                  <div class="stat"><span>Experimental</span><b id="expP">—</b></div>
                  <div class="stat"><span>Theoretical</span><b id="thP">—</b></div>
                </div>
              </div>
            </aside>
            <div class="stage">
              <div class="panel" style="margin-bottom:16px">
                <div class="panel-h"><span>Last roll</span><span class="small muted" id="lastRollNote"></span></div>
                <div class="panel-b" id="dieFace" style="align-items:center"></div>
              </div>
              <div class="card" style="overflow:hidden">
                <div class="card-h"><h2>How often each score lands</h2><span class="small muted">bar = actual, line = expected</span></div>
                <div class="card-b"><canvas id="barCv" style="width:100%;height:280px;display:block"></canvas></div>
              </div>
            </div>
          </div>`;
        const evSel = body.querySelector("#evSel");
        const counts = new Array(7).fill(0);
        let total = 0, last = null;
        const dieHost = body.querySelector("#dieFace");
        function face(v) {
          const pips = { 1: [[50, 50]], 2: [[30, 30], [70, 70]], 3: [[30, 30], [50, 50], [70, 70]], 4: [[30, 30], [70, 30], [30, 70], [70, 70]], 5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]], 6: [[30, 28], [70, 28], [30, 50], [70, 50], [30, 72], [70, 72]] }[v] || [];
          dieHost.innerHTML = `<svg viewBox="0 0 100 100" style="width:120px;height:120px" aria-label="die showing ${v}"><rect x="6" y="6" width="88" height="88" rx="16" fill="#fff" stroke="#101828" stroke-width="4"/>${pips.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7.5" fill="#101828"/>`).join("")}</svg>`;
        }
        face(6);
        function roll(n) {
          for (let i = 0; i < n; i++) { last = U.randInt(1, 6); counts[last]++; total++; }
          face(last);
          body.querySelector("#nRolls").textContent = total;
          const ev = events.find((e) => e.key === evSel.value);
          const hits = counts.reduce((a, c, v) => a + (v && ev.test(v) ? c : 0), 0);
          body.querySelector("#expP").textContent = total ? (hits / total).toFixed(3) : "—";
          body.querySelector("#thP").textContent = ev.p.toFixed(3);
          body.querySelector("#lastRollNote").textContent = `rolled ${last}`;
          bars();
        }
        body.querySelector("#roll1").addEventListener("click", () => { roll(1); U.sound.click(); });
        body.querySelector("#roll20").addEventListener("click", () => { roll(20); U.sound.click(); });
        body.querySelector("#roll200").addEventListener("click", () => { roll(200); U.sound.ok(); });
        body.querySelector("#resetRolls").addEventListener("click", () => { total = 0; counts.fill(0); roll(0); });
        evSel.addEventListener("change", () => roll(0));

        function bars() {
          const cv = body.querySelector("#barCv");
          const { ctx, w, h } = fitCanvas(cv);
          ctx.clearRect(0, 0, w, h);
          const pad = { l: 34, r: 12, t: 18, b: 28 };
          const bw = (w - pad.l - pad.r) / 6;
          const maxV = Math.max(4, ...counts.slice(1));
          ctx.strokeStyle = "#e4e7ec"; ctx.beginPath();
          for (let g = 0; g <= 4; g++) { const y = pad.t + (h - pad.t - pad.b) * (g / 4); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); }
          ctx.stroke();
          counts.slice(1).forEach((c, i) => {
            const bh = (c / maxV) * (h - pad.t - pad.b);
            const x = pad.l + i * bw + bw * 0.16, y = h - pad.b - bh;
            const grd = ctx.createLinearGradient(0, y, 0, h - pad.b);
            grd.addColorStop(0, "#7c6bff"); grd.addColorStop(1, "#b7adff");
            ctx.fillStyle = grd;
            ctx.beginPath(); ctx.roundRect(x, y, bw * 0.68, Math.max(bh, 1), [6, 6, 0, 0]); ctx.fill();
            ctx.fillStyle = "#475467"; ctx.font = "700 12px system-ui,sans-serif"; ctx.textAlign = "center";
            ctx.fillText(i + 1, x + bw * 0.34, h - pad.b + 16);
            if (c) { ctx.fillStyle = "#101828"; ctx.fillText(c, x + bw * 0.34, y - 5); }
          });
          /* expected line */
          if (total >= 6) {
            const exp = total / 6;
            const y = h - pad.b - (exp / maxV) * (h - pad.t - pad.b);
            ctx.strokeStyle = "#e5484d"; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
            ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "#e5484d"; ctx.font = "700 11px system-ui,sans-serif"; ctx.textAlign = "left";
            ctx.fillText("expected " + U.fmt(exp, 1), pad.l + 4, y - 5);
          }
        }
        roll(0);
      }

      function coinView(body) {
        body.innerHTML = `
          <div class="app-layout">
            <aside class="controls no-print">
              <div class="panel">
                <div class="panel-h">Toss the coin</div>
                <div class="panel-b tight">
                  <div class="btn-row">
                    <button class="btn sm" id="t1">Toss once</button>
                    <button class="btn sm ghost" id="t10">Toss 10</button>
                    <button class="btn sm ghost" id="t100">Toss 100</button>
                  </div>
                  <button class="btn ghost sm" id="treset">Reset</button>
                  <label class="field"><label>Probability of a head <span class="val" id="phV">0.50</span></label>
                    <input type="range" id="ph" min="0" max="1" step="0.05" value="0.5"></label>
                  <div class="note">Change the coin to an unfair one and watch how many tosses it takes before the experimental probability settles down.</div>
                </div>
              </div>
            </aside>
            <div class="stage">
              <div class="panel" style="margin-bottom:16px">
                <div class="panel-h"><span>Toss</span><span class="small muted" id="coinNote"></span></div>
                <div class="panel-b" style="align-items:center"><div id="coinFace" style="font-size:64px">${ML.icon("coin")}</div></div>
              </div>
              <div class="card pad" style="display:flex;gap:18px;flex-wrap:wrap">
                <div class="stat" style="flex:1;min-width:120px"><span>Heads</span><b id="hN">0</b></div>
                <div class="stat" style="flex:1;min-width:120px"><span>Tails</span><b id="tN">0</b></div>
                <div class="stat" style="flex:1;min-width:120px"><span>Exp. P(head)</span><b id="phExp">—</b></div>
                <div class="stat" style="flex:1;min-width:120px"><span>Theory</span><b id="phTh">0.50</b></div>
              </div>
              <div class="card" style="margin-top:16px"><div class="card-b" id="err"></div></div>
            </div>
          </div>`;
        let h = 0, t = 0, ph = 0.5;
        const oh = body.querySelector("#hN"), ot = body.querySelector("#tN");
        const cf = body.querySelector("#coinFace");
        function toss(n) {
          for (let i = 0; i < n; i++) { if (Math.random() < ph) h++; else t++; }
          cf.innerHTML = Math.random() < 0.5 ? ML.icon("coin") : ML.icon("coin"); cf.style.color = Math.random() < 0.5 ? "#b07a06" : "#c9a227";
          oh.textContent = h; ot.textContent = t;
          body.querySelector("#phExp").textContent = (h + t) ? (h / (h + t)).toFixed(3) : "—";
          body.querySelector("#coinNote").textContent = `${h + t} toss${h + t === 1 ? "" : "es"}`;
          body.querySelector("#err").innerHTML = (h + t) ? `<div class="small">Difference between experimental and theoretical: <b class="mono">${Math.abs(h / (h + t) - ph).toFixed(3)}</b> — with more tosses this should shrink.</div>` : "";
        }
        body.querySelector("#t1").addEventListener("click", () => { toss(1); U.sound.coin(); });
        body.querySelector("#t10").addEventListener("click", () => { toss(10); U.sound.coin(); });
        body.querySelector("#t100").addEventListener("click", () => { toss(100); U.sound.ok(); });
        body.querySelector("#treset").addEventListener("click", () => { h = 0; t = 0; toss(0); });
        body.querySelector("#ph").addEventListener("input", (e) => {
          ph = +e.target.value; body.querySelector("#phV").textContent = ph.toFixed(2);
          body.querySelector("#phTh").textContent = ph.toFixed(2);
        });
        toss(0);
      }

      function sumsView(body) {
        const grid = [];
        for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) grid.push({ a, b, s: a + b });
        const counts = new Array(14).fill(0);
        grid.forEach((g) => counts[g.s]++);
        const maxC = Math.max(...counts);
        body.innerHTML = `
          <div class="app-layout">
            <aside class="controls no-print">
              <div class="panel">
                <div class="panel-h">Two dice</div>
                <div class="panel-b tight">
                  <p class="small muted" style="margin:0">There are 36 equally likely outcomes. Click any cell to see the probability of that sum.</p>
                  <div class="stat"><span>Most likely</span><b>7 — 6/36</b></div>
                  <div class="stat"><span>Least likely</span><b>2 and 12 — 1/36</b></div>
                </div>
              </div>
            </aside>
            <div class="stage">
              <div class="panel" style="overflow:hidden">
                <div class="panel-h"><span>Sum chart</span><span class="small muted" id="cellNote">click a cell</span></div>
                <div class="card-b scroll-x" id="sumGrid"></div>
              </div>
              <div class="card" style="margin-top:16px"><div class="card-b" id="sumAns"></div></div>
            </div>
          </div>`;
        const host = body.querySelector("#sumGrid");
        let html = `<table class="data" style="text-align:center"><tr><th style="text-align:center">+</th>${U.range(1, 6).map((b) => `<th style="text-align:center">${b}</th>`).join("")}</tr>`;
        for (let a = 1; a <= 6; a++) {
          html += `<tr><th style="text-align:center">${a}</th>` + U.range(1, 6).map((b) => {
            const s = a + b, p = counts[s] / 36;
            const hue = 260 - (counts[s] / maxC) * 180;
            return `<td data-s="${s}" style="text-align:center;cursor:pointer;background:hsl(${hue} 85% 94%);font-weight:800;font-family:var(--fm)">${s}</td>`;
          }).join("") + `</tr>`;
        }
        html += "</table>";
        host.innerHTML = html;
        host.addEventListener("click", (e) => {
          const td = e.target.closest("td[data-s]"); if (!td) return;
          const s = +td.dataset.s;
          const ways = grid.filter((g) => g.s === s);
          body.querySelector("#sumAns").innerHTML = `
            <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:center">
              <div class="stat"><span>Sum</span><b style="font-size:30px">${s}</b></div>
              <div class="stat"><span>Ways</span><b>${ways.length}</b></div>
              <div class="stat"><span>Probability</span><b>${ways.length}/36 = ${(ways.length / 36).toFixed(4)}</b></div>
              <div class="btn-row" style="flex:1;justify-content:flex-end">${ways.map((g) => `<span class="badge info">${g.a} + ${g.b}</span>`).join("")}</div>
            </div>`;
          body.querySelector("#cellNote").textContent = `sum ${s}`;
        });
      }
      draw();
    },
  });

  /* =========================================================
     PI & RECURSIVE FORMULAS  (Pi - Recursive Formula.xlsx)
     ========================================================= */
  ML.register({
    id: "pi", group: "numbers", title: "π by Recursion",
    short: "π recursion", icon: ML.icon('pi'), color: ["#eeecff", "#4b3ee0"], tag: "Investigation",
    blurb: "Watch repeated square roots home in on π — the same rapid-convergence method from the original spreadsheet, with every step shown.",
    tags: ["Pi - Recursive Formula.xlsx", "iteration", "convergence", "Archimedes"],
    mount(root) {
      const wrap = U.el("div", { class: "app-layout" });
      wrap.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Recursion</div>
            <div class="panel-b tight">
              <div class="field"><label>Steps <span class="val" id="nV">4</span></label><input type="range" id="nR" min="0" max="4" value="3"></div>
              <div class="stat"><span>Approximation</span><b id="approx" style="font-size:22px">—</b></div>
              <div class="stat"><span>Error vs π</span><b id="err" style="font-size:18px">—</b></div>
              <div class="note">Each step repeats two square roots and a square — the number of correct digits roughly doubles every time.</div>
            </div>
          </div>
        </aside>
        <div class="stage">
          <div class="card" style="overflow:hidden;margin-bottom:16px">
            <div class="card-h"><h2>Iteration table</h2><span class="small muted">good for printing</span></div>
            <div class="scroll-x"><table class="data" id="piTbl"></table></div>
          </div>
          <div class="card" style="overflow:hidden">
            <div class="card-h"><h2>Convergence</h2><span class="small muted">error on a log scale</span></div>
            <div class="card-b"><canvas id="piCv" style="width:100%;height:260px;display:block"></canvas></div>
          </div>
        </div>`;
      root.appendChild(wrap);
      const nR = wrap.querySelector("#nR");

      /* Brent–Salamin:  a₀ = 1, b₀ = 1/√2, c₀ = ¼
         aₙ₊₁ = (a₀+b₀)/2,  bₙ₊₁ = √(a₀b₀),  cₙ₊₁ = cₙ − 2ⁿ(aₙ₊₁² − bₙ₊₁²)
         π ≈ (a + b)² / (4c)          — doubles the correct digits each step       */
      function brentSalamin(n) {
        const rows = [];
        let a = 1, b = Math.SQRT1_2 / 1, c = 0.25;
        b = 1 / Math.sqrt(2);
        for (let i = 0; i <= n; i++) {
          const pi = Math.pow(a + b, 2) / (4 * c);
          rows.push({ n: i, a, b, c, pi });
          const a1 = (a + b) / 2;
          const b1 = Math.sqrt(a * b);
          c = c - Math.pow(2, i) * (a1 * a1 - b1 * b1);
          a = a1; b = b1;
        }
        return rows;
      }

      function draw() {
        const n = +nR.value;
        wrap.querySelector("#nV").textContent = n;
        const rows = brentSalamin(n);
        const last = rows[rows.length - 1];
        wrap.querySelector("#approx").textContent = last.pi.toFixed(15);
        wrap.querySelector("#err").textContent = Math.abs(last.pi - Math.PI).toExponential(2);
        const fx = (v) => (v === 0 ? "0" : v.toFixed(10));
        wrap.querySelector("#piTbl").innerHTML = `<tr><th>n</th><th>A</th><th>B</th><th>C</th><th>π estimate</th><th>error</th></tr>` +
          rows.slice(-6).map((r) => `<tr><td>${r.n}</td><td class="mono">${fx(r.a)}</td><td class="mono">${fx(r.b)}</td><td class="mono">${fx(r.c)}</td><td class="mono" style="color:var(--brand-ink);font-weight:800">${r.pi.toFixed(12)}</td><td class="mono">${Math.abs(r.pi - Math.PI).toExponential(1)}</td></tr>`).join("");
        const cv = wrap.querySelector("#piCv");
        const { ctx, w, h } = fitCanvas(cv);
        ctx.clearRect(0, 0, w, h);
        const pad = { l: 44, r: 14, t: 16, b: 26 };
        const errs = rows.map((r) => Math.max(1e-17, Math.abs(r.pi - Math.PI)));
        const logs = errs.map((e) => Math.log10(e));
        const lo = Math.min(...logs, -16), hi = Math.max(...logs, 0);
        const X = (i) => pad.l + ((w - pad.l - pad.r) * i) / Math.max(1, rows.length - 1);
        const Y = (v) => pad.t + ((h - pad.t - pad.b) * (hi - v)) / (hi - lo || 1);
        ctx.strokeStyle = "#eef1f7";
        for (let g = Math.ceil(lo); g <= hi; g++) { ctx.beginPath(); ctx.moveTo(pad.l, Y(g)); ctx.lineTo(w - pad.r, Y(g)); ctx.stroke(); ctx.fillStyle = "#98a2b3"; ctx.font = "600 10px system-ui"; ctx.textAlign = "right"; ctx.fillText("1e" + g, pad.l - 6, Y(g) + 4); }
        ctx.strokeStyle = "#6d5efc"; ctx.lineWidth = 2.6; ctx.beginPath();
        logs.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
        ctx.stroke();
        logs.forEach((v, i) => {
          ctx.fillStyle = i === logs.length - 1 ? "#0f9d94" : "#fff"; ctx.strokeStyle = "#6d5efc"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(X(i), Y(v), 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        });
        ctx.fillStyle = "#475467"; ctx.font = "700 11px system-ui"; ctx.textAlign = "center";
        rows.forEach((r, i) => ctx.fillText("n=" + r.n, X(i), h - 8));
      }
      nR.addEventListener("input", draw);
      draw();
    },
  });
})();

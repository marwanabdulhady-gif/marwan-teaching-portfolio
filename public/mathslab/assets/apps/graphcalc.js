/* ===========================================================
   MathsLab — Graphing Calculator  (#/graphcalc)
   The one interactive the captured Dr. Math Azzam course pages
   lean on hardest (their "Desmos Graphing" tab in every course),
   rebuilt natively: no API key, no network, no external library.

     · a real expression list (colour, eye, delete) — y = … or bare
     · auto-detected parameter sliders (a, b, c, k …) with live redraw
     · drag to pan, wheel / buttons to zoom, reset view
     · hover trace: nearest curve, live (x, y) readout
     · tangent + slope at the traced point
     · intersections of the first two curves (bisection)
     · table of values
     · a limit panel: f(a−ε), f(a), f(a+ε) with left/right approach
   =========================================================== */
(function () {
  "use strict";
  const ML = window.ML, U = ML.u;

  const COLORS = ["#4b3ee0", "#0f9d94", "#e5484d", "#e8a008", "#2f7cf6", "#b0267a"];
  const PRESETS = [
    { label: "Parabola", src: "x^2 - 3" },
    { label: "Cubic", src: "x^3 - 4x" },
    { label: "Sine", src: "3 sin(x)" },
    { label: "Exponential", src: "2^x" },
    { label: "Log", src: "ln(x)" },
    { label: "Hyperbola", src: "1/x" },
    { label: "Absolute", src: "abs(x) - 1" },
    { label: "Root", src: "sqrt(x)" },
    { label: "Family", src: "a (x - h)^2 + k" },
    { label: "Rational", src: "(x^2 - 1)/(x - 2)" },
  ];

  /* ---------- a plot with a mutable window ---------- */
  function Chart(cv, cfg) {
    cfg = cfg || {};
    const o = { x0: -8, x1: 8, y0: -6, y1: 6, pad: 34, step: 1 };
    const ctx = cv && cv.getContext ? cv.getContext("2d") : null;
    const c = { cv, ctx, o };
    c.resize = function () {
      const host = cv.parentElement;
      const w = Math.round(cv.clientWidth || (host && host.clientWidth) || 620);
      const h = Math.round(cv.clientHeight || (host && host.clientHeight) || 420);
      c.w = w; c.h = h;
      const dpr = window.devicePixelRatio || 1;
      if (ctx) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
      /* a calculator plot keeps square units, so a parabola looks like a
         parabola however wide the panel is (idempotent: a second pass is a
         no-op once the two scales agree) */
      if (cfg.uniform && ML.stage && ML.stage.square) ML.stage.square(o, w, h, o.pad);
      return c;
    };
    c.X = (x) => o.pad + ((x - o.x0) / (o.x1 - o.x0)) * (c.w - 2 * o.pad);
    c.Y = (y) => c.h - o.pad - ((y - o.y0) / (o.y1 - o.y0)) * (c.h - 2 * o.pad);
    c.invX = (px) => o.x0 + ((px - o.pad) / (c.w - 2 * o.pad)) * (o.x1 - o.x0);
    c.invY = (py) => o.y0 + ((c.h - o.pad - py) / (c.h - 2 * o.pad)) * (o.y1 - o.y0);
    c.fit = function (x0, x1, y0, y1) { o.x0 = x0; o.x1 = x1; o.y0 = y0; o.y1 = y1; return c; };
    c.span = () => ({ x: o.x1 - o.x0, y: o.y1 - o.y0 });
    c.zoom = function (k, ax, ay) {
      const s = c.span();
      const cx = ax == null ? (o.x0 + o.x1) / 2 : ax;
      const cy = ay == null ? (o.y0 + o.y1) / 2 : ay;
      const nx = (s.x * k) / 2, ny = (s.y * k) / 2;
      o.x0 = cx - nx; o.x1 = cx + nx; o.y0 = cy - ny; o.y1 = cy + ny;
      return c;
    };
    c.pan = function (dx, dy) {
      const s = c.span();
      o.x0 += dx * s.x; o.x1 += dx * s.x; o.y0 += dy * s.y; o.y1 += dy * s.y;
      return c;
    };
    c.clear = function () { if (ctx) { ctx.clearRect(0, 0, c.w, c.h); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.w, c.h); } return c; };
    const nice = (raw) => {
      const p = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
      const f = raw / p;
      return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
    };
    c.grid = function () {
      if (!ctx) return c;
      const s = c.span();
      const gx = nice(s.x / 8), gy = nice(s.y / 6);
      const fmt = (v) => (Math.abs(v) < 1e-12 ? "0" : (Math.abs(v) >= 100 ? v.toFixed(0) : String(+v.toFixed(3))));
      ctx.lineWidth = 1;
      for (let x = Math.ceil(o.x0 / gx) * gx; x <= o.x1; x += gx) {
        const X = c.X(x);
        ctx.strokeStyle = Math.abs(x) < gx / 9 ? "#cfd4dc" : "#eef0f4";
        ctx.beginPath(); ctx.moveTo(X, o.pad - 8); ctx.lineTo(X, c.h - o.pad + 8); ctx.stroke();
        if (Math.abs(x) > gx / 9) {
          ctx.fillStyle = "#98a2b3"; ctx.font = "10px ui-sans-serif, system-ui"; ctx.textAlign = "center";
          ctx.fillText(fmt(x), X, c.h - o.pad + 20);
        }
      }
      for (let y = Math.ceil(o.y0 / gy) * gy; y <= o.y1; y += gy) {
        const Y = c.Y(y);
        ctx.strokeStyle = Math.abs(y) < gy / 9 ? "#cfd4dc" : "#eef0f4";
        ctx.beginPath(); ctx.moveTo(o.pad - 8, Y); ctx.lineTo(c.w - o.pad + 8, Y); ctx.stroke();
        if (Math.abs(y) > gy / 9) {
          ctx.fillStyle = "#98a2b3"; ctx.font = "10px ui-sans-serif, system-ui"; ctx.textAlign = "right";
          ctx.fillText(fmt(y), o.pad - 12, Y + 3);
        }
      }
      /* axes */
      ctx.strokeStyle = "#667085"; ctx.lineWidth = 1.5;
      const yx = c.Y(0), xx = c.X(0);
      if (o.y0 < 0 && o.y1 > 0) { ctx.beginPath(); ctx.moveTo(o.pad - 8, yx); ctx.lineTo(c.w - o.pad + 8, yx); ctx.stroke(); }
      if (o.x0 < 0 && o.x1 > 0) { ctx.beginPath(); ctx.moveTo(xx, o.pad - 8); ctx.lineTo(xx, c.h - o.pad + 8); ctx.stroke(); }
      return c;
    };
    c.curve = function (f, color, width, dash) {
      if (!ctx || !f) return c;
      ctx.save();
      ctx.strokeStyle = color; ctx.lineWidth = width || 2.4;
      ctx.setLineDash(dash || []);
      ctx.beginPath();
      let pen = false, prevY = null;
      const n = Math.max(200, Math.round(c.w));
      for (let i = 0; i <= n; i++) {
        const x = o.x0 + ((o.x1 - o.x0) * i) / n;
        let y;
        try { y = f(x); } catch (e) { y = NaN; }
        if (!isFinite(y)) { pen = false; prevY = null; continue; }
        const Y = c.Y(y), X = c.X(x);
        /* break the stroke at a jump (asymptote) */
        if (pen && prevY != null && Math.abs(Y - prevY) > c.h) pen = false;
        if (!pen) { ctx.moveTo(X, Y); pen = true; } else ctx.lineTo(X, Y);
        prevY = Y;
      }
      ctx.stroke();
      ctx.restore();
      return c;
    };
    c.dot = function (x, y, color, r) {
      if (!ctx) return c;
      ctx.fillStyle = color; ctx.beginPath();
      ctx.arc(c.X(x), c.Y(y), r || 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.6; ctx.stroke();
      return c;
    };
    c.ring = function (x, y, color) {
      if (!ctx) return c;
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
      ctx.arc(c.X(x), c.Y(y), 8, 0, Math.PI * 2); ctx.stroke();
      return c;
    };
    c.label = function (x, y, text, color) {
      if (!ctx) return c;
      ctx.fillStyle = color || "#101828"; ctx.font = "600 12px ui-sans-serif, system-ui";
      ctx.textAlign = "left";
      ctx.fillText(text, c.X(x) + 8, c.Y(y) - 8);
      return c;
    };
    return c;
  }

  /* ---------- number helpers ---------- */
  const fmt = (v, d) => {
    if (v == null || !isFinite(v)) return "—";
    const n = Number(v);
    if (Math.abs(n) >= 1e6 || (Math.abs(n) < 1e-4 && n !== 0)) return n.toExponential(2);
    return String(+n.toFixed(d == null ? 3 : d));
  };
  const slopeAt = (f, x, h) => {
    const dx = h || 1e-4;
    const a = f(x - dx), b = f(x + dx);
    return (isFinite(a) && isFinite(b)) ? (b - a) / (2 * dx) : NaN;
  };

  ML.register({
    id: "graphcalc", group: "tools", title: "Graphing Calculator",
    short: "Calculator", icon: ML.icon("graph"), color: ["#eefeec", "#1f7a45"],
    tag: "type · plot · trace · zoom",
    blurb: "A Desmos-style calculator that runs offline: type up to six expressions, get parameter sliders, drag to pan, trace a point for its coordinates and tangent, read intersections, a table of values and a left/right limit explorer.",
    tags: ["graph", "calculator", "plot", "trace", "tangent", "intersections", "table", "limits", "sliders"],
    mount(root, ctx) {
      const state = {
        exprs: [{ src: "x^2 - 3", on: true, color: COLORS[0] }, { src: "2x + 1", on: true, color: COLORS[1] }],
        params: {},
        trace: null,
        pinned: false,
        showTangent: true,
        showTable: true,
        limit: { a: 1, eps: 0.4, which: 0 },
      };
      const sub = (ctx && ctx.sub) || "";
      if (sub) {
        const seed = decodeURIComponent(sub).replace(/_/g, " ");
        state.exprs = [{ src: seed, on: true, color: COLORS[0] }];
      }
      root.innerHTML = `
        <div class="gc">
          <header class="gc-head">
            <div>
              <div class="eyebrow">Graphing tools · runs offline</div>
              <h1>Graphing Calculator</h1>
              <p class="muted small" style="margin:4px 0 0">Type an expression — <code class="mono">y = …</code> or just the right-hand side.
                Single letters become sliders. Drag to pan, scroll to zoom, click the graph to trace.</p>
            </div>
            <div class="gc-head-btns">
              <button class="btn ghost sm" id="gcReset" title="reset view (0)">⟲ Reset view</button>
              <a class="btn ghost sm" href="#/hu9graph">Function graph →</a>
            </div>
          </header>

          <div class="gc-body">
            <section class="gc-list">
              <div class="gc-listhead"><span>Expressions</span><button class="btn ghost xs" id="gcAdd">+ Add</button></div>
              <div id="gcRows" class="gc-rows"></div>
              <div class="gc-presets" id="gcPresets">
                ${PRESETS.map((p) => `<button class="gc-chip" data-src="${p.src.replace(/"/g, "&quot;")}">${p.label}</button>`).join("")}
              </div>
              <div class="gc-params">
                <div class="gc-sub">Parameters</div>
                <div id="gcParams" class="gc-params-list"><span class="muted small">none yet — use a letter like <code class="mono">a</code> in an expression</span></div>
              </div>
              <div class="gc-limits">
                <div class="gc-sub">Limit explorer</div>
                <div class="gc-limit-row">
                  <label>x → a</label>
                  <input type="range" id="gcA" min="-6" max="6" step="0.1" value="1">
                  <b id="gcAval">1</b>
                </div>
                <div class="gc-limit-row">
                  <label>ε</label>
                  <input type="range" id="gcEps" min="0.02" max="1.5" step="0.02" value="0.4">
                  <b id="gcEpsval">0.4</b>
                </div>
                <div id="gcLimitOut" class="gc-limit-out"></div>
              </div>
            </section>

            <section class="gc-plotwrap">
              <div class="gc-canvashost">
                <canvas id="gcCv" height="430" aria-label="graph of the typed expressions"></canvas>
                <div class="gc-zoom">
                  <button class="btn ghost xs" id="gcZin" aria-label="Zoom in">+</button>
                  <button class="btn ghost xs" id="gcZout" aria-label="Zoom out">−</button>
                </div>
                <div class="gc-window" id="gcWindow"></div>
              </div>
              <div class="gc-read" id="gcRead"></div>
              <div class="gc-foot">
                <label class="gc-toggle"><input type="checkbox" id="gcTan" checked> tangent &amp; slope at the traced point</label>
                <label class="gc-toggle"><input type="checkbox" id="gcTab" checked> table of values</label>
                <span class="muted small">keys: ← → ↑ ↓ pan · + − zoom · 0 reset · t tangent</span>
              </div>
              <div id="gcTable" class="gc-table"></div>
            </section>
          </div>
        </div>`;
      const $ = (s) => root.querySelector(s);
      const cv = $("#gcCv");
      const chart = Chart(cv, { uniform: true });
      /* the plot lives inside the stage: a bounded box with a full-screen switch */
      const stageEl = $(".gc-canvashost");
      const stage = ML.stage ? ML.stage.frame(stageEl, { draw: () => draw(), label: "Graph" }) : null;

      /* ---- compile everything that is switched on ---- */
      function compiled() {
        return state.exprs.map((e) => {
          if (!e.on || !String(e.src || "").trim()) return null;
          const src = String(e.src).replace(/^\s*y\s*=\s*/i, "");
          const vars = Object.assign({}, state.params);
          const c = ML.compile(src, vars);
          return c && c.f ? { f: c.f, src, color: e.color, err: c.err || null } : { f: null, src, color: e.color, err: (c && c.err) || "unreadable" };
        });
      }
      /* letters that should become sliders */
      function detectParams() {
        const found = new Set();
        state.exprs.forEach((e) => {
          if (!e.on) return;
          const src = String(e.src || "");
          const letters = src.match(/\b[a-z]\b/gi) || [];
          letters.forEach((l) => {
            const k = l.toLowerCase();
            if (k === "x" || k === "y" || k === "e") return;
            found.add(k);
          });
        });
        const next = {};
        found.forEach((k) => { next[k] = state.params[k] == null ? 1 : state.params[k]; });
        state.params = next;
      }

      /* ---- the expression rows ---- */
      function paintRows() {
        const box = $("#gcRows");
        box.innerHTML = "";
        state.exprs.forEach((e, i) => {
          const row = U.el("div", { class: "gc-row" + (e.on ? "" : " is-off") });
          row.innerHTML = `
            <button class="gc-dot" style="background:${e.color}" aria-label="colour ${i + 1}" data-i="${i}"></button>
            <span class="gc-eq">y =</span>
            <input class="gc-input" data-i="${i}" value="${String(e.src).replace(/"/g, "&quot;")}" spellcheck="false" aria-label="expression ${i + 1}">
            <button class="gc-eye" data-i="${i}" aria-label="${e.on ? "hide" : "show"}">${e.on ? "◉" : "○"}</button>
            <button class="gc-x" data-i="${i}" aria-label="remove">×</button>`;
          box.appendChild(row);
        });
        box.querySelectorAll(".gc-input").forEach((inp) => {
          inp.addEventListener("input", () => {
            state.exprs[Number(inp.dataset.i)].src = inp.value;
            detectParams();
            paintParams();
            draw();
          });
          inp.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") { ev.preventDefault(); addRow(); }
          });
        });
        box.querySelectorAll(".gc-eye").forEach((b) => b.addEventListener("click", () => {
          const i = Number(b.dataset.i);
          state.exprs[i].on = !state.exprs[i].on;
          paintRows(); detectParams(); paintParams(); draw();
        }));
        box.querySelectorAll(".gc-x").forEach((b) => b.addEventListener("click", () => {
          if (state.exprs.length <= 1) return;
          state.exprs.splice(Number(b.dataset.i), 1);
          paintRows(); detectParams(); paintParams(); draw();
        }));
        box.querySelectorAll(".gc-dot").forEach((b) => b.addEventListener("click", () => {
          const i = Number(b.dataset.i);
          state.exprs[i].color = COLORS[(COLORS.indexOf(state.exprs[i].color) + 1) % COLORS.length];
          paintRows(); draw();
        }));
      }
      function addRow(src) {
        if (state.exprs.length >= 6) { ML.toast("Six expressions is the limit", "warn"); return; }
        const used = state.exprs.map((e) => e.color);
        const color = COLORS.find((c) => used.indexOf(c) < 0) || COLORS[0];
        state.exprs.push({ src: src || "", on: true, color });
        paintRows();
        const inputs = root.querySelectorAll(".gc-input");
        const last = inputs[inputs.length - 1];
        if (last) last.focus();
        draw();
      }

      /* ---- parameter sliders ---- */
      function paintParams() {
        const box = $("#gcParams");
        const keys = Object.keys(state.params);
        if (!keys.length) {
          box.innerHTML = `<span class="muted small">none yet — use a letter like <code class="mono">a</code> in an expression</span>`;
          return;
        }
        box.innerHTML = keys.map((k) => `
          <div class="gc-param">
            <label for="gcP${k}">${k}</label>
            <input type="range" id="gcP${k}" data-k="${k}" min="-5" max="5" step="0.1" value="${state.params[k]}">
            <b id="gcPv${k}">${fmt(state.params[k], 2)}</b>
          </div>`).join("");
        box.querySelectorAll('input[type="range"]').forEach((inp) => {
          inp.addEventListener("input", () => {
            state.params[inp.dataset.k] = Number(inp.value);
            const b = root.querySelector("#gcPv" + inp.dataset.k);
            if (b) b.textContent = fmt(Number(inp.value), 2);
            draw();
          });
        });
      }

      /* ---- intersections of curves 1 and 2 ---- */
      function intersections(cs) {
        const out = [];
        const a = cs[0], b = cs[1];
        if (!a || !a.f || !b || !b.f) return out;
        const o = chart.o;
        const N = 1400;
        const g = (x) => { try { return a.f(x) - b.f(x); } catch (e) { return NaN; } };
        let px = null, pv = null;
        for (let i = 0; i <= N; i++) {
          const x = o.x0 + ((o.x1 - o.x0) * i) / N;
          const v = g(x);
          if (isFinite(v) && pv != null && isFinite(pv) && pv * v < 0) {
            let lo = px, hi = x;
            for (let k = 0; k < 60; k++) {
              const mid = (lo + hi) / 2;
              if (g(lo) * g(mid) <= 0) hi = mid; else lo = mid;
            }
            const rx = (lo + hi) / 2;
            let ry; try { ry = a.f(rx); } catch (e) { ry = NaN; }
            if (isFinite(ry) && out.length < 8) out.push({ x: rx, y: ry });
          }
          px = x; pv = v;
        }
        return out;
      }

      /* ---- draw everything ---- */
      function draw() {
        chart.resize();
        chart.clear().grid();
        const cs = compiled();
        state._cs = cs;
        cs.forEach((c) => { if (c && c.f) chart.curve(c.f, c.color, 2.4); });
        const xs = intersections(cs);
        xs.forEach((p) => { chart.ring(p.x, p.y, "#b0267a"); });
        if (state.trace) {
          const t = state.trace;
          const c = cs[t.i];
          if (c && c.f) {
            const y = c.f(t.x);
            if (isFinite(y)) {
              if (state.showTangent) {
                const m = slopeAt(c.f, t.x);
                if (isFinite(m)) {
                  const h = (chart.o.x1 - chart.o.x0) / 6;
                  chart.curve((z) => y + m * (z - t.x), "#b0267a", 1.6, [6, 5]);
                  chart.label(t.x + h * 0.35, y + m * (h * 0.35), "slope " + fmt(m), "#b0267a");
                }
              }
              chart.dot(t.x, y, c.color);
              chart.label(t.x, y, "(" + fmt(t.x, 2) + ", " + fmt(y, 2) + ")", c.color);
            }
          }
        }
        /* the limit explorer point */
        const lim = state.limit;
        const lc = cs[lim.which];
        if (lc && lc.f) {
          const y0 = lc.f(lim.a);
          if (isFinite(y0)) chart.dot(lim.a, y0, "#0f9d94", 5.5);
        }
        paintRead(cs, xs);
        paintWindow();
        if (state.showTable) paintTable(cs);
      }

      function paintWindow() {
        const o = chart.o;
        $("#gcWindow").textContent = "x ∈ [" + fmt(o.x0, 2) + ", " + fmt(o.x1, 2) + "]  ·  y ∈ [" + fmt(o.y0, 2) + ", " + fmt(o.y1, 2) + "]";
      }

      function paintRead(cs, xs) {
        const box = $("#gcRead");
        const bits = [];
        cs.forEach((c, i) => {
          if (!c) return;
          if (!c.f) { bits.push(`<span class="gc-err" style="--c:${c.color}">${c.src || "…"} — ${c.err || "unreadable"}</span>`); return; }
          bits.push(`<span class="gc-tag" style="--c:${c.color}">y = ${c.src}</span>`);
        });
        if (state.trace) {
          const c = cs[state.trace.i];
          if (c && c.f) {
            const y = c.f(state.trace.x);
            const m = slopeAt(c.f, state.trace.x);
            bits.push(`<span class="gc-num">trace <b>(${fmt(state.trace.x, 3)}, ${fmt(y, 3)})</b> · slope <b>${fmt(m, 3)}</b> · f′(x) ≈ ${fmt(m, 2)}</span>`);
          }
        } else {
          bits.push(`<span class="muted small">click the graph to trace a point</span>`);
        }
        if (xs.length) bits.push(`<span class="gc-ix">intersections: ${xs.map((p) => "(" + fmt(p.x, 2) + ", " + fmt(p.y, 2) + ")").join("  ·  ")}</span>`);
        box.innerHTML = bits.join(" ");
        paintLimit(cs);
      }

      function paintLimit(cs) {
        const lim = state.limit;
        const out = $("#gcLimitOut");
        const c = cs[lim.which] || cs.find((x) => x && x.f);
        if (!c || !c.f) { out.innerHTML = `<span class="muted small">type a function to explore a limit.</span>`; return; }
        const f = c.f;
        const safe = (x) => { try { const v = f(x); return isFinite(v) ? v : NaN; } catch (e) { return NaN; } };
        const left = safe(lim.a - lim.eps), mid = safe(lim.a), right = safe(lim.a + lim.eps);
        const near = safe(lim.a - lim.eps / 10), nearR = safe(lim.a + lim.eps / 10);
        /* does the gap between the two sides close as ε shrinks? */
        const gapFar = (isFinite(left) && isFinite(right)) ? Math.abs(right - left) : NaN;
        const gapNear = (isFinite(near) && isFinite(nearR)) ? Math.abs(nearR - near) : NaN;
        const converging = isFinite(gapNear) && (gapNear < 1e-6 || (!isFinite(gapFar) ? false : gapNear < Math.max(1e-6, gapFar / 3)));
        const trend = (a, b) => {
          if (!isFinite(a) || !isFinite(b)) return "—";
          if (Math.abs(b - a) < 1e-6) return "steady";
          return b > a ? "rising ↑" : "falling ↓";
        };
        out.innerHTML = `
          <div class="gc-lrow"><span>from the left</span><b>f(${fmt(lim.a - lim.eps, 2)}) = ${fmt(left)}</b></div>
          <div class="gc-lrow"><span>at the point</span><b>f(${fmt(lim.a, 2)}) = ${fmt(mid)}</b></div>
          <div class="gc-lrow"><span>from the right</span><b>f(${fmt(lim.a + lim.eps, 2)}) = ${fmt(right)}</b></div>
          <div class="gc-lrow gc-lsum"><span>closer still</span><b>${fmt(near)} ← ${trend(left, near)} · ${trend(right, nearR)} → ${fmt(nearR)}</b></div>
          <div class="muted small">${converging
            ? "The sides converge as ε shrinks: the limit is about " + fmt((near + nearR) / 2, 3) + "." + (!isFinite(mid) ? " The function itself is undefined there — a hole, and that is the point." : "")
            : "The sides stay apart however small ε gets — a jump or a vertical asymptote, not a limit."}</div>`;
      }

      function paintTable(cs) {
        const box = $("#gcTable");
        const c = cs.find((x) => x && x.f);
        if (!c) { box.innerHTML = ""; return; }
        const o = chart.o;
        const n = 7;
        const xs = [];
        for (let i = 0; i < n; i++) xs.push(o.x0 + ((o.x1 - o.x0) * i) / (n - 1));
        box.innerHTML = `<table class="gc-tbl"><tr><th>x</th>${xs.map((x) => `<td>${fmt(x, 2)}</td>`).join("")}</tr>
          <tr><th>${c.src.replace(/^\s*y\s*=\s*/i, "y = ")}</th>${xs.map((x) => {
            let y; try { y = c.f(x); } catch (e) { y = NaN; }
            return `<td>${isFinite(y) ? fmt(y, 3) : "—"}</td>`;
          }).join("")}</tr></table>`;
      }

      /* ---- interaction ---- */
      function traceAt(clientX, clientY) {
        const r = cv.getBoundingClientRect();
        const px = clientX - r.left, py = clientY - r.top;
        const x = chart.invX(px);
        const cs = state._cs || [];
        let best = null;
        cs.forEach((c, i) => {
          if (!c || !c.f) return;
          let y; try { y = c.f(x); } catch (e) { y = NaN; }
          if (!isFinite(y)) return;
          const d = Math.abs(chart.Y(y) - py);
          if (!best || d < best.d) best = { i, x, y, d };
        });
        if (best) { state.trace = { i: best.i, x }; state.pinned = true; }
        draw();
      }
      cv.addEventListener("mousemove", (e) => {
        if (e.buttons !== 0) return;
        if (state.pinned) return;
        traceAt(e.clientX, e.clientY);
      });
      cv.addEventListener("click", (e) => {
        if (state.dragged) { state.dragged = false; return; }
        state.pinned = false;
        traceAt(e.clientX, e.clientY);
        state.pinned = true;
      });
      let drag = null;
      cv.addEventListener("pointerdown", (e) => {
        drag = { x: e.clientX, y: e.clientY };
        state.dragged = false;
        if (cv.setPointerCapture) { try { cv.setPointerCapture(e.pointerId); } catch (err) { /* jsdom */ } }
      });
      cv.addEventListener("pointermove", (e) => {
        if (!drag) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) < 3) return;
        state.dragged = true;
        const s = chart.span();
        chart.pan(-dx / (chart.w - 2 * chart.o.pad), dy / (chart.h - 2 * chart.o.pad));
        drag = { x: e.clientX, y: e.clientY };
        if (state.trace) state.trace.x = Math.max(chart.o.x0, Math.min(chart.o.x1, state.trace.x));
        draw();
      });
      const endDrag = () => { drag = null; };
      cv.addEventListener("pointerup", endDrag);
      cv.addEventListener("pointerleave", endDrag);
      cv.addEventListener("wheel", (e) => {
        if (e.preventDefault) e.preventDefault();
        const r = cv.getBoundingClientRect();
        const x = chart.invX(e.clientX - r.left), y = chart.invY(e.clientY - r.top);
        chart.zoom(e.deltaY > 0 ? 1.14 : 0.88, x, y);
        draw();
      }, { passive: false });

      $("#gcZin").addEventListener("click", () => { chart.zoom(0.7); draw(); });
      $("#gcZout").addEventListener("click", () => { chart.zoom(1.4); draw(); });
      $("#gcReset").addEventListener("click", () => {
        chart.fit(-8, 8, -6, 6);
        state.trace = null; state.pinned = false;
        draw();
      });
      $("#gcAdd").addEventListener("click", () => addRow(""));
      $("#gcTan").addEventListener("change", (e) => { state.showTangent = e.target.checked; draw(); });
      $("#gcTab").addEventListener("change", (e) => { state.showTable = e.target.checked; draw(); });
      $("#gcA").addEventListener("input", (e) => { state.limit.a = Number(e.target.value); $("#gcAval").textContent = fmt(state.limit.a, 2); draw(); });
      $("#gcEps").addEventListener("input", (e) => { state.limit.eps = Number(e.target.value); $("#gcEpsval").textContent = fmt(state.limit.eps, 2); draw(); });
      $("#gcPresets").addEventListener("click", (e) => {
        const b = e.target.closest(".gc-chip");
        if (!b) return;
        const src = b.dataset.src;
        if (!state.exprs[0].src) state.exprs[0].src = src;
        else if (state.exprs.length < 6) addRow(src);
        else state.exprs[0].src = src;
        detectParams(); paintRows(); paintParams(); draw();
        U.sound.click();
      });
      root.addEventListener("keydown", (e) => {
        if (e.target && /input|textarea/i.test(e.target.tagName)) return;
        const k = e.key;
        if (k === "+" || k === "=") chart.zoom(0.85);
        else if (k === "-" || k === "_") chart.zoom(1.18);
        else if (k === "0") chart.fit(-8, 8, -6, 6);
        else if (k === "ArrowLeft") chart.pan(-0.08, 0);
        else if (k === "ArrowRight") chart.pan(0.08, 0);
        else if (k === "ArrowUp") chart.pan(0, -0.08);
        else if (k === "ArrowDown") chart.pan(0, 0.08);
        else if (k === "t" || k === "T") { state.showTangent = !state.showTangent; const cb = $("#gcTan"); if (cb) cb.checked = state.showTangent; }
        else return;
        e.preventDefault();
        draw();
      });

      detectParams();
      paintRows(); paintParams();
      chart.resize(); draw();
      if (window.addEventListener) window.addEventListener("resize", U.debounce ? U.debounce(draw, 150) : draw);

      /* what the tests (and a future deep link) can reach */
      ML.graphcalc = {
        state,
        draw,
        addRow,
        setExpr(i, src) { state.exprs[i].src = src; detectParams(); paintRows(); paintParams(); draw(); },
        preset(label) {
          const p = PRESETS.find((x) => x.label === label);
          if (p) { this.setExpr(0, p.src); }
        },
        traceAt(i, x) { state.trace = { i, x }; state.pinned = true; draw(); },
        zoomIn: () => { chart.zoom(0.7); draw(); },
        zoomOut: () => { chart.zoom(1.4); draw(); },
        pan: (dx, dy) => { chart.pan(dx, dy); draw(); },
        reset: () => { chart.fit(-8, 8, -6, 6); draw(); },
        window: () => ({ x0: chart.o.x0, x1: chart.o.x1, y0: chart.o.y0, y1: chart.o.y1 }),
        intersections: () => intersections(state._cs || compiled()),
        params: () => Object.keys(state.params),
        pointAt(x) { const c = compiled()[0]; return c && c.f ? c.f(x) : NaN; },
      };
    },
  });

  /* =========================================================
     ML.gcWidget — the compact version of this engine that the
     course lesson pages borrow (the pattern the captured lessons
     use: a figure with parameter drag-sliders, drag-to-trace,
     zoom / reset buttons and a two-sided limit readout).
     ========================================================= */
  const PARAM_RANGE = {
    a: [-3, 3, 0.1, 1], b: [-3, 3, 0.1, 1], c: [-3, 3, 0.1, 1],
    h: [-5, 5, 0.5, 0], k: [-4, 4, 0.5, 0], d: [-4, 4, 0.5, 0],
    p: [-3, 3, 0.1, 1], q: [-3, 3, 0.1, 1], m: [-3, 3, 0.1, 1], n: [-3, 3, 0.1, 1],
  };
  function paramNames(src) {
    const out = [];
    String(src || "").toLowerCase().replace(/[a-z]+/g, (m) => {
      const bare = m.replace(/[0-9]/g, "");
      const known = ["sin", "cos", "tan", "asin", "acos", "atan", "sinh", "cosh", "tanh",
        "sqrt", "abs", "ln", "log", "log2", "exp", "round", "floor", "ceil", "sign",
        "pi", "e", "tau", "x"];
      if (known.indexOf(bare) === -1) for (const ch of bare) if (out.indexOf(ch) === -1 && PARAM_RANGE[ch]) out.push(ch);
      return m;
    });
    return out;
  }
  /* two-sided limit probe shared by the widget */
  function limitProbe(f, a, eps) {
    const safe = (x) => { try { const v = f(x); return isFinite(v) ? v : NaN; } catch (e) { return NaN; } };
    const left = safe(a - eps), right = safe(a + eps), mid = safe(a);
    const nl = safe(a - eps / 10), nr = safe(a + eps / 10);
    const gapFar = isFinite(left) && isFinite(right) ? Math.abs(right - left) : NaN;
    const gapNear = isFinite(nl) && isFinite(nr) ? Math.abs(nr - nl) : NaN;
    const converging = isFinite(gapNear) && (gapNear < 1e-6 || (!isFinite(gapFar) ? false : gapNear < Math.max(1e-6, gapFar / 3)));
    return { left, right, mid, nl, nr, converging, est: (nl + nr) / 2 };
  }

  let wseq = 0;
  ML.gcWidget = function (host, cfg) {
    cfg = cfg || {};
    const id = "gcw" + (++wseq);
    const exprList = cfg.exprs || [{ src: cfg.expr || "a (x - h)^2 + k", color: COLORS[0] }];
    const state = { params: {}, window: cfg.window || null };
    const letters = [];
    exprList.forEach((e) => paramNames(e.src).forEach((k) => { if (letters.indexOf(k) === -1) letters.push(k); }));
    letters.forEach((k) => {
      const r = PARAM_RANGE[k] || [-3, 3, 0.1, 1];
      const given = (cfg.params || {})[k] || {};
      state.params[k] = { min: r[0], max: r[1], step: r[2], value: given.value != null ? given.value : r[3] };
    });
    if (cfg.limit) {
      state.limit = {
        a: Object.assign({ min: -3, max: 3, step: 0.5, value: 1 }, cfg.limit.a || {}),
        eps: Object.assign({ min: 0.1, max: 1, step: 0.1, value: 0.4 }, cfg.limit.eps || {}),
      };
    }
    const lf = () => {
      const extra = {}; Object.keys(state.params).forEach((k) => { extra[k] = state.params[k].value; });
      const c = ML.compile(String(exprList[0].src).replace(/^\s*y\s*=\s*/i, ""), extra);
      return c && c.f ? c.f : null;
    };

    host.innerHTML = `
      <div class="gcw" id="${id}">
        <div class="gcw-host">
          <canvas id="${id}Cv" height="${cfg.height || 260}" aria-label="${(cfg.caption || "Interactive figure").replace(/"/g, "&quot;")}"></canvas>
          <div class="gcw-zoom">
            <button class="btn ghost" data-gcw="in" aria-label="Zoom in">+</button>
            <button class="btn ghost" data-gcw="out" aria-label="Zoom out">−</button>
            <button class="btn ghost" data-gcw="reset" aria-label="Reset view">⟲</button>
          </div>
        </div>
        <div class="gcw-side">
          ${letters.length ? `<div class="gc-sub">Drag a slider</div><div class="gcw-params">${letters.map((k) => `
            <div class="gcw-param">
              <label for="${id}${k}">${k}</label>
              <input type="range" id="${id}${k}" data-k="${k}" min="${state.params[k].min}" max="${state.params[k].max}"
                step="${state.params[k].step}" value="${state.params[k].value}">
              <b data-v="${k}">${U.fmt(state.params[k].value, 2)}</b>
            </div>`).join("")}</div>` : ""}
          ${state.limit ? `<div class="gc-sub">Approach the point</div><div class="gcw-params">
            <div class="gcw-param"><label for="${id}A">a</label>
              <input type="range" id="${id}A" data-lim="a" min="${state.limit.a.min}" max="${state.limit.a.max}" step="${state.limit.a.step}" value="${state.limit.a.value}">
              <b data-la="a">${U.fmt(state.limit.a.value, 2)}</b></div>
            <div class="gcw-param"><label for="${id}E">ε</label>
              <input type="range" id="${id}E" data-lim="eps" min="${state.limit.eps.min}" max="${state.limit.eps.max}" step="${state.limit.eps.step}" value="${state.limit.eps.value}">
              <b data-la="eps">${U.fmt(state.limit.eps.value, 2)}</b></div>
          </div>` : ""}
          <div class="gcw-read" id="${id}Read">${cfg.trace === false ? "" : "Drag across the figure to trace the curve."}</div>
          ${state.limit ? `<div class="gc-limit-out" id="${id}Lim"></div>` : ""}
        </div>
        ${cfg.steps && cfg.steps.length ? `<details class="gcw-steps"><summary>Show the working</summary>
          <ol>${cfg.steps.map((t) => `<li>${t}</li>`).join("")}</ol></details>` : ""}
      </div>`;

    const cv = host.querySelector("#" + id + "Cv");
    const chart = Chart(cv);
    const stageHost = host.querySelector(".gcw-host");
    const stage = ML.stage ? ML.stage.frame(stageHost, { draw: () => draw(), height: (cfg.height || 260) + "px" }) : null;
    if (state.window) chart.fit(state.window[0], state.window[1], state.window[2], state.window[3]);
    const base = { x0: chart.o.x0, x1: chart.o.x1, y0: chart.o.y0, y1: chart.o.y1 };

    function fns() {
      const extra = {}; Object.keys(state.params).forEach((k) => { extra[k] = state.params[k].value; });
      return exprList.map((e) => {
        const c = ML.compile(String(e.src).replace(/^\s*y\s*=\s*/i, ""), extra);
        return { f: c && c.f ? c.f : null, color: e.color || COLORS[0], src: e.src };
      });
    }
    function draw() {
      chart.resize(); chart.clear(); chart.grid();
      const fs = fns();
      fs.forEach((e) => { if (e.f) chart.curve(e.f, e.color, 2.6); });
      if (state.limit) {
        const f = fs[0] && fs[0].f, a = state.limit.a.value, eps = state.limit.eps.value;
        if (f) {
          [[a - eps, "#0f9d94"], [a + eps, "#e8a008"]].forEach(([x, col]) => {
            let y; try { y = f(x); } catch (err) { y = NaN; }
            if (isFinite(y)) chart.dot(x, y, col, 4.5);
          });
          try { const ym = f(a); if (isFinite(ym)) chart.ring(a, ym, "#b0267a"); } catch (err) {}
        }
        paintLimit();
      }
      return chart;
    }
    function paintLimit() {
      const box = host.querySelector("#" + id + "Lim");
      const f = lf(); if (!box) return;
      if (!f) { box.innerHTML = `<div class="gc-lrow">That expression cannot be read.</div>`; return; }
      const a = state.limit.a.value, eps = state.limit.eps.value;
      const r = limitProbe(f, a, eps);
      box.innerHTML = `
        <div class="gc-lrow"><span>from the left · f(${U.fmt(a - eps, 2)})</span><b>${U.fmt(r.left, 3)}</b></div>
        <div class="gc-lrow"><span>at the point · f(${U.fmt(a, 2)})</span><b>${U.fmt(r.mid, 3)}</b></div>
        <div class="gc-lrow"><span>from the right · f(${U.fmt(a + eps, 2)})</span><b>${U.fmt(r.right, 3)}</b></div>
        <div class="gc-lrow gc-lsum"><span>${r.converging ? "the sides meet — limit ≈" : "the sides stay apart — no limit"}</span><b>${r.converging ? U.fmt(r.est, 3) : "—"}</b></div>`;
    }
    function read(x) {
      const fs = fns();
      const vals = fs.map((e) => { if (!e.f) return NaN; try { return e.f(x); } catch (err) { return NaN; } });
      const box = host.querySelector("#" + id + "Read");
      if (box) box.textContent = "x = " + U.fmt(x, 2) + (vals.length ? "   y = " + vals.map((v) => U.fmt(v, 2)).join(", ") : "");
      return vals;
    }
    /* sliders */
    host.querySelectorAll("[data-k]").forEach((s) => s.addEventListener("input", () => {
      const k = s.dataset.k;
      state.params[k].value = parseFloat(s.value);
      const b = host.querySelector(`[data-v="${k}"]`); if (b) b.textContent = U.fmt(state.params[k].value, 2);
      draw();
    }));
    host.querySelectorAll("[data-lim]").forEach((s) => s.addEventListener("input", () => {
      const w = s.dataset.lim;
      state.limit[w].value = parseFloat(s.value);
      const b = host.querySelector(`[data-la="${w}"]`); if (b) b.textContent = U.fmt(state.limit[w].value, 2);
      draw();
    }));
    /* zoom buttons */
    host.querySelectorAll("[data-gcw]").forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.gcw;
      if (k === "in") chart.zoom(0.72); else if (k === "out") chart.zoom(1.38);
      else chart.fit(base.x0, base.x1, base.y0, base.y1);
      draw();
    }));
    /* drag to trace */
    if (cfg.trace !== false) {
      const move = (ev) => {
        const r = cv.getBoundingClientRect();
        const px = (ev && (ev.offsetX != null ? ev.offsetX : ev.clientX - r.left)) || 0;
        read(chart.invX(px));
      };
      cv.addEventListener("pointermove", move);
      cv.addEventListener("mousemove", move);
      cv.addEventListener("touchmove", (ev) => { const t = ev.touches && ev.touches[0]; if (t) move(t); }, { passive: true });
    }
    draw();
    const api = {
      el: host.querySelector("#" + id), chart, draw, state, expr: exprList[0].src,
      setParam(k, v) { if (state.params[k]) { state.params[k].value = v; const s = host.querySelector(`[data-k="${k}"]`); if (s) s.value = String(v); const b = host.querySelector(`[data-v="${k}"]`); if (b) b.textContent = U.fmt(v, 2); draw(); } },
      setLimit(k, v) { if (state.limit && state.limit[k]) { state.limit[k].value = v; draw(); } },
      readAt: (x) => read(x),
      pointAt: (x) => { const f = fns()[0] && fns()[0].f; if (!f) return NaN; try { return f(x); } catch (e) { return NaN; } },
      readout: () => (host.querySelector("#" + id + "Read") || {}).textContent || "",
      limitText: () => (host.querySelector("#" + id + "Lim") || {}).textContent || "",
      window: () => ({ x0: chart.o.x0, x1: chart.o.x1 }),
    };
    host.__gcw = api;
    (ML._gcws = ML._gcws || []).push(api);
    return api;
  };
  ML.limitProbe = limitProbe;
})();

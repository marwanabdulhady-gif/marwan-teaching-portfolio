/* ===========================================================
   MathsLab — graphing tools
   =========================================================== */
(function () {
  "use strict";
  const ML = window.ML, U = ML.u;

  /* ---------------------------------------------------------
     Tiny, safe expression compiler
     supports: + - * / ^ ( ) , numbers, x, pi, e, sin cos tan
     asin acos atan sqrt abs ln log exp round floor ceil, implicit * (2x, 3sin x)
     --------------------------------------------------------- */
  const FUNCS = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan,
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, sqrt: Math.sqrt, abs: Math.abs,
    ln: Math.log, log: Math.log10, log2: Math.log2, exp: Math.exp, round: Math.round,
    floor: Math.floor, ceil: Math.ceil, sign: Math.sign,
  };
  const CONSTS = { pi: Math.PI, e: Math.E, tau: Math.PI * 2 };

  ML.compile = function (src, extraVars) {
    const VARS = Object.assign({ x: 1 }, extraVars || {});
    if (!src || !src.trim()) return { f: null, err: "empty" };
    const s = String(src)
      .toLowerCase()
      .replace(/\u2212/g, "-").replace(/\u00d7/g, "*").replace(/\u00f7/g, "/")
      .replace(/\u03c0/g, "pi");
    let toks = s.match(/\d+(?:\.\d+)?|\.\d+|[a-z]+\d*|[+\-*/^(),]/g);

    // token-level implicit multiplication:  2x · 3(x+1) · (x+1)(x-1) · 2sin x
    const VALUE_END = (t) => t !== undefined && (/\d/.test(t) || t === ")" || VARS[t] !== undefined || CONSTS[t] !== undefined);
    const VALUE_START = (t) => t !== undefined && (/^\d/.test(t) || t === "(" || VARS[t] !== undefined || CONSTS[t] !== undefined || FUNCS[t] !== undefined);
    if (toks) {
      const out = [toks[0]];
      for (let k = 1; k < toks.length; k++) {
        const prev = toks[k - 1], cur = toks[k];
        if (VALUE_END(prev) && VALUE_START(cur)) out.push("*");
        out.push(cur);
      }
      toks = out;
    }
    if (!toks) return { f: null, err: "unreadable" };
    let i = 0;
    const peek = () => toks[i], next = () => toks[i++];

    function expr() {
      let v = term();
      while (peek() === "+" || peek() === "-") { const op = next(); const r = term(); const lv = v; v = op === "+" ? (x) => lv(x) + r(x) : (x) => lv(x) - r(x); }
      return v;
    }
    function term() {
      let v = unary();
      while (peek() === "*" || peek() === "/") { const op = next(); const r = unary(); const lv = v; v = op === "*" ? (x) => lv(x) * r(x) : (x) => lv(x) / r(x); }
      return v;
    }
    function unary() {
      if (peek() === "-") { next(); const v = unary(); return (x) => -v(x); }
      if (peek() === "+") { next(); return unary(); }
      return power();
    }
    function power() {
      const base = primary();
      if (peek() === "^") { next(); const ex = unary(); return (x) => Math.pow(base(x), ex(x)); }
      return base;
    }
    function primary() {
      const t = next();
      if (t === undefined) throw new Error("unexpected end");
      if (t === "(") { const v = expr(); if (next() !== ")") throw new Error("missing )"); return v; }
      if (/^\d/.test(t) || /^\.\d/.test(t)) { const n = parseFloat(t); return () => n; }
      /* the independent variable is the only letter read from the call argument;
         every extra var (parameters a, h, k …) is a fixed value baked in here */
      if (t === "x" || t === "θ") return (x) => x;
      if (VARS[t] !== undefined) {
        const v = VARS[t];
        return typeof v === "function" ? v : () => v;
      }
      if (CONSTS[t] !== undefined) { const c = CONSTS[t]; return () => c; }
      if (FUNCS[t]) {
        let arg;
        if (peek() === "(") { next(); arg = expr(); if (next() !== ")") throw new Error("missing )"); }
        else { if (peek() === "*") next(); arg = unary(); }
        return (x) => FUNCS[t](arg(x));
      }
      throw new Error("unknown \u201c" + t + "\u201d");
    }
    try {
      const f = expr();
      if (i < toks.length) throw new Error("trailing \u201c" + toks.slice(i).join("") + "\u201d");
      f(1); f(0.37);
      return { f, err: null };
    } catch (e) { return { f: null, err: e.message }; }
  };

  /* ---------------------------------------------------------
     Canvas helpers
     --------------------------------------------------------- */
  function fitCanvas(cv) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const r = cv.getBoundingClientRect();
    const w = Math.max(320, Math.round(r.width)), h = Math.max(240, Math.round(r.height || 420));
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    }
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }
  function niceStep(range, target) {
    const raw = range / target;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
    return step * mag;
  }
  ML.plot = { fitCanvas, niceStep };

  /* =========================================================
     FUNCTION GRAPHER  (HU9 Plotter + Handy Graph)
     ========================================================= */
  const PALETTE = ["#6d5efc", "#0f9d94", "#e6459c", "#e8a008", "#2f7cf6", "#e5484d"];
  const DEMOS = [
    { label: "y = x² − 3", exprs: ["x^2-3"] },
    { label: "y = sin(x)", exprs: ["sin(x)"] },
    { label: "y = 2x + 1", exprs: ["2x+1"] },
    { label: "y = 1/x", exprs: ["1/x"] },
    { label: "Compare  x² and 2ˣ", exprs: ["x^2", "2^x"] },
    { label: "y = √x", exprs: ["sqrt(x)"] },
  ];

  ML.register({
    id: "hu9graph", group: "tools", title: "HU9 Graph — Function Plotter",
    short: "Function graph", icon: ML.icon('plot'), color: ["#eeecff", "#4b3ee0"], tag: "Graphing tool",
    blurb: "Plot up to six functions at once, zoom and pan the window, and read values off a live table.",
    tags: ["Handy Graph", "HU9 Plotter", "y = f(x)", "table of values"],
    mount(root) {
      const state = {
        exprs: [{ src: "x^2-3", color: PALETTE[0] }, { src: "sin(x)", color: PALETTE[1] }],
        win: { xmin: -6, xmax: 6, ymin: -5, ymax: 7 },
        grid: true, labels: true, showTable: true,
        tangent: false, tanX: 1,
      };
      const wrap = U.el("div", { class: "app-layout" });
      wrap.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Functions</div>
            <div class="panel-b tight" id="eqList"></div>
            <div class="panel-b tight" style="border-top:1px solid var(--line)">
              <button class="btn ghost sm" id="addEq">${ML.icon("plus")} Add function</button>
              <div class="hr"></div>
              <label class="small muted" style="font-weight:750">Try an example</label>
              <div class="btn-row" id="demos"></div>
              <div class="hr"></div>
              <a class="btn ghost sm" href="#/graphcalc" style="width:100%;justify-content:center">Full calculator: sliders, limits, intersections →</a>
            </div>
          </div>
          <div class="panel">
            <div class="panel-h">Window <button class="btn xs ghost" id="resetWin">Reset</button></div>
            <div class="panel-b tight">
              <div class="row2">
                <div class="field"><label>x min</label><input type="number" id="xmin" value="-6" step="1"></div>
                <div class="field"><label>x max</label><input type="number" id="xmax" value="6" step="1"></div>
                <div class="field"><label>y min</label><input type="number" id="ymin" value="-5" step="1"></div>
                <div class="field"><label>y max</label><input type="number" id="ymax" value="7" step="1"></div>
              </div>
              <button class="btn ghost sm" id="fitBtn">Fit to data</button>
              <label class="check"><input type="checkbox" id="gridChk" checked> Show grid</label>
              <label class="check"><input type="checkbox" id="labelChk" checked> Show axis labels</label>
              <label class="check"><input type="checkbox" id="tableChk" checked> Show table of values</label>
            </div>
          </div>
        </aside>
        <div class="stage">
          <div class="panel" style="overflow:hidden">
            <div class="panel-h">
              <span>Graph</span>
              <span class="btn-row">
                <span class="small muted" id="slopeOut" style="font-weight:700;font-variant-numeric:tabular-nums"></span>
                <button class="btn xs ${"ghost"}" id="tanBtn" title="click the graph to place the tangent point">Tangent</button>
                <button class="btn xs ghost" id="zoomOut" aria-label="Zoom out">${ML.icon("minus")}</button>
                <button class="btn xs ghost" id="zoomIn" aria-label="Zoom in">${ML.icon("plus")}</button>
                <span class="small muted" style="font-weight:600">drag to pan · scroll to zoom · click to inspect</span>
              </span>
            </div>
            <div style="padding:10px;background:linear-gradient(180deg,#fbfcff,#fff)">
              <canvas id="gcv" style="display:block;border-radius:10px;cursor:grab;touch-action:none"></canvas>
            </div>
          </div>
          <div class="card" id="tableCard" style="margin-top:16px;overflow:hidden">
            <div class="card-h"><h2>Table of values</h2><span class="small muted" id="tblNote"></span></div>
            <div class="scroll-x"><table class="data" id="vals"></table></div>
          </div>
        </div>`;
      root.appendChild(wrap);

      const canvas = wrap.querySelector("#gcv");
      /* bounded stage + full-screen switch (see assets/stage.js) */
      if (ML.stage) ML.stage.frame(canvas.parentElement, { draw: () => draw(), height: "clamp(320px, 50vh, 560px)" });
      const eqList = wrap.querySelector("#eqList");
      const tableCard = wrap.querySelector("#tableCard");

      /* --- equation rows --- */
      function renderEqs() {
        eqList.innerHTML = "";
        state.exprs.forEach((e, idx) => {
          const row = U.el("div", { style: { display: "flex", gap: "7px", alignItems: "center" } });
          const sw = U.el("span", { style: { width: "14px", height: "14px", borderRadius: "5px", flex: "none", background: e.color, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)" } });
          const inp = U.el("input", { type: "text", value: e.src, "aria-label": "Function " + (idx + 1), spellcheck: "false", style: { fontFamily: "var(--fm)", fontSize: "13px" } });
          const del = U.el("button", { class: "btn xs ghost", title: "Remove", "aria-label": "Remove function" }, "&#10005;");
          inp.addEventListener("input", () => { e.src = inp.value; draw(); renderTable(); });
          del.addEventListener("click", () => { state.exprs.splice(idx, 1); renderEqs(); draw(); renderTable(); });
          row.append(sw, inp, del);
          eqList.appendChild(row);
          const p = U.el("div", { class: "small", style: { margin: "-4px 0 2px 21px", minHeight: "14px" } });
          const c = ML.compile(e.src);
          p.innerHTML = c.err ? `<span style="color:var(--red)">${ML.icon("warn")} ${c.err}</span>` : `<span class="muted">y = ${e.src.replace(/\*/g, "")}</span>`;
          eqList.appendChild(p);
        });
        if (!state.exprs.length) eqList.innerHTML = `<p class="small muted">No functions yet — add one below.</p>`;
      }
      wrap.querySelector("#addEq").addEventListener("click", () => {
        if (state.exprs.length >= 6) return ML.toast("Six functions is plenty!", "", 1600);
        state.exprs.push({ src: "", color: PALETTE[state.exprs.length % PALETTE.length] });
        renderEqs(); draw();
      });
      const demos = wrap.querySelector("#demos");
      DEMOS.forEach((d) => {
        const b = U.el("button", { class: "btn xs ghost" }, d.label);
        b.addEventListener("click", () => {
          state.exprs = d.exprs.map((src, i) => ({ src, color: PALETTE[i] }));
          renderEqs(); renderTable(); fit();
        });
        demos.appendChild(b);
      });

      /* --- window inputs --- */
      const nums = { xmin: "#xmin", xmax: "#xmax", ymin: "#ymin", ymax: "#ymax" };
      for (const k in nums) {
        wrap.querySelector(nums[k]).addEventListener("change", (ev) => {
          const v = parseFloat(ev.target.value);
          if (isFinite(v)) state.win[k] = v;
          if (state.win.xmin >= state.win.xmax) state.win.xmax = state.win.xmin + 1;
          if (state.win.ymin >= state.win.ymax) state.win.ymax = state.win.ymin + 1;
          syncWinInputs(); draw(); renderTable();
        });
      }
      function syncWinInputs() {
        for (const k in nums) wrap.querySelector(nums[k]).value = +state.win[k].toFixed(4);
      }
      wrap.querySelector("#resetWin").addEventListener("click", () => { state.win = { xmin: -6, xmax: 6, ymin: -5, ymax: 7 }; syncWinInputs(); draw(); renderTable(); });
      wrap.querySelector("#gridChk").addEventListener("change", (e) => { state.grid = e.target.checked; draw(); });
      wrap.querySelector("#labelChk").addEventListener("change", (e) => { state.labels = e.target.checked; draw(); });
      wrap.querySelector("#tableChk").addEventListener("change", (e) => { state.showTable = e.target.checked; tableCard.style.display = state.showTable ? "" : "none"; });
      wrap.querySelector("#zoomIn").addEventListener("click", () => zoom(1 / 1.4));
      wrap.querySelector("#zoomOut").addEventListener("click", () => zoom(1.4));
      wrap.querySelector("#fitBtn").addEventListener("click", fit);
      /* tangent: click anywhere on the graph to read f(x) and f′(x) there */
      const tanBtn = wrap.querySelector("#tanBtn");
      tanBtn.addEventListener("click", () => {
        state.tangent = !state.tangent;
        tanBtn.classList.toggle("soft", state.tangent);
        const out = wrap.querySelector("#slopeOut");
        if (!state.tangent && out) out.textContent = "";
        draw();
      });
      canvas.addEventListener("click", (e) => {
        const r = canvas.getBoundingClientRect();
        const px = e.clientX - r.left;
        const { xmin, xmax } = state.win;
        state.tanX = xmin + (px / Math.max(1, r.width)) * (xmax - xmin);
        if (!state.tangent) {
          state.tangent = true;
          tanBtn.classList.add("soft");
        }
        draw();
      });

      function zoom(factor, cx, cy) {
        const { xmin, xmax, ymin, ymax } = state.win;
        const fxv = cx !== undefined ? cx : (xmin + xmax) / 2;
        const fyv = cy !== undefined ? cy : (ymin + ymax) / 2;
        state.win.xmin = fxv + (xmin - fxv) * factor;
        state.win.xmax = fxv + (xmax - fxv) * factor;
        state.win.ymin = fyv + (ymin - fyv) * factor;
        state.win.ymax = fyv + (ymax - fyv) * factor;
        syncWinInputs(); draw(); renderTable();
      }
      function fit() {
        const ys = [];
        for (const e of state.exprs) {
          const c = ML.compile(e.src); if (!c.f) continue;
          for (let x = -8; x <= 8; x += 0.02) {
            let y; try { y = c.f(x); } catch (err) { y = NaN; }
            if (isFinite(y) && Math.abs(y) < 1e5) ys.push(y);
          }
        }
        if (!ys.length) { state.win = { xmin: -8, xmax: 8, ymin: -5, ymax: 5 }; }
        else {
          ys.sort((a, b) => a - b);
          const q = (p) => ys[Math.floor((ys.length - 1) * p)];
          let lo = Math.min(q(0.02), 0), hi = Math.max(q(0.98), 0);
          if (hi - lo < 1) { lo -= 1; hi += 1; }
          const pad = (hi - lo) * 0.12;
          state.win = { xmin: -8, xmax: 8, ymin: lo - pad, ymax: hi + pad };
        }
        squareWin("x");            /* fit the data, then keep the units square */
        syncWinInputs(); draw(); renderTable();
      }

      /* --- one unit, one size -----------------------------------------
         A window of −6…6 × −5…7 in an 856 × 450 panel gives 70 px per
         x-unit and only 28 px per y-unit: sin(x) flattens and every
         parabola fattens. The window is squared to the panel's aspect
         before it is drawn, and the WINDOW panel is re-synced so the
         numbers on screen are the numbers in the graph. */
      function squareWin(prefer) {
        const r = canvas.getBoundingClientRect();
        const bw = Math.max(200, Math.round(r.width)), bh = Math.max(150, Math.round(r.height));
        const k = bw / bh;
        const w2 = state.win;
        const cx = (w2.xmin + w2.xmax) / 2, cy = (w2.ymin + w2.ymax) / 2;
        const sx = w2.xmax - w2.xmin, sy = w2.ymax - w2.ymin;
        if (!(sx > 0) || !(sy > 0) || !isFinite(k)) return;
        const nice = (v) => {
          const pw = Math.pow(10, Math.floor(Math.log(v) / Math.LN10));
          const f = v / pw;
          return (f < 1.15 ? 1 : f < 1.4 ? 1.25 : f < 1.75 ? 1.5 : f < 2.2 ? 2 : f < 2.7 ? 2.5 : f < 3.5 ? 3 : f < 4.5 ? 4 : f < 5.5 ? 5 : f < 6.5 ? 6 : f < 7.5 ? 7 : f < 8.5 ? 8 : f < 9.5 ? 9 : 10) * pw;
        };
        if (prefer === "x") {
          const nx = nice(sy * k);           /* keep y, widen/narrow x */
          w2.xmin = cx - nx / 2; w2.xmax = cx + nx / 2;
        } else {
          const ny = nice(sx / k);           /* keep x, fit y to the panel */
          w2.ymin = cy - ny / 2; w2.ymax = cy + ny / 2;
        }
      }

      /* --- drawing --- */
      function draw() {
        const { ctx, w, h } = fitCanvas(canvas);
        const { xmin, xmax, ymin, ymax } = state.win;
        const X = (x) => ((x - xmin) / (xmax - xmin)) * w;
        const Y = (y) => h - ((y - ymin) / (ymax - ymin)) * h;
        ctx.clearRect(0, 0, w, h);

        /* grid */
        if (state.grid) {
          const sx = niceStep(xmax - xmin, w / 80), sy = niceStep(ymax - ymin, h / 60);
          ctx.lineWidth = 1;
          ctx.strokeStyle = "#e9edf5";
          ctx.beginPath();
          for (let x = Math.ceil(xmin / sx) * sx; x <= xmax; x += sx) { ctx.moveTo(Math.round(X(x)) + .5, 0); ctx.lineTo(Math.round(X(x)) + .5, h); }
          for (let y = Math.ceil(ymin / sy) * sy; y <= ymax; y += sy) { ctx.moveTo(0, Math.round(Y(y)) + .5); ctx.lineTo(w, Math.round(Y(y)) + .5); }
          ctx.stroke();
        }
        /* axes */
        ctx.strokeStyle = "#98a2b3"; ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (xmin <= 0 && xmax >= 0) { ctx.moveTo(X(0), 0); ctx.lineTo(X(0), h); }
        if (ymin <= 0 && ymax >= 0) { ctx.moveTo(0, Y(0)); ctx.lineTo(w, Y(0)); }
        ctx.stroke();

        /* tick labels */
        if (state.labels) {
          ctx.font = "600 11px " + getComputedStyle(document.body).fontFamily;
          ctx.fillStyle = "#667085";
          const sx = niceStep(xmax - xmin, w / 80), sy = niceStep(ymax - ymin, h / 60);
          const ay = U.clamp(Y(0), 12, h - 5), ax = U.clamp(X(0), 26, w - 30);
          ctx.textAlign = "center"; ctx.textBaseline = "top";
          for (let x = Math.ceil(xmin / sx) * sx; x <= xmax; x += sx) {
            if (Math.abs(x) < 1e-9) continue;
            if (X(x) > w - 30) continue;
            ctx.fillText(U.fmt(x, 4), X(x), ay + 4);
          }
          ctx.textAlign = "right"; ctx.textBaseline = "middle";
          for (let y = Math.ceil(ymin / sy) * sy; y <= ymax; y += sy) {
            if (Math.abs(y) < 1e-9) continue;
            const yy = Y(y);
            if (yy < 10 || yy > h - 6) continue;
            ctx.fillText(U.fmt(y, 4), ax - 6, yy);
          }
          ctx.textAlign = "left"; ctx.textBaseline = "top";
          ctx.font = "italic 800 13px " + getComputedStyle(document.body).fontFamily;
          ctx.fillStyle = "#475467";
          ctx.fillText("x", w - 12, U.clamp(ay + 3, 4, h - 18));
          ctx.fillText("y", ax + 7, 7);
        }

        /* curves */
        state.exprs.forEach((e) => {
          const c = ML.compile(e.src); if (!c.f) return;
          ctx.strokeStyle = e.color; ctx.lineWidth = 2.4; ctx.lineJoin = "round";
          ctx.beginPath();
          let pen = false, prevY = null;
          const N = Math.min(2200, Math.max(600, w * 2));
          for (let i = 0; i <= N; i++) {
            const x = xmin + ((xmax - xmin) * i) / N;
            let y;
            try { y = c.f(x); } catch (err) { y = NaN; }
            if (!isFinite(y) || Math.abs(y) > 1e7) { pen = false; prevY = null; continue; }
            const px = X(x), py = Y(y);
            /* break on asymptotes */
            if (prevY !== null && Math.abs(py - prevY) > h * 1.6) pen = false;
            if (!pen) { ctx.moveTo(px, py); pen = true; } else ctx.lineTo(px, py);
            prevY = py;
          }
          ctx.stroke();
          /* endpoint dot */
          const xL = xmax, yL = c.f(xL);
          if (isFinite(yL) && Y(yL) > -20 && Y(yL) < h + 20) {
            ctx.fillStyle = e.color; ctx.beginPath(); ctx.arc(X(xL), Y(yL), 3.2, 0, Math.PI * 2); ctx.fill();
          }
        });

        /* tangent + derivative read-out at state.tanX */
        if (state.tangent) {
          const e = state.exprs[0], c = e && ML.compile(e.src);
          if (c && c.f) {
            const f = c.f, x0 = state.tanX;
            let y0; try { y0 = f(x0); } catch (err) { y0 = NaN; }
            const hstep = 1e-5;
            let y1, y0m;
            try { y1 = f(x0 + hstep); y0m = f(x0 - hstep); } catch (err) { y1 = y0m = NaN; }
            const m = (y1 - y0m) / (2 * hstep);
            if (isFinite(y0) && isFinite(m)) {
              ctx.save();
              ctx.strokeStyle = "#e5484d"; ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(X(xmin), Y(y0 + m * (xmin - x0)));
              ctx.lineTo(X(xmax), Y(y0 + m * (xmax - x0)));
              ctx.stroke();
              ctx.setLineDash([4, 4]); ctx.strokeStyle = "#cfd4dc"; ctx.lineWidth = 1;
              ctx.beginPath(); ctx.moveTo(X(x0), Y(0)); ctx.lineTo(X(x0), Y(y0)); ctx.stroke();
              ctx.setLineDash([]);
              ctx.fillStyle = "#e5484d";
              ctx.beginPath(); ctx.arc(X(x0), Y(y0), 4.4, 0, Math.PI * 2); ctx.fill();
              const lbl = "(" + U.fmt(x0, 2) + ", " + U.fmt(y0, 2) + ")   f′ = " + U.fmt(m, 2);
              ctx.font = "700 12px " + getComputedStyle(document.body).fontFamily;
              const tw = ctx.measureText(lbl).width;
              const bx = U.clamp(X(x0) + 12, 6, Math.max(6, w - tw - 14));
              const by = U.clamp(Y(y0) - 26, 4, h - 22);
              ctx.fillStyle = "rgba(255,255,255,.94)";
              ctx.fillRect(bx - 5, by - 2, tw + 10, 19);
              ctx.fillStyle = "#b0262a";
              ctx.textAlign = "left"; ctx.textBaseline = "top";
              ctx.fillText(lbl, bx, by + 1);
              ctx.restore();
              const out = wrap.querySelector("#slopeOut");
              if (out) out.textContent = "f(" + U.fmt(x0, 2) + ") = " + U.fmt(y0, 2) + "   ·   f′ = " + U.fmt(m, 2);
            }
          }
        }
      }

      /* --- table --- */
      function renderTable() {
        const tbl = wrap.querySelector("#vals");
        const stepRaw = (state.win.xmax - state.win.xmin) / 12;
        const step = niceStep(state.win.xmax - state.win.xmin, 12);
        const compiled = state.exprs.map((e) => ML.compile(e.src).f);
        let head = "<tr><th>x</th>" + state.exprs.map((e, i) => `<th style="color:${e.color}">f${i + 1}(x)</th>`).join("") +
          (compiled[0] ? '<th style="color:#b0262a">f₁′(x)</th>' : "") + "</tr>";
        let rows = "";
        const start = Math.ceil(state.win.xmin / step) * step;
        for (let x = start; x <= state.win.xmax + 1e-9; x += step) {
          const xx = Math.abs(x) < 1e-9 ? 0 : x;
          rows += `<tr><td class="mono">${U.fmt(xx, 4)}</td>` +
            compiled.map((f) => {
              if (!f) return "<td>—</td>";
              let y; try { y = f(xx); } catch (e) { y = NaN; }
              return `<td class="mono">${isFinite(y) ? U.fmt(y, 4) : "—"}</td>`;
            }).join("") +
            (compiled[0] ? (() => {
              let m = NaN;
              try { const hh = 1e-5; m = (compiled[0](xx + hh) - compiled[0](xx - hh)) / (2 * hh); } catch (e) { m = NaN; }
              return `<td class="mono" style="color:#b0262a">${isFinite(m) ? U.fmt(m, 4) : "—"}</td>`;
            })() : "") + "</tr>";
        }
        tbl.innerHTML = head + rows;
        wrap.querySelector("#tblNote").textContent = `step ${U.fmt(step, 4)}`;
      }

      /* --- pan / zoom --- */
      let drag = null;
      canvas.addEventListener("pointerdown", (e) => {
        drag = { x: e.clientX, y: e.clientY, win: Object.assign({}, state.win) };
        canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing";
      });
      canvas.addEventListener("pointermove", (e) => {
        if (!drag) return;
        const r = canvas.getBoundingClientRect();
        const dx = ((e.clientX - drag.x) / r.width) * (drag.win.xmax - drag.win.xmin);
        const dy = ((e.clientY - drag.y) / r.height) * (drag.win.ymax - drag.win.ymin);
        state.win.xmin = drag.win.xmin - dx; state.win.xmax = drag.win.xmax - dx;
        state.win.ymin = drag.win.ymin + dy; state.win.ymax = drag.win.ymax + dy;
        draw();
      });
      canvas.addEventListener("pointerup", () => { drag = null; canvas.style.cursor = "grab"; syncWinInputs(); renderTable(); });
      canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        const r = canvas.getBoundingClientRect();
        const fx = (e.clientX - r.left) / r.width, fy = 1 - (e.clientY - r.top) / r.height;
        const cx = state.win.xmin + fx * (state.win.xmax - state.win.xmin);
        const cy = state.win.ymin + fy * (state.win.ymax - state.win.ymin);
        zoom(e.deltaY > 0 ? 1.12 : 1 / 1.12, cx, cy);
      }, { passive: false });

      const reflow = U.debounce(() => { squareWin("y"); syncWinInputs(); draw(); }, 120);
      window.addEventListener("resize", reflow);

      squareWin("y");
      renderEqs(); syncWinInputs(); draw(); renderTable();
      /* the first pass ran before the panel had its real width, so square
         the window again once it is laid out */
      const settle = () => { squareWin("y"); syncWinInputs(); draw(); };
      if (window.requestAnimationFrame) { requestAnimationFrame(() => requestAnimationFrame(settle)); }
      else setTimeout(settle, 60);
    },
  });

  /* =========================================================
     POLAR GRAPHER  (Polar Graphs.xlsx)
     ========================================================= */
  const POLAR_PRESETS = [
    { name: "Rose  r = cos(3θ)", expr: "cos(3*theta)", max: 360 },
    { name: "Cardioid  r = 1 + cos θ", expr: "1+cos(theta)", max: 360 },
    { name: "Limaçon  r = 1 + 2cos θ", expr: "1+2*cos(theta)", max: 360 },
    { name: "Spiral  r = θ", expr: "theta", max: 720, unit: "rad" },
    { name: "Circle  r = 2", expr: "2", max: 360 },
    { name: "Lemniscate  r = √(4cos2θ)", expr: "sqrt(4*cos(2*theta))", max: 360 },
    { name: "Rose  r = sin(4θ)", expr: "sin(4*theta)", max: 360 },
  ];

  ML.register({
    id: "polar", group: "tools", title: "Polar Graph Plotter",
    short: "Polar graph", icon: ML.icon('polar'), color: ["#e0f7f5", "#0b7a73"], tag: "Graphing tool",
    blurb: "Sketch curves in the form r(θ) on a polar grid — roses, cardioids and spirals — with a live value table.",
    tags: ["Polar Graphs.xlsx", "r = f(θ)", "petals", "radians"],
    mount(root) {
      const st = { expr: "cos(3*theta)", min: 0, max: 360, unit: "deg", step: 2, grid: true, fill: false, animate: false, piLabels: true };
      const wrap = U.el("div", { class: "app-layout" });
      wrap.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Curve</div>
            <div class="panel-b tight">
              <div class="field">
                <label>r = f(θ)</label>
                <input type="text" id="pexpr" value="cos(3*theta)" spellcheck="false" style="font-family:var(--fm)">
                <span class="small muted">Use <span class="kbd">theta</span> (or <span class="kbd">t</span>) as the angle.</span>
              </div>
              <div class="seg" id="unitSeg">
                <button data-u="deg" class="on">Degrees</button><button data-u="rad">Radians</button>
              </div>
              <div class="row2">
                <div class="field"><label>θ from <span class="val" id="minV">0</span></label><input type="range" id="pmin" min="0" max="720" step="5" value="0"></div>
                <div class="field"><label>θ to <span class="val" id="maxV">360</span></label><input type="range" id="pmax" min="30" max="1440" step="5" value="360"></div>
              </div>
              <label class="check"><input type="checkbox" id="pfill"> Shade the area swept</label>
              <label class="check"><input type="checkbox" id="pgrid" checked> Polar grid</label>
              <label class="check"><input type="checkbox" id="plabels" checked> Label angles</label>
              <button class="btn sm" id="panim">${ML.icon("play")} Trace the curve</button>
            </div>
          </div>
          <div class="panel">
            <div class="panel-h">Standard curves</div>
            <div class="panel-b tight" id="presets"></div>
          </div>
        </aside>
        <div class="stage">
          <div class="panel" style="overflow:hidden">
            <div class="panel-h"><span>Polar grid</span><span class="small muted" id="pstatus"></span></div>
            <div style="padding:10px;background:linear-gradient(180deg,#fbfdff,#fff)">
              <canvas id="pcv" style="display:block;border-radius:10px"></canvas>
            </div>
          </div>
          <div class="card" style="margin-top:16px;overflow:hidden">
            <div class="card-h"><h2>Table of values</h2><span class="small muted">θ in degrees · r to 3 d.p.</span></div>
            <div class="scroll-x"><table class="data" id="ptable"></table></div>
          </div>
        </div>`;
      root.appendChild(wrap);
      const cv = wrap.querySelector("#pcv");
      if (ML.stage) ML.stage.frame(cv.parentElement, { draw: () => drawAll(), height: "clamp(320px, 54vh, 620px)" });
      const presets = wrap.querySelector("#presets");
      POLAR_PRESETS.forEach((p) => {
        const b = U.el("button", { class: "btn ghost sm", style: { justifyContent: "flex-start" } }, p.name);
        b.addEventListener("click", () => {
          st.expr = p.expr;
          wrap.querySelector("#pexpr").value = p.expr;
          if (p.unit === "rad") setUnit("rad"); else setUnit("deg");
          st.min = 0;
          st.max = p.unit === "rad" ? Math.PI * 4 : p.max;
          const slider = wrap.querySelector("#pmax");
          slider.max = st.unit === "rad" ? (Math.PI * 8).toFixed(2) : 1440;
          slider.step = st.unit === "rad" ? "0.01" : "5";
          slider.value = st.max;
          wrap.querySelector("#pmin").max = slider.max;
          wrap.querySelector("#pmin").value = 0;
          updateRangeLabels();
          drawAll();
        });
        presets.appendChild(b);
      });

      function setUnit(u) {
        st.unit = u;
        U.$$("#unitSeg button", wrap).forEach((b) => b.classList.toggle("on", b.dataset.u === u));
        if (u === "rad") { st.min = 0; st.max = 6.2832; wrap.querySelector("#pmax").min = 1; wrap.querySelector("#pmax").max = 25.13; wrap.querySelector("#pmax").step = 0.1; wrap.querySelector("#pmax").value = 6.28; }
        else { st.min = 0; st.max = 360; wrap.querySelector("#pmax").min = 30; wrap.querySelector("#pmax").max = 1440; wrap.querySelector("#pmax").step = 5; wrap.querySelector("#pmax").value = 360; }
        updateRangeLabels();
      }
      function updateRangeLabels() {
        wrap.querySelector("#minV").textContent = st.unit === "rad" ? U.fmt(st.min / Math.PI, 2) + "π" : U.fmt(st.min, 0) + "°";
        wrap.querySelector("#maxV").textContent = st.unit === "rad" ? U.fmt(st.max / Math.PI, 2) + "π" : U.fmt(st.max, 0) + "°";
      }
      U.$$("#unitSeg button", wrap).forEach((b) => b.addEventListener("click", () => { setUnit(b.dataset.u); drawAll(); }));
      wrap.querySelector("#pexpr").addEventListener("input", (e) => { st.expr = e.target.value; drawAll(); });
      wrap.querySelector("#pmin").addEventListener("input", (e) => { st.min = +e.target.value; updateRangeLabels(); drawAll(); });
      wrap.querySelector("#pmax").addEventListener("input", (e) => { st.max = +e.target.value; updateRangeLabels(); drawAll(); });
      wrap.querySelector("#pgrid").addEventListener("change", (e) => { st.grid = e.target.checked; drawAll(); });
      wrap.querySelector("#plabels").addEventListener("change", (e) => { st.piLabels = e.target.checked; drawAll(); });
      wrap.querySelector("#pfill").addEventListener("change", (e) => { st.fill = e.target.checked; drawAll(); });

      function compilePolar() {
        return ML.compile(st.expr || "", { theta: 1, t: 1 });
      }
      const toDeg = (th) => (st.unit === "rad" ? th * 180 / Math.PI : th);
      const toRad = (th) => (st.unit === "rad" ? th : th * Math.PI / 180);

      function drawAll() {
        const { ctx, w, h } = fitCanvas(cv);
        const cx = w / 2, cy = h / 2;
        const compiled = compilePolar();
        const pretty = (st.expr || "").replace(/theta|\bt\b/g, "θ").replace(/(\d)\s*θ/g, "$1θ").replace(/\*/g, "");
        wrap.querySelector("#pstatus").innerHTML = compiled.err
          ? `<span style="color:var(--red)">${ML.icon("warn")} ${compiled.err}</span>`
          : `<span class="mono" style="text-transform:none;letter-spacing:0;color:var(--ink-2)">r = ${pretty || "…"}</span>`;
        ctx.clearRect(0, 0, w, h);

        /* find max |r| for scale */
        let rmax = 0.5;
        if (compiled.f) {
          const lo = toRad(st.min), hi = toRad(st.max);
          for (let i = 0; i <= 720; i++) {
            const th = lo + (hi - lo) * i / 720;
            let r; try { r = compiled.f(th); } catch (e) { r = NaN; }
            if (isFinite(r)) rmax = Math.max(rmax, Math.abs(r));
          }
        }
        const R = (Math.min(w, h) / 2 - 26) / rmax;

        ctx.lineWidth = 1;
        if (st.grid) {
          ctx.strokeStyle = "#e6ebf4";
          const rings = 4;
          for (let i = 1; i <= rings; i++) {
            ctx.beginPath(); ctx.arc(cx, cy, (R * rmax * i) / rings, 0, Math.PI * 2); ctx.stroke();
          }
          for (let a = 0; a < 360; a += 15) {
            const rad = a * Math.PI / 180;
            ctx.beginPath(); ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(rad) * R * rmax, cy - Math.sin(rad) * R * rmax);
            ctx.strokeStyle = a % 90 === 0 ? "#d5dce8" : "#eef2f8";
            ctx.stroke();
          }
        }
        /* labels */
        if (st.piLabels) {
          ctx.fillStyle = "#7c8698"; ctx.font = "600 11px " + getComputedStyle(document.body).fontFamily;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          [[0, "0°"], [90, "90°"], [180, "180°"], [270, "270°"]].forEach(([a, t]) => {
            const rad = a * Math.PI / 180;
            ctx.fillText(t, cx + Math.cos(rad) * (R * rmax + 16), cy - Math.sin(rad) * (R * rmax + 16));
          });
          /* scale label */
          ctx.textAlign = "left"; ctx.fillStyle = "#98a2b3";
          ctx.fillText("r = " + U.fmt(rmax, 2), cx + 6, 15);
        }
        if (!compiled.f) return;

        const lo = toRad(st.min), hi = toRad(st.max);
        const N = Math.min(4000, Math.max(600, Math.round(Math.abs(hi - lo) * 220)));
        const pts = [];
        for (let i = 0; i <= N; i++) {
          const th = lo + (hi - lo) * i / N;
          let r; try { r = compiled.f(th); } catch (e) { r = NaN; }
          if (!isFinite(r) || Math.abs(r) > 1e4) { pts.push(null); continue; }
          pts.push([cx + Math.cos(th) * r * R, cy - Math.sin(th) * r * R, th, r]);
        }
        if (st.fill) {
          ctx.beginPath(); ctx.moveTo(cx, cy);
          pts.forEach((p) => p && ctx.lineTo(p[0], p[1]));
          ctx.closePath();
          ctx.fillStyle = "rgba(15,157,148,.12)"; ctx.fill();
        }
        ctx.strokeStyle = "#0f9d94"; ctx.lineWidth = 2.6; ctx.lineJoin = "round";
        ctx.beginPath();
        let pen = false;
        for (const p of pts) {
          if (!p) { pen = false; continue; }
          if (!pen) { ctx.moveTo(p[0], p[1]); pen = true; } else ctx.lineTo(p[0], p[1]);
        }
        ctx.stroke();
        /* moving tip */
        const last = [...pts].reverse().find((p) => p);
        if (last) {
          ctx.fillStyle = "#fff"; ctx.strokeStyle = "#0f9d94"; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(last[0], last[1], 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
        renderTable(compiled);
      }

      function renderTable(compiled) {
        const tbl = wrap.querySelector("#ptable");
        const span = st.max - st.min;
        const stepDeg = span <= 30 ? 5 : span <= 180 ? 15 : span <= 400 ? 30 : 45;
        const stepAng = st.unit === "rad" ? (stepDeg * Math.PI / 180) : stepDeg;
        let head = `<tr><th>θ</th><th>r = f(θ)</th><th>x = r cos θ</th><th>y = r sin θ</th></tr>`, body = "";
        for (let th = st.min; th <= st.max + 1e-9; th += stepAng) {
          const rad = toRad(th);
          let r = NaN; try { r = compiled.f ? compiled.f(rad) : NaN; } catch (e) {}
          body += `<tr><td class="mono">${U.fmt(toDeg(th), 1)}°</td><td class="mono">${isFinite(r) ? U.fmt(r, 3) : "—"}</td>` +
            `<td class="mono">${isFinite(r) ? U.fmt(r * Math.cos(rad), 3) : "—"}</td>` +
            `<td class="mono">${isFinite(r) ? U.fmt(r * Math.sin(rad), 3) : "—"}</td></tr>`;
        }
        tbl.innerHTML = head + body;
      }

      wrap.querySelector("#panim").addEventListener("click", () => {
        const btn = wrap.querySelector("#panim");
        btn.disabled = true;
        const { ctx, w, h } = fitCanvas(cv);
        const compiled = compilePolar();
        if (!compiled.f) { btn.disabled = false; return; }
        const lo = toRad(st.min), hi = toRad(st.max);
        let rmax = 0.5;
        for (let i = 0; i <= 720; i++) { let r; try { r = compiled.f(lo + (hi - lo) * i / 720); } catch (e) { r = NaN; } if (isFinite(r)) rmax = Math.max(rmax, Math.abs(r)); }
        const R = (Math.min(w, h) / 2 - 26) / rmax, cx = w / 2, cy = h / 2;
        let t0 = performance.now(), dur = 1800;
        function frame(now) {
          const k = Math.min(1, (now - t0) / dur);
          const upto = lo + (hi - lo) * k;
          drawAll();
          /* redraw with a clip by overdrawing white? simpler: draw trace on top */
          ctx.strokeStyle = "#ffb020"; ctx.lineWidth = 3; ctx.beginPath();
          let pen = false;
          for (let i = 0; i <= 500 * k; i++) {
            const th = lo + (upto - lo) * (i / Math.max(1, 500 * k));
            let r; try { r = compiled.f(th); } catch (e) { r = NaN; }
            if (!isFinite(r)) { pen = false; continue; }
            const px = cx + Math.cos(th) * r * R, py = cy - Math.sin(th) * r * R;
            if (!pen) { ctx.moveTo(px, py); pen = true; } else ctx.lineTo(px, py);
          }
          ctx.stroke();
          if (k < 1) requestAnimationFrame(frame); else { btn.disabled = false; drawAll(); }
        }
        requestAnimationFrame(frame);
      });

      const reflow = U.debounce(drawAll, 140);
      window.addEventListener("resize", reflow);
      drawAll();
    },
  });
})();

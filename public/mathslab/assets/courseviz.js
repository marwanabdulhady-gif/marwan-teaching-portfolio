/* ===========================================================
   MathsLab — course visuals
   One live figure per course, sitting at the top of the course
   page. Each one is a canvas + sliders that shows the idea the
   course keeps coming back to:

     Algebra 1    y = a(x − h)² + k, with vertex, axis and roots
     Course 2     y = b^x and its inverse y = log_b x
     Course 1     a circle and the sphere it sweeps out
     Precalculus  a·f(b(x − h)) + k against the parent f
     Calculus     the tangent slope at a point you drag
     Exam prep    a score, its band, and the gap to the pass mark

   Everything is drawn locally, no network, no libraries.
   =========================================================== */
(function () {
  "use strict";
  const ML = (window.ML = window.ML || {});
  const U = ML.u || {};
  /* rAF with a timer fallback, so the figure also runs where rAF is absent */
  const raf = (cb) => (window.requestAnimationFrame ? window.requestAnimationFrame(cb) : setTimeout(cb, 16));

  /* ---------------- a very small plot ---------------- */
  function Plot(cv, opts) {
    const ctx = cv.getContext ? cv.getContext("2d") : null;
    const o = Object.assign({ x0: -6, x1: 6, y0: -6, y1: 6, pad: 26 }, opts || {});
    const p = { cv, ctx, o };

    p.resize = function () {
      /* the BOX decides the size. Measuring the box (never the canvas
         attribute) is what stops the replaced-element aspect ratio from
         stretching the graph — and the page under it — on first paint. */
      const host = cv.parentElement;
      const w = Math.round(cv.clientWidth || (host && host.clientWidth) || 520);
      const h = Math.round(cv.clientHeight || (host && host.clientHeight) || 360);
      const dpr = window.devicePixelRatio || 1;
      p.w = w; p.h = h;
      /* square units: the figure must not be squashed by a wide box */
      if (ML.stage && ML.stage.square) ML.stage.square(o, w, h, o.pad);
      if (!ctx) return p;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return p;
    };
    p.X = (x) => o.pad + ((x - o.x0) / (o.x1 - o.x0)) * (p.w - 2 * o.pad);
    p.Y = (y) => p.h - o.pad - ((y - o.y0) / (o.y1 - o.y0)) * (p.h - 2 * o.pad);
    p.clear = function () { if (ctx) ctx.clearRect(0, 0, p.w, p.h); return p; };
    p.axes = function () {
      if (!ctx) return p;
      /* when square units widen the window, thin the grid to match */
      const niceS = (raw) => {
        const pw = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
        const f = raw / pw;
        return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * pw;
      };
      const spanX = o.x1 - o.x0;
      const step = o.step && spanX <= 20 ? o.step : niceS(spanX / 8);
      /* grid lines start on a multiple of the step, not on the window edge */
      const gx0 = Math.ceil(o.x0 / step) * step;
      const gy0 = Math.ceil(o.y0 / step) * step;
      ctx.strokeStyle = "#eef0f4"; ctx.lineWidth = 1;
      for (let x = gx0; x <= o.x1; x += step) {
        ctx.beginPath(); ctx.moveTo(p.X(x), o.pad); ctx.lineTo(p.X(x), p.h - o.pad); ctx.stroke();
      }
      for (let y = gy0; y <= o.y1; y += step) {
        ctx.beginPath(); ctx.moveTo(o.pad, p.Y(y)); ctx.lineTo(p.w - o.pad, p.Y(y)); ctx.stroke();
      }
      ctx.strokeStyle = "#cfd4dc"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(o.pad, p.Y(0)); ctx.lineTo(p.w - o.pad, p.Y(0)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.X(0), o.pad); ctx.lineTo(p.X(0), p.h - o.pad); ctx.stroke();
      ctx.fillStyle = "#98a2b3";
      ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
      for (let x = gx0; x <= o.x1; x += step * 2) {
        if (Math.abs(x) < 1e-9) continue;
        const lbl = Math.abs(step % 1) > 1e-9 ? String(Math.round(x * 100) / 100) : String(Math.round(x));
        ctx.fillText(lbl, p.X(x) - 4, p.Y(0) + 14);
      }
      return p;
    };
    p.curve = function (f, color, width, dash) {
      if (!ctx) return p;
      ctx.save();
      ctx.strokeStyle = color || "#4b3ee0";
      ctx.lineWidth = width || 2.5;
      if (dash) ctx.setLineDash(dash);
      ctx.beginPath();
      let pen = false;
      const N = 600;
      for (let i = 0; i <= N; i++) {
        const x = o.x0 + ((o.x1 - o.x0) * i) / N;
        let y;
        try { y = f(x); } catch (e) { y = NaN; }
        if (!isFinite(y) || Math.abs(y) > 1e4) { pen = false; continue; }
        const px = p.X(x), py = p.Y(y);
        if (!pen) { ctx.moveTo(px, py); pen = true; } else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
      return p;
    };
    p.line = function (x0, y0, x1, y1, color, width, dash) {
      if (!ctx) return p;
      ctx.save();
      ctx.strokeStyle = color; ctx.lineWidth = width || 2;
      if (dash) ctx.setLineDash(dash);
      ctx.beginPath(); ctx.moveTo(p.X(x0), p.Y(y0)); ctx.lineTo(p.X(x1), p.Y(y1)); ctx.stroke();
      ctx.restore();
      return p;
    };
    p.dot = function (x, y, color, r) {
      if (!ctx) return p;
      ctx.beginPath(); ctx.arc(p.X(x), p.Y(y), r || 5, 0, Math.PI * 2);
      ctx.fillStyle = color || "#4b3ee0"; ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
      return p;
    };
    p.ring = function (x, y, color, r) {
      if (!ctx) return p;
      ctx.beginPath(); ctx.arc(p.X(x), p.Y(y), r || 7, 0, Math.PI * 2);
      ctx.strokeStyle = color || "#e5484d"; ctx.lineWidth = 2.5; ctx.stroke();
      return p;
    };
    p.text = function (x, y, s, color, font) {
      if (!ctx) return p;
      ctx.fillStyle = color || "#475467";
      ctx.font = font || "600 12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(s, p.X(x), p.Y(y));
      return p;
    };
    p.band = function (x0, x1, color) {
      if (!ctx) return p;
      ctx.fillStyle = color;
      ctx.fillRect(p.X(x0), o.pad, p.X(x1) - p.X(x0), p.h - 2 * o.pad);
      return p;
    };
    return p.resize();
  }

  const num = (x, d) => {
    const v = Math.abs(x) < 1e-10 ? 0 : x;
    const r = Math.round(v * Math.pow(10, d == null ? 2 : d)) / Math.pow(10, d == null ? 2 : d);
    return String(r).replace("-", "−");
  };

  /* ---------------- control helpers ---------------- */
  function slider(host, label, min, max, step, value, onInput, fmt) {
    const row = document.createElement("label");
    row.className = "cv-sl";
    row.innerHTML = `<span class="cv-sl-l">${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}"><b class="cv-sl-v">${fmt ? fmt(value) : value}</b>`;
    const inp = row.querySelector("input"), out = row.querySelector("b");
    inp.addEventListener("input", () => {
      const v = Number(inp.value);
      out.textContent = fmt ? fmt(v) : v;
      onInput(v);
    });
    host.appendChild(row);
    return inp;
  }
  function segRow(host, items, value, onPick) {
    const row = document.createElement("div");
    row.className = "cv-seg";
    row.innerHTML = items.map((it) => `<button type="button" data-v="${it.v}" class="${String(it.v) === String(value) ? "on" : ""}">${it.label}</button>`).join("");
    row.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      row.querySelectorAll("button").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      onPick(b.dataset.v);
    }));
    host.appendChild(row);
    return row;
  }
  /* move a range input the way a finger would, so its own input handler runs */
  function setRange(inp, v) {
    if (!inp) return;
    inp.value = String(v);
    inp.dispatchEvent(new Event("input", { bubbles: true }));
  }

  /* An animation button. tick(f) gets f = 0…1 over opts.ms milliseconds;
     looping by default, one pass when opts.once is set. */
  function playBtn(host, label, tick, opts) {
    opts = opts || {};
    const ms = opts.ms || 4200;
    const row = document.createElement("div");
    row.className = "cv-btnrow cv-play";
    row.innerHTML = '<button type="button" class="btn sm" data-play>' + label + '</button>' +
      '<span class="cv-note cv-playnote"></span>';
    host.appendChild(row);
    const btn = row.querySelector("[data-play]");
    const note = row.querySelector(".cv-playnote");
    const now = () => (window.performance && window.performance.now ? window.performance.now() : Date.now());
    let on = false, t0 = 0;
    const loop = (ts) => {
      if (!on) return;
      const t = ts == null ? now() : ts;
      if (!t0) t0 = t;
      const f = Math.min(1, (t - t0) / ms);
      tick(opts.once ? f : Math.min(0.9999, f));
      if (opts.once && f >= 1) {
        on = false;
        btn.textContent = label;
        note.textContent = opts.endNote || "";
        return;
      }
      raf(loop);
    };
    btn.addEventListener("click", () => {
      on = !on;
      btn.textContent = on ? "❚❚ pause" : label;
      if (on) {
        t0 = 0;
        if (opts.once) note.textContent = "";
        raf(loop);
      }
    });
    return { btn, note, stop() { on = false; btn.textContent = label; } };
  }

  function shell(host, eyebrow, title, blurb, readText) {
    host.innerHTML = `
      <header class="co-block-h">
        <div>
          <div class="eyebrow">${eyebrow}</div>
          <h2>${title}</h2>
          <p class="muted small">${blurb}</p>
        </div>
        <div class="cv-read" id="cvRead"></div>
      </header>
      <div class="cv-wrap">
        <div class="cv-canvas-host"><canvas class="co-canvas" height="360"></canvas></div>
        <div class="cv-ctl"></div>
      </div>`;
    const read = host.querySelector("#cvRead");
    read.innerHTML = readText || "";
    return {
      cv: host.querySelector("canvas"),
      ctl: host.querySelector(".cv-ctl"),
      read,
      set: (html) => { read.innerHTML = html; },
    };
  }

  /* =========================================================
     Algebra 1 — the parabola in vertex form
     ========================================================= */
  function parabola(ui) {
    const s = { a: 1, h: 0, k: -3 };
    const plot = () => Plot(ui.cv, { x0: -8, x1: 8, y0: -9, y1: 9 });
    let p = plot();
    function draw() {
      p = plot(); p.clear().axes();
      p.band(s.h - 0.06, s.h + 0.06, "rgba(109,94,252,.12)");
      p.curve((x) => s.a * (x - s.h) * (x - s.h) + s.k, "#4b3ee0", 3);
      p.dot(s.h, s.k, "#4b3ee0", 6);
      p.text(s.h + 0.25, s.k + 0.7, `(${num(s.h, 1)}, ${num(s.k, 1)})`, "#4b3ee0", "700 12px ui-sans-serif");
      const disc = -s.k / s.a;                       /* (x−h)² = −k/a */
      if (disc > 1e-9) {
        const r = Math.sqrt(disc);
        p.dot(s.h - r, 0, "#1fa45b", 5); p.dot(s.h + r, 0, "#1fa45b", 5);
      }
      const roots = disc > 1e-9
        ? `x = ${num(s.h - Math.sqrt(disc))} and x = ${num(s.h + Math.sqrt(disc))}`
        : disc === 0 || Math.abs(disc) < 1e-9 ? `x = ${num(s.h)} (a repeated root)` : "no real roots";
      ui.set(`
        <div class="cv-eq">y = ${num(s.a, 2)}(x ${s.h < 0 ? "+" : "−"} ${num(Math.abs(s.h), 1)})² ${s.k < 0 ? "−" : "+"} ${num(Math.abs(s.k), 1)}</div>
        <div class="cv-kv"><span>vertex</span><b>(${num(s.h, 1)}, ${num(s.k, 1)})</b></div>
        <div class="cv-kv"><span>axis</span><b>x = ${num(s.h, 1)}</b></div>
        <div class="cv-kv"><span>opens</span><b>${s.a > 0 ? "upwards" : "downwards"}</b></div>
        <div class="cv-kv"><span>x-intercepts</span><b>${roots}</b></div>`);
    }
    const ymin = () => Math.min(-8, s.k - 6), ymax = () => Math.max(8, s.k + 6);
    const aInp = slider(ui.ctl, "a", -3, 3, 0.25, s.a, (v) => { s.a = v || 0.25; draw(); }, (v) => num(v, 2));
    const kInp = slider(ui.ctl, "h", -6, 6, 0.5, s.h, (v) => { s.h = v; draw(); }, (v) => num(v, 1));
    const cInp = slider(ui.ctl, "k", -6, 6, 0.5, s.k, (v) => { s.k = v; draw(); }, (v) => num(v, 1));
    playBtn(ui.ctl, "▷ animate a", (f) => setRange(aInp, Math.round((-3 + 6 * f) * 4) / 4), { ms: 4200 });
    playBtn(ui.ctl, "▷ slide the vertex", (f) => {
      setRange(kInp, Math.round((-4 + 8 * f) * 2) / 2);
      setRange(cInp, Math.round((3 - 7 * f) * 2) / 2);
    }, { ms: 5200 });
    ui.ctl.insertAdjacentHTML("beforeend",
      `<p class="cv-note">Vertex form $y=a(x-h)^2+k$ is drawn as <b>y = a(x − h)² + k</b>. The vertical band is the axis of symmetry; the green dots are the x-intercepts, which exist only when <b>−k/a ≥ 0</b>.</p>`);
    void ymin; void ymax;
    window.addEventListener("resize", U.debounce ? U.debounce(draw, 140) : draw);
    draw();
  }

  /* =========================================================
     Algebra 2 — an exponential and its inverse
     ========================================================= */
  function exponential(ui) {
    const s = { b: 2, a: 1 };
    let p;
    function draw() {
      p = Plot(ui.cv, { x0: -5, x1: 7, y0: -3, y1: 8, step: 1 }); p.clear().axes();
      p.line(-4.6, -4.6, 7.4, 7.4, "#cfd4dc", 1.5, [5, 5]);
      p.curve((x) => s.a * Math.pow(s.b, x), "#6d5efc", 3);
      p.curve((x) => (x > 0 ? Math.log(x / s.a) / Math.log(s.b) : NaN), "#0f9d94", 3);
      p.dot(0, s.a, "#6d5efc", 5);
      p.dot(s.a, 0, "#0f9d94", 5);
      p.text(2.2, 7, "y = a·b^x", "#6d5efc", "700 12px ui-sans-serif");
      p.text(4.2, 1.0, "y = log_b(x/a)", "#0f9d94", "700 12px ui-sans-serif");
      const g = Math.log(s.a * Math.pow(s.b, 1)) / Math.log(s.b);
      ui.set(`
        <div class="cv-eq">y = ${num(s.a, 2)} · ${num(s.b, 2)}<sup>x</sup></div>
        <div class="cv-kv"><span>behaviour</span><b>${s.b > 1 ? "growth" : "decay"}</b></div>
        <div class="cv-kv"><span>asymptote</span><b>y = 0</b></div>
        <div class="cv-kv"><span>y-intercept</span><b>(0, ${num(s.a, 2)})</b></div>
        <div class="cv-kv"><span>at x = 1</span><b>y = ${num(s.a * s.b, 2)}</b></div>
        <div class="cv-kv"><span>inverse</span><b>log<sub>${num(s.b, 2)}</sub>(x / ${num(s.a, 2)})</b></div>
        <div class="cv-kv"><span>log passes</span><b>(${num(s.a, 2)}, 0)</b></div>`);
      void g;
    }
    const bInp = slider(ui.ctl, "base b", 1.2, 4, 0.1, s.b, (v) => { s.b = v; draw(); }, (v) => num(v, 2));
    const aInp2 = slider(ui.ctl, "a", 0.5, 3, 0.5, s.a, (v) => { s.a = v; draw(); }, (v) => num(v, 2));
    playBtn(ui.ctl, "▷ animate the base", (f) => setRange(bInp, Math.round((1.2 + 2.8 * f) * 10) / 10), { ms: 4400 });
    playBtn(ui.ctl, "▷ flip decay → growth", (f) => {
      /* b goes 1/4 → 4 through 1, so the curve turns from decay into growth */
      const b = Math.pow(16, f - 0.5);
      setRange(bInp, Math.max(1.2, Math.round(Math.max(b, 1 / b) * 10) / 10));
      setRange(aInp2, Math.round((0.5 + 2.5 * (1 - f)) * 2) / 2);
    }, { ms: 5200 });
    ui.ctl.insertAdjacentHTML("beforeend",
      `<p class="cv-note">The dashed line is <b>y = x</b>: the teal curve is the exponential reflected in it — that is what “inverse” means. Try b = 1.2 for slow growth, b = 4 for steep.</p>`);
    window.addEventListener("resize", U.debounce ? U.debounce(draw, 140) : draw);
    draw();
  }

  /* =========================================================
     Geometry — circle and the sphere it sweeps
     ========================================================= */
  function circleSphere(ui) {
    const s = { r: 3 };
    let p;
    function draw() {
      p = Plot(ui.cv, { x0: -7, x1: 7, y0: -4.5, y1: 4.5, step: 1 }); p.clear().axes();
      const cx = 0, cy = 0;
      if (p.ctx) {
        p.ctx.beginPath();
        p.ctx.arc(p.X(cx), p.Y(cy), (p.X(s.r) - p.X(0)), 0, Math.PI * 2);
        p.ctx.fillStyle = "rgba(15,157,148,.10)"; p.ctx.fill();
        p.ctx.strokeStyle = "#0f9d94"; p.ctx.lineWidth = 3; p.ctx.stroke();
      }
      p.line(0, 0, s.r, 0, "#4b3ee0", 2.5);
      p.dot(0, 0, "#4b3ee0", 5);
      p.dot(s.r, 0, "#4b3ee0", 5);
      p.text(s.r / 2 - 0.25, 0.45, `r = ${num(s.r, 1)}`, "#4b3ee0", "700 12px ui-sans-serif");
      p.line(-s.r, -4.2, s.r, -4.2, "#cfd4dc", 4);
      p.text(0.2, -3.9, `diameter = ${num(2 * s.r, 1)}`, "#98a2b3", "600 11px ui-sans-serif");
      const C = 2 * Math.PI * s.r, A = Math.PI * s.r * s.r;
      const V = (4 / 3) * Math.PI * Math.pow(s.r, 3), S = 4 * Math.PI * s.r * s.r;
      ui.set(`
        <div class="cv-eq">r = ${num(s.r, 1)}</div>
        <div class="cv-kv"><span>circumference 2πr</span><b>${num(C)}</b></div>
        <div class="cv-kv"><span>area πr²</span><b>${num(A)}</b></div>
        <div class="cv-kv"><span>sphere volume 4⁄3πr³</span><b>${num(V)}</b></div>
        <div class="cv-kv"><span>sphere surface 4πr²</span><b>${num(S)}</b></div>
        <div class="cv-kv"><span>doubling r multiplies</span><b>area ×4 · volume ×8</b></div>`);
    }
    const rInp = slider(ui.ctl, "radius r", 0.5, 6, 0.25, s.r, (v) => { s.r = v; draw(); }, (v) => num(v, 2));
    playBtn(ui.ctl, "▷ grow the circle", (f) => setRange(rInp, Math.round((0.5 + 5.5 * f) * 4) / 4), { ms: 4600 });
    playBtn(ui.ctl, "▷ show the doubling", (f) => {
      /* step through r = 1.5 → 3 → 6, pausing on each so ×4 / ×8 can be read */
      const steps = [1.5, 3, 6];
      const i = Math.min(2, Math.floor(f * 3));
      setRange(rInp, steps[i]);
    }, { ms: 3600 });
    ui.ctl.insertAdjacentHTML("beforeend",
      `<p class="cv-note">Every number updates as you drag: the thin bar is the diameter, and the four read-outs are the four formulas Geometry keeps asking for. Push r to 2, then 4 — the area quadruples, the volume goes up eightfold.</p>`);
    window.addEventListener("resize", U.debounce ? U.debounce(draw, 140) : draw);
    draw();
  }

  /* =========================================================
     Precalculus — transformations against the parent
     ========================================================= */
  const PARENTS = {
    square: { label: "x²", f: (x) => x * x },
    root: { label: "√x", f: (x) => (x >= 0 ? Math.sqrt(x) : NaN) },
    abs: { label: "|x|", f: (x) => Math.abs(x) },
    recip: { label: "1/x", f: (x) => (Math.abs(x) < 1e-6 ? NaN : 1 / x) },
  };
  function transform(ui) {
    const s = { key: "square", a: 1, b: 1, h: 0, k: 0 };
    let p;
    function draw() {
      p = Plot(ui.cv, { x0: -8, x1: 8, y0: -8, y1: 8, step: 1 }); p.clear().axes();
      const f = PARENTS[s.key].f;
      p.curve(f, "#cfd4dc", 2.5, [6, 5]);
      p.curve((x) => s.a * f(s.b * (x - s.h)) + s.k, "#6d5efc", 3);
      p.dot(s.h, s.k, "#6d5efc", 5);
      const bits = [];
      if (s.a !== 1) bits.push(Math.abs(s.a) !== 1 ? `vertical stretch ×${num(Math.abs(s.a), 2)}` : "vertical stretch unchanged");
      if (s.a < 0) bits.push("reflected in the x-axis");
      if (s.b !== 1) bits.push(Math.abs(s.b) !== 1 ? `horizontal ${Math.abs(s.b) > 1 ? "compression" : "stretch"} ×${num(Math.abs(s.b), 2)}` : "");
      if (s.b < 0) bits.push("reflected in the y-axis");
      if (s.h) bits.push(`shifted ${s.h > 0 ? "right" : "left"} ${num(Math.abs(s.h), 1)}`);
      if (s.k) bits.push(`shifted ${s.k > 0 ? "up" : "down"} ${num(Math.abs(s.k), 1)}`);
      ui.set(`
        <div class="cv-eq">y = ${num(s.a, 2)} · ${PARENTS[s.key].label.replace("x", `(${num(s.b, 2)}x ${s.h < 0 ? "+" : "−"} ${num(Math.abs(s.h), 1)})`)} ${s.k < 0 ? "−" : "+"} ${num(Math.abs(s.k), 1)}</div>
        <div class="cv-kv"><span>parent</span><b>f(x) = ${PARENTS[s.key].label}</b></div>
        <div class="cv-kv"><span>moved to</span><b>(${num(s.h, 1)}, ${num(s.k, 1)})</b></div>
        <div class="cv-kv"><span>what it does</span><b>${bits.length ? bits.filter(Boolean).join(", ") : "nothing — it is the parent"}</b></div>`);
    }
    segRow(ui.ctl, Object.keys(PARENTS).map((k) => ({ v: k, label: PARENTS[k].label })), s.key, (v) => { s.key = v; draw(); });
    const taInp = slider(ui.ctl, "a (vertical)", -2, 2, 0.25, s.a, (v) => { s.a = v || 0.25; draw(); }, (v) => num(v, 2));
    const tbInp = slider(ui.ctl, "b (horizontal)", 0.5, 2, 0.25, s.b, (v) => { s.b = v; draw(); }, (v) => num(v, 2));
    const thInp = slider(ui.ctl, "h (left/right)", -5, 5, 0.5, s.h, (v) => { s.h = v; draw(); }, (v) => num(v, 1));
    const tkInp = slider(ui.ctl, "k (up/down)", -5, 5, 0.5, s.k, (v) => { s.k = v; draw(); }, (v) => num(v, 1));
    /* one pass through H → S → V → R, naming the letter as it moves */
    const tour = playBtn(ui.ctl, "▷ tour H·S·V·R", (f) => {
      setRange(taInp, 1); setRange(tbInp, 1);
      if (f < 0.25) { setRange(thInp, Math.round((-3 + 8 * (f / 0.25)) * 2) / 2); setRange(tkInp, 0); tour.note.textContent = "h — moves it left and right"; }
      else if (f < 0.5) { setRange(tkInp, Math.round((-3 + 7 * ((f - 0.25) / 0.25)) * 2) / 2); tour.note.textContent = "k — moves it up and down"; }
      else if (f < 0.75) { setRange(taInp, Math.round((-2 + 3 * ((f - 0.5) / 0.25)) * 4) / 4); tour.note.textContent = "a — stretches it vertically"; }
      else { setRange(tbInp, Math.round((1 + 1 * ((f - 0.75) / 0.25)) * 4) / 4); tour.note.textContent = "b — squeezes it horizontally"; }
    }, { ms: 8000 });
    ui.ctl.insertAdjacentHTML("beforeend",
      `<p class="cv-note">Grey dashed = the parent function; purple = <b>a·f(b(x − h)) + k</b>. The dot marks the point the parent's key point lands on, which is exactly the HSRV ordering the lesson teaches.</p>`);
    window.addEventListener("resize", U.debounce ? U.debounce(draw, 140) : draw);
    draw();
  }

  /* =========================================================
     Calculus — the tangent slope where you point
     ========================================================= */
  const CALC = {
    quad: { label: "y = x²/2", f: (x) => x * x / 2, d: (x) => x },
    cubic: { label: "y = x³/3 − x", f: (x) => x * x * x / 3 - x, d: (x) => x * x - 1 },
    sine: { label: "y = sin x", f: (x) => Math.sin(x), d: (x) => Math.cos(x) },
  };
  function tangent(ui) {
    const s = { key: "cubic", x0: 1.2, h: 1.4, anim: 0 };
    let p;
    function draw() {
      const F = CALC[s.key];
      const y0 = F.f(s.x0), m = F.d(s.x0);
      p = Plot(ui.cv, { x0: -5, x1: 5, y0: -4.5, y1: 4.5, step: 1 }); p.clear().axes();
      p.curve(F.f, "#4b3ee0", 3);
      /* tangent */
      p.line(s.x0 - 3.4, y0 - 3.4 * m, s.x0 + 3.4, y0 + 3.4 * m, "#e5484d", 2.5);
      /* secant to x0 + h */
      const x1 = s.x0 + s.h, y1 = F.f(x1);
      p.line(s.x0, y0, x1, y1, "#0f9d94", 2, [5, 4]);
      p.dot(x1, y1, "#0f9d94", 5);
      p.dot(s.x0, y0, "#e5484d", 6);
      p.text(s.x0 + 0.15, y0 + 0.55, `slope ${num(m)}`, "#e5484d", "700 12px ui-sans-serif");
      const sec = (y1 - y0) / (x1 - s.x0);
      ui.set(`
        <div class="cv-eq">${F.label} at x = ${num(s.x0)}</div>
        <div class="cv-kv"><span>f(x)</span><b>${num(y0, 3)}</b></div>
        <div class="cv-kv"><span>f′(x) — tangent slope</span><b>${num(m, 3)}</b></div>
        <div class="cv-kv"><span>tangent line</span><b>y = ${num(m, 2)}x ${y0 - m * s.x0 < 0 ? "−" : "+"} ${num(Math.abs(y0 - m * s.x0), 2)}</b></div>
        <div class="cv-kv"><span>secant slope (h = ${num(s.h, 2)})</span><b>${num(sec, 3)}</b></div>
        <div class="cv-kv"><span>difference quotient</span><b>[f(x+h) − f(x)] / h</b></div>`);
    }
    segRow(ui.ctl, Object.keys(CALC).map((k) => ({ v: k, label: CALC[k].label })), s.key, (v) => { s.key = v; draw(); });
    const x0Inp = slider(ui.ctl, "point x₀", -4, 4, 0.1, s.x0, (v) => { s.x0 = v; draw(); }, (v) => num(v, 1));
    slider(ui.ctl, "h", 0.2, 3, 0.1, s.h, (v) => { s.h = v; draw(); }, (v) => num(v, 1));
    playBtn(ui.ctl, "▷ sweep the point", (f) => setRange(x0Inp, Math.round((-4 + 8 * f) * 10) / 10), { ms: 6000 });
    const wrapBtn = document.createElement("div");
    wrapBtn.className = "cv-btnrow";
    wrapBtn.innerHTML = `<button type="button" class="btn sm" id="cvSH">shrink h → 0</button><span class="cv-note" id="cvHNow"></span>`;
    ui.ctl.appendChild(wrapBtn);
    const btn = wrapBtn.querySelector("#cvSH");
    const now = wrapBtn.querySelector("#cvHNow");
    btn.addEventListener("click", () => {
      let h = 3;
      btn.disabled = true;
      const tick = () => {
        h = Math.max(0.05, h * 0.72);
        s.h = Math.round(h * 100) / 100;
        const inp = ui.ctl.querySelectorAll("input[type=range]")[1];
        if (inp) { inp.value = s.h; inp.dispatchEvent(new Event("input")); }
        now.textContent = "h = " + num(s.h, 2);
        draw();
        if (s.h > 0.06) raf(() => setTimeout(tick, 90));
        else { btn.disabled = false; now.textContent = "the secant has become the tangent"; }
      };
      tick();
    });
    /* click on the canvas moves the point */
    ui.cv.addEventListener("click", (e) => {
      const r = ui.cv.getBoundingClientRect();
      const x = p.o.x0 + ((e.clientX - r.left - p.o.pad) / (p.w - 2 * p.o.pad)) * (p.o.x1 - p.o.x0);
      s.x0 = Math.round(U.clamp ? U.clamp(x, -4, 4) * 10 : x * 10) / 10;
      const inp = ui.ctl.querySelectorAll("input[type=range]")[0];
      if (inp) { inp.value = s.x0; inp.dispatchEvent(new Event("input")); }
      draw();
    });
    ui.ctl.insertAdjacentHTML("beforeend",
      `<p class="cv-note">Click anywhere on the canvas to move the point. Teal dashed is the secant through <b>x₀</b> and <b>x₀ + h</b>; press <b>shrink h → 0</b> and watch it settle onto the red tangent — which is what the derivative is.</p>`);
    window.addEventListener("resize", U.debounce ? U.debounce(draw, 140) : draw);
    draw();
  }

  /* =========================================================
     Exam preparation — a score, its band, and the questions
     still standing between you and the next band
     ========================================================= */
  const BANDS = [
    { at: 90, name: "mastery", color: "#0f9d94" },
    { at: 80, name: "strong", color: "#1fa45b" },
    { at: 70, name: "passing", color: "#2f7cf6" },
    { at: 50, name: "approaching", color: "#e8a008" },
    { at: 0, name: "needs work", color: "#f97066" },
  ];
  const bandOf = (pct) => BANDS.find((b) => pct >= b.at) || BANDS[BANDS.length - 1];
  function scoreBoard(ui) {
    const s = { total: 25, correct: 18, pass: 60 };
    function draw() {
      const pct = (s.correct / s.total) * 100;
      const p = Plot(ui.cv, { x0: 0, x1: 100, y0: 0, y1: 10, step: 25 });
      p.clear();
      const yTop = 6.4, yBot = 3.4;
      if (p.ctx) {
        /* the empty track */
        p.ctx.fillStyle = "#f4f5f9";
        p.ctx.fillRect(p.X(0), p.Y(yTop), p.X(100) - p.X(0), p.Y(yBot) - p.Y(yTop));
        /* the filled score */
        p.ctx.fillStyle = bandOf(pct).color;
        p.ctx.fillRect(p.X(0), p.Y(yTop), p.X(pct) - p.X(0), p.Y(yBot) - p.Y(yTop));
      }
      /* band ticks at 50/60/70/80/90 */
      [50, 60, 70, 80, 90].forEach((t) => {
        p.line(t, yTop + 0.1, t, yBot - 0.1, t === s.pass ? "#e5484d" : "rgba(16,24,40,.16)", t === s.pass ? 2.5 : 1.5, t === s.pass ? null : [4, 4]);
        p.text(t - (t === 100 ? 4 : 2.2), yBot - 0.75, t + "%", t === s.pass ? "#e5484d" : "#98a2b3", "700 11px ui-sans-serif");
      });
      /* the score marker */
      p.line(pct, yTop + 0.2, pct, yBot - 0.2, "#101828", 2.5);
      p.dot(Math.min(99.2, Math.max(0.8, pct)), (yTop + yBot) / 2, "#101828", 6);
      p.text(1, 8.6, `${s.correct} of ${s.total} correct`, "#101828", "800 16px ui-sans-serif");
      p.text(1, 7.5, `${num(pct, 1)}%  ·  ${bandOf(pct).name}`, bandOf(pct).color, "700 13px ui-sans-serif");
      /* what it takes to reach the next band */
      const next = [50, 60, 70, 80, 90].find((b) => b > pct);
      const need = next == null ? 0 : Math.max(0, Math.ceil((next / 100) * s.total) - s.correct);
      p.text(1, 1.9, next == null
        ? "Top band reached — keep the accuracy there."
        : `${need} more correct answer${need === 1 ? "" : "s"} takes you to ${next}%`,
        "#475467", "600 12px ui-sans-serif");
      ui.set(`
        <div class="cv-eq">${s.correct} / ${s.total} = ${num(pct, 1)}%</div>
        <div class="cv-kv"><span>band</span><b>${bandOf(pct).name}</b></div>
        <div class="cv-kv"><span>pass mark</span><b>${s.pass}% = ${Math.ceil((s.pass / 100) * s.total)} correct</b></div>
        <div class="cv-kv"><span>missing at this mark</span><b>${pct >= s.pass ? "clear ✓" : Math.max(0, Math.ceil((s.pass / 100) * s.total) - s.correct) + " more"}</b></div>
        <div class="cv-kv"><span>to the next band</span><b>${next == null ? "—" : need + " more"}</b></div>`);
    }
    let correctInp = null;
    slider(ui.ctl, "questions on the paper", 5, 60, 1, s.total, (v) => {
      s.total = v;
      if (s.correct > v) s.correct = v;
      if (correctInp) {                        /* keep "correct" inside the paper */
        correctInp.max = String(v);
        correctInp.value = String(s.correct);
        correctInp.nextElementSibling.textContent = String(s.correct);
      }
      draw();
    }, (v) => String(v));
    correctInp = slider(ui.ctl, "answered correctly", 0, s.total, 1, s.correct, (v) => { s.correct = v; draw(); }, (v) => String(v));
    segRow(ui.ctl, [50, 60, 70, 80].map((v) => ({ v, label: v + "%" })), s.pass, (v) => { s.pass = Number(v); draw(); });
    playBtn(ui.ctl, "▷ climb to the pass mark", (f) => {
      const need = Math.ceil((s.pass / 100) * s.total);
      setRange(correctInp, Math.round(need * f));
    }, { ms: 3800, once: true, endNote: "that is the pass mark — the bar fills as the marks come in" });
    ui.ctl.insertAdjacentHTML("beforeend",
      `<p class="cv-note">A score is a fraction before it is a percentage: <b>correct ÷ total × 100</b>. Drag either slider and the red dashed line is your pass mark — the figure tells you how many more answers it takes, which is the number worth chasing in revision, not the percentage.</p>`);
    window.addEventListener("resize", U.debounce ? U.debounce(draw, 140) : draw);
    draw();
  }

  /* ---------------- registry ---------------- */
  const FIGURES = {
    "holt-a1": { eyebrow: "Try it", title: "A parabola you can move",
      blurb: "Vertex form made physical: drag a, h and k and watch the vertex, the axis of symmetry and the intercepts follow.",
      mount: parabola },
    "holt-c2": { eyebrow: "Try it", title: "An exponential and its inverse",
      blurb: "The curve, the mirror line y = x, and the logarithm it produces — the pair that Algebra 2 keeps pairing.",
      mount: exponential },
    "holt-c1": { eyebrow: "Try it", title: "Circle out, sphere up",
      blurb: "One radius drives circumference, area, sphere volume and surface area — see how fast each one grows.",
      mount: circleSphere },
    p11: { eyebrow: "Try it", title: "Transformations against the parent",
      blurb: "Pick a parent function, then apply HSRV: a·f(b(x − h)) + k, with the parent kept as a dashed ghost.",
      mount: transform },
    examprep: { eyebrow: "Try it", title: "What a score actually means",
      blurb: "Pick the paper size and how many you got right: the bar, the band and the gap to the pass mark all follow.",
      mount: scoreBoard },
    c12: { eyebrow: "Try it", title: "The tangent line, and the derivative it defines",
      blurb: "Drag x₀ along the curve, then shrink h and watch the secant slope converge on f′(x₀).",
      mount: tangent },
  };

  /* each mount() above expects a ui object; build the real one here */
  Object.keys(FIGURES).forEach((k) => {
    const spec = FIGURES[k];
    const inner = spec.mount;
    spec.mount = function (host) {
      const ui = shell(host, spec.eyebrow, spec.title, spec.blurb, "");
      inner(ui);
    };
  });

  ML.viz = {
    /** does this course have a live figure? */
    has: (id) => !!FIGURES[id],
    list: () => Object.keys(FIGURES),
  };

  ML.viz.panel = function (courseId) {
    const spec = FIGURES[courseId];
    if (!spec) return null;
    const sec = document.createElement("section");
    sec.className = "co-block cv-block";
    spec.mount(sec);
    /* the panel is built detached, so the first draw measured a fallback
       width and left a stale backing store on the canvas. Once it is in the
       page (and laid out) every figure already redraws on a resize event —
       so send one, one frame later. This is what keeps the graph from being
       stretched by its own attribute ratio on first paint. */
    const nudge = () => {
      try { window.dispatchEvent(new Event("resize")); } catch (e) {}
    };
    raf(() => raf(nudge));
    return sec;
  };
})();

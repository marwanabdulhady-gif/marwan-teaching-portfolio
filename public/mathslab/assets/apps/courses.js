/* ===========================================================
   MathsLab — Courses
   The site's front door: six courses, every chapter and lesson
   in them, and a lesson page that brings back what the captured
   course pages had —

     · the worked example, one step at a time  (step-through)
     · the graphs the lessons shipped with     (captured SVG)
     · a live graph lab                        (drag, zoom, retype)
     · "your turn" questions from the lesson   (marked cards)

   Deep links:  #/courses          the course index
                #/courses/<id>     one course
                #/courses/<id>/<lessonId>
   =========================================================== */
(function () {
  "use strict";
  const ML = window.ML, U = ML.u;
  /* requestAnimationFrame with a timer fallback (canvas-less environments) */
  const RAF = (cb) => (window.requestAnimationFrame ? window.requestAnimationFrame(cb) : setTimeout(cb, 16));
  const CO = () => window.MLCOURSES || { courses: [], lessons: {}, stats: {} };

  /* which generator recipe set belongs to which course page */
  const GEN_OF = { "holt-a1": "a1", "holt-c1": "c1", "holt-c2": "c2", "p11": "p11", "c12": "c12" };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------------------------------------------------------
     1. expression compiler — turns the lesson notation the
        captured pages used (x³ − 4x, √(x − 3), |x − 1|) into
        something we can plot
     --------------------------------------------------------- */
  const FUNCS = "abs,sqrt,cbrt,sin,cos,tan,asin,acos,atan,ln,log,exp,floor,ceil,sign,pow,round,max,min";

  function toJS(src) {
    let s = String(src || "");
    s = s.replace(/[−–—]/g, "-").replace(/[×·⋅]/g, "*").replace(/[÷]/g, "/")
      .replace(/π/g, "pi").replace(/∞/g, "Infinity")
      .replace(/³/g, "^3").replace(/²/g, "^2").replace(/⁴/g, "^4").replace(/⁵/g, "^5")
      .replace(/√/g, "sqrt")
      .replace(/\bln\s*\(/g, "ln(").replace(/\be\^/g, "exp(");
    /* |expr| → abs(expr) — the captured labels write absolute value with bars */
    s = s.replace(/\|([^|]{1,40})\|/g, "abs($1)");
    /* √(x − 3) already became sqrt(x-3); √x still needs its bracket */
    s = s.replace(/sqrt\s*([a-zA-Z0-9.]+)/g, "sqrt($1)");
    /* y = …, f(x) = …, r = … prefixes */
    s = s.replace(/^[a-zA-Z]\s*(\(\s*x\s*\))?\s*=\s*/, "");
    /* implicit multiplication: 2x, 3(x+1), )(, x(  */
    s = s.replace(/(\d)\s*([a-zA-Z(])/g, "$1*$2").replace(/\)\s*\(/g, ")*(");
    s = s.replace(/\^\s*/g, "**");
    return s;
  }

  function compile(src) {
    if (!src) return null;
    const js = toJS(src);
    if (!/[x0-9]/.test(js) || /[;{}]|=>|document|window|fetch|\[/.test(js)) return null;
    let fn;
    try {
      fn = new Function("x", "var pi=Math.PI,Infinity=1/0;var " +
        FUNCS.split(",").map((f) => f + "=Math." + (f === "ln" ? "log" : f === "log" ? "log10" : f)).join(",") +
        ";return (" + js + ");");
      const t = [0.4, 1.3, -1.7].map((x) => fn(x));
      if (t.some((v) => typeof v !== "number")) return null;
    } catch (e) { return null; }
    return fn;
  }

  /** split "x² − 3, y = x − 1" into plottable pieces */
  function pieces(src) {
    return String(src || "").split(/[;,]/).map((s) => s.trim()).filter(Boolean)
      .map((s) => s.replace(/^(y|f\s*\(\s*x\s*\)|r)\s*=\s*/i, ""))
      .filter((s) => compile(s));
  }

  /* ---------------------------------------------------------
     2. the graph lab — canvas plotter with drag / zoom / trace
     --------------------------------------------------------- */
  const PALETTE = ["#6d5efc", "#0f9d94", "#e5484d", "#e8a008"];

  function makePlot(canvas, opts) {
    opts = opts || {};
    const ctx = canvas.getContext("2d");
    const view = { cx: 0, cy: 0, scale: 42 };      // scale = px per unit
    let curves = [], drag = null, hover = null, raf = 0, W = 0, H = 0, dpr = 1;
    /* extras: a tangent with its slope, a shaded area between two markers,
       and a point that sweeps along the first curve */
    const extra = { tangent: false, area: false, a: -2, b: 2, sweepX: null, marker: null };
    const f0 = () => (curves[0] && curves[0].fn) || null;
    const slopeAt = (fn, x) => {
      const h = Math.max(1e-5, Math.abs(x) * 1e-6 + 1e-5);
      const y1 = fn(x + h), y0 = fn(x - h);
      return (isFinite(y1) && isFinite(y0)) ? (y1 - y0) / (2 * h) : NaN;
    };
    /* Simpson's rule on the first curve — good enough for a read-out */
    const areaBetween = (fn, a, b) => {
      const n = 200, h = (b - a) / n;
      if (!isFinite(h) || h === 0) return NaN;
      let sum = 0;
      for (let i = 0; i <= n; i++) {
        const x = a + i * h;
        let y; try { y = fn(x); } catch (e) { y = NaN; }
        if (!isFinite(y)) return NaN;
        sum += y * (i === 0 || i === n ? 1 : i % 2 ? 4 : 2);
      }
      return (h / 3) * sum;
    };

    function resize() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(240, Math.round(r.width));
      H = Math.max(180, Math.round(r.height || (W * 0.62)));
      canvas.width = W * dpr; canvas.height = H * dpr;
      /* inside a stage the box owns the height (height:100% !important);
         everywhere else the canvas keeps its own inline height */
      if (!canvas.closest || !canvas.closest(".mstage-body")) canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }
    /* draw() re-fits the backing store whenever the box has changed size.
       Without this a plot first drawn while the page was still being built
       kept its 240 × 180 backing store and got stretched to 1142 × 460. */
    function ensureFit() {
      if (!canvas.isConnected) return false;
      const r = canvas.getBoundingClientRect();
      const w = Math.round(r.width), h = Math.round(r.height);
      if (!w || !h) return false;
      if (w === W && Math.abs(h - H) <= 1) return false;
      resize();
      return true;
    }
    const X = (x) => W / 2 + (x - view.cx) * view.scale;
    const Y = (y) => H / 2 - (y - view.cy) * view.scale;
    const invX = (px) => view.cx + (px - W / 2) / view.scale;
    const invY = (py) => view.cy - (py - H / 2) / view.scale;

    function step() {
      const target = 78 / view.scale;
      const p = Math.pow(10, Math.floor(Math.log10(target)));
      const m = target / p;
      return (m >= 5 ? 5 : m >= 2 ? 2 : 1) * p;
    }

    function draw() {
      if (arguments.length === 0 && ensureFit()) return;   /* refit already redrew */
      ctx.clearRect(0, 0, W, H);
      const g = step();
      ctx.fillStyle = "#fbfcfe"; ctx.fillRect(0, 0, W, H);

      /* grid */
      ctx.strokeStyle = "#e8ecf3"; ctx.lineWidth = 1;
      ctx.beginPath();
      const x0 = Math.floor(invX(0) / g) * g, x1 = invX(W);
      const y0 = Math.floor(invY(H) / g) * g, y1 = invY(0);
      for (let x = x0; x <= x1; x += g) { const px = Math.round(X(x)) + 0.5; ctx.moveTo(px, 0); ctx.lineTo(px, H); }
      for (let y = y0; y <= y1; y += g) { const py = Math.round(Y(y)) + 0.5; ctx.moveTo(0, py); ctx.lineTo(W, py); }
      ctx.stroke();

      /* axes */
      ctx.strokeStyle = "#98a2b3"; ctx.lineWidth = 1.4;
      ctx.beginPath();
      const ax = Math.round(X(0)) + 0.5, ay = Math.round(Y(0)) + 0.5;
      ctx.moveTo(ax, 0); ctx.lineTo(ax, H); ctx.moveTo(0, ay); ctx.lineTo(W, ay);
      ctx.stroke();

      /* tick labels */
      ctx.fillStyle = "#98a2b3"; ctx.font = "11px system-ui,sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      const dec = g < 1 ? 1 : 0;
      for (let x = x0; x <= x1; x += g) {
        if (Math.abs(x) < g / 2) continue;
        ctx.fillText((+x.toFixed(2)).toFixed(dec), X(x), U.clamp(ay + 4, 2, H - 14));
      }
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      for (let y = y0; y <= y1; y += g) {
        if (Math.abs(y) < g / 2) continue;
        ctx.fillText((+y.toFixed(2)).toFixed(dec), U.clamp(ax - 5, 22, W - 3), Y(y));
      }

      /* curves */
      curves.forEach((c, ci) => {
        ctx.strokeStyle = PALETTE[ci % PALETTE.length];
        ctx.lineWidth = 2.4; ctx.lineJoin = "round";
        ctx.beginPath();
        let pen = false, prevY = null;
        for (let px = 0; px <= W; px++) {
          const x = invX(px);
          let y;
          try { y = c.fn(x); } catch (e) { y = NaN; }
          if (!isFinite(y) || Math.abs(y) > 1e6) { pen = false; prevY = null; continue; }
          const py = Y(y);
          /* a huge jump means an asymptote — break the line instead of drawing through it */
          if (prevY !== null && Math.abs(py - prevY) > H * 1.6) pen = false;
          if (!pen) { ctx.moveTo(px, py); pen = true; } else ctx.lineTo(px, py);
          prevY = py;
        }
        ctx.stroke();
      });

      /* shaded area under the first curve, between the two markers */
      if (extra.area && f0()) {
        const fn = f0(), a = Math.min(extra.a, extra.b), b = Math.max(extra.a, extra.b);
        ctx.save();
        ctx.beginPath();
        let started = false;
        for (let px = Math.max(0, X(a)); px <= Math.min(W, X(b)); px += 2) {
          const x = invX(px);
          let y; try { y = fn(x); } catch (e) { y = NaN; }
          if (!isFinite(y)) { started = false; continue; }
          const py = U.clamp(Y(y), -H, H * 2);
          if (!started) { ctx.moveTo(px, Y(0)); ctx.lineTo(px, py); started = true; }
          else ctx.lineTo(px, py);
        }
        if (started) {
          ctx.lineTo(Math.min(W, X(b)), Y(0));
          ctx.closePath();
          ctx.fillStyle = "rgba(109,94,252,.16)";
          ctx.fill();
        }
        /* the two markers */
        [extra.a, extra.b].forEach((mx, i) => {
          ctx.strokeStyle = i ? "#0f9d94" : "#6d5efc";
          ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(X(mx), 0); ctx.lineTo(X(mx), H); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = i ? "#0f9d94" : "#6d5efc";
          ctx.font = "700 11px system-ui,sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "top";
          ctx.fillText(i ? "B" : "A", X(mx), 2);
        });
        ctx.restore();
      }

      /* tangent line at the traced x (or at the sweep point) */
      const hx = extra.tangent
        ? (extra.sweepX != null ? extra.sweepX : hover ? invX(hover.px) : null)
        : null;
      if (hx != null && f0()) {
        const fn = f0();
        let y0v; try { y0v = fn(hx); } catch (e) { y0v = NaN; }
        const m = slopeAt(fn, hx);
        if (isFinite(y0v) && isFinite(m)) {
          ctx.save();
          ctx.strokeStyle = "#e5484d"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(0, Y(y0v + m * (invX(0) - hx)));
          ctx.lineTo(W, Y(y0v + m * (invX(W) - hx))); ctx.stroke();
          ctx.fillStyle = "#e5484d";
          ctx.beginPath(); ctx.arc(X(hx), Y(y0v), 4.2, 0, Math.PI * 2); ctx.fill();
          const lbl = "f′(" + U.fmt(hx, 2) + ") = " + U.fmt(m, 2);
          ctx.font = "700 12px system-ui,sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
          const tw = ctx.measureText(lbl).width;
          const bx = U.clamp(X(hx) + 10, 4, W - tw - 12);
          ctx.fillStyle = "rgba(255,255,255,.92)";
          ctx.fillRect(bx - 4, Y(y0v) - 22, tw + 8, 18);
          ctx.fillStyle = "#b0262a"; ctx.fillText(lbl, bx, Y(y0v) - 7);
          ctx.restore();
        }
      }

      /* trace */
      if (hover && curves.length) {
        const x = invX(hover.px);
        ctx.strokeStyle = "#cfd4dc"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(Math.round(hover.px) + 0.5, 0); ctx.lineTo(Math.round(hover.px) + 0.5, H); ctx.stroke();
        curves.forEach((c, ci) => {
          let y; try { y = c.fn(x); } catch (e) { y = NaN; }
          if (!isFinite(y)) return;
          ctx.fillStyle = PALETTE[ci % PALETTE.length];
          ctx.beginPath(); ctx.arc(X(x), Y(y), 3.6, 0, Math.PI * 2); ctx.fill();
        });
      }
    }

    const schedule = () => { if (!raf) raf = RAF(() => { raf = 0; draw(); }); };

    function setExprs(src, keepView) {
      const list = pieces(src);
      curves = list.map((s) => ({ src: s, fn: compile(s) })).filter((c) => c.fn);
      if (!keepView) {
        /* fit the vertical window to the curves a little */
        view.cx = 0; view.cy = 0;
      }
      schedule();
      return curves.length;
    }

    function reset() { view.cx = 0; view.cy = 0; view.scale = 42; schedule(); }

    canvas.addEventListener("pointerdown", (e) => {
      /* in area mode, grabbing near A or B moves that marker instead of panning */
      if (extra.area) {
        const r0 = canvas.getBoundingClientRect();
        const px = e.clientX - r0.left;
        if (Math.abs(px - X(extra.a)) < 11 || Math.abs(px - X(extra.b)) < 11) {
          extra.marker = Math.abs(px - X(extra.a)) < 11 ? "a" : "b";
          extra[extra.marker] = invX(px);
          schedule();
          canvas.style.cursor = "ew-resize";
          return;
        }
      }
      drag = { x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy };
      if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    });
    canvas.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      hover = { px: e.clientX - r.left, py: e.clientY - r.top };
      if (extra.marker) {
        extra[extra.marker] = invX(hover.px);
        if (opts.onTrace) opts.onTrace(invX(hover.px), [], readout());
        schedule();
        return;
      }
      if (extra.area || extra.tangent) { schedule(); }
      if (drag) {
        view.cx = drag.cx - (e.clientX - drag.x) / view.scale;
        view.cy = drag.cy + (e.clientY - drag.y) / view.scale;
      }
      if (opts.onTrace) {
        const x = invX(hover.px);
        const ys = curves.map((c) => { try { return c.fn(x); } catch (err) { return NaN; } });
        opts.onTrace(x, ys);
      }
      schedule();
    });
    const up = () => { drag = null; extra.marker = null; canvas.style.cursor = "grab"; };
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("pointerleave", () => { hover = null; if (opts.onTrace) opts.onTrace(null, []); schedule(); });
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      const mx = invX(e.clientX - r.left), my = invY(e.clientY - r.top);
      const k = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      view.scale = U.clamp(view.scale * k, 6, 420);
      /* keep the point under the cursor pinned */
      view.cx = mx - (mx - view.cx) * k;
      view.cy = my - (my - view.cy) * k;
      schedule();
    }, { passive: false });
    canvas.addEventListener("dblclick", reset);
    /* keys: + / - zoom, 0 resets, arrows pan, t tangent, a area */
    canvas.setAttribute("tabindex", "0");
    canvas.addEventListener("keydown", (e) => {
      const k = e.key;
      if (k === "+" || k === "=") { view.scale = U.clamp(view.scale * 1.2, 6, 420); }
      else if (k === "-") { view.scale = U.clamp(view.scale / 1.2, 6, 420); }
      else if (k === "0") { reset(); return; }
      else if (k === "ArrowLeft") view.cx -= step() / 2;
      else if (k === "ArrowRight") view.cx += step() / 2;
      else if (k === "ArrowUp") view.cy += step() / 2;
      else if (k === "ArrowDown") view.cy -= step() / 2;
      else if (k === "t" || k === "T") { extra.tangent = !extra.tangent; onToggles && onToggles(); }
      else if (k === "a" || k === "A") { extra.area = !extra.area; onToggles && onToggles(); }
      else return;
      e.preventDefault();
      schedule();
    });
    window.addEventListener("resize", U.debounce(resize, 160));
    resize();
    function readout() {
      if (!f0()) return "";
      const bits = [];
      if (extra.tangent) {
        const hx = extra.sweepX != null ? extra.sweepX : hover ? invX(hover.px) : null;
        if (hx != null) bits.push("f′ = " + U.fmt(slopeAt(f0(), hx), 2));
      }
      if (extra.area) {
        const v = areaBetween(f0(), Math.min(extra.a, extra.b), Math.max(extra.a, extra.b));
        bits.push("A→B area ≈ " + (isFinite(v) ? U.fmt(v, 2) : "—"));
      }
      return bits.join("   ");
    }
    const onToggles = opts.onToggle || null;

    return {
      setExprs, reset, resize, draw: schedule, readout,
      setTangent(on) { extra.tangent = on != null ? !!on : !extra.tangent; schedule(); return extra.tangent; },
      setArea(on) { extra.area = on != null ? !!on : !extra.area; schedule(); return extra.area; },
      setMarkers(a, b) { extra.a = a; extra.b = b; schedule(); },
      /* sweep a point along the first curve and report it as it moves */
      sweep(ms) {
        const fn = f0();
        if (!fn) return;
        const x0 = invX(0), x1 = invX(W);
        const t0 = (window.performance && performance.now) ? performance.now() : Date.now();
        const tick = () => {
          const now = (window.performance && performance.now) ? performance.now() : Date.now();
          const f = Math.min(1, (now - t0) / (ms || 4000));
          extra.sweepX = x0 + (x1 - x0) * f;
          let y = NaN; try { y = fn(extra.sweepX); } catch (e) { y = NaN; }
          if (opts.onTrace) opts.onTrace(extra.sweepX, [y], readout());
          schedule();
          if (f < 1) RAF(tick);
          else { extra.sweepX = null; schedule(); }
        };
        tick();
      },
      state: extra,
    };
  }

  ML.graph = { make: makePlot, compile, pieces, toJS };

  /* ---------------------------------------------------------
     3. shared course/lesson resolution (the studio uses this)
     --------------------------------------------------------- */
  function courseById(id) { return CO().courses.filter((c) => c.id === id)[0] || null; }
  /** "#/courses/<course>/<lesson>" — lessons are addressed by their short id */
  function lessonUrl(course, lesson) { return "#/courses/" + course.id + "/" + String(lesson.id).split(":").pop(); }
  ML.lessonUrl = lessonUrl;
  function nodeOf(course, nodeId) {
    for (const ch of course.chapters) {
      if (ch.id === nodeId) return ch;
      for (const ls of ch.lessons || []) if (ls.id === nodeId) return ls;
    }
    return null;
  }
  /** what to feed the studio for a chapter/lesson */
  function resolve(courseId, nodeId) {
    const c = courseById(courseId);
    if (!c) return null;
    const n = nodeOf(c, nodeId) || c;
    const tag = { course: c.id, node: n.id === c.id ? "" : n.id };
    if (n.qids) return Object.assign({ ids: n.qids, title: n.title }, tag);
    if (n.filter) return Object.assign({ filter: n.filter, title: n.title }, tag);
    /* a whole course or a chapter of lessons */
    const ids = [];
    const walk = (node) => (node.lessons || []).forEach((l) => l.qids && ids.push.apply(ids, l.qids));
    if (n.lessons) walk(n); else c.chapters.forEach(walk);
    return { ids: ids, title: n.title || c.title, course: c.id, node: n.id === c.id ? "" : n.id };
  }
  function idsOf(node) {
    if (!node) return null;
    if (node.qids) return node.qids;
    if (node.lessons) return node.lessons.reduce((a, l) => a.concat(l.qids || []), []);
    return null;
  }
  function countOf(node) {
    const qd = ML.qdata;
    if (!node) return 0;
    if (node.qids) return node.qids.length;
    if (node.lessons) return node.lessons.reduce((a, l) => a + (l.qids || []).length, 0);
    if (node.filter) return qd.filter(node.filter).length;
    return 0;
  }
  function doneOf(node) {
    const qd = ML.qdata, ids = idsOf(node);
    if (!ids) return 0;
    let n = 0;
    ids.forEach((id) => { const r = qd.rec(id); if (r && (r.c || r.w)) n++; });
    return n;
  }
  function pct(n, d) { return d ? Math.round((n / d) * 100) : 0; }

  ML.coursemap = { courseById, nodeOf, resolve, countOf, doneOf, idsOf, all: CO };

  /** hand a set of questions to the studio and jump there */
  function practise(sel, mode) {
    U.store.set("qs:focus", sel);
    location.hash = "#/questions/" + (mode || "study");
  }
  ML.practise = practise;

  /* ---------------------------------------------------------
     4. tiny view helpers
     --------------------------------------------------------- */
  function ring(p) {
    const r = 13, c = 2 * Math.PI * r;
    return `<span class="co-ring"><svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="${r}" fill="none" stroke="#e4e7ec" stroke-width="3.4"/>
      <circle cx="16" cy="16" r="${r}" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${c - (c * p) / 100}" transform="rotate(-90 16 16)"/></svg><b>${p}%</b></span>`;
  }

  function figCard(f, i) {
    const label = esc(f.label || ("Figure " + (i + 1)));
    const live = f.fn ? `<button class="btn ghost sm co-live" data-fn="${esc(f.fn)}">Plot it live</button>` : "";
    return `<figure class="co-fig">
      <div class="co-fig-art">${f.svg}</div>
      <figcaption><span>${label}</span>${live}</figcaption></figure>`;
  }

  /* ---------------------------------------------------------
     5. views
     --------------------------------------------------------- */
  function viewIndex(root, ctx) {
    const { courses, stats } = CO();
    const qd = ML.qdata;
    const total = qd.items.length;

    const head = U.el("section", { class: "co-head" });
    head.innerHTML = `
      <div>
        <div class="eyebrow">MathsLab · courses</div>
        <h1>Pick your course. Work lesson by lesson.</h1>
        <p class="lead">${courses.length} courses, ${stats.chapters} chapters and ${total.toLocaleString()} questions. Each lesson keeps what the
        original course pages had — the worked example you can step through, the graphs, a live graph lab — and adds a marked
        question set for exactly that lesson.</p>
      </div>
      <div class="co-head-stats">
        <div><b>${courses.length}</b><span>courses</span></div>
        <div><b>${stats.lessons}</b><span>lesson pages</span></div>
        <div><b>${stats.figures}</b><span>captured figures</span></div>
        <div><b>${total.toLocaleString()}</b><span>questions</span></div>
      </div>`;
    root.appendChild(head);

    const grid = U.el("div", { class: "co-cards" });
    courses.forEach((c) => {
      const qn = c.kind === "platform"
        ? c.chapters.reduce((a, ch) => a + ch.lessons.reduce((b, l) => b + l.qn, 0), 0)
        : c.chapters.reduce((a, ch) => a + (ch.n || 0), 0);
      const done = c.chapters.reduce((a, ch) => a + doneOf(ch), 0);
      const labs = window.MLMANIP && window.MLMANIP.forLesson
        ? c.chapters.reduce((a, ch) => a + (ch.lessons || []).filter((l) => window.MLMANIP.forLesson(l.id)).length, 0)
          + c.chapters.filter((ch) => !(ch.lessons || []).length && window.MLMANIP.forChapter && window.MLMANIP.forChapter(c.id, ch.id)).length
        : 0;
      const card = U.el("a", { class: "co-card", href: "#/courses/" + c.id, style: { "--c": c.color, "--ci": c.ink } });
      card.innerHTML = `
        <div class="co-card-top">
          <span class="co-ico">${c.icon}</span>
          ${ring(pct(done, Math.max(1, Math.min(qn, done ? qn : 1))))}
        </div>
        <h3>${esc(c.title)}</h3>
        <div class="co-meta">${esc(c.grade)} · ${c.chapters.length} chapters${c.kind === "platform" ? " · " + c.chapters.reduce((a, ch) => a + ch.lessons.length, 0) + " lessons" : ""}</div>
        <p>${esc(c.blurb)}</p>
        <div class="co-card-foot">
          <span class="co-n"><b>${qn.toLocaleString()}</b> questions</span>
          ${labs ? `<span class="co-lab-chip">${labs} interactive${labs === 1 ? "" : "s"}</span>` : ""}
          <span class="co-go">Open →</span>
        </div>`;
      grid.appendChild(card);
    });
    root.appendChild(grid);

    const strip = U.el("section", { class: "co-strip" });
    const s = qd.summary();
    strip.innerHTML = `
      <div>
        <h2>Or go straight to the whole deck</h2>
        <p class="muted small" style="margin:4px 0 0">Every question in the project — <b>${total.toLocaleString()}</b> of them — is still searchable in the studio,
        now with a course filter on top. You have opened ${s.seen.toLocaleString()} cards so far and starred ${s.starred}.</p>
      </div>
      <div class="btn-row">
        <a class="btn lg" href="#/questions">Question Studio</a>
        <a class="btn ghost lg" href="#/questions/practice">Practice 10</a>
      </div>`;
    root.appendChild(strip);
  }

  function viewCourse(root, ctx, course) {
    const wrap = U.el("div", { class: "co-course" });
    const totalQ = course.kind === "platform"
      ? course.chapters.reduce((a, ch) => a + ch.lessons.reduce((b, l) => b + l.qn, 0), 0)
      : course.chapters.reduce((a, ch) => a + (ch.n || 0), 0);
    const done = course.chapters.reduce((a, ch) => a + doneOf(ch), 0);

    wrap.innerHTML = `
      <nav class="co-crumb"><a href="#/courses">Courses</a><span>/</span><b>${esc(course.title)}</b></nav>
      <header class="co-chead" style="--c:${course.color};--ci:${course.ink}">
        <span class="co-ico lg">${course.icon}</span>
        <div>
          <h1>${esc(course.title)}</h1>
          <div class="co-meta">${esc(course.grade)} · ${course.chapters.length} chapters · ${totalQ.toLocaleString()} questions</div>
          <p>${esc(course.blurb)}</p>
        </div>
        <div class="co-chead-act">
          ${ring(pct(done, totalQ))}
          <button class="btn soft sm" id="coCoursePractice">Practise this course</button>
          ${GEN_OF[course.id] ? `<a class="btn ghost sm" id="coCourseGenerate" href="#/generator/${GEN_OF[course.id]}">Generate questions</a>` : ""}
        </div>
      </header>`;

    /* the course's live figure, straight under the header */
    if (ML.viz && ML.viz.has && ML.viz.has(course.id)) {
      const viz = ML.viz.panel(course.id);
      if (viz) wrap.appendChild(viz);
    }

    const list = U.el("div", { class: "co-chapters" });
    course.chapters.forEach((ch, ci) => {
      const chQ = countOf(ch), chDone = doneOf(ch);
      const box = U.el("section", { class: "co-chapter" });
      const rows = (ch.lessons || []).map((l) => {
        const d = doneOf(l), p = pct(d, l.qn);
        const mp = window.MLMANIP && window.MLMANIP.forLesson ? window.MLMANIP.forLesson(l.id) : null;
        const labChip = mp ? `<i class="co-lab-chip" title="interactive in this lesson">${esc(window.MLMANIP.label(mp.kind))}</i>` : "";
        return `<a class="co-lesson-row" href="${lessonUrl(course, l)}">
          <span class="co-code">${esc(l.code)}</span>
          <span class="co-lr-main">
            <b>${esc(l.title)}</b>
            <span class="co-topics">${(l.topics || []).slice(0, 4).map((t) => `<i>${esc(t)}</i>`).join("")}${(l.topics || []).length > 4 ? `<i>+${l.topics.length - 4}</i>` : ""}</span>
          </span>
          ${labChip}
          <span class="co-lr-meta">${l.qn ? `<b>${l.qn}</b> q` : "—"}${l.figures && l.figures.length ? ` · ${l.figures.length} fig` : ""}</span>
          ${ring(p)}
        </a>`;
      }).join("");
      const skills = (ch.skills || []).slice(0, 8).map((s) =>
        `<button class="co-skill" data-course="${course.id}" data-node="${ch.id}" data-skill="${esc(s.name)}">${esc(s.name)} <b>${s.n}</b></button>`).join("");
      const chLab = window.MLMANIP && window.MLMANIP.forChapter ? window.MLMANIP.forChapter(course.id, ch.id) : null;
      box.innerHTML = `
        <header class="co-ch-head">
          <div>
            <div class="eyebrow">Chapter ${ci + 1}${ch.book ? " · " + esc(ch.book) : ""}</div>
            <h2>${esc(ch.title)}</h2>
            ${ch.note ? `<p class="co-note">${esc(ch.note)}</p>` : ""}
          </div>
          <div class="co-ch-act">
            ${chLab && !rows ? `<i class="co-lab-chip" title="interactive in this chapter">${esc(window.MLMANIP.label(chLab.kind))}</i>` : ""}
            <span class="co-n"><b>${chQ.toLocaleString()}</b> questions</span>
            ${ring(pct(chDone, chQ))}
            ${chQ ? `<button class="btn ghost sm co-practise" data-course="${course.id}" data-node="${ch.id}">Practise</button>` : ""}
          </div>
        </header>
        ${rows ? `<div class="co-lessons">${rows}</div>` : ""}
        ${chLab && !rows ? `<div class="co-ch-lab"><div class="co-ch-lab-h"><b>Try it</b><span>${esc(window.MLMANIP.label(chLab.kind))} — this chapter's own interactive</span></div><div class="co-manip-host"></div></div>` : ""}
        ${skills ? `<div class="co-skills"><div class="co-skills-h">Skills in this chapter</div>${skills}</div>` : ""}`;
      if (chLab && !rows) {
        const host = box.querySelector(".co-manip-host");
        if (host) window.MLMANIP.mount(host, chLab.kind, chLab.opts);
      }
      list.appendChild(box);
    });
    wrap.appendChild(list);

    /* the .BOK banks that belong to this course */
    const qd = ML.qdata;
    const tg = qd && qd.filter ? qd.filter({ src: "tg", course: course.id }) : [];
    if (tg.length) {
      const byBook = {};
      tg.forEach((it) => { byBook[it.book] = (byBook[it.book] || 0) + 1; });
      const box = U.el("section", { class: "co-chapter" });
      box.innerHTML = `
        <header class="co-ch-head">
          <div>
            <div class="eyebrow">Recovered bank</div>
            <h2>TestGen <code>.BOK</code> — ${esc(course.title)}</h2>
            <p class="co-note">${tg.length.toLocaleString()} items decoded out of
              ${Object.keys(byBook).map((b) => esc(b)).join(" · ")} with <code>tools/parse_bok.py</code>.
              The maths that lived in the file's formula objects shows as ruled gaps you can fill in.</p>
          </div>
          <div class="co-ch-act">
            <span class="co-n"><b>${tg.length.toLocaleString()}</b> items</span>
            <button class="btn soft sm" id="coTgOpen">Open in Question Studio</button>
          </div>
        </header>
        <div class="co-skills">
          <div class="co-skills-h">Breakdown</div>
          ${Object.keys(byBook).sort().map((b) => `<span class="co-skill">${esc(b)} <b>${byBook[b]}</b></span>`).join("")}
          <span class="co-skill">questions <b>${tg.filter((x) => x.kind === "stem").length}</b></span>
          <span class="co-skill">shared instructions <b>${tg.filter((x) => x.kind === "rubric").length}</b></span>
        </div>`;
      wrap.insertBefore(box, list.nextSibling || null);
      box.querySelector("#coTgOpen").addEventListener("click", () => {
        practise({ filter: { src: "tg", course: course.id },
                   title: "TestGen .BOK — " + course.title }, "study");
      });
    }

    const nav = U.el("div", { class: "co-coursefoot" });
    const genId = GEN_OF[course.id];
    const genN = genId && ML.gen ? ML.gen.families(genId).length : 0;
    nav.innerHTML = `<a class="btn ghost" href="#/courses">← All courses</a>` +
      (genId ? `<a class="btn ghost" href="#/generator/${genId}">Generate ${genN} recipes as a worksheet</a>` : "");
    wrap.appendChild(nav);
    root.appendChild(wrap);

    wrap.querySelector("#coCoursePractice").addEventListener("click", () => {
      const sel = resolve(course.id);
      practise(sel, "practice");
    });
    wrap.querySelectorAll(".co-practise").forEach((b) => b.addEventListener("click", () => {
      practise(resolve(b.dataset.course, b.dataset.node), "practice");
    }));
    wrap.querySelectorAll(".co-skill").forEach((b) => b.addEventListener("click", () => {
      const f = Object.assign({}, (nodeOf(course, b.dataset.node) || {}).filter || {}, { skill: b.dataset.skill });
      practise({ filter: f, title: b.dataset.skill, course: course.id, node: b.dataset.node }, "practice");
    }));
  }

  function viewLesson(root, ctx, course, lesson) {
    const qd = ML.qdata;
    const wrap = U.el("div", { class: "co-lesson" + (lesson.nolab ? " no-lab" : "") });
    const qn = (lesson.qids || []).length;
    const done = doneOf(lesson);

    wrap.innerHTML = `
      <nav class="co-crumb">
        <a href="#/courses">Courses</a><span>/</span>
        <a href="#/courses/${course.id}">${esc(course.title)}</a><span>/</span>
        <b>${esc(lesson.code)}</b>
      </nav>
      <header class="co-lhead" style="--c:${course.color};--ci:${course.ink}">
        <div>
          <div class="eyebrow">${esc(course.title)} · ${esc(lesson.chapter || "")}</div>
          <h1><span class="co-code big">${esc(lesson.code)}</span>${esc(lesson.title)}</h1>
          <div class="co-topics big">${(lesson.topics || []).map((t) => `<i>${esc(t)}</i>`).join("")}</div>
        </div>
        <div class="co-lhead-act">
          ${ring(pct(done, qn))}
          ${qn ? `<button class="btn sm" id="coLessonPractice">Practise ${qn} questions</button>` : ""}
        </div>
      </header>`;

    /* ---- the idea, in plain words ---- */
    const B = lesson.body || {};
    if (B.idea) {
      const idea = U.el("section", { class: "co-block co-idea" });
      const paras = String(B.idea).split(/\n\s*\n/).filter((t) => t.trim());
      idea.innerHTML = `
        <header class="co-block-h">
          <div><div class="eyebrow">The idea</div><h2>${esc(lesson.title)}, in plain words</h2></div>
        </header>
        <div class="co-idea-body">
          <div class="co-prose">${paras.map((t) => `<p>${ML.qdata.html(t)}</p>`).join("")}</div>
          ${B.watch ? `<div class="co-watch"><b>Watch out</b><span>${ML.qdata.html(B.watch)}</span></div>` : ""}
        </div>`;
      wrap.appendChild(idea);
    }

    /* ---- the manipulatives lab: one interactive per lesson ---- */
    const MP = window.MLMANIP;
    const spec = MP && lesson.id ? MP.forLesson(lesson.id) : null;
    if (spec) {
      const manip = U.el("section", { class: "co-block co-manip" });
      manip.innerHTML = `<header class="co-block-h">
          <div><div class="eyebrow">Try it</div><h2>Move it and watch the maths answer back</h2>
          <p class="muted small">Nothing here is graded — drag, click and slide until the rule feels obvious.</p></div>
        </header>`;
      const host = U.el("div", { class: "co-manip-host" });
      manip.appendChild(host);
      wrap.appendChild(manip);
      try { MP.mount(host, spec.kind, spec.opts || {}); } catch (e) { host.textContent = ""; }
    }

    /* ---- worked example, one step at a time ---- */
    if (lesson.steps && lesson.steps.length) {
      const sec = U.el("section", { class: "co-block co-steps" });
      sec.innerHTML = `
        <header class="co-block-h">
          <div><div class="eyebrow">Worked example</div><h2>Build it up step by step</h2>
            <p class="muted small">The same steps the course page walked through — reveal them one at a time and predict each before you look.</p></div>
          <div class="co-step-ctl">
            <span class="co-step-n"><b id="coStepI">1</b> / ${lesson.steps.length}</span>
            <button class="btn ghost sm" id="coStepPrev">Back</button>
            <button class="btn sm" id="coStepNext">Next step</button>
            <button class="btn ghost sm" id="coStepAll">Reveal all</button>
          </div>
        </header>
        <ol class="co-step-list" id="coStepList"></ol>`;
      wrap.appendChild(sec);

      const list = sec.querySelector("#coStepList");
      let shown = 1;
      const paint = () => {
        list.innerHTML = lesson.steps.map((s, i) => {
          if (i >= shown) return `<li class="co-step hidden"><span class="co-step-i">${i + 1}</span><div class="co-step-b"><span class="muted">•••</span></div></li>`;
          const K = window.katex;
          const tex = (s.tex || []).map((t) => {
            try { return K ? K.renderToString(t, { throwOnError: false, displayMode: true }) : esc(t); }
            catch (e) { return esc(t); }
          }).join("");
          return `<li class="co-step on"><span class="co-step-i">${i + 1}</span>
            <div class="co-step-b">
              ${s.label ? `<div class="co-step-l">${esc(s.label)}</div>` : ""}
              ${tex ? `<div class="co-tex">${tex}</div>` : `<p>${esc(s.text || "")}</p>`}
            </div></li>`;
        }).join("");
        sec.querySelector("#coStepI").textContent = Math.min(shown, lesson.steps.length);
        list.querySelectorAll(".co-step.on").forEach((el) => { el.classList.add("pop"); setTimeout(() => el.classList.remove("pop"), 260); });
      };
      paint();
      sec.querySelector("#coStepNext").addEventListener("click", () => { if (shown < lesson.steps.length) { shown++; paint(); } });
      sec.querySelector("#coStepPrev").addEventListener("click", () => { if (shown > 1) { shown--; paint(); } });
      sec.querySelector("#coStepAll").addEventListener("click", () => { shown = lesson.steps.length; paint(); });
    }

    /* ---- captured figures + live graph lab ---- */
    const lab = U.el("section", { class: "co-block co-lab" });
    const firstFn = (lesson.figures || []).filter((f) => f.fn)[0];
    const seed = lesson.seed || (firstFn && firstFn.fn) || "x^2 - 3";
    lab.innerHTML = `
      <header class="co-block-h">
        <div><div class="eyebrow">Graph lab</div><h2>Plot it, drag it, retype it</h2>
          <p class="muted small">Type any function of <b>x</b> — several at once, separated by <b>;</b>. Drag to pan, scroll to zoom, double-click to reset.</p></div>
      </header>
      <div class="co-lab-in">
        <div class="co-lab-ctl">
          <label for="coExpr">y =</label>
          <input class="input" id="coExpr" value="${esc(seed)}" spellcheck="false" autocomplete="off">
          <button class="btn sm" id="coPlot">Plot</button>
          <button class="btn ghost sm" id="coReset">Reset view</button>
          <button class="btn ghost sm" id="coTangent" aria-pressed="false" title="draw the tangent and read f′(x)  (T)">Tangent</button>
          <button class="btn ghost sm" id="coArea" aria-pressed="false" title="shade the area between A and B and estimate it  (A)">Area A→B</button>
          <button class="btn ghost sm" id="coSweep" title="walk a point along the curve">▷ Sweep</button>
          <span class="co-trace" id="coTrace">—</span>
        </div>
        <canvas class="co-canvas" id="coCanvas" aria-label="Interactive graph"></canvas>
        <div class="co-lab-hint">${(lesson.figures || []).length ? "Captured from the course page: " + esc((lesson.figures || []).filter((f) => f.fn).map((f) => "y = " + f.fn).join("  ·  ") || "—") : "No captured graph in this lesson — plot your own."}</div>
      </div>`;
    wrap.appendChild(lab);

    const canvas = lab.querySelector("#coCanvas");
    const trace = lab.querySelector("#coTrace");
    const plot = makePlot(canvas, {
      onTrace: (x, ys, extraTxt) => {
        const base = x == null ? "—" : "x = " + U.fmt(x, 2) + (ys.length ? "   y = " + ys.map((v) => (isFinite(v) ? U.fmt(v, 2) : "—")).join(", ") : "");
        trace.textContent = (base === "—" ? "" : base) + (extraTxt ? (base === "—" ? "" : "   ") + extraTxt : "") || "—";
      },
      onToggle: () => syncToggles(),
    });
    /* the lesson graph lab is a stage too: one bounded box, full-screen switch */
    if (ML.stage) ML.stage.frame(canvas.parentElement, { draw: () => plot.draw(), height: "clamp(300px, 46vh, 540px)" });
    /* the three extras: tangent + slope, a shaded area A→B, a sweeping point */
    const tBtn = lab.querySelector("#coTangent");
    const aBtn = lab.querySelector("#coArea");
    const syncToggles = () => {
      const st = plot.state;
      tBtn.classList.toggle("on", !!st.tangent);
      tBtn.setAttribute("aria-pressed", String(!!st.tangent));
      aBtn.classList.toggle("on", !!st.area);
      aBtn.setAttribute("aria-pressed", String(!!st.area));
      trace.textContent = plot.readout() || trace.textContent;
    };
    tBtn.addEventListener("click", () => { plot.setTangent(); syncToggles(); });
    aBtn.addEventListener("click", () => {
      const on = plot.setArea();
      if (on) plot.setMarkers(-2, 2);
      syncToggles();
    });
    lab.querySelector("#coSweep").addEventListener("click", () => plot.sweep(4200));
    const apply = () => {
      const n = plot.setExprs(lab.querySelector("#coExpr").value);
      if (!n) { ML.toast("Could not read that expression", "no"); lab.querySelector("#coExpr").value = seed; plot.setExprs(seed); }
    };
    /* a lesson seed the plotter cannot read is not the reader's mistake: fall back quietly */
    if (!plot.setExprs(seed)) {
      const fb = /sin|cos/i.test(seed) ? "sin(x)" : "x^2";
      lab.querySelector("#coExpr").value = fb;
      plot.setExprs(fb);
      const hint = lab.querySelector(".co-lab-hint");
      if (hint) hint.innerHTML = "This lesson has no single curve to plot — the figure above is the one to move. Start from <b>y = " + fb + "</b> and plot your own.";
    }
    lab.querySelector("#coPlot").addEventListener("click", apply);
    lab.querySelector("#coExpr").addEventListener("keydown", (e) => { if (e.key === "Enter") apply(); });
    lab.querySelector("#coReset").addEventListener("click", () => plot.reset());
    canvas.addEventListener("pointermove", () => { if (plot.state.tangent || plot.state.area) trace.textContent = plot.readout() || "—"; });

    if ((lesson.figures || []).length) {
      const figs = U.el("section", { class: "co-block co-figs" });
      figs.innerHTML = `<header class="co-block-h">
          <div><div class="eyebrow">From the course page</div><h2>The graphs this lesson shipped with</h2>
          <p class="muted small">Recovered from the captured lesson page, redrawn inline — no images, no network.</p></div>
        </header>
        <div class="co-fig-grid">${(lesson.figures || []).map(figCard).join("")}</div>`;
      wrap.appendChild(figs);
      figs.querySelectorAll(".co-live").forEach((b) => b.addEventListener("click", () => {
        const input = lab.querySelector("#coExpr");
        input.value = b.dataset.fn;
        plot.setExprs(b.dataset.fn);
        lab.scrollIntoView({ behavior: "smooth", block: "center" });
        input.focus(); input.select();
      }));
    }

    /* ---- sliders + limits: the figure pattern the course pages ship with ---- */
    if (ML.gcWidget && !lesson.nolab) {
      const seedSrc = String(lesson.seed || "").replace(/³/g, "^3").replace(/²/g, "^2").trim();
      const family = /sin|cos/i.test(seedSrc) ? "a sin(b (x - h)) + k"
        : /\^3/.test(seedSrc) ? "a (x - h)^3 + k"
        : "a (x - h)^2 + k";
      const sl = U.el("section", { class: "co-block co-sliders" });
      sl.innerHTML = `
        <header class="co-block-h">
          <div><div class="eyebrow">Sliders &amp; limits</div><h2>One figure, a few numbers to drag</h2>
            <p class="muted small">Move <b>a</b>, <b>h</b> and <b>k</b> and watch the shape answer back — then walk a point in from
            the left and from the right and decide whether the two sides ever meet.</p></div>
        </header>
        <div class="co-slider-grid">
          <div class="co-slider-card"><h3>The same curve, every value of a, h and k</h3><div id="coFam"></div></div>
          <div class="co-slider-card"><h3>Approaching the point a</h3><div id="coLim"></div></div>
        </div>`;
      wrap.appendChild(sl);
      try {
        ML.gcWidget(sl.querySelector("#coFam"), {
          expr: family, height: 250, window: [-6, 6, -8, 8],
          caption: "Slider figure: " + family,
          steps: ["<b>a</b> stretches the curve — negative values flip it over the x-axis.",
            "<b>h</b> slides it left and right (the sign is the wrong way round, as always).",
            "<b>k</b> lifts the whole curve up or down.",
            "Read the turning point straight off the figure: it sits at (h, k)."],
        });
        ML.gcWidget(sl.querySelector("#coLim"), {
          expr: "(x^2 - 1) / (x - 1)", height: 250, window: [-3, 4, -2, 5], caption: "Two-sided limit figure",
          limit: { a: { min: -2, max: 3, step: 0.5, value: 1 }, eps: { min: 0.1, max: 1, step: 0.1, value: 0.4 } },
          steps: ["Set <b>a</b> = 1. The function is undefined there, so f(1) shows a dash — a hole.",
            "Shrink <b>ε</b>: the values from the left (green) and the right (amber) close on each other.",
            "Both sides head for 2, so the limit is 2 even though f(1) does not exist.",
            "Now set <b>a</b> = 0 and watch the same idea give the value the curve actually has."],
        });
      } catch (e) { console.error(e); }
    }

    /* ---- your turn ---- */
    const turn = U.el("section", { class: "co-block co-turn" });
    const items = (lesson.qids || []).map((id) => qd.byId[id]).filter(Boolean);
    turn.innerHTML = `
      <header class="co-block-h">
        <div><div class="eyebrow">Your turn</div><h2>${qn ? qn + " questions for this lesson" : "No questions filed under this lesson yet"}</h2>
          <p class="muted small">${lesson.review ? "A review lesson draws on every question from its chapter." : "Every question filed under this lesson, with its answer key, hint and per-option feedback."}</p></div>
        ${qn ? `<div class="co-step-ctl"><span class="co-step-n" id="coTurnN"></span>
        <button class="btn ghost sm" id="coTurnPrev">Back</button><button class="btn ghost sm" id="coTurnNext">Next</button>
        <button class="btn sm" id="coTurnAll">Open all in the studio</button></div>` : ""}
      </header>
      <div class="co-turn-body" id="coTurnBody"></div>`;
    wrap.appendChild(turn);

    if (items.length) {
      const body = turn.querySelector("#coTurnBody");
      let i = 0, card = null;
      const nEl = turn.querySelector("#coTurnN");
      const paint = () => {
        if (card && card.destroy) card.destroy();
        body.innerHTML = "";
        card = ML.qcard.create(body, items[i], {
          index: i, total: items.length,
          unit: lesson.code + " · " + lesson.title,
          onNext: () => { if (i < items.length - 1) { i++; paint(); } },
          onPrev: () => { if (i > 0) { i--; paint(); } },
        });
        nEl.textContent = (i + 1) + " / " + items.length;
      };
      paint();
      turn.querySelector("#coTurnNext").addEventListener("click", () => { if (i < items.length - 1) { i++; paint(); } });
      turn.querySelector("#coTurnPrev").addEventListener("click", () => { if (i > 0) { i--; paint(); } });
      turn.querySelector("#coTurnAll").addEventListener("click", () => practise({ ids: lesson.qids, title: lesson.code + " · " + lesson.title, course: course.id, node: lesson.id }, "study"));
    }

    /* ---- prev / next lesson ---- */
    const p = lesson.prev ? CO().lessons[lesson.prev] : null;
    const nx = lesson.next ? CO().lessons[lesson.next] : null;
    const foot = U.el("nav", { class: "co-lessonnav" });
    foot.innerHTML =
      (p ? `<a class="co-ln" href="${lessonUrl(course, p)}"><span>← Previous</span><b>${esc(p.code)} · ${esc(p.title)}</b></a>` : "<span></span>") +
      (nx ? `<a class="co-ln next" href="${lessonUrl(course, nx)}"><span>Next →</span><b>${esc(nx.code)} · ${esc(nx.title)}</b></a>` : "<span></span>");
    wrap.appendChild(foot);

    root.appendChild(wrap);

    const btn = wrap.querySelector("#coLessonPractice");
    if (btn) btn.addEventListener("click", () => practise({ ids: lesson.qids, title: lesson.code + " · " + lesson.title, course: course.id, node: lesson.id }, "practice"));
  }

  /* ---------------------------------------------------------
     6. register the app
     --------------------------------------------------------- */
  ML.register({
    id: "courses",
    group: "questions",
    title: "Courses",
    short: "Courses",
    icon: ML.icon("bulb"),
    color: ["#eeecff", "#4b3ee0"],
    tag: "the front door — start here",
    blurb: "Courses organised lesson by lesson: Fundamentals of Math — the whole pre-algebra floor with its own worked steps and 200-question bank — then Calculus and Precalculus with captured graphs and a live graph lab; the three Holt question-bank books by chapter; and the FikrCounts exam programs by skill.",
    tags: ["courses", "lessons", "worked examples", "graph lab"],
    mount(root, ctx) {
      const sub = ((ctx && ctx.sub) || "").replace(/^\/+|\/+$/g, "");
      root.innerHTML = "";
      const view = U.el("div", { class: "co" });
      root.appendChild(view);
      if (!sub) return viewIndex(view, ctx);
      const bits = sub.split("/");
      const course = courseById(bits[0]);
      if (!course) {
        view.innerHTML = `<div class="empty">No such course. <a href="#/courses">Back to courses</a></div>`;
        return;
      }
      if (bits.length > 1) {
        const key = bits[1].indexOf(":") >= 0 ? bits[1] : course.id + ":" + bits[1];
        const lesson = CO().lessons[key];
        if (lesson && lesson.qids) return viewLesson(view, ctx, course, lesson);
      }
      return viewCourse(view, ctx, course);
    },
  });
})();

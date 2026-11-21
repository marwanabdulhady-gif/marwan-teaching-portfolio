/* ===========================================================
   MathsLab — the stage: one place where a graph lives.

   Every plotting tool on the site (the graphing calculator, the
   function plotter, the polar plotter, the lesson graph lab and
   the small lesson figures) puts its canvas inside a stage:

     · the box is a FIXED, bounded area (a CSS height clamp), so the
       graph never spills down the page or pushes the layout about;
     · the canvas is always exactly the size of that box, at device
       resolution, and it redraws when the box changes size
       (window resize, sidebar collapse, orientation change);
     · a Full screen button blows the same box up to the whole
       viewport and Escape puts it back — done with a CSS overlay,
       not the Fullscreen API, so it also works inside sandboxed
       preview frames and offline.

   Usage:
     ML.stage.frame(hostEl, { draw, height, label })
     ML.stage.watch(canvas, draw)       // resize-only wiring
   =========================================================== */
(function () {
  "use strict";
  const ML = (window.ML = window.ML || {});
  const U = (ML.u = ML.u || {});

  const watched = new WeakMap();   // canvas -> { draw }
  const frames = new Set();
  let locked = 0;

  const debounce = (fn, ms) => {
    let t = null;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  };

  function deviceRatio() {
    const d = window.devicePixelRatio || 1;
    return Math.min(Math.max(d, 1), 2.5);
  }

  /** Size the canvas to its box at device resolution (CSS keeps the box). */
  function fitBox(cv) {
    if (!cv || !cv.getContext) return null;
    const box = cv.parentElement || cv;
    let w = Math.round(cv.clientWidth || box.clientWidth || 0);
    let h = Math.round(cv.clientHeight || box.clientHeight || 0);
    if (!w) w = Math.max(240, Math.round(box.getBoundingClientRect ? box.getBoundingClientRect().width : 0) || 320);
    if (!h) h = Math.max(180, Number(cv.getAttribute("height")) || 320);
    const d = deviceRatio();
    if (cv.width !== Math.round(w * d) || cv.height !== Math.round(h * d)) {
      cv.width = Math.round(w * d);
      cv.height = Math.round(h * d);
    }
    const ctx = cv.getContext("2d");
    if (ctx && ctx.setTransform) ctx.setTransform(d, 0, 0, d, 0, 0);
    return { ctx, w, h, dpr: d };
  }

  /** Redraw this canvas whenever its box changes size. */
  function watch(cv, draw) {
    if (!cv) return null;
    const prev = watched.get(cv);
    watched.set(cv, { draw: typeof draw === "function" ? draw : (prev && prev.draw) });
    const entry = watched.get(cv);
    if (!entry.ro && typeof window.ResizeObserver === "function") {
      const target = cv.parentElement || cv;
      entry.ro = new window.ResizeObserver(debounce(() => {
        if (!cv.isConnected) return;
        const d = watched.get(cv);
        if (d && d.draw) d.draw();
      }, 90));
      try { entry.ro.observe(target); } catch (e) {}
    }
    return cv;
  }

  /* one window listener for every watched canvas */
  if (typeof window !== "undefined" && !window.__mlStageResize) {
    window.__mlStageResize = true;
    window.addEventListener("resize", debounce(() => {
      frames.forEach((f) => { const d = watched.get(f.cv); if (d && d.draw && f.cv.isConnected) d.draw(); });
    }, 130));
    window.addEventListener("orientationchange", debounce(() => {
      frames.forEach((f) => { const d = watched.get(f.cv); if (d && d.draw && f.cv.isConnected) d.draw(); });
    }, 220));
  }

  /* ---------------- full screen (in-page theatre) ---------------- */
  function setLock(on) {
    locked = Math.max(0, locked + (on ? 1 : -1));
    if (document.body) document.body.classList.toggle("mstage-lock", locked > 0);
  }

  function fullscreenFrame() {
    for (const f of frames) if (f.el.classList.contains("is-full")) return f;
    return null;
  }

  function exitAll(except) {
    frames.forEach((f) => { if (f !== except && f.el.classList.contains("is-full")) f.set(false); });
  }

  /** Wrap a plot area in the stage and give it a full-screen switch. */
  function frame(host, opts) {
    opts = opts || {};
    if (!host) return null;
    if (host.__mstage) {
      if (typeof opts.draw === "function") host.__mstage.draw = opts.draw;
      return host.__mstage;
    }
    const cv = host.querySelector("canvas");
    if (!cv) return null;

    host.classList.add("mstage");
    if (opts.height) host.style.setProperty("--mstage-h", opts.height);
    /* the box decides the size — never an inline pixel height */
    cv.style.removeProperty("height");
    cv.style.removeProperty("width");
    cv.classList.add("mstage-cv");

    let body = cv.parentElement;
    if (!body || !body.classList.contains("mstage-body")) {
      body = document.createElement("div");
      body.className = "mstage-body";
      if (cv.parentNode) cv.parentNode.insertBefore(body, cv);
      body.appendChild(cv);
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mstage-fs";
    btn.setAttribute("aria-pressed", "false");
    btn.title = "Full screen — press F, Escape to come back";
    btn.innerHTML = '<span class="mstage-fs-ico" aria-hidden="true">⤢</span><span class="mstage-fs-txt">Full screen</span>';
    host.appendChild(btn);

    const api = {
      el: host, body, cv, btn,
      draw: typeof opts.draw === "function" ? opts.draw : null,
      refresh() {
        if (!this.draw) return;
        try { this.draw(); } catch (e) { console.error(e); }
        /* the box may have changed after the class flip — draw once more */
        if (this.el.classList.contains("is-full")) setTimeout(() => { try { this.draw(); } catch (e) {} }, 40);
      },
      isFull: () => host.classList.contains("is-full"),
      set(on) {
        on = !!on;
        if (this.isFull() === on) return this;
        if (on) exitAll(this);
        host.classList.toggle("is-full", on);
        document.documentElement.classList.toggle("mstage-has-full", on || !!fullscreenFrame());
        btn.setAttribute("aria-pressed", String(on));
        btn.querySelector(".mstage-fs-txt").textContent = on ? "Exit" : "Full screen";
        btn.title = on ? "Exit full screen (Esc)" : "Full screen — press F, Escape to come back";
        setLock(on);
        this.refresh();
        return this;
      },
      toggle() { return this.set(!this.isFull()); },
    };
    api.set = api.set.bind(api);
    api.toggle = api.toggle.bind(api);
    api.refresh = api.refresh.bind(api);

    btn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); api.toggle(); });
    /* a double-click on the plot is the other obvious way in */
    cv.addEventListener("dblclick", (e) => {
      if (opts.dblclick === false) return;
      e.preventDefault();
      api.toggle();
    });

    frames.add(api);
    host.__mstage = api;
    watch(cv, () => api.refresh());
    return api;
  }

  /* Escape leaves, F toggles — but never while typing into a field */
  if (typeof document !== "undefined" && !window.__mlStageKeys) {
    window.__mlStageKeys = true;
    document.addEventListener("keydown", (e) => {
      const f = fullscreenFrame();
      const tag = (e.target && e.target.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select" || (e.target && e.target.isContentEditable);
      if (e.key === "Escape" && f) { f.set(false); e.preventDefault(); return; }
      if (typing) return;
      if ((e.key === "f" || e.key === "F") && f) { f.set(false); e.preventDefault(); }
    });
  }

  /* Square up a plot window so one x-unit and one y-unit are the same
     number of pixels. Without this a wide box squashes every curve: an
     860 × 306 plot of a parabola over −8…8 × −9…9 has 50 px per x-unit and
     only 14 px per y-unit, which is the "the graph is stretched" complaint.
     The centre and the tighter axis are kept; the roomier axis gets more
     span, exactly like a graphing calculator does. */
  function square(o, w, h, pad) {
    pad = pad || 0;
    const aw = Math.max(40, w - 2 * pad), ah = Math.max(40, h - 2 * pad);
    const sx = o.x1 - o.x0, sy = o.y1 - o.y0;
    if (!(sx > 0) || !(sy > 0)) return o;
    const u = Math.min(aw / sx, ah / sy);
    const cx = (o.x0 + o.x1) / 2, cy = (o.y0 + o.y1) / 2;
    let hx = aw / (2 * u), hy = ah / (2 * u);
    /* snap the expanded span to a readable number (within 15 %, so the two
       scales stay square enough to be invisible) — nobody wants a window
       that reads ±13.41 */
    const nice = (v) => {
      const pw = Math.pow(10, Math.floor(Math.log(v) / Math.LN10));
      const f = v / pw;
      return (f < 1.15 ? 1 : f < 1.4 ? 1.25 : f < 1.75 ? 1.5 : f < 2.2 ? 2 : f < 2.7 ? 2.5 : f < 3.5 ? 3 : f < 4.5 ? 4 : f < 5.5 ? 5 : f < 6.5 ? 6 : f < 7.5 ? 7 : f < 8.5 ? 8 : f < 9.5 ? 9 : 10) * pw;
    };
    const snap = (h) => { const n = nice(2 * h) / 2; return Math.abs(n - h) / h < 0.15 ? n : h; };
    const grewX = (aw / sx) > (ah / sy);
    if (grewX) hx = snap(hx); else hy = snap(hy);
    o.x0 = cx - hx; o.x1 = cx + hx;
    o.y0 = cy - hy; o.y1 = cy + hy;
    return o;
  }

  ML.stage = {
    frame,
    square,
    watch,
    fit: fitBox,
    /* go full screen from code / tests: ML.stage.full(elOrIndex) */
    full(el) {
      if (el && el.__mstage) return el.__mstage.set(true);
      const list = [...frames];
      const f = typeof el === "number" ? list[el] : list[0];
      return f ? f.set(true) : null;
    },
    exitAll() { frames.forEach((f) => f.set(false)); },
    frames: () => [...frames],
    current: fullscreenFrame,
  };
})();

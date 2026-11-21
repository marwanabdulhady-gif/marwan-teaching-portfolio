/* ===========================================================
   MathsLab — manipulatives
   One small interactive for every lesson: drag it, click it,
   watch it answer back. No libraries, no network — SVG + DOM.
   API: MLMANIP.mount(host, kind, opts) · MLMANIP.forLesson(id)
   =========================================================== */
(function () {
/* ===========================================================
   MathsLab — manipulatives
   One small interactive per lesson: drag it, click it, watch it
   answer back. No libraries, no network — SVG + DOM only.
   API: MLMANIP.mount(host, kind, opts) · MLMANIP.forLesson(id)
   =========================================================== */
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const C = { ink: "#10172a", ink2: "#475467", muted: "#8a94a6", line: "#e4e8f0", accent: "#6f5bf0", warm: "#b4530a", green: "#15803d", red: "#c2410c" };

  /* ---------------- tiny helpers ---------------- */
  function el(tag, attrs, kids) {
    const n = document.createElement(tag);
    apply(n, attrs);
    (kids || []).forEach((k) => k && n.append(k));
    return n;
  }
  function apply(n, attrs) {
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v == null || v === false) return;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k === "html") n.innerHTML = v;
      else if (k === "style") n.setAttribute("style", v);
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2).toLowerCase(), v);
      else n.setAttribute(k, v);
    });
  }
  function s(tag, attrs, kids) {
    const n = document.createElementNS(NS, tag);
    applySVG(n, attrs || {});
    (kids || []).forEach((k) => k && n.append(k));
    return n;
  }
  function applySVG(n, attrs) {
    Object.entries(attrs).forEach(([k, v]) => {
      if (v == null || v === false) return;
      if (k === "text") n.textContent = v;
      else if (k === "class") n.setAttribute("class", v);
      else if (k === "style") n.setAttribute("style", ((n.getAttribute("style") || "").replace(/;?$/, ";")) + v);
      else if (k === "fill" || k === "stroke") n.style[k] = v;   /* a stylesheet rule must not flatten a chosen colour */
      else if (k === "stroke-width" || k === "fill-opacity" || k === "stroke-opacity" || k === "stroke-dasharray")
        n.style[k.replace(/-([a-z])/g, (m, c) => c.toUpperCase())] = v;
      else n.setAttribute(k, v);
    });
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmt = (n, d) => {
    const v = Math.abs(n) < 1e-12 ? 0 : n;
    let out = d == null ? String(Math.round(v * 1e6) / 1e6) : v.toFixed(d);
    return out;
  };
  let CLIPN = 0;
  /* graph labs draw curves that leave the frame: keep them inside it */
  function panelClip(svg, x, y, w, h) {
    const id = "mnpclip" + (++CLIPN);
    svg.append(s("clipPath", { id }, [s("rect", { x, y, width: w, height: h })]));
    return "url(#" + id + ")";
  }
  const guard = (fn) => {
    try { return fn(); } catch (e) { return null; }
  };

  /* the shell every lab sits in */
  function shell(kind, title, hint) {
    const root = el("div", { class: "mnp", "data-mnp": kind });
    const head = el("div", { class: "mnp-h" }, [
      el("b", { text: title }),
      el("span", { class: "mnp-hint", text: hint || "" }),
    ]);
    const body = el("div", { class: "mnp-body" });
    root.append(head, body);
    return { root, body };
  }

  function slider(opts, onInput) {
    const wrap = el("label", { class: "mnp-sl" });
    const lab = el("span", { class: "mnp-sl-l", text: opts.label || "" });
    const inp = el("input", {
      type: "range", min: opts.min, max: opts.max, step: opts.step || 1, value: opts.value,
      "aria-label": opts.label || "value", class: "mnp-range",
    });
    const out = el("b", { class: "mnp-sl-v", text: String(opts.value) });
    inp.addEventListener("input", () => {
      const v = Number(inp.value);
      out.textContent = opts.show ? opts.show(v) : String(v);
      onInput(v);
    });
    if (opts.show) out.textContent = opts.show(Number(opts.value));
    wrap.append(lab, inp, out);
    wrap.input = inp; wrap.out = out;
    return wrap;
  }

  function seg(opts, onPick) {
    const wrap = el("div", { class: "mnp-seg" });
    const buttons = opts.options.map((o, i) => {
      const b = el("button", { class: "mnp-seg-b" + (i === opts.value ? " on" : ""), type: "button", text: o.label, "data-v": o.value });
      b.addEventListener("click", () => {
        buttons.forEach((x) => x.classList.remove("on"));
        b.classList.add("on");
        onPick(o.value);
      });
      wrap.append(b);
      return b;
    });
    wrap.pick = (v) => {
      const i = opts.options.findIndex((o) => o.value === v);
      if (i >= 0) { buttons.forEach((x) => x.classList.remove("on")); buttons[i].classList.add("on"); }
    };
    return wrap;
  }

  function readout(initial) {
    const n = el("div", { class: "mnp-out", html: initial || "" });
    return n;
  }

  /* ===================================================================
     1. ORDER OF OPERATIONS — click a step, watch the value change
     =================================================================== */
  function orderlab(opts) {
    opts = opts || {};
    const { root, body } = shell("orderlab", opts.title || "Order of operations",
      "Click the operation you would do next, in the right order.");
    const exprs = opts.exprs || ["3 + 4 × 2", "2 + 3 × 4²", "(2 + 3) × 4", "12 ÷ 4 × 3"];
    let which = 0, done = [], wrong = 0;
    const stage = el("div", { class: "mnp-stage" });
    const stair = s("svg", { viewBox: "0 0 640 84", class: "mnp-svg mnp-stair", role: "img", "aria-label": "order of operations" });
    const BANDS = [["brackets", "1 · brackets"], ["powers", "2 · powers"], ["× ÷", "3 · × and ÷, left to right"], ["+ −", "4 · + and −, left to right"]];
    const out = readout("");
    const ctl = el("div", { class: "mnp-ctl" });
    const pick = seg({ options: exprs.map((e, i) => ({ label: "Example " + (i + 1), value: i })), value: 0 }, (v) => { which = v; done = []; wrong = 0; paint(); });
    ctl.append(pick, el("button", {
      class: "mnp-btn", type: "button", text: "Start again",
      onclick: () => { done = []; wrong = 0; paint(); },
    }));
    body.append(stair, stage, ctl, out);

    const TESTS = [
      // token list, correct order, value after each step
      { toks: [["3", "n"], ["+", "op"], ["4", "n"], ["×", "op"], ["2", "n"]], order: [3, 1, 0] },
      { toks: [["2", "n"], ["+", "op"], ["3", "n"], ["×", "op"], ["4", "n"], ["²", "pow"]], order: [5, 3, 1, 0] },
      { toks: [["(", "br"], ["2", "n"], ["+", "op"], ["3", "n"], [")", "br"], ["×", "op"], ["4", "n"]], order: [2, 5] },
      { toks: [["12", "n"], ["÷", "op"], ["4", "n"], ["×", "op"], ["3", "n"]], order: [1, 3] },
    ];

    function bandFor(kind) {
      return kind === "br" ? 0 : kind === "pow" ? 1 : kind === "op" ? null : 3;
    }
    function paintStair(active) {
      stair.innerHTML = "";
      BANDS.forEach(([key, label], i) => {
        const w = 640 / 4 - 8;
        const x = 4 + i * (640 / 4);
        const on = active === i;
        stair.append(s("rect", { x, y: 8 + i * 4, width: w, height: 60, rx: 10, fill: on ? "#efeaff" : "#fbfbfe", stroke: on ? C.accent : "#e4e8f0", "stroke-width": on ? 2 : 1.4 }));
        stair.append(s("text", { x: x + w / 2, y: 40, "text-anchor": "middle", class: "mnp-tick", fill: on ? C.accent : "#8a94a6", text: label }));
        if (on) stair.append(s("text", { x: x + w / 2, y: 58, "text-anchor": "middle", class: "mnp-tick", fill: C.accent, text: "you are here" }));
      });
    }
    function paint() {
      const T = TESTS[which];
      stage.innerHTML = "";
      const row = el("div", { class: "mnp-tokens" });
      T.toks.forEach(([t, kind], i) => {
        const isOp = kind !== "n";
        const used = done.includes(i);
        const b = el("button", {
          class: "mnp-tok" + (isOp ? " op" : "") + (used ? " gone" : ""), type: "button", text: t, "data-i": i,
          onclick: () => {
            if (used || !isOp) return;
            const want = T.order[done.filter((d) => T.toks[d][1] !== "br").length];
            if (i === want) { done.push(i); }
            else { wrong++; root.classList.add("mnp-shake"); setTimeout(() => root.classList.remove("mnp-shake"), 320); }
            paint();
          },
        });
        row.append(b);
      });
      stage.append(row);
      const ops = done.filter((d) => T.toks[d][1] !== "br");
      const left = T.order.filter((i) => T.toks[i][1] !== "br");
      const nextIdx = T.order.filter((i) => !done.includes(i))[0];
      const nextKind = nextIdx == null ? null : T.toks[nextIdx][1];
      paintStair(nextKind == null ? -1 : (nextKind === "op" ? (["×", "÷"].includes(T.toks[nextIdx][0]) ? 2 : 3) : bandFor(nextKind)));
      if (done.length >= T.order.length) {
        out.innerHTML = "<b>Done.</b> " + exprs[which] + " — every operation taken in order" + (wrong ? " · " + wrong + " wrong turn" + (wrong > 1 ? "s" : "") : " · first try") + ".";
      } else {
        out.innerHTML = "Taken so far: <b>" + (ops.length ? ops.map((i) => T.toks[i][0]).join(" then ") : "nothing yet") + "</b> · " + (left.length - ops.length) + " step" + (left.length - ops.length === 1 ? "" : "s") + " left. " +
          "<span class='mnp-dim'>Brackets, then powers, then × and ÷ left to right, then + and −.</span>";
      }
    }
    paint();
    return root;
  }

  /* ===================================================================
     2. NUMBER LINE — drag points; place, add, distance, round, shade
     =================================================================== */
  function numberline(opts) {
    opts = opts || {};
    const mode = opts.mode || "place";
    const W = 660, H = mode === "ops" ? 210 : 150, pad = 34;
    const lo = opts.min != null ? opts.min : -10, hi = opts.max != null ? opts.max : 10;
    const hintText = {
      place: "Drag the dot. Position is direction as well as size.",
      ops: "Drag either dot — the arrows show a + b, then a − b as a + (−b).",
      distance: "Drag both dots: the bracket measures how far apart they are.",
      round: "Drag the mark and watch the two neighbouring round numbers.",
      ineq: "Drag the end point and flip the arrow to shade an interval.",
      abs: "Drag the point; the bar shows distance from zero, never negative.",
    }[mode] || "";
    const { root, body } = shell("numberline", opts.title || "Number line", hintText);
    const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "mnp-svg", role: "img", "aria-label": "number line" });
    body.append(svg);
    const out = readout("");
    const ctl = el("div", { class: "mnp-ctl" });
    body.append(ctl, out);

    const X = (v) => pad + ((v - lo) / (hi - lo)) * (W - pad * 2);
    const V = (x) => lo + ((clamp(x, pad, W - pad) - pad) / (W - pad)) * (hi - lo);
    const step = opts.step || 1;
    const snap = (v) => Math.round(v / step) * step;

    const gLine = s("g");
    const axisY = mode === "ops" ? 120 : 96;
    gLine.append(s("line", { x1: pad, y1: axisY, x2: W - pad, y2: axisY, stroke: "#c3ccdb", "stroke-width": 2 }));
    for (let v = lo; v <= hi; v += (hi - lo) / 10) {
      gLine.append(s("line", { x1: X(v), y1: axisY - 6, x2: X(v), y2: axisY + 6, stroke: "#c3ccdb", "stroke-width": 1.5 }));
      gLine.append(s("text", { x: X(v), y: axisY + 24, "text-anchor": "middle", class: "mnp-tick", text: fmt(v) }));
    }
    const gDyn = s("g");
    svg.append(gLine, gDyn);

    const pts = (opts.points || [mode === "ops" ? [-7, 4] : 3]).slice(0, 3).map((v, i) => ({
      v: v, i: i, colour: [C.accent, C.warm, C.green][i % 3],
    }));

    function draw() {
      gDyn.innerHTML = "";
      /* shading for inequalities */
      if (mode === "ineq") {
        const p = pts[0], dir = state.dir;
        const x0 = dir === "≥" ? X(p.v) : pad, x1 = dir === "≥" ? W - pad : X(p.v);
        gDyn.append(s("rect", { x: Math.min(x0, x1), y: axisY - 11, width: Math.abs(x1 - x0), height: 22, fill: "#efeaff", rx: 4 }));
        gDyn.append(s("circle", { cx: X(p.v), cy: axisY, r: 7, fill: "#fff", stroke: C.accent, "stroke-width": 3 }));
      }
      if (mode === "abs") {
        const p = pts[0];
        gDyn.append(s("line", { x1: X(0), y1: axisY - 30, x2: X(p.v), y2: axisY - 30, stroke: C.green, "stroke-width": 3 }));
        gDyn.append(s("text", { x: (X(0) + X(p.v)) / 2, y: axisY - 38, "text-anchor": "middle", class: "mnp-lbl", fill: C.green, text: "distance " + fmt(Math.abs(p.v)) }));
      }
      if (mode === "distance" && pts.length > 1) {
        gDyn.append(s("line", { x1: X(pts[0].v), y1: axisY - 26, x2: X(pts[1].v), y2: axisY - 26, stroke: C.green, "stroke-width": 3 }));
        gDyn.append(s("text", { x: (X(pts[0].v) + X(pts[1].v)) / 2, y: axisY - 34, "text-anchor": "middle", class: "mnp-lbl", fill: C.green, text: fmt(Math.abs(pts[1].v - pts[0].v)) }));
      }
      if (mode === "round") {
        const p = pts[0].v, base = opts.base || 10;
        const down = Math.floor(p / base) * base, up = down + base;
        [down, up].forEach((v, i) => {
          gDyn.append(s("circle", { cx: X(v), cy: axisY, r: 4, fill: i ? C.warm : C.accent }));
          gDyn.append(s("text", { x: X(v), y: axisY - 14, "text-anchor": "middle", class: "mnp-lbl", text: fmt(v) }));
        });
        gDyn.append(s("line", { x1: X((down + up) / 2), y1: axisY - 46, x2: X((down + up) / 2), y2: axisY + 12, stroke: "#d6dbe7", "stroke-dasharray": "4 4" }));
      }
      if (mode === "ops" && pts.length > 1) {
        const a = pts[0].v, b = pts[1].v;
        arrow(gDyn, X(0), axisY, X(a), axisY, C.accent, "a");
        arrow(gDyn, X(a), axisY, X(a + b), axisY, C.warm, "b");
        gDyn.append(s("circle", { cx: X(a + b), cy: axisY, r: 6, fill: C.green }));
        gDyn.append(s("text", { x: X(a), y: axisY - 30, "text-anchor": "middle", class: "mnp-lbl", fill: C.accent, text: "a = " + fmt(a) }));
        gDyn.append(s("text", { x: X(a + b), y: axisY - 46, "text-anchor": "middle", class: "mnp-lbl", fill: C.green, text: "a + b = " + fmt(a + b) }));
      }
      pts.forEach((p) => {
        const g = s("g", { class: "mnp-drag", "data-pt": p.i, style: "cursor:grab" });
        g.append(s("line", { x1: X(p.v), y1: axisY, x2: X(p.v), y2: axisY - 13, stroke: p.colour, "stroke-width": 2 }));
        g.append(s("circle", { cx: X(p.v), cy: axisY, r: 9, fill: "#fff", stroke: p.colour, "stroke-width": 3 }));
        g.append(s("circle", { cx: X(p.v), cy: axisY, r: 3.4, fill: p.colour }));
        svg.append(g);
      });
      read();
    }
    function arrow(g, x1, y, x2, y2, colour, label) {
      if (Math.abs(x2 - x1) < 0.5) return;
      const mid = (x1 + x2) / 2;
      g.append(s("path", { d: `M${x1},${y - 0} L${x2},${y2}`, stroke: colour, "stroke-width": 2.5, "marker-end": "none" }));
      g.append(s("path", {
        d: `M${x2},${y2} l${x2 > x1 ? -8 : 8},-4 l0,8 z`, fill: colour,
      }));
      g.append(s("text", { x: mid, y: y - 10, "text-anchor": "middle", class: "mnp-lbl", fill: colour, text: label === "b" ? "+" + Math.abs(0) : "" }));
    }
    function read() {
      if (mode === "place") {
        const v = pts[0].v;
        out.innerHTML = `a = <b>${fmt(v)}</b> · ${v === 0 ? "at zero" : Math.abs(v) + " to the " + (v > 0 ? "right" : "left") + " of zero"} · opposite <b>${fmt(-v)}</b>`;
      } else if (mode === "ops") {
        const a = pts[0].v, b = pts[1].v;
        out.innerHTML = `a = <b>${fmt(a)}</b>, b = <b>${fmt(b)}</b> · a + b = <b>${fmt(a + b)}</b> · a − b = a + (−b) = <b>${fmt(a)}</b> + <b>${fmt(-b)}</b> = <b>${fmt(a - b)}</b>`;
      } else if (mode === "distance" || mode === "abs") {
        if (mode === "abs") { const v = pts[0].v; out.innerHTML = `|${fmt(v)}| = <b>${fmt(Math.abs(v))}</b> · the sign is dropped, the size is kept`; }
        else { const a = pts[0].v, b = pts[1].v; out.innerHTML = `|${fmt(a)} − (${fmt(b)})| = |${fmt(a - b)}| = <b>${fmt(Math.abs(a - b))}</b> units apart`; }
      } else if (mode === "round") {
        const p = pts[0].v, base = opts.base || 10;
        const down = Math.floor(p / base) * base, up = down + base;
        out.innerHTML = `<b>${fmt(p)}</b> rounds to <b>${fmt(Math.abs(p - down) <= Math.abs(up - p) ? down : up)}</b> (nearest ${base}) · neighbours ${fmt(down)} and ${fmt(up)}`;
      } else if (mode === "ineq") {
        const p = pts[0].v;
        out.innerHTML = `x ${state.dir} <b>${fmt(p)}</b> · ` + (state.dir === "≥" ? `every number to the right of ${fmt(p)}, ${fmt(p)} included` : `every number to the left of ${fmt(p)}, ${fmt(p)} included`);
      }
    }
    const state = { dir: "≥" };
    if (mode === "ineq") {
      const flip = el("button", { class: "mnp-btn", type: "button", text: "x ≥ …  ⇄  x ≤ …", onclick: () => { state.dir = state.dir === "≥" ? "≤" : "≥"; flip.textContent = state.dir === "≥" ? "x ≥ …  ⇄  x ≤ …" : "x ≤ …  ⇄  x ≥ …"; draw(); } });
      ctl.append(flip);
    }

    let dragging = null;
    svg.addEventListener("pointerdown", (e) => {
      const g = e.target.closest(".mnp-drag");
      if (!g) return;
      dragging = pts[Number(g.dataset.pt)];
      svg.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    svg.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const r = svg.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * W;
      dragging.v = clamp(snap(V(x)), lo, hi);
      draw();
    });
    const stop = () => { dragging = null; };
    svg.addEventListener("pointerup", stop);
    svg.addEventListener("pointercancel", stop);
    draw();
    return root;
  }

  /* ===================================================================
     3. NESTED SETS — click a number, see every set that claims it
     =================================================================== */
  function setnest(opts) {
    opts = opts || {};
    const { root, body } = shell("setnest", opts.title || "Number sets",
      "Click a number: every set that contains it lights up, innermost first.");
    const nums = opts.nums || [
      { v: "7", sets: ["N", "W", "Z", "Q", "R"] },
      { v: "0", sets: ["W", "Z", "Q", "R"] },
      { v: "−5", sets: ["Z", "Q", "R"] },
      { v: "3/4", sets: ["Q", "R"] },
      { v: "√2", sets: ["R"] },
      { v: "π", sets: ["R"] },
    ];
    const SETS = [
      { k: "R", label: "Real — everything on the line" },
      { k: "Q", label: "Rational — a ratio of integers" },
      { k: "Z", label: "Integers — whole numbers and their opposites" },
      { k: "W", label: "Whole — 0, 1, 2, 3 …" },
      { k: "N", label: "Natural — 1, 2, 3 …" },
    ];
    const stage = el("div", { class: "mnp-stage mnp-nest" });
    const svg = s("svg", { viewBox: "0 0 460 268", class: "mnp-svg" });
    stage.append(svg);
    const out = readout("Pick a number to see which sets contain it.");
    const chips = el("div", { class: "mnp-chips" });
    let picked = null;

    const order = SETS.slice().reverse();
    order.forEach((st, i) => {
      const inset = 12 + i * 14;
      svg.append(s("rect", {
        x: inset, y: 16 + i * 24, width: 460 - inset * 2, height: 236 - i * 24, rx: 16,
        fill: i % 2 ? "#fbfbff" : "#fff", stroke: "#dfe3ee", "stroke-width": 1.4, "data-set": st.k,
      }));
    });
    /* a legend pill sitting on each ring, like a fieldset */
    order.forEach((st, i) => {
      const top = 16 + i * 24;
      svg.append(s("rect", { x: 214, y: top - 9, width: 34, height: 18, rx: 9, fill: "#fff", stroke: "#dfe3ee" }));
      svg.append(s("text", { x: 231, y: top + 5, "text-anchor": "middle", class: "mnp-setname", text: st.k }));
    });
    const legend = el("div", { class: "mnp-dim", style: "margin-top:8px" });
    legend.textContent = "R real · Q rational · Z integers · W whole · N natural — each ring sits inside the one outside it";
    function paint() {
      svg.querySelectorAll("[data-set]").forEach((r) => {
        const on = picked && picked.sets.includes(r.dataset.set);
        const depth = 5 - SETS.findIndex((x) => x.k === r.dataset.set);
        r.setAttribute("fill", on ? "#efeaff" : depth > 3 ? "#fff" : "#fbfbff");
        r.setAttribute("stroke", on ? C.accent : "#dfe3ee");
      });
      if (!picked) return;
      const name = SETS.filter((x) => picked.sets.includes(x.k)).map((x) => x.label).reverse();
      const missing = SETS.filter((x) => !picked.sets.includes(x.k)).map((x) => x.k);
      out.innerHTML = `<b>${picked.v}</b> is in: ${name.join(" · ")}` + (missing.length ? ` <span class="mnp-dim">— not in ${missing.join(", ")}</span>` : "");
    }
    nums.forEach((n) => {
      const b = el("button", { class: "mnp-chip", type: "button", "data-n": n.v, onclick: () => { picked = n; chips.querySelectorAll(".mnp-chip").forEach((c) => c.classList.toggle("on", c.dataset.n === n.v)); paint(); } }, [el("span", { text: n.v })]);
      chips.append(b);
    });
    body.append(stage, chips, legend, out);
    return root;
  }

  /* ===================================================================
     4. BALANCE — the two identities: +0 and ×1 leave it level
     =================================================================== */
  function balance(opts) {
    opts = opts || {};
    const { root, body } = shell("balance", opts.title || "Identity numbers",
      "Push the left and right pans with the same move. Only +0 and ×1 keep the beam level.");
    const svg = s("svg", { viewBox: "0 0 460 220", class: "mnp-svg" });
    const out = readout("");
    const ctl = el("div", { class: "mnp-ctl" });
    body.append(svg, ctl, out);
    let left = 6, right = 6, tilt = 0, target = 0;

    function draw() {
      svg.innerHTML = "";
      const cx = 230, cy = 78;
      svg.append(s("path", { d: `M${cx},${cy} L${cx},${cy + 62}`, stroke: "#c3ccdb", "stroke-width": 4 }));
      svg.append(s("path", { d: `M${cx - 52},${cy + 84} L${cx + 52},${cy + 84}`, stroke: "#c3ccdb", "stroke-width": 5, "stroke-linecap": "round" }));
      const g = s("g", { transform: `rotate(${tilt} ${cx} ${cy})` });
      g.append(s("line", { x1: cx - 150, y1: cy, x2: cx + 150, y2: cy, stroke: "#9aa5b8", "stroke-width": 5, "stroke-linecap": "round" }));
      [[-150, left, "left"], [150, right, "right"]].forEach(([dx, val, side]) => {
        const x = cx + dx;
        g.append(s("line", { x1: x, y1: cy, x2: x, y2: cy + 26, stroke: "#9aa5b8", "stroke-width": 2 }));
        g.append(s("path", { d: `M${x - 36},${cy + 26} h72 l-12,34 h-48 z`, fill: "#fff", stroke: "#9aa5b8", "stroke-width": 2 }));
        g.append(s("text", { x: x, y: cy + 50, "text-anchor": "middle", class: "mnp-val", text: fmt(val) }));
      });
      svg.append(g);
      const level = Math.abs(left - right) < 1e-9;
      out.innerHTML = `left = <b>${fmt(left)}</b> · right = <b>${fmt(right)}</b> · ${level ? "<b style='color:" + C.green + "'>level</b> — the value did not change" : "<b style='color:" + C.red + "'>tilted</b> — both sides were not given the same move"}`;
    }
    function step(fn) {
      left = fn(left); right = fn(right);
      target = clamp((right - left) * 4, -16, 16);
      draw();
      animateTilt();
    }
    let raf = null;
    function animateTilt() {
      cancelAnimationFrame(raf);
      const tick = () => {
        tilt += (target - tilt) * 0.18;
        if (Math.abs(target - tilt) < 0.15) { tilt = target; draw(); return; }
        draw();
        raf = requestAnimationFrame(tick);
      };
      tick();
    }
    [["+ 0", (v) => v, "+ 0"], ["× 1", (v) => v, "× 1"], ["+ 3", (v) => v + 3, "+ 3"], ["× 2", (v) => v * 2, "× 2"], ["− 4", (v) => v - 4, "− 4"]].forEach(([label, fn]) => {
      ctl.append(el("button", { class: "mnp-btn" + (label === "+ 0" || label === "× 1" ? " good" : ""), type: "button", text: label, onclick: () => step(fn) }));
    });
    ctl.append(el("button", { class: "mnp-btn ghost", type: "button", text: "Reset", onclick: () => { left = 6; right = 6; tilt = 0; target = 0; draw(); } }));
    draw();
    return root;
  }

  /* ===================================================================
     5. SIGN TOGGLES — build a product or quotient, see the rule fire
     =================================================================== */
  function signtoggle(opts) {
    opts = opts || {};
    const mode = opts.mode || "product";
    const { root, body } = shell("signtoggle",
      mode === "quotient" ? "Signs of a quotient" : "Signs of a product",
      "Flip the signs. Same signs give a positive answer, different signs a negative one.");
    const stage = el("div", { class: "mnp-stage" });
    const lane = s("svg", { viewBox: "0 0 640 96", class: "mnp-svg", role: "img", "aria-label": "which lane the answer lands in" });
    const out = readout("");
    const ctl = el("div", { class: "mnp-ctl" });
    body.append(lane, stage, ctl, out);
    const state = { signs: [1, 1, 1], vals: mode === "quotient" ? [12, 3, 1] : [3, 4, 2] };
    const n = mode === "quotient" ? 2 : (opts.factors || 3);

    function draw() {
      stage.innerHTML = "";
      const row = el("div", { class: "mnp-factors" });
      for (let i = 0; i < n; i++) {
        const b = el("button", { class: "mnp-factor" + (state.signs[i] < 0 ? " neg" : ""), type: "button", "data-i": i }, [
          el("span", { class: "mnp-sign", text: state.signs[i] < 0 ? "−" : "+" }),
          el("b", { text: String(state.vals[i]) }),
        ]);
        b.addEventListener("click", () => { state.signs[i] *= -1; draw(); });
        row.append(b);
        if (i < n - 1) row.append(el("span", { class: "mnp-op", text: mode === "quotient" ? "÷" : "×" }));
      }
      stage.append(row);
      const negs = state.signs.filter((s) => s < 0).length;
      /* the two lanes: the answer drops into one of them */
      lane.innerHTML = "";
      [["positive", 0, C.green], ["negative", 1, C.red]].forEach(([label, i, colour]) => {
        const y = 12 + i * 40;
        lane.append(s("rect", { x: 40, y, width: 560, height: 30, rx: 15, fill: negs % 2 === i ? colour : "#f6f7fb", "fill-opacity": negs % 2 === i ? 0.16 : 1, stroke: negs % 2 === i ? colour : "#e4e8f0", "stroke-width": negs % 2 === i ? 2 : 1 }));
        lane.append(s("text", { x: 56, y: y + 20, class: "mnp-tick", fill: negs % 2 === i ? colour : "#8a94a6", text: label }));
      });
      const puckY = 12 + (negs % 2) * 40 + 15;
      lane.append(s("circle", { cx: 520, cy: puckY, r: 9, fill: negs % 2 ? C.red : C.green, "fill-opacity": 0.9 }));
      lane.append(s("text", { x: 560, y: puckY + 4, class: "mnp-tick", fill: C.ink2, text: negs + " negative" }));
      const result = (mode === "quotient" ? state.vals[0] / state.vals[1] : state.vals.slice(0, n).reduce((a, b) => a * b, 1)) * (negs % 2 ? -1 : 1);
      const size = mode === "quotient" ? state.vals[0] / state.vals[1] : state.vals.slice(0, n).reduce((a, b) => a * b, 1);
      out.innerHTML = `${negs} negative factor${negs === 1 ? "" : "s"} · ${negs} is ${negs % 2 ? "odd" : "even"} → the answer is <b style="color:${result < 0 ? C.red : C.green}">${result < 0 ? "negative" : "positive"}</b> · value <b>${fmt(result)}</b>` +
        `<div class="mnp-dim">magnitudes: ${mode === "quotient" ? state.vals[0] + " ÷ " + state.vals[1] : state.vals.slice(0, n).join(" × ")} = ${fmt(size)} — the signs only decide the sign</div>`;
      if (mode === "quotient" && state.vals[1] === 0) out.innerHTML = "<b>Undefined</b> — nothing times zero can reach the top number.";
    }
    if (mode === "quotient") ctl.append(el("button", { class: "mnp-btn ghost", type: "button", text: "Make the divisor zero", onclick: () => { state.vals[1] = state.vals[1] === 0 ? 3 : 0; draw(); } }));
    draw();
    return root;
  }

  /* ===================================================================
     6. DOT ARRAY — arrange n dots into a rectangle: that is a factor pair
     =================================================================== */
  function factorarray(opts) {
    opts = opts || {};
    const { root, body } = shell("factorarray", opts.title || "Factors as a rectangle",
      "Drag the column count. When the dots form a full rectangle, the two sides are a factor pair.");
    const svg = s("svg", { viewBox: "0 0 420 300", class: "mnp-svg" });
    const out = readout("");
    const ctl = el("div", { class: "mnp-ctl" });
    body.append(svg, ctl, out);
    let n = opts.n || 12, cols = 4;

    const ctlN = slider({ label: "dots", min: 2, max: 40, value: n }, (v) => { n = v; cols = clamp(cols, 1, n); paint(); });
    const ctlC = slider({ label: "columns", min: 1, max: 20, value: cols }, (v) => { cols = v; paint(); });
    ctl.append(ctlN, ctlC, el("button", { class: "mnp-btn ghost", type: "button", text: "Find a factor pair", onclick: () => { for (let c = 2; c * c <= n; c++) if (n % c === 0) { cols = c; ctlC.input.value = c; ctlC.out.textContent = c; break; } paint(); } }));

    function paint() {
      svg.innerHTML = "";
      const rows = Math.ceil(n / cols);
      const pad = 16;
      const cw = (420 - pad * 2) / Math.max(cols, 1), chh = (300 - pad * 2) / Math.max(rows, 1);
      const r = Math.min(cw, chh) * 0.34;
      for (let i = 0; i < n; i++) {
        const c = i % cols, rw = Math.floor(i / cols);
        svg.append(s("circle", { cx: pad + cw * (c + 0.5), cy: pad + chh * (rw + 0.5), r: r, fill: "#efeaff", stroke: C.accent, "stroke-width": 1.4 }));
      }
      const fits = n % cols === 0;
      if (fits) {
        svg.append(s("rect", { x: pad, y: pad, width: cw * cols, height: chh * rows, fill: "none", stroke: C.green, "stroke-width": 2.5, rx: 6 }));
        svg.append(s("text", { x: 420 / 2, y: 292, "text-anchor": "middle", class: "mnp-lbl", fill: C.green, text: `${cols} × ${n / cols} = ${n}` }));
      }
      const pairs = [];
      for (let a = 1; a * a <= n; a++) if (n % a === 0) pairs.push(a + " × " + n / a);
      out.innerHTML = fits
        ? `<b>${n}</b> fills a ${cols} × ${n / cols} rectangle — a factor pair. All pairs: <b>${pairs.join(", ")}</b>${pairs.length === 1 ? " → prime: only 1 × itself" : ""}`
        : `<b>${n}</b> makes a ${cols} × ${rows} rectangle with ${cols * rows - n} dot${cols * rows - n === 1 ? "" : "s"} left over — so ${cols} is not a factor.` +
          ` <span class="mnp-dim">Pairs so far: ${pairs.join(", ")}</span>`;
    }
    paint();
    return root;
  }

  /* ===================================================================
     7. FACTOR LAB — divisibility lamps, prime tree, LCM/GCF from primes
     =================================================================== */
  function factorlab(opts) {
    opts = opts || {};
    const tab = opts.tab || "divide";
    const where = tab === "tree" ? "prime tree" : tab === "lcm" || tab === "gcf" ? "LCM & GCF" : "divisibility";
    const { root, body } = shell("factorlab", opts.title || ("Factor lab · " + where),
      tab === "tree" ? "Click a composite number to split it. Keep going until nothing is left but primes."
        : tab === "lcm" || tab === "gcf" ? "Two numbers, their primes, and the set they share."
          : "Type a number: the lamps show what divides it without a remainder.");
    const stage = el("div", { class: "mnp-stage" });
    const out = readout("");
    const ctl = el("div", { class: "mnp-ctl" });
    body.append(stage, ctl, out);

    const primesOf = (n) => { const f = []; let m = n; for (let p = 2; p * p <= m; p++) while (m % p === 0) { f.push(p); m /= p; } if (m > 1) f.push(m); return f; };
    const powForm = (f) => {
      const m = new Map();
      f.forEach((p) => m.set(p, (m.get(p) || 0) + 1));
      return [...m.entries()].map(([p, k]) => (k === 1 ? String(p) : p + "^" + k)).join(" · ");
    };
    const gcd = (a, b) => { while (b) { const t = b; b = a % b; a = t; } return a; };
    const lcm = (a, b) => (a * b) / gcd(a, b);

    let n = opts.n || 84, m = opts.m || 60;

    if (tab === "divide") {
      const numIn = el("input", { type: "range", min: 10, max: 240, value: n, class: "mnp-range", "aria-label": "number", step: 1 });
      const lamps = el("div", { class: "mnp-lamps" });
      const wrap = el("label", { class: "mnp-sl" }, [el("span", { class: "mnp-sl-l", text: "number" }), numIn, el("b", { class: "mnp-sl-v", text: String(n) })]);
      ctl.append(wrap);
      const digitSvg = s("svg", { viewBox: "0 0 640 70", class: "mnp-svg", role: "img", "aria-label": "digit sum" });
      stage.append(digitSvg);
      const paintDigits = () => {
        const digits = String(n).split("");
        const sum = digits.reduce((a, d) => a + Number(d), 0);
        digitSvg.innerHTML = "";
        digits.forEach((d, i) => {
          const x = 40 + i * 46;
          digitSvg.append(s("rect", { x, y: 12, width: 34, height: 34, rx: 8, fill: "#efeaff", stroke: C.accent, "stroke-width": 1.6 }));
          digitSvg.append(s("text", { x: x + 17, y: 36, "text-anchor": "middle", class: "mnp-lbl", fill: C.ink, text: d }));
          if (i) digitSvg.append(s("text", { x: x - 6, y: 36, "text-anchor": "middle", class: "mnp-tick", text: "+" }));
        });
        digitSvg.append(s("text", { x: 40 + digits.length * 46 + 4, y: 36, class: "mnp-lbl", fill: C.ink2, text: "digit sum " + sum }));
        const verdict = sum % 9 === 0 ? "divisible by 9" : sum % 3 === 0 ? "divisible by 3, not 9" : "not divisible by 3";
        digitSvg.append(s("text", { x: 40, y: 62, class: "mnp-tick", fill: sum % 3 === 0 ? C.green : C.ink2, text: verdict }));
      };
      const paint = () => {
        paintDigits();
        lamps.innerHTML = "";
        [2, 3, 4, 5, 6, 9, 10].forEach((d) => {
          const ok = n % d === 0;
          const row = el("div", { class: "mnp-lamp" + (ok ? " on" : "") }, [
            el("b", { text: d }),
            el("span", { class: "mnp-lamp-dot" }),
            el("i", { text: ok ? "divides" : "no" }),
          ]);
          row.addEventListener("click", () => { row.classList.toggle("flash"); });
          lamps.append(row);
        });
        const f = primesOf(n);
        out.innerHTML = `<b>${n}</b> = ${powForm(f)} · ${f.length === 1 && f[0] === n ? "prime" : "composite"} · ${n % 3 === 0 ? "digit sum divides by 3" : "digit sum " + String(n).split("").reduce((a, b) => a + Number(b), 0)}`;
      };
      numIn.addEventListener("input", () => { n = Number(numIn.value); wrap.querySelector(".mnp-sl-v").textContent = String(n); paint(); });
      stage.append(lamps);
      paint();
    } else if (tab === "tree") {
      const isPrime = (v) => { if (v < 2) return false; for (let i = 2; i * i <= v; i++) if (v % i === 0) return false; return true; };
      const splitOnce = (v) => { const p0 = primesOf(v)[0]; return { n: v, kids: v === p0 ? null : [{ n: p0, kids: null }, { n: v / p0, kids: null }] }; };
      let tree = splitOnce(n);
      const paint = () => {
        stage.innerHTML = "";
        const svg = s("svg", { viewBox: "0 0 620 260", class: "mnp-svg mnp-tree" });
        let leaves = 0;
        const countLeaves = (nd) => { if (!nd.kids) return 1; return nd.kids.reduce((a, k) => a + countLeaves(k), 0); };
        const place = (nd, depth, x0, x1) => {
          nd._y = 26 + depth * 56;
          if (!nd.kids) { nd._x = (x0 + x1) / 2; return nd._x; }
          const total = countLeaves(nd);
          let cursor = x0;
          const xs = nd.kids.map((k) => {
            const w = (x1 - x0) * (countLeaves(k) / total);
            const x = place(k, depth + 1, cursor, cursor + w);
            cursor += w;
            return x;
          });
          nd._x = (xs[0] + xs[xs.length - 1]) / 2;
          return nd._x;
        };
        leaves = countLeaves(tree);
        place(tree, 0, 24, 596);
        const edges = [];
        const nodes = [];
        const walk = (nd) => { nodes.push(nd); (nd.kids || []).forEach((k) => { edges.push([nd, k]); walk(k); }); };
        walk(tree);
        edges.forEach(([a, b]) => svg.append(s("line", { x1: a._x, y1: a._y + 15, x2: b._x, y2: b._y - 15, stroke: "#d6dbe7", "stroke-width": 1.6 })));
        nodes.forEach((nd) => {
          const prime = !nd.kids && isPrime(nd.n);
          const g = s("g", { class: "mnp-tree-node", style: (nd.kids || prime) ? "" : "cursor:pointer" });
          g.append(s("circle", { cx: nd._x, cy: nd._y, r: 16, fill: nd.kids ? "#efeaff" : prime ? "#e7f6ec" : "#fff", stroke: nd.kids ? C.accent : prime ? C.green : "#c3ccdb", "stroke-width": 2 }));
          g.append(s("text", { x: nd._x, y: nd._y + 5, "text-anchor": "middle", class: "mnp-treen", text: String(nd.n) }));
          if (!nd.kids && !prime) {
            g.addEventListener("click", () => {
              const p0 = primesOf(nd.n)[0];
              const q = nd.n / p0;
              nd.kids = [{ n: p0, kids: null }, { n: q, kids: null }];
              paint();
            });
          }
          svg.append(g);
        });
        stage.append(svg);
        const leafVals = [];
        const collect = (nd) => { if (!nd.kids) { leafVals.push(nd.n); return; } nd.kids.forEach(collect); };
        collect(tree);
        const done = leafVals.every((v) => isPrime(v));
        out.innerHTML = done
          ? `<b>${n}</b> = <b>${leafVals.slice().sort((a, b) => a - b).join(" × ")}</b> = <b>${powForm(leafVals)}</b> · every leaf is prime`
          : `Leaves so far: ${leafVals.join(", ")} · click a white circle to split it <span class="mnp-dim">(the tree always splits off the smallest prime factor)</span>`;
      };
      ctl.append(el("button", { class: "mnp-btn", type: "button", text: "New number", onclick: () => { n = 40 + Math.floor(Math.random() * 160); tree = splitOnce(n); paint(); } }),
        el("button", { class: "mnp-btn ghost", type: "button", text: "Reset", onclick: () => { tree = splitOnce(n); paint(); } }));
      paint();
    } else {
      const paint = () => {
        stage.innerHTML = "";
        const fa = primesOf(m), fb = primesOf(n);
        const ga = gcd(m, n);
        const uniq = [...new Set([...fa, ...fb])].sort((x, y) => x - y);
        const row = el("div", { class: "mnp-factors" });
        [m, n].forEach((v, i) => {
          const b = el("div", { class: "mnp-fbox" }, [
            el("b", { text: String(v) }),
            el("span", { text: (i ? fb : fa).join(" × ") }),
            el("i", { text: powForm(i ? fb : fa) }),
          ]);
          row.append(b);
          if (i === 0) row.append(el("span", { class: "mnp-op", text: "and" }));
        });
        stage.append(row);
        const venn = s("svg", { viewBox: "0 0 640 190", class: "mnp-svg", role: "img", "aria-label": "primes of each number" });
        venn.append(s("circle", { cx: 250, cy: 92, r: 74, fill: "#efeaff", "fill-opacity": 0.55, stroke: C.accent, "stroke-width": 2 }));
        venn.append(s("circle", { cx: 390, cy: 92, r: 74, fill: "#fff2e8", "fill-opacity": 0.6, stroke: C.warm, "stroke-width": 2 }));
        venn.append(s("text", { x: 168, y: 16, "text-anchor": "middle", class: "mnp-tick", fill: C.accent, text: "primes of " + m }));
        venn.append(s("text", { x: 472, y: 16, "text-anchor": "middle", class: "mnp-tick", fill: C.warm, text: "primes of " + n }));
        venn.append(s("text", { x: 320, y: 20, "text-anchor": "middle", class: "mnp-tick", fill: C.green, text: "shared" }));
        const onlyA = [...new Set(fa)].filter((p) => !fb.includes(p));
        const onlyB = [...new Set(fb)].filter((p) => !fa.includes(p));
        const shared = [...new Set(fa)].filter((p) => fb.includes(p));
        const put = (list, cx, colour) => list.forEach((p, i) => {
          const y = 92 + (i - (list.length - 1) / 2) * 26;
          venn.append(s("text", { x: cx, y, "text-anchor": "middle", class: "mnp-lbl", fill: colour, text: String(p) }));
        });
        put(onlyA, 186, C.accent);
        if (shared.length) {
          const h = shared.length * 26 + 6;
          venn.append(s("rect", { x: 296, y: 92 - h / 2, width: 48, height: h, rx: 10, fill: "#ffffff", "fill-opacity": 0.92, stroke: "#bfe3cb" }));
        }
        put(shared, 320, C.green);
        put(onlyB, 424, C.warm);
        venn.append(s("text", { x: 320, y: 182, "text-anchor": "middle", class: "mnp-tick", fill: C.ink2, text: "middle = shared primes → GCF · everything = all primes → LCM" }));
        stage.append(venn);
        out.innerHTML = tab === "gcf"
          ? `GCF(${m}, ${n}) = <b>${ga}</b> — the shared primes, lowest powers: <b>${powForm(primesOf(ga))}</b>`
          : `LCM(${m}, ${n}) = <b>${lcm(m, n)}</b> — every prime, highest power: <b>${powForm(primesOf(lcm(m, n)))}</b>`;
      };
      ctl.append(
        slider({ label: "first number", min: 4, max: 200, value: m }, (v) => { m = v; paint(); }),
        slider({ label: "second number", min: 4, max: 200, value: n }, (v) => { n = v; paint(); }),
      );
      paint();
    }
    return root;
  }

  /* ===================================================================
     8. FRACTION LAB — build, compare, operate, reduce, reciprocate
     =================================================================== */
  function fractionlab(opts) {
    opts = opts || {};
    const mode = opts.mode || "build";
    const titles = {
      build: "Build a fraction", reduce: "Reduce it", compare: "Compare two fractions",
      add: "Add and subtract", muldiv: "Multiply and divide", signs: "Where the sign lives", recip: "Reciprocals",
    };
    const hints = {
      build: "Drag the two bars: the top counts parts, the bottom names their size.",
      reduce: "Slide a common factor out — the bar stays the same length, the numbers get smaller.",
      compare: "Set both fractions and see which bar is longer, without a calculator.",
      add: "Same-sized parts is the whole game: watch the bars split to a common denominator.",
      muldiv: "Multiplication shades a part of a part; division asks how many fit inside.",
      signs: "Move the minus sign between top, bottom and front: the bar never changes.",
      recip: "Flip it: the rectangle's area is the product, and it is always one.",
    };
    const { root, body } = shell("fractionlab", opts.title || titles[mode], hints[mode]);
    const svg = s("svg", { viewBox: "0 0 640 300", class: "mnp-svg" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    body.append(svg, ctl, out);

    const st = { a: [3, 4], b: [2, 3], signSpot: "front" };
    if (mode === "add") { st.a = [2, 7]; st.b = [3, 7]; }
    if (mode === "muldiv") { st.a = [2, 3]; st.b = [4, 5]; }
    if (mode === "reduce") { st.a = [10, 24]; }

    const bar = (x, y, w, h, num, den, colour, label) => {
      const g = s("g");
      g.append(s("rect", { x, y, width: w, height: h, rx: 6, fill: "#fff", stroke: "#d6dbe7" }));
      for (let i = 1; i < den; i++) g.append(s("line", { x1: x + (w / den) * i, y1: y, x2: x + (w / den) * i, y2: y + h, stroke: "#e4e8f0" }));
      const shade = clamp(num, 0, den);
      if (shade > 0) g.append(s("rect", { x, y, width: (w / den) * shade, height: h, rx: 6, fill: colour, "fill-opacity": 0.22, stroke: colour, "stroke-width": 1.6 }));
      g.append(s("text", { x: x + w / 2, y: y + h / 2 + 5, "text-anchor": "middle", class: "mnp-barn", text: label }));
      return g;
    };

    function paint() {
      svg.innerHTML = "";
      const A = st.a, B = st.b;
      if (mode === "recip") {
        const w = 210, h = 110;
        [[40, A], [340, [A[1], A[0]]]].forEach(([x, f], i) => {
          svg.append(s("rect", { x, y: 60, width: w, height: h, rx: 10, fill: i ? "#e7f6ec" : "#efeaff", stroke: i ? C.green : C.accent, "stroke-width": 2 }));
          svg.append(s("text", { x: x + w / 2, y: 105, "text-anchor": "middle", class: "mnp-big", text: `${f[0]}/${f[1]}` }));
          svg.append(s("text", { x: x + w / 2, y: 140, "text-anchor": "middle", class: "mnp-lbl", fill: C.ink2, text: i ? "flipped" : "the fraction" }));
        });
        svg.append(s("text", { x: 320, y: 122, "text-anchor": "middle", class: "mnp-big", text: "×" }));
        out.innerHTML = `\\(\\dfrac{${A[0]}}{${A[1]}}\\cdot\\dfrac{${A[1]}}{${A[0]}}=1\\) — the reciprocal is whatever multiplies to <b>1</b>.`;
          return;
      }
      const denL = mode === "add" ? Math.max(A[1], B[1]) : A[1];
      svg.append(bar(40, 46, 560, 40, A[0], A[1], C.accent, `${A[0]} / ${A[1]}`));
      if (mode !== "reduce") svg.append(bar(40, 118, 560, 40, B[0], B[1], C.warm, `${B[0]} / ${B[1]}`));
      if (mode === "add") {
        const lcd = (A[1] * B[1]) / gcdInt(A[1], B[1]);
        const na = A[0] * (lcd / A[1]), nb = B[0] * (lcd / B[1]);
        const sum = na + nb;
        svg.append(s("line", { x1: 40, y1: 176, x2: 600, y2: 176, stroke: "#e4e8f0" }));
        svg.append(bar(40, 190, 560, 40, sum, lcd, C.green, `${sum} / ${lcd}`));
        out.innerHTML = `LCD ${lcd}: \\(\\dfrac{${A[0]}}{${A[1]}}+\\dfrac{${B[0]}}{${B[1]}}=\\dfrac{${na}}{${lcd}}+\\dfrac{${nb}}{${lcd}}=\\dfrac{${sum}}{${lcd}}\\)` +
          `${sum % lcd === 0 ? " = " + sum / lcd : ""}${sum > lcd ? " = " + Math.floor(sum / lcd) + " and " + (sum % lcd) + "/" + lcd : ""}`;
      } else if (mode === "muldiv") {
        const prod = [A[0] * B[0], A[1] * B[1]];
        const quo = [A[0] * B[1], A[1] * B[0]];
        svg.append(s("text", { x: 40, y: 196, class: "mnp-lbl", text: "" }));
        out.innerHTML = `\\(\\dfrac{${A[0]}}{${A[1]}}\\cdot\\dfrac{${B[0]}}{${B[1]}}=\\dfrac{${prod[0]}}{${prod[1]}}=\\dfrac{${prod[0] / gcdInt(prod[0], prod[1])}}{${prod[1] / gcdInt(prod[0], prod[1])}}\\) · ` +
          `\\(\\dfrac{${A[0]}}{${A[1]}}\\div\\dfrac{${B[0]}}{${B[1]}}=\\dfrac{${A[0]}}{${A[1]}}\\cdot\\dfrac{${B[1]}}{${B[0]}}=\\dfrac{${quo[0]}}{${quo[1]}}=\\dfrac{${quo[0] / gcdInt(quo[0], quo[1])}}{${quo[1] / gcdInt(quo[0], quo[1])}}\\)`;
      } else if (mode === "compare") {
        const left = A[0] / A[1], right = B[0] / B[1];
        const cmp = Math.abs(left - right) < 1e-12 ? "=" : left > right ? ">" : "<";
        out.innerHTML = `\\(\\dfrac{${A[0]}}{${A[1]}}\\) ${cmp} \\(\\dfrac{${B[0]}}{${B[1]}}\\) · as decimals ${fmt(left, 4)} ${cmp} ${fmt(right, 4)} · longer bar wins`;
      } else if (mode === "reduce") {
        const g = gcdInt(A[0], A[1]);
        svg.append(bar(40, 190, 560, 40, A[0] / g, A[1] / g, C.green, `${A[0] / g} / ${A[1] / g}`));
        out.innerHTML = `\\(\\dfrac{${A[0]}}{${A[1]}}\\) divided top and bottom by <b>${g}</b> is \\(\\dfrac{${A[0] / g}}{${A[1] / g}}\\) — same length, fewer parts${g === 1 ? " (already lowest terms)" : ""}`;
      } else if (mode === "signs") {
        const sign = st.signSpot === "front" ? "-" : "";
        const nn = st.signSpot === "top" ? -A[0] : A[0];
        const dd = st.signSpot === "bottom" ? -A[1] : A[1];
        out.innerHTML = `\\(${sign}\\dfrac{${nn}}{${dd}}\\) = <b>${fmt(nn / dd)}</b> — front, top and bottom all describe the same point`;
      } else {
        out.innerHTML = `<b>${A[0]}/${A[1]}</b> shaded · as a division ${A[0]} ÷ ${A[1]} = ${fmt(A[0] / A[1], 4)}${A[0] > A[1] ? " · more than one whole" : ""}`;
      }
    }
    const gcdInt = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = b; b = a % b; a = t; } return a || 1; };
    const addNum = (label, key, idx, max) => slider({ label, min: 0, max, value: st[key][idx] }, (v) => { st[key][idx] = Math.max(idx === 1 && v === 0 ? 1 : v, idx === 1 ? 1 : 0); paint(); });
    if (mode === "recip") {
      ctl.append(slider({ label: "numerator", min: 1, max: 9, value: st.a[0] }, (v) => { st.a[0] = v; paint(); }),
        slider({ label: "denominator", min: 1, max: 9, value: st.a[1] }, (v) => { st.a[1] = v; paint(); }));
    } else if (mode === "signs") {
      const pick = seg({ options: [{ label: "in front", value: "front" }, { label: "on top", value: "top" }, { label: "on the bottom", value: "bottom" }], value: "front" }, (v) => { st.signSpot = v; paint(); });
      ctl.append(pick, slider({ label: "numerator", min: 1, max: 9, value: st.a[0] }, (v) => { st.a[0] = v; paint(); }),
        slider({ label: "denominator", min: 1, max: 9, value: st.a[1] }, (v) => { st.a[1] = v; paint(); }));
    } else if (mode === "reduce") {
      ctl.append(slider({ label: "numerator", min: 1, max: 40, value: st.a[0] }, (v) => { st.a[0] = v; paint(); }),
        slider({ label: "denominator", min: 1, max: 40, value: st.a[1] }, (v) => { st.a[1] = Math.max(1, v); paint(); }));
    } else {
      ctl.append(addNum("first top", "a", 0, 12), addNum("first bottom", "a", 1, 12), addNum("second top", "b", 0, 12), addNum("second bottom", "b", 1, 12));
    }
    paint();
    return root;
  }

  /* ===================================================================
     9. MIXED NUMBERS — build wholes and slices, then convert
     =================================================================== */
  function mixedlab(opts) {
    opts = opts || {};
    const mode = opts.mode || "convert";
    const { root, body } = shell("mixedlab",
      mode === "add" ? "Add and subtract mixed numbers" : mode === "muldiv" ? "Multiply and divide mixed numbers" : "Mixed number ⇄ improper fraction",
      mode === "convert" ? "Drag the whole count and the slice count: the improper fraction follows."
        : mode === "add" ? "Wholes with wholes, slices with slices — and borrow a whole when the slices will not go."
          : "Convert first, then multiply. The bars show why the shortcut fails.");
    const svg = s("svg", { viewBox: "0 0 640 250", class: "mnp-svg" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    body.append(svg, ctl, out);
    const st = { w: 3, a: 2, b: 5, w2: 1, a2: 5, b2: 8, op: "+" };

    function pie(x, y, r, num, den, colour) {
      const g = s("g");
      g.append(s("circle", { cx: x, cy: y, r, fill: "#fff", stroke: "#d6dbe7" }));
      const frac = clamp(num / den, 0, 1);
      if (frac >= 1) g.append(s("circle", { cx: x, cy: y, r, fill: colour, "fill-opacity": 0.22, stroke: colour, "stroke-width": 1.6 }));
      else if (frac > 0) {
        const a0 = -Math.PI / 2, a1 = a0 + frac * Math.PI * 2;
        const large = frac > 0.5 ? 1 : 0;
        g.append(s("path", {
          d: `M${x},${y} L${x + r * Math.cos(a0)},${y + r * Math.sin(a0)} A${r},${r} 0 ${large} 1 ${x + r * Math.cos(a1)},${y + r * Math.sin(a1)} Z`,
          fill: colour, "fill-opacity": 0.22, stroke: colour, "stroke-width": 1.6,
        }));
      }
      for (let i = 0; i < den; i++) {
        const a = -Math.PI / 2 + (i / den) * Math.PI * 2;
        g.append(s("line", { x1: x, y1: y, x2: x + r * Math.cos(a), y2: y + r * Math.sin(a), stroke: "#e4e8f0" }));
      }
      return g;
    }
    function paint() {
      svg.innerHTML = "";
      if (mode === "convert") {
        const improper = st.w * st.b + st.a;
        for (let i = 0; i < Math.min(st.w, 4); i++) svg.append(pie(70 + i * 92, 105, 38, st.b, st.b, C.accent));
        if (st.w > 4) svg.append(s("text", { x: 470, y: 110, class: "mnp-lbl", text: "…" }));
        svg.append(pie(70 + Math.min(st.w, 4) * 92, 105, 38, st.a, st.b, C.warm));
        svg.append(s("text", { x: 320, y: 200, "text-anchor": "middle", class: "mnp-big", text: `${st.w} ${st.a}/${st.b}  =  ${improper}/${st.b}` }));
        out.innerHTML = `${st.w} wholes = ${st.w} × ${st.b} = <b>${st.w * st.b}</b> ${st.b}ths, plus ${st.a} more = <b>${improper}/${st.b}</b>` +
          `${improper % st.b === 0 ? " = " + improper / st.b : ""} · back again: ${improper} ÷ ${st.b} = ${Math.floor(improper / st.b)} remainder ${improper % st.b}`;
      } else {
        const A = [st.w * st.b + st.a, st.b], B = [st.w2 * st.b2 + st.a2, st.b2];
        const show = (x, y, w, a, b, colour) => {
          const wholes = Math.min(w, 2);
          for (let i = 0; i < wholes; i++) svg.append(pie(x + i * 76, y, 30, b, b, colour));
          if (a > 0) svg.append(pie(x + wholes * 76, y, 30, a, b, colour));
          if (w > 2) svg.append(s("text", { x: x + 2 * 76 + 8, y: y + 58, class: "mnp-tick", fill: colour, text: "+" + (w - 2) + " more" }));
          return x + Math.min(w, 2) * 76 + (a > 0 ? 76 : 0);
        };
        const endA = show(26, 92, st.w, st.a, st.b, C.accent);
        svg.append(s("text", { x: 320, y: 100, "text-anchor": "middle", class: "mnp-big", text: st.op }));
        show(Math.max(endA + 44, 350), 92, st.w2, st.a2, st.b2, C.warm);
        if (mode === "add") {
          const lcd = (A[1] * B[1]) / gcdInt(A[1], B[1]);
          const na = A[0] * (lcd / A[1]), nb = B[0] * (lcd / B[1]);
          const tot = st.op === "+" ? na + nb : na - nb;
          const whole = Math.floor(Math.abs(tot) / lcd) * (tot < 0 ? -1 : 1), rem = Math.abs(tot) % lcd;
          svg.append(s("text", { x: 320, y: 200, "text-anchor": "middle", class: "mnp-big", text: `${na}/${lcd} ${st.op} ${nb}/${lcd} = ${tot}/${lcd}` }));
          out.innerHTML = `improper first: ${A[0]}/${A[1]} ${st.op} ${B[0]}/${B[1]} · LCD ${lcd} → <b>${tot}/${lcd}</b>` +
            ` = <b>${whole === 0 ? "" : whole + " "}${rem}/${lcd}</b>${st.op === "-" && na < nb ? " — borrow a whole, or go improper and let the signs sort it out" : ""}`;
        } else {
          const prod = [A[0] * B[0], A[1] * B[1]];
          const quo = [A[0] * B[1], A[1] * B[0]];
          svg.append(s("text", { x: 320, y: 200, "text-anchor": "middle", class: "mnp-big", text: `${A[0]}/${A[1]} × ${B[0]}/${B[1]} = ${prod[0]}/${prod[1]}` }));
          const gp = gcdInt(prod[0], prod[1]), gq = gcdInt(quo[0], quo[1]);
          out.innerHTML = `multiply: <b>${prod[0]}/${prod[1]} = ${prod[0] / gp}/${prod[1] / gp}</b> · divide: <b>${quo[0]}/${quo[1]} = ${quo[0] / gq}/${quo[1] / gq}</b>` +
            ` <span class="mnp-dim">— whole parts multiplied as wholes would give a different answer</span>`;
        }
      }
    }
    const gcdInt = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = b; b = a % b; a = t; } return a || 1; };
    ctl.append(
      slider({ label: "wholes", min: 0, max: 4, value: st.w }, (v) => { st.w = v; paint(); }),
      slider({ label: "slices", min: 0, max: 8, value: st.a }, (v) => { st.a = Math.min(v, st.b - 1); paint(); }),
      slider({ label: "each slice is 1/", min: 2, max: 9, value: st.b }, (v) => { st.b = v; st.a = Math.min(st.a, v - 1); paint(); }),
    );
    if (mode === "add") {
      ctl.append(seg({ options: [{ label: "+", value: "+" }, { label: "−", value: "−" }], value: "+" }, (v) => { st.op = v; paint(); }),
        slider({ label: "second: wholes", min: 0, max: 4, value: st.w2 }, (v) => { st.w2 = v; paint(); }),
        slider({ label: "second: slices", min: 0, max: 8, value: st.a2 }, (v) => { st.a2 = Math.min(v, st.b2 - 1); paint(); }),
        slider({ label: "second: 1/", min: 2, max: 9, value: st.b2 }, (v) => { st.b2 = v; st.a2 = Math.min(st.a2, v - 1); paint(); }));
    }
    if (mode === "muldiv") {
      ctl.append(slider({ label: "second: wholes", min: 0, max: 4, value: st.w2 }, (v) => { st.w2 = v; paint(); }),
        slider({ label: "second: slices", min: 0, max: 8, value: st.a2 }, (v) => { st.a2 = Math.min(v, st.b2 - 1); paint(); }),
        slider({ label: "second: 1/", min: 2, max: 9, value: st.b2 }, (v) => { st.b2 = v; st.a2 = Math.min(st.a2, v - 1); paint(); }));
    }
    paint();
    return root;
  }
  /* ===================================================================
     10. ZERO AS A DIVISOR — walk the divisor to zero and watch it blow up
     =================================================================== */
  function zerodivide(opts) {
    opts = opts || {};
    const { root, body } = shell("zerodivide", opts.title || "Dividing by zero",
      "Slide the divisor towards zero: the quotient runs away, and at zero it stops existing.");
    const svg = s("svg", { viewBox: "0 0 640 210", class: "mnp-svg" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    body.append(svg, ctl, out);
    const top = opts.top || 12;
    let d = 4;

    function paint() {
      svg.innerHTML = "";
      const W = 640, H = 210, pad = 30;
      const X = (v) => pad + (v / 12) * (W - pad * 2);
      const Y = (v) => H - 30 - clamp(v, 0, 40) * ((H - 60) / 40);
      for (let v = 0; v <= 12; v += 2) svg.append(s("text", { x: X(v), y: H - 12, "text-anchor": "middle", class: "mnp-tick", text: fmt(v) }));
      svg.append(s("line", { x1: pad, y1: H - 30, x2: W - pad, y2: H - 30, stroke: "#c3ccdb" }));
      const pts = [];
      for (let x = 0.35; x <= 12; x += 0.05) pts.push([X(x), Y(top / x)]);
      svg.append(s("polyline", { points: pts.map((p) => p.join(",")).join(" "), fill: "none", stroke: C.accent, "stroke-width": 2.5 }));
      const q = top / d;
      svg.append(s("line", { x1: X(d), y1: H - 30, x2: X(d), y2: Y(q), stroke: C.warm, "stroke-width": 2, "stroke-dasharray": "4 4" }));
      svg.append(s("circle", { cx: X(d), cy: Y(q), r: 6, fill: C.warm }));
      const gauge = clamp(q / 40, 0, 1);
      svg.append(s("rect", { x: 40, y: 18, width: 560, height: 12, rx: 6, fill: "#eef1f7" }));
      svg.append(s("rect", { x: 40, y: 18, width: 560 * gauge, height: 12, rx: 6, fill: d < 0.4 ? C.red : C.green }));
      out.innerHTML = `<b>${top} ÷ ${fmt(d, 2)}</b> = <b>${d === 0 ? "undefined" : fmt(q, 2)}</b>` +
        `<div class="mnp-dim">${d === 0 ? "no number times 0 gives " + top + " — so the quotient does not exist" : d < 0.5 ? "the divisor is tiny, so the quotient is huge — it is heading for infinity" : "a normal division: " + fmt(d, 2) + " × " + fmt(q, 2) + " = " + top}</div>`;
    }
    ctl.append(slider({ label: "divisor", min: 0, max: 6, step: 0.05, value: d, show: (v) => v.toFixed(2) }, (v) => { d = v; paint(); }));
    paint();
    return root;
  }

  /* ===================================================================
     11. MEASURE LAB — a ruler you can drag, and a chain of unit multipliers
     =================================================================== */
  function measurelab(opts) {
    opts = opts || {};
    const mode = opts.mode || "ruler";
    const { root, body } = shell("measurelab",
      mode === "chain" ? "Unit multipliers, chained" : "Mixed measures on a ruler",
      mode === "chain" ? "Every step is a fraction equal to one — the old unit cancels, the new one survives."
        : "Drag the two ends. Twelve inches make a foot, so the carry happens at 12, not at 10.");
    const svg = s("svg", { viewBox: "0 0 660 230", class: "mnp-svg" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    body.append(svg, ctl, out);
    const st = { a: 14, b: 33, value: 3.5, from: "km" };

    function paint() {
      svg.innerHTML = "";
      if (mode === "ruler") {
        const pad = 30, W = 660, inches = 48;
        const X = (v) => pad + (v / inches) * (W - pad * 2);
        svg.append(s("rect", { x: pad, y: 70, width: W - pad * 2, height: 44, rx: 6, fill: "#fffdf7", stroke: "#e2d9c6" }));
        for (let i = 0; i <= inches; i++) {
          const big = i % 12 === 0, mid = i % 6 === 0;
          svg.append(s("line", { x1: X(i), y1: 70, x2: X(i), y2: 70 + (big ? 26 : mid ? 18 : 10), stroke: big ? C.ink : "#b9c0cd", "stroke-width": big ? 2 : 1.2 }));
          if (big) svg.append(s("text", { x: X(i), y: 62, "text-anchor": "middle", class: "mnp-tick", text: (i / 12) + " ft" }));
          else if (mid) svg.append(s("text", { x: X(i), y: 132, "text-anchor": "middle", class: "mnp-tick", text: String(i) }));
        }
        [["a", C.accent], ["b", C.warm]].forEach(([k, colour]) => {
          const v = st[k];
          svg.append(s("line", { x1: X(v), y1: 46, x2: X(v), y2: 114, stroke: colour, "stroke-width": 2.5 }));
          svg.append(s("circle", { cx: X(v), cy: 46, r: 8, fill: "#fff", stroke: colour, "stroke-width": 3, class: "mnp-drag", "data-h": k, style: "cursor:ew-resize" }));
        });
        svg.append(s("line", { x1: X(st.a), y1: 150, x2: X(st.b), y2: 150, stroke: C.green, "stroke-width": 3 }));
        const len = Math.abs(st.b - st.a);
        const ft = Math.floor(len / 12), inch = len % 12;
        svg.append(s("text", { x: (X(st.a) + X(st.b)) / 2, y: 172, "text-anchor": "middle", class: "mnp-lbl", fill: C.green, text: `${ft} ft ${inch} in  ·  ${len} in` }));
        const sum = st.a + st.b;
        out.innerHTML = `From ${Math.min(st.a, st.b)} to ${Math.max(st.a, st.b)} inches = <b>${ft} ft ${inch} in</b> (${len} in)` +
          `<div class="mnp-dim">Join two lengths: ${st.a} in + ${st.b} in = ${sum} in = <b>${Math.floor(sum / 12)} ft ${sum % 12} in</b> — carried at 12</div>`;
      } else {
        const chain = { km: [["× 1000", "m", 1000], ["× 100", "cm", 100], ["× 10", "mm", 10]], ft: [["× 12", "in", 12], ["× 2.54", "cm", 2.54]], h: [["× 60", "min", 60], ["× 60", "s", 60]], lb: [["× 16", "oz", 16]] };
        const steps = chain[st.from] || chain.km;
        let v = st.value, y = 44;
        const row = (txt, sub, colour) => {
          svg.append(s("rect", { x: 40, y: y - 20, width: 580, height: 34, rx: 10, fill: colour, stroke: "#dfe3ee" }));
          svg.append(s("text", { x: 56, y: y + 2, class: "mnp-lbl", fill: C.ink, text: txt }));
          if (sub) svg.append(s("text", { x: 600, y: y + 2, "text-anchor": "end", class: "mnp-lbl", fill: C.ink2, text: sub }));
          y += 44;
        };
        row(`${fmt(v)} ${st.from}`, "start", "#f6f7fb");
        steps.forEach(([factor, unit, mult]) => {
          const before = v;
          v = v * mult;
          row(`${fmt(before)} ${st.from === "km" && unit === "m" ? "km" : "× " + factor}`, `${fmt(v)} ${unit}`, "#efeaff");
        });
        out.innerHTML = `${fmt(st.value)} ${st.from} → <b>${fmt(v)} ${steps[steps.length - 1][1]}</b> · every fraction equals one, so the value never changed`;
      }
    }
    if (mode === "chain") {
      ctl.append(
        slider({ label: "value", min: 0.5, max: 12, step: 0.5, value: st.value }, (v) => { st.value = v; paint(); }),
        seg({ options: [{ label: "km", value: "km" }, { label: "ft", value: "ft" }, { label: "h", value: "h" }, { label: "lb", value: "lb" }], value: "km" }, (v) => { st.from = v; paint(); }),
      );
    } else {
      ctl.append(slider({ label: "left end (in)", min: 0, max: 48, value: st.a }, (v) => { st.a = v; paint(); }),
        slider({ label: "right end (in)", min: 0, max: 48, value: st.b }, (v) => { st.b = v; paint(); }));
    }
    let drag = null;
    svg.addEventListener("pointerdown", (e) => { const c = e.target.closest(".mnp-drag"); if (c) { drag = c.dataset.h; svg.setPointerCapture(e.pointerId); e.preventDefault(); } });
    svg.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const r = svg.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 660;
      st[drag] = clamp(Math.round(((x - 30) / (660 - 60)) * 48), 0, 48);
      paint();
    });
    const up = () => { drag = null; };
    svg.addEventListener("pointerup", up);
    svg.addEventListener("pointercancel", up);
    paint();
    return root;
  }

  /* ===================================================================
     12. DECIMAL LAB — place value, the hundred grid, and long division
     =================================================================== */
  function decimallab(opts) {
    opts = opts || {};
    const mode = opts.mode || "place";
    const titles = { place: "Place value", grid: "Decimal multiplication grid", repeat: "Repeating decimals", convert: "Decimal ⇄ fraction" };
    const hints = {
      place: "Move a digit between columns: the same digit is a different size in each place.",
      grid: "Shade rows and columns of a hundred square — the overlap is the product.",
      repeat: "Step the long division. When a remainder comes back, the decimal starts repeating.",
      convert: "Read the places out loud, then cancel — a terminating decimal is a fraction over 10, 100, 1000.",
    };
    const { root, body } = shell("decimallab", opts.title || titles[mode], hints[mode]);
    const svg = s("svg", { viewBox: "0 0 640 280", class: "mnp-svg" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    body.append(svg, ctl, out);
    const st = { digits: [4, 3, 7, 5], rows: 4, cols: 2, num: 3, den: 11, step: 0 };

    function paint() {
      svg.innerHTML = "";
      if (mode === "place") {
        const cols = ["ones", "tenths", "hundredths", "thousandths"];
        cols.forEach((c, i) => {
          const x = 70 + i * 130;
          svg.append(s("rect", { x, y: 60, width: 110, height: 74, rx: 10, fill: i ? "#f6f7fb" : "#efeaff", stroke: "#dfe3ee" }));
          svg.append(s("text", { x: x + 55, y: 48, "text-anchor": "middle", class: "mnp-tick", text: c }));
          svg.append(s("text", { x: x + 55, y: 110, "text-anchor": "middle", class: "mnp-big", text: String(st.digits[i] || 0) }));
          svg.append(s("text", { x: x + 55, y: 152, "text-anchor": "middle", class: "mnp-lbl", fill: C.ink2, text: "× " + fmt(Math.pow(10, -i) === 1 ? "1" : "0." + "0".repeat(i - 1) + "1") }));
          svg.append(el ? s("circle", { cx: x + 55, cy: 170, r: 0 }) : s("circle", {}));
        });
        svg.append(s("circle", { cx: 70 + 130 - 6, cy: 130, r: 4, fill: C.ink }));
        const val = st.digits.reduce((acc, d, i) => acc + d * Math.pow(10, -i), 0);
        out.innerHTML = `the digits <b>${st.digits.join("")}</b> in those columns read <b>${fmt(val, 3)}</b> · the 7 is hundredths here, worth 0.07` +
          `<div class="mnp-dim">zeros between digits hold a place; zeros after the last digit add nothing, so 0.5 = 0.50</div>`;
      } else if (mode === "grid") {
        const pad = 40, size = 200;
        svg.append(s("rect", { x: pad, y: 40, width: size, height: size, fill: "#fff", stroke: "#c3ccdb" }));
        for (let i = 1; i < 10; i++) {
          svg.append(s("line", { x1: pad + (size / 10) * i, y1: 40, x2: pad + (size / 10) * i, y2: 40 + size, stroke: "#eef1f7" }));
          svg.append(s("line", { x1: pad, y1: 40 + (size / 10) * i, x2: pad + size, y2: 40 + (size / 10) * i, stroke: "#eef1f7" }));
        }
        svg.append(s("rect", { x: pad, y: 40, width: size, height: (size / 10) * st.rows, fill: C.accent, "fill-opacity": 0.16 }));
        svg.append(s("rect", { x: pad, y: 40, width: (size / 10) * st.cols, height: size, fill: C.warm, "fill-opacity": 0.16 }));
        const ox = pad, oy = 40;
        svg.append(s("rect", { x: ox, y: oy, width: (size / 10) * st.cols, height: (size / 10) * st.rows, fill: C.green, "fill-opacity": 0.28, stroke: C.green, "stroke-width": 2 }));
        svg.append(s("text", { x: pad + size + 30, y: 90, class: "mnp-lbl", text: `${(st.rows / 10).toFixed(1)} of the whole` }));
        svg.append(s("text", { x: pad + size + 30, y: 116, class: "mnp-lbl", text: `× ${(st.cols / 10).toFixed(1)}` }));
        svg.append(s("text", { x: pad + size + 30, y: 150, class: "mnp-big", text: `= ${((st.rows * st.cols) / 100).toFixed(2)}` }));
        svg.append(s("text", { x: pad + size + 30, y: 186, class: "mnp-lbl", fill: C.green, text: `${st.rows * st.cols} hundredths` }));
        out.innerHTML = `${(st.rows / 10).toFixed(1)} × ${(st.cols / 10).toFixed(1)} = <b>${((st.rows * st.cols) / 100).toFixed(2)}</b> — the overlap is ${st.rows} × ${st.cols} = ${st.rows * st.cols} squares, each one hundredth`;
      } else if (mode === "repeat") {
        const digits = [], rems = [];
        let rem = st.num, i = 0, cycleAt = -1;
        while (i < 12) {
          if (rems.includes(rem)) { cycleAt = rems.indexOf(rem); break; }
          rems.push(rem);
          const d = Math.floor((rem * 10) / st.den);
          digits.push(d);
          rem = (rem * 10) % st.den;
          i++;
        }
        const shown = digits.slice(0, st.step);
        svg.append(s("text", { x: 60, y: 70, class: "mnp-big", text: `${st.num} ÷ ${st.den} = 0.${shown.join("")}${st.step >= digits.length ? (cycleAt >= 0 ? "…" : "") : "_"}` }));
        rems.slice(0, 12).forEach((r, k) => {
          const x = 60 + k * 46;
          svg.append(s("rect", { x, y: 110, width: 38, height: 38, rx: 8, fill: rems.indexOf(r) < k ? "#ffe9d6" : "#f6f7fb", stroke: "#dfe3ee" }));
          svg.append(s("text", { x: x + 19, y: 135, "text-anchor": "middle", class: "mnp-lbl", text: String(r) }));
          if (k === st.step - 1) svg.append(s("text", { x: x + 19, y: 168, "text-anchor": "middle", class: "mnp-tick", text: "now" }));
        });
        svg.append(s("text", { x: 60, y: 210, class: "mnp-lbl", fill: C.ink2, text: "remainders, in the order the division produced them" }));
        const seen = rems.indexOf(rem);
        out.innerHTML = st.step === 0 ? "Press step: long division, one digit at a time."
          : seen >= 0 && st.step > seen + 1
            ? `remainder <b>${rem}</b> has come back — so the digits ${digits.slice(seen).join("")} repeat for ever: <b>0.${digits.slice(0, seen).join("")}\\overline{${digits.slice(seen).join("")}}</b>`
            : `digit <b>${digits[st.step - 1]}</b>, remainder <b>${rem}</b> · ${rem === 0 ? "remainder 0 — the decimal terminates" : "keep going"}`;
        if (window.katex) {
          const t = out.querySelector("b");
          if (t && t.textContent.includes("\\")) { t.innerHTML = window.katex.renderToString(t.textContent, { throwOnError: false }); }
        }
      } else {
        const dec = st.num / Math.pow(10, st.den);
        const frac = `${st.num}/${Math.pow(10, st.den)}`;
        const g = (a, b) => { while (b) { const t = b; b = a % b; a = t; } return a || 1; };
        const den = Math.pow(10, st.den), gg = g(st.num, den);
        svg.append(s("text", { x: 60, y: 100, class: "mnp-big", text: `${fmt(dec, st.den)}  =  ${st.num}/${den}  =  ${st.num / gg}/${den / gg}` }));
        svg.append(s("line", { x1: 60, y1: 130, x2: 580, y2: 130, stroke: "#eef1f7" }));
        svg.append(s("text", { x: 60, y: 170, class: "mnp-lbl", text: `${st.num} ${["tenths", "hundredths", "thousandths"][st.den - 1] || "parts"} — say it, write it over the place value, then cancel` }));
        out.innerHTML = `<b>${fmt(dec, st.den)}</b> = \\(\\dfrac{${st.num}}{${den}} = \\dfrac{${st.num / gg}}{${den / gg}}\\) · dividing top and bottom by <b>${gg}</b>`;
        if (window.katex && out.querySelector("p,.mnp-tex") == null) {
          out.innerHTML = `<b>${fmt(dec, st.den)}</b> = ` + window.katex.renderToString(`\\dfrac{${st.num}}{${den}} = \\dfrac{${st.num / gg}}{${den / gg}}`, { throwOnError: false }) + ` · divided top and bottom by <b>${gg}</b>`;
        }
      }
    }
    if (mode === "place") {
      [0, 1, 2, 3].forEach((i) => ctl.append(slider({ label: ["ones", "tenths", "hundredths", "thousandths"][i], min: 0, max: 9, value: st.digits[i] }, (v) => { st.digits[i] = v; paint(); })));
    } else if (mode === "grid") {
      ctl.append(slider({ label: "shaded rows", min: 0, max: 10, value: st.rows }, (v) => { st.rows = v; paint(); }),
        slider({ label: "shaded columns", min: 0, max: 10, value: st.cols }, (v) => { st.cols = v; paint(); }));
    } else if (mode === "repeat") {
      ctl.append(slider({ label: "numerator", min: 1, max: 12, value: st.num }, (v) => { st.num = v; st.step = 0; paint(); }),
        slider({ label: "denominator", min: 2, max: 15, value: st.den }, (v) => { st.den = v; st.step = 0; paint(); }),
        el("button", { class: "mnp-btn", type: "button", text: "Step the division", onclick: () => { st.step = Math.min(st.step + 1, 12); paint(); } }),
        el("button", { class: "mnp-btn ghost", type: "button", text: "Reset", onclick: () => { st.step = 0; paint(); } }));
    } else {
      ctl.append(slider({ label: "digits", min: 1, max: 999, value: st.num, show: (v) => String(v) }, (v) => { st.num = v; paint(); }),
        slider({ label: "places", min: 1, max: 3, value: st.den }, (v) => { st.den = v; paint(); }));
    }
    paint();
    return root;
  }

  /* ===================================================================
     13. RATIO LAB — tape diagrams, proportions, unit price
     =================================================================== */
  function ratiolab(opts) {
    opts = opts || {};
    const mode = opts.mode || "tape";
    const titles = { tape: "Ratio as a tape diagram", prop: "Solving a proportion", price: "Unit price" };
    const hints = {
      tape: "Drag the multiplier: every part grows together, so the ratio never changes.",
      prop: "Cross-multiply across the equals sign — never across an addition.",
      price: "Compare the cost of one unit, not the price of the pack.",
    };
    const { root, body } = shell("ratiolab", opts.title || titles[mode], hints[mode]);
    const svg = s("svg", { viewBox: "0 0 640 240", class: "mnp-svg" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    body.append(svg, ctl, out);
    const st = { a: 2, b: 3, k: 4, cost: 3.2, qty: 8, cost2: 4.2, qty2: 12 };

    function paint() {
      svg.innerHTML = "";
      if (mode === "price") {
        const per = (c, q) => c / q;
        const bars = [[st.cost, st.qty, C.accent], [st.cost2, st.qty2, C.warm]];
        bars.forEach(([cost, qty, colour], i) => {
          const y = 54 + i * 76;
          const w = (qty / 20) * 460;
          svg.append(s("rect", { x: 40, y, width: w, height: 34, rx: 8, fill: colour, "fill-opacity": 0.18, stroke: colour, "stroke-width": 2 }));
          for (let u = 1; u < qty; u++) svg.append(s("line", { x1: 40 + (w / qty) * u, y1: y, x2: 40 + (w / qty) * u, y2: y + 34, stroke: colour, "stroke-opacity": 0.35 }));
          svg.append(s("text", { x: 40 + w + 12, y: y + 22, class: "mnp-lbl", text: `$${cost.toFixed(2)} · ${qty} units · $${per(cost, qty).toFixed(3)}/unit` }));
        });
        const better = per(st.cost, st.qty) < per(st.cost2, st.qty2) ? "the first deal" : per(st.cost, st.qty) > per(st.cost2, st.qty2) ? "the second deal" : "neither — they cost the same per unit";
        out.innerHTML = `$${st.cost.toFixed(2)} ÷ ${st.qty} = <b>$${per(st.cost, st.qty).toFixed(3)}</b> per unit · $${st.cost2.toFixed(2)} ÷ ${st.qty2} = <b>$${per(st.cost2, st.qty2).toFixed(3)}</b> per unit → better buy: <b>${better}</b>`;
      } else if (mode === "prop") {
        const solved = (st.a * st.k) / st.b;
        const parts = [];
        for (let i = 0; i < st.b; i++) parts.push(i);
        const w = 480 / st.b;
        parts.forEach((i) => {
          svg.append(s("rect", { x: 40 + i * w, y: 60, width: w - 4, height: 30, rx: 6, fill: C.accent, "fill-opacity": 0.2, stroke: C.accent }));
          svg.append(s("text", { x: 40 + i * w + w / 2 - 2, y: 81, "text-anchor": "middle", class: "mnp-lbl", text: String(st.k) }));
        });
        const w2 = 480 / st.b;
        for (let i = 0; i < st.a; i++) {
          svg.append(s("rect", { x: 40 + i * w2, y: 110, width: w2 - 4, height: 30, rx: 6, fill: C.warm, "fill-opacity": 0.22, stroke: C.warm }));
          svg.append(s("text", { x: 40 + i * w2 + w2 / 2 - 2, y: 131, "text-anchor": "middle", class: "mnp-lbl", text: "?" }));
        }
        svg.append(s("text", { x: 320, y: 176, "text-anchor": "middle", class: "mnp-lbl", fill: C.ink2, text: `${st.a}/${st.b} of ${st.k} is ${fmt(solved, 2)}` }));
        out.innerHTML = `\\(\\dfrac{${st.a}}{${st.b}}=\\dfrac{x}{${st.k}}\\) → cross products ${st.a} × ${st.k} = ${st.b} × x → x = <b>${fmt(solved, 2)}</b> · the tape shows the same fraction of both bars`;
      } else {
        const total = (st.a + st.b) * st.k;
        let x = 40;
        const unitW = 480 / (st.a + st.b);
        for (let i = 0; i < st.a; i++, x += unitW) {
          svg.append(s("rect", { x, y: 70, width: unitW - 3, height: 34, rx: 6, fill: C.accent, "fill-opacity": 0.2, stroke: C.accent }));
          svg.append(s("text", { x: x + unitW / 2 - 1, y: 92, "text-anchor": "middle", class: "mnp-lbl", text: String(st.k) }));
        }
        for (let i = 0; i < st.b; i++, x += unitW) {
          svg.append(s("rect", { x, y: 70, width: unitW - 3, height: 34, rx: 6, fill: C.warm, "fill-opacity": 0.2, stroke: C.warm }));
          svg.append(s("text", { x: x + unitW / 2 - 1, y: 92, "text-anchor": "middle", class: "mnp-lbl", text: String(st.k) }));
        }
        svg.append(s("text", { x: 40, y: 140, class: "mnp-lbl", fill: C.accent, text: `${st.a} parts → ${st.a * st.k}` }));
        svg.append(s("text", { x: 40, y: 164, class: "mnp-lbl", fill: C.warm, text: `${st.b} parts → ${st.b * st.k}` }));
        svg.append(s("text", { x: 40, y: 194, class: "mnp-lbl", fill: C.ink2, text: `total ${total}` }));
        out.innerHTML = `ratio ${st.a} : ${st.b} scaled by <b>${st.k}</b> → <b>${st.a * st.k} : ${st.b * st.k}</b> · ${(st.a / st.b).toFixed(3)} either way — a ratio is a shape, not a size`;
      }
      if (window.katex && out.textContent.includes("\\dfrac")) {
        out.innerHTML = out.innerHTML.replace(/\\\(.*?\\\)/g, (m) => window.katex.renderToString(m.slice(2, -2), { throwOnError: false }));
      }
    }
    if (mode === "tape") {
      ctl.append(slider({ label: "first part", min: 1, max: 8, value: st.a }, (v) => { st.a = v; paint(); }),
        slider({ label: "second part", min: 1, max: 8, value: st.b }, (v) => { st.b = v; paint(); }),
        slider({ label: "multiplier", min: 1, max: 9, value: st.k }, (v) => { st.k = v; paint(); }));
    } else if (mode === "prop") {
      ctl.append(slider({ label: "top of first", min: 1, max: 9, value: st.a }, (v) => { st.a = v; paint(); }),
        slider({ label: "bottom of first", min: 1, max: 9, value: st.b }, (v) => { st.b = v; paint(); }),
        slider({ label: "denominator on the right", min: 2, max: 24, value: st.k }, (v) => { st.k = v; paint(); }));
    } else {
      ctl.append(slider({ label: "first price $", min: 0.5, max: 12, step: 0.1, value: st.cost, show: (v) => "$" + v.toFixed(2) }, (v) => { st.cost = v; paint(); }),
        slider({ label: "first amount", min: 1, max: 20, value: st.qty }, (v) => { st.qty = v; paint(); }),
        slider({ label: "second price $", min: 0.5, max: 12, step: 0.1, value: st.cost2, show: (v) => "$" + v.toFixed(2) }, (v) => { st.cost2 = v; paint(); }),
        slider({ label: "second amount", min: 1, max: 20, value: st.qty2 }, (v) => { st.qty2 = v; paint(); }));
    }
    paint();
    return root;
  }
  /* ===================================================================
     14. EXPONENT LAB — copies you can add, subtract, stack and split
     =================================================================== */
  function expolab(opts) {
    opts = opts || {};
    const mode = opts.mode || "rules";
    const titles = { evaluate: "Powers as repeated multiplication", rules: "The exponent rules", power: "The power rule", quotient: "The quotient rule", mixed: "Several rules at once" };
    const hints = {
      evaluate: "Drag the exponent: each extra copy multiplies the value again.",
      rules: "The same base, two exponents — watch the copies add and cancel.",
      power: "A power of a power: every copy inside is repeated for every layer outside.",
      quotient: "Copies on the bottom cancel copies on top. If the bottom wins, the leftover goes downstairs.",
      mixed: "Simplify what is inside the brackets first, then subtract.",
    };
    const { root, body } = shell("expolab", opts.title || titles[mode], hints[mode]);
    const svg = s("svg", { viewBox: "0 0 640 250", class: "mnp-svg" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    body.append(svg, ctl, out);
    const st = { a: 2, m: 3, n: 2, c: 3 };
    const copies = (x, y, count, colour, unit) => {
      const r = 9;
      for (let i = 0; i < Math.min(count, 12); i++) {
        svg.append(s("circle", { cx: x + (i % 6) * (r * 2 + 6), cy: y + Math.floor(i / 6) * (r * 2 + 6), r, fill: colour, "fill-opacity": 0.22, stroke: colour, "stroke-width": 1.6 }));
        svg.append(s("text", { x: x + (i % 6) * (r * 2 + 6), y: y + Math.floor(i / 6) * (r * 2 + 6) + 4, "text-anchor": "middle", class: "mnp-tick", text: unit || String(st.a) }));
      }
    };
    function paint() {
      svg.innerHTML = "";
      const a = st.a, m = st.m, n = st.n;
      if (mode === "evaluate") {
        copies(60, 70, m, C.accent, String(a));
        svg.append(s("text", { x: 60, y: 200, class: "mnp-big", text: `${a}^${m} = ${Math.pow(a, m)}` }));
        out.innerHTML = `<b>${a}<sup>${m}</sup></b> is ${m} copies of ${a} multiplied: ${Array.from({ length: m }, () => a).join(" × ")} = <b>${Math.pow(a, m)}</b>` +
          `<div class="mnp-dim">brackets decide the sign: (−${a})<sup>${m}</sup> = ${Math.pow(-a, m)} but −${a}<sup>${m}</sup> = ${-Math.pow(a, m)}</div>`;
      } else if (mode === "power") {
        copies(50, 60, m, C.accent, String(a));
        copies(430, 60, n, C.warm, "×");
        svg.append(s("text", { x: 320, y: 190, "text-anchor": "middle", class: "mnp-big", text: `(${a}^${m})^${n} = ${a}^${m * n} = ${Math.pow(a, m * n)}` }));
        out.innerHTML = `each of the ${m} copies is repeated ${n} times → ${m} × ${n} = <b>${m * n}</b> copies → \\((${a}^{${m}})^{${n}}=${a}^{${m * n}}=${Math.pow(a, m * n)}\\)`;
      } else if (mode === "quotient") {
        copies(60, 56, m, C.accent, String(a));
        svg.append(s("line", { x1: 40, y1: 118, x2: 400, y2: 118, stroke: C.ink, "stroke-width": 2 }));
        copies(60, 132, n, C.warm, String(a));
        const cancel = Math.min(m, n);
        for (let i = 0; i < cancel; i++) {
          svg.append(s("line", { x1: 51 + i * 24, y1: 47, x2: 69 + i * 24, y2: 65, stroke: C.red, "stroke-width": 2 }));
          svg.append(s("line", { x1: 51 + i * 24, y1: 123, x2: 69 + i * 24, y2: 141, stroke: C.red, "stroke-width": 2 }));
        }
        const res = m - n;
        svg.append(s("text", { x: 430, y: 96, class: "mnp-big", text: res >= 0 ? `${a}^${res} = ${Math.pow(a, res)}` : `1/${a}^${-res}` }));
        out.innerHTML = `\\(\\dfrac{${a}^{${m}}}{${a}^{${n}}}=${a}^{${m - n}}\\)` + (res >= 0 ? `= <b>${Math.pow(a, res)}</b> — ${res} copies left on top` : ` = 1/${a}<sup>${-res}</sup> — a negative exponent means the leftovers go downstairs`) ;
      } else if (mode === "mixed") {
        const inner = Math.pow(a, m);
        svg.append(s("text", { x: 40, y: 60, class: "mnp-lbl", text: "step 1 — clear the brackets" }));
        svg.append(s("text", { x: 40, y: 96, class: "mnp-big", text: `(${a}^${m})^2 = ${a}^${m * 2} = ${Math.pow(a, m * 2)}` }));
        svg.append(s("text", { x: 40, y: 140, class: "mnp-lbl", text: "step 2 — divide, subtracting exponents" }));
        svg.append(s("text", { x: 40, y: 176, class: "mnp-big", text: `${Math.pow(a, m * 2)} ÷ ${a}^${n} = ${a}^${m * 2 - n} = ${fmt(Math.pow(a, m * 2 - n))}` }));
        out.innerHTML = `\\(\\dfrac{(${a}^{${m}})^{2}}{${a}^{${n}}}=${a}^{${m * 2 - n}}\\) = <b>${fmt(Math.pow(a, m * 2 - n))}</b> — brackets first, then subtract`;
      } else {
        /* rules: product and quotient side by side */
        copies(46, 60, m + n, C.accent, String(a));
        svg.append(s("text", { x: 46, y: 158, class: "mnp-big", text: `a^m · a^n = a^(m+n)` }));
        svg.append(s("text", { x: 340, y: 60, class: "mnp-lbl", fill: C.accent, text: `${a}^${m} · ${a}^${n}` }));
        svg.append(s("text", { x: 340, y: 92, class: "mnp-big", text: `= ${a}^${m + n} = ${Math.pow(a, m + n)}` }));
        svg.append(s("text", { x: 340, y: 150, class: "mnp-lbl", text: `${a}^${m} ÷ ${a}^${n} = ${a}^${m - n} = ${fmt(Math.pow(a, m - n))}` }));
        svg.append(s("text", { x: 340, y: 186, class: "mnp-lbl", text: `(${a}^${m})^${n} = ${a}^${m * n} = ${fmt(Math.pow(a, m * n))}` }));
        out.innerHTML = `base <b>${a}</b>: multiply → add the exponents; divide → subtract; a power of a power → multiply. <span class="mnp-dim">${m} + ${n} = ${m + n}, ${m} − ${n} = ${m - n}, ${m} × ${n} = ${m * n}</span>`;
      }
      if (window.katex && out.textContent.includes("\\dfrac")) {
        out.innerHTML = out.innerHTML.replace(/\\\(.*?\\\)/g, (mm) => window.katex.renderToString(mm.slice(2, -2), { throwOnError: false }));
      }
    }
    ctl.append(slider({ label: "base", min: 2, max: 5, value: st.a }, (v) => { st.a = v; paint(); }),
      slider({ label: "first exponent", min: 0, max: 6, value: st.m }, (v) => { st.m = v; paint(); }),
      slider({ label: "second exponent", min: 0, max: 6, value: st.n }, (v) => { st.n = v; paint(); }));
    paint();
    return root;
  }

  /* ===================================================================
     15. RADICAL LAB — the largest square inside n, and like radicals
     =================================================================== */
  function radicallab(opts) {
    opts = opts || {};
    const mode = opts.mode || "simplify";
    const titles = { square: "Square roots as areas", simplify: "Simplest radical form", likes: "Adding like radicals", multiply: "Multiplying radicals", rationalise: "Rationalising the bottom" };
    const hints = {
      square: "Slide the number: the largest square that fits inside it is the root.",
      simplify: "Pull the biggest perfect square out — the rest stays under the root.",
      likes: "Group the like radicals; the rest stay separate.",
      multiply: "Multiply the fronts, multiply what is under the root, then simplify.",
      rationalise: "Multiply top and bottom by the root so the bottom becomes a whole number.",
    };
    const { root, body } = shell("radicallab", opts.title || titles[mode], hints[mode]);
    const svg = s("svg", { viewBox: "0 0 640 250", class: "mnp-svg" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    body.append(svg, ctl, out);
    const st = { n: 50, k: 3, k2: 2 };

    function paint() {
      svg.innerHTML = "";
      const n = st.n;
      if (mode === "square" || mode === "simplify") {
        const side = Math.floor(Math.sqrt(n));
        const cell = Math.min(11, 200 / side);
        const ox = 50, oy = 30;
        for (let i = 0; i < n; i++) {
          const c = i % side, r = Math.floor(i / side);
          svg.append(s("rect", { x: ox + c * cell, y: oy + r * cell, width: cell - 1, height: cell - 1, fill: "#efeaff", stroke: "#d9d2ff" }));
        }
        svg.append(s("rect", { x: ox, y: oy, width: side * cell, height: side * cell, fill: "none", stroke: C.green, "stroke-width": 2.5 }));
        const leftover = n - side * side;
        const big = (() => { let b = 1; for (let i = 2; i * i <= n; i++) if (n % (i * i) === 0) b = i; return b; })();
        const rest = n / (big * big);
        svg.append(s("text", { x: 320, y: 210, "text-anchor": "middle", class: "mnp-big", text: `√${n} = ${big === 1 ? "" : big}√${rest}` }));
        out.innerHTML = `<b>${side}² = ${side * side}</b> fits inside ${n}, with ${leftover} left over — so √${n} is between <b>${side}</b> and <b>${side + 1}</b>.` +
          `<div class="mnp-dim">simplest form: ${big === 1 ? `√${n} is already as simple as it gets` : `√${n} = √${big * big}·√${rest} = <b>${big}√${rest}</b>`}</div>`;
      } else if (mode === "likes") {
        const groups = [[st.k, 5, C.accent], [st.k2, 5, C.warm]];
        let x = 50;
        const tile = (label, colour, y) => {
          svg.append(s("rect", { x, y, width: 96, height: 40, rx: 8, fill: colour, "fill-opacity": 0.16, stroke: colour, "stroke-width": 2 }));
          svg.append(s("text", { x: x + 48, y: y + 26, "text-anchor": "middle", class: "mnp-lbl", text: label }));
          x += 108;
        };
        for (let i = 0; i < 3; i++) tile(`${i + 1}√${st.k === st.k2 ? st.k : st.k}`, C.accent, 50);
        for (let i = 0; i < 2; i++) tile(`${i + 1}√${st.k2}`, C.warm, 110);
        const same = st.k === st.k2;
        svg.append(s("text", { x: 50, y: 200, class: "mnp-big", text: same ? `3√${st.k} + 2√${st.k} = 5√${st.k}` : `3√${st.k} + 2√${st.k2} stays put` }));
        out.innerHTML = same ? `same radical underneath → the coefficients add: <b>3√${st.k} + 2√${st.k} = 5√${st.k}</b>`
          : `different radicals → nothing combines: <b>3√${st.k} + 2√${st.k2}</b> is the finished answer <span class="mnp-dim">(√${st.k} + √${st.k2} is not √${st.k + st.k2})</span>`;
      } else if (mode === "multiply") {
        const prod = st.k * st.k2;
        svg.append(s("text", { x: 50, y: 90, class: "mnp-big", text: `${st.k}√3 · ${st.k2}√5 = ${prod}√15` }));
        svg.append(s("text", { x: 50, y: 140, class: "mnp-lbl", text: "fronts multiply, roots multiply, then simplify" }));
        svg.append(s("text", { x: 50, y: 180, class: "mnp-lbl", fill: C.green, text: `(2√7)² = 4 · 7 = 28 — squaring removes the root` }));
        out.innerHTML = `${st.k} × ${st.k2} = <b>${prod}</b> on the front and √3 × √5 = <b>√15</b> under it → <b>${prod}√15</b>`;
      } else {
        const d = st.k;
        const g = (() => { let b = 1; for (let i = 2; i * i <= d; i++) if (d % (i * i) === 0) b = i; return b; })();
        svg.append(s("text", { x: 50, y: 90, class: "mnp-big", text: `3/√${d} · √${d}/√${d} = 3√${d}/${d}` }));
        svg.append(s("text", { x: 50, y: 140, class: "mnp-lbl", text: `the bottom becomes ${d}, a whole number — that is the point` }));
        svg.append(s("text", { x: 50, y: 180, class: "mnp-lbl", fill: C.green, text: g > 1 ? `√${d} = ${g}√${d / (g * g)} first, then rationalise` : `√${d} is already square-free` }));
        out.innerHTML = `multiplying top and bottom by √${d} is multiplying by 1: <b>3/√${d} = 3√${d}/${d}</b>`;
      }
      if (window.katex && /[√]/.test(out.textContent)) { /* keep the √ characters: they render everywhere */ }
    }
    if (mode === "square" || mode === "simplify") ctl.append(slider({ label: "number under the root", min: 2, max: 400, value: st.n }, (v) => { st.n = v; paint(); }));
    if (mode === "likes") ctl.append(slider({ label: "first radical", min: 2, max: 9, value: st.k }, (v) => { st.k = v; paint(); }),
      slider({ label: "second radical", min: 2, max: 9, value: st.k2 }, (v) => { st.k2 = v; paint(); }));
    if (mode === "multiply") ctl.append(slider({ label: "first front", min: 1, max: 6, value: st.k }, (v) => { st.k = v; paint(); }),
      slider({ label: "second front", min: 1, max: 6, value: st.k2 }, (v) => { st.k2 = v; paint(); }));
    if (mode === "rationalise") ctl.append(slider({ label: "root on the bottom", min: 2, max: 20, value: st.k }, (v) => { st.k = v; paint(); }));
    paint();
    return root;
  }

  /* ===================================================================
     16. SCIENTIFIC NOTATION LAB — a log ruler you can drag
     =================================================================== */
  function scilab(opts) {
    opts = opts || {};
    const mode = opts.mode || "scale";
    const titles = { powers: "Powers of ten", scale: "The scientific notation ruler", multiply: "Multiplying", divide: "Dividing", mixed: "Mixed operations", estimate: "Estimating" };
    const hints = {
      powers: "Each step along the ruler is a factor of ten — in both directions.",
      scale: "Drag the handle: the digits stay, the point moves.",
      multiply: "Multiply the fronts, add the exponents, then repair the format.",
      divide: "Divide the fronts, subtract the exponents, then repair the format.",
      mixed: "Do the brackets first — the outside power hits front and exponent.",
      estimate: "Round the fronts to one digit: the exponent tells you the size, the digits barely matter.",
    };
    const { root, body } = shell("scilab", opts.title || titles[mode], hints[mode]);
    const svg = s("svg", { viewBox: "0 0 660 230", class: "mnp-svg" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    body.append(svg, ctl, out);
    const st = { front: 5.4, exp: 6, front2: 2.5, exp2: 3, e: 3 };

    const notation = (f, e) => {
      /* normalise: one nonzero digit before the point */
      let m = f, x = e;
      while (Math.abs(m) >= 10) { m /= 10; x += 1; }
      while (Math.abs(m) < 1 && m !== 0) { m *= 10; x -= 1; }
      return { m, x };
    };
    const SUPMAP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
    const sup = (n) => String(n).split("").map((c) => SUPMAP[c] || "").join("");
    const plain = (m, x) => {
      const v = m * Math.pow(10, x);
      if (Math.abs(v) >= 1e-6 && Math.abs(v) < 1e12) return v.toLocaleString(undefined, { maximumFractionDigits: 10 });
      return `${m} × 10^${x}`;
    };

    function paint() {
      svg.innerHTML = "";
      if (mode === "powm" ) return;
      if (mode === "powers" || mode === "scale") {
        const lo = -6, hi = 9, pad = 40, W = 660, Y = 130;
        const X = (e) => pad + ((e - lo) / (hi - lo)) * (W - pad * 2);
        svg.append(s("line", { x1: pad, y1: Y, x2: W - pad, y2: Y, stroke: "#c3ccdb", "stroke-width": 2 }));
        for (let e = lo; e <= hi; e++) {
          const big = e % 3 === 0;
          svg.append(s("line", { x1: X(e), y1: Y - (big ? 9 : 5), x2: X(e), y2: Y + (big ? 9 : 5), stroke: "#c3ccdb", "stroke-width": big ? 1.6 : 1 }));
          if (big) svg.append(s("text", { x: X(e), y: Y + 28, "text-anchor": "middle", class: "mnp-tick", text: "10" + sup(e) }));
        }
        const e = mode === "scale" ? st.exp : st.e;
        const m = mode === "scale" ? st.front : 1;
        svg.append(s("circle", { cx: X(clamp(e, lo, hi)), cy: Y, r: 9, fill: "#fff", stroke: C.accent, "stroke-width": 3, class: "mnp-drag", style: "cursor:ew-resize" }));
        svg.append(s("text", { x: X(clamp(e, lo, hi)), y: Y - 22, "text-anchor": "middle", class: "mnp-lbl", fill: C.accent, text: mode === "scale" ? `${m} × 10${sup(e)}` : `10${sup(e)} = ${plain(1, e)}` }));
        if (mode === "scale") {
          svg.append(s("text", { x: 40, y: 60, class: "mnp-big", text: plain(m, e) }));
          svg.append(s("text", { x: 40, y: 190, class: "mnp-lbl", fill: C.ink2, text: "one nonzero digit before the point, the exponent counts the moves" }));
          out.innerHTML = `<b>${m} × 10${sup(e)}</b> = <b>${plain(m, e)}</b> · the point sits ${Math.abs(e)} place${Math.abs(e) === 1 ? "" : "s"} ${e >= 0 ? "to the right" : "to the left"} of after the ${m === 1 ? "1" : "front"}`;
        } else {
          out.innerHTML = `10${sup(e)} = <b>${plain(1, e)}</b> · ${e < 0 ? "a negative exponent is a reciprocal: 1/" + plain(1, -e) : e === 0 ? "anything to the zero power is 1" : e + " zeros after the one"}`;
        }
      } else {
        const A = notation(st.front, st.exp), B = notation(st.front2, st.exp2);
        const op = mode === "divide" ? "÷" : mode === "mixed" ? "^" : "×";
        if (mode === "estimate") {
          const r1 = Math.round(A.m) || 1, r2 = Math.round(B.m) || 1;
          const e = A.x + B.x, N = notation(r1 * r2, e);
          const exact = (A.m * Math.pow(10, A.x)) * (B.m * Math.pow(10, B.x));
          svg.append(s("text", { x: 40, y: 70, class: "mnp-lbl", text: `round the fronts: ${A.m} → ${r1}, ${B.m} → ${r2}` }));
          svg.append(s("text", { x: 40, y: 110, class: "mnp-lbl", text: `${r1} × ${r2} = ${r1 * r2}   exponents: ${A.x} + ${B.x} = ${e}` }));
          svg.append(s("text", { x: 40, y: 156, class: "mnp-big", text: `≈ ${fmt(N.m, 3)} × 10${sup(N.x)}` }));
          out.innerHTML = `estimate <b>${fmt(N.m, 3)} × 10${sup(N.x)}</b> = ${plain(N.m, N.x)} · exact ${fmt(exact, 4)} — same power of ten, so the estimate is good enough to check the exact answer`;
        } else if (mode === "multiply" || mode === "divide") {
          const f = mode === "divide" ? A.m / B.m : A.m * B.m;
          const e = mode === "divide" ? A.x - B.x : A.x + B.x;
          const raw = mode === "divide" ? `${A.m} ÷ ${B.m} = ${fmt(f, 3)}` : `${A.m} × ${B.m} = ${fmt(f, 3)}`;
          const N = notation(f, e);
          svg.append(s("text", { x: 40, y: 70, class: "mnp-lbl", text: `${A.m} × 10${sup(A.x)} ${op} ${B.m} × 10${sup(B.x)}` }));
          svg.append(s("text", { x: 40, y: 108, class: "mnp-lbl", text: `fronts: ${raw}   exponents: ${A.x} ${mode === "divide" ? "−" : "+"} ${B.x} = ${e}` }));
          svg.append(s("text", { x: 40, y: 152, class: "mnp-big", text: `${fmt(f, 3)} × 10${sup(e)}  →  ${fmt(N.m, 3)} × 10${sup(N.x)}` }));
          out.innerHTML = `${fmt(N.m, 3)} × 10${sup(N.x)} = <b>${plain(N.m, N.x)}</b>` +
            `<div class="mnp-dim">${Math.abs(f) >= 10 || Math.abs(f) < 1 ? "the front left the 1–10 range, so it was repaired" : "the front is already in range"}</div>`;
        } else {
          const p = Math.pow(A.m, st.front2), e = A.x * st.front2;
          const N = notation(p, e);
          svg.append(s("text", { x: 40, y: 70, class: "mnp-lbl", text: `(${A.m} × 10${sup(A.x)})${sup(st.front2 | 0)}` }));
          svg.append(s("text", { x: 40, y: 112, class: "mnp-lbl", text: `front: ${A.m}${sup(st.front2 | 0)} = ${fmt(p, 3)}   exponent: ${A.x} × ${st.front2 | 0} = ${e}` }));
          svg.append(s("text", { x: 40, y: 156, class: "mnp-big", text: `${fmt(p, 3)} × 10${sup(e)}  →  ${fmt(N.m, 3)} × 10${sup(N.x)}` }));
          out.innerHTML = `power outside the brackets hits both parts → <b>${fmt(N.m, 3)} × 10${sup(N.x)}</b> = ${plain(N.m, N.x)}`;
        }
      }
    }
    if (mode === "powers") ctl.append(slider({ label: "exponent", min: -6, max: 9, value: st.e }, (v) => { st.e = v; paint(); }));
    else if (mode === "scale") ctl.append(slider({ label: "front", min: 1, max: 9.9, step: 0.1, value: st.front, show: (v) => v.toFixed(1) }, (v) => { st.front = v; paint(); }),
      slider({ label: "exponent", min: -6, max: 9, value: st.exp }, (v) => { st.exp = v; paint(); }));
    else {
      ctl.append(slider({ label: "first front", min: 1, max: 9.9, step: 0.1, value: st.front, show: (v) => v.toFixed(1) }, (v) => { st.front = v; paint(); }),
        slider({ label: "first exponent", min: -6, max: 9, value: st.exp }, (v) => { st.exp = v; paint(); }));
      if (mode !== "mixed") ctl.append(slider({ label: "second front", min: 1, max: 9.9, step: 0.1, value: st.front2, show: (v) => v.toFixed(1) }, (v) => { st.front2 = v; paint(); }),
        slider({ label: "second exponent", min: -6, max: 9, value: st.exp2 }, (v) => { st.exp2 = v; paint(); }));
      else ctl.append(slider({ label: "outside power", min: 2, max: 4, value: st.front2 }, (v) => { st.front2 = v; paint(); }));
    }
    paint();
    return root;
  }

  /* ===================================================================
     17. COURSE MAP — click a chapter, see what it left you with
     =================================================================== */
  function mapboard(opts) {
    opts = opts || {};
    const { root, body } = shell("mapboard", opts.title || "What you can now do",
      "Click a chapter: the skill, the rule, and the one thing to keep.");
    const items = opts.items || [
      { k: "2", name: "Numbers and negatives", rule: "same signs add and keep; different signs subtract and keep the larger size" },
      { k: "3", name: "Factors and multiples", rule: "every number is one product of primes" },
      { k: "4", name: "Fractions", rule: "same-size parts before you count them" },
      { k: "5", name: "Mixed numbers", rule: "convert to improper before multiplying" },
      { k: "6", name: "Decimals", rule: "place value to the right of the point" },
      { k: "7", name: "Ratio and proportion", rule: "same units, then cross-multiply" },
      { k: "8", name: "Exponents", rule: "multiply → add, divide → subtract, power → multiply" },
      { k: "9", name: "Radicals", rule: "pull out the largest square" },
      { k: "10", name: "Scientific notation", rule: "one digit before the point, exponent counts the moves" },
    ];
    const map = s("svg", { viewBox: "0 0 640 200", class: "mnp-svg", role: "img", "aria-label": "how the chapters build on each other" });
    const grid = el("div", { class: "mnp-tiles" });
    const out = readout("Pick a chapter.");
    let picked = null;
    const NODES = items.map((it, i) => ({ ...it, x: 60 + (i % 5) * 130, y: i < 5 ? 48 : 148 }));
    const drawMap = () => {
      map.innerHTML = "";
      for (let i = 0; i < NODES.length - 1; i++) {
        const a = NODES[i], b = NODES[i + 1];
        map.append(s("line", { x1: a.x + 34, y1: a.y, x2: b.x - 34, y2: b.y, stroke: picked && (picked.k === a.k || picked.k === b.k) ? C.accent : "#e4e8f0", "stroke-width": 2 }));
      }
      NODES.forEach((nd) => {
        const on = picked && picked.k === nd.k;
        map.append(s("rect", { x: nd.x - 34, y: nd.y - 24, width: 68, height: 48, rx: 12, fill: on ? "#efeaff" : "#fff", stroke: on ? C.accent : "#dfe3ee", "stroke-width": on ? 2.4 : 1.4 }));
        map.append(s("text", { x: nd.x, y: nd.y - 2, "text-anchor": "middle", class: "mnp-big", text: nd.k }));
        map.append(s("text", { x: nd.x, y: nd.y + 16, "text-anchor": "middle", class: "mnp-tick", text: nd.name.split(" ")[0] }));
      });
    };
    items.forEach((it) => {
      const b = el("button", { class: "mnp-tile", type: "button", "data-k": it.k }, [
        el("b", { text: it.k }),
        el("span", { text: it.name }),
      ]);
      b.addEventListener("click", () => {
        picked = it;
        grid.querySelectorAll(".mnp-tile").forEach((t) => t.classList.toggle("on", t.dataset.k === it.k));
        drawMap();
        out.innerHTML = `<b>Chapter ${it.k} · ${it.name}</b><div class="mnp-dim">${it.rule}</div>`;
      });
      grid.append(b);
    });
    body.append(map, grid, out);
    drawMap();
    return root;
  }

  /* ===================================================================
     18. EXAM PLANNER — twelve questions, sixty minutes, your call
     =================================================================== */
  function examplanner(opts) {
    opts = opts || {};
    const { root, body } = shell("examplanner", opts.title || "Plan the sixty minutes",
      "Set a time for each question. The bar tells you whether the paper fits.");
    const budget = opts.minutes || 60, count = opts.count || 12;
    const times = Array.from({ length: count }, () => 4);
    const ring = s("svg", { viewBox: "0 0 640 96", class: "mnp-svg", role: "img", "aria-label": "the sixty minutes, question by question" });
    const bar = el("div", { class: "mnp-budget" });
    const fill = el("div", { class: "mnp-budget-fill" });
    bar.append(fill);
    const rows = el("div", { class: "mnp-plan" });
    const out = readout("");
    const ctl = el("div", { class: "mnp-ctl" });
    body.append(ring, bar, rows, ctl, out);

    function paint() {
      const total = times.reduce((a, b) => a + b, 0);
      const pctTotal = (total / budget) * 100;
      /* one band per question, the full width being the whole budget */
      ring.innerHTML = "";
      let x = 24;
      const scale = (640 - 48) / budget;
      times.forEach((t, i) => {
        const w = Math.max(t * scale - 2, 0);
        const used = total > 0;
        const over = x + w > 640 - 24;
        ring.append(s("rect", { x, y: 22, width: Math.max(w, 0), height: 34, rx: 5, fill: over ? "#ffe9d6" : i % 2 ? "#efeaff" : "#e6e0ff", stroke: "#d9d2ff" }));
        if (w > 16) ring.append(s("text", { x: x + w / 2, y: 44, "text-anchor": "middle", class: "mnp-tick", text: "Q" + (i + 1) }));
        x += w + 2;
      });
      ring.append(s("line", { x1: 24, y1: 66, x2: 640 - 24, y2: 66, stroke: "#e4e8f0" }));
      for (let min = 0; min <= budget; min += 10) {
        const px = 24 + min * scale;
        ring.append(s("line", { x1: px, y1: 66, x2: px, y2: 72, stroke: "#c3ccdb" }));
        ring.append(s("text", { x: px, y: 86, "text-anchor": "middle", class: "mnp-tick", text: String(min) }));
      }
      fill.style.width = Math.min(100, pctTotal) + "%";
      fill.className = "mnp-budget-fill" + (total > budget ? " over" : total === budget ? " exact" : "");
      out.innerHTML = `<b>${total}</b> of ${budget} minutes used · ${total > budget ? "<span style='color:" + C.red + "'>over budget by " + (total - budget) + "</span>" : total === budget ? "<span style='color:" + C.green + "'>exactly fits</span>" : (budget - total) + " minutes spare for checking"}`;
      rows.querySelectorAll(".mnp-plan-v").forEach((n, i) => { n.textContent = times[i] + " min"; });
      if (total !== times.reduce((a, b) => a + b, 0)) paint();
    }
    times.forEach((t, i) => {
      const row = el("div", { class: "mnp-plan-row" }, [
        el("b", { text: "Q" + (i + 1) }),
        (() => {
          const inp = el("input", { type: "range", min: 0, max: 10, step: 1, value: t, class: "mnp-range", "aria-label": "minutes for question " + (i + 1) });
          inp.addEventListener("input", () => { times[i] = Number(inp.value); paint(); });
          return inp;
        })(),
        el("span", { class: "mnp-plan-v", text: t + " min" }),
      ]);
      rows.append(row);
    });
    ctl.append(el("button", { class: "mnp-btn", type: "button", text: "Even split", onclick: () => { times.fill(Math.floor(budget / count)); paint(); } }),
      el("button", { class: "mnp-btn ghost", type: "button", text: "Front-load the easy ones", onclick: () => { times.forEach((v, i) => { times[i] = i < 4 ? 3 : i < 8 ? 5 : 7; }); paint(); } }));
    paint();
    return root;
  }
  /* ===================================================================
     19. LIMIT WALKER — approach the point from both sides
     =================================================================== */
  function limitlab(opts) {
    opts = opts || {};
    const FNS = {
      hole: { tex: "(x² − 1)/(x − 1)", a: 1, f: (x) => (x * x - 1) / (x - 1), at: null, note: "a hole: the formula breaks at x = 1, but both sides head for 2" },
      jump: { tex: "|x| / x", a: 0, f: (x) => Math.abs(x) / x, at: null, note: "a jump: from the left it is −1, from the right +1 — so the limit does not exist" },
      sinc: { tex: "sin x / x", a: 0, f: (x) => (Math.sin(x) / x), at: 1, note: "both sides head for 1, though f(0) is not even defined" },
      inf: { tex: "1 / (x − 2)", a: 2, f: (x) => 1 / (x - 2), at: null, note: "an infinite limit: the graph runs off the top on one side and the bottom on the other" },
      quad: { tex: "(x² − 4)/(x − 2)", a: 2, f: (x) => (x * x - 4) / (x - 2), at: null, note: "cancel first: the hole is at x = 2 and the limit is 4" },
    };
    let which = opts.key && FNS[opts.key] ? opts.key : "hole";
    const { root, body } = shell("limitlab", opts.title || "Walk up to the limit",
      "Drag the point in from either side: the f(x) readout settles on a number — or refuses to.");
    const svg = s("svg", { viewBox: "0 0 660 260", class: "mnp-svg" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    body.append(svg, ctl, out);
    const st = { x: 0.4 };

    function paint() {
      const F = FNS[which], a = F.a, near = st.x * (st.side === "left" ? -1 : 1);
      const xs = a + near;
      const W = 660, H = 260, pad = 40;
      const xlo = a - 2.2, xhi = a + 2.2;
      let ylo = -6, yhi = 6;
      for (let i = 0; i <= 60; i++) {
        const v = F.f(xlo + ((xhi - xlo) * i) / 60);
        if (isFinite(v) && Math.abs(v) < 40) { ylo = Math.min(ylo, v - 0.6); yhi = Math.max(yhi, v + 0.6); }
      }
      ylo = Math.max(ylo, -12); yhi = Math.min(yhi, 12);
      const X = (v) => pad + ((v - xlo) / (xhi - xlo)) * (W - pad * 2);
      const Y = (v) => H - pad - ((v - ylo) / (yhi - ylo)) * (H - pad * 2);
      svg.innerHTML = "";
      svg.append(s("rect", { x: pad, y: pad, width: W - pad * 2, height: H - pad * 2, fill: "#fbfcfe", stroke: "#e4e8f0" }));
      const clip = panelClip(svg, pad, pad, W - pad * 2, H - pad * 2);
      if (ylo < 0 && yhi > 0) svg.append(s("line", { x1: pad, y1: Y(0), x2: W - pad, y2: Y(0), stroke: "#dfe3ee" }));
      svg.append(s("line", { x1: X(a), y1: pad, x2: X(a), y2: H - pad, stroke: "#e6e2ff", "stroke-dasharray": "4 4" }));
      let d = "", pen = false;
      for (let i = 0; i <= 300; i++) {
        const v = xlo + ((xhi - xlo) * i) / 300, y = F.f(v);
        if (!isFinite(y) || Math.abs(y) > 24) { pen = false; continue; }
        d += (pen ? " L" : " M") + X(v) + "," + Y(y);
        pen = true;
      }
      svg.append(s("path", { d, fill: "none", stroke: C.accent, "stroke-width": 2.6, "clip-path": clip }));
      /* the limit itself: an open circle where the function refuses to go */
      const lim = (F.f(a - 1e-6) + F.f(a + 1e-6)) / 2;
      if (isFinite(lim) && Math.abs(lim) < 24 && (which === "hole" || which === "quad" || which === "sinc")) {
        svg.append(s("circle", { cx: X(a), cy: Y(lim), r: 5, fill: "#fff", stroke: C.accent, "stroke-width": 2.4 }));
        svg.append(s("text", { x: X(a) + 10, y: Y(lim) - 8, class: "mnp-tick", fill: C.accent, text: "limit " + fmt(lim, 3) }));
      }
      svg.append(s("text", { x: X(a), y: H - pad + 16, "text-anchor": "middle", class: "mnp-tick", text: "x = " + fmt(a) }));
      const fy = F.f(xs);
      if (isFinite(fy) && Math.abs(fy) <= 24) {
        svg.append(s("circle", { cx: X(xs), cy: Y(fy), r: 6, fill: C.warm }));
        svg.append(s("line", { x1: X(xs), y1: Y(fy), x2: X(xs), y2: H - pad, stroke: C.warm, "stroke-dasharray": "3 3", "stroke-width": 1.4 }));
        svg.append(s("line", { x1: X(xs), y1: Y(fy), x2: pad, y2: Y(fy), stroke: C.warm, "stroke-dasharray": "3 3", "stroke-width": 1.4 }));
      }
      const side = st.side === "left" ? "from the left" : "from the right";
      out.innerHTML = `x = <b>${fmt(xs, 3)}</b>, f(x) = <b>${isFinite(fy) ? fmt(fy, 4) : "undefined"}</b> · ${side}` +
        `<div class="mnp-dim">${F.note}</div>`;
    }
    const seg = el("div", { class: "mnp-seg" });
    [["left", "approach from the left"], ["right", "approach from the right"]].forEach(([v, label]) => {
      const btn = el("button", { class: "mnp-seg-b" + (v === "right" ? " on" : ""), type: "button", text: label });
      btn.addEventListener("click", () => {
        st.side = v;
        seg.querySelectorAll(".mnp-seg-b").forEach((b) => b.classList.toggle("on", b === btn));
        paint();
      });
      seg.append(btn);
    });
    st.side = "right";
    const fnPick = seg2(Object.keys(FNS).map((k) => ({ label: FNS[k].tex, value: k })), which, (v) => { which = v; paint(); });
    ctl.append(seg, fnPick, slider({ label: "distance from a", min: 0.01, max: 2, step: 0.01, value: st.x, show: (v) => v.toFixed(2) }, (v) => { st.x = v; paint(); }));
    paint();
    return root;
  }
  function seg2(options, value, onPick) {
    const wrap = el("div", { class: "mnp-seg" });
    const buttons = options.map((o) => {
      const b = el("button", { class: "mnp-seg-b" + (o.value === value ? " on" : ""), type: "button", text: o.label });
      b.addEventListener("click", () => { buttons.forEach((x) => x.classList.remove("on")); b.classList.add("on"); onPick(o.value); });
      wrap.append(b);
      return b;
    });
    return wrap;
  }

  /* ===================================================================
     20. SECANT → TANGENT — shrink h and watch the slope settle
     =================================================================== */
  function slopelab(opts) {
    opts = opts || {};
    const FNS = {
      square: { tex: "x²", f: (x) => x * x, d: (x) => 2 * x },
      cube: { tex: "x³ − 4x", f: (x) => x * x * x - 4 * x, d: (x) => 3 * x * x - 4 },
      sin: { tex: "sin x", f: (x) => Math.sin(x), d: (x) => Math.cos(x) },
      recip: { tex: "1/x", f: (x) => 1 / x, d: (x) => -1 / (x * x) },
    };
    let which = opts.key && FNS[opts.key] ? opts.key : "square";
    const { root, body } = shell("slopelab", opts.title || "The derivative as a limit of slopes",
      "Drag h towards zero: the secant line becomes the tangent, and the slope becomes the derivative.");
    const svg = s("svg", { viewBox: "0 0 660 260", class: "mnp-svg" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    body.append(svg, ctl, out);
    const st = { a: 1, h: 1.2 };
    function paint() {
      const F = FNS[which], W = 660, H = 260, pad = 40;
      const xlo = -3, xhi = 3;
      let ylo = -6, yhi = 6;
      for (let i = 0; i <= 80; i++) { const v = F.f(xlo + (i / 80) * (xhi - xlo)); if (isFinite(v) && Math.abs(v) < 30) { ylo = Math.min(ylo, v); yhi = Math.max(yhi, v); } }
      ylo -= 1; yhi += 1;
      const X = (v) => pad + ((v - xlo) / (xhi - xlo)) * (W - pad * 2);
      const Y = (v) => H - pad - ((v - ylo) / (yhi - ylo)) * (H - pad * 2);
      svg.innerHTML = "";
      svg.append(s("rect", { x: pad, y: pad, width: W - pad * 2, height: H - pad * 2, fill: "#fbfcfe", stroke: "#e4e8f0" }));
      const clip2 = panelClip(svg, pad, pad, W - pad * 2, H - pad * 2);
      if (ylo < 0 && yhi > 0) svg.append(s("line", { x1: pad, y1: Y(0), x2: W - pad, y2: Y(0), stroke: "#dfe3ee" }));
      let d = "", pen = false;
      for (let i = 0; i <= 260; i++) {
        const v = xlo + (i / 260) * (xhi - xlo), y = F.f(v);
        if (!isFinite(y) || Math.abs(y) > 30) { pen = false; continue; }
        d += (pen ? " L" : " M") + X(v) + "," + Y(y); pen = true;
      }
      svg.append(s("path", { d, fill: "none", stroke: "#9aa5b8", "stroke-width": 2, "clip-path": clip2 }));
      const a = st.a, h = st.h, fa = F.f(a), fb = F.f(a + h);
      const sec = (fb - fa) / h;
      const tan = F.d(a);
      const line = (x0, y0, slope, colour, width) => {
        const x1 = xlo, x2 = xhi;
        svg.append(s("line", { x1: X(x1), y1: Y(y0 + slope * (x1 - x0)), x2: X(x2), y2: Y(y0 + slope * (x2 - x0)), stroke: colour, "stroke-width": width, "clip-path": clip2 }));
      };
      line(a, fa, tan, C.green, 2);
      if (isFinite(sec)) line(a, fa, sec, C.accent, 2, "6 4");
      [[a, fa, C.green], [a + h, fb, C.warm]].forEach(([px, py, colour]) => {
        if (isFinite(py) && Math.abs(py) < 30) svg.append(s("circle", { cx: X(px), cy: Y(py), r: 5.5, fill: colour }));
      });
      out.innerHTML = `a = <b>${fmt(a, 2)}</b>, h = <b>${fmt(h, 3)}</b> · secant slope \\(\\dfrac{f(a+h)-f(a)}{h}\\) = <b>${fmt(sec, 4)}</b> · tangent slope f′(a) = <b>${fmt(tan, 4)}</b>` +
        `<div class="mnp-dim">${Math.abs(h) < 0.06 ? "h is almost zero — the two lines have met, and the secant limit is the derivative" : "shrink h: the purple secant slides into the green tangent"}</div>`;
      if (window.katex && out.textContent.includes("\\dfrac")) out.innerHTML = out.innerHTML.replace(/\\\(.*?\\\)/g, (m) => window.katex.renderToString(m.slice(2, -2), { throwOnError: false }));
    }
    ctl.append(seg2(Object.keys(FNS).map((k) => ({ label: FNS[k].tex, value: k })), which, (v) => { which = v; paint(); }),
      slider({ label: "point a", min: -2, max: 2, step: 0.1, value: st.a, show: (v) => v.toFixed(1) }, (v) => { st.a = v; paint(); }),
      slider({ label: "step h", min: 0.01, max: 2, step: 0.01, value: st.h, show: (v) => v.toFixed(2) }, (v) => { st.h = v; paint(); }));
    paint();
    return root;
  }

  /* ===================================================================
     21. COORDINATE LAB — distance, midpoint and the circle equation
     =================================================================== */
  function coordlab(opts) {
    opts = opts || {};
    const { root, body } = shell("coordlab", opts.title || "Distance, midpoint and circles",
      "Drag either point. The right triangle, the midpoint and the circle follow.");
    const svg = s("svg", { viewBox: "0 0 420 360", class: "mnp-svg" });
    const out = readout("");
    body.append(svg, out);
    const st = { p: [1, 1], q: [5, 4] };
    function paint() {
      const W = 420, H = 360, pad = 24, lo = -2, hi = 8;
      const X = (v) => pad + ((v - lo) / (hi - lo)) * (W - pad * 2);
      const Y = (v) => H - pad - ((v - lo) / (hi - lo)) * (H - pad * 2);
      svg.innerHTML = "";
      for (let v = lo; v <= hi; v++) {
        svg.append(s("line", { x1: X(v), y1: pad, x2: X(v), y2: H - pad, stroke: "#f0f2f7" }));
        svg.append(s("line", { x1: pad, y1: Y(v), x2: W - pad, y2: Y(v), stroke: "#f0f2f7" }));
      }
      svg.append(s("line", { x1: pad, y1: Y(0), x2: W - pad, y2: Y(0), stroke: "#c3ccdb", "stroke-width": 1.6 }));
      svg.append(s("line", { x1: X(0), y1: pad, x2: X(0), y2: H - pad, stroke: "#c3ccdb", "stroke-width": 1.6 }));
      const [x1, y1] = st.p, [x2, y2] = st.q;
      const dx = x2 - x1, dy = y2 - y1;
      const dist = Math.hypot(dx, dy);
      const mid = [(x1 + x2) / 2, (y1 + y2) / 2];
      svg.append(s("line", { x1: X(x1), y1: Y(y1), x2: X(x2), y2: Y(y1), stroke: C.warm, "stroke-width": 2 }));
      svg.append(s("line", { x1: X(x2), y1: Y(y1), x2: X(x2), y2: Y(y2), stroke: C.warm, "stroke-width": 2 }));
      svg.append(s("line", { x1: X(x1), y1: Y(y1), x2: X(x2), y2: Y(y2), stroke: C.accent, "stroke-width": 2.6 }));
      svg.append(s("circle", { cx: X(mid[0]), cy: Y(mid[1]), r: 5, fill: C.green }));
      svg.append(s("circle", { cx: X(x1), cy: Y(y1), r: 7, fill: "#fff", stroke: C.accent, "stroke-width": 3, class: "mnp-drag", "data-i": 0, style: "cursor:grab" }));
      svg.append(s("circle", { cx: X(x2), cy: Y(y2), r: 7, fill: "#fff", stroke: C.warm, "stroke-width": 3, class: "mnp-drag", "data-i": 1, style: "cursor:grab" }));
      svg.append(s("text", { x: X((x1 + x2) / 2) + 6, y: Y(y1) + 16, class: "mnp-lbl", fill: C.warm, text: "Δx = " + fmt(dx) }));
      svg.append(s("text", { x: X(x2) + 8, y: Y((y1 + y2) / 2), class: "mnp-lbl", fill: C.warm, text: "Δy = " + fmt(dy) }));
      svg.append(s("text", { x: X((x1 + x2) / 2) - 10, y: Y((y1 + y2) / 2) - 8, class: "mnp-lbl", fill: C.accent, text: fmt(dist, 2) }));
      out.innerHTML = `P(${fmt(x1)}, ${fmt(y1)}) · Q(${fmt(x2)}, ${fmt(y2)}) → distance <b>${fmt(dist, 3)}</b>, midpoint <b>(${fmt(mid[0], 2)}, ${fmt(mid[1], 2)})</b>` +
        `<div class="mnp-dim">distance = √(Δx² + Δy²) = √(${dx * dx} + ${dy * dy}); the circle round P through Q is (x − ${fmt(x1)})² + (y − ${fmt(y1)})² = ${fmt(dist * dist, 2)}</div>`;
    }
    let drag = null;
    svg.addEventListener("pointerdown", (e) => {
      const c = e.target.closest(".mnp-drag");
      if (!c) return;
      drag = Number(c.dataset.i); svg.setPointerCapture(e.pointerId); e.preventDefault();
    });
    svg.addEventListener("pointermove", (e) => {
      if (drag === null) return;
      const r = svg.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * 420, py = ((e.clientY - r.top) / r.height) * 360;
      const vx = clamp(Math.round(((px - 24) / (420 - 48)) * 10 - 2), -2, 8);
      const vy = clamp(Math.round((((360 - 24) - py) / (360 - 48)) * 10 - 2), -2, 8);
      st.p = drag === 0 ? [vx, vy] : st.p; st.q = drag === 1 ? [vx, vy] : st.q;
      paint();
    });
    const up = () => { drag = null; };
    svg.addEventListener("pointerup", up);
    svg.addEventListener("pointercancel", up);
    paint();
    return root;
  }

  /* ===================================================================
     22. FUNCTION MACHINE — feed it a number, watch the rule work
     =================================================================== */
  function machine(opts) {
    opts = opts || {};
    const { root, body } = shell("machine", opts.title || "The function machine",
      "Pick a rule and feed it inputs: the machine does the same thing to every number.");
    const svg = s("svg", { viewBox: "0 0 640 220", class: "mnp-svg" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    body.append(svg, ctl, out);
    const FNS = {
      lin: { tex: "f(x) = 2x + 1", f: (x) => 2 * x + 1, steps: (x) => ["take x", "double it", "add 1"] },
      quad: { tex: "f(x) = x² − 3", f: (x) => x * x - 3, steps: (x) => ["take x", "square it", "take away 3"] },
      abs: { tex: "f(x) = |x| + 1", f: (x) => Math.abs(x) + 1, steps: (x) => ["take x", "drop the sign", "add 1"] },
      recip: { tex: "f(x) = 1/(x − 2)", f: (x) => 1 / (x - 2), steps: () => ["take x", "take away 2", "flip it"] },
    };
    let which = opts.key && FNS[opts.key] ? opts.key : "lin";
    const st = { x: 3 };
    function paint() {
      const F = FNS[which], x = st.x;
      svg.innerHTML = "";
      const box = (bx, label, sub, colour) => {
        svg.append(s("rect", { x: bx, y: 70, width: 150, height: 78, rx: 12, fill: "#fff", stroke: colour, "stroke-width": 2 }));
        svg.append(s("text", { x: bx + 75, y: 104, "text-anchor": "middle", class: "mnp-big", text: label }));
        svg.append(s("text", { x: bx + 75, y: 128, "text-anchor": "middle", class: "mnp-tick", text: sub }));
      };
      box(24, "x = " + fmt(x), "input", C.accent);
      box(245, "rule", F.tex, "the machine", "#8a94b8");
      const y = F.f(x);
      box(466, isFinite(y) ? "f(x) = " + fmt(y, 3) : "not allowed", "output", isFinite(y) ? C.green : C.red);
      const defs = s("defs", {}, [s("marker", { id: "arw", markerWidth: 8, markerHeight: 8, refX: 5, refY: 3, orient: "auto" }, [s("path", { d: "M0,0 L6,3 L0,6 z", fill: "#c3ccdb" })])]);
      svg.append(defs);
      [189, 410].forEach((bx) => svg.append(s("path", { d: `M${bx},109 l40,0`, stroke: "#c3ccdb", "stroke-width": 2, "marker-end": "url(#arw)" })));
      const steps = F.steps(x).join(" → ");
      out.innerHTML = `x = <b>${fmt(x)}</b> ${steps} → <b>${isFinite(y) ? fmt(y, 3) : "undefined"}</b>` +
        (isFinite(y) ? "" : ` <span class="mnp-dim">— x = ${fmt(x)} is outside the domain, so the machine refuses</span>`);
    }
    ctl.append(seg2(Object.keys(FNS).map((k) => ({ label: FNS[k].tex, value: k })), which, (v) => { which = v; paint(); }),
      slider({ label: "input x", min: -6, max: 8, step: 0.5, value: st.x, show: (v) => v.toFixed(1) }, (v) => { st.x = v; paint(); }));
    paint();
    return root;
  }
  /* ===================================================================
     23. TRANSFORMATIONS — a, h and k on a draggable family of curves
     =================================================================== */
  function transformlab(opts) {
    opts = opts || {};
    const FAMS = {
      square: { tex: "x²", f: (x) => x * x, guide: [[0, 0], [1, 1]] },
      abs: { tex: "|x|", f: (x) => Math.abs(x), guide: [[0, 0], [1, 1]] },
      root: { tex: "√x", f: (x) => (x >= 0 ? Math.sqrt(x) : NaN), guide: [[0, 0], [1, 1], [4, 2]] },
      sin: { tex: "sin x", f: (x) => Math.sin(x), guide: [[0, 0], [Math.PI / 2, 1]] },
      cube: { tex: "x³", f: (x) => x * x * x, guide: [[0, 0], [1, 1]] },
    };
    let fam = opts.key && FAMS[opts.key] ? opts.key : "square";
    const { root, body } = shell("transformlab", opts.title || "Transformations of a graph",
      "Drag a, h and k: every point obeys the same rule, so the whole curve moves as one.");
    const svg = s("svg", { viewBox: "0 0 640 300", class: "mnp-svg" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    body.append(svg, ctl, out);
    const st = { a: 1, h: 0, k: 0 };

    function paint() {
      const F = FAMS[fam], W = 640, H = 300, pad = 32;
      const lo = -5, hi = 5;
      const X = (v) => pad + ((v - lo) / (hi - lo)) * (W - pad * 2);
      const Y = (v) => H - pad - ((v - 8) / 16) * (H - pad * 2);
      svg.innerHTML = "";
      const grid = s("g");
      for (let v = lo; v <= hi; v++) {
        grid.append(s("line", { x1: X(v), y1: pad, x2: X(v), y2: H - pad, stroke: "#f2f4f9" }));
        grid.append(s("line", { x1: pad, y1: Y(v), x2: W - pad, y2: Y(v), stroke: "#f2f4f9" }));
      }
      grid.append(s("line", { x1: pad, y1: Y(0), x2: W - pad, y2: Y(0), stroke: "#c3ccdb" }));
      grid.append(s("line", { x1: X(0), y1: pad, x2: X(0), y2: H - pad, stroke: "#c3ccdb" }));
      svg.append(grid);
      const clipT = panelClip(svg, pad, pad, W - pad * 2, H - pad * 2);
      const path = (fn, colour, width, dash) => {
        let d = "", pen = false;
        for (let i = 0; i <= 320; i++) {
          const x = lo + (i / 320) * (hi - lo), y = fn(x);
          if (!isFinite(y) || Math.abs(y) > 30) { pen = false; continue; }
          d += (pen ? " L" : " M") + X(x) + "," + Y(y); pen = true;
        }
        svg.append(s("path", { d, fill: "none", stroke: colour, "stroke-width": width, "stroke-dasharray": dash || null, "clip-path": clipT }));
      };
      path(F.f, "#c3ccdb", 2, "6 5");
      path((x) => st.a * F.f(x - st.h) + st.k, C.accent, 2.8);
      F.guide.forEach(([gx, gy]) => {
        const px = gx + st.h, py = st.a * gy + st.k;
        if (Math.abs(px) < 9 && Math.abs(py) < 12) {
          svg.append(s("circle", { cx: X(gx), cy: Y(gy), r: 3.5, fill: "#b9c0cd" }));
          svg.append(s("circle", { cx: X(px), cy: Y(py), r: 4.5, fill: C.accent }));
          svg.append(s("line", { x1: X(gx), y1: Y(gy), x2: X(px), y2: Y(py), stroke: "#e0dcff", "stroke-dasharray": "3 3" }));
        }
      });
      const moves = [];
      if (st.a !== 1) moves.push(st.a < 0 ? "reflected in the x-axis" : st.a > 1 ? "stretched vertically ×" + fmt(st.a, 2) : "squashed vertically ×" + fmt(st.a, 2));
      if (st.h) moves.push("moved " + Math.abs(st.h) + " " + (st.h > 0 ? "right" : "left"));
      if (st.k) moves.push("moved " + Math.abs(st.k) + " " + (st.k > 0 ? "up" : "down"));
      const inner = st.h ? `(x ${st.h > 0 ? "− " + st.h : "+ " + Math.abs(st.h)})` : "";
      const tail = st.k ? (st.k > 0 ? " + " + st.k : " − " + Math.abs(st.k)) : "";
      out.innerHTML = `f(x) = <b>${st.a === 1 ? "" : fmt(st.a, 2)}${F.tex}${inner}${tail}</b>` +
        `<div class="mnp-dim">${moves.length ? moves.join(" · ") : "the parent curve, untouched"} — inside the bracket changes x, outside changes y</div>`;
    }
    ctl.append(seg2(Object.keys(FAMS).map((k) => ({ label: FAMS[k].tex, value: k })), fam, (v) => { fam = v; paint(); }),
      slider({ label: "a (vertical)", min: -2, max: 2, step: 0.25, value: st.a, show: (v) => v.toFixed(2) }, (v) => { st.a = v || 1; paint(); }),
      slider({ label: "h (horizontal)", min: -4, max: 4, step: 0.5, value: st.h, show: (v) => v.toFixed(1) }, (v) => { st.h = v; paint(); }),
      slider({ label: "k (up/down)", min: -4, max: 4, step: 0.5, value: st.k, show: (v) => v.toFixed(1) }, (v) => { st.k = v; paint(); }));
    paint();
    return root;
  }

  /* ===================================================================
     24. PIECE LAB — a break point you can drag: continuous or not?
     =================================================================== */
  function piecelab(opts) {
    opts = opts || {};
    const variant = opts.variant || "jump";
    const { root, body } = shell("piecelab",
      variant === "corner" ? "Corner or smooth?" : "Continuity at a break point",
      variant === "corner" ? "Drag the break. The two pieces meet — but a corner still has no single derivative."
        : "Drag the break point and the right-hand piece's height: the limit exists only when both sides agree.");
    const svg = s("svg", { viewBox: "0 0 640 300", class: "mnp-svg" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    body.append(svg, ctl, out);
    const st = { b: 1, c: 0, round: false };

    const left = (x) => x + 1;
    const rightF = (x) => (variant === "corner" ? 2 : st.c) + (x - st.b) * (variant === "corner" ? 1 : 0.5);
    const fval = (x) => (x < st.b ? left(x) : rightF(x));

    function paint() {
      const W = 640, H = 300, pad = 32, lo = -3, hi = 6;
      const X = (v) => pad + ((v - lo) / (hi - lo)) * (W - pad * 2);
      const Y = (v) => H - pad - ((v + 2) / 9) * (H - pad * 2);
      svg.innerHTML = "";
      svg.append(s("rect", { x: pad, y: pad, width: W - pad * 2, height: H - pad * 2, fill: "#fbfcfe", stroke: "#e4e8f0" }));
      svg.append(s("line", { x1: pad, y1: Y(0), x2: W - pad, y2: Y(0), stroke: "#d6dbe7" }));
      svg.append(s("line", { x1: X(0), y1: pad, x2: X(0), y2: H - pad, stroke: "#d6dbe7" }));
      svg.append(s("line", { x1: X(st.b), y1: pad, x2: X(st.b), y2: H - pad, stroke: "#e6e2ff", "stroke-dasharray": "4 4" }));
      svg.append(s("path", { d: `M${X(lo)},${Y(left(lo))} L${X(st.b)},${Y(left(st.b))}`, fill: "none", stroke: C.accent, "stroke-width": 2.8 }));
      svg.append(s("path", { d: `M${X(st.b)},${Y(rightF(st.b))} L${X(hi)},${Y(rightF(hi))}`, fill: "none", stroke: C.warm, "stroke-width": 2.8 }));
      const L = left(st.b), Rt = rightF(st.b), same = Math.abs(L - Rt) < 1e-9;
      svg.append(s("circle", { cx: X(st.b), cy: Y(L), r: 5, fill: same ? C.green : "#fff", stroke: C.accent, "stroke-width": 2.4 }));
      svg.append(s("circle", { cx: X(st.b), cy: Y(Rt), r: 5, fill: same ? C.green : "#fff", stroke: C.warm, "stroke-width": 2.4 }));
      svg.append(s("text", { x: X(st.b) + 8, y: H - pad + 16, class: "mnp-tick", text: "x = " + fmt(st.b) }));
      const slopes = variant === "corner" ? [1, 1] : [1, 0.5];
      if (variant === "corner") {
        out.innerHTML = same
          ? `the pieces meet at <b>(${fmt(st.b)}, ${fmt(L)})</b> — continuous, but the left slope is <b>1</b> and the right slope is <b>${fmt(slopes[1])}</b>, so it is not differentiable there (a corner)`
          : `the pieces do not meet — left ends at ${fmt(L)}, right starts at ${fmt(Rt)} · a jump, so neither continuous nor differentiable`;
      } else {
        out.innerHTML = `x = <b>${fmt(st.b)}</b> · left limit <b>${fmt(L)}</b>, right limit <b>${fmt(Rt)}</b> → ${same ? "<b style='color:" + C.green + "'>the limit exists and equals f(" + fmt(st.b) + ") = " + fmt(L) + "</b> — continuous" : "<b style='color:" + C.red + "'>the two sides disagree, so the limit does not exist</b>"}`;
      }
    }
    ctl.append(slider({ label: "break point", min: -2, max: 4, step: 0.5, value: st.b, show: (v) => v.toFixed(1) }, (v) => { st.b = v; paint(); }));
    if (variant !== "corner") ctl.append(slider({ label: "right-hand height", min: -1, max: 5, step: 0.5, value: st.c, show: (v) => v.toFixed(1) }, (v) => { st.c = v; paint(); }));
    paint();
    return root;
  }

  /* ===================================================================
     25. RELATED RATES — a ladder sliding, with both rates on screen
     =================================================================== */
  function ratelab(opts) {
    opts = opts || {};
    const { root, body } = shell("ratelab", opts.title || "Related rates: the sliding ladder",
      "Slide the foot of the ladder outwards: x grows, y shrinks, and the two rates are tied together.");
    const svg = s("svg", { viewBox: "0 0 640 320", class: "mnp-svg" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    body.append(svg, ctl, out);
    const st = { L: 10, x: 6, dx: 2 };

    function paint() {
      const W = 640, H = 320, pad = 40, span = 12;
      const X = (v) => pad + (v / span) * (W - pad * 2);
      const Y = (v) => H - pad - (v / span) * (H - pad * 2);
      const x = st.x, y = Math.sqrt(Math.max(st.L * st.L - x * x, 0.0001));
      const dydt = -(x / y) * st.dx;
      svg.innerHTML = "";
      svg.append(s("line", { x1: pad, y1: H - pad, x2: W - pad, y2: H - pad, stroke: "#c3ccdb", "stroke-width": 2 }));
      svg.append(s("line", { x1: pad, y1: pad, x2: pad, y2: H - pad, stroke: "#c3ccdb", "stroke-width": 2 }));
      svg.append(s("rect", { x: X(0), y: Y(y), width: X(x) - X(0), height: Y(0) - Y(y), fill: "#efeaff", "fill-opacity": 0.55, stroke: "#d9d2ff" }));
      svg.append(s("line", { x1: X(0), y1: Y(y), x2: X(x), y2: Y(0), stroke: C.accent, "stroke-width": 4, "stroke-linecap": "round" }));
      svg.append(s("circle", { cx: X(x), cy: Y(0), r: 8, fill: "#fff", stroke: C.warm, "stroke-width": 3, class: "mnp-drag", style: "cursor:ew-resize" }));
      svg.append(s("text", { x: (X(0) + X(x)) / 2, y: H - pad + 22, "text-anchor": "middle", class: "mnp-lbl", fill: C.warm, text: "x = " + fmt(x, 2) }));
      svg.append(s("text", { x: pad + 6, y: (Y(0) + Y(y)) / 2 - 6, class: "mnp-lbl", fill: C.accent, text: "y = " + fmt(y, 2) }));
      svg.append(s("text", { x: (X(0) + X(x)) / 2 + 12, y: (Y(0) + Y(y)) / 2 - 10, class: "mnp-tick", fill: C.ink2, text: "L = " + st.L }));
      out.innerHTML = `x² + y² = ${st.L}² → 2x·x′ + 2y·y′ = 0 → <b>y′ = −(x/y)·x′</b> = −(${fmt(x, 2)}/${fmt(y, 2)})·${fmt(st.dx, 1)} = <b>${fmt(dydt, 3)}</b>` +
        `<div class="mnp-dim">the top of the ladder falls at ${fmt(Math.abs(dydt), 2)} units per second while the foot moves out at ${fmt(st.dx, 2)} — and the fall accelerates as y shrinks</div>`;
    }
    let drag = false;
    svg.addEventListener("pointerdown", (e) => { if (e.target.closest(".mnp-drag")) { drag = true; svg.setPointerCapture(e.pointerId); e.preventDefault(); } });
    svg.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const r = svg.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * 640;
      const v = clamp(((px - 40) / (640 - 80)) * 12, 0.5, st.L - 0.5);
      st.x = Math.round(v * 10) / 10;
      paint();
    });
    const up = () => { drag = false; };
    svg.addEventListener("pointerup", up);
    svg.addEventListener("pointercancel", up);
    ctl.append(slider({ label: "ladder length", min: 6, max: 12, step: 0.5, value: st.L }, (v) => { st.L = v; st.x = Math.min(st.x, v - 1); paint(); }),
      slider({ label: "foot speed x′", min: 0.5, max: 4, step: 0.5, value: st.dx }, (v) => { st.dx = v; paint(); }));
    paint();
    return root;
  }

  /* ===================================================================
     26. GRAPH READER — drag a vertical line, read the graph off it
     =================================================================== */
  function graphreadlab(opts) {
    opts = opts || {};
    const FN = {
      cubic: { tex: "x³ − 4x", f: (x) => x * x * x - 4 * x, zeros: [-2, 0, 2], ext: [[-1.155, 3.079, "maximum"], [1.155, -3.079, "minimum"]] },
      quad: { tex: "x² − 2x − 3", f: (x) => x * x - 2 * x - 3, zeros: [-1, 3], ext: [[1, -4, "minimum"]] },
      step: { tex: "piecewise", f: (x) => (x < 1 ? x + 1 : x * x - 3), zeros: [], ext: [] },
    };
    let which = opts.key && FN[opts.key] ? opts.key : "cubic";
    const { root, body } = shell("graphreadlab", opts.title || "Reading a graph",
      "Drag the cursor: f(x), the zeros and the turning points are all read off the curve.");
    const svg = s("svg", { viewBox: "0 0 640 320", class: "mnp-svg" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    body.append(svg, ctl, out);
    const st = { x: 1.4 };

    function paint() {
      const F = FN[which], W = 640, H = 320, pad = 34, lo = -4, hi = 4;
      const X = (v) => pad + ((v - lo) / (hi - lo)) * (W - pad * 2);
      const Y = (v) => H - pad - ((v + 7) / 15) * (H - pad * 2);
      svg.innerHTML = "";
      svg.append(s("rect", { x: pad, y: pad, width: W - pad * 2, height: H - pad * 2, fill: "#fbfcfe", stroke: "#e4e8f0" }));
      const clipG = panelClip(svg, pad, pad, W - pad * 2, H - pad * 2);
      for (let v = lo; v <= hi; v++) svg.append(s("line", { x1: X(v), y1: pad, x2: X(v), y2: H - pad, stroke: "#f2f4f9" }));
      svg.append(s("line", { x1: pad, y1: Y(0), x2: W - pad, y2: Y(0), stroke: "#c3ccdb" }));
      svg.append(s("line", { x1: X(0), y1: pad, x2: X(0), y2: H - pad, stroke: "#c3ccdb" }));
      let d = "", pen = false;
      for (let i = 0; i <= 340; i++) {
        const x = lo + (i / 340) * (hi - lo), y = F.f(x);
        if (!isFinite(y) || Math.abs(y) > 20) { pen = false; continue; }
        d += (pen ? " L" : " M") + X(x) + "," + Y(y); pen = true;
      }
      svg.append(s("path", { d, fill: "none", stroke: C.accent, "stroke-width": 2.8, "clip-path": clipG }));
      F.zeros.forEach((z) => svg.append(s("circle", { cx: X(z), cy: Y(0), r: 4.5, fill: C.green })));
      F.ext.forEach(([px, py, kind]) => {
        svg.append(s("circle", { cx: X(px), cy: Y(py), r: 4.5, fill: C.warm }));
        svg.append(s("text", { x: X(px), y: Y(py) - 9, "text-anchor": "middle", class: "mnp-tick", fill: C.warm, text: kind }));
      });
      const y = F.f(st.x);
      svg.append(s("line", { x1: X(st.x), y1: pad, x2: X(st.x), y2: H - pad, stroke: "#e6e2ff", "stroke-width": 1.6, class: "mnp-drag", style: "cursor:ew-resize" }));
      if (isFinite(y) && Math.abs(y) < 20) {
        svg.append(s("circle", { cx: X(st.x), cy: Y(y), r: 6, fill: "#fff", stroke: C.ink, "stroke-width": 2.4 }));
        svg.append(s("line", { x1: pad, y1: Y(y), x2: X(st.x), y2: Y(y), stroke: "#dfe3ee", "stroke-dasharray": "3 3" }));
        svg.append(s("text", { x: pad + 4, y: Y(y) - 6, class: "mnp-tick", text: "f(x) = " + fmt(y, 2) }));
      }
      const nearExt = F.ext.find(([px]) => Math.abs(px - st.x) < 0.25);
      const nearZero = F.zeros.find((z) => Math.abs(z - st.x) < 0.25);
      out.innerHTML = `x = <b>${fmt(st.x, 2)}</b> → f(x) = <b>${isFinite(y) ? fmt(y, 3) : "undefined"}</b>` +
        (nearZero !== undefined ? " · a <b>zero</b> of the function" : "") +
        (nearExt ? " · a local <b>" + nearExt[2] + "</b>" : "") +
        `<div class="mnp-dim">zeros at x = ${F.zeros.length ? F.zeros.join(", ") : "none shown"} · turning points at x ≈ ${F.ext.length ? F.ext.map((e) => fmt(e[0], 2)).join(", ") : "none"}</div>`;
    }
    let drag = false;
    svg.addEventListener("pointerdown", (e) => { drag = true; svg.setPointerCapture(e.pointerId); e.preventDefault(); });
    svg.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const r = svg.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * 640;
      st.x = clamp(Math.round((((px - 34) / (640 - 68)) * 8 - 4) * 20) / 20, -4, 4);
      paint();
    });
    const up = () => { drag = false; };
    svg.addEventListener("pointerup", up);
    svg.addEventListener("pointercancel", up);
    ctl.append(seg2(Object.keys(FN).map((k) => ({ label: FN[k].tex, value: k })), which, (v) => { which = v; paint(); }),
      slider({ label: "cursor x", min: -4, max: 4, step: 0.05, value: st.x, show: (v) => v.toFixed(2) }, (v) => { st.x = v; paint(); }));
    paint();
    return root;
  }
  /* ===================================================================
     CHAPTER LABS — the question-bank books have no lessons, so every
     chapter page gets its own interactive instead. Same kit, same look.
     =================================================================== */

  const chGcd = (a, b) => (b ? chGcd(b, a % b) : Math.abs(a));
  const chSvg = (h, extra) => s("svg", Object.assign({ viewBox: "0 0 640 " + h, class: "mnp-svg", role: "img" }, extra || {}));
  const chFrame = (svg, W, H, pad) => {
    const p = pad == null ? 26 : pad;
    svg.append(s("rect", { x: p, y: p, width: W - 2 * p, height: H - 2 * p, rx: 12, fill: "#fbfcfe", stroke: "#e4e8f0" }));
    return p;
  };

  /* ---------- 1. SORT IT — click a card, then the box it belongs in ---------- */
  function classifylab(opts) {
    const items = (opts.items || []).map((x) => ({ ...x, done: false }));
    const buckets = opts.buckets || [];
    const sh = shell("classifylab", opts.title || "Sort them", opts.hint || "Click a card, then the box it belongs in.");
    const svg = chSvg(120, { "aria-label": "the piles filling up" });
    const lane = el("div", { class: "mnp-chips mnp-sortline" });
    const boxes = el("div", { class: "mnp-buckets" });
    const out = readout("");
    let picked = null;
    const pile = () => {
      svg.innerHTML = "";
      const n = buckets.length, colW = 600 / n;
      buckets.forEach((bk, i) => {
        const got = items.filter((x) => x.done && x.b === bk.id);
        const x = 20 + i * colW;
        svg.append(s("rect", { x, y: 20, width: colW - 22, height: 66, rx: 10, fill: got.length ? "#efeaff" : "#fbfcfe", stroke: got.length ? C.accent : "#e4e8f0", "stroke-width": got.length ? 1.8 : 1.2 }));
        svg.append(s("text", { x: x + 12, y: 40, class: "mnp-tick", fill: C.ink2, text: bk.label }));
        svg.append(s("text", { x: x + 12, y: 66, class: "mnp-big", fill: C.accent, text: got.length ? got.map((g) => g.t).join(" ") : "—" }));
      });
    };
    const chips = items.map((it, i) => {
      const b = el("button", { class: "mnp-chip", type: "button", text: it.t, "data-i": i });
      b.addEventListener("click", () => {
        if (it.done) return;
        chips.forEach((c) => c.classList.remove("pick"));
        b.classList.add("pick");
        picked = it;
        out.innerHTML = "Now pick the box for <b>" + it.t + "</b>.";
      });
      lane.append(b);
      return b;
    });
    buckets.forEach((bk) => {
      const box = el("button", { class: "mnp-bucket", type: "button" });
      box.innerHTML = `<b>${bk.label}</b><span class="mnp-bucket-in"></span>`;
      box.addEventListener("click", () => {
        if (!picked) { out.innerHTML = "Pick a card first."; return; }
        if (picked.b === bk.id) {
          picked.done = true;
          const chip = chips[items.indexOf(picked)];
          chip.classList.remove("pick");
          chip.classList.add("ok");
          chip.disabled = true;
          box.querySelector(".mnp-bucket-in").append(chip);
          out.innerHTML = `<b>${picked.t}</b> → ${bk.label}. ${picked.why || ""}`;
          if (items.every((x) => x.done)) out.innerHTML = "All " + items.length + " sorted. " + (opts.done || "");
          picked = null;
          pile();
        } else {
          box.classList.add("no");
          setTimeout(() => box.classList.remove("no"), 420);
          out.innerHTML = "Not that one — <b>" + picked.t + "</b> does not belong in " + bk.label + ".";
        }
      });
      boxes.append(box);
    });
    sh.body.append(svg, lane, boxes, out);
    pile();
    return sh.root;
  }

  /* ---------- 2. SOLVE IT — apply the inverse operations, in order ---------- */
  function steplab(opts) {
    const st = { a: opts.a == null ? 3 : opts.a, b: opts.b == null ? 5 : opts.b, c: opts.c == null ? 20 : opts.c,
                 left: opts.a == null ? 3 : opts.a, rightConst: opts.c == null ? 20 : opts.c,
                 solved: false, flipped: false, lines: [] };
    const ineq = !!opts.ineq;
    const sym = opts.sym || "=";
    const sh = shell("steplab", opts.title || "Solve it step by step",
      opts.hint || "Only the inverse operation moves you forward. Try the wrong one and nothing happens.");
    const svg = chSvg(150, { "aria-label": "the two operations and the answer on the number line" });
    const stage = el("div", { class: "mnp-stage" });
    const work = el("div", { class: "mnp-work" });
    const paintLine = () => {
      svg.innerHTML = "";
      /* the two checkpoints */
      const stepBox = (x, n, label, done) => {
        svg.append(s("rect", { x, y: 14, width: 230, height: 42, rx: 10, fill: done ? "#e6f6ec" : "#fbfcfe", stroke: done ? C.green : "#e4e8f0", "stroke-width": done ? 1.8 : 1.2 }));
        svg.append(s("text", { x: x + 14, y: 40, class: "mnp-lbl", fill: done ? C.green : C.ink2, text: n + "  " + label }));
      };
      stepBox(24, "1", ineq ? "undo the constant" : "undo the constant", !st.b || st.solved);
      stepBox(276, "2", "undo the coefficient", st.solved);
      /* the answer, once known */
      if (st.solved) {
        const v = st.rightConst, lo = Math.min(-2, v - 4), hi = Math.max(2, v + 4);
        const X = (x) => 40 + ((x - lo) / (hi - lo)) * 560;
        const y = 112;
        svg.append(s("line", { x1: 40, y1: y, x2: 600, y2: y, stroke: "#c9d0dd", "stroke-width": 2 }));
        for (let t = Math.ceil(lo); t <= hi; t++) {
          svg.append(s("line", { x1: X(t), y1: y - 5, x2: X(t), y2: y + 5, stroke: "#c3ccdb" }));
          svg.append(s("text", { x: X(t), y: y + 20, "text-anchor": "middle", class: "mnp-tick", text: String(t) }));
        }
        if (ineq) {
          const left = st.a < 0 !== st.flipped;
          svg.append(s("line", { x1: X(v), y1: y, x2: left ? X(lo) : X(hi), y2: y, stroke: C.accent, "stroke-width": 5 }));
          svg.append(s("circle", { cx: X(v), cy: y, r: 6, fill: "#fff", stroke: C.accent, "stroke-width": 2.4 }));
        } else {
          svg.append(s("circle", { cx: X(v), cy: y, r: 6.5, fill: C.accent }));
          svg.append(s("text", { x: X(v), y: y - 12, "text-anchor": "middle", class: "mnp-tick", fill: C.accent, text: fmt(v, 2) }));
        }
      }
    };
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    const sign = (v) => (v < 0 ? "− " + Math.abs(v) : "+ " + v);
    const show = () => {
      const head = st.solved
        ? `${opts.v || "x"} ${ineq ? (st.a < 0 !== st.flipped ? "≥" : "≤") : "="} ${fmt(st.rightConst / st.a, 2)}`
        : `${st.a === 1 ? "" : st.a}${opts.v || "x"} ${st.b ? sign(st.b) + " " : ""}${ineq ? sym : "="} ${st.rightConst}`;
      stage.innerHTML = `<div class="mnp-eq">${head}</div>`;
      work.innerHTML = st.lines.map((l) => `<div class="mnp-work-line">${l}</div>`).join("");
      paintLine();
    };
    const step = (what) => {
      if (st.solved) { out.innerHTML = "Already solved — <b>Start again</b> for a fresh one."; return; }
      if (what === "unb" && st.b) {
        st.rightConst -= st.b;
        st.lines.push(`subtract ${Math.abs(st.b)} from both sides → ${st.a === 1 ? "" : st.a}${opts.v || "x"} = ${fmt(st.rightConst, 2)}`);
        st.b = 0;
        out.innerHTML = `Both sides lost ${Math.abs(st.b)}. Now one operation is left.`;
      } else if (what === "una" && !st.b && st.a !== 1) {
        const before = st.a;
        st.rightConst = st.rightConst / st.a;
        st.a = 1;
        if (ineq && before < 0) { st.flipped = true; out.innerHTML = "You divided by a negative — <b>the inequality flips</b>."; }
        else out.innerHTML = `Divided both sides by ${before}.`;
        st.lines.push(`divide both sides by ${before} → ${opts.v || "x"} = ${fmt(st.rightConst, 2)}`);
        st.solved = true;
      } else {
        out.innerHTML = what === "unb" ? "There is no constant left to undo." : "Deal with the constant first.";
        return;
      }
      show();
      if (st.solved) out.innerHTML = `<b>${opts.v || "x"} ${ineq ? (st.a < 0 !== st.flipped ? "≥" : "≤") : "="} ${fmt(st.rightConst, 2)}</b> — check it by putting it back.`;
    };
    [["unb", "− " + Math.abs(st.b || 0) + " both sides"], ["una", "÷ " + st.a + " both sides"]].forEach(([k, label]) => {
      const b = el("button", { class: "btn soft sm mnp-tok", type: "button", text: label });
      b.dataset.step = k;
      b.addEventListener("click", () => step(k));
      ctl.append(b);
    });
    const again = el("button", { class: "btn ghost sm", type: "button", text: "Start again" });
    again.addEventListener("click", () => {
      st.a = opts.a == null ? 3 : opts.a; st.b = opts.b == null ? 5 : opts.b; st.c = opts.c == null ? 20 : opts.c;
      st.left = st.a; st.rightConst = st.c; st.solved = false; st.flipped = false; st.lines = [];
      ctl.querySelector('[data-step="unb"]').textContent = "− " + Math.abs(st.b) + " both sides";
      ctl.querySelector('[data-step="una"]').textContent = "÷ " + st.a + " both sides";
      show(); out.innerHTML = "";
    });
    ctl.append(again);
    sh.body.append(svg, stage, work, ctl, out);
    show();
    out.innerHTML = "Which operation undoes the constant?";
    return sh.root;
  }

  /* ---------- 3. FUNCTION OR NOT — draw the arrows yourself ---------- */
  function funclab(opts) {
    const sh = shell("funclab", opts.title || "Is it a function?",
      opts.hint || "Click an input, then an output, to draw an arrow. One input with two arrows breaks the rule.");
    const svg = chSvg(230, { "aria-label": "inputs mapped to outputs" });
    const out = readout("");
    const ins = [1, 2, 3, 4];
    const outs = (opts.outs || [1, 3, 5, 4]);
    let arrows = [];
    let picked = null;
    const bx = (i) => 130, ox = 500, y = (i, n) => 40 + (i * (150 / Math.max(1, n - 1))) + 20;
    function draw() {
      svg.innerHTML = "";
      svg.append(s("text", { x: bx(), y: 24, "text-anchor": "middle", class: "mnp-tick", text: "input" }));
      svg.append(s("text", { x: ox, y: 24, "text-anchor": "middle", class: "mnp-tick", text: "output" }));
      ins.forEach((v, i) => {
        const on = picked === v;
        svg.append(s("circle", { cx: bx(), cy: y(i, ins.length), r: 19, fill: on ? "#efeaff" : "#fff", stroke: on ? C.accent : "#dfe3ee", "stroke-width": on ? 2.4 : 1.6 }));
        svg.append(s("text", { x: bx(), y: y(i, ins.length) + 5, "text-anchor": "middle", class: "mnp-big", text: String(v) }));
        const hit = s("circle", { cx: bx(), cy: y(i, ins.length), r: 26, fill: "transparent", style: "cursor:pointer" });
        hit.addEventListener("click", () => { picked = v; draw(); out.innerHTML = "Input <b>" + v + "</b> — now pick the output it points to."; });
        svg.append(hit);
      });
      outs.forEach((v, i) => {
        svg.append(s("circle", { cx: ox, cy: y(i, outs.length), r: 19, fill: "#fff", stroke: "#dfe3ee", "stroke-width": 1.6 }));
        svg.append(s("text", { x: ox, y: y(i, outs.length) + 5, "text-anchor": "middle", class: "mnp-big", text: String(v) }));
        const hit = s("circle", { cx: ox, cy: y(i, outs.length), r: 26, fill: "transparent", style: "cursor:pointer" });
        hit.addEventListener("click", () => {
          if (picked == null) { out.innerHTML = "Pick an input first."; return; }
          arrows.push([picked, v]);
          picked = null;
          draw(); verdict();
        });
        svg.append(hit);
      });
      arrows.forEach(([a, b]) => {
        const ai = ins.indexOf(a), bi = outs.indexOf(b);
        svg.append(s("line", { x1: bx() + 20, y1: y(ai, ins.length), x2: ox - 20, y2: y(bi, outs.length),
          stroke: arrows.filter((x) => x[0] === a).length > 1 ? C.red : C.accent, "stroke-width": 2, "marker-end": "url(#mnpArrow)" }));
      });
    }
    function verdict() {
      const many = ins.filter((v) => arrows.filter((x) => x[0] === v).length > 1);
      const used = ins.filter((v) => arrows.some((x) => x[0] === v));
      if (!arrows.length) return;
      if (many.length) out.innerHTML = `Input <b>${many[0]}</b> has two outputs — <b>not a function</b>. A function gives each input exactly one.`;
      else if (used.length < ins.length) out.innerHTML = `So far each input has one output — a function, but <b>${ins.filter((v) => !used.includes(v)).join(", ")}</b> has no arrow yet.`;
      else out.innerHTML = `<b>Every input has exactly one output — this is a function.</b> (Different inputs may share an output; that is still allowed.)`;
    }
    const ctl = el("div", { class: "mnp-ctl" });
    const clear = el("button", { class: "btn ghost sm", type: "button", text: "Clear the arrows" });
    clear.addEventListener("click", () => { arrows = []; picked = null; draw(); out.innerHTML = "Cleared."; });
    ctl.append(clear);
    sh.body.append(svg, ctl, out);
    draw();
    out.innerHTML = "Draw the mapping, then check the rule.";
    return sh.root;
  }

  /* ---------- 4. THE LINE ITSELF — slope, intercept, parallel, perpendicular ---------- */
  function lineslab(opts) {
    const st = { m: opts.m == null ? 2 : opts.m, b: opts.b == null ? -1 : opts.b, ghost: "none" };
    const W = 640, H = 300, pad = 30;
    const xlo = -6, xhi = 6, ylo = -6, yhi = 6;
    const X = (v) => pad + ((v - xlo) / (xhi - xlo)) * (W - 2 * pad);
    const Y = (v) => H - pad - ((v - ylo) / (yhi - ylo)) * (H - 2 * pad);
    const sh = shell("lineslab", opts.title || "Build the line", opts.hint || "Slope and intercept, then see which lines run parallel and which cross at a right angle.");
    const svg = chSvg(H, { "aria-label": "a line with a parallel and a perpendicular ghost" });
    const ctl = el("div", { class: "mnp-sliders" });
    const out = readout("");
    const sM = slider({ label: "slope m", min: -4, max: 4, step: 0.5, value: st.m, show: (v) => fmt(v, 1) }, (v) => { st.m = v; paint(); });
    const sB = slider({ label: "intercept b", min: -5, max: 5, step: 0.5, value: st.b, show: (v) => fmt(v, 1) }, (v) => { st.b = v; paint(); });
    const segG = seg({ options: [{ label: "plain", value: "none" }, { label: "parallel", value: "par" }, { label: "perpendicular", value: "perp" }], value: "none" },
      (v) => { st.ghost = v; paint(); });
    ctl.append(sM, sB, segG);
    function paint() {
      svg.innerHTML = "";
      svg.append(s("rect", { x: pad, y: pad, width: W - 2 * pad, height: H - 2 * pad, rx: 10, fill: "#fbfcfe", stroke: "#e4e8f0" }));
      const clip = panelClip(svg, pad, pad, W - 2 * pad, H - 2 * pad);
      for (let v = xlo; v <= xhi; v++) if (v) svg.append(s("line", { x1: X(v), y1: pad, x2: X(v), y2: H - pad, stroke: "#f2f4f9" }));
      svg.append(s("line", { x1: pad, y1: Y(0), x2: W - pad, y2: Y(0), stroke: "#dfe3ee" }));
      svg.append(s("line", { x1: X(0), y1: pad, x2: X(0), y2: H - pad, stroke: "#dfe3ee" }));
      const line = (m, b, colour, w, dash) => svg.append(s("line", {
        x1: X(xlo), y1: Y(m * xlo + b), x2: X(xhi), y2: Y(m * xhi + b), stroke: colour, "stroke-width": w,
        "stroke-dasharray": dash || null, "clip-path": clip }));
      if (st.ghost === "par") line(st.m, 3, C.green, 2, "6 4");
      if (st.ghost === "perp") line(st.m ? -1 / st.m : 40, 3, C.warm, 2, "6 4");
      line(st.m, st.b, C.accent, 3.2);
      /* the run-and-rise triangle for the slope */
      const x0 = 1, y0 = st.m * x0 + st.b;
      if (Math.abs(st.m) > 0.01) {
        svg.append(s("line", { x1: X(x0), y1: Y(y0), x2: X(x0 + 1), y2: Y(y0), stroke: C.green, "stroke-width": 2 }));
        svg.append(s("line", { x1: X(x0 + 1), y1: Y(y0), x2: X(x0 + 1), y2: Y(y0 + st.m), stroke: C.warm, "stroke-width": 2 }));
        svg.append(s("text", { x: X(x0 + 0.5), y: Y(y0) + 16, "text-anchor": "middle", class: "mnp-tick", fill: C.green, text: "run 1" }));
        svg.append(s("text", { x: X(x0 + 1) + 8, y: Y(y0 + st.m / 2), class: "mnp-tick", fill: C.warm, text: "rise " + fmt(st.m, 1) }));
      }
      svg.append(s("circle", { cx: X(0), cy: Y(st.b), r: 4.5, fill: C.accent }));
      out.innerHTML = `y = <b>${fmt(st.m, 1)}x ${st.b ? (st.b > 0 ? "+ " + fmt(st.b, 1) : "− " + Math.abs(st.b).toFixed(1)) : ""}</b>` +
        (st.ghost === "par" ? ` · the dashed line has the <b>same slope</b>, so they never meet.`
         : st.ghost === "perp" ? ` · perpendicular slope = −1/m = <b>${fmt(st.m ? -1 / st.m : 0, 2)}</b>; the product of the slopes is −1.`
         : ` · crosses the y-axis at <b>(0, ${fmt(st.b, 1)})</b>.`);
    }
    sh.body.append(svg, ctl, out);
    paint();
    return sh.root;
  }

  /* ---------- 5. TWO LINES — one solution, none, or infinitely many ---------- */
  function syslab(opts) {
    const st = { m1: opts.m1 == null ? 2 : opts.m1, b1: opts.b1 == null ? -1 : opts.b1,
                 m2: opts.m2 == null ? -1 : opts.m2, b2: opts.b2 == null ? 4 : opts.b2 };
    const W = 640, H = 300, pad = 30, lo = -6, hi = 6;
    const X = (v) => pad + ((v - lo) / (hi - lo)) * (W - 2 * pad);
    const Y = (v) => H - pad - ((v - lo) / (hi - lo)) * (H - 2 * pad);
    const sh = shell("syslab", opts.title || "Where do they meet?", opts.hint || "Change the two lines until they cross once, never, or everywhere.");
    const svg = chSvg(H, { "aria-label": "two lines and their intersection" });
    const ctl = el("div", { class: "mnp-sliders" });
    const out = readout("");
    const mk = (label, key, v) => slider({ label, min: -4, max: 4, step: 0.5, value: v, show: (x) => fmt(x, 1) }, (x) => { st[key] = x; paint(); });
    ctl.append(mk("line 1 slope", "m1", st.m1), mk("line 1 intercept", "b1", st.b1), mk("line 2 slope", "m2", st.m2), mk("line 2 intercept", "b2", st.b2));
    function paint() {
      svg.innerHTML = "";
      svg.append(s("rect", { x: pad, y: pad, width: W - 2 * pad, height: H - 2 * pad, rx: 10, fill: "#fbfcfe", stroke: "#e4e8f0" }));
      const clip = panelClip(svg, pad, pad, W - 2 * pad, H - 2 * pad);
      svg.append(s("line", { x1: pad, y1: Y(0), x2: W - pad, y2: Y(0), stroke: "#dfe3ee" }));
      svg.append(s("line", { x1: X(0), y1: pad, x2: X(0), y2: H - pad, stroke: "#dfe3ee" }));
      const draw = (m, b, colour) => svg.append(s("line", { x1: X(lo), y1: Y(m * lo + b), x2: X(hi), y2: Y(m * hi + b), stroke: colour, "stroke-width": 2.8, "clip-path": clip }));
      draw(st.m1, st.b1, C.accent);
      draw(st.m2, st.b2, C.warm);
      if (Math.abs(st.m1 - st.m2) < 1e-9) {
        if (Math.abs(st.b1 - st.b2) < 1e-9) out.innerHTML = "<b>Same line — infinitely many solutions.</b> Every point on it works for both equations.";
        else out.innerHTML = "<b>Parallel — no solution.</b> Same slope, different intercept: they never meet.";
      } else {
        const x = (st.b2 - st.b1) / (st.m1 - st.m2);
        const y = st.m1 * x + st.b1;
        svg.append(s("circle", { cx: X(x), cy: Y(y), r: 6.5, fill: C.green, stroke: "#fff", "stroke-width": 2 }));
        if (x < lo || x > hi || y < lo || y > hi) out.innerHTML = `They cross at <b>(${fmt(x, 2)}, ${fmt(y, 2)})</b> — off the visible frame, so keep sliding.`;
        else out.innerHTML = `<b>One solution: (${fmt(x, 2)}, ${fmt(y, 2)})</b> — the single point on both lines.`;
      }
    }
    sh.body.append(svg, ctl, out);
    paint();
    return sh.root;
  }

  /* ---------- 6. EXPONENT TILES — the rules, as a picture ---------- */
  function explab(opts) {
    const st = { m: 3, n: 2, mode: opts.mode || "mul", a: opts.a || 2 };
    const sh = shell("explab", opts.title || "Exponent rules", opts.hint || "Slide the exponents and watch the factors add up, multiply, or cancel.");
    const svg = chSvg(220, { "aria-label": "factors drawn as tiles" });
    const ctl = el("div", { class: "mnp-sliders" });
    const out = readout("");
    const sM = slider({ label: "first exponent", min: 1, max: 5, value: 3 }, (v) => { st.m = v; paint(); });
    const sN = slider({ label: "second exponent", min: 1, max: 5, value: 2 }, (v) => { st.n = v; paint(); });
    const sA = slider({ label: "base a", min: 2, max: 5, value: st.a }, (v) => { st.a = v; paint(); });
    const segM = seg({ options: [{ label: "×", value: "mul" }, { label: "( )ⁿ", value: "pow" }, { label: "÷", value: "div" }], value: st.mode },
      (v) => { st.mode = v; paint(); });
    ctl.append(sA, sM, sN, segM);
    const tile = (x, y, label, colour) => {
      svg.append(s("rect", { x, y, width: 34, height: 26, rx: 5, fill: colour, stroke: "#d9d2ff" }));
      svg.append(s("text", { x: x + 17, y: y + 18, "text-anchor": "middle", class: "mnp-tick", fill: C.ink, text: label }));
    };
    function paint() {
      svg.innerHTML = "";
      const a = st.a, m = st.m, n = st.n;
      if (st.mode === "mul") {
        for (let i = 0; i < m; i++) tile(40 + i * 40, 60, a, "#efeaff");
        svg.append(s("text", { x: 40 + m * 40 + 6, y: 78, class: "mnp-big", text: "×" }));
        for (let i = 0; i < n; i++) tile(40 + m * 40 + 34 + i * 40, 60, a, "#ffe9d6");
        out.innerHTML = `a<sup>${m}</sup> · a<sup>${n}</sup> = a<sup>${m}+${n}</sup> = <b>${a}<sup>${m + n}</sup> = ${Math.pow(a, m + n)}</b> — you are counting factors, and factors multiply.`;
      } else if (st.mode === "pow") {
        for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) tile(60 + c * 40, 34 + r * 32, a, "#efeaff");
        out.innerHTML = `(a<sup>${m}</sup>)<sup>${n}</sup> = a<sup>${m}·${n}</sup> = <b>${a}<sup>${m * n}</sup> = ${Math.pow(a, m * n)}</b> — a ${m} by ${n} block of factors.`;
      } else {
        const keep = Math.max(m - n, 0);
        for (let i = 0; i < Math.max(m, n); i++) {
          const gone = i >= keep;
          tile(60 + i * 40, 60, a, gone ? "#f4f5f9" : "#efeaff");
          if (gone) svg.append(s("line", { x1: 60 + i * 40, y1: 60, x2: 94 + i * 40, y2: 86, stroke: C.red, "stroke-width": 2 }));
        }
        out.innerHTML = m >= n
          ? `a<sup>${m}</sup> ÷ a<sup>${n}</sup> = a<sup>${m}−${n}</sup> = <b>${a}<sup>${m - n}</sup> = ${Math.pow(a, m - n)}</b> — the cancelling pairs are crossed out.`
          : `a<sup>${m}</sup> ÷ a<sup>${n}</sup> = a<sup>${m - n}</sup> = <b>1/${a}<sup>${n - m}</sup> = ${fmt(1 / Math.pow(a, n - m), 4)}</b> — more on the bottom, so the answer is a fraction.`;
      }
    }
    sh.body.append(svg, ctl, out);
    paint();
    return sh.root;
  }

  /* ---------- 7. AREA MODEL — a product you can see, a trinomial you can read ---------- */
  function arealab(opts) {
    const st = { a: opts.a || 2, b: opts.b || 3, dir: opts.dir || "expand" };
    const sh = shell("arealab", opts.title || "The area model", opts.hint || "Two numbers, four rectangles. Slide them and watch the product rebuild itself.");
    const svg = chSvg(260, { "aria-label": "a rectangle split into four regions" });
    const ctl = el("div", { class: "mnp-sliders" });
    const out = readout("");
    const cur = el("div", { class: "mnp-chips" });
    const sA = slider({ label: "first number", min: 0, max: 6, value: st.a }, (v) => { st.a = v; paint(); });
    const sB = slider({ label: "second number", min: 0, max: 6, value: st.b }, (v) => { st.b = v; paint(); });
    ctl.append(sA, sB);
    function paint() {
      svg.innerHTML = "";
      const ox = 70, oy = 40, ux = 46, uy = 26, X0 = ox + ux, Y0 = oy + uy; /* x-square band, then a·x, b·x rows */
      const w1 = ux * 3, h1 = uy * 3;                                              /* the x by x corner */
      const wa = ux * st.a, wb = ux * st.b, ha = uy * st.a, hb = uy * st.b;
      const region = (x, y, w, h, fill, label, ink) => {
        if (w <= 0 || h <= 0) return;
        svg.append(s("rect", { x, y, width: w, height: h, fill, stroke: "#d9d2ff" }));
        svg.append(s("text", { x: x + w / 2, y: y + h / 2 + 5, "text-anchor": "middle", class: "mnp-lbl", fill: ink || C.ink, text: label }));
      };
      region(X0, Y0, w1, h1, "#e6e0ff", "x²");
      region(X0 + w1, Y0, wa, h1, "#efeaff", st.a + "x");
      region(X0, Y0 + h1, w1, hb, "#efeaff", st.b + "x");
      region(X0 + w1, Y0 + h1, wa, hb, "#ffe9d6", String(st.a * st.b));
      svg.append(s("text", { x: X0 + (w1 + wa) / 2, y: Y0 - 10, "text-anchor": "middle", class: "mnp-big", text: "x + " + st.a }));
      svg.append(s("text", { x: X0 - 14, y: Y0 + (h1 + hb) / 2, "text-anchor": "end", class: "mnp-big", text: "x + " + st.b }));
      const b = st.a + st.b, c = st.a * st.b;
      out.innerHTML = st.dir === "factor"
        ? `x² + ${b}x + ${c} = (x + ${st.a})(x + ${st.b}) — you need two numbers that <b>multiply to ${c}</b> and <b>add to ${b}</b>.`
        : `(x + ${st.a})(x + ${st.b}) = x² + <b>${b}x</b> + <b>${c}</b> — the two middle rectangles are the same kind, so they combine.`;
      cur.innerHTML = st.dir === "factor"
        ? `pair: ${st.a} × ${st.b} = ${c} · sum ${b}` : `four regions: 1 + ${st.a} + ${st.b} + ${c}`;
    }
    const segD = seg({ options: [{ label: "multiply out", value: "expand" }, { label: "factor it", value: "factor" }], value: st.dir },
      (v) => { st.dir = v; paint(); });
    ctl.append(segD);
    sh.body.append(svg, ctl, cur, out);
    paint();
    return sh.root;
  }

  /* ---------- 8. THE PARABOLA — vertex, zeros, discriminant ---------- */
  function quadlab(opts) {
    const st = { a: opts.a || 1, b: opts.b || -2, c: opts.c || -3 };
    const W = 640, H = 300, pad = 30, lo = -6, hi = 6;
    const X = (v) => pad + ((v - lo) / (hi - lo)) * (W - 2 * pad);
    const Y = (v) => H - pad - ((v - lo) / (hi - lo)) * (H - 2 * pad);
    const sh = shell("quadlab", opts.title || "The parabola", opts.hint || "a, b and c: the discriminant tells you how many times the curve crosses the axis.");
    const svg = chSvg(H, { "aria-label": "a parabola with its vertex and zeros" });
    const ctl = el("div", { class: "mnp-sliders" });
    const out = readout("");
    const f = (x) => st.a * x * x + st.b * x + st.c;
    const mk = (label, key, lo2, hi2) => slider({ label, min: lo2, max: hi2, step: 0.5, value: st[key], show: (v) => fmt(v, 1) }, (v) => { st[key] = v; paint(); });
    ctl.append(mk("a", "a", -2, 2), mk("b", "b", -6, 6), mk("c", "c", -6, 6));
    function paint() {
      svg.innerHTML = "";
      svg.append(s("rect", { x: pad, y: pad, width: W - 2 * pad, height: H - 2 * pad, rx: 10, fill: "#fbfcfe", stroke: "#e4e8f0" }));
      const clip = panelClip(svg, pad, pad, W - 2 * pad, H - 2 * pad);
      svg.append(s("line", { x1: pad, y1: Y(0), x2: W - pad, y2: Y(0), stroke: "#dfe3ee" }));
      svg.append(s("line", { x1: X(0), y1: pad, x2: X(0), y2: H - pad, stroke: "#dfe3ee" }));
      if (Math.abs(st.a) < 1e-9) { out.innerHTML = "<b>a = 0 is not a parabola</b> — that is a straight line. Give a a value."; return; }
      let d = "";
      for (let i = 0; i <= 260; i++) {
        const x = lo + (i / 260) * (hi - lo);
        d += (i ? "L" : "M") + X(x).toFixed(1) + " " + Y(clamp(f(x), -900, 900)).toFixed(1);
      }
      svg.append(s("path", { d, fill: "none", stroke: C.accent, "stroke-width": 2.8, "clip-path": clip }));
      const disc = st.b * st.b - 4 * st.a * st.c;
      const vx = -st.b / (2 * st.a), vy = f(vx);
      svg.append(s("circle", { cx: X(vx), cy: Y(clamp(vy, lo, hi)), r: 5.5, fill: C.warm }));
      svg.append(s("text", { x: X(vx), y: Y(clamp(vy, lo, hi)) - 10, "text-anchor": "middle", class: "mnp-tick", fill: C.warm, text: "vertex" }));
      let roots = [];
      if (disc > 0) { roots = [(-st.b - Math.sqrt(disc)) / (2 * st.a), (-st.b + Math.sqrt(disc)) / (2 * st.a)].sort((p, q) => p - q); }
      else if (Math.abs(disc) < 1e-9) roots = [vx];
      roots.forEach((r) => {
        if (r < lo || r > hi) return;
        svg.append(s("circle", { cx: X(r), cy: Y(0), r: 5, fill: C.green }));
        svg.append(s("text", { x: X(r), y: Y(0) + 18, "text-anchor": "middle", class: "mnp-tick", fill: C.green, text: fmt(r, 2) }));
      });
      out.innerHTML = `vertex <b>(${fmt(vx, 2)}, ${fmt(vy, 2)})</b> · discriminant b² − 4ac = <b>${fmt(disc, 2)}</b> → ` +
        (disc > 0 ? "<b>two real zeros</b> (the curve crosses twice)." : Math.abs(disc) < 1e-9 ? "<b>exactly one zero</b> — the vertex sits on the axis." : "<b>no real zeros</b> — the curve never reaches the axis.");
    }
    sh.body.append(svg, ctl, out);
    paint();
    return sh.root;
  }

  /* ---------- 9. RATIONAL FUNCTION — the hole in the domain, the flat asymptote ---------- */
  function ratfnlab(opts) {
    const st = { v: opts.v == null ? 2 : opts.v, k: opts.k == null ? 1 : opts.k, h: opts.h == null ? 0 : opts.h };
    const W = 640, H = 300, pad = 30, lo = -8, hi = 8;
    const X = (v) => pad + ((v - lo) / (hi - lo)) * (W - 2 * pad);
    const Y = (v) => H - pad - ((clamp(v, -8, 8) - lo) / (hi - lo)) * (H - 2 * pad);
    const sh = shell("ratfnlab", opts.title || "A rational function", opts.hint || "The denominator forbids one x; the degrees decide where the curve settles.");
    const svg = chSvg(H, { "aria-label": "a hyperbola with its asymptotes" });
    const ctl = el("div", { class: "mnp-sliders" });
    const out = readout("");
    const f = (x) => (x + st.k) / (x - st.v) + st.h;
    const mk = (label, key, a, b, step) => slider({ label, min: a, max: b, step: step || 1, value: st[key], show: (v) => fmt(v, 1) }, (v) => { st[key] = v; paint(); });
    ctl.append(mk("excluded x", "v", -5, 5), mk("x + k", "k", -5, 5), mk("shift up h", "h", -4, 4, 0.5));
    function paint() {
      svg.innerHTML = "";
      svg.append(s("rect", { x: pad, y: pad, width: W - 2 * pad, height: H - 2 * pad, rx: 10, fill: "#fbfcfe", stroke: "#e4e8f0" }));
      const clip = panelClip(svg, pad, pad, W - 2 * pad, H - 2 * pad);
      svg.append(s("line", { x1: pad, y1: Y(0), x2: W - pad, y2: Y(0), stroke: "#dfe3ee" }));
      svg.append(s("line", { x1: X(0), y1: pad, x2: X(0), y2: H - pad, stroke: "#dfe3ee" }));
      svg.append(s("line", { x1: X(st.v), y1: pad, x2: X(st.v), y2: H - pad, stroke: C.red, "stroke-width": 1.6, "stroke-dasharray": "6 4" }));
      svg.append(s("line", { x1: pad, y1: Y(st.h + 1), x2: W - pad, y2: Y(st.h + 1), stroke: C.warm, "stroke-width": 1.6, "stroke-dasharray": "6 4" }));
      [-1, 1].forEach((side) => {
        let d = "", first = true;
        for (let i = 0; i <= 200; i++) {
          const x = side < 0 ? st.v - 0.02 - (i / 200) * (st.v - lo - 0.02) : st.v + 0.02 + (i / 200) * (hi - st.v - 0.02);
          if (x < lo || x > hi) continue;
          d += (first ? "M" : "L") + X(x).toFixed(1) + " " + Y(f(x)).toFixed(1);
          first = false;
        }
        svg.append(s("path", { d, fill: "none", stroke: C.accent, "stroke-width": 2.6, "clip-path": clip }));
      });
      out.innerHTML = `domain: <b>x ≠ ${st.v}</b> (vertical asymptote) · horizontal asymptote <b>y = ${fmt(st.h + 1, 1)}</b> — the ratio of the leading coefficients: 1 ÷ 1.` +
        (Math.abs(st.k + st.v) < 1e-9 ? " The zero cancels the forbidden value — that is a hole, not an asymptote." : ` Zero at x = <b>${fmt(-st.k, 1)}</b>.`);
    }
    sh.body.append(svg, ctl, out);
    paint();
    return sh.root;
  }

  /* ---------- 10. ROOTS — pull the biggest square out of a number ---------- */
  function rootlab(opts) {
    const st = { n: opts.n || 72, cube: opts.cube || false };
    const sh = shell("rootlab", opts.title || "Simplify the root", opts.hint || "Every perfect square hiding inside the number comes out in front.");
    const svg = chSvg(230, { "aria-label": "the largest square inside the number" });
    const ctl = el("div", { class: "mnp-sliders" });
    const out = readout("");
    const sN = slider({ label: "the number", min: 2, max: 200, value: st.n }, (v) => { st.n = v; paint(); });
    const segK = seg({ options: [{ label: "square root", value: "sq" }, { label: "cube root", value: "cu" }], value: "sq" },
      (v) => { st.cube = v === "cu"; paint(); });
    ctl.append(sN, segK);
    function paint() {
      svg.innerHTML = "";
      const n = st.n;
      const p = st.cube ? 3 : 2;
      let big = 1, rest = n;
      for (let i = Math.floor(Math.pow(n, 1 / p)); i >= 1; i--) {
        const q = Math.pow(i, p);
        if (n % q === 0) { big = i; rest = n / q; break; }
      }
      const cells = Math.min(rest * big * (st.cube ? 1 : 1) * big, 60);
      const gx = 60, gy = 40, side = 20;
      for (let i = 0; i < Math.min(n, 60); i++) {
        const c = i % 10, r = Math.floor(i / 10);
        const inBig = r < big && c < big;
        svg.append(s("rect", { x: gx + c * side, y: gy + r * side, width: side - 1.5, height: side - 1.5, rx: 2,
          fill: inBig ? "#e6e0ff" : "#f4f5f9", stroke: "#d9d2ff" }));
      }
      svg.append(s("text", { x: gx + big * side + 24, y: gy + 22, class: "mnp-lbl", fill: C.accent, text: `${big}${st.cube ? "³" : "²"} = ${Math.pow(big, p)}` }));
      svg.append(s("text", { x: gx + big * side + 24, y: gy + 48, class: "mnp-lbl", fill: C.ink2, text: `left over: ${rest}` }));
      if (n > 60) svg.append(s("text", { x: gx, y: gy + 6 * side + 22, class: "mnp-tick", fill: C.muted, text: "first 60 cells drawn" }));
      const sym = st.cube ? "∛" : "√";
      out.innerHTML = rest === 1
        ? `${sym}${n} = <b>${big}</b> exactly — ${n} is a perfect ${st.cube ? "cube" : "square"}.`
        : `${sym}${n} = ${big === 1 ? sym + n : `<b>${big}${sym}${rest}</b>`} ≈ <b>${fmt(Math.pow(n, 1 / p), 3)}</b> — the ${Math.pow(big, p)} comes out, the ${rest} stays inside.`;
    }
    sh.body.append(svg, ctl, out);
    paint();
    return sh.root;
  }

  /* ---------- 11. THE PATTERN — count the dots, find the rule ---------- */
  function sequlab(opts) {
    const st = { a: opts.a || 3, d: opts.d || 4, n: 5, pick: null };
    const sh = shell("sequlab", opts.title || "Find the rule", opts.hint || "Slide the step and the start, then say which rule fits the dots.");
    const svg = chSvg(220, { "aria-label": "dot figures growing by a constant step" });
    const ctl = el("div", { class: "mnp-sliders" });
    const out = readout("");
    const pickRow = el("div", { class: "mnp-ctl" });
    const sA = slider({ label: "first term", min: 1, max: 8, value: st.a }, (v) => { st.a = v; paint(); });
    const sD = slider({ label: "step", min: 1, max: 6, value: st.d }, (v) => { st.d = v; paint(); });
    const sN = slider({ label: "which term", min: 1, max: 12, value: st.n }, (v) => { st.n = v; paint(); });
    ctl.append(sA, sD, sN);
    const term = (k) => st.a + (k - 1) * st.d;
    function paint() {
      svg.innerHTML = "";
      [1, 2, 3, 4].forEach((k, row) => {
        const v = term(k);
        const show = Math.min(v, 16);
        for (let i = 0; i < show; i++) {
          svg.append(s("circle", { cx: 60 + (i % 8) * 26, cy: 34 + row * 40 + Math.floor(i / 8) * 22, r: 8, fill: row === 3 ? "#e6e0ff" : "#efeaff", stroke: C.accent, "stroke-width": 1.4 }));
        }
        svg.append(s("text", { x: 22, y: 40 + row * 40, class: "mnp-tick", text: "n=" + k }));
        svg.append(s("text", { x: 300, y: 40 + row * 40, class: "mnp-lbl", fill: C.ink2, text: v > 16 ? v + " dots" : "" }));
      });
      out.innerHTML = `term ${st.n} = ${st.a} + ${st.n - 1} × ${st.d} = <b>${term(st.n)}</b>. The rule is <b>${st.a} + (n − 1)${st.d}</b>.`;
    }
    const options = [
      { label: "start + (n−1)·step", ok: true },
      { label: "start · step^n", ok: false, why: "that is geometric — these figures grow by adding, not multiplying." },
      { label: "start + n·step", ok: false, why: "off by one step: the first term uses n − 1, not n." },
    ];
    options.forEach((o) => {
      const b = el("button", { class: "btn soft sm", type: "button", text: o.label });
      b.addEventListener("click", () => {
        pickRow.querySelectorAll("button").forEach((x) => x.classList.remove("on"));
        b.classList.add("on");
        out.innerHTML = o.ok ? `Yes — <b>${st.a} + (n − 1)${st.d}</b>. Every term is one more step than the last.`
                            : `Not quite: ${o.why}`;
      });
      pickRow.append(b);
    });
    sh.body.append(svg, ctl, pickRow, out);
    paint();
    return sh.root;
  }

  /* ---------- 12. COUNTERS — add integers by cancelling pairs ---------- */
  function cntrlab(opts) {
    const st = { pos: opts.pos == null ? 5 : opts.pos, neg: opts.neg == null ? 3 : opts.neg };
    const sh = shell("cntrlab", opts.title || "Positive and negative counters", opts.hint || "One of each cancels. What is left is the sum.");
    const svg = chSvg(180, { "aria-label": "counters pairing up and cancelling" });
    const ctl = el("div", { class: "mnp-sliders" });
    const out = readout("");
    const sP = slider({ label: "positive", min: 0, max: 9, value: st.pos }, (v) => { st.pos = v; paint(); });
    const sN = slider({ label: "negative", min: 0, max: 9, value: st.neg }, (v) => { st.neg = v; paint(); });
    ctl.append(sP, sN);
    function paint() {
      svg.innerHTML = "";
      const pairs = Math.min(st.pos, st.neg);
      const put = (count, y, fill, stroke, label) => {
        for (let i = 0; i < count; i++) {
          const cx = 70 + i * 46;
          svg.append(s("circle", { cx, cy: y, r: 15, fill, stroke, "stroke-width": 1.6 }));
          svg.append(s("text", { x: cx, y: y + 5, "text-anchor": "middle", class: "mnp-tick", fill: stroke, text: label }));
        }
      };
      put(st.pos, 44, "#e6f6ec", C.green, "+");
      put(st.neg, 110, "#ffe9d6", C.warm, "−");
      for (let i = 0; i < pairs; i++) {
        svg.append(s("line", { x1: 70 + i * 46, y1: 60, x2: 70 + i * 46, y2: 94, stroke: C.muted, "stroke-width": 1.4, "stroke-dasharray": "4 3" }));
      }
      const sum = st.pos - st.neg;
      svg.append(s("text", { x: 70 + Math.max(st.pos, st.neg) * 46 + 20, y: 84, class: "mnp-lbl", fill: C.accent, text: "" }));
      out.innerHTML = `${st.pos} + (−${st.neg}) = ${st.pos} − ${st.neg} = <b>${sum}</b> — ${pairs} cancelling pair${pairs === 1 ? "" : "s"}, ${Math.abs(sum)} left on the ${sum >= 0 ? "positive" : "negative"} side.`;
    }
    sh.body.append(svg, ctl, out);
    paint();
    return sh.root;
  }

  /* ---------- 13. THE SIEVE — strike the multiples, the primes are what survives ---------- */
  function sievlab(opts) {
    const N = opts.n || 60;
    const struck = new Set();
    const sh = shell("sievlab", opts.title || "The sieve", opts.hint || "Strike out the multiples of a prime and watch the primes appear.");
    const svg = chSvg(300, { "aria-label": "numbers 2 to 60 with multiples struck out" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    const cols = 10, side = 56, gy = 30;
    function paint() {
      svg.innerHTML = "";
      const primes = [];
      for (let n = 2; n <= N; n++) {
        let p = true;
        for (let d = 2; d * d <= n; d++) if (n % d === 0) { p = false; break; }
        if (p) primes.push(n);
      }
      for (let n = 2; n <= N; n++) {
        const i = n - 2, c = i % cols, r = Math.floor(i / cols);
        const x = 30 + c * side, y = gy + r * 40;
        const dead = struck.has(n);
        const isPrime = primes.includes(n);
        svg.append(s("rect", { x, y, width: side - 6, height: 32, rx: 6,
          fill: dead ? "#f4f5f9" : isPrime && struck.size ? "#e6f6ec" : "#fff",
          stroke: isPrime && struck.size ? C.green : "#e4e8f0", "stroke-width": isPrime && struck.size ? 2 : 1 }));
        svg.append(s("text", { x: x + (side - 6) / 2, y: y + 21, "text-anchor": "middle", class: dead ? "mnp-tick" : "mnp-lbl",
          fill: dead ? C.muted : isPrime && struck.size ? C.green : C.ink, text: String(n) }));
        if (dead) svg.append(s("line", { x1: x + 6, y1: y + 16, x2: x + side - 12, y2: y + 16, stroke: C.red, "stroke-width": 1.6 }));
      }
      const left = primes.filter((p) => !struck.has(p)).length;
      out.innerHTML = struck.size
        ? `<b>${struck.size}</b> numbers struck · <b>${left} primes</b> left standing (2, 3, 5, 7 … are never struck by anything smaller).`
        : "Pick a prime to strike its multiples.";
    }
    [2, 3, 5, 7].forEach((p) => {
      const b = el("button", { class: "btn soft sm mnp-tok", type: "button", text: "strike multiples of " + p });
      b.addEventListener("click", () => {
        for (let n = p * 2; n <= N; n += p) struck.add(n);
        b.classList.add("on");
        paint();
      });
      ctl.append(b);
    });
    const clr = el("button", { class: "btn ghost sm", type: "button", text: "Clear" });
    clr.addEventListener("click", () => { struck.clear(); ctl.querySelectorAll("button").forEach((b) => b.classList.remove("on")); paint(); });
    ctl.append(clr);
    sh.body.append(svg, ctl, out);
    paint();
    return sh.root;
  }

  /* ---------- 14. COMMON DENOMINATORS — split the strips until they match ---------- */
  function baropslab(opts) {
    const st = { n1: opts.n1 || 1, d1: opts.d1 || 2, n2: opts.n2 || 1, d2: opts.d2 || 3 };
    const sh = shell("baropslab", opts.title || "Common denominators", opts.hint || "The strips only add when the pieces are the same size — split until they are.");
    const svg = chSvg(220, { "aria-label": "two fraction strips split into matching pieces" });
    const ctl = el("div", { class: "mnp-sliders" });
    const out = readout("");
    const mk = (label, key, a, b) => slider({ label, min: a, max: b, value: st[key] }, (v) => { st[key] = v; paint(); });
    ctl.append(mk("first numerator", "n1", 1, 9), mk("first denominator", "d1", 2, 9), mk("second numerator", "n2", 1, 9), mk("second denominator", "d2", 2, 9));
    function paint() {
      svg.innerHTML = "";
      const W = 520, x0 = 30;
      const strip = (y, num, den, colour) => {
        for (let i = 0; i < den; i++) {
          svg.append(s("rect", { x: x0 + (i * W) / den, y, width: W / den - 1.5, height: 34, rx: 4,
            fill: i < num ? colour : "#fff", stroke: "#d9d2ff" }));
        }
        /* the common-denominator ticks */
        const lcd = (st.d1 * st.d2) / chGcd(st.d1, st.d2);
        for (let i = 1; i < lcd; i++) svg.append(s("line", { x1: x0 + (i * W) / lcd, y1: y, x2: x0 + (i * W) / lcd, y2: y + 34, stroke: "#b9c0cf", "stroke-width": 1 }));
        svg.append(s("text", { x: x0 - 6, y: y + 23, "text-anchor": "end", class: "mnp-lbl", fill: C.ink2, text: `${num}/${den}` }));
      };
      strip(50, st.n1, st.d1, "#e6e0ff");
      strip(110, st.n2, st.d2, "#ffe9d6");
      const lcd = (st.d1 * st.d2) / chGcd(st.d1, st.d2);
      const sumN = (st.n1 * lcd) / st.d1 + (st.n2 * lcd) / st.d2;
      const g = chGcd(sumN, lcd) || 1;
      out.innerHTML = `LCD = lcm(${st.d1}, ${st.d2}) = <b>${lcd}</b> · ${st.n1}/${st.d1} = ${(st.n1 * lcd) / st.d1}/${lcd} and ${st.n2}/${st.d2} = ${(st.n2 * lcd) / st.d2}/${lcd} → sum = <b>${sumN}/${lcd}${g > 1 ? " = " + sumN / g + "/" + lcd / g : ""}</b>`;
    }
    sh.body.append(svg, ctl, out);
    paint();
    return sh.root;
  }

  /* ===================================================================
     CHAPTER LABS, part two — percent, data, geometry, exam pacing.
     =================================================================== */

  /* ---------- 15. THE HUNDRED GRID — a percent is a picture ---------- */
  function gridlab(opts) {
    const st = { p: opts.p == null ? 35 : opts.p, of: opts.of == null ? 80 : opts.of, mode: opts.mode || "part" };
    const sh = shell("gridlab", opts.title || "Percent as a picture", opts.hint || "The whole is a hundred squares. Shade it and read the part.");
    const svg = chSvg(260, { "aria-label": "a hundred-square grid with part of it shaded" });
    const ctl = el("div", { class: "mnp-sliders" });
    const out = readout("");
    const sP = slider({ label: "percent", min: 0, max: 100, value: st.p, show: (v) => v + "%" }, (v) => { st.p = v; paint(); });
    const sOf = slider({ label: "of the number", min: 10, max: 400, step: 10, value: st.of }, (v) => { st.of = v; paint(); });
    ctl.append(sP, sOf);
    function paint() {
      svg.innerHTML = "";
      const side = 22;
      for (let i = 0; i < 100; i++) {
        svg.append(s("rect", { x: 30 + (i % 10) * side, y: 26 + Math.floor(i / 10) * side, width: side - 1.6, height: side - 1.6, rx: 2,
          fill: i < st.p ? "#e6e0ff" : "#fbfcfe", stroke: i < st.p ? "#c9bffb" : "#e9edf5" }));
      }
      const part = (st.of * st.p) / 100;
      if (st.mode === "change") {
        svg.append(s("text", { x: 300, y: 60, class: "mnp-lbl", fill: C.accent, text: `${st.of} → ${fmt(st.of + part, 1)}` }));
        svg.append(s("text", { x: 300, y: 90, class: "mnp-lbl", fill: C.ink2, text: `increase ${fmt(part, 1)}` }));
        out.innerHTML = `${st.of} + ${st.p}% of ${st.of} = ${st.of} + <b>${fmt(part, 1)}</b> = <b>${fmt(st.of + part, 1)}</b>. A percent is always <b>of something</b> — say the base out loud or the answer is meaningless.`;
      } else {
        out.innerHTML = `${st.p}% of ${st.of} = ${st.p}/100 × ${st.of} = <b>${fmt(part, 1)}</b> · the shaded squares are ${st.p} of the hundred, and ${st.of} scales them to the whole.`;
      }
    }
    sh.body.append(svg, ctl, out);
    paint();
    return sh.root;
  }

  /* ---------- 16. DOT PLOT — put the data down, read the middle out ---------- */
  function plotdotlab(opts) {
    const data = (opts.data || [3, 5, 5, 6, 8]).slice();
    const sh = shell("plotdotlab", opts.title || "Mean, median, mode", opts.hint || "Click the line to add a value; the markers move as the data changes.");
    const svg = chSvg(200, { "aria-label": "a dot plot with mean and median marked" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    const lo = 0, hi = 12;
    const X = (v) => 40 + ((v - lo) / (hi - lo)) * 540;
    const stats = () => {
      const d = data.slice().sort((a, b) => a - b);
      const n = d.length;
      const mean = d.reduce((a, b) => a + b, 0) / (n || 1);
      const med = n % 2 ? d[(n - 1) / 2] : (d[n / 2 - 1] + d[n / 2]) / 2;
      const counts = {};
      d.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
      const top = Math.max(...Object.values(counts));
      const mode = top > 1 ? Object.keys(counts).filter((k) => counts[k] === top).map(Number) : [];
      return { d, n, mean, med, mode, range: n ? d[n - 1] - d[0] : 0 };
    };
    function paint() {
      svg.innerHTML = "";
      svg.append(s("line", { x1: 40, y1: 150, x2: 580, y2: 150, stroke: "#c9d0dd", "stroke-width": 2 }));
      for (let v = lo; v <= hi; v++) {
        svg.append(s("line", { x1: X(v), y1: 146, x2: X(v), y2: 154, stroke: "#c3ccdb" }));
        svg.append(s("text", { x: X(v), y: 172, "text-anchor": "middle", class: "mnp-tick", text: String(v) }));
      }
      const seen = {};
      data.forEach((v) => {
        seen[v] = (seen[v] || 0) + 1;
        svg.append(s("circle", { cx: X(v), cy: 150 - seen[v] * 18, r: 7, fill: "#e6e0ff", stroke: C.accent, "stroke-width": 1.6 }));
      });
      const t = stats();
      if (t.n) {
        svg.append(s("line", { x1: X(t.med), y1: 30, x2: X(t.med), y2: 150, stroke: C.green, "stroke-width": 2, "stroke-dasharray": "5 4" }));
        svg.append(s("text", { x: X(t.med), y: 22, "text-anchor": "middle", class: "mnp-tick", fill: C.green, text: "median " + fmt(t.med, 2) }));
        svg.append(s("circle", { cx: X(t.mean), cy: 150, r: 5.5, fill: C.warm }));
        svg.append(s("text", { x: X(t.mean), y: 140, "text-anchor": "middle", class: "mnp-tick", fill: C.warm, text: "mean " + fmt(t.mean, 2) }));
        out.innerHTML = `${t.n} value${t.n === 1 ? "" : "s"} · mean <b>${fmt(t.mean, 2)}</b> · median <b>${fmt(t.med, 2)}</b> · mode <b>${t.mode.length ? t.mode.join(", ") : "none (all different)"}</b> · range <b>${t.range}</b>. ` +
          (t.mean > t.med + 0.3 ? "Mean sits above the median — the data is pulled right by a big value." : t.mean < t.med - 0.3 ? "Mean sits below the median — a small value is doing the pulling." : "Mean and median are close, so the data is fairly balanced.");
      }
    }
    for (let v = lo + 1; v < hi; v++) {
      const b = el("button", { class: "mnp-tok", type: "button", text: String(v) });
      b.addEventListener("click", () => { data.push(v); paint(); });
      ctl.append(b);
    }
    const clr = el("button", { class: "btn ghost sm", type: "button", text: "Clear" });
    clr.addEventListener("click", () => { data.length = 0; paint(); });
    ctl.append(clr);
    sh.body.append(svg, ctl, out);
    paint();
    return sh.root;
  }

  /* ---------- 17. SPIN IT — theoretical against what actually happened ---------- */
  function spinlab(opts) {
    const sectors = opts.sectors || 6;
    const tally = new Array(sectors).fill(0);
    let spins = 0, ang = -60, spinning = false;
    const sh = shell("spinlab", opts.title || "Theoretical versus experimental",
      opts.hint || "Spin it. With enough spins the tallies crawl towards the theory — that is the whole idea.");
    const svg = chSvg(260, { "aria-label": "a spinner and a tally of results" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    const cx = 150, cy = 130, r = 95;
    function paint() {
      svg.innerHTML = "";
      for (let i = 0; i < sectors; i++) {
        const a0 = (i / sectors) * Math.PI * 2 - Math.PI / 2 + ang, a1 = ((i + 1) / sectors) * Math.PI * 2 - Math.PI / 2 + ang;
        svg.append(s("path", { d: `M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z`,
          fill: i % 2 ? "#efeaff" : "#f7f5ff", stroke: "#d9d2ff" }));
        const am = (a0 + a1) / 2;
        svg.append(s("text", { x: cx + r * 0.66 * Math.cos(am), y: cy + r * 0.66 * Math.sin(am) + 5, "text-anchor": "middle", class: "mnp-tick", text: String(i + 1) }));
      }
      svg.append(s("circle", { cx, cy, r: 9, fill: C.ink }));
      /* the tally bars */
      const max = Math.max(1, ...tally);
      for (let i = 0; i < sectors; i++) {
        const h = (tally[i] / max) * 90;
        svg.append(s("rect", { x: 330 + i * 34, y: 190 - h, width: 24, height: h, rx: 4, fill: i % 2 ? "#e6e0ff" : "#ffe9d6", stroke: "#d9d2ff" }));
        svg.append(s("text", { x: 342 + i * 34, y: 208, "text-anchor": "middle", class: "mnp-tick", text: String(tally[i]) }));
      }
      svg.append(s("text", { x: 330, y: 24, class: "mnp-tick", text: "results after " + spins + " spins" }));
      const theory = 1 / sectors;
      const worst = spins ? Math.max(...tally.map((t) => Math.abs(t / spins - theory))) : 0;
      out.innerHTML = `Each sector is worth <b>1/${sectors} ≈ ${fmt(theory * 100, 1)}%</b>. ` +
        (spins ? `After <b>${spins}</b> spins the biggest gap between the tally and the theory is <b>${fmt(worst * 100, 1)} points</b>${spins < 30 ? " — too few spins to expect a match yet." : spins < 120 ? " — closing." : " — close now."}` : "Spin it a few times.");
    }
    const btn = el("button", { class: "btn soft sm mnp-tok", type: "button", text: "Spin once" });
    btn.addEventListener("click", () => {
      if (spinning) return;
      spinning = true;
      const target = Math.floor(Math.random() * sectors);
      const goal = ang + Math.PI * 2 * 2 + (Math.random() * 0.6 - 0.3);
      const start = ang, t0 = performance.now();
      const tick = () => {
        const k = Math.min(1, (performance.now() - t0) / 700);
        ang = start + (goal - start) * (1 - Math.pow(1 - k, 3));
        paint();
        if (k < 1) requestAnimationFrame(tick);
        else {
          spinning = false;
          /* which sector sits under the pointer at the top */
          const norm = ((-ang % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const landed = Math.floor((norm / (Math.PI * 2)) * sectors) % sectors;
          tally[landed] += 1; spins += 1; paint();
        }
      };
      requestAnimationFrame(tick);
    });
    const many = el("button", { class: "btn ghost sm", type: "button", text: "+ 30 spins" });
    many.addEventListener("click", () => {
      for (let i = 0; i < 30; i++) tally[Math.floor(Math.random() * sectors)] += 1;
      spins += 30; paint();
    });
    const reset = el("button", { class: "btn ghost sm", type: "button", text: "Reset the tally" });
    reset.addEventListener("click", () => { tally.fill(0); spins = 0; paint(); });
    ctl.append(btn, many, reset);
    sh.body.append(svg, ctl, out);
    paint();
    return sh.root;
  }

  /* ---------- 18. SAME SHAPE — scale a figure, keep the ratios ---------- */
  function scalelab(opts) {
    const st = { k: opts.k || 2, a: 3, b: 4 };
    const sh = shell("scalelab", opts.title || "Similar figures", opts.hint || "Every side grows by the same factor — angles never change.");
    const svg = chSvg(240, { "aria-label": "two similar right triangles" });
    const ctl = el("div", { class: "mnp-sliders" });
    const out = readout("");
    const sK = slider({ label: "scale factor", min: 0.5, max: 3, step: 0.5, value: st.k, show: (v) => "× " + fmt(v, 1) }, (v) => { st.k = v; paint(); });
    const sA = slider({ label: "short leg", min: 2, max: 6, value: st.a }, (v) => { st.a = v; paint(); });
    const sB = slider({ label: "long leg", min: 2, max: 8, value: st.b }, (v) => { st.b = v; paint(); });
    ctl.append(sK, sA, sB);
    function paint() {
      svg.innerHTML = "";
      const unit = 22;
      const tri = (x, y, a, b, colour, label) => {
        svg.append(s("path", { d: `M${x} ${y} L${x + a * unit} ${y} L${x} ${y - b * unit} Z`, fill: colour, stroke: C.accent, "stroke-width": 1.8 }));
        svg.append(s("text", { x: x + (a * unit) / 2, y: y + 16, "text-anchor": "middle", class: "mnp-tick", fill: C.ink2, text: label + " " + fmt(a, 1) }));
        svg.append(s("text", { x: x - 6, y: y - (b * unit) / 2, "text-anchor": "end", class: "mnp-tick", fill: C.ink2, text: fmt(b, 1) }));
      };
      tri(50, 200, st.a, st.b, "#e6e0ff", "base");
      tri(300, 200, st.a * st.k, st.b * st.k, "#ffe9d6", "base");
      svg.append(s("text", { x: 300, y: 226, class: "mnp-tick", fill: C.warm, text: "scaled by " + fmt(st.k, 1) }));
      const ratio = st.b / st.a;
      out.innerHTML = `base ↔ height keeps the ratio <b>${fmt(ratio, 2)} : 1</b> in both triangles. Every side is <b>×${fmt(st.k, 1)}</b>, so the perimeter is ×${fmt(st.k, 1)} and the area is ×${fmt(st.k * st.k, 2)} — angles are untouched.`;
    }
    sh.body.append(svg, ctl, out);
    paint();
    return sh.root;
  }

  /* ---------- 19. ONE NUMBER, THREE DRESSES — fraction, decimal, percent ---------- */
  function ratnumlab(opts) {
    const st = { n: opts.n || 3, d: opts.d || 8 };
    const sh = shell("ratnumlab", opts.title || "The same number, three ways", opts.hint || "Slide the fraction: the decimal and the percent are the same point on the line.");
    const svg = chSvg(170, { "aria-label": "a number line showing a fraction, its decimal and its percent" });
    const ctl = el("div", { class: "mnp-sliders" });
    const out = readout("");
    const sN = slider({ label: "numerator", min: -8, max: 8, value: st.n }, (v) => { st.n = v; paint(); });
    const sD = slider({ label: "denominator", min: 2, max: 12, value: st.d }, (v) => { st.d = v; paint(); });
    ctl.append(sN, sD);
    function paint() {
      svg.innerHTML = "";
      const v = st.n / st.d;
      const lo = -2, hi = 2;
      const X = (x) => 40 + ((x - lo) / (hi - lo)) * 540;
      svg.append(s("line", { x1: 40, y1: 90, x2: 580, y2: 90, stroke: "#c9d0dd", "stroke-width": 2 }));
      for (let i = lo; i <= hi; i += 0.5) {
        svg.append(s("line", { x1: X(i), y1: 84, x2: X(i), y2: 96, stroke: "#c3ccdb" }));
        svg.append(s("text", { x: X(i), y: 114, "text-anchor": "middle", class: "mnp-tick", text: fmt(i, 1) }));
      }
      svg.append(s("circle", { cx: X(clamp(v, lo, hi)), cy: 90, r: 7, fill: C.accent }));
      svg.append(s("text", { x: X(clamp(v, lo, hi)), y: 70, "text-anchor": "middle", class: "mnp-lbl", fill: C.accent, text: fmt(v, 3) }));
      const g = chGcd(st.n, st.d) || 1;
      out.innerHTML = `<b>${st.n}/${st.d}</b> = <b>${fmt(v, 4)}</b> = <b>${fmt(v * 100, 2)}%</b>` +
        (g > 1 ? ` · simplifies to <b>${st.n / g}/${st.d / g}</b> (divide top and bottom by ${g}).` : " · already in lowest terms.") +
        (Math.abs(v) > 1 ? " Bigger than 1, so it is a mixed number too." : "");
    }
    sh.body.append(svg, ctl, out);
    paint();
    return sh.root;
  }

  /* ---------- 20. SURFACE AND SOLID — area, then volume ---------- */
  function shapelab(opts) {
    const st = { mode: opts.mode || "area", w: opts.w || 6, h: opts.h || 4, r: opts.r || 3 };
    const sh = shell("shapelab", opts.title || "Area and volume", opts.hint || "Slide the dimensions: one of them grows the answer one way, the other grows it another.");
    const svg = chSvg(260, { "aria-label": "a shape with its dimensions" });
    const ctl = el("div", { class: "mnp-sliders" });
    const out = readout("");
    const sW = slider({ label: "width", min: 1, max: 10, value: st.w }, (v) => { st.w = v; paint(); });
    const sH = slider({ label: "height", min: 1, max: 10, value: st.h }, (v) => { st.h = v; paint(); });
    const sR = slider({ label: "radius", min: 1, max: 8, value: st.r }, (v) => { st.r = v; paint(); });
    ctl.append(sW, sH, sR);
    function paint() {
      svg.innerHTML = "";
      const u = 16;
      if (st.mode === "area") {
        const x = 60, y = 200, w = st.w * u, h = st.h * u;
        svg.append(s("rect", { x, y: y - h, width: w, height: h, fill: "#e6e0ff", stroke: C.accent, "stroke-width": 1.8 }));
        /* a triangle sitting on top, sharing the width */
        svg.append(s("path", { d: `M${x} ${y - h} L${x + w} ${y - h} L${x + w / 2} ${y - h - st.h * u * 0.7} Z`, fill: "#ffe9d6", stroke: C.warm, "stroke-width": 1.8 }));
        svg.append(s("text", { x: x + w / 2, y: y + 18, "text-anchor": "middle", class: "mnp-tick", text: "w = " + st.w }));
        svg.append(s("text", { x: x - 8, y: y - h / 2, "text-anchor": "end", class: "mnp-tick", text: "h = " + st.h }));
        const rect = st.w * st.h, tri = (st.w * st.h * 0.7) / 2;
        out.innerHTML = `rectangle <b>${rect}</b> + triangle <b>${fmt(tri, 2)}</b> = <b>${fmt(rect + tri, 2)}</b> square units. Same width, different height rule — that is why the formulas differ.`;
      } else {
        const x = 90, y = 210, w = st.r * 2 * u * 0.7, h = st.h * u;
        svg.append(s("ellipse", { cx: x + w / 2, cy: y - h, rx: w / 2, ry: 16, fill: "#f4efff", stroke: C.accent }));
        svg.append(s("rect", { x, y: y - h, width: w, height: h, fill: "#efeaff", stroke: C.accent }));
        svg.append(s("ellipse", { cx: x + w / 2, cy: y, rx: w / 2, ry: 16, fill: "#e6e0ff", stroke: C.accent }));
        svg.append(s("text", { x: x + w / 2, y: y + 34, "text-anchor": "middle", class: "mnp-tick", text: "r = " + st.r }));
        svg.append(s("text", { x: x + w + 8, y: y - h / 2, class: "mnp-tick", text: "h = " + st.h }));
        const cyl = Math.PI * st.r * st.r * st.h;
        const cone = cyl / 3;
        out.innerHTML = `cylinder V = πr²h = <b>${fmt(cyl, 1)}</b> · cone with the same base and height = <b>${fmt(cone, 1)}</b> — exactly a third, which is why the cone formula carries ÷3.`;
      }
    }
    sh.body.append(svg, ctl, out);
    paint();
    return sh.root;
  }

  /* ---------- 21. BOX AND WHISKER — five numbers that describe the spread ---------- */
  function boxlab(opts) {
    const nums = (opts.nums || [4, 7, 9, 12, 15]).slice();
    const sh = shell("boxlab", opts.title || "Box and whisker", opts.hint || "Move the five numbers: the box is the middle half, the line inside is the median.");
    const svg = chSvg(200, { "aria-label": "a box-and-whisker plot" });
    const ctl = el("div", { class: "mnp-sliders" });
    const out = readout("");
    const lo = 0, hi = 20;
    const X = (v) => 50 + ((v - lo) / (hi - lo)) * 540;
    const sld = nums.map((v, i) => slider({ label: ["min", "Q1", "median", "Q3", "max"][i], min: lo, max: hi, value: v }, (x) => { nums[i] = x; paint(); }));
    sld.forEach((s2) => ctl.append(s2));
    function paint() {
      svg.innerHTML = "";
      const d = nums.slice().sort((a, b) => a - b);
      const [mn, q1, md, q3, mx] = d;
      const y = 110;
      svg.append(s("line", { x1: X(mn), y1: y, x2: X(q1), y2: y, stroke: "#b9c0cf", "stroke-width": 2 }));
      svg.append(s("line", { x1: X(q3), y1: y, x2: X(mx), y2: y, stroke: "#b9c0cf", "stroke-width": 2 }));
      [mn, mx].forEach((v) => svg.append(s("line", { x1: X(v), y1: y - 18, x2: X(v), y2: y + 18, stroke: "#b9c0cf", "stroke-width": 2 })));
      svg.append(s("rect", { x: X(q1), y: y - 26, width: Math.max(2, X(q3) - X(q1)), height: 52, rx: 5, fill: "#efeaff", stroke: C.accent, "stroke-width": 2 }));
      svg.append(s("line", { x1: X(md), y1: y - 26, x2: X(md), y2: y + 26, stroke: C.green, "stroke-width": 3 }));
      [["min", mn], ["Q1", q1], ["med", md], ["Q3", q3], ["max", mx]].forEach(([lab, v]) => {
        svg.append(s("text", { x: X(v), y: y + 46, "text-anchor": "middle", class: "mnp-tick", text: lab + " " + v }));
      });
      const iqr = q3 - q1;
      out.innerHTML = `IQR = Q3 − Q1 = <b>${iqr}</b> · the middle half of the data lives in ${iqr} units. Whiskers reach ${mn} to ${mx}, and anything below <b>${fmt(q1 - 1.5 * iqr, 1)}</b> or above <b>${fmt(q3 + 1.5 * iqr, 1)}</b> counts as an outlier.`;
    }
    sh.body.append(svg, ctl, out);
    paint();
    return sh.root;
  }

  /* ---------- 22. THE CLOCK — how many seconds does each question get? ---------- */
  function pacelab(opts) {
    const st = { q: opts.q || 40, min: opts.min || 60, left: 0 };
    const sh = shell("pacelab", opts.title || "Pace the paper", opts.hint || "Change the paper and the clock: the seconds per question are what you actually get.");
    const svg = chSvg(150, { "aria-label": "the minutes of the paper, question by question" });
    const ctl = el("div", { class: "mnp-sliders" });
    const out = readout("");
    const sQ = slider({ label: "questions", min: 10, max: 120, step: 5, value: st.q }, (v) => { st.q = v; paint(); });
    const sM = slider({ label: "minutes", min: 15, max: 180, step: 5, value: st.min }, (v) => { st.min = v; paint(); });
    const sL = slider({ label: "left for checking", min: 0, max: 30, step: 5, value: 0 }, (v) => { st.left = v; paint(); });
    ctl.append(sQ, sM, sL);
    function paint() {
      svg.innerHTML = "";
      const usable = Math.max(st.min - st.left, 1);
      const perQ = (usable * 60) / st.q;
      const scale = 540 / st.min;
      svg.append(s("rect", { x: 50, y: 46, width: usable * scale, height: 30, rx: 6, fill: "#e6e0ff", stroke: "#c9bffb" }));
      if (st.left) svg.append(s("rect", { x: 50 + usable * scale, y: 46, width: st.left * scale, height: 30, rx: 6, fill: "#ffe9d6", stroke: "#f0c9a5" }));
      svg.append(s("line", { x1: 50, y1: 92, x2: 590, y2: 92, stroke: "#e4e8f0" }));
      [0, st.min / 2, st.min].forEach((m) => {
        svg.append(s("text", { x: 50 + m * scale, y: 110, "text-anchor": "middle", class: "mnp-tick", text: m + "m" }));
      });
      svg.append(s("text", { x: 50, y: 34, class: "mnp-tick", fill: C.accent, text: "answering" }));
      if (st.left) svg.append(s("text", { x: 50 + usable * scale + 8, y: 34, class: "mnp-tick", fill: C.warm, text: "checking" }));
      const perMarks = Math.min(st.q, 40);
      out.innerHTML = `<b>${st.q}</b> questions in <b>${st.min}</b> minutes` + (st.left ? `, ${st.left} held back` : "") +
        ` → <b>${fmt(perQ, 1)} seconds each</b> (${fmt(usable / st.q, 2)} min). ` +
        (perQ < 45 ? "Under 45 s means the easy items must be near-automatic: read, decide, move."
         : perQ < 90 ? "That is a normal maths-paper pace — bank the easy ones first and come back."
         : "Generous. Spend the surplus on the last items, where the marks usually are.");
    }
    sh.body.append(svg, ctl, out);
    paint();
    return sh.root;
  }

  /* ---------- 23. RAW TO SCALED — where a score lands ---------- */
  function scoremodel(opts) {
    const st = { raw: opts.raw == null ? 60 : opts.raw, max: opts.max || 100 };
    const sh = shell("scoremodel", opts.title || "Raw score to scaled score",
      opts.hint || "The curve never goes up when the raw score goes down — but it is rarely a straight line either.");
    const svg = chSvg(260, { "aria-label": "the conversion curve from raw to scaled score" });
    const ctl = el("div", { class: "mnp-sliders" });
    const out = readout("");
    const sR = slider({ label: "raw score", min: 0, max: 100, value: st.raw }, (v) => { st.raw = v; paint(); });
    ctl.append(sR);
    const curve = (p) => 200 + 600 * Math.pow(clamp(p, 0, 1), 1.12);   /* 200–800 style band */
    function paint() {
      svg.innerHTML = "";
      const W = 640, H = 280, pad = 40;
      const X = (p) => pad + (p / 100) * (W - 2 * pad);
      const Y = (sc) => H - pad - ((sc - 200) / 600) * (H - 2 * pad);
      svg.append(s("rect", { x: pad, y: pad, width: W - 2 * pad, height: H - 2 * pad, rx: 10, fill: "#fbfcfe", stroke: "#e4e8f0" }));
      [200, 400, 600, 800].forEach((sc) => {
        svg.append(s("line", { x1: pad, y1: Y(sc), x2: W - pad, y2: Y(sc), stroke: "#f2f4f9" }));
        svg.append(s("text", { x: pad - 8, y: Y(sc) + 4, "text-anchor": "end", class: "mnp-tick", text: String(sc) }));
      });
      let d = "";
      for (let i = 0; i <= 100; i++) d += (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(curve(i / 100)).toFixed(1);
      svg.append(s("path", { d, fill: "none", stroke: C.accent, "stroke-width": 2.6 }));
      const sc = curve(st.raw / 100);
      svg.append(s("circle", { cx: X(st.raw), cy: Y(sc), r: 6, fill: C.green, stroke: "#fff", "stroke-width": 2 }));
      svg.append(s("text", { x: X(st.raw) + 10, y: Y(sc) - 8, class: "mnp-lbl", fill: C.green, text: fmt(sc, 0) }));
      const band = sc >= 700 ? "top band" : sc >= 600 ? "strong" : sc >= 500 ? "middle" : sc >= 400 ? "building" : "foundation";
      out.innerHTML = `${st.raw} / 100 raw → <b>${fmt(sc, 0)}</b> on the 200–800 scale (${band}). ` +
        (st.raw >= 70 ? "Up here the curve is steep: each extra raw mark is worth more scaled points." : "Low down the curve is flatter — the same effort buys fewer scaled points, so do not leave easy marks behind.");
    }
    sh.body.append(svg, ctl, out);
    paint();
    return sh.root;
  }

  /* ---------- 24. GUESS WELL — crossing out options changes the odds ---------- */
  function guesslab(opts) {
    const state = { out: new Set(), tried: 0, hit: 0 };
    const sh = shell("guesslab", opts.title || "Guess with a reason",
      opts.hint || "Cross out the answers you can rule out, then look at what is left. A blind guess is 25%; an informed one is not.");
    const svg = chSvg(160, { "aria-label": "four answer options, some crossed out" });
    const ctl = el("div", { class: "mnp-ctl" });
    const out = readout("");
    function paint() {
      svg.innerHTML = "";
      const options = ["A", "B", "C", "D"];
      options.forEach((o, i) => {
        const x = 60 + i * 130, dead = state.out.has(o);
        svg.append(s("rect", { x, y: 40, width: 100, height: 62, rx: 12, fill: dead ? "#f4f5f9" : i % 2 ? "#efeaff" : "#fff", stroke: dead ? "#dfe3ee" : "#d9d2ff", "stroke-width": dead ? 1.2 : 1.8 }));
        svg.append(s("text", { x: x + 50, y: 78, "text-anchor": "middle", class: "mnp-big", fill: dead ? C.muted : C.ink, text: o }));
        if (dead) svg.append(s("line", { x1: x + 16, y1: 71, x2: x + 84, y2: 71, stroke: C.red, "stroke-width": 2.4 }));
      });
      const left = 4 - state.out.size;
      const p = left ? 1 / left : 0;
      svg.append(s("text", { x: 320, y: 132, "text-anchor": "middle", class: "mnp-lbl", fill: C.accent, text: left ? "1 in " + left + " = " + fmt(p * 100, 1) + "%" : "nothing left to pick" }));
      out.innerHTML = left ? `You have ruled out <b>${state.out.size}</b> option${state.out.size === 1 ? "" : "s"}, so a random pick from the rest wins <b>${fmt(p * 100, 1)}%</b> of the time. ` +
        (state.tried ? `Your record so far: ${state.hit} of ${state.tried}.` : "") +
        (state.out.size === 0 ? "Cross one out and watch the number move." : "")
        : "That is everything crossed out — one of your rulings is wrong.";
    }
    ["A", "B", "C", "D"].forEach((o) => {
      const b = el("button", { class: "btn soft sm mnp-tok", type: "button", text: "cross out " + o });
      b.addEventListener("click", () => { state.out.has(o) ? state.out.delete(o) : state.out.add(o); b.classList.toggle("on"); paint(); });
      ctl.append(b);
    });
    const tryb = el("button", { class: "btn ghost sm", type: "button", text: "take a guess" });
    tryb.addEventListener("click", () => {
      const left = ["A", "B", "C", "D"].filter((o) => !state.out.has(o));
      if (!left.length) return;
      state.tried += 1;
      if (Math.random() < 1 / left.length) state.hit += 1;
      paint();
    });
    ctl.append(tryb);
    sh.body.append(svg, ctl, out);
    paint();
    return sh.root;
  }

  /* ===================================================================
     registry: lesson id → the lab that fits it
     =================================================================== */
  const LABS = {
    orderlab, numberline, setnest, balance, signtoggle, factorarray, factorlab, fractionlab,
    mixedlab, zerodivide, measurelab, decimallab, ratiolab, expolab, radicallab, scilab,
    mapboard, examplanner, limitlab, slopelab, coordlab, machine,
    transformlab, piecelab, ratelab, graphreadlab,
    /* chapter labs: the question-bank books have chapters, not lessons */
    classifylab, steplab, funclab, lineslab, syslab, explab, arealab, quadlab,
    ratfnlab, rootlab, sequlab, cntrlab, sievlab, baropslab, gridlab, plotdotlab,
    spinlab, scalelab, ratnumlab, shapelab, boxlab, pacelab, scoremodel, guesslab,
  };

  const MAP = {
    "fom:1-1": { kind: "orderlab", opts: { title: "Order of operations" } },
    "fom:1-2": { kind: "expolab", opts: { mode: "rules", title: "The rules on the sheet, moving" } },
    "fom:2-1": { kind: "numberline", opts: { mode: "place", points: [4], title: "Position on the line" } },
    "fom:2-2": { kind: "setnest", opts: {} },
    "fom:2-3": { kind: "balance", opts: {} },
    "fom:2-4": { kind: "numberline", opts: { mode: "place", points: [-4], title: "Opposites across zero" } },
    "fom:2-5": { kind: "numberline", opts: { mode: "ops", points: [-7, 4], title: "Adding on the line" } },
    "fom:2-6": { kind: "signtoggle", opts: { mode: "product", factors: 3 } },
    "fom:2-7": { kind: "signtoggle", opts: { mode: "quotient" } },
    "fom:2-8": { kind: "numberline", opts: { mode: "abs", points: [-6], title: "Distance from zero" } },
    "fom:3-1": { kind: "factorarray", opts: { n: 12 } },
    "fom:3-2": { kind: "factorlab", opts: { tab: "divide", n: 456 } },
    "fom:3-3": { kind: "factorlab", opts: { tab: "lcm", m: 4, n: 6 } },
    "fom:3-4": { kind: "factorarray", opts: { n: 13, title: "Prime, or a rectangle?" } },
    "fom:3-5": { kind: "factorlab", opts: { tab: "tree", n: 84 } },
    "fom:3-6": { kind: "factorlab", opts: { tab: "lcm", m: 12, n: 18 } },
    "fom:3-7": { kind: "factorlab", opts: { tab: "gcf", m: 36, n: 60 } },
    "fom:4-1": { kind: "fractionlab", opts: { mode: "build" } },
    "fom:4-2": { kind: "fractionlab", opts: { mode: "reduce" } },
    "fom:4-3": { kind: "fractionlab", opts: { mode: "compare" } },
    "fom:4-4": { kind: "zerodivide", opts: { top: 12 } },
    "fom:4-5": { kind: "fractionlab", opts: { mode: "add" } },
    "fom:4-6": { kind: "fractionlab", opts: { mode: "muldiv" } },
    "fom:4-7": { kind: "fractionlab", opts: { mode: "signs" } },
    "fom:4-8": { kind: "fractionlab", opts: { mode: "recip" } },
    "fom:5-1": { kind: "mixedlab", opts: { mode: "convert" } },
    "fom:5-2": { kind: "mixedlab", opts: { mode: "add" } },
    "fom:5-3": { kind: "mixedlab", opts: { mode: "muldiv" } },
    "fom:5-4": { kind: "fractionlab", opts: { mode: "compare", title: "Comparing across forms" } },
    "fom:5-5": { kind: "measurelab", opts: { mode: "ruler" } },
    "fom:6-1": { kind: "decimallab", opts: { mode: "place" } },
    "fom:6-2": { kind: "decimallab", opts: { mode: "grid" } },
    "fom:6-3": { kind: "decimallab", opts: { mode: "repeat" } },
    "fom:6-4": { kind: "numberline", opts: { mode: "round", base: 10, points: [47], min: 30, max: 60, title: "Rounding on a zoomed line" } },
    "fom:6-5": { kind: "decimallab", opts: { mode: "convert" } },
    "fom:7-1": { kind: "ratiolab", opts: { mode: "tape" } },
    "fom:7-2": { kind: "ratiolab", opts: { mode: "prop" } },
    "fom:7-3": { kind: "ratiolab", opts: { mode: "price" } },
    "fom:7-4": { kind: "measurelab", opts: { mode: "chain" } },
    "fom:8-1": { kind: "expolab", opts: { mode: "evaluate" } },
    "fom:8-2": { kind: "expolab", opts: { mode: "rules" } },
    "fom:8-3": { kind: "expolab", opts: { mode: "power" } },
    "fom:8-4": { kind: "expolab", opts: { mode: "quotient" } },
    "fom:8-5": { kind: "expolab", opts: { mode: "mixed" } },
    "fom:9-1": { kind: "radicallab", opts: { mode: "square", n: 50 } },
    "fom:9-2": { kind: "radicallab", opts: { mode: "likes" } },
    "fom:9-3": { kind: "radicallab", opts: { mode: "multiply" } },
    "fom:9-4": { kind: "radicallab", opts: { mode: "rationalise" } },
    "fom:9-5": { kind: "radicallab", opts: { mode: "simplify", n: 72 } },
    "fom:10-1": { kind: "scilab", opts: { mode: "powers" } },
    "fom:10-2": { kind: "scilab", opts: { mode: "scale" } },
    "fom:10-3": { kind: "scilab", opts: { mode: "multiply" } },
    "fom:10-4": { kind: "scilab", opts: { mode: "divide" } },
    "fom:10-5": { kind: "scilab", opts: { mode: "mixed" } },
    "fom:10-6": { kind: "scilab", opts: { mode: "estimate" } },
    "fom:11-1": { kind: "examplanner", opts: { minutes: 60, count: 12 } },
    "fom:11-2": { kind: "mapboard", opts: {} },
    "p11:1-1": { kind: "numberline", opts: { mode: "abs", points: [-5], title: "Absolute value as distance" } },
    "p11:1-8": { kind: "numberline", opts: { mode: "ineq", points: [2], min: -6, max: 8, title: "Shading an inequality" } },
    "p11:1-3": { kind: "expolab", opts: { mode: "rules", title: "Simplifying expressions" } },
    "p11:1-4": { kind: "fractionlab", opts: { mode: "reduce", title: "Cancel factors, not terms" } },
    "p11:1-9": { kind: "coordlab", opts: {} },
    "p11:2-1": { kind: "machine", opts: { key: "lin", title: "What a function does to a number" } },
    "p11:2-2": { kind: "graphreadlab", opts: { key: "step", title: "Graphs of functions" } },
    "p11:2-3": { kind: "graphreadlab", opts: { key: "cubic", title: "Getting information from the graph" } },
    "p11:2-6": { kind: "transformlab", opts: { key: "square" } },
    "c12:p1": { kind: "graphreadlab", opts: { key: "quad", title: "Intercepts, symmetry, models" } },
    "c12:p3": { kind: "machine", opts: { key: "quad", title: "Function notation" } },
    "c12:1-2": { kind: "limitlab", opts: { key: "hole" } },
    "c12:1-3": { kind: "limitlab", opts: { key: "quad" } },
    "c12:1-4": { kind: "piecelab", opts: { variant: "jump" } },
    "c12:1-5": { kind: "limitlab", opts: { key: "inf" } },
    "c12:chapter-1-review": { kind: "limitlab", opts: { key: "sinc" } },
    "c12:2-1": { kind: "slopelab", opts: { key: "square" } },
    "c12:2-2-2-3": { kind: "slopelab", opts: { key: "cube" } },
    "c12:piecewise-differentiability": { kind: "piecelab", opts: { variant: "corner" } },
    "c12:2-4": { kind: "slopelab", opts: { key: "sin" } },
    "c12:2-5": { kind: "slopelab", opts: { key: "cube" } },
    "c12:2-6": { kind: "ratelab", opts: {} },
    "c12:chapter-2-review": { kind: "limitlab", opts: { key: "hole" } },
  };

  /* one interactive per chapter, for the books that carry questions and no lessons */
  const CH_LIKE_TERMS = { title: "Like terms, bundled", hint: "Click a term, then the pile it belongs to. Only identical letters and powers may be combined.",
    buckets: [{ id: "x", label: "x terms" }, { id: "y", label: "y terms" }, { id: "x2", label: "x² terms" }, { id: "c", label: "plain numbers" }],
    items: [
      { t: "3x", b: "x", why: "3 x's, so it joins the x pile." },
      { t: "−5y", b: "y", why: "y¹, not y²." },
      { t: "2x²", b: "x2", why: "x² only combines with other x² terms." },
      { t: "7", b: "c", why: "no letter, so it is a constant." },
      { t: "4x", b: "x", why: "same letter, same power — combine the coefficients." },
      { t: "−y", b: "y", why: "the − is the coefficient; the letter decides the pile." },
      { t: "9", b: "c", why: "constants add to constants." },
    ], done: "x-pile 7x, y-pile −6y, x² stays 2x², numbers 16." };
  const CH_PROPERTIES = { title: "Name the property", hint: "Every line is legal because of one rule. Sort them.",
    buckets: [{ id: "comm", label: "commutative" }, { id: "assoc", label: "associative" }, { id: "dist", label: "distributive" }, { id: "id", label: "identity" }],
    items: [
      { t: "3 + 4 = 4 + 3", b: "comm", why: "order changed, values did not." },
      { t: "(2 · 3) · 4 = 2 · (3 · 4)", b: "assoc", why: "grouping changed, order did not." },
      { t: "5(x + 2) = 5x + 10", b: "dist", why: "the outside factor is handed to each term." },
      { t: "7 + 0 = 7", b: "id", why: "adding zero changes nothing — the identity element." },
      { t: "9 · 1 = 9", b: "id", why: "one is the multiplicative identity." },
      { t: "ab + ac = a(b + c)", b: "dist", why: "factoring is the distributive rule backwards." },
    ], done: "each rule has its recognisable move." };
  const CH_STRANDS = { title: "Which strand?", hint: "Every exam question belongs to one strand. Sort the skills.",
    buckets: [{ id: "num", label: "number & quantity" }, { id: "alg", label: "algebra & functions" }, { id: "geo", label: "geometry" }, { id: "dat", label: "data & probability" }],
    items: [
      { t: "fractions and decimals", b: "num", why: "number sense first." },
      { t: "solve a linear equation", b: "alg", why: "unknowns and rules." },
      { t: "area of a triangle", b: "geo", why: "shape and space." },
      { t: "mean of a data set", b: "dat", why: "summary statistics." },
      { t: "simplify a radical", b: "num", why: "a root is a number." },
      { t: "factor a trinomial", b: "alg", why: "a polynomial identity." },
      { t: "probability of two events", b: "dat", why: "chance is data's sibling." },
      { t: "similar triangles", b: "geo", why: "proportional shape." },
    ], done: "the four strands cover the whole paper." };

  const CHAPTERS = {
    "holt-a1:A1_01": { kind: "classifylab", opts: CH_LIKE_TERMS },
    "holt-a1:A1_02": { kind: "steplab", opts: { a: 3, b: 5, c: 20, title: "Solve 3x + 5 = 20", hint: "Undo the constant, then undo the coefficient. Two operations, in that order." } },
    "holt-a1:A1_03": { kind: "steplab", opts: { a: -2, b: 4, c: 10, ineq: true, sym: "<", title: "Solve −2x + 4 < 10", hint: "Watch what happens to the symbol when you divide by a negative." } },
    "holt-a1:A1_04": { kind: "funclab", opts: { outs: [1, 3, 5, 4] } },
    "holt-a1:A1_05": { kind: "lineslab", opts: { m: 2, b: -1, title: "Slope and intercept" } },
    "holt-a1:A1_06": { kind: "syslab", opts: { m1: 2, b1: -1, m2: -1, b2: 4 } },
    "holt-a1:A1_07": { kind: "explab", opts: { a: 2, mode: "mul", title: "Exponent rules as tiles" } },
    "holt-a1:A1_08": { kind: "arealab", opts: { dir: "factor", a: 2, b: 3, title: "Factor with the area model" } },
    "holt-a1:A1_09": { kind: "quadlab", opts: { a: 1, b: -2, c: -3 } },
    "holt-a1:A1_10": { kind: "ratfnlab", opts: { v: 2, k: 1, h: 0 } },
    "holt-a1:A1_11": { kind: "rootlab", opts: { n: 72 } },

    "holt-c1:C1_01": { kind: "sequlab", opts: { a: 3, d: 4 } },
    "holt-c1:C1_02": { kind: "cntrlab", opts: { pos: 5, neg: 3 } },
    "holt-c1:C1_03": { kind: "sievlab", opts: { n: 60 } },
    "holt-c1:C1_04": { kind: "baropslab", opts: { n1: 1, d1: 2, n2: 1, d2: 3 } },
    "holt-c1:C1_05": { kind: "scalelab", opts: { k: 2, title: "Proportions, scaled" } },
    "holt-c1:C1_06": { kind: "gridlab", opts: { p: 35, of: 80 } },
    "holt-c1:C1_07": { kind: "plotdotlab", opts: { data: [3, 5, 5, 6, 8] } },
    "holt-c1:C1_08": { kind: "spinlab", opts: { sectors: 6 } },
    "holt-c1:C1_11": { kind: "steplab", opts: { a: 4, b: 7, c: 31, title: "Solve 4x + 7 = 31" } },

    "holt-c2:C2_01": { kind: "classifylab", opts: CH_PROPERTIES },
    "holt-c2:C2_02": { kind: "ratnumlab", opts: { n: 3, d: 8 } },
    "holt-c2:C2_03": { kind: "steplab", opts: { a: 5, b: 3, c: 22, title: "Solve 5x + 3 = 22" } },
    "holt-c2:C2_04": { kind: "explab", opts: { a: 3, mode: "pow", title: "Powers of powers" } },
    "holt-c2:C2_05": { kind: "scalelab", opts: { k: 1.5, title: "Similar figures" } },
    "holt-c2:C2_06": { kind: "gridlab", opts: { mode: "change", p: 15, of: 240, title: "Percent increase" } },
    "holt-c2:C2_07": { kind: "lineslab", opts: { m: 1.5, b: 2, title: "Graphs and functions" } },
    "holt-c2:C2_09": { kind: "shapelab", opts: { mode: "area", title: "Area of a composite figure" } },
    "holt-c2:C2_10": { kind: "shapelab", opts: { mode: "volume", title: "Volume of a cylinder" } },
    "holt-c2:C2_11": { kind: "boxlab", opts: { nums: [4, 7, 9, 12, 15] } },
    "holt-c2:C2_12": { kind: "arealab", opts: { dir: "expand", a: 2, b: 3, title: "Multiply polynomials" } },

    "examprep:Remedial": { kind: "classifylab", opts: CH_STRANDS },
    "examprep:NASMO": { kind: "pacelab", opts: { q: 40, min: 60, title: "NASMO: pace the paper" } },
    "examprep:NAFS": { kind: "scoremodel", opts: { raw: 60 } },
    "examprep:SAT": { kind: "pacelab", opts: { q: 98, min: 134, title: "SAT: pace the paper" } },
    "examprep:SAAT": { kind: "guesslab", opts: {} },
    "examprep:GAT": { kind: "sequlab", opts: { a: 2, d: 5, title: "GAT: continue the pattern" } },
  };

  /* every lab writes \\( … \\) into its readout; typeset it once, centrally */
  function texify(root) {
    if (!window.katex || !window.katex.renderToString) return;
    root.querySelectorAll(".mnp-out").forEach((o) => {
      const html = o.innerHTML;
      if (html.indexOf("\\(") < 0 && html.indexOf("\\[") < 0) return;
      o.innerHTML = html
        .replace(/\\\[([\s\S]*?)\\\]/g, (m, t) => window.katex.renderToString(t, { throwOnError: false, displayMode: true }))
        .replace(/\\\(([\s\S]*?)\\\)/g, (m, t) => window.katex.renderToString(t, { throwOnError: false }));
    });
  }

  function mount(host, kind, opts) {
    const fn = LABS[kind];
    if (!fn || !host) return null;
    let node = null;
    node = guard(() => fn(opts || {}));
    if (!node) {
      node = el("div", { class: "mnp mnp-fail" }, [el("b", { text: "This one could not be drawn." })]);
    }
    host.append(node);
    texify(node);
    let queued = false;
    const obs = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; texify(node); });
    });
    obs.observe(node, { childList: true, subtree: true, characterData: true });
    return node;
  }

  const LABEL = {
    orderlab: "order of operations", numberline: "number line", setnest: "nested sets", balance: "balance",
    signtoggle: "sign toggles", factorarray: "dot array", factorlab: "factor lab", fractionlab: "fraction bars",
    mixedlab: "mixed numbers", zerodivide: "divide by zero", measurelab: "ruler & multipliers",
    decimallab: "decimal lab", ratiolab: "tape & unit price", expolab: "exponent copies",
    radicallab: "radical area", scilab: "powers of ten", mapboard: "chapter map",
    examplanner: "exam planner", limitlab: "limit walker", slopelab: "secant → tangent",
    coordlab: "coordinate plane", machine: "function machine", transformlab: "transformations",
    piecelab: "continuity", ratelab: "related rates", graphreadlab: "graph reader",
    classifylab: "sort it", steplab: "solve it", funclab: "function test", lineslab: "the line itself",
    syslab: "two lines", explab: "exponent tiles", arealab: "area model", quadlab: "the parabola",
    ratfnlab: "rational graph", rootlab: "simplify roots", sequlab: "find the rule", cntrlab: "counters",
    sievlab: "the sieve", baropslab: "common denominators", gridlab: "hundred grid", plotdotlab: "dot plot",
    spinlab: "spinner", scalelab: "similar figures", ratnumlab: "three ways", shapelab: "area & volume",
    boxlab: "box and whisker", pacelab: "pace the paper", scoremodel: "score curve", guesslab: "guess well",
  };

  window.MLMANIP = {
    mount, MAP, LABS,
    label: (kind) => LABEL[kind] || kind,
    kinds: Object.keys(LABS),
    forLesson: (id) => MAP[id] || null,
    CHAPTERS,
    forChapter: (courseId, chId) => CHAPTERS[courseId + ":" + chId] || null,
    chaptersWith: () => Object.keys(CHAPTERS).length,
    lessonsWith: () => Object.keys(MAP).length,
    alive: (node) => {
      /* a cheap self-check used by the test harness */
      const n = node || document.querySelector(".mnp");
      if (!n) return false;
      return n.querySelectorAll("svg, input, button, .mnp-chip, .mnp-tile").length > 0;
    },
  };
})();

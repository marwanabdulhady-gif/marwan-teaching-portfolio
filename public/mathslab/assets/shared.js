/* ===========================================================
   MathsLab — shared runtime: registry, router, utils
   =========================================================== */
(function () {
  "use strict";

  const ML = (window.ML = window.ML || {});
  ML.apps = {};
  ML.order = [];

  /** Register an app. def = { id, title, short, blurb, icon, color, tag, tags[], mount(el, ctx) } */
  ML.register = function (def) {
    ML.apps[def.id] = def;
    ML.order.push(def.id);
  };

  /* ---------------- utils ---------------- */
  const U = (ML.u = {});
  U.$ = (sel, root) => (root || document).querySelector(sel);
  U.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  U.el = function (tag, attrs, html) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") n.className = attrs[k];
      else if (k === "style" && typeof attrs[k] === "object") Object.assign(n.style, attrs[k]);
      else if (k.startsWith("on") && typeof attrs[k] === "function") n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== undefined && attrs[k] !== null && attrs[k] !== false) n.setAttribute(k, attrs[k]);
    }
    if (html !== undefined) n.innerHTML = html;
    return n;
  };
  U.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  U.rand = (a, b) => a + Math.random() * (b - a);
  U.randInt = (a, b) => Math.floor(U.rand(a, b + 1));
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  U.range = (a, b, step = 1) => { const r = []; for (let v = a; v <= b + 1e-9; v += step) r.push(+v.toFixed(10)); return r; };
  /** deterministic pseudo-random generator (for repeatable worksheets) */
  U.rng = function (seed) {
    let s = seed >>> 0 || 1;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  };
  U.ri = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
  U.fmt = (n, d = 2) => {
    if (!isFinite(n)) return "—";
    const s = (+n).toFixed(d);
    return d > 0 ? s.replace(/\.?0+$/, "") || "0" : s;
  };
  U.fmtPi = (n, d = 4) => (n / Math.PI).toFixed(d).replace(/\.?0+$/, "") || "0";
  U.gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; };
  U.frac = (n, d) => { const g = U.gcd(n, d) || 1; return [n / g, d / g]; };
  U.debounce = (fn, ms = 120) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  U.copy = async (text) => {
    try { await navigator.clipboard.writeText(text); ML.toast("Copied to clipboard", "ok"); return true; }
    catch (e) { ML.toast("Copy failed", "no"); return false; }
  };
  U.download = (filename, content, type = "text/plain") => {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  U.svg = (w, h, inner, cls) =>
    `<svg viewBox="0 0 ${w} ${h}" ${cls ? `class="${cls}"` : ""} xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto">${inner}</svg>`;

  /* ---------------- icons (inline SVG — no emoji font needed) ---------------- */
  ML.icon = function (name) {
    const B = {
      plot:'<path d="M4 20V4M4 20h16" stroke="#4b3ee0" stroke-width="2" stroke-linecap="round"/><path d="M4 16c4 0 4-9 8-9s5 6 8 4" fill="none" stroke="#6d5efc" stroke-width="2.4" stroke-linecap="round"/>',
      polar:'<circle cx="12" cy="12" r="9" fill="none" stroke="#0b7a73" stroke-width="2"/><path d="M12 12c3-5 7-3 6 1s-6 5-8 1 1-6 4-5" fill="none" stroke="#0f9d94" stroke-width="2.2" stroke-linecap="round"/>',
      bolt:'<path d="M13 2 5 14h6l-1 8 8-12h-6l1-8z" fill="#b07a06"/>',
      cross:'<path d="M7 7l10 10M17 7L7 17" stroke="#a81a6b" stroke-width="2.8" stroke-linecap="round"/>',
      grid:'<rect x="4" y="4" width="16" height="16" rx="2.5" fill="none" stroke="#1a58b8" stroke-width="2"/><path d="M4 10h16M4 15h16M10 4v16M15 4v16" stroke="#1a58b8" stroke-width="1.3" opacity=".65"/>',
      coin:'<circle cx="12" cy="12" r="8.5" fill="none" stroke="#93630a" stroke-width="2"/><path d="M12 7.5v9M9.6 9.6c0-1.2 1.1-2 2.4-2s2.4.8 2.4 2-1.1 1.9-2.4 1.9-2.4.8-2.4 1.9 1.1 2 2.4 2 2.4-.8 2.4-2" fill="none" stroke="#b07a06" stroke-width="1.7" stroke-linecap="round"/>',
      wallet:'<rect x="3.5" y="6.5" width="17" height="12.5" rx="3" fill="none" stroke="#157a43" stroke-width="2"/><path d="M3.5 10.5h17" stroke="#157a43" stroke-width="1.6"/><circle cx="16.5" cy="15" r="1.4" fill="#157a43"/>',
      shapes:'<rect x="3.5" y="12.5" width="8" height="8" rx="1.6" fill="none" stroke="#4b3ee0" stroke-width="2"/><circle cx="16.5" cy="16.5" r="4.2" fill="none" stroke="#6d5efc" stroke-width="2"/><path d="M8 3.5 12 10H4l4-6.5z" fill="none" stroke="#a99dff" stroke-width="2" stroke-linejoin="round"/>',
      list:'<path d="M5 7h14M5 12h9M5 17h11" stroke="#1a58b8" stroke-width="2.4" stroke-linecap="round"/><circle cx="19" cy="12" r="1.4" fill="#1a58b8"/><circle cx="19" cy="17" r="1.4" fill="#1a58b8"/>',
      angle:'<path d="M4 19h16M4 19 16 5" stroke="#a81a6b" stroke-width="2" stroke-linecap="round"/><path d="M11 19a7 7 0 0 0-2-4.9" fill="none" stroke="#e6459c" stroke-width="2"/>',
      dice:'<rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="#0b7a73" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="#0f9d94"/><circle cx="15.5" cy="8.5" r="1.5" fill="#0f9d94"/><circle cx="12" cy="12" r="1.5" fill="#0f9d94"/><circle cx="8.5" cy="15.5" r="1.5" fill="#0f9d94"/><circle cx="15.5" cy="15.5" r="1.5" fill="#0f9d94"/>',
      pi:'<path d="M5 8h14M9 8v9.5c0 1 .6 1.5 1.5 1.5M15 8v8c0 1.6 1 2.4 2.4 2.4" fill="none" stroke="#4b3ee0" stroke-width="2.2" stroke-linecap="round"/>',
      target:'<circle cx="12" cy="12" r="8.6" fill="none" stroke="#b0262a" stroke-width="2"/><circle cx="12" cy="12" r="5" fill="none" stroke="#e5484d" stroke-width="1.7"/><circle cx="12" cy="12" r="1.8" fill="#e5484d"/>',
      receipt:'<path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2v-17z" fill="none" stroke="#0b7a73" stroke-width="2" stroke-linejoin="round"/><path d="M9 8h6M9 12h6" stroke="#0f9d94" stroke-width="1.7" stroke-linecap="round"/>',
      alien:'<path d="M12 3c4.4 0 7.5 3.2 7.5 7.4 0 5.3-4 10.6-7.5 10.6S4.5 15.7 4.5 10.4C4.5 6.2 7.6 3 12 3z" fill="none" stroke="#157a43" stroke-width="2"/><ellipse cx="9.4" cy="10.2" rx="1.7" ry="2.5" fill="#157a43"/><ellipse cx="14.6" cy="10.2" rx="1.7" ry="2.5" fill="#157a43"/>',
      rocket:'<path d="M12 3c3 2.4 4.5 5.8 4.5 9.2L19 16l-3.5-.6c-1 1.6-2.3 2.9-3.5 3.6-1.2-.7-2.5-2-3.5-3.6L5 16l2.5-3.8C7.5 8.8 9 5.4 12 3z" fill="none" stroke="#1a58b8" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="9.6" r="1.9" fill="#2f7cf6"/>',
      flip:'<path d="M12 3v18" stroke="#a81a6b" stroke-width="1.8" stroke-dasharray="3 3"/><path d="M9.5 7 4 12l5.5 5V7z" fill="none" stroke="#a81a6b" stroke-width="2" stroke-linejoin="round"/><path d="M14.5 7 20 12l-5.5 5V7z" fill="#e6459c" stroke="#a81a6b" stroke-width="2" stroke-linejoin="round"/>',
      speakerOn:'<path d="M4 9.5h3.5L12 6v12L7.5 14.5H4z" fill="currentColor"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      speakerOff:'<path d="M4 9.5h3.5L12 6v12L7.5 14.5H4z" fill="currentColor"/><path d="M15.5 9.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      print:'<path d="M7 8V3.5h10V8M7 17H4.5V8.5h15V17H17" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><rect x="7" y="13.5" width="10" height="7" rx="1.4" fill="none" stroke="currentColor" stroke-width="2"/>',
      back:'<path d="M11 5 4 12l7 7M4 12h16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
      play:'<path d="M7 4.5 19 12 7 19.5z" fill="currentColor"/>',
      shuffle:'<path d="M4 7h3.2c1.6 0 2.6.8 3.6 2.1M4 17h3.2c1.6 0 2.6-.8 3.6-2.1M13.6 9.1C14.6 7.8 15.6 7 17.2 7H20m0 0-2.4-2.4M20 7l-2.4 2.4M13.6 14.9c1 1.3 2 2.1 3.6 2.1H20m0 0-2.4-2.4M20 17l-2.4 2.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      bulb:'<path d="M9 17.5h6M10 20.5h4M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .9 1.6h5.2c.1-.6.4-1.2.9-1.6A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
      check:'<path d="M4.5 12.5 9.5 17.5 19.5 6.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
      crossMark:'<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
      heart:'<path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7 3.7C19 15.6 12 20 12 20z" fill="currentColor"/>',
      trophy:'<path d="M8 4h8v4.5a4 4 0 0 1-8 0V4z" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M8 5.5H5.5V8a3 3 0 0 0 3 3M16 5.5h2.5V8a3 3 0 0 1-3 3M12 12.5V16M9 19.5h6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
      flame:'<path d="M12 21c3.6 0 6-2.3 6-5.4 0-4-4-5.6-4-8.6 0-.9.2-1.7.6-2.5-3.4.6-6.6 3.8-6.6 8 0 .9.2 1.6.5 2.3-1.3 0-2-1-2-2.3C5.6 15.2 8 21 12 21z" fill="currentColor"/>',
      arrow:'<path d="M5 12h13M13 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
      undo:'<path d="M8.5 8.5 4.5 12.5l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 12.5H14a5.5 5.5 0 0 1 0 11h-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      plus:'<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
      minus:'<path d="M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
      chev:'<path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
      warn:'<path d="M12 4 21 19H3L12 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1.1" fill="currentColor"/>',
    };
    const body = B[name] || B.grid;
    return '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden="true" style="display:inline-block;vertical-align:-.14em">' + body + '</svg>';
  };

  /* ---------------- persistence ---------------- */
  U.store = {
    get(k, d) { try { const v = localStorage.getItem("mathslab:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("mathslab:" + k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem("mathslab:" + k); } catch (e) {} },
  };

  /* ---------------- sound ---------------- */
  let soundOn = U.store.get("sound", true);
  let actx = null;
  U.sound = {
    get on() { return soundOn; },
    toggle() { soundOn = !soundOn; U.store.set("sound", soundOn); ML.syncSound(); return soundOn; },
    tone(freq = 660, dur = 0.09, type = "sine", gain = 0.06) {
      if (!soundOn) return;
      try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type; o.frequency.value = freq;
        g.gain.setValueAtTime(gain, actx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
        o.connect(g).connect(actx.destination);
        o.start(); o.stop(actx.currentTime + dur);
      } catch (e) {}
    },
    click() { U.sound.tone(520, 0.05, "triangle", 0.035); },
    ok() { U.sound.tone(700, 0.07, "sine", 0.05); setTimeout(() => U.sound.tone(980, 0.1, "sine", 0.05), 70); },
    no() { U.sound.tone(220, 0.16, "sawtooth", 0.04); },
    coin() { U.sound.tone(880, 0.06, "square", 0.035); setTimeout(() => U.sound.tone(1320, 0.09, "square", 0.035), 60); },
    win() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => U.sound.tone(f, 0.13, "triangle", 0.05), i * 90)); },
    thud() { U.sound.tone(140, 0.12, "sine", 0.07); },
  };
  ML.syncSound = function () {
    const b = document.getElementById("soundBtn");
    if (b) { b.innerHTML = ML.icon(soundOn ? "speakerOn" : "speakerOff"); b.setAttribute("aria-label", soundOn ? "Sound on" : "Sound off"); }
  };

  /* ---------------- toasts ---------------- */
  ML.toast = function (msg, kind = "", ms = 2400) {
    const host = document.getElementById("toasts");
    if (!host) return;
    const t = U.el("div", { class: "toast " + kind, role: "status" }, msg);
    host.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateY(6px)"; t.style.transition = "all .25s"; setTimeout(() => t.remove(), 260); }, ms);
  };

  /* ---------------- router ---------------- */
  function route() {
    const hash = location.hash.replace(/^#\/?/, "");
    const parts = hash.split("/");
    const id = parts[0];
    const sub = parts.slice(1).join("/");
    const view = document.getElementById("view");
    if (!view) return;
    const nav = document.getElementById("topnav");
    if (nav) {
      const groups = [
        { label: "Questions", ids: ["courses", "questions", "generator", "bankqs"] },
        { label: "Graphing", ids: ["graphcalc", "hu9graph", "polar"] },
        { label: "Practice", ids: ["speedpractice", "timestables", "tablesheets"] },
        { label: "Money", ids: ["coins", "change"] },
        { label: "Number", ids: ["algebra", "sequences", "angles", "unitcircle", "protractor", "prob", "pi"] },
        { label: "Games", ids: ["kgmath", "lessons", "arcade", "quizshow", "darts501", "checkout", "aliens", "asteroids", "transform"] },
      ];
      const current = ML.apps[id];
      nav.innerHTML =
        `<a href="#/" class="${!id ? "on" : ""}">Home</a>` +
        `<a href="#/courses" class="${id === "courses" ? "on" : ""}">Courses</a>` +
        groups.map((g) => {
          const active = current && g.ids.includes(current.id);
          const items = g.ids.map((k) => {
            const a = ML.apps[k]; if (!a) return "";
            return `<a href="#/${a.id}" class="${current && current.id === a.id ? "on" : ""}">${a.short || a.title}</a>`;
          }).join("");
          return `<div class="menu">
            <button class="menu-btn ${active ? "on" : ""}" aria-haspopup="true" aria-expanded="false">${g.label}<span class="chev" aria-hidden="true">${ML.icon("chev")}</span></button>
            <div class="menu-pop" role="menu">${items}</div>
          </div>`;
        }).join("");
      /* hover + click + keyboard behaviour */
      U.$$(".menu", nav).forEach((m) => {
        const btn = m.querySelector(".menu-btn");
        const pop = m.querySelector(".menu-pop");
        const open = (v) => { m.classList.toggle("open", v); btn.setAttribute("aria-expanded", v ? "true" : "false"); };
        btn.addEventListener("click", (e) => { e.stopPropagation(); const was = m.classList.contains("open"); U.$$(".menu", nav).forEach((x) => x.classList.remove("open")); open(!was); });
        m.addEventListener("mouseenter", () => open(true));
        m.addEventListener("mouseleave", () => open(false));
        m.addEventListener("keydown", (e) => { if (e.key === "Escape") { open(false); btn.focus(); } });
        pop.addEventListener("click", () => { open(false); });
      });
      document.addEventListener("click", () => U.$$(".menu", nav).forEach((x) => x.classList.remove("open")));
    }

    view.innerHTML = "";
    view.scrollTop = 0;
    if (!id) { ML.renderHub(view); return; }
    const app = ML.apps[id];
    if (!app) { ML.renderHub(view); return; }
    const head = U.el("div", { class: "app-head" });
    head.innerHTML = `
      <div class="app-ico" style="background:${app.color[0]};color:${app.color[1]}">${app.icon}</div>
      <div class="titles">
        <div class="eyebrow">${app.tag || "App"}</div>
        <h1>${app.title}</h1>
        <p>${app.blurb}</p>
      </div>
      <div class="btn-row no-print">
        <a class="btn ghost sm" href="#/">All apps</a>
        <button class="btn ghost sm" onclick="window.print()">${ML.icon("print")} Print</button>
      </div>`;
    view.appendChild(head);
    const mount = U.el("div");
    view.appendChild(mount);
    try { app.mount(mount, { sub: sub || "" }); }
    catch (e) { console.error(e); mount.innerHTML = `<div class="card pad"><h2>This app hit a snag</h2><p class="muted">${e.message}</p></div>`; }
    window.scrollTo({ top: 0, behavior: "instant" });
    ML.syncSound();
  }
  ML.route = route;

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", () => {
    ML.syncSound();
    const sb = document.getElementById("soundBtn");
    if (sb) sb.addEventListener("click", () => U.sound.toggle());
    document.addEventListener("click", (e) => {
      if (e.target.closest(".btn, .seg button, .icon-btn")) U.sound.click();
    }, true);
    route();
  });
})();

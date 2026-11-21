/* ===========================================================
   Lesson Games — 15 Fikr lesson games, K to Grade 12.
   Each game is one self-contained offline HTML file under
   games/play/. This app is the in-site launcher: it reads the
   catalog, embeds a game in a frame and listens for the Fikr
   message contract (lesson:ready / progress / level /
   mistakes / done) so progress and common mistakes are
   visible outside the game.
   =========================================================== */
(function () {
  "use strict";
  const ML = window.ML, U = ML.u;
  const KEY = "fikr:stars:v1";

  const CSS = `
  .lg-hero{display:flex;flex-wrap:wrap;gap:18px;align-items:center;justify-content:space-between;background:#fff;border-radius:20px;padding:20px 22px;box-shadow:0 12px 30px -24px #10172a80;margin-bottom:16px}
  .lg-hero h2{margin:0 0 4px;font:800 clamp(20px,2.4vw,26px)/1.15 var(--font,system-ui);letter-spacing:-.01em}
  .lg-hero p{margin:0;color:#475467;max-width:62ch;font-size:14.5px}
  .lg-filters{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px}
  .lg-filters button{appearance:none;cursor:pointer;font:700 13px/1 var(--font,system-ui);color:#475467;background:#fff;border:1.5px solid #e4e8f0;border-radius:99px;padding:9px 14px}
  .lg-filters button.on{background:#6f5bf0;border-color:#6f5bf0;color:#fff}
  .lg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(248px,1fr));gap:14px}
  .lg-card{background:#fff;border-radius:18px;padding:15px;border:2px solid transparent;box-shadow:0 10px 26px -22px #10172a66;display:flex;flex-direction:column;gap:7px;cursor:pointer;transition:transform .12s,border-color .12s}
  .lg-card:hover{transform:translateY(-2px);border-color:#c9bffb}
  .lg-card:focus-visible{outline:3px solid #6f5bf0;outline-offset:2px}
  .lg-card .lg-row{display:flex;align-items:center;gap:8px}
  .lg-badge{font:800 11px/1 var(--font,system-ui);letter-spacing:.06em;text-transform:uppercase;color:#fff;background:#6f5bf0;border-radius:7px;padding:6px 8px}
  .lg-emoji{font-size:23px;line-height:1}
  .lg-card h3{margin:2px 0 0;font:800 17.5px/1.2 var(--font,system-ui)}
  .lg-card .lg-topic{margin:0;color:#4a35c9;font-size:12.5px;font-weight:700}
  .lg-card .lg-blurb{margin:0;color:#475467;font-size:13px;flex:1}
  .lg-card .lg-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:3px}
  .lg-stars{color:#ffb020;letter-spacing:2px;font-size:14px}
  .lg-stars i{font-style:normal;color:#e2e6ef}
  .lg-play{font:800 13px/1 var(--font,system-ui);color:#fff;background:#6f5bf0;border:0;border-radius:10px;padding:9px 13px;cursor:pointer}
  .lg-sheet{position:fixed;inset:0;background:#0b1020cc;z-index:80;padding:12px;display:grid;grid-template-rows:auto 1fr;gap:10px}
  .lg-bar{display:flex;align-items:center;gap:10px;background:#fff;border-radius:14px;padding:10px 14px;flex-wrap:wrap}
  .lg-bar b{font-size:14.5px}
  .lg-bar .lg-live{font-size:12.5px;color:#475467}
  .lg-bar .lg-live b{color:#10172a}
  .lg-bar .lg-mk{display:flex;gap:6px;flex-wrap:wrap}
  .lg-bar .lg-mk i{font-style:normal;font-size:11px;background:#fdeee8;color:#a02118;border-radius:99px;padding:4px 8px}
  .lg-bar .grow{flex:1}
  .lg-bar button{appearance:none;cursor:pointer;font:700 12.5px/1 var(--font,system-ui);border:1.5px solid #e4e8f0;background:#fff;color:#475467;border-radius:10px;padding:9px 12px}
  .lg-sheet iframe{width:100%;height:100%;border:0;border-radius:14px;background:#fff}
  .lg-note{margin:18px 0 0;color:#8a94a6;font-size:12.5px;max-width:80ch}
  @media (max-width:560px){.lg-grid{grid-template-columns:1fr}.lg-hero{padding:16px}}
  `;

  function injectCSS() {
    if (document.getElementById("lg-css")) return;
    const st = document.createElement("style");
    st.id = "lg-css";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  const bestOf = (id) => {
    try {
      const t = JSON.parse(localStorage.getItem(KEY) || "{}");
      const o = t[id] || {};
      return [0, 1, 2].map((i) => o[i] || 0);
    } catch (e) { return [0, 0, 0]; }
  };
  const starStr = (arr) => arr.map((n) => "★".repeat(n) + "<i>" + "★".repeat(3 - n) + "</i>").join(" ");
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  ML.register({
    id: "lessons",
    group: "games",
    title: "Lesson Games",
    short: "Lesson Games",
    blurb: "15 lesson games from Kindergarten to Grade 12, including three Grade 1 adventures — each covering one skill with a coach, guided Learn slides and three levels.",
    icon: "🎮",
    color: ["#ece8ff", "#4a35c9"],
    tag: "Games · K–12",
    tags: ["games", "lessons", "k-12", "fikr", "interactive", "lesson games", "grade", "kindergarten"],
    mount(el) {
      injectCSS();
      const CAT = window.FIKR_CATALOG || [];
      if (!CAT.length) {
        el.innerHTML = `<div class="card pad"><h2>Catalog not loaded</h2><p class="muted">games/catalog.js is missing from this page.</p></div>`;
        return;
      }
      let band = "all";
      const bands = [["all", `All ${CAT.length}`], ["k2", "K–2"], ["g35", "3–5"], ["g68", "6–8"], ["g912", "9–12"]];

      const hero = U.el("section", { class: "lg-hero" });
      hero.innerHTML = `
        <div>
          <h2>15 adventures — Kindergarten to Grade 12</h2>
          <p>Every game follows the same recipe: a coach who never gives the answer away, a four-slide <b>Learn</b>
          walk-through, then three levels that move from concrete to picture to symbols. Stars come from
          <b>first-try</b> answers; hints cost nothing; two misses and the game shows you how.</p>
        </div>
        <div class="btn-row"><a class="btn ghost sm" href="games/index.html" target="_blank" rel="noopener">Open the standalone hub ↗</a></div>`;
      el.append(hero);

      const filters = U.el("div", { class: "lg-filters" });
      bands.forEach(([b, label]) => {
        const btn = U.el("button", { type: "button", class: b === "all" ? "on" : "", text: label });
        btn.addEventListener("click", () => {
          band = b;
          filters.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === btn));
          render();
        });
        filters.append(btn);
      });
      el.append(filters);
      const grid = U.el("div", { class: "lg-grid" });
      el.append(grid);
      el.append(U.el("p", { class: "lg-note", html:
        "Progress is kept on this device. Games also speak the Fikr message contract " +
        "(<code>lesson:ready</code>, <code>lesson:progress</code>, <code>lesson:level</code>, " +
        "<code>lesson:mistakes</code>, <code>lesson:done</code>) so a teacher page can follow along — " +
        "the bar above a game shows live stars, rounds and the mistakes being made." }));

      function render() {
        grid.innerHTML = "";
        CAT.filter((g) => band === "all" || g.band === band).forEach((g) => {
          const card = U.el("div", { class: "lg-card", tabindex: "0", role: "button" });
          card.setAttribute("aria-label", `${g.grade}: ${g.title}`);
          card.innerHTML = `
            <div class="lg-row"><span class="lg-badge">${esc(g.grade)}</span><span class="lg-emoji">${g.emoji}</span></div>
            <h3>${esc(g.title)}</h3>
            <p class="lg-topic">${esc(g.topic)}</p>
            <p class="lg-blurb">${esc(g.blurb)}</p>
            <div class="lg-foot"><span class="lg-stars">${starStr(bestOf(g.id))}</span><button class="lg-play" type="button">Play ▶</button></div>`;
          const go = () => openGame(g);
          card.addEventListener("click", go);
          card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
          grid.append(card);
        });
      }

      let open = null, sheet = null, live = null, mkEl = null;
      function openGame(g) {
        open = g;
        if (!sheet) {
          sheet = U.el("div", { class: "lg-sheet", role: "dialog", "aria-modal": "true" });
          sheet.innerHTML = `
            <div class="lg-bar">
              <b class="lg-title"></b>
              <span class="lg-live"></span>
              <span class="lg-mk"></span>
              <span class="grow"></span>
              <button type="button" class="lg-close">✕ Close</button>
            </div>
            <iframe title="lesson game"></iframe>`;
          document.body.append(sheet);
          live = sheet.querySelector(".lg-live");
          mkEl = sheet.querySelector(".lg-mk");
          sheet.querySelector(".lg-close").addEventListener("click", closeGame);
          document.addEventListener("keydown", (e) => { if (e.key === "Escape" && sheet) closeGame(); });
        }
        sheet.querySelector(".lg-title").textContent = `${g.emoji} ${g.title} · ${g.grade}`;
        live.textContent = "loading…";
        mkEl.innerHTML = "";
        sheet.querySelector("iframe").src = "games/play/" + g.id + ".html";
        sheet.style.display = "grid";
        sheet.querySelector("iframe").focus();
      }
      function closeGame() {
        if (!sheet) return;
        sheet.style.display = "none";
        sheet.querySelector("iframe").src = "about:blank";
        open = null;
        render();
      }

      addEventListener("message", (e) => {
        if (e.origin !== location.origin) return;
        const m = e.data || {};
        if (m.v !== 1 || !m.id || !open || m.id !== open.id) return;
        const num = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(v) || 0)));
        if (m.type === "lesson:ready") {
          live.innerHTML = `ready · <b>${num(m.total, 0, 999)}</b> rounds in total`;
        } else if (m.type === "lesson:progress") {
          live.innerHTML = `<b>${num(m.done, 0, 999)}</b>/${num(m.total, 0, 999)} rounds · <b>${num(m.stars, 0, 999)}</b>★ · streak <b>${num(m.streak, 0, 999)}</b>`;
        } else if (m.type === "lesson:level") {
          const stars = num(m.stars, 0, 3);
          try {
            const t = JSON.parse(localStorage.getItem(KEY) || "{}");
            t[open.id] = t[open.id] || {};
            const lv = num(m.level, 0, 2);
            if ((t[open.id][lv] || 0) < stars) t[open.id][lv] = stars;
            localStorage.setItem(KEY, JSON.stringify(t));
          } catch (err) { /* private mode — stars are a nicety */ }
          live.innerHTML = `level <b>${num(m.level, 0, 2) + 1}</b> done · <b>${stars}</b>★`;
        } else if (m.type === "lesson:mistakes") {
          mkEl.innerHTML = (m.list || []).slice(0, 4)
            .map((x) => `<i>${esc(String(x.detail).slice(0, 22))} ×${num(x.n, 1, 99)}</i>`).join("");
        } else if (m.type === "lesson:done") {
          const score = num(m.score, 0, 999), total = num(m.total, 0, 999);
          live.innerHTML = `finished · <b>${score}/${total}</b> (${Math.round((score / Math.max(total, 1)) * 100)}%)`;
        } else if (m.type === "lesson:close") {
          closeGame();
        }
      });

      render();
    },
  });
})();

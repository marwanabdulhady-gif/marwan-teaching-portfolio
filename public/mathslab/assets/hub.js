/* ===========================================================
   Hub — the home page.
   Courses come first (the site is organised by course), then
   the twenty rebuilt classroom programs underneath.
   =========================================================== */
(function () {
  "use strict";
  const ML = window.ML, U = ML.u;

  const GROUPS = [
    { id: "questions", label: "Questions & courses" },
    { id: "practice", label: "Practice & worksheets" },
    { id: "tools", label: "Graphing tools" },
    { id: "money", label: "Money & measures" },
    { id: "numbers", label: "Number sense" },
    { id: "games", label: "Games" },
  ];

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  ML.renderHub = function (view) {
    view.innerHTML = "";
    const qd = ML.qdata;
    const CO = window.MLCOURSES || { courses: [], lessons: {}, stats: {} };
    const total = qd.items.length;
    const s = qd.summary();

    /* ---- hero ---- */
    const hero = U.el("section", { class: "hero co-hero" });
    hero.innerHTML = `
      <div>
        <div class="eyebrow">Dr. Math Azzam · rebuilt for the web</div>
        <h1>Pick a course.<br>Work it lesson by lesson.</h1>
        <p class="lead">${CO.courses.length} courses, ${CO.stats.lessons} lesson pages and <b>${total.toLocaleString()}</b> questions.
        Every lesson keeps the worked example you can step through, the graphs and a live graph lab — and carries the
        exact questions filed under it.</p>
        <div class="hero-actions">
          <a class="btn lg" href="#/courses">Browse the courses</a>
          <a class="btn ghost lg" href="#/questions">Question Studio</a>
          <a class="btn ghost lg" href="#/questions/practice">Practice 10</a>
          <a class="btn ghost lg" href="#/kgmath">KG Math Garden</a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><b>${total.toLocaleString()}</b><span>questions indexed</span></div>
          <div class="hero-stat"><b>${CO.stats.figures}</b><span>captured figures</span></div>
          <div class="hero-stat"><b>${s.seen.toLocaleString()}</b><span>cards opened</span></div>
          <div class="hero-stat"><b>${s.starred}</b><span>saved for later</span></div>
        </div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="tile" style="width:96px;height:96px;left:8%;top:14%;background:linear-gradient(135deg,#7c6bff,#5b4be8);transform:rotate(-8deg)">∫</div>
        <div class="tile" style="width:78px;height:78px;left:52%;top:2%;background:linear-gradient(135deg,#12b5a8,#0b8c82);transform:rotate(7deg);font-size:28px">ƒ</div>
        <div class="tile" style="width:86px;height:86px;left:30%;top:48%;background:linear-gradient(135deg,#ff6bb5,#e0439a);transform:rotate(-4deg);font-size:30px">Σ</div>
        <div class="tile" style="width:66px;height:66px;left:70%;top:52%;background:linear-gradient(135deg,#ffb020,#ec8a00);transform:rotate(12deg);font-size:24px">%</div>
        <div class="tile" style="width:58px;height:58px;left:2%;top:68%;background:linear-gradient(135deg,#3b82f6,#1d5fd6);transform:rotate(5deg);font-size:22px">√</div>
      </div>`;
    view.appendChild(hero);

    /* ---- the course row — the site's actual front door ---- */
    const crs = U.el("section", { class: "hub-courses" });
    crs.innerHTML = `
      <div class="section-head">
        <div>
          <h2>Courses</h2>
          <p class="muted small" style="margin:2px 0 0">Start where you are. Each course opens into chapters, then lessons.</p>
        </div>
        <a class="btn ghost sm" href="#/courses">All ${CO.courses.length} courses →</a>
      </div>
      <div class="hub-course-grid">
        ${CO.courses.map((c) => {
          const qn = c.kind === "platform"
            ? c.chapters.reduce((a, ch) => a + ch.lessons.reduce((b, l) => b + l.qn, 0), 0)
            : c.chapters.reduce((a, ch) => a + (ch.n || 0), 0);
          return `<a class="hub-course" href="#/courses/${c.id}" style="--c:${c.color};--ci:${c.ink}">
            <span class="hub-course-ico">${c.icon}</span>
            <b>${esc(c.title)}</b>
            <span class="hub-course-meta">${esc(c.grade)} · ${c.chapters.length} chapters</span>
            <span class="hub-course-n">${qn.toLocaleString()} questions</span>
          </a>`;
        }).join("")}
      </div>`;
    view.appendChild(crs);

    /* ---- the recovered lesson pages, straight from the course pages ---- */
    const lessonsRow = Object.values(CO.lessons || {}).filter((l) => (l.figures || []).length || (l.steps || []).length).slice(0, 4);
    if (lessonsRow.length) {
      const strip = U.el("section", { class: "hub-feature" });
      strip.innerHTML = `
        <div class="hub-feature-h">
          <h2>Recovered from the course pages</h2>
          <p class="muted small">Worked examples you step through, the graphs each lesson shipped with, and a graph lab
          of your own — the material that was missing from the question-only build.</p>
        </div>
        <div class="hub-feature-grid">
          ${lessonsRow.map((l) => {
            const c = CO.courses.filter((x) => x.id === l.course)[0] || { id: l.course };
            return `<a class="hub-feature-card" href="#/courses/${l.course}/${String(l.id).split(":").pop()}">
              <span class="co-code">${esc(l.code)}</span>
              <b>${esc(l.title)}</b>
              <span class="muted small">${(l.steps || []).length ? l.steps.length + " worked steps" : ""}${(l.steps || []).length && (l.figures || []).length ? " · " : ""}${(l.figures || []).length ? l.figures.length + " figures" : ""} · ${l.qn} questions</span>
            </a>`;
          }).join("")}
        </div>`;
      view.appendChild(strip);
    }

    /* ---- the generator: the TestGen recipe idea, live ---- */
    const G = window.MLGEN;
    if (G && ML.gen) {
      const fams = ML.gen.families();
      const promo = U.el("section", { class: "gen-promo" });
      promo.innerHTML = `
        <div class="gen-promo-txt">
          <div class="eyebrow">New · question generator</div>
          <h2>${fams.length} recipes, so the practice never runs out</h2>
          <p>The course pages and the bank give you ${total.toLocaleString()} fixed questions. The generator works the way the
          TestGen and ExamView files in the Drive folder did: each recipe holds variables with ranges, constraints and a
          template, and writes a <b>new</b> question — options, key, hint and worked steps — every time you ask. Uses
          nothing but the browser.</p>
          <div class="gen-promo-stats">
            <div><b>${fams.length}</b><span>recipes</span></div>
            <div><b>${G.courses.length}</b><span>courses</span></div>
            <div><b>∞</b><span>questions</span></div>
            <div><b>1-click</b><span>worksheets</span></div>
          </div>
          <div class="btn-row">
            <a class="btn" href="#/generator">Open the generator</a>
            <a class="btn ghost" href="#/generator/c12">Try Calculus</a>
          </div>
        </div>
        <div class="gen-promo-demo" id="hubDemo"></div>`;
      view.appendChild(promo);

      const demo = promo.querySelector("#hubDemo");
      function freshDemo() {
        const pool = ML.gen.families();
        const q = ML.gen.instance(U.pick(pool), null);
        if (!q) return;
        demo.innerHTML = `
          <div class="gen-demo-h"><span>${esc(q.topic)}</span><b>${esc(q.diff)}</b></div>
          <div class="gen-stem">${qd.html(q.stem)}</div>
          <div class="gen-demo-opts">${q.options.map((o, i) =>
            `<div class="gen-demo-opt"><i>${"ABCD"[i]}</i>${qd.html(o.html)}</div>`).join("")}</div>
          <div class="gen-demo-f">
            <button class="btn ghost xs" id="demoKey">Reveal key</button>
            <button class="btn ghost xs" id="demoAgain">Another →</button>
          </div>`;
        demo.querySelector("#demoAgain").addEventListener("click", freshDemo);
        demo.querySelector("#demoKey").addEventListener("click", (e) => {
          const b = e.currentTarget;
          b.outerHTML = `<span class="gen-demo-key">Key ${"ABCD"[q.answerIndex]} · ${qd.html(q.answerText)}</span>`;
        });
      }
      freshDemo();
    }

    /* ---- all apps ---- */
    const toolbar = U.el("div", { class: "section-head" });
    toolbar.innerHTML = `
      <div>
        <h2>All apps</h2>
        <p class="muted small" style="margin:2px 0 0">The rebuilt classroom programs — questions, graphing, worksheets, money, number sense and games.</p>
      </div>
      <div class="search-wrap"><input id="hubSearch" type="text" placeholder="Search apps…  (press /)" aria-label="Search apps"></div>`;
    view.appendChild(toolbar);

    const chips = U.el("div", { class: "btn-row", style: { marginBottom: "18px" } });
    chips.innerHTML = `<button class="btn sm soft" data-g="all">Everything</button>` +
      GROUPS.map((g) => `<button class="btn sm ghost" data-g="${g.id}">${g.label}</button>`).join("");
    view.appendChild(chips);

    const grid = U.el("div", { class: "grid-apps" });
    view.appendChild(grid);

    let activeGroup = "all", q = "";
    function draw() {
      grid.innerHTML = "";
      const list = ML.order.map((k) => ML.apps[k]).filter((a) => {
        if (a.id === "courses" || a.id === "questions") return false;  /* already above */
        if (activeGroup !== "all" && a.group !== activeGroup) return false;
        if (q && !(a.title + " " + a.blurb + " " + (a.tags || []).join(" ")).toLowerCase().includes(q)) return false;
        return true;
      });
      if (!list.length) { grid.innerHTML = `<div class="empty" style="grid-column:1/-1">No apps match “${esc(q)}”.</div>`; return; }
      for (const a of list) {
        const card = U.el("a", { class: "app-card", href: "#/" + a.id });
        card.innerHTML = `
          <div class="ico" style="background:${a.color[0]};color:${a.color[1]}">${a.icon}</div>
          <h3>${a.title}</h3>
          <p>${a.blurb}</p>
          <div class="meta">${(a.tags || []).map((t) => `<span class="tag">${t}</span>`).join("")}</div>`;
        grid.appendChild(card);
      }
    }
    chips.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-g]");
      if (!b) return;
      activeGroup = b.dataset.g;
      U.$$("button[data-g]", chips).forEach((x) => { x.className = "btn sm " + (x === b ? "soft" : "ghost"); });
      draw();
    });
    const search = toolbar.querySelector("#hubSearch");
    search.addEventListener("input", () => { q = search.value.trim().toLowerCase(); draw(); });
    document.addEventListener("keydown", function slash(e) {
      if (e.key === "/" && document.activeElement !== search && !/input|textarea/i.test(document.activeElement.tagName)) {
        e.preventDefault(); search.focus();
      }
    });
    draw();

    /* ---- footer strip ---- */
    const strip2 = U.el("div", { class: "card pad", style: { marginTop: "34px" } });
    strip2.innerHTML = `
      <div style="display:flex;gap:22px;flex-wrap:wrap;align-items:center;justify-content:space-between">
        <div style="max-width:62ch">
          <h3>About this rebuild</h3>
          <p class="small muted" style="margin-top:6px">The originals were Windows executables and Flash projectors from
          the 2000s; the course pages came out of the Dr. Math Azzam platform. Both are reimplemented here in plain HTML,
          CSS and JavaScript — same ideas, same activities, keyboard support, no plugins. Progress, stars and settings
          live in this browser only.</p>
        </div>
        <div class="btn-row">
          <button class="btn ghost sm" id="resetStats">Reset my stats</button>
        </div>
      </div>`;
    view.appendChild(strip2);
    strip2.querySelector("#resetStats").addEventListener("click", () => {
      U.store.del("stats:answered"); U.store.del("stats:correct");
      ML.toast("Stats cleared", "ok"); ML.route();
    });
  };
})();

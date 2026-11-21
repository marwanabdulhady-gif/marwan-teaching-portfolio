/* ===========================================================
   MathsLab — Question Studio
   One place for every question in the project:
     · 2,840 records recovered from the 31 Quiz Show .bnk banks
     · 1,736 FikrCounts multiple-choice questions
     · 162 calculus items with real answer keys
     · the lesson quiz checkpoints from the course pages

   Three ways to work through them — Study (card by card),
   Practice (a scored run of 10/20/50 with a streak and a
   review sheet) and List (scan the whole deck).
   =========================================================== */
(function () {
  "use strict";
  const ML = window.ML, U = ML.u;

  const LETTER = "ABCDE";

  const DIFFS = [
    { id: "", label: "Any level" },
    { id: "Easy", label: "Easy" },
    { id: "Medium", label: "Medium" },
    { id: "Hard", label: "Hard" },
  ];

  function prettyName(unit) {
    return String(unit || "").replace(/\s+/g, " ").slice(0, 64);
  }

  const plain = (text) => ML.qdata.plain(text);

  function shorten(s, n) {
    const str = String(s || "");
    return str.length > n ? str.slice(0, n - 1).trimEnd() + "…" : str;
  }

  ML.register({
    id: "questions",
    group: "questions",
    title: "Question Studio",
    short: "Questions",
    icon: ML.icon("bulb"),
    color: ["#eeecff", "#4b3ee0"],
    tag: "9,000+ questions, one deck",
    blurb: "Every question in the project in one place: the Fundamentals of Math course bank, the recovered .bnk banks, the FikrCounts MCQ bank, the calculus question bank and the lesson quizzes — searchable, filterable, and playable card by card.",
    tags: ["unified bank", "practice runs", "answer keys", "progress"],

    mount(root, ctx) {
      const qd = ML.qdata;
      const sub = (ctx && ctx.sub) || "";
      const counts = qd.counts();

      /* ---------------- persisted view state ---------------- */
      const saved = U.store.get("qs:view", {}) || {};
      const st = {
        mode: saved.mode || "study",          // study | practice | list
        course: saved.course || "",           // course id, from MLCOURSES
        node: saved.node || "",               // chapter / lesson inside it
        focus: null,                          // one-shot hand-off from a lesson page
        src: saved.src || "all",
        unit: saved.unit || "",
        diff: saved.diff || "",
        skill: saved.skill || "",
        prog: saved.prog || "",
        grade: saved.grade || "",
        questionsOnly: !!saved.questionsOnly,
        q: "",
        starredOnly: !!saved.starredOnly,
        wrongOnly: !!saved.wrongOnly,
        unseenOnly: !!saved.unseenOnly,
        questionsOnly: !!saved.questionsOnly,
        shuffle: !!saved.shuffle,
        deck: [], i: 0, card: null,
        sess: null,         // active practice run
        page: 1,            // list pagination
      };
      const persist = U.debounce(() => U.store.set("qs:view", {
        mode: st.mode, src: st.src, unit: st.unit, diff: st.diff, skill: st.skill,
        course: st.course, node: st.node,
        starredOnly: st.starredOnly, wrongOnly: st.wrongOnly, unseenOnly: st.unseenOnly,
        questionsOnly: st.questionsOnly, prog: st.prog, grade: st.grade, shuffle: st.shuffle,
      }), 300);

      /* ---------------- shell ---------------- */
      const wrap = U.el("div", { class: "qs", "data-src": st.src });
      wrap.innerHTML = `
        <section class="qs-head" id="qsHead"></section>

        <div class="qs-toolbar">
          <div class="qs-toolbar-in">
            <div class="qs-courses" id="qsCourses" aria-label="Course"></div>
            <div class="qs-srcs" id="qsSrcs"></div>
            <div class="qs-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="M16 16l5 5" stroke-linecap="round"/></svg>
              <input id="qsSearch" type="text" placeholder="Search questions, skills, topics…" aria-label="Search questions">
            </div>
            <div class="qs-modes" id="qsModes">
              <button data-m="study">Study</button>
              <button data-m="practice">Practice</button>
              <button data-m="list">List</button>
            </div>
          </div>
        </div>

        <div class="qs-body">
          <aside class="qs-side no-print" id="qsSide">
            <div class="panel">
              <div class="panel-h">Refine</div>
              <div class="panel-b tight" id="qsFilters"></div>
            </div>
            <div class="panel">
              <div class="panel-h">Your progress</div>
              <div class="panel-b tight" id="qsProgress"></div>
            </div>
          </aside>
          <div class="qs-main">
            <div class="qs-sess" id="qsDeckBar"></div>
            <div id="qsStage"></div>
            <div id="qsStats"></div>
          </div>
        </div>`;

      root.appendChild(wrap);
      const $ = (s) => wrap.querySelector(s);
      const stage = $("#qsStage");

      /* ---------------- source pills ---------------- */
      function drawSources() {
        const c = qd.counts();
        $("#qsSrcs").innerHTML = qd.SOURCES.map((s) => {
          const n = s.id === "all" ? c.all : c[s.id] || 0;
          if (!n && s.id !== "all") return "";
          return `<button class="qs-src ${st.src === s.id ? "on" : ""}" data-s="${s.id}" title="${s.hint || ""}">` +
            (s.id === "all" ? "" : `<span class="sw" style="background:${s.color}"></span>`) +
            `${s.label}<b>${n.toLocaleString()}</b></button>`;
        }).join("");
        $("#qsSrcs").querySelectorAll(".qs-src").forEach((b) => b.addEventListener("click", () => {
          st.src = b.dataset.s; st.unit = ""; st.skill = ""; st.prog = ""; st.grade = ""; st.page = 1;
          wrap.dataset.src = st.src;
          drawSources(); drawFilters(); rebuild(true); persist();
        }));
      }

      /* ---------------- filters ---------------- */
      function drawFilters() {
        /* inside a course the facets that matter are the course's own chapters */
        if (st.course) return drawCourseFilters();
        const units = qd.unitsFor(st.src);
        const skills = qd.skillsFor(st.src);
        const box = $("#qsFilters");
        box.innerHTML = `
          <div class="qs-fld">
            <label for="qsUnit">Chapter / topic</label>
            <select class="select" id="qsUnit">
              <option value="">All ${units.length} chapters &amp; topics</option>
              ${units.map((u) => `<option value="${ML.qdata.esc(u.key)}" ${st.unit === u.key ? "selected" : ""}>${ML.qdata.esc(prettyName(u.unit))} (${u.n})</option>`).join("")}
            </select>
          </div>
          <div class="qs-fld">
            <label>Level</label>
            <div class="qs-chips" id="qsDiff">
              ${DIFFS.map((d) => `<button class="qs-chip ${st.diff === d.id ? "on" : ""}" data-d="${d.id}">${d.label}</button>`).join("")}
            </div>
          </div>
          ${skills.length ? `<div class="qs-fld">
            <label for="qsSkill">Skill</label>
            <select class="select" id="qsSkill">
              <option value="">Every skill (${skills.length})</option>
              ${skills.map((s) => `<option value="${ML.qdata.esc(s)}" ${st.skill === s ? "selected" : ""}>${ML.qdata.esc(s)}</option>`).join("")}
            </select>
          </div>` : ""}
          ${st.src === "fikr" || st.src === "all" ? `<div class="qs-fld">
            <label for="qsProg">Program</label>
            <select class="select" id="qsProg">
              <option value="">Every program</option>
              ${qd.programsFor().map((p) => `<option value="${ML.qdata.esc(p.id)}" ${st.prog === p.id ? "selected" : ""}>${ML.qdata.esc(p.id)} (${p.n})</option>`).join("")}
            </select>
          </div>
          <div class="qs-fld">
            <label for="qsGrade">Grade</label>
            <select class="select" id="qsGrade">
              <option value="">Every grade</option>
              ${qd.gradesFor().map((g) => `<option value="${ML.qdata.esc(g.id)}" ${st.grade === g.id ? "selected" : ""}>${ML.qdata.esc(g.id)} (${g.n})</option>`).join("")}
            </select>
          </div>` : ""}
          <div class="qs-fld">
            <label>Only show</label>
            <label class="qs-toggle"><input type="checkbox" id="fStar" ${st.starredOnly ? "checked" : ""}> Starred questions</label>
            <label class="qs-toggle"><input type="checkbox" id="fWrong" ${st.wrongOnly ? "checked" : ""}> Ones I got wrong</label>
            <label class="qs-toggle"><input type="checkbox" id="fUnseen" ${st.unseenOnly ? "checked" : ""}> Not tried yet</label>
            ${st.src === "all" || st.src === "bnk" ? `<label class="qs-toggle"><input type="checkbox" id="fQ" ${st.questionsOnly ? "checked" : ""}> Only real questions (.bnk drops definitions &amp; fragments)</label>` : ""}
            <label class="qs-toggle"><input type="checkbox" id="fShuffle" ${st.shuffle ? "checked" : ""}> Shuffle the deck</label>
          </div>
          <button class="btn ghost sm" id="fClear">Clear filters</button>`;

        box.querySelector("#qsUnit").addEventListener("change", (e) => { st.unit = e.target.value; rebuild(true); persist(); });
        const sk = box.querySelector("#qsSkill");
        if (sk) sk.addEventListener("change", (e) => { st.skill = e.target.value; rebuild(true); persist(); });
        const pg = box.querySelector("#qsProg");
        if (pg) pg.addEventListener("change", (e) => { st.prog = e.target.value; rebuild(true); persist(); });
        const gr = box.querySelector("#qsGrade");
        if (gr) gr.addEventListener("change", (e) => { st.grade = e.target.value; rebuild(true); persist(); });
        box.querySelectorAll("#qsDiff .qs-chip").forEach((b) => b.addEventListener("click", () => {
          st.diff = b.dataset.d;
          box.querySelectorAll("#qsDiff .qs-chip").forEach((x) => x.classList.toggle("on", x === b));
          rebuild(true); persist();
        }));
        const bind = (id, key) => box.querySelector(id).addEventListener("change", (e) => {
          st[key] = e.target.checked; rebuild(true); persist();
        });
        bind("#fStar", "starredOnly"); bind("#fWrong", "wrongOnly");
        bind("#fUnseen", "unseenOnly"); bind("#fShuffle", "shuffle");
        const fq = box.querySelector("#fQ");
        if (fq) bind("#fQ", "questionsOnly");
        box.querySelector("#fClear").addEventListener("click", () => {
          st.unit = ""; st.skill = ""; st.diff = ""; st.prog = ""; st.grade = "";
          st.starredOnly = st.wrongOnly = st.unseenOnly = st.questionsOnly = false;
          st.q = ""; $("#qsSearch").value = "";
          drawFilters(); rebuild(true); persist();
        });
      }

      /* ---------------- course picker ---------------- */
      const CM = () => ML.coursemap;
      function courseNode() {
        const cm = CM();
        if (!st.course || !cm) return null;
        return cm.nodeOf(cm.courseById(st.course), st.node || "") || cm.courseById(st.course);
      }
      /* the id list (or bank filter) the current course / lesson covers */
      function courseScope() {
        const cm = CM();
        if (!cm) return null;
        if (st.focus) return st.focus;
        if (!st.course) return null;
        return cm.resolve(st.course, st.node || "");
      }

      function drawCourses() {
        const box = $("#qsCourses");
        const CO = window.MLCOURSES;
        if (!box || !CO) return;
        box.innerHTML =
          `<button class="qs-course${!st.course && !st.focus ? " on" : ""}" data-c="">All courses</button>` +
          CO.courses.map((c) =>
            `<button class="qs-course${st.course === c.id ? " on" : ""}" data-c="${c.id}" title="${ML.qdata.esc(c.grade)} · ${c.chapters.length} chapters">` +
            `<i>${c.icon}</i>${ML.qdata.esc(c.title)}</button>`).join("");
        box.querySelectorAll(".qs-course").forEach((b) => b.addEventListener("click", () => {
          st.course = b.dataset.c; st.node = ""; st.focus = null;
          st.unit = ""; st.skill = ""; st.prog = ""; st.grade = ""; st.page = 1;
          st.src = (CM().courseById(st.course) || {}).src || "all";
          const srcs = $("#qsSrcs"); if (srcs) srcs.style.display = st.course ? "none" : "";
          drawSources();
          drawCourses(); drawHead(); drawFilters(); rebuild(false); persist();
        }));
      }

      function drawHead() {
        const head = $("#qsHead");
        if (!head) return;
        const scope = courseScope();
        const course = st.course ? CM().courseById(st.course) : null;
        const node = courseNode();
        const n = scope ? (scope.ids ? scope.ids.length : qd.filter(scope.filter).length) : qd.items.length;
        const title = scope ? scope.title : (course ? course.title : "The whole deck");
        const crumb = st.focus
          ? `<span class="qs-focus-chip">handed over from a course page<button id="qsFocusClear" title="Clear">×</button></span>`
          : "";
        head.innerHTML = `
          <div class="qs-head-in">
            <div>
              <div class="eyebrow">${course ? "Course" : "Question Studio"}</div>
              <h2>${ML.qdata.esc(title)} ${crumb}</h2>
              <p class="qs-head-sub">${n.toLocaleString()} questions in view${node && node.filter ? "" : course ? " — everything filed under this part of the course" : " — every source, searchable and playable"}${
                course ? ` · <a href="#/courses/${course.id}">open the course page →</a>` : ` · <a href="#/courses">browse the courses →</a>`}</p>
            </div>
            <div class="qs-head-act">
              <button class="btn sm" id="qsHeadPractice">Practice 10</button>
              <button class="btn ghost sm" id="qsHeadList">List</button>
            </div>
          </div>
          <div class="qs-kpis" id="qsKpis"></div>`;
        drawKpis();
        head.querySelector("#qsHeadPractice").addEventListener("click", () => {
          if (!st.deck.length) rebuild(false);
          startSession(10);
        });
        head.querySelector("#qsHeadList").addEventListener("click", () => {
          st.mode = "list"; syncModes(); drawDeckBar(); renderStage();
        });
        const clr = head.querySelector("#qsFocusClear");
        if (clr) clr.addEventListener("click", () => { st.focus = null; drawHead(); rebuild(false); });
      }

      /* the sidebar inside a course: chapter / lesson, level, starred … */
      function drawCourseFilters() {
        const cm = CM();
        const course = cm.courseById(st.course);
        const box = $("#qsFilters");
        if (!course) { st.course = ""; return drawFilters(); }
        const rows = [];
        course.chapters.forEach((ch) => {
          if ((ch.lessons || []).length) {
            rows.push(`<optgroup label="${ML.qdata.esc(ch.title)}">`);
            ch.lessons.forEach((l) => {
              rows.push(`<option value="${l.id}" ${st.node === l.id ? "selected" : ""}>${ML.qdata.esc(l.code + " · " + l.title)} (${l.qn})</option>`);
            });
            rows.push(`</optgroup>`);
          } else {
            rows.push(`<option value="${ch.id}" ${st.node === ch.id ? "selected" : ""}>${ML.qdata.esc(ch.title)} (${ch.n})</option>`);
          }
        });
        const srcs = $("qsSrcs"); if (srcs) srcs.style.display = "none";
        box.innerHTML = `
          <div class="qs-fld">
            <label for="qsCourseNode">Where in this course</label>
            <select class="select" id="qsCourseNode">
              <option value="">Everything in ${ML.qdata.esc(course.title)}</option>
              ${rows.join("")}
            </select>
          </div>
          <div class="qs-fld">
            <label>Level</label>
            <div class="qs-chips" id="qsDiff">
              ${DIFFS.map((d) => `<button class="qs-chip ${st.diff === d.id ? "on" : ""}" data-d="${d.id}">${d.label}</button>`).join("")}
            </div>
          </div>
          <div class="qs-fld">
            <label>Only show</label>
            <label class="qs-toggle"><input type="checkbox" id="fStar" ${st.starredOnly ? "checked" : ""}> Starred questions</label>
            <label class="qs-toggle"><input type="checkbox" id="fWrong" ${st.wrongOnly ? "checked" : ""}> Ones I got wrong</label>
            <label class="qs-toggle"><input type="checkbox" id="fUnseen" ${st.unseenOnly ? "checked" : ""}> Not tried yet</label>
            <label class="qs-toggle"><input type="checkbox" id="fShuffle" ${st.shuffle ? "checked" : ""}> Shuffle the deck</label>
          </div>
          <button class="btn ghost sm" id="fClear">Back to the whole deck</button>`;
        box.querySelector("#qsCourseNode").addEventListener("change", (e) => {
          st.node = e.target.value; st.page = 1; drawHead(); rebuild(false); persist();
        });
        box.querySelectorAll("#qsDiff .qs-chip").forEach((b) => b.addEventListener("click", () => {
          st.diff = b.dataset.d;
          box.querySelectorAll("#qsDiff .qs-chip").forEach((x) => x.classList.toggle("on", x === b));
          rebuild(true); persist();
        }));
        ["Star:starredOnly", "Wrong:wrongOnly", "Unseen:unseenOnly", "Shuffle:shuffle"].forEach((pair) => {
          const [id, key] = pair.split(":");
          box.querySelector("#f" + id).addEventListener("change", (e) => { st[key] = e.target.checked; rebuild(true); persist(); });
        });
        box.querySelector("#fClear").addEventListener("click", () => {
          st.course = ""; st.node = ""; st.focus = null; st.unit = ""; st.skill = ""; st.prog = ""; st.grade = "";
          const srcs = $("qsSrcs"); if (srcs) srcs.style.display = "";
          drawCourses(); drawHead(); drawFilters(); rebuild(false); persist();
        });
      }

      /* ---------------- progress + kpis ---------------- */
      function drawKpis() {
        const box = $("#qsKpis");
        if (!box) return;
        drawKpisTiles(box);
      }
      function drawKpisTiles(box) {
        const s = qd.summary();
        const acc = s.attempted ? Math.round((s.correct / s.attempted) * 100) : 0;
        const tiles = [
          { v: qd.items.length.toLocaleString(), l: "questions in the studio", pct: s.seen / qd.items.length },
          { v: s.seen.toLocaleString(), l: "cards you have opened", pct: s.seen / qd.items.length },
          { v: acc + "%", l: "accuracy on marked work", pct: acc / 100 },
          { v: s.starred.toLocaleString(), l: "saved for later", pct: Math.min(1, s.starred / 40) },
        ];
        box.innerHTML = tiles.map((t) =>
          `<div class="qs-kpi"><b>${t.v}</b><span>${t.l}</span><i><u style="width:${Math.max(2, Math.round(t.pct * 100))}%"></u></i></div>`).join("");
      }

      function drawProgress() {
        const s = qd.summary();
        const byUnit = qd.statsByUnit(st.src, 6);
        $("#qsProgress").innerHTML = `
          <div class="row2">
            <div class="stat"><span>Tried</span><b>${s.correct + s.wrong}</b></div>
            <div class="stat"><span>Starred</span><b>${s.starred}</b></div>
          </div>
          <div class="small muted" style="margin-top:2px">Where your marked work is landing</div>
          ${byUnit.length ? byUnit.map((u) => {
            const pct = u.attempted ? Math.round((u.correct / u.attempted) * 100) : 0;
            return `<div class="qbar"><span class="nm" title="${ML.qdata.esc(u.unit)}">${ML.qdata.esc(prettyName(u.unit))}</span>` +
              `<span class="tr"><i style="width:${u.attempted ? Math.max(3, pct) : 0}%"></i></span>` +
              `<span class="vl">${u.attempted ? pct + "%" : "—"}</span></div>`;
          }).join("") : `<div class="small muted">Nothing marked yet — a practice run will fill this in.</div>`}
          <button class="btn ghost sm" id="qsReset" style="margin-top:6px">Reset all progress</button>`;
        $("#qsReset").addEventListener("click", () => {
          if (!confirm("Clear every bit of progress, stars and history in this browser?")) return;
          qd.reset(); drawKpis(); drawProgress(); rebuild(true);
          ML.toast("Progress cleared", "ok");
        });
      }

      /* ---------------- deck ---------------- */
      function filters() {
        return {
          src: st.src, unit: st.unit, diff: st.diff, skill: st.skill, q: st.q,
          prog: st.src === "bnk" ? "" : st.prog, grade: st.src === "bnk" ? "" : st.grade,
          questionsOnly: st.questionsOnly,
          starredOnly: st.starredOnly, wrongOnly: st.wrongOnly, unseenOnly: st.unseenOnly,
        };
      }

      /* When the deck spans every source, interleave it: an answer-key
         question, then an MCQ, then a recovered record, and so on —
         so "Everything" reads as one mixed deck instead of 2,840 .bnk
         records followed by everything else. */
      function interleave(list) {
        const order = ["calc", "lab", "fikr", "bnk"];
        const buckets = {};
        list.forEach((it) => { (buckets[it.src] = buckets[it.src] || []).push(it); });
        const out = [];
        let more = true;
        while (more) {
          more = false;
          for (const key of order) {
            const b = buckets[key];
            if (b && b.length) { out.push(b.shift()); more = true; }
          }
        }
        return out;
      }

      function rebuild(keepPos) {
        let list = qd.filter(filters());
        /* course / lesson / hand-off scope */
        const scope = courseScope();
        if (scope) {
          if (scope.ids) {
            const set = new Set(scope.ids);
            list = list.filter((it) => set.has(it.id));
          } else if (scope.filter) {
            list = qd.filter(Object.assign({}, filters(), scope.filter));
          }
        }
        st.deck = st.shuffle ? U.shuffle(list) : (st.src === "all" ? interleave(list.slice()) : list);
        // keep the reader on the same card if it is still in the deck
        if (keepPos && st.card && st.card.item) {
          const j = st.deck.findIndex((x) => x.id === st.card.item.id);
          st.i = j >= 0 ? j : 0;
        } else st.i = 0;
        st.page = 1;
        if (st.sess) endSession(true);
        drawDeckBar();
        renderStage();
      }

      function drawDeckBar() {
        const n = st.deck.length;
        const bar = $("#qsDeckBar");
        if (st.sess) {
          const s = st.sess;
          const done = s.i;
          const pct = s.queue.length ? Math.round((done / s.queue.length) * 100) : 0;
          bar.innerHTML = `
            <div class="grow">
              <div class="lbl">Practice run · ${s.queue.length} questions</div>
              <b>${s.correct + s.wrong}</b> answered · <b>${s.correct}</b> right
              <div class="qprog" style="margin-top:6px"><i style="width:${pct}%"></i></div>
            </div>
            <span class="streak" title="Correct in a row">${ML.icon("flame")} ${s.streak} in a row</span>
            <span class="timer" id="qsTimer">0:00</span>
            <button class="btn ghost sm" id="qsEnd">End run</button>`;
          bar.querySelector("#qsEnd").addEventListener("click", () => endSession(false));
          return;
        }
        bar.innerHTML = `
          <div class="grow">
            <div class="lbl">${n ? "Deck ready" : "Nothing matches"}</div>
            <b>${n.toLocaleString()}</b> question${n === 1 ? "" : "s"} ${st.src === "all" ? "from every source" : "in this source"}
            ${st.diff ? " · " + st.diff : ""}${st.unit ? " · 1 chapter" : ""}
          </div>
          <button class="btn sm" id="prac10" ${n ? "" : "disabled"}>Practice 10</button>
          <button class="btn ghost sm" id="prac20" ${n ? "" : "disabled"}>20</button>
          <button class="btn ghost sm" id="prac50" ${n ? "" : "disabled"}>50</button>
          <button class="btn ghost sm" id="shuffleNow" ${n ? "" : "disabled"}>${ML.icon("shuffle")} Shuffle</button>`;
        bar.querySelector("#prac10").addEventListener("click", () => startSession(10));
        bar.querySelector("#prac20").addEventListener("click", () => startSession(20));
        bar.querySelector("#prac50").addEventListener("click", () => startSession(50));
        bar.querySelector("#shuffleNow").addEventListener("click", () => {
          st.shuffle = true; st.deck = U.shuffle(st.deck); st.i = 0; st.page = 1;
          const cb = wrap.querySelector("#fShuffle"); if (cb) cb.checked = true;
          renderStage(); ML.toast("Deck shuffled", "ok");
        });
      }

      /* ---------------- stage router ---------------- */
      function renderStage() {
        if (st.card && st.card.destroy) { st.card.destroy(); st.card = null; }
        stage.innerHTML = "";
        if (st.mode === "list") return renderList();
        if (st.mode === "practice" && st.sess) return renderSession();
        renderStudy();
      }

      /* ---------------- study ---------------- */
      function renderStudy() {
        if (!st.deck.length) return renderEmpty();
        const item = st.deck[st.i];
        const host = U.el("div");
        stage.appendChild(host);
        // progress reads against the chapter you are in, not the whole deck,
        // otherwise 2,840 cards would sit at 0% for a very long time
        const ukey = item.src + "|" + item.unitKey;
        const unitDeck = st.deck.filter((x) => x.src + "|" + x.unitKey === ukey);
        let covered = unitDeck.reduce((n, x) => n + (qd.rec(x.id).seen ? 1 : 0), 0);
        if (!qd.rec(item.id).seen) covered += 1;
        const unitShort = item.src === "bnk"
          ? [item.book, String(item.chapter || "").replace(/^[A-Z0-9]+\s+/, "")].filter(Boolean).join(" ")
          : shorten(item.unit, 34);
        st.card = ML.qcard.create(host, item, {
          index: st.i, total: Math.max(unitDeck.length, 1), covered,
          unit: unitShort,
          onPrev: () => { st.i = (st.i - 1 + st.deck.length) % st.deck.length; renderStage(); },
          onNext: () => { st.i = (st.i + 1) % st.deck.length; renderStage(); },
          onAnswer: () => { drawKpis(); drawProgress(); },
          onStar: () => { drawKpis(); },
        });
        st.card.item = item;
        drawStats();
      }

      function renderEmpty() {
        stage.innerHTML = `<div class="card pad" style="text-align:center">
          <h3 style="margin-bottom:6px">Nothing matches those filters</h3>
          <p class="muted small" style="margin:0 0 14px">Try “Everything”, clear the level chips, or switch off the “only show” toggles.</p>
          <button class="btn soft sm" id="emptyClear">Clear filters</button></div>`;
        stage.querySelector("#emptyClear").addEventListener("click", () => {
          st.unit = ""; st.skill = ""; st.diff = ""; st.starredOnly = st.wrongOnly = st.unseenOnly = false; st.q = "";
          $("#qsSearch").value = ""; drawFilters(); rebuild(true);
        });
      }

      /* ---------------- practice run ---------------- */
      function startSession(n) {
        const pool = st.deck.length ? st.deck : qd.filter(filters());
        if (!pool.length) return;
        const queue = U.shuffle(pool).slice(0, Math.min(n, pool.length));
        st.sess = { queue, i: 0, correct: 0, wrong: 0, streak: 0, best: 0, answered: [], startedAt: Date.now() };
        st.mode = "practice";
        syncModes();
        drawDeckBar();
        renderStage();
        startTimer();
      }

      let timerId = null;
      function startTimer() {
        clearInterval(timerId);
        timerId = setInterval(() => {
          const el = wrap.querySelector("#qsTimer");
          if (!el || !st.sess) return;
          const s = Math.floor((Date.now() - st.sess.startedAt) / 1000);
          el.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
        }, 1000);
      }
      function stopTimer() { clearInterval(timerId); timerId = null; }

      function renderSession() {
        const s = st.sess;
        if (s.i >= s.queue.length) return renderResults();
        const item = s.queue[s.i];
        let pending = null;
        const host = U.el("div");
        stage.appendChild(host);
        st.card = ML.qcard.create(host, item, {
          index: s.i, total: s.queue.length, hideNav: true,
          onAnswer: (correct) => {
            if (pending !== null) return;
            pending = !!correct;
            if (pending) { s.correct++; s.streak++; s.best = Math.max(s.best, s.streak); }
            else { s.wrong++; s.streak = 0; }
            qd.bump(item.id, pending ? "c" : "w");
            s.answered.push({ id: item.id, correct: pending });
            drawDeckBar();
          },
          onNext: () => advance(),
        });
        st.card.item = item;

        function advance() {
          s.i++;
          st.i = s.i;
          drawDeckBar();
          renderStage();
        }
        const nav = U.el("div", { class: "btn-row", style: { marginTop: "12px" } });
        nav.innerHTML = `<button class="btn ghost sm" id="sessSkip">Skip this one</button>
          <button class="btn sm" id="sessNext" style="margin-left:auto">Next question</button>`;
        nav.querySelector("#sessSkip").addEventListener("click", () => { s.streak = 0; advance(); });
        nav.querySelector("#sessNext").addEventListener("click", () => advance());
        stage.appendChild(nav);
      }

      function renderResults() {
        stopTimer();
        const s = st.sess;
        const total = s.correct + s.wrong;
        const acc = total ? Math.round((s.correct / total) * 100) : 0;
        const secs = Math.round((Date.now() - s.startedAt) / 1000);
        const missed = s.answered.filter((a) => !a.correct).map((a) => qd.byId[a.id]).filter(Boolean);
        const mark = acc >= 80 ? "Strong run." : acc >= 50 ? "Solid — the misses are worth a look." : "Worth another pass.";
        stage.innerHTML = `<div class="qres">
          <div class="eyebrow">Practice run finished</div>
          <h3>${mark}</h3>
          <div class="big">${acc}%</div>
          <p class="muted small" style="margin-top:4px">${s.correct} right · ${s.wrong} missed · ${s.queue.length - total} skipped · ${Math.floor(secs / 60)}m ${secs % 60}s · best streak ${s.best}</p>
          <div class="rowz">
            <div class="stat"><span>Correct</span><b>${s.correct}</b></div>
            <div class="stat"><span>Missed</span><b>${s.wrong}</b></div>
            <div class="stat"><span>Streak</span><b>${s.best}</b></div>
            <div class="stat"><span>Time</span><b>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}</b></div>
          </div>
          ${missed.length ? `<div class="small" style="font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:8px">Worth another look</div>
            <div class="qlist">${missed.slice(0, 12).map((it) => `
              <button class="qrow" data-open="${it.id}">
                <span class="no">${LETTER[0]}</span>
                <span class="mid"><span class="txt">${plain(it.q)}</span>
                <span class="sub"><span>${ML.qdata.esc(prettyName(it.unit))}</span>${it.skill ? "<span>·</span><span>" + ML.qdata.esc(it.skill) + "</span>" : ""}</span></span>
                <span class="flags"><span class="qdot no"></span></span>
              </button>`).join("")}</div>` : `<p class="small muted">Clean sweep — not a single miss.</p>`}
          <div class="btn-row" style="margin-top:16px">
            <button class="btn" id="resAgain">Run it again</button>
            <button class="btn ghost" id="resReview">Review the ${missed.length || "missed"} misses</button>
            <button class="btn ghost" id="resBack">Back to studying</button>
          </div>
        </div>`;

        qd.logSession({ at: Date.now(), n: s.queue.length, correct: s.correct, wrong: s.wrong, secs, src: st.src });
        stage.querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => openCard(b.dataset.open)));
        stage.querySelector("#resAgain").addEventListener("click", () => { st.sess = null; startSession(st.deck.length ? Math.min(10, st.deck.length) : 10); });
        stage.querySelector("#resReview").addEventListener("click", () => {
          st.sess = null; st.wrongOnly = true; st.starredOnly = st.unseenOnly = false;
          st.mode = "study"; syncModes(); drawFilters(); rebuild(true);
        });
        stage.querySelector("#resBack").addEventListener("click", () => { st.sess = null; st.mode = "study"; syncModes(); drawDeckBar(); renderStage(); });
        st.sess = null;
        drawDeckBar();
      }

      function endSession(silent) {
        stopTimer();
        st.sess = null;
        if (!silent) { drawDeckBar(); renderStage(); }
      }

      /* ---------------- list ---------------- */
      function renderList() {
        const per = 60;
        const slice = st.deck.slice(0, st.page * per);
        if (!st.deck.length) return renderEmpty();
        const rows = slice.map((it, i) => {
          const r = qd.rec(it.id);
          const flags = (r.c ? '<span class="qdot ok" title="answered correctly"></span>' : "") +
            (r.w ? '<span class="qdot no" title="missed before"></span>' : "") +
            (r.st ? '<span class="qdot star" title="starred"></span>' : "");
          return `<button class="qrow" data-open="${it.id}">
            <span class="no">${i + 1}</span>
            <span class="mid">
              <span class="txt">${plain(it.q)}</span>
              <span class="sub">
                <span class="qchip src" style="--qs-accent:${(qd.SOURCES.find((s) => s.id === it.src) || {}).color || "#4b3ee0"}">${qd.SOURCES.find((s) => s.id === it.src) ? qd.SOURCES.find((s) => s.id === it.src).label : it.src}</span>
                <span>${ML.qdata.esc(prettyName(it.unit))}</span>
                ${it.diff ? "<span>·</span><span>" + ML.qdata.esc(it.diff) + "</span>" : ""}
              </span>
            </span>
            <span class="flags">${flags || '<span class="qdot"></span>'}</span>
          </button>`;
        }).join("");
        stage.innerHTML = `<div class="qlist">${rows}</div>
          ${st.deck.length > slice.length ? `<div class="qlist-more"><button class="btn ghost sm" id="more">Show ${Math.min(per, st.deck.length - slice.length)} more of ${st.deck.length.toLocaleString()}</button></div>` : ""}`;
        stage.querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => openCard(b.dataset.open)));
        const more = stage.querySelector("#more");
        if (more) more.addEventListener("click", () => { st.page++; renderList(); });
      }

      function openCard(id) {
        const j = st.deck.findIndex((x) => x.id === id);
        st.i = j >= 0 ? j : 0;
        if (j < 0) { st.deck = [qd.byId[id]].concat(st.deck); st.i = 0; }
        st.mode = "study"; syncModes(); drawDeckBar(); renderStage();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      /* ---------------- bottom stats ---------------- */
      function drawStats() {
        const c = qd.counts();
        const s = qd.summary();
        const seenBy = { bnk: 0, fikr: 0, calc: 0, lab: 0 };
        qd.items.forEach((it) => { if (qd.rec(it.id).seen) seenBy[it.src] += 1; });
        $("#qsStats").innerHTML = `
          <div class="card pad" style="margin-top:18px">
            <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:baseline">
              <h3>What is in the studio</h3>
              <span class="small muted">${s.seen.toLocaleString()} of ${qd.items.length.toLocaleString()} cards opened so far</span>
            </div>
            <div style="margin-top:12px">
              ${qd.SOURCES.filter((x) => x.id !== "all").map((src) => {
                const n = c[src.id] || 0;
                const seen = seenBy[src.id] || 0;
                const pct = n ? Math.round((seen / n) * 100) : 0;
                return `<div class="qbar">
                  <span class="nm" title="${src.hint || ""}" style="width:150px">${src.label}</span>
                  <span class="tr"><i style="width:${Math.max(1, pct)}%;background:linear-gradient(90deg,${src.color},#0f9d94)"></i></span>
                  <span class="vl">${seen}/${n}</span></div>`;
              }).join("")}
            </div>
            <p class="small muted" style="margin:12px 0 0">
              Progress, stars and practice history live in this browser only — no accounts, no uploads.
              The <b>.bnk</b> records are recovered text: where the original program generated a number you will see a ruled gap, and you can click it to put your own number in.
            </p>
          </div>`;
      }

      /* ---------------- modes ---------------- */
      function syncModes() {
        $("#qsModes").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.m === st.mode));
      }
      $("#qsModes").addEventListener("click", (e) => {
        const b = e.target.closest("button[data-m]");
        if (!b) return;
        if (st.sess && b.dataset.m !== "practice") endSession(true);
        st.mode = b.dataset.m;
        syncModes(); drawDeckBar(); renderStage(); persist();
      });

      /* ---------------- search ---------------- */
      const doSearch = U.debounce(() => {
        st.q = $("#qsSearch").value;
        rebuild(true);
      }, 180);
      $("#qsSearch").addEventListener("input", doSearch);

      /* ---------------- go ---------------- */
      const handoff = U.store.get("qs:focus", null);
      if (handoff) {
        U.store.del("qs:focus");
        if (handoff.course) { st.course = handoff.course; st.node = handoff.node || ""; st.src = (CM().courseById(st.course) || {}).src || "all"; }
        else st.focus = handoff;
      }
      drawCourses();
      drawHead();
      drawSources();
      drawFilters();
      drawKpis();
      drawProgress();
      syncModes();
      // deep links: #/questions/practice, #/questions/list
      rebuild(false);
      if (sub === "list" || sub === "practice") { st.mode = sub; syncModes(); drawDeckBar(); renderStage(); }
      $(`#qsModes button[data-m="${st.mode}"]`)?.classList.add("on");
      if (sub === "practice") startSession(10);
    },
  });
})();

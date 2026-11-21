/* ===========================================================
   MathsLab — Generator
   The TestGen/ExamView idea, rebuilt: pick a recipe, get a
   fresh question every time — with a real answer key, worked
   steps, a hint, and a printable worksheet with its own key.
   Deep link: #/generator[/<courseId>]
   =========================================================== */
(function () {
  "use strict";
  const ML = window.ML, U = ML.u;
  const esc = (s) => ML.qdata.esc(s);
  const tex = (s) => ML.qdata.html(s);

  const LETTER = "ABCDE";
  const DIFF_COLOR = { Easy: "#1fa45b", Medium: "#e8a008", Hard: "#e5484d" };

  function store() { return U.store.get("gen:state", {}) || {}; }
  function save(patch) { U.store.set("gen:state", Object.assign(store(), patch)); }

  ML.register({
    id: "generator",
    group: "questions",
    title: "Generator",
    short: "Generator",
    icon: ML.icon("bolt"),
    color: ["#fff4e0", "#b07a06"],
    tag: "every question fresh, every answer keyed",
    blurb: "The TestGen / ExamView logic from the Drive folder, rebuilt: algorithmic recipes over seven courses — " +
      "Algebra 1, Algebra 2, Geometry, Precalculus, Calculus, Course 1 and Course 2 — that write a brand-new question, " +
      "with its answer, distractors, hint and worked steps, every time you ask.",
    tags: ["algorithmic", "worksheet", "answer keys", "unlimited"],

    mount(root, ctx) {
      const gen = ML.gen;
      if (!gen) { root.innerHTML = `<div class="empty">Generator not loaded.</div>`; return; }
      const sub = ((ctx && ctx.sub) || "").replace(/^\/+|\/+$/g, "");
      const saved = store();
      const st = {
        course: saved.course || sub || "",
        family: saved.family || "",
        q: "",
        question: null,
        picked: null,
        stepsShown: 0,
        answered: saved.answered || 0,
        correct: saved.correct || 0,
        streak: saved.streak || 0,
      };

      const wrap = U.el("div", { class: "gen" });
      wrap.innerHTML = `
        <section class="gen-head">
          <div>
            <div class="eyebrow">Question generator</div>
            <h2>68 recipes · unlimited questions · every one keyed</h2>
            <p class="lead">TestGen and ExamView did not store finished questions — each dynamic question stored a
            <b>recipe</b>: variables with ranges, constraints, a template and a computed answer. This is that idea rebuilt
            in the browser. Pick a topic, ask for a question, and you get a fresh instance with its options, its key, a
            hint and the worked steps.</p>
          </div>
          <div class="gen-head-act">
            <div class="gen-stats" id="genStats"></div>
            <div class="btn-row">
              <button class="btn sm" id="genSheet10">Worksheet · 10</button>
              <button class="btn ghost sm" id="genSheet20">20</button>
              <button class="btn ghost sm" id="genSheet40">40</button>
            </div>
          </div>
        </section>

        <div class="gen-courses" id="genCourses"></div>

        <div class="gen-body">
          <aside class="gen-side no-print">
            <div class="panel">
              <div class="panel-h">Recipes</div>
              <div class="panel-b tight">
                <div class="gen-search">
                  <input class="input" id="genSearch" type="search" placeholder="Search topics…" aria-label="Search recipes">
                </div>
                <div class="gen-list" id="genList"></div>
              </div>
            </div>
            <div class="panel">
              <div class="panel-h">Where this comes from</div>
              <div class="panel-b">
                <p class="small muted" style="margin:0">${esc((window.MLGEN.source || {}).note || "")}</p>
              </div>
            </div>
          </aside>
          <div class="gen-main">
            <div id="genStage"></div>
          </div>
        </div>

        <div class="gen-sheet" id="genSheet" hidden></div>`;

      root.appendChild(wrap);
      const $ = (s) => wrap.querySelector(s);
      const stage = $("#genStage");

      /* ---------------- stats ---------------- */
      function drawStats() {
        const acc = st.answered ? Math.round((st.correct / st.answered) * 100) : 0;
        $("#genStats").innerHTML = `
          <div><b>${gen.families().length}</b><span>recipes</span></div>
          <div><b>${st.answered}</b><span>generated &amp; answered</span></div>
          <div><b>${st.answered ? acc + "%" : "—"}</b><span>accuracy</span></div>
          <div><b>${st.streak}</b><span>in a row</span></div>`;
      }

      /* ---------------- course pills ---------------- */
      function drawCourses() {
        const cs = gen.courses();
        $("#genCourses").innerHTML =
          `<button class="qs-src${!st.course ? " on" : ""}" data-c="">All courses <b>${gen.families().length}</b></button>` +
          cs.map((c) => `<button class="qs-src${st.course === c.id ? " on" : ""}" data-c="${c.id}">
            <span class="gen-ico" style="color:${c.ink}">${c.icon}</span>${esc(c.title)}<b>${gen.families(c.id).length}</b></button>`).join("");
        $("#genCourses").querySelectorAll(".qs-src").forEach((b) => b.addEventListener("click", () => {
          st.course = b.dataset.c; st.family = ""; st.q = ""; $("#genSearch").value = "";
          drawCourses(); drawList(); save({ course: st.course });
        }));
      }

      /* ---------------- recipe list ---------------- */
      function drawList() {
        const fams = gen.families(st.course, st.q);
        const box = $("#genList");
        if (!fams.length) { box.innerHTML = `<div class="empty small">No recipe matches that.</div>`; return; }
        const byChapter = {};
        fams.forEach((f) => { (byChapter[f.chapter] = byChapter[f.chapter] || []).push(f); });
        box.innerHTML = Object.keys(byChapter).map((ch) => `
          <div class="gen-ch">${esc(ch)}</div>
          ${byChapter[ch].map((f) => `
            <button class="gen-fam${st.family === f.id ? " on" : ""}" data-f="${f.id}">
              <span class="gen-dot" style="background:${DIFF_COLOR[f.diff] || "#98a2b3"}"></span>
              <span class="gen-fam-t">${esc(f.topic)}</span>
            </button>`).join("")}`).join("");
        box.querySelectorAll(".gen-fam").forEach((b) => b.addEventListener("click", () => {
          pickFamily(b.dataset.f);
        }));
        const on = box.querySelector(".gen-fam.on");
        if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest" });
      }

      /* ---------------- the question card ---------------- */
      function pickFamily(id) {
        st.family = id; st.question = null; st.picked = null; st.stepsShown = 0;
        save({ family: id });
        drawList();
        newQuestion();
      }

      function currentFamily() {
        return (st.family && gen.familyById(st.family)) || gen.families(st.course)[0] || gen.families()[0];
      }

      function newQuestion() {
        const fam = currentFamily();
        if (!fam) { stage.innerHTML = `<div class="empty">No recipes loaded.</div>`; return; }
        st.family = fam.id;
        st.question = gen.instance(fam, null);
        st.picked = null;
        st.stepsShown = 0;
        if (!st.question) { stage.innerHTML = `<div class="card pad"><b>That recipe could not produce an instance.</b></div>`; return; }
        drawQuestion();
        drawList();
      }

      function drawQuestion() {
        const q = st.question;
        const course = gen.courseOf(q.course) || { title: q.course, ink: "#4b3ee0" };
        stage.innerHTML = `
          <article class="gen-card" aria-live="polite">
            <header class="gen-card-h">
              <div class="gen-crumb">${esc(course.title)} <span>/</span> ${esc(q.chapter)} <span>/</span> <b>${esc(q.topic)}</b></div>
              <span class="gen-diff" style="--d:${DIFF_COLOR[q.diff] || "#98a2b3"}">${esc(q.diff)}</span>
            </header>
            <div class="gen-stem">${tex(q.stem)}</div>
            <div class="gen-opts" id="genOpts" role="group" aria-label="Answer options"></div>
            <div class="gen-fb" id="genFb" hidden></div>
            <div class="gen-actions">
              <button class="btn ghost sm" id="genHint">Hint</button>
              <button class="btn ghost sm" id="genSteps">Worked steps</button>
              <button class="btn sm" id="genNew" style="margin-left:auto">New question →</button>
            </div>
            <div class="gen-walk" id="genWalk" hidden></div>
            <div class="gen-hintbox" id="genHintBox" hidden></div>
            <div class="gen-keys">Keys: <kbd>1</kbd>–<kbd>4</kbd> answer · <kbd>N</kbd> new question · <kbd>S</kbd> steps</div>
            <footer class="gen-card-f">
              <span id="genFamNote">${esc(q.topic)} · recipe <code>${esc(q.family)}</code></span>
              <span class="gen-vars" title="the variables rolled for this instance">${Object.entries(q.vars).slice(0, 6).map(([k, v]) => `${esc(k)}=${esc(String(v)).slice(0, 12)}`).join("  ")}</span>
            </footer>
          </article>`;

        const opts = $("#genOpts");
        q.options.forEach((o, i) => {
          const b = U.el("button", { class: "gen-opt", "data-i": i });
          b.innerHTML = `<span class="gen-key">${LETTER[i]}</span><span class="gen-opt-t">${tex(o.html)}</span>`;
          b.addEventListener("click", () => answer(i));
          opts.appendChild(b);
        });

        $("#genNew").addEventListener("click", newQuestion);
        $("#genHint").addEventListener("click", () => {
          const box = $("#genHintBox");
          box.hidden = false;
          const hint = q.hint || (q.steps && q.steps[0]) || "Read the question again and write down what is given and what is asked.";
          box.innerHTML = `<b>Hint.</b> ${tex(hint)}` + (q.hint ? "" : ` <span class="muted">— this is the first step of the worked solution.</span>`);
        });
        $("#genSteps").addEventListener("click", () => {
          st.stepsShown = q.steps.length;
          drawWalk();
        });
      }

      function onKey(e) {
        if (!document.body.contains(wrap)) { document.removeEventListener("keydown", onKey); return; }
        if (/^(input|textarea|select)$/i.test((e.target || {}).tagName || "")) return;
        if (!$("#genSheet").hidden) return;
        const q = st.question;
        if (!q) return;
        if (/^[1-5]$/.test(e.key)) { const i = +e.key - 1; if (i < q.options.length) { answer(i); e.preventDefault(); } }
        else if (/^[a-eA-E]$/.test(e.key)) { const i = "abcde".indexOf(e.key.toLowerCase()); if (i < q.options.length) { answer(i); e.preventDefault(); } }
        else if (e.key === "n" || e.key === "N") { newQuestion(); e.preventDefault(); }
        else if (e.key.toLowerCase() === "s") { st.stepsShown = q.steps.length; drawWalk(); e.preventDefault(); }
      }

      function answer(i) {
        const q = st.question;
        if (!q || st.picked != null) return;
        st.picked = i;
        const ok = q.options[i].ok;
        st.answered++; if (ok) { st.correct++; st.streak++; } else st.streak = 0;
        save({ answered: st.answered, correct: st.correct, streak: st.streak });
        drawStats();

        const btns = U.$$(".gen-opt", $("#genOpts"));
        btns.forEach((b, j) => {
          b.disabled = true;
          if (q.options[j].ok) b.classList.add("ok");
          else if (j === i) b.classList.add("no");
        });
        const fb = $("#genFb");
        fb.hidden = false;
        fb.className = "gen-fb " + (ok ? "ok" : "no");
        fb.innerHTML = ok
          ? `<b>Right.</b> The key is ${LETTER[q.answerIndex]}: ${tex(q.answerText)}. The steps are below.`
          : `<b>Not quite.</b> You picked ${LETTER[i]}; the key is ${LETTER[q.answerIndex]}: ${tex(q.answerText)}.`;
        st.stepsShown = 0;
        drawWalk();
        if (U.sound) { if (ok) U.sound.ok(); else U.sound.no(); }
      }

      function drawWalk() {
        const q = st.question;
        const box = $("#genWalk");
        if (!box || !q) return;
        box.hidden = false;
        const shown = Math.max(st.stepsShown, 1);
        box.innerHTML = `
          <div class="gen-walk-h">
            <b>Worked steps</b>
            <span class="gen-walk-n">${Math.min(shown, q.steps.length)} / ${q.steps.length}</span>
            <button class="btn ghost xs" id="genStepNext">Next step</button>
            <button class="btn ghost xs" id="genStepAll">All</button>
          </div>
          <ol>${q.steps.map((s, i) => (i < shown
            ? `<li class="on">${tex(s)}</li>`
            : `<li class="off"><span class="muted">•••</span></li>`)).join("")}</ol>`;
        box.querySelector("#genStepNext").addEventListener("click", () => {
          if (st.stepsShown < q.steps.length) st.stepsShown++;
          drawWalk();
        });
        box.querySelector("#genStepAll").addEventListener("click", () => { st.stepsShown = q.steps.length; drawWalk(); });
      }

      /* ---------------- worksheet ---------------- */
      function buildSheet(n) {
        const ws = gen.worksheet({ course: st.course, count: n });
        const box = $("#genSheet");
        box.hidden = false;
        box.innerHTML = `
          <div class="gen-sheet-bar no-print">
            <div><b>Worksheet · ${ws.items.length} questions</b><span class="muted small"> · seed ${ws.seed} · every question keyed</span></div>
            <div class="btn-row">
              <button class="btn sm" id="sheetPrint">Print</button>
              <button class="btn ghost sm" id="sheetHtml">Download</button>
              <button class="btn ghost sm" id="sheetClose">Close</button>
            </div>
          </div>
          <div class="gen-sheet-page" id="sheetPage">
            <h1>MathsLab practice sheet</h1>
            <p class="sheet-meta">${esc(st.course ? (gen.courseOf(st.course) || {}).title : "Mixed")} · ${ws.items.length} questions · generated ${new Date().toLocaleDateString()}</p>
            ${ws.items.map((q, i) => `
              <div class="sheet-q">
                <div class="sheet-n">${i + 1}.</div>
                <div class="sheet-b">
                  <div class="sheet-stem">${tex(q.stem)}</div>
                  <div class="sheet-opts">${q.options.map((o, j) => `<span><i>${LETTER[j]})</i> ${tex(o.html)}</span>`).join("")}</div>
                </div>
              </div>`).join("")}
            <div class="sheet-key">
              <h2>Answer key</h2>
              <div class="sheet-key-grid">
                ${ws.items.map((q, i) => `<span><b>${i + 1}</b> ${LETTER[q.answerIndex]} <i>${esc(ML.qdata.plain(q.answerText))}</i></span>`).join("")}
              </div>
            </div>
          </div>`;
        box.querySelector("#sheetClose").addEventListener("click", () => { box.hidden = true; box.innerHTML = ""; });
        box.querySelector("#sheetPrint").addEventListener("click", () => window.print());
        box.querySelector("#sheetHtml").addEventListener("click", () => {
          U.download("mathslab-worksheet-" + ws.seed + ".html",
            `<meta charset="utf-8"><title>MathsLab practice sheet</title>` +
            `<style>body{font:15px/1.5 system-ui,sans-serif;max-width:800px;margin:24px auto;padding:0 16px}` +
            `.sheet-q{display:flex;gap:8px;margin:14px 0}.sheet-n{font-weight:700}.sheet-opts{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:4px}` +
            `.sheet-key{margin-top:28px;border-top:2px solid #333;padding-top:12px}.sheet-key-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}` +
            `h1{font-size:20px}.sheet-meta{color:#666;font-size:13px}</style>` + $("#sheetPage").innerHTML,
            "text/html");
        });
        if (box.scrollIntoView) box.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      /* ---------------- search + boot ---------------- */
      /* 68 recipes — filter straight away, no debounce needed */
      $("#genSearch").addEventListener("input", () => {
        st.q = $("#genSearch").value.trim();
        drawList();
      });
      $("#genSheet10").addEventListener("click", () => buildSheet(10));
      $("#genSheet20").addEventListener("click", () => buildSheet(20));
      $("#genSheet40").addEventListener("click", () => buildSheet(40));

      document.addEventListener("keydown", onKey);
      drawStats();
      drawCourses();
      drawList();
      newQuestion();
    },
  });
})();

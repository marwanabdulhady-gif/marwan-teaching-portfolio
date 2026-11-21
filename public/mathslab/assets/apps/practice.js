/* ===========================================================
   MathsLab — practice & worksheets
   =========================================================== */
(function () {
  "use strict";
  const ML = window.ML, U = ML.u;

  /* record every answered question into shared stats */
  function record(ok) {
    U.store.set("stats:answered", (U.store.get("stats:answered", 0) || 0) + 1);
    if (ok) U.store.set("stats:correct", (U.store.get("stats:correct", 0) || 0) + 1);
  }
  ML.record = record;

  /* =========================================================
     1. SPEED PRACTICE  (SpeedPractice.xlsx)
     ========================================================= */
  const OPS = {
    add: { label: "Addition", sign: "+" },
    sub: { label: "Subtraction", sign: "−" },
    mul: { label: "Multiplication", sign: "×" },
    div: { label: "Division", sign: "÷" },
    sub10: { label: "Subtracting from 10", sign: "−", fixed: 10 },
    sub100: { label: "Subtracting from 100", sign: "−", fixed: 100 },
  };

  function makeProblem(op, lo, hi, rng) {
    const R = rng || Math.random;
    const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
    if (op === "add") { const a = ri(lo, hi), b = ri(lo, hi); return { a, b, op: "+", ans: a + b }; }
    if (op === "sub") { let a = ri(lo, hi), b = ri(lo, hi); if (b > a) [a, b] = [b, a]; return { a, b, op: "−", ans: a - b }; }
    if (op === "mul") { const a = ri(lo, hi), b = ri(lo, hi); return { a, b, op: "×", ans: a * b }; }
    if (op === "div") { const b = Math.max(1, ri(lo, hi)), q = ri(1, hi); return { a: b * q, b, op: "÷", ans: q }; }
    if (op === "sub10") { const b = ri(0, 10); return { a: 10, b, op: "−", ans: 10 - b }; }
    if (op === "sub100") { const b = ri(0, 100); return { a: 100, b, op: "−", ans: 100 - b }; }
    return { a: 1, b: 1, op: "+", ans: 2 };
  }

  ML.register({
    id: "speedpractice", group: "practice", title: "Speed Practice Sheets",
    short: "Speed sheets", icon: ML.icon('bolt'), color: ["#fff6dd", "#93630a"], tag: "Worksheet generator",
    blurb: "Build a fresh page of 32 speed questions in any operation, practise on screen or print it with an answer key.",
    tags: ["SpeedPractice.xlsx", "F9 to refresh", "answer key", "print"],
    mount(root) {
      const st = {
        mode: "on",          // "on" | "print"
        ops: "add",
        lo: 0, hi: 10,
        cols: 4, rows: 8,
        sheet: "questions",  // questions | answers | both
        problems: [],
        seed: Math.floor(Math.random() * 1e9),
      };

      const wrap = U.el("div", { class: "app-layout" });
      wrap.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Worksheet</div>
            <div class="panel-b tight">
              <div class="seg" id="modeSeg">
                <button data-m="on" class="on">Practise</button><button data-m="print">Print</button>
              </div>
              <div class="field">
                <label for="opSel">Operation</label>
                <select id="opSel">
                  <option value="add">Addition</option>
                  <option value="sub">Subtraction</option>
                  <option value="mul">Multiplication</option>
                  <option value="div">Division</option>
                  <option value="sub10">Subtracting from 10</option>
                  <option value="sub100">Subtracting from 100</option>
                </select>
              </div>
              <div class="row2" id="rangeRow">
                <div class="field"><label>From <span class="val" id="loV">0</span></label><input type="range" id="loR" min="0" max="50" value="0"></div>
                <div class="field"><label>To <span class="val" id="hiV">10</span></label><input type="range" id="hiR" min="1" max="100" value="10"></div>
              </div>
              <div class="row2">
                <div class="field"><label>Questions</label>
                  <select id="cntSel"><option>16</option><option selected>32</option><option>40</option><option>48</option><option>64</option></select>
                </div>
                <div class="field"><label>Columns</label>
                  <select id="colSel"><option>2</option><option>3</option><option selected>4</option><option>6</option></select>
                </div>
              </div>
              <button class="btn" id="genBtn">${ML.icon("shuffle")} New sheet <span class="small" style="opacity:.8">(F9)</span></button>
              <div class="hr"></div>
              <label class="check"><input type="checkbox" id="keyChk" checked> Include answer key</label>
              <div class="note">The original refreshed its questions with <span class="kbd">F9</span>. Your page, settings and answers stay here — press <span class="kbd">Enter</span> to jump to the next box.</div>
            </div>
          </div>
          <div class="panel" id="scorePanel">
            <div class="panel-h">This sheet</div>
            <div class="panel-b tight">
              <div class="row2">
                <div class="stat"><span>Score</span><b id="sScore">0</b></div>
                <div class="stat"><span>Time</span><b id="sTime">0:00</b></div>
              </div>
              <div class="progress"><i id="sBar" style="width:0%"></i></div>
              <div class="btn-row">
                <button class="btn sm good" id="checkBtn">${ML.icon("check")} Check answers</button>
                <button class="btn sm ghost" id="revealBtn">Show all</button>
              </div>
            </div>
          </div>
        </aside>
        <div class="stage">
          <div class="sheet" id="sheet"></div>
        </div>`;
      root.appendChild(wrap);

      const sheet = wrap.querySelector("#sheet");
      const opSel = wrap.querySelector("#opSel");
      const loR = wrap.querySelector("#loR"), hiR = wrap.querySelector("#hiR");
      const loV = wrap.querySelector("#loV"), hiV = wrap.querySelector("#hiV");
      const cntSel = wrap.querySelector("#cntSel"), colSel = wrap.querySelector("#colSel");

      U.$$("#modeSeg button", wrap).forEach((b) => b.addEventListener("click", () => {
        st.mode = b.dataset.m;
        U.$$("#modeSeg button", wrap).forEach((x) => x.classList.toggle("on", x === b));
        build();
      }));
      opSel.addEventListener("change", () => {
        st.ops = opSel.value;
        const fixed = OPS[st.ops].fixed;
        wrap.querySelector("#rangeRow").style.opacity = fixed ? ".45" : "1";
        wrap.querySelector("#rangeRow").style.pointerEvents = fixed ? "none" : "auto";
        build();
      });
      loR.addEventListener("input", () => { st.lo = +loR.value; loV.textContent = st.lo; if (+hiR.value <= st.lo) { hiR.value = st.lo + 1; st.hi = st.lo + 1; hiV.textContent = st.hi; } build(); });
      hiR.addEventListener("input", () => { st.hi = +hiR.value; hiV.textContent = st.hi; if (+loR.value >= st.hi) { loR.value = Math.max(0, st.hi - 1); st.lo = +loR.value; loV.textContent = st.lo; } build(); });
      cntSel.addEventListener("change", build);
      colSel.addEventListener("change", build);
      wrap.querySelector("#keyChk").addEventListener("change", build);
      wrap.querySelector("#genBtn").addEventListener("click", () => { st.seed = Math.floor(Math.random() * 1e9); build(); U.sound.click(); });
      document.addEventListener("keydown", (e) => {
        if (e.key === "F9" && document.body.contains(sheet)) { e.preventDefault(); st.seed = Math.floor(Math.random() * 1e9); build(); }
      });
      wrap.querySelector("#checkBtn").addEventListener("click", checkAll);
      wrap.querySelector("#revealBtn").addEventListener("click", revealAll);

      let startTime = null, timerId = null;
      function tick() {
        if (!startTime) return;
        const s = Math.floor((Date.now() - startTime) / 1000);
        const el = wrap.querySelector("#sTime");
        if (el) el.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
      }
      let answered = 0, correct = 0;

      function build() {
        const n = +cntSel.value;
        st.cols = +colSel.value;
        const rngGen = U.rng(st.seed);
        st.problems = [];
        for (let i = 0; i < n; i++) st.problems.push(makeProblem(st.ops, st.lo, st.hi, rngGen));
        answered = 0; correct = 0;
        if (timerId) clearInterval(timerId);
        startTime = null;
        const tEl = wrap.querySelector("#sTime"); if (tEl) tEl.textContent = "0:00";
        const sEl = wrap.querySelector("#sScore"); if (sEl) sEl.textContent = "0";
        const bEl = wrap.querySelector("#sBar"); if (bEl) bEl.style.width = "0%";
        render();
        startTime = Date.now();
        timerId = setInterval(tick, 500);
      }

      function render() {
        const op = OPS[st.ops];
        const title = `Practising ${op.label} for Speed`;
        const key = wrap.querySelector("#keyChk").checked && st.mode === "print";
        const cells = st.problems.map((p, i) => {
          const ans = st.mode === "on"
            ? `<span class="ans"><input type="text" inputmode="numeric" autocomplete="off" data-i="${i}" aria-label="Question ${i + 1} answer"></span>`
            : `<span class="ans"></span>`;
          return `<div class="prob" data-i="${i}"><span class="num">${p.a}</span><span class="op">&nbsp;${p.op}&nbsp;</span><span class="num">${p.b}</span><span class="op">&nbsp;=&nbsp;</span>${ans}</div>`;
        }).join("");
        const keyRows = st.problems.map((p, i) => `<span>${i + 1}. ${p.ans}</span>`).join("");
        sheet.innerHTML = `
          <div class="sheet-head">
            <div class="name">Name: <i>&nbsp;</i></div>
            <div class="name" style="max-width:190px">Date: <i>&nbsp;</i></div>
            <div class="name" style="max-width:150px">Score: <i style="width:100%">&nbsp;</i></div>
          </div>
          <h2>${title}</h2>
          <div class="sheet-sub">${op.label} · numbers ${op.fixed ? `to ${op.fixed}` : st.lo + " to " + st.hi} · ${st.problems.length} questions${st.mode === "print" ? " · time:" : ""}</div>
          <div class="prob-grid" style="grid-template-columns:repeat(${st.cols},minmax(0,1fr))">${cells}</div>
          ${key ? `<div class="answerkey"><h4>Answer key</h4><div class="ak-grid">${keyRows}</div></div>` : ""}`;

        U.$$("input", sheet).forEach((inp) => {
          inp.addEventListener("input", () => {
            const i = +inp.dataset.i, p = st.problems[i];
            const box = inp.closest(".prob");
            box.classList.remove("ok-ans", "bad-ans");
            if (inp.value === "") return;
            const val = parseInt(inp.value, 10);
            if (val === p.ans) { box.classList.add("ok-ans"); U.sound.ok(); correct++; answered++; record(true); }
            else if (inp.value.length >= String(p.ans).length) { box.classList.add("bad-ans"); U.sound.no(); answered++; record(false); }
          });
          inp.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const all = U.$$("input", sheet);
              const idx = all.indexOf(inp);
              const nx = all[idx + 1];
              if (nx) nx.focus(); else checkAll();
            }
          });
        });
      }

      function checkAll() {
        let ok = 0, done = 0;
        U.$$("input", sheet).forEach((inp) => {
          const p = st.problems[+inp.dataset.i];
          const box = inp.closest(".prob");
          box.classList.remove("ok-ans", "bad-ans");
          if (inp.value.trim() === "") return;
          done++;
          if (parseInt(inp.value, 10) === p.ans) { box.classList.add("ok-ans"); ok++; }
          else box.classList.add("bad-ans");
        });
        const pct = Math.round((ok / st.problems.length) * 100);
        wrap.querySelector("#sScore").textContent = `${ok}/${st.problems.length}`;
        wrap.querySelector("#sBar").style.width = pct + "%";
        if (timerId) clearInterval(timerId);
        scoreTally(ok, st.problems.length, done);
      }
      function scoreTally(ok, total, done) {
        if (done === 0) { ML.toast("Answer some questions first"); return; }
        if (ok === total) { U.sound.win(); ML.toast(`Perfect score! ${ok}/${total}`, "ok"); }
        else ML.toast(`${ok} correct out of ${total}`, ok / total >= 0.7 ? "ok" : "no");
      }
      function revealAll() {
        U.$$("input", sheet).forEach((inp) => {
          const p = st.problems[+inp.dataset.i];
          inp.value = p.ans; inp.closest(".prob").classList.remove("bad-ans"); inp.closest(".prob").classList.add("ok-ans");
        });
        wrap.querySelector("#sBar").style.width = "100%";
        wrap.querySelector("#sScore").textContent = `${st.problems.length}/${st.problems.length}`;
      }

      build();
    },
  });

  /* =========================================================
     2. TIMES TABLES MASTER  (Times Tables Master.exe)
     ========================================================= */
  ML.register({
    id: "timestables", group: "practice", title: "Times Tables Master",
    short: "Times tables", icon: ML.icon('cross'), color: ["#fdeaf4", "#a81a6b"], tag: "Drill",
    blurb: "Pick the tables you are learning and race the clock. Builds recall for 2s to 12s and keeps your best score.",
    tags: ["Times Tables Master.exe", "2–12", "60-second challenge", "high score"],
    mount(root) {
      const st = {
        tables: U.store.get("tt:tables", [2, 3, 5, 10]),
        reversed: U.store.get("tt:rev", false),
        best: U.store.get("tt:best", 0),
        running: false, timeLeft: 60, score: 0, streak: 0, bestStreak: 0, q: null, wrong: [],
      };
      const wrap = U.el("div", { class: "app-layout" });
      wrap.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Which tables?</div>
            <div class="panel-b tight">
              <div id="tableChips" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px"></div>
              <div class="btn-row">
                <button class="btn xs ghost" id="allTables">All 2–12</button>
                <button class="btn xs ghost" id="clearTables">Clear</button>
              </div>
              <label class="check"><input type="checkbox" id="revChk"> Ask backwards (12 × ? = 84)</label>
            </div>
          </div>
          <div class="panel">
            <div class="panel-h">Records</div>
            <div class="panel-b tight">
              <div class="row2">
                <div class="stat"><span>Best score</span><b id="bestScore">0</b></div>
                <div class="stat"><span>Best streak</span><b id="bestStreak">0</b></div>
              </div>
              <div class="note">60 seconds per round. Answer with the number keys and press <span class="kbd">Enter</span>.</div>
            </div>
          </div>
        </aside>
        <div class="stage">
          <div class="panel" style="overflow:hidden">
            <div class="panel-h"><span>Round</span><span class="mono" id="clock">1:00</span></div>
            <div style="padding:22px">
              <div class="progress" style="margin-bottom:20px"><i id="timeBar" style="width:100%"></i></div>
              <div id="playArea"></div>
            </div>
          </div>
          <div class="card" style="margin-top:16px" id="reviewCard"></div>
        </div>`;
      root.appendChild(wrap);

      const chips = wrap.querySelector("#tableChips");
      for (let t = 2; t <= 12; t++) {
        const b = U.el("button", { class: "btn sm " + (st.tables.includes(t) ? "soft" : "ghost") }, t + "×");
        b.dataset.t = t;
        b.addEventListener("click", () => {
          const i = st.tables.indexOf(t);
          if (i >= 0) st.tables.splice(i, 1); else st.tables.push(t);
          st.tables.sort((a, b2) => a - b2);
          U.store.set("tt:tables", st.tables);
          b.className = "btn sm " + (st.tables.includes(t) ? "soft" : "ghost");
        });
        chips.appendChild(b);
      }
      wrap.querySelector("#allTables").addEventListener("click", () => {
        st.tables = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; U.store.set("tt:tables", st.tables);
        U.$$("#tableChips button", wrap).forEach((b) => b.className = "btn sm soft");
      });
      wrap.querySelector("#clearTables").addEventListener("click", () => {
        st.tables = []; U.store.set("tt:tables", st.tables);
        U.$$("#tableChips button", wrap).forEach((b) => b.className = "btn sm ghost");
      });
      const rev = wrap.querySelector("#revChk"); rev.checked = st.reversed;
      rev.addEventListener("change", () => { st.reversed = rev.checked; U.store.set("tt:rev", st.reversed); });

      const play = wrap.querySelector("#playArea");
      const review = wrap.querySelector("#reviewCard");
      wrap.querySelector("#bestScore").textContent = st.best;
      wrap.querySelector("#bestStreak").textContent = U.store.get("tt:beststreak", 0);

      function drawIdle() {
        play.innerHTML = `
          <div style="text-align:center;padding:30px 10px">
            <div style="font-size:52px;line-height:1;color:#a81a6b">${ML.icon("cross")}</div>
            <h2 style="margin-top:12px">Ready when you are</h2>
            <p class="muted" style="max-width:44ch;margin:6px auto 18px">Choose your tables on the left, then start. You get 60 seconds — every answer keeps the streak alive.</p>
            <button class="btn lg" id="startBtn">${ML.icon("play")} Start 60-second round</button>
          </div>`;
        play.querySelector("#startBtn").addEventListener("click", start);
        review.innerHTML = "";
      }
      function nextQuestion() {
        if (!st.tables.length) st.tables = [2, 3, 4, 5];
        const t = U.pick(st.tables), m = U.randInt(1, 12);
        if (st.reversed) {
          const prod = t * m;
          st.q = { text: `${prod} ÷ ${t} =`, ans: m, shown: `${prod} ÷ ${t}` };
        } else {
          st.q = { text: `${t} × ${m} =`, ans: t * m, shown: `${t} × ${m}` };
        }
        play.innerHTML = `
          <div style="text-align:center">
            <div class="mono" id="qText" style="font-size:clamp(34px,7vw,58px);font-weight:850;letter-spacing:-.03em">${st.q.text}</div>
            <div style="display:flex;justify-content:center;gap:10px;margin-top:18px">
              <input id="ansBox" type="text" inputmode="numeric" autocomplete="off" aria-label="Your answer"
                style="max-width:190px;text-align:center;font-size:30px;font-weight:800;padding:10px;font-family:var(--fm)">
            </div>
            <div style="display:flex;justify-content:center;gap:26px;margin-top:26px;flex-wrap:wrap">
              <div class="stat" style="min-width:104px"><span>Score</span><b id="sc">${st.score}</b></div>
              <div class="stat" style="min-width:104px"><span>Streak</span><b id="sk">${st.streak}</b></div>
            </div>
            <div id="fb" class="small" style="height:22px;margin-top:12px;font-weight:700"></div>
          </div>`;
        const box = play.querySelector("#ansBox");
        box.focus();
        box.addEventListener("input", () => {
          const v = parseInt(box.value, 10);
          if (!isFinite(v)) return;
          if (v === st.q.ans) {
            st.score++; st.streak++; st.bestStreak = Math.max(st.bestStreak, st.streak);
            U.sound.ok(); record(true);
            play.querySelector("#sc").textContent = st.score;
            play.querySelector("#sk").textContent = st.streak;
            nextQuestion();
          } else if (box.value.length >= String(st.q.ans).length) {
            const fb = play.querySelector("#fb");
            if (!fb.textContent) {
              fb.textContent = `Not quite — try again`;
              fb.style.color = "var(--red)";
              st.wrong.push({ q: st.q.shown, ans: st.q.ans });
              U.sound.no(); record(false);
              st.streak = 0;
              play.querySelector("#sk").textContent = "0";
              box.select();
            }
          }
        });
        box.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && box.value === "") play.querySelector("#fb").textContent = "";
        });
      }
      function start() {
        if (!st.tables.length) { ML.toast("Pick at least one table", "no"); return; }
        st.running = true; st.timeLeft = 60; st.score = 0; st.streak = 0; st.bestStreak = 0; st.wrong = [];
        review.innerHTML = "";
        nextQuestion();
        const started = Date.now();
        const iv = setInterval(() => {
          if (!st.running) { clearInterval(iv); return; }
          st.timeLeft = 60 - (Date.now() - started) / 1000;
          if (st.timeLeft <= 0) { clearInterval(iv); end(); return; }
          wrap.querySelector("#clock").textContent = "0:" + String(Math.ceil(st.timeLeft)).padStart(2, "0");
          wrap.querySelector("#timeBar").style.width = (st.timeLeft / 60) * 100 + "%";
        }, 120);
      }
      function end() {
        st.running = false;
        wrap.querySelector("#clock").textContent = "0:00";
        wrap.querySelector("#timeBar").style.width = "0%";
        const isBest = st.score > st.best;
        if (isBest) { st.best = st.score; U.store.set("tt:best", st.best); }
        if (st.bestStreak > U.store.get("tt:beststreak", 0)) U.store.set("tt:beststreak", st.bestStreak);
        wrap.querySelector("#bestScore").textContent = st.best;
        wrap.querySelector("#bestStreak").textContent = U.store.get("tt:beststreak", 0);
        play.innerHTML = `
          <div style="text-align:center;padding:16px 8px">
            <div style="font-size:44px;color:${isBest ? "#b07a06" : "#475467"}">${ML.icon(isBest ? "trophy" : "clock")}</div>
            <h2 style="margin-top:8px">${isBest ? "New best score!" : "Time's up"}</h2>
            <p class="muted">You answered <b>${st.score}</b> correctly with a best streak of <b>${st.bestStreak}</b>.</p>
            <button class="btn lg" id="againBtn">${ML.icon("undo")} Go again</button>
          </div>`;
        play.querySelector("#againBtn").addEventListener("click", start);
        U.sound.win();
        if (st.wrong.length) {
          review.innerHTML = `<div class="card-h"><h2>Worth another look</h2><span class="small muted">${st.wrong.length} slip${st.wrong.length > 1 ? "s" : ""}</span></div>
            <div class="card-b"><div class="btn-row">${st.wrong.slice(0, 12).map((w) => `<span class="badge no">${w.q} = ${w.ans}</span>`).join("")}</div></div>`;
        }
      }
      drawIdle();
    },
  });

  /* =========================================================
     3. TIMES TABLE SHEETS  (Application Files — printable grids)
     ========================================================= */
  ML.register({
    id: "tablesheets", group: "practice", title: "Times Table Sheets",
    short: "Table sheets", icon: ML.icon('grid'), color: ["#e8f1ff", "#1a58b8"], tag: "Printable",
    blurb: "Print fill-in times-table grids, 1 to 12, with or without answers — ideal for a starter or homework.",
    tags: ["Application Files", "printable", "grid practice", "1–12"],
    mount(root) {
      const st = { tables: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], answers: false, order: "up", count: 3 };
      const wrap = U.el("div", { class: "app-layout" });
      wrap.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Sheets</div>
            <div class="panel-b tight">
              <label class="check"><input type="checkbox" id="ansChk"> Show answers</label>
              <div class="seg" id="ordSeg"><button data-o="up" class="on">1 &rarr; 12</button><button data-o="mixed">Mixed</button></div>
              <div class="field"><label>Tables per page</label>
                <select id="cntSel"><option>1</option><option>2</option><option selected>3</option><option>4</option></select>
              </div>
              <div class="field"><label>Which tables</label>
                <div id="chips" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:2px"></div>
              </div>
              <button class="btn" onclick="window.print()">${ML.icon("print")} Print these sheets</button>
            </div>
          </div>
          <div class="panel"><div class="panel-h">Tip</div>
            <div class="panel-b tight"><div class="note">Great routine: 3 minutes silent, 1 minute paired checking, then chant the table you found hardest.</div></div>
          </div>
        </aside>
        <div class="stage"><div id="sheets"></div></div>`;
      root.appendChild(wrap);
      const chips = wrap.querySelector("#chips");
      for (let t = 1; t <= 12; t++) {
        const b = U.el("button", { class: "btn sm soft", style: { padding: "6px 0" } }, t);
        b.dataset.t = t;
        b.addEventListener("click", () => {
          const i = st.tables.indexOf(t);
          if (i >= 0) st.tables.splice(i, 1); else st.tables.push(t);
          st.tables.sort((a, b2) => a - b2);
          b.className = "btn sm " + (st.tables.includes(t) ? "soft" : "ghost");
          draw();
        });
        chips.appendChild(b);
      }
      wrap.querySelector("#ansChk").addEventListener("change", (e) => { st.answers = e.target.checked; draw(); });
      wrap.querySelector("#cntSel").addEventListener("change", (e) => { st.count = +e.target.value; draw(); });
      U.$$("#ordSeg button", wrap).forEach((b) => b.addEventListener("click", () => {
        st.order = b.dataset.o;
        U.$$("#ordSeg button", wrap).forEach((x) => x.classList.toggle("on", x === b));
        draw();
      }));

      function draw() {
        const host = wrap.querySelector("#sheets");
        const tables = st.tables.slice(0, st.count);
        if (!tables.length) { host.innerHTML = `<div class="empty card">Choose at least one table.</div>`; return; }
        host.innerHTML = tables.map((t) => {
          const rows = U.range(1, 12).map((n) => {
            const a = st.order === "up" ? n : U.randInt(1, 12);
            return `<tr><td style="font-weight:800">${t} × ${a} =</td><td style="width:45%">${st.answers ? `<b style="color:var(--brand-ink)">${t * a}</b>` : `<span style="display:block;border-bottom:1px solid #98a2b3;height:1.1em"></span>`}</td></tr>`;
          }).join("");
          return `<div class="sheet" style="margin-bottom:18px">
            <div class="sheet-head">
              <div class="name">Name: <i>&nbsp;</i></div>
              <div class="name" style="max-width:170px">Date: <i>&nbsp;</i></div>
            </div>
            <h2>The ${t}× table</h2>
            <div class="sheet-sub">${st.answers ? "Answers shown" : "Fill in each product"}</div>
            <table class="data" style="font-size:15px">${rows}</table>
          </div>`;
        }).join("");
      }
      draw();
    },
  });
})();

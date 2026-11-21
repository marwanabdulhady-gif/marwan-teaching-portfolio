/* ===========================================================
   MathsLab — the Maths Arcade
   The Maths Arcade. The six board/clock/reflex modes live here
   (Science Bingo, Quiz Race, Comet Catch, Memory Cards, Rapid Sort,
   Timeline Build); the other fifteen are in arcade2.js. All of them
   came from the EduMagnet library in the Drive folder with the science
   swapped for mathematics. Every question is generated live by
   assets/generator.js, so the decks never run out and every answer is
   keyed; all the art is inline SVG from assets/arcade-art.js.

   Deep links:  #/arcade            the arcade floor
                #/arcade/<game>     bingo · race · comets · memory · sort · steps
   =========================================================== */
(function () {
  "use strict";
  const ML = window.ML, U = ML.u;
  const RAF = (cb) => (window.requestAnimationFrame ? window.requestAnimationFrame(cb) : setTimeout(() => cb(), 16));
  const NOW = () => (window.performance && window.performance.now ? window.performance.now() : Date.now());
  const tex = (s) => ML.qdata.html(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const shuffle = (a) => { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = x[i]; x[i] = x[j]; x[j] = t; } return x; };

  /* ---------------------------------------------------------
     1. the deck — every question comes from the generator
     --------------------------------------------------------- */
  const COURSES = [
    { id: "", label: "Mixed" },
    { id: "a1", label: "Algebra 1" },
    { id: "a2", label: "Algebra 2" },
    { id: "geo", label: "Geometry" },
    { id: "p11", label: "Precalculus" },
    { id: "c12", label: "Calculus" },
    { id: "c1", label: "Course 1" },
    { id: "c2", label: "Course 2" },
  ];
  const courseId = () => U.store.get("arcade:course", "") || "";
  const setCourse = (id) => { U.store.set("arcade:course", id || ""); };
  const familiesFor = (c) => (ML.gen ? ML.gen.families(c || "") : []);

  /** one fresh instance from a random recipe of the chosen course */
  function pick(course, filter) {
    const fams = familiesFor(course).filter(filter || (() => true));
    if (!fams.length) return null;
    const fam = fams[ri(0, fams.length - 1)];
    return ML.gen.instance(fam, ri(1, 1e9)) || null;
  }
  /** n instances with distinct answer text (so a board or option row never repeats) */
  function deck(course, n, filter) {
    const out = [], seen = new Set();
    for (let tries = 0; tries < n * 60 && out.length < n; tries++) {
      const q = pick(course, filter);
      if (!q) break;
      const key = String(q.answerText).replace(/\s+/g, " ").trim();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(q);
    }
    return out;
  }
  const qStem = (q) => `<div class="ar-q">${tex(q.stem)}</div>`;
  const qOpt = (q, i) => tex(q.options[i].html);

  const best = (id) => U.store.get("arcade:best:" + id, 0) || 0;
  const setBest = (id, score) => { if (score > best(id)) { U.store.set("arcade:best:" + id, score); return true; } return false; };

  /* ---------------------------------------------------------
     2. bits every game shares: HUD, overlay, confetti, sound
     --------------------------------------------------------- */
  function shell(host, game) {
    host.innerHTML = `
      <nav class="co-crumb"><a href="#/arcade">Maths Arcade</a><span>/</span><b>${esc(game.title)}</b></nav>
      <header class="ar-head">
        <div>
          <div class="eyebrow">${esc(game.kicker || "Arcade")}</div>
          <h1>${esc(game.title)}</h1>
          <p class="muted small">${game.blurb}</p>
        </div>
        <div class="ar-head-side">
          <div class="ar-best"><span>Best</span><b id="arBest">${best(game.id)}</b></div>
          <button class="btn ghost sm ar-fs" id="arFs" aria-pressed="false" title="Full-screen board — Esc to come back">
            <span aria-hidden="true">⤢</span><span class="ar-fs-txt">Full screen</span>
          </button>
        </div>
      </header>
      <div class="ar-hud" id="arHud"></div>
      <div class="ar-stage" id="arStage"></div>
      <div class="ar-foot">
        <button class="btn ghost sm" id="arRestart">↻ Restart</button>
        <a class="btn ghost sm" href="#/arcade">All games</a>
        <span class="muted small" id="arNote"></span>
      </div>`;
    const stage = host.querySelector("#arStage");
    const hud = host.querySelector("#arHud");
    const api = {
      stage, hud, host,
      fields: {},
      /* HUD chips: api.hud({ Score: 0, Time: 60 }) — later calls update in place */
      setHud(obj) {
        Object.assign(api.fields, obj);
        const keys = Object.keys(api.fields);
        if (hud.children.length !== keys.length) {
          hud.innerHTML = keys.map((k) => `<div class="ar-chip"><span>${esc(k)}</span><b data-k="${esc(k)}">—</b></div>`).join("");
        }
        keys.forEach((k) => {
          const b = hud.querySelector('[data-k="' + k + '"]');
          if (!b) return;
          const val = String(api.fields[k]);
          if (val.indexOf("<svg") !== -1) { if (b.innerHTML !== val) b.innerHTML = val; }
          else if (b.textContent !== val) b.textContent = val;
        });
      },
      note(text) { const n = host.querySelector("#arNote"); if (n) n.textContent = text || ""; },
      /* the end-of-round card, styled after the EduMagnet overlay */
      over(o) {
        [...stage.querySelectorAll(".ar-over")].forEach((n) => n.remove());
        const box = el("div", "ar-over" + (o.win ? " is-win" : ""));
        box.innerHTML = `
          <div class="ar-over-card">
            <div class="ar-over-icon">${ML.art.big(o.icon || (o.win ? "star" : "clock"), 46)}</div>
            <div class="eyebrow">${esc(o.kicker || (o.win ? "Round complete" : "Time's up"))}</div>
            <h2>${esc(o.title || (o.win ? "Nice run!" : "Round over"))}</h2>
            <p>${o.message || ""}</p>
            ${o.score != null ? `<div class="ar-over-score">${esc(o.score)}</div>` : ""}
            <div class="ar-over-btns">
              <button class="btn lg" id="arAgain">${esc(o.button || "Play again")}</button>
              <a class="btn ghost lg" href="#/arcade">All games</a>
            </div>
          </div>`;
        stage.appendChild(box);
        const again = box.querySelector("#arAgain");
        if (again) again.addEventListener("click", () => { box.remove(); if (o.onAgain) o.onAgain(); });
        if (o.win) { U.sound.win(); confetti(stage); }
        else U.sound.thud();
        return box;
      },
      finish(score) {
        const record = setBest(game.id, score);
        const b = host.querySelector("#arBest");
        if (b) b.textContent = String(best(game.id));
        return record;
      },
    };
    const restart = host.querySelector("#arRestart");
    if (restart) restart.addEventListener("click", () => { ML.route(); });

    /* the board can take the whole screen — every EduMagnet game had a
       "fullscreen board" control, and the boards need the room */
    const fsBtn = host.querySelector("#arFs");
    const stageEl = host.querySelector("#arStage");
    const setFull = (on) => {
      if (!stageEl || !fsBtn) return;
      stageEl.classList.toggle("is-full", on);
      document.body.classList.toggle("ar-fs-lock", on);
      fsBtn.setAttribute("aria-pressed", String(on));
      const t = fsBtn.querySelector(".ar-fs-txt");
      if (t) t.textContent = on ? "Exit board" : "Full screen";
      if (on) { try { stageEl.scrollIntoView({ block: "start" }); } catch (e) {} }
    };
    if (fsBtn) {
      fsBtn.addEventListener("click", () => setFull(!stageEl.classList.contains("is-full")));
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && stageEl.classList.contains("is-full")) setFull(false);
      });
    }
    api.setFull = setFull;

    /* ---- one reaction seam for every mode -------------------------------
       Every tap in a game should answer back: a burst and a "+N" float when
       the answer lands, a shake and a red wash when it misses, a small ring
       for anything else (flip, spin, open, hint). The modes all mark their
       own nodes with ok/no (or is-pop / is-miss) so this can live here once
       instead of in twenty-one places. */
    const scoreNow = () => {
      const n = hud.querySelector('[data-k="Score"]');
      if (!n) return 0;
      const v = Number(String(n.textContent).replace(/[^\d-]/g, ""));
      return Number.isFinite(v) ? v : 0;
    };
    const HITS = ".ar-opt, .ar-cell, .ar-bubble, .ar-crate, .ar-mcard, .ar-tile, .ar-stile, " +
      ".ar-ptile, .ar-comet, .ar-magnet, .ar-gcard, .ar-bin, .ar-bucket, .ar-step, .ar-leap-card, " +
      ".ar-floe, .ar-deck-card, .ar-group-card, .ar-zap-btn, .ar-fc-card, .ar-flashcard, .ar-fc-btns button, " +
      ".ar-wheel-svg, .ar-wheel-go, button.btn";
    stage.addEventListener("click", (e) => {
      const FX = (window.ML && ML.fx) || null;
      if (!FX) return;
      const t = e.target;
      const hit = t && t.closest ? t.closest(HITS) : null;
      if (!hit || !stage.contains(hit)) return;
      /* an anchor that survives the tap: crates, pairs and the step pool
         rebuild their grid on click, so the node is gone by the time we
         look — the burst then lands on the board instead of nowhere */
      const before = scoreNow();
      setTimeout(() => {
        const live2 = hit.isConnected ? hit : stage;
        const cl = hit.classList;
        const ok = cl.contains("ok") || cl.contains("is-pop") || cl.contains("is-correct") ||
          cl.contains("is-won") || cl.contains("is-done") || cl.contains("is-zapped") ||
          cl.contains("is-swept") || cl.contains("is-hop") || cl.contains("is-marked") || cl.contains("is-open");
        const no = cl.contains("no") || cl.contains("is-no") || cl.contains("is-miss") ||
          cl.contains("is-wrong") || cl.contains("is-slip") || cl.contains("is-off") || cl.contains("is-burn");
        const gain = scoreNow() - before;
        if (no) { FX.shake(stage); FX.flash(stage, "bad"); return; }
        if (ok || gain > 0) {
          FX.burst(live2);
          if (gain > 0) FX.float(live2, "+" + gain);
          FX.ring(live2);
          return;
        }
        FX.ring(live2);
      }, 40);
    }, true);

    return api;
  }

  function confetti(stage) {
    if (!stage || stage.querySelector(".ar-confetti")) return;
    const box = el("div", "ar-confetti");
    for (let i = 0; i < 26; i++) {
      const bit = el("i");
      bit.style.left = ri(2, 98) + "%";
      bit.style.animationDelay = (Math.random() * 0.6).toFixed(2) + "s";
      bit.style.background = ["#6d5efc", "#0f9d94", "#e8a008", "#1fa45b", "#e5484d"][i % 5];
      box.appendChild(bit);
    }
    stage.appendChild(box);
    setTimeout(() => box.remove(), 2600);
  }

  /* the option row used by race / comets / memory */
  function optionRow(q, onAnswer) {
    const row = el("div", "ar-opts");
    q.options.forEach((o, i) => {
      const b = el("button", "ar-opt");
      b.type = "button";
      b.dataset.i = String(i);
      b.innerHTML = `<span class="ar-opt-k">${"ABCD"[i]}</span><span class="ar-opt-t">${tex(o.html)}</span>`;
      b.addEventListener("click", () => onAnswer(i, b));
      row.appendChild(b);
    });
    return row;
  }

  function markOptions(row, q, picked) {
    [...row.querySelectorAll(".ar-opt")].forEach((b) => {
      const i = Number(b.dataset.i);
      b.disabled = true;
      if (q.options[i].ok) b.classList.add("ok");
      else if (i === picked) b.classList.add("no");
    });
  }

  /* ---------------------------------------------------------
     3. BINGO — ported from Science Bingo
        3×3 board of answers, one prompt at a time, a line wins
     --------------------------------------------------------- */
  const bingo = {
    id: "bingo", src: "Science Bingo", twist: "3×3 board of <b>answers</b>; the prompt is a generated question, so the board is a value-matching puzzle", cat: "Board & cards", title: "Maths Bingo", kicker: "Board game",
    blurb: "A 3×3 board of answers. Solve the prompt, tap the cell that holds the answer, and complete a line to call bingo.",
    icon: "bingo",
    play(host) {
      const api = shell(host, bingo);
      const SIZE = 3;
      let qs = [], board = [], marked = [], queue = [], score = 0, idx = 0, lock = false, done = false;

      function build() {
        qs = deck(courseId(), SIZE * SIZE);
        if (qs.length < SIZE * SIZE) { api.stage.innerHTML = `<p class="muted">Not enough recipes for this course.</p>`; return; }
        board = shuffle(qs.map((q) => String(q.answerText)));
        marked = new Array(SIZE * SIZE).fill(false);
        queue = shuffle(qs.concat(qs.slice(0, 3)));
        score = 0; idx = 0; lock = false; done = false;
        api.stage.innerHTML = `
          <div class="ar-bingo">
            <div class="ar-bingo-prompt">
              <div class="eyebrow">Prompt</div>
              <div id="arBPrompt" class="ar-prompt"></div>
              <div class="ar-fb" id="arBFb">Tap the cell with the answer.</div>
            </div>
            <div class="ar-board" id="arBBoard" style="--n:${SIZE}"></div>
          </div>`;
        const grid = api.stage.querySelector("#arBBoard");
        board.forEach((label, i) => {
          const b = el("button", "ar-cell");
          b.type = "button";
          b.innerHTML = tex(label);
          b.setAttribute("aria-label", "Bingo cell " + (i + 1));
          b.addEventListener("click", () => pickCell(i));
          grid.appendChild(b);
        });
        nextPrompt();
        paint();
      }
      const norm = (t) => String(t == null ? "" : t).replace(/\s+/g, " ").trim().toLowerCase();
      const spotOf = (q) => board.findIndex((b) => norm(b) === norm(q.answerText));
      /* always ask a prompt whose cell is still open, so no question is wasted */
      function nextPrompt() {
        for (let tries = 0; tries < queue.length + 2; tries++) {
          const q = queue[idx % queue.length];
          const at = q ? spotOf(q) : -1;
          if (q && at >= 0 && !marked[at]) return;
          idx++;
        }
      }
      function paint() {
        const q = queue[idx % queue.length];
        const cells = [...api.stage.querySelectorAll(".ar-cell")];
        cells.forEach((c, i) => c.classList.toggle("is-marked", !!marked[i]));
        const prompt = api.stage.querySelector("#arBPrompt");
        if (prompt) prompt.innerHTML = q ? qStem(q) : "";
        api.setHud({ Score: score, Marked: marked.filter(Boolean).length + "/9", Prompt: Math.min(idx + 1, queue.length) + "/" + queue.length });
      }
      function line() {
        const L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        return L.some((ln) => ln.every((c) => marked[c]));
      }
      function pickCell(i) {
        if (lock || done || marked[i]) return;
        const q = queue[idx % queue.length];
        if (!q) return;
        const cell = api.stage.querySelectorAll(".ar-cell")[i];
        const fb = api.stage.querySelector("#arBFb");
        if (spotOf(q) === i) {
          marked[i] = true; score += 100;
          cell.classList.add("is-marked", "pop");
          U.sound.ok();
          if (fb) fb.innerHTML = `<b style="color:#1fa45b">Correct</b> — cell marked.` + (q.hint ? ` <span class="muted">${tex(q.hint)}</span>` : "");
          paint();
          if (line()) { win(); return; }
          lock = true;
          setTimeout(() => {
            lock = false;
            idx++;
            if (idx >= queue.length) { idx = 0; queue = shuffle(queue); }
            nextPrompt();
            paint();
            const box = api.stage.querySelector("#arBFb");
            if (box) box.textContent = "Tap the cell with the answer.";
          }, 650);
        } else {
          score = Math.max(0, score - 20);
          cell.classList.add("is-miss");
          setTimeout(() => cell.classList.remove("is-miss"), 450);
          U.sound.no();
          if (fb) fb.innerHTML = `<b style="color:#e5484d">Not that cell</b> — ${tex(q.hint || "work the prompt out again.")}`;
          paint();
        }
      }
      function win() {
        done = true;
        const record = api.finish(score);
        api.over({ win: true, icon: "bingo", kicker: "Bingo!", title: "Line complete!", message: (record ? "New best score. " : "") + "You marked " + marked.filter(Boolean).length + " cells.", score: score + " pts", onAgain: build });
      }
      build();
      return {
        get board() { return board.slice(); },
        get queue() { return queue.slice(); },
        get prompt() { return queue[idx]; },
        get marked() { return marked.slice(); },
        get score() { return score; },
        clickCell: (i) => pickCell(i),
        /* uniform test/QA hooks: do the right thing, or a deliberately wrong one */
        solve() {
          const q = queue[idx % queue.length]; if (!q) return;
          const at = spotOf(q); if (at >= 0) pickCell(at);
        },
        miss() {
          const q = queue[idx % queue.length]; if (!q) return;
          const at = board.findIndex((b, i) => !marked[i] && i !== spotOf(q));
          if (at >= 0) pickCell(at);
        },
      };
    },
  };

  /* ---------------------------------------------------------
     4. QUIZ RACE — ported from Quiz Race
        60 seconds, streak multiplier, a runner that moves per answer
     --------------------------------------------------------- */
  const race = {
    id: "race", src: "Quiz Race", twist: "60-second streak race; every question is fresh and keyed, with the worked hint on a miss", cat: "Against the clock", title: "Quiz Race", kicker: "Against the clock",
    blurb: "Sixty seconds. Every right answer moves your runner down the track and builds the streak multiplier; a wrong one resets it.",
    icon: "flag",
    play(host) {
      const api = shell(host, race);
      const TIME = 60, LAPS = 20;
      let qs = [], i = 0, score = 0, streak = 0, right = 0, left = TIME, timer = null, lock = false, over = false;

      function build() {
        qs = deck(courseId(), 40);
        i = 0; score = 0; streak = 0; right = 0; left = TIME; lock = false; over = false;
        clearInterval(timer);
        api.stage.innerHTML = `
          <div class="ar-race">
            <div class="ar-track"><div class="ar-track-fill" id="arFill"></div><div class="ar-runner" id="arRunner" aria-hidden="true">${ML.art("race", 26)}</div><div class="ar-flag" aria-hidden="true">${ML.art("flag", 22, "ar-flag-wave")}</div></div>
            <div class="ar-card">
              <div id="arQ" class="ar-prompt"></div>
              <div id="arRow"></div>
              <div class="ar-fb" id="arFb"></div>
            </div>
          </div>`;
        timer = setInterval(() => {
          left--;
          api.setHud({ Score: score, Time: left + "s", Streak: "×" + Math.max(1, streak), Question: (i + 1) + "/" + LAPS });
          if (left <= 0) end(true);
        }, 1000);
        ask();
      }
      function ask() {
        const q = qs[i % qs.length];
        if (!q) return;
        lock = false;
        api.stage.querySelector("#arQ").innerHTML = qStem(q);
        const row = api.stage.querySelector("#arRow");
        row.innerHTML = "";
        row.appendChild(optionRow(q, (picked) => answer(q, picked, row)));
        api.stage.querySelector("#arFb").textContent = "";
        api.setHud({ Score: score, Time: left + "s", Streak: "×" + Math.max(1, streak), Question: (i + 1) + "/" + LAPS });
        move(i);
      }
      function move(n) {
        const fill = api.stage.querySelector("#arFill");
        const runner = api.stage.querySelector("#arRunner");
        const pct = Math.min(100, (n / LAPS) * 100);
        if (fill) fill.style.width = pct + "%";
        /* keep the marker inside the lane: at 0 % the sprite used to hang
           half off the left edge and got clipped by the track */
        if (runner) runner.style.setProperty("--p", String(pct / 100));
      }
      function answer(q, picked, row) {
        if (lock || over) return;
        lock = true;
        markOptions(row, q, picked);
        const ok = q.options[picked].ok;
        const fb = api.stage.querySelector("#arFb");
        if (ok) {
          streak++; right++;
          const gain = 10 * Math.min(5, streak);
          score += gain;
          U.sound.ok();
          if (fb) fb.innerHTML = `<b style="color:#1fa45b">+${gain}</b> <span class="muted">streak ×${Math.min(5, streak)}</span>`;
        } else {
          streak = 0;
          U.sound.no();
          if (fb) fb.innerHTML = `<b style="color:#e5484d">Not quite</b> — ${tex(q.hint || "the key is marked green.")}`;
        }
        setTimeout(() => {
          i++;
          if (i >= LAPS) { end(false); return; }
          ask();
        }, ok ? 380 : 900);
      }
      function end(timedOut) {
        if (over) return;
        over = true;
        clearInterval(timer);
        const record = api.finish(score);
        const acc = i ? Math.round((right / Math.max(1, i)) * 100) : 0;
        api.over({
          win: !timedOut, icon: timedOut ? "clock" : "flag",
          kicker: timedOut ? "Time's up" : "Round complete",
          title: timedOut ? "The clock beat you" : LAPS + " answered",
          message: `${right} right · ${acc}% accuracy` + (record ? " · new best" : ""),
          score: score + " pts", onAgain: build,
        });
      }
      build();
      return {
        get question() { return qs[i % qs.length]; },
        get score() { return score; },
        get streak() { return streak; },
        get right() { return right; },
        get index() { return i; },
        get ended() { return over; },
        answer: (oi) => {
          const row = api.stage.querySelector("#arRow");
          if (row) answer(qs[i % qs.length], oi, row);
        },
        solve() { const q = qs[i % qs.length]; if (q) this.answer(q.options.findIndex((o) => o.ok)); },
        miss() { const q = qs[i % qs.length]; if (q) this.answer(q.options.findIndex((o) => !o.ok)); },
      };
    },
  };

  /* ---------------------------------------------------------
     5. COMET CATCH — ported from Comet Catch
        answers fall towards the ground; catch the right one
     --------------------------------------------------------- */
  const comets = {
    id: "comets", src: "Comet Catch", twist: "three falling answers; catching the right one means evaluating it in time", cat: "Reflex & aim", title: "Comet Catch", kicker: "Reflex",
    blurb: "Three comets fall, each carrying an answer. Tap the right one before it hits the ground — three misses ends the game.",
    icon: "comets",
    play(host) {
      const api = shell(host, comets);
      let q = null, live = [], raf = 0, last = 0, speed = 34, score = 0, shields = 3, volley = 0, over = false, paused = false;

      function build() {
        score = 0; shields = 3; volley = 0; over = false; paused = false; speed = 34;
        api.stage.innerHTML = `
          <div class="ar-comets">
            <div class="ar-sky" id="arSky">
              <div class="ar-stars" aria-hidden="true">${Array.from({ length: 26 }, () =>
                `<i style="left:${ri(2, 98)}%;top:${ri(4, 74)}%;animation-delay:${(ri(0, 26) / 10).toFixed(1)}s"></i>`).join("")}</div>
              <div class="ar-moon" aria-hidden="true"></div>
              <div class="ar-ground"></div>
              <div class="ar-qbox" id="arCQ"></div>
            </div>
            <div class="ar-fb" id="arCFb">Tap the comet with the right answer.</div>
          </div>`;
        api.setHud({ Score: score, Shields: ML.art.tokens("shield", 3), Volley: 1 });
        next();
        last = NOW();
        RAF(loop);
      }
      function next() {
        if (over) return;
        volley++;
        q = pick(courseId());
        if (!q) return;
        const sky = api.stage.querySelector("#arSky");
        [...sky.querySelectorAll(".ar-comet")].forEach((n) => n.remove());
        sky.querySelector("#arCQ").innerHTML = qStem(q);
        live = [];
        /* three comets, and the right answer is always one of them */
        const oki = q.options.findIndex((o) => o.ok);
        const others = shuffle(q.options.map((o, i) => i).filter((i) => i !== oki));
        const pickIdx = shuffle([oki].concat(others.slice(0, 2))).filter((i) => i >= 0);
        const n = pickIdx.length;
        /* lanes computed from the sky's own width, so a comet is never
           half off the edge — on a phone the field is only ~330 px */
        const skyW = sky.clientWidth || 640;
        const cw = Math.min(150, Math.max(88, Math.floor(skyW * 0.3)));
        pickIdx.forEach((oi, k) => {
          const b = el("button", "ar-comet");
          b.type = "button";
          b.dataset.i = String(oi);
          b.innerHTML = `<span class="ar-comet-tail"></span><span class="ar-comet-t">${tex(q.options[oi].html)}</span>`;
          const lane = 12; /* inset so the tail and glow are never clipped */
          b.style.left = lane + Math.round(k * ((skyW - cw - lane * 2) / Math.max(1, n - 1))) + "px";
          b.style.minWidth = "0";
          b.style.width = cw + "px";
          /* they enter already in the sky, so the field is never empty */
          const y0 = 26 + k * 34;
          b.style.top = y0 + "px";
          b.addEventListener("click", () => catchComet(b, oi));
          sky.appendChild(b);
          live.push({ node: b, y: y0, speed: speed + k * 6, t: oi });
        });
        api.setHud({ Score: score, Shields: ML.art.tokens("shield", shields), Volley: volley });
      }
      function catchComet(node, oi) {
        if (over || paused || node.dataset.dead) return;
        node.dataset.dead = "1";
        if (q.options[oi].ok) {
          score += 50 + volley * 5;
          U.sound.coin();
          node.classList.add("pop");
          paused = true;
          api.stage.querySelector("#arCFb").innerHTML = `<b style="color:#1fa45b">Caught!</b> <span class="muted">${tex(q.hint || "")}</span>`;
          setTimeout(() => { paused = false; next(); }, 620);
        } else {
          score = Math.max(0, score - 15);
          U.sound.no();
          node.classList.add("no");
          api.stage.querySelector("#arCFb").innerHTML = `<b style="color:#e5484d">Not that one.</b>`;
          api.setHud({ Score: score, Shields: ML.art.tokens("shield", shields), Volley: volley });
        }
      }
      function loop(ts) {
        const t = ts == null ? NOW() : ts;
        const dt = Math.min(64, t - last);
        last = t;
        if (!over && !paused) {
          const sky = api.stage.querySelector("#arSky");
          const h = sky ? sky.clientHeight || 420 : 420;
          let missed = false;
          live.forEach((c) => {
            if (c.node.dataset.dead) return;
            c.y += (c.speed * dt) / 1000;
            c.node.style.top = c.y + "px";
            if (c.y > h - 60) {
              c.node.dataset.dead = "1";
              c.node.classList.add("gone");
              if (q && q.options[c.t].ok) missed = true;
            }
          });
          if (missed && !over) {
            shields--;
            U.sound.thud();
            api.setHud({ Score: score, Shields: ML.art.tokens("shield", shields), Volley: volley });
            api.stage.querySelector("#arCFb").innerHTML = `<b style="color:#e5484d">Missed the answer</b> — it hit the ground.`;
            if (shields <= 0) { finish(); return; }
            paused = true;
            setTimeout(() => { paused = false; next(); }, 800);
          }
        }
        if (!over) RAF(loop);
      }
      function finish() {
        over = true;
        const record = api.finish(score);
        api.over({ win: true, icon: "comets", kicker: "Run over", title: "Out of shields", message: (record ? "New best. " : "") + "You cleared " + Math.max(0, volley - 1) + " volleys.", score: score + " pts", onAgain: build });
      }
      build();
      return {
        get question() { return q; },
        get score() { return score; },
        get shields() { return shields; },
        get volley() { return volley; },
        get ended() { return over; },
        catchAnswer: (oi) => {
          const node = [...api.stage.querySelectorAll(".ar-comet")].find((n) => n.dataset.i === String(oi));
          if (node) catchComet(node, oi);
        },
        solve() { const i = q ? q.options.findIndex((o) => o.ok) : -1; if (i >= 0) this.catchAnswer(i); },
        miss() { const i = q ? q.options.findIndex((o) => !o.ok) : -1; if (i >= 0) this.catchAnswer(i); },
        /* advance the fall loop by simulated milliseconds (no real frames needed) */
        tick(ms) {
          const total = ms || 1000;
          for (let acc = 0; acc < total && !over; acc += 64) {
            last = NOW() - 64;
            loop(NOW());
            if (paused) break;
          }
        },
      };
    },
  };

  /* ---------------------------------------------------------
     6. MEMORY MATCH — ported from Memory Cards
        expression ⇄ value pairs, flipped two at a time
     --------------------------------------------------------- */
  const memory = {
    id: "memory", src: "Memory Cards", twist: "pairs are an <b>expression</b> and its <b>value</b>, so recall and arithmetic together", cat: "Memory", title: "Memory Match", kicker: "Pairs",
    blurb: "Eight cards: four expressions and their four values. Flip two at a time and remember where each answer hides.",
    icon: "deck",
    play(host) {
      const api = shell(host, memory);
      let cards = [], open = [], matched = 0, moves = 0, lock = false, score = 0;

      /* memory cards have to stay readable, so prefer recipes with short stems */
      const shortFam = (f) => String(f.text || "").length <= 62;

      function build() {
        const qs = deck(courseId(), 4, shortFam);
        if (qs.length < 4) { api.stage.innerHTML = `<p class="muted">Not enough short recipes for this course — try Mixed.</p>`; return; }
        cards = [];
        qs.forEach((q, i) => {
          cards.push({ pair: i, kind: "q", html: qStem(q) });
          cards.push({ pair: i, kind: "a", html: `<div class="ar-mem-a">${tex(q.answerText)}</div>` });
        });
        cards = shuffle(cards);
        open = []; matched = 0; moves = 0; lock = false; score = 0;
        api.stage.innerHTML = `<div class="ar-mem" id="arMem"></div><div class="ar-fb" id="arMFb">Flip two cards. A pair is an expression and its value.</div>`;
        const grid = api.stage.querySelector("#arMem");
        cards.forEach((c, i) => {
          const b = el("button", "ar-mcard");
          b.type = "button";
          b.dataset.i = String(i);
          b.innerHTML = `<span class="ar-mface ar-mback">?</span><span class="ar-mface ar-mfront">${c.html}</span>`;
          b.addEventListener("click", () => flip(i, b));
          grid.appendChild(b);
        });
        api.setHud({ Score: 0, Pairs: "0/4", Flips: 0 });
      }
      function flip(i, node) {
        if (lock || node.classList.contains("is-open") || node.classList.contains("is-done")) return;
        node.classList.add("is-open");
        U.sound.click();
        open.push({ i, node });
        if (open.length < 2) {
          api.setHud({ Score: score, Pairs: matched + "/4", Flips: moves });
          return;
        }
        const [a, b] = open;
        moves++;
        const same = cards[a.i].pair === cards[b.i].pair && cards[a.i].kind !== cards[b.i].kind;
        if (same) {
          matched++;
          score += 120 - moves * 2;
          a.node.classList.add("is-done"); b.node.classList.add("is-done");
          U.sound.ok();
          open = [];
          api.setHud({ Score: Math.max(0, score), Pairs: matched + "/4", Flips: moves });
          if (matched === 4) {
            const record = api.finish(Math.max(0, score));
            api.over({ win: true, icon: "deck", kicker: "All pairs", title: "Board cleared", message: (record ? "New best. " : "") + moves + " flips in total.", score: Math.max(0, score) + " pts", onAgain: build });
          }
        } else {
          lock = true;
          U.sound.no();
          setTimeout(() => {
            a.node.classList.remove("is-open"); b.node.classList.remove("is-open");
            open = []; lock = false;
            api.setHud({ Score: Math.max(0, score), Pairs: matched + "/4", Flips: moves });
          }, 800);
        }
      }
      build();
      return {
        get cards() { return cards.slice(); },
        get moves() { return moves; },
        get matched() { return matched; },
        flip: (i) => {
          const node = api.stage.querySelector('.ar-mcard[data-i="' + i + '"]');
          if (node) flip(i, node);
        },
        solve() {
          const nodes = [...api.stage.querySelectorAll(".ar-mcard")];
          for (let p = 0; p < 4; p++) {
            const at = nodes.map((n, i) => (!n.classList.contains("is-done") && cards[i].pair === p ? i : -1)).filter((i) => i >= 0);
            if (at.length === 2) { this.flip(at[0]); this.flip(at[1]); return; }
          }
        },
        miss() {
          const nodes = [...api.stage.querySelectorAll(".ar-mcard")];
          const free = nodes.map((n, i) => (n.classList.contains("is-done") ? -1 : i)).filter((i) => i >= 0);
          const a = free.find((i) => cards[i].kind === "q");
          const b = free.find((i) => cards[i].kind === "q" && cards[i].pair !== (a != null ? cards[a].pair : -2));
          if (a != null && b != null) { this.flip(a); this.flip(b); }
        },
      };
    },
  };

  /* ---------------------------------------------------------
     7. RAPID SORT — ported from Rapid Sort
        one card at a time, two buckets, keyboard arrows
     --------------------------------------------------------- */
  const RULES = [
    { id: "prime", left: "Prime", right: "Composite",
      make: () => { const p = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47]; const c = [4,6,8,9,10,12,14,15,16,18,20,21,22,24,25,26,27,28,30,32,33,34,35,36,38,39,40];
        const n = Math.random() < 0.5 ? p[ri(0, p.length - 1)] : c[ri(0, c.length - 1)];
        return { card: String(n), left: p.indexOf(n) >= 0 }; } },
    { id: "even", left: "Even", right: "Odd",
      make: () => { const n = ri(11, 99); return { card: String(n), left: n % 2 === 0 }; } },
    { id: "square", left: "Perfect square", right: "Not a square",
      make: () => { const sq = [4,9,16,25,36,49,64,81,100,121,144]; const ns = [8,10,12,15,20,24,30,45,50,60,72,90,110];
        const n = Math.random() < 0.5 ? sq[ri(0, sq.length - 1)] : ns[ri(0, ns.length - 1)];
        return { card: String(n), left: sq.indexOf(n) >= 0 }; } },
    { id: "mult3", left: "Multiple of 3", right: "Not a multiple of 3",
      make: () => { const n = ri(10, 99); return { card: String(n), left: n % 3 === 0 }; } },
    { id: "sign", left: "Positive slope", right: "Negative slope",
      make: () => { const m = ri(1, 9) * (Math.random() < 0.5 ? 1 : -1); const b = ri(-6, 6);
        return { card: "y = " + m + "x" + (b < 0 ? " − " + Math.abs(b) : b > 0 ? " + " + b : ""), left: m > 0 }; } },
  ];
  const sort = {
    id: "sort", src: "Rapid Sort", twist: "buckets are maths properties — prime/composite, even/odd, squares, multiples, slope sign", cat: "Sorting & groups", title: "Rapid Sort", kicker: "Speed sorting",
    blurb: "One card at a time, two buckets. Sort as many as you can in 45 seconds — arrowing left and right works too.",
    icon: "flashcards",
    play(host) {
      const api = shell(host, sort);
      const TOTAL = 18, TIME = 45;
      let rule = null, n = 0, score = 0, streak = 0, right = 0, left = TIME, timer = null, lock = false, over = false, card = null;

      function build() {
        rule = RULES[ri(0, RULES.length - 1)];
        n = 0; score = 0; streak = 0; right = 0; left = TIME; lock = false; over = false;
        clearInterval(timer);
        api.stage.innerHTML = `
          <div class="ar-sort">
            <div class="ar-sort-rule">Sort each card: <b>${esc(rule.left)}</b> or <b>${esc(rule.right)}</b></div>
            <div class="ar-sort-card" id="arSortCard">—</div>
            <div class="ar-buckets">
              <button class="ar-bucket" data-side="left"><span>◀</span>${esc(rule.left)}</button>
              <button class="ar-bucket" data-side="right">${esc(rule.right)}<span>▶</span></button>
            </div>
            <div class="ar-fb" id="arSFb"></div>
          </div>`;
        api.stage.querySelectorAll(".ar-bucket").forEach((b) => b.addEventListener("click", () => drop(b.dataset.side)));
        timer = setInterval(() => {
          left--;
          api.setHud({ Score: score, Time: left + "s", Sorted: n + "/" + TOTAL, Streak: "×" + Math.max(1, streak) });
          if (left <= 0) end(true);
        }, 1000);
        nextCard();
      }
      function nextCard() {
        if (n >= TOTAL) { end(false); return; }
        card = rule.make();
        const box = api.stage.querySelector("#arSortCard");
        box.innerHTML = `<b>${tex(card.card)}</b>`;
        box.classList.remove("pop"); void box.offsetWidth; box.classList.add("pop");
        api.setHud({ Score: score, Time: left + "s", Sorted: n + "/" + TOTAL, Streak: "×" + Math.max(1, streak) });
        lock = false;
      }
      function drop(side) {
        if (lock || over || !card) return;
        lock = true;
        n++;
        const ok = (side === "left") === card.left;
        const fb = api.stage.querySelector("#arSFb");
        if (ok) {
          streak++; right++;
          score += 10 + Math.min(5, streak) * 2;
          U.sound.click();
          if (fb) fb.innerHTML = `<b style="color:#1fa45b">Right</b> — ${esc(card.card)} is ${esc(card.left ? rule.left : rule.right).toLowerCase()}.`;
        } else {
          streak = 0;
          U.sound.no();
          if (fb) fb.innerHTML = `<b style="color:#e5484d">Wrong bucket</b> — ${esc(card.card)} is ${esc(card.left ? rule.left : rule.right).toLowerCase()}.`;
        }
        api.setHud({ Score: score, Time: left + "s", Sorted: n + "/" + TOTAL, Streak: "×" + Math.max(1, streak) });
        setTimeout(nextCard, ok ? 260 : 700);
      }
      function end(timedOut) {
        if (over) return;
        over = true;
        clearInterval(timer);
        const record = api.finish(score);
        api.over({
          win: !timedOut, icon: timedOut ? "clock" : "flashcards",
          kicker: timedOut ? "Time's up" : "Sorted out",
          title: timedOut ? "The clock won" : TOTAL + " cards sorted",
          message: right + " correct of " + n + (record ? " · new best" : ""), score: score + " pts", onAgain: build,
        });
      }
      const keys = (e) => {
        if (e.key === "ArrowLeft") { drop("left"); e.preventDefault(); }
        else if (e.key === "ArrowRight") { drop("right"); e.preventDefault(); }
      };
      host.addEventListener("keydown", keys);
      build();
      return {
        get rule() { return rule; },
        get card() { return card; },
        get score() { return score; },
        get sorted() { return n; },
        get right() { return right; },
        drop: (side) => drop(side),
        solve() { if (card) drop(card.left ? "left" : "right"); },
        miss() { if (card) drop(card.left ? "right" : "left"); },
      };
    },
  };

  /* ---------------------------------------------------------
     8. STEP ORDER — ported from Timeline Build
        put the worked steps of one generated solution in order
     --------------------------------------------------------- */
  const steps = {
    id: "steps", src: "Timeline Build", twist: "the timeline is a <b>worked solution</b>; the steps come straight out of the generator", cat: "Sorting & groups", title: "Step Order", kicker: "Sequencing",
    blurb: "A worked solution has been shuffled. Tap the steps in the right order and prove you know the method, not just the answer.",
    icon: "steps",
    play(host) {
      const api = shell(host, steps);
      let q = null, order = [], placed = [], rounds = 0, score = 0, lock = false;

      const longFam = (f) => Array.isArray(f.steps) && f.steps.length >= 2;

      function build() {
        rounds = 0; score = 0;
        api.stage.innerHTML = `
          <div class="ar-steps">
            <div class="ar-card">
              <div class="eyebrow">Question</div>
              <div id="arSQ" class="ar-prompt"></div>
            </div>
            <div class="ar-steps-target" id="arTarget"><span class="muted small">Tap the steps below in the right order…</span></div>
            <div class="ar-steps-pool" id="arPool"></div>
            <div class="ar-fb" id="arStepsFb"></div>
            <div class="ar-row-btns">
              <button class="btn ghost sm" id="arUndo">Undo</button>
              <button class="btn sm" id="arCheck">Check order</button>
              <button class="btn ghost sm" id="arNextQ">Next question →</button>
            </div>
          </div>`;
        api.stage.querySelector("#arUndo").addEventListener("click", () => {
          if (!placed.length || lock) return;
          placed.pop();
          paint();
        });
        api.stage.querySelector("#arCheck").addEventListener("click", check);
        api.stage.querySelector("#arNextQ").addEventListener("click", () => newQuestion());
        newQuestion();
      }
      function newQuestion() {
        lock = false;
        const fams = familiesFor(courseId()).filter(longFam);
        if (!fams.length) { api.stage.querySelector("#arPool").innerHTML = `<p class="muted">No stepped recipes for this course — try Mixed.</p>`; return; }
        const fam = fams[ri(0, fams.length - 1)];
        q = ML.gen.instance(fam, ri(1, 1e9));
        if (!q || !q.steps || q.steps.length < 2) { newQuestion(); return; }
        order = shuffle(q.steps.map((s, i) => ({ s, i })));
        placed = [];
        api.stage.querySelector("#arSQ").innerHTML = qStem(q);
        api.stage.querySelector("#arStepsFb").textContent = "";
        api.setHud({ Score: score, Round: rounds + 1, Steps: q.steps.length });
        paint();
      }
      function paint() {
        const pool = api.stage.querySelector("#arPool");
        const target = api.stage.querySelector("#arTarget");
        pool.innerHTML = "";
        order.forEach((o) => {
          if (placed.includes(o.i)) return;
          const b = el("button", "ar-step", tex(o.s));
          b.type = "button";
          b.dataset.i = String(o.i);
          b.addEventListener("click", () => {
            if (lock) return;
            /* the chip is repainted away immediately, so fire the burst on it
               first — the particles live in their own layer and outlast it */
            if (ML.fx) ML.fx.burst(b, { count: 8, spread: 0.8 });
            placed.push(o.i);
            U.sound.click();
            paint();
          });
          pool.appendChild(b);
        });
        target.innerHTML = placed.length
          ? placed.map((i, k) => `<div class="ar-step is-placed"><b>${k + 1}</b><span>${tex(q.steps[i])}</span></div>`).join("")
          : `<span class="muted small">Tap the steps below in the right order…</span>`;
        api.setHud({ Score: score, Round: rounds + 1, Steps: placed.length + "/" + q.steps.length });
      }
      function check() {
        if (lock) return;
        const fb = api.stage.querySelector("#arStepsFb");
        if (placed.length < q.steps.length) { fb.innerHTML = `<b style="color:#e8a008">Not yet</b> — ${q.steps.length - placed.length} step(s) still in the pool.`; return; }
        const right = placed.every((v, i) => v === i);
        if (right) {
          lock = true;
          rounds++;
          score += 200;
          U.sound.ok();
          fb.innerHTML = `<b style="color:#1fa45b">Perfect order</b> — +200. ${tex(q.hint || "")}`;
          api.setHud({ Score: score, Round: rounds, Steps: placed.length + "/" + q.steps.length });
          api.finish(score);
          confetti(api.stage);
          setTimeout(() => { if (rounds >= 4) { const record = api.finish(score); api.over({ win: true, icon: "steps", kicker: "Four rounds", title: "Method mastered", message: (record ? "New best. " : "") + "You ordered four full solutions.", score: score + " pts", onAgain: build }); } else newQuestion(); }, 1100);
        } else {
          const bad = placed.findIndex((v, i) => v !== i);
          U.sound.no();
          fb.innerHTML = `<b style="color:#e5484d">Step ${bad + 1} is out of place</b> — check what has to happen before it.`;
          const nodes = api.stage.querySelectorAll(".ar-step.is-placed");
          const n = nodes[bad];
          if (n) {
            n.classList.add("is-wrong");
            if (ML.fx) { ML.fx.shake(api.stage); ML.fx.flash(api.stage, "bad"); }
            setTimeout(() => n.classList.remove("is-wrong"), 700);
          }
        }
      }
      build();
      return {
        get question() { return q; },
        get order() { return order.map((o) => o.i); },
        get placed() { return placed.slice(); },
        get score() { return score; },
        place: (stepIndex) => { if (!lock && placed.indexOf(stepIndex) < 0) { placed.push(stepIndex); paint(); } },
        undo: () => { if (placed.length && !lock) { placed.pop(); paint(); } },
        check: () => check(),
        solve() { while (placed.length) { if (lock) break; placed.pop(); } paint(); for (let i = 0; i < q.steps.length; i++) this.place(i); check(); },
        miss() {
          let undos = 0;
          while (placed.length && undos++ < 20) placed.pop();
          paint();
          const seq = [...Array(q.steps.length).keys()];
          if (seq.length > 1) { const t = seq[0]; seq[0] = seq[1]; seq[1] = t; }
          seq.forEach((i) => this.place(i));
          check();
        },
      };
    },
  };

  const GAMES = { bingo, race, comets, memory, sort, steps };
  const ORDER = ["bingo", "race", "comets", "memory", "sort", "steps"];
  const CATS = ["Board & cards", "Against the clock", "Reflex & aim", "Memory", "Pairs & matching",
    "Sorting & groups", "Discovery", "Review"];

  /* a mode pack (arcade2.js) drops its games in through this */
  function add(...modes) {
    modes.forEach((g) => {
      if (!g || !g.id || GAMES[g.id]) return;
      GAMES[g.id] = g;
      ORDER.push(g.id);
    });
  }

  /* ---------------------------------------------------------
     9. the arcade floor
     --------------------------------------------------------- */
  function floor(root) {
    const wrap = el("div", "ar-floor");
    const cur = courseId();
    const byCat = CATS.map((c) => [c, ORDER.map((id) => GAMES[id]).filter((g) => g && (g.cat || "Discovery") === c)])
      .filter(([, list]) => list.length);
    wrap.innerHTML = `
      <header class="ar-hero">
        <div>
          <div class="eyebrow">The floor · pick a game</div>
          <h1>Play the maths, not the drill</h1>
          <p class="lead">Every question here is generated on the spot by the same 112-recipe engine the
          worksheets use — so the boards, decks and comets never repeat and every answer is keyed. All
          ${ORDER.length} mechanics are ported from the EduMagnet game library; the science has been swapped
          for mathematics and the look follows this site's own design tokens.</p>
        </div>
        <div class="ar-hero-art" aria-hidden="true">${ML.art("die", 84)}</div>
      </header>
      <div class="ar-courses" id="arCourses">
        ${COURSES.map((c) => `<button class="qs-src${(cur || "") === c.id ? " on" : ""}" data-c="${c.id}">${esc(c.label)}</button>`).join("")}
      </div>
      ${byCat.map(([cat, list]) => `
        <section class="ar-cat">
          <h2 class="ar-cat-h">${esc(cat)} <span class="muted small">${list.length}</span></h2>
          <div class="ar-grid">
            ${list.map((g) => `<a class="ar-tile" href="#/arcade/${g.id}">
              <span class="ar-tile-ico">${ML.art.big(g.icon, 26)}</span>
              <b class="ar-tile-title">${esc(g.title)}</b>
              <span class="ar-tile-best">${best(g.id) ? "best " + best(g.id) : "play"}</span>
              <span class="ar-tile-blurb muted small">${esc(g.blurb)}</span>
              <span class="ar-tile-src muted small">${esc(g.src || "new")}</span>
              <span class="ar-tile-go" aria-hidden="true">${ML.icon("arrow")}</span>
            </a>`).join("")}
          </div>
        </section>`).join("")}
      <section class="co-block">
        <div class="co-block-h"><div><div class="eyebrow">Where these came from</div><h2>All ${ORDER.length} modes and what changed</h2>
        <p class="muted small">Each one is a re-implementation in this site's own code — no external scripts, no network, no images.</p></div></div>
        <table class="ar-map">
          <tr><th>EduMagnet mode</th><th>Here</th><th>The maths twist</th></tr>
          ${ORDER.filter((id) => GAMES[id]).map((id) => { const g = GAMES[id]; return `<tr><td>${esc(g.src || "—")}</td><td><a href="#/arcade/${g.id}">${esc(g.title)}</a></td><td>${g.twist || esc(g.blurb)}</td></tr>`; }).join("")}
        </table>
      </section>`;
    root.appendChild(wrap);
    wrap.querySelectorAll("#arCourses .qs-src").forEach((b) => b.addEventListener("click", () => {
      setCourse(b.dataset.c);
      wrap.querySelectorAll("#arCourses .qs-src").forEach((x) => x.classList.toggle("on", x === b));
      U.sound.click();
    }));
  }

  ML.register({
    id: "arcade", group: "games", title: "Maths Arcade",
    short: "Arcade", icon: ML.icon("bolt"), color: ["#fff1f6", "#b0267a"], tag: ORDER.length + " game modes",
    blurb: "Every EduMagnet game mode rebuilt for maths: Bingo, Quiz Race, Comet Catch, Memory, Pairs, Sweep, Rapid Sort, Step Order, Flash Recall, Flashcards, Bubble Pop, Mystery Crates, Spin the Wheel, Discovery Tiles, Circuit Maze, Magnet Zap, Group Sort, Rocket Glide, Penguin Leap, Zoom Guess and the Correcting Deck — every question generated fresh.",
    tags: ["games", "arcade", "bingo", "quiz race", "comets", "memory", "pairs", "sorting", "sequencing", "recall", "flashcards", "bubbles", "maze", "wheel", "discovery", "rocket", "penguin", "zoom", "review"],
    mount(root, ctx) {
      const sub = ((ctx && ctx.sub) || "").replace(/^\/+|\/+$/g, "").split("/")[0];
      const game = GAMES[sub];
      if (!game) { floor(root); return; }
      const host = el("div", "ar-game");
      root.appendChild(host);
      ML.arcade.live = game.play(host);
    },
  });

  ML.arcade = Object.assign(ML.arcade || {}, {
    GAMES, ORDER, CATS, add, deck, pick, COURSES, courseId, setCourse, best, setBest, live: null,
    /* everything a mode pack needs, in one place */
    kit: { shell, confetti, optionRow, markOptions, qStem, qOpt, tex, esc, el, ri, shuffle, RAF, NOW,
      deck, pick, courseId, setCourse, best, setBest, COURSES, familiesFor, U: ML.u, api: null },
  });
})();

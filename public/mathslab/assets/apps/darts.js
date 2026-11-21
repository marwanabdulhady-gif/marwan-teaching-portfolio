/* ===========================================================
   MathsLab — darts: 501 match + 3-dart checkout trainer
   =========================================================== */
(function () {
  "use strict";
  const ML = window.ML, U = ML.u;

  /* ---------------------------------------------------------
     Dartboard geometry (radius 170 units, 18° sectors)
     --------------------------------------------------------- */
  const ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  const R = { bullIn: 6.35, bullOut: 15.9, singleIn: 99, tripleOut: 107, singleOut: 162, doubleOut: 170 };

  function pt(r, deg) {
    const a = (deg - 90) * Math.PI / 180;
    return [r * Math.cos(a), r * Math.sin(a)];
  }
  function sectorPath(r0, r1, a0, a1) {
    const [x0, y0] = pt(r0, a0), [x1, y1] = pt(r1, a0), [x2, y2] = pt(r1, a1), [x3, y3] = pt(r0, a1);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M${x0.toFixed(2)},${y0.toFixed(2)} L${x1.toFixed(2)},${y1.toFixed(2)} A${r1},${r1} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} L${x3.toFixed(2)},${y3.toFixed(2)} A${r0},${r0} 0 ${large} 0 ${x0.toFixed(2)},${y0.toFixed(2)} Z`;
  }

  /** Build the board SVG. onHit({num, mult, label, score}) fires on click. */
  function buildBoard(onHit, opts = {}) {
    const parts = [];
    const HALF = 9;
    ORDER.forEach((num, i) => {
      const center = i * 18;
      const a0 = center - HALF, a1 = center + HALF;
      const red = i % 2 === 0;
      const dark = i % 2 === 0;
      const singleFill = dark ? "#20232b" : "#f6efdd";
      const ringFill = red ? "#d8332f" : "#0f7a4a";
      const seg = (r0, r1, mult, fill) => {
        parts.push(`<path d="${sectorPath(r0, r1, a0, a1)}" fill="${fill}" data-num="${num}" data-mult="${mult}" data-label="${mult === 1 ? "" : mult === 2 ? "D" : "T"}${num}" data-score="${num * mult}" stroke="#ffffff" stroke-width=".7"></path>`);
      };
      seg(R.bullOut, R.singleIn, 1, singleFill);
      seg(R.singleIn, R.tripleOut, 3, ringFill);
      seg(R.tripleOut, R.singleOut, 1, singleFill);
      seg(R.singleOut, R.doubleOut, 2, ringFill);
    });
    parts.push(`<circle cx="0" cy="0" r="${R.bullOut}" fill="#0f7a4a" data-num="25" data-mult="1" data-label="25" data-score="25" stroke="#fff" stroke-width=".7"></circle>`);
    parts.push(`<circle cx="0" cy="0" r="${R.bullIn}" fill="#d8332f" data-num="50" data-mult="1" data-label="50" data-score="50" stroke="#fff" stroke-width=".7"></circle>`);
    /* number ring */
    ORDER.forEach((num, i) => {
      const [x, y] = pt(184, i * 18);
      parts.push(`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="800" fill="#e9ecf5" font-family="system-ui,sans-serif">${num}</text>`);
    });
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "-200 -200 400 400");
    svg.setAttribute("role", opts.label ? "img" : "group");
    if (opts.label) svg.setAttribute("aria-label", opts.label);
    svg.style.cssText = "display:block;width:100%;max-width:520px;height:auto;margin:0 auto;touch-action:manipulation;cursor:crosshair";
    svg.innerHTML = `<circle cx="0" cy="0" r="196" fill="#141821"/><circle cx="0" cy="0" r="172" fill="#0b0e14"/>` + parts.join("");

    svg.addEventListener("click", (e) => {
      const r = svg.getBoundingClientRect();
      const scale = 400 / r.width;
      const x = (e.clientX - r.left) * scale - 200;
      const y = (e.clientY - r.top) * scale - 200;
      const dist = Math.hypot(x, y);
      const hit = hitTest(x, y, dist);
      if (hit && onHit) { flash(svg, x, y, hit); onHit(hit); }
    });
    return svg;
  }

  function hitTest(x, y) {
    const dist = Math.hypot(x, y);
    if (dist > R.doubleOut) return null;
    if (dist <= R.bullIn) return { num: 50, mult: 1, label: "50", score: 50 };
    if (dist <= R.bullOut) return { num: 25, mult: 1, label: "25", score: 25 };
    let ang = (Math.atan2(y, x) * 180) / Math.PI; // -180..180, 0 = right, CW positive (svg y down)
    ang = (ang + 90 + 9 + 360) % 360;             // shift so sector 0 starts at 20's left edge
    const i = Math.floor(ang / 18) % 20;
    const num = ORDER[i];
    let mult = 1;
    if (dist > R.singleOut) mult = 2;
    else if (dist > R.singleIn && dist <= R.tripleOut) mult = 3;
    const label = (mult === 1 ? "" : mult === 2 ? "D" : "T") + num;
    return { num, mult, label, score: num * mult };
  }

  function flash(svg, x, y, hit) {
    const mk = (tag, attrs) => {
      const n = document.createElementNS("http://www.w3.org/2000/svg", tag);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      return n;
    };
    const marker = mk("g", { opacity: 1 });
    marker.appendChild(mk("circle", { cx: x, cy: y, r: 7, fill: "#ffd400", stroke: "#fff", "stroke-width": 2 }));
    const txt = mk("text", { x: x, y: y - 14, "text-anchor": "middle", "font-size": 17, "font-weight": 800, fill: "#fff", "paint-order": "stroke", stroke: "#101828", "stroke-width": 3 });
    txt.textContent = hit.label;
    marker.appendChild(txt);
    svg.appendChild(marker);
    let t0 = performance.now();
    (function fade(now) {
      const k = (now - t0) / 700;
      if (k >= 1) { marker.remove(); return; }
      marker.setAttribute("opacity", String(1 - k));
      marker.setAttribute("transform", `translate(0,${-k * 10})`);
      requestAnimationFrame(fade);
    })(t0);
    U.sound.thud();
  }

  /* ---------------------------------------------------------
     Checkout solver — finish on a double (or any, if allowed)
     --------------------------------------------------------- */
  const ALL_DARTS = (() => {
    const list = [];
    for (let n = 1; n <= 20; n++) { list.push({ s: n, m: 1, label: "S" + n }); list.push({ s: 2 * n, m: 2, label: "D" + n }); list.push({ s: 3 * n, m: 3, label: "T" + n }); }
    list.push({ s: 25, m: 1, label: "25" }, { s: 50, m: 1, label: "50" });
    return list.sort((a, b) => b.s - a.s);
  })();

  function checkouts(total, darts = 3, doubleOut = true) {
    if (total <= 0 || total > 170) return [];
    const out = [];
    const finishes = ALL_DARTS.filter((d) => (doubleOut ? d.m === 2 || d.s === 50 : true) && d.s === total);
    out.push(...finishes.map((f) => [f.label]));
    if (darts >= 2) {
      for (const a of ALL_DARTS) {
        const rest = total - a.s;
        const f2 = ALL_DARTS.filter((d) => (doubleOut ? d.m === 2 || d.s === 50 : true) && d.s === rest);
        for (const f of f2) out.push([a.label, f.label]);
      }
    }
    if (darts >= 3) {
      for (const a of ALL_DARTS) {
        for (const b of ALL_DARTS) {
          const rest = total - a.s - b.s;
          const f3 = ALL_DARTS.filter((d) => (doubleOut ? d.m === 2 || d.s === 50 : true) && d.s === rest);
          for (const f of f3) out.push([a.label, b.label, f.label]);
        }
      }
    }
    /* prefer routes that start with big trebles */
    out.sort((x, y) => {
      const sx = x.length + (x[0].startsWith("T") ? 0 : .5) - (x[x.length - 1].startsWith("D") ? .1 : 0);
      const sy = y.length + (y[0].startsWith("T") ? 0 : .5) - (y[y.length - 1].startsWith("D") ? .1 : 0);
      return sx - sy;
    });
    return out.slice(0, 80);
  }
  ML.checkouts = checkouts;

  function parseThrow(txt) {
    const s = String(txt).trim().toUpperCase().replace(/\s+/g, "");
    if (!s) return null;
    if (s === "25" || s === "SB" || s === "OB") return { num: 25, mult: 1, label: "25", score: 25 };
    if (s === "50" || s === "BULL" || s === "DB" || s === "DBULL") return { num: 50, mult: 1, label: "50", score: 50 };
    const m = s.match(/^([SDT])?([1-9]|1[0-9]|20)$/);
    if (!m) return null;
    const mult = m[1] === "D" ? 2 : m[1] === "T" ? 3 : 1;
    const num = +m[2];
    return { num, mult, label: (mult === 1 ? "" : mult === 2 ? "D" : "T") + num, score: num * mult };
  }

  /* =========================================================
     501 DARTS
     ========================================================= */
  ML.register({
    id: "darts501", group: "games", title: "501 Darts",
    short: "501 Darts", icon: ML.icon('target'), color: ["#fdeaea", "#b0262a"], tag: "Game",
    blurb: "Classic 501 against a friend or the computer. Click the board or type throws like T20, D16 — finish on a double.",
    tags: ["501 Darts.exe", "checkout", "two players", "double out"],
    mount(root) {
      const st = {
        mode: "cpu",
        doubleOut: true,
        players: [],
        turn: 0,
        dartsLeft: 3,
        turnStart: 501,
        turnThrows: [],
        over: false,
        log: [],
      };
      function newGame() {
        st.players = [
          { name: "You", score: 501, cpu: false, darts: 0, scored: 0 },
          { name: st.mode === "cpu" ? "Computer" : "Player 2", score: 501, cpu: st.mode === "cpu", darts: 0, scored: 0 },
        ];
        st.turn = 0; st.dartsLeft = 3; st.turnStart = 501; st.turnThrows = []; st.over = false; st.log = [];
      }

      const wrap = U.el("div", { class: "app-layout" });
      wrap.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Match</div>
            <div class="panel-b tight">
              <div class="seg" id="modeSeg"><button data-m="cpu" class="on">vs Computer</button><button data-m="2p">2 players</button></div>
              <label class="check"><input type="checkbox" id="dblChk" checked> Finish on a double</label>
              <button class="btn" id="newBtn">${ML.icon("undo")} New match</button>
            </div>
          </div>
          <div class="panel">
            <div class="panel-h">Type a throw</div>
            <div class="panel-b tight">
              <div class="field"><label>e.g. <span class="kbd">T20</span> <span class="kbd">D16</span> <span class="kbd">25</span> <span class="kbd">S5</span></label>
                <div style="display:flex;gap:7px"><input type="text" id="throwInput" placeholder="T20" autocomplete="off" spellcheck="false" style="font-family:var(--fm)"><button class="btn sm" id="throwBtn">Throw</button></div>
              </div>
              <button class="btn ghost sm" id="undoBtn">${ML.icon("undo")} Undo last dart</button>
              <div class="note" id="checkoutNote">Checkout hints appear here once you are on a finishable score.</div>
            </div>
          </div>
        </aside>
        <div class="stage">
          <div class="panel" style="overflow:hidden">
            <div class="panel-h"><span>Dartboard</span><span class="small muted">click a segment, or type a throw</span></div>
            <div style="padding:16px;background:radial-gradient(circle at 50% 35%,#1a1f2b,#0b0e14)">
              <div id="boardHost"></div>
            </div>
          </div>
          <div id="scoreboard" style="margin-top:16px"></div>
          <div class="card" style="margin-top:16px;overflow:hidden">
            <div class="card-h"><h2>Throw by throw</h2><span class="small muted" id="avg"></span></div>
            <div class="scroll-x"><table class="data" id="throwLog"></table></div>
          </div>
        </div>`;
      root.appendChild(wrap);

      const boardHost = wrap.querySelector("#boardHost");
      const board = buildBoard((hit) => throwDart(hit, "click"), { label: "Dartboard" });
      boardHost.appendChild(board);

      wrap.querySelector("#modeSeg").addEventListener("click", (e) => {
        const b = e.target.closest("button[data-m]"); if (!b) return;
        st.mode = b.dataset.m;
        U.$$("#modeSeg button", wrap).forEach((x) => x.classList.toggle("on", x === b));
        newGame(); drawAll();
      });
      wrap.querySelector("#dblChk").addEventListener("change", (e) => { st.doubleOut = e.target.checked; newGame(); drawAll(); });
      wrap.querySelector("#newBtn").addEventListener("click", () => { newGame(); drawAll(); });
      wrap.querySelector("#throwBtn").addEventListener("click", () => {
        const inp = wrap.querySelector("#throwInput");
        const t = parseThrow(inp.value);
        if (!t) { ML.toast("Try T20, D16, 25 or S5", "no"); inp.select(); return; }
        inp.value = ""; inp.focus();
        throwDart(t, "type");
      });
      wrap.querySelector("#throwInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") wrap.querySelector("#throwBtn").click();
      });
      wrap.querySelector("#undoBtn").addEventListener("click", undo);

      function cur() { return st.players[st.turn]; }

      function throwDart(hit, src) {
        if (st.over) return;
        const p = cur();
        if (p.cpu) return;
        applyThrow(p, hit);
        drawAll();
        if (!st.over && st.dartsLeft === 0) nextTurn();
      }

      function applyThrow(p, hit) {
        const before = p.score;
        const after = before - hit.score;
        let bust = false, reason = "";
        if (st.doubleOut) {
          if (after === 0 && !(hit.mult === 2 || hit.num === 50)) { bust = true; reason = "must finish on a double"; }
          else if (after === 1) { bust = true; reason = "1 left — can't finish"; }
          else if (after < 0) { bust = true; reason = "went below zero"; }
        } else if (after < 0) { bust = true; reason = "went below zero"; }
        if (after === 0 && !bust) {
          p.score = 0; p.darts++;
          st.turnThrows.push({ p: p.name, label: hit.label, score: hit.score, bust: false, note: "checkout!" });
          st.over = true;
          st.winner = p;
        } else if (bust) {
          p.darts++;
          st.turnThrows.push({ p: p.name, label: hit.label, score: hit.score, bust: true, note: reason });
          p.score = st.turnStart;
        } else {
          p.score = after; p.darts++; p.scored += hit.score;
          st.turnThrows.push({ p: p.name, label: hit.label, score: hit.score, bust: false, note: "" });
        }
        st.dartsLeft--;
        drawAll();
      }

      function nextTurn() {
        if (st.over) return;
        st.turn = (st.turn + 1) % 2;
        st.dartsLeft = 3;
        st.turnStart = cur().score;
        st.turnThrows = [];
        drawAll();
        if (cur().cpu && !st.over) setTimeout(cpuTurn, 650);
      }

      function cpuTurn() {
        if (st.over) return;
        let guard = 0;
        const step = () => {
          if (st.over || !cur().cpu || st.dartsLeft === 0 || guard++ > 5) return;
          const target = chooseCpuThrow(cur().score);
          /* add a little scatter to make it human */
          let hit = target;
          if (Math.random() > 0.78) {
            const slip = U.randInt(1, 19);
            const n = Math.max(1, (target.num || target.score) - slip);
            hit = { num: n, mult: 1, label: "S" + n, score: n };
          }
          applyThrow(cur(), hit);
          drawAll();
          if (!st.over && st.dartsLeft > 0) setTimeout(step, 700);
          else if (!st.over) setTimeout(nextTurn, 650);
        };
        step();
      }

      function chooseCpuThrow(score) {
        const routes = checkouts(score, st.dartsLeft, st.doubleOut);
        if (routes.length) {
          const lab = routes[0][0];
          const t = parseThrow(lab);
          if (t) return t;
        }
        /* otherwise score big */
        if (score > 100 && Math.random() < 0.7) return { num: 20, mult: 3, label: "T20", score: 60 };
        if (score > 60) return { num: 20, mult: 1, label: "S20", score: 20 };
        /* aim at leaving a double */
        const want = score - U.pick([32, 40, 36, 24, 16, 8]);
        const t = ALL_DARTS.find((d) => d.s === want);
        return t ? { num: t.s, mult: t.m, label: t.label, score: t.s } : { num: 20, mult: 1, label: "S20", score: 20 };
      }

      function undo() {
        if (st.over) return;
        const p = cur();
        const last = st.turnThrows[st.turnThrows.length - 1];
        if (!last) { ML.toast("Nothing to undo"); return; }
        st.turnThrows.pop();
        p.score = last.bust ? p.score : p.score + last.score;
        if (!last.bust) p.scored -= last.score;
        p.darts--; st.dartsLeft++;
        drawAll();
      }

      function drawAll() {
        /* scoreboard */
        const sb = wrap.querySelector("#scoreboard");
        sb.innerHTML = st.players.map((p, i) => `
          <div class="card pad" style="margin-bottom:10px;border:2px solid ${i === st.turn && !st.over ? "var(--brand)" : "var(--line)"};background:${i === st.turn && !st.over ? "linear-gradient(180deg,#fbfaff,#fff)" : "#fff"}">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap">
              <div style="display:flex;align-items:center;gap:12px;min-width:150px">
                <div style="width:40px;height:40px;border-radius:11px;display:grid;place-items:center;font-weight:850;background:${i ? "#e8f1ff" : "#eeecff"};color:${i ? "#1a58b8" : "#4b3ee0"}">${p.cpu ? "CPU" : "P" + (i + 1)}</div>
                <div><b style="font-size:15px">${p.name}</b><div class="small muted">${i === st.turn && !st.over ? "throwing · " + st.dartsLeft + " dart" + (st.dartsLeft === 1 ? "" : "s") + " left" : p.darts + " darts"}</div></div>
              </div>
              <div style="text-align:right">
                <div style="font-size:44px;font-weight:850;letter-spacing:-.04em;line-height:1;font-variant-numeric:tabular-nums;color:${p.score <= 170 && i === st.turn ? "var(--brand-ink)" : "var(--ink)"}">${p.score}</div>
                <div class="small muted">${p.darts ? (p.scored / p.darts).toFixed(1) + " per dart" : "to throw"}</div>
              </div>
            </div>
            ${i === st.turn && !st.over ? `<div style="display:flex;gap:6px;margin-top:12px;min-height:34px">${
              [0, 1, 2].map((k) => {
                const t = st.turnThrows[k];
                if (t) return `<span class="badge ${t.bust ? "no" : "ok"}" style="padding:7px 12px">${t.label} <span style="opacity:.7">(${t.score})</span>${t.bust ? " &times;" : ""}</span>`;
                return `<span class="badge" style="padding:7px 12px;opacity:.55">dart ${k + 1}</span>`;
              }).join("")
            }</div>` : ""}
          </div>`).join("");

        /* winner banner */
        if (st.over) {
          sb.insertAdjacentHTML("afterbegin", `<div class="card pad" style="margin-bottom:12px;background:linear-gradient(135deg,#e3f8ec,#f3fff8);border-color:#b7e7cb">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap">
              <div><div class="eyebrow" style="color:#157a43">Game shot</div><h2>${st.winner.name} wins!</h2>
              <p class="small muted" style="margin:2px 0 0">${st.winner.darts} darts · ${(st.winner.scored / st.winner.darts).toFixed(1)} average</p></div>
              <button class="btn good" id="rematch">Rematch</button>
            </div></div>`);
          const rb = sb.querySelector("#rematch");
          if (rb) rb.addEventListener("click", () => { newGame(); drawAll(); });
          U.sound.win();
        }

        /* checkout hint */
        const note = wrap.querySelector("#checkoutNote");
        const p = cur();
        if (!st.over && !p.cpu) {
          const routes = checkouts(p.score, st.dartsLeft, st.doubleOut);
          if (routes.length) {
            const best = routes.slice(0, 3).map((r) => r.join(" &rarr; ")).join("  ·  ");
            note.innerHTML = `<b>Checkout (${p.score}):</b><br><span class="mono" style="color:var(--brand-ink)">${best}</span>`;
          } else if (p.score > 170) {
            note.innerHTML = `${p.score} — too high to finish in three darts. Set up a double.`;
          } else if (p.score <= 170) {
            note.innerHTML = `${p.score} can't be checked out in ${st.dartsLeft} dart${st.dartsLeft === 1 ? "" : "s"}${st.doubleOut ? " on a double" : ""}.`;
          }
        } else if (st.over) note.innerHTML = "Match complete — start a new game to play again.";
        else note.innerHTML = "Computer is throwing…";

        /* throw log */
        const tbl = wrap.querySelector("#throwLog");
        tbl.innerHTML = `<tr><th>Player</th><th>Throw</th><th>Score</th><th>Note</th></tr>` +
          st.turnThrows.map((t) => `<tr><td>${t.p}</td><td class="mono">${t.label}</td><td class="mono">${t.score}</td><td class="small" style="color:${t.bust ? "var(--red)" : "var(--muted)"}">${t.bust ? "bust – " + t.note : t.note}</td></tr>`).join("") ||
          `<tr><td colspan="4" class="muted small">No darts thrown this turn.</td></tr>`;
        wrap.querySelector("#avg").textContent = st.players.map((x) => `${x.name}: ${x.darts ? (x.scored / x.darts).toFixed(1) : "0.0"}`).join("  ·  ");
      }

      newGame();
      U.$$("#modeSeg button", wrap).forEach((x) => x.classList.toggle("on", x.dataset.m === st.mode));
      drawAll();
    },
  });

  /* =========================================================
     3 DART CHECKOUT TRAINER
     ========================================================= */
  ML.register({
    id: "checkout", group: "games", title: "3 Dart Checkout",
    short: "Checkouts", icon: ML.icon('receipt'), color: ["#e0f7f5", "#0b7a73"], tag: "Games & challenges",
    blurb: "Every finish from 41 to 170 in three darts. Throw it out on the board, or ask for the textbook route.",
    tags: ["3 Dart Checkout.exe", "doubles", "finishing", "hints", "practice"],
    mount(root) {
      const st = { target: 0, thrown: [], doubleOut: true, streak: 0, best: 0, attempts: 0, solves: 0, hard: false };
      function newTarget() {
        st.hint = "";
        st.target = st.hard ? U.pick([61, 62, 63, 64, 65, 66, 68, 69, 71, 73, 74, 76, 81, 82, 84, 86, 88, 90, 91, 92, 95, 96, 98, 99, 100, 101, 102, 104, 107, 108, 110, 111, 112, 116, 118, 120, 121, 122, 124, 125, 126, 127, 128, 129, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170])
          : U.randInt(41, 100);
        st.thrown = [];
        draw();
      }
      const wrap = U.el("div", { class: "app-layout" });
      wrap.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Challenge</div>
            <div class="panel-b tight">
              <div class="stat" style="text-align:center"><span>Finish</span><b style="font-size:34px" id="target">—</b></div>
              <div class="progress"><i id="bar" style="width:0%"></i></div>
              <div class="row2">
                <div class="stat"><span>Streak</span><b id="streak">0</b></div>
                <div class="stat"><span>Best</span><b id="best">0</b></div>
              </div>
              <div class="stat"><span>Solved</span><b id="solved">0 / 0</b></div>
              <button class="btn ghost sm" id="hintBtn">${ML.icon("bulb")} Show the textbook route</button>
              <button class="btn ghost sm" id="skipBtn">Skip this finish ${ML.icon("arrow")}</button>
              <label class="check"><input type="checkbox" id="hardChk"> Hard finishes only (legs 5+)</label>
              <div class="note">Last dart must be a double (or bullseye). <span class="kbd">Backspace</span> removes the last dart.</div>
            </div>
          </div>
          <div class="panel">
            <div class="panel-h">Type a throw</div>
            <div class="panel-b tight">
              <div style="display:flex;gap:7px"><input type="text" id="ci" placeholder="D16" autocomplete="off" spellcheck="false" style="font-family:var(--fm)"><button class="btn sm" id="cb">Throw</button></div>
              <button class="btn ghost sm" id="clearThrows">Reset throws</button>
            </div>
          </div>
        </aside>
        <div class="stage">
          <div class="panel" style="overflow:hidden">
            <div class="panel-h"><span>Board</span><span class="small muted">click where you want it to land</span></div>
            <div style="padding:16px;background:radial-gradient(circle at 50% 35%,#1a1f2b,#0b0e14)"><div id="bhost"></div></div>
          </div>
          <div class="card" style="margin-top:16px"><div class="card-b" id="feedback"></div></div>
        </div>`;
      root.appendChild(wrap);
      const host = wrap.querySelector("#bhost");
      const board = buildBoard((hit) => throwIt(hit), { label: "Dartboard, click to throw" });
      host.appendChild(board);

      wrap.querySelector("#hintBtn").addEventListener("click", () => {
        const routes = checkouts(st.target, 3 - st.thrown.length, st.doubleOut);
        if (!routes.length) { st.hint = ""; ML.toast("No finish with the darts you have left — try a different route", "no"); }
        else st.hint = routes[0].join(" &rarr; ");
        draw();
      });
      wrap.querySelector("#skipBtn").addEventListener("click", () => { st.streak = 0; newTarget(); });
      wrap.querySelector("#hardChk").addEventListener("change", (e) => { st.hard = e.target.checked; newTarget(); });
      wrap.querySelector("#clearThrows").addEventListener("click", () => { st.thrown = []; st.hint = ""; draw(); });
      wrap.querySelector("#cb").addEventListener("click", submitTyped);
      wrap.querySelector("#ci").addEventListener("keydown", (e) => { if (e.key === "Enter") submitTyped(); });
      function submitTyped() {
        const inp = wrap.querySelector("#ci");
        const t = parseThrow(inp.value);
        if (!t) return ML.toast("Try D16, T20, 25…", "no");
        inp.value = ""; throwIt(t);
      }
      document.addEventListener("keydown", function bs(e) {
        if (e.key === "Backspace" && document.activeElement.tagName !== "INPUT") { st.thrown.pop(); draw(); }
      });

      function throwIt(hit) {
        if (st.thrown.length >= 3) return;
        st.thrown.push(hit);
        const total = st.thrown.reduce((a, b) => a + b.score, 0);
        const left = st.target - total;
        U.sound.thud();
        draw();
        if (left === 0) {
          const last = st.thrown[st.thrown.length - 1];
          const okFinish = !st.doubleOut || last.mult === 2 || last.num === 50;
          if (okFinish) {
            st.streak++; st.best = Math.max(st.best, st.streak); st.attempts++; st.solves++;
            U.sound.win();
            wrap.querySelector("#feedback").innerHTML = `<div class="badge ok" style="font-size:13.5px">Checked out with ${st.thrown.map((t) => t.label).join(" &rarr; ")} — nice darts!</div>`;
            setTimeout(() => { if (st.thrown.reduce((a, b) => a + b.score, 0) === st.target) newTarget(); }, 1200);
          } else {
            st.streak = 0; st.attempts++;
            U.sound.no();
            wrap.querySelector("#feedback").innerHTML = `<div class="badge no" style="font-size:13.5px">You reached zero, but the last dart must be a double.</div>`;
            setTimeout(newTarget, 1400);
          }
          return;
        }
        if (left < 0 || (st.doubleOut && left === 1)) {
          st.streak = 0; st.attempts++;
          U.sound.no();
          wrap.querySelector("#feedback").innerHTML = `<div class="badge no" style="font-size:13.5px">Bust — ${left < 0 ? "that went past zero" : "1 left can't be finished"}. Reset and try again.</div>`;
          setTimeout(newTarget, 1400);
          return;
        }
        if (st.thrown.length === 3) {
          st.attempts++; st.streak = 0;
          wrap.querySelector("#feedback").innerHTML = `<div class="badge" style="font-size:13.5px">Out of darts — ${left} left. Next finish incoming…</div>`;
          setTimeout(newTarget, 1100);
        }
      }

      function draw() {
        wrap.querySelector("#target").textContent = st.target;
        const total = st.thrown.reduce((a, b) => a + b.score, 0);
        wrap.querySelector("#bar").style.width = Math.min(100, (total / st.target) * 100) + "%";
        wrap.querySelector("#streak").textContent = st.streak;
        wrap.querySelector("#best").textContent = st.best;
        wrap.querySelector("#solved").textContent = `${st.solves} / ${st.attempts}`;
        const fb = wrap.querySelector("#feedback");
        const slots = [0, 1, 2].map((i) => {
          const t = st.thrown[i];
          return `<div class="stat" style="text-align:center;flex:1;min-width:86px;${t ? "background:var(--brand-soft);border-color:#d9d5ff" : ""}">
            <span>dart ${i + 1}</span><b style="font-size:22px;color:${t ? "var(--brand-ink)" : "var(--muted)"}">${t ? t.label : "—"}</b></div>`;
        }).join("");
        fb.innerHTML = `<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:12px">${slots}</div>
          ${st.hint ? `<div class="badge info" style="margin-bottom:12px;font-size:13px">Textbook route: <b class="mono">${st.hint}</b></div>` : ""}
          <div style="display:flex;gap:20px;flex-wrap:wrap">
            <div class="stat"><span>Thrown</span><b>${total}</b></div>
            <div class="stat"><span>Remaining</span><b style="color:${st.target - total <= 40 ? "var(--brand-ink)" : "inherit"}">${st.target - total}</b></div>
            <div class="stat"><span>Darts left</span><b>${3 - st.thrown.length}</b></div>
          </div>`;
      }

      newTarget();
      wrap.querySelector("#ci").focus();
    },
  });
})();

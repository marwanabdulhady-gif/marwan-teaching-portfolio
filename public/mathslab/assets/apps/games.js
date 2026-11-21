/* ===========================================================
   MathsLab — games: alien coordinates, asteroids, transformations
   =========================================================== */
(function () {
  "use strict";
  const ML = window.ML, U = ML.u;
  const SVGNS = "http://www.w3.org/2000/svg";
  function S(tag, attrs, text) {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function fitCanvas(cv) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const r = cv.getBoundingClientRect();
    const w = Math.max(300, Math.round(r.width)), h = Math.max(220, Math.round(r.height || 400));
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  /* =========================================================
     ALIEN COORDINATE GAME
     ========================================================= */
  ML.register({
    id: "aliens", group: "games", title: "Alien Coordinate Game",
    short: "Aliens", icon: ML.icon('alien'), color: ["#e3f8ec", "#157a43"], tag: "Game",
    blurb: "Aliens are landing on the grid. Read the coordinates, click the right spot, and clear the invasion before the clock runs out.",
    tags: ["Alien Coordinate Game.exe", "first quadrant", "four quadrants", "plotting"],
    mount(root) {
      const st = { quadrants: 1, size: 10, aliens: [], score: 0, misses: 0, clock: 60, running: false, timer: null, target: null, mode: "read" };
      const wrap = U.el("div", { class: "app-layout" });
      wrap.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Mission</div>
            <div class="panel-b tight">
              <div class="seg" id="qSeg"><button data-q="1" class="on">1 quadrant</button><button data-q="4">4 quadrants</button></div>
              <div class="seg" id="modeSeg"><button data-m="read" class="on">Read &amp; click</button><button data-m="type">Type coords</button></div>
              <div class="row2">
                <div class="stat"><span>Score</span><b id="score">0</b></div>
                <div class="stat"><span>Time</span><b id="clock">1:00</b></div>
              </div>
              <div class="stat"><span>Accuracy</span><b id="acc">—</b></div>
              <button class="btn" id="startBtn"> Start mission</button>
              <div class="note">Coordinates are written <b>(x, y)</b> — along the corridor, then up the stairs.</div>
            </div>
          </div>
        </aside>
        <div class="stage">
          <div class="panel" style="overflow:hidden">
            <div class="panel-h"><span>Grid</span><span class="small muted" id="status">Press start to begin</span></div>
            <div style="padding:14px;background:linear-gradient(180deg,#f7fbff,#fff);position:relative">
              <div id="gridHost"></div>
              <div id="boom" style="position:absolute;inset:0;pointer-events:none"></div>
            </div>
          </div>
        </div>`;
      root.appendChild(wrap);
      const host = wrap.querySelector("#gridHost");
      const status = wrap.querySelector("#status");
      let dim = 10, ox = 0, oy = 0, cell = 30, svg = null;

      function buildGrid() {
        host.innerHTML = "";
        const half = st.quadrants === 4 ? st.size : 0;
        const gridW = st.quadrants === 4 ? 2 * st.size : st.size;
        const pad = 34;
        cell = 46;
        const W = gridW * cell + pad * 2, H = gridW * cell + pad * 2;
        dim = gridW;
        ox = pad + half * cell;
        oy = pad + half * cell;
        svg = S("svg", { viewBox: `0 0 ${W} ${H}`, style: "display:block;width:100%;max-width:" + Math.min(W, 560) + "px;height:auto;aspect-ratio:1/1;margin:0 auto;border-radius:14px;background:#0d1220;cursor:crosshair", role: "application", "aria-label": "Coordinate grid" });
        /* grid lines */
        for (let i = 0; i <= gridW; i++) {
          const major = st.quadrants === 4 ? (i === st.size) : (i === 0);
          svg.appendChild(S("line", { x1: pad + i * cell, y1: pad, x2: pad + i * cell, y2: pad + gridW * cell, stroke: major ? "#6b7fa6" : "#243352", "stroke-width": major ? 2 : 1 }));
          svg.appendChild(S("line", { x1: pad, y1: pad + i * cell, x2: pad + gridW * cell, y2: pad + i * cell, stroke: major ? "#6b7fa6" : "#243352", "stroke-width": major ? 2 : 1 }));
        }
        /* axes */
        const ax = pad + half * cell, ay = pad + half * cell;
        if (st.quadrants === 4) {
          svg.appendChild(S("line", { x1: pad, y1: ay, x2: pad + dim * cell, y2: ay, stroke: "#8ea2c6", "stroke-width": 2 }));
          svg.appendChild(S("line", { x1: ax, y1: pad, x2: ax, y2: pad + dim * cell, stroke: "#8ea2c6", "stroke-width": 2 }));
          for (let v = -half; v <= half; v++) {
            if (v === 0) continue;
            const px = pad + (v + half) * cell + cell / 2, py = pad + (half - v) * cell + cell / 2;
            svg.appendChild(S("text", { x: px, y: ay + 16, fill: "#8ea2c6", "font-size": 11, "text-anchor": "middle", "font-family": "ui-monospace,monospace" }, v));
            svg.appendChild(S("text", { x: ax - 8, y: py + 4, fill: "#8ea2c6", "font-size": 11, "text-anchor": "end", "font-family": "ui-monospace,monospace" }, v));
          }
          svg.appendChild(S("text", { x: pad + dim * cell - 4, y: ay - 8, fill: "#c7d3ea", "font-size": 12, "font-weight": 800, "text-anchor": "end" }, "x"));
          svg.appendChild(S("text", { x: ax + 8, y: pad + 14, fill: "#c7d3ea", "font-size": 12, "font-weight": 800 }, "y"));
        } else {
          svg.appendChild(S("line", { x1: pad, y1: pad + st.size * cell, x2: pad + st.size * cell, y2: pad + st.size * cell, stroke: "#8ea2c6", "stroke-width": 2.2 }));
          svg.appendChild(S("line", { x1: pad, y1: pad, x2: pad, y2: pad + st.size * cell, stroke: "#8ea2c6", "stroke-width": 2.2 }));
          for (let v = 1; v <= st.size; v++) {
            svg.appendChild(S("text", { x: pad + (v - 1) * cell + cell / 2, y: pad + st.size * cell + 16, fill: "#8ea2c6", "font-size": 11, "text-anchor": "middle", "font-family": "ui-monospace,monospace" }, v));
            svg.appendChild(S("text", { x: pad - 8, y: pad + (st.size - v) * cell + cell / 2 + 4, fill: "#8ea2c6", "font-size": 11, "text-anchor": "end", "font-family": "ui-monospace,monospace" }, v));
          }
        }
        svg.appendChild(S("rect", { x: pad, y: pad, width: gridW * cell, height: gridW * cell, fill: "none", stroke: "#6b7fa6", "stroke-width": 1.4 }));
        if (st.quadrants !== 4) {
          const sx = pad + cell / 2, sy = pad + gridW * cell - cell / 2;
          svg.appendChild(S("circle", { cx: sx, cy: sy, r: cell * 0.18, fill: "#ffb020" }));
          svg.appendChild(S("text", { x: sx, y: sy + 4, "text-anchor": "middle", "font-size": 10, "font-weight": 900, fill: "#3a2c00", "font-family": "system-ui,sans-serif" }, "0"));
          svg.appendChild(S("text", { x: sx + cell * 0.42, y: sy - cell * 0.22, "font-size": 9.5, "font-weight": 800, fill: "#ffb020", "font-family": "system-ui,sans-serif" }, "START"));
        }
        const hint = S("text", { x: W / 2, y: H / 2, "text-anchor": "middle", "font-size": 15, "font-weight": 700, fill: "#8ea2c6", "font-family": "system-ui,sans-serif" });
        hint.textContent = "Press start to place the aliens";
        svg.appendChild(hint);
        st._hint = hint;
        host.appendChild(svg);
        svg.addEventListener("click", onGridClick);
        svg.addEventListener("mousemove", onHover);
        drawAliens();
      }
      function cellCenter(x, y) {
        const half = st.quadrants === 4 ? st.size : 0;
        const pad = 34;
        if (st.quadrants === 4) {
          return [pad + (x + half) * cell + cell / 2, pad + (half - y) * cell + cell / 2];
        }
        return [pad + (x - 1) * cell + cell / 2, pad + (st.size - y) * cell + cell / 2];
      }
      function pickCell(ev) {
        const r = svg.getBoundingClientRect();
        const pad = 34;
        const gridWp = st.quadrants === 4 ? 2 * st.size : st.size;
        const W = gridWp * cell + pad * 2;
        const px = ((ev.clientX - r.left) / r.width) * W;
        const py = ((ev.clientY - r.top) / r.height) * W;
        const half = st.quadrants === 4 ? st.size : 0;
        let x, y;
        if (st.quadrants === 4) {
          x = Math.floor((px - pad) / cell) - half;
          y = half - Math.floor((py - pad) / cell);
        } else {
          x = Math.floor((px - pad) / cell) + 1;
          y = st.size - Math.floor((py - pad) / cell);
        }
        const lim = st.size;
        const lo = st.quadrants === 4 ? -st.size : 1;
        if (x < lo || x > lim || y < lo || y > lim) return null;
        return [x, y];
      }
      function onHover(ev) {
        const c = pickCell(ev);
        if (!c || !st.running) return;
        status.textContent = `(${c[0]}, ${c[1]})`;
      }
      function drawAliens() {
        U.$$("[data-alien]", svg).forEach((n) => n.remove());
        st.aliens.forEach((a) => {
          const [cx, cy] = cellCenter(a.x, a.y);
          const g = S("g", { "data-alien": "1", style: "pointer-events:none" });
          const alive = st.running && st.target && a.x === st.target.x && a.y === st.target.y;
          g.appendChild(S("circle", { cx, cy, r: cell * 0.36, fill: alive ? "#7dffa8" : "#2b3653", opacity: alive ? ".95" : ".6" }));
          g.appendChild(S("circle", { cx: cx - cell * 0.11, cy: cy - cell * 0.1, r: cell * 0.065, fill: "#0d1220" }));
          g.appendChild(S("circle", { cx: cx + cell * 0.11, cy: cy - cell * 0.1, r: cell * 0.065, fill: "#0d1220" }));
          g.appendChild(S("path", { d: `M ${cx - cell * 0.15} ${cy + cell * 0.08} q ${cell * 0.15} ${cell * 0.14} ${cell * 0.3} 0`, fill: "none", stroke: "#0d1220", "stroke-width": 2, "stroke-linecap": "round" }));
          svg.appendChild(g);
        });
      }
      function spawn() {
        st.aliens = [];
        const lo = st.quadrants === 4 ? -st.size : 1;
        const used = new Set();
        const n = st.quadrants === 4 ? 6 : 7;
        while (st.aliens.length < n) {
          const x = U.randInt(lo, st.size), y = U.randInt(lo, st.size);
          const k = x + "," + y;
          if (used.has(k)) continue;
          used.add(k); st.aliens.push({ x, y });
        }
        if (st._hint) { st._hint.remove(); st._hint = null; }
        st.target = U.pick(st.aliens);
        drawAliens();
        const t = st.target;
        status.innerHTML = st.mode === "read"
          ? `Alien spotted at <b class="mono" style="color:#7dffa8">(${t.x}, ${t.y})</b> — click it!`
          : `Alien at <b class="mono" style="color:#7dffa8">(${t.x}, ${t.y})</b> — type the coordinates and press Enter.`;
      }
      function onGridClick(ev) {
        if (!st.running) return;
        const c = pickCell(ev);
        if (!c) return;
        if (st.mode === "type") { ML.toast("Type the coordinates in the box instead"); return; }
        handleShot(c[0], c[1]);
      }
      function handleShot(x, y) {
        const t = st.target;
        if (x === t.x && y === t.y) {
          st.score += 10; U.sound.win(); boom(t);
          st.aliens = st.aliens.filter((a) => !(a.x === t.x && a.y === t.y));
          drawAliens();
          if (st.aliens.length) spawn(); else { st.aliens = []; spawn(); }
          ML.record(true);
        } else {
          st.misses++; U.sound.no(); ML.record(false);
          status.innerHTML = `Missed — that was <b class="mono">(${x}, ${y})</b>. Alien is at <b class="mono" style="color:#7dffa8">(${st.target.x}, ${st.target.y})</b>.`;
        }
        updateHud();
      }
      function boom(a) {
        const [cx, cy] = cellCenter(a.x, a.y);
        const g = S("g", {});
        g.appendChild(S("text", { x: cx, y: cy + cell * 0.2, "font-size": cell * 0.8, "text-anchor": "middle", fill: "#ffb020", "font-weight": 900 }, "\u2733"));
        svg.appendChild(g);
        let t0 = performance.now();
        (function f(now) {
          const k = (now - t0) / 600;
          if (k >= 1) { g.remove(); return; }
          g.setAttribute("opacity", String(1 - k));
          g.setAttribute("transform", `translate(0 ${-k * 14})`);
          requestAnimationFrame(f);
        })(t0);
      }
      function updateHud() {
        wrap.querySelector("#score").textContent = st.score;
        const total = st.score / 10 + st.misses;
        wrap.querySelector("#acc").textContent = total ? Math.round((st.score / 10 / total) * 100) + "%" : "—";
      }
      function start() {
        st.score = 0; st.misses = 0; st.clock = 60; st.running = true;
        updateHud(); spawn();
        wrap.querySelector("#clock").textContent = "1:00";
        clearInterval(st.timer);
        st.timer = setInterval(() => {
          st.clock--;
          wrap.querySelector("#clock").textContent = "0:" + String(Math.max(0, st.clock)).padStart(2, "0");
          if (st.clock <= 0) {
            clearInterval(st.timer); st.running = false;
            U.sound.win();
            status.innerHTML = `Mission over — <b>${st.score}</b> points and ${st.misses} miss${st.misses === 1 ? "" : "es"}.`;
          }
        }, 1000);
      }
      wrap.querySelector("#startBtn").addEventListener("click", start);
      wrap.querySelector("#qSeg").addEventListener("click", (e) => {
        const b = e.target.closest("button[data-q]"); if (!b) return;
        st.quadrants = +b.dataset.q;
        U.$$("#qSeg button", wrap).forEach((x) => x.classList.toggle("on", x === b));
        buildGrid(); if (st.running) spawn();
      });
      wrap.querySelector("#modeSeg").addEventListener("click", (e) => {
        const b = e.target.closest("button[data-m]"); if (!b) return;
        st.mode = b.dataset.m;
        U.$$("#modeSeg button", wrap).forEach((x) => x.classList.toggle("on", x === b));
        buildGrid(); if (st.running) spawn();
        ensureTypeBox();
      });
      function ensureTypeBox() {
        let box = wrap.querySelector("#typeBox");
        if (st.mode !== "type") { if (box) box.remove(); return; }
        if (box) return;
        box = U.el("div", { class: "card pad", id: "typeBox", style: { marginTop: "14px" } });
        box.innerHTML = `<div style="display:flex;gap:10px;align-items:end;flex-wrap:wrap">
          <div class="field" style="flex:1;min-width:200px"><label>Type the coordinates</label>
            <input id="coordIn" type="text" placeholder="(3, 4)" spellcheck="false" style="font-family:var(--fm);font-size:18px;font-weight:800" autocomplete="off"></div>
          <button class="btn" id="fireBtn">${ML.icon("rocket")} Fire</button></div>
          <div class="small muted" style="margin-top:8px">Numbers first, then brackets — e.g. <span class="kbd">(3, 4)</span> or <span class="kbd">-2,5</span>.</div>`;
        host.parentElement.appendChild(box);
        const inp = box.querySelector("#coordIn");
        const fire = () => {
          const m = inp.value.match(/(-?\d+)\s*[, ]\s*(-?\d+)/);
          if (!m) return ML.toast("Write two numbers like (3, 4)", "no");
          if (!st.running) return ML.toast("Press start first");
          handleShot(+m[1], +m[2]);
          inp.value = ""; inp.focus();
        };
        box.querySelector("#fireBtn").addEventListener("click", fire);
        inp.addEventListener("keydown", (e) => { if (e.key === "Enter") fire(); });
      }
      buildGrid();
      ensureTypeBox();
    },
  });

  /* =========================================================
     ASTEROIDS  (asteroids.exe)
     ========================================================= */
  ML.register({
    id: "asteroids", group: "games", title: "Asteroids",
    short: "Asteroids", icon: ML.icon('rocket'), color: ["#e8f1ff", "#1a58b8"], tag: "Arcade",
    blurb: "Zap the asteroid carrying the right answer before the swarm reaches your ship. Times tables at arcade speed.",
    tags: ["asteroids.exe", "times tables", "fast recall", "arcade"],
    mount(root) {
      const st = { running: false, score: 0, lives: 3, level: 1, rocks: [], q: null, raf: 0, last: 0 };
      const wrap = U.el("div", { class: "app-layout" });
      wrap.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Mission control</div>
            <div class="panel-b tight">
              <div class="row2">
                <div class="stat"><span>Score</span><b id="score">0</b></div>
                <div class="stat"><span>Lives</span><b id="lives" style="color:#e5484d">♥♥♥</b></div>
              </div>
              <div class="stat"><span>Level</span><b id="level">1</b></div>
              <button class="btn" id="startBtn">${ML.icon("play")} Launch</button>
              <div class="note">Type the answer and press <span class="kbd">Enter</span>, or tap the right asteroid. Wrong shot costs a life.</div>
            </div>
          </div>
        </aside>
        <div class="stage">
          <div class="panel" style="overflow:hidden">
            <div class="panel-h"><span>Question</span><span class="mono" id="qText" style="font-size:16px;color:var(--brand-ink);font-weight:800">—</span></div>
            <div style="position:relative;background:radial-gradient(circle at 50% 120%,#16213b,#070a12)">
              <canvas id="acv" style="width:100%;height:480px;display:block;touch-action:manipulation"></canvas>
              <div id="overlay" style="position:absolute;inset:0;display:grid;place-items:center;color:#fff;text-align:center;padding:20px">
                <div>
                  <div style="font-size:44px;color:#7dffa8">${ML.icon("rocket")}</div>
                  <h2 style="color:#fff;margin:6px 0">Asteroids</h2>
                  <p style="color:#a9b6d0;max-width:38ch;margin:0 auto 14px">A swarm of numbered asteroids is drifting towards your ship. Destroy the one that answers the question.</p>
                  <button class="btn lg" id="launch2">${ML.icon("play")} Launch</button>
                </div>
              </div>
            </div>
          </div>
          <div style="margin-top:12px;display:flex;gap:10px"><input id="ansIn" type="text" inputmode="numeric" placeholder="Type the answer and press Enter" style="flex:1;font-family:var(--fm);font-size:16px;font-weight:700" autocomplete="off"><button class="btn" id="fireBtn">Fire</button></div>
        </div>`;
      root.appendChild(wrap);
      const cv = wrap.querySelector("#acv");
      const overlay = wrap.querySelector("#overlay");
      const qText = wrap.querySelector("#qText");
      const ansIn = wrap.querySelector("#ansIn");

      function newQuestion() {
        const a = U.randInt(2, 12), b = U.randInt(2, 12);
        st.q = { a, b, ans: a * b };
        qText.textContent = `${a} × ${b} = ?`;
        /* regenerate rock labels so the answer is present */
        const answers = new Set([st.q.ans]);
        while (answers.size < Math.min(4, st.rocks.length)) answers.add(U.randInt(4, 144));
        const pool = U.shuffle([...answers]);
        st.rocks.forEach((r, i) => { r.value = pool[i % pool.length]; });
      }
      function spawnRocks(n) {
        st.rocks = [];
        for (let i = 0; i < n; i++) {
          st.rocks.push({
            x: U.rand(40, 100) / 100, y: -U.rand(5, 40) / 100,
            vx: U.rand(-4, 4) / 1000, vy: (U.rand(2, 5) + st.level * 0.7) / 10000,
            r: U.rand(26, 38), value: 0, rot: U.rand(0, 6.28), spin: U.rand(-.02, .02),
          });
        }
      }
      const OVERLAY_HTML = overlay.innerHTML;
      function start() {
        overlay.innerHTML = OVERLAY_HTML;
        overlay.querySelector("#launch2").addEventListener("click", start);
        st.running = true; st.score = 0; st.lives = 3; st.level = 1;
        overlay.style.display = "none";
        spawnRocks(5);
        newQuestion();
        updateHud();
        st.last = performance.now();
        cancelAnimationFrame(st.raf);
        st.raf = requestAnimationFrame(loop);
        ansIn.focus();
      }
      function updateHud() {
        wrap.querySelector("#score").textContent = st.score;
        wrap.querySelector("#lives").textContent = "\u2665".repeat(Math.max(0, st.lives)) + "\u2661".repeat(Math.max(0, 3 - st.lives));
        wrap.querySelector("#level").textContent = st.level;
      }
      function loop(now) {
        if (!st.running) return;
        const dt = Math.min(40, now - st.last); st.last = now;
        const { ctx, w, h } = fitCanvas(cv);
        ctx.clearRect(0, 0, w, h);
        /* stars */
        ctx.fillStyle = "#1b2743";
        for (let i = 0; i < 40; i++) {
          const sx = ((i * 977) % w), sy = ((i * 613 + now * 0.012) % h);
          ctx.fillRect(sx, sy, 1.6, 1.6);
        }
        /* ship */
        ctx.save();
        ctx.translate(w / 2, h - 34);
        ctx.fillStyle = "#7dffa8";
        ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(12, 12); ctx.lineTo(0, 6); ctx.lineTo(-12, 12); ctx.closePath(); ctx.fill();
        ctx.restore();
        /* rocks */
        st.rocks.forEach((r) => {
          r.x += r.vx * dt; r.y += r.vy * dt; r.rot += r.spin;
          if (r.x < .05 || r.x > .95) r.vx *= -1;
          const cx = r.x * w, cy = r.y * h;
          r._cx = cx; r._cy = cy;
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(r.rot);
          const g = ctx.createRadialGradient(-r.r * .3, -r.r * .3, 2, 0, 0, r.r);
          g.addColorStop(0, "#8b93a8"); g.addColorStop(1, "#3a4055");
          ctx.fillStyle = g;
          ctx.beginPath();
          for (let i = 0; i <= 8; i++) {
            const a = (i / 8) * Math.PI * 2, rr = r.r * (0.86 + 0.14 * Math.sin(i * 2.7));
            i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
          }
          ctx.closePath(); ctx.fill();
          ctx.restore();
          ctx.fillStyle = "#fff"; ctx.font = "800 " + Math.round(r.r * 0.62) + "px ui-monospace,monospace";
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(String(r.value), cx, cy + 1);
        });
        /* reached the ship */
        for (const r of st.rocks) {
          if (r.y > 0.93) { loseLife("An asteroid broke through!"); break; }
        }
        if (st.running) st.raf = requestAnimationFrame(loop);
      }
      function loseLife(msg) {
        st.lives--;
        U.sound.no();
        updateHud();
        if (st.lives <= 0) return gameOver();
        ML.toast(msg, "no");
        spawnRocks(5); newQuestion();
      }
      function gameOver() {
        st.running = false;
        cancelAnimationFrame(st.raf);
        overlay.style.display = "grid";
        overlay.innerHTML = `<div><div style="font-size:44px;color:#ffb020">${ML.icon("warn")}</div><h2 style="color:#fff;margin:6px 0">Ship lost</h2>
          <p style="color:#a9b6d0">Final score <b style="color:#7dffa8">${st.score}</b> · reached level ${st.level}</p>
          <button class="btn lg" id="again">${ML.icon("undo")} Play again</button></div>`;
        overlay.querySelector("#again").addEventListener("click", start);
      }
      function shootValue(v) {
        if (!st.running) return;
        const hit = st.rocks.find((r) => r.value === v);
        if (v === st.q.ans && hit) {
          st.score += 10 * st.level; U.sound.win(); ML.record(true);
          st.rocks = st.rocks.filter((r) => r !== hit);
          if (!st.rocks.length) { st.level++; spawnRocks(5); } else if (st.rocks.length < 3) spawnRocks(5 - st.rocks.length);
          newQuestion(); updateHud();
        } else {
          ML.record(false);
          loseLife(`Wrong — ${st.q.a} × ${st.q.b} is not ${v}`);
        }
        updateHud();
      }
      cv.addEventListener("click", (e) => {
        if (!st.running) return;
        const r = cv.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const hit = st.rocks.find((k) => Math.hypot(x - k._cx, y - k._cy) <= k.r + 4);
        if (hit) shootValue(hit.value);
        else { st.lives--; updateHud(); if (st.lives <= 0) gameOver(); else { U.sound.no(); ML.toast("Missed!", "no"); } }
      });
      function fireTyped() {
        const v = parseInt(ansIn.value, 10);
        ansIn.value = "";
        if (!isFinite(v)) return;
        shootValue(v);
      }
      wrap.querySelector("#fireBtn").addEventListener("click", fireTyped);
      ansIn.addEventListener("keydown", (e) => { if (e.key === "Enter") fireTyped(); });
      wrap.querySelector("#startBtn").addEventListener("click", start);
      wrap.querySelector("#launch2").addEventListener("click", start);
      /* idle draw */
      const { ctx, w, h } = fitCanvas(cv);
      ctx.clearRect(0, 0, w, h);
    },
  });

  /* =========================================================
     TRANSFORMATIONS
     ========================================================= */
  const SHAPES = {
    triangle: [[0, 0], [2, 0], [0, 2]],
    square: [[0, 0], [2, 0], [2, 2], [0, 2]],
    flag: [[0, 0], [1.5, 0], [1.5, 1], [2.5, 1], [2.5, 2], [0, 2]],
    arrow: [[0, 0], [2, 1], [0, 2], [0.6, 1]],
  };
  function applyTransform(pts, kind, param) {
    return pts.map(([x, y]) => {
      switch (kind) {
        case "reflectX": return [x, -y];
        case "reflectY": return [-x, y];
        case "reflectYX": return [y, x];
        case "reflectYXneg": return [-y, -x];
        case "rot90": return [-y, x];
        case "rot180": return [-x, -y];
        case "rot270": return [y, -x];
        case "translate": return [x + param[0], y + param[1]];
        default: return [x, y];
      }
    });
  }

  ML.register({
    id: "transform", group: "numbers", title: "Transformations",
    short: "Transformations", icon: ML.icon('flip'), color: ["#fdeaf4", "#a81a6b"], tag: "Geometry",
    blurb: "Reflect, rotate and translate shapes on a coordinate grid and watch the coordinates change — then try the challenge mode.",
    tags: ["transformations game.exe", "reflection", "rotation", "translation"],
    mount(root) {
      const st = { shape: "triangle", pts: SHAPES.triangle.map((p) => p.slice()), history: [], mode: "free", challenge: null, score: 0, tries: 0 };
      const wrap = U.el("div", { class: "app-layout" });
      wrap.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Shape</div>
            <div class="panel-b tight">
              <select id="shapeSel">
                <option value="triangle">Triangle</option><option value="square">Square</option>
                <option value="flag">Flag</option><option value="arrow">Arrow</option>
              </select>
              <button class="btn ghost sm" id="resetBtn">${ML.icon("undo")} Back to start</button>
              <div class="seg" id="tmodeSeg"><button data-m="free" class="on">Explore</button><button data-m="challenge">Challenge</button></div>
              <div id="challengeBox"></div>
            </div>
          </div>
          <div class="panel">
            <div class="panel-h">Transformations</div>
            <div class="panel-b tight">
              <div class="small" style="font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)">Reflect</div>
              <div class="btn-row">
                <button class="btn sm ghost" data-t="reflectX">in x-axis</button>
                <button class="btn sm ghost" data-t="reflectY">in y-axis</button>
                <button class="btn sm ghost" data-t="reflectYX">in y = x</button>
              </div>
              <div class="small" style="font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)">Rotate (about origin)</div>
              <div class="btn-row">
                <button class="btn sm ghost" data-t="rot90">90° CW</button>
                <button class="btn sm ghost" data-t="rot180">180°</button>
                <button class="btn sm ghost" data-t="rot270">90° ACW</button>
              </div>
              <div class="small" style="font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)">Translate</div>
              <div class="row2">
                <div class="field"><label>x by</label><input type="number" id="tx" value="3"></div>
                <div class="field"><label>y by</label><input type="number" id="ty" value="-2"></div>
              </div>
              <button class="btn sm ghost" data-t="translate">Apply translation</button>
            </div>
          </div>
        </aside>
        <div class="stage">
          <div class="panel" style="overflow:hidden">
            <div class="panel-h"><span>Coordinate grid</span><span class="small muted" id="status"></span></div>
            <div style="padding:12px;background:linear-gradient(180deg,#fbfcff,#fff)"><div id="txHost"></div></div>
          </div>
          <div class="card" style="margin-top:16px;overflow:hidden">
            <div class="card-h"><h2>Coordinates</h2><span class="small muted" id="histNote"></span></div>
            <div class="scroll-x"><table class="data" id="coordTbl"></table></div>
          </div>
        </div>`;
      root.appendChild(wrap);
      const host = wrap.querySelector("#txHost");
      const status = wrap.querySelector("#status");

      function drawGrid() {
        host.innerHTML = "";
        const SIZE = 9, cell = 26, pad = 30;
        const W = (SIZE * 2 + 1) * cell + pad * 2;
        const svg = S("svg", { viewBox: `0 0 ${W} ${W}`, style: "display:block;width:100%;max-width:600px;height:auto;margin:0 auto" });
        const X = (x) => pad + (x + SIZE) * cell + cell / 2;
        const Y = (y) => pad + (SIZE - y) * cell + cell / 2;
        for (let i = -SIZE; i <= SIZE; i++) {
          svg.appendChild(S("line", { x1: pad, y1: pad + (i + SIZE) * cell, x2: pad + (2 * SIZE + 1) * cell, y2: pad + (i + SIZE) * cell, stroke: i === 0 ? "#c3cbda" : "#eef1f7" }));
          svg.appendChild(S("line", { x1: pad + (i + SIZE) * cell, y1: pad, x2: pad + (i + SIZE) * cell, y2: pad + (2 * SIZE + 1) * cell, stroke: i === 0 ? "#c3cbda" : "#eef1f7" }));
        }
        for (let i = -SIZE; i <= SIZE; i++) {
          if (i === 0 || i % 2) continue;
          svg.appendChild(S("text", { x: X(i), y: Y(0) + 16, "font-size": 10, fill: "#98a2b3", "text-anchor": "middle" }, i));
          svg.appendChild(S("text", { x: X(0) - 8, y: Y(i) + 3, "font-size": 10, fill: "#98a2b3", "text-anchor": "end" }, i));
        }
        /* original ghost */
        const orig = SHAPES[st.shape];
        svg.appendChild(S("polygon", {
          points: orig.map(([x, y]) => `${X(x)},${Y(y)}`).join(" "),
          fill: "rgba(152,162,179,.12)", stroke: "#98a2b3", "stroke-width": 1.6, "stroke-dasharray": "5 4"
        }));
        /* current */
        svg.appendChild(S("polygon", {
          points: st.pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(" "),
          fill: "rgba(230,69,156,.14)", stroke: "#e6459c", "stroke-width": 2.6, "stroke-linejoin": "round"
        }));
        st.pts.forEach(([x, y], i) => {
          svg.appendChild(S("circle", { cx: X(x), cy: Y(y), r: 4.2, fill: "#fff", stroke: "#a81a6b", "stroke-width": 2.4 }));
          svg.appendChild(S("text", { x: X(x) + 8, y: Y(y) - 8, "font-size": 11, "font-weight": 800, fill: "#a81a6b", "font-family": "ui-monospace,monospace" }, `${x},${y}`));
        });
        host.appendChild(svg);
        drawTable();
      }
      function drawTable() {
        const tbl = wrap.querySelector("#coordTbl");
        tbl.innerHTML = `<tr><th>vertex</th><th>start</th><th>now</th></tr>` +
          st.pts.map(([x, y], i) => `<tr><td>${String.fromCharCode(65 + i)}</td><td class="mono">(${SHAPES[st.shape][i][0]}, ${SHAPES[st.shape][i][1]})</td><td class="mono" style="font-weight:800;color:var(--brand-ink)">(${x}, ${y})</td></tr>`).join("");
        wrap.querySelector("#histNote").textContent = st.history.length ? st.history.join(" &rarr; ") : "no transformations yet";
      }
      function apply(kind, param) {
        st.pts = applyTransform(st.pts, kind, param);
        const names = {
          reflectX: "reflect in x-axis", reflectY: "reflect in y-axis", reflectYX: "reflect in y = x",
          reflectYXneg: "reflect in y = −x", rot90: "rotate 90° CW", rot180: "rotate 180°", rot270: "rotate 90° ACW",
          translate: `translate (${param[0]}, ${param[1]})`,
        };
        st.history.push(names[kind]);
        if (st.mode === "challenge" && st.challenge) checkChallenge(kind, param);
        drawGrid();
      }
      wrap.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => {
        const t = b.dataset.t;
        if (t === "translate") apply("translate", [parseInt(wrap.querySelector("#tx").value || "0", 10), parseInt(wrap.querySelector("#ty").value || "0", 10)]);
        else apply(t);
      }));
      wrap.querySelector("#shapeSel").addEventListener("change", (e) => {
        st.shape = e.target.value;
        st.pts = SHAPES[st.shape].map((p) => p.slice());
        st.history = [];
        newChallenge();
        drawGrid();
      });
      wrap.querySelector("#resetBtn").addEventListener("click", () => {
        st.pts = SHAPES[st.shape].map((p) => p.slice());
        st.history = [];
        drawGrid();
      });
      wrap.querySelector("#tmodeSeg").addEventListener("click", (e) => {
        const b = e.target.closest("button[data-m]"); if (!b) return;
        st.mode = b.dataset.m;
        U.$$("#tmodeSeg button", wrap).forEach((x) => x.classList.toggle("on", x === b));
        drawChallengeBox();
        if (st.mode === "challenge") newChallenge();
      });

      const CHALLENGES = [
        { kind: "reflectX", text: "Reflect the shape in the x-axis." },
        { kind: "reflectY", text: "Reflect the shape in the y-axis." },
        { kind: "rot180", text: "Rotate the shape 180° about the origin." },
        { kind: "rot90", text: "Rotate the shape 90° clockwise about the origin." },
        { kind: "rot270", text: "Rotate the shape 90° anticlockwise about the origin." },
        { kind: "reflectYX", text: "Reflect the shape in the line y = x." },
      ];
      function newChallenge() {
        if (st.mode !== "challenge") return;
        st.challenge = U.pick(CHALLENGES);
        st.pts = SHAPES[st.shape].map((p) => p.slice());
        st.history = [];
        drawChallengeBox(); drawGrid();
      }
      function drawChallengeBox() {
        const box = wrap.querySelector("#challengeBox");
        if (st.mode !== "challenge") { box.innerHTML = `<div class="note">Free exploration: press any transformation and watch the coordinates update.</div>`; return; }
        box.innerHTML = `<div class="stat" style="background:var(--pink-soft);border-color:#f6c9e0"><span>Challenge</span><b style="font-size:14.5px;line-height:1.35">${st.challenge.text}</b></div>
          <div class="row2"><div class="stat"><span>Correct</span><b>${st.score}</b></div><div class="stat"><span>Tries</span><b>${st.tries}</b></div></div>
          <button class="btn ghost sm" id="skipCh">Skip &rarr;</button>`;
        box.querySelector("#skipCh").addEventListener("click", newChallenge);
      }
      function checkChallenge(kind, param) {
        st.tries++;
        let want = st.challenge.kind;
        const okKind = kind === want;
        /* for translations there is no challenge */
        const target = applyTransform(SHAPES[st.shape], want, null);
        const right = okKind && st.pts.every((p, i) => p[0] === target[i][0] && p[1] === target[i][1]);
        if (right) {
          st.score++; U.sound.win(); ML.record(true);
          ML.toast("Correct transformation!", "ok");
          setTimeout(newChallenge, 700);
        } else {
          U.sound.no(); ML.record(false);
          st.pts = SHAPES[st.shape].map((p) => p.slice());
          st.history = [];
          ML.toast("Not quite — shape reset, try again", "no");
        }
        drawChallengeBox();
      }

      st.challenge = CHALLENGES[0];
      drawChallengeBox();
      drawGrid();
    },
  });
})();

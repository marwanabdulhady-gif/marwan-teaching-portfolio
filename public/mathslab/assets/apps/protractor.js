/* ===========================================================
   MathsLab — Protractor & Ruler
   The two instruments the Skills Review banks assume and a
   screen never gives you: a real semicircular protractor you
   drag a ray across, and a ruler you drag two ends along. Both
   read out the measurement (degrees; cm and mm) and both have a
   "measure it yourself" task with a tolerance check.
   =========================================================== */
(function () {
  "use strict";
  const ML = window.ML, U = ML.u;

  ML.register({
    id: "protractor", group: "numbers", title: "Protractor & Ruler",
    short: "Protractor", icon: ML.icon("bolt"),
    color: ["#fef3e2", "#b45309"], tag: "Measuring instruments",
    blurb: "A draggable protractor that reads the angle you draw, and a ruler that snaps to the millimetre — then a task that hides the readout and asks you to measure it yourself.",
    tags: ["protractor", "ruler", "degrees", "centimetres", "millimetres", "measurement"],
    mount(root) {
      const st = {
        mode: U.store.get("pr:mode", "angle"),   // angle | length
        deg: 55,
        snap: U.store.get("pr:snap", true),
        cm: 4.3,                                  // ruler length
        task: null,                               // {kind, value, options, done}
        score: U.store.get("pr:score", { right: 0, total: 0 }),
      };

      const wrap = U.el("div", { class: "app-layout" });
      wrap.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Instrument</div>
            <div class="panel-b tight">
              <div class="seg seg-col" id="prModes">
                <button data-m="angle">Protractor — angles</button>
                <button data-m="length">Ruler — lengths</button>
              </div>
              <label class="small" style="display:flex;gap:8px;align-items:center;margin-top:10px">
                <input type="checkbox" id="prSnap" ${st.snap ? "checked" : ""}> snap to whole degrees / millimetres
              </label>
            </div>
          </div>
          <div class="panel">
            <div class="panel-h">Set it</div>
            <div class="panel-b tight" id="prSet"></div>
          </div>
          <div class="panel">
            <div class="panel-h">Measure it yourself</div>
            <div class="panel-b tight" id="prTask"></div>
          </div>
        </aside>
        <div class="main">
          <div class="card" style="padding:14px">
            <canvas id="prCanvas" height="430" style="width:100%;display:block;touch-action:none;cursor:grab"></canvas>
            <div class="small muted" style="margin-top:6px" id="prHint"></div>
          </div>
          <div class="grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px" id="prRead"></div>
        </div>`;
      root.appendChild(wrap);

      const cv = U.$("#prCanvas", wrap);
      const ctx = cv.getContext ? cv.getContext("2d") : null;
      const read = U.$("#prRead", wrap);
      const setHost = U.$("#prSet", wrap);
      const taskHost = U.$("#prTask", wrap);
      const hint = U.$("#prHint", wrap);

      /* ---------------- geometry helpers ---------------- */
      let geo = { cx: 0, cy: 0, R: 0, w: 0, h: 0, pxPerMm: 6 };
      function size() {
        const w = cv.clientWidth || 560, h = 430, dpr = window.devicePixelRatio || 1;
        if (!ctx) { geo = Object.assign(geo, { w, h }); return; }
        cv.width = w * dpr; cv.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const R = Math.min(w / 2 - 40, h - 90);
        geo = { cx: w / 2, cy: h - 46, R, w, h, pxPerMm: Math.min(9, (w - 120) / 120) };
      }

      const rad = (d) => (d * Math.PI) / 180;

      /* ---------------- drawing ---------------- */
      function draw() {
        if (!ctx) return;
        size();
        const { cx, cy, R, w, h } = geo;
        ctx.clearRect(0, 0, w, h);
        if (st.mode === "angle") drawProtractor(cx, cy, R, w, h);
        else drawRuler(w, h);
      }

      function drawProtractor(cx, cy, R, w, h) {
        /* body */
        const grd = ctx.createLinearGradient(0, cy - R, 0, cy);
        grd.addColorStop(0, "#fffdf7");
        grd.addColorStop(1, "#fef3e2");
        ctx.fillStyle = grd;
        ctx.strokeStyle = "#e8c99b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, R, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        /* inner cut-out */
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.62, Math.PI, 0);
        ctx.strokeStyle = "#f0dcc0";
        ctx.stroke();

        /* degrees, both scales */
        for (let a = 0; a <= 180; a++) {
          const t = rad(a);
          const major = a % 10 === 0, mid = a % 5 === 0;
          const r0 = R - (major ? 16 : mid ? 10 : 5);
          ctx.strokeStyle = major ? "#8a6d3b" : "#c8ab7c";
          ctx.lineWidth = major ? 1.6 : 1;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(t) * r0, cy - Math.sin(t) * r0);
          ctx.lineTo(cx + Math.cos(t) * R, cy - Math.sin(t) * R);
          ctx.stroke();
          if (major) {
            ctx.fillStyle = "#8a6d3b";
            ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
            const lx = cx + Math.cos(t) * (R - 26), ly = cy - Math.sin(t) * (R - 26);
            ctx.textAlign = "center";
            ctx.fillText(String(a), lx, ly + 4);
            /* the outer (counter-clockwise) scale */
            ctx.fillStyle = "#b08c52";
            const ox = cx + Math.cos(t) * (R - 46), oy = cy - Math.sin(t) * (R - 46);
            ctx.fillText(String(180 - a), ox, oy + 4);
          }
        }
        ctx.textAlign = "left";

        /* the base line and the movable ray */
        ctx.strokeStyle = "#94703c"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke();

        const t = rad(st.deg);
        ctx.strokeStyle = "#b45309"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(t) * R * 0.98, cy - Math.sin(t) * R * 0.98); ctx.stroke();

        /* the swept sector */
        ctx.fillStyle = "rgba(180,83,9,.12)";
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R * 0.42, 0, -t, true);
        ctx.closePath(); ctx.fill();

        /* centre + draggable knob */
        ctx.fillStyle = "#94703c";
        ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
        const kx = cx + Math.cos(t) * R * 0.98, ky = cy - Math.sin(t) * R * 0.98;
        ctx.fillStyle = "#b45309";
        ctx.beginPath(); ctx.arc(kx, ky, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(kx, ky, 3, 0, Math.PI * 2); ctx.fill();

        if (!st.task || st.task.done) {
          ctx.fillStyle = "#7c2d12";
          ctx.font = "700 18px ui-sans-serif, system-ui, sans-serif";
          ctx.fillText(st.deg + "°", cx + 18, cy - 20);
        }
      }

      function drawRuler(w, h) {
        const y = h * 0.52, x0 = 46, x1 = w - 46;
        const mm = (x1 - x0) / geo.pxPerMm / 10;            // how many cm fit
        const cx0 = x0;
        const grd = ctx.createLinearGradient(0, y - 46, 0, y + 8);
        grd.addColorStop(0, "#fffdf7"); grd.addColorStop(1, "#fdf0d5");
        ctx.fillStyle = grd;
        ctx.strokeStyle = "#e8c99b"; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(x0, y - 46, x1 - x0, 54);
        ctx.fill(); ctx.stroke();

        /* cm + mm ticks */
        const perMm = geo.pxPerMm;
        for (let m = 0; m * perMm <= x1 - x0; m++) {
          const x = x0 + m * perMm;
          const big = m % 10 === 0, mid = m % 5 === 0;
          ctx.strokeStyle = big ? "#8a6d3b" : "#c8ab7c";
          ctx.lineWidth = big ? 1.6 : 1;
          ctx.beginPath();
          ctx.moveTo(x, y - 46 + 54);
          ctx.lineTo(x, y - 46 + 54 - (big ? 22 : mid ? 14 : 8));
          ctx.stroke();
          if (big) {
            ctx.fillStyle = "#8a6d3b";
            ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
            ctx.fillText(String(m / 10), x + 2, y - 46 + 16);
          }
        }

        /* the bar being measured */
        const bx0 = x0 + 20, bx1 = bx0 + st.cm * 10 * perMm;
        ctx.strokeStyle = "#b45309"; ctx.lineWidth = 7; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(bx0, y + 34); ctx.lineTo(bx1, y + 34); ctx.stroke();
        ctx.lineCap = "butt";
        ctx.fillStyle = "#b45309";
        [bx0, bx1].forEach((x) => { ctx.beginPath(); ctx.arc(x, y + 34, 7, 0, Math.PI * 2); ctx.fill(); });
        ctx.fillStyle = "#fff";
        [bx0, bx1].forEach((x) => { ctx.beginPath(); ctx.arc(x, y + 34, 2.6, 0, Math.PI * 2); ctx.fill(); });

        ctx.fillStyle = "#475467";
        ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText("ruler scale: " + mm.toFixed(0) + " cm wide", x0, y - 56);

        if (!st.task || st.task.done) {
          ctx.fillStyle = "#7c2d12";
          ctx.font = "700 17px ui-sans-serif, system-ui, sans-serif";
          ctx.fillText(st.cm.toFixed(1) + " cm = " + Math.round(st.cm * 10) + " mm", bx0, y + 66);
        }
      }

      /* ---------------- read-out ---------------- */
      function cards() {
        const hide = st.task && !st.task.done;      /* do not give the task away */
        if (st.mode === "angle") {
          const d = st.deg;
          if (hide) {
            read.innerHTML = `
              <div class="card" style="padding:12px 14px;border-left:4px solid #b45309">
                <div class="small muted">angle</div>
                <div style="font-size:24px;font-weight:800">? °</div>
                <div class="small muted">read it off the protractor, then answer on the left</div>
              </div>
              <div class="card" style="padding:12px 14px;border-left:4px solid #0f9d94">
                <div class="small muted">how to read it</div>
                <div style="font-weight:700;margin:2px 0">start at the 0 nearest the base line</div>
                <div class="small muted">the inner scale counts the angle you opened.</div>
              </div>`;
            return;
          }
          const kind = d < 90 ? "acute" : d === 90 ? "right" : d < 180 ? "obtuse" : "straight";
          read.innerHTML = `
            <div class="card" style="padding:12px 14px;border-left:4px solid #b45309">
              <div class="small muted">angle</div>
              <div style="font-size:24px;font-weight:800">${d}°</div>
              <div class="small muted">${kind} · complement ${d <= 90 ? 90 - d + "°" : "—"} · supplement ${180 - d}°</div>
            </div>
            <div class="card" style="padding:12px 14px;border-left:4px solid #0f9d94">
              <div class="small muted">reading the scales</div>
              <div style="font-weight:700;margin:2px 0">inner ${d}° · outer ${180 - d}°</div>
              <div class="small muted">start from the 0 on the side the ray begins, and count towards the other ray.</div>
            </div>`;
        } else {
          if (hide) {
            read.innerHTML = `
              <div class="card" style="padding:12px 14px;border-left:4px solid #b45309">
                <div class="small muted">length</div>
                <div style="font-size:24px;font-weight:800">? cm</div>
                <div class="small muted">line the 0 up with one end and read the other</div>
              </div>
              <div class="card" style="padding:12px 14px;border-left:4px solid #0f9d94">
                <div class="small muted">how to read it</div>
                <div style="font-weight:700;margin:2px 0">whole centimetres first</div>
                <div class="small muted">then count the millimetre ticks past the last one.</div>
              </div>`;
            return;
          }
          const cm = st.cm, whole = Math.floor(cm + 1e-9), mm = Math.round(cm * 10);
          read.innerHTML = `
            <div class="card" style="padding:12px 14px;border-left:4px solid #b45309">
              <div class="small muted">length</div>
              <div style="font-size:24px;font-weight:800">${cm.toFixed(1)} cm</div>
              <div class="small muted">${mm} mm = ${whole} cm ${mm - whole * 10} mm</div>
            </div>
            <div class="card" style="padding:12px 14px;border-left:4px solid #0f9d94">
              <div class="small muted">how to read it</div>
              <div style="font-weight:700;margin:2px 0">line the 0 up with one end</div>
              <div class="small muted">count the whole centimetres first, then the small millimetre ticks.</div>
            </div>`;
        }
      }

      function renderSet() {
        setHost.innerHTML = st.mode === "angle"
          ? `<input type="range" id="prDeg" min="0" max="180" step="1" value="${st.deg}" style="width:100%;accent-color:#b45309">
             <div class="row" style="display:flex;gap:6px;margin-top:8px">
               <button class="btn sm" data-d="-15">−15°</button>
               <button class="btn sm" data-d="-1">−1°</button>
               <button class="btn sm" data-d="1">+1°</button>
               <button class="btn sm" data-d="15">+15°</button>
             </div>`
          : `<input type="range" id="prCm" min="0.5" max="18" step="0.1" value="${st.cm}" style="width:100%;accent-color:#b45309">
             <div class="row" style="display:flex;gap:6px;margin-top:8px">
               <button class="btn sm" data-c="-1">−1 cm</button>
               <button class="btn sm" data-c="-0.1">−1 mm</button>
               <button class="btn sm" data-c="0.1">+1 mm</button>
               <button class="btn sm" data-c="1">+1 cm</button>
             </div>`;
        const r = U.$("#prDeg", setHost);
        if (r) r.addEventListener("input", (e) => { st.deg = Number(e.target.value); sync(false); });
        const c = U.$("#prCm", setHost);
        if (c) c.addEventListener("input", (e) => { st.cm = Math.round(Number(e.target.value) * 10) / 10; sync(false); });
        U.$$("button[data-d]", setHost).forEach((b) => b.addEventListener("click", () => setDeg(st.deg + Number(b.dataset.d))));
        U.$$("button[data-c]", setHost).forEach((b) => b.addEventListener("click", () => setCm(st.cm + Number(b.dataset.c))));
      }

      function setDeg(d) {
        let v = U.clamp(Math.round(d), 0, 180);
        st.deg = v; sync(true);
      }
      function setCm(c) {
        let v = Math.round(U.clamp(c, 0.5, 18) * 10) / 10;
        st.cm = v; sync(true);
      }

      function sync(updateSlider) {
        if (updateSlider) {
          const r = U.$("#prDeg", setHost); if (r && st.mode === "angle") r.value = st.deg;
          const c = U.$("#prCm", setHost); if (c && st.mode === "length") c.value = st.cm;
        }
        draw(); cards();
      }

      /* ---------------- dragging ---------------- */
      let drag = null;
      cv.addEventListener("pointerdown", (e) => {
        if (st.task && !st.task.done) return;      /* the measurement is fixed while the task runs */
        const r = cv.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        if (st.mode === "angle") {
          const dx = x - geo.cx, dy = geo.cy - y;
          if (Math.hypot(dx, dy) < 18 || dy > -10) return;
          drag = "angle"; cv.setPointerCapture(e.pointerId); fromPointer(x, y);
        } else {
          const x0 = 46 + 20, x1 = x0 + st.cm * 10 * geo.pxPerMm;
          const near0 = Math.abs(x - x0) < 18, near1 = Math.abs(x - x1) < 18;
          if (!near0 && !near1) return;
          drag = near1 ? "end" : "start";
          cv.setPointerCapture(e.pointerId);
        }
      });
      cv.addEventListener("pointermove", (e) => {
        if (!drag) return;
        const r = cv.getBoundingClientRect();
        if (drag === "angle") fromPointer(e.clientX - r.left, e.clientY - r.top);
        else {
          const x = e.clientX - r.left;
          const x0 = 46 + 20;
          const px = Math.max(0.5 * 10 * geo.pxPerMm, x - x0);
          setCm(px / geo.pxPerMm / 10);
        }
      });
      cv.addEventListener("pointerup", (e) => { drag = null; try { cv.releasePointerCapture(e.pointerId); } catch (err) {} });
      cv.addEventListener("pointercancel", () => { drag = null; });

      function fromPointer(x, y) {
        const a = (Math.atan2(geo.cy - y, x - geo.cx) * 180) / Math.PI;
        if (a < 0) return;                        // below the base line: not a protractor reading
        setDeg(st.snap ? Math.round(a) : a);
      }

      /* ---------------- the task ---------------- */
      function newTask() {
        st.task = st.mode === "angle" ? angleTask() : lengthTask();
        renderTask();
        draw();
        cards();
      }
      function angleTask() {
        const base = U.pick([15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165]);
        const opts = new Set([base]);
        while (opts.size < 4) {
          const off = U.pick([-20, -15, -10, -5, 5, 10, 15, 20]);
          const v = base + off;
          if (v > 0 && v < 180) opts.add(v);
        }
        st.deg = base;
        return { kind: "angle", value: base, options: U.shuffle(Array.from(opts).map((v) => ({ v, ok: v === base }))) };
      }
      function lengthTask() {
        const mm = U.randInt(8, 145);
        const base = Math.round(mm / 10 * 10) / 10;
        const opts = new Set([base]);
        while (opts.size < 4) {
          const v = Math.round((base + U.pick([-30, -20, -10, 10, 20, 30])) / 10 * 10) / 10;
          if (v > 0.4 && v < 18.1) opts.add(v);
        }
        st.cm = base;
        return { kind: "length", value: base, options: U.shuffle(Array.from(opts).map((v) => ({ v, ok: Math.abs(v - base) < 1e-9 }))) };
      }
      function renderTask() {
        const t = st.task, sc = st.score;
        const q = t.kind === "angle" ? "How many degrees is the angle shown?" : "How long is the bar, in centimetres?";
        const label = (o) => (t.kind === "angle" ? o.v + "°" : o.v.toFixed(1) + " cm");
        taskHost.innerHTML = `
          <div class="small muted">${sc.total ? sc.right + " of " + sc.total + " right" : "answer to start keeping score"}</div>
          <div style="font-weight:800;margin:6px 0 10px">${q}</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px" id="prOpts">
            ${t.options.map((o, i) => `<button class="btn sm" data-i="${i}" type="button">${label(o)}</button>`).join("")}
          </div>
          <button class="btn sm ghost" id="prNew" type="button" style="margin-top:10px">new measurement</button>`;
        U.$$("#prOpts .btn", taskHost).forEach((b) => b.addEventListener("click", () => {
          const i = Number(b.dataset.i), o = t.options[i];
          if (t.done) return;
          t.done = true;
          st.score.total++;
          if (o.ok) { st.score.right++; U.sound.ok(); b.classList.add("good"); }
          else {
            U.sound.no(); b.classList.add("danger");
            U.$$("#prOpts .btn", taskHost).forEach((x, k) => { if (t.options[k].ok) x.classList.add("good"); });
            ML.toast(t.kind === "angle" ? "It is " + t.value + "°" : "It is " + t.value.toFixed(1) + " cm", "bad");
          }
          U.store.set("pr:score", st.score);
          U.$$("#prOpts .btn", taskHost).forEach((x) => (x.disabled = true));
          draw(); cards();
          setTimeout(() => newTask(), o.ok ? 700 : 1700);
        }));
        U.$("#prNew", taskHost).addEventListener("click", () => newTask());
      }

      /* ---------------- modes + keys ---------------- */
      U.$$("#prModes button", wrap).forEach((b) => b.addEventListener("click", () => {
        st.mode = b.dataset.m;
        U.store.set("pr:mode", st.mode);
        paintModes();
        renderSet();
        st.task = null;
        newTask();
        hint.textContent = st.mode === "angle"
          ? "Drag the end of the ray, or use the slider. The inner scale reads the angle you opened from the right."
          : "Drag either end of the bar. The ruler ticks are millimetres; every tenth one is a centimetre.";
        sync(true);
      }));
      function paintModes() {
        U.$$("#prModes button", wrap).forEach((b) => b.classList.toggle("on", b.dataset.m === st.mode));
      }

      U.$("#prSnap", wrap).addEventListener("change", (e) => {
        st.snap = e.target.checked;
        U.store.set("pr:snap", st.snap);
        setDeg(st.deg); setCm(st.cm);
      });

      function keys(e) {
        if (/input|textarea|select/i.test((e.target.tagName || ""))) return;
        const step = e.shiftKey ? 10 : 1;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          if (st.mode === "angle") setDeg(st.deg + step); else setCm(st.cm + step / 10);
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          if (st.mode === "angle") setDeg(st.deg - step); else setCm(st.cm - step / 10);
        }
      }
      document.addEventListener("keydown", keys);
      const onResize = U.debounce(() => { draw(); }, 120);
      window.addEventListener("resize", onResize);
      ML._cleanups = ML._cleanups || [];
      ML._cleanups.push(() => {
        document.removeEventListener("keydown", keys);
        window.removeEventListener("resize", onResize);
      });

      hint.textContent = st.mode === "angle"
        ? "Drag the end of the ray, or use the slider. The inner scale reads the angle you opened from the right."
        : "Drag either end of the bar. The ruler ticks are millimetres; every tenth one is a centimetre.";
      paintModes();
      renderSet();
      newTask();
      sync(true);
    },
  });
})();

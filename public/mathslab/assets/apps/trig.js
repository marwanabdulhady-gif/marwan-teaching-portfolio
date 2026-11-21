/* ===========================================================
   MathsLab — Unit Circle Explorer
   Drag the terminal side (or use the arrow keys) and read sin,
   cos and tan off the circle — exact values first, decimals
   second. Practice mode asks the same values the other way
   round. Everything is drawn locally on a canvas.
   =========================================================== */
(function () {
  "use strict";
  const ML = window.ML, U = ML.u;

  /* ---------------- exact values ---------------- */
  const S = { 0: "0", 15: "(√6−√2)/4", 30: "1/2", 45: "√2/2", 60: "√3/2", 75: "(√6+√2)/4", 90: "1" };
  const TAN = {
    0: "0", 15: "2−√3", 30: "√3/3", 45: "1", 60: "√3", 75: "2+√3", 90: "undefined",
    120: "−√3", 135: "−1", 150: "−√3/3", 180: "0", 210: "√3/3", 225: "1", 240: "√3",
    270: "undefined", 300: "−√3", 315: "−1", 330: "−√3/3",
  };

  /** exact sin of a degree measure, as a signed string (or null) */
  function exactSin(deg) {
    const a = ((deg % 360) + 360) % 360;
    if (a % 15 !== 0) return null;
    const q = Math.floor(a / 90), r = a - q * 90;
    let base = S[r];
    /* 180°−r is the mirror: sin(180−x)=sin x, and quadrants 3 & 4 are negative */
    if (q === 1) base = S[90 - r];
    if (q === 2) return neg(base);
    if (q === 3) return neg(S[90 - r]);
    return base;
  }
  function exactCos(deg) { return exactSin(deg + 90); }
  function exactTan(deg) {
    const a = ((deg % 360) + 360) % 360;
    if (a % 15 !== 0) return null;
    return TAN[a] !== undefined ? TAN[a] : exactTan2(a);
  }
  function exactTan2(a) {
    const s = exactSin(a), c = exactCos(a);
    if (c === "0") return "undefined";
    if (s === "0") return "0";
    return null;                     // an ugly ratio — show the decimal instead
  }
  function neg(v) {
    if (v === "0") return "0";
    if (v.charAt(0) === "−") return v.slice(1);
    return "−" + v;
  }

  /* radians as a fraction of π */
  function radStr(deg) {
    const a = ((deg % 360) + 360) % 360;
    if (a === 0) return "0";
    let num = a, den = 180;
    const g = (function gcd(x, y) { return y ? gcd(y, x % y) : x; })(num, den);
    num /= g; den /= g;
    if (den === 1) return (num === 1 ? "π" : num + "π");
    return (num === 1 ? "π" : num + "π") + "/" + den;
  }

  const f4 = (v) => (Math.abs(v) < 1e-12 ? "0" : (Math.abs(v) < 0.00005 ? v.toExponential(2) : v.toFixed(4)))
    .replace("-", "−");

  /* ---------------- app ---------------- */
  ML.register({
    id: "unitcircle", group: "numbers", title: "Unit Circle Explorer",
    short: "Unit circle", icon: ML.icon("bolt"),
    color: ["#e6f7f5", "#0f9d94"], tag: "Trigonometry explorer",
    blurb: "Drag the terminal side round the unit circle: sin, cos and tan update live, in exact values and decimals, with practice mode for the special angles.",
    tags: ["unit circle", "sin cos tan", "radians", "exact values", "practice"],
    mount(root) {
      const st = {
        deg: 30,
        snap: U.store.get("uc:snap", true),
        showTri: true,
        quiz: null,
        score: U.store.get("uc:score", { right: 0, total: 0 }),
      };

      const wrap = U.el("div", { class: "app-layout" });
      wrap.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Angle</div>
            <div class="panel-b tight">
              <input type="range" id="ucRange" min="0" max="360" step="1" value="${st.deg}"
                     style="width:100%;accent-color:#0f9d94" aria-label="Angle in degrees">
              <div class="row" style="display:flex;gap:6px;margin-top:8px">
                <button class="btn sm" id="ucMinus" aria-label="15 degrees less">−15°</button>
                <button class="btn sm" id="ucPlus" aria-label="15 degrees more">+15°</button>
                <button class="btn sm" id="ucZero">0°</button>
              </div>
              <label class="small" style="display:flex;gap:8px;align-items:center;margin-top:10px">
                <input type="checkbox" id="ucSnap" ${st.snap ? "checked" : ""}> snap to 15°
              </label>
              <label class="small" style="display:flex;gap:8px;align-items:center;margin-top:6px">
                <input type="checkbox" id="ucTri" ${st.showTri ? "checked" : ""}> show reference triangle
              </label>
            </div>
          </div>
          <div class="panel">
            <div class="panel-h">Special angles</div>
            <div class="panel-b tight">
              <div id="ucChips" style="display:flex;flex-wrap:wrap;gap:6px"></div>
            </div>
          </div>
          <div class="panel">
            <div class="panel-h">Practice</div>
            <div class="panel-b tight" id="ucQuizHost"></div>
          </div>
        </aside>
        <div class="main">
          <div class="card" style="padding:14px">
            <canvas id="ucCanvas" height="470" style="width:100%;display:block;touch-action:none;cursor:grab"></canvas>
            <div class="small muted" style="margin-top:6px">
              Drag anywhere on the circle, or use <b>←</b> / <b>→</b> (hold <b>Shift</b> for 1°).
            </div>
          </div>
          <div class="grid grid-3" id="ucRead" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px"></div>
        </div>`;
      root.appendChild(wrap);

      const cv = U.$("#ucCanvas", wrap);
      const ctx = cv.getContext ? cv.getContext("2d") : null;
      const read = U.$("#ucRead", wrap);

      /* -------- drawing -------- */
      let geo = { cx: 0, cy: 0, R: 0 };
      function size() {
        const w = cv.clientWidth || 520, h = 470, dpr = window.devicePixelRatio || 1;
        if (!ctx) return { w, h };
        cv.width = w * dpr; cv.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        geo = { cx: w / 2, cy: h / 2, R: Math.min(w, h) / 2 - 46 };
        return { w, h };
      }

      function draw() {
        if (!ctx) return;
        const { w, h } = size();
        const { cx, cy, R } = geo;
        ctx.clearRect(0, 0, w, h);

        /* grid + axes */
        ctx.strokeStyle = "#eef0f4"; ctx.lineWidth = 1;
        for (let k = -2; k <= 2; k++) {
          if (!k) continue;
          const x = cx + k * R / 2, y = cy + k * R / 2;
          ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, h - 20); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(w - 20, y); ctx.stroke();
        }
        ctx.strokeStyle = "#cfd4dc"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(16, cy); ctx.lineTo(w - 16, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, 16); ctx.lineTo(cx, h - 16); ctx.stroke();

        /* the circle */
        ctx.strokeStyle = "#0f9d94"; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

        /* special angle ticks */
        for (let a = 0; a < 360; a += 15) {
          const t = (a * Math.PI) / 180;
          const r0 = R - (a % 90 === 0 ? 0 : 7), r1 = R;
          ctx.strokeStyle = a % 90 === 0 ? "#0f9d94" : "#9ad9d4";
          ctx.lineWidth = a % 90 === 0 ? 3 : 1.5;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(t) * r0, cy - Math.sin(t) * r0);
          ctx.lineTo(cx + Math.cos(t) * r1, cy - Math.sin(t) * r1);
          ctx.stroke();
        }

        const t = (st.deg * Math.PI) / 180;
        const px = cx + Math.cos(t) * R, py = cy - Math.sin(t) * R;

        /* swept arc */
        ctx.strokeStyle = "rgba(109,94,252,.35)"; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.arc(cx, cy, R * 0.42, 0, -t, true); ctx.stroke();

        /* reference triangle */
        if (st.showTri) {
          ctx.fillStyle = "rgba(109,94,252,.10)";
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.lineTo(px, py); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = "rgba(109,94,252,.55)"; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
        }

        /* terminal side + point */
        ctx.strokeStyle = "#4b3ee0"; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
        ctx.fillStyle = "#4b3ee0";
        ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(px, py, 2.4, 0, Math.PI * 2); ctx.fill();

        /* labels */
        ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
        ctx.fillStyle = "#475467";
        ctx.fillText("(1, 0)", cx + R + 6, cy + 16);
        ctx.fillText("(0, 1)", cx + 8, cy - R - 8);
        const cs = exactCos(st.deg), sn = exactSin(st.deg);
        const lbl = `(${cs || f4(Math.cos(t))}, ${sn || f4(Math.sin(t))})`;
        ctx.fillStyle = "#101828";
        ctx.font = "700 13px ui-sans-serif, system-ui, sans-serif";
        const lw = ctx.measureText(lbl).width;
        ctx.fillText(lbl, U.clamp(px + 12, 8, w - lw - 8), U.clamp(py - 12, 20, h - 8));

        /* the angle badge */
        ctx.fillStyle = "#101828"; ctx.font = "700 15px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(st.deg + "°", cx + 16, cy - 14);
        ctx.fillStyle = "#667085"; ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(radStr(st.deg) + " rad", cx + 16, cy + 4);
      }

      /* -------- read-out cards -------- */
      function cards() {
        const t = (st.deg * Math.PI) / 180;
        const sn = Math.sin(t), cs = Math.cos(t), tn = Math.tan(t);
        const es = exactSin(st.deg), ec = exactCos(st.deg), et = exactTan(st.deg);
        const rows = [
          ["sin θ", es, sn, "#2f7cf6"],
          ["cos θ", ec, cs, "#0f9d94"],
          ["tan θ", et || (Math.abs(tn) > 9999 ? "undefined" : null), tn, "#7c4dff"],
        ];
        read.innerHTML = rows.map(([name, exact, val, col]) => `
          <div class="card" style="padding:12px 14px;border-left:4px solid ${col}">
            <div class="small muted">${name}</div>
            <div style="font-size:22px;font-weight:800;letter-spacing:.2px;margin:2px 0">
              ${exact ? exact : f4(val)}
            </div>
            <div class="small muted">${exact ? "≈ " + f4(val) : "decimal only"}</div>
          </div>`).join("") +
          `<div class="card" style="padding:12px 14px;grid-column:1/-1">
             <div class="small muted">angle</div>
             <div style="font-size:18px;font-weight:800">${st.deg}° = ${radStr(st.deg)}</div>
             <div class="small muted">quadrant ${quadrant()} · reference angle ${refAngle()}°</div>
           </div>`;
      }

      function quadrant() {
        const a = ((st.deg % 360) + 360) % 360;
        if (a % 90 === 0) return "axis";
        return String(Math.floor(a / 90) + 1);
      }
      function refAngle() {
        const a = ((st.deg % 360) + 360) % 360;
        const r = a % 90;
        return a % 180 === 90 || r === 0 ? 0 : Math.min(r, 90 - r);
      }

      function sync() {
        U.$("#ucRange", wrap).value = st.deg;
        draw(); cards();
      }

      function setDeg(d) {
        let v = ((Math.round(d) % 360) + 360) % 360;
        if (st.snap) v = Math.round(v / 15) * 15 % 360;
        st.deg = v;
        sync();
      }

      /* -------- dragging -------- */
      let dragging = false;
      function angleFrom(e) {
        const r = cv.getBoundingClientRect();
        const x = e.clientX - r.left - geo.cx, y = geo.cy - (e.clientY - r.top);
        const a = (Math.atan2(y, x) * 180) / Math.PI;
        setDeg(a);
      }
      cv.addEventListener("pointerdown", (e) => { dragging = true; cv.style.cursor = "grabbing"; cv.setPointerCapture(e.pointerId); angleFrom(e); });
      cv.addEventListener("pointermove", (e) => { if (dragging) angleFrom(e); });
      cv.addEventListener("pointerup", (e) => { dragging = false; cv.style.cursor = "grab"; try { cv.releasePointerCapture(e.pointerId); } catch (err) {} });
      cv.addEventListener("pointercancel", () => { dragging = false; cv.style.cursor = "grab"; });

      /* -------- controls -------- */
      U.$("#ucRange", wrap).addEventListener("input", (e) => { st.deg = Number(e.target.value); draw(); cards(); });
      U.$("#ucMinus", wrap).addEventListener("click", () => setDeg(st.deg - 15));
      U.$("#ucPlus", wrap).addEventListener("click", () => setDeg(st.deg + 15));
      U.$("#ucZero", wrap).addEventListener("click", () => setDeg(0));
      U.$("#ucSnap", wrap).addEventListener("change", (e) => { st.snap = e.target.checked; U.store.set("uc:snap", st.snap); setDeg(st.deg); });
      U.$("#ucTri", wrap).addEventListener("change", (e) => { st.showTri = e.target.checked; draw(); });

      const chips = U.$("#ucChips", wrap);
      [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330].forEach((d) => {
        chips.appendChild(U.el("button", {
          class: "btn xs", type: "button",
          onclick: () => { setDeg(d); },
        }, d + "°"));
      });

      /* -------- practice -------- */
      const quizHost = U.$("#ucQuizHost", wrap);
      const POOL = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
      function newQuiz() {
        const fn = U.pick(["sin", "cos", "tan"]);
        const deg = U.pick(POOL);
        const val = (v) => (fn === "sin" ? exactSin(v) : fn === "cos" ? exactCos(v) : exactTan(v));
        let answer = val(deg);
        if (!answer) return newQuiz();
        const opts = [];
        const seen = new Set([answer]);
        let guard = 0;
        while (opts.length < 3 && guard++ < 200) {
          const other = val(U.pick(POOL));
          if (other && !seen.has(other)) { seen.add(other); opts.push({ text: other, ok: false }); }
        }
        if (opts.length < 3) return newQuiz();
        const all = U.shuffle(opts.concat([{ text: answer, ok: true }]));
        return { fn, deg, answer, options: all, picked: null };
      }
      function renderQuiz() {
        const q = (st.quiz = st.quiz || newQuiz());
        const sc = st.score;
        quizHost.innerHTML = `
          <div class="small muted">${sc.total ? `${sc.right} of ${sc.total} right` : "answer to start keeping score"}</div>
          <div style="font-weight:800;font-size:17px;margin:6px 0 10px">${q.fn} ${q.deg}° = ?</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px" id="ucOpts">
            ${q.options.map((o, i) => `<button class="btn sm" data-i="${i}" type="button">${o.text}</button>`).join("")}
          </div>
          <button class="btn sm ghost" id="ucSkip" type="button" style="margin-top:10px">new question</button>`;
        U.$$("#ucOpts .btn", quizHost).forEach((b) => b.addEventListener("click", () => {
          const i = Number(b.dataset.i), o = q.options[i];
          q.picked = i;
          st.score.total++;
          if (o.ok) { st.score.right++; U.sound.ok(); b.classList.add("good"); setDeg(q.deg); }
          else {
            U.sound.no(); b.classList.add("danger");
            U.$$("#ucOpts .btn", quizHost).forEach((x, k) => { if (q.options[k].ok) x.classList.add("good"); });
            ML.toast(q.fn + " " + q.deg + "° = " + q.answer, "bad");
          }
          U.store.set("uc:score", st.score);
          U.$$("#ucOpts .btn", quizHost).forEach((x) => (x.disabled = true));
          setTimeout(() => { st.quiz = newQuiz(); renderQuiz(); }, o.ok ? 550 : 1600);
        }));
        U.$("#ucSkip", quizHost).addEventListener("click", () => { st.quiz = newQuiz(); renderQuiz(); });
      }
      renderQuiz();

      /* -------- keyboard -------- */
      function keys(e) {
        if (/input|textarea|select/i.test((e.target.tagName || ""))) return;
        if (e.key === "ArrowRight") { setDeg(st.deg + (e.shiftKey ? 1 : 15)); e.preventDefault(); }
        if (e.key === "ArrowLeft") { setDeg(st.deg - (e.shiftKey ? 1 : 15)); e.preventDefault(); }
      }
      document.addEventListener("keydown", keys);
      const onResize = U.debounce(draw, 120);
      window.addEventListener("resize", onResize);

      /* the router wipes #view on navigation; clean up the document listener */
      const clean = () => { document.removeEventListener("keydown", keys); window.removeEventListener("resize", onResize); };
      ML._cleanups = ML._cleanups || [];
      ML._cleanups.push(clean);

      sync();
    },
  });
})();

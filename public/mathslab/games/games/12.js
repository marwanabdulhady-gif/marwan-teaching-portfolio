/* Grade 12 · Haramain Rates — the derivative as a rate of change.
   Mechanic = the thinking: the average speed over an interval is a secant, and
   the only way to the speed at an instant is to shrink the interval. */
(function () {
  const { h, s, svg, rint, pick, shuffle, fmt } = window.LK;

  /* s(t) = t² + 3t  (metres);  v(t) = 2t + 3  (m/s) */
  const sOf = (t) => t * t + 3 * t;
  const vOf = (t) => 2 * t + 3;
  const avg = (t0, h) => (sOf(t0 + h) - sOf(t0)) / h;

  const W = 460, HGT = 290, pad = 34;
  const tMax = 8, sMax = sOf(tMax);
  const X = (t) => pad + (t / tMax) * (W - 2 * pad);
  const Y = (sv) => HGT - pad - (sv / sMax) * (HGT - 2 * pad);

  function track(t0, hh, opts) {
    const o = opts || {};
    const g = svg(W, HGT, o.label || "position against time for the Haramain train");
    g.append(s("rect", { x: 0, y: 0, width: W, height: HGT, fill: "#f6faf8" }));
    for (let t = 0; t <= tMax; t++) {
      g.append(s("line", { x1: X(t), y1: pad, x2: X(t), y2: HGT - pad, stroke: "#e6efe9" }));
      g.append(s("text", { x: X(t), y: HGT - pad + 16, "text-anchor": "middle", "font-size": 10.5, fill: "#7d8c85", text: t + "s" }));
    }
    for (let sv = 0; sv <= sMax; sv += 20) g.append(s("line", { x1: pad, y1: Y(sv), x2: W - pad, y2: Y(sv), stroke: "#eef4f0" }));
    g.append(s("line", { x1: pad, y1: HGT - pad, x2: W - pad, y2: HGT - pad, stroke: "#a9b8b0", "stroke-width": 1.6 }));
    g.append(s("line", { x1: pad, y1: pad, x2: pad, y2: HGT - pad, stroke: "#a9b8b0", "stroke-width": 1.6 }));
    g.append(s("text", { x: W - 12, y: HGT - 8, "text-anchor": "end", "font-size": 11, fill: "#7d8c85", text: "time →" }));
    g.append(s("text", { x: 14, y: 20, "font-size": 11, fill: "#7d8c85", text: "distance (m)" }));
    /* the curve s(t) */
    let d = "";
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * tMax;
      d += (i ? "L" : "M") + X(t).toFixed(1) + " " + Y(sOf(t)).toFixed(1);
    }
    g.append(s("path", { d, fill: "none", stroke: "#0f766e", "stroke-width": 2.8 }));
    /* the secant over [t0, t0+h] */
    if (hh != null && hh > 0) {
      const m = avg(t0, hh);
      g.append(s("line", { x1: X(t0 - 1.4), y1: Y(sOf(t0) - m * 1.4), x2: X(t0 + hh + 1.4), y2: Y(sOf(t0) + m * (hh + 1.4)), stroke: "#e0502e", "stroke-width": 2.6 }));
      [[t0, sOf(t0)], [t0 + hh, sOf(t0 + hh)]].forEach(([t, sv]) => g.append(s("circle", { cx: X(t), cy: Y(sv), r: 5, fill: "#e0502e" })));
      g.append(s("text", { x: X(t0 + hh / 2), y: Y(sOf(t0 + hh / 2)) - 14, "text-anchor": "middle", "font-size": 12, fill: "#b03418", text: `average ${fmt(m, 2)} m/s` }));
      /* the gap h, drawn */
      g.append(s("line", { x1: X(t0), y1: Y(sOf(t0)) + 12, x2: X(t0 + hh), y2: Y(sOf(t0)) + 12, stroke: "#94a3b8", "stroke-width": 1.4 }));
      g.append(s("text", { x: X(t0 + hh / 2), y: Y(sOf(t0)) + 26, "text-anchor": "middle", "font-size": 11, fill: "#64748b", text: `h = ${hh}s` }));
    }
    /* the tangent at t0 (the truth) */
    const m0 = vOf(t0);
    g.append(s("line", { x1: X(t0 - 1.6), y1: Y(sOf(t0) - m0 * 1.6), x2: X(t0 + 1.6), y2: Y(sOf(t0) + m0 * 1.6), stroke: "#6f5bf0", "stroke-width": 2, "stroke-dasharray": "7 5" }));
    g.append(s("text", { x: 12, y: 38, "font-size": 11.5, fill: "#4a35c9", text: "dashed = the tangent (the instant)" }));
    return g;
  }

  LK.start({
    id: "g12-haramain-rates",
    title: "Haramain Rates",
    emoji: "🚄",
    topic: "The derivative as a rate of change",
    grade: "Grade 12 · age 17–18",
    band: "g912",
    coach: "🚉",
    how: {
      steps: [
        "Average speed = change in distance ÷ change in time: that is a <b>secant</b> slope.",
        "Shrink h. The secant swings towards the tangent, and the average becomes the instantaneous.",
        "The limit of (s(t+h) − s(t)) / h as h → 0 is the derivative — with units, m/s.",
      ],
    },
    world(el) {
      el.append(track(4, 2, { label: "average speed over two seconds, and the tangent at one instant" }));
    },
    learn: [
      {
        say: "The Haramain train runs between Makkah and Madinah. Here is its distance against time; the average speed over 2 s is the slope of the red secant.",
        draw(el) { el.append(track(4, 2)); },
      },
      {
        say: "Shrink the interval: over 1 s, then 0.5 s. The red line swings onto the dashed tangent — that slope is the speed <b>at that instant</b>.",
        draw(el) { el.append(track(4, 1)); },
      },
      {
        say: "Your turn: averages are 13, 12, 11.5, 11.25 m/s as h shrinks. What is the instantaneous speed at t = 4 s?",
        wait: true,
        draw(el, L) {
          el.append(track(4, 0.5));
          const wrap = h("div", { class: "fk-tiles" });
          ["11 m/s", "13 m/s", "0 m/s"].forEach((t) => {
            const b = h("button", { class: "fk-tile", type: "button", text: t });
            b.addEventListener("click", () => (t === "11 m/s" ? L.ok("The averages are heading for 11 — that is the tangent.") : L.say("Look at where the averages are going as h shrinks.", "bad")));
            wrap.append(b);
          });
          el.append(wrap);
        },
      },
      {
        say: "Ghubar says “the train's speed at t = 4 is 30 m/s because it travelled 28 m”. What did he do?",
        wait: true,
        draw(el, L) {
          const wrap = h("div", { class: "fk-tiles" });
          [["He used total distance — that is an average pace, not the instant.", true], ["Nothing, distance = speed.", false]].forEach(([t, ok]) => {
            const b = h("button", { class: "fk-tile", type: "button", html: t });
            b.addEventListener("click", () => (ok ? L.ok("Right — a rate needs a change in time, and the interval has to shrink.") : L.say("Speed is distance per second, at one instant.", "bad")));
            wrap.append(b);
          });
          el.append(track(4, 2), wrap);
        },
      },
    ],
    levels: [
      {
        name: "Shrink the interval",
        icon: "🔎",
        blurb: "Slide h down until the average is within 0.3 m/s of the instant.",
        rounds: 4,
        round(R) {
          const t0 = rint(2, 5);
          const truth = vOf(t0);
          const art = track(t0, 2, { label: "secant and tangent" });
          const redraw = (hh) => {
            const fresh = track(t0, hh);
            art.innerHTML = "";
            while (fresh.firstChild) art.append(fresh.firstChild);
          };
          LK.ui.sliders(R, {
            prompt: `t = ${t0} s. The tangent (dashed) is the true speed. Shrink h until the secant is within <b>0.3 m/s</b> of it.`,
            art: () => art,
            controls: [{ label: "interval h (s)", min: 0.25, max: 2, step: 0.25, value: 2 }],
            answer: [0.25],
            test: (v) => Math.abs(avg(t0, v[0]) - truth) <= 0.3,
            cat: "average-for-instant",
            why: (v) => `With h = ${v[0]} s the average is ${fmt(avg(t0, v[0]), 2)} m/s — still the secant. Shrink it further.`,
            hint: "Smaller h, smaller gap between secant and tangent.",
            onInput: (v, RR) => {
              redraw(v[0]);
              RR.say(`average over ${v[0]} s = <b>${fmt(avg(t0, v[0]), 2)} m/s</b> · the tangent is ${fmt(truth, 2)} m/s`, "hint");
            },
          });
          R.solve = () => { redraw(0.25); R.say(`As h → 0 the average → <b>${fmt(truth, 2)} m/s</b>.`, "hint"); };
        },
      },
      {
        name: "The limit table",
        icon: "📉",
        blurb: "Four averages. Where are they going?",
        rounds: 5,
        round(R) {
          const t0 = rint(2, 5);
          const rows = [2, 1, 0.5, 0.25].map((hh) => `h = ${hh}: ${fmt(avg(t0, hh), 2)} m/s`);
          LK.ui.choice(R, {
            prompt: `Averages at t = ${t0} s: ${rows.join(" · ")}. What is the speed at that instant?`,
            art: () => track(t0, 0.5),
            answer: String(vOf(t0)),
            options: shuffle([String(vOf(t0)), String(fmt(avg(t0, 2), 0)), String(vOf(t0) + 2)]),
            cat: "average-for-instant",
            why: (v) => (Number(v) === Number(fmt(avg(t0, 2), 0)) ? "That is the average over the widest interval, not the instant."
              : `Every average is heading for ${vOf(t0)} m/s — that is the limit.`),
            hint: "The numbers are closing on one value. Which?",
          });
        },
      },
      {
        name: "By the rules",
        icon: "⚡",
        blurb: "No table now: differentiate and keep the units.",
        rounds: 5,
        round(R) {
          const a = rint(2, 5), b = rint(2, 9);
          const ans = `${2 * a}x − ${b}`;
          LK.ui.choice(R, {
            prompt: `s(t) = ${a}t² − ${b}t. What is ds/dt?`,
            answer: ans,
            options: shuffle([ans, `${a}t − ${b}`, `${2 * a}t² − ${b}t`, `${2 * a}x − ${b}x`]),
            cat: "power-rule",
            why: (v) => (v === `${a}t − ${b}` ? "You did not multiply by the power — d/dt of t² is 2t."
              : v.endsWith("x") ? "The variable is t here, and the unit of ds/dt is m/s."
              : `Power rule: ${a}t² → ${2 * a}t, and −${b}t → −${b}.`),
            hint: "Bring the power down and drop it by one.",
          });
        },
      },
    ],
    praise: ["Secant to tangent — that's the derivative.", "Limit taken.", "Rate with units."],
    finale: "You took a limit on a moving train. That is calculus. 🚄",
  });
})();

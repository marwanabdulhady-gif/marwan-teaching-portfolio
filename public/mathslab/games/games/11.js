/* Grade 11 · NEOM Growth — exponential growth and logarithms.
   Mechanic = the thinking: the output multiplies by the same factor each year,
   so the curve bends; and only a log can undo the power. */
(function () {
  const { h, s, svg, rint, pick, shuffle, fmt } = window.LK;

  const W = 460, HGT = 260, pad = 30;
  const X = (y, years) => pad + (y / (years || 12)) * (W - 2 * pad);
  const Y = (v, max) => HGT - pad - (v / (max || 1)) * (HGT - 2 * pad);

  function farm(a, b, years, mark, opts) {
    const o = opts || {};
    const g = svg(W, HGT, o.label || "solar output growing year by year");
    g.append(s("rect", { x: 0, y: 0, width: W, height: HGT, fill: "#fffdf2" }));
    const maxV = a * Math.pow(b, years) * 1.08;
    for (let i = 0; i <= years; i += 2) {
      g.append(s("line", { x1: X(i, years), y1: pad, x2: X(i, years), y2: HGT - pad, stroke: "#f2ecd8" }));
      g.append(s("text", { x: X(i, years), y: HGT - pad + 16, "text-anchor": "middle", "font-size": 10.5, fill: "#9a8f6f", text: "y" + i }));
    }
    g.append(s("line", { x1: pad, y1: HGT - pad, x2: W - pad, y2: HGT - pad, stroke: "#c9bd93", "stroke-width": 1.6 }));
    g.append(s("line", { x1: pad, y1: pad, x2: pad, y2: HGT - pad, stroke: "#c9bd93", "stroke-width": 1.6 }));
    /* the true exponential curve */
    let d = "";
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * years;
      d += (i ? "L" : "M") + X(t, years).toFixed(1) + " " + Y(a * Math.pow(b, t), maxV).toFixed(1);
    }
    g.append(s("path", { d, fill: "none", stroke: "#e08b12", "stroke-width": 3 }));
    /* a straight (linear) guess, to show the difference */
    if (o.linear) {
      const perYear = a * (b - 1);
      g.append(s("line", { x1: X(0, years), y1: Y(a, maxV), x2: X(years, years), y2: Y(a + perYear * years, maxV), stroke: "#94a3b8", "stroke-width": 2, "stroke-dasharray": "6 5" }));
    }
    /* panels along the ground, one per year up to the mark */
    const panels = Math.min(years, mark == null ? 4 : mark);
    for (let i = 0; i < panels; i++) {
      const x = pad + 8 + i * 34;
      g.append(s("rect", { x, y: HGT - pad + 24, width: 28, height: 16, rx: 3, fill: "#3d6fb6", stroke: "#2c548f" }));
    }
    g.append(s("text", { x: 10, y: 20, "font-size": 12.5, fill: "#8a6a12", text: `y = ${a} × ${fmt(b, 2)}ˣ  (MW)` }));
    return g;
  }

  LK.start({
    id: "g11-neom-growth",
    title: "NEOM Growth",
    emoji: "☀️",
    topic: "Exponential growth and logarithms",
    grade: "Grade 11 · age 16–17",
    band: "g912",
    coach: "🔆",
    how: {
      steps: [
        "Each year the output is multiplied by the growth factor <b>b</b> — never by adding a fixed amount.",
        "Next year = this year × b. Two years = × b².",
        "To find <b>when</b> a target is reached, take logs: bˣ is undone by log.",
      ],
    },
    world(el) {
      const g = farm(200, 1.08, 12, 6, { label: "solar output growing 8% a year" });
      g.append(s("circle", { cx: W - 52, cy: 44, r: 22, fill: "#ffcf6b", class: "fk-glow" }));
      el.append(g);
    },
    learn: [
      {
        say: "A NEOM solar farm starts at 200 MW and grows 8% a year. 8% is a <b>factor</b> of 1.08, not an add-on of 8.",
        draw(el) { el.append(farm(200, 1.08, 10, 3, { linear: true })); },
      },
      {
        say: "200 → 216 → 233.3 → … Each year multiplies by 1.08. The dashed straight line is the linear guess — watch it fall behind.",
        draw(el) { el.append(farm(200, 1.08, 10, 5, { linear: true })); },
      },
      {
        say: "Your turn: 200 MW growing by 1.08 each year. What is the output after 2 years?",
        wait: true,
        draw(el, L) {
          el.append(farm(200, 1.08, 6, 2));
          const wrap = h("div", { class: "fk-tiles" });
          ["233.3 MW", "216 MW", "400 MW"].forEach((t) => {
            const b = h("button", { class: "fk-tile", type: "button", text: t });
            b.addEventListener("click", () => (t === "233.3 MW" ? L.ok("200 × 1.08² ≈ 233.3 — two multiplications, not one.") : L.say("Two years means multiplying by 1.08 twice.", "bad")));
            wrap.append(b);
          });
          el.append(wrap);
        },
      },
      {
        say: "Ghubar wrote 200 + 8x for the growth. What is wrong with his model?",
        wait: true,
        draw(el, L) {
          el.append(farm(200, 1.08, 10, 4, { linear: true }));
          const wrap = h("div", { class: "fk-tiles" });
          [["8% multiplies the total; it is not 8 MW added each year.", true], ["Nothing — a straight line is the same.", false]].forEach(([t, ok]) => {
            const b = h("button", { class: "fk-tile", type: "button", html: t });
            b.addEventListener("click", () => (ok ? L.ok("Right — compare the dashed line with the curve.") : L.say("Look at how far the dashed line falls behind.", "bad")));
            wrap.append(b);
          });
          el.append(wrap);
        },
      },
    ],
    levels: [
      {
        name: "Next year",
        icon: "📈",
        blurb: "Multiply by the factor — once, then again.",
        rounds: 5,
        round(R) {
          const a = pick([120, 150, 200, 240, 300]);
          const k = pick([2, 3]);
          const b = pick([1.05, 1.08, 1.1, 1.12]);
          const val = Math.round(a * Math.pow(b, k) * 10) / 10;
          LK.ui.choice(R, {
            prompt: `${a} MW growing by <b>×${fmt(b, 2)}</b> a year. What is the output after <b>${k} years</b>?`,
            art: () => farm(a, b, 8, k),
            answer: String(val),
            options: shuffle([String(val), String(Math.round(a * (1 + (b - 1) * k) * 10) / 10), String(Math.round(a * Math.pow(b, k + 1) * 10) / 10)]),
            cat: "rate-not-factor",
            why: (v) => (Math.abs(Number(v) - a * (1 + (b - 1) * k)) < 0.2 ? "That adds the 8% each year — the percentage is of a bigger total each time."
              : `Multiply: ${a} × ${fmt(b, 2)} × ${fmt(b, 2)} ≈ ${val}.`),
            hint: `${a} × ${fmt(b, 2)} = ${Math.round(a * b * 10) / 10}, then once more.`,
          });
        },
      },
      {
        name: "Which model?",
        icon: "🧮",
        blurb: "Read the curve and write the function.",
        rounds: 5,
        round(R) {
          const a = pick([100, 200, 250, 400]);
          const b = pick([1.05, 1.08, 1.1, 1.15]);
          const eq = `y = ${a}(1 + ${fmt(b - 1, 2)})ˣ`;
          LK.ui.choice(R, {
            prompt: `The farm starts at ${a} MW and grows ${Math.round((b - 1) * 100)}% a year. Which model fits?`,
            art: () => farm(a, b, 8, 3),
            answer: eq,
            options: shuffle([eq, `y = ${a} + ${Math.round((b - 1) * 100)}x`, `y = ${a}(${fmt(b - 1, 2)})ˣ`]),
            cat: "linear-for-exponential",
            why: (v) => (v.startsWith(`y = ${a} +`) ? "That is the linear guess — compounding bends away from it."
              : `The bracket must be 1 + r = 1 + ${fmt(b - 1, 2)}.`),
            hint: "Growth factor = 1 + the rate as a decimal.",
          });
        },
      },
      {
        name: "When does it get there?",
        icon: "🪵",
        blurb: "Solve for the exponent with logs.",
        rounds: 4,
        round(R) {
          const a = pick([100, 200, 250]);
          const b = pick([1.05, 1.08, 1.1]);
          const target = a * pick([2, 3]);
          const years = Math.log(target / a) / Math.log(b);
          LK.ui.keypad(R, {
            prompt: `${a} MW growing ×${fmt(b, 2)} a year. In how many years does it pass <b>${Math.round(target)} MW</b>?`,
            sub: "round up to whole years",
            art: () => farm(a, b, Math.max(8, Math.ceil(years) + 2), Math.ceil(years)),
            answer: Math.ceil(years),
            tol: 0,
            max: 2,
            cat: "log-rule",
            why: (v) => (Math.abs(v - Math.log(b)) < 0.02 ? "That is log b — you still have to divide by it." : `Solve ${fmt(b, 2)}ˣ = ${Math.round(target / a)}, so x = log(${Math.round(target / a)}) ÷ log(${fmt(b, 2)}).`),
            hint: `x = log(${target / a}) ÷ log(${fmt(b, 2)})`,
          });
        },
      },
    ],
    praise: ["Compounding, handled.", "Factor, not rate.", "Logs did the work."],
    finale: "The farm is at full output — and you can say exactly when. ☀️",
  });
})();

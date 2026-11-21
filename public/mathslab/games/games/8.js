/* Grade 8 · Graph Pilot — slope and linear functions.
   Mechanic = the thinking: the glide path IS y = mx + b. Change the line and
   the aircraft follows it into the runway. */
(function () {
  const { h, s, svg, rint, pick, shuffle, fmt } = window.LK;

  const W = 460, HGT = 300, pad = 26, lo = -5, hi = 5;
  const X = (v) => pad + ((v - lo) / (hi - lo)) * (W - 2 * pad);
  const Y = (v) => HGT - pad - ((v - lo) / (hi - lo)) * (HGT - 2 * pad);

  /* the airfield: grid, runway, a target glide path and the pupil's line */
  function sky(m, b, target, opts) {
    const o = opts || {};
    const g = svg(W, HGT, `${o.label || "glide path"}`);
    g.append(s("rect", { x: 0, y: 0, width: W, height: HGT, fill: "#eef6ff" }));
    for (let v = lo; v <= hi; v++) {
      g.append(s("line", { x1: X(v), y1: pad, x2: X(v), y2: HGT - pad, stroke: "#dbe6f3" }));
      g.append(s("line", { x1: pad, y1: Y(v), x2: W - pad, y2: Y(v), stroke: "#dbe6f3" }));
      if (v) {
        g.append(s("text", { x: X(v), y: Y(0) + 14, "text-anchor": "middle", "font-size": 10, fill: "#8aa0b6", text: String(v) }));
        g.append(s("text", { x: pad - 6, y: Y(v) + 4, "text-anchor": "end", "font-size": 10, fill: "#8aa0b6", text: String(v) }));
      }
    }
    g.append(s("line", { x1: pad, y1: Y(0), x2: W - pad, y2: Y(0), stroke: "#9fb4c8", "stroke-width": 1.6 }));
    g.append(s("line", { x1: X(0), y1: pad, x2: X(0), y2: HGT - pad, stroke: "#9fb4c8", "stroke-width": 1.6 }));
    /* the runway sits on the x-axis at x = 3 */
    g.append(s("rect", { x: X(2.4), y: Y(0) - 5, width: 46, height: 10, rx: 3, fill: "#5b6472" }));
    g.append(s("text", { x: X(2.6), y: Y(0) - 12, "font-size": 10.5, fill: "#3f4854", text: "runway" }));
    const line = (mm, bb, colour, dash, width) => {
      const x1 = lo, x2 = hi;
      g.append(s("line", { x1: X(x1), y1: Y(clampG(mm * x1 + bb)), x2: X(x2), y2: Y(clampG(mm * x2 + bb)), stroke: colour, "stroke-width": width || 3, "stroke-dasharray": dash || null }));
    };
    if (target) line(target[0], target[1], "#94a3b8", "7 5", 2.5);
    line(m, b, "#6f5bf0", null, 3.4);
    /* the aircraft rides the pupil's line */
    const px = 3, py = clampG(m * px + b);
    const plane = s("g", { class: "fk-bob" });
    plane.append(s("path", { d: `M${X(px)} ${Y(py)} l-20 -6 l6 -6 l16 8 l16 -8 l6 6 l-20 6 z`, fill: "#e0502e" }));
    g.append(plane);
    g.append(s("text", { x: 8, y: 18, "font-size": 12.5, fill: "#334155", text: `y = ${fmt(m, 1)}x ${b >= 0 ? "+ " + fmt(b, 1) : "− " + fmt(Math.abs(b), 1)}` }));
    return g;
  }
  const clampG = (v) => Math.max(-12, Math.min(12, v));

  LK.start({
    id: "g8-graph-pilot",
    title: "Graph Pilot",
    emoji: "✈️",
    topic: "Slope and linear functions",
    grade: "Grade 8 · age 13–14",
    band: "g68",
    coach: "🛫",
    how: {
      steps: [
        "<b>b</b> is where the line crosses the y-axis. <b>m</b> is rise ÷ run.",
        "Slide m and b until your glide path (solid) sits on the target path (dashed).",
        "A negative slope descends: the aircraft comes down as x grows.",
      ],
    },
    world(el) {
      const g = sky(-1, 2, null, { label: "a glide path into the airport" });
      g.append(s("circle", { cx: W - 40, cy: 26, r: 15, fill: "#ffcf6b", class: "fk-glow" }));
      el.append(g);
    },
    learn: [
      {
        say: "Flights into King Abdulaziz follow a straight glide path. Its equation is y = mx + b.",
        draw(el) { el.append(sky(-1, 2, null)); },
      },
      {
        say: "Here m = −1, b = 2: the plane starts 2 up and comes down 1 for every 1 across. Rise ÷ run = −1 ÷ 1.",
        draw(el) { el.append(sky(-1, 2, [-1, 2])); },
      },
      {
        say: "Your turn: the dashed target line crosses the y-axis at 3 and rises 2 for every 1 across. What is it?",
        wait: true,
        draw(el, L) {
          el.append(sky(2, 3, [2, 3]));
          const wrap = h("div", { class: "fk-tiles" });
          ["y = 2x + 3", "y = 3x + 2", "y = -2x + 3"].forEach((t) => {
            const b = h("button", { class: "fk-tile", type: "button", text: t });
            b.addEventListener("click", () => (t === "y = 2x + 3" ? L.ok("Slope 2, intercept 3 — read the b first, then the rise over run.") : L.say("Which is the crossing point, and which is the steepness?", "bad")));
            wrap.append(b);
          });
          el.append(wrap);
        },
      },
      {
        say: "Ghubar wrote y = 2x + 3 for a line that crosses at −3. What did he misread?",
        wait: true,
        draw(el, L) {
          el.append(sky(2, -3, [2, -3]));
          const wrap = h("div", { class: "fk-tiles" });
          [["The sign of the intercept — it meets the y-axis below zero.", true], ["Nothing, the intercept does not matter.", false]].forEach(([t, ok]) => {
            const b = h("button", { class: "fk-tile", type: "button", html: t });
            b.addEventListener("click", () => (ok ? L.ok("Right: b = −3, so y = 2x − 3.") : L.say("Look where the dashed line meets the vertical axis.", "bad")));
            wrap.append(b);
          });
          el.append(wrap);
        },
      },
    ],
    levels: [
      {
        name: "Land it",
        icon: "🛬",
        blurb: "Match the dashed glide path with your own line.",
        rounds: 4,
        round(R) {
          const mT = pick([-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2]);
          const bT = rint(-3, 3);
          const art = sky(0, 0, [mT, bT], { label: "the target glide path" });
          const redraw = (m, b) => {
            const fresh = sky(m, b, [mT, bT]);
            art.innerHTML = "";
            while (fresh.firstChild) art.append(fresh.firstChild);
          };
          LK.ui.sliders(R, {
            prompt: "Match the dashed path.",
            sub: `Target: crosses at <b>${bT}</b>, steepness <b>${fmt(mT, 1)}</b>.`,
            art: () => art,
            controls: [
              { label: "slope m", min: -3, max: 3, step: 0.5, value: 0 },
              { label: "intercept b", min: -4, max: 4, step: 1, value: 0 },
            ],
            test: (v) => Math.abs(v[0] - mT) < 1e-9 && v[1] === bT,
            answer: [mT, bT],
            cat: "run-over-rise",
            why: (v) => (v[1] !== bT
              ? `The intercept is ${bT} — where does the target cross the vertical axis?`
              : `The steepness is ${fmt(mT, 1)}: count the rise, then the run.`),
            hint: `Set the intercept to ${bT} first, then the slope.`,
            onInput: (v, RR) => {
              redraw(v[0], v[1]);
              RR.say(`your path: y = ${fmt(v[0], 1)}x ${v[1] >= 0 ? "+ " + v[1] : "− " + Math.abs(v[1])}`, "hint");
            },
          });
          R.solve = () => { redraw(mT, bT); R.say(`y = <b>${fmt(mT, 1)}x ${bT >= 0 ? "+ " + bT : "− " + Math.abs(bT)}</b> lands it.`, "hint"); };
        },
      },
      {
        name: "Read the slope",
        icon: "📐",
        blurb: "A line on the grid: what is its slope?",
        rounds: 5,
        round(R) {
          const m = pick([-2, -1, 1, 2, 3, -3]);
          const b = rint(-2, 2);
          LK.ui.choice(R, {
            prompt: "What is the slope of this line?",
            art: () => sky(m, b, null),
            answer: String(m),
            options: shuffle([String(m), String(-m), String(m === 1 ? 0.5 : m / 2)]),
            cat: "run-over-rise",
            why: (v) => (Number(v) === -m ? "Check the direction: up to the right is positive, down is negative."
              : "Slope = rise ÷ run. Count up, then across."),
            hint: "Pick two points on the line and count the rise over the run.",
          });
        },
      },
      {
        name: "Write the equation",
        icon: "✍️",
        blurb: "Slope and intercept together, in symbols.",
        rounds: 5,
        round(R) {
          const m = pick([-2, -1, 1, 2, 3]), b = rint(-3, 3);
          const eq = `y = ${m}x ${b >= 0 ? "+ " + b : "− " + Math.abs(b)}`;
          LK.ui.choice(R, {
            prompt: "Which equation is this line?",
            art: () => sky(m, b, null),
            answer: eq,
            options: shuffle([eq, `y = ${b}x ${m >= 0 ? "+ " + m : "− " + Math.abs(m)}`, `y = ${m}x ${-b >= 0 ? "+ " + -b : "− " + Math.abs(b)}`]),
            cat: "slope-sign",
            why: (v) => (v === `y = ${b}x ${m >= 0 ? "+ " + m : "− " + Math.abs(m)}` ? "You swapped the slope and the intercept."
              : "Look again at the sign of the crossing point."),
            hint: "b is where it crosses; m is how steep it is.",
          });
        },
      },
    ],
    praise: ["Smooth touchdown.", "Slope and intercept both right.", "Cleared to land."],
    finale: "Four runways, four perfect approaches, pilot. ✈️",
  });
})();

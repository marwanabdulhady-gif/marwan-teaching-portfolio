/* Grade 9 · Falcon's Arc — quadratic functions in vertex form.
   Mechanic = the thinking: a, h and k are the three things you can actually
   change about the flight, and the parabola shows each one. */
(function () {
  const { h, s, svg, rint, pick, shuffle, fmt } = window.LK;

  const W = 460, HGT = 300, pad = 26, lo = -6, hi = 6;
  const X = (v) => pad + ((v - lo) / (hi - lo)) * (W - 2 * pad);
  const Y = (v) => HGT - pad - ((v - lo) / (hi - lo)) * (HGT - 2 * pad);
  const clampV = (v) => Math.max(-14, Math.min(14, v));

  function arc(a, hh, k, target, opts) {
    const o = opts || {};
    const g = svg(W, HGT, o.label || "a falcon's flight path");
    g.append(s("rect", { x: 0, y: 0, width: W, height: HGT, fill: "#f7f3ff" }));
    for (let v = lo; v <= hi; v++) {
      g.append(s("line", { x1: X(v), y1: pad, x2: X(v), y2: HGT - pad, stroke: "#e7e1f7" }));
      g.append(s("line", { x1: pad, y1: Y(v), x2: W - pad, y2: Y(v), stroke: "#e7e1f7" }));
    }
    g.append(s("line", { x1: pad, y1: Y(0), x2: W - pad, y2: Y(0), stroke: "#b6a9d6", "stroke-width": 1.6 }));
    g.append(s("line", { x1: X(0), y1: pad, x2: X(0), y2: HGT - pad, stroke: "#b6a9d6", "stroke-width": 1.6 }));
    const curve = (aa, hx, kk, colour, dash, w) => {
      if (Math.abs(aa) < 1e-9) return;
      let d = "";
      for (let i = 0; i <= 200; i++) {
        const x = lo + (i / 200) * (hi - lo);
        const y = clampV(aa * (x - hx) * (x - hx) + kk);
        d += (i ? "L" : "M") + X(x).toFixed(1) + " " + Y(y).toFixed(1);
      }
      g.append(s("path", { d, fill: "none", stroke: colour, "stroke-width": w || 3, "stroke-dasharray": dash || null }));
      const vy = clampV(kk);
      g.append(s("circle", { cx: X(hx), cy: Y(vy), r: 5, fill: colour }));
    };
    if (target) curve(target[0], target[1], target[2], "#94a3b8", "7 5", 2.4);
    curve(a, hh, k, "#6f5bf0", null, 3.4);
    /* the falcon sits at the vertex of the pupil's curve */
    const fal = s("g", { class: "fk-flap" });
    const fy = clampV(k);
    fal.append(
      s("path", { d: `M${X(hh)} ${Y(fy) - 6} q-16 -10 -26 2 q16 -3 26 6`, fill: "#8b5e34" }),
      s("path", { d: `M${X(hh)} ${Y(fy) - 6} q16 -10 26 2 q-16 -3 -26 6`, fill: "#8b5e34" })
    );
    g.append(fal);
    g.append(s("text", { x: 8, y: 18, "font-size": 12.5, fill: "#4a35c9", text: `y = ${fmt(a, 1)}(x ${hh >= 0 ? "− " + fmt(hh, 1) : "+ " + fmt(Math.abs(hh), 1)})² ${k >= 0 ? "+ " + fmt(k, 1) : "− " + fmt(Math.abs(k), 1)}` }));
    return g;
  }

  LK.start({
    id: "g9-falcons-arc",
    title: "Falcon's Arc",
    emoji: "🦅",
    topic: "Quadratic functions and vertex form",
    grade: "Grade 9 · age 14–15",
    band: "g912",
    coach: "🦅",
    how: {
      steps: [
        "y = a(x − h)² + k. The vertex is <b>(h, k)</b> — mind the sign of h.",
        "<b>a</b> sets the width and the direction: negative a opens downward.",
        "Match the dashed stoop and the falcon catches the lure at the vertex.",
      ],
    },
    world(el) {
      const g = arc(-1, 1, 3, null, { label: "a falcon's stoop" });
      g.append(s("circle", { cx: W - 46, cy: 40, r: 22, fill: "#ffcf6b", class: "fk-glow" }));
      el.append(g);
    },
    learn: [
      {
        say: "At the falconry festival the lure is thrown up and the falcon stoops to it. The path is a parabola.",
        draw(el) { el.append(arc(-1, 1, 3, null)); },
      },
      {
        say: "y = −(x − 1)² + 3: vertex (1, 3), opening down because a = −1. The highest point is the vertex.",
        draw(el) { el.append(arc(-1, 1, 3, [-1, 1, 3])); },
      },
      {
        say: "Your turn: what is the vertex of y = (x − 2)² − 5?",
        wait: true,
        draw(el, L) {
          el.append(arc(1, 2, -5, [1, 2, -5]));
          const wrap = h("div", { class: "fk-tiles" });
          ["(2, −5)", "(−2, −5)", "(2, 5)"].forEach((t) => {
            const b = h("button", { class: "fk-tile", type: "button", text: t });
            b.addEventListener("click", () => (t === "(2, −5)" ? L.ok("(h, k) = (2, −5) — the sign inside flips, the outside does not.") : L.say("Inside the bracket the sign flips; the −5 stays.", "bad")));
            wrap.append(b);
          });
          el.append(wrap);
        },
      },
      {
        say: "Ghubar says y = (x + 3)² has vertex (−3, 0)… wait, he says (3, 0). Who is right?",
        wait: true,
        draw(el, L) {
          el.append(arc(1, -3, 0, [1, -3, 0]));
          const wrap = h("div", { class: "fk-tiles" });
          [["The vertex is (−3, 0): x + 3 means x − (−3).", true], ["Ghubar: (3, 0).", false]].forEach(([t, ok]) => {
            const b = h("button", { class: "fk-tile", type: "button", html: t });
            b.addEventListener("click", () => (ok ? L.ok("Exactly — the bracket is x − h, so h = −3.") : L.say("Look at where the curve turns: which side of zero?", "bad")));
            wrap.append(b);
          });
          el.append(wrap);
        },
      },
    ],
    levels: [
      {
        name: "Steer the stoop",
        icon: "🎯",
        blurb: "Match the dashed arc with a, h and k.",
        rounds: 4,
        round(R) {
          const aT = pick([-1, -0.5, 0.5, 1, 1.5]);
          const hT = rint(-3, 3), kT = rint(-3, 3);
          const art = arc(1, 0, 0, [aT, hT, kT], { label: "the target arc" });
          const redraw = (a, hh, k) => {
            const fresh = arc(a, hh, k, [aT, hT, kT]);
            art.innerHTML = "";
            while (fresh.firstChild) art.append(fresh.firstChild);
          };
          LK.ui.sliders(R, {
            prompt: "Catch the lure: match the dashed path.",
            sub: `The target vertex is <b>(${hT}, ${kT})</b> and it opens ${aT > 0 ? "upward" : "downward"}.`,
            art: () => art,
            controls: [
              { label: "a (width, flip)", min: -2, max: 2, step: 0.5, value: 1 },
              { label: "h (left/right)", min: -4, max: 4, step: 1, value: 0 },
              { label: "k (up/down)", min: -4, max: 4, step: 1, value: 0 },
            ],
            test: (v) => Math.abs(v[0] - aT) < 1e-9 && v[1] === hT && v[2] === kT,
            answer: [aT, hT, kT],
            cat: "h-sign",
            why: (v) => (v[1] !== hT ? `The vertex must sit at x = ${hT}. Remember the bracket is x − h.`
              : v[2] !== kT ? `It must reach y = ${kT}.`
              : `Opening ${aT > 0 ? "up" : "down"} means a is ${aT > 0 ? "positive" : "negative"}.`),
            hint: "Set h and k to the vertex first — then fix a.",
            onInput: (v, RR) => { redraw(v[0], v[1], v[2]); RR.say(`vertex (${v[1]}, ${v[2]})`, "hint"); },
          });
          R.solve = () => { redraw(aT, hT, kT); R.say(`a = ${aT}, h = ${hT}, k = ${kT}.`, "hint"); };
        },
      },
      {
        name: "Find the vertex",
        icon: "🎯",
        blurb: "Vertex form on its own, without the picture.",
        rounds: 5,
        round(R) {
          const hh = rint(-4, 4), k = rint(-5, 5);
          const sign = hh >= 0 ? "−" : "+";
          LK.ui.choice(R, {
            prompt: `What is the vertex of <b>y = (x ${sign} ${Math.abs(hh)})² ${k >= 0 ? "+ " + k : "− " + Math.abs(k)}</b>?`,
            art: () => arc(1, hh, k, null),
            answer: `(${hh},${k})`,
            options: shuffle([`(${hh},${k})`, `(${-hh},${k})`, `(${hh},${-k})`]).map((t) => ({ key: t, html: t.replace(",", ", ") })),
            cat: "h-sign",
            why: (v) => (v === `(${-hh},${k})` ? "The bracket is x − h, so the sign inside flips." : "The number outside the bracket is k."),
            hint: "Inside the bracket flips; outside stays.",
          });
        },
      },
      {
        name: "Roots",
        icon: "✖️",
        blurb: "Where the arc crosses the axis — not where it turns.",
        rounds: 5,
        round(R) {
          const r1 = rint(-1, 5), r2 = r1 + rint(2, 5);
          LK.ui.choice(R, {
            prompt: `Where does <b>y = (x − ${r1})(x − ${r2})</b> cross the x-axis?`,
            answer: `${r1},${r2}`,
            options: shuffle([`${r1},${r2}`, `${-r1},${-r2}`, `${(r1 + r2) / 2},${r2 - r1}`]).map((t) => ({ key: t, html: "x = " + t.split(",").join(" and x = ") })),
            cat: "roots-vs-vertex",
            why: (v) => (v === `${-r1},${-r2}` ? "Set each bracket to zero: x − 3 = 0 gives x = +3." : "The roots are where y = 0, not the turning point."),
            hint: "Each bracket equals zero gives one root.",
          });
        },
      },
    ],
    praise: ["The falcon has it.", "Vertex, width, direction — all read.", "Clean arc."],
    finale: "The lure is caught. The festival crowd is on its feet. 🦅",
  });
})();

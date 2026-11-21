/* Grade 10 · Tower Trig — right-triangle trigonometry on a Jeddah landmark.
   Mechanic = the thinking: you cannot measure the height, but the angle and the
   distance are yours — so choose the ratio that uses exactly those two sides. */
(function () {
  const { h, s, svg, rint, pick, shuffle, fmt } = window.LK;
  const deg = (r) => (r * 180) / Math.PI;

  /* A landmark seen from the ground. The drawing is schematic — the numbers in
     the labels are what the pupil works with — but the parts must be nameable:
     the green base is the adjacent side, the tower is the opposite side, and the
     dashed line of sight is the hypotenuse. */
  function tower(hgt, dist, angle, opts) {
    const o = opts || {};
    const g = svg(520, 300, o.label || "a tower seen from the ground");
    const ground = 248, obsX = 120, twX = 400;

    g.append(s("rect", { x: 0, y: 0, width: 520, height: ground, fill: "#eaf4ff" }));
    g.append(s("circle", { cx: 460, cy: 46, r: 20, fill: "#ffd166", opacity: 0.9 }));
    g.append(s("rect", { x: 0, y: ground, width: 520, height: 300 - ground, fill: "#e3e7dc" }));
    /* a low skyline so the tower reads as a landmark, not a stick */
    [[250, 34], [292, 22], [330, 44]].forEach(([x, hh], i) => {
      g.append(s("rect", { x, y: ground - hh, width: 32, height: hh, fill: i % 2 ? "#cdd6df" : "#d7dee6" }));
    });

    /* the tower: tapered shaft, a crown, a needle */
    const topY = 46;
    g.append(s("path", {
      d: `M${twX - 23} ${ground} L${twX - 11} ${topY + 26} L${twX + 11} ${topY + 26} L${twX + 23} ${ground} Z`,
      fill: "#a9bccd", stroke: "#7d93a8", "stroke-width": 1.6,
    }));
    for (let y = ground - 22; y > topY + 34; y -= 26) {
      g.append(s("line", { x1: twX - 21, y1: y, x2: twX + 21, y2: y, stroke: "#93a9bd", "stroke-width": 1 }));
    }
    g.append(s("rect", { x: twX - 15, y: topY + 8, width: 30, height: 20, rx: 3, fill: "#c3d2df", stroke: "#7d93a8", "stroke-width": 1.4 }));
    g.append(s("line", { x1: twX, y1: topY + 8, x2: twX, y2: topY - 12, stroke: "#7d93a8", "stroke-width": 2.4 }));
    g.append(s("circle", { cx: twX, cy: topY - 15, r: 4, fill: "#e0502e", class: "fk-glow" }));

    /* the observer */
    const eyeY = ground - 26;
    g.append(s("circle", { cx: obsX, cy: eyeY - 12, r: 7, fill: "#c98b45" }));
    g.append(s("path", { d: `M${obsX - 9} ${ground} L${obsX - 7} ${eyeY - 4} L${obsX + 7} ${eyeY - 4} L${obsX + 9} ${ground} Z`, fill: "#4a35c9" }));

    /* the triangle: green base, dashed line of sight, orange angle */
    g.append(s("line", { x1: obsX, y1: ground - 2, x2: twX - 23, y2: ground - 2, stroke: "#15803d", "stroke-width": 4, "stroke-linecap": "round" }));
    g.append(s("line", { x1: obsX + 6, y1: eyeY - 6, x2: twX, y2: topY + 2, stroke: "#6f5bf0", "stroke-width": 2.2, "stroke-dasharray": "7 5" }));
    g.append(s("path", { d: `M${obsX + 40} ${eyeY - 4} a40 40 0 0 0 -3 -26`, fill: "none", stroke: "#b4530a", "stroke-width": 2.2 }));
    g.append(s("text", { x: obsX + 48, y: eyeY - 22, "font-size": 14.5, fill: "#b4530a", "font-weight": 700, text: `${fmt(angle, 0)}°` }));

    g.append(s("text", { x: (obsX + twX) / 2 - 6, y: ground + 20, "text-anchor": "middle", "font-size": 14, fill: "#12633a", "font-weight": 700, text: `adjacent = ${dist} m` }));
    g.append(s("text", { x: twX + 30, y: (ground + topY) / 2 + 6, "font-size": 14, fill: "#3f4854", "font-weight": 700, text: `opposite` }));
    g.append(s("text", { x: twX + 30, y: (ground + topY) / 2 + 26, "font-size": 14, fill: "#e0502e", "font-weight": 700, text: o.hideHeight ? "h = ?" : `h ≈ ${fmt(hgt, 0)} m` }));
    g.append(s("text", { x: 10, y: 22, "font-size": 13, fill: "#334155", text: o.caption || "the angle of elevation" }));
    return g;
  }

  LK.start({
    id: "g10-tower-trig",
    title: "Tower Trig",
    emoji: "📐",
    topic: "Right-triangle trigonometry",
    grade: "Grade 10 · age 15–16",
    band: "g912",
    coach: "📏",
    how: {
      steps: [
        "Name the sides from the angle: <b>opposite</b>, <b>adjacent</b>, <b>hypotenuse</b>.",
        "SOH CAH TOA — pick the ratio that uses the two sides you have.",
        "You know the angle and the adjacent side: that is <b>tan</b>.",
      ],
    },
    world(el) {
      const g = tower(300, 60, 79, { label: "Jeddah Tower seen from the ground", caption: "opposite and adjacent — no hypotenuse needed" });
      g.append(s("circle", { cx: 470, cy: 44, r: 22, fill: "#ffcf6b", class: "fk-glow" }));
      el.append(g);
    },
    learn: [
      {
        say: "You are 40 m from the foot of Jeddah Tower. Your clinometer reads 35°. You can measure the angle and the distance — not the height.",
        draw(el) { el.append(tower(28, 40, 35)); },
      },
      {
        say: "The height is <b>opposite</b> the angle; the 40 m is <b>adjacent</b>. Opposite and adjacent → tan θ = opp / adj, so h = 40 tan 35° ≈ 28 m.",
        draw(el) { el.append(tower(28, 40, 35, { caption: "tan 35° = h / 40" })); },
      },
      {
        say: "Your turn: you know the angle and the <b>hypotenuse</b>. Which ratio finds the opposite side?",
        wait: true,
        draw(el, L) {
          const wrap = h("div", { class: "fk-tiles" });
          ["sin — opposite over hypotenuse", "cos — adjacent over hypotenuse", "tan — opposite over adjacent"].forEach((t) => {
            const b = h("button", { class: "fk-tile", type: "button", html: t });
            b.addEventListener("click", () => (t.startsWith("sin") ? L.ok("SOH: sin θ = opposite / hypotenuse.") : L.say("Which two sides does that ratio use?", "bad")));
            wrap.append(b);
          });
          el.append(wrap);
        },
      },
      {
        say: "Ghubar used tan with the hypotenuse in the calculator. What is the problem?",
        wait: true,
        draw(el, L) {
          const wrap = h("div", { class: "fk-tiles" });
          [["tan needs the adjacent side, not the hypotenuse.", true], ["Nothing — tan works with any side.", false]].forEach(([t, ok]) => {
            const b = h("button", { class: "fk-tile", type: "button", html: t });
            b.addEventListener("click", () => (ok ? L.ok("Right — SOH CAH TOA names the two sides each ratio needs.") : L.say("Say SOH CAH TOA and check the side names.", "bad")));
            wrap.append(b);
          });
          el.append(tower(28, 40, 35), wrap);
        },
      },
    ],
    levels: [
      {
        name: "Which ratio?",
        icon: "🔺",
        blurb: "Two sides are given. Only one ratio uses both.",
        rounds: 5,
        round(R) {
          const kind = pick(["oa", "ha", "oh"]);
          const ask = { oa: "the <b>opposite</b> and the <b>adjacent</b>", ha: "the <b>adjacent</b> and the <b>hypotenuse</b>", oh: "the <b>opposite</b> and the <b>hypotenuse</b>" }[kind];
          const ans = { oa: "tan", ha: "cos", oh: "sin" }[kind];
          LK.ui.choice(R, {
            prompt: `You know ${ask}. Which ratio do you use?`,
            art: () => tower(30, 40, 35),
            answer: ans,
            options: shuffle(["sin", "cos", "tan"]),
            cat: "wrong-ratio",
            why: (v) => (v === "tan" && kind !== "oa" ? "tan is opposite over adjacent — one of your sides is the hypotenuse." :
              v === "sin" && kind !== "oh" ? "sin is opposite over hypotenuse." : "SOH CAH TOA: match the two sides you actually have."),
            hint: "SOH CAH TOA — which line names both of your sides?",
          });
        },
      },
      {
        name: "Measure it",
        icon: "📐",
        blurb: "Use the ratio and give the height.",
        rounds: 5,
        round(R) {
          const dist = pick([25, 30, 40, 50, 60]);
          const angle = pick([25, 30, 35, 40, 45, 50]);
          const hgt = dist * Math.tan((angle * Math.PI) / 180);
          LK.ui.keypad(R, {
            prompt: `From <b>${dist} m</b> away the angle is <b>${angle}°</b>. How tall is the tower?`,
            sub: "tan θ = opposite / adjacent · give metres to 1 decimal place",
            art: () => tower(0, dist, angle, { hideHeight: true }),
            answer: Math.round(hgt * 10) / 10,
            decimal: true,
            tol: 0.8,
            max: 5,
            cat: "hypotenuse-misread",
            why: (v) => (Math.abs(v - dist * Math.sin((angle * Math.PI) / 180)) < 0.9 ? "You used sin — but the side you know is the adjacent, not the hypotenuse."
              : `tan ${angle}° = h / ${dist}, so h = ${dist} × tan ${angle}°.`),
            hint: `h = ${dist} × tan ${angle}°`,
          });
        },
      },
      {
        name: "Find the angle",
        icon: "🧭",
        blurb: "Now the sides are known and the angle is not — use the inverse.",
        rounds: 4,
        round(R) {
          const opp = rint(15, 60), adj = rint(15, 60);
          const ang = Math.round(deg(Math.atan(opp / adj)));
          LK.ui.choice(R, {
            prompt: `Opposite <b>${opp} m</b>, adjacent <b>${adj} m</b>. What is the angle?`,
            answer: String(ang) + "°",
            options: shuffle([String(ang) + "°", String(Math.round(deg(Math.atan(adj / opp)))) + "°", String(Math.round(90 - ang)) + "°"]),
            cat: "radian-mode",
            why: (v) => (v === String(Math.round(deg(Math.atan(adj / opp)))) + "°" ? "That inverted the fraction — opp ÷ adj, then tan⁻¹."
              : "tan θ = opp / adj, so θ = tan⁻¹(opp ÷ adj)."),
            hint: `θ = tan⁻¹(${opp} ÷ ${adj})`,
          });
        },
      },
    ],
    praise: ["Ratio chosen, height found.", "SOH CAH TOA, used properly.", "Surveyor's eye."],
    finale: "You measured a landmark with shadows and angles — like a surveyor. 📐",
  });
})();

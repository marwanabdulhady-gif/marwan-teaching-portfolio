/* Grade 7 · Red Sea Dive — adding and subtracting integers.
   Mechanic = the thinking: depth is a signed number on a vertical line, and
   subtracting a negative really does move you the other way. */
(function () {
  const { h, s, svg, rint, shuffle } = window.LK;

  /* a vertical number line from +5 at the top to −10 at the bottom, with the reef */
  function reef(depth, move, label) {
    const g = svg(420, 300, label || `diver at ${depth} metres`);
    const top = 5, bottom = -10;
    const Y = (v) => 26 + ((top - v) / (top - bottom)) * 250;
    g.append(s("rect", { x: 0, y: 0, width: 420, height: 300, fill: "#e8f7ff" }));
    g.append(s("rect", { x: 0, y: Y(0), width: 420, height: 300 - Y(0), fill: "#bfe6f7" }));
    for (let i = 0; i < 7; i++) g.append(s("circle", { cx: 300 + (i % 3) * 34, cy: Y(-3) + Math.floor(i / 3) * 44, r: 12 + (i % 3) * 4, fill: "#ff8fa3", opacity: 0.55, class: "fk-glow" }));
    g.append(s("text", { x: 14, y: Y(0) + 5, "font-size": 13, fill: "#0f5f7a", text: "sea level 0" }));
    g.append(s("line", { x1: 150, y1: Y(top), x2: 150, y2: Y(bottom), stroke: "#7fa9bd", "stroke-width": 2 }));
    for (let v = top; v >= bottom; v--) {
      g.append(s("line", { x1: 144, y1: Y(v), x2: 156, y2: Y(v), stroke: "#7fa9bd" }));
      if (v % 5 === 0 || v === 0) g.append(s("text", { x: 136, y: Y(v) + 5, "text-anchor": "end", "font-size": 13, fill: "#31586b", text: String(v) }));
    }
    if (move != null && move !== 0) {
      const from = depth - move;
      g.append(s("line", { x1: 150, y1: Y(from), x2: 150, y2: Y(depth), stroke: "#6f5bf0", "stroke-width": 5, "stroke-linecap": "round" }));
      g.append(s("path", { d: `M150 ${Y(depth)} l-8 ${move > 0 ? -10 : 10} l16 0 Z`, fill: "#6f5bf0" }));
      g.append(s("text", { x: 168, y: (Y(from) + Y(depth)) / 2, "font-size": 13, fill: "#4a35c9", text: `${move > 0 ? "+" : ""}${move}` }));
    }
    const diver = s("g", { class: "fk-bob" });
    diver.append(
      s("circle", { cx: 150, cy: Y(depth) - 22, r: 12, fill: "#ffd9a8", stroke: "#c98b45" }),
      s("rect", { x: 138, y: Y(depth) - 12, width: 24, height: 16, rx: 6, fill: "#0f766e" }),
      s("circle", { cx: 150, cy: Y(depth) + 6, r: 5, fill: "#0f766e" }),
      s("text", { x: 150, y: Y(depth) + 34, "text-anchor": "middle", "font-size": 13, fill: "#0f5f7a", text: `${depth} m` })
    );
    g.append(diver);
    return g;
  }

  LK.start({
    id: "g7-red-sea-dive",
    title: "Red Sea Dive",
    emoji: "🤿",
    topic: "Adding and subtracting integers",
    grade: "Grade 7 · age 12–13",
    band: "g68",
    coach: "🐠",
    how: {
      steps: [
        "Depths below sea level are <b>negative</b>: −3 is three metres down.",
        "A dive moves you down (a negative change); rising moves you up.",
        "Subtracting a negative is the same as adding: 5 − (−3) = 5 + 3 = 8.",
      ],
    },
    world(el) {
      const g = reef(-4, null, "a diver four metres below the surface");
      el.append(g);
    },
    learn: [
      {
        say: "Off Jeddah the reef drops away. A diver at −3 metres dives 4 more metres: −3 + (−4) = <b>−7</b>.",
        draw(el) { el.append(reef(-7, -4)); },
      },
      {
        say: "Rising 5 metres from −7 is −7 + 5 = <b>−2</b>. Down is negative, up is positive — the line does the work.",
        draw(el) { el.append(reef(-2, 5)); },
      },
      {
        say: "Your turn: 5 − (−3). Which way does the diver move, and where does she end?",
        wait: true,
        draw(el, L) {
          const wrap = h("div", { class: "fk-tiles" });
          [["Up to +8 — subtracting a negative adds.", true], ["Down to +2 — take 3 away.", false]].forEach(([t, ok]) => {
            const b = h("button", { class: "fk-tile", type: "button", html: t });
            b.addEventListener("click", () => (ok ? L.ok("Right — the two minuses make a plus.") : L.say("Taking away a negative goes the other way.", "bad")));
            wrap.append(b);
          });
          el.append(reef(5, 3), wrap);
        },
      },
      {
        say: "Ghubar says “−7 + 4 = −11, because both numbers are there.” What went wrong?",
        wait: true,
        draw(el, L) {
          const wrap = h("div", { class: "fk-tiles" });
          [["+4 moves UP, so it is −3, not −11.", true], ["Nothing — −11 is right.", false]].forEach(([t, ok]) => {
            const b = h("button", { class: "fk-tile", type: "button", html: t });
            b.addEventListener("click", () => (ok ? L.ok("The sign of the move decides the direction.") : L.say("Look at the line: from −7, four metres up.", "bad")));
            wrap.append(b);
          });
          el.append(reef(-3, 4), wrap);
        },
      },
    ],
    levels: [
      {
        name: "Where do you land?",
        icon: "🌊",
        blurb: "Read the dive on the line.",
        rounds: 5,
        round(R) {
          const start = -rint(1, 6), move = LK.pick([-4, -3, -2, 2, 3, 4]);
          const end = start + move;
          LK.ui.choice(R, {
            prompt: `A diver at <b>${start} m</b> moves <b>${move > 0 ? "+" + move : move}</b>. Where is she now?`,
            art: () => reef(end, move),
            answer: String(end),
            options: shuffle([String(end), String(start - move), String(end - 2)]),
            cat: "sign-ignored",
            why: (v) => (Number(v) === start - move ? "You moved the opposite way — the sign tells you the direction."
              : `Start at ${start}; ${move > 0 ? "up" : "down"} ${Math.abs(move)} gives ${end}.`),
            hint: "Down on the line is negative, up is positive.",
          });
        },
      },
      {
        name: "Minus a negative",
        icon: "➖",
        blurb: "The one that trips everyone: subtracting a negative.",
        rounds: 5,
        round(R) {
          const a = rint(2, 9), b = rint(2, 7);
          const ans = a + b;
          LK.ui.choice(R, {
            prompt: `<b>${a} − (−${b})</b> = ?`,
            art: () => reef(a, b),
            answer: String(ans),
            options: shuffle([String(ans), String(a - b), String(-(a + b))]),
            cat: "minus-negative",
            why: (v) => (Number(v) === a - b ? "Subtracting a negative is adding — the diver goes UP."
              : Number(v) === -(a + b) ? "Check the first number: it is positive."
              : `−(−${b}) becomes +${b}, so ${a} + ${b} = ${ans}.`),
            hint: "Two minus signs together make a plus.",
          });
        },
      },
      {
        name: "The rules",
        icon: "🧮",
        blurb: "Mixed signed sums, no picture.",
        rounds: 6,
        round(R) {
          const a = -rint(2, 9), b = rint(1, 9), c = LK.pick([-4, -3, -2, 2, 3, 4]);
          const ans = a + b + c;
          LK.ui.keypad(R, {
            prompt: `<b>${a} + ${b} ${c > 0 ? "+" + c : "− " + Math.abs(c)}</b> = ?`,
            answer: ans,
            neg: true,
            max: 3,
            cat: "magnitude-sign",
            why: (v) => (Math.abs(v) === Math.abs(a) + b + Math.abs(c) ? "You added every size — but signs decide which side you end on."
              : `Work left to right: ${a} + ${b} = ${a + b}, then ${a + b}${c > 0 ? "+" + c : "− " + Math.abs(c)} = ${ans}.`),
            hint: `${a} + ${b} first.`,
          });
        },
      },
    ],
    praise: ["The line never lies.", "Signed numbers, sorted.", "Right depth."],
    finale: "Surface at last — every integer in its place. 🤿",
  });
})();

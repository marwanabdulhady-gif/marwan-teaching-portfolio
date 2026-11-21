/* Grade 5 · Kunafa Fractions — add fractions with unlike denominators.
   Mechanic = the thinking: you cannot join trays cut differently; re-cut them
   into equal pieces first, and the pieces tell you the answer. */
(function () {
  const { h, s, svg, rint, shuffle } = window.LK;

  const gcd = (a, b) => (b ? gcd(b, a % b) : a);

  /* One kunafa tray: `den` equal pieces, `num` of them occupied. Drawn bold
     enough to read at 430 px, because the whole point is seeing the piece size. */
  function tray(num, den, y, label, tint) {
    const g = s("g", {});
    const x0 = 92, W = 372, H = 54;
    g.append(s("rect", { x: x0 - 6, y: y - 6, width: W + 12, height: H + 12, rx: 10, fill: "#fff", stroke: "#e6dcc6", "stroke-width": 1.4 }));
    for (let i = 0; i < den; i++) {
      const px = x0 + (i * W) / den, pw = W / den;
      const filled = i < num;
      g.append(s("rect", {
        x: px + 1.5, y, width: Math.max(3, pw - 3), height: H, rx: 5,
        fill: filled ? tint : "#fbf7ef", stroke: filled ? "#c98b45" : "#e2d8c4", "stroke-width": 1.6,
      }));
      if (filled && pw > 26) {
        g.append(s("circle", { cx: px + pw / 2, cy: y + H / 2, r: 4, fill: "#e7a34a", opacity: 0.85 }));
        g.append(s("circle", { cx: px + pw / 2 - 7, cy: y + H / 2 - 9, r: 2.6, fill: "#7bbf6a" }));
      }
    }
    g.append(s("text", { x: x0 - 16, y: y + H / 2 + 8, "text-anchor": "end", "font-size": 22, "font-weight": 800, fill: "#4a35c9", text: label }));
    return g;
  }
  function kunafa(a, b, opts) {
    const o = opts || {};
    const g = svg(520, 200, `${a.num}/${a.den} plus ${b.num}/${b.den}`);
    g.append(s("rect", { x: 0, y: 0, width: 520, height: 200, rx: 14, fill: "#fdf6ea" }));
    g.append(tray(a.num, a.den, 26, `${a.num}/${a.den}`, "#f7c98b"));
    g.append(tray(b.num, b.den, 104, `${b.num}/${b.den}`, "#ffd9a8"));
    if (o.cut) {
      const L = o.cut;
      for (let i = 1; i < L; i++) {
        const px = 92 + (i * 372) / L;
        g.append(s("line", { x1: px, y1: 18, x2: px, y2: 166, stroke: "#b9a97f", "stroke-width": 1.2, "stroke-dasharray": "4 4" }));
      }
      g.append(s("text", { x: 92, y: 188, "font-size": 14, fill: "#7a6a45", "font-weight": 700, text: `re-cut both trays into ${L} equal pieces` }));
    }
    if (o.sum) {
      g.append(s("text", { x: 92, y: 188, "font-size": 15, fill: "#0f766e", "font-weight": 800, text: o.sum }));
    }
    return g;
  }

  const frac = (n, d) => `${n}/${d}`;

  LK.start({
    id: "g5-kunafa-fractions",
    title: "Kunafa Fractions",
    emoji: "🍮",
    topic: "Adding fractions with unlike denominators",
    grade: "Grade 5 · age 10–11",
    band: "g35",
    coach: "👩‍🍳",
    how: {
      steps: [
        "Two trays cut into different numbers of pieces cannot be added as they are.",
        "Re-cut both into the <b>same</b> size — the lowest common denominator.",
        "Then add the pieces on top, and simplify if you can. 1/2 + 1/3 is <b>5/6</b>, never 2/5.",
      ],
    },
    world(el) {
      const g = kunafa({ num: 1, den: 2 }, { num: 1, den: 3 }, { cut: 6 });
      g.append(s("text", { x: 470, y: 40, "font-size": 26, text: "🍮" }));
      el.append(g);
    },
    learn: [
      {
        say: "At the kunafa shop in Jeddah the trays are cut two ways: halves and thirds. You cannot add halves to thirds until the pieces match.",
        draw(el) { el.append(kunafa({ num: 1, den: 2 }, { num: 1, den: 3 }, {})); },
      },
      {
        say: "Re-cut both into sixths: 1/2 = 3/6 and 1/3 = 2/6, so 1/2 + 1/3 = 5/6. The pieces were the problem, not the tops.",
        draw(el) { el.append(kunafa({ num: 1, den: 2 }, { num: 1, den: 3 }, { cut: 6 })); },
      },
      {
        say: "Your turn: re-cut 1/2 and 1/4 so the pieces match. How many pieces in each tray?",
        wait: true,
        draw(el, L) {
          el.append(kunafa({ num: 1, den: 2 }, { num: 1, den: 4 }, {}));
          const wrap = h("div", { class: "fk-tiles" });
          ["2 and 4", "4 and 4", "8 and 4"].forEach((t) => {
            const b = h("button", { class: "fk-tile", type: "button", text: t });
            b.addEventListener("click", () => (t === "4 and 4" ? L.ok("Fourths for both — 1/2 = 2/4, then 2/4 + 1/4 = 3/4.") : L.say("Both trays must end up with the same size pieces.", "bad")));
            wrap.append(b);
          });
          el.append(wrap);
        },
      },
      {
        say: "Ghubar says 1/2 + 1/3 = 2/5. What did he add?",
        wait: true,
        draw(el, L) {
          const wrap = h("div", { class: "fk-tiles" });
          [["He added the tops AND the bottoms.", true], ["Nothing, 2/5 is right.", false]].forEach(([t, ok]) => {
            const b = h("button", { class: "fk-tile", type: "button", html: t });
            b.addEventListener("click", () => (ok ? L.ok("Right — the bottoms are piece sizes, they never add.") : L.say("Look at the tray: is 2/5 bigger or smaller than a half?", "bad")));
            wrap.append(b);
          });
          el.append(kunafa({ num: 1, den: 2 }, { num: 1, den: 3 }, { cut: 6 }), wrap);
        },
      },
    ],
    levels: [
      {
        name: "Re-cut the trays",
        icon: "🔪",
        blurb: "Choose the common denominator — the smallest one that fits both.",
        rounds: 4,
        round(R) {
          const pairs = [[2, 3], [2, 4], [3, 4], [3, 6], [4, 6], [2, 5], [3, 5]];
          const [d1, d2] = LK.pick(pairs);
          const lcd = (d1 * d2) / gcd(d1, d2);
          LK.ui.choice(R, {
            prompt: `Re-cut <b>1/${d1}</b> and <b>1/${d2}</b>. What is the lowest common denominator?`,
            art: () => kunafa({ num: 1, den: d1 }, { num: 1, den: d2 }, {}),
            answer: String(lcd),
            options: shuffle([String(lcd), String(d1 * d2 + 1), String(Math.max(d1, d2) + 1)]),
            cat: "renamed-bottom-only",
            why: (v) => `A tray cut into ${v} will not line up with trays cut into ${d1} and ${d2}. You need a multiple of both.`,
            hint: `Count up in ${d1}s: ${d1}, ${d1 * 2}, ${d1 * 3}… which one is also a multiple of ${d2}?`,
          });
        },
      },
      {
        name: "Add them",
        icon: "➕",
        blurb: "Same-size pieces, then count them — and simplify.",
        rounds: 5,
        round(R) {
          let d1 = rint(2, 4), d2 = rint(2, 5);
          while (d2 === d1) d2 = rint(2, 5);
          const lcd = (d1 * d2) / gcd(d1, d2);
          const n1 = rint(1, d1 - 1), n2 = rint(1, d2 - 1);
          const sumN = (n1 * lcd) / d1 + (n2 * lcd) / d2;
          const g2 = gcd(sumN, lcd) || 1;
          const ans = g2 > 1 ? frac(sumN / g2, lcd / g2) : frac(sumN, lcd);
          const wrongTops = frac(n1 + n2, d1 + d2);
          LK.ui.choice(R, {
            prompt: `<b>${n1}/${d1} + ${n2}/${d2}</b> = ?`,
            art: () => kunafa({ num: n1, den: d1 }, { num: n2, den: d2 }, { cut: lcd }),
            answer: ans,
            options: shuffle([ans, wrongTops, frac(n1 + n2, lcd), frac(sumN, lcd + 1)]),
            cat: "added-denominators",
            why: (v) => (v === wrongTops ? "You added the bottoms — piece sizes do not add, they get matched."
              : v === frac(n1 + n2, lcd) ? "The tops must be renamed too: both fractions change to the new pieces."
              : `Count the pieces: ${(n1 * lcd) / d1} + ${(n2 * lcd) / d2} out of ${lcd}.`),
            hint: `${n1}/${d1} = ${(n1 * lcd) / d1}/${lcd}`,
          });
        },
      },
      {
        name: "Simplify it",
        icon: "✨",
        blurb: "The answer is right but not finished until it is in lowest terms.",
        rounds: 4,
        round(R) {
          let d = LK.pick([4, 6, 8, 10, 12]), n = rint(1, d - 1), g2 = gcd(n, d) || 1;
          let guard = 0;
          while (g2 === 1 && guard++ < 40) { d = LK.pick([4, 6, 8, 10, 12]); n = rint(1, d - 1); g2 = gcd(n, d) || 1; }
          const simple = frac(n / g2, d / g2);
          LK.ui.choice(R, {
            prompt: `Write <b>${n}/${d}</b> in lowest terms.`,
            answer: simple,
            options: shuffle([simple, frac(n - 1, d - 1), frac(n, d - g2)]),
            cat: "not-simplified",
            why: () => `Both ${n} and ${d} divide by ${g2}: ${n} ÷ ${g2} = ${n / g2}, ${d} ÷ ${g2} = ${d / g2}.`,
            hint: "Is there a number that divides both the top and the bottom?",
          });
        },
      },
    ],
    praise: ["Same-size pieces — that's the whole idea.", "Cut, count, simplify.", "The tray is ready."],
    finale: "The kunafa is cut, joined and served. 🍮",
  });
})();

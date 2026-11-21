/* Grade 6 · Juice Bar Ratios — equivalent ratios and unit rate.
   Mechanic = the thinking: the taste meter only stays green while mango : orange
   is multiplied, not added to. */
(function () {
  const { h, s, svg, rint, shuffle, fmt } = window.LK;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);

  function cups(mango, orange, opt) {
    const o = opt || {};
    const g = svg(520, 190, `a cup with ${mango} mango and ${orange} orange`);
    g.append(s("rect", { x: 0, y: 0, width: 520, height: 190, rx: 14, fill: "#f6fffb" }));
    const total = Math.max(mango + orange, 1);
    const hM = (mango / total) * 110, hO = (orange / total) * 110;
    g.append(s("path", { d: "M120 40 l50 0 l-8 120 l-34 0 Z", fill: "#eef7ff", stroke: "#b9cede", "stroke-width": 2 }));
    g.append(s("rect", { x: 121, y: 160 - hO, width: 48, height: hO, fill: "#ffb020", opacity: 0.9 }));
    g.append(s("rect", { x: 121, y: 160 - hO - hM, width: 48, height: hM, fill: "#ff8a3d", opacity: 0.92 }));
    g.append(s("text", { x: 200, y: 70, "font-size": 16, fill: "#8f2c12", text: `mango ${mango}` }));
    g.append(s("text", { x: 200, y: 96, "font-size": 16, fill: "#8f6a12", text: `orange ${orange}` }));
    const verdict = o.taste || (mango * 3 === orange * 2 ? "same taste" : "sour!");
    g.append(s("rect", { x: 200, y: 112, width: 200, height: 26, rx: 13, fill: verdict === "sour!" ? "#fdeee8" : "#e9f8ef", stroke: verdict === "sour!" ? "#e0302f" : "#15803d" }));
    g.append(s("text", { x: 300, y: 130, "text-anchor": "middle", "font-size": 14, fill: verdict === "sour!" ? "#a02118" : "#12633a", text: "taste: " + verdict }));
    /* a little bar of the ratio */
    for (let i = 0; i < Math.min(mango, 8); i++) g.append(s("circle", { cx: 430 + (i % 4) * 22, cy: 52 + Math.floor(i / 4) * 22, r: 8, fill: "#ff8a3d" }));
    for (let i = 0; i < Math.min(orange, 8); i++) g.append(s("circle", { cx: 430 + (i % 4) * 22, cy: 118 + Math.floor(i / 4) * 22, r: 8, fill: "#ffb020" }));
    return g;
  }

  LK.start({
    id: "g6-juice-bar",
    title: "Juice Bar Ratios",
    emoji: "🥤",
    topic: "Ratios and equivalent ratios",
    grade: "Grade 6 · age 11–12",
    band: "g68",
    coach: "🧃",
    how: {
      steps: [
        "The house mix is <b>2 mango : 3 orange</b>. That is the taste.",
        "To make more, <b>multiply both parts</b> by the same number — never add the same number.",
        "The taste meter goes sour the moment the ratio changes.",
      ],
    },
    world(el) {
      const g = cups(2, 3, { taste: "same taste" });
      g.append(s("text", { x: 40, y: 168, "font-size": 13, fill: "#0f766e", text: "Tahlia Street juice bar" }));
      el.append(g);
    },
    learn: [
      {
        say: "The house mix on Tahlia Street is 2 mango to 3 orange. Two parts to three parts — that is the taste.",
        draw(el) { el.append(cups(2, 3, { taste: "same taste" })); },
      },
      {
        say: "Double the order: 4 mango and 6 orange. Both parts × 2, so the taste is identical. Adding 2 to each part would break it.",
        draw(el) { el.append(cups(4, 6, { taste: "same taste" })); },
      },
      {
        say: "Your turn: 2 : 3 scaled by 4 is…",
        wait: true,
        draw(el, L) {
          const wrap = h("div", { class: "fk-tiles" });
          ["8 : 12", "6 : 7", "8 : 3"].forEach((t) => {
            const b = h("button", { class: "fk-tile", type: "button", text: t });
            b.addEventListener("click", () => (t === "8 : 12" ? L.ok("Both parts × 4 — the taste never changes.") : L.say("Multiply BOTH parts by 4. Adding is not scaling.", "bad")));
            wrap.append(b);
          });
          el.append(cups(2, 3), wrap);
        },
      },
      {
        say: "Ghubar made 2 + 2 = 4 mango and 3 + 2 = 5 orange. Why does it taste wrong?",
        wait: true,
        draw(el, L) {
          el.append(cups(4, 5, { taste: "sour!" }));
          const wrap = h("div", { class: "fk-tiles" });
          [["He added to both parts instead of multiplying.", true], ["Nothing wrong — 4 : 5 is the same as 2 : 3.", false]].forEach(([t, ok]) => {
            const b = h("button", { class: "fk-tile", type: "button", html: t });
            b.addEventListener("click", () => (ok ? L.ok("Yes — ratios scale by multiplying.") : L.say("Compare 2:3 and 4:5 — are they the same taste?", "bad")));
            wrap.append(b);
          });
          el.append(wrap);
        },
      },
    ],
    levels: [
      {
        name: "Scale the order",
        icon: "🥭",
        blurb: "More cups, same taste: multiply both parts.",
        rounds: 5,
        round(R) {
          const k = rint(2, 5), m = rint(2, 4), o = rint(3, 5);
          LK.ui.keypad(R, {
            prompt: `The mix is <b>${m} : ${o}</b>. For <b>${m * k}</b> mango, how many orange?`,
            art: () => cups(m, o),
            answer: o * k,
            max: 3,
            cat: "additive-ratio",
            why: (v) => (v === o + k ? `You added ${k} to the orange. Multiply: ${o} × ${k}.`
              : v === k ? "That is the multiplier, not the orange."
              : `${m} × ${k} = ${m * k}, so the orange must be ${o} × ${k}.`),
            hint: `What did you multiply ${m} by to get ${m * k}? Do the same to ${o}.`,
          });
        },
      },
      {
        name: "Same taste?",
        icon: "👅",
        blurb: "Only one of these keeps the 2 : 3 taste.",
        rounds: 5,
        round(R) {
          const k = rint(2, 4);
          const good = `${2 * k}:${3 * k}`;
          LK.ui.choice(R, {
            prompt: "The house mix is <b>2 : 3</b>. Which cup tastes the same?",
            art: () => cups(2, 3, { taste: "same taste" }),
            answer: good,
            options: shuffle([good, `${2 + k}:${3 + k}`, `${3 * k}:${2 * k}`]),
            cat: "order-reversed",
            why: (v) => (v === `${3 * k}:${2 * k}` ? "You swapped mango and orange — the order of a ratio matters."
              : v === `${2 + k}:${3 + k}` ? "That added to both parts. Multiply instead."
              : "Check both parts against 2 : 3."),
            hint: "Multiply 2 and 3 by the same number.",
          });
        },
      },
      {
        name: "Unit rate",
        icon: "📏",
        blurb: "Per cup, per glass — how much for one?",
        rounds: 4,
        round(R) {
          const glasses = rint(3, 6), cupsN = rint(2, 6);
          const per = cupsN / glasses;
          LK.ui.keypad(R, {
            prompt: `${cupsN} cups fill ${glasses} glasses. How many cups per glass?`,
            answer: Math.round(per * 100) / 100,
            decimal: true,
            tol: 0.02,
            max: 5,
            cat: "first-terms-only",
            why: () => `Divide the cups by the glasses: ${cupsN} ÷ ${glasses} ≈ ${fmt(per, 2)}.`,
            hint: `Unit rate = ${cupsN} ÷ ${glasses}`,
          });
        },
      },
    ],
    praise: ["Same taste, bigger order.", "You multiplied both parts.", "The meter stays green."],
    finale: "The queue on Tahlia Street is served — and every cup tastes the same. 🥤",
  });
})();

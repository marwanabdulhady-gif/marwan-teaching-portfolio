/* Grade 2 · Date Packing — place value to 1,000.
   Mechanic = the thinking: pack an order with boxes of 100, trays of 10 and singles,
   so the digits of the number are the packs on the bench. */
(function () {
  const { h, s, svg, rint, shuffle } = window.LK;

  const box = (x, y) => s("g", {}, [
    s("rect", { x, y, width: 54, height: 44, rx: 6, fill: "#e6e0ff", stroke: "#6f5bf0", "stroke-width": 2 }),
    s("text", { x: x + 27, y: y + 28, "text-anchor": "middle", "font-size": 15, fill: "#4a35c9", text: "100" }),
  ]);
  const tray = (x, y) => s("g", {}, [
    s("rect", { x, y, width: 46, height: 26, rx: 5, fill: "#ffe9d6", stroke: "#b4530a", "stroke-width": 2 }),
    s("text", { x: x + 23, y: y + 18, "text-anchor": "middle", "font-size": 13, fill: "#8f2c12", text: "10" }),
  ]);
  const single = (x, y) => s("ellipse", { cx: x + 9, cy: y + 9, rx: 8, ry: 9, fill: "#8a4b1f", stroke: "#5f3113" });

  /* the packing bench: hundreds as boxes, tens as trays, ones as loose dates */
  function bench(H, T, O, label) {
    const g = svg(560, 200, label || `${H} hundreds, ${T} tens, ${O} ones`);
    g.append(s("rect", { x: 0, y: 0, width: 560, height: 200, rx: 14, fill: "#fbf7f1" }));
    g.append(s("line", { x1: 20, y1: 168, x2: 540, y2: 168, stroke: "#d9c7a8", "stroke-width": 3 }));
    for (let i = 0; i < Math.min(H, 9); i++) g.append(box(28 + (i % 5) * 62, 104 - Math.floor(i / 5) * 52));
    for (let i = 0; i < Math.min(T, 9); i++) g.append(tray(28 + (i % 5) * 52, 118 + Math.floor(i / 5) * 30 + 18));
    for (let i = 0; i < Math.min(O, 12); i++) g.append(single(320 + (i % 6) * 32, 140 - Math.floor(i / 6) * 30 - (T ? 60 : 0)));
    g.append(s("text", { x: 300, y: 24, "font-size": 14, fill: "#667085", text: "boxes of 100 · trays of 10 · singles" }));
    g.append(s("text", { x: 300, y: 44, "font-size": 15, fill: "#10172a", text: `${H} × 100 + ${T} × 10 + ${O}` }));
    return g;
  }

  const digits = (n) => [Math.floor(n / 100), Math.floor((n % 100) / 10), n % 10];

  LK.start({
    id: "g2-date-packing",
    title: "Date Packing",
    emoji: "📦",
    topic: "Place value to 1,000",
    grade: "Grade 2 · age 7–8",
    band: "k2",
    coach: "🧕",
    how: {
      steps: [
        "An order comes in: pack it in <b>boxes of 100</b>, <b>trays of 10</b> and <b>singles</b>.",
        "Slide the three dials until the bench shows exactly the order.",
        "The digits of the number <em>are</em> the packs: 345 = 3 boxes, 4 trays, 5 dates.",
      ],
    },
    world(el) {
      const g = bench(3, 4, 5, "a date shop bench with 345 dates packed");
      for (let i = 0; i < 3; i++) g.append(s("path", { d: `M${470 + i * 22} 40 l14 0 l-14 18 l14 0`, stroke: "#c9a227", "stroke-width": 3, fill: "none", class: "fk-glow" }));
      g.append(s("rect", { x: 470, y: 100, width: 60, height: 46, rx: 6, fill: "#fff7e6", stroke: "#d9c7a8" }));
      g.append(s("text", { x: 500, y: 130, "text-anchor": "middle", "font-size": 16, fill: "#8f6a12", text: "🧾" }));
      el.append(g);
    },
    learn: [
      {
        say: "In the date shop, every number has three jobs: <b>hundreds</b>, <b>tens</b> and <b>ones</b>.",
        draw(el) { el.append(bench(3, 4, 5)); },
      },
      {
        say: "345 is <b>3</b> boxes (300) + <b>4</b> trays (40) + <b>5</b> singles. The digits tell you the packs.",
        draw(el) { el.append(bench(3, 4, 5)); },
      },
      {
        say: "Your turn: pack <b>208</b>. How many trays of ten?",
        wait: true,
        draw(el, L) {
          el.append(bench(2, 0, 8, "two boxes and eight dates"));
          const wrap = h("div", { class: "fk-tiles" });
          [0, 2, 8].forEach((n) => {
            const b = h("button", { class: "fk-tile", type: "button", text: String(n) });
            b.addEventListener("click", () => (n === 0 ? L.ok("Zero trays — the tens digit is 0, and the 0 must be written.") : L.say("Look at the tens digit of 208. It is 0.", "bad")));
            wrap.append(b);
          });
          el.append(wrap);
        },
      },
      {
        say: "Ghubar wrote 30045 for <b>345</b>. Why is that wrong?",
        wait: true,
        draw(el, L) {
          const wrap = h("div", { class: "fk-tiles" });
          [["A box of 100 is one digit, not three written out.", true], ["It is fine, the numbers add up.", false]].forEach(([t, ok]) => {
            const b = h("button", { class: "fk-tile", type: "button", html: t });
            b.addEventListener("click", () => (ok ? L.ok("Right — 3 hundreds is the digit 3 in the hundreds place.") : L.say("Look at the chart: one digit per place.", "bad")));
            wrap.append(b);
          });
          el.append(bench(3, 4, 5), wrap);
        },
      },
    ],
    levels: [
      {
        name: "Pack the order",
        icon: "📦",
        blurb: "Slide the boxes, trays and singles until the bench matches the order.",
        rounds: 4,
        round(R) {
          const n = rint(105, 899);
          const [H, T, O] = digits(n);
          LK.ui.sliders(R, {
            prompt: `Pack <b>${n}</b> dates.`,
            sub: "Boxes hold 100, trays hold 10, singles are 1.",
            art: () => {
              const g = svg(560, 150, "the packing bench");
              g.append(s("rect", { x: 0, y: 0, width: 560, height: 150, rx: 14, fill: "#fbf7f1" }));
              g.append(s("text", { x: 20, y: 30, "font-size": 14, fill: "#667085", text: "boxes ✕ 100 · trays ✕ 10 · dates" }));
              g.append(s("text", { x: 20, y: 62, "font-size": 16, fill: "#10172a", text: "the order: " + n }));
              g.append(s("text", { x: 20, y: 96, "font-size": 14, fill: "#667085", text: "your packs show in the readout below" }));
              return g;
            },
            controls: [
              { label: "boxes of 100", min: 0, max: 9, value: 0 },
              { label: "trays of 10", min: 0, max: 9, value: 0 },
              { label: "singles", min: 0, max: 9, value: 0 },
            ],
            test: (v) => v[0] === H && v[1] === T && v[2] === O,
            answer: [H, T, O],
            cat: "pv-swap",
            why: (v) => `You packed ${v[0]} hundreds, ${v[1]} tens, ${v[2]} ones = ${v[0] * 100 + v[1] * 10 + v[2]}. The order is ${n}.`,
            onInput: (v, RR) => RR.say(`Your bench: ${v[0] * 100 + v[1] * 10 + v[2]} · ${v[0]} boxes, ${v[1]} trays, ${v[2]} dates.`, "hint"),
          });
        },
      },
      {
        name: "What is it worth?",
        icon: "🔢",
        blurb: "A digit is never just a digit — its place gives it the value.",
        rounds: 5,
        round(R) {
          const n = rint(120, 989);
          const [H, T, O] = digits(n);
          const which = rint(0, 2);
          const asks = [
            { d: H, val: H * 100, place: "hundreds" },
            { d: T, val: T * 10, place: "tens" },
            { d: O, val: O, place: "ones" },
          ][which];
          LK.ui.choice(R, {
            prompt: `In <b>${n}</b>, what is the digit <b>${asks.d}</b> worth?`,
            art: () => bench(H, T, O),
            answer: String(asks.val),
            options: shuffle([String(asks.val), String(asks.d), String(asks.val * 10 || 10)]),
            cat: asks.d === 0 ? "pv-zero" : "pv-concat",
            why: (v) => (v === asks.d ? `That is the digit itself — but it sits in the ${asks.place} place, so it is worth ${asks.val}.`
              : `Check the ${asks.place} column: ${asks.d} × ${asks.val / Math.max(asks.d, 1)} = ${asks.val}.`),
            hint: "Which column is it in — hundreds, tens or ones?",
          });
        },
      },
      {
        name: "Expanded form",
        icon: "➕",
        blurb: "Break the number into the packs it is made of.",
        rounds: 4,
        round(R) {
          const n = rint(105, 999);
          const [H, T, O] = digits(n);
          LK.ui.choice(R, {
            prompt: `<b>${n}</b> in expanded form is…`,
            answer: `${H}00+${T}0+${O}`,
            options: shuffle([
              `${H}00+${T}0+${O}`,
              `${H}0+${T}0+${O}`,
              `${H}00+${T}+${O}`,
            ]).map((t) => ({ key: t.replace(/\s/g, ""), html: t.split("+").join(" + ") })),
            cat: "pv-concat",
            why: () => `Each digit times its place: ${H} × 100 + ${T} × 10 + ${O}.`,
            hint: "Hundreds get two zeros, tens get one.",
          });
        },
      },
    ],
    praise: ["Packed neatly.", "Place value solid.", "Exactly the order."],
    finale: "Every order packed — the shop shuts for the day. 📦",
  });
})();

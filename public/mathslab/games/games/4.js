/* Grade 4 · The Hidden Question — model multi-step problems (CUBES).
   Mechanic = the thinking: before any arithmetic, name the question hiding
   inside the question, then draw the bars that show it. */
(function () {
  const { h, s, svg, rint, shuffle } = window.LK;

  const bus = (x, y, kids) => {
    const g = s("g", {});
    g.append(s("rect", { x, y, width: 96, height: 46, rx: 8, fill: "#ffd166", stroke: "#c99a1f", "stroke-width": 2 }));
    g.append(s("rect", { x: x + 8, y: y + 8, width: 24, height: 16, rx: 3, fill: "#dff1ff", stroke: "#9cc3dd" }));
    g.append(s("rect", { x: x + 40, y: y + 8, width: 24, height: 16, rx: 3, fill: "#dff1ff", stroke: "#9cc3dd" }));
    g.append(s("text", { x: x + 76, y: y + 34, "text-anchor": "middle", "font-size": 13, fill: "#7a5a00", text: String(kids) }));
    g.append(s("circle", { cx: x + 24, cy: y + 50, r: 8, fill: "#3a3f4b" }));
    g.append(s("circle", { cx: x + 74, cy: y + 50, r: 8, fill: "#3a3f4b" }));
    return g;
  };
  const bar = (x, y, w, hgt, fill, label) => s("g", {}, [
    s("rect", { x, y, width: w, height: hgt, rx: 6, fill, stroke: "#8a8f9c", "stroke-width": 1.5 }),
    s("text", { x: x + w / 2, y: y + hgt / 2 + 5, "text-anchor": "middle", "font-size": 12.5, fill: "#2b3242", text: label }),
  ]);

  const trip = (buses, perBus, vans, perVan) => svg(560, 170, "buses and vans taking children to the aquarium");
  function scene(buses, perBus, vans, perVan) {
    const g = trip(buses, perBus, vans, perVan);
    g.append(s("rect", { x: 0, y: 0, width: 560, height: 170, fill: "#eef8ff" }));
    g.append(s("rect", { x: 0, y: 118, width: 560, height: 52, fill: "#cfd6e2" }));
    for (let i = 0; i < buses; i++) g.append(bus(26 + i * 104, 62, perBus));
    for (let i = 0; i < vans; i++) g.append(bus(300 + i * 104, 20, perVan));
    return g;
  }

  LK.start({
    id: "g4-hidden-question",
    title: "The Hidden Question",
    emoji: "🚌",
    topic: "Multi-step problems with bar models",
    grade: "Grade 4 · age 9–10",
    band: "g35",
    coach: "🧭",
    how: {
      steps: [
        "Read the problem twice. Underline the question that is <b>asked</b>.",
        "Find the question <b>hiding inside</b> it — you cannot answer the big one without it.",
        "Draw a bar for each group, work out the hidden answer, then answer the real question.",
      ],
    },
    world(el) {
      const g = scene(3, 24, 2, 15);
      g.append(s("circle", { cx: 500, cy: 30, r: 18, fill: "#ffcf6b", class: "fk-glow" }));
      el.append(g);
    },
    learn: [
      {
        say: "The school is going to the Jeddah Aquarium: <b>8 buses of 24 children</b> and <b>6 vans of 15</b>. How many children altogether?",
        draw(el) { el.append(scene(3, 24, 2, 15)); },
      },
      {
        say: "The hidden question is: <b>how many children on the buses?</b> and <b>how many in the vans?</b> Two bars, then one total.",
        draw(el) {
          const g = svg(520, 150, "two bars and a total");
          g.append(bar(40, 30, 320, 40, "#efeaff", "8 × 24 = 192"));
          g.append(bar(40, 80, 240, 40, "#ffe9d6", "6 × 15 = 90"));
          g.append(bar(40, 128, 420, 16, "#e9f8ef", "192 + 90 = 282"));
          el.append(g);
        },
      },
      {
        say: "Your turn: which question is <b>hidden</b> inside “how many children altogether?”",
        wait: true,
        draw(el, L) {
          const wrap = h("div", { class: "fk-tiles" });
          [["How many children are on all the buses?", true], ["How many wheels do the buses have?", false]].forEach(([t, ok]) => {
            const b = h("button", { class: "fk-tile", type: "button", html: t });
            b.addEventListener("click", () => (ok ? L.ok("Yes — that group has to be counted before the total.") : L.say("Wheels are not children. Which group is missing?", "bad")));
            wrap.append(b);
          });
          el.append(scene(3, 24, 2, 15), wrap);
        },
      },
      {
        say: "Ghubar answered <b>24 + 15 = 39</b>. What did he miss?",
        wait: true,
        draw(el, L) {
          const wrap = h("div", { class: "fk-tiles" });
          [["The “each” — 8 buses of 24, not one bus.", true], ["Nothing, 39 is right.", false]].forEach(([t, ok]) => {
            const b = h("button", { class: "fk-tile", type: "button", html: t });
            b.addEventListener("click", () => (ok ? L.ok("Exactly — each group is multiplied first.") : L.say("How many buses are there? How many vans?", "bad")));
            wrap.append(b);
          });
          el.append(scene(3, 24, 2, 15), wrap);
        },
      },
    ],
    levels: [
      {
        name: "Name the hidden question",
        icon: "❓",
        blurb: "Before any sums: what must you work out first?",
        rounds: 4,
        round(R) {
          const b = rint(4, 9), per = rint(18, 32), v = rint(2, 6), pv = rint(10, 18);
          const opts = shuffle([
            `How many children are on all ${b} buses?`,
            `How many children are in one bus?`,
            `How many seats are on a bus?`,
          ]);
          LK.ui.choice(R, {
            prompt: `There are <b>${b} buses</b> with <b>${per}</b> children in each, and <b>${v} vans</b> with <b>${pv}</b> each. How many children altogether?`,
            sub: "Which question must you answer first?",
            art: () => scene(Math.min(b, 3), per, Math.min(v, 2), pv),
            answer: opts[0],
            options: opts,
            cat: "skipped-hidden-q",
            why: (v2) => (v2 === opts[1] ? "One bus is not a group — you need all the buses." : "Look for the group that has an “each”."),
            hint: "Which part of the story has an “each”?",
          });
        },
      },
      {
        name: "Choose the bars",
        icon: "📊",
        blurb: "A bar model either shows the groups or it does not.",
        rounds: 4,
        round(R) {
          const a = rint(3, 8), b1 = rint(12, 25);
          const bars = (vals, label) => {
            const g = svg(240, 120, label);
            let y = 16;
            vals.forEach((v, i) => { g.append(bar(14, y, Math.max(60, v * 6), 26, i === 2 ? "#e9f8ef" : i ? "#ffe9d6" : "#efeaff", String(v))); y += 32; });
            return `<svg viewBox="0 0 240 120" width="100%" height="96" aria-label="${label}">${g.innerHTML.replace(/<\/?svg[^>]*>/g, "")}</svg>`;
          };
          const good = [a * b1, 0, a * b1];
          const badAdd = [a, b1, a + b1];
          const badOne = [b1, 0, b1];
          LK.ui.choice(R, {
            prompt: `“${a} buses with ${b1} children each — how many children?” Which bars show the problem?`,
            answer: "good",
            options: [
              { key: "good", html: bars(good, "one long bar for all the buses") },
              { key: "add", html: bars(badAdd, "two bars added") },
              { key: "one", html: bars(badOne, "one bar only") },
            ],
            cat: "forgot-each",
            why: (v) => (v === "add" ? "That adds the number of buses to the children — the buses each hold a full group."
              : "One bus is not the whole trip."),
            hint: `How many children in ALL ${a} buses?`,
          });
        },
      },
      {
        name: "Answer the real question",
        icon: "🧮",
        blurb: "Now do both steps and give the total.",
        rounds: 4,
        round(R) {
          const b = rint(5, 9), per = rint(16, 28), v = rint(2, 5), pv = rint(10, 16);
          const total = b * per + v * pv;
          LK.ui.keypad(R, {
            prompt: `How many children altogether?`,
            sub: `${b} buses × ${per} children + ${v} vans × ${pv} children`,
            answer: total,
            max: 4,
            cat: "wrong-operation",
            why: (x) => (x === b * per ? "That is the buses only — the vans are still waiting." : x === per + pv ? "Each group is multiplied first, then added." : "Two steps: buses, vans, then the total."),
            hint: `${b} × ${per} = ${b * per}, then ${v} × ${pv} = ${v * pv}`,
          });
        },
      },
    ],
    praise: ["Two steps, both right.", "You found the hidden question.", "Bars first, sums second — that's how."],
    finale: "The whole school made it to the aquarium. 🚌",
  });
})();

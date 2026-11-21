/* Grade 1 · Ten-Seat Dhow — make 10 to add within 20.
   Mechanic = the thinking: fill the ten seats first, then count the riders left on the dock. */
(function () {
  const { h, s, svg, rint, shuffle } = window.LK;

  /* a dhow with ten seats; `filled` riders are aboard, `dock` wait on the pier */
  function dhow(filled, dock, label) {
    const g = svg(560, 210, label || `${filled} riders aboard, ${dock} on the dock`);
    g.append(s("rect", { x: 0, y: 0, width: 560, height: 210, fill: "#eaf5fb" }));
    g.append(s("path", { d: "M0 150 q140 -14 280 0 t280 -4 L560 210 L0 210 Z", fill: "#bfe3f2" }));
    const boat = s("g", { class: "fk-bob" });
    boat.append(s("path", { d: "M96 132 l380 0 l-34 46 l-312 0 Z", fill: "#8a5a2b", stroke: "#6b441f", "stroke-width": 2 }));
    boat.append(s("rect", { x: 272, y: 56, width: 8, height: 78, fill: "#6b441f" }));
    boat.append(s("path", { d: "M280 62 l58 60 l-58 0 Z", fill: "#fff7e6", stroke: "#d9c7a8", "stroke-width": 1.6 }));
    for (let i = 0; i < 10; i++) {
      const cx = 122 + (i % 5) * 68, cy = 106 + Math.floor(i / 5) * 30;
      const on = i < filled;
      boat.append(s("circle", { cx, cy, r: 12, fill: on ? "#6f5bf0" : "#ffffff", stroke: on ? "#4a35c9" : "#cfd8e6", "stroke-width": 2 }));
      if (on) boat.append(s("circle", { cx, cy: cy - 16, r: 5.5, fill: "#ffd9a8", stroke: "#c98b45" }));
    }
    /* the pier and the riders still waiting */
    boat.append(s("rect", { x: 470, y: 120, width: 90, height: 10, rx: 4, fill: "#c9a227" }));
    for (let i = 0; i < Math.min(dock, 6); i++) {
      const cx = 486 + (i % 3) * 30, cy = 112 - Math.floor(i / 3) * 26;
      boat.append(s("circle", { cx, cy, r: 10, fill: "#ffd9a8", stroke: "#c98b45" }));
      boat.append(s("rect", { x: cx - 7, y: cy + 8, width: 14, height: 12, rx: 4, fill: "#2f8fbf" }));
    }
    if (dock > 6) boat.append(s("text", { x: 540, y: 96, "text-anchor": "end", "font-size": 15, fill: "#31425c", text: `+${dock - 6}` }));
    g.append(boat);
    g.append(s("text", { x: 20, y: 28, "font-size": 15, fill: "#31425c", text: "ten seats" }));
    return g;
  }

  LK.start({
    id: "g1-ten-seat-dhow",
    title: "Ten-Seat Dhow",
    emoji: "⛵",
    topic: "Make 10 to add within 20",
    grade: "Grade 1 · age 6–7",
    band: "k2",
    coach: "🧑‍✈️",
    how: {
      steps: [
        "The dhow holds <b>ten</b> riders. Fill the ten seats first.",
        "Whatever is left standing on the dock is added on afterwards.",
        "8 + 5 → fill 8 + <b>2</b> = 10, then 3 more on the dock = <b>13</b>.",
      ],
    },
    world(el) {
      const g = dhow(7, 3, "a dhow with seven of ten seats taken");
      g.append(s("circle", { cx: 500, cy: 40, r: 22, fill: "#ffcf6b" }));
      for (let i = 0; i < 4; i++) g.append(s("ellipse", { cx: 80 + i * 130, cy: 34 + (i % 2) * 14, rx: 30, ry: 11, fill: "#ffffff", class: "fk-drift" }));
      el.append(g);
    },
    learn: [
      {
        say: "A dhow at the Jeddah Corniche holds exactly <b>ten</b> riders. Filling ten is the fast way to add.",
        draw(el) { el.append(dhow(6, 4)); },
      },
      {
        say: "8 + 5? Take <b>2</b> from the 5 to fill the boat: 8 + 2 = 10. That leaves <b>3</b> on the dock. 10 + 3 = <b>13</b>.",
        draw(el) { el.append(dhow(10, 3)); },
      },
      {
        say: "Your turn: 9 riders are aboard. How many more fill the ten seats?",
        wait: true,
        draw(el, L) {
          el.append(dhow(9, 4, "nine of ten seats taken"));
          const wrap = h("div", { class: "fk-tiles" });
          [1, 2, 9].forEach((n) => {
            const b = h("button", { class: "fk-tile", type: "button", text: String(n) });
            b.addEventListener("click", () => (n === 1 ? L.ok("One empty seat — 9 + 1 = 10.") : L.say("Count the empty seats on the boat.", "bad")));
            wrap.append(b);
          });
          el.append(wrap);
        },
      },
      {
        say: "Ghubar says: “8 + 5 = 10 because I filled the boat.” What did he forget?",
        wait: true,
        draw(el, L) {
          const wrap = h("div", { class: "fk-tiles" });
          [["The 3 riders still waiting on the dock.", true], ["Nothing — 10 is the answer.", false]].forEach(([t, ok]) => {
            const b = h("button", { class: "fk-tile", type: "button", html: t });
            b.addEventListener("click", () => (ok ? L.ok("Right — 10 then + 3 = 13.") : L.say("Look at the dock: riders are still standing there.", "bad")));
            wrap.append(b);
          });
          el.append(dhow(10, 3), wrap);
        },
      },
    ],
    levels: [
      {
        name: "Fill the ten",
        icon: "🪑",
        blurb: "Riders are aboard. How many more fill the ten seats?",
        rounds: 4,
        round(R) {
          const a = rint(6, 9);
          const need = 10 - a;
          LK.ui.choice(R, {
            prompt: `The boat is full when it holds <b>10</b>. How many more riders fill it?`,
            sub: `${a} are already aboard.`,
            art: () => dhow(a, 4),
            answer: String(need),
            options: shuffle([String(need), String(10), String(Math.max(1, need + 2))]),
            cat: "count-all",
            why: (v) => `You chose ${v}. Count the <b>empty seats</b>, not the full ones.`,
            hint: "Count the empty seats on the boat.",
          });
        },
      },
      {
        name: "The bond",
        icon: "🔟",
        blurb: "Fill the ten, then add what is left on the dock.",
        rounds: 5,
        round(R) {
          const a = rint(6, 9), b = rint(3, 9);
          const total = a + b, left = b - (10 - a);
          LK.ui.choice(R, {
            prompt: `${a} + ${b} = ?`,
            sub: `Fill the boat: ${a} + <b>${10 - a}</b> = 10, then add the rest of the ${b}.`,
            art: () => dhow(10, left),
            answer: String(total),
            options: shuffle([String(total), String(a + 0 + b + 1), String(left)]),
            cat: "forgot-leftover",
            why: (v) => (v === left ? `That is only the riders left on the dock. Ten are already aboard: 10 + ${left} = ${total}.`
              : v === a + b + 1 ? "Check the dock: how many are really left after filling the ten?"
              : `You picked ${v}. After the boat is full, add the leftovers to 10.`),
            hint: `Fill the boat with ${10 - a}. What is left of the ${b}?`,
          });
        },
      },
      {
        name: "No pictures",
        icon: "✏️",
        blurb: "The same making-ten facts, written as an equation.",
        rounds: 5,
        round(R) {
          const a = rint(7, 9), b = rint(4, 9);
          LK.ui.keypad(R, {
            prompt: `${a} + ${b} = ?`,
            answer: a + b,
            max: 2,
            cat: "subtracted",
            why: (v) => (v === Math.abs(a - b) ? "That is subtracting — the riders are joining, so add."
              : v === a ? "You stopped at the first number. Fill the ten, then add the rest."
              : `Check: ${a} + ${10 - a} = 10, then add ${b - (10 - a)}.`),
            hint: `How many to make ten with ${a}?`,
          });
        },
      },
    ],
    praise: ["The boat sails!", "Making ten works.", "That is it."],
    finale: "Ten seats filled, every rider aboard. ⛵",
  });
})();

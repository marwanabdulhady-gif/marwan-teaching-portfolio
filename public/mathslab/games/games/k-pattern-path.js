/* Kindergarten · Oasis Pattern Path — notice and continue a repeating pattern.
   Mechanic = the thinking: spot the repeat, then choose what comes next. */
(function () {
  const { h, s, svg, shuffle } = window.LK;

  const TOKENS = [
    { id: "date", label: "date", emoji: "🟤", color: "#8a4b1f" },
    { id: "flower", label: "flower", emoji: "🌼", color: "#efb83f" },
    { id: "shell", label: "shell", emoji: "🐚", color: "#e89b75" },
  ];
  const token = (id) => TOKENS.find((x) => x.id === id);
  const patternFor = (a, b, size) => Array.from({ length: size }, (_, i) => i % 2 ? b : a);

  function patternArt(ids, missingAt, label) {
    const g = svg(560, 132, label || "a repeating pattern with one missing place");
    g.append(s("rect", { x: 0, y: 0, width: 560, height: 132, rx: 18, fill: "#fff9ef" }));
    ids.forEach((id, i) => {
      const x = 32 + i * 76;
      g.append(s("rect", { x, y: 27, width: 62, height: 74, rx: 15, fill: i === missingAt ? "#fff" : "#fff", stroke: i === missingAt ? "#6f5bf0" : "#e8dfd1", "stroke-width": i === missingAt ? 3 : 2, "stroke-dasharray": i === missingAt ? "6 5" : "none" }));
      if (i !== missingAt) g.append(s("text", { x: x + 31, y: 77, "text-anchor": "middle", "font-size": 34, text: token(id).emoji }));
      else g.append(s("text", { x: x + 31, y: 76, "text-anchor": "middle", "font-size": 24, "font-weight": 800, fill: "#6f5bf0", text: "?" }));
    });
    return g;
  }

  function choices(R, a, b, length, shapeMode) {
    const ids = patternFor(a, b, length);
    const answer = ids[ids.length - 1];
    const shown = ids.slice(0, -1).concat("missing");
    const options = shuffle([answer, a === answer ? b : a, ...TOKENS.filter((t) => t.id !== a && t.id !== b).map((t) => t.id)]).slice(0, 3);
    const art = shapeMode
      ? () => {
          const g = svg(560, 132, "a repeating pattern of colored shapes with one missing shape");
          g.append(s("rect", { x: 0, y: 0, width: 560, height: 132, rx: 18, fill: "#f5f8ff" }));
          shown.forEach((id, i) => {
            const cx = 63 + i * 76;
            if (id === "missing") {
              g.append(s("circle", { cx, cy: 63, r: 28, fill: "#fff", stroke: "#6f5bf0", "stroke-width": 3, "stroke-dasharray": "6 5" }));
              g.append(s("text", { x: cx, y: 72, "text-anchor": "middle", "font-size": 24, "font-weight": 800, fill: "#6f5bf0", text: "?" }));
            } else {
              const isA = id === a;
              g.append(isA
                ? s("circle", { cx, cy: 63, r: 23, fill: token(id).color })
                : s("path", { d: `M${cx} 37 L${cx + 25} 83 L${cx - 25} 83 Z`, fill: token(id).color }));
            }
          });
          return g;
        }
      : () => patternArt(shown, shown.length - 1);
    LK.ui.choice(R, {
      prompt: "What comes next in the pattern?",
      art,
      answer,
      options: options.map((id) => ({ key: id, html: `<span aria-label="${token(id).label}" style="font-size:2rem">${token(id).emoji}</span>` })),
      cat: "pattern-repeat-missed",
      why: () => `Look for the part that repeats: ${token(a).label}, ${token(b).label}. Point to each marker and say the little part aloud from the start.`,
      hint: `Say the repeating part aloud: ${token(a).label}, ${token(b).label}; ${token(a).label}, ${token(b).label}.`,
    });
  }

  LK.start({
    id: "k-pattern-path",
    title: "Oasis Pattern Path",
    emoji: "🌼",
    topic: "Notice and continue repeating patterns",
    grade: "Kindergarten · age 5–6",
    band: "k2",
    coach: "🐪",
    how: { steps: ["Look at the flowers, shells, and dates.", "Find the little part that repeats.", "Choose what should come next."] },
    world(el) {
      const g = svg(620, 190, "a winding garden path lined with flowers, shells, and date palms");
      g.append(s("rect", { x: 0, y: 0, width: 620, height: 190, rx: 18, fill: "#eff8e9" }));
      g.append(s("path", { d: "M0 150 Q150 90 300 145 T620 125", fill: "none", stroke: "#d7bb87", "stroke-width": 46, "stroke-linecap": "round" }));
      [55, 145, 235, 325, 415, 505].forEach((x, i) => g.append(s("text", { x, y: 125 + (i % 2) * 12, "text-anchor": "middle", "font-size": 34, text: ["🌼", "🐚", "🌼", "🐚", "🌼", "🐚"][i] })));
      el.append(g, h("p", { class: "fk-frame-caption", text: "A little path winds through the oasis garden. Help Noor choose the next garden marker." }));
    },
    learn: [
      {
        say: "Noor is decorating an oasis path. The flowers and shells repeat: <b>flower, shell, flower, shell</b>.",
        draw(el) { el.append(patternArt(["flower", "shell", "flower", "shell"], -1, "flower shell flower shell repeating pattern")); },
      },
      {
        say: "The same little part starts again. Say it with me: <b>flower, shell</b> — flower, shell.",
        draw(el) { el.append(patternArt(["flower", "shell", "flower", "shell", "flower"], -1)); },
      },
      {
        say: "Your turn: what comes next — a flower or a shell?",
        wait: true,
        draw(el, L) {
          const wrap = h("div", { class: "fk-tiles" });
          [["🌼 Flower", false], ["🐚 Shell", true]].forEach(([label, ok]) => {
            const b = h("button", { class: "fk-tile", type: "button", text: label });
            b.addEventListener("click", () => ok ? L.ok("Yes! The flower-and-shell part repeats. After the flower comes the shell.") : L.say("Look at the first two garden markers. Say them again.", "bad"));
            wrap.append(b);
          });
          el.append(patternArt(["flower", "shell", "flower", "shell", "flower", "missing"], 5), wrap);
        },
      },
      {
        say: "Ghubar says the pattern is flower, shell, flower, shell, flower, shell. What little part repeats?",
        wait: true,
        draw(el, L) {
          const wrap = h("div", { class: "fk-tiles" });
          [["Flower, shell", true], ["Flower, flower", false]].forEach(([label, ok]) => {
            const b = h("button", { class: "fk-tile", type: "button", text: label });
            b.addEventListener("click", () => ok ? L.ok("Right — flower, shell is the repeating part.") : L.say("Follow the markers from the beginning. Which two keep coming back?", "bad"));
            wrap.append(b);
          });
          el.append(patternArt(["flower", "shell", "flower", "shell", "flower", "shell"], -1), wrap);
        },
      },
    ],
    levels: [
      {
        name: "Garden markers", icon: "🌼", blurb: "Continue a repeating pattern of garden treasures.", rounds: 4,
        round(R) {
          const pairs = [["flower", "shell"], ["date", "flower"], ["shell", "date"]];
          const [a, b] = pairs[Math.floor(Math.random() * pairs.length)];
          choices(R, a, b, 5, false);
        },
      },
      {
        name: "Shape path", icon: "🔵", blurb: "Spot the color-and-shape pattern and choose the next piece.", rounds: 4,
        round(R) {
          const pairs = [["date", "flower"], ["shell", "date"], ["flower", "shell"]];
          const [a, b] = pairs[Math.floor(Math.random() * pairs.length)];
          choices(R, a, b, 6, true);
        },
      },
      {
        name: "Say the rule", icon: "🧠", blurb: "Find the repeating part, then choose the next garden marker.", rounds: 4,
        round(R) {
          const pairs = [["flower", "shell"], ["date", "shell"], ["shell", "flower"]];
          const [a, b] = pairs[Math.floor(Math.random() * pairs.length)];
          choices(R, a, b, 7, false);
        },
      },
    ],
    praise: ["You spotted the pattern!", "The garden is growing in order!", "Well noticed!"],
    finale: "You found the little part that repeats — the oasis path is ready! 🌼",
  });
})();

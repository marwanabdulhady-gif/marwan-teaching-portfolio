/* Grade 3 · Palm Grove Arrays — multiplication as equal groups and arrays.
   Mechanic = the thinking: a full rectangle of palms IS the product. */
(function () {
  const { h, s, svg, rint, shuffle } = window.LK;

  const palm = (x, y, k) => {
    const g = s("g", {});
    const t = k || 1;
    g.append(s("rect", { x: x - 2 * t, y: y - 16 * t, width: 4 * t, height: 18 * t, rx: 2, fill: "#8a5a2b" }));
    for (let i = 0; i < 5; i++) {
      const a = (-70 + i * 35) * (Math.PI / 180);
      g.append(s("path", {
        d: `M${x} ${y - 16 * t} q${Math.cos(a) * 14 * t} ${Math.sin(a) * 12 * t} ${Math.cos(a) * 24 * t} ${Math.sin(a) * 18 * t + 6 * t}`,
        stroke: "#15803d", "stroke-width": 2.4 * t, fill: "none", "stroke-linecap": "round",
      }));
    }
    return g;
  };

  /* a grove of r rows by c palms */
  function grove(r, c, planted, label) {
    const g = svg(560, 220, label || `${r} rows of ${c} palms`);
    g.append(s("rect", { x: 0, y: 0, width: 560, height: 220, fill: "#fdf6e3" }));
    g.append(s("rect", { x: 0, y: 150, width: 560, height: 70, fill: "#e9d8a6" }));
    const cw = Math.min(52, 460 / Math.max(c, 1)), rh = Math.min(46, 130 / Math.max(r, 1));
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) {
        const x = 40 + j * cw + cw / 2, y = 40 + i * rh + rh - 6;
        const on = planted == null || i * c + j < planted;
        if (on) g.append(palm(x, y, Math.min(1, cw / 46)));
        else g.append(s("rect", { x: x - 8, y: y - 6, width: 16, height: 8, rx: 3, fill: "#dcc79a", stroke: "#c9b382" }));
      }
    }
    g.append(s("text", { x: 20, y: 212, "font-size": 13, fill: "#7a6a45", text: `${r} rows · ${c} in each row` }));
    return g;
  }

  LK.start({
    id: "g3-palm-grove",
    title: "Palm Grove Arrays",
    emoji: "🌴",
    topic: "Multiplication as arrays",
    grade: "Grade 3 · age 8–9",
    band: "g35",
    coach: "👨‍🌾",
    how: {
      steps: [
        "A grove is planted in <b>rows</b>, with the same number of palms in every row.",
        "Rows × palms in each row = the whole grove. That is multiplication.",
        "3 rows of 4 palms is <b>3 × 4 = 12</b>, not 3 + 4.",
      ],
    },
    world(el) {
      const g = grove(3, 5, null, "a grove of three rows of five palms");
      g.append(s("circle", { cx: 500, cy: 42, r: 24, fill: "#ffcf6b", class: "fk-glow" }));
      el.append(g);
    },
    learn: [
      {
        say: "In Al-Ahsa the palms are planted in rows. Count a row, and you know every row.",
        draw(el) { el.append(grove(3, 4, null)); },
      },
      {
        say: "3 rows with <b>4</b> in each row: 4 + 4 + 4 = 12, and the fast way to write that is <b>3 × 4 = 12</b>.",
        draw(el) { el.append(grove(3, 4, null)); },
      },
      {
        say: "Your turn: this grove has 2 rows of 5. What multiplication is it?",
        wait: true,
        draw(el, L) {
          el.append(grove(2, 5, null));
          const wrap = h("div", { class: "fk-tiles" });
          ["2 × 5", "2 + 5", "5 × 5"].forEach((t) => {
            const b = h("button", { class: "fk-tile", type: "button", text: t });
            b.addEventListener("click", () => (t === "2 × 5" ? L.ok("Two rows of five — 2 × 5.") : L.say("Rows × in each row. Adding the row numbers is not a grove.", "bad")));
            wrap.append(b);
          });
          el.append(wrap);
        },
      },
      {
        say: "Ghubar says “3 rows of 4 palms is 7 palms, because 3 + 4 = 7.” Where is the mistake?",
        wait: true,
        draw(el, L) {
          const wrap = h("div", { class: "fk-tiles" });
          [["Every row has 4, so it is 4 + 4 + 4 = 12.", true], ["7 is right.", false]].forEach(([t, ok]) => {
            const b = h("button", { class: "fk-tile", type: "button", html: t });
            b.addEventListener("click", () => (ok ? L.ok("Exactly — multiplication counts equal rows.") : L.say("Count the palms in the picture one row at a time.", "bad")));
            wrap.append(b);
          });
          el.append(grove(3, 4, null), wrap);
        },
      },
    ],
    levels: [
      {
        name: "Plant the grove",
        icon: "🌱",
        blurb: "Tap every plot — the grove must be a full rectangle.",
        rounds: 4,
        round(R) {
          const r = rint(2, 4), c = rint(3, 6);
          const total = r * c;
          R.el.append(h("h2", { class: "fk-prompt", html: `Plant <b>${r} rows</b> of <b>${c}</b> palms. Tap every plot.` }));
          const board = svg(520, 210, "empty plots in rows");
          let planted = 0;
          const paint = () => {
            board.innerHTML = "";
            board.append(s("rect", { x: 0, y: 0, width: 520, height: 210, rx: 14, fill: "#fdf6e3" }));
            for (let i = 0; i < r; i++) {
              for (let j = 0; j < c; j++) {
                const x = 50 + j * (400 / c), y = 40 + i * (140 / r);
                const idx = i * c + j;
                const cell = s("g", { style: "cursor:pointer" });
                cell.append(s("rect", { x, y, width: 400 / c - 10, height: 140 / r - 10, rx: 8, fill: idx < planted ? "#e9f8ef" : "#fffdf6", stroke: idx < planted ? "#15803d" : "#e0d3b0", "stroke-width": 2 }));
                if (idx < planted) cell.append(palm(x + (400 / c - 10) / 2, y + (140 / r - 10) - 4, Math.min(1, 120 / r / 46)));
                cell.addEventListener("click", () => {
                  if (R.done) return;
                  planted = idx < planted ? idx : idx + 1;
                  paint();
                });
                board.append(cell);
              }
            }
            board.append(s("text", { x: 12, y: 204, "font-size": 13, fill: "#7a6a45", text: `planted: ${planted}` }));
          };
          const check = () => {
            if (planted === total) R.right();
            else R.wrong(planted < total ? `Only ${planted} planted — the grove needs ${r} full rows of ${c}.` : `That is ${planted}. The grove is exactly ${r} × ${c}.`,
              { cat: "one-row-only" });
          };
          const done = h("button", { class: "fk-btn good", type: "button", text: "The grove is full ✓" });
          done.addEventListener("click", check);
          R.hints = [`Each row has ${c} palms.`, `${r} rows of ${c}`, `Tap plots until ${r} × ${c} are planted.`];
          R.answer = total;
          R.submit = (v) => { planted = Math.max(0, Math.min(r * c, Number(v) || 0)); paint(); check(); };
          R.wrongValue = () => total - 1;
          R.solve = () => { planted = total; paint(); R.say(`${r} × ${c} = <b>${total}</b> palms.`, "hint"); };
          R.el.append(board, h("div", { class: "fk-btnrow" }, [done]));
          paint();
          R.say("Tap each plot to plant one palm. Fill whole rows.");
        },
      },
      {
        name: "Read the array",
        icon: "🔢",
        blurb: "A rectangle of dots: which multiplication is it?",
        rounds: 5,
        round(R) {
          const r = rint(2, 5), c = rint(3, 6);
          const art = svg(520, 190, `${r} rows of ${c} dots`);
          art.append(s("rect", { x: 0, y: 0, width: 520, height: 190, rx: 14, fill: "#fdf6e3" }));
          for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) {
            art.append(s("circle", { cx: 70 + j * (380 / c), cy: 45 + i * (110 / r), r: 10, fill: "#efeaff", stroke: "#6f5bf0", "stroke-width": 2 }));
          }
          LK.ui.choice(R, {
            prompt: "Which multiplication does this array show?",
            art: () => art,
            answer: `${r}×${c}`,
            options: shuffle([`${r}×${c}`, `${r}+${c}`, `${c}×${c}`, `${r}×${r}`]),
            cat: "added-not-multiplied",
            why: (v) => (v === `${r}+${c}` ? `That adds the row and column numbers. Each row has ${c}, and there are ${r} rows.`
              : `Look again: ${r} rows, ${c} in every row.`),
            hint: `Count the rows (${r}) and the dots in one row (${c}).`,
          });
        },
      },
      {
        name: "The fact",
        icon: "✖️",
        blurb: "No picture — just the rows and the answer.",
        rounds: 5,
        round(R) {
          const r = rint(3, 9), c = rint(3, 9);
          LK.ui.keypad(R, {
            prompt: `${r} rows of ${c} = ?`,
            sub: `${r} × ${c}`,
            answer: r * c,
            max: 2,
            cat: "rows-columns-mixed",
            why: (v) => (v === r + c ? `That is ${r} + ${c}. Multiplication counts ${r} groups of ${c}.`
              : v === c * c ? `You used ${c} twice. There are ${r} rows and ${c} in a row.`
              : "Try a fact you know: break one number into tens and ones."),
            hint: `${r} × ${c} = ${r} × ${Math.floor(c / 2)} + ${r} × ${c - Math.floor(c / 2)}`,
          });
        },
      },
    ],
    praise: ["A full rectangle.", "Rows × each row — that's multiplication.", "The grove is planted."],
    finale: "Every row planted. The farm in Al-Ahsa is yours. 🌴",
  });
})();

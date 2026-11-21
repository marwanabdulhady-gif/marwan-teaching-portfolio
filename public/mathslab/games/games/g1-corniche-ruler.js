/* Grade 1 · Corniche Ruler — measure length with equal centimetre units.
   Mechanic = the thinking: place one unit at zero, then count each equal space to the end. */
(function () {
  const { h, s, svg, rint, shuffle } = window.LK;

  function shell(length, label) {
    const g = svg(600, 150, label || `shell measures ${length} centimetres from zero`);
    g.append(s("rect", { x: 0, y: 0, width: 600, height: 150, rx: 16, fill: "#edf8fb" }));
    const start = 190, unit = Math.min(38, 350 / Math.max(length, 1)), end = start + length * unit;
    const width = end - start;
    g.append(s("path", { d: `M${start} 72 Q${start + width * .12} 30 ${start + width * .48} 40 Q${start + width * .82} 47 ${end} 70 Q${start + width * .82} 90 ${start + width * .48} 92 Q${start + width * .12} 91 ${start} 72Z`, fill: "#f1c37a", stroke: "#a96b3b", "stroke-width": 3 }));
    g.append(s("path", { d: `M${start + width * .2} 69 Q${start + width * .48} 45 ${start + width * .75} 69 M${start + width * .26} 79 Q${start + width * .49} 61 ${start + width * .68} 79`, fill: "none", stroke: "#d99b57", "stroke-width": 3, "stroke-linecap": "round" }));
    g.append(s("line", { x1: start, y1: 108, x2: start + length * unit, y2: 108, stroke: "#398e98", "stroke-width": 4 }));
    for (let i = 0; i <= length; i++) {
      const x = start + i * unit;
      g.append(s("line", { x1: x, y1: 95, x2: x, y2: 119, stroke: i === 0 ? "#d65d3a" : "#398e98", "stroke-width": i === 0 ? 4 : 2 }));
      g.append(s("text", { x, y: 139, "text-anchor": "middle", "font-size": 13, "font-weight": 700, fill: i === 0 ? "#bd4e32" : "#45636a", text: String(i) }));
    }
    g.append(s("text", { x: 190, y: 30, "font-size": 13, "font-weight": 800, fill: "#45636a", text: "START AT ZERO · 1 CM PER SPACE" }));
    return g;
  }

  function measureBoard(n, R) {
    const wrap = h("div", { class: "g1-measure-board" });
    wrap.append(shell(n, `shell with ${n} centimetre spaces on the ruler`));
    const row = h("div", { class: "g1-measure-units", role: "group", "aria-label": "Centimetre blocks" });
    const counter = h("div", { class: "fk-entry", text: "0" });
    const status = h("p", { class: "fk-frame-caption", text: `0 of ${n} cm blocks placed` });
    let placed = 0;
    const cells = [];
    const paint = () => {
      counter.textContent = String(placed);
      status.textContent = `${placed} of ${n} cm blocks placed`;
      cells.forEach((b, i) => {
        b.classList.toggle("placed", i < placed);
        b.setAttribute("aria-pressed", String(i < placed));
        b.textContent = i < placed ? "✓" : "1 cm";
      });
    };
    for (let i = 0; i < n; i++) {
      const b = h("button", { class: "fk-tile g1-unit", type: "button", text: "1 cm", "aria-label": `Place centimetre block ${i + 1}` });
      b.addEventListener("click", () => {
        if (R.done) return;
        if (i === placed) {
          placed++;
          paint();
          LK.speak(String(placed));
          if (placed === n) R.right();
        } else if (i < placed) {
          placed = i;
          paint();
          R.say("Good — you can move a block back and check the spaces again.", "hint");
        } else {
          R.wrong("Start at the red 0 line. Cover each equal space in order; do not skip a space.", { at: b, cat: "skipped-unit" });
        }
      });
      cells.push(b);
      row.append(b);
    }
    wrap.append(row, counter, status);
    R.hints = ["Put the first block at the red zero line.", "Use one block for every equal space.", `Count the spaces to the shell's end: ${n}.`];
    R.answer = n;
    R.submit = (v) => Number(v) === n ? R.right() : R.wrong("Start at zero, then count each centimetre space to the shell's end.", { cat: "skipped-unit" });
    R.wrongValue = () => Math.max(0, n - 1);
    R.solve = () => { placed = n; paint(); R.say(`The shell is <b>${n} centimetres</b> long: one equal space is one centimetre.`, "hint"); };
    paint();
    return wrap;
  }

  LK.start({
    id: "g1-corniche-ruler",
    title: "Corniche Ruler",
    emoji: "🐚",
    topic: "Measure length with centimetre units",
    grade: "Grade 1 · age 6–7",
    band: "k2",
    coach: "🐪",
    how: { steps: ["Line up the object with zero.", "Use equal centimetre spaces, with no gaps.", "Count the spaces to the end. Each space is one centimetre."] },
    world(el) {
      el.append(shell(6, "a shell beside a centimetre ruler on the Jeddah Corniche"));
      el.append(h("p", { class: "fk-frame-caption", text: "At the Jeddah Corniche, Noor and Ghubar are measuring shells for the beach garden." }));
    },
    learn: [
      { say: "Noor found a shell on the Jeddah Corniche. How long is it?", draw(el) { el.append(shell(5)); } },
      { say: "Put the shell at the red <b>0</b>. Count the equal spaces — 1, 2, 3, 4, 5. The shell is <b>5 centimetres</b> long.", draw(el) { el.append(shell(5)); } },
      {
        say: "Your turn: place centimetre blocks along this shell. Start at zero and cover each space.",
        wait: true,
        draw(el, L) {
          const board = h("div", { class: "g1-learn-measure" });
          board.append(shell(4));
          const taps = h("div", { class: "fk-tiles" });
          let n = 0;
          [1, 2, 3, 4].forEach((x) => {
            const b = h("button", { class: "fk-tile", type: "button", text: "1 cm" });
            b.addEventListener("click", () => { if (x === n + 1) { n = x; b.classList.add("on"); if (n === 4) L.ok("Four equal spaces — the shell is 4 cm long!"); } else L.say("Start at zero and place one block in each space.", "bad"); });
            taps.append(b);
          });
          board.append(taps);
          el.append(board);
        },
      },
      {
        say: "Ghubar started counting at the first line, not at zero. What should Ghubar count?",
        wait: true,
        draw(el, L) {
          el.append(shell(5));
          const wrap = h("div", { class: "fk-tiles" });
          [["The spaces between the marks, starting at 0.", true], ["The lines only.", false]].forEach(([text, ok]) => {
            const b = h("button", { class: "fk-tile", type: "button", text });
            b.addEventListener("click", () => ok ? L.ok("Right — each space is one centimetre. The first mark is zero.") : L.say("The marks show the ends of each space. Start at 0 and count spaces.", "bad"));
            wrap.append(b);
          });
          el.append(wrap);
        },
      },
    ],
    levels: [
      {
        name: "Lay the unit blocks", icon: "🧱", blurb: "Tap a centimetre block for each space along the shell.", rounds: 4,
        round(R) { const n = rint(3, 8); R.el.append(h("h2", { class: "fk-prompt", html: "Measure the shell. Put one block in each space, starting at zero." })); R.el.append(measureBoard(n, R)); },
      },
      {
        name: "Read the ruler", icon: "📏", blurb: "Read where the shell ends on the centimetre ruler.", rounds: 4,
        round(R) {
          const n = rint(3, 10), distractors = [...new Set([Math.max(1, n - 1), n + 1, Math.max(2, n - 2)])];
          const options = shuffle([n, ...shuffle(distractors).slice(0, 2)]);
          LK.ui.choice(R, {
            prompt: "How many centimetres long is this shell?", art: () => shell(n), answer: String(n),
            options: options.map((x) => String(x)), cat: "counted-marks",
            why: (v) => v < n ? `You stopped one space too early. Start at 0 and count each space to ${n}.` : `You counted past the shell. It ends at ${n} centimetres.`,
            hint: "Start at 0. Count the spaces, not the marks.",
          });
        },
      },
      {
        name: "Tell its length", icon: "🔢", blurb: "Use the measurement and the unit name together.", rounds: 4,
        round(R) {
          const n = rint(2, 10);
          LK.ui.keypad(R, {
            prompt: `A shell measures <b>${n} centimetres</b>. How many 1 cm spaces long is it?`,
            sub: "Type the number of centimetres.", answer: n, max: 2, cat: "unit-misread",
            why: (v) => `One centimetre is one equal space. ${n} centimetres means ${n} spaces.`,
            hint: "The number of centimetres is the number of equal spaces.",
          });
        },
      },
    ],
    praise: ["You measured carefully!", "One space, one centimetre!", "A shell-sized success!"],
    finale: "Zero to the shell's end — you can measure in centimetres! 🐚",
  });
})();

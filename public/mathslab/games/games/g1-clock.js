/* Grade 1 · Corniche Clock Tower — read time to the hour.
   Mechanic = the thinking: move the short hand to the hour; the long hand stays at 12. */
(function () {
  const { h, s, svg, rint, shuffle } = window.LK;

  function clock(hour, label) {
    const g = svg(300, 300, label || `clock showing ${hour} o'clock`);
    g.append(s("circle", { cx: 150, cy: 150, r: 132, fill: "#fff9e9", stroke: "#b47b3e", "stroke-width": 8 }));
    g.append(s("circle", { cx: 150, cy: 150, r: 116, fill: "#fff", stroke: "#ead9bd", "stroke-width": 2 }));
    for (let i = 1; i <= 12; i++) {
      const a = (i * 30 - 90) * Math.PI / 180;
      const x = 150 + Math.cos(a) * 89, y = 150 + Math.sin(a) * 89;
      g.append(s("text", { x, y: y + 7, "text-anchor": "middle", "font-size": 22, "font-weight": 800, fill: "#59452e", text: String(i) }));
      const tx = 150 + Math.cos(a) * 109, ty = 150 + Math.sin(a) * 109;
      g.append(s("line", { x1: tx - Math.cos(a) * 4, y1: ty - Math.sin(a) * 4, x2: tx + Math.cos(a) * 4, y2: ty + Math.sin(a) * 4, stroke: "#a67b4e", "stroke-width": 2 }));
    }
    g.append(
      s("line", { class: "g1-minute-hand", x1: 150, y1: 150, x2: 150, y2: 53, stroke: "#2a8b91", "stroke-width": 8, "stroke-linecap": "round" }),
      s("line", { class: "g1-hour-hand", x1: 150, y1: 150, x2: 150, y2: 91, stroke: "#d26542", "stroke-width": 13, "stroke-linecap": "round", transform: `rotate(${(hour % 12) * 30} 150 150)` }),
      s("circle", { cx: 150, cy: 150, r: 10, fill: "#60472e" }),
      s("text", { x: 150, y: 282, "text-anchor": "middle", "font-size": 15, "font-weight": 800, fill: "#64766c", text: "CORNICHE CLOCK" })
    );
    return g;
  }

  const clockHTML = (hour) => clock(hour).outerHTML;
  const hourChoices = (hour) => {
    const distractors = [...new Set([hour === 12 ? 11 : hour + 1, hour <= 2 ? hour + 3 : hour - 2, 12])].filter((n) => n !== hour);
    return shuffle([hour, ...shuffle(distractors).slice(0, 2)]);
  };

  LK.start({
    id: "g1-corniche-clock",
    title: "Corniche Clock Tower",
    emoji: "🕰️",
    topic: "Read time to the hour",
    grade: "Grade 1 · age 6–7",
    band: "k2",
    coach: "🐪",
    how: { steps: ["The short hand tells the hour.", "At o’clock, the long hand points to 12.", "Read the short hand: 4 and the long hand at 12 means 4 o’clock."] },
    world(el) {
      const g = clock(4, "clock tower at the Jeddah Corniche showing four o'clock");
      g.append(s("circle", { cx: 250, cy: 48, r: 17, fill: "#ffd66b", class: "fk-glow" }));
      el.append(g, h("p", { class: "fk-frame-caption", text: "A chime rings when the short hand reaches the next hour." }));
    },
    learn: [
      { say: "At the Jeddah Corniche, Noor hears the clock chime. Can you tell the hour?", draw(el) { el.append(clock(4)); } },
      { say: "The <b>long blue hand</b> points to 12. The <b>short orange hand</b> points to 4. It is <b>4 o'clock</b>.", draw(el) { el.append(clock(4)); } },
      {
        say: "Your turn: the long hand is at 12 and the short hand is at 8. What time is it?",
        wait: true,
        draw(el, L) {
          el.append(clock(8));
          const wrap = h("div", { class: "fk-tiles" });
          ["8 o'clock", "12 o'clock", "4 o'clock"].forEach((v) => {
            const b = h("button", { class: "fk-tile", type: "button", text: v });
            b.addEventListener("click", () => v === "8 o'clock" ? L.ok("Yes — the short hand points to 8, so it is 8 o’clock.") : L.say("The long hand points to 12. The short hand tells the hour.", "bad"));
            wrap.append(b);
          });
          el.append(wrap);
        },
      },
      {
        say: "Ghubar says: “The long hand is at 12, so it is 12 o'clock!” What should Ghubar read?",
        wait: true,
        draw(el, L) {
          el.append(clock(6));
          const wrap = h("div", { class: "fk-tiles" });
          [["The short orange hand — it points to 6.", true], ["The long blue hand — it points to 12.", false]].forEach(([text, ok]) => {
            const b = h("button", { class: "fk-tile", type: "button", text });
            b.addEventListener("click", () => ok ? L.ok("Exactly — the short hand names the hour. It is 6 o’clock.") : L.say("The long hand stays on 12 for an exact hour. Find the short hand.", "bad"));
            wrap.append(b);
          });
          el.append(wrap);
        },
      },
    ],
    levels: [
      {
        name: "Move the short hand", icon: "🟠", blurb: "Set the short hand. Keep the long hand on 12.", rounds: 4,
        round(R) {
          const hour = rint(1, 12), dial = clock(1), hand = dial.querySelector(".g1-hour-hand");
          LK.ui.sliders(R, {
            prompt: `Set the short hand to <b>${hour}</b>.`, sub: "The long hand stays at 12.", art: () => dial,
            controls: [{ label: "Short hand · hour", min: 1, max: 12, value: 1 }],
            test: (v) => Number(v[0]) === hour, answer: [hour], cat: "hour-hand-misread",
            why: (v) => `The short hand is at ${v[0]}. Move it to ${hour}; the long hand stays on 12.`,
            onInput: (v) => hand.setAttribute("transform", `rotate(${(Number(v[0]) % 12) * 30} 150 150)`),
          });
          R.hints = [`Find the short orange hand.`, `Move it to ${hour}.`, `Keep the long blue hand at 12.`];
        },
      },
      {
        name: "Read the picture", icon: "👀", blurb: "Match a clock face to the chime.", rounds: 4,
        round(R) {
          const hour = rint(1, 12), opts = hourChoices(hour);
          LK.ui.choice(R, {
            prompt: "Which clock shows the chime time?", sub: "The long hand is at 12.", art: () => clock(hour),
            answer: String(hour), options: opts.map((n) => ({ key: String(n), html: `<div class="g1-clock-option">${clockHTML(n)}<b>${n} o'clock</b></div>` })),
            cat: "minute-hand-read-as-hour",
            why: (v) => v === "12" && hour !== 12 ? "12 is where the long hand points. Read the short orange hand for the hour." : `The short hand points to ${hour}, so it is ${hour} o’clock.`,
            hint: "Look for the short orange hand, not the long blue hand.",
          });
        },
      },
      {
        name: "Tell the time", icon: "🔔", blurb: "Read the hour from the short hand.", rounds: 4,
        round(R) {
          const hour = rint(1, 12);
          LK.ui.keypad(R, {
            prompt: `The short hand points to <b>${hour}</b>. The long hand is at 12. What time is it?`,
            sub: "Type the hour.", answer: hour, max: 2, cat: "hour-hand-misread",
            why: (v) => v === 12 && hour !== 12 ? "12 is the minute hand's place. The short hand tells the hour." : `Read the short hand: ${hour} o’clock.`,
            hint: "At o’clock, the long hand points to 12. Read the short hand.",
          });
        },
      },
    ],
    praise: ["You heard the hour!", "Right on time!", "Great clock reading!"],
    finale: "Every chime tells you the hour — well done, Clock Keeper! 🔔",
  });
})();

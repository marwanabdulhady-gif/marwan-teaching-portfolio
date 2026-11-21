/* Kindergarten · Date Basket — counting objects to 10 (one-to-one counting).
   Mechanic = the thinking: every tap moves ONE date, and the count is said out loud. */
(function () {
  const { h, s, svg, rint, pick, shuffle } = window.LK;

  const date = (x, y, r) => s("ellipse", { cx: x, cy: y, rx: r, ry: r * 1.3, fill: "#8a4b1f", stroke: "#5f3113", "stroke-width": 1.2 });
  const plate = (n, w, hgt) => {
    const g = svg(w, hgt, `${n} dates on a plate`);
    g.append(s("ellipse", { cx: w / 2, cy: hgt / 2 + 8, rx: w * 0.34, ry: hgt * 0.3, fill: "#f4efe6", stroke: "#ded3c2", "stroke-width": 2 }));
    for (let i = 0; i < n; i++) {
      const a = (i / Math.max(n, 1)) * Math.PI * 2;
      const ring = Math.floor(i / 9);
      const rad = n <= 9 ? Math.min(w, hgt) * 0.2 : Math.min(w, hgt) * (0.12 + ring * 0.1);
      g.append(date(w / 2 + Math.cos(a) * rad, hgt / 2 + 8 + Math.sin(a) * rad * 0.62, n > 16 ? 5 : 7));
    }
    return g;
  };

  LK.start({
    id: "k-date-basket",
    title: "Date Basket",
    emoji: "🧺",
    topic: "Counting objects to 10",
    grade: "Kindergarten · age 5–6",
    band: "k2",
    coach: "🐪",
    how: {
      steps: [
        "Count the dates on the plate — touch each one as you say a number.",
        "Tap <b>Add a date</b> until the basket holds exactly as many as the plate.",
        "The last number you say is <b>how many</b>. Then the camel eats.",
      ],
    },
    world(el) {
      const g = svg(640, 200, "a camel waiting by a basket of dates at sunset");
      g.append(s("rect", { x: 0, y: 0, width: 640, height: 200, fill: "#fdf0d8" }));
      g.append(s("circle", { cx: 520, cy: 56, r: 30, fill: "#ffcf6b" }));
      g.append(s("path", { d: "M0 150 Q160 120 320 152 T640 146 L640 200 L0 200 Z", fill: "#f2d9ab" }));
      g.append(s("path", { d: "M0 168 Q200 150 400 170 T640 164 L640 200 L0 200 Z", fill: "#e8c894" }));
      /* the camel */
      const camel = s("g", { class: "fk-bob" });
      camel.append(
        s("ellipse", { cx: 210, cy: 128, rx: 54, ry: 26, fill: "#c98b45" }),
        s("path", { d: "M232 112 q10 -34 34 -40 q10 -2 12 8 q-20 6 -26 34 Z", fill: "#c98b45" }),
        s("circle", { cx: 274, cy: 72, r: 13, fill: "#d79a52" }),
        s("circle", { cx: 279, cy: 70, r: 2.4, fill: "#3a2410" }),
        s("rect", { x: 176, y: 148, width: 7, height: 30, rx: 3, fill: "#b0783a" }),
        s("rect", { x: 206, y: 150, width: 7, height: 28, rx: 3, fill: "#b0783a" }),
        s("rect", { x: 236, y: 148, width: 7, height: 30, rx: 3, fill: "#b0783a" }),
        s("path", { d: "M164 122 q-10 8 -6 18", stroke: "#b0783a", "stroke-width": 5, fill: "none" })
      );
      g.append(camel);
      /* the basket */
      g.append(s("path", { d: "M420 150 l64 0 l-8 42 l-48 0 Z", fill: "#a9743c", stroke: "#7c4f22", "stroke-width": 2 }));
      g.append(s("path", { d: "M420 150 q32 -18 64 0", stroke: "#7c4f22", "stroke-width": 3, fill: "none" }));
      [456, 474].forEach((x) => g.append(s("rect", { x, y: 150, width: 3, height: 42, fill: "#8a5f2e" })));
      for (let i = 0; i < 3; i++) g.append(date(440 + i * 14, 146 - (i % 2) * 5, 6));
      /* stars */
      for (let i = 0; i < 9; i++) g.append(s("circle", { cx: 40 + i * 70, cy: 30 + (i % 3) * 16, r: 2.2, fill: "#e7b45a", class: "fk-glow" }));
      el.append(g);
    },
    learn: [
      {
        say: "The camel at Al-Ula is hungry. One date, one count: <b>1, 2, 3…</b>",
        draw(el) {
          el.append(plate(6, 420, 130));
          el.append(h("p", { class: "fk-tip", text: "Touch each date as you say a number. Count every date once." }));
        },
      },
      {
        say: "The <b>last number you say</b> tells you how many there are. Six dates — the last number was six.",
        draw(el) { el.append(plate(6, 420, 130)); },
      },
      {
        say: "Your turn: how many dates are on this plate? Tap the number.",
        wait: true,
        draw(el, L) {
          el.append(plate(7, 360, 120));
          const wrap = h("div", { class: "fk-tiles" });
          [5, 7, 9].forEach((n) => {
            const b = h("button", { class: "fk-tile", type: "button", text: String(n) });
            b.addEventListener("click", () => (n === 7 ? L.ok("Seven — you counted each date once!") : L.say("Count again, touching each date. " + n + " is not the last number.", "bad")));
            wrap.append(b);
          });
          el.append(wrap);
        },
      },
      {
        say: "Ghubar says: “1, 2, 5 — done, there are 5!” What went wrong?",
        wait: true,
        draw(el, L) {
          const wrap = h("div", { class: "fk-tiles" });
          [["He skipped numbers — you must say every number in order.", true], ["Nothing, 5 is right.", false]].forEach(([t, ok]) => {
            const b = h("button", { class: "fk-tile", type: "button", html: t });
            b.addEventListener("click", () => (ok ? L.ok("Yes — count every object, saying every number.") : L.say("Count the plate again and listen to the numbers.", "bad")));
            wrap.append(b);
          });
          el.append(plate(4 * 1 + 1, 300, 110), wrap);
        },
      },
    ],
    levels: [
      {
        name: "Count them in",
        icon: "🧺",
        blurb: "Tap a date for every date on the plate.",
        rounds: 4,
        round(R) {
          const n = rint(3, 9);
          let inBasket = 0;
          R.el.append(h("h2", { class: "fk-prompt", html: `Put exactly <b>${n}</b> dates in the basket.` }));
          const board = svg(520, 170, "plate of dates and the basket");
          const counter = h("div", { class: "fk-entry", text: "0" });
          const paint = () => {
            board.innerHTML = "";
            board.append(s("rect", { x: 0, y: 0, width: 520, height: 170, rx: 16, fill: "#fdf7ec" }));
            /* the plate, with a date removed for each one already in the basket */
            board.append(s("ellipse", { cx: 140, cy: 92, rx: 108, ry: 62, fill: "#fff", stroke: "#e7dbc7", "stroke-width": 2 }));
            for (let i = 0; i < n; i++) {
              if (i < inBasket) continue;
              const a = (i / n) * Math.PI * 2;
              board.append(date(140 + Math.cos(a) * 60, 92 + Math.sin(a) * 34, 9));
            }
            board.append(s("path", { d: "M330 70 l150 0 l-18 84 l-114 0 Z", fill: "#a9743c", stroke: "#7c4f22", "stroke-width": 2 }));
            for (let i = 0; i < inBasket; i++) board.append(date(348 + (i % 6) * 24, 96 + Math.floor(i / 6) * 22, 8));
            counter.textContent = String(inBasket);
            counter.classList.toggle("filled", inBasket > 0);
          };
          const check = () => {
            if (inBasket === n) R.right();
            else R.wrong(inBasket < n ? `That is ${inBasket} — the plate still has dates left. Count them.` : `That is ${inBasket} — one too many. The plate had ${n}.`,
              { cat: inBasket < n ? "count-short" : "count-over" });
          };
          const add = h("button", { class: "fk-btn", type: "button", text: "🧺 Add a date" });
          add.addEventListener("click", () => {
            if (R.done) return;
            inBasket += 1;
            paint();
            LK.speak(String(inBasket));
            if (inBasket > n + 3) inBasket = 0, paint();       /* no dead end for small hands */
          });
          const take = h("button", { class: "fk-btn ghost", type: "button", text: "Take one out" });
          take.addEventListener("click", () => { if (!R.done && inBasket > 0) { inBasket -= 1; paint(); } });
          const done = h("button", { class: "fk-btn good", type: "button", text: "Done ✓" });
          done.addEventListener("click", check);
          R.hints = ["Touch each date on the plate and say a number.", `The plate holds ${n} dates.`, `Add until the counter says ${n}.`];
          R.answer = n;
          R.submit = (v) => { inBasket = Math.max(0, Math.min(20, Number(v) || 0)); paint(); check(); };
          R.wrongValue = () => n + 1;
          R.solve = () => { inBasket = n; paint(); R.say(`The plate had <b>${n}</b> dates, so the basket needs ${n}.`, "hint"); };
          R.el.append(board, h("div", { class: "fk-btnrow", style: "align-items:center" }, [counter, add, take, done]));
          paint();
          R.say(`Count the dates on the plate, then tap a date into the basket for each one.`);
        },
      },
      {
        name: "Ten-frame dots",
        icon: "🔟",
        blurb: "Dots in a ten-frame — say how many without counting one by one.",
        rounds: 4,
        round(R) {
          const n = rint(4, 10);
          const art = svg(420, 130, `ten-frame with ${n} dots`);
          art.append(s("rect", { x: 30, y: 16, width: 360, height: 96, rx: 10, fill: "#fff", stroke: "#d9d2ff", "stroke-width": 2 }));
          for (let i = 0; i < 10; i++) {
            const cx = 30 + (i % 5) * 72 + 36, cy = 16 + Math.floor(i / 5) * 48 + 24;
            art.append(s("circle", { cx, cy, r: 15, fill: i < n ? "#efeaff" : "#f7f8fc", stroke: i < n ? "#6f5bf0" : "#e4e8f0", "stroke-width": i < n ? 2 : 1 }));
          }
          LK.ui.choice(R, {
            prompt: "How many dots?",
            art: () => art,
            answer: String(n),
            options: shuffle([String(n), String(n === 1 ? 2 : n - 1), String(Math.min(10, n + 2))]),
            cat: n > 5 ? "numeral-mismatch" : "count-short",
            why: (v) => `You said ${v}. Top row is 5 — count on from there.`,
            hint: "Five in the top row, then count on: 6, 7, 8…",
          });
        },
      },
      {
        name: "Find the plate",
        icon: "🍽️",
        blurb: "A number, and three plates. Pick the plate that matches.",
        rounds: 4,
        round(R) {
          const n = rint(4, 9);
          const opts = shuffle([n, Math.max(2, n - 2), Math.min(10, n + 2)]);
          LK.ui.choice(R, {
            prompt: `Which plate has <b>${n}</b> dates?`,
            answer: String(n),
            options: opts.map((v) => ({ key: String(v), html: plateHTML(v) })),
            cat: "numeral-mismatch",
            why: (v) => `That plate has ${v}. Count the dates one by one to find ${n}.`,
            hint: "Count each plate, touching every date once.",
          });
        },
      },
    ],
    praise: ["Yes! The camel is happy.", "Counted perfectly.", "Exactly right."],
    finale: "Every date counted — the camel is full! 🐪",
  });

  /* a plate drawn as markup, so it can sit inside a button */
  function plateHTML(n) {
    let dots = "";
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      dots += `<ellipse cx="${60 + Math.cos(a) * 38}" cy="${52 + Math.sin(a) * 24}" rx="7" ry="9" fill="#8a4b1f"/>`;
    }
    return `<svg viewBox="0 0 120 104" width="100%" height="86" aria-label="${n} dates"><ellipse cx="60" cy="52" rx="54" ry="40" fill="#fff" stroke="#e7dbc7" stroke-width="2"/>${dots}</svg>`;
  }
})();

/* Grade 10 · Angle of Approach — supplemental standalone prototype.
   Based on the local Grade 10 brief, not on a reviewed Mowazi lesson (Mowazi's reviewed scope is K–9).
   All survey values are fictional practice data; they do not describe Jeddah Tower or another real structure. */
(function () {
  const { h, s, svg, shuffle, pick, rint } = window.LK;
  let round = 0;
  function triangle(label, theta = 45, adjacent = 4, opposite = 3, unknown = false) {
    const g = svg(460, 220, label);
    g.append(s("rect", { x: 0, y: 0, width: 460, height: 220, rx: 16, fill: "#f2f8ff" }));
    const ox = 76, oy = 175, ax = 300, ay = 175, tx = 300, ty = 50;
    g.append(
      s("path", { d: `M${ox} ${oy} L${ax} ${ay} L${tx} ${ty} Z`, fill: "#e1efff", stroke: "#396b9a", "stroke-width": 4, "stroke-linejoin": "round" }),
      s("path", { d: `M${ax-18} ${ay} L${ax-18} ${ay-18} L${ax} ${ay-18}`, fill: "none", stroke: "#667085", "stroke-width": 2 }),
      s("path", { d: `M${ox+40} ${oy} A40 40 0 0 0 ${ox+28} ${oy-28}`, fill: "none", stroke: "#e8794a", "stroke-width": 3 }),
      s("text", { x: ox+44, y: oy-12, text: `${theta}°`, fill: "#a7462c", "font-size": 16, "font-weight": 800 }),
      s("text", { x: 180, y: 202, "text-anchor": "middle", text: unknown ? `${adjacent} m` : "adjacent", fill: "#315d85", "font-size": 15, "font-weight": 800 }),
      s("text", { x: 310, y: 115, text: unknown ? "? m" : "opposite", fill: "#315d85", "font-size": 15, "font-weight": 800 }),
      s("text", { x: 170, y: 98, text: "hypotenuse", fill: "#315d85", "font-size": 14, "font-weight": 800 })
    );
    if (!unknown) {
      g.append(s("text", { x: 22, y: 30, text: "Opposite · Adjacent · Hypotenuse", fill: "#344054", "font-size": 14, "font-weight": 700 }));
    } else {
      g.append(s("text", { x: 22, y: 30, text: "Fictional field survey · practice values", fill: "#667085", "font-size": 13, "font-weight": 700 }));
    }
    return g;
  }
  function task(level, i) {
    const angles = [30, 45, 60];
    const theta = angles[(i + level) % angles.length];
    const d = [20, 30, 40, 50][(i * 3 + level) % 4];
    if (level === 0) {
      const target = ["opposite", "adjacent", "hypotenuse"][i % 3];
      return { prompt: `From the ${theta}° angle, which side is the ${target}?`, answer: target,
        opts: shuffle(["opposite", "adjacent", "hypotenuse"]), art: triangle("label the sides", theta) };
    }
    if (level === 1) {
      return { prompt: `You know the ${d} m ground distance (adjacent) and need the vertical height (opposite). Which ratio uses these sides?`,
        answer: "tan", opts: shuffle(["tan", "sin", "cos"]), art: triangle("choose the ratio", theta, d, 3, true) };
    }
    const height = Math.round(d * Math.tan(theta * Math.PI / 180));
    const distractors = [...new Set([height + 2, Math.max(1, height - 2), Math.round(d / Math.tan(theta * Math.PI / 180))])].filter(x => x !== height).slice(0, 2);
    while (distractors.length < 2) distractors.push(height + distractors.length + 3);
    return { prompt: `A fictional survey mast is ${d} m from the observer. The angle of elevation is ${theta}°. Estimate its height to the nearest metre.`,
      answer: String(height), opts: shuffle([String(height), ...distractors.map(String)]), art: triangle("estimate the height", theta, d, height, true),
      why: `tan(${theta}°) = opposite ÷ ${d}; so opposite = ${d} × tan(${theta}°) ≈ ${height} m.` };
  }
  function teach(el, L, prompt, good, distractor, why) {
    el.append(h("p", { class: "fk-sub", text: prompt }));
    const wrap = h("div", { class: "fk-tiles" });
    [good, distractor].forEach((label, i) => {
      const b = h("button", { class: "fk-tile", type: "button", text: label });
      b.onclick = () => i === 0 ? L.ok(why) : L.say("Not quite — start from the marked angle, then identify the sides.", "bad");
      wrap.append(b);
    });
    el.append(wrap);
  }
  LK.start({
    id: "g10-angle-of-approach", title: "Angle of Approach", emoji: "📐", topic: "Right-triangle trigonometry",
    grade: "Grade 10 · independent supplemental prototype (not Mowazi-mapped)", band: "g912", coach: "🧭",
    how: { steps: ["Start from the marked angle.", "Label opposite, adjacent and hypotenuse.", "Choose sin, cos or tan, then rearrange to find the unknown."] },
    world(el) {
      el.append(triangle("right triangle field survey", 45, 30, 30, true), h("p", { class: "fk-frame-caption", text: "Use a fictional practice survey to connect a measured angle and distance to a right-triangle ratio. No real landmark measurements are used." }));
    },
    learn: [
      { say: "A surveyor can estimate a height without climbing it. Begin with a right triangle and a measured angle.", draw(el) { el.append(triangle("survey model", 45, 30, 30, true)); } },
      { say: "From the marked angle, the vertical side is opposite, the ground distance is adjacent, and the longest side is the hypotenuse.", draw(el) { el.append(triangle("label the triangle", 45, 30, 30, true)); } },
      { say: "Your turn: the angle is 45°. Which side is the vertical height?", wait: true, draw(el, L) { el.append(triangle("your turn", 45, 30, 30, true)); teach(el, L, "Choose the side relative to the marked angle.", "Opposite", "Hypotenuse", "Correct — the vertical height lies across from the marked angle."); } },
      { say: "Ghubar uses cosine for a known ground distance and unknown height. What should he check?", wait: true, draw(el, L) { el.append(triangle("spot the misconception", 45, 30, 30, true)); teach(el, L, "Which ratio relates opposite and adjacent?", "Tangent: opposite ÷ adjacent", "Cosine: adjacent ÷ hypotenuse", "Yes — TOA uses opposite and adjacent."); } }
    ],
    levels: [
      { name: "Label the triangle", icon: "🏷️", blurb: "Identify sides from the marked angle.", rounds: 4, round(R) {
        const q = task(0, round++);
        LK.ui.choice(R, { prompt: q.prompt, art: () => q.art, answer: q.answer, options: q.opts, cat: "hypotenuse-misread", why: () => "Side names depend on the marked angle: across is opposite; longest is hypotenuse.", hint: "Find the longest side first: it is opposite the right angle." });
      } },
      { name: "Choose the ratio", icon: "🧭", blurb: "Match the known and unknown sides.", rounds: 4, round(R) {
        const q = task(1, round++);
        LK.ui.choice(R, { prompt: q.prompt, art: () => q.art, answer: q.answer, options: q.opts, cat: "wrong-ratio", why: v => v === "sin" ? "Sine uses opposite and hypotenuse." : "Cosine uses adjacent and hypotenuse. You have opposite and adjacent.", hint: "SOH · CAH · TOA: which pair do you have?" });
      } },
      { name: "Survey the mast", icon: "📏", blurb: "Use tangent and estimate a height.", rounds: 4, round(R) {
        const q = task(2, round++);
        LK.ui.choice(R, { prompt: q.prompt, sub: "All values describe a fictional practice scenario.", art: () => q.art, answer: q.answer, options: q.opts, cat: "radian-mode", why: () => q.why, hint: "Use degrees: tan(angle) = height ÷ ground distance." });
      } }
    ],
    praise: ["Good survey reasoning!", "You found the right ratio!", "Careful angle work!"],
    finale: "You can label a right triangle and use trigonometric ratios — excellent surveying! 📐"
  });
})();

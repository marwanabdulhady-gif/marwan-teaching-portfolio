/* ===========================================================
   MathsLab — arcade effects.
   The originals hid their feedback inside the game: a bubble
   burst when you pop it, a planet dropping onto its match, a
   frame that shakes when you miss, confetti at the end. This is
   that layer, shared by every mode.

     ML.fx.burst(node)         particles out of an element
     ML.fx.float(node, "+80")  a score that rises and fades
     ML.fx.shake(node)         the miss wobble
     ML.fx.ring(node)          an expanding ring (a "got it")
     ML.fx.flash(host)         a full-board flash
   All of it is DOM + CSS keyframes, no canvas, nothing to load.
   =========================================================== */
(function () {
  "use strict";
  const ML = (window.ML = window.ML || {});

  const reduced = () => {
    try { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
    catch (e) { return false; }
  };

  /* Where an effect should live.
     Modes rebuild `#arStage` for every new question, so an effect parented to
     the stage is deleted in the same tick it was created — that is why a
     correct tap looked dead in Race, Tiles, Maze, Rocket, Zoom and the Deck.
     The stage's container survives the re-render and is not clipped, so the
     particles can also fly past the stage edge instead of being cut off. */
  function root(node) {
    const stage = node.closest ? node.closest(".ar-stage") : null;
    const shell = stage && stage.closest(".ar-game");
    if (shell) return shell;
    return (stage && stage.parentNode) || node.parentNode;
  }

  function layer(host) {
    if (!host) return null;
    let box = host.querySelector(":scope > .ar-fx");
    if (!box) {
      box = document.createElement("div");
      box.className = "ar-fx";
      box.setAttribute("aria-hidden", "true");
      host.appendChild(box);
    }
    return box;
  }

  function centre(node) {
    const r = node.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  }

  /** place an absolutely positioned effect over the host, at the node's centre */
  function place(box, node, host) {
    const c = centre(node);
    const h = host.getBoundingClientRect();
    return { x: c.x - h.left, y: c.y - h.top, w: c.w, h: c.h };
  }

  const FX = {
    burst(node, opts) {
      opts = opts || {};
      if (!node || !node.parentNode || reduced()) return;
      const host = root(node);
      const box = layer(host);
      if (!box) return;
      const pos = place(box, node, host);
      const n = opts.count || 14;
      const colours = opts.colors || ["#6d5efc", "#0f9d94", "#e8a008", "#1fa45b", "#e5484d", "#2f7cf6"];
      for (let i = 0; i < n; i++) {
        const p = document.createElement("i");
        p.className = "ar-fx-p";
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.5;
        const d = (opts.spread || 42) + Math.random() * (opts.spread || 42);
        p.style.left = pos.x + "px";
        p.style.top = pos.y + "px";
        p.style.background = colours[i % colours.length];
        p.style.setProperty("--dx", Math.cos(a) * d + "px");
        p.style.setProperty("--dy", Math.sin(a) * d + "px");
        p.style.setProperty("--sz", 5 + Math.random() * 5 + "px");
        box.appendChild(p);
      }
      setTimeout(() => {
        [...box.querySelectorAll(".ar-fx-p")].slice(0, n).forEach((p) => p.remove());
      }, 700);
    },

    float(node, text, tone) {
      if (!node || !node.parentNode || reduced()) return;
      const host = root(node);
      const box = layer(host);
      if (!box) return;
      const pos = place(box, node, host);
      const t = document.createElement("span");
      t.className = "ar-fx-float" + (tone === "bad" ? " is-bad" : "");
      t.textContent = text;
      t.style.left = pos.x + "px";
      t.style.top = pos.y + "px";
      box.appendChild(t);
      setTimeout(() => t.remove(), 1100);
    },

    ring(node) {
      if (!node || !node.parentNode || reduced()) return;
      const host = root(node);
      const box = layer(host);
      if (!box) return;
      const pos = place(box, node, host);
      const r = document.createElement("i");
      r.className = "ar-fx-ring";
      r.style.left = pos.x + "px";
      r.style.top = pos.y + "px";
      r.style.width = Math.max(pos.w, 40) + "px";
      box.appendChild(r);
      setTimeout(() => r.remove(), 700);
    },

    shake(node) {
      if (!node || !node.classList || reduced()) return;
      node.classList.remove("ar-fx-shake");
      void node.offsetWidth;
      node.classList.add("ar-fx-shake");
      setTimeout(() => node.classList.remove("ar-fx-shake"), 460);
    },

    flash(host, kind) {
      if (!host || reduced()) return;
      const f = document.createElement("div");
      f.className = "ar-fx-flash" + (kind === "bad" ? " is-bad" : "");
      host.appendChild(f);
      setTimeout(() => f.remove(), 520);
    },

    /** the end-of-game confetti, reused by every mode */
    confetti(host) {
      if (!host || reduced()) return;
      const box = document.createElement("div");
      box.className = "ar-confetti";
      box.setAttribute("aria-hidden", "true");
      const cols = ["#6d5efc", "#0f9d94", "#e8a008", "#1fa45b", "#e5484d", "#2f7cf6"];
      for (let i = 0; i < 30; i++) {
        const b = document.createElement("i");
        b.style.left = Math.random() * 100 + "%";
        b.style.animationDelay = (Math.random() * 0.7).toFixed(2) + "s";
        b.style.background = cols[i % cols.length];
        b.style.transform = "rotate(" + (Math.random() * 90 | 0) + "deg)";
        box.appendChild(b);
      }
      host.appendChild(box);
      setTimeout(() => box.remove(), 3200);
    },
  };

  ML.fx = FX;
})();

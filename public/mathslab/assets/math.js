/* ===========================================================
   MathsLab — math typesetting (KaTeX)
   Converts the plain-text maths the apps produce ("x^2",
   "3/4", "2 1/2", "√49", "6 × 7") into properly typeset maths.
   Falls back to the original text if KaTeX is unavailable.
   =========================================================== */
(function () {
  "use strict";
  const ML = (window.ML = window.ML || {});

  const has = () => typeof window.katex !== "undefined" && window.katex && window.katex.renderToString;

  /* ---------------------------------------------------------------
     Turn one token of plain maths into LaTeX.
     Handles, in order: mixed numbers, fractions, powers, roots,
     times/divide signs, and bare exponents after a closing bracket.
     --------------------------------------------------------------- */
  function texify(src) {
    let s = String(src);

    // unicode that KaTeX understands directly
    s = s.replace(/×/g, "\\times ")
         .replace(/÷/g, "\\div ")
         .replace(/−/g, "-")
         .replace(/·/g, "\\cdot ")
         .replace(/≤/g, "\\le ")
         .replace(/≥/g, "\\ge ")
         .replace(/≠/g, "\\ne ")
         .replace(/π/g, "\\pi ")
         .replace(/∞/g, "\\infty ")
         .replace(/√\(([^()]*)\)/g, "\\sqrt{$1}")
         .replace(/√(\d+)/g, "\\sqrt{$1}");

    // mixed numbers: 2 1/2  ->  2\frac{1}{2}
    s = s.replace(/(^|[\s(=])(-?\d+)\s+(\d+)\/(\d+)(?![\d/])/g,
      (m, pre, w, n, d) => `${pre}${w}\\frac{${n}}{${d}}`);

    // simple fractions: 3/4, -3/4, 12/5
    s = s.replace(/(^|[^\d\w])(-?\d+)\/(\d+)(?![\d/])/g,
      (m, pre, n, d) => `${pre}\\frac{${n}}{${d}}`);

    // powers: x^2, x^(2), x^{-3}, x^12, x^{n+1}
    s = s.replace(/\^\(([^()]*)\)/g, "^{$1}");
    s = s.replace(/\^(-?\d+)/g, "^{$1}");
    s = s.replace(/\^([a-zA-Z])(?![a-zA-Z{])/g, "^{$1}");

    // a bare 2 after a closing bracket or digit is almost always a square
    s = s.replace(/\)²/g, ")^{2}").replace(/\)2\b/g, ")^{2}");
    s = s.replace(/²/g, "^{2}").replace(/³/g, "^{3}");

    return s;
  }

  /* Does this string contain anything worth typesetting? */
  function isMathy(s) {
    return /[\^√×÷²³]|\d\s*\/\s*\d|\d\s+\d+\/\d+|\\frac/.test(s);
  }

  /* Render a sentence so maths is typeset inline with the words.
     The whole line goes through KaTeX with \text{} for the words, which keeps
     the spacing and punctuation consistent instead of gluing separate runs. */
  function render(text, display) {
    if (!has()) return escapeHtml(text);
    const str = String(text == null ? "" : text);
    if (!isMathy(str)) return escapeHtml(str);

    const parts = str.split(/(\s+)/).filter((x) => x !== "");
    const words = [];
    for (const p of parts) {
      if (/^\s+$/.test(p)) { words.push({ space: true }); continue; }
      if (isMathy(p) || /^[\d+\-−=()^/\\{}.,xXn]+$/.test(p)) words.push({ math: p });
      else words.push({ text: p });
    }

    // Build one LaTeX string. Real spaces do nothing in math mode, so every
    // gap becomes an explicit control space (\\ ) to keep the sentence readable.
    const pieces = [];
    for (const w of words) {
      if (w.space) continue;                       // gaps handled between tokens
      if (w.text) pieces.push("\\text{" + w.text.replace(/([{}\\])/g, "\\$1") + "}");
      else pieces.push(texify(w.math));
    }
    let latex = pieces.join("\\ ");
    latex = latex.trim();
    try {
      return window.katex.renderToString(latex, {
        throwOnError: false, displayMode: !!display, output: "html",
      });
    } catch (e) {
      return escapeHtml(str);
    }
  }

  function katexChunk(src, display) {
    try {
      return window.katex.renderToString(texify(src), {
        throwOnError: false, displayMode: !!display, output: "html",
      });
    } catch (e) {
      return escapeHtml(src);
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  /* Render a whole element's text content as typeset maths. */
  function typeset(el) {
    if (!el || !has()) return;
    const txt = el.textContent;
    if (!isMathy(txt)) return;
    el.innerHTML = render(txt);
  }

  /* Called after a view re-renders, to typeset anything marked data-math. */
  function scan(root) {
    if (!has()) return;
    (root || document).querySelectorAll("[data-math]").forEach(typeset);
  }

  /* ---------------------------------------------------------------
     Cleanup for the recovered .bnk text: strip the choice markers and
     odd binary remnants, sentence-case the shouty capitals, and mark
     each generated-number gap with \u0000 so callers can draw it.
     --------------------------------------------------------------- */
  function cleanBank(text) {
    let s = String(text == null ? "" : text);
    s = s.replace(/\b[01]{0,3}[A-D]1\b/g, " ").replace(/\b[01]{2,3}\b/g, " ");
    s = s.replace(/[#|]+/g, " ").replace(/!+/g, " ");
    s = s.replace(/\s*\/+\s*/g, "\u0000");
    // a word glued to the next ("lettersWrote") is a number slot with no space:
    // split lower->Upper transitions and put a gap between them
    s = s.replace(/([a-z])([A-Z])/g, "$1\u0000$2");
    s = s.replace(/[\u0001-\u0008\u000b\u000c\u000e-\u001f]/g, " ");
    s = s.replace(/\s+/g, " ").trim();
    // the banks mix ALL CAPS with stray lower-case fragments ("write AN EXPRESSION"):
    // normalise to sentence case so a stem reads as one voice
    if (s) {
      const upperRatio = (s.match(/[A-Z]/g) || []).length /
                         Math.max(1, (s.match(/[A-Za-z]/g) || []).length);
      if (upperRatio > 0.55) {
        s = s.toLowerCase();
        s = s.replace(/(^|[.!?]\s+|\u0000\s*)([a-z])/g, (m, pre, ch) => pre + ch.toUpperCase());
        s = s.replace(/\b(i)\b/g, "I");
      }
    }
    return s;
  }

  ML.tex = { render, texify, typeset, scan, isMathy, has, cleanBank };

  /* Re-typeset question and answer text whenever the quiz re-renders. */
  document.addEventListener("DOMContentLoaded", () => {
    const tryTypeset = () => {
      if (!has()) return false;
      document.querySelectorAll("[data-math]").forEach(typeset);
      return true;
    };
    if (!tryTypeset()) {
      let n = 0;
      const t = setInterval(() => { if (tryTypeset() || ++n > 40) clearInterval(t); }, 100);
    }
  });
})();

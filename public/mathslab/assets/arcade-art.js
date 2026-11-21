/* ===========================================================
   MathsLab — arcade art.
   The EduMagnet games shipped sprite art (their pair-matching
   boards loaded per-cell SVGs from /assets/img/cell/). Emoji were
   standing in for it here, which is why the games looked empty
   and why half the icons came out as empty boxes on machines
   without an emoji font.

   This module is that art, drawn inline in the site's own palette:
   every glyph is a 24×24 SVG built from currentColor plus one
   accent fill, so it inherits the chip/tile colour it sits in and
   needs no network, no font and no sprite sheet.

     ML.art("rocket")                 → <svg class="ar-art" …>
     ML.art("shield", 14)             → a small one for a HUD chip
     ML.art.tokens("shield", 3)       → three of them, side by side
     ML.art.spin("wheel", ...)        → the same, with the wheel's animation
   =========================================================== */
(function () {
  "use strict";
  const ML = (window.ML = window.ML || {});

  const A = '#6d5efc';      /* accent — matches --brand */
  const A2 = '#0f9d94';

  /* every glyph: inner markup of a 24×24 viewBox */
  const P = {
    /* ---- game glyphs ---- */
    bingo: `<rect x="3.2" y="3.2" width="17.6" height="17.6" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"/>
      <path d="M9 3.2v17.6M15 3.2v17.6M3.2 9h17.6M3.2 15h17.6" stroke="currentColor" stroke-width="1" opacity=".55"/>
      <circle cx="12" cy="12" r="2.6" fill="${A}"/>`,

    race: `<path d="M6 21V3.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M6 4.6h11l-2.4 3.4L17 11.4H6z" fill="${A}"/>
      <path d="M3 21h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,

    comets: `<circle cx="15.4" cy="8.6" r="3.6" fill="${A}"/>
      <path d="M12.6 11.4 3.4 20.6M14.8 13.6 6 21M10.4 9.2 3 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".85"/>`,

    memory: `<rect x="3" y="5" width="9.4" height="13" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.7"/>
      <rect x="11.6" y="7" width="9.4" height="13" rx="1.8" fill="#fff" stroke="currentColor" stroke-width="1.7"/>
      <path d="M16.3 12.2c0-1 .8-1.7 1.8-1.7s1.8.7 1.8 1.7c0 1.5-1.8 1.5-1.8 2.9M18.1 16.8v.4" stroke="${A}" stroke-width="1.5" stroke-linecap="round" fill="none"/>`,

    sort: `<rect x="3" y="4" width="7" height="6" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <rect x="3" y="14" width="7" height="6" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <path d="M14 8h6M14 18h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M13.4 6.2 15.6 8l-2.2 1.8" fill="none" stroke="${A}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,

    steps: `<path d="M3 20h5v-5h5V10h5V5h3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="20" cy="5" r="2.2" fill="${A}"/>`,

    pairs: `<path d="M3.4 8.2h5.2a1.9 1.9 0 1 0 0-3.4V3.4h5.6v5.4a1.9 1.9 0 1 1 0 3.8v5.4H8.6a1.9 1.9 0 1 0 0 3.4v2.6H3.4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M14.6 3.6h5.8v5.6a1.9 1.9 0 1 0 0 3.8v5.6h-5.8" fill="${A}" opacity=".85"/>`,

    sweep: `<path d="M2.6 16.4c2.2-2.6 4.4-2.6 6.6 0s4.4 2.6 6.6 0 3-2 5.6-.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      <path d="M2.6 20.4c2.2-2.6 4.4-2.6 6.6 0s4.4 2.6 6.6 0" fill="none" stroke="${A}" stroke-width="1.7" stroke-linecap="round"/>
      <circle cx="16.4" cy="6.6" r="2.6" fill="${A}" opacity=".9"/>`,

    recall: `<path d="M13.6 2.4 5.4 13.6h5.2L10 21.6l8.6-11.6h-5.4z" fill="${A}"/>`,

    flashcards: `<rect x="6.6" y="3.4" width="10.4" height="14.4" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(-10 12 10)"/>
      <rect x="7.4" y="5.6" width="10.4" height="14.4" rx="1.8" fill="#fff" stroke="currentColor" stroke-width="1.7"/>
      <path d="M10 11h5.2M10 14h3.4" stroke="${A}" stroke-width="1.6" stroke-linecap="round"/>`,

    bubbles: `<circle cx="9" cy="14.4" r="4.6" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="16.8" cy="8" r="3" fill="${A}" opacity=".9"/>
      <circle cx="17.4" cy="16" r="2.2" fill="none" stroke="${A2}" stroke-width="1.5"/>
      <path d="M7.4 12.6c.13-.9.6-1.6 1.3-2" stroke="#fff" stroke-width="1.3" stroke-linecap="round" fill="none"/>`,

    crates: `<path d="M3.4 8.4 12 4.2l8.6 4.2v8.2L12 20.8 3.4 16.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M3.4 8.4 12 12.6l8.6-4.2M12 12.6v8.2" stroke="currentColor" stroke-width="1.4" opacity=".7"/>
      <path d="M8.6 6.3 17.2 10.5" stroke="${A}" stroke-width="1.8" stroke-linecap="round"/>`,

    wheel: `<circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="1.7"/>
      <path d="M12 3.4v17.2M3.4 12h17.2M6 6l12 12M18 6 6 18" stroke="${A}" stroke-width="1.3" opacity=".85"/>
      <circle cx="12" cy="12" r="1.8" fill="currentColor"/>`,

    tiles: `<rect x="3.2" y="3.2" width="7.4" height="7.4" rx="1.4" fill="${A}" opacity=".9"/>
      <rect x="13.4" y="3.2" width="7.4" height="7.4" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <rect x="3.2" y="13.4" width="7.4" height="7.4" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <rect x="13.4" y="13.4" width="7.4" height="7.4" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".6"/>`,

    maze: `<path d="M3.4 6.6h6.2v5.4h6v5.4h4.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="3.4" cy="6.6" r="2" fill="none" stroke="${A}" stroke-width="1.7"/>
      <circle cx="20.2" cy="17.4" r="2.2" fill="${A}"/>`,

    zap: `<path d="M6 3.4v7a6 6 0 0 0 12 0v-7" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
      <path d="M3.4 3.4h5.2M15.4 3.4h5.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
      <path d="M13.4 9.6 9.8 14h4l-3.2 4.6" fill="none" stroke="${A}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,

    groups: `<rect x="2.8" y="9" width="5.6" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <rect x="9.2" y="4.4" width="5.6" height="15.6" rx="1.5" fill="${A}" opacity=".85"/>
      <rect x="15.6" y="7" width="5.6" height="13" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/>`,

    rocket: `<path d="M12 2.6c3 2.4 4.6 6 4.6 9.6L12 17.4l-4.6-5.2c0-3.6 1.6-7.2 4.6-9.6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      <circle cx="12" cy="9" r="1.8" fill="${A}"/>
      <path d="M7.4 12.4 4.6 16.2l3.4-.6M16.6 12.4l2.8 3.8-3.4-.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M12 17.8v3.6" stroke="${A}" stroke-width="1.9" stroke-linecap="round" class="ar-flame"/>`,

    leap: `<g transform="translate(1.2 1) scale(1.12)">
      <ellipse cx="12" cy="13.4" rx="7" ry="8.4" fill="none" stroke="currentColor" stroke-width="1.7"/>
      <ellipse cx="12" cy="15" rx="4" ry="5.6" fill="#fff" stroke="currentColor" stroke-width="1.1"/>
      <circle cx="12" cy="4.4" r="3.6" fill="none" stroke="currentColor" stroke-width="1.7"/>
      <circle cx="10.7" cy="4.2" r=".85" fill="currentColor"/><circle cx="13.6" cy="4.2" r=".85" fill="currentColor"/>
      <path d="M13 5.6 17 6.4l-3.8 1.6z" fill="${A}"/>
      <path d="M6.2 12.4c-1.6-1-2.4-2.6-2.2-4.2 1.4.4 2.4 1.4 2.8 2.8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </g>`,

    zoom: `<circle cx="10.6" cy="10.6" r="6.4" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <path d="M15.4 15.4 21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M6.6 12.4c1.2-2.6 2.6-3.4 4-2.4s2.4 1 3.6-1" fill="none" stroke="${A}" stroke-width="1.6" stroke-linecap="round"/>`,

    deck: `<rect x="3" y="6.4" width="10.6" height="14" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.6" transform="rotate(-8 8 13)"/>
      <rect x="8.6" y="4.4" width="10.6" height="14" rx="1.8" fill="#fff" stroke="currentColor" stroke-width="1.7"/>
      <path d="M13.4 9.4 11.6 17M16 9.4l-1.8 7.6" stroke="${A}" stroke-width="1.5" stroke-linecap="round"/>`,

    /* ---- tokens ---- */
    shield: `<path d="M12 2.6 20 5.4v6.2c0 5-3.4 8.4-8 10.2-4.6-1.8-8-5.2-8-10.2V5.4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M8.6 11.8 11.4 14.6l4.2-5" fill="none" stroke="${A}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>`,

    heart: `<path d="M12 20.4S3.6 15 3.6 9.3A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8.4 2.3c0 5.7-8.4 11.1-8.4 11.1z" fill="currentColor" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>`,

    fuse: `<path d="M14.6 3.4 20.6 9.4l-3 3-6-6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      <path d="M11.6 6.4 4.4 13.6a3 3 0 0 0 4.2 4.2l7.2-7.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      <path d="M4 20h6" stroke="${A}" stroke-width="1.8" stroke-linecap="round"/>`,

    fuel: `<rect x="4" y="6.4" width="11" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/>
      <path d="M7.4 6.4V4.2h4.2v2.2M15 10h2.6a2 2 0 0 1 2 2v5.4a1.6 1.6 0 0 1-3.2 0V13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M9.5 10.6c0 1.4 1.6 1.8 1.6 3.2a1.7 1.7 0 0 1-3.4 0c0-1.4 1.8-1.8 1.8-3.2z" fill="${A}"/>`,

    fish: `<path d="M3.4 12c2.6-3.4 6-4.6 9.4-3.4 2.4.9 4 2.4 5.2 3.4-1.2 1-2.8 2.5-5.2 3.4C9.4 16.6 6 15.4 3.4 12z" fill="${A}" opacity=".9"/>
      <path d="M18 8.6 21.4 12 18 15.4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="8.4" cy="11.2" r=".9" fill="#fff"/>`,

    flag: `<path d="M6.2 21V3.4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
      <path d="M6.2 4.4h12v8h-12z" fill="${A}" opacity=".9"/>
      <path d="M8.6 6.4h7M8.6 9h4.6" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>`,

    igloo: `<g transform="translate(0.6 1) scale(1.14)">
      <path d="M2.4 19.6a9.6 9.6 0 0 1 19.2 0z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M8.6 19.6a3.4 3.4 0 0 1 6.8 0z" fill="${A}" opacity=".9"/>
      <path d="M6 12.4h12M12 9.4v3M4.6 15.8h14.8" stroke="currentColor" stroke-width="1.1" opacity=".65"/>
    </g>`,

    die: `<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <circle cx="8.6" cy="8.6" r="1.5" fill="${A}"/><circle cx="15.4" cy="8.6" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="8.6" cy="15.4" r="1.5" fill="currentColor"/>
      <circle cx="15.4" cy="15.4" r="1.5" fill="${A}"/>`,

    star: `<path d="M12 2.8l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.6l6.5-.9z" fill="${A}"/>`,
    check: `<path d="M4.6 12.8 9.6 18 19.4 6.4" fill="none" stroke="${A2}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
    cross: `<path d="M6 6l12 12M18 6 6 18" fill="none" stroke="#e5484d" stroke-width="2.6" stroke-linecap="round"/>`,
    clock: `<circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <path d="M12 7.4V12l3.4 2.2" fill="none" stroke="${A}" stroke-width="1.8" stroke-linecap="round"/>`,
  };

  /** an inline SVG glyph; `cls` adds animation hooks (ar-bob, ar-spin …) */
  ML.art = function (name, size, cls) {
    const key = P[name] ? name : (ML.art.alias[name] || "star");
    const body = P[key] || P.star;
    const s = size || 24;
    return `<svg class="ar-glyph${cls ? " " + cls : ""}" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true" focusable="false">${body}</svg>`;
  };
  /* the emoji that used to stand in for art, mapped onto the real thing */
  ML.art.alias = {
    "🎱": "bingo", "🏁": "flag", "☄️": "comets", "☄": "comets", "🛡": "shield", "🃏": "deck",
    "🗂️": "flashcards", "🗂": "flashcards", "🪜": "steps", "🎲": "die", "🧩": "pairs", "🌊": "sweep",
    "⚡": "recall", "🫧": "bubbles", "📦": "crates", "🎡": "wheel", "🖼": "tiles", "🖼️": "tiles",
    "🔌": "maze", "🔧": "fuse", "🧲": "zap", "🗃": "groups", "🗃️": "groups", "🚀": "rocket",
    "⛽": "fuel", "🐧": "leap", "🏠": "igloo", "🐟": "fish", "🔍": "zoom", "✅": "check", "✕": "cross",
    "★": "star", "◷": "clock",
  };
  /** a row of tokens for a HUD chip: ML.art.tokens("shield", 3) */
  ML.art.tokens = function (name, n) {
    let out = "";
    for (let i = 0; i < Math.max(0, n | 0); i++) out += ML.art(name, 15, "ar-token");
    return out || "—";
  };
  /** the overlay / card icon: accepts a name, an emoji, or raw svg */
  ML.art.big = function (icon, size) {
    if (!icon) return ML.art("star", size || 44);
    if (String(icon).indexOf("<svg") === 0) return icon;
    return ML.art(ML.art.alias[icon] || icon, size || 44);
  };

  /* the original Bubble Pop's planet bubbles: a shaded sphere with an orbit ring */
  ML.art.planet = function (hue, label) {
    const fill = hue === "gold" ? "#F7BE28" : hue === "teal" ? "#78D6C8" : hue === "rose" ? "#F08FBF" : "#3E8FE0";
    const dark = hue === "gold" ? "#C98F10" : hue === "teal" ? "#3FA79A" : hue === "rose" ? "#C25C90" : "#1F5FA8";
    return `<svg class="ar-planet" viewBox="0 0 120 112" aria-hidden="true">
      <defs><radialGradient id="pg${hue}" cx="34%" cy="28%" r="78%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity=".85"/>
        <stop offset="45%" stop-color="${fill}"/>
        <stop offset="100%" stop-color="${dark}"/>
      </radialGradient></defs>
      <circle cx="60" cy="56" r="44" fill="url(#pg${hue})"/>
      <circle cx="44" cy="40" r="9" fill="#fff" opacity=".28"/>
      <circle cx="76" cy="70" r="6" fill="#0b1020" opacity=".12"/>
      <circle cx="52" cy="74" r="4" fill="#0b1020" opacity=".1"/>
      <ellipse cx="60" cy="58" rx="56" ry="15" fill="none" stroke="#0b1020" stroke-opacity=".22" stroke-width="5" transform="rotate(-16 60 58)"/>
      <ellipse cx="60" cy="58" rx="56" ry="15" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.6" transform="rotate(-16 60 58)"/>
    </svg>${label ? `<span class="ar-bub-t">${label}</span>` : ""}`;
  };

  ML.art.names = () => Object.keys(P);
})();

/* ===========================================================
   MathsLab — Question Studio data layer
   Merges every question source in the Drive project into one
   searchable index:

     bnk   2,840 records recovered from the 31 Quiz Show .bnk banks
     fikr  1,736 multiple-choice questions from the FikrCounts bank
     calc    162 calculus items from the Dr. Math Azzam question bank
     lab       3 lesson quizzes harvested from the course platform

   Also owns the per-question progress record (seen / correct /
   wrong / starred) and the maths-aware text renderer used by
   every card.
   =========================================================== */
(function () {
  "use strict";
  const ML = (window.ML = window.ML || {});
  const U = ML.u;

  const BANKS = window.QSBANKS || [];
  const FIKR = window.FIKR || [];
  const CALCQ = window.CALCQ || [];
  const TGBT = window.TGBTEST || { books: [], items: [] };

  const items = [];
  const byId = {};

  /* ---------------- normalise the .bnk records ---------------- */
  const BANK_LABEL = { C1: "Course 1", C2: "Course 2", A1: "Algebra 1" };
  BANKS.forEach((bank) => {
    const code = String(bank.id || "").split("_")[0];
    const chapter = bank.id.replace("_", " Ch ");
    const title = (bank.title || "").split(":").slice(-1)[0].trim();
    const unit = (BANK_LABEL[code] || code) + " · " + chapter.replace(/^[A-Z0-9]+ /, "") + " — " + title;
    (bank.q || []).forEach((rec, i) => {
      const kind = rec.k || (rec.c ? "hint" : "fragment");
      const id = "bnk:" + bank.id + ":" + i;
      const it = {
        id, src: "bnk", unit, unitKey: bank.id, chapter, book: BANK_LABEL[code] || code,
        skill: rec.s || "", page: rec.p || "", diff: rec.d || "", kind,
        q: rec.q || "", o: (rec.o || []).slice(0, 4), a: null, hint: "", expl: "", fb: [],
        title: title,
      };
      items.push(it); byId[id] = it;
    });
  });

  /* ---------------- FikrCounts MCQs ---------------- */
  FIKR.forEach((r) => {
    const rawUnit = r.unit && !/^no source$/i.test(r.unit.trim()) ? r.unit : (r.skill || "General");
    const it = {
      id: r.i, src: "fikr",
      unit: rawUnit,
      unitKey: rawUnit,
      skill: r.skill || "", diff: r.d || "", kind: "mcq",
      q: r.q || "", o: r.o || [], a: null,
      hint: "", expl: "", fb: [],
      grade: r.g || "", prog: r.prog || "", n: r.n,
    };
    items.push(it); byId[it.id] = it;
  });

  /* ---------------- calculus bank + lesson quizzes ---------------- */
  CALCQ.forEach((r) => {
    const it = {
      id: r.id, src: r.src === "lab" ? "lab" : "calc",
      unit: r.topic || r.unit || "Calculus",
      unitKey: r.topic || r.unit || "calculus",
      skill: "", diff: "", kind: "graded",
      q: r.q || "", o: r.o || [], a: (typeof r.a === "number" ? r.a : null),
      hint: r.hint || "", expl: r.expl || "", fb: r.fb || [],
    };
    items.push(it); byId[it.id] = it;
  });

  /* ---------------- Fundamentals of Math (the fom course bank) ---------- */
  const FOMQ = window.FOMQ || [];
  FOMQ.forEach((r) => {
    const it = {
      id: r.i, src: "fom",
      unit: r.unit || "Fundamentals of Math",
      unitKey: r.unit || "Fundamentals of Math",
      skill: r.skill || "", diff: r.d || "", kind: "mcq",
      q: r.q || "", o: r.o || [], a: (typeof r.a === "number" ? r.a : null),
      hint: r.hint || "", expl: r.expl || "", fb: [],
      course: "fom", lesson: r.lesson || "",
    };
    items.push(it); byId[it.id] = it;
  });

  /* ---------------- TestGen .BOK (decoded by tools/parse_bok.py) ------- */
  const TG_BOOK = {};
  (TGBT.books || []).forEach((b) => { TG_BOOK[b.code] = b; });
  (TGBT.items || []).forEach((r) => {
    const book = TG_BOOK[r.b] || { label: r.b, course: "" };
    const it = {
      id: r.i, src: "tg",
      unit: book.label + " · " + (r.k === "rubric" ? "shared instruction" : "question"),
      unitKey: r.b + "|" + r.k,
      skill: "", diff: "", kind: r.k === "rubric" ? "rubric" : "stem",
      q: r.q || "", o: [], a: null, hint: "", expl: "", fb: [],
      book: book.label, course: r.c || book.course || "",
    };
    items.push(it); byId[it.id] = it;
  });

  /* ---------------- sources ---------------- */
  const SOURCES = [
    { id: "all", label: "Everything", color: "#4b3ee0" },
    { id: "bnk", label: "Recovered .bnk", color: "#1c57b5",
      hint: "Every record decrypted out of the 31 Quiz Show banks" },
    { id: "fikr", label: "FikrCounts", color: "#0b7a73",
      hint: "1,736 GAT / school MCQs exported from the FikrCounts bank" },
    { id: "calc", label: "Calculus bank", color: "#7c4dff",
      hint: "Dr. Math Azzam calculus items — with answer keys, hints and explanations" },
    { id: "tg", label: "TestGen .BOK", color: "#0e7490",
      hint: "Wording recovered from the two TestGen .BOK banks (Precalculus + Calculus); gaps mark the formulas still held in ExamView notation" },
    { id: "fom", label: "Fundamentals of Math", color: "#b4530a",
      hint: "180 questions written for the Fundamentals of Math course — every lesson, with its key, hint and reasoning" },
    { id: "lab", label: "Lesson quizzes", color: "#b0262a",
      hint: "Quiz checkpoints lifted from the course pages" },
  ];

  const KIND_LABEL = {
    question: "question", "question-partial": "question · partly recovered",
    definition: "definition", "definition-partial": "definition · partly recovered",
    hint: "hint text", fragment: "fragment", mcq: "multiple choice", graded: "checked answer",
    stem: "testgen question", rubric: "testgen instruction",
  };

  /* ---------------- text rendering ---------------- */
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  /* ---- KaTeX with a memory: a formula that KaTeX refuses is shown as its
     own text instead of as a red error, and identical formulas are only
     rendered once (the .bnk / TestGen records repeat a lot) ---- */
  const TEXCACHE = new Map();
  function katex(src, display) {
    const key = (display ? "D" : "I") + src;
    const hit = TEXCACHE.get(key);
    if (hit != null) return hit;
    let out;
    if (window.katex && window.katex.renderToString) {
      try {
        /* a strict pass first: if the formula is broken we must not show red */
        window.katex.renderToString(src, { throwOnError: true, displayMode: !!display, output: "html", strict: "ignore" });
        out = window.katex.renderToString(src, { throwOnError: false, displayMode: !!display, output: "html", strict: "ignore" });
      } catch (e) {
        out = '<span class="texraw" title="this formula could not be typeset">' + esc(src) + "</span>";
      }
    } else out = esc(src);
    if (TEXCACHE.size < 4000) TEXCACHE.set(key, out);
    return out;
  }

  /* Inline maths for prose that is NOT LaTeX: 3/4, x^2, √49 ...
     A run that carries LaTeX commands (\dfrac, \pi, \infty, \circ …) is one
     formula, so it goes to KaTeX whole — splitting it on spaces used to tear
     commands like \text{ cm} apart. */
  function plainMath(piece) {
    const s = String(piece == null ? "" : piece);
    if (!s.trim()) return esc(s);
    if (/\\[a-zA-Z]{2,}/.test(s) && ML.tex && ML.tex.texify) {
      return katex(ML.tex.texify(s), false);
    }
    if (ML.tex && ML.tex.isMathy && ML.tex.isMathy(s)) return ML.tex.render(s);
    return esc(s);
  }

  /**
   * html(text, opts)
   *   opts.gaps     – draw \u0000 number slots as interactive chips
   *   opts.gapIndex – running counter for gap ids
   *
   * Delimiters understood, in this order:
   *   $$ … $$   display maths        \[ … \]   display maths
   *   $ … $     inline maths         \( … \)   inline maths
   *   \$        a literal dollar (FikrCounts prices), never a delimiter
   *   \u0000     a number slot        [Calculator: …]  a tagged hint
   */
  function html(text, opts) {
    opts = opts || {};
    let s = String(text == null ? "" : text);

    // the FikrCounts export prefixes some stems with a calculator hint
    s = s.replace(/\[Calculator:\s*([^\]]+)\]/gi, (m, v) => "\u0001CB|" + v.trim() + "\u0001");

    const out = [];
    let i = 0, text0 = 0, gi = opts.gapIndex || 0;
    const flush = (upto) => {
      if (upto <= text0) return;
      /* a \$ in prose is a price, not a delimiter */
      out.push(plainMath(s.slice(text0, upto).replace(/\\\$/g, "$")));
    };

    while (i < s.length) {
      const c = s[i];

      /* a literal dollar, not a delimiters */
      if (c === "\\" && s[i + 1] === "$") { i += 2; continue; }

      /* display maths first, so $$ is never read as two empty inlines */
      if (c === "$" && s[i + 1] === "$") {
        const end = s.indexOf("$$", i + 2);
        if (end > 0) {
          flush(i); out.push(katex(s.slice(i + 2, end), true));
          i = end + 2; text0 = i; continue;
        }
      }
      if (c === "\\" && s[i + 1] === "[") {
        const end = s.indexOf("\\]", i + 2);
        if (end > 0) {
          flush(i); out.push(katex(s.slice(i + 2, end), true));
          i = end + 2; text0 = i; continue;
        }
      }
      if (c === "\\" && s[i + 1] === "(") {
        const end = s.indexOf("\\)", i + 2);
        if (end > 0) {
          flush(i); out.push(katex(s.slice(i + 2, end), false));
          i = end + 2; text0 = i; continue;
        }
      }
      if (c === "$") {
        /* find the closing dollar, skipping any \$ on the way */
        let j = i + 1, close = -1;
        while (j < s.length) {
          if (s[j] === "\\" && s[j + 1] === "$") { j += 2; continue; }
          if (s[j] === "$") { close = j; break; }
          j++;
        }
        if (close > 0) {
          flush(i); out.push(katex(s.slice(i + 1, close), false));
          i = close + 1; text0 = i; continue;
        }
      }

      /* number slots and the calculator tag */
      if (c === "\u0000") {
        flush(i);
        out.push(opts.gaps
          ? '<span class="qgap" data-gap="' + (gi++) + '" role="button" tabindex="0" title="Click to put your own number in">?</span>'
          : '<span class="qgap filled">?</span>');
        i++; text0 = i; continue;
      }
      if (c === "\u0001" && s.startsWith("\u0001CB|", i)) {
        const end = s.indexOf("\u0001", i + 4);
        if (end > 0) {
          flush(i); out.push('<span class="qtag">' + esc(s.slice(i + 4, end)) + "</span>");
          i = end + 1; text0 = i; continue;
        }
      }
      i++;
    }
    flush(s.length);

    /* a lone \u0000 or tag character left over would break the text */
    return out.join("").replace(/\u0000/g, " ").replace(/\\\$/g, "$") || '<span class="muted">(empty record)</span>';
  }

  /* A readable plain-text version of a stem — used by list rows and the
     practice summary, where KaTeX would be too heavy. */
  const TEXMAP = {
    lim: "lim", to: "→", infty: "∞", sqrt: "√", le: "≤", leq: "≤", ge: "≥", geq: "≥",
    ne: "≠", neq: "≠", pm: "±", mp: "∓", cdot: "·", times: "×", div: "÷", ast: "·",
    pi: "π", theta: "θ", alpha: "α", beta: "β", gamma: "γ", delta: "δ", mu: "μ",
    in: "∈", notin: "∉", cup: "∪", cap: "∩", emptyset: "∅", subset: "⊂", R: "ℝ", Z: "ℤ", N: "ℕ", Q: "ℚ",
    Rightarrow: "⇒", rightarrow: "→", leftarrow: "←", leftrightarrow: "↔", implies: "⇒", iff: "⇔",
    angle: "∠", circ: "°", approx: "≈", sim: "~", propto: "∝", sum: "Σ", int: "∫", partial: "∂",
    quad: " ", qquad: " ", text: "", mathrm: "", mathbb: "", mathbf: "", left: "", right: "",
  };

  function plain(text) {
    let s = String(text == null ? "" : text);
    s = s.replace(/\[Calculator:[^\]]*\]/gi, "");
    s = s.replace(/\u0000/g, " ___ ");
    for (let k = 0; k < 3; k++) {
      s = s.replace(/\\[a-zA-Z]+\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "$1/$2");
      s = s.replace(/\\[a-zA-Z]+\s*\{([^{}]*)\}/g, "$1");
    }
    s = s.replace(/[_^]\{([^{}]*)\}/g, "$1");
    s = s.replace(/\\[a-zA-Z]+/g, (m, n) => (TEXMAP[n] != null ? TEXMAP[n] : n));
    s = s.replace(/[_^{}$]/g, "").replace(/\s+/g, " ").trim();
    return esc(s);
  }

  /* Recovered text needs the shouty-capitals / marker cleanup first. */
  function cleanBank(text) {
    return ML.tex && ML.tex.cleanBank ? ML.tex.cleanBank(text) : String(text || "");
  }

  function hasGap(text) { return /\u0000/.test(String(text || "")); }

  /* ---------------- progress store ---------------- */
  const KEY = "qs:state";
  let state = U.store.get(KEY, null) || { rec: {}, sessions: [], created: Date.now() };
  if (!state.rec) state.rec = {};
  const save = U.debounce(() => U.store.set(KEY, state), 400);

  function rec(id) {
    const r = state.rec[id];
    if (!r) return { s: 0, c: 0, w: 0, st: 0, seen: 0 };
    return { s: r[0] || 0, c: r[1] || 0, w: r[2] || 0, st: r[3] || 0, seen: r[4] || 0 };
  }
  function bump(id, field, delta) {
    const cur = state.rec[id] || [0, 0, 0, 0, 0];
    const map = { s: 0, c: 1, w: 2, st: 3, seen: 4 };
    const i = map[field];
    cur[i] = field === "st" ? (cur[i] ? 0 : 1) : Math.max(0, (cur[i] || 0) + (delta == null ? 1 : delta));
    state.rec[id] = cur;
    save();
    return cur[i];
  }
  const star = (id) => { const v = bump(id, "st"); return !!v; };
  const isStarred = (id) => !!rec(id).st;
  const markSeen = (id) => bump(id, "seen");

  function summary() {
    let seen = 0, correct = 0, wrong = 0, starred = 0;
    for (const id in state.rec) {
      const r = rec(id);
      if (r.seen) seen++;
      correct += r.c; wrong += r.w; starred += r.st ? 1 : 0;
    }
    return { seen, correct, wrong, starred, total: items.length, attempted: correct + wrong };
  }

  function reset() { state = { rec: {}, sessions: [], created: Date.now() }; U.store.set(KEY, state); }

  function logSession(s) {
    state.sessions = (state.sessions || []).concat([s]).slice(-40);
    save();
  }

  /* ---------------- facets + filtering ---------------- */
  function unitsFor(src) {
    const seen = new Map();
    items.forEach((it) => {
      if (src && src !== "all" && it.src !== src) return;
      const key = it.src + "|" + it.unitKey;
      if (!seen.has(key)) seen.set(key, { key, unit: it.unit, src: it.src, n: 0 });
      seen.get(key).n++;
    });
    return Array.from(seen.values()).sort((a, b) => a.unit.localeCompare(b.unit));
  }

  function programsFor() {
    const m = new Map();
    items.forEach((it) => { if (it.src === "fikr" && it.prog && it.prog !== "No program") m.set(it.prog, (m.get(it.prog) || 0) + 1); });
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).map(([id, n]) => ({ id, n }));
  }

  function gradesFor() {
    const m = new Map();
    items.forEach((it) => { if (it.src === "fikr" && it.grade) m.set(it.grade, (m.get(it.grade) || 0) + 1); });
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([id, n]) => ({ id, n }));
  }

  function skillsFor(src) {
    const set = new Set();
    items.forEach((it) => { if ((!src || src === "all" || it.src === src) && it.skill) set.add(it.skill); });
    return Array.from(set).sort();
  }

  function counts() {
    const c = { all: items.length, bnk: 0, fikr: 0, calc: 0, lab: 0 };
    items.forEach((it) => { c[it.src] = (c[it.src] || 0) + 1; });
    return c;
  }

  const DIFF_ORDER = { Easy: 1, Medium: 2, Hard: 3 };
  const BNK_DIFF = { Basic: 1, Average: 2, Challenging: 3, Advanced: 3 };

  /**
   * filter({ src, unit, diff, skill, q, starredOnly, unseenOnly, wrongOnly })
   */
  function filter(f) {
    f = f || {};
    const q = (f.q || "").trim().toLowerCase();
    return items.filter((it) => {
      if (f.src && f.src !== "all" && it.src !== f.src) return false;
      if (f.unit && it.src + "|" + it.unitKey !== f.unit) return false;
      if (f.course && it.course !== f.course) return false;
      if (f.diff && it.diff !== f.diff) return false;
      if (f.skill && it.skill !== f.skill) return false;
      if (f.prog && it.prog !== f.prog) return false;
      if (f.grade && it.grade !== f.grade) return false;
      if (f.questionsOnly && it.src === "bnk" && !/^question/.test(it.kind)) return false;
      if (f.starredOnly && !isStarred(it.id)) return false;
      if (f.wrongOnly && !rec(it.id).w) return false;
      if (f.unseenOnly && rec(it.id).seen) return false;
      if (q) {
        const hay = (it.q + " " + it.skill + " " + it.unit + " " + (it.o || []).join(" ")).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function statsByUnit(src, limit) {
    const m = new Map();
    items.forEach((it) => {
      if (src && src !== "all" && it.src !== src) return;
      const k = it.src + "|" + it.unitKey;
      if (!m.has(k)) m.set(k, { unit: it.unit, src: it.src, n: 0, attempted: 0, correct: 0 });
      const row = m.get(k);
      row.n++;
      const r = rec(it.id);
      if (r.c || r.w) { row.attempted++; if (r.c) row.correct++; }
    });
    return Array.from(m.values())
      .sort((a, b) => (b.attempted - a.attempted) || (b.n - a.n))
      .slice(0, limit || 8);
  }

  ML.qdata = {
    items, byId, SOURCES, KIND_LABEL, counts,
    html, plain, cleanBank, hasGap, esc, katex,
    rec, star, isStarred, markSeen, bump, summary, reset, logSession,
    unitsFor, skillsFor, programsFor, gradesFor, filter, statsByUnit,
    DIFF_ORDER, BNK_DIFF,
    get sessions() { return state.sessions || []; },
  };
})();

/* ===========================================================
   MathsLab — the question generator
   -----------------------------------------------------------
   The Drive folder held Pearson TestGen 7.6.5 and a set of
   ExamView .bnk banks. Those programs do not store finished
   questions: each dynamic question stores a *recipe* —

        upper          → range(0,10)          pick an integer
        digits         → "0,1,2,…"            a constant list
        ans            → left(digits,…)       a derived value
        upper <> 0                            a constraint the
                                              instance must meet
        scramble                              shuffle the options

   This module is our own version of that idea. A family is a
   recipe: typed variables with ranges, constraints, a question
   template, an answer expression, distractor expressions and
   the worked steps. Instantiating it evaluates the recipe, so
   every "New question" is a fresh instance with a real key —
   which is exactly what TestGen was for, minus the .exe.

   Template syntax
     {{expr}}      evaluated in the instance scope, printed
     $…$           inline TeX (rendered with the local KaTeX)
   Helpers available inside {{…}}:
     n(x) number   sgn(x) "+ 3" / "− 3"    frac(n,d) TeX fraction
     sq(x) x²      sqrtT(x) √ TeX          red(n,d) reduced "a/b"
     gcd, abs, min, max, round, floor, ceil, pick, join, deg
   =========================================================== */
(function () {
  "use strict";
  const ML = (window.ML = window.ML || {});
  const U = ML.u;

  /* ---------------- deterministic RNG (so a worksheet can be replayed) ---------------- */
  function makeRng(seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }
  const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

  /* ---------------- formatting helpers ---------------- */
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = b; b = a % b; a = t; } return a || 1; };

  function n(x) {
    if (typeof x === "string") return x;
    if (!isFinite(x)) return "—";
    const v = Math.round(x * 10000) / 10000;
    return String(v);
  }
  const sgn = (x) => (x < 0 ? "− " + Math.abs(x) : "+ " + x);
  const plus = (x) => (x === 0 ? "" : x < 0 ? " − " + Math.abs(x) : " + " + x);
  /* "− 3" / "+ 3" for when the term already has its own minus in front */
  const minus = (x) => (x === 0 ? "" : x < 0 ? " + " + Math.abs(x) : " − " + x);
  /* a coefficient and its variable: cx(1)="x", cx(-1)="-x", cx(3)="3x" */
  const cx = (k, v) => (k === 1 ? v || "x" : k === -1 ? "-" + (v || "x") : n(k) + (v || "x"));
  /* the same, ready to follow a previous term: xterm(5)=" + 5x", xterm(-1)=" − x", xterm(0)="" */
  const xterm = (k, v) => (k === 0 ? "" : k > 0 ? " + " + cx(k, v) : " − " + cx(-k, v));
  /* a complex answer: cxsum(3,7)="3 + 7i", cxsum(-1,-13)="-1 − 13i", cxsum(-1,0)="-1" */
  function cxsum(re, im) {
    if (!im) return n(re);
    const tail = (im > 0 ? " + " : " − ") + (Math.abs(im) === 1 ? "" : Math.abs(im)) + "i";
    return n(re) + tail;
  }
  const sq = (x) => (x === 1 ? "" : x === -1 ? "−" : n(x)) + "²";
  const sqT = (x) => (x === 1 ? "" : x === -1 ? "-" : n(x)) + "^2";
  function frac(a, b) {
    if (b < 0) { a = -a; b = -b; }
    const g = gcd(a, b);
    a /= g; b /= g;
    if (b === 1) return n(a);
    return (a < 0 ? "-" : "") + "\\frac{" + Math.abs(a) + "}{" + b + "}";
  }
  const red = (a, b) => { const g = gcd(a, b); return (b < 0 ? -a : a) / g + "/" + Math.abs(b) / g; };
  function sqrtT(x) {
    if (x < 0) return "\\sqrt{" + x + "}";
    const r = Math.sqrt(x);
    if (Number.isInteger(r)) return String(r);
    for (let k = Math.floor(r); k >= 2; k--) {      /* largest square factor first */
      if (x % (k * k) === 0) return k + "\\sqrt{" + x / (k * k) + "}";
    }
    return "\\sqrt{" + x + "}";
  }
  const deg = (x) => n(x) + "°";
  const join = (a, sep) => (Array.isArray(a) ? a.join(sep || ", ") : a);
  const paren = (x) => (x < 0 ? "(" + n(x) + ")" : n(x));

  const HELPERS = { n, sgn, plus, minus, cx, xterm, cxsum, sq, sqT, frac, red, sqrtT, deg, join, paren, gcd, abs: Math.abs, min: Math.min, max: Math.max, round: Math.round, floor: Math.floor, ceil: Math.ceil, sqrt: Math.sqrt, pi: Math.PI };

  /* ---------------- tiny expression evaluator ----------------
     The recipes are ours (authored in assets/data/generator.js), and every
     identifier is either an instance variable or a helper, so a compiled
     function with an explicit argument list is enough — no eval of user text. */
  const ID = /^[A-Za-z_$][\w$]*$/;
  function compile(src, scope) {
    /* every instance variable and helper is passed as a parameter, so a name
       like "top" or "length" shadows the DOM global instead of reaching it */
    const names = Object.keys(scope).filter((k) => ID.test(k));
    const body = "return (" + src + ");";
    try {
      const fn = new Function(names.join(","), body);
      // smoke-test it so a bad recipe fails here rather than mid-question
      fn.apply(null, names.map((k) => scope[k]));
      return (s) => fn.apply(null, names.map((k) => scope[k]));
    } catch (e) {
      return null;
    }
  }

  function evalIn(src, scope) {
    const f = compile(String(src), scope);
    if (!f) throw new Error("bad expression: " + src);
    return f();
  }

  function render(src, scope) {
    /* "{{{a}}}" is a TeX brace plus a placeholder — the negative lookahead lets
       \dfrac{{{a}}}{2} render as \dfrac{5}{2} instead of choking on the trio */
    return String(src).replace(/\{\{(?!\{)([\s\S]+?)\}\}/g, (m, expr) => {
      try { return String(evalIn(expr, scope)); } catch (e) { return "?"; }
    });
  }

  /* ---------------- instantiate one family ---------------- */
  let LAST_ERR = "";
  function instance(family, seed) {
    LAST_ERR = "";
    const r = makeRng(seed == null ? (Date.now() ^ (Math.random() * 1e9)) : seed);
    for (let attempt = 0; attempt < 400; attempt++) {
      const scope = Object.assign({}, HELPERS);
      let failed = false;
      for (const spec of family.vars) {
        const name = spec[0], kind = spec[1];
        let val;
        if (kind === "int") {
          const [lo, hi] = [spec[2], spec[3]];
          val = ri(r, lo, hi);
          const cond = spec[4];
          if (cond) {
            let ok = false;
            for (let t = 0; t < 40 && !ok; t++) {
              const probe = Object.assign(Object.create(null), scope, { [name]: val });
              try { ok = !!evalIn(cond, Object.assign({}, scope, { [name]: val })); }
              catch (e) { ok = false; }
              if (!ok) val = ri(r, lo, hi);
              void probe;
            }
            if (!ok) { failed = true; break; }
          }
        } else if (kind === "float") {
          const dp = spec[4] || 2;
          const step = Math.pow(10, -dp);
          val = +(spec[2] + Math.floor((r() * (spec[3] - spec[2])) / step) * step).toFixed(dp);
          if (spec[5]) {
            let ok = false;
            for (let t = 0; t < 40 && !ok; t++) {
              try { ok = !!evalIn(spec[5], Object.assign({}, scope, { [name]: val })); } catch (e) { ok = false; }
              if (!ok) val = +(spec[2] + Math.floor((r() * (spec[3] - spec[2])) / step) * step).toFixed(dp);
            }
            if (!ok) { failed = true; break; }
          }
        } else if (kind === "pick") {
          val = pick(r, spec[2]);
        } else if (kind === "oneOf") {
          const src = pick(r, spec[2]);
          try { val = evalIn(src, scope); } catch (e) { failed = true; break; }
        } else if (kind === "=") {
          try { val = evalIn(spec[2], scope); } catch (e) { failed = true; break; }
        } else {
          LAST_ERR = "unknown kind " + kind + " on " + name;
          failed = true; break;
        }
        scope[name] = val;
      }
      if (failed) { LAST_ERR = LAST_ERR || "vars: constraint never satisfied"; continue; }
      if (family.when) {
        let ok = true;
        try { ok = !!evalIn(family.when, scope); } catch (e) { ok = false; }
        if (!ok) { LAST_ERR = LAST_ERR || "when: family.when false"; continue; }
      }
      /* ---- build the question ---- */
      let stem, answerText, steps, hint;
      try {
        stem = render(family.text, scope);
        answerText = render(String(family.answer), scope);
        steps = (family.steps || []).map((s) => render(s, scope));
        hint = family.hint ? render(family.hint, scope) : "";
      } catch (e) {
        LAST_ERR = "build: " + e.message;
        continue;                       // unusable instance — roll again
      }
      const blob = stem + answerText + steps.join("") + hint;
      const junk = /NaN|undefined|Infinity/.test(blob) ? "NaN/undefined in text"
        : /\{\{(?!\{)/.test(blob) ? "unrendered template"
        : "";
      if (junk) { LAST_ERR = "junk: " + junk; continue; }

      /* ---- options: the key plus authored distractors ---- */
      const seen = new Set([String(answerText)]);
      const wrong = [];
      for (const d of family.distract || []) {
        let t;
        try { t = render(String(d), scope); } catch (e) { continue; }
        if (!t || seen.has(t) || /NaN|undefined|\?/.test(t)) continue;
        seen.add(t);
        wrong.push(t);
        if (wrong.length === 3) break;
      }
      /* top up from the numeric answer when a distractor collided */
      if (wrong.length < 3) {
        const num = Number(answerText);
        if (isFinite(num)) {
          const near = [num + 1, num - 1, num * 2, -num, num + 2, num - 2];
          for (const c of near) {
            const t = n(c);
            if (!seen.has(t) && !/NaN/.test(t)) { seen.add(t); wrong.push(t); }
            if (wrong.length === 3) break;
          }
        }
      }
      if (wrong.length < 3) { LAST_ERR = "options: only " + wrong.length + " distractors"; continue; }

      const all = [{ html: answerText, ok: true }].concat(wrong.map((w) => ({ html: w, ok: false })));
      /* shuffle */
      for (let i = all.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        const t = all[i]; all[i] = all[j]; all[j] = t;
      }
      const answerIndex = all.findIndex((o) => o.ok);
      return {
        id: family.id + ":" + (seed == null ? Math.floor(r() * 1e9) : seed),
        family: family.id,
        topic: family.topic,
        chapter: family.chapter,
        course: family.course,
        diff: family.diff || "Medium",
        stem: stem,
        options: all,
        answerIndex: answerIndex,
        answerText: answerText,
        steps: steps,
        hint: hint,
        vars: Object.fromEntries(Object.entries(scope).filter(([k]) => !(k in HELPERS))),
      };
    }
    return null;
  }
  const lastError = () => LAST_ERR;

  /* ---------------- library ---------------- */
  const DATA = () => window.MLGEN || { courses: [], families: [] };

  function families(course, q) {
    let list = DATA().families.slice();
    if (course) list = list.filter((f) => f.course === course);
    if (q) {
      const s = q.toLowerCase();
      list = list.filter((f) => (f.topic + " " + f.chapter + " " + (f.title || "") + " " + (f.tags || []).join(" ")).toLowerCase().includes(s));
    }
    return list;
  }
  const familyById = (id) => DATA().families.filter((f) => f.id === id)[0] || null;
  const courses = () => DATA().courses;

  function courseOf(id) { return courses().filter((c) => c.id === id)[0] || null; }

  /* a mixed set for a worksheet */
  function worksheet(opts) {
    opts = opts || {};
    const pool = families(opts.course || "", opts.q || "");
    const count = opts.count || 10;
    const seedBase = opts.seed == null ? Math.floor(Math.random() * 1e9) : opts.seed;
    const out = [];
    const r = makeRng(seedBase);
    for (let i = 0; i < count; i++) {
      const fam = pool.length ? pool[Math.floor(r() * pool.length)] : null;
      if (!fam) break;
      const q = instance(fam, (seedBase + i * 7919) >>> 0);
      if (q) out.push(q);
    }
    return { seed: seedBase, items: out };
  }

  ML.gen = {
    makeRng, instance, lastError, families, familyById, courses, courseOf, render, evalIn,
    helpers: HELPERS, worksheet, get data() { return DATA(); },
  };
})();

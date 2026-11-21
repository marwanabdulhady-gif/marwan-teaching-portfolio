/* ===========================================================
   MathsLab — Quiz Show  (rebuild of MindPoint Quiz Show SE)
   A question generator for the 31 Holt chapter banks in the
   original Question Sets / folder. The banks' metadata (skill,
   standard, topic, page) is recovered from the .bnk files; the
   questions themselves are regenerated procedurally here.
   =========================================================== */
(function () {
  "use strict";
  const ML = window.ML, U = ML.u;
  /* Typeset maths with KaTeX when available, otherwise show plain text. */
  const TEX = (window.ML && ML.tex) ? ML.tex : { render: (s) => String(s == null ? "" : s) };

  /* ------------------------------------------------------------------
     Fraction & algebra helpers
     ------------------------------------------------------------------ */
  const F = {
    g: (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; },
    mk(n, d) { if (d < 0) { n = -n; d = -d; } const g = F.g(n, d); return { n: n / g, d: d / g }; },
    add(a, b) { return F.mk(a.n * b.d + b.n * a.d, a.d * b.d); },
    sub(a, b) { return F.mk(a.n * b.d - b.n * a.d, a.d * b.d); },
    mul(a, b) { return F.mk(a.n * b.n, a.d * b.d); },
    div(a, b) { return F.mk(a.n * b.d, a.d * b.n); },
    val: (a) => a.n / a.d,
    str(a) {
      if (a.d === 1) return String(a.n);
      return (a.n < 0 ? "-" : "") + Math.abs(a.n) + "/" + a.d;
    },
    /** mixed number string for improper fractions */
    mixed(a) {
      if (a.d === 1 || Math.abs(a.n) < a.d) return F.str(a);
      const s = a.n < 0 ? "-" : "", n = Math.abs(a.n);
      const w = Math.floor(n / a.d), r = n % a.d;
      return r ? s + w + " " + r + "/" + a.d : s + w;
    },
  };
  const fm = (n) => U.fmt(n, 2);

  /* signed term printer: 3 -> "+3", -3 -> "-3" */
  const sgn = (n, first) => (n < 0 ? " − " + Math.abs(n) : (first ? " + " : " + ")).replace(/^ \+ /, "");
  const term = (c, v) => (c === 0 ? "" : (c === 1 ? v : c === -1 ? "−" + v : c + v));

  /* polynomial printer: coeffs high->low with a variable letter */
  function poly(cs, v) {
    v = v || "x";
    const parts = [];
    for (let i = 0; i < cs.length; i++) {
      const c = cs[i], p = cs.length - 1 - i;
      if (!c) continue;
      const sign = parts.length ? (c < 0 ? " − " : " + ") : (c < 0 ? "−" : "");
      const a = Math.abs(c);
      let t = a === 1 && p > 0 ? "" : String(a);
      if (p === 1) t += v; else if (p > 1) t += v + "^" + p;
      parts.push(sign + t);
    }
    return parts.length ? parts.join("") : "0";
  }

  /* signed coefficient pair printer: affine(c, d) -> "3x+2", "-4", "x-5" */
  function affine(c, d, v) {
    v = v || "x";
    let t = "";
    if (c) t = c === 1 ? v : c === -1 ? "-" + v : c + v;
    if (d) t += (d > 0 ? (t ? "+" : "") : "-") + Math.abs(d);
    return t || "0";
  }
  function lin(c, d, v) { return affine(c, d, v).replace(/([0-9x])\+/g, "$1 + ").replace(/([0-9x])-(?=[0-9])/g, "$1 − "); }

  /* quadratic-factor question from integer roots */
  function factorTrinomial(root1, root2, lead) {
    lead = lead || 1;
    const b = -lead * (root1 + root2), c = lead * root1 * root2;
    const pad = (k, sign, abs) => (sign > 0 ? " + " + abs : " − " + abs);
    const mid = pad(b, b > 0 ? 1 : -1, Math.abs(b));
    const last = pad(c, c > 0 ? 1 : -1, Math.abs(c));
    const L = lead === 1 ? "" : String(lead);
    return {
      q: `Factor: ${L}x²${mid}x${last}`,
      a: `(${lead === 1 ? "" : lead}(x ${root1 > 0 ? "−" : "+"} ${Math.abs(root1)}))(x ${root2 > 0 ? "−" : "+"} ${Math.abs(root2)})`,
      alt: `${L}x²${mid}x${last} = ${lead === 1 ? "" : lead + "("}(x ${root1 > 0 ? "−" : "+"} ${Math.abs(root1)})(x ${root2 > 0 ? "−" : "+"} ${Math.abs(root2)})${lead === 1 ? "" : ")"}`,
    };
  }

  /* typography pass: real minus signs, no double spaces */
  function tidy(str) {
    return String(str)
      .replace(/(^|[\s(=[{])-(?=[\d.(])/g, "$1−")
      .replace(/--+/g, "−")
      .replace(/\s{2,}/g, " ")
      .trim();
  }
  /* Answer slot: a value plus accepted alternatives */
  function A(value, alts) { return { value: value, alts: (alts || []).filter(Boolean) }; }
  function norm(s) {
    return String(s).replace(/\s+/g, "").replace(/−/g, "-").replace(/[×·]/g, "*")
      .replace(/÷/g, "/").replace(/,/g, "").replace(/\$/g, "").toLowerCase();
  }
  function accepts(ans, input) {
    const got = norm(input);
    if (!got) return false;
    const opts = [ans.value].concat(ans.alts || []);
    return opts.some((o) => norm(o) === got);
  }

  /* ------------------------------------------------------------------
     Number utilities used by many generators
     ------------------------------------------------------------------ */
  const gcd = (a, b) => F.g(a, b);
  const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
  function primes(n) {
    const out = []; let m = n;
    for (let p = 2; p * p <= m; p++) while (m % p === 0) { out.push(p); m /= p; }
    if (m > 1) out.push(m);
    return out;
  }
  const primeStr = (n) => { const c = {}; primes(n).forEach((p) => (c[p] = (c[p] || 0) + 1)); return Object.keys(c).map((p) => (c[p] > 1 ? `${p}^${c[p]}` : p)).join(" × "); };
  const divisors = (n) => { const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; };

  /* ------------------------------------------------------------------
     GENERATORS
     Each: { q, a: A(...), tip } ; rng is passed in so worksheets repeat
     ------------------------------------------------------------------ */
  const G = {};
  const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  /* operand >= 2 in magnitude, signed */
  const nz = (r, lo, hi) => { let v = 0; while (Math.abs(v) < 2) v = ri(r, lo, hi); return v; };
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

  /* --- directed number arithmetic (C1 2, C2 1, A1 1) --- */
  G.addInt = (r) => { const a = nz(r, -15, 15), b = nz(r, -15, 15); return { q: `${a} + (${b})`, a: A(a + b) }; };
  G.subInt = (r) => { const a = nz(r, -15, 15), b = nz(r, -15, 15); return { q: `${a} − (${b})`.replace(/-/g, "−"), a: A(a - b) }; };
  G.mulInt = (r) => { const a = nz(r, -12, 12), b = nz(r, -9, 9); return { q: `${a} × (${b})`.replace(/-/g, "−"), a: A(a * b) }; };
  G.divInt = (r) => { const b = ri(r, 2, 9) * (r() < .5 ? -1 : 1), q0 = ri(r, 2, 12); return { q: `${b * q0} ÷ (${b})`.replace(/-/g, "−"), a: A(q0) }; };
  G.multDivSign = (r) => { const a = ri(r, -9, 9) || 6, b = ri(r, 2, 9); return r() < .5 ? { q: `${a} × ${b}`, a: A(a * b) } : { q: `${a * b} ÷ ${b}`, a: A(a) }; };
  G.abs = (r) => { const a = ri(r, -20, 20) || -7; return { q: `|${a}|`.replace(/-/g, "−"), a: A(Math.abs(a)) }; };
  G.evalInt = (r) => { const x = ri(r, -5, 5) || 2, a = ri(r, 2, 6), b = ri(r, 1, 9); return { q: `Evaluate ${a}x + ${b} when x = ${x}`.replace(/x = -/, "x = −"), a: A(a * x + b) }; };
  G.order = (r) => { const a = ri(r, 2, 6), b = ri(r, 2, 5), c = ri(r, 1, 9); return { q: `${a} + ${b} × ${c}`, a: A(a + b * c), tip: "Multiply before you add." }; };
  G.order2 = (r) => { const a = ri(r, 2, 5), b = ri(r, 2, 4), c = ri(r, 1, 6); return { q: `(${a} + ${b}) × ${c}`, a: A((a + b) * c), tip: "Brackets first." }; };
  G.powers = (r) => { const b = ri(r, 2, 9), e = ri(r, 2, 3); return { q: `${b}^${e}`, a: A(Math.pow(b, e)) }; };
  G.writePower = (r) => { const b = ri(r, 2, 7), e = ri(r, 2, 4); return { q: `Write ${Array(e).fill(b).join(" × ")} as a power.`, a: A(`${b}^${e}`, [`${b}**${e}`]) }; };
  G.roots = (r) => { const n = ri(r, 2, 12); return { q: `√${n * n}`, a: A(n) }; };

  /* --- fraction skills (C1 3, C1 4, C2 2) --- */
  G.simplifyFrac = (r) => { const k = ri(r, 2, 9), n = ri(r, 2, 9), d = n + ri(r, 1, 8); const f = F.mk(n * k, d * k); return { q: `Write ${n * k}/${d * k} in simplest form`, a: A(`${f.n}/${f.d}`, [String(f.n / f.d)]) }; };
  G.equivFrac = (r) => { const n = ri(r, 1, 7), d = n + ri(r, 1, 6), k = ri(r, 2, 6); return { q: `Fill in: ${n}/${d} = ?/${d * k}`, a: A(`${n * k}`) }; };
  G.addFracLike = (r) => { const d = ri(r, 4, 12), a = ri(r, 1, d - 1), b = ri(r, 1, d - 1); const s = F.add(F.mk(a, d), F.mk(b, d)); return { q: `${a}/${d} + ${b}/${d}`, a: A(F.str(s), [F.mixed(s)]) }; };
  G.subFracLike = (r) => { const d = ri(r, 3, 12), b = ri(r, 1, d - 2), a = b + ri(r, 1, d - b - 1); const s = F.sub(F.mk(a, d), F.mk(b, d)); return { q: `${a}/${d} − ${b}/${d}`, a: A(F.str(s), [F.mixed(s)]) }; };
  G.addFracUnlike = (r) => {
    const d1 = pick(r, [2, 3, 4, 5, 6]), d2 = pick(r, [3, 4, 5, 6, 8]);
    const a = ri(r, 1, d1 - 1), b = ri(r, 1, d2 - 1);
    const s = F.add(F.mk(a, d1), F.mk(b, d2));
    return { q: `${a}/${d1} + ${b}/${d2}`, a: A(F.str(s), [F.mixed(s)]), tip: "Use a common denominator." };
  };
  G.mulFrac = (r) => { const a = ri(r, 1, 7), b = ri(r, 2, 9), c = ri(r, 1, 7), d = ri(r, 2, 9); const s = F.mul(F.mk(a, b), F.mk(c, d)); return { q: `${a}/${b} × ${c}/${d}`, a: A(F.str(s), [F.mixed(s)]) }; };
  G.divFrac = (r) => { const a = ri(r, 1, 7), b = ri(r, 2, 9), c = ri(r, 1, 7), d = ri(r, 2, 9); const s = F.div(F.mk(a, b), F.mk(c, d)); return { q: `${a}/${b} ÷ ${c}/${d}`, a: A(F.str(s), [F.mixed(s)]), tip: "Multiply by the reciprocal." }; };
  G.fracToDec = (r) => { const d = pick(r, [2, 4, 5, 8, 10, 20, 25]), n = ri(r, 1, d - 1); return { q: `Write ${n}/${d} as a decimal`, a: A(U.fmt(n / d, 4)) }; };
  G.decToFrac = (r) => { const d = pick(r, [2, 4, 5, 8, 10, 20, 25]), n = ri(r, 1, d - 1); const v = (n / d).toFixed(4).replace(/0+$/, ""); const f = F.mk(n, d); return { q: `Write ${v} as a fraction in simplest form`, a: A(`${f.n}/${f.d}`) }; };
  G.improperMixed = (r) => { const d = ri(r, 2, 9), w = ri(r, 1, 5), n = ri(r, 1, d - 1); return { q: `Write ${w} ${n}/${d} as an improper fraction`, a: A(`${w * d + n}/${d}`) }; };
  G.mixedImproper = (r) => { const d = ri(r, 2, 9), w = ri(r, 1, 5), n = ri(r, 1, d - 1); const f = F.mk(w * d + n, d); return { q: `Write ${w * d + n}/${d} as a mixed number`, a: A(`${w} ${n}/${d}`, [`${w}+${n}/${d}`]) }; };
  G.cmpFrac = (r) => { const a = ri(r, 1, 8), b = ri(r, 2, 9), c = ri(r, 1, 8), d = ri(r, 2, 9); const L = a / b, R = c / d; return { q: `Compare ${a}/${b} and ${c}/${d}: type <, > or =`, a: A(L < R ? "<" : L > R ? ">" : "=") }; };
  G.cmpDecimals = (r) => { const a = (ri(r, 1, 99) / 100).toFixed(2), b = (ri(r, 1, 99) / 100).toFixed(2); return { q: `Compare ${a} and ${b}: type <, > or =`, a: A(+a < +b ? "<" : +a > +b ? ">" : "=") }; };
  G.primeComposite = (r) => { const n = pick(r, [2, 3, 4, 9, 11, 15, 17, 21, 23, 27, 29, 31, 33, 37, 39, 41, 43, 49, 51]); return { q: `Is ${n} prime or composite?`, a: A(divisors(n).length === 2 ? "prime" : "composite") }; };
  G.primeFactor = (r) => { const n = pick(r, [24, 36, 40, 48, 54, 60, 72, 84, 90, 96, 100, 120]); return { q: `Write the prime factorization of ${n}`, a: A(primeStr(n), [primes(n).join("x"), primes(n).join("*")]), tip: "Use a factor tree." }; };
  G.gcf = (r) => { const g = ri(r, 2, 12); let a = g * ri(r, 2, 8), b = g * ri(r, 2, 8); if (a === b) b = g * (a / g === 8 ? 5 : a / g + 1); const v = gcd(a, b); return { q: `Find the GCF of ${a} and ${b}`, a: A(v), tip: v === 1 ? "These are relatively prime." : undefined }; };
  G.lcm = (r) => { const a = ri(r, 4, 16), b = ri(r, 4, 16); return { q: `Find the LCM of ${a} and ${b}`, a: A(lcm(a, b)) }; };
  G.addDecimals = (r) => { const a = ri(r, 1, 99) / 10, b = ri(r, 1, 99) / 10; return { q: `${a.toFixed(1)} + ${b.toFixed(1)}`, a: A(U.fmt(a + b, 2)) }; };
  G.mulDecimals = (r) => { const a = ri(r, 1, 99) / 10, b = ri(r, 1, 9) / 10; return { q: `${a.toFixed(1)} × ${b.toFixed(1)}`, a: A(U.fmt(a * b, 3)) }; };
  G.divDecimals = (r) => { const q0 = ri(r, 1, 40) / 10, b = ri(r, 1, 9) / 10; return { q: `${U.fmt(q0 * b, 3)} ÷ ${b.toFixed(1)}`, a: A(U.fmt(q0, 2)) }; };
  G.estimateSum = (r) => { const near = (n) => Math.round(n / 100) * 100; let a = ri(r, 120, 890), b = ri(r, 120, 890); if (near(a) % 200 === 0 || near(b) % 200 === 0) a += 10; return { q: `Estimate by rounding to the nearest hundred: ${a} + ${b}`, a: A(near(a) + near(b)) }; };
  G.metric = (r) => { const k = pick(r, [1000, 100, 10]); const a = ri(r, 2, 9); const pair = k === 1000 ? ["km", "m"] : k === 100 ? ["m", "cm"] : ["cm", "mm"]; return { q: `Convert ${a} ${pair[0]} to ${pair[1]}`, a: A(a * k) }; };

  /* --- ratio / proportion / percent (C1 5, C1 6, C2 5, C2 6, A1 2) --- */
  G.unitRate = (r) => { const n = ri(r, 2, 9), each = pick(r, [1.25, 1.5, 2, 2.5, 3, 3.5, 4, 5]); const tot = +(n * each).toFixed(2); return { q: `${n} items cost $${tot.toFixed(2)}. Find the cost of one item.`, a: A(U.fmt(each, 2)) }; };
  G.proportion = (r) => { const a = ri(r, 2, 9), b = ri(r, 2, 9), k = ri(r, 2, 7); return { q: `Solve the proportion ${a}/${b} = x/${b * k}`, a: A(a * k) }; };
  G.percentOf = (r) => { const p = pick(r, [5, 10, 15, 20, 25, 40, 50, 60, 75]), n = pick(r, [20, 40, 60, 80, 120, 200, 240, 400]); return { q: `What is ${p}% of ${n}?`, a: A(U.fmt(p * n / 100, 2)) }; };
  G.percentChange = (r) => { const old = pick(r, [20, 25, 40, 50, 80, 100, 200]), pct = pick(r, [10, 20, 25, 50]), up = r() < .5; const nw = up ? old * (1 + pct / 100) : old * (1 - pct / 100); return { q: `Find the percent of change from ${old} to ${U.fmt(nw, 2)} (state increase or decrease)`, a: A(`${up ? "+" : "-"}${pct}%`, [`${pct}% ${up ? "increase" : "decrease"}`, `${pct}%`]) }; };
  G.salesTax = (r) => { const p = pick(r, [20, 40, 50, 80, 120, 200]), t = pick(r, [5, 6, 7, 8, 9]); return { q: `A $${p} item has ${t}% sales tax. Find the total cost.`, a: A(U.fmt(p * (1 + t / 100), 2)) }; };
  G.simpleInterest = (r) => { const P = pick(r, [200, 400, 500, 800, 1000]), rate = pick(r, [2, 3, 4, 5, 6]), t = ri(r, 1, 4); return { q: `Find the simple interest on $${P} at ${rate}% for ${t} years`, a: A(U.fmt(P * rate * t / 100, 2)) }; };
  G.discount = (r) => { const p = pick(r, [20, 40, 50, 60, 80, 120]), d = pick(r, [10, 15, 20, 25, 30]); return { q: `Find the sale price of a $${p} item discounted by ${d}%`, a: A(U.fmt(p * (1 - d / 100), 2)) }; };
  G.pctToDec = (r) => { const p = pick(r, [7, 12, 45, 60, 85, 125, 250]); return { q: `Write ${p}% as a decimal`, a: A(U.fmt(p / 100, 4)) }; };
  G.decToPct = (r) => { const v = pick(r, [0.07, 0.35, 0.6, 0.75, 1.2, 2.5]); return { q: `Write ${v} as a percent`, a: A(U.fmt(v * 100, 2) + "%") }; };
  G.fracToPct = (r) => { const d = pick(r, [2, 4, 5, 8, 10, 20, 25]), n = ri(r, 1, d - 1); return { q: `Write ${n}/${d} as a percent`, a: A(U.fmt((n / d) * 100, 2) + "%") }; };

  /* --- integer / equation solving (A1 2, A1 3, C1 1, C1 11, C2 3) --- */
  G.solveAdd = (r) => { const x = ri(r, -12, 12), b = ri(r, -9, 9); return { q: `Solve: x ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${x + b}`, a: A(x) }; };
  G.solveMul = (r) => { const x = ri(r, -9, 9) || 3, b = ri(r, 2, 9); return { q: `Solve: ${b}x = ${b * x}`, a: A(x) }; };
  G.solveDiv = (r) => { const x = ri(r, 2, 9) || 3, b = ri(r, 2, 9); return { q: `Solve: x/${b} = ${x}`, a: A(x * b) }; };
  G.solveTwoStep = (r) => { const x = ri(r, -8, 8) || 4, a = ri(r, 2, 7), b = ri(r, -9, 9); return { q: `Solve: ${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${a * x + b}`, a: A(x) }; };
  G.solveVarsBoth = (r) => { const x = ri(r, 1, 8), a = ri(r, 3, 8), b = ri(r, 1, 2); const right = (a - b) * x; return { q: `Solve: ${a}x = ${b}x + ${right}`, a: A(x) }; };
  G.solveLiteral = (r) => { return { q: "Solve P = 2l + 2w for w", a: A("(P-2l)/2", ["P/2-l", "(P - 2l)/2", "p/2-l"]), tip: "Undo the operations in reverse order." }; };
  G.ineqAdd = (r) => { const x = ri(r, -9, 9) || 2, b = ri(r, 2, 9); return { q: `Solve: x + ${b} > ${x + b}`, a: A(`x > ${x}`) }; };
  G.ineqMul = (r) => { const x = ri(r, 1, 8), b = ri(r, 2, 9); return { q: `Solve: ${b}x < ${b * x}`, a: A(`x < ${x}`) }; };
  G.ineqDivNeg = (r) => { const x = ri(r, -8, -1), b = ri(r, 2, 8); return { q: `Solve: ${b}x > ${b * x}`, a: A(`x < ${x}`), tip: "Dividing by a positive keeps the sign; here the answer is negative." }; };
  G.ineqTwoStep = (r) => { const x = ri(r, -5, 6) || 2, a = ri(r, 2, 6), b = ri(r, 1, 9); return { q: `Solve: ${a}x + ${b} ≥ ${a * x + b}`, a: A(`x ≥ ${x}`) }; };
  G.checkSolution = (r) => { const x = ri(r, -6, 6), a = ri(r, 2, 6), b = ri(r, -8, 8); const rhs = a * x + b + (r() < .5 ? 0 : 3); return { q: `Is x = ${x} a solution of ${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${rhs}? (yes/no)`, a: A(a * x + b === rhs ? "yes" : "no") }; };
  G.distribute = (r) => { const a = ri(r, 2, 7), b = ri(r, 1, 9), c = ri(r, 1, 9); const bs = b === 1 ? "x" : b + "x"; return { q: `Simplify: ${a}(${bs} + ${c})`, a: A(affine(a * b, a * c), [lin(a * b, a * c)]) }; };
  G.likeTerms = (r) => { const a = ri(r, 2, 9), b = ri(r, 2, 9), c = ri(r, 1, 8); return { q: `Simplify: ${a}x + ${c}x − ${b} + ${b}`, a: A(affine(a + c, 0), []) }; };
  G.combine = (r) => { const a = ri(r, 2, 8), b = ri(r, 2, 8), c = ri(r, 1, 7), d = ri(r, 1, 7); return { q: `Simplify: ${a}x + ${c}y − ${d}x + ${b}y`, a: A(affine(a - d, 0) + (c + b ? (c + b === 1 ? "+y" : "+" + (c + b) + "y") : ""), [affine(a - d, 0) + (c + b ? "+" + (c + b) + "y" : "")]) }; };
  G.evalExpr = (r) => { const x = ri(r, -4, 5), a = ri(r, 2, 6), b = ri(r, -7, 7); return { q: `Evaluate ${a}x² ${b < 0 ? "−" : "+"} ${Math.abs(b)} when x = ${x}`, a: A(a * x * x + b) }; };
  G.translate = (r) => { const n = ri(r, 3, 12), k = ri(r, 2, 7); return { q: `Write "the product of ${k} and a number, increased by ${n}" as an expression (use x)`, a: A(`${k}x+${n}`, [`${k}*x+${n}`, `${n}+${k}x`]) }; };

  /* --- polynomials (A1 7, A1 8, C2 12) --- */
  G.mulMonomials = (r) => { const a = ri(r, 2, 9), b = ri(r, 2, 9), p = ri(r, 2, 5), q = ri(r, 2, 5); return { q: `Multiply: (${a}x^${p})(${b}x^${q})`, a: A(`${a * b}x^${p + q}`, [`${a * b}x**${p + q}`]) }; };
  G.divMonomials = (r) => { const a = ri(r, 2, 9), b = ri(r, 2, 9), p = ri(r, 4, 9), q = ri(r, 1, 3); const c = a * b; const pw = k => (k === 1 ? "x" : k === 0 ? "" : "x^" + k); return { q: `Divide: ${c}x^${p} ÷ ${b}${pw(q)}`, a: A(`${a}${pw(p - q)}`, [`${a}x**${p - q}`]) }; };
  G.powerPower = (r) => { const a = ri(r, 2, 5), p = ri(r, 2, 4), q = ri(r, 2, 3); return { q: `Simplify: (x^${p})^${q}`, a: A(`x^${p * q}`, [`x**${p * q}`]) }; };
  G.powerProduct = (r) => { const a = ri(r, 2, 5), b = ri(r, 2, 5), p = ri(r, 2, 4); return { q: `Simplify: (${a}x^${p})²`, a: A(`${a * a}x^${2 * p}`, [`${a * a}x**${2 * p}`]) }; };
  G.zeroExponent = (r) => { const a = ri(r, 2, 9); return { q: `Evaluate ${a}^0`, a: A(1) }; };
  G.negExponent = (r) => { const b = ri(r, 2, 5), e = ri(r, 1, 3); const den = Math.pow(b, e); return { q: `Write ${b}^(-${e}) as a fraction`, a: A(`1/${den}`) }; };
  G.sciNotation = (r) => { const a = ri(r, 1, 9), b = ri(r, 1, 9); const n = a * 1000 + b * 100; return { q: `Write ${n} in scientific notation`, a: A(`${a}.${b} × 10^3`, [`${a}.${b}*10^3`, `${a}.${b}x10^3`]) }; };
  G.standardForm = (r) => { const a = ri(r, 1, 9), b = ri(r, 1, 9), e = ri(r, 3, 5); return { q: `Write ${a}.${b} × 10^${e} in standard form`, a: A(Number(`${a}.${b}e${e}`)) }; };
  G.classifyPoly = (r) => { const deg = ri(r, 1, 3); const names = { 1: "linear", 2: "quadratic", 3: "cubic" }; return { q: `Classify ${deg === 1 ? "3x + 2" : deg === 2 ? "2x² − 5x + 1" : "x³ − 4x"} by degree`, a: A(names[deg]) }; };
  G.degreeMono = (r) => { const a = ri(r, 2, 9), p = ri(r, 1, 6); return { q: `Find the degree of ${p === 1 ? a + "x" : a + "x^" + p}`, a: A(p) }; };
  G.addPoly = (r) => { const a = ri(r, 2, 7), b = ri(r, 2, 7), c = ri(r, 1, 9), d = ri(r, 1, 9); return { q: `Add: (${a}x + ${c}) + (${b}x + ${d})`, a: A(affine(a + b, c + d), [lin(a + b, c + d)]) }; };
  G.subPoly = (r) => { const a = ri(r, 3, 9), b = ri(r, 1, 6), c = ri(r, 1, 9), d = ri(r, 1, 9); return { q: `Subtract: (${a}x + ${c}) − (${b}x + ${d})`, a: A(affine(a - b, c - d), [lin(a - b, c - d)]) }; };
  G.mulPolyMono = (r) => { const a = ri(r, 2, 6), b = ri(r, 1, 9), c = ri(r, 1, 9); return { q: `Multiply: ${a}x(${b}x + ${c})`, a: A(`${a * b}x^2+${a * c}x`, [`${a * b}x**2+${a * c}x`]) }; };
  G.mulBinomials = (r) => { const p = ri(r, 1, 6), q = ri(r, 1, 6); const b = p + q, c = p * q; return { q: `Multiply: (x + ${p})(x + ${q})`, a: A(`x^2+${b}x+${c}`, [`x**2+${b}x+${c}`]) }; };
  G.specialProduct = (r) => { const a = ri(r, 2, 7); return { q: `Expand: (x + ${a})²`, a: A(`x^2+${2 * a}x+${a * a}`, [`x**2+${2 * a}x+${a * a}`]) }; };
  G.diffSquares = (r) => { const a = ri(r, 2, 9); return { q: `Factor: x² − ${a * a}`, a: A(`(x+${a})(x-${a})`, [`(x - ${a})(x + ${a})`, `(x+${a})(x−${a})`]) }; };

  /* --- factoring (A1 8) --- */
  G.factorGCF = (r) => { const g = ri(r, 2, 9), a = ri(r, 2, 7), b = ri(r, 2, 7); return { q: `Factor out the GCF: ${g * a}x + ${g * b}`, a: A(`${g}(${a}x+${b})`, [`${g}(${a}x + ${b})`]) }; };
  G.factorTrinomialPos = (r) => { const p = ri(r, 1, 6), q = ri(r, 1, 6); const T = factorTrinomial(-p, -q); return { q: T.q, a: A(`(x-${p})(x-${q})`, [`(x - ${p})(x - ${q})`, T.a]) }; };
  G.factorTrinomialNeg = (r) => { const p = ri(r, 1, 6), q = -ri(r, 1, 6); const T = factorTrinomial(-p, -q); return { q: T.q, a: A(`(x-${p})(x+${Math.abs(q)})`, [`(x - ${p})(x + ${Math.abs(q)})`, T.a]) }; };
  G.factorLead = (r) => { const a = pick(r, [2, 3]), p = ri(r, 1, 4), q = ri(r, 1, 4); const T = factorTrinomial(-p, -q, a); return { q: T.q, a: A(`${a}(x-${p})(x-${q})`, [`${a}(x - ${p})(x - ${q})`, T.a]) }; };
  G.factorGrouping = (r) => { const a = ri(r, 2, 5), b = ri(r, 2, 5); const mid = a + b, last = a * b; return { q: `Factor by grouping: x³ + ${mid}x² + ${last}x`, a: A(`x(x+${a})(x+${b})`, [`x(x + ${a})(x + ${b})`]) }; };

  /* --- quadratics (A1 9) --- */
  G.zeroProduct = (r) => { const p = ri(r, 1, 8), q = -ri(r, 1, 8); return { q: `Solve: (x − ${p})(x ${q < 0 ? "−" : "+"} ${Math.abs(q)}) = 0 (list both values)`, a: A(`${p},${-q}`, [`${-q},${p}`]) }; };
  G.quadFormula = (r) => { const p = ri(r, 1, 6), q = ri(r, 1, 6); const b = p + q, c = p * q; return { q: `Solve x² − ${b}x + ${c} = 0 (list both values)`, a: A(`${p},${q}`, [`${q},${p}`]) }; };
  G.discriminant = (r) => { const a = ri(r, 1, 3), b = ri(r, -6, 6), c = ri(r, -9, 9); const d = b * b - 4 * a * c; return { q: `Find the discriminant of ${poly([a, b, c])}`, a: A(d), tip: "b² − 4ac tells you how many real roots." }; };
  G.vertexAxis = (r) => { const h = ri(r, -5, 5), k = ri(r, -9, 9); const hs = h < 0 ? `(−${Math.abs(h)})` : `− ${h}`; const ks = k < 0 ? `− ${Math.abs(k)}` : `+ ${k}`; return { q: `For y = (x ${hs})² ${ks}, what is the vertex? (x, y)`, a: A(`${h},${k}`, [`(${h},${k})`, `x=${h},y=${k}`]) }; };
  G.direction = (r) => { const a = ri(r, 2, 6) * (r() < .5 ? 1 : -1); return { q: `Does y = ${a}x² ${a > 0 ? "+ 3x" : "− 3x"} open up or down?`, a: A(a > 0 ? "up" : "down") }; };
  G.squareRootSolve = (r) => { const n = ri(r, 2, 12); return { q: `Solve x² = ${n * n} (give the positive value)`, a: A(n) }; };
  G.completeSquare = (r) => { const h = ri(r, 1, 8), k = ri(r, 1, 9); const b = -2 * h, c = h * h + k; return { q: `Write x² ${b < 0 ? "− " + Math.abs(b) : "+ " + b}x + ${c} in the form (x − h)² + k`, a: A(`(x-${h})^2+${k}`, [`(x - ${h})^2 + ${k}`, `(x−${h})²+${k}`, `(x−${h})² + ${k}`]) }; };

  /* --- functions, slope, lines (A1 4, A1 5, C2 7) --- */
  G.evalFunction = (r) => { const a = ri(r, 2, 5), b = ri(r, -7, 7), x = ri(r, -4, 5); return { q: `If f(x) = ${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}, find f(${x})`, a: A(a * x + b) }; };
  G.slopeTwoPoints = (r) => { const x1 = ri(r, 0, 4), y1 = ri(r, 0, 6), dx = ri(r, 1, 5), dy = ri(r, -5, 5) || 3; const s = F.mk(dy, dx); return { q: `Find the slope through (${x1}, ${y1}) and (${x1 + dx}, ${y1 + dy})`, a: A(F.str(s), [U.fmt(F.val(s), 2)]) }; };
  G.slopeFromEq = (r) => { const m = ri(r, -5, 5) || 2, b = ri(r, -9, 9); return { q: `Find the slope of y = ${m}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}`, a: A(m) }; };
  G.intercepts = (r) => { const a = ri(r, 2, 6), b = ri(r, 2, 6), c = a * b; return { q: `Find the y-intercept of ${a}x + ${b}y = ${c}`, a: A(a), tip: "Set x = 0 and solve for y." }; };
  G.lineTwoPoints = (r) => { const m = ri(r, 2, 5), b = ri(r, -6, 6); const x1 = 1, y1 = m + b, x2 = 2, y2 = 2 * m + b; const eq = bt => `y=${m}x` + (bt > 0 ? `+${bt}` : bt < 0 ? `-${Math.abs(bt)}` : ''); return { q: `Write y = mx + b for the line through (${x1}, ${y1}) and (${x2}, ${y2})`.replace(/\(-\d/g, '(−$1'.replace('(−','(−')), a: A(eq(b), [eq(b).replace(/=-?\d*x/, m0 => m0).replace('x-','x − '), `${m}x${b > 0 ? '+' : '-'}${Math.abs(b)}`]) }; };
  G.parallel = (r) => { const m = ri(r, 2, 6), b = ri(r, 1, 9); return { q: `What slope is parallel to y = ${m}x + ${b}?`, a: A(m) }; };
  G.perpendicular = (r) => { const m = ri(r, 2, 6); return { q: `What slope is perpendicular to a line of slope ${m}?`, a: A(`-1/${m}`, [U.fmt(-1 / m, 3)]) }; };
  G.onGraph = (r) => { const m = ri(r, 2, 4), b = ri(r, -5, 5), x = ri(r, -3, 4); const y = m * x + b; return { q: `Is (${x}, ${y}) on the graph of y = ${m}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}? (yes/no)`, a: A("yes") }; };
  G.arithmeticSeq = (r) => { const a = ri(r, 1, 9), d = ri(r, 2, 7), n = ri(r, 5, 12); const v = a + (n - 1) * d; return { q: `Find the ${n}th term of ${a}, ${a + d}, ${a + 2 * d}, …`, a: A(v) }; };
  G.tableEquation = (r) => { const m = ri(r, 2, 5), b = ri(r, 0, 8); return { q: `A table shows (1, ${m + b}), (2, ${2 * m + b}), (3, ${3 * m + b}). Write the rule as y = mx + b.`, a: A(`y=${m}x+${b}`, [`y = ${m}x + ${b}`, `${m}x+${b}`]) }; };
  G.isFunction = (r) => { const x = ri(r, 1, 4); const yes = r() < .5; const set = yes ? `(${x}, 1), (${x + 1}, 2), (${x + 2}, 3)` : `(${x}, 1), (${x}, 2), (${x + 2}, 3)`; return { q: `Is this relation a function? ${set}`, a: A(yes ? "yes" : "no"), tip: "Each input must map to exactly one output." }; };

  /* --- inequalities/graphing systems (A1 3, A1 6) --- */
  G.solutionsOfSystem = (r) => { const x = ri(r, 1, 5), y = ri(r, 1, 5); return { q: `Is (${x}, ${y}) a solution of x + y = ${x + y} and x − y = ${x - y}? (yes/no)`, a: A("yes") }; };
  G.substitution = (r) => { const x = ri(r, 1, 6), y = ri(r, 2, 5); return { q: `Solve by substitution: y = ${y}, x + y = ${x + y}. Give x.`, a: A(x) }; };
  G.eliminationAdd = (r) => { const x = ri(r, 1, 6), y = ri(r, 1, 6); return { q: `Solve: x + y = ${x + y} and x − y = ${x - y}. Give x.`, a: A(x) }; };
  G.systemsNoSolution = (r) => { const m = ri(r, 2, 5), b = ri(r, 1, 6); return { q: `How many solutions does y = ${m}x + ${b} and y = ${m}x + ${b + 2} have? (one/none/infinite)`, a: A("none") }; };
  G.classifySystem = (r) => { const m = ri(r, 2, 5), b = ri(r, 1, 6); return { q: `Are y = ${m}x + ${b} and y = ${m}x + ${b} the same line? (one/none/infinite solutions)`, a: A("infinite", ["infinitely many"]) }; };
  G.compoundIneq = (r) => { const a = ri(r, -5, 2), b = a + ri(r, 3, 8); return { q: `Write the compound inequality for x between ${a} and ${b} inclusive`, a: A(`${a}≤x≤${b}`, [`${a}<=x<=${b}`, `${a} ≤ x ≤ ${b}`]) }; };

  /* --- geometry & measure (C2 9, C2 10) --- */
  G.circleArea = (r) => { const rad = ri(r, 2, 9); return { q: `Find the area of a circle with radius ${rad} (use π, 2 d.p.)`, a: A(U.fmt(Math.PI * rad * rad, 2)) }; };
  G.circleCircum = (r) => { const rad = ri(r, 2, 9); return { q: `Find the circumference of a circle with radius ${rad} (use π, 2 d.p.)`, a: A(U.fmt(2 * Math.PI * rad, 2)) }; };
  G.rectPerimeter = (r) => { const w = ri(r, 2, 12), h = ri(r, 2, 12); return { q: `Find the perimeter of a ${w} by ${h} rectangle`, a: A(2 * (w + h)) }; };
  G.rectArea = (r) => { const w = ri(r, 2, 12), h = ri(r, 2, 12); return { q: `Find the area of a ${w} by ${h} rectangle`, a: A(w * h) }; };
  G.triangleArea = (r) => { const b = ri(r, 2, 12), h = ri(r, 2, 12); return { q: `Find the area of a triangle with base ${b} and height ${h}`, a: A(U.fmt(b * h / 2, 2)) }; };
  G.boxVolume = (r) => { const a = ri(r, 2, 8), b = ri(r, 2, 8), c = ri(r, 2, 8); return { q: `Find the volume of a ${a} × ${b} × ${c} rectangular prism`, a: A(a * b * c) }; };
  G.boxSurface = (r) => { const a = ri(r, 2, 7), b = ri(r, 2, 7), c = ri(r, 2, 7); return { q: `Find the surface area of a ${a} × ${b} × ${c} rectangular prism`, a: A(2 * (a * b + a * c + b * c)) }; };
  G.cylVolume = (r) => { const rad = ri(r, 2, 6), h = ri(r, 2, 9); return { q: `Find the volume of a cylinder, radius ${rad} and height ${h} (use π, 2 d.p.)`, a: A(U.fmt(Math.PI * rad * rad * h, 2)) }; };
  G.sphereVolume = (r) => { const rad = pick(r, [3, 6, 9, 12]); return { q: `Find the volume of a sphere with radius ${rad} (use π, 2 d.p.)`, a: A(U.fmt((4 / 3) * Math.PI * rad ** 3, 2)) }; };
  G.sphereSurface = (r) => { const rad = pick(r, [3, 5, 6, 9]); return { q: `Find the surface area of a sphere with radius ${rad} (use π, 2 d.p.)`, a: A(U.fmt(4 * Math.PI * rad * rad, 2)) }; };
  G.cylSurface = (r) => { const rad = ri(r, 2, 6), h = ri(r, 2, 9); return { q: `Find the surface area of a cylinder, radius ${rad} and height ${h} (use π, 2 d.p.)`, a: A(U.fmt(2 * Math.PI * rad * (rad + h), 2)) }; };
  G.pyth = (r) => { const t = pick(r, [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]]); return { q: `A right triangle has legs ${t[0]} and ${t[1]}. Find the hypotenuse.`, a: A(t[2]) }; };

  /* --- data & probability (C1 7, C1 8, C2 11) --- */
  G.mean = (r) => { const n = ri(r, 4, 6); const arr = Array.from({ length: n }, () => ri(r, 1, 20)); const s = arr.reduce((a, b) => a + b, 0); return { q: `Find the mean of ${arr.join(", ")}`, a: A(U.fmt(s / n, 2)) }; };
  G.median = (r) => { const n = 5; const arr = Array.from({ length: n }, () => ri(r, 1, 30)).sort((a, b) => a - b); return { q: `Find the median of ${arr.join(", ")}`, a: A(arr[2]) }; };
  G.mode = (r) => { const a = ri(r, 1, 9), b = ri(r, 10, 15); const arr = U.shuffle([a, a, a, b, b]); return { q: `Find the mode of ${arr.join(", ")}`, a: A(a) }; };
  G.range = (r) => { const arr = Array.from({ length: 6 }, () => ri(r, 1, 40)); const lo = Math.min(...arr), hi = Math.max(...arr); return { q: `Find the range of ${arr.join(", ")}`, a: A(hi - lo) }; };
  G.probDice = (r) => { const t = ri(r, 2, 12); const cnt = [0, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1][t]; return { q: `Two dice are rolled. P(sum = ${t}) as a fraction`, a: A(F.str(F.mk(cnt, 36))) }; };
  G.probSimple = (r) => { const n = pick(r, [4, 5, 6, 8, 10]), k = ri(r, 1, n - 1); return { q: `A bag has ${n} counters, ${k} are red. P(red) as a fraction`, a: A(F.str(F.mk(k, n))) }; };
  G.probComplement = (r) => { const n = pick(r, [4, 5, 8, 10]), k = ri(r, 1, n - 1); return { q: `P(red) = ${F.str(F.mk(k, n))}. Find P(not red)`, a: A(F.str(F.mk(n - k, n))) }; };
  G.probSpinner = (r) => { const n = pick(r, [4, 5, 6, 8]); return { q: `A spinner has ${n} equal sections. P(an odd number) as a fraction`, a: A(F.str(F.mk(Math.ceil(n / 2), n))) }; };
  G.likelihood = (r) => { const k = pick(r, [0, 1, 3, 4, 6]); const words = { 0: "impossible", 1: "unlikely", 3: "unlikely", 5: "likely", 6: "certain" }; return { q: `A bag has 6 counters, ${k} blue. How likely is blue? (impossible/unlikely/likely/certain)`, a: A(words[k]) }; };

  /* --- exponents / radicals / rational (A1 10, A1 11) --- */
  G.simplifyRoot = (r) => { const k = ri(r, 2, 5), n = ri(r, 2, 9); return { q: `Simplify √${k * k * n} (give a√b form)`, a: A(`${k}√${n}`, [`${k}sqrt(${n})`]) }; };
  G.multiplyRoots = (r) => { const a = ri(r, 2, 9), b = ri(r, 2, 9); const p = a * b; const sq = Math.floor(Math.sqrt(p)); return { q: `Simplify √${a} × √${b}`, a: A(Number.isInteger(Math.sqrt(p)) ? String(Math.sqrt(p)) : `${sq}√${p / (sq * sq)}`) }; };
  G.rationalize = (r) => { const n = pick(r, [2, 3, 5, 7]); return { q: `Rationalise the denominator: 1/√${n}`, a: A(`√${n}/${n}`, [`sqrt(${n})/${n}`]) }; };
  G.expGrowth = (r) => { const a = ri(r, 2, 5), t = ri(r, 2, 4), k = pick(r, [2, 3]); return { q: `A colony starts with ${a * 100} cells and ${k === 2 ? "doubles" : "triples"} every hour. How many after ${t} hours?`, a: A(a * 100 * Math.pow(k, t)) }; };
  G.excluded = (r) => { const a = ri(r, 1, 9); return { q: `What value of x makes (x + ${a})/(x − ${a}) undefined?`, a: A(a) }; };
  G.simplifyRational = (r) => { const a = ri(r, 2, 9), k = ri(r, 2, 5); return { q: `Simplify ${a * k}x / ${k}y`, a: A(`${a}x/y`) }; };
  G.asymptote = (r) => { const a = ri(r, 1, 9); return { q: `What is the vertical asymptote of y = 1/(x − ${a})? (x = ?)`, a: A(`x=${a}`, [`${a}`]) }; };
  G.divPolyMono = (r) => { const a = ri(r, 2, 6), b = ri(r, 2, 6), c = ri(r, 2, 6); return { q: `Divide: (${a * b}x² + ${c * b}x) ÷ ${b}x`, a: A(affine(a, c), [lin(a, c)]) }; };
  G.lcdMono = (r) => { const a = ri(r, 2, 9), b = ri(r, 2, 9); return { q: `Find the LCM of ${a}x and ${b}x²`, a: A(`${lcm(a, b)}x^2`, [`${lcm(a, b)}x**2`]) }; };
  G.inverseVariation = (r) => { const k = pick(r, [24, 36, 40, 48, 60]), x1 = pick(r, [2, 3, 4, 6]), x2 = pick(r, [8, 10, 12]); return { q: `y varies inversely with x. When x = ${x1}, y = ${k / x1}. Find y when x = ${x2}.`, a: A(U.fmt(k / x2, 3)) }; };

  /* --- transformations / sequences --- */
  G.extendPattern = (r) => { const a = ri(r, 2, 9), d = ri(r, 2, 6); return { q: `Continue the pattern: ${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, … what is the next term?`, a: A(a + 4 * d) }; };
  G.geoSeq = (r) => { const a = ri(r, 2, 4), k = ri(r, 2, 4), n = ri(r, 4, 6); return { q: `Find the ${n}th term of ${a}, ${a * k}, ${a * k * k}, …`, a: A(a * Math.pow(k, n - 1)) }; };
  G.scaleFactor = (r) => { const k = ri(r, 2, 4), w = ri(r, 2, 6), h = ri(r, 3, 7); return { q: `A ${w} by ${h} rectangle is enlarged by scale factor ${k}. What is the new width?`, a: A(w * k) }; };
  G.indirect = (r) => { const h1 = ri(r, 2, 6), s1 = ri(r, 2, 5), s2 = ri(r, 3, 8); return { q: `A ${h1} m pole casts a ${s1} m shadow. At the same time a building casts a ${s2} m shadow. Height of the building? (1 d.p.)`, a: A(U.fmt(h1 * s2 / s1, 1)) }; };
  G.averageSpeed = (r) => { const d = ri(r, 3, 12) * 10, t = ri(r, 2, 5); return { q: `A car travels ${d} km in ${t} hours. Find its average speed in km/h.`, a: A(U.fmt(d / t, 2)) }; };

  /* --- word / application problems, one per chapter theme ---------------- */
  G.appWord = (r) => {
    const kind = pick(r, ["linear", "percent", "rate", "area", "money", "proportion", "average", "unit"]);
    if (kind === "linear") {
      const fee = ri(r, 3, 12) * 5, per = ri(r, 2, 9), n = ri(r, 3, 9);
      return { q: `A repair shop charges $${fee} plus $${per} per hour. What is the cost of a ${n}-hour job?`, a: A(fee + per * n) };
    }
    if (kind === "percent") {
      const n = pick(r, [40, 60, 80, 120, 200, 240]), pct = pick(r, [10, 15, 20, 25, 30, 40]);
      return { q: `A jacket costs $${n}. What is the price after a ${pct}% discount?`, a: A(U.fmt(n * (1 - pct / 100), 2)) };
    }
    if (kind === "rate") {
      const t = ri(r, 2, 6), u = ri(r, 3, 12), d = t * 5 + u;
      return { q: `A cyclist rides ${d} km in ${t} hours. What is the average speed in km/h?`, a: A(U.fmt(d / t, 2)) };
    }
    if (kind === "area") {
      const w = ri(r, 3, 12), h = ri(r, 3, 12);
      return { q: `A garden is ${w} m long and ${h} m wide. How many square metres of turf are needed?`, a: A(w * h) };
    }
    if (kind === "money") {
      const n = ri(r, 2, 8), each = pick(r, [1.5, 2, 2.5, 3, 3.5]), paid = 20;
      const tot = +(n * each).toFixed(2);
      return { q: `${n} notebooks cost $${each.toFixed(2)} each. You pay with $${paid}. How much change?`, a: A(U.fmt(paid - tot, 2)) };
    }
    if (kind === "proportion") {
      const k = ri(r, 2, 5), a = ri(r, 2, 6); let b = ri(r, 2, 6); if (b === a) b = a === 6 ? 3 : a + 1;
      return { q: `A recipe for ${a} people uses ${a * k} g of rice. How much for ${b} people?`, a: A(k * b) };
    }
    if (kind === "average") {
      const n = ri(r, 3, 5), each = ri(r, 60, 90);
      return { q: `${n} pupils each score ${each} in a test. What is the mean score?`, a: A(each) };
    }
    const p = ri(r, 3, 9), pack = ri(r, 2, 5);
    return { q: `A pack of ${pack} pens costs $${(pack * p / 10).toFixed(2)}. What is the cost of one pen?`, a: A(U.fmt(p / 10, 2)) };
  };
  G.appWord2 = (r) => {
    const kind = pick(r, ["solve", "ineq", "system", "sequence", "volume", "prob"]);
    if (kind === "solve") {
      const n = ri(r, 2, 12), mult = ri(r, 2, 7), plus = ri(r, 3, 15);
      return { q: `${plus} more than ${mult} times a number is ${mult * n + plus}. Find the number.`, a: A(n) };
    }
    if (kind === "ineq") {
      const n = ri(r, 2, 9), cap = ri(r, 20, 40);
      return { q: `A lift carries up to ${cap} kg. A box weighs ${n} kg. How many boxes fit? (whole number)`, a: A(Math.floor(cap / n)) };
    }
    if (kind === "system") {
      const a = ri(r, 2, 6), b = ri(r, 2, 6);
      return { q: `Tickets cost $${a} for a child and $${b} for an adult. A family of 2 adults and 3 children pays how much?`, a: A(2 * b + 3 * a) };
    }
    if (kind === "sequence") {
      const st0 = ri(r, 2, 8), d = ri(r, 2, 6), n = ri(r, 5, 10);
      return { q: `A pattern starts at ${st0} and adds ${d} each time. What is the ${n}th term?`, a: A(st0 + (n - 1) * d) };
    }
    if (kind === "volume") {
      const a = ri(r, 2, 8), b = ri(r, 2, 8), c = ri(r, 2, 8);
      return { q: `A fish tank is ${a} m by ${b} m by ${c} m. What is its volume in cubic metres?`, a: A(a * b * c) };
    }
    const n = pick(r, [5, 8, 10, 12, 20]), k = ri(r, 1, n - 1);
    return { q: `A bag holds ${n} marbles, ${k} of them blue. What is the probability of drawing blue, as a fraction?`, a: A(F.str(F.mk(k, n))) };
  };

  /* ------------------------------------------------------------------
     SKILL -> generator mapping.   Keys are the skill titles recovered
     from the .bnk metadata (sans the "1-2.3 " prefix).
     ------------------------------------------------------------------ */
  const MAP = {
    "Adding Real Numbers": G.addInt,
    "Subtracting Real Numbers": G.subInt,
    "Multiplying and Dividing Signed Numbers": G.multDivSign,
    "Multiplying and Dividing with Zero": G.mulInt,
    "Evaluating Powers": G.powers,
    "Writing Powers": G.writePower,
    "Writing Powers for Geometric Models": G.writePower,
    "Finding Roots": G.roots,
    "Classifying Real Numbers": G.primeComposite,
    "Simplifying Numerical Expressions": G.order,
    "Combining Like Terms": G.likeTerms,
    "Evaluating Algebraic Expressions": G.evalExpr,
    "Translating from Algebra to Words": G.translate,
    "Translating from Words to Algebra": G.translate,
    "Dividing with Fractions": G.divFrac,

    "Finding Unit Rates": G.unitRate,
    "Percent Problems": G.percentOf,
    "Solving Proportions": G.proportion,
    "Solving Two-Step Equations": G.solveTwoStep,
    "Solving Equations by Using Multiplication or Division": G.solveMul,
    "Solving Formulas for a Variable": G.solveLiteral,
    "Solving Literal Equations for a Variable": G.solveLiteral,
    "Simplifying Before Solving Equations": G.solveTwoStep,
    "Infinitely Many Solutions or No Solutions": G.systemsNoSolution,
    "Scale Drawings and Scale Models": G.scaleFactor,
    "Using Ratios": G.proportion,

    "Graphing Inequalities": G.ineqAdd,
    "Identifying Solutions of Inequalities": G.ineqTwoStep,
    "Simplifying Before Solving Inequalities": G.ineqTwoStep,
    "Simplifying Each Side Before Solving": G.ineqTwoStep,
    "Solving Multi-Step Inequalities": G.ineqTwoStep,
    "Using Addition and Subtraction to Solve Inequalities": G.ineqAdd,
    "Writing an Inequality from a Graph": G.compoundIneq,

    "Evaluating Functions": G.evalFunction,
    "Graphing Functions": G.evalFunction,
    "Identifying Arithmetic Sequences": G.arithmeticSeq,
    "Identifying Correlations": G.isFunction,
    "Identifying Functions": G.isFunction,
    "Using a Table to Write an Equation": G.tableEquation,
    "Writing Functions": G.tableEquation,

    "Describing Slope": G.slopeFromEq,
    "Determining Whether a Point is on a Graph": G.onGraph,
    "Finding Intercepts": G.intercepts,
    "Finding Slope by Using the Slope Formula": G.slopeTwoPoints,
    "Finding Slope from a Graph": G.slopeTwoPoints,
    "Finding Slope from an Equation": G.slopeFromEq,
    "Identifying Parallel Lines": G.parallel,
    "Identifying Perpendicular Lines": G.perpendicular,
    "Using Two Points to Write an Equation": G.lineTwoPoints,
    "Writing Equations of Parallel and Perpendicular Lines": G.perpendicular,

    "Classifying Systems of Linear Equations": G.classifySystem,
    "Elimination Using Addition": G.eliminationAdd,
    "Elimination Using Subtraction": G.eliminationAdd,
    "Elimination Using Multiplication First": G.eliminationAdd,
    "Identifying Solutions of Systems": G.solutionsOfSystem,
    "Identifying Solutions of Systems of Linear Inequalities": G.solutionsOfSystem,
    "Solving a System of Linear Equations by Substitution": G.substitution,
    "Systems with Infinitely Many Solutions": G.classifySystem,
    "Systems with No Solution": G.systemsNoSolution,
    "Using the Distributive Property": G.distribute,

    "Adding Polynomials": G.addPoly,
    "Adding and Subtracting Monomials": G.mulMonomials,
    "Classifying Polynomials": G.classifyPoly,
    "Comparing and Ordering Numbers in Scientific Notation": G.standardForm,
    "Dividing Numbers in Scientific Notation": G.sciNotation,
    "Evaluating Expressions with Zero and Negative Exponents": G.negExponent,
    "Evaluating Powers of 10": G.powers,
    "Finding Negative Powers of Quotients": G.negExponent,
    "Finding Positive Powers of Quotients": G.powerProduct,
    "Finding Powers of Powers": G.powerPower,
    "Finding Powers of Products": G.powerProduct,
    "Finding Products in the Form (a + b)^2": G.specialProduct,
    "Finding Products of Powers": G.mulMonomials,
    "Finding Quotients of Powers": G.divMonomials,
    "Finding the Degree of a Monomial": G.degreeMono,
    "Identifying Roots of Polynomials": G.zeroProduct,
    "Multiplying Binomials": G.mulBinomials,
    "Multiplying Monomials": G.mulMonomials,
    "Multiplying Polynomials": G.mulBinomials,
    "Multiplying a Polynomial by a Monomial": G.mulPolyMono,
    "Multiplying by Powers of 10": G.standardForm,
    "Simplify Expressions with Zero and Negative Exponents": G.zeroExponent,
    "Simplifying b^(1/n)": G.roots,
    "Subtracting Polynomials": G.subPoly,
    "Using Properties of Exponents to Simplify Expressions": G.powerPower,
    "Writing Polynomials in Standard Form": G.classifyPoly,
    "Writing Powers of 10": G.writePower,
    "Zero and Negative Exponents": G.zeroExponent,

    "Determining Whether an Expression Is Completely Factored": G.factorGCF,
    "Evaluating Polynomials": G.evalExpr,
    "Factoring Out a Common Binomial Factor": G.factorGCF,
    "Factoring Trinomials": G.factorTrinomialPos,
    "Factoring ax^2 + bx + c": G.factorLead,
    "Factoring by GCF and Recognizing Patterns": G.factorGCF,
    "Factoring by Grouping": G.factorGrouping,
    "Factoring by Multiple Methods": G.factorLead,
    "Factoring by Using the GCF": G.factorGCF,
    "Factoring with Opposites": G.factorTrinomialNeg,
    "Factoring x^2 + bx + c When c Is Negative": G.factorTrinomialNeg,
    "Factoring x^2 + bx + c When c Is Positive": G.factorTrinomialPos,
    "Finding the GCF of Monomials": G.factorGCF,
    "Finding the GCF of Numbers": G.gcf,
    "Recognizing and Factoring the Difference of Two Squares": G.diffSquares,
    "Recognizing and Factoring the Perfect-Square Trinomials": G.specialProduct,
    "Writing Prime Factorizations": G.primeFactor,

    "Approximating Solutions": G.squareRootSolve,
    "Completing the Square": G.completeSquare,
    "Finding Domain and Range": G.vertexAxis,
    "Finding the Vertex of a Parabola": G.vertexAxis,
    "Identifying the Direction of a Parabola": G.direction,
    "Solving Quadratic Equations by Factoring": G.quadFormula,
    "Solving Quadratic Equations by Graphing": G.quadFormula,
    "Solving Using Different Methods": G.quadFormula,
    "Solving x^2+bx=c by Completing the Square": G.completeSquare,
    "Using Square Roots to Solve x^2 = a": G.squareRootSolve,
    "Using the Discriminant": G.discriminant,
    "Using the Quadratic Formula": G.quadFormula,
    "Using the Zero Product Property": G.zeroProduct,

    "Divide a Polynomial by a Binomial": G.divPolyMono,
    "Dividing a Polynomial by a Monomial": G.divPolyMono,
    "Extraneous Solutions": G.excluded,
    "Identifying Asymptotes": G.asymptote,
    "Identifying Excluded Values": G.excluded,
    "Identifying an Inverse Variation": G.inverseVariation,
    "Identifying the Least Common Multiple": G.lcdMono,
    "Long Division with a Remainder": G.divPolyMono,
    "Multiplying Rational Expressions": G.simplifyRational,
    "Multiplying Rational Expressions Containing Polynomials": G.simplifyRational,
    "Polynomial Long Division": G.divPolyMono,
    "Simplifying Rational Expressions": G.simplifyRational,
    "Simplifying Rational Expressions Using Opposite Binomials": G.simplifyRational,
    "Subtracting Rational Expressions with Like Denominators": G.simplifyRational,
    "Using the Product Rule": G.powerPower,

    "Evaluating Square-Root Functions": G.simplifyRoot,
    "Evaluating an Exponential Function": G.expGrowth,
    "Exponential Decay": G.expGrowth,
    "Exponential Growth": G.expGrowth,
    "Extending Geometric Sequences": G.geoSeq,
    "Graphing Data to Choose a Model": G.tableEquation,
    "Multiplying Square Roots": G.multiplyRoots,
    "Rationalizing the Denominator": G.rationalize,
    "Simplifying Before Adding or Subtracting": G.multiplyRoots,
    "Simplifying Square-Root Expressions": G.simplifyRoot,
    "Solving Radical Equations by Multiplying or Dividing": G.squareRootSolve,
    "Solving Radical Equations with Square Roots on Both Sides": G.squareRootSolve,
    "Solving Simple Radical Equations": G.squareRootSolve,
    "Using Patterns to Choose a Model": G.arithmeticSeq,

    /* Course 1 — algebraic reasoning & integers */
    "Evaluating Expressions Involving Order of Operations": G.order,
    "Expressing Whole Numbers as Powers": G.writePower,
    "Identifying Properties of Addition and Multiplication": G.distribute,
    "Identifying and Extending Number Patterns": G.extendPattern,
    "Solving Equations by Adding": G.solveAdd,
    "Solving Equations by Subtracting": G.solveAdd,
    "Solving Equations by Multiplying": G.solveMul,
    "Solving Equations by Dividing": G.solveMul,
    "Translating Real-World Problems into Algebraic Expressions": G.translate,
    "Translating Verbal Expressions into Algebraic Expressions": G.translate,
    "Using Properties to Simplify Expressions": G.combine,
    "Using the Distributive Property to Multiply Mentally": G.distribute,
    "Using the Order of Operations": G.order,
    "Adding Integers Using Absolute Values": G.addInt,
    "Comparing Integers Using a Number Line": G.abs,
    "Dividing Integers": G.divInt,
    "Evaluating Expressions with Integers": G.evalInt,
    "Finding Absolute Value": G.abs,
    "Graphing Integers and Their Opposites on a Number Line": G.abs,
    "Graphing Linear Equations": G.tableEquation,
    "Graphing Points on a Coordinate Plane": G.tableEquation,
    "Identifying Quadrants": G.tableEquation,
    "Locating Points on a Coordinate Plane": G.tableEquation,
    "Modeling Integer Addition": G.addInt,
    "Modeling Integer Subtraction": G.subInt,
    "Multiplying Integers": G.mulInt,
    "Ordering Integers Using a Number Line": G.abs,
    "Reading Solutions on Graphs": G.tableEquation,
    "Translating Words into Math": G.translate,
    "Writing Equations from Tables": G.tableEquation,

    /* Course 1 — number theory & fractions */
    "Comparing Decimals": G.cmpDecimals,
    "Comparing Fractions": G.cmpFrac,
    "Converting Between Improper Fractions and Mixed Numbers": G.improperMixed,
    "Finding Equivalent Fractions": G.equivFrac,
    "Identifying Prime and Composite Numbers": G.primeComposite,
    "Ordering Fractions and Decimals": G.cmpDecimals,
    "Using Prime Factorization to Find the GCD": G.gcf,
    "Using Prime Factorization to Find the LCM": G.lcm,
    "Using a List to Find the GCD": G.gcf,
    "Using a List to Find the LCM": G.lcm,
    "Writing Decimals as Fractions": G.decToFrac,
    "Writing Fractions as Decimals": G.fracToDec,
    "Writing Fractions in Simplest Form": G.simplifyFrac,

    /* Course 1 — operations with rational numbers */
    "Adding Mixed Numbers": G.addFracUnlike,
    "Adding and Subtracting Decimals": G.addDecimals,
    "Adding and Subtracting Fractions with Like Denominators": G.addFracLike,
    "Adding and Subtracting Fractions with Unlike Denominators": G.addFracUnlike,
    "Choosing the Appropriate Metric Unit": G.metric,
    "Converting Metric Units": G.metric,
    "Dividing Decimals by Decimals": G.divDecimals,
    "Dividing Fractions": G.divFrac,
    "Dividing Integers by Decimals": G.divDecimals,
    "Dividing Mixed Numbers": G.divFrac,
    "Estimating Products and Quotients": G.estimateSum,
    "Estimating Sums and Differences": G.estimateSum,
    "Multiplying Decimals": G.mulDecimals,
    "Multiplying Fractions": G.mulFrac,
    "Multiplying Mixed Numbers": G.mulFrac,
    "Subtracting Mixed Numbers": G.subFracLike,
    "Using Unit Conversion to Make Comparisons": G.metric,

    /* Course 1 — proportional relationships */
    "Choosing the Appropriate Customary Unit": G.metric,
    "Comparing Ratios": G.proportion,
    "Comparing Ratios in Simplest Form": G.proportion,
    "Converting Customary Units": G.metric,
    "Determining Whether Two Four-Sided Figures Are Similar": G.scaleFactor,
    "Estimating with Indirect Measurement": G.indirect,
    "Finding Average Speed": G.averageSpeed,
    "Finding a Scale Factor": G.scaleFactor,
    "Solving Proportions Using Cross Products": G.proportion,
    "Writing Ratios": G.proportion,
    "Writing Ratios in Simplest Form": G.proportion,

    /* Course 1 — percents */
    "Estimating with Simple Percents": G.percentOf,
    "Finding Percent of Change": G.percentChange,
    "Finding Sales Tax": G.salesTax,
    "Modeling Percents": G.percentOf,
    "Using Decimal Equivalents to Find Percents of Numbers": G.percentOf,
    "Using Fractions to Estimate Percents": G.fracToPct,
    "Using Percent of Change": G.percentChange,
    "Using the Simple Interest Formula": G.simpleInterest,
    "Writing Decimals as Percents": G.decToPct,
    "Writing Fractions as Percents": G.fracToPct,
    "Writing Percents as Decimals": G.pctToDec,
    "Writing Percents as Fractions": G.fracToPct,

    /* Course 1 — data */
    "Analyzing Misleading Graphs": G.mean,
    "Analyzing Sampling Methods": G.mean,
    "Analyzing a Bar Graph": G.mean,
    "Analyzing a Circle Graph": G.percentOf,
    "Analyzing a Line Graph": G.mean,
    "Describing a Data Set": G.mean,
    "Finding the Mean of a Data Set": G.mean,
    "Finding the Mean, Median, Mode, and Range of a Data Set": G.mean,
    "Identifying Potentially Biased Samples": G.mean,

    /* Course 1 — probability */
    "Determining Whether Events Are Independent or Dependent": G.probSimple,
    "Determining the Likelihood of an Event": G.likelihood,
    "Finding Theoretical Probability": G.probSimple,
    "Using Complements": G.probComplement,
    "Using a Table to Find a Sample Space": G.probDice,

    /* Course 1 — multi-step equations */
    "Combining Like Terms to Solve Equations": G.likeTerms,
    "Graphing Compound Inequalities": G.compoundIneq,
    "Graphing Simple Inequalities": G.ineqAdd,
    "Identifying Like Terms": G.likeTerms,
    "Simplifying Algebraic Expressions": G.combine,
    "Solving Inequalities by Adding": G.ineqAdd,
    "Solving Inequalities by Dividing": G.ineqMul,
    "Solving Inequalities by Multiplying": G.ineqMul,
    "Solving Inequalities by Subtracting": G.ineqAdd,
    "Solving Two-Step Equations Containing Multiplication": G.solveTwoStep,
    "Solving Two-Step Inequalities": G.ineqTwoStep,
    "Using Inverse Operations to Group Terms with Variables": G.solveVarsBoth,
    "Writing Inequalities": G.compoundIneq,

    /* Course 2 — principles of algebra */
    "Determining Whether a Number Is a Solution of an Equation": G.checkSolution,
    "Ordering Integers": G.abs,
    "Simplifying Absolute-Value Expressions": G.abs,
    "Solving Equations Using Addition and Subtraction Properties": G.solveAdd,
    "Solving Equations Using Division": G.solveDiv,
    "Solving Equations Using Multiplication": G.solveMul,
    "Solving Two-Step Equations Using Division": G.solveTwoStep,
    "Subtracting Integers": G.subInt,
    "Using Absolute Value to Add Integers": G.addInt,
    "Using a Number Line to Add Integers": G.addInt,

    /* Course 2 — rational numbers */
    "Comparing by Using Decimals": G.cmpDecimals,
    "Dividing Decimals": G.divDecimals,
    "Solving Equations with Decimals": G.solveTwoStep,
    "Solving Equations with Fractions": G.solveTwoStep,
    "Solving Word Problems Using Equations": G.translate,
    "Using Factoring to Find the LCD": G.lcm,
    "Writing Terminating Decimals as Fractions": G.decToFrac,

    /* Course 2 — multi-step */
    "Solving Equations That Contain Fractions": G.solveTwoStep,
    "Solving Equations That Contain Like Terms": G.solveVarsBoth,
    "Solving Multi-Step Equations with Variables on Both Sides": G.solveVarsBoth,

    /* Course 2 — exponents & roots */
    "Calculating the Length of a Side of a Right Triangle": G.pyth,
    "Comparing Numbers in Scientific Notation": G.standardForm,
    "Dividing Monomials": G.divMonomials,
    "Dividing Powers with the Same Base": G.divMonomials,
    "Estimating Square Roots of Numbers": G.roots,
    "Evaluating Negative Exponents": G.negExponent,
    "Finding the Positive and Negative Square Roots of a Number": G.roots,
    "Identifying a Right Triangle": G.pyth,
    "Multiplying Powers with the Same Base": G.mulMonomials,
    "Raising a Power to a Power": G.powerPower,
    "Simplifying Powers": G.powers,
    "Using a Calculator to Estimate the Value of a Square Root": G.roots,
    "Writing Exponents": G.writePower,
    "Writing Numbers in Scientific Notation": G.sciNotation,

    /* Course 2 — ratios & similarity */
    "Estimating Unit Rates": G.unitRate,
    "Finding Unit Prices to Compare Costs": G.unitRate,
    "Identifying Similar Figures": G.scaleFactor,
    "Using Cross Products to Solve Proportions": G.proportion,
    "Using Proportions to Find Unknown Scales": G.scaleFactor,

    /* Course 2 — percents */
    "Computing Total Savings": G.discount,
    "Determining the Amount of Investment Time": G.simpleInterest,
    "Estimating with Percents": G.percentOf,
    "Finding Discount and Markup": G.discount,
    "Finding Equivalent Fractions and Percents": G.fracToPct,
    "Finding Percent of Increase or Decrease": G.percentChange,
    "Finding Profit and Total Sales": G.discount,
    "Finding the Percent of a Number": G.percentOf,
    "Finding the Rate of Interest": G.simpleInterest,

    /* Course 2 — graphs */
    "Finding Equations of Direct Variation": G.lineTwoPoints,
    "Finding Output Values": G.evalFunction,
    "Finding a Rise or a Run": G.slopeTwoPoints,
    "Finding the Slope of a Line": G.slopeTwoPoints,
    "Identifying Constant and Variable Rates of Change in Data": G.slopeTwoPoints,
    "Identifying Points on a Coordinate Plane": G.tableEquation,
    "Plotting Points on a Coordinate Plane": G.tableEquation,
    "Relating Graphs to Situations": G.tableEquation,
    "Finding Slope | Given Two Points": G.slopeTwoPoints,

    /* Course 2 — geometry 2D */
    "Estimating Area Using Composite Figures": G.rectArea,
    "Finding Area by Counting": G.rectArea,
    "Finding the Area of a Circle": G.circleArea,
    "Finding the Circumference of a Circle": G.circleCircum,
    "Finding the Perimeter of Parallelograms": G.rectPerimeter,
    "Identifying Parts of Circles": G.circleArea,
    "Using Perimeter": G.rectPerimeter,

    /* Course 2 — geometry 3D */
    "Classifying Three-Dimensional Figures": G.boxVolume,
    "Comparing Volumes and Surface Areas": G.boxSurface,
    "Finding Surface Area": G.boxSurface,
    "Finding Surface Area of Cylinders": G.cylSurface,
    "Finding Surface Area of Prisms": G.boxSurface,
    "Finding Surface Area of a Sphere": G.sphereSurface,
    "Finding the Volume of Composite Figures": G.boxVolume,
    "Finding the Volume of Pyramids and Cones": G.cylVolume,
    "Finding the Volume of a Sphere": G.sphereVolume,
    "Naming Prisms and Pyramids": G.boxVolume,
    "Scaling Models that are Cubes": G.scaleFactor,

    /* Course 2 — data & probability */
    "Altering Probability": G.probSimple,
    "Calculating Theoretical Probability": G.probSimple,
    "Choosing the Best Measure to Describe a Set of Data": G.mean,
    "Estimating the Probability of an Event": G.likelihood,
    "Exploring the Effects of Outliers": G.mean,
    "Finding Probabilities of Events": G.probSimple,
    "Finding Probabilities of Outcomes in a Sample Space": G.probDice,
    "Finding Quartiles": G.median,
    "Finding the Mean Median Mode and Range of a Data Set": G.mean,
    "Finding the Probability of Mutually Exclusive Events": G.probComplement,
    "Making a Box-and-Whisker Plot": G.median,
    "Organizing Data in Line Plots": G.mode,
    "Using a Scatterplot to Make Predictions": G.tableEquation,

    /* Course 2 — polynomials */
    "Adding Polynomials Horizontally": G.addPoly,
    "Adding Polynomials Vertically": G.addPoly,
    "Classifying Polynomials by Their Degrees": G.classifyPoly,
    "Finding the Opposite of a Polynomial": G.subPoly,
    "Identifying Monomials": G.degreeMono,
    "Multiplying Two Binomials": G.mulBinomials,
    "Simplifying Polynomials by Using the Distributive Property": G.mulPolyMono,
    "Special Products of Binomials": G.specialProduct,
    "Subtracting Polynomials Horizontally": G.subPoly,
    "Subtracting Polynomials Vertically": G.subPoly,

    /* generic skills that appear all over the banks */
    "Application": G.appWord,
    "Problem-Solving Application": G.appWord2,
    "Multiplying and Dividing Integers": G.multDivSign,
  };

  /* fallback cycles */
  const CYCLE = [G.solveTwoStep, G.percentOf, G.slopeTwoPoints, G.mulBinomials, G.mean, G.order, G.probSimple, G.factorTrinomialPos];

  /* ------------------------------------------------------------------
     CHAPTER DATA  (recovered from the 31 .bnk banks)
     ------------------------------------------------------------------ */
  const BOOKS = {
    alg1: { name: "Holt Algebra 1", short: "Algebra 1", blurb: "California edition — 11 chapters" },
    crs1: { name: "Holt Mathematics Course 1", short: "Course 1", blurb: "California edition — 9 chapters" },
    crs2: { name: "Holt Mathematics Course 2", short: "Course 2", blurb: "California edition — 11 chapters" },
  };
  /* ch: [id, book, number, title, pages, [skills]] */
  const CHAPTERS = [
    {id:"A101",book:"alg1",num:1,title:"Foundations of Algebra",pages:[6,49],skills:["Adding Real Numbers","Application","Classifying Real Numbers","Combining Like Terms","Dividing with Fractions","Evaluating Algebraic Expressions","Evaluating Powers","Finding Roots","Multiplying and Dividing Signed Numbers","Multiplying and Dividing with Zero","Problem-Solving Application","Simplifying Numerical Expressions","Subtracting Real Numbers","Translating from Algebra to Words","Translating from Words to Algebra","Writing Powers","Writing Powers for Geometric Models"]},
    {id:"A102",book:"alg1",num:2,title:"Equations",pages:[73,116],skills:["Application","Finding Unit Rates","Infinitely Many Solutions or No Solutions","Percent Problems","Problem-Solving Application","Scale Drawings and Scale Models","Simplifying Before Solving Equations","Solving Equations by Using Multiplication or Division","Solving Formulas for a Variable","Solving Literal Equations for a Variable","Solving Proportions","Solving Two-Step Equations","Using Ratios"]},
    {id:"A103",book:"alg1",num:3,title:"Inequalities",pages:[136,170],skills:["Application","Graphing Inequalities","Identifying Solutions of Inequalities","Problem-Solving Application","Simplifying Before Solving Inequalities","Simplifying Each Side Before Solving","Solving Multi-Step Inequalities","Using Addition and Subtraction to Solve Inequalities","Writing an Inequality from a Graph"]},
    {id:"A104",book:"alg1",num:4,title:"Functions",pages:[207,236],skills:["Application","Evaluating Functions","Graphing Functions","Identifying Arithmetic Sequences","Identifying Correlations","Identifying Functions","Using a Table to Write an Equation","Writing Functions"]},
    {id:"A105",book:"alg1",num:5,title:"Linear Functions",pages:[257,307],skills:["Application","Describing Slope","Determining Whether a Point is on a Graph","Finding Intercepts","Finding Slope by Using the Slope Formula","Finding Slope from a Graph","Finding Slope from an Equation","Identifying Parallel Lines","Identifying Perpendicular Lines","Problem-Solving Application","Using Two Points to Write an Equation","Writing Equations of Parallel and Perpendicular Lines"]},
    {id:"A106",book:"alg1",num:6,title:"Systems of Equations and Inequalities",pages:[329,371],skills:["Application","Classifying Systems of Linear Equations","Elimination Using Addition","Elimination Using Multiplication First","Elimination Using Subtraction","Identifying Solutions of Inequalities","Identifying Solutions of Systems","Identifying Solutions of Systems of Linear Inequalities","Problem-Solving Application","Solving a System of Linear Equations by Substitution","Systems with Infinitely Many Solutions","Systems with No Solution","Using the Distributive Property","Writing an Inequality from a Graph"]},
    {id:"A107",book:"alg1",num:7,title:"Exponents and Polynomials",pages:[395,457],skills:["Adding Polynomials","Adding and Subtracting Monomials","Application","Classifying Polynomials","Comparing and Ordering Numbers in Scientific Notation","Dividing Numbers in Scientific Notation","Evaluating Expressions with Zero and Negative Exponents","Evaluating Powers of 10","Finding Negative Powers of Quotients","Finding Positive Powers of Quotients","Finding Powers of Powers","Finding Powers of Products","Finding Products in the Form (a + b)^2","Finding Products of Powers","Finding Quotients of Powers","Finding the Degree of a Monomial","Identifying Roots of Polynomials","Multiplying Binomials","Multiplying Monomials","Multiplying Polynomials","Multiplying a Polynomial by a Monomial","Multiplying by Powers of 10","Problem-Solving Application","Simplify Expressions with Zero and Negative Exponents","Simplifying b^(1/n)","Subtracting Polynomials","Using Properties of Exponents to Simplify Expressions","Writing Polynomials in Standard Form","Writing Powers of 10","Zero and Negative Exponents"]},
    {id:"A108",book:"alg1",num:8,title:"Factoring Polynomials",pages:[478,523],skills:["Application","Determining Whether an Expression Is Completely Factored","Evaluating Polynomials","Factoring Out a Common Binomial Factor","Factoring Trinomials","Factoring ax^2 + bx + c","Factoring by GCF and Recognizing Patterns","Factoring by Grouping","Factoring by Multiple Methods","Factoring by Using the GCF","Factoring with Opposites","Factoring x^2 + bx + c When c Is Negative","Factoring x^2 + bx + c When c Is Positive","Finding the GCF of Monomials","Finding the GCF of Numbers","Problem-Solving Application","Recognizing and Factoring the Difference of Two Squares","Recognizing and Factoring the Perfect-Square Trinomials","Writing Prime Factorizations"]},
    {id:"A109",book:"alg1",num:9,title:"Quadratic Functions and Equations",pages:[545,605],skills:["Application","Approximating Solutions","Completing the Square","Finding Domain and Range","Finding the Vertex of a Parabola","Identifying the Direction of a Parabola","Problem-Solving Application","Solving Quadratic Equations by Factoring","Solving Quadratic Equations by Graphing","Solving Using Different Methods","Solving x^2+bx=c by Completing the Square","Using Square Roots to Solve x^2 = a","Using the Discriminant","Using the Quadratic Formula","Using the Zero Product Property"]},
    {id:"A110",book:"alg1",num:10,title:"Rational Functions and Equations",pages:[627,675],skills:["Application","Divide a Polynomial by a Binomial","Dividing a Polynomial by a Monomial","Extraneous Solutions","Identifying Asymptotes","Identifying Excluded Values","Identifying an Inverse Variation","Identifying the Least Common Multiple","Long Division with a Remainder","Multiplying Rational Expressions","Multiplying Rational Expressions Containing Polynomials","Polynomial Long Division","Simplifying Rational Expressions","Simplifying Rational Expressions Using Opposite Binomials","Subtracting Rational Expressions with Like Denominators","Using the Product Rule"]},
    {id:"A111",book:"alg1",num:11,title:"Radical and Exponential Functions",pages:[700,757],skills:["Application","Evaluating Square-Root Functions","Evaluating an Exponential Function","Exponential Decay","Exponential Growth","Extending Geometric Sequences","Graphing Data to Choose a Model","Multiplying Square Roots","Problem-Solving Application","Rationalizing the Denominator","Simplifying Before Adding or Subtracting","Simplifying Square-Root Expressions","Solving Radical Equations by Multiplying or Dividing","Solving Radical Equations with Square Roots on Both Sides","Solving Simple Radical Equations","Using Patterns to Choose a Model","Using the Distributive Property"]},
    {id:"C101",book:"crs1",num:1,title:"Algebraic Reasoning",pages:[6,52],skills:["Application","Evaluating Expressions Involving Order of Operations","Evaluating Powers","Expressing Whole Numbers as Powers","Identifying Properties of Addition and Multiplication","Identifying and Extending Number Patterns","Problem-Solving Application","Solving Equations by Adding","Solving Equations by Dividing","Solving Equations by Multiplying","Solving Equations by Subtracting","Translating Real-World Problems into Algebraic Expressions","Translating Verbal Expressions into Algebraic Expressions","Using Properties to Simplify Expressions","Using the Distributive Property to Multiply Mentally","Using the Order of Operations"]},
    {id:"C102",book:"crs1",num:2,title:"Integers",pages:[70,109],skills:["Adding Integers Using Absolute Values","Application","Comparing Integers Using a Number Line","Dividing Integers","Evaluating Expressions with Integers","Finding Absolute Value","Graphing Integers and Their Opposites on a Number Line","Graphing Linear Equations","Graphing Points on a Coordinate Plane","Identifying Quadrants","Locating Points on a Coordinate Plane","Modeling Integer Addition","Modeling Integer Subtraction","Multiplying Integers","Ordering Integers Using a Number Line","Problem-Solving Application","Reading Solutions on Graphs","Translating Words into Math","Writing Equations from Tables"]},
    {id:"C103",book:"crs1",num:3,title:"Number Theory and Fractions",pages:[128,151],skills:["Application","Comparing Decimals","Comparing Fractions","Converting Between Improper Fractions and Mixed Numbers","Finding Equivalent Fractions","Identifying Prime and Composite Numbers","Ordering Fractions and Decimals","Problem-Solving Application","Using Prime Factorization to Find the GCD","Using Prime Factorization to Find the LCM","Using a List to Find the GCD","Using a List to Find the LCM","Writing Decimals as Fractions","Writing Fractions as Decimals","Writing Fractions in Simplest Form"]},
    {id:"C104",book:"crs1",num:4,title:"Operations with Rational Numbers",pages:[170,215],skills:["Adding Mixed Numbers","Adding and Subtracting Decimals","Adding and Subtracting Fractions with Like Denominators","Adding and Subtracting Fractions with Unlike Denominators","Application","Choosing the Appropriate Metric Unit","Converting Metric Units","Dividing Decimals by Decimals","Dividing Fractions","Dividing Integers by Decimals","Dividing Mixed Numbers","Estimating Products and Quotients","Estimating Sums and Differences","Multiplying Decimals","Multiplying Fractions","Multiplying Mixed Numbers","Problem-Solving Application","Solving Equations by Multiplying","Subtracting Mixed Numbers","Using Unit Conversion to Make Comparisons"]},
    {id:"C105",book:"crs1",num:5,title:"Proportional Relationships",pages:[232,267],skills:["Application","Choosing the Appropriate Customary Unit","Comparing Ratios","Comparing Ratios in Simplest Form","Converting Customary Units","Determining Whether Two Four-Sided Figures Are Similar","Estimating with Indirect Measurement","Finding Average Speed","Finding Unit Rates","Finding a Scale Factor","Problem-Solving Application","Solving Proportions Using Cross Products","Writing Ratios","Writing Ratios in Simplest Form"]},
    {id:"C106",book:"crs1",num:6,title:"Percents",pages:[286,313],skills:["Application","Estimating with Simple Percents","Finding Percent of Change","Finding Sales Tax","Modeling Percents","Problem-Solving Application","Using Decimal Equivalents to Find Percents of Numbers","Using Fractions to Estimate Percents","Using Percent of Change","Using the Simple Interest Formula","Writing Decimals as Percents","Writing Fractions as Percents","Writing Percents as Decimals","Writing Percents as Fractions"]},
    {id:"C107",book:"crs1",num:7,title:"Collecting, Displaying, and Analyzing Data",pages:[331,362],skills:["Analyzing Misleading Graphs","Analyzing Sampling Methods","Analyzing a Bar Graph","Analyzing a Circle Graph","Analyzing a Line Graph","Application","Describing a Data Set","Finding the Mean of a Data Set","Finding the Mean, Median, Mode, and Range of a Data Set","Identifying Potentially Biased Samples"]},
    {id:"C108",book:"crs1",num:8,title:"Probability",pages:[382,411],skills:["Application","Determining Whether Events Are Independent or Dependent","Determining the Likelihood of an Event","Finding Theoretical Probability","Problem-Solving Application","Using Complements","Using a Table to Find a Sample Space"]},
    {id:"C111",book:"crs1",num:11,title:"Multi-Step Equations and Inequalities",pages:[554,585],skills:["Application","Combining Like Terms to Solve Equations","Graphing Compound Inequalities","Graphing Simple Inequalities","Identifying Like Terms","Problem-Solving Application","Simplifying Algebraic Expressions","Solving Inequalities by Adding","Solving Inequalities by Dividing","Solving Inequalities by Multiplying","Solving Inequalities by Subtracting","Solving Two-Step Equations Containing Multiplication","Solving Two-Step Inequalities","Using Inverse Operations to Group Terms with Variables","Writing Inequalities"]},
    {id:"C201",book:"crs2",num:1,title:"Principles of Algebra",pages:[6,45],skills:["Application","Determining Whether a Number Is a Solution of an Equation","Evaluating Expressions with Integers","Multiplying and Dividing Integers","Ordering Integers","Problem-Solving Application","Simplifying Absolute-Value Expressions","Solving Equations Using Addition and Subtraction Properties","Solving Equations Using Division","Solving Equations Using Multiplication","Solving Two-Step Equations Using Division","Subtracting Integers","Using Absolute Value to Add Integers","Using a Number Line to Add Integers"]},
    {id:"C202",book:"crs2",num:2,title:"Rational Numbers",pages:[66,99],skills:["Adding and Subtracting Decimals","Adding and Subtracting Fractions with Like Denominators","Adding and Subtracting Fractions with Unlike Denominators","Application","Comparing by Using Decimals","Dividing Decimals","Dividing Fractions","Multiplying Decimals","Multiplying Fractions","Problem-Solving Application","Solving Equations with Decimals","Solving Equations with Fractions","Solving Two-Step Equations","Solving Word Problems Using Equations","Using Factoring to Find the LCD","Writing Fractions as Decimals","Writing Terminating Decimals as Fractions"]},
    {id:"C203",book:"crs2",num:3,title:"Multi-Step Equations and Inequalities",pages:[117,149],skills:["Application","Graphing Compound Inequalities","Graphing Inequalities","Problem-Solving Application","Solving Equations That Contain Fractions","Solving Equations That Contain Like Terms","Solving Multi-Step Equations with Variables on Both Sides","Solving Two-Step Inequalities","Using the Distributive Property"]},
    {id:"C204",book:"crs2",num:4,title:"Exponents and Roots",pages:[168,207],skills:["Application","Calculating the Length of a Side of a Right Triangle","Classifying Real Numbers","Comparing Numbers in Scientific Notation","Dividing Monomials","Dividing Powers with the Same Base","Estimating Square Roots of Numbers","Evaluating Negative Exponents","Finding the Positive and Negative Square Roots of a Number","Identifying a Right Triangle","Multiplying Monomials","Multiplying Powers with the Same Base","Problem-Solving Application","Raising a Power to a Power","Simplifying Powers","Using a Calculator to Estimate the Value of a Square Root","Using the Order of Operations","Writing Exponents","Writing Numbers in Scientific Notation"]},
    {id:"C205",book:"crs2",num:5,title:"Ratios, Proportions, and Similarity",pages:[225,253],skills:["Application","Estimating Unit Rates","Finding Unit Prices to Compare Costs","Finding Unit Rates","Identifying Similar Figures","Problem-Solving Application","Using Cross Products to Solve Proportions","Using Proportions to Find Unknown Scales"]},
    {id:"C206",book:"crs2",num:6,title:"Percents",pages:[274,304],skills:["Application","Computing Total Savings","Determining the Amount of Investment Time","Estimating with Percents","Finding Discount and Markup","Finding Equivalent Fractions and Percents","Finding Percent of Increase or Decrease","Finding Profit and Total Sales","Finding the Percent of a Number","Finding the Rate of Interest","Problem-Solving Application"]},
    {id:"C207",book:"crs2",num:7,title:"Graphs and Functions",pages:[323,359],skills:["Application","Finding Equations of Direct Variation","Finding Output Values","Finding Slope | Given Two Points","Finding a Rise or a Run","Finding the Slope of a Line","Identifying Constant and Variable Rates of Change in Data","Identifying Functions","Identifying Points on a Coordinate Plane","Plotting Points on a Coordinate Plane","Relating Graphs to Situations"]},
    {id:"C209",book:"crs2",num:9,title:"Two-Dimensional Geometry",pages:[434,459],skills:["Application","Estimating Area Using Composite Figures","Finding Area by Counting","Finding the Area of a Circle","Finding the Circumference of a Circle","Finding the Perimeter of Parallelograms","Identifying Parts of Circles","Problem-Solving Application","Using Perimeter"]},
    {id:"C210",book:"crs2",num:10,title:"Three-Dimensional Geometry",pages:[480,513],skills:["Application","Classifying Three-Dimensional Figures","Comparing Volumes and Surface Areas","Finding Surface Area","Finding Surface Area of Cylinders","Finding Surface Area of Prisms","Finding Surface Area of a Sphere","Finding the Volume of Composite Figures","Finding the Volume of Pyramids and Cones","Finding the Volume of a Sphere","Naming Prisms and Pyramids","Scaling Models that are Cubes"]},
    {id:"C211",book:"crs2",num:11,title:"Data, Statistics, and Probability",pages:[532,566],skills:["Altering Probability","Application","Calculating Theoretical Probability","Choosing the Best Measure to Describe a Set of Data","Estimating the Probability of an Event","Exploring the Effects of Outliers","Finding Probabilities of Events","Finding Probabilities of Outcomes in a Sample Space","Finding Quartiles","Finding the Mean Median Mode and Range of a Data Set","Finding the Probability of Mutually Exclusive Events","Making a Box-and-Whisker Plot","Organizing Data in Line Plots","Using a Scatterplot to Make Predictions"]},
    {id:"C212",book:"crs2",num:12,title:"Polynomials",pages:[590,619],skills:["Adding Polynomials Horizontally","Adding Polynomials Vertically","Application","Classifying Polynomials by Their Degrees","Finding the Opposite of a Polynomial","Identifying Like Terms","Identifying Monomials","Multiplying Monomials","Multiplying Two Binomials","Multiplying a Polynomial by a Monomial","Problem-Solving Application","Simplifying Polynomials by Using the Distributive Property","Special Products of Binomials","Subtracting Polynomials Horizontally","Subtracting Polynomials Vertically"]}
  ];


  /* ------------------------------------------------------------------
     APP
     ------------------------------------------------------------------ */
  ML.register({
    id: "quizshow", group: "games", title: "Quiz Show",
    short: "Quiz Show", icon: ML.icon("bulb"), color: ["#efe9ff", "#4b3ee0"], tag: "Chapter quiz game",
    blurb: "The Question Sets folder turned into a game: pick a Holt chapter, answer generated questions in teams, and race the board for points.",
    tags: ["Question Sets", "31 chapters", "team game", "599 skills"],
    mount(root) {
      const st = {
        book: U.store.get("qs:book", "all"),
        chapter: U.store.get("qs:chapter", ""),
        teams: U.store.get("qs:teams", 2),
        names: U.store.get("qs:names", ["Team 1", "Team 2", "Team 3", "Team 4"]),
        scores: [0, 0, 0, 0],
        turn: 0,
        round: 1,
        totalRounds: 12,
        q: null,
        answered: false,
        played: [],
        log: [],
        diff: U.store.get("qs:diff", "all"),
        source: U.store.get("qs:source", "generated"),
        revealed: false,
      };

      const wrap = U.el("div");
      const head = U.el("div", { class: "card pad qs-intro", style: "margin-bottom:16px" });
      head.innerHTML = `
        <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;justify-content:space-between">
          <div>
            <h2 style="margin:0 0 4px;font-size:19px">Chapter quiz game</h2>
            <p class="muted" style="margin:0;max-width:62ch">Every question is generated fresh from the skill list of the chapter you pick — so the same chapter can be played again and again. Teams take turns; right answers bank the points.</p>
          </div>
          <div class="btn-row">
            <button class="btn ghost sm" id="newGame">${ML.icon("shuffle")} New game</button>
            <button class="btn sm" id="revealAll">${ML.icon("bulb")} Reveal answer</button>
          </div>
        </div>`;
      wrap.appendChild(head);
      const layout = U.el("div", { class: "app-layout" });
      layout.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Chapter</div>
            <div class="panel-b tight">
              <div class="field"><label for="bookSel">Book</label><select id="bookSel"></select></div>
              <div class="field"><label for="chSel">Chapter <span class="val" id="chCount"></span></label><select id="chSel"></select></div>
              <div class="field"><label for="srcSel">Questions from</label>
                <select id="srcSel">
                  <option value="generated">Generated (endless)</option>
                  <option value="bank">The original .bnk banks</option>
                </select>
              </div>
              <div class="field"><label for="diffSel">Difficulty</label>
                <select id="diffSel">
                  <option value="all">All skills</option>
                  <option value="Basic">Basic only</option>
                  <option value="Average">Average only</option>
                  <option value="Advanced">Advanced only</option>
                </select>
              </div>
              <div class="hr"></div>
              <div class="field"><label>Teams</label>
                <div class="seg" id="teamSeg">
                  <button data-t="2" class="on">2</button><button data-t="3">3</button><button data-t="4">4</button>
                </div>
              </div>
              <div class="field"><label>Rounds <span class="val" id="roundVal">12</span></label>
                <input type="range" id="roundRange" min="6" max="30" step="1" value="12">
              </div>
            </div>
          </div>
          <div class="panel">
            <div class="panel-h">Scoreboard</div>
            <div class="panel-b tight" id="scoreboard"></div>
          </div>
          <div class="panel">
            <div class="panel-h">Skills in this set</div>
            <div class="panel-b tight" id="skillList" style="max-height:230px;overflow:auto"></div>
          </div>
        </aside>
        <section class="stage">
          <div class="card" style="padding:0;overflow:hidden">
            <div class="panel-h" style="padding:12px 18px">
              <span id="stageTitle" style="white-space:nowrap">Round 1</span>
              <span class="muted qs-meta" id="stageMeta" style="font-size:12px;font-weight:700"></span>
            </div>
            <div style="padding:26px 22px 30px" id="stageBody"></div>
          </div>
          <div class="card pad" style="margin-top:16px" id="logCard">
            <div class="panel-h" style="margin:-4px -4px 12px;padding-left:0;border:0">Played so far</div>
            <div id="logBody" class="muted small">No questions answered yet.</div>
          </div>
        </section>`;
      wrap.appendChild(layout);
      root.appendChild(wrap);

      const $ = (s) => wrap.querySelector(s);
      const bookSel = $("#bookSel"), chSel = $("#chSel"), diffSel = $("#diffSel");
      const srcSel = $("#srcSel");
      if (srcSel) {
        srcSel.value = st.source;
        srcSel.addEventListener("change", () => {
          st.source = srcSel.value; U.store.set("qs:source", st.source);
          redeal();
          ML.toast(st.source === "bank"
            ? "Playing the recovered bank questions"
            : "Playing generated questions", "ok");
        });
      }

      /* ---- chapter list ---- */
      function chaptersFor(book) {
        return CHAPTERS.filter((c) => book === "all" || c.book === book);
      }
      function fillBooks() {
        bookSel.innerHTML =
          `<option value="all">All three books</option>` +
          Object.keys(BOOKS).map((k) => `<option value="${k}">${BOOKS[k].name}</option>`).join("");
        bookSel.value = st.book;
      }
      function fillChapters() {
        const list = chaptersFor(bookSel.value);
        chSel.innerHTML = list.map((c) => `<option value="${c.id}">${c.num}. ${c.title}</option>`).join("");
        if (st.chapter && list.some((c) => c.id === st.chapter)) chSel.value = st.chapter;
        else { st.chapter = list[0] ? list[0].id : ""; chSel.value = st.chapter; }
        chCount.textContent = list.length + " in this book";
        refreshSkills();
      }
      function currentChapters() {
        if (st.chapter === "ALL") return chaptersFor(bookSel.value);
        const c = CHAPTERS.find((x) => x.id === st.chapter);
        return c ? [c] : [];
      }
      function skillsPool() {
        const set = new Set();
        currentChapters().forEach((c) => c.skills.forEach((s) => set.add(s)));
        let arr = Array.from(set).filter((s) => GENERATED(s) && s !== "Application" && s !== "Problem-Solving Application");
        if (!arr.length) arr = ["Solving Two-Step Equations", "Percent Problems", "Finding Slope by Using the Slope Formula"];
        return arr;
      }
      function GENERATED(s) { return Object.prototype.hasOwnProperty.call(MAP, s) ? !!MAP[s] : CYCLE.length > 0; }

      function refreshSkills() {
        const pool = skillsPool();
        const host = $("#skillList");
        host.innerHTML = pool.slice(0, 40).map((s) => `<span class="badge" style="justify-content:flex-start;text-align:left"><span style="width:6px;height:6px;border-radius:50%;background:var(--brand);display:inline-block"></span>${s}</span>`).join("");
        if (pool.length > 40) host.innerHTML += `<span class="muted small">+ ${pool.length - 40} more</span>`;
      }

      /* ---- scoreboard ---- */
      function drawScores() {
        const host = $("#scoreboard");
        host.innerHTML = "";
        for (let i = 0; i < st.teams; i++) {
          const row = U.el("div", {
            class: "stat",
            style: "display:flex;align-items:center;gap:10px;justify-content:space-between" + (i === st.turn ? ";border-color:var(--brand);box-shadow:0 0 0 2px var(--brand-soft)" : ""),
          });
          row.innerHTML = `
            <div style="display:flex;align-items:center;gap:9px;min-width:0">
              <span style="width:22px;height:22px;border-radius:7px;background:${["#6d5efc", "#0f9d94", "#e6459c", "#b07a06"][i]}22;color:${["#4b3ee0", "#0b7a73", "#a81a6b", "#93630a"][i]};display:grid;place-items:center;font-size:11px;font-weight:850">${i + 1}</span>
              <input data-team="${i}" value="${st.names[i]}" aria-label="Team ${i + 1} name"
                style="border:0;background:transparent;font:inherit;font-weight:750;font-size:13.5px;min-width:0;width:100%;color:var(--ink)">
            </div>
            <b style="font-size:18px;font-variant-numeric:tabular-nums">${st.scores[i]}</b>`;
          host.appendChild(row);
        }
        U.$$("input[data-team]", host).forEach((inp) => {
          inp.addEventListener("change", () => {
            st.names[+inp.dataset.team] = inp.value.trim() || "Team " + (+inp.dataset.team + 1);
            U.store.set("qs:names", st.names);
          });
        });
      }

      /* ---- the recovered bank text ---- */
      const BANKS = window.QSBANKS || [];

      /** turn a chapter id (A101) into the matching bank (A1_01) */
      function bankFor(chapterId) {
        if (!chapterId) return [];
        const m = /^([AC])(\d)(\d{2})$/.exec(chapterId);
        if (!m) return [];
        const id = `${m[1]}${m[2]}_${m[3]}`;
        const bank = BANKS.find((b) => b.id === id);
        return bank ? { id: id, title: bank.title, items: bank.q } : [];
      }

      /** a question straight from the recovered .bnk text */
      function bankQuestionItem() {
        const banks = st.chapter
          ? [bankFor(st.chapter)].filter((x) => x && x.items.length)
          : BANKS.map((b) => ({ id: b.id, title: b.title, items: b.q }));
        if (!banks.length) return null;
        const bank = U.pick(banks);
        // only records that read cleanly AND are shaped like a question
        const pool = bank.items.filter((it) =>
          it.k === "question" || it.k === "question-partial" || it.x === 1);
        if (!pool.length) return null;
        const it = U.pick(pool);
        return {
          skill: it.s || "Recovered question",
          q: it.q, s: it.s, p: it.p, d: it.d, o: it.o, k: it.k,
          bank: bank.id, title: bank.title,
          a: { value: "", alts: [] },
          tip: "",
          fromBank: bank.id,
          gap: /\//.test(it.q),
        };
      }

      /* ---- stage ---- */
      function newQuestion() {
        if (st.source === "bank") {
          const bq = bankQuestionItem();
          if (bq) { st.q = bq; st.answered = false; st.revealed = false; drawStage(); return; }
          // nothing readable in this chapter: fall through to a generated question
        }
        const pool = skillsPool();
        const skill = U.pick(pool);
        const gen = MAP[skill] || U.pick(CYCLE);
        let item;
        try { item = gen(Math.random); } catch (e) { item = U.pick(CYCLE)(Math.random); }
        st.q = { skill: skill, q: tidy(item.q), a: { value: tidy(item.a.value), alts: (item.a.alts || []).map(tidy) }, tip: item.tip };
        st.answered = false;
        st.revealed = false;
        drawStage();
      }
      function drawStage() {
        const body = $("#stageBody");
        $("#stageTitle").textContent = `Round ${st.round} of ${st.totalRounds}`;
        const ch = CHAPTERS.find((c) => c.id === st.chapter);
        $("#stageMeta").textContent = ch ? `${BOOKS[ch.book].short} · ${ch.title}` : "Mixed chapters";
        if (!st.q) return;

        // bank questions get the shared interactive card
        if (st.q.fromBank && ML.bankCard) {
          ML.bankCard.createCard(body, st.q, {
            index: st.round - 1, total: st.totalRounds,
            onNext: () => { st.round = Math.min(st.round + 1, st.totalRounds); newQuestion(); },
            onPrev: () => newQuestion(),
          });
          const btns = body.querySelector(".bq-tools");
          if (btns) {
            // keep the game's own controls: end round / skip
            const row = U.el("div", { class: "btn-row", style: "margin-top:12px" });
            row.innerHTML = `<button class="btn ghost sm" id="qsSkipBank">Skip this card</button>`;
            body.appendChild(row);
            row.querySelector("#qsSkipBank").addEventListener("click", () => {
              st.played.push({ q: st.q.q, a: "", skill: st.q.skill, ok: false, team: st.names[st.turn] });
              st.turn = (st.turn + 1) % st.teams;
              if (st.turn === 0) st.round++;
              newQuestion();
            });
          }
          return;
        }

        body.innerHTML = `
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px">
            <span class="badge info">${st.q.skill}</span>
            <span class="badge" style="background:${["#6d5efc", "#0f9d94", "#e6459c", "#b07a06"][st.turn]}18;border-color:transparent;color:${["#4b3ee0", "#0b7a73", "#a81a6b", "#93630a"][st.turn]}">${st.names[st.turn]}'s turn</span>
          </div>
          <div style="font-size:clamp(22px,3.4vw,34px);font-weight:800;letter-spacing:-.02em;line-height:1.45;margin:6px 0 22px" id="qText">${TEX.render(st.q.q)}</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
            <input id="ansBox" class="input" placeholder="${st.q.fromBank ? "Type your working, or press Show answer" : "Your answer"}" autocomplete="off" spellcheck="false"
              style="flex:1 1 240px;min-width:0;padding:13px 15px;border-radius:12px;border:1.5px solid var(--line-2);font:inherit;font-size:16px;background:var(--surface)">
            <button class="btn lg" id="submitBtn">${st.q.fromBank ? "I answered it" : "Check"}</button>
            <button class="btn ghost lg" id="skipBtn">Skip</button>
          </div>
          <div id="verdict" style="margin-top:16px;min-height:26px"></div>
          <div id="answerPanel" style="display:none;margin-top:6px"></div>`;
        const box = $("#ansBox");
        if (box) { try { box.focus({ preventScroll: true }); } catch (e) { box.focus(); } }
        $("#submitBtn").addEventListener("click", submit);
        $("#skipBtn").addEventListener("click", () => settle(null, true));
        if (box) box.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
        if (st.answered) showAnswered();
      }
      function showAnswered() {
        const v = $("#verdict"), ap = $("#answerPanel");
        if (!v) return;
        const okLast = st.lastOk;
        v.innerHTML = okLast
          ? `<span class="badge ok">${ML.icon("check")} Correct — +${st.lastPts} points</span>`
          : `<span class="badge no">${ML.icon("crossMark")} Not quite</span>`;
        ap.style.display = "block";
        ap.innerHTML = `
          <div class="card" style="padding:14px 16px;background:var(--green-soft);border-color:transparent">
            <div style="font-size:11.5px;font-weight:850;letter-spacing:.08em;text-transform:uppercase;color:#157a43;margin-bottom:4px">Answer</div>
            <div style="font-size:21px;font-weight:800;color:#0f6b3d">${TEX.render(st.q.a.value)}</div>
            ${st.q.tip ? `<div class="small" style="margin-top:8px;color:#157a43;opacity:.9">${st.q.tip}</div>` : ""}
          </div>
          <div class="btn-row" style="margin-top:14px">
            <button class="btn" id="nextBtn">${ML.icon("arrow")} Next round</button>
          </div>`;
        $("#nextBtn").addEventListener("click", nextRound);
        const nb = $("#nextBtn"); if (nb) { try { nb.focus({ preventScroll: true }); } catch (e) {} }
      }
      function submit() {
        if (st.answered) return;
        const box = $("#ansBox");
        const val = box ? box.value : "";
        if (!val.trim()) { ML.toast("Type an answer first", "no"); return; }
        settle(val, false);
      }
      function settle(input, skipped) {
        if (st.answered) return;
        st.answered = true;
        const ok = !skipped && accepts(st.q.a, input);
        st.lastOk = ok;
        const pts = ok ? (st.diff === "Advanced" ? 15 : 10) : 0;
        st.lastPts = pts;
        if (ok) { st.scores[st.turn] += pts; U.sound.ok(); } else U.sound.no();
        st.played.push({ q: st.q.q, a: st.q.a.value, skill: st.q.skill, ok: ok, team: st.names[st.turn] });
        drawScores();
        drawLog();
        const inp = $("#ansBox"); if (inp) inp.disabled = true;
        const sb = $("#submitBtn"); if (sb) sb.disabled = true;
        const kb = $("#skipBtn"); if (kb) kb.disabled = true;
        showAnswered();
      }
      /* hand out a new question for the current round (after changing chapter) */
      function redeal() {
        st.q = null; st.answered = false;
        newQuestion();
      }
      function nextRound() {
        if (st.round >= st.totalRounds) { finish(); return; }
        st.round++;
        st.turn = (st.turn + 1) % st.teams;
        newQuestion();
      }
      function finish() {
        const best = Math.max.apply(null, st.scores.slice(0, st.teams));
        const winners = st.scores.slice(0, st.teams).map((s, i) => (s === best ? st.names[i] : null)).filter(Boolean);
        U.sound.win();
        $("#stageTitle").textContent = "Final scores";
        $("#stageBody").innerHTML = `
          <div style="text-align:center;padding:8px 0 4px">
            <div style="font-size:13px;font-weight:850;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Winner${winners.length > 1 ? "s" : ""}</div>
            <div style="font-size:clamp(26px,4vw,40px);font-weight:850;letter-spacing:-.03em;margin:6px 0 2px">${(winners.length === st.teams && st.teams > 2 ? "All teams tied" : winners.length > 2 ? winners.slice(0, -1).join(", ") + " & " + winners[winners.length - 1] : winners.join(" & "))}</div>
            <div class="muted">${best} points · ${st.played.filter((p) => p.ok).length} of ${st.played.length} correct</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin:20px 0">
            ${st.scores.slice(0, st.teams).map((s, i) => `<div class="stat"><span>${st.names[i]}</span><b>${s}</b></div>`).join("")}
          </div>
          <div class="btn-row" style="justify-content:center">
            <button class="btn" id="againBtn">${ML.icon("shuffle")} Play again</button>
          </div>`;
        $("#againBtn").addEventListener("click", () => { resetGame(); });
      }
      function resetGame() {
        st.scores = [0, 0, 0, 0]; st.turn = 0; st.round = 1; st.played = []; st.q = null;
        drawScores(); drawLog(); newQuestion();
      }
      function drawLog() {
        const host = $("#logBody");
        if (!st.played.length) { host.className = "muted small"; host.textContent = "No questions answered yet."; return; }
        host.className = "";
        host.innerHTML = `<div style="display:flex;flex-direction:column;gap:7px">` + st.played.map((p, i) => `
          <div style="display:flex;gap:10px;align-items:baseline;padding:7px 0;border-bottom:1px solid var(--line)">
            <span style="width:20px;font-size:11px;font-weight:800;color:var(--muted)">${i + 1}</span>
            <span style="flex:1;min-width:0;font-size:13px">${TEX.render(p.q)}</span>
            <span style="font-size:13px;font-weight:750;color:var(--brand-ink);white-space:nowrap">${TEX.render(p.a)}</span>
            <span class="badge ${p.ok ? "ok" : "no"}" style="flex:none">${p.ok ? "hit" : "miss"}</span>
          </div>`).join("") + `</div>`;
      }

      /* ---- wiring ---- */
      fillBooks();
      fillChapters();
      diffSel.value = st.diff;
      U.$$("#teamSeg button").forEach((b) => {
        b.classList.toggle("on", +b.dataset.t === st.teams);
        b.addEventListener("click", () => {
          st.teams = +b.dataset.t;
          U.store.set("qs:teams", st.teams);
          U.$$("#teamSeg button").forEach((x) => x.classList.toggle("on", x === b));
          drawScores(); if (st.turn >= st.teams) st.turn = 0;
          if (st.q && !st.answered) drawStage();
        });
      });
      $("#roundRange").value = st.totalRounds;
      $("#roundVal").textContent = st.totalRounds;
      $("#roundRange").addEventListener("input", (e) => {
        st.totalRounds = +e.target.value; $("#roundVal").textContent = st.totalRounds;
      });
      bookSel.addEventListener("change", () => { st.book = bookSel.value; U.store.set("qs:book", st.book); fillChapters(); redeal(); });
      chSel.addEventListener("change", () => { st.chapter = chSel.value; U.store.set("qs:chapter", st.chapter); refreshSkills(); redeal(); });
      diffSel.addEventListener("change", () => { st.diff = diffSel.value; U.store.set("qs:diff", st.diff); redeal(); });
      $("#newGame").addEventListener("click", resetGame);
      $("#revealAll").addEventListener("click", () => { if (st.q && !st.answered) settle("", true); });

      drawScores();
      drawLog();
      newQuestion();
    },
  });
})();

/* ===========================================================
   MathsLab — interactive question card
   One card, reused by Bank Questions and Quiz Show's bank mode.
   Everything is local state: reveal, answer reveal, self-report,
   hint toggle and a small progress meter. No marking up required,
   because the recovered text has no stored answer to check against.
   =========================================================== */
(function () {
  "use strict";
  const ML = window.ML;
  const TEX = ML.tex || { render: (s) => String(s == null ? "" : s) };

  if (!document.getElementById("bq-card-css")) {
    const css = document.createElement("style");
    css.id = "bq-card-css";
    css.textContent = `
.bq-card{background:var(--surface,#fff);border:1px solid var(--line,#e2e7f2);border-radius:14px;
  padding:20px 22px;box-shadow:0 1px 2px rgba(16,24,40,.04)}
.bq-top{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px}
.bq-stem{font-size:clamp(20px,2.7vw,28px);font-weight:760;line-height:1.6;letter-spacing:-.01em;
  margin:0 0 6px;transition:filter .18s ease,opacity .18s ease}
.bq-stem.blur{filter:blur(6px);opacity:.55;user-select:none}
.bq-gap{display:inline-block;min-width:1.6em;height:1px;border-bottom:2px solid currentColor;
  vertical-align:baseline;margin:0 .2em .14em;opacity:.65}
.bq-opts{margin:12px 0 0;padding:0;list-style:none;display:grid;gap:8px}
.bq-opt{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:10px;
  border:1.5px solid var(--line,#e2e7f2);background:var(--surface,#fff);cursor:pointer;
  transition:border-color .14s ease,background .14s ease,transform .06s ease}
.bq-opt:hover{border-color:#b9c6e4;background:#f7f9ff}
.bq-opt:active{transform:scale(.995)}
.bq-opt .k{font-weight:800;font-size:12px;letter-spacing:.06em;color:#7a86a3;padding-top:2px;min-width:14px}
.bq-opt .v{flex:1;min-width:0;line-height:1.45}
.bq-opt.sel{border-color:#4b3ee0;background:#f2f0ff}
.bq-opt.ok{border-color:#157a43;background:#eaf7ef}
.bq-opt.no{border-color:#c0392b;background:#fdeeec}
.bq-tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:16px}
.bq-btn{font:inherit;font-size:14px;font-weight:700;padding:9px 15px;border-radius:10px;
  border:1.5px solid var(--line,#e2e7f2);background:var(--surface,#fff);color:inherit;cursor:pointer;
  transition:background .14s ease,border-color .14s ease,transform .06s ease}
.bq-btn:hover{border-color:#b9c6e4;background:#f7f9ff}
.bq-btn:active{transform:scale(.98)}
.bq-btn.primary{background:#4b3ee0;border-color:#4b3ee0;color:#fff}
.bq-btn.primary:hover{background:#3d32c4;border-color:#3d32c4}
.bq-btn.ghost{background:transparent}
.bq-btn[disabled]{opacity:.45;cursor:not-allowed}
.bq-panel{margin-top:14px;border-radius:10px;padding:12px 14px;font-size:14px;line-height:1.55;
  animation:bq-in .18s ease}
@keyframes bq-in{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}
.bq-panel.gap{background:#fff8e6;border:1px solid #f0e0a8;color:#8a6d1f}
.bq-panel.hint{background:#eef3ff;border:1px solid #d3e0f7;color:#274b8b}
.bq-panel.note{background:#f4f5fa;border:1px solid #e6e9f3;color:#5b6480}
.bq-meta{margin-top:14px;font-size:12px;color:#7a86a3;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.bq-meta .dot{opacity:.5}
.bq-prog{height:5px;border-radius:99px;background:#e9ecf5;overflow:hidden;margin-top:12px}
.bq-prog i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#4b3ee0,#7a5cf0);
  transition:width .22s ease}
.bq-badge{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;
  letter-spacing:.05em;text-transform:uppercase;padding:4px 9px;border-radius:99px;border:1.5px solid transparent}
.bq-badge.q{background:#e8f7ee;color:#157a43;border-color:#c9ecd8}
.bq-badge.h{background:#eef3ff;color:#274b8b;border-color:#d3e0f7}
.bq-badge.f{background:#f4f5fa;color:#5b6480;border-color:#e6e9f3}
.bq-badge.qp{background:#eef7ff;color:#1d5f9e;border-color:#cfe6f9}
.bq-badge.d{background:#f3f0ff;color:#5a3fb8;border-color:#ded4fb}
.bq-badge.dp{background:#f6f3ff;color:#6b52bd;border-color:#e5dcfb}
.bq-badge.bank{background:#f2f0ff;color:#4b3ee0;border-color:#ddd6ff}
`;
    document.head.appendChild(css);
  }

  const KINDS = {
    question:            ["q", "question"],
    "question-partial":  ["qp", "question, partly recovered"],
    definition:          ["d", "definition"],
    "definition-partial":["dp", "definition, partly recovered"],
    hint:                ["h", "hint text"],
    fragment:            ["f", "fragment"],
  };

  /**
   * createCard(host, item, opts?)
   *   item = { q, s, p, d, o, k, bank, title }
   *   opts.onNext  – called when Next is pressed
   *   opts.onPrev  – called when Prev is pressed
   *   opts.index, opts.total – progress meter
   */
  function createCard(host, item, opts) {
    opts = opts || {};
    const st = { reveal: false, hint: false, picked: null, answered: false };

    const stem = TEX.cleanBank ? TEX.cleanBank(item.q) : String(item.q || "");
    const hasGap = /\u0000/.test(stem);
    const kind = KINDS[item.k] || KINDS.fragment;

    function gapHtml(text) {
      const parts = String(text).split("\u0000");
      return parts.map((p) => TEX.render(p)).join('<span class="bq-gap"></span>');
    }
    function stemHtml() { return gapHtml(stem); }

    const metaBits = [
      item.bank ? item.bank.replace("_", " Ch ") : "",
      item.s || "",
      item.p ? `Page ${item.p}` : "",
      item.d || "",
    ].filter(Boolean);

    // clean up the recovered answer options: drop the truncated leftovers
    const optList = (() => {
      const raw = (item.o || [])
        .map((o) => (TEX.cleanBank ? TEX.cleanBank(o) : o))
        .filter((o) => o && o.replace(/\u0000/g, "").trim().length >= 6);
      const seen = new Set();
      return raw.filter((o) => {
        const k = o.replace(/\u0000/g, "|");
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      }).slice(0, 4);
    })();

    const card = document.createElement("div");
    card.className = "bq-card";
    card.innerHTML = `
      <div class="bq-top">
        <span class="bq-badge bank">${item.bank ? item.bank.replace("_", " Ch ") : "bank"}</span>
        <span class="bq-badge ${kind[0]}">${kind[1]}</span>
        ${hasGap ? `<span class="bq-badge f" style="background:#fff8e6;color:#8a6d1f;border-color:#f0e0a8">has number gap</span>` : ""}
      </div>
      <p class="bq-stem" id="bqStem">${stemHtml()}</p>
      ${optList.length ? `<ul class="bq-opts" id="bqOpts">${optList.map((o, i) =>
        `<li class="bq-opt" data-i="${i}"><span class="k">${"ABCD"[i]}</span><span class="v">${gapHtml(o)}</span></li>`).join("")}</ul>` : ""}
      <div id="bqAnswer" style="margin-top:14px;display:none">
        <label for="bqIn" style="display:block;font-size:12.5px;font-weight:700;color:#5b6480;margin-bottom:6px">
          Work it out here — this is not marked
        </label>
        <input id="bqIn" class="input" placeholder="Type your answer or working" autocomplete="off" spellcheck="false"
          style="width:100%;padding:11px 13px;border-radius:10px;border:1.5px solid var(--line,#e2e7f2);font:inherit;background:var(--surface,#fff)">
      </div>
      <div id="bqPanel"></div>
      <div class="bq-tools">
        <button class="bq-btn primary" id="bqGo">Reveal my answer</button>
        <button class="bq-btn" id="bqHint">Show hint</button>
        <button class="bq-btn ghost" id="bqNext">Next \u2192</button>
        <button class="bq-btn ghost" id="bqPrev">\u2190 Prev</button>
      </div>
      <div class="bq-meta">${metaBits.map((x) => `<span>${x}</span>`).join('<span class="dot">·</span>')}</div>
      ${opts.total ? `<div class="bq-prog"><i style="width:${Math.round(((opts.index + 1) / opts.total) * 100)}%"></i></div>` : ""}
    `;
    host.innerHTML = "";
    host.appendChild(card);

    const $ = (s) => card.querySelector(s);
    const panel = $("#bqPanel");

    function note(html, cls) {
      panel.innerHTML = `<div class="bq-panel ${cls || "note"}">${html}</div>`;
    }

    function resetPanel() { panel.innerHTML = ""; }

    const answerBox = $("#bqAnswer");
    const answerInput = $("#bqIn");
    const isQuestion = /^question/.test(item.k || "");
    if (answerBox && isQuestion) {
      answerBox.style.display = "block";
    }
    if (answerBox && !isQuestion) $("#bqGo").textContent = "Got it";

    $("#bqGo").addEventListener("click", () => {
      st.answered = true;
      resetPanel();
      // count it, then give the reader the next card
      if (typeof opts.onMark === "function") opts.onMark(item);
      const wrote = isQuestion && answerInput ? (answerInput.value || "").trim() : "";
      note(
        `<b>${isQuestion ? "Your answer" : "Card marked done"}.</b> ` +
        (wrote
          ? `Recorded: <b>${wrote.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]))}</b>. `
          : "") +
        `This record came out of the original <code>.bnk</code> file without a stored
         answer${hasGap ? `, and with its numbers missing` : ""}, so there is nothing to
         check against — the wording is the part that was recovered.`,
        "note"
      );
      $("#bqGo").textContent = "Marked";
      $("#bqGo").disabled = true;
      if (typeof opts.onNext === "function") {
        clearTimeout(st.advance);
        st.advance = setTimeout(() => opts.onNext(), 900);
      }
    });

    $("#bqHint").addEventListener("click", () => {
      st.hint = !st.hint;
      $("#bqHint").textContent = st.hint ? "Hide hint" : "Show hint";
      if (st.hint) {
        note(
          `<b>Where this came from.</b> ${item.title ? item.title + ". " : ""}` +
          (item.s ? `Skill: <b>${item.s}</b>. ` : "") +
          (item.p ? `Page ${item.p}. ` : "") +
          (item.k === "hint"
            ? `This record reads cleanly but looks like teaching text rather than a question stem.`
            : item.k === "fragment"
              ? `Parts of this record did not decrypt — treat the wording as approximate.`
              : `The wording decrypted cleanly.`),
          "hint"
        );
      } else resetPanel();
    });

    const optEl = $("#bqOpts");
    if (optEl) {
      optEl.querySelectorAll(".bq-opt").forEach((li) => {
        li.tabIndex = 0;
        li.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); li.click(); }
        });
      });
      optEl.addEventListener("click", (e) => {
        const li = e.target.closest(".bq-opt");
        if (!li) return;
        optEl.querySelectorAll(".bq-opt").forEach((x) => x.classList.remove("sel"));
        li.classList.add("sel");
        st.picked = +li.dataset.i;
        li.classList.add("sel");
        note(
          `Locked in <b>${"ABCD"[st.picked]}</b>. The bank stores the option text but not
           which one was correct, so there is no automatic marking — the wording is
           what was recovered.`,
          "note"
        );
      });
    }

    function go(delta) {
      const fn = delta > 0 ? opts.onNext : opts.onPrev;
      if (fn) fn();
    }
    $("#bqNext").addEventListener("click", () => go(+1));
    $("#bqPrev").addEventListener("click", () => go(-1));

    return { el: card, state: st };
  }

  ML.bankCard = { createCard };
})();

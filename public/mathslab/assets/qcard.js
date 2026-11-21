/* ===========================================================
   MathsLab — the question card
   One component renders every kind of question in the studio:

     · graded      calculus bank + lesson quizzes (real answer key)
     · MCQ         FikrCounts (options, key not in the export)
     · recovered   .bnk records (wording recovered, numbers lost)

   Interactivity
     · pick with A–D / 1–4, Enter to check, H hint, S save, ← → to move
     · graded cards mark themselves and explain every option
     · keyless cards lock your choice in, then you self-report
     · recovered cards let you click each ruled gap and type your own
       number, or randomise the whole set, so the stem becomes a real
       question you can actually answer
     · star, copy, read-aloud, and a live progress ring
   =========================================================== */
(function () {
  "use strict";
  const ML = (window.ML = window.ML || {});
  const U = ML.u;
  const QD = () => ML.qdata;
  const LETTER = "ABCD";

  const ICON = {
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.7l6.1-.9z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="8.5" y="8.5" width="11" height="11" rx="2.2"/><path d="M5.5 15.5h-1a1.5 1.5 0 0 1-1.5-1.5V5.5A1.5 1.5 0 0 1 4.5 4H13a1.5 1.5 0 0 1 1.5 1.5v1"/></svg>',
    speak: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M4 9.5h3.5L12 6v12L7.5 14.5H4z"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M18 6.5a8 8 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
    dice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3.5" y="3.5" width="17" height="17" rx="3.4"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.3" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor"/></svg>',
  };
  const CHEV_L = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6l-6 6 6 6"/></svg>';
  const CHEV_R = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 6l6 6-6 6"/></svg>';

  const KIND_TEXT = {
    question: "question", "question-partial": "wording part-recovered",
    definition: "definition", "definition-partial": "definition · part-recovered",
    hint: "hint text", fragment: "fragment", mcq: "multiple choice", graded: "marked",
  };

  const SRC_NAME = { bnk: "Recovered .bnk", fikr: "FikrCounts", calc: "Calculus bank", lab: "Lesson quiz", fom: "Fundamentals of Math", tg: "TestGen .BOK" };
  const SRC_NOTE = {
    bnk: "Decrypted from an original Quiz Show <b>.bnk</b> bank. The wording survived; the generated numbers did not — the ruled gaps are where they were.",
    fikr: "Exported from the FikrCounts question bank. The export kept the wording and the four options but not the answer key, so mark this one yourself.",
    calc: "From the Dr. Math Azzam calculus question bank — this one has a stored answer key, per-option feedback and an explanation.",
    lab: "A quiz checkpoint lifted from the course pages, with its correct answer and feedback.",
    fom: "Written for the Fundamentals of Math course — a stored answer key, a hint and the reasoning behind the answer.",
    tg: "Wording recovered from a TestGen <b>.BOK</b> bank. The maths that lived in the file's formula objects shows as ruled gaps.",
  };

  function ring(pct) {
    const r = 15.5, c = 2 * Math.PI * r;
    return '<div class="qring"><svg width="38" height="38" viewBox="0 0 38 38">' +
      '<circle cx="19" cy="19" r="' + r + '" fill="none" stroke="#e9ecf5" stroke-width="4"/>' +
      '<circle cx="19" cy="19" r="' + r + '" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" ' +
      'stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - pct)).toFixed(1) + '" style="color:var(--qs-accent)"/></svg>' +
      '<span>' + Math.round(pct * 100) + "</span></div>";
  }

  /**
   * create(host, item, opts)
   *   opts.index / opts.total     position in the deck
   *   opts.onNext / onPrev        navigation
   *   opts.onAnswer(correct)      correct: true | false | null (self-reported)
   *   opts.onStar(id, on)
   *   opts.hideNav                session mode supplies its own controls
   */
  function create(host, item, opts) {
    opts = opts || {};
    const qd = QD();
    const st = { picked: null, checked: false, hint: false, selfMarked: false, gapVals: {} };

    const r = qd.rec(item.id);
    const graded = item.a != null;
    const rec = item.src === "bnk";
    const stemText = rec ? qd.cleanBank(item.q) : item.q;
    const gaps = rec && qd.hasGap(stemText);

    const diffKey = item.diff === "Easy" || item.diff === "Basic" ? "d1"
      : item.diff === "Medium" || item.diff === "Average" ? "d2"
      : item.diff ? "d3" : "";
    const kindText = KIND_TEXT[item.kind] || item.kind || "";

    /* ---------- head ---------- */
    const headBits = [
      '<span class="qchip src">' + SRC_NAME[item.src] + "</span>",
      '<span class="qchip unit" title="' + ML.qdata.esc(item.unit) + '">' + ML.qdata.esc(item.unit) + "</span>",
      item.diff ? '<span class="qchip ' + diffKey + '">' + ML.qdata.esc(item.diff) + "</span>" : "",
      item.kind && item.src === "bnk" ? '<span class="qchip plain">' + ML.qdata.esc(kindText) + "</span>" : "",
      gaps ? '<span class="qchip plain" title="Numbers were generated by the original program">number gaps</span>' : "",
    ].filter(Boolean).join("");

    /* ---------- options ---------- */
    const opts_ = (item.o || []).map((o) => rec ? qd.cleanBank(o) : o)
      .filter((o) => o && String(o).replace(/\u0000/g, "").trim().length > 0);
    const seenOpt = new Set();
    const optList = opts_.filter((o) => { const k = String(o).replace(/\u0000/g, "|"); if (seenOpt.has(k)) return false; seenOpt.add(k); return true; }).slice(0, 5);

    /* ---------- markup ---------- */
    host.innerHTML = "";
    const card = U.el("div", { class: "qcard", "data-src": item.src });
    card.innerHTML =
      '<div class="qcard-head">' + headBits +
        '<div class="qcard-tools">' +
          '<button class="qicobtn js-star' + (r.st ? " on" : "") + '" title="Save for later (S)" aria-pressed="' + (!!r.st) + '">' + ICON.star + "</button>" +
          (gaps ? '<button class="qicobtn js-dice" title="Put random numbers in the gaps">' + ICON.dice + "</button>" : "") +
          '<button class="qicobtn js-speak" title="Read the question aloud">' + ICON.speak + "</button>" +
          '<button class="qicobtn js-copy" title="Copy the question text">' + ICON.copy + "</button>" +
        "</div>" +
      "</div>" +
      (opts.total ? (function () {
        const pos = opts.covered != null ? opts.covered : opts.index + 1;
        const pct = opts.total ? pos / opts.total : 0;
        const label = opts.covered != null
          ? pos.toLocaleString() + " of " + opts.total.toLocaleString() + " opened" +
            (opts.unit ? " in " + ML.qdata.esc(opts.unit) : " in this deck")
          : "Card " + (opts.index + 1) + " of " + opts.total;
        return '<div class="qcard-prog">' + ring(pct) +
          '<div class="qprog-wrap"><div class="qprog-top"><span>' + label + "</span>" +
          "<span>" + Math.round(pct * 100) + "%</span></div>" +
          '<div class="qprog"><i style="width:' + Math.max(1.5, pct * 100).toFixed(1) + '%"></i></div></div></div>';
      })() : "") +
      '<div class="qcard-body">' +
        '<div class="qcard-stem" id="qStem">' + qd.html(stemText, { gaps: gaps, gapIndex: 0 }) + "</div>" +
        (optList.length ? '<ul class="qopts" id="qOpts">' + optList.map((o, i) =>
          '<li><button class="qopt" data-i="' + i + '" type="button"><span class="k">' + LETTER[i] + "</span>" +
          '<span class="v">' + qd.html(o, { gaps: rec }) + "</span>" +
          '<span class="mark"></span></button></li>').join("") + "</ul>" : "") +
        '<div id="qPanel"></div>' +
        '<div class="qacts">' +
          (graded
            ? '<button class="btn" id="qCheck">Check answer</button>'
            : optList.length
              ? '<button class="btn" id="qCheck" disabled>Lock in my choice</button>'
              : '<button class="btn" id="qCheck">I worked it out</button>') +
          '<button class="btn ghost" id="qHint">Show hint</button>' +
          '<button class="btn ghost" id="qReveal">Show answer</button>' +
          (opts.hideNav ? "" : '<div class="qnav"><button class="btn ghost sm" id="qPrev">' + CHEV_L + " Prev</button>" +
            '<button class="btn sm" id="qNext">Next ' + CHEV_R + "</button></div>") +
        "</div>" +
        '<div class="qcard-meta">' +
          (item.skill ? "<span><b>" + ML.qdata.esc(item.skill) + "</b></span>" : "") +
          (item.page ? '<span class="dot">·</span><span>page ' + ML.qdata.esc(item.page) + "</span>" : "") +
          (item.chapter ? '<span class="dot">·</span><span>' + ML.qdata.esc(item.chapter) + "</span>" : "") +
          (item.grade ? '<span class="dot">·</span><span>' + ML.qdata.esc(item.grade) + "</span>" : "") +
          (r.c || r.w ? '<span class="dot">·</span><span>you: ' + r.c + " ✓ / " + r.w + " ✗</span>" : "") +
          (r.st ? '<span class="dot">·</span><span>saved</span>' : "") +
        "</div>" +
        '<div class="qkeyhint">' +
          (optList.length ? "<span><kbd>1</kbd>–<kbd>" + optList.length + "</kbd> pick</span>" : "") +
          "<span><kbd>Enter</kbd> check / next</span><span><kbd>H</kbd> hint</span>" +
          "<span><kbd>S</kbd> save</span><span><kbd>←</kbd> <kbd>→</kbd> move</span>" +
        "</div>" +
      "</div>";
    host.appendChild(card);

    const $ = (s) => card.querySelector(s);
    const panel = $("#qPanel");
    const stemEl = $("#qStem");
    const optRoot = $("#qOpts");
    const checkBtn = $("#qCheck");

    qd.markSeen(item.id);

    /* ---------- helpers ---------- */
    function note(html, cls) {
      panel.innerHTML = '<div class="qpanel ' + (cls || "note") + '">' + html + "</div>";
      return panel.firstChild;
    }
    function clearPanel() { panel.innerHTML = ""; }

    function spark(text) {
      const s = U.el("div", { class: "qspark" }, text);
      s.style.left = "50%";
      s.style.top = "38%";
      card.appendChild(s);
      setTimeout(() => s.remove(), 950);
    }

    const speech = () => (window.speechSynthesis ? window.speechSynthesis : null);

    /* ---------- gap filling ---------- */
    function wireGaps() {
      stemEl.querySelectorAll(".qgap").forEach((g) => {
        const open = () => {
          if (g.querySelector("input")) return;
          const idx = +g.dataset.gap;
          const inp = document.createElement("input");
          inp.type = "text";
          inp.inputMode = "numeric";
          inp.maxLength = 4;
          inp.value = st.gapVals[idx] != null ? String(st.gapVals[idx]) : "";
          inp.setAttribute("aria-label", "your number");
          g.classList.add("filled");
          g.textContent = "";
          g.appendChild(inp);
          inp.focus();
          inp.addEventListener("input", () => {
            st.gapVals[idx] = inp.value;
            if (inp.value) st.gapVals[idx] = inp.value.replace(/[^\d.\-]/g, "");
          });
          inp.addEventListener("keydown", (e) => e.stopPropagation());
          inp.addEventListener("blur", () => {
            if (!inp.value) { g.classList.remove("filled"); g.textContent = "?"; }
            else g.textContent = inp.value;
          });
        };
        g.addEventListener("click", open);
        g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
      });
    }
    if (gaps) wireGaps();

    function randomiseGaps() {
      st.gapVals = {};
      stemEl.querySelectorAll(".qgap").forEach((g) => {
        const v = U.randInt(2, 19);
        st.gapVals[g.dataset.gap] = String(v);
        g.classList.add("filled");
        g.textContent = String(v);
      });
      ML.toast("Numbers dropped in — now the question is concrete", "ok");
      U.sound.click();
    }

    /* ---------- option pick ---------- */
    function optionEls() { return optRoot ? Array.from(optRoot.querySelectorAll(".qopt")) : []; }

    function pick(i) {
      if (!optRoot) return;
      if (st.checked) return;
      const els = optionEls();
      els.forEach((b, j) => b.classList.toggle("sel", j === i));
      st.picked = i;
      checkBtn.disabled = false;
      U.sound.click();
      if (!graded) clearPanel();
    }

    /* ---------- checking ---------- */
    function grade(correct) {
      if (typeof opts.onAnswer === "function") opts.onAnswer(correct);
    }

    function doCheck() {
      if (st.checked) { if (!opts.hideNav && opts.onNext) opts.onNext(); return; }
      if (!optRoot && graded) return;
      if (optRoot && st.picked == null) {
        note("Pick an option first — <b>1</b>–<b>" + optList.length + "</b> or click one.", "hint");
        return;
      }

      if (graded) {
        st.checked = true;
        const els = optionEls();
        const ok = st.picked === item.a;
        els.forEach((b, j) => {
          b.disabled = true;
          b.classList.remove("sel");
          if (j === item.a) { b.classList.add("ok"); b.querySelector(".mark").textContent = "✓"; }
          if (j === st.picked && !ok) { b.classList.add("no"); b.querySelector(".mark").textContent = "✗"; }
          if (j !== item.a && j !== st.picked) b.classList.add("dim");
        });
        checkBtn.textContent = "Next question";
        card.classList.add(ok ? "qc-ok" : "qc-no");
        ok ? U.sound.ok() : U.sound.no();
        if (ok) spark("✓ nice");

        const chosenFb = st.picked != null ? (item.fb && item.fb[st.picked]) : "";
        note(
          '<div class="pm">' + (ok ? "✓ Correct" : "✗ Not quite") + "</div>" +
          (ok ? "" : "The answer is <b>" + LETTER[item.a] + "</b>. ") +
          (chosenFb && !ok ? "<div style='margin-top:4px'>" + chosenFb + "</div>" : "") +
          (item.expl ? '<div style="margin-top:6px">' + (window.ML.qdata ? ML.qdata.html(item.expl) : item.expl) + "</div>" : ""),
          ok ? "good" : "bad"
        );
        grade(!!ok);
        return;
      }

      /* keyless: lock in, then self-report */
      st.checked = true;
      checkBtn.textContent = "Next question";

      if (!optRoot) {
        panel.innerHTML =
          '<div class="qpanel note"><div class="pm">No answer key in this record</div>' +
          "Work it out on paper, then tell the deck how it went." +
          '<div class="qself">' +
            '<button class="btn good sm" id="qSelfOk">I worked it out</button>' +
            '<button class="btn ghost sm" id="qSelfNo">Keep it for review</button>' +
          "</div></div>";
        panel.querySelector("#qSelfOk").addEventListener("click", () => selfMark(true));
        panel.querySelector("#qSelfNo").addEventListener("click", () => selfMark(false));
        return;
      }

      optionEls().forEach((b, j) => {
        b.disabled = true;
        b.classList.toggle("sel", j === st.picked);
        if (j !== st.picked) b.classList.add("dim");
      });
      panel.innerHTML =
        '<div class="qpanel note"><div class="pm">Locked in ' + LETTER[st.picked] + "</div>" +
        (item.src === "fikr"
          ? "The FikrCounts export kept the four options but dropped the key, so this one is yours to mark."
          : "This record has no stored answer — mark it yourself.") +
        '<div class="qself">' +
          '<button class="btn good sm" id="qSelfOk">I got it right</button>' +
          '<button class="btn ghost sm" id="qSelfNo">Not yet — keep it in the deck</button>' +
        "</div></div>";
      panel.querySelector("#qSelfOk").addEventListener("click", () => selfMark(true));
      panel.querySelector("#qSelfNo").addEventListener("click", () => selfMark(false));
    }

    function selfMark(ok) {
      st.selfMarked = true;
      card.classList.add(ok ? "qc-ok" : "qc-no");
      ok ? U.sound.ok() : U.sound.no();
      if (ok) spark("+1");
      note(
        '<div class="pm">' + (ok ? "✓ Marked correct" : "✗ Marked for review") + "</div>" +
        (ok ? "Saved to your streak." : "It stays flagged so you can find it again under <b>Review</b>.") +
        (item.skill ? '<div style="margin-top:4px">Skill: <b>' + ML.qdata.esc(item.skill) + "</b></div>" : ""),
        ok ? "good" : "bad"
      );
      grade(!!ok);
    }

    function reveal() {
      if (graded) {
        st.checked = true;
        optionEls().forEach((b, j) => {
          b.disabled = true;
          b.classList.remove("sel");
          if (j === item.a) { b.classList.add("ok"); b.querySelector(".mark").textContent = "✓"; }
        });
        checkBtn.textContent = "Next question";
        note('<div class="pm">Answer: ' + LETTER[item.a] + "</div>" + (window.ML.qdata ? ML.qdata.html(item.expl || "") : (item.expl || "")), "hint");
        return;
      }
      const meta = [
        item.skill ? "Skill: <b>" + ML.qdata.esc(item.skill) + "</b>" : "",
        item.page ? "page " + ML.qdata.esc(item.page) : "",
        item.chapter ? ML.qdata.esc(item.chapter) : "",
        item.diff ? "difficulty " + ML.qdata.esc(item.diff) : "",
      ].filter(Boolean).join(" · ");
      note(
        '<div class="pm">No answer key in the source</div>' + SRC_NOTE[item.src] +
        (meta ? '<div style="margin-top:6px">' + meta + "</div>" : "") +
        (!gaps ? "" : '<div style="margin-top:6px">Tip: put your own numbers into the gaps first — then the question has an answer you can find.</div>'),
        "hint"
      );
      if (gaps) randomiseGaps();
    }

    function toggleHint() {
      st.hint = !st.hint;
      $("#qHint").textContent = st.hint ? "Hide hint" : "Show hint";
      if (!st.hint) { clearPanel(); return; }
      if (graded) {
        note("<div class='pm'>Hint</div>" + (window.ML.qdata ? ML.qdata.html(item.hint || "Work through it step by step: what is being asked, what is given, and which rule connects them.") : (item.hint || "")), "hint");
      } else {
        note("<div class='pm'>Where this came from</div>" + SRC_NOTE[item.src] +
          (item.skill ? '<div style="margin-top:6px">Skill: <b>' + ML.qdata.esc(item.skill) + "</b></div>" : "") +
          (gaps ? '<div style="margin-top:6px">Click any ruled gap to put your own number in, or use the dice button to fill them all.</div>' : ""),
          "hint");
      }
    }

    /* ---------- wiring ---------- */
    if (optRoot) {
      optRoot.addEventListener("click", (e) => {
        const b = e.target.closest(".qopt");
        if (!b || b.disabled) return;
        pick(+b.dataset.i);
      });
    }
    checkBtn.addEventListener("click", doCheck);
    $("#qHint").addEventListener("click", toggleHint);
    $("#qReveal").addEventListener("click", reveal);
    const navPrev = $("#qPrev"), navNext = $("#qNext");
    if (navPrev && opts.onPrev) navPrev.addEventListener("click", () => opts.onPrev());
    if (navNext && opts.onNext) navNext.addEventListener("click", () => opts.onNext());
    $(".js-star").addEventListener("click", (e) => {
      const on = qd.star(item.id);
      e.currentTarget.classList.toggle("on", on);
      e.currentTarget.setAttribute("aria-pressed", on ? "true" : "false");
      ML.toast(on ? "Saved to your starred deck" : "Removed from starred", "ok");
      if (typeof opts.onStar === "function") opts.onStar(item.id, on);
    });
    const dice = $(".js-dice");
    if (dice) dice.addEventListener("click", randomiseGaps);
    $(".js-copy").addEventListener("click", () => {
      const plain = stemEl.textContent.replace(/\s+/g, " ").trim();
      U.copy(plain + (optList.length ? "\n" + optList.map((o, i) => LETTER[i] + ". " + o).join("\n") : ""));
    });
    $(".js-speak").addEventListener("click", () => {
      const sp = speech();
      if (!sp) { ML.toast("This browser has no speech", "no"); return; }
      sp.cancel();
      const u = new SpeechSynthesisUtterance(stemEl.textContent.replace(/\s+/g, " ").trim());
      u.rate = 0.95;
      sp.speak(u);
    });

    /* keyboard */
    function onKey(e) {
      if (!document.body.contains(card)) return;
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      const k = e.key;
      if (/^[1-5]$/.test(k) && optRoot) { const i = +k - 1; if (i < optionEls().length) { pick(i); e.preventDefault(); } return; }
      if (/^[a-eA-E]$/.test(k) && optRoot) {
        const i = "abcde".indexOf(k.toLowerCase());
        if (i < optionEls().length) { pick(i); e.preventDefault(); }
        return;
      }
      if (k === "Enter") {
        if (st.checked) { if (opts.onNext) opts.onNext(); }
        else doCheck();
        e.preventDefault();
      } else if (k === "h" || k === "H") toggleHint();
      else if (k === "s" || k === "S") $(".js-star").click();
      else if (k === "ArrowRight" && opts.onNext) opts.onNext();
      else if (k === "ArrowLeft" && opts.onPrev) opts.onPrev();
    }
    document.addEventListener("keydown", onKey);

    return {
      el: card,
      destroy() { document.removeEventListener("keydown", onKey); const sp = speech(); if (sp) sp.cancel(); },
    };
  }

  ML.qcard = { create, SRC_NAME, KIND_TEXT, ICON };
})();

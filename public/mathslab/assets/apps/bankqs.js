/* ===========================================================
   MathsLab — Bank Questions
   Every record recovered from the 31 original .bnk banks,
   browsable with an interactive card. The text is what came out
   of the decryption; the type badge says how much to trust it.
   =========================================================== */
(function () {
  "use strict";
  const ML = window.ML, U = ML.u;
  const BANKS = window.QSBANKS || [];

  const KINDS = {
    playable: { label: "Playable", hint: "questions and partly-recovered questions — 700 records" },
    definition: { label: "Definitions", hint: "vocabulary copied straight out of the banks" },
    readable: { label: "Readable", hint: "every word came back as a real word" },
    all: { label: "Everything", hint: "all 2,840 recovered records" },
  };

  const PLAYABLE = { question: 1, "question-partial": 1 };
  const DEFS = { definition: 1, "definition-partial": 1 };
  const READABLE = { question: 1, "question-partial": 1, definition: 1, "definition-partial": 1, hint: 1 };

  ML.register({
    id: "bankqs", group: "games", title: "Bank Questions",
    short: "Bank Questions", icon: ML.icon("bulb"),
    color: ["#e8f1ff", "#1c57b5"], tag: "Recovered question bank",
    blurb: "Every question recovered from the original .bnk files, as an interactive card deck — filter by how cleanly each one decrypted.",
    tags: ["Question Sets", "31 chapters", "recovered text", "interactive"],
    mount(root) {
      const st = {
        bank: U.store.get("bq2:bank", ""),
        filter: U.store.get("bq2:filter", "playable"),
        i: 0,
        order: [],
        seen: new Set(U.store.get("bq2:seen", []) || []),
      };

      const wrap = U.el("div", { class: "app-layout" });
      wrap.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Filter</div>
            <div class="panel-b tight">
              <div class="seg seg-col" id="kindSeg">
                <button data-f="playable">Playable</button>
                <button data-f="definition">Definitions</button>
                <button data-f="readable">Readable</button>
                <button data-f="all">Everything</button>
              </div>
              <div class="small muted" id="kindHint" style="margin-top:8px"></div>
            </div>
          </div>
          <div class="panel">
            <div class="panel-h">Chapter</div>
            <div class="panel-b tight">
              <select class="input" id="bankSel" style="width:100%"></select>
            </div>
          </div>
          <div class="panel">
            <div class="panel-h">Deck</div>
            <div class="panel-b tight">
              <div class="row2">
                <div class="stat"><span>Card</span><b id="pos">0 / 0</b></div>
                <div class="stat"><span>In deck</span><b id="deckN">0</b></div>
              </div>
              <button class="btn ghost sm" id="shuffleBtn" style="width:100%;margin-top:10px">${ML.icon("shuffle")} Shuffle deck</button>
              <div class="panel-h" style="margin:14px -2px 8px;padding:0;border:0">Progress</div>
              <div class="row2">
                <div class="stat"><span>Marked</span><b id="doneN">0</b></div>
                <div class="stat"><span>Left</span><b id="leftN">0</b></div>
              </div>
              <div class="bq-prog" style="margin-top:10px"><i id="doneBar" style="width:0%"></i></div>
              <button class="btn ghost sm" id="resetBtn" style="width:100%;margin-top:10px">Reset progress</button>
              <div class="small muted" style="margin-top:8px">Use <b>&rarr;</b> / <b>&larr;</b> to step through cards.</div>
            </div>
          </div>
          <div class="panel">
            <div class="panel-h">Reading this text</div>
            <div class="panel-b">
              <p class="small muted" style="margin:0 0 8px">
                These records were decrypted from the original <b>.bnk</b> files. A <b>ruled gap</b>
                is where the file held a generated number: the wording survived, the value did not.
              </p>
              <p class="small muted" style="margin:0">
                <b>question</b> &mdash; reads cleanly and asks something<br>
                <b>question, partly recovered</b> &mdash; asks something, some words are lossy<br>
                <b>definition</b> &mdash; vocabulary from the bank<br>
                <b>hint text</b> / <b>fragment</b> &mdash; teaching steps and partial records
              </p>
            </div>
          </div>
        </aside>
        <div><div id="cardHost"></div></div>`;

      root.appendChild(wrap);

      const $ = (s) => wrap.querySelector(s);
      const host = $("#cardHost");
      const bankSel = $("#bankSel");

      bankSel.innerHTML = `<option value="">All 31 chapters</option>` +
        BANKS.map((b) => `<option value="${b.id}">${b.id.replace("_", " Ch ")} — ${(b.title || "").split(":").pop().trim()}</option>`).join("");
      bankSel.value = st.bank;

      function kindOf(q) { return q.k || (q.c ? "hint" : "fragment"); }

      function buildDeck() {
        const banks = st.bank ? BANKS.filter((b) => b.id === st.bank) : BANKS;
        const out = [];
        for (const b of banks) {
          for (const q of b.q) {
            const k = kindOf(q);
            if (st.filter === "playable" && !PLAYABLE[k]) continue;
            if (st.filter === "definition" && !DEFS[k]) continue;
            if (st.filter === "readable" && !READABLE[k]) continue;
            out.push({ ...q, k, bank: b.id, title: b.title });
          }
        }
        return out;
      }

      function setFilter(f) {
        st.filter = f; U.store.set("bq2:filter", f);
        wrap.querySelectorAll("#kindSeg button").forEach((b) =>
          b.classList.toggle("on", b.dataset.f === f));
        const k = KINDS[f];
        $("#kindHint").textContent = k ? k.hint : "";
        rebuild();
      }

      function rebuild(keep) {
        const at = st.order[st.i];
        st.order = buildDeck();
        if (keep && at) {
          const j = st.order.indexOf(at);
          st.i = j >= 0 ? j : Math.min(st.i, Math.max(0, st.order.length - 1));
        } else st.i = 0;
        render();
      }

      function keyOf(item) {
        return item.bank + "|" + (item.q || "").slice(0, 60);
      }

      function updateProgress() {
        const n = st.order.length;
        const done = st.order.filter((x) => st.seen.has(keyOf(x))).length;
        $("#doneN").textContent = String(done);
        $("#leftN").textContent = String(Math.max(0, n - done));
        // a single mark out of 2,840 would round to 0 % and look broken
        const pct = n ? Math.max(done ? 1 : 0, Math.round((done / n) * 100)) : 0;
        $("#doneBar").style.width = pct + "%";
      }

      function render() {
        const n = st.order.length;
        $("#pos").textContent = n ? `${st.i + 1} / ${n}` : "0 / 0";
        $("#deckN").textContent = String(n);
        updateProgress();
        if (!n) {
          host.innerHTML = `<div class="card pad"><p class="muted" style="margin:0">No cards match that filter.</p></div>`;
          return;
        }
        ML.bankCard.createCard(host, st.order[st.i], {
          index: st.i, total: n,
          onNext: () => { st.i = (st.i + 1) % n; render(); },
          onPrev: () => { st.i = (st.i - 1 + n) % n; render(); },
          onMark: (item) => {
            st.seen.add(keyOf(item));
            U.store.set("bq2:seen", Array.from(st.seen).slice(-4000));
          },
        });
      }

      wrap.querySelectorAll("#kindSeg button").forEach((b) => {
        if (b.dataset.f === st.filter) b.classList.add("on");
        b.addEventListener("click", () => setFilter(b.dataset.f));
      });
      $("#kindHint").textContent = (KINDS[st.filter] || {}).hint || "";

      bankSel.addEventListener("change", () => {
        st.bank = bankSel.value;
        U.store.set("bq2:bank", st.bank);
        rebuild(false);
      });

      $("#resetBtn").addEventListener("click", () => {
        st.seen = new Set();
        U.store.set("bq2:seen", []);
        render();
        ML.toast("Progress reset", "ok");
      });

      $("#shuffleBtn").addEventListener("click", () => {
        for (let i = st.order.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [st.order[i], st.order[j]] = [st.order[j], st.order[i]];
        }
        st.i = 0; render(); ML.toast("Deck shuffled", "ok");
      });

      document.addEventListener("keydown", (e) => {
        if (!document.body.contains(wrap)) return;      // view changed
        if (e.target && /input|select|textarea/i.test(e.target.tagName)) return;
        if (e.key === "ArrowRight") { st.i = (st.i + 1) % Math.max(1, st.order.length); render(); }
        if (e.key === "ArrowLeft") { st.i = (st.i - 1 + Math.max(1, st.order.length)) % Math.max(1, st.order.length); render(); }
      });

      rebuild(false);
    },
  });
})();

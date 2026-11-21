/* ===========================================================
   MathsLab — money: Buying with Coins · Finding Change
   =========================================================== */
(function () {
  "use strict";
  const ML = window.ML, U = ML.u;

  const COINS = [
    { v: 1, name: "1p", bg: "#b87333", fg: "#fff", r: 13 },
    { v: 2, name: "2p", bg: "#b87333", fg: "#fff", r: 15 },
    { v: 5, name: "5p", bg: "#8f8f8f", fg: "#fff", r: 17 },
    { v: 10, name: "10p", bg: "#8f8f8f", fg: "#fff", r: 19 },
    { v: 20, name: "20p", bg: "#c9a227", fg: "#3a2c00", r: 21 },
    { v: 50, name: "50p", bg: "#c9a227", fg: "#3a2c00", r: 23 },
    { v: 100, name: "£1", bg: "#d4af37", fg: "#3a2c00", r: 26 },
    { v: 200, name: "£2", bg: "#d4af37", fg: "#3a2c00", r: 29 },
  ];
  const coinBy = (v) => COINS.find((c) => c.v === v);
  function money(p) {
    const sign = p < 0 ? "−" : "";
    p = Math.abs(p);
    return sign + "£" + Math.floor(p / 100) + "." + String(p % 100).padStart(2, "0");
  }
  ML.money = money;

  function coinSvg(v, size = 44, cls = "") {
    const c = coinBy(v);
    const s = size;
    const label = c.name;
    const fs = label.length > 2 ? s * 0.3 : s * 0.36;
    return `<svg class="${cls}" width="${s}" height="${s}" viewBox="0 0 100 100" aria-hidden="true">
      <defs><radialGradient id="cg${v}" cx="35%" cy="30%"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></radialGradient></defs>
      <circle cx="50" cy="50" r="47" fill="${c.bg}" stroke="rgba(0,0,0,.22)" stroke-width="2"/>
      <circle cx="50" cy="50" r="47" fill="url(#cg${v})"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5" stroke-dasharray="2 3"/>
      <text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-family="system-ui,sans-serif" font-weight="800" font-size="${fs * 2.6}" fill="${c.fg}">${label}</text>
    </svg>`;
  }

  /* =========================================================
     BUYING WITH COINS
     ========================================================= */
  const PENCIL = '<svg viewBox="0 0 48 48" width="46" height="46"><rect x="6" y="20" width="36" height="10" rx="2" fill="#f3c623"/><path d="M6 25 1 20l5-5z" fill="#f7dc6f"/><rect x="39" y="20" width="6" height="10" rx="1.5" fill="#e6459c"/><path d="M6 20h33v10H6z" fill="none" stroke="#c9a227" stroke-width="1.5"/></svg>';
  const RUBBER = '<svg viewBox="0 0 48 48" width="46" height="46"><rect x="8" y="16" width="32" height="18" rx="4" fill="#f7b8d6"/><rect x="8" y="16" width="32" height="8" rx="4" fill="#fdeaf4"/><path d="M8 24h32" stroke="#e6459c" stroke-width="1.5"/></svg>';
  const APPLE = '<svg viewBox="0 0 48 48" width="46" height="46"><circle cx="24" cy="27" r="14" fill="#e5484d"/><path d="M24 13c0-4 2-6 5-7" stroke="#7a4b1e" stroke-width="2.6" fill="none" stroke-linecap="round"/><ellipse cx="31" cy="10" rx="5" ry="3" fill="#1fa45b" transform="rotate(-20 31 10)"/><ellipse cx="18" cy="22" rx="4" ry="6" fill="#fff" opacity=".22"/></svg>';
  const RULER = '<svg viewBox="0 0 48 48" width="46" height="46"><rect x="4" y="18" width="40" height="12" rx="2" fill="#ffe9b0" stroke="#d4af37" stroke-width="2"/><path d="M10 18v6M16 18v4M22 18v6M28 18v4M34 18v6M40 18v4" stroke="#93630a" stroke-width="1.6"/></svg>';
  const NOTEBOOK = '<svg viewBox="0 0 48 48" width="46" height="46"><rect x="10" y="6" width="28" height="36" rx="3" fill="#2f7cf6"/><rect x="14" y="10" width="20" height="28" rx="2" fill="#e8f1ff"/><path d="M18 17h12M18 23h12M18 29h8" stroke="#2f7cf6" stroke-width="1.8" stroke-linecap="round"/><rect x="6" y="12" width="5" height="5" rx="1" fill="#1a58b8"/><rect x="6" y="22" width="5" height="5" rx="1" fill="#1a58b8"/><rect x="6" y="32" width="5" height="5" rx="1" fill="#1a58b8"/></svg>';
  const BALL = '<svg viewBox="0 0 48 48" width="46" height="46"><circle cx="24" cy="24" r="17" fill="#fff" stroke="#101828" stroke-width="2"/><path d="M24 14l6 4-2 7h-8l-2-7z" fill="#101828"/><path d="M12 20l8-2M36 20l-6-2M16 36l4-8M32 36l-4-8" stroke="#101828" stroke-width="2" fill="none"/></svg>';
  const BOOK = '<svg viewBox="0 0 48 48" width="46" height="46"><rect x="8" y="8" width="14" height="32" rx="2" fill="#7c4dff"/><rect x="24" y="10" width="14" height="30" rx="2" fill="#6d5efc"/><rect x="10" y="12" width="10" height="3" fill="#eeecff" opacity=".8"/><rect x="26" y="14" width="10" height="3" fill="#eeecff" opacity=".8"/></svg>';
  const CASE = '<svg viewBox="0 0 48 48" width="46" height="46"><rect x="8" y="16" width="32" height="18" rx="5" fill="#0f9d94"/><path d="M14 16v-3a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v3" fill="none" stroke="#0b7a73" stroke-width="3"/><rect x="20" y="22" width="8" height="4" rx="2" fill="#e0f7f5"/></svg>';
  const ICE = '<svg viewBox="0 0 48 48" width="46" height="46"><path d="M16 20 24 44 32 20z" fill="#f3c623"/><circle cx="24" cy="14" r="9" fill="#f7b8d6"/><circle cx="24" cy="10" r="6" fill="#fdeaf4"/><circle cx="24" cy="6" r="2.5" fill="#e5484d"/></svg>';
  const BOTTLE = '<svg viewBox="0 0 48 48" width="46" height="46"><rect x="18" y="4" width="12" height="6" rx="2" fill="#1a58b8"/><path d="M16 12h16v26a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z" fill="#8fd6ff"/><path d="M16 24h16v8H16z" fill="#2f7cf6" opacity=".65"/></svg>';
  const CAKE = '<svg viewBox="0 0 48 48" width="46" height="46"><path d="M6 38 24 12l18 26z" fill="#ffe9b0" stroke="#d4af37" stroke-width="2"/><path d="M6 38 24 12l6 9-13 17z" fill="#f7b8d6"/><circle cx="24" cy="13" r="3" fill="#e5484d"/></svg>';
  const STICKER = '<svg viewBox="0 0 48 48" width="46" height="46"><rect x="8" y="8" width="32" height="32" rx="8" fill="#fff6dd" stroke="#e8a008" stroke-width="2.5"/><path d="M24 15l2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2-4.5-4.4 6.2-.9z" fill="#e8a008"/></svg>';

  const SHOP = [
    { name: "Pencil", art: PENCIL, price: 35 },
    { name: "Rubber", art: RUBBER, price: 25 },
    { name: "Apple", art: APPLE, price: 42 },
    { name: "Ruler", art: RULER, price: 60 },
    { name: "Notebook", art: NOTEBOOK, price: 125 },
    { name: "Ball", art: BALL, price: 180 },
    { name: "Book", art: BOOK, price: 250 },
    { name: "Pencil case", art: CASE, price: 320 },
    { name: "Ice cream", art: ICE, price: 145 },
    { name: "Water bottle", art: BOTTLE, price: 210 },
    { name: "Cake slice", art: CAKE, price: 175 },
    { name: "Sticker pack", art: STICKER, price: 90 },
  ];

  ML.register({
    id: "coins", group: "money", title: "Buying With Coins",
    short: "Coins", icon: ML.icon('coin'), color: ["#fff6dd", "#93630a"], tag: "Money",
    blurb: "Pick an item, then pay for it with real-looking coins. Two modes: pay the exact amount, or work out what change is due.",
    tags: ["Buying With Coins.exe", "coin recognition", "paying exactly", "change"],
    mount(root) {
      const st = { mode: "exact", item: U.pick(SHOP), paid: [], score: 0, attempts: 0, showHint: false };
      const wrap = U.el("div", { class: "app-layout" });
      wrap.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Challenge</div>
            <div class="panel-b tight">
              <div class="seg" id="mSeg">
                <button data-m="exact" class="on">Pay exactly</button><button data-m="change">Make change</button>
              </div>
              <div class="row2">
                <div class="stat"><span>Correct</span><b id="sc">0</b></div>
                <div class="stat"><span>Tries</span><b id="at">0</b></div>
              </div>
              <button class="btn ghost sm" id="nextItem">${ML.icon("shuffle")} New item</button>
              <label class="check"><input type="checkbox" id="hintChk"> Show a coin hint</label>
              <div class="note">Tip: start with the biggest coins that still fit — that is how adults count change out.</div>
            </div>
          </div>
        </aside>
        <div class="stage">
          <div class="card pad" id="shopCard" style="margin-bottom:16px"></div>
          <div class="panel" style="margin-bottom:16px">
            <div class="panel-h">Coins <span class="small muted">click to add</span></div>
            <div class="panel-b">
              <div id="coinTray" style="display:flex;gap:12px;flex-wrap:wrap;align-items:end;justify-content:center"></div>
            </div>
          </div>
          <div class="panel">
            <div class="panel-h">Your payment</div>
            <div class="panel-b">
              <div id="paidTray" style="min-height:96px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:10px;border:2px dashed var(--line-2);border-radius:12px;background:var(--surface-2)"></div>
              <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-top:6px">
                <div class="stat"><span>Paid</span><b id="paidTotal" style="font-size:24px">£0.00</b></div>
                <div class="btn-row">
                  <button class="btn ghost sm" id="clearPaid">Clear</button>
                  <button class="btn good" id="checkPay">Check payment</button>
                </div>
              </div>
              <div id="msg" class="small" style="min-height:22px;font-weight:700"></div>
            </div>
          </div>
        </div>`;
      root.appendChild(wrap);

      const tray = wrap.querySelector("#coinTray");
      COINS.forEach((c) => {
        const b = U.el("button", { class: "coinbtn", title: "Add " + c.name, "aria-label": "Add " + c.name });
        b.style.cssText = "border:0;background:none;padding:0;cursor:pointer;transition:transform .08s";
        b.innerHTML = coinSvg(c.v, 56);
        b.addEventListener("mouseenter", () => (b.style.transform = "translateY(-3px)"));
        b.addEventListener("mouseleave", () => (b.style.transform = ""));
        b.addEventListener("click", () => { st.paid.push(c.v); U.sound.coin(); drawPaid(); });
        tray.appendChild(b);
      });

      wrap.querySelector("#mSeg").addEventListener("click", (e) => {
        const b = e.target.closest("button[data-m]"); if (!b) return;
        st.mode = b.dataset.m;
        U.$$("#mSeg button", wrap).forEach((x) => x.classList.toggle("on", x === b));
        st.paid = []; drawAll();
      });
      wrap.querySelector("#nextItem").addEventListener("click", () => {
        st.item = U.pick(SHOP.filter((i) => i !== st.item));
        st.paid = []; drawAll();
      });
      wrap.querySelector("#hintChk").addEventListener("change", (e) => { st.showHint = e.target.checked; drawShop(); });
      wrap.querySelector("#clearPaid").addEventListener("click", () => { st.paid = []; drawPaid(); });
      wrap.querySelector("#checkPay").addEventListener("click", check);

      function drawShop() {
        const it = st.item;
        let hint = "";
        if (st.showHint) {
          let rest = st.mode === "exact" ? it.price : (it.price <= 100 ? 100 : it.price <= 200 ? 200 : 500);
          if (st.mode === "change") rest = changeDue();
          const used = [];
          [...COINS].reverse().forEach((c) => { while (rest >= c.v) { used.push(c.name); rest -= c.v; } });
          hint = `<div class="badge info" style="margin-top:10px">Hint: ${used.join(" + ") || "nothing needed"}</div>`;
        }
        wrap.querySelector("#shopCard").innerHTML = `
          <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">
            <div style="width:84px;height:84px;border-radius:20px;display:grid;place-items:center;font-size:42px;background:linear-gradient(135deg,#fff6dd,#ffe9b0);box-shadow:var(--sh-1)">${it.art}</div>
            <div style="flex:1;min-width:180px">
              <div class="eyebrow">${st.mode === "exact" ? "Pay exactly" : "Work out the change"}</div>
              <h2 style="margin:2px 0">${it.name}</h2>
              <p class="muted small" style="margin:0">${st.mode === "exact" ? "Build the exact price with coins." : "You hand over a note. How much change should you get?"}</p>
              ${hint}
            </div>
            <div style="text-align:right">
              <div class="small muted" style="font-weight:750;letter-spacing:.08em;text-transform:uppercase">Price</div>
              <div style="font-size:40px;font-weight:850;letter-spacing:-.04em">${money(it.price)}</div>
            </div>
          </div>`;
      }
      function changeDue() {
        const note = st.item.price <= 100 ? 100 : st.item.price <= 200 ? 200 : 500;
        return note - st.item.price;
      }
      function paidTotal() { return st.paid.reduce((a, b) => a + b, 0); }
      function drawPaid() {
        const host = wrap.querySelector("#paidTray");
        host.innerHTML = st.paid.length
          ? st.paid.map((v, i) => `<span style="display:inline-flex;align-items:center" data-i="${i}">${coinSvg(v, 40)}</span>`).join("")
          : `<span class="muted small">Click coins above to place them here</span>`;
        U.$$("[data-i]", host).forEach((n) => n.addEventListener("click", () => { st.paid.splice(+n.dataset.i, 1); drawPaid(); U.sound.click(); }));
        wrap.querySelector("#paidTotal").textContent = money(paidTotal());
      }
      function check() {
        st.attempts++;
        wrap.querySelector("#at").textContent = st.attempts;
        const total = paidTotal();
        const target = st.mode === "exact" ? st.item.price : changeDue();
        const msg = wrap.querySelector("#msg");
        if (total === target) {
          st.score++;
          wrap.querySelector("#sc").textContent = st.score;
          U.sound.win();
          msg.style.color = "var(--green)";
          msg.textContent = st.mode === "exact" ? `Correct — exactly ${money(target)}. Perfect payment!` : `Correct — ${money(target)} change.`;
          setTimeout(() => { st.item = U.pick(SHOP.filter((i) => i !== st.item)); st.paid = []; drawAll(); }, 1400);
        } else {
          U.sound.no();
          msg.style.color = "var(--red)";
          msg.textContent = total < target
            ? `Not enough yet — you have ${money(total)} of ${money(target)}. Need ${money(target - total)} more.`
            : `Too much — you have ${money(total)}, which is ${money(total - target)} over.`;
        }
      }
      function drawAll() { drawShop(); drawPaid(); wrap.querySelector("#sc").textContent = st.score; wrap.querySelector("#at").textContent = st.attempts; }
      drawAll();
    },
  });

  /* =========================================================
     FINDING CHANGE
     ========================================================= */
  const PENCE = [1, 2, 5, 10, 20, 50];
  function bestCoins(p) {
    const out = [];
    [...COINS].reverse().forEach((c) => { while (p >= c.v) { out.push(c.v); p -= c.v; } });
    return out;
  }

  ML.register({
    id: "change", group: "money", title: "Finding Change",
    short: "Change", icon: ML.icon('wallet'), color: ["#e3f8ec", "#157a43"], tag: "Money",
    blurb: "Shopkeeper challenge: work out the change from a note, then build it out of the fewest coins. Receipts print beautifully.",
    tags: ["Finding Change.exe", "subtraction", "coin combinations", "receipt"],
    mount(root) {
      const st = { level: "whole", price: 0, paid: 0, answer: null, answerCoins: [], given: [], streak: 0, best: 0, history: [] };
      function newQ() {
        if (st.level === "whole") {
          const price = U.randInt(1, 9) * 100 + U.pick([0, 50]);
          const paid = price <= 500 ? 1000 : 2000;
          st.price = price; st.paid = paid;
        } else if (st.level === "pence") {
          const price = U.randInt(1, 9) * 100 + U.randInt(1, 99);
          st.paid = price <= 500 ? 1000 : price <= 1000 ? 2000 : 5000;
          st.price = price;
        } else {
          const price = U.randInt(100, 4000) + Math.floor(Math.random() * 100);
          st.paid = [500, 1000, 2000, 5000, 10000].find((n) => n >= price + 50) || 10000;
          st.price = price;
        }
        st.answer = st.paid - st.price;
        st.answerCoins = bestCoins(st.answer);
        st.given = [];
        st.solved = false;
        draw();
      }
      const wrap = U.el("div", { class: "app-layout" });
      wrap.innerHTML = `
        <aside class="controls no-print">
          <div class="panel">
            <div class="panel-h">Level</div>
            <div class="panel-b tight">
              <div class="seg" id="lvlSeg" style="flex-direction:column">
                <button data-l="whole" class="on">Whole pounds</button>
                <button data-l="pence">Pounds &amp; pence</button>
                <button data-l="mixed">Bigger amounts</button>
              </div>
              <div class="row2">
                <div class="stat"><span>Streak</span><b id="streak">0</b></div>
                <div class="stat"><span>Best</span><b id="best">0</b></div>
              </div>
              <button class="btn ghost sm" id="newQ">${ML.icon("shuffle")} New question</button>
            </div>
          </div>
          <div class="panel">
            <div class="panel-h">Show your working</div>
            <div class="panel-b tight" id="working"></div>
          </div>
        </aside>
        <div class="stage">
          <div class="sheet" id="qCard"></div>
          <div class="card" style="margin-top:16px;overflow:hidden" id="histCard"></div>
        </div>`;
      root.appendChild(wrap);

      wrap.querySelector("#lvlSeg").addEventListener("click", (e) => {
        const b = e.target.closest("button[data-l]"); if (!b) return;
        st.level = b.dataset.l;
        U.$$("#lvlSeg button", wrap).forEach((x) => x.classList.toggle("on", x === b));
        newQ();
      });
      wrap.querySelector("#newQ").addEventListener("click", newQ);

      function draw() {
        const q = wrap.querySelector("#qCard");
        q.innerHTML = `
          <div class="sheet-head"><div class="name">Name: <i>&nbsp;</i></div><div class="name" style="max-width:170px">Date: <i>&nbsp;</i></div></div>
          <h2>Finding Change</h2>
          <div class="sheet-sub">Work out the change, then make it with coins</div>
          <div style="display:flex;gap:22px;flex-wrap:wrap;justify-content:center;margin:18px 0 22px">
            <div class="stat" style="min-width:150px"><span>Price</span><b style="font-size:26px">${money(st.price)}</b></div>
            <div style="align-self:center;font-size:30px;color:var(--muted);font-weight:300">−</div>
            <div class="stat" style="min-width:150px"><span>You pay with</span><b style="font-size:26px">${money(st.paid)}</b></div>
            <div style="align-self:center;font-size:30px;color:var(--muted);font-weight:300">=</div>
            <div class="stat" style="min-width:170px;background:var(--brand-soft);border-color:#d9d5ff"><span>Change</span><b style="font-size:26px;color:var(--brand-ink)">£ ?</b></div>
          </div>
          <div class="field" style="max-width:300px;margin:0 auto">
            <label for="chAns" style="justify-content:center">Type the change (in pounds, e.g. 2.35)</label>
            <input id="chAns" type="text" inputmode="decimal" placeholder="0.00" autocomplete="off" style="text-align:center;font-size:24px;font-weight:800;font-family:var(--fm)">
          </div>
          <div class="btn-row" style="justify-content:center;margin-top:14px">
            <button class="btn" id="chk">Check</button>
            <button class="btn ghost" id="showCoins">Show coin answer</button>
          </div>
          <div id="chMsg" style="text-align:center;min-height:26px;margin-top:12px;font-weight:700"></div>
          <div id="chCoins" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:8px"></div>`;
        q.querySelector("#chk").addEventListener("click", check);
        q.querySelector("#chAns").addEventListener("keydown", (e) => { if (e.key === "Enter") check(); });
        q.querySelector("#showCoins").addEventListener("click", () => {
          q.querySelector("#chCoins").innerHTML = st.answerCoins.map((v) => coinSvg(v, 42)).join("");
          q.querySelector("#chMsg").style.color = "var(--muted)";
          q.querySelector("#chMsg").textContent = `${money(st.answer)} made with ${st.answerCoins.length} coin${st.answerCoins.length === 1 ? "" : "s"}`;
        });
        q.querySelector("#chAns").focus();
        drawWorking(); drawHistory();
      }
      function drawWorking() {
        const w = wrap.querySelector("#working");
        w.innerHTML = `
          <div class="mono small" style="line-height:1.9">
            Paid − price = change<br>
            <b>${money(st.paid)} − ${money(st.price)} = ?</b>
          </div>
          <div class="note">Counting up works too: ${money(st.price)} ${ML.icon("arrow")} ${money(st.paid)}.</div>`;
      }
      function check() {
        const q = wrap.querySelector("#qCard");
        const raw = q.querySelector("#chAns").value.replace(/[£,\s]/g, "");
        const val = Math.round(parseFloat(raw) * 100);
        const msg = q.querySelector("#chMsg");
        if (!isFinite(val)) { msg.style.color = "var(--red)"; msg.textContent = "Type an amount like 2.35"; return; }
        if (val === st.answer) {
          st.streak++; st.best = Math.max(st.best, st.streak);
          U.sound.win();
          msg.style.color = "var(--green)";
          msg.textContent = `Correct — ${money(st.answer)} change.`;
          q.querySelector("#chCoins").innerHTML = st.answerCoins.map((v) => coinSvg(v, 42)).join("");
          st.history.unshift({ price: st.price, paid: st.paid, change: st.answer, ok: true });
          st.history = st.history.slice(0, 8);
          ML.record(true);
          setTimeout(newQ, 1500);
        } else {
          st.streak = 0;
          U.sound.no();
          ML.record(false);
          msg.style.color = "var(--red)";
          msg.textContent = val < st.answer ? "Too low — count up from the price again." : "Too high — try counting up from the price.";
          q.querySelector("#chAns").classList.add("shake");
          setTimeout(() => q.querySelector("#chAns").classList.remove("shake"), 400);
        }
        wrap.querySelector("#streak").textContent = st.streak;
        wrap.querySelector("#best").textContent = st.best;
        drawHistory();
      }
      function drawHistory() {
        const host = wrap.querySelector("#histCard");
        if (!st.history.length) { host.innerHTML = `<div class="card-b small muted">Your solved receipts will appear here — press Print to make a record sheet.</div>`; return; }
        host.innerHTML = `<div class="card-h"><h2>Recent receipts</h2><span class="small muted">last ${st.history.length}</span></div>
          <div class="scroll-x"><table class="data">
          <tr><th>Price</th><th>Paid</th><th>Change</th><th>Receipt</th></tr>
          ${st.history.map((h) => `<tr><td class="mono">${money(h.price)}</td><td class="mono">${money(h.paid)}</td><td class="mono">${money(h.change)}</td><td class="small muted">${h.ok ? "correct" : "—"}</td></tr>`).join("")}
          </table></div>`;
      }
      newQ();
    },
  });
})();

/* ===========================================================
   MathsLab — the Maths Arcade, mode pack 2
   The other fifteen EduMagnet modes, rebuilt for mathematics.
   Loaded after assets/apps/arcade.js; it registers itself with
   ML.arcade.add(...) so the floor, the router and the table all
   pick the modes up automatically.

   Modes here:  pairs · sweep · recall · flashcards · bubbles
                crates · wheel · tiles · maze · zap
                groups · rocket · leap · zoom · deck
   =========================================================== */
(function () {
  "use strict";
  const ML = window.ML, U = ML.u;
  const A = ML.arcade;
  if (!A || !A.kit) return;
  const K = A.kit;
  const { shell, confetti, optionRow, markOptions, qStem, tex, esc, el, ri, shuffle, deck, pick, courseId, familiesFor } = K;
  const shortFam = (f) => String(f.text || "").length <= 62;
  const clean = (t) => String(t == null ? "" : t).replace(/\s+/g, " ").trim();
  const now = K.NOW;

  /* a one-question multiple-choice view used by several modes */
  function askRow(q, onPick) {
    const row = el("div", "ar-opts");
    q.options.forEach((o, i) => {
      const b = el("button", "ar-opt");
      b.type = "button";
      b.dataset.i = String(i);
      b.innerHTML = `<span class="ar-opt-k">${"ABCD"[i]}</span><span class="ar-opt-t">${tex(o.html)}</span>`;
      b.addEventListener("click", () => onPick(i, b));
      row.appendChild(b);
    });
    return row;
  }
  /* count how many of the options are right (some modes need exactly one) */
  const rightIndex = (q) => q.options.findIndex((o) => o.ok);

  /* =========================================================
     1. MATCH PAIRS — everything face up, question ⇄ value
     ========================================================= */
  const pairs = {
    id: "pairs", src: "Match Pairs", cat: "Pairs & matching",
    twist: "a question tile and its <b>value</b> tile, both face up — matching, not memory",
    title: "Match Pairs", kicker: "Matching", icon: "pairs",
    blurb: "Eight tiles face up: four questions and their four answers. Tap a question, then the tile that answers it.",
    play(host) {
      const api = shell(host, pairs);
      const BOARDS = 3;
      let tiles = [], sel = null, matched = 0, board = 0, score = 0, lock = false;
      const norm = (t) => clean(t).toLowerCase();

      function build(reset) {
        const qs = deck(courseId(), 4, shortFam);
        if (qs.length < 4) { api.stage.innerHTML = `<p class="muted">Not enough short recipes for this course — try Mixed.</p>`; return; }
        tiles = [];
        qs.forEach((q, i) => {
          tiles.push({ pair: i, kind: "q", html: qStem(q), q });
          tiles.push({ pair: i, kind: "a", html: `<div class="ar-mem-a">${tex(q.answerText)}</div>`, q });
        });
        tiles = shuffle(tiles);
        /* a new board keeps the round going; only a fresh game clears these */
        sel = null; matched = 0; lock = false;
        if (reset !== false) { board = 0; score = 0; }
        api.stage.innerHTML = `
          <div class="ar-pairs" id="arPairs"></div>
          <div class="ar-fb" id="arPairFb">Tap a question, then the tile that answers it.</div>`;
        paint();
      }
      function paint() {
        const grid = api.stage.querySelector("#arPairs");
        grid.innerHTML = "";
        tiles.forEach((t, i) => {
          const b = el("button", "ar-ptile" + (t.kind === "a" ? " is-ans" : "") + (t.done ? " is-done" : "") + (sel === i ? " is-sel" : ""));
          b.type = "button";
          b.dataset.i = String(i);
          b.innerHTML = t.html;
          b.addEventListener("click", () => tap(i));
          grid.appendChild(b);
        });
        api.setHud({ Score: score, Board: (board + 1) + "/" + BOARDS, Pairs: matched + "/4" });
      }
      const fb = (html) => { const n = api.stage.querySelector("#arPairFb"); if (n) n.innerHTML = html; };

      function tap(i) {
        if (lock) return;
        const t = tiles[i];
        if (!t || t.done) return;
        if (sel === null) { sel = i; U.sound.click(); paint(); return; }
        if (sel === i) { sel = null; paint(); return; }
        const a = tiles[sel];
        const nodes = [...api.stage.querySelectorAll(".ar-ptile")];
        if (a.pair === t.pair && a.kind !== t.kind) {
          a.done = t.done = true;
          matched++;
          score += 120;
          [i, sel].forEach((k) => { if (nodes[k]) nodes[k].classList.add("is-done", "pop"); });
          const qt = [a, t].find((x) => x.kind === "q");
          fb(`<b style="color:#1fa45b">Pair found</b> — ${qt && qt.q.hint ? tex(qt.q.hint) : "that is the value."}`);
          sel = null;
          U.sound.ok();
          paint();
          if (matched === 4) {
            lock = true;
            confetti(api.stage);
            setTimeout(() => {
              lock = false;
              board++;
              if (board >= BOARDS) {
                const record = api.finish(score);
                api.over({ win: true, icon: "pairs", kicker: "Three boards", title: "All pairs matched", message: (record ? "New best. " : "") + "Twelve question–value pairs.", score: score + " pts", onAgain: build });
              } else { build(false); }
            }, 900);
          }
          return;
        }
        score = Math.max(0, score - 10);
        U.sound.no();
        fb(`<b style="color:#e5484d">Not a pair</b> — ${tex(a.kind === "q" && a.q.hint ? a.q.hint : "check the value again.")}`);
        if (nodes[i]) { nodes[i].classList.add("is-no"); setTimeout(() => nodes[i] && nodes[i].classList.remove("is-no"), 450); }
        if (nodes[sel]) { const s = nodes[sel]; s.classList.add("is-no"); setTimeout(() => s && s.classList.remove("is-no"), 450); }
        sel = null;
        paint();
      }

      build();
      return {
        get tiles() { return tiles.map((t) => ({ pair: t.pair, kind: t.kind, done: !!t.done })); },
        get matched() { return matched; },
        get score() { return score; },
        tap,
        solve() {
          const q = tiles.findIndex((t) => !t.done && t.kind === "q");
          if (q < 0) return;
          const a = tiles.findIndex((t) => !t.done && t.kind === "a" && t.pair === tiles[q].pair);
          if (a >= 0) { tap(q); tap(a); }
        },
        miss() {
          const q = tiles.findIndex((t) => !t.done && t.kind === "q");
          if (q < 0) return;
          const a = tiles.findIndex((t) => !t.done && t.kind === "a" && t.pair !== tiles[q].pair);
          if (a >= 0) { tap(q); tap(a); }
        },
      };
    },
  };

  /* =========================================================
     2. MATCH SWEEP — sweep every tile with the property
     ========================================================= */
  const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  const SWEEPS = [
    { label: "prime", test: isPrime, lo: 2, hi: 60 },
    { label: "a multiple of 4", test: (n) => n % 4 === 0, lo: 4, hi: 96 },
    { label: "a perfect square", test: (n) => Number.isInteger(Math.sqrt(n)), lo: 4, hi: 144 },
    { label: "a factor of 48", test: (n) => 48 % n === 0, lo: 1, hi: 48 },
    { label: "even", test: (n) => n % 2 === 0, lo: 2, hi: 90 },
    { label: "a multiple of 9", test: (n) => n % 9 === 0, lo: 9, hi: 99 },
  ];
  const sweep = {
    id: "sweep", src: "Match Sweep", cat: "Pairs & matching",
    twist: "one property per board — sweep every tile that has it (prime, square, multiple, factor)",
    title: "Match Sweep", kicker: "Sweep the set", icon: "sweep",
    blurb: "One rule per board. Sweep every tile that satisfies it and leave the rest alone — a wrong sweep costs more than a slow one.",
    play(host) {
      const api = shell(host, sweep);
      const ROUNDS = 4, TILES = 12;
      let rule = null, tiles = [], round = 0, score = 0, hits = 0, misses = 0, lock = false;

      function makeBoard() {
        for (let attempt = 0; attempt < 200; attempt++) {
          const set = new Set(), list = [];
          while (list.length < TILES) {
            const n = ri(rule.lo, rule.hi);
            if (set.has(n)) continue;
            set.add(n);
            list.push({ n, ok: !!rule.test(n), swept: false, wrong: false });
          }
          const good = list.filter((t) => t.ok).length;
          if (good >= 3 && good <= 5) return shuffle(list);
        }
        return [];
      }
      function build() {
        rule = SWEEPS[ri(0, SWEEPS.length - 1)];
        round = 0; score = 0; hits = 0; misses = 0; lock = false; startRound();
      }
      function startRound() {
        tiles = makeBoard();
        hits = 0;
        api.stage.innerHTML = `
          <div class="ar-sweep">
            <div class="ar-sweep-rule">Sweep every tile that is <b>${esc(rule.label)}</b>
              <span class="muted small">· board ${round + 1} of ${ROUNDS}</span></div>
            <div class="ar-sweepgrid" id="arSweep"></div>
            <div class="ar-fb" id="arSweepFb">Tap the tiles that match the rule.</div>
          </div>`;
        const grid = api.stage.querySelector("#arSweep");
        tiles.forEach((t, i) => {
          const b = el("button", "ar-stile", tex(String(t.n)));
          b.type = "button";
          b.dataset.i = String(i);
          b.addEventListener("click", () => tap(i));
          grid.appendChild(b);
        });
        api.setHud({ Score: score, Board: (round + 1) + "/" + ROUNDS, Found: "0/" + tiles.filter((t) => t.ok).length });
      }
      const fb = (h) => { const n = api.stage.querySelector("#arSweepFb"); if (n) n.innerHTML = h; };
      function tap(i) {
        if (lock) return;
        const t = tiles[i];
        if (!t || t.swept) return;
        const node = api.stage.querySelectorAll(".ar-stile")[i];
        if (t.ok) {
          t.swept = true;
          hits++;
          score += 50;
          U.sound.coin();
          node.classList.add("is-swept", "pop");
          fb(`<b style="color:#1fa45b">Swept</b> — ${t.n} is ${esc(rule.label)}.`);
        } else {
          t.wrong = true;
          t.swept = true;
          misses++;
          score = Math.max(0, score - 25);
          U.sound.no();
          node.classList.add("is-wrong");
          fb(`<b style="color:#e5484d">Not that one</b> — ${t.n} is not ${esc(rule.label)}.`);
        }
        const want = tiles.filter((x) => x.ok).length;
        api.setHud({ Score: score, Board: (round + 1) + "/" + ROUNDS, Found: hits + "/" + want });
        if (hits === want) {
          lock = true;
          confetti(api.stage);
          setTimeout(() => {
            lock = false;
            round++;
            if (round >= ROUNDS) {
              const record = api.finish(score);
              api.over({ win: true, icon: "sweep", kicker: "Four boards", title: "Swept clean", message: (record ? "New best. " : "") + misses + " wrong sweeps across four boards.", score: score + " pts", onAgain: build });
            } else { startRound(); }
          }, 850);
        }
      }
      build();
      return {
        get rule() { return rule; },
        get tiles() { return tiles.map((t) => ({ n: t.n, ok: t.ok, swept: t.swept })); },
        get score() { return score; },
        get hits() { return hits; },
        tap,
        solve() { const i = tiles.findIndex((t) => t.ok && !t.swept); if (i >= 0) tap(i); },
        miss() { const i = tiles.findIndex((t) => !t.ok && !t.swept); if (i >= 0) tap(i); },
      };
    },
  };

  /* =========================================================
     3. FLASH RECALL — five pairs flash, then you answer
     ========================================================= */
  const recall = {
    id: "recall", src: "Flash Recall", cat: "Memory",
    twist: "five expression→value pairs flash for a few seconds, then you are asked what was paired with what",
    title: "Flash Recall", kicker: "Flash & recall", icon: "recall",
    blurb: "Five expression–value pairs appear for a few seconds, then vanish. Answer four questions from memory.",
    play(host) {
      const api = shell(host, recall);
      const SHOW = 5, ASK = 4, FLASH_MS = 4000;
      let shown = [], asks = [], phase = "flash", qi = 0, score = 0, timer = null, lock = false;

      function build() {
        shown = deck(courseId(), SHOW, shortFam);
        if (shown.length < SHOW) { api.stage.innerHTML = `<p class="muted">Not enough short recipes for this course — try Mixed.</p>`; return; }
        asks = shuffle(shown).slice(0, ASK).map((q) => {
          const distract = shuffle(shown.filter((x) => clean(x.answerText) !== clean(q.answerText))).slice(0, 3);
          const opts = shuffle([{ html: q.answerText, ok: true }].concat(distract.map((d) => ({ html: d.answerText, ok: false }))));
          return { q, opts };
        });
        phase = "flash"; qi = 0; score = 0; lock = false;
        api.stage.innerHTML = `
          <div class="ar-recall">
            <div class="ar-recall-flash" id="arFlash"></div>
            <div class="ar-recall-ask" id="arAsk"></div>
          </div>`;
        renderFlash();
        clearTimeout(timer);
        timer = setTimeout(hideFlash, FLASH_MS);
      }
      function renderFlash() {
        const box = api.stage.querySelector("#arFlash");
        box.innerHTML = `<div class="ar-flashbar"><span class="muted small">Memorise these — they go in ${Math.round(FLASH_MS / 1000)} s</span>
          <button class="btn ghost xs" id="arFlashNow">Hide now</button></div>
          <div class="ar-flashgrid">${shown.map((q) => `
            <div class="ar-flashcard"><div class="ar-flashq">${tex(q.stem)}</div>
            <div class="ar-flasha">${tex(q.answerText)}</div></div>`).join("")}</div>`;
        const b = box.querySelector("#arFlashNow");
        if (b) b.addEventListener("click", hideFlash);
        api.setHud({ Score: score, Phase: "Memorise", Question: "—", Pairs: SHOW });
      }
      function hideFlash() {
        clearTimeout(timer);
        if (phase !== "flash") return;
        phase = "ask";
        const box = api.stage.querySelector("#arFlash");
        if (box) box.innerHTML = `<div class="ar-flashgone">faded — now answer from memory</div>`;
        renderAsk();
      }
      function renderAsk() {
        const host2 = api.stage.querySelector("#arAsk");
        if (!host2) return;
        const a = asks[qi];
        if (!a) return;
        lock = false;
        host2.innerHTML = `<div class="ar-card"><div class="eyebrow">Recall ${qi + 1} of ${ASK}</div>
          <div class="ar-prompt">Which value was paired with ${tex(a.q.stem)}?</div></div>`;
        host2.appendChild(askRow({ options: a.opts }, (i, node) => answer(i, node)));
        api.setHud({ Score: score, Phase: "Recall", Question: (qi + 1) + "/" + ASK, Pairs: SHOW });
      }
      function answer(i, node) {
        if (lock) return;
        lock = true;
        const a = asks[qi];
        const ok = a.opts[i].ok;
        [...api.stage.querySelectorAll(".ar-opt")].forEach((b) => {
          b.disabled = true;
          const k = Number(b.dataset.i);
          if (a.opts[k].ok) b.classList.add("ok");
          else if (b === node) b.classList.add("no");
        });
        if (ok) { score += 100; U.sound.ok(); } else U.sound.no();
        const fb = el("div", "ar-fb");
        fb.innerHTML = ok ? `<b style="color:#1fa45b">Yes</b> — ${tex(a.q.hint || "")}` : `<b style="color:#e5484d">No</b> — it was ${tex(a.q.answerText)}. ${tex(a.q.hint || "")}`;
        api.stage.appendChild(fb);
        setTimeout(() => {
          qi++;
          if (qi >= ASK) {
            const record = api.finish(score);
            confetti(api.stage);
            api.over({ win: true, icon: "recall", kicker: "Recall complete", title: "Memory check", message: (record ? "New best. " : "") + "You held five fresh pairs in your head.", score: score + " pts", onAgain: build });
          } else renderAsk();
        }, 900);
      }
      build();
      return {
        get phase() { return phase; },
        get shown() { return shown.map((q) => clean(q.answerText)); },
        get ask() { return asks[qi] || null; },
        get score() { return score; },
        skipFlash: hideFlash,
        answer(i) {
          const b = [...api.stage.querySelectorAll(".ar-opt")][i];
          if (b) b.click();
        },
        solve() { if (phase === "flash") hideFlash(); const a = asks[qi]; if (!a) return; this.answer(a.opts.findIndex((o) => o.ok)); },
        miss() { if (phase === "flash") hideFlash(); const a = asks[qi]; if (!a) return; this.answer(a.opts.findIndex((o) => !o.ok)); },
      };
    },
  };

  /* =========================================================
     4. FLASHCARDS — flip, then grade yourself
     ========================================================= */
  const flashcards = {
    id: "flashcards", src: "Flashcards", cat: "Board & cards",
    twist: "every card is a generated question; the back carries the answer, the hint and the first worked step",
    title: "Formula Flashcards", kicker: "Flashcards", icon: "flashcards",
    blurb: "A deck of generated questions. Read the front, flip, and be honest: got it, or see it again.",
    play(host) {
      const api = shell(host, flashcards);
      let cards = [], front = 0, flipped = false, got = 0, again = 0, score = 0;

      function build() {
        const base = deck(courseId(), 8);
        if (!base.length) { api.stage.innerHTML = `<p class="muted">No recipes for this course.</p>`; return; }
        cards = base; front = 0; flipped = false; got = 0; again = 0; score = 0;
        api.stage.innerHTML = `
          <div class="ar-fc">
            <div class="ar-fc-card" id="arFcCard"></div>
            <div class="ar-fc-btns" id="arFcBtns"></div>
            <div class="ar-fb" id="arFcFb"></div>
          </div>`;
        paint();
      }
      function paint() {
        const card = cards[front];
        if (!card) return;
        const box = api.stage.querySelector("#arFcCard");
        box.className = "ar-fc-card" + (flipped ? " is-flipped" : "");
        box.innerHTML = `
          <div class="ar-fc-face ar-fc-front">
            <div class="eyebrow">Card ${front + 1} of ${cards.length}</div>
            <div class="ar-prompt">${tex(card.stem)}</div>
            <span class="muted small">tap to flip</span>
          </div>
          <div class="ar-fc-face ar-fc-back">
            <div class="eyebrow">Answer</div>
            <div class="ar-fc-ans">${tex(card.answerText)}</div>
            ${(card.steps && card.steps[0]) ? `<div class="ar-fc-step">${tex(card.steps[0])}</div>` : ""}
            ${card.hint ? `<div class="muted small">${tex(card.hint)}</div>` : ""}
          </div>`;
        box.addEventListener("click", flip, { once: true });
        const btns = api.stage.querySelector("#arFcBtns");
        btns.innerHTML = flipped
          ? `<button class="btn sm" id="arGot">Got it · +50</button><button class="btn ghost sm" id="arFcAgain">Show me again</button>`
          : `<button class="btn ghost sm" id="arFlip">Flip</button>`;
        const g = btns.querySelector("#arGot"), a2 = btns.querySelector("#arFcAgain"), f = btns.querySelector("#arFlip");
        if (g) g.addEventListener("click", () => grade(true));
        if (a2) a2.addEventListener("click", () => grade(false));
        if (f) f.addEventListener("click", flip);
        api.setHud({ Score: score, Card: (front + 1) + "/" + cards.length, "Got it": got, Again: again });
      }
      function flip() {
        if (flipped || !cards[front]) return;
        flipped = true;
        U.sound.click();
        paint();
      }
      function grade(ok) {
        if (!flipped || !cards[front]) return;
        const card = cards[front];
        if (ok) { got++; score += 50; U.sound.ok(); }
        else { again++; U.sound.thud(); cards.push(card); }
        front++;
        flipped = false;
        if (front >= cards.length) {
          const record = api.finish(score);
          confetti(api.stage);
          api.over({ win: true, icon: "flashcards", kicker: "Deck finished", title: "Cards cleared", message: (record ? "New best. " : "") + got + " cards known, " + again + " revisited.", score: score + " pts", onAgain: build });
          return;
        }
        paint();
      }
      build();
      return {
        get total() { return cards.length; },
        get front() { return front; },
        get flipped() { return flipped; },
        get got() { return got; },
        get card() { return cards[front] || null; },
        flip,
        grade,
        solve() { this.flip(); grade(true); },
        miss() { this.flip(); grade(false); },
      };
    },
  };

  /* =========================================================
     5. BUBBLE POP — pop the rising bubble with the right answer
     ========================================================= */
  const bubbles = {
    id: "bubbles", src: "Bubble Pop", cat: "Reflex & aim",
    twist: "the answers float upward; pop the right one before the set drifts away",
    title: "Bubble Pop", kicker: "Pop the answer", icon: "bubbles",
    blurb: "Four bubbles rise with four answers. Pop the one that is right — a wrong bubble costs points and the right one drifts off.",
    play(host) {
      const api = shell(host, bubbles);
      const LIVES = 3;
      let q = null, score = 0, hits = 0, misses = 0, lives = LIVES, lock = false, seq = 0;

      const HUES = ["gold", "teal", "rose", "deep"];
      function hearts() {
        let out = "";
        for (let i = 0; i < LIVES; i++) out += ML.art("heart", 18) || "\u2665";
        return out;
      }
      function build() {
        score = 0; hits = 0; misses = 0; lives = LIVES; lock = false;
        api.stage.innerHTML = `
          <div class="ar-bub">
            <div class="ar-bubprompt" id="arBubPrompt"></div>
            <div class="ar-drop" id="arDrop">
              <div>
                <div class="ar-drop-k">Drop zone</div>
                <div class="ar-drop-v" id="arDropV">Waiting for the right planet</div>
              </div>
              <div class="ar-drop-h" id="arDropH">pop a planet and it lands here</div>
            </div>
            <div class="ar-bubfield" id="arBubField"></div>
            <div class="ar-fb" id="arBubFb">Pop the bubble with the right answer.</div>
          </div>`;
        next();
      }
      function next() {
        seq++;
        const my = seq;
        q = pick(courseId());
        if (!q) return;
        const field = api.stage.querySelector("#arBubField");
        field.innerHTML = "";
        api.stage.querySelector("#arBubPrompt").innerHTML = qStem(q);
        const pad = api.stage.querySelector("#arDrop");
        if (pad) pad.classList.remove("is-filled");
        const padV = api.stage.querySelector("#arDropV");
        const padH = api.stage.querySelector("#arDropH");
        if (padV) padV.textContent = "Waiting for the right planet";
        if (padH) padH.textContent = "pop a planet and it lands here";
        const opts = q.options.slice(0, 4);
        let left = opts.length;
        /* one slot per planet, sized to the field, so the bubbles never
           overlap and every one is easy to hit on a phone */
        const fw = field.clientWidth || 640;
        const slot = fw / opts.length;
        const size = Math.max(58, Math.min(104, slot - 12));
        opts.forEach((o, i) => {
          const b = el("button", "ar-bubble");
          b.type = "button";
          b.dataset.i = String(i);
          b.style.width = size + "px";
          b.style.left = Math.round(i * slot + (slot - size) / 2) + "px";
          /* they start inside the field at staggered heights and drift up
             out of it — the board is never empty, like the original */
          const n = opts.length;
          const lo = 4, hi = 50;
          b.style.bottom = Math.round(lo + (n > 1 ? (i * (hi - lo)) / (n - 1) : (hi - lo) / 2)) + "%";
          b.style.animationDuration = (11 + ri(0, 5)) + "s";
          b.style.animationDelay = (ri(0, 3) / 10) + "s";
          b.innerHTML = ML.art.planet ? ML.art.planet(HUES[i % HUES.length], tex(o.html)) : tex(o.html);
          b.addEventListener("click", () => pop(i, b));
          b.addEventListener("animationend", (ev) => {
            if (ev.animationName !== "ar-rise") return;
            b.remove();
            left--;
            if (left <= 0 && !lock && my === seq) {
              lock = true;
              api.stage.querySelector("#arBubFb").innerHTML = `<b style="color:#e8a008">They floated away</b> — here comes the next one.`;
              setTimeout(() => { lock = false; if (my === seq) next(); }, 700);
            }
          });
          field.appendChild(b);
        });
        api.setHud({ Score: score, Popped: hits, Missed: misses, Lives: hearts() });
      }
      function pop(i, node) {
        if (lock || !q) return;
        const ok = q.options[i].ok;
        node.classList.add(ok ? "is-pop" : "is-no");
        node.disabled = true;
        const pad = api.stage.querySelector("#arDrop");
        const fb = api.stage.querySelector("#arBubFb");
        if (ok) {
          lock = true;
                    score += 80; hits++;
          U.sound.coin();
          if (pad) pad.classList.add("is-filled");
          const padV = api.stage.querySelector("#arDropV");
          const padH = api.stage.querySelector("#arDropH");
          if (padV) padV.innerHTML = tex(String(q.answerText));
          if (padH) padH.innerHTML = tex(q.hint || "Correct");
          if (fb) fb.innerHTML = `<b style="color:#1fa45b">Pop!</b> ${tex(q.hint || "")}`;
          [...api.stage.querySelectorAll(".ar-bubble")].forEach((b) => {
            if (b === node) return;
            b.style.pointerEvents = "none";
            b.classList.add("is-fade");
          });
          setTimeout(() => { lock = false; if (lives > 0) next(); }, 700);
          api.finish(score);
        } else {
          misses++;
          lives = Math.max(0, lives - 1);
          score = Math.max(0, score - 20);
          U.sound.no();
          if (ML.fx) { ML.fx.shake(api.stage); ML.fx.float(node, "\u221220", "bad"); }
          if (fb) fb.innerHTML = `<b style="color:#e5484d">Wrong planet</b> — a heart popped.`;
          node.style.pointerEvents = "none";
          if (ML.fx) ML.fx.burst(node, { colors: ["#e5484d", "#f79c9c", "#ffd1d1"], count: 10 });
          setTimeout(() => node.remove(), 420);
          if (lives <= 0) {
            lock = true;
            api.setHud({ Score: score, Popped: hits, Missed: misses, Lives: hearts() });
            api.over({ win: false, icon: "clock", kicker: "Bubbles escaped", title: "Out of hearts",
              message: `You popped ${hits} set${hits === 1 ? "" : "s"} before the planets drifted off.`, score,
              onAgain: () => build() });
            return;
          }
        }
        api.setHud({ Score: score, Popped: hits, Missed: misses, Lives: hearts() });
      }
      build();
      return {
        get prompt() { return q; },
        get bubbles() { return [...api.stage.querySelectorAll(".ar-bubble")].length; },
        get score() { return score; },
        get hits() { return hits; },
        pop(i) {
          const b = [...api.stage.querySelectorAll(".ar-bubble")][i];
          if (b) b.click();
        },
        solve() { if (q) this.pop(rightIndex(q)); },
        miss() { if (q) this.pop(q.options.findIndex((o) => !o.ok)); },
        reset() { next(); },
      };
    },
  };

  /* =========================================================
     6. MYSTERY CRATES — open a crate, answer for its points
     ========================================================= */
  const crates = {
    id: "crates", src: "Mystery Crates", cat: "Board & cards",
    twist: "each crate hides 50–300 points; you only bank them if the generated question is right",
    title: "Mystery Crates", kicker: "Risk & reward", icon: "crates",
    blurb: "Nine crates, three opens. Every crate holds a question and a points value — answer it and the points are yours.",
    play(host) {
      const api = shell(host, crates);
      const OPENS = 3, N = 9, POINTS = [50, 100, 150, 200, 250, 300];
      let boxes = [], opens = 0, score = 0, live = -1, lock = false, q = null;

      function build() {
        boxes = [...Array(N).keys()].map(() => ({ pts: POINTS[ri(0, POINTS.length - 1)], open: false, won: false, q: null }));
        opens = 0; score = 0; live = -1; lock = false; q = null;
        api.stage.innerHTML = `
          <div class="ar-crates">
            <div class="ar-crate-grid" id="arCrates"></div>
            <div class="ar-crate-ask" id="arCrateAsk"></div>
          </div>`;
        paint();
      }
      function paint() {
        const grid = api.stage.querySelector("#arCrates");
        grid.innerHTML = "";
        boxes.forEach((b, i) => {
          const n = el("button", "ar-crate" + (b.open ? " is-open" : "") + (b.won ? " is-won" : "") + (live === i ? " is-live" : ""));
          n.type = "button";
          n.dataset.i = String(i);
          n.innerHTML = b.open
            ? `<span class="ar-crate-lid">${b.won ? ML.art("check", 26) : b.q ? ML.art("cross", 26) : "…"}</span><span class="ar-crate-pts">${b.won ? "+" + b.pts : "—"}</span>`
            : `<span class="ar-crate-lid">${ML.art("crates", 30, "ar-bob")}</span><span class="ar-crate-pts">?</span>`;
          n.addEventListener("click", () => open(i));
          grid.appendChild(n);
        });
        api.setHud({ Score: score, Crates: opens + "/" + OPENS, Left: boxes.filter((b) => !b.open).length });
      }
      function open(i) {
        const b = boxes[i];
        if (lock || !b || b.open || opens >= OPENS || live >= 0) return;
        b.open = true;
        live = i;
        q = pick(courseId()) || pick("");
        U.sound.click();
        paint();
        const ask = api.stage.querySelector("#arCrateAsk");
        ask.innerHTML = `<div class="ar-card"><div class="eyebrow">Crate ${i + 1} · worth ${b.pts} points</div>
          <div class="ar-prompt" id="arCrateQ"></div></div>`;
        ask.querySelector("#arCrateQ").innerHTML = qStem(q);
        ask.appendChild(askRow(q, (oi, node) => answer(i, oi, node)));
      }
      function answer(i, oi, node) {
        if (lock || live !== i) return;
        lock = true;
        const b = boxes[i];
        const ok = q.options[oi].ok;
        [...api.stage.querySelectorAll(".ar-opt")].forEach((x) => {
          x.disabled = true;
          const k = Number(x.dataset.i);
          if (q.options[k].ok) x.classList.add("ok");
          else if (x === node) x.classList.add("no");
        });
        if (ok) { score += b.pts; b.won = true; U.sound.win(); confetti(api.stage); }
        else { U.sound.no(); }
        const fb = el("div", "ar-fb");
        fb.innerHTML = ok ? `<b style="color:#1fa45b">+${b.pts}</b> — ${tex(q.hint || "")}` : `<b style="color:#e5484d">The crate keeps its points</b> — ${tex(q.hint || "")}`;
        api.stage.querySelector("#arCrateAsk").appendChild(fb);
        opens++;
        paint();
        setTimeout(() => {
          lock = false;
          live = -1;
          api.stage.querySelector("#arCrateAsk").innerHTML = "";
          if (opens >= OPENS) {
            const record = api.finish(score);
            api.over({ win: true, icon: "crates", kicker: "Three crates", title: "Crates cashed in", message: (record ? "New best. " : "") + "Every crate still holds its own question.", score: score + " pts", onAgain: build });
          } else {
            paint();
          }
        }, 900);
      }
      build();
      return {
        get boxes() { return boxes.map((b) => ({ pts: b.pts, open: b.open, won: b.won })); },
        get opens() { return opens; },
        get score() { return score; },
        get openIndex() { return live; },
        open,
        solve() {
          if (live < 0) { const i = boxes.findIndex((b) => !b.open); if (i >= 0) open(i); }
          const b = boxes[live]; if (b && q) answer(live, rightIndex(q), null);
        },
        miss() {
          if (live < 0) { const i = boxes.findIndex((b) => !b.open); if (i >= 0) open(i); }
          const b = boxes[live]; if (b && q) answer(live, q.options.findIndex((o) => !o.ok), null);
        },
      };
    },
  };

  /* =========================================================
     7. SPIN THE WHEEL — the wheel picks the topic
     ========================================================= */
  const SECTORS = [
    { label: "Order of operations", short: "Order", re: /order of operations|evaluating expressions|operations with/i },
    { label: "Equations", short: "Equations", re: /equation|inequalit|proportion|solving a formula/i },
    { label: "Lines & slope", short: "Lines", re: /slope|line equation|linear function|linear cost/i },
    { label: "Polynomials", short: "Poly", re: /polynomial|binomial|trinomial|factor|exponent/i },
    { label: "Radicals & logs", short: "Roots", re: /radical|square root|logarithm|log equation|fractional exponent/i },
    { label: "Geometry", short: "Geometry", re: /area|perimeter|volume|angle|pythagorean|circle|similar|trigonometric|arc length|midpoint|distance/i },
    { label: "Probability & data", short: "Data", re: /probab|mean|median|data|percent|ratio|unit rate/i },
    { label: "Calculus", short: "Calculus", re: /limit|derivative|tangent|chain rule|quotient|product rule|difference quotient|asymptote|continuous|rates|stationary/i },
  ];
  const wheel = {
    id: "wheel", src: "Spin the Wheel", cat: "Board & cards",
    twist: "eight sectors are eight maths topics; the wheel decides which recipe family you get",
    title: "Spin the Wheel", kicker: "Leave it to chance", icon: "wheel",
    blurb: "Spin for a topic, then answer from it. Five spins, five topics — no hiding in your favourite chapter.",
    play(host) {
      const api = shell(host, wheel);
      const SPINS = 5, R = 92, C = 100;
      let angle = 0, sector = -1, q = null, spins = 0, score = 0, lock = false, timed = null;

      const pol = (r, a) => [C + r * Math.cos((a * Math.PI) / 180), C + r * Math.sin((a * Math.PI) / 180)];
      function arcPath(a0, a1) {
        const [x0, y0] = pol(R, a0), [x1, y1] = pol(R, a1);
        return `M${C},${C} L${x0.toFixed(2)},${y0.toFixed(2)} A${R},${R} 0 0 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`;
      }
      const COLORS = ["#6d5efc", "#0f9d94", "#2f7cf6", "#e8a008", "#b0267a", "#1fa45b", "#7a5af8", "#e5484d"];

      function build() {
        spins = 0; score = 0; sector = -1; angle = 0; lock = false; q = null;
        api.stage.innerHTML = `
          <div class="ar-wheel">
            <div class="ar-wheel-wrap">
              <div class="ar-wheel-ptr" aria-hidden="true">▼</div>
              <svg class="ar-wheel-svg" viewBox="0 0 200 200" id="arWheelSvg" role="img" aria-label="Topic wheel">
                <g id="arWheelG" style="transform-origin:100px 100px; transform:rotate(0deg)">
                  ${SECTORS.map((s2, i) => {
                    const a0 = -90 + i * 45, a1 = a0 + 45;
                    const [lx, ly] = pol(62, a0 + 22.5);
                    return `<path d="${arcPath(a0, a1)}" fill="${COLORS[i % COLORS.length]}" opacity="0.92"></path>
                      <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" fill="#fff" font-size="8.5" font-weight="700"
                        text-anchor="middle" dominant-baseline="middle">${esc(s2.short || s2.label)}</text>`;
                  }).join("")}
                  <circle cx="100" cy="100" r="16" fill="#fff" stroke="#e4e7ec"></circle>
                  <text x="100" y="101" font-size="7" font-weight="800" text-anchor="middle" dominant-baseline="middle" fill="#4b3ee0">SPIN</text>
                </g>
              </svg>
            </div>
            <div class="ar-wheel-ask" id="arWheelAsk"></div>
            <div class="ar-fb" id="arWheelFb">Tap the hub to spin.</div>
          </div>`;
        api.stage.querySelector("#arWheelSvg").addEventListener("click", spin);
        api.setHud({ Score: score, Spin: spins + "/" + SPINS, Topic: "—" });
      }
      function spin() {
        /* the lock is the spin animation, not the whole game: it used to stay
           on after the first spin, so the wheel could only ever turn once and
           the five-spin round was impossible to finish */
        if (lock || q) return;
        if (spins >= SPINS) return;
        lock = true;
        sector = ri(0, SECTORS.length - 1);
        spins++;
        const target = -(sector * 45 + 22.5);
        angle += 360 * 3;
        const base = angle + target;
        const g = api.stage.querySelector("#arWheelG");
        g.style.transition = "transform 1.5s cubic-bezier(.16,.84,.28,1)";
        g.style.transform = `rotate(${base}deg)`;
        U.sound.click();
        api.stage.querySelector("#arWheelAsk").innerHTML = `<div class="ar-fb">spinning…</div>`;
        const my = sector;
        clearTimeout(timed);
        timed = setTimeout(() => {
          const fams = familiesFor(courseId()).filter((f) => SECTORS[my].re.test(String(f.topic || "")));
          const list = fams.length ? fams : familiesFor("").filter((f) => SECTORS[my].re.test(String(f.topic || "")));
          q = list.length ? ML.gen.instance(list[ri(0, list.length - 1)], ri(1, 1e9)) : pick(courseId());
          if (q) {
            const ask = api.stage.querySelector("#arWheelAsk");
            ask.innerHTML = `<div class="ar-card"><div class="eyebrow">${esc(SECTORS[my].label)} · spin ${spins} of ${SPINS}</div>
              <div id="arWheelQ" class="ar-prompt"></div></div>`;
            ask.querySelector("#arWheelQ").innerHTML = qStem(q);
            ask.appendChild(askRow(q, (oi, node) => answer(oi, node)));
            api.stage.querySelector("#arWheelFb").textContent = "Answer to keep the score.";
          }
          api.setHud({ Score: score, Spin: spins + "/" + SPINS, Topic: SECTORS[my].label });
          lock = false; /* stopped — the question is up, spin again after answering */
        }, 1600);
      }
      function answer(oi, node) {
        if (!q) return;
        const ok = q.options[oi].ok;
        [...api.stage.querySelectorAll(".ar-opt")].forEach((x) => {
          x.disabled = true;
          const k = Number(x.dataset.i);
          if (q.options[k].ok) x.classList.add("ok");
          else if (x === node) x.classList.add("no");
        });
        if (ok) { score += 100; U.sound.ok(); } else U.sound.no();
        api.stage.querySelector("#arWheelFb").innerHTML = ok
          ? `<b style="color:#1fa45b">Right</b> — ${tex(q.hint || "")}`
          : `<b style="color:#e5484d">Not this time</b> — the key is green. ${tex(q.hint || "")}`;
        api.setHud({ Score: score, Spin: spins + "/" + SPINS, Topic: sector >= 0 ? SECTORS[sector].label : "—" });
        q = null;
        if (spins >= SPINS) {
          setTimeout(() => {
            const record = api.finish(score);
            confetti(api.stage);
            api.over({ win: true, icon: "wheel", kicker: "Five spins", title: "Wheel complete", message: (record ? "New best. " : "") + "Five topics, five generated questions.", score: score + " pts", onAgain: build });
          }, 800);
        } else {
          lock = false;
        }
      }
      build();
      return {
        get question() { return q; },
        get spins() { return spins; },
        get sector() { return sector; },
        get score() { return score; },
        spin,
        answer(oi) { const b = [...api.stage.querySelectorAll(".ar-opt")][oi]; if (b) b.click(); },
        solve() { if (q) this.answer(rightIndex(q)); },
        miss() { if (q) this.answer(q.options.findIndex((o) => !o.ok)); },
      };
    },
  };

  /* =========================================================
     8. DISCOVERY TILES — answer to uncover the picture
     ========================================================= */
  const ART = `<svg viewBox="0 0 320 320" class="ar-art" role="img" aria-label="A parabola, its chord and a golden spiral over a coordinate grid">
    <defs>
      <linearGradient id="arSkyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2b1b57"/><stop offset="55%" stop-color="#7b4bd0"/><stop offset="100%" stop-color="#f3a05a"/>
      </linearGradient>
      <linearGradient id="arCurve" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#8ff0e0"/><stop offset="100%" stop-color="#ffffff"/>
      </linearGradient>
      <pattern id="arGrid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M32 0H0V32" fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="1"></path>
      </pattern>
    </defs>
    <rect width="320" height="320" fill="url(#arSkyGrad)"></rect>
    <rect width="320" height="320" fill="url(#arGrid)"></rect>
    <circle cx="228" cy="92" r="34" fill="#ffe9a8" opacity="0.95"></circle>
    <circle cx="228" cy="92" r="46" fill="#ffe9a8" opacity="0.18"></circle>
    <path d="M12 268 Q160 -30 308 268" fill="none" stroke="url(#arCurve)" stroke-width="4.5" stroke-linecap="round"></path>
    <path d="M62 150 L258 150" stroke="#8ff0e0" stroke-width="2" stroke-dasharray="7 6" opacity="0.75"></path>
    <path d="M92 250 C 132 250 132 214 132 190 C 132 158 168 158 168 190 C 168 214 208 214 208 190 C 208 172 192 168 186 178"
          fill="none" stroke="#ffd166" stroke-width="2.6" stroke-linecap="round"></path>
    <circle cx="160" cy="118" r="5" fill="#fff"></circle>
    <text x="168" y="112" fill="#fff" font-size="12" font-weight="700" font-family="ui-sans-serif, system-ui">vertex</text>
    <path d="M12 268 H308" stroke="#ffffff" stroke-opacity="0.55" stroke-width="2"></path>
    <path d="M160 30 V290" stroke="#ffffff" stroke-opacity="0.55" stroke-width="2"></path>
  </svg>`;

  const tiles = {
    id: "tiles", src: "Discovery Tiles", cat: "Discovery",
    twist: "every right answer lifts three tiles off a piece of maths artwork — the picture is the reward",
    title: "Discovery Tiles", kicker: "Reveal", icon: "tiles",
    blurb: "A parabola, a chord and a spiral hide under twenty-five tiles. Each right answer lifts three of them.",
    play(host) {
      const api = shell(host, tiles);
      const N = 5, ASK = 8;
      let hidden = [], asked = 0, score = 0, q = null, lock = false;

      function build() {
        hidden = [...Array(N * N).keys()].map(() => true);
        asked = 0; score = 0; lock = false;
        api.stage.innerHTML = `
          <div class="ar-tiles">
            <div class="ar-artwrap">
              ${ART}
              <div class="ar-tilegrid" id="arTileGrid" style="--n:${N}">
                ${[...Array(N * N).keys()].map((i) => `<span class="ar-dtile" data-i="${i}"></span>`).join("")}
              </div>
              <div class="ar-artbadge" id="arArtBadge">0 / ${N * N} tiles lifted</div>
            </div>
            <div class="ar-card" id="arTileAsk"></div>
          </div>`;
        ask();
      }
      function paint() {
        api.stage.querySelectorAll(".ar-dtile").forEach((n, i) => {
          n.classList.toggle("is-off", !hidden[i]);
        });
        const lifted = hidden.filter((h) => !h).length;
        const badge = api.stage.querySelector("#arArtBadge");
        if (badge) badge.textContent = lifted + " / " + (N * N) + " tiles lifted";
        api.setHud({ Score: score, Question: asked + "/" + ASK, Revealed: Math.round((lifted / (N * N)) * 100) + "%" });
      }
      function ask() {
        q = pick(courseId());
        if (!q) return;
        lock = false;
        const box = api.stage.querySelector("#arTileAsk");
        box.innerHTML = `<div class="eyebrow">Question ${asked + 1} of ${ASK}</div><div class="ar-prompt" id="arTileQ"></div>`;
        box.querySelector("#arTileQ").innerHTML = qStem(q);
        box.appendChild(askRow(q, (oi, node) => answer(oi, node)));
        paint();
      }
      function lift(n) {
        const open = hidden.map((h, i) => (h ? i : -1)).filter((i) => i >= 0);
        for (let k = 0; k < n && open.length; k++) {
          const pickAt = open.splice(ri(0, open.length - 1), 1)[0];
          hidden[pickAt] = false;
          const node = api.stage.querySelectorAll(".ar-dtile")[pickAt];
          if (node) { node.classList.add("is-off", "pop"); }
        }
      }
      function answer(oi, node) {
        if (lock || !q) return;
        lock = true;
        const ok = q.options[oi].ok;
        [...api.stage.querySelectorAll(".ar-opt")].forEach((b) => {
          b.disabled = true;
          const k = Number(b.dataset.i);
          if (q.options[k].ok) b.classList.add("ok");
          else if (b === node) b.classList.add("no");
        });
        if (ok) { score += 100; U.sound.ok(); lift(3); } else { U.sound.no(); lift(1); }
        paint();
        asked++;
        setTimeout(() => {
          if (asked >= ASK) {
            hidden = hidden.map(() => false);
            paint();
            const record = api.finish(score);
            confetti(api.stage);
            api.over({ win: true, icon: "tiles", kicker: "Picture found", title: "Fully revealed", message: (record ? "New best. " : "") + "A parabola, its chord and a golden spiral.", score: score + " pts", onAgain: build });
          } else ask();
        }, 820);
      }
      build();
      return {
        get revealed() { return hidden.filter((h) => !h).length; },
        get asked() { return asked; },
        get question() { return q; },
        get score() { return score; },
        answer(oi) { const b = [...api.stage.querySelectorAll(".ar-opt")][oi]; if (b) b.click(); },
        solve() { if (q) this.answer(rightIndex(q)); },
        miss() { if (q) this.answer(q.options.findIndex((o) => !o.ok)); },
      };
    },
  };

  /* =========================================================
     9. CIRCUIT MAZE — charge each gate to move on
     ========================================================= */
  const maze = {
    id: "maze", src: "Circuit Maze", cat: "Discovery",
    twist: "each correct answer energises the next cell of a circuit board; three wrong answers short it out",
    title: "Circuit Maze", kicker: "Charge the path", icon: "maze",
    blurb: "Ten cells of circuit between you and the exit. Every right answer lights the next one; every wrong answer blows a fuse.",
    play(host) {
      const api = shell(host, maze);
      const CELLS = 10, FUSES = 3;
      let pos = 0, fuses = FUSES, score = 0, q = null, lock = false, on = [], resizeT = null;

      function build() {
        pos = 0; fuses = FUSES; score = 0; on = [0]; lock = false;
        api.stage.innerHTML = `
          <div class="ar-maze">
            <div class="ar-board-grid" id="arMaze" style="--n:5">
              ${[...Array(CELLS).keys()].map((i) => {
                /* a snake, so the wire never has to jump the full width:
                   row 1 runs left to right, row 2 runs back */
                const row = Math.floor(i / 5) + 1, k = i % 5;
                const col = row % 2 ? k + 1 : 5 - k;
                return `<div class="ar-cell2" data-i="${i}" style="grid-row:${row};grid-column:${col}">
                  <span class="ar-cell2-dot"></span><span class="ar-cell2-n">${i + 1}</span></div>`;
              }).join("")}
              <div class="ar-maze-exit" data-i="${CELLS}" aria-hidden="true">
                ${ML.art("flag", 22)}<span class="ar-maze-exit-t">exit</span></div>
            </div>
            <div class="ar-card" id="arMazeAsk"></div>
            <div class="ar-fb" id="arMazeFb"></div>
          </div>`;
        paint();
        ask();
        /* full screen and window resizes move every cell, so redraw */
        clearTimeout(resizeT);
        resizeT = setTimeout(wires, 120);
        if (!build.bound) { build.bound = true; window.addEventListener("resize", () => wires()); }
      }
      /* the wire: one SVG under the cells, grey for the run ahead and lit for
         the part the current has reached — this is what makes the board read as
         a circuit instead of a row of grey boxes */
      function wires() {
        const grid = api.stage.querySelector("#arMaze");
        if (!grid) return;
        const cells = [...grid.querySelectorAll(".ar-cell2")];
        const exit = grid.querySelector(".ar-maze-exit");
        if (!cells.length) return;
        const g = grid.getBoundingClientRect();
        if (!g.width) return;
        const pt = (n) => {
          const r = n.getBoundingClientRect();
          return [Math.round(r.left - g.left + r.width / 2), Math.round(r.top - g.top + r.height / 2)];
        };
        const pts = cells.map(pt);
        if (exit) {
          const r = exit.getBoundingClientRect();
          pts.push([Math.round(r.left - g.left + 44), Math.round(r.top - g.top + r.height / 2)]);
        }
        const path = (from, to) => {
          let d = "";
          for (let i = from; i < to; i++) {
            const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
            if (Math.abs(y1 - y0) < 3) d += ` L${x1} ${y1}`;
            else {
              const mid = Math.round((y0 + y1) / 2);
              d += ` L${x0} ${mid} L${x1} ${mid} L${x1} ${y1}`;
            }
          }
          return d;
        };
        let svg = grid.querySelector("svg.ar-wires");
        if (!svg) {
          svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.setAttribute("class", "ar-wires");
          svg.setAttribute("aria-hidden", "true");
          grid.insertBefore(svg, grid.firstChild);
        }
        svg.setAttribute("viewBox", `0 0 ${Math.round(g.width)} ${Math.round(g.height)}`);
        const tip = pts[Math.min(Math.max(pos - 1, 0), pts.length - 1)];
        svg.innerHTML =
          `<path class="ar-wire-off" d="M${pts[0][0]} ${pts[0][1]}${path(0, pts.length - 1)}"></path>` +
          (pos > 0
            ? `<path class="ar-wire-on" d="M${pts[0][0]} ${pts[0][1]}${path(0, Math.min(pos, pts.length - 1) - 1)}"></path>` +
              `<circle class="ar-wire-tip" cx="${tip[0]}" cy="${tip[1]}" r="5"></circle>`
            : "");
      }
      function paint() {
        wires();
        api.stage.querySelectorAll(".ar-cell2").forEach((n, i) => {
          n.classList.toggle("is-on", on.indexOf(i) >= 0);
          n.classList.toggle("is-here", i === pos);
        });
        const exit = api.stage.querySelector(".ar-maze-exit");
        if (exit) exit.classList.toggle("is-on", pos >= CELLS);
        api.setHud({ Score: score, Circuit: pos + "/" + CELLS, Fuses: ML.art.tokens("fuse", fuses) });
      }
      function ask() {
        q = pick(courseId());
        if (!q) return;
        lock = false;
        const box = api.stage.querySelector("#arMazeAsk");
        box.innerHTML = `<div class="eyebrow">Gate ${pos + 1} of ${CELLS}</div><div class="ar-prompt" id="arMazeQ"></div>`;
        box.querySelector("#arMazeQ").innerHTML = qStem(q);
        box.appendChild(askRow(q, (oi, node) => answer(oi, node)));
        const fb = api.stage.querySelector("#arMazeFb");
        if (fb) fb.textContent = "Answer to send current down the next link.";
      }
      function answer(oi, node) {
        if (lock || !q) return;
        lock = true;
        const ok = q.options[oi].ok;
        [...api.stage.querySelectorAll(".ar-opt")].forEach((b) => {
          b.disabled = true;
          const k = Number(b.dataset.i);
          if (q.options[k].ok) b.classList.add("ok");
          else if (b === node) b.classList.add("no");
        });
        const fb = api.stage.querySelector("#arMazeFb");
        if (ok) {
          score += 100; pos++;
          on.push(Math.min(pos, CELLS));
          U.sound.ok();
          if (fb) fb.innerHTML = `<b style="color:#1fa45b">Current flows</b> — gate ${Math.min(pos, CELLS)} lit. ${tex(q.hint || "")}`;
          paint();
          if (pos >= CELLS) {
            paint();
            setTimeout(() => {
              on = [...Array(CELLS).keys()];
              paint();
              const record = api.finish(score);
              confetti(api.stage);
              api.over({ win: true, icon: "maze", kicker: "Circuit closed", title: "You reached the exit", message: (record ? "New best. " : "") + "Ten gates, " + (FUSES - fuses) + " fuses blown.", score: score + " pts", onAgain: build });
            }, 500);
            return;
          }
        } else {
          fuses--;
          score = Math.max(0, score - 25);
          U.sound.thud();
          if (fb) fb.innerHTML = `<b style="color:#e5484d">Short circuit</b> — a fuse blew. ${tex(q.hint || "")}`;
          paint();
          if (fuses <= 0) {
            const record = api.finish(score);
            api.over({ win: true, icon: "maze", kicker: "Fuses gone", title: "The circuit died", message: (record ? "New best. " : "") + "You lit " + pos + " of " + CELLS + " gates.", score: score + " pts", onAgain: build });
            return;
          }
        }
        paint();
        setTimeout(() => { if (fuses > 0) ask(); }, 800);
      }
      build();
      return {
        get pos() { return pos; },
        get at() { return pos; },
        get fuses() { return fuses; },
        get question() { return q; },
        get score() { return score; },
        get lit() { return on.slice(); },
        answer(oi) { const b = [...api.stage.querySelectorAll(".ar-opt")][oi]; if (b) b.click(); },
        solve() { if (q) this.answer(rightIndex(q)); },
        miss() { if (q) this.answer(q.options.findIndex((o) => !o.ok)); },
      };
    },
  };

  /* =========================================================
     10. MAGNET ZAP — zap the magnet with the right answer
     ========================================================= */
  const zap = {
    id: "zap", src: "Magnet Zap", cat: "Reflex & aim",
    twist: "magnets drift across the field carrying answers; zap the right one, three bad zaps ends the run",
    title: "Magnet Zap", kicker: "Aim & fire", icon: "zap",
    blurb: "Four magnets drift across the field. Zap the one carrying the right value — every wrong zap costs a shield.",
    play(host) {
      const api = shell(host, zap);
      let q = null, score = 0, shields = 3, hits = 0, lock = false, seq = 0;

      function build() {
        score = 0; shields = 3; hits = 0; lock = false;
        api.stage.innerHTML = `
          <div class="ar-zap">
            <div class="ar-zapfield" id="arZapField">
              <div class="ar-stars" aria-hidden="true">${Array.from({ length: 22 }, () =>
                `<i style="left:${ri(2, 97)}%;top:${ri(4, 88)}%;animation-delay:${(ri(0, 26) / 10).toFixed(1)}s"></i>`).join("")}</div>
            </div>
            <div class="ar-zapprompt" id="arZapPrompt"></div>
            <div class="ar-fb" id="arZapFb">Zap the magnet with the right answer.</div>
          </div>`;
        next();
      }
      function next() {
        seq++;
        q = pick(courseId());
        if (!q) return;
        const field = api.stage.querySelector("#arZapField");
        [...field.querySelectorAll(".ar-magnet")].forEach((n) => n.remove());
        api.stage.querySelector("#arZapPrompt").innerHTML = qStem(q);
        const opts = q.options.slice(0, 4);
        opts.forEach((o, i) => {
          const b = el("button", "ar-magnet");
          b.type = "button";
          b.dataset.i = String(i);
          b.style.top = (8 + i * 21 + ri(0, 5)) + "%";
          b.style.animationDuration = (9 + ri(0, 5)) + "s";
          b.style.animationDelay = "-" + ri(0, 6) + "s";
          b.innerHTML = `<span class="ar-magnet-n">${tex(o.html)}</span>`;
          b.addEventListener("click", () => fire(i, b));
          field.appendChild(b);
        });
        api.setHud({ Score: score, Shields: ML.art.tokens("shield", shields), Zapped: hits });
      }
      function fire(i, node) {
        if (lock || !q) return;
        const ok = q.options[i].ok;
        if (ok) {
          lock = true;
          hits++; score += 60;
          node.classList.add("is-zapped");
          U.sound.coin();
          api.stage.querySelector("#arZapFb").innerHTML = `<b style="color:#1fa45b">Zapped</b> — ${tex(q.hint || "")}`;
          [...api.stage.querySelectorAll(".ar-magnet")].forEach((m) => { m.style.pointerEvents = "none"; });
          setTimeout(() => { lock = false; next(); }, 620);
        } else {
          shields--;
          score = Math.max(0, score - 20);
          node.classList.add("is-no");
          node.disabled = true;
          U.sound.no();
          api.stage.querySelector("#arZapFb").innerHTML = `<b style="color:#e5484d">Wrong magnet</b> — that one is not the answer.`;
          api.setHud({ Score: score, Shields: ML.art.tokens("shield", shields), Zapped: hits });
          if (shields <= 0) {
            const record = api.finish(score);
            api.over({ win: true, icon: "zap", kicker: "Shields down", title: "Run over", message: (record ? "New best. " : "") + "You zapped " + hits + " correct magnets.", score: score + " pts", onAgain: build });
          }
        }
      }
      build();
      return {
        get prompt() { return q; },
        get magnets() { return [...api.stage.querySelectorAll(".ar-magnet")].length; },
        get shields() { return shields; },
        get score() { return score; },
        fire(i) { const b = [...api.stage.querySelectorAll(".ar-magnet")][i]; if (b) b.click(); },
        solve() { if (q) this.fire(rightIndex(q)); },
        miss() { if (q) this.fire(q.options.findIndex((o) => !o.ok)); },
      };
    },
  };

  /* =========================================================
     11. GROUP SORT — three families, twelve cards
     ========================================================= */
  const groupSort = {
    id: "groups", src: "Group Sort", cat: "Sorting & groups",
    twist: "three function families — linear, quadratic, exponential — and twelve generated forms to place",
    title: "Group Sort", kicker: "Three-way sort", icon: "groups",
    blurb: "Linear, quadratic or exponential? Twelve expressions, three groups, and a hint each time you slip.",
    play(host) {
      const api = shell(host, groupSort);
      const GROUPS = ["Linear", "Quadratic", "Exponential"];
      let cards = [], sorted = 0, score = 0, sel = -1, lock = false;

      function makeCard() {
        const kind = ri(0, 2);
        const a = ri(1, 5) * (Math.random() < 0.3 ? -1 : 1), b = ri(-6, 6);
        if (kind === 0) return { text: "y = " + a + "x" + (b < 0 ? " − " + Math.abs(b) : b > 0 ? " + " + b : ""), group: 0 };
        if (kind === 1) { const c2 = ri(-5, 5); return { text: "y = " + a + "x²" + (b < 0 ? " − " + Math.abs(b) : b > 0 ? " + " + b : "") + "x" + (c2 < 0 ? " − " + Math.abs(c2) : c2 > 0 ? " + " + c2 : ""), group: 1 }; }
        const base = [2, 3, 5, 10][ri(0, 3)];
        return { text: "y = " + a + " · " + base + "ˣ", group: 2 };
      }
      function build() {
        const seen = new Set();
        cards = [];
        while (cards.length < 12) {
          const c = makeCard();
          if (seen.has(c.text)) continue;
          seen.add(c.text);
          cards.push(Object.assign({ done: false }, c));
        }
        cards = shuffle(cards);
        sorted = 0; score = 0; sel = -1; lock = false;
        api.stage.innerHTML = `
          <div class="ar-groups">
            <div class="ar-group-cards" id="arGCards"></div>
            <div class="ar-group-bins" id="arGBins">
              ${GROUPS.map((g, i) => `<button class="ar-bin" data-g="${i}"><b>${esc(g)}</b><span>drop here</span></button>`).join("")}
            </div>
            <div class="ar-fb" id="arGFb">Tap a card, then the group it belongs to.</div>
          </div>`;
        api.stage.querySelectorAll(".ar-bin").forEach((b) => b.addEventListener("click", () => drop(Number(b.dataset.g))));
        paint();
      }
      function paint() {
        const box = api.stage.querySelector("#arGCards");
        box.innerHTML = "";
        cards.forEach((c, i) => {
          if (c.done) return;
          const n = el("button", "ar-gcard" + (sel === i ? " is-sel" : ""), tex(c.text));
          n.type = "button";
          n.dataset.i = String(i);
          n.addEventListener("click", () => { if (!lock) { sel = i; U.sound.click(); paint(); } });
          box.appendChild(n);
        });
        api.setHud({ Score: score, Sorted: sorted + "/12", Left: cards.filter((c) => !c.done).length });
      }
      function drop(g) {
        if (lock || sel < 0) return;
        const c = cards[sel];
        const fb = api.stage.querySelector("#arGFb");
        if (c.group === g) {
          c.done = true; sorted++; score += 40;
          U.sound.ok();
          if (fb) fb.innerHTML = `<b style="color:#1fa45b">${esc(GROUPS[g])}</b> — ${tex(c.text)} belongs here.`;
          sel = -1;
          paint();
          if (sorted === cards.length) {
            const record = api.finish(score);
            confetti(api.stage);
            api.over({ win: true, icon: "groups", kicker: "All sorted", title: "Three groups filled", message: (record ? "New best. " : "") + "Twelve forms classified.", score: score + " pts", onAgain: build });
          }
        } else {
          score = Math.max(0, score - 10);
          U.sound.no();
          if (fb) fb.innerHTML = `<b style="color:#e5484d">Not ${esc(GROUPS[g])}</b> — look at the highest power of x.`;
          const node = api.stage.querySelector('.ar-gcard[data-i="' + sel + '"]');
          if (node) { node.classList.add("is-no"); setTimeout(() => node && node.classList.remove("is-no"), 450); }
        }
      }
      build();
      return {
        get groups() { return GROUPS.slice(); },
        get cards() { return cards.map((c) => ({ text: c.text, group: c.group, done: c.done })); },
        get sorted() { return sorted; },
        get score() { return score; },
        pick(i) { if (!lock) { sel = i; paint(); } },
        drop,
        solve() {
          const i = cards.findIndex((c) => !c.done);
          if (i < 0) return;
          this.pick(i);
          drop(cards[i].group);
        },
        miss() {
          const i = cards.findIndex((c) => !c.done);
          if (i < 0) return;
          this.pick(i);
          drop((cards[i].group + 1) % 3);
        },
      };
    },
  };

  /* =========================================================
     12. ROCKET GLIDE — climb to orbit on correct answers
     ========================================================= */
  const rocket = {
    id: "rocket", src: "Rocket Glide", cat: "Discovery",
    twist: "the fuel gauge is right answers — ten of them from the pad to orbit at 100 km",
    title: "Rocket Glide", kicker: "Climb to orbit", icon: "rocket",
    blurb: "Ten questions stand between the pad and orbit. Every right answer burns fuel upward; three wrong ones and the launch is scrubbed.",
    play(host) {
      const api = shell(host, rocket);
      const GOAL = 100, FUEL = 3;
      let alt = 0, fuel = FUEL, score = 0, q = null, lock = false;

      function build() {
        alt = 0; fuel = FUEL; score = 0; lock = false;
        api.stage.innerHTML = `
          <div class="ar-rocket">
            <div class="ar-skycol">
              <div class="ar-stars" aria-hidden="true">${[...Array(18).keys()].map((i) => `<i style="left:${(i * 53) % 96}%; top:${(i * 31) % 92}%; animation-delay:${(i % 5) * 0.4}s"></i>`).join("")}</div>
              <div class="ar-alt-track"><div class="ar-alt-fill" id="arAltFill"></div></div>
              <div class="ar-ship" id="arShip" aria-hidden="true">${ML.art("rocket", 28, "ar-thrust")}</div>
              <div class="ar-orbit" id="arOrbit">orbit · 100 km</div>
              <div class="ar-alt-label" id="arAltLabel">0 km</div>
            </div>
            <div class="ar-rocket-side">
              <div class="ar-card" id="arRocketAsk"></div>
              <div class="ar-fb" id="arRocketFb"></div>
            </div>
          </div>`;
        ask();
        paint();      /* the HUD (altitude, fuel) exists before the first answer */
      }
      function paint() {
        const pct = Math.min(100, alt);
        const fill = api.stage.querySelector("#arAltFill");
        const ship = api.stage.querySelector("#arShip");
        const lab = api.stage.querySelector("#arAltLabel");
        if (fill) fill.style.height = pct + "%";
        if (ship) {
          /* keep the ship clear of the ground band at lift-off */
          ship.style.bottom = "calc(" + pct + "% * 0.82 + 26px)";
          ship.classList.add("is-burn");
          clearTimeout(ship.__burn);
          ship.__burn = setTimeout(() => ship.classList.remove("is-burn"), 900);
        }
        if (lab) lab.textContent = alt + " km";
        api.setHud({ Score: score, Altitude: alt + " km", Fuel: ML.art.tokens("fuel", fuel) });
      }
      function ask() {
        q = pick(courseId());
        if (!q) return;
        lock = false;
        const box = api.stage.querySelector("#arRocketAsk");
        box.innerHTML = `<div class="eyebrow">Burn ${Math.round(alt / 10) + 1}</div><div class="ar-prompt" id="arRQ"></div>`;
        box.querySelector("#arRQ").innerHTML = qStem(q);
        box.appendChild(askRow(q, (oi, node) => answer(oi, node)));
      }
      function answer(oi, node) {
        if (lock || !q) return;
        lock = true;
        const ok = q.options[oi].ok;
        [...api.stage.querySelectorAll(".ar-opt")].forEach((b) => {
          b.disabled = true;
          const k = Number(b.dataset.i);
          if (q.options[k].ok) b.classList.add("ok");
          else if (b === node) b.classList.add("no");
        });
        const fb = api.stage.querySelector("#arRocketFb");
        if (ok) {
          alt = Math.min(GOAL, alt + 10);
          score += 100;
          U.sound.ok();
          if (fb) fb.innerHTML = `<b style="color:#1fa45b">Burn</b> — +10 km. ${tex(q.hint || "")}`;
          paint();
          if (alt >= GOAL) {
            const record = api.finish(score);
            confetti(api.stage);
            api.over({ win: true, icon: "rocket", kicker: "Orbit", title: "100 km — orbit reached", message: (record ? "New best. " : "") + "Fuel left: " + fuel + ".", score: score + " pts", onAgain: build });
            return;
          }
        } else {
          fuel--;
          U.sound.thud();
          if (fb) fb.innerHTML = `<b style="color:#e5484d">Fuel lost</b> — ${tex(q.hint || "")}`;
          paint();
          if (fuel <= 0) {
            const record = api.finish(score);
            api.over({ win: true, icon: "rocket", kicker: "Scrubbed", title: "Not enough fuel", message: (record ? "New best. " : "") + "You reached " + alt + " km.", score: score + " pts", onAgain: build });
            return;
          }
        }
        setTimeout(() => ask(), 780);
      }
      build();
      return {
        get altitude() { return alt; },
        get fuel() { return fuel; },
        get question() { return q; },
        get score() { return score; },
        answer(oi) { const b = [...api.stage.querySelectorAll(".ar-opt")][oi]; if (b) b.click(); },
        solve() { if (q) this.answer(rightIndex(q)); },
        miss() { if (q) this.answer(q.options.findIndex((o) => !o.ok)); },
      };
    },
  };

  /* =========================================================
     13. PENGUIN LEAP — hop to the floe with the right answer
     ========================================================= */
  const leap = {
    id: "leap", src: "Penguin Leap", cat: "Reflex & aim",
    twist: "each floe carries an answer; leap onto the right one and the penguin gets a hop closer to the igloo",
    title: "Penguin Leap", kicker: "Hop", icon: "leap",
    blurb: "Three ice floes, three answers, one penguin. Eight good hops reach the igloo — a slip costs a fish.",
    play(host) {
      const api = shell(host, leap);
      const HOPS = 8, FISH = 3;
      let hops = 0, fish = FISH, score = 0, q = null, lock = false;

      function build() {
        hops = 0; fish = FISH; score = 0; lock = false;
        api.stage.innerHTML = `
          <div class="ar-leap">
            <div class="ar-leap-scene">
              <div class="ar-igloo" id="arIgloo" aria-hidden="true">${ML.art("igloo", 34)}</div>
              <i class="ar-floe-d" style="left:24%;bottom:74px;width:70px;animation-delay:.2s"></i>
              <i class="ar-floe-d" style="left:41%;bottom:96px;width:46px;animation-delay:1.2s"></i>
              <i class="ar-floe-d" style="left:60%;bottom:66px;width:84px;animation-delay:2s"></i>
              <div class="ar-ice" id="arIce"></div>
              <div class="ar-penguin" id="arPenguin" aria-hidden="true">${ML.art("leap", 36, "ar-bob")}</div>
            </div>
            <div class="ar-card" id="arLeapAsk"></div>
            <div class="ar-fb" id="arLeapFb"></div>
          </div>`;
        ask();
      }
      function paint() {
        const ice = api.stage.querySelector("#arIce");
        const pen = api.stage.querySelector("#arPenguin");
        if (ice) ice.style.width = Math.min(96, (hops / HOPS) * 88 + 4) + "%";
        if (pen) pen.style.left = Math.min(88, (hops / HOPS) * 82 + 2) + "%";
        api.setHud({ Score: score, Hop: hops + "/" + HOPS, Fish: ML.art.tokens("fish", fish) });
      }
      function ask() {
        q = pick(courseId());
        if (!q) return;
        lock = false;
        const box = api.stage.querySelector("#arLeapAsk");
        box.innerHTML = `<div class="eyebrow">Floe set ${hops + 1}</div><div class="ar-prompt" id="arLQ"></div>`;
        box.querySelector("#arLQ").innerHTML = qStem(q);
        /* three floes, and the right answer is always on one of them */
        const oki = q.options.findIndex((o) => o.ok);
        const rest = q.options.map((o, i) => i).filter((i) => i !== oki);
        const shownIdx = shuffle([oki].concat(shuffle(rest).slice(0, 2)));
        const row = el("div", "ar-opts ar-floes");
        shownIdx.forEach((oi) => {
          const b = el("button", "ar-opt ar-floe");
          b.type = "button";
          b.dataset.i = String(oi);
          b.innerHTML = `<span class="ar-opt-t">${tex(q.options[oi].html)}</span>`;
          b.addEventListener("click", () => answer(oi, b));
          row.appendChild(b);
        });
        box.appendChild(row);
        paint();
      }
      function answer(oi, node) {
        if (lock || !q) return;
        lock = true;
        const ok = q.options[oi].ok;
        [...api.stage.querySelectorAll(".ar-floe")].forEach((b) => {
          b.disabled = true;
          const k = Number(b.dataset.i);
          if (q.options[k].ok) b.classList.add("ok");
          else if (b === node) b.classList.add("no");
        });
        const fb = api.stage.querySelector("#arLeapFb");
        const pen = api.stage.querySelector("#arPenguin");
        if (ok) {
          hops++; score += 100;
          U.sound.ok();
          if (pen) { pen.classList.add("is-hop"); setTimeout(() => pen && pen.classList.remove("is-hop"), 520); }
          if (fb) fb.innerHTML = `<b style="color:#1fa45b">Hop!</b> ${tex(q.hint || "")}`;
          paint();
          if (hops >= HOPS) {
            const record = api.finish(score);
            confetti(api.stage);
            api.over({ win: true, icon: "leap", kicker: "Igloo reached", title: "Eight clean hops", message: (record ? "New best. " : "") + "Fish left: " + fish + ".", score: score + " pts", onAgain: build });
            return;
          }
        } else {
          fish--;
          U.sound.thud();
          if (pen) { pen.classList.add("is-slip"); setTimeout(() => pen && pen.classList.remove("is-slip"), 480); }
          if (fb) fb.innerHTML = `<b style="color:#e5484d">Slipped</b> — ${tex(q.hint || "")}`;
          paint();
          if (fish <= 0) {
            const record = api.finish(score);
            api.over({ win: true, icon: "leap", kicker: "Out of fish", title: "The ice won", message: (record ? "New best. " : "") + "You made " + hops + " hops.", score: score + " pts", onAgain: build });
            return;
          }
        }
        setTimeout(() => ask(), 720);
      }
      build();
      return {
        get hops() { return hops; },
        get fish() { return fish; },
        get question() { return q; },
        get score() { return score; },
        answer(oi) { const b = api.stage.querySelector('.ar-floe[data-i="' + oi + '"]'); if (b) b.click(); },
        solve() { if (q) this.answer(rightIndex(q)); },
        miss() { if (q) this.answer(q.options.findIndex((o) => !o.ok)); },
      };
    },
  };

  /* =========================================================
     14. ZOOM GUESS — name the curve from a close-up
     ========================================================= */
  const CURVES = [
    { id: "par", label: "a parabola", tex: "$y = x^2 - 2$", f: (x) => x * x - 2 },
    { id: "cub", label: "a cubic", tex: "$y = x^3 - 3x$", f: (x) => x * x * x - 3 * x },
    { id: "sin", label: "a sine wave", tex: "$y = \\sin x$", f: (x) => Math.sin(x) },
    { id: "exp", label: "an exponential", tex: "$y = 2^x$", f: (x) => Math.pow(2, x) },
    { id: "log", label: "a logarithm", tex: "$y = \\ln x$", f: (x) => (x > 0 ? Math.log(x) : NaN) },
    { id: "hyp", label: "a hyperbola", tex: "$y = \\dfrac{1}{x}$", f: (x) => (Math.abs(x) < 1e-6 ? NaN : 1 / x) },
    { id: "abs", label: "a V (absolute value)", tex: "$y = |x| - 1$", f: (x) => Math.abs(x) - 1 },
    { id: "sqrt", label: "a square root", tex: "$y = \\sqrt{x}$", f: (x) => (x >= 0 ? Math.sqrt(x) : NaN) },
  ];
  const zoom = {
    id: "zoom", src: "Zoom Guess", cat: "Discovery",
    twist: "a real graph drawn on canvas, zoomed into one feature — name the function from its close-up",
    title: "Zoom Guess", kicker: "Zoom in, name it", icon: "zoom",
    blurb: "Start deep inside a curve, then pull back. Four guesses, four functions — the graph itself is drawn by this site's plotter.",
    play(host) {
      const api = shell(host, zoom);
      const ROUNDS = 4;
      let round = 0, score = 0, target = null, options = [], span = 0.6, cx = 0, cy = 0, cv = null, lock = false, autoT = null;

      function build() {
        round = 0; score = 0; lock = false;
        api.stage.innerHTML = `
          <div class="ar-zoom">
            <div class="ar-zoom-plot"><canvas id="arZoomCv" width="640" height="360" aria-label="zoomed graph"></canvas>
              <div class="ar-zoom-badge" id="arZoomBadge">zoom ×1</div></div>
            <div class="ar-zoom-side">
              <div class="ar-card"><div class="eyebrow" id="arZoomKicker">Round 1 of 4</div>
                <div class="ar-prompt">Which function is this?</div></div>
              <div id="arZoomOpts"></div>
              <div class="ar-row-btns"><button class="btn ghost sm" id="arZoomOut">Zoom out (−)</button></div>
              <div class="ar-fb" id="arZoomFb">Pull back as far as you need.</div>
            </div>
          </div>`;
        cv = api.stage.querySelector("#arZoomCv");
        api.stage.querySelector("#arZoomOut").addEventListener("click", () => zoomOut());
        newRound();
      }
      function newRound() {
        target = CURVES[ri(0, CURVES.length - 1)];
        const others = shuffle(CURVES.filter((c) => c.id !== target.id)).slice(0, 3);
        options = shuffle([target].concat(others));
        span = 0.35; cx = 0; cy = target.f(0);
        if (target.id === "exp") { cx = 0.2; cy = Math.pow(2, 0.2); }
        if (target.id === "log" || target.id === "sqrt") { cx = 1.4; cy = target.f(1.4); }
        if (target.id === "hyp") { cx = 1.1; cy = 1 / 1.1; }
        if (target.id === "sin") { cx = 1.1; cy = Math.sin(1.1); }
        lock = false;
        const box = api.stage.querySelector("#arZoomOpts");
        box.innerHTML = "";
        const row = el("div", "ar-opts");
        options.forEach((c, i) => {
          const b = el("button", "ar-opt");
          b.type = "button";
          b.dataset.i = String(i);
          b.innerHTML = `<span class="ar-opt-k">${"ABCD"[i]}</span><span class="ar-opt-t">${tex(c.tex)}</span>`;
          b.addEventListener("click", () => answer(i, b));
          row.appendChild(b);
        });
        box.appendChild(row);
        api.stage.querySelector("#arZoomKicker").textContent = "Round " + (round + 1) + " of " + ROUNDS;
        api.stage.querySelector("#arZoomFb").textContent = "Pull back as far as you need.";
        draw();
        clearInterval(autoT);
        autoT = setInterval(() => { if (!lock) zoomOut(true); }, 5200);
      }
      function draw() {
        if (!cv) return;
        const g = cv.getContext && cv.getContext("2d");
        if (!g) return;
        const W = cv.width, H = cv.height;
        g.clearRect(0, 0, W, H);
        g.fillStyle = "#0b1020";
        g.fillRect(0, 0, W, H);
        const x0 = cx - span, x1 = cx + span;
        const y0 = cy - span * (H / W), y1 = cy + span * (H / W);
        const px = (x) => ((x - x0) / (x1 - x0)) * W;
        const py = (y) => H - ((y - y0) / (y1 - y0)) * H;
        g.strokeStyle = "rgba(255,255,255,.13)";
        g.lineWidth = 1;
        const step = span / 4;
        for (let k = -4; k <= 4; k++) {
          const gx = cx + k * step, gy = cy + k * step * (H / W);
          g.beginPath(); g.moveTo(px(gx), 0); g.lineTo(px(gx), H); g.stroke();
          g.beginPath(); g.moveTo(0, py(gy)); g.lineTo(W, py(gy)); g.stroke();
        }
        g.strokeStyle = "#8ff0e0";
        g.lineWidth = 3;
        g.beginPath();
        let started = false;
        for (let i = 0; i <= 400; i++) {
          const x = x0 + ((x1 - x0) * i) / 400;
          const y = target.f(x);
          if (!isFinite(y) || Math.abs(y) > Math.abs(span) * 40) { started = false; continue; }
          const X = px(x), Y = py(y);
          if (Y < -2000 || Y > H + 2000) { started = false; continue; }
          if (!started) { g.moveTo(X, Y); started = true; } else g.lineTo(X, Y);
        }
        g.stroke();
        const badge = api.stage.querySelector("#arZoomBadge");
        if (badge) badge.textContent = "window ±" + (span < 1 ? span.toFixed(2) : span.toFixed(1));
        api.setHud({ Score: score, Round: (round + 1) + "/" + ROUNDS, Window: "±" + (span < 1 ? span.toFixed(2) : span.toFixed(1)) });
      }
      function zoomOut(auto) {
        if (lock) return;
        if (span > 6) return;
        span = Math.min(8, span * 1.9);
        draw();
        if (!auto) U.sound.click();
      }
      function answer(i, node) {
        if (lock) return;
        lock = true;
        clearInterval(autoT);
        const okShot = options[i].id === target.id;
        [...api.stage.querySelectorAll(".ar-opt")].forEach((b) => {
          b.disabled = true;
          const k = Number(b.dataset.i);
          if (options[k].id === target.id) b.classList.add("ok");
          else if (b === node) b.classList.add("no");
        });
        if (okShot) { score += 150; U.sound.ok(); } else { score = Math.max(0, score - 50); U.sound.no(); }
        api.stage.querySelector("#arZoomFb").innerHTML = (okShot ? `<b style="color:#1fa45b">Correct</b> — it is ` : `<b style="color:#e5484d">Not quite</b> — it is `) + tex(target.tex) + ".";
        span = 8; draw();
        setTimeout(() => {
          round++;
          if (round >= ROUNDS) {
            const record = api.finish(score);
            confetti(api.stage);
            api.over({ win: true, icon: "zoom", kicker: "Four curves", title: "Sharp eye", message: (record ? "New best. " : "") + "Four graphs, four shapes named.", score: score + " pts", onAgain: build });
          } else newRound();
        }, 1300);
      }
      build();
      return {
        get equation() { return target; },
        get options() { return options.slice(); },
        /* the key, in the same order as the buttons: zoom is the one mode whose
           curve list has no ok flag, so the answer index is published here */
        get answerIndex() { return options.findIndex((c) => c.id === target.id); },
        get round() { return round; },
        get score() { return score; },
        get window() { return span; },
        zoomOut: () => zoomOut(),
        answer(i) { const b = [...api.stage.querySelectorAll(".ar-opt")][i]; if (b) b.click(); },
        solve() { this.answer(options.findIndex((c) => c.id === target.id)); },
        miss() { this.answer(options.findIndex((c) => c.id !== target.id)); },
      };
    },
  };

  /* =========================================================
     15. CORRECTING DECK — the mixed mastery loop
     ========================================================= */
  const reviewDeck = {
    id: "deck", src: "Correcting Deck", cat: "Review",
    twist: "mixed mastery: a wrong answer puts the card back in the deck, so the deck only empties when you know it",
    title: "Correcting Deck", kicker: "Mixed mastery", icon: "deck",
    blurb: "A deck of ten questions drawn from every course. A miss puts the card back at the bottom — clear the deck to finish.",
    play(host) {
      const api = shell(host, reviewDeck);
      const SIZE = 10;
      let deckCards = [], attempts = 0, right = 0, score = 0, q = null, lock = false;

      function build() {
        deckCards = deck("", SIZE) ;
        if (deckCards.length < SIZE) deckCards = deck(courseId(), SIZE);
        attempts = 0; right = 0; score = 0; lock = false;
        api.stage.innerHTML = `
          <div class="ar-deckg">
            <div class="ar-deckg-side">
              <div class="ar-deckg-count" id="arDeckCount">${deckCards.length}</div>
              <div class="muted small">cards left</div>
              <div class="ar-deckg-stack" aria-hidden="true"><i></i><i></i><i></i></div>
              <div class="ar-fb muted small" id="arDeckStat"></div>
            </div>
            <div class="ar-card" id="arDeckAsk"></div>
          </div>`;
        paint();
        ask();
      }
      function paint() {
        const c = api.stage.querySelector("#arDeckCount");
        if (c) c.textContent = String(deckCards.length);
        const st = api.stage.querySelector("#arDeckStat");
        if (st) st.textContent = right + " right · " + Math.max(0, attempts - right) + " retried";
        api.setHud({ Score: score, Deck: deckCards.length, Attempts: attempts });
      }
      function ask() {
        q = deckCards[0];
        if (!q) return;
        lock = false;
        const box = api.stage.querySelector("#arDeckAsk");
        box.innerHTML = `<div class="eyebrow">Card ${attempts + 1} · ${esc(q.course ? q.course.toUpperCase() : "mixed")}</div><div class="ar-prompt" id="arDQ"></div>`;
        box.querySelector("#arDQ").innerHTML = qStem(q);
        box.appendChild(askRow(q, (oi, node) => answer(oi, node)));
      }
      function answer(oi, node) {
        if (lock || !q) return;
        lock = true;
        attempts++;
        const ok = q.options[oi].ok;
        [...api.stage.querySelectorAll(".ar-opt")].forEach((b) => {
          b.disabled = true;
          const k = Number(b.dataset.i);
          if (q.options[k].ok) b.classList.add("ok");
          else if (b === node) b.classList.add("no");
        });
        const card = deckCards.shift();
        const fb = el("div", "ar-fb");
        if (ok) {
          right++; score += 100;
          U.sound.ok();
          fb.innerHTML = `<b style="color:#1fa45b">Retired</b> — ${tex(q.hint || "")}`;
        } else {
          deckCards.push(card);
          U.sound.no();
          fb.innerHTML = `<b style="color:#e5484d">Back in the deck</b> — ${tex(q.hint || "")}`;
        }
        api.stage.querySelector("#arDeckAsk").appendChild(fb);
        paint();
        setTimeout(() => {
          if (!deckCards.length) {
            const record = api.finish(score);
            confetti(api.stage);
            api.over({ win: true, icon: "deck", kicker: "Deck cleared", title: "Everything known", message: (record ? "New best. " : "") + "Cleared in " + attempts + " attempts.", score: score + " pts", onAgain: build });
          } else ask();
        }, 900);
      }
      build();
      return {
        get remaining() { return deckCards.length; },
        get attempts() { return attempts; },
        get question() { return q; },
        get score() { return score; },
        answer(oi) { const b = [...api.stage.querySelectorAll(".ar-opt")][oi]; if (b) b.click(); },
        solve() { if (q) this.answer(rightIndex(q)); },
        miss() { if (q) this.answer(q.options.findIndex((o) => !o.ok)); },
      };
    },
  };
  A.add(pairs, sweep, recall, flashcards, bubbles, crates, wheel,
        tiles, maze, zap, groupSort, rocket, leap, zoom, reviewDeck);

  /* the app was registered by arcade.js when only its six board modes
     existed — now that all twenty-one are in, say so in the header */
  if (ML.apps.arcade) ML.apps.arcade.tag = A.ORDER.length + " game modes";
})();

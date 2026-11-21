/* ==========================================================================
   Fikr lesson-game kit — LK
   One learning loop for every K–12 game: home → Learn → 3 levels → trophy.
   An author writes only the world, the Learn slides and the rounds.

     LK.start({ id, title, emoji, topic, grade, band, world, how, learn,
                levels:[{name, icon, blurb, rounds, round(R,i)}],
                praise, finale })
   Round API (R): el, level, index, rounds, hints, say, right, wrong,
                  solve, later, every, on, sfx, fx, ease
   UI (LK.ui):   choice, tiles, keypad, sliders
   Test hooks:   LK.test.pass() · fail() · state() · level(i)   (never shown to a pupil)
   ========================================================================== */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";

  /* ---------------- helpers ---------------- */
  function h(tag, attrs, kids) {
    const n = document.createElement(tag);
    apply(n, attrs);
    (kids || []).forEach((k) => k && n.append(k));
    return n;
  }
  function apply(n, attrs) {
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v == null || v === false) return;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k === "html") n.innerHTML = v;
      else if (k === "style") n.setAttribute("style", v);
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2).toLowerCase(), v);
      else n.setAttribute(k, v);
    });
  }
  function s(tag, attrs, kids) {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v == null || v === false) return;
      if (k === "text") n.textContent = v;
      else if (k === "class") n.setAttribute("class", v);
      else if (k === "fill" || k === "stroke") n.style[k] = v;
      else n.setAttribute(k, v);
    });
    (kids || []).forEach((k) => k && n.append(k));
    return n;
  }
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmt = (n, d) => {
    const v = Math.abs(n) < 1e-12 ? 0 : n;
    return d == null ? String(Math.round(v * 1e6) / 1e6) : v.toFixed(d);
  };
  const reduced = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- sound, without files ---------------- */
  let AC = null;
  function tone(freq, ms, type, gain) {
    try {
      if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === "suspended") AC.resume();
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      g.gain.value = gain == null ? 0.07 : gain;
      o.connect(g).connect(AC.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + (ms || 120) / 1000);
      o.stop(AC.currentTime + (ms || 120) / 1000);
    } catch (e) { /* audio is a bonus, never a requirement */ }
  }
  const sfx = {
    right: () => { tone(660, 110); setTimeout(() => tone(880, 120), 90); },
    wrong: () => tone(170, 200, "square", 0.05),
    tap: () => tone(520, 60, "sine", 0.04),
    streak: () => { [660, 830, 990].forEach((f, i) => setTimeout(() => tone(f, 110), i * 80)); },
    level: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 150), i * 110)); },
  };

  /* ---------------- storage: best stars per game, per level ---------------- */
  const KEY = "fikr:stars:v1";
  function store() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; }
  }
  function bestOf(id, lv) { const t = store(); return (t[id] && t[id][lv]) || 0; }
  function saveBest(id, lv, stars) {
    try {
      const t = store();
      t[id] = t[id] || {};
      if ((t[id][lv] || 0) < stars) t[id][lv] = stars;
      localStorage.setItem(KEY, JSON.stringify(t));
    } catch (e) { /* private mode */ }
  }

  /* ---------------- talk to the host page (the message contract) ---------------- */
  const EMBED = window.parent && window.parent !== window;
  function tell(msg) {
    if (!EMBED) return;
    const out = Object.assign({ v: 1 }, msg);
    try { window.parent.postMessage(out, location.origin === "null" ? "*" : location.origin); } catch (e) { /* ignore */ }
  }

  /* ---------------- read aloud ---------------- */
  let voiceOn = false;
  function speak(text, lang) {
    if (!voiceOn || !("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, " "));
      u.lang = lang || "en-GB";
      u.rate = 0.92;
      speechSynthesis.speak(u);
    } catch (e) { /* no voice */ }
  }

  /* ---------------- the app ---------------- */
  function start(def) {
    const G = Object.assign({
      praise: ["Yes!", "That's it.", "Exactly.", "Well spotted."],
      finale: "You finished the whole lesson!",
      coach: "🦉",
      band: "g35",
    }, def);
    const BAND = { k2: { target: 72, rounds: 4 }, g35: { target: 56, rounds: 6 }, g68: { target: 48, rounds: 7 }, g912: { target: 44, rounds: 8 } }[G.band] || { target: 56, rounds: 6 };
    document.documentElement.style.setProperty("--fk-target", BAND.target + "px");

    const totalRounds = G.levels.reduce((a, l) => a + l.rounds, 0);
    const st = {
      screen: "home", li: 0, ri: 0, stars: 0, firstTry: 0, tries: 0, done: 0,
      streak: 0, best: 0, mistakes: {}, running: false, timers: [],
    };
    if (G.rtl) document.body.classList.add("rtl");

    /* the skeleton */
    const app = h("div", { class: "fk-app" });
    const bar = h("div", { class: "fk-bar" });
    const screens = { home: h("section", { class: "fk-screen on", id: "fk-home" }), learn: h("section", { class: "fk-screen", id: "fk-learn" }), play: h("section", { class: "fk-screen", id: "fk-play" }), end: h("section", { class: "fk-screen", id: "fk-end" }) };
    app.append(bar, screens.home, screens.learn, screens.play, screens.end);
    document.body.append(app);

    const barBits = {
      emoji: h("span", { class: "fk-emoji", text: G.emoji || "🎮" }),
      title: h("div", {}, [h("div", { class: "fk-title", text: G.title }), h("div", { class: "fk-topic", text: G.topic || "" })]),
      grow: h("span", { class: "fk-grow" }),
      dots: h("span", { class: "fk-dots" }),
      count: h("span", { class: "fk-count" }),
      voice: h("button", { class: "fk-icobtn", type: "button", title: "Read it aloud", "aria-label": "Read it aloud", text: "🔊" }),
      home: h("button", { class: "fk-icobtn", type: "button", title: "Back to the start", "aria-label": "Back to the start", text: "⌂" }),
      close: h("button", { class: "fk-icobtn", type: "button", title: "Close", "aria-label": "Close", text: "✕" }),
    };
    bar.append(barBits.emoji, barBits.title, barBits.grow, barBits.dots, barBits.count, barBits.voice, barBits.home, barBits.close);
    barBits.voice.addEventListener("click", () => {
      voiceOn = !voiceOn;
      barBits.voice.classList.toggle("hot", voiceOn);
      barBits.voice.textContent = voiceOn ? "🔊" : "🔈";
      if (voiceOn) speak(currentSpeech());
      else if ("speechSynthesis" in window) speechSynthesis.cancel();
    });
    barBits.home.addEventListener("click", () => goHome());
    barBits.close.addEventListener("click", () => {
      tell({ type: "lesson:close", id: G.id });
      if (EMBED) window.parent.postMessage({ type: "lesson:close", v: 1, id: G.id }, "*");
      else goHome();
    });

    function currentSpeech() {
      const c = screens.play.querySelector(".fk-say");
      return c ? c.textContent : "";
    }
    function show(which) {
      Object.entries(screens).forEach(([k, n]) => n.classList.toggle("on", k === which));
      st.screen = which;
      window.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
    }
    function barPlay(on) {
      barBits.dots.style.display = on ? "" : "none";
      barBits.count.style.display = on ? "" : "none";
    }
    barPlay(false);

    /* ---------------- home ---------------- */
    function goHome() {
      clearTimers();
      st.running = false;
      barPlay(false);
      const lv = screens.home.querySelector(".fk-levels");
      if (lv) paintLevelCards();
      show("home");
      speak(G.welcome || G.topic || G.title);
    }
    function paintLevelCards() {
      const wrap = screens.home.querySelector(".fk-levels");
      if (!wrap) return;
      wrap.innerHTML = "";
      G.levels.forEach((l, i) => {
        const b = bestOf(G.id, i);
        const card = h("button", { class: "fk-lv", type: "button" });
        card.innerHTML = `
          <span class="fk-lv-top"><span>${l.icon || "◆"}</span><span>${escapeHtml(l.name)}</span><em>level ${i + 1}</em></span>
          <span class="fk-lv-blurb">${escapeHtml(l.blurb || "")}</span>
          <span class="fk-lv-stars" aria-label="${b} of 3 stars">${"★".repeat(b)}${"☆".repeat(3 - b)}</span>`;
        card.addEventListener("click", () => startLevel(i));
        wrap.append(card);
      });
    }
    function escapeHtml(t) {
      return String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    }

    function buildHome() {
      const hero = h("div", { class: "fk-hero" });
      if (G.world) { try { G.world(hero); } catch (e) { /* a broken world must not break the game */ } }
      const head = h("div", { class: "fk-home-h" });
      head.innerHTML = `<div>
        <h1>${G.emoji || "🎮"} ${escapeHtml(G.title)}</h1>
        <p>${escapeHtml(G.topic || "")}${G.grade ? " · " + escapeHtml(G.grade) : ""}</p></div>`;
      screens.home.append(hero, h("div", { class: "fk-card", style: "margin-top:14px" }), );
      const card = screens.home.querySelector(".fk-card");
      card.append(head);
      if (G.how) {
        const how = h("div", { class: "fk-how" });
        how.innerHTML = "<b>How it works</b><ol>" + (G.how.steps || []).map((x) => `<li>${x}</li>`).join("") + "</ol>";
        card.append(how);
    }
      const levels = h("div", { class: "fk-levels" });
      card.append(levels);
      const row = h("div", { class: "fk-btnrow" });
      if (G.learn && G.learn.length) {
        const lb = h("button", { class: "fk-btn warm", type: "button", text: "🎓 Learn first" });
        lb.addEventListener("click", () => startLearn());
        row.append(lb);
      }
      const first = h("button", { class: "fk-btn", type: "button", text: "▶ Play level 1" });
      first.addEventListener("click", () => startLevel(0));
      row.append(first);
      card.append(row);
      paintLevelCards();
    }

    /* ---------------- Learn ---------------- */
    const learn = { i: 0, unlocked: false, ok: false };
    function startLearn() {
      learn.i = 0; learn.ok = false;
      show("learn");
      paintLearn();
    }
    function paintLearn() {
      const wrap = screens.learn;
      wrap.innerHTML = "";
      const slide = G.learn[learn.i];
      const card = h("div", { class: "fk-card fk-learn" });
      const body = h("div", { class: "fk-slide-body" });
      const prog = h("div", { class: "fk-prog" });
      prog.innerHTML = `<i style="width:${(learn.i / G.learn.length) * 100}%"></i>`;
      card.append(h("div", { class: "fk-tip", text: `Learn · ${learn.i + 1} of ${G.learn.length}` }), prog, body);
      const nav = h("div", { class: "fk-learn-nav" });
      const back = h("button", { class: "fk-btn ghost", type: "button", text: "← Back" });
      back.addEventListener("click", () => { if (learn.i > 0) { learn.i--; learn.ok = false; paintLearn(); } else goHome(); });
      const skip = h("button", { class: "fk-btn ghost", type: "button", text: "Skip to the game" });
      skip.addEventListener("click", () => startLevel(0));
      const next = h("button", { class: "fk-btn", type: "button", text: learn.i === G.learn.length - 1 ? "Play ▶" : "Next →" });
      next.addEventListener("click", () => {
        if (slide.wait && !learn.ok) { say(screens.learn, "Try it first — then we move on.", "hint"); return; }
        if (learn.i < G.learn.length - 1) { learn.i++; learn.ok = false; paintLearn(); }
        else startLevel(0);
      });
      nav.append(back, h("span", { class: "fk-grow" }), skip, next);
      card.append(nav);
      wrap.append(card);
      /* one coach bubble holds the slide's line; a drawing follows it */
      const c = h("div", { class: "fk-coach" });
      c.innerHTML = `<span class="fk-face">${G.coach || "🦉"}</span><span class="fk-say">${slide.say || ""}</span>`;
      if (slide.say) body.append(c);
      const L = {
        ok(msg) {
          learn.ok = true;
          if (msg) c.className = "fk-coach good", c.innerHTML = `<span class="fk-face">🎉</span><span class="fk-say">${msg}</span>`;
          sfx.right();
          next.classList.remove("ghost");
          next.focus();
        },
        say(msg, mood) {
          c.className = "fk-coach " + (mood || "");
          c.innerHTML = `<span class="fk-face">${G.coach || "🦉"}</span><span class="fk-say">${msg}</span>`;
          speak(String(msg).replace(/<[^>]+>/g, " "));
        },
        h,
      };
      if (slide.draw) { try { slide.draw(body, L); } catch (e) { body.append(h("p", { text: "…" })); } }
      if (slide.wait) next.classList.add("ghost");
      speak(slide.say || "");
    }
    function say(scope, html, mood) {
      const c = scope.querySelector(".fk-coach");
      if (!c) return;
      c.className = "fk-coach " + (mood || "");
      c.innerHTML = `<span class="fk-face">${mood === "good" ? "🎉" : mood === "bad" ? (G.coach || "🦉") : (G.coach || "🦉")}</span><span class="fk-say">${html}</span>`;
      speak(String(html).replace(/<[^>]+>/g, " "));
    }

    /* ---------------- play ---------------- */
    function clearTimers() {
      st.timers.forEach((t) => clearTimeout(t));
      st.timers = [];
    }
    function startLevel(i) {
      st.li = i; st.ri = 0; st.firstTry = 0; st.tries = 0; st.mistakes = {};
      st.running = true;
      barPlay(true);
      show("play");
      tell({ type: "lesson:progress", id: G.id, stars: st.stars, streak: st.streak, done: st.done, total: totalRounds });
      round();
    }
    function paintBar() {
      const n = G.levels[st.li].rounds;
      barBits.dots.innerHTML = Array.from({ length: n }, (_, k) => `<i class="${k < st.ri ? "on" : ""}"></i>`).join("");
      barBits.count.innerHTML = `<b>${st.stars}</b> ★`;
    }
    let R = null;

    function round() {
      clearTimers();
      const li = st.li, ri = st.ri;
      const level = G.levels[li];
      const wrap = screens.play;
      wrap.innerHTML = "";
      const card = h("div", { class: "fk-card" });
      const stage = h("div", { class: "fk-stage" });
      const coach = h("div", { class: "fk-coach", "aria-live": "polite" });
      const tools = h("div", { class: "fk-tools" });
      const hintBtn = h("button", { class: "fk-tool", type: "button", text: "💡 Hint" });
      const showBtn = h("button", { class: "fk-tool", type: "button", text: "👀 Show me" });
      const nextBtn = h("button", { class: "fk-btn good", type: "button", text: "Next ▸" });
      nextBtn.style.display = "none";
      tools.append(hintBtn, showBtn);
      card.append(h("div", { class: "fk-tip", text: `${level.icon || "◆"} ${level.name} · round ${ri + 1} of ${level.rounds}` }), stage, tools, nextBtn, coach);
      wrap.append(card);
      paintBar();

      const ctx = {
        el: stage, level: li, index: ri, rounds: level.rounds, hints: [], ease: 0,
        done: false, tries: 0, answer: null, whyLines: [],
        say(text, mood) { coach.className = "fk-coach " + (mood || ""); coach.innerHTML = `<span class="fk-face">${G.coach || "🦉"}</span><span class="fk-say">${text}</span>`; speak(String(text).replace(/<[^>]+>/g, " ")); },
        right(opts) {
          if (ctx.done) return;
          ctx.done = true;
          st.done += 1;
          st.streak += 1;
          if (ctx.tries === 0) { st.firstTry += 1; st.stars += 1; }
          st.best = Math.max(st.best, st.streak);
          sfx.right();
          burst();
          ctx.say(pick(G.praise) + (ctx.tries === 0 ? "" : " (with a nudge)"), "good");
          if (st.streak === 3 || st.streak === 5 || st.streak === 10) {
            sfx.streak();
            const b = h("div", { class: "fk-streak", text: `🔥 ${st.streak} in a row!` });
            document.body.append(b);
            st.timers.push(setTimeout(() => b.remove(), 1600));
          }
          paintBar();
          tell({ type: "lesson:progress", id: G.id, stars: st.stars, streak: st.streak, done: st.done, total: totalRounds });
          const wait = opts && opts.wait === "button";
          if (wait) { nextBtn.style.display = ""; nextBtn.focus(); }
          else st.timers.push(setTimeout(afterRound, 950));
        },
        wrong(why, opts) {
          if (ctx.done) return;
          ctx.tries += 1;
          st.tries += 1;
          st.streak = 0;
          const cat = (opts && opts.cat) || "other";
          st.mistakes[cat] = (st.mistakes[cat] || 0) + 1;
          sfx.wrong();
          if (opts && opts.at && !reduced()) { opts.at.classList.remove("fk-shake"); void opts.at.offsetWidth; opts.at.classList.add("fk-shake"); }
          ctx.say(why || "Not quite — look again.", "bad");
          if (ctx.tries >= 2) showBtn.classList.add("hot");
          if ((opts && opts.hint) || st.tries >= 5) hintBtn.classList.add("hot");
        },
        later(fn, ms) { const t = setTimeout(fn, ms); st.timers.push(t); return t; },
        every(fn, ms) { const t = setInterval(fn, ms); st.timers.push(t); return t; },
        on(fn) { st.timers.push(0); return fn; },
        sfx, fx: { burst, shake: (n) => { if (n && !reduced()) { n.classList.remove("fk-shake"); void n.offsetWidth; n.classList.add("fk-shake"); } }, pop: burst },
        speak,
      };
      R = ctx;
      try { level.round(ctx, ri); } catch (e) {
        ctx.el.append(h("p", { text: "This round could not be drawn." }));
      }
      hintBtn.addEventListener("click", () => {
        const hints = ctx.hints || [];
        if (!hints.length) { ctx.say("No hint on this one — you have everything you need.", "hint"); return; }
        const i = Math.min(ctx.hintIndex || 0, hints.length - 1);
        ctx.hintIndex = i + 1;
        ctx.say(hints[i], "hint");
        if (i >= hints.length - 1) hintBtn.disabled = true;
      });
      showBtn.addEventListener("click", () => {
        if (ctx.done) return;
        ctx.done = true;
        st.done += 1;
        if (ctx.solve) { try { ctx.solve(ctx); } catch (e) { /* ignore */ } }
        else if (ctx.answer != null) ctx.say(`The answer is <b>${ctx.answer}</b>.`, "hint");
        ctx.say(`Here it is — you have learnt this one. <b>${Array.isArray(ctx.answer) ? ctx.answer.join(", ") : ctx.answer}</b>`, "hint");
        paintBar();
        st.timers.push(setTimeout(afterRound, 1600));
      });
      nextBtn.addEventListener("click", () => afterRound());
      if (!coach.textContent) ctx.say(level.blurb || "Your turn.");
    }
    function afterRound() {
      st.ri += 1;
      if (st.ri < G.levels[st.li].rounds) return round();
      /* level finished */
      const stars = Math.max(1, Math.round((st.firstTry / G.levels[st.li].rounds) * 3));
      saveBest(G.id, st.li, stars);
      const list = Object.entries(st.mistakes).map(([detail, n]) => ({ detail, n }));
      tell({ type: "lesson:level", id: G.id, level: st.li, stars });
      if (list.length) tell({ type: "lesson:mistakes", id: G.id, level: st.li, list });
      levelCard(stars, list);
    }
    function levelCard(stars, list) {
      clearTimers();
      barPlay(false);
      const more = st.li + 1 < G.levels.length;
      const wrap = screens.end;
      wrap.innerHTML = "";
      const card = h("div", { class: "fk-card fk-card-big" });
      card.innerHTML = `
        <div class="fk-stars">${"★".repeat(stars)}<span class="off">${"★".repeat(3 - stars)}</span></div>
        <h2>${more ? "Level " + (st.li + 1) + " done" : "Last level done!"}</h2>
        <p>${escapeHtml(G.levels[st.li].name)} · ${st.firstTry} of ${G.levels[st.li].rounds} first try</p>
        <div class="fk-metric">
          <div><b>${st.stars}</b>stars so far</div>
          <div><b>${st.best}</b>best streak</div>
          <div><b>${st.done}/${totalRounds}</b>rounds</div>
        </div>`;
      const row = h("div", { class: "fk-btnrow", style: "justify-content:center" });
      if (more) {
        const nb = h("button", { class: "fk-btn good", type: "button", text: `Level ${st.li + 2}: ${G.levels[st.li + 1].name} →` });
        nb.addEventListener("click", () => startLevel(st.li + 1));
        row.append(nb);
      } else {
        const fb = h("button", { class: "fk-btn good", type: "button", text: "See the trophy 🏆" });
        fb.addEventListener("click", () => finale());
        row.append(fb);
      }
      const again = h("button", { class: "fk-btn ghost", type: "button", text: "Replay this level" });
      again.addEventListener("click", () => startLevel(st.li));
      row.append(again);
      card.append(row);
      wrap.append(card);
      sfx.level();
      show("end");
    }
    function finale() {
      const wrap = screens.end;
      wrap.innerHTML = "";
      const card = h("div", { class: "fk-card fk-card-big" });
      const pct = Math.round((st.done / totalRounds) * 100);
      const mastered = pct >= 70;
      card.innerHTML = `
        <div class="fk-trophy">${mastered ? "🏆" : "🎖️"}</div>
        <h2>${escapeHtml(G.finale || "You finished!")}</h2>
        <p>${mastered ? "Mastered — that is 70% or better." : "Good effort. Play it again to lock it in."}</p>
        <div class="fk-metric">
          <div><b>${st.stars}/${totalRounds}</b>stars</div>
          <div><b>${pct}%</b>first try</div>
          <div><b>${st.best}</b>best streak</div>
        </div>`;
      const row = h("div", { class: "fk-btnrow", style: "justify-content:center" });
      const again = h("button", { class: "fk-btn", type: "button", text: "Play again ↺" });
      again.addEventListener("click", () => { st.stars = 0; st.done = 0; st.streak = 0; st.best = 0; startLevel(0); });
      const home = h("button", { class: "fk-btn ghost", type: "button", text: "Back to the levels" });
      home.addEventListener("click", () => goHome());
      row.append(again, home);
      card.append(row);
      wrap.append(card);
      tell({ type: "lesson:done", id: G.id, score: st.stars, total: totalRounds });
      show("end");
      sfx.level();
    }

    function burst() {
      if (reduced()) return;
      const n = 12;
      for (let i = 0; i < n; i++) {
        const d = h("div", { class: "fk-burst" });
        const colours = ["#6f5bf0", "#ffb020", "#15803d", "#22b8cf", "#e0502e"];
        d.style.background = colours[i % colours.length];
        d.style.left = 50 + rint(-16, 16) + "vw";
        d.style.top = 46 + rint(-8, 8) + "vh";
        document.body.append(d);
        const dx = rint(-70, 70), dy = rint(-90, -30);
        d.animate([{ transform: "none", opacity: 1 }, { transform: `translate(${dx}px,${dy}px) scale(.3)`, opacity: 0 }],
          { duration: 760 + rint(0, 260), easing: "cubic-bezier(.2,.7,.3,1)" });
        setTimeout(() => d.remove(), 1100);
      }
    }

    /* ---------------- UI primitives (every one sets R.answer and R.submit) ---------------- */
    const ui = {
      choice(R, o) {
        R.answer = o.answer;
        if (o.hint) R.hints = [].concat(o.hint, R.hints || []);
        if (o.art) R.el.append(o.art());
        if (o.prompt) R.el.append(h("h2", { class: "fk-prompt", html: o.prompt }));
        if (o.sub) R.el.append(h("p", { class: "fk-sub", html: o.sub }));
        const wrap = h("div", { class: "fk-opts" });
        /* an option may be a picture: {key:'a', html:'<svg…>'} — the key decides right and wrong */
        const keyOf = (v) => (v && typeof v === "object" && "key" in v ? v.key : v);
        const htmlOf = (v) => (v && typeof v === "object" ? v.html : String(v));
        const opts = shuffle(o.options.slice());
        opts.forEach((v) => {
          const b = h("button", { class: "fk-opt", type: "button", html: htmlOf(v), "data-key": String(keyOf(v)) });
          b.addEventListener("click", () => submit(v, b));
          wrap.append(b);
        });
        R.el.append(wrap);
        function submit(v, node) {
          if (R.done) return;
          if (norm(keyOf(v)) === norm(o.answer)) { if (node) node.classList.add("ok"); R.right(); }
          else {
            if (node) node.classList.add("no");
            R.wrong(typeof o.why === "function" ? o.why(v) : (o.why || "Not that one — read it again."), { at: node, cat: o.cat });
          }
        }
        R.submit = submit;
        R.wrongValue = () => keyOf(opts.find((v) => norm(keyOf(v)) !== norm(o.answer)) || "?");
        R.solve = () => { R.el.querySelectorAll(".fk-opt").forEach((b) => { if (norm(b.getAttribute("data-key")) === norm(o.answer)) b.classList.add("ok"); }); };
      },

      tiles(R, o) {
        R.answer = o.answer;
        R.el.append(h("h2", { class: "fk-prompt", html: o.prompt }));
        if (o.sub) R.el.append(h("p", { class: "fk-sub", html: o.sub }));
        const wrap = h("div", { class: "fk-tiles" });
        const chosen = new Set();
        const nodes = new Map();
        o.tiles.forEach((t) => {
          const b = h("button", { class: "fk-tile", type: "button", html: String(t.label) });
          b.addEventListener("click", () => {
            const key = String(t.label);
            if (chosen.has(key)) { chosen.delete(key); b.classList.remove("on"); }
            else { chosen.add(key); b.classList.add("on"); }
            sfx.tap();
            if (o.instant) check();
          });
          nodes.set(String(t.label), b);
          wrap.append(b);
        });
        R.el.append(wrap);
        const wantAll = o.need !== "any";
        function check() {
          if (R.done) return;
          const need = o.answer.map(String);
          const missing = need.filter((a) => !chosen.has(a));
          const extra = [...chosen].filter((a) => !need.includes(a));
          if (wantAll ? (!missing.length && !extra.length) : chosen.size > 0 && !missing.length) { chosen.forEach((k) => nodes.get(k) && nodes.get(k).classList.add("ok")); R.right(); }
          else {
            extra.forEach((k) => { const n = nodes.get(k); if (n) { n.classList.add("no"); R.wrong(typeof o.why === "function" ? o.why(k) : (o.why || "One of those is not needed."), { at: n, cat: o.cat }); } });
            if (!extra.length && missing.length) R.wrong(o.missWhy || `You have ${need.length - missing.length} of ${need.length} — one more.`, { cat: o.cat });
          }
        }
        R.submit = (v) => {
          chosen.clear();
          [].concat(v).forEach((k) => chosen.add(String(k)));
          check();
        };
        R.wrongValue = () => [o.answer[0] === undefined ? "nope" : (o.tiles.find((t) => String(t.label) !== String(o.answer[0])) || {}).label];
        R.solve = () => { o.answer.forEach((k) => nodes.get(String(k)) && nodes.get(String(k)).classList.add("ok")); };
        if (o.check !== false) {
          const c = h("button", { class: "fk-btn", type: "button", text: o.checkLabel || "Check ✓" });
          c.addEventListener("click", check);
          R.el.append(h("div", { class: "fk-btnrow" }, [c]));
        }
      },

      keypad(R, o) {
        R.answer = o.answer;
        R.el.append(h("h2", { class: "fk-prompt", html: o.prompt }));
        if (o.sub) R.el.append(h("p", { class: "fk-sub", html: o.sub }));
        if (o.art) R.el.append(o.art());
        const row = h("div", { class: "fk-btnrow", style: "align-items:center" });
        const entry = h("div", { class: "fk-entry", "aria-live": "polite", text: "" });
        row.append(entry);
        const pad = h("div", { class: "fk-keypad" });
        let buf = "";
        const paint = () => { entry.textContent = buf; entry.classList.toggle("filled", !!buf); };
        const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", o.neg ? "±" : "0", "0", "⌫", "✓"];
        keys.forEach((k, i) => {
          if (i === 9 && !o.neg) return;
          const b = h("button", { class: "fk-key" + (k === "✓" ? " enter" : ""), type: "button", text: k, "aria-label": k === "✓" ? "submit" : k });
          b.addEventListener("click", () => {
            sfx.tap();
            if (k === "⌫") buf = buf.slice(0, -1);
            else if (k === "±") buf = buf.startsWith("-") ? buf.slice(1) : "-" + buf;
            else if (k === "✓") return check();
            else if (buf.length < (o.max || 5)) buf += k;
            paint();
          });
          pad.append(b);
        });
        R.el.append(row, pad);
        function check() {
          if (R.done || buf === "") return;
          const v = o.decimal ? parseFloat(buf) : parseInt(buf, 10);
          submit(v);
          if (!R.done) { buf = ""; paint(); }
        }
        function submit(v) {
          if (R.done) return;
          const ok = o.tol != null ? Math.abs(v - o.answer) <= o.tol : String(v) === String(o.answer);
          if (ok) R.right();
          else R.wrong(typeof o.why === "function" ? o.why(v) : (o.why || "Not that number — work it out step by step."), { at: entry, cat: o.cat });
        }
        R.submit = submit;
        R.wrongValue = () => (typeof o.answer === "number" ? o.answer + (o.answer === 0 ? 1 : 1) : "x");
        R.solve = () => { buf = String(o.answer); paint(); };
      },

      sliders(R, o) {
        R.answer = o.answer;
        R.el.append(h("h2", { class: "fk-prompt", html: o.prompt }));
        if (o.sub) R.el.append(h("p", { class: "fk-sub", html: o.sub }));
        if (o.art) R.el.append(o.art(R));
        const wrap = h("div", { class: "fk-sliders" });
        const vals = o.controls.map((c) => c.value);
        o.controls.forEach((c, i) => {
          const lab = h("label", { class: "fk-sl" });
          lab.innerHTML = `<span>${c.label}</span>`;
          const inp = h("input", { type: "range", min: c.min, max: c.max, step: c.step || 1, value: String(c.value), "aria-label": c.label });
          const out = h("b", { text: String(c.value) });
          inp.addEventListener("input", () => { vals[i] = Number(inp.value); out.textContent = String(inp.value); if (o.onInput) o.onInput(vals, R); });
          lab.append(inp, out);
          wrap.append(lab);
        });
        R.el.append(wrap);
        const check = h("button", { class: "fk-btn", type: "button", text: "Lock it in ✓" });
        check.addEventListener("click", () => { if (R.done) return; const ok = o.test(vals); if (ok) R.right(); else R.wrong(typeof o.why === "function" ? o.why(vals) : (o.why || "Not matching yet — look at the whole picture."), { cat: o.cat }); });
        R.el.append(h("div", { class: "fk-btnrow" }, [check]));
        R.submit = (v) => { const target = Array.isArray(v) ? v : [v]; if (o.test(target)) R.right(); else R.wrong(o.why || "Not matching yet.", { cat: o.cat }); };
        R.wrongValue = () => (o.controls[0].value === o.answer[0] ? [o.answer[0] + 1].concat(o.answer.slice(1)) : [o.controls[0].value].concat(o.answer.slice(1)));
        R.solve = () => { R.say(`The matching values are <b>${[].concat(o.answer).join(" and ")}</b>.`, "hint"); };
      },
    };
    const norm = (v) => String(v).replace(/<[^>]+>/g, "").replace(/[\s,]/g, "").replace(/−/g, "-").toLowerCase();

    /* ---------------- build + boot ---------------- */
    /* the kit's helpers exist before the world is drawn */
    window.LK = window.LK || {};
    window.LK.ui = ui;
    window.LK.h = h;
    window.LK.s = s;
    window.LK.rint = rint;
    window.LK.pick = pick;
    window.LK.shuffle = shuffle;
    window.LK.fmt = fmt;
    window.LK.speak = speak;
    window.LK.state = st;
    window.LK.game = G;
    buildHome();
    tell({ type: "lesson:ready", id: G.id, total: G.levels.reduce((n, l) => n + (l.rounds || 0), 0) });
    document.title = (G.emoji ? G.emoji + " " : "") + G.title;

    window.LK.test = {
      state: () => ({ screen: st.screen, level: st.li, index: st.ri, rounds: G.levels[st.li] ? G.levels[st.li].rounds : 0, stars: st.stars, done: st.done, streak: st.streak, firstTry: st.firstTry, tries: st.tries, mistakes: Object.assign({}, st.mistakes), answer: R ? R.answer : null, id: G.id }),
      pass: () => { if (!R || R.done) return false; if (!R.submit) return false; R.submit(R.answer); return true; },
      fail: () => { if (!R || R.done) return false; if (!R.submit) return false; R.submit(R.wrongValue()); return true; },
      show: () => { const b = screens.play.querySelector(".fk-tool.hot"); if (b) b.click(); return !!b; },
      next: () => { const b = [...screens.play.querySelectorAll(".fk-btn")].find((x) => x.style.display !== "none"); if (b) { b.click(); return true; } return false; },
      level: (i) => startLevel(i),
      card: () => { const b = screens.end.querySelector(".fk-btn"); if (b) { b.click(); return true; } return false; },
      learn: () => startLearn(),
      skipLearn: () => startLevel(0),
    };
  }

  function svg(w, hgt, label) {
    const n = s("svg", { viewBox: `0 0 ${w} ${hgt}`, class: "fk-art", role: "img", "aria-label": label || "" });
    n.style.width = "100%";
    n.style.maxWidth = w + "px";
    n.style.display = "block";
    return n;
  }
  window.LK = { start, speak, h, s, svg, rint, pick, shuffle, fmt, clamp, ui: null };
})();

/* ═══════════════════════════════════════════════════════════════════════════════════════════════════
   KIT SKIN — the DOM half of kit-skin.css (the FIKR dashboard lesson-kit look).
   1. the world: the game's own hero picture fills the screen behind everything (.ks-world);
   2. the home screen: the picture on one side, a side panel with the title, the objective and the
      level path on the other (.home.ks > .hero + .ks-side);
   3. the guide bar on the home screen gets the kit's two actions: "How to play" and the next step
      ("Start with Learn ▸", or the first level that has no star yet).
   Runs after G1THEME.start (which paints the hero). Never throws into the game.
   ═══════════════════════════════════════════════════════════════════════════════════════════════════ */
const KITSKIN = (() => {
  const g = () => (typeof GAME !== 'undefined' && GAME) || {};
  const ar = () => g().lang === 'ar';
  const WORDS = {
    how: ['? How to play', '؟ كيف نلعب'],
    learn: ['🎓 Start with Learn ▸', '🎓 نبدأ بالتعلّم ▸'],
    play: ['▶ Play', '▶ نلعب'],
    again: ['↻ Play again', '↻ نلعب مرة أخرى'],
  };
  const w = (k) => WORDS[k][ar() ? 1 : 0];

  function world() {
    if (document.querySelector('.ks-world') || typeof G1HERO === 'undefined') return;
    const art = G1HERO.for(g().id) || '';
    if (!art) return;
    const el = document.createElement('div');
    el.className = 'ks-world';
    el.setAttribute('aria-hidden', 'true');
    /* one picture, a second copy: strip its label so the world is decoration only */
    el.innerHTML = art.replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" focusable="false" ')
      .replace(/ role="img"/, '').replace(/ aria-label="[^"]*"/, '');
    /* gradient ids are document-wide: rename the world's so the home picture keeps its own */
    el.innerHTML = el.innerHTML.replace(/id="([^"]+)"/g, 'id="ksw-$1"').replace(/url\(#([^)]+)\)/g, 'url(#ksw-$1)');
    document.body.prepend(el);
  }

  /* a game with no authored place shows its model instead, as the kit's home does: the first Learn
     slide that only draws (no answer to wait for) is drawn into the picture panel */
  function modelInto(hero) {
    const game = g();
    if (typeof G1HERO !== 'undefined' && G1HERO.has && G1HERO.has(game.id)) return;
    if (hero.classList.contains('ks-model') || hero.classList.contains('ks-tile')) return;
    const slide = (game.learn || []).find((sl) => sl && sl.draw && !sl.wait);
    if (slide) {
      try {
        const box = document.createElement('div');
        slide.draw(box, { ok() {} });
        const art = box.querySelector('svg');
        if (art) {
          /* scale it to the panel: keep its own frame, or make one from its size */
          const w = parseFloat(art.getAttribute('width')), h = parseFloat(art.getAttribute('height'));
          if (!art.getAttribute('viewBox') && w && h) art.setAttribute('viewBox', `0 0 ${w} ${h}`);
          art.removeAttribute('width'); art.removeAttribute('height');
          art.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          hero.innerHTML = '';
          hero.append(art);
          hero.classList.add('ks-model');
          return;
        }
      } catch (e) { /* fall through to the tile */ }
    }
    const tile = document.createElement('span');
    tile.className = 'ks-hero-tile';
    tile.textContent = game.emoji || '🎯';
    hero.append(tile);
    hero.classList.add('ks-tile');
  }

  /* an icon the icon set cannot draw is left empty; the kit shows the emoji itself */
  function fillIcons(cards) {
    const game = g();
    cards.forEach((c, i) => {
      const ic = c.querySelector('.ic');
      /* drawn by CSS from the attribute: text inside .ic would be emptied again by the icon set */
      if (ic && !ic.querySelector('svg') && !ic.textContent.trim() && !ic.dataset.ksEmoji) {
        ic.dataset.ksEmoji = i === 0 ? '🎓' : ((game.levels || [])[i - 1] || {}).icon || String(i);
      }
    });
  }

  function act(label, quiet, onclick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ks-act' + (quiet ? ' quiet' : '');
    b.textContent = label;
    b.addEventListener('click', onclick);
    return b;
  }

  function stars(card) {
    const st = card.querySelector('.st');
    return st ? (st.textContent.match(/★/g) || []).length : -1;
  }

  function homeLayout() {
    const stage = document.getElementById('stage');
    const home = document.querySelector('#stage .home');
    if (stage) stage.classList.toggle('ks-home', !!home);
    if (!home) return;
    const hero = home.querySelector(':scope > .hero');
    if (!hero) return; /* wait for G1THEME to paint the picture */
    if (!home.classList.contains('ks')) {
      home.classList.add('ks');
      modelInto(hero);
      /* the picture fills its panel, ground kept at the bottom */
      const art = hero.querySelector('svg');
      if (art) art.setAttribute('preserveAspectRatio', 'xMidYMax slice');
      const side = document.createElement('div');
      side.className = 'ks-side';
      [...home.children].forEach((c) => { if (c !== hero && !c.classList.contains('lesson-shell')) side.append(c); });
      hero.after(side);
    }
    /* the path: which steps are done, which one is next */
    const cards = [...home.querySelectorAll('.ks-side .card')];
    fillIcons(cards);
    const levels = cards.filter((c) => stars(c) >= 0);
    const played = levels.some((c) => stars(c) > 0);
    let next = played ? levels.find((c) => stars(c) === 0) : cards[0];
    cards.forEach((c) => {
      c.classList.toggle('ks-done', stars(c) > 0);
      c.classList.toggle('ks-next', c === next);
    });
    /* the guide bar's two actions (the engine leaves them empty on the home screen) */
    const tools = document.getElementById('coach-tools');
    if (tools && !tools.children.length) {
      const help = document.getElementById('b-help');
      if (help) tools.append(act(w('how'), true, () => help.click()));
      const target = next || levels[0] || cards[0];
      if (target) {
        const label = target === cards[0] ? w('learn') : !next ? w('again') : `${w('play')} ${(target.querySelector('b') || {}).textContent || ''} ▸`;
        tools.append(act(label, false, () => target.click()));
      }
    }
  }

  function start() {
    world();
    homeLayout();
    const stage = document.getElementById('stage');
    const coach = document.getElementById('coach-tools');
    const obs = new MutationObserver(() => { try { homeLayout(); } catch (e) { /* never break the game */ } });
    if (stage) obs.observe(stage, { childList: true, subtree: true });
    if (coach) obs.observe(coach, { childList: true });
    setTimeout(homeLayout, 60);
    setTimeout(homeLayout, 450);
  }
  return { start };
})();

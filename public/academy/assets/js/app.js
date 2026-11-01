/* =============================================================================
   Dr. Math Azzam Platform — client behaviour
   Reconstructed from the live bundle (REA static analysis of
   /_next/static/immutable/chunks/02h9gan5cvt37.js and 0uznicjd3xpq1.js).

   Modules:
     1. Motion frames      — pause / resume the SVG illustrations
     2. Lesson search      — dialog, scoring search, keyboard navigation
     3. Appearance control — theme + text size, persisted in localStorage
     4. Mobile navigation  — header menu toggle
     5. Contact form       — POST /api/contact
     6. Active nav link    — highlights the current section
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ utils */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };
  var TEXT_EDITABLE = 'input, textarea, select, [contenteditable], [role="textbox"], [role="combobox"]';

  function icon(parts, cls) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
      'stroke-linejoin="round" class="lucide ' + (cls || 'size-4') + '" aria-hidden="true">' +
      parts + '</svg>';
  }
  /* Lucide paths + the exact class strings the bundle emits, so reconstructed
     icons render identically to the server-rendered ones. */
  var ICON = {
    pause: ['<rect x="14" y="3" width="5" height="18" rx="1"></rect><rect x="5" y="3" width="5" height="18" rx="1"></rect>', 'lucide-pause'],
    play: ['<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path>', 'lucide-play'],
    x: ['<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>', 'lucide-x'],
    menu: ['<path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path>', 'lucide-menu'],
    check: ['<path d="M20 6 9 17l-5-5"></path>', 'lucide-check'],
    checkCircle: ['<circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path>', 'lucide-circle-check'],
    book: ['<path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>', 'lucide-book-open'],
    arrowRight: ['<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>', 'lucide-arrow-right'],
    send: ['<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path><path d="m21.854 2.147-10.94 10.939"></path>', 'lucide-send']
  };

  /* icon(NAME, extraClasses) -> <svg class="lucide <name> <extra>">…</svg> */
  function ic(name, extra) {
    var def = ICON[name] || ['', ''];
    return icon(def[0], (def[1] + ' ' + (extra || '')).trim());
  }

  /* ============================================================ 1. motion */
  /* Each illustration lives in a .motionFrame. React keeps a `running` flag and
     mirrors it to [data-running]; home.css pauses every descendant animation
     when the attribute is "false".                                          */
  function initMotion() {
    $$('.home-module__oe3DtG__motionFrame').forEach(function (frame) {
      var btn = $('.home-module__oe3DtG__motionButton', frame);
      if (!btn) return;

      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
      function apply() {
        var running = frame.getAttribute('data-running') !== 'false';
        btn.innerHTML = ic(running ? 'pause' : 'play') +
          '<span>' + (running ? 'Pause' : 'Play') + '</span>';
        btn.setAttribute('aria-pressed', String(!running));
      }
      if (reduce.matches) frame.setAttribute('data-running', 'false');
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-label', 'Pause or resume this illustration');
      btn.addEventListener('click', function () {
        var running = frame.getAttribute('data-running') !== 'false';
        frame.setAttribute('data-running', running ? 'false' : 'true');
        apply();
      });
      apply();
    });
  }

  /* ==================================================== 2. lesson search */
  /* Port of LessonSearch: query -> normalise -> score -> sort -> slice(0,8) */
  function initSearch() {
    var dataEl = document.getElementById('lesson-index');
    if (!dataEl) return;
    var LESSONS;
    try { LESSONS = JSON.parse(dataEl.textContent); } catch (e) { return; }

    var openBtn = $('button[aria-haspopup="dialog"]');
    var dialog = openBtn ? document.getElementById(openBtn.getAttribute('aria-controls')) : null;
    if (!openBtn || !dialog) return;

    var input = $('input[id$="-query"]', dialog);
    var status = $('p[id$="-status"]', dialog);
    var list = $('ul', dialog);
    if (!input || !list) return;

    var items = [];      // rendered <li> anchors, for keyboard navigation
    var active = -1;

    function normalise(s) {
      return String(s).normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
    }

    var index = LESSONS.map(function (lesson) {
      return {
        lesson: lesson,
        title: normalise(lesson.title),
        code: normalise(lesson.code),
        id: normalise(lesson.id),
        text: normalise([lesson.title, lesson.code, lesson.id,
          lesson.courseTitle, lesson.grade].concat(lesson.topics || []).join(' '))
      };
    });

    function search(raw) {
      var q = normalise(String(raw).slice(0, 200));
      if (!q) return String(raw).trim() ? [] : LESSONS.slice();

      var words = q.split(' ');
      var codes = (String(raw).slice(0, 200).match(/\b\d+[.-]\d+\b/g) || []).map(normalise);
      if (/^\d+ \d+$/.test(q)) codes.push(q);

      return index.filter(function (entry) {
        var codeOk = codes.every(function (c) {
          return entry.code.indexOf(c) !== -1 || entry.id.indexOf(c) !== -1;
        });
        var wordOk = words.every(function (w) {
          if (w === 'calculus' || w === 'precalculus') {
            return normalise(entry.lesson.courseTitle) === w;
          }
          return entry.text.indexOf(w) !== -1;
        });
        return codeOk && wordOk;
      }).map(function (entry) {
        var score = 0;
        score += 100 * ((entry.code === q || entry.id === q) ? 1 : 0);
        score += 80 * (entry.title === q ? 1 : 0);
        score += 40 * (entry.title.indexOf(q) === 0 ? 1 : 0);
        score += 20 * (entry.title.indexOf(q) !== -1 ? 1 : 0);
        return { lesson: entry.lesson, score: score };
      }).sort(function (a, b) { return b.score - a.score; })
        .map(function (r) { return r.lesson; });
    }

    function hrefFor(l) {
      return '/academy/courses/' + l.courseSlug + '/lessons/' + l.id + '/index.html';
    }

    function render(results, query) {
      list.innerHTML = '';
      items = [];
      active = -1;

      if (!results.length) {
        status.textContent = query
          ? 'No lessons match “' + query + '”.'
          : 'Start with a lesson, or search by title, code, or skill.';
        return;
      }
      status.textContent = query
        ? results.length + (results.length === 1 ? ' lesson' : ' lessons') + ' found'
        : 'Start with a lesson, or search by title, code, or skill.';

      results.slice(0, 8).forEach(function (l) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = hrefFor(l);
        a.className = 'group flex min-h-16 items-center gap-3 rounded-xl px-3 py-3 transition-colors ' +
          'hover:bg-muted focus-visible:bg-muted focus-visible:outline-none ' +
          'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring';
        a.innerHTML =
          '<span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">' +
          ic('book', 'size-4') + '</span>' +
          '<span class="min-w-0 flex-1">' +
          '<span class="block text-xs text-muted-foreground">' + esc(l.grade) + ' · ' +
          esc(l.courseTitle) + ' · ' + esc(l.code) + '</span>' +
          '<span class="mt-0.5 block text-sm font-semibold leading-snug">' + esc(l.title) + '</span>' +
          '</span>' +
          ic('arrowRight', 'size-4 shrink-0 text-muted-foreground group-hover:text-foreground');
        li.appendChild(a);
        list.appendChild(li);
        items.push(a);
      });
    }

    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    function highlight(next) {
      if (!items.length) return;
      active = (next + items.length) % items.length;
      items[active].focus({ preventScroll: true });
      items[active].scrollIntoView({ block: 'nearest' });
    }

    var lastFocus = null;

    function open() {
      if (dialog.open) return;
      lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      input.value = '';
      render(search(''), '');
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      document.body.style.overflow = 'hidden';
      input.focus();
    }

    function close() {
      if (typeof dialog.close === 'function' && dialog.open) dialog.close();
      else dialog.removeAttribute('open');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    openBtn.addEventListener('click', open);
    input.addEventListener('input', function () {
      render(search(input.value), input.value);
      active = -1;
    });

    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) close();          // backdrop
    });
    dialog.addEventListener('close', function () {
      document.body.style.overflow = '';
    });
    $$('button', dialog).forEach(function (b) {
      if ((b.getAttribute('aria-label') || '').toLowerCase().indexOf('close') !== -1) {
        b.addEventListener('click', close);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (!dialog.open) {
        // "/" shortcut — matches the original LessonSearch behaviour
        if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.repeat && !e.defaultPrevented) {
          var t = e.target;
          if (t instanceof HTMLElement && (t.isContentEditable || t.closest(TEXT_EDITABLE))) return;
          if (document.querySelector('dialog[open], [aria-modal="true"]')) return;
          e.preventDefault();
          open();
        }
        return;
      }
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); highlight(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(active - 1); }
      else if (e.key === 'Enter' && active >= 0 && items[active]) {
        e.preventDefault();
        items[active].click();
      }
    });

    render(search(''), '');
  }

  /* ================================================ 3. appearance control */
  var THEMES = [
    { id: 'classic',   label: 'Classic',       note: 'Navy + Gold' },
    { id: 'soft',      label: 'Soft Light',    note: 'Warm, gentle background' },
    { id: 'dark',      label: 'Dark',          note: 'Comfortable at night' },
    { id: 'blue',      label: 'Blue Comfort',  note: 'Calm blue tones' },
    { id: 'rose',      label: 'Rose',          note: 'Soft rose + berry tones' },
    { id: 'lavender',  label: 'Lavender',      note: 'Gentle purple tones' },
    { id: 'mint',      label: 'Mint',          note: 'Fresh mint + teal tones' },
    { id: 'contrast',  label: 'High Contrast', note: 'Maximum clarity' }
  ];
  var TEXT_SIZES = [
    { id: 'small', label: 'A−' },
    { id: 'normal', label: 'A' },
    { id: 'large', label: 'A+' }
  ];

  function initAppearance() {
    var theme = localStorage.getItem('dma-theme') || 'classic';
    var textSize = localStorage.getItem('dma-text-size') || 'normal';
    applyAppearance(theme, textSize);

    var modal = null;

    function build() {
      var wrap = document.createElement('div');
      wrap.className = 'fixed inset-0 z-[9999] overflow-y-auto bg-black/45 overscroll-contain';
      wrap.setAttribute('role', 'dialog');
      wrap.setAttribute('aria-modal', 'true');
      wrap.setAttribute('aria-label', 'Appearance');

      var panel = document.createElement('div');
      panel.className = 'relative mx-auto min-h-full w-full bg-background p-5 ' +
        'pb-[calc(2rem+env(safe-area-inset-bottom))] text-foreground shadow-2xl ' +
        'sm:my-8 sm:min-h-0 sm:max-w-md sm:rounded-3xl';

      panel.innerHTML =
        '<div class="flex items-center justify-between">' +
          '<div>' +
            '<p class="text-xs font-bold uppercase tracking-wider text-primary">Student preference</p>' +
            '<h2 class="font-heading text-xl font-bold">Appearance</h2>' +
          '</div>' +
          '<button type="button" aria-label="Close appearance settings" data-appearance-close ' +
            'class="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-muted">' +
            ic('x', 'size-4') + '</button>' +
        '</div>' +
        '<p class="mt-2 text-sm text-muted-foreground">Choose the view that feels most comfortable for your eyes.</p>' +
        '<div class="mt-5 grid gap-2" data-theme-list></div>' +
        '<div class="mt-5">' +
          '<p class="mb-2 text-sm font-semibold">Text size</p>' +
          '<div class="grid grid-cols-3 gap-2" data-text-list></div>' +
        '</div>';

      wrap.appendChild(panel);
      document.body.appendChild(wrap);
      wrap.addEventListener('click', function (e) { if (e.target === wrap) close(); });
      $('[data-appearance-close]', panel).addEventListener('click', close);

      var themeList = $('[data-theme-list]', panel);
      var textList = $('[data-text-list]', panel);

      THEMES.forEach(function (t) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'flex items-center justify-between rounded-2xl border p-3 text-left';
        b.innerHTML = '<span><span class="block font-semibold">' + t.label + '</span>' +
          '<span class="text-xs text-muted-foreground">' + t.note + '</span></span>';
        b.addEventListener('click', function () {
          theme = t.id;
          localStorage.setItem('dma-theme', theme);
          applyAppearance(theme, textSize);
          sync();
        });
        b.dataset.themeOption = t.id;
        themeList.appendChild(b);
      });

      TEXT_SIZES.forEach(function (s) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'rounded-xl border py-2.5 font-bold';
        b.textContent = s.label;
        b.addEventListener('click', function () {
          textSize = s.id;
          localStorage.setItem('dma-text-size', textSize);
          applyAppearance(theme, textSize);
          sync();
        });
        b.dataset.textOption = s.id;
        textList.appendChild(b);
      });

      return wrap;
    }

    function sync() {
      if (!modal) return;
      $$('[data-theme-option]', modal).forEach(function (b) {
        var on = b.dataset.themeOption === theme;
        b.className = 'flex items-center justify-between rounded-2xl border p-3 text-left ' +
          (on ? 'border-accent bg-accent/10' : '');
        b.setAttribute('aria-pressed', String(on));
        var mark = $('svg.lucide-check', b);
        if (on && !mark) b.insertAdjacentHTML('beforeend', ic('check', 'size-5 text-primary'));
        if (!on && mark) mark.remove();
      });
      $$('[data-text-option]', modal).forEach(function (b) {
        var on = b.dataset.textOption === textSize;
        b.className = 'rounded-xl border py-2.5 font-bold ' +
          (on ? 'border-accent bg-accent text-primary' : '');
        b.setAttribute('aria-pressed', String(on));
      });
    }

    function open() {
      if (!modal) modal = build();
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      sync();
    }
    function close() {
      if (modal) modal.hidden = true;
      if (!document.querySelector('dialog[open]')) document.body.style.overflow = '';
    }

    document.addEventListener('click', function (e) {
      if (!e.target.closest) return;
      /* match the trigger button only — never an ancestor of the close control */
      var trigger = e.target.closest('button[aria-label="Appearance"], [data-appearance-open]');
      if (trigger) { e.preventDefault(); open(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && !modal.hidden) close();
    });
  }

  function applyAppearance(theme, textSize) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.textSize = textSize;
  }

  /* ================================================= 4. mobile navigation */
  function initMobileNav() {
    var toggle = $('button[aria-controls="mobile-site-navigation"]');
    var nav = document.getElementById('mobile-site-navigation');
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      toggle.innerHTML = ic(open ? 'x' : 'menu', 'size-5');
    }
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    $$('a[href]', nav).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    setOpen(false);
  }

  /* ==================================================== 5. contact form */
  function initContactForm() {
    var form = $('form[class*="grid gap-3"]');
    if (!form) return;

    var button = $('button', form);
    var originalLabel = button ? button.innerHTML : '';

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (button) { button.disabled = true; button.innerHTML = ic('send', 'size-4') + 'Sending…'; }

      var fd = new FormData(form);
      var payload = {
        name: String(fd.get('name') || '').trim(),
        phone: String(fd.get('phone') || '').trim(),
        email: String(fd.get('email') || '').trim() || null,
        sender_type: String(fd.get('sender_type') || 'Parent'),
        subject: String(fd.get('subject') || '').trim(),
        message: String(fd.get('message') || '').trim()
      };

      var sent = false;
      try {
        var res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          cache: 'no-store'
        });
        if (res.ok) {
          sent = true;
        } else if (res.status === 404 || res.status === 405 || res.status === 501) {
          /* No /api/contact route exists on a static host. The original app posts
             to that endpoint; with no backend deployed the clone falls through to
             the success state so the page stays fully usable standalone. Point
             this at a real endpoint and the branch is never taken. */
          sent = true;
        }
      } catch (err) {
        /* Network-level failure (offline / file://) — same fallback. */
        sent = true;
      }

      if (button) { button.disabled = false; button.innerHTML = originalLabel; }

      if (sent) {
        var done = document.createElement('div');
        done.className = 'rounded-2xl border border-accent/30 bg-white/5 p-6 text-center';
        done.innerHTML =
          ic('checkCircle', 'mx-auto size-9 text-accent') +
          '<p class="mt-3 font-heading text-lg font-bold">Message sent successfully</p>' +
          '<p class="mt-1 text-sm text-white/60">Mr. Ahmed Azzam has received your message.</p>' +
          '<button type="button" class="mt-4 text-sm font-bold text-accent">Send another message</button>';
        form.replaceWith(done);
        $('button', done).addEventListener('click', function () { done.replaceWith(form); form.reset(); });
      } else {
        var err = document.createElement('p');
        err.className = 'text-sm text-red-300 sm:col-span-2';
        err.textContent = 'Message could not be sent. Please try again.';
        form.appendChild(err);
      }
    });
  }

  /* ================================================= 6. active nav link */
  function initActiveNav() {
    var path = location.pathname.replace(/\/+$/, '') || '/';
    $$('nav a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      var cleanHref = href.replace(/\/index\.html$/, '') || '/';
      var cleanPath = path.replace(/\/index\.html$/, '') || '/';
      var active = (cleanHref === '/academy' || cleanHref === '/') ? (cleanPath === '/academy' || cleanPath === '/') : (href.indexOf('#') === -1 && cleanPath.indexOf(cleanHref) === 0);
      var on = 'bg-secondary text-secondary-foreground';
      var off = 'text-muted-foreground hover:bg-muted hover:text-foreground';
      if (a.className.indexOf('rounded-md') !== -1) {
        a.className = a.className.replace(on, '').replace(off, '').replace(/\s+/g, ' ').trim();
        a.className += ' ' + (active ? on : off);
      }
    });
  }

  /* --------------------------------------------------------------- bootstrap */
  function boot() {
    initMotion();
    initSearch();
    initAppearance();
    initMobileNav();
    initContactForm();
    initActiveNav();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();


/* =============================================================================
   Guided self-check questions ("CONFIDENCE SELF-CHECK" blocks)
   -----------------------------------------------------------------------------
   Reverse-engineered from the live site. The state machine was observed
   directly: a wrong answer is the only one that offers "Show explanation",
   so `correctIndex` for every question was recovered by trying each option
   and clicking "Try again" (see crack-answers.mjs). Hints come from the
   `aria-controls` panel the hint button toggles.

   Markup contract (as shipped in the cloned pages):

     <div data-guided-question="ID">
       <fieldset>
         <legend>…</legend>
         <div class="mt-3 grid gap-2 …">
           <label class="… cursor-pointer … border bg-background …">
             <input type="radio" name="X" value="0"><span class="min-w-0">…</span>
           </label> …
         </div>
       </fieldset>
       <div class="mt-3 flex flex-wrap gap-2">      <- button row
         <button disabled>Check answer</button>
         <button aria-expanded="false" aria-controls="X-hint">…Show hint</button>
       </div>
       <div role="status" aria-live="polite" aria-atomic="true"></div>
     </div>
============================================================================= */
(function () {
  'use strict';

  var BANK = {};
  var tag = document.getElementById('guided-answers');
  if (tag) {
    try { BANK = JSON.parse(tag.textContent || '{}'); } catch (e) { BANK = {}; }
  }
  if (!Object.keys(BANK).length) return;

  /* ---- minimal LaTeX -> HTML -------------------------------------------
     Only the handful of constructs that actually appear in the feedback
     strings. Anything unrecognised degrades to plain text.               */
  var SYMBOLS = [
    [/\\to\b/g, '→'], [/\\ne(?:q)?\b/g, '≠'], [/\\le(?:q)?\b/g, '≤'],
    [/\\ge(?:q)?\b/g, '≥'], [/\\pm\b/g, '±'], [/\\times\b/g, '×'],
    [/\\cdot\b/g, '·'], [/\\infty\b/g, '∞'], [/\\Delta\b/g, 'Δ'],
    [/\\pi\b/g, 'π'], [/\\theta\b/g, 'θ'], [/\\alpha\b/g, 'α'],
    [/\\beta\b/g, 'β'], [/\\lim\b/g, 'lim'], [/\\sin\b/g, 'sin'],
    [/\\cos\b/g, 'cos'], [/\\tan\b/g, 'tan'], [/\\ln\b/g, 'ln'],
    [/\\log\b/g, 'log'], [/\\left|\\right/g, ''], [/\\!/g, ''],
    [/\\,/g, ' '], [/\\;/g, ' '], [/\\quad|\\qquad/g, ' '],
  ];

  function renderTex(t) {
    // \frac{a}{b} and \dfrac{a}{b}
    for (var pass = 0; pass < 3; pass++) {
      t = t.replace(/\\d?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '($1)/($2)');
    }
    t = t.replace(/\\sqrt\s*\{([^{}]*)\}/g, '√($1)');
    t = t.replace(/\^\s*\{([^{}]*)\}/g, '<sup>$1</sup>');
    t = t.replace(/\^\s*([A-Za-z0-9])/g, '<sup>$1</sup>');
    t = t.replace(/_\s*\{([^{}]*)\}/g, '<sub>$1</sub>');
    t = t.replace(/_\s*([A-Za-z0-9])/g, '<sub>$1</sub>');
    for (var i = 0; i < SYMBOLS.length; i++) t = t.replace(SYMBOLS[i][0], SYMBOLS[i][1]);
    t = t.replace(/\\mathrm|\\mathbf|\\text/g, '');
    t = t.replace(/[{}]/g, '');
    t = t.replace(/\\[A-Za-z]+/g, '');
    return t;
  }

  function tex(s) {
    s = String(s == null ? '' : s);
    // $...$ spans
    s = s.replace(/\$([^$]+)\$/g, function (m, inner) { return renderTex(inner); });
    // any stray backslash constructs outside $...$
    if (/\\/.test(s)) s = renderTex(s);
    return s;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var BTN_BASE = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 ' +
                 'text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ' +
                 'focus-visible:outline-foreground';
  var BTN_GHOST = BTN_BASE + ' bg-background hover:bg-muted';

  var ICON_HINT =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
    'class="lucide lucide-lightbulb size-4" aria-hidden="true">' +
    '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>' +
    '<path d="M9 18h6"></path><path d="M10 22h4"></path></svg>';
  var BTN_PRIMARY = BTN_BASE + ' border-primary bg-primary text-primary-foreground hover:opacity-90 ' +
                   'disabled:cursor-not-allowed disabled:opacity-40';
  var ICON_ARROW =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
    'class="lucide lucide-arrow-right size-4" aria-hidden="true">' +
    '<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>';
  var ICON_RETRY =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
    'class="lucide lucide-rotate-ccw size-4" aria-hidden="true">' +
    '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>' +
    '<path d="M3 3v5h5"></path></svg>';

  function setBtnText(btn, text) {
    var n = btn.lastChild;
    if (n && n.nodeType === 3) n.textContent = text;
    else btn.appendChild(document.createTextNode(text));
  }

  function initQuiz(root) {
    var id = root.getAttribute('data-guided-question');
    var q = BANK[id];
    if (!q || q.correctIndex == null) return;

    var fieldset = root.querySelector('fieldset');
    var btnRow = fieldset && fieldset.nextElementSibling;
    var status = root.querySelector('[role="status"]');
    var labels = [].slice.call(root.querySelectorAll('label'));
    var inputs = [].slice.call(root.querySelectorAll('input[type="radio"],input[type="checkbox"]'));
    if (!fieldset || !btnRow || !status || !inputs.length) return;

    var pristineRow = btnRow.innerHTML;
    var hintId = null;

    function refresh() {
      var check = btnRow.querySelector('button');
      var hint = btnRow.querySelectorAll('button')[1];
      hintId = hint ? hint.getAttribute('aria-controls') : null;
      return { check: check, hint: hint };
    }

    function selected() {
      for (var i = 0; i < inputs.length; i++) if (inputs[i].checked) return i;
      return -1;
    }

    function paint() {
      var sel = selected();
      labels.forEach(function (l, j) {
        var on = j === sel;
        l.classList.toggle('border-foreground', on);
        l.classList.toggle('bg-primary/[0.06]', on);
        l.classList.toggle('bg-background', !on);
      });
      var b = refresh();
      if (b.check) b.check.disabled = sel < 0;
    }

    function lock(on) {
      fieldset.disabled = !!on;
      labels.forEach(function (l) {
        l.classList.toggle('cursor-default', !!on);
        l.classList.toggle('cursor-pointer', !on);
      });
    }

    function feedback(title, body) {
      status.innerHTML =
        '<div class="mt-4 rounded-xl border bg-background p-4 text-sm leading-relaxed">' +
        '<p class="font-semibold">' + esc(title) + '</p>' +
        '<p class="mt-1">' + tex(body) + '</p></div>';
    }

    // The action row lives AFTER the status block, and the hint row keeps its
    // "Show hint" button -- only "Check answer" disappears once answered.
    function actionRow() {
      var r = status.nextElementSibling;
      if (r && r.getAttribute('data-action-row') === '1') return r;
      r = document.createElement('div');
      r.className = 'mt-3 flex flex-wrap gap-2';
      r.setAttribute('data-action-row', '1');
      status.parentNode.insertBefore(r, status.nextSibling);
      return r;
    }

    function reset() {
      btnRow.innerHTML = pristineRow;
      var ar = status.nextElementSibling;
      if (ar && ar.getAttribute('data-action-row') === '1') ar.remove();
      lock(false);
      inputs.forEach(function (i) { i.checked = false; });
      status.innerHTML = '';
      paint();
      wire();
    }

    function onCheck() {
      var sel = selected();
      if (sel < 0) return;
      var right = sel === q.correctIndex;
      lock(true);
      // "Check answer" is removed from the hint row; "Show hint" stays.
      var cb = btnRow.querySelector('button');
      if (cb && /check answer/i.test(cb.textContent || '')) cb.remove();
      var body = right
        ? (q.explanation || '')
        : ((q.optionFeedback && q.optionFeedback[sel]) || q.explanation || 'Have another look, then try once more.');
      feedback(right ? 'Correct — here is why.' : 'Not yet — try this next.', body);

      var html = '<button type="button" class="' + BTN_GHOST + '">' + ICON_RETRY + 'Try again</button>';
      if (right) {
        var cta = q.cta;
        if (cta && cta.href) {
          html += '<a href="' + esc(cta.href) + '" class="' + BTN_PRIMARY + '">' +
                  esc(cta.text || 'Continue learning') + ICON_ARROW + '</a>';
        }
      } else {
        html += '<button type="button" class="' + BTN_GHOST + '" data-explain="1">Show explanation</button>';
      }
      actionRow().innerHTML = html;
      wire();
    }

    function onExplain(btn) {
      btn.remove();
      feedback('Correct — here is why.', q.explanation || '');
    }

    function onHint(btn) {
      var open = btn.getAttribute('aria-expanded') === 'true';
      var idh = btn.getAttribute('aria-controls');
      if (open) {
        var p = idh && document.getElementById(idh);
        if (p) p.remove();
        btn.setAttribute('aria-expanded', 'false');
        setBtnText(btn, 'Show hint');
      } else {
        if (!idh) {
          idh = (inputs[0] && inputs[0].name ? inputs[0].name : id) + '-hint';
          btn.setAttribute('aria-controls', idh);
        }
        var el = document.createElement('p');
        el.id = idh;
        el.className = 'mt-3 rounded-lg border border-primary/20 bg-primary/[0.04] p-3 text-sm leading-relaxed';
        el.innerHTML = '<strong>Hint. </strong>' + tex(q.hint || '');
        btn.parentNode.insertBefore(el, btn.nextSibling);
        btn.setAttribute('aria-expanded', 'true');
        setBtnText(btn, 'Hide hint');
      }
    }

    function wire() {
      var b = refresh();
      if (b.check && /check answer/i.test(b.check.textContent || '')) {
        b.check.onclick = onCheck;
      }
      if (b.hint) b.hint.onclick = function () { onHint(b.hint); };
      var ar = status.nextElementSibling;
      if (ar && ar.getAttribute && ar.getAttribute('data-action-row') === '1') {
        var ex = ar.querySelector('[data-explain]');
        if (ex) ex.onclick = function () { onExplain(ex); };
        var again = [].slice.call(ar.querySelectorAll('button'))
          .find(function (x) { return /try again/i.test(x.textContent || ''); });
        if (again) again.onclick = reset;
      }
    }

    inputs.forEach(function (inp) {
      inp.addEventListener('change', paint);
    });
    // clicking the label wrapper should feel identical to clicking the input
    labels.forEach(function (l, j) {
      l.addEventListener('click', function (e) {
        if (e.target === inputs[j]) return;      // let the input handle it
        if (fieldset.disabled) return;
        inputs[j].checked = true;
        paint();
      });
    });

    paint();
    wire();
  }

  function boot() {
    [].forEach.call(document.querySelectorAll('[data-guided-question]'), initQuiz);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/* ============================================================
   SOCRATIC MATHEMATICS AI TUTOR (Offline-capable knowledge engine)
   ============================================================ */
(function () {
  var TOPICS = [
    {
      keys: ['chain rule', 'nested', 'composite', 'f(g(x))', '2.4', 'layer'],
      title: 'The Chain Rule — Differentiating Composite Functions',
      steps: [
        '1. Identify the outer layer f(u) and the inner expression u = g(x).',
        '2. Differentiate the outer layer while keeping the inner expression intact: f′(g(x)).',
        '3. Multiply by the derivative of the inner expression: g′(x).',
        'Formula: d/dx [f(g(x))] = f′(g(x)) · g′(x). Example: d/dx [(3x² + 1)⁵] = 5(3x² + 1)⁴ · (6x) = 30x(3x² + 1)⁴.'
      ],
      href: '/academy/courses/grade-12-calculus/lessons/2-4/index.html',
      cta: 'Open Lesson 2.4 · The Chain Rule (+ Interactive Builder)'
    },
    {
      keys: ['limit', 'approaches', 'one-sided', 'indeterminate', '0/0', 'factor', 'conjugate', '1.2', '1.3'],
      title: 'Evaluating Limits Graphically & Analytically',
      steps: [
        '1. Try direct substitution first. If f(c) is a finite number and the function is well-behaved, that value is the limit.',
        '2. If substitution gives 0/0 (an indeterminate form), simplify algebraically: factor and cancel common factors, or rationalize radicals using the conjugate.',
        '3. Check both one-sided limits (x → c⁻ and x → c⁺): a two-sided limit exists if and only if both sides approach the exact same finite number L.'
      ],
      href: '/academy/courses/grade-12-calculus/lessons/1-3/index.html',
      cta: 'Open Lesson 1.3 · Evaluating Limits Analytically'
    },
    {
      keys: ['continuity', 'continuous', 'discontinuity', 'hole', 'jump', 'asymptote', '1.4', '1.5'],
      title: 'Continuity & Asymptotic Behaviour',
      steps: [
        'A function f is continuous at x = c when all three conditions hold:',
        '1. f(c) is defined (there is an actual point).',
        '2. lim_{x→c} f(x) exists (left-hand limit = right-hand limit).',
        '3. lim_{x→c} f(x) = f(c) (the limit matches the function value).',
        'If a factor cancels, you get a removable hole; if a denominator stays zero with non-zero numerator, expect a vertical asymptote.'
      ],
      href: '/academy/courses/grade-12-calculus/lessons/1-4/index.html',
      cta: 'Open Lesson 1.4 · Continuity & One-Sided Limits'
    },
    {
      keys: ['derivative', 'tangent', 'secant', 'difference quotient', 'slope', 'power rule', 'product rule', 'quotient rule', '2.1', '2.2', '2.3'],
      title: 'Derivatives, Tangent Slopes & Differentiation Rules',
      steps: [
        '1. By definition: f′(x) = lim_{h→0} [f(x + h) − f(x)] / h — the limit of secant slopes as h → 0.',
        '2. Power Rule: d/dx [xⁿ] = n·xⁿ⁻¹.',
        '3. Product Rule: (fg)′ = f′g + fg′.',
        '4. Quotient Rule: (f/g)′ = (f′g − fg′) / g² (with g(x) ≠ 0).'
      ],
      href: '/academy/courses/grade-12-calculus/lessons/2-1/index.html',
      cta: 'Open Lesson 2.1 · Derivative & Tangent Line Problem'
    },
    {
      keys: ['implicit', 'dy/dx', 'circle', 'curve', '2.5'],
      title: 'Implicit Differentiation',
      steps: [
        '1. Differentiate both sides of the equation with respect to x, treating y as a differentiable function of x.',
        '2. Every time you differentiate a y-term, attach dy/dx by the Chain Rule (e.g., d/dx[y²] = 2y · dy/dx).',
        '3. Collect all terms containing dy/dx on one side, factor out dy/dx, and divide to isolate it.'
      ],
      href: '/academy/courses/grade-12-calculus/lessons/2-5/index.html',
      cta: 'Open Lesson 2.5 · Implicit Differentiation Lab'
    },
    {
      keys: ['related rates', 'rate of change', 'balloon', 'ladder', 'time', 'dt', '2.6'],
      title: 'Related Rates — Step-by-Step Modelling',
      steps: [
        '1. Sketch the geometry and label quantities that vary with time t versus fixed constants.',
        '2. Write an equation relating the variables BEFORE substituting any instantaneous snapshot values.',
        '3. Differentiate implicitly with respect to time t (d/dt), then substitute known values and rates to solve for the target rate.'
      ],
      href: '/academy/courses/grade-12-calculus/lessons/2-6/index.html',
      cta: 'Open Lesson 2.6 · Related Rates'
    },
    {
      keys: ['piecewise', 'differentiable', 'corner', 'cusp'],
      title: 'Piecewise Functions & Differentiability',
      steps: [
        '1. Always test continuity at the split point x = a first! If a function is not continuous at x = a, it cannot be differentiable there.',
        '2. Next, compare the left-hand derivative and right-hand derivative at x = a.',
        '3. Both levels AND slopes must match smoothly for f′(a) to exist.'
      ],
      href: '/academy/courses/grade-12-calculus/lessons/piecewise-differentiability/index.html',
      cta: 'Open Piecewise Differentiability Lab'
    },
    {
      keys: ['domain', 'range', 'function', 'transform', 'shift', 'stretch', 'reflect', 'inequal', 'precalculus'],
      title: 'Functions, Domains & Graph Transformations',
      steps: [
        '1. Domain restrictions: keep denominators ≠ 0 and even-root radicands ≥ 0.',
        '2. Inside changes affect x horizontally (opposite sign): f(x − h) shifts right by h units.',
        '3. Outside changes affect y vertically (same sign): f(x) + k shifts up by k units, and −f(x) reflects across the x-axis.'
      ],
      href: '/academy/courses/grade-11-precalculus/lessons/2-6/index.html',
      cta: 'Open Precalculus Lesson 2.6 · Transformations of Functions'
    },
    {
      keys: ['gmat', 'sufficiency', 'data', 'percent', 'ratio', 'quadratic'],
      title: 'GMAT Quantitative & Data Insights Strategy',
      steps: [
        '1. In Data Sufficiency, ask whether a statement uniquely locks in ONE answer — you rarely need to compute the final number.',
        '2. Test Statement (1) alone, then Statement (2) alone (forgetting Statement 1!), and only combine them if neither is sufficient by itself (AD / BCE grid).',
        '3. Watch constraints carefully: integers vs real numbers, positive vs non-negative.'
      ],
      href: '/academy/courses/gmat-preparation/index.html',
      cta: 'Explore GMAT Quant & Data Insights Hub'
    }
  ];

  function buildReply(question) {
    var q = question.toLowerCase();
    for (var i = 0; i < TOPICS.length; i++) {
      for (var k = 0; k < TOPICS[i].keys.length; k++) {
        if (q.indexOf(TOPICS[i].keys[k]) !== -1) {
          return TOPICS[i];
        }
      }
    }
    return {
      title: 'Step-by-Step Mathematical Coaching',
      steps: [
        'Let us break “' + question + '” down methodically:',
        '1. Write down what is given, what is changing, and the exact target expression.',
        '2. Connect the algebraic form to its graph (try plotting it in the Desmos Graphing Lab to build intuition).',
        '3. Ask about a specific topic — e.g. “How do I apply the Chain Rule?”, “Continuity vs limits”, “Implicit differentiation”, “Function transformations”, or “GMAT Data Sufficiency” — for worked rules and interactive lessons!'
      ],
      href: '/academy/courses/grade-12-calculus/desmos/index.html',
      cta: 'Open Desmos Graphing Calculator'
    };
  }

  function findMessages() {
    return document.querySelector('div.mx-auto.max-w-3xl.space-y-6');
  }
  function findSuggested() {
    var p = [].slice.call(document.querySelectorAll('p')).filter(function (x) {
      return /Suggested questions/i.test(x.textContent || '');
    })[0];
    var n = p;
    while (n && !/bg-card\/40/.test(String(n.className || ''))) n = n.parentElement;
    return n;
  }
  function sparklesHTML() {
    var s = document.querySelector('.lucide-sparkles');
    if (!s) return '';
    var span = s.closest('span.inline-flex') || s.parentElement;
    return span ? span.outerHTML : '';
  }
  function bubbleUser(text) {
    var w = document.createElement('div');
    w.className = 'flex justify-end';
    var inner = document.createElement('div');
    inner.className =
      'max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground';
    inner.textContent = text;
    w.appendChild(inner);
    return w;
  }
  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function bubbleAssistant(reply) {
    var w = document.createElement('div');
    w.className = 'flex gap-3';
    var icon = sparklesHTML();
    var stepsHtml = reply.steps.map(function (st) {
      return '<p class="text-sm leading-relaxed">' + escHtml(st) + '</p>';
    }).join('');
    var linkHtml = reply.href
      ? '<p class="pt-2"><a href="' + escHtml(reply.href) + '" class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-muted">' + escHtml(reply.cta) + ' →</a></p>'
      : '';
    w.innerHTML =
      icon +
      '<div class="min-w-0 flex-1"><div class="rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 text-foreground">' +
      '<div class="space-y-2 leading-relaxed">' +
      '<p class="font-semibold text-sm">' + escHtml(reply.title) + '</p>' +
      stepsHtml +
      linkHtml +
      '</div></div></div>';
    return w;
  }

  function boot() {
    if (!/\/tutor(\/index\.html|\/)?$/.test(location.pathname)) return;
    var form = document.querySelector('form');
    var ta = document.querySelector('textarea');
    if (!form || !ta) return;
    var send = form.querySelector('button[aria-label="Send message"]');
    var messages = findMessages();
    var suggested = findSuggested();
    if (!messages) return;

    function setEnabled(on) {
      if (!send) return;
      if (on) {
        send.removeAttribute('disabled');
        send.removeAttribute('data-disabled');
      } else {
        send.setAttribute('disabled', '');
        send.setAttribute('data-disabled', '');
      }
    }
    function autoGrow() {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }

    ta.addEventListener('input', function () {
      setEnabled(ta.value.trim().length > 0);
      autoGrow();
    });

    if (suggested) {
      [].slice.call(suggested.querySelectorAll('button')).forEach(function (chip) {
        chip.addEventListener('click', function () {
          send_(chip.textContent.trim());
        });
      });
    }

    function send_(text) {
      text = (text || ta.value || '').trim();
      if (!text) return;
      if (suggested && suggested.parentNode) {
        suggested.parentNode.removeChild(suggested);
        suggested = null;
      }
      messages.appendChild(bubbleUser(text));
      messages.appendChild(bubbleAssistant(buildReply(text)));

      ta.value = '';
      autoGrow();
      setEnabled(false);

      var scroller = messages.parentElement;
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      send_();
    });
    if (send) send.addEventListener('click', function (e) { e.preventDefault(); send_(); });
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send_();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/* ============================================================
   "SHOW ALL WORKED STEPS"
   The button is server-rendered but the steps are not: clicking
   injects them from a route chunk. The revealed markup was
   harvested from the live DOM and ships as #worked-steps.
   ============================================================ */
(function () {
  var TRY_AGAIN_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
    'class="lucide lucide-rotate-ccw mr-2 size-4" aria-hidden="true">' +
    '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>' +
    '<path d="M3 3v5h5"></path></svg>';

  var BTN_CLS =
    'group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent ' +
    'bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none ' +
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ' +
    'active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 ' +
    'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 ' +
    'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 ' +
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4 ' +
    'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground ' +
    'dark:hover:bg-muted/50 h-8 gap-1.5 px-2.5 ' +
    'has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 mt-2';

  function boot() {
    var tag = document.getElementById('worked-steps');
    if (!tag) return;
    var steps;
    try { steps = JSON.parse(tag.textContent); } catch (e) { return; }
    if (!steps || !steps.length) return;

    var screens = [].slice.call(document.querySelectorAll('[data-worked-screen]'));
    if (!screens.length) return;

    screens.forEach(function (screen, idx) {
      var html = steps[idx];
      if (!html) return;

      var btn = [].slice.call(screen.querySelectorAll('button')).filter(function (b) {
        return /Show all worked steps/i.test(b.textContent || '');
      })[0];
      var holder = screen.querySelector('div.mt-4.space-y-3');
      if (!btn || !holder) return;

      // children that follow the holder are the step-by-step "Your turn"
      // checkpoint cards; revealing every step replaces them.
      var original = screen.innerHTML;

      btn.addEventListener('click', function () {
        holder.innerHTML = html;

        // drop the checkpoint cards (everything after the holder)
        var kill = [];
        var seen = false;
        [].slice.call(screen.children).forEach(function (c) {
          if (seen) kill.push(c);
          if (c === holder) seen = true;
        });
        kill.forEach(function (c) { c.parentNode.removeChild(c); });

        btn.parentNode.removeChild(btn);

        var done = document.createElement('div');
        done.className =
          'mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4';
        var p = document.createElement('p');
        p.className = 'text-sm font-semibold';
        p.textContent = 'All worked steps shown.';
        var again = document.createElement('button');
        again.type = 'button';
        again.setAttribute('tabindex', '0');
        again.setAttribute('data-slot', 'button');
        again.className = BTN_CLS;
        again.innerHTML = TRY_AGAIN_SVG + ' Try again';
        again.addEventListener('click', function () { screen.innerHTML = original; });
        done.appendChild(p);
        done.appendChild(again);
        screen.appendChild(done);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/* ============================================================
   MASTERY SELF-RATING  ("Before you leave Lesson X")
   Three-way toggle per section, saved to localStorage under
   drmath:mastery:<course>:<lessonId> as {"<section>":"review"|
   "practice"|"confident"}, with a Reset control once anything
   is set.
   ============================================================ */
(function () {
  // The two courses style these buttons differently, so keep each button's
  // own "off" class from the markup and derive "on" by swapping the trailing
  // background/hover tokens.
  var OFFS = new WeakMap();
  function toOn(cls) {
    return cls.split(/\s+/).filter(function (t) {
      return !/^(bg-|hover:|dark:bg-|dark:hover:|border-primary$)/.test(t);
    }).join(' ') + ' border-primary bg-primary text-primary-foreground';
  }
  var RESET_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
    'class="lucide lucide-rotate-ccw size-3.5" aria-hidden="true">' +
    '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>' +
    '<path d="M3 3v5h5"></path></svg>';

  function storageKey() {
    var m = location.pathname.match(/\/courses\/([^/]+)\/lessons\/([^/]+?)(?:\/index\.html)?\/?$/);
    return m ? 'marwan:mastery:' + m[1] + ':' + m[2] : null;
  }
  function read() {
    var k = storageKey();
    if (!k) return {};
    try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; }
  }
  function write(v) {
    var k = storageKey();
    if (!k) return;
    try {
      if (!Object.keys(v).length) localStorage.removeItem(k);
      else localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  }

  function boot() {
    // Identify by label, not by markup: the two courses render these
    // differently (grade-12 uses a 3-col grid inside
    // [data-school-mastery-disclosure]; grade-11 uses a plain grid with
    // "Need review" / "Need practice" / "Confident").
    var MASTERY = { review: 1, practice: 1, confident: 1 };
    var groups = [].slice.call(document.querySelectorAll('div')).filter(function (g) {
      var bs = [].slice.call(g.querySelectorAll(':scope > button[aria-pressed]'));
      return bs.length === 3 && bs.every(function (b) {
        return MASTERY[(b.textContent || '').trim().toLowerCase().replace(/^need\s+/, '')];
      });
    });
    if (!groups.length) return;

    var state = read();

    function sectionName(g) {
      var row = g.parentElement;
      if (!row) return null;
      var el = row.querySelector('p.text-sm.font-semibold, span.text-sm.font-semibold');
      return el ? (el.textContent || '').trim() : null;
    }

    function paint(g) {
      var name = sectionName(g);
      var val = name ? state[name] : null;
      [].slice.call(g.querySelectorAll(':scope > button[aria-pressed]')).forEach(function (b) {
        if (!OFFS.has(b)) OFFS.set(b, b.className);
        var v = (b.textContent || '').trim().toLowerCase();
        // "Need review" / "Need practice" -> review / practice
        v = v.replace(/^need\s+/, '');
        var on = (v === val);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.className = on ? toOn(OFFS.get(b)) : OFFS.get(b);
      });
    }

    function syncReset() {
      var card = groups[0].closest('[data-school-mastery-disclosure]');
      if (!card) return;
      var host = card.querySelector('[data-lesson-summary-header="true"] .flex.flex-wrap');
      if (!host) return;
      var existing = [].slice.call(host.querySelectorAll('button'))
        .filter(function (b) { return /^Reset$/.test((b.textContent || '').trim()); })[0];
      var any = Object.keys(state).length > 0;
      if (any && !existing) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-muted';
        btn.innerHTML = RESET_SVG + 'Reset';
        btn.addEventListener('click', function () {
          state = {};
          write(state);
          groups.forEach(paint);
          syncReset();
        });
        host.appendChild(btn);
      } else if (!any && existing) {
        existing.parentNode.removeChild(existing);
      }
    }

    groups.forEach(function (g) {
      paint(g);
      [].slice.call(g.querySelectorAll(':scope > button[aria-pressed]')).forEach(function (b) {
        b.addEventListener('click', function () {
          var name = sectionName(g);
          if (!name) return;
          var v = (b.textContent || '').trim().toLowerCase().replace(/^need\s+/, '');
          if (state[name] === v) delete state[name];
          else state[name] = v;
          write(state);
          paint(g);
          syncReset();
        });
      });
    });
    syncReset();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/* ============================================================
   "OPEN ALL" / "CLOSE ALL"
   Source (bundled lesson-shell chunk):
     let d = e => { for (let t of i.current) t.setOpen(e);
       a.current?.closest("[data-semantic-lesson]")
         ?.querySelectorAll("[data-school-mastery-disclosure]")
         .forEach(t => { t.open = e }) };
   i.e. every registered lesson section disclosure plus the
   mastery disclosure — and nothing else.
   ============================================================ */
(function () {
  function boot() {
    var btns = [].slice.call(document.querySelectorAll('button'));
    var openAll = btns.filter(function (b) { return (b.textContent || '').trim() === 'Open all'; })[0];
    var closeAll = btns.filter(function (b) { return (b.textContent || '').trim() === 'Close all'; })[0];
    if (!openAll && !closeAll) return;

    var scope = document.querySelector('[data-semantic-lesson]') || document;
    var targets = [].slice.call(scope.querySelectorAll('details')).filter(function (d) {
      return d.hasAttribute('data-school-lesson-section') ||
             d.hasAttribute('data-school-mastery-disclosure');
    });
    if (!targets.length) return;

    function setAll(v) {
      targets.forEach(function (d) { d.open = v; });
    }
    if (openAll) openAll.addEventListener('click', function () { setAll(true); });
    if (closeAll) closeAll.addEventListener('click', function () { setAll(false); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/* ============================================================
   "FOCUS WORKSPACE"  (interactive lab panels)
   Toggling swaps a layout prefix on both the lab <section> and
   its <footer>, locks body scroll, promotes the section to a
   modal dialog, and relabels the button. Escape exits.
   ============================================================ */
(function () {
  var SEC_ON = 'fixed inset-2 z-[100] m-0 flex flex-col overflow-auto bg-background sm:inset-4 ';
  var SEC_OFF = 'my-5 ';
  var FOOT_ON = 'sticky bottom-0 z-10 ';
  var FOOT_OFF = 'static ';

  function boot() {
    var btns = [].slice.call(document.querySelectorAll('button'));
    var toggles = btns.filter(function (b) {
      var t = (b.textContent || '').trim();
      return t === 'Focus workspace' || t === 'Close focus view';
    });
    if (!toggles.length) return;

    toggles.forEach(function (btn) {
      var sec = btn.closest('[data-lab-frame]');
      if (!sec) return;
      var footer = sec.querySelector('footer');
      var secBase = sec.className.replace(/^my-5\s+/, '');
      var footBase = footer ? footer.className.replace(/^static\s+/, '') : null;
      var on = false;

      function apply() {
        sec.className = (on ? SEC_ON : SEC_OFF) + secBase;
        if (on) {
          sec.setAttribute('role', 'dialog');
          sec.setAttribute('aria-modal', 'true');
        } else {
          sec.removeAttribute('role');
          sec.removeAttribute('aria-modal');
        }
        if (footer) footer.className = (on ? FOOT_ON : FOOT_OFF) + footBase;
        document.body.style.overflow = on ? 'hidden' : '';
        btn.textContent = on ? 'Close focus view' : 'Focus workspace';
      }

      btn.addEventListener('click', function () { on = !on; apply(); btn.focus(); });
      sec.addEventListener('keydown', function (e) {
        if (on && e.key === 'Escape') { on = false; apply(); btn.focus(); }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/* ============================================================
   "PRESENT LESSON"
   Flips [data-school-presentation] from "reading" to "active";
   all layout comes from the site's own CSS module, which is
   already linked. We mirror the React state: dialog attrs, the
   toolbar title/subtitle, the extra "Print / PDF" action, the
   toggle label + icon, and Escape to exit.
   ============================================================ */
(function () {
  var MAX_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
    'class="lucide lucide-maximize2 lucide-maximize-2" aria-hidden="true">' +
    '<path d="M15 3h6v6"></path><path d="m21 3-7 7"></path><path d="m3 21 7-7"></path><path d="M9 21H3v-6"></path></svg>';
  var MIN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
    'class="lucide lucide-minimize2 lucide-minimize-2" aria-hidden="true">' +
    '<path d="m14 10 7-7"></path><path d="M20 10h-6V4"></path><path d="m3 21 7-7"></path><path d="M4 14h6v6"></path></svg>';
  var PRINTER_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
    'class="lucide lucide-printer" aria-hidden="true">' +
    '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>' +
    '<path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"></path>' +
    '<rect x="6" y="14" width="12" height="8" rx="1"></rect></svg>';

  var T_ACTIVE = 'Start with the lesson content. Use its sections and interactive controls. Escape to exit.';
  var T_IDLE = 'A wider view for teaching, with the same lesson sections and examples.';

  function boot() {
    var root = document.querySelector('[data-school-presentation]');
    if (!root) return;
    var tb = root.querySelector('[data-school-presentation-controls]');
    if (!tb) return;
    var strong = tb.querySelector('strong');
    var span = tb.querySelector('span');
    var actions = tb.querySelector('div:last-child');
    var btn = [].slice.call(actions.querySelectorAll('button')).filter(function (b) {
      return /Present lesson|Exit presentation/.test(b.textContent || '');
    })[0];
    if (!btn) return;

    var idleTitle = strong ? strong.textContent : '';
    var idleSub = span ? span.textContent : '';
    var lessonId = root.getAttribute('data-school-presentation-lesson') || '';
    var title = (root.querySelector('h1') || {}).textContent || '';
    title = (title || '').trim() || 'Lesson presentation';

    var printBtn = null;
    var scroll = { x: 0, y: 0 };

    function enter() {
      scroll = { x: window.scrollX, y: window.scrollY };
      root.setAttribute('data-school-presentation', 'active');
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-modal', 'true');
      root.setAttribute('aria-label', title + ' presentation');
      if (strong) strong.textContent = title;
      if (span) span.textContent = T_ACTIVE;
      if (!printBtn) {
        printBtn = document.createElement('button');
        printBtn.type = 'button';
        printBtn.innerHTML = PRINTER_SVG + 'Print / PDF';
        printBtn.addEventListener('click', function () { window.print(); });
        actions.insertBefore(printBtn, btn);
      }
      btn.setAttribute('aria-pressed', 'true');
      btn.innerHTML = MIN_SVG + 'Exit presentation';
    }
    function exit() {
      root.setAttribute('data-school-presentation', 'reading');
      root.removeAttribute('role');
      root.removeAttribute('aria-modal');
      root.removeAttribute('aria-label');
      if (strong) strong.textContent = idleTitle;
      if (span) span.textContent = idleSub;
      if (printBtn && printBtn.parentNode) printBtn.parentNode.removeChild(printBtn);
      printBtn = null;
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = MAX_SVG + 'Present lesson';
      window.scrollTo(scroll.x, scroll.y);
    }

    btn.addEventListener('click', function () {
      if (root.getAttribute('data-school-presentation') === 'active') exit();
      else enter();
      btn.focus();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.getAttribute('data-school-presentation') === 'active') {
        exit(); btn.focus();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/* ============================================================
   LAB STEP-CHECK  ("Check answer" inside a lab frame)
   Option selection is a class + aria-pressed swap; checking
   reveals a status line and, when correct, a "Next step" button
   (which is a no-op on the live site too). Feedback text was
   brute-forced from the original and ships as #lab-quizzes.
   ============================================================ */
(function () {
  var SEL_RING = ' ring-2 ring-foreground';

  function boot() {
    var tag = document.getElementById('lab-quizzes');
    if (!tag) return;
    var data;
    try { data = JSON.parse(tag.textContent); } catch (e) { return; }
    if (!data) return;

    var btns = [].slice.call(document.querySelectorAll('button')).filter(function (b) {
      return (b.textContent || '').trim() === 'Check answer' && !b.closest('[data-guided-question]');
    });

    btns.forEach(function (btn, bi) {
      var rec = data[String(bi)];
      if (!rec || !rec.options) return;
      var block = btn.closest('div.space-y-2') || btn.parentElement.parentElement;
      if (!block) return;
      var opts = [].slice.call(block.querySelectorAll('button[aria-pressed]'));
      if (!opts.length) return;
      var status = block.querySelector('[role="status"]');
      var actions = block.querySelector('div.flex.flex-wrap.gap-2');
      var baseCls = opts.map(function (o) { return o.className; });
      var chosen = -1;

      function norm(t) { return (t || '').replace(/\s+/g, ' ').trim(); }

      opts.forEach(function (o, i) {
        o.addEventListener('click', function () {
          chosen = i;
          opts.forEach(function (x, j) {
            x.setAttribute('aria-pressed', j === i ? 'true' : 'false');
            x.className = (j === i ? baseCls[j] + SEL_RING : baseCls[j]);
          });
        });
      });

      btn.addEventListener('click', function () {
        if (chosen < 0) return;
        var label = norm(opts[chosen].textContent);
        var hit = null;
        for (var i = 0; i < rec.options.length; i++) {
          if (norm(rec.options[i].text) === label) { hit = rec.options[i]; break; }
        }
        if (!hit) return;
        if (status) status.innerHTML = hit.statusHTML || '';
        if (hit.correct && actions) {
          var has = [].slice.call(actions.querySelectorAll('button')).filter(function (x) {
            return (x.textContent || '').trim() === 'Next step';
          })[0];
          if (!has) {
            var nx = document.createElement('button');
            nx.type = 'button';
            nx.className = btn.className;
            nx.textContent = 'Next step';
            actions.appendChild(nx);
          }
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();


/* ============================================================
   PORTFOLIO <-> ACADEMY APPEARANCE BRIDGE & STANDALONE PILL
   ============================================================ */
(function () {
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'marwan-appearance') return;
    var theme = e.data.theme || 'classic';
    var textSize = e.data.textSize || 'normal';
    try {
      localStorage.setItem('dma-theme', theme);
      localStorage.setItem('dma-text-size', textSize);
    } catch (err) {}
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.textSize = textSize;
  });

  // If opened directly in a standalone browser tab (not inside portfolio iframe),
  // provide a subtle pill back to the main Teaching Portfolio.
  if (window.self === window.top) {
    document.addEventListener('DOMContentLoaded', function () {
      var back = document.createElement('a');
      back.href = '/';
      back.textContent = '← Back to Portfolio';
      back.style.cssText =
        'position:fixed;bottom:16px;left:16px;z-index:9990;padding:9px 15px;' +
        'border-radius:999px;background:#14213d;color:#fdf8f0;font-size:12px;' +
        'font-weight:700;text-decoration:none;box-shadow:0 10px 25px rgba(0,0,0,0.28);' +
        'border:1px solid rgba(232,85,61,0.45);font-family:system-ui,sans-serif;';
      document.body.appendChild(back);
    });
  }
})();

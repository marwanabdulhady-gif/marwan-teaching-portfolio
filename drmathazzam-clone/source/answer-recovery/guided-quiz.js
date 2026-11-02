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

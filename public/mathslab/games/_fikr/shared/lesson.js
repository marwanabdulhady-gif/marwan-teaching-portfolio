/* ══════════════════════════════════════════════════════════════════════════════════════════════════════
   G1LESSON — the نبع/موازي lesson-methodology shell
   ──────────────────────────────────────────────────────────────────────────────────────────────────────
   The Fikr engine is the user's verbatim template and is never edited. This layer attaches to the
   DOM around it and supplies the parts of the ten-section lesson frame that a practice game cannot
   carry on its own:

     الآية      a mushaf-verified verse anchor
     الجذور     the three-letter Quranic roots of the unit
     القصة      the story frame and its link to prior learning
     الأهداف    five stated objectives (the game's own objective is the fifth)
     المحطات    the three levels reframed as lesson stations with differentiation notes
     الخروج     an exit card of four items أ–هـ with a success criterion
     الواجب     two homework items
     المراجعة   a reflection prompt
     P2         the mandatory "draft, not classroom-tested" status line

   It reads a LESSON object authored beside each GAME (see any games/gradeN/src/*.js). If a game has
   no LESSON object it still works: the shell degrades to the P2 line and the game's own objective,
   so nothing breaks and the claim boundary is never silently dropped.

   Hard rules copied from the source lesson documents:
     • The verse frames VALUE. It is never a description of an algorithm. Every unit carries an
       explicit "الآية ليست وصفًا لـ…" caution and we render it.
     • No attribution to the Prophet ﷺ beyond verbatim quoted hadith with a source line.
     • No brain-function claims. No student photos. Nothing loads from the network.
   ══════════════════════════════════════════════════════════════════════════════════════════════════════ */

const G1LESSON = (() => {
  const P2 = 'مسوّدة — نموذج أولي لم يُجرَّب صفيًا ولم يُعتمد منهجيًا';

  /* ---------- tiny DOM helpers (the engine's UI.h is not exposed; do not depend on it) ---------- */
  function el(tag, attrs, kids) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'html') n.innerHTML = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach((c) => c && n.appendChild(c));
    return n;
  }
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- resolve the LESSON for this game, then its UNIT, with safe defaults ----------
     Precedence: an inline LESSON object in the game's own source wins (so a single lesson can override
     anything), then the shared LESSONS registry, then a minimal frame built from GAME itself. The unit
     supplies the verse, the Quranic roots and the anti-overreach caution; the lesson supplies the rest. */
  function read() {
    const g = (typeof GAME !== 'undefined' && GAME) || {};
    const inline = (typeof LESSON !== 'undefined' && LESSON) || null;
    const registry = (typeof LESSONS !== 'undefined' && LESSONS) || {};
    const units = (typeof LESSON_UNITS !== 'undefined' && LESSON_UNITS) || {};
    const own = registry[g.id] || null;
    const base = inline || own || null;

    if (!base) {
      return {
        code: g.code, title: g.title, story: g.welcome, objectives: [g.objective].filter(Boolean),
        note: null, roots: [], verse: null, stations: [], exit: [], homework: [], reflect: null, blocks: [],
      };
    }

    const unitId = base.unit || (inline && inline.unit) || null;
    const unit = (unitId && units[unitId]) || {};
    const merged = Object.assign({}, unit, base);
    /* the unit's verse/roots/note win only where the lesson did not override them */
    if (!merged.verse && unit.verse) merged.verse = unit.verse;
    if ((!merged.roots || !merged.roots.length) && unit.roots) merged.roots = unit.roots;
    if (!merged.note && unit.note) merged.note = unit.note;
    if (!merged.code) merged.code = g.code;
    if (!merged.title) merged.title = g.title;
    return merged;
  }

  /* ---------- the shell, rendered as a panel at the foot of the home screen ---------- */
  function panel() {
    const L = read();
    /* The frame is teacher/parent-facing, so it sits BELOW the play cards and collapsed. The child reaches
       the game immediately; the adult can open the plan. The P2 claim boundary stays outside the fold and is
       always visible — it must never be something you have to expand to discover. */
    const shell = el('section', { class: 'lesson-shell', 'aria-label': 'إطار الدرس' });

    const p2 = el('p', { class: 'ls-p2', text: P2 });
    shell.appendChild(p2);

    const details = el('details', { class: 'ls-details' });
    const summary = el('summary', { class: 'ls-summary' });
    /* a drawn icon rather than a raw emoji, for the same reason the game chrome uses G1ICON: an emoji
       becomes an empty box on a device whose font lacks it, and this is the control the teacher taps. */
    const sumIc = el('span', { class: 'ls-sum-ic' });
    const drawnIc = (typeof G1ICON !== 'undefined' && G1ICON.big('📋', 20)) || '';
    if (drawnIc) sumIc.innerHTML = drawnIc; else sumIc.textContent = '📋';
    summary.appendChild(sumIc);
    summary.appendChild(el('b', { text: 'إطار الدرس' }));
    if (L.code) summary.appendChild(el('span', { class: 'ls-code', text: L.code }));
    if (L.title) summary.appendChild(el('span', { class: 'ls-title', text: L.title }));
    summary.appendChild(el('span', { class: 'ls-chev', text: '▾' }));
    details.appendChild(summary);

    const wrap = el('div', { class: 'ls-body' });
    details.appendChild(wrap);
    shell.appendChild(details);

    /* ── الآية + الجذور ── */
    if (L.verse || (L.roots && L.roots.length)) {
      const v = el('div', { class: 'ls-sec ls-verse' });
      v.appendChild(el('h4', { text: 'الآية والجذور' }));
      if (L.verse) {
        v.appendChild(el('p', { class: 'ls-ayah', text: L.verse.text }));
        v.appendChild(el('p', { class: 'ls-ref', text: L.verse.ref }));
      }
      if (L.roots && L.roots.length) {
        const r = el('div', { class: 'ls-roots' });
        r.appendChild(el('span', { class: 'ls-lbl', text: 'الجذور القرآنية' }));
        L.roots.forEach((x) => r.appendChild(el('span', { class: 'ls-root', text: x })));
        v.appendChild(r);
      }
      /* the anti-overreach caution — this is the rule the source documents insist on */
      if (L.note) v.appendChild(el('p', { class: 'ls-note', text: L.note }));
      wrap.appendChild(v);
    }

    /* ── القصة + الأهداف ── */
    const o = el('div', { class: 'ls-sec' });
    o.appendChild(el('h4', { text: 'الأهداف' }));
    if (L.story) o.appendChild(el('p', { class: 'ls-story', text: L.story }));
    if (L.objectives && L.objectives.length) {
      const ol = el('ol', { class: 'ls-objs' });
      L.objectives.forEach((x) => ol.appendChild(el('li', { text: x })));
      o.appendChild(ol);
    }
    wrap.appendChild(o);

    /* ── المحطات: the levels, reframed ── */
    const lv = (typeof GAME !== 'undefined' && GAME.levels) || [];
    if (lv.length) {
      const s = el('div', { class: 'ls-sec' });
      s.appendChild(el('h4', { text: 'المحطات — ثلاث مستويات تمايز' }));
      const grid = el('div', { class: 'ls-stations' });
      lv.forEach((L2, i) => {
        const note = (L.stations && L.stations[i]) || L2.blurb || '';
        const c = el('div', { class: 'ls-station' });
        c.appendChild(el('b', { text: `المحطة ${['١', '٢', '٣', '٤', '٥'][i] || i + 1} · ${L2.name || ''}` }));
        if (note) c.appendChild(el('small', { text: note }));
        grid.appendChild(c);
      });
      s.appendChild(grid);
      if (L.blocks && L.blocks.length) {
        s.appendChild(el('p', { class: 'ls-blocks', text: 'التسلسل الزمني: ' + L.blocks.join(' ← ') }));
      }
      wrap.appendChild(s);
    }

    /* ── الخروج ── */
    if (L.exit && L.exit.length) {
      const x = el('div', { class: 'ls-sec' });
      x.appendChild(el('h4', { text: 'بطاقة الخروج' }));
      const ol = el('ol', { class: 'ls-exit' });
      L.exit.forEach((item) => {
        const li = el('li');
        li.appendChild(el('span', { class: 'ls-grade', text: (item.grade || '') }));
        li.appendChild(el('span', { text: item.text }));
        ol.appendChild(li);
      });
      x.appendChild(ol);
      if (L.criterion) x.appendChild(el('p', { class: 'ls-crit', text: 'معيار النجاح: ' + L.criterion }));
      wrap.appendChild(x);
    }

    /* ── الواجب + المراجعة ── */
    if ((L.homework && L.homework.length) || L.reflect) {
      const hw = el('div', { class: 'ls-sec' });
      if (L.homework && L.homework.length) {
        hw.appendChild(el('h4', { text: 'الواجب — بلا شاشات' }));
        const ul = el('ul', { class: 'ls-hw' });
        L.homework.forEach((t) => ul.appendChild(el('li', { text: t })));
        hw.appendChild(ul);
      }
      if (L.reflect) {
        hw.appendChild(el('h4', { text: 'المراجعة' }));
        hw.appendChild(el('p', { class: 'ls-reflect', text: L.reflect }));
      }
      wrap.appendChild(hw);
    }

    return shell;
  }

  /* ---------- mount on every home render ---------- */
  function mount() {
    const home = document.querySelector('#stage .home');
    if (!home || home.querySelector('.lesson-shell')) return;
    home.appendChild(panel());
  }

  function start() {
    mount();
    const stage = document.getElementById('stage');
    if (stage && !start.__obs) {
      start.__obs = new MutationObserver(() => { try { mount(); } catch (e) { /* never break the game */ } });
      start.__obs.observe(stage, { childList: true, subtree: true });
    }
    setTimeout(() => { try { mount(); } catch (e) { /* fine */ } }, 60);
    setTimeout(() => { try { mount(); } catch (e) { /* fine */ } }, 420);
  }

  return { start, panel, P2 };
})();

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => setTimeout(() => { try { G1LESSON.start(); } catch (e) { /* never break the game */ } }, 0));
}

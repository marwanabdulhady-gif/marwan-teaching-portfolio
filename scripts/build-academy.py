#!/usr/bin/env python3
"""Build a self-contained, Marwan-branded Mathematics Academy under public/academy/
and AI Studio preview assets under public/studio/ from drmathazzam-clone/.

Rewrites all root-relative URLs to /academy/... (with explicit /index.html on
internal page routes so Vite dev server, vite preview, Vercel, and static hosts
all resolve every link without SPA fallback collisions), removes third-party
author branding, hides inert login/signup links, and upgrades the client-side
AI Tutor + theme synchronization.
"""
import json
import os
import re
import shutil
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "drmathazzam-clone")
OUT = os.path.join(ROOT, "public", "academy")
STUDIO_OUT = os.path.join(ROOT, "public", "studio")

LOGO_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 300" width="900" height="300" role="img" aria-label="Marwan Abdulhady Mathematics Hub">
  <defs>
    <linearGradient id="mGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e8553d"/>
      <stop offset="100%" stop-color="#f2b33d"/>
    </linearGradient>
  </defs>
  <g transform="translate(36, 42)">
    <rect x="0" y="0" width="216" height="216" rx="48" fill="#14213d"/>
    <circle cx="108" cy="108" r="74" fill="none" stroke="url(#mGrad)" stroke-width="8" stroke-dasharray="14 10" opacity="0.85"/>
    <polygon points="108,44 166,154 50,154" fill="none" stroke="#fdf8f0" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="108" cy="118" r="14" fill="#f2b33d"/>
  </g>
  <text x="284" y="148" fill="#14213d" font-family="Georgia, 'Playfair Display', serif" font-size="68" font-weight="700" letter-spacing="-1">Marwan Abdulhady</text>
  <text x="288" y="206" fill="#e8553d" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="30" font-weight="700" letter-spacing="6">MATHEMATICS HUB</text>
</svg>
"""

MARK_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" role="img" aria-label="Marwan Mathematics Hub">
  <rect x="4" y="4" width="120" height="120" rx="28" fill="#14213d"/>
  <circle cx="64" cy="64" r="44" fill="none" stroke="#e8553d" stroke-width="5" stroke-dasharray="8 6"/>
  <polygon points="64,26 98,92 30,92" fill="none" stroke="#fdf8f0" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="64" cy="70" r="9" fill="#f2b33d"/>
</svg>
"""

INJECTED_HEAD_STYLE = """<style id="marwan-academy-overrides">
  /* Hide inert auth links so visitors stay inside live learning workflows */
  a[href*="/teacher-login"],
  a[href*="/student-login"],
  a[href*="/sign-up"] {
    display: none !important;
  }
</style>"""


def rewrite_page_href(raw_url: str) -> str:
    """Rewrite a root-relative URL (/...) to /academy/... with /index.html on page routes."""
    if not raw_url.startswith("/") or raw_url.startswith("//") or raw_url.startswith("/academy/"):
        return raw_url

    # Split query and hash
    hash_part = ""
    if "#" in raw_url:
        raw_url, hash_part = raw_url.split("#", 1)
        hash_part = "#" + hash_part

    query_part = ""
    if "?" in raw_url:
        raw_url, query_part = raw_url.split("?", 1)
        query_part = "?" + query_part

    path = raw_url

    # Brand logo replacements
    if path == "/assets/brand/dr-math-azzam-logo.png":
        return "/academy/assets/brand/marwan-math-logo.svg" + query_part + hash_part
    if path == "/assets/brand/dr-math-azzam-mark.png":
        return "/academy/assets/brand/marwan-math-mark.svg" + query_part + hash_part

    # Static files (assets, favicon, .webp, .css, .js, .ico, .woff2, etc.)
    base_ext = os.path.splitext(path)[1].lower()
    if path.startswith("/assets/") or base_ext in {
        ".css", ".js", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico",
        ".woff", ".woff2", ".ttf", ".json", ".pdf", ".txt"
    }:
        return "/academy" + path + query_part + hash_part

    # API routes stay untouched (handled gracefully in JS)
    if path.startswith("/api/"):
        return path + query_part + hash_part

    # Page routes -> /academy/.../index.html
    clean = path.strip("/")
    if not clean:
        return "/academy/index.html" + query_part + hash_part
    if clean.endswith("/index.html") or clean == "index.html":
        return "/academy/" + clean + query_part + hash_part
    return f"/academy/{clean}/index.html{query_part}{hash_part}"


ATTR_RE = re.compile(r'(\b(?:href|src|action)=)(["\'])(/[^"\']*)\2')


def rebrand_text(html: str) -> str:
    """Replace Dr. Math Azzam / Kuwait National Exam branding with Marwan Abdulhady."""
    replacements = [
        ("DR. MATH AZZAM", "MARWAN ABDULHADY"),
        ("Dr. Math Azzam Platform", "Marwan Abdulhady Mathematics Hub"),
        ("Dr. Math Calculus AI Tutor", "Marwan Mathematics AI Tutor"),
        ("A gift to educators from Dr. Math Azzam.", "Designed for educators by Mr. Marwan Abdulhady."),
        ("by Dr. Ahmed Azzam", "by Mr. Marwan Abdulhady"),
        ("Dr. Ahmed Azzam", "Mr. Marwan Abdulhady"),
        ("Mr. Ahmed Azzam", "Mr. Marwan Abdulhady"),
        ("Dr. Math Azzam", "Marwan Abdulhady"),
        ("Mr. Azzam’s", "Mr. Marwan’s"),
        ("Mr. Azzam's", "Mr. Marwan's"),
        ("Mr. Azzam", "Mr. Marwan"),
        ("Mr.%20Azzam", "Mr.%20Marwan"),
        ("Kuwait National Exam", "International Exam Prep"),
        ("kuwait-national-exam-name", "international-exam-name"),
        ("https://drmathazzam.app", "/"),
        ("drmathazzam.app", "marwan-teaching-portfolio"),
    ]
    for old, new in replacements:
        html = html.replace(old, new)
    return html


def transform_html(html: str) -> str:
    # 1. Rewrite guided-answers JSON CTA links if present
    def fix_guided_json(match: re.Match) -> str:
        prefix, body, suffix = match.group(1), match.group(2), match.group(3)
        try:
            data = json.loads(body)
            for q in data.values():
                if isinstance(q, dict) and isinstance(q.get("cta"), dict) and q["cta"].get("href"):
                    q["cta"]["href"] = rewrite_page_href(q["cta"]["href"])
            body = json.dumps(data, ensure_ascii=False)
        except Exception:
            pass
        return prefix + body + suffix

    html = re.sub(
        r'(<script[^>]*id=["\']guided-answers["\'][^>]*>)(.*?)(</script>)',
        fix_guided_json,
        html,
        flags=re.S,
    )

    # 2. Rewrite href/src/action attributes starting with "/"
    html = ATTR_RE.sub(lambda m: f"{m.group(1)}{m.group(2)}{rewrite_page_href(m.group(3))}{m.group(2)}", html)

    # 2b. Clean duplicate data-running attributes from static clone snapshots
    html = re.sub(r'data-running="true"\s+data-running="(?:true|false)"', 'data-running="true"', html)

    # 3. Rebrand text
    html = rebrand_text(html)

    # 4. Inject style overrides before </head>
    if "marwan-academy-overrides" not in html and "</head>" in html:
        html = html.replace("</head>", INJECTED_HEAD_STYLE + "</head>", 1)

    return html


SMART_TUTOR_AND_BRIDGE_JS = r"""
/* ============================================================
   INTERACTIVE LESSON GRAPH LABS & CONTINUOUS MOTION ENGINE
   Brings static SSR math graphs, sliders, and "Play motion"
   controls to life across /academy/index.html and all lessons.
   ============================================================ */
(function () {
  'use strict';

  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ------------------------------------------------------------
     A. Home SVG Continuous 60fps Enhancer (/academy/index.html)
     ------------------------------------------------------------ */
  function initHomeContinuousMotion() {
    var frames = qa('.home-module__oe3DtG__motionFrame');
    if (!frames.length) return;

    // Ensure Precalculus curve uses SVG transform attribute cleanly instead of CSS px mismatch
    var preFrame = q('.home-module__oe3DtG__precalculus');
    var preGroup = preFrame && q('.home-module__oe3DtG__transformedCurve', preFrame);
    if (preGroup) {
      preGroup.style.animation = 'none';
      preGroup.style.transform = 'none';
    }

    // Smooth continuous secant sweep on Calculus card instead of 3s step-end freezes
    var calcFrame = q('.home-module__oe3DtG__calculus');
    var calcSvg = calcFrame && q('svg', calcFrame);
    var liveSecGroup = null;
    if (calcSvg) {
      qa('.home-module__oe3DtG__secant', calcSvg).forEach(function (g) {
        g.style.animation = 'none';
        g.style.opacity = '0';
      });
      liveSecGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      liveSecGroup.innerHTML =
        '<line stroke="#d97706" stroke-width="2.3"></line>' +
        '<circle r="5" fill="#d97706" stroke="#ffffff" stroke-width="1.8"></circle>';
      calcSvg.appendChild(liveSecGroup);
    }

    // Add live continuous gold tracer on Featured f(x)=x^2 lens
    var conceptFrame = q('.home-module__oe3DtG__conceptPanel');
    var conceptSvg = conceptFrame && q('svg', conceptFrame);
    var lensTracer = null;
    if (conceptSvg) {
      lensTracer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      lensTracer.innerHTML =
        '<path fill="none" stroke="#f5c84c" stroke-opacity="0.8" stroke-width="1.4" stroke-dasharray="3 4"></path>' +
        '<circle r="8" fill="#f5c84c" fill-opacity="0.2"></circle>' +
        '<circle r="4.5" fill="#f5c84c" stroke="#0a1931" stroke-width="1.8"></circle>';
      conceptSvg.appendChild(lensTracer);
    }

    // GMAT live scanner line
    var gmatFrame = q('.home-module__oe3DtG__gmat');
    var gmatSvg = gmatFrame && q('svg', gmatFrame);
    var gmatScan = null;
    if (gmatSvg) {
      gmatScan = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gmatScan.setAttribute('x1', '65');
      gmatScan.setAttribute('x2', '299');
      gmatScan.setAttribute('stroke', '#d97706');
      gmatScan.setAttribute('stroke-width', '1.6');
      gmatScan.setAttribute('stroke-dasharray', '4 3');
      gmatSvg.appendChild(gmatScan);
    }

    var clocks = { concept: 0, calc: 0, pre: 0, gmat: 0 };
    var last = performance.now();

    function tick(now) {
      var dt = Math.min(0.064, (now - last) / 1000);
      last = now;

      if (conceptFrame && conceptFrame.getAttribute('data-running') !== 'false' && lensTracer) {
        clocks.concept += dt;
        var x = -2 * Math.cos(clocks.concept * 0.85);
        var cx = 145 + 48 * x;
        var cy = 195 - 34 * x * x;
        var proj = lensTracer.children[0];
        var halo = lensTracer.children[1];
        var dot = lensTracer.children[2];
        proj.setAttribute('d', 'M' + cx.toFixed(1) + ' 195 V' + cy.toFixed(1) + ' H145');
        halo.setAttribute('cx', cx.toFixed(1));
        halo.setAttribute('cy', cy.toFixed(1));
        dot.setAttribute('cx', cx.toFixed(1));
        dot.setAttribute('cy', cy.toFixed(1));
      }

      if (calcFrame && calcFrame.getAttribute('data-running') !== 'false' && liveSecGroup) {
        clocks.calc += dt;
        // Original Bezier M7 104 Q139 302 271 16 parameterized by u in [0, 1]; P(1,1) is at u = 7/11 (~0.63636 -> (175,160))
        var uP = 7 / 11;
        var du = 0.04 + 0.30 * (0.5 + 0.5 * Math.cos(clocks.calc * 0.9));
        var uQ = uP + du;
        var qx = (1 - uQ) * (1 - uQ) * 7 + 2 * (1 - uQ) * uQ * 139 + uQ * uQ * 271;
        var qy = (1 - uQ) * (1 - uQ) * 104 + 2 * (1 - uQ) * uQ * 302 + uQ * uQ * 16;
        var px = 175, py = 160;
        var mSvg = (qy - py) / ((qx - px) || 0.001);
        var x1 = 90, y1 = py + mSvg * (x1 - px);
        var x2 = 315, y2 = py + mSvg * (x2 - px);
        var ln = liveSecGroup.children[0];
        var pt = liveSecGroup.children[1];
        ln.setAttribute('x1', x1.toFixed(1));
        ln.setAttribute('y1', y1.toFixed(1));
        ln.setAttribute('x2', x2.toFixed(1));
        ln.setAttribute('y2', y2.toFixed(1));
        pt.setAttribute('cx', qx.toFixed(1));
        pt.setAttribute('cy', qy.toFixed(1));
      }

      if (preFrame && preFrame.getAttribute('data-running') !== 'false' && preGroup) {
        clocks.pre += dt;
        var shift = 25 + 25 * Math.sin(clocks.pre * 1.15); // 0 -> 50 -> 0 in SVG units
        preGroup.setAttribute('transform', 'translate(' + shift.toFixed(2) + ', 0)');
      }

      if (gmatFrame && gmatFrame.getAttribute('data-running') !== 'false' && gmatScan) {
        clocks.gmat += dt;
        var mix = 0.5 - 0.5 * Math.cos(clocks.gmat * 1.35);
        var sy = 138 - 48 * mix;
        gmatScan.setAttribute('y1', sy.toFixed(1));
        gmatScan.setAttribute('y2', sy.toFixed(1));
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------
     B. Lesson 2.6 Related Rates ("Play motion" + Simulator)
     ------------------------------------------------------------ */
  function initRelatedRatesLabs() {
    qa('[data-lab-workspace="true"]').forEach(function (ws) {
      var svg = q('svg[viewBox="0 0 420 260"]', ws);
      var range = q('input[type="range"]', ws);
      var num = q('input[type="number"]', ws);
      if (!svg || !range) return;

      var motionCtrl = q('[data-motion-controls="true"]', ws);
      var playBtn = motionCtrl && q('button', motionCtrl);
      var statusEl = motionCtrl && q('[data-motion-status="true"]', motionCtrl);
      var timeEl = motionCtrl && q('[data-motion-time="true"]', motionCtrl);
      var summaryEl = q('[data-motion-summary="true"]', ws);
      var growthEl = q('[data-motion-growth="true"]', ws);
      var aria = svg.getAttribute('aria-label') || '';
      var section = ws.closest('section') || ws.parentElement;
      var resetBtn = section && qa('button', section).filter(function (b) {
        return /Reset activity/i.test(b.textContent || '');
      })[0];

      var initialVal = parseFloat(range.value) || 0;
      var minVal = parseFloat(range.min) || 0;
      var maxVal = parseFloat(range.max) || 10;
      var playing = false;
      var rafId = 0;
      var lastTs = 0;

      function updateLadderSvg(xFt) {
        var yFt = Math.sqrt(Math.max(0.01, 225 - xFt * xFt));
        var xSvg = 50 + 13 * xFt;
        var ySvg = 220 - 13 * yFt;
        var ladder = q('[data-ladder="true"]', svg);
        var circles = qa('circle', svg);
        var texts = qa('text', svg);
        if (ladder) {
          ladder.setAttribute('x1', '50');
          ladder.setAttribute('y1', ySvg.toFixed(2));
          ladder.setAttribute('x2', xSvg.toFixed(2));
          ladder.setAttribute('y2', '220');
        }
        if (circles.length >= 2) {
          circles[0].setAttribute('cx', xSvg.toFixed(2));
          circles[0].setAttribute('cy', '220');
          circles[1].setAttribute('cx', '50');
          circles[1].setAttribute('cy', ySvg.toFixed(2));
        }
        if (texts[0]) texts[0].textContent = 'x = ' + xFt.toFixed(2) + ' ft';
        if (texts[1]) texts[1].textContent = 'y = ' + yFt.toFixed(2) + ' ft';
        return yFt;
      }

      function renderAt(v) {
        v = Math.max(minVal, Math.min(maxVal, v));
        range.value = String(v);
        if (num) num.value = String(Math.round(v * 100) / 100);

        if (/Sphere cross section/i.test(aria)) {
          // Filling balloon: V0 = (4/3)*pi*10^3, inflow dV/dt = 5 cm^3/min
          var v0 = (4 / 3) * Math.PI * 1000;
          var vol = v0 + 5 * v;
          var rCm = Math.pow((3 * vol) / (4 * Math.PI), 1 / 3);
          var drdt = 5 / (4 * Math.PI * rCm * rCm);
          // Exaggerate visual radius delta slightly so growth is clearly visible while keeping r accurate
          var rPx = 60 + (rCm - 10) * 32;
          var c = q('circle', svg);
          var ln = q('line', svg);
          var txts = qa('text', svg);
          if (c) c.setAttribute('r', rPx.toFixed(2));
          if (ln) ln.setAttribute('x2', (180 + rPx).toFixed(2));
          if (txts[0]) txts[0].textContent = 'r = ' + rCm.toFixed(2) + ' cm';
          if (timeEl) timeEl.textContent = v.toFixed(1) + ' / 60 min';
          if (summaryEl) summaryEl.textContent = 'r = ' + rCm.toFixed(3) + ' cm; dr/dt = ' + drdt.toFixed(5) + ' cm/min.';
          if (growthEl) growthEl.textContent = 'Added volume: +' + (5 * v).toFixed(1) + ' cm³; radius: +' + (rCm - 10).toFixed(3) + ' cm.';
        } else if (/15 ft ladder.*base 10/i.test(aria)) {
          // Moving ladder: x(t) = 10 - 0.25*t, dx/dt = -0.25 ft/s
          var xFt = 10 - 0.25 * v;
          var yFt = updateLadderSvg(xFt);
          var dydt = (0.25 * xFt) / yFt;
          if (timeEl) timeEl.textContent = v.toFixed(1) + ' / 12 s';
          if (summaryEl) summaryEl.textContent = 'x = ' + xFt.toFixed(2) + ' ft, y = ' + yFt.toFixed(2) + ' ft; dy/dt = ' + dydt.toFixed(4) + ' ft/s.';
        } else if (/15 ft ladder/i.test(aria)) {
          // Static/Interactive Related Rates Simulator (x slider directly in ft)
          updateLadderSvg(v);
        } else if (/Cone radius 5 ft/i.test(aria)) {
          // Draining cone: R=5, H=14, h0=12, leak dV/dt = -2 ft^3/hr
          var coeff = (25 * Math.PI) / 588; // V = coeff * h^3
          var vInit = coeff * Math.pow(12, 3);
          var vNow = Math.max(0.5, vInit - 2 * v);
          var hFt = Math.pow(vNow / coeff, 1 / 3);
          var rFt = (5 / 14) * hFt;
          var dhdt = -2 / ((25 * Math.PI / 196) * hFt * hFt);
          var yWater = 220 - 13 * hFt;
          var xLeft = 210 - 13 * rFt;
          var xRight = 210 + 13 * rFt;
          var waterPath = q('[data-water="true"]', svg);
          var waterLine = q('line', svg);
          var cTexts = qa('text', svg);
          if (waterPath) waterPath.setAttribute('d', 'M' + xLeft.toFixed(2) + ' ' + yWater.toFixed(2) + ' L210 220 L' + xRight.toFixed(2) + ' ' + yWater.toFixed(2) + ' Z');
          if (waterLine) {
            waterLine.setAttribute('x1', xLeft.toFixed(2));
            waterLine.setAttribute('y1', yWater.toFixed(2));
            waterLine.setAttribute('x2', xRight.toFixed(2));
            waterLine.setAttribute('y2', yWater.toFixed(2));
          }
          if (cTexts[2]) cTexts[2].textContent = 'h = ' + hFt.toFixed(2) + ' ft';
          if (timeEl) timeEl.textContent = v.toFixed(1) + ' / 60 hr';
          if (summaryEl) summaryEl.textContent = 'h = ' + hFt.toFixed(3) + ' ft; dh/dt = ' + dhdt.toFixed(4) + ' ft/hr.';
        } else if (/12 ft lamp/i.test(aria)) {
          // Moving shadow: person walks at 2 ft/s from x0 = 4 ft
          var xDist = 4 + 2 * v;
          var shadow = (5.5 / 6.5) * xDist;
          var tip = xDist + shadow;
          var personX = 35 + 9 * xDist;
          var tipX = 35 + 9 * tip;
          var lines = qa('line', svg);
          // lines: [0]=ground, [1]=lamp, [2]=person, [3]=light-ray, [4]=shadow
          if (lines[2]) {
            lines[2].setAttribute('x1', personX.toFixed(2));
            lines[2].setAttribute('x2', personX.toFixed(2));
          }
          var ray = q('[data-light-ray="true"]', svg);
          if (ray) ray.setAttribute('x2', tipX.toFixed(2));
          if (lines[4]) {
            lines[4].setAttribute('x1', personX.toFixed(2));
            lines[4].setAttribute('x2', tipX.toFixed(2));
          }
          var sTexts = qa('text', svg);
          if (sTexts[2]) sTexts[2].textContent = 'x = ' + xDist.toFixed(2) + ' ft · shadow = ' + shadow.toFixed(2) + ' ft';
          if (timeEl) timeEl.textContent = v.toFixed(1) + ' / 8 s';
          if (summaryEl) summaryEl.textContent = 'Shadow = ' + shadow.toFixed(2) + ' ft; tip = ' + tip.toFixed(2) + ' ft from pole.';
        }
      }

      function stopPlay(done) {
        playing = false;
        if (rafId) cancelAnimationFrame(rafId);
        if (playBtn) {
          playBtn.textContent = 'Play motion';
          playBtn.setAttribute('aria-pressed', 'false');
        }
        if (statusEl) statusEl.textContent = done ? 'Complete' : 'Paused';
      }

      function stepPlay(ts) {
        if (!playing) return;
        var dt = lastTs ? Math.min(0.064, (ts - lastTs) / 1000) : 0.016;
        lastTs = ts;
        // Advance quickly enough to feel lively (full span in ~8 seconds)
        var speed = Math.max(1, (maxVal - minVal) / 8);
        var cur = parseFloat(range.value) || 0;
        var next = cur + speed * dt;
        if (next >= maxVal) {
          renderAt(maxVal);
          // Loop smoothly so continuous motion keeps demonstrating the rate!
          next = minVal;
        }
        renderAt(next);
        rafId = requestAnimationFrame(stepPlay);
      }

      if (playBtn) {
        playBtn.addEventListener('click', function () {
          if (playing) {
            stopPlay(false);
          } else {
            if ((parseFloat(range.value) || 0) >= maxVal) renderAt(minVal);
            playing = true;
            lastTs = 0;
            playBtn.textContent = 'Pause motion';
            playBtn.setAttribute('aria-pressed', 'true');
            if (statusEl) statusEl.textContent = 'Playing';
            rafId = requestAnimationFrame(stepPlay);
          }
        });
      }

      range.addEventListener('input', function () {
        if (playing) stopPlay(false);
        renderAt(parseFloat(range.value) || minVal);
      });
      if (num) {
        num.addEventListener('input', function () {
          var v = parseFloat(num.value);
          if (!isNaN(v)) renderAt(v);
        });
      }
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          stopPlay(false);
          if (statusEl) statusEl.textContent = 'Ready';
          renderAt(initialVal);
        });
      }
    });
  }

  /* ------------------------------------------------------------
     C. Lesson 2.1 Secant-to-Tangent & Lesson 2.5 Implicit Circle
     ------------------------------------------------------------ */
  function initSecantAndImplicitLabs() {
    // 1. Lesson 2.1: Horizontal change h
    var hRange = q('input[type="range"][aria-label="Horizontal change h"]');
    if (hRange) {
      var ws = hRange.closest('[data-lab-workspace="true"]') || hRange.parentElement.parentElement.parentElement;
      var svg = ws && q('svg[viewBox="0 0 430 260"]', ws);
      var hNum = ws && q('input[type="number"][aria-label*="Horizontal change h"]', ws);
      var secLine = svg && q('[data-secant-line="true"]', svg);
      var circles = svg ? qa('circle', svg) : [];
      var texts = svg ? qa('text', svg) : [];
      var readout = ws && qa('p', ws).filter(function (p) { return /Secant:/i.test(p.textContent || ''); })[0];

      // Coordinate system from SVG: xSvg(x) = 74.78481 + 93.670886 * x, ySvg(y) = 224 - 29.714286 * y
      // f(x) = 0.5 * x^2 + 0.65; P = (1, 1.15)
      function updateSecant(h) {
        h = Math.max(-0.8, Math.min(2, h));
        if (Math.abs(h) < 0.02) h = h >= 0 ? 0.02 : -0.02;
        hRange.value = String(h);
        if (hNum) hNum.value = h.toFixed(2);
        var xQ = 1 + h;
        var yQ = 0.5 * xQ * xQ + 0.65;
        var slope = 1 + 0.5 * h;
        var qCx = 74.78481 + 93.670886 * xQ;
        var qCy = 224 - 29.714286 * yQ;

        // Line from xSvg = 42 (x = -0.35) to xSvg = 412 (x = 3.60)
        var xL = (42 - 74.78481) / 93.670886;
        var xR = (412 - 74.78481) / 93.670886;
        var yL = 224 - 29.714286 * (1.15 + slope * (xL - 1));
        var yR = 224 - 29.714286 * (1.15 + slope * (xR - 1));

        if (secLine) {
          secLine.setAttribute('y1', yL.toFixed(2));
          secLine.setAttribute('y2', yR.toFixed(2));
        }
        if (circles[1]) {
          circles[1].setAttribute('cx', qCx.toFixed(2));
          circles[1].setAttribute('cy', qCy.toFixed(2));
        }
        var qTxt = texts.filter(function (t) { return (t.textContent || '').trim() === 'Q'; })[0];
        if (qTxt) {
          qTxt.setAttribute('x', (qCx + 9).toFixed(2));
          qTxt.setAttribute('y', (qCy - 8).toFixed(2));
        }
        if (readout) {
          readout.textContent = 'h = ' + h.toFixed(2) + ' · Secant: ' + slope.toFixed(3);
        }
      }

      // Add a Play/Pause motion button right above the slider!
      var animPlaying = false, animRaf = 0, animT = 0;
      var playBtn = document.createElement('button');
      playBtn.type = 'button';
      playBtn.className = 'min-h-10 rounded-xl border bg-background px-3.5 py-1.5 text-xs font-semibold hover:bg-muted mb-2';
      playBtn.textContent = '▶ Play secant → tangent motion';
      hRange.parentElement.insertBefore(playBtn, hRange.parentElement.firstChild);

      playBtn.addEventListener('click', function () {
        animPlaying = !animPlaying;
        playBtn.textContent = animPlaying ? '⏸ Pause motion' : '▶ Play secant → tangent motion';
        if (animPlaying) {
          var last = performance.now();
          var loop = function (now) {
            if (!animPlaying) return;
            animT += Math.min(0.06, (now - last) / 1000);
            last = now;
            var hVal = 0.6 + 1.35 * Math.cos(animT * 1.1);
            updateSecant(hVal);
            animRaf = requestAnimationFrame(loop);
          };
          animRaf = requestAnimationFrame(loop);
        } else {
          cancelAnimationFrame(animRaf);
        }
      });

      hRange.addEventListener('input', function () {
        if (animPlaying) { animPlaying = false; playBtn.textContent = '▶ Play secant → tangent motion'; }
        updateSecant(parseFloat(hRange.value) || 0.5);
      });
      if (hNum) {
        hNum.addEventListener('input', function () {
          var v = parseFloat(hNum.value);
          if (!isNaN(v)) updateSecant(v);
        });
      }
    }

    // 2. Lesson 2.5: Implicit Circle x^2 + y^2 = 16 (center 150,150, r=112 => 28px/unit)
    var pRange = q('input[type="range"][aria-label="Point x-coordinate"]');
    if (pRange) {
      var ws2 = pRange.closest('[data-lab-workspace="true"]') || pRange.parentElement.parentElement.parentElement;
      var svg2 = ws2 && q('svg[viewBox="0 0 300 300"]', ws2);
      var pNum = ws2 && q('input[type="number"]', ws2);
      if (svg2) {
        var tanLine = q('g[clip-path] line', svg2);
        var ptCircle = qa('circle', svg2)[1];
        var pLabel = qa('text', svg2).filter(function (t) { return (t.textContent || '').trim() === 'P'; })[0];

        function updateImplicit(xVal) {
          xVal = Math.max(-3.8, Math.min(3.8, xVal));
          pRange.value = String(xVal);
          if (pNum) pNum.value = xVal.toFixed(2);
          var yVal = Math.sqrt(Math.max(0.04, 16 - xVal * xVal));
          var slope = -xVal / yVal;
          var cx = 150 + 28 * xVal;
          var cy = 150 - 28 * yVal;
          if (ptCircle) {
            ptCircle.setAttribute('cx', cx.toFixed(2));
            ptCircle.setAttribute('cy', cy.toFixed(2));
          }
          if (pLabel) {
            pLabel.setAttribute('x', (cx + 8).toFixed(2));
            pLabel.setAttribute('y', (cy - 8).toFixed(2));
          }
          if (tanLine) {
            var x1 = xVal - 3.5, y1 = yVal + slope * -3.5;
            var x2 = xVal + 3.5, y2 = yVal + slope * 3.5;
            tanLine.setAttribute('x1', (150 + 28 * x1).toFixed(2));
            tanLine.setAttribute('y1', (150 - 28 * y1).toFixed(2));
            tanLine.setAttribute('x2', (150 + 28 * x2).toFixed(2));
            tanLine.setAttribute('y2', (150 - 28 * y2).toFixed(2));
          }
        }

        var impPlaying = false, impT = 0;
        var impBtn = document.createElement('button');
        impBtn.type = 'button';
        impBtn.className = 'min-h-10 rounded-xl border bg-background px-3.5 py-1.5 text-xs font-semibold hover:bg-muted mb-2';
        impBtn.textContent = '▶ Play tangent glide';
        pRange.parentElement.insertBefore(impBtn, pRange.parentElement.firstChild);
        impBtn.addEventListener('click', function () {
          impPlaying = !impPlaying;
          impBtn.textContent = impPlaying ? '⏸ Pause motion' : '▶ Play tangent glide';
          if (impPlaying) {
            var last = performance.now();
            var loop = function (now) {
              if (!impPlaying) return;
              impT += Math.min(0.06, (now - last) / 1000);
              last = now;
              updateImplicit(3.4 * Math.sin(impT * 1.1));
              requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);
          }
        });

        pRange.addEventListener('input', function () {
          impPlaying = false;
          impBtn.textContent = '▶ Play tangent glide';
          updateImplicit(parseFloat(pRange.value) || 2.4);
        });
        if (pNum) {
          pNum.addEventListener('input', function () {
            var v = parseFloat(pNum.value);
            if (!isNaN(v)) updateImplicit(v);
          });
        }
      }
    }
  }

  /* ------------------------------------------------------------
     D. Precalculus Lesson 2.6 HSRV Transformation Lab
     ------------------------------------------------------------ */
  function initHsrvLab() {
    var aSlider = q('input[type="range"][aria-label="a slider"]');
    var bSlider = q('input[type="range"][aria-label="b slider"]');
    var hSlider = q('input[type="range"][aria-label="h slider"]');
    var kSlider = q('input[type="range"][aria-label="k slider"]');
    if (!aSlider || !bSlider || !hSlider || !kSlider) return;

    var root = aSlider.closest('section') || aSlider.closest('.grid') || document.body;
    var aNum = q('input[type="number"][aria-label="Parameter a"]', root);
    var bNum = q('input[type="number"][aria-label="Parameter b"]', root);
    var hNum = q('input[type="number"][aria-label="Parameter h"]', root);
    var kNum = q('input[type="number"][aria-label="Parameter k"]', root);
    var curvePath = q('path[stroke="#f97360"]', root);
    var svg = curvePath && curvePath.closest('svg');
    var guideGroups = svg ? qa('g[style*="cursor:pointer"]', svg) : [];
    var playBtn = qa('.hsrv-stages button', root).filter(function (b) { return /^Play|Pause$/i.test((b.textContent || '').trim()); })[0];
    var zoomBtns = qa('.hsrv-zoom button', root);
    var guideChk = q('.hsrv-zoom input[type="checkbox"]', root);

    var scale = 32.5; // 1 math unit = 32.5 SVG units around origin (360, 260)
    var ox = 360, oy = 260;

    function renderHsrv() {
      var a = parseFloat(aSlider.value); if (isNaN(a)) a = 1;
      var b = parseFloat(bSlider.value); if (isNaN(b) || Math.abs(b) < 0.1) b = b < 0 ? -0.25 : 0.25;
      var h = parseFloat(hSlider.value); if (isNaN(h)) h = 0;
      var k = parseFloat(kSlider.value); if (isNaN(k)) k = 0;

      if (aNum) aNum.value = String(a);
      if (bNum) bNum.value = String(b);
      if (hNum) hNum.value = String(h);
      if (kNum) kNum.value = String(k);

      // g(x) = a * |b*x - h| + k
      if (curvePath) {
        var pts = [];
        for (var i = 0; i <= 160; i++) {
          var xMath = -11 + (i / 160) * 22;
          var yMath = a * Math.abs(b * xMath - h) + k;
          var sx = ox + scale * xMath;
          var sy = oy - scale * yMath;
          pts.push((i === 0 ? 'M ' : 'L ') + sx.toFixed(2) + ' ' + sy.toFixed(2));
        }
        curvePath.setAttribute('d', pts.join(' '));
      }

      // Guide points for u = b*x - h in [-2, -1, 0, 1, 2] => x = (u + h) / b, y = a*|u| + k
      var baseU = [-2, -1, 0, 1, 2];
      guideGroups.forEach(function (g, idx) {
        var c = q('circle', g);
        if (!c || baseU[idx] == null) return;
        var u = baseU[idx];
        var xm = (u + h) / b;
        var ym = a * Math.abs(u) + k;
        c.setAttribute('cx', (ox + scale * xm).toFixed(2));
        c.setAttribute('cy', (oy - scale * ym).toFixed(2));
      });
    }

    [[aSlider, aNum], [bSlider, bNum], [hSlider, hNum], [kSlider, kNum]].forEach(function (pair) {
      pair[0].addEventListener('input', renderHsrv);
      if (pair[1]) {
        pair[1].addEventListener('input', function () {
          pair[0].value = pair[1].value;
          renderHsrv();
        });
      }
    });

    if (guideChk) {
      guideChk.addEventListener('change', function () {
        guideGroups.forEach(function (g) { g.style.display = guideChk.checked ? '' : 'none'; });
      });
    }

    zoomBtns.forEach(function (zb) {
      zb.addEventListener('click', function () {
        var txt = (zb.textContent || '').trim();
        if (/Zoom \+/.test(txt)) scale = Math.min(65, scale * 1.2);
        else if (/Zoom/.test(txt)) scale = Math.max(16, scale / 1.2);
        else {
          scale = 32.5;
          aSlider.value = '1'; bSlider.value = '1'; hSlider.value = '0'; kSlider.value = '0';
        }
        renderHsrv();
      });
    });

    if (playBtn) {
      var playing = false, tAnim = 0;
      playBtn.addEventListener('click', function () {
        playing = !playing;
        playBtn.textContent = playing ? 'Pause' : 'Play';
        if (playing) {
          var last = performance.now();
          var step = function (now) {
            if (!playing) return;
            tAnim += Math.min(0.06, (now - last) / 1000);
            last = now;
            hSlider.value = (2.5 * Math.sin(tAnim * 1.1)).toFixed(2);
            kSlider.value = (1.5 * Math.cos(tAnim * 0.85)).toFixed(2);
            aSlider.value = (1.25 + 0.65 * Math.sin(tAnim * 0.7)).toFixed(2);
            renderHsrv();
            requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      });
    }
  }

  /* ------------------------------------------------------------
     E. Universal Slider <-> Number Sync & SVG Tracer Fallback
     ------------------------------------------------------------ */
  function initUniversalSliders() {
    qa('input[type="range"]').forEach(function (r) {
      var lbl = r.getAttribute('aria-label') || '';
      if (/Horizontal change h|Point x-coordinate|^[abhk] slider$|Elapsed time|Horizontal distance x/.test(lbl)) {
        return; // already handled with exact geometry above
      }
      var container = r.closest('[data-lab-workspace="true"]') || r.parentElement.parentElement;
      if (!container) return;
      var num = q('input[type="number"]', r.parentElement) || q('input[type="number"]', container);
      var svg = q('svg:not(.lucide)', container);
      var tracer = svg && qa('circle', svg).slice(-1)[0];
      var origCx = tracer ? parseFloat(tracer.getAttribute('cx') || '0') : 0;
      var origVal = parseFloat(r.value) || 0;
      var minV = parseFloat(r.min) || 0;
      var maxV = parseFloat(r.max) || 10;

      function sync(v) {
        r.value = String(v);
        if (num && document.activeElement !== num) num.value = String(v);
        if (tracer && svg && maxV > minV) {
          var vb = (svg.getAttribute('viewBox') || '0 0 400 260').split(/\s+/).map(parseFloat);
          var w = vb[2] || 400;
          var delta = ((v - origVal) / (maxV - minV)) * (w * 0.55);
          tracer.setAttribute('cx', Math.max(24, Math.min(w - 24, origCx + delta)).toFixed(2));
        }
      }
      r.addEventListener('input', function () { sync(parseFloat(r.value) || 0); });
      if (num) {
        num.addEventListener('input', function () {
          var v = parseFloat(num.value);
          if (!isNaN(v)) sync(v);
        });
      }
    });
  }

  function bootLabs() {
    initHomeContinuousMotion();
    initRelatedRatesLabs();
    initSecantAndImplicitLabs();
    initHsrvLab();
    initUniversalSliders();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootLabs);
  } else {
    bootLabs();
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
"""

SMART_TUTOR_REPLACEMENT = r"""/* ============================================================
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
})();"""


def transform_app_js(js: str) -> str:
    # 0. Do not auto-pause SVG motion frames when OS prefers-reduced-motion / Energy Saver is on
    js = js.replace(
        "if (reduce.matches) frame.setAttribute('data-running', 'false');",
        "/* keep illustrations running unless explicitly paused by user */",
    )

    # 1. Update lesson search hrefFor
    js = js.replace(
        "return '/courses/' + l.courseSlug + '/lessons/' + l.id;",
        "return '/academy/courses/' + l.courseSlug + '/lessons/' + l.id + '/index.html';",
    )

    # 2. Update initActiveNav for /academy prefix
    js = js.replace(
        "var active = href === '/' ? path === '/' : (!href.startsWith('/#') && path.indexOf(href) === 0);",
        "var cleanHref = href.replace(/\\/index\\.html$/, '') || '/';\n"
        "      var cleanPath = path.replace(/\\/index\\.html$/, '') || '/';\n"
        "      var active = (cleanHref === '/academy' || cleanHref === '/') ? (cleanPath === '/academy' || cleanPath === '/') : (href.indexOf('#') === -1 && cleanPath.indexOf(cleanHref) === 0);",
    )

    # 3. Update mastery storageKey regex to handle /academy/courses/.../lessons/.../index.html
    js = js.replace(
        "var m = location.pathname.match(/^\\/courses\\/([^/]+)\\/lessons\\/(.+?)\\/?$/);",
        "var m = location.pathname.match(/\\/courses\\/([^/]+)\\/lessons\\/([^/]+?)(?:\\/index\\.html)?\\/?$/);",
    )
    js = js.replace("'drmath:mastery:'", "'marwan:mastery:'")

    # 4. Replace signed-out AI Tutor block with Socratic Mathematics AI Tutor
    tutor_start = js.find("/* ============================================================\n   AI TUTOR ENGINE")
    worked_start = js.find('/* ============================================================\n   "SHOW ALL WORKED STEPS"')
    if tutor_start != -1 and worked_start != -1:
        js = js[:tutor_start] + SMART_TUTOR_REPLACEMENT + "\n\n" + js[worked_start:]

    # 5. Append appearance bridge & standalone back-pill
    js = js + "\n" + SMART_TUTOR_AND_BRIDGE_JS
    return js


def rebrand_studio_webp(src_path: str, dst_path: str) -> None:
    name = os.path.basename(src_path)
    if name not in ("lesson.webp", "video.webp"):
        shutil.copy2(src_path, dst_path)
        return

    im = Image.open(src_path).convert("RGB")
    draw = ImageDraw.Draw(im)
    draw.rectangle([40, 18, 430, 44], fill=(255, 255, 255))
    font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    font = ImageFont.truetype(font_path, 12) if os.path.exists(font_path) else ImageFont.load_default()
    draw.text((44, 23), "Marwan Abdulhady  |  AI Teacher Studio", fill=(20, 33, 61), font=font)
    im.save(dst_path, "WEBP", quality=92)


def main() -> None:
    if os.path.exists(OUT):
        shutil.rmtree(OUT)
    if os.path.exists(STUDIO_OUT):
        shutil.rmtree(STUDIO_OUT)
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(STUDIO_OUT, exist_ok=True)

    html_count = 0
    asset_count = 0

    for root, dirs, files in os.walk(SRC):
        rel_root = os.path.relpath(root, SRC)
        if rel_root == "source" or rel_root.startswith("source" + os.sep):
            continue

        for f in files:
            if rel_root == "." and f == "README.md":
                continue
            src_file = os.path.join(root, f)
            dst_dir = OUT if rel_root == "." else os.path.join(OUT, rel_root)
            os.makedirs(dst_dir, exist_ok=True)
            dst_file = os.path.join(dst_dir, f)

            # Skip old PNG brand files (we write crisp SVG brand files instead)
            if rel_root == os.path.join("assets", "brand") and f.startswith("dr-math-azzam"):
                continue

            if f.endswith(".html"):
                raw = open(src_file, encoding="utf-8").read()
                out_html = transform_html(raw)
                with open(dst_file, "w", encoding="utf-8") as wf:
                    wf.write(out_html)
                html_count += 1
            elif rel_root == os.path.join("assets", "js") and f == "app.js":
                raw_js = open(src_file, encoding="utf-8").read()
                out_js = transform_app_js(raw_js)
                with open(dst_file, "w", encoding="utf-8") as wf:
                    wf.write(out_js)
                asset_count += 1
            elif f.endswith(".css") and (f == "home.css" or f == "0tcqh3wvy2iut.css"):
                raw_css = open(src_file, encoding="utf-8").read()
                # Fix LightningCSS 1px dashoffset unit bug -> unitless 1 for pathLength="1"
                raw_css = raw_css.replace("stroke-dashoffset:1px", "stroke-dashoffset:1")
                # Keep motion controls & animations live even if OS Energy Saver / reduced-motion is active
                raw_css = re.sub(
                    r"@media\s*\(prefers-reduced-motion:reduce\)\s*\{.*?\}\}",
                    "",
                    raw_css,
                    flags=re.S,
                )
                with open(dst_file, "w", encoding="utf-8") as wf:
                    wf.write(raw_css)
                asset_count += 1
            elif "ai-teacher-studio" in rel_root and f.endswith(".webp"):
                rebrand_studio_webp(src_file, dst_file)
                rebrand_studio_webp(src_file, os.path.join(STUDIO_OUT, f))
                asset_count += 1
            else:
                shutil.copy2(src_file, dst_file)
                asset_count += 1

    # Write Marwan brand SVGs
    brand_dir = os.path.join(OUT, "assets", "brand")
    os.makedirs(brand_dir, exist_ok=True)
    with open(os.path.join(brand_dir, "marwan-math-logo.svg"), "w", encoding="utf-8") as wf:
        wf.write(LOGO_SVG)
    with open(os.path.join(brand_dir, "marwan-math-mark.svg"), "w", encoding="utf-8") as wf:
        wf.write(MARK_SVG)

    print(f"Built {html_count} HTML pages and {asset_count + 2} assets into public/academy/ (+ public/studio/).")


if __name__ == "__main__":
    main()

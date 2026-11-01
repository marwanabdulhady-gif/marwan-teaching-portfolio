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

    # 3. Rebrand text
    html = rebrand_text(html)

    # 4. Inject style overrides before </head>
    if "marwan-academy-overrides" not in html and "</head>" in html:
        html = html.replace("</head>", INJECTED_HEAD_STYLE + "</head>", 1)

    return html


SMART_TUTOR_AND_BRIDGE_JS = r"""
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

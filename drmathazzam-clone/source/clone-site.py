#!/usr/bin/env python3
"""Clone every public route of https://drmathazzam.app/ into a static site.

For each route we keep the server-rendered markup verbatim (same Tailwind
utility classes and the same CSS-module hashes), download the assets it
references, and rewrite absolute /_next and /brand URLs to local ones.
Pages are emitted as <route>/index.html so href="/tutor" resolves on a
plain static file server.
"""
import re, os, sys, json, urllib.request, urllib.parse

BASE = 'https://drmathazzam.app'
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
                    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'}
OUT = '/home/user/drmathazzam-clone'

ROUTES = [
    '',
    'tutor',
    'ai-teacher-studio',
    'teacher-login',
    'courses/grade-12-calculus',
    'courses/grade-11-precalculus',
    'courses/kuwait-national-exam',
    'courses/gmat-preparation',
    'courses/grade-12-calculus/discover',
    'courses/grade-11-precalculus/discover',
    'courses/kuwait-national-exam/discover',
]
for l in json.load(open('/home/user/rea-clone/lessons.json', encoding='utf-8')):
    ROUTES.append('courses/%s/lessons/%s' % (l['courseSlug'], l['id']))
# these two render nothing until React hydrates, so they come from the
# post-hydration capture rather than the raw HTML response.
for extra in ('teacher-login', 'courses/kuwait-national-exam'):
    if extra not in ROUTES:
        ROUTES.append(extra)
# routes discovered by crawling the already-cloned pages (practice sets,
# assessments, per-topic GMAT lessons, …)
for _f in ('/home/user/rea-clone/missing-routes.json',):
    if os.path.exists(_f):
        for r in json.load(open(_f, encoding='utf-8')):
            r = r.strip().lstrip('/')
            if r and r not in ROUTES:
                ROUTES.append(r)

CAPTURED = '/home/user/rea-clone/captured'


def captured_path(route):
    name = 'ROOT' if route == '' else route
    return os.path.join(CAPTURED, name + '.html')

cache = {}


def fetch(url):
    if url in cache:
        return cache[url]
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=60) as f:
            data = f.read()
    except Exception as e:
        cache[url] = None
        return None
    cache[url] = data
    return data


CSS_URL_RE = re.compile(r'url\(\s*["\']?([^)"\']+)["\']?\s*\)')
_resolving = set()


def local_asset(url):
    """Download url under assets/ and return its absolute local path.

    Relative url() references inside a stylesheet keep working because the
    original /_next/... directory layout is preserved under assets/site/, so we
    only have to make sure the referenced files are downloaded too.
    """
    path = urllib.parse.urlparse(url).path.lstrip('/')
    if not path:
        return None
    if path.startswith('brand/'):
        rel, prefix = path[len('brand/'):], '/assets/brand/'
        dest = os.path.join(OUT, 'assets', 'brand', rel)
    else:
        rel, prefix = path, '/assets/site/'
        dest = os.path.join(OUT, 'assets', 'site', rel)

    if not os.path.exists(dest):
        data = fetch(url)
        if data is None:
            return None
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        open(dest, 'wb').write(data)

        # follow url() references (KaTeX/webfonts) inside stylesheets
        if dest.endswith('.css') and url not in _resolving:
            _resolving.add(url)
            try:
                for m in CSS_URL_RE.finditer(data.decode('utf-8', 'replace')):
                    ref = m.group(1).strip()
                    if not ref or ref.startswith(('data:', '#')):
                        continue
                    abs_url = urllib.parse.urljoin(url, ref)
                    host = urllib.parse.urlparse(abs_url).netloc
                    if host in ('', 'drmathazzam.app'):
                        local_asset(abs_url)
            finally:
                _resolving.discard(url)
    return prefix + rel


def ensure_shared_assets():
    """The shared Tailwind chunk ships KaTeX @font-face rules that point at
    ../media/*. tailwind.css is served from /assets/css/, so those URLs resolve
    to /assets/media/ — fetch them into exactly that directory."""
    tw_path = os.path.join(OUT, 'assets', 'css', 'tailwind.css')
    if not os.path.exists(tw_path):
        return 0
    css = open(tw_path, encoding='utf-8', errors='replace').read()
    media_dir = os.path.join(OUT, 'assets', 'media')
    os.makedirs(media_dir, exist_ok=True)
    n = 0
    for name in sorted(set(re.findall(r'\.\./media/([A-Za-z0-9_.\-]+)', css))):
        dest = os.path.join(media_dir, name)
        if os.path.exists(dest):
            continue
        data = fetch(BASE + '/_next/static/immutable/media/' + name)
        if data:
            open(dest, 'wb').write(data)
            n += 1
    return n


TAGS_ONLY = re.compile(r'<[^>]+>')


def extract_body(html):
    """Server-rendered content with React/RSC scaffolding removed."""
    m = re.search(r'<body[^>]*>(.*)</body>', html, re.S)
    if not m:
        return None
    body = m.group(1)
    body = re.sub(r'<script\b[^>]*>.*?</script>', '', body, flags=re.S)
    body = re.sub(r'<script\b[^>]*/?>', '', body)
    body = re.sub(r'<div hidden="">.*?</div>', '', body, flags=re.S)
    body = re.sub(r'<template\b[^>]*>.*?</template>', '', body, flags=re.S)
    body = re.sub(r'<template\b[^>]*/?>', '', body)
    # NOTE: a.global-home-button is NOT third-party chrome — it is the site's
    # own floating "Return to homepage" button (position:fixed, bottom-right)
    # and it is visible on 55 of the 139 routes. Keep it.
    body = re.sub(r'<!--\$!?-->|<!--/\$!?-->|<!--\$\?-->|<!--/\$-->', '', body)
    body = re.sub(r'\$\s*/\$\s*\$!?', '', body)
    return body.strip()


DESMOS_TAG = '''<script src="https://www.desmos.com/api/v1.13/calculator.js?apiKey=5a6e7598af6c4c3db1e7f1dfb2f6b4bc" defer></script>
<script defer>
// Re-mount the live Desmos calculator, replacing the captured (blank-canvas)
// copy. If the API is unreachable the captured markup stays as-is.
(function mount() {
  var host = document.querySelector('.dcg-dom-change-wrapper');
  if (!host) return;
  if (typeof window.Desmos === 'undefined') {          // API still loading
    return setTimeout(mount, 50);
  }
  host.innerHTML = '';
  try {
    // The reference site's widget measures the card's border-box height (702px)
    // while `height:100%` yields the content box (700px) once the 1px border is
    // subtracted. Match it, or the graph renders 2px short and every grid line
    // lands slightly off. The 2px overflow is clipped by the card, as upstream.
    var card = host.parentElement;
    if (card && card.offsetWidth) host.style.width = card.offsetWidth + 'px';
    if (card && card.offsetHeight) host.style.height = card.offsetHeight + 'px';
    // defaults match the captured DOM: expression list + wrench + zoom buttons
    window.__desmosCalc = window.Desmos.GraphingCalculator(host);
  } catch (e) { /* keep the captured markup */ }
})();
</script>'''


def head_style_blocks(html):
    """Inline <style> blocks that live in <head>.

    Next.js itself emits only external stylesheets, so anything inline here was
    injected at runtime by a third-party widget (Desmos, …). Keep them, or the
    widget's DOM renders unstyled.
    """
    body_at = re.search(r'<body[^>]*>', html)
    cut = body_at.start() if body_at else len(html)
    out = []
    for m in re.finditer(r'<style\b[^>]*>', html[:cut]):
        end = html.find('</style>', m.end())
        if end == -1:
            end = cut
        css = html[m.end():end].strip()
        if css:
            out.append(css)
    return out


DOC = '''<!DOCTYPE html>
<html lang="en" class="inter_c15e96cb-module__0bjUvq__variable space_grotesk_e6988195-module__RNs2Mq__variable bg-background">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>__TITLE__</title>
<meta name="description" content="__DESC__"/>
<link rel="preload" href="/assets/fonts/0c89a48fa5027cee-s.p.1ii7211jqpzi_.woff2" as="font" crossorigin="" type="font/woff2"/>
<link rel="preload" href="/assets/fonts/83afe278b6a6bb3c-s.p.45535valc9rzk.woff2" as="font" crossorigin="" type="font/woff2"/>
<link rel="stylesheet" href="/assets/css/fonts.css"/>
<link rel="stylesheet" href="/assets/css/tailwind.css"/>
__CSS__
<meta name="color-scheme" content="light dark"/>
<link rel="icon" href="/assets/brand/dr-math-azzam-mark.png" type="image/png"/>
<link rel="apple-touch-icon" href="/assets/brand/dr-math-azzam-mark.png"/>
</head>
<body class="font-sans antialiased">
__APP__
__LESSONS__
__GUIDED__
__DESMOS__
__HOME_BUTTON__
<script src="/assets/js/app.js" defer></script>
</body>
</html>
'''

# ---------------------------------------------------------------------------
# Floating "Return to homepage" button (a.global-home-button).
# Server-rendered into <body> on 55 of the 139 routes, but our hydrated
# snapshots predate it, so it is absent from captured/*.html. Re-inject it
# for exactly those routes with the site's own CSS (checked against
# getComputedStyle at 390/768/1024/1440 px).
# ---------------------------------------------------------------------------
try:
    HOME_BUTTON_ROUTES = set(json.load(open(
        '/home/user/rea-clone/home-button-routes.json', encoding='utf-8')))
except Exception:
    HOME_BUTTON_ROUTES = set()

HOME_BUTTON_CSS = '<style>\n.global-home-button{right:max(18px,env(safe-area-inset-right));bottom:max(18px,env(safe-area-inset-bottom));z-index:2147483000;color:#fff;-webkit-tap-highlight-color:transparent;background:#0a1931;border:1px solid rgba(255,255,255,.2);border-radius:999px;align-items:center;gap:8px;min-height:46px;padding:0 15px;font-size:13px;font-weight:800;line-height:1;text-decoration:none;transition:transform .18s,box-shadow .18s;display:inline-flex;position:fixed;box-shadow:rgba(10,25,49,.24) 0 10px 30px}\n.global-home-button:hover{transform:translateY(-2px);box-shadow:rgba(10,25,49,.3) 0 14px 34px}\n.global-home-button:focus-visible{outline-offset:3px;outline:#f5c84c solid 3px}\n.global-home-button svg{fill:none;stroke:currentcolor;stroke-width:1.9px;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto;width:20px;height:20px}\n@media (max-width:640px){.global-home-button{width:48px;height:48px;min-height:48px;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));justify-content:center;padding:0}\n.global-home-button span{clip:rect(0,0,0,0);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}\n.global-home-button svg{width:22px;height:22px}}\n@media print{.global-home-button{display:none !important}}\n</style>'
HOME_BUTTON_HTML = '<a class="global-home-button" aria-label="Return to homepage" title="Home" href="/"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.8 12 3l9 7.8v9.7a.5.5 0 0 1-.5.5H15v-6H9v6H3.5a.5.5 0 0 1-.5-.5v-9.7Z"></path><path d="M1.8 11.8 12 3l10.2 8.8"></path></svg><span>Home</span></a>'


def home_button(route):
    """Emit the floating home button for routes the live site ships it on."""
    key = '/' + route if route else '/'
    if key not in HOME_BUTTON_ROUTES:
        return ''
    return HOME_BUTTON_CSS + '\n' + HOME_BUTTON_HTML


lessons_json = open('/home/user/rea-clone/lessons.json', encoding='utf-8').read().replace('</', '<\\/')
# Answer key for the guided self-check blocks, recovered from the client
# bundles plus a brute-force pass against the live site (crack-answers.mjs).
_bank_path = '/home/user/rea-clone/question-bank.json'
GUIDED_BANK = {}
if os.path.exists(_bank_path):
    try:
        GUIDED_BANK = json.load(open(_bank_path, encoding='utf-8'))
    except Exception:
        GUIDED_BANK = {}

# Lab step-check widgets ("Check answer" inside an interactive lab frame).
# Harvested by brute-forcing every option against the live site.
LAB_QUIZZES = {}
try:
    LAB_QUIZZES = json.load(
        open('/home/user/rea-clone/lab-quizzes.json', encoding='utf-8'))
except Exception:
    LAB_QUIZZES = {}

# Revealed "Show all worked steps" content. The button markup is server-
# rendered but the steps are not: clicking injects them client-side from a
# route chunk. Harvested from the live DOM (one click per widget).
WORKED_STEPS = {}
try:
    WORKED_STEPS = json.load(
        open('/home/user/rea-clone/worked-steps.json', encoding='utf-8'))
except Exception:
    WORKED_STEPS = {}

LESSON_TAG = '<script id="lesson-index" type="application/json">' + lessons_json + '</script>'

# matches absolute asset paths, including an optional ?query (the site appends
# ?dpl=<deploy id> to some image URLs)
EXT_RE = (r'(["\'])(/[A-Za-z0-9_\-./]+\.(?:css|js|woff2?|png|jpg|jpeg|'
          r'svg|webp|gif|ico|json)(?:\?[A-Za-z0-9_\-.&=%;]*)?)\1')

LUCIDE = ('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" '
          'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
          'stroke-linecap="round" stroke-linejoin="round" class="lucide %s" aria-hidden="true">%s</svg>')
ICON_PATHS = {
    'palette': ('lucide-palette size-4',
                '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"></path>'
                '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>'
                '<circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>'
                '<circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>'
                '<circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>'),
    'menu': ('lucide-menu size-4',
             '<path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path>'),
    'sparkles': ('lucide-sparkles size-4',
                 '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path>'
                 '<path d="M20 2v4"></path><path d="M22 4h-4"></path><circle cx="4" cy="20" r="2"></circle>'),
}
NAV_LINKS = [('/', 'Home'), ('/#courses', 'Courses'), ('/tutor', 'AI Tutor')]

MOBILE_NAV = ('\n<nav id="mobile-site-navigation" aria-label="Mobile navigation" '
              'class="border-t border-border/70 bg-background px-4 py-3 lg:hidden" hidden>'
              '<div class="flex flex-col gap-1">'
              '<div class="mb-2 rounded-xl bg-muted">'
              '<button type="button" data-appearance-open class="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold">'
              + (LUCIDE % ICON_PATHS['palette']) + 'Appearance</button></div>'
              + ''.join(
                  '<a data-nav href="%s" class="rounded-md px-3 py-2.5 text-sm font-medium transition-colors %s">%s</a>'
                  % (href,
                     'bg-secondary text-secondary-foreground' if href == '/'
                     else 'text-muted-foreground hover:bg-muted hover:text-foreground',
                     label)
                  for href, label in NAV_LINKS)
              + '<a data-nav href="/tutor" class="mt-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">'
              + (LUCIDE % ICON_PATHS['sparkles']) + 'Ask the AI Tutor</a>'
              '</div></nav>')

print('shared media assets fetched: %d' % ensure_shared_assets())

# app.js is hand-written (nav, theme, Desmos, quiz + tutor engines). It used to
# be copied in by hand, so edits could silently never reach the output tree.
# Publish it from source on every run.
_app_js_dir = os.path.join(OUT, 'assets', 'js')
os.makedirs(_app_js_dir, exist_ok=True)
_app_js_src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app.js')
_app_js = open(_app_js_src, encoding='utf-8').read()
open(os.path.join(_app_js_dir, 'app.js'), 'w', encoding='utf-8').write(_app_js)
print('app.js published: %d bytes, %d lines' % (len(_app_js), _app_js.count('\n') + 1))

manifest, skipped = [], []
for route in ROUTES:
    sys.stdout.write('%-54s' % ('/' + route))
    sys.stdout.flush()
    # Prefer the post-hydration snapshot: it also contains the parts React
    # renders only on the client (lesson self-checks, the tutor console, …).
    cap = captured_path(route)
    if os.path.exists(cap):
        html = open(cap, encoding='utf-8', errors='replace').read()
        source = 'hydrated'
    else:
        raw = fetch(BASE + '/' + route)
        if raw is None:
            print('SKIP (unreachable)')
            skipped.append(route)
            continue
        html = raw.decode('utf-8', 'replace')
        source = 'raw'

    title = re.search(r'<title>(.*?)</title>', html, re.S)
    title = title.group(1) if title else 'Dr. Math Azzam Platform'
    desc = re.search(r'<meta name="description" content="(.*?)"', html, re.S)
    desc = (desc.group(1) if desc else '').replace('"', '&quot;')

    # per-page CSS modules (shared tailwind + fonts are linked globally)
    css_links = []
    # Third-party widgets (e.g. the Desmos graphing calculator) inject a
    # stylesheet into <head> at runtime. extract_body() keeps only the <body>,
    # so hoist any head <style> into a per-route stylesheet.
    head_styles = head_style_blocks(html)
    if head_styles:
        slug = (route.strip('/') or 'home').replace('/', '_')
        css_name = 'assets/css/widget-%s.css' % slug
        with open(os.path.join(OUT, css_name), 'w', encoding='utf-8') as fh:
            fh.write('\n'.join(head_styles))
        css_links.append('<link rel="stylesheet" href="/%s"/>' % css_name)
    for m in re.finditer(r'<link rel="stylesheet" href="(/_next/static/immutable/chunks/[^"]+\.css)"', html):
        name = m.group(1).rsplit('/', 1)[-1]
        if name in ('2qhy2uteq9w7t.css', '1jvpo323wjgl_.css'):
            continue
        local = local_asset(BASE + m.group(1))
        if local:
            css_links.append('<link rel="stylesheet" href="%s"/>' % local)

    app = extract_body(html)
    if not app or len(TAGS_ONLY.sub('', app).strip()) < 40:
        print('SKIP (client-rendered only)')
        skipped.append(route)
        continue

    # motion frames (home page illustrations) default to "running"
    app = re.sub(r'class="([^"]*home-module__oe3DtG__motionFrame[^"]*)"',
                 r'class="\1" data-running="true"', app)

    # The mobile menu panel is rendered client-side only, so it is absent from
    # the SSR markup. Re-add it wherever the hamburger trigger exists.
    if ('aria-controls="mobile-site-navigation"' in app
            and 'id="mobile-site-navigation"' not in app):
        app = re.sub(r'\s*(</header>)', MOBILE_NAV + r'\n\1', app, count=1)

    def repl_ext(m):
        # drop the ?dpl=… query: the local copy is the same file without it
        clean_path = m.group(2).split('?')[0]
        return '%s%s%s' % (m.group(1), local_asset(BASE + clean_path) or m.group(2), m.group(1))

    app = re.sub(EXT_RE, repl_ext, app)

    # Guided self-check questions: the server-rendered markup carries the
    # prompt and options but not the answer key, which lives in a client chunk.
    # Embed just the questions this page uses.
    guided = ''
    qids = re.findall(r'data-guided-question="([^"]+)"', app)
    if qids:
        subset = {q: GUIDED_BANK[q] for q in qids if q in GUIDED_BANK}
        if subset:
            guided = ('<script id="guided-answers" type="application/json">%s</script>'
                      % json.dumps(subset, ensure_ascii=False, separators=(',', ':'))
                        .replace('</', '<\\/').replace('<!--', '<\\!--'))

    # "Show all worked steps": the steps live in a client chunk, not the HTML.
    _steps = WORKED_STEPS.get('/' + route, [])
    if _steps:
        guided += ('<script id="worked-steps" type="application/json">%s</script>'
                   % json.dumps(_steps, ensure_ascii=False, separators=(',', ':'))
                     .replace('</', '<\\/').replace('<!--', '<\\!--'))

    _lab = LAB_QUIZZES.get('/' + route, {})
    if _lab:
        guided += ('<script id="lab-quizzes" type="application/json">%s</script>'
                   % json.dumps(_lab, ensure_ascii=False, separators=(',', ':'))
                     .replace('</', '<\\/').replace('<!--', '<\\!--'))

    # Desmos: the snapshot already contains the calculator's rendered DOM, but
    # the graph itself is drawn on a <canvas> by the third-party API, so a
    # static copy is blank there. Re-mount the real widget, replacing the
    # captured markup. Falls back silently to the static DOM when offline.
    desmos = ''
    if 'dcg-dom-change-wrapper' in app:
        desmos = DESMOS_TAG

    doc = DOC.replace('__TITLE__', title).replace('__DESC__', desc) \
             .replace('__CSS__', '\n'.join(css_links)) \
             .replace('__APP__', app) \
             .replace('__LESSONS__', LESSON_TAG) \
             .replace('__GUIDED__', guided) \
             .replace('__DESMOS__', desmos) \
             .replace('__HOME_BUTTON__', home_button(route))

    out_path = os.path.join(OUT, 'index.html') if route == '' \
        else os.path.join(OUT, route, 'index.html')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    open(out_path, 'w', encoding='utf-8').write(doc)
    manifest.append({'route': '/' + route, 'file': os.path.relpath(out_path, OUT),
                     'title': title, 'bytes': len(doc)})
    print('ok  %8d bytes  (%s)' % (len(doc), source))

json.dump({'pages': manifest, 'skipped': skipped},
          open('/home/user/rea-clone/manifest.json', 'w'), indent=1)
print('\n%d pages written, %d skipped (client-rendered)'
      % (len(manifest), len(skipped)))
if skipped:
    print('skipped:', ', '.join(skipped))

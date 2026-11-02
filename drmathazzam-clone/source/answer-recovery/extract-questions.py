"""Extract every self-check question object from the site's JS chunks.

Questions look like:
  {id:"l13-guided-diagnose", question:"...", options:[...], correctIndex:2,
   hint:"...", explanation:"...", optionFeedback:[...]}

A naive `rfind('{')` from `correctIndex` picks up LaTeX braces (\\frac{a}{b})
that live inside string literals, so this walks the file once with a real
string-aware scanner and records every brace span, then picks the innermost
object containing each `correctIndex:` key.
"""
import re, json, glob, sys


def object_spans(s):
    """All top-to-bottom {..} spans, ignoring braces inside string literals."""
    spans = []
    stack = []
    i = 0
    n = len(s)
    in_str = False
    quote = ''
    esc = False
    while i < n:
        ch = s[i]
        if in_str:
            if esc:
                esc = False
            elif ch == '\\':
                esc = True
            elif ch == quote:
                in_str = False
        else:
            if ch in '"\'`':
                in_str = True
                quote = ch
            elif ch == '{':
                stack.append(i)
            elif ch == '}':
                if stack:
                    spans.append((stack.pop(), i + 1))
        i += 1
    return spans


def json_field(blob, name):
    m = re.search(name + r'\s*:\s*"((?:[^"\\]|\\.)*)"', blob)
    return json.loads('"' + m.group(1) + '"') if m else None


def json_array(blob, name):
    m = re.search(name + r'\s*:\s*\[', blob)
    if not m:
        return None
    j = m.end() - 1
    d = 0
    k = j
    in_str = False
    quote = ''
    esc = False
    while k < len(blob):
        c = blob[k]
        if in_str:
            if esc:
                esc = False
            elif c == '\\':
                esc = True
            elif c == quote:
                in_str = False
        else:
            if c in '"\'`':
                in_str = True
                quote = c
            elif c == '[':
                d += 1
            elif c == ']':
                d -= 1
                if d == 0:
                    break
        k += 1
    raw = blob[j:k + 1]
    try:
        return json.loads(raw)
    except Exception:
        parts = re.findall(r'"((?:[^"\\]|\\.)*)"', raw)
        return [json.loads('"' + p + '"') for p in parts] or None


CHUNKS = sorted(glob.glob('/tmp/chunks/*.js'))
found = {}

for path in CHUNKS:
    s = open(path, encoding='utf-8', errors='replace').read()
    spans = object_spans(s)
    # index by start so we can binary-search the innermost container
    spans.sort()
    starts = [a for a, _ in spans]

    import bisect
    for m in re.finditer(r'correctIndex\s*:\s*(-?\d+)', s):
        pos = m.start()
        # smallest span containing pos: the one with the greatest start <= pos
        # whose end > pos
        best = None
        idx = bisect.bisect_right(starts, pos) - 1
        while idx >= 0:
            a, b = spans[idx]
            if b > pos:
                if best is None or (b - a) < (best[1] - best[0]):
                    best = (a, b)
                # keep looking back for a smaller enclosing span
                for j in range(idx - 1, -1, -1):
                    a2, b2 = spans[j]
                    if b2 > pos and (b2 - a2) < (best[1] - best[0]):
                        best = (a2, b2)
                break
            idx -= 1
        if best is None:
            continue
        blob = s[best[0]:best[1]]
        qid = json_field(blob, 'id')
        if not qid:
            continue
        obj = {
            'id': qid,
            'question': json_field(blob, 'question'),
            'options': json_array(blob, 'options'),
            'correctIndex': int(m.group(1)),
            'hint': json_field(blob, 'hint'),
            'explanation': json_field(blob, 'explanation'),
            'optionFeedback': json_array(blob, 'optionFeedback'),
            'source': path.split('/')[-1],
        }
        prev = found.get(qid)
        score = lambda o: sum(v is not None for v in o.values())
        if prev is None or score(obj) > score(prev):
            found[qid] = obj

print('chunks scanned :', len(CHUNKS))
print('questions found:', len(found))
print('with options   :', sum(1 for v in found.values() if v['options'] and v['correctIndex'] is not None))
json.dump(found, open('/tmp/questions.json', 'w'), indent=1, ensure_ascii=False)

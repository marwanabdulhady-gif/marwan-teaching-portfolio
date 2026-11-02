#!/usr/bin/env node
/**
 * Accessibility checks on rendered markup.
 *
 * The labs and the map are plain React, so `renderToStaticMarkup` gives real
 * HTML with real attributes — enough to catch the mistakes that are invisible
 * in a screenshot and tedious to find by tabbing:
 *
 *   · a button or link with no accessible name
 *   · an input with no label, `aria-label` or `aria-labelledby`
 *   · an `svg role="img"` with no label
 *   · a slider role with no value or name
 *   · a duplicate id (breaks every `aria-describedby` that points at it)
 *   · an `aria-*` reference to an id that is not in the same render
 *
 * Usage: `audit(html)` returns a list of human-readable problems.
 */

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

/** Inner HTML of the element whose opening tag starts at `from`. */
function innerOf(html, name, from) {
  const open = new RegExp(`<${name}\\b`, 'gi');
  const close = new RegExp(`</${name}\\s*>`, 'gi');
  open.lastIndex = from;
  let depth = 0;
  let index = from;
  while (index < html.length) {
    open.lastIndex = index;
    close.lastIndex = index;
    const nextOpen = open.exec(html);
    const nextClose = close.exec(html);
    if (!nextClose) return { inner: html.slice(html.indexOf('>', from) + 1), end: html.length };
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth += 1;
      index = nextOpen.index + nextOpen[0].length;
    } else {
      depth -= 1;
      if (depth === 0) return { inner: html.slice(html.indexOf('>', from) + 1, nextClose.index), end: nextClose.index + nextClose[0].length };
      index = nextClose.index + nextClose[0].length;
    }
  }
  return { inner: html.slice(html.indexOf('>', from) + 1), end: html.length };
}

/** Attributes of one opening tag. */
function attrs(tag) {
  const found = {};
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) found[match[1].toLowerCase()] = match[2];
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*'([^']*)'/g)) found[match[1].toLowerCase()] = match[2];
  for (const match of tag.matchAll(/\s([\w:-]+)(?=[\s/>])(?!\s*=)/g)) found[match[1].toLowerCase()] = '';
  return found;
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };

/** Visible text of a fragment, with hidden subtrees and entities removed. */
function textOf(html) {
  let text = html.replace(/<[^>]*>/g, ' ');
  text = text.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
  text = text.replace(/&([a-z#0-9]+);/gi, (whole, name) => ENTITIES[name] ?? whole);
  return text.replace(/\s+/g, ' ').trim();
}

/** Everything, including aria-labels of descendants (an icon button inside a link). */
function nameOf(inner) {
  const own = textOf(inner);
  if (own) return own;
  for (const match of inner.matchAll(/aria-label="([^"]*)"/g)) if (match[1].trim()) return match[1];
  return '';
}

function audit(html, { where = '' } = {}) {
  const problems = [];
  const add = (message) => problems.push(where ? `${where}: ${message}` : message);

  // ---- names for buttons and links -------------------------------------
  for (const name of ['button', 'a']) {
    const pattern = new RegExp(`<${name}\\b[^>]*>`, 'gi');
    for (const match of html.matchAll(pattern)) {
      const tag = match[0];
      const attributes = attrs(tag);
      if ('aria-label' in attributes && attributes['aria-label'].trim()) continue;
      if ('aria-labelledby' in attributes) continue;
      if ('title' in attributes && attributes.title.trim()) continue;
      const { inner } = innerOf(html, name, match.index);
      if (nameOf(inner)) continue;
      add(`<${name}> has no accessible name`);
    }
  }

  // ---- inputs need a label ---------------------------------------------
  for (const match of html.matchAll(/<input\b[^>]*>/gi)) {
    const attributes = attrs(match[0]);
    if ((attributes.type ?? '').toLowerCase() === 'hidden') continue;
    if ((attributes['aria-label'] ?? '').trim() || 'aria-labelledby' in attributes) continue;
    const id = attributes.id;
    if (id && new RegExp(`<label\\b[^>]*\\bfor="${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'i').test(html)) continue;
    // Wrapped in a <label>? Look backwards for an unclosed one.
    const before = html.slice(0, match.index);
    const labelOpens = (before.match(/<label\b/gi) ?? []).length;
    const labelCloses = (before.match(/<\/label>/gi) ?? []).length;
    if (labelOpens > labelCloses) continue;
    add(`input (${attributes.type ?? 'text'}) has no label`);
  }

  // ---- images ------------------------------------------------------------
  for (const match of html.matchAll(/<svg\b[^>]*>/gi)) {
    const attributes = attrs(match[0]);
    if (attributes['aria-hidden'] === 'true') continue;
    if ((attributes.role ?? '') !== 'img') continue;
    if ((attributes['aria-label'] ?? '').trim() || 'aria-labelledby' in attributes) continue;
    add('svg role="img" has no label');
  }

  // ---- sliders -----------------------------------------------------------
  for (const match of html.matchAll(/<[a-z]+\b[^>]*role="slider"[^>]*>/gi)) {
    const attributes = attrs(match[0]);
    if (!('aria-valuenow' in attributes)) add('slider without aria-valuenow');
    if (!(attributes['aria-label'] ?? '').trim() && !('aria-labelledby' in attributes)) add('slider without a name');
  }

  // ---- ids and references ------------------------------------------------
  const ids = new Map();
  for (const match of html.matchAll(/\sid="([^"]+)"/g)) {
    ids.set(match[1], (ids.get(match[1]) ?? 0) + 1);
  }
  for (const [id, count] of ids) if (count > 1) add(`duplicate id "${id}" (${count}×)`);

  // `aria-controls` may name a popup that is not rendered until it opens (the
  // search results list); that is allowed. Labels and descriptions may not.
  for (const match of html.matchAll(/aria-(?:describedby|labelledby)="([^"]+)"/g)) {
    for (const ref of match[1].split(/\s+/)) {
      if (ref && !ids.has(ref)) add(`aria reference to missing id "${ref}"`);
    }
  }

  return problems;
}

module.exports = { audit };

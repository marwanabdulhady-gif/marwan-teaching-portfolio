#!/usr/bin/env node
/**
 * Geometry checks for rendered lab SVGs.
 *
 * The labs are hand-written SVG, so a wrong scale does not throw — it draws
 * somewhere you cannot see. These helpers read the markup that
 * `scripts/render-check.cjs` produces and report the two cases that always mean
 * a bug:
 *
 *   1. a shape drawn entirely outside its viewBox (it never appears);
 *   2. a label whose anchor is outside it (clipped text).
 *
 * A line that runs off the edge is allowed: guide lines are meant to do that.
 */

/** Every drawing element in an HTML string, with its box in viewBox pixels. */
function elements(html) {
  const out = [];
  for (const svg of html.split('<svg').slice(1)) {
    const box = /viewBox="([^"]+)"/.exec(svg);
    if (!box) continue;
    const [, , w, h] = box[1].trim().split(/\s+/).map(Number);
    for (const el of svg.matchAll(/<(line|rect|circle|text)\b([^>]*)>/g)) {
      const attrs = {};
      for (const a of el[2].matchAll(/([\w-]+)="(-?[\d.]+)"/g)) attrs[a[1]] = Number(a[2]);
      const get = (name) => (name in attrs ? attrs[name] : 0);
      if (el[1] === 'line') {
        out.push({ tag: 'line', w, h, x0: Math.min(get('x1'), get('x2')), x1: Math.max(get('x1'), get('x2')), y0: Math.min(get('y1'), get('y2')), y1: Math.max(get('y1'), get('y2')) });
      } else if (el[1] === 'circle') {
        out.push({ tag: 'circle', w, h, x0: get('cx') - get('r'), x1: get('cx') + get('r'), y0: get('cy') - get('r'), y1: get('cy') + get('r') });
      } else if (el[1] === 'rect') {
        out.push({ tag: 'rect', w, h, x0: get('x'), x1: get('x') + get('width'), y0: get('y'), y1: get('y') + get('height') });
      } else {
        out.push({ tag: 'text', w, h, x0: get('x'), x1: get('x'), y0: get('y'), y1: get('y') });
      }
    }
  }
  return out;
}

/**
 * Two failures the eye misses: a shape drawn entirely outside the viewBox (so it
 * never appears — a dot plotted at y = 250 in a 125 px box), and a label whose
 * anchor sits outside it (clipped text). Partly-clipped lines are left alone:
 * guide lines are allowed to run off the edge.
 */
function offPlot(html) {
  for (const el of elements(html)) {
    if (el.tag === 'text') {
      if (el.x0 < -1 || el.x0 > el.w + 1 || el.y0 < 1 || el.y0 > el.h + 2) {
        return 'text at (' + el.x0 + ', ' + el.y0 + ') outside a ' + el.w + '×' + el.h + ' plot';
      }
      continue;
    }
    if (el.x1 < 0 || el.x0 > el.w || el.y1 < 0 || el.y0 > el.h) {
      return '<' + el.tag + '> entirely outside a ' + el.w + '×' + el.h + ' plot';
    }
  }
  return null;
}

module.exports = { elements, offPlot };

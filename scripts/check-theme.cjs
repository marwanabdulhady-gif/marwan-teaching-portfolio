#!/usr/bin/env node
/**
 * Check the appearance themes without a browser.
 *
 *   npm run qa:theme
 *
 * Every colour in the courses UI comes from a `--t-*` token, and there are nine
 * appearances (paper, soft, dark, blue, rose, lavender, mint, contrast,
 * chalkboard). A token that reads fine on paper can be invisible on the
 * chalkboard, so each theme's ink-on-background pairs are computed here with
 * the WCAG contrast formula:
 *
 *   body text        4.5 : 1
 *   large/graphic    3.0 : 1
 *
 * The script reads `src/index.css` directly — the same file the app loads.
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'src/index.css'), 'utf8');

/** `#rgb`, `#rrggbb`, `rgb(...)` and `rgba(...)` → [r, g, b] or null. */
function toRgb(value) {
  const text = value.trim();
  const hex = /^#([0-9a-f]{3,8})$/i.exec(text);
  if (hex) {
    const digits = hex[1];
    const expand = (part) => parseInt(part.length === 1 ? part + part : part, 16);
    if (digits.length === 3 || digits.length === 4) return [expand(digits[0]), expand(digits[1]), expand(digits[2])];
    if (digits.length === 6 || digits.length === 8) return [expand(digits.slice(0, 2)), expand(digits.slice(2, 4)), expand(digits.slice(4, 6))];
  }
  const rgb = /^rgba?\(([^)]+)\)$/i.exec(text);
  if (rgb) {
    const parts = rgb[1].split(',').map((part) => Number(part.trim()));
    if (parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite)) return parts.slice(0, 3);
  }
  return null;
}

/** WCAG relative luminance. */
function luminance([r, g, b]) {
  const channel = (value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(foreground, background) {
  const a = luminance(foreground);
  const b = luminance(background);
  const [light, dark] = a > b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}

// ---------------------------------------------------------------- parse CSS
/** Pull `--t-*: value;` declarations out of one block of text. */
function declarations(block) {
  const found = {};
  for (const match of block.matchAll(/(--t-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    found[match[1]] = match[2].replace(/\/\*[\s\S]*?\*\//g, '').trim();
  }
  return found;
}

/** The body of the rule whose selector matches `selector`. */
function block(selector) {
  const start = css.indexOf(selector + ' {');
  if (start < 0) return null;
  let depth = 0;
  let index = css.indexOf('{', start);
  const from = index + 1;
  for (; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    else if (css[index] === '}') {
      depth -= 1;
      if (depth === 0) return css.slice(from, index);
    }
  }
  return null;
}

const rootBlock = block(':root') ?? '';
const base = declarations(rootBlock);

const themes = [{ name: 'paper (default)', values: base }];
for (const match of css.matchAll(/html\[data-appearance='([a-z]+)'\]\s*\{/g)) {
  const name = match[1];
  const body = block(`html[data-appearance='${name}']`) ?? '';
  themes.push({ name, values: { ...base, ...declarations(body) } });
}
const legacy = block("[data-theme='dark']");
if (legacy) themes.push({ name: 'chalkboard (data-theme=dark)', values: { ...base, ...declarations(legacy) } });

// ---------------------------------------------------------------- the pairs
// [foreground, background, minimum, why]
const pairs = [
  ['--t-ink', '--t-bg', 4.5, 'body text on the page'],
  ['--t-ink', '--t-bg-2', 4.5, 'body text on a card'],
  ['--t-accent-deep', '--t-bg', 4.5, 'links and emphasis'],
  ['--t-accent-deep', '--t-bg-2', 4.5, 'links on a card'],
  ['--t-on-accent', '--t-accent', 4.5, 'text on a filled accent button'],
  ['--t-on-sun', '--t-sun', 4.5, 'text on a sunflower chip'],
  ['--t-on-sky', '--t-sky', 4.5, 'text on a sky chip'],
  ['--t-ok', '--t-bg', 4.5, '“correct” text on the page'],
  ['--t-ok', '--t-bg-2', 4.5, '“correct” text on a card'],
  ['--t-danger', '--t-bg', 4.5, '“not quite” text on the page'],
  ['--t-danger', '--t-bg-2', 4.5, '“not quite” text on a card'],
  ['--t-accent', '--t-bg', 3, 'accent progress ring and focus outline on the page'],
  // A sunflower fill on cream paper is only 1.7:1, which is why every filled
  // mark (map node, legend swatch, badge) also carries an ink edge — the ink
  // pairs above already hold that edge to 4.5:1. Text *on* a sunflower fill is
  // covered by --t-on-sun.
];

const REQUIRED = [
  '--t-bg', '--t-bg-2', '--t-ink', '--t-accent', '--t-accent-deep', '--t-sky', '--t-sun',
  '--t-on-accent', '--t-on-sun', '--t-on-sky', '--t-ok', '--t-danger',
];

const problems = [];
const report = [];

for (const theme of themes) {
  for (const token of REQUIRED) {
    if (!theme.values[token]) problems.push(`${theme.name}: ${token} is not defined`);
  }
  const worst = [];
  for (const [foreground, background, minimum, why] of pairs) {
    const fg = toRgb(theme.values[foreground] ?? '');
    const bg = toRgb(theme.values[background] ?? '');
    if (!fg || !bg) continue; // reported as missing above
    const ratio = contrast(fg, bg);
    if (ratio + 1e-9 < minimum) {
      problems.push(`${theme.name}: ${why} — ${foreground} on ${background} is ${ratio.toFixed(2)}:1, needs ${minimum}:1`);
    } else {
      worst.push(ratio);
    }
  }
  report.push(`${theme.name}: lowest passing pair ${Math.min(...worst).toFixed(2)}:1`);
}

// ---------------------------------------------------- colours in the source
// Every course colour must come from a token, so a new theme (or the dark one)
// cannot be missed by a component that hard-codes paper-and-coral.
const sources = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const next = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(next);
    else if (/\.tsx?$/.test(entry.name)) sources.push(next);
  }
})('src/courses');

const rawColours = [];
for (const file of sources) {
  const text = fs.readFileSync(path.join(root, file), 'utf8')
    .replace(/&#\d+;/g, '')            // HTML entities such as &#9879; (⚗)
    .replace(/\/\*[\s\S]*?\*\//g, ''); // block comments
  for (const match of text.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    const line = text.slice(0, match.index).split('\n').length;
    rawColours.push(`${file}:${line} uses ${match[0]} — use a --t-* token`);
  }
}
problems.push(...rawColours);

if (problems.length) {
  console.error(`✗ ${problems.length} theme problem${problems.length === 1 ? '' : 's'}:\n`);
  for (const problem of problems) console.error(`  · ${problem}`);
  process.exitCode = 1;
} else {
  console.log(`✓ ${themes.length} appearances meet their contrast minimums`);
  for (const line of report) console.log(`  ${line}`);
  console.log(`  colours — ${sources.length} course files use tokens only`);
}

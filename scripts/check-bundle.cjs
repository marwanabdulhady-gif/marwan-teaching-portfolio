#!/usr/bin/env node
/**
 * What a visitor actually downloads.
 *
 *   npm run qa:bundle          (after `npm run build`)
 *
 * Every other check in this repo reads the source; this one reads `dist/`. It
 * exists because the promise in the plan is about bytes on the wire: the courses
 * page must not get heavier than 40 KB gzip without someone noticing, and no
 * lazily loaded lab may exceed 15 KB gzip.
 *
 * It also follows the *static* import graph from index.html. Anything reachable
 * that way is downloaded before the page paints, so a big module that only some
 * page needs (the Supabase client, a question bank, a lab) must not appear in it.
 * That is the regression this check is really for.
 */
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const budgetFile = path.join(__dirname, 'bundle-budget.json');

const kb = (bytes) => Math.round((bytes / 1024) * 10) / 10;
const newest = (dir) => newestOf(dir);

// Build when dist is missing or older than the source, so this is a single
// command rather than something that silently measures yesterday's code.
const stale = () => {
  if (!fs.existsSync(path.join(dist, 'index.html'))) return true;
  const built = Math.max(
    fs.statSync(path.join(dist, 'index.html')).mtimeMs,
    ...fs.readdirSync(path.join(dist, 'assets')).map((name) => fs.statSync(path.join(dist, 'assets', name)).mtimeMs),
  );
  return newest(path.join(root, 'src')) > built;
};

const newestOf = (dir) => {
  let latest = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'dist' || entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    latest = Math.max(latest, entry.isDirectory() ? newestOf(full) : fs.statSync(full).mtimeMs);
  }
  return latest;
};

const budget = JSON.parse(fs.readFileSync(budgetFile, 'utf8'));

// A stale dist would happily pass against yesterday's code.
if (stale()) {
  console.log('· dist is missing or older than src — building first');
  const { execFileSync } = require('node:child_process');
  execFileSync(process.execPath, [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), 'build', '--logLevel', 'warn'], {
    cwd: root,
    stdio: 'inherit',
  });
}

const gz = (file) => zlib.gzipSync(fs.readFileSync(file), { level: 9 }).length;
const size = (file) => gz(file);

// ---- eager set: what index.html pulls in, plus its static imports ----------
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const referenced = [...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.(?:js|css))"/g)].map((match) => match[1]);
if (!referenced.length) {
  console.error('! index.html references no built assets.');
  process.exit(2);
}

const staticImports = (file) => {
  const code = fs.readFileSync(file, 'utf8');
  // `import"./x.js"` / `import{a}from"./x.js"` are eager; `import("./x.js")` is not.
  return [...code.matchAll(/import\s*(?:\{[^}]*\}\s*from\s*)?"(\.\/[^"]+\.js)"/g)].map((match) => match[1]);
};

const eager = new Set();
const queue = [...referenced];
while (queue.length) {
  const asset = queue.shift();
  if (eager.has(asset)) continue;
  eager.add(asset);
  if (asset.endsWith('.js')) {
    for (const next of staticImports(path.join(dist, asset))) queue.push(path.posix.join('assets', next.replace(/^\.\//, '')));
  }
}

const assets = fs.readdirSync(path.join(dist, 'assets'));
const allJs = assets.filter((name) => name.endsWith('.js'));
const eagerJs = [...eager].filter((asset) => asset.endsWith('.js'));
const eagerCss = [...eager].filter((asset) => asset.endsWith('.css'));

const eagerGz = kb([...eager].reduce((total, asset) => total + size(path.join(dist, asset)), 0));
const totalJsGz = kb(allJs.reduce((total, name) => total + size(path.join(dist, 'assets', name)), 0));
const lazy = allJs
  .filter((name) => !eager.has('assets/' + name))
  .map((name) => ({ name, gz: kb(size(path.join(dist, 'assets', name))) }))
  .sort((a, b) => b.gz - a.gz);

const problems = [];

// ---- 1. the heavy things stay out of the eager set -------------------------
// Each entry is a string that only appears in that module's compiled output.
for (const [label, marker] of Object.entries(budget.mustStayLazy)) {
  // A marker that has moved would make the check pass for the wrong reason.
  const found = lazy.filter((chunk) => fs.readFileSync(path.join(dist, 'assets', chunk.name), 'utf8').includes(marker));
  if (!found.length) problems.push(`${label}: no lazy chunk contains “${marker}” — the marker needs updating`);
  for (const asset of eagerJs) {
    if (fs.readFileSync(path.join(dist, asset), 'utf8').includes(marker)) {
      problems.push(`${label} is downloaded before first paint (${asset}) — it must stay a dynamic import`);
    }
  }
}

// ---- 1b. every lab is still reachable only by a dynamic import ------------
// A registry entry rewritten as `import X from './pre/Foo'` would fold that lab
// (and only that lab) into the first paint, which the byte budget is too coarse
// to notice on its own.
const registryDir = path.join(root, 'src/courses/explorers');
const registryFiles = fs.readdirSync(registryDir).filter((name) => /^registry\..*\.ts$/.test(name));
let registryEntries = 0;
for (const name of registryFiles) {
  const code = fs.readFileSync(path.join(registryDir, name), 'utf8');
  for (const line of code.split('\n')) {
    if (!/^\s*'[^']+':\s/.test(line)) continue;
    registryEntries += 1;
    if (!/=>\s*import\(/.test(line)) problems.push(`explorers/${name}: ${line.trim().split(':')[0]} is not a dynamic import`);
  }
}
const expectedEntries = Number(((budget.minRegistryEntries) || 0));
if (registryEntries < expectedEntries) {
  problems.push(`explorer registry has ${registryEntries} entries, expected at least ${expectedEntries}`);
}

// ---- 2. growth budget -----------------------------------------------------
if (eagerGz > budget.eagerGzKb + budget.maxGrowthKb) {
  problems.push(
    `first paint is ${eagerGz} KB gzip, over the ${budget.eagerGzKb} KB baseline plus ${budget.maxGrowthKb} KB`,
  );
}
if (Math.abs(eagerGz - budget.eagerGzKb) > 0.5) {
  console.log(`· first paint moved from ${budget.eagerGzKb} KB to ${eagerGz} KB gzip`);
}

// ---- 3. no lab chunk over the ceiling ------------------------------------
for (const chunk of lazy) {
  const allowed = (budget.lazyChunkExceptions || {})[Object.keys(budget.lazyChunkExceptions || {}).find((prefix) => chunk.name.startsWith(prefix))];
  const ceiling = allowed || budget.lazyChunkMaxGzKb;
  if (chunk.gz > ceiling) problems.push(`${chunk.name} is ${chunk.gz} KB gzip (ceiling ${ceiling} KB)`);
}

// ---- report --------------------------------------------------------------
console.log(`· first paint: ${eagerJs.length} script(s) + ${eagerCss.length} stylesheet = ${eagerGz} KB gzip`);
console.log(`· lazy chunks: ${lazy.length}, largest ${lazy[0].name} at ${lazy[0].gz} KB gzip`);
console.log(`· all JavaScript, if a visitor opened everything: ${totalJsGz} KB gzip`);

if (problems.length) {
  console.error('\nFAILURES');
  for (const problem of problems) console.error('  · ' + problem);
  process.exit(1);
}
const overBase = lazy.filter((chunk) => chunk.gz > budget.lazyChunkMaxGzKb);
console.log(
  `✓ ${eagerGz} KB gzip to first paint (baseline ${budget.eagerGzKb}, budget +${budget.maxGrowthKb}); ` +
    `${lazy.length - overBase.length} lazy chunks under ${budget.lazyChunkMaxGzKb} KB, ` +
    `${overBase.length} above it by exception (${overBase.map((chunk) => chunk.name + ' ' + chunk.gz).join(', ') || 'none'}); ` +
    `${registryEntries} labs behind dynamic imports`,
);

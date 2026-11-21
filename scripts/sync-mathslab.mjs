#!/usr/bin/env node
/**
 * Copy the MathsLab site (github.com/marwanabdulhady-gif/mathslab) into public/mathslab/.
 *
 *   node scripts/sync-mathslab.mjs ../mathslab          a local checkout, its committed HEAD
 *   node scripts/sync-mathslab.mjs ../mathslab main     a named branch or commit of it
 *
 * MathsLab is plain static HTML (no build), so Chapter 03 opens its pages straight from
 * public/mathslab/ inside the arcade player. Only committed files are copied (git archive),
 * never a working tree's unsaved edits. The screenshots, the source archives, the build
 * tools and MathsLab's own server and Vercel files stay out: they are not part of the site.
 * The commit that was copied is written to public/mathslab/SOURCE.json.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = process.argv[2];
const ref = process.argv[3] || 'HEAD';
if (!src) {
  console.error('usage: node scripts/sync-mathslab.mjs <path to a mathslab checkout> [ref]');
  process.exit(1);
}
const EXCLUDE = ['screenshots', 'source-archives', 'tools', 'server.js', 'vercel.json', '.github', 'package-lock.json'];
const out = path.join(root, 'public', 'mathslab');

const sha = execFileSync('git', ['rev-parse', ref], { cwd: src }).toString().trim();
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const tar = execFileSync('git', ['archive', sha], { cwd: src, maxBuffer: 1 << 30 });
execFileSync('tar', ['-x', '-C', out, ...EXCLUDE.map((e) => `--exclude=${e}`)], { input: tar, maxBuffer: 1 << 30 });
writeFileSync(
  path.join(out, 'SOURCE.json'),
  JSON.stringify({ repo: 'marwanabdulhady-gif/mathslab', commit: sha, copied: new Date().toISOString().slice(0, 10), excluded: EXCLUDE }, null, 2) + '\n',
);
console.log(`public/mathslab ← mathslab ${sha.slice(0, 7)}`);

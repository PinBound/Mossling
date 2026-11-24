#!/usr/bin/env node
// Converts PNG art in src/assets/img to web-sized WebP (alpha kept), fixing known name variants.
// Optional: the game also loads PNGs directly. Run: npm run assets:optimize
// Originals are removed from the working tree; commit history keeps the masters.
import sharp from 'sharp';
import { readdirSync, statSync, unlinkSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';

const ROOT = new URL('../src/assets/img/', import.meta.url).pathname;
const ALIASES = { firefly_gold: 'firefly_golden' };
const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));

let before = 0, after = 0, n = 0;
for (const file of walk(ROOT).filter((f) => f.toLowerCase().endsWith('.png'))) {
  let name = basename(file, '.png');
  const dir = dirname(file);
  const rel = file.slice(ROOT.length);
  if (rel.startsWith('scene/')) name = name.replace(/^fg_(dawn|day|dusk|night)$/, 'fg_near_$1');
  name = ALIASES[name] ?? name;
  const out = join(dir, `${name}.webp`);
  let img = sharp(file);
  const meta = await img.metadata();
  if (rel.startsWith('scene/') && meta.width > 1920) img = img.resize(1920);
  if (rel.startsWith('ui/device_shell') && meta.width > 1024) img = img.resize(1024);
  if (rel.startsWith('props/') && meta.width > 384) img = img.resize(384);
  const opaque = rel.startsWith('scene/bg_far') || rel.startsWith('ui/app_icon');
  await (opaque ? img.removeAlpha() : img).webp({ quality: rel.startsWith('scene/') ? 80 : 88, alphaQuality: 100, effort: 5 }).toFile(out);
  before += statSync(file).size;
  after += statSync(out).size;
  if (!rel.startsWith('ui/app_icon')) unlinkSync(file); // the app icon master is kept for PWA icon generation
  n++;
  console.log(`${rel} → ${out.slice(ROOT.length)}`);
}
console.log(`\n${n} files: ${(before / 1e6).toFixed(1)} MB → ${(after / 1e6).toFixed(1)} MB`);
if (existsSync(join(ROOT, 'ui/app_icon.png'))) console.log('Run `node scripts/make-icons.mjs` to refresh the PWA icons from ui/app_icon.png.');

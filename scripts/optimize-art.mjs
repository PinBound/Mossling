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
  if (rel.startsWith('scene/') && meta.width > 1600) img = img.resize(1600);
  if (rel.startsWith('ui/device_shell') && meta.width > 1024) img = img.resize(1024);
  if (rel.startsWith('props/') && meta.width > 384) img = img.resize(384);
  // Pet poses: nudge the character onto the feet line (y = 900) if it's slightly off, so poses
  // of one form never jump up and down when they swap.
  if (rel.startsWith('pet/') && meta.width === 1024 && meta.height === 1024 && meta.hasAlpha) {
    const { data } = await sharp(file).extractChannel('alpha').raw().toBuffer({ resolveWithObject: true });
    let bottom = 0;
    for (let y = 1023; y >= 0 && !bottom; y--) for (let x = 0; x < 1024; x += 2) if (data[y * 1024 + x] > 128) { bottom = y; break; }
    const shift = 900 - bottom;
    if (bottom && Math.abs(shift) >= 4 && Math.abs(shift) <= 48) {
      const buf = await sharp(file).png().toBuffer();
      img = sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: buf, left: 0, top: shift }])
        .png();
      img = sharp(await img.toBuffer());
      console.log(`  ${rel}: moved ${shift > 0 ? 'down' : 'up'} ${Math.abs(shift)} px onto the feet line`);
    }
  }
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

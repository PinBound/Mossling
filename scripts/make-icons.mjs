// Renders the PWA icons from public/icons/favicon.svg. Run: node scripts/make-icons.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
const svg = readFileSync(new URL('../public/icons/favicon.svg', import.meta.url));
const out = (n) => new URL(`../public/icons/${n}`, import.meta.url).pathname;
await sharp(svg).resize(192, 192).png().toFile(out('icon-192.png'));
await sharp(svg).resize(512, 512).png().toFile(out('icon-512.png'));
await sharp(svg).resize(180, 180).png().toFile(out('apple-touch-icon.png'));
// Maskable: full-bleed background, art inside the 80% safe zone.
const inner = await sharp(svg).resize(400, 400).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#3F5E3A' } })
  .composite([{ input: inner, top: 56, left: 56 }])
  .png()
  .toFile(out('icon-maskable-512.png'));
console.log('icons written');

// Renders the PWA icons and favicon. Uses art-source/app_icon.png when present, else public/icons/favicon.svg.
// Run: node scripts/make-icons.mjs
import sharp from 'sharp';
import { existsSync, readFileSync } from 'node:fs';
const master = new URL('../art-source/app_icon.png', import.meta.url).pathname;
const src = existsSync(master) ? readFileSync(master) : readFileSync(new URL('../public/icons/favicon.svg', import.meta.url));
const out = (n) => new URL(`../public/icons/${n}`, import.meta.url).pathname;
const png = (size) => sharp(src).resize(size, size).png({ compressionLevel: 9, palette: size <= 64 });
await png(192).toFile(out('icon-192.png'));
await png(512).toFile(out('icon-512.png'));
await png(180).toFile(out('apple-touch-icon.png'));
await png(48).toFile(out('favicon-48.png'));
// Maskable: art inside the 80% safe zone on a full-bleed background sampled from the icon's corner.
const { data } = await sharp(src).resize(1, 1, { position: 'left top', fit: 'cover' }).extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
const inner = await sharp(src).resize(410, 410).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: { r: data[0], g: data[1], b: data[2], alpha: 1 } } })
  .composite([{ input: inner, top: 51, left: 51 }])
  .png()
  .toFile(out('icon-maskable-512.png'));
console.log('icons written from', existsSync(master) ? 'art-source/app_icon.png' : 'favicon.svg');

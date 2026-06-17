/**
 * Prepare hero report graphic from public/Pre Delivery Design.png:
 * - Recolor navy/stroke blues to site brand blue (#0033FF)
 * - Remove white streak through Vehicle Badges / Accessories area
 * - Export sharp PNG for hero (native resolution, stripped metadata)
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const source = path.join(root, 'public/Pre Delivery Design.png');
const output = path.join(root, 'public/pre-delivery-hero-report.png');

const BRAND = { r: 0, g: 51, b: 255 };
const LAVENDER = { r: 238, g: 234, b: 249 };

function isHeaderNavy(r, g, b) {
  return r <= 32 && g <= 42 && b >= 135 && b <= 158;
}

function isStrokeBlue(r, g, b) {
  if (r <= 8 && g >= 24 && g <= 52 && b >= 155 && b <= 200) return true;
  if (r <= 95 && g <= 105 && b >= 165 && b <= 195 && b > r + 70) return true;
  return false;
}

function isPureWhite(r, g, b) {
  return r >= 240 && g >= 240 && b >= 240;
}

function inAccessoriesStreakBand(x, y, w, h) {
  const y0 = Math.floor(h * 0.865);
  const y1 = Math.floor(h * 0.885);
  const x0 = Math.floor(w * 0.46);
  const x1 = Math.floor(w * 0.62);
  return y >= y0 && y <= y1 && x >= x0 && x <= x1;
}

const { data, info } = await sharp(source)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: w, height: h, channels: ch } = info;
const out = Buffer.from(data);

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * ch;
    let r = out[i];
    let g = out[i + 1];
    let b = out[i + 2];

    if (isHeaderNavy(r, g, b) || isStrokeBlue(r, g, b)) {
      r = BRAND.r;
      g = BRAND.g;
      b = BRAND.b;
    } else if (inAccessoriesStreakBand(x, y, w, h) && isPureWhite(r, g, b)) {
      r = LAVENDER.r;
      g = LAVENDER.g;
      b = LAVENDER.b;
    }

    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
    if (ch === 4) out[i + 3] = 255;
  }
}

await sharp(out, { raw: { width: w, height: h, channels: ch } })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .withMetadata({ density: 192 })
  .toFile(output);

console.log(`✓ Wrote ${output} (${w}×${h})`);

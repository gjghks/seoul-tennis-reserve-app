import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const root = join(__dirname, '..');
const iconsDir = join(root, 'public', 'icons');

// "any" master: full-bleed C1 with hard offset shadow. Powers the PWA "any" set + apple-touch.
const anySvg = join(iconsDir, 'icon.svg');
// "maskable" master: C1 scaled 0.92 into the safe zone, no shadow. Powers the PWA "maskable" set.
const maskableSvg = join(iconsDir, 'icon-maskable.svg');
// Favicon-optimized master (two-arc seam). Powers favicon.png.
const faviconSvg = join(root, 'app', 'icon.svg');

const anySizes = [72, 96, 128, 144, 152, 192, 384, 512]; // referenced by manifest + app/sw.ts (192, 96)
const maskableSizes = [192, 512]; // the sizes Android adaptive icons actually consume

async function render(src, size, out) {
  await sharp(src, { density: 512 })
    .resize(size, size, { fit: 'contain' })
    .png()
    .toFile(out);
  console.log(`Generated: ${out.replace(root + '/', '')}`);
}

async function generateIcons() {
  await mkdir(iconsDir, { recursive: true });

  for (const size of anySizes) {
    await render(anySvg, size, join(iconsDir, `icon-${size}x${size}.png`));
  }
  for (const size of maskableSizes) {
    await render(maskableSvg, size, join(iconsDir, `maskable-${size}x${size}.png`));
  }

  // apple-touch-icon: opaque 180x180 from the full-bleed master (iOS applies its own squircle)
  await render(anySvg, 180, join(root, 'public', 'apple-touch-icon.png'));

  // favicon: 32x32 from the two-arc favicon master
  await render(faviconSvg, 32, join(root, 'public', 'favicon.png'));

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);

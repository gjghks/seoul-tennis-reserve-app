import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = join(__dirname, '../public/icons/icon.svg');
const outputDir = join(__dirname, '../public/icons');

async function generateIcons() {
  await mkdir(outputDir, { recursive: true });

  for (const size of sizes) {
    const outputPath = join(outputDir, `icon-${size}x${size}.png`);
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated: icon-${size}x${size}.png`);
  }

  const appleTouchIcon = join(__dirname, '../public/apple-touch-icon.png');
  await sharp(inputSvg)
    .resize(180, 180)
    .png()
    .toFile(appleTouchIcon);
  console.log('Generated: apple-touch-icon.png');

  const favicon = join(__dirname, '../public/favicon.ico');
  await sharp(inputSvg)
    .resize(32, 32)
    .png()
    .toFile(favicon.replace('.ico', '.png'));
  console.log('Generated: favicon.png');

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);

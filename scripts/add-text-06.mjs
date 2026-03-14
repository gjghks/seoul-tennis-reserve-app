import sharp from 'sharp';
import { join } from 'path';

const DRAFTS = join(import.meta.dirname, '..', 'public', 'icons', 'drafts');

async function run() {
  // Render base icon SVG (no text) to PNG
  const basePng = await sharp(join(DRAFTS, '06-nb-split.svg'), { density: 300 })
    .resize(512, 512)
    .png()
    .toBuffer();

  // Create "서울" text with Noto Sans CJK KR Black
  const seoulText = await sharp({
    text: {
      text: '<span foreground="#000000" font_desc="Noto Sans CJK KR Black 68">서울</span>',
      rgba: true,
      dpi: 72,
    }
  }).png().toBuffer();

  // Create "테니스" text
  const tennisText = await sharp({
    text: {
      text: '<span foreground="#000000" font_desc="Noto Sans CJK KR Black 56">테니스</span>',
      rgba: true,
      dpi: 72,
    }
  }).png().toBuffer();

  // Get text dimensions for centering
  const seoulMeta = await sharp(seoulText).metadata();
  const tennisMeta = await sharp(tennisText).metadata();

  const seoulX = Math.round((512 - seoulMeta.width) / 2);
  const tennisX = Math.round((512 - tennisMeta.width) / 2);

  console.log(`SEOUL: ${seoulMeta.width}x${seoulMeta.height}, x=${seoulX}`);
  console.log(`TENNIS: ${tennisMeta.width}x${tennisMeta.height}, x=${tennisX}`);

  // Composite both texts centered (adjusted vertical positions for larger text)
  await sharp(basePng)
    .composite([
      { input: seoulText, left: seoulX, top: 345 },
      { input: tennisText, left: tennisX, top: 415 },
    ])
    .toFile(join(DRAFTS, '06-nb-split.png'));

  console.log('OK: 06-nb-split with centered text');
}

run().catch(console.error);

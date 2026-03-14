import sharp from 'sharp';
import { join } from 'path';

const DRAFTS_DIR = join(import.meta.dirname, '..', 'public', 'icons', 'drafts');
const INPUT = join(DRAFTS_DIR, '06-nb-split-flat.svg');

const PIXEL_SIZES = [32, 48, 64]; // try multiple grid sizes
const OUTPUT_SIZE = 512;

async function pixelate() {
  for (const size of PIXEL_SIZES) {
    const output = join(DRAFTS_DIR, `06-pixel-${size}x.png`);
    
    // Step 1: Render SVG at low resolution
    const lowRes = await sharp(INPUT, { density: 72 })
      .resize(size, size, { fit: 'fill' })
      .png()
      .toBuffer();
    
    // Step 2: Scale up with nearest-neighbor (no interpolation = pixel art)
    await sharp(lowRes)
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, { 
        kernel: 'nearest',
        fit: 'fill'
      })
      .png()
      .toFile(output);
    
    console.log(`OK: ${size}x${size} -> ${OUTPUT_SIZE}x${OUTPUT_SIZE}  (${output.split('/').pop()})`);
  }
  
  console.log(`\nDone. Check the ${PIXEL_SIZES.length} variants.`);
}

pixelate().catch(console.error);

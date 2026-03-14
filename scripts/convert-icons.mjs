import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';

const DRAFTS_DIR = join(import.meta.dirname, '..', 'public', 'icons', 'drafts');

async function convert() {
  const files = await readdir(DRAFTS_DIR);
  const svgs = files.filter(f => f.endsWith('.svg'));
  
  for (const svg of svgs) {
    const input = join(DRAFTS_DIR, svg);
    const output = join(DRAFTS_DIR, svg.replace('.svg', '.png'));
    
    await sharp(input, { density: 300 })
      .resize(512, 512)
      .png()
      .toFile(output);
    
    console.log(`OK: ${svg} -> ${svg.replace('.svg', '.png')}`);
  }
  
  console.log(`\nConverted ${svgs.length} files.`);
}

convert().catch(console.error);

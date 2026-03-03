/**
 * Verify that all independent courts correctly match their enrichment data.
 * Run with: npx tsx scripts/verify-enrichment-matching.ts
 */

import { getIndependentCourts } from '../lib/data/independentCourts';
import { findEnrichment } from '../lib/data/facilityEnrichment';

const courts = getIndependentCourts();
const newCourts = courts.filter(c => {
  const prefix = c.SVCID.replace(/\d+$/, '');
  return !['INDEP_GB', 'INDEP_NW', 'INDEP_DD', 'INDEP_EP', 'INDEP_JN', 'INDEP_YD'].includes(prefix);
});

console.log(`\n=== Enrichment Matching Verification ===`);
console.log(`Total independent courts: ${courts.length}`);
console.log(`New courts to verify: ${newCourts.length}\n`);

let matched = 0;
let unmatched = 0;

for (const court of newCourts) {
  const enrichment = findEnrichment(court.SVCNM, court.AREANM, court.PLACENM);
  
  if (enrichment) {
    matched++;
    console.log(`✅ ${court.SVCID} | ${court.AREANM} | ${court.SVCNM}`);
    console.log(`   → matched: "${enrichment.facilityName}" (normalized: "${enrichment.normalizedName}")`);
    console.log(`   → courtCount: indep=${court.DTLCONT.match(/(\d+)면/)?.[1] ?? '?'} vs enrichment=${enrichment.courtCount}`);
    console.log(`   → surface: ${enrichment.surfaceDisplay}`);
  } else {
    unmatched++;
    console.log(`❌ ${court.SVCID} | ${court.AREANM} | ${court.SVCNM}`);
    console.log(`   PLACENM: "${court.PLACENM}"`);
  }
}

console.log(`\n=== Summary ===`);
console.log(`Matched: ${matched}/${newCourts.length}`);
console.log(`Unmatched: ${unmatched}/${newCourts.length}`);

// Also verify ALL courts (old + new)
console.log(`\n=== All Courts Verification ===`);
let allMatched = 0;
let allUnmatched = 0;

for (const court of courts) {
  const enrichment = findEnrichment(court.SVCNM, court.AREANM, court.PLACENM);
  if (enrichment) {
    allMatched++;
  } else {
    allUnmatched++;
    console.log(`❌ ${court.SVCID} | ${court.AREANM} | PLACENM="${court.PLACENM}" | SVCNM="${court.SVCNM}"`);
  }
}

console.log(`All courts: ${allMatched}/${courts.length} matched, ${allUnmatched} unmatched`);

if (unmatched > 0) {
  process.exit(1);
}

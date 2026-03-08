/**
 * Verify coordinates for all 24 new independent courts.
 * Checks: range validity, enrichment coordinate comparison, precision, mapPOIName.
 * Run with: npx tsx scripts/verify-coords-map.ts
 */

import { getIndependentCourts } from '../lib/data/independentCourts';
import { findEnrichment, getMapPOIName, getEnrichmentCoordinates } from '../lib/data/facilityEnrichment';

const NEW_PREFIXES = ['GN', 'GD', 'GS', 'GJ', 'GA', 'SC', 'SD', 'SP', 'YC', 'MP', 'GR'];

const courts = getIndependentCourts().filter(c =>
  NEW_PREFIXES.some(p => c.SVCID.includes(`_${p}`))
);

console.log(`\n=== ${courts.length}개 신규 독립 코트 좌표 검증 ===\n`);

// 1. Range validation
console.log('--- 1. 서울 범위 유효성 (X: 126.7~127.2, Y: 37.4~37.7) ---');
let rangeOk = 0;
for (const c of courts) {
  const x = parseFloat(c.X);
  const y = parseFloat(c.Y);
  const xOk = x >= 126.7 && x <= 127.2;
  const yOk = y >= 37.4 && y <= 37.7;
  if (!xOk || !yOk) {
    console.log(`  ❌ ${c.SVCID} ${c.SVCNM}: X=${c.X} (${xOk?'OK':'OUT'}), Y=${c.Y} (${yOk?'OK':'OUT'})`);
  } else {
    rangeOk++;
  }
}
console.log(`  ✅ ${rangeOk}/${courts.length} 범위 내\n`);

// 2. Precision check
console.log('--- 2. 좌표 정밀도 (소수점 4자리 미만 = ~11m 오차) ---');
let precisionIssues = 0;
for (const c of courts) {
  const xDec = c.X.includes('.') ? c.X.split('.')[1].length : 0;
  const yDec = c.Y.includes('.') ? c.Y.split('.')[1].length : 0;
  if (xDec < 4 || yDec < 4) {
    console.log(`  ⚠️  ${c.SVCID} ${c.SVCNM}: X ${xDec}자리, Y ${yDec}자리`);
    precisionIssues++;
  }
}
if (precisionIssues === 0) console.log('  ✅ 모두 4자리 이상');
console.log();

// 3. Enrichment matching + coordinate comparison
console.log('--- 3. enrichment 매칭 & 좌표 비교 ---');
console.log('SVCID       | 코트명                          | X(lng)    | Y(lat)    | enr.lng    | enr.lat    | mapPOIName                    | 거리');
console.log('-'.repeat(150));

const results: Array<{svcid: string; name: string; x: string; y: string; enrichLng: string; enrichLat: string; mapPOI: string; distance: string; matched: boolean}> = [];

for (const c of courts) {
  const enrichment = findEnrichment(c.SVCNM, c.AREANM, c.PLACENM);
  const enrichCoords = getEnrichmentCoordinates(c.SVCNM, c.AREANM, c.PLACENM);
  const mapPOI = getMapPOIName(c.SVCNM, c.AREANM, c.PLACENM);
  
  const x = parseFloat(c.X);
  const y = parseFloat(c.Y);
  
   const enrichLng = enrichment ? (enrichment.longitude ? String(enrichment.longitude) : 'none') : 'NO MATCH';
   const enrichLat = enrichment ? (enrichment.latitude ? String(enrichment.latitude) : 'none') : 'NO MATCH';
  let distance = '-';
  
  if (enrichCoords) {
    const dLat = (enrichCoords.latitude - y) * 111320;
    const dLng = (enrichCoords.longitude - x) * 111320 * Math.cos(y * Math.PI / 180);
    const dist = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
    distance = dist > 1000 ? `❌ ${dist}m` : dist > 500 ? `⚠️ ${dist}m` : `${dist}m`;
  }
  
  const name = c.SVCNM.substring(0, 28).padEnd(28);
  const poi = (mapPOI || 'none').substring(0, 28).padEnd(28);
  console.log(`${c.SVCID.padEnd(12)}| ${name} | ${c.X.padEnd(9)} | ${c.Y.padEnd(9)} | ${enrichLng.padEnd(10)} | ${enrichLat.padEnd(10)} | ${poi} | ${distance}`);
  
  results.push({
    svcid: c.SVCID,
    name: c.SVCNM,
    x: c.X, y: c.Y,
    enrichLng, enrichLat,
    mapPOI: mapPOI || 'none',
    distance,
    matched: !!enrichment
  });
}

// 4. Summary
console.log('\n--- 4. 요약 ---');
const matched = results.filter(r => r.matched);
const withCoords = results.filter(r => r.enrichLng !== 'none' && r.enrichLng !== 'NO MATCH');
const withPOI = results.filter(r => r.mapPOI !== 'none');
const noEnrichCoords = results.filter(r => r.matched && r.enrichLng === 'none');

console.log(`enrichment 매칭: ${matched.length}/${courts.length}`);
console.log(`enrichment 좌표 있음: ${withCoords.length}/${courts.length}`);
console.log(`enrichment 좌표 없음 (매칭됐지만): ${noEnrichCoords.length}개`);
console.log(`mapPOIName 있음: ${withPOI.length}/${courts.length}`);

if (noEnrichCoords.length > 0) {
  console.log('\n  enrichment 좌표 없는 코트:');
  for (const r of noEnrichCoords) {
    console.log(`    ${r.svcid} ${r.name}`);
  }
}

// 5. Kakao Map links for verification
console.log('\n--- 5. 카카오맵 검증 링크 (마커 위치 확인용) ---');
for (const c of courts) {
  const name = encodeURIComponent(c.PLACENM);
  console.log(`${c.SVCID} ${c.SVCNM}:`);
  console.log(`  마커: https://map.kakao.com/link/map/${name},${c.Y},${c.X}`);
  console.log(`  길찾기: https://map.kakao.com/link/to/${name},${c.Y},${c.X}`);
}

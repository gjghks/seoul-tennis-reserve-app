import { getIndependentCourts } from './lib/data/independentCourts';
import { findEnrichment } from './lib/data/facilityEnrichment';

const NEW_PREFIXES = ['GN', 'GD', 'GS', 'GJ', 'GA', 'SC', 'SD', 'SP', 'YC', 'MP', 'GR'];

const courts = getIndependentCourts().filter(c => 
  NEW_PREFIXES.some(p => c.SVCID.includes(`_${p}`))
);

console.log(`\n=== ${courts.length}개 신규 독립 코트 좌표 검증 ===\n`);

// 1. Basic range validation
console.log('--- 1. 서울 범위 유효성 검사 (X: 126.7~127.2, Y: 37.4~37.7) ---');
const rangeIssues: string[] = [];
for (const c of courts) {
  const x = parseFloat(c.X);
  const y = parseFloat(c.Y);
  const xOk = x >= 126.7 && x <= 127.2;
  const yOk = y >= 37.4 && y <= 37.7;
  if (!xOk || !yOk) {
    rangeIssues.push(`❌ ${c.SVCID} ${c.SVCNM}: X=${c.X} (${xOk?'OK':'OUT'}), Y=${c.Y} (${yOk?'OK':'OUT'})`);
  }
}
if (rangeIssues.length === 0) {
  console.log('✅ 모든 코트 좌표가 서울 범위 내에 있습니다.\n');
} else {
  rangeIssues.forEach(i => console.log(i));
  console.log();
}

// 2. Enrichment coordinate comparison
console.log('--- 2. enrichment 좌표 vs independentCourts 좌표 비교 ---');
console.log('SVCID | 코트명 | X(lng) | Y(lat) | enrich.lng | enrich.lat | mapPOIName | 차이(m)');
console.log('-'.repeat(120));

for (const c of courts) {
  const enrichment = findEnrichment(c.SVCNM, c.AREANM, c.PLACENM);
  const x = parseFloat(c.X);
  const y = parseFloat(c.Y);
  
  let enrichLng = '-';
  let enrichLat = '-';
  let mapPOI = '-';
  let distance = '-';
  
  if (enrichment) {
    enrichLng = enrichment.longitude ? String(enrichment.longitude) : 'none';
    enrichLat = enrichment.latitude ? String(enrichment.latitude) : 'none';
    mapPOI = enrichment.mapPOIName || 'none';
    
    if (enrichment.longitude && enrichment.latitude) {
      // Approximate distance in meters using Haversine simplified
      const dLat = (enrichment.latitude - y) * 111320;
      const dLng = (enrichment.longitude - x) * 111320 * Math.cos(y * Math.PI / 180);
      const dist = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
      distance = `${dist}m`;
      if (dist > 500) distance = `⚠️ ${dist}m`;
      if (dist > 1000) distance = `❌ ${dist}m`;
    }
  } else {
    enrichLng = 'NO MATCH';
    enrichLat = 'NO MATCH';
  }
  
  const name = c.SVCNM.padEnd(20);
  console.log(`${c.SVCID} | ${name} | ${c.X} | ${c.Y} | ${enrichLng} | ${enrichLat} | ${mapPOI} | ${distance}`);
}

// 3. Coordinate precision check
console.log('\n--- 3. 좌표 정밀도 검사 ---');
for (const c of courts) {
  const x = c.X;
  const y = c.Y;
  const xDecimals = x.includes('.') ? x.split('.')[1].length : 0;
  const yDecimals = y.includes('.') ? y.split('.')[1].length : 0;
  if (xDecimals < 4 || yDecimals < 4) {
    console.log(`⚠️ ${c.SVCID} ${c.SVCNM}: X 소수점 ${xDecimals}자리, Y 소수점 ${yDecimals}자리 (4자리 미만 = 약 11m 오차)`);
  }
}

// 4. Generate Kakao Map verification links
console.log('\n--- 4. 카카오맵 검증 링크 ---');
for (const c of courts) {
  const name = encodeURIComponent(c.PLACENM);
  const y = c.Y;
  const x = c.X;
  console.log(`${c.SVCID} ${c.SVCNM}:`);
  console.log(`  마커: https://map.kakao.com/link/map/${name},${y},${x}`);
  console.log(`  검색: https://map.kakao.com/?q=${encodeURIComponent(c.SVCNM)}`);
}

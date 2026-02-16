import type { FacilityEnrichment, SurfaceCategory } from './facilityEnrichment.types';
import FACILITY_DATA from './facilityEnrichment.data';

export type { FacilityEnrichment, SurfaceCategory } from './facilityEnrichment.types';

/**
 * Alias mapping for known PLACENM mismatches between Seoul API and XLSX data.
 * Keys = normalized PLACENM from API, Values = normalizedName in XLSX.
 */
const PLACE_ALIASES: Record<string, string> = {
  // 한강공원 naming (API "한강공원" ↔ XLSX "한강시민공원...지구")
  '이촌한강공원': '한강시민공원이촌지구',
  '뚝섬한강공원': '한강시민공원뚝섬지구',
  '광나루한강공원': '한강시민공원광나루지구',
  '망원한강': '한강공원망원지구',
  // Facility name changes / variations
  '한남': '응봉근린공원한남',
  '손기정문화체육센터': '손기정체육공원',
  '정릉': '정릉체육시설',
  '동작구': '동작주차공원',
  '서울에너지공사목동': '목동',
  '서울숲': '뚝섬서울숲',
};

function normalize(name: string): string {
  return name
    .replace(/\s+/g, '')
    .replace(/코트이용/g, '')
    .replace(/테니스경기장/g, '')
    .replace(/테니스장/g, '')
    .replace(/테니스\(.+?\)/g, '')
    .replace(/테니스/g, '')
    .toLowerCase();
}

/**
 * Normalize a PLACENM value from the Seoul API.
 * PLACENM is much cleaner than SVCNM and is the primary matching key.
 */
function normalizePlacenm(placenm: string): string {
  let cleaned = placenm;

  // Handle > paths (e.g. "서울물재생시설공단>탄천물재생센터")
  if (cleaned.includes('>')) {
    const parts = cleaned.split('>');
    const after = parts[parts.length - 1].trim();
    const before = parts[0].trim();
    const afterNorm = normalize(after);
    cleaned = afterNorm.length > 2 ? after : before;
  }

  cleaned = cleaned
    .replace(/\s*\d+면\s*$/, '')   // trailing court face (1면, 2면)
    .replace(/\s*테스트\s*$/, ''); // "테스트" suffix

  return normalize(cleaned);
}

/**
 * Extract a matchable place name from SVCNM (service name).
 * SVCNM is highly inconsistent; this is a best-effort cleanup used as fallback.
 */
function extractPlaceName(svcnm: string): string {
  return normalize(
    svcnm
      .replace(/\([^)]*\)/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/\d{1,2}\/\d{1,2}\s*~\s*\d{0,2}\/?\d{1,2}/g, '')
      .replace(/\d{1,2}월\d{1,2}일(~\d{1,2}(월\d{1,2})?일)?/g, '')
      .replace(/\d{1,2}월_?/g, '')
      .replace(/\d{2,4}년_?/g, '')
      .replace(/\d+번\s*코트/g, '')
      .replace(/[A-Za-z]코트/g, '')
      .replace(/\d+면/g, '')
      .replace(/평일|주말|주간|야간|공휴일|할증|낮|접수|대관|이용|예약/g, '')
      .replace(/\d{1,2}[:시]\d{0,2}(~\d{1,2}[:시]\d{0,2})?/g, '')
      .replace(/[/\-,.·]/g, ' ')
      .trim()
  );
}

const indexByDistrict = new Map<string, FacilityEnrichment[]>();
const indexByKey = new Map<string, FacilityEnrichment>();

for (const f of FACILITY_DATA) {
  const existing = indexByDistrict.get(f.district) ?? [];
  existing.push(f);
  indexByDistrict.set(f.district, existing);
  indexByKey.set(`${f.district}:${f.normalizedName}`, f);
}

function fuzzyMatch(target: string, candidates: FacilityEnrichment[]): FacilityEnrichment | null {
  if (!target) return null;

  for (const f of candidates) {
    if (target === f.normalizedName) return f;
  }

  let bestMatch: FacilityEnrichment | null = null;
  let bestScore = 0;

  for (const f of candidates) {
    const norm = f.normalizedName;
    if (target.includes(norm) || norm.includes(target)) {
      const score = Math.min(target.length, norm.length) / Math.max(target.length, norm.length);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = f;
      }
    }
  }

  return bestScore >= 0.3 ? bestMatch : null;
}

function resolveAlias(normalized: string, areanm: string): FacilityEnrichment | null {
  const alias = PLACE_ALIASES[normalized];
  if (!alias) return null;
  return indexByKey.get(`${areanm}:${alias}`) ?? null;
}

export function findEnrichment(svcnm: string, areanm: string, placenm?: string): FacilityEnrichment | null {
  const candidates = indexByDistrict.get(areanm);
  if (!candidates) return null;

  // Strategy 1: PLACENM (most reliable — cleaner than SVCNM)
  if (placenm) {
    const normPlace = normalizePlacenm(placenm);

    const aliasMatch = resolveAlias(normPlace, areanm);
    if (aliasMatch) return aliasMatch;

    const placeMatch = fuzzyMatch(normPlace, candidates);
    if (placeMatch) return placeMatch;
  }

  // Strategy 2: SVCNM (fallback for generic PLACENMs like "테니스장 A코트")
  const target = extractPlaceName(svcnm);
  if (target) {
    const aliasMatch = resolveAlias(target, areanm);
    if (aliasMatch) return aliasMatch;

    return fuzzyMatch(target, candidates);
  }

  return null;
}

export function getAllFacilities(): FacilityEnrichment[] {
  return FACILITY_DATA;
}

export function getFacilitiesByDistrict(district: string): FacilityEnrichment[] {
  return indexByDistrict.get(district) ?? [];
}

export const SURFACE_LABELS: Record<SurfaceCategory, string> = {
  clay: '클레이',
  artificial_grass: '인조잔디',
  hard: '하드코트',
  mixed: '혼합',
  other: '기타',
  unknown: '정보 없음',
};

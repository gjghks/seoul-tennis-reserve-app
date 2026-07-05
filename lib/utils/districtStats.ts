import { SeoulService } from '@/lib/seoulApi';
import { isIndependentCourt } from '@/lib/data/independentCourts';
import { isCourtAvailable } from '@/lib/utils/courtStatus';
import { facilityKeyOf } from '@/lib/utils/tennisDistrictStats';
import { DISTRICTS, KOREAN_TO_SLUG } from '@/lib/constants/districts';

export interface DistrictGuideStats {
  nameKo: string;
  slug: string;
  totalCourts: number;
  externalCourts: number;
  availableCourts: number;
  availableRate: number; // 0~100
  freeCourts: number;
  freeRate: number; // 0~100
  paidCourts: number;
  competitionRate: number; // 마감 비율 0~100 (높을수록 경쟁 치열)
  earliestOpen: string | null; // e.g. "06:00"
  latestClose: string | null; // e.g. "22:00"
  courtNames: string[];
  placeNames: string[];
  hasExternalOnly: boolean; // true if ALL courts in this district use external reservation
}

export interface AllDistrictStats {
  districts: DistrictGuideStats[];
  seoulAverage: {
    totalCourts: number;
    availableRate: number;
    freeRate: number;
    competitionRate: number;
  };
  totalCourtsSeoul: number;
  totalAvailableSeoul: number;
  lastUpdated: string;
}

function parseTime(timeStr: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.replace(/[^0-9:]/g, '');
  const parts = clean.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function computeDistrictStats(services: SeoulService[]): DistrictGuideStats {
  // Facility-level aggregation: collapse reservation rows (court × time-block ×
  // date-range) to physical facilities via PLACENM, matching the home page. Counts
  // and their paired rates (available/free) are therefore per-facility, so "시설 수"
  // means real courts, not the volatile number of open reservation windows.
  const facilities = new Map<string, { available: boolean; external: boolean; free: boolean }>();
  for (const s of services) {
    const key = facilityKeyOf(s);
    const available = isCourtAvailable(s.SVCSTATNM);
    const external = isIndependentCourt(s.SVCID);
    const free = s.PAYATNM === '무료';
    const prev = facilities.get(key);
    if (prev) {
      // A facility qualifies if ANY of its reservation services qualifies.
      prev.available = prev.available || available;
      prev.external = prev.external || external;
      prev.free = prev.free || free;
    } else {
      facilities.set(key, { available, external, free });
    }
  }

  let total = 0;
  let available = 0;
  let externalCount = 0;
  let free = 0;
  for (const f of facilities.values()) {
    total++;
    if (f.available) available++;
    if (f.external) externalCount++;
    if (f.free) free++;
  }
  const seoulApiTotal = total - externalCount; // Seoul-API facilities (exclude external)

  // Competition (마감 비율) stays ROW-based on purpose: it measures how booked-up the
  // actual reservation windows are. A facility-level closed-rate would collapse to the
  // mere complement of availability and lose that signal.
  const seoulApiRows = services.filter(s => !isIndependentCourt(s.SVCID)).length;
  const closedRows = services.filter(s => s.SVCSTATNM === '예약마감' && !isIndependentCourt(s.SVCID)).length;

  let earliestMinutes: number | null = null;
  let latestMinutes: number | null = null;

  for (const svc of services) {
    const openMin = parseTime(svc.V_MIN);
    const closeMin = parseTime(svc.V_MAX);
    if (openMin !== null && (earliestMinutes === null || openMin < earliestMinutes)) {
      earliestMinutes = openMin;
    }
    if (closeMin !== null && (latestMinutes === null || closeMin > latestMinutes)) {
      latestMinutes = closeMin;
    }
  }

  const district = services[0]?.AREANM || '';
  const slug = KOREAN_TO_SLUG[district] || '';

  return {
    nameKo: district,
    slug,
    totalCourts: total,
    externalCourts: externalCount,
    availableCourts: available,
    availableRate: seoulApiTotal > 0 ? Math.round((available / seoulApiTotal) * 100) : 0,
    freeCourts: free,
    freeRate: total > 0 ? Math.round((free / total) * 100) : 0,
    paidCourts: total - free,
    competitionRate: seoulApiRows > 0 ? Math.round((closedRows / seoulApiRows) * 100) : 0,
    earliestOpen: earliestMinutes !== null ? minutesToTime(earliestMinutes) : null,
    latestClose: latestMinutes !== null ? minutesToTime(latestMinutes) : null,
    courtNames: [...new Set(services.map(s => s.SVCNM))],
    placeNames: [...new Set(services.map(s => s.PLACENM))],
    hasExternalOnly: total > 0 && externalCount === total,
  };
}

export function computeAllDistrictStats(allServices: SeoulService[]): AllDistrictStats {
  const byDistrict: Record<string, SeoulService[]> = {};
  for (const svc of allServices) {
    if (!byDistrict[svc.AREANM]) {
      byDistrict[svc.AREANM] = [];
    }
    byDistrict[svc.AREANM].push(svc);
  }

  const districtStats: DistrictGuideStats[] = DISTRICTS
    .filter(d => byDistrict[d.nameKo] && byDistrict[d.nameKo].length > 0)
    .map(d => computeDistrictStats(byDistrict[d.nameKo]));

  const districtServices = DISTRICTS
    .map(d => byDistrict[d.nameKo] || [])
    .flat();

  districtStats.sort((a, b) => b.totalCourts - a.totalCourts);

  // Facility-based totals (counts + available/free rates).
  const totalCourts = districtStats.reduce((sum, d) => sum + d.totalCourts, 0);
  const totalAvailable = districtStats.reduce((sum, d) => sum + d.availableCourts, 0);
  const totalFree = districtStats.reduce((sum, d) => sum + d.freeCourts, 0);
  const totalExternal = districtStats.reduce((sum, d) => sum + d.externalCourts, 0);
  const totalSeoulApi = totalCourts - totalExternal; // Seoul-API facilities

  // Competition stays ROW-based, so its denominator must also be rows (Seoul-API
  // reservation windows), NOT the facility count — otherwise rows/facilities > 100%.
  const totalSeoulApiRows = districtServices.filter(s => !isIndependentCourt(s.SVCID)).length;
  const totalClosed = districtServices.filter(
    s => s.SVCSTATNM === '예약마감' && !isIndependentCourt(s.SVCID)
  ).length;

  return {
    districts: districtStats,
    seoulAverage: {
      totalCourts: districtStats.length > 0 ? Math.round(totalCourts / districtStats.length) : 0,
      availableRate: totalSeoulApi > 0 ? Math.round((totalAvailable / totalSeoulApi) * 100) : 0,
      freeRate: totalCourts > 0 ? Math.round((totalFree / totalCourts) * 100) : 0,
      competitionRate: totalSeoulApiRows > 0 ? Math.round((totalClosed / totalSeoulApiRows) * 100) : 0,
    },
    totalCourtsSeoul: totalCourts,
    totalAvailableSeoul: totalAvailable,
    lastUpdated: new Date().toISOString(),
  };
}

export function getDistrictRank(stats: AllDistrictStats, districtNameKo: string, key: keyof DistrictGuideStats): number {
  const sorted = [...stats.districts].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return bVal - aVal;
    }
    return 0;
  });
  return sorted.findIndex(d => d.nameKo === districtNameKo) + 1;
}

export function getCompetitionLabel(rate: number): string {
  if (rate >= 70) return '매우 높음';
  if (rate >= 50) return '높음';
  if (rate >= 30) return '보통';
  if (rate >= 10) return '낮음';
  return '매우 낮음';
}

export function getCompetitionStars(rate: number): string {
  if (rate >= 80) return '★★★★★';
  if (rate >= 60) return '★★★★';
  if (rate >= 40) return '★★★';
  if (rate >= 20) return '★★';
  return '★';
}

import { SeoulService } from '@/lib/seoulApi';
import { isCourtAvailable } from '@/lib/utils/courtStatus';
import { DISTRICTS, KOREAN_TO_SLUG } from '@/lib/constants/districts';

export interface DistrictGuideStats {
  nameKo: string;
  slug: string;
  totalCourts: number;
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
  const total = services.length;
  const available = services.filter(s => isCourtAvailable(s.SVCSTATNM)).length;
  const free = services.filter(s => s.PAYATNM === '무료').length;
  const closedCount = services.filter(s => s.SVCSTATNM === '예약마감').length;

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
    availableCourts: available,
    availableRate: total > 0 ? Math.round((available / total) * 100) : 0,
    freeCourts: free,
    freeRate: total > 0 ? Math.round((free / total) * 100) : 0,
    paidCourts: total - free,
    competitionRate: total > 0 ? Math.round((closedCount / total) * 100) : 0,
    earliestOpen: earliestMinutes !== null ? minutesToTime(earliestMinutes) : null,
    latestClose: latestMinutes !== null ? minutesToTime(latestMinutes) : null,
    courtNames: [...new Set(services.map(s => s.SVCNM))],
    placeNames: [...new Set(services.map(s => s.PLACENM))],
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

  districtStats.sort((a, b) => b.totalCourts - a.totalCourts);

  const totalCourts = districtStats.reduce((sum, d) => sum + d.totalCourts, 0);
  const totalAvailable = districtStats.reduce((sum, d) => sum + d.availableCourts, 0);
  const totalFree = districtStats.reduce((sum, d) => sum + d.freeCourts, 0);
  const totalClosed = districtStats.reduce((sum, d) => sum + Math.round(d.competitionRate * d.totalCourts / 100), 0);

  return {
    districts: districtStats,
    seoulAverage: {
      totalCourts: districtStats.length > 0 ? Math.round(totalCourts / districtStats.length) : 0,
      availableRate: totalCourts > 0 ? Math.round((totalAvailable / totalCourts) * 100) : 0,
      freeRate: totalCourts > 0 ? Math.round((totalFree / totalCourts) * 100) : 0,
      competitionRate: totalCourts > 0 ? Math.round((totalClosed / totalCourts) * 100) : 0,
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

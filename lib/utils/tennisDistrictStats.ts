import type { SeoulService } from '@/lib/seoulApi';
import type { DistrictStats } from '@/contexts/TennisDataContext';
import { isCourtAvailable } from '@/lib/utils/courtStatus';
import { isIndependentCourt } from '@/lib/data/independentCourts';

/**
 * Seoul-API places that are split into several PLACENMs (one per bookable court)
 * but are ONE physical facility. Keyed by `AREANM|PLACENM.trim()` (raw), value is
 * the shared facility key. Explicit list on purpose — do NOT replace it with
 * facilityEnrichment's normalizePlacenm(), which would also merge unrelated places.
 * (2026-09-29 25개 구 감사 #22·#94)
 */
const FACILITY_GROUP_KEY: Readonly<Record<string, string>> = {
  // 서울어린이대공원 테니스장 (서울시설공단): yeyak에 실외 A·B코트가 별도 PLACENM으로 등록
  '광진구|테니스장 A코트': '서울어린이대공원 테니스장',
  '광진구|테니스장 B코트': '서울어린이대공원 테니스장',
  // 서울에너지공사 목동 청사 테니스장 (목동서로 20): 1면·2면이 별도 PLACENM으로 등록
  '양천구|서울에너지공사 목동 테니스장 1면': '서울에너지공사 목동 청사 테니스장',
  '양천구|서울에너지공사 목동 테니스장 2면': '서울에너지공사 목동 청사 테니스장',
};

/**
 * Identity key for a physical facility, used to collapse the many reservation
 * "service" rows (court × time-block × date-range) the Seoul API returns into
 * one entry per real court.
 *
 * Uses RAW (trim-only) PLACENM — do NOT swap in facilityEnrichment's
 * normalizePlacenm(), which strips suffixes generically and can merge distinct
 * facilities. Known cases where one facility is split across several PLACENMs
 * are collapsed through the explicit FACILITY_GROUP_KEY table instead.
 *
 * Unique within a district only (callers aggregate per AREANM); use
 * facilityIdentityOf() for a city-wide key.
 * Falls back to SVCID so rows with a missing place name are never collapsed.
 */
export function facilityKeyOf(svc: SeoulService): string {
  const place = svc.PLACENM?.trim();
  if (!place) return svc.SVCID;
  return FACILITY_GROUP_KEY[`${svc.AREANM}|${place}`] ?? place;
}

/** City-wide facility identity: `AREANM|facilityKeyOf(svc)`. */
export function facilityIdentityOf(svc: SeoulService): string {
  return `${svc.AREANM}|${facilityKeyOf(svc)}`;
}

/**
 * Build per-district headline stats keyed by **physical facility**, not by
 * reservation service row.
 *
 * The Seoul open-data API returns one row per bookable "service" — a single
 * court × time-block × date-range window. A single tennis facility therefore
 * appears as many rows (e.g. 삼청테니스장 ≈ 24 rows, 한남테니스장 ≈ 20 rows), and the
 * raw row count swings 300↔400 as the city posts and expires reservation
 * windows. That churn made the home "전체 시설" figure fluctuate even though the
 * number of real courts is stable (~79 city-wide).
 *
 * We collapse rows to facilities using facilityKeyOf() (raw PLACENM plus the explicit
 * FACILITY_GROUP_KEY merges), so `count`/`available`/`externalCount` all describe facilities:
 *   - count:         distinct facilities in the district
 *   - available:     facilities with at least one currently-open reservation
 *   - externalCount: facilities reserved outside the Seoul API (independent courts)
 *
 * Keeping `available` facility-based (rather than row-based) is required for the
 * home headline numbers to stay coherent — otherwise "예약 가능"(rows) could exceed
 * "공공 테니스장"(facilities).
 *
 * `availableSlots` is the RAW row-based count of open reservation services (회차), kept
 * so the per-district grid badge can still match the district detail page's "접수중만 (N)".
 */
export function buildByDistrict(services: SeoulService[]): Record<string, DistrictStats> {
  // area -> facilityKey -> aggregated facility-level flags
  const facilities = new Map<string, Map<string, { available: boolean; external: boolean }>>();
  // area -> count of open reservation rows (not deduped)
  const openSlots = new Map<string, number>();

  for (const svc of services) {
    const area = svc.AREANM;
    const facilityKey = facilityKeyOf(svc);

    let byFacility = facilities.get(area);
    if (!byFacility) {
      byFacility = new Map();
      facilities.set(area, byFacility);
    }

    const available = isCourtAvailable(svc.SVCSTATNM);
    const external = isIndependentCourt(svc.SVCID);
    if (available) openSlots.set(area, (openSlots.get(area) ?? 0) + 1);

    const prev = byFacility.get(facilityKey);
    if (prev) {
      // A facility counts as available/external if ANY of its services qualifies.
      prev.available = prev.available || available;
      prev.external = prev.external || external;
    } else {
      byFacility.set(facilityKey, { available, external });
    }
  }

  const result: Record<string, DistrictStats> = {};
  for (const [area, byFacility] of facilities) {
    let count = 0;
    let available = 0;
    let externalCount = 0;
    for (const facility of byFacility.values()) {
      count++;
      if (facility.available) available++;
      if (facility.external) externalCount++;
    }
    result[area] = { count, available, externalCount, availableSlots: openSlots.get(area) ?? 0 };
  }
  return result;
}

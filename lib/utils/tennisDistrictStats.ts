import type { SeoulService } from '@/lib/seoulApi';
import type { DistrictStats } from '@/contexts/TennisDataContext';
import { isCourtAvailable } from '@/lib/utils/courtStatus';
import { isIndependentCourt } from '@/lib/data/independentCourts';

/**
 * Identity key for a physical facility, used to collapse the many reservation
 * "service" rows (court × time-block × date-range) the Seoul API returns into
 * one entry per real court.
 *
 * Uses RAW (trim-only) PLACENM — do NOT swap in facilityEnrichment's
 * normalizePlacenm(). On the live dataset the raw (AREANM|PLACENM) partition is
 * identical to the (AREANM|X,Y) coordinate partition (both = 79 facilities), so
 * raw PLACENM already maps 1:1 to physical courts. normalizePlacenm strips a
 * trailing "N면", which would wrongly MERGE coordinate-distinct courts such as
 * 양천구 "…목동 테니스장 1면" and "…2면" into one — under-counting facilities.
 *
 * Falls back to SVCID so rows with a missing place name are never collapsed.
 */
export function facilityKeyOf(svc: SeoulService): string {
  return svc.PLACENM?.trim() || svc.SVCID;
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
 * We collapse rows to facilities using PLACENM (which aligns 1:1 with the court
 * coordinates), so `count`/`available`/`externalCount` all describe facilities:
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

import type { SeoulService, ServedDataMeta } from '@/lib/seoulApi';
import { isIndependentCourt } from '@/lib/data/independentCourts';

export type CourtLookupResult =
  | { type: 'found'; court: SeoulService }
  | { type: 'not-found' }
  | { type: 'api-error' };

/**
 * Decide how a court detail request resolves against the served court list.
 *
 * SVCID는 예약 회차 단위라 서울시 API에서 수시로 사라진다. 서울시 API 행이 있는
 * "완전하고 신선한" 데이터에 없는 id만 실제 404(not-found)로 판정한다.
 *  - 정적 독립 코트(INDEP_)는 항상 포함되므로 없으면 즉시 not-found.
 *  - 서울시 API 행이 하나도 없음(독립 코트만) → 판정 불가 → api-error(소프트 폴백).
 *  - 일부 페이지 실패(isPartial) 또는 장애 대체 데이터(isStale) → 빠진 정상 SVCID를
 *    404로 캐시(revalidate 최대 24시간)하지 않도록 api-error(소프트 폴백).
 */
export function resolveCourtLookup(
  services: SeoulService[],
  courtId: string,
  meta: Pick<ServedDataMeta, 'isStale' | 'isPartial'>,
): CourtLookupResult {
  const court = services.find(s => s.SVCID === courtId);
  if (court) return { type: 'found', court };

  if (isIndependentCourt(courtId)) return { type: 'not-found' };

  const hasSeoulApiRows = services.some(s => !isIndependentCourt(s.SVCID));
  if (!hasSeoulApiRows) return { type: 'api-error' };
  if (meta.isStale || meta.isPartial) return { type: 'api-error' };
  return { type: 'not-found' };
}

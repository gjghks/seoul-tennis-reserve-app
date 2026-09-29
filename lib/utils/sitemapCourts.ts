import type { SeoulService } from '@/lib/seoulApi';
import { isIndependentCourt } from '@/lib/data/independentCourts';
import { facilityIdentityOf } from '@/lib/utils/tennisDistrictStats';

/**
 * 코트 상세 URL은 SVCID(예약 회차 단위) 기준이라 회차가 바뀔 때마다 사라진다
 * (2026-09-29 감사: 사이트맵 335개 중 182개가 이미 없는 ID). 시설 단위 라우트가
 * 없으므로, 현재 살아있는 SVCID 중 시설(facilityIdentityOf: AREANM|raw PLACENM +
 * 명시적 시설 묶음표)당 1개만 싣는다.
 * 대표는 독립 코트(INDEP_, 고정 ID) 우선, 그다음 서비스 종료일(SVCOPNENDDT)이
 * 가장 늦은 회차(가장 오래 유지됨), 동률이면 SVCID 사전순 최소로 결정적으로 고른다.
 *
 * `excludeIds`: 서울시 API 행이 다시 올라오면 병합 단계에서 빠지는 대체용 INDEP ID
 * (예: INDEP_SDM001 현저). 사이트맵에 실었다가 404로 바뀌는 흔들림을 막기 위해 제외한다.
 */
export function pickFacilityRepresentatives(
  courts: SeoulService[],
  excludeIds: ReadonlySet<string> = new Set(),
): SeoulService[] {
  const byFacility = new Map<string, SeoulService>();
  const rank = (c: SeoulService): [number, string, string] => [
    isIndependentCourt(c.SVCID) ? 1 : 0,
    c.SVCOPNENDDT || '',
    c.SVCID,
  ];
  for (const court of courts) {
    if (excludeIds.has(court.SVCID)) continue;
    const key = facilityIdentityOf(court);
    const current = byFacility.get(key);
    if (!current) {
      byFacility.set(key, court);
      continue;
    }
    const [aIndep, aEnd, aId] = rank(court);
    const [bIndep, bEnd, bId] = rank(current);
    const better =
      aIndep !== bIndep ? aIndep > bIndep :
      aEnd !== bEnd ? aEnd > bEnd :
      aId < bId;
    if (better) byFacility.set(key, court);
  }
  return [...byFacility.values()];
}

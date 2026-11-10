import type { SeoulService } from '@/lib/seoulApi';
import { extractFacilityTags } from './facilityTags';

/**
 * List-view projection of a court for anything sent to the browser as a collection
 * (API list responses, page props). DTLCONT — per-facility detail HTML, ~87% of the
 * payload — is dropped; the only list-side consumer of it (facility tags) gets its
 * result precomputed from the full record. Detail views keep the full record.
 */
export function toCourtListItem(court: SeoulService): SeoulService {
  if (!court.DTLCONT) return court;
  return { ...court, FACILITY_TAGS: extractFacilityTags(court), DTLCONT: '' };
}

export function toCourtList(courts: SeoulService[]): SeoulService[] {
  return courts.map(toCourtListItem);
}

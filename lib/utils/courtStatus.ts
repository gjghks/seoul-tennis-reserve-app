/** Check if court is available for reservation (display/filtering) */
export function isCourtAvailable(status: string | undefined | null): boolean {
  if (!status) return false;
  return status === '접수중' || status.includes('예약가능');
}

/** Check if court is actively accepting reservations (sorting priority) */
export const isCourtAccepting = (status: string): boolean =>
  status === '접수중';

/** Sort courts with accepting courts first */
export const sortByAvailability = <T extends { SVCSTATNM: string }>(courts: T[]): T[] =>
  [...courts].sort((a, b) => {
    const aAccepting = isCourtAccepting(a.SVCSTATNM);
    const bAccepting = isCourtAccepting(b.SVCSTATNM);
    if (aAccepting && !bAccepting) return -1;
    if (!aAccepting && bAccepting) return 1;
    return 0;
  });

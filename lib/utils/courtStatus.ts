/** Status value for courts with external (non-Seoul) reservation systems */
export const EXTERNAL_RESERVATION_STATUS = '외부예약';

/** Check if court is available for reservation (display/filtering) */
export function isCourtAvailable(status: string | undefined | null): boolean {
  if (!status) return false;
  return status === '접수중' || status.includes('예약가능');
}

/** Check if court uses an external reservation system */
export function isExternalReservation(status: string | undefined | null): boolean {
  return status === EXTERNAL_RESERVATION_STATUS;
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

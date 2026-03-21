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

/** Get contextually appropriate reservation button label for a given status */
export function getReservationButtonLabel(status: string | undefined | null): string {
  if (!status) return '예약 불가';

  switch (status) {
    case '예약마감':
    case '접수마감':
      return '예약 마감';
    case '안내중':
      return '예약 준비중';
    case '예약일시중지':
      return '예약 일시중지';
    default:
      return '예약 불가';
  }
}

/** Sort courts with accepting courts first */
export const sortByAvailability = <T extends { SVCSTATNM: string }>(courts: T[]): T[] =>
  [...courts].sort((a, b) => {
    const aAccepting = isCourtAccepting(a.SVCSTATNM);
    const bAccepting = isCourtAccepting(b.SVCSTATNM);
    if (aAccepting && !bAccepting) return -1;
    if (!aAccepting && bAccepting) return 1;
    return 0;
  });

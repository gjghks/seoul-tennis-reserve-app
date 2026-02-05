export function isCourtAvailable(status: string | undefined | null): boolean {
  if (!status) return false;
  return status === '접수중' || status.includes('예약가능');
}

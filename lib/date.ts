const KST_TIMEZONE = 'Asia/Seoul';

/**
 * 서버 환경(UTC)에서 한국 시간(KST, UTC+9) 기준의 Date 객체를 반환합니다.
 *
 * 주의: 반환된 Date의 내부 timestamp는 UTC 기준이 아닌 KST 로컬 값입니다.
 * getHours(), getDate() 등 로컬 메서드를 통해 KST 시간 컴포넌트를 추출하는 용도로만 사용하세요.
 */
export function getKSTNow(): Date {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: KST_TIMEZONE }),
  );
}

export function getKSTDateString(date?: Date): string {
  const kst = date
    ? new Date(date.toLocaleString('en-US', { timeZone: KST_TIMEZONE }))
    : getKSTNow();

  const year = kst.getFullYear();
  const month = String(kst.getMonth() + 1).padStart(2, '0');
  const day = String(kst.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getKSTComponents(date?: Date): {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
} {
  const kst = date
    ? new Date(date.toLocaleString('en-US', { timeZone: KST_TIMEZONE }))
    : getKSTNow();

  return {
    year: kst.getFullYear(),
    month: kst.getMonth() + 1,
    day: kst.getDate(),
    hours: kst.getHours(),
    minutes: kst.getMinutes(),
  };
}

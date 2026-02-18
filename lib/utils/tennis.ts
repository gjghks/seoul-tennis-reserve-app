import type { MatchScore, SetScore, MatchResult, GameRecord } from '@/lib/constants/tennis';

/** "6-4, 3-6, 7-6(7-5)" 형태로 포맷 */
export function formatScore(score: MatchScore): string {
  if (!score?.sets?.length) return '-';

  return score.sets
    .map((set: SetScore) => {
      const base = `${set.my}-${set.opp}`;
      if (set.tb) {
        return `${base}(${set.tb.my}-${set.tb.opp})`;
      }
      return base;
    })
    .join(', ');
}

export function validateScore(score: MatchScore): { valid: boolean; error?: string } {
  if (!score?.sets || !Array.isArray(score.sets)) {
    return { valid: false, error: '스코어 정보가 필요합니다.' };
  }

  if (score.sets.length === 0 || score.sets.length > 5) {
    return { valid: false, error: '세트 수는 1~5개여야 합니다.' };
  }

  for (let i = 0; i < score.sets.length; i++) {
    const set = score.sets[i];
    if (!Number.isInteger(set.my) || set.my < 0) {
      return { valid: false, error: `${i + 1}세트 내 스코어가 올바르지 않습니다.` };
    }
    if (!Number.isInteger(set.opp) || set.opp < 0) {
      return { valid: false, error: `${i + 1}세트 상대 스코어가 올바르지 않습니다.` };
    }
    if (set.tb) {
      if (!Number.isInteger(set.tb.my) || set.tb.my < 0) {
        return { valid: false, error: `${i + 1}세트 타이브레이크 스코어가 올바르지 않습니다.` };
      }
      if (!Number.isInteger(set.tb.opp) || set.tb.opp < 0) {
        return { valid: false, error: `${i + 1}세트 타이브레이크 스코어가 올바르지 않습니다.` };
      }
    }
  }

  return { valid: true };
}

export function inferResult(score: MatchScore): MatchResult | null {
  if (!score?.sets?.length) return null;

  let mySetWins = 0;
  let oppSetWins = 0;

  for (const set of score.sets) {
    if (set.my > set.opp) mySetWins++;
    else if (set.opp > set.my) oppSetWins++;
  }

  if (mySetWins > oppSetWins) return 'win';
  if (oppSetWins > mySetWins) return 'loss';
  if (mySetWins === oppSetWins && score.sets.length > 0) return 'draw';
  return null;
}

export function formatPlayedAt(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];

  return `${year}. ${month}. ${day}. (${weekday})`;
}

export function formatPlayedTime(dateStr: string): string {
  const date = new Date(dateStr);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDuration(minutes: number | null): string {
  if (!minutes) return '-';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

export function formatCost(cost: number | null): string {
  if (cost === null || cost === undefined) return '-';
  if (cost === 0) return '무료';
  return `${cost.toLocaleString('ko-KR')}원`;
}

export function buildRecordSummary(record: GameRecord): string {
  const parts: string[] = [];
  parts.push(formatPlayedAt(record.played_at));
  parts.push(record.court_name);
  parts.push(formatScore(record.score));
  if (record.opponent_name) {
    parts.push(`vs ${record.opponent_name}`);
  }
  return parts.join(' | ');
}

export function calculateWinRate(wins: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

/** "20260218T140000" 형태 (ICS 캘린더용) */
export function formatICSDate(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export function generateShareToken(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

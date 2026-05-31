/**
 * Estimate an opponent's ELO rating from the free-text `opponent_level` field on a
 * game record. game_records stores no real opponent rating (only opponent_name and a
 * free-text opponent_level like "초급" or "NTRP 3.0"), so we map that hint to an
 * estimated ELO. When nothing usable is provided we fall back to a neutral baseline —
 * NEVER the player's own rating, which would make every expected score 0.5 and reduce
 * every result to a flat ±K/2 regardless of opponent strength.
 */

export const DEFAULT_OPPONENT_ELO = 1200;

/** NTRP 1.0 → 800, +200 ELO per NTRP point (3.0 → 1200, 4.0 → 1400, 5.0 → 1600). */
function ntrpToElo(ntrp: number): number {
  return Math.round(800 + (ntrp - 1.0) * 200);
}

export function estimateOpponentElo(opponentLevel?: string | null): number {
  if (!opponentLevel || typeof opponentLevel !== 'string') return DEFAULT_OPPONENT_ELO;

  const raw = opponentLevel.trim();
  if (!raw) return DEFAULT_OPPONENT_ELO;

  // NTRP number, e.g. "NTRP 3.0", "3.5", "ntrp 4"
  const ntrpMatch = raw.match(/(\d(?:\.\d)?)/);
  if (ntrpMatch) {
    const n = parseFloat(ntrpMatch[1]);
    if (!Number.isNaN(n) && n >= 1.0 && n <= 7.0) {
      return ntrpToElo(n);
    }
  }

  // Korean skill keywords (check 중상급 before 중급/상급 to avoid mis-bucketing)
  if (/중상/.test(raw)) return 1400;
  if (/(입문|초보|초급|beginner)/i.test(raw)) return 1000;
  if (/(중급|intermediate)/i.test(raw)) return 1200;
  if (/(상급|고급|선수|advanced|expert|pro)/i.test(raw)) return 1600;

  return DEFAULT_OPPONENT_ELO;
}

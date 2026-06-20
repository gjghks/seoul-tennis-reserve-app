import { describe, it, expect } from 'vitest';
import {
  nextPowerOf2,
  calculateByes,
  placeSeedsInBracket,
  generateSingleEliminationBracket,
  advanceWinner,
  type GeneratedMatch,
} from './bracket-engine';

type P = { id: string; name: string; seed?: number };

function seeded(n: number): P[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Player ${i + 1}`,
    seed: i + 1,
  }));
}

describe('nextPowerOf2', () => {
  it.each([
    [1, 1], [2, 2], [3, 4], [4, 4], [5, 8], [8, 8], [9, 16], [16, 16],
  ])('nextPowerOf2(%i) = %i', (input, expected) => {
    expect(nextPowerOf2(input)).toBe(expected);
  });
});

describe('calculateByes', () => {
  it.each([
    [2, 0], [3, 1], [4, 0], [5, 3], [6, 2], [8, 0], [9, 7],
  ])('calculateByes(%i) = %i', (input, expected) => {
    expect(calculateByes(input)).toBe(expected);
  });
});

describe('placeSeedsInBracket', () => {
  it('places every participant exactly once with no duplicates', () => {
    const slots = placeSeedsInBracket(seeded(5), 8);
    expect(slots).toHaveLength(8);
    const ids = slots.filter(Boolean).map(p => p!.id);
    expect(ids).toHaveLength(5); // 5 players
    expect(new Set(ids).size).toBe(5); // no duplicates
    expect(slots.filter(s => s === null)).toHaveLength(3); // 3 byes
  });

  it('puts the #1 seed at the top slot', () => {
    const slots = placeSeedsInBracket(seeded(4), 4);
    expect(slots[0]?.seed).toBe(1);
  });
});

describe('generateSingleEliminationBracket', () => {
  it('returns nothing for an empty field', () => {
    expect(generateSingleEliminationBracket([])).toEqual({ matches: [], totalRounds: 0 });
  });

  it('2 players → 1 round, 1 match, both participants placed', () => {
    const { matches, totalRounds } = generateSingleEliminationBracket(seeded(2), { drawType: 'seeded' });
    expect(totalRounds).toBe(1);
    expect(matches).toHaveLength(1);
    expect(matches[0].nextMatchId).toBeNull();
    expect(matches[0].participant1Id).not.toBeNull();
    expect(matches[0].participant2Id).not.toBeNull();
  });

  it('4 players → 2 rounds, 3 matches; R1 feeds the final', () => {
    const { matches, totalRounds } = generateSingleEliminationBracket(seeded(4), { drawType: 'seeded' });
    expect(totalRounds).toBe(2);
    expect(matches).toHaveLength(3);
    const r1 = matches.filter(m => m.round === 1);
    const final = matches.find(m => m.round === 2)!;
    expect(r1).toHaveLength(2);
    expect(final.nextMatchId).toBeNull();
    for (const m of r1) expect(m.nextMatchId).toBe(final.id);
    // all 4 players present in round 1
    const ids = r1.flatMap(m => [m.participant1Id, m.participant2Id]).filter(Boolean);
    expect(new Set(ids).size).toBe(4);
  });

  it('8 players → 3 rounds, 7 matches total', () => {
    const { matches, totalRounds } = generateSingleEliminationBracket(seeded(8), { drawType: 'seeded' });
    expect(totalRounds).toBe(3);
    expect(matches).toHaveLength(7);
    expect(matches.filter(m => m.round === 1)).toHaveLength(4);
    expect(matches.filter(m => m.round === 3)).toHaveLength(1);
  });

  it('3 players → 1 bye auto-advances the lone player into the final', () => {
    const { matches } = generateSingleEliminationBracket(seeded(3), { drawType: 'seeded' });
    // a bye match has exactly one participant and is marked completed/bye
    const byeMatch = matches.find(m => m.round === 1 &&
      (!!m.participant1Id !== !!m.participant2Id));
    expect(byeMatch).toBeDefined();
    const final = matches.find(m => m.round === 2)!;
    // the lone participant has already been advanced into the final
    const advanced = [final.participant1Id, final.participant2Id].filter(Boolean);
    expect(advanced.length).toBeGreaterThanOrEqual(1);
  });
});

describe('advanceWinner — order independence (regression guard for matches route)', () => {
  // The matches API previously filled "the first empty slot" of the next match,
  // so completing siblings in a different order scrambled seeding. advanceWinner
  // uses match-number parity, so the final bracket must be identical regardless
  // of the order in which the two round-1 matches are completed.
  function build() {
    const { matches } = generateSingleEliminationBracket(seeded(4), { drawType: 'seeded' });
    const r1 = matches.filter(m => m.round === 1).sort((a, b) => a.matchNumber - b.matchNumber);
    const m1 = r1[0]; // matchNumber 1 (odd → next.participant1)
    const m2 = r1[1]; // matchNumber 2 (even → next.participant2)
    return { matches, m1, m2, winA: m1.participant1Id!, winB: m2.participant1Id! };
  }
  function finalOf(ms: GeneratedMatch[]): GeneratedMatch {
    return ms.find(m => m.round === 2)!;
  }

  it('M1-then-M2 and M2-then-M1 produce the same final slots', () => {
    const { matches, m1, m2, winA, winB } = build();

    const orderA = advanceWinner(advanceWinner(matches, m1.id, winA), m2.id, winB);
    const orderB = advanceWinner(advanceWinner(matches, m2.id, winB), m1.id, winA);

    const finalA = finalOf(orderA);
    const finalB = finalOf(orderB);

    // odd match (M1) → participant1, even match (M2) → participant2 — both orders
    expect(finalA.participant1Id).toBe(winA);
    expect(finalA.participant2Id).toBe(winB);
    expect(finalB.participant1Id).toBe(winA);
    expect(finalB.participant2Id).toBe(winB);
  });

  it('marks the completed match as completed with the winner', () => {
    const { matches, m1, winA } = build();
    const updated = advanceWinner(matches, m1.id, winA);
    const done = updated.find(m => m.id === m1.id)!;
    expect(done.status).toBe('completed');
    expect(done.winnerId).toBe(winA);
  });
});

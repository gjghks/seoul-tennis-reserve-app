import type { BracketMatchStatus, DrawType } from '@/lib/constants/tournament';

type BracketParticipant = { id: string; name: string; seed?: number };

export interface GeneratedMatch {
  id: string;
  round: number;
  matchNumber: number;
  participant1Id: string | null;
  participant2Id: string | null;
  winnerId: string | null;
  score: null;
  status: BracketMatchStatus;
  nextMatchId: string | null;
  position: { x: number; y: number };
}

const MATCH_WIDTH = 220;
const MATCH_HEIGHT = 70;
const ROUND_GAP_X = 260;
const BASE_GAP_Y = 40;

function buildSeedOrder(size: number): number[] {
  if (size <= 1) {
    return [1];
  }

  let order = [1, 2];
  let currentSize = 2;

  while (currentSize < size) {
    const nextSize = currentSize * 2;
    const nextOrder: number[] = [];

    for (const value of order) {
      nextOrder.push(value);
      nextOrder.push(nextSize + 1 - value);
    }

    order = nextOrder;
    currentSize = nextSize;
  }

  return order;
}

function shuffleParticipants(participants: BracketParticipant[]): BracketParticipant[] {
  const copied = [...participants];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copied[i];
    copied[i] = copied[j];
    copied[j] = tmp;
  }
  return copied;
}

export function nextPowerOf2(n: number): number {
  if (n <= 1) {
    return 1;
  }

  let power = 1;
  while (power < n) {
    power *= 2;
  }
  return power;
}

export function calculateByes(participantCount: number): number {
  const bracketSize = nextPowerOf2(participantCount);
  return bracketSize - participantCount;
}

export function placeSeedsInBracket(
  participants: BracketParticipant[],
  bracketSize: number
): (BracketParticipant | null)[] {
  const slots: (BracketParticipant | null)[] = Array.from({ length: bracketSize }, () => null);
  const seedOrder = buildSeedOrder(bracketSize);

  const seeded = participants
    .filter(p => typeof p.seed === 'number')
    .sort((a, b) => (a.seed as number) - (b.seed as number));
  const unseeded = participants
    .filter(p => typeof p.seed !== 'number')
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  for (const participant of seeded) {
    if (!participant.seed || participant.seed < 1 || participant.seed > bracketSize) {
      continue;
    }

    const index = seedOrder.indexOf(participant.seed);
    if (index >= 0 && !slots[index]) {
      slots[index] = participant;
    }
  }

  let unseededIndex = 0;
  for (let i = 0; i < slots.length && unseededIndex < unseeded.length; i += 1) {
    if (!slots[i]) {
      slots[i] = unseeded[unseededIndex];
      unseededIndex += 1;
    }
  }

  return slots;
}

export function calculateBracketLayout(
  totalRounds: number,
  matchesPerRound: number[]
): { x: number; y: number; width: number; height: number }[] {
  const unitY = MATCH_HEIGHT + BASE_GAP_Y;
  const layout: { x: number; y: number; width: number; height: number }[] = [];

  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex += 1) {
    const matches = matchesPerRound[roundIndex] ?? 0;
    const multiplier = 2 ** roundIndex;

    for (let matchIndex = 0; matchIndex < matches; matchIndex += 1) {
      const x = roundIndex * ROUND_GAP_X;
      const y = matchIndex * multiplier * unitY + ((multiplier - 1) * unitY) / 2;

      layout.push({
        x,
        y,
        width: MATCH_WIDTH,
        height: MATCH_HEIGHT,
      });
    }
  }

  return layout;
}

export function advanceWinner(
  matches: GeneratedMatch[],
  completedMatchId: string,
  winnerId: string
): GeneratedMatch[] {
  const completed = matches.find(match => match.id === completedMatchId);
  if (!completed) {
    return [...matches];
  }

  return matches.map(match => {
    if (match.id === completedMatchId) {
      return {
        ...match,
        winnerId,
        status: 'completed' as BracketMatchStatus,
      };
    }

    if (completed.nextMatchId && match.id === completed.nextMatchId) {
      if (completed.matchNumber % 2 === 1) {
        return { ...match, participant1Id: winnerId };
      }
      return { ...match, participant2Id: winnerId };
    }

    return { ...match };
  });
}

export function generateSingleEliminationBracket(
  participants: BracketParticipant[],
  options: { drawType?: DrawType } = {}
): { matches: GeneratedMatch[]; totalRounds: number } {
  if (participants.length === 0) {
    return { matches: [], totalRounds: 0 };
  }

  const drawType = options.drawType || 'random';
  const bracketSize = nextPowerOf2(participants.length);
  const totalRounds = Math.log2(bracketSize);
  const matchesPerRound = Array.from({ length: totalRounds }, (_, i) => bracketSize / 2 ** (i + 1));

  let round1Slots: (BracketParticipant | null)[];
  if (drawType === 'seeded') {
    round1Slots = placeSeedsInBracket(participants, bracketSize);
  } else if (drawType === 'manual') {
    round1Slots = [...participants];
    while (round1Slots.length < bracketSize) {
      round1Slots.push(null);
    }
  } else {
    round1Slots = shuffleParticipants(participants);
    while (round1Slots.length < bracketSize) {
      round1Slots.push(null);
    }
  }

  const layout = calculateBracketLayout(totalRounds, matchesPerRound);
  const matches: GeneratedMatch[] = [];

  let layoutIndex = 0;
  for (let round = 1; round <= totalRounds; round += 1) {
    const roundMatches = bracketSize / 2 ** round;
    for (let matchNumber = 1; matchNumber <= roundMatches; matchNumber += 1) {
      const nextMatchId = round < totalRounds ? `match-R${round + 1}-M${Math.ceil(matchNumber / 2)}` : null;
      const box = layout[layoutIndex] ?? { x: 0, y: 0, width: MATCH_WIDTH, height: MATCH_HEIGHT };
      layoutIndex += 1;

      matches.push({
        id: `match-R${round}-M${matchNumber}`,
        round,
        matchNumber,
        participant1Id: null,
        participant2Id: null,
        winnerId: null,
        score: null,
        status: 'pending',
        nextMatchId,
        position: { x: box.x, y: box.y },
      });
    }
  }

  for (let i = 0; i < round1Slots.length; i += 2) {
    const matchNumber = i / 2 + 1;
    const round1MatchId = `match-R1-M${matchNumber}`;
    const matchIndex = matches.findIndex(match => match.id === round1MatchId);
    if (matchIndex < 0) {
      continue;
    }

    const participant1 = round1Slots[i];
    const participant2 = round1Slots[i + 1];
    matches[matchIndex] = {
      ...matches[matchIndex],
      participant1Id: participant1?.id ?? null,
      participant2Id: participant2?.id ?? null,
    };
  }

  for (let round = 1; round <= totalRounds; round += 1) {
    const roundMatches = matches.filter(match => match.round === round);
    for (const match of roundMatches) {
      const hasParticipant1 = !!match.participant1Id;
      const hasParticipant2 = !!match.participant2Id;

      if (hasParticipant1 === hasParticipant2) {
        continue;
      }

      const winnerId = match.participant1Id || match.participant2Id;
      if (!winnerId) {
        continue;
      }

      const currentIndex = matches.findIndex(m => m.id === match.id);
      if (currentIndex >= 0) {
        matches[currentIndex] = {
          ...matches[currentIndex],
          winnerId,
          status: 'bye',
        };
      }

      if (!match.nextMatchId) {
        continue;
      }

      const nextIndex = matches.findIndex(m => m.id === match.nextMatchId);
      if (nextIndex < 0) {
        continue;
      }

      const isFirstSlot = match.matchNumber % 2 === 1;
      matches[nextIndex] = {
        ...matches[nextIndex],
        participant1Id: isFirstSlot ? winnerId : matches[nextIndex].participant1Id,
        participant2Id: isFirstSlot ? matches[nextIndex].participant2Id : winnerId,
      };
    }
  }

  return {
    matches,
    totalRounds,
  };
}

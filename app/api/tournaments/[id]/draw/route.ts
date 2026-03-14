import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { generateSingleEliminationBracket } from '@/lib/bracket-engine';
import type { DrawType } from '@/lib/constants/tournament';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const supabase = await createServerSupabaseClient();
  const { id: tournamentId } = await context.params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (!tournament) {
    return NextResponse.json({ error: '토너먼트를 찾을 수 없습니다.' }, { status: 404 });
  }

  if (tournament.creator_id !== user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  if (tournament.status !== 'draft' && tournament.status !== 'registration') {
    return NextResponse.json({ error: '대진 추첨은 모집중/초안 상태에서만 가능합니다.' }, { status: 400 });
  }

  const { data: participants } = await supabase
    .from('tournament_participants')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('seed_number', { ascending: true, nullsFirst: false });

  if (!participants || participants.length < 2) {
    return NextResponse.json({ error: '참가자가 2명 이상 필요합니다.' }, { status: 400 });
  }

  await supabase
    .from('tournament_matches')
    .delete()
    .eq('tournament_id', tournamentId);

  const drawType = (tournament.draw_type as DrawType) || 'random';
  const bracketParticipants = participants.map(p => ({
    id: p.id,
    name: p.name,
    seed: p.seed_number ?? undefined,
  }));

  const { matches, totalRounds } = generateSingleEliminationBracket(bracketParticipants, { drawType });

  const matchInserts = matches.map(m => ({
    id: m.id.startsWith('match-') ? undefined : m.id,
    tournament_id: tournamentId,
    round: m.round,
    match_number: m.matchNumber,
    participant1_id: m.participant1Id,
    participant2_id: m.participant2Id,
    winner_id: m.winnerId,
    score: m.score,
    status: m.status,
    next_match_id: null as string | null,
  }));

  const { data: insertedMatches, error: insertError } = await supabase
    .from('tournament_matches')
    .insert(matchInserts)
    .select('id, round, match_number');

  if (insertError) {
    console.error('Error inserting matches:', insertError);
    return NextResponse.json({ error: '매치 생성에 실패했습니다.' }, { status: 500 });
  }

  if (insertedMatches && insertedMatches.length > 0) {
    const matchMap = new Map<string, string>();
    for (const m of insertedMatches) {
      matchMap.set(`R${m.round}-M${m.match_number}`, m.id);
    }

    for (const m of insertedMatches) {
      if (m.round < totalRounds) {
        const nextMatchNumber = Math.ceil(m.match_number / 2);
        const nextKey = `R${m.round + 1}-M${nextMatchNumber}`;
        const nextMatchId = matchMap.get(nextKey);
        if (nextMatchId) {
          await supabase
            .from('tournament_matches')
            .update({ next_match_id: nextMatchId })
            .eq('id', m.id);
        }
      }
    }
  }

  await supabase
    .from('tournaments')
    .update({ status: 'in_progress', updated_at: new Date().toISOString() })
    .eq('id', tournamentId);

  return NextResponse.json({ success: true, totalRounds });
}

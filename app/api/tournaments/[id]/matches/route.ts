import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  const supabase = await createServerSupabaseClient();
  const { id: tournamentId } = await context.params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('creator_id, status')
    .eq('id', tournamentId)
    .single();

  if (!tournament) {
    return NextResponse.json({ error: '토너먼트를 찾을 수 없습니다.' }, { status: 404 });
  }

  if (tournament.creator_id !== user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  if (tournament.status !== 'in_progress') {
    return NextResponse.json({ error: '진행중인 대회만 점수를 입력할 수 있습니다.' }, { status: 400 });
  }

  let body: { match_id: string; winner_id: string; score?: { p1: number; p2: number }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const { match_id, winner_id, score } = body;

  if (!match_id || !winner_id) {
    return NextResponse.json({ error: '매치 ID와 승자 ID가 필요합니다.' }, { status: 400 });
  }

  const { data: match } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('id', match_id)
    .eq('tournament_id', tournamentId)
    .single();

  if (!match) {
    return NextResponse.json({ error: '매치를 찾을 수 없습니다.' }, { status: 404 });
  }

  if (match.status === 'completed') {
    return NextResponse.json({ error: '이미 완료된 경기입니다.' }, { status: 400 });
  }

  if (winner_id !== match.participant1_id && winner_id !== match.participant2_id) {
    return NextResponse.json({ error: '승자는 해당 경기의 참가자여야 합니다.' }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from('tournament_matches')
    .update({
      winner_id,
      score: score ?? null,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', match_id);

  if (updateError) {
    console.error('Error updating match:', updateError);
    return NextResponse.json({ error: '매치 업데이트에 실패했습니다.' }, { status: 500 });
  }

  if (match.next_match_id) {
    const { data: nextMatch } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('id', match.next_match_id)
      .single();

    if (nextMatch) {
      const updateField = nextMatch.participant1_id === null ? 'participant1_id' : 'participant2_id';
      await supabase
        .from('tournament_matches')
        .update({ [updateField]: winner_id })
        .eq('id', match.next_match_id);
    }
  }

  const { data: remainingMatches } = await supabase
    .from('tournament_matches')
    .select('id')
    .eq('tournament_id', tournamentId)
    .neq('status', 'completed')
    .neq('status', 'bye');

  if (!remainingMatches || remainingMatches.length === 0) {
    await supabase
      .from('tournaments')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', tournamentId);
  }

  return NextResponse.json({ success: true });
}

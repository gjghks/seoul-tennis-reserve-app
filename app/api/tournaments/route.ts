import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { createRateLimiter } from '@/lib/rateLimit';
import {
  MAX_PARTICIPANTS,
  MIN_PARTICIPANTS,
  VALID_DRAW_TYPES,
  VALID_SCORING_FORMATS,
  VALID_TOURNAMENT_FORMATS,
  VALID_TOURNAMENT_MATCH_TYPES,
  VALID_TOURNAMENT_STATUSES,
} from '@/lib/constants/tournament';
import type {
  DrawType,
  ScoringFormat,
  TournamentFormat,
  TournamentMatchType,
  TournamentStatus,
} from '@/lib/constants/tournament';

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const format = searchParams.get('format');
  const matchType = searchParams.get('match_type');
  const district = searchParams.get('district');
  const my = searchParams.get('my') === 'true';
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');

  const limit = Math.min(Math.max(1, Number(limitParam) || 20), 100);
  const offset = Math.max(0, Number(offsetParam) || 0);

  const { data: { user } } = await supabase.auth.getUser();

  if (my && !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  let query = supabase
    .from('tournaments')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (my && user) {
    query = query.eq('creator_id', user.id);
  }

  if (status && VALID_TOURNAMENT_STATUSES.includes(status as TournamentStatus)) {
    query = query.eq('status', status);
  }

  if (format && VALID_TOURNAMENT_FORMATS.includes(format as TournamentFormat)) {
    query = query.eq('format', format);
  }

  if (matchType && VALID_TOURNAMENT_MATCH_TYPES.includes(matchType as TournamentMatchType)) {
    query = query.eq('match_type', matchType);
  }

  if (district) {
    query = query.eq('district', district);
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json(
      { error: '토너먼트 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: data || [], total: count ?? 0 });
}

export async function POST(request: NextRequest) {
  const rateLimitResult = await limiter(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      format,
      match_type,
      scoring_format,
      no_ad_scoring,
      max_participants,
      status,
      is_public,
      draw_type,
      play_date,
      location,
      district,
      court_name,
      court_count,
    } = body;

    if (!title || typeof title !== 'string' || title.length > 100) {
      return NextResponse.json({ error: '제목은 필수이며 100자 이하여야 합니다.' }, { status: 400 });
    }

    if (description && (typeof description !== 'string' || description.length > 2000)) {
      return NextResponse.json({ error: '설명은 2000자 이하여야 합니다.' }, { status: 400 });
    }

    const tournamentFormat: TournamentFormat = VALID_TOURNAMENT_FORMATS.includes(format)
      ? format
      : 'single_elimination';
    const tournamentMatchType: TournamentMatchType = VALID_TOURNAMENT_MATCH_TYPES.includes(match_type)
      ? match_type
      : 'singles';
    const scoringFormat: ScoringFormat = VALID_SCORING_FORMATS.includes(scoring_format)
      ? scoring_format
      : 'games_6';
    const tournamentStatus: TournamentStatus = VALID_TOURNAMENT_STATUSES.includes(status)
      ? status
      : 'draft';
    const drawType: DrawType = VALID_DRAW_TYPES.includes(draw_type)
      ? draw_type
      : 'random';

    const participantLimit = Number(max_participants) || 8;
    if (participantLimit < MIN_PARTICIPANTS || participantLimit > MAX_PARTICIPANTS) {
      return NextResponse.json(
        { error: `참가 인원은 ${MIN_PARTICIPANTS}~${MAX_PARTICIPANTS}명 사이여야 합니다.` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('tournaments')
      .insert([{
        creator_id: user.id,
        title,
        description: description ?? null,
        format: tournamentFormat,
        match_type: tournamentMatchType,
        scoring_format: scoringFormat,
        no_ad_scoring: no_ad_scoring ?? false,
        max_participants: participantLimit,
        status: tournamentStatus,
        share_token: crypto.randomUUID(),
        is_public: is_public ?? false,
        draw_type: drawType,
        play_date: play_date ?? null,
        location: location ?? null,
        district: district ?? null,
        court_name: court_name ?? null,
        court_count: court_count && Number(court_count) >= 1 && Number(court_count) <= 20
          ? Number(court_count)
          : null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating tournament:', error);
      return NextResponse.json({ error: '토너먼트 생성에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ tournament: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }
}

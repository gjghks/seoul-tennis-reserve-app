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

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const supabase = await createServerSupabaseClient();
  const { id } = await context.params;
  const shareToken = new URL(request.url).searchParams.get('share_token');

  if (!id) {
    return NextResponse.json({ error: '토너먼트 ID가 필요합니다.' }, { status: 400 });
  }

  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: '토너먼트를 찾을 수 없습니다.' }, { status: 404 });
    }
    console.error('Error fetching tournament:', error);
    return NextResponse.json({ error: '토너먼트를 불러오는데 실패했습니다.' }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = !!user && user.id === tournament.creator_id;
  const canAccessByShareToken = !!shareToken && tournament.share_token === shareToken;

  if (!tournament.is_public && !isOwner && !canAccessByShareToken) {
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  }

  const [{ data: participants, error: participantsError }, { data: matches, error: matchesError }] = await Promise.all([
    supabase
      .from('tournament_participants')
      .select('*')
      .eq('tournament_id', id)
      .order('seed_number', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true }),
    supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', id)
      .order('round', { ascending: true })
      .order('match_number', { ascending: true }),
  ]);

  if (participantsError || matchesError) {
    console.error('Error fetching tournament relations:', participantsError || matchesError);
    return NextResponse.json({ error: '토너먼트 상세를 불러오는데 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({
    tournament,
    participants: participants || [],
    matches: matches || [],
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
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

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: '토너먼트 ID가 필요합니다.' }, { status: 400 });
  }

  const { data: existing, error: existingError } = await supabase
    .from('tournaments')
    .select('creator_id, status')
    .eq('id', id)
    .single();

  if (existingError) {
    if (existingError.code === 'PGRST116') {
      return NextResponse.json({ error: '토너먼트를 찾을 수 없습니다.' }, { status: 404 });
    }
    console.error('Error fetching tournament for update:', existingError);
    return NextResponse.json({ error: '토너먼트 확인에 실패했습니다.' }, { status: 500 });
  }

  if (existing.creator_id !== user.id) {
    return NextResponse.json({ error: '본인이 생성한 토너먼트만 수정할 수 있습니다.' }, { status: 403 });
  }

  if (!['draft', 'registration'].includes(existing.status)) {
    return NextResponse.json(
      { error: '임시저장/모집중 상태의 토너먼트만 수정할 수 있습니다.' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.length < 1 || body.title.length > 100) {
        return NextResponse.json({ error: '제목은 1~100자 사이여야 합니다.' }, { status: 400 });
      }
      updateData.title = body.title;
    }

    if (body.description !== undefined) {
      if (body.description !== null && (typeof body.description !== 'string' || body.description.length > 2000)) {
        return NextResponse.json({ error: '설명은 2000자 이하여야 합니다.' }, { status: 400 });
      }
      updateData.description = body.description;
    }

    if (body.format !== undefined) {
      if (!VALID_TOURNAMENT_FORMATS.includes(body.format)) {
        return NextResponse.json({ error: '올바르지 않은 토너먼트 형식입니다.' }, { status: 400 });
      }
      updateData.format = body.format;
    }

    if (body.match_type !== undefined) {
      if (!VALID_TOURNAMENT_MATCH_TYPES.includes(body.match_type)) {
        return NextResponse.json({ error: '올바르지 않은 경기 유형입니다.' }, { status: 400 });
      }
      updateData.match_type = body.match_type;
    }

    if (body.scoring_format !== undefined) {
      if (!VALID_SCORING_FORMATS.includes(body.scoring_format)) {
        return NextResponse.json({ error: '올바르지 않은 스코어 방식입니다.' }, { status: 400 });
      }
      updateData.scoring_format = body.scoring_format;
    }

    if (body.draw_type !== undefined) {
      if (!VALID_DRAW_TYPES.includes(body.draw_type)) {
        return NextResponse.json({ error: '올바르지 않은 대진 방식입니다.' }, { status: 400 });
      }
      updateData.draw_type = body.draw_type;
    }

    if (body.status !== undefined) {
      if (!VALID_TOURNAMENT_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: '올바르지 않은 상태 값입니다.' }, { status: 400 });
      }
      updateData.status = body.status;
    }

    if (body.max_participants !== undefined) {
      const participantLimit = Number(body.max_participants);
      if (
        !Number.isInteger(participantLimit) ||
        participantLimit < MIN_PARTICIPANTS ||
        participantLimit > MAX_PARTICIPANTS
      ) {
        return NextResponse.json(
          { error: `참가 인원은 ${MIN_PARTICIPANTS}~${MAX_PARTICIPANTS}명 사이여야 합니다.` },
          { status: 400 }
        );
      }
      updateData.max_participants = participantLimit;
    }

    if (body.court_count !== undefined) {
      const courtCount = body.court_count === null ? null : Number(body.court_count);
      if (courtCount !== null && (!Number.isInteger(courtCount) || courtCount < 1 || courtCount > 20)) {
        return NextResponse.json({ error: '코트 수는 1~20 사이여야 합니다.' }, { status: 400 });
      }
      updateData.court_count = courtCount;
    }

    const allowedDirectFields = ['no_ad_scoring', 'is_public', 'play_date', 'location', 'district', 'court_name'];
    for (const field of allowedDirectFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const { data, error } = await supabase
      .from('tournaments')
      .update(updateData)
      .eq('id', id)
      .eq('creator_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tournament:', error);
      return NextResponse.json({ error: '토너먼트 수정에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ tournament: data });
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
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

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: '토너먼트 ID가 필요합니다.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', id)
    .eq('creator_id', user.id);

  if (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json({ error: '토너먼트 삭제에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { createRateLimiter } from '@/lib/rateLimit';

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('court_transfers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: '양도글을 찾을 수 없습니다.' }, { status: 404 });
    }
    console.error('Error fetching transfer:', error);
    return NextResponse.json({ error: '양도글을 불러오는데 실패했습니다.' }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser();

  let showContact = false;
  let myInterestStatus: string | null = null;

  if (user) {
    if (data.seller_id === user.id) {
      showContact = true;
    } else {
      const { data: interest } = await supabase
        .from('transfer_interests')
        .select('status')
        .eq('transfer_id', id)
        .eq('buyer_id', user.id)
        .maybeSingle();

      myInterestStatus = interest?.status ?? null;
      showContact = interest?.status === 'accepted';
    }
  }

  const { contact_info: _contactValue, ...publicData } = data;
  const transfer = showContact ? data : publicData;

  return NextResponse.json({ transfer, myInterestStatus });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const rateLimitResult = await limiter(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)) },
      }
    );
  }

  const { id } = await context.params;
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from('court_transfers')
    .select('seller_id')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: '양도글을 찾을 수 없습니다.' }, { status: 404 });
  }

  if (existing.seller_id !== user.id) {
    return NextResponse.json({ error: '본인의 양도글만 수정할 수 있습니다.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    const allowedFields = [
      'court_name', 'district', 'play_date', 'play_time_start', 'play_time_end',
      'original_price', 'asking_price', 'is_free', 'title', 'description', 'status',
      'buyer_id', 'buyer_name', 'contact_type', 'contact_info',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const { data, error } = await supabase
      .from('court_transfers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transfer:', error);
      return NextResponse.json({ error: '양도글 수정에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ transfer: data });
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
        headers: { 'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)) },
      }
    );
  }

  const { id } = await context.params;
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { error } = await supabase
    .from('court_transfers')
    .delete()
    .eq('id', id)
    .eq('seller_id', user.id);

  if (error) {
    console.error('Error deleting transfer:', error);
    return NextResponse.json({ error: '양도글 삭제에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

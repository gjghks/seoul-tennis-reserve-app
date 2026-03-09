import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { createRateLimiter } from '@/lib/rateLimit';
import { TRANSFER_PAGE_SIZE, VALID_TRANSFER_STATUSES } from '@/lib/constants/transfers';
import type { TransferStatus } from '@/lib/constants/transfers';

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 15 });

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district');
  const status = searchParams.get('status');
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');

  const limit = Math.min(Math.max(1, Number(limitParam) || TRANSFER_PAGE_SIZE), 100);
  const offset = Math.max(0, Number(offsetParam) || 0);

  let query = supabase
    .from('court_transfers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (district) {
    query = query.eq('district', district);
  }

  if (status && VALID_TRANSFER_STATUSES.includes(status as TransferStatus)) {
    query = query.eq('status', status);
  } else {
    query = query.eq('status', 'available');
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching transfers:', error);
    return NextResponse.json(
      { error: '양도 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }

  const sanitized = (data || []).map((transfer: Record<string, unknown>) => {
    const { contact_info: _, ...rest } = transfer;
    return rest;
  });

  return NextResponse.json({ transfers: sanitized, total: count ?? 0 });
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
      court_id, court_name, district, play_date,
      play_time_start, play_time_end,
      original_price, asking_price, is_free,
      title, description,
      contact_type, contact_info,
    } = body;

    if (!court_name || !district || !play_date || !play_time_start || !title) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    if (typeof title !== 'string' || title.length < 2 || title.length > 100) {
      return NextResponse.json({ error: '제목은 2~100자 사이여야 합니다.' }, { status: 400 });
    }

    if (description && typeof description === 'string' && description.length > 500) {
      return NextResponse.json({ error: '설명은 500자 이하로 작성해주세요.' }, { status: 400 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('full_name, nickname')
      .eq('id', user.id)
      .single();

    const { data, error } = await supabase
      .from('court_transfers')
      .insert([{
        seller_id: user.id,
        seller_name: userData?.nickname || userData?.full_name || '익명',
        court_id: court_id ?? null,
        court_name,
        district,
        play_date,
        play_time_start,
        play_time_end: play_time_end ?? null,
        original_price: original_price ?? 0,
        asking_price: asking_price ?? 0,
        is_free: is_free ?? false,
        title,
        description: description ?? null,
        contact_type: contact_type || 'kakao',
        contact_info: contact_info || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating transfer:', error);
      return NextResponse.json({ error: '양도글 작성에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ transfer: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }
}

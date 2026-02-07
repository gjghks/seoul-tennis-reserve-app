import { NextRequest, NextResponse } from 'next/server';
import { createAnonSupabaseClient } from '@/lib/supabaseServer';

const VALID_CATEGORIES = ['feature', 'bug', 'other'] as const;
type FeedbackCategory = (typeof VALID_CATEGORIES)[number];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, content } = body as { category: unknown; content: unknown };

    if (
      typeof category !== 'string' ||
      !VALID_CATEGORIES.includes(category as FeedbackCategory)
    ) {
      return NextResponse.json(
        { error: '올바른 카테고리를 선택해주세요.' },
        { status: 400 }
      );
    }

    if (typeof content !== 'string' || content.length < 5 || content.length > 500) {
      return NextResponse.json(
        { error: '의견은 5자 이상 500자 이하로 작성해주세요.' },
        { status: 400 }
      );
    }

    const supabase = createAnonSupabaseClient();

    const { error } = await supabase
      .from('feedback')
      .insert([{ category, content: content.trim() }]);

    if (error) {
      console.error('Feedback insert error:', error);
      return NextResponse.json(
        { error: '의견 제출에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청입니다.' },
      { status: 400 }
    );
  }
}

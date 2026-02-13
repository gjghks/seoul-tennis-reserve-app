import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { createRateLimiter } from '@/lib/rateLimit';

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 30 });

const ALERT_TYPES = ['favorite_available', 'district_available'] as const;
type AlertType = (typeof ALERT_TYPES)[number];

type AlertBody = {
  alertType: AlertType;
  targetId: string;
  targetName: string;
};

function parseAlertBody(value: unknown): AlertBody | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const body = value as Record<string, unknown>;

  if (
    typeof body.alertType !== 'string' ||
    !ALERT_TYPES.includes(body.alertType as AlertType) ||
    typeof body.targetId !== 'string' ||
    typeof body.targetName !== 'string'
  ) {
    return null;
  }

  return {
    alertType: body.alertType as AlertType,
    targetId: body.targetId,
    targetName: body.targetName,
  };
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('alert_settings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to list alert settings:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }

  return NextResponse.json({ alerts: data ?? [] });
}

export async function POST(request: NextRequest) {
  const rateLimitResult = await limiter(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = parseAlertBody(body);
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { data: existing, error: existingError } = await supabase
    .from('alert_settings')
    .select('id, enabled')
    .eq('user_id', user.id)
    .eq('alert_type', parsed.alertType)
    .eq('target_id', parsed.targetId)
    .maybeSingle();

  if (existingError) {
    console.error('Failed to check alert setting:', existingError);
    return NextResponse.json({ error: 'Failed to save alert' }, { status: 500 });
  }

  if (existing) {
    const { data, error } = await supabase
      .from('alert_settings')
      .update({
        enabled: !existing.enabled,
        target_name: parsed.targetName,
      })
      .eq('id', existing.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to toggle alert setting:', error);
      return NextResponse.json({ error: 'Failed to save alert' }, { status: 500 });
    }

    return NextResponse.json({ alert: data });
  }

  const { data, error } = await supabase
    .from('alert_settings')
    .insert({
      user_id: user.id,
      alert_type: parsed.alertType,
      target_id: parsed.targetId,
      target_name: parsed.targetName,
      enabled: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create alert setting:', error);
    return NextResponse.json({ error: 'Failed to save alert' }, { status: 500 });
  }

  return NextResponse.json({ alert: data }, { status: 201 });
}

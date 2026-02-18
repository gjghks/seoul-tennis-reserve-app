-- 테니스 경기 기록 테이블
create table if not exists public.game_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,

  -- 날짜 및 장소
  played_at timestamptz not null,
  duration_minutes integer check (duration_minutes > 0 and duration_minutes <= 600),
  location_type text not null check (location_type in ('seoul_court', 'custom')),
  court_id text,
  court_name text not null,
  district text,

  -- 경기 정보
  match_type text not null check (match_type in (
    'singles', 'mens_doubles', 'womens_doubles', 'mixed_doubles'
  )),
  match_format text not null check (match_format in (
    '4game_nodeuce', '6game_1set', '3set_match', '8game_proset', 'tiebreak', 'custom'
  )),
  score jsonb not null default '{"sets":[]}',
  result text not null check (result in ('win', 'loss', 'draw', 'retired')),
  court_surface text check (court_surface in (
    'hard', 'clay', 'artificial_grass', 'grass', 'indoor', 'other'
  )),

  -- 상대 정보 (MVP에서는 텍스트로만 저장)
  opponent_name text,
  opponent_level text,

  -- 기타
  cost integer check (cost >= 0),
  notes text check (char_length(notes) <= 1000),
  images text[] default '{}',

  -- 공유
  is_public boolean default false,
  share_token text unique,

  -- 타임스탬프
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 인덱스
create index if not exists game_records_user_id_idx
  on public.game_records(user_id);
create index if not exists game_records_played_at_idx
  on public.game_records(user_id, played_at desc);
create index if not exists game_records_share_token_idx
  on public.game_records(share_token) where share_token is not null;
create index if not exists game_records_match_type_idx
  on public.game_records(user_id, match_type);

-- RLS 활성화
alter table public.game_records enable row level security;

-- 사용자는 자신의 기록만 조회 가능
create policy "Users can view their own records"
  on public.game_records for select using (auth.uid() = user_id);

-- 사용자는 자신의 기록만 생성 가능
create policy "Users can insert their own records"
  on public.game_records for insert with check (auth.uid() = user_id);

-- 사용자는 자신의 기록만 수정 가능
create policy "Users can update their own records"
  on public.game_records for update using (auth.uid() = user_id);

-- 사용자는 자신의 기록만 삭제 가능
create policy "Users can delete their own records"
  on public.game_records for delete using (auth.uid() = user_id);

-- 경기 기록 이미지 저장 버킷
insert into storage.buckets (id, name, public)
values ('record-images', 'record-images', true)
on conflict (id) do nothing;

-- 누구나 이미지 조회 가능
create policy "Anyone can view record images"
  on storage.objects for select
  using (bucket_id = 'record-images');

-- 인증된 사용자만 본인 폴더에 업로드 가능
create policy "Authenticated users can upload record images"
  on storage.objects for insert
  with check (
    bucket_id = 'record-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 사용자는 본인 이미지만 삭제 가능
create policy "Users can delete their own record images"
  on storage.objects for delete
  using (
    bucket_id = 'record-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

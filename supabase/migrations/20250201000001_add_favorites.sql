-- 즐겨찾기 테이블 생성
create table if not exists public.favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users not null,
  svc_id text not null,
  svc_name text not null,
  district text not null,
  place_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- 중복 방지 (같은 사용자가 같은 테니스장을 중복 등록할 수 없음)
  unique(user_id, svc_id)
);

-- 인덱스 생성
create index if not exists idx_favorites_user_id on public.favorites(user_id);
create index if not exists idx_favorites_svc_id on public.favorites(svc_id);

-- RLS(Row Level Security) 활성화
alter table public.favorites enable row level security;

-- 사용자는 자신의 즐겨찾기만 조회 가능
create policy "Users can view their own favorites" on public.favorites
  for select using (auth.uid() = user_id);

-- 사용자는 자신의 즐겨찾기만 추가 가능
create policy "Users can insert their own favorites" on public.favorites
  for insert with check (auth.uid() = user_id);

-- 사용자는 자신의 즐겨찾기만 삭제 가능
create policy "Users can delete their own favorites" on public.favorites
  for delete using (auth.uid() = user_id);

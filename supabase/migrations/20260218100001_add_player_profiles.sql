-- 테니스 플레이어 프로필 (users 테이블 확장, 별도 테이블로 분리)
create table if not exists public.player_profiles (
  user_id uuid references auth.users not null primary key,
  career_years integer check (career_years >= 0 and career_years <= 50),
  ntrp_rating numeric(2,1) check (ntrp_rating >= 1.0 and ntrp_rating <= 7.0),
  skill_level text check (skill_level in ('beginner', 'intermediate', 'advanced', 'pro')),
  preferred_hand text check (preferred_hand in ('right', 'left', 'both')),
  age_group text check (age_group in ('10s', '20s', '30s', '40s', '50s', '60s_plus')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS 활성화
alter table public.player_profiles enable row level security;

-- 사용자는 자신의 프로필만 조회 가능
create policy "Users can view their own profile"
  on public.player_profiles for select using (auth.uid() = user_id);

-- 사용자는 자신의 프로필만 생성 가능
create policy "Users can insert their own profile"
  on public.player_profiles for insert with check (auth.uid() = user_id);

-- 사용자는 자신의 프로필만 수정 가능
create policy "Users can update their own profile"
  on public.player_profiles for update using (auth.uid() = user_id);

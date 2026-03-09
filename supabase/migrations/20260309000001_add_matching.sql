-- Add match_posts and match_applications for player matching feature
-- Enables users to find tennis partners by posting open match requests

-- ============================================================
-- 1. match_posts (게임 매칭 모집글)
-- ============================================================
create table if not exists public.match_posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references auth.users not null,
  author_name text not null default '',

  -- When & Where
  play_date date not null,
  play_time_start text not null,   -- HH:MM format
  play_time_end text,              -- HH:MM format (optional)
  location_type text not null default 'seoul_court'
    check (location_type in ('seoul_court', 'custom')),
  court_id text,                   -- Seoul API SVCID
  court_name text not null,
  district text not null,

  -- Match details
  match_type text not null
    check (match_type in ('singles', 'mens_doubles', 'womens_doubles', 'mixed_doubles')),

  -- Player requirements
  ntrp_min numeric(2,1) check (ntrp_min >= 1.0 and ntrp_min <= 7.0),
  ntrp_max numeric(2,1) check (ntrp_max >= 1.0 and ntrp_max <= 7.0),
  skill_level text check (skill_level in ('beginner', 'intermediate', 'advanced', 'any')),

  -- Slots
  max_participants integer not null default 1
    check (max_participants >= 1 and max_participants <= 3),
  accepted_count integer not null default 0
    check (accepted_count >= 0),

  -- Cost
  cost_per_person integer check (cost_per_person >= 0),

  -- Content
  title text not null
    check (char_length(title) >= 2 and char_length(title) <= 100),
  description text check (char_length(description) <= 500),

  -- Status
  status text not null default 'open'
    check (status in ('open', 'closed', 'completed', 'cancelled')),

  -- Timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes
create index if not exists match_posts_author_id_idx
  on public.match_posts(author_id);
create index if not exists match_posts_district_idx
  on public.match_posts(district);
create index if not exists match_posts_status_play_date_idx
  on public.match_posts(status, play_date)
  where status = 'open';
create index if not exists match_posts_created_at_idx
  on public.match_posts(created_at desc);

-- RLS
alter table public.match_posts enable row level security;

create policy "Anyone can view match posts"
  on public.match_posts for select using (true);

create policy "Authenticated users can create match posts"
  on public.match_posts for insert
  with check (auth.uid() = author_id);

create policy "Authors can update own match posts"
  on public.match_posts for update
  using (auth.uid() = author_id);

create policy "Authors can delete own match posts"
  on public.match_posts for delete
  using (auth.uid() = author_id);


-- ============================================================
-- 2. match_applications (매칭 신청)
-- ============================================================
create table if not exists public.match_applications (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.match_posts on delete cascade not null,
  applicant_id uuid references auth.users not null,
  applicant_name text not null default '',

  message text check (char_length(message) <= 200),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'withdrawn')),

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  unique(post_id, applicant_id)
);

-- Indexes
create index if not exists match_applications_post_id_idx
  on public.match_applications(post_id);
create index if not exists match_applications_applicant_id_idx
  on public.match_applications(applicant_id);

-- RLS
alter table public.match_applications enable row level security;

-- Applicants see own + post authors see their posts' applications
create policy "View own or post author applications"
  on public.match_applications for select
  using (
    auth.uid() = applicant_id
    or exists (
      select 1 from public.match_posts
      where match_posts.id = match_applications.post_id
        and match_posts.author_id = auth.uid()
    )
  );

create policy "Authenticated users can apply"
  on public.match_applications for insert
  with check (auth.uid() = applicant_id);

create policy "Authorized users can update applications"
  on public.match_applications for update
  using (
    auth.uid() = applicant_id
    or exists (
      select 1 from public.match_posts
      where match_posts.id = match_applications.post_id
        and match_posts.author_id = auth.uid()
    )
  );

create policy "Applicants can delete own applications"
  on public.match_applications for delete
  using (auth.uid() = applicant_id);


-- ============================================================
-- 3. RPC: Atomic accepted_count update with auto-close/reopen
-- ============================================================
create or replace function update_match_accepted_count(post_uuid uuid)
returns void
language plpgsql
security definer
as $$
declare
  new_count integer;
  max_p integer;
begin
  select count(*)::integer into new_count
  from public.match_applications
  where post_id = post_uuid and status = 'accepted';

  select max_participants into max_p
  from public.match_posts
  where id = post_uuid;

  update public.match_posts
  set
    accepted_count = new_count,
    status = case
      when status = 'open' and new_count >= max_p then 'closed'
      when status = 'closed' and new_count < max_p then 'open'
      else status
    end,
    updated_at = now()
  where id = post_uuid;
end;
$$;

create table if not exists public.tournaments (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references auth.users not null,

  title text not null check (char_length(title) >= 1 and char_length(title) <= 100),
  description text check (char_length(description) <= 2000),

  format text not null default 'single_elimination'
    check (format in ('single_elimination', 'round_robin', 'round_robin_playoff')),
  match_type text not null default 'singles'
    check (match_type in ('singles', 'mens_doubles', 'womens_doubles', 'mixed_doubles', 'random_doubles')),
  scoring_format text not null default 'games_6'
    check (scoring_format in ('games_4', 'games_6', 'pro_set_8', 'tiebreak_10', 'best_of_3')),
  no_ad_scoring boolean not null default false,
  max_participants integer not null default 8
    check (max_participants >= 4 and max_participants <= 64),

  status text not null default 'draft'
    check (status in ('draft', 'registration', 'in_progress', 'completed', 'cancelled')),

  share_token text unique,
  is_public boolean not null default false,
  draw_type text not null default 'random'
    check (draw_type in ('random', 'seeded', 'manual')),

  play_date date,
  location text,
  district text,
  court_name text,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists tournaments_creator_id_idx
  on public.tournaments(creator_id);

create index if not exists tournaments_share_token_idx
  on public.tournaments(share_token)
  where share_token is not null;

create index if not exists tournaments_status_created_at_idx
  on public.tournaments(status, created_at desc);

alter table public.tournaments enable row level security;

create policy "Anyone can view public tournaments or own tournaments"
  on public.tournaments for select
  using (is_public = true or creator_id = auth.uid());

create policy "Authenticated users can create tournaments"
  on public.tournaments for insert
  with check (auth.uid() = creator_id);

create policy "Creators can update own tournaments"
  on public.tournaments for update
  using (auth.uid() = creator_id);

create policy "Creators can delete own tournaments"
  on public.tournaments for delete
  using (auth.uid() = creator_id);

create table if not exists public.tournament_participants (
  id uuid default gen_random_uuid() primary key,
  tournament_id uuid references public.tournaments(id) on delete cascade not null,
  user_id uuid references auth.users,
  name text not null check (char_length(name) >= 1 and char_length(name) <= 50),
  seed_number integer check (seed_number >= 1 and seed_number <= 64),
  partner_name text check (char_length(partner_name) <= 50),
  created_at timestamptz default now() not null,

  unique (tournament_id, seed_number)
);

create index if not exists tournament_participants_tournament_id_idx
  on public.tournament_participants(tournament_id);

create index if not exists tournament_participants_user_id_idx
  on public.tournament_participants(user_id);

alter table public.tournament_participants enable row level security;

create policy "View tournament participants by tournament visibility"
  on public.tournament_participants for select
  using (
    exists (
      select 1
      from public.tournaments t
      where t.id = tournament_participants.tournament_id
        and (t.is_public = true or t.creator_id = auth.uid())
    )
  );

create policy "Creators can insert tournament participants"
  on public.tournament_participants for insert
  with check (
    exists (
      select 1
      from public.tournaments t
      where t.id = tournament_participants.tournament_id
        and t.creator_id = auth.uid()
    )
  );

create policy "Creators can update tournament participants"
  on public.tournament_participants for update
  using (
    exists (
      select 1
      from public.tournaments t
      where t.id = tournament_participants.tournament_id
        and t.creator_id = auth.uid()
    )
  );

create policy "Creators can delete tournament participants"
  on public.tournament_participants for delete
  using (
    exists (
      select 1
      from public.tournaments t
      where t.id = tournament_participants.tournament_id
        and t.creator_id = auth.uid()
    )
  );

create table if not exists public.tournament_matches (
  id uuid default gen_random_uuid() primary key,
  tournament_id uuid references public.tournaments(id) on delete cascade not null,
  round integer not null check (round >= 1),
  match_number integer not null check (match_number >= 1),
  participant1_id uuid references public.tournament_participants(id) on delete set null,
  participant2_id uuid references public.tournament_participants(id) on delete set null,
  winner_id uuid references public.tournament_participants(id) on delete set null,
  score jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed', 'bye')),
  next_match_id uuid references public.tournament_matches(id) on delete set null,
  court_number integer check (court_number > 0),
  completed_at timestamptz,
  created_at timestamptz default now() not null,

  unique (tournament_id, round, match_number)
);

create index if not exists tournament_matches_tournament_id_idx
  on public.tournament_matches(tournament_id);

create index if not exists tournament_matches_next_match_id_idx
  on public.tournament_matches(next_match_id);

alter table public.tournament_matches enable row level security;

create policy "View tournament matches by tournament visibility"
  on public.tournament_matches for select
  using (
    exists (
      select 1
      from public.tournaments t
      where t.id = tournament_matches.tournament_id
        and (t.is_public = true or t.creator_id = auth.uid())
    )
  );

create policy "Creators can insert tournament matches"
  on public.tournament_matches for insert
  with check (
    exists (
      select 1
      from public.tournaments t
      where t.id = tournament_matches.tournament_id
        and t.creator_id = auth.uid()
    )
  );

create policy "Creators can update tournament matches"
  on public.tournament_matches for update
  using (
    exists (
      select 1
      from public.tournaments t
      where t.id = tournament_matches.tournament_id
        and t.creator_id = auth.uid()
    )
  );

create policy "Creators can delete tournament matches"
  on public.tournament_matches for delete
  using (
    exists (
      select 1
      from public.tournaments t
      where t.id = tournament_matches.tournament_id
        and t.creator_id = auth.uid()
    )
  );

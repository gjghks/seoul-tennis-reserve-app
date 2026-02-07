create table public.feedback (
  id uuid default gen_random_uuid() primary key,
  category text not null check (category in ('feature', 'bug', 'other')),
  content text not null check (char_length(content) >= 5 and char_length(content) <= 500),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index feedback_created_at_idx on public.feedback(created_at desc);

alter table public.feedback enable row level security;

create policy "Anyone can submit feedback" on public.feedback
  for insert with check (true);

create policy "Service role can read feedback" on public.feedback
  for select using (false);

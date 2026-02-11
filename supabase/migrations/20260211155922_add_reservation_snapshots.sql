create table public.reservation_snapshots (
  id bigint generated always as identity primary key,
  snapshot_at timestamp with time zone not null default timezone('utc'::text, now()),
  district text not null,
  total_courts integer not null default 0,
  available_courts integer not null default 0,
  booked_courts integer not null default 0,
  free_courts integer not null default 0,
  paid_courts integer not null default 0
);

create index snapshots_district_time_idx
  on public.reservation_snapshots(district, snapshot_at desc);

create index snapshots_time_idx
  on public.reservation_snapshots(snapshot_at desc);

alter table public.reservation_snapshots enable row level security;

create policy "Anyone can read snapshots" on public.reservation_snapshots
  for select using (true);

create policy "Service role can insert snapshots" on public.reservation_snapshots
  for insert with check (true);

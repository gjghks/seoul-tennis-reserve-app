create table public.site_visits (
  visit_date date primary key default current_date,
  visit_count integer not null default 1,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.site_visits enable row level security;

create policy "Anyone can read visit counts" on public.site_visits
  for select using (true);

create or replace function increment_site_visit()
returns json
language plpgsql
security definer
as $$
declare
  today_count integer;
  total_count bigint;
begin
  insert into public.site_visits (visit_date, visit_count)
  values (current_date, 1)
  on conflict (visit_date)
  do update set
    visit_count = site_visits.visit_count + 1,
    updated_at = timezone('utc'::text, now());

  select visit_count into today_count
  from public.site_visits
  where visit_date = current_date;

  select coalesce(sum(visit_count), 0) into total_count
  from public.site_visits;

  return json_build_object('today', today_count, 'total', total_count);
end;
$$;

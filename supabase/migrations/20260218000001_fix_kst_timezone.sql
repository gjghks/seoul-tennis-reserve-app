-- Fix increment_site_visit() to use KST date instead of UTC current_date
-- Supabase server runs in UTC, so current_date returns UTC date.
-- For Korean users, visits between KST 00:00~08:59 were recorded as the previous day.
create or replace function increment_site_visit()
returns json
language plpgsql
security definer
as $$
declare
  kst_today date;
  today_count integer;
  total_count bigint;
begin
  kst_today := (now() at time zone 'Asia/Seoul')::date;

  insert into public.site_visits (visit_date, visit_count)
  values (kst_today, 1)
  on conflict (visit_date)
  do update set
    visit_count = site_visits.visit_count + 1,
    updated_at = now();

  select visit_count into today_count
  from public.site_visits
  where visit_date = kst_today;

  select coalesce(sum(visit_count), 0) into total_count
  from public.site_visits;

  return json_build_object('today', today_count, 'total', total_count);
end;
$$;

alter table public.site_visits
  alter column visit_date set default (now() at time zone 'Asia/Seoul')::date;

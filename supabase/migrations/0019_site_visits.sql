-- 홈페이지 방문자 수 (날짜별 방문 수만 저장. IP·기기 정보 등 개인정보는 저장하지 않습니다)
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다.
--
-- 같은 브라우저는 하루(한국 시간)에 한 번만 셉니다. (브라우저에 오늘 날짜만 기억)

create table if not exists public.site_visits (
  day date primary key,
  visits integer not null default 0 check (visits >= 0)
);

alter table public.site_visits enable row level security;
revoke all on public.site_visits from anon, authenticated;

-- 방문 1회 기록 후 오늘·전체 방문 수를 돌려줌
create or replace function public.record_visit()
returns table (today integer, total bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  d date := (now() at time zone 'Asia/Seoul')::date;
begin
  insert into public.site_visits (day, visits) values (d, 1)
  on conflict (day) do update set visits = public.site_visits.visits + 1;
  return query
    select coalesce((select v.visits from public.site_visits v where v.day = d), 0),
           coalesce((select sum(v.visits) from public.site_visits v), 0)::bigint;
end;
$$;

-- 오늘·전체 방문 수만 조회
create or replace function public.visit_stats()
returns table (today integer, total bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select v.visits from public.site_visits v where v.day = (now() at time zone 'Asia/Seoul')::date), 0),
         coalesce((select sum(v.visits) from public.site_visits v), 0)::bigint;
$$;

revoke execute on function public.record_visit() from public;
revoke execute on function public.visit_stats() from public;
grant execute on function public.record_visit() to anon, authenticated;
grant execute on function public.visit_stats() to anon, authenticated;

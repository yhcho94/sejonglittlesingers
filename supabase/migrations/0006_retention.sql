-- 개인정보 파기 자동화: 회원 탈퇴 · 퇴단 1년 후 삭제 · 예약 작업
-- 0001~0005 를 실행한 뒤 SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다.
--
--  1) 사진 삭제 대기열: 신청서·단원 행이 어떤 경로로 지워지든(탈퇴, 대시보드에서 계정 삭제, 자동 파기)
--     사진 경로가 대기열에 들어가고, 홈페이지 예약 작업이 Storage API 로 실제 파일을 지웁니다.
--     (Storage 파일은 SQL 로 행만 지우면 실제 파일이 남으므로 반드시 Storage API 로 지워야 합니다)
--  2) 회원 탈퇴: 본인 계정 삭제 → 회원 정보·입단 신청 함께 삭제 (단원 명부는 보호자 연결만 해제)
--  3) 퇴단 후 1년이 지난 단원 정보 자동 삭제
--  4) pg_cron: 매일 새벽(한국 시간 3시) 반려 5일 경과 신청 · 퇴단 1년 경과 단원 자동 삭제

-- ─────────────────────────────────────────────
-- 1) 사진 삭제 대기열
-- ─────────────────────────────────────────────
create table if not exists public.storage_cleanup (
  id bigint generated always as identity primary key,
  bucket_id text not null check (bucket_id in ('application-photos', 'singer-photos')),
  path text not null,
  queued_at timestamptz not null default now(),
  unique (bucket_id, path)
);

alter table public.storage_cleanup enable row level security;

drop policy if exists "관리자 조회·처리" on public.storage_cleanup;
create policy "관리자 조회·처리" on public.storage_cleanup
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

revoke all on public.storage_cleanup from anon;
grant select, delete on public.storage_cleanup to authenticated;

-- 행이 지워지거나 사진이 바뀌면 이전 사진 경로를 대기열에 넣습니다.
-- (트리거 인자: 버킷 이름)
create or replace function public.queue_photo_cleanup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.photo_path is not null
     and (tg_op = 'DELETE' or new.photo_path is distinct from old.photo_path) then
    insert into public.storage_cleanup (bucket_id, path)
    values (tg_argv[0], old.photo_path)
    on conflict (bucket_id, path) do nothing;
  end if;
  return null;
end;
$$;

revoke execute on function public.queue_photo_cleanup() from public, anon, authenticated;

create or replace trigger applications_photo_cleanup
  after delete or update on public.applications
  for each row execute function public.queue_photo_cleanup('application-photos');

create or replace trigger singers_photo_cleanup
  after delete or update on public.singers
  for each row execute function public.queue_photo_cleanup('singer-photos');

-- ─────────────────────────────────────────────
-- 2) 회원 탈퇴 / 관리자의 회원 삭제
-- auth.users 를 지우면 profiles → applications 가 함께 지워지고(cascade),
-- 단원 명부의 보호자 연결은 해제됩니다(set null).
-- ─────────────────────────────────────────────
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not_signed_in';
  end if;
  -- 마지막 관리자가 탈퇴하면 아무도 관리할 수 없으므로 막습니다.
  if exists (select 1 from public.profiles where id = uid and role = 'admin')
     and (select count(*) from public.profiles where role = 'admin') <= 1 then
    raise exception 'last_admin';
  end if;
  delete from auth.users where id = uid;
end;
$$;

create or replace function public.admin_delete_member(target_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;
  if target_id = auth.uid() then
    raise exception 'self';
  end if;
  delete from auth.users where id = target_id;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
revoke execute on function public.admin_delete_member(uuid) from public, anon;
grant execute on function public.delete_my_account() to authenticated;
grant execute on function public.admin_delete_member(uuid) to authenticated;

-- ─────────────────────────────────────────────
-- 3) 퇴단 후 1년 경과 단원 삭제
-- ─────────────────────────────────────────────
-- 상태를 '퇴단'으로 바꾸고 퇴단일을 비워 두면 오늘(한국 시간)을 퇴단일로 기록합니다.
create or replace function public.set_singer_left_on()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'left' and new.left_on is null then
    new.left_on := (now() at time zone 'Asia/Seoul')::date;
  end if;
  return new;
end;
$$;

create or replace trigger singers_left_on
  before insert or update on public.singers
  for each row execute function public.set_singer_left_on();

-- 이미 퇴단 상태인데 퇴단일이 없는 단원은 마지막 수정일을 퇴단일로 채움
update public.singers
set left_on = (updated_at at time zone 'Asia/Seoul')::date
where status = 'left' and left_on is null;

create or replace function public.purge_left_singers()
returns integer
language sql
security definer
set search_path = ''
as $$
  with deleted as (
    delete from public.singers
    where status = 'left'
      and left_on <= ((now() at time zone 'Asia/Seoul')::date - interval '1 year')::date
    returning 1
  )
  select count(*)::integer from deleted;
$$;

-- 기한이 지난 퇴단 단원만 지우므로 로그인 사용자가 호출해도 안전합니다.
revoke execute on function public.purge_left_singers() from public, anon;
grant execute on function public.purge_left_singers() to authenticated;

-- ─────────────────────────────────────────────
-- 4) 예약 작업 (pg_cron). 매일 한국 시간 03:00 / 03:10 (UTC 18:00 / 18:10)
-- pg_cron 을 켤 수 없는 경우에도 위 내용은 적용되도록 경고만 남깁니다.
-- ─────────────────────────────────────────────
do $$
begin
  create extension if not exists pg_cron with schema pg_catalog;
  perform cron.schedule('purge-rejected-applications', '0 18 * * *', 'select public.purge_rejected_applications()');
  perform cron.schedule('purge-left-singers', '10 18 * * *', 'select public.purge_left_singers()');
exception when others then
  raise warning '예약 작업(pg_cron)을 만들지 못했습니다: %. Integrations → Cron 에서 pg_cron 을 켠 뒤 이 파일을 다시 실행하세요.', sqlerrm;
end;
$$;

-- 보안 점검 반영: 권한 최소화 · 보관기간 보완 · 이름 공개 동의 · 조직도 이름 잠금
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다. (0023 다음에 실행)
--
-- 1) 보호자의 입단 신청 사진 업로드 권한 삭제 (0017 부터 사진을 받지 않음. 예전 사진 조회·삭제는 유지)
-- 2) 보관기간: 심사하지 않은 대기 신청 6개월, 승인 후 단원 명부에 등록하지 않은 신청 3개월,
--    단원을 명부에서 삭제하면 연결된 입단 신청서도 함께 삭제
-- 3) 파기 함수는 예약 작업·서버, 또는 입단 신청·단원 관리 권한이 있는 관리자만 실행
-- 4) 일반 관리자가 볼 수 있는 회원 정보를 담당 범위로 축소
--    - 입단 신청 권한: 입단 신청서를 낸 보호자만
--    - 단원 관리 권한: 보호자 회원과 단원에 연결된 보호자만 (다른 운영진·관리자 정보는 볼 수 없음)
-- 5) 사진 삭제 대기열은 해당 메뉴 권한별로만 조회·처리
-- 6) 조직도에 승인된 운영진·학부모 대표는 본인이 이름을 바꿀 수 없음 (최상위 관리자만 변경)
-- 7) 입단 신청서에 '단원 소개 이름·반 게시' 동의 항목 추가

-- ─────────────────────────────────────────────
-- 1) 입단 신청 사진 업로드 권한 삭제
-- ─────────────────────────────────────────────
drop policy if exists "본인 폴더에 사진 업로드" on storage.objects;

-- ─────────────────────────────────────────────
-- 2)·3) 보관기간과 파기 함수
-- ─────────────────────────────────────────────
-- 예약 작업(로그인 없음)·비밀 키 서버, 또는 입단 신청·단원 관리 권한 관리자만
create or replace function public.can_run_retention()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is null
      or public.has_admin_perm('applications')
      or public.has_admin_perm('singers');
$$;
revoke execute on function public.can_run_retention() from public, anon;
grant execute on function public.can_run_retention() to authenticated;

create or replace function public.purge_rejected_applications()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  if not public.can_run_retention() then
    raise exception 'not_allowed';
  end if;
  with deleted as (
    delete from public.applications
    where status = 'rejected'
      and reviewed_at < now() - interval '5 days'
    returning 1
  )
  select count(*)::integer into n from deleted;
  return n;
end;
$$;

create or replace function public.purge_left_singers()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  if not public.can_run_retention() then
    raise exception 'not_allowed';
  end if;
  with deleted as (
    delete from public.singers
    where status = 'left'
      and left_on <= ((now() at time zone 'Asia/Seoul')::date - interval '1 year')::date
    returning application_id
  ), deleted_applications as (
    delete from public.applications
    where id in (select application_id from deleted where application_id is not null)
    returning 1
  )
  select count(*)::integer into n from deleted;
  return n;
end;
$$;

-- 심사하지 않은 대기 신청(6개월), 승인 후 명부에 등록하지 않은 신청(3개월)
create or replace function public.purge_stale_applications()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  if not public.can_run_retention() then
    raise exception 'not_allowed';
  end if;
  with deleted as (
    delete from public.applications a
    where (a.status = 'pending' and a.created_at < now() - interval '6 months')
       or (a.status = 'approved'
           and coalesce(a.reviewed_at, a.created_at) < now() - interval '3 months'
           and not exists (select 1 from public.singers s where s.application_id = a.id))
    returning 1
  )
  select count(*)::integer into n from deleted;
  return n;
end;
$$;

revoke execute on function public.purge_rejected_applications() from public, anon;
revoke execute on function public.purge_left_singers() from public, anon;
revoke execute on function public.purge_stale_applications() from public, anon;
grant execute on function public.purge_rejected_applications() to authenticated;
grant execute on function public.purge_left_singers() to authenticated;
grant execute on function public.purge_stale_applications() to authenticated;

-- 단원을 명부에서 삭제하면 연결된 입단 신청서도 삭제 (삭제하는 관리자에게 입단 신청 권한이 없어도)
create or replace function public.delete_linked_application()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.application_id is not null then
    delete from public.applications where id = old.application_id;
  end if;
  return old;
end;
$$;
revoke execute on function public.delete_linked_application() from public, anon, authenticated;

drop trigger if exists singers_delete_application on public.singers;
create trigger singers_delete_application
  after delete on public.singers
  for each row execute function public.delete_linked_application();

-- 매일 새벽 예약 작업에 추가 (pg_cron 이 없으면 홈페이지 예약 작업이 대신 실행)
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('purge-stale-applications', '20 18 * * *', 'select public.purge_stale_applications()');
  end if;
exception when others then
  raise warning '예약 작업(pg_cron)을 만들지 못했습니다: %', sqlerrm;
end;
$$;

-- ─────────────────────────────────────────────
-- 4) 일반 관리자의 회원 정보 조회 범위 축소
-- ─────────────────────────────────────────────
drop policy if exists "메뉴 권한 관리자 조회" on public.profiles;
create policy "메뉴 권한 관리자 조회" on public.profiles
  for select to authenticated
  using (
    ((select public.has_admin_perm('applications'))
      and exists (select 1 from public.applications a where a.guardian_id = profiles.id))
    or ((select public.has_admin_perm('singers'))
      and (profiles.member_type = 'parent'
           or exists (select 1 from public.singers s where s.guardian_id = profiles.id)))
  );

-- ─────────────────────────────────────────────
-- 5) 사진 삭제 대기열: 메뉴 권한별로만
-- ─────────────────────────────────────────────
drop policy if exists "메뉴 권한 관리자" on public.storage_cleanup;
create policy "메뉴 권한 관리자" on public.storage_cleanup
  for all to authenticated
  using (
    (bucket_id = 'application-photos' and (select public.has_admin_perm('applications')))
    or (bucket_id = 'singer-photos' and (select public.has_admin_perm('singers')))
    or (bucket_id = 'gallery-photos' and (select public.has_admin_perm('gallery')))
    or (bucket_id = 'audition-songs' and (select public.has_admin_perm('recruitment')))
  )
  with check (
    (bucket_id = 'application-photos' and (select public.has_admin_perm('applications')))
    or (bucket_id = 'singer-photos' and (select public.has_admin_perm('singers')))
    or (bucket_id = 'gallery-photos' and (select public.has_admin_perm('gallery')))
    or (bucket_id = 'audition-songs' and (select public.has_admin_perm('recruitment')))
  );

-- ─────────────────────────────────────────────
-- 6) 조직도에 승인된 사람의 이름은 최상위 관리자만 변경
-- ─────────────────────────────────────────────
create or replace function public.guard_locked_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.guardian_name is distinct from old.guardian_name
     and (old.org_visible or old.parent_rep_class is not null)
     and not public.is_admin() then
    raise exception 'name_locked';
  end if;
  return new;
end;
$$;
revoke execute on function public.guard_locked_name() from public, anon, authenticated;

drop trigger if exists profiles_guard_locked_name on public.profiles;
create trigger profiles_guard_locked_name
  before update of guardian_name on public.profiles
  for each row execute function public.guard_locked_name();

-- 최상위 관리자: 회원 이름 변경
create or replace function public.set_member_name(target_id uuid, new_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  n text := nullif(left(trim(coalesce(new_name, '')), 50), '');
begin
  if not public.is_admin() then
    raise exception 'not_super_admin';
  end if;
  if n is null then
    raise exception 'name_required';
  end if;
  update public.profiles set guardian_name = n where id = target_id;
  if not found then
    raise exception 'not_found';
  end if;
end;
$$;
revoke execute on function public.set_member_name(uuid, text) from public, anon;
grant execute on function public.set_member_name(uuid, text) to authenticated;

-- ─────────────────────────────────────────────
-- 7) 입단 신청서: 단원 소개 이름·반 게시 동의 (선택)
-- ─────────────────────────────────────────────
-- true: 동의, false: 미동의(명부 등록 시 게시 중단으로), null: 이 항목이 생기기 전 신청 (예전 방식: 게시 후 요청 시 중단)
alter table public.applications
  add column if not exists consent_name_listing boolean;
grant insert (consent_name_listing) on public.applications to authenticated;

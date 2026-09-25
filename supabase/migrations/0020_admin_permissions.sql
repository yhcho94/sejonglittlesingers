-- 관리자 신청 · 승인 · 메뉴별 권한
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다.
--
-- 1) 최상위 관리자(is_super): 모든 메뉴 + 회원 관리(관리자 승인·권한 부여). 이 파일을 실행할 때 이미 관리자인 회원은 모두 최상위 관리자가 됩니다.
-- 2) 일반 관리자: 최상위 관리자가 체크한 메뉴(admin_perms)만 조회·수정
--    메뉴 키: applications(입단 신청) singers(단원 관리) recruitment(입단 안내·FAQ·지정곡)
--             concerts(공연 일정) gallery(사진 갤러리) notices(공지사항) press(보도자료)
-- 3) 회원은 마이페이지에서 관리자 권한을 신청하고, 최상위 관리자가 승인·거절합니다.
--
-- 방식: 기존 정책이 쓰는 is_admin() 을 '최상위 관리자'로 좁히고,
--       일반 관리자용 정책을 표마다 추가합니다. (정책은 하나라도 통과하면 허용)

alter table public.profiles
  add column if not exists is_super boolean not null default false,
  add column if not exists admin_perms text[] not null default '{}',
  add column if not exists admin_requested_at timestamptz,
  add column if not exists admin_request_note text check (char_length(admin_request_note) <= 300);

-- 지금 관리자인 회원은 최상위 관리자로 (처음 실행할 때만 의미 있음. 다시 실행해도 결과 같음)
update public.profiles set is_super = true where role = 'admin' and not is_super
  and not exists (select 1 from public.profiles p where p.is_super);

-- ─────────────────────────────────────────────
-- 권한 확인 함수
-- ─────────────────────────────────────────────
-- 최상위 관리자만 true (기존 정책 전부가 이 함수를 쓰므로 일반 관리자는 기존 정책으로 통과하지 못함)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin' and is_super
  );
$$;

-- 메뉴 권한: 최상위 관리자이거나, 해당 메뉴를 허락받은 관리자
create or replace function public.has_admin_perm(area text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin' and (is_super or area = any (admin_perms))
  );
$$;

revoke execute on function public.has_admin_perm(text) from public, anon;
grant execute on function public.has_admin_perm(text) to authenticated;

-- ─────────────────────────────────────────────
-- 일반 관리자용 정책 (메뉴별)
-- ─────────────────────────────────────────────
do $$
declare
  r record;
begin
  for r in
    select * from (values
      ('notices', 'notices'),
      ('recruitment', 'recruitment'),
      ('faqs', 'recruitment'),
      ('audition_songs', 'recruitment'),
      ('concerts', 'concerts'),
      ('press', 'press'),
      ('gallery_albums', 'gallery'),
      ('gallery_photos', 'gallery'),
      ('applications', 'applications'),
      ('singers', 'singers')
    ) as t(tbl, area)
  loop
    if to_regclass('public.' || r.tbl) is not null then
      execute format('drop policy if exists %I on public.%I', '메뉴 권한 관리자', r.tbl);
      execute format(
        'create policy %I on public.%I for all to authenticated using ((select public.has_admin_perm(%L))) with check ((select public.has_admin_perm(%L)))',
        '메뉴 권한 관리자', r.tbl, r.area, r.area
      );
    end if;
  end loop;
end;
$$;

-- 단원 초상권 동의 기록: 단원 관리 권한으로 조회
drop policy if exists "메뉴 권한 관리자 조회" on public.media_consent_log;
create policy "메뉴 권한 관리자 조회" on public.media_consent_log
  for select to authenticated
  using ((select public.has_admin_perm('singers')));

-- 사진 삭제 대기열: 입단 신청·단원 관리 권한으로 조회·처리
drop policy if exists "메뉴 권한 관리자" on public.storage_cleanup;
create policy "메뉴 권한 관리자" on public.storage_cleanup
  for all to authenticated
  using ((select public.has_admin_perm('applications')) or (select public.has_admin_perm('singers')))
  with check ((select public.has_admin_perm('applications')) or (select public.has_admin_perm('singers')));

-- 보호자 정보: 입단 신청·단원 관리 권한이면 조회 (신청서·명부의 보호자 이름·연락처)
drop policy if exists "메뉴 권한 관리자 조회" on public.profiles;
create policy "메뉴 권한 관리자 조회" on public.profiles
  for select to authenticated
  using ((select public.has_admin_perm('applications')) or (select public.has_admin_perm('singers')));

-- 저장소(사진·음원)
drop policy if exists "메뉴 권한 관리자 신청 사진" on storage.objects;
create policy "메뉴 권한 관리자 신청 사진" on storage.objects
  for all to authenticated
  using (bucket_id = 'application-photos' and (select public.has_admin_perm('applications')))
  with check (bucket_id = 'application-photos' and (select public.has_admin_perm('applications')));

drop policy if exists "메뉴 권한 관리자 단원 사진" on storage.objects;
create policy "메뉴 권한 관리자 단원 사진" on storage.objects
  for all to authenticated
  using (bucket_id = 'singer-photos' and (select public.has_admin_perm('singers')))
  with check (bucket_id = 'singer-photos' and (select public.has_admin_perm('singers')));

drop policy if exists "메뉴 권한 관리자 갤러리 사진" on storage.objects;
create policy "메뉴 권한 관리자 갤러리 사진" on storage.objects
  for all to authenticated
  using (bucket_id = 'gallery-photos' and (select public.has_admin_perm('gallery')))
  with check (bucket_id = 'gallery-photos' and (select public.has_admin_perm('gallery')));

drop policy if exists "메뉴 권한 관리자 반주 음원" on storage.objects;
create policy "메뉴 권한 관리자 반주 음원" on storage.objects
  for all to authenticated
  using (bucket_id = 'audition-songs' and (select public.has_admin_perm('recruitment')))
  with check (bucket_id = 'audition-songs' and (select public.has_admin_perm('recruitment')));

-- ─────────────────────────────────────────────
-- 관리자 신청 (회원 본인)
-- ─────────────────────────────────────────────
create or replace function public.request_admin(note text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  update public.profiles
  set admin_requested_at = now(),
      admin_request_note = nullif(left(trim(coalesce(note, '')), 300), '')
  where id = auth.uid() and role = 'member';
end;
$$;

create or replace function public.cancel_admin_request()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles set admin_requested_at = null, admin_request_note = null where id = auth.uid();
$$;

-- ─────────────────────────────────────────────
-- 최상위 관리자 전용: 승인 · 권한 변경 · 해제 · 거절
-- ─────────────────────────────────────────────
create or replace function public.clean_admin_perms(perms text[])
returns text[]
language sql
immutable
set search_path = ''
as $$
  select coalesce(array_agg(distinct p order by p), '{}')
  from unnest(coalesce(perms, '{}')) as p
  where p in ('applications', 'singers', 'recruitment', 'concerts', 'gallery', 'notices', 'press');
$$;

-- 관리자로 승인하거나, 이미 관리자면 메뉴 권한을 바꿈
create or replace function public.set_admin_access(target_id uuid, perms text[], make_super boolean default false)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not_super_admin';
  end if;
  if target_id = auth.uid() then
    raise exception 'self';
  end if;
  update public.profiles
  set role = 'admin',
      is_super = coalesce(make_super, false),
      admin_perms = public.clean_admin_perms(perms),
      admin_requested_at = null,
      admin_request_note = null
  where id = target_id;
  if not found then
    raise exception 'not_found';
  end if;
end;
$$;

-- 관리자 해제 (일반 회원으로)
create or replace function public.revoke_admin(target_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not_super_admin';
  end if;
  if target_id = auth.uid() then
    raise exception 'self';
  end if;
  update public.profiles
  set role = 'member', is_super = false, admin_perms = '{}'
  where id = target_id;
end;
$$;

-- 관리자 신청 거절
create or replace function public.reject_admin_request(target_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not_super_admin';
  end if;
  update public.profiles set admin_requested_at = null, admin_request_note = null where id = target_id;
end;
$$;

-- 예전 역할 변경 함수도 권한 칸을 함께 정리 (최상위 관리자만, 본인 제외)
create or replace function public.set_member_role(target_id uuid, new_role public.user_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception '최상위 관리자만 권한을 변경할 수 있습니다.';
  end if;
  if target_id = auth.uid() then
    raise exception '본인의 권한은 변경할 수 없습니다.';
  end if;
  update public.profiles
  set role = new_role,
      is_super = case when new_role = 'admin' then is_super else false end,
      admin_perms = case when new_role = 'admin' then admin_perms else '{}' end
  where id = target_id;
end;
$$;

-- 마지막 최상위 관리자는 탈퇴할 수 없음
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
  if exists (select 1 from public.profiles where id = uid and role = 'admin' and is_super)
     and (select count(*) from public.profiles where role = 'admin' and is_super) <= 1 then
    raise exception 'last_admin';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.request_admin(text) from public, anon;
revoke execute on function public.cancel_admin_request() from public, anon;
revoke execute on function public.set_admin_access(uuid, text[], boolean) from public, anon;
revoke execute on function public.revoke_admin(uuid) from public, anon;
revoke execute on function public.reject_admin_request(uuid) from public, anon;
grant execute on function public.request_admin(text) to authenticated;
grant execute on function public.cancel_admin_request() to authenticated;
grant execute on function public.set_admin_access(uuid, text[], boolean) to authenticated;
grant execute on function public.revoke_admin(uuid) to authenticated;
grant execute on function public.reject_admin_request(uuid) to authenticated;

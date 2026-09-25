-- 조직도 자동 반영 · 학부모 부대표 · 회원 구분 변경
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다. (0022 다음에 실행)
--
-- 1) 운영진: 부지휘자·반주자·보컬트레이너·이론선생님은 담당 반(staff_class)을 고릅니다.
--    가입 후 역할·반·세부 담당은 최상위 관리자만 고칠 수 있습니다. (본인은 마이페이지에서 보기만)
--    최상위 관리자가 역할·반을 승인(org_visible)하면 합창단 소개 조직도에 이름이 나옵니다. (반 역할은 그 반 칸, 나머지는 전체 칸)
-- 1-1) 최상위 관리자 지정은 최상위 관리자만, 운영진 회원에게만 할 수 있습니다.
-- 2) 학부모 대표: 반 + 대표/부대표
-- 3) 최상위 관리자가 회원 구분(보호자 ↔ 운영진)을 바꿀 수 있음
-- 4) 공개 조직도에는 이름과 역할만 나갑니다. (연락처·이메일 제외)
-- 5) 조직도 표시 방식(site_settings.org_chart_source): legacy(예전 고정 조직도, 기본) · auto(회원 정보로 자동)
--    운영진 회원가입이 끝나면 최상위 관리자가 운영진 회원 화면에서 auto 로 바꿉니다.

alter table public.profiles
  add column if not exists parent_rep_title text,
  add column if not exists staff_class text,
  add column if not exists org_visible boolean not null default false;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_parent_rep_title_check') then
    alter table public.profiles
      add constraint profiles_parent_rep_title_check check (parent_rep_title in ('대표', '부대표'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_staff_class_check') then
    alter table public.profiles
      add constraint profiles_staff_class_check check (char_length(staff_class) <= 20);
  end if;
end;
$$;

-- 최상위 관리자는 운영진 회원 (지금 보호자로 되어 있는 최상위 관리자를 운영진으로 옮김, 학부모 대표 지정은 해제)
update public.profiles
set member_type = 'staff', parent_rep_class = null, parent_rep_title = null
where role = 'admin' and is_super and member_type = 'parent';

-- 0022 에서 지정한 대표는 '대표'
update public.profiles set parent_rep_title = '대표' where parent_rep_class is not null and parent_rep_title is null;

-- 학부모 대표 지정: 반 + 대표/부대표 (반이 비면 해제)
drop function if exists public.set_parent_rep(uuid, text);
create or replace function public.set_parent_rep(target_id uuid, class_name text, title text default '대표')
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  c text := nullif(left(trim(coalesce(class_name, '')), 20), '');
begin
  if not public.is_admin() then
    raise exception 'not_super_admin';
  end if;
  if c is not null and coalesce(title, '') not in ('대표', '부대표') then
    raise exception 'bad_title';
  end if;
  update public.profiles
  set parent_rep_class = c,
      parent_rep_title = case when c is null then null else title end
  where id = target_id and member_type = 'parent';
  if not found then
    raise exception 'not_parent';
  end if;
end;
$$;

-- 반을 맡는 역할
create or replace function public.is_class_role(role_name text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(role_name in ('부지휘자', '반주자', '보컬트레이너', '이론선생님'), false);
$$;

-- 최상위 관리자: 운영진 정보 수정 (역할 · 반 · 세부 담당 · 조직도 게시)
create or replace function public.admin_update_staff(
  target_id uuid, role_name text, class_name text, new_affiliation text, visible boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  r text := nullif(left(trim(coalesce(role_name, '')), 30), '');
begin
  if not public.is_admin() then
    raise exception 'not_super_admin';
  end if;
  if r is null then
    raise exception 'role_required';
  end if;
  update public.profiles
  set staff_role = r,
      member_type = public.staff_kind(r),
      staff_class = case when public.is_class_role(r) then nullif(left(trim(coalesce(class_name, '')), 20), '') end,
      affiliation = nullif(left(trim(coalesce(new_affiliation, '')), 100), ''),
      org_visible = coalesce(visible, false)
  where id = target_id and member_type in ('teacher', 'staff');
  if not found then
    raise exception 'not_staff';
  end if;
end;
$$;

-- 회원 구분 변경 (최상위 관리자, 본인 포함): parent ↔ staff
create or replace function public.set_member_type(target_id uuid, new_type text, role_name text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  r text := nullif(left(trim(coalesce(role_name, '')), 30), '');
begin
  if not public.is_admin() then
    raise exception 'not_super_admin';
  end if;
  if new_type = 'parent' and exists (select 1 from public.profiles where id = target_id and role = 'admin' and is_super) then
    raise exception 'super_must_be_staff';
  end if;
  if new_type = 'parent' then
    update public.profiles
    set member_type = 'parent', staff_role = null, affiliation = null, staff_class = null, org_visible = false
    where id = target_id;
  elsif new_type = 'staff' then
    update public.profiles
    set member_type = case when coalesce(r, staff_role) is null then 'staff' else public.staff_kind(coalesce(r, staff_role)) end,
        staff_role = coalesce(r, staff_role),
        parent_rep_class = null,
        parent_rep_title = null
    where id = target_id;
  else
    raise exception 'bad_type';
  end if;
  if not found then
    raise exception 'not_found';
  end if;
end;
$$;

-- 운영진 본인 역할·반·담당 수정 기능은 없앱니다. (0022 의 함수 삭제, 최상위 관리자만 admin_update_staff 로 수정)
drop function if exists public.update_my_staff_info(text, text);
drop function if exists public.update_my_staff_info(text, text, text);

-- 관리자 승인·권한 변경: 최상위 관리자 지정은 운영진 회원에게만 (0020 함수 교체)
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
  if coalesce(make_super, false)
     and not exists (select 1 from public.profiles where id = target_id and member_type in ('teacher', 'staff')) then
    raise exception 'super_requires_staff';
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

-- 가입 트리거: 운영진이면 역할·반·담당·신청 사유 저장 + 관리자 권한 신청 접수. role 은 항상 member 로 시작
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  is_staff boolean := coalesce(meta ->> 'member_type', '') in ('teacher', 'staff');
  role_name text := nullif(left(trim(coalesce(meta ->> 'staff_role', '')), 30), '');
begin
  insert into public.profiles (
    id, guardian_name, phone, email, member_type, staff_role, staff_class, affiliation, admin_requested_at, admin_request_note
  )
  values (
    new.id,
    coalesce(nullif(left(trim(meta ->> 'guardian_name'), 50), ''), '이름 미입력'),
    coalesce(nullif(left(trim(meta ->> 'phone'), 20), ''), '000-0000-0000'),
    new.email,
    case when not is_staff then 'parent' when role_name is null then meta ->> 'member_type' else public.staff_kind(role_name) end,
    case when is_staff then role_name end,
    case when is_staff and public.is_class_role(role_name) then nullif(left(trim(coalesce(meta ->> 'staff_class', '')), 20), '') end,
    case when is_staff then nullif(left(trim(coalesce(meta ->> 'affiliation', '')), 100), '') end,
    case when is_staff then now() end,
    case when is_staff then nullif(left(trim(coalesce(meta ->> 'request_note', '')), 300), '') end
  );
  return new;
end;
$$;

-- 공개 조직도: 위치(전체/반) · 역할 · 이름만
create or replace function public.org_chart()
returns table (section text, role text, name text)
language sql
stable
security definer
set search_path = ''
as $$
  select case when public.is_class_role(staff_role) and staff_class is not null then staff_class else '전체' end,
         coalesce(staff_role, '운영진'), guardian_name
  from public.profiles
  where member_type in ('teacher', 'staff') and org_visible
  union all
  select parent_rep_class, case when parent_rep_title = '부대표' then '부대표' else '학부모대표' end, guardian_name
  from public.profiles
  where member_type = 'parent' and parent_rep_class is not null
  order by 1, 2, 3;
$$;

-- 사이트 설정 (지금은 조직도 표시 방식 하나)
create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now(),
  constraint site_settings_org_chart_source check (key <> 'org_chart_source' or value in ('legacy', 'auto'))
);
alter table public.site_settings enable row level security;

drop policy if exists "공개 설정 조회" on public.site_settings;
create policy "공개 설정 조회" on public.site_settings
  for select to anon, authenticated
  using (key = 'org_chart_source');

drop policy if exists "최상위 관리자 설정 변경" on public.site_settings;
create policy "최상위 관리자 설정 변경" on public.site_settings
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;

revoke execute on function public.set_parent_rep(uuid, text, text) from public, anon;
revoke execute on function public.admin_update_staff(uuid, text, text, text, boolean) from public, anon;
revoke execute on function public.set_member_type(uuid, text, text) from public, anon;
grant execute on function public.set_parent_rep(uuid, text, text) to authenticated;
grant execute on function public.admin_update_staff(uuid, text, text, text, boolean) to authenticated;
grant execute on function public.set_member_type(uuid, text, text) to authenticated;
grant execute on function public.org_chart() to anon, authenticated;

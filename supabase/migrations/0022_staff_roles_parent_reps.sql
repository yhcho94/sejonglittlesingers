-- 운영진 역할 · 학부모 대표
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다. (0021 다음에 실행)
--
-- 1) 운영진 회원가입: 역할(단장·지휘자·반주자·사무국장 등)을 골라 가입, 가입 후 마이페이지에서 역할·담당 수정
--    역할은 표시용이며, 관리자 메뉴 권한은 최상위 관리자가 승인할 때 따로 정합니다.
-- 2) 학부모 대표: 최상위 관리자가 학부모 회원 중에서 반을 정해 지정

alter table public.profiles
  add column if not exists staff_role text,
  add column if not exists parent_rep_class text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_staff_role_check') then
    alter table public.profiles
      add constraint profiles_staff_role_check check (char_length(staff_role) <= 30);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_parent_rep_class_check') then
    alter table public.profiles
      add constraint profiles_parent_rep_class_check check (char_length(parent_rep_class) <= 20);
  end if;
end;
$$;

-- 지도 선생님 역할이면 teacher, 그 밖의 운영진은 staff
create or replace function public.staff_kind(role_name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case when role_name in ('지휘자', '부지휘자', '반주자', '보컬트레이너', '이론선생님') then 'teacher' else 'staff' end;
$$;

-- 가입 트리거: 운영진이면 역할·담당·신청 사유 저장 + 관리자 권한 신청 접수. role 은 항상 member 로 시작
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
    id, guardian_name, phone, email, member_type, staff_role, affiliation, admin_requested_at, admin_request_note
  )
  values (
    new.id,
    coalesce(nullif(left(trim(meta ->> 'guardian_name'), 50), ''), '이름 미입력'),
    coalesce(nullif(left(trim(meta ->> 'phone'), 20), ''), '000-0000-0000'),
    new.email,
    case when not is_staff then 'parent' when role_name is null then meta ->> 'member_type' else public.staff_kind(role_name) end,
    case when is_staff then role_name end,
    case when is_staff then nullif(left(trim(coalesce(meta ->> 'affiliation', '')), 100), '') end,
    case when is_staff then now() end,
    case when is_staff then nullif(left(trim(coalesce(meta ->> 'request_note', '')), 300), '') end
  );
  return new;
end;
$$;

-- 운영진 본인: 역할·담당 수정 (학부모 회원은 해당 없음)
create or replace function public.update_my_staff_info(new_role text, new_affiliation text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  role_name text := nullif(left(trim(coalesce(new_role, '')), 30), '');
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  if role_name is null then
    raise exception 'role_required';
  end if;
  update public.profiles
  set staff_role = role_name,
      member_type = public.staff_kind(role_name),
      affiliation = nullif(left(trim(coalesce(new_affiliation, '')), 100), '')
  where id = auth.uid() and member_type in ('teacher', 'staff');
end;
$$;

-- 최상위 관리자: 학부모 대표 지정(반) · 해제(null)
create or replace function public.set_parent_rep(target_id uuid, class_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not_super_admin';
  end if;
  update public.profiles
  set parent_rep_class = nullif(left(trim(coalesce(class_name, '')), 20), '')
  where id = target_id and member_type = 'parent';
  if not found then
    raise exception 'not_parent';
  end if;
end;
$$;

revoke execute on function public.update_my_staff_info(text, text) from public, anon;
revoke execute on function public.set_parent_rep(uuid, text) from public, anon;
grant execute on function public.update_my_staff_info(text, text) to authenticated;
grant execute on function public.set_parent_rep(uuid, text) to authenticated;

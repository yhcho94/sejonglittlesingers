-- 회원 구분: 학부모(기본) · 선생님 · 홈페이지 관리자
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다. (0020 다음에 실행)
--
-- 1) 회원가입 때 구분을 고릅니다. 기존 회원은 모두 학부모입니다.
-- 2) 선생님 · 홈페이지 관리자로 가입하면 자동으로 '관리자 권한 신청'이 접수되고,
--    최상위 관리자가 회원 관리 화면에서 메뉴를 체크해 승인합니다. (승인 전에는 일반 회원과 같음)
-- 3) 구분은 본인이 바꿀 수 없습니다. (역할을 스스로 올리지 못하도록)

alter table public.profiles
  add column if not exists member_type text not null default 'parent',
  add column if not exists affiliation text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_member_type_check') then
    alter table public.profiles
      add constraint profiles_member_type_check check (member_type in ('parent', 'teacher', 'staff'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_affiliation_check') then
    alter table public.profiles
      add constraint profiles_affiliation_check check (char_length(affiliation) <= 100);
  end if;
end;
$$;

-- 가입 트리거: 구분·담당(소속)·신청 사유를 받아 저장. role 은 항상 member 로 시작
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  kind text := case when meta ->> 'member_type' in ('teacher', 'staff') then meta ->> 'member_type' else 'parent' end;
begin
  insert into public.profiles (id, guardian_name, phone, email, member_type, affiliation, admin_requested_at, admin_request_note)
  values (
    new.id,
    coalesce(nullif(left(trim(meta ->> 'guardian_name'), 50), ''), '이름 미입력'),
    coalesce(nullif(left(trim(meta ->> 'phone'), 20), ''), '000-0000-0000'),
    new.email,
    kind,
    case when kind = 'parent' then null else nullif(left(trim(coalesce(meta ->> 'affiliation', '')), 100), '') end,
    case when kind = 'parent' then null else now() end,
    case when kind = 'parent' then null else nullif(left(trim(coalesce(meta ->> 'request_note', '')), 300), '') end
  );
  return new;
end;
$$;

-- 강사 프로필: 가입한 선생님이 마이페이지에서 본인 약력을 직접 입력 → 강사진 소개에 표시
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다. (0027 다음에 실행)
--
-- 1) staff_bios: 회원 1명당 1개. 소개 한마디 · 항목별 약력(JSON) · 개인 홈페이지
--    본인(강사 역할의 운영진 회원)만 쓰고 고칠 수 있고, 최상위 관리자도 고칠 수 있음
-- 2) faculty_bios(): 강사진 소개 화면용. 최상위 관리자가 조직도 게시를 승인한(org_visible) 강사만 공개
--    연락처·이메일 등 다른 회원 정보는 내보내지 않음
-- 회원을 삭제(탈퇴)하면 프로필도 함께 삭제됩니다.

-- 강사진 소개에 나오는 역할 (src/lib/staff-bio.ts 의 FACULTY_ROLES 와 같아야 합니다)
create or replace function public.is_faculty_role(role_name text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(role_name in ('단장', '지휘자', '부지휘자', '반주자', '보컬트레이너', '이론선생님', '사무국장'), false);
$$;

create table if not exists public.staff_bios (
  id uuid primary key references public.profiles (id) on delete cascade,
  intro text check (char_length(intro) <= 300),
  sections jsonb not null default '{}'::jsonb
    check (jsonb_typeof(sections) = 'object' and octet_length(sections::text) <= 20000),
  website text check (website is null or (char_length(website) <= 300 and website ~ '^https?://[^[:space:]<>"]+$')),
  updated_at timestamptz not null default now()
);
alter table public.staff_bios enable row level security;

-- 본인이 강사 역할의 운영진 회원인지 (profiles 는 RLS 로 막혀 있어 정의자 권한으로 확인)
create or replace function public.can_edit_own_staff_bio()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and member_type in ('teacher', 'staff')
      and public.is_faculty_role(staff_role)
  );
$$;
revoke execute on function public.can_edit_own_staff_bio() from public, anon;
grant execute on function public.can_edit_own_staff_bio() to authenticated;

drop policy if exists "본인 강사 프로필 조회" on public.staff_bios;
create policy "본인 강사 프로필 조회" on public.staff_bios
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "본인 강사 프로필 작성" on public.staff_bios;
create policy "본인 강사 프로필 작성" on public.staff_bios
  for insert to authenticated
  with check (
    (id = (select auth.uid()) and (select public.can_edit_own_staff_bio()))
    or (select public.is_admin())
  );

drop policy if exists "본인 강사 프로필 수정" on public.staff_bios;
create policy "본인 강사 프로필 수정" on public.staff_bios
  for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (
    (id = (select auth.uid()) and (select public.can_edit_own_staff_bio()))
    or (select public.is_admin())
  );

drop policy if exists "본인 강사 프로필 삭제" on public.staff_bios;
create policy "본인 강사 프로필 삭제" on public.staff_bios
  for delete to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

revoke all on public.staff_bios from anon;
grant select, insert, update, delete on public.staff_bios to authenticated;

-- 강사진 소개 화면용 공개 목록 (승인된 강사 + 저장한 프로필)
create or replace function public.faculty_bios()
returns table (name text, role text, class_name text, intro text, sections jsonb, website text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.guardian_name, p.staff_role, p.staff_class, b.intro, b.sections, b.website
  from public.staff_bios b
  join public.profiles p on p.id = b.id
  where p.member_type in ('teacher', 'staff')
    and p.org_visible
    and public.is_faculty_role(p.staff_role)
  order by p.guardian_name;
$$;
revoke execute on function public.faculty_bios() from public;
grant execute on function public.faculty_bios() to anon, authenticated;

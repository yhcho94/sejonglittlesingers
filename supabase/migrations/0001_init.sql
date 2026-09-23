-- 세종리틀싱어즈 초기 스키마
-- Supabase 대시보드 > SQL Editor 에 전체를 붙여넣고 한 번 실행합니다.
--
-- 전제: 프로젝트 생성 시 "Automatically expose new tables" 를 해제했으므로
-- 테이블 접근 권한(GRANT)을 아래에서 명시적으로 부여합니다.
-- 모든 테이블은 RLS(행 단위 보안)로 보호됩니다.

grant usage on schema public to anon, authenticated;

-- ─────────────────────────────────────────────
-- 타입
-- ─────────────────────────────────────────────
create type public.user_role as enum ('member', 'admin');
create type public.application_status as enum ('pending', 'approved', 'rejected');

-- ─────────────────────────────────────────────
-- 공통: updated_at 자동 갱신
-- ─────────────────────────────────────────────
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────
-- profiles: 회원(보호자) 정보. auth.users 와 1:1
-- ─────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  guardian_name text not null check (char_length(guardian_name) between 1 and 50),
  phone text not null check (char_length(phone) between 9 and 20),
  email text not null,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 관리자 여부 (RLS 정책에서 사용)
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 회원가입 시 profiles 행 자동 생성.
-- role 은 메타데이터에서 받지 않으므로 가입자가 스스로 관리자가 될 수 없습니다.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, guardian_name, phone, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'guardian_name'), ''), '이름 미입력'),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'phone'), ''), '000-0000-0000'),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "본인 또는 관리자 조회" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "본인 정보 수정" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

grant select on public.profiles to authenticated;
-- 본인이 수정할 수 있는 컬럼은 이름·연락처로 제한 (role 은 제외)
grant update (guardian_name, phone) on public.profiles to authenticated;

-- 관리자 권한 변경 (관리자만 호출 가능, 자기 자신은 변경 불가)
create function public.set_member_role(target_id uuid, new_role public.user_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception '관리자만 권한을 변경할 수 있습니다.';
  end if;
  if target_id = auth.uid() then
    raise exception '본인의 권한은 변경할 수 없습니다.';
  end if;
  update public.profiles set role = new_role where id = target_id;
end;
$$;

revoke execute on function public.set_member_role(uuid, public.user_role) from public, anon;
grant execute on function public.set_member_role(uuid, public.user_role) to authenticated;

-- ─────────────────────────────────────────────
-- notices: 공지사항
-- ─────────────────────────────────────────────
create table public.notices (
  id bigint generated always as identity primary key,
  title text not null check (char_length(title) between 1 and 200),
  body text not null check (char_length(body) <= 20000),
  is_pinned boolean not null default false,
  is_published boolean not null default true,
  author_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notices_list_idx on public.notices (is_pinned desc, created_at desc);

create trigger notices_updated_at
  before update on public.notices
  for each row execute function public.set_updated_at();

alter table public.notices enable row level security;

create policy "게시된 공지 공개 조회" on public.notices
  for select to anon, authenticated
  using (is_published);

create policy "관리자 전체 조회" on public.notices
  for select to authenticated
  using ((select public.is_admin()));

create policy "관리자 작성" on public.notices
  for insert to authenticated
  with check ((select public.is_admin()));

create policy "관리자 수정" on public.notices
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "관리자 삭제" on public.notices
  for delete to authenticated
  using ((select public.is_admin()));

grant select on public.notices to anon, authenticated;
grant insert, update, delete on public.notices to authenticated;

-- ─────────────────────────────────────────────
-- applications: 입단 신청 (보호자가 자녀 정보로 신청)
-- ─────────────────────────────────────────────
create table public.applications (
  id bigint generated always as identity primary key,
  guardian_id uuid not null references public.profiles (id) on delete cascade,
  child_name text not null check (char_length(child_name) between 1 and 50),
  child_birthdate date not null,
  school text check (char_length(school) <= 100),
  grade text check (char_length(grade) <= 20),
  address text check (char_length(address) <= 200),
  experience text check (char_length(experience) <= 2000),
  motivation text check (char_length(motivation) <= 2000),
  photo_path text,
  consent_privacy boolean not null check (consent_privacy),
  consent_guardian boolean not null check (consent_guardian),
  consent_photo boolean not null default false,
  status public.application_status not null default 'pending',
  admin_note text check (char_length(admin_note) <= 2000),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- 사진은 본인 폴더(guardian_id/...) 경로만 허용
  constraint photo_path_owner check (
    photo_path is null or photo_path like guardian_id::text || '/%'
  )
);

create index applications_guardian_idx on public.applications (guardian_id);
create index applications_status_idx on public.applications (status, created_at desc);

create trigger applications_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

alter table public.applications enable row level security;

create policy "본인 신청 또는 관리자 조회" on public.applications
  for select to authenticated
  using (guardian_id = (select auth.uid()) or (select public.is_admin()));

create policy "본인 명의 신청" on public.applications
  for insert to authenticated
  with check (guardian_id = (select auth.uid()) and status = 'pending');

create policy "관리자 심사" on public.applications
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "대기 중 본인 신청 취소 또는 관리자 삭제" on public.applications
  for delete to authenticated
  using (
    (guardian_id = (select auth.uid()) and status = 'pending')
    or (select public.is_admin())
  );

grant select, delete on public.applications to authenticated;
-- 신청자는 심사 관련 컬럼(status, admin_note, reviewed_*)을 넣을 수 없음
grant insert (
  guardian_id, child_name, child_birthdate, school, grade, address,
  experience, motivation, photo_path,
  consent_privacy, consent_guardian, consent_photo
) on public.applications to authenticated;
-- 수정은 관리자 정책으로만 통과하며, 심사 컬럼만 허용
grant update (status, admin_note, reviewed_at, reviewed_by) on public.applications to authenticated;

-- ─────────────────────────────────────────────
-- Storage: 신청 사진 (비공개 버킷)
-- 경로 규칙: {보호자 user id}/{파일명}
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'application-photos',
  'application-photos',
  false,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "본인 폴더에 사진 업로드" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'application-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "본인 또는 관리자 사진 조회" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'application-photos'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select public.is_admin())
    )
  );

create policy "본인 또는 관리자 사진 삭제" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'application-photos'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select public.is_admin())
    )
  );

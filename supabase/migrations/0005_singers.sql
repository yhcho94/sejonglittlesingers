-- 합창단원(단원) 관리
-- 0001~0004 를 실행한 뒤 SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다.
--
-- 아동 개인정보이므로 단원 표는 관리자만 조회·수정할 수 있습니다.
-- 공개 '단원 소개' 화면에는 이름 없는 통계와, 이름 공개에 동의한 단원의 이름·반만 제공합니다.

create table if not exists public.singers (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 50),
  birthdate date not null,
  gender text check (gender in ('여', '남')),
  school text check (char_length(school) <= 100),
  -- 학년은 출생연도로 자동 계산. 조기·유예 입학 등 예외일 때만 입력 (0=유치, 1~6=초, 7~9=중, 10~12=고)
  grade_override smallint check (grade_override between 0 and 12),
  class_name text check (class_name in ('울림반', '화음반', '선율반')),
  part text check (char_length(part) <= 20),
  cohort smallint check (cohort between 1 and 99),        -- 기수
  joined_on date,
  left_on date,
  status text not null default 'active' check (status in ('active', 'paused', 'left')),
  -- 보호자: 홈페이지 가입 회원과 연결하거나, 가입하지 않은 경우 직접 입력
  guardian_id uuid references public.profiles (id) on delete set null,
  guardian_name text check (char_length(guardian_name) <= 50),
  guardian_phone text check (char_length(guardian_phone) <= 20),
  photo_path text check (photo_path is null or photo_path like 'singers/%'),
  name_public boolean not null default false,             -- 단원 소개 화면 이름 공개 동의
  application_id bigint unique references public.applications (id) on delete set null,
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists singers_status_idx on public.singers (status, class_name);
create index if not exists singers_guardian_idx on public.singers (guardian_id);

create or replace trigger singers_updated_at
  before update on public.singers
  for each row execute function public.set_updated_at();

alter table public.singers enable row level security;

drop policy if exists "관리자 전체 관리" on public.singers;
create policy "관리자 전체 관리" on public.singers
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

revoke all on public.singers from anon;
grant select, insert, update, delete on public.singers to authenticated;

-- ─────────────────────────────────────────────
-- 공개용 함수 (이름 없는 통계 / 이름 공개 동의 단원)
-- ─────────────────────────────────────────────
create or replace function public.singer_public_stats()
returns table (class_name text, birth_year integer, grade_override smallint)
language sql
stable
security definer
set search_path = ''
as $$
  select s.class_name, extract(year from s.birthdate)::integer, s.grade_override
  from public.singers s
  where s.status = 'active';
$$;

create or replace function public.singer_public_names()
returns table (name text, class_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select s.name, s.class_name
  from public.singers s
  where s.status = 'active' and s.name_public
  order by s.class_name, s.name;
$$;

revoke execute on function public.singer_public_stats() from public;
revoke execute on function public.singer_public_names() from public;
grant execute on function public.singer_public_stats() to anon, authenticated;
grant execute on function public.singer_public_names() to anon, authenticated;

-- ─────────────────────────────────────────────
-- Storage: 단원 사진 (비공개, 관리자만)
-- 경로 규칙: singers/{파일명}
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('singer-photos', 'singer-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "관리자 단원 사진 조회" on storage.objects;
create policy "관리자 단원 사진 조회" on storage.objects
  for select to authenticated
  using (bucket_id = 'singer-photos' and (select public.is_admin()));

drop policy if exists "관리자 단원 사진 업로드" on storage.objects;
create policy "관리자 단원 사진 업로드" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'singer-photos' and (select public.is_admin()));

drop policy if exists "관리자 단원 사진 삭제" on storage.objects;
create policy "관리자 단원 사진 삭제" on storage.objects
  for delete to authenticated
  using (bucket_id = 'singer-photos' and (select public.is_admin()));

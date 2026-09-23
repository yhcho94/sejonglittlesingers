-- 입단 안내 · FAQ · 공연 일정
-- 0001_init.sql 을 실행한 뒤, SQL Editor 에서 이 파일 전체를 실행합니다.
-- 여러 번 실행해도 안전합니다.
-- 모든 내용은 관리자 화면에서 입력·수정합니다. (코드 수정 불필요)

-- ─────────────────────────────────────────────
-- recruitment: 입단 안내 (한 행만 존재)
-- ─────────────────────────────────────────────
create table if not exists public.recruitment (
  id smallint primary key default 1 check (id = 1),
  is_open boolean not null default false,          -- 모집 중 여부 (홈 배너 표시)
  period text check (char_length(period) <= 200),  -- 모집 기간
  target text check (char_length(target) <= 500),  -- 모집 대상
  schedule text check (char_length(schedule) <= 500), -- 연습 일정
  place text check (char_length(place) <= 500),    -- 연습 장소
  fee text check (char_length(fee) <= 500),        -- 회비
  audition text check (char_length(audition) <= 2000), -- 오디션·심사 방법
  classes text check (char_length(classes) <= 2000),   -- 반 구성
  notes text check (char_length(notes) <= 4000),       -- 기타 안내
  updated_at timestamptz not null default now()
);

insert into public.recruitment (id) values (1) on conflict (id) do nothing;

create or replace trigger recruitment_updated_at
  before update on public.recruitment
  for each row execute function public.set_updated_at();

alter table public.recruitment enable row level security;

drop policy if exists "입단 안내 공개 조회" on public.recruitment;
create policy "입단 안내 공개 조회" on public.recruitment
  for select to anon, authenticated
  using (true);

drop policy if exists "관리자 수정" on public.recruitment;
create policy "관리자 수정" on public.recruitment
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.recruitment to anon, authenticated;
grant update (is_open, period, target, schedule, place, fee, audition, classes, notes)
  on public.recruitment to authenticated;

-- ─────────────────────────────────────────────
-- faqs: 자주 묻는 질문
-- ─────────────────────────────────────────────
create table if not exists public.faqs (
  id bigint generated always as identity primary key,
  question text not null check (char_length(question) between 1 and 300),
  answer text not null check (char_length(answer) between 1 and 4000),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists faqs_order_idx on public.faqs (sort_order, id);

create or replace trigger faqs_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

alter table public.faqs enable row level security;

drop policy if exists "게시된 FAQ 공개 조회" on public.faqs;
create policy "게시된 FAQ 공개 조회" on public.faqs
  for select to anon, authenticated
  using (is_published);

drop policy if exists "관리자 전체 조회" on public.faqs;
create policy "관리자 전체 조회" on public.faqs
  for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "관리자 작성" on public.faqs;
create policy "관리자 작성" on public.faqs
  for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "관리자 수정" on public.faqs;
create policy "관리자 수정" on public.faqs
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "관리자 삭제" on public.faqs;
create policy "관리자 삭제" on public.faqs
  for delete to authenticated
  using ((select public.is_admin()));

grant select on public.faqs to anon, authenticated;
grant insert, update, delete on public.faqs to authenticated;

-- ─────────────────────────────────────────────
-- concerts: 공연 일정
-- ─────────────────────────────────────────────
create table if not exists public.concerts (
  id bigint generated always as identity primary key,
  title text not null check (char_length(title) between 1 and 200),
  starts_at timestamptz not null,
  venue text check (char_length(venue) <= 200),
  description text check (char_length(description) <= 10000),
  ticket_url text check (ticket_url ~ '^https://' and char_length(ticket_url) <= 500),
  video_url text check (video_url ~ '^https://' and char_length(video_url) <= 500),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists concerts_starts_at_idx on public.concerts (starts_at desc);

create or replace trigger concerts_updated_at
  before update on public.concerts
  for each row execute function public.set_updated_at();

alter table public.concerts enable row level security;

drop policy if exists "게시된 공연 공개 조회" on public.concerts;
create policy "게시된 공연 공개 조회" on public.concerts
  for select to anon, authenticated
  using (is_published);

drop policy if exists "관리자 전체 조회" on public.concerts;
create policy "관리자 전체 조회" on public.concerts
  for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "관리자 작성" on public.concerts;
create policy "관리자 작성" on public.concerts
  for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "관리자 수정" on public.concerts;
create policy "관리자 수정" on public.concerts
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "관리자 삭제" on public.concerts;
create policy "관리자 삭제" on public.concerts
  for delete to authenticated
  using ((select public.is_admin()));

grant select on public.concerts to anon, authenticated;
grant insert, update, delete on public.concerts to authenticated;

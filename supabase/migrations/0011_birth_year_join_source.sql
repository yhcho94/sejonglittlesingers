-- 출생연도만 아는 단원 · 가입경로
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다.
--
-- 1) birth_year_only: 기존 명단처럼 생일을 모르고 출생연도(나이)만 아는 경우.
--    birthdate 에는 그해 1월 1일을 넣고, 화면에는 'OOOO년생'으로만 표시하며 만 나이는 계산하지 않습니다.
-- 2) join_source: 가입경로 (입단 신청서에서 선택, 단원 명부로 옮김)

alter table public.singers
  add column if not exists birth_year_only boolean not null default false,
  add column if not exists join_source text check (char_length(join_source) <= 50);

alter table public.applications
  add column if not exists join_source text check (char_length(join_source) <= 50),
  add column if not exists join_source_detail text check (char_length(join_source_detail) <= 100);

grant insert (join_source, join_source_detail) on public.applications to authenticated;

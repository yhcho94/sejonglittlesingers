-- 공연 시각 미정 표시
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다.
-- time_tbd = true 이면 화면에 날짜만 보이고 '시간 미정'으로 표시합니다.
-- (정렬·'다가오는 공연' 판단을 위해 starts_at 에는 그날 한국 시간 12:00 을 넣어 둡니다)

alter table public.concerts
  add column if not exists time_tbd boolean not null default false;

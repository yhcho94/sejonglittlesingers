-- 입단 안내 페이지 문구를 관리자 → 입단 안내에서 수정
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다. (0029 다음에 실행)
--
-- recruitment 표에 칸 추가 (비어 있으면 홈페이지 기본 문구로 표시)
--   page_intro  : 페이지 제목 아래 한 줄 소개
--   steps       : 지원 절차 [{ "title": "...", "body": "..." }, ...] (최대 8단계)
--   songs_title : 오디션 곡 칸 제목 (예: 오디션 자유곡)
--   songs_intro : 오디션 곡 칸 안내 문구
-- 수정 권한은 기존 입단 안내와 같음 (최상위 관리자 · 입단 안내 메뉴 권한 관리자)

alter table public.recruitment
  add column if not exists page_intro text check (char_length(page_intro) <= 200),
  add column if not exists steps jsonb
    check (steps is null or (jsonb_typeof(steps) = 'array' and jsonb_array_length(steps) <= 8 and octet_length(steps::text) <= 8000)),
  add column if not exists songs_title text check (char_length(songs_title) <= 50),
  add column if not exists songs_intro text check (char_length(songs_intro) <= 1000);

grant update (page_intro, steps, songs_title, songs_intro) on public.recruitment to authenticated;

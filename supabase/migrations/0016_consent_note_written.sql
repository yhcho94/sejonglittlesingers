-- 초상권 동의 비고 · 기존 단원 서면 동의 반영
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다.
--
-- 1) consent_note: 초상권 동의 비고 (예: 서면으로 받았음)
-- 2) 2026. 9. 24. 까지 명단으로 등록한 기존 단원(온라인 입단 신청서로 등록한 단원 제외)은
--    보호자에게 초상권 동의서를 서면으로 받았으므로 ①②③ 모두 동의로 바꾸고 비고에 남깁니다.
--    바뀐 내용은 동의 기록(media_consent_log)에 '관리자 입력'으로 남고, 유효기간(5년)은 실행한 날부터 계산됩니다.
--    이미 비고가 있는 단원은 건드리지 않으므로 다시 실행해도 결과가 같습니다.

alter table public.singers
  add column if not exists consent_note text check (char_length(consent_note) <= 200);

update public.singers
set consent_media_channels = true,
    consent_media_press = true,
    name_public = true,
    consent_version = '서면',
    consent_note = '서면으로 받았음'
where application_id is null
  and consent_note is null
  and created_at < timestamptz '2026-09-25 00:00:00+09';

-- 단원 생년월일 선택 입력
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다.
-- 기존 명단처럼 이름·반만 있는 경우에도 등록할 수 있도록 생년월일을 비워 둘 수 있게 합니다.
-- (생년월일이 없으면 학년·나이는 '미입력'으로 표시하고, 관리자가 나중에 입력합니다)

alter table public.singers alter column birthdate drop not null;

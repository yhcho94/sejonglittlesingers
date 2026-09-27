-- 홈·합창단 소개의 수치 (창단, 활동 단원, 강사진·운영진, 연간 공연, 연간 주최 음악회)를 최상위 관리자가 입력
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다. (0023 이후)
--
-- site_settings 의 'site_stats' 항목에 JSON 으로 저장합니다. 비어 있는 항목은 자동값(명부 집계 등)으로 표시.
-- 누구나 읽을 수 있고(공개 화면 표시용), 쓰기는 기존 정책대로 최상위 관리자만 가능합니다.

-- 공개 조회 허용 항목에 'site_stats' 추가
drop policy if exists "공개 설정 조회" on public.site_settings;
create policy "공개 설정 조회" on public.site_settings
  for select to anon, authenticated
  using (key in ('org_chart_source', 'site_stats'));

-- 값 크기 제한 (수치 몇 개라 짧음)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'site_settings_value_length') then
    alter table public.site_settings
      add constraint site_settings_value_length check (char_length(value) <= 2000);
  end if;
end;
$$;

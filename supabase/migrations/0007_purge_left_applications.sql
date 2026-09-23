-- 퇴단 1년 경과 시 입단 신청서도 함께 삭제
-- 0006 을 실행한 뒤 SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다.
--
-- 개인정보처리방침: "입단 신청 정보 — 승인된 경우: 단원 활동 종료(퇴단) 후 1년"
-- 0006 의 자동 삭제는 단원 명부만 지웠으므로, 그 단원과 연결된 입단 신청서(와 사진)도 함께 지웁니다.
-- (사진 파일은 0006 의 삭제 대기열 트리거로 예약 작업에서 삭제)

create or replace function public.purge_left_singers()
returns integer
language sql
security definer
set search_path = ''
as $$
  with deleted as (
    delete from public.singers
    where status = 'left'
      and left_on <= ((now() at time zone 'Asia/Seoul')::date - interval '1 year')::date
    returning application_id
  ), deleted_applications as (
    delete from public.applications
    where id in (select application_id from deleted where application_id is not null)
    returning 1
  )
  select count(*)::integer from deleted;
$$;

revoke execute on function public.purge_left_singers() from public, anon;
grant execute on function public.purge_left_singers() to authenticated;

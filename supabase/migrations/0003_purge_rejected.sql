-- 반려된 입단 신청 정보 파기
-- 0001, 0002 를 실행한 뒤 SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다.
--
-- 개인정보처리방침: "입단 신청이 반려되면 신청 정보를 파기합니다."
--  1) 반려하는 순간: 사진과 선택 항목(학교·학년·주소·음악 경력·지원 동기)을 즉시 삭제
--     (사진 파일은 관리자 화면이 저장소에서 함께 삭제합니다)
--  2) 반려 후 5일: 결과 안내용으로 남긴 최소 기록(이름·생년월일·심사 결과)까지 삭제
--     「개인정보 보호법」 제21조는 불필요해진 개인정보를 "지체 없이" 파기하도록 하고,
--     개인정보보호위원회 「표준 개인정보 보호지침」은 정당한 사유가 없으면 5일 이내 파기를 기준으로 제시합니다.
--     보호자가 마이페이지에서 결과를 확인할 수 있도록 이 기한 안에서 5일을 둡니다.

-- 1) 반려 시 상세 정보 즉시 삭제
create or replace function public.scrub_rejected_application()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'rejected' and old.status is distinct from 'rejected' then
    new.school := null;
    new.grade := null;
    new.address := null;
    new.experience := null;
    new.motivation := null;
    new.photo_path := null;
    new.consent_photo := false;
  end if;
  return new;
end;
$$;

create or replace trigger applications_scrub_rejected
  before update on public.applications
  for each row execute function public.scrub_rejected_application();

-- 2) 반려 후 5일이 지난 신청 기록 삭제. 삭제한 건수를 돌려줍니다.
create or replace function public.purge_rejected_applications()
returns integer
language sql
security definer
set search_path = ''
as $$
  with deleted as (
    delete from public.applications
    where status = 'rejected'
      and reviewed_at < now() - interval '5 days'
    returning 1
  )
  select count(*)::integer from deleted;
$$;

-- 기한이 지난 반려 기록만 지우므로 로그인 사용자가 호출해도 안전합니다. (관리자 화면에서 자동 호출)
revoke execute on function public.purge_rejected_applications() from public, anon;
grant execute on function public.purge_rejected_applications() to authenticated;

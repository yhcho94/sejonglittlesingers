-- 입단 신청서 항목 정리 (기존 네이버 폼 기준)
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다.
--
-- 새 항목: 성별, 원하는 반, 사는 동, 소개해 준 지인, 특이사항
-- 학교 칸은 '소속 기관(○○초등학교·○○유치원)'으로 씁니다.
-- 사진·주소·학년·음악 경력·지원 동기는 더 이상 받지 않습니다. (예전 신청서의 값은 그대로 두고 기존 규칙대로 파기)
-- 오디션 동영상은 홈페이지에 올리지 않고 합창단 이메일로 받습니다.

alter table public.applications
  add column if not exists gender text check (gender in ('여', '남')),
  add column if not exists desired_class text check (desired_class in ('울림반', '화음반', '선율반')),
  add column if not exists neighborhood text check (char_length(neighborhood) <= 50),
  add column if not exists referrer text check (char_length(referrer) <= 100),
  add column if not exists notes text check (char_length(notes) <= 2000);

grant insert (gender, desired_class, neighborhood, referrer, notes) on public.applications to authenticated;

-- 반려하면 결과 안내용 최소 정보(이름·생년월일·심사 결과)만 남기고 나머지는 바로 지웁니다. (0003 의 규칙에 새 항목 추가)
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
    new.gender := null;
    new.desired_class := null;
    new.neighborhood := null;
    new.referrer := null;
    new.notes := null;
    new.join_source_detail := null;
  end if;
  return new;
end;
$$;

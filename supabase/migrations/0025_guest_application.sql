-- 보호자 회원가입 없이 입단 신청 (보호자 인적사항은 신청서에서 받음) · 학부모 대표는 운영진 역할로
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다. (0024 다음에 실행)
--
-- 1) 입단 신청서에 보호자 이름·관계·연락처 칸 추가, 회원 계정(guardian_id) 없이도 저장
-- 2) submit_application(): 로그인 없이 호출하는 신청 저장 함수 (값 검사·동의 확인·과다 제출 제한)
--    표에 직접 쓰는 권한은 주지 않고 이 함수로만 저장합니다.
-- 3) 운영진 역할에 '학부모대표'·'부대표' 추가 (반을 고르는 역할). 조직도에서 해당 반 칸에 표시

-- ─────────────────────────────────────────────
-- 1) 신청서 보호자 칸
-- ─────────────────────────────────────────────
alter table public.applications alter column guardian_id drop not null;

alter table public.applications
  add column if not exists guardian_name text check (char_length(guardian_name) <= 50),
  add column if not exists guardian_relation text check (char_length(guardian_relation) <= 20),
  add column if not exists guardian_phone text check (char_length(guardian_phone) <= 20);

-- ─────────────────────────────────────────────
-- 2) 로그인 없이 신청 저장
-- ─────────────────────────────────────────────
create or replace function public.submit_application(p jsonb)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  child_name text := nullif(trim(coalesce(p ->> 'child_name', '')), '');
  birth date;
  g_name text := nullif(trim(coalesce(p ->> 'guardian_name', '')), '');
  g_relation text := nullif(trim(coalesce(p ->> 'guardian_relation', '')), '');
  g_phone text := nullif(trim(coalesce(p ->> 'guardian_phone', '')), '');
  new_id bigint;
begin
  -- 필수 동의
  if coalesce((p ->> 'consent_privacy')::boolean, false) is not true
     or coalesce((p ->> 'consent_guardian')::boolean, false) is not true then
    raise exception 'consent_required';
  end if;
  -- 필수 항목
  if child_name is null or char_length(child_name) > 50 then raise exception 'child_name'; end if;
  begin
    birth := (p ->> 'child_birthdate')::date;
  exception when others then
    raise exception 'child_birthdate';
  end;
  if birth is null or birth > (now() at time zone 'Asia/Seoul')::date or birth < date '2000-01-01' then
    raise exception 'child_birthdate';
  end if;
  if g_name is null or char_length(g_name) > 50 then raise exception 'guardian_name'; end if;
  if g_relation is null or char_length(g_relation) > 20 then raise exception 'guardian_relation'; end if;
  if g_phone is null or g_phone !~ '^[0-9-]{9,20}$' then raise exception 'guardian_phone'; end if;

  -- 과다 제출 제한: 같은 연락처 하루 5건, 전체 한 시간 100건
  if (select count(*) from public.applications
      where guardian_phone = g_phone and created_at > now() - interval '1 day') >= 5 then
    raise exception 'too_many';
  end if;
  if (select count(*) from public.applications where created_at > now() - interval '1 hour') >= 100 then
    raise exception 'too_many';
  end if;

  insert into public.applications (
    guardian_id, guardian_name, guardian_relation, guardian_phone,
    child_name, child_birthdate, school, gender, desired_class, neighborhood, referrer, notes,
    join_source, join_source_detail,
    consent_privacy, consent_guardian,
    consent_media_channels, consent_media_press, consent_media_name, consent_media_version,
    consent_name_listing
  ) values (
    null, g_name, g_relation, g_phone,
    child_name, birth,
    nullif(left(trim(coalesce(p ->> 'school', '')), 100), ''),
    nullif(p ->> 'gender', ''),
    nullif(p ->> 'desired_class', ''),
    nullif(left(trim(coalesce(p ->> 'neighborhood', '')), 50), ''),
    nullif(left(trim(coalesce(p ->> 'referrer', '')), 100), ''),
    nullif(left(trim(coalesce(p ->> 'notes', '')), 2000), ''),
    nullif(left(trim(coalesce(p ->> 'join_source', '')), 50), ''),
    nullif(left(trim(coalesce(p ->> 'join_source_detail', '')), 100), ''),
    true, true,
    coalesce((p ->> 'consent_media_channels')::boolean, false),
    coalesce((p ->> 'consent_media_press')::boolean, false),
    coalesce((p ->> 'consent_media_name')::boolean, false),
    nullif(left(p ->> 'consent_media_version', 40), ''),
    coalesce((p ->> 'consent_name_listing')::boolean, false)
  )
  returning id into new_id;
  return new_id;
end;
$$;

revoke execute on function public.submit_application(jsonb) from public;
grant execute on function public.submit_application(jsonb) to anon, authenticated;

-- ─────────────────────────────────────────────
-- 3) 학부모 대표·부대표를 운영진 역할로 (반 역할)
-- ─────────────────────────────────────────────
create or replace function public.is_class_role(role_name text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(role_name in ('부지휘자', '반주자', '보컬트레이너', '이론선생님', '학부모대표', '부대표'), false);
$$;

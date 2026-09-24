-- 단원 소개: 활동 단원 이름·반 전체 게시 (보호자 요청 시 게시 중단)
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다.
--
-- 합창단 결정(2026. 9.): 기존 단원은 수기 동의서, 신규 단원은 입단 신청 시 안내·동의를 근거로
-- 홈페이지 '단원 소개'에 활동 단원의 이름과 반을 게시합니다.
-- 보호자가 요청하면(마이페이지 또는 담당자) name_hidden 으로 게시를 중단합니다.
-- (초상권 ③ name_public 은 게시물·영상 자막의 이름 표시 동의로만 사용)

alter table public.singers
  add column if not exists name_hidden boolean not null default false;

create or replace function public.singer_public_names()
returns table (name text, class_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select s.name, s.class_name
  from public.singers s
  where s.status = 'active' and not s.name_hidden
  order by s.class_name, s.name;
$$;

-- 보호자용 내 자녀 조회에 name_hidden 추가 (반환 형식이 바뀌어 다시 만듦)
drop function if exists public.my_singers();
create function public.my_singers()
returns table (
  id bigint, name text, class_name text, status text,
  consent_media_channels boolean, consent_media_press boolean, name_public boolean,
  consent_updated_at timestamptz, name_hidden boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select s.id, s.name, s.class_name, s.status,
         s.consent_media_channels, s.consent_media_press, s.name_public, s.consent_updated_at, s.name_hidden
  from public.singers s
  where s.guardian_id = auth.uid()
  order by s.name;
$$;

create or replace function public.set_my_name_hidden(p_singer_id bigint, p_hidden boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  update public.singers set name_hidden = coalesce(p_hidden, false)
  where id = p_singer_id and guardian_id = auth.uid();
  if not found then
    raise exception 'not_your_singer';
  end if;
end;
$$;

revoke execute on function public.my_singers() from public, anon;
revoke execute on function public.set_my_name_hidden(bigint, boolean) from public, anon;
grant execute on function public.my_singers() to authenticated;
grant execute on function public.set_my_name_hidden(bigint, boolean) to authenticated;

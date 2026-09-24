-- 단원 소개: 공개 화면에는 반별 인원 수만 제공 (학년·출생연도 비공개)
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다.
--
-- 학년 통계는 관리자 화면(단원 관리 → 통계)에서만 봅니다.
-- 로그인하지 않은 방문자·일반 회원이 출생연도 목록을 받아 가지 않도록 이전 공개 함수는 지웁니다.

create or replace function public.singer_public_counts()
returns table (class_name text, singers integer)
language sql
stable
security definer
set search_path = ''
as $$
  select s.class_name, count(*)::integer
  from public.singers s
  where s.status = 'active'
  group by s.class_name;
$$;

revoke execute on function public.singer_public_counts() from public;
grant execute on function public.singer_public_counts() to anon, authenticated;

drop function if exists public.singer_public_stats();

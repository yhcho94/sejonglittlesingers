-- 가입경로 선택지 변경: 지인소개 · SNS · 인터넷 검색 · 세종리틀싱어즈 공연관람 · 기타(직접 입력)
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다.
--
-- 1) 단원 명부에도 '기타'에 직접 입력한 내용을 저장할 칸을 만듭니다. (입단 신청서에는 0011 에서 만듦)
-- 2) 예전 선택지로 저장된 값을 새 선택지로 옮깁니다. 새 선택지로 합쳐지는 값은 원래 표기를 기타 내용 칸에 남깁니다.
--    지인 소개 → 지인소개 / 공연 관람 → 세종리틀싱어즈 공연관람
--    SNS (인스타그램 등) → SNS / 네이버 카페·블로그, 유튜브 → SNS (원래 표기 남김)
--    유치원·학교 안내 → 기타 (원래 표기 남김)

alter table public.singers
  add column if not exists join_source_detail text check (char_length(join_source_detail) <= 100);

do $$
declare
  t text;
begin
  foreach t in array array['singers', 'applications'] loop
    execute format($f$
      update public.%I set
        join_source_detail = case
          when join_source in ('네이버 카페·블로그', '유튜브', '유치원·학교 안내')
            then coalesce(join_source_detail, join_source)
          else join_source_detail
        end,
        join_source = case join_source
          when '지인 소개' then '지인소개'
          when '공연 관람' then '세종리틀싱어즈 공연관람'
          when 'SNS (인스타그램 등)' then 'SNS'
          when '네이버 카페·블로그' then 'SNS'
          when '유튜브' then 'SNS'
          when '유치원·학교 안내' then '기타'
        end
      where join_source in ('지인 소개', '공연 관람', 'SNS (인스타그램 등)', '네이버 카페·블로그', '유튜브', '유치원·학교 안내')
    $f$, t);
  end loop;
end;
$$;

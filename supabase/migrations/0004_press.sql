-- 보도자료
-- 0001~0003 을 실행한 뒤 SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다.
-- 이후 기사 추가·수정은 관리자 화면 > 보도자료 에서 합니다.

create table if not exists public.press (
  id bigint generated always as identity primary key,
  title text not null check (char_length(title) between 1 and 200),
  media text check (char_length(media) <= 50),      -- 언론사명 (비우면 기사 주소의 도메인 표시)
  url text not null unique check (url ~ '^https?://' and char_length(url) <= 500),
  published_on date,                                -- 게시일
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists press_published_on_idx on public.press (published_on desc nulls last);

create or replace trigger press_updated_at
  before update on public.press
  for each row execute function public.set_updated_at();

alter table public.press enable row level security;

drop policy if exists "게시된 보도자료 공개 조회" on public.press;
create policy "게시된 보도자료 공개 조회" on public.press
  for select to anon, authenticated
  using (is_published);

drop policy if exists "관리자 전체 조회" on public.press;
create policy "관리자 전체 조회" on public.press
  for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "관리자 작성" on public.press;
create policy "관리자 작성" on public.press
  for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "관리자 수정" on public.press;
create policy "관리자 수정" on public.press
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "관리자 삭제" on public.press;
create policy "관리자 삭제" on public.press
  for delete to authenticated
  using ((select public.is_admin()));

grant select on public.press to anon, authenticated;
grant insert, update, delete on public.press to authenticated;

-- 초기 자료: 합창단 네이버 카페 '뉴스 속 우리' 게시판 목록 (날짜는 카페 등록일)
insert into public.press (title, url, published_on) values
  ('기림의날 행사', 'http://www.w-madang.com/news/articleView.html?idxno=1295', '2026-08-15'),
  ('세종리틀싱어즈 6.10항쟁 행사', 'http://www.newspeach.com/news/articleView.html?idxno=9147', '2026-06-11'),
  ('세종어린이합창단 세종리틀싱어즈 소개 (세종시정지)', 'http://news.sejong.go.kr/news/articleView.html?idxno=4787', '2026-05-18'),
  ('세종리틀싱어즈 어린이날 행사', 'https://www.ilyoseoul.co.kr/news/articleView.html?idxno=516596', '2026-05-18'),
  ('세종리틀싱어즈 세종교육청 행사', 'https://www.ggilbo.com/news/articleView.html?idxno=1156459', '2026-05-18'),
  ('최민호시장 토크콘서트', 'https://www.sjmorning.kr/news/articleView.html?idxno=8727', '2026-01-25'),
  ('제3회 세종리틀싱어즈 정기연주회 홍보기사', 'https://www.w-madang.com/news/articleView.html?idxno=1222', '2025-12-03'),
  ('119메모리얼데이', 'http://www.newsdaily.kr/news/articleView.html?idxno=251879', '2025-11-05'),
  ('어린이음악제', 'http://daejeonpress.co.kr/news/66456', '2025-10-23'),
  ('동행축제', 'https://www.seoul.co.kr/news/life/2025/05/04/20250504500044', '2025-05-04'),
  ('세종리틀싱어즈 기사', 'http://www.bzeronews.com/news/articleView.html?idxno=691526', '2024-12-17'),
  ('세종음악제', 'http://www.w-madang.com/news/articleView.html?idxno=898', '2024-11-04'),
  ('2024.9 합창단소개', 'https://cafe.naver.com/f-e/cafes/31081134/articles/617', '2024-09-19'),
  ('세종리틀싱어즈 기사', 'https://m.joongdo.co.kr/view.php?key=20240428010008416', '2024-04-28'),
  ('세종리틀싱어즈 신문기사', 'https://www.newspeach.com/news/articleView.html?idxno=2033', '2024-01-23'),
  ('포근한감동,천사들의합창', 'http://www.w-madang.com/news/articleView.html?idxno=649', null)
on conflict (url) do nothing;

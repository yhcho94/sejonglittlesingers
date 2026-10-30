-- 사진 갤러리 앨범에 장소·블로그 글 주소 추가 (관리자 → 사진 갤러리)
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다. (0030 다음에 실행)
--
-- 공개된 앨범은 블로그 사진첩과 함께 '공연·행사 사진첩'(사진 갤러리·첫 화면 '무대 위의 순간들')에 날짜순으로 나옵니다.

alter table public.gallery_albums
  add column if not exists venue text check (char_length(venue) <= 100),
  add column if not exists post_url text
    check (post_url is null or (char_length(post_url) <= 500 and post_url ~ '^https?://[^[:space:]<>"]+$'));

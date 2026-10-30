-- 0032: 공연·행사 사진첩(블로그 사진)을 사진 갤러리 DB로 옮기기
-- 그동안 코드(src/lib/event-albums.ts)에 고정돼 있던 18개 앨범 · 35장을 gallery_albums / gallery_photos 에 넣어
-- 관리자 → 사진 갤러리에서 제목·날짜·장소·사진 설명을 고치거나 지울 수 있게 합니다.
-- 사진 파일은 지금처럼 사이트(public/images/events)에 그대로 두고, DB에는 그 주소만 넣습니다.
-- 여러 번 실행해도 안전합니다. (한 번 넣은 뒤에는 다시 넣지 않으므로, 관리자가 지운 앨범이 되살아나지 않습니다)

-- ① 사진 경로: 저장소 경로(albums/…) 외에 사이트 안 사진 경로(/images/events/…)도 허용
alter table public.gallery_photos drop constraint if exists gallery_photos_path_check;
alter table public.gallery_photos drop constraint if exists gallery_photos_thumb_path_check;
alter table public.gallery_photos
  add constraint gallery_photos_path_check
    check (path ~ '^albums/[0-9]+/[0-9a-f-]{36}\.jpg$' or path ~ '^/images/events/[A-Za-z0-9._-]+\.jpg$'),
  add constraint gallery_photos_thumb_path_check
    check (thumb_path ~ '^albums/[0-9]+/[0-9a-f-]{36}_t\.jpg$' or thumb_path ~ '^/images/events/[A-Za-z0-9._-]+\.jpg$');

-- ② 사진 초점(틀에 맞춰 잘릴 때 얼굴이 남도록, CSS object-position) · 옮겨 온 앨범 표시
alter table public.gallery_photos
  add column if not exists focus text not null default '50% 50%'
    check (focus ~ '^[0-9]{1,3}% [0-9]{1,3}%$');
alter table public.gallery_albums
  add column if not exists source_key text unique check (char_length(source_key) <= 100);

-- ③ 한 번만 넣기
do $$
declare
  aid bigint;
begin
  if exists (select 1 from public.site_settings where key = 'event_albums_seeded') then
    return;
  end if;

  -- 2026-09-19 제15회 세종시민체육대회 애국가 제창
  insert into public.gallery_albums (title, taken_on, venue, post_url, is_published, source_key)
    values ('제15회 세종시민체육대회 애국가 제창', '2026-09-19', '세종시민체육관', 'https://blog.naver.com/sejonglittlesingers/224417208787', true, 'blog-224417208787')
    returning id into aid;
  insert into public.gallery_photos (album_id, path, thumb_path, width, height, caption, focus, sort_order) values
    (aid, '/images/events/2026-09-19-224417208787-1.jpg', '/images/events/2026-09-19-224417208787-1.jpg', 900, 1200, '세종시민체육대회 현수막 앞에 선 애국가 제창 대표 단원들', '50% 50%', 1),
    (aid, '/images/events/2026-09-19-224417208787-2.jpg', '/images/events/2026-09-19-224417208787-2.jpg', 900, 675, '세종시민체육대회 무대에서 마스코트와 함께 애국가를 제창하는 세종리틀싱어즈 단원들', '50% 60%', 2);
  -- 2026-09-13 옐로우 스프링스 뮤직 페스타
  insert into public.gallery_albums (title, taken_on, venue, post_url, is_published, source_key)
    values ('옐로우 스프링스 뮤직 페스타', '2026-09-13', '현대 프리미엄 아울렛 대전점', 'https://blog.naver.com/sejonglittlesingers/224417215549', true, 'blog-224417215549')
    returning id into aid;
  insert into public.gallery_photos (album_id, path, thumb_path, width, height, caption, focus, sort_order) values
    (aid, '/images/events/2026-09-13-224417215549-1.jpg', '/images/events/2026-09-13-224417215549-1.jpg', 900, 600, '옐로우스프링스 가을음악회 현수막 앞에서 세종리틀싱어즈 배너를 들고 선 화음반 단원들', '50% 50%', 1),
    (aid, '/images/events/2026-09-13-224417215549-2.jpg', '/images/events/2026-09-13-224417215549-2.jpg', 900, 600, '옐로우 스프링스 뮤직 페스타 무대에서 밝은 표정으로 노래하는 화음반 어린이들', '50% 50%', 2);
  -- 2026-08-30 2026 세종 리틀싱어즈 향상음악회
  insert into public.gallery_albums (title, taken_on, venue, post_url, is_published, source_key)
    values ('2026 세종 리틀싱어즈 향상음악회', '2026-08-30', 'BOK아트센터', 'https://blog.naver.com/sejonglittlesingers/224407607153', true, 'blog-224407607153')
    returning id into aid;
  insert into public.gallery_photos (album_id, path, thumb_path, width, height, caption, focus, sort_order) values
    (aid, '/images/events/2026-08-30-224407607153-1.jpg', '/images/events/2026-08-30-224407607153-1.jpg', 899, 493, '2026 향상음악회 무대에 나란히 선 2부 출연 단원들', '50% 50%', 1),
    (aid, '/images/events/2026-08-30-224407607153-2.jpg', '/images/events/2026-08-30-224407607153-2.jpg', 900, 600, '향상음악회 무대에서 드레스를 입고 노래하는 어린이 단원들', '50% 50%', 2);
  -- 2026-08-14 2026년 일본군 위안부 피해자 기림의 날 행사
  insert into public.gallery_albums (title, taken_on, venue, post_url, is_published, source_key)
    values ('2026년 일본군 위안부 피해자 기림의 날 행사', '2026-08-14', '세종호수공원 평화의 소녀상 앞', 'https://blog.naver.com/sejonglittlesingers/224381754999', true, 'blog-224381754999')
    returning id into aid;
  insert into public.gallery_photos (album_id, path, thumb_path, width, height, caption, focus, sort_order) values
    (aid, '/images/events/2026-08-14-224381754999-1.jpg', '/images/events/2026-08-14-224381754999-1.jpg', 900, 675, '세종호수공원 평화의 소녀상 앞에서 추념 공연을 하는 세종리틀싱어즈 선율반 단원들', '50% 50%', 1);
  -- 2026-07-18 세종 리틀싱어즈 제4회 기획연주회 「무지갯빛 하모니」
  insert into public.gallery_albums (title, taken_on, venue, post_url, is_published, source_key)
    values ('세종 리틀싱어즈 제4회 기획연주회 「무지갯빛 하모니」', '2026-07-18', '대전 김인홀', 'https://blog.naver.com/sejonglittlesingers/224355132062', true, 'blog-224355132062')
    returning id into aid;
  insert into public.gallery_photos (album_id, path, thumb_path, width, height, caption, focus, sort_order) values
    (aid, '/images/events/2026-07-18-224355132062-1.jpg', '/images/events/2026-07-18-224355132062-1.jpg', 900, 675, '제4회 기획연주회 무대에서 지휘에 맞춰 노래하는 세종리틀싱어즈 단원들', '50% 50%', 1),
    (aid, '/images/events/2026-07-18-224355132062-2.jpg', '/images/events/2026-07-18-224355132062-2.jpg', 900, 600, '기획연주회 무대 위에서 노래하는 어린이 단원들의 표정', '50% 50%', 2);
  -- 2026-07-08 국악방송 개국 9주년 특집 '송진주의 음악정원' 녹화
  insert into public.gallery_albums (title, taken_on, venue, post_url, is_published, source_key)
    values ('국악방송 개국 9주년 특집 ''송진주의 음악정원'' 녹화', '2026-07-08', '국악방송', 'https://blog.naver.com/sejonglittlesingers/224341178375', true, 'blog-224341178375')
    returning id into aid;
  insert into public.gallery_photos (album_id, path, thumb_path, width, height, caption, focus, sort_order) values
    (aid, '/images/events/2026-07-08-224341178375-1.jpg', '/images/events/2026-07-08-224341178375-1.jpg', 900, 588, '대전국악방송 스튜디오에서 기념 촬영한 세종리틀싱어즈 대표 단원들', '50% 50%', 1),
    (aid, '/images/events/2026-07-08-224341178375-2.jpg', '/images/events/2026-07-08-224341178375-2.jpg', 900, 507, '헤드폰을 쓰고 국악방송 스튜디오에서 노래를 녹음하는 어린이 단원들', '41% 50%', 2);
  -- 2026-07-01 제5대 조상호 세종시장 취임식 애국가 제창
  insert into public.gallery_albums (title, taken_on, venue, post_url, is_published, source_key)
    values ('제5대 조상호 세종시장 취임식 애국가 제창', '2026-07-01', '세종시청 4층 여민실', 'https://blog.naver.com/sejonglittlesingers/224335594332', true, 'blog-224335594332')
    returning id into aid;
  insert into public.gallery_photos (album_id, path, thumb_path, width, height, caption, focus, sort_order) values
    (aid, '/images/events/2026-07-01-224335594332-1.jpg', '/images/events/2026-07-01-224335594332-1.jpg', 900, 1200, '조상호 세종특별자치시장 취임 축하 현수막과 세종대왕상 앞에 모인 세종리틀싱어즈 단원들', '50% 70%', 1),
    (aid, '/images/events/2026-07-01-224335594332-2.jpg', '/images/events/2026-07-01-224335594332-2.jpg', 900, 675, '제5대 세종시장 취임식 무대에서 애국가를 부르는 어린이 단원들', '50% 50%', 2);
  -- 2026-06-13 세종 환경교육 주간 & 환경교육 한마당
  insert into public.gallery_albums (title, taken_on, venue, post_url, is_published, source_key)
    values ('세종 환경교육 주간 & 환경교육 한마당', '2026-06-13', '세종호수공원', 'https://blog.naver.com/sejonglittlesingers/224315409050', true, 'blog-224315409050')
    returning id into aid;
  insert into public.gallery_photos (album_id, path, thumb_path, width, height, caption, focus, sort_order) values
    (aid, '/images/events/2026-06-13-224315409050-1.jpg', '/images/events/2026-06-13-224315409050-1.jpg', 900, 600, '2026 세종 환경교육 주간 & 한마당 아치 아래 모인 세종리틀싱어즈 단원들', '30% 50%', 1),
    (aid, '/images/events/2026-06-13-224315409050-2.jpg', '/images/events/2026-06-13-224315409050-2.jpg', 900, 600, '환경교육 한마당 무대에서 선글라스를 쓰고 노래하는 어린이 단원들', '50% 50%', 2);
  -- 2026-06-10 제39주년 6월 민주항쟁 세종 기념문화제
  insert into public.gallery_albums (title, taken_on, venue, post_url, is_published, source_key)
    values ('제39주년 6월 민주항쟁 세종 기념문화제', '2026-06-10', '세종호수공원 수상무대섬', 'https://blog.naver.com/sejonglittlesingers/224314008034', true, 'blog-224314008034')
    returning id into aid;
  insert into public.gallery_photos (album_id, path, thumb_path, width, height, caption, focus, sort_order) values
    (aid, '/images/events/2026-06-10-224314008034-1.jpg', '/images/events/2026-06-10-224314008034-1.jpg', 900, 573, '세종호수공원에서 응원 피켓을 들고 단체 사진을 찍은 세종리틀싱어즈 울림반 단원들', '50% 50%', 1),
    (aid, '/images/events/2026-06-10-224314008034-2.jpg', '/images/events/2026-06-10-224314008034-2.jpg', 900, 531, '세종호수공원 수상 무대에서 6월 민주항쟁 기념문화제 공연을 하는 세종리틀싱어즈 단원들', '50% 50%', 2);
  -- 2026-05-06 세종시교육청 '소통·공감의 날' 축하공연
  insert into public.gallery_albums (title, taken_on, venue, post_url, is_published, source_key)
    values ('세종시교육청 ''소통·공감의 날'' 축하공연', '2026-05-06', '세종시교육청', 'https://blog.naver.com/sejonglittlesingers/224278812320', true, 'blog-224278812320')
    returning id into aid;
  insert into public.gallery_photos (album_id, path, thumb_path, width, height, caption, focus, sort_order) values
    (aid, '/images/events/2026-05-06-224278812320-1.jpg', '/images/events/2026-05-06-224278812320-1.jpg', 900, 600, '세종특별자치시교육청 마스코트 앞에서 기념 촬영한 세종리틀싱어즈 단원들', '70% 50%', 1),
    (aid, '/images/events/2026-05-06-224278812320-2.jpg', '/images/events/2026-05-06-224278812320-2.jpg', 900, 600, '세종시교육청 소통·공감의 날 무대에서 축하공연을 하는 세종리틀싱어즈 단원들', '50% 50%', 2);
  -- 2026-05-05 2026 세종시 어린이날 기념식
  insert into public.gallery_albums (title, taken_on, venue, post_url, is_published, source_key)
    values ('2026 세종시 어린이날 기념식', '2026-05-05', '세종호수공원 중앙광장·매화공연장', 'https://blog.naver.com/sejonglittlesingers/224276228452', true, 'blog-224276228452')
    returning id into aid;
  insert into public.gallery_photos (album_id, path, thumb_path, width, height, caption, focus, sort_order) values
    (aid, '/images/events/2026-05-05-224276228452-1.jpg', '/images/events/2026-05-05-224276228452-1.jpg', 900, 491, '세종시 어린이날 축제 조형물 앞에서 주먹을 쥐고 포즈를 취한 세종리틀싱어즈 화음반 단원들', '50% 60%', 1),
    (aid, '/images/events/2026-05-05-224276228452-2.jpg', '/images/events/2026-05-05-224276228452-2.jpg', 900, 600, '어린이날 기념식 무대에서 어린이날 노래를 부르는 단원들', '50% 50%', 2);
  -- 2026-04-18 국립세종수목원 지역상생 꽃 축제 개막식
  insert into public.gallery_albums (title, taken_on, venue, post_url, is_published, source_key)
    values ('국립세종수목원 지역상생 꽃 축제 개막식', '2026-04-18', '국립세종수목원 축제마당', 'https://blog.naver.com/sejonglittlesingers/224257960655', true, 'blog-224257960655')
    returning id into aid;
  insert into public.gallery_photos (album_id, path, thumb_path, width, height, caption, focus, sort_order) values
    (aid, '/images/events/2026-04-18-224257960655-1.jpg', '/images/events/2026-04-18-224257960655-1.jpg', 899, 506, '국립세종수목원 꽃축제 무대 앞에서 세종리틀싱어즈 현수막을 들고 모인 단원들', '50% 50%', 1),
    (aid, '/images/events/2026-04-18-224257960655-2.jpg', '/images/events/2026-04-18-224257960655-2.jpg', 900, 507, '꽃축제 개막식 무대에서 애국가를 부르는 대표 단원들', '46% 50%', 2);
  -- 2026-03-28 함께 봄 음악회
  insert into public.gallery_albums (title, taken_on, venue, post_url, is_published, source_key)
    values ('함께 봄 음악회', '2026-03-28', '세종호수공원', 'https://blog.naver.com/sejonglittlesingers/224233524590', true, 'blog-224233524590')
    returning id into aid;
  insert into public.gallery_photos (album_id, path, thumb_path, width, height, caption, focus, sort_order) values
    (aid, '/images/events/2026-03-28-224233524590-1.jpg', '/images/events/2026-03-28-224233524590-1.jpg', 900, 600, '함께 봄 음악회 무대에서 노래하는 세종리틀싱어즈 울림반 단원들', '0% 50%', 1),
    (aid, '/images/events/2026-03-28-224233524590-2.jpg', '/images/events/2026-03-28-224233524590-2.jpg', 900, 573, '꽃을 들고 고향의 봄을 부르는 세종리틀싱어즈 어린이들', '30% 50%', 2);
  -- 2026-02-28 황운하 출판기념회 오프닝 초청 공연
  insert into public.gallery_albums (title, taken_on, venue, post_url, is_published, source_key)
    values ('황운하 출판기념회 오프닝 초청 공연', '2026-02-28', '아름동 복합커뮤니티센터', 'https://blog.naver.com/sejonglittlesingers/224199525838', true, 'blog-224199525838')
    returning id into aid;
  insert into public.gallery_photos (album_id, path, thumb_path, width, height, caption, focus, sort_order) values
    (aid, '/images/events/2026-02-28-224199525838-1.jpg', '/images/events/2026-02-28-224199525838-1.jpg', 900, 675, '황운하 출판기념회 무대에서 노래하는 세종리틀싱어즈 선율반 단원들', '50% 50%', 1),
    (aid, '/images/events/2026-02-28-224199525838-2.jpg', '/images/events/2026-02-28-224199525838-2.jpg', 899, 547, '출판기념회 현수막 앞에서 턱을 괴고 웃는 선율반 단원들', '65% 50%', 2);
  -- 2026-02-07 한국 영재 음악 콩쿠르
  insert into public.gallery_albums (title, taken_on, venue, post_url, is_published, source_key)
    values ('한국 영재 음악 콩쿠르', '2026-02-07', '세종시 BOK 아트센터', 'https://blog.naver.com/sejonglittlesingers/224179166381', true, 'blog-224179166381')
    returning id into aid;
  insert into public.gallery_photos (album_id, path, thumb_path, width, height, caption, focus, sort_order) values
    (aid, '/images/events/2026-02-07-224179166381-1.jpg', '/images/events/2026-02-07-224179166381-1.jpg', 900, 740, '한국영재음악콩쿠르 현수막 앞에서 꽃다발을 들고 선 세종리틀싱어즈 참가 단원들', '50% 50%', 1),
    (aid, '/images/events/2026-02-07-224179166381-2.jpg', '/images/events/2026-02-07-224179166381-2.jpg', 900, 558, '응원 피켓을 들고 웃는 콩쿠르 참가 단원들', '50% 50%', 2);
  -- 2026-01-24 세종시장님 출판기념회
  insert into public.gallery_albums (title, taken_on, venue, post_url, is_published, source_key)
    values ('세종시장님 출판기념회', '2026-01-24', '세종문화예술회관', 'https://blog.naver.com/sejonglittlesingers/224174080815', true, 'blog-224174080815')
    returning id into aid;
  insert into public.gallery_photos (album_id, path, thumb_path, width, height, caption, focus, sort_order) values
    (aid, '/images/events/2026-01-24-224174080815-1.jpg', '/images/events/2026-01-24-224174080815-1.jpg', 900, 600, '리틀싱어즈 화면 앞 무대에서 지휘에 맞춰 노래하는 선율반 단원들', '100% 50%', 1),
    (aid, '/images/events/2026-01-24-224174080815-2.jpg', '/images/events/2026-01-24-224174080815-2.jpg', 900, 600, '출판기념회 무대에서 노래하는 선율반 어린이들의 표정', '50% 50%', 2);
  -- 2025-12-16 세종 리틀싱어즈 제3회 정기연주회 〈우리들의 꿈〉
  insert into public.gallery_albums (title, taken_on, venue, post_url, is_published, source_key)
    values ('세종 리틀싱어즈 제3회 정기연주회 〈우리들의 꿈〉', '2025-12-16', '세종문화예술회관', 'https://blog.naver.com/sejonglittlesingers/224160392540', true, 'blog-224160392540')
    returning id into aid;
  insert into public.gallery_photos (album_id, path, thumb_path, width, height, caption, focus, sort_order) values
    (aid, '/images/events/2025-12-16-224160392540-1.jpg', '/images/events/2025-12-16-224160392540-1.jpg', 900, 488, '정기연주회 무대에 모인 세종리틀싱어즈 단원들과 지도 선생님들', '48% 50%', 1),
    (aid, '/images/events/2025-12-16-224160392540-2.jpg', '/images/events/2025-12-16-224160392540-2.jpg', 900, 605, '우리들의 꿈 포토월 앞에서 하트를 만들며 웃는 단원들', '50% 50%', 2);
  -- 2025-10-11 2025 세종한글축제 폐막식
  insert into public.gallery_albums (title, taken_on, venue, post_url, is_published, source_key)
    values ('2025 세종한글축제 폐막식', '2025-10-11', '세종호수공원 메인무대', 'https://blog.naver.com/sejonglittlesingers/224194440529', true, 'blog-224194440529')
    returning id into aid;
  insert into public.gallery_photos (album_id, path, thumb_path, width, height, caption, focus, sort_order) values
    (aid, '/images/events/2025-10-11-224194440529-1.jpg', '/images/events/2025-10-11-224194440529-1.jpg', 966, 725, '2025 세종한글축제 폐막식 무대에서 노래하는 세종리틀싱어즈 단원들', '50% 50%', 1),
    (aid, '/images/events/2025-10-11-224194440529-2.jpg', '/images/events/2025-10-11-224194440529-2.jpg', 966, 725, '한글축제 폐막식 무대 옆에서 출연을 기다리는 단원들', '50% 50%', 2);

  insert into public.site_settings (key, value) values ('event_albums_seeded', 'true');
end $$;

-- 홈페이지 로고(머리글·바닥글)를 최상위 관리자가 고르거나 새로 올림
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다. (0026 다음에 실행)
--
-- 1) site_settings 의 'site_logo' 항목: circle(원형 로고, 기본) · classic(예전 무지개 음표) · logos/<uuid>.png 등(올린 로고)
--    누구나 읽을 수 있고(화면 표시용), 쓰기는 기존 정책대로 최상위 관리자만
-- 2) 저장소 site-assets (공개 읽기): 로고 파일. 올리기·목록·삭제는 최상위 관리자만
--    PNG·JPG·WEBP, 2MB 이하, 경로는 logos/<uuid>.<확장자> 만 (SVG 는 받지 않음)

-- ─────────────────────────────────────────────
-- 1) 로고 설정
-- ─────────────────────────────────────────────
drop policy if exists "공개 설정 조회" on public.site_settings;
create policy "공개 설정 조회" on public.site_settings
  for select to anon, authenticated
  using (key in ('org_chart_source', 'site_stats', 'site_logo'));

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'site_settings_site_logo') then
    alter table public.site_settings add constraint site_settings_site_logo
      check (key <> 'site_logo' or value ~ '^(circle|classic|logos/[0-9a-f-]{36}\.(png|jpg|webp))$');
  end if;
end;
$$;

-- ─────────────────────────────────────────────
-- 2) 로고 파일 저장소
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-assets', 'site-assets', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "최상위 관리자 로고 업로드" on storage.objects;
create policy "최상위 관리자 로고 업로드" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'site-assets'
    and name ~ '^logos/[0-9a-f-]{36}\.(png|jpg|webp)$'
    and (select public.is_admin())
  );

drop policy if exists "최상위 관리자 로고 조회" on storage.objects;
create policy "최상위 관리자 로고 조회" on storage.objects
  for select to authenticated
  using (bucket_id = 'site-assets' and (select public.is_admin()));

drop policy if exists "최상위 관리자 로고 삭제" on storage.objects;
create policy "최상위 관리자 로고 삭제" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-assets' and (select public.is_admin()));

-- 홈페이지 배경음악: 최상위 관리자가 플레이리스트에 곡을 올리고 순서를 정함
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다. (0032 다음에 실행)
--
-- 1) site_music_tracks: 곡 목록 (곡명 · 파일 · 순서 · 사용 여부). 누구나 '사용' 곡만 읽고, 수정은 최상위 관리자만
-- 2) site_settings 'site_music': {"enabled":true|false,"volume":0~100} (누구나 읽음, 쓰기는 기존 정책대로 최상위 관리자만)
-- 3) 저장소 site-music (공개 읽기): mp3 · m4a · wav, 50MB 이하, 경로 tracks/<uuid>.<확장자>. 올리기·목록·삭제는 최상위 관리자만

-- ─────────────────────────────────────────────
-- 1) 곡 목록
-- ─────────────────────────────────────────────
create table if not exists public.site_music_tracks (
  id bigint generated always as identity primary key,
  title text not null check (char_length(title) between 1 and 100),
  file_path text not null unique check (file_path ~ '^tracks/[0-9a-f-]{36}\.(mp3|m4a|wav)$'),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists site_music_tracks_order on public.site_music_tracks (sort_order, id);
alter table public.site_music_tracks enable row level security;

-- 익명은 is_admin() 을 실행할 수 없으므로(0024) 익명·로그인 정책을 나눔
drop policy if exists "배경음악 공개 조회" on public.site_music_tracks;
create policy "배경음악 공개 조회" on public.site_music_tracks
  for select to anon
  using (is_active);

drop policy if exists "배경음악 회원 조회" on public.site_music_tracks;
create policy "배경음악 회원 조회" on public.site_music_tracks
  for select to authenticated
  using (is_active or (select public.is_admin()));

drop policy if exists "최상위 관리자 배경음악 관리" on public.site_music_tracks;
create policy "최상위 관리자 배경음악 관리" on public.site_music_tracks
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.site_music_tracks to anon, authenticated;
grant insert, update, delete on public.site_music_tracks to authenticated;

-- ─────────────────────────────────────────────
-- 2) 켜기/끄기 · 음량
-- ─────────────────────────────────────────────
drop policy if exists "공개 설정 조회" on public.site_settings;
create policy "공개 설정 조회" on public.site_settings
  for select to anon, authenticated
  using (key in ('org_chart_source', 'site_stats', 'site_logo', 'site_music'));

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'site_settings_site_music') then
    alter table public.site_settings add constraint site_settings_site_music
      check (key <> 'site_music' or value ~ '^\{"enabled":(true|false),"volume":[0-9]{1,3}\}$');
  end if;
end;
$$;

-- ─────────────────────────────────────────────
-- 3) 음원 파일 저장소
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-music', 'site-music', true, 52428800, array['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav', 'audio/wave'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "최상위 관리자 배경음악 업로드" on storage.objects;
create policy "최상위 관리자 배경음악 업로드" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'site-music'
    and name ~ '^tracks/[0-9a-f-]{36}\.(mp3|m4a|wav)$'
    and (select public.is_admin())
  );

drop policy if exists "최상위 관리자 배경음악 조회" on storage.objects;
create policy "최상위 관리자 배경음악 조회" on storage.objects
  for select to authenticated
  using (bucket_id = 'site-music' and (select public.is_admin()));

drop policy if exists "최상위 관리자 배경음악 삭제" on storage.objects;
create policy "최상위 관리자 배경음악 삭제" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-music' and (select public.is_admin()));

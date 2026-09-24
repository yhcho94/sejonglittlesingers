-- 입단 오디션 지정곡 (최대 5곡): 곡명 + 반주 링크 또는 반주 음원(mp3)
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다.
--
-- '입단 안내' 화면에 공개하므로 반주 음원 저장소(audition-songs)는 공개 버킷입니다.
-- 저작권 문제가 없는 반주만 올려 주세요.

create table if not exists public.audition_songs (
  slot smallint primary key check (slot between 1 and 5),
  title text not null check (char_length(title) between 1 and 100),
  accompaniment_url text check (char_length(accompaniment_url) <= 500 and accompaniment_url ~ '^https?://'),
  file_path text check (file_path ~ '^songs/[0-9a-f-]{36}\.(mp3|m4a)$'),
  note text check (char_length(note) <= 200),
  updated_at timestamptz not null default now()
);

create or replace trigger audition_songs_updated_at
  before update on public.audition_songs
  for each row execute function public.set_updated_at();

alter table public.audition_songs enable row level security;

drop policy if exists "지정곡 공개 조회" on public.audition_songs;
create policy "지정곡 공개 조회" on public.audition_songs
  for select to anon, authenticated
  using (true);

drop policy if exists "관리자 지정곡 관리" on public.audition_songs;
create policy "관리자 지정곡 관리" on public.audition_songs
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.audition_songs to anon, authenticated;
grant insert, update, delete on public.audition_songs to authenticated;

-- ─────────────────────────────────────────────
-- Storage: 반주 음원 (공개 읽기, 관리자만 올리기·지우기). 경로: songs/{파일명}.mp3|m4a, 30MB 이하
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('audition-songs', 'audition-songs', true, 31457280, array['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/aac'])
on conflict (id) do nothing;

drop policy if exists "관리자 반주 음원 업로드" on storage.objects;
create policy "관리자 반주 음원 업로드" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'audition-songs' and (select public.is_admin()));

drop policy if exists "관리자 반주 음원 삭제" on storage.objects;
create policy "관리자 반주 음원 삭제" on storage.objects
  for delete to authenticated
  using (bucket_id = 'audition-songs' and (select public.is_admin()));

drop policy if exists "관리자 반주 음원 조회" on storage.objects;
create policy "관리자 반주 음원 조회" on storage.objects
  for select to authenticated
  using (bucket_id = 'audition-songs' and (select public.is_admin()));

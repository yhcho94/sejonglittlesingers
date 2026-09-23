-- 사진 갤러리 (앨범 · 사진)
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다.
--
-- 공개 화면에 게시하는 사진이므로 저장소(gallery-photos)는 공개 버킷입니다.
-- 초상권 '① 공식 채널 게시'에 동의한 단원만 나온 사진을 올려야 합니다. (관리자 화면에 안내)

create table if not exists public.gallery_albums (
  id bigint generated always as identity primary key,
  title text not null check (char_length(title) between 1 and 200),
  taken_on date,
  description text check (char_length(description) <= 2000),
  is_published boolean not null default true,
  cover_photo_id bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_photos (
  id bigint generated always as identity primary key,
  album_id bigint not null references public.gallery_albums (id) on delete cascade,
  path text not null check (path ~ '^albums/[0-9]+/[0-9a-f-]{36}\.jpg$'),
  thumb_path text not null check (thumb_path ~ '^albums/[0-9]+/[0-9a-f-]{36}_t\.jpg$'),
  width integer not null check (width between 1 and 10000),
  height integer not null check (height between 1 and 10000),
  caption text check (char_length(caption) <= 300),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists gallery_photos_album_idx on public.gallery_photos (album_id, sort_order, id);
create index if not exists gallery_albums_taken_idx on public.gallery_albums (taken_on desc nulls last, id desc);

-- 대표 사진: 사진이 지워지면 비움 (같은 앨범의 사진인지는 관리자 화면에서만 지정하므로 따로 검사하지 않음)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'gallery_albums_cover_fk') then
    alter table public.gallery_albums
      add constraint gallery_albums_cover_fk foreign key (cover_photo_id)
      references public.gallery_photos (id) on delete set null;
  end if;
end;
$$;

create or replace trigger gallery_albums_updated_at
  before update on public.gallery_albums
  for each row execute function public.set_updated_at();

alter table public.gallery_albums enable row level security;
alter table public.gallery_photos enable row level security;

drop policy if exists "게시된 앨범 공개 조회" on public.gallery_albums;
create policy "게시된 앨범 공개 조회" on public.gallery_albums
  for select to anon, authenticated
  using (is_published);

drop policy if exists "관리자 앨범 관리" on public.gallery_albums;
create policy "관리자 앨범 관리" on public.gallery_albums
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "게시된 앨범 사진 공개 조회" on public.gallery_photos;
create policy "게시된 앨범 사진 공개 조회" on public.gallery_photos
  for select to anon, authenticated
  using (exists (select 1 from public.gallery_albums a where a.id = album_id and a.is_published));

drop policy if exists "관리자 사진 관리" on public.gallery_photos;
create policy "관리자 사진 관리" on public.gallery_photos
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.gallery_albums, public.gallery_photos to anon, authenticated;
grant insert, update, delete on public.gallery_albums, public.gallery_photos to authenticated;

-- ─────────────────────────────────────────────
-- Storage: 갤러리 사진 (공개 읽기, 관리자만 올리기·지우기)
-- 경로 규칙: albums/{앨범 id}/{파일명}.jpg (+ _t.jpg 미리보기)
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery-photos', 'gallery-photos', true, 10485760, array['image/jpeg'])
on conflict (id) do nothing;

drop policy if exists "관리자 갤러리 사진 업로드" on storage.objects;
create policy "관리자 갤러리 사진 업로드" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'gallery-photos' and (select public.is_admin()));

drop policy if exists "관리자 갤러리 사진 삭제" on storage.objects;
create policy "관리자 갤러리 사진 삭제" on storage.objects
  for delete to authenticated
  using (bucket_id = 'gallery-photos' and (select public.is_admin()));

-- 목록 조회(삭제 시 파일 찾기)는 관리자만
drop policy if exists "관리자 갤러리 사진 조회" on storage.objects;
create policy "관리자 갤러리 사진 조회" on storage.objects
  for select to authenticated
  using (bucket_id = 'gallery-photos' and (select public.is_admin()));

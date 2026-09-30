-- 강사진 소개 사진: 최상위 관리자(관리자 → 강사진 소개)와 선생님 본인(마이페이지 → 강사 프로필)이 올림
-- SQL Editor 에서 이 파일 전체를 실행합니다. 여러 번 실행해도 안전합니다. (0028 다음에 실행)
--
-- 1) faculty_bios.photo_path: 사진 파일 경로 (faculty/<강사 번호>/<uuid>.jpg 만)
-- 2) 저장소 faculty-photos (공개 읽기, JPG 5MB 이하): 올리기·목록·삭제는 최상위 관리자 또는
--    그 줄을 고칠 수 있는 선생님 본인(0028 is_own_faculty_name)만
--    사진은 브라우저에서 줄여 JPG 로 다시 저장하므로 위치정보 등 부가정보가 지워짐

alter table public.faculty_bios add column if not exists photo_path text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'faculty_bios_photo_path') then
    alter table public.faculty_bios add constraint faculty_bios_photo_path
      check (photo_path is null or photo_path ~ ('^faculty/' || id::text || '/[0-9a-f-]{36}\.jpg$'));
  end if;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('faculty-photos', 'faculty-photos', true, 5242880, array['image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 이 파일 경로의 강사 줄을 고칠 수 있는지 (최상위 관리자 또는 본인)
create or replace function public.can_edit_faculty_photo(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  bio_id bigint;
  bio_name text;
begin
  if object_name is null or object_name !~ '^faculty/[0-9]{1,18}/[0-9a-f-]{36}\.jpg$' then
    return false;
  end if;
  bio_id := split_part(object_name, '/', 2)::bigint;
  select name into bio_name from public.faculty_bios where id = bio_id;
  if bio_name is null then
    return false;
  end if;
  return public.is_admin() or public.is_own_faculty_name(bio_name);
end;
$$;
revoke execute on function public.can_edit_faculty_photo(text) from public, anon;
grant execute on function public.can_edit_faculty_photo(text) to authenticated;

drop policy if exists "강사 사진 올리기" on storage.objects;
create policy "강사 사진 올리기" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'faculty-photos' and public.can_edit_faculty_photo(name));

drop policy if exists "강사 사진 조회" on storage.objects;
create policy "강사 사진 조회" on storage.objects
  for select to authenticated
  using (bucket_id = 'faculty-photos' and public.can_edit_faculty_photo(name));

drop policy if exists "강사 사진 삭제" on storage.objects;
create policy "강사 사진 삭제" on storage.objects
  for delete to authenticated
  using (bucket_id = 'faculty-photos' and public.can_edit_faculty_photo(name));

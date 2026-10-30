// 사진 갤러리: 서버·브라우저 공통 (서버 전용 모듈을 가져오지 않음)
import { supabaseUrl } from "@/lib/supabase/env";

export const GALLERY_BUCKET = "gallery-photos";

export type GalleryAlbum = {
  id: number;
  title: string;
  taken_on: string | null;
  description: string | null;
  is_published: boolean;
  cover_photo_id: number | null;
  // 0031: 장소 · 블로그 글 주소 (없으면 null)
  venue?: string | null;
  post_url?: string | null;
  // 0032: 블로그 사진첩에서 옮겨 온 앨범 표시 (예: blog-224417208787)
  source_key?: string | null;
};

export type GalleryPhoto = {
  id: number;
  album_id: number;
  path: string;
  thumb_path: string;
  width: number;
  height: number;
  caption: string | null;
  sort_order: number;
  // 0032: 틀에 맞춰 잘릴 때의 초점 (CSS object-position)
  focus?: string;
};

export type AlbumSummary = GalleryAlbum & { count: number; cover: string | null };

// 사진 주소: 저장소에 올린 사진은 공개 버킷 주소, 블로그 사진첩에서 옮겨 온 사진(/images/events/…)은 사이트 안 주소 그대로
export function isSitePhoto(path: string) {
  return path.startsWith("/");
}

export function galleryUrl(path: string) {
  if (isSitePhoto(path)) return path;
  return `${supabaseUrl}/storage/v1/object/public/${GALLERY_BUCKET}/${path}`;
}

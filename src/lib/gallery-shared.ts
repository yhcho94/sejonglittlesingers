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
};

export type AlbumSummary = GalleryAlbum & { count: number; cover: string | null };

// 공개 버킷의 사진 주소
export function galleryUrl(path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${GALLERY_BUCKET}/${path}`;
}

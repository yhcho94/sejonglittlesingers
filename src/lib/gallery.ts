import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { EVENT_ALBUMS, type EventAlbum } from "@/lib/event-albums";
import { galleryUrl, type AlbumSummary, type GalleryAlbum, type GalleryPhoto } from "@/lib/gallery-shared";

export { galleryUrl, GALLERY_BUCKET } from "@/lib/gallery-shared";
export type { AlbumSummary, GalleryAlbum, GalleryPhoto } from "@/lib/gallery-shared";

// 사진 갤러리 (앨범 · 사진)

// 전체 칸: 장소·블로그 주소(0031)·초점(0032) 칸이 아직 없어도 읽히도록
const ALBUM_COLUMNS = "*";
const PHOTO_COLUMNS = "*";

// 앨범 목록 + 대표 사진(지정하지 않았으면 첫 사진) + 사진 수
// 로그인한 관리자에게는 RLS 가 비공개 앨범도 함께 돌려줍니다. (공개 화면에서는 is_published 로 한 번 더 거름)
export async function listAlbums(): Promise<AlbumSummary[]> {
  await connection();
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data: albums } = await supabase
    .from("gallery_albums")
    .select(ALBUM_COLUMNS)
    .order("taken_on", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .returns<GalleryAlbum[]>();
  if (!albums?.length) return [];
  const { data: photos } = await supabase
    .from("gallery_photos")
    .select("id, album_id, thumb_path")
    .in("album_id", albums.map((a) => a.id))
    .order("sort_order")
    .order("id")
    .returns<Pick<GalleryPhoto, "id" | "album_id" | "thumb_path">[]>();
  return albums.map((a) => {
    const mine = (photos ?? []).filter((p) => p.album_id === a.id);
    const cover = mine.find((p) => p.id === a.cover_photo_id) ?? mine[0];
    return { ...a, count: mine.length, cover: cover ? galleryUrl(cover.thumb_path) : null };
  });
}

export async function getAlbum(id: number) {
  await connection();
  if (!isSupabaseConfigured || !Number.isSafeInteger(id)) return null;
  const supabase = await createClient();
  const { data: album } = await supabase
    .from("gallery_albums")
    .select(ALBUM_COLUMNS)
    .eq("id", id)
    .maybeSingle<GalleryAlbum>();
  if (!album) return null;
  const { data: photos } = await supabase
    .from("gallery_photos")
    .select(PHOTO_COLUMNS)
    .eq("album_id", id)
    .order("sort_order")
    .order("id")
    .returns<GalleryPhoto[]>();
  return { album, photos: photos ?? [] };
}

// 공연·행사 사진첩 = 공개 앨범(블로그 사진첩에서 옮겨 온 것 포함), 날짜 최신순
// 앨범마다 대표 사진(지정 안 했으면 첫 사진) 포함 2장만 미리 보여 주고, 더 있으면 '모두 보기'로 앨범 화면 연결
// 0032 SQL 실행 전(또는 DB를 읽지 못할 때)에는 코드에 있는 블로그 사진첩(EVENT_ALBUMS)을 함께 보여 줍니다.
export async function listEventAlbums(): Promise<EventAlbum[]> {
  await connection();
  if (!isSupabaseConfigured) return EVENT_ALBUMS;
  const supabase = await createClient();
  // source_key 칸이 있으면 0032 실행 완료 = 블로그 사진첩이 DB로 옮겨짐
  const { error: notMoved } = await supabase.from("gallery_albums").select("source_key").limit(1);
  const { data: albums, error } = await supabase
    .from("gallery_albums")
    .select(ALBUM_COLUMNS)
    .eq("is_published", true)
    .order("taken_on", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .returns<GalleryAlbum[]>();
  let fromDb: EventAlbum[] = [];
  if (albums?.length) {
    const { data: photos } = await supabase
      .from("gallery_photos")
      .select(PHOTO_COLUMNS)
      .in("album_id", albums.map((a) => a.id))
      .order("sort_order")
      .order("id")
      .returns<GalleryPhoto[]>();
    fromDb = albums.flatMap((a) => {
      const mine = (photos ?? []).filter((p) => p.album_id === a.id);
      if (!mine.length) return [];
      const cover = mine.find((p) => p.id === a.cover_photo_id) ?? mine[0];
      const preview = [cover, ...mine.filter((p) => p.id !== cover.id)].slice(0, 2);
      return [
        {
          id: `album-${a.id}`,
          title: a.title,
          date: a.taken_on ?? "",
          venue: a.venue ?? null,
          post: a.post_url ?? null,
          href: mine.length > preview.length ? `/gallery/${a.id}` : undefined,
          total: mine.length,
          photos: preview.map((p) => ({
            src: galleryUrl(p.thumb_path),
            full: galleryUrl(p.path),
            width: p.width,
            height: p.height,
            focus: p.focus ?? "50% 50%",
            alt: p.caption || `${a.title} 사진`,
          })),
        },
      ];
    });
  }
  const all = notMoved || error ? [...fromDb, ...EVENT_ALBUMS] : fromDb;
  return all.sort((x, y) => (y.date || "0").localeCompare(x.date || "0"));
}

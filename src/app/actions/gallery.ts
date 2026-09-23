"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { GALLERY_BUCKET } from "@/lib/gallery";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";

async function adminClient() {
  const current = await getCurrentUser();
  if (current?.profile?.role !== "admin") return null;
  return await createClient();
}

function refresh(albumId?: number) {
  revalidatePath("/gallery", "layout");
  revalidatePath("/admin/gallery", "layout");
  if (albumId) revalidatePath(`/admin/gallery/${albumId}`);
}

export async function saveAlbum(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await adminClient();
  if (!supabase) return { error: "관리자 권한이 필요합니다." };
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const title = String(formData.get("title") ?? "").trim();
  const takenOn = String(formData.get("taken_on") ?? "").trim();
  if (!title || title.length > 200) return { error: "앨범 제목을 200자 이내로 입력해 주세요." };
  if (takenOn && !/^\d{4}-\d{2}-\d{2}$/.test(takenOn)) return { error: "날짜를 확인해 주세요." };

  const values = {
    title,
    taken_on: takenOn || null,
    description: String(formData.get("description") ?? "").trim().slice(0, 2000) || null,
    is_published: formData.get("is_published") === "on",
  };
  if (id && Number.isSafeInteger(id)) {
    const { error } = await supabase.from("gallery_albums").update(values).eq("id", id);
    if (error) return { error: "저장하지 못했습니다." };
    refresh(id);
    return { success: "저장했습니다." };
  }
  const { data, error } = await supabase.from("gallery_albums").insert(values).select("id").single();
  if (error) return { error: "저장하지 못했습니다. 0010_gallery.sql 실행 여부를 확인해 주세요." };
  refresh();
  redirect(`/admin/gallery/${data.id}`);
}

export async function deleteAlbum(formData: FormData) {
  const supabase = await adminClient();
  if (!supabase) return;
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id)) return;
  const { data: photos } = await supabase.from("gallery_photos").select("path, thumb_path").eq("album_id", id);
  const files = (photos ?? []).flatMap((p) => [p.path, p.thumb_path]);
  if (files.length) await supabase.storage.from(GALLERY_BUCKET).remove(files);
  await supabase.from("gallery_albums").delete().eq("id", id);
  refresh();
  redirect("/admin/gallery");
}

type NewPhoto = { path: string; thumb_path: string; width: number; height: number };

// 브라우저에서 저장소에 올린 뒤 호출. 경로가 이 앨범 규칙에 맞는지 다시 확인합니다.
export async function addGalleryPhotos(albumId: number, items: NewPhoto[]): Promise<FormState> {
  const supabase = await adminClient();
  if (!supabase) return { error: "관리자 권한이 필요합니다." };
  if (!Number.isSafeInteger(albumId) || !Array.isArray(items) || !items.length || items.length > 200) {
    return { error: "잘못된 요청입니다." };
  }
  const re = new RegExp(`^albums/${albumId}/([0-9a-f-]{36})\\.jpg$`);
  for (const it of items) {
    const m = re.exec(it.path);
    if (!m || it.thumb_path !== `albums/${albumId}/${m[1]}_t.jpg`) return { error: "사진 경로가 올바르지 않습니다." };
    if (![it.width, it.height].every((n) => Number.isInteger(n) && n > 0 && n <= 10000)) {
      return { error: "사진 크기 정보가 올바르지 않습니다." };
    }
  }
  const { data: last } = await supabase
    .from("gallery_photos")
    .select("sort_order")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const start = (last?.sort_order ?? 0) + 1;
  const { error } = await supabase.from("gallery_photos").insert(
    items.map((it, i) => ({
      album_id: albumId,
      path: it.path,
      thumb_path: it.thumb_path,
      width: it.width,
      height: it.height,
      sort_order: start + i,
    })),
  );
  if (error) {
    await supabase.storage.from(GALLERY_BUCKET).remove(items.flatMap((it) => [it.path, it.thumb_path]));
    return { error: "사진 정보를 저장하지 못했습니다." };
  }
  refresh(albumId);
  return { success: `${items.length}장을 올렸습니다.` };
}

export async function deleteGalleryPhoto(formData: FormData) {
  const supabase = await adminClient();
  if (!supabase) return;
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id)) return;
  const { data } = await supabase
    .from("gallery_photos")
    .delete()
    .eq("id", id)
    .select("album_id, path, thumb_path")
    .maybeSingle();
  if (data) {
    await supabase.storage.from(GALLERY_BUCKET).remove([data.path, data.thumb_path]);
    refresh(data.album_id);
  }
}

export async function setAlbumCover(formData: FormData) {
  const supabase = await adminClient();
  if (!supabase) return;
  const albumId = Number(formData.get("album_id"));
  const photoId = Number(formData.get("photo_id"));
  if (!Number.isSafeInteger(albumId) || !Number.isSafeInteger(photoId)) return;
  await supabase.from("gallery_albums").update({ cover_photo_id: photoId }).eq("id", albumId);
  refresh(albumId);
}

export async function updatePhotoCaption(formData: FormData) {
  const supabase = await adminClient();
  if (!supabase) return;
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id)) return;
  const caption = String(formData.get("caption") ?? "").trim().slice(0, 300) || null;
  const { data } = await supabase.from("gallery_photos").update({ caption }).eq("id", id).select("album_id").maybeSingle();
  if (data) refresh(data.album_id);
}

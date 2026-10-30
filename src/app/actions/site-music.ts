"use server";

import { revalidatePath } from "next/cache";
import { adminFor } from "@/lib/auth";
import { MUSIC_BUCKET, MUSIC_FILE_RE, musicSettingsValue } from "@/lib/site-music";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";

// 배경음악은 최상위 관리자만 (DB 규칙·저장소 규칙에서도 한 번 더 막힘, 0033)
async function superAdminClient() {
  if (!(await adminFor("members"))) return null;
  return await createClient();
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function saveMusicSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await superAdminClient();
  if (!supabase) return { error: "최상위 관리자만 바꿀 수 있습니다." };
  const volume = Math.round(Number(formData.get("volume")));
  if (!Number.isInteger(volume) || volume < 0 || volume > 100) return { error: "음량을 확인해 주세요." };
  const value = musicSettingsValue({ enabled: formData.get("enabled") === "on", volume });
  const { error } = await supabase.from("site_settings").upsert({ key: "site_music", value, updated_at: new Date().toISOString() });
  if (error) return { error: "저장하지 못했습니다. (0033 SQL 실행 여부를 확인해 주세요)" };
  refresh();
  return { success: "저장했습니다." };
}

// 브라우저에서 저장소에 올린 뒤 호출: 플레이리스트 맨 뒤에 추가
export async function addMusicTrack(path: string, title: string): Promise<FormState> {
  const supabase = await superAdminClient();
  if (!supabase) return { error: "최상위 관리자만 올릴 수 있습니다." };
  const name = String(title ?? "").trim().slice(0, 100) || "제목 없음";
  if (!MUSIC_FILE_RE.test(String(path))) return { error: "파일 정보가 올바르지 않습니다. 다시 올려 주세요." };
  const { data: last } = await supabase
    .from("site_music_tracks")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle<{ sort_order: number }>();
  const { error } = await supabase
    .from("site_music_tracks")
    .insert({ title: name, file_path: path, sort_order: (last?.sort_order ?? 0) + 1 });
  if (error) {
    await supabase.storage.from(MUSIC_BUCKET).remove([path]);
    return { error: "곡을 저장하지 못했습니다. (0033 SQL 실행 여부를 확인해 주세요)" };
  }
  refresh();
  return { success: `'${name}'을(를) 플레이리스트에 추가했습니다.` };
}

export async function updateMusicTrack(formData: FormData) {
  const supabase = await superAdminClient();
  const id = Number(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim().slice(0, 100);
  if (!supabase || !Number.isSafeInteger(id) || !title) return;
  await supabase
    .from("site_music_tracks")
    .update({ title, is_active: formData.get("is_active") === "on" })
    .eq("id", id);
  refresh();
}

// 위·아래로 한 칸 옮기기: 전체 순서를 1부터 다시 매김
export async function moveMusicTrack(formData: FormData) {
  const supabase = await superAdminClient();
  const id = Number(formData.get("id"));
  const dir = formData.get("dir") === "up" ? -1 : 1;
  if (!supabase || !Number.isSafeInteger(id)) return;
  const { data } = await supabase.from("site_music_tracks").select("id").order("sort_order").order("id");
  const ids = (data ?? []).map((r) => r.id as number);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await Promise.all(ids.map((tid, k) => supabase.from("site_music_tracks").update({ sort_order: k + 1 }).eq("id", tid)));
  refresh();
}

export async function deleteMusicTrack(formData: FormData) {
  const supabase = await superAdminClient();
  const id = Number(formData.get("id"));
  if (!supabase || !Number.isSafeInteger(id)) return;
  const { data } = await supabase.from("site_music_tracks").delete().eq("id", id).select("file_path").maybeSingle<{ file_path: string }>();
  if (data && MUSIC_FILE_RE.test(data.file_path)) await supabase.storage.from(MUSIC_BUCKET).remove([data.file_path]);
  refresh();
}

"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { AUDITION_FILE_RE, AUDITION_SONG_BUCKET, AUDITION_SONG_SLOTS } from "@/lib/audition-songs";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";

async function adminClient() {
  const current = await getCurrentUser();
  if (current?.profile?.role !== "admin") return null;
  return await createClient();
}

function field(formData: FormData, key: string, max: number) {
  const value = String(formData.get(key) ?? "").trim();
  return value ? value.slice(0, max) : null;
}

// 지정곡 5칸을 한 번에 저장. 곡명을 비우면 그 칸을 지우고, 바뀌거나 지운 반주 음원 파일은 저장소에서도 삭제합니다.
export async function saveAuditionSongs(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await adminClient();
  if (!supabase) return { error: "관리자 권한이 필요합니다." };

  const { data: before, error: readError } = await supabase.from("audition_songs").select("slot, file_path");
  if (readError) return { error: "지정곡 표를 읽지 못했습니다. (0018 SQL 실행 필요)" };
  const oldFiles = new Map((before ?? []).map((r) => [r.slot as number, r.file_path as string | null]));

  const upserts = [];
  const emptySlots: number[] = [];
  for (const slot of AUDITION_SONG_SLOTS) {
    const title = field(formData, `title_${slot}`, 100);
    const url = field(formData, `url_${slot}`, 500);
    const file = field(formData, `file_${slot}`, 200);
    if (url && !/^https?:\/\//i.test(url)) return { error: `${slot}번 곡의 반주 링크는 http:// 또는 https:// 로 시작해야 합니다.` };
    if (file && !AUDITION_FILE_RE.test(file)) return { error: `${slot}번 곡의 반주 음원 정보가 올바르지 않습니다. 다시 올려 주세요.` };
    if (!title) {
      if (url || file) return { error: `${slot}번 곡의 곡명을 입력해 주세요.` };
      emptySlots.push(slot);
      continue;
    }
    upserts.push({ slot, title, accompaniment_url: url, file_path: file, note: field(formData, `note_${slot}`, 200) });
  }

  if (upserts.length) {
    const { error } = await supabase.from("audition_songs").upsert(upserts, { onConflict: "slot" });
    if (error) return { error: "저장하지 못했습니다." };
  }
  if (emptySlots.length) {
    const { error } = await supabase.from("audition_songs").delete().in("slot", emptySlots);
    if (error) return { error: "저장하지 못했습니다." };
  }

  // 더 이상 쓰지 않는 음원 파일 정리
  const kept = new Set(upserts.map((u) => u.file_path).filter(Boolean));
  const stale = [...oldFiles.values()].filter((p): p is string => Boolean(p) && !kept.has(p));
  if (stale.length) await supabase.storage.from(AUDITION_SONG_BUCKET).remove(stale);

  revalidatePath("/join");
  revalidatePath("/admin/recruitment");
  return { success: `지정곡 ${upserts.length}곡을 저장했습니다.` };
}

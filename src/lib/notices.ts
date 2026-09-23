import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Notice } from "@/lib/types";

const COLUMNS = "id, title, body, is_pinned, is_published, created_at, updated_at";

// 게시된 공지 목록 (RLS 가 비공개 글을 걸러주지만, 관리자도 공개 화면에서는 게시글만 보도록 필터)
export async function listPublishedNotices(limit?: number): Promise<Notice[]> {
  await connection();
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  let query = supabase
    .from("notices")
    .select(COLUMNS)
    .eq("is_published", true)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) {
    console.error("공지 목록 조회 실패", error.message);
    return [];
  }
  return data;
}

export async function getPublishedNotice(id: number): Promise<Notice | null> {
  await connection();
  if (!isSupabaseConfigured || !Number.isSafeInteger(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("notices")
    .select(COLUMNS)
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle<Notice>();
  return data;
}

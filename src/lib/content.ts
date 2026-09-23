import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Concert, Faq, Press, Recruitment } from "@/lib/types";

// 공개 화면용 조회. DB 가 아직 준비되지 않았으면 빈 값으로 표시합니다.

export async function getRecruitment(): Promise<Recruitment | null> {
  await connection();
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("recruitment")
    .select("is_open, period, target, schedule, place, fee, audition, classes, notes, updated_at")
    .eq("id", 1)
    .maybeSingle<Recruitment>();
  return data;
}

export async function listPublishedFaqs(): Promise<Faq[]> {
  await connection();
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select("id, question, answer, sort_order, is_published")
    .eq("is_published", true)
    .order("sort_order")
    .order("id")
    .returns<Faq[]>();
  return data ?? [];
}

const CONCERT_COLUMNS = "id, title, starts_at, venue, description, ticket_url, video_url, is_published";

export async function listConcerts(when: "upcoming" | "past", limit?: number): Promise<Concert[]> {
  await connection();
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  // 공연 당일에는 '다가오는 공연'에 계속 보이도록 12시간 여유를 둡니다.
  const pivot = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
  let query = supabase.from("concerts").select(CONCERT_COLUMNS).eq("is_published", true);
  query =
    when === "upcoming"
      ? query.gte("starts_at", pivot).order("starts_at", { ascending: true })
      : query.lt("starts_at", pivot).order("starts_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data } = await query.returns<Concert[]>();
  return data ?? [];
}

export async function getPublishedConcert(id: number): Promise<Concert | null> {
  await connection();
  if (!isSupabaseConfigured || !Number.isSafeInteger(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("concerts")
    .select(CONCERT_COLUMNS)
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle<Concert>();
  return data;
}

const PRESS_COLUMNS = "id, title, media, url, published_on, is_published";

export async function listPublishedPress(): Promise<Press[]> {
  await connection();
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("press")
    .select(PRESS_COLUMNS)
    .eq("is_published", true)
    .order("published_on", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .returns<Press[]>();
  return data ?? [];
}

// 언론사명이 없으면 기사 주소의 도메인을 표시합니다.
export function pressSource(item: Pick<Press, "media" | "url">) {
  if (item.media) return item.media;
  try {
    return new URL(item.url).hostname.replace(/^(www|m)\./, "");
  } catch {
    return "";
  }
}

// 공개 '단원 소개': 이름 없는 인원 통계 + 이름 공개에 동의한 단원 (DB 함수가 필요한 값만 돌려줌)
export async function getPublicSingers() {
  await connection();
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const [stats, names] = await Promise.all([
    supabase.rpc("singer_public_stats"),
    supabase.rpc("singer_public_names"),
  ]);
  if (stats.error || names.error) return null;
  return {
    stats: (stats.data ?? []) as { class_name: string | null; birth_year: number; grade_override: number | null }[],
    names: (names.data ?? []) as { name: string; class_name: string | null }[],
  };
}

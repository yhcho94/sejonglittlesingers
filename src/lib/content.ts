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

// 공개 정보만 있는 표라 전체 칸을 읽습니다. (time_tbd 칸이 아직 없어도 오류가 나지 않도록)
const CONCERT_COLUMNS = "*";

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

// 현재 활동 단원 수 (DB 에서 집계). 읽지 못하면 null
export async function getActiveSingerCount() {
  await connection();
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("singer_public_counts");
  if (error || !data) return null;
  const total = (data as { singers: number }[]).reduce((sum, c) => sum + c.singers, 0);
  return total > 0 ? total : null;
}

// 공개 '단원 소개': 반별 인원 수 + 활동 단원 이름·반 (게시 중단 요청 단원 제외, DB 함수가 필요한 값만 돌려줌)
// 학년·출생연도는 공개하지 않습니다 (관리자 통계 화면에서만).
export async function getPublicSingers() {
  await connection();
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const [counts, names] = await Promise.all([
    supabase.rpc("singer_public_counts"),
    supabase.rpc("singer_public_names"),
  ]);
  if (names.error) return null;
  return {
    // 0014 적용 전에는 인원 수를 표시하지 않음
    counts: counts.error ? [] : ((counts.data ?? []) as { class_name: string | null; singers: number }[]),
    names: (names.data ?? []) as { name: string; class_name: string | null }[],
  };
}

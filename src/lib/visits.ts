// 방문자 수 (브라우저 전용): 같은 브라우저는 하루(한국 시간)에 한 번만 기록하고, 오늘·전체 방문 수를 돌려줍니다.
// 브라우저에는 마지막으로 기록한 날짜만 저장합니다.
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type VisitStats = { today: number; total: number };

const KEY = "sls-visit-day";
let pending: Promise<VisitStats | null> | null = null;

function todayKst() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

async function load(): Promise<VisitStats | null> {
  if (!isSupabaseConfigured) return null;
  const today = todayKst();
  let seen = false;
  try {
    seen = localStorage.getItem(KEY) === today;
  } catch {
    // 저장소를 쓸 수 없는 환경(일부 인앱·비공개 창)은 조회만 합니다.
    seen = true;
  }
  const { data, error } = await createClient().rpc(seen ? "visit_stats" : "record_visit");
  if (error || !data?.[0]) return null;
  if (!seen) {
    try {
      localStorage.setItem(KEY, today);
    } catch {}
  }
  return { today: Number(data[0].today), total: Number(data[0].total) };
}

// 한 페이지에서 여러 번 불러도 한 번만 요청
export function ensureVisitRecorded() {
  pending ??= load().catch(() => null);
  return pending;
}

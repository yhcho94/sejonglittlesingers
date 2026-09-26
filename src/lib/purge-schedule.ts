import type { SupabaseClient } from "@supabase/supabase-js";

// 한 달 안에 자동 삭제될 입단 신청 (0024 application_purge_schedule, 입단 신청 권한 관리자만)
// 삭제는 기한이 지난 뒤 첫 새벽 예약 작업(한국 시간 03:20 무렵)에서 이루어집니다.
export type PurgeReason = "pending" | "unregistered";
export type PurgeInfo = { reason: PurgeReason; deleteOn: Date; daysLeft: number };

export const PURGE_REASON_TEXT: Record<PurgeReason, string> = {
  pending: "신청일부터 6개월 동안 심사하지 않음",
  unregistered: "승인 후 3개월 동안 단원 명부에 등록하지 않음",
};

const DAY = 24 * 60 * 60 * 1000;
const KST = 9 * 60 * 60 * 1000;
const kstDay = (d: Date) => Math.floor((d.getTime() + KST) / DAY);

// 기한 이후 첫 예약 작업 시각 (매일 UTC 18:20 = 한국 03:20)
function firstRunAfter(deadline: Date) {
  const run = new Date(Date.UTC(deadline.getUTCFullYear(), deadline.getUTCMonth(), deadline.getUTCDate(), 18, 20));
  if (run < deadline) run.setUTCDate(run.getUTCDate() + 1);
  return run;
}

export async function loadPurgeSchedule(supabase: SupabaseClient, now = new Date()) {
  const map = new Map<number, PurgeInfo>();
  const { data, error } = await supabase.rpc("application_purge_schedule");
  if (error || !Array.isArray(data)) return map; // 0024 실행 전이거나 권한 없음
  for (const row of data as { id: number; reason: PurgeReason; purge_after: string }[]) {
    const deleteOn = firstRunAfter(new Date(row.purge_after));
    map.set(Number(row.id), { reason: row.reason, deleteOn, daysLeft: Math.max(0, kstDay(deleteOn) - kstDay(now)) });
  }
  return map;
}

// 예: "10월 28일 새벽 삭제 예정 (D-3)", 오늘 밤이면 "오늘 밤(새벽) 삭제 예정"
export function purgeLabel(info: PurgeInfo) {
  const kst = new Date(info.deleteOn.getTime() + KST);
  const date = `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일`;
  if (info.daysLeft <= 1) return `${date} 새벽 삭제 예정 (곧 삭제)`;
  return `${date} 새벽 삭제 예정 (D-${info.daysLeft})`;
}

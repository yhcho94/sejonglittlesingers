import type { SupabaseClient } from "@supabase/supabase-js";

// 사진 삭제 대기열(storage_cleanup)의 파일을 Storage API 로 실제 삭제합니다.
// 관리자 권한 또는 비밀 키 클라이언트로 호출합니다. 삭제에 성공한 항목만 대기열에서 뺍니다.
export async function processStorageCleanup(supabase: SupabaseClient, limit = 500) {
  const { data: queue, error } = await supabase
    .from("storage_cleanup")
    .select("id, bucket_id, path")
    .order("id")
    .limit(limit)
    .returns<{ id: number; bucket_id: string; path: string }[]>();
  if (error || !queue?.length) return { removed: 0, failed: 0 };

  const done: number[] = [];
  let failed = 0;
  for (const bucket of new Set(queue.map((q) => q.bucket_id))) {
    const items = queue.filter((q) => q.bucket_id === bucket);
    // 이미 지워진 파일은 오류 없이 넘어갑니다.
    const { error: removeError } = await supabase.storage.from(bucket).remove(items.map((i) => i.path));
    if (removeError) failed += items.length;
    else done.push(...items.map((i) => i.id));
  }
  if (done.length) await supabase.from("storage_cleanup").delete().in("id", done);
  return { removed: done.length, failed };
}

// 기한이 지난 정보 파기 + 사진 파일 정리를 한 번에 실행
export async function runRetention(supabase: SupabaseClient) {
  // 권한이 없는 관리자·0024 실행 전이면 해당 항목은 오류로 건너뜀 (예약 작업이 처리)
  const [rejected, left, stale] = await Promise.all([
    supabase.rpc("purge_rejected_applications"),
    supabase.rpc("purge_left_singers"),
    supabase.rpc("purge_stale_applications"),
  ]);
  const files = await processStorageCleanup(supabase);
  return {
    rejectedApplications: rejected.error ? null : (rejected.data as number),
    leftSingers: left.error ? null : (left.data as number),
    staleApplications: stale.error ? null : (stale.data as number),
    ...files,
  };
}

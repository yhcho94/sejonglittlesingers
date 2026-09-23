import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabase/env";

/**
 * 예약 작업(파일 삭제·기한 경과 정보 파기) 전용 서버 클라이언트.
 * SUPABASE_SECRET_KEY 는 RLS 를 거치지 않는 비밀 키이므로
 * - NEXT_PUBLIC_ 을 붙이지 않고 (브라우저로 절대 보내지 않음)
 * - 예약 작업 경로(/api/cron/cleanup)와 탈퇴 직후 정리에서만 사용합니다.
 * 설정하지 않으면 null 을 돌려주고, 관리자 화면 접속 시 관리자 권한으로 대신 정리합니다.
 */
export function createSecretClient() {
  const key = (process.env.SUPABASE_SECRET_KEY ?? "").trim();
  if (!supabaseUrl || !key) return null;
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

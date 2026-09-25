import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { canAccess, type AdminGate } from "@/lib/admin-perms";
import type { Profile } from "@/lib/types";

// 현재 로그인한 사용자와 프로필. 로그인하지 않았으면 null.
// getUser() 는 Supabase Auth 서버에 토큰을 확인하므로 권한 판단에 사용해도 안전합니다.
export async function getCurrentUser() {
  // 로그인 상태는 요청마다 달라지므로 빌드 시 정적 생성하지 않습니다. (환경변수 설정 전 빌드되더라도)
  await connection();
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const base = "id, guardian_name, phone, email, role, created_at";
  const first = await supabase
    .from("profiles")
    .select(`${base}, is_super, admin_perms, admin_requested_at, admin_request_note`)
    .eq("id", user.id)
    .single<Profile>();
  let profile = first.data;
  if (first.error && !profile) {
    // 0020 실행 전: 관리자 칸이 없으면 예전처럼 관리자 = 모든 권한
    const { data } = await supabase.from("profiles").select(base).eq("id", user.id).single<Profile>();
    profile = data ? { ...data, is_super: data.role === "admin", admin_perms: [] } : null;
  }

  return { user, profile };
}

export async function requireUser(next: string) {
  const current = await getCurrentUser();
  if (!current) redirect(`/login?next=${encodeURIComponent(next)}`);
  return current;
}

// 관리자 화면 입구. gate 를 주면 그 메뉴 권한(또는 최상위 관리자)이 있어야 합니다.
export async function requireAdmin(gate?: AdminGate) {
  const current = await requireUser("/admin");
  if (current.profile?.role !== "admin") redirect("/");
  if (!canAccess(current.profile, gate)) redirect("/admin?denied=1");
  return current;
}

// 서버 액션용: 권한이 있으면 사용자 정보, 없으면 null
export async function adminFor(gate?: AdminGate) {
  const current = await getCurrentUser();
  if (!current || !canAccess(current.profile, gate)) return null;
  return current;
}

// 로그인 후 이동할 경로: 사이트 내부 경로만 허용 (외부 URL 로의 리다이렉트 방지)
export function safeNext(next: unknown, fallback = "/") {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

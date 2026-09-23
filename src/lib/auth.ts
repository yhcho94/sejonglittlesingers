import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, guardian_name, phone, email, role, created_at")
    .eq("id", user.id)
    .single<Profile>();

  return { user, profile };
}

export async function requireUser(next: string) {
  const current = await getCurrentUser();
  if (!current) redirect(`/login?next=${encodeURIComponent(next)}`);
  return current;
}

export async function requireAdmin() {
  const current = await requireUser("/admin");
  if (current.profile?.role !== "admin") redirect("/");
  return current;
}

// 로그인 후 이동할 경로: 사이트 내부 경로만 허용 (외부 URL 로의 리다이렉트 방지)
export function safeNext(next: unknown, fallback = "/") {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

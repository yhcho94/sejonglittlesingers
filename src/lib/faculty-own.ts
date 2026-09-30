// 선생님 본인의 강사진 소개 수정 (서버에서만 사용)
import { isFacultyRole } from "./staff-bio";
import type { createClient } from "./supabase/server";
import type { Profile } from "./types";

// 선생님 본인: 강사 역할의 운영진 회원 + 조직도 게시 승인 (DB 규칙 0028 에서도 한 번 더 막힘)
export function canEditOwnFaculty(p: Profile | null | undefined): boolean {
  return !!p && (p.member_type === "teacher" || p.member_type === "staff") && isFacultyRole(p.staff_role) && !!p.org_visible;
}

// 강사진 소개에서 본인 줄 찾기: 이름이 같고 역할이 맞는 줄 (단장은 '단장 · 상임지휘자' 등도 인정)
export async function findOwnFacultyRow(supabase: Awaited<ReturnType<typeof createClient>>, p: Profile) {
  const { data } = await supabase
    .from("faculty_bios")
    .select("*")
    .eq("name", p.guardian_name);
  const rows = data ?? [];
  return rows.find((r) => r.role === p.staff_role || (p.staff_role === "단장" && r.role.startsWith("단장"))) ?? rows[0] ?? null;
}

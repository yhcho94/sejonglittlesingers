"use server";

import { revalidatePath } from "next/cache";
import { ADMIN_AREAS } from "@/lib/admin-perms";
import { CLASS_OPTIONS } from "@/lib/application-fields";
import { staffClassFromForm, staffRoleFromForm } from "@/lib/member-types";
import { adminFor, getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const AREA_KEYS = new Set<string>(ADMIN_AREAS.map((a) => a.key));

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/mypage");
  revalidatePath("/about");
}

// ── 회원: 관리자 권한 신청 · 취소 ─────────────────
export async function requestAdmin(_prev: FormState, formData: FormData): Promise<FormState> {
  const current = await getCurrentUser();
  if (!current) return { error: "로그인이 필요합니다." };
  if (current.profile?.role === "admin") return { error: "이미 관리자입니다." };
  const note = String(formData.get("note") ?? "").trim().slice(0, 300);
  const supabase = await createClient();
  const { error } = await supabase.rpc("request_admin", { note });
  if (error) return { error: "신청하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  refresh();
  return { success: "관리자 권한을 신청했습니다. 최상위 관리자가 승인하면 관리자 메뉴가 열립니다." };
}

export async function cancelAdminRequest() {
  if (!(await getCurrentUser())) return;
  const supabase = await createClient();
  await supabase.rpc("cancel_admin_request");
  refresh();
}

// ── 최상위 관리자: 승인 · 권한 변경 · 해제 · 거절 ────
// DB 함수도 최상위 관리자인지, 본인이 아닌지 다시 확인합니다.
export async function setAdminAccess(formData: FormData) {
  const current = await adminFor("members");
  const targetId = String(formData.get("id") ?? "");
  if (!current || !UUID_RE.test(targetId) || targetId === current.user.id) return;
  const perms = formData.getAll("perm").map(String).filter((p) => AREA_KEYS.has(p));
  const supabase = await createClient();
  await supabase.rpc("set_admin_access", {
    target_id: targetId,
    perms,
    make_super: formData.get("super") === "on",
  });
  refresh();
}

export async function revokeAdmin(formData: FormData) {
  const current = await adminFor("members");
  const targetId = String(formData.get("id") ?? "");
  if (!current || !UUID_RE.test(targetId) || targetId === current.user.id) return;
  const supabase = await createClient();
  await supabase.rpc("revoke_admin", { target_id: targetId });
  refresh();
}

export async function rejectAdminRequest(formData: FormData) {
  const current = await adminFor("members");
  const targetId = String(formData.get("id") ?? "");
  if (!current || !UUID_RE.test(targetId)) return;
  const supabase = await createClient();
  await supabase.rpc("reject_admin_request", { target_id: targetId });
  refresh();
}

// 학부모 대표 지정: 값 "반|대표" 또는 "반|부대표", 빈 값이면 해제. 최상위 관리자만, 보호자 회원만
export async function setParentRep(formData: FormData) {
  const current = await adminFor("members");
  const targetId = String(formData.get("id") ?? "");
  const [className = "", title = "대표"] = String(formData.get("rep") ?? "").split("|");
  if (!current || !UUID_RE.test(targetId)) return;
  if (className && !CLASS_OPTIONS.some((c) => c.name === className)) return;
  if (title !== "대표" && title !== "부대표") return;
  const supabase = await createClient();
  await supabase.rpc("set_parent_rep", { target_id: targetId, class_name: className || null, title });
  refresh();
}

// 최상위 관리자: 운영진 정보 수정 (역할 · 담당 반 · 세부 담당 · 조직도 게시)
export async function adminUpdateStaff(_prev: FormState, formData: FormData): Promise<FormState> {
  const current = await adminFor("members");
  const targetId = String(formData.get("id") ?? "");
  if (!current || !UUID_RE.test(targetId)) return { error: "권한이 없습니다." };
  const role = staffRoleFromForm(String(formData.get("staff_role") ?? ""), String(formData.get("staff_role_custom") ?? ""));
  if (!role) return { error: "운영진 역할을 골라 주세요. (기타는 30자 이내로 입력)" };
  const staffClass = staffClassFromForm(role, String(formData.get("staff_class") ?? ""), CLASS_OPTIONS.map((c) => c.name));
  if (!staffClass.ok) return { error: "담당 반을 골라 주세요." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_staff", {
    target_id: targetId,
    role_name: role,
    class_name: staffClass.value,
    new_affiliation: String(formData.get("affiliation") ?? "").trim().slice(0, 100),
    visible: formData.get("org_visible") === "on",
  });
  if (error) return { error: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  refresh();
  return { success: "저장했습니다." };
}

// 회원 구분 변경 (보호자 ↔ 운영진). 최상위 관리자 본인 것도 바꿀 수 있음
export async function setMemberType(formData: FormData) {
  const current = await adminFor("members");
  const targetId = String(formData.get("id") ?? "");
  const type = String(formData.get("type") ?? "");
  if (!current || !UUID_RE.test(targetId) || (type !== "parent" && type !== "staff")) return;
  const supabase = await createClient();
  await supabase.rpc("set_member_type", { target_id: targetId, new_type: type });
  refresh();
}

// 합창단 소개 조직도 표시 방식: auto(회원 정보로 자동) · legacy(예전 고정 조직도)
export async function setOrgChartSource(formData: FormData) {
  const current = await adminFor("members");
  const value = String(formData.get("source") ?? "");
  if (!current || (value !== "auto" && value !== "legacy")) return;
  const supabase = await createClient();
  await supabase
    .from("site_settings")
    .upsert({ key: "org_chart_source", value, updated_at: new Date().toISOString() });
  refresh();
}

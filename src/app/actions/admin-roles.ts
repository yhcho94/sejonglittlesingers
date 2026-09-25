"use server";

import { revalidatePath } from "next/cache";
import { ADMIN_AREAS } from "@/lib/admin-perms";
import { CLASS_OPTIONS } from "@/lib/application-fields";
import { adminFor, getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const AREA_KEYS = new Set<string>(ADMIN_AREAS.map((a) => a.key));

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/mypage");
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

// 학부모 대표 지정(반) · 해제(빈 값). 최상위 관리자만, 학부모 회원만
export async function setParentRep(formData: FormData) {
  const current = await adminFor("members");
  const targetId = String(formData.get("id") ?? "");
  const className = String(formData.get("class_name") ?? "");
  if (!current || !UUID_RE.test(targetId)) return;
  if (className && !CLASS_OPTIONS.some((c) => c.name === className)) return;
  const supabase = await createClient();
  await supabase.rpc("set_parent_rep", { target_id: targetId, class_name: className || null });
  refresh();
}

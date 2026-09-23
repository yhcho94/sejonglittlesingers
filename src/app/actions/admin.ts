"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { ApplicationStatus, FormState, UserRole } from "@/lib/types";

// 서버 액션은 외부에서 직접 호출될 수 있으므로 매번 관리자 여부를 확인합니다. (DB 의 RLS 가 한 번 더 막습니다)
async function adminClient() {
  const current = await getCurrentUser();
  if (current?.profile?.role !== "admin") return null;
  return { supabase: await createClient(), userId: current.user.id };
}

const DENIED = { error: "관리자 권한이 필요합니다." };

// ── 공지사항 ─────────────────────────────────────
export async function saveNotice(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await adminClient();
  if (!admin) return DENIED;

  const idRaw = formData.get("id");
  const id = idRaw ? Number(idRaw) : null;
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || title.length > 200) return { error: "제목을 200자 이내로 입력해 주세요." };
  if (!body || body.length > 20000) return { error: "본문을 입력해 주세요. (20,000자 이내)" };

  const values = {
    title,
    body,
    is_pinned: formData.get("is_pinned") === "on",
    is_published: formData.get("is_published") === "on",
  };

  const { error } =
    id && Number.isSafeInteger(id)
      ? await admin.supabase.from("notices").update(values).eq("id", id)
      : await admin.supabase.from("notices").insert({ ...values, author_id: admin.userId });

  if (error) return { error: "저장하지 못했습니다." };

  revalidatePath("/", "layout");
  redirect("/admin/notices");
}

export async function deleteNotice(formData: FormData) {
  const admin = await adminClient();
  if (!admin) return;
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id)) return;
  await admin.supabase.from("notices").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/notices");
}

// ── 입단 신청 심사 ───────────────────────────────
const STATUSES: ApplicationStatus[] = ["pending", "approved", "rejected"];

export async function reviewApplication(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await adminClient();
  if (!admin) return DENIED;

  const id = Number(formData.get("id"));
  const status = formData.get("status") as ApplicationStatus;
  const note = String(formData.get("admin_note") ?? "").trim().slice(0, 2000);
  if (!Number.isSafeInteger(id) || !STATUSES.includes(status)) return { error: "잘못된 요청입니다." };

  const { error } = await admin.supabase
    .from("applications")
    .update({
      status,
      admin_note: note || null,
      reviewed_at: status === "pending" ? null : new Date().toISOString(),
      reviewed_by: status === "pending" ? null : admin.userId,
    })
    .eq("id", id);

  if (error) return { error: "저장하지 못했습니다." };
  revalidatePath("/admin", "layout");
  return { success: "심사 결과를 저장했습니다. 신청자는 마이페이지에서 확인할 수 있습니다." };
}

export async function deleteApplication(formData: FormData) {
  const admin = await adminClient();
  if (!admin) return;
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id)) return;

  const { data } = await admin.supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .select("photo_path")
    .maybeSingle();
  if (data?.photo_path) {
    await admin.supabase.storage.from("application-photos").remove([data.photo_path]);
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/applications");
}

// ── 회원 권한 ────────────────────────────────────
export async function setMemberRole(formData: FormData) {
  const admin = await adminClient();
  if (!admin) return;
  const targetId = String(formData.get("id") ?? "");
  const role = formData.get("role") as UserRole;
  if (!targetId || (role !== "admin" && role !== "member") || targetId === admin.userId) return;

  // DB 함수가 관리자 여부와 본인 변경 금지를 다시 확인합니다.
  await admin.supabase.rpc("set_member_role", { target_id: targetId, new_role: role });
  revalidatePath("/admin/members");
}

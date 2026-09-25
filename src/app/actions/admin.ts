"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { adminFor } from "@/lib/auth";
import type { AdminGate } from "@/lib/admin-perms";
import { fromKstInputValue } from "@/lib/format";
import type { ApplicationStatus, FormState } from "@/lib/types";

// 서버 액션은 외부에서 직접 호출될 수 있으므로 매번 관리자 여부를 확인합니다. (DB 의 RLS 가 한 번 더 막습니다)
// 메뉴 권한이 있는 관리자만 (DB 규칙에서도 한 번 더 막힘)
async function adminClient(gate: AdminGate) {
  const current = await adminFor(gate);
  if (!current) return null;
  return { supabase: await createClient(), userId: current.user.id };
}

const DENIED = { error: "이 메뉴의 관리자 권한이 필요합니다." };

// ── 공지사항 ─────────────────────────────────────
export async function saveNotice(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await adminClient("notices");
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
  const admin = await adminClient("notices");
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
  const admin = await adminClient("applications");
  if (!admin) return DENIED;

  const id = Number(formData.get("id"));
  const status = formData.get("status") as ApplicationStatus;
  const note = String(formData.get("admin_note") ?? "").trim().slice(0, 2000);
  if (!Number.isSafeInteger(id) || !STATUSES.includes(status)) return { error: "잘못된 요청입니다." };

  // 반려하면 DB 가 사진 경로와 선택 항목을 지우므로, 사진 파일은 여기서 저장소에서 삭제합니다.
  let photoToRemove: string | null = null;
  if (status === "rejected") {
    const { data: current } = await admin.supabase
      .from("applications")
      .select("status, photo_path")
      .eq("id", id)
      .maybeSingle();
    if (current && current.status !== "rejected") photoToRemove = current.photo_path;
  }

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
  if (photoToRemove) {
    await admin.supabase.storage.from("application-photos").remove([photoToRemove]);
  }
  revalidatePath("/admin", "layout");
  return {
    success:
      status === "rejected"
        ? "반려 처리했습니다. 사진과 상세 정보는 삭제되었고, 신청 기록은 5일 후 삭제됩니다."
        : "심사 결과를 저장했습니다. 신청자는 마이페이지에서 확인할 수 있습니다.",
  };
}

export async function deleteApplication(formData: FormData) {
  const admin = await adminClient("applications");
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

// ── 입단 안내 ────────────────────────────────────
function optionalText(formData: FormData, key: string, max: number) {
  const value = String(formData.get(key) ?? "").trim();
  return value ? value.slice(0, max) : null;
}

export async function saveRecruitment(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await adminClient("recruitment");
  if (!admin) return DENIED;

  const { error } = await admin.supabase
    .from("recruitment")
    .update({
      is_open: formData.get("is_open") === "on",
      period: optionalText(formData, "period", 200),
      target: optionalText(formData, "target", 500),
      schedule: optionalText(formData, "schedule", 500),
      place: optionalText(formData, "place", 500),
      fee: optionalText(formData, "fee", 500),
      audition: optionalText(formData, "audition", 2000),
      classes: optionalText(formData, "classes", 2000),
      notes: optionalText(formData, "notes", 4000),
    })
    .eq("id", 1);

  if (error) return { error: "저장하지 못했습니다." };
  revalidatePath("/", "layout");
  return { success: "입단 안내를 저장했습니다." };
}

// ── FAQ ─────────────────────────────────────────
export async function saveFaq(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await adminClient("recruitment");
  if (!admin) return DENIED;

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  if (!question || question.length > 300) return { error: "질문을 300자 이내로 입력해 주세요." };
  if (!answer || answer.length > 4000) return { error: "답변을 입력해 주세요. (4,000자 이내)" };
  if (!Number.isInteger(sortOrder)) return { error: "순서는 정수로 입력해 주세요." };

  const values = {
    question,
    answer,
    sort_order: sortOrder,
    is_published: formData.get("is_published") === "on",
  };
  const { error } =
    id && Number.isSafeInteger(id)
      ? await admin.supabase.from("faqs").update(values).eq("id", id)
      : await admin.supabase.from("faqs").insert(values);

  if (error) return { error: "저장하지 못했습니다." };
  revalidatePath("/", "layout");
  redirect("/admin/faqs");
}

export async function deleteFaq(formData: FormData) {
  const admin = await adminClient("recruitment");
  if (!admin) return;
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id)) return;
  await admin.supabase.from("faqs").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/faqs");
}

// ── 공연 일정 ────────────────────────────────────
function httpsUrl(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) return { value: null };
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || value.length > 500) throw new Error();
    return { value: url.toString() };
  } catch {
    return { error: true as const };
  }
}

export async function saveConcert(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await adminClient("concerts");
  if (!admin) return DENIED;

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const title = String(formData.get("title") ?? "").trim();
  // 시간 미정이면 날짜만 쓰고, 정렬용으로 그날 12:00(한국 시간)을 저장
  const timeTbd = formData.get("time_tbd") === "on";
  const rawStartsAt = String(formData.get("starts_at") ?? "");
  const startsAt = fromKstInputValue(timeTbd ? `${rawStartsAt.slice(0, 10)}T12:00` : rawStartsAt);
  const ticket = httpsUrl(formData, "ticket_url");
  const video = httpsUrl(formData, "video_url");

  if (!title || title.length > 200) return { error: "공연명을 200자 이내로 입력해 주세요." };
  if (!startsAt) return { error: "공연 일시를 입력해 주세요." };
  if (ticket.error) return { error: "예매 링크는 https:// 로 시작하는 주소여야 합니다." };
  if (video.error) return { error: "영상 링크는 https:// 로 시작하는 주소여야 합니다." };

  const values = {
    title,
    starts_at: startsAt,
    venue: optionalText(formData, "venue", 200),
    description: optionalText(formData, "description", 10000),
    ticket_url: ticket.value,
    video_url: video.value,
    is_published: formData.get("is_published") === "on",
    // 0009 실행 전에는 이 칸이 없으므로, 체크했거나 이미 칸이 있는 공연일 때만 보냅니다.
    ...(timeTbd || formData.get("has_time_tbd") ? { time_tbd: timeTbd } : {}),
  };
  const { error } =
    id && Number.isSafeInteger(id)
      ? await admin.supabase.from("concerts").update(values).eq("id", id)
      : await admin.supabase.from("concerts").insert(values);

  if (error) return { error: "저장하지 못했습니다." };
  revalidatePath("/", "layout");
  redirect("/admin/concerts");
}

export async function deleteConcert(formData: FormData) {
  const admin = await adminClient("concerts");
  if (!admin) return;
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id)) return;
  await admin.supabase.from("concerts").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/concerts");
}

// ── 보도자료 ────────────────────────────────────
export async function savePress(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await adminClient("press");
  if (!admin) return DENIED;

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const publishedOn = String(formData.get("published_on") ?? "").trim();
  if (!title || title.length > 200) return { error: "제목을 200자 이내로 입력해 주세요." };
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol) || url.length > 500) throw new Error();
  } catch {
    return { error: "기사 주소는 http:// 또는 https:// 로 시작해야 합니다." };
  }
  if (publishedOn && !/^\d{4}-\d{2}-\d{2}$/.test(publishedOn)) return { error: "게시일을 확인해 주세요." };

  const values = {
    title,
    url,
    media: optionalText(formData, "media", 50),
    published_on: publishedOn || null,
    is_published: formData.get("is_published") === "on",
  };
  const { error } =
    id && Number.isSafeInteger(id)
      ? await admin.supabase.from("press").update(values).eq("id", id)
      : await admin.supabase.from("press").insert(values);

  if (error) {
    if (error.code === "23505") return { error: "이미 등록된 기사 주소입니다." };
    return { error: "저장하지 못했습니다." };
  }
  revalidatePath("/press");
  redirect("/admin/press");
}

export async function deletePress(formData: FormData) {
  const admin = await adminClient("press");
  if (!admin) return;
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id)) return;
  await admin.supabase.from("press").delete().eq("id", id);
  revalidatePath("/press");
  redirect("/admin/press");
}

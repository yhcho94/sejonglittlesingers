"use server";

import { canAccess } from "@/lib/admin-perms";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/auth";
import { processStorageCleanup } from "@/lib/storage-cleanup";
import { createClient } from "@/lib/supabase/server";
import { createSecretClient } from "@/lib/supabase/secret";
import type { FormState } from "@/lib/types";
import { MEDIA_CONSENT_VERSION, readMediaConsent } from "@/lib/media-consent";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// 보호자 폴더({회원 id}/)의 입단 신청 사진을 모두 삭제 (신청서에 연결되지 않은 파일 포함)
async function removeGuardianPhotos(supabase: SupabaseClient, userId: string) {
  const bucket = supabase.storage.from("application-photos");
  for (let round = 0; round < 10; round++) {
    const { data, error } = await bucket.list(userId, { limit: 1000 });
    if (error) return false;
    if (!data?.length) return true;
    const { error: removeError } = await bucket.remove(data.map((f) => `${userId}/${f.name}`));
    if (removeError) return false;
  }
  return true;
}

// ── 회원 탈퇴 (본인) ─────────────────────────────
export async function withdraw(_prev: FormState, formData: FormData): Promise<FormState> {
  const current = await getCurrentUser();
  if (!current) return { error: "로그인이 필요합니다." };
  if (formData.get("confirm") !== "on") return { error: "안내 내용을 확인하고 체크해 주세요." };

  const supabase = await createClient();
  // 1) 사진 파일 먼저 삭제 (본인 폴더는 본인이 지울 수 있음)
  await removeGuardianPhotos(supabase, current.user.id);
  // 2) 계정 삭제 → 회원 정보·입단 신청이 함께 삭제됨
  const { error } = await supabase.rpc("delete_my_account");
  if (error) {
    if (error.message.includes("last_admin")) {
      return { error: "마지막 관리자는 탈퇴할 수 없습니다. 다른 회원을 관리자로 지정한 뒤 탈퇴해 주세요." };
    }
    return { error: "탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도하거나 합창단에 문의해 주세요." };
  }
  // 3) 남은 사진 삭제 대기열 정리 (비밀 키가 설정된 경우 즉시, 아니면 예약 작업에서)
  const secret = createSecretClient();
  if (secret) await processStorageCleanup(secret);

  // 로그인 쿠키 삭제 (계정이 이미 지워져 오류가 나도 무시)
  await supabase.auth.signOut().catch(() => {});
  revalidatePath("/", "layout");
  redirect("/withdrawn");
}

// ── 관리자의 회원 삭제 ───────────────────────────
export async function adminDeleteMember(formData: FormData) {
  const current = await getCurrentUser();
  if (!current || !canAccess(current.profile, "members")) return;
  const targetId = String(formData.get("id") ?? "");
  if (!UUID_RE.test(targetId) || targetId === current.user.id) return;

  const supabase = await createClient();
  await removeGuardianPhotos(supabase, targetId);
  // DB 함수가 관리자 여부와 본인 삭제 금지를 다시 확인합니다.
  const { error } = await supabase.rpc("admin_delete_member", { target_id: targetId });
  if (!error) await processStorageCleanup(supabase);
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/singers", "layout");
}

// ── 보호자의 자녀 초상권 동의 변경 ───────────────
export async function updateMyMediaConsent(_prev: FormState, formData: FormData): Promise<FormState> {
  const current = await getCurrentUser();
  if (!current) return { error: "로그인이 필요합니다." };
  const singerId = Number(formData.get("singer_id"));
  if (!Number.isSafeInteger(singerId)) return { error: "잘못된 요청입니다." };
  const media = readMediaConsent(formData);

  const supabase = await createClient();
  // DB 함수가 본인과 연결된 단원인지 다시 확인합니다.
  const { error } = await supabase.rpc("set_my_media_consent", {
    p_singer_id: singerId,
    p_channels: media.channels,
    p_press: media.press,
    p_name: media.name,
    p_version: MEDIA_CONSENT_VERSION,
  });
  if (error) return { error: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  const hidden = await supabase.rpc("set_my_name_hidden", {
    p_singer_id: singerId,
    p_hidden: formData.get("name_hidden") === "on",
  });
  if (hidden.error) return { error: "이름 게시 설정을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  revalidatePath("/mypage");
  revalidatePath("/singers");
  return { success: "저장했습니다." };
}

"use server";

import { revalidatePath } from "next/cache";
import { adminFor } from "@/lib/auth";
import { getSiteLogo } from "@/lib/content";
import { LOGO_BUCKET, LOGO_DIR, isUploadedLogoPath, parseSiteLogo, siteLogoValue } from "@/lib/site-logo";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";

// 로고는 최상위 관리자만 (DB 규칙·저장소 규칙에서도 한 번 더 막힘, 0027)
async function superAdminClient() {
  if (!(await adminFor("members"))) return null;
  return await createClient();
}

async function uploadedExists(supabase: Awaited<ReturnType<typeof createClient>>, path: string) {
  const name = path.slice(LOGO_DIR.length + 1);
  const { data } = await supabase.storage.from(LOGO_BUCKET).list(LOGO_DIR, { search: name, limit: 5 });
  return (data ?? []).some((f) => f.name === name);
}

export async function saveSiteLogo(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await superAdminClient();
  if (!supabase) return { error: "최상위 관리자만 바꿀 수 있습니다." };
  const raw = String(formData.get("logo") ?? "");
  const logo = parseSiteLogo(raw);
  if (siteLogoValue(logo) !== raw) return { error: "로고를 골라 주세요." };
  if (logo.kind === "upload" && !(await uploadedExists(supabase, logo.path))) {
    return { error: "올린 로고 파일을 찾지 못했습니다. 다시 올려 주세요." };
  }
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "site_logo", value: raw, updated_at: new Date().toISOString() });
  if (error) return { error: "저장하지 못했습니다. (0027 SQL 실행 여부를 확인해 주세요)" };
  revalidatePath("/", "layout");
  return { success: "저장했습니다. 모든 화면의 머리글·바닥글에 바로 반영됩니다." };
}

// 올린 로고 삭제 (지금 쓰는 로고는 지울 수 없음)
export async function deleteSiteLogo(formData: FormData) {
  const supabase = await superAdminClient();
  if (!supabase) return;
  const path = String(formData.get("path") ?? "");
  if (!isUploadedLogoPath(path)) return;
  const current = await getSiteLogo();
  if (current.kind === "upload" && current.path === path) return;
  await supabase.storage.from(LOGO_BUCKET).remove([path]);
  revalidatePath("/admin/site-logo");
}

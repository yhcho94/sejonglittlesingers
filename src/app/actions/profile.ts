"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { FormState } from "@/lib/types";

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const current = await getCurrentUser();
  if (!current) return { error: "로그인이 필요합니다." };

  const name = String(formData.get("guardian_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!name || name.length > 50) return { error: "이름을 50자 이내로 입력해 주세요." };
  if (!/^[0-9-]{9,20}$/.test(phone)) return { error: "연락처는 숫자와 '-'만 사용해 입력해 주세요." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ guardian_name: name, phone })
    .eq("id", current.user.id);
  if (error) return { error: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요." };

  revalidatePath("/mypage");
  return { success: "저장했습니다." };
}

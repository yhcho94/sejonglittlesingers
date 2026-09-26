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

  // 이름·연락처만 본인이 수정 (운영진 역할·반·담당은 최상위 관리자만)
  // 조직도에 승인된 운영진·학부모 대표는 이름도 최상위 관리자만 바꿀 수 있음 (DB 에서도 막음)
  const p = current.profile;
  const nameLocked = (p?.org_visible === true || !!p?.parent_rep_class) && !(p?.role === "admin" && p.is_super);
  if (nameLocked && name !== p?.guardian_name) {
    return { error: "조직도에 게시된 이름은 최상위 관리자만 바꿀 수 있습니다. 연락처만 저장하려면 이름을 그대로 두세요." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ guardian_name: name, phone })
    .eq("id", current.user.id);
  if (error) return { error: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요." };

  revalidatePath("/mypage");
  return { success: "저장했습니다." };
}

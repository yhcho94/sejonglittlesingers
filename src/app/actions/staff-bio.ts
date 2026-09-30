"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { bioFromForm, isFacultyRole } from "@/lib/staff-bio";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";

// 강사 프로필 저장: 강사 역할의 운영진 회원 본인만 (DB 규칙 0028 에서도 한 번 더 막힘)
export async function saveStaffBio(_prev: FormState, formData: FormData): Promise<FormState> {
  const current = await getCurrentUser();
  const p = current?.profile;
  if (!current || !p || (p.member_type !== "teacher" && p.member_type !== "staff") || !isFacultyRole(p.staff_role)) {
    return { error: "강사진(지휘자·부지휘자·반주자·보컬트레이너·이론선생님·사무국장) 회원만 작성할 수 있습니다." };
  }
  const parsed = bioFromForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const supabase = await createClient();
  const { error } = await supabase.from("staff_bios").upsert({
    id: current.user.id,
    intro: parsed.bio.intro,
    sections: parsed.bio.sections,
    website: parsed.bio.website,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: "저장하지 못했습니다. 잠시 뒤 다시 시도해 주세요." };
  revalidatePath("/faculty");
  revalidatePath("/mypage/profile");
  return {
    success: p.org_visible
      ? "저장했습니다. 강사진 소개에 바로 반영됩니다."
      : "저장했습니다. 최상위 관리자가 조직도 게시를 승인하면 강사진 소개에 표시됩니다.",
  };
}

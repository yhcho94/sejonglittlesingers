"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CLASS_OPTIONS } from "@/lib/application-fields";
import { adminFor, getCurrentUser } from "@/lib/auth";
import { canEditOwnFaculty, findOwnFacultyRow } from "@/lib/faculty-own";
import { bioFromForm } from "@/lib/staff-bio";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";

function refresh() {
  revalidatePath("/faculty");
  revalidatePath("/admin/faculty", "layout");
  revalidatePath("/mypage/profile");
}

export async function saveOwnFacultyBio(_prev: FormState, formData: FormData): Promise<FormState> {
  const current = await getCurrentUser();
  const p = current?.profile;
  if (!p || !canEditOwnFaculty(p)) {
    return { error: "조직도 게시가 승인된 강사진 회원만 수정할 수 있습니다." };
  }
  const parsed = bioFromForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const supabase = await createClient();
  const row = await findOwnFacultyRow(supabase, p);
  const values = { sections: parsed.bio.sections, website: parsed.bio.website };
  const { error } = row
    ? await supabase.from("faculty_bios").update(values).eq("id", row.id)
    : await supabase
        .from("faculty_bios")
        .insert({ ...values, name: p.guardian_name, role: p.staff_role, class_name: p.staff_class ?? null });
  if (error) return { error: "저장하지 못했습니다. 잠시 뒤 다시 시도해 주세요." };
  refresh();
  return { success: "저장했습니다. 강사진 소개에 바로 반영됩니다." };
}

// 최상위 관리자: 강사 추가·수정 (이름·역할·반·순서 포함)
export async function adminSaveFaculty(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await adminFor("members"))) return { error: "최상위 관리자만 수정할 수 있습니다." };
  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const className = String(formData.get("class_name") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  if (!name || name.length > 50) return { error: "이름을 50자 이내로 입력해 주세요." };
  if (!role || role.length > 30 || /[<>\u0000-\u001f]/.test(role + name)) return { error: "역할을 30자 이내로 입력해 주세요." };
  if (className && !CLASS_OPTIONS.some((c) => c.name === className)) return { error: "담당 반을 다시 골라 주세요." };
  if (!Number.isInteger(sortOrder) || Math.abs(sortOrder) > 10000) return { error: "순서는 숫자로 입력해 주세요." };
  const parsed = bioFromForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  const values = {
    name,
    role,
    class_name: className || null,
    sort_order: sortOrder,
    sections: parsed.bio.sections,
    website: parsed.bio.website,
  };
  const supabase = await createClient();
  if (id !== null) {
    if (!Number.isSafeInteger(id)) return { error: "잘못된 요청입니다." };
    const { error } = await supabase.from("faculty_bios").update(values).eq("id", id);
    if (error) return { error: error.code === "23505" ? "같은 이름·역할의 강사가 이미 있습니다." : "저장하지 못했습니다." };
    refresh();
    return { success: "저장했습니다. 강사진 소개에 바로 반영됩니다." };
  }
  const { error } = await supabase.from("faculty_bios").insert(values);
  if (error) {
    return {
      error:
        error.code === "23505"
          ? "같은 이름·역할의 강사가 이미 있습니다."
          : "저장하지 못했습니다. (0028 SQL 실행 여부를 확인해 주세요)",
    };
  }
  refresh();
  redirect("/admin/faculty");
}

export async function adminDeleteFaculty(formData: FormData) {
  if (!(await adminFor("members"))) return;
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id)) return;
  const supabase = await createClient();
  await supabase.from("faculty_bios").delete().eq("id", id);
  refresh();
  redirect("/admin/faculty");
}

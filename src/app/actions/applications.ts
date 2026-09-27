"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { FormState } from "@/lib/types";
import { MEDIA_CONSENT_VERSION, readMediaConsent } from "@/lib/media-consent";
import { JOIN_SOURCES } from "@/lib/join-source";
import { CLASS_OPTIONS, GENDERS, GUARDIAN_RELATIONS } from "@/lib/application-fields";

const PHOTO_BUCKET = "application-photos";

function text(formData: FormData, key: string, max: number) {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

// 로그인 없이 입단 신청 (보호자 인적사항은 신청서에서 받음). 저장은 DB 함수가 값을 다시 검사하고 과다 제출을 막습니다.
export async function submitApplication(_prev: FormState, formData: FormData): Promise<FormState> {
  // 자동 입력 방지: 사람에게는 보이지 않는 칸이 채워져 있으면 저장하지 않음
  if (text(formData, "website", 200)) return { error: "신청을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." };

  const childName = text(formData, "child_name", 50);
  const birthdate = text(formData, "child_birthdate", 10);
  if (!childName || !birthdate) return { error: "단원 이름과 생년월일은 필수입니다." };

  const birth = new Date(`${birthdate}T00:00:00+09:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate) || Number.isNaN(birth.getTime()) || birth > new Date()) {
    return { error: "생년월일을 올바르게 입력해 주세요." };
  }

  const guardianName = text(formData, "guardian_name", 50);
  const guardianRelation = String(formData.get("guardian_relation") ?? "");
  const guardianRelationDetail = text(formData, "guardian_relation_detail", 20);
  const guardianPhone = text(formData, "guardian_phone", 20);
  if (!guardianName) return { error: "보호자 이름을 입력해 주세요." };
  if (!(GUARDIAN_RELATIONS as readonly string[]).includes(guardianRelation)) return { error: "단원과의 관계를 선택해 주세요." };
  const relation = guardianRelation === "기타" ? guardianRelationDetail : guardianRelation;
  if (!relation) return { error: "단원과의 관계를 입력해 주세요." };
  if (!guardianPhone || !/^[0-9-]{9,20}$/.test(guardianPhone)) return { error: "보호자 연락처는 숫자와 '-'만 사용해 입력해 주세요." };

  if (formData.get("consent_privacy") !== "on" || formData.get("consent_guardian") !== "on") {
    return { error: "필수 동의 항목에 동의해 주세요." };
  }

  const gender = String(formData.get("gender") ?? "");
  if (!(GENDERS as readonly string[]).includes(gender)) return { error: "성별을 선택해 주세요." };
  const desiredClass = String(formData.get("desired_class") ?? "");
  if (!CLASS_OPTIONS.some((c) => c.name === desiredClass)) return { error: "원하는 반을 선택해 주세요." };
  const school = text(formData, "school", 100);
  if (!school) return { error: "소속 기관(학교·유치원)을 입력해 주세요." };
  const neighborhood = text(formData, "neighborhood", 50);
  if (!neighborhood) return { error: "사는 동을 입력해 주세요." };

  const joinSource = String(formData.get("join_source") ?? "");
  if (!(JOIN_SOURCES as readonly string[]).includes(joinSource)) return { error: "가입경로를 선택해 주세요." };
  const media = readMediaConsent(formData);

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_application", {
    p: {
      child_name: childName,
      child_birthdate: birthdate,
      guardian_name: guardianName,
      guardian_relation: relation,
      guardian_phone: guardianPhone,
      school,
      gender,
      desired_class: desiredClass,
      neighborhood,
      referrer: text(formData, "referrer", 100),
      notes: text(formData, "notes", 2000),
      join_source: joinSource,
      join_source_detail: joinSource === "기타" ? text(formData, "join_source_detail", 100) : null,
      consent_privacy: true,
      consent_guardian: true,
      consent_media_channels: media.channels,
      consent_media_press: media.press,
      consent_media_name: media.name,
      consent_media_version: MEDIA_CONSENT_VERSION,
      consent_name_listing: formData.get("consent_name_listing") === "on",
    },
  });

  if (error) {
    if (error.message.includes("too_many")) {
      return { error: "짧은 시간에 신청이 많아 잠시 받을 수 없습니다. 잠시 후 다시 시도하거나 합창단에 문의해 주세요." };
    }
    console.error("입단 신청 저장 실패", error.message);
    return { error: "신청을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }

  // 개인정보가 주소창·기록에 남지 않도록 완료 화면 주소에는 아무것도 붙이지 않음
  redirect("/apply/done");
}

// 심사 대기 중인 본인 신청 취소 (RLS 가 본인·대기 상태만 허용)
export async function cancelApplication(formData: FormData) {
  const current = await getCurrentUser();
  if (!current) redirect("/login");

  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id)) return;

  const supabase = await createClient();
  const { data: deleted } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("guardian_id", current.user.id)
    .eq("status", "pending")
    .select("photo_path")
    .maybeSingle();

  if (deleted?.photo_path) {
    await supabase.storage.from(PHOTO_BUCKET).remove([deleted.photo_path]);
  }
  revalidatePath("/mypage");
}

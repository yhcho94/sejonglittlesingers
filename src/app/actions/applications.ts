"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { FormState } from "@/lib/types";
import { MEDIA_CONSENT_VERSION, readMediaConsent } from "@/lib/media-consent";
import { JOIN_SOURCES } from "@/lib/join-source";

const PHOTO_BUCKET = "application-photos";
const PHOTO_PATH_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

function text(formData: FormData, key: string, max: number) {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

export async function submitApplication(_prev: FormState, formData: FormData): Promise<FormState> {
  const current = await getCurrentUser();
  if (!current) return { error: "로그인이 필요합니다." };
  const userId = current.user.id;

  const childName = text(formData, "child_name", 50);
  const birthdate = text(formData, "child_birthdate", 10);
  if (!childName || !birthdate) return { error: "단원 이름과 생년월일은 필수입니다." };

  const birth = new Date(`${birthdate}T00:00:00+09:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate) || Number.isNaN(birth.getTime()) || birth > new Date()) {
    return { error: "생년월일을 올바르게 입력해 주세요." };
  }

  if (formData.get("consent_privacy") !== "on" || formData.get("consent_guardian") !== "on") {
    return { error: "필수 동의 항목에 동의해 주세요." };
  }

  const photoPath = text(formData, "photo_path", 200);
  const consentPhoto = formData.get("consent_photo") === "on";
  if (photoPath) {
    if (!PHOTO_PATH_RE.test(photoPath) || !photoPath.startsWith(`${userId}/`)) {
      return { error: "사진 정보가 올바르지 않습니다. 다시 첨부해 주세요." };
    }
    if (!consentPhoto) return { error: "사진을 첨부하려면 사진 수집·이용에 동의해 주세요." };
  }

  const joinSource = String(formData.get("join_source") ?? "");
  if (!(JOIN_SOURCES as readonly string[]).includes(joinSource)) return { error: "가입경로를 선택해 주세요." };
  const media = readMediaConsent(formData);
  const supabase = await createClient();
  const base = {
    guardian_id: userId,
    child_name: childName,
    child_birthdate: birthdate,
    school: text(formData, "school", 100),
    grade: text(formData, "grade", 20),
    address: text(formData, "address", 200),
    experience: text(formData, "experience", 2000),
    motivation: text(formData, "motivation", 2000),
    photo_path: photoPath,
    consent_privacy: true,
    consent_guardian: true,
    consent_photo: Boolean(photoPath) && consentPhoto,
  };
  // 0008(초상권)·0011(가입경로) 칸. DB 에 아직 칸이 없으면(PGRST204) 기본 항목만이라도 저장해 신청이 누락되지 않게 합니다.
  const extra = {
    consent_media_channels: media.channels,
    consent_media_press: media.press,
    consent_media_name: media.name,
    consent_media_version: MEDIA_CONSENT_VERSION,
    join_source: joinSource,
    join_source_detail: joinSource === "기타" ? text(formData, "join_source_detail", 100) : null,
  };
  let { error } = await supabase.from("applications").insert({ ...base, ...extra });
  if (error?.code === "PGRST204") {
    console.error("입단 신청: 새 항목 칸이 없어 기본 항목만 저장 (0008·0011 실행 필요)");
    ({ error } = await supabase.from("applications").insert(base));
  }

  if (error) {
    console.error("입단 신청 저장 실패", error.message);
    return { error: "신청을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }

  revalidatePath("/mypage");
  redirect("/mypage?applied=1");
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

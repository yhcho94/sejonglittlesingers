"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { FormState } from "@/lib/types";
import { MEDIA_CONSENT_VERSION, readMediaConsent } from "@/lib/media-consent";
import { JOIN_SOURCES } from "@/lib/join-source";
import { CLASS_OPTIONS, GENDERS } from "@/lib/application-fields";

const PHOTO_BUCKET = "application-photos";

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
  const base = {
    guardian_id: userId,
    child_name: childName,
    child_birthdate: birthdate,
    school,
    consent_privacy: true,
    consent_guardian: true,
  };
  // 0008(초상권)·0011(가입경로)·0017(신청서 항목) 칸. DB 에 아직 칸이 없으면(PGRST204) 기본 항목만이라도 저장해 신청이 누락되지 않게 합니다.
  const extra = {
    gender,
    desired_class: desiredClass,
    neighborhood,
    referrer: text(formData, "referrer", 100),
    notes: text(formData, "notes", 2000),
    consent_media_channels: media.channels,
    consent_media_press: media.press,
    consent_media_name: media.name,
    consent_media_version: MEDIA_CONSENT_VERSION,
    join_source: joinSource,
    join_source_detail: joinSource === "기타" ? text(formData, "join_source_detail", 100) : null,
  };
  // 0024: 단원 소개 이름·반 게시 동의 (선택)
  const consentNameListing = formData.get("consent_name_listing") === "on";
  let { error } = await supabase.from("applications").insert({ ...base, ...extra, consent_name_listing: consentNameListing });
  if (error?.code === "PGRST204") {
    // 0024 실행 전: 이름 게시 동의 칸 없이 저장
    ({ error } = await supabase.from("applications").insert({ ...base, ...extra }));
  }
  if (error?.code === "PGRST204") {
    console.error("입단 신청: 새 항목 칸이 없어 기본 항목만 저장 (0008·0011·0017 실행 필요)");
    const fallback = [base.school, `성별 ${gender}`, `원하는 반 ${desiredClass}`, `사는 동 ${neighborhood}`].join(" / ");
    ({ error } = await supabase.from("applications").insert({ ...base, motivation: fallback }));
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

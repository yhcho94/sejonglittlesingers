"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CLASS_NAMES } from "@/lib/singers";
import { parseImportRow } from "@/lib/singers-import";
import { readSheet } from "@/lib/singers-xlsx";
import type { FormState } from "@/lib/types";

const PHOTO_BUCKET = "singer-photos";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const PHOTO_RE = /^singers\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

async function adminClient() {
  const current = await getCurrentUser();
  if (current?.profile?.role !== "admin") return null;
  return await createClient();
}

function text(formData: FormData, key: string, max: number) {
  const v = String(formData.get(key) ?? "").trim();
  return v ? v.slice(0, max) : null;
}

function intOrNull(formData: FormData, key: string, min: number, max: number) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return { value: null };
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) return { error: true as const };
  return { value: n };
}

function dateOrNull(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return { value: null };
  if (!DATE_RE.test(raw) || Number.isNaN(new Date(raw).getTime())) return { error: true as const };
  return { value: raw };
}

export async function saveSinger(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await adminClient();
  if (!supabase) return { error: "관리자 권한이 필요합니다." };

  const id = formData.get("id") ? Number(formData.get("id")) : null;
  const name = text(formData, "name", 50);
  const birth = dateOrNull(formData, "birthdate");
  if (!name) return { error: "이름을 입력해 주세요." };
  if (birth.error || !birth.value) return { error: "생년월일을 입력해 주세요." };

  const gender = String(formData.get("gender") ?? "");
  const className = String(formData.get("class_name") ?? "");
  const status = String(formData.get("status") ?? "active");
  const grade = intOrNull(formData, "grade_override", 0, 12);
  const cohort = intOrNull(formData, "cohort", 1, 99);
  const joined = dateOrNull(formData, "joined_on");
  const left = dateOrNull(formData, "left_on");
  const guardianId = String(formData.get("guardian_id") ?? "");
  const photoPath = String(formData.get("photo_path") ?? "");
  const applicationId = formData.get("application_id") ? Number(formData.get("application_id")) : null;

  if (grade.error) return { error: "학년 직접 지정 값이 올바르지 않습니다." };
  if (cohort.error) return { error: "기수는 1~99 사이 숫자로 입력해 주세요." };
  if (joined.error || left.error) return { error: "입단일·퇴단일을 확인해 주세요." };
  if (guardianId && !UUID_RE.test(guardianId)) return { error: "보호자 선택이 올바르지 않습니다." };
  if (photoPath && !PHOTO_RE.test(photoPath)) return { error: "사진 정보가 올바르지 않습니다. 다시 올려 주세요." };

  const values = {
    name,
    birthdate: birth.value,
    gender: gender === "여" || gender === "남" ? gender : null,
    school: text(formData, "school", 100),
    grade_override: grade.value,
    class_name: (CLASS_NAMES as readonly string[]).includes(className) ? className : null,
    part: text(formData, "part", 20),
    cohort: cohort.value,
    joined_on: joined.value,
    left_on: left.value,
    status: ["active", "paused", "left"].includes(status) ? status : "active",
    guardian_id: guardianId || null,
    guardian_name: text(formData, "guardian_name", 50),
    guardian_phone: text(formData, "guardian_phone", 20),
    photo_path: photoPath || null,
    name_public: formData.get("name_public") === "on",
    notes: text(formData, "notes", 2000),
  };

  let savedId = id;
  if (id && Number.isSafeInteger(id)) {
    // 사진을 바꾸거나 지웠으면 이전 사진 파일도 삭제
    const { data: before } = await supabase.from("singers").select("photo_path").eq("id", id).maybeSingle();
    const { error } = await supabase.from("singers").update(values).eq("id", id);
    if (error) return { error: "저장하지 못했습니다." };
    if (before?.photo_path && before.photo_path !== values.photo_path) {
      await supabase.storage.from(PHOTO_BUCKET).remove([before.photo_path]);
    }
  } else {
    const { data, error } = await supabase
      .from("singers")
      .insert({ ...values, application_id: applicationId && Number.isSafeInteger(applicationId) ? applicationId : null })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") return { error: "이 입단 신청으로 이미 등록된 단원이 있습니다." };
      return { error: "저장하지 못했습니다." };
    }
    savedId = data.id;
  }

  revalidatePath("/admin/singers", "layout");
  revalidatePath("/singers");
  redirect(`/admin/singers/${savedId}`);
}

export async function deleteSinger(formData: FormData) {
  const supabase = await adminClient();
  if (!supabase) return;
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id)) return;
  const { data } = await supabase.from("singers").delete().eq("id", id).select("photo_path").maybeSingle();
  if (data?.photo_path) await supabase.storage.from(PHOTO_BUCKET).remove([data.photo_path]);
  revalidatePath("/admin/singers", "layout");
  revalidatePath("/singers");
  redirect("/admin/singers");
}

// ── 엑셀 일괄 등록 ─────────────────────────────
export type ImportState =
  | { error?: string; errors?: { line: number; name: string; messages: string[] }[]; success?: string }
  | undefined;

export async function importSingers(_prev: ImportState, formData: FormData): Promise<ImportState> {
  const supabase = await adminClient();
  if (!supabase) return { error: "관리자 권한이 필요합니다." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "엑셀 파일을 선택해 주세요." };
  if (file.size > 2 * 1024 * 1024) return { error: "파일이 너무 큽니다. (2MB 이하)" };
  if (!file.name.toLowerCase().endsWith(".xlsx")) return { error: ".xlsx 형식의 엑셀 파일만 올릴 수 있습니다." };

  let sheet: Awaited<ReturnType<typeof readSheet>>;
  try {
    sheet = await readSheet(await file.arrayBuffer(), 1000);
  } catch {
    return { error: "엑셀 파일을 읽지 못했습니다. 양식 파일에 입력했는지 확인해 주세요." };
  }
  if (!sheet.headers.includes("이름") || !sheet.headers.includes("생년월일")) {
    return { error: "양식의 머리글(이름*, 생년월일* 등)을 찾지 못했습니다. 내려받은 양식을 사용해 주세요." };
  }
  // 양식의 예시 줄은 건너뜀
  const rows = sheet.rows.filter((r) => !(r.values["이름"] ?? "").startsWith("(예시)"));
  if (rows.length === 0) return { error: "입력된 단원이 없습니다." };
  if (rows.length > 1000) return { error: "한 번에 1000명까지 등록할 수 있습니다." };

  const parsed = rows.map((r) => ({ line: r.line, ...parseImportRow(r.values), raw: r.values["이름"] ?? "" }));

  // 보호자 이메일 → 가입 회원 연결
  const emails = [...new Set(parsed.map((p) => p.singer?.guardian_email).filter((e): e is string => Boolean(e)))];
  const byEmail = new Map<string, string>();
  if (emails.length) {
    const { data } = await supabase.from("profiles").select("id, email").in("email", emails);
    for (const p of data ?? []) byEmail.set(String(p.email).toLowerCase(), p.id);
  }

  // 이미 등록된 단원 · 파일 안 중복 (이름+생년월일)
  const { data: existing, error: loadError } = await supabase.from("singers").select("name, birthdate");
  if (loadError) return { error: "단원 정보를 불러오지 못했습니다. 0005_singers.sql 실행 여부를 확인해 주세요." };
  const seen = new Set((existing ?? []).map((s) => `${s.name}|${s.birthdate}`));
  const inFile = new Set<string>();

  const errors: { line: number; name: string; messages: string[] }[] = [];
  for (const p of parsed) {
    const messages = [...p.errors];
    if (p.singer) {
      const key = `${p.singer.name}|${p.singer.birthdate}`;
      if (seen.has(key)) messages.push("이미 등록된 단원");
      else if (inFile.has(key)) messages.push("파일 안에 같은 단원이 두 번 있음");
      inFile.add(key);
      if (p.singer.guardian_email && !byEmail.has(p.singer.guardian_email)) {
        messages.push("보호자 가입 이메일과 일치하는 회원 없음");
      }
    }
    if (messages.length) errors.push({ line: p.line, name: p.raw, messages });
  }
  if (errors.length) return { error: `${errors.length}개 줄에 오류가 있어 아무것도 등록하지 않았습니다.`, errors };

  // 한 번의 요청으로 모두 넣으므로, 실패하면 전부 등록되지 않습니다.
  const values = parsed.map(({ singer }) => {
    const { guardian_email, ...rest } = singer!;
    return { ...rest, guardian_id: guardian_email ? byEmail.get(guardian_email)! : null };
  });
  const { error } = await supabase.from("singers").insert(values);
  if (error) return { error: "등록하지 못했습니다. 입력값을 확인해 주세요." };

  revalidatePath("/admin/singers", "layout");
  revalidatePath("/singers");
  return { success: `${values.length}명을 등록했습니다.` };
}

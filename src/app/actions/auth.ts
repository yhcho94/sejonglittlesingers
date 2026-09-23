"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, missingSupabaseEnv } from "@/lib/supabase/env";
import { safeNext } from "@/lib/auth";
import type { FormState } from "@/lib/types";

// 어떤 배포에서 설정이 빠졌는지 알 수 있도록 Vercel 이 제공하는 공개 정보(환경, 커밋)를 함께 표시합니다.
const DEPLOY_INFO = [process.env.VERCEL_ENV, process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7)]
  .filter(Boolean)
  .join(" · ");
const NOT_CONFIGURED = `사이트 설정(Supabase 연결)이 아직 완료되지 않았습니다. (누락: ${missingSupabaseEnv.join(", ")}${DEPLOY_INFO ? ` / 배포: ${DEPLOY_INFO}` : ""})`;
const PHONE_RE = /^[0-9-]{9,20}$/;

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function siteOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };

  const email = text(formData, "email");
  const password = formData.get("password");
  if (!email || typeof password !== "string" || !password) {
    return { error: "이메일과 비밀번호를 입력해 주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "이메일 인증이 완료되지 않았습니다. 가입 시 받은 메일의 링크를 눌러 주세요." };
    }
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };

  const email = text(formData, "email");
  const password = formData.get("password");
  const passwordConfirm = formData.get("password_confirm");
  const guardianName = text(formData, "guardian_name");
  const phone = text(formData, "phone");

  if (!email || !guardianName || !phone) return { error: "필수 항목을 모두 입력해 주세요." };
  if (guardianName.length > 50) return { error: "이름은 50자 이내로 입력해 주세요." };
  if (!PHONE_RE.test(phone)) return { error: "연락처는 숫자와 '-'만 사용해 입력해 주세요." };
  if (typeof password !== "string" || password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다." };
  }
  if (password !== passwordConfirm) return { error: "비밀번호 확인이 일치하지 않습니다." };
  if (formData.get("agree_privacy") !== "on") {
    return { error: "개인정보 수집·이용에 동의해야 가입할 수 있습니다." };
  }
  if (formData.get("agree_guardian") !== "on") {
    return { error: "만 14세 이상 보호자 본인임을 확인해 주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { guardian_name: guardianName, phone },
      emailRedirectTo: `${await siteOrigin()}/auth/callback?next=/mypage`,
    },
  });

  if (error) {
    if (error.code === "weak_password") return { error: "더 안전한 비밀번호를 사용해 주세요." };
    if (error.code === "over_email_send_rate_limit") {
      return { error: "잠시 후 다시 시도해 주세요. (메일 발송 한도 초과)" };
    }
    return { error: "가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." };
  }

  // 이미 가입된 이메일인지 여부는 노출하지 않습니다.
  return {
    success: `${email} 로 인증 메일을 보냈습니다. 메일의 링크를 눌러 가입을 완료해 주세요.`,
  };
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function requestPasswordReset(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
  const email = text(formData, "email");
  if (!email) return { error: "이메일을 입력해 주세요." };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteOrigin()}/auth/callback?next=/reset-password`,
  });

  // 가입 여부와 관계없이 같은 메시지를 보여줍니다.
  return { success: "가입된 이메일이라면 비밀번호 재설정 메일이 발송됩니다." };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
  const password = formData.get("password");
  if (typeof password !== "string" || password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다." };
  }
  if (password !== formData.get("password_confirm")) {
    return { error: "비밀번호 확인이 일치하지 않습니다." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: "비밀번호를 변경하지 못했습니다. 재설정 링크를 다시 요청해 주세요." };
  }
  redirect("/mypage");
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "@/app/actions/auth";
import { FormMessage, SubmitButton } from "@/components/form";
import { PASSWORD_HINT, PASSWORD_MIN } from "@/lib/password";

export function SignupForm() {
  const [state, action] = useActionState(signUp, undefined);

  if (state?.success) return <FormMessage state={state} />;

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="guardian_name" className="label">보호자 이름 *</label>
        <input id="guardian_name" name="guardian_name" required maxLength={50} autoComplete="name" className="input" />
      </div>
      <div>
        <label htmlFor="phone" className="label">보호자 연락처 *</label>
        <input id="phone" name="phone" type="tel" required placeholder="010-0000-0000" pattern="[0-9\-]{9,20}" autoComplete="tel" className="input" />
      </div>
      <div>
        <label htmlFor="email" className="label">이메일 (로그인 아이디) *</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">비밀번호 *</label>
        <input id="password" name="password" type="password" required minLength={PASSWORD_MIN} autoComplete="new-password" aria-describedby="password-hint" className="input" />
        <p id="password-hint" className="mt-1 text-xs text-ink-soft">{PASSWORD_HINT}</p>
      </div>
      <div>
        <label htmlFor="password_confirm" className="label">비밀번호 확인 *</label>
        <input id="password_confirm" name="password_confirm" type="password" required minLength={PASSWORD_MIN} autoComplete="new-password" className="input" />
      </div>

      <div className="space-y-3 rounded-sm bg-cream p-4 text-sm">
        <p className="font-medium">개인정보 수집·이용 동의 (필수)</p>
        <ul className="list-disc space-y-1 pl-5 text-ink-soft">
          <li>수집 항목: 보호자 이름, 연락처, 이메일</li>
          <li>이용 목적: 회원 식별, 입단 신청 및 합창단 운영 안내</li>
          <li>보유 기간: 회원 탈퇴 시까지 (관계 법령에 따라 보관이 필요한 경우 해당 기간)</li>
        </ul>
        <p className="text-ink-soft">
          동의를 거부할 수 있으나, 거부 시 회원가입이 제한됩니다. 자세한 내용은{" "}
          <Link href="/privacy" target="_blank" className="underline">개인정보처리방침</Link>을 확인해 주세요.
        </p>
        <label className="flex items-start gap-2">
          <input type="checkbox" name="agree_privacy" required className="mt-1" />
          <span>개인정보 수집·이용에 동의합니다.</span>
        </label>
        <label className="flex items-start gap-2">
          <input type="checkbox" name="agree_guardian" required className="mt-1" />
          <span>본인은 만 14세 이상이며, 단원(자녀)의 법정대리인(보호자)입니다.</span>
        </label>
      </div>

      <FormMessage state={state} />
      <SubmitButton pendingText="가입 처리 중...">회원가입</SubmitButton>
    </form>
  );
}

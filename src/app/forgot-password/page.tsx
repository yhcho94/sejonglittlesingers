"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import { FormMessage, SubmitButton } from "@/components/form";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(requestPasswordReset, undefined);
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-navy">비밀번호 찾기</h1>
      <div className="card">
        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="label">가입한 이메일</label>
            <input id="email" name="email" type="email" required autoComplete="email" className="input" />
          </div>
          <FormMessage state={state} />
          <SubmitButton pendingText="발송 중...">재설정 메일 받기</SubmitButton>
        </form>
      </div>
    </div>
  );
}

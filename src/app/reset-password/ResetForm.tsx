"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/actions/auth";
import { FormMessage, SubmitButton } from "@/components/form";
import { PASSWORD_HINT, PASSWORD_MIN } from "@/lib/password";

export function ResetForm() {
  const [state, action] = useActionState(updatePassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="password" className="label">새 비밀번호</label>
        <input id="password" name="password" type="password" required minLength={PASSWORD_MIN} autoComplete="new-password" aria-describedby="password-hint" className="input" />
        <p id="password-hint" className="mt-1 text-xs text-ink-soft">{PASSWORD_HINT}</p>
      </div>
      <div>
        <label htmlFor="password_confirm" className="label">새 비밀번호 확인</label>
        <input id="password_confirm" name="password_confirm" type="password" required minLength={PASSWORD_MIN} autoComplete="new-password" className="input" />
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingText="변경 중...">비밀번호 변경</SubmitButton>
    </form>
  );
}

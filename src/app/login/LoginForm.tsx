"use client";

import { useActionState } from "react";
import { signIn } from "@/app/actions/auth";
import { FormMessage, SubmitButton } from "@/components/form";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(signIn, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="label">이메일</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">비밀번호</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingText="로그인 중...">로그인</SubmitButton>
    </form>
  );
}

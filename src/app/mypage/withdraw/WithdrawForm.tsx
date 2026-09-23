"use client";

import { useActionState } from "react";
import { withdraw } from "@/app/actions/account";
import { FormMessage, SubmitButton } from "@/components/form";

export function WithdrawForm() {
  const [state, action] = useActionState(withdraw, undefined);
  return (
    <form action={action} className="space-y-4">
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="confirm" required className="mt-1" />
        <span>위 내용을 확인했으며, 회원 탈퇴와 개인정보 삭제를 요청합니다.</span>
      </label>
      <FormMessage state={state} />
      <SubmitButton className="btn-danger w-full" pendingText="탈퇴 처리 중...">
        회원 탈퇴
      </SubmitButton>
    </form>
  );
}

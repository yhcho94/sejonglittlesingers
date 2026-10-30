"use client";

import { useActionState } from "react";
import { adminSendPasswordReset } from "@/app/actions/admin-roles";

// 최상위 관리자: 회원에게 비밀번호 재설정 메일 보내기 (회원이 메일 링크로 새 비밀번호를 정함)
export function ResetPasswordButton({
  id,
  name,
  email,
}: {
  id: string;
  name: string;
  email: string | null;
}) {
  const [state, action, pending] = useActionState(
    adminSendPasswordReset,
    undefined,
  );
  if (!email) return null;
  return (
    <form action={action} className="flex flex-wrap items-center gap-1">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs text-navy underline disabled:opacity-50"
        onClick={(e) => {
          if (
            !window.confirm(
              `${name} 님(${email})에게 비밀번호 재설정 메일을 보낼까요?\n회원이 메일의 버튼을 눌러 새 비밀번호를 정합니다. 그 전까지 지금 비밀번호는 그대로입니다.`,
            )
          )
            e.preventDefault();
        }}
      >
        {pending ? "보내는 중..." : "비밀번호 재설정 메일"}
      </button>
      {state?.success && (
        <span className="text-xs text-green-700">{state.success}</span>
      )}
      {state?.error && (
        <span className="text-xs text-red-700">{state.error}</span>
      )}
    </form>
  );
}

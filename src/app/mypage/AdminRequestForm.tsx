"use client";

import { useActionState } from "react";
import { requestAdmin } from "@/app/actions/admin-roles";
import { FormMessage, SubmitButton } from "@/components/form";

export function AdminRequestForm() {
  const [state, action] = useActionState(requestAdmin, undefined);
  return (
    <form action={action} className="space-y-3">
      <div>
        <label htmlFor="admin_note" className="label">신청 사유 (선택)</label>
        <textarea
          id="admin_note"
          name="note"
          rows={2}
          maxLength={300}
          placeholder="예: 공연 일정·공지 담당 운영위원입니다"
          className="input"
        />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn-outline" pendingText="신청 중...">관리자 권한 신청</SubmitButton>
    </form>
  );
}

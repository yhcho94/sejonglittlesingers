"use client";

import { useActionState } from "react";
import { reviewApplication } from "@/app/actions/admin";
import { FormMessage, SubmitButton } from "@/components/form";
import { STATUS_LABEL, type ApplicationStatus } from "@/lib/types";

export function ReviewForm({
  id,
  status,
  note,
}: {
  id: number;
  status: ApplicationStatus;
  note: string | null;
}) {
  const [state, action] = useActionState(reviewApplication, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <fieldset className="flex flex-wrap gap-4 text-sm">
        <legend className="label">심사 결과</legend>
        {(["pending", "approved", "rejected"] as const).map((s) => (
          <label key={s} className="flex items-center gap-2">
            <input type="radio" name="status" value={s} defaultChecked={s === status} />
            {STATUS_LABEL[s]}
          </label>
        ))}
      </fieldset>
      <div>
        <label htmlFor="admin_note" className="label">신청자에게 보일 안내 문구 (선택)</label>
        <textarea id="admin_note" name="admin_note" rows={3} maxLength={2000} defaultValue={note ?? ""} className="input" />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary" pendingText="저장 중...">결과 저장</SubmitButton>
    </form>
  );
}

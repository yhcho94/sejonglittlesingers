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
      <p className="rounded-sm bg-gold-soft px-3 py-2 text-xs">
        반려하면 개인정보처리방침에 따라 사진과 상세 정보(학교·학년·주소·경력·지원 동기)가 즉시 삭제되고, 신청
        기록은 5일 후 자동 삭제됩니다. 되돌릴 수 없습니다.
      </p>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary" pendingText="저장 중...">결과 저장</SubmitButton>
    </form>
  );
}

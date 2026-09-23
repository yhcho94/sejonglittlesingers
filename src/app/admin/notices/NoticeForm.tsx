"use client";

import { useActionState } from "react";
import { saveNotice } from "@/app/actions/admin";
import { FormMessage, SubmitButton } from "@/components/form";
import type { Notice } from "@/lib/types";

export function NoticeForm({ notice }: { notice?: Notice }) {
  const [state, action] = useActionState(saveNotice, undefined);
  return (
    <form action={action} className="space-y-4">
      {notice && <input type="hidden" name="id" value={notice.id} />}
      <div>
        <label htmlFor="title" className="label">제목</label>
        <input id="title" name="title" defaultValue={notice?.title} required maxLength={200} className="input" />
      </div>
      <div>
        <label htmlFor="body" className="label">본문</label>
        <textarea id="body" name="body" defaultValue={notice?.body} required rows={14} maxLength={20000} className="input" />
      </div>
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_published" defaultChecked={notice?.is_published ?? true} />
          게시 (해제하면 관리자만 볼 수 있음)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_pinned" defaultChecked={notice?.is_pinned ?? false} />
          상단 고정 (중요)
        </label>
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary" pendingText="저장 중...">저장</SubmitButton>
    </form>
  );
}

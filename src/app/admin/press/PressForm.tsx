"use client";

import { useActionState } from "react";
import { savePress } from "@/app/actions/admin";
import { FormMessage, SubmitButton } from "@/components/form";
import type { Press } from "@/lib/types";

export function PressForm({ item }: { item?: Press }) {
  const [state, action] = useActionState(savePress, undefined);
  return (
    <form action={action} className="space-y-4">
      {item && <input type="hidden" name="id" value={item.id} />}
      <div>
        <label htmlFor="title" className="label">제목 *</label>
        <input id="title" name="title" defaultValue={item?.title} required maxLength={200} className="input" />
      </div>
      <div>
        <label htmlFor="url" className="label">기사 주소 *</label>
        <input id="url" name="url" type="url" required placeholder="https://" defaultValue={item?.url} className="input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="media" className="label">언론사명</label>
          <input id="media" name="media" maxLength={50} defaultValue={item?.media ?? ""} className="input" />
          <p className="mt-1 text-xs text-ink-soft">비우면 기사 주소의 도메인이 표시됩니다.</p>
        </div>
        <div>
          <label htmlFor="published_on" className="label">게시일</label>
          <input id="published_on" name="published_on" type="date" defaultValue={item?.published_on ?? ""} className="input" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_published" defaultChecked={item?.is_published ?? true} />
        게시
      </label>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary" pendingText="저장 중...">저장</SubmitButton>
    </form>
  );
}

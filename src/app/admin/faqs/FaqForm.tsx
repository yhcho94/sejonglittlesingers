"use client";

import { useActionState } from "react";
import { saveFaq } from "@/app/actions/admin";
import { FormMessage, SubmitButton } from "@/components/form";
import type { Faq } from "@/lib/types";

export function FaqForm({ faq }: { faq?: Faq }) {
  const [state, action] = useActionState(saveFaq, undefined);
  return (
    <form action={action} className="space-y-4">
      {faq && <input type="hidden" name="id" value={faq.id} />}
      <div>
        <label htmlFor="question" className="label">질문</label>
        <input id="question" name="question" defaultValue={faq?.question} required maxLength={300} className="input" />
      </div>
      <div>
        <label htmlFor="answer" className="label">답변</label>
        <textarea id="answer" name="answer" defaultValue={faq?.answer} required rows={6} maxLength={4000} className="input" />
      </div>
      <div className="flex flex-wrap items-center gap-6 text-sm">
        <label className="flex items-center gap-2">
          순서
          <input name="sort_order" type="number" defaultValue={faq?.sort_order ?? 0} className="input w-24" />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_published" defaultChecked={faq?.is_published ?? true} />
          게시
        </label>
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary" pendingText="저장 중...">저장</SubmitButton>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { saveSiteLogo } from "@/app/actions/site-logo";
import { FormMessage, SubmitButton } from "@/components/form";

export type LogoOption = { value: string; label: string; note?: string; preview: React.ReactNode };

// 로고 고르기: 머리글(밝은 바탕)과 바닥글(어두운 바탕)에서 어떻게 보이는지 함께 보여 줌
export function LogoChoiceForm({ options, current }: { options: LogoOption[]; current: string }) {
  const [state, action] = useActionState(saveSiteLogo, undefined);
  return (
    <form action={action} className="space-y-4">
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="sr-only">사용할 로고</legend>
        {options.map((o) => (
          <label
            key={o.value}
            className="flex cursor-pointer flex-col gap-3 rounded-sm border border-line bg-white p-4 has-[:checked]:border-navy has-[:checked]:ring-2 has-[:checked]:ring-navy/30"
          >
            <span className="flex items-start gap-2">
              <input type="radio" name="logo" value={o.value} defaultChecked={o.value === current} className="mt-1" />
              <span>
                <span className="font-medium text-navy">{o.label}</span>
                {o.value === current && <span className="ml-2 text-xs font-bold text-gold-deep">사용 중</span>}
                {o.note && <span className="block text-xs text-ink-soft">{o.note}</span>}
              </span>
            </span>
            {o.preview}
          </label>
        ))}
      </fieldset>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary">저장</SubmitButton>
    </form>
  );
}

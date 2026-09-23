"use client";

import { useActionState } from "react";
import { saveRecruitment } from "@/app/actions/admin";
import { FormMessage, SubmitButton } from "@/components/form";
import type { Recruitment } from "@/lib/types";

const FIELDS: { name: keyof Recruitment; label: string; rows: number; hint?: string }[] = [
  { name: "period", label: "모집 기간", rows: 1, hint: "예: 2027년 2월 1일 ~ 2월 20일" },
  { name: "target", label: "모집 대상", rows: 2 },
  { name: "schedule", label: "연습 일정", rows: 2 },
  { name: "place", label: "연습 장소", rows: 2 },
  { name: "fee", label: "회비", rows: 2 },
  { name: "classes", label: "반 구성", rows: 4, hint: "반 이름과 대상 등을 한 줄에 하나씩" },
  { name: "audition", label: "오디션·심사 방법", rows: 4 },
  { name: "notes", label: "기타 안내", rows: 4 },
];

export function RecruitmentForm({ data }: { data: Recruitment | null }) {
  const [state, action] = useActionState(saveRecruitment, undefined);
  return (
    <form action={action} className="space-y-5">
      <label className="flex items-center gap-2 rounded-lg bg-gold-soft p-3 text-sm font-medium">
        <input type="checkbox" name="is_open" defaultChecked={data?.is_open ?? false} />
        지금 단원 모집 중 (홈 화면에 모집 배너가 표시됩니다)
      </label>
      {FIELDS.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="label">{f.label}</label>
          {f.rows === 1 ? (
            <input id={f.name} name={f.name} defaultValue={(data?.[f.name] as string) ?? ""} className="input" />
          ) : (
            <textarea id={f.name} name={f.name} rows={f.rows} defaultValue={(data?.[f.name] as string) ?? ""} className="input" />
          )}
          {f.hint && <p className="mt-1 text-xs text-ink-soft">{f.hint}</p>}
        </div>
      ))}
      <p className="text-xs text-ink-soft">비워 둔 항목은 공개 화면에 표시되지 않습니다.</p>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary" pendingText="저장 중...">저장</SubmitButton>
    </form>
  );
}

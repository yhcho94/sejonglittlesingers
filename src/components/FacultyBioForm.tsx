"use client";

import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/form";
import { BIO_FIELDS, type StaffBio } from "@/lib/staff-bio";
import type { FormState } from "@/lib/types";

// 강사진 소개 약력 입력: 항목마다 빈칸, 한 줄에 하나씩. 비워 두면 표시하지 않음
// (선생님 본인 · 최상위 관리자 공용. 관리자 화면은 이름·역할 등 칸을 children 으로 추가)
export function FacultyBioForm({
  bio,
  action,
  id,
  children,
  submitLabel = "저장",
}: {
  bio: StaffBio;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  id?: number;
  children?: React.ReactNode;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-5">
      {id !== undefined && <input type="hidden" name="id" value={id} />}
      {children}
      {BIO_FIELDS.map((f) => (
        <div key={f.key}>
          <label htmlFor={f.key} className="label">
            {f.label} <span className="font-normal text-ink-soft">(한 줄에 하나씩)</span>
          </label>
          <textarea
            id={f.key}
            name={f.key}
            rows={Math.min(12, Math.max(3, (bio.sections[f.key]?.length ?? 0) * 2))}
            defaultValue={(bio.sections[f.key] ?? []).join("\n")}
            placeholder={`예) ${f.example}`}
            className="input"
          />
        </div>
      ))}
      <div>
        <label htmlFor="website" className="label">
          개인 홈페이지 <span className="font-normal text-ink-soft">(선택)</span>
        </label>
        <input
          id="website"
          name="website"
          type="url"
          inputMode="url"
          defaultValue={bio.website ?? ""}
          placeholder="https://"
          className="input"
        />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary w-full sm:w-auto sm:px-8">{submitLabel}</SubmitButton>
    </form>
  );
}

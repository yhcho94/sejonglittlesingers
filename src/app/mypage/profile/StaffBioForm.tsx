"use client";

import { useActionState } from "react";
import { saveStaffBio } from "@/app/actions/staff-bio";
import { FormMessage, SubmitButton } from "@/components/form";
import { BIO_FIELDS, BIO_INTRO_MAX, type StaffBio } from "@/lib/staff-bio";

// 항목마다 빈칸. 한 줄에 하나씩 입력, 비워 두면 강사진 소개에 표시하지 않음
export function StaffBioForm({ bio }: { bio: StaffBio }) {
  const [state, action] = useActionState(saveStaffBio, undefined);
  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="intro" className="label">
          소개 한마디 <span className="font-normal text-ink-soft">(선택, {BIO_INTRO_MAX}자 이내)</span>
        </label>
        <textarea
          id="intro"
          name="intro"
          rows={3}
          maxLength={BIO_INTRO_MAX}
          defaultValue={bio.intro ?? ""}
          placeholder="예) 아이들이 노래로 마음을 나누는 즐거움을 알도록 함께하겠습니다."
          className="input"
        />
      </div>

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
      <SubmitButton className="btn-primary w-full sm:w-auto sm:px-8">저장</SubmitButton>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { importSingers } from "@/app/actions/singers";
import { FormMessage, SubmitButton } from "@/components/form";

export function ImportForm() {
  const [state, action] = useActionState(importSingers, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="file" className="label">작성한 엑셀 파일 (.xlsx, 2MB 이하)</label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="input"
        />
      </div>
      <FormMessage state={state} />
      {state?.errors && (
        <div className="max-h-96 overflow-auto rounded-sm border border-red-200">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-red-50 text-red-800">
              <tr>
                <th className="px-3 py-2 font-medium">엑셀 줄</th>
                <th className="px-3 py-2 font-medium">이름</th>
                <th className="px-3 py-2 font-medium">오류</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-100">
              {state.errors.map((e) => (
                <tr key={e.line}>
                  <td className="px-3 py-2 tabular-nums">{e.line}</td>
                  <td className="px-3 py-2">{e.name || "-"}</td>
                  <td className="px-3 py-2">{e.messages.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <SubmitButton className="btn-primary" pendingText="확인·등록 중...">
          검사 후 등록
        </SubmitButton>
        {state?.success && (
          <Link href="/admin/singers?status=all" className="btn-outline">
            단원 명부 보기
          </Link>
        )}
      </div>
    </form>
  );
}

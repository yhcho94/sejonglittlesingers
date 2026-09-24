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
      {state?.skipped && state.skipped.length > 0 && (
        <LineTable title={`건너뛴 줄 ${state.skipped.length}개 (등록 안 됨)`} tone="red" lines={state.skipped} />
      )}
      {state?.warnings && state.warnings.length > 0 && (
        <LineTable title={`비우고 등록한 칸 ${state.warnings.length}줄 (단원 관리에서 고칠 수 있음)`} tone="amber" lines={state.warnings} />
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

const TONES = {
  red: { border: "border-red-200", head: "bg-red-50 text-red-800", divide: "divide-red-100" },
  amber: { border: "border-amber-200", head: "bg-amber-50 text-amber-900", divide: "divide-amber-100" },
};

function LineTable({
  title,
  tone,
  lines,
}: {
  title: string;
  tone: "red" | "amber";
  lines: { line: number; name: string; messages: string[] }[];
}) {
  const c = TONES[tone];
  return (
    <details open className={`rounded-sm border ${c.border}`}>
      <summary className={`cursor-pointer px-3 py-2 text-sm font-medium ${c.head}`}>{title}</summary>
      <div className="max-h-80 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-white text-ink-soft">
            <tr>
              <th className="px-3 py-2 font-medium">엑셀 줄</th>
              <th className="px-3 py-2 font-medium">이름</th>
              <th className="px-3 py-2 font-medium">내용</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${c.divide}`}>
            {lines.map((e) => (
              <tr key={e.line}>
                <td className="px-3 py-2 tabular-nums">{e.line}</td>
                <td className="px-3 py-2">{e.name || "-"}</td>
                <td className="px-3 py-2">{e.messages.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

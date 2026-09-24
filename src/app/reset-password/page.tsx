import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = { title: "비밀번호 재설정" };

export default async function ResetPasswordPage() {
  // 재설정 메일 링크를 통해 들어오면 로그인된 상태가 됩니다.
  await requireUser("/reset-password");
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-navy">비밀번호 재설정</h1>
      <div className="card">
        <ResetForm />
      </div>
    </div>
  );
}

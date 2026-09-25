import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "회원가입" };

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold text-navy">회원가입</h1>
      <p className="mb-6 mt-2 text-sm text-ink-soft">
        <strong>학부모</strong>는 보호자 명의로 가입한 뒤 자녀(단원)의 입단 신청을 할 수 있습니다. <strong>선생님</strong>·
        <strong>홈페이지 관리자</strong>는 가입하면 관리자 권한 신청이 함께 접수됩니다.
      </p>
      <div className="card">
        <SignupForm />
      </div>
      <p className="mt-4 text-center text-sm text-ink-soft">
        이미 회원이신가요? <Link href="/login" className="underline">로그인</Link>
      </p>
    </div>
  );
}

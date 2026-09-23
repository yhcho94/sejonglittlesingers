import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "회원가입" };

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-navy">회원가입</h1>
      <p className="mb-6 mt-2 text-sm text-ink-soft">
        회원가입은 <strong>보호자 명의</strong>로 진행합니다. 가입 후 자녀(단원)의 입단 신청을 할 수 있습니다.
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

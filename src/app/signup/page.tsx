import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "운영진 회원가입" };

// 회원가입은 합창단 운영진만 받습니다. 보호자는 회원가입 없이 입단 신청서를 냅니다.
export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold text-navy">운영진 회원가입</h1>
      <p className="mb-6 mt-2 text-sm text-ink-soft">
        합창단 <strong>운영진</strong>(단장·선생님·사무국·학부모 대표·홈페이지 관리자 등)만 가입합니다. 가입하면 관리자 권한 신청이
        함께 접수되고, 최상위 관리자가 역할·반을 확인해 승인합니다.
      </p>
      <p className="mb-6 rounded-sm bg-cream px-3 py-2 text-sm">
        입단을 신청하시는 보호자께서는 회원가입 없이{" "}
        <Link href="/apply" className="font-medium text-navy underline">입단 신청서</Link>를 바로 작성해 주세요.
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

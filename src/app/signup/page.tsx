import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "회원가입" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { type } = await searchParams;
  const staff = type === "staff";
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold text-navy">{staff ? "운영진 회원가입" : "회원가입"}</h1>
      <p className="mb-6 mt-2 text-sm text-ink-soft">
        {staff ? (
          <>
            합창단 <strong>운영진</strong>(단장·선생님·사무국·홈페이지 관리자 등)은 역할을 골라 가입해 주세요. 가입하면 관리자 권한
            신청이 함께 접수되고, 최상위 관리자가 맡을 메뉴를 정해 승인합니다.
          </>
        ) : (
          <>
            <strong>보호자(학부모)</strong> 명의로 가입한 뒤 자녀(단원)의 입단 신청을 할 수 있습니다. 합창단 운영진은{" "}
            <Link href="/signup?type=staff" className="underline">운영진 회원가입</Link>을 이용해 주세요.
          </>
        )}
      </p>
      <div className="card">
        <SignupForm key={staff ? "staff" : "parent"} initialKind={staff ? "staff" : "parent"} />
      </div>
      <p className="mt-4 text-center text-sm text-ink-soft">
        이미 회원이신가요? <Link href="/login" className="underline">로그인</Link>
      </p>
    </div>
  );
}

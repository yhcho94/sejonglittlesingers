import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ApplyForm } from "./ApplyForm";

export const metadata: Metadata = {
  title: "입단 신청",
  description: "세종리틀싱어즈 입단 신청서. 회원가입 없이 보호자가 바로 신청할 수 있습니다.",
  alternates: { canonical: "/apply" },
};

// 회원가입 없이 보호자가 바로 신청 (보호자 인적사항은 신청서에서 받음)
export default function ApplyPage() {
  return (
    <>
      <PageHeader eyebrow="Application" title="입단 신청" description="회원가입 없이 보호자가 자녀(단원)의 입단을 신청합니다." />
      <div className="mx-auto max-w-2xl px-4 py-7">
        <div className="card">
          <ApplyForm />
        </div>
      </div>
    </>
  );
}

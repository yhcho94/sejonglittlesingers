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
      <PageHeader eyebrow="Application" title="입단 신청" description="회원가입 없이 보호자가 자녀(단원)의 입단을 신청합니다.">
        {/* 입단 신청 접수 시기 */}
        <section className="rounded-sm border border-gold/60 bg-white p-4 text-sm leading-relaxed md:p-5">
          <h2 className="font-semibold text-navy">📢 입단 신청</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="font-semibold">▪ 유치부</p>
              <ul className="mt-1 space-y-0.5 pl-3 text-ink-soft">
                <li>- 상반기 입단: 12월 1일부터 접수</li>
                <li>- 하반기 입단: 8월 1일부터 접수</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">▪ 초등부</p>
              <ul className="mt-1 space-y-0.5 pl-3 text-ink-soft">
                <li>- 연중 수시 입단 신청 가능</li>
              </ul>
            </div>
          </div>
        </section>
      </PageHeader>
      <div className="mx-auto max-w-2xl px-4 py-7">
        <div className="card">
          <ApplyForm />
        </div>
      </div>
    </>
  );
}

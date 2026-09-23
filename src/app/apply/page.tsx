import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/auth";
import { ApplyForm } from "./ApplyForm";

export const metadata: Metadata = { title: "입단 신청" };

export default async function ApplyPage() {
  const { user, profile } = await requireUser("/apply");

  return (
    <>
      <PageHeader title="입단 신청" description="보호자 회원이 자녀(단원)의 입단을 신청합니다." />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="mb-4 text-sm text-ink-soft">
          신청 보호자: <strong className="text-ink">{profile?.guardian_name}</strong> ({profile?.phone})
        </p>
        <div className="card">
          <ApplyForm userId={user.id} />
        </div>
      </div>
    </>
  );
}

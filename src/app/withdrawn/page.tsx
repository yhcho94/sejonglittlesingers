import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "탈퇴 완료", robots: { index: false } };

export default function WithdrawnPage() {
  return (
    <>
      <PageHeader eyebrow="Goodbye" title="회원 탈퇴가 완료되었습니다" />
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="leading-relaxed text-ink-soft">
          회원 정보와 입단 신청 내역, 첨부 사진을 삭제했습니다. 그동안 세종리틀싱어즈와 함께해 주셔서 감사합니다.
        </p>
        <Link href="/" className="btn-primary mt-8">
          홈으로
        </Link>
      </div>
    </>
  );
}

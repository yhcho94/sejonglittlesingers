import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { AUDITION_EMAIL, AUDITION_GUIDE } from "@/lib/application-fields";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "입단 신청 완료", robots: { index: false } };

// 입단 신청 완료 안내 (개인정보는 주소·화면에 싣지 않음)
export default function ApplyDonePage() {
  return (
    <>
      <PageHeader eyebrow="Application" title="입단 신청이 접수되었습니다" />
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-7">
        <section className="card space-y-3">
          <h2 className="text-lg font-semibold text-navy">다음 단계: 오디션 동영상 보내기</h2>
          <p>
            오디션 동영상을 <strong>{AUDITION_EMAIL}</strong> 로 보내 주세요. 영상까지 받아야 심사가 시작됩니다.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">
            {AUDITION_GUIDE.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <a href={`mailto:${AUDITION_EMAIL}?subject=${encodeURIComponent("[입단 오디션] 단원이름 (생년월일)")}`} className="btn-primary inline-block">
            메일 쓰기
          </a>
        </section>
        <section className="card space-y-2 text-sm">
          <h2 className="text-lg font-semibold text-navy">심사 결과 안내</h2>
          <p>심사 결과는 신청서에 적어 주신 보호자 연락처로 전화·문자·카카오톡으로 알려 드립니다.</p>
          <p className="text-ink-soft">
            신청 내용을 고치거나 취소하려면 합창단에 연락해 주세요. 입단 문의: 단장 {site.contact.phone} (문자 메시지)
          </p>
        </section>
        <p className="text-center">
          <Link href="/join" className="text-sm text-navy underline">입단 안내로 돌아가기</Link>
        </p>
      </div>
    </>
  );
}

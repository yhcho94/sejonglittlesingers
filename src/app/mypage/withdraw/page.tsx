import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/auth";
import { site } from "@/lib/site";
import { WithdrawForm } from "./WithdrawForm";

export const metadata: Metadata = { title: "회원 탈퇴" };

export default async function WithdrawPage() {
  const { profile } = await requireUser("/mypage/withdraw");
  return (
    <>
      <PageHeader eyebrow="My Page" title="회원 탈퇴" />
      <div className="mx-auto max-w-2xl px-4 py-7">
        <section className="card space-y-6">
          <div>
            <h2 className="font-bold text-navy">탈퇴하면 바로 삭제되는 정보</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
              <li>
                회원 정보: 보호자 이름, 연락처, 이메일({profile?.email}), 로그인 정보
              </li>
              <li>입단 신청 내역과 첨부한 사진 (심사 중·승인·반려 모두)</li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-navy">함께 알아 두실 점</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-soft">
              <li>삭제된 정보는 되돌릴 수 없습니다. 다시 이용하려면 새로 가입해야 합니다.</li>
              <li>
                자녀가 현재 단원인 경우, 합창단 운영을 위한 단원 명부(이름·반 등)는 탈퇴와 별개로 퇴단 후 1년까지
                보관되며 보호자 회원 연결만 해제됩니다. 단원 정보 삭제를 원하시면 아래 연락처로 요청해 주세요.
              </li>
              <li>보안 기록(접속 기록)은 서비스 제공자 정책에 따라 짧은 기간(최대 1일) 뒤 자동 삭제됩니다.</li>
            </ul>
          </div>
          <div className="border-t border-line pt-6">
            <WithdrawForm />
          </div>
          <p className="text-center text-xs text-ink-soft">
            문의: {site.contact.phone} · {site.contact.email}
          </p>
        </section>
        <p className="mt-6 text-center text-sm">
          <Link href="/mypage" className="text-ink-soft hover:underline">
            ← 마이페이지로 돌아가기
          </Link>
        </p>
      </div>
    </>
  );
}

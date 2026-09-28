"use client";

import { usePathname } from "next/navigation";
import { mailHref, site } from "@/lib/site";
import { KakaoIcon } from "./SocialLinks";

// 화면 오른쪽 아래에 항상 떠 있는 문의 버튼: 카카오 채널 · 이메일 (관리자 화면·인쇄에서는 숨김)
export function FloatingContact() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const item =
    "flex h-12 w-12 items-center justify-center rounded-full shadow-lg ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";
  return (
    <div
      data-print-hide
      className="fixed right-[max(0.75rem,env(safe-area-inset-right))] bottom-[calc(6rem+env(safe-area-inset-bottom))] z-30 flex flex-col gap-2.5 lg:right-6 lg:bottom-28"
    >
      <a
        href={site.links.kakao}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="카카오 채널로 문의 (새 창)"
        title="카카오 채널 문의"
        className={`${item} bg-[#FEE500]`}
      >
        <KakaoIcon className="h-9 w-9" bare />
      </a>
      <a href={mailHref} aria-label={`이메일 문의 (${site.contact.email})`} title="이메일 문의" className={`${item} bg-navy text-white`}>
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
          <rect x="3" y="5.5" width="18" height="13" rx="2" />
          <path d="M3.5 7l8.5 6 8.5-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  );
}

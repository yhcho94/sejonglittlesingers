"use client";

import { useState } from "react";

// 홈페이지 주소 복사 버튼
export function CopyLinkButton({ className = "", showLabel = false }: { className?: string; showLabel?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // 클립보드 권한이 없는 환경(일부 인앱 브라우저)용 대체 방법
      const input = document.createElement("textarea");
      input.value = url;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      title="홈페이지 주소 복사"
      aria-label={copied ? "주소가 복사되었습니다" : "홈페이지 주소 복사"}
      className={`relative inline-flex items-center gap-2 transition ${className}`}
    >
      {copied ? (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" strokeLinecap="round" />
          <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" strokeLinecap="round" />
        </svg>
      )}
      {showLabel && <span>{copied ? "복사됨" : "주소 복사"}</span>}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "홈페이지 주소가 복사되었습니다" : ""}
      </span>
      {copied && !showLabel && (
        <span className="pointer-events-none absolute right-0 top-full z-50 mt-2 whitespace-nowrap bg-navy px-2.5 py-1 text-xs text-white">
          주소가 복사되었습니다
        </span>
      )}
    </button>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// 크롬·엣지·삼성인터넷이 설치 가능할 때 보내는 이벤트 (표준 타입에 아직 없음)
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Mode = "hidden" | "prompt" | "ios" | "guide";

function detectMode(): Mode {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return "hidden"; // 이미 설치된 앱으로 열림
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  return isIOS ? "ios" : "guide";
}

function InstallIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M12 7.5v7m0 0l-3-3m3 3l3-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 18.5h3" strokeLinecap="round" />
    </svg>
  );
}

// variant: text(글자만) · inline(아이콘+글자) · stacked(아이콘 아래 짧은 글자, 휴대폰 머리글)
export function InstallButton({
  className = "",
  variant = "text",
}: {
  className?: string;
  variant?: "text" | "inline" | "stacked";
}) {
  const label =
    variant === "stacked" ? (
      <>
        <InstallIcon className="h-5 w-5 text-navy" />
        <span className="text-[10px] leading-none font-medium">앱 설치</span>
      </>
    ) : variant === "inline" ? (
      <>
        <InstallIcon className="h-4 w-4" />
        <span>앱 설치</span>
      </>
    ) : (
      "홈 화면에 앱 설치"
    );
  const layout = variant === "stacked" ? "inline-flex flex-col items-center gap-0.5" : variant === "inline" ? "inline-flex items-center gap-1.5" : "";
  const [mode, setMode] = useState<Mode>("hidden");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // 브라우저 환경을 확인한 뒤에만 버튼을 보여줍니다. (서버 렌더링과 불일치 방지)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(detectMode());

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setMode("prompt");
    };
    const onInstalled = () => {
      setDeferred(null);
      setMode("hidden");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (mode === "hidden") return null;

  if (mode === "prompt" && deferred) {
    return (
      <button
        type="button"
        className={`${layout} ${className}`}
        aria-label="홈 화면에 앱 설치"
        onClick={async () => {
          await deferred.prompt();
          await deferred.userChoice;
          setDeferred(null);
          setMode("guide");
        }}
      >
        {label}
      </button>
    );
  }

  // 아이폰(사파리)은 설치 버튼을 제공하지 않으므로 방법을 안내합니다.
  return (
    <Link
      href={mode === "ios" ? "/install#iphone" : "/install"}
      className={`${layout} ${className}`}
      aria-label="홈 화면에 앱 설치 방법"
    >
      {label}
    </Link>
  );
}

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

export function InstallButton({ className = "" }: { className?: string }) {
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
        className={className}
        onClick={async () => {
          await deferred.prompt();
          await deferred.userChoice;
          setDeferred(null);
          setMode("guide");
        }}
      >
        홈 화면에 앱 설치
      </button>
    );
  }

  // 아이폰(사파리)은 설치 버튼을 제공하지 않으므로 방법을 안내합니다.
  return (
    <Link href={mode === "ios" ? "/install#iphone" : "/install"} className={className}>
      홈 화면에 앱 설치
    </Link>
  );
}

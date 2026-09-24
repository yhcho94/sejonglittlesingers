"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ensureVisitRecorded } from "@/lib/visits";

// 어느 페이지로 들어와도 방문 1회를 기록 (관리자 화면 제외, 화면에는 아무것도 표시하지 않음)
export function VisitRecorder() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  useEffect(() => {
    if (!isAdmin) void ensureVisitRecorded();
  }, [isAdmin]);
  return null;
}

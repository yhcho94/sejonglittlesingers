"use client";

import { useEffect, useState } from "react";
import { ensureVisitRecorded, type VisitStats } from "@/lib/visits";

// 오늘 · 전체 방문자 수
export function VisitorCounter({ className = "" }: { className?: string }) {
  const [stats, setStats] = useState<VisitStats | null>(null);
  useEffect(() => {
    let alive = true;
    ensureVisitRecorded().then((s) => alive && setStats(s));
    return () => {
      alive = false;
    };
  }, []);
  if (!stats) return null;
  const n = (v: number) => v.toLocaleString("ko-KR");
  return (
    <p className={className} aria-label={`오늘 방문자 ${n(stats.today)}명, 전체 방문자 ${n(stats.total)}명`}>
      <span>
        오늘 <strong className="font-semibold tabular-nums">{n(stats.today)}</strong>
      </span>
      <span className="mx-2 opacity-40" aria-hidden>
        |
      </span>
      <span>
        전체 <strong className="font-semibold tabular-nums">{n(stats.total)}</strong>
      </span>
    </p>
  );
}

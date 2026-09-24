"use client";

import { useEffect, useState } from "react";
import { ensureVisitRecorded, type VisitStats } from "@/lib/visits";

// 방문수: 오늘 · 전체
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
    <p className={className} aria-label={`방문수 오늘 ${n(stats.today)}, 전체 ${n(stats.total)}`}>
      방문수
      <span className="ml-3">
        오늘 <strong className="font-semibold tabular-nums">{n(stats.today)}</strong>
      </span>
      <span className="ml-3">
        전체 <strong className="font-semibold tabular-nums">{n(stats.total)}</strong>
      </span>
    </p>
  );
}

import { history, type HistoryItem } from "@/lib/history";

const BADGE: Record<NonNullable<HistoryItem["kind"]>, { label: string; className: string }> = {
  milestone: { label: "창단", className: "bg-navy text-white" },
  award: { label: "수상", className: "bg-gold text-ink" },
  album: { label: "앨범", className: "bg-gold-soft text-ink" },
};

// 연도별 공연 이력. 최근 연도만 펼쳐 두고 이전 연도는 접어 둡니다.
export function PerformanceHistory() {
  return (
    <div className="divide-y divide-line border border-line bg-white">
      {history.map(({ year, items }, index) => (
        <details key={year} open={index === 0} className="group px-5 py-4 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between">
            <span className="text-lg font-bold text-navy">
              {year}
              <span className="ml-2 text-sm font-normal text-ink-soft">{items.length}건</span>
            </span>
            <span className="text-ink-soft transition group-open:rotate-45" aria-hidden>
              +
            </span>
          </summary>
          <ol className="mt-4 space-y-3 border-l-2 border-line pl-5">
            {items.map((item) => (
              <li key={`${item.date}-${item.title}`} className="relative">
                <span
                  className={`absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white ${
                    item.kind ? "bg-gold" : "bg-navy/40"
                  }`}
                  aria-hidden
                />
                <div className="grid grid-cols-[2.75rem_1fr] items-baseline gap-x-3 sm:grid-cols-[3.25rem_1fr]">
                  <span className="text-sm tabular-nums text-ink-soft">{item.date}</span>
                  <div className="min-w-0">
                    <span className="font-medium">
                      {item.kind && (
                        <span className={`mr-2 px-1.5 py-0.5 text-xs font-bold ${BADGE[item.kind].className}`}>
                          {BADGE[item.kind].label}
                        </span>
                      )}
                      {item.title}
                    </span>
                    {item.place && (
                      <span className="mt-0.5 block text-sm text-ink-soft sm:ml-2 sm:mt-0 sm:inline">{item.place}</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </details>
      ))}
    </div>
  );
}

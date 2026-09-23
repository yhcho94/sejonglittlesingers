import Link from "next/link";
import { CLASS_NAMES, STATUS_LABEL, VIEWS, filterToQuery, type RosterFilter, type View } from "@/lib/singers";

// 상태별 보기로 갈 때는 모든 상태를, 상태별 보기에서 나올 때는 다시 '활동' 단원만 보여줍니다.
function switchView(f: RosterFilter, view: View): RosterFilter {
  if (view === "status") return { ...f, view, status: "all" };
  if (f.view === "status") return { ...f, view, status: "active" };
  return { ...f, view };
}

// 조회 방법(보기) 탭 + 반·상태·검색 필터. 주소(쿼리)로 동작하므로 링크를 공유·새로고침해도 유지됩니다.
export function RosterFilters({
  filter,
  basePath,
  views = Object.keys(VIEWS) as View[],
  extraQuery = {},
  children,
}: {
  filter: RosterFilter;
  basePath: string;
  views?: View[];
  extraQuery?: Record<string, string>;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 space-y-4 print:hidden">
      {views.length > 1 && (
        <div className="flex flex-wrap gap-1 border-b border-line text-sm" role="tablist" aria-label="조회 방법">
          {views.map((v) => (
            <Link
              key={v}
              href={`${basePath}${filterToQuery(switchView(filter, v), extraQuery)}`}
              role="tab"
              aria-selected={v === filter.view}
              className={
                v === filter.view
                  ? "-mb-px border-b-2 border-navy px-3 py-2 font-bold text-navy"
                  : "px-3 py-2 text-ink-soft hover:text-navy"
              }
            >
              {VIEWS[v]}
            </Link>
          ))}
        </div>
      )}
      <form action={basePath} className="flex flex-wrap items-end gap-3">
        {filter.view !== "all" && <input type="hidden" name="view" value={filter.view} />}
        <div>
          <label htmlFor="f-class" className="label text-xs">반</label>
          <select id="f-class" name="class" defaultValue={filter.className} className="input w-32">
            <option value="">전체</option>
            {CLASS_NAMES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-status" className="label text-xs">상태</label>
          <select id="f-status" name="status" defaultValue={filter.status || "all"} className="input w-32">
            <option value="all">전체</option>
            {Object.entries(STATUS_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-40 flex-1 sm:max-w-64">
          <label htmlFor="f-q" className="label text-xs">검색</label>
          <input id="f-q" name="q" defaultValue={filter.q} placeholder="이름·학교·보호자" className="input" />
        </div>
        {children}
        <button className="btn-outline">조회</button>
      </form>
    </div>
  );
}

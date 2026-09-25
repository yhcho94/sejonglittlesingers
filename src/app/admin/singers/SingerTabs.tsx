import Link from "next/link";

const TABS = [
  { key: "list", href: "/admin/singers", label: "단원 명부" },
  { key: "photos", href: "/admin/singers/photos", label: "사진 명부" },
  { key: "stats", href: "/admin/singers/stats", label: "통계" },
  { key: "import", href: "/admin/singers/import", label: "엑셀 일괄 등록" },
  { key: "link", href: "/admin/singers/link", label: "보호자 연결" },
] as const;

// 단원 관리 하위 메뉴
export function SingerTabs({ active }: { active: (typeof TABS)[number]["key"] }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 print:hidden">
      <div>
        <h1 className="text-2xl font-bold text-navy">단원 관리</h1>
        <nav className="mt-3 flex flex-wrap gap-1 text-sm">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              aria-current={t.key === active ? "page" : undefined}
              className={
                t.key === active
                  ? "rounded-sm bg-navy px-3 py-1.5 text-white"
                  : "rounded-sm border border-line bg-white px-3 py-1.5 hover:border-navy"
              }
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
      <Link href="/admin/singers/new" className="btn-primary">
        + 단원 등록
      </Link>
    </div>
  );
}

export function MigrationNotice() {
  return (
    <p className="card border-amber-300 bg-amber-50 text-sm">
      단원 정보를 불러오지 못했습니다. Supabase SQL Editor 에서 <code>supabase/migrations</code> 의 SQL(0005~0012)을 모두
      실행했는지 확인해 주세요.
    </p>
  );
}

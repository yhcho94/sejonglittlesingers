import type { Metadata } from "next";
import Link from "next/link";
import { canAccess, type AdminGate } from "@/lib/admin-perms";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
};

// gate: 이 메뉴를 보려면 필요한 권한 (최상위 관리자는 모두)
const NAV: { href: string; label: string; gate?: AdminGate }[] = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/applications", label: "입단 신청", gate: "applications" },
  { href: "/admin/singers", label: "단원 관리", gate: "singers" },
  { href: "/admin/members", label: "보호자 회원", gate: "members" },
  { href: "/admin/staff", label: "운영진 회원", gate: "members" },
  { href: "/admin/recruitment", label: "입단 안내", gate: "recruitment" },
  { href: "/admin/faqs", label: "FAQ", gate: "recruitment" },
  { href: "/admin/concerts", label: "공연 일정", gate: "concerts" },
  { href: "/admin/gallery", label: "사진 갤러리", gate: "gallery" },
  { href: "/admin/notices", label: "공지사항", gate: "notices" },
  { href: "/admin/press", label: "보도자료", gate: "press" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { profile } = await requireAdmin();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav data-print-hide className="mb-8 flex flex-wrap gap-2 border-b border-line pb-4 text-sm">
        {NAV.filter((item) => canAccess(profile, item.gate)).map((item) => (
          <Link key={item.href} href={item.href} className="rounded-sm px-3 py-1.5 hover:bg-white">
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}

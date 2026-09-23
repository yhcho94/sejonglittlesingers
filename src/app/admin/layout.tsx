import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/applications", label: "입단 신청" },
  { href: "/admin/members", label: "회원 관리" },
  { href: "/admin/recruitment", label: "입단 안내" },
  { href: "/admin/faqs", label: "FAQ" },
  { href: "/admin/concerts", label: "공연 일정" },
  { href: "/admin/notices", label: "공지사항" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-8 flex flex-wrap gap-2 border-b border-line pb-4 text-sm">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-lg px-3 py-1.5 hover:bg-white">
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}

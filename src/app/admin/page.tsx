import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

async function count(table: "applications" | "profiles" | "notices", status?: string) {
  const supabase = await createClient();
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (status) query = query.eq("status", status);
  const { count } = await query;
  return count ?? 0;
}

export default async function AdminHome() {
  await requireAdmin();
  const [pending, approved, members, notices] = await Promise.all([
    count("applications", "pending"),
    count("applications", "approved"),
    count("profiles"),
    count("notices"),
  ]);

  const stats = [
    { label: "심사 대기 신청", value: pending, href: "/admin/applications?status=pending" },
    { label: "승인된 단원", value: approved, href: "/admin/applications?status=approved" },
    { label: "보호자 회원", value: members, href: "/admin/members" },
    { label: "공지사항", value: notices, href: "/admin/notices" },
  ];

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-navy">관리자 대시보드</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card hover:border-navy">
            <p className="text-sm text-ink-soft">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-navy">{s.value}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

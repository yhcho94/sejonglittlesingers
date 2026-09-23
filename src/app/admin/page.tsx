import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { runRetention } from "@/lib/storage-cleanup";
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
  // 예약 작업의 보조: 기한이 지난 정보 파기와 사진 파일 정리를 관리자 권한으로 한 번 더 실행
  // (예약 작업이 설정되지 않았거나 실패한 경우에도 파기가 늦어지지 않도록)
  const supabase = await createClient();
  await runRetention(supabase).catch(() => null);
  const { count: pendingFiles } = await supabase.from("storage_cleanup").select("id", { count: "exact", head: true });
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
      {(pendingFiles ?? 0) > 0 && (
        <p className="mt-6 rounded-sm bg-amber-50 px-4 py-3 text-sm text-amber-900">
          삭제 대기 중인 사진 파일이 {pendingFiles}건 있습니다. 매일 새벽 예약 작업에서 삭제됩니다. 계속 남아 있으면 Vercel
          환경변수 SUPABASE_SECRET_KEY · CRON_SECRET 설정을 확인해 주세요.
        </p>
      )}
    </>
  );
}

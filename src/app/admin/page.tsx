import Link from "next/link";
import { areaLabels, canAccess, isSuperAdmin } from "@/lib/admin-perms";
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

// 회원 구분별 수 (0021 실행 전이면 전체 회원을 보호자로)
// 학부모 대표·부대표는 보호자이면서 운영진이므로 양쪽에 모두 셉니다.
async function countMembers() {
  const supabase = await createClient();
  const [staff, reps, all] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).in("member_type", ["teacher", "staff"]),
    supabase.from("profiles").select("id", { count: "exact", head: true }).not("parent_rep_class", "is", null),
    count("profiles"),
  ]);
  const staffCount = staff.error ? 0 : (staff.count ?? 0);
  const repCount = reps.error ? 0 : (reps.count ?? 0);
  return { parents: all - staffCount, staff: staffCount + repCount };
}

export default async function AdminHome({ searchParams }: PageProps<"/admin">) {
  const { profile } = await requireAdmin();
  const { denied } = await searchParams;
  const superAdmin = isSuperAdmin(profile);
  // 예약 작업의 보조: 기한이 지난 정보 파기와 사진 파일 정리를 관리자 권한으로 한 번 더 실행
  // (예약 작업이 설정되지 않았거나 실패한 경우에도 파기가 늦어지지 않도록)
  const supabase = await createClient();
  await runRetention(supabase).catch(() => null);
  const { count: pendingFiles } = await supabase.from("storage_cleanup").select("id", { count: "exact", head: true });
  const [pending, approved, members, notices] = await Promise.all([
    count("applications", "pending"),
    count("applications", "approved"),
    countMembers(),
    count("notices"),
  ]);

  // 본인 권한이 있는 메뉴의 숫자만 표시
  const stats = [
    { label: "심사 대기 신청", value: pending, href: "/admin/applications?status=pending", gate: "applications" as const },
    { label: "승인된 단원", value: approved, href: "/admin/applications?status=approved", gate: "applications" as const },
    { label: "보호자 회원", value: members.parents, href: "/admin/members", gate: "members" as const },
    { label: "운영진 회원", value: members.staff, href: "/admin/staff", gate: "members" as const },
    { label: "공지사항", value: notices, href: "/admin/notices", gate: "notices" as const },
  ].filter((s) => canAccess(profile, s.gate));

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold text-navy">관리자 대시보드</h1>
      <p className="mb-6 text-sm text-ink-soft">
        {superAdmin
          ? "최상위 관리자: 모든 메뉴와 회원 관리(관리자 승인·권한 부여)를 사용할 수 있습니다."
          : `내 관리 권한: ${areaLabels(profile?.admin_perms).join(", ") || "없음 (최상위 관리자에게 권한을 요청해 주세요)"}`}
      </p>
      {denied && (
        <p className="mb-6 rounded-sm bg-amber-50 px-4 py-3 text-sm text-amber-900">
          해당 메뉴의 권한이 없습니다. 필요하면 최상위 관리자에게 권한을 요청해 주세요.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card hover:border-navy">
            <p className="text-sm text-ink-soft">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-navy">{s.value}</p>
          </Link>
        ))}
      </div>
      {superAdmin && (pendingFiles ?? 0) > 0 && (
        <p className="mt-6 rounded-sm bg-amber-50 px-4 py-3 text-sm text-amber-900">
          삭제 대기 중인 사진 파일이 {pendingFiles}건 있습니다. 매일 새벽 예약 작업에서 삭제됩니다. 계속 남아 있으면 Vercel
          환경변수 SUPABASE_SECRET_KEY · CRON_SECRET 설정을 확인해 주세요.
        </p>
      )}
    </>
  );
}

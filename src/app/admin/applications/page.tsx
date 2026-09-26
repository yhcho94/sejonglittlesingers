import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { PURGE_REASON_TEXT, loadPurgeSchedule, purgeLabel } from "@/lib/purge-schedule";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABEL, type Application, type ApplicationStatus } from "@/lib/types";

type Row = Pick<Application, "id" | "child_name" | "child_birthdate" | "status" | "created_at"> & {
  guardian: { guardian_name: string; phone: string } | null;
};

const FILTERS: (ApplicationStatus | "all")[] = ["all", "pending", "approved", "rejected"];

export default async function AdminApplicationsPage({
  searchParams,
}: PageProps<"/admin/applications">) {
  await requireAdmin("applications");
  const { status } = await searchParams;
  const filter = FILTERS.includes(status as ApplicationStatus) ? (status as ApplicationStatus) : "all";

  const supabase = await createClient();
  // 반려 후 5일이 지난 신청 기록 정리 (개인정보처리방침의 파기 기한)
  await supabase.rpc("purge_rejected_applications");
  let query = supabase
    .from("applications")
    .select("id, child_name, child_birthdate, status, created_at, guardian:profiles!applications_guardian_id_fkey(guardian_name, phone)")
    .order("created_at", { ascending: false });
  if (filter !== "all") query = query.eq("status", filter);
  const [{ data: rows }, purge] = await Promise.all([query.returns<Row[]>(), loadPurgeSchedule(supabase)]);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-navy">입단 신청 관리</h1>
      {purge.size > 0 && (
        <div className="mb-4 rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">한 달 안에 자동 삭제될 입단 신청이 {purge.size}건 있습니다.</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            <li>심사 대기 신청은 신청일부터 6개월, 승인 후 단원 명부에 등록하지 않은 신청은 승인일부터 3개월이 지나면 개인정보처리방침에 따라 새벽 예약 작업에서 삭제됩니다.</li>
            <li>계속 필요한 신청이면 기한 전에 심사(승인·반려)하거나 단원 명부에 등록해 주세요. 삭제된 신청은 되살릴 수 없습니다.</li>
          </ul>
        </div>
      )}
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/admin/applications" : `/admin/applications?status=${f}`}
            className={`rounded-full border px-3 py-1 ${f === filter ? "border-navy bg-navy text-white" : "border-line bg-white"}`}
          >
            {f === "all" ? "전체" : STATUS_LABEL[f]}
          </Link>
        ))}
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line bg-cream text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">단원 이름</th>
              <th className="px-4 py-3 font-medium">생년월일</th>
              <th className="px-4 py-3 font-medium">보호자</th>
              <th className="px-4 py-3 font-medium">신청일</th>
              <th className="px-4 py-3 font-medium">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {!rows?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-soft">신청 내역이 없습니다.</td>
              </tr>
            )}
            {rows?.map((r) => (
              <tr key={r.id} className="hover:bg-cream/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/applications/${r.id}`} className="font-medium text-navy hover:underline">
                    {r.child_name}
                  </Link>
                </td>
                <td className="px-4 py-3">{r.child_birthdate}</td>
                <td className="px-4 py-3">
                  {r.guardian?.guardian_name} <span className="text-ink-soft">{r.guardian?.phone}</span>
                </td>
                <td className="px-4 py-3">{formatDate(r.created_at)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                  {purge.get(r.id) && (
                    <p
                      className="mt-1 text-xs font-medium text-amber-800"
                      title={PURGE_REASON_TEXT[purge.get(r.id)!.reason]}
                    >
                      {purgeLabel(purge.get(r.id)!)}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

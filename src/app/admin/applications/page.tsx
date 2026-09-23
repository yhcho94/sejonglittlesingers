import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABEL, type Application, type ApplicationStatus } from "@/lib/types";

type Row = Pick<Application, "id" | "child_name" | "child_birthdate" | "status" | "created_at"> & {
  guardian: { guardian_name: string; phone: string } | null;
};

const FILTERS: (ApplicationStatus | "all")[] = ["all", "pending", "approved", "rejected"];

export default async function AdminApplicationsPage({
  searchParams,
}: PageProps<"/admin/applications">) {
  await requireAdmin();
  const { status } = await searchParams;
  const filter = FILTERS.includes(status as ApplicationStatus) ? (status as ApplicationStatus) : "all";

  const supabase = await createClient();
  let query = supabase
    .from("applications")
    .select("id, child_name, child_birthdate, status, created_at, guardian:profiles!applications_guardian_id_fkey(guardian_name, phone)")
    .order("created_at", { ascending: false });
  if (filter !== "all") query = query.eq("status", filter);
  const { data: rows } = await query.returns<Row[]>();

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-navy">입단 신청 관리</h1>
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
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

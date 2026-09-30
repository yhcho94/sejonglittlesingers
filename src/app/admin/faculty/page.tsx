import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { facultyGroupOf, sortFaculty } from "@/lib/faculty";
import { createClient } from "@/lib/supabase/server";

// 최상위 관리자: 강사진 소개 약력 목록 (선생님 본인도 마이페이지에서 고칠 수 있음)
export default async function AdminFacultyPage() {
  await requireAdmin("members");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faculty_bios")
    .select("id, name, role, class_name, sort_order, updated_at");
  const rows = sortFaculty(data ?? []);

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-navy">강사진 소개</h1>
        <Link href="/admin/faculty/new" className="btn-primary px-4 py-2 text-sm">
          강사 추가
        </Link>
      </div>
      <p className="mb-6 text-sm text-ink-soft">
        홈페이지 &lsquo;강사진 소개&rsquo;에 나오는 약력입니다. 비워 둔 항목은 표시되지 않습니다. 조직도 게시가 승인된
        선생님은 마이페이지 → 강사 프로필에서 본인 약력(이름이 같은 줄)을 직접 고칠 수 있습니다.
      </p>
      {error ? (
        <p className="rounded-sm bg-red-50 p-3 text-sm text-red-800">
          목록을 읽지 못했습니다. 0028_faculty_bios.sql 을 실행했는지 확인해 주세요.
        </p>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-line bg-cream text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">구분</th>
                <th className="px-4 py-3 font-medium">이름</th>
                <th className="px-4 py-3 font-medium">역할 · 반</th>
                <th className="px-4 py-3 font-medium">최근 수정</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-ink-soft">{facultyGroupOf(r.role)}</td>
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">
                    {r.role}
                    {r.class_name ? ` · ${r.class_name}` : ""}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{formatDate(r.updated_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/faculty/${r.id}`} className="text-navy underline">
                      수정
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

import { adminDeleteMember } from "@/app/actions/account";
import { setMemberRole } from "@/app/actions/admin";
import { ConfirmButton } from "@/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus, Profile } from "@/lib/types";

type Row = Profile & {
  applications: { child_name: string; status: ApplicationStatus }[];
};

export default async function AdminMembersPage() {
  const { user } = await requireAdmin();
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("profiles")
    .select("id, guardian_name, phone, email, role, created_at, applications!applications_guardian_id_fkey(child_name, status)")
    .order("created_at", { ascending: false })
    .returns<Row[]>();

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-navy">회원 관리</h1>
      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-line bg-cream text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">보호자</th>
              <th className="px-4 py-3 font-medium">연락처 / 이메일</th>
              <th className="px-4 py-3 font-medium">승인된 단원</th>
              <th className="px-4 py-3 font-medium">가입일</th>
              <th className="px-4 py-3 font-medium">권한</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {members?.map((m) => {
              const children = m.applications.filter((a) => a.status === "approved").map((a) => a.child_name);
              const isSelf = m.id === user.id;
              const nextRole = m.role === "admin" ? "member" : "admin";
              return (
                <tr key={m.id}>
                  <td className="px-4 py-3 font-medium">{m.guardian_name}</td>
                  <td className="px-4 py-3">
                    {m.phone}
                    <br />
                    <span className="text-ink-soft">{m.email}</span>
                  </td>
                  <td className="px-4 py-3">{children.length ? children.join(", ") : "-"}</td>
                  <td className="px-4 py-3">{formatDate(m.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={m.role === "admin" ? "font-bold text-navy" : ""}>
                        {m.role === "admin" ? "관리자" : "회원"}
                      </span>
                      {!isSelf && (
                        <form action={setMemberRole}>
                          <input type="hidden" name="id" value={m.id} />
                          <input type="hidden" name="role" value={nextRole} />
                          <ConfirmButton
                            message={`${m.guardian_name} 님을 ${nextRole === "admin" ? "관리자로 지정" : "일반 회원으로 변경"}할까요?`}
                            className="text-xs text-ink-soft underline hover:text-navy"
                          >
                            {nextRole === "admin" ? "관리자 지정" : "관리자 해제"}
                          </ConfirmButton>
                        </form>
                      )}
                      {!isSelf && (
                        <form action={adminDeleteMember}>
                          <input type="hidden" name="id" value={m.id} />
                          <ConfirmButton
                            message={`${m.guardian_name} 님의 계정을 삭제할까요? 회원 정보와 입단 신청 내역·사진이 영구 삭제됩니다. (단원 명부는 보호자 연결만 해제)`}
                            className="text-xs text-red-700 underline"
                          >
                            삭제
                          </ConfirmButton>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-ink-soft">
        관리자는 모든 회원·신청 정보를 볼 수 있습니다. 꼭 필요한 사람만 지정해 주세요. 회원 삭제는 Supabase 대시보드가 아닌
        이 화면에서 하면 첨부 사진까지 바로 삭제됩니다.
      </p>
    </>
  );
}

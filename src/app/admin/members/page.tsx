import { adminDeleteMember } from "@/app/actions/account";
import { rejectAdminRequest, revokeAdmin, setAdminAccess } from "@/app/actions/admin-roles";
import { ConfirmButton } from "@/components/ConfirmButton";
import { SubmitButton } from "@/components/form";
import { ADMIN_AREAS, areaLabels } from "@/lib/admin-perms";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus, Profile } from "@/lib/types";

type Row = Profile & {
  applications: { child_name: string; status: ApplicationStatus }[];
};

const BASE = "id, guardian_name, phone, email, role, created_at, applications!applications_guardian_id_fkey(child_name, status)";

// 메뉴 권한 체크박스 + 최상위 관리자 체크 (승인·권한 변경 공용)
function AccessForm({ member, submitLabel }: { member: Row; submitLabel: string }) {
  const perms = member.admin_perms ?? [];
  return (
    <form action={setAdminAccess} className="space-y-3">
      <input type="hidden" name="id" value={member.id} />
      <fieldset>
        <legend className="mb-1 text-xs font-medium text-ink-soft">수정할 수 있는 메뉴</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
          {ADMIN_AREAS.map((a) => (
            <label key={a.key} className="flex items-center gap-1.5">
              <input type="checkbox" name="perm" value={a.key} defaultChecked={perms.includes(a.key)} />
              {a.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-center gap-1.5 text-sm">
        <input type="checkbox" name="super" defaultChecked={member.is_super === true} />
        <span>
          <strong className="text-navy">최상위 관리자</strong>
          <span className="text-ink-soft"> — 모든 메뉴 + 회원 관리(관리자 승인·권한 부여)</span>
        </span>
      </label>
      <SubmitButton className="btn-primary px-3 py-1.5 text-sm" pendingText="저장 중...">
        {submitLabel}
      </SubmitButton>
    </form>
  );
}

export default async function AdminMembersPage() {
  const { user } = await requireAdmin("members");
  const supabase = await createClient();
  const full = await supabase
    .from("profiles")
    .select(`${BASE}, is_super, admin_perms, admin_requested_at, admin_request_note`)
    .order("created_at", { ascending: false })
    .returns<Row[]>();
  // 0020 실행 전: 권한 칸 없이 목록만
  const ready = !full.error;
  const members = ready
    ? full.data
    : (await supabase.from("profiles").select(BASE).order("created_at", { ascending: false }).returns<Row[]>()).data;
  const all = members ?? [];
  const requests = all.filter((m) => m.role !== "admin" && m.admin_requested_at);
  const admins = all.filter((m) => m.role === "admin");

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-navy">회원 관리</h1>
      {!ready && (
        <p className="mb-6 rounded-sm bg-amber-50 px-4 py-3 text-sm text-amber-900">
          관리자 신청·메뉴 권한 기능을 쓰려면 Supabase SQL Editor 에서 0020_admin_permissions.sql 을 실행해 주세요.
        </p>
      )}

      {ready && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-navy">관리자 신청 ({requests.length})</h2>
          {requests.length === 0 ? (
            <p className="text-sm text-ink-soft">대기 중인 신청이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {requests.map((m) => (
                <div key={m.id} className="card">
                  <p className="font-medium">
                    {m.guardian_name}{" "}
                    <span className="text-sm text-ink-soft">
                      {m.email} · {m.phone} · 신청일 {formatDate(m.admin_requested_at!)}
                    </span>
                  </p>
                  {m.admin_request_note && (
                    <p className="mt-1 whitespace-pre-line text-sm">사유: {m.admin_request_note}</p>
                  )}
                  <div className="mt-3">
                    <AccessForm member={m} submitLabel="승인" />
                  </div>
                  <form action={rejectAdminRequest} className="mt-2">
                    <input type="hidden" name="id" value={m.id} />
                    <ConfirmButton message={`${m.guardian_name} 님의 관리자 신청을 거절할까요?`} className="text-xs text-red-700 underline">
                      거절
                    </ConfirmButton>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {ready && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-navy">관리자 ({admins.length})</h2>
          <div className="space-y-4">
            {admins.map((m) => (
              <div key={m.id} className="card">
                <p className="font-medium">
                  {m.guardian_name}{" "}
                  <span className="text-sm text-ink-soft">{m.email}</span>{" "}
                  <span className="text-sm font-bold text-navy">
                    {m.is_super ? "최상위 관리자" : `메뉴: ${areaLabels(m.admin_perms).join(", ") || "없음"}`}
                  </span>
                </p>
                {m.id === user.id ? (
                  <p className="mt-1 text-xs text-ink-soft">본인의 권한은 다른 최상위 관리자만 바꿀 수 있습니다.</p>
                ) : (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-navy underline">권한 변경 · 해제</summary>
                    <div className="mt-3 space-y-2">
                      <AccessForm member={m} submitLabel="권한 저장" />
                      <form action={revokeAdmin}>
                        <input type="hidden" name="id" value={m.id} />
                        <ConfirmButton
                          message={`${m.guardian_name} 님을 일반 회원으로 바꿀까요? 관리자 메뉴를 더 이상 쓸 수 없습니다.`}
                          className="text-xs text-red-700 underline"
                        >
                          관리자 해제
                        </ConfirmButton>
                      </form>
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <h2 className="mb-3 text-lg font-semibold text-navy">전체 회원 ({all.length})</h2>
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
            {all.map((m) => {
              const children = m.applications.filter((a) => a.status === "approved").map((a) => a.child_name);
              const isSelf = m.id === user.id;
              return (
                <tr key={m.id} className="align-top">
                  <td className="px-4 py-3 font-medium">{m.guardian_name}</td>
                  <td className="px-4 py-3">
                    {m.phone}
                    <br />
                    <span className="text-ink-soft">{m.email}</span>
                  </td>
                  <td className="px-4 py-3">{children.length ? children.join(", ") : "-"}</td>
                  <td className="px-4 py-3">{formatDate(m.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={m.role === "admin" ? "font-bold text-navy" : ""}>
                        {m.role !== "admin" ? "회원" : !ready || m.is_super ? "최상위 관리자" : "관리자"}
                      </span>
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
                    {ready && !isSelf && m.role !== "admin" && !m.admin_requested_at && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-ink-soft underline">관리자로 지정</summary>
                        <div className="mt-2 min-w-[320px]">
                          <AccessForm member={m} submitLabel="관리자로 지정" />
                        </div>
                      </details>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-ink-soft">
        일반 관리자는 체크한 메뉴만 보고 고칠 수 있습니다. 입단 신청·단원 관리 권한이 있으면 보호자 이름·연락처도 볼 수 있으니 꼭
        필요한 사람에게만 주세요. 회원 삭제는 Supabase 대시보드가 아닌 이 화면에서 하면 첨부 사진까지 바로 삭제됩니다.
      </p>
    </>
  );
}

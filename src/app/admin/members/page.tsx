import { adminDeleteMember } from "@/app/actions/account";
import { rejectAdminRequest, revokeAdmin, setAdminAccess, setParentRep } from "@/app/actions/admin-roles";
import { ConfirmButton } from "@/components/ConfirmButton";
import { SubmitButton } from "@/components/form";
import { ADMIN_AREAS, areaLabels } from "@/lib/admin-perms";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import Link from "next/link";
import { CLASS_OPTIONS } from "@/lib/application-fields";
import { memberRoleLabel } from "@/lib/member-types";
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

function TypeBadge({ member }: { member: Row }) {
  if (!member.member_type) return null;
  const tone =
    member.member_type === "teacher"
      ? "bg-sky-50 text-sky-800"
      : member.member_type === "staff"
        ? "bg-amber-50 text-amber-900"
        : "bg-cream text-ink-soft";
  return (
    <>
      <span className={`rounded-sm px-1.5 py-0.5 text-xs font-medium ${tone}`}>{memberRoleLabel(member)}</span>
      {member.parent_rep_class && (
        <span className="ml-1 rounded-sm bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-800">
          {member.parent_rep_class} 대표
        </span>
      )}
    </>
  );
}

const FILTERS = [
  { key: "all", label: "전체" },
  { key: "parent", label: "학부모" },
  { key: "staff", label: "운영진" },
] as const;

const isStaff = (m: Row) => m.member_type === "teacher" || m.member_type === "staff";

export default async function AdminMembersPage({ searchParams }: PageProps<"/admin/members">) {
  const { type } = await searchParams;
  const filter = FILTERS.find((f) => f.key === type)?.key ?? "all";
  const { user } = await requireAdmin("members");
  const supabase = await createClient();
  // 마이그레이션 실행 전이어도 동작하도록 새 칸부터 차례로 시도 (0022 → 0021 → 0020 → 기본)
  const admin = "is_super, admin_perms, admin_requested_at, admin_request_note";
  let members: Row[] | null = null;
  let ready = false;
  const types = `${BASE}, ${admin}, member_type, affiliation`;
  for (const columns of [`${types}, staff_role, parent_rep_class`, types, `${BASE}, ${admin}`, BASE]) {
    const { data, error } = await supabase
      .from("profiles")
      .select(columns)
      .order("created_at", { ascending: false })
      .returns<Row[]>();
    if (!error) {
      members = data;
      ready = columns !== BASE;
      break;
    }
  }
  const all = members ?? [];
  const requests = all.filter((m) => m.role !== "admin" && m.admin_requested_at);
  const admins = all.filter((m) => m.role === "admin");
  const hasTypes = all.some((m) => m.member_type !== undefined);
  const hasReps = all.some((m) => m.parent_rep_class !== undefined);
  const shown = all.filter((m) =>
    filter === "all" ? true : filter === "staff" ? isStaff(m) : !isStaff(m),
  );

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
                    <TypeBadge member={m} /> {m.guardian_name}{" "}
                    <span className="text-sm text-ink-soft">
                      {m.email} · {m.phone} · 신청일 {formatDate(m.admin_requested_at!)}
                    </span>
                  </p>
                  {m.affiliation && <p className="mt-1 text-sm">세부 담당: {m.affiliation}</p>}
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
                  <TypeBadge member={m} /> {m.guardian_name}{" "}
                  <span className="text-sm text-ink-soft">
                    {m.email}
                    {m.affiliation ? ` · ${m.affiliation}` : ""}
                  </span>{" "}
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

      {hasReps && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-navy">반별 학부모 대표</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {CLASS_OPTIONS.map((c) => {
              const reps = all.filter((m) => m.parent_rep_class === c.name);
              return (
                <div key={c.name} className="card py-3">
                  <p className="text-sm font-bold text-navy">
                    {c.name} <span className="font-normal text-ink-soft">({c.day})</span>
                  </p>
                  <p className="mt-1 text-sm">
                    {reps.length ? reps.map((r) => `${r.guardian_name} (${r.phone})`).join(", ") : "지정 안 됨"}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            아래 회원 목록에서 &lsquo;학부모&rsquo;를 골라 보고, 대표로 정할 보호자의 &lsquo;학부모 대표&rsquo; 칸에서 반을 선택해 저장하세요.
          </p>
        </section>
      )}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-navy">회원 명단 ({shown.length})</h2>
        {hasTypes && (
          <nav className="flex gap-1 text-sm" aria-label="회원 구분">
            {FILTERS.map((f) => (
              <Link
                key={f.key}
                href={f.key === "all" ? "/admin/members" : `/admin/members?type=${f.key}`}
                className={`rounded-sm px-3 py-1 ${filter === f.key ? "bg-navy text-white" : "bg-cream text-ink-soft hover:text-navy"}`}
              >
                {f.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-line bg-cream text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">이름 (구분)</th>
              <th className="px-4 py-3 font-medium">연락처 / 이메일</th>
              <th className="px-4 py-3 font-medium">승인된 단원</th>
              <th className="px-4 py-3 font-medium">가입일</th>
              {hasReps && <th className="px-4 py-3 font-medium">학부모 대표</th>}
              <th className="px-4 py-3 font-medium">권한</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map((m) => {
              const children = m.applications.filter((a) => a.status === "approved").map((a) => a.child_name);
              const isSelf = m.id === user.id;
              return (
                <tr key={m.id} className="align-top">
                  <td className="px-4 py-3 font-medium">
                    {m.guardian_name}
                    <br />
                    <TypeBadge member={m} />
                    {m.affiliation && <span className="ml-1 text-xs font-normal text-ink-soft">{m.affiliation}</span>}
                  </td>
                  <td className="px-4 py-3">
                    {m.phone}
                    <br />
                    <span className="text-ink-soft">{m.email}</span>
                  </td>
                  <td className="px-4 py-3">{children.length ? children.join(", ") : "-"}</td>
                  <td className="px-4 py-3">{formatDate(m.created_at)}</td>
                  {hasReps && (
                    <td className="px-4 py-3">
                      {isStaff(m) ? (
                        <span className="text-ink-soft">-</span>
                      ) : (
                        <form action={setParentRep} className="flex items-center gap-1">
                          <input type="hidden" name="id" value={m.id} />
                          <select
                            name="class_name"
                            defaultValue={m.parent_rep_class ?? ""}
                            aria-label={`${m.guardian_name} 학부모 대표 반`}
                            className="rounded-sm border border-line bg-white px-2 py-1 text-xs"
                          >
                            <option value="">대표 아님</option>
                            {CLASS_OPTIONS.map((c) => (
                              <option key={c.name} value={c.name}>{c.name} 대표</option>
                            ))}
                          </select>
                          <SubmitButton className="text-xs text-navy underline" pendingText="...">저장</SubmitButton>
                        </form>
                      )}
                    </td>
                  )}
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

import Link from "next/link";
import { rejectAdminRequest, revokeAdmin, setMemberType, setOrgChartSource } from "@/app/actions/admin-roles";
import { OrgChart } from "@/components/OrgChart";
import { SubmitButton } from "@/components/form";
import { getOrgChart, getOrgChartSource } from "@/lib/content";
import { ConfirmButton } from "@/components/ConfirmButton";
import { areaLabels } from "@/lib/admin-perms";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import {
  AccessForm,
  DeleteMemberButton,
  MIGRATION_LEVELS,
  TypeBadge,
  adminLabel,
  isStaffMember,
  loadMembers,
} from "../_members/shared";
import { StaffEditForm } from "./StaffEditForm";

// 운영진 회원: 관리자 권한 신청 승인 · 관리자 권한 · 운영진 명단(조직도 위치)
export default async function StaffMembersPage() {
  const { user } = await requireAdmin("members");
  const { members, level } = await loadMembers();
  const ready = level >= MIGRATION_LEVELS.admin;
  const staff = members.filter(isStaffMember);
  // 학부모 대표·부대표: 보호자 회원이면서 운영진 (보호자 회원 화면에서 지정·해제)
  const reps = members
    .filter((m) => !isStaffMember(m) && m.parent_rep_class)
    .sort((a, b) => `${a.parent_rep_class}${a.parent_rep_title}`.localeCompare(`${b.parent_rep_class}${b.parent_rep_title}`));
  const requests = members.filter((m) => m.role !== "admin" && m.admin_requested_at);
  const admins = members.filter((m) => m.role === "admin");
  const canOrg = level >= MIGRATION_LEVELS.org;
  const [orgSource, orgEntries] = canOrg ? await Promise.all([getOrgChartSource(), getOrgChart()]) : ["legacy" as const, []];

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-navy">운영진 회원</h1>
      {!ready && (
        <p className="mb-6 rounded-sm bg-amber-50 px-4 py-3 text-sm text-amber-900">
          관리자 신청·메뉴 권한 기능을 쓰려면 Supabase SQL Editor 에서 마이그레이션 파일(0020~)을 실행해 주세요.
        </p>
      )}

      {ready && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-navy">관리자 권한 신청 ({requests.length})</h2>
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
                  {m.admin_request_note && <p className="mt-1 whitespace-pre-line text-sm">사유: {m.admin_request_note}</p>}
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

      {canOrg && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-navy">합창단 소개 조직도</h2>
          <div className="card space-y-3">
            <p className="text-sm">
              지금 홈페이지 표시:{" "}
              <strong className="text-navy">
                {orgSource === "auto" ? "회원 정보로 자동 표시" : "예전 조직도 (고정)"}
              </strong>
            </p>
            <form action={setOrgChartSource} className="flex flex-wrap items-center gap-3 text-sm">
              <label className="flex items-center gap-1.5">
                <input type="radio" name="source" value="legacy" defaultChecked={orgSource !== "auto"} />
                예전 조직도 (고정)
              </label>
              <label className="flex items-center gap-1.5">
                <input type="radio" name="source" value="auto" defaultChecked={orgSource === "auto"} />
                회원 정보로 자동 표시 (지정 안 된 칸은 공란)
              </label>
              <SubmitButton className="btn-primary px-3 py-1.5 text-sm" pendingText="저장 중...">표시 방식 저장</SubmitButton>
            </form>
            <details>
              <summary className="cursor-pointer text-sm text-navy underline">자동 표시 미리보기</summary>
              <div className="mt-4">
                <OrgChart entries={orgEntries} />
              </div>
            </details>
            <p className="text-xs text-ink-soft">
              운영진이 모두 가입하면 아래 명단에서 역할·반을 확인해 &lsquo;승인&rsquo;하고, 보호자 회원에서 학부모 대표를 지정한 뒤
              미리보기를 확인하고 &lsquo;회원 정보로 자동 표시&rsquo;로 바꿔 주세요.
            </p>
          </div>
        </section>
      )}

      <p className="mb-3 text-sm text-ink-soft">
        운영진 총 <strong className="text-ink">{staff.length + reps.length}명</strong> = 운영진 회원 {staff.length}명 + 학부모
        대표·부대표 {reps.length}명 (학부모 대표는 보호자 회원에도 함께 셉니다)
      </p>

      {reps.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-navy">학부모 대표·부대표 ({reps.length})</h2>
          <div className="card overflow-x-auto p-0">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-line bg-cream text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-medium">이름</th>
                  <th className="px-4 py-3 font-medium">반 · 직함</th>
                  <th className="px-4 py-3 font-medium">연락처 / 이메일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {reps.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 font-medium">{m.guardian_name}</td>
                    <td className="px-4 py-3">
                      {m.parent_rep_class} {m.parent_rep_title ?? "대표"}
                    </td>
                    <td className="px-4 py-3">
                      {m.phone}
                      <br />
                      <span className="text-ink-soft">{m.email}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            지정·해제는 <Link href="/admin/members" className="underline">보호자 회원</Link> 화면의 &lsquo;학부모 대표&rsquo; 칸에서 합니다.
          </p>
        </section>
      )}

      <h2 className="mb-3 text-lg font-semibold text-navy">운영진 회원 명단 ({staff.length})</h2>
      {staff.length === 0 ? (
        <p className="text-sm text-ink-soft">
          운영진 회원이 없습니다. 운영진은 입단 안내의 &lsquo;운영진 회원가입&rsquo;으로 가입하거나, 보호자 회원 화면에서
          &lsquo;운영진으로 변경&rsquo;할 수 있습니다.
        </p>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-line bg-cream text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">이름 / 역할</th>
                <th className="px-4 py-3 font-medium">연락처 / 이메일</th>
                <th className="px-4 py-3 font-medium">가입일</th>
                {canOrg && <th className="px-4 py-3 font-medium">승인 · 정보 수정</th>}
                <th className="px-4 py-3 font-medium">관리자 권한 · 관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {staff.map((m) => {
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
                    <td className="px-4 py-3">{formatDate(m.created_at)}</td>
                    {canOrg && (
                      <td className="px-4 py-3">
                        <span className={m.org_visible ? "font-medium text-green-800" : "text-ink-soft"}>
                          {m.org_visible ? "승인됨 (조직도 게시)" : "승인 대기"}
                        </span>
                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs text-navy underline">역할 · 반 · 승인 수정</summary>
                          <div className="mt-2 min-w-[340px]">
                            <StaffEditForm member={m} />
                          </div>
                        </details>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={m.role === "admin" ? "font-bold text-navy" : "text-ink-soft"}>
                          {m.role === "admin" ? adminLabel(m, level) : m.admin_requested_at ? "권한 신청 중" : "권한 없음"}
                        </span>
                        {!(m.role === "admin" && m.is_super) && (
                          <form action={setMemberType}>
                            <input type="hidden" name="id" value={m.id} />
                            <input type="hidden" name="type" value="parent" />
                            <ConfirmButton
                              message={`${m.guardian_name} 님을 보호자 회원으로 옮길까요? 운영진 역할과 조직도 표시가 해제됩니다. (관리자 권한은 그대로)`}
                              className="text-xs text-navy underline"
                            >
                              보호자로 변경
                            </ConfirmButton>
                          </form>
                        )}
                        {!isSelf && <DeleteMemberButton member={m} />}
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
      )}
      <p className="mt-4 text-xs text-ink-soft">
        운영진의 역할·반·세부 담당은 최상위 관리자만 고칠 수 있습니다(본인은 마이페이지에서 보기만). &lsquo;역할·반 승인&rsquo;을
        한 운영진만 합창단 소개 조직도에 이름·역할이 나옵니다(연락처 제외). 부지휘자·반주자·보컬트레이너·이론선생님은 담당
        반 칸에, 나머지는 전체 칸에 표시됩니다. 최상위 관리자는 운영진 회원만 지정할 수 있습니다. 일반 관리자는 체크한 메뉴만
        보고 고칠 수 있습니다.
      </p>
    </>
  );
}

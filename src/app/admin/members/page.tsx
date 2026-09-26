import { setMemberName, setMemberType, setParentRep } from "@/app/actions/admin-roles";
import { ConfirmButton } from "@/components/ConfirmButton";
import { SubmitButton } from "@/components/form";
import { CLASS_OPTIONS } from "@/lib/application-fields";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import {
  DeleteMemberButton,
  MIGRATION_LEVELS,
  TypeBadge,
  adminLabel,
  isStaffMember,
  loadMembers,
} from "../_members/shared";

// 보호자(학부모) 회원: 명단 · 반별 학부모 대표/부대표 지정 · 운영진으로 구분 변경
export default async function ParentMembersPage() {
  const { user } = await requireAdmin("members");
  const { members, level } = await loadMembers();
  const parents = members.filter((m) => !isStaffMember(m));
  const canRep = level >= MIGRATION_LEVELS.reps;
  const canVice = level >= MIGRATION_LEVELS.org;
  const repTitles = canVice ? (["대표", "부대표"] as const) : (["대표"] as const);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-navy">보호자 회원</h1>

      {canRep && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-navy">반별 학부모 대표</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {CLASS_OPTIONS.map((c) => (
              <div key={c.name} className="card py-3">
                <p className="text-sm font-bold text-navy">
                  {c.name} <span className="font-normal text-ink-soft">({c.day})</span>
                </p>
                <dl className="mt-1 space-y-0.5 text-sm">
                  {repTitles.map((t) => {
                    const reps = parents.filter((m) => m.parent_rep_class === c.name && (m.parent_rep_title ?? "대표") === t);
                    return (
                      <div key={t} className="flex gap-2">
                        <dt className="w-12 shrink-0 text-ink-soft">{t}</dt>
                        <dd>{reps.length ? reps.map((r) => `${r.guardian_name} (${r.phone})`).join(", ") : "-"}</dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            아래 명단의 &lsquo;학부모 대표&rsquo; 칸에서 반과 대표/부대표를 골라 저장하면, 합창단 소개 조직도에 이름이 바로 반영됩니다.
          </p>
        </section>
      )}

      <h2 className="mb-3 text-lg font-semibold text-navy">보호자 회원 명단 ({parents.length})</h2>
      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-line bg-cream text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">보호자</th>
              <th className="px-4 py-3 font-medium">연락처 / 이메일</th>
              <th className="px-4 py-3 font-medium">승인된 단원</th>
              <th className="px-4 py-3 font-medium">가입일</th>
              {canRep && <th className="px-4 py-3 font-medium">학부모 대표</th>}
              <th className="px-4 py-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {parents.map((m) => {
              const children = m.applications.filter((a) => a.status === "approved").map((a) => a.child_name);
              const isSelf = m.id === user.id;
              const current = m.parent_rep_class ? `${m.parent_rep_class}|${m.parent_rep_title ?? "대표"}` : "";
              return (
                <tr key={m.id} className="align-top">
                  <td className="px-4 py-3 font-medium">
                    {m.guardian_name}
                    {m.parent_rep_class && (
                      <>
                        <br />
                        <TypeBadge member={m} />
                        {/* 조직도에 게시된 학부모 대표의 이름은 최상위 관리자만 수정 */}
                        <details className="mt-1 font-normal">
                          <summary className="cursor-pointer text-xs text-ink-soft underline">이름 수정</summary>
                          <form action={setMemberName} className="mt-1 flex items-center gap-1">
                            <input type="hidden" name="id" value={m.id} />
                            <input
                              name="guardian_name"
                              required
                              maxLength={50}
                              defaultValue={m.guardian_name}
                              aria-label={`${m.guardian_name} 이름`}
                              className="w-28 rounded-sm border border-line bg-white px-2 py-1 text-xs"
                            />
                            <SubmitButton className="text-xs text-navy underline" pendingText="...">저장</SubmitButton>
                          </form>
                        </details>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {m.phone}
                    <br />
                    <span className="text-ink-soft">{m.email}</span>
                  </td>
                  <td className="px-4 py-3">{children.length ? children.join(", ") : "-"}</td>
                  <td className="px-4 py-3">{formatDate(m.created_at)}</td>
                  {canRep && (
                    <td className="px-4 py-3">
                      <form action={setParentRep} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={m.id} />
                        <select
                          name="rep"
                          defaultValue={current}
                          aria-label={`${m.guardian_name} 학부모 대표`}
                          className="rounded-sm border border-line bg-white px-2 py-1 text-xs"
                        >
                          <option value="">대표 아님</option>
                          {CLASS_OPTIONS.flatMap((c) =>
                            repTitles.map((t) => (
                              <option key={`${c.name}|${t}`} value={`${c.name}|${t}`}>
                                {c.name} {t}
                              </option>
                            )),
                          )}
                        </select>
                        <SubmitButton className="text-xs text-navy underline" pendingText="...">저장</SubmitButton>
                      </form>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {m.role === "admin" && <span className="font-bold text-navy">{adminLabel(m, level)}</span>}
                      {level >= MIGRATION_LEVELS.org && (
                        <form action={setMemberType}>
                          <input type="hidden" name="id" value={m.id} />
                          <input type="hidden" name="type" value="staff" />
                          <ConfirmButton
                            message={`${m.guardian_name} 님을 운영진 회원으로 옮길까요? 학부모 대표 지정은 해제됩니다.`}
                            className="text-xs text-navy underline"
                          >
                            운영진으로 변경
                          </ConfirmButton>
                        </form>
                      )}
                      {!isSelf && <DeleteMemberButton member={m} />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-ink-soft">
        관리자 권한 신청·승인과 운영진 명단은 &lsquo;운영진 회원&rsquo; 메뉴에 있습니다. 회원 삭제는 Supabase 대시보드가 아닌 이
        화면에서 하면 첨부 사진까지 바로 삭제됩니다.
      </p>
    </>
  );
}

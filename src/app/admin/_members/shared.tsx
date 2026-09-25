import { adminDeleteMember } from "@/app/actions/account";
import { setAdminAccess } from "@/app/actions/admin-roles";
import { ConfirmButton } from "@/components/ConfirmButton";
import { SubmitButton } from "@/components/form";
import { ADMIN_AREAS } from "@/lib/admin-perms";
import { memberRoleLabel } from "@/lib/member-types";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus, Profile } from "@/lib/types";

// 보호자 회원 · 운영진 회원 화면 공용

export type MemberRow = Profile & {
  applications: { child_name: string; status: ApplicationStatus }[];
};

const BASE = "id, guardian_name, phone, email, role, created_at, applications!applications_guardian_id_fkey(child_name, status)";
const ADMIN = "is_super, admin_perms, admin_requested_at, admin_request_note";

export const isStaffMember = (m: Profile) => m.member_type === "teacher" || m.member_type === "staff";

// 마이그레이션 실행 전이어도 동작하도록 새 칸부터 차례로 시도 (0023 → 0022 → 0021 → 0020 → 기본)
export async function loadMembers() {
  const supabase = await createClient();
  const types = `${BASE}, ${ADMIN}, member_type, affiliation`;
  const tiers = [
    `${types}, staff_role, parent_rep_class, parent_rep_title, staff_class, org_visible`,
    `${types}, staff_role, parent_rep_class`,
    types,
    `${BASE}, ${ADMIN}`,
    BASE,
  ];
  for (const [i, columns] of tiers.entries()) {
    const { data, error } = await supabase
      .from("profiles")
      .select(columns)
      .order("created_at", { ascending: false })
      .returns<MemberRow[]>();
    if (!error) return { members: data ?? [], level: tiers.length - 1 - i };
  }
  return { members: [] as MemberRow[], level: 0 };
}

export const MIGRATION_LEVELS = { admin: 1, types: 2, reps: 3, org: 4 } as const;

export function TypeBadge({ member }: { member: Profile }) {
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
      {member.role === "admin" && member.is_super && (
        <span className="ml-1 rounded-sm bg-navy px-1.5 py-0.5 text-xs font-medium text-white">최상위 관리자</span>
      )}
      {member.parent_rep_class && (
        <span className="ml-1 rounded-sm bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-800">
          {member.parent_rep_class} {member.parent_rep_title ?? "대표"}
        </span>
      )}
    </>
  );
}

// 메뉴 권한 체크박스 + 최상위 관리자 체크 (승인·권한 변경 공용)
export function AccessForm({ member, submitLabel }: { member: Profile; submitLabel: string }) {
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
      {isStaffMember(member) ? (
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" name="super" defaultChecked={member.is_super === true} />
          <span>
            <strong className="text-navy">최상위 관리자</strong>
            <span className="text-ink-soft"> — 모든 메뉴 + 회원 관리(관리자 승인·권한 부여)</span>
          </span>
        </label>
      ) : (
        <p className="text-xs text-ink-soft">최상위 관리자는 운영진 회원만 지정할 수 있습니다.</p>
      )}
      <SubmitButton className="btn-primary px-3 py-1.5 text-sm" pendingText="저장 중...">
        {submitLabel}
      </SubmitButton>
    </form>
  );
}

export function DeleteMemberButton({ member }: { member: Profile }) {
  return (
    <form action={adminDeleteMember}>
      <input type="hidden" name="id" value={member.id} />
      <ConfirmButton
        message={`${member.guardian_name} 님의 계정을 삭제할까요? 회원 정보와 입단 신청 내역·사진이 영구 삭제됩니다. (단원 명부는 보호자 연결만 해제)`}
        className="text-xs text-red-700 underline"
      >
        삭제
      </ConfirmButton>
    </form>
  );
}

export function adminLabel(m: Profile, level: number) {
  if (m.role !== "admin") return "회원";
  return level < MIGRATION_LEVELS.admin || m.is_super ? "최상위 관리자" : "관리자";
}

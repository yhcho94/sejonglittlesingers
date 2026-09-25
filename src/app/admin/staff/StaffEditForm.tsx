"use client";

import { useActionState } from "react";
import { adminUpdateStaff } from "@/app/actions/admin-roles";
import { FormMessage, SubmitButton } from "@/components/form";
import { StaffRoleFields } from "@/components/StaffRoleFields";
import type { Profile } from "@/lib/types";

// 최상위 관리자: 운영진의 역할 · 담당 반 · 세부 담당 · 승인(조직도 게시) 수정 (본인은 수정 불가)
export function StaffEditForm({ member }: { member: Profile }) {
  const [state, action] = useActionState(adminUpdateStaff, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={member.id} />
      <StaffRoleFields
        idPrefix={`${member.id}-`}
        role={member.staff_role}
        staffClass={member.staff_class}
        affiliation={member.affiliation}
      />
      <label className="flex items-center gap-1.5 text-sm">
        <input type="checkbox" name="org_visible" defaultChecked={member.org_visible === true} />
        <span>
          <strong className="text-navy">역할·반 승인</strong>
          <span className="text-ink-soft"> — 승인하면 합창단 소개 조직도에 이름·역할이 게시됩니다 (반 역할은 그 반 칸, 나머지는 전체 칸)</span>
        </span>
      </label>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary px-3 py-1.5 text-sm" pendingText="저장 중...">
        운영진 정보 저장
      </SubmitButton>
    </form>
  );
}

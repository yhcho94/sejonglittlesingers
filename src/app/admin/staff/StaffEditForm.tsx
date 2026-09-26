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
    // autoComplete off: 새로고침·뒤로 가기 때 브라우저가 예전 선택값을 되살리지 않도록
    <form action={action} autoComplete="off" className="space-y-3">
      <p className="rounded-sm bg-cream px-3 py-2 text-sm">
        저장된 정보: <strong>{member.staff_role ?? "역할 미지정"}</strong>
        {member.staff_class && <> · {member.staff_class}</>}
        {member.affiliation && <> · {member.affiliation}</>}
        {" · "}
        <span className={member.org_visible ? "text-green-800" : "text-amber-800"}>
          {member.org_visible ? "승인됨" : "승인 대기"}
        </span>
      </p>
      <input type="hidden" name="id" value={member.id} />
      <input type="hidden" name="current_name" value={member.guardian_name} />
      <div>
        <label htmlFor={`${member.id}-guardian_name`} className="label">이름 *</label>
        <input
          id={`${member.id}-guardian_name`}
          name="guardian_name"
          required
          maxLength={50}
          defaultValue={member.guardian_name}
          className="input"
        />
      </div>
      {/* 저장된 값이 바뀌면 새 값으로 다시 그림 */}
      <StaffRoleFields
        key={`${member.staff_role}|${member.staff_class}|${member.affiliation}`}
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

"use client";

import { useState } from "react";
import { CLASS_OPTIONS } from "@/lib/application-fields";
import { STAFF_ROLE_MAX, STAFF_ROLE_OTHER, STAFF_ROLES, isClassRole } from "@/lib/member-types";

// 운영진 역할 선택 + '기타' 직접 입력 + 담당 반(반 역할만) + 세부 담당 (가입·마이페이지·관리자 공용)
export function StaffRoleFields({
  role,
  staffClass,
  affiliation,
  idPrefix = "",
}: {
  role?: string | null;
  staffClass?: string | null;
  affiliation?: string | null;
  idPrefix?: string;
}) {
  const listed = !role || STAFF_ROLES.some((r) => r.name === role);
  const [selected, setSelected] = useState(listed ? (role ?? "") : STAFF_ROLE_OTHER);
  const id = (name: string) => `${idPrefix}${name}`;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={id("staff_role")} className="label">운영진 역할 *</label>
          <select
            id={id("staff_role")}
            name="staff_role"
            required
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="input"
          >
            <option value="">역할을 골라 주세요</option>
            {STAFF_ROLES.map((r) => (
              <option key={r.name}>{r.name}</option>
            ))}
            <option value={STAFF_ROLE_OTHER}>기타 (직접 입력)</option>
          </select>
        </div>
        {selected === STAFF_ROLE_OTHER && (
          <div>
            <label htmlFor={id("staff_role_custom")} className="label">역할 직접 입력 *</label>
            <input
              id={id("staff_role_custom")}
              name="staff_role_custom"
              required
              maxLength={STAFF_ROLE_MAX}
              defaultValue={listed ? "" : (role ?? "")}
              placeholder="예: 의상 담당"
              className="input"
            />
          </div>
        )}
        {isClassRole(selected) && (
          <div>
            <label htmlFor={id("staff_class")} className="label">담당 반 *</label>
            <select id={id("staff_class")} name="staff_class" required defaultValue={staffClass ?? ""} className="input">
              <option value="">반을 골라 주세요</option>
              {CLASS_OPTIONS.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.day})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div>
        <label htmlFor={id("affiliation")} className="label">세부 담당 (선택)</label>
        <input
          id={id("affiliation")}
          name="affiliation"
          maxLength={100}
          defaultValue={affiliation ?? ""}
          placeholder="예: 알토 파트, 홍보·SNS"
          className="input"
        />
      </div>
    </>
  );
}

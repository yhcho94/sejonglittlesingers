"use client";

import { useState } from "react";
import { STAFF_ROLE_MAX, STAFF_ROLE_OTHER, STAFF_ROLES } from "@/lib/member-types";

// 운영진 역할 선택 + '기타' 직접 입력 + 세부 담당 (가입·마이페이지 공용)
export function StaffRoleFields({ role, affiliation }: { role?: string | null; affiliation?: string | null }) {
  const listed = !role || STAFF_ROLES.some((r) => r.name === role);
  const [selected, setSelected] = useState(listed ? (role ?? "") : STAFF_ROLE_OTHER);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="staff_role" className="label">운영진 역할 *</label>
          <select
            id="staff_role"
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
            <label htmlFor="staff_role_custom" className="label">역할 직접 입력 *</label>
            <input
              id="staff_role_custom"
              name="staff_role_custom"
              required
              maxLength={STAFF_ROLE_MAX}
              defaultValue={listed ? "" : (role ?? "")}
              placeholder="예: 의상 담당"
              className="input"
            />
          </div>
        )}
      </div>
      <div>
        <label htmlFor="affiliation" className="label">세부 담당 (선택)</label>
        <input
          id="affiliation"
          name="affiliation"
          maxLength={100}
          defaultValue={affiliation ?? ""}
          placeholder="예: 화음반 담당, 알토 파트, 홍보·SNS"
          className="input"
        />
      </div>
    </>
  );
}

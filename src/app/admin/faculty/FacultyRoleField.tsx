"use client";

import { useState } from "react";
import { FACULTY_ROLE_OPTIONS, FACULTY_ROLE_OTHER } from "@/lib/staff-bio";

// 강사진 역할: 목록에서 고르고, '기타'를 고르면 직접 입력
export function FacultyRoleField({ role }: { role?: string }) {
  const listed = !role || (FACULTY_ROLE_OPTIONS as readonly string[]).includes(role);
  const [selected, setSelected] = useState(listed ? (role ?? "") : FACULTY_ROLE_OTHER);
  return (
    <>
      <div>
        <label htmlFor="role" className="label">
          역할 <span className="font-normal text-ink-soft">(강사진 소개에 표시되는 직함)</span>
        </label>
        <select
          id="role"
          name="role"
          required
          autoComplete="off"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="input"
        >
          <option value="">역할을 골라 주세요</option>
          {FACULTY_ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
          <option value={FACULTY_ROLE_OTHER}>기타 (직접 입력)</option>
        </select>
      </div>
      {selected === FACULTY_ROLE_OTHER && (
        <div>
          <label htmlFor="role_custom" className="label">역할 직접 입력</label>
          <input
            id="role_custom"
            name="role_custom"
            required
            maxLength={30}
            defaultValue={listed ? "" : role}
            placeholder="예: 합창 코치"
            className="input"
          />
        </div>
      )}
    </>
  );
}

import type { MemberType } from "@/lib/types";

// 회원 구분 (DB 0021 과 같아야 합니다). 선생님은 지도 역할의 운영진입니다.
export const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  parent: "학부모",
  teacher: "선생님",
  staff: "운영진",
};

// 합창단 운영진 역할 (DB 0022 staff_kind() 의 선생님 목록과 같아야 합니다)
export const STAFF_ROLES = [
  { name: "단장", teacher: false },
  { name: "지휘자", teacher: true },
  { name: "부지휘자", teacher: true },
  { name: "반주자", teacher: true },
  { name: "보컬트레이너", teacher: true },
  { name: "이론선생님", teacher: true },
  { name: "사무국장", teacher: false },
  { name: "운영위원", teacher: false },
  { name: "홈페이지 관리자", teacher: false },
] as const;

export const STAFF_ROLE_OTHER = "기타";
export const STAFF_ROLE_MAX = 30;

export function memberTypeLabel(type: string | null | undefined) {
  return MEMBER_TYPE_LABELS[type as MemberType] ?? "학부모";
}

// 회원 목록에 보일 이름: 운영진은 역할, 학부모는 '학부모'
export function memberRoleLabel(p: { member_type?: string | null; staff_role?: string | null }) {
  if (p.member_type && p.member_type !== "parent" && p.staff_role) return p.staff_role;
  return memberTypeLabel(p.member_type);
}

// 폼 값 → 저장할 역할 (목록에서 고르거나 '기타' 직접 입력)
export function staffRoleFromForm(selected: string, custom: string) {
  const value = selected === STAFF_ROLE_OTHER ? custom.trim() : selected;
  if (!value || value.length > STAFF_ROLE_MAX) return null;
  if (selected !== STAFF_ROLE_OTHER && !STAFF_ROLES.some((r) => r.name === value)) return null;
  return value;
}
